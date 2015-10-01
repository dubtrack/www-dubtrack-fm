Dubtrack.View.LoginMainWindowView = Backbone.View.extend({
	el : $('#login-model-window'),

	events : {
		"click .close-login-window" : "hideWindow"
	},

	initialize : function(){
		if(Dubtrack.loggedIn){
			this.$el.remove();
			return;
		}

		this.signup_window = new Dubtrack.View.LoginWindowView({
			el : this.$('#login-create-window'),
		});
		this.forgot_window = new Dubtrack.View.LoginWindowView({
			el : this.$('#login-forgot-window'),
		});
		this.login_window = new Dubtrack.View.LoginWindowView({
			el : this.$('#login-window'),
		});
		this.change_window = new Dubtrack.View.LoginWindowView({
			el : this.$('#login-chage-password-window'),
		});

		this.signup_window.formSuccess = function(){
			this.sucess_el.text("Thanks for signing up! We sent you a verification email");
			this.sucess_el.show();
		};

		this.forgot_window.formSuccess = function(){
			this.sucess_el.text("We sent you an email, please follow the link to change your password");
			this.sucess_el.show();
		};

		this.change_window.formSuccess = function(){
			this.sucess_el.text("Password successfully updated");
			this.sucess_el.show();
		};

		this.login_window.formSuccess = function(){
			this.sucess_el.text("Login successful");
			this.sucess_el.show();

			if(Dubtrack.room && Dubtrack.room.model){
				location.href = "/join/" + Dubtrack.room.model.get('roomUrl');
			}else{
				location.href = "/";
			}
		};
	},

	hideWindow : function(){
		this.$el.hide();

		if(Dubtrack.room && Dubtrack.room.model){
			Dubtrack.app.navigate("/join/" + Dubtrack.room.model.get('roomUrl'), {
				trigger: true
			});
		}else{
			Dubtrack.app.navigate("/lobby", {
				trigger: true
			});
		}
	},

	displayWindow : function(item){
		if(!this[item] || !this[item].$el) return false;
		this.$el.show();

		Dubtrack.els.mainLoading.hide();

		this.$('.login-model-container').removeClass('show-form');
		this.$('.login-model-container form').show();
		this.$('.login-model-container form .err-message').hide();
		this.$('.login-model-container .success-message').hide();
		this[item].$el.addClass('show-form');

		if(item === "signup_window" && !this.captcah_loaded){
			this.captcah_loaded = true;
			$.getScript('https://www.google.com/recaptcha/api.js?onload=onRecaptchaloadCallback&render=explicit');
		}
	}
});

Dubtrack.View.LoginWindowView = Backbone.View.extend({
	events : {
		"click .account-actions a" : "triggerAction",
		"submit form" : "submitForm"
	},

	initialize : function(){
		this.form_el = this.$('form');
		this.password_el = this.$('form input[name=password]');
		this.password2_el = this.$('form input[name=password2]');
		this.token_el = this.$('form input[name=token]');
		this.submit_el = this.$('form input[type=submit]');
		this.form_target = this.form_el.length ? this.form_el.attr('action') : null;
		this.error_el = this.$('form .err-message');
		this.sucess_el = this.$('.success-message');
		this.token = null;
	},

	triggerAction : function(e){
		e.preventDefault();

		var target = $(e.target);
		if(!target.is('a')) target.parents('a');

		if(!target) return;

		var $href = target.attr("href");

		if($href){
			Dubtrack.app.navigate($href, {
				trigger: true
			});
		}
	},

	submitForm : function(e){
		e.preventDefault();

		this.error_el.hide();
		this.sucess_el.hide();

		if(!this.form_target) return;

		if(this.password2_el.length && this.password_el.length && this.password2_el.val() !== this.password_el.val()){
			this.error_el.show();
			this.error_el.html("Passwords don't match");
			return;
		}

		this.submit_el.attr("disabled", true);

		var submit_button_value = this.submit_el.val();
		this.submit_el.val('loading...');

		if(this.token && this.token_el.length) this.token_el.val(this.token);
		var form_data = this.form_el.serialize();

		$.post(Dubtrack.config.apiUrl + this.form_target, form_data)
			.fail(function(err){
				try{
					var res = JSON.parse(err.responseText);
					console.log(res);
					if(res.data && res.data.details && res.data.details.message){
						this.error_el.text(res.data.details.message);
					}else{
						this.error_el.text("error on form submission");
					}
				}catch(ex){
					this.error_el.text("error on form submission");
				}

				this.error_el.show();
				try{
					grecaptcha.reset();
				}catch(ex){}
			}.bind(this))
			.done(function(){
				this.form_el.hide();
				this.formSuccess();
			}.bind(this))
			.always(function(){
				this.submit_el.val(submit_button_value);
				this.submit_el.attr("disabled", false);
			}.bind(this));
	},

	formSuccess : function(){}
});
