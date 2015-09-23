Dubtrack.Model.Comments = Backbone.Model.extend({
	defaults:{
		spamFlag: Number,
		comment: String,
		deleted: Boolean,
		dubs: Number,
		created: Number,
		model: String,
		fkid: String,
		userid: String
	}
});