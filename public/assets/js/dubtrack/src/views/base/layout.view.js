Dubtrack.View.LayoutView = Backbone.View.extend({
	el : $('#header-global'),

	events : {
		"click .user-info-button": "navigateUser",
		"click a.navigate" : "navigate",
		"click li.logout": "logout",
		"click #edit-room-div" : "editRoom",
		"click #create-room-div": "createRoom",
		"click .menu-expand" : "setActiveMenu",
		"click li.user-messages" : "setActiveMenuRight",
		//"mouseenter .menu-expand" : "setActiveMenu",
		//"mouseleave .menu-expand" : "removeActiveMenu",
		"touch" : "removeActiveMenu",
		"click" : "removeActiveMenu",
		"click #header_login #login-link" : "displayLogin",
		"click #header_login #signup-link" : "displaySignup"
	},

	displayLogin : function(e){
		e.preventDefault();

		Dubtrack.app.navigate('/login', {
			trigger: true
		});
	},

	displaySignup : function(e){
		e.preventDefault();

		Dubtrack.app.navigate('/signup', {
			trigger: true
		});
	},

	initialize : function(){
		this.$el.append( _.template(Dubtrack.els.templates.layout.header, Dubtrack.session.toJSON()) );

		this.searchView = new Dubtrack.View.SearchView({
			el: this.$('li.global-search-header')
		});

		if(!Dubtrack.loggedIn){
			this.$('#header_login').show();
		}else{
			this.$('#mobile-login').hide();
			Dubtrack.Events.bind('realtime:user-update-' + Dubtrack.session.id, this.updateImage, this);
		}

		this.menu_left = new Dubtrack.View.MainLeftMenuView();
		this.menu_right = new Dubtrack.View.MainRightMenuView();

		var self = this;
		$('body').bind('click', function(e){
			if($(e.target).parents("#main-menu-left").length === 0){
				$("html").removeClass("menu-left-in");
			}

			if($(e.target).parents("#main-menu-right").length === 0){
				$("html").removeClass("menu-right-in");
				Dubtrack.layout.menu_right.message_view.$el.removeClass('view-message-details');
			}
		});

		emojify.setConfig({
			img_dir : Dubtrack.config.urls.mediaBaseUrl + '/assets/emoji/images/emoji'
		});

		this.main_login_window = new Dubtrack.View.LoginMainWindowView();

		this.getNewMessages();
	},

	getNewMessages : function(){
		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.messages_news,
			self = this;

		if(this.timeout_newmessages) clearTimeout(self.timeout_newmessages);

		Dubtrack.helpers.sendRequest( url, {}, 'get', function(err, r){
			if(r && r.data){
				var new_messages_counter = parseInt(r.data, 10);

				if(new_messages_counter > 0){
					self.$('.user-messages .message-counter').html(new_messages_counter).show();
				}else{
					self.$('.user-messages .message-counter').hide();
				}
			}else{
				self.$('.user-messages .message-counter').hide();
			}

			self.timeout_newmessages = setTimeout(function(){
				self.getNewMessages();
			}, 30000);
		});
	},

	setActiveMenuRight : function(){
		$("html").toggleClass("menu-right-in");

		if($("html").hasClass('menu-right-in')){
			this.menu_right.loadMessages();
		}else{
			Dubtrack.layout.menu_right.message_view.$el.removeClass('view-message-details');
		}

		return false;
	},

	setActiveMenu : function(){
		$("html").toggleClass("menu-left-in");

		return false;
	},

	removeActiveMenu : function(e){
		if($(e.target).parents('.menu-expand').length) return;

		this.$('.menu-expand').removeClass('active');
	},

	updateImage: function(r){
		if(r && r.img && r.img.url){
			this.$('figure.user-image img').attr('src', r.img.url);
		}
	},

	createRoom: function(){
		var model = new Dubtrack.Model.Room();

		model.parse = Dubtrack.helpers.parse;

		this.roomUpdate = new dt.room.roomFormUpdateViewUpdate({model : model}).render();
		$( this.roomUpdate.el ).appendTo( 'body' );
		//this.roomUpdate.runPlugins();

		return false;
	},

	editRoom: function(){
		if(Dubtrack.room && Dubtrack.room.model && Dubtrack.session && Dubtrack.session.get("_id") === Dubtrack.room.model.get('userid')){
			this.roomUpdate = new dt.room.roomFormUpdateViewUpdate({
				model : Dubtrack.room.model
			}).render();

			$( this.roomUpdate.el ).appendTo( 'body' );
		}

		return false;
	},

	logout: function(){
		window.location = "/login/logout";
	},

	render : function(){
	},

	navigate : function(el){
		this.$('.menu-expand').removeClass('active');
		$href = $(el.target).attr("href");
		if($href){
			Dubtrack.app.navigate($href, {
				trigger: true
			});
		}

		return false;
	},

	navigateUser: function(){
		Dubtrack.app.navigate("/" + Dubtrack.session.get('username'), {
			trigger: true
		});

		return false;
	}
});

