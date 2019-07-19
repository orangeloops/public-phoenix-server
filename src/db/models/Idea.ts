import * as _ from "lodash";
import {Table, Column, Model, ForeignKey, BelongsTo, CreatedAt, UpdatedAt, DeletedAt, DataType, HasMany, BeforeCreate} from "sequelize-typescript";
import Challenge from "./Challenge";
import IdeaReaction from "./IdeaReaction";
import User from "./User";

@Table({tableName: "idea"})
export default class Idea extends Model<Idea> {
  @Column({type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4})
  id: string;

  @Column({allowNull: false, validate: {notEmpty: true}})
  title: string;

  @Column({type: DataType.TEXT, allowNull: false, validate: {notEmpty: true}})
  description: string;

  @Column
  imageUrl: string;

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

  @ForeignKey(() => Challenge)
  @Column({type: DataType.UUID, allowNull: false})
  challengeId: string;

  @BelongsTo(() => Challenge)
  challenge: Challenge;

  @HasMany(() => IdeaReaction, {onDelete: "cascade"})
  reactions: IdeaReaction[];

  @BeforeCreate
  static async defaultImageUrl(idea: Idea) {
    if (_.isNil(idea.imageUrl)) idea.imageUrl = "https://storage.googleapis.com/ideasource.appspot.com/image/idea-default.png";
  }
}
