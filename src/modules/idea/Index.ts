import {GraphQLModule} from "@graphql-modules/core";
import typeDefs from "./Schema";
import resolvers from "./Resolvers";
import {isAuthenticated, isIdeaDomainValid, isIdeaOwner} from "../authentication/Helper";
import {IDEA_PROVIDER_CLASS} from "./Helper";
import IdeaProvider from "./Provider";
import {CommonModule} from "../common";
import {AuthenticationModule} from "../authentication";
import {UserModule} from "../user";
import {ReactionModule} from "../reaction";

export const IdeaModule = new GraphQLModule({
  name: "IdeaModule",
  typeDefs,
  resolvers,
  imports: [CommonModule, AuthenticationModule, UserModule, ReactionModule],
  providers: [{provide: IDEA_PROVIDER_CLASS, useClass: IdeaProvider}],
  resolversComposition: {
    "Query.idea": [isIdeaDomainValid()],
    "Mutation.createIdea": [isAuthenticated()],
    "Mutation.updateIdea": [isAuthenticated(), isIdeaOwner()],
    "Mutation.deleteIdea": [isAuthenticated(), isIdeaOwner({allowChallengeOwner: true})],
  },
});
