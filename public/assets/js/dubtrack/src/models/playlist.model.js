Dubtrack.Model.Playlist = Backbone.Model.extend({
	urlRoot: Dubtrack.config.apiUrl + Dubtrack.config.urls.playlist,

	defaults:{
		name:  String,
		status: Number,
		isPublic: Boolean,
		created: Number,
		userid: String
	}
});