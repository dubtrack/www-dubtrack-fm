Dubtrack.UserImagesBustings = {};
Dubtrack.View.chatItem = Backbone.View.extend({
	tagName: "li",

	events : {
		"click a.username" : "clickUsername",
		"click .chatDelete" : "deleteChat"
	},

	initialize: function () {
		var user = this.model.get('user');

		if (user && Dubtrack.room.users.getDubsRequirement(user._id)) {
			this.model.set( 'message', Dubtrack.helpers.text.convertHtmltoTags( this.model.get('message'), "Dubtrack.room.chat.scollBottomChat();" ));
			this.model.set( 'message', Dubtrack.helpers.text.convertAttoLink( this.model.get('message') ));
		} else {
			this.model.set( 'message', this.model.get('message'));
		}

		// Set the user's role name to show in chat.
		if (user) {
			this.model.set('userRole', Dubtrack.helpers.text.getNameUserRoomRoleNameFromUserID(user._id));
		} else {
			this.model.set('userRole', '');
		}

		this.model.bind('change', this.setId, this);

		var modelJson = this.model.toJSON();

		modelJson.userImage = Dubtrack.config.apiUrl + '/user/' + modelJson.user._id + '/image';
		if(modelJson.refreshVersion) modelJson.userImage = modelJson.userImage + "?v=" + modelJson.refreshVersion;

		this.$el.html( _.template( Dubtrack.els.templates.chat.chatMessage , modelJson ) );

		if(Dubtrack.UserImagesBustings[modelJson.user._id]){
			this.$('.image_row img').attr('src', Dubtrack.UserImagesBustings[modelJson.user._id]);
		}

		this.$el.addClass('user-' + modelJson.user._id);

		// Tag the user's room role
		if(modelJson.user._id == Dubtrack.room.model.get('userid')) {
			this.$el.addClass('creator');
		}
		else if (Dubtrack.room.users.getRoleType(modelJson.user._id)) {
			// Do not tag user as co-owner also!
			this.$el.addClass(Dubtrack.room.users.getRoleType(modelJson.user._id));
		}

		// Tag the user as an admin if they are
		if(Dubtrack.helpers.isDubtrackAdmin(modelJson.user._id)){
			this.$el.addClass('admin');
		}

		if(Dubtrack.session && Dubtrack.session.id && Dubtrack.session.id == modelJson.user._id){
			this.$el.addClass('current-chat-user');
		}

		var currentUserDJ = Dubtrack.room.player.activeSong.get('user');
		if (currentUserDJ && currentUserDJ.id == modelJson.user._id) {
			this.$el.addClass('currentDJ');
		}

		Dubtrack.Events.bind('realtime:user-update-' + modelJson.user._id, this.updateUser, this);
		this.setId();
	},

	render: function() {
		var currentDate = new Date(this.model.get('time'));
		this.$('.timeinfo').html('<time class="timeago" datetime="' + currentDate.toISOString() + '">' + currentDate.toLocaleString() + '</time>');

		this.$(".timeago").timeago();

		this.$('img').load(function() {
			try{
				Dubtrack.room.chat.scollBottomChat();
			}catch(ex){}
		});

		this.$('img').error(function() {
			$(this).attr( "src", "/assets/images/media/chat_image_load_error.png" );
		});

		emojify.run(this.el);
	},

	setId: function(){
		var chat_id = this.model.get('chatid');
		if(chat_id) this.$el.addClass('chat-id-' + chat_id);
	},

	updateTime: function(time){
		var currentDate = new Date(time);
		this.$(".timeago").timeago('update', currentDate.toISOString());

		this.$('img').load(function() {
			try{
				Dubtrack.room.chat.scollBottomChat();
			}catch(ex){}
		});

		this.$('img').error(function() {
			$(this).attr( "src", "/assets/images/media/chat_image_load_error.png" );
		});

		emojify.run(this.el);
	},

	navigateAvatar : function(e){
		var $data = $(e.target).data();

		if("username" in $data) dubtrackMain.app.navigate("/" + $data.username, {trigger: true});

		return false;
	},

	updateUser: function(r) {
		var user = this.model.get('user');

		if(user && r && r.img && r.img.version) {
			var imageUrl = Dubtrack.config.apiUrl + Dubtrack.config.urls.userImage.replace(':id', user._id);

			imageUrl += '?v=' + r.img.version;

			Dubtrack.UserImagesBustings[user._id] = imageUrl;

			this.$('.image_row img').attr('src', imageUrl);
		}
	},

	clickUsername : function(){
		var user = this.model.get("user");

		if(user){
			var chat_val = Dubtrack.room.chat._messageInputEl.val();
			if(chat_val.length > 0){
				Dubtrack.room.chat._messageInputEl.val( Dubtrack.room.chat._messageInputEl.val() +  "@" + user.username + " ");
			}else{
				Dubtrack.room.chat._messageInputEl.val("@" + user.username + " ");
			}
			Dubtrack.room.chat._messageInputEl.focus();
		}

		return false;
	},

	deleteChat : function(){
		var chat_id = this.model.get('chatid');

		if(chat_id){
			var userid_frommessage = chat_id.split('-').shift();

			if(userid_frommessage === Dubtrack.session.id || Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || (Dubtrack.room.users && Dubtrack.room.users.getIfRoleHasPermission(Dubtrack.session.id, 'delete-chat'))){
				this.$('.text').html('<p class="deleted">loading...</p>');

				var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.deleteChat.replace(":id", Dubtrack.room.model.id).replace(":chatid", chat_id);
				Dubtrack.helpers.sendRequest( url, {}, 'delete', function(err, r){
					if(err){
						this.$('.text').html('<p class="deleted">you don\'t have permissions to do this</p>')
					}
				}.bind(this));
			}else{
				this.close();
			}
		}
	},

	beforeClose : function(){
		this.$("time.timeago").timeago('dispose');
	}
});

