var user_rejoin_count = 0;

Dubtrack.View.roomUsers = Backbone.View.extend({

	el: $('#avatar'),

	allowed_dj: 0,

	intervalId: false,

	roomId: false,

	events  : {
		"click a.loadRoomAva": "loadRoomAva",
		"click a.modLink": "loadModsAva",
		"keyup .input-room-users-search input": "filterRoomUsers"
	},

	initialize : function(){
		var self = this;
		this.$el.html( _.template( Dubtrack.els.templates.rooms.avatarsContainer, {} ));

		Dubtrack.Events.bind('realtime:user-join', this.userJoin, this);
		Dubtrack.Events.bind('realtime:user-leave', this.userLeave, this);
		Dubtrack.Events.bind('realtime:user-setrole', this.setRole, this);
		Dubtrack.Events.bind('realtime:user-unsetrole', this.unsetRole, this);
		Dubtrack.Events.bind('realtime:room_playlist-dub', this.realTimeDub, this);
		Dubtrack.Events.bind('realtime:user-mute', this.setMuted, this);
		Dubtrack.Events.bind('realtime:user-unmute', this.setunMuted, this);

		var url = Dubtrack.config.urls.roomUsers.replace( "{id}", this.model.id );

		this.collection = new Dubtrack.Collection.RoomUser();
		this.collection.url = Dubtrack.config.apiUrl + url;
		this.collection.comparator = function(user){
			return - ( parseInt( user.get('dubs'), 10 ) );
		};

		//attach events to object
		this.collection.bind("add", this.addUser, this);
		this.collection.bind("remove", this.removeEl, this);
		this.collection.bind("change", this.updateDubs, this);

		this.intervalId = setInterval(function(){
			self.autoLoad();
		}, 720000);

		//this.featureUsersEl = $('#avatar_feature ul.avatar-list');
		//this.totalFeatureUsers = 0;

		this.uuids = [];
		this.rt_users = [];

		this.autoLoad();

		//set list container
		this.avatarContainer = this.$el.find('ul#avatar-list');

		this.currentTabEl = this.$el.find(".currentBar");
		this.avatarFriendsEl = this.$el.find(".friendsElAvatar");
		this.tabsContainerEl = this.$el.find(".tabsContainer");
		this.avatarModsEl = this.$el.find(".modsElAvatar");

		this.loadingEl = this.$el.find(".loadingAva");

		this.$('a.loadRoomAva').html('<span>chat</span><div title="' + this.model.get('name') + '">' + this.model.get('name') + '</div>');

		this.currentTabEl.css("width", "100%");

		$(window).resize(function(){
			self.resize();
		});

		this.resize();

		this.setTotalUsersDebouce = _.debounce(this.setTotalUsers.bind(this), 3000);

		this.$('#main-user-list-room').perfectScrollbar({
			wheelSpeed: 30,
			suppressScrollX: true,
			wheelPropagation: false
		});
	},

	setTotalUsers: function(){
		//this.$('a.loadRoomAva span').html( this.collection.models.length );
		Dubtrack.realtime.channelPresence(function(r){
			if(r && r.uuids) this.uuids = r.uuids;

			this.rt_users = [];
			var found_current_user = false;

			_.each(this.uuids, function(uuid){
				if(uuid.match(/^[0-9a-fA-F]{24}$/)){
					this.rt_users.push(uuid);

					if(Dubtrack.loggedIn && Dubtrack.session && Dubtrack.session.get("_id") == uuid) found_current_user = true;
				}
			}.bind(this));

			if(Dubtrack.loggedIn && Dubtrack.session && !found_current_user) this.rt_users.push(Dubtrack.session.get("_id"));

			if(Dubtrack.room && Dubtrack.room.chat){
				Dubtrack.room.chat.setUserCount(this.rt_users.length);
			}
		});
	},

	filterRoomUsers: function(){
		var query = $.trim(this.$('.input-room-users-search input').val());
		if(query === "" || query === null){
			this.$('#avatar-list li').show();
			return;
		}

		this.avatarContainer.find('li').hide();
		$.each(this.$("#avatar-list li:regex(class, .*user-" +  query.toLowerCase() + ".*)"), function(){
			$(this).show();
		});
	},

	updateDubs : function(item){
		item.viewEl.$('.dubs span').html( item.get("dubs") );
		//this.resetEl();

		//if(item.featureEl) item.featureEl.$('.dubs span').html( item.get("dubs") );
	},

	resetEl : function(){
		this.collection.sort();

		//empty containers
		this.avatarContainer.empty();
		//this.featureUsersEl.empty();

		//this.totalFeatureUsers = 0;

		this.setTotalUsersDebouce.call(this);

		_.each(this.collection.models, function (item) {
			this.appendEl(item);
			//item.featureEl = false;

			/*if(this.totalFeatureUsers < 10){
				this.appendFeatureItem(item);
				this.totalFeatureUsers++;
			}*/
		}, this);

		this.$('#main-user-list-room').perfectScrollbar('update');
	},

	resize: function(){
		var $h = parseInt( $(window).height(), 10 ) - 230;
		this.$('#main-user-list-room').css('height', $h);

		this.$('#main-user-list-room').perfectScrollbar('update');
	},

	userJoin: function(r){
			if(r && r.user){
				var itemModel = new Dubtrack.Model.RoomUser( r.roomUser );

				itemModel.set('user', r.user);
				itemModel.set('_user', r.user);

				this.collection.add( itemModel );
			}
	},

	userLeave: function(r){
		var user = this.collection.where({
			userid: r.user._id
		});

		if(user) this.collection.remove( user );
	},

	addUser: function(itemModel){
		//this.resetEl();
		this.appendEl(itemModel);
	},

	appendEl : function(itemModel){
		//append element
		itemModel.viewEl = new Dubtrack.View.roomUsersItem({
			model: itemModel
		}).render();

		this.avatarContainer.append( itemModel.viewEl.$el );

		this.setTotalUsersDebouce.call(this);

		this.$('#main-user-list-room').perfectScrollbar('update');

		if( Dubtrack.loggedIn && itemModel.get("userid") == Dubtrack.session.id ){
			if(this.timeoutErrorUserLeave) clearTimeout(this.timeoutErrorUserLeave);
		}
	},

	appendFeatureItem: function(itemModel){
		/*itemModel.featureEl = new Dubtrack.View.roomUsersItem({
			model: itemModel
		}).render();

		this.featureUsersEl.append( itemModel.featureEl.$el );*/
	},

	removeEl : function(item){
		item.viewEl.close();
		//if(item.featureEl) item.featureEl.close();

		var join_cookie = Dubtrack.helpers.cookie.get('dubtrack-room-id');

		if( Dubtrack.loggedIn && item.get("userid") == Dubtrack.session.id && (user_rejoin_count > 10 || ( Dubtrack.room && Dubtrack.room.model.get("_id") != join_cookie ) )) {
			this.timeoutErrorUserLeave = setTimeout( function(){
				Dubtrack.helpers.displayError(dubtrack_lang.global.error, "You were removed from this room, simply refresh this page to rejoin :)<br><br>Opening multiple tabs of this site can trigger this error, email us if you have any questions at support@dubtrack.fm", true);
			}, 5000);
		}else{
			user_rejoin_count++;
			if(Dubtrack.room) Dubtrack.room.joinRoom();
		}

		this.setTotalUsersDebouce.call(this);

		this.$('#main-user-list-room').perfectScrollbar('update');
	},

	fetchDubs: function(){
		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.dubsPlaylistActive.replace(":id", this.model.id);

		Dubtrack.helpers.sendRequest(url, {}, "get", function(err, r){
			if(!err){
				_.each(r.data.downDubs, function(dub){
					Dubtrack.room.users.setDubUser(dub.userid, dub.type);
				});

				_.each(r.data.upDubs, function(dub){
					Dubtrack.room.users.setDubUser(dub.userid, dub.type);
				});
			}
		}, this);
	},

	loadRoomAva : function(){
		if(Dubtrack.room && Dubtrack.room.$el){
			Dubtrack.room.$el.removeClass('display-users-rooms');
		}

		//this.resetEl();

		return false;
	},

	realTimeDub: function(r){
		var id = (r.user && "_id" in r.user) ? r.user._id : false;

		if(id){
			this.setDubUser(id, r.dubtype);
		}
	},

	setDubUser: function(userid, type){
		var itemModel = this.collection.findWhere({
			userid: userid
		});

		if(itemModel){
			itemModel.viewEl.$el.removeClass("downdub").removeClass("updub").addClass(type);
		}
	},

	removeCurrentDJ: function(){
		this.$('li.currentDJ').removeClass('currentDJ');
	},

	removeDubs: function(){
		this.$('li.updub').removeClass('updub');
		this.$('li.downdub').removeClass('downdub');
	},

	setCurrentDJ: function(userid){
		var itemModel = this.collection.findWhere({
			userid: userid
		});

		if(itemModel && itemModel.viewEl && itemModel.viewEl.$el){
			itemModel.viewEl.$el.addClass('currentDJ');
		}
	},

	setRole: function(r){
		var id = (r.modUser && "_id" in r.modUser) ? r.modUser._id : false;

		if(id){
			var itemModel = this.collection.findWhere({
				userid: id
			});

			if(itemModel && itemModel.viewEl && itemModel.viewEl.$el){
				itemModel.set('roleid', r.role_object);

				itemModel.viewEl.$el.removeClass('mod co-owner manager vip resident-dj');
				itemModel.viewEl.$el.addClass(r.role_object.type);
			}
		}
	},

	unsetRole: function(r){
		var id = (r.modUser && "_id" in r.modUser) ? r.modUser._id : false;

		if(id){
			var itemModel = this.collection.findWhere({
				userid: id
			});

			if(itemModel && itemModel.viewEl && itemModel.viewEl.$el){
				itemModel.set('roleid', null);

				itemModel.viewEl.$el.removeClass('mod co-owner manager vip resident-dj');
			}
		}
	},

	setMuted: function(r){
		var id = (r.mutedUser && "_id" in r.mutedUser) ? r.mutedUser._id : false;

		if(id){
			var itemModel = this.collection.findWhere({
				userid: id
			});

			if(itemModel && itemModel.viewEl && itemModel.viewEl.$el){
				itemModel.set('muted', true);
			}
		}
	},

	setunMuted: function(r){
		var id = (r.mutedUser && "_id" in r.mutedUser) ? r.mutedUser._id : false;

		if(id){
			var itemModel = this.collection.findWhere({
				userid: id
			});

			if(itemModel && itemModel.viewEl && itemModel.viewEl.$el){
				itemModel.set('muted', false);
			}
		}
	},

	getIfMod: function(userid){
		var itemModel = this.collection.findWhere({
			userid: userid
		});

		if(itemModel){
			var roleid = itemModel.get('roleid');
			if(roleid && roleid._id == "52d1ce33c38a06510c000001") return true;
		}

		return false;
	},

	getIfResidentDJ: function(userid){
		var itemModel = this.collection.findWhere({
			userid: userid
		});

		if(itemModel){
			var roleid = itemModel.get('roleid');
			if(roleid && roleid._id == "5615feb8e596154fc2000002") return true;
		}

		return false;
	},

	getIfVIP: function(userid){
		var itemModel = this.collection.findWhere({
			userid: userid
		});

		if(itemModel){
			var roleid = itemModel.get('roleid');
			if(roleid && roleid._id == "5615fe1ee596154fc2000001") return true;
		}

		return false;
	},

	getIfManager: function(userid){
		var itemModel = this.collection.findWhere({
			userid: userid
		});

		if(itemModel){
			var roleid = itemModel.get('roleid');
			if(roleid && roleid._id == "5615fd84e596150061000003") return true;
		}

		return false;
	},

	getIfHasRole: function(userid){
		var itemModel = this.collection.findWhere({
			userid: userid
		});

		if(itemModel){
			var roleid = itemModel.get('roleid');
			if(roleid && roleid._id) return true;
		}

		return false;
	},

	getIfmuted: function(userid){
		var itemModel = this.collection.findWhere({
			userid: userid
		});

		if(itemModel){
			return itemModel.get("muted");
		}

		return false;
	},

	autoLoad : function(){
		console.log("DUBTRACK loading avatars");
		var self = this;

		this.collection.fetch({
			update: true,
			success: function(){
				if(!self.loadedInitialDubs){
					self.loadedInitialDubs = true;
					self.fetchDubs();
					self.resetEl();
				}
			}
		});
	},

	beforeClose : function(){
		if( this.intervalId ) clearInterval(this.intervalId);
	}

});
