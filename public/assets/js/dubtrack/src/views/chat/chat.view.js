Dubtrack.Events.bind('realtime:chat-message',realtimeChatPing);
$('body').prepend('<audio class="isRobot" preload="auto"><source src="/assets/music/user_ping.mp3" type="audio/mpeg"></audio>');
function realtimeChatPing(data) {
		var realtimeChatUser = Dubtrack.session.get('username');
		var realtimeChatData = data.message;
		if (!realtimeChatData.indexOf('@'+realtimeChatUser)) {
				var isRobot = document.querySelector('.isRobot');
				isRobot.play();
		}
}

Dubtrack.AvatarUsersRegistered = new Backbone.Collection();

Dubtrack.View.chat = Backbone.View.extend({

	renderSound : true,

	el : $('#chat'),

	chatSoundFilter : 'none',

	_type_message : null,

	events : {
		"keydown input#chat-txt-message": "keyPressAction",
		"click button.pusher-chat-widget-send-btn": "sendMessage",
		"click a.chatSound": "setSound",
		"click a.chat-commands": "displayChatHelp",
		"click #new-messages-counter": "clickChatCounter",
		"click .room-user-counter": "displayRoomUsers",
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
		Dubtrack.Events.bind('realtime:room_playlist-queue-reorder', this.receiveMessage, this);
		Dubtrack.Events.bind('realtime:room-lock-queue', this.receiveMessage, this);
		Dubtrack.Events.bind('realtime:delete-chat-message', this.deleteChatItem, this);
		//Dubtrack.Events.bind('realtime:user-pause-queue', this.receiveMessage, this);

		//subscribe after 2s
		setTimeout(function(){
			Dubtrack.Events.bind('realtime:user-join', this.userJoin, this);
		}, 5000);

		Dubtrack.Events.bind('realtime:user-update-' + Dubtrack.session.id, this.updateImage, this);

		//holder for last chat user item
		this.lastItemChatUser = false;
		this.lastItemEl = false;
		this.user_muted = false;

		this.render();

		//display welcome message
		this.model.add(new Dubtrack.Model.chat({
			time: Date.now(),
			type: 'room-welcome-message'
		}));

		if(Dubtrack.HideImages) this.hideImageToggle();
	},

	hideImageToggleClick : function(){
		Dubtrack.HideImages = !Dubtrack.HideImages;
		Dubtrack.helpers.cookie.set('dubtrack-hide-images', Dubtrack.HideImages ? 'hide' : 'show', 30);

		this.hideImageToggle();

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

		return false;
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
			Dubtrack.room.$el.addClass('display-users-rooms');

			if(Dubtrack.room && Dubtrack.room.users) Dubtrack.room.users.resetEl();
		}

		return false;
	},

	updateImage: function(r){
		this.refreshImage = new Date().getTime();

		$.each(this.$("ul.chat-main li:regex(class, .*user-" +  r.user._id.toLowerCase() + ".*)"), function(){
			$(this).find('.image_row img').attr('src', r.img);
		});
	},

	render : function(){
		var self = this;

		//this.$el.attr( "id", "pusher_chat_widget" );

		this.$el.html( _.template( Dubtrack.els.templates.chat.chatContainer, {} ) );

		this._messageInputEl = this.$('input#chat-txt-message');
		this._messagesEl = this.$('ul.chat-main');
		this.chatSoundHtmlEl = this.$('a.chatSound');

		this.renderSound = false;
		this.chatSoundFilter = false;

		this.chatCmdEl = this.$(".chat-commands");

		this.loadingHistory = this.$(".chatLoading");

		this.globalNotificationsEl = this.$("ul.globalNotifications");
		/*
		$.each(history, function(){
			if(this.type == "chat-message")
				Chat.messageReceived(this);
		});*/

		this.renderSound = true;
		this.isScrolling = false;

		this.newMessageCounter = 0;

		self.createSound();
		this.setDefaultSound( "mention" );

		$(window).resize(function(){
			self.resize();
		});

		this.resize();

		this.$('.chat-messages').perfectScrollbar({
			wheelSpeed: 50,
			suppressScrollX: true,
			wheelPropagation: false,
			onscrollCallback: function(scrollY, height){
				self.onChatScroll(scrollY, height);
			}
		});

		return this;
	},

	clickChatCounter: function(){
		this.scrollToBottom = true;
		this.scollBottomChat();

		return false;
	},

	onChatScroll: function(scrollY, height){
		if( height - 200 > scrollY ){
			this.scrollToBottom = false;
		}else{
			this.scrollToBottom = true;
			this.$('#new-messages-counter').hide();
			this.newMessageCounter = 0;
		}
	},

	receiveMessage: function(r){
		var id = (r.user && "_id" in r.user) ? r.user._id : false;

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
				this.renderSound = false;
				this.chatSoundFilter = "mention";
				this.chatSoundHtmlEl.html( dubtrack_lang.chat.sound_mention );
			break;
			case "off":
				this.renderSound = true;
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

	resize: function(){
		var $h = parseInt( $(window).height(), 10 ) - 255;

		if( parseInt( $(window).width(), 10 ) < 1150){
			$h -= 15;
		}

		if($('body').hasClass('videoActive') && $(window).width() > 800){
			$h -= 200;
		}

		this.$('.chat-messages').css('height', $h);
		this.$('.chat-messages').perfectScrollbar('update');

		this.scollBottomChat();
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

		if(!this.scrollToBottom){
			this.$('#new-messages-counter').show();
			this.newMessageCounter++;
			if(this.newMessageCounter > 1){
				this.$('#new-messages-counter .messages-display').html(this.newMessageCounter + " new messages");
			}else{
				this.$('#new-messages-counter .messages-display').html(this.newMessageCounter + " new message");
			}
		}

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
				this.lastItemChatUser = false;
				this.lastItemEl = false;

				chatItem = new Dubtrack.View.chatJoinItem({
					model: chatModel
				});

				chatItem.$el.appendTo( this._messagesEl );

				this.playSound(false);
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
			case "user-pause-queue":
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
				}else{
					this.lastItemChatUser = user;
					this.lastItemEl = chatItem;

					chatItem.$el.appendTo( this._messagesEl );
					chatItem.render();
				}

				//this.playSound( (data.body.indexOf("@" + this.usernameEl) != -1) );
				//else this.playSound(false);
				this.playSound(false);
		}
	},

	createSound : function(){
		if(this.chatSound) return;

		this.chatSound = true;

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
		//$('.avatar_' + Player.currentDJ).addClass("currentDJ");
		//$(".avatar_" + DJ.DJRoom.iduser_owner).addClass("owner-mod");
		this.scollBottomChat();

		if(this.renderSound){
			if(this.chatSoundFilter == "none" || mention){
				try{
					if(this.chatSound) this.chatSound.play();
				}catch(ex){
					console.log("CHAT PLAY NOTIFICATION ERROR", ex);
				}
			}
		}

		//if(!this.isScrolling || this.idCounter < 15){
		//this.chatEl.nanoScroller({ scroll: 'bottom' });
		//}

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
			tmpstr = message.replace(/(@[A-Za-z0-9_.]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.kickUser(username, $.trim(message.replace("/kick @"+ username, "")));
			return;
		}

		if(message.indexOf("/ban @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9_.]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.banUser(username, parseInt($.trim(message.replace("/ban @"+ username, "")), 10));
			return;
		}

		if(message.indexOf("/unban @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9_.]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.unbanUser(username);
			return;
		}

		if(message.indexOf("/setmod @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9_.]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.setRole(username, 'setModUser');
			return;
		}

		if(message.indexOf("/unsetmod @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9_.]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.unsetRole(username, 'setModUser');
			return;
		}

		if(message.indexOf("/setdj @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9_.]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.setRole(username, 'setDJUser');
			return;
		}

		if(message.indexOf("/unsetdj @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9_.]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.unsetRole(username, 'setDJUser');
			return;
		}

		if(message.indexOf("/setvip @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9_.]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.setRole(username, 'setVIPUser');
			return;
		}

		if(message.indexOf("/unsetvip @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9_.]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.unsetRole(username, 'setVIPUser');
			return;
		}

		if(message.indexOf("/setmanager @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9_.]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.setRole(username, 'setManagerUser');
			return;
		}

		if(message.indexOf("/unsetmanager @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9_.]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.unsetRole(username, 'setManagerUser');
			return;
		}

		if(message.indexOf("/setowner @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9_.]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.setRole(username, 'setOwnerUser');
			return;
		}

		if(message.indexOf("/unsetowner @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9_.]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.unsetRole(username, 'setOwnerUser');
			return;
		}

		if(message.indexOf("/unmute @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9_.]+)/g, function(str){
				username = str.replace("@", "");
				return str;
			});

			this.unmuteUser(username);
			return;
		}

		if(message.indexOf("/mute @") === 0){
			tmpstr = message.replace(/(@[A-Za-z0-9_.]+)/g, function(str){
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
						chatItem.$el.addClass('system-error').html('You reached chat quota limit, please wait 15 mins before retrying');
					}else{
						chatItem.$el.addClass('system-error').html('An error occurred sending chat message');
					}
				}.bind(this)
			});
		}

		//display item instantly
		this.model.add(chatModel);
	},

	deleteChatItem: function(r){
		if(r.chatid && r.user && r.user.username){
			this.$('.chat-main li#' + r.chatid + ' .text').html('<p class="deleted">chat message deleted by @' + r.user.username + '</p>');
		}
	},

	setUserCount: function(users){
		this.$('.room-user-counter').html(users);
		$('.mobile-users-counter').html(users);
	},

	skipSong: function(){
		var chatItem = new Dubtrack.View.chatLoadingItem();
		chatItem.$el.appendTo( this._messagesEl );

		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.skipSong.replace(":id", Dubtrack.room.model.id);

		Dubtrack.helpers.sendRequest(url, {
			realTimeChannel: Dubtrack.room.model.get('realTimeChannel')
		}, "post", function(err, r){
			if(err){
				chatItem.$el.addClass('system-error').html('unauthorized action');
			}else{
				chatItem.$el.hide();
			}
		}, this);
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
			}

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls[role].replace(":roomid", Dubtrack.room.model.id);
			url = url.replace(":id", user.id);

			Dubtrack.helpers.sendRequest(url, {
				realTimeChannel: Dubtrack.room.model.get('realTimeChannel')
			}, "post", function(err, r){
				if(err){
					chatItem.$el.addClass('system-error').html('unauthorized action');
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
					chatItem.$el.addClass('system-error').html('unauthorized action');
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
			}

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.muteUser.replace(":roomid", Dubtrack.room.model.id);
			url = url.replace(":id", user.id);

			Dubtrack.helpers.sendRequest(url, {
				realTimeChannel: Dubtrack.room.model.get('realTimeChannel')
			}, "delete", function(err, r){
				if(err){
					chatItem.$el.addClass('system-error').html('unauthorized action');
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
			}

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.muteUser.replace(":roomid", Dubtrack.room.model.id);
			url = url.replace(":id", user.id);

			Dubtrack.helpers.sendRequest(url, {
				realTimeChannel: Dubtrack.room.model.get('realTimeChannel')
			}, "post", function(err, r){
				if(err){
					chatItem.$el.addClass('system-error').html('unauthorized action');
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
			}

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.banUser.replace(":roomid", Dubtrack.room.model.id);
			url = url.replace(":id", user.id);

			Dubtrack.helpers.sendRequest(url, {
				realTimeChannel: Dubtrack.room.model.get('realTimeChannel')
			}, "delete", function(err, r){
				if(err){
					chatItem.$el.addClass('system-error').html('unauthorized action');
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
			}

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.banUser.replace(":roomid", Dubtrack.room.model.id);
			url = url.replace(":id", user.id);

			if( isNaN(time) ) time = 0;

			Dubtrack.helpers.sendRequest(url, {
				time: time,
				realTimeChannel: Dubtrack.room.model.get('realTimeChannel')
			}, "post", function(err, r){
				if(err){
					chatItem.$el.addClass('system-error').html('unauthorized action');
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
			}

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.kickUser.replace(":roomid", Dubtrack.room.model.id);
			url = url.replace(":id", user.id);

			Dubtrack.helpers.sendRequest(url, {
				message: message,
				realTimeChannel: Dubtrack.room.model.get('realTimeChannel')
			}, "post", function(err, r){
				if(err){
					chatItem.$el.addClass('system-error').html('unauthorized action');
				}else{
					chatItem.$el.hide();
				}
			}, this);
		});
	}
});