Dubtrack.View.systemChatItem = Backbone.View.extend({
	tagName: "li",

	attributes: {
		"class": "system"
	},

	events : {
	},

	initialize:function () {
		this.$el.html( dubtrack_lang.global.loading );
	},

	beforeClose : function(){
	}
});

Dubtrack.View.chatMeCommand = Dubtrack.View.chatItem.extend({
	attributes: {
		"class": "chat-me-command-joined"
	},

	initialize: function () {
		this.model.bind('change', this.setId, this);

		var user = this.model.get('user'),
			message = this.model.get('message');

		if(message) message = message.replace(/^\/me\s/, '');

		if(message && message.length > 0) this.$el.html( "<div class='chatDelete'><span class='icon-close'></span></div><div class='text'>@" + user.username + " " + message + '</div>');

		emojify.run(this.el);
		this.setId();
	},

	render: function() {}
});

Dubtrack.View.chatLoadingItem = Dubtrack.View.systemChatItem.extend({
	attributes: {
		"class": "chat-system-loading"
	}
});

Dubtrack.View.chatJoinItem = Dubtrack.View.systemChatItem.extend({
	attributes: {
		"class": "chat-system-joined"
	},

	initialize: function () {
		var user = this.model.get('user');

		this.$el.html( "@" + user.username + " joined the room" );
	},
});

Dubtrack.View.grabbedPlaylistRoom = Dubtrack.View.systemChatItem.extend({
	attributes: {
		"class": "chat-system-grabbed"
	},

	initialize: function () {
		var user = this.model.get('user');

		this.$el.html( "@" + user.username + " grabbed this song" );
	},
});

Dubtrack.View.chatLeaveItem = Dubtrack.View.systemChatItem.extend({
	attributes: {
		"class": "chat-system-left"
	},

	initialize: function () {
		var user = this.model.get('user');

		this.$el.html( "@" + user.username + " left the room" );
	},
});

Dubtrack.View.chatSkipItem = Dubtrack.View.systemChatItem.extend({
	initialize:function () {
		var user = this.model.get('username');

		if(user){
			this.$el.html( "song skipped by @" + user );
		}else{
			this.$el.html( "song skipped by a moderator" );
		}
	},
});

Dubtrack.View.chatKickedItem = Dubtrack.View.systemChatItem.extend({
	initialize: function () {
		var kickedUser = this.model.get('kickedUser'),
			user = this.model.get('user');

		this.$el.html( "@" + kickedUser.username + " was kicked out of the room by @" + user.username );
	},
});

