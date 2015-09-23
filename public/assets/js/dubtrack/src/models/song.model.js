Dubtrack.Model.Song = Backbone.Model.extend({
	urlRoot: Dubtrack.config.apiUrl + Dubtrack.config.urls.song,

	defaults:{
		name: String,
		description: String,
		images: Object,
		genre: String,
		type: String,
		fkid: String,
		streamUrl: String,
		fileUrl: String,
		songArtist: String,
		songLength: Number,
		songBitrate: Number,
		songBpm: Number,
		songMeta: String,
		created: Number,
		updub: Number,
		downdub: Number,
		userid: String
	}
});