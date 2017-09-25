Node.js: twitchext-helper
=================

Twitchext Helper is a module that exposes functions that helps with creating twitch extensions. This module aims to help keep clean code by taking common tidious tasks and making them a bit simpler.


Why?
----

While working on creating Twitch extensions I noticed my code was getting messy and I was repeating a lot of code for common API calls and other functions so I figured I would clean it up and create a module with functions that I find useful in my own projects and hopefully others can find it useful as well. I plan to add a lot more.


Current Status
--------------
Currently, I would consider this module in a 'beta' phase. The current functions available are all working but I would like to add more error handling and some other things. Also, I have been experimenting with making the module configurable to allow more flexibility and help cut down on repetitive code. Still working on how to make this more flexible but the current documentation below will outline how to use it without problems for now.


Installation
------------

npm install twitchext-helper --save



Usage
-----

twitchext-helper is a node module that helps cut down on repetitive and common tasks while creating twitch extensions. Below you will find the current documentation on how to properly use the module. Please read the documentation and then read the documentation a second time before yelling at me.

Configuration
-------------
This module is configurable with different options to help save on some repetitive values throughout your code. I am still experimenting with this and will explain it as thorough as possible. Hoping to make it a little more flexible in the near future.

Below are the default configuration options:
```js
const default_options = {
  "jwt_secret": {
    "encoded": true,
    "expires": null,
    "enabled": false,
    "method": null,
    "location": null
  },

  "client_id": null,
  "client_secret": null
};
```


"jwt_secret" -> Holds configurable options for when dealing with a jwt secret

"encoded" -> default is to assume the secret is base64 encoded and will decode for you, unless it is set to false which it will then     assume you have decoded yourself before passing into the function or stored in a file

"expires" -> Used for signing tokens

"enabled" -> when set to true, it will expect 'method' and 'location' to be filled. This allows you to point to a file where a jwt_secret variable is defined. This helps save from having to pass this value into every function that requires a jwt_secret. When set to false, a jwt secret will be expected to be passed into functions that require it

"method" -> 'path' is the only option available for now (environment variable coming soon). This informs the module that you would like it to grab the jwt secret from a file defined in 'location'.

"location" -> This should be filled with an 'absolute' path to a file holding a variable called 'jwt_secret'. See examples below

"client_id" -> This lets you set the client_id of your extensions once. When kept as default 'null' then it is expected for you to pass this value to every function that required it


Example Custom Configuration Usage:
```js
const custom_options = {
  "jwt_secret": {
    "encoded": true,
    "expires": 1503343947,
    "enabled": true,
    "method":"path",
    "location": "/Users/ncd275/Projects/SomeExtension/backend/config/variables" // Example variables.js would be 'module.exports = { "jwt_secret": "nnQvIn6EaPuOM3hn3xtjez9cHc7xDvaQD+48B59Powq=" }'
  },
  "client_id": "8eard7sknnl7a14z92hn33gzi72bt1", //not real, unless I got lucky
  "client_secret": "4tuyjk09zn0lfghoiw8951nnrs234"
}

const twitchext = require('twitchext-helper')(custom_options);


const data = {"user_id": "10333333", "role": "external"}

const signed = twitchext.sign(data);

twitchext.name2id("ncd275", function(err, id){
  if(err){return console.log(err)}
  console.log(id);
});
```

Custom configurations come in handy as your EBS gets bigger.


Example Default Configuration Usage:
```js
const twitchext = require('twitchext-helper');


const data = {"user_id": "10333333", "role": "external"}
const signed = twitchext.sign(data, "some secret here", 1503343947)

twitchext.name2id("ncd275", "8eard7sknnl7a14z92hn33gzi72bt1", function(err, id){
  if(err){return console.log(err)}
  console.log(id);
});
```


Without twitchext-helper module:
```js
const jsonwebtoken = require('jsonwebtoken');
const https = require('https');

var signedToken = jwt.sign({"user_id": "10333333", "role": "external"}, jwt_secret_variable, {expiresIn: 1503343947});

function name2id(user_name, client_id){
    var reqOpts = {
        hostname: 'api.twitch.tv',
        port: 443,
        path: '/kraken/channels/'+user_name,
        method: 'GET',
        headers: {
          'Client-Id': client_id,
          'Accept': 'application/vnd.twitchtv.v5+json'
        }
    };

    var req = https.request(reqOpts, (res) => {

          var body = "";
          res.on('data', function(d){
            body+=d
          });
          res.on('end', function(){
            console.log(body);

          });

    });
    req.end();
}
```
This is where using twitchext-helper for api calls can help clean up code

NOTE: Configuration is all or nothing. If you want to pass configuration options to the module then you need to fill out all fields. Hopefully will be changing this soon. I recommend filling all of the options to make the use of the module and its functions a lot more simpler.


 Functions
 -------

These are the currently available functions listed below and examples on how to use them. Again, I recommend passing custom options to the module to make use of these more simple.

Note: someMethod(param1, [, param2], [, param3]). [, ] signifies that this could be an optional parameter if the appropriate custom options are set otherwise it is a required parameter.


 - ### sign(data, [, secret], [, expires])

 	-> signs data and creates a json web token

  Example:
  ```js
  var signedToken = twitchext.sign(data); //with custom configuration

  var signedToken = twitchext.sign(data, "some secret here", 1503343947); //with default configuration
  ```

