Dubtrack.AvatarUsersRegistered = new Backbone.Collection();

Dubtrack.View.chat = Backbone.View.extend({

	renderSound : true,

	el : $('#chat'),

	chatSoundFilter : 'off',

	_type_message : null,

	events : {
		"keydown input#chat-txt-message": "keyPressAction",
		"click button.pusher-chat-widget-send-btn": "sendMessage",
		"click a.chatSound": "setSound",
		"click .setOnChatNotifications" : "setSoundOn",
		"click .setOffChatNotifications" : "setSoundOff",
		"click .setMentionChatNotifications" : "setSoundMention",
		"click .disableVideo-el": "disableVideo",
		"click a.chat-commands": "displayChatHelp",
		"click #new-messages-counter": "clickChatCounter",
		"click .display-room-users": "displayRoomUsers",
		"click .display-chat": "displayChat",
		"click .display-chat-settings": "displayChatOptions",
		"click .pusher-chat-widget-input .icon-camera": "openGifCreator",
		"click .clearChatToggle" : "clearChat",
		"click .hideImagesToggle" : "hideImageToggleClick"
	},

	initialize : function(){
		this.chatEndPointUrl = Dubtrack.config.apiUrl + Dubtrack.config.urls.chat.replace(":id", Dubtrack.room.model.id);

		this.scrollToBottom = true;

		this.model = new Dubtrack.Collection.chat();
		this.model.url = this.chatEndPointUrl;
		this.model.bind("add", this.appendItem, this);

		this.disableVideoElBtn = this.$('.disableVideo-el');

		//holder for last chat user item
		this.lastItemChatUser = false;
		this.lastItemEl = false;
		this.user_muted = false;

		this.chatMessageWarningCounter = 0;
		this.lastSentChatMessage = 0;

		this.render();

		Dubtrack.helpers.sendRequest(this.chatEndPointUrl, {}, "get", function(err, r){
			this.bindRealtimeEvents();

			//display welcome message
			this.model.add(new Dubtrack.Model.chat({
				time: Date.now(),
				type: 'room-welcome-message'
			}));

			if(!err && r && r.data){
				_.each(r.data, function(chat_item){
					if(chat_item.type == "chat-message"){
						var chatModel = new Dubtrack.Model.chat(chat_item);
						this.model.add(chatModel);
					}else if(chat_item.type == "delete-chat-message"){
						this.deleteChatItem(chat_item);
					}else if(chat_item.type == "delete-chat-message-global"){
						this.deleteUserChat(chat_item);
					}else if(chat_item.type == "user-ban"){
						this.removeBanUserChat(chat_item);
					}
				}.bind(this));

				this.setSoundMention();
			}
		}.bind(this), this);

		if(Dubtrack.HideImages) this.hideImageToggle();
	},

	bindRealtimeEvents : function(){
		Dubtrack.Events.bind('realtime:chat-message', this.receiveMessage, this);
		Dubtrack.Events.bind('realtime:chat-skip', this.receiveMessage, this);
		Dubtrack.Events.bind('realtime:user-kick', this.receiveMessage, this);
		Dubtrack.Events.bind('realtime:user-ban', this.receiveMessage, this);
		Dubtrack.Events.bind('realtime:user-unban', this.receiveMessage, this);
		Dubtrack.Events.bind('realtime:user-setrole', this.receiveMessage, this);
		Dubtrack.Events.bind('realtime:user-unsetrole', this.receiveMessage, this);
		Dubtrack.Events.bind('realtime:user-mute', this.muteUserRealtime, this);
		Dubtrack.Events.bind('realtime:user-unmute', this.unmuteUserRealtime, this);
		Dubtrack.Events.bind('realtime:room_playlist-queue-remove-user-song', this.receiveMessage, this);
		Dubtrack.Events.bind('realtime:room_playlist-queue-remove-user', this.receiveMessage, this);
		Dubtrack.Events.bind('realtime:room_playlist-queue-reorder', this.receiveMessage, this);
		Dubtrack.Events.bind('realtime:room-lock-queue', this.receiveMessage, this);
		Dubtrack.Events.bind('realtime:delete-chat-message', this.deleteChatItem, this);
		Dubtrack.Events.bind('realtime:delete-chat-message-global', this.deleteUserChat, this);
		Dubtrack.Events.bind('realtime:room_playlist-queue-update-grabs', this.playlistSongGrabs, this);
		Dubtrack.Events.bind('realtime:user-pause-queue-mod', this.receiveMessage, this);

		Dubtrack.Events.bind('realtime:user-join', this.userJoin, this);
		Dubtrack.Events.bind('realtime:user-leave', this.userLeave, this);

		Dubtrack.Events.bind('realtime:user-update-' + Dubtrack.session.id, this.updateImage, this);
	},

	hideImageToggleClick : function(){
		Dubtrack.HideImages = !Dubtrack.HideImages;
		Dubtrack.helpers.cookie.set('dubtrack-hide-images', Dubtrack.HideImages ? 'hide' : 'show', 30);

		this.hideImageToggle();

		this.displayChat();

		return false;
	},

	hideImageToggle : function(){
		if(Dubtrack.HideImages){
			this.$('.hideImagesToggle').html('Show Images');
			this.$el.addClass('hide-images-in-text');
		}else{
			this.$('.hideImagesToggle').html('Hide Images');
			this.$el.removeClass('hide-images-in-text');
		}

		this.$('.chat-messages').scrollTop(0);
		this.$('.chat-messages').perfectScrollbar('update');
		var height = this.$('.chat-messages')[0].scrollHeight;
		this.$('.chat-messages').scrollTop(height);
		this.$('.chat-messages').perfectScrollbar('update');
	},

	clearChat : function(){
		this.model.reset({});
		Dubtrack.room.chat._messagesEl.find('li').remove();

		if(this.clear_chat_timeout) clearTimeout(this.clear_chat_timeout);
		this.clear_chat_timeout = setTimeout(function(){
			var chat_log = new Dubtrack.View.chatLoadingItem().$el.text('Chat has been cleared!').appendTo(Dubtrack.room.chat._messagesEl)
		}, 300);

		this.$('.chat-messages').scrollTop(0);
		this.$('.chat-messages').perfectScrollbar('update');

		this.displayChat();

		return false;
	},

	disableVideo: function(){
		var isOn;
		if (!this.isdisableVideo) {
			this.isdisableVideo = true;
			if(Dubtrack.room.player.YTplayerDelegate) Dubtrack.room.player.YTplayerDelegate.close();
			if(Dubtrack.room.player.SCplayerDelegate) Dubtrack.room.player.SCplayerDelegate.close();
			Dubtrack.room.player.YTplayerDelegate = null;
			Dubtrack.room.player.SCplayerDelegate = null;

			$('.playerElement').remove();
			$('.chat-option-buttons-video span').css('color','white');
			this.disableVideoElBtn.addClass('active');
			isOn = "on";
		} else {
			this.isdisableVideo = false;
			Dubtrack.room.player.reloadVideo();
			$('.chat-option-buttons-video span').css('color','#878c8e');
			this.disableVideoElBtn.removeClass('active');
			isOn = "off";
		}
	},

	muteUserRealtime: function(r){
		if(Dubtrack.session && Dubtrack.session.id == r.mutedUser._id) this.user_muted = true;
	},

	unmuteUserRealtime: function(r){
		if(Dubtrack.session && Dubtrack.session.id == r.mutedUser._id) this.user_muted = false;
	},

	openGifCreator: function(){
		window.open("/imgur/index.html#&client_id=94daca23890c704?action=chat&roomid=" + Dubtrack.room.model.id, "Dubtrack FM - GIF creator", "height=590,width=340,resizable=no,location=no,scrollbars=no");

		return false;
	},

	displayRoomUsers: function(){
		if(Dubtrack.room && Dubtrack.room.$el){
			Dubtrack.room.$el.removeClass('display-chat-settings').addClass('display-users-rooms');

			if(Dubtrack.room && Dubtrack.room.users){
				Dubtrack.room.users.resetEl();
				Dubtrack.room.users.displayActiveUsers();
			}
		}

		return false;
	},

	displayChat: function(){
		if(Dubtrack.room && Dubtrack.room.$el){
			Dubtrack.room.$el.removeClass('display-users-rooms display-chat-settings');
		}

		this.clickChatCounter();

		return false;
	},

	displayChatOptions: function(){
		if(Dubtrack.room && Dubtrack.room.$el){
			Dubtrack.room.$el.removeClass('display-users-rooms').addClass('display-chat-settings');
		}

		return false;
	},

	updateImage: function(r) {
		this.refreshImage = new Date().getTime();

		if (r && r.img && r.img.version) {
			var imageUrl = Dubtrack.config.apiUrl + Dubtrack.config.urls.userImage.replace(':id', Dubtrack.session.id);
			this.$('ul.chat-main li.user-' + r.user._id + ' .image_row img').attr('src', imageUrl);
		}
	},

	render : function(){
		this.$el.html( _.template( Dubtrack.els.templates.chat.chatContainer, {} ) );
		this.$('#new-messages-counter').hide();

		this._messageInputEl = this.$('input#chat-txt-message');
		this._messagesEl = this.$('ul.chat-main');
		this.chatSoundHtmlEl = this.$('a.chatSound');

		this.renderSound = false;

		this.chatCmdEl = this.$(".chat-commands");

		this.loadingHistory = this.$(".chatLoading");

		this.globalNotificationsEl = this.$("ul.globalNotifications");

		this.renderSound = true;
		this.isScrolling = false;

		this.newMessageCounter = 0;

		this.createSound();

		this.$('.chat-messages').perfectScrollbar({
			suppressScrollX: true,
			wheelPropagation: false,
			minScrollbarLength: 40
		});

		this.$('.chat-messages').on('ps-scroll-y', function (e) {
			if(!e || !e.target) return;

			this.onChatScroll((e.target.scrollTop + e.target.offsetHeight), e.target.scrollHeight);
		}.bind(this));

		return this;
	},

	onChatScroll: function(scrollY, scrollHeight){
		if( scrollHeight - 250 > scrollY ){
			this.scrollToBottom = false;
		}else{
			this.scrollToBottom = true;
			this.$('#new-messages-counter').hide();
			this.newMessageCounter = 0;
		}
	},

	clickChatCounter: function(){
		this.scrollToBottom = true;
		this.scollBottomChat();

		return false;
	},

	receiveMessage: function(r){
		var id = (r.user && "_id" in r.user) ? r.user._id : false;

		if(r.type === 'user-ban') this.removeBanUserChat(r);

		if(Dubtrack.session && id && r.type === "chat-message" && r.user._id === Dubtrack.session.get("_id") ) return;

		var chatModel = new Dubtrack.Model.chat(r);
		this.model.add(chatModel);

		if(Dubtrack.session){
			var usernamePing = '@' + Dubtrack.session.get('username');
			console.log(usernamePing, r.message);
			if (r && r.message && r.message.toLowerCase().indexOf(usernamePing) > -1) {
				$('.username-handle:contains('+ usernamePing +')').css('color','rgba(255,0,255,0.80)');
			}
		}
	},

	userJoin: function(r){
		var id = (r.user && "_id" in r.user) ? r.user._id : false;

		if(Dubtrack.session && id && r.user._id === Dubtrack.session.get("_id") ) return;

		var user = Dubtrack.AvatarUsersRegistered.findWhere({
			"_id" : r.user._id
		});

		if(user) return;

		Dubtrack.AvatarUsersRegistered.add(r.user);

		var chatModel = new Dubtrack.Model.chat(r);
		this.model.add(chatModel);
	},

	playlistSongGrabs: function(r){
		var chatModel = new Dubtrack.Model.chat(r);
		this.model.add(chatModel);
	},

	userLeave: function(r){
		var id = (r.user && "_id" in r.user) ? r.user._id : false;

		if(Dubtrack.session && id && r.user._id === Dubtrack.session.get("_id") ) return;

		var user = Dubtrack.room.users.collection.findWhere({
			"userid" : r.user._id
		});

		if(!user) return;

		var chatModel = new Dubtrack.Model.chat(r);
		this.model.add(chatModel);
	},

	displayChatHelp : function(){
		if( !this.chatHelp ) this.chatHelp = new Dubtrack.View.helpModalMod();

		this.chatHelp.$el.show();

		return false;
	},

	keyPressAction : function(e){
		c = e.which ? e.which : e.keyCode;
		if (c == 13){
			this.sendMessage();
			return false;
		}
	},

	setDefaultSound : function(filter){
		this.chatSoundHtmlEl.removeClass("mute");

		switch(filter){
			case "none":
				this.renderSound = true;
				this.chatSoundFilter = "none";
				this.chatSoundHtmlEl.html( dubtrack_lang.chat.sound_on );
			break;
			case "mention":
				this.renderSound = true;
				this.chatSoundFilter = "mention";
				this.chatSoundHtmlEl.html( dubtrack_lang.chat.sound_mention );
			break;
			case "off":
				this.renderSound = false;
				this.chatSoundFilter = "off";
				this.chatSoundHtmlEl.html( dubtrack_lang.chat.sound_off );
				this.chatSoundHtmlEl.addClass( "mute" );
			break;
			default:
				this.renderSound = true;
				this.chatSoundFilter = "none";
				this.chatSoundHtmlEl.html( dubtrack_lang.chat.sound_on );
			break;
		}

		return false;
	},

	setSoundOn : function(){
		this.$('.chat-option-buttons-sound .active').removeClass('active');
		this.$('.setOnChatNotifications').addClass('active');

		this.renderSound = true;
		this.chatSoundFilter = "none";

		return false;
	},

	setSoundOff : function(){
		this.$('.chat-option-buttons-sound .active').removeClass('active');
		this.$('.setOffChatNotifications').addClass('active');

		this.renderSound = false;
		this.chatSoundFilter = "off";

		return false;
	},

	setSoundMention : function(){
		this.$('.chat-option-buttons-sound .active').removeClass('active');
		this.$('.setMentionChatNotifications').addClass('active');

		this.renderSound = true;
		this.chatSoundFilter = "mention";

		return false;
	},

	setSound : function(){
		this.chatSoundHtmlEl.removeClass("mute");

		switch(this.chatSoundFilter){
			case "none":
				this.renderSound = true;
				this.chatSoundFilter = "mention";
				this.chatSoundHtmlEl.html( dubtrack_lang.chat.sound_mention );
			break;
			case "mention":
				this.renderSound = false;
				this.chatSoundFilter = "off";
				this.chatSoundHtmlEl.html( dubtrack_lang.chat.sound_off );
				this.chatSoundHtmlEl.addClass("mute");
			break;
			case "off":
				this.renderSound = true;
				this.chatSoundFilter = "none";
				this.chatSoundHtmlEl.html( dubtrack_lang.chat.sound_on );
			break;
			default:
				this.renderSound = true;
				this.chatSoundFilter = "none";
				this.chatSoundHtmlEl.html( dubtrack_lang.chat.sound_on );
			break;
		}

		//DJ.global.sendPostRequest("room/main/saveUserData", {'var': 'chat_sound', 'value': Chat.chatSoundFilter}, null, null);
		return false;
	},

	displayHistory : function(){

		var self = this;
		/*_.each( dubtrackMain.roomModel.get('chat_history'), function(item){
			self.appendEl(item);
		});*/
		//send ajax request
		$.ajax({
			url: dubtrackMain.config.getChatHistory + dubtrackMain.roomModel.id,
			data: {},
			type: 'GET',
			success: function(r){
				_.each( r.data.chat_history, function(item){
					self.appendEl(item);
				});
				self.loadingHistory.hide();
				self.createSound();
			},
			error: function(){
				self.loadingHistory.hide();
				self.createSound();
			}
		},"json");
	},

	appendItem: function(chatModel){
		var chatItem;

		/*if(this.model.models.length > 1000){
			var model = this.model.at(0);

			if(model){
				this._messagesEl.find("#" + model.get('chatid')).remove();
				this.model.remove(model);

				try{
					this.$('.chat-messages').scrollTop(0);
					this.$('.chat-messages').perfectScrollbar('update');
					var height = this.$('.chat-messages')[0].scrollHeight;
					this.$('.chat-messages').scrollTop(height);
					this.$('.chat-messages').perfectScrollbar('update');
				}catch(ex){}
			}
		}*/

		switch(chatModel.get('type')){
			case "chat-skip":
				this.lastItemChatUser = false;
				this.lastItemEl = false;

				chatItem = new Dubtrack.View.chatSkipItem({
					model: chatModel
				});

				chatItem.$el.appendTo( this._messagesEl );

				this.playSound(false);
			break;
			case "user-join":
				if(Dubtrack.room.model.get('displayUserJoin')){
					this.lastItemChatUser = false;
					this.lastItemEl = false;

					chatItem = new Dubtrack.View.chatJoinItem({
						model: chatModel
					});

					chatItem.$el.appendTo( this._messagesEl );

					this.playSound(false);
				}
				break;
			case "user-leave":
				if(Dubtrack.room.model.get('displayUserLeave')){
					this.lastItemChatUser = false;
					this.lastItemEl = false;

					chatItem = new Dubtrack.View.chatLeaveItem({
						model: chatModel
					});

					chatItem.$el.appendTo( this._messagesEl );

					this.playSound(false);
				}
				break;
			case "user-kick":
				this.lastItemChatUser = false;
				this.lastItemEl = false;

				chatItem = new Dubtrack.View.chatKickedItem({
					model: chatModel
				});

				chatItem.$el.appendTo( this._messagesEl );

				this.playSound(false);
			break;
			case "user-ban":
				this.lastItemChatUser = false;
				this.lastItemEl = false;

				chatItem = new Dubtrack.View.chatBannedItem({
					model: chatModel
				});

				chatItem.$el.appendTo( this._messagesEl );

				this.playSound(false);
			break;
			case "user-unban":
				this.lastItemChatUser = false;
				this.lastItemEl = false;

				chatItem = new Dubtrack.View.chatUnbannedItem({
					model: chatModel
				});

				chatItem.$el.appendTo( this._messagesEl );

				this.playSound(false);
				break;
			case "user-setrole":
				this.lastItemChatUser = false;
				this.lastItemEl = false;

				chatItem = new Dubtrack.View.chatSetRoleItem({
					model: chatModel
				});

				chatItem.$el.appendTo( this._messagesEl );

				this.playSound(false);
				break;
			case "user-unsetrole":
				this.lastItemChatUser = false;
				this.lastItemEl = false;

				chatItem = new Dubtrack.View.chatUnsetRoleItem({
					model: chatModel
				});

				chatItem.$el.appendTo( this._messagesEl );

				this.playSound(false);
				break;
			case "room_playlist-queue-remove-user-song":
				this.lastItemChatUser = false;
				this.lastItemEl = false;

				chatItem = new Dubtrack.View.removedSongFromQueueItem({
					model: chatModel
				});

				chatItem.$el.appendTo( this._messagesEl );

				this.playSound(false);
				break;
			case "room_playlist-queue-remove-user":
				this.lastItemChatUser = false;
				this.lastItemEl = false;

				chatItem = new Dubtrack.View.removedFromQueueItem({
					model: chatModel
				});

				chatItem.$el.appendTo( this._messagesEl );

				this.playSound(false);
				break;
			case "room_playlist-queue-update-grabs":
				if(Dubtrack.room.model.get('displayUserGrab')){
					this.lastItemChatUser = false;
					this.lastItemEl = false;

					chatItem = new Dubtrack.View.grabbedPlaylistRoom({
						model: chatModel
					});

					chatItem.$el.appendTo( this._messagesEl );

					this.playSound(false);
				}
				break;

			case "room_playlist-queue-reorder":
				this.lastItemChatUser = false;
				this.lastItemEl = false;

				chatItem = new Dubtrack.View.reorderQueueItem({
					model: chatModel
				});

				chatItem.$el.appendTo( this._messagesEl );

				this.playSound(false);
				break;
			case "room-lock-queue":
				this.lastItemChatUser = false;
				this.lastItemEl = false;

				chatItem = new Dubtrack.View.lockRoomQueueItem({
					model: chatModel
				});

				chatItem.$el.appendTo( this._messagesEl );

				this.playSound(false);
				break;
			case "user-pause-queue-mod":
				this.lastItemChatUser = false;
				this.lastItemEl = false;

				chatItem = new Dubtrack.View.pauseUserQueueItem({
					model: chatModel
				});

				chatItem.$el.appendTo( this._messagesEl );

				this.playSound(false);
				break;
			case "room-welcome-message":
				this.lastItemChatUser = false;
				this.lastItemEl = false;

				chatItem = new Dubtrack.View.welcomeMessageChatItem({
					model: chatModel
				});

				chatItem.$el.appendTo( this._messagesEl );

				this.playSound(false);
				break;
			default:
				if(this.refreshImage){
					chatModel.set({
						refreshVersion: this.refreshImage
					});
				}

				chatItem = new Dubtrack.View.chatItem({
					model: chatModel
				});

				var user = chatModel.get('user'),
					message = chatModel.get('message');

				if(/^\/me.*\S+/.test(message)){
					this.lastItemChatUser = false;
					this.lastItemEl = false;

					chatItem = new Dubtrack.View.chatMeCommand({
						model: chatModel
					});

					chatItem.$el.appendTo( this._messagesEl );

					this.playSound(false);
					return;
				}

				if(	Dubtrack.session &&
					Dubtrack.session.id != user._id &&
					Dubtrack.room &&
					Dubtrack.room.users &&
					Dubtrack.room.users.getIfmuted(user._id) ) return;

				if(this.lastItemEl && this.lastItemChatUser && user._id == this.lastItemChatUser._id && this.lastItemEl.$el.is(":visible")){
					this.lastItemEl.$('.text').append('<p>' + chatModel.get('message') + '</p>');
					this.lastItemEl.model.set('id', chatModel.get('chatid'));
					this.lastItemEl.updateTime(chatModel.get('time'));
					this.lastItemEl.$el.removeClass('deleted-message');
				}else{
					this.lastItemChatUser = user;
					this.lastItemEl = chatItem;

					chatItem.$el.appendTo( this._messagesEl );
					chatItem.render();
				}

				var regex_chat_text_all = new RegExp("@everyone\\b", 'g');
				var regex_chat_text_staff = new RegExp("@mods\\b", 'g');
				var regex_chat_text_djs = new RegExp("@djs\\b", 'g');

				if(Dubtrack.loggedIn){
					try{
						var regex = new RegExp("@" + Dubtrack.session.get('username') + "\\b", 'ig');
						var mention = regex.test(chatModel.get('message'));
						var mentionAll = regex_chat_text_all.test(chatModel.get('message')) && (Dubtrack.helpers.isDubtrackAdmin(user._id) || Dubtrack.room.users.getIfRoleHasPermission(user._id, 'chat-mention'));
						var mentionStaff = regex_chat_text_staff.test(chatModel.get('message')) && (Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || Dubtrack.room.users.getIfRoleHasPermission(Dubtrack.session.id, 'chat-mention'));
						var djmentionStaff = regex_chat_text_djs.test(chatModel.get('message')) && (Dubtrack.helpers.isDubtrackAdmin(user._id) || Dubtrack.room.users.getIfRoleHasPermission(user._id, 'chat-mention')) && (Dubtrack.room.player && Dubtrack.room.player.activeQueueCollection && Dubtrack.room.player.activeQueueCollection.findWhere({userid : Dubtrack.session.id}));

						this.playSound(mention || mentionAll || mentionStaff || djmentionStaff);
					}catch(ex){}
				}else{
					this.playSound(false);
				}
		}

		if(!this.scrollToBottom){
			this.$('#new-messages-counter').show();
			this.newMessageCounter++;
			if(this.newMessageCounter > 1){
				this.$('#new-messages-counter .messages-display').html(this.newMessageCounter + " new messages");
			}else{
				this.$('#new-messages-counter .messages-display').html(this.newMessageCounter + " new message");
			}
		}
	},

	createSound : function(){
		if(this.chatSound) return;

		this.chatSound = true;
		this.mentionChatSound = true;

		var self = this;

		soundManager.setup({
			url: '/assets/swf/',
			flashVersion: 9,
			//preferFlash: false,
			onready: function() {
				self.chatSound = soundManager.createSound({
					id: 'chatsound',
					autoPlay: false,
					url: Dubtrack.config.urls.mediaBaseUrl + "/assets/music/notification.mp3",
					onerror : function() {
						self.chatSound = false;
					}
				});

				self.mentionChatSound = soundManager.createSound({
					id: 'chatmentionsound',
					autoPlay: false,
					url: "/assets/music/user_ping.mp3",
					onerror : function() {
						self.chatSound = false;
					}
				});
			}
		});
	},

	scollBottomChat: function(){
		if(this.scrollToBottom){
			this.$('.chat-messages').perfectScrollbar('update');

			var height = this.$('.chat-messages')[0].scrollHeight;
			this.$('.chat-messages').scrollTop(height);
			this.$('.chat-messages').perfectScrollbar('update');
		}
	},

	playSound : function(mention){
		this.scollBottomChat();

		if(this.renderSound){
			if(this.chatSoundFilter == "none"){
				try{
					if(this.chatSound) this.chatSound.play();
				}catch(ex){
					console.log("CHAT PLAY NOTIFICATION ERROR", ex);
				}
			}

			if(this.chatSoundFilter != "off" && mention){
				try{
					if(this.mentionChatSound) this.mentionChatSound.play();
				}catch(ex){
					console.log("CHAT MENTION PLAY NOTIFICATION ERROR", ex);
				}
			}
		}
	},

	systemMessageReceived : function(message){
		if(message !== null && message !== ""){

			Chat._messagesEl.append(content);
			this.playSound(false);
		}
	},

	genMessageInfo: function(message){
		if(message !== null && message !== ""){

			this.playSound(false);
		}
	},

	sendMessage : function(){
		var message = $('<div/>').text($.trim(this._messageInputEl.val())).html();
		if(message === "" || message === null) return;

		this._messageInputEl.val('');
		var chatModel,
			username,
			tmpstr;


		if(message.indexOf("/kick @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.kickUser(username, $.trim(message.replace("/kick @"+ username, "")));
			return;
		}

		if(message.indexOf("/ban @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.banUser(username, parseInt($.trim(message.replace("/ban @"+ username, "")), 10));
			return;
		}

		if(message.indexOf("/unban @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.unbanUser(username);
			return;
		}

		if(message.indexOf("/setmod @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.setRole(username, 'setModUser');
			return;
		}

		if(message.indexOf("/unsetmod @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.unsetRole(username, 'setModUser');
			return;
		}

		if(message.indexOf("/setresdj @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.setRole(username, 'setDJUser');
			return;
		}

		if(message.indexOf("/unsetresdj @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.unsetRole(username, 'setDJUser');
			return;
		}

		if(message.indexOf("/setdj @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.setRole(username, 'setRoomDJUser');
			return;
		}

		if(message.indexOf("/unsetdj @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.unsetRole(username, 'setRoomDJUser');
			return;
		}

		if(message.indexOf("/setvip @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.setRole(username, 'setVIPUser');
			return;
		}

		if(message.indexOf("/unsetvip @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.unsetRole(username, 'setVIPUser');
			return;
		}

		if(message.indexOf("/setmanager @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.setRole(username, 'setManagerUser');
			return;
		}

		if(message.indexOf("/unsetmanager @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.unsetRole(username, 'setManagerUser');
			return;
		}

		if(message.indexOf("/setowner @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.setRole(username, 'setOwnerUser');
			return;
		}

		if(message.indexOf("/unsetowner @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.unsetRole(username, 'setOwnerUser');
			return;
		}

		if(message.indexOf("/unmute @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.unmuteUser(username);
			return;
		}

		if(message.indexOf("/mute @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9\.\-\_]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.muteUser(username);
			return;
		}

		if(message.indexOf("/skip") === 0){
			this.skipSong();
			return;
		}

		if(Date.now() - this.lastSentChatMessage < 1500){
			this.chatMessageWarningCounter++;

			if(this.chatMessageWarningCounter > 4){
				this.model.add(new Dubtrack.Model.chat({
					user: {
						_force_updated: 1448781184094,
						userInfo: {
							_id: "565aa52e6fe207830052f580",
							userid: "565aa52e6fe207830052f57f",
							__v: 0
						},
						_id: "565aa52e6fe207830052f57f",
						username: "dubtrack_bot",
						status: 1,
						roleid: 1,
						dubs: 0,
						created: 1448781102432,
						__v: 0
					},
					message: 'whoa @' + Dubtrack.session.get('username') + '! slow down or you will be temporarily blocked from chatting',
					time: Date.now(),
					realTimeChannel: Dubtrack.room.model.get('realTimeChannel'),
					type: 'chat-message'
				}));

				this.chatMessageWarningCounter = 0;
			}
		}else{
			this.chatMessageWarningCounter = 0;
		}

		this.lastSentChatMessage = Date.now();

		chatModel = new Dubtrack.Model.chat({
			user: Dubtrack.session.toJSON(),
			message: message,
			time: Date.now(),
			realTimeChannel: Dubtrack.room.model.get('realTimeChannel'),
			type: 'chat-message'
		});

		if(!this.user_muted){
			//send chat message
			chatModel.urlRoot = this.chatEndPointUrl;
			chatModel.save(null, {
				error : function(m, r){
					this.lastItemChatUser = false;
					this.lastItemEl = false;

					var chatItem = new Dubtrack.View.chatLoadingItem();
					chatItem.$el.appendTo( this._messagesEl );
					if(r && r.status && r.status == 429){
						try{
							var status_text = JSON.parse(r.responseText);
							if(status_text && status_text.data && status_text.data.details && status_text.data.details.message){
								chatItem.$el.addClass('system-error').html('You reached chat quota limit, please wait ' + status_text.data.details.message + ' before retrying');
							}else{
								chatItem.$el.addClass('system-error').html('You reached chat quota limit, please wait 10 mins before retrying');
							}
						}catch(ex){
							chatItem.$el.addClass('system-error').html('You reached chat quota limit, please wait 10 mins before retrying');
						}
					}else{
						chatItem.$el.addClass('system-error').html('An error occurred sending chat message');
					}

					try{
						this.$('.chat-messages').scrollTop(0);
						this.$('.chat-messages').perfectScrollbar('update');
						var height = this.$('.chat-messages')[0].scrollHeight;
						this.$('.chat-messages').scrollTop(height);
						this.$('.chat-messages').perfectScrollbar('update');
					}catch(ex){}
				}.bind(this)
			});
		}

		//display item instantly
		this.model.add(chatModel);
	},

	deleteChatItem: function(r){
		if(r.chatid && r.user && r.user.username){
			this.$('.chat-main li.chat-id-' + r.chatid + ' .text').html('<p class="deleted">chat message deleted by @' + r.user.username + '</p>');
			this.$('.chat-main li.chat-id-' + r.chatid).addClass('deleted-message')

			try{
				this.$('.chat-messages').scrollTop(0);
				this.$('.chat-messages').perfectScrollbar('update');
				var height = this.$('.chat-messages')[0].scrollHeight;
				this.$('.chat-messages').scrollTop(height);
				this.$('.chat-messages').perfectScrollbar('update');
			}catch(ex){}
		}
	},

	deleteUserChat: function(r){
		if(r.userdid && r.user && r.user.username){
			this.$('.chat-main li.user-' + r.userdid + ' .text').html('<p class="deleted">chat message deleted by @' + r.user.username + '</p>');
			this.$('.chat-main li.user-' + r.userdid).addClass('deleted-message')

			try{
				this.$('.chat-messages').scrollTop(0);
				this.$('.chat-messages').perfectScrollbar('update');
				var height = this.$('.chat-messages')[0].scrollHeight;
				this.$('.chat-messages').scrollTop(height);
				this.$('.chat-messages').perfectScrollbar('update');
			}catch(ex){}
		}
	},

	removeBanUserChat: function(r){
		if(r.user && r.user.username && r.kickedUser){
			this.$('.chat-main li.user-' + r.kickedUser._id + ' .text').html('<p class="deleted">user was banned by @' + r.user.username + '</p>');
			this.$('.chat-main li.user-' + r.kickedUser._id).addClass('deleted-message');

			try{
				this.$('.chat-messages').scrollTop(0);
				this.$('.chat-messages').perfectScrollbar('update');
				var height = this.$('.chat-messages')[0].scrollHeight;
				this.$('.chat-messages').scrollTop(height);
				this.$('.chat-messages').perfectScrollbar('update');
			}catch(ex){}
		}
	},

	setUserCount: function(users){
		this.$('.room-user-counter').html(users);
		$('.mobile-users-counter').html(users);
	},

	setGuestCount: function(users){
		this.$('.room-guest-counter').html("+" + users);
	},

	skipSong: function(){
		var chatItem = new Dubtrack.View.chatLoadingItem();
		chatItem.$el.appendTo( this._messagesEl );

		if(Dubtrack.room && Dubtrack.room.player && Dubtrack.room.player.activeSong && Dubtrack.room.player.activeSong.get('song')){
			var song = Dubtrack.room.player.activeSong.get('song');

			if(!song._id){
				chatItem.$el.addClass('system-error').html('No active song');

				return;
			}

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.skipSong.replace(":id", Dubtrack.room.model.id).replace(":songid", song._id);

			Dubtrack.helpers.sendRequest(url, {
				realTimeChannel: Dubtrack.room.model.get('realTimeChannel')
			}, "post", function(err, r){
				if(err){
					if(err.data && err.data.err && err.data.err.details && err.data.err.details.message){
						chatItem.$el.addClass('system-error').html(err.data.err.details.message);
					}else{
						chatItem.$el.addClass('system-error').html('unauthorized action');
					}
				}else{
					chatItem.$el.hide();
				}
			}, this);
		}else{
			chatItem.$el.addClass('system-error').html('No active song');
		}
	},

	setRole: function(username, role){
		var chatItem = new Dubtrack.View.chatLoadingItem();
		chatItem.$el.appendTo( this._messagesEl );

		if(!Dubtrack.config.urls[role]){
			chatItem.$el.addClass('system-error').html('Invalid action');
			return;
		}

		Dubtrack.cache.users.getByUsername(username, function(err, user){
			if(err || !user){
				chatItem.$el.addClass('system-error').html('Invalid user: @' + username);
				return;
			}

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls[role].replace(":roomid", Dubtrack.room.model.id);
			url = url.replace(":id", user.id);

			Dubtrack.helpers.sendRequest(url, {
				realTimeChannel: Dubtrack.room.model.get('realTimeChannel')
			}, "post", function(err, r){
				if(err){
					if(err.data && err.data.err && err.data.err.details && err.data.err.details.message){
						chatItem.$el.addClass('system-error').html(err.data.err.details.message);
					}else{
						chatItem.$el.addClass('system-error').html('unauthorized action');
					}
				}else{
					chatItem.$el.hide();
				}
			}, this);
		});
	},

	unsetRole: function(username, role){
		var chatItem = new Dubtrack.View.chatLoadingItem();
		chatItem.$el.appendTo( this._messagesEl );

		if(!Dubtrack.config.urls[role]){
			chatItem.$el.addClass('system-error').html('Invalid action');
			return;
		}

		Dubtrack.cache.users.getByUsername(username, function(err, user){
			if(err || !user){
				chatItem.$el.addClass('system-error').html('Invalid user: @' + username);
			}

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls[role].replace(":roomid", Dubtrack.room.model.id);
			url = url.replace(":id", user.id);

			Dubtrack.helpers.sendRequest(url, {
				realTimeChannel: Dubtrack.room.model.get('realTimeChannel')
			}, "delete", function(err, r){
				if(err){
					if(err.data && err.data.err && err.data.err.details && err.data.err.details.message){
						chatItem.$el.addClass('system-error').html(err.data.err.details.message);
					}else{
						chatItem.$el.addClass('system-error').html('unauthorized action');
					}
				}else{
					chatItem.$el.hide();
				}
			}, this);
		});
	},

	unmuteUser: function(username){
		var chatItem = new Dubtrack.View.chatLoadingItem();
		chatItem.$el.appendTo( this._messagesEl );
		var self = this;

		Dubtrack.cache.users.getByUsername(username, function(err, user){
			if(err || !user){
				chatItem.$el.addClass('system-error').html('Invalid user: @' + username);
				return;
			}

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.muteUser.replace(":roomid", Dubtrack.room.model.id);
			url = url.replace(":id", user.id);

			Dubtrack.helpers.sendRequest(url, {
				realTimeChannel: Dubtrack.room.model.get('realTimeChannel')
			}, "delete", function(err, r){
				if(err){
					if(err.data && err.data.err && err.data.err.details && err.data.err.details.message){
						chatItem.$el.addClass('system-error').html(err.data.err.details.message);
					}else{
						chatItem.$el.addClass('system-error').html('unauthorized action');
					}
				}else{
					self.lastItemChatUser = false;
					self.lastItemEl = false;

					chatItem.$el.html("user quietly unmuted");
				}
			}, this);
		});
	},

	muteUser: function(username){
		var chatItem = new Dubtrack.View.chatLoadingItem();
		chatItem.$el.appendTo( this._messagesEl );
		var self = this;

		Dubtrack.cache.users.getByUsername(username, function(err, user){
			if(err || !user){
				chatItem.$el.addClass('system-error').html('Invalid user: @' + username);
				return;
			}

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.muteUser.replace(":roomid", Dubtrack.room.model.id);
			url = url.replace(":id", user.id);

			Dubtrack.helpers.sendRequest(url, {
				realTimeChannel: Dubtrack.room.model.get('realTimeChannel')
			}, "post", function(err, r){
				if(err){
					if(err.data && err.data.err && err.data.err.details && err.data.err.details.message){
						chatItem.$el.addClass('system-error').html(err.data.err.details.message);
					}else{
						chatItem.$el.addClass('system-error').html('unauthorized action');
					}
				}else{
					self.lastItemChatUser = false;
					self.lastItemEl = false;

					chatItem.$el.html("user quietly muted");
				}
			}, this);
		});
	},

	unbanUser: function(username){
		var chatItem = new Dubtrack.View.chatLoadingItem();
		chatItem.$el.appendTo( this._messagesEl );

		Dubtrack.cache.users.getByUsername(username, function(err, user){
			if(err || !user){
				chatItem.$el.addClass('system-error').html('Invalid user: @' + username);
				return;
			}

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.banUser.replace(":roomid", Dubtrack.room.model.id);
			url = url.replace(":id", user.id);

			Dubtrack.helpers.sendRequest(url, {
				realTimeChannel: Dubtrack.room.model.get('realTimeChannel')
			}, "delete", function(err, r){
				if(err){
					if(err.data && err.data.err && err.data.err.details && err.data.err.details.message){
						chatItem.$el.addClass('system-error').html(err.data.err.details.message);
					}else{
						chatItem.$el.addClass('system-error').html('unauthorized action');
					}
				}else{
					chatItem.$el.hide();
				}
			}, this);
		});
	},

	banUser: function(username, time){
		var chatItem = new Dubtrack.View.chatLoadingItem();
		chatItem.$el.appendTo( this._messagesEl );

		Dubtrack.cache.users.getByUsername(username, function(err, user){
			if(err || !user){
				chatItem.$el.addClass('system-error').html('Invalid user: @' + username);
				return;
			}

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.banUser.replace(":roomid", Dubtrack.room.model.id);
			url = url.replace(":id", user.id);

			if( isNaN(time) ) time = 0;

			Dubtrack.helpers.sendRequest(url, {
				time: time,
				realTimeChannel: Dubtrack.room.model.get('realTimeChannel')
			}, "post", function(err, r){
				if(err){
					if(err.data && err.data.err && err.data.err.details && err.data.err.details.message){
						chatItem.$el.addClass('system-error').html(err.data.err.details.message);
					}else{
						chatItem.$el.addClass('system-error').html('unauthorized action');
					}
				}else{
					chatItem.$el.hide();
				}
			}, this);
		});
	},

	kickUser: function(username, message){
		var chatItem = new Dubtrack.View.chatLoadingItem();
		chatItem.$el.appendTo( this._messagesEl );

		Dubtrack.cache.users.getByUsername(username, function(err, user){
			if(err || !user){
				chatItem.$el.addClass('system-error').html('Invalid user: @' + username);
				return;
			}

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.kickUser.replace(":roomid", Dubtrack.room.model.id);
			url = url.replace(":id", user.id);

			Dubtrack.helpers.sendRequest(url, {
				message: message,
				realTimeChannel: Dubtrack.room.model.get('realTimeChannel')
			}, "post", function(err, r){
				if(err){
					if(err.data && err.data.err && err.data.err.details && err.data.err.details.message){
						chatItem.$el.addClass('system-error').html(err.data.err.details.message);
					}else{
						chatItem.$el.addClass('system-error').html('unauthorized action');
					}
				}else{
					chatItem.$el.hide();
				}
			}, this);
		});
	}
});
