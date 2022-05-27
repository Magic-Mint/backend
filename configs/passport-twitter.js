const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/User');

passport.serializeUser(function (user, done) {
  done(null, user.twitterProvider.id);
});
passport.deserializeUser((twitterId, done) => {
  User.findOne({ 'twitterProvider.id': twitterId})
    .then((user) => {
      done(null, user);
    })
    .catch((e) => {
      done(new Error('Failed to deserialize an user'), null);
    });
});

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK_URL,
    },
    async (token, refreshToken, profile, done) => {
      const user = await User.findOne({ 'twitterProvider.id': profile.id });
      if (!user) {
        const newUser = new User({
          twitterProvider: {
            id: profile.id,
            username: profile.username,
            photo: profile.photos[0].value ?? null,
          },
        });
        await newUser.save();
        return done(null, newUser);
      }
      return done(null, user);
    }
  )
);
