Dubtrack.View.RoomInfo  = Backbone.View.extend({
	attributes: {
		id: "roomInfoModal"
	},

	events : {
		"click .closebtn" : "closeAction"
	},

	initialize : function(){
		Dubtrack.Events.bind('realtime:room-update', this.roomUpdate, this);
		$(".dubtrack_overlay").show();
	},

	render : function(){
		var room_data = this.model.toJSON();
		if(room_data.description) room_data.description = Dubtrack.helpers.text.convertHtmltoTags(room_data.description).replace(/(?:\r\n|\r|\n)/g, '<br />');

		this.$el.html( _.template( Dubtrack.els.templates.rooms.roomModalView, room_data));

		return this;
	},

	roomUpdate : function(r){
		if(r && r.room){
			//update local model
			this.model.set(r.room);

			this.render();
		}
	},

	closeAction : function(){
		$(".dubtrack_overlay").hide();
		this.$el.hide();
	},

	beforeClose: function(){
		$(".dubtrack_overlay").hide();
	}
});
