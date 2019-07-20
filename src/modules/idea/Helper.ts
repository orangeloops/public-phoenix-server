import {IServerContext} from "../common/Models";
import {IRelayConnection} from "../common/Models";
import Idea from "../../db/models/Idea";

export const IDEA_PROVIDER_CLASS = "IDEA_PROVIDER_CLASS";

export interface IdeasQuery {
  challengeId?: string;
  createdById?: string;
  createdByMe?: boolean;
  withReactionByUserId?: string;
  orderBy?: {
    field: string;
    direction: string;
  };
  first?: number;
  after?: string;
}

export const IdeaOrderField = {
  CREATED_DATE: "createdDate",
  UPDATED_DATE: "modifiedDate",
  TITLE: "title",
};

export interface IIdeaProvider {
  ideas: (query: IdeasQuery, context: IServerContext) => Promise<IRelayConnection<Idea>>;
  idea: (id: string, context: IServerContext) => Promise<Idea>;

  createIdea: (challengeId: string, title: string, description: string, upload: any, context: IServerContext) => Promise<Idea>;
  updateIdea: (id: string, title: string, description: string, upload: any, context: IServerContext) => Promise<Idea>;
  deleteIdea: (id: string, context: IServerContext) => Promise<Idea>;

  topIdea: (challengeId: string, reactionValue: string, context: IServerContext) => Promise<Idea>;
}

export default class IdeaHelper {}
