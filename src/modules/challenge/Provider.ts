import * as _ from "lodash";
import {DestroyOptions, FindOptions, Op} from "sequelize";
import {Injectable, Inject} from "@graphql-modules/di";
import CommonHelper from "../common/Helper";
import {throwInvalidMeError, throwNotImplementedError} from "../common/Helper";
import {FileType, IEdge, IRelayConnection, IServerContext, FileOwnerType, ConnectionOrderDirection, IUserRef} from "../common/Models";
import User from "../../db/models/User";
import Challenge, {ChallengePrivacyMode} from "../../db/models/Challenge";
import {ChallengeOrderField, ChallengesQuery} from "./Helper";

@Injectable()
export default class ChallengeProvider {
  async challenges({createdById, createdByMe, withReactionByUserId, excludeClosed, excludeEnded, orderBy, first, after}: ChallengesQuery, {models, currentUser}: IServerContext): Promise<IRelayConnection<Challenge>> {
    const findOptions: FindOptions = {
      where: {},
      order: [[ChallengeOrderField.CREATED_DATE, ConnectionOrderDirection.DESC]],
      include: [],
    };

    if (_.isNil(currentUser)) {
      findOptions.where = {
        ...findOptions.where,
        privacyMode: ChallengePrivacyMode.Public,
      };
    } else {
      const domain = User.getDomain(currentUser);

      if (!_.isNil(domain)) {
        findOptions.where = {
          ...findOptions.where,
          ...{[Op.or]: [{privacyMode: ChallengePrivacyMode.Public}, {privacyData: {[Op.like]: `%"${domain}"%`}}]},
        };
      } else {
        findOptions.where = {
          ...findOptions.where,
          privacyMode: ChallengePrivacyMode.Public,
        };
      }
    }

    if (!_.isNil(createdById))
      findOptions.where = {
        ...findOptions.where,
        createdById: createdById,
      };
    else if (!_.isNil(createdByMe) && createdByMe) {
      if (_.isNil(currentUser)) throwInvalidMeError();

      findOptions.where = {
        ...findOptions.where,
        createdById: currentUser.id,
      };
    }

    if (!_.isNil(withReactionByUserId)) {
      findOptions.include = [
        ...findOptions.include,
        {
          model: models.ChallengeReaction,
          attributes: [],
          where: {
            createdById: withReactionByUserId,
          },
        },
      ];
    }

    if (!_.isNil(excludeClosed) && excludeClosed)
      findOptions.where = {
        ...findOptions.where,
        ...({closeDate: {[Op.or]: [null, {[Op.gte]: new Date()}]}} as any),
      };

    if (!_.isNil(excludeEnded) && excludeEnded)
      findOptions.where = {
        ...findOptions.where,
        ...({endDate: {[Op.or]: [null, {[Op.gte]: new Date()}]}} as any),
      };

    if (!_.isNil(orderBy)) findOptions.order = [[orderBy.field, orderBy.direction]];

    if (!_.isNil(first) && first > 0) findOptions.limit = first + 1;

    if (!_.isNil(after)) throwNotImplementedError("after");

    const resultSet = await models.Challenge.findAndCountAll(findOptions);

    let hasNextPage = false;
    let lastCursor: string = undefined;
    const totalCount = resultSet.count;

    const edges: IEdge<Challenge>[] = [];

    const objects: Challenge[] = resultSet.rows;
    objects.forEach(object => {
      if (!_.isNil(findOptions.limit) && edges.length === first) {
        hasNextPage = true;
        return;
      }

      const cursor = CommonHelper.getCursorHash(object.id);
      lastCursor = cursor;

      edges.push({
        node: object,
        cursor: cursor,
      });
    });

    return {
      edges: edges,
      pageInfo: {
        hasNextPage: hasNextPage,
        endCursor: hasNextPage ? lastCursor : undefined,
      },
      totalCount: totalCount,
    };
  }

