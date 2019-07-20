import * as _ from "lodash";
import * as sequelize from "sequelize";
import {DestroyOptions, FindOptions, IncludeOptions, Op} from "sequelize";
import {Model} from "sequelize-typescript";
import {Injectable, Inject} from "@graphql-modules/di";
import CommonHelper, {throwInvalidMeError, throwNotImplementedError} from "../common/Helper";
import {FileType, IEdge, IRelayConnection, IServerContext, FileOwnerType, ConnectionOrderDirection} from "../common/Models";
import User from "../../db/models/User";
import {ChallengePrivacyMode} from "../../db/models/Challenge";
import Idea from "../../db/models/Idea";
import {IdeaOrderField, IdeasQuery} from "./Helper";

@Injectable()
export default class IdeaProvider {
  async ideas({challengeId, createdById, createdByMe, withReactionByUserId, orderBy, first, after}: IdeasQuery, {models, currentUser}: IServerContext): Promise<IRelayConnection<Idea>> {
    const findOptions: FindOptions = {
      where: !_.isNil(challengeId) ? {challengeId: challengeId} : {},
      order: [[IdeaOrderField.CREATED_DATE, ConnectionOrderDirection.DESC]],
      include: [],
    };

    const domain = currentUser ? User.getDomain(currentUser) : undefined;

    const challengeInclude: typeof Model | IncludeOptions = !_.isNil(domain)
      ? {
          model: models.Challenge,
          attributes: [],
          where: {
            ...{[Op.or]: [{privacyMode: ChallengePrivacyMode.Public}, {privacyData: {[Op.like]: `%"${domain}"%`}}]},
          },
        }
      : {
          model: models.Challenge,
          attributes: [],
          where: {
            privacyMode: ChallengePrivacyMode.Public,
          },
        };

    if (!_.isNil(domain)) {
      findOptions.include = [...findOptions.include, challengeInclude];
    } else {
      findOptions.include = [...findOptions.include, challengeInclude];
    }

    if (!_.isNil(createdById)) {
      findOptions.where = {
        ...findOptions.where,
        createdById: createdById,
      };
    }

    if (!_.isNil(createdByMe) && createdByMe) {
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
          model: models.IdeaReaction,
          attributes: [],
          where: {
            createdById: withReactionByUserId,
          },
        },
      ];
    }

    if (!_.isNil(orderBy)) findOptions.order = [[orderBy.field, orderBy.direction]];

    if (!_.isNil(first) && first > 0) findOptions.limit = first + 1;

    if (!_.isNil(after)) throwNotImplementedError("after");

    const resultSet = await models.Idea.findAndCountAll(findOptions);

    let hasNextPage = false;
    let lastCursor: string = undefined;
    const totalCount = resultSet.count;

    const edges: IEdge<Idea>[] = [];

    const objects: Idea[] = resultSet.rows;
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

  async idea(id: string, {models}: IServerContext) {
    return models.Idea.findByPk(id);
  }

  async createIdea(challengeId: string, title: string, description: string, upload: any, {storage, models, currentUser}: IServerContext): Promise<Idea> {
    const objectId: string = CommonHelper.getUUID(false);
    let imageUrl: string = undefined;

    if (!_.isNil(upload)) {
      const uploadResponse = await CommonHelper.uploadFile(storage, FileOwnerType.Idea, objectId, upload, {
        _ownerId: objectId,
        _ownerType: FileOwnerType.Idea,
        _fileType: FileType.Image,
      });

      imageUrl = uploadResponse.publicUrl;
    }

    return await models.Idea.create({
      id: objectId,
      challengeId: challengeId,
      title: title,
      description: description,
      imageUrl: imageUrl,
      createdById: currentUser.id,
      modifiedById: currentUser.id,
    });
  }

  async updateIdea(id: string, title: string, description: string, upload: any, {storage, models, currentUser}: IServerContext): Promise<Idea> {
    const object = await models.Idea.findByPk(id);

    if (_.isNil(object)) return;

    const values: any = {};

    if (!_.isNil(title) && !_.isEmpty(title)) values.title = title;
    if (!_.isNil(description) && !_.isEmpty(description)) values.description = description;

    if (!_.isNil(upload)) {
      const uploadResponse = await CommonHelper.uploadFile(storage, FileOwnerType.Idea, object.id, upload, {
        _ownerId: object.id,
        _ownerType: FileOwnerType.Idea,
        _fileType: FileType.Image,
      });

      if (!_.isNil(uploadResponse.publicUrl)) values.imageUrl = uploadResponse.publicUrl;
    }

    if (!_.isEmpty(values)) {
      await object.update({
        ...values,
        modifiedById: currentUser.id,
      });
    }

    return object;
  }

  async deleteIdea(id: string, {storage, models}: IServerContext) {
    const destroyOptions: DestroyOptions = {where: {id: id}, force: true};

    const result = await models.Idea.destroy(destroyOptions);

    if (result) await CommonHelper.deleteFile(storage, FileOwnerType.Idea, id);

    return result;
  }

  async topIdea(challengeId: string, reactionValue: string, {models}: IServerContext): Promise<Idea> {
    const countFunction = sequelize.fn("COUNT", sequelize.col("value"));

    const findOptions: FindOptions = {
      attributes: ["Idea.id" as any, [countFunction, "totalCount"]],
      include: [{model: models.IdeaReaction, attributes: [], required: false}],
      where: {challengeId: challengeId},
      group: ["Idea.id", "value"],
      order: [[countFunction, "DESC"]] as any,
      limit: 1,
      subQuery: false,
      raw: true,
    };

    if (!_.isNil(reactionValue)) findOptions.having = {value: reactionValue};

    const result = await models.Idea.findOne(findOptions);

    if (!_.isNil(result)) {
      const ideaId = result["id"];

      if (!_.isNil(ideaId)) return await models.Idea.findByPk(ideaId);
    }

    return undefined;
  }
}
