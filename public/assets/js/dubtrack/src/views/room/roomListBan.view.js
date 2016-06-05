Dubtrack.View.ModsView = Backbone.View.extend({
	el : $('#mods-controllers'),

	events : {
		'click .mod-controllers-headers .display-mods-controls' : 'displayControls',
		'click .mod-controllers-headers .display-ban-list' : 'displayBanList',
		'click .mod-controllers-headers .display-mute-list' : 'displayMuteList',
		'click .mod-controllers-headers .display-staff-list' : 'displayStaffList'
	},

	initialize : function(){
		this.roomBanListView = new Dubtrack.View.RoomBanList().render();
		this.roomMuteListView = new Dubtrack.View.RoomMuteList().render();
		this.roomStaffListView = new Dubtrack.View.RoomStaffList().render();

		this.$('.mods-controllers-commands-list .mods-controller-container').perfectScrollbar({
			suppressScrollX: true,
			wheelPropagation: false
		});
	},

	displayBanList : function(){
		this.$('.mod-controllers-headers .active').removeClass('active');
		this.$('.mod-controllers-headers .display-ban-list').addClass('active');

		this.$('.show-controller').removeClass('show-controller');
		this.$('.mods-controllers-ban-list').addClass('show-controller');

		this.roomBanListView.fetchUsers();

		return false;
	},

	displayMuteList : function(){
		this.$('.mod-controllers-headers .active').removeClass('active');
		this.$('.mod-controllers-headers .display-mute-list').addClass('active');

		this.$('.show-controller').removeClass('show-controller');
		this.$('.mods-controllers-mute-list').addClass('show-controller');

		this.roomMuteListView.fetchUsers();

		return false;
	},

	displayStaffList : function(){
		this.$('.mod-controllers-headers .active').removeClass('active');
		this.$('.mod-controllers-headers .display-staff-controls').addClass('active');

		this.$('.show-controller').removeClass('show-controller');
		this.$('.mods-controllers-staff-list').addClass('show-controller');

		this.roomStaffListView.fetchUsers();
		this.roomStaffListView.setClasses();

		return false;
	},

	displayControls : function(){
		this.$('.mod-controllers-headers .active').removeClass('active');
		this.$('.mod-controllers-headers .display-mods-controls').addClass('active');

		this.$('.show-controller').removeClass('show-controller');
		this.$('.mods-controllers-commands-list').addClass('show-controller');

		return false;
	}
});

Dubtrack.View.RoomBanList = Backbone.View.extend({
	el : $('#mods-controllers .mods-controllers-ban-list'),

	initialize : function(){
		this.collection = new Dubtrack.Collection.RoomUser();

		this.collection.bind("add", this.addUser, this);
		this.collection.bind("remove", this.removeEl, this);
		this.collection.bind("reset", this.resetItems, this);

		this.userlistEl = this.$('.user-list');

		this.$('.mods-controller-container').perfectScrollbar({
			suppressScrollX: true,
			wheelPropagation: false
		});
	},

	render : function(){
		this.collection.url = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomBanUsers.replace(":id", Dubtrack.room.model.id);
		this.viewItems = Dubtrack.View.roomBanUsersItem;

		return this;
	},

	addUser: function(itemModel){
		//this.resetEl();
		this.appendEl(itemModel);
	},

	resetItems : function(model){
		this.$('li').remove();
	},

	appendEl : function(itemModel){
		//append element
		itemModel.viewEl = new this.viewItems({
			model: itemModel
		}).render();

		if(itemModel.viewEl) this.userlistEl.append(itemModel.viewEl.$el);
		this.$('.mods-controller-container').perfectScrollbar('update');
	},

	removeEl : function(item){
		item.viewEl.close();

		this.$('.mods-controller-container').perfectScrollbar('update');
	},

	fetchUsers : function(){
		this.$('.user-list li').show();
		$('#mods-controllers .loading').show();

		this.collection.reset();
		this.collection.fetch({
			update: true,

			success : function(){
				$('#mods-controllers .loading').hide();
			},

			error : function(){
				$('#mods-controllers .loading').hide();
			}
		});
	}
});

Dubtrack.View.RoomMuteList = Dubtrack.View.RoomBanList.extend({
	el : $('#mods-controllers .mods-controllers-mute-list'),

	render : function(){
		this.collection.url = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomMuteUsers.replace(":id", Dubtrack.room.model.id);
		this.viewItems = Dubtrack.View.roomMuteUsersItem;

		return this;
	}
});

Dubtrack.View.RoomStaffList = Dubtrack.View.RoomBanList.extend({
	el : $('#mods-controllers .mods-controllers-staff-list'),

	render : function(){
		this.collection.url = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomStaffUsers.replace(":id", Dubtrack.room.model.id);
		this.viewItems = Dubtrack.View.roomStaffUsersItem;

		return this;
	},

	setClasses : function(){
		this.$el.removeClass('co-owner vip resident-dj dj manager mod creator');
		this.$el.addClass(Dubtrack.room.users.getRoleType(Dubtrack.session.id));

		if(Dubtrack.room.model.get("userid") == Dubtrack.session.id || Dubtrack.helpers.isDubtrackAdmin(Dubtrack.session.id)) this.$el.addClass('creator');
	}
});

Dubtrack.View.roomBanUsersItem = Backbone.View.extend({
	tagName: 'li',

	events : {
		"click .actions" : "clickAction"
	},

	render : function(){
		this.$el.html( _.template( Dubtrack.els.templates.rooms.roomBanListItem, this.model.toJSON()));

		return this;
	},

	clickAction : function(){
		var user = this.model.get('_user');

		Dubtrack.room.chat.unbanUser(user.username);

		this.$el.hide();

		return false;
	}
});

Dubtrack.View.roomMuteUsersItem = Dubtrack.View.roomBanUsersItem.extend({
	render : function(){
		this.$el.html( _.template( Dubtrack.els.templates.rooms.roomMuteListItem, this.model.toJSON()));

		return this;
	},

	clickAction : function(){
		var user = this.model.get('_user');

		Dubtrack.room.chat.unmuteUser(user.username);

		this.$el.hide();

		return false;
	}
});

Dubtrack.View.roomStaffUsersItem = Dubtrack.View.roomBanUsersItem.extend({
	render : function(){
		var role = this.model.get('roleid'),
		user = this.model.get('_user');

		if(Dubtrack.session.id == user._id) {
			this.close();
			return null;
		}

		this.$el.html( _.template( Dubtrack.els.templates.rooms.roomStaffListItem, this.model.toJSON()));
		this.$el.addClass(role.type);

		return this;
	},

	clickAction : function(){
		var roleAction = 'setModUser',
		role = this.model.get('roleid');

		switch (role.type) {
			case 'co-owner':
				roleAction = 'setOwnerUser';
				break;

			case 'vip':
				roleAction = 'setVIPUser';
				break;

			case 'resident-dj':
				roleAction = 'setDJUser';
				break;

			case 'dj':
				roleAction = 'setRoomDJUser';
				break;

			case 'manager':
				roleAction = 'setManagerUser';
				break;
		}

		var user = this.model.get('_user');

		Dubtrack.room.chat.unsetRole(user.username, roleAction);

		this.$el.hide();

		return false;
	}
});
