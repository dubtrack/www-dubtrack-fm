Dubtrack.View.DonateWindow = Backbone.View.extend({
    el: $('#donate-modal-window'),

    events: {
        'click .close-window a': 'hideWindow'
    },

    initialize: function() {
        this.$container = this.$el.find('.modal-container');
        this.$wrapper = this.$el.find('.modal-wrapper');
        this.$form = undefined;
    },

    hideWindow: function(e) {
        e.preventDefault();
        this.$container.removeClass('show');
        this.$el.hide();

        if (Dubtrack.room && Dubtrack.room.model) {
            Dubtrack.app.navigate('/join/' + Dubtrack.room.model.get('roomUrl'), {
                trigger: true
            });
        } else {
            Dubtrack.app.navigate('/lobby', {
                trigger: true
            });
        }
    },

    displayWindow: function() {
        if (!this.$form) {
            this.$form = $('<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">');

            this.$form.append('<input type="hidden" name="cmd" value="_s-xclick">');
            this.$form.append('<input type="hidden" name="hosted_button_id" value="5BK62D2NQ8SKC">');
            this.$form.append('<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">');
            this.$form.append('<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">');

            this.$form.appendTo(this.$wrapper);

            this.$form.on('submit', $.proxy(this.updateInvoice, this));
        }

        this.updateInvoice();

        this.$el.show();
        this.$container.addClass('show');
        Dubtrack.els.mainLoading.hide();
    },

    updateInvoice: function() {
        if (!this.$form || !Dubtrack.loggedIn) return;

        var $invoice = this.$form.find('input[name="invoice"]');

        if ($invoice.length === 0) {
            $invoice = $('<input type="hidden" name="invoice">');
            this.$form.append($invoice);
        }

        $invoice.val(Dubtrack.session.id + '-' + Date.now());
    }
});
