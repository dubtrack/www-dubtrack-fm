Dubtrack.View.Message = {};

Dubtrack.View.Message.SearchUserItem = Dubtrack.View.SearchUserItem.extend({
	events : {
		'click' : 'selectItem'
	},

	render: function(user, parent){
		this.user = user;
		this.parentView = parent;

		this.$el.attr("data-userid", user._id);
		this.$el.html( _.template( Dubtrack.els.templates.search.searchUser, user ));

		return this;
	},

	selectItem : function(){
		if(this.parentView){
			this.parentView.selectItem(this.user);
		}
	}
});

Dubtrack.View.Message.Main = Backbone.View.extend({
	el : $("#private-messages"),

	events : {
		"click .main-message-list .message-list .message-item" : "loadMessagesDetails",
		"click .message-details .message-header" : "loadMessages",
		"click .main-message-list .user_selected_items .result-item" : "removeItem",
		"keyup input#new-message-input": "renderSearchResults",
		"click #create-new-message" : "createMessage"
	},

	initialize : function(){
		this.message_main_list = new Dubtrack.View.Message.MainList();
		this.message_main_list_details = new Dubtrack.View.Message.MainListDetails();

		this.model = new Dubtrack.Model.Search();
		this.collectionItems = new Backbone.Collection();
		this.listenTo(this.collectionItems, 'add', this.addUserToCreateMessage);

		this.model.bind('change', this.render, this);
		this.model.bind('reset', this.render, this);

		this.search_results = this.$('.search-results');
		this.search_results_users = this.$('.search-results-users');

		var self = this;
		$(window).on('click', function(e){
			var parents = $(e.target).parents('.message-header');

			if(parents.length === 0){
				self.search_results.hide();
				self.$('input#new-message-input').val('');
			}
		});
	},

	addUserToCreateMessage : function(model){
		var json_model = model.toJSON();

		json_model.username +=  " <b>remove</b>";
		this.$('.user_selected_items').append( new Dubtrack.View.Message.SearchUserItem().render(json_model, this).$el );
	},

	removeItem : function(e){
		var $target = $(e.target);

		if(! $target.is('.result-item') ) $target = $target.parents('.result-item');

		var id = $target.attr('data-userid');

		if(id){
			this.collectionItems.remove(id);

			this.$('.user_selected_items').empty();
			_.each(this.collectionItems.models, function(model){
				this.addUserToCreateMessage(model);
			}, this);
		}

		return false;
	},

	loadMessages : function(){
		this.collectionItems.reset();

		this.$el.removeClass('view-message-details');
		this.message_main_list.loadMessages();

		return false;
	},

	loadMessagesDetails : function(e){
		var $el = $(e.target);

		if(!$el.is('li.message-item')) $el = $el.parents('li.message-item');

		var id = $el.attr('data-messageid');

		if(id){
			this.$el.addClass('view-message-details');
			this.message_main_list_details.loadMessages(id);
		}

		return false;
	},

	render: function(){
		this.search_results_users.empty();

		var users = this.model.get("users"),
			self = this;

		if(users && users.length > 0){
			_.each(users, function(user){
				if(user._id != Dubtrack.session.get('_id')) self.appendUserItem(user);
			});
		}else{
			this.search_results_users.append('<div class="result-item"><span class="count">No results found</span></div>');
		}
	},

	appendUserItem: function(user){
		this.search_results_users.append( new Dubtrack.View.Message.SearchUserItem().render(user, this).$el );
	},

	renderSearchResults: function(e){
		c = e.which ? e.which : e.keyCode;
		if (c == 13){
			this.createMessage();
			return false;
		}

		if (c == 9){
			return false;
		}

		var query = $.trim(this.$('input#new-message-input').val());
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
	},

	selectItem : function(model){
		if(this.collectionItems.length > 10) return false;

		this.search_results.hide();
		this.$('input#new-message-input').val('').focus();

		this.collectionItems.add(model);
	},

	createMessage : function(){
		if(this.collectionItems.length < 1) return false;

		var usersid = [],
			self = this;

		_.each(this.collectionItems.models, function(model){
			usersid.push(model.get('_id'));
		});

		this.createMessageIds(usersid);

		return false;
	},

	createMessageIds : function(usersid){
		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.messages,
			self = this;

		$("#private-messages .loading").show();
		this.$('.user_selected_items').empty();
		this.collectionItems.reset();

		Dubtrack.helpers.sendRequest( url, {
			usersid : usersid
		}, 'post', function(err, response){
			$("#private-messages .loading").hide();

			if(response && response.data && response.data._id){
				self.$el.addClass('view-message-details');
				self.message_main_list_details.loadMessages(response.data._id);
			}
		});

		return false;
	}
});

