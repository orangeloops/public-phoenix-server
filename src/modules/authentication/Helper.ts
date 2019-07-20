import * as _ from "lodash";
import * as express from "express";
import {AuthenticationError} from "apollo-server-express";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import {VerifyErrors} from "jsonwebtoken";
import {ModuleSessionInfo} from "@graphql-modules/core";
import {getFieldsWithDirectives} from "@graphql-modules/utils";
import {NextResolverFunction, throwInvalidDomainError, throwInvalidMeError, throwNotOwnerError} from "../common/Helper";
import {IServerContext, IUserRef} from "../common/Models";
import User from "../../db/models/User";
import Challenge, {ChallengePrivacyMode} from "../../db/models/Challenge";
import Idea from "../../db/models/Idea";
import {ReactionObjectType} from "../reaction/Helper";

export const AUTHENTICATION_PROVIDER_CLASS = "AUTHENTICATION_PROVIDER_CLASS";

const defaultSession: any = {
  currentChallenge: undefined,
  currentIdea: undefined,
  currentReaction: undefined,
};

export const isAuthenticated = () => (next: NextResolverFunction) => async (parent: any, args: any, context: IServerContext, info: any) => {
  const {models, currentUser} = context;

  let user: User;

  if (!_.isNil(currentUser)) user = await models.User.findByPk(currentUser.id);

  if (_.isNil(user)) throwInvalidMeError();

  return next(parent, args, context, info);
};

export const isChallengeDomainValid = () => (next: NextResolverFunction) => async (parent: any, args: any, context: IServerContext, info: any) => {
  const {id} = args;
  const {models, currentUser} = context;

  const challenge = await models.Challenge.findByPk(id);

  if (!_.isNil(challenge) && challenge.privacyMode === ChallengePrivacyMode.ByDomain) {
    const domain = !_.isNil(currentUser) ? User.getDomain(currentUser) : undefined;

    if (_.isNil(domain) || !challenge.privacyData.includes(domain)) throwInvalidDomainError();
  }

  return next(parent, args, context, info);
};

export const isChallengeOwner = () => (next: NextResolverFunction) => async (parent: any, args: any, context: IServerContext, info: any) => {
  const {id} = args;
  const {models, currentUser} = context;

  const challenge = await models.Challenge.findByPk(id);

  if (!_.isNil(challenge) && challenge.createdById !== currentUser.id) throwNotOwnerError();

  return next(parent, args, context, info);
};

export const isIdeaDomainValid = () => (next: NextResolverFunction) => async (parent: any, args: any, context: IServerContext, info: any) => {
  const {id} = args;
  const {models, currentUser} = context;

  let challenge: Challenge;
  const idea = await models.Idea.findByPk(id);

  if (!_.isNil(idea)) {
    challenge = await models.Challenge.findByPk(idea.challengeId);

    if (!_.isNil(challenge) && challenge.privacyMode === ChallengePrivacyMode.ByDomain) {
      const domain = !_.isNil(currentUser) ? User.getDomain(currentUser) : undefined;

      if (_.isNil(domain) || !challenge.privacyData.includes(domain)) throwInvalidDomainError();
    }
  }

  return next(parent, args, context, info);
};

export const isIdeaOwner = (options: {allowChallengeOwner: boolean} = {allowChallengeOwner: false}) => (next: NextResolverFunction) => async (parent: any, args: any, context: IServerContext, info: any) => {
  const {allowChallengeOwner} = options;
  const {id} = args;
  const {models, currentUser} = context;

  let result = true;

  let challenge: Challenge;
  const idea = await models.Idea.findByPk(id);

  if (!_.isNil(idea)) {
    result = idea.createdById === currentUser.id;

    if (!result && allowChallengeOwner) {
      challenge = await models.Challenge.findByPk(idea.challengeId);

      if (!_.isNil(challenge)) result = challenge.createdById === currentUser.id;
    }

    if (!result) throwNotOwnerError();
  }

  return next(parent, args, context, info);
};