<br><br>


  - ### verify(data, [, jwt secret], [, callback])

   -> verifies the validity of the json web token

   Example:
   ```js
   twitchext.verify(signedToken, function(err, decoded){
       if(err){throw err;}
       console.log(decoded);
   }); //with custom configuration

   twitchext.verify(signedToken, "some secret here", function(err, decoded){
       if(err){throw err;}
       console.log(decoded);
   }); //with default configuration
   ```


<br><br>


  ### decode(data)

  -> Simply decodes the json web token without verification

  Example:
  ```js
  twitchext.decode(signedJWT) //Any configuration
  ```


<br><br>


  - ### id2name(user_id, [, client_id], [, callback])

  -> Calls twitch api to resolve a user ID to its associated display name

   Example:
   ```js
   twitchext.id2name("102705463", function(err, name){
     if(err){return console.log(err)}
     console.log(name);
   }); //Custom configuration

   twitchext.id2name("102705463", "some client id here", function(err, name){
     if(err){return console.log(err)}
     console.log(name);
   }); //Default configuration
   ```


<br><br>


  - ### name2id(user_name, [, client_id], [, callback])

    -> Calls twitch api to resolve a display name to a user id

    Example:
    ```js
    twitchext.name2id("ncd275", function(err, id){
    if(err){return console.log(err);}
    console.log(id);
    }); //Custom configuration

    twitchext.name2id("ncd275", "some client id here", function(err, id){
    if(err){return console.log(err)}
    console.log(id);
    }); //Default configuration
    ```


<br><br>


  - ### getStream(user_id, [, client_id], [, callback])

   -> Calls twitch api to retrieve a user's current streaming information if they are currently streaming

   Example:
   ```js
   twitchext.getStream("102705463", function(err, stream){
     if(err){return console.log(err)}
     console.log(stream)
   }); //Custom configuration

   twitchext.getStream("102705463", "8eard7sknnl7a14z92hn33gzi72bt1", function(err, stream){
     if(err){return console.log(err)}
     console.log(stream)
   }); //Default configuration
   ```


<br><br>


 - ### sendPubSub(channel_id, signedToken, data, targets, [, client_id], [, callback])

  -> "Twitch provides a publish-subscribe system for your EBS to communicate with both the broadcaster and viewers. Calling this endpoint forwards your message using the same mechanism as the send() function in the JavaScript helper API." - Twitch Documentation. This method achieves this in a more simple and cleaner way. See https://dev.twitch.tv/docs/extensions/reference#send-extension-pubsub-message

  Example:
  ```js
  var targets = ["broadcast"];
  var signedToken = twitchext.sign({channel_id: "102705463", role: "external", pubsub_perms: { listen: [ 'broadcast' ], send: [ '*' ]}});
  var data = {"message": "here is some message"}

  twitchext.sendPubSub("102705463", signedToken, targets, data, function(response){
    console.log(response);
  }); //Custom configuration


  twitchext.sendPubSub("102705463", signedToken, targets, data, "some client id" function(response){
    console.log(response);
  });//Default configuration
  ```


<br><br>


  - ### getAccesToken(oauthCode, redirect_uri, [, client_id], [, client_secret] , [, callback])

   -> This function gets the access token required to perform actions or access data on the user's behalf. This is useful for when you have Oauth scopes defined for your extension under "Extension Capabilities". When a user of your extension tries to activate the extension, it will ask for their authorization and if successful return a oauth code, this function then takes that oauth code and makes the necessary request to exchange that code for an access token which is what is actually used to make request on behalf of that user later.

   Example:
   ```js

   app.get('/oauth', function(req, res){
     var oauthCode = req.query.code;

       twitchext.getAccessToken(oauthCode, "https://localhost/oauth", function(err, token){
         if(err){console.log(err)};

         console.log(token); // save to database if needed
       }); //Custom configuration


       twitchext.getAccessToken(oauthCode, "https://localhost/oauth", "some client id", "some client secret", function(err, token){
         if(err){console.log(err)};

         console.log(token);
       }); //Default configuration

   });

   ```


<br><br>


 - ### oauthReceipt(channel_id, signed_token, extension_version, response_object, [, client_id], [, callback])

  -> This function sends a oauth receipt to twitch notifying them that you have successfully received oauth authorization from the user and should allow activation of the extension. Should be used after 'getAccessToken'.

  Example:
  ```js
  app.get('/oauth', function(req, res){

      var channelId = JSON.parse(req.query.state).channel_id;
      var signedToken = twitchext.sign({"user_id": "102705463", "role": "external"});

      twitchext.oauthReceipt(channelId, signedToken, "0.0.1", res, function(err, response){
        if(err){console.log(err)}
         console.log(response); // "success"

      });//Custom configuration

      twitchext.oauthReceipt(channelId, signedToken, "0.0.1", res, "some client id", function(err, response){
        if(err){console.log(err)}
         console.log(response); // "success"

      });//Default configuration
  });

  ```






 Future
 ------

 I definitely plan to add more functions as I find useful and have time. Again, this is kind of in a 'beta' phase so definitely looking to greatly improve it.
