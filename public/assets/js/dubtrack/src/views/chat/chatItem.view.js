Dubtrack.UserImagesBustings = {};
Dubtrack.View.chatItem = Backbone.View.extend({
	tagName: "li",

	events : {
		//"click a.navigate" : "navigateAvatar",
		"click a.username" : "clickUsername"
	},

	initialize:function () {
		this.model.set( 'message', Dubtrack.helpers.text.convertHtmltoTags( this.model.get('message'), "Dubtrack.room.chat.scollBottomChat();" ));
		this.model.set( 'message', Dubtrack.helpers.text.convertAttoLink( this.model.get('message') ));

		var modelJson = this.model.toJSON();

		modelJson.userImage = Dubtrack.config.apiUrl + '/user/' + modelJson.user._id + '/image';
		if(modelJson.refreshVersion) modelJson.userImage = modelJson.userImage + "?v=" + modelJson.refreshVersion;

		this.$el.html( _.template( Dubtrack.els.templates.chat.chatMessage , modelJson ) );

		if(Dubtrack.UserImagesBustings[modelJson.user._id]){
			this.$('.image_row img').attr('src', Dubtrack.UserImagesBustings[modelJson.user._id]);
		}

		this.$el.addClass('user-' + modelJson.user._id);

		if(Dubtrack.session && Dubtrack.session.id && Dubtrack.session.id == modelJson.user._id){
			this.$el.addClass('current-chat-user');
		}

		Dubtrack.Events.bind('realtime:user-update-' + modelJson.user._id, this.updateUser, this);
	},

	render: function() {
		var currentDate = new Date(this.model.get('time'));
		this.$('.timeinfo').html('<time class="timeago" datetime="' + currentDate.toISOString() + '">' + currentDate.toLocaleString() + '</time>');

		this.$(".timeago").timeago();

		emojify.run(this.el);
	},

	updateTime: function(time){
		var currentDate = new Date(time);
		this.$(".timeago").timeago('update', currentDate.toISOString());

		emojify.run(this.el);
	},

	navigateAvatar : function(e){
		var $data = $(e.target).data();

		if("username" in $data) dubtrackMain.app.navigate("/" + $data.username, {trigger: true});

		return false;
	},

	updateUser : function(r){
		if(r && r.img && r.img.url){
			var user = this.model.get("user");

			if(user){
				Dubtrack.UserImagesBustings[user._id] = r.img.url;
			}

			this.$('.image_row img').attr('src', r.img.url);
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
