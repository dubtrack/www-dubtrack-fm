Dubtrack.View.SoundCloudPlayer = Backbone.View.extend({
	tagName : 'div',

	id: null,
	url: null,

	scPlayer: null,

	scRebuildTries: 0,

	events : {},

	initialize : function(){
		this.$el.addClass('playerElement soundcloud');

		//set id and url
		this.id = "playeryt-" + Date.now();
	},

	render : function(url, start, onEnd, object){
		this.$el.empty();

		var img_src = "https://res.cloudinary.com/hhberclba/image/upload/c_fill,fl_lossy,f_auto,w_900,h_460/default.png";
		try{
			var songInfo = Dubtrack.room.player.activeSong.get('songInfo');

			if(songInfo && songInfo.images && songInfo.images.thumbnail){
				img_src= songInfo.images.thumbnail.replace('large','original');
			}
		}catch(ex){}

		//create canvas
		this.canvasContEl = $('<div/>', {
			id: this.id
		}).html('<img src="' + img_src + '" alt="" onerror="this.src=\'https://res.cloudinary.com/hhberclba/image/upload/c_fill,fl_lossy,f_auto,w_900,h_460/default.png\'" class="artwork" />')
		.css({
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'width': '100%',
			'height': '100%'
		}).appendTo( this.$el );

		this.$el.append('<a href="https://api.dubtrack.fm/song/' + songInfo._id + '/redirect" class="redirect-link" target="_blank"><span class="soundcloud_watermark icon-soundcloud"></span></a>');

		(url.indexOf("secret_token") == -1) ? url = url + '?' : url = url + '&';
		url = url + 'consumer_key=' + Dubtrack.config.keys.soundcloud;

		this.url = url;

		soundManager.stop('dubtrack_main_player');

		if(!this.scPlayer){
			//create sound with sound manager
			this.scPlayer = soundManager.createSound({
				id: 'dubtrack_main_player',
				stream: true,
				autoLoad: true,
				autoPlay: true,

				onplay: function(){
					this.setVolume( Dubtrack.playerController.volume );
					object.loadingEl.hide();
					object.bufferingEl.hide();
					object.errorElBtn.hide();
					object.playing = true;
				}.bind(this),

				onload: function() {
				}.bind(this),

				onerror: function(){
					object.loadingEl.hide();
					object.bufferingEl.hide();
					object.errorElBtn.show();
					this.playing = false;
				}.bind(this),

				onfinish : function() {
					if(onEnd) onEnd.call();

					this.stop();
				}.bind(this),

				onbufferchange : function(){
				}
			});
		}

		try{
			this.scPlayer.load({
				url: url,
				from: start * 1000,
				position : start * 1000
			});

			this.scPlayer.setPosition(start * 1000);
			this.scPlayer.play();
			this.setVolume( Dubtrack.playerController.volume);
		}catch(ex){
			this.scRebuildTries++;

			if(this.scRebuildTries < 10){
				this.scPlayer = null;
				this.render(url, start, onEnd, object);
			}
		}

		return this;
	},

	play: function(){
		if( this.scPlayer ) this.scPlayer.play();
		this.setVolume( Dubtrack.playerController.volume );
	},

	setPlaybackQuality: function(quality){
	},

	sync: function(sec){
		if( this.scPlayer ) this.scPlayer.setPosition( sec * 1000 );
	},

	getCurrentTime: function(){
		try{
			if( this.scPlayer ) return (this.scPlayer.position / 1000);
		}catch(ex){}
	},

	beforeClose : function(){
		try{
			this.scPlayer.destruct();
			this.scPlayer = null;
		}catch(ex){
			console.log(ex);
		}

		$("#" + this.id).remove();

		console.log("destory sound cloud delegate view");
	},

	stop : function() {
		try{
			if(this.scPlayer){
				return this.scPlayer.stop();
			}
		}catch(ex){}

		soundManager.stop('dubtrack_main_player');
	},

	setVolume : function (volume){
		volume = parseInt(volume,10);

		if(this.scPlayer){
			if(volume > 2) this.scPlayer.unmute();
			else this.scPlayer.mute();

			this.scPlayer.setVolume(volume);
		}
	},
});
