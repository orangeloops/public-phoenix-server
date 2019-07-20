import * as _ from "lodash";
import {Table, Column, Model, HasMany, CreatedAt, UpdatedAt, DeletedAt, DataType, ForeignKey, BelongsTo, BeforeCreate} from "sequelize-typescript";
import ChallengeReaction from "./ChallengeReaction";
import Idea from "./Idea";
import User from "./User";

export enum ChallengePrivacyMode {
  Public = 0,
  ByDomain = 1,
}

export const ChallengePrivacyModeValues = {
  PUBLIC: ChallengePrivacyMode.Public,
  BYDOMAIN: ChallengePrivacyMode.ByDomain,
};

@Table({tableName: "challenge"})
export default class Challenge extends Model<Challenge> {
  @Column({type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4})
  id: string;

  @Column({allowNull: false, validate: {notEmpty: true}})
  title: string;

  @Column({type: DataType.TEXT, allowNull: false, validate: {notEmpty: true}})
  description: string;

  @Column
  imageUrl: string;

  @Column({type: DataType.DATE})
  closeDate: Date;

  @Column({type: DataType.DATE})
  endDate: Date;

  @Column({allowNull: false, defaultValue: ChallengePrivacyMode.Public})
  privacyMode: ChallengePrivacyMode;

  @Column({type: DataType.TEXT})
  privacyData: string;

  @CreatedAt
  createdDate: Date;

  @ForeignKey(() => User)
  @Column({type: DataType.UUID, allowNull: false})
  createdById: string;

  @BelongsTo(() => User, "createdById")
  createdBy: User;

  @UpdatedAt
  modifiedDate: Date;

  @ForeignKey(() => User)
  @Column({type: DataType.UUID, allowNull: false})
  modifiedById: string;

  @BelongsTo(() => User, "modifiedById")
  modifiedBy: User;

  @DeletedAt
  deletedDate: Date;

  @ForeignKey(() => User)
  @Column({type: DataType.UUID})
  deletedById: string;

  @BelongsTo(() => User, "deletedById")
  deletedBy: User;

  @HasMany(() => ChallengeReaction, {onDelete: "cascade"})
  reactions: ChallengeReaction[];

  @HasMany(() => Idea, {onDelete: "cascade"})
  ideas: Idea[];

  @BeforeCreate
  static async defaultImageUrl(challenge: Challenge) {
    if (_.isNil(challenge.imageUrl)) challenge.imageUrl = "https://storage.googleapis.com/ideasource.appspot.com/image/challenge-default.png";
  }
}
