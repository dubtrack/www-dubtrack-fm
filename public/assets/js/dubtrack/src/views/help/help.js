dt.help.mainView = Backbone.View.extend({
	tagName : 'div',
	
	currentStep : 0,
	
	events : {
		"click .btn-tour" : "takeTour",
		"click .btn-close" : "closeHelp",
		"click .close"		: "closeHelp"
	},
	
	initialize : function(){
	},
	
	render : function(){
	
		
		this.modalEl = this.$el.html( tpl.get('helpModal') ).show().appendTo('body');
		
		this.screenEl = $('<div/>', {'class' : 'help-modal'}).appendTo('body');
		
		//this.step();
		
		return this;
	},
	
	step : function(){
		
		$('body,html').scrollTop(0);
		
		if(dt.help.global.interval) clearInterval(dt.help.global.interval);
		
		if(this.toolTipView){
			if( dt.help.messages[this.currentStep].closeCall ) dt.help.messages[this.currentStep].closeCall.call();
			this.toolTipView.close();
		}
		
		this.currentStep++;
			
		if( dt.help.messages[this.currentStep] ){
			
			var model = new dt.help.toolTipItemModel( dt.help.messages[this.currentStep] );
			this.toolTipView = new dt.help.toolTipItem({
				model : model
			}).render();
			
			if(dt.help.messages[this.currentStep].callback) dt.help.messages[this.currentStep].callback.call();
		}else{
			this.currentStep = 0;
			this.modalEl.show();
		}
	},
	
	takeTour : function(){
		
		this.modalEl.hide();
		
		this.step();
		
		return false;
		
	},
	
	closeHelp : function(){
		this.close();
		
		return false;	
	},
	
	displayStep : function(step){
		
		if(this.toolTipView){
			if( dt.help.messages[this.currentStep].closeCall ) dt.help.messages[this.currentStep].closeCall.call();
			this.toolTipView.close();
		}
		
		this.currentStep = step - 1;
		this.step();
	},
	
	beforeClose : function(){
		
		if(this.toolTipView){
			if( dt.help.messages[this.currentStep].closeCall ) dt.help.messages[this.currentStep].closeCall.call();
			this.toolTipView.close();
		}
		
		this.screenEl.remove();
	}	
});

Dubtrack.View.helpModalMod = Backbone.View.extend({
	
	events : {
		"click .btn-close": "closeHelp",
		"click .close": "closeHelp"
	},
	
	initialize : function(){
		this.modalEl = this.$el.html( Dubtrack.els.templates.help.chat ).show().appendTo('body');
		
		this.screenEl = $('<div/>', {'class' : 'help-modal'}).appendTo('body');
	},
	
	closeHelp : function(){
		this.close();
		
		return false;
	},
	
	beforeClose : function(){
		this.screenEl.remove();
	}
});


dt.help.toolTipItem = Backbone.View.extend({
	tagName	: 'div',
	
	events : {
		"click button.btn-next" : "next",
		"click button.btn-finish" : "closeHelp",
		"click button.btn-close" : "closeObject"
	},
	
	initialize : function(){
		this.$el.addClass("popover fade top in");
	},
	
	render : function(){

		this.$el.html( _.template( tpl.get("tooltip"), this.model.toJSON() )).addClass(this.model.get("styles")).show().appendTo( 'body' );
	
		return this;	
	},
	
	closeObject : function(){
		this.close();
		
		return false;	
	},
	
	closeHelp : function(){
		if(dt.help.helpViewRoute) dt.help.helpViewRoute.close();
	},
	
	next : function(){
		if(dt.help.helpViewRoute) dt.help.helpViewRoute.step();
	}
});

dt.help.global = {
	"next"	: '<button class="btn btn-small btn-primary btn-next">' + dubtrack_lang.help.next + '</button>',
	"finish": '<button class="btn btn-small btn-finish">' + dubtrack_lang.help.finish + '</button>',
	interval: false
}

