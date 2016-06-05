Dubtrack.View.RoomInfo  = Backbone.View.extend({
	el: $("#room-info-display"),

	initialize : function(){
		Dubtrack.Events.bind('realtime:room-update', this.roomUpdate, this);
	},

	render : function(){
		var room_data = this.model.toJSON();
		if(room_data.description) room_data.description = Dubtrack.helpers.text.convertHtmltoTags(room_data.description).replace(/(?:\r\n|\r|\n)/g, '<br />');

		this.$('.room-info-display-wrapper').html( _.template( Dubtrack.els.templates.rooms.roomModalView, room_data));

		this.$('.room-info-display-wrapper').perfectScrollbar({
			suppressScrollX: true,
			wheelPropagation: false
		});

		return this;
	},

	roomUpdate : function(r){
		if(r && r.room){
			//update local model
			this.model.set(r.room);

			this.render();
		}
	}
});
