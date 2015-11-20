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
							'<a href="#" class="setresdj setrole" data-roleref="setDJUser">Set Resident DJ</a>' +
							'<a href="#" class="unsetresdj unsetrole" data-roleref="setDJUser">Unset Resident DJ</a>' +
							'<a href="#" class="setdj setrole" data-roleref="setRoomDJUser">Set DJ</a>' +
							'<a href="#" class="unsetdj unsetrole" data-roleref="setRoomDJUser">Unset DJ</a>' +
						'</div>',

		'popover_user': '<figure>' +
							'<img src="' + Dubtrack.config.apiUrl + '/user/<%- _id %>/image" alt="" />' +
						'</figure>' +
						'<header>' +
							'<h3><%- username %></h3>' +
							'<span class="dubs"></span>' +
						'</header>',

		'profileSidebar': '<div id="profileSidebar">' +
									'<div id="followersEl">' +
										'<div class="followingContainer">' +
											'<div class="followers-counter">' +
												'Followers' +
												'<span class="total-followers">' +
												'</span>' +
											'</div>' +
											'<ul class="avatarList clearfix avatarFollower">' +
											'</ul>' +
										'</div>' +
									'</div>' +
								'</div>',

		'profileView': '<div class="profileWrapper">' +
							'<div class="profileView">' +
								'<div class="rewindProfile"><a href="#"><span class="icon-close"></span></a></div>' +
								'<div class="header">' +
									'<div class="pictureContainer">' +
										'<% if(Dubtrack.session && Dubtrack.session.id === _id) { %>' +
											'<a class="updatePictureGif" href="#"><span class="icon-camera"></span></a>' +
										'<% } %>' +
										'<%= imgProfile %>' +
									'</div>' +
									'<div class="descriptionProfile">' +
									'</div>' +
								'</div>' +
								'<div class="infoProfile">' +
									'<h2>' +
										'<span class="usernameContainer"><%- username %></span>' +
										'<% if(Dubtrack.session && Dubtrack.session.id === _id) { %>' +
											'<input type="text" name="dt_username" value="<%- username %>" maxlength="30" />' +
											'<div class="check_username_info"></div>' +
											'<span class="edit-btn editUsername">edit</span>' +
											'<span class="edit-btn saveUsername">save</span>' +
											'<span class="edit-btn cancelUsername">cancel</span>' +
										'<% } %>' +
									'</h2>' +
									'<% if(Dubtrack.session && Dubtrack.session.id !== _id) { %>' +
										'<button class="follow follow-btn message">' +
											'<i class="icon-user"></i> ' +
											dubtrack_lang.profile.follow +
										'</button>' +
										'<button class="unfollow follow-btn message">' +
											dubtrack_lang.profile.unfollow +
										'</button>' +
									'<% } %>' +
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
		'roomModalView' : '<div class="room-info-display-container">' +
									'<h2><%- name %><span>hosted by <i><%- _user.username %></i></span></h2>' +
									'<div class="description">' +
										'<%= description %>' +
									'</div>' +
								'</div>',

		'roomFormUpdate': '	<form class="form-horizontal">'+
								'<span class="closebtn icon-close"></span>' +
								'<div class="modal-header mainForm">' +
									'<h3>' + dubtrack_lang.roomForm.formLabel + '</h3>' +
								'</div>' +
								'<div class="mid">' +
									'<div class="control-group">' +
										'<label class="control-label display-block">' +
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
									'<div class="larger control-group">' +
										'<label class="control-label display-block">' +
											dubtrack_lang.roomForm.roomDescLabel +
										'</label>' +
										'<div class="controls textarea">' +
											'<textarea class="textarea" id="roomDescription" name="description" placeholder="' + dubtrack_lang.roomForm.roomDesc + '" maxlength="1000">' +
												'<%- description %>' +
											'</textarea>' +
										'</div>' +
									'</div>' +
									'<div class="larger control-group">' +
										'<label class="control-label display-block">' +
											'Welcome message (you can use {username} and {roomname} as variables :])' +
										'</label>' +
										'<div class="controls textarea">' +
											'<textarea class="textarea mid-textarea" id="welcomeMessage" name="welcomeMessage" placeholder="Welcome message" maxlength="300">' +
												'<%- welcomeMessage %>' +
											'</textarea>' +
										'</div>' +
									'</div>' +
									'<div class="larger control-group">' +
										'<label class="control-label display-block">' +
											'Metadata description (this will be shown on social media sites and google search engines)' +
										'</label>' +
										'<div class="controls textarea">' +
											'<textarea class="textarea mid-textarea" id="metaDescription" name="metaDescription" placeholder="Metadata description" maxlength="255">' +
												'<%- metaDescription %>' +
											'</textarea>' +
										'</div>' +
									'</div>' +
									'<div class="control-group">' +
										'<label class="control-label display-block">' +
											'Lock queue' +
										'</label>' +
										'<div class="controls textarea">' +
											'<select name="lockQueue" id="lockQueueSelect">' +
												'<option value="1"<% if(lockQueue){%> selected<%}%>>Yes</option>' +
												'<option value="0"<% if(!lockQueue){%> selected<%}%>>No</option>' +
											'</select>' +
										'</div>' +
										'<label class="control-label display-block">' +
											'Room Type' +
										'</label>' +
										'<div class="controls textarea">' +
											'<select name="roomType" id="roomTypeSelect">' +
												'<option value="room"<% if(roomType && roomType == "room"){%> selected<%}%>>Dubtrack</option>' +
												'<option value="iframe"<% if(roomType && roomType == "iframe"){%> selected<%}%>>Iframe Embed</option>' +
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

		'roomListItem': '<figure class="roomImage">' +
							'<% if(currentSong && currentSong.songid){ %>' +
								'<img src="' + Dubtrack.config.apiUrl + '/song/<%- currentSong.songid %>/image/large" alt="" />' +
							'<% } else { %>' +
								'<img src="' + Dubtrack.config.apiUrl + '/room/<%- _id %>/image/thumbnail" alt="" />' +
							'<% } %>' +
							'<a class="join" href="/join/<%- roomUrl %>">' +
								'<span>' + dubtrack_lang.room.tune_in + '</span>' +
							'</a>' +
						'</figure>' +
						'<div class="user-count">' +
							'<% if(activeUsers) { %>' +
								'<span class="icon-people"></span>' +
								'<%- activeUsers %>' +
							'<% } %>' +
						'</div>' +
						'<header>' +
							'<div class="description">' +
								'<span class="name"><%- name %></span>' +
							'</div>' +
							'<div class="user-info">' +
								'<figure></figure>' +
								'<div class="room-user">' +
									dubtrack_lang.room.hosted_by +
									'<a href="/<%- userid %>" class="navigate"></a>' +
								'</div>' +
							'</div>' +
						'</header>' +
						'<span class="current-song">' +
							'<% if(currentSong && currentSong.name){ %>' +
								'<%- currentSong.name %>' +
							'<% } else { %>' +
								'Go ahead, play a song!' +
							'<% } %>' +
						'</span>',

		'avatarsContainer': '<div class="loadingAva">' +
								dubtrack_lang.global.loading +
							'</div>' +
							'<div class="avatar_tools">' +
								'<div class="input-room-users-search">' +
									'<input type="text" name="room-users-search" placeholder="Filter room users">' +
								'</div>' +
							'</div>' +
							'<div class="tabsContainer">' +
								'<div class="tabItem" id="main-user-list-room">' +
									'<ul class="avatar-list" id="avatar-list"></ul>' +
								'</div>' +
							'</div>',

		'avatarsContainerItem':'<p class="username">' +
								'</p>' +
								'<p class="dubs">' +
									'<span><%- dubs %> </span>' +
									' dubs' +
								'</p>',

		'roomBanListItem' : '<%- _user.username %><span class="actions">unban</span>',

		'roomMuteListItem' : '<%- _user.username %><span class="actions">unmute</span>'
	},

	'chat': {
		'chatContainer': //'	<a href="#" class="chat-commands">?</a>' +
							'<div class="chat_tools">' +
								'<span class="display-chat icon-chat active"></span>' +
								'<span class="display-room-users icon-people"><i class="room-user-counter"></i></span>' +
								'<span class="display-chat-settings icon-chatsettings"></span>' +
							'</div>' +
							'<div class="chat-options">' +
								'<span class="chat-option-header">Chat display</span>' +
								'<div class="chat-option-buttons chat-option-buttons-display">' +
									'<span class="hideImagesToggle">Hide Images</span>' +
									'<span class="clearChatToggle">Clear chat</span>' +
								'</div>' +
								'<span class="chat-option-header">Sound notifications</span>' +
								'<div class="chat-option-buttons chat-option-buttons-sound">' +
									'<span class="setOnChatNotifications"><i class="icon-volume-high"></i> On</span>' +
									'<span class="setMentionChatNotifications"><i class="icon-volume-high"></i> @Mention</span>' +
									'<span class="setOffChatNotifications"><i class="icon-volume-mute"></i> Off</span>' +
								'</div>' +
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
										'<input id="chat-txt-message" name="message" type="text" placeholder= "'+ dubtrack_lang.chat.type_message +'" autocomplete="off" maxlength="255">' +
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
							'<div class="chatDelete"><span class="icon-close"></span></div>' +
							'<div class="image_row">' +
								'<%= Dubtrack.helpers.image.getImage(user._id, user.username, false, true) %>' +
							'</div>' +
							'<div class="activity-row">' +
								'<div class="text">' +
									'<p><a href="#" class="username"><%- user.username %></a> <%= message %></p>' +
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

		'playlistContainer': '<div class="create-playlist-header">' +
								'Add to playlist <span class="icon-close"></span>' +
								'</div>' +
								'<div class="create-playlist-input">' +
									'<input type="text" placeholder="' + dubtrack_lang.playlist.create + '" class="playlist-input" id="playlist-input" maxlength="50" />' +
									'<span class="icon-add"></span>' +
								'</div>' +
							'<ul class="playlist-list-action"></ul>',

		'playlistBrowser': '<%- name %>',

		'playlistSearchBrowser': '<div class="description">' +
									'<span><i class="icon-search"></i> <%- name %></span>' +
								'</div>',

		'playlistHistoryBrowser': '<div class="description">' +
									'<input type="text" class="playlist_filter" placeholder="Filter history" value="">' +
								'</div>',

		'playlistInfo': '<div class="description">' +
							'<input type="text" class="editplaylist_name" placeholder="Playlist name" value="<%- name %>" value="" />' +
							'<span class="icon-save save-playlistname"></span>' +
							'<input type="text" class="playlist_filter" placeholder="' + dubtrack_lang.playlist.filter + '" value="" />' +
						'</div>' +
						'<div class="right">' +
							'<a href="#" class="icon-shuffle shuffle-playlist tt-wrapper"></a>' +
							'<a href="#" class="icon-editplaylist edit-playlist-name tt-wrapper"></a>' +
							'<a href="#" class="icon-trash delete-playlist tt-wrapper"></a>' +
							'<a href="#" class="playlist_type tt-wrapper"></a>' +
							'<a href="#" class="text-button queue-playlist">Queue all</a>' +
						'</div>',

		'roomQueueInfo': '<div class="description">' +
							'<span>Room queue</span>' +
						'</div>' +
						'<div class="right">' +
							'<a href="#" class="icon-lock room-queue-lock tt-wrapper"></a>' +
							'<a href="#" class="icon-unlocked room-queue-unlock tt-wrapper"></a>' +
						'</div>',

		'myQueueInfo': '<div class="description">' +
							'<span>My queue</span>' +
						'</div>' +
						'<div class="right">' +
							'<a href="#" class="text-button clear-queue clear-queue-browser-bth">Clear</a>' +
							'<a href="#" class="text-button pause-queue pause-queue-browser-bth">Pause</a>' +
						'</div>',

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
										'<span class="icon-angle-double-up"></span>' +
									'</a>' +
									'<a href="#" class="img_bg add_to_queue">' +
										'<span class="icon-play"></span>' +
									'</a>' +
									'<a class="img_bg add_to_playlist" href="#">' +
										'<span class="icon-heart"></span>' +
									'</a>' +
									'<a href="#" class="img_bg remove_icon">' +
										'<span class="icon-trash"></span>' +
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
										'<span class="icon-play"></span>' +
									'</a>' +
									'<a class="img_bg add_to_playlist" href="#">' +
										'<span class="icon-heart"></span>' +
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
										'<span class="icon-angle-double-up"></span>' +
									'</a>' +
									'<a href="#" class="text-button remove_dj_all">' +
										'Remove DJ' +
									'</a>' +
									'<a class="img_bg add_to_playlist" href="#">' +
										'<span class="icon-heart"></span>' +
									'</a>' +
									'<a href="#" class="img_bg remove_dj">' +
										'<span class="icon-trash"></span>' +
									'</a>' +
								'</div>',
	},

	'layout': {
		'header': '<div id="header_login">' +
						'<a href="/login" id="login-link">LOGIN</a>' +
						' | ' +
						'<a href="/signup" id="signup-link">SIGN UP</a>' +
					'</div>' +
					'<% if(Dubtrack.loggedIn) {%>' +
					'<div class="header-right-navigation">' +
						'<div class="user-info">' +
							'<span>' +
								'<%- username %>' +
							'</span>' +
							'<figure class="user-image">' +
								'<%= Dubtrack.helpers.image.getImage(_id, username) %>' +
							'</figure>' +
						'</div>' +
						'<div class="user-messages">' +
							'<span class="message-counter"></span>' +
							'<span class="icon-message"></span>' +
						'</div>' +
					'</div>' +
					'<% } %>',

		'soundCloudImportItem' : '<%- title %><i class="total-items"><%- total_tracks %></i>',

		'browser': '<div class="browser-content">'+
						'<div id="import-playlist-container">' +
							'<span class="close-import-playlist icon-close"></span>' +
							'<h3>Import playlists</h3>' +
							'<div class="playlist-type-select playlist-tab-import-active">' +
								'<span class="icon-youtube import-youtube"></span>' +
								'<span class="icon-soundcloud import-soundcloud"></span>' +
							'</div>' +
							'<div class="import-playlist-youtube">' +
								'<div class="loading-import">Importing playlist....</div>' +
								'<div class="err-message"></div>' +
								'<input class="youtube-username" placeholder="Youtube playlist ID" />' +
								'<select class="playlist-select" name="playlist-id"></select>' +
								'<span class="import-playlist icon-inbox">Import</span>' +
							'</div>' +
							'<div class="import-playlist-soundcloud">' +
								'<div class="loading-import">Importing playlist....</div>' +
								'<div class="err-message"></div>' +
								'<input class="soundcloud-username" placeholder="Soundcloud username" />' +
								'<div class="playlist-container"><ul></ul></div>' +
								'<select class="playlist-select" name="playlist-id"></select>' +
								'<span class="import-playlist icon-inbox">Import</span>' +
							'</div>' +
						'</div>' +
						'<div class="browser-content-header">' +
							'<span class="close-browser icon-downvote"></span>' +
							'<div class="form">' +
								'<input type="text" class="placeholder" name="youtube-search" id="youtube-search" value="" placeholder="' + dubtrack_lang.global.search + '" />' +
								'<a href="#" class="search-btn">' +
									'<span class="icon-arrow-right2"></span>' +
								'</a>' +
								'<div class="music-type-select">' +
									'<span class="current-music-type-selection"><i class="icon-youtube"></i></span>' +
									'<span class="icon-arrow-dropdown"></span>' +
									'<div class="music-type-dropdown">' +
										'<span class="icon-youtube youtube-btn"></span>' +
										'<span class="icon-soundcloud" id="soundcloud-btn"></span>' +
									'</div>' +
								'</div>' +
							'</div>' +
							'<a href="#" class="close">' +
								'<span class="icon-remove-circle"></span>' +
							'</a>' +
						'</div>' +
						'<div class="browser-content-main">' +
							'<div class="sidebar">' +
								'<div class="display-sidebar"><span class="icon-playlist"></span></div>' +
								'<div class="import-playlist">' +
									'<span class="icon-inbox"></span> Import playlists' +
								'</div>' +
								'<div class="create-playlist">' +
									'<div class="create-playlist-display"><span class="icon-createplaylist"></span> Create playlist</div>' +
									'<div class="create-playlist-form">' +
										'<input type="text" placeholder="' + dubtrack_lang.playlist.create + '" maxlength="100" />' +
										'<span class="icon-createplaylist"></span>' +
									'</div>' +
								'</div>' +
								'<div id="queue-next"></div>' +
								'<span class="title">Your playlists</span>' +
								'<div id="playlists-scroll">' +
									'<ul class="playlist-style">' +
										'<li class="current_queue"><span class="icon-play"></span>' + dubtrack_lang.playlist.your_queue + '</li>' +
										'<li class="current_room_queue"><span class="icon-playlist"></span> ' + dubtrack_lang.playlist.room_queue + '</li>' +
										'<li class="room_history"><span class="icon-history"></span>Room history</li>' +
									'</ul>' +
									'<div>' +
										'<ul class="playlist-style playlist-list"></ul>' +
									'</div>' +
								'</div>' +
							'</div>' +
							'<div class="nano">' +
								'<div class="content-videos">' +
									'<div class="result-videos">' +
										'<div class="loading">' + dubtrack_lang.global.loading + '</div>' +
										'<div id="results_video_api">' +
											'<ul></ul>' +
										'</div>' +
									'</div>' +
								'</div>' +
							'</div>' +
						'</div>' +
					'</div>',

		'playerController': '<div class="right">'+
								'<ul>' +
									'<% if(Dubtrack.loggedIn) {%>' +
										'<li class="display-browser remove-if-banned">' +
											'<a class="display-browser">' +
												'<span class="icon-playlist"></span>' +
											'</a>' +
										'</li>' +
										'<li class="add-to-playlist remove-if-banned remove-if-iframe">' +
											'<a class="add-to-playlist">' +
												'<span class="icon-heart"></span>' +
											'</a>' +
										'</li>' +
									'<% } %>' +
									'<li class="remove-if-banned remove-if-iframe">' +
										'<a class="dubup">' +
											'<span class="icon-arrow-up"></span>' +
												'<span class="dub-counter">0</span>' +
										'</a>' +
									'</li>' +
									'<li class="remove-if-banned remove-if-iframe">' +
										'<a class="dubdown">' +
											'<span class="icon-arrow-down"></span>' +
											'<span class="dub-counter">0</span>' +
										'</a>' +
									'</li>' +
								'</ul>' +
							'</div>' +
							'<div class="left">' +
								'<div class="custom-embed-info">Custom embed channel</div>' +
								'<ul>' +
									'<% if(Dubtrack.loggedIn) {%>'+
										'<li class="playlist remove-if-banned">' +
											'<a href="/browser" class="navigate">' +
												'<span class="icon-list"></span>' +
											'</a>' +
										'</li>' +
									'<% } %>' +
									'<li class="imgEl"></li>' +
									'<li class="infoContainer">' +
										'<div class="infoContainerInner">' +
											'<div class="progressBg"></div>' +
											'<span class="currentDJSong">' +
											'</span>' +
											'<span class="currentSong">' +
												dubtrack_lang.player.joinRoom +
											'</span>' +
											'<div class="currentTime">' +
												'<span class="min"></span>' +
												':' +
												'<span class="sec"></span>' +
											'</div>' +
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
