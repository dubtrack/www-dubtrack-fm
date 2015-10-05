Dubtrack.View.SoundCloudPlayer = Backbone.View.extend({
	tagName : 'div',

	id: null,
	url: null,

	events : {},

	initialize : function(){},

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
		}).html('<canvas id="fft" width="' + this.$el.innerWidth() + '" height="' + this.$el.innerHeight() + '">' +
				'</canvas>' +
				'<img src="' + Dubtrack.config.urls.mediaBaseUrl + '/assets/images/media/dubtrack-player.png" width="80" height="80" alt="" style="position:absolute;z-index:99;top:50%;left:50%;margin-top:-43px;margin-left:-40px" />')
		.css({
			'position': 'absolute',
			'top': 0,
			'left': 0
		}).appendTo( this.$el );

		(url.indexOf("secret_token") == -1) ? url = url + '?' : url = url + '&';
		url = url + 'consumer_key=' + Dubtrack.config.keys.soundcloud;

		soundManager.setup({
			url: '/assets/swf/',

			flashVersion: 9,

			onready: function() {
				//create sound with sound manager
				self.scPlayer = soundManager.createSound({
					id: 'dubtrack_main_player',
					url: url,
					autoLoad: true,
					autoPlay: self.loadBg ? false : true,
					stream: true,
					from: start,
					position : start,
					usePeakData : true,
					volume : self.loadBg ? 0 : Dubtrack.playerController.volume,

					onplay: function(){
						self.setVolume( Dubtrack.playerController.volume, true );
						object.loadingEl.hide();
						object.bufferingEl.hide();
						object.errorElBtn.hide();
						object.playing = true;
						//object.playElBtn.hide();
					},

					onload: function() {
					},

					onerror: function(){
						object.loadingEl.hide();
						object.bufferingEl.hide();
						object.errorElBtn.show();
						this.playing = false;
					},

					whileplaying: function() {
						self.drawSpectrum( this.peakData.right, this.peakData.left );
						//object.playElBtn.hide();
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

	drawSpectrum : function(r, l){
		var fftEl = document.getElementById('fft'),
			fft =   fftEl.getContext("2d"),
			wEl  = fftEl.clientWidth/2,
			hEl  = fftEl.clientHeight/2;
		//h=h/8;
		//clear canvas
		fft.fillStyle = "rgba(0,0,0,0.7)";
		fft.beginPath();
		fft.arc(wEl,hEl,1000,0,Math.PI*4,true);
		fft.closePath();
		fft.fill();

		//fill canvas
		//left
		fft.fillStyle = "rgba(0,255,255,0.5)";
		fft.beginPath();
		fft.arc(wEl,hEl,l*100,0,Math.PI*8,true);
		fft.closePath();
		fft.fill();
		//right
		fft.fillStyle = "rgba(249,0,254,0.7)";
		fft.beginPath();
		fft.arc(wEl,hEl,r*100,0,Math.PI*8,true);
		fft.closePath();
		fft.fill();
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

	setVolume : function (volume){

		if(this.scPlayer){
			this.scPlayer.unmute();
			this.scPlayer.setVolume(parseInt(volume,10));
		}
	},
});
