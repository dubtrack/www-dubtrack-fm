Dubtrack.View.ModsView = Backbone.View.extend({
	el : $('#mods-controllers'),

	events : {
		'click .mod-controllers-headers .display-mods-controls' : 'displayControls',
		'click .mod-controllers-headers .display-ban-list' : 'displayBanList',
		'click .mod-controllers-headers .display-mute-list' : 'displayMuteList'
	},

	initialize : function(){
		this.roomBanListView = new Dubtrack.View.RoomBanList().render();
		this.roomMuteListView = new Dubtrack.View.RoomMuteList().render();

		this.$('.mods-controllers-commands-list .mods-controller-container').perfectScrollbar({
			wheelSpeed: 30,
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

		this.userlistEl = this.$('.user-list');

		this.$('.mods-controller-container').perfectScrollbar({
			wheelSpeed: 30,
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

	appendEl : function(itemModel){
		//append element
		itemModel.viewEl = new this.viewItems({
			model: itemModel
		}).render();

		this.userlistEl.append(itemModel.viewEl.$el);
		this.$('.mods-controller-container').perfectScrollbar('update');
	},

	removeEl : function(item){
		item.viewEl.close();

		this.$('.mods-controller-container').perfectScrollbar('update');
	},

	fetchUsers : function(){
		this.$('.user-list li').show();

		this.collection.fetch({
			update: true
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
