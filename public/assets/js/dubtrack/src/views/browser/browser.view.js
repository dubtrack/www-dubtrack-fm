dt.playlist.browserDocBind = false;
dt.playlist.previewEl = false;
Dubtrack.View.Browser = Backbone.View.extend({
	el: $('#browser'),

	events : {
		"click .close-browser": "hideBrowser",
		"click .sidebar .display-sidebar": "toggleSidebar",
		"click .sidebar .import-playlist": "displayImportView",
		"keydown input#youtube-search": "searchKeyUp",
		"click .music-type-select .music-type-dropdown .youtube-btn" : "setYoutube",
		"click .music-type-select .music-type-dropdown .icon-soundcloud" : "setSoundcloud",
		"click #searchBtnMain": "search",
		"click a.search-btn": "search",
		"click li.current_queue": "displayQueue",
		"click li.room_history": "displayHistory",
		"click li.current_room_queue": "displayRoomQueue",
		"click li.current_room_waitlist": "displayRoomWaitlist",
		"click li.my_tracks": "displayMyTracks",
		"click .create-playlist .create-playlist-display" : "createPlaylistDisplay",
		"click .create-playlist .create-playlist-form span": "createPlaylist",
		"keydown .create-playlist .create-playlist-form input": "createPlaylistInput",
	},

	initialize : function(){
		this.searchCollection = new Dubtrack.Collection.Song();
		this.searchCollection.parse = function(response, xhr){
			if(response.data.nextPageToken) this.nextPageToken = response.data.nextPageToken;

			return response.data.items;
		};
		this.historyCollection = new Dubtrack.Collection.UserQueue();
		this.userQueueCollection = new Dubtrack.Collection.UserQueue();
		this.userPlaylistCollection = new Dubtrack.Collection.UserQueue();

		this.browser_view_state = null;
		this.canCloseBrowser = false;

		$(window).bind('click.browser', function(e){
			$parents = $(e.target).parents('#browser');
			$parents_preview = $(e.target).parents('.playerPreview');

			if($parents.length === 0 && $parents_preview.length === 0 && this.canCloseBrowser){
				this.hideBrowser();
			}
		}.bind(this));

		this.render();
	},

	render : function(){
		this.$el.html( Dubtrack.els.templates.layout.browser ).show().addClass('animate');

		this.importPlaylistView = new Dubtrack.View.ImportPlaylistBrowser({
			el : this.$('#import-playlist-container')
		});

		this.importPlaylistView.setBrowser(this);

		this.playlistListContainer = this.$('ul.playlist-list');
		this.loadingEl = this.$('div.loading');
		this.playlistContainer = this.$('div#results_video_api');
		this.inputSearch = this.$("input#youtube-search");

		_.each(this.model.models, function (item) {
			this.appendEl(item);
		}, this);

		this.model.bind('add', this.appendEl, this);

		this.setYoutube();

		var self = this;
		if( ! dt.playlist.browserDocBind ){
			dt.playlist.browserDocBind = true;
		}

		$('#browser .content-videos, #playlists-scroll').perfectScrollbar({
			suppressScrollX: true,
			wheelPropagation: false,
			minScrollbarLength: 40
		});

		$('#browser .content-videos, #playlists-scroll').on('ps-scroll-y', function (e) {
			if(!e || !e.target) return;

			if (e.target.scrollHeight - (e.target.scrollTop + e.target.offsetHeight) < (e.target.offsetHeight * 2)) {
				this.scrollPlaylistItemsActionBottom()
			}
		}.bind(this));

		if(Dubtrack.playerController) Dubtrack.playerController.fetchQueueInfo();

		return this;
	},

	scrollPlaylistItemsActionBottom : function(){},

	displayImportView : function(){
		this.importPlaylistView.openView();

		return false;
	},

	toggleSidebar : function(){
		this.$el.toggleClass('display-browser-sidebar');

		return false;
	},

	createPlaylistDisplay : function(){
		this.$el.addClass('display-create-form');
		this.$('.create-playlist .create-playlist-form input').focus();

		return false;
	},

	createPlaylistInput: function(e){
		c = e.which ? e.which : e.keyCode;
		if (c === 13) this.createPlaylist();
	},

	createPlaylist: function(){
		var name = $.trim(this.$('.create-playlist input').val());
		if(name === "" || name === null) return;

		var playlistModel = new Dubtrack.Model.Playlist({
			name: name
		});
		playlistModel.parse = Dubtrack.helpers.parse;

		var self = this;
		playlistModel.save({},{
			success: function(){
				self.model.add(playlistModel);

				Dubtrack.app.navigate("/browser/user/" + playlistModel.id , {
					trigger : true
				});
			}
		});

		this.$('.create-playlist input').val('');
	},

	setDubtrack : function(){
		this.$find('.br-btn').removeClass('active');
		this.$('a#dubtrack-btn').addClass('active');

		return false;

	},

	setYoutube : function(){
		this.$('.music-type-select .current-music-type-selection i').attr('class', '').addClass('icon-youtube');
		this.searchType = "youtube";

		return false;
	},

	setSoundcloud : function(){
		this.$('.music-type-select .current-music-type-selection i').attr('class', '').addClass('icon-soundcloud');
		this.searchType = "soundcloud";

		return false;
	},

	searchKeyUp : function(e){
		c = e.which ? e.which : e.keyCode;
		if (c == 13){
			//window.location.hash = "#browser/search";
			this.search();
		}
	},

	search : function(){
		Dubtrack.app.navigate( "/browser/search" , { trigger : false });

		this.displayDetails("search", this.inputSearch.val() );

		return false;
	},

	displayQueue : function(){
		Dubtrack.app.navigate( "/browser/queue/" , { trigger : true });

		return false;
	},

	displayHistory : function(){
		Dubtrack.app.navigate( "/browser/history/" , { trigger : true });

		return false;
	},

	displayRoomQueue : function(){
		Dubtrack.app.navigate( "/browser/room-queue/" , { trigger : true });

		return false;
	},

	displayRoomWaitlist : function(){
		Dubtrack.app.navigate( "/browser/room-waitlist/" , { trigger : true });

		return false;
	},

	displayMyTracks : function(){
		dubtrackapp.navigate( "/browser/tracks/" , { trigger : true });

		return false;
	},

	sortableUpdate : function(event, ui){
		var order = [];
		this.playlistDetailContainer.children('li').each(function(idx, elm) {
			order.push(elm.getAttribute(this.url_queue_order_data));
			var $place = $(elm).children('.place');
			$place.attr('data-last', $place.html());
			$place.html(idx + 1);
		}.bind(this));

		Dubtrack.helpers.sendRequest( this.url_items_order, {
			'order[]' : order
		}, 'post', function(err) {
			if(!err) return;

			this.playlistDetailContainer.children('li').each(function(idx, elm) {
				var $place = $(elm).children('.place');
				$place.html($place.attr('data-last'));
			}.bind(this));
		});
	},

	displayDetails : function(display, id){
		this.loadingEl.show();

		this.randomize_items_url = null;

		this.canCloseBrowserTimeout = setTimeout(function(){
			this.canCloseBrowser = true;
		}.bind(this), 500);

		if(this.browserInfoEl) this.browserInfoEl.close();

		var self = this;
		//clear container
		this.playlistDetailContainer = $('<ul/>', {
			class: 'browserPlaylistItems'
		});

		this.scrollPlaylistItemsActionBottom = function(){};
		if(this.moreItemsToLoadTimeout) clearTimeout(this.moreItemsToLoadTimeout);

		if(this.browserItemsList) this.browserItemsList.close();
		this.playlistContainer.find(".timeago").timeago('dispose');
		this.playlistContainer.html( this.playlistDetailContainer );

		this.$('.content-videos').scrollTop(0);
		this.$('.content-videos').perfectScrollbar('update');
		this.$('#playlists-scroll .selected').removeClass('selected');
		this.$el.removeClass('display-create-form');
		this.$el.removeClass('display-browser-sidebar');

		this.browser_view_state = display;

		switch(display){
			case "user":
				$c = this.model.get(id);
				if($c) {
					this.browserInfoEl = new Dubtrack.View.BrowserPlaylistInfo({
						model : $c
					}).setBrowser(self).render('playlistInfo', this.userPlaylistCollection);
				} else {
					this.browserInfoEl = new Dubtrack.View.BrowserPlaylistInfo().setBrowser(self).render('playlistInfo', this.userPlaylistCollection);
					this.browserInfoEl.setName(dubtrack_lang.global.loading);
				}

				this.$('#playlists-scroll .playlist-' + id).addClass('selected');

				var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.playlistSong.replace( ":id", id ),
					url_items_order = Dubtrack.config.apiUrl + Dubtrack.config.urls.playlistOrder.replace( ":id", id ),
					randomize_items_url = Dubtrack.config.apiUrl + Dubtrack.config.urls.playlistRandomize.replace( ":id", id );

				this.url_items_order = url_items_order;
				this.randomize_items_url = randomize_items_url;
				this.userPlaylistCollection.reset();
				this.userPlaylistCollection.url = url;
				this.browserInfoEl.$el.prependTo( this.playlistContainer );

				this.browserItemsList = new Dubtrack.View.BrowserUserPlaylistList({
					model : this.userPlaylistCollection,
					el : this.playlistDetailContainer
				});
				this.browserItemsList.setBrowser(this);
				this.browserItemsList.url_queue_order = url_items_order;
				this.browserItemsList.url_queue_order_data = 'data-id';
				this.browserItemsList.setSortable();

				this.browserItemsList.fetchItems(function(){
					this.scrollPlaylistItemsActionBottom = function(){
						this.browserItemsList.fetchItems();
					}.bind(this);
				}.bind(this));

				break;

			case "search":
				if(id !== "" || id !== null){
					this.browserInfoEl = new Dubtrack.View.BrowserSearchInfo().render(id);
					this.browserInfoEl.$el.prependTo( this.playlistContainer );
					this.currentPage = 1;
					this.moreItemsToLoad = false;

					this.scrollPlaylistItemsActionBottom = function(){
						if(this.moreItemsToLoad && this.searchCollection.nextPageToken){
							this.moreItemsToLoad = false;
							this.loadingEl.show();

							Dubtrack.helpers.sendRequest(Dubtrack.config.apiUrl + Dubtrack.config.urls.song, {
								'name': id,
								'type': this.searchType,
								'details': 1,
								'nextPageToken' : this.searchCollection.nextPageToken
							}, 'get', function(err, res){
								this.loadingEl.hide();

								if(res && res.data && res.data.items && res.data.items.length > 1 && res.data.nextPageToken && res.data.nextPageToken != this.searchCollection.nextPageToken){
									this.searchCollection.nextPageToken = res.data.nextPageToken;

									_.each(res.data.items, function (data_item) {
										var item = new Dubtrack.Model.Song(data_item);

										var itemViewEl = new Dubtrack.View.BrowserPlaylistItem({
											model: item
										}).render('playlistSearchItem').$el.appendTo( this.playlistDetailContainer );

										item.set({
											"browserView": itemViewEl,
											"filterName": item.get("name")
										});

										this.searchCollection.add(item);
									}.bind(this));

									$('#browser .content-videos').perfectScrollbar('update');

									this.moreItemsToLoadTimeout = setTimeout(function(){
										this.moreItemsToLoad = true;
									}.bind(this), 1000);
								}
							}.bind(this));
						}
					}.bind(this);

					this.nextPageToken = null;
					this.searchCollection.reset();
					this.searchCollection.url = Dubtrack.config.apiUrl + Dubtrack.config.urls.song;
					this.searchCollection.fetch({
						data : {
							'name': id,
							'type': this.searchType,
							'details': 1,
							'nextPageToken' : ''
						},

						success : function(){
							_.each(self.searchCollection.models, function (item) {
								var itemViewEl = new Dubtrack.View.BrowserPlaylistItem({
									model: item
								}).render('playlistSearchItem').$el.appendTo( self.playlistDetailContainer );

								item.set({
									"browserView": itemViewEl,
									"filterName": item.get("name")
								});
							});

							if(self.searchCollection.models.length >= 15) self.moreItemsToLoad = true;

							$('#browser .content-videos').perfectScrollbar('update');

							//hide loading
							self.loadingEl.hide();
						},

						error: function(){
							//hide loading
							self.loadingEl.hide();
						}
					});
				}else{
					//this.playlistDetailContainer.html( $('<img/>', { 'src' : dubtrackMain.config.mediaBaseUrl + dubtrack_lang.playlist.instructions }) );
					this.loadingEl.hide();
				}

				break;

			case "history":
				this.browserInfoEl = new Dubtrack.View.BrowserHistoryInfo().render(this.historyCollection);
				this.browserInfoEl.$el.prependTo( this.playlistContainer );

				this.$('#playlists-scroll .room_history').addClass('selected');

				var urlHistory = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomHistory.replace( ":id", Dubtrack.room.model.get('_id') );
				this.historyCollection.url = urlHistory;
				this.historyCollection.reset();

				this.browserItemsList = new Dubtrack.View.BrowserHistoryPlaylistList({
					model : this.historyCollection,
					el : this.playlistDetailContainer
				});
				this.browserItemsList.setBrowser(this);
				this.browserItemsList.fetchItems(function(){
					this.scrollPlaylistItemsActionBottom = function(){
						this.browserItemsList.fetchItems();
					}.bind(this);
				}.bind(this));

				break;

			case "queue":
				$.ajax({
					url: Dubtrack.config.apiUrl + '/room/' + Dubtrack.room.model.get('_id') + '/users/' + Dubtrack.session.id,
					type: 'get'
				}).success(function(response){
					if(Dubtrack.room.users && response && response.data && response.data._user){

						var userQueueRooms = Dubtrack.room.users.collection.findWhere({
							"userid" : response.data.userid
						});

						if(userQueueRooms) {
							userQueueRooms.set(response.data);
						}
					}

					Dubtrack.room.player.displayQueueSongRealtimeUpdate();

					this.browserInfoEl = new Dubtrack.View.MyQueueInfo().setBrowser(self).render(this.userQueueCollection);
					this.browserInfoEl.$el.prependTo( this.playlistContainer );

					this.$('#playlists-scroll .current_queue').addClass('selected');

					var appendJoinRoomInfo = false;

					this.browserInfoEl.$el.removeClass('queue-join-info');

					if(Dubtrack.room.model.get('lockQueue')){
						if(Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || (Dubtrack.room.users && Dubtrack.room.users.getIfHasRole(Dubtrack.session.id))){
							if(Dubtrack.room.users.getIfQueueIsActive(Dubtrack.session.id)){
								$('<div/>').addClass('queue-join-info').text('You are not in the room queue, click here to join :]').appendTo( this.browserInfoEl.$el );
								this.browserInfoEl.$el.addClass('queue-info-contains-notice');
							}
						}
					}else{
						if(Dubtrack.session && Dubtrack.room && Dubtrack.room.users){
							if(Dubtrack.room.users.getIfQueueIsActive(Dubtrack.session.id) || (Dubtrack.room.users.getUserQueuedSongs(Dubtrack.session.id) == 0)){
								$('<div/>').addClass('queue-join-info').text('You are not in the room queue, click here to join :]').appendTo( this.browserInfoEl.$el );
								this.browserInfoEl.$el.addClass('queue-info-contains-notice');
							}
						}
					}

					if(Dubtrack.room && Dubtrack.room.model.get('lockQueue') && !(Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || (Dubtrack.room.users && Dubtrack.room.users.getIfHasRole(Dubtrack.session.id)))){
						//hide loading
						self.loadingEl.hide();

						$('<div/>').addClass('queue-locked-info').text('Queue is locked, but you can still enjoy the tunes in this room :]').appendTo( this.browserInfoEl.$el );
						this.browserInfoEl.$el.addClass('queue-info-contains-notice');
					}else{
						var urlQueue = Dubtrack.config.apiUrl + Dubtrack.config.urls.userQueue.replace( ":id", Dubtrack.room.model.get('_id') ),
							url_queue_order = Dubtrack.config.apiUrl + Dubtrack.config.urls.userQueueOrder.replace( ":id", Dubtrack.room.model.get('_id') );
						//var urlQueue = Dubtrack.config.apiUrl + Dubtrack.config.urls.userQueue.replace( ":id", "52b8afded008544e87000005" );
						this.userQueueCollection.url = urlQueue;
						this.url_items_order = url_queue_order;
						this.userQueueCollection.reset();

						this.browserItemsList = new Dubtrack.View.BrowserUserQueuePlaylistList({
							model : this.userQueueCollection,
							el : this.playlistDetailContainer
						});
						this.browserItemsList.setBrowser(this);
						this.browserItemsList.url_queue_order = url_queue_order;
						this.browserItemsList.url_queue_order_data = 'data-id';
						this.browserItemsList.setSortable();

						this.browserItemsList.fetchItems();
					}
				}.bind(this));

				break;

			case "room_waitlist":
				this.$('#playlists-scroll .current_room_waitlist').addClass('selected');

				var urlQueue = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomQueueWaitlist.replace( ":id", Dubtrack.room.model.get('_id') );

				this.url_items_order = false;
				this.userQueueCollection.url = urlQueue;
				this.userQueueCollection.reset();

				this.browserItemsList = new Dubtrack.View.BrowserRoomQueuePlaylistList({
					model : this.userQueueCollection,
					el : this.playlistDetailContainer
				});
				this.browserItemsList.setBrowser(this);

				this.browserItemsList.fetchItems(function(){
					if(Dubtrack.session && Dubtrack.room && Dubtrack.room.users && (Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || Dubtrack.room.users.getIfRoleHasPermission(Dubtrack.session.id, 'queue-order'))){
						this.browserInfoEl = new Dubtrack.View.RoomQueueInfo().setBrowser(this).render(this.userQueueCollection);
						this.browserInfoEl.$el.prependTo( this.playlistContainer );

						this.playlistDetailContainer.addClass('display-mod-controls');

						this.browserItemsList.url_queue_order = url_queue_order;
						this.browserItemsList.url_queue_order_data = 'data-userid';
						this.browserItemsList.setSortable();
					}else{
						this.playlistDetailContainer.removeClass('display-mod-controls');
					}
				}.bind(this));

				break;

			case "room_queue":
				this.$('#playlists-scroll .current_room_queue').addClass('selected');

				var urlQueue = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomQueueDetails.replace( ":id", Dubtrack.room.model.get('_id') ),
					url_queue_order = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomUserQueueOrder.replace( ":id", Dubtrack.room.model.get('_id') );

				this.url_items_order = url_queue_order;
				this.userQueueCollection.url = urlQueue;
				this.userQueueCollection.reset();

				this.browserItemsList = new Dubtrack.View.BrowserRoomQueuePlaylistList({
					model : this.userQueueCollection,
					el : this.playlistDetailContainer
				});
				this.browserItemsList.setBrowser(this);

				this.browserItemsList.fetchItems(function(){
					if(Dubtrack.session && Dubtrack.room && Dubtrack.room.users && (Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || Dubtrack.room.users.getIfRoleHasPermission(Dubtrack.session.id, 'queue-order'))){
						this.browserInfoEl = new Dubtrack.View.RoomQueueInfo().setBrowser(this).render(this.userQueueCollection);
						this.browserInfoEl.$el.prependTo( this.playlistContainer );

						this.playlistDetailContainer.addClass('display-mod-controls');

						this.browserItemsList.url_queue_order = url_queue_order;
						this.browserItemsList.url_queue_order_data = 'data-userid';
						this.browserItemsList.setSortable();
					}else{
						this.playlistDetailContainer.removeClass('display-mod-controls');
					}
				}.bind(this));

				break;

			default:
				this.loadingEl.hide();
				break;
		}
	},

	hideBrowser: function(){
		this.browser_view_state = null;
		if(this.canCloseBrowserTimeout) clearTimeout(this.canCloseBrowserTimeout);
		this.canCloseBrowser = false;

		$(".dubtrack_overlay").hide();

		this.$el.show().removeClass('animate');
		if(Dubtrack.room && Dubtrack.room.model){
			Dubtrack.app.navigate("/join/" + Dubtrack.room.model.get('roomUrl'), {
				trigger : true
			});
		}else{
			Dubtrack.app.navigate("/", {
				trigger : true
			});
		}

		return false;
	},

	displayBrowser: function(){
		this.browser_view_state = null;
		this.$el.addClass('animate');
		this.$("#youtube-search").val('').focus();
		$(".dubtrack_overlay").show();
	},

	beforeClose: function(){
		if(this.browserItemsList) this.browserItemsList.close();

		this.browser_view_state = null;

		try{
			this.playlistDetailContainer.multisortable('destroy');
		}catch(ex){}

		Dubtrack.app.navigate("/", {
			trigger: true
		});
	},

	appendEl: function(item){
		var itemViewEl = new Dubtrack.View.playlistItem({
			model: item
		}).render().$el.prependTo( this.playlistListContainer );
	}

});

