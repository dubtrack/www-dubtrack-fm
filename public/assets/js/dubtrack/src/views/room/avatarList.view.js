Dubtrack.View.roomUsersItem = Backbone.View.extend({
	tagName: 'li',
	
	events: {
		//"click": "clickEvent",
		//"click a.navigate": "clickEvent"
	},
	
	initialize: function(){
		this.$el.attr({
			'rel' : this.model.get('dubs'),
		});

        this.model.bind("reset", this.render, this);

        //realtime events
        Dubtrack.Events.bind('realtime:user_update_' + this.model.get("userid"), this.dubUpdate, this);
        Dubtrack.Events.bind('realtime:user-update-' + this.model.get("userid"), this.updateImage, this);
	},

	render: function(){
		//render item based on template
		this.$el.html(  _.template( Dubtrack.els.templates.rooms.avatarsContainerItem, this.model.toJSON() ));

		this.pictureEl = this.$('.picture');
		this.usernameEl = this.$('p.username');
		
		/*$diff_time = this.model.get("diff_mins");
		
		if($diff_time){
			if( parseInt($diff_time) > 40 ){
				this.$el.addClass('inactive');
			}
		}*/

		var user = this.model.get("_user");

		if( Dubtrack.helpers.isDubtrackAdmin(this.model.get("userid")) ){
			this.$el.addClass('admin');
		}

		if( this.model.get("userid") == Dubtrack.room.model.get('userid')){
			this.$el.addClass('creator');
		}

		if( this.model.get("roleid") == "52d1ce33c38a06510c000001"){
			this.$el.addClass('mod');
		}

		//set current DJ
		var currentUserDJ = Dubtrack.room.player.activeSong.get('user');
		if( currentUserDJ && currentUserDJ.id == this.model.get('userid')){
			this.$el.addClass('currentDJ');
		}

		if(!user || typeof user !== "object") Dubtrack.cache.users.get(this.model.get("userid"), this.renderUser, this);
		else{
			var userModel = Dubtrack.cache.users.add(user);
			
			this.renderUser(null, userModel);
		}

		return this;
	},

	updateImage: function(r){
		if(r && r.img && r.img.url){
			this.$('.picture img').attr('src', r.img.url);
		}
	},

	dubUpdate: function(r){
		this.$('.dubs span').html(r.user.dubs);
	},

	renderUser: function(err, user){
		this.user = user;
		this.usernameEl.html( user.get("username") );

		var userInfo = user.get('userInfo');

		//display user image
		this.pictureEl.html( Dubtrack.helpers.image.getImage(user.id, user.get("username"), false, true));

		//set username for search
		this.$el.addClass('user-' + this.user.get('username').toLowerCase());
	},

	clickEvent: function(){
		Dubtrack.app.navigate("/" + this.model.get('username'), {trigger: true});
		return false;
	},
	
	setOffline: function(){
		this.$el.append( $('<div/>', {'class' : 'offline'}).html( dubtrack_lang.avatar.offline ) );
	}
});