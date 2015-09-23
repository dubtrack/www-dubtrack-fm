WallpostView = Backbone.View.extend({
	
	tagName : 'ul',
	
	events : {
	},
	
	initialize : function(){
		
		//attach events to object
		this.model.bind("add", this.appendEl, this);
		//this.model.bind("reset", this.render, this);
		
		$(this.el).addClass("messages wall-post-list");
	},
	
	render : function(userid){
		this.userIdPost = userid;
		
		// loop through each item
		this.replyView = new WallPostReplyView().render(this);
		$( this.replyView.el ).appendTo( $(this.el) );
		
		_.each(this.model.models, function (item) {
			this.appendEl(item);
		}, this);
		
		return this;
	},
	
	prependEl : function(item){
		//append element
		var wallpostItemView = $(new WallpostItemView({model:item}).render().el).prependTo( $(this.el) );
		
	},
		
	appendEl : function(item){
		//append element
		var wallpostItemView = $(new WallpostItemView({model:item}).render().el).appendTo( $(this.el) );
	}
});

WallPostReplyView = Backbone.View.extend({

	tagName : 'li',
	
	model : Backbone.Model.UserModel,
	
	paramas : {},
	
	urlSaveComment : '',
	
	events  : {
		"click button" : "submit"
	},
	
	initialize : function(){
		$(this.el).addClass("replyEl");
	
		this.model = dubtrackMain.user;
	},
	
	render : function(parent){
		
		this.parentView = parent;
		
		if(dubtrackMain.user.loggedIn){
			//render item based on template
			$( _.template( tpl.get("commentsReply"), this.model.toJSON() ) ).appendTo( $(this.el) );
		
			$(this.el).find('textarea').autogrow();
			
		}else{
			$(this.el).html('<div class="replyLogin">' + dubtrack_lang.comments.login_to_post + ' <a href="/login/facebook" class="facebook">' + dubtrack_lang.global.loginFB + '</a><a href="/login/twitter" class="twitter">' + dubtrack_lang.global.loginTW + '</a></div>');
		}
		
		//return object
		return this;
	},
	
	submit : function(e){
		var self = this;
		//get textarea
		
		var textarea = $(this.el).find('textarea');
		if(textarea.hasValue()){
			
			var message = textarea.val();
			
			textarea.val('');
		
			$( e.target ).html('...');
			
			//sed request
			$.ajax({
				url: dubtrackMain.config.saveWall,
				data: {message : message, post_userid : self.parentView.userIdPost},
				type: 'POST',
				success: function(response){
					try
					{
						$( e.target ).html( dubtrack_lang.comments.submit );
						
						//create element
						var item = new WallpostModel( response.data.wall_post );
						var commentsItemView = $(new WallpostItemView({model:item}).render().el).show().insertAfter( $(self.el) );
						console.log("DT NEW WALL POST ", commentsItemView);
					}
					catch(err){
						//window.console.log(err);
					}
				},
				error: function(){
				}
			},"json");
		
		}else{
			textarea.focus();
		}
		return false;
	},
	
	beforeClose : function(){
	}
});