Dubtrack.View.BrowserInfo = Backbone.View.extend({
	tagName : 'div',

	events : {
		"keyup input.editplaylist_name" : "updatePlaylistNameKeyup",
		"keyup input.playlist_filter": "filterPlaylist",
		"click .save-playlistname" : "updatePlaylistName",
		//"click a.playlist_type": "changePlaylistType",
		"click a.shuffle-playlist": "shufflePlaylist",
		"click a.delete-playlist": "removePlaylist",
		"click a.queue-playlist" : "queuePlaylist",
		"click .edit-playlist-name" : "togglePlaylistEdit",

		"click a.navigate": "navigate"
	},

	initialize : function(){
		this.$el.addClass('playlist_info');
	},

	render : function(template, collection){
		if(this.model) this.$el.html( _.template( Dubtrack.els.templates.playlist[template], this.model.toJSON()));
		this.collection = collection;

		this.aplaylist_typeEl = $(this.el).find('a.playlist_type');

		if(this.model) this.renderPlaylistType(this.model.get('playlist_type'));

		return this;
	},

	navigate : function(e){
		var el = $(e.target);

		$href = el.attr("href");

		if($href){
			dubtrackMain.app.navigate($href, {trigger : true});
		}

		return false;
	},

	queuePlaylist : function(){
		this.$('a.queue-playlist').text('loading....');
		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomQueuePlaylist.replace( ":playlistid", this.model.get('_id')).replace( ":id", Dubtrack.room.model.get('_id') );

		Dubtrack.helpers.sendRequest(url, {}, 'post', function(err){
			this.$('a.queue-playlist').text('Queue all');
		}.bind(this));

		return false;
	},

	renderPlaylistType : function(type){
		if(type == "public"){
			this.aplaylist_typeEl.removeClass('playlist_type_private').html( dubtrack_lang.global.publicStr );
			this.aplaylist_typeEl.append("<span>your playlist is viewable by everyone</span>");
		}else{
			this.aplaylist_typeEl.addClass('playlist_type_private').html( dubtrack_lang.global.privateStr );
			this.aplaylist_typeEl.append("<span>your playlist is only viewable by you</span>");
		}
	},

	filterPlaylist : function(e){
		var $value = e.target.value;

		if($value === "" || $value === " "){
			_.each(this.collection.models, function (item) {
				var view = item.get("browserView");
				view.show();
			}, this);
		}else{
			$value = $value.toLowerCase();
			_.each(this.collection.models, function (item) {
				var view = item.get("browserView");

				$name = item.get("filterName").toLowerCase();
				if($name.indexOf($value) === -1) view.hide();
				else view.show();
			}, this);
		}
	},

	togglePlaylistEdit : function(){
		this.$el.toggleClass('displayEdit');

		if(this.$el.hasClass('displayEdit')){
			this.$('input.editplaylist_name').focus();
		}

		return false;
	},

	updatePlaylistNameKeyup : function(e){
		c = e.which ? e.which : e.keyCode;
		if (c == 13){
			this.updatePlaylistName();
		}
	},

	updatePlaylistName : function(){
		var playlistName = this.$('input.editplaylist_name').val();

		if(playlistName && playlistName.length > 0){
			this.$el.removeClass('displayEdit');

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.playlistUpdate.replace( ":id", this.model.get('_id'));

			Dubtrack.helpers.sendRequest( url, {
				name : playlistName
			}, 'put', function(err){
			}.bind(this));

			var model = Dubtrack.app.browserView.model.findWhere({
				'_id' : this.model.get('_id')
			});

			if(model){
				model.set({
					name : playlistName
				});
			}
		}
	},

	setBrowser : function(browser){
		this.parent_browser = browser;
		return this;
	},

	shufflePlaylist : function(e){
		if(e) e.preventDefault();

		if(this.parent_browser){
			if(this.parent_browser.randomize_items_url){
				this.parent_browser.playlistDetailContainer.empty();
				this.parent_browser.loadingEl.show();

				Dubtrack.helpers.sendRequest(this.parent_browser.randomize_items_url, {}, 'post', function(err) {
					this.parent_browser.displayDetails("user", this.model.get('_id'));
				}.bind(this));
			}else{
				this.parent_browser.playlistDetailContainer.randomize('li.playlist-item');

				this.parent_browser.sortableUpdate();
			}
		}
	},

	removePlaylist : function(){
		var r = confirm(dubtrack_lang.playlist.removePlaylistConfirm);

		if(r){
			this.model.destroy();
			this.close();
		}

		this.parent_browser.playlistContainer.empty();

		Dubtrack.app.navigate("/browser/queue/" , {
			trigger: false
		});

		return false;
	},

	setName : function(title){
		this.aplaylist_typeEl.html(title);
	},

	changePlaylistType : function(){

		if(this.model) {
			var self = this;
			$type = this.model.get("type");
			this.aplaylist_typeEl.html( dubtrack_lang.global.loading );

			$.ajax({
				url:  dubtrackMain.config.changePlaylistType,
				data: {
					"idplaylist" : this.model.get('id'),
					"type" : $type
				},
				type: 'POST',
				success: function(response){
					if($type == "public"){
						self.model.set({"type" : "private"});
						self.renderPlaylistType("private");
					}else{
						self.model.set({"type" : "public"});
						self.renderPlaylistType("public");
					}
				},
				error: function(){
				}
			},"json");
		}

		return false;
	}
});

