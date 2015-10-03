var config = require('./config').config,
express = require('express'),
session = require('express-session'),
morgan = require('morgan'),
http = require('http'),
path = require('path'),
engine = require('ejs-locals'),
routes = require('./routes/index.js'),
app = express();

app.use(morgan('common'));
app.set('port', config.port);
app.use(express.compress());

//use ejs-locals for all ejs templates:
app.engine('ejs', engine);
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(express.cookieParser(config.secret));
app.use(session({
	secret: config.secret,
	resave: true,
	saveUninitialized: true,
	cookie: {
		path: '/',
		domain: 'dubtrack.fm',
		httpOnly: process.env.ENV == 'production' ? true : false,
		maxAge : 172800000
	}
}));

app.use(function(req, res, next){
	if(process.env.ENV == 'production'){
		res.header('Content-Security-Policy', "default-src www.dubtrack.fm www.youtube.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.pubnub.com https://use.typekit.net https://content.jwplatform.com https://www.google.com https://mediadubtrackfm.s3.amazonaws.com https://cdn.pubnub.com https://www.google.com https://content.jwplatform.com https://use.typekit.net https://ssl.google-analytics.com/ga.js https://*.youtube.com *.ytimg.com *.jwpsrv.com *.jwpcdn.com; connect-src 'self' https://*.pubnub.com https://*.dubtrack.fm https://*.sndcdn.com; img-src 'self' *; style-src 'self' 'unsafe-inline' https://mediadubtrackfm.s3.amazonaws.com https://mediadubtrackfm.s3.amazonaws.com https://use.typekit.net; font-src 'self' https://mediadubtrackfm.s3.amazonaws.com data:; media-src api.soundcloud.com *.dubtrack.fm *.sndcdn.com;");
		
		if (req.headers['x-forwarded-proto'] == 'https') {
			next();
		} else {
			res.redirect('https://' + req.headers.host + req.path);
		}
	}else{
		next();
	}
});

app.use(app.router);

app.use(function(req, res, next){
	throw new Error(req.url + ' not found');
});

app.use(function(err, req, res, next){
	res.status(404);

	routes.index(req, res);
	//api.sendResponse(res, 404);
});

//Base route
app.get('/', routes.index);
app.get('/:id', routes.index);
app.get('/home', routes.index);
app.get('/browser', routes.index);
app.get('/browser/:id', routes.index);
app.get('/browser/user/:id', routes.index);
app.get('/join/:url', routes.index);

app.get('/login/facebook', function(req, res){
	res.redirect(config.api_url + '/auth/facebook');
});
app.get('/login/twitter', function(req, res){
	res.redirect(config.api_url + '/auth/twitter');
});
app.get('/login/logout', function(req, res){
	res.redirect(config.api_url + '/auth/logout');
});

//Global route handler
app.all('/*', routes.global);

//Global route handlers (method specific)
app.get('/*', routes.globalGet);
app.post('/*', routes.globalPost);
app.put('/*', routes.globalPut);
app.delete('/*', routes.globalDelete);

var server = app.listen(app.get('port'), function(){
	console.log('Listening on port %d', server.address().port);
});

process.on('message', function(msg) {
	if (msg == 'shutdown') {
		console.log('Gracefully shutting down app');

		server.close();
		process.exit(0);
	}
});
