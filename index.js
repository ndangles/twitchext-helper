const jwt = require('jsonwebtoken');
const https = require('https');


const default_options = {
  "jwt_secret": {
    "encoded": true, //default is to assume it is base64 encoded
    "expires": 1503343947, //for signing jwts
    "enabled": false,
    "method":null, //path
    "location": null //location to file

  },

  "client_id":null
};



module.exports = function(options) {
var options = options || default_options;

  return {
    sign: function(data, secret, expires){
      var jwt_secret = secret || null;
      var expires = expires || 1503343947;

      if(options.jwt_secret.enabled == true){
        switch(options.jwt_secret.method){
          // case "env":
          //           var OBJ = options.jwt_secret.location;
          //
          //           jwt_secret = process.env.OBJ;
          //           console.log(jwt_secret)
          //           break;//broken, needs testing
          case "path":
                    var s = require(options.jwt_secret.location);
                    jwt_secret = s.jwt_secret;
                    break;
          default:
            console.log("missing options");
            return;
        }
      }else{
        jwt_secret = secret;
      }

      if(options.jwt_secret.encoded == true){
        var b64string = jwt_secret;
        jwt_secret = Buffer.from(b64string, 'base64');
      }



      return jwt.sign(data, jwt_secret, {expiresIn: expires});
    },

    verify: function(data, secret, callback){
            var jwt_secret = secret || null;

            if(typeof secret == "function"){callback=secret}

            if(options.jwt_secret.enabled == true){
              switch(options.jwt_secret.method){
                case "path":
                          var s = require(options.jwt_secret.location);
                          jwt_secret = s.jwt_secret;
                          break;
                default:
                  console.log("missing options");
                  return;
              }
            }else{
              jwt_secret = secret;
            }

            if(options.jwt_secret.encoded == true){
              var b64string = jwt_secret;
              jwt_secret = Buffer.from(b64string, 'base64');
            }


            jwt.verify(data, jwt_secret, function(err, decoded){

                callback(err, decoded);
            });

    },

    decode: function(data){return jwt.decode(data)},
    id2name: function(user_id, client_id, callback) {
              var client_id = client_id || null;

              if(typeof client_id == "function"){callback=client_id}

              if(options.client_id != null){
                client_id = options.client_id
              }

              var reqOpts = {
                  hostname: 'api.twitch.tv',
                  port: 443,
                  path: '/kraken/channels/'+user_id,
                  method: 'GET',
                  headers: {
                    'Client-Id': client_id,
                    'Accept': 'application/vnd.twitchtv.v5+json'
                  }
              };

              var req = https.request(reqOpts, (res) => {

                    var body = ""
                    res.on('data', function(d){body+=d})
                    res.on('end', function(){
                      var error = null;
                      if(JSON.parse(body.toString()).display_name == undefined){
                          error = "Could not resolve user ID to a display name";
                          callback(error, undefined)
                      } else {
                        callback(error, JSON.parse(body.toString()).display_name)
                      }

                    });

              });
              req.end();
    },

    name2id: function(user_name, client_id, callback){

              var client_id = client_id || null;

              if(typeof client_id == "function"){callback=client_id}

              if(options.client_id != null){
                client_id = options.client_id
              }

              var reqOpts = {
                  hostname: 'api.twitch.tv',
                  port: 443,
                  path: '/kraken/users?login='+user_name,
                  method: 'GET',
                  headers: {
                    'Client-Id': client_id,
                    'Accept': 'application/vnd.twitchtv.v5+json'
                  }
              };

              var req = https.request(reqOpts, (res) => {

                    var body = ""
                    res.on('data', function(d){body+=d;})
                    res.on('end', function(){
                      var error = null;
                      if(JSON.parse(body.toString())._total < 1){
                        error = "Could not resolve name to an ID"
                        callback(error, undefined)
                      } else {
                        callback(error, JSON.parse(body.toString()).users[0]._id)
                      }




                    });

              });
              req.end();
    },

    getStream: function(user_id, client_id, callback){
                var client_id = client_id || null;

                if(typeof client_id == "function"){callback=client_id}

                if(options.client_id != null){
                  client_id = options.client_id
                }

                var reqOpts = {
                    hostname: 'api.twitch.tv',
                    port: 443,
                    path: '/kraken/streams/'+user_id,
                    method: 'GET',
                    headers: {
                      'Client-Id': client_id,
                      'Accept': 'application/vnd.twitchtv.v5+json'
                    }
                };

                var req = https.request(reqOpts, (res) => {

                      var body = ""
                      res.on('data', function(d){body+=d})
                      res.on('end', function(){
                        var error = null;
                        if(JSON.parse(body.toString()).stream != null){
                          callback(error, JSON.parse(body.toString()));
                        }else{
                          error = "Could not retrieve stream information based on provided user ID. User may not be live or does not exist"
                          callback(error, undefined);
                        }

                      })

                });
                req.end();
    },

    sendPubSub: function(channel_id, signedToken, data, targets, client_id, callback) {
                var client_id = client_id || null;

                if(typeof client_id == "function"){callback=client_id}

                if(options.client_id != null){
                  client_id = options.client_id
                }


                var postData = JSON.stringify({

                      content_type:"application/json",
                      message:JSON.stringify(data),
                      targets:targets

                });

                var options = {
                  hostname: 'api.twitch.tv',
                  port: 443,
                  path: '/extensions/message/'+channel_id,
                  method: 'POST',
                  headers: {
                        'Client-Id': client_id,
                        'Content-Type': 'application/json',
                        'Content-Length':postData.length,
                        'Authorization':'Bearer '+signedToken
                     }
                };

                var req = https.request(options, (res) => {

                  var body = ""
                  res.on('data', function(d){body+=d})
                  res.on('end', function(){
                    callback("success");

                  });
                });

                req.on('error', (e) => {
                  callback(e);
                });

                req.write(postData);
                req.end();


    }
  }

}
