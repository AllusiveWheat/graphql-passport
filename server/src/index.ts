import express from "express";
const PORT = 4000;
import session from "express-session";
import { v4 as uuid } from "uuid";
const SESSION_SECRECT = process.env.SESSION_SECRECT || "bad secret";
import passport from "passport";
const SpotifyStrategy = require("passport-spotify").Strategy;
import User from "./User";
import dotenv from "dotenv-safe";
import cors from "cors";

dotenv.config();
import typeDefs from "./typeDefs";
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
import resolvers from "./resolvers";
import { ApolloServer } from "apollo-server-express";
import { buildContext, GraphQLLocalStrategy } from "graphql-passport";
async function load(): Promise<void> {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    const users = User.getUsers();
    const matchingUser = users.find((user) => user.id === id);
    done(null, matchingUser);
  });
  const app = express();
  const corsOptions = {
    origin: "http://localhost:3000",
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
    typeDefs,
    resolvers,
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
        const existingUsers = User.getUsers();
        const userWithEmailAlreadyExists = !!existingUsers.find(
          (user) => user.email === profile.email
        );
        if (userWithEmailAlreadyExists) {
          throw new Error("User with email already exists");
        }
        const newUser = {
          id: uuid(),
          oauthId: profile.id,
          firstName: profile.displayName,
          lastName: profile.displayName,
          email: profile.email,
        };
        User.addUser(newUser);
        done(null, newUser);
      }
    )
  );
  passport.use(
    new GraphQLLocalStrategy((email, password, done) => {
      const users = User.getUsers();
      const matchingUser = users.find(
        (user) => email === user.email && password === user.password
      );
      const error = matchingUser ? null : new Error("no matching user");
      done(error, matchingUser);
    })
  );
  app.get("/auth/spotify", passport.authenticate("spotify"));
  app.get(
    "/auth/spotify/callback",
    passport.authenticate("spotify", {
      successRedirect: "http://localhost:4000/graphql",
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
