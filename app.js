/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/votedb";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();
//app.use(express.bodyParser());
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());
// parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
//app.use(bodyParser.json())

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          //console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/api/:playlistName', function(req, res) {

  MongoClient.connect(url, function(err, db) {
    //console.log(req.query.userId);
    db.collection("playlists").find({}).toArray(function(err, result1) {
      //console.log(result1[0]);
    });
    db.collection("playlists").find({playlistId: req.query.playlistId, songId: req.query.songId, "users.id": req.query.userId}).toArray(function(err, result1) {
      if (err) throw err;
        if(result1[0] === undefined){
          //console.log("HERE");
          db.collection("playlists").insertOne({playlistId: req.query.playlistId, songId: req.query.songId, users: [{id: req.query.userId, vote: 0}], ups: 0, downs: 0}, function(err, result2) {
          if (err) throw err;
            db.collection("playlists").find({playlistId: req.query.playlistId, songId: req.query.songId, "users.id": req.query.userId}).toArray(function(err, result3) {
              if (err) throw err;
                res.send(result3[0]);
            });
          });
        }
        else {
          //console.log(result1[0]);
          res.send(result1[0]);
        }
    });
    //db.close();
  });
});

app.post('/api/:playlistName', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    db.collection("playlists").find({}).toArray(function(err, result1) {
      //res.send(result1);
    });
    let id = require('mongodb').ObjectID(req.body.mongoId);
    console.log("ID: "+ id);
    db.collection("playlists").find({"_id" : id}).toArray(function(err, result1) {
      console.log(result1);
    });
    //let userVote = db.collection("playlists").find({playlistId: req.body.playlistId, songId: req.body.songId, "users.id": req.body.userId});
    //console.log(userVote._id);
    db.collection("playlists").update({"_id" : id, "users.id": req.body.userId}, {$set: {"users.$.vote": req.body.vote}}, function(err, result1) {
      if (err) throw err;
      console.log(result1.result.nModified + " record updated");
      //db.close(););
      res.send("POST");
    });
  });
});

console.log('Listening on 8888');
app.listen(8888);
