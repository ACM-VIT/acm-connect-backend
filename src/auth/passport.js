const GoogleStrategy = require("passport-google-oauth20").Strategy;

const emails = require("./emails.json");

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = profile.emails[0].value;

        try {
          if (true) { //emails.email.includes(newUser)
            done(null, newUser);
          } else {
            done(null, false);
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  );

  passport.serializeUser((newUser, done) => {
    done(null, newUser);
  });

  passport.deserializeUser((newUser, done) => {
    done(null, newUser);
  });
};
