import {GraphQLModule} from "@graphql-modules/core";
import {IServerContext} from "../common/Models";
import {IRelayConnection} from "../common/Models";
import {IChallengeProvider, CHALLENGE_PROVIDER_CLASS, ChallengeOrderField, ChallengesQuery} from "./Helper";
import User from "../../db/models/User";
import Challenge, {ChallengePrivacyModeValues} from "../../db/models/Challenge";
import {IUserProvider, USER_PROVIDER_CLASS} from "../user/Helper";

export default ({injector}: GraphQLModule) => {
  const userProvider = injector.get<IUserProvider>(USER_PROVIDER_CLASS);
  const provider = injector.get<IChallengeProvider>(CHALLENGE_PROVIDER_CLASS);

  return {
    Query: {
      challenges: async (parent: any, query: ChallengesQuery, context: IServerContext): Promise<IRelayConnection<Challenge>> => provider.challenges(query, context),

      challenge: async (parent: any, {id}: any, context: IServerContext): Promise<Challenge> => provider.challenge(id, context),
    },
    Challenge: {
      createdBy: async ({createdById}: any, args: any, context: IServerContext): Promise<User> => userProvider.user(createdById, context),

      modifiedBy: async ({modifiedById}: any, args: any, context: IServerContext): Promise<User> => userProvider.user(modifiedById, context),

      deletedBy: async ({deletedById}: any, args: any, context: IServerContext): Promise<User> => userProvider.user(deletedById, context),
    },
    ChallengePrivacyMode: ChallengePrivacyModeValues,
    ChallengeOrderField: ChallengeOrderField,
    Mutation: {
      createChallenge: async (parent: any, {title, description, closeDate, endDate, privacyMode, upload}: any, context: IServerContext): Promise<Challenge> =>
        provider.createChallenge(title, description, closeDate, endDate, privacyMode, upload, context),

      updateChallenge: async (parent: any, {id, title, description, closeDate, endDate, privacyMode, upload}: any, context: IServerContext): Promise<Challenge> =>
        provider.updateChallenge(id, title, description, closeDate, endDate, privacyMode, upload, context),

      deleteChallenge: async (parent: any, {id}: any, context: IServerContext) => provider.deleteChallenge(id, context),
    },
    User: {
      challenges: async ({id}: any, query: ChallengesQuery, context: IServerContext): Promise<IRelayConnection<Challenge>> => provider.challenges({createdById: id, ...query}, context),
    },
    Idea: {
      challenge: async ({challengeId}: any, args: any, context: IServerContext): Promise<Challenge> => provider.challenge(challengeId, context),
    },
  };
};
