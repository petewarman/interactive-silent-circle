define( [
  'backbone',
  'mustache',
  'text!templates/mainVideo.html',
  'underscore',
  'yt-player',
//  'TweenLite',
//  'TweenLite-css',
//  'TweenLite-ease'
], function ( Backbone, Mustache, template, _, YoutubeCustomPlayer ) {

  'use strict';

  return Backbone.View.extend( {

    initialize: function ( options ) {
//      console.log(YoutubeCustomPlayer);

      // Google YouTube Data API key (necessary for captions or playlist requests)
      this.youtubeDataApiKey = options.youtubeDataApiKey;

      this.setupElements();
      this.setupEvents();

    },

    setupElements: function () {

      this.$videoContainer = $( '#videoContainer' );
      this.$backgroundImage = $( '#backgroundImage' );
      this.$mainEpisode = $( '#mainEpisode' );

    },

    setupEvents: function () {
      $( document ).on( 'click', '#mainEpisodeVideo', this.playVideo.bind( this ) );
      $( document ).on( 'click', '#shareButtons button', this.shareVideo.bind( this ) );
    },

    shareVideo: function ( e ) {

      var twitterBaseUrl = "https://twitter.com/home?status=";
      var facebookBaseUrl = "https://www.facebook.com/dialog/feed?display=popup&app_id=741666719251986&link=";
      var sharemessage = " were both given Google Glass and sent on a date. What happens next? #WatchMeDate ";
      var network = $( e.currentTarget ).attr( 'data-source' ); //make sure to add the network (pinterest,twitter,etc) as a classname to the target
      var shareWindow = "";
      var queryString = "?videoId=" + this.videoData.id;
      var coupleImage = "{{assets}}/imgs/dates/" + this.videoData.id + '_1260.jpg';
      var guardianUrl = "http://www.theguardian.com/lifeandstyle/ng-interactive/2015/feb/12/watch-me-date" + queryString;

      if ( network === "twitter" ) {
        shareWindow =
          twitterBaseUrl +
            encodeURIComponent( sharemessage ) +
            "%20" +
            encodeURIComponent( guardianUrl )

      } else if ( network === "facebook" ) {
        shareWindow =
          facebookBaseUrl +
            encodeURIComponent( guardianUrl ) +
            "&picture=" +
            encodeURIComponent( coupleImage ) +
            "&redirect_uri=http://www.theguardian.com";
      }
      window.open( shareWindow, network + "share", "width=640, height=320" );
    },

    playVideo: function ( e ) {
//      console.log( this.videoData );

      var self = this;
      var videoId = this.videoData.id;
      var youtubeId = this.videoData.youtubeId;
      var youtubeDataApiKey = this.youtubeDataApiKey;

      //create a new Player
      var ytPlayer = new YoutubeCustomPlayer( 'videoContainer', {
//        embedCode: embedCode, // custom embed code
        alwaysVisible: true, // if the controls should be always visible or hide after a few seconds
        hl: 'it', // the language for subtitles and CC
        videoId: youtubeId, //id of the yt video
        wmode: 'transparent', //opaque/transparent/direct
        controls: 1, // show yt controls ?
        showinfo: 0, // show infos bubules on video ?
        autoplay: 1, //autoplay ?
        rel: 0, //show related videos at the end ?
        APIkey: youtubeDataApiKey

      }, function ( event ) {
//        console.log('player ready');
//        console.log( this.ytplayer.getOptions( 'cc' ) );
//        console.log( this.ytplayer.getPlaylist() );

        // 'this' represents the YoutubeCustomPlayer instance
        // 'this.ytplayer' represents the YouTube player object to access the Iframe API
        console.log( this.ytplayer );
//        console.log( this.ytplayer.loadModule( "captions" ) );

        $( '#backgroundImage' ).fadeOut( 500, function () {
          $( '#big-play-btn-wrapper ' ).hide();
          $( '#mainEpisode' ).addClass( 'videoPlaying' );
        } );

        // $( '#mainEpisode' ).addClass( 'videoPlaying' );

        // Update Google Analytics (send)
        window.ga( 'send', {
          'hitType': 'event',          // Required.
          'eventCategory': 'play video',   // Required.
          'eventAction': 'play',      // Required.
          'eventLabel': videoId
        } );

      } );


      // Fade out background
//      this.$backgroundImage

    },

    render: function ( videoData ) {
      this.videoData = videoData;
      this.$el.html( Mustache.render( template, { mainEpisode: videoData } ) );
      return this;
    }

  } );
} );