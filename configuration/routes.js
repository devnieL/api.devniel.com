import Authentication from './../controllers/Authentication';

module.exports = function(server) {

	server.get('/version', function(req, res){
        return res.json({
            version: global.version,
            env: process.env.NODE_ENV
        });
    });

    // Authentication
    server.post('/authentication', Authentication.signin);

};