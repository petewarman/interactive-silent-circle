define( [
  'backbone',
  'mustache',
  'routes',
  'text!templates/appTemplate.html',
  'views/mainVideo',
  'underscore',
  'velocity',
  'velocity-ui'
//  'views/analytics'
], function ( Backbone, Mustache, routes, template, mainVideo, _, ga, velocity ) {
  'use strict';

  return Backbone.View.extend( {

    className: 'guInteractive',

    initialize: function ( options ) {
      // Touch?
      this.isTouch = (('ontouchstart' in window) || ('ontouchstart' in document.documentElement) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
      if ( this.isTouch ) {
        $( 'body' ).addClass( 'touch' );
      } else {
        $( 'body' ).addClass( 'no-touch' );
      }

      // Get Coming soon data for videos (videos not yet on youtube)
      this.comingSoon = options.comingSoon;

      // Get videos data from YouTube playlist
      this.videos = this.getVideos( options.playlistItemsData );
      this.comingSoonVideos = this.getComingSoonVideos( this.videos );

      // Reverse the order of videos to get the last first
      this.videos.reverse();

      this.mainVideo = new mainVideo( {
        youtubeDataApiKey: options.youtubeDataApiKey,
        videos: this.videos,
        isTouch: this.isTouch,
        mainApp: this
      } );

      this.setupEvents();

//      console.log( this.comingSoon );
//      console.log( options.playlistItemsData );
//      console.log( this.videos );
    },


//    animateScroll: function ( elem, style, unit, from, to, time, prop, callback ) {
//      if ( !elem ) return;
//      var start = new Date().getTime();
//      elem.style[style] = from + unit;
//
//      function animate() {
//        var step = Math.min( 1, (new Date().getTime() - start) / time );
//        if ( prop ) {
//          elem[style] = (from + step * (to - from)) + unit;
//        } else {
//          elem.style[style] = (from + step * (to - from)) + unit;
//        }
//        if ( step != 1 ) {
//          requestAnimationFrame( animate );
//        } else {
//          if ( callback )
//            callback();
//        }
//      }
//
//      requestAnimationFrame( animate );
//    },

    switchVideo: function ( e ) {
      var self = this;
      var videoId = _.isString( e ) ? e : $( e.currentTarget ).closest( '.inactiveVideo' ).attr( 'data-video-id' );
      var foundValue = _.findWhere( this.allEpisodes, {
        'id': videoId
      } );
      var currentScrolltop = $( 'body' ).scrollTop();
      var videoOffset = $( '#mainEpisode' ).offset().top - 40;
      var diff = Math.abs(currentScrolltop - videoOffset);
      var $transitionCover = $('#backgroundContainer .transition-cover');

      this.mainEpisode = foundValue;

      // Show cover
      $transitionCover.show().css('opacity', 1);

      // Pause the player
      if (this.mainVideo.ytplayer && this.mainVideo.ytplayer.isReady)
        this.mainVideo.ytplayer.pause();

//      console.log(this.mainVideo.ytplayer);

//      window.ga( 'send', {
//        'hitType': 'event',          // Required.
//        'eventCategory': 'switch video',   // Required.
//        'eventAction': 'click',      // Required.
//        'eventLabel': videoId
//      } );

      // Scroll up to show the video area
      $( 'html,body' ).velocity( 'scroll', {
        duration: diff,
        offset: videoOffset,
        mobileHA: false,
        complete: function () {
          self.mainVideo.render( self.mainEpisode );
          self.mainVideo.renderVideo();
        }
      } );


//      setTimeout(function() {
//        self.mainEpisode = foundValue;
//        self.mainVideo.render( self.mainEpisode );
//        if ( !self.isTouch ) {
//          self.mainVideo.renderVideo();
//        }
//      }, diff);

//      var target = document.getElementById( "mainEpisode" );
//      this.animateScroll( document.body, "scrollTop", "", document.body.scrollTop, target.offsetTop - 40, 600, true, function () {
//        if ( !self.isTouch ) {
//          self.mainVideo.renderVideo();
//        }
//      } );

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
      var $episodeBlock = $( '.episodeBlock' ).not( '.coming-soon' );

      $episodeBlock.removeClass( 'activeVideo inactiveVideo' );
      $episodeBlock.addClass( 'inactiveVideo' );

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
      }
    },


    setupEvents: function () {
//      var click = this.isTouch ? 'touchstart' : 'click';

      //'click .episodeBlock.inactiveVideo': 'switchVideo'
      this.$el.on( 'click', '.episodeBlock.inactiveVideo .thumb-wrapper img', this.switchVideo.bind( this ) );
    },

    getComingSoonVideos: function ( playlistVideos ) {
      var self = this;
      var videos = [];
      var items = playlistVideos;
      var playlistCount = items.length;

      var comingSoonCount = this.comingSoon.videos.length;
      var comingSoonToShow = comingSoonCount - playlistCount;

      // Add "coming soon" videos (videos not yet on the YouTube playlist)
      if ( comingSoonToShow > 0 ) {
        var comingSoon = this.comingSoon.videos;
        var startAt = comingSoonCount - comingSoonToShow;
        for ( var i = startAt; i < comingSoonCount; i++ ) {
          var video = {};
          video.comingSoon = true;
          video.episode = comingSoon[i].episode;
          video.publishedAt = comingSoon[i].publishedAt;
          video.title = comingSoon[i].title;
          video.description = comingSoon[i].description;
          video.shortDescription = self.getShortDescription( comingSoon[i].description );
          video.img = comingSoon[i].img;
          video.date = self.formatDate( comingSoon[i].publishedAt );
          videos.push( video );
        }
      }

      return videos;
    },

    getVideos: function ( playlistItemsData ) {
      var self = this;
      var videos = [];
      var items = playlistItemsData.items;

      items.forEach( function ( item, i ) {
        var item = item.snippet;

        if ( item.title != 'Private video' && item.resourceId && item.resourceId.kind == "youtube#video" ) {
          var video = {};
          video.comingSoon = false;
          video.id = item.resourceId.videoId;
          video.youtubeId = video.id;
          video.title = item.title;
          video.description = item.description.replace( /\n/g, "<br>" ).trim();
          video.shortDescription = self.getShortDescription( item.description );

          video.thumbnails = item.thumbnails;
          video.publishedAt = item.publishedAt;
//          video.date = self.formatDate( item.publishedAt );
          videos.push( video );
        }

      } );

      return videos;
    },

    getShortDescription: function ( desc ) {
      var maxDescriptionLength = 80;
      var shortDesc = '';
      if ( desc.length > 1 && desc.length > maxDescriptionLength ) {
        shortDesc = desc.substring( 0, maxDescriptionLength );
        shortDesc = shortDesc.replace( /\n/g, "<br>" ).trim();
        shortDesc = shortDesc + '...';
      } else {
        shortDesc = desc;
      }

      return shortDesc;
    },

    formatDate: function ( date ) {
      var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      var day = date.split( '/' )[0];
      var monthNumber = parseInt( date.split( '/' )[1] );
      var month = months[monthNumber - 1];
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
      this.allEpisodes = this.videos;

//      console.log( this.allEpisodes );

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
        videos: this.allEpisodes,
        comingSoonVideos: this.comingSoonVideos,
        teaser: this.teaser,
        isWeb: isWeb
      } ) );

      // Render main video
      this.$( '#mainVideoContainer' ).html( this.mainVideo.render( this.mainEpisode ).el );

      // Remove the poster and create youtube player
      if ( this.isTouch ) {
        this.mainVideo.renderVideo();
      }

      this.updateActiveVideo();

      return this;
    }
  } );
} );

