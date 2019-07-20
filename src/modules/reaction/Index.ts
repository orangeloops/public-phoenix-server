import {GraphQLModule} from "@graphql-modules/core";
import typeDefs from "./Schema";
import resolvers from "./Resolvers";
import {isAuthenticated, isReactionOwner} from "../authentication/Helper";
import {REACTION_PROVIDER_CLASS} from "./Helper";
import ReactionProvider from "./Provider";
import {CommonModule} from "../common";
import {AuthenticationModule} from "../authentication";
import {UserModule} from "../user";

export const ReactionModule = new GraphQLModule({
  name: "ReactionModule",
  typeDefs,
  resolvers,
  imports: [CommonModule, AuthenticationModule, UserModule],
  providers: [{provide: REACTION_PROVIDER_CLASS, useClass: ReactionProvider}],
  resolversComposition: {
    "Mutation.createReaction": [isAuthenticated()],
    "Mutation.deleteReaction": [isAuthenticated(), isReactionOwner()],
  },
});
