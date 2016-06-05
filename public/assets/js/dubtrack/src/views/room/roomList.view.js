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

		this.$('#room-scroll-container').perfectScrollbar({
			suppressScrollX: true,
			wheelPropagation: false,
			minScrollbarLength: 40
		});

		this.$('#room-scroll-container').on('ps-scroll-down', function (e) {
			if(!e || !e.target) return;

			if (e.target.scrollHeight - (e.target.scrollTop + e.target.offsetHeight) < (e.target.offsetHeight * 2)) {
				this.loadMoreItems();
			}
		}.bind(this));

		this.render();
	},

	render : function() {
		this.roomListEl.empty();

		this.offsetSearchItems = 0;
		this.moreItemsToLoad = false;
		this.loadingMoreItems = false;

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

	loadMoreItems : function(){
		if(this.loadingMoreItems || !Dubtrack.roomList.collection) return;

		this.loadingMoreItems = true;

		var collection = new Dubtrack.Collection.Room();
		if(this.query && this.query.length > 0) collection.url = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomSearch.replace(':term', this.query.replace(/[^a-zA-Z 0-9]+/g,''));
		else collection.url = Dubtrack.config.apiUrl + Dubtrack.config.urls.room;

		//display loading
		Dubtrack.els.displayloading(dubtrack_lang.room.searching);
		this.offsetSearchItems = this.offsetSearchItems + 20;

		collection.fetch({
			data: {
				offset : this.offsetSearchItems
			},
			success: function(){
				_.each(collection.models, function(roomModel){
					this.model.add(roomModel);
				}.bind(this));

				Dubtrack.els.mainLoading.hide();
				this.loadingMoreItems = false;
			}.bind(this),

			error: function(){
				this.loadingMoreItems = false;

				Dubtrack.els.mainLoading.hide();
			}.bind(this)
		});
	},

	search : function(query){
		if(this.loadingMoreItems) return;
		this.$('#room-scroll-container').scrollTop(0);

		//display loading
		Dubtrack.els.displayloading(dubtrack_lang.room.searching);

		this.offsetSearchItems = 0;
		this.moreItemsToLoad = false;

		if(this.userRoomsCollection) this.userRoomsCollection.reset();
		this.model.reset();

		this.roomListEl.empty();

		this.userRoomsCollection = new Dubtrack.Collection.Room();
		this.query = query;

		if(this.query && this.query.length > 0) this.userRoomsCollection.url = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomSearch.replace(':term', this.query.replace(/[^a-zA-Z 0-9]+/g,''));
		else this.userRoomsCollection.url = Dubtrack.config.apiUrl + Dubtrack.config.urls.room;

		this.userRoomsCollection.fetch({
			success: function(){
				_.each(this.userRoomsCollection.models, function(roomModel){
					this.model.add(roomModel);
				}.bind(this));

				Dubtrack.els.mainLoading.hide();
				this.loadingMoreItems = false;
			}.bind(this),

			error: function(){
				this.loadingMoreItems = false;

				Dubtrack.els.mainLoading.hide();
			}.bind(this)
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

		this.$('#room-scroll-container').perfectScrollbar('update');
	},

	beforeClose : function(){
	}
});
