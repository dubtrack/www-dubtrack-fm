/**
 *	Backbone views
 *
 */

Dubtrack.View.Player = Backbone.View.extend({
	el: $('#main_player .player_container'),

	voteCount: 0,

	playbackQuality: 'default',

	events : {
		"click .placeholder": "displayQueueBrowser",
		"click .skip-el": "skipSong",
		"click .playbtn-el": "playCurrentSong",
		"click .refresh-el" : "reloadVideo",
		"click .videoquality-el": "changeYTQuality",
		"click .hideVideo-el": "hideVideo"
	},

	initialize : function(){
		this.istoggleVideo = false;

		this.playing = false;

		this.autoplayStarted = false;

		this.loadingEl = this.$('.loading-el').html(dubtrack_lang.player.loading);
		this.bufferingEl = this.$('.buferring-el').html(dubtrack_lang.player.buffering);
		this.playElBtn = this.$('.playbtn-el');
		this.queueInfo = $('.queue-info');
		this.qualityElBtn = this.$('.videoquality-el');
		this.refreshElBtn = this.$('.refresh-el');
		this.hideVideoElBtn = this.$('.hideVideo-el');
		this.skipElBtn = this.$('.skip-el');
		this.errorElBtn = this.$('.error-el').html(dubtrack_lang.player.error);
		this.placeHolder = this.$('.placeholder');
		this.customEmbedIframeDiv = this.$('#custom_iframe_embed');
		this.customEmbedIframeErrorDiv = this.$('#custom_iframe_embed_error');
		this.jwplayer_container = this.$('#room-main-player-container');

		var activeQueueUrl = Dubtrack.config.urls.roomPlaylist.replace(':id', this.model.id );
		this.actveQueueCollection = new Dubtrack.Collection.RoomActiveQueue();
		this.actveQueueCollection.url = Dubtrack.config.apiUrl + activeQueueUrl;

		Dubtrack.Events.bind('realtime:room-update', this.render, this);

		this.minEl = Dubtrack.playerController.$('.min');
		this.secEl = Dubtrack.playerController.$('.sec');
		this.progressEl = Dubtrack.playerController.$('.progressBg');

		this.pictureEl = Dubtrack.playerController.$('.imgEl');

		var url = Dubtrack.config.urls.roomPlaylistActive.replace( ":id", this.model.id );

		this.activeSong = new Dubtrack.Model.ActiveQueue();
		this.activeSong.url = Dubtrack.config.apiUrl + url;

		this.activeSong.parse = Dubtrack.helpers.parse;

		Dubtrack.Events.bind('realtime:room_playlist-update', this.realTimeUpdate, this);

		//fetch new song
		this.fetchSong();
	},

	setPlayer : function(player_object){
		if(this.player_instance) return;
		//build jwplayer
		this.player_instance = jwplayer('room-main-player-container');

		this.player_instance.setup(_.extend({
			height: "100%",
			controls: false,
			autostart: 1
		}, player_object));

		this.player_instance.on('error', function() {
			this.error_timeout = setTimeout(function(){
				this.jwplayer_container.hide();
				this.errorElBtn.show();
				this.bufferingEl.hide();
				this.loadingEl.hide();
			}.bind(this), 5000);
		}.bind(this));

		this.player_instance.on('ready', function() {
			if(this.istoggleVideo){
				$('#room-main-player-container').css('visibility', 'hidden');
				$('#room-main-player-container iframe').css('visibility', 'hidden');
			}
		}.bind(this));

		this.player_instance.on('firstFrame', function() {
			if(this.error_timeout) clearTimeout(this.error_timeout);
			var startTime = this.getStarTime();
			if(startTime > 1) this.player_instance.seek(startTime);

			if(this.istoggleVideo){
				$('#room-main-player-container').css('visibility', 'hidden');
				$('#room-main-player-container iframe').css('visibility', 'hidden');
			}
		}.bind(this));

		this.player_instance.on('play', function() {
			this.playing = true;
			this.loadingEl.hide();
			this.playElBtn.hide();
			this.bufferingEl.hide();
			this.errorElBtn.hide();
			this.jwplayer_container.show();
			if(this.error_timeout) clearTimeout(this.error_timeout);
		}.bind(this));

		this.player_instance.on('pause', function() {
			this.player_instance.play();
		}.bind(this));

		this.player_instance.on('buffer', function() {
			this.playing = false;
			this.loadingEl.hide();
			this.bufferingEl.show();
		}.bind(this));

		this.player_instance.on('complete', function() {
			this.videoEnd();
		}.bind(this));

		this.setVolume(Dubtrack.playerController.volume);
	},

	skipSong: function(){
		this.skipElBtn.hide();
		Dubtrack.room.chat.skipSong();

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
		if(this.fetchSongTimeout) clearTimeout(this.fetchSongTimeout);

		this.customEmbedIframeDiv.empty();
		this.$('.playerElement').remove();

		if(Dubtrack.room.model.get('roomType') == 'iframe'){
			this.placeHolder.hide();
			Dubtrack.playerController.$('.currentTime').hide();
			$('.remove-if-iframe').removeClass('display-block');
			Dubtrack.playerController.$('.currentSong').html('');
			$('.custom-embed-info').show();
			this.pictureEl.hide();
			this.loadingEl.hide();
			$('.infoContainer').removeClass('display-block');
			if(this.player_instance) this.player_instance.remove();
			this.player_instance = null;

			var roomEmbedUrl = Dubtrack.room.model.get('roomEmbed'),
				regexp = /(http:\/\/|https:\/\/|\/\/)(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

			if(roomEmbedUrl && regexp.test(roomEmbedUrl)){
				this.customEmbedIframeErrorDiv.hide();
				roomEmbedUrl = roomEmbedUrl.replace('http:', 'https:');
				this.customEmbedIframeDiv.show().html('<div id="custom_iframe_overlay"></div><iframe src="' + roomEmbedUrl + '" width="100%" height="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
			}else{
				this.customEmbedIframeErrorDiv.show();
			}

			return;
		}else{
			$('.custom-embed-info').hide();
			$('.remove-if-iframe').addClass('display-block');
			$('.infoContainer').addClass('display-block');
			this.customEmbedIframeDiv.hide();
			this.customEmbedIframeErrorDiv.hide();
		}

		if(songInfo !== null){
			Dubtrack.playerController.$('.currentSong').html( songInfo.name );
			Dubtrack.cache.users.get(song.userid, this.renderUser, this);

			type = songInfo.type;
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
				this.pictureEl.hide();
			break;
		}

		//load comments
		//this.loadComments();
		$('section#room-comments').remove();
		//load queue info
		this.fetchQueueInfo();
		//update player controler
		Dubtrack.playerController.update();

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
			startTime = this.getStarTime(),
			sontLength = song.songLength/1000;

		if(startTime > sontLength) return this.videoEnd();

		if(Dubtrack.session && Dubtrack.room && Dubtrack.room.users && (Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || Dubtrack.room.model.get('userid') == Dubtrack.session.id || Dubtrack.room.users.getIfMod(Dubtrack.session.id) || Dubtrack.session.id == song.userid )){
			this.skipElBtn.show();
		}else{
			if(Dubtrack.session.id == song.userid){
				this.skipElBtn.show();
			}else{
				this.skipElBtn.hide();
			}
		}

		console.log(Dubtrack.session.id == song.userid, Dubtrack.session.id, song.userid);

		if(is_mobile()){
			this.loadingEl.hide();
			this.playElBtn.show();
		}

		this.setTimer( startTime, sontLength );
	},

	playCurrentSong: function(){
		this.playElBtn.hide();
		console.log('play current song');

		if(is_mobile()){
			if(this.player_instance) this.player_instance.play();
		}

		return false;
	},

	loadComments: function(){
		var songInfo = this.activeSong.get('songInfo');

		if(this.playerComments) this.playerComments.close();

		if(songInfo !== null){
			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.songComments.replace( ":id", songInfo._id );

			this.playerComments = new Dubtrack.View.comment();
			this.playerComments.render(url).$el.appendTo($('section#room-comments'));
		}
	},

	renderUser: function(err, user){
		if(err) return;

		this.activeSong.set('user', user);

		var userInfo = user.get('userInfo');

		if(Dubtrack.room && Dubtrack.room.users) Dubtrack.room.users.setCurrentDJ(user.get("_id"));

		//display user image
		this.pictureEl.html( Dubtrack.helpers.image.getImage(user.get("_id"), user.get("username"), false, true ) ).show();
	},

	realTimeUpdate: function(r){
		var song = this.activeSong.get('song');

		if(song === null || song._id != r.song._id){
			console.log("DUBTRACK UPDATING PLAYER!");
			this.refresh();

			this.activeSong.set({
				song: r.song,
				songInfo: r.songInfo,
				startTime: r.startTime,
				user: null
			});

			this.render();
		}
	},

	refresh : function(){
		this.errorElBtn.hide();

		this.playing = false;

		//reset variables
		$('li.downdub').removeClass('downdub');
		$('li.updub').removeClass('updub');
		$(".shared").removeClass('shared');

		this.loadingEl.show();
		this.bufferingEl.hide();
		this.progressEl.css( 'width',  0 );
		Dubtrack.playerController.$('.currentTime').hide();

		Dubtrack.playerController.$('.currentSong').html( dubtrack_lang.global.loading );
		this.pictureEl.empty();

		this.activeSong.set({
			song: null,
			songInfo: null,
			user: null,
			startTime: null
		});

		if(Dubtrack.room && Dubtrack.room.users) Dubtrack.room.users.removeCurrentDJ();
		if(Dubtrack.room && Dubtrack.room.users) Dubtrack.room.users.removeDubs();

		if(this.intervalCounter) clearInterval(this.intervalCounter);
	},

	fetchQueueInfo : function(){
		//empty html
		this.queueInfo.empty().removeClass('queue-active');

		//get room active queu
		this.actveQueueCollection.fetch({
			success : function(){
				var queueCounter = 0;
				_.each(this.actveQueueCollection.models, function(activeQueueItem){
					queueCounter++;

					if(Dubtrack.session.id == activeQueueItem.get('userid')){
						this.queueInfo.html(queueCounter).addClass('queue-active');
					}
				}, this);
			}.bind(this)
		});
	},

	changeYTQuality: function(){
		var index = 0,
			levels = this.player_instance.getQualityLevels();

		if(levels.length < 1) return;

		switch(this.playbackQuality){
			case "default":
				this.qualityElBtn.html("HD ON");
				this.playbackQuality = "highres";
				index = levels.length - 1;
			break;
			case "medium":
				this.qualityElBtn.html("AUTO");
				this.playbackQuality = "default";
			break;
			case "highres":
				this.qualityElBtn.html("HD OFF");
				this.playbackQuality = "medium";
				index = 1;
			break;
			default:
				this.qualityElBtn.html("AUTO");
				this.playbackQuality = "default";
		}

		this.player_instance.setCurrentQuality(index);
	},

	reloadVideo: function(){
		this.refresh();

		this.fetchSong();

		return false;
	},

	hideVideo: function(){
		var isOn;

		if (!this.istoggleVideo) {
			this.istoggleVideo = true;
			$('#room-main-player-container').css('visibility', 'hidden');
			$('#room-main-player-container iframe').css('visibility', 'hidden');
			this.hideVideoElBtn.text('SHOW VIDEO');
			isOn = "on";
		} else {
			this.istoggleVideo = false;
			$('#room-main-player-container').css('visibility', 'visible');
			$('#room-main-player-container iframe').css('visibility', 'visible');
			this.hideVideoElBtn.text('HIDE VIDEO');
			isOn = "off";
		}
	},

	videoEnd: function(){
		this.refresh();
		this.skipElBtn.hide();
		this.jwplayer_container.hide();
		this.queueInfo.empty().removeClass('queue-active');

		this.playing = false;

		var self = this;

		if(this.intervalCounter) clearInterval(this.intervalCounter);
		if(this.refreshTimeout) clearTimeout(this.refreshTimeout);
		if(this.fetchSongTimeout) clearTimeout(this.fetchSongTimeout);

		this.refreshTimeout = setTimeout(function(){
			self.render();
		}, 40000);

		/*this.fetchSongTimeout = setTimeout(function(){
			this.fetchSong();
		}.bind(this), 30000);*/
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

	getStarTime: function(){
		var startTime = this.activeSong.get('startTime'),
			song = this.activeSong.get('song');

		if(startTime == -1){
			startTime = 0;
		}else{
			startTime = parseInt((Date.now() - song.played)/1000, 10);

			if(startTime < 0) startTime = 0;
		}

		this.activeSong.set({
			'startTime': startTime
		});

		return startTime;
	},

	buildYT : function(){
		if(this.getStarTime() < 0) return;

		var song = this.activeSong.get('song'),
			songInfo = this.activeSong.get('songInfo');

		//destroy player
		if(this.player_instance){
			this.player_instance.remove();
			this.player_instance = null;
		}

		var play_object = {
			file: "https://www.youtube.com/watch?v=" + songInfo.fkid,
			provider: 'youtube',
			image: 'https://res.cloudinary.com/hhberclba/image/upload/c_fill,h_460,w_900/tiqxlzynh3rxrkwvzeak.jpg'
		};

		if(!this.player_instance) this.setPlayer(play_object);
		else this.player_instance.load(play_object);

		this.qualityElBtn.addClass('show');
		this.refreshElBtn.addClass('show');
		this.hideVideoElBtn.addClass('show');
	},

	buildSoundCloud : function(){
		var song = this.activeSong.get('song'),
			songInfo = this.activeSong.get('songInfo'),
			url = songInfo.streamUrl;

		(url.indexOf("secret_token") == -1) ? url = url + '?' : url = url + '&';
		url = url + 'consumer_key=' + Dubtrack.config.keys.soundcloud;

		var play_object = {
			file: url,
			type: 'mp3',
			image: 'https://res.cloudinary.com/hhberclba/image/upload/c_fill,h_460,w_900/tiqxlzynh3rxrkwvzeak.jpg'
		};

		if(!this.player_instance) this.setPlayer(play_object);
		else this.player_instance.load(play_object);

		this.refreshElBtn.addClass('show');
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
		//downCounter
		var currentTime = this.getCurrentTime(),
			countDown = this.videoLength - currentTime,
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

		if(!this.player_instance) return;

		if(vol <= 2) this.player_instance.setMute(true);
		else this.player_instance.setMute(false);

		this.player_instance.setVolume(this.player_volume_level);
	},

	setVolumeRemote : function(vol){
		if(!this.player_instance) return;

		if(vol <= 2) this.player_instance.setMute(true);
		else this.player_instance.setMute(false);

		this.player_instance.setVolume(vol);
	},

	getCurrentTime : function(){
		return this.player_instance.getPosition();
	},

	beforeClose : function(){
		if(this.intervalCounter) clearInterval(this.intervalCounter);

		if(this.playerControls) this.playerControls.close();
	}
});
