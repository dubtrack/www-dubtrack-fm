Dubtrack.View.RoomList = Backbone.View.extend({
	el : $('#room-list'),

	events  : {
		"keyup .room-lobby-header .room-search input": "triggerSearch",
		"click .room-lobby-header .create-room" : "createRoom"
	},

	initialize : function(){
		console.log("DUBTRACK displaying room list");

		//attach events to object
		this.model.bind("add", this.appendEl, this);
		this.model.bind("reset", this.render, this);

		this.roomListEl = this.$('#container-room-list');

		this.render();
	},

	render : function() {
		this.roomListEl.empty();

		// loop through each item
		_.each(this.model.models, function (item) {
			this.appendEl(item);
		}, this);

		//fetch user room collection
		Dubtrack.els.displayloading(dubtrack_lang.room.searching);

		return this;
	},

	fetchUserRooms: function(){},

	triggerSearch : function(e){
		var query = $.trim(this.$('.room-lobby-header .room-search input').val());

		if(this.searchTimeoutTrigger) clearTimeout(this.searchTimeoutTrigger);

		if(query && query !== "" && query !== null && query.length > 2){
			this.searchTimeoutTrigger = setTimeout(function(){
				this.search(query);
			}.bind(this), 700);
		}else if(query.length === 0){
			this.searchTimeoutTrigger = setTimeout(function(){
				this.search("");
			}.bind(this), 300);
		}
	},

	search : function(query){
		//display loading
		Dubtrack.els.displayloading(dubtrack_lang.room.searching);

		if(this.userRoomsCollection) this.userRoomsCollection.reset();
		this.model.reset();

		this.roomListEl.empty();

		this.userRoomsCollection = new Dubtrack.Collection.Room();

		if(query.length > 0) this.userRoomsCollection.url = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomSearch.replace(':term', query.replace(/[^a-zA-Z 0-9]+/g,''));
		else this.userRoomsCollection.url = Dubtrack.config.apiUrl + Dubtrack.config.urls.room;

		this.userRoomsCollection.fetch({
			success: function(){
				_.each(this.userRoomsCollection.models, function(roomModel){
					this.model.add(roomModel);
				}.bind(this));

				Dubtrack.els.mainLoading.hide();
			}.bind(this),

			error: function(){
				Dubtrack.els.mainLoading.hide();
			}
		});
	},

	createRoom: function(){
		if(!Dubtrack.loggedIn){
			Dubtrack.app.navigate('/login', {
				trigger: true
			});
		}else{
			var model = new Dubtrack.Model.Room();

			model.parse = Dubtrack.helpers.parse;

			this.roomUpdate = new dt.room.roomFormUpdateViewUpdate({model : model}).render();
			this.roomUpdate.$el.appendTo( 'body' );
		}

		return false;
	},

	appendEl : function(item){
		//append element
		var itemViewEl = new Dubtrack.View.RoomListItem({
			model: item
		}).render();

		if( Dubtrack.loggedIn && item.get("userid") == Dubtrack.session.id ){
			itemViewEl.$el.addClass("userRoom").prependTo( this.roomListEl );
		}else{
			itemViewEl.$el.appendTo( this.roomListEl );
		}
	},

	beforeClose : function(){
	}
});
