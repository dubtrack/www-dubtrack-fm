// --------------------------------------------------------------------

/**
 *	main app router
 *
 */

DubtrackRoute = Backbone.Router.extend({
	initialize : function () {
		if ($('body').data('backstretch')) $.backstretch('destroy', false);
		//$.backstretch("https://cdn.dubtrack.fm/assets/images/backgrounds/2048.jpg");

		Dubtrack.helpers.navigateHistoryTags($('body'));

		console.log("DUBTRACK app initialized");
	},

	routes : {
		"(/)": "emptyRoute",
		"lobby(/)": "roomList",
		"search(/)": "roomList",
		"browser(/)": "browser",
		"browser/search(/)": "browser",
		"browser/queue(/)": "browserQueue",
		"browser/room-queue(/)": "browserRoomQueue",
		"browser/room-waitlist(/)": "browserRoomWaitlist",
		"browser/history(/)": "browserHistory",
		"browser/tracks(/)": "browserTracks",
		"browser/upload(/)": "browserUpload",
		"browser/:function/:id": "browserFunction",
		"join/:id(/)": "join",
		"dubs/:type(/)": "dubsLoader",
		"avatar/:id(/)": "avatarDisplay",
		"avatar/:id/edit(/)": "avatarEdit",
		"notifications(/)": "notifications",
		"login(/)" : "login",
		"forgot(/)" : "forgotPassword",
		"password(/)" : "forgotPassword",
		"signup(/)" : "createAccount",
		"donate(/)": "donate",
		":user(/)": "emptyRoute",

		'*notFound': 'notFound'
	},

	notFound : function(){
		this.before(function(){
			Dubtrack.els.mainLoading.hide();

			Dubtrack.helpers.displayError("404 - Page not found", "the requested page doesn't exist", false);
		}).bind(this);
	},

	emptyRoute : function(user){

		if(!user || user === " " || user === "_=_"){
			var join_cookie = Dubtrack.helpers.cookie.get('dubtrack-room');

			if(join_cookie){
				this.navigate("join/" + join_cookie, {
					trigger: true
				});
			}else{
				this.roomList();
			}

			return false;
		}

		switch(user){
			case "lobby":
				this.roomList();
				break;
			case "search":
			case "browser":
				this.browser();
			break;
			case "notifications":
				this.notifications();
			break;
			default:
				this.avatarDisplay(user);
		}
	},

	containers : {},

	notifications : function(){

		var self = this;
		this.before(function(){

			document.title = dubtrack_lang.titles.notifications + " | Dubtrack.fm";

			$("#dt_mainplayer").addClass('inactive');

			//set loading state
			Dubtrack.els.displayloading(dubtrack_lang.notification.loading);

			if(! this.notificationCollection ){
				//get notifications
				self.notificationCollection = new NotificationCollection();
				self.notificationCollection.fetch({success : function(response){

					var view = new NoticiationView({ model : self.notificationCollection });

					self.containers.notificationsSection = $('<section/>', {'class' : 'dt_section', 'id' : 'notificationsSection' }).appendTo( dubtrackMain.config.mainSectionEl );
					self.notificationContainer = $( view.el ).appendTo( self.containers.notificationsSection );

					view.render();

					Dubtrack.els.mainLoading.hide();
				}});
			}else{

				self.containers.notificationsSection.removeClass( 'inactive' );
				Dubtrack.els.mainLoading.hide();
			}
		});
	},

	roomList : function(){
		var self = this;

		$("#create-room-div").show();
		$("#edit-room-div").hide();

		this.before(function(){
			document.title = dubtrack_lang.titles.lobby + " | Dubtrack.fm";

			//set loading state
			Dubtrack.els.displayloading(dubtrack_lang.room.searching);

			if( ! Dubtrack.roomList.collection ){
				//create a room collection
				Dubtrack.roomList.collection = new Dubtrack.Collection.Room();
				Dubtrack.roomList.collection.fetch({
					success: function(){
						Dubtrack.roomList.list_view = new Dubtrack.View.RoomList({
							model : Dubtrack.roomList.collection
						});

						Dubtrack.roomList.list_view.$el.show();

						Dubtrack.els.mainLoading.hide();
					}
				});
			}else{
				Dubtrack.roomList.list_view.$el.show();

				Dubtrack.roomList.collection.reset();
				Dubtrack.roomList.collection.fetch({
					success: function(){
						Dubtrack.els.mainLoading.hide();

						//Dubtrack.roomList.list_view.fetchUserRooms();
					}
				});
			}

		});
	},

	browserQueue : function(){
		var self = this;
		this.browser(function(){
			self.browserView.displayDetails("queue");
		});
	},

	browserRoomQueue : function(){
		var self = this;
		this.browser(function(){
			self.browserView.displayDetails("room_queue");
		});
	},

	browserRoomWaitlist : function(){
		var self = this;
		this.browser(function(){
			self.browserView.displayDetails("room_waitlist");
		});
	},

	browserHistory : function(){
		var self = this;
		this.browser(function(){
			self.browserView.displayDetails("history");
		});
	},

	browserTracks : function(){
		var self = this;
		this.browser(function(){
			self.browserView.displayDetails("tracks");
		});
	},

	browserUpload : function(){
		var self = this;
		this.browser(function(){
			self.browserView.displayDetails("upload");
		});
	},

	browserFunction : function(fn, id){
		var self = this;
		switch (fn){
			case "user":
				this.browser(function(){
					self.browserView.displayDetails("user", id);
				});
			break;
			default:
				this.browser(function(){
					self.browserView.displayDetails("user", id);
				});
			break;
		}
	},

	login : function(){
		if(Dubtrack.loggedIn){
			Dubtrack.app.navigate('/', {
				trigger: true
			});

			return;
		}

		this.before(function(){
			Dubtrack.layout.main_login_window.displayWindow('login_window');
		});
	},

	createAccount : function(){
		if(Dubtrack.loggedIn){
			Dubtrack.app.navigate('/', {
				trigger: true
			});

			return;
		}

		this.before(function(){
			try{
				grecaptcha.reset();
			}catch(ex){}

			Dubtrack.layout.main_login_window.displayWindow('signup_window');
		});
	},

	forgotPassword : function(){
		if(Dubtrack.loggedIn){
			Dubtrack.app.navigate('/', {
				trigger: true
			});

			return;
		}

		this.before(function(){
			var token = Dubtrack.helpers.getParameterByName('token')

			if(!token){
				Dubtrack.layout.main_login_window.displayWindow('forgot_window');
			}else{
				Dubtrack.layout.main_login_window['change_window'].token = token;
				Dubtrack.layout.main_login_window.displayWindow('change_window');
			}
		});
	},

	donate: function() {
		this.before(function() {
			Dubtrack.layout.donate_window.displayWindow();
		});
	},

	browser : function(callback, skipLoadRoom){
		if(Dubtrack.loggedIn){
			var self = this;

			if(!Dubtrack.room.model && !skipLoadRoom){
				var join_cookie = Dubtrack.helpers.cookie.get('dubtrack-room');
				if(join_cookie) {
					this.join(join_cookie, function(){
						self.browser.call(self, callback, true);
					});
				}else{
					self.browser.call(self, callback, true);
				}

				return;
			}

			if(!this.browserView){
				this.loadUserPlaylists( function(){
					self.browserView = new Dubtrack.View.Browser({
						model : Dubtrack.user.playlist
					});

					self.browserView.displayBrowser();

					if(callback) callback.call(self);
					else self.browserView.displayDetails();
				});
			}else{
				self.browserView.displayBrowser();

				if(callback) callback.call(self);
			}
		}else{
			Dubtrack.els.mainLoading.hide();

			return Dubtrack.app.navigate('/login', {
				trigger: true
			});
		}
	},

	avatarDisplay : function(id){

		var self = this;
		this.before(function(){
			document.title = id + " | Dubtrack.fm";

			//set loading state
			Dubtrack.els.displayloading(dubtrack_lang.avatar.loading);

			//if(self.AvatarEditView) self.AvatarEditView.close();

			var userModel = new Dubtrack.Model.User({
				_id : id
			});

			userModel.parse = Dubtrack.helpers.parse;

			userModel.fetch({
				success : function(m, r){
					//hide loading
					Dubtrack.els.mainLoading.hide();

					if(r.data){
						if(!self.profileView){
							self.profileView = new Dubtrack.View.Profile({
								model : userModel
							});
						}else{
							self.profileView.model = userModel;
							self.profileView.render();
						}
					}else{
						Dubtrack.helpers.displayError(dubtrack_lang.avatar.profileNotfound, dubtrack_lang.avatar.profileNotfound_des, false);
					}
				},

				error : function(m, r){
					//hide loading
					Dubtrack.els.mainLoading.hide();

					try{
						var status = r.statusCode();

						if(status && status.status == 404){
							Dubtrack.helpers.displayError("404 - Page not found", "the requested page doesn't exist", false);
						}else{
							Dubtrack.helpers.displayError(dubtrack_lang.global.error, dubtrack_lang.global.error_des, true);
						}
					}catch(ex){
						Dubtrack.helpers.displayError(dubtrack_lang.global.error, dubtrack_lang.global.error_des, true);
					}
				}

			});
		});
	},

	avatarEdit : function(id){
		if(this.avatarModel){
			var dj_details = this.avatarModel.get('dj_details');
			if(dubtrackMain.user.id !== dj_details.id) return false;

			this.AvatarEditView = new dt.profile.editView({ model : this.avatarModel }).render();
			$(this.AvatarEditView.el).appendTo( dt.elements.body );
			this.AvatarEditView.runPlugins();

		}else dubtrackMain.app.navigate('/avatar/' + id, {trigger : true});

	},

	loadUserPlaylists : function (callback){
		if(!this.mainPlaylistCollection){
			//display loading
			Dubtrack.els.displayloading(dubtrack_lang.playlist.loading_playlists);

			var self = this;
			Dubtrack.user.playlist = new Dubtrack.Collection.Playlist();
			Dubtrack.user.playlist.fetch({
				success : function(){
					Dubtrack.els.mainLoading.hide();
					if(callback) callback.call(self);
				}
			});
		}else{
			if(callback) callback();
		}
	},

	help : function(){

		if(dt.help.helpViewRoute) dt.help.helpViewRoute.close();

		dt.help.helpViewRoute = new dt.help.mainView().render();

	},

	join : function(id, callbackJoin, hide){
		$('.dubtrack-section').hide();
		$('#login-model-window').hide();
		$('#donate-modal-window').hide();
		$("html").removeClass("menu-left-in").removeClass('menu-right-in');

		if (Dubtrack.room && Dubtrack.room.model){
			if(Dubtrack.room.model.get("roomUrl") === id){
				Dubtrack.room.displayRoom();
				document.title = Dubtrack.room.model.get('name') + " | Dubtrack.fm";

				if(Dubtrack.session && Dubtrack.session.get("_id") === Dubtrack.room.model.get('userid')){
					$("#create-room-div").hide();
					$("#edit-room-div").show();
				}else{
					$("#create-room-div").show();
					$("#edit-room-div").hide();
				}

			}else{
				window.location = "/join/" + id;
			}
		}else{
			var self = this,
				roomModel = new Dubtrack.Model.Room({
				_id : id
			});

			//parse
			roomModel.parse = Dubtrack.helpers.parse;

			roomModel.fetch({
				success: function(m,r){
					Dubtrack.els.mainLoading.hide();

					Dubtrack.room = new Dubtrack.View.Room({
						model: roomModel
					});

					Dubtrack.room.render();

					if(!hide){
						Dubtrack.room.displayRoom();
						document.title = Dubtrack.room.model.get('name') + " | Dubtrack.fm";
					}

					Dubtrack.room.callBackAfterRoomJoin = function(){
						if(callbackJoin) callbackJoin.call(self);
					}.bind(self);
				},

				error: function(){
					Dubtrack.els.mainLoading.hide();
					Dubtrack.helpers.displayError(dubtrack_lang.global.error, "This room doesnt exists :(");

					Dubtrack.app.navigate("/lobby", {
						trigger: true
					});

					Dubtrack.room.callBackAfterRoomJoin = function(){
						if(callbackJoin) callbackJoin.call(self);
					}.bind(self);
				}
			});
		}
	},

	before: function (callback, loadRoom) {
		var self = this;

		$('.dubtrack-section').hide();
		$('#login-model-window').hide();
		$('#donate-modal-window').hide();

		$("html").removeClass("menu-left-in").removeClass('menu-right-in');

		if(!Dubtrack.room.model){
			var join_cookie = Dubtrack.helpers.cookie.get('dubtrack-room');
			if(join_cookie) this.join(join_cookie, false, true);
		}

		if(Dubtrack.views.user_popover) Dubtrack.views.user_popover.$el.hide();

		if (callback) callback.call(this);
	},

	navigate : function(url, params){
		if(params){
			if("replace" in params){
				if( ! params.replace ){
					try{
						ga('set', 'page', url);
						ga('send', 'pageview');
					}catch(ex){}
				}
			}else{
				ga('set', 'page', url);
				ga('send', 'pageview');
			}
		}

		//Handle Alexa by updating their fired variable and refiring the beacon
		if(typeof window._atrk_fired != 'undefined' && typeof window.atrk != 'undefined'){
			window._atrk_fired = false;

			window.atrk();
		}

		$('.menu-expand').removeClass('active');

		return Backbone.Router.prototype.navigate.call(this, url, params);
	}

});
