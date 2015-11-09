Dubtrack.Model.Playlist = Backbone.Model.extend({
	urlRoot: Dubtrack.config.apiUrl + Dubtrack.config.urls.playlist,

	defaults:{
		name:  null,
		status: null,
		isPublic: false,
		created: null,
		userid: null
	}
});

Dubtrack.Model.SoundCloudPlaylist = Backbone.Model.extend({
	defaults:{
		description: null,
		genre: null,
		user_id: null,
		total_tracks: 0,
		title: null,
		permalink: null
	}
});
