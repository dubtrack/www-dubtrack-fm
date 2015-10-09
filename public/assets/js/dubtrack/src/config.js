/**
 *	dubtrack main
 *
 */

(function() {
	/*var method;
	var noop = function noop() {};
	var methods = [
		'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
		'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
		'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
		'timeStamp', 'trace', 'warn'
	];
	var length = methods.length;
	//var console = (window.console = window.console || {});

	while (length--) {
		method = methods[length];

		// Only stub undefined methods.
		if (!console[method]) {
			console[method] = noop;
		}
	}*/
}());

var dt = {};
dt.chat = {};
dt.player = {};
dt.room = {};
dt.profile = {};
dt.playlist = {};
dt.global = {};
dt.help = {};
dt.helpers = {};
dt.playlist.containerElCreateApp = false;
dt.bindedDocument = false;
dt.users = {};
dt.user = {};

var dubtrackMain = {
	config: {}
};

if(!w.DUBTRACK_API_URL) w.DUBTRACK_API_URL = "https://api.dubtrack.fm";

w.Dubtrack = {
	init: function(){
		Dubtrack.helpers.loadDependencies(function() {
			Dubtrack.app = new DubtrackRoute();

			Backbone.history.start({
				pushState: true
			});
		});
	},

	//placeholders
	chat: {},

	player: {},

	room: {},

	roomList: {},

	layout: {},

	users: {},

	user: {},

	session: {},

	views: {},

	//Backbone placeholders
	Model: {},

	Collection: {},

	View: {},

	$: {
		body: $('body'),
		mainSectionEl: $("section#main-section")
	},

	config: {
		apiUrl: w.DUBTRACK_API_URL,

		urls: {
			mediaBaseUrl: "https://mediadubtrackfm.s3.amazonaws.com",
			commentsDubs: "/comments/:id/dubs",
			commentsFlag: "/comments/:id/flag",
			room: "/room",
			roomImage: "/room/:id/image",
			roomUsers: "/room/{id}/users",
			roomQueue: "/room/{id}/playlist",
			roomQueueDetails: "/room/:id/playlist/details",
			roomHistory: "/room/{id}/playlist/history",
			dubs: "/dubs",
			user: "/user",
			updateUsername: "/user/updateUsername",
			queryUsernameAvailability: "/user/query/availabilty",
			session: "/auth/session",
			playlist: "/playlist",
			playlistOrder: "/playlist/:id/order",
			playlistSong: "/playlist/:id/songs",
			song: "/song",
			songComments: "/song/:id/comments",
			chat: "/chat/:id",
			roomPlaylist: "/room/:id/playlist",
			roomPlaylistActive: "/room/:id/playlist/active",
			dubsPlaylistActive: "/room/:id/playlist/active/dubs",
			kickUser: "/chat/kick/:roomid/user/:id",
			banUser: "/chat/ban/:roomid/user/:id",
			muteUser: "/chat/mute/:roomid/user/:id",
			setModUser: "/chat/mod/:roomid/user/:id",
			skipSong: "/chat/skip/:id",
			userQueue: "/user/session/room/:id/queue",
			userQueueOrder : "/user/session/room/:id/queue/order",
			roomUserQueueOrder : "/room/:id/queue/order",
			userFollow: "/user/:id/follows",
			userFollowing: "/user/:id/following",
			userImage: "/user/:id/image",
			search: "/search",
			messages: "/message",
			messages_items: "/message/:id",
			messages_news: "/message/new",
			messages_read: "/message/:id/read"
		},

		keys: {
			pubunub: 'sub-c-2b40f72a-6b59-11e3-ab46-02ee2ddab7fe',
			soundcloud: '801facf61770a4cbf5566eb15b59e7a0',
		},

		player: {
			youtube: {
				youtubeVars: {
					'controls': 0,
					'rel': 0,
					'showinfo': 0,
					'autoplay' : 1,
					'output': 'embed',
					'wmode': 'transparent',
					'playsinline' : 1,
					'iv_load_policy' : 3
				},

				playerParams: {
					'controls': 0,
					'rel': 0,
					'showinfo': 0,
					'autoplay': 0,
					'modestbranding': 1,
					'output': 'embed',
					'wmode': 'transparent',
					'playsinline' : 1,
					'iv_load_policy' : 3
				}
			},

			playerWidth: '100%',
			playerHeight: '100%',

			playerEmbedWidth: '100%',
			playerEmbedHeight: 360
		},

		loadingEls: '<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>',

		urlPLayerPlaylist 		: "/room/playlist/get/idroom/",
		urlRoomInfo 			: "/api/rooms/load_room_info/idroom/",
		chatEndPointUrl			: "/room/chat/send/idroom/",
		playerVoteUrl			: "/room/main/vote/idroom/",
		browserPlaylistDeatilsUrl: "/api/playlist/getPlaylist/id/",
		roomJoin				: "/room/main/join/idroom/",
		roomJoinInco			: "/api/rooms/joinIncognito/idroom/",
		roomLeave				: "/room/main/removeUser",
		roomListUrl				: "/api/rooms/get_rooms/iduser/0",
		browserSearchUrl		: "/api/youtube/",
		dubsUrl					: "/api/dubs/api",
		dubsGetSong				: "/api/dubs/viewapi/url_sh/",
		searchDubsUrl			: "/api/dubs/apiSearch",
		userProfileUrl			: "/api/users/get_user_info",
		saveDubComment			: "/api/dubs/save_comment/",
		reportSpamComment		: "/api/dubs/spam_comment/",
		deleteComment			: "/api/dubs/delete_comment/id/",
		getAvatarsRoom			: "/api/rooms/loadUsers/idroom/",
		getRolesRoom			: "/api/rooms/get_room_roles/idroom/",
		getAvatarUrl			: "/api/users/get/details/1/id/",
		getWallPost				: "/api/users/get_wall_post/id/",
		dubWallPost				: "/api/dubs/dub_wall_comment/",
		saveWall				: "/user/save_wall/",
		deleteWall				: "/user/delete",
		getPlaylistPublic		: "/api/playlist/getListPublic",
		getFollowing			: "/api/users/follows/",
		fetchNotification		: "/api/users/notification_feed/page/",
		addQueue				: "/room/playlist/add/idroom/",
		saveUserId				: "/api/users/updatedt",
		checkusername			: "/api/users/check_usernamedt",
		roomUpdate				: "/room/main/update",
		roomCreate				: "/room/main/create",
		followUrl				: "/api/users/follow/",
		unfollowUrl				: "/api/users/unfollow/",
		getWallPostsUrl			: "/api/users/get_wall_posts/id/",
		addToPlaylist			: "/api/playlist/addMedia",
		removeFromPlaylist		: "/api/playlist/deleteMedia",
		changePlaylistType		: "/api/playlist/change_playlist_type",
		queuePlaylist			: "/room/playlist/addPlaylist",
		removeFromQueue			: "/room/playlist/deleteMedia/",
		addPlaylist				: "/api/playlist/add",
		removePlaylist			: "/api/playlist/delete",
		getQueueUrl				: "/room/playlist/getListUser/",
		mytracksUrl				: "/dubtrack/music/get",
		updateMytracksUrl		: "/dubtrack/music/update",
		deleteMytracksUrl		: "/dubtrack/music/delete",
		getMusicTracks			: "/dubtrack/music/getMusic/userid/",
		roomHistory				: "/room/playlist/getHistory/",
		getQueuePlace			: "/room/playlist/shownext/",
		notificationsCountUrl	: "/api/users/get_notification_feed_count",
		getFriendsRoomUrl		: "/api/rooms/getRoomFriends/idroom/",
		getModsRoomUrl			: "/api/rooms/getRoomMods/idroom/",
		getFriendsGlobalUrl		: "/api/users/get_friends",
		getChatHistory			: "/api/rooms/get_history/idroom/",
		sendMessageUrl			: "/user/sendmessage",
		getMessagesUrl			: "",
		globalBaseUrl 			: "http://dubtrack.fm/",
		mainRoomContainer		: $("#main_room"),
		playerMainContainer		: $("#main_player"),
		playerContainer			: $("#main_player").find('div.player_container'),
		playerConrols			: $("#room_info"),
		gaId					: "UA-31613628-1",
		chatContainer			: $("div#chat"),
		roomListContainer		: 'roomListContainer', //id only div will be created by app
		dubsListContainer		: 'dubsListContainer', //id only div will be created by app
		mainSectionEl			: $("section#main-section"),
		avatarContEl			: $("div#avatarCont")
	},

	els: {
		mainLoading : null,

		init : function(){
			this.mainLoading = $('#main-loading').show();
			this.mainLoadingText = this.mainLoading.find('.loading-text');

			this.mainLoadingText.html( dubtrack_lang.global.loading );
		},

		displayloading : function(langText){
			if(!langText) langText = dubtrack_lang.global.loading;
			this.mainLoadingText.html(langText);

			this.mainLoading.show();
		},

		hideMainLoading : function(){
			this.mainLoading.hide();
		},

		controls : function(el, object){
			//create control elements
			object.loadingEl = $('<div/>', {'class' : 'loading'}).html('Loading...').appendTo(el);
			object.bufferingEl = $('<div/>', {'class' : 'buffering'}).html('Buffering...').css({display: 'none'}).appendTo(el);
			object.replayEl = $('<div/>', {'class' : 'replay'}).html('replay').appendTo(el);
			object.errorEl = $('<div/>', {'class':'error'}).html('An unexpected error occurred, please try again later').appendTo(el);
			object.errorEl.hide();
			object.controlsContainer = $('<div/>', {'class': 'controlContainer'}).appendTo(el);
			object.buttonsEl = $('<div/>', {'class': 'buttons'}).appendTo(object.controlsContainer);
			object.playEl = $('<a/>', {'class': 'play noaction', href : '#'}).html('<span class="icon-play"></span>').appendTo(object.buttonsEl);
			object.pauseEl = $('<a/>', {'class': 'pause noaction', href : '#'}).hide().html('<span class="icon-pause"></span>').appendTo(object.buttonsEl);
			object.progressOuterEl = $('<div/>', {'class' : 'progressContainer'}).appendTo(object.controlsContainer);
			object.progressEl = $('<div/>', {'class': 'progress'}).appendTo(object.progressOuterEl);
			object.loadedEl = $('<div/>', {'class': 'loaded'}).appendTo(object.progressOuterEl);
			object.volumeContainer = $( '<div class="volume-container"><span class="tooltip"></span><div class="volume-control"></div><span class="volume"></span></div>' ).prependTo(object.controlsContainer);
		}
	},

	helpers : {
		getParameterByName : function(name){
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		},

		isDubtrackAdmin : function(userid){
			if( userid == "52c821781e2b1fd945000001" ||
				userid == "52c8ef6037e22b0200000005" ||
				userid == "52d24bff4cf9670200000515" ||
				userid == "52c8efcf37e22b0200000008" ||
				userid == "52c8254ca7b7260200000001"){
				return true;
			}else{
				return false;
			}
		},

		cookie : {
			// SETS A COOKIE
			set: function(name,value,days,session) {
				var expires = "";

				if(days && session !== true){
					var date = new Date();
					date.setTime(date.getTime()+(days*24*60*60*1000));
					expires = "; expires="+date.toGMTString();
				}

				document.cookie = name+"="+encodeURIComponent(value)+expires+"; path=/";
			},

			// GETS A COOKIE
			get: function(name) {
				var nameEQ = name + "=",
					ca = document.cookie.split(';');

				for(var i=0;i < ca.length;i++) {
					var c = ca[i];

					while (c.charAt(0)==' '){
						c = c.substring(1,c.length);
					}

					if(c.indexOf(nameEQ) === 0){
						return decodeURIComponent(c.substring(nameEQ.length,c.length));
					}
				}

				return null;
			},

			// DELETE COOKIE
			delete: function(name) {
				Dubtrack.helpers.cookie.set(name,"",-1,false);
			}
		},

		parse: function(response, xhr){
			return response.data;
		},

		image: {
			imageError : function(image, src){
				image.onerror = "";
				if(src)
					image.src = Dubtrack.config.urls.mediaBaseUrl + src;
				else
					image.src = Dubtrack.config.urls.mediaBaseUrl + '/assets/images/media/pic_notfound.jpg';

				return true;
			},

			getImage: function(userid, username, large, roomPopup){
				var clickac = "Dubtrack.helpers.displayUser('" + userid + "', this);",
					src = Dubtrack.config.apiUrl + Dubtrack.config.urls.userImage.replace(":id", userid);

				if(large) src += "/large";

				var img;

				if(!roomPopup){
					if(username && username !== null){
						clickac = "Dubtrack.app.navigate('/" +  username + "', {trigger: true});";
					}else{
						clickac = "";
					}
				}

				img ='<img src="' + src + '"  alt="' + username + '" onclick="' + clickac + '" class="cursor-pointer" onerror="Dubtrack.helpers.image.imageError(this);" />';

				return img;
			},

			getProfileImg : function(id, username, oauth, type){
				var src = "";

				//var clickac = "Dubtrack.app.navigate('/" +  username + "', {trigger: true});";
				var clickac = "Dubtrack.helpers.displayUser('" + id + "', this);";

				if(oauth == "facebook"){
					if(! type ) type = 'square';
					else{
						if(type === 'large') type = 'large';
					}
					src = 'https://graph.facebook.com/' + id + '/picture?type=' + type;
				}
				else if(oauth == "google"){
					if(! type ) type = "";
					else{
						type = '?sz=200';
					}
					src = 'https://plus.google.com/s2/photos/profile/' + id + '' + type;
				}
				else if(oauth == "soundcloud"){
					src = 'http://media.dubtrack.fm/media/soundCloud.png';
				}
				else{
					if(! type ) type = 'bigger';
					else{
						if(type == 'large') type = 'original';

						if(type == 'square') type = 'normal';
					}

					src = 'https://api.twitter.com/1/users/profile_image?id=' + id + '&size=' + type;
				}

				//img = '<a href="/' + username + '" class="navigate" data-username="' + username + '">' + img + '</a>';
				var img ='<img src="' + src + '"  alt="' + username + '" onclick="' + clickac + '" class="cursor-pointer" onerror="Dubtrack.helpers.image.imageError(this);" />';

				return img;
			}
		},

		displayUser : function(id, el){
			if(!Dubtrack.views.user_popover){
				Dubtrack.views.user_popover = new dt.global.userPopover();
				Dubtrack.views.user_popover.$el.appendTo('body');
			}

			Dubtrack.views.user_popover.displayUser(id);

			var offset = $(el).offset();

			if($(window).height() < offset.top + 100){
				offset.top -= 100;
			}

			Dubtrack.views.user_popover.$el.css({
				'left': offset.left - 200,
				'top': offset.top
			}).show();
		},

		flashLogin : function(){
			$("#header_login").stop(true).fadeIn(300).fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300);
		},

		navigateHistoryTags : function(el){

			var a = el.find("a.navigate");

			a.unbind("click");

			//load all navigate a tags
			a.bind("click", function(){
				$href = $(this).attr("href");

				if($href){
					Dubtrack.app.navigate($href, {
						trigger: true
					});
				}
				return false;
			});
		},

		playlist : {
			addQueue : function(idfk, type, callback){
				if(Dubtrack.room){
					var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomQueue.replace( "{id}", Dubtrack.room.model.id );

					Dubtrack.helpers.sendRequest( url, {
						'songId': idfk,
						'songType': type
					}, 'post', callback);
				}else{
					if(callback) callback.call(this, null);
				}
			},

			removeQueue: function(songid, callback){
				if(Dubtrack.room){
					var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.roomQueue.replace( "{id}", Dubtrack.room.model.id ) + '/' + songid;

					Dubtrack.helpers.sendRequest( url, {}, 'delete', callback);
				}else{
					if(callback) callback.call(this, null);
				}
			}

		},

		genPlaylistContainer : function(el, pos, songid, type, className){
			if(Dubtrack.createPlaylist) Dubtrack.createPlaylist.close();

			Dubtrack.app.loadUserPlaylists( function(){
				Dubtrack.createPlaylist = new Dubtrack.View.containerElCreate({
					model : Dubtrack.user.playlist
				}).render(el, pos, songid, type);

				if(className) Dubtrack.createPlaylist.$el.addClass(className);

				if( ! dt.bindedDocument ){
					$(window).on('click', function(e){
						$parents = $(e.target).parents('.playlist-options');

						if($parents.length === 0){
							if(Dubtrack.createPlaylist) Dubtrack.createPlaylist.close();
						}
					});

					dt.bindedDocument = true;
				}
			});
		},

		sendRequest : function(url, data, type, callback, ctx){
			if(!ctx) ctx = this;

			console.log("DUBTRACK sending " + type + " request " + url);
			//send Ajax request
			try
			{
				$.ajax({
					url: url,

					data: data,

					type: type,

					xhrFields: {
						withCredentials: true
					},

					success: function(r){
							try{
								if(callback) callback.call(ctx, null, r);
							}
							catch(err){
							}
					},

					error: function(r, xhr, message){
						var err = message;
						try{
							err = $.parseJSON(r.responseText);
						}catch(ex){}

						if(callback) callback.call(ctx, err, null);
					}
				},"json");

			}catch(err){
			}
		},

		displayDubs : function(userid, setDubs, message){

			if( !message) message = '';

			var dtuser = dubtrack.app.roomAvatarList.collection.get(userid);

			if(dtuser){

				var dubsTmp = dtuser.get("dubs");

				dubs = parseInt(dubsTmp) + setDubs;

				dtuser.set({"dubs" : dubs});

				var clr = null;

				var $div = $('<div/>', {'class':'dubDisplay'}).html('<b>'+ message + ' +' + setDubs + ' dub</b><span>' + dubs + '</span>').appendTo( dtuser.viewEl.$el );

				setTimeout( function(){
					$div.remove();
				}, 1500 );

				/*var ele = $div.find('span');
				inloop = function() {
					dubsTmp++;
					ele.html(dubsTmp);
					if( dubs ===  dubsTmp ){
						setTimeout( function(){
							$div.remove();
						}, 2500 );
						return;
					}
					clr = setTimeout(inloop, 30);
				};
				inloop();*/
			}

			return false;
		},

		loadDependenciesEl : function(callback){
			Dubtrack.layout = new Dubtrack.View.LayoutView();
			Dubtrack.playerController = new Dubtrack.View.PlayerController();
			//dubtrack.elements.playerController = new dt.player.playerController().render();
			//dubtrack.elements.footerEl = $( tpl.get("footer") ).appendTo( 'body' );

			/*if(Dubtrack.user.loggedIn){
				Dubtrack.els.headerEl.find('.notifications span.counter').hide();

				var notfications = setInterval(function(){
					var notificationsCounter = Dubtrack.els.headerEl.find('.notifications span.counter');
					console.log("DT NOTIFICATIONS LOAD");
					//sed request
					$.ajax({
						url: Dubtrack.config.notificationsCountUrl,
						data: {},
						type: 'GET',
						success: function(response){
							if("data" in response){
								$total = parseInt(response.data.total);
								if($total > 0){
									notificationsCounter.show().html($total);
								}else{
									notificationsCounter.hide();
								}
							}
						},
						error: function(){
						}
					},"json");
				}, 40000);
			}*/

			if(callback) callback.call();
		},

		loadDependencies : function(callback){
			Dubtrack.user = {};
			Dubtrack.user.loggedIn = false;
			//load main elements
			Dubtrack.els.init();

			//load user
			Dubtrack.session = new Dubtrack.Model.User();
			Dubtrack.loggedIn = false;
			Dubtrack.session.urlRoot = Dubtrack.config.apiUrl + Dubtrack.config.urls.session;
			Dubtrack.session.parse = Dubtrack.helpers.parse;
			Dubtrack.session.fetch({
				success: function(model, r){
					Dubtrack.loggedIn = true;
					Dubtrack.helpers.loadDependenciesEl(callback);
					Dubtrack.cache.users.add(r.data);
				},
				error: function(){
					Dubtrack.helpers.loadDependenciesEl(callback);
				}
			});
		},

		displayError : function($title, $message, $refresh, onclick){

			$("#warning").remove();

			var $div = $('<div/>', {id : "warning"}).html("<h3>" + $title + "</h3><p>" + $message + "</p>").appendTo( 'body' );

			if($refresh){
				$("<button onclick='location.reload();return false;'>" + dubtrack_lang.global.refresh +"</button>").appendTo( $div );
			}else{
				if(! onclick ) onclick = '$("#warning").remove();return false;';
				$("<button onclick=" + onclick + ">Ok</button>").appendTo( $div );
			}
		},

		text : {
			convertHtmltoTags: function(text, imagloadFun){
				var imageRegex = /^((http|https)\:\/\/(i\.imgur\.com|img[0-9]{2}\.deviantart\.net|media\.giphy\.com|[0-9]{2}\.media\.tumblr\.com|s-media-cache-ak[0-9]\.pinimg\.com|(www\.)?reactiongifs\.com|9gag\.com|upload\.wikimedia\.org))(.*)\.(png|jpg|jpeg|gif|svg)$/;

				text = text.replace(/(\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%()[\]?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|])/gim,
					function(str) {
						if (str.match(imageRegex)) {
							str = str.replace(/^http:\/\//i, 'https://');
							var onErrorAction = "Dubtrack.helpers.image.imageError(this, '/assets/images/media/chat_image_load_error.png');" + imagloadFun;
							str = '<a href="' + str + '" class="autolink" target="_blank"><img src="' + str + '" alt="' + str + '" onload="' + imagloadFun + '" onerror="' + onErrorAction + '" /></a>';
							return str;
						} else {
							str = '<a href="' + str + '" class="autolink" target="_blank">' + str + '</a>';
							return str;
						}
				});

				return text;
			},

			shrinkImg: function(src){
				var img = $(src);

				if (img.width() === 20) {
					img.animate({width: "100%", height: "100%"}, 500);
				} else {
					img.animate({width: "20px", height: "20px"}, 500);
				}
			},

			convertAttoLink: function(text){
				return text.replace(/(@[A-Za-z0-9_.]+)/g, '<span class="username-handle">$&</span>');
			},
		}
	},

	app : null,  // main dubtrack
	dubtrackPlayer : null // main dubtrack player
};
