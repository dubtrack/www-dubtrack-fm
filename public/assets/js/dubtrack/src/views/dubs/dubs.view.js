DubsView = Backbone.View.extend({
	
	tagName : 'div',
	
	events : {
		"click a.dubs-link"	: "filter",
		"keyup input#dub_text"	: "search", 
	},
	
	initialize : function(){
	
		this.dubsItemEl = new Array();
	
		console.log("DUBTRACK displaying dubs list");
		
		//append content
		$(this.el).html( tpl.get('dubsContainer') );
		
		//attach events to object
        this.model.bind("add", this.appendEl, this);
        this.model.bind("reset", this.render, this);
        
        this.dubsListEl = $(this.el).find('ul#top-dubs');
        
        $(this.el).addClass('avatar_bg');
        
        this.type = 'day';
        
        this.render();
		
	},
	
	render : function(){
		
		this.dubsListEl.html('');
    	
    	// loop through each item
        _.each(this.model.models, function (item) {
            this.appendEl(item);
        }, this);
		
		return this;
	},
	
	runPlugins : function(){
	
		if(this.model.models.length === 1){
			$view = this.dubsItemEl[0];
			if($view) $view.loadComments();
		}	
	},
	
	filter : function(e){
		
		e.preventDefault();
		
		var self = this;
		
		$(this.el).find(' a.active ').removeClass('active');
		
		//get targets data
		var data = $(e.target).data();
		$(e.target).addClass('active');
		
		var type = data.type;
				
		//display loading
		dubtrackMain.elements.displayloading(dubtrack_lang.dubs.loading);
		
		//clear container
		this.dubsListEl.html('');
		
		this.type = type;
		
		var term = e.target.value;
		dubtrackMain.app.dubsListCollection.url = dubtrackMain.config.dubsUrl + "/date/" + type; 
		dubtrackMain.app.dubsListCollection.fetch({ success : function(){
			
			dubtrackMain.app.navigate( "/dubs/" + type );
		
			//hide loading
			dubtrackMain.elements.mainLoading.hide();
		} });
		
		return false;
	},
	
	search : function(e){
		
		var self = this;
		c = e.which ? e.which : e.keyCode;
		if (c == 13 || ! $(e.target).hasValue() ){
			
			//display loading
			dubtrackMain.elements.displayloading(dubtrack_lang.dubs.loading);
			
			//clear container
			self.dubsListEl.html('');
			
			var term = e.target.value;
			
			//set URL
			if($(e.target).hasValue()){
				dubtrackMain.app.dubsListCollection.url = dubtrackMain.config.searchDubsUrl + "/dub_text/" + escape( term.replace(/[^a-zA-Z 0-9]+/g,'') ); 
			}else{
				dubtrackMain.app.dubsListCollection.url = dubtrackMain.config.dubsUrl + "/date/" + this.type;	
			}
			
			dubtrackMain.app.dubsListCollection.fetch({ data : { 'dub_text' : term}, success : function(){
				//hide loading
				dubtrackMain.elements.mainLoading.hide();
			} });
		}
	
	},
	
	buidPlayers : function(){
		_.each(this.dubsItemEl, function (item) {
			item.buidPlayers();
		});
	},
	
	stopPlayers : function(){
		_.each(this.dubsItemEl, function (item) {
			item.stopPlayer();
		});
	},
    
    appendEl : function(item){
    	//append element
    	var dubsItemEl = new DubsItemView({model:item});
    	$(dubsItemEl.render().el).appendTo( this.dubsListEl );
    	this.dubsItemEl.push(dubsItemEl);
    }
});