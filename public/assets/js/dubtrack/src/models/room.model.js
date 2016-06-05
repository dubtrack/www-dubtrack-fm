Dubtrack.Model.Room = Backbone.Model.extend({
	urlRoot: Dubtrack.config.apiUrl + Dubtrack.config.urls.room,

	defaults:{
		name:  null,
		roomDisplay: 'public',
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
		timeSongQueueRepeat : 120,
		displayDJinQueue: true,
		displayUserJoin: null,
		displayUserLeave: null,
		displayUserGrab: null,
		maxSongQueueLength : 0,
		limitQueueLength : null,
		recycleDJ: true,
		maxLengthSong: 120,
		displayQueue: null,
		background: null,
		roomEmbed: null,
		created: null,
		updated: null,
		userid: null,
		displayInSearch: true,
		displayInLobby: true
	}
});

Dubtrack.Model.UserQueue = Backbone.Model.extend({
	defaults: {
		songLength: 0,
		isActive: false,
		isPlayed: false,
		skipped: false,
		created: 0,
		played: 0,
		updubs: 0,
		downdubs: 0,
		grabs: 0,
		order: 0,
		songid: null,
		roomid: null,
		userid: null
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
