dt.playlist.browserDocBind = false;
dt.playlist.previewEl = false;
Dubtrack.View.Browser = Backbone.View.extend({
	el: $('#browser'),

	events : {
		"click a.close": "hideBrowser",
		"keydown input#youtube-search": "searchKeyUp",
		"click a#soundcloud-btn": "setSoundcloud",
		"click a#youtube-btn": "setYoutube",
		"click a#dubtrack-btn": "setDubtrack",
		"click #searchBtnMain": "search",
		"click a.search-btn": "search",
		"click li.current_queue": "displayQueue",
		"click .clear-queue": "clearMyQueue",
		"click li.current_room_queue": "displayRoomQueue",
		"click li.my_tracks": "displayMyTracks",
		"click .create-playlist span": "createPlaylist",
		"keydown .create-playlist input": "createPlaylistInput"
	},

	initialize : function(){
		this.searchCollection = new Dubtrack.Collection.Song();
		this.historyCollection = new Dubtrack.Collection.UserQueue();
		this.userQueueCollection = new Dubtrack.Collection.UserQueue();

		Dubtrack.Events.bind('realtime:room_playlist-update', this.updateQueueList, this);
		Dubtrack.Events.bind('realtime:room_playlist-queue-update', this.updateQueueListQueue, this);
		this.browser_view_state = null;
		this.render();
	},

	updateQueueList : function(){
		if(this.browser_view_state && (this.browser_view_state === "room_queue" || this.browser_view_state === "queue" || this.browser_view_state === "history")){
			this.displayDetails(this.browser_view_state);
		}
	},

	updateQueueListQueue : function(){
		if(this.browser_view_state && (this.browser_view_state === "room_queue")){
			this.displayDetails(this.browser_view_state);
		}
	},

	render : function(){
		this.$el.html( Dubtrack.els.templates.layout.browser ).show().addClass('animate');

		this.playlistListContainer = this.$('ul.playlist-list');
		this.loadingEl = this.$('div.loading');
		this.playlistContainer = this.$('div#results_video_api');
		this.inputSearch = this.$("input#youtube-search");

		_.each(this.model.models, function (item) {
			this.appendEl(item);
		}, this);

		this.model.bind('add', this.appendEl, this);
		//$(this.el).find('.nano').nanoScroller();

		this.setYoutube();

		var self = this;
		if( ! dt.playlist.browserDocBind ){
			dt.playlist.browserDocBind = true;
			/*$(window).on('click', function(e){
				$parents = $(e.target).parents('#browser');

				if($parents.length === 0){
					if(dubtrackapp.mainBrowserView) dubtrackapp.mainBrowserView.close();
				}
			});*/
		}

		$('#browser .content-videos, .playlist-list').perfectScrollbar({
			wheelSpeed: 20,
			suppressScrollX: true,
			wheelPropagation: false
		});

		return this;
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
		this.$('.br-btn').removeClass('active');
		this.$('a#youtube-btn').addClass('active');
		this.searchType = "youtube";

		return false;
	},

	setSoundcloud : function(){
		this.$('.br-btn').removeClass('active');
		this.$('a#soundcloud-btn').addClass('active');
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

	clearMyQueue : function(e){
		if(e) e.preventDefault()

		if (Dubtrack.room && Dubtrack.room.model){
			this.$('.clear-queue').text('loading....');

			$.ajax({
				url: Dubtrack.config.apiUrl + '/room/' + Dubtrack.room.model.get('_id') + '/playlist',
				async: false,
				type: 'delete'
			}).always(function(){
				this.$('.clear-queue').text('clear');
				this.$('.clear-queue-browser-bth').text('clear my queue');
				this.displayDetails("queue");
			}.bind(this));
		}
	},

	displayRoomQueue : function(){

		Dubtrack.app.navigate( "/browser/room-queue/" , { trigger : true });

		return false;
	},

	displayMyTracks : function(){

		dubtrackapp.navigate( "/browser/tracks/" , { trigger : true });

		return false;
	},

	sortableUpdate : function(event, ui){
		var order = [];
		this.playlistDetailContainer.children('li').each(function(idx, elm) {
			order.push($(elm).attr('data-id'));
		});

		console.log(this.url_items_order);
		Dubtrack.helpers.sendRequest( this.url_items_order, {
			'order[]' : order
		}, 'post');
	},

	displayDetails : function(display, id){

		this.loadingEl.show();

		if(this.browserInfoEl) this.browserInfoEl.close();

		var self = this;
		//clear container
		this.playlistDetailContainer = $('<ul/>', {
			class: 'browserPlaylistItems'
		});

		this.playlistContainer.html( this.playlistDetailContainer );

		$('#browser .content-videos').scrollTop(0);
		$('#browser .content-videos').perfectScrollbar('update');

		this.browser_view_state = display;
		this.$('.clear-queue-browser-bth').hide();

		switch(display){
			case "user":
			case "queueSong":
				$c = this.model.get(id);
				if($c) this.browserInfoEl = new Dubtrack.View.BrowserInfo({
					model : $c
				}).setBrowser(self).render('playlistInfo', this.userQueueCollection);

				else {
					this.browserInfoEl = new Dubtrack.View.BrowserInfo().setBrowser(self).render('playlistInfo', this.userQueueCollection);
					this.browserInfoEl.setName(dubtrack_lang.global.loading);
				}

				var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.playlistSong.replace( ":id", id ),
					url_items_order = Dubtrack.config.apiUrl + Dubtrack.config.urls.playlistOrder.replace( ":id", id );

				this.url_items_order = url_items_order;
				this.userQueueCollection.url = url;

				this.browserInfoEl.$el.prependTo( this.playlistContainer );

				this.userQueueCollection.reset();
				this.userQueueCollection.fetch({
					success : function(){
						_.each(self.userQueueCollection.models, function (item) {
							var itemViewEl = new Dubtrack.View.BrowserPlaylisUserPlaylisttItem();

							itemViewEl.fetchSong(item)
							.$el
							.appendTo( self.playlistDetailContainer );

							item.set({
								"browserView": itemViewEl.$el
							});

							//queue song
							if(display == "queueSong") itemViewEl.addToQueue();
						});

						//hide loading
						self.loadingEl.hide();


						self.playlistDetailContainer.sortable({
							axis: "y",
							cursor: "move",
							placeholder: "ui-state-highlight",

							update: function(event, ui){
								self.sortableUpdate(event, ui);
							}
						});

					},

					error: function(){
						//hide loading
						self.loadingEl.hide();
					}
				});

				break;

			case "search":
				if(id !== "" || id !== null){
					this.browserInfoEl = new Dubtrack.View.BrowserInfo().render('playlistInfo', this.searchCollection);
					this.browserInfoEl.$el.prependTo( this.playlistContainer );
					this.browserInfoEl.setName(dubtrack_lang.global.search + ": <i>" + id + "</i>");

					this.searchCollection.reset();
					this.searchCollection.fetch({
						data : {
							'name': id,
							'type': this.searchType
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
				this.browserInfoEl = new Dubtrack.View.BrowserInfo().render('playlistInfo', this.historyCollection);
				this.browserInfoEl.$el.prependTo( this.playlistContainer );
				this.browserInfoEl.setName(dubtrack_lang.playlist.history);

				var urlHistory = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomHistory.replace( "{id}", Dubtrack.room.model.get('_id') );
				this.historyCollection.url = urlHistory;

				this.historyCollection.reset();
				this.historyCollection.fetch({
					success : function(){
						_.each(self.historyCollection.models, function (item) {
							var itemViewEl = new Dubtrack.View.BrowserPlaylisHistorytItemWithDescription()
							.fetchSong(item)
							.$el
							.appendTo( self.playlistDetailContainer );

							item.set({
								"browserView": itemViewEl
							});
						});

						//hide loading
						self.loadingEl.hide();
					},

					error: function(){
						//hide loading
						self.loadingEl.hide();
					}
				});

				break;

			case "queue":
				var urlQueue = Dubtrack.config.apiUrl + Dubtrack.config.urls.userQueue.replace( ":id", Dubtrack.room.model.get('_id') ),
					url_queue_order = Dubtrack.config.apiUrl + Dubtrack.config.urls.userQueueOrder.replace( ":id", Dubtrack.room.model.get('_id') );
				//var urlQueue = Dubtrack.config.apiUrl + Dubtrack.config.urls.userQueue.replace( ":id", "52b8afded008544e87000005" );
				this.userQueueCollection.url = urlQueue;

				this.url_items_order = url_queue_order;

				this.$('.clear-queue-browser-bth').show();

				this.userQueueCollection.reset();
				this.userQueueCollection.fetch({
					success : function(){
						_.each(self.userQueueCollection.models, function (item) {
							var itemViewEl = new Dubtrack.View.BrowserQueuePlaylisttItem()
							.fetchSong(item)
							.setBrowser(self)
							.$el
							.appendTo( self.playlistDetailContainer );

							item.set({
								"browserView": itemViewEl
							});
						});

						//hide loading
						self.loadingEl.hide();

						self.playlistDetailContainer.sortable({
							axis: "y",
							cursor: "move",
							placeholder: "ui-state-highlight",

							update: function(event, ui){
								order = [];
								$(this).children('li').each(function(idx, elm) {
									console.log($(elm));
									order.push($(elm).attr('data-id'));
								});
								console.log(order, url_queue_order);
								Dubtrack.helpers.sendRequest( url_queue_order, {
									'order[]' : order
								}, 'post');
							}
						});
					},

					error: function(){
						//hide loading
						self.loadingEl.hide();
					}
				});

				break;

			case "room_queue":
				var urlQueue = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomQueueDetails.replace( ":id", Dubtrack.room.model.get('_id') ),
					url_queue_order = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomUserQueueOrder.replace( ":id", Dubtrack.room.model.get('_id') );

				this.url_items_order = url_queue_order;
				this.userQueueCollection.url = urlQueue;

				this.userQueueCollection.reset();
				this.userQueueCollection.fetch({
					success : function(){
						_.each(self.userQueueCollection.models, function (item) {
							var itemViewEl = new Dubtrack.View.BrowserRoomQueuePlaylisttItem()
							.fetchSong(item)
							.setBrowser(self)
							.$el
							.appendTo( self.playlistDetailContainer );

							item.set({
								"browserView": itemViewEl
							});
						});

						//hide loading
						self.loadingEl.hide();

						if(Dubtrack.session && Dubtrack.room && Dubtrack.room.users && (Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || Dubtrack.room.model.get('userid') == Dubtrack.session.id || Dubtrack.room.users.getIfMod(Dubtrack.session.id))){
							self.playlistDetailContainer.sortable({
								axis: "y",
								cursor: "move",
								placeholder: "ui-state-highlight",

								update: function(event, ui){
									order = [];
									$(this).children('li').each(function(idx, elm) {
										console.log($(elm));
										order.push($(elm).attr('data-userid'));
									});
									console.log(order, url_queue_order);
									Dubtrack.helpers.sendRequest( url_queue_order, {
										'order[]' : order
									}, 'post');
								}
							});

							self.playlistDetailContainer.addClass('display-mod-controls');
						}else{
							self.playlistDetailContainer.removeClass('display-mod-controls');
						}
					},

					error: function(){
						//hide loading
						self.loadingEl.hide();
					}
				});

				break;

			/*case "tracks":
				this.browserInfoEl = new dt.playlist.browserInfoView().render('playlistInfoUpload', this.dtmytracksCollection);
				$( this.browserInfoEl.el ).prependTo( this.playlistContainer );
				this.dtmytracksCollection.fetch({ success : function(m, r){
					_.each(self.dtmytracksCollection.models, function (item) {
						var minute = Math.floor(parseFloat( item.get('video_length') ) / 60);
						var second = parseFloat( item.get('video_length') ) - minute * 60;
						if(second.length<2) second = "0"+second;

						minute = ("0".substring(minute >= 10) + minute);
						second = ("0".substring(second >= 10) + second);

						item.set({ 'minute' : minute, 'second' : second });
						self.createPlaylistView(item, 'browserTracksItem');

					}, self);

					//hide loading
					self.loadingEl.hide();
				}});
			break;
			case "upload":
				this.playlistDetailContainer.html('<div id="dropbox"><span class="message">' + dubtrack_lang.playlist.dropFiles + '</span><ul></ul></div>');
				this.upload();
				//hide loading
				self.loadingEl.hide();
			break;*/

			default:
				//this.playlistDetailContainer.html( $('<img/>', { 'src' : dubtrackMain.config.mediaBaseUrl + dubtrack_lang.playlist.instructions }) );
				this.loadingEl.hide();
				break;
		}
	},

	hideBrowser: function(){
		this.browser_view_state = null;
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
		this.browser_view_state = null;

		try{
			this.playlistDetailContainer.sortable('destroy');
		}catch(ex){}

		//window.location.hash = "#/";
		//dubtrackMain.config.browserContainer.hide();
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
		"keyup input.playlist_filter": "filterPlaylist",
		//"click a.playlist_type": "changePlaylistType",
		"click a.shuffle-playlist": "shufflePlaylist",
		"click a.navigate": "navigate"
	},

	initialize : function(){
		this.$el.addClass('playlist_info');

	},

	render : function(template, collection){
		this.$el.html( _.template( Dubtrack.els.templates.playlist[template]) );
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
				if("view") view.show();
			}, this);
		}else{
			_.each(this.collection.models, function (item) {
				var view = item.get("browserView");
				console.log(item);
				$name = item.get("filterName").toLowerCase();
				if($name.indexOf($value) === -1) if("view") view.hide();
				else if("view") view.show();
			}, this);
		}
	},

	setBrowser : function(browser){
		this.parent_browser = browser;
		return this;
	},

	shufflePlaylist : function(e){
		if(e) e.preventDefault();

		if(this.parent_browser){
			this.parent_browser.playlistDetailContainer.randomize('li.playlist-item');

			this.parent_browser.sortableUpdate();
		}
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

		var r=confirm(dubtrack_lang.playlist.removePlaylistConfirm);

		if (r){
			console.log(this.model);
			this.model.destroy();
			this.close();
		}

		return false;
	},

	render : function(){
		this.$el.html( _.template( Dubtrack.els.templates.playlist.playlistBrowser , this.model.toJSON() ));

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
		"click .preview": "preview",
		"click a.editBtn": "focusInput",
		"blur input.track_name_input": "updateTrackName",
		"click .set_song_to_top_queue" : "moveToTop"
	},

	initialize : function(){
		//this.model.bind("change", this.render, this);
		//this.model.bind("destroy", this.close, this);
	},

	moveToTop : function(){},

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
				self.$('.display-error').show().html('Song already in queue or played in the last hour');
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
		this.model = song;
		this.queue.set("song", song.toJSON());

		this.queue.set({
			"filterName": song.get("name")
		});

		this.setTime();
		this.$el.html( _.template( Dubtrack.els.templates.playlist.playlistSearchItem , this.model.toJSON() ) ).show();
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
		this.model = song;
		this.queue.set("song", song.toJSON());

		this.queue.set({
			"filterName": song.get("name")
		});

		this.setTime();

		var template_data = this.model.toJSON();
		template_data._user = this.queue.get('_user');
		template_data.updubs = this.queue.get('updubs');
		template_data.downdubs = this.queue.get('downdubs');
		this.$el.html( _.template( Dubtrack.els.templates.playlist.playlistHistoryItem , template_data ) ).show();

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
		this.queue.destroy();

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
	},

	moveToTop : function(e){
		if(e) e.preventDefault();

		if(this.parent_browser){
			this.$el.prependTo(this.$el.parents('.browserPlaylistItems'));
			this.parent_browser.sortableUpdate();
		}
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
			async: false,
			type: 'delete'
		}).success(function(){
			this.$el.remove();
		}.bind(this)).error(function(){
			this.$('.display-error').show().html('You don\'t have permissions to do this');
		}.bind(this)).always(function(){
			this.$('.remove_dj').removeClass('loading-action');
		}.bind(this));

		return false;
	},

	render : function(err, song){
		this.model = song;
		this.queue.set("song", song.toJSON());

		this.$el.attr('data-userid', this.queue.get('userid'));
		this.$el.attr('data-id', this.queue.get('userid'));

		this.queue.set({
			"filterName": song.get("name")
		});

		this.setTime();

		var template_data = this.model.toJSON();
		template_data._user = this.queue.get('_user');
		this.$el.html( _.template( Dubtrack.els.templates.playlist.playlistRoomQueueItem , template_data ) ).show();

		$('#browser .content-videos').perfectScrollbar('update');

		return this;
	},

	moveToTop : function(e){
		if(e) e.preventDefault();

		if(this.parent_browser){
			this.$el.prependTo(this.$el.parents('.browserPlaylistItems'));
			this.parent_browser.sortableUpdate();
		}
	}
});