Dubtrack.View.BrowserPlaylistInfo = Dubtrack.View.BrowserInfo.extend({
	filterPlaylist : function(e){
		if(!this.parent_browser) return;

		var $value = e.target.value;
		this.parent_browser.browserItemsList.currentPage = 1;
		this.parent_browser.browserItemsList.moreItemsToLoad = true;
		this.parent_browser.browserItemsList.model.reset();

		if($value != "" || $value.length > 0){
			this.parent_browser.browserItemsList.searchString = $value;
			this.parent_browser.browserItemsList.removeOnFetch = true;
		}else{
			this.parent_browser.browserItemsList.searchString = '';
			this.parent_browser.browserItemsList.removeOnFetch = false;
		}

		this.parent_browser.browserItemsList.fetchItemsTimeout();
	}
});

Dubtrack.View.RoomQueueInfo = Backbone.View.extend({
	tagName : 'div',

	events : {
		'click .room-queue-lock' : 'lockRoom',
		'click .room-queue-unlock' : 'lockRoom',
		"keyup input.playlist_filter": "filterPlaylist"
	},

	initialize : function(){
		this.$el.addClass('queue_info');

		Dubtrack.Events.bind('realtime:room-lock-queue', this.lockRoomRT, this);
	},

	setBrowser : function(browser){
		this.parent_browser = browser;
		return this;
	},

	filterPlaylist : function(e){
		var $value = e.target.value;

		if($value === "" || $value === " "){
			_.each(this.collection.models, function (item) {
				var view = item.get("browserView");
				view.show();
			}, this);
		}else{
			$value = $value.toLowerCase();
			_.each(this.collection.models, function (item) {
				var view = item.get("browserView");

				$name = item.get("filterName").toLowerCase();
				if($name.indexOf($value) === -1) view.hide();
				else view.show();
			}, this);
		}
	},

	render : function(collection){
		this.$el.html( _.template( Dubtrack.els.templates.playlist.roomQueueInfo));

		var lockedQeue = Dubtrack.room && Dubtrack.room.model.get('lockQueue') ? true : false;

		if(lockedQeue){
			this.$('.room-queue-lock').show();
			this.$('.room-queue-unlock').hide();
		}else{
			this.$('.room-queue-lock').hide();
			this.$('.room-queue-unlock').show();
		}

		this.collection = collection;

		return this;
	},

	lockRoomRT : function(r){
		if(r && r.room){
			if(r.room.lockQueue){
				this.$('.room-queue-lock').show();
				this.$('.room-queue-unlock').hide();
			}else{
				this.$('.room-queue-lock').hide();
				this.$('.room-queue-unlock').show();
			}
		}
	},

	lockRoom : function(){
		if(Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || (Dubtrack.room.users && Dubtrack.room.users.getIfHasRole(Dubtrack.session.id))){
			if(this.loading_lock_queue) return false;

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomLockQueue.replace( ":id", Dubtrack.room.model.get('_id') ),
				lockedQeue = Dubtrack.room && Dubtrack.room.model.get('lockQueue') ? 0 : 1;

			this.loading_lock_queue = true;

			Dubtrack.helpers.sendRequest( url, {
				lockQueue: lockedQeue
			}, 'put', function(err){
				this.loading_lock_queue = false;
			}.bind(this));

			return false;
		}
	}
});

