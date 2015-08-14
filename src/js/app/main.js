define( [
  'backbone',
  'views/appView',
//  'iframeMessenger',
//  'mediator-js',
  'yt-player'
], function ( Backbone, AppView, YoutubeCustomPlayer ) {
  'use strict';


  // YouTube Playlist ID
  var playlistId = 'PL6fsSwuQS6yprx0KUHXCP3DttOHFiEJ4N';
  var youtubeDataApiKey = 'AIzaSyDiTrZ80LUooXW0H_E2NoWKFUqNTB8sqLY'; // Esteban Almiron google account

  var App = {};

  function init( el, context, config, mediator ) {

    App.el = el;
    App.context = context;
    App.config = config;
    App.mediator = mediator;

    getJsonData();

  }

  function getJsonData() {
    $.ajax( {
      dataType: 'json',
      url: '{{assets}}/data/coming-soon.json',
      success: getPlaylistItems
    } );
  }

  function getPlaylistItems( data ) {

    App.comingSoon = data;

    var url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=' + playlistId + '&key=' + youtubeDataApiKey;

    $.ajax( {
      dataType: 'json',
      url: url,
      success: youtubeReady
    } );
  }


  function youtubeReady( data ) {

    App.playlistItemsData = data;

    // Wait for YouTube API to be ready
    YoutubeCustomPlayer.ready( function () {

      var appView = new AppView( {
        el: App.el,
        playlistItemsData: App.playlistItemsData,
        comingSoon: App.comingSoon,
        youtubeDataApiKey: youtubeDataApiKey
      } );
      appView.render();

      // Start listening to URL #paths
      Backbone.history.start();

      // Enable iframe resizing on the GU site
//      iframeMessenger.enableAutoResize();

    } );

  }


  return {
    init: init
  };

} );
