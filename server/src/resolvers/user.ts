import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import agrgon2 from "argon2";
import { User } from "../entities/User";
@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  @Mutation(() => User)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { req, res }
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("No user found");
    }
    const valid = await agrgon2.verify(user.password, password);
    if (!valid) {
      throw new Error("Incorrect password");
    }
    req.session!.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: any) {
    return new Promise((resolve) =>
      req.session!.destroy((err) => {
        res.clearCookie("qid");
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
  @Query(() => User)
  async currentUser(@Ctx() { req }: any) {
    const userId = req.session!.userId;
    if (!userId) {
      return null;
    }
    return await User.findOne(userId);
  }

  @Mutation(() => User)
  async register(
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { req, res }
  ) {
    const hashedPassword = await agrgon2.hash(password);
    const existingUsers = await User.find();
    const userWithEmailAlreadyExists = existingUsers.find(
      (user) => user.email === email
    );
    if (userWithEmailAlreadyExists) {
      throw new Error("User with email already exists");
    }

    const newUser = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
    };
    const user = await User.create(newUser).save();
    return { user };
  }
}