Dubtrack.View.MyQueueInfo = Backbone.View.extend({
	tagName : 'div',

	events : {
		"click .clear-queue": "clearMyQueue",
		"click .pause-queue": "pauseMyQueue",
		"click a.shuffle-playlist": "shufflePlaylist",
		"click .queue-join-info": "joinQueue",
		"keyup input.playlist_filter": "filterPlaylist"
	},

	filterPlaylist : function(e){
		var $value = e.target.value;

		if($value === "" || $value === " "){
			_.each(this.collection.models, function (item) {
				var view = item.get("browserView");
				view.show();
			}, this);
		}else{
			$value = $value.toLowerCase();
			_.each(this.collection.models, function (item) {
				var view = item.get("browserView");

				$name = item.get("filterName").toLowerCase();
				if($name.indexOf($value) === -1) view.hide();
				else view.show();
			}, this);
		}
	},

	initialize : function(){
		this.$el.addClass('queue_info');

		Dubtrack.Events.bind('realtime:user-pause-queue', this.pauseMyQueueRT, this);
	},

	setBrowser : function(browser){
		this.parent_browser = browser;
		return this;
	},

	joinQueue : function(){
		if(Dubtrack.room.users.getUserQueuedSongs(Dubtrack.session.id) == 0) {
			this.$('.queue-join-info').text("Add some songs to your queue before joining :]");
			return;
		}

		this.$('.queue-join-info').remove();
		this.$el.removeClass('queue-join-info');

		if(Dubtrack.room && Dubtrack.room.player) Dubtrack.room.player.displayBrowserSearch();

		return false;
	},

	shufflePlaylist : function(){
		if(this.parent_browser){
			this.parent_browser.playlistDetailContainer.randomize('li.queue-item');

			this.parent_browser.sortableUpdate();
		}

		return false;
	},

	render : function(collection){
		this.$el.html( _.template( Dubtrack.els.templates.playlist.myQueueInfo));

		if(Dubtrack.session && Dubtrack.room && Dubtrack.room.users){
			if(Dubtrack.room.users.getIfQueueIsActive(Dubtrack.session.id)){
				this.$('.pause-queue').text('Resume');
			}else{
				this.$('.pause-queue').text('Pause');
			}
		}

		this.collection = collection;

		return this;
	},

	pauseMyQueueRT : function(r){
		if(r && r.user_queue){
			if(Dubtrack.room.users){
				var userQueueRooms = Dubtrack.room.users.collection.findWhere({
					"userid" : r.user_queue.userid
				});

				if(userQueueRooms) {
					userQueueRooms.set({
						'queuePaused' : r.user_queue.queuePaused
					});
				}
			}

			if(Dubtrack.session.id && Dubtrack.session.id == r.user_queue.userid){
				if(r.user_queue.queuePaused){
					this.$('.pause-queue').text('Resume');
				}else{
					this.$('.pause-queue').text('Pause');
				}
			}
		}
	},

	clearMyQueue : function(e){
		if(e) e.preventDefault()

		if(confirm('Are you sure you want to clear your queue?')){
			if (Dubtrack.room && Dubtrack.room.model){
				this.$('.clear-queue').text('loading....');

				$.ajax({
					url: Dubtrack.config.apiUrl + '/room/' + Dubtrack.room.model.get('_id') + '/playlist',
					type: 'delete'
				}).always(function(){
					this.$('.clear-queue').text('clear');
					this.$('.clear-queue-browser-bth').text('Clear');
					this.parent_browser.displayDetails("queue");
				}.bind(this));
			}
		}

		return false;
	},

	pauseMyQueue : function(e){
		if(this.loading_pause_queue) return false;

		this.$('.pause-queue').text('loading....');
		this.loading_pause_queue = true;

		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.userQueuePause.replace( ":id", Dubtrack.room.model.get('_id') ),
			queuePaused = Dubtrack.session && Dubtrack.room && Dubtrack.room.users && Dubtrack.room.users.getIfQueueIsActive(Dubtrack.session.id) ? 0 : 1;

		Dubtrack.helpers.sendRequest( url, {
			queuePaused: queuePaused
		}, 'put', function(err){
			if(err) {
				if(err && err.data && err.data.err && err.data.err.details && err.data.err.details.message){
					this.$('.pause-queue').text(err.data.err.details.message);
				}else{
					this.$('.pause-queue').text('Coundn\'t update your queue settings');
				}
			}

			this.loading_pause_queue = false;
		}.bind(this));

		return false;
	}
});

