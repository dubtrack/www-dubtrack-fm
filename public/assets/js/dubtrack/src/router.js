// --------------------------------------------------------------------

/**
 *	main app router
 *
 */

DubtrackRoute = Backbone.Router.extend({

	initialize : function () {
		//load google's api asynchronously
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		try{
			_gaq.push(['_setAccount', dubtrackMain.config.gaId ]);
			_gaq.push(['_trackPageview']);
		}catch(ex){}

		$.backstretch("destroy", false);
		$.backstretch("https://mediadubtrackfm.s3.amazonaws.com/assets/images/backgrounds/2048.jpg");

		//$join_cookie = ntlp_get_cookie('djroom_join');
		//if($join_cookie) this.join($join_cookie);

		//this.dtPLayer = new playerView( { model : new playlistModel( { id : this.idroom } ) } );

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
		"browser/history(/)": "browserHistory",
		"browser/tracks(/)": "browserTracks",
		"browser/upload(/)": "browserUpload",
		"browser/:function/:id": "browserFunction",
		"join/:id(/)": "join",
		"dubs(/)": "dubsLoader",
		"dubs/:type(/)": "dubsLoader",
		"avatar/:id(/)": "avatarDisplay",
		"avatar/:id/edit(/)": "avatarEdit",
		"notifications(/)": "notifications",
		"login(/)" : "login",
		"forgot(/)" : "forgotPassword",
		"password(/)" : "forgotPassword",
		"signup(/)" : "createAccount",
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
			/*var join_cookie = Dubtrack.helpers.cookie.get('dubtrack-room');

			if(join_cookie){
				this.navigate("join/" + join_cookie, {
					trigger: true
				});
			}else{
				this.roomList();
			}*/
			this.roomList();

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
			case "dubs":
				this.dubsLoader();
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

	dubsLoader : function(type){

		if( ! type ) {
			this.dubs(dubtrackMain.config.dubsUrl + "/date/");
			return;
		}

		switch(type){
			case "":
				this.dubs(dubtrackMain.config.dubsUrl + "/date/" + type, type);
				return;
			break;
			default:
				this.dubs(dubtrackMain.config.dubsGetSong + type, type);
				return;
		}

	},

	dubs : function(url, type){

		var self = this;
		this.before(function(){

			document.title = "Dubs | Dubtrack.fm";

			$("#dt_mainplayer").addClass('inactive');

			//set loading state
			Dubtrack.els.displayloading(dubtrack_lang.dubs.loading);

			if( ! self.dubsListCollection ){
				self.containers.dubContainerMainSection = $('<section/>', {'class' : 'dt_section', 'id' : 'dubContainerMainSection' }).appendTo( dubtrackMain.config.mainSectionEl );
				dubtrackMain.config.dubsListContainer = $('<div/>', { 'class' : 'avatar_cont', 'id' : dubtrackMain.config.dubsListContainer }).appendTo( self.containers.dubContainerMainSection );

				//create a dubs collection
				self.dubsListCollection = new DubsListCollection();

				self.dubsListCollection.url = url;
				self.dubsListCollection.fetch({ success : function(m,r){
					self.dubsView = new DubsView({ model : self.dubsListCollection });
					$( self.dubsView.el ).appendTo( dubtrackMain.config.dubsListContainer );

					//set elements active state
					$( self.dubsView.el ).find('a.active').removeClass('active');
					$( self.dubsView.el ).find('a.' + type).addClass('active');

					dubtrackMain.elements.mainLoading.hide();
					self.dubsView.runPlugins();

					if(!r.success){
						self.navigate('/dubs',{trigger:true});
						dubtrackMain.helpers.displayError(dubtrack_lang.dubs.song_notfound, dubtrack_lang.dubs.song_notfound_des, false);
					}

				},
				error : function(){
					//hide loading
					dubtrackMain.elements.mainLoading.hide();
					self.navigate('/',{trigger:true});
					dubtrackMain.helpers.displayError(dubtrack_lang.global.error, dubtrack_lang.global.error_des, true);
				}});

			}else{
				self.dubsView.dubsListEl.html('');

				self.dubsListCollection.url = url;
				self.dubsListCollection.fetch({success : function(m,r){
					dubtrackMain.elements.mainLoading.hide();
					self.dubsView.runPlugins();

					if(!r.success){
						self.navigate('/dubs',{trigger:true});
						dubtrackMain.helpers.displayError(dubtrack_lang.dubs.song_notfound, dubtrack_lang.dubs.song_notfound_des, false);
					}

				}});

				self.containers.dubContainerMainSection.removeClass('inactive');
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

	browser : function(callback, skipLoadRoom){
		if(Dubtrack.loggedIn){
			var self = this;

			if(!Dubtrack.room.model && !skipLoadRoom){
				var join_cookie = Dubtrack.helpers.cookie.get('dubtrack-room');
				if(join_cookie) this.join(join_cookie, function(){
					self.browser.call(self, callback, true);
				});

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
				success : function(m,r){
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
						/*self.navigate('/',{
							trigger: true
						});*/

						Dubtrack.helpers.displayError(dubtrack_lang.avatar.profileNotfound, dubtrack_lang.avatar.profileNotfound_des, false);
					}
				},

				error : function(){
					//hide loading
					Dubtrack.els.mainLoading.hide();

					/*self.navigate('/',{
						trigger: true
					});*/

					Dubtrack.helpers.displayError(dubtrack_lang.global.error, dubtrack_lang.global.error_des, true);
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

					if(callbackJoin) callbackJoin.call(self);
				},

				error: function(){
					Dubtrack.els.mainLoading.hide();
					Dubtrack.helpers.displayError(dubtrack_lang.global.error, "This room doesnt exists :(");

					Dubtrack.app.navigate("/lobby", {
						trigger: true
					});

					if(callbackJoin) callbackJoin.call(self);
				}
			});
		}
	},

	before: function (callback, loadRoom) {
		var self = this;

		$('.dubtrack-section').hide();

		/*$dj_new_user = Dubtrack.helpers.cookie.get('dj_new_user');

		if( ! $dj_new_user && Dubtrack.user.loggedIn ){

			this.help();
			ntlp_set_cookie('dj_new_user', true, 60);
		}*/

		$("html").removeClass("menu-left-in").removeClass('menu-right-in');

		if(!Dubtrack.room.model){
			var join_cookie = Dubtrack.helpers.cookie.get('dubtrack-room');
			if(join_cookie) this.join(join_cookie, false, true);
		}

		if (callback) callback.call(this);
	},

	navigate : function(url, params){
		if(params){
			if("replace" in params){
				if( ! params.replace ){
					try{
						_gaq.push(['_trackPageview', url]);
					}catch(ex){}
				}
			}else _gaq.push(['_trackPageview', url]);
		}

		$('.menu-expand').removeClass('active');

		return Backbone.Router.prototype.navigate.call(this, url, params);
	}

});
