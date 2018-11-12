var User = require('./../models/User');

var Error = require("./utils/Error.js");
var Utils = require('./utils/Utils');

var validator = require('validator');
var bcrypt = require('bcrypt');

var jwt = require('jsonwebtoken');

var log = require("./../Logger").child({
    module : "controllers/Auth.js"
});

var Errors = {
	INVALID_DATA : {
		message : "Invalid registration data",
		code : "AUTH_INVALID_DATA",
		status : 401
	},
	INVALID_USERNAME : {
		message : "Invalid username",
		code : "AUTH_INVALID_USERNAME",
		status : 401
	},
	INVALID_PASSWORD : {
		message : "Invalid password",
		code : "AUTH_INVALID_PASSWORD",
		status : 401
	},
	INVALID_PASSWORD_EMPTY : {
		message : "Invalid empty password",
		code : "AUTH_INVALID_PASSWORD_EMPTY",
		status : 401
	},
	INVALID_PASSWORD_SHORT : {
		message : "Invalid short password",
		code : "AUTH_INVALID_SHORT",
		status : 401
	},
	INVALID_CREDENTIALS : {
		message : "Bad username or password",
		code : "AUTH_INVALID_CREDENTIALS",
		status : 401
	},
	USER_NOT_FOUND : {
		message : "User not found",
		code : "AUTH_USER_NOT_FOUND",
		status : 500
	},
	USER_NOT_VERIFIED : {
		message : "User not verified, please review your inbox for the verification email",
		code : "AUTH_USER_NOT_VERIFIED",
		status : 500
	}
}

var Auth = class Auth {

  static async signin(req, res, next){

    try {

      req.log.info({
        metadata: req.body
      }, "Auth.signin()");

      var username = req.body.username;
      var password = req.body.password;

      if (username == null || !validator.isAlphanumeric(username)) {
        req.log.error({ metadata : req.body }, "Invalid username.");
        var error = Error.new(Errors.INVALID_USERNAME);
        return Utils.handleError(req, res, error);
      }

      if (password == null || password == undefined || password === undefined) {
        req.log.error({ metadata : req.body }, "Invalid password.");
        var error = Error.new(Errors.INVALID_CREDENTIALS);
        return Utils.handleError(req, res, error);
      }

      req.log.info({ metadata : req.body }, "Getting user by username...");

      var user = await User.findOne({
          username : username
      });

      if (user == null) {
        req.log.error({ metadata : req.body }, "User not found.");
        var error = Error.new(Errors.USER_NOT_FOUND);
        return Utils.handleError(req, res, error);
      }

      req.log.info({ metadata : req.body }, "User exists, validating password ...");

      var authorized = await bcrypt.compare(password, user.password);

      if (!authorized) {
        req.log.info({ metadata : req.body }, "Invalid password.");
        var error = Error.new(Errors.INVALID_CREDENTIALS);
        return Utils.handleError(req, res, error);
      }
      
      // Valid password
      
      req.log.info({ metadata : req.body }, "Valid password.");
      req.log.info("Creating jwt token ...");
      
      var data = user.getProperties();
      data.id = user.id;
      delete data.password;

      var access_token = jwt.sign({
        user: data
      }, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: "1h"
      });

      res.json({
        status: 200,
        message: "Successfully Authenticated. The provided token only lasts 1 hour.",
        data: {
            user: user.toJSON(),
            access_token: access_token
        }
      });

    }catch(e){
      return Utils.handleError(req, res, e);
    }

  }

}

module.exports = Auth;