Dubtrack.View.YoutubePlayer = Backbone.View.extend({
	tagName: 'div',

	id: null,
	url: null,

	initialize: function(){
	},

	loadVideo : function(url, start, onEnd, object, loadBg){
		this.url = url;

		var params = Dubtrack.config.player.youtube.youtubeVars;
		console.log("YOUTUBE START TIME: ", start);
		if(start >= 0){
			params.start = start;
		}

		this.player.loadVideoById({
			width: Dubtrack.config.player.playerWidth,
			height: Dubtrack.config.player.playerHeight,
			startSeconds: start,
			videoId: url,
			playerVars: params,
			events: {
				'onReady': function(event){
					object.errorElBtn.hide();
					object.loadingEl.hide();
					self.setVolume( Dubtrack.playerController.volume );

					self.setPlaybackQuality( object.playbackQuality );

					if(!is_mobile()){
						self.play();
					}
				},

				'onError': function(e){
					object.loadingEl.hide();
					object.playing = false;
					console.log("YOUYUBE ERROR", e);
				},

				'onStateChange': function(newState){
					console.log("YT player stated changed => " + newState.data);
					switch(newState.data){
						case 0:
							if(onEnd) onEnd.call();
						break;
						case 1:
								object.loadingEl.hide();
								object.bufferingEl.hide();
								object.playing = true;
								object.autoplayStarted = true;
						break;
						case 3:
							object.bufferingEl.show();
							object.playing = false;
						break;
						case 2:
							self.play();
						break;
						default:
						break;
					}
				}
			}
		});
	},

	render: function(url, start, onEnd, object, loadBg){
		var self = this;

		console.log("Dubtrack building youtube player");

		//set id and url
		this.id = "playeryt-" + Date.now();
		this.url = url;

		this.ytPlayerContainer = $('<div/>', {
			id: this.id
		}).appendTo( this.$el );

		this.loadBg = loadBg;

		this.$el.addClass('playerElement youtube');
		if(loadBg) this.$el.addClass('hiddenPlayer');

		var params = Dubtrack.config.player.youtube.youtubeVars;

		console.log("YOUTUBE START TIME: ", start);
		if(start >= 0){
			params.start = start;
		}

		object.loadingEl.hide();

		try{
			this.player = new YT.Player( this.id, {
				width: Dubtrack.config.player.playerWidth,
				height: Dubtrack.config.player.playerHeight,
				startSeconds: start,
				videoId: url,
				playerVars: params,
				events: {
					'onReady': function(event){
						object.errorElBtn.hide();
						self.setVolume( Dubtrack.playerController.volume );

						self.setPlaybackQuality( object.playbackQuality );

						if(!is_mobile()){
							self.play();
						}
					},

					'onError': function(e){
						object.playing = false;
						console.log("YOUYUBE ERROR", e);
					},

					'onStateChange': function(newState){
						console.log("YT player stated changed => " + newState.data);
						switch(newState.data){
							case 0:
								if(onEnd) onEnd.call();
							break;
							case 1:
									object.loadingEl.hide();
									object.bufferingEl.hide();
									object.playing = true;
									object.autoplayStarted = true;
							break;
							case 3:
								object.bufferingEl.show();
								object.playing = false;
							break;
							case 2:
								self.play();
							break;
							default:
							break;
						}
					}
				}
			});

		}catch(ex){
			console.log("DUBTRACK YT ERROR " + ex + " reloading player in 1000ms");
			setTimeout(function(){
				self.render(url, start, onEnd, object, loadBg);
			}, 1000);
		}

		return this;
	},

	play:  function(){
		this.loadBg = false;

		this.$el.removeClass('hiddenPlayer');

		if(this.player){
			var player = this.player;

			try{
				player.playVideo();
			}catch(ex){
				console.log("YT ERROR: " + ex);
			}
		}

		this.setVolume( Dubtrack.playerController.volume, true );

		return false;
	},

	sync : function(sec){
		console.log("YT SYNC", sec);
		if(this.player) this.player.seekTo( sec, true );
	},

	setPlaybackQuality: function(quality){
		if(this.player){
			this.player.setPlaybackQuality(quality);
		}
	},

	getAvailableQualityLevels : function(){
		if(this.player){
			return this.player.getAvailableQualityLevels();
		}else{
			return [];
		}
	},

	getCurrentTime : function(){
		try{
			if(this.player) return this.player.getCurrentTime();
		}catch(ex){}
	},

	stop : function() {
		try{
			if(this.player) return this.player.stopVideo();
		}catch(ex){}
	},

	beforeClose : function(){
		console.log("destroy youtube delegate view parent");

		try{
			this.player.destroy();
			this.player = null;
		}catch(ex){
			console.log(ex);
		}

		$("#" + this.id).remove();
	},

	setVolume : function (newVolume) {
		newVolume = parseInt(newVolume, 10);

		if(this.player){
			try{
				if(newVolume > 2) this.player.unMute();
				else this.player.mute();

				this.player.setVolume( newVolume );
			}catch(ex){}
		}
	}
});