Dubtrack.View.BrowserSearchInfo = Backbone.View.extend({
	tagName : 'div',

	events : {
	},

	initialize : function(){
		this.$el.addClass('queue_info');
	},

	setBrowser : function(browser){
		this.parent_browser = browser;
		return this;
	},

	render : function(name){
		this.$el.html( _.template( Dubtrack.els.templates.playlist.playlistSearchBrowser, {
			'name' : name
		}));

		return this;
	}
});

Dubtrack.View.BrowserHistoryInfo = Dubtrack.View.BrowserInfo.extend({
	tagName : 'div',

	initialize : function(){
		this.$el.addClass('queue_info');
	},

	setBrowser : function(browser){
		this.parent_browser = browser;
		return this;
	},

	render : function(collection){
		this.$el.html( _.template( Dubtrack.els.templates.playlist.playlistHistoryBrowser));

		this.collection = collection;

		return this;
	}
});

Dubtrack.View.playlistItem = Backbone.View.extend({
	tagName : 'li',

	attributes: {
		"class": "playlist_icon"
	},

	events : {
		"click": "viewDetails",
		"click .add_to_queue": "queuePlaylist",
		"click .delete": "removePlaylist"
	},

	initialize : function(){
		this.model.bind("change", this.render, this);
		this.model.bind("destroy", this.close, this);
	},

	queuePlaylist : function(){
		Dubtrack.app.navigate( "/browser/user/" + this.model.get('_id') , {
			trigger: false
		});

		Dubtrack.app.browserView.displayDetails("queueSong", this.model.get('_id'));

		return false;
	},

	setBrowser : function(){
		return this;
	},

	removePlaylist : function(){
		var r = confirm(dubtrack_lang.playlist.removePlaylistConfirm);

		if (r){
			console.log(this.model);
			this.model.destroy();
			this.close();
		}

		return false;
	},

	render : function(){
		this.$el.html( _.template( Dubtrack.els.templates.playlist.playlistBrowser , this.model.toJSON() ));
		this.$el.addClass('playlist-' + this.model.id);

		return this;
	},

	viewDetails : function(e){
		Dubtrack.app.navigate( "/browser/user/" + this.model.get('_id') , {
			trigger: true
		});

		return false;
	}
});

