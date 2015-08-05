define(function(require){

  var _ = require('underscore');

  var Event = function() {
    this.initialize();
  };

  Event.prototype = {
    initialize: function() {
      this.callback = _.debounce(this.onResize, 100).bind(this);

      window.addEventListener('resize', this.callback);
    },
    onResize: function() {
      App.mediator.publish('resize', {
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
  };

  return new Event();

});