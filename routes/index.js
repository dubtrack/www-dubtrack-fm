var app,
api,
config = require('../config').config;

/**
* GLOBAL Operations
*/
exports.global = function(req, res, next){
	next();
};


/**
* GET Operations
*/
exports.globalGet = function(req, res, next){
	next();
};

exports.index = function(req, res){
	var viewVars = {
		'cache_busting': 13232234326609712,
		'api_url': config.api_url
	};

	res.removeHeader('X-Powered-By');
	res.header('X-Powered-By', 'DUBTRACK-FM');
	res.header('Cache-Control', 'public; max-age=3153600');

	//get tomorrow's date
	var currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
	res.header('Expires', currentDate);

	res.render('home', viewVars);
};


/**
* POST Operations
*/
exports.globalPost = function(req, res, next){
	next();
};


/**
* PUT Operations
*/
exports.globalPut = function(req, res, next){
	next();
};


/**
* DELETE Operations
*/
exports.globalDelete = function(req, res, next){
	next();
};
