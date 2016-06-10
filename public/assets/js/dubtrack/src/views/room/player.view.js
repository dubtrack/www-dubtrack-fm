/**
 *	Backbone views
 *
 */

Dubtrack.View.Player = Backbone.View.extend({
	el: $('#main_player'),

	voteCount: 0,

	playbackQuality: 'default',

	events : {
		"click .placeholder": "displayQueueBrowser",
		"click .skip-el": "skipSong",
		"click .playbtn-el": "playCurrentSong",
		"click .refresh-el" : "reloadVideo",
		"click .player-controller-container .mute" : "mutePlayer",
		"click .play-song-link-browser" : "openBrowserSearch",
		"click .play-song-link" : "displayBrowserSearch",
		"click .videoquality-el": "changeYTQuality",
		"click .hideVideo-el": "hideVideo",
		"click .display-queue" : "displayRoomQueue",
		"click .edit-room": "editRoom",
		"click .display-mods-controls": "displayModsControl",
		"click .room-info-display" : "diplayRoomInfo",
		"click .displayVideo-el": "displayPlayer"
	},

	initialize : function(){
		this.playing = false;

		this.autoplayStarted = false;

		this.loadingEl = this.$('.loading-el');
		this.bufferingEl = this.$('.buferring-el').html(dubtrack_lang.player.buffering);
		this.playElBtn = this.$('.playbtn-el');
		this.queueInfo = $('.queue-info');
		this.hideVideoElBtn = this.$('.hideVideo-el');
		this.qualityElBtn = this.$('.videoquality-el');
		this.displayRoomQueueEl = this.$('.display-queue');
		this.refreshElBtn = this.$('.refresh-el');
		this.skipElBtn = this.$('.skip-el');
		this.errorElBtn = $('<div/>', { class : "loading" } ).html( dubtrack_lang.player.error ).css({"display" : "none"}).appendTo( dubtrackMain.config.playerContainer );
		this.placeHolder = this.$('.placeholder');
		this.customEmbedIframeDiv = this.$('#custom_iframe_embed');
		this.customEmbedIframeErrorDiv = this.$('#custom_iframe_embed_error');

		var activeQueueUrl = Dubtrack.config.urls.roomPlaylist.replace( ":id", this.model.id );
		this.activeQueueCollection = new Dubtrack.Collection.RoomActiveQueue();
		this.activeQueueCollection.url = Dubtrack.config.apiUrl + activeQueueUrl;

		Dubtrack.Events.bind('realtime:room-update', this.roomUpdate, this);

		var self = this;

		this.minEl = Dubtrack.playerController.$('.min');
		this.secEl = Dubtrack.playerController.$('.sec');
		this.progressEl = Dubtrack.playerController.$('.progressBg');
		this.currentDjName = Dubtrack.playerController.$('.currentDJSong');
		this.pictureEl = Dubtrack.playerController.$('.imgEl');

		var url = Dubtrack.config.urls.roomPlaylistActive.replace( ":id", this.model.id );

		this.activeSong = new Dubtrack.Model.ActiveQueue();
		this.activeSong.url = Dubtrack.config.apiUrl + url;

		this.room_type = null;

		this.activeSong.parse = Dubtrack.helpers.parse;

		Dubtrack.Events.bind('realtime:room_playlist-update', this.realTimeUpdate, this);
		Dubtrack.Events.bind('realtime:user-pause-queue', this.displayQueueSongRealtimeUpdate, this);
		Dubtrack.Events.bind('realtime:room-lock-queue', this.displayQueueSongRealtimeUpdate, this);
		Dubtrack.Events.bind('realtime:room_playlist-update', this.displayQueueSongRealtimeUpdate, this);
		Dubtrack.Events.bind('realtime:room_playlist-queue-update', this.displayQueueSongRealtimeUpdate, this);
		Dubtrack.Events.bind('realtime:room_playlist-queue-update-dub', this.displayQueueSongRealtimeUpdate, this);
		Dubtrack.Events.bind('realtime:room-update', this.displayQueueSongRealtimeUpdate, this);
		Dubtrack.Events.bind('realtime:user-kick', this.displayQueueSongRealtimeUpdate, this);
		Dubtrack.Events.bind('realtime:user-ban', this.displayQueueSongRealtimeUpdate, this);
		Dubtrack.Events.bind('realtime:user-unban', this.displayQueueSongRealtimeUpdate, this);
		Dubtrack.Events.bind('realtime:user-setrole', this.displayQueueSongRealtimeUpdate, this);
		Dubtrack.Events.bind('realtime:user-unsetrole', this.displayQueueSongRealtimeUpdate, this);

		if(Dubtrack.user.loggedIn) this.displayRoomQueueEl.show();

		this.modsViewEl = new Dubtrack.View.ModsView();

		if(Dubtrack.session && Dubtrack.room && Dubtrack.room.users && (Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || Dubtrack.room.users.getIfRoleHasPermission(Dubtrack.session.id, 'ban'))){
			this.$('.display-mods-controls').css('display', 'inline-block');
		}

		//Reset volume slider
		if(Dubtrack.helpers.cookie.get('dubtrack-room-volume'))
			this.setVolume(Dubtrack.helpers.cookie.get('dubtrack-room-volume'));

		//fetch new song
		this.fetchSong();
		this.displayQueueSongRealtimeUpdate();
	},

	skipSong: function(){
		this.skipElBtn.hide();
		Dubtrack.room.chat.skipSong();

		return false;
	},

	displayQueueSongRealtimeUpdate : function(){
		setTimeout(function(){
			if(Dubtrack.room.model.get('lockQueue')){
				if(Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || (Dubtrack.room.users && Dubtrack.room.users.getIfHasRole(Dubtrack.session.id))){
					if(Dubtrack.room.users.getIfQueueIsActive(Dubtrack.session.id) || (Dubtrack.room.users.getUserQueuedSongs(Dubtrack.session.id) == 0)){
						this.$('.play-song-link').html('Join locked queue').removeClass('leave-button');
					}else{
						this.$('.play-song-link').html('Leave locked queue').addClass('leave-button');
					}
				}else{
					this.$('.play-song-link').html('Queue is locked').addClass('leave-button');
				}
			}else{
				if(Dubtrack.session && Dubtrack.room && Dubtrack.room.users){
					if(Dubtrack.room.users.getIfQueueIsActive(Dubtrack.session.id) || (Dubtrack.room.users.getUserQueuedSongs(Dubtrack.session.id) == 0)){
						this.$('.play-song-link').html('Join queue').removeClass('leave-button');
					}else{
						this.$('.play-song-link').html('Leave queue').addClass('leave-button');
					}
				}else{
					this.$('.play-song-link').html('Join queue').removeClass('leave-button');
				}
			}

			this.$('.play-song-link').addClass('active-queue-display');
			this.$('.play-song-link').removeClass('error-queue');
		}.bind(this), 500);
	},

	displayPlayer : function(){
		this.$('#mods-controllers').hide();
		this.$('#room-info-display').hide();
		this.$('.player_container').show();

		this.$('.player_header .active').removeClass('active');
		this.$('.player_header .displayVideo-el').addClass('active');

		return false;
	},

	displayModsControl : function(){
		this.$('.player_container').hide();
		this.$('#room-info-display').hide();
		this.$('#mods-controllers').show();

		this.$('.player_header .active').removeClass('active');
		this.$('.player_header .display-mods-controls').addClass('active');

		return false;
	},

	diplayRoomInfo : function(){
		this.$('.player_container').hide();
		this.$('#mods-controllers').hide();
		this.$('#room-info-display').show();

		this.$('.player_header .active').removeClass('active');
		this.$('.player_header .room-info-display').addClass('active');

		if(!this.roomInfoView){
			this.roomInfoView = new Dubtrack.View.RoomInfo({
				model : this.model
			}).render();
		}

		return false;
	},

	editRoom: function(){
		if(Dubtrack.session && Dubtrack.room.users && Dubtrack.room.users.getIfOwner(Dubtrack.session.get("_id"))){
			if(this.roomUpdateView) this.roomUpdateView.close();

			this.roomUpdateView = new dt.room.roomFormUpdateViewUpdate({
				model : Dubtrack.room.model
			}).render();

			this.roomUpdateView.$el.appendTo( 'body' );
		}

		return false;
	},

	hideVideo: function(){
		var isOn;

		if (!this.istoggleVideo) {
			this.istoggleVideo = true;
			$('#room-main-player-container').css('visibility', 'hidden');
			$('#room-main-player-container iframe').css('visibility', 'hidden');
			this.hideVideoElBtn.addClass('active');
			isOn = "on";
		} else {
			this.istoggleVideo = false;
			$('#room-main-player-container').css('visibility', 'visible');
			$('#room-main-player-container iframe').css('visibility', 'visible');
			this.hideVideoElBtn.removeClass('active');
			isOn = "off";
		}
	},

	roomUpdate : function(r){
		if(r && r.room){
			if(this.room_type != r.room.roomType){
				this.render();
			}
		}
	},

	displayRoomQueue : function(){
		Dubtrack.app.navigate("/browser/room-queue", {
			trigger: true
		});

		return false;
	},

	openBrowserSearch : function(){
		Dubtrack.app.navigate("/browser/search", {
			trigger: true
		});

		return false;
	},

	displayBrowserSearch : function(){
		if(Dubtrack.room.model.get('lockQueue') && !(Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || (Dubtrack.room.users && Dubtrack.room.users.getIfHasRole(Dubtrack.session.id)))) return;

		if(!Dubtrack.room.users.getIfQueueIsActive(Dubtrack.session.id) && (Dubtrack.room.users.getUserQueuedSongs(Dubtrack.session.id) == 0)) {
			Dubtrack.app.navigate("/browser/search", {
				trigger: true
			});

			return;
		}

		if(this.loading_pause_queue) return false;

		this.$('.play-song-link').removeClass('error-queue').removeClass('leave-button');
		this.$('.play-song-link').html('Loading....');
		this.loading_pause_queue = true;

		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.userQueuePause.replace( ":id", Dubtrack.room.model.get('_id') ),
			queuePaused = Dubtrack.session && Dubtrack.room && Dubtrack.room.users && Dubtrack.room.users.getIfQueueIsActive(Dubtrack.session.id) ? 0 : 1;

		Dubtrack.helpers.sendRequest( url, {
			queuePaused: queuePaused
		}, 'put', function(err){
			if(err) {
				this.$('.play-song-link').addClass('error-queue');

				if(err && err.data && err.data.err && err.data.err.details && err.data.err.details.message){
					this.$('.play-song-link').html(err.data.err.details.message).addClass('leave-button');
				}else{
					this.$('.play-song-link').html('Coundn\'t join queue').addClass('leave-button');
				}
			}else{
				if(queuePaused == 0){
					Dubtrack.app.navigate("/browser/queue", {
						trigger: true
					});
				}
			}

			this.loading_pause_queue = false;
		}.bind(this));

		return false;
	},

	mutePlayer : function(){
		if(this.muted_player){
			this.muted_player = false;

			if(this.volumeBeforeMuted && this.volumeBeforeMuted > 2){
				this.setVolume(this.volumeBeforeMuted);
				Dubtrack.playerController.volumeSliderEl.slider('value', this.volumeBeforeMuted);
			}else{
				this.setVolume(100);
				Dubtrack.playerController.volumeSliderEl.slider('value', 100);
			}
		}else{
			this.muted_player = true;
			this.volumeBeforeMuted = Dubtrack.playerController.volume;
			this.setVolume(0);
			Dubtrack.playerController.volumeSliderEl.slider('value', 0);
		}

		return false;
	},

	render : function(){
		var songInfo = this.activeSong.get('songInfo'),
			song = this.activeSong.get('song'),
			type = "";

		this.skipElBtn.hide();
		this.qualityElBtn.removeClass('show');
		this.refreshElBtn.removeClass('show');
		this.hideVideoElBtn.removeClass('show');

		if(this.refreshTimeout) clearTimeout(this.refreshTimeout);
		if(this.queue_timeout) clearTimeout(this.queue_timeout);
		if(this.videoend_timeout) clearTimeout(this.videoend_timeout);

		this.customEmbedIframeDiv.empty();
		this.$('#room-main-player-container #room-main-player-container-youtube').hide();
		this.$('#room-main-player-container #room-main-player-container-soundcloud').hide();
		if(this.activePlayerDelegate) this.activePlayerDelegate.stop();
		this.activePlayerDelegate = null;

		if(Dubtrack.room.model.get('roomType') == 'iframe'){
			this.room_type = 'iframe';
			this.placeHolder.hide();
			Dubtrack.playerController.$('.currentTime').hide();

			if(this.YTplayerDelegate) this.YTplayerDelegate.close();
			if(this.SCplayerDelegate) this.SCplayerDelegate.close();
			this.YTplayerDelegate = null;
			this.SCplayerDelegate = null;

			$('.remove-if-iframe').removeClass('display-block');
			Dubtrack.playerController.$('.currentSong').html('');
			$('.custom-embed-info').show();
			this.pictureEl.hide();
			this.currentDjName.hide();
			this.loadingEl.hide();
			$('.infoContainer').removeClass('display-block');
			this.$('#room-main-player-container').hide();

			if(this.intervalCounter) clearInterval(this.intervalCounter);
			this.progressEl.css('width', '0%');

			var roomEmbedUrl = Dubtrack.room.model.get('roomEmbed'),
				regexp = /(http:\/\/|https:\/\/|\/\/)(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
				regexpTwitch = /(twitch\.tv)\/([^\&\?\/]+)/;

			if(roomEmbedUrl && regexp.test(roomEmbedUrl)){
				if(regexpTwitch.test(roomEmbedUrl)){
					var match = roomEmbedUrl.match(regexpTwitch);
					try{
						if(match[2]){
							var twitch_channel = match[2];
							this.customEmbedIframeErrorDiv.hide();
							this.customEmbedIframeDiv.show().html('<div id="custom_iframe_overlay"></div><object type="application/x-shockwave-flash" data="https://www-cdn.jtvnw.net/swflibs/TwitchPlayer.swff?channel=' + twitch_channel + '" width="100%" height="100%" id="live_embed_player_flash"> <param name="movie" value="https://www-cdn.jtvnw.net/swflibs/TwitchPlayer.swff?channel=' + twitch_channel + '"> <param name="quality" value="high"> <param name="allowFullScreen" value="true"> <param name="allowScriptAccess" value="always"> <param name="pluginspage" value="http://www.macromedia.com/go/getflashplayer"> <param name="autoplay" value="true"> <param name="autostart" value="true"> <param name="flashvars" value="hostname=www.twitch.tv&amp;start_volume=' + Dubtrack.playerController.volume + '&amp;channel=' + twitch_channel + '&amp;auto_play=true"> <embed src="https://www-cdn.jtvnw.net/swflibs/TwitchPlayer.swff?channel=' + twitch_channel + '" flashvars="hostname=www.twitch.tv&amp;start_volume=' + Dubtrack.playerController.volume + '&amp;channel=' + twitch_channel + '&amp;auto_play=true" width="100%" height="100%" type="application/x-shockwave-flash"> </object>');
						}
					}catch(ex){
						this.customEmbedIframeErrorDiv.show();
					}
				}else{
					this.customEmbedIframeErrorDiv.hide();
					roomEmbedUrl = roomEmbedUrl.replace('http:', 'https:');
					this.customEmbedIframeDiv.show().html('<div id="custom_iframe_overlay"></div><iframe src="' + roomEmbedUrl + '" width="100%" height="100%" frameborder="0" sandbox="allow-scripts allow-same-origin" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
				}
			}else{
				this.customEmbedIframeErrorDiv.show();
			}

			return;
		}else{
			this.room_type = 'room';
			$('.custom-embed-info').hide();
			$('.remove-if-iframe').addClass('display-block');
			$('.infoContainer').addClass('display-block');
			$('body').addClass('no-song-playing');
			this.customEmbedIframeDiv.hide();
			this.customEmbedIframeErrorDiv.hide();

			this.$('#room-main-player-container').show();
		}

		if(songInfo !== null){
			Dubtrack.playerController.$('.currentSong').html( songInfo.name );
			Dubtrack.cache.users.get(song.userid, this.renderUser, this);
			$('body').removeClass('no-song-playing');

			type = songInfo.type;

			if(Dubtrack.session && Dubtrack.session.id){
				if(Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || (Dubtrack.room.users && Dubtrack.room.users.getIfRoleHasPermission(Dubtrack.session.id, 'skip'))){
					this.skipElBtn.show();
				}

				var currentUserDJ = this.activeSong.get('user');
				if( currentUserDJ && currentUserDJ.id == Dubtrack.session.id){
					this.skipElBtn.show();
				}
			}
		}

		switch(type){
			case "youtube":
				this.placeHolder.hide();
				this.buildYT();
				this.playCurrent();
			break;
			case "soundcloud":
			case "dubtrack":
				this.placeHolder.hide();
				this.buildSoundCloud();
				this.playCurrent();
			break;
			default:
				this.loadingEl.hide();
				Dubtrack.playerController.$('.currentSong').html( dubtrack_lang.player.no_one_is_playing );
				this.placeHolder.show();
				this.currentDjName.hide();
				this.pictureEl.hide();
			break;
		}

		//load comments
		//update player controler
		Dubtrack.playerController.update();

		//this.usernameEL.html( dubtrackMain.helpers.getProfileImg(this.model.get('oauth_uid'), this.model.get('username'), this.model.get('oauth_provider')) );
		this.fetchQueueInfo();

		return this;
	},

	displayQueueBrowser: function(){
		Dubtrack.app.navigate("/browser/queue", {
			trigger: true
		});

		return false;
	},

	playCurrent: function(){
		var songInfo = this.activeSong.get('songInfo'),
			song = this.activeSong.get('song'),
			startTime = this.activeSong.get('startTime'),
			sontLength = song.songLength/1000;

		if(startTime > sontLength) return this.videoEnd();

		if(Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || (Dubtrack.room.users && Dubtrack.room.users.getIfRoleHasPermission(Dubtrack.session.id, 'skip'))){
			this.skipElBtn.show();
		}

		this.setTimer( startTime, sontLength );
	},

	playCurrentSong: function(){
		this.playElBtn.hide();
		console.log('play current song');
		if(this.activePlayerDelegate) this.activePlayerDelegate.play();

		return false;
	},

	loadComments: function(){
		return;
	},

	renderUser: function(err, user){
		if(err) return;

		this.activeSong.set('user', user);

		var userInfo = user.get('userInfo');

		if(Dubtrack.room && Dubtrack.room.users) Dubtrack.room.users.setCurrentDJ(user.get("_id"));

		//display user image
		this.pictureEl.html( Dubtrack.helpers.image.getImage(user.get("_id"), user.get("username"), false, true ) ).show();
		this.currentDjName.html( user.get("username") + ' is playing').show();
	},

	realTimeUpdate: function(r){
		var song = this.activeSong.get('song');

		if(song === null || song._id != r.song._id){
			console.log("DUBTRACK UPDATING PLAYER!");
			if(this.activePlayerDelegate) this.activePlayerDelegate.stop();

			this.activeSong.set({
				song: r.song,
				songInfo: r.songInfo,
				startTime: r.startTime,
				user: null
			});

			this.refresh();
			this.render();
		}
	},

	refresh : function(){
		this.playing = false;

		//reset variables
		$('li.downdub').removeClass('downdub');
		$('li.updub').removeClass('updub');
		$(".shared").removeClass('shared');

		this.$('#room-main-player-container #room-main-player-container-youtube').hide();
		this.$('#room-main-player-container #room-main-player-container-soundcloud').hide();
		this.activePlayerDelegate = null;

		this.loadingEl.show();
		$('body').addClass('no-song-playing');
		this.bufferingEl.hide();
		this.progressEl.css( 'width',  0 );
		Dubtrack.playerController.$('.currentTime').hide();

		Dubtrack.playerController.$('.currentSong').html( dubtrack_lang.global.loading );
		this.pictureEl.empty();
		this.currentDjName.empty();

		if(Dubtrack.room && Dubtrack.room.users) Dubtrack.room.users.removeCurrentDJ();
		if(Dubtrack.room && Dubtrack.room.users) Dubtrack.room.users.removeDubs();

		if(this.intervalCounter) clearInterval(this.intervalCounter);
		if(this.videoend_timeout) clearTimeout(this.videoend_timeout);
	},

	fetchQueueInfo : function(){
		return;
		//empty html
		this.queueInfo.empty().removeClass('queue-active');

		//get room active queu
		this.activeQueueCollection.fetch({
			reset: true,

			success : function(){
				var queueCounter = 0;
				_.each(this.activeQueueCollection.models, function(activeQueueItem){
					queueCounter++;

					if(Dubtrack.session.id == activeQueueItem.get('userid')){
						this.queueInfo.html(queueCounter).addClass('queue-active');
					}
				}, this);

				this.displayQueueSongRealtimeUpdate();
			}.bind(this)
		});
	},

	changeYTQuality: function(){
		if(!this.YTplayerDelegate) return false;

		var index = 0,
			levels = this.YTplayerDelegate.getAvailableQualityLevels();

		if(levels.length < 1) return;

		switch(this.playbackQuality){
			case "default":
				this.qualityElBtn.addClass('active-hd');
				this.playbackQuality = "highres";
				index = 0;
			break;
			default:
				this.qualityElBtn.removeClass('active-hd');
				this.playbackQuality = "default";
				index = levels.length - 1;
		}

		if(index >= 0) this.YTplayerDelegate.setPlaybackQuality(levels[index]);

		return false;
	},

	reloadVideo: function(){
		this.activeSong.set({
			song: null,
			songInfo: null,
			user: null,
			startTime: null
		});

		this.refresh();

		this.fetchSong();

		return false;
	},

	videoEnd: function(){
		//this.reloadVideo();
		this.skipElBtn.hide();

		this.playing = false;
	},

	fetchSong : function(){
		var self = this;

		this.refresh();

		this.activeSong.fetch({
			success: function(model, r){
				self.render();
			},

			error: function(){
				self.activeSong.set({
					song: null,
					songInfo: null,
					user: null,
					startTime: null
				});

				self.render();
			}
		});
	},

	loadQueueNumber : function(){},

	getStarTime: function(){
		var startTime = this.activeSong.get('startTime'),
			song = this.activeSong.get('song');

		if(startTime == -1){
			startTime = 0;

			this.activeSong.set({
				'startTime': startTime,
				'played' : Date.now()
			});
		}else{
			if(isNaN(startTime) || !startTime){
				startTime = parseInt((Date.now() - song.played)/1000, 10);

				if(startTime < 0) startTime = 0;

				this.activeSong.set({
					'startTime': startTime
				});
			}
		}

		return startTime;
	},

	buildYT : function(){
		if(this.SCplayerDelegate){
			this.SCplayerDelegate.stop();
			this.SCplayerDelegate.stop();
		}

		this.$('#room-main-player-container #room-main-player-container-soundcloud').empty();

		var song = this.activeSong.get('song'),
			songInfo = this.activeSong.get('songInfo'),
			startTime = this.getStarTime();

		this.$('#room-main-player-container #room-main-player-container-youtube').show();

		if(!this.YTplayerDelegate){
			this.YTplayerDelegate = new Dubtrack.View.YoutubePlayer();
			this.YTplayerDelegate.$el.appendTo(this.$('#room-main-player-container #room-main-player-container-youtube'));
			this.YTplayerDelegate.render(songInfo.fkid, startTime, function(){
				if(this.videoend_timeout) clearTimeout(this.videoend_timeout);
				this.videoend_timeout = setTimeout(function(){
					this.videoEnd();
				}.bind(this), 10000);
			}.bind(this), this, true);
		}else{
			this.YTplayerDelegate.loadVideo(songInfo.fkid, startTime, function(){
				if(this.videoend_timeout) clearTimeout(this.videoend_timeout);
				this.videoend_timeout = setTimeout(function(){
					this.videoEnd();
				}.bind(this), 10000);
			}.bind(this), this, true);
		}

		this.activePlayerDelegate = this.YTplayerDelegate;
		this.playElBtn.hide();
		this.qualityElBtn.addClass('show');
		this.refreshElBtn.addClass('show');
		this.hideVideoElBtn.addClass('show');

		if(song.songLength/1000 == 99999) startTime = -1;

		if(this.istoggleVideo){
			$('#room-main-player-container').css('visibility', 'hidden');
			$('#room-main-player-container iframe').css('visibility', 'hidden');
		}
	},

	buildSoundCloud : function(){
		this.$('#room-main-player-container #room-main-player-container-youtube').hide();
		if(this.SCplayerDelegate){
			this.SCplayerDelegate.stop();
			this.SCplayerDelegate.stop();
		}

		if(this.YTplayerDelegate) this.YTplayerDelegate.stop();
		this.$('#room-main-player-container #room-main-player-container-soundcloud').empty();

		this.refreshElBtn.addClass('show');

		this.$('#room-main-player-container #room-main-player-container-soundcloud').show();

		var song = this.activeSong.get('song'),
			songInfo = this.activeSong.get('songInfo'),
			startTime = this.getStarTime();

		var self = this,
			width = this.$el.innerWidth(),
			height = this.$el.innerHeight();

		if(is_mobile()){
			this.loadingEl.hide();
			this.playElBtn.show();
		}

		if(!this.SCplayerDelegate) this.SCplayerDelegate = new Dubtrack.View.SoundCloudPlayer();

		this.SCplayerDelegate.$el.appendTo( this.$('#room-main-player-container #room-main-player-container-soundcloud') );

		this.SCplayerDelegate.render(songInfo.streamUrl, startTime, function(){
			if(this.videoend_timeout) clearTimeout(this.videoend_timeout);
			this.videoend_timeout = setTimeout(function(){
				this.videoEnd();
			}.bind(this), 10000);
		}.bind(this), this, width, height);

		this.activePlayerDelegate = this.SCplayerDelegate;
	},

	setTimer : function(start, length){
		Dubtrack.playerController.$('.currentTime').show();

		this.videoLength = length;

		if(this.intervalCounter) clearInterval(this.intervalCounter);

		if(length == 99999){
			this.playingLive = true;
			this.minEl.html('');
			this.secEl.html("LIVE");
			return;
		}else{
			this.playingLive = false;
		}

		var countDown = length - start,
			minutesDown = Math.floor(countDown / 60),
			secondsDown = parseInt( countDown - minutesDown * 60, 10);

		if(countDown <= 0) return;

		this.minEl.html("0".substring(minutesDown >= 10) + minutesDown);
		this.secEl.html("0".substring(secondsDown >= 10) + secondsDown);

		var self = this;
		this.intervalCounter = setInterval(function(){
			self.setTimerCounter();
		}, 1000);
	},

	setTimerCounter : function(){
		var song = this.activeSong.get('song');

		var currentTime = 0;
		if(this.activePlayerDelegate && !this.playing){
			currentTime = parseInt((Date.now() - song.played)/1000, 10);
		}else{
			currentTime = this.getCurrentTime();
		}

		var countDown = this.videoLength - currentTime,
			minutesDown = Math.floor(countDown / 60),
			secondsDown = parseInt( countDown - minutesDown * 60, 10),
			songInfo = this.activeSong.get('songInfo');

		if(countDown <= 0) return;

		this.minEl.html("0".substring(minutesDown >= 10) + minutesDown);
		this.secEl.html("0".substring(secondsDown >= 10) + secondsDown);

		var w = currentTime * 100 / (songInfo.songLength/1000);
		this.progressEl.css('width',  w + '%');
	},

	setVolume : function(vol){
		this.player_volume_level = vol;
		Dubtrack.playerController.volume = vol;

		if(vol > 2){
			this.$('.player-controller-container .mute').removeClass('sound-muted');
			this.muted_player = false;
		}else{
			this.$('.player-controller-container .mute').addClass('sound-muted');
			this.muted_player = true;
		}

		if(!this.activePlayerDelegate) return;

		this.activePlayerDelegate.setVolume(vol);
	},

	setVolumeRemote : function(vol){
		if(!this.activePlayerDelegate) return;

		this.activePlayerDelegate.setVolume(vol);
	},

	sync : function(sec){
		if(this.activePlayerDelegate && this.playing) this.activePlayerDelegate.sync(sec);
	},

	getCurrentTime : function(){
		if(this.activePlayerDelegate) return this.activePlayerDelegate.getCurrentTime();
	},

	beforeClose : function(){
		if(this.YTplayerDelegate) this.YTplayerDelegate.close();
		if(this.SCplayerDelegate) this.SCplayerDelegate.close();
		this.YTplayerDelegate = null;
		this.SCplayerDelegate = null;

		if(this.intervalCounter) clearInterval(this.intervalCounter);
		if(this.videoend_timeout) clearTimeout(this.videoend_timeout);

		if(this.playerControls) this.playerControls.close();

		dubtrackMain.config.playerMainContainer.html( $('<div/>', {'class' : 'player_container'} ) );
		dubtrackMain.config.playerContainer = dubtrackMain.config.playerMainContainer.find('div.player_container');
	}
});
