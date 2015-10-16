Dubtrack.Model.Room = Backbone.Model.extend({
	urlRoot: Dubtrack.config.apiUrl + Dubtrack.config.urls.room,

	defaults:{
		name:  null,
		description: null,
		roomUrl: null,
		status: null,
		roomType: null,
		lockQueue: false,
		isPublic: null,
		lang: null,
		musicType: null,
		metaDescription: null,
		welcomeMessage: null,
		password: null,
		activeUsers: 0,
		allowedDjs: null,
		currentSong: null,
		realTimeChannel : null,
		maxLengthSong: null,
		displayQueue: null,
		background: null,
		roomEmbed: null,
		created: null,
		updated: null,
		userid: null
	}
});

Dubtrack.Model.UserQueue = Backbone.Model.extend({
	defaults: {
		songLength: Number,
		isActive: Boolean,
		isPlayed: Boolean,
		skipped: Boolean,
		created: Number,
		played: Number,
		updubs: Number,
		downdubs: Number,
		order: Number,
		songid: String,
		roomid: String,
		userid: String
	}
});

Dubtrack.Model.ActiveQueue = Backbone.Model.extend({
	defaults : {
		song: null,
		songInfo: null,
		user: null,
		startTime: null
	}
});

Dubtrack.Model.RoomActiveQueue = Backbone.Model.extend({
	defaults : {
		active: null,
		dubs: null,
		ip: null,
		playedCount: null,
		roomid: null,
		skippedCount: null,
		songsInQueue: null,
		updated: null,
		userid: null,
	}
});
