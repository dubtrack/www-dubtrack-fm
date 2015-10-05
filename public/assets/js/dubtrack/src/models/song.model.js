Dubtrack.Model.Song = Backbone.Model.extend({
	urlRoot: Dubtrack.config.apiUrl + Dubtrack.config.urls.song,

	defaults:{
		name: null,
		description: null,
		images: {},
		genre: null,
		type: null,
		fkid: null,
		streamUrl: null,
		fileUrl: null,
		songArtist: null,
		songLength: 0,
		songBitrate: 0,
		songBpm: 0,
		songMeta: null,
		created: 0,
		updub: 0,
		downdub: 0,
		userid: null
	}
});