Dubtrack.View.BrowserPlaylistItem = Backbone.View.extend({
	tagName : 'li',

	attributes: {
		"class": "search-item"
	},

	events : {
		"click": "closePlaylistCont",
		"click .add_to_queue": "addToQueue",
		"click .remove_icon": "removePlaylist",
		"click .add_to_playlist": "addPlaylistContainer",
		"click .add_to_playlistQueue": "addPlaylistQueueContainer",
		"click .remove_queue": "removeFromQueue",
		"click .remove_track": "removeTrack",
		"click .remove_dj": "removeDJFromQueue",
		"click .remove_dj_all": "removeDJAllFromQueue",
		"click .pause_dj_all": "pauseDJAllFromQueue",
		"click .preview": "preview",
		"click a.editBtn": "focusInput",
		"blur input.track_name_input": "updateTrackName",
		"click .set_song_to_top_queue" : "moveToTop"
	},

	initialize : function(){
		//this.model.bind("change", this.render, this);
		//this.model.bind("destroy", this.close, this);
	},

	moveToTop : function(e){
		if(e) e.preventDefault();

		if(this.parent_browser){
			this.$el.prependTo(this.$el.parents('.browserPlaylistItems'));
			this.parent_browser.sortableUpdate();
		}
	},

	setBrowser : function(browser){
		this.parent_browser = browser;
		return this;
	},

	closePlaylistCont: function(e){
		$parents = $(e.target).parents('.playlist-options');

		if($parents.length === 0){
			if(dt.playlist.containerElCreateApp) dt.playlist.containerElCreateApp.close();
		}
	},

	setTime: function(){
		var minute = Math.floor(parseFloat( this.model.get('songLength') )/ 60000 );
		var second = Math.floor(parseFloat( this.model.get('songLength') ) / 1000 - minute * 60 );
		if(second.length<2) second = "0"+second;

		minute = ("0".substring(minute >= 10) + minute);
		second = ("0".substring(second >= 10) + second);

		this.model.set({
			'minute' : minute,
			'second' : second
		});
	},

	render : function(template){
		this.setTime();

		this.$el.html( _.template( Dubtrack.els.templates.playlist[template] , this.model.toJSON() ) );

		/*
		$removed = this.model.get('removed');
		if( $removed ){
			$(this.el).addClass("removed");
			$(this.el).prepend("<span class='removed_info'>" + dubtrack_lang.playlist.deletedByUser + "</div>");
		}*/

		return this;
	},

	focusInput : function(){
		$(this.el).find("input.track_name_input").focus();

		return false;
	},

	updateTrackName : function(e){

		$songName = $(e.target).val();

		if($songName && $songName !== " " && $songName !== 0){

			$.ajax({
				url:  dubtrackMain.config.updateMytracksUrl,
				data: {
					"id": this.model.get('id'),
					"title": $songName
				},
				type: 'POST',
				success: function(response){

				},
				error: function(){
				}
			},"json");

		}

	},

	removePlaylist : function(){
		//
		return false;
	},

	preview : function(){
		if(dt.playlist.previewEl) dt.playlist.previewEl.close();

		dt.playlist.previewEl = new Dubtrack.View.PreivewEl({
			model : this.model
		});

		dt.playlist.previewEl.$el.appendTo( $('body') );
		dt.playlist.previewEl.render();

		$("html,body").stop(true).animate({
			scrollTop : 0
		});

		return false;
	},

	removeFromQueue : function(){
		$.ajax({
			url:  dubtrackMain.config.removeFromQueue,
			data: {
				"id" : this.model.get('id')
			},
			type: 'POST',
			success: function(response){

			},
			error: function(){
			}
		},"json");

		this.close();

		return false;
	},

	removeDJFromQueue : function(){
		return false;
	},

	removeDJAllFromQueue : function(){
		return false;
	},

	removeTrack : function(){

		var r=confirm(dubtrack_lang.playlist.confirmRemoveTrack);
		if (r){
			$.ajax({
				url:  dubtrackMain.config.deleteMytracksUrl,
				data: {
					"id" : this.model.get('id')
				},
				type: 'POST',
				success: function(response){

				},
				error: function(){
				}
			},"json");

			this.close();
		}

		return false;
	},

	addPlaylistContainer : function(e){
		var position = {
			right: 0,
			top: 10
		};

		Dubtrack.helpers.genPlaylistContainer( this.$el, position, this.model.get('fkid'), this.model.get('type') );

		return false;
	},

	addToQueue : function(){
		var type = this.model.get('type'),
			id = this.model.get('fkid'),
			self = this;

		this.$('.add_to_queue').addClass('loading-action');

		Dubtrack.helpers.playlist.addQueue( id , type, function(err, r){
			if(err){
				try{
					if(err && err.data && err.data.err && err.data.err.details && err.data.err.details && err.data.err.details.message){
						self.$('.display-error').show().html(err.data.err.details.message);
					}else{
						self.$('.display-error').show().html('Song already in queue or played in the last hour');
					}
				}catch(ex){
					self.$('.display-error').show().html('Song already in queue or played in the last hour');
				}
			}else{
				self.$('.display-success').show().html('Song added to queue');
			}

			self.$('.add_to_queue').hide();
		});

		return false;
	}
});

