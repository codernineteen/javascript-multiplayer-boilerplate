import { PassportStatic, Profile } from "passport";
import googleoauth2 from "passport-google-oauth20";
import User, { UserDocument } from "../db/models/user.model.js";

const GoogleStrategy = googleoauth2.Strategy;

export function passportSetup(passport: PassportStatic) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_PWD as string,
        callbackURL: "/auth/google/callback",
        scope: ["profile"],
      },
      //working here -> 몽고에서 유저 검색은 비동기로 작동
      async (accessToken, refreshToken, profile, done) => {
        console.log("trying to access on google account ");
        //유저 찾기
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            return done(null, user);
          } else {
            const newUser = {
              googleId: profile.id,
              name: profile.name?.givenName,
              email: profile.emails?.values,
              photos: profile.photos?.values,
              provider: profile.provider,
            };
            user = await User.create(newUser);
            return done(null, user);
          }
        } catch (error) {
          console.log(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log("serialized");
    done(null, user);
  });

  passport.deserializeUser((user: UserDocument, done) => {
    console.log("deserialized");
    done(null, user);
  });
}
