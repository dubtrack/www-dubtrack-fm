Dubtrack.View.Profile = Backbone.View.extend({
	el: $('#profileMainSection'),

	events : {
		"click li.playlistEl": "loadPlaylists",
		"click li.feedEl": "loadComments",
		"click li.musicEl": "loadMusic",
		"click .follow": "follow",
		"click .unfollow": "unfollow",
		"click a.readlessLink": "readLess",
		"click a.readmoreLink": "readMore",
		"click a.loadMoreWallPosts": "loadMoreWallPosts",
		"click a.navigate": "navigate",
		"click .followersCount": "loadFollowers",
		"click .followingCount": "loadFollowing",
		"click .updatePictureGif": "openGifCreator",
		"click .infoProfile h2 span.editUsername": "displayEditForm",
		"keyup .infoProfile h2 input": "keyUpCheckforUsername",
		"click .infoProfile h2 span.saveUsername" : "updateUserName",
		"click .rewindProfile a" : "closeProfile"
	},

	initialize : function(){
		this.render();
	},

	render : function(){
		this.currentPage = 0;

		this.$el.show();

		var user = this.model.toJSON();

		user.imgProfile = Dubtrack.helpers.image.getImage(user._id, user.username, true);

		//render item based on template
		this.$el.html( _.template( Dubtrack.els.templates.profile.profileView, user ));

		//realtime channel
		Dubtrack.Events.bind('realtime:user-update-' + user._id, this.updateImage, this);

		this.socialEl = this.$("ul#ulSocial");

		var links = this.model.get('links');

		if (Dubtrack.room && Dubtrack.room.model){
			this.$('.rewindProfile').show();
		}else{
			this.$('.rewindProfile').hide();
		}

		/*_.each( links, function(link){
			$n = link.link.split( '/' );

			$name = getDomainName($n[2]);
			var $li = $('<li/>').html( $('<a/>', {'target' : '_blank', 'class' : $name, 'href' : link.link }).html( $name ) ).appendTo( this.socialEl );
		}, this);*/
		var link = null;
		if(user.userInfo.provider === "facebook") link = "https://www.facebook.com/" + user.userInfo.username;
		if(user.userInfo.provider === "twitter") link = "https://twitter.com/" + user.userInfo.username;

		/*$('<li/>').html( $('<a/>', {
			'target': '_blank',
			'class': user.userInfo.provider,
			'href': link
		}).html( '<span class="icon-' + user.userInfo.provider + '"></span>' ) )
		.appendTo( this.socialEl );*/

		this.displayBarCurrent = this.$('span.progress');
		this.loadingTabsEl = this.$(".tabLoading");

		//loadComments
		this.loadComments();

		//load details
		this.loadDetails();

		return this;
	},

	closeProfile : function(e){
		if(e) e.preventDefault();

		if (Dubtrack.room && Dubtrack.room.model){
			Dubtrack.app.navigate('/join/' + Dubtrack.room.model.get("roomUrl"), {
				trigger: true
			});
		}
	},

	displayEditForm: function(){
		this.$('.infoProfile h2').addClass('edit_username');
		this.$('.infoProfile h2 input').focus();

		return false;
	},

	keyUpCheckforUsername: function(){
		if(this.timeoutCheckForusername) clearTimeout(this.timeoutCheckForusername);

		var self = this;
		this.timeoutCheckForusername = setTimeout(function(){
			self.checkForUsername();
		}, 500);
	},

	updateUserName: function(){
		var query = $.trim(this.$('.infoProfile h2 input').val());
		if(query === "" || query === null){
			return;
		}

		var self = this;

		//display loading
		this.$('.infoProfile h2 span.saveUsername').html(Dubtrack.config.loadingEls);

		$.ajax({
			url : Dubtrack.config.apiUrl + Dubtrack.config.urls.updateUsername,
			method: 'post',
			xhrFields: {
				withCredentials: true
			},
			data: {
				'username' : query
			}
		}).success(function(r){
			if(r.data.username){
				self.$('.infoProfile h2 .check_username_info').removeClass('error').hide();
				self.$('.infoProfile h2').removeClass('edit_username');
				self.$('.infoProfile h2 span.usernameContainer').html(r.data.username);
				$('.user-header-menu button.user-info-button span').html(r.data.username);
				Dubtrack.session.set('username', r.data.username);

				Dubtrack.app.navigate('/' + r.data.username, {
					trigger: false
				});

			}else{
				self.$('.infoProfile h2 .check_username_info').html(query + " is taken").addClass('error').show();
			}
		}).always(function(){
			self.$('.infoProfile h2 span.saveUsername').html('save <i class="icon-disk"></i>');
		}).error(function(){
			self.$('.infoProfile h2 .check_username_info').html(query + " is taken").addClass('error').show();
		});

		return false;
	},

	checkForUsername: function(){
		var query = $.trim(this.$('.infoProfile h2 input').val());
		if(query === "" || query === null){
			this.$('.infoProfile h2 .check_username_info').hide();
			return;
		}

		this.$('.infoProfile h2 .check_username_info').removeClass('error').hide();

		var self = this;
		$.ajax({
			url : Dubtrack.config.apiUrl + Dubtrack.config.urls.queryUsernameAvailability,
			method: 'get',
			xhrFields: {
				withCredentials: true
			},
			data: {
				'username' : query
			}
		}).success(function(r){
			if(r.data.taken){
				self.$('.infoProfile h2 .check_username_info').html(r.data.username + " is taken").addClass('error').show();
			}else{
				self.$('.infoProfile h2 .check_username_info').html(r.data.username + " is available").show();
			}
		});
	},

	updateImage: function(r){
		//this.$('.pictureContainer img').attr('src', r.img);
	},

	updateImageWithSource: function(src){
		var user = this.model.toJSON();

		this.$('.pictureContainer img').attr('src', "");
		//var img = Dubtrack.helpers.image.getImage(user._id, user.username, true);
		var imgsrc = "http://api.dubtrack.fm/user/" + user._id + "/image/large?lastmod=" + Date.now();
		this.$('.pictureContainer img').attr('src', imgsrc);
	},

	openGifCreator: function(){
		window.open("/imgur/index.html#&client_id=94daca23890c704", "Dubtrack FM - GIF creator", "height=590,width=340,resizable=no,location=no,scrollbars=no");

		return false;
	},

	navigate : function(el){
		$href = $(el.target).attr("href");
		if($href){
			Dubtrack.app.navigate($href, {
				trigger: true
			});
		}

		return false;
	},

	loadMusic : function(){

		var self = this;

		this.$el.find('.contentMainProfile .active').removeClass('active');

		//create container
		this.$('#musicContent').addClass('active');
		this.$('li.musicEl').addClass('active');

		this.moveProgress();

		/*if( ! this.musicUserCollection){

			this.loadingTabsEl.show();

			this.musicUserCollection = new playlistUserItemCollection();
			this.musicUserCollection.url = dubtrackMain.config.getMusicTracks + this.model.get("id");

			this.musicUserCollection.fetch({success: function(){

				_.each(self.musicUserCollection.models, function (item) {
					var minute = Math.floor(parseFloat( item.get('video_length') ) / 60);
					var second = parseFloat( item.get('video_length') ) - minute * 60;
					if(second.length<2) second = "0"+second;

					minute = ("0".substring(minute >= 10) + minute);
					second = ("0".substring(second >= 10) + second);

					item.set({ 'minute' : minute, 'second' : second });
					var itemViewEl = $(new dt.playlist.browserPlaylistViewItem({model:item}).render("profileBrowserItem").el).appendTo( $(this.el).find('#musicContent ul.content-videos') );

				}, self);

				self.loadingTabsEl.hide();

			}});
		}*/
	},

	loadWallPosts : function(){

		var self = this;

		this.$el.find('a.loadMoreWallPosts').html( dubtrack_lang.global.loading );

		/*this.wallpostCollection.fetchPage(this.currentPage, function(){
			//set comments view
			self.wallpostView = new WallpostView({ model : self.wallpostCollection });
			self.commentsViewEl = $( self.wallpostView.render($dj_details.id).el ).appendTo( $(self.el).find('#feedContent') );
			$(self.el).find('a.loadMoreWallPosts').html( dubtrack_lang.profile.loadmorewall );

			if(self.wallpostCollection.models.length === 0) $(self.el).find('a.loadMoreWallPosts').hide();
		});*/


		return false;
	},

	loadMoreWallPosts : function(){

		var self = this;

		$(this.el).find('a.loadMoreWallPosts').html( dubtrack_lang.global.loading );

		this.currentPage = this.currentPage + 1;

		this.wallpostCollection.fetchPage(this.currentPage, function(c, r){
			$(self.el).find('a.loadMoreWallPosts').html( dubtrack_lang.profile.loadmorewall );

			if(r.data.wall_posts.length === 0) $(self.el).find('a.loadMoreWallPosts').hide();
		});

		return false;

	},

	loadComments : function(){

		/*if( !this.wallpostCollection ){
			$dj_details = this.model.get('dj_details');

			//set comments collection
			this.wallpostCollection = new WallpostCollection();
			this.wallpostCollection.setUrl($dj_details.id);

			this.loadWallPosts();
		}
		*/
		this.$('.contentMainProfile .active').removeClass('active');
		this.$('#feedContent').addClass('active');
		this.$('li.feedEl').addClass('active');

		this.moveProgress();
	},

	readLess : function(){
		$(this.el).find('.content_bio.hidden').removeClass('hidden');
		$(this.el).find('.content_bio.bio').addClass('hidden');

		return false;
	},

	readMore : function(){
		$(this.el).find('.content_bio.hidden').removeClass('hidden');
		$(this.el).find('.content_bio.bio_short').addClass('hidden');

		return false;
	},

	loadDetails : function(){

		this.profileSidebar = $( _.template( Dubtrack.els.templates.profile.profileSidebar, this.model.toJSON()) ).appendTo( this.$el );

		this.followersEl = this.$("#followersEl");
		this.notificationsEl = this.$("#userNotifications");

		this.loadFollowers();
		/*
		var notifications = this.model.get('notifications');

		$dj_details = this.model.get('dj_details');
		var img = dubtrackMain.helpers.getProfileImg( $dj_details.oauth_uid, $dj_details.username, $dj_details.oauth_provider );

		_.each(notifications, function(notification){
			notification.img = img;
			$( _.template( tpl.get('notificationProfile'), notification) ).appendTo( this.notificationsEl );
		}, this);

		this.notificationsEl.find('.timeago').timeago();

		var self = this;
		this.followersEl.find('span.followersCount').on('click', function(){
			self.followersEl.find('span.active').removeClass('active');
			$(this).addClass('active');
			self.followersEl.find('.followingContainer').css('left', '0');
			self.loadFollowers();
		});

		this.followersEl.find('span.followingCount').on('click', function(){
			self.followersEl.find('span.active').removeClass('active');
			$(this).addClass('active');
			self.followersEl.find('.followingContainer').css('left', '-100%');
			self.loadFollowing();
		});*/

		//this.loadFollowers();
	},

	follow : function(e){
		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.userFollowing.replace( ":id", this.model.get('_id') );

		Dubtrack.helpers.sendRequest( url, {}, 'post');

		this.$('button.unfollow').show();
		this.$('button.follow').hide();

		return false;
	},

	unfollow : function(e){
		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.userFollowing.replace( ":id", this.model.get('_id') );

		Dubtrack.helpers.sendRequest( url, {}, 'delete');

		this.$('button.unfollow').hide();
		this.$('button.follow').show();

		return false;
	},

	loadFollowing : function(){
		this.followersEl.find('span.active').removeClass('active');

		this.$('.followingCount').addClass('active');
		this.$('.followingContainer').css('left', '-100%');

		if(! this.following ){
			this.following = new Dubtrack.Collection.UserFollowing();

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.userFollow.replace( ":id", this.model.get('_id') );
			this.following.url = url;

			var self = this;
			this.following.fetch({
				success: function(m, r){
					console.log(self.following);
					_.each(self.following.models, function(itemUser){
						new Dubtrack.View.ProfileItemFollower({
							model: itemUser
						})
						.render(itemUser.get('following'))
						.$el.appendTo( self.$('.followingContainer .avatarFollowing') );
					});
				}
			});
		}

		return false;

	},

	loadFollowers : function(){
		this.followersEl.find('span.active').removeClass('active');

		this.$('.followersCount').addClass('active');
		this.$('.followingContainer').css('left', '0');

		if(! this.follows ){
			this.follows = new Dubtrack.Collection.UserFollowing();

			var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.userFollowing.replace( ":id", this.model.get('_id') );
			this.follows.url = url;

			var self = this;
			this.follows.fetch({
				success: function(m, r){
					_.each(self.follows.models, function(itemUser){
						new Dubtrack.View.ProfileItemFollower({
							model: itemUser
						})
						.render(itemUser.get('userid'))
						.$el.appendTo( self.$('.followingContainer .avatarFollower') );

						if( Dubtrack.loggedIn && itemUser.get("userid") == Dubtrack.session.id ){
							self.$('button.follow').hide();
							self.$('button.unfollow').show();
						}
					});
				}
			});
		}

		return false;
	},

	loadFollow : function(type, el){

		var self = this;

		//create container
		this.ulFollowers = $('<ul/>', {'class' : 'messages wall-post-list'}).appendTo( $(this.el).find('div.content-main') );

		$.ajax({
			url:  dubtrackMain.config.getFollowing + "id/" + this.model.get('id') + "/mode/" + type,
			data: {},
			type: 'GET',
			success: function(response){
				try{
					if(response.success){

						$.each( response.data.users, function(){
							this.img = dubtrackMain.helpers.getProfileImg( this.oauth_uid, this.username, this.oauth_provider );

							if(type === 1) this.userid = this.follow_by;

							$( _.template( tpl.get("followingListItem"), this ) ).appendTo( el );
						});
					}
				}
				catch(err){
					//window.console.log(err);
				}
			},
			error: function(){
			}
		},"json");

		return;

	},

	loadPlaylists : function(){

		var self = this;

		this.$('.contentMainProfile .active').removeClass('active');

		//create container
		this.$('#playlistContent').addClass('active');
		this.$('li.playlistEl').addClass('active');

		this.moveProgress();

		/*if(!this.playlistLoaded){

			this.loadingTabsEl.show();

			var $ulPlaylist = $('<ul/>');
			$(this.el).find('#playlistContent').html( $ulPlaylist );
			$.ajax({
				url:  dubtrackMain.config.getPlaylistPublic,
				data: {"iduser" :  this.model.get('dj_details.id') },
				type: 'POST',
				success: function(response){
					try{
						if(response.success){

							$.each( response.data.playlists, function(){
								var $li = $( _.template( tpl.get("windowPlaylistItem"), this ) ).appendTo( $ulPlaylist );
								var id = this.id;
								$li.on('click', function(){
									dubtrackMain.app.navigate('/browser/user/' + id , {trigger : true});
									return false;
								})
							});

						}
					}
					catch(err){
						//window.console.log(err);
					}

					self.loadingTabsEl.hide();
				},
				error: function(){
				}
			},"json");

			this.playlistLoaded = true;
		}*/

		return false;

	},

	moveProgress : function(){
		this.displayBarCurrent.css('left', $(this.el).find('.contentMainProfile li.active').index() * 33.33 + '%');
	}

});

Dubtrack.View.ProfileItemFollower = Backbone.View.extend({
	tagName: 'li',

	initialize: function(){
	},

	render: function(userid){
		Dubtrack.cache.users.get(userid, this.renderUser, this);

		return this;
	},

	renderUser: function(err, user){
		this.user = user;
		var userInfo = user.get('userInfo');

		//display user image
		this.$el.html( Dubtrack.helpers.image.getImage(user.id, user.get("username")) );
	},
});
