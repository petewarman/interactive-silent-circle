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

      this.isTouch = options.isTouch;
      this.videos = options.videos;
      this.mainApp = options.mainApp;
      this.otherVideos = [];

      this.setupElements();
      this.setupEvents();

    },

    setupElements: function () {

    },

    setupEvents: function () {
      var self = this;
      var click = this.isTouch ? 'touchstart' : 'click';

      $( document ).on( click, '#endslate .videos-wrapper', function ( e ) {
        e.stopPropagation();
      } );

      $( document ).on( click, '#endslate .close-btn', function ( e ) {
        e.stopPropagation();
        self.hide();
      } );

      $( document ).on( click, '#endslate .video', function () {
        if ( $( this ).hasClass( 'video' ) ) {
          var videoId = $( this ).data( 'video-id' );

          if ( videoId ) {
            $( '#endslate' ).fadeOut( function () {
              self.mainApp.switchVideo( videoId );
            } );
          }
        }
      } );

    },

    update: function ( currentVideoId ) {
//      console.log(this.videos);
//      console.log( currentVideoId );

      // Update the view DOM element (cause it is overwritten every time a new video is loaded)
      this.setElement( '#endslate' );

      // Get an array wuth the other video (all but the current one)
      this.otherVideos = _.reject( this.videos, function ( video ) {
        return video.id == currentVideoId;
      } );//_.without( this.videos, _.findWhere( this.videos, {id: currentVideoId} ) );
      this.currentVideo = _.findWhere( this.videos, {id: currentVideoId} );

//      console.log( this.otherVideos );

      return this;
    },

    render: function () {

      // If there are other videos, show the endslate - otherwise show the play button
      if ( this.otherVideos.length ) {

        this.$el.html( Mustache.render( template, {
          videos: this.otherVideos,
          currentVideo: this.currentVideo
        } ) );
      }

      return this;
    },

    show: function () {
      this.$el.velocity('fadeIn', {duration: 400});
    },

    hide: function () {
      this.$el.velocity('fadeOut', {duration: 200});
    }

  } );

} );