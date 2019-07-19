import {GraphQLModule} from "@graphql-modules/core";
import typeDefs from "./Schema";
import resolvers from "./Resolvers";
import {CommonModule} from "../common";
import {isAuthenticated, isChallengeDomainValid, isChallengeOwner} from "../authentication/Helper";
import {CHALLENGE_PROVIDER_CLASS} from "./Helper";
import ChallengeProvider from "./Provider";
import {AuthenticationModule} from "../authentication";
import {UserModule} from "../user";
import {IdeaModule} from "../idea";
import {ReactionModule} from "../reaction";

export const ChallengeModule = new GraphQLModule({
  name: "ChallengeModule",
  typeDefs,
  resolvers,
  imports: [CommonModule, AuthenticationModule, UserModule, IdeaModule, ReactionModule],
  providers: [{provide: CHALLENGE_PROVIDER_CLASS, useClass: ChallengeProvider}],
  resolversComposition: {
    "Query.challenge": [isChallengeDomainValid()],
    "Mutation.createChallenge": [isAuthenticated()],
    "Mutation.updateChallenge": [isAuthenticated(), isChallengeOwner()],
    "Mutation.deleteChallenge": [isAuthenticated(), isChallengeOwner()],
  },
});
