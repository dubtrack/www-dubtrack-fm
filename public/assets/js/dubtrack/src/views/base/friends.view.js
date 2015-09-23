dt.global.friendClickAction = false;
dt.global.friendsView = Backbone.View.extend({
  
  	tagName : 'div',
  
  	events : {
	  	"click .close" : "closeAction"
  	},
  	
  	initialize : function(){
	  	
	  	$(this.el).attr({ "class" : "ajax_container no-padding", "id" : "ajax_tmp_loader" });
	  		
  	},
  	
  	render : function(){
	  	
	  	$(this.el).html( tpl.get("friendCont") );
	  	
  		this.friendsUlEl = $(this.el).find("#friends_list");
  		//this.friendsUlEl.nanoScroller();
  		
  		var self = this;
  		if(!dt.global.friendClickAction){
  			dt.global.friendClickAction = true;
  			$('body').bind('click', function(e){
	  			$parents = $(e.target).parents('#friends_list');
		
	  			if($parents.length === 0){
	  				$(self.el).hide();
	  			}
  			});
  		}
  		
	  	return this;
  	},
  	
  	closeAction : function(){
	  	//this.close();	
	  	$(this.el).hide();
	  	
	  	return false;
  	},
  	
  	fetchData : function(top, right){
	  	
	  	//this.model.bind("reset", this.resetEl, this);	
		$(this.el).show().css({"top" : top, "right" : right});
  		this.friendsUlEl.html( dubtrack_lang.global.loading );
  		
  		var self = this;
  		this.model.fetch({success : function(m, r){
  			self.friendsUlEl.html( '' );
			self.resetEl( r.data.friends_online ,r.data.friends_offline );	
  		}});
  	},
  	
  	resetEl : function(friends_online, friends_offline){
  		
  		//friends_online = this.model.get("friends_online");
	  	
	  	this.friendsUlEl.append( $('<li/>', {'class' : 'cyan' }).html( dubtrack_lang.global.online + '(' + friends_online.length + ')' ) );
	  	
	  	_.each(friends_online, function (item) {
            this.appendEl(item, "friendsItem");
        }, this);
        
        
        //friends_offline = this.model.get("friends_offline");
        
	  	this.friendsUlEl.append( $('<li/>', {'class' : 'cyan' }).html( dubtrack_lang.global.offline + '(' + friends_offline.length + ')' ) );
        _.each(friends_offline, function (item) {
            this.appendEl(item, 'friendsOffline');
        }, this);
  	},
  	
  	appendEl : function(item, template){
	  	
	  	var item = $( new dt.global.friendsViewItem({model : new dt.global.friendsModel(item) }).render(template).el ).appendTo(this.friendsUlEl);
	  	
  	}
  	
});

dt.global.friendsViewItem = Backbone.View.extend({

	tagName : "li",

	events : {
		"click" : "clickAction"	
	},
	
	render : function(template){
		
		var img = dubtrackMain.helpers.getProfileImg( 	this.model.get('oauth_uid'), 
														this.model.get('username'), 
														this.model.get('oauth_provider') );

		this.model.set({'img' : img})
	
		$( _.template( tpl.get(template), this.model.toJSON() ) ).appendTo( $(this.el) );	
		
		return this;
	},
	
	clickAction : function(){
		dubtrackMain.app.navigate("/" + this.model.get('username'), {trigger : true});
		this.close();
	}
	
});