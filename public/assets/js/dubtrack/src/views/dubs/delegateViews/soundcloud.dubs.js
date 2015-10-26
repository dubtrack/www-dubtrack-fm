scDubsPlayerView = Backbone.View.extend({
	tagName : 'div',

	className : 'player soundcloud',

	events : {
		"click .pause" : "pause",
		"click .play"  : "play",
		"click .progressContainer" : "setPosition",
		"click .replay"	: "replay",
		"click canvas"	: "play"
	},

	initialize : function(){

	},

	render : function(url, id, type, autoPlay, $w, $h){
		var el = $(this.el);
		//create controls
		Dubtrack.els.controls(el, this);

		this.playerWidth = ( $w ? $w : Dubtrack.config.player.playerEmbedWidth );
		this.playerHeight = ( $h ? $h : Dubtrack.config.player.playerEmbedHeight );

		//create canvas
		this.canvasContEl = $('<div/>', {
			id: this.id
		}).html('<img src="' + Dubtrack.config.urls.mediaBaseUrl + '/assets/images/media/dubtrack-player.png"  alt="" />')
		.addClass('playerImage SCplayerImage')
		.appendTo( this.$el );

		this.buildVolume();

		//if player exists destroy it
		if(this.scPlayer) this.scPlayer.destruct();

		this.replayEl.hide();

		if(type == "soundcloud"){
			(url.indexOf("secret_token") == -1) ? url = url + '?' : url = url + '&';
			url = url + 'consumer_key=' + Dubtrack.config.keys.soundcloud;
		}

		var self = this;

		this.playEl.css("display", "block");

		//store current main Player volume
		if(Dubtrack.playerController){
			this.main_player_volume = Dubtrack.playerController.volume;
		}

		soundManager.setup({
			url: '/assets/swf/',
			flashVersion: 9,

			onready: function() {

				self.loadingEl.hide();
				self.playEl.css("display", "block");

				//create sound with sound manager
				self.scPlayer = soundManager.createSound({
					id: id,
					url: url,
					autoLoad:true,
					autoPlay:false,
					stream: true,

					onerror : function() {
						self.errorEl.show();
					},

					whileplaying: function() {
						self.progressEl.css({
							width : parseInt((this.position * parseInt( self.progressOuterEl.outerWidth(), 10))/this.duration, 10)
						});
					},

					onfinish : function() {
						self.pauseEl.hide();
						self.playEl.css("display", "block");
						self.replayEl.show();

						if(Dubtrack.room.player){
							Dubtrack.room.player.setVolumeRemote(Dubtrack.playerController.volume);
						}
					},

					onbufferchange : function(){
						if( ! is_touch() ){
							if(this.isBuffering) self.bufferingEl.show();
							else self.bufferingEl.hide();
						}
					}
				});
			}
		});

		if(autoPlay) self.play();

		return this;
	},

	replay : function(){
		this.setPosition(0);
		this.play();
	},

	play :  function(){
		if(this.scPlayer){
			try{
				if(Dubtrack.room.player){
					Dubtrack.room.player.setVolumeRemote(0, true);
				}

				this.playEl.hide();
				this.pauseEl.css("display", "block");
				this.scPlayer.play();
				this.replayEl.hide();
			}catch(ex){
				console.log("SC ERROR: " + ex)
			}
		}
		return false;
	},
	pause : function(){
		if(this.scPlayer){
			try{
				if(Dubtrack.room.player){
					Dubtrack.room.player.setVolumeRemote(Dubtrack.playerController.volume);
				}else{
					Dubtrack.room.player.setVolumeRemote(self.main_player_volume);
				}

				this.pauseEl.hide();
				this.playEl.css("display", "block");
				this.scPlayer.pause();
			}catch(ex){
				console.log("SC ERROR: " + ex)
			}
		}
		return false;
	},
	setPosition : function(e){
		if(this.scPlayer){
			 this.scPlayer.stop();
			 this.scPlayer.setPosition(parseInt( ( e.offsetX / this.progressOuterEl.outerWidth() ) * this.scPlayer.duration ) );
			this.playEl.hide();
			this.pauseEl.css("display", "block");
			this.scPlayer.play();
		}
	},
	setVolume : function(vol){
		if(this.scPlayer) this.scPlayer.setVolume(parseInt(vol));
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
					};

					self.setVolume(value);

				},

				stop: function(event,ui) {
					tooltip.fadeOut('fast');
				},
			});

	},

	setVolume : function (newVolume) {
		if(this.scPlayer){
			this.scPlayer.unmute();
			this.scPlayer.setVolume(parseInt(newVolume));
		}
	},

	beforeClose : function(){
		if(Dubtrack.room.player){
			Dubtrack.room.player.setVolumeRemote(Dubtrack.playerController.volume);
		}

		if(this.scPlayer){
			this.scPlayer.destruct();
			this.scPlayer.stop();
		}

		this.remove();
		this.unbind();
		console.log("destory sound cloud delegate view");
	}
});
