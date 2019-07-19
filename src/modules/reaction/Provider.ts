import * as _ from "lodash";
import * as sequelize from "sequelize";
import {DestroyOptions, FindOptions, IncludeOptions, Op} from "sequelize";
import {Model} from "sequelize-typescript";
import {Injectable, Inject} from "@graphql-modules/di";
import CommonHelper, {throwInvalidMeError, throwNotImplementedError} from "../common/Helper";
import {ConnectionOrderDirection, IEdge, IRelayConnection, IServerContext} from "../common/Models";
import User from "../../db/models/User";
import {ChallengePrivacyMode} from "../../db/models/Challenge";
import ChallengeReaction from "../../db/models/ChallengeReaction";
import IdeaReaction from "../../db/models/IdeaReaction";
import {ReactionObjectType, ReactionOrderField, ReactionsQuery, ReactionsSummaryQuery, ReactionsSummaryItem} from "./Helper";

@Injectable()
export default class ReactionProvider {
  async reactions({objectType, objectId, value, createdById, createdByMe, orderBy, first, after}: ReactionsQuery, {models, currentUser}: IServerContext): Promise<IRelayConnection<ChallengeReaction | IdeaReaction>> {
    const findOptions: FindOptions = {
      where: !_.isNil(objectId) ? {objectId: objectId} : {},
      order: [[ReactionOrderField.CREATED_DATE, ConnectionOrderDirection.DESC]],
      include: [],
    };

    if (!_.isNil(value) && value.length > 0) {
      findOptions.where = {
        ...findOptions.where,
        value: value,
      };
    }

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

    if (objectType === ReactionObjectType.CHALLENGE) {
      findOptions.include = [...findOptions.include, challengeInclude];
    } else {
      findOptions.include = [
        ...findOptions.include,
        {
          model: models.Idea,
          attributes: [],
          include: [challengeInclude],
        },
      ];
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

    if (!_.isNil(orderBy)) findOptions.order = [[orderBy.field, orderBy.direction]];

    if (!_.isNil(first) && first > 0) findOptions.limit = first + 1;

    if (!_.isNil(after)) throwNotImplementedError("after");

    const resultSet = await (objectType === ReactionObjectType.CHALLENGE ? models.ChallengeReaction.findAndCountAll(findOptions) : models.IdeaReaction.findAndCountAll(findOptions));

    let hasNextPage = false;
    let lastCursor: string = undefined;
    const totalCount = resultSet.count;

    const edges: IEdge<ChallengeReaction | IdeaReaction>[] = [];

    const objects: (ChallengeReaction | IdeaReaction)[] = resultSet.rows;
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

  async reaction(objectType: number, id: string, {models}: IServerContext): Promise<ChallengeReaction | IdeaReaction> {
    return objectType === ReactionObjectType.CHALLENGE ? models.ChallengeReaction.findByPk(id) : models.IdeaReaction.findByPk(id);
  }

  async reactionsSummary({objectType, objectId, value}: ReactionsSummaryQuery, {models}: IServerContext): Promise<ReactionsSummaryItem[]> {
    const findOptions: FindOptions = {
      where: {objectId: objectId},
      group: ["value"],
      having: !_.isNil(value) && value.length > 0 ? {value: value} : {},
      attributes: ["value" as any, [sequelize.fn("COUNT", sequelize.col("value")), "totalCount"]],
    };

    const result: ReactionsSummaryItem[] = [];

    const rows: [] = await (objectType === ReactionObjectType.CHALLENGE ? models.ChallengeReaction.findAll(findOptions) : models.IdeaReaction.findAll(findOptions));

    rows.forEach((row: any) => {
      result.push({
        value: row.getDataValue("value"),
        totalCount: row.getDataValue("totalCount"),
      });
    });

    return result;
  }

  async createReaction(objectType: number, objectId: string, value: string, {models, currentUser}: IServerContext): Promise<ChallengeReaction | IdeaReaction> {
    const values: any = {
      objectType: objectType,
      objectId: objectId,
      value: value,
      createdById: currentUser.id,
      modifiedById: currentUser.id,
    };

    await (objectType === ReactionObjectType.CHALLENGE ? models.ChallengeReaction.upsert(values) : models.IdeaReaction.upsert(values));

    const findWhere: FindOptions = {where: {objectId: objectId, value: value, createdById: currentUser.id}};

    return await (objectType === ReactionObjectType.CHALLENGE ? models.ChallengeReaction.findOne(findWhere) : models.IdeaReaction.findOne(findWhere));
  }

  async deleteReaction(objectType: number, id: string, {models}: IServerContext) {
    const destroyOptions: DestroyOptions = {where: {id: id}, force: true};

    return await (objectType === ReactionObjectType.CHALLENGE ? models.ChallengeReaction.destroy(destroyOptions) : models.IdeaReaction.destroy(destroyOptions));
  }

  async myReaction(objectType: number, objectId: string, {models, currentUser}: IServerContext): Promise<ChallengeReaction | IdeaReaction> {
    if (_.isNil(currentUser)) return undefined;

    return await (objectType === ReactionObjectType.CHALLENGE
      ? models.ChallengeReaction.findOne({where: {objectId: objectId, createdById: currentUser.id}})
      : models.IdeaReaction.findOne({where: {objectId: objectId, createdById: currentUser.id}}));
  }
}