  async challenge(id: string, {models}: IServerContext): Promise<Challenge> {
    return models.Challenge.findByPk(id);
  }

  private async getPrivacyInfo(privacyMode: ChallengePrivacyMode, createdById: string, models: any, currentUser: IUserRef): Promise<{mode: number; data: string}> {
    let privacyData: string = null;

    if (_.isNil(privacyMode)) privacyMode = ChallengePrivacyMode.Public;

    switch (privacyMode) {
      case ChallengePrivacyMode.Public:
        break;
      case ChallengePrivacyMode.ByDomain: {
        let user: User | IUserRef = undefined;

        if (createdById === currentUser.id) user = currentUser;
        else user = await models.User.findByPk(createdById);

        if (!_.isNil(user)) {
          const domain = User.getDomain(user);

          if (!_.isNil(domain)) privacyData = `["${domain}"]`;
        }

        break;
      }
      default:
        break;
    }

    return {mode: privacyMode, data: privacyData};
  }

  async createChallenge(title: string, description: string, closeDate: Date, endDate: Date, privacyMode: ChallengePrivacyMode, upload: any, {storage, models, currentUser}: IServerContext): Promise<Challenge> {
    const privacyInfo = await this.getPrivacyInfo(privacyMode, currentUser.id, models, currentUser);

    const objectId: string = CommonHelper.getUUID(false);
    let imageUrl: string = undefined;

    if (!_.isNil(upload)) {
      const uploadResponse = await CommonHelper.uploadFile(storage, FileOwnerType.Challenge, objectId, upload, {
        _ownerId: objectId,
        _ownerType: FileOwnerType.Challenge,
        _fileType: FileType.Image,
      });

      imageUrl = uploadResponse.publicUrl;
    }

    return await models.Challenge.create({
      id: objectId,
      title: title,
      description: description,
      imageUrl: imageUrl,
      closeDate: closeDate,
      endDate: endDate,
      privacyMode: privacyInfo.mode,
      privacyData: privacyInfo.data,
      createdById: currentUser.id,
      modifiedById: currentUser.id,
    });
  }

  async updateChallenge(id: string, title: string, description: string, closeDate: Date, endDate: Date, privacyMode: ChallengePrivacyMode, upload: any, {storage, models, currentUser}: IServerContext): Promise<Challenge> {
    const object = await models.Challenge.findByPk(id);

    if (_.isNil(object)) return;

    const values: any = {};

    if (!_.isNil(title) && !_.isEmpty(title)) values.title = title;
    if (!_.isNil(description) && !_.isEmpty(description)) values.description = description;

    if (!_.isNil(upload)) {
      const uploadResponse = await CommonHelper.uploadFile(storage, FileOwnerType.Challenge, object.id, upload, {
        _ownerId: object.id,
        _ownerType: FileOwnerType.Challenge,
        _fileType: FileType.Image,
      });

      if (!_.isNil(uploadResponse.publicUrl)) values.imageUrl = uploadResponse.publicUrl;
    }

    if (!_.isUndefined(closeDate)) values.closeDate = closeDate;
    if (!_.isUndefined(endDate)) values.endDate = endDate;

    if (!_.isNil(privacyMode)) {
      const privacyInfo = await this.getPrivacyInfo(privacyMode, object.createdById, models, currentUser);

      values.privacyMode = privacyInfo.mode;
      values.privacyData = privacyInfo.data;
    }

    if (!_.isEmpty(values)) {
      await object.update({
        ...values,
        modifiedById: currentUser.id,
      });
    }

    return object;
  }

  async deleteChallenge(id: string, {storage, models}: IServerContext): Promise<Challenge> {
    const destroyOptions: DestroyOptions = {where: {id: id}, force: true};

    const result = await models.Challenge.destroy(destroyOptions);

    if (result) await CommonHelper.deleteFile(storage, FileOwnerType.Challenge, id);

    return result;
  }
}
