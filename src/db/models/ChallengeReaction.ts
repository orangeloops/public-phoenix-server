import {Table, Column, ForeignKey, DataType, BelongsTo, CreatedAt, UpdatedAt, DeletedAt, Model} from "sequelize-typescript";
import Challenge from "./Challenge";
import User from "./User";

@Table({tableName: "challenge_reaction"})
export default class ChallengeReaction extends Model<ChallengeReaction> {
  @Column({type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4})
  id: string;

  @Column({allowNull: false, validate: {notEmpty: true}, unique: "reactionUnique"})
  value: string;

  @CreatedAt
  createdDate: Date;

  @ForeignKey(() => User)
  @Column({type: DataType.UUID, allowNull: false, unique: "reactionUnique"})
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

  @ForeignKey(() => Challenge)
  @Column({field: "challengeId", type: DataType.UUID, allowNull: false, unique: "reactionUnique"})
  objectId: string;

  @BelongsTo(() => Challenge)
  challenge: Challenge;
}