export const isReactionOwner = (options: {allowParentOwner: boolean} = {allowParentOwner: false}) => (next: NextResolverFunction) => async (parent: any, args: any, context: IServerContext, info: any) => {
  const {allowParentOwner} = options;
  const {objectType, id} = args;
  const {models, currentUser} = context;

  let result = true;

  let challenge: Challenge;
  let idea: Idea;
  const reaction = await (objectType === ReactionObjectType.CHALLENGE ? models.ChallengeReaction.findByPk(id) : models.IdeaReaction.findByPk(id));

  if (!_.isNil(reaction)) {
    result = reaction.createdById === currentUser.id;

    if (!result && allowParentOwner) {
      if (objectType === ReactionObjectType.CHALLENGE) {
        challenge = await models.Challenge.findByPk(reaction.objectId);

        if (!_.isNil(challenge)) result = challenge.createdById === currentUser.id;
      } else {
        idea = await models.Idea.findByPk(reaction.objectId);

        if (!_.isNil(idea)) result = idea.createdById === currentUser.id;
      }
    }

    if (!result) throwNotOwnerError();
  }

  return next(parent, args, context, info);
};

const DIRECTIVE_TO_GUARD: any = {
  isAuthenticated: () => isAuthenticated,
  isChallengeOwner: () => isChallengeOwner,
  isIdeaOwner: () => isIdeaOwner,
  isReactionOwner: () => isReactionOwner,
};

export const resolversComposition = ({typeDefs}: any) => {
  const result: any = {};
  const fieldsAndTypeToDirectivesMap = getFieldsWithDirectives(typeDefs);

  for (const fieldPath in fieldsAndTypeToDirectivesMap) {
    const directives = fieldsAndTypeToDirectivesMap[fieldPath];

    if (directives.length > 0) {
      result[fieldPath] = directives
        .map((directive: any) => {
          if (DIRECTIVE_TO_GUARD[directive.name]) {
            const mapperFn = DIRECTIVE_TO_GUARD[directive.name];

            return mapperFn(directive.args);
          }

          return null;
        })
        .filter((a: any) => a);
    }
  }

  return result;
};

export interface IAuthenticationModuleConfig {
  ACCESS_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRATION: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRATION: string;
  MAILJET_APIKEY_PUBLIC: string;
  MAILJET_APIKEY_PRIVATE: string;
  MAILJET_CAMPAIGN: string;
  MAILJET_FROM: string;
  MAILJET_FROM_NAME: string;
  MAILJET_ACTIVATION_TEMPLATE_ID: string;
  MAILJET_ACTIVATION_LINK: string;
  MAILJET_PASSWORD_TEMPLATE_ID: string;
  MAILJET_PASSWORD_LINK: string;
}

export interface IAuthenticationModuleRequest {
  req: express.Request;
}

export interface IAuthenticationProvider {
  context: (request: IAuthenticationModuleRequest, currentContext: IServerContext, sessionInfo: ModuleSessionInfo<IAuthenticationModuleConfig, IAuthenticationModuleRequest, IServerContext>) => Promise<any>;
  signUp: (name: string, email: string, password: string, upload: any, context: IServerContext) => Promise<any>;
  signIn: (email: string, password: string, generateRefreshToken: boolean, context: IServerContext) => Promise<any>;
  refreshTokens: (token: string, context: IServerContext) => Promise<any>;
  checkEmail: (email: string, context: IServerContext) => Promise<any>;
  confirmEmail: (token: string, context: IServerContext) => Promise<User>;
  resendEmailConfirmation: (email: string, context: IServerContext) => Promise<any>;
  requestResetPassword: (email: string, context: IServerContext) => Promise<any>;
  resetPassword: (token: string, password: string, context: IServerContext) => Promise<any>;
}

export default class AuthenticationHelper {
  static refFromUser(user: User): IUserRef {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
    };
  }

  static async createToken(data: any, secretOrPublicKey: string, expiresIn: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(data, secretOrPublicKey, {expiresIn}, (error: Error, encoded: string) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(encoded);
      });
    });
  }

  static async verifyToken(token: string, secretOrPublicKey: string): Promise<object | string> {
    return new Promise<object | string>((resolve, reject) => {
      jwt.verify(token, secretOrPublicKey, (errors: VerifyErrors, decoded: object | string) => {
        if (errors) {
          reject(errors);
          return;
        }

        resolve(decoded);
      });
    });
  }

  static async verifyTokenFromRequest(request: IAuthenticationModuleRequest, secretOrPublicKey: string, currentContext: IServerContext): Promise<any> {
    const token = request.req.headers["x-token"];

    try {
      if (_.isString(token) && token.length > 0) return await AuthenticationHelper.verifyToken(token, secretOrPublicKey);
    } catch (e) {
      throw new AuthenticationError("Invalid authentication token");
    }
  }

  static async generatePasswordHash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  static async validatePassword(value: string, password: string): Promise<boolean> {
    return await bcrypt.compare(value, password);
  }
}
