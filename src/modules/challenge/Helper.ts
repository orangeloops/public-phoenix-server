import {IServerContext} from "../common/Models";
import {IRelayConnection} from "../common/Models";
import Challenge, {ChallengePrivacyMode} from "../../db/models/Challenge";

export const CHALLENGE_PROVIDER_CLASS = "CHALLENGE_PROVIDER_CLASS";

export interface ChallengesQuery {
  createdById?: string;
  createdByMe?: boolean;
  withReactionByUserId?: string;
  excludeClosed?: boolean;
  excludeEnded?: boolean;
  orderBy?: {
    field: string;
    direction: string;
  };
  first?: number;
  after?: string;
}

export const ChallengeOrderField = {
  CREATED_DATE: "createdDate",
  UPDATED_DATE: "modifiedDate",
  TITLE: "title",
};

export interface IChallengeProvider {
  challenges: (query: ChallengesQuery, context: IServerContext) => Promise<IRelayConnection<Challenge>>;
  challenge: (id: string, context: IServerContext) => Promise<Challenge>;

  createChallenge: (title: string, description: string, closeDate: Date, endDate: Date, privacyMode: ChallengePrivacyMode, upload: any, context: IServerContext) => Promise<Challenge>;
  updateChallenge: (id: string, title: string, description: string, closeDate: Date, endDate: Date, privacyMode: ChallengePrivacyMode, upload: any, context: IServerContext) => Promise<Challenge>;
  deleteChallenge: (id: string, context: IServerContext) => Promise<Challenge>;
}

export default class ChallengeHelper {}
