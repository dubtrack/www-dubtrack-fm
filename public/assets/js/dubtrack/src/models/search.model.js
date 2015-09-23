Dubtrack.Model.Search = Backbone.Model.extend({
	urlRoot: Dubtrack.config.apiUrl + Dubtrack.config.urls.search,

	parse: Dubtrack.helpers.parse,

	defaults: {
		activeUsers: 0
	}
});