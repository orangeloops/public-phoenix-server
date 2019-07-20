import {Sequelize} from "sequelize-typescript";
import * as config from "../../Config";
import Challenge from "./Challenge";
import ChallengeReaction from "./ChallengeReaction";
import Idea from "./Idea";
import IdeaReaction from "./IdeaReaction";
import User from "./User";

const sequelize = new Sequelize({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  dialect: "postgres",
  options: {
    operatorsAliases: false,
  },
} as any);

const models = {
  Challenge: Challenge,
  ChallengeReaction: ChallengeReaction,
  Idea: Idea,
  IdeaReaction: IdeaReaction,
  User: User,
};

sequelize.addModels([Challenge, ChallengeReaction, Idea, IdeaReaction, User]);

Object.keys(models).forEach(key => {
  const model: any = (models as any)[key];

  if ("associate" in model) model.associate(models);
});

export {sequelize};

export default models;
