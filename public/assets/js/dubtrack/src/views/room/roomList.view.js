Dubtrack.View.RoomList = Backbone.View.extend({
	el : $('#room-list'),
	
	events  : {
		"keydown input#search_rooms": "search",
		"click button.create": "createRoom"
	},
	
	initialize : function(){
		console.log("DUBTRACK displaying room list");
		
		//attach events to object
		this.model.bind("add", this.appendEl, this);
		this.model.bind("reset", this.render, this);
		
		this.roomListEl = this.$('#container-room-list');
		
		//this.fetchUserRooms();
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

	fetchUserRooms: function(){
		if(Dubtrack.loggedIn){
			if(!this.userRoomsCollection){
				var self = this;

				this.userRoomsCollection = new Dubtrack.Collection.Room();
				
				this.userRoomsCollection.fetch({
					data: {
						userid: Dubtrack.session.id
					},
					success: function(){
						_.each(self.userRoomsCollection.models, function(roomModel){
							self.model.add(roomModel);
						});
					}
				});
			}else{
				_.each(this.userRoomsCollection.models, function(roomModel){
					this.model.add(roomModel);
				}, this);
			}
		}
	},
	
	search : function(e){
		
		var self = this;
		c = e.which ? e.which : e.keyCode;
		if (c == 13 || ! $(e.target).hasValue() ){
			//display loading
			dubtrackMain.elements.displayloading(dubtrack_lang.room.searching);
			
			//clear container
			self.roomListEl.html('');
			
			var term = e.target.value;
			dubtrackMain.app.roomListCollection.url = dubtrackMain.config.roomListUrl + "/term/" + escape( term.replace(/[^a-zA-Z 0-9]+/g,'') ); 
			dubtrackMain.app.roomListCollection.fetch({ data : { 'term' : term}, success : function(){
				//hide loading
				dubtrackMain.elements.mainLoading.hide();
			} });
		}
	
	},
	 
	createRoom : function(){
		if(dubtrackMain.user.loggedIn) dubtrackMain.app.createRoom();
		else{
			dubtrackMain.helpers.flashLogin();
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