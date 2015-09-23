Dubtrack.cache = {
	users: {
		collection: new Dubtrack.Collection.User(),

		get: function(id, callback, ctx){
			if(typeof callback !== "function") throw new Error("DT Cache user collection callback has to be a function");
			if(!ctx) ctx = this;

			var user = Dubtrack.cache.users.collection.get(id);

			if(user) return callback.call(ctx, null, user);

			user = new Dubtrack.Model.User({
				_id: id
			});
			
			user.parse = Dubtrack.helpers.parse;

			user.fetch({
				success: function(){
					Dubtrack.cache.users.collection.add(user);

					callback.call(ctx, null, user);
				},

				error: function(){
					callback.call(ctx, true, null);
				}
			});

		},

		getByUsername: function(username, callback, ctx){
			var user = Dubtrack.cache.users.collection.findWhere({
				username: username
			});

			if(user) return callback.call(ctx, null, user);

			Dubtrack.cache.users.get(username, callback, ctx);
		},

		add: function(userObject){
			var userModel = new Dubtrack.Model.User( userObject );

			Dubtrack.cache.users.collection.add(userModel);

			return userModel;
		}
	},

	songs: {
		collection: new Dubtrack.Collection.Song(),

		get: function(id, callback, ctx){
			if(typeof callback !== "function") throw new Error("DT Cache song collection callback has to be a function");
			if(!ctx) ctx = this;

			var song = Dubtrack.cache.songs.collection.get(id);

			if(song) return callback.call(ctx, null, song);

			song = new Dubtrack.Model.Song({
				_id: id
			});
			
			song.parse = Dubtrack.helpers.parse;

			song.fetch({
				success: function(){
					Dubtrack.cache.songs.collection.add(song);

					callback.call(ctx, null, song);
				}
			});

		},

		add: function(songObject){
			var songModel = new Dubtrack.Model.Song( songObject );

			Dubtrack.cache.songs.collection.add(songModel);

			return songModel;
		}
	}
};