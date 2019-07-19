import {gql} from "apollo-server-express";

export default gql`
  type Query {
    ideas(challengeId: String, createdById: String, createdByMe: Boolean = false, withReactionByUserId: String, orderBy: IdeaOrder, first: Int, after: String): IdeaConnection!
    idea(id: ID!): Idea
  }

  type Mutation {
    createIdea(challengeId: String!, title: String!, description: String, upload: Upload): Idea
    updateIdea(id: ID!, title: String!, description: String, upload: Upload): Idea
    deleteIdea(id: ID!): Boolean!
  }

  type Idea {
    id: ID!
    title: String!
    description: String
    imageUrl: String

    createdDate: DateTime!
    createdBy: User!
    modifiedDate: DateTime!
    modifiedBy: User!
    deletedDate: DateTime
    deletedBy: User
  }

  type IdeaConnection {
    totalCount: Int!
    edges: [IdeaEdge!]!
    pageInfo: ConnectionPageInfo!
  }

  type IdeaEdge {
    node: Idea!
    cursor: String!
  }

  input IdeaOrder {
    field: IdeaOrderField!
    direction: ConnectionOrderDirection!
  }

  enum IdeaOrderField {
    CREATED_DATE
    UPDATED_DATE
    TITLE
  }

  type User {
    ideas(orderBy: IdeaOrder, first: Int, after: String): IdeaConnection!
  }

  type Challenge {
    ideas(createdById: String, createdByMe: Boolean = false, orderBy: ReactionOrder, first: Int = 5): IdeaConnection!
    topIdea(reactionValue: String): Idea
  }
`;
