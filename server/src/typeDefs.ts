import { gql } from "apollo-server-express";
// Type-graphql
import { Field, ObjectType } from "type-graphql";
@ObjectType()
class User {
  @Field((type) => String)
  id: string;
  @Field((type) => String)
  firstName: string;
  @Field((type) => String)
  lastName: string;
  @Field((type) => String)
  email: string;
  @Field((type) => String)
  password: string;
}

class Query {
  @Field((type) => User)
  currentUser(parent, args, context) {
    return context.getUser();
const typeDefs = gql`
  type User {
    id: ID
    firstName: String
    lastName: String
    email: String
    spotifyId: String
    refreshToken: String
  }
  type Query {
    currentUser: User
  }
  type Mutation {
    logout: Boolean
  }
  type AuthPayload {
    user: User
  }
}

class AuthPayload {
  @Field((type) => User)
  user: User;
}

class Mutation {}
const typeDefs = gql`
  type Mutation {
    login(email: String!, password: String!): AuthPayload
    register(
      firstName: String!
      lastName: String!
      email: String!
      password: String!
    ): AuthPayload
  }
`;
export default typeDefs;
