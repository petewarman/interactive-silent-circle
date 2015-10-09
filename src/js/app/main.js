define( [
  'backbone',
  'views/appView',
//  'iframeMessenger',
//  'mediator-js',
  'yt-player'
], function ( Backbone, AppView, YoutubeCustomPlayer ) {
  'use strict';


  // #########################################################
  // #########################################################
  //
  //
  // YouTube Playlist ID
  // The Guardian YouTube page
  // https://www.youtube.com/playlist?list=PLa_1MA_DEorH3aUMfgDKAJ6vuaDaRsijD
  var playlistId = "PLa_1MA_DEorH3aUMfgDKAJ6vuaDaRsijD";
  //
  //
  // Browser API key generated with
  // The Guardian Google account
  // https://console.developers.google.com/
  var youtubeDataApiKey = 'AIzaSyDy9OXbA7spc4hGNOyevkkc5Na0G11DXAI';
  //
  //
  // #########################################################
  // #########################################################


  // App
  var App = {};

  function init( el, context, config, mediator ) {

    App.el = el;
    App.context = context;
    App.config = config;
    App.mediator = mediator;
    App.isLocal = isLocal();

    // Paths
    App.root = App.isLocal ? "{{local-root}}" : "{{remote-root}}";
    App.assets = App.root + 'assets/';

    // Get Json
    getJsonData();

  }

  function isLocal() {
    return window.location.hostname === 'localhost' || window.location.hostname === '0.0.0.0' || window.location.port === '8080' || window.location.port === '8089' || window.location.port === '8888';
  }

  function getJsonData() {

//    console.log( App.assets );

    $.ajax( {
      dataType: 'jsonp',
      jsonpCallback: 'callback',
      url: App.assets + 'data/data.json',
      success: getPlaylistItems,
      error: function ( a, b, c ) {
        console.log( 'JSON data error' );
        console.log( a );
        console.log( b );
        console.log( c );
      }
    } );

  }

  function getPlaylistItems( data ) {

//    console.log( data );

    App.videosExtraData = data.videosExtraData;
    App.copy = data.copy;

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
        videosExtraData: App.videosExtraData,
        copy: App.copy,
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
