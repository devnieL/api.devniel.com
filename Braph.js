var Braph  = require('braph').Braph;

var Braph = new Braph({
	id : process.env.BRAPH_ID,
	client_id : process.env.BRAPH_CLIENT_ID,
	client_secret : process.env.BRAPH_CLIENT_SECRET,
	api_url : process.env.BRAPH_API_URL
});

module.exports = Braph;