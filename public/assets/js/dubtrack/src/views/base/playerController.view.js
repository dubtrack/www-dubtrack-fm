Dubtrack.View.PlayerController = Backbone.View.extend({
	el: $("#player-controller"),

	volume: 100,

	events : {
		"click .dubup": "voteUpAction",
		"click .dubdown": "voteDownAction",
		"click .add-to-playlist": "addToPlaylist",
		"click .display-browser": "displayBrowser"
	},

	initialize : function(){
		var self = this;

		this.$el.html( _.template( Dubtrack.els.templates.layout.playerController ) );

		this.volumeSliderEl = $('#volume-div');

		this.fetchQueueInfoThrottled = _.debounce(this.fetchQueueInfo.bind(this), 1000);

		Dubtrack.Events.bind('realtime:room_playlist-dub', this.realTimeDub, this);
		Dubtrack.Events.bind('realtime:room_playlist-queue-update-grabs', this.realTimeGrab, this);
		Dubtrack.Events.bind('realtime:room_playlist-update', this.realTimeUpdate, this);
		Dubtrack.Events.bind('realtime:room_playlist-queue-reorder', this.fetchQueueInfoThrottled, this);
		Dubtrack.Events.bind('realtime:room_playlist-queue-update-dub', this.fetchQueueInfoThrottled, this);
		Dubtrack.Events.bind('realtime:room_playlist-queue-remove-user', this.fetchQueueInfoThrottled, this);
		Dubtrack.Events.bind('realtime:user-leave', this.fetchQueueInfoThrottled, this);

		this.volumeControl();
	},

	update : function(){
		this.addToPlaylistButton = this.$('.add-to-playlist-button');
		this.voteUp = $('.dubup');
		this.voteUpCounter = $('.dubup .dub-counter');
		this.grabCounter = $('.add-to-playlist-button .grab-counter');
		this.voteDown = $('.dubdown');
		this.voteDownCounter = $('.dubdown .dub-counter');
		this.queuePosition = this.$('.queue-position');
		this.queuePositionSplit = this.$('.queue-position-split');
		this.queueTotal = this.$('.queue-total');
		this.inQueue = false;

		this.updateVote();
		this.fetchQueueInfo();

		return false;
	},

	realTimeUpdate : function(e){
		Dubtrack.helpers.cookie.delete('dub-' + Dubtrack.room.model.get("_id"));
		Dubtrack.helpers.cookie.delete('grab-' + Dubtrack.room.model.get("_id"));

		this.fetchQueueInfoThrottled.call();
	},

	addToPlaylist : function(e){
		if(!Dubtrack.loggedIn) return;

		var song = Dubtrack.room.player.activeSong.get('song');

		if( !Dubtrack.room ||  song === null ) return false;

		var position = {
			right: 200,
			bottom: 43
		};

		Dubtrack.helpers.genPlaylistContainer( $('body'), position, song.songid, false, 'playerBottomFixed' );

		$("html, body").scrollTop(0);

		return false;
	},

	displayBrowser : function(){
		Dubtrack.app.navigate("/browser/queue", {
			trigger: true
		});
	},

	fetchQueueInfo : function(){
		if(! Dubtrack.room || ! Dubtrack.room.player || ! Dubtrack.room.player.activeQueueCollection) return;

		//get room active queue
		Dubtrack.room.player.activeQueueCollection.fetch({
			reset: true,

			success : function(a, b, c){
				var queueCounter = 0;
				var tempInQueue = false;

				if(this.queueTotal && this.queueTotal.html() != Dubtrack.room.player.activeQueueCollection.length) this.queueTotal.html(Dubtrack.room.player.activeQueueCollection.length);
				if(Dubtrack.app.browserView) Dubtrack.app.browserView.$('#playlists-scroll .current_room_queue .playlist-items-count').text(Dubtrack.room.player.activeQueueCollection.length);

				_.each(Dubtrack.room.player.activeQueueCollection.models, function(activeQueueItem){
					queueCounter++;

					var userQueueRooms = Dubtrack.room.users.collection.findWhere({
						"userid" : activeQueueItem.get('userid')
					});

					if(userQueueRooms) {
						userQueueRooms.set({
							'songsInQueue' : activeQueueItem.get('songsInQueue'),
							'queuePaused' : activeQueueItem.get('queuePaused')
						});
					}

					if(Dubtrack.session.id == activeQueueItem.get('userid')){
						this.inQueue = true;
						tempInQueue = true;
						this.queuePositionSplit.show();
						this.queuePosition.html(queueCounter);

						if(Dubtrack.app.browserView) {
							Dubtrack.app.browserView.$('#playlists-scroll .current_queue .playlist-items-count').text(activeQueueItem.get('songsInQueue'));
						}
					}
				}, this);

				if(!tempInQueue){
					this.inQueue = false;

					if(Dubtrack.app.browserView) Dubtrack.app.browserView.$('#playlists-scroll .current_queue .playlist-items-count').text(0);

					//empty html
					this.queuePosition.empty();
					this.queuePositionSplit.hide();
				}

				Dubtrack.room.player.displayQueueSongRealtimeUpdate();
			}.bind(this)
		});

	},

	voteUpAction : function(){
		this.vote('updub');

		return false;
	},

	voteDownAction : function(){
		this.vote('downdub');

		return false;
	},

	realTimeDub: function(r){
		var song = Dubtrack.room.player.activeSong.get('song');

		if( !Dubtrack.room ||  song === null || r.playlist._id !== song._id) return;

		this.voteUpCounter.text(r.playlist.updubs);
		this.voteDownCounter.text(r.playlist.downdubs);
		this.grabCounter.text(r.playlist.grabs);

		Dubtrack.room.player.activeSong.set({
			song: r.playlist
		});
	},

	realTimeGrab : function(r){
		if(r && r.playlist && r.playlist.grabs){
			this.grabCounter.text(r.playlist.grabs);

			if(Dubtrack.session && Dubtrack.session.id == r.user._id){
				this.addToPlaylistButton.addClass('grabbed');
				Dubtrack.helpers.cookie.set('grab-' + Dubtrack.room.model.get("_id"), "grab", 30);
			}
		}
	},

	shareFacebook : function(){
		var song = Dubtrack.room.player.activeSong.get('songInfo');

		//var url = encodeURIComponent(dubtrackMain.config.globalBaseUrl + 'dubs/view/id/' + dubtrackMain.app.dtPlayer.model.get("url") + '/type/' + dubtrackMain.app.dtPlayer.model.get("type"));
		var url = encodeURIComponent(Dubtrack.config.globalBaseUrl + 'join/' + Dubtrack.room.model.get("roomUrl") );

		var title = "";

		if( !Dubtrack.room ||  song === null){
			title = "Join my dubtrack.fm room";
		}else{
			title = encodeURIComponent( _.template(dubtrack_lang.room.facebookShare, {song : song.name}) );
		}

		var target = "https://www.facebook.com/sharer.php?u=" + url + "&t=" + title;

		var windowName = dubtrack_lang.room.shareTitle;
		var windowSize = "width=600,height=500,scrollbars=yes";

		window.open(target, windowName, windowSize);

		return false;
	},

	shareTwitter : function(){
		var song = Dubtrack.room.player.activeSong.get('songInfo');

		var url = encodeURIComponent(Dubtrack.config.globalBaseUrl + 'join/' + Dubtrack.room.model.get("roomUrl") );

		var title = "";

		if( !Dubtrack.room ||  song === null){
			title = "Join my dubtrack.fm room";
		}else{
			title = encodeURIComponent( _.template(dubtrack_lang.room.twitterShare, {song : song.name}) );
		}

		var target = "https://twitter.com/share?url=" + url + "&text=" + title;

		var windowName = dubtrack_lang.room.shareTitle;
		var windowSize = "width=600,height=500,scrollbars=yes";

		window.open(target, windowName, windowSize);

		return false;
	},

	vote : function(voteType){
		if(!Dubtrack.loggedIn) return;

		var song = Dubtrack.room.player.activeSong.get('song');
		if( !Dubtrack.room ||  song === null) return;

		var url = Dubtrack.config.urls.dubsPlaylistActive.replace(":id", Dubtrack.room.model.get("_id")).replace(":playlistid", song._id);

		var cookie = Dubtrack.helpers.cookie.get('dub-' + Dubtrack.room.model.get("_id")),
			dubsong = Dubtrack.helpers.cookie.get('dub-song'),
			totalVoted = song.updubs - song.downdubs;

		if(song.songid !== dubsong) cookie = null;

		if(!cookie || cookie !== voteType){
			Dubtrack.helpers.sendRequest( Dubtrack.config.apiUrl + url, {
				type: voteType
			}, 'post');

			$(".voted").removeClass("voted");
			Dubtrack.helpers.cookie.set('dub-' + Dubtrack.room.model.get("_id"), voteType, 30);
			Dubtrack.helpers.cookie.set('dub-song', song.songid, 30);

			if(voteType === "updub"){
				var currentUpDubs = parseInt(this.voteUpCounter.text(), 10);
				var currentDownDubs = parseInt(this.voteDownCounter.text(), 10);

				if (cookie) {
					this.voteDownCounter.text(currentDownDubs - 1);
					totalVoted = totalVoted + 1;
				}

				this.voteUpCounter.text(currentUpDubs + 1);
				totalVoted = totalVoted + 1;
			}else{
				var currentUpDubs = parseInt(this.voteUpCounter.text(), 10);
				var currentDownDubs = parseInt(this.voteDownCounter.text(), 10);

				if (cookie) {
					this.voteUpCounter.text(currentUpDubs - 1);
					totalVoted = totalVoted - 1;
				}

				this.voteDownCounter.text(currentDownDubs + 1);
				totalVoted = totalVoted - 1;
			}
		}

		if(voteType == "updub"){
			this.voteUp.addClass("voted");
		}else{
			this.voteDown.addClass("voted");
		}
	},

	updateVote : function(){
		//reset els
		$(".voted").removeClass("voted");
		this.addToPlaylistButton.removeClass('grabbed');

		this.grabCounter.text(0);
		this.voteUpCounter.text(0);
		this.voteDownCounter.text(0);

		var song = Dubtrack.room.player.activeSong.get('song');

		if(song === null) return;

		var	totalVoted = song.updubs - song.downdubs,
			cookie = Dubtrack.helpers.cookie.get('dub-' + Dubtrack.room.model.get("_id")),
			cookieGrab = Dubtrack.helpers.cookie.get('grab-' + Dubtrack.room.model.get("_id")),
			dubsong = Dubtrack.helpers.cookie.get('dub-song'),
			addsign = "";

		if(song.songid !== dubsong) cookie = null;

		if(isNaN(totalVoted)) totalVoted = 0;

		if(cookie){
			if(cookie === "updub") this.voteUp.addClass("voted");
			else this.voteDown.addClass("voted");
		}

		if(cookieGrab){
			this.addToPlaylistButton.addClass('grabbed');
		}

		this.voteUpCounter.text(song.updubs);
		this.voteDownCounter.text(song.downdubs);
		if(song.grabs) this.grabCounter.text(song.grabs);
	},

	volumeControl : function(){
		var self = this;

		var volume = Dubtrack.helpers.cookie.get('dubtrack-room-volume');

		if(!volume) volume = 100;
		//if( dubtrackMain.roomModel.get('user.settings.volume_is_muted') ) dubtrackMain.roomModel.set({ 'user.settings.volume' : 0 });

		this.volumeSliderEl.slider({
			value: volume,

			orientation: "horizontal",

			range: "min",

			animate: false,

			slide: function(event, ui) {
				self.setVolume( ui.value, false );
			},

			change : function(event, ui){
				self.setVolume( ui.value, true );
			}
		});

		this.setVolume( volume );
	},

	setVolume: function(value){
		Dubtrack.helpers.cookie.set('dubtrack-room-volume', value, 30);
		this.volume = value;

		if(Dubtrack.room.player) Dubtrack.room.player.setVolume( value );
	}
});
