import { gql } from "apollo-server-express";
// Type-graphql
import { Field, ObjectType, Query } from "type-graphql";
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
