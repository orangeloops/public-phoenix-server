import {gql} from "apollo-server-express";

export default gql`
  type ReactionsSummaryItem {
    value: String!
    totalCount: Int!
  }

  type Query {
    reactions(objectType: ReactionObjectType!, objectId: String, value: String, createdById: String, createdByMe: Boolean = false, orderBy: ReactionOrder, first: Int, after: String): ReactionConnection!
    reaction(objectType: ReactionObjectType!, id: ID!): Reaction
    reactionsSummary(objectType: ReactionObjectType!, objectId: String!, value: String): [ReactionsSummaryItem!]!
  }

  type Mutation {
    createReaction(objectType: ReactionObjectType!, objectId: ID!, value: String!): Reaction
    deleteReaction(objectType: ReactionObjectType!, id: ID!): Boolean!
  }

  type Reaction {
    id: ID!
    objectId: ID!
    value: String!

    createdDate: DateTime!
    createdBy: User!
    modifiedDate: DateTime!
    modifiedBy: User!
    deletedDate: DateTime
    deletedBy: User
  }

  enum ReactionObjectType {
    CHALLENGE
    IDEA
  }

  type ReactionConnection {
    totalCount: Int!
    edges: [ReactionEdge!]!
    pageInfo: ConnectionPageInfo!
  }

  type ReactionEdge {
    node: Reaction!
    cursor: String!
  }

  input ReactionOrder {
    field: ReactionOrderField!
    direction: ConnectionOrderDirection!
  }

  enum ReactionOrderField {
    CREATED_DATE
    UPDATED_DATE
  }

  type Challenge {
    myReaction: Reaction

    reactions(createdById: String, createdByMe: Boolean = false, orderBy: ReactionOrder, first: Int = 5): ReactionConnection!
    reactionsSummary(value: String): [ReactionsSummaryItem!]!
  }

  type Idea {
    myReaction: Reaction

    reactions(createdById: String, createdByMe: Boolean = false, orderBy: ReactionOrder, first: Int = 5): ReactionConnection!
    reactionsSummary(value: String): [ReactionsSummaryItem!]!
  }
`;
