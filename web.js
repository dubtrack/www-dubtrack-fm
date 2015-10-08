var config = require('./config').config,
express = require('express'),
morgan = require('morgan'),
http = require('http'),
path = require('path'),
engine = require('ejs-locals'),
routes = require('./routes/index.js'),
app = express();

app.use(helmet.xssFilter());
app.use(helmet());

app.use(morgan('common'));
app.set('port', config.port);
app.use(express.compress());

//use ejs-locals for all ejs templates:
app.engine('ejs', engine);
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(function(req, res, next){
	if(process.env.ENV == 'production'){
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
