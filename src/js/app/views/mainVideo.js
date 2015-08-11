define( [
  'backbone',
  'mustache',
  'text!templates/mainVideo.html',
  'underscore',
  'yt-player',
  'views/endslateView'
//  'TweenLite',
//  'TweenLite-css',
//  'TweenLite-ease'
], function ( Backbone, Mustache, template, _, YoutubeCustomPlayer, EndslateView ) {

  'use strict';

  return Backbone.View.extend( {

    initialize: function ( options ) {
//      console.log(YoutubeCustomPlayer);

      this.isTouch = options.isTouch;

      this.mainApp = options.mainApp;

      // Google YouTube Data API key (necessary for captions or playlist requests)
      this.youtubeDataApiKey = options.youtubeDataApiKey;

      // Get all the available videos from the YouTube playlist (to create the end slate)
      this.videos = options.videos;

      this.setupElements();
      this.setupEvents();

    },

    setupElements: function () {

      this.$videoContainer = $( '#videoContainer' );
      this.$backgroundImage = $( '#backgroundImage' );
      this.$mainEpisode = $( '#mainEpisode' );

    },

    setupEvents: function () {
      var click = this.isTouch ? 'touchstart' : 'click';

      $( document ).on( click, '#big-play-btn-wrapper', this.playVideo.bind( this ) );
      $( document ).on( click, '#shareButtons button', this.shareVideo.bind( this ) );
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

      // Hide end slate
      this.hideEndSlate();

//      var self = this;
//      var videoId = this.videoData.id;
      var youtubeId = this.videoData.youtubeId;
      var youtubeDataApiKey = this.youtubeDataApiKey;

      //create a new Player
      this.ytplayer = new YoutubeCustomPlayer( 'videoContainer', {
//        embedCode: embedCode, // custom embed code
        alwaysVisible: false, // if the controls should be always visible or hide after a few seconds
        //hl: 'en', // force the language for subtitles and CC
        hideControlsDelay: 500, // time in ms before hiding the controls, after mouse exits the video
        videoId: youtubeId, //id of the yt video
        wmode: 'transparent', //opaque/transparent/direct
        controls: 1, // show custom controls (1 yes - 0 controlless)
        // showinfo: 0, // show infos bubules on video ?
        autoplay: 1, //autoplay ?
        rel: 0, //show related videos at the end ?
        APIkey: youtubeDataApiKey,
//        onVideoEnd: this.onVideoEnd,
//        onVideoPlay: this.onVideoPlay,
        onVideoReady: this.onVideoReady
      } );

      this.ytplayer.on( 'ended', this.onVideoEnd.bind( this ) );
      this.ytplayer.on( 'play', this.onVideoPlay.bind( this ) );

    },

    onVideoPlay: function () {
//      console.log( 'video PLAY' );
      $( '#mainEpisode' ).addClass( 'videoPlaying' );
    },

    onVideoReady: function ( event ) {
//        console.log('player ready');
      // 'this' represents the YoutubeCustomPlayer instance
      // 'this.ytplayer' represents the YouTube player object to access the Iframe API
//        console.log( this.ytplayer );

      $( '#backgroundImage, #big-play-btn-wrapper' ).fadeOut( 500, function () {
        $( '#mainEpisode' ).addClass( 'videoPlaying' );
      } );

      // Update Google Analytics (send)
//      window.ga( 'send', {
//        'hitType': 'event',          // Required.
//        'eventCategory': 'play video',   // Required.
//        'eventAction': 'play',      // Required.
//        'eventLabel': this.ytplayer.id
//      } );

    },

    onVideoEnd: function () {
      console.log( 'video ENDED' );
//      console.log(this);

      // Show big play btn
      $( '#backgroundImage, #big-play-btn-wrapper' ).fadeIn();
      $( '#big-play-btn' ).removeClass( 'startVideo' );
      $( '#mainEpisode' ).removeClass( 'videoPlaying' );
      this.ytplayer.seek( 0 );
      this.ytplayer.pause();

      // Endslate
      if ( this.videos.length > 1 ) {
        setTimeout( this.showEndSlate.bind( this ), 500 );
      }
    },

    hideEndSlate: function () {
      if ( this.endSlateView ) {
        this.endSlateView.hide();
      }
    },

    showEndSlate: function () {
      if ( !this.endSlateView ) {
        this.endSlateView = new EndslateView( {
          el: document.getElementById( 'endslate' ),
          videos: this.videos,
          isTouch: this.isTouch,
          mainApp: this.mainApp
        } );
      }

      if ( this.videos.length > 1 )
        this.endSlateView.update( this.ytplayer.getSrc() ).render().show();

    },

    render: function ( videoData ) {
      if ( this.ytplayer )
        this.ytplayer.destroy();

      this.videoData = videoData;
      this.$el.html( Mustache.render( template, {
        mainEpisode: videoData
      } ) );
      return this;
    }

  } );
} );