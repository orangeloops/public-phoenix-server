import {GraphQLModule} from "@graphql-modules/core";
import {IServerContext} from "../common/Models";
import {IRelayConnection} from "../common/Models";
import {IIdeaProvider, IDEA_PROVIDER_CLASS, IdeaOrderField, IdeasQuery} from "./Helper";
import User from "../../db/models/User";
import {IUserProvider, USER_PROVIDER_CLASS} from "../user/Helper";
import Idea from "../../db/models/Idea";

export default ({injector}: GraphQLModule) => {
  const userProvider = injector.get<IUserProvider>(USER_PROVIDER_CLASS);
  const provider = injector.get<IIdeaProvider>(IDEA_PROVIDER_CLASS);

  return {
    Query: {
      ideas: async (parent: any, query: IdeasQuery, context: IServerContext): Promise<IRelayConnection<Idea>> => provider.ideas(query, context),

      idea: async (parent: any, {id}: any, context: IServerContext): Promise<Idea> => provider.idea(id, context),
    },
    Idea: {
      createdBy: async ({createdById}: any, args: any, context: IServerContext): Promise<User> => userProvider.user(createdById, context),

      modifiedBy: async ({modifiedById}: any, args: any, context: IServerContext): Promise<User> => userProvider.user(modifiedById, context),

      deletedBy: async ({deletedById}: any, args: any, context: IServerContext): Promise<User> => userProvider.user(deletedById, context),
    },
    IdeaOrderField: IdeaOrderField,
    Mutation: {
      createIdea: async (parent: any, {challengeId, title, description, upload}: any, context: IServerContext): Promise<Idea> => provider.createIdea(challengeId, title, description, upload, context),

      updateIdea: async (parent: any, {id, title, description, upload}: any, context: IServerContext): Promise<Idea> => provider.updateIdea(id, title, description, upload, context),

      deleteIdea: async (parent: any, {id}: any, context: IServerContext) => provider.deleteIdea(id, context),
    },
    User: {
      ideas: async ({id}: any, query: IdeasQuery, context: IServerContext): Promise<IRelayConnection<Idea>> => provider.ideas({createdById: id, ...query}, context),
    },
    Challenge: {
      ideas: async ({id}: any, query: IdeasQuery, context: IServerContext): Promise<IRelayConnection<Idea>> => provider.ideas({challengeId: id, ...query}, context),

      topIdea: async ({id}: any, {reactionValue}: any, context: IServerContext): Promise<Idea> => provider.topIdea(id, reactionValue, context),
    },
  };
};
