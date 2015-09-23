dt.global.userPopover = Backbone.View.extend({
	tagName: 'div',

	id: 'user_popover',

	events: {
		'click a.kick' : 'kickuser',
		'click a.ban' : 'banuser',
		'click a.mute' : 'muteuser',
		'click a.unmute' : 'unmuteuser',
		'click .usercontent': 'navigateUser',
		'click a.unsetmod' : 'unsetmod',
		'click a.setmod' : 'setmod',
		'click a.send-pm-message' : 'sendPersonalMessage'
	},

	initialize: function(){
		this.$el.html('<div class="usercontent"></div><div class="actions"><a href="#" class="kick">Kick</a><a href="#" class="ban">Ban</a><a href="#" class="mute">Mute</a><a href="#" class="unmute">Unmute</a><a href="#" class="setmod">Set mod</a><a href="#" class="unsetmod">Unset mod</a><a href="#" class="send-pm-message"><span class="icon-chat" title="Send private message"></span></a></div>');
	},

	displayUser: function(id){
		Dubtrack.cache.users.get(id, this.renderUser, this);
		this.userActive = false;

		var self = this;
		$('body').bind('click.userPopover', function(){
			if(self.userActive){
				self.userActive = false;
				Dubtrack.views.user_popover.$el.hide();
				$('body').unbind('click.userPopover');
			}
		});

		if(Dubtrack.session && Dubtrack.room && Dubtrack.room.users && Dubtrack.session.get('_id') != id && (Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id) || Dubtrack.room.model.get('userid') == Dubtrack.session.id || Dubtrack.room.users.getIfMod(Dubtrack.session.id) )) {
			this.$('.actions').show();
			this.$('.actions a.send-pm-message').show();

			if(Dubtrack.room.users.getIfmuted(id)){
				this.$('.actions a.mute').hide();
				this.$('.actions a.unmute').show();
			}else{
				this.$('.actions a.mute').show();
				this.$('.actions a.unmute').hide();
			}

			if(Dubtrack.room.users.getIfMod(id)){
				this.$('.actions a.setmod').hide();
				this.$('.actions a.unsetmod').show();
			}else{
				this.$('.actions a.unsetmod').hide();
				this.$('.actions a.setmod').show();
			}

		}else{
			this.$('.actions').hide();
		}

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

	kickuser: function(){
		this.userActive = false;
		this.$el.hide();
		Dubtrack.room.chat.kickUser(this.user.get('username'));
		return false;
	},

	banuser: function(){
		this.userActive = false;
		this.$el.hide();
		Dubtrack.room.chat.banUser(this.user.get('username'), 0);
		return false;
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

	unsetmod: function(){
		this.userActive = false;
		this.$el.hide();
		Dubtrack.room.chat.unsetMod(this.user.get('username'));
		return false;
	},

	setmod: function(){
		this.userActive = false;
		this.$el.hide();
		Dubtrack.room.chat.setMod(this.user.get('username'));
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