var ytDubsPlayerView = Backbone.View.extend({
	tagName : 'div',

	className : 'player youtube',

	events : {
		"click .pause" : "pause",
		"click .play"  : "play",
		"click .progressContainer" : "setPlayer",
		"click .replay"	: "replay"
	},
	initialize : function(){
	},

	render : function(videoId, id, autoPlay, $w, $h){
		var el = $(this.el);
		//create controls
		Dubtrack.els.controls(el, this);

		//create elements
		this.id = id;
		this.playerEl = $('<div/>', { id : id }).appendTo( el );
		this.videoId = videoId;
		this.replayEl.hide();

		this.mainYTimg = $('<div/>', {'class' : 'playerImage'}).html('<img src="http://img.youtube.com/vi/' + videoId + '/0.jpg" alt="">').appendTo( el );

		var self = this;
		this.mainYTimg.on('click', function(){
			self.play();
		});

		this.buildVolume();

		this.playerWidth = ( $w ? $w : Dubtrack.config.player.playerEmbedWidth );
		this.playerHeight = ( $h ? $h : Dubtrack.config.player.playerEmbedHeight );

		//store current main Player volume
		if(Dubtrack.playerController){
			this.main_player_volume = Dubtrack.playerController.volume;
		}

		return this;
	},

	buildPlayer : function(autoplay){
		var self = this;

		this.intervalUpdate = null;
		this.player = new YT.Player( this.id , {
			width	: self.playerWidth,
			height	: self.playerHeight,
			videoId	: self.videoId,
			playerVars: Dubtrack.config.player.youtube.playerParams,
			events: {
				'onReady': function(){
								self.loadingEl.hide();
								if(self.intervalLoaded) clearTimeout(self.intervalLoaded);
								self.updateytplayerloaded();
								self.pause();

								if(autoplay) self.play();
							},
				'onStateChange': function(newState){
								console.log("YT player state changed => " + newState.data);
								switch(newState.data){
									case -1:
									break;
									case 0:
										self.mainYTimg.show();
										self.replayEl.show();

										if(Dubtrack.room.player){
											Dubtrack.room.player.setVolumeRemote(Dubtrack.playerController.volume);
										}
									break;
									case 1:
										self.play();
									break;
									case 2:
										self.pause();
										self.bufferingEl.hide();
									break;
									case 3:
										self.bufferingEl.show();
									break;
									default:
									break;
								}
							},
				'onError': function(e){
								self.errorEl.html("ERROR: " + e.data);
								self.errorEl.show();
							}
				}
		});
	},

	onPlayerStateChange : function(event){
	},

	replay : function(){
		if(this.player){
			this.mainYTimg.hide();
			this.setPlayer(0);
		}
	},

	play :  function(){
		if(this.player){
			try{
				if(Dubtrack.room.player){
					Dubtrack.room.player.setVolumeRemote(0, true);
				}

				this.mainYTimg.hide();
				this.bufferingEl.hide();
				this.replayEl.hide();
				this.playEl.hide();
				this.pauseEl.show();
				this.player.playVideo();
				this.updateytplayerInfo();

				if(!this.intervalLoaded) this.updateytplayerloaded();
			}catch(ex){
				console.log("YT ERROR: " + ex);
			}
		}
		return false;
	},

	pause : function(){
		if(this.player){
			try{
				if(Dubtrack.room.player){
					Dubtrack.room.player.setVolumeRemote(Dubtrack.playerController.volume);
				}else{
					Dubtrack.room.player.setVolumeRemote(self.main_player_volume);
				}

				this.pauseEl.hide();
				this.playEl.show();
				this.player.pauseVideo();
				clearInterval( this.intervalUpdate );
			}catch(ex){
				console.log("YT ERROR: " + ex);
			}
		}
		return false;
	},

	updateytplayerloaded : function(){
		if(this.player){
			var self = this;
			this.intervalLoaded = setInterval(
										function(){
											self.loadedEl.css( { width : ( parseInt( self.player.getVideoLoadedFraction() *100, 10) ) + "%" } );
											if( self.player.getVideoLoadedFraction() >= 1){
												clearInterval(self.intervalLoaded);
												delete self.intervalLoaded;
											}
										}, 1000);
		}
	},

	updateytplayerInfo : function(){
		if(this.player){
			var self = this;
			this.intervalUpdate = setInterval(
										function(){
											self.progressEl.css( { width : parseInt( ( self.player.getCurrentTime() * parseInt( self.progressOuterEl.outerWidth(), 10 ) )/self.player.getDuration(), 10 ) } );
										}, 1000);
		}
	},

	setPlayer : function(e){
		this.play();
		this.player.seekTo( ( e.offsetX / this.progressOuterEl.outerWidth() ) * this.player.getDuration(), true );
	},

	buildVolume : function(){

		var slider  = this.volumeContainer.find('.volume-control'),
			tooltip = this.volumeContainer.find('.tooltip'),
			self = this;

			//Hide the Tooltip at first
			tooltip.hide();

			//Call the Slider
			slider.slider({
				//Config
				range: "min",
				min: 1,
				value: 100,

				start: function(event,ui) {
					tooltip.fadeIn('fast');
				},

				//Slider Event
				slide: function(event, ui) { //When the slider is sliding

					var value  = slider.slider('value'),
						volume = self.volumeContainer.find('.volume');

					tooltip.css('left', value).text(ui.value);  //Adjust the tooltip accordingly

					if(value <= 5) {
						volume.css('background-position', '0 0');
					}
					else if (value <= 25) {
						volume.css('background-position', '0 -25px');
					}
					else if (value <= 75) {
						volume.css('background-position', '0 -50px');
					}
					else {
						volume.css('background-position', '0 -75px');
					}

					self.setVolume(value);

				},

				stop: function(event,ui) {
					tooltip.fadeOut('fast');
				},
			});

	},

	setVolume : function (newVolume) {
		if(this.player){
			this.player.unMute();
			this.player.setVolume( newVolume );
		}
	},

	beforeClose : function(){
		if(Dubtrack.room.player){
				Dubtrack.room.player.setVolumeRemote(Dubtrack.playerController.volume);
		}

		if(this.player){
			console.log("destory youtube delegate view");
			try{
				this.player.stop();
				this.player.destroy();
			}catch(ex){
				console.log("YT error " + ex);
			}
			clearInterval( this.intervalUpdate );
		}
	}
});
