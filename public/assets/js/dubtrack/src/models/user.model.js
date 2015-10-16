Dubtrack.Model.User = Backbone.Model.extend({
	urlRoot: Dubtrack.config.apiUrl + Dubtrack.config.urls.user,

	defaults: {
		username: null,
		status: 0,
		roleid: null,
		dubs: 0,
		created: 0,
		lastLogin: 0,
		userInfo: {}
	},
});

Dubtrack.Model.RoomUser = Backbone.Model.extend({
	defaults: {
		updated: Number,
		skippedCount: Number,
		playedCount: Number,
		songsInQueue: Number,
		active: Boolean,
		dubs: Number,
		user: null,
		roomid: String,
		userid: String
	},

	comparator : function(user){
		return - ( parseInt( user.get('dubs'), 10 ) );
	}
});

Dubtrack.Model.UserFollowing = Backbone.Model.extend({
	defaults:{
		userid: String,
		following: String,
		created: Number,
	}
});
