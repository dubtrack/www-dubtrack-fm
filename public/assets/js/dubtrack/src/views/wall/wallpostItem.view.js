WallpostItemView = Backbone.View.extend({

	tagName : 'li',
	
	events  : {
		"click a.updub"				: "updub",
		"click a.downdub"			: "downdub",
		"click a.wallremovemain"	: "deleteAction",	
	},
	
	initialize : function(){
	
	},
	
	render : function(){
		
		// set vars
		this.model.set({ img : dubtrackMain.helpers.getProfileImg( this.model.get('oauth_uid'), this.model.get('username'), this.model.get('oauth_provider') ), totaldubs : parseInt(this.model.get('updub')) - parseInt(this.model.get('downdub')) });
		
		//render item based on template
		
		$type_wall = this.model.get("type_wall");
		
		if( $type_wall === "dt_wall"){
			$to = this.model.get('to');
			this.model.set({ img_rel_to : dubtrackMain.helpers.getProfileImg( $to.oauth_uid, $to.username, $to.oauth_provider ) });
			
			$( _.template( tpl.get("wallpostRel"), this.model.toJSON() ) ).appendTo( $(this.el) );
		}else{
			$( _.template( tpl.get("wallpost"), this.model.toJSON() ) ).appendTo( $(this.el) );
		}
		
		$(this.el).find('div.timeago').timeago();
		
		this.loadComments();
		
		//return object
		return this;
	},
	
	updub : function(){
		this.dub('updub');
		return false;
	},
	
	downdub : function(){
		this.dub('downdub');	
		return false;
	},
    
    dub : function(dubType){
	    
	    var self = this;
	    
	    var totalDubsEl = $(this.el).find('span.walldubs_main');
	    var totalDubs = totalDubsEl.html();
	    
	    totalDubsEl.html('...');
	    
	    //sed request
	    $.ajax({
			url: dubtrackMain.config.dubWallPost, 
			data: {"id" : this.model.get('id'), "type" : dubType },
			type: 'POST',
			success: function(response){ 
				try
				{
					if(response.success){
						$(self.el).find("a.wallupdub").html(response.data.wall_post.updub);	
						$(self.el).find("a.walldowndub").html(response.data.wall_post.downdub);	
					
						var total = parseInt(response.data.wall_post.updub) - parseInt(response.data.wall_post.downdub);
						totalDubsEl.html(total);
						
						self.model.set({ updub : response.data.wall_post.updub, downdub : response.data.wall_post.downdub, totaldubs : total }); 
						
					}else{
						totalDubsEl.html(totalDubs);	
					}
					
				}
				catch(err){
					totalDubsEl.html(totalDubs);
					//window.console.log(err);
				}
			},
			error: function(){
			}
		},"json");
		
		return false;
		
    },
    
    deleteAction : function(){
    	
    	$(this.el).fadeOut();
    	
    	
    	var self = this;
    	
    	//sed request
	    $.ajax({
			url: dubtrackMain.config.deleteWall, 
			data: { "id" : this.model.get('id') },
			type: 'POST',
			success: function(response){ 
				try{
					$(self.el).remove();
					
				}
				catch(err){
					//window.console.log(err);
				}
			},
			error: function(){
			}
		},"json");
		
		return false;
    },
    
    loadComments : function(){
    	
    	//loading el
    	var loadingEl = $( '<div/>', { 'class' : 'loading' } ).html( dubtrack_lang.avatar.loadingComments ).appendTo( $(this.el) );
    	
    	if(this.commentsView) this.commentsView.close();
    		
	  	this.commentsCollection = new CommentsCollection();  
	  	this.commentsCollection.url = "/api/users/getwall_comments/id/" + this.model.get('id');
    
	  	var params = {"type" : "wall_posts", "url" : this.model.get('id'), "comment" : ''};
    
	  	var self = this;
	  	this.commentsCollection.fetch({success : function(){
	  		//remove loading el
	  		loadingEl.remove();
	  		
		  	//fetch success
		  	self.commentsView = new CommentsView({ model : self.commentsCollection });
		  	var view = $( self.commentsView.render( dubtrackMain.config.saveDubComment, params ).el ).appendTo( $(self.el) );
		  	view.css("minHeight", 0);
	  	}});  
    },
	
	beforeClose : function(){
	}
});