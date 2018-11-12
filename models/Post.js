var Engine = require('./../Engine');
var bcrypt = require("bcrypt");
var log = require("./../Logger").child({
    module : "models/Bot.js"
});

import {Entity, DB} from 'omn';

class Post extends Entity {

	static get schema(){
		return {
			title: {
				type : String,
				null : false,
				default : "Untitled"
			},
			content: String,
			active : {
				type : Boolean,
				default : true
			},
			creation_date : Date,
			update_date : Date
		}
	}

}

DB.entities["Post"] = Post;

module.exports = User;