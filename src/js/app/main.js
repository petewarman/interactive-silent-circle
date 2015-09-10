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

  // App
  var App = {};

  function init( el, context, config, mediator ) {

    App.el = el;
    App.context = context;
    App.config = config;
    App.mediator = mediator;
    App.isWeb = isWeb();

    // Paths
    App.root = App.isWeb ? "{{remote-root}}" : "{{local-root}}";
    App.assets = App.root + 'assets/';

    // Get Json
    getJsonData();

  }


  // Check if in app or on website
  function isWeb() {
    return typeof window.guardian !== "undefined";
  }

  function getJsonData() {

    $.ajax( {
      dataType: 'json',
      //url: '{{assets}}/data/coming-soon.json', // + '&callback=?',
      url: App.assets + '/data/coming-soon.json',
      success: getPlaylistItems,
      error: function ( a, b, c ) {
        console.log( 'JSON data error' );

//        console.log( a );
//        console.log( b );
//        console.log( c );
      }
    } );

  }

  function getPlaylistItems( data ) {

    App.comingSoon = data;

//    console.log( 'get YT playlist items' );

    var url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=' + playlistId + '&key=' + youtubeDataApiKey;

    $.ajax( {
      dataType: 'jsonp',
      url: url,
      success: youtubeReady,
      error: function () {
        console.log( 'getPlaylistItems() error' );
      }
    } );
  }


  function youtubeReady( data ) {

//    console.log( 'wait for YT ready' );

    App.playlistItemsData = data;

    // Wait for YouTube API to be ready
    YoutubeCustomPlayer.ready( function () {

//      console.log( 'YT  is ready!' );

      var appView = new AppView( {
        el: App.el,
        playlistItemsData: App.playlistItemsData,
        comingSoon: App.comingSoon,
        youtubeDataApiKey: youtubeDataApiKey,
        path: {
          root: App.root,
          assets: App.assets
        }
//        rootPath: App.rootPath
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
