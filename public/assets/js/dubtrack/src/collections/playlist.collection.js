Dubtrack.Collection.Playlist = Backbone.Collection.extend({
	url: Dubtrack.config.apiUrl + Dubtrack.config.urls.playlist,

	model: Dubtrack.Model.Playlist
});

// --------------------------------------------------------------------