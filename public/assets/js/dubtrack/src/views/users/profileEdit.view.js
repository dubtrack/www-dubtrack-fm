dt.profile.linkCounter = 0;
dt.profile.editView = Backbone.View.extend({
	tagName : 'div',

	events : {
		"click .close" 	: "closeAction",
		"click .cancel" : "closeAction",
		"click .btn-primary" : "saveAction",
		"keyup .dt_username_input" : "keyup_dtuseranme"
	},

	initialize : function(){
		$(this.el).attr("id", "dubuserForm").addClass('form');
	},

	render : function(){
		//render item based on template
		this.formEl = $( _.template( tpl.get("profileFormUpdate"), this.model.toJSON() ) ).appendTo( $(this.el) );

		this.dj_details = this.model.get("dj_details");

		this.model.bind("change", this.saveModel, this);

		this.linkEl = $(this.el).find("#inputLinkContent");
		this.username_messageEl = $(this.el).find("#username_message");

		this.LinksView = new Array();

		this.renderLink();

		return this;
	},

	renderLink : function(){
		var links = this.model.get('links');

		_.each( links, function(link){
			console.log(link);
			$('<input/>', {'class' : 'input-xlarge', 'name' : 'updateLink[' + link.id + ']', 'value' : link.link, 'type' : 'text' }).appendTo( this.linkEl );
		}, this)

		this.appendEl();

	},

	keyup_dtuseranme : function(e){
		clearTimeout(this.timeout);

		var val = e.target.value;

		this.username_messageEl.removeClass("success error").html( "dubtrack.fm/" + val);

		if(this.dj_details.username === val){
			this.username_messageEl.addClass("success");
			return;
		}

		var self = this;

		this.timeout = setTimeout(function(){
			$.ajax({
				url:  dubtrackMain.config.checkusername,
				data: { 'dt_username' : val },
				type: 'POST',
				success: function(response){
					try{
						if(response.success){
							self.username_messageEl.addClass("success").html( "dubtrack.fm/" + response.data.username + " " + dubtrack_lang.profile.is_available);
						}else{
							self.username_messageEl.addClass("error").html( "dubtrack.fm/" + response.data.username + " " + dubtrack_lang.profile.is_taken);;
						}
					}
					catch(err){
						//window.console.log(err);
					}
				},
				error: function(){
				}
			},"json");

		}, 1000);
	},

	appendEl : function(){
		dt.profile.linkCounter++;
		var inputView = new dt.profile.profileInput().render(this, '', dt.profile.linkCounter);
		$( inputView.el ).appendTo( this.linkEl );

		this.LinksView.push( inputView );

		return false;
	},

	removeLink : function(){
		if( dt.profile.linkCounter > 1 ){

			var view = this.LinksView[ dt.profile.linkCounter - 1];

			if( $(this.LinksView[ dt.profile.linkCounter - 2].el).val() === "" ){
				view.close();
				this.LinksView.pop();
				dt.profile.linkCounter--;
			}
		}
	},

	runPlugins : function(){},

	saveAction : function(){
		$(this.el).find('.btn-primary').html( dubtrack_lang.global.loading );

		this.model.set( $(this.el).find('form').serializeObject() );

		return false;
	},

	saveModel : function(){
		var self = this;
		
		$.ajax({
			url:  dubtrackMain.config.saveUserId,
			data: $(this.el).find('form').serialize(),
			type: 'POST',
			success: function(response){
				$(self.el).find('.btn-primary').html( dubtrack_lang.profile.save );
				try{
					if(response.success){
						if("username" in response.data){
							$("#header_dtusername").html( response.data.username );
							$("#dt_username_a").attr("href", "/" + response.data.username);
							dubtrackMain.app.navigate("/" + response.data.username , { trigger : true});
						}else{
							dubtrackMain.app.navigate("/" + self.dj_details.username , { trigger : true});
						}
					}
				}
				catch(err){
					//window.console.log(err);
				}
			},
			error: function(){
			}
		},"json");
	},

	closeAction : function(){
		this.close();
		return false;
	}

});

dt.profile.profileInput = Backbone.View.extend({

	tagName : 'input',

	events : {
		"focus"	: "createLink",
		"blur"	: "removeLink"
	},

	initialize : function(){

		$(this.el).addClass('createLink input-xlarge');
		$( this.el ).attr({ "type" : "text", "name" : "userLink[]" });
	},

	render : function(view, value, id){

		this.parentView = view;

		$( this.el ).attr({ "value" : value });
		this.elId = id;

		return this;
	},

	createLink : function(){

		if(this.elId === dt.profile.linkCounter) this.parentView.appendEl();

		return false;
	},

	removeLink : function(){

		if(this.elId === dt.profile.linkCounter - 1) this.parentView.removeLink( this.elId );

		return false;
	}
});
