Dubtrack.View.BrowserPlaylistList = Backbone.View.extend({
	initialize : function(){
		this.prependItems = false;
		this.moreItemsToLoad = true;
		this.checkItemsOrder = true;
		this.removeOnFetch = true;
		this.currentPage = 1;
		this.loadingMoreItems = false;
		this.paginationDisabled = true;

		//attach events to object
		this.listenTo(this.model, "add", this.addItem, this);
		this.listenTo(this.model, "remove", this.removeItem, this);
		this.listenTo(this.model, "change", this.updateItem, this);
		this.listenTo(this.model, "reset", this.resetItems, this);

		this.setSortable();
	},

	setSortable : function(){
		if(this.url_queue_order && this.url_queue_order_data){
			this.$el.multisortable({
				axis: "y",
				cursor: "move",
				placeholder: "ui-state-highlight",

				update: function(event, ui){
					order = [];
					this.$('li').each(function(idx, elm) {
						console.log($(elm));
						order.push($(elm).attr(this.url_queue_order_data));
					}.bind(this));
					console.log(order, this.url_queue_order);
					Dubtrack.helpers.sendRequest( this.url_queue_order, {
						'order[]' : order
					}, 'post');
				}.bind(this)
			});
		}
	},

	setBrowser : function(browser){
		this.browser = browser;

		return this;
	},

	resetItems : function(model){
		this.$('li').remove();
	},

	addItem : function(model){
	},

	updateItem : function(model){
	},

	removeItem : function(model){
		var view = model.get('browserView');
		if(view) view.remove();
	},

	fetchItemsTimeout : function(callback){
		if(this.fetchItemsTimeoutID) clearTimeout(this.fetchItemsTimeoutID);

		this.fetchItemsTimeoutID = setTimeout(function(){
			this.fetchItems();
		}.bind(this), 500);
	},

	getFetchData : function() {
		return {};
	},

	fetchItems : function(callback){
		if((this.moreItemsToLoad || this.paginationDisabled) && !this.loadingMoreItems){
			this.moreItemsToLoad = false;
			this.loadingMoreItems = true;

			this.browser.loadingEl.show();

			this.model.fetch({
				data: this.getFetchData(),
				remove: this.removeOnFetch,
				success : function(model, data){
					this.loadingMoreItems = false;

					this.moreItemsToLoadTimeout = setTimeout(function(){
						if(data && data.data && data.data.length >= 20){
							this.moreItemsToLoad = true;
							this.currentPage++;
						}
					}.bind(this), 500);

					//hide loading
					this.browser.loadingEl.hide();

					if(data && data.data && this.checkItemsOrder){
						_.each(data.data, function(item, position){
							var model = this.model.findWhere({
								_id: item._id
							});

							if(model){
								var view = model.get('browserView'),
									id = model.get('_id');

								if(view){
									 if(position != view.index()){
										 view.insertBefore(this.$('li:eq(' + position + ')'));
									 }
								 }
							}
						}.bind(this));
					}
					if(callback) {
						try{
							callback.call();
						}catch(ex){}
					}
				}.bind(this),

				error: function(){
					//hide loading
					this.browser.loadingEl.hide();
					this.loadingMoreItems = false;
				}.bind(this)
			});
		}
	},

	beforeClose: function(){
		try{
			Dubtrack.Events.unbind(null, null, this);

			if(this.url_queue_order) this.$el.multisortable('destroy');
		}catch(ex){
			console.log('ERROR!!', ex);
		}
	}
});

Dubtrack.View.BrowserRoomQueuePlaylistList = Dubtrack.View.BrowserPlaylistList.extend({
	initialize : function(){
		Dubtrack.View.BrowserPlaylistList.prototype.initialize.call(this);

		Dubtrack.Events.bind('realtime:room_playlist-update', this.fetchItemsTimeout, this);
		Dubtrack.Events.bind('realtime:room_playlist-queue-update', this.fetchItemsTimeout, this);
		Dubtrack.Events.bind('realtime:room_playlist-queue-reorder', this.fetchItemsTimeout, this);
	},

	addItem : function(model){
		var itemViewEl = new Dubtrack.View.BrowserRoomQueuePlaylisttItem()
		.fetchSong(model)
		.setBrowser(this.browser)
		.$el
		.appendTo(this.$el);

		model.set({
			"browserView": itemViewEl
		});
	}
});

Dubtrack.View.BrowserHistoryPlaylistList = Dubtrack.View.BrowserPlaylistList.extend({
	initialize : function(){
		Dubtrack.View.BrowserPlaylistList.prototype.initialize.call(this);

		Dubtrack.Events.bind('realtime:room_playlist-update', this.syncHistoryItemsTimeout, this);

		this.checkItemsOrder = false;
		this.removeOnFetch = false;
		this.paginationDisabled = false;
		this.searchString = '';
	},

	syncHistoryItemsTimeout : function(callback){
		if(this.syncHistoryItemsTimeoutID) clearTimeout(this.syncHistoryItemsTimeoutID);

		this.syncHistoryItemsTimeoutID = setTimeout(function(){
			this.syncHistoryItems();
		}.bind(this), 500);
	},

	syncHistoryItems : function(){
		Dubtrack.helpers.sendRequest(this.model.url, {}, 'get', function(err, data){
			if(err) return;

			if(data && data.data){
				_.each(data.data, function(item, position){
					var model = this.model.findWhere({
						_id: item._id
					});

					if(!model){
						this.prependItems = true;
						this.model.add(new Dubtrack.Model.UserQueue(item));
						this.prependItems = false;
					}
				}.bind(this));
			}
		}.bind(this));
	},

	addItem : function(model){
		var function_el = "appendTo";
		if(this.prependItems) function_el = "prependTo";

		var itemViewEl = new Dubtrack.View.BrowserPlaylisHistorytItemWithDescription()
		.fetchSong(model)
		.setBrowser(this.browser)
		.$el[function_el](this.$el);

		model.set({
			"browserView": itemViewEl
		});
	},

	getFetchData : function() {
		return {
			page : this.currentPage
		};
	}
});

Dubtrack.View.BrowserUserQueuePlaylistList = Dubtrack.View.BrowserPlaylistList.extend({
	initialize : function(){
		Dubtrack.View.BrowserPlaylistList.prototype.initialize.call(this);

		Dubtrack.Events.bind('realtime:room_playlist-update', this.fetchItemsTimeout, this);
		Dubtrack.Events.bind('realtime:room_playlist-queue-update', this.fetchItemsTimeout, this);
	},

	addItem : function(model){
		var itemViewEl = new Dubtrack.View.BrowserQueuePlaylisttItem()
		.fetchSong(model)
		.setBrowser(this.browser)
		.$el
		.appendTo(this.$el);

		model.set({
			"browserView": itemViewEl
		});
	}
});

Dubtrack.View.BrowserUserPlaylistList = Dubtrack.View.BrowserPlaylistList.extend({
	initialize : function(){
		Dubtrack.View.BrowserPlaylistList.prototype.initialize.call(this);

		this.checkItemsOrder = false;
		this.removeOnFetch = false;
		this.paginationDisabled = false;
		this.searchString = '';
	},

	addItem : function(model){
		var itemViewEl = new Dubtrack.View.BrowserPlaylisUserPlaylisttItem()
		.fetchSong(model)
		.setBrowser(this.browser)
		.$el
		.appendTo(this.$el);

		model.set({
			"browserView": itemViewEl
		});
	},

	getFetchData : function() {
		return {
			name : this.searchString,
			page : this.currentPage
		};
	}
});
