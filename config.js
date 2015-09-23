var config = {
	secret: process.env.SESSION_SECRET ? process.env.SESSION_SECRET : 'P6rG9CEbpIxtSU64o4fDgrN7j5cu6Thh',
	port: process.env.PORT ? process.env.PORT : '3005',
	api_url: process.env.API_URL ? process.env.API_URL : 'http://staging-api.dubtrack.fm'
};

exports.config = config;
