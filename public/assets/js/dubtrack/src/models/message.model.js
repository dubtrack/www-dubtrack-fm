Dubtrack.Model.Message = Backbone.Model.extend({
	defaults: {
		created: "",
		name: "",
		latest_message: "",
		latest_message_str: "",
		updateItemRead : [],
		usersid: []
	}
});

Dubtrack.Model.MessageItem = Backbone.Model.extend({
	defaults: {
		created: '',
		message: '',
		userid: '',
		messageid: '',
		_message: {},
		_user: {}
	}
});