Dubtrack.View.SearchView = Backbone.View.extend({
	events : {
		"keyup input#global-search": "renderSearchResults"
	},

	initialize: function(){
		this.model = new Dubtrack.Model.Search();

		this.model.bind('change', this.render, this);
		this.model.bind('reset', this.render, this);

		this.search_results = this.$('.search-results');
		this.search_results_rooms = this.$('.search-results-rooms');
		this.search_results_users = this.$('.search-results-users');

		var self = this;
		$(window).on('click', function(e){
			var parents = $(e.target).parents('.global-search-header');

			if(parents.length === 0){
				self.search_results.hide();
				self.$('input#global-search').val('');
			}
		});
	},

	render: function(){
		this.search_results_rooms.empty();
		this.search_results_users.empty();

		var rooms = this.model.get("rooms"),
			users = this.model.get("users"),
			self = this;

		if(rooms && rooms.length > 0){
			_.each(rooms, function(room){
				self.appendRoomItem(room);
			});
		}else{
			this.search_results_rooms.append('<div class="result-item"><span class="count">No results found</span></div>');
		}

		if(users && users.length > 0){
			_.each(users, function(user){
				self.appendUserItem(user);
			});
		}else{
			this.search_results_users.append('<div class="result-item"><span class="count">No results found</span></div>');
		}
	},

	appendRoomItem: function(room){
		this.search_results_rooms.append( new Dubtrack.View.SearchRoomItem().render(room).$el );
	},

	appendUserItem: function(user){
		this.search_results_users.append( new Dubtrack.View.SearchUserItem().render(user).$el );
	},

	renderSearchResults: function(){
		var query = $.trim(this.$('input#global-search').val());
		if(query === "" || query === null){
			this.search_results.hide();
			return;
		}

		this.search_results.show();

		var self = this;
		this.model.fetch({
			data: {
				query: query
			}
		});
	}
});

Dubtrack.View.SearchRoomItem = Backbone.View.extend({
	attributes: {
		'class': 'result-item'
	},

	events: {
		"click": "clickAction"
	},

	initialize: function(){
	},

	render: function(room){
		this.room = room;
		if(!room.activeUsers) room.activeUsers = 0;
		this.$el.html( _.template( Dubtrack.els.templates.search.searchRoom, room ));

		return this;
	},

	clickAction: function(){
		window.location = "/join/" + this.room.roomUrl;

		Dubtrack.layout.searchView.$('input#global-search').val('');
		Dubtrack.layout.searchView.search_results.hide();

		return false;
	}
});

Dubtrack.View.SearchUserItem = Backbone.View.extend({
	attributes: {
		'class': 'result-item'
	},

	events: {
		"click": "clickAction"
	},

	initialize: function(){
	},

	render: function(user){
		this.user = user;
		this.$el.html( _.template( Dubtrack.els.templates.search.searchUser, user ));

		return this;
	},

	clickAction: function(){
		Dubtrack.app.navigate("/" + this.user.username, {
			trigger: true
		});

		Dubtrack.layout.searchView.$('input#global-search').val('');
		Dubtrack.layout.searchView.search_results.hide();

		return false;
	}
});

Dubtrack.View.MainLeftMenuView = Backbone.View.extend({
	el : $("#main-menu-left"),

	events: {
		"click a.navigate": "navigate",
		"click a.close-menu" : "closeMenu"
	},

	initialize : function(){
		if(Dubtrack.loggedIn) this.$('a.logout-link').css("display", "block");
	},

	closeMenu : function(){
		$("html").removeClass("menu-left-in");

		return false;
	},

	navigate : function(el){
		var $href = $(el.target).attr("href");

		if($href){
			$("html").removeClass("menu-left-in");

			Dubtrack.app.navigate($href, {
				trigger: true
			});
		}

		return false;
	}
});

Dubtrack.View.MainRightMenuView = Backbone.View.extend({
	el : $("#main-menu-right"),

	events: {
		"click a.close-menu" : "closeMenu"
	},

	initialize : function(){
		this.message_view = new Dubtrack.View.Message.Main();
	},

	loadMessages : function(){
		this.message_view.loadMessages();
	},

	closeMenu : function(){
		$("html").removeClass("menu-right-in");

		return false;
	},
});
