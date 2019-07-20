import {gql} from "apollo-server-express";

export default gql`
  type Query {
    challenges(createdById: String, createdByMe: Boolean = false, withReactionByUserId: String, excludeClosed: Boolean = true, excludeEnded: Boolean = true, orderBy: ChallengeOrder, first: Int, after: String): ChallengeConnection!
    challenge(id: ID!): Challenge
  }

  type Mutation {
    createChallenge(title: String!, description: String, closeDate: DateTime, endDate: DateTime, privacyMode: ChallengePrivacyMode, upload: Upload): Challenge
    updateChallenge(id: ID!, title: String!, description: String, closeDate: DateTime, endDate: DateTime, privacyMode: ChallengePrivacyMode, upload: Upload): Challenge
    deleteChallenge(id: ID!): Boolean!
  }

  type Challenge {
    id: ID!
    title: String!
    description: String!
    imageUrl: String
    closeDate: DateTime
    endDate: DateTime
    privacyMode: ChallengePrivacyMode!
    privacyData: String

    createdDate: DateTime!
    createdBy: User!
    modifiedDate: DateTime!
    modifiedBy: User!
    deletedDate: DateTime
    deletedBy: User
  }

  enum ChallengePrivacyMode {
    PUBLIC
    BYDOMAIN
  }

  type ChallengeConnection {
    totalCount: Int!
    edges: [ChallengeEdge!]!
    pageInfo: ConnectionPageInfo!
  }

  type ChallengeEdge {
    node: Challenge!
    cursor: String!
  }

  input ChallengeOrder {
    field: ChallengeOrderField!
    direction: ConnectionOrderDirection!
  }

  enum ChallengeOrderField {
    CREATED_DATE
    UPDATED_DATE
    TITLE
  }

  type User {
    challenges(orderBy: ChallengeOrder, first: Int, after: String): ChallengeConnection!
  }

  type Idea {
    challenge: Challenge
  }
`;
