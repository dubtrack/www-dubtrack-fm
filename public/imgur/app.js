$(function() {
  var $gif = $('#gif');
  var $gifLink = $('#gifLink');
  var $error = $('#error');
  var $record = $('#record');
  var $info = $record.find('.info');
  var $qualityBad = $('#quality-bad');
  var $lengthShort = $('#length-short');
  var $group = $('.group');
  var $countdown = $('#countdown');
  var $loader = $('#loader');
  var $loader2 = $('#loader2');
  var token = extractToken(document.location.hash);
  var $imgur = $('#imgur');
  var $imgurOauth = $('#imgur a:first');
  var $imgurAnon = $('#imgur a:last');
  var $imgurUpload = $('#imgur-upload');
  var clientId = '94daca23890c704';
  var loader;
  var params = {};
  var queryString = document.URL.replace(/^[^\?]+\??/, '').split('&');

	for (var i = 0, len = queryString.length; i < len; i++) {
		var param = queryString[i].split('='),
			key = param.shift(),
			value = param.join('=');
		params[key] = value;
	}

  $imgurUpload.hide();
  $imgur.hide();
  $group.hide();
  $error.hide();
  $record.hide();

  if(params.action == "chat"){
	$('footer').show();
	$('.fileinput-button').hide();
	$('#imgur a').html('<span class="glyphicon glyphicon-cloud-upload"></span> Post anonymously to imgur');
  }else{
	  //image upload
	  $('#fileupload').fileupload({
		dataType: 'json',
		progressall: function (e, data) {
			var progress = parseInt(data.loaded / data.total * 100, 10);
			$loader2.val(progress % 100).trigger('change');
		},
		add: function (e, data) {
			$('#image-container').html('');
			$loader2.knob().show();
			data.submit();
		},
		xhrFields: {
			withCredentials: true
		},
		done: function (e, data) {
			$loader2.knob().hide();
			$('#image-container').html('<img src="' + data.result.data.profileImage.url + '" alt="" />');
			//set user image
			window.opener.Dubtrack.app.profileView.updateImageWithSource(data.result.data.profileImage.url);
			window.close();
		},
		error: function(jqXHR){
			$loader2.knob().hide();

			var message;

			try {
				message = JSON.parse(jqXHR.responseText).data.details.message;
			} catch (err) {
				//Do nothing
			}

			alert(message || 'Failed to upload image');
		}
	  });
  }

  //prepare gifie
  $('button#makegifie').bind('click', function(){
	$(this).hide();
	//$('footer').show();
	gifie.prepare();
	$('.image_upload').hide();
	return false;
  });

  $loader.knob().hide();
  $loader2.knob().hide();
  $countdown.knob().hide();

  $imgur.find('a').click(function() {
	localStorage.doUpload = true;
  });

  $imgurOauth.attr('href', $imgurOauth.attr('href') + '&client_id=' + clientId);

  $imgurAnon.click(function() {
	imgurUpload();
  });

  function extractToken(hash) {
	var match = hash.match(/access_token=(\w+)/);
	return !!match && match[1];
  }

  function imgurUpload(token) {
	$imgurUpload.show();
	$group.hide();

	var auth, headers = {}, xhrFields = {}, url = 'https://api.dubtrack.fm/user/imagegif';
	if (token) authorization = 'Bearer ' + token;
	else authorization = 'Client-ID ' + clientId;

	if(params.action == "chat"){
		url = 'https://api.imgur.com/3/image';

		headers = {
			Authorization: authorization,
			Accept: 'application/json'
		};
	}else{
		xhrFields = {
			withCredentials: true
		};
	}

	$.ajax({
		url: url,

		method: 'POST',

		xhrFields : xhrFields,

		headers: headers,

		data: {
			image: localStorage.dataBase64,
			type: 'base64'
		},

		success: function(result) {
			if(params.action == "chat"){
				try{
					window.opener.Dubtrack.room.chat._messageInputEl.val(result.data.link);
					window.opener.Dubtrack.room.chat.sendMessage();
					window.close();
				}catch(ex){
					alert("error sending image!");
					window.close();
				}
				/*$.ajax({
					url: "http://api.dubtrack.fm/chat/" + params.roomid,
					data: {
						message: result.data.link
					},

					type: "post",

					xhrFields: {
						withCredentials: true
					},

					success: function(r){
						window.close();
					},

					error: function(r, xhr, message){
						alert("error updating image!");
						window.close();
					}
				},"json");*/

			}else{
				//set user image
				window.opener.Dubtrack.app.profileView.updateImageWithSource(result.data.profileImage.url);
				window.close();
			}
		},

		error: function(){
			alert("error uploading image!");
			window.close();
		}
	});
  }

  if (token && JSON.parse(localStorage.doUpload)) {
	localStorage.doUpload = false;

	imgurUpload(token);

	return;
  }

  if (!('sendAsBinary' in XMLHttpRequest.prototype)) {
	XMLHttpRequest.prototype.sendAsBinary = function(string) {
	  var bytes = Array.prototype.map.call(string, function(c) {
		return c.charCodeAt(0) & 0xff;
	  });
	  this.send(new Uint8Array(bytes).buffer);
	};
  }

  function startLoader() {
	var i = 0;
	loader = setInterval(function() {
	  $loader.val(++i % 100).trigger('change');
	}, 10);
	$loader.knob().show();
  }

  function stopLoader() {
	clearInterval(loader);
	$loader.knob().hide();
  }

  on('prepare', function(err) {
	if ( !! err) {
	  $error.show();
	} else {
	  $record.show();
	  $group.show();
	}
  });

  on('building', function() {
	$info.text('Building...');
	startLoader();
  });

  on('gif', function(dataBase64) {
	stopLoader();
	$record.removeClass('disabled recording');
	$info.text('Record');

	localStorage.dataBase64 = dataBase64;
	var dataUrl = 'data:image/gif;base64,' + dataBase64;
	$gif.attr('src', dataUrl).show();
	$gifLink.attr('href', dataUrl);
	$imgur.show();
  });

  function loading() {
	$gif.hide();
	$imgur.hide();
	$record.addClass('disabled');
	$info.text('Wait...');
	$countdown.knob().show();
  }

  function record() {
	$record.addClass('recording');
	$info.text('Recording...');

	var qualityBad = $qualityBad.prop('checked');
	var lengthShort = $lengthShort.prop('checked');

	gifie.init({
	  quality: 50,
	  length: 10
	});
  }

  $record.click(function() {
	loading();
	$countdown.val($countdown.data('max')).trigger('change');
	var interval = setInterval(function() {
	  $countdown.val($countdown.val() - 1).trigger('change');
	  if ($countdown.val() > 0) return;

	  clearInterval(interval);
	  $countdown.knob().hide();
	  record();
	}, 10);
  });
});

var listeners = {};
on = function(name, cb) {
  listeners[name] = cb;
};
trigger = function(name) {
  var cb = listeners[name];
  if (cb) cb.apply(null, [].slice.call(arguments, 1));
};
