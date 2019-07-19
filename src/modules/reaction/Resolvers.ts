import {GraphQLModule} from "@graphql-modules/core";
import {IServerContext} from "../common/Models";
import {IRelayConnection} from "../common/Models";
import {IReactionProvider, REACTION_PROVIDER_CLASS, ReactionObjectType, ReactionOrderField, ReactionsQuery, ReactionsSummaryQuery, ReactionsSummaryItem} from "./Helper";
import User from "../../db/models/User";
import {IUserProvider, USER_PROVIDER_CLASS} from "../user/Helper";
import ChallengeReaction from "../../db/models/ChallengeReaction";
import IdeaReaction from "../../db/models/IdeaReaction";

export default ({injector}: GraphQLModule) => {
  const userProvider = injector.get<IUserProvider>(USER_PROVIDER_CLASS);
  const provider = injector.get<IReactionProvider>(REACTION_PROVIDER_CLASS);

  return {
    Query: {
      reactions: async (parent: any, query: ReactionsQuery, context: IServerContext): Promise<IRelayConnection<ChallengeReaction | IdeaReaction>> => provider.reactions(query, context),

      reaction: async (parent: any, {objectType, id}: any, context: IServerContext): Promise<ChallengeReaction | IdeaReaction> => provider.reaction(objectType, id, context),
    },
    Reaction: {
      createdBy: async ({createdById}: any, args: any, context: IServerContext): Promise<User> => userProvider.user(createdById, context),

      modifiedBy: async ({modifiedById}: any, args: any, context: IServerContext): Promise<User> => userProvider.user(modifiedById, context),

      deletedBy: async ({deletedById}: any, args: any, context: IServerContext): Promise<User> => userProvider.user(deletedById, context),
    },
    ReactionObjectType: ReactionObjectType,
    ReactionOrderField: ReactionOrderField,
    Mutation: {
      createReaction: async (parent: any, {objectType, objectId, value}: any, context: IServerContext): Promise<ChallengeReaction | IdeaReaction> => provider.createReaction(objectType, objectId, value, context),

      deleteReaction: async (parent: any, {objectType, id}: any, context: IServerContext) => provider.deleteReaction(objectType, id, context),
    },
    Challenge: {
      myReaction: async ({id}: any, args: any, context: IServerContext): Promise<ChallengeReaction | IdeaReaction> => provider.myReaction(ReactionObjectType.CHALLENGE, id, context),

      reactions: async ({id}: any, query: ReactionsQuery, context: IServerContext): Promise<IRelayConnection<ChallengeReaction | IdeaReaction>> =>
        provider.reactions({objectType: ReactionObjectType.CHALLENGE, objectId: id, ...query}, context),

      reactionsSummary: async ({id}: any, query: ReactionsSummaryQuery, context: IServerContext): Promise<ReactionsSummaryItem[]> => provider.reactionsSummary({objectType: ReactionObjectType.CHALLENGE, objectId: id, ...query}, context),
    },
    Idea: {
      myReaction: async ({id}: any, args: any, context: IServerContext): Promise<ChallengeReaction | IdeaReaction> => provider.myReaction(ReactionObjectType.IDEA, id, context),

      reactions: async ({id}: any, query: ReactionsQuery, context: IServerContext): Promise<IRelayConnection<ChallengeReaction | IdeaReaction>> => provider.reactions({objectType: ReactionObjectType.IDEA, objectId: id, ...query}, context),

      reactionsSummary: async ({id}: any, query: ReactionsSummaryQuery, context: IServerContext): Promise<ReactionsSummaryItem[]> => provider.reactionsSummary({objectType: ReactionObjectType.IDEA, objectId: id, ...query}, context),
    },
  };
};