Dubtrack.View.containerElCreate = Backbone.View.extend({
	tagName : 'div',

	events : {
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
		this.$el.html( _.template( Dubtrack.els.templates.playlist.playlistContainer , {} ) ).css(pos).appendTo( el );

		this.songid = songid;
		this.type = type;

		_.each(this.model.models, function (item) {
			this.appendEl(item);
		}, this);

		$('#addToPlaylistFloatContainer .playlist-list-action').perfectScrollbar({
			wheelSpeed: 20,
			suppressScrollX: true,
			wheelPropagation: false
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
				Dubtrack.app.browserView.appendEl(playlistModel);
			}
		});

		this.$('.create-playlist-input input').val('');
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
			}, 'post');
		}else{
			Dubtrack.helpers.sendRequest( url, {
				'songid': this.parentView.songid
			}, 'post');
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
	},

	buildSoundCloud : function(){
		this.player = new scDubsPlayerView();
		this.player_container.append( this.player.render(this.model.get('streamUrl'), this.id + "_audio", this.model.get('type'), true ).$el );
	},

	loadComments : function(){
		var songid = this.model.get('_id');

		if(songid){
			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.songComments.replace( ":id", songid );

			this.playerComments = new Dubtrack.View.comment();
			this.playerComments.render(url).$el.appendTo(this.$('.comments-container'));
		}
	},

	beforeClose : function(){
		if(this.player) this.player.close();
	}
});
