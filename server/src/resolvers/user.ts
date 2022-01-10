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
import { v4 as uuid } from "uuid";
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
    if (user) {
      user.id = uuid(); // This is a hack to get around the fact that the userId is not being set in the session
    }
    if (!user) {
      throw new Error("User does not exist");
    }
    const valid = await agrgon2.verify(user.password, password);
    if (!valid) {
      throw new Error("Invalid password");
    }
    req.session.userId = user.id;
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
  @Query(() => User, { nullable: true })
  currentUser(@Ctx() { req }: any) {
    if (!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId);
  }

  @Mutation(() => User)
  async register(
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { req }: any
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
      id: uuid(),
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
    };
    newUser.id = req.session.userId;
    const user = await User.create(newUser).save();
    return { user };
  }
}
