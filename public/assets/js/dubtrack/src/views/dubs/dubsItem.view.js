DubsItemView = Backbone.View.extend({

	tagName : 'li',
	
	events  : {
		"click div.img" : "loadComments",
		"click div.content" : "loadComments",
		"click div.buttons"	: "loadComments"
	},
	
	initialize : function(){
	},
	
	render : function(){
		this.$el.addClass('dub_cont');
		 
		//render item based on template
		$( _.template( tpl.get("dubsItem"), this.model.toJSON() ) ).appendTo( this.$el );
		
		this.commentsAjax = this.$el.find('.ajax');
		
		//return object
		return this;
	},
	
	buildPlayer : function(){
		
		this.PlayerContainer = this.$el.find('div.playerDubContainer');
        
        switch(this.model.get('type')){
			case "youtube":
				this.id = this.model.get('url') + "_" + this.model.get('type');
				this.buildYT();		
			break;
			case "soundcloud":
			case "dubtrack":
				this.id = this.model.get('url_play') + "_" + this.model.get('type');
				this.buildSoundCloud();
			break;
			default:
			break;
		}		
	},
    
    loadComments : function(){
    	
    	this.commentsAjax.html( '<div class="loadingComments">' + dubtrack_lang.dubs.loadingDetails + '...</div>' );
    	
	  	this.commentsCollection = new CommentsCollection();  
	  	this.commentsCollection.url = "/api/dubs/viewallcomments/format/json/id/" + this.model.get('url') + "/type/" + this.model.get('type'); 
    
	  	var params = {"type" : this.model.get('type'), "url" : this.model.get('url'), "comment" : ''};
    
	  	var self = this;
	  	this.commentsCollection.fetch({success : function(){
	  		self.commentsAjax.html( '' );
		  	//fetch success
		  	self.commentsView = new CommentsView({ model : self.commentsCollection });
		  	self.commentsAjax.append( self.commentsView.render( dubtrackMain.config.saveDubComment, params ).el );
	  	}});
	  	
	  	
		if(dubtrackMain.app.dubsView) dubtrackMain.app.dubsView.stopPlayers();
	  	
	  	//load player
	  	if(!this.player){
		  	this.buildPlayer();
		  	
		  	//wait for youtube and run callback
		  	this.buidPlayers();
		}
		
		return false;
    },
    
    stopPlayer : function(){
	    
	    if(this.player) this.player.pause();
	    
    },
    
    buidPlayers : function(){
	  
	  if(this.model.get('type') == "youtube") this.player.buildPlayer();
	    
    },
	
	buildYT : function(){
		
		this.player = new ytDubsPlayerView();
		this.PlayerContainer.append( this.player.render(this.model.get('url'), this.id + "_video").el );
	},
	
	buildSoundCloud : function(){
	
		this.player = new scDubsPlayerView();
		this.PlayerContainer.append( this.player.render(this.model.get('url_play'), this.id + "_audio", this.model.get('type') ).el );
	},
	
	beforeClose : function(){
		this.player.close();
	}
});