Dubtrack.View.BrowserPlaylisHistorytItem = Dubtrack.View.BrowserPlaylistItem.extend({
	attributes: {
		"class": "history-item"
	},

	fetchSong: function(queueModel){
		this.queue = queueModel;

		var song = this.queue.get("_song");

		if(song && typeof song === "object"){
			song = Dubtrack.cache.songs.add(song);
			this.render(null, song);
		}else{
			Dubtrack.cache.songs.get(this.queue.get("songid"), this.render, this);
		}

		return this;
	},

	render : function(err, song){
		var place = this.model ? this.model.place : undefined;

		this.model = song;
		this.queue.set("song", song.toJSON());

		this.queue.set({
			"filterName": song.get("name")
		});

		this.setTime();

		var template_data = this.model.toJSON();
		template_data.place = place;

		this.$el.html( _.template( Dubtrack.els.templates.playlist.playlistSearchItem , template_data ) ).show();
		$('#browser .content-videos').perfectScrollbar('update');

		return this;
	}
});

Dubtrack.View.BrowserPlaylisHistorytItemWithDescription = Dubtrack.View.BrowserPlaylistItem.extend({
	attributes: {
		"class": "history-item"
	},

	fetchSong: function(queueModel){
		this.queue = queueModel;

		var song = this.queue.get("_song");

		if(song && typeof song === "object"){
			song = Dubtrack.cache.songs.add(song);
			this.render(null, song);
		}else{
			Dubtrack.cache.songs.get(this.queue.get("songid"), this.render, this);
		}

		return this;
	},

	render : function(err, song){
		var place = this.model.place;

		this.model = song;
		this.queue.set("song", song.toJSON());

		this.queue.set({
			"filterName": song.get("name")
		});

		this.setTime();

		var template_data = this.model.toJSON();
		template_data.place = place;
		template_data._user = this.queue.get('_user');
		template_data.updubs = this.queue.get('updubs');
		template_data.downdubs = this.queue.get('downdubs');
		template_data.grabs = this.queue.get('grabs');
		template_data.skipped = this.queue.get('skipped');

		this.$el.html( _.template( Dubtrack.els.templates.playlist.playlistHistoryItem , template_data ) ).show();

		var currentDate = new Date(this.queue.get('played') + this.queue.get('songLength'));
		this.$('.timeinfo').html('<time class="timeago" datetime="' + currentDate.toISOString() + '">' + currentDate.toLocaleString() + '</time>');
		this.$(".timeago").timeago();

		$('#browser .content-videos').perfectScrollbar('update');

		return this;
	}
});

Dubtrack.View.BrowserPlaylisUserPlaylisttItem = Dubtrack.View.BrowserPlaylisHistorytItem.extend({
	attributes: {
		"class": "playlist-item"
	},

	render : function(err, song){
		Dubtrack.View.BrowserPlaylisHistorytItem.prototype.render.call(this, err, song);
		this.$el.attr('data-id', this.queue.get('_id'));

		return this;
	},

	removePlaylist : function(){
		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.playlistSong.replace( ":id", this.model.get('playlistid') );

		this.queue.baseUrl = url;
		this.queue.destroy({
			success : function(modelDestroyed, playlistResult){
				if(playlistResult && playlistResult.data){
					var model = Dubtrack.app.browserView.model.findWhere({
						'_id' : playlistResult.data._id
					});

					if(model){
						model.set(playlistResult.data);
					}
				}
			}
		});

		this.close();

		return false;
	}
});

Dubtrack.View.BrowserQueuePlaylisttItem = Dubtrack.View.BrowserPlaylisHistorytItem.extend({
	attributes: {
		"class": "queue-item"
	},

	render : function(err, song){
		Dubtrack.View.BrowserPlaylisHistorytItem.prototype.render.call(this, err, song);
		this.$el.attr('data-id', this.queue.get('_id'));

		return this;
	},

	removePlaylist : function(){
		/*var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.playlistSong.replace( ":id", this.model.get('playlistid') );

		this.queue.baseUrl = url;
		this.queue.destroy();*/

		Dubtrack.helpers.playlist.removeQueue( this.queue.get('_id') );

		this.close();

		return false;
	}
});

Dubtrack.View.BrowserRoomQueuePlaylisttItem = Dubtrack.View.BrowserPlaylisHistorytItem.extend({
	attributes: {
		"class": "queue-item room-queue-item"
	},

	removeDJFromQueue : function(){
		this.$('.remove_dj').addClass('loading-action');

		$.ajax({
			url: Dubtrack.config.apiUrl + '/room/' + Dubtrack.room.model.get('_id') + '/queue/user/' + this.queue.get('userid'),
			type: 'delete'
		}).success(function(response){
			try{
				if(response && response.data && response.data.userNextSong && response.data.userNextSong._song){
					this.render(null, new Dubtrack.Model.Song(response.data.userNextSong._song));
				}else{
					this.$el.remove();
				}
			}catch(ex){
				this.$el.remove();
			}
		}.bind(this)).error(function(){
			this.$('.display-error').show().html('You don\'t have permissions to do this');
		}.bind(this)).always(function(){
			this.$('.remove_dj').removeClass('loading-action');
		}.bind(this));

		return false;
	},

	removeDJAllFromQueue : function(){
		this.$('.remove_dj_all').addClass('loading-action');

		$.ajax({
			url: Dubtrack.config.apiUrl + '/room/' + Dubtrack.room.model.get('_id') + '/queue/user/' + this.queue.get('userid') + '/all',
			type: 'delete'
		}).success(function(response){
				this.$el.remove();
		}.bind(this)).error(function(){
			this.$('.display-error').show().html('You don\'t have permissions to do this');
		}.bind(this)).always(function(){
			this.$('.remove_dj_all').removeClass('loading-action');
		}.bind(this));

		return false;
	},

	pauseDJAllFromQueue : function(){
		this.$('.pause_dj_all').addClass('loading-action');

		$.ajax({
			url: Dubtrack.config.apiUrl + '/room/' + Dubtrack.room.model.get('_id') + '/queue/user/' + this.queue.get('userid') + '/pause',
			type: 'put'
		}).success(function(response){
				this.$el.remove();
		}.bind(this)).error(function(){
			this.$('.display-error').show().html('You don\'t have permissions to do this');
		}.bind(this)).always(function(){
			this.$('.pause_dj_all').removeClass('loading-action');
		}.bind(this));

		return false;
	},

	render : function(err, song){
		var place = this.model.place;

		this.model = song;
		this.queue.set("song", song.toJSON());

		this.$el.attr('data-userid', this.queue.get('userid'));
		this.$el.attr('data-id', this.queue.get('userid'));

		this.queue.set({
			"filterName": song.get("name")
		});

		this.setTime();

		var template_data = this.model.toJSON();
		template_data.place = place;
		template_data._user = this.queue.get('_user');

		if(Dubtrack.session && Dubtrack.session.id && (Dubtrack.room.model.get('displayDJinQueue') || (Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || Dubtrack.room.users.getIfRoleHasPermission(Dubtrack.session.id, 'queue-order')))){
			this.$el.html( _.template( Dubtrack.els.templates.playlist.playlistRoomQueueItemDJinQueue , template_data ) ).show();
		}else{
			this.$el.html( _.template( Dubtrack.els.templates.playlist.playlistRoomQueueItem , template_data ) ).show();
		}

		$('#browser .content-videos').perfectScrollbar('update');

		return this;
	}
});

