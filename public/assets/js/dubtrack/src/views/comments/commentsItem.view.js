Dubtrack.View.commentItem = Backbone.View.extend({
	
	tagName : 'section',

	attributes: {
		"class": "comment-item"
	},
	
	events : {
		"click a.delete": "deleteComment",
		"click span.icon-arrow-up": "dubUp",
		"click span.icon-arrow-down": "dubDown",
		"click a.icon-flag": "flagComment"
	},
	
	initialize : function(){
		Dubtrack.Events.bind('realtime:comment-update-' + this.model.id, this.updateDubsRealTime, this);

		Dubtrack.cache.users.get(this.model.get("userid"), this.renderUser, this);
	},

	renderUser: function(err, user){
		if(err){
			this.close();
			return;
		}

		this.user = user;

		var jsonModel = this.model.toJSON();
		jsonModel.user = this.user.toJSON();
		jsonModel.date = new Date(jsonModel.created);

		this.$el.html( _.template(Dubtrack.els.templates.comments.commentsItem, jsonModel ));

		this.$(".timeago").timeago();
	},

	updateDubsRealTime: function(r){
		if(r && r.comment){
			this.$('span.comment-dubs-total').html(r.comment.updubs - r.comment.downdubs);
		}
	},

	deleteComment: function(){
		this.model.destroy();
		this.close();

		return false;
	},
	
	beforeClose : function(){
		this.$("time.timeago").timeago('dispose');
	},

	dubDown: function(){
		if(this.$('span.icon-arrow-down').hasClass('dubvoted')) return false;

		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.commentsDubs.replace( ":id", this.model.id ),
			self = this;
		
		this.$('.dubvoted').removeClass('dubvoted');
		this.$('span.icon-arrow-down').addClass('dubvoted');

		Dubtrack.helpers.sendRequest(url, {
			type: "downdub"
		}, "post", function(err, r){
			if(r && r.data && r.data.comment){
				self.$('span.comment-dubs-total').html(r.data.comment.updubs - r.data.comment.downdubs);
			}
		}, this);

		return false;
	},

	dubUp: function(){
		if(this.$('span.icon-arrow-up').hasClass('dubvoted')) return false;

		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.commentsDubs.replace( ":id", this.model.id ),
			self = this;

		this.$('.dubvoted').removeClass('dubvoted');
		this.$('span.icon-arrow-up').addClass('dubvoted');
		
		Dubtrack.helpers.sendRequest(url, {
			type: "updub"
		}, "post", function(err, r){
			if(r && r.data && r.data.comment){
				self.$('span.comment-dubs-total').html(r.data.comment.updubs - r.data.comment.downdubs);
			}
		}, this);

		return false;
	},

	flagComment: function(){
		var url = Dubtrack.config.apiUrl + Dubtrack.config.urls.commentsFlag.replace( ":id", this.model.id ),
			self = this;
		
		Dubtrack.helpers.sendRequest(url, {}, "post", function(err, r){
			self.$('a.icon-flag').html(" thank you!");
		}, this);

		return false;
	}
});