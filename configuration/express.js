var express         = require('express');
var logger          = require('morgan');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var cors            = require('cors');
var Ddos            = require('ddos')
var ipfilter        = require('express-ipfilter').IpFilter;
var ipaddr          = require('ipaddr.js');
var forwarded       = require('forwarded');
var helmet 			= require('helmet');
var uuidV1          = require('uuid/v1');

var log = require("./../Logger").child({
	module : "configuration/express.js"
});

module.exports = function(server) {
    
    if(process.env.DDOS_PROTECTION){
			var ddos = new Ddos({
				limit: process.env.DDOS_PROTECTION_LIMIT,
				errormessage: process.env.DDOS_PROTECTION_BLOCK_MESSAGE || "Por seguridad, se te ha bloqueado el acceso temporalmente, gracias."
			});
			server.use(ddos.express);
    }

    server.disable('x-powered-by');
    
    server.use(helmet({
			xssFilter: true,
			noSniff : true,
			hsts : true,
			frameguard: {
				action: 'deny'
			}
    }))

    server.locals.pretty = false;    

    if(process.env.HTTPS_REDIRECT == "true"){
			server.enable('trust proxy');
			server.use(function(req, res, next){
				if(req.secure) return next();
				else {
					if(process.env.NODE_ENV == "development")
						res.redirect("https://localhost" + ":" + process.env.HTTPS_PORT + req.url);
					else
						res.redirect("https://" + req.headers.host + req.url);
				}
			});
    }

	if(process.env.IP_ACCESS_PROTECTION){

		function customDetection(req){
			var addresses = forwarded(req);
			var ipAddress = addresses[addresses.length - 1] || req.connection.remoteAddress.replace(/\//g, '.') || req.ip;
			
			try{
				var _ = ipAddress;
				ipAddress = ipaddr.process(ipAddress).octets;
				if(ipAddress)
					ipAddress = ipAddress.join(".");
				else
					ipAddress = ipaddr.parse(_).toNormalizedString();
			}catch(e){
				return ipAddress;
			}

			return ipAddress;
		}

		try{
			var ips = JSON.parse(process.env.IPS);
			server.use(ipfilter(ips, {
				detectIp: customDetection,
				mode: 'allow'
			}));
		}catch(e){
			console.error(e);
		}

	}

	server.use(logger('dev'));
	server.use(methodOverride());

	server.use(function(req, res, next){
		req.rawBody = '';
		req.on('data', function(chunk) {
			req.rawBody += chunk;
		});
		next();
	});
    
	server.use(bodyParser.json({limit: '5mb'}));
	server.use(bodyParser.urlencoded({limit: '5mb', extended: true }));

	const ALLOWED_METHODS = ['GET', 'PUT', 'POST', 'OPTIONS'];
	
	server.use(function(req, res, next) {
		if (!ALLOWED_METHODS.includes(req.method)) {
			res.status(405).end();
		}else {
			next();
		}
	});

	server.use(cors({
		"origin": process.env.CORS_ORIGIN,
		"methods": ALLOWED_METHODS.join(",")
	}));
	
	server.use(function(err, req, res, _next) {
		console.log('Error handler:', err);
		if(err instanceof require('express-ipfilter').IpDeniedError){
				res.status(401).send("⛔️ No estás autorizado para acceder aquí.");
		}else{
				res.status(err.status || 500).end("⚠️ Ocurrió un error inesperado, por favor contacte al administrador.");
		}
	});

	server.use(function(req, res, next) {
		req.log = log.child({reqId: uuidV1()});
		next();
	});

};