Dubtrack.View.containerElCreate = Backbone.View.extend({
	tagName : 'div',

	events : {
		"click .create-playlist-header .icon-close" : "closeWindow",
		"click a": "addPLaylist",
		"click .create-playlist-input span": "createPlaylist",
		"keydown .create-playlist-input input": "createPlaylistInput"
	},

	attributes: {
		"id": "addToPlaylistFloatContainer"
	},

	initialize : function(){
		$(this.el).attr('class', 'playlist-options');
	},

	render : function(el, pos, songid, type){
		this.$el.html( _.template( Dubtrack.els.templates.playlist.playlistContainer , {})).appendTo( 'body' );

		this.songid = songid;
		this.type = type;

		_.each(this.model.models, function (item) {
			this.appendEl(item);
		}, this);

		$('#addToPlaylistFloatContainer .playlist-list-action').perfectScrollbar({
			suppressScrollX: true,
			wheelPropagation: false,
			minScrollbarLength: 40
		});

		this.model.bind('add', this.appendEl, this);
		return this;
	},

	appendEl : function(item){
		var itemViewEl = new Dubtrack.View.containerElCreateItem({
			model: item
		}).render(this).$el.prependTo( this.$('ul.playlist-list-action') );
	},

	createPlaylistInput: function(e){
		c = e.which ? e.which : e.keyCode;
		if (c === 13) this.createPlaylist();
	},

	createPlaylist: function(){
		var name = $.trim(this.$('.create-playlist-input input').val());
		if(name === "" || name === null) return;

		var playlistModel = new Dubtrack.Model.Playlist({
			name: name
		});
		playlistModel.parse = Dubtrack.helpers.parse;

		var self = this;
		playlistModel.save({},{
			success: function(){
				Dubtrack.user.playlist.add(playlistModel);
				if(Dubtrack.app.browserView) Dubtrack.app.browserView.appendEl(playlistModel);
			}
		});

		this.$('.create-playlist-input input').val('');
	},

	closeWindow : function() {
		this.close();

		return false;
	}
});

Dubtrack.View.containerElCreateItem = Backbone.View.extend({
	tagName : 'li',

	events : {
		"click": "addToPlaylist"
	},

	initialize: function(){

	},

	render : function(parentView){
		this.$el.html( this.model.get('name') );
		this.parentView = parentView;

		return this;
	},

	addToPlaylist : function(){
		var self = this;
		this.$el.parents('li').find('a.add_to_playlist').addClass('active');

		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.playlistSong.replace( ":id", this.model.get('_id') );

		if(this.parentView.type){
			Dubtrack.helpers.sendRequest( url, {
				'fkid': this.parentView.songid,
				'type': this.parentView.type
			}, 'post', function(err, playlistResult){
				if(!err && playlistResult && playlistResult.data){
					var model = Dubtrack.app.browserView.model.findWhere({
						'_id' : this.model.get('_id')
					});

					if(model){
						model.set(playlistResult.data);
						this.model.set(playlistResult.data);
					}
				}
			}.bind(this));
		}else{
			Dubtrack.helpers.sendRequest( url, {
				'songid': this.parentView.songid
			}, 'post', function(err, playlistResult){
				if(!err && playlistResult && playlistResult.data){
					var model = Dubtrack.app.browserView.model.findWhere({
						'_id' : this.model.get('_id')
					});

					if(model){
						model.set(playlistResult.data);
						this.model.set(playlistResult.data);
					}
				}
			}.bind(this));
		}

		this.parentView.close();

		return false;
	}
});

Dubtrack.View.PreivewEl = Backbone.View.extend({
	tagName : 'div',

	className : 'playerPreview',

	events : {
		"click .close" : "closeAction"
	},

	initialize : function(){
		this.$el.html( Dubtrack.els.templates.playlist.previewContainer );
		console.log(this.model, this.$el);
	},

	render : function(){
		this.player_container = this.$('.playerDubContainer');

		$(document).on("click", function(e){
			if(dt.playlist.previewEl){
				$parents = $(e.target).parents('.playerPreview');

				if($parents.length === 0){
					dt.playlist.previewEl.close();
				}
			}
		});

		this.buildPlayer();
		this.loadComments();

		return this;
	},

	buildPlayer : function(){
		this.id = this.model.get('fkid');

		switch(this.model.get('type')){
			case "youtube":
				this.buildYT();
			break;
			case "soundcloud":
			case "dubtrack":
				this.buildSoundCloud();
			break;
			default:
			break;
		}

	},

	closeAction : function(){
		this.close();
	},

	buildYT : function(){
		this.player = new ytDubsPlayerView();
		this.player_container.append( this.player.render(this.id, this.id + "_video").$el );
		this.player.buildPlayer(true);
		if (Dubtrack.playerController.volume) {
			this.player.setVolume(Dubtrack.playerController.volume);
		}
	},

	buildSoundCloud : function(){
		this.player = new scDubsPlayerView();
		this.player_container.append( this.player.render(this.model.get('streamUrl'), this.id + "_audio", this.model.get('type'), true ).$el );
		if (Dubtrack.playerController.volume) {
			this.player.setVolume(Dubtrack.playerController.volume);
		}
	},

	loadComments : function(){},

	beforeClose : function(){
		if(this.player) this.player.close();
	}
});
