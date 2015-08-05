define( [
  'backbone',
  'collections/sheetCollection',
  'views/appView',
  'iframeMessenger',
  'mediator-js',
  'yt-player'
], function ( Backbone, SheetCollection, AppView, iframeMessenger, Mediator, YoutubeCustomPlayer ) {
  'use strict';


  // Your proxied Google spreadsheet goes here
//  var key = '1c-893TLDBgjQrHPBW3ezFHldj94KCCWKsIARD_HAAGM';

  function init( el, context, config, mediator ) {

    $.ajax( {
      url: '{{assets}}/data/data.json',
      success: function ( data ) {
        console.log( data );

        // Wait for YouTube API to be ready
        YoutubeCustomPlayer.ready( function () {

          var appView = new AppView( {
            el: el,
            data: data
          } );
          appView.render();

          // Start listening to URL #paths
          Backbone.history.start();

          // Enable iframe resizing on the GU site
          iframeMessenger.enableAutoResize();

        } );

      }
    } );

  }

  return {
    init: init
  };
} );
