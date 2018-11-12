var fs = require('fs');
var https = require('https');
var http = require('http');
var mongoose = require('mongoose');
var Sequelize = require('sequelize');
var omn = require('omn');

let DB = null;
let SERVER = null;

var log = require("./Logger").child({
    module : "./Engine.js"
});

let IO = null;

export default class Engine {

    static get db() {
        return DB;
    }

    static set db(db) {
        DB = db;
    }

    static get server(){
        return SERVER;
    }

    static set server(value){
        SERVER = value;
    }

    static getSocket(){
        return IO;
    }

    static getDB(){
        return DB;
    }

    static setup(options){
        log.info("Engine.setup() | setting up...");
        Engine.db = options.db;
    }

    static check(){     
        if(!DB)
            throw Error("A database is necessary to setup.");
    }

    static async start(_options) {

        const options = _options || {};
        const self = this;

        var p = new Promise(async function(fulfill, reject){

            log.info({
                options: options
            }, "Engine.start()");

            try{

                // Checking configuration...

                log.info({
                    options: options,
                    db_config : Engine.db
                }, "Engine.start() | checking setup...");

                Engine.check();
                
                // Connecting to database...

                log.info({
                    options: options
                }, "Engine.start() | connecting to database...");

                var db = null;

                switch(Engine.db.type){

                    case "mongodb":

                        db = await mongoose.connect(Engine.db.uri, {
                            autoReconnect: true,
                            socketTimeoutMS: 300000,
                            connectTimeoutMS: 300000,
                            keepAlive: true,
                            reconnectTries: 30,
                            reconnectInterval: 3000,
                        });

                        break;

                    case "postgresql":

                        /**
                         * PostgreSQL Client Configuration
                         **/

                        let options = Engine.db.options;

                        if(process.env.NODE_ENV != "production")
                            delete options.ssl;

                        options.dialect = 'postgres';

                        db = new Sequelize(options);

                        break;

                }
                
                log.info({
                    options: options
                }, "Engine.start() | connected to database...");

                debugger;

                Engine.db = omn.DB.configure({
                    db : {
                      type : Engine.db.type,
                      client : db
                    }
                });

                // Starting server... 

                if(options.server == false){
                debugger;

                    return fulfill();

                }else{

                    // Creating administrator
                    debugger;

                    await self.createAdmin();

                    // Configuring server

                    let port = process.env.PORT || 3000;
                    let server = null;

                    log.info("Engine.start() | starting server...");

                    server = Engine.server = require("express")();
                    
                    require("./configuration/express")(server);
                    require("./configuration/routes")(server);

                    if(process.env.HTTPS_EXPRESS == "true"){
                        let opts = {
                            key: fs.readFileSync(process.env.SSL_KEY),
                            cert: fs.readFileSync(process.env.SSL_CERT),
                        };
                        server = https.createServer(opts, server);
                        log.info("Engine.start() | starting on port " + process.env.HTTPS_PORT + "...");
                        await server.listen(process.env.HTTPS_PORT);
                    }else{
                        server = http.createServer(server);
                        log.info("Engine.start() | starting on port " + port + "...");
                        await server.listen(port);  
                    }

                    if(options.websockets == true)
                        await self.loadWebSockets(server);

                }

                log.info("Engine started! ⏤  by IBM");
                fulfill();

            }catch(e){

                log.error(e);
                reject(e);

            }


        });

        return p;

    }

    static async createAdmin(){
        
        log.debug("Engine.createAdmin() | creating admin...");

        var User = require("./models/User");

        var params = {
            username : process.env.ADMIN_USERNAME,
            password : process.env.ADMIN_DEFAULT_PASSWORD,
            name : process.env.ADMIN_NAME
        };

        log.debug("Engine.createAdmin() | checking is admin email already exists ...");

        var user = await User.findOne({
            username : params.username
        });

        log.debug({user}, "Engine.createAdmin() | user found:")

        if(user){
            await user.save();
        }else{
            log.debug("Engine.createAdmin() | admin email does not exists, creating a new user...");
            var new_user = new User(params);
            await new_user.save();
            log.debug("Engine.createAdmin() | Admistrator user created...");
        }

    }

}