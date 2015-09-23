Dubtrack.Model.User = Backbone.Model.extend({
	urlRoot: Dubtrack.config.apiUrl + Dubtrack.config.urls.user,

	defaults: {
		username: String,
		status: Number,
		roleid: Number,
		dubs: Number,
		created: Number,
		lastLogin: Number,
		userInfo: Object
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