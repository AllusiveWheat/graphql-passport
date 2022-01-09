import express from "express";
const PORT = 4000;
import session from "express-session";
import { v4 as uuid } from "uuid";
import { buildSchema } from "type-graphql";

const SESSION_SECRECT = process.env.SESSION_SECRECT || "bad secret";
import passport from "passport";
const SpotifyStrategy = require("passport-spotify").Strategy;
import dotenv from "dotenv-safe";
import cors from "cors";
import CustomGoogleStrategy from "passport-google-strategy";
import { ApolloServer } from "apollo-server-express";
import { buildContext, GraphQLLocalStrategy } from "graphql-passport";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
dotenv.config({ allowEmptyValues: true });
import { UserResolver } from "./resolvers/user";
async function load(): Promise<void> {
  const connection = await createConnection({
    type: "postgres",
    database: process.env.DB_NAME || "spotify",
    username: "postgres",
    password: process.env.DB_PASSWORD,
    logging: true,
    synchronize: true,
    entities: [User],
  });

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id: string, done) => {});
  const app = express();
  const corsOptions = {
    origin: "*",

    credentials: true,
  };
  app.use(cors(corsOptions));
  app.use(
    session({
      genid: (req) => uuid(),
      secret: SESSION_SECRECT,
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    context: ({ req, res }) => buildContext({ req, res, User }),
  });
  passport.use(
    new SpotifyStrategy(
      {
        clientID: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        callbackURL: "http://localhost:4000/auth/spotify/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const existingUsers = await User.find();
        const userWithEmailAlreadyExists = existingUsers.find(
          (user) => user.email === profile.email
        );
        if (userWithEmailAlreadyExists) {
          throw new Error("User with email already exists");
        }
        const newUser = {
          id: uuid(),
          spotifyId: profile.id,
          firstName: profile.displayName,
          lastName: profile.displayName,
          email: profile.email,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
        const user = await User.create(newUser).save();
        done(null, user);
      }
    )
  );
  passport.use(
    new CustomGoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:4000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const existingUsers = await User.find();
        const userWithEmailAlreadyExists = existingUsers.find(
          (user) => user.email === profile.email
        );
        if (userWithEmailAlreadyExists) {
          throw new Error("User with email already exists");
        }
        const newUser = {
          id: uuid(),
          firstName: profile.displayName,
          lastName: profile.displayName,
          email: profile.email,
        };
        const user = await User.create(newUser).save();
        done(null, user);
      }
    )
  );
  passport.use(
    new GraphQLLocalStrategy(async (email, password, done) => {
      const users = await User.find({
        where: {
          email,
          password,
        },
      });
      if (users.length > 0) {
        done(null, users[0]);
      } else {
        const error = new Error("Invalid credentials");
        error.name = "AuthenticationError";
        done(error, false);
      }
    })
  );
  app.get("/auth/spotify", passport.authenticate("spotify"));
  app.get(
    "/auth/spotify/callback",
    passport.authenticate("spotify", {
      successRedirect: "http://localhost:3000",
      failureRedirect: "http://localhost:4000/graphql",
    })
  );

  app.get("/auth/google", passport.authenticate("google"));
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "http://localhost:3000",
      failureRedirect: "http://localhost:4000/graphql",
    })
  );

  await server.start();
  server.applyMiddleware({ app, cors: false });
  app.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
  });
}
load();
