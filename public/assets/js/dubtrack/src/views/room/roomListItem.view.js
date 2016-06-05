Dubtrack.View.RoomListItem = Backbone.View.extend({
	tagName : 'section',

	events  : {
		"click a.join"	: "clickAction",
		"click .description" : "clickAction",
		"click .image"	: "clickAction",
		"click .navigate"	: "navigate"
	},

	initialize : function(){
		this.$el.addClass('room-item');
	},

	render : function(){

		//render item based on template
		var jsonModel = this.model.toJSON();
		this.$el.html( _.template( Dubtrack.els.templates.rooms.roomListItem, jsonModel) );

		/*$id = this.model.get('current_song_id');
		if( this.model.get('current_song_type') == "youtube" && $id != ""){
			$(this.el).find('.image').html('<img src="http://img.youtube.com/vi/' + $id + '/0.jpg" alt="" />');
		}*/

		if(dubtrackMain.roomModel){
			$id = dubtrackMain.roomModel.get('room.id');

			if($id && $id === this.model.get('id')){
				$(this.el).addClass('activeRoom');
			}
		}

		var user = this.model.get('_user');
		if(!user || typeof user !== "object"){
			Dubtrack.cache.users.get(this.model.get("userid"), this.renderUser, this);
		}else{
			//add user to cache
			Dubtrack.cache.users.add(user);

			user = new Dubtrack.Model.User( user );
			this.renderUser(null, user);
		}

		//return object
		return this;
	},

	renderUser: function(err, user){
		this.user = user;
		this.$('.user-info').show().find('a').attr( 'href', user.get("username") ).html( user.get("username") );

		var userInfo = user.get('userInfo');
	},

	clickAction : function(e){
		Dubtrack.app.navigate('/join/' + this.model.get('roomUrl'), {
			trigger : true
		});

		return false;
	},

	navigate : function(e){
		el = $(e.target);

		if( ! el.is('a') ){
			el = el.parents('a');
		}

		$href = el.attr("href");

		if($href){
			dubtrackMain.app.navigate($href, {
				trigger : true
			});
		}

		return false;
	}
});
