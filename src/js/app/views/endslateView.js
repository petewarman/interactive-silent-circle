define( [
  'backbone',
  'mustache',
  'text!templates/endslate.html',
  'underscore',
//  'TweenLite',
//  'TweenLite-css',
//  'TweenLite-ease'
], function ( Backbone, Mustache, template, _ ) {

  'use strict';

  return Backbone.View.extend( {

    initialize: function ( options ) {

      this.videos = options.videos;
      this.otherVideos = [];

      this.setupElements();
      this.setupEvents();

    },

    setupElements: function () {

    },

    setupEvents: function () {

    },

    update: function ( currentVideoId ) {
//      console.log(this.videos);

      this.otherVideos = _.without(this.videos, _.findWhere(this.videos, {id: currentVideoId}));
      this.currentVideo = _.findWhere(this.videos, {id: currentVideoId});

      return this;
    },

    render: function () {
      this.$el.html( Mustache.render( template, {
        videos: this.otherVideos,
        currentVideo: this.currentVideo
      } ) );

      return this;
    },

    show: function() {
      this.$el.fadeIn();
    }

  } );

} );