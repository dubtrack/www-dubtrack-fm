Dubtrack.View.ImportPlaylistBrowser = Backbone.View.extend({
	events : {
		"click .playlist-type-select .import-youtube" : "displayYoutubeImport",
		"click .import-playlist-youtube .import-playlist" : "importYoutubePlaylist",
		"keyup .import-playlist-youtube input" : "importYoutubePlaylistKeyUp",

		"click .playlist-type-select .import-soundcloud" : "displaySoundCloudImport",
		"click .import-playlist-soundcloud .import-playlist" : "importSoundcloudUserPlaylist",
		"keyup .import-playlist-soundcloud input" : "importSoundcloudUserPlaylistKeyUp",

		"click .close-import-playlist" : "closeView"
	},

	initialize : function(){
		this.soundCloudPlaylistList = this.$('.import-playlist-soundcloud ul');

		this.$('.playlist-container').perfectScrollbar({
			suppressScrollX: true,
			wheelPropagation: false,
			minScrollbarLength: 40
		});

		return this;
	},

	setBrowser : function(browser){
		this.browser = browser;
	},

	displayYoutubeImport: function(){
		this.$('.playlist-tab-import-active').removeClass('playlist-tab-import-active');
		this.$('.import-playlist-youtube').addClass('playlist-tab-import-active');
		this.$('.import-playlist-youtube input').focus();
		this.$('.err-message').hide();

		return false;
	},

	displaySoundCloudImport: function(){
		this.$('.playlist-tab-import-active').removeClass('playlist-tab-import-active');
		this.$('.import-playlist-soundcloud').addClass('playlist-tab-import-active');
		this.$('.import-playlist-soundcloud input').focus();
		this.$('.err-message').hide();
		this.soundCloudPlaylistList.empty();

		return false;
	},

	importSoundcloudUserPlaylistKeyUp : function(e){
		c = e.which ? e.which : e.keyCode;
		this.soundCloudPlaylistSelect = null;

		if (c == 13){
			this.importSoundcloudUserPlaylist();
		}
	},

	importSoundcloudUserPlaylist : function(){
		this.$('.import-playlist-soundcloud').addClass('importing');

		if(!this.soundCloudPlaylistSelect){
			var soundCloudUsername = this.$('.import-playlist-soundcloud input').val();
			this.$('.err-message').hide();
			this.soundCloudPlaylistList.empty();
			this.$('.playlist-container').perfectScrollbar('update');
			this.soundCloudPlaylistSelect = null;

			if(soundCloudUsername && soundCloudUsername.length > 0){
				var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.getSoundCloudPlaylists;

				Dubtrack.helpers.sendRequest(url, {
					'username' : soundCloudUsername
				}, 'get', function(err, result){
					if(err){
					}else if(result.data){
						_.each(result.data, function(playlist){
							var view = new Dubtrack.View.ImportPlaylistBrowserSoundCloudItem({
								model: new Dubtrack.Model.SoundCloudPlaylist(playlist)
							}).setParent(this).$el.appendTo(this.soundCloudPlaylistList);

						}.bind(this));
					}

					this.$('.import-playlist-soundcloud').removeClass('importing');
					this.$('.playlist-container').perfectScrollbar('update');
				}.bind(this));
			}
		}else{
			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.importSoundcloudPlaylist;

			Dubtrack.helpers.sendRequest(url, {
				'id' : this.$('.import-playlist-soundcloud select').val(),
				'playlistid' : this.soundCloudPlaylistSelect.get('id')
			}, 'post', function(err, result){
				if(err){
				}else if(result.data){
					if(result.data && result.data._id){
						this.browser.model.add(result.data);

						Dubtrack.app.navigate("/browser/user/" + result.data._id , {
							trigger : true
						});
					}
				}

				this.setSelect();
				this.soundCloudPlaylistList.find('li.selected').removeClass('selected');
				this.soundCloudPlaylistSelect = null;
				this.$('.import-playlist-soundcloud').removeClass('importing');
			}.bind(this));
		}
	},

	importYoutubePlaylistKeyUp : function(e){
		c = e.which ? e.which : e.keyCode;

		if (c == 13){
			this.importYoutubePlaylist();
		}
	},

	importYoutubePlaylist : function(){
		var youtubePlaylistID = this.$('.import-playlist-youtube input').val();
		this.$('.err-message').hide();

		if(youtubePlaylistID && youtubePlaylistID.length > 0){
			this.$('.import-playlist-youtube').addClass('importing');

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.importYoutubePlaylist;

			Dubtrack.helpers.sendRequest(url, {
				'id' : this.$('.import-playlist-youtube select').val(),
				'yt_playlistid' : youtubePlaylistID
			}, 'post', function(err, result){
				if(err){
					this.$('.import-playlist-youtube .err-message').show().text(err.data && err.data.err && err.data.err.message ? err.data && err.data.err && err.data.err.message : 'playlist not found');
				}else{
					this.$('.import-playlist-youtube input').val('');

					if(result.data && result.data._id){
						this.browser.model.add(result.data);

						Dubtrack.app.navigate("/browser/user/" + result.data._id , {
							trigger : true
						});
					}

					this.closeView();
				}

				this.$('.import-playlist-youtube').removeClass('importing');
			}.bind(this));
		}

		return false;
	},

	setSelectedPlaylist : function(model){
		this.soundCloudPlaylistList.find('li.selected').removeClass('selected');

		this.soundCloudPlaylistSelect = model;
	},

	openView: function(){
		this.$el.show();

		this.$('.playlist-tab-import-active').removeClass('playlist-tab-import-active');
		this.$('.playlist-type-select').addClass('playlist-tab-import-active');
		this.$('.err-message').hide();
		this.soundCloudPlaylistList.empty();
		this.$('.playlist-container').perfectScrollbar('update');
		this.soundCloudPlaylistSelect = null;
		this.setSelect();

		return false;
	},

	setSelect: function(){
		this.$('select.playlist-select').empty();
		this.$('select.playlist-select').append('<option value="" selected>New playlist</option>');
		_.each(this.browser.model.models, function(playlist){
			this.$('select.playlist-select').append('<option value="' + playlist.id + '">' + playlist.get('name') + '</option>');
		}.bind(this));
	},

	closeView: function(){
		this.$el.hide();

		return false;
	}
});

Dubtrack.View.ImportPlaylistBrowserSoundCloudItem = Backbone.View.extend({
	tagName: 'li',

	events : {
		"click" : "clickEvent"
	},

	setParent : function(parent){
		this.parent = parent;

		return this;
	},

	initialize : function(){
		this.$el.html( _.template( Dubtrack.els.templates.layout.soundCloudImportItem, this.model.toJSON() ) );
		this.$el.attr('data-id', this.model.id);

		return this;
	},

	clickEvent : function(){
		this.parent.setSelectedPlaylist(this.model);
		this.$el.addClass('selected');

		return false;
	}
});
