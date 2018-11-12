var Engine = require('./../Engine');

var bcrypt = require("bcrypt");

var log = require("./../Logger").child({
    module : "models/Bot.js"
});

import {Entity, DB} from 'omn';

class User extends Entity{

    constructor(data){
      super(data);        
      data = data || {};
      this.name = (data.name) ? data.name : this._name;
      this.username = (data.username) ? data.username : this._username;
      this.password = (data.password) ? bcrypt.hashSync(data.password, 10) : this._password;
    }

    static set password(value){    
      this._password = bcrypt.hashSync(value, 10);
    }

    static get password(){
      return this._password;
    }

    static get name(){
      return "User";
    }

    static get schema(){
      return {
        name : String,
        username : {
          type : String,
          null : false,
          unique : true
        },
        password : String
      }
    }

    toJSON(){
      return {
        name : this.name,
        username : this.username
      }
    }

}

User.db = DB;
DB.entities["User"] = User;

module.exports = User;