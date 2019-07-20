import {IServerContext} from "../common/Models";
import {IRelayConnection} from "../common/Models";
import ChallengeReaction from "../../db/models/ChallengeReaction";
import IdeaReaction from "../../db/models/IdeaReaction";

export const REACTION_PROVIDER_CLASS = "REACTION_PROVIDER_CLASS";

export interface ReactionsQuery {
  objectType: number;
  objectId: string;
  value?: string;
  createdById?: string;
  createdByMe?: boolean;
  orderBy?: {
    field: string;
    direction: string;
  };
  first?: number;
  after?: string;
}

export const ReactionOrderField = {
  CREATED_DATE: "createdDate",
  UPDATED_DATE: "modifiedDate",
};

export interface ReactionsSummaryQuery {
  objectType?: number;
  objectId?: string;
  value?: string;
}

export const ReactionObjectType = {
  CHALLENGE: 0,
  IDEA: 1,
};

export interface ReactionsSummaryItem {
  value: string;
  totalCount: number;
}

export interface IReactionProvider {
  reactions: (query: ReactionsQuery, context: IServerContext) => Promise<IRelayConnection<ChallengeReaction | IdeaReaction>>;
  reaction: (objectType: number, id: string, context: IServerContext) => Promise<ChallengeReaction | IdeaReaction>;

  reactionsSummary: (query: ReactionsSummaryQuery, context: IServerContext) => Promise<ReactionsSummaryItem[]>;

  createReaction: (objectType: number, objectId: string, value: string, context: IServerContext) => Promise<ChallengeReaction | IdeaReaction>;
  deleteReaction: (objectType: number, id: string, context: IServerContext) => Promise<ChallengeReaction | IdeaReaction>;

  myReaction: (objectType: number, objectId: string, context: IServerContext) => Promise<ChallengeReaction | IdeaReaction>;
}

export default class ReactionHelper {}
