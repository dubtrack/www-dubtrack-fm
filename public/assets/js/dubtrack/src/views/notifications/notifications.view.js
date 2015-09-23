NoticiationView = Backbone.View.extend({
	
	tagName : 'div',
	
	events : {
		"click a.loadMore" : "loadMore"
	},
	
	initialize : function(){
	
		console.log("DUBTRACK notifications");
		
		//append content
		this.$el.html( tpl.get('notificationCont') );
		
		//attach events to object
        this.model.bind("add", this.addItem, this);
        this.model.bind("reset", this.render, this);
        this.loadMoreEl = this.$el.find("a.loadMore");
        
        this.notificationEl = this.$el.find('ul#notifications_list');
        
        this.$el.addClass('avatar_cont');	
	},
	
	render : function(){
    	
    	this.ytplayers = new Array();
    	
    	// loop through each item
        _.each(this.model.models, function (item) {
        		
        		this.addItem(item);        	
        	
        }, this);
		
		return this; 
	},
	
	addItem : function(item){
		
		switch(item.get('type')) {
			case "dj_update":
				//Notifications.buildDj(notification);
			break;
			case "dub_comment":
				this.buildComment(item.toJSON());
			break;
			case "wall_comment":
				this.wallPost(item.toJSON()); 
			break;
			case "wall_post":
				this.wallPost(item.toJSON());
			break;
			case "following_post":
				if(dubtrackMain.user.loggedIn){
					if(	item.attributes.userid == dubtrackMain.user.id ||
						item.attributes.id_rel == dubtrackMain.user.id){
							this.buildFollowing(item.toJSON()); 
					}
				}
			break;
			default:
			break;
		}
		
		this.notificationEl.find('.timeago').timeago();
				
	},
	
	wallPost : function(item){
	
		var $li = $('<li/>', { "id" : 'li' + item.id_rel }).appendTo( this.notificationEl ); 
	
		var wallpostModel = new WallpostModel({ id : item.id_rel });
		
		var self = this;
		wallpostModel.fetch({success : function(response){
			if(wallpostModel.get('message') != '')
				var wallpostItemView = $(new WallpostItemView({ model : wallpostModel }).render().el).appendTo( $li );
		}});
		
	},
	
	buildFollowing : function(item){
		
		var $li = $('<li/>', { "id" : 'li' + item.id_rel }).appendTo( this.notificationEl );
		
		//set image
		item.img = dubtrackMain.helpers.getProfileImg( item.oauth_uid, item.username, item.oauth_provider );
		
		item.img_rel = dubtrackMain.helpers.getProfileImg( item.user_rel_info.oauth_uid, item.user_rel_info.username, item.user_rel_info.oauth_provider );
		
		console.log(item.img_rel);
		
		//set template
		var template = "notificationFollowing";
		
		if(item.id_rel == dubtrackMain.user.id){
			template = "notificationFollowing";
		}
		
		//create item	
		var liNotification = $( _.template( tpl.get(template), item ) ).appendTo( $li );
			
	},
	
	loadMore : function(){
		
		this.loadMoreEl.html(dubtrack_lang.global.loading);
		
		var self = this;
		this.model.fetchPage(function(){
			self.loadMoreEl.html(dubtrack_lang.notification.loadMore);
		});	
		
		return false;
	},
	
	buildComment : function(item){
		
		var segmenents = item.url.split("/");
			
		var type = "";
		var id = "";
			
		for(var i=0; i<segmenents.length; ++i)
		{
			if(segmenents[i] == "type")
				type = segmenents[i + 1];
			
			if(segmenents[i] == "id")
				id = segmenents[i + 1];
			++i;
		}
		
		var ytUrl = id;
		
		if(type == "youtube"){ 
			if( _.contains( this.ytplayers, id ) ){ 
				return;
			};
			this.ytplayers.push(id);
		}else{
			ytUrl = item.song_details.url_play;
		}
		
		item.img = dubtrackMain.helpers.getProfileImg( item.oauth_uid, item.username, item.oauth_provider );
		
		//render item based on template
		var liNotification = $( _.template( tpl.get("notificationComment"), item ) ).appendTo( this.notificationEl );
		var notificationsPlayerEl = liNotification.find(".notificationsPlayer");
		
		this.buildPlayer( notificationsPlayerEl, ytUrl, type, id );
		
		if(this.player){
			this.buidPlayers( type );
		}
		
		var playerEl = liNotification.find('.notificationsPlayer');
    	
    	if(this.commentsView) this.commentsView.close();
    		
	  	var commentsCollection = new CommentsCollection();  
	  	commentsCollection.url = "/api/dubs/viewallcomments/format/json/id/" + id + "/type/" + type;
    
	  	var params = {"type" : type, "url" : id, "comment" : ''};
    
	  	var self = this;
	  	commentsCollection.fetch({success : function(){
	  		
		  	//fetch success
		  	var commentsView = new CommentsView({ model : commentsCollection });
		  	var view = $( commentsView.render( dubtrackMain.config.saveDubComment, params ).el ).appendTo( liNotification.find('div.comments_main') );
		  	view.css("minHeight", 0);
	  	}}); 
	  	
	},
	
	buildPlayer : function(el, url, type, idEl){
        
        var id = "";
        
        switch(type){
			case "youtube":
				id = 'notification_' + url + "_" + type;
				this.buildYT(el, id, url);		
			break;
			case "soundcloud":
			case "dubtrack":
				id = 'notification_' + idEl + "_" + type;
				this.buildSoundCloud(el, id, url, type);
			break;
			default:
			break;
		}		
	},

	
	buildYT : function(el, id, url){
		
		this.player = new ytDubsPlayerView();
		el.append( this.player.render(url, id, 500, 300).el );
	},
	
	buildSoundCloud : function(el, id, url, type){
	
		this.player = new scDubsPlayerView();
		el.append( this.player.render(url, id, type, 500, 300).el );
	},
    
    stopPlayer : function(){
	    
	    if(this.player) this.player.pause();
	    
    },
    
    buidPlayers : function(type){
	  
	  	if( type == "youtube"){ 
	  		this.player.buildPlayer();
	  	}
	    
    },
	
	beforeClose : function(){
		this.player.close();
	}
});