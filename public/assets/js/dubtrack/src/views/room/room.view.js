Dubtrack.View.Room = Backbone.View.extend({
	el: $('#main-room'),

	videoChatCollapsed: false,

	events: {
		"click button.view-users": "displayUsers",
		"click #mobile-room-menu a" : "setMenuActive"
	},

	initialize: function(){
		this.currentMobileClass = "";

		var self = this;
		//$("#dubtrack-video-realtime .toggle_videos").bind("click", function(){
		//	self.toggleVideos();
		//});

		Dubtrack.Events.bind('realtime:room-update', this.roomUpdate, this);
	},

	setMenuActive : function(e){
		var target = $(e.target);

		if( ! target.is('a') ) target = target.parents('a');

		var display_target = target.data('display');
		console.log(display_target, target);
		if(display_target){
			this.$el.removeClass(this.currentMobileClass);
			this.currentMobileClass = display_target;

			this.$el.addClass(this.currentMobileClass);

			//remove active
			this.$("#mobile-room-menu a.active").removeClass('active');
			target.addClass('active');
		}

		return false;
	},

	displayUsers: function(){
		this.$el.addClass('display-users-rooms');

		return false;
	},

	roomUpdate : function(r){
		if(r && r.room){
			if(r.room.background && r.room.background != this.model.get("background")){
				this.updateBackground(true);
			}

			$("#roomNameMenu").html(r.room.name);

			//update local model
			this.model.set(r.room);
		}
	},

	updateBackground : function(force){
		$.backstretch("destroy", false);
		var url = Dubtrack.config.urls.roomImage;
		url = Dubtrack.config.apiUrl + url.replace(":id", this.model.get("_id"));
		
		//cache busting
		if(force) url += "?v" + Date.now();

		$.backstretch(url);
	},

	render: function(){
		var self = this;

		/*this.roomInfo = new Dubtrack.View.RoomInfo({
			model: this.model
		});*/

		this.player = new Dubtrack.View.Player({
			model: this.model
		});

		var url = Dubtrack.config.urls.roomUsers.replace( "{id}", this.model.id );
		this.urlUsersRoom = Dubtrack.config.apiUrl + url;

		if(Dubtrack.session && Dubtrack.session.get("_id") === this.model.get("userid")){
			$("#create-room-div").hide();
			$("#edit-room-div").show();
		}else{
			$("#create-room-div").show();
			$("#edit-room-div").hide();
		}

		var background = this.model.get("background");
		if(background){
			this.updateBackground(false);
		}

		//join room
		this.renderChat();
		this.joinRoom();

		//subscribe to real time channel
		Dubtrack.realtime.subscribe(this.model.get('realTimeChannel').toLowerCase(), function(){
			if(!self.users){
				//users
				self.users = new Dubtrack.View.roomUsers({
					model: self.model
				});
			}else{
				self.users.autoLoad();
			}
		});

		//set feature users title
		this.$('.room-feautre-title span').html('Top users in ' + this.model.get('name'));

		$("#main-room-active-link").attr("href", "/join/" + this.model.get("roomUrl")).css("display", "block").find("span.current-room").html(this.model.get("name"));

		Dubtrack.helpers.cookie.set('dubtrack-room', this.model.get("roomUrl"), 60);
		Dubtrack.helpers.cookie.set('dubtrack-room-id', this.model.get("_id"), 60);
		
		Dubtrack.Events.bind('realtime:user-kick', this.userKickedOut, this);
		Dubtrack.Events.bind('realtime:user-ban', this.userBannedOut, this);

		window.onbeforeunload = function() {
			$.ajax({
				url: self.urlUsersRoom,
				async: false,
				type: 'delete'
			});
		};

		$(window).resize(function(){
			self.resize();
		});
	},

	displayRoom: function(){
		this.$el.show();

		this.resize();

		if(this.chat) this.chat.resize();
		if(this.users) this.users.resize();

	},

	resize: function(){
		var width = parseInt(this.$el.innerWidth(), 10);

		this.$('.right_section').width( width * 0.35 ).css({
			marginRight: (width/2) * -1
		});

		/*var $h = "auto";
		if( parseInt( $(window).width(), 10 ) > 800){
			$h = parseInt( $(window).height(), 10 ) - 135;
		}*/

		//this.$('.left_section').css('minHeight', $h);
	},

	userKickedOut: function(r){
		var id = (r.kickedUser && "_id" in r.kickedUser) ? r.kickedUser._id : false;

		if(Dubtrack.session && id && id === Dubtrack.session.get("_id") ){
			var message = "You were kicked out of the room";

			if(r.message !== "" || r.message !== " ") message += "\n" + r.message;

			alert(message);

			this.leaveRoom();
		}
	},

	userBannedOut: function(r){
		var id = (r.kickedUser && "_id" in r.kickedUser) ? r.kickedUser._id : false;

		
		if(Dubtrack.session && id && id === Dubtrack.session.get("_id") ){
			var message = "You were banned from this room";

			var time = parseInt(r.time, 10);
			if(time && time !== 0) message += " for " + time + " minutes";

			alert(message);

			this.leaveRoom();
		}
	},

	leaveRoom: function(){
		Dubtrack.helpers.cookie.delete('dubtrack-room');
		Dubtrack.helpers.cookie.delete('dubtrack-room-id');

		/*$.ajax({
			url: this.urlUsersRoom,
			async: false,
			type: 'delete'
		});*/

		window.onbeforeunload = null;

		window.location = "/";
	},

	renderChat: function(){
		this.chat = new Dubtrack.View.chat();
	},

	joinRoom: function(){
		var self = this;
		//join room 
		Dubtrack.helpers.sendRequest(this.urlUsersRoom, {}, "post", function(err, r){
			if(err){
				Dubtrack.playerController.$('.remove-if-banned').remove();
				self.chat.$('.pusher-chat-widget-input').html('');

				switch(err.code){
					case 401:
						self.chat.$('.pusher-chat-widget-input').html('<p>' + err.data.err.details.message + '</p>');
						Dubtrack.helpers.displayError("[" + err.code + "] " + dubtrack_lang.global.error, err.data.err.details.message + ". <b><u>You won't be able to chat or play songs</u></b>", false);
					break;
					default:
						Dubtrack.helpers.displayError(dubtrack_lang.global.error, "An unexpected error occurred joining room", true);
				}
			}else{
				if(r && r.data && r.data.user && r.data.user.muted){
					self.chat.user_muted = true;
				}

				/*if(r && r.data && r.data.goinstant_token){
					//go instant token
					self.goinstant_token = r.data.goinstant_token;
					//load Video Chat
					self.loadVideoChat(self.goinstant_token);
				}*/

				/*if(r && r.data && r.data.user && r.data.user.ot_token && r.data.room && r.data.room.otSession){
					//go instant token
					self.ot_token = r.data.user.ot_token;
					self.ot_session = r.data.room.otSession;

					$("#dubtrack-video-realtime").show();
				}*/
			}
		});
	},

	toggleVideos: function(){
		$("#dubtrack-video-realtime").toggleClass('active');
		$('body').toggleClass('videoActive');

		if(! this.video_chat_loaded && this.ot_token && this.ot_session){
			this.video_chat_loaded = true;
			this.loadVideoChat(this.ot_token, this.ot_session);
		}

		var self = this;
		this.chat.resize();
		setTimeout(function(){
			self.chat.$('.chat-messages').perfectScrollbar('update');
			self.chat.$('.message-list-wrapper-inner').scrollTop(0);
			self.chat.scollBottomChat();
		}, 500);

		return false;
	},

	/*loadVideoChat: function(token){
		if(this.chat.user_muted || $(window).width() < 800) return;

		if(Dubtrack.session && token){
			var collapsedCookie = Dubtrack.helpers.cookie.get('dubtrack-videochat');

			if(collapsedCookie) this.videoChatCollapsed = true;

			// Connect URL
			var url = 'https://goinstant.net/e6c16f2081be/Dubtrack.fm',
				self = this;

			//connect to go instant
			this.goInstantConnection = new goinstant.Connection(url);

			//connect user
			this.goInstantConnection.connect(token, function(err, connectionObject){
				if(err) return false;

				var room = self.goInstantConnection.room(self.model.get("_id"));
 
				//join room
				room.join(function(err){
					if(err) return false;

					self.webrtc = new goinstant.widgets.WebRTC({
						room: room,
						collapsed: self.videoChatCollapsed,
						autoStart: false
					});

					// Initialize the WebRTC widget
					self.webrtc.initialize(function(err) {
						if (err) return false;

						//self.webrtc._controller._goRTC.on('localStream', function(){
						if(!self.videoChatCollapsed){
							$('body').addClass('videoActive');
							//if(self.chat){
								//$(window).resize();
								self.chat.resize();
								setTimeout(function(){
									self.$('.chat-messages').perfectScrollbar('update');
									self.chat.$('.chat-messages').scrollTop(0);
								}, 500);
							//}
						}

						self.webrtc._controller._goRTC.on('localStream', function(){
							$('.gi-user.gi-local video').hide();
							$('.gi-user.gi-local .gi-stream-wrapper').append('<video id="localUserVideo" class="gi-stream"></video>');
							var v = document.getElementById('localUserVideo');

							navigator.getUserMedia = (navigator.getUserMedia ||
														navigator.webkitGetUserMedia ||
														navigator.mozGetUserMedia ||
														navigator.msGetUserMedia);

							navigator.getUserMedia({video: true}, function(stream) {
								var url = window.URL || window.webkitURL;
								v.src = url ? url.createObjectURL(stream) : stream;
								v.play();
							});

						});

						//
						$('.gi-webrtc .gi-collapse').bind('click', function(){
							$('body').toggleClass('videoActive');
							$(window).resize();

							if($('body').hasClass('videoActive')){
								Dubtrack.helpers.cookie.delete('dubtrack-videochat');
							}else{
								Dubtrack.helpers.cookie.set('dubtrack-videochat', true, 60);
							}
						});
					});
				});
			});
		}
	},*/

	loadVideoChat: function(token, sessionId){
		if(this.chat.user_muted || $(window).width() < 800) return;

		if(Dubtrack.session && token && sessionId){
			// Initialize API key, session, and token...
			// Think of a session as a room, and a token as the key to get in to the room
			// Sessions and tokens are generated on your server and passed down to the client
			var apiKey = "44718392",
				self = this,
				divid = 'dtrealtimechat_' + Math.random().toString(36).substr(2, 9);

			//create a new element
			var div = $('<div/>', {
				'id' : divid,
				'class' : 'dtrealtime_videuser'
			}).appendTo($('#dubtrack-video-realtime .realtime-videos-container'));

			// Initialize session, set up event listeners, and connect
			this.ot_session = OT.initSession(apiKey, sessionId);

			this.ot_session.connect(token, function(error) {
				self.ot_publisher = OT.initPublisher(divid, {name: Dubtrack.session.get('username')});
				self.ot_session.publish(self.ot_publisher);
			});

			this.ot_session.on("streamCreated", function(event) {
				//create a new element
				divid = 'dtrealtimechat_' + Math.random().toString(36).substr(2, 9);
				div = $('<div/>', {
					'id' : divid,
					'class' : 'dtrealtime_videuser'
				}).appendTo($('#dubtrack-video-realtime .realtime-videos-container'));

				self.ot_session.subscribe(event.stream, divid);
			});
		}
	},


	setTopUsers: function(){

	}
});