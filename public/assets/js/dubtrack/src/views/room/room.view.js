Dubtrack.View.Room = Backbone.View.extend({
	el: $('#main-room'),

	videoChatCollapsed: false,

	events: {
		"click button.view-users": "displayUsers",
		"click #mobile-room-menu a" : "setMenuActive"
	},

	initialize: function(){
		this.currentMobileClass = "";
		this.roomInfoView = null;

		Dubtrack.Events.bind('realtime:room-update', this.roomUpdate, this);
		Dubtrack.Events.bind('realtime:user-kick', this.userKickedOut, this);
		Dubtrack.Events.bind('realtime:user-ban', this.userBannedOut, this);
		Dubtrack.helpers.cookie.set('dubtrack-room', this.model.get("roomUrl"), 60);
		Dubtrack.helpers.cookie.set('dubtrack-room-id', this.model.get("_id"), 60);

		this.callBackAfterRoomJoin = null;

		if(Dubtrack.loggedIn){
			var leaveUrl = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomBeacon.replace( ":id", this.model.id ).replace( ":userid", Dubtrack.session.id);

			$(window).bind('beforeunload', function () {
				$.ajax({
					url: leaveUrl,
					async: false
				});
			});

			$(window).bind("unload", function () {
				$.ajax({
					url: leaveUrl,
					async: false
				});
			});
		}
	},

	joinQueue : function(){
		if(this.player) this.player.displayBrowserSearch();
	},

	setMenuActive : function(e){
		var target = $(e.target);

		if( ! target.is('a') ) target = target.parents('a');

		var display_target = target.data('display');

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

	roomUpdate: function(r) {
		if(r && r.room) {
			var currBg = this.model.get('background'),
				newBg = r.room.background;

			if (newBg && currBg && (newBg.version !== currBg.version || newBg.public_id !== currBg.public_id)) {
				this.updateBackground(newBg, true);
			}

			$("#roomNameMenu").html(r.room.name);

			//update local model
			this.model.set(r.room);
		}

		if(r && r.passwordUpdated){
			if(Dubtrack.session && Dubtrack.room.users && Dubtrack.room.users.getIfHasRole(Dubtrack.session.get("_id"))){
			}else{
				location.reload();
			}
		}
	},

	updateBackground : function(background, force){
		if ($('body').data('backstretch')) $.backstretch('destroy', false);

		var imageUrl = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomImage.replace(':id', this.model.get('_id'));

		//cache busting
		if (force) imageUrl += '?v=' + background.version;

		$.backstretch(imageUrl);
	},

	render: function(){
		var self = this;

		var url = Dubtrack.config.urls.roomUsers.replace( "{id}", this.model.id );
		this.urlUsersRoom = Dubtrack.config.apiUrl + url;

		//join room
		this.joinRoom();

		if(!Dubtrack.loggedIn){
			$("#create-room-div").hide();
		} else {
			$("#create-room-div").show();
		}

		if(Dubtrack.session && Dubtrack.room.users && Dubtrack.room.users.getIfOwner(Dubtrack.session.get("_id"))){
			$("#create-room-div").hide();
			$("#edit-room-div").show();
		}else{
			$("#create-room-div").show();
			$("#edit-room-div").hide();
		}

		var background = this.model.get("background");

		if (background) {
			this.updateBackground(background, false);
		}

		//set feature users title
		this.$('.room-feautre-title span').html('Top users in ' + this.model.get('name'));

		$("#main-room-active-link").attr("href", "/join/" + this.model.get("roomUrl")).addClass('active-room').find('.room-name').html(this.model.get("name"));
		$("#main-menu-left .room-active-link").attr("href", "/join/" + this.model.get("roomUrl")).css("display", "block").find("span.current-room").html(this.model.get("name"));

		//Closing Profile
		$(".rewindProfile a").attr("href", "/join/" + this.model.get("roomUrl"));
		//Clsoing #Browser
		$(".close").attr("href", "/join/" + this.model.get("roomUrl"));
	},

	displayRoom: function(){
		this.$el.show();

		if(this.chat) this.chat.clickChatCounter();
	},

	userKickedOut: function(r){
		var id = (r.kickedUser && "_id" in r.kickedUser) ? r.kickedUser._id : false;

		if(Dubtrack.session && id && id === Dubtrack.session.get("_id") ){
			var message = "You were kicked out of the room";

			//if(r.message !== "" || r.message !== " ") message += "\n" + r.message;

			Dubtrack.helpers.displayError("Warning", message, false, "Dubtrack.room.leaveRoom();");

			setTimeout(function(){
				this.leaveRoom();
			}.bind(this), 30000);

			try{
				if(Dubtrack.room.chat.mentionChatSound) Dubtrack.room.chat.mentionChatSound.play();
			}catch(ex){}
		}
	},

	userBannedOut: function(r){
		var id = (r.kickedUser && "_id" in r.kickedUser) ? r.kickedUser._id : false;


		if(Dubtrack.session && id && id === Dubtrack.session.get("_id") ){
			var message = "You were banned from this room";

			var time = parseInt(r.time, 10);
			if(time && time !== 0) message += " for " + time + " minutes";

			Dubtrack.helpers.displayError("Warning", message, false, "Dubtrack.room.leaveRoom();");

			setTimeout(function(){
				this.leaveRoom();
			}.bind(this), 30000);

			try{
				if(Dubtrack.room.chat.mentionChatSound) Dubtrack.room.chat.mentionChatSound.play();
			}catch(ex){}
		}
	},

	leaveRoom: function(){
		Dubtrack.helpers.cookie.delete('dubtrack-room');
		Dubtrack.helpers.cookie.delete('dubtrack-room-id');

		var leaveUrl = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomBeacon.replace( ":id", this.model.id ).replace( ":userid", Dubtrack.session.id);
		$.ajax({
			url: leaveUrl
		}).always(function(){
			window.onbeforeunload = null;
			window.location = "/";
		});
	},


	renderChat: function(){
		if(!this.chat){
			this.chat = new Dubtrack.View.chat();
		}
	},

	joinRoom: function(params) {
		if (this.joinedRoom) return;

		this.joinedRoom = true;

		var self = this;
		if(!params) params = {};

		if (Dubtrack.loggedIn) {
				//join room
				Dubtrack.helpers.sendRequest(this.urlUsersRoom, params, "post", function(err, r) {
						if (err) {
								switch (err.code) {
										case 401:
											Dubtrack.loggedIn = false;
											self.postJoinRoom();
											Dubtrack.loggedIn = true;
											self.users.user_is_banned = true;

											Dubtrack.playerController.$('.remove-if-banned').remove();
											$('body').addClass('not-logged-in');
											self.chat.$('.pusher-chat-widget-input').html('');

											try {
													self.chat.$('.pusher-chat-widget-input').html('<p>' + err.data.err.details.message + '</p>');
													Dubtrack.helpers.displayError("[" + err.code + "] " + dubtrack_lang.global.error, err.data.err.details.message + ". <b><u>You won't be able to chat or play songs</u></b>", false);
											} catch (ex) {}

											break;
										case 400:
											$('body').addClass('room-password-required');
											self.joinedRoom = false;

											if(!self.passwordInput) self.passwordInput = new Dubtrack.View.RoomPassword().render("Room password", "Please enter the room password", self.$el);

											if(err && err.data && err.data.err && err.data.err.details && err.data.err.details.message && err.data.err.details.message.err){
												if(err.data.err.details.message.err == "invalidPassword"){
													self.passwordInput.displayError("Invalid password");
												}

												if(err.data.err.details.message.err == "tooManyInvalidPassword"){
													self.passwordInput.displayError("Too many invalid passwords entered, please wait 2 hours before trying");
												}
											}

											self.passwordInput.$el.show();
											self.passwordInput.resetFields();

											break;
										default:
											Dubtrack.playerController.$('.remove-if-banned').remove();

											Dubtrack.helpers.displayError(dubtrack_lang.global.error, "An unexpected error occurred joining room", true);
								}
						} else {
								$('body').removeClass('room-password-required');

								if (self.passwordInput) self.passwordInput.close();

								self.postJoinRoom();

								if (r && r.data && r.data.user && r.data.user.muted) {
										self.chat.user_muted = true;
								}
						}
				});
		} else {
				if (this.model.get('roomDisplay') == 'private') {
					this.leaveRoom();
					return;
				}

				this.postJoinRoom();
		}
	},

	loadRoomUsers : function(){
		if(!this.users){
			//users
			this.users = new Dubtrack.View.roomUsers({
				model: this.model
			});
		}else{
			this.users.autoLoad();
		}
	},

	postJoinRoom: function(){
		this.joinedRoom = true;

		//subscribe to real time channel
		Dubtrack.realtime.subscribe(this.model.get('realTimeChannel').toLowerCase(), function(){
		}.bind(this));

		Dubtrack.player_initialized = true;
		this.player = new Dubtrack.View.Player({
			model: this.model
		});
		this.loadRoomUsers();
		this.renderChat();
	},

	setTopUsers: function(){

	}
});

Dubtrack.View.RoomPassword = Backbone.View.extend({
	attributes : {
		id : 'warning'
	},

	events : {
		"submit" : "submitForm"
	},

	render : function(title, message, el){
		this.$el.html("<form><h3>" + title + "</h3><p>" + message + "<input type='password' name='warning-password' id='warning-password' /></p><span class='error-message'></span><input type='submit' id='warning-input-submit' value='Join room' /></form>").addClass('form-join-password-input');

		this.$el.appendTo(el);

		return this;
	},

	displayError : function(txt){
		this.$('.error-message').text(txt);
	},

	resetFields : function(){
		this.$('#warning-password').val('').focus();
		this.$('#warning-input-submit').val('Join Room');
	},

	submitForm : function(){
		this.$('#warning-input-submit').val('Loading...');
		this.$('p .error-message').empty();
		var password_val = this.$('#warning-password').val();

		if(password_val && password_val.length > 0){
			Dubtrack.room.joinRoom({
				'password-room' : password_val
			});

			return false;
		}

		this.$('#warning-password').val('').focus();
		this.$('#warning-input-submit').val('Join Room');

		return false;
	}
})
