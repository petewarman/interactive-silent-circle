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

      //Support
      this.isIpad = ( navigator.userAgent.match( /.*(iPad).*/ ) ) ? true : false;
      this.isIphone = ( navigator.userAgent.match( /.*(iPhone).*/ ) ) ? true : false;
      this.isIOs = ( this.isIpad || this.isIphone ) ? true : false;
      this.isAndroid = ( navigator.userAgent.match( /.*(Android).*/ ) ) ? true : false;
      this.isTouch = options.isTouch;
      this.isPhone = this.isIphone || (this.isTouch && !this.isIpad && $( window ).width() < 480);

      console.log( 'AM I A PHONE? ', this.isPhone );

      // Get mainApp view reference
      this.mainApp = options.mainApp;

      // Google YouTube Data API key (necessary for captions or playlist requests)
      this.youtubeDataApiKey = options.youtubeDataApiKey;

      // Get all the available videos from the YouTube playlist (to create the end slate)
      this.videos = options.videos;

      this.setupElements();

    },

    setupElements: function () {

      this.$videoContainer = $( '#videoContainer' );
      this.$backgroundImage = $( '#backgroundImage' );
      this.$mainEpisode = $( '#mainEpisode' );

    },

    setupEvents: function () {
      var click = this.isTouch ? 'touchstart' : 'click';

      if ( !this.touch ) {
        $( document ).on( 'click', '#big-play-btn-wrapper', this.renderVideo.bind( this ) );
      }

      $( document ).on( click, '#shareButtons button', this.shareVideo.bind( this ) );
    },

    shareVideo: function ( e ) {

//      console.log(this.videoData.thumbnails.maxres.url);

      var twitterBaseUrl = "https://twitter.com/home?status=";
      var facebookBaseUrl = "https://www.facebook.com/dialog/feed?display=popup&app_id=741666719251986&link=";
      var sharemessage = " were both given Google Glass and sent on a date. What happens next? #WatchMeDate ";
      var network = $( e.currentTarget ).attr( 'data-source' ); //make sure to add the network (pinterest,twitter,etc) as a classname to the target
      var shareWindow = "";
      var queryString = "?videoId=" + this.videoData.id;
      var videoImg = this.videoData.thumbnails.maxres.url;
//      var coupleImage = "{{assets}}/imgs/dates/" + this.videoData.id + '_1260.jpg';
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
            encodeURIComponent( videoImg ) +
            "&redirect_uri=http://www.theguardian.com";
      }
      window.open( shareWindow, network + "share", "width=640, height=320" );
    },

    renderVideo: function () {
//      console.log( this.videoData );
//      console.log( 'render video' );

      // Hide end slate
      this.hideEndSlate();

//      var self = this;
//      var videoId = this.videoData.id;
      var youtubeId = this.videoData.youtubeId;
      var youtubeDataApiKey = this.youtubeDataApiKey;
      this.YTControls = this.showYTControls();

      //create a new Player
      this.ytplayer = new YoutubeCustomPlayer( 'videoContainer', {
//        embedCode: embedCode, // custom embed code
        alwaysVisible: false, // if the controls should be always visible or hide after a few seconds
        //hl: 'en', // force the language for subtitles and CC
        hideControlsDelay: 2500, // time in ms before hiding the controls, after mouse exits the video
        videoId: youtubeId, //id of the yt video
        wmode: 'transparent', //opaque/transparent/direct
        YTControls: this.YTControls,
        controls: 1, // show custom controls (1 yes - 0 controlless)
        // showinfo: 0, // show infos bubules on video ?
        autoplay: this.isTouch ? 0 : 1, // show youtube original controls (will not render the custom controls)
        rel: 0, //show related videos at the end ?
        APIkey: youtubeDataApiKey,
//        onVideoEnd: this.onVideoEnd,
//        onVideoPlay: this.onVideoPlay,
//        onVideoReady: this.onVideoReady
      } );

      this.ytplayer.on( 'ended', this.onVideoEnd.bind( this ) );
      this.ytplayer.on( 'play', this.onVideoPlay.bind( this ) );
      this.ytplayer.on( 'ready', this.onVideoReady.bind( this ) );

    },


    /**
     * Decide to show the original YouTube controls, or the customized ones.
     * This is useful to keep full access on mobiles (for example, to get the Youtube CC icon on Iphone video player).
     * @returns {boolean}
     */
    showYTControls: function () {

      if ( this.isPhone ) {
        return true;
      } else {
        return false;
      }

    },

    onVideoPlay: function () {
//      console.log( 'video PLAY' );
      if ( this.isTouch && !this.isPhone ) {
        $( '#backgroundImage, #big-play-btn-wrapper' ).hide();
      }

      $( '#mainEpisode' ).addClass( 'videoPlaying' );
    },


    hideCover: function () {

      var $transitionCover = $( '#backgroundContainer .transition-cover' );

      $transitionCover.velocity( 'fadeOut', {
        duration: 800,
        complete: function () {
          $( this ).css( 'display', 'none' );
        }
      } );

    },

    onVideoReady: function ( event ) {
//      console.log( 'player ready' );
      // 'this' represents the YoutubeCustomPlayer instance
      // 'this.ytplayer' represents the YouTube player object to access the Iframe API
//        console.log( this.ytplayer );

      this.hideCover();

      if ( !this.isTouch ) {

        $( '#backgroundImage, #big-play-btn-wrapper' ).velocity( 'fadeOut', {
          duration: 800,
          complete: function () {
            $( '#mainEpisode' ).addClass( 'videoPlaying' );
          }
        } );

      } else if ( this.isPhone ) {
        // phone
        $( '#backgroundImage' ).remove();
      }

      // Update Google Analytics (send)
//      window.ga( 'send', {
//        'hitType': 'event',          // Required.
//        'eventCategory': 'play video',   // Required.
//        'eventAction': 'play',      // Required.
//        'eventLabel': this.ytplayer.id
//      } );

    },


    onVideoEnd: function () {
//      console.log( 'video ENDED' );
//      console.log(this);

      // Show big play btn
      if ( !this.isPhone ) {
        $( '#backgroundImage, #big-play-btn-wrapper' ).velocity( 'fadeIn', {duration: 400} );
      }

      $( '#big-play-btn' ).removeClass( 'startVideo' );
      $( '#mainEpisode' ).removeClass( 'videoPlaying' );

      this.ytplayer.seek( 0 );
      this.ytplayer.pause();

      // Endslate
      if ( this.videos.length > 1 && !this.isTouch ) {
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

    update: function ( videoData ) {
      console.log( videoData );

      var $mainEpisodeContent = this.$( 'mainEpisodeContent' );

      $mainEpisodeContent.find( 'h3' ).html( videoData.title );
      $mainEpisodeContent.find( 'p' ).html( videoData.description );
      $mainEpisodeContent.find( "[data-video-id='" + this.lastVideoId + "']" ).html( videoData.id );

      this.lastVideoId = videoData.id;
    },

    render: function ( videoData ) {
//      console.log( 'render main video' );

      // Destroy any previous player
//      if ( this.ytplayer ) {
//        var height = $( '#videoContainer-video' ).height();
//        $( '#mainEpisodeVideo' ).height( height );
////        console.log(height);
//        this.ytplayer.destroy();
//      }

      // Render
      this.videoData = videoData;
      this.$el.html( Mustache.render( template, {
        mainEpisode: videoData
      } ) );

      // Setup events
      if ( !this.eventsAdded ) {
        this.eventsAdded = true;
        this.setupEvents();
      }

      // Remove video poster and play btn on touch devices to avoid 2 clicks to play
//      if ( this.isTouch ) {
      this.renderVideo();
//      }

      return this;
    }

  } );
} );