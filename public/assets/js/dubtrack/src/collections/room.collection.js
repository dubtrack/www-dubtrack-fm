Dubtrack.Collection.Room = Backbone.Collection.extend({
	url: Dubtrack.config.apiUrl + Dubtrack.config.urls.room,
	
	model: Dubtrack.Model.Room
});

Dubtrack.Collection.RoomUser = Backbone.Collection.extend({
	model: Dubtrack.Model.RoomUser
});

Dubtrack.Collection.UserQueue = Backbone.Collection.extend({
	model: Dubtrack.Model.UserQueue
});

Dubtrack.Collection.RoomActiveQueue = Backbone.Collection.extend({
	model: Dubtrack.Model.RoomActiveQueue
});
