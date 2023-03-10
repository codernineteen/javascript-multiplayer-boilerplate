import { PassportStatic } from "passport";
import googleoauth2 from "passport-google-oauth20";
import userModel from "../db/models/user.model";

const GoogleStrategy = googleoauth2.Strategy;

export function passportSetup(passport: PassportStatic) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_PWD as string,
        callbackURL: "/auth/google/callback",
        scope: ["email", "profile"],
      },
      //working here
      async function (accessToken, refreshToken, profile, done) {
        console.log("trying to access on google account ");
        //유저 찾기
        return done(null);
        //const user = await userModel.findOne({ id: profile.id });
      }
    )
  );

  // passport.serializeUser((user, done) => {
  //   done(null, user);
  // });

  // passport.deserializeUser((user, done) => {
  //   done(null, user);
  // });
}
