Dubtrack.Collection.Song = Backbone.Collection.extend({
	url: Dubtrack.config.apiUrl + Dubtrack.config.urls.song,

	model: Dubtrack.Model.Song
});