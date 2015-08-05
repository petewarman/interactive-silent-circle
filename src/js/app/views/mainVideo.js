define( [
  'backbone',
  'mustache',
  'text!templates/mainVideo.html',
  'underscore',
  'yt-player'
], function ( Backbone, Mustache, template, _, YoutubeCustomPlayer ) {
  'use strict';

  return Backbone.View.extend( {
//    events: {
//      'click #mainEpisodeVideo': 'playVideo',
//      'click #shareButtons button': 'shareVideo'
//    },

    initialize: function () {

      console.log(YoutubeCustomPlayer);

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

      // Inject video iframe
//      this.$videoContainer

      console.log( this.videoData );

//      var iframe = '<iframe src="' + this.videoData.video + '#autoplay" scrolling="no" frameborder="none" width="100%" height="100%"></iframe>';
//      var embedYoutube = '<iframe id="ytplayer" type="text/html" width="100%" height="100%" src="http://www.youtube.com/embed/' + this.videoData.youtubeId + '?cc_load_policy=1&autoplay=1" frameborder="0"/>';

//      var youtubeVideo = '<div id="" class=""></div>'
//
//      $( '#videoContainer' ).html( youtubeVideo );

      var videoId = this.videoData.id;
      var youtubeId = this.videoData.youtubeId;
      var embedCode = this.videoData.embedCode;

      //create a new Player
      var ytPlayer = new YoutubeCustomPlayer('videoContainer', {
//        embedCode: embedCode,
        hl: 'it',
        videoId: youtubeId, //id of the yt video
        wmode: 'transparent', //opaque/transparent/direct
        controls: 1, // show yt controls ?
        showinfo: 0, // show infos bubules on video ?
        autoplay: 1, //autoplay ?
        rel: 0 //show related videos at the end ?

      }, function(event){

        console.log('player ready');
//        console.log(this.ytplayer.getOptions('cc'));

        $( '#backgroundImage' ).fadeOut( 500, function () {
          $( '#mainEpisode' ).addClass( 'videoPlaying' );
        } );

        // Update Google Analytics (send)
        window.ga( 'send', {
          'hitType': 'event',          // Required.
          'eventCategory': 'play video',   // Required.
          'eventAction': 'play',      // Required.
          'eventLabel': videoId
        } );

      });

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