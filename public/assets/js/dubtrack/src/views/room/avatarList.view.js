Dubtrack.View.roomUsersItem = Backbone.View.extend({
	tagName: 'li',

	events: {
		"click": "clickEvent",
	},

	initialize: function(){
		this.$el.attr({
			'rel' : this.model.get('dubs'),
		});

		this.model.bind("reset", this.render, this);

		//realtime events
		Dubtrack.Events.bind('realtime:user_update_' + this.model.get("userid"), this.dubUpdate, this);
	},

	render: function(){
		//render item based on template
		this.$el.html(  _.template( Dubtrack.els.templates.rooms.avatarsContainerItem, this.model.toJSON() ));

		this.pictureEl = this.$('.picture');
		this.usernameEl = this.$('p.username');

		var user = this.model.get("_user");

		if( Dubtrack.helpers.isDubtrackAdmin(this.model.get("userid")) ){
			this.$el.addClass('admin');
		}

		if( this.model.get("userid") == Dubtrack.room.model.get('userid')){
			this.$el.addClass('creator');
		}

		var role = this.model.get("roleid");
		if(role){
			this.$el.addClass(role.type);

			if(this.model.get("userid") == Dubtrack.session.id){
				if(Dubtrack.room && Dubtrack.room.player) Dubtrack.room.player.skipElBtn.show();

				if(Dubtrack.room.users.getIfOwner(this.model.get("userid"))){
					$("#main_player .edit-room").show();
				}else{
					$("#main_player .edit-room").hide();
				}
			}
		}

		//set current DJ
		if(Dubtrack.session && this.model.get("userid") == Dubtrack.session.id){
			var currentUserDJ = Dubtrack.room.player.activeSong.get('user');
			if( currentUserDJ && currentUserDJ.id == this.model.get('userid')){
				this.$el.addClass('currentDJ');

				if(Dubtrack.room && Dubtrack.room.player) Dubtrack.room.player.skipElBtn.show();
			}
		}

		if(!user || typeof user !== "object") Dubtrack.cache.users.get(this.model.get("userid"), this.renderUser, this);
		else{
			var userModel = Dubtrack.cache.users.add(user);

			this.renderUser(null, userModel);
		}

		return this;
	},

	dubUpdate: function(r){
		this.$('.dubs span').html(r.user.dubs);
	},

	renderUser: function(err, user){
		this.user = user;

		try{
			this.usernameEl.html( user.get("username") );

			var userInfo = user.get('userInfo');

			//set username for search
			this.$el.addClass('user-' + this.user.get('username').toLowerCase());
		}catch(ex){
			this.$el.remove();
		}
	},

	clickEvent: function(){
		Dubtrack.helpers.displayUser(this.user.get('_id'), this.$el);

		return false;
	},

	setOffline: function(){
		this.$el.append( $('<div/>', {
			'class' : 'offline'
		}).html( dubtrack_lang.avatar.offline ) );
	}
});