dt.help.messages = {
	"1"	: {
		"styles"	: "help cornerRight",
		"title"		: dubtrack_lang.help.how_to_play,
		"content"	: dubtrack_lang.help.how_to_play_des + dt.help.global.next,
		"callback"	: function(){
			$('#playerController').addClass('help')	
		},
		"closeCall" : function(){
			$('#playerController').removeClass('help')	
		}
	},
	"2"	: {
		"styles"	: "help bottom cornerRight step2",
		"title"		: dubtrack_lang.help.select_source,
		"content"	: dubtrack_lang.help.select_source_des + dt.help.global.next,
		"callback"	: function(){
			dubtrackMain.app.navigate("/browser", {trigger : true});
			$('#browser').addClass('help');
		},
		"closeCall" : function(){
			$('#browser').removeClass('help');
		}
	},
	"3"	: {
		"styles"	: "help bottom cornerRight step3",
		"title"		: dubtrack_lang.help.search,
		"content"	: dubtrack_lang.help.search_des + dt.help.global.next,
		"callback"	: function(){
			dubtrackMain.app.navigate("/browser", {trigger : true});
			$('#browser').addClass('help');
			var searchTerm = "dubtrack.fm";
			
			var counter = 0;
			dt.help.global.interval = setInterval(function(){
				$('#youtube-search').val( $('#youtube-search').val() + searchTerm[counter]);
				counter++;
				if(counter >= searchTerm.length){ 
					clearInterval(dt.help.global.interval);
					$('#youtube-search').focus();
				}
			}, 300);
		},
		"closeCall" : function(){
			$('#browser').removeClass('help');
		}
	},
	"4"	: {
		"styles"	: "help bottom step4",
		"title"		: dubtrack_lang.help.add,
		"content"	: dubtrack_lang.help.add_des + dt.help.global.next,
		"callback"	: function(){
			if(dubtrackMain.app.mainBrowserView){
				dubtrackMain.app.mainBrowserView.setYoutube();
				$('#youtube-search').val('dubtrack.fm');	
				dubtrackMain.app.mainBrowserView.search();
			}
			dubtrackMain.app.navigate("/browser", {trigger : true});
			$('#browser').addClass('help');
		
		},
		"closeCall" : function(){
			$('#browser').removeClass('help');
			dubtrackMain.app.mainBrowserView.close();
		}
	},
	"5"	: {
		"styles"	: "help cornerRight step5",
		"title"		: dubtrack_lang.help.queue,
		"content"	: dubtrack_lang.help.queue_des + dt.help.global.next,
		"callback"	: function(){
			dubtrackMain.app.navigate("/", {trigger : true});
			$('#playerController').addClass('help')	
			$('b.queueInfo').show().html("#");
		},
		"closeCall" : function(){
			$('b.queueInfo').hide();
			$('#playerController').removeClass('help')	
		}
	},
	"6"	: {
		"styles"	: "help cornerRight step6",
		"title"		: dubtrack_lang.help.favorites,
		"content"	: dubtrack_lang.help.favorites_des + dt.help.global.next,
		"callback"	: function(){
			$('#playerController').addClass('help')	
		},
		"closeCall" : function(){
			$('#playerController').removeClass('help')	
		}
	},
	"7"	: {
		"styles"	: "help step7",
		"title"		: dubtrack_lang.help.upvote,
		"content"	: dubtrack_lang.help.upvote_des + dt.help.global.next,
		"callback"	: function(){
			$('#playerController').addClass('help')	
		},
		"closeCall" : function(){
			$('#playerController').removeClass('help')	
		}
	},
	"8"	: {
		"styles"	: "help bottom cornerRight step8",
		"title"		: dubtrack_lang.help.lobby,
		"content"	: dubtrack_lang.help.lobby_des + dt.help.global.next,
		"callback"	: function(){
			$('#header_global').addClass('help')	
		},
		"closeCall" : function(){
			$('#header_global').removeClass('help')	
		}
	},
	"9"	: {
		"styles"	: "help bottom step9",
		"title"		: dubtrack_lang.help.top_dubs,
		"content"	: dubtrack_lang.help.top_dubs_des + dt.help.global.next,
		"callback"	: function(){
			$('#header_global').addClass('help')	
		},
		"closeCall" : function(){
			$('#header_global').removeClass('help')	
		}
	},
	"10": {
		"styles"	: "help bottom step10",
		"title"		: dubtrack_lang.help.profile,
		"content"	: dubtrack_lang.help.profile_des + dt.help.global.next,
		"callback"	: function(){
			$('#header_global').addClass('help')	
		},
		"closeCall" : function(){
			$('#header_global').removeClass('help')	
		}
	},
	"11": {
		"styles"	: "help bottom cornerLeft step11",
		"title"		: dubtrack_lang.help.notifications,
		"content"	: dubtrack_lang.help.notifications_des + dt.help.global.next,
		"callback"	: function(){
			$('#header_global').addClass('help')	
		},
		"closeCall" : function(){
			$('#header_global').removeClass('help')	
		}
	},
	"12": {
		"styles"	: "help bottom cornerLeft step12",
		"title"		: dubtrack_lang.help.friends,
		"content"	: dubtrack_lang.help.friends_des + dt.help.global.next,
		"callback"	: function(){
			$('#header_global').addClass('help')	
		},
		"closeCall" : function(){
			$('#header_global').removeClass('help')	
		}
	},
	"13": {
		"styles"	: "help bottom step13",
		"title"		: dubtrack_lang.help.share,
		"content"	: dubtrack_lang.help.share_des + dt.help.global.finish,
		"callback"	: function(){
			$('#header_global').addClass('help')	
		},
		"closeCall" : function(){
			$('#header_global').removeClass('help')	
		}
	}
};