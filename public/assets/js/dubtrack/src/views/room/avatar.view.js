Dubtrack.View.roomUsers = Backbone.View.extend({

	el: $('#avatar'),

	allowed_dj: 0,

	intervalId: false,

	user_is_banned: false,

	roomId: false,

	roleListOrderType: 0,

	events  : {
		"click a.loadRoomAva": "loadRoomAva",
		"click a.modLink": "loadModsAva",
		"keyup .input-room-users-search input": "filterRoomUsers",
		"click .filter-toggle": "userListOrderingToggleClick"
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
		Dubtrack.Events.bind('realtime:room-lock-queue', this.removeAllDJs, this);

		Dubtrack.Events.bind('realtime:user-setrole', this.receiveMessage, this);
		Dubtrack.Events.bind('realtime:user-unsetrole', this.receiveMessage, this);

		Dubtrack.Events.bind('realtime:user-pause-queue', this.updateUserQueue, this);

		Dubtrack.Events.bind('realtime:pubnub-presence', this.setTotalUsers, this);

		var url = Dubtrack.config.urls.roomUsers.replace( "{id}", this.model.id );

		this.collection = new Dubtrack.Collection.RoomUser();
		this.collection.url = Dubtrack.config.apiUrl + url;
		this.collection.comparator = this.filterUsersByRolePower;

		//attach events to object
		this.collection.bind("add", this.addUser, this);
		this.collection.bind("remove", this.removeEl, this);
		this.collection.bind("change", this.updateDubs, this);

		this.intervalId = setInterval(function(){
			self.autoLoad();
		}, 720000);

		this.autoLoad();

		this.uuids = [];
		this.rt_users = [];

		//set list container
		this.avatarContainer = this.$el.find('ul#avatar-list');

		this.currentTabEl = this.$el.find(".currentBar");
		this.avatarFriendsEl = this.$el.find(".friendsElAvatar");
		this.tabsContainerEl = this.$el.find(".tabsContainer");
		this.avatarModsEl = this.$el.find(".modsElAvatar");

		this.loadingEl = this.$el.find(".loadingAva");

		this.setTotalUsersDebouce = _.debounce(this.setTotalUsers.bind(this), 1000);

		this.$('#main-user-list-room').perfectScrollbar({
			suppressScrollX: true,
			wheelPropagation: false,
			minScrollbarLength: 40
		});

		if(Dubtrack.DisableRoleColors) {
			this.disableRoleColorToggle();
		}
	},

	filterUsersByRolePower: function (user1, user2) {
		var userId1 = user1.get('userid');
		var userId2 = user2.get('userid');
		var userAdmin1 = Dubtrack.helpers.isDubtrackAdmin(userId1);
		var userAdmin2 = Dubtrack.helpers.isDubtrackAdmin(userId2);
		if (userAdmin1 && !userAdmin2) {
			return -1;
		}
		else if (userAdmin2 && !userAdmin1) {
			return 1;
		}
		var userPower1 = 0, userPower2 = 0;
		var userRoleid1 = user1.get('roleid');
		var userRoleid2 = user2.get('roleid');
		if (userRoleid1 && userRoleid1._id) {
			userPower1 = userRoleid1.rights.length;
			if(userId1 == Dubtrack.room.model.get('userid')) {
				userPower1++;
			}
		}
		if (userRoleid2 && userRoleid2._id) {
			userPower2 = userRoleid2.rights.length;
			if(userId2 == Dubtrack.room.model.get('userid')) {
				userPower2++;
			}
		}
		if (userPower1 > userPower2) {
			return -1;
		}
		else if (userPower2 > userPower1) {
			return 1;
		}
		return Dubtrack.room.users.filterUsersByDubs(user1, user2);
	},

	filterUsersByDubs: function (user1, user2) {
		var userDubs1 = user1.get('dubs');
		var userDubs2 = user2.get('dubs');
		if (userDubs1 > userDubs2) {
			return -1;
		}
		else if (userDubs2 > userDubs1) {
			return 1;
		}
		return Dubtrack.room.users.filterUsersByName(user1, user2);
	},

	filterUsersByName: function (user1, user2) {
		var username1 = user1.get('_user').username;
		var username2 = user2.get('_user').username;
		return username1.localeCompare(username2);
	},

	userListOrderingToggleClick: function () {
		switch (this.roleListOrderType) {
			case 0:
				this.roleListOrderType = 1;
				break;
			case 1:
				this.roleListOrderType = 2;
				break;
			case 2:
			default:
				this.roleListOrderType = 0;
		}

		this.userListOrderingToggle();

		this.filterRoomUsers();

		return false;
	},

	userListOrderingToggle: function () {
		switch (this.roleListOrderType) {
			case 0:
				this.$('.filter-toggle').html('Order By Role');
				this.collection.comparator = this.filterUsersByRolePower;
				break;
			case 1:
				this.$('.filter-toggle').html('Order By Dubs');
				this.collection.comparator = this.filterUsersByDubs;
				break;
			case 2:
			default:
				this.$('.filter-toggle').html('Order By Name');
				this.collection.comparator = this.filterUsersByName;
		}
		this.resetEl();
	},

	setTotalUsers: function(){
		Dubtrack.realtime.channelPresence(function(r){
			if(r && r.uuids) this.uuids = r.uuids;

			this.rt_users = [];
			var found_current_user = false;

			_.each(this.uuids, function(uuid){
				if(uuid.match(/^[0-9a-fA-F]{24}$/)){
					this.rt_users.push(uuid);
					if(Dubtrack.loggedIn && Dubtrack.session && Dubtrack.session.id == uuid) found_current_user = true;
					if(this.user_is_banned) found_current_user = true;
				}
			}.bind(this));

			if(Dubtrack.loggedIn && Dubtrack.session && !found_current_user) this.rt_users.push(Dubtrack.session.id);

			if(Dubtrack.room && Dubtrack.room.chat){
				Dubtrack.room.chat.setUserCount(this.rt_users.length);

				var guestCount = this.uuids.length - this.rt_users.length;
				Dubtrack.room.chat.setGuestCount(guestCount >= 0 ? guestCount : 0);
			}
		}.bind(this));
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
		if(item && item.viewEl) item.viewEl.$('.dubs span').html( item.get("dubs") );
		//this.resetEl();

		//if(item.featureEl) item.featureEl.$('.dubs span').html( item.get("dubs") );
	},

	resetEl : function(){
		this.collection.sort();

		//empty containers
		this.avatarContainer.empty();
		//this.featureUsersEl.empty();

		//this.totalFeatureUsers = 0;

		_.each(this.collection.models, function (item) {
			this.appendEl(item);
			//item.featureEl = false;

			/*if(this.totalFeatureUsers < 10){
				this.appendFeatureItem(item);
				this.totalFeatureUsers++;
			}*/
		}, this);

		setTimeout(function(){
			this.setTotalUsers();
		}.bind(this), 3000);

		this.$('#main-user-list-room').perfectScrollbar('update');
	},

	userJoin: function(r){
		//Dubtrack.realtime.channelPresence(function(channel_r){
			//if(channel_r && channel_r.uuids) this.uuids = channel_r.uuids;

			if(r && r.user){
				var itemModel = new Dubtrack.Model.RoomUser( r.roomUser );

				itemModel.set('user', r.user);
				itemModel.set('_user', r.user);

				this.collection.add( itemModel );

				setTimeout(function(){
					this.setTotalUsers();
				}.bind(this), 2000);
			}
		//}.bind(this));
	},

	userLeave: function(r){
		//Dubtrack.realtime.channelPresence(function(channel_r){
			//if(channel_r && channel_r.uuids) this.uuids = channel_r.uuids;

		setTimeout(function(){
			var user = this.collection.findWhere({
				userid: r.user._id
			});

			if(user) this.collection.remove( user );

			setTimeout(function(){
				this.setTotalUsers();
			}.bind(this), 2000);
		}.bind(this), 500);
		//}.bind(this));
	},

	addUser: function(itemModel){
		//this.resetEl();
		this.appendEl(itemModel);
	},

	appendEl : function(itemModel){
		//if(this.uuids && _.contains(this.uuids, itemModel.get('userid'))){
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
		//}
	},

	displayActiveUsers: function(){
		this.avatarContainer.find('li').hide();

		Dubtrack.realtime.channelPresence(function(r){
			if(r && r.uuids) this.uuids = r.uuids;

			this.rt_users = [];

			_.each(this.uuids, function(uuid){
				if(uuid.match(/^[0-9a-fA-F]{24}$/)){
					this.rt_users.push(uuid);

					this.avatarContainer.find('li.userid-' + uuid).show();
				}
			}.bind(this));

			if(Dubtrack.room && Dubtrack.room.player && Dubtrack.room.player.activeSong) {
				var song = Dubtrack.room.player.activeSong.get('song');

				if(song && song.userid) this.avatarContainer.find('li.userid-' + song.userid).show();
			}
		}.bind(this));
	},

	appendFeatureItem: function(itemModel){
		/*itemModel.featureEl = new Dubtrack.View.roomUsersItem({
			model: itemModel
		}).render();

		this.featureUsersEl.append( itemModel.featureEl.$el );*/
	},

	removeEl : function(item){
		item.viewEl.close();

		var join_cookie = Dubtrack.helpers.cookie.get('dubtrack-room-id');

		if(Dubtrack.loggedIn && item.get("userid") == Dubtrack.session.id) {
			this.collection.fetch({
				update: true,
				success: function(){
					var itemModel = this.collection.findWhere({
						userid: Dubtrack.session.id
					});

					if(!itemModel){
						this.timeoutErrorUserLeave = setTimeout( function(){
							Dubtrack.helpers.displayError("Warning", "You were removed from this room, simply refresh this page to rejoin :)<br><br>Opening multiple tabs of this site can trigger this error, email us if you have any questions at support@dubtrack.fm", true);
						}, 5000);
					}
				}.bind(this)
			});
		}

		this.setTotalUsersDebouce.call(this);

		this.$('#main-user-list-room').perfectScrollbar('update');
	},

	fetchDubs: function(){
		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.dubsPlaylistActive.replace(":id", this.model.id).replace(":playlistid", "active");

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

	updateUserQueue: function(r){
		var id = (r.user_queue && "userid" in r.user_queue) ? r.user_queue.userid : false;

		if(id){
			var itemModel = this.collection.findWhere({
				userid: id
			});

			if(itemModel){
				itemModel.set('queuePaused', r.user_queue.queuePaused);
			}
		}
	},

	removeAllDJs: function(){
		this.$('li.dj').removeClass('dj');
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

	getIfDJ: function(userid){
		var itemModel = this.collection.findWhere({
			userid: userid
		});

		if(itemModel){
			var roleid = itemModel.get('roleid');
			if(roleid && roleid._id == "564435423f6ba174d2000001") return true;
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

	getRoleType : function(userid){
		var itemModel = this.collection.findWhere({
			userid: userid
		});

		if(itemModel){
			var roleid = itemModel.get('roleid');
			if(roleid) return roleid.type;
		}

		return '';
	},

	getIfOwner: function(userid){
		var itemModel = this.collection.findWhere({
			userid: userid
		});

		if(itemModel){
			var roleid = itemModel.get('roleid');
			if(roleid && roleid._id == "5615fa9ae596154a5c000000") return true;
		}

		return false;
	},

	getIfRoleHasPermission: function(userid, permission){
		var itemModel = this.collection.findWhere({
			userid: userid
		});

		if(itemModel){
			var roleid = itemModel.get('roleid');
			if(roleid && roleid.rights &&  _.contains(roleid.rights, permission)) return true;
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

	getIfQueueIsActive: function(userid){
		var itemModel = this.collection.findWhere({
			userid: userid
		});

		if(itemModel){
			if(itemModel.get("queuePaused")) return true;;
		}

		return false;
	},

	getUserQueuedSongs: function(userid){
		var itemModel = this.collection.findWhere({
			userid: userid
		});

		if(itemModel){
			return itemModel.get("songsInQueue");
		}

		return 0;
	},

	getDubs: function(userid){
		var itemModel = this.collection.findWhere({
			userid: userid
		});

		if(itemModel){
			return itemModel.get("dubs");
		}

		return 0;
	},

	getDubsRequirement: function(userid){
		var user_dubs = this.getDubs(userid);

		if ( user_dubs > 100 || Dubtrack.helpers.isDubtrackAdmin(userid) || Dubtrack.room.users.getIfHasRole(userid) ) {
			return true;
		} else {
			return false;
		}
	},

	autoLoad : function(){
		console.log("DUBTRACK loading avatars");
		var self = this;

		this.collection.fetch({
			update: true,
			success: function(){
				Dubtrack.room.player.displayQueueSongRealtimeUpdate();

				if(!self.loadedInitialDubs){
					self.loadedInitialDubs = true;
					self.fetchDubs();
					self.resetEl();

					if(Dubtrack.room.callBackAfterRoomJoin) {
						Dubtrack.room.callBackAfterRoomJoin.call();
						Dubtrack.room.callBackAfterRoomJoin = null;
					}
				}
			}
		});
	},

	beforeClose : function(){
		if( this.intervalId ) clearInterval(this.intervalId);
	},

	disableRoleColorToggle: function () {
		if(Dubtrack.DisableRoleColors){
			this.$el.addClass('role-colors-disabled');
		}else{
			this.$el.removeClass('role-colors-disabled');
		}
	}

});
