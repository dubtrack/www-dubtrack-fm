Dubtrack.View.comment = Backbone.View.extend({
	
	tagName : 'section',

	attributes: {
		"class": "comments-main"
	},
	
	events : {
		"click .loadMoreComments" : "displayAllComments",
		"click .comments-textarea-container button": "postComment"
	},
	
	initialize : function(){
		this.$el.html( _.template(Dubtrack.els.templates.comments.commentsContainer) );

		this.collection = new Dubtrack.Collection.Comments();

		this.collection.bind("add", this.appendEl, this);

		this.commentsLoaded = false;
		//this.collection.bind("remove", this.removeEl, this);
		//this.collection.bind("change", this.updateDubs, this);

		Dubtrack.Events.bind('realtime:comment-add', this.addRealTimeComment, this);
		Dubtrack.Events.bind('realtime:comment-remove', this.removeRealTimeComment, this);
	},

	render: function(url){
		this.collection.url = url;
		var self = this;

		this.collection.fetch({
			success: function(){
				self.commentsLoaded = true;
			},

			error: function(){
				self.commentsLoaded = true;
			}
		});

		return this;
	},

	removeRealTimeComment: function(r){
		var commentModel = this.collection.findWhere({
			_id: r.comment._id
		});

		if(commentModel && commentModel.viewEl) commentModel.viewEl.close();
	},

	addRealTimeComment: function(r){
		var itemModel = new Dubtrack.Model.Comments( r.comment );
		this.collection.add( itemModel );
	},

	appendEl: function(commentModel){
		var viewEl = new Dubtrack.View.commentItem({
			model: commentModel
		});

		commentModel.viewEl = viewEl;

		if(this.commentsLoaded){
			this.$('.comments-list').prepend( viewEl.$el );
		}else{
			this.$('.comments-list').append( viewEl.$el );
		}
	},

	postComment: function(){
		var comment = $.trim(this.$('.comments-textarea-container textarea').val()),
			self = this;

		if(comment === "" || comment === null) return;

		this.$('.comments-textarea-container textarea').val('');
		this.$('.comments-textarea-container button').html(dubtrack_lang.global.loading);

		var commentModel = new Dubtrack.Model.Comments({
			comment: comment
		});

		commentModel.url = this.collection.url;
		commentModel.parse = Dubtrack.helpers.parse;

		commentModel.save({}, {
			success: function(){
				self.$('.comments-textarea-container button').html('Post a comment');

				self.collection.add(commentModel);
			},

			error: function(){
				self.$('.comments-textarea-container button').html('Error creating comment');
			}
		});

		return false;
	},

	beforeClose : function(){
		_.each(this.collection.models, function(commentModel){
			if(commentModel.viewEl) commentModel.viewEl.close();
		});
	},
});