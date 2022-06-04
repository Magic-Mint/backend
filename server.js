const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const session = require('express-session');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
let campaign = require('./routes/campaign');
let user = require('./routes/user');
let claim = require('./routes/claim');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const { default: axios } = require('axios');

let CloudAddress = require('./models/CloudAddress');

const FRONTEND_URL = process.env.FRONTEND_URL;
const SUCCESS_REDIRECT = process.env.SUCCESS_REDIRECT;
const FAILURE_REDIRECT = process.env.FAILURE_REDIRECT;

const PORT = process.env.PORT || 3000;
const app = express();

//database connection
async function connectDatabase() {
  dbConnected = await mongoose.connect(process.env.MongoDB_URI);
  app.use('/api', campaign);
  app.use('/api', user);
  app.use('/api', claim);
  console.log('Connected to mongoose successfully');
}

// configs
require('./configs/cloudinary');
require('./configs/passport-twitter');

connectDatabase();

//middleware
app.use(express.json());

app.use(fileUpload());

app.set('trust proxy', 1);

const additionalProdCookieSettings = {};

if (process.env.NODE_ENV === 'prod') {
  additionalProdCookieSettings.sameSite = 'none';
}

app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'prod',
    ...additionalProdCookieSettings,
  })
);
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: [FRONTEND_URL, 'https://magicmintv2.herokuapp.com', 'https://api.twitter.com', 'https://magicmint.xyz'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // allow session cookie from browser to pass through
  })
);

app.get('/getMe', (req, res) => {
  if (req.user) {
    const resUser = {
      _id: req.user._id,
      provider: {
        ...req.user.twitterProvider,
      },
    };

    return res.json(resUser);
  }

  res.status(401).json(null);
});

// when login failed, send failed msg
app.get('/auth/login/failed', (req, res) => {
  res.redirect(FAILURE_REDIRECT);
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get(
  '/auth/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: SUCCESS_REDIRECT,
    failureRedirect: '/auth/login/failed',
  })
);

app.post('/auth/logout', (req, res) => {
  req.logout();
  res.status(200).json('bye');
});

const oembedUrl = 'https://publish.twitter.com/oembed?omit_script=true&hide_thread=true&url=';
const tweetsByIdUrl = 'https://twitter.com/andypiper/status/';

app.get('/getMyTweets', async (req, res) => {
  if (!req.user) return res.json([]);
  try {
    const tweetsResponse = await axios.get(
      `https://api.twitter.com/2/users/${req.user.twitterProvider.id}/tweets?exclude=retweets,replies`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );
    const tweetsIds = tweetsResponse.data.data.map((tweet) => tweet.id);

    const embedsPromises = tweetsIds.map(
      (tweetId) =>
        new Promise((resolve, reject) => {
          axios
            .get(oembedUrl + tweetsByIdUrl + tweetId)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
        })
    );
    const embedsResponses = await Promise.all(embedsPromises);
    const responseObj = tweetsIds.map((tweetId, ind) => ({
      id: tweetId,
      html: embedsResponses[ind].data.html,
      url: embedsResponses[ind].data.url,
    }));
    res.json(responseObj);
  } catch (err) {
    res.json(err);
  }
});

app.listen(PORT, () => {
  console.log(`listening on : https://localhost:${PORT}`);
});

app.get('/api', (req, res) => {
  res.send('Welcome to the Magic Mint API');
});

app.get('/test', (req, res) => {
  res.send('Deploy went well!');
});

app.get('/', (req, res) => {
  res.send('Welcome to the Magic Mint API');
});
