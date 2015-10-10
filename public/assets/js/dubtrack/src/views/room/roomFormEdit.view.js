dt.room.roomFormUpdateViewUpdate = Backbone.View.extend({
	attributes: {
		id: "roomFormUpdate"
	},

	events : {
		"click .btn-primary" : "saveForm",
		"click .cancel"	: "closeAction",
		"click .closebtn" : "closeAction",
		"change select#roomTypeSelect" : "roomTypeChange",
		"submit form": "saveForm",
		"keyup #roomEmbedInput" : "replaceIframe"
	},

	render : function(){
		this.$el.html( _.template( Dubtrack.els.templates.rooms.roomFormUpdate, this.model.toJSON() ));

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
				}
			});
		}else{
			this.$("#background-room-update").hide();
		}

		this.roomTypeChange();

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

		var value = this.$('input#roomName').val(),
			maxLengthSongValue = this.$('input#maxLengthSongName').val(),
			roomType = this.$('#roomTypeSelect').val(),
			lockQueue = this.$('#lockQueueSelect').val(),
			roomEmbed = this.$('#roomEmbedInput').val();

		if( value && value !== " "){
			this.$('.btn-primary').html('loading...');
			var self = this;

			this.model.save({
				name: value,
				maxLengthSong: maxLengthSongValue,
				roomType: roomType,
				roomEmbed: roomEmbed,
				lockQueue: lockQueue
			},{
				success: function(m, r){
					if(r.code === 200){
						if(self.create_form){
							var url = self.model.get('roomUrl');

							if(url){
								window.location = "/join/" + url;
							}
						}else{
							self.close();
						}
					}
				},

				error: function(){
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
			regexp = /(http:\/\/|https:\/\/|\/\/)(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

		if(roomEmbedUrl && regexp.test(roomEmbedUrl)){
			roomEmbedUrl = roomEmbedUrl.replace('http:', 'https:');
			this.$('#iframe-embed-preview').html('<iframe width="100%" height="100%" src="' + roomEmbedUrl + '" frameborder="0" allowfullscreen></iframe>');
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

	closeAction : function(){
		this.close();
		return false;
	},

	beforeClose: function(){
		this.$('#iframe-embed-preview').empty();
		$(".dubtrack_overlay").hide();
	}
});
