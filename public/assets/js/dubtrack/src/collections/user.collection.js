Dubtrack.Collection.User = Backbone.Collection.extend({
	model: Dubtrack.Model.User,

	comparator: function(user){
		return user.get('dubs') * -1;
	}
});

Dubtrack.Collection.UserFollowing = Backbone.Collection.extend({
	model: Dubtrack.Model.UserFollowing
});