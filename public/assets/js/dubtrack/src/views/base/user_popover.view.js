dt.global.userPopover = Backbone.View.extend({
	tagName: 'div',

	id: 'user_popover',

	events: {
		'click a.kick' : 'kickuser',
		'click a.ban' : 'banuser',
		'keydown a.ban input': 'banuserKeydown',
		'click a.mute' : 'muteuser',
		'click a.unmute' : 'unmuteuser',
		'click .usercontent': 'navigateUser',
		'click a.unsetrole' : 'unsetRole',
		'click a.setrole' : 'setRole',
		'click a.chat-mention' : 'mentionUserInChat',
		'click a.send-pm-message' : 'sendPersonalMessage'
	},

	initialize: function(){
		this.offset_top = 0;
		this.$el.html(Dubtrack.els.templates.profile.popover);
	},

	displayUser: function(id){
		Dubtrack.cache.users.get(id, this.renderUser, this);
		this.userActive = false;

		if(Dubtrack.session && Dubtrack.room && Dubtrack.room.users){
			if(Dubtrack.session.get('_id') == id){
				this.$('.global-actions').hide();
				this.$('.actions').hide();
			}else{
				this.$('.global-actions').show();
				this.$('.actions a').hide();

				if(Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || Dubtrack.room.users.getIfHasRole(Dubtrack.session.id) || Dubtrack.room.model.get('userid') == Dubtrack.session.id) {
					 this.$('.actions').show();
					 this.$('.actions a.send-pm-message').show();

					if(Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || Dubtrack.room.users.getIfOwner(Dubtrack.session.id) || Dubtrack.room.users.getIfMod(Dubtrack.session.id) || Dubtrack.room.users.getIfVIP(Dubtrack.session.id) || Dubtrack.room.users.getIfResidentDJ(Dubtrack.session.id) || Dubtrack.room.users.getIfManager(Dubtrack.session.id)){
					}

					if(Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || Dubtrack.room.users.getIfOwner(Dubtrack.session.id) || Dubtrack.room.users.getIfMod(Dubtrack.session.id) || Dubtrack.room.users.getIfVIP(Dubtrack.session.id) || Dubtrack.room.users.getIfManager(Dubtrack.session.id)){
					}

					if(Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || Dubtrack.room.users.getIfOwner(Dubtrack.session.id) || Dubtrack.room.users.getIfMod(Dubtrack.session.id) || Dubtrack.room.users.getIfManager(Dubtrack.session.id)){
						if(Dubtrack.room.users.getIfmuted(id)){
							this.$('.actions a.mute').hide();
							this.$('.actions a.unmute').show();
						}else{
							this.$('.actions a.mute').show();
							this.$('.actions a.unmute').hide();
						}

						this.$('.actions a.kick').show();
						this.$('.actions a.ban').show();
					}

					if(Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || Dubtrack.room.users.getIfOwner(Dubtrack.session.id) || Dubtrack.room.users.getIfManager(Dubtrack.session.id)){
						if(Dubtrack.room.users.getIfMod(id)){
							this.$('.actions a.setmod').hide();
							this.$('.actions a.unsetmod').show();
						}else{
							this.$('.actions a.unsetmod').hide();
							this.$('.actions a.setmod').show();
						}

						if(Dubtrack.room.users.getIfVIP(id)){
							this.$('.actions a.setvip').hide();
							this.$('.actions a.unsetvip').show();
						}else{
							this.$('.actions a.setvip').show();
							this.$('.actions a.unsetvip').hide();
						}

						if(Dubtrack.room.users.getIfResidentDJ(id)){
							this.$('.actions a.setdj').hide();
							this.$('.actions a.unsetdj').show();
						}else{
							this.$('.actions a.setdj').show();
							this.$('.actions a.unsetdj').hide();
						}
					}

					if(Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || Dubtrack.room.users.getIfOwner(Dubtrack.session.id)){
						if(Dubtrack.room.users.getIfManager(id)){
							this.$('.actions a.setmanager').hide();
							this.$('.actions a.unsetmanager').show();
						}else{
							this.$('.actions a.setmanager').show();
							this.$('.actions a.unsetmanager').hide();
						}
					}

					// Only for room owners
					if(Dubtrack.room.model.get('userid') == Dubtrack.session.id){
						if(Dubtrack.room.users.getIfOwner(id)){
							this.$('.actions a.setowner').hide();
							this.$('.actions a.unsetowner').show();
						}else{
							this.$('.actions a.setowner').show();
							this.$('.actions a.unsetowner').hide();
						}
					}
				}
			}
		}else{
			this.$('.actions').hide();
			this.$('.global-actions').hide();
		}

		if(Dubtrack.helpers.isDubtrackAdmin(id) || Dubtrack.room.model.get('userid') == id){
			this.$('.actions').hide();
		}

		if(Dubtrack.helpers.isDubtrackAdmin(id) || Dubtrack.room.users.getIfHasRole(id)){
			this.$('.actions a.mute').hide();
			this.$('.actions a.kick').hide();
			this.$('.actions a.ban').hide();
		}

		var self = this;
		$('body').bind('click.userPopover', function(e){
			if(self.userActive){
				if(e && e.target && $(e.target).parents('a.ban').length === 0){
					self.userActive = false;
					Dubtrack.views.user_popover.$el.hide();
					$('body').unbind('click.userPopover');
				}
			}
		});

		if(this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(function(){
			self.userActive = true;
		}, 500);
	},

	renderUser: function(err, user){
		this.user = user;
		this.$('.usercontent').html( _.template(Dubtrack.els.templates.profile.popover_user, user.toJSON()) );
	},

	sendPersonalMessage : function(){
		$('html').addClass('menu-right-in');
		var user_arr = [];
		user_arr.push(this.user.get('_id'));

		Dubtrack.layout.menu_right.message_view.createMessageIds(user_arr);
		Dubtrack.views.user_popover.$el.hide();

		return false;
	},

	mentionUserInChat : function(){
		var chat_val = Dubtrack.room.chat._messageInputEl.val();
		if(chat_val.length > 0){
			Dubtrack.room.chat._messageInputEl.val( Dubtrack.room.chat._messageInputEl.val() +  "@" + this.user.get('username') + " ");
		}else{
			Dubtrack.room.chat._messageInputEl.val("@" + this.user.get('username') + " ");
		}
		Dubtrack.room.chat._messageInputEl.focus();
		Dubtrack.views.user_popover.$el.hide();
		Dubtrack.room.$el.removeClass('display-users-rooms');

		return false;
	},

	kickuser: function(){
		this.userActive = false;
		this.$el.hide();
		Dubtrack.room.chat.kickUser(this.user.get('username'));
		return false;
	},

	banuser: function(e){
		if(e && e.target){
			if(!$(e.target).is('input')){
				var value_input = this.$('a.ban input').val();
				if(value_input.length > 0){
					Dubtrack.room.chat.banUser(this.user.get('username'), parseInt(value_input, 10));
				}else{
					Dubtrack.room.chat.banUser(this.user.get('username'), 0);
				}

				Dubtrack.views.user_popover.$el.hide();
			}
		}

		return false;
	},

	banuserKeydown: function(e){
		c = e.which ? e.which : e.keyCode;
		if (c == 13){
			var value_input = this.$('a.ban input').val();
			if(value_input.length > 0){
				Dubtrack.room.chat.banUser(this.user.get('username'), parseInt(value_input, 10));
			}else{
				Dubtrack.room.chat.banUser(this.user.get('username'), 0);
			}

			Dubtrack.views.user_popover.$el.hide();
			return false;
		}
	},

	muteuser: function(){
		this.userActive = false;
		this.$el.hide();
		Dubtrack.room.chat.muteUser(this.user.get('username'));
		return false;
	},

	unmuteuser: function(){
		this.userActive = false;
		this.$el.hide();
		Dubtrack.room.chat.unmuteUser(this.user.get('username'));
		return false;
	},

	setRole: function(e){
		if(!e || !e.target) return;
		var role = $(e.target).attr('data-roleref');

		if(role){
			this.userActive = false;
			this.$el.hide();
			Dubtrack.room.chat.setRole(this.user.get('username'), role);
		}

		return false;
	},

	unsetRole: function(e){
		if(!e || !e.target) return;
		var role = $(e.target).attr('data-roleref');

		if(role){
			this.userActive = false;
			this.$el.hide();
			Dubtrack.room.chat.unsetRole(this.user.get('username'), role);
		}

		return false;
	},

	navigateUser: function(){
		this.userActive = false;
		this.$el.hide();
		Dubtrack.app.navigate('/' + this.user.get('username'), {
			'trigger': true
		});

		return false;
	}
});
