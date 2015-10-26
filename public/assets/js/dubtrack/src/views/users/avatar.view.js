Dubtrack.View.Profile = Backbone.View.extend({
	el: $('#profileMainSection'),

	events : {
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
		"click .infoProfile h2 span.cancelUsername": "closeEditForm",
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

		this.displayBarCurrent = this.$('span.progress');
		this.loadingTabsEl = this.$(".tabLoading");

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
		}else{
			Dubtrack.app.navigate('/lobby', {
				trigger: true
			});
		}
	},

	closeEditForm: function(){
		this.$('.infoProfile h2').removeClass('edit_username');

		return false;
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

	loadDetails : function(){
		this.profileSidebar = $( _.template( Dubtrack.els.templates.profile.profileSidebar, this.model.toJSON()) ).appendTo( this.$el );

		this.followersEl = this.$("#followersEl");
		this.notificationsEl = this.$("#userNotifications");

		this.loadFollowers();
	},

	follow : function(e){
		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.userFollowing.replace( ":id", this.model.get('_id') );

		Dubtrack.helpers.sendRequest( url, {}, 'post', function(err){
			this.loadFollowers();
		}.bind(this));

		this.$('button.unfollow').show();
		this.$('button.follow').hide();

		return false;
	},

	unfollow : function(e){
		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.userFollowing.replace( ":id", this.model.get('_id') );

		Dubtrack.helpers.sendRequest( url, {}, 'delete', function(err){
			this.loadFollowers();
		}.bind(this));

		this.$('button.unfollow').hide();
		this.$('button.follow').show();

		return false;
	},

	loadFollowers : function(){
		this.followersEl.find('span.active').removeClass('active');

		this.$('.followersCount').addClass('active');
		this.$('.followingContainer').css('left', '0');

		this.$('.followingContainer .avatarFollower').empty();
		this.follows = new Dubtrack.Collection.UserFollowing();

		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.userFollowing.replace( ":id", this.model.get('_id') );
		this.follows.url = url;

		var self = this;
		this.follows.reset({});
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

				self.$('.followingContainer .total-followers').text(self.follows.models.length);
			}
		});

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
