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
			mediaBaseUrl: "http://mediadubtrackfm.s3.amazonaws.com",
			commentsDubs: "/comments/:id/dubs",
			commentsFlag: "/comments/:id/flag",
			room: "/room",
			roomImage: "/room/:id/image",
			roomUsers: "/room/{id}/users",
			roomQueue: "/room/{id}/playlist",
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
				text = Dubtrack.helpers.emoji.replace(text);

				var imageRegex = /\.(png|jpg|jpeg|gif)$/;
				
				text = text.replace(/(\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|])/gim,
					function(str) {
						if (str.match(imageRegex)) {
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

			convertAttoLink: function(text){
				return text.replace(/(@[A-Za-z0-9_.]+)/g, '<span class="username-handle">$&</span>');
			},
		},

		emoji: {
			
			init: function(){
				//http://jsfiddle.net/zUaaj/
				var definition = {"bamboo":{"title":"bamboo","codes":[":bamboo:"]},"gift_heart":{"title":"gift_heart","codes":[":gift_heart:"]},"dolls":{"title":"dolls","codes":[":dolls:"]},"school_satchel":{"title":"school_satchel","codes":[":school_satchel:"]},"mortar_board":{"title":"mortar_board","codes":[":mortar_board:"]},"flags":{"title":"flags","codes":[":flags:"]},"fireworks":{"title":"fireworks","codes":[":fireworks:"]},"sparkler":{"title":"sparkler","codes":[":sparkler:"]},"wind_chime":{"title":"wind_chime","codes":[":wind_chime:"]},"rice_scene":{"title":"rice_scene","codes":[":rice_scene:"]},"jack_o_lantern":{"title":"jack_o_lantern","codes":[":jack_o_lantern:"]},"ghost":{"title":"ghost","codes":[":ghost:"]},"santa":{"title":"santa","codes":[":santa:"]},"christmas_tree":{"title":"christmas_tree","codes":[":christmas_tree:"]},"gift":{"title":"gift","codes":[":gift:"]},"bell":{"title":"bell","codes":[":bell:"]},"no_bell":{"title":"no_bell","codes":[":no_bell:"]},"tanabata_tree":{"title":"tanabata_tree","codes":[":tanabata_tree:"]},"tada":{"title":"tada","codes":[":tada:"]},"confetti_ball":{"title":"confetti_ball","codes":[":confetti_ball:"]},"balloon":{"title":"balloon","codes":[":balloon:"]},"crystal_ball":{"title":"crystal_ball","codes":[":crystal_ball:"]},"cd":{"title":"cd","codes":[":cd:"]},"dvd":{"title":"dvd","codes":[":dvd:"]},"floppy_disk":{"title":"floppy_disk","codes":[":floppy_disk:"]},"camera":{"title":"camera","codes":[":camera:"]},"video_camera":{"title":"video_camera","codes":[":video_camera:"]},"movie_camera":{"title":"movie_camera","codes":[":movie_camera:"]},"computer":{"title":"computer","codes":[":computer:"]},"tv":{"title":"tv","codes":[":tv:"]},"iphone":{"title":"iphone","codes":[":iphone:"]},"phone":{"title":"phone","codes":[":phone:"]},"telephone":{"title":"telephone","codes":[":telephone:"]},"telephone_receiver":{"title":"telephone_receiver","codes":[":telephone_receiver:"]},"pager":{"title":"pager","codes":[":pager:"]},"fax":{"title":"fax","codes":[":fax:"]},"minidisc":{"title":"minidisc","codes":[":minidisc:"]},"vhs":{"title":"vhs","codes":[":vhs:"]},"sound":{"title":"sound","codes":[":sound:"]},"speaker":{"title":"speaker","codes":[":speaker:"]},"mute":{"title":"mute","codes":[":mute:"]},"loudspeaker":{"title":"loudspeaker","codes":[":loudspeaker:"]},"mega":{"title":"mega","codes":[":mega:"]},"hourglass":{"title":"hourglass","codes":[":hourglass:"]},"hourglass_flowing_sand":{"title":"hourglass_flowing_sand","codes":[":hourglass_flowing_sand:"]},"alarm_clock":{"title":"alarm_clock","codes":[":alarm_clock:"]},"watch":{"title":"watch","codes":[":watch:"]},"radio":{"title":"radio","codes":[":radio:"]},"satellite":{"title":"satellite","codes":[":satellite:"]},"loop":{"title":"loop","codes":[":loop:"]},"mag":{"title":"mag","codes":[":mag:"]},"mag_right":{"title":"mag_right","codes":[":mag_right:"]},"unlock":{"title":"unlock","codes":[":unlock:"]},"lock":{"title":"lock","codes":[":lock:"]},"lock_with_ink_pen":{"title":"lock_with_ink_pen","codes":[":lock_with_ink_pen:"]},"closed_lock_with_key":{"title":"closed_lock_with_key","codes":[":closed_lock_with_key:"]},"key":{"title":"key","codes":[":key:"]},"bulb":{"title":"bulb","codes":[":bulb:"]},"flashlight":{"title":"flashlight","codes":[":flashlight:"]},"high_brightness":{"title":"high_brightness","codes":[":high_brightness:"]},"low_brightness":{"title":"low_brightness","codes":[":low_brightness:"]},"electric_plug":{"title":"electric_plug","codes":[":electric_plug:"]},"battery":{"title":"battery","codes":[":battery:"]},"calling":{"title":"calling","codes":[":calling:"]},"email":{"title":"email","codes":[":email:"]},"mailbox":{"title":"mailbox","codes":[":mailbox:"]},"postbox":{"title":"postbox","codes":[":postbox:"]},"bath":{"title":"bath","codes":[":bath:"]},"bathtub":{"title":"bathtub","codes":[":bathtub:"]},"shower":{"title":"shower","codes":[":shower:"]},"toilet":{"title":"toilet","codes":[":toilet:"]},"wrench":{"title":"wrench","codes":[":wrench:"]},"nut_and_bolt":{"title":"nut_and_bolt","codes":[":nut_and_bolt:"]},"hammer":{"title":"hammer","codes":[":hammer:"]},"seat":{"title":"seat","codes":[":seat:"]},"moneybag":{"title":"moneybag","codes":[":moneybag:"]},"yen":{"title":"yen","codes":[":yen:"]},"dollar":{"title":"dollar","codes":[":dollar:"]},"pound":{"title":"pound","codes":[":pound:"]},"euro":{"title":"euro","codes":[":euro:"]},"credit_card":{"title":"credit_card","codes":[":credit_card:"]},"money_with_wings":{"title":"money_with_wings","codes":[":money_with_wings:"]},"e-mail":{"title":"e-mail","codes":[":e-mail:"]},"inbox_tray":{"title":"inbox_tray","codes":[":inbox_tray:"]},"outbox_tray":{"title":"outbox_tray","codes":[":outbox_tray:"]},"envelope":{"title":"envelope","codes":[":envelope:"]},"incoming_envelope":{"title":"incoming_envelope","codes":[":incoming_envelope:"]},"postal_horn":{"title":"postal_horn","codes":[":postal_horn:"]},"mailbox_closed":{"title":"mailbox_closed","codes":[":mailbox_closed:"]},"mailbox_with_mail":{"title":"mailbox_with_mail","codes":[":mailbox_with_mail:"]},"mailbox_with_no_mail":{"title":"mailbox_with_no_mail","codes":[":mailbox_with_no_mail:"]},"door":{"title":"door","codes":[":door:"]},"smoking":{"title":"smoking","codes":[":smoking:"]},"bomb":{"title":"bomb","codes":[":bomb:"]},"gun":{"title":"gun","codes":[":gun:"]},"hocho":{"title":"hocho","codes":[":hocho:"]},"pill":{"title":"pill","codes":[":pill:"]},"syringe":{"title":"syringe","codes":[":syringe:"]},"page_facing_up":{"title":"page_facing_up","codes":[":page_facing_up:"]},"page_with_curl":{"title":"page_with_curl","codes":[":page_with_curl:"]},"bookmark_tabs":{"title":"bookmark_tabs","codes":[":bookmark_tabs:"]},"bar_chart":{"title":"bar_chart","codes":[":bar_chart:"]},"chart_with_upwards_trend":{"title":"chart_with_upwards_trend","codes":[":chart_with_upwards_trend:"]},"chart_with_downwards_trend":{"title":"chart_with_downwards_trend","codes":[":chart_with_downwards_trend:"]},"scroll":{"title":"scroll","codes":[":scroll:"]},"clipboard":{"title":"clipboard","codes":[":clipboard:"]},"calendar":{"title":"calendar","codes":[":calendar:"]},"date":{"title":"date","codes":[":date:"]},"card_index":{"title":"card_index","codes":[":card_index:"]},"file_folder":{"title":"file_folder","codes":[":file_folder:"]},"open_file_folder":{"title":"open_file_folder","codes":[":open_file_folder:"]},"scissors":{"title":"scissors","codes":[":scissors:"]},"pushpin":{"title":"pushpin","codes":[":pushpin:"]},"paperclip":{"title":"paperclip","codes":[":paperclip:"]},"black_nib":{"title":"black_nib","codes":[":black_nib:"]},"pencil2":{"title":"pencil2","codes":[":pencil2:"]},"straight_ruler":{"title":"straight_ruler","codes":[":straight_ruler:"]},"triangular_ruler":{"title":"triangular_ruler","codes":[":triangular_ruler:"]},"closed_book":{"title":"closed_book","codes":[":closed_book:"]},"green_book":{"title":"green_book","codes":[":green_book:"]},"blue_book":{"title":"blue_book","codes":[":blue_book:"]},"orange_book":{"title":"orange_book","codes":[":orange_book:"]},"notebook":{"title":"notebook","codes":[":notebook:"]},"notebook_with_decorative_cover":{"title":"notebook_with_decorative_cover","codes":[":notebook_with_decorative_cover:"]},"ledger":{"title":"ledger","codes":[":ledger:"]},"books":{"title":"books","codes":[":books:"]},"bookmark":{"title":"bookmark","codes":[":bookmark:"]},"name_badge":{"title":"name_badge","codes":[":name_badge:"]},"microscope":{"title":"microscope","codes":[":microscope:"]},"telescope":{"title":"telescope","codes":[":telescope:"]},"newspaper":{"title":"newspaper","codes":[":newspaper:"]},"football":{"title":"football","codes":[":football:"]},"basketball":{"title":"basketball","codes":[":basketball:"]},"soccer":{"title":"soccer","codes":[":soccer:"]},"baseball":{"title":"baseball","codes":[":baseball:"]},"tennis":{"title":"tennis","codes":[":tennis:"]},"eightball":{"title":"eightball","codes":[":8ball:"]},"rugby_football":{"title":"rugby_football","codes":[":rugby_football:"]},"bowling":{"title":"bowling","codes":[":bowling:"]},"golf":{"title":"golf","codes":[":golf:"]},"mountain_bicyclist":{"title":"mountain_bicyclist","codes":[":mountain_bicyclist:"]},"bicyclist":{"title":"bicyclist","codes":[":bicyclist:"]},"horse_racing":{"title":"horse_racing","codes":[":horse_racing:"]},"snowboarder":{"title":"snowboarder","codes":[":snowboarder:"]},"swimmer":{"title":"swimmer","codes":[":swimmer:"]},"surfer":{"title":"surfer","codes":[":surfer:"]},"ski":{"title":"ski","codes":[":ski:"]},"spades":{"title":"spades","codes":[":spades:"]},"hearts":{"title":"hearts","codes":[":hearts:"]},"clubs":{"title":"clubs","codes":[":clubs:"]},"diamonds":{"title":"diamonds","codes":[":diamonds:"]},"gem":{"title":"gem","codes":[":gem:"]},"ring":{"title":"ring","codes":[":ring:"]},"trophy":{"title":"trophy","codes":[":trophy:"]},"musical_score":{"title":"musical_score","codes":[":musical_score:"]},"musical_keyboard":{"title":"musical_keyboard","codes":[":musical_keyboard:"]},"violin":{"title":"violin","codes":[":violin:"]},"space_invader":{"title":"space_invader","codes":[":space_invader:"]},"video_game":{"title":"video_game","codes":[":video_game:"]},"black_joker":{"title":"black_joker","codes":[":black_joker:"]},"flower_playing_cards":{"title":"flower_playing_cards","codes":[":flower_playing_cards:"]},"game_die":{"title":"game_die","codes":[":game_die:"]},"dart":{"title":"dart","codes":[":dart:"]},"mahjong":{"title":"mahjong","codes":[":mahjong:"]},"clapper":{"title":"clapper","codes":[":clapper:"]},"memo":{"title":"memo","codes":[":memo:"]},"pencil":{"title":"pencil","codes":[":pencil:"]},"book":{"title":"book","codes":[":book:"]},"art":{"title":"art","codes":[":art:"]},"microphone":{"title":"microphone","codes":[":microphone:"]},"headphones":{"title":"headphones","codes":[":headphones:"]},"trumpet":{"title":"trumpet","codes":[":trumpet:"]},"saxophone":{"title":"saxophone","codes":[":saxophone:"]},"guitar":{"title":"guitar","codes":[":guitar:"]},"shoe":{"title":"shoe","codes":[":shoe:"]},"sandal":{"title":"sandal","codes":[":sandal:"]},"high_heel":{"title":"high_heel","codes":[":high_heel:"]},"lipstick":{"title":"lipstick","codes":[":lipstick:"]},"boot":{"title":"boot","codes":[":boot:"]},"shirt":{"title":"shirt","codes":[":shirt:"]},"tshirt":{"title":"tshirt","codes":[":tshirt:"]},"necktie":{"title":"necktie","codes":[":necktie:"]},"womans_clothes":{"title":"womans_clothes","codes":[":womans_clothes:"]},"dress":{"title":"dress","codes":[":dress:"]},"running_shirt_with_sash":{"title":"running_shirt_with_sash","codes":[":running_shirt_with_sash:"]},"jeans":{"title":"jeans","codes":[":jeans:"]},"kimono":{"title":"kimono","codes":[":kimono:"]},"bikini":{"title":"bikini","codes":[":bikini:"]},"ribbon":{"title":"ribbon","codes":[":ribbon:"]},"tophat":{"title":"tophat","codes":[":tophat:"]},"crown":{"title":"crown","codes":[":crown:"]},"womans_hat":{"title":"womans_hat","codes":[":womans_hat:"]},"mans_shoe":{"title":"mans_shoe","codes":[":mans_shoe:"]},"closed_umbrella":{"title":"closed_umbrella","codes":[":closed_umbrella:"]},"briefcase":{"title":"briefcase","codes":[":briefcase:"]},"handbag":{"title":"handbag","codes":[":handbag:"]},"pouch":{"title":"pouch","codes":[":pouch:"]},"purse":{"title":"purse","codes":[":purse:"]},"eyeglasses":{"title":"eyeglasses","codes":[":eyeglasses:"]},"fishing_pole_and_fish":{"title":"fishing_pole_and_fish","codes":[":fishing_pole_and_fish:"]},"coffee":{"title":"coffee","codes":[":coffee:"]},"tea":{"title":"tea","codes":[":tea:"]},"sake":{"title":"sake","codes":[":sake:"]},"baby_bottle":{"title":"baby_bottle","codes":[":baby_bottle:"]},"beer":{"title":"beer","codes":[":beer:"]},"beers":{"title":"beers","codes":[":beers:"]},"cocktail":{"title":"cocktail","codes":[":cocktail:"]},"tropical_drink":{"title":"tropical_drink","codes":[":tropical_drink:"]},"wine_glass":{"title":"wine_glass","codes":[":wine_glass:"]},"fork_and_knife":{"title":"fork_and_knife","codes":[":fork_and_knife:"]},"pizza":{"title":"pizza","codes":[":pizza:"]},"hamburger":{"title":"hamburger","codes":[":hamburger:"]},"fries":{"title":"fries","codes":[":fries:"]},"poultry_leg":{"title":"poultry_leg","codes":[":poultry_leg:"]},"meat_on_bone":{"title":"meat_on_bone","codes":[":meat_on_bone:"]},"spaghetti":{"title":"spaghetti","codes":[":spaghetti:"]},"curry":{"title":"curry","codes":[":curry:"]},"fried_shrimp":{"title":"fried_shrimp","codes":[":fried_shrimp:"]},"bento":{"title":"bento","codes":[":bento:"]},"sushi":{"title":"sushi","codes":[":sushi:"]},"fish_cake":{"title":"fish_cake","codes":[":fish_cake:"]},"rice_ball":{"title":"rice_ball","codes":[":rice_ball:"]},"rice_cracker":{"title":"rice_cracker","codes":[":rice_cracker:"]},"rice":{"title":"rice","codes":[":rice:"]},"ramen":{"title":"ramen","codes":[":ramen:"]},"stew":{"title":"stew","codes":[":stew:"]},"oden":{"title":"oden","codes":[":oden:"]},"dango":{"title":"dango","codes":[":dango:"]},"egg":{"title":"egg","codes":[":egg:"]},"bread":{"title":"bread","codes":[":bread:"]},"doughnut":{"title":"doughnut","codes":[":doughnut:"]},"custard":{"title":"custard","codes":[":custard:"]},"icecream":{"title":"icecream","codes":[":icecream:"]},"ice_cream":{"title":"ice_cream","codes":[":ice_cream:"]},"shaved_ice":{"title":"shaved_ice","codes":[":shaved_ice:"]},"birthday":{"title":"birthday","codes":[":birthday:"]},"cake":{"title":"cake","codes":[":cake:"]},"cookie":{"title":"cookie","codes":[":cookie:"]},"chocolate_bar":{"title":"chocolate_bar","codes":[":chocolate_bar:"]},"candy":{"title":"candy","codes":[":candy:"]},"lollipop":{"title":"lollipop","codes":[":lollipop:"]},"honey_pot":{"title":"honey_pot","codes":[":honey_pot:"]},"apple":{"title":"apple","codes":[":apple:"]},"green_apple":{"title":"green_apple","codes":[":green_apple:"]},"tangerine":{"title":"tangerine","codes":[":tangerine:"]},"lemon":{"title":"lemon","codes":[":lemon:"]},"cherries":{"title":"cherries","codes":[":cherries:"]},"grapes":{"title":"grapes","codes":[":grapes:"]},"watermelon":{"title":"watermelon","codes":[":watermelon:"]},"strawberry":{"title":"strawberry","codes":[":strawberry:"]},"peach":{"title":"peach","codes":[":peach:"]},"melon":{"title":"melon","codes":[":melon:"]},"banana":{"title":"banana","codes":[":banana:"]},"pear":{"title":"pear","codes":[":pear:"]},"pineapple":{"title":"pineapple","codes":[":pineapple:"]},"sweet_potato":{"title":"sweet_potato","codes":[":sweet_potato:"]},"eggplant":{"title":"eggplant","codes":[":eggplant:"]},"tomato":{"title":"tomato","codes":[":tomato:"]},"corn":{"title":"corn","codes":[":corn:"]},"one":{"title":"one","codes":[":one:"]},"two":{"title":"two","codes":[":two:"]},"three":{"title":"three","codes":[":three:"]},"four":{"title":"four","codes":[":four:"]},"five":{"title":"five","codes":[":five:"]},"six":{"title":"six","codes":[":six:"]},"seven":{"title":"seven","codes":[":seven:"]},"eight":{"title":"eight","codes":[":eight:"]},"nine":{"title":"nine","codes":[":nine:"]},"keycap_ten":{"title":"keycap_ten","codes":[":keycap_ten:"]},"onetwothreefour":{"title":"onetwothreefour","codes":[":1234:"]},"zero":{"title":"zero","codes":[":zero:"]},"hash":{"title":"hash","codes":[":hash:"]},"symbols":{"title":"symbols","codes":[":symbols:"]},"arrow_backward":{"title":"arrow_backward","codes":[":arrow_backward:"]},"arrow_down":{"title":"arrow_down","codes":[":arrow_down:"]},"arrow_forward":{"title":"arrow_forward","codes":[":arrow_forward:"]},"arrow_left":{"title":"arrow_left","codes":[":arrow_left:"]},"capital_abcd":{"title":"capital_abcd","codes":[":capital_abcd:"]},"abcd":{"title":"abcd","codes":[":abcd:"]},"abc":{"title":"abc","codes":[":abc:"]},"arrow_lower_left":{"title":"arrow_lower_left","codes":[":arrow_lower_left:"]},"arrow_lower_right":{"title":"arrow_lower_right","codes":[":arrow_lower_right:"]},"arrow_right":{"title":"arrow_right","codes":[":arrow_right:"]},"arrow_up":{"title":"arrow_up","codes":[":arrow_up:"]},"arrow_upper_left":{"title":"arrow_upper_left","codes":[":arrow_upper_left:"]},"arrow_upper_right":{"title":"arrow_upper_right","codes":[":arrow_upper_right:"]},"arrow_double_down":{"title":"arrow_double_down","codes":[":arrow_double_down:"]},"arrow_double_up":{"title":"arrow_double_up","codes":[":arrow_double_up:"]},"arrow_down_small":{"title":"arrow_down_small","codes":[":arrow_down_small:"]},"arrow_heading_down":{"title":"arrow_heading_down","codes":[":arrow_heading_down:"]},"arrow_heading_up":{"title":"arrow_heading_up","codes":[":arrow_heading_up:"]},"leftwards_arrow_with_hook":{"title":"leftwards_arrow_with_hook","codes":[":leftwards_arrow_with_hook:"]},"arrow_right_hook":{"title":"arrow_right_hook","codes":[":arrow_right_hook:"]},"left_right_arrow":{"title":"left_right_arrow","codes":[":left_right_arrow:"]},"arrow_up_down":{"title":"arrow_up_down","codes":[":arrow_up_down:"]},"arrow_up_small":{"title":"arrow_up_small","codes":[":arrow_up_small:"]},"arrows_clockwise":{"title":"arrows_clockwise","codes":[":arrows_clockwise:"]},"arrows_counterclockwise":{"title":"arrows_counterclockwise","codes":[":arrows_counterclockwise:"]},"rewind":{"title":"rewind","codes":[":rewind:"]},"fast_forward":{"title":"fast_forward","codes":[":fast_forward:"]},"information_source":{"title":"information_source","codes":[":information_source:"]},"ok":{"title":"ok","codes":[":ok:"]},"twisted_rightwards_arrows":{"title":"twisted_rightwards_arrows","codes":[":twisted_rightwards_arrows:"]},"repeat":{"title":"repeat","codes":[":repeat:"]},"repeat_one":{"title":"repeat_one","codes":[":repeat_one:"]},"new":{"title":"new","codes":[":new:"]},"top":{"title":"top","codes":[":top:"]},"up":{"title":"up","codes":[":up:"]},"cool":{"title":"cool","codes":[":cool:"]},"free":{"title":"free","codes":[":free:"]},"ng":{"title":"ng","codes":[":ng:"]},"cinema":{"title":"cinema","codes":[":cinema:"]},"koko":{"title":"koko","codes":[":koko:"]},"signal_strength":{"title":"signal_strength","codes":[":signal_strength:"]},"u5272":{"title":"u5272","codes":[":u5272:"]},"u5408":{"title":"u5408","codes":[":u5408:"]},"u55b6":{"title":"u55b6","codes":[":u55b6:"]},"u6307":{"title":"u6307","codes":[":u6307:"]},"u6708":{"title":"u6708","codes":[":u6708:"]},"u6709":{"title":"u6709","codes":[":u6709:"]},"u6e80":{"title":"u6e80","codes":[":u6e80:"]},"u7121":{"title":"u7121","codes":[":u7121:"]},"u7533":{"title":"u7533","codes":[":u7533:"]},"u7a7a":{"title":"u7a7a","codes":[":u7a7a:"]},"u7981":{"title":"u7981","codes":[":u7981:"]},"sa":{"title":"sa","codes":[":sa:"]},"restroom":{"title":"restroom","codes":[":restroom:"]},"mens":{"title":"mens","codes":[":mens:"]},"womens":{"title":"womens","codes":[":womens:"]},"baby_symbol":{"title":"baby_symbol","codes":[":baby_symbol:"]},"no_smoking":{"title":"no_smoking","codes":[":no_smoking:"]},"parking":{"title":"parking","codes":[":parking:"]},"wheelchair":{"title":"wheelchair","codes":[":wheelchair:"]},"metro":{"title":"metro","codes":[":metro:"]},"baggage_claim":{"title":"baggage_claim","codes":[":baggage_claim:"]},"accept":{"title":"accept","codes":[":accept:"]},"wc":{"title":"wc","codes":[":wc:"]},"potable_water":{"title":"potable_water","codes":[":potable_water:"]},"put_litter_in_its_place":{"title":"put_litter_in_its_place","codes":[":put_litter_in_its_place:"]},"secret":{"title":"secret","codes":[":secret:"]},"congratulations":{"title":"congratulations","codes":[":congratulations:"]},"m":{"title":"m","codes":[":m:"]},"passport_control":{"title":"passport_control","codes":[":passport_control:"]},"left_luggage":{"title":"left_luggage","codes":[":left_luggage:"]},"customs":{"title":"customs","codes":[":customs:"]},"ideograph_advantage":{"title":"ideograph_advantage","codes":[":ideograph_advantage:"]},"cl":{"title":"cl","codes":[":cl:"]},"sos":{"title":"sos","codes":[":sos:"]},"id":{"title":"id","codes":[":id:"]},"no_entry_sign":{"title":"no_entry_sign","codes":[":no_entry_sign:"]},"underage":{"title":"underage","codes":[":underage:"]},"no_mobile_phones":{"title":"no_mobile_phones","codes":[":no_mobile_phones:"]},"do_not_litter":{"title":"do_not_litter","codes":[":do_not_litter:"]},"non-potable_water":{"title":"non-potable_water","codes":[":non-potable_water:"]},"no_bicycles":{"title":"no_bicycles","codes":[":no_bicycles:"]},"no_pedestrians":{"title":"no_pedestrians","codes":[":no_pedestrians:"]},"children_crossing":{"title":"children_crossing","codes":[":children_crossing:"]},"no_entry":{"title":"no_entry","codes":[":no_entry:"]},"eight_spoked_asterisk":{"title":"eight_spoked_asterisk","codes":[":eight_spoked_asterisk:"]},"eight_pointed_black_star":{"title":"eight_pointed_black_star","codes":[":eight_pointed_black_star:"]},"heart_decoration":{"title":"heart_decoration","codes":[":heart_decoration:"]},"vs":{"title":"vs","codes":[":vs:"]},"vibration_mode":{"title":"vibration_mode","codes":[":vibration_mode:"]},"mobile_phone_off":{"title":"mobile_phone_off","codes":[":mobile_phone_off:"]},"chart":{"title":"chart","codes":[":chart:"]},"currency_exchange":{"title":"currency_exchange","codes":[":currency_exchange:"]},"aries":{"title":"aries","codes":[":aries:"]},"taurus":{"title":"taurus","codes":[":taurus:"]},"gemini":{"title":"gemini","codes":[":gemini:"]},"cancer":{"title":"cancer","codes":[":cancer:"]},"leo":{"title":"leo","codes":[":leo:"]},"virgo":{"title":"virgo","codes":[":virgo:"]},"libra":{"title":"libra","codes":[":libra:"]},"scorpius":{"title":"scorpius","codes":[":scorpius:"]},"sagittarius":{"title":"sagittarius","codes":[":sagittarius:"]},"capricorn":{"title":"capricorn","codes":[":capricorn:"]},"aquarius":{"title":"aquarius","codes":[":aquarius:"]},"pisces":{"title":"pisces","codes":[":pisces:"]},"ophiuchus":{"title":"ophiuchus","codes":[":ophiuchus:"]},"six_pointed_star":{"title":"six_pointed_star","codes":[":six_pointed_star:"]},"negative_squared_cross_mark":{"title":"negative_squared_cross_mark","codes":[":negative_squared_cross_mark:"]},"a":{"title":"a","codes":[":a:"]},"b":{"title":"b","codes":[":b:"]},"ab":{"title":"ab","codes":[":ab:"]},"o2":{"title":"o2","codes":[":o2:"]},"diamond_shape_with_a_dot_inside":{"title":"diamond_shape_with_a_dot_inside","codes":[":diamond_shape_with_a_dot_inside:"]},"recycle":{"title":"recycle","codes":[":recycle:"]},"end":{"title":"end","codes":[":end:"]},"on":{"title":"on","codes":[":on:"]},"soon":{"title":"soon","codes":[":soon:"]},"clock1":{"title":"clock1","codes":[":clock1:"]},"clock130":{"title":"clock130","codes":[":clock130:"]},"clock10":{"title":"clock10","codes":[":clock10:"]},"clock1030":{"title":"clock1030","codes":[":clock1030:"]},"clock11":{"title":"clock11","codes":[":clock11:"]},"clock1130":{"title":"clock1130","codes":[":clock1130:"]},"clock12":{"title":"clock12","codes":[":clock12:"]},"clock1230":{"title":"clock1230","codes":[":clock1230:"]},"clock2":{"title":"clock2","codes":[":clock2:"]},"clock230":{"title":"clock230","codes":[":clock230:"]},"clock3":{"title":"clock3","codes":[":clock3:"]},"clock330":{"title":"clock330","codes":[":clock330:"]},"clock4":{"title":"clock4","codes":[":clock4:"]},"clock430":{"title":"clock430","codes":[":clock430:"]},"clock5":{"title":"clock5","codes":[":clock5:"]},"clock530":{"title":"clock530","codes":[":clock530:"]},"clock6":{"title":"clock6","codes":[":clock6:"]},"clock630":{"title":"clock630","codes":[":clock630:"]},"clock7":{"title":"clock7","codes":[":clock7:"]},"clock730":{"title":"clock730","codes":[":clock730:"]},"clock8":{"title":"clock8","codes":[":clock8:"]},"clock830":{"title":"clock830","codes":[":clock830:"]},"clock9":{"title":"clock9","codes":[":clock9:"]},"clock930":{"title":"clock930","codes":[":clock930:"]},"heavy_dollar_sign":{"title":"heavy_dollar_sign","codes":[":heavy_dollar_sign:"]},"copyright":{"title":"copyright","codes":[":copyright:"]},"registered":{"title":"registered","codes":[":registered:"]},"tm":{"title":"tm","codes":[":tm:"]},"x":{"title":"x","codes":[":x:"]},"heavy_exclamation_mark":{"title":"heavy_exclamation_mark","codes":[":heavy_exclamation_mark:"]},"bangbang":{"title":"bangbang","codes":[":bangbang:"]},"interrobang":{"title":"interrobang","codes":[":interrobang:"]},"o":{"title":"o","codes":[":o:"]},"heavy_multiplication_x":{"title":"heavy_multiplication_x","codes":[":heavy_multiplication_x:"]},"heavy_plus_sign":{"title":"heavy_plus_sign","codes":[":heavy_plus_sign:"]},"heavy_minus_sign":{"title":"heavy_minus_sign","codes":[":heavy_minus_sign:"]},"heavy_division_sign":{"title":"heavy_division_sign","codes":[":heavy_division_sign:"]},"white_flower":{"title":"white_flower","codes":[":white_flower:"]},"onehundred":{"title":"onehundred","codes":[":100:"]},"heavy_check_mark":{"title":"heavy_check_mark","codes":[":heavy_check_mark:"]},"ballot_box_with_check":{"title":"ballot_box_with_check","codes":[":ballot_box_with_check:"]},"radio_button":{"title":"radio_button","codes":[":radio_button:"]},"link":{"title":"link","codes":[":link:"]},"curly_loop":{"title":"curly_loop","codes":[":curly_loop:"]},"wavy_dash":{"title":"wavy_dash","codes":[":wavy_dash:"]},"part_alternation_mark":{"title":"part_alternation_mark","codes":[":part_alternation_mark:"]},"trident":{"title":"trident","codes":[":trident:"]},"black_square":{"title":"black_square","codes":[":black_square:"]},"white_square":{"title":"white_square","codes":[":white_square:"]},"white_check_mark":{"title":"white_check_mark","codes":[":white_check_mark:"]},"black_square_button":{"title":"black_square_button","codes":[":black_square_button:"]},"white_square_button":{"title":"white_square_button","codes":[":white_square_button:"]},"black_circle":{"title":"black_circle","codes":[":black_circle:"]},"white_circle":{"title":"white_circle","codes":[":white_circle:"]},"red_circle":{"title":"red_circle","codes":[":red_circle:"]},"large_blue_circle":{"title":"large_blue_circle","codes":[":large_blue_circle:"]},"large_blue_diamond":{"title":"large_blue_diamond","codes":[":large_blue_diamond:"]},"large_orange_diamond":{"title":"large_orange_diamond","codes":[":large_orange_diamond:"]},"small_blue_diamond":{"title":"small_blue_diamond","codes":[":small_blue_diamond:"]},"small_orange_diamond":{"title":"small_orange_diamond","codes":[":small_orange_diamond:"]},"small_red_triangle":{"title":"small_red_triangle","codes":[":small_red_triangle:"]},"small_red_triangle_down":{"title":"small_red_triangle_down","codes":[":small_red_triangle_down:"]},"shipit":{"title":"shipit","codes":[":shipit:"]},"blush":{"title":"blush","codes":[":-*)",":*)"]},"scream":{"title":"scream","codes":[":-o",":o"]},"smirk":{"title":"smirk","codes":[":-]",":]",":-*]"]},"smiley":{"title":"smiley","codes":[":-*d",":)",":=)",":-)"]},"stuck_out_tongue_closed_eyes":{"title":"stuck_out_tongue_closed_eyes","codes":["xd"]},"stuck_out_tongue_winking_eye":{"title":"stuck_out_tongue_winking_eye","codes":[":-p",":p"]},"rage":{"title":"rage","codes":[":-[",":[",":rage:",":-@",":@"]},"disappointed":{"title":"disappointed","codes":[":-(",":("]},"sob":{"title":"sob","codes":[":’-(",":’(",":'-(",":'("]},"kissing_heart":{"title":"kissing_heart","codes":[":-*",":*",":-*"]},"wink":{"title":"wink","codes":[";-*)",";)",";-)"]},"pensive":{"title":"pensive","codes":[":-/"]},"confounded":{"title":"confounded","codes":[":-s",":s"]},"flushed":{"title":"flushed","codes":[":-|",":|"]},"relaxed":{"title":"relaxed","codes":[":-$",":$"]},"mask":{"title":"mask","codes":[":x",":-x"]},"heart":{"title":"heart","codes":["<3"]},"broken_heart":{"title":"broken_heart","codes":["</3","<\u0003"]}};

				Dubtrack.helpers.emoji.define(definition);
			},

			emoticons: {
			},

			codesMap: {
			},

			primaryCodesMap: {
			},
			
			regexp: {
			},

			metachars: /[[\]{}()*+?.\\|^$\-,&#\s]/g,

			entityMap: {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;',
				'/': '&#x2F;'
			},

			escape: function(string) {
				return String(string).replace(/[&<>"'\/]/g, function(s) {
					return entityMap[s];
				});
			},

			define: function(data) {
				var name, i, codes, code,
					patterns = [];

				for (name in data) {
					codes = data[name].codes;
					for (i in codes) {
						code = codes[i];
						Dubtrack.helpers.emoji.codesMap[code] = name;

						// Create escaped variants, because mostly you want to parse escaped
						// user text.
						Dubtrack.helpers.emoji.codesMap[escape(code)] = name;
						if (i === 0) {
							Dubtrack.helpers.emoji.primaryCodesMap[code] = name;
						}
					}
				}

				for (code in Dubtrack.helpers.emoji.codesMap) {
					patterns.push('(' + code.replace(Dubtrack.helpers.emoji.metachars, "\\$&") + ')');
				}

				Dubtrack.helpers.emoji.regexp = new RegExp(patterns.join('|'), 'g');
				Dubtrack.helpers.emoji.emoticons = data;
			},

			/**
			 * Replace emoticons in text.
			 *
			 * @param {String} text
			 * @param {Function} [fn] optional template builder function.
			 */
			replace: function(text, fn) {
				return text.replace(Dubtrack.helpers.emoji.regexp, function(code) {
					var name = Dubtrack.helpers.emoji.codesMap[code];
					return (fn || Dubtrack.helpers.emoji.tpl)(name, code, Dubtrack.helpers.emoji.emoticons[name].title);
				});
			},

			/**
			 * Get primary emoticons as html string in order to display them later as overview.
			 *
			 * @param {Function} [fn] optional template builder function.
			 * @return {String}
			 */
			toString: function(fn) {
				var code,
					str = '',
					name;

				for (code in Dubtrack.helpers.emoji.primaryCodesMap) {
					name = Dubtrack.helpers.emoji.primaryCodesMap[code];
					str += (fn || Dubtrack.helpers.emoji.exports.tpl)(name, code, Dubtrack.helpers.emoji.emoticons[name].title);
				}

				return str;
			},

			/**
			 * Build html string for emoticons.
			 *
			 * @param {String} name
			 * @param {String} code
			 * @param {String} title
			 * @return {String}
			 */
			tpl: function(name, code, title) {
				return '<span class="emojify ' + name + '" title="' + code + '"></span>';
			}
		}
	},
	
	app : null,  // main dubtrack	
	dubtrackPlayer : null // main dubtrack player
};