Dubtrack.View.chatUnbannedItem = Dubtrack.View.systemChatItem.extend({
	initialize: function () {
		var kickedUser = this.model.get('kickedUser'),
			user = this.model.get('user');

		this.$el.html( "@" + kickedUser.username + " was unbanned from the room by @" + user.username  );
	},
});

Dubtrack.View.chatUnsetRoleItem = Dubtrack.View.systemChatItem.extend({
	initialize: function () {
		var modUser = this.model.get('modUser'),
			user = this.model.get('user'),
			role_object = this.model.get('role_object');

		this.$el.html( "@" + modUser.username + " was removed as a " + role_object.label + " by @" + user.username );
	},
});

Dubtrack.View.chatSetRoleItem = Dubtrack.View.systemChatItem.extend({
	initialize: function () {
		var modUser = this.model.get('modUser'),
			user = this.model.get('user'),
			role_object = this.model.get('role_object');

		this.$el.html( "@" + modUser.username + " was made a " + role_object.label + " by @" + user.username );
	},
});

Dubtrack.View.chatBannedItem = Dubtrack.View.systemChatItem.extend({
	initialize: function () {
		var kickedUser = this.model.get('kickedUser'),
			user = this.model.get('user'),
			message = "@" + kickedUser.username + " was banned from the room by @" + user.username;

		var time = parseInt(this.model.get('time'), 10);
		if(time && time !== 0) message += " for " + time + " minutes";

		this.$el.html( message );
	},
});

Dubtrack.View.removedSongFromQueueItem = Dubtrack.View.systemChatItem.extend({
	initialize: function () {
		var removedUser = this.model.get('removedUser'),
			user = this.model.get('user'),
			message = "@" + user.username + " removed a song queued by @" + removedUser.username;

		this.$el.html( message );
	},
});

Dubtrack.View.removedFromQueueItem = Dubtrack.View.systemChatItem.extend({
	initialize: function () {
		var removedUser = this.model.get('removedUser'),
			user = this.model.get('user'),
			message = "@" + user.username + " removed @" + removedUser.username + " from the queue";

		this.$el.html( message );
	},
});

Dubtrack.View.reorderQueueItem = Dubtrack.View.systemChatItem.extend({
	initialize: function () {
		var user = this.model.get('user'),
			message = "@" + user.username + " reordered the queue";

		this.$el.html( message );
	},
});

Dubtrack.View.lockRoomQueueItem = Dubtrack.View.systemChatItem.extend({
	initialize: function () {
		var user = this.model.get('user'),
			room = this.model.get('room');

		if(room && room.lockQueue){
			message = "@" + user.username + " locked the queue";
		}else{
			message = "@" + user.username + " unlocked the queue";
		}

		this.$el.html( message );
	},
});

Dubtrack.View.pauseUserQueueItem = Dubtrack.View.systemChatItem.extend({
	initialize: function () {
		var user = this.model.get('user'),
			mod = this.model.get('mod'),
			user_queue = this.model.get('user_queue');

		if(user_queue && user_queue.queuePaused){
			message = "@" + mod.username + " removed " + user.username + " from the queue";
		}else{
			message = "@" + mod.username + " added " + user.username + " to the queue";
		}

		this.$el.html( message );
	},
});

Dubtrack.View.welcomeMessageChatItem = Dubtrack.View.systemChatItem.extend({
	attributes: {
		"class": "chat-welcome-message"
	},

	initialize: function () {
		if(Dubtrack.room){
			var message = Dubtrack.room.model.get('welcomeMessage'),
				roomName = Dubtrack.room.model.get('name'),
				username = Dubtrack.session.get('username');

			if(message && message.length > 0){
				if(!roomName) roomName = "";
				if(!username) username = "";

				message = message.replace("{roomname}", roomName);
				message = message.replace("{username}", username);

				this.$el.html( Dubtrack.helpers.text.convertHtmltoTags(message) );

				emojify.run(this.el);
			}else{
				this.$el.remove();
			}
		}else{
			this.$el.remove();
		}
	},
});
