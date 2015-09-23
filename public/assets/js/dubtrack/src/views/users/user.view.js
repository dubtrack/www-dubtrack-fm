UserView = Backbone.View.extend({
	
	tagName : 'div',
	
	events : {
	},
	
	initialize : function(){
		
		//attach events to object
        this.model.bind("add", this.appendEl, this);
        this.model.bind("reset", this.render, this);
        
        this.render();
	},
	
	render : function(urlDub){
    	
    	console.log(this.model.models);
    	
    	// loop through each item
        _.each(this.model.models, function (item) {
            this.appendEl(item);
        }, this);
		
		return this;
	},
	    
    appendEl : function(item, urlDub){
    	//append element
    	//var commentsItemView = $(new CommentsItemView({model:item}).render( urlDub ).el).appendTo( $(this.el) );
    },
});