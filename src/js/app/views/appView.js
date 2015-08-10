define( [
  'backbone',
  'mustache',
  'routes',
  'text!templates/appTemplate.html',
  'views/mainVideo',
  'underscore',
//  'views/analytics'
], function ( Backbone, Mustache, routes, template, mainVideo, _, ga ) {
  'use strict';

  return Backbone.View.extend( {

    className: 'guInteractive',

//    events: {
//      'click .episodeBlock.inactiveVideo': 'switchVideo'
//    },

    switchVideo: function ( e ) {

      var videoId = _.isString( e ) ? e : $( e.currentTarget ).attr( 'data-video-id' );
//      var videoId = $( e.currentTarget ).attr( 'data-video-id' );

//      window.ga( 'send', {
//        'hitType': 'event',          // Required.
//        'eventCategory': 'switch video',   // Required.
//        'eventAction': 'click',      // Required.
//        'eventLabel': videoId
//      } );

      var foundValue = _.findWhere( this.allEpisodes, {
        'id': videoId
      } );

      this.mainEpisode = foundValue;
      this.mainVideo.render( this.mainEpisode );
      var self = this;

      var videoOffset = $( '#mainEpisode' ).offset().top - 40;

      $( 'html,body' ).animate( {
        scrollTop: videoOffset
      }, 500, function () {
        self.mainVideo.playVideo();
      } );

      this.changeQuerystring();
      this.updateActiveVideo();
    },

    changeQuerystring: function () {
      if ( history.pushState ) {
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?video=' + this.mainEpisode.id;
        window.history.pushState( {path: newurl}, '', newurl );
      }
    },

    updateActiveVideo: function () {
      var currentVideoId = this.mainEpisode.id;
      $( '.episodeBlock' ).removeClass( 'activeVideo' );

      $( '.episodeBlock' ).removeClass( 'inactiveVideo' );
      $( '.episodeBlock' ).addClass( 'inactiveVideo' );

      $( '.episodeBlock.' + currentVideoId ).removeClass( 'inactiveVideo' );
      $( '.episodeBlock.' + currentVideoId ).addClass( 'activeVideo' );
    },

    selectInitialVideo: function () {
      this.queryValue = "";
      var queryString = document.location.search;
      if ( queryString ) {
        var queryDate = queryString.split( '=' )[1];
        if ( queryDate ) {
          this.queryValue = queryDate;
        }
      }

      if ( this.queryValue ) {
        var foundValue = _.findWhere( this.allEpisodes, {
          'id': this.queryValue
        } );
        if ( foundValue ) {
          this.mainEpisode = foundValue;
        }
      }

      if ( typeof this.mainEpisode === "undefined" ) {
        this.mainEpisode = this.allEpisodes[0];
        // _.last( this.allEpisodes );
        // this.mainEpisode = _.last( _.where( this.allEpisodes, {'published': 'yes'} ) );
      }
    },


    initialize: function ( options ) {

      // Touch?
      this.isTouch = (('ontouchstart' in window) || ('ontouchstart' in document.documentElement) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
      if ( this.isTouch ) {
        $( 'body' ).addClass( 'touch' );
      }

      // Get custom data for videos
      this.data = options.json;

      // Get videos data from YouTube playlist
      this.videos = this.getVideos( options.playlistItemsData );

      // Reverse the order of videos to get the last first
      this.videos.reverse();

      this.mainVideo = new mainVideo( {
        youtubeDataApiKey: options.youtubeDataApiKey,
        videos: this.videos,
        isTouch: this.isTouch,
        mainApp: this
      } );

      this.setupEvents();

//      console.log( this.data );
//      console.log( options.playlistItemsData );
//      console.log( this.videos );
    },

    setupEvents: function () {
      var click = this.isTouch ? 'touchstart' : 'click';

      //'click .episodeBlock.inactiveVideo': 'switchVideo'
      this.$el.on( click, '.episodeBlock.inactiveVideo', this.switchVideo.bind( this ) );

    },

    getVideos: function ( playlistItemsData ) {
      var videos = [];
      var items = playlistItemsData.items;
      var maxDescriptionLength = 80;

      items.forEach( function ( item, i ) {
        var item = item.snippet;

        if ( item.resourceId && item.resourceId.kind == "youtube#video" ) {
          var video = {};
          video.id = item.resourceId.videoId;
          video.youtubeId = video.id;
          video.title = item.title;
          video.description = item.description.replace( /\n/g, "<br>" );
          video.shortDescription = item.description.substring( 0, maxDescriptionLength ) + '...';
          video.shortDescription = video.shortDescription.replace( /\n/g, "<br>" ).trim();
          video.thumbnails = item.thumbnails;
          video.publishedAt = item.publishedAt;
          videos.push( video );
        }

      } );

      return videos;
    },

    formatDate: function ( date ) {
      var day = date.split( '/' )[0];
      var monthNumber = parseInt( date.split( '/' )[1] );
      var month = this.months[monthNumber - 1];
      return day + " " + month;
    },

    getEmbedPath: function ( url ) {
      var embedUrl = 'http://embed.theguardian.com/embed/video';
      var parsedUrl = document.createElement( 'a' );
      parsedUrl.href = url;

      var pathname = parsedUrl.pathname;

      if ( pathname[0] === "/" ) {
        return embedUrl + pathname;
      } else {
        return embedUrl + '/' + pathname;
      }
    },

    render: function () {
      var _this = this;
      this.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      //Format videos
//      var videos = this.data.videos;
      var videos = this.videos;
      this.allEpisodes = _.map( videos, function ( episode ) {

        if ( episode.date ) {
          episode.date = _this.formatDate( episode.date );
        }

//        if ( episode.video ) {
//          episode.video = _this.getEmbedPath( episode.video );
//        }

        return episode;
      } );

//      this.teaser = this.data.teaser[0];
//      this.teaser.date = this.formatDate( this.teaser.date );
//      this.teaser.video = this.getEmbedPath( this.teaser.video );

      //Decide which video to play first
      this.selectInitialVideo();

      // Check if in app or on website
      var isWeb = true;
      if ( typeof window.guardian === "undefined" ) {
        isWeb = false;
      }

      $( '#article-body' ).addClass( 'interactivePadding' );
      $( '#article-header' ).addClass( 'interactiveHide' );

      // Render main template
      this.$el.html( Mustache.render( template, {
        allEpisodes: this.allEpisodes,
        teaser: this.teaser,
        isWeb: isWeb
      } ) );

      // Render main video
      this.$( '#mainVideoContainer' ).html( this.mainVideo.render( this.mainEpisode ).el );

      this.updateActiveVideo();

      return this;
    }
  } );
} );

