Dubtrack.Collection.Dubs = Backbone.Collection.extend({
	url: Dubtrack.config.apiUrl + Dubtrack.config.urls.dubs,
	model: Dubtrack.Model.Dubs
});
