// --------------------------------------------------------------------

/**
 *	templates
 *
 */

Dubtrack.els.templates = {
	'messages' : {
		'message' : '<div class="image-container">' +
						'<%= image_str %>' +
					'</div>' +
					'<div class="message-content">' +
						'<h3><%- name %></h3>' +
						'<p><%- latest_message_str %></p>' +
					'</div>' +
					'<div class="message-time">' +
						'<%- latest_message %>' +
					'</div>',

		'messageItem' : '<figure class="media">' +
							'<%= Dubtrack.helpers.image.getImage(_user._id, _user.username) %>' +
						'</figure>' +
						'<div class="message-content">' +
							'<h3><%- _user.username %>: </h3>' +
							'<p><%= message %></p>' +
						'</div>' +
						'<div class="message-time">'+
							'<%- created %>' +
						'</div>'
	},
	'comments': {
		'commentsContainer': '<% if(Dubtrack.loggedIn) { %>' +
								'<section class="post-comment-container">' +
									'<figure>' +
										'<%= Dubtrack.helpers.image.getImage(Dubtrack.session.id, Dubtrack.session.username) %>' +
									'</figure>' +
									'<div class="comments-textarea-container">' +
										'<textarea placeholder="Leave a message..."></textarea>' +
										'<button>Post a comment</button>' +
									'</div>' +
								'</section>' +
							'<% } %>' +
							'<div class="comments-list">' +
							'</div>' +
							'<button class="comments-display-all">Display all comments</button>',

		'commentsItem': '<figure>' +
							'<%= Dubtrack.helpers.image.getImage(user._id, user.username) %>' +
						'</figure>' +
						'<div class="content">' +
							'<header>' +
								'<a href="#" class="username"><%- user.username %></a>' +
								'<i class="icon-dot"></i>' +
								'<time class="timeago" datetime="<%- date.toISOString() %>"><%- date.toLocaleString() %></time>' +
							'</header>' +
							'<div class="comment-content">' +
								'<p><%- comment %></p>' +
							'</div>' +
							'<div class="comment-dub">' +
								'<span class="comment-dubs-total">' +
									'<%- updubs - downdubs %>' +
								'</span>' +
								'<span class="icon-arrow-up">' +
								'</span>' +
								'<span>|</span>' +
								'<span class="icon-arrow-down">' +
								'</span>' +
								'<% if(Dubtrack.session && Dubtrack.session.id == userid) { %>' +
									'<a href="#" class="delete">delete</a>' +
								'<% } %>' +
							'</div>' +
						'</div>' +
						'<a href="#" class="icon-flag"></a>'
	},

	'search': {
		'searchRoom': '	<img src="' + Dubtrack.config.apiUrl + '/room/<%- _id %>/image/thumbnail-small" alt="" />' +
						'<span>' +
							'<%- name %>' +
						'</span>' +
						'<span class="count">' +
							'<%- activeUsers %> users' +
						'</span>',

		'searchUser': '	<%= Dubtrack.helpers.image.getImage(_id, username) %>' +
						'<span>' +
							'<%= username %>' +
						'</span>'

	},

	'profile': {
		'popover' : '<div class="usercontent">' +
						'</div>' +
						'<div class="global-actions">' +
							'<a href="#" class="send-pm-message" title="Send private message"><span class="icon-chat"></span></a>' +
							'<a href="#" class="chat-mention" title="Mention in chat">@</a>' +
						'</div>' +
						'<div class="actions">' +
							'<a href="#" class="kick">Kick</a>' +
							'<a href="#" class="ban">Ban for <input type="text" value="" maxlength="3" /> minutes</a>' +
							'<a href="#" class="mute">Mute</a>' +
							'<a href="#" class="unmute">Unmute</a>' +
							'<a href="#" class="setowner setrole" data-roleref="setOwnerUser">Set co-owner</a>' +
							'<a href="#" class="unsetowner unsetrole" data-roleref="setOwnerUser">Unset co-owner</a>' +
							'<a href="#" class="setmanager setrole" data-roleref="setManagerUser">Set manager</a>' +
							'<a href="#" class="unsetmanager unsetrole" data-roleref="setManagerUser">Unset manager</a>' +
							'<a href="#" class="setmod setrole" data-roleref="setModUser">Set mod</a>' +
							'<a href="#" class="unsetmod unsetrole" data-roleref="setModUser">Unset mod</a>' +
							'<a href="#" class="setvip setrole" data-roleref="setVIPUser">Set VIP</a>' +
							'<a href="#" class="unsetvip unsetrole" data-roleref="setVIPUser">Unset VIP</a>' +
							'<a href="#" class="setdj setrole" data-roleref="setDJUser">Set Resident DJ</a>' +
							'<a href="#" class="unsetdj unsetrole" data-roleref="setDJUser">Unset Resident DJ</a>' +
						'</div>',

		'popover_user': '<figure>' +
							'<img src="' + Dubtrack.config.apiUrl + '/user/<%- _id %>/image" alt="" />' +
						'</figure>' +
						'<header>' +
							'<h3><%- username %></h3>' +
							'<a href="/<%- username %>">View profile</a>' +
						'</header>',

		'profileSidebar': '<div id="profileSidebar">' +
								'<div id="activeRoom">' +
									/*'<% if(dj_details.active_room !== 0) { %>' +
										'<a href="#/join/<%- activeRoom.url_sh %>">' +
											dubtrack_lang.profile.activeRoom +
										'</a>' +
									'<% } %>' +*/
								'</div>' +
									'<ul id="userNotifications"></ul>' +
									'<div id="followersEl">' +
										'<span class="active followersCount">' +
											//'<%- follower_count %> ' +
											dubtrack_lang.profile.folowers +
										'</span>' +
										'<span class="followingCount">' +
											//'<%- following_count %> ' +
											dubtrack_lang.profile.folowing +
										'</span>' +
										'<div class="followingContainer">' +
											'<div class="avatarList clearfix avatarFollowing">' +
											'</div>' +
											'<div class="avatarList clearfix avatarFollower">' +
											'</div>' +
										'</div>' +
									'</div>' +
								'</div>' +
							'</div>',

		'profileView': '<div class="profileView">' +
							'<div class="rewindProfile"><a href="#"><span class="icon-close"></span></a></div>' +
							'<div class="infoProfile">' +
								'<h2>' +
									'<span class="usernameContainer"><%- username %></span>' +
									'<% if(Dubtrack.session && Dubtrack.session.id === _id) { %>' +
										'<div class="check_username_info"></div>' +
										'<span class="editUsername">edit <i class="icon-pencil"></i></span>' +
										'<span class="saveUsername">save <i class="icon-disk"></i></span>' +
										'<input type="text" name="dt_username" value="<%- username %>" maxlength="30" />' +
									'<% } %>' +
									/*'<span<% if(dj_details.active_room !== 0){%> class="online"<% } %>>' +
										'<i></i>' +
										'<b>' +
											'<% if(dj_details.active_room !== 0){ %>' +
												dubtrack_lang.profile.online +
											'<% } else { %>' +
												dubtrack_lang.profile.offline +
											'<% } %>' +
										'</b>' +
									'</span>' +*/
								'</h2>' +
								'<ul id="ulSocial"></ul>' +
								'<% if(Dubtrack.session && Dubtrack.session.id !== _id) { %>' +
									'<button class="follow follow-btn message">' +
										'<i class="icon-user"></i> ' +
										dubtrack_lang.profile.follow +
									'</button>' +
									'<button class="unfollow follow-btn message">' +
										dubtrack_lang.profile.unfollow +
									'</button>' +
								'<% } else { %>' +
									/*'<button href="/avatar/<%- _id %>/edit" class="message edit-btn navigate">' +
										dubtrack_lang.profile.edit +
									'</button>' +
									'<button class="navigate btn message">' +
										dubtrack_lang.avatar.upload +
										'<i class="icon-upload icon-white"></i>' +
									'</button>' +*/
								'<% } %>' +
							'</div>' +
							'<div class="header">' +
								'<div class="pictureContainer">' +
									'<% if(Dubtrack.session && Dubtrack.session.id === _id) { %>' +
										'<a class="updatePictureGif" href="#">Update your avatar</a>' +
									'<% } %>' +
									'<%= imgProfile %>' +
									/*'<span class="location">' +
										'<%- location %>' +
									'</span>' +*/
								'</div>' +
								'<div class="descriptionProfile">' +
									/*'<div class="content_bio bio<% if(dj_details.bio_short_display){ %> hidden<% } %>">' +
										'<%- dj_details.bio %>' +
										'<% if(dj_details.bio_short_display){ %>' +
											'<a href="#" class="readmore readlessLink">' +
												dubtrack_lang.profile.read_less +
											'</a>' +
										'<% } %>' +
									'</div>' +
									'<div class="content_bio bio_short<% if(!dj_details.bio_short_display){ %> hidden<% } %>">' +
										'<%- dj_details.bio_short %>' +
										'<a href="#" class="readmore readmoreLink">' +
											dubtrack_lang.profile.read_more +
										'</a>' +
									'</div>' +*/
								'</div>' +
								'<div class="contentMainProfile">' +
									'<span class="progress"></span>' +
									'<ul class="menu">' +
										'<li class="active feedEl">' +
											dubtrack_lang.profile.feed +
										'</li>' +
										'<li class="playlistEl">' +
											dubtrack_lang.profile.playlists +
										'</li>' +
										'<li class="musicEl">' +
											dubtrack_lang.profile.musicEvents +
										'</li>' +
									'</ul>' +
									'<div class="tabLoading">' +
										dubtrack_lang.global.loading +
									'</div>' +
									'<div class="contentTab" id="musicContent">' +
										//'<ul class="content-videos"></ul>' +
										'<div class="comingsoon">' +
											'coming soon' +
										'</div>' +
									'</div>' +
									'<div class="contentTab" id="feedContent">' +
										//'<a href="#" class="loadMoreWallPosts">' +
										//	dubtrack_lang.profile.loadmorewall +
										//'</a>' +
										'<div class="comingsoon">' +
											'coming soon' +
										'</div>' +
									'</div>' +
									'<div class="contentTab" id="playlistContent">' +
										'<div class="comingsoon">' +
											'coming soon' +
										'</div>' +
									'</div>' +
								'</div>' +
							'</div>' +
						'</div>',
	},

	'help': {
		'chat': '<div class="modal help" id="maindthelp">' +
					'<div class="modal-header">' +
						'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
						'<h3>' + dubtrack_lang.help.chat_commands + '</h3>' +
					'</div>' +
				'<div class="modal-body chat-mod-help clearfix">' +
					'<p class="clearfix">' +
						'<b>/skip</b>' +
						'<span>' + dubtrack_lang.help.skip + '</span>' +
					'</p>' +
					'<p class="clearfix">' +
						'<b>/kick @username</b>' +
						'<span>' + dubtrack_lang.help.kick + '</span>' +
						'<b>/kick @username||#</b>' +
						'<span>' + dubtrack_lang.help.kick_time + '</span>' +
						'<b>/ban @username</b>' +
						'<span>' + dubtrack_lang.help.ban + '</span>' +
					'</p>' +
					'<p class="clearfix">' +
						'<b>/setmod @username</b>' +
						'<span>' + dubtrack_lang.help.set_mod + '</span>' +
						'<b>/removemod @username</b>' +
						'<span>' + dubtrack_lang.help.remove_mod + '</span>' +
					'</p>' +
					'<p class="clearfix">' +
						'<b>/setdjcount #</b>' +
						'<span>' + dubtrack_lang.help.set_dj_count + '</span>' +
						'<b>/setdj @username</b>' +
						'<span>' + dubtrack_lang.help.set_dj + '</span>' +
						'<b>/removedj @username</b>' +
						'<span>' + dubtrack_lang.help.remove_dj + '</span>' +
					'</p>' +
				'</div>' +
				'<div class="modal-footer">' +
					'<a href="#" class="btn btn-close">' + dubtrack_lang.help.close + '</a>' +
				'</div>'
	},

	'rooms': {
		'roomFormUpdate': '	<form class="form-horizontal">'+
								'<span class="closebtn">close</span>' +
								'<div class="modal-header mainForm">' +
									'<h3>' + dubtrack_lang.roomForm.formLabel + '</h3>' +
								'</div>' +
								'<div class="mid">' +
									'<div class="control-group">' +
										'<label class="control-label" for="">' +
											dubtrack_lang.roomForm.roomNameLabel +
										'</label>' +
										'<div class="controls">' +
											'<input class="input" name="name" id="roomName" placeholder="' + dubtrack_lang.roomForm.roomNameLabel + '" type="text" value="<%- name %>" maxlength="100">' +
										'</div>' +
									'</div>' +
									/*'<div class="control-group">' +
										'<label class="control-label" for="">' +
											'Room url' +
										'</label>' +
										'<div class="controls">' +
											'<span class="label_description">dubtrack.fm/join/<%- roomUrl %></span>' +
											'<input class="input" name="newUrl" placeholder="Room url" type="text" value="<%- roomUrl %>">' +
										'</div>' +
									'</div>' +
									'<div class="control-group">' +
										'<label class="control-label">' +
											dubtrack_lang.roomForm.maxSongLabel +
										'</label>' +
										'<div class="controls">' +
											'<p class="help-block">' +
												dubtrack_lang.roomForm.maxSongLabelDes +
											'</p>' +
											'<input class="input-small" id="maxLengthSongName" name="max_length_song" placeholder"' + dubtrack_lang.roomForm.maxSongLabel + '" type="text" value="<%- maxLengthSong %>">' +
										'</div>' +
									'</div>' +*/
									'<div class="control-group" id="background-room-update">' +
										'<label class="control-label display-block">' +
											'Room background' +
										'</label>' +
										'<div class="controls">' +
											'<input id="fileupload" type="file" name="room_bg">' +
											'<div id="progress"><div class="bar" style="width: 0%;"></div></div>' +
										'</div>' +
									'</div>' +
									/*'<div class="mid larger control-group">' +
										'<label class="control-label">' +
											dubtrack_lang.roomForm.roomDescLabel +
										'</label>' +
										'<div class="controls textarea">' +
											'<textarea class="textarea" name="description" placeholder="' + dubtrack_lang.roomForm.roomDesc + '">' +
												'<%- description %>' +
											'</textarea>' +
										'</div>' +
									'</div>' +*/
									'<div class="control-group">' +
										'<label class="control-label display-block">' +
											'Room Type' +
										'</label>' +
										'<div class="controls textarea">' +
											'<select name="roomType" id="roomTypeSelect">' +
												'<option value="room"<% if(roomType && roomType == "room"){%> selected<%}%>>Dubtrack</option>' +
												'<option value="iframe"<% if(roomType && roomType == "iframe"){%> selected<%}%>>Iframe Embed</option>' +
											'</select>' +
										'</div>' +
										'<label class="control-label display-block">' +
											'Lock queue' +
										'</label>' +
										'<div class="controls textarea">' +
											'<select name="lockQueue" id="lockQueueSelect">' +
												'<option value="1"<% if(lockQueue){%> selected<%}%>>Yes</option>' +
												'<option value="0"<% if(!lockQueue){%> selected<%}%>>No</option>' +
											'</select>' +
										'</div>' +
									'</div>' +
									'<div class="control-group" id="iframeEmbedField">' +
										'<label class="control-label">' +
											'Iframe embed url (src value in your embed code)' +
										'</label>' +
										'<div class="controls textarea">' +
											'<textarea class="textarea" name="roomEmbed" id="roomEmbedInput" placeholder="Iframe embed url (src value in your embed code)">' +
												'<%- roomEmbed %>' +
											'</textarea>' +
										'</div>' +
										'<div id="iframe-embed-preview">' +
										'</div>' +
									'</div>' +
								'</div>' +
								'<div class="modal-footer mainForm">' +
									'<button class="btn cancel">' +
										dubtrack_lang.profile.cancel +
									'</button>' +
									'<button class="btn btn-primary" data-loading-text="' + dubtrack_lang.global.loading + '">' +
										dubtrack_lang.roomForm.save +
									'</button>' +
								'</div>' +
							'</form>',

		'roomListItem': '<a class="join" href="/join/<%- roomUrl %>">' +
							'<span>' + dubtrack_lang.room.tune_in + '</span>' +
						'</a>' +
						'<figure class="roomImage">' +
							'<% if(currentSong && currentSong.songid){ %>' +
								'<img src="' + Dubtrack.config.apiUrl + '/song/<%- currentSong.songid %>/image/large" alt="" />' +
							'<% } else { %>' +
								'<img src="' + Dubtrack.config.apiUrl + '/room/<%- _id %>/image/thumbnail" alt="" />' +
							'<% } %>' +
						'</figure>' +
						'<div class="user-count">' +
							'<% if(activeUsers) { %>' +
								'<%- activeUsers %>' +
							'<% } %>' +
						'</div>' +
						'<header>' +
							'<div class="description">' +
								'<span class="name"><%- name %></span>' +
								'<span class="current-song">' +
									'<% if(currentSong && currentSong.name){ %>' +
										'<%- currentSong.name %></span>' +
									'<% } else { %>' +
										'&nbsp;' +
									'<% } %>' +
							'</div>' +
							'<div class="user-info">' +
								'<figure></figure>' +
								'<div class="room-user">' +
									dubtrack_lang.room.hosted_by +
									'<a href="/<%- userid %>" class="navigate"></a>' +
								'</div>' +
							'</div>' +
						'</header>',

		'avatarsContainer': '<div class="loadingAva">' +
								dubtrack_lang.global.loading +
							'</div>' +
							'<div class="avatar_tools">' +
								'<div class="currentBar"></div>' +
								'<a href="#" class="loadRoomAva">' +
									dubtrack_lang.room.avatar_room +
								'</a>' +
								'<div class="input-room-users-search">' +
									'<label for="global-search"><i class="icon-search"></i></label>' +
									'<input type="text" name="room-users-search" placeholder="Filter room users">' +
								'</div>' +
							'</div>' +
							'<div class="tabsContainer">' +
								'<div class="tabItem" id="main-user-list-room">' +
									'<ul class="avatar-list" id="avatar-list"></ul>' +
								'</div>' +
							'</div>',

		'avatarsContainerItem':'<p class="username">' +
								'</p>' + '<p>-</p>' +
								'<p class="dubs">' +
									'<span><%- dubs %> </span>' +
									' dubs' +
								'</p>',
	},

	'chat': {
		'chatContainer': //'	<a href="#" class="chat-commands">?</a>' +
							'<div class="chat_tools">' +
								'<button class="clearChatToggle">Clear Chat</button>' +
								'<button class="hideImagesToggle">Hide Images</button>' +
								'<span class="room-user-counter"></span>' +
								'<a class="chatSound" href="#">' +
									dubtrack_lang.chat.sound_on +
									'<i class="icon-volume-up"></i>' +
								'</a>' +
							'</div>' +
							'<div class="chat-container">' +
								'<div class="chatLoading">' + dubtrack_lang.chat.loadingHistory + '</div>' +
								'<div class="hidden" id="sound-notification"></div>' +
								'<div class="chat-messages">' +
									'<ul class="chat-main">' +
									'</ul>' +
								'</div>' +
								'<div class="pusher-chat-widget-input">' +
									'<div id="new-messages-counter"><span class="messages-display"></span> <i class="icon-arrow-down2"></i>' +
									'</div>' +
									'<% if(Dubtrack.loggedIn) { %>' +
										'<input id="chat-txt-message" name="message" type="text" placeholder= "'+ dubtrack_lang.chat.type_message +'" autocomplete="off" maxlength="140">' +
										'<span class="icon-camera"></span>' +
										'<button class= "pusher-chat-widget-send-btn">' +
											'<span class="icon-arrow-right2"></span>' +
										'</button>' +
									'<% } else { %>' +
										'<div class="chatLogin">' +
											dubtrack_lang.chat.login_message +
										'</div>' +
									'<% } %>' +
								'</div>' +
							'</div>',

		'chatMessage': '<div class="stream-item-content">'+
							'<div class="chatDelete" onclick="$(this).closest(\'li\').remove();"><span class="icon-close"></span></div>' +
							'<div class="image_row">' +
								'<%= Dubtrack.helpers.image.getImage(user._id, user.username, false, true) %>' +
							'</div>' +
							'<div class="activity-row">' +
								'<div class="text">' +
									'<p><a href="#" class="username"><%- user.username %>:</a> <%= message %></p>' +
								'</div>' +
								'<div class="meta-info">' +
									'<span class="username">' +
										'<%- user.username %> ' +
									'</span>' +
									'<i class="icon-dot"></i>' +
									'<span class="timeinfo">' +
									'</span>' +
								'</div>' +
							'</div>' +
						'</div>'
	},

	'playlist': {
		'previewContainer' : '<div class="close"><span class="icon-close"></span></div><div class="playerDubContainer"></div><div class="comments-container"></div>',

		'playlistContainer': '	<div class="create-playlist-input">' +
									'<input type="text" placeholder="' + dubtrack_lang.playlist.create + '" class="playlist-input" id="playlist-input" maxlength="50" />' +
									'<span class="icon-plus"></span>' +
								'</div>' +
								'<ul class="playlist-list-action"></ul>',

		'playlistBrowser': '<div class="add_to_queue">' +
								dubtrack_lang.playlist.queuePlaylist +
							'</div>' +
							'<div class="delete">' +
								dubtrack_lang.playlist.deletePlaylist +
							'</div>' +
							'<%- name %>' +
							'<p>' +
								'&nbsp;' +
								//'<%- total %> ' +
								//dubtrack_lang.playlist.tunes +
							'</p>',

		'playlistInfo': '<a href="#" class="shuffle-playlist tt-wrapper">Shuffle</a>' +
						'<a href="#" class="playlist_type tt-wrapper"></a>' +
						'<input type="text" class="playlist_filter" placeholder="' + dubtrack_lang.playlist.filter + '" value="" />',

		'playlistSearchItem': '	<span class="display-error">' +
								'</span>' +
								'<span class="display-success">' +
								'</span>' +
								'<span class="timeDisplay">' +
									'<%- minute %>' +
									':' +
									'<%- second %>' +
								'</span>' +
								'<figure>' +
									'<% if(images.thumbnail) {%>' +
										'<img src="<%- images.thumbnail %>" alt="" />' +
									'<% } else {%>' +
										'<img src="' + Dubtrack.config.urls.mediaBaseUrl + '/assets/images/media/pic_notfound.jpg" alt="" />' +
									'<% } %>' +
								'</figure>' +
								'<div class="description">' +
									'<h2><%- name %></h2>' +
									'<p>' +
										'<span class="preview">' +
											dubtrack_lang.playlist.preview +
										'</span>' +
									'</p>' +
								'</div>' +
								'<div class="actions">' +
									'<a href="#" class="set_song_to_top_queue">' +
										'<span class="icon-arrow-up"></span>' +
										'move to top' +
									'</a>' +
									'<a href="#" class="img_bg add_to_queue">' +
										'<span class="icon-play-circle"></span>' +
										dubtrack_lang.playlist.addToQueue +
										Dubtrack.config.loadingEls +
									'</a>' +
									'<a class="img_bg add_to_playlist" href="#">' +
										'<span class="icon-plus-alt"></span>' +
										dubtrack_lang.playlist.addToPlaylist +
										Dubtrack.config.loadingEls +
									'</a>' +
									'<a href="#" class="img_bg remove_icon">' +
										'<span class="icon-trashcan"></span>' +
										dubtrack_lang.playlist.removePlaylist +
									'</a>' +
								'</div>',

		'playlistHistoryItem': '<span class="display-error">' +
								'</span>' +
								'<span class="timeDisplay">' +
									'<%- minute %>' +
									':' +
									'<%- second %>' +
								'</span>' +
								'<figure>' +
									'<% if(images.thumbnail) {%>' +
										'<img src="<%- images.thumbnail %>" alt="" />' +
									'<% } else {%>' +
										'<img src="' + Dubtrack.config.urls.mediaBaseUrl + '/assets/images/media/pic_notfound.jpg" alt="" />' +
									'<% } %>' +
								'</figure>' +
								'<div class="description">' +
									'<h2><%- name %></h2>' +
									'<p>' +
										'<span class="preview">' +
											dubtrack_lang.playlist.preview +
										'</span>' +
										'<span class="playedby">Played by <b><%- _user.username %></b></span>' +
										'<span class="dubs-display">updubs <b><%- updubs %></b>  |  downdubs <b><%- downdubs %></b></span>' +
									'</p>' +
								'</div>' +
								'<div class="actions">' +
									'<a href="#" class="img_bg add_to_queue">' +
										'<span class="icon-play-circle"></span>' +
										dubtrack_lang.playlist.addToQueue +
										Dubtrack.config.loadingEls +
									'</a>' +
									'<a class="img_bg add_to_playlist" href="#">' +
										'<span class="icon-plus-alt"></span>' +
										dubtrack_lang.playlist.addToPlaylist +
										Dubtrack.config.loadingEls +
									'</a>' +
									'<a href="#" class="img_bg remove_icon">' +
										'<span class="icon-trashcan"></span>' +
										dubtrack_lang.playlist.removePlaylist +
									'</a>' +
								'</div>',

		'playlistRoomQueueItem': '<span class="display-error">' +
								'</span>' +
								'<span class="timeDisplay">' +
									'<%- minute %>' +
									':' +
									'<%- second %>' +
								'</span>' +
								'<figure>' +
									'<% if(images.thumbnail) {%>' +
										'<img src="<%- images.thumbnail %>" alt="" />' +
									'<% } else {%>' +
										'<img src="' + Dubtrack.config.urls.mediaBaseUrl + '/assets/images/media/pic_notfound.jpg" alt="" />' +
									'<% } %>' +
								'</figure>' +
								'<div class="description">' +
									'<h2><%- name %></h2>' +
									'<p>' +
										'<span class="preview">' +
											dubtrack_lang.playlist.preview +
										'</span>' +
										'<span class="playedby">Queued by <b><%- _user.username %></b></span>' +
									'</p>' +
								'</div>' +
								'<div class="actions">' +
									'<a href="#" class="set_song_to_top_queue">' +
										'<span class="icon-arrow-up"></span>' +
										'move to top' +
									'</a>' +
									'<a href="#" class="img_bg remove_dj">' +
										'<span class="icon-trashcan"></span>' +
										'Remove DJ from queue' +
										Dubtrack.config.loadingEls +
									'</a>' +
									'<a class="img_bg add_to_playlist" href="#">' +
										'<span class="icon-plus-alt"></span>' +
										dubtrack_lang.playlist.addToPlaylist +
										Dubtrack.config.loadingEls +
									'</a>' +
								'</div>',
	},

	'layout': {
		'header': '<div id="header_login">' +
						'<a href="/login" id="login-link">LOGIN</a>' +
						' | ' +
						'<a href="/signup" id="signup-link">CREATE ACCOUNT</a>' +
					'</div>' +
					'<ul class="main-menu">' +
						'<li class="menu-expand">' +
							'<button>' +
								'<span class="icon-menu"></span>' +
								'<menu>' +
									'<div class="mainbg">' +
										'<a href="/lobby" class="navigate">' +
											'<span>' +
												dubtrack_lang.titles.lobby +
											'</span>' +
										'</a>' +
										//'<a href="/" onclick="Dubtrack.app.help();return false;">' + dubtrack_lang.menu.help + '</a>' +
										'<span>' +
											dubtrack_lang.titles.topdubs + ' (soon)' +
										'</span>' +
									'</div>' +
								'</menu>' +
							'</button>' +
						'</li>' +
						'<li>' +
							'<div class="room-user" id="create-room-div">' +
								'<button>' +
									'<span class="create-room">' + dubtrack_lang.room.create + '</span>' +
									'<span class="icon-plus-alt"></span>' +
								'</button>' +
							'</div>' +
							'<div class="room-user" id="edit-room-div">' +
								'<button>' +
									'<span class="edit-room">Edit Room</span>' +
									'<span class="icon-pencil"></span>' +
								'</button>' +
							'</div>' +
						'</li>' +
						'<li class="global-search-header">' +
							'<label for="global-search">' +
								'<i class="icon-search"></i>' +
							'</label>' +
							'<input type="text" name="global-search" id="global-search" />' +
							'<div class="search-results">' +
								'<h3>Rooms</h3>' +
								'<div class="search-results-rooms">' +
								'</div>' +
								'<h3>Users</h3>' +
								'<div class="search-results-users">' +
								'</div>' +
							'</div>' +
						'</li>' +
					'</ul>' +
					'<div class="nav-collapse collapse user-info">' +
						'<% if(Dubtrack.loggedIn) {%>' +
							'<ul class="user-header-menu">' +
								'<li class="user-messages">' +
									'<span class="message-counter"></span>' +
									'<button class="user-messages-button">' +
										'<span class="icon-chat2"></span>' +
									'</button>' +
								'</li>' +
								'<li>' +
									'<button class="user-info-button">' +
										'<figure class="user-image">' +
											'<%= Dubtrack.helpers.image.getImage(_id, username) %>' +
										'</figure>' +
										'<span>' +
											'<%- username %>' +
										'</span>' +
									'</button>' +
								'</li>' +
								/*'<li>' +
									'<button class="notifications">' +
										'<span class="counter">0</span>' +
									'</button>' +
								'</li>' +
								'<li>' +
									'<button class="friends">' +
										'<span class="icon-users"></span>' +
									'</button>' +
								'</li>' +*/
								'<li class="logout">' +
									'<button>' +
										'<span>logout</span>' +
									'</button>' +
								'</li>' +
							'</ul>' +
						'<% } %>' +
						/*'<ul class="headerSocial">' +
							'<li>' +
								'<iframe src="//www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fdubtrackfm&amp;send=false&amp;layout=button_count&amp;width=100&amp;show_faces=false&amp;font=lucida+grande&amp;colorscheme=dark&amp;action=like&amp;height=21&amp;appId=125265434264584" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:100px; height:21px;" allowTransparency="true"></iframe>' +
							'</li>' +
							'<li>' +
								'<a href="https://twitter.com/dubtrack_fm" class="twitter-follow-button" data-show-count="false" data-show-screen-name="false">Follow @dubtrack_fm</a>' +
							'</li>' +
						'</ul>' +*/
					'</div>',

		'browser': '<div class="browser-content">'+
						'<div class="browser-content-header">' +
							'<div class="form">' +
								'<a href="#" class="br-btn youtube" id="youtube-btn">' +
									'<span class="icon-youtube"></span>' +
								'</a>' +
								'<a href="#" class="br-btn active soundcloud-btn" id="soundcloud-btn">' +
									'<span class="icon-soundcloud"></span>' +
								'</a>' +
								'<a href="#" class="br-btn dubtrack-btn" id="dubtrack-btn">' +
									'<span></span>' +
								'</a>' +
								'<input type="text" class="placeholder" name="youtube-search" id="youtube-search" value="" placeholder="' + dubtrack_lang.global.search + '" />' +
								'<a href="#" class="search-btn">' +
									'<span class="icon-arrow-right2"></span>' +
								'</a>' +
							'</div>' +
							'<a href="#" class="close">' +
								'<span class="icon-remove-circle"></span>' +
							'</a>' +
						'</div>' +
						'<div class="browser-content-main">' +
							'<div class="sidebar">' +
								'<div id="room-lock-queue">Lock queue</div>' +
								'<div id="queue-next"></div>' +
									'<span class="title">' + dubtrack_lang.player.playlists + '</span>' +
									'<div id="playlists-scroll">' +
										'<ul class="playlist-style">' +
											'<li class="current_queue">' + dubtrack_lang.playlist.your_queue + '<span class="clear-queue delete">clear</span></li>' +
											'<li class="current_room_queue">' + dubtrack_lang.playlist.room_queue + '</li>' +
											//'<li class="my_tracks">' + dubtrack_lang.playlist.my_tracks + '</li>' +
										'</ul>' +
									'<div>' +
									'<div class="create-playlist">' +
										'<input type="text" placeholder="' + dubtrack_lang.playlist.create + '" maxlength="100" />' +
										'<span class="icon-plus"></span>' +
									'</div>' +
									'<ul class="playlist-style playlist-list"></ul>' +
								'</div>' +
							'</div>' +
						'</div>' +
						'<div class="nano">' +
							'<div class="content-videos">' +
								'<div class="result-videos">' +
									'<div class="loading">' + dubtrack_lang.global.loading + '</div>' +
									'<div class="queue-management">' +
										'<div class="clear-queue clear-queue-browser-bth">Clear my queue</div>' +
										'<div class="pause-queue pause-queue-browser-bth">Pause my queue</div>' +
									'</div>' +
									'<div id="results_video_api">' +
										'<ul></ul>' +
									'</div>' +
									'<div class="back-fill"></div>' +
								'</div>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>',

		'playerController': '<div class="right">'+
								'<ul>' +
									'<% if(Dubtrack.loggedIn) {%>' +
										'<li class="add-to-playlist remove-if-banned remove-if-iframe">' +
											'<a href="#">' +
												'<span></span>' +
											'</a>' +
										'</li>' +
									'<% } %>' +
									'<li class="remove-if-banned remove-if-iframe">' +
										'<a class="dubup">' +
											'<span class="icon-arrow-up"></span>' +
										'</a>' +
									'</li>' +
									'<li class="remove-if-iframe">' +
										'<a id="maindubtotal" class="dubstotal">0</a>' +
									'</li>' +
									'<li class="remove-if-banned remove-if-iframe">' +
										'<a class="dubdown">' +
											'<span class="icon-arrow-down"></span>' +
										'</a>' +
									'</li>' +
									'<li class="copy">' +
										'<span>&copy; 2015. DUBTRACK.FM</span>' +
									'</li>' +
								'</ul>' +
							'</div>' +
							'<div class="left">' +
								'<div class="custom-embed-info">Custom embed channel</div>' +
								'<ul>' +
									'<% if(Dubtrack.loggedIn) {%>' +
										'<li class="remove-if-banned remove-if-iframe">' +
											'<a class="playbtn navigate" href="/browser/queue">' +
												'<span class="queue-info"></span>' +
												'<span class="icon-play"></span>' +
											'</a>' +
										'</li>' +
									'<% } %>' +
									'<li class="noanim volume remove-if-iframe">' +
										'<div id="volume-div"></div>' +
									'</li>' +
									'<% if(Dubtrack.loggedIn) {%>'+
										'<li class="playlist remove-if-banned">' +
											'<a href="/browser" class="navigate">' +
												'<span class="icon-list"></span>' +
											'</a>' +
										'</li>' +
										'<li class="history remove-if-banned">' +
											'<a href="/browser/history" class="navigate">' +
												'<span class="icon-history"></span>' +
											'</a>' +
										'</li>' +
									'<% } %>' +
									'<li class="imgEl"></li>' +
									'<li class="infoContainer">' +
										'<div class="progressBg"></div>' +
										'<span class="currentSong">' +
											dubtrack_lang.player.joinRoom +
										'</span>' +
										'<div class="currentTime">' +
											'<span class="min"></span>' +
											':' +
											'<span class="sec"></span>' +
										'</div>' +
									'</li>' +
								'</ul>' +
							'</div>',
	}
};


Backbone.Collection.prototype.parse = Dubtrack.helpers.parse;

Backbone.Model.prototype.idAttribute = '_id';

Backbone.Model.prototype.initialize = function(){
	$.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
		options.crossDomain ={
			crossDomain: true
		};
		options.xhrFields = {
			withCredentials: true
		};
	});
};

Backbone.View.prototype.close = function () {
	console.log('Closing view ' + this);
	if (this.beforeClose) {
		this.beforeClose();
	}
	this.remove();
	this.unbind();

	return false;
};
