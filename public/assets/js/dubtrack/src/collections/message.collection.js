Dubtrack.Collection.Message = Backbone.Collection.extend({
	url: Dubtrack.config.apiUrl + Dubtrack.config.urls.messages,
	model: Dubtrack.Model.Message
});

Dubtrack.Collection.MessageItem = Backbone.Collection.extend({
	url: Dubtrack.config.apiUrl + Dubtrack.config.urls.messages_items,
	model: Dubtrack.Model.MessageItem
});