Dubtrack.View.Message.MainList = Backbone.View.extend({
	el : $("#private-messages .main-message-list"),

	events : {
	},

	initialize : function(){
		this.collection = new Dubtrack.Collection.Message();

		this.listenTo(this.collection, 'add', this.addMessage);
		//this.listenTo(this.collection, 'remove', this.removeMessage);
		this.listenTo(this.collection, 'reset', this.resetMessages);

		this.items_container = this.$('.message-list');

		//load perfect scrollbar
		this.loadPerfectScrollbar();
	},

	loadMessages : function(){
		this.$('.private-message-info').hide();
		$("#private-messages .loading").show();

		//load perfect scrollbar
		this.loadPerfectScrollbar();

		this.main_items_loaded_check = false;

		var self = this;

		this.collection.reset();
		this.items_container.empty();
		this.collection.fetch({
			update: true,
			success: function(){
				$("#private-messages .loading").hide();
				self.main_items_loaded_check = true;

				if(self.collection.length === 0){
					self.$('.private-message-info').show();
				}
			}
		});
	},

	loadPerfectScrollbar : function(){
		if(this.perfectscrollbar_loaded){
			this.$('.message-list-wrapper-inner').perfectScrollbar('destroy');
		}

		this.perfectscrollbar_loaded = true;

		this.$('.message-list-wrapper-inner').scrollTop(0);

		this.$('.message-list-wrapper-inner').perfectScrollbar({
			wheelSpeed: 50,
			suppressScrollX: true,
			wheelPropagation: false
		});
	},

	addMessage : function(model){
		this.$('.private-message-info').hide();

		var view = new Dubtrack.View.Message.MainListItem({
			model : model
		});

		model.set("_view", view);
		if(!this.main_items_loaded_check){
			this.items_container.append(view.$el);
		}else{
			this.items_container.prepend(view.$el);
		}

		this.$('.message-list-wrapper-inner').perfectScrollbar('update');
	},

	removeMessage : function(model){
		if(this.model){
			var view = this.model.get("_view");

			if(view){
				view.remove();
			}
		}
	},

	resetMessages : function(){
		this.items_container.empty();
		this.collection.each(this.addMessage, this);
	}
});

Dubtrack.View.Message.MainListDetails = Dubtrack.View.Message.MainList.extend({
	el : $("#private-messages .message-details"),

	events : {
		"keydown input#message-input": "keyPressAction",
	},

	loadMessages : function(messageid){
		this.messageid = messageid;
		this.main_items_loaded = false;

		this.last_view = false;
		this.last_model = false;

		//load perfect scrollbar
		this.loadPerfectScrollbar();

		this.$('input#message-input').focus();

		$("#private-messages .loading").show();

		this.$('.private-message-details-info').hide();

		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.messages_items.replace(":id", this.messageid);
		this.collection.url = url;

		var self = this;
		this.collection.reset();

		this.collection.fetch({
			success: function(){
				$("#private-messages .loading").hide();

				self.main_items_loaded = true;
				self.setMessageAsRead();

				if(self.collection.length === 0){
					self.$('.private-message-details-info').show();
				}
			}
		});

		Dubtrack.Events.bind('realtime:new-message', this.newMessage, this);
	},

	setMessageAsRead : function(){
		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.messages_read.replace(":id", this.messageid);

		Dubtrack.helpers.sendRequest( url, {}, 'post', function(err, r){
			Dubtrack.layout.getNewMessages();
		});
	},

	addMessage : function(model){
		this.$('.private-message-details-info').hide();
		/*if(this.last_model && this.last_view && this.last_model.get('userid') == model.get('userid')){

			if(this.main_items_loaded){
				this.last_view.appendText(model.get('created'), model.get('message'), false);
			}else{
				this.last_view.appendText(model.get('created'), model.get('message'), true);
			}
		}else{*/
			var view = new Dubtrack.View.Message.MainListDetailsItem({
				model : model
			});

			model.set("_view", view);

			if(!this.main_items_loaded){
				this.items_container.prepend(view.$el);
			}else{
				this.items_container.append(view.$el);
			}

			this.last_view = view;
			this.last_model = model;
		//}

		this.scollBottom();
	},

	newMessage : function(r){
		var self = this;

		if(this.messageid && r.userid != Dubtrack.session.get('_id') && r.messageid == this.messageid && $("#private-messages").hasClass('view-message-details')){
			this.collection.fetch({
				remove: false,

				success: function(){
					self.setMessageAsRead();
				}
			});
		}else{
			if(!$("#private-messages").hasClass('view-message-details')){
				Dubtrack.layout.getNewMessages();
			}
		}
	},

	keyPressAction : function(e){
		c = e.which ? e.which : e.keyCode;
		if (c == 13){
			this.sendMessage();
			return false;
		}
	},

	scollBottom: function(){
		this.$('.message-list-wrapper-inner').perfectScrollbar('update');
		var height = this.$('.message-list-wrapper-inner')[0].scrollHeight;
		this.$('.message-list-wrapper-inner').scrollTop(height);
		this.$('.message-list-wrapper-inner').perfectScrollbar('update');
	},

	sendMessage : function(){
		var message = $('<div/>').text($.trim(this.$('input#message-input').val())).html();
		if(message === "" || message === null) return;

		this.$('input#message-input').val('');
		this.main_items_loaded = true;

		var messageModel = new Dubtrack.Model.MessageItem({
			created: Date.now(),
			message: message,
			userid: Dubtrack.session.get('_id'),
			messageid: '',
			_message: {},
			_user: Dubtrack.session.toJSON()
		});

		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.messages_items.replace(":id", this.messageid);
		messageModel.urlRoot = url;

		messageModel.parse = Dubtrack.helpers.parse;
		messageModel.save({
			message : message
		}, {
			success : function(){
				messageModel.set('_user', Dubtrack.session.toJSON());
			}
		});

		this.collection.add(messageModel);
	}
});

Dubtrack.View.Message.MainListItem = Backbone.View.extend({
	tagName : 'li',

	className : 'message-item',

	events : {
	},

	template : Dubtrack.els.templates.messages.message,

	initialize : function(){
		this.listenTo(this.model, 'change', this.render);
		this.render();
	},

	render : function(){
		if(!this.model.get("name")){
			var usersid = this.model.get('usersid'),
				users_arr = [];

			if(usersid){
				_.each(usersid, function(user){
					if(user._id != Dubtrack.session.get('_id')){
						users_arr.push(user.username);
					}
				});

				var name = users_arr.join();
				this.model.set("name", name);
			}
		}

		var userids = this.model.get("usersid"),
			image_str = '',
			model_json = this.model.toJSON();

		if(userids){
			_.each(userids, function(user){
				if(user._id != Dubtrack.session.get('_id')){
					image_str += '<figure class="media">' + Dubtrack.helpers.image.getImage(user._id, user.username) + '</figure>';
				}
			});

			this.$el.addClass('display-' + userids.length + '-users');
		}

		var users_read = this.model.get('users_read'),
			is_new_message = true;

		if(users_read){
			_.each(users_read, function(user){
				if(user == Dubtrack.session.get('_id')){
					is_new_message = false;
					return;
				}
			});

			if(is_new_message) this.$el.addClass('new-message');
			else this.$el.removeClass('new-message');
		}

		model_json.image_str = image_str;

		this.$el.attr("data-messageid", this.model.get("_id"));
		this.$el.html( _.template(this.template,  model_json));

		var currentDate = new Date(this.model.get('latest_message'));
		this.$('.message-time').html('<time class="timeago" datetime="' + currentDate.toISOString() + '">' + currentDate.toLocaleString() + '</time>');

		this.$(".timeago").timeago();
	}
});

Dubtrack.View.Message.MainListDetailsItem = Dubtrack.View.Message.MainListItem.extend({
	template : Dubtrack.els.templates.messages.messageItem,

	initialize : function(){
		//this.listenTo(this.model, 'change', this.render);
		this.render();
	},

	render : function(){
		this.$el.attr("data-messageid", this.model.get("_id"));

		this.model.set( 'message', Dubtrack.helpers.text.convertHtmltoTags( this.model.get('message'), "Dubtrack.layout.menu_right.message_view.message_main_list_details.scollBottom();" ));
		this.model.set( 'message', Dubtrack.helpers.text.convertAttoLink( this.model.get('message') ));

		this.$el.html( _.template(this.template, this.model.toJSON()) );

		var currentDate = new Date(this.model.get('created'));
		this.$('.message-time').html('<time class="timeago" datetime="' + currentDate.toISOString() + '">' + currentDate.toLocaleString() + '</time>');

		this.$(".timeago").timeago();

		emojify.run(this.el);
	},

	appendText : function(created, text, prepend){
		var currentDate = new Date(created);
		this.$('.message-time').html('<time class="timeago" datetime="' + currentDate.toISOString() + '">' + currentDate.toLocaleString() + '</time>');

		this.$(".timeago").timeago();

		if(prepend) this.$('.message-content p').prepend(text + '<br>');
		else this.$('.message-content p').append('<br>' + text);
	}
});
