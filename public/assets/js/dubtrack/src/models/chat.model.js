Dubtrack.Model.chat = Backbone.Model.extend({
	urlRoot: Dubtrack.config.apiUrl + Dubtrack.config.urls.chat,

	defaults: {
		message: null,
		type: null,
		chatid: null
	},

	parse: function(response, xhr){
		return response.data;
	}
});
