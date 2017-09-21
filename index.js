const jwt = require('jsonwebtoken');


const default_options = {
  "jwt_secret": {
    "encoded": true,//default is to assume it is base64 encoded
    "enabled": false,
    "method":"null",//env or path
    "location": "null"//location to env or path
  }
};



module.exports = function(options) {
var options = options || default_options;

  return {
    sign: function(data, secret, expires){
      var jwt_secret = secret || "null";
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
    }
  }

}
