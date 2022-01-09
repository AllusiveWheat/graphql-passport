import { v4 as uuid } from "uuid";
import { User } from "./entity/User";
import argon2 from "argon2";
const resolvers = {
  Query: {
    currentUser: (parent, args, context) => context.getUser(),
  },
  Mutation: {
    logout: (parent, args, context) => context.logout(),
    register: async (
      parent,
      { firstName, lastName, email, password },
      context
    ) => {
      const hashedPassword = await argon2.hash(password);
      const existingUsers = context.User.find();
      const userWithEmailAlreadyExists = existingUsers.find(
        (user) => user.email === email
      );
      if (userWithEmailAlreadyExists) {
        throw new Error("User with email already exists");
      }
      const newUser = {
        id: uuid(),
        firstName,
        lastName,
        email,
        hashedPassword,
      };
      return context.User.create(newUser).save();
    },
    login: async (parent, { email, password }, context) => {
      const decrptedPassword = await argon2.hash(password);
      const { user } = await context.authenticate("graphql-local", {
        email,
        decrptedPassword,
      });
      await context.login(user);
      return { user };
    },
  },
};
export default resolvers;
