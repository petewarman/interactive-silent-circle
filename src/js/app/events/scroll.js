define(function(require){

  var _ = require('underscore');

  var Event = function() {
    this.initialize();
  };

  Event.prototype = {
    initialize: function() {
      //this.$body = $('body');
      this.callback = _.throttle(this.onScroll, 100).bind(this);

      //$(window).on('scroll', this.callback);
      window.addEventListener('scroll', this.callback);
    },
    onScroll: function() {
      App.mediator.publish('scroll', {
        scrollLeft: document.body.scrollLeft, //this.$body.scrollLeft(),
        scrollTop: document.body.scrollTop //this.$body.scrollTop()
      });
    }
  };

  return new Event();

});