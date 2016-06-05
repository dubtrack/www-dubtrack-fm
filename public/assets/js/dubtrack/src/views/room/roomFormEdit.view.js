dt.room.roomFormUpdateViewUpdate = Backbone.View.extend({
	attributes: {
		id: "roomFormUpdate"
	},

	events : {
		"click .btn-primary" : "saveForm",
		"click .cancel"	: "closeAction",
		"click .closebtn" : "closeAction",
		"change select#roomTypeSelect" : "roomTypeChange",
		"change select#roomDisplaySelect" : "roomDisplayChange",
		"change select#limitQueueLength" : "limitQueueLengthChange",
		"submit form": "saveForm",
		"keyup #roomEmbedInput" : "replaceIframe"
	},

	render : function(){
		this.$el.html( _.template( Dubtrack.els.templates.rooms.roomFormUpdate, this.model.toJSON() ));

		this.loadingForm = false;

		$(".dubtrack_overlay").show();
		this.create_form = this.model.isNew();

		var self = this;

		if(!this.create_form){
			var url = Dubtrack.config.urls.roomImage;
			url = url.replace(":id", this.model.get("_id"));

			this.$('#fileupload').fileupload({
				url: Dubtrack.config.apiUrl + url,
				dataType: 'json',

				start: function(){
					self.$('.btn-primary').html('loading...');
				},

				done: function (e, data) {
					//self.$('.btn-primary').html('loading...');
				},

				always: function(){
					self.$('.btn-primary').html('Save');
					self.$('#progress .bar').css({
						'width' : '0%'
					});
				},

				progress: function (e, data) {
					var progress = parseInt(data.loaded / data.total * 100, 10);
					self.$('#progress .bar').css({
						'width' : progress + '%'
					});
				},

				error: function(jqXHR) {
					var message;

					try {
						message = JSON.parse(jqXHR.responseText).data.details.message;
					} catch (err) {
						//Do nothing
					}

					Dubtrack.helpers.displayError('Error', message || 'Failed to upload image');
				}
			});
		}else{
			this.$("#background-room-update").hide();
		}

		this.roomTypeChange();
		this.roomDisplayChange();
		this.limitQueueLengthChange();

		return this;
	},

	replaceIframe : function(){
		var iframe = this.$('#roomEmbedInput').val();

		try{
			$iframe = $(iframe);

			if($iframe){
				var src = $iframe.attr('src');

				if(src){
					this.$('#roomEmbedInput').val(src);
					iframe = src;
				}
			}
		}catch(ex){}

		this.displayCustomIframe();
	},

	saveForm : function(e){
		e.preventDefault();

		if(this.loadingForm) return;

		this.loadingForm = true;

		var value = this.$('input#roomName').val(),
			maxLengthSongValue = this.$('input#maxLengthSongName').val(),
			roomType = this.$('#roomTypeSelect').val(),
			lockQueue = this.$('#lockQueueSelect').val(),
			displayInSearch = this.$('#displayInSearchSelect').val(),
			displayInLobby = this.$('#displayInLobbySelect').val(),
			description = this.$('#roomDescription').val(),
			roomEmbed = this.$('#roomEmbedInput').val(),
			timeSongQueueRepeat = this.$('input#timeSongQueueRepeat').val()
			welcomeMessage = this.$('#welcomeMessage').val(),
			recycleDJ = this.$('#recycleDJ').val(),
			maxSongQueueLength = this.$('#maxSongQueueLength').val(),
			roomDisplay = this.$('#roomDisplaySelect').val(),
			roomPassword = this.$('#roomPassword').val(),
			limitQueueLength = this.$('#limitQueueLength').val(),
			displayDJinQueue = this.$('#displayDJinQueue').val(),
			displayUserJoin = this.$('#displayUserJoin').val(),
			displayUserLeave = this.$('#displayUserLeave').val(),
			displayUserGrab = this.$('#displayUserGrab').val(),
			metaDescription = this.$('#metaDescription').val();

		if( value && value !== " "){
			this.$('.btn-primary').html('loading...');
			var self = this;

			this.model.save({
				name: value,
				roomDisplay: roomDisplay,
				maxLengthSong: maxLengthSongValue,
				roomType: roomType,
				roomEmbed: roomEmbed,
				description: description,
				lockQueue: lockQueue,
				displayInLobby: displayInLobby,
				timeSongQueueRepeat: timeSongQueueRepeat,
				maxSongQueueLength: maxSongQueueLength,
				displayDJinQueue: displayDJinQueue,
				displayUserJoin: displayUserJoin,
				displayUserLeave: displayUserLeave,
				displayUserGrab: displayUserGrab,
				recycleDJ: recycleDJ,
				limitQueueLength: limitQueueLength,
				displayInSearch: displayInSearch,
				welcomeMessage: welcomeMessage,
				metaDescription: metaDescription,
				roomPassword: roomPassword
			},{
				success: function(m, r){
					self.loadingForm = false;

					if(self.create_form){
						var url = self.model.get('roomUrl');

						if(url){
							window.location = "/join/" + url;
						}
					}else{
						self.close();
					}
				},

				error: function(){
					self.loadingForm = false;

					if(!self.create_form){
						self.$('.btn-primary').html('an unexpected error occurred, please try again later');
					}else{
						self.$('.btn-primary').html('room limit reached, you cannot create more rooms');
					}
				}
			});
		}

		return false;
	},

	displayCustomIframe : function(){
		var roomEmbedUrl = this.$('#roomEmbedInput').val(),
			regexp = /(http:\/\/|https:\/\/|\/\/)(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
			regexpTwitch = /(twitch\.tv)\/([^\&\?\/]+)/;

		if(roomEmbedUrl && regexp.test(roomEmbedUrl)){
			if(regexpTwitch.test(roomEmbedUrl)){
				var match = roomEmbedUrl.match(regexpTwitch);
				try{
					if(match[2]){
						var twitch_channel = match[2];

						this.$('#iframe-embed-preview').html('<object type="application/x-shockwave-flash" data="https://www-cdn.jtvnw.net/swflibs/TwitchPlayer.swff?channel=' + twitch_channel + '" width="100%" height="100%"> <param name="movie" value="https://www-cdn.jtvnw.net/swflibs/TwitchPlayer.swff?channel=' + twitch_channel + '"> <param name="quality" value="high"> <param name="allowFullScreen" value="true"> <param name="allowScriptAccess" value="always"> <param name="pluginspage" value="http://www.macromedia.com/go/getflashplayer"> <param name="autoplay" value="true"> <param name="autostart" value="true"> <param name="flashvars" value="hostname=www.twitch.tv&amp;start_volume=25&amp;channel=' + twitch_channel + '&amp;auto_play=true"> <embed src="https://www-cdn.jtvnw.net/swflibs/TwitchPlayer.swff?channel=' + twitch_channel + '" flashvars="hostname=www.twitch.tv&amp;start_volume=25&amp;channel=' + twitch_channel + '&amp;auto_play=true" width="100%" height="100%" type="application/x-shockwave-flash"> </object>');
					}
				}catch(ex){}
			}else{
				roomEmbedUrl = roomEmbedUrl.replace('http:', 'https:');
				this.$('#iframe-embed-preview').html('<iframe width="100%" height="100%" src="' + roomEmbedUrl + '" frameborder="0" allowfullscreen></iframe>');
			}
		}else{
			this.$('#iframe-embed-preview').html('<h3>Invalid iframe url</h3>');
		}
	},

	roomTypeChange : function(){
		if(this.$('#roomTypeSelect').val() == 'iframe'){
			this.$('#iframeEmbedField').show();
			this.displayCustomIframe();
		}else{
			this.$('#iframeEmbedField').hide();
			this.$('#iframe-embed-preview').empty();
		}
	},

	roomDisplayChange : function(){
		if(this.$('#roomDisplaySelect').val() == 'private'){
			this.$('#room-password-control-group').show();
			this.displayCustomIframe();
		}else{
			this.$('#room-password-control-group').hide();
		}
	},

	limitQueueLengthChange : function(){
		if(this.$('#limitQueueLength').val() == '1'){
			this.$('#maxSongQueueLengthContainer').show();
			this.displayCustomIframe();
		}else{
			this.$('#maxSongQueueLengthContainer').hide();
		}
	},

	closeAction : function(){
		this.close();
		return false;
	},

	beforeClose: function(){
		this.$('#iframe-embed-preview').empty();
		$(".dubtrack_overlay").hide();
	}
});
