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
    let user;
    try {
      user = await User.findOne({ where: { email: email } });
      // console.log(user);
    } catch (err) {
      throw err;
    }
    if (!user) {
      throw new Error("User not found");
    }
    const valid = await agrgon2.verify(user.password, password);
    if (!valid) {
      throw new Error("Invalid password");
    }
    req.session.userId = user.id;
    // console.log(res.body);
    return user;
  }
  @Mutation(() => User)
  async oauthLogin(
    @Arg("email") email: string,
    @Arg("oauthId") oauthId: string,
    @Arg("accessToken") accessToken: string,
    @Arg("refreshToken") refreshToken: string,
    @Ctx() { req, res }: any
  ) {
    let user;
    try {
      user = await User.findOne({ where: { oauthId: oauthId } });
    } catch (err) {
      throw err;
    }
    if (!user) {
      user = new User();
      user.id = uuid();
      user.oauthId = oauthId;
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      user.firstName = email;
      user.lastName = email;
      user.email = email;
      try {
        await user.save();
        req.session.userId = user.id;
        console.log(req.session.userId);
      } catch (err) {
        throw err;
      }
    }

    return user;
  }
  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: any) {
    console.log(req.session.id);
    return new Promise((resolve) =>
      req.session!.destroy((err) => {
        res.clearCookie(process.env.SESSION_NAME || "qid");
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
      console.log(req.session.userId);
      console.log(req.session);
      return null;
    }
    console.log(req.session.userId);
    console.log(req.session);

    return User.find({ where: { id: req.session.userId } });
  }

  @Mutation(() => User)
  async register(
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { req, res }: any
  ) {
    let user;
    try {
      user = await User.create({
        id: uuid(),
        firstName,
        lastName,
        email,
        password: await agrgon2.hash(password),
      }).save();
    } catch (err) {
      if (err.code === "23505") {
        throw new Error("User already exists");
      }
      throw err;
    }
    req.session.userId = user.id;
    return user;
  }
}
