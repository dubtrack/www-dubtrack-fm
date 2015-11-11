Dubtrack.View.SoundCloudPlayer = Backbone.View.extend({
	tagName : 'div',

	id: null,
	url: null,

	events : {},

	initialize : function(){},
    
    renderSC: function () {
        var SCurl;
        $.ajax({
            url: Dubtrack.room.player.activeSong.url,
            success: function (f) {
                SCurl = f.data.songInfo.images.thumbnail.replace('large','original');
            },
            async: false
        });
        return SCurl
    },

	render : function( url, start, onEnd, object, loadBg ){
		var self = this;

		//set id and url
		this.id = "playeryt-" + Date.now();
		this.url = url;

		this.loadBg = loadBg;

		this.$el.addClass('playerElement soundcloud');
		if(loadBg) this.$el.addClass('hiddenPlayer');

		//create canvas
        
		this.canvasContEl = $('<div/>', {
			id: this.id
            
            
		}).html('<img src="'+this.renderSC()+'" alt="" />')
		.css({
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'width': '100%',
			'height': '100%'
		}).appendTo( this.$el );
        
		(url.indexOf("secret_token") == -1) ? url = url + '?' : url = url + '&';
		url = url + 'consumer_key=' + Dubtrack.config.keys.soundcloud;

		soundManager.setup({
			url: '/assets/swf/',
			preferFlash: false,
			onready: function() {
				//create sound with sound manager
				self.scPlayer = soundManager.createSound({
					id: 'dubtrack_main_player',
					url: url,
					autoLoad: true,
					autoPlay: self.loadBg ? false : true,
					stream: true,
					from: start * 1000,
					position : start * 1000,
					usePeakData : true,
					volume : self.loadBg ? 0 : Dubtrack.playerController.volume,

					onplay: function(){
						self.setVolume( Dubtrack.playerController.volume, true );
						object.loadingEl.hide();
						object.bufferingEl.hide();
						object.errorElBtn.hide();
						object.playing = true;
					},

					onload: function() {
						//self.scPlayer.setPosition( start * 1000 );
						self.setVolume( Dubtrack.playerController.volume )
					},

					onerror: function(){
						object.loadingEl.hide();
						object.bufferingEl.hide();
						object.errorElBtn.show();
						this.playing = false;
					},

					onfinish : function() {
						if(onEnd) onEnd.call();
					},

					onbufferchange : function(){
					}
				});
			}
		});

		return this;
	},

	play: function(){
		this.loadBg = false;

		this.$el.removeClass('hiddenPlayer');
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
			if(this.scPlayer) return this.scPlayer.stop();
		}catch(ex){}
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
