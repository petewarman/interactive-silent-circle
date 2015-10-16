define( [
  'underscore',
  'backbone',
  'mustache',
//  'routes',

  // Tpl
  'text!templates/appTemplate.html',

  // Views
  'views/mainVideo',

  // Velocity
  'velocity',

  // Google Analytics
  'analytics'

], function ( _, Backbone, Mustache, template, mainVideo, velocity, ga ) {
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

      // Paths
      this.path = options.path;

      // Get Coming soon data for videos (videos not yet on youtube)
      this.videosExtraData = options.videosExtraData;
      this.copy = options.copy;

      // Get videos data from YouTube playlist
      this.videos = this.getVideos( options.playlistItemsData );
      this.comingSoonVideos = this.getComingSoonVideos( this.videos );

      // Reverse the order of videos to get the last first
      //this.videos.reverse();

      this.mainVideo = new mainVideo( {
        youtubeDataApiKey: options.youtubeDataApiKey,
        videos: this.videos,
        copy: this.copy,
        isTouch: this.isTouch,
        mainApp: this,
//        rootPath: this.rootPath //
      } );

      this.setupEvents();
    },


    switchVideo: function ( e ) {
      var self = this;
      var videoId = _.isString( e ) ? e : $( e.currentTarget ).closest( '.inactiveVideo' ).attr( 'data-video-id' );
      var foundValue = _.findWhere( this.allEpisodes, {
        'id': videoId
      } );
      var currentScrolltop = $( 'body' ).scrollTop();
      var videoOffset = $( '#mainEpisode' ).offset().top - 40;
      var diff = Math.abs( currentScrolltop - videoOffset );
      var $transitionCover = $( '#backgroundContainer .transition-cover' );

      this.mainEpisode = foundValue;

      // Show cover
      $transitionCover.show().css( 'opacity', 1 );

      // Pause the player
      if ( this.mainVideo.ytplayer && this.mainVideo.ytplayer.isReady )
        this.mainVideo.ytplayer.pause();

      // Scroll up to show the video area
      $( 'html,body' ).velocity( 'scroll', {
        duration: diff,
        offset: videoOffset,
        mobileHA: false,
        complete: function () {
          self.mainVideo.render( self.mainEpisode );

          // self.mainVideo.renderVideo();
          // console.log('SWITCH', self.mainVideo.videoData.title);

          // Google Analytics
          window.ga( 'send', {
            'hitType': 'event',          // Required.
            'eventCategory': 'switch video',   // Required.
            'eventAction': 'click',      // Required.
            'eventLabel': self.mainVideo.videoData.title
          } );

        }
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
        this.mainEpisode = this.allEpisodes[this.allEpisodes.length - 1];
      }
    },


    setupEvents: function () {
//      var click = this.isTouch ? 'touchstart' : 'click';

      //'click .episodeBlock.inactiveVideo': 'switchVideo'
      this.$el.on( 'click', '.episodeBlock.inactiveVideo .thumb-wrapper img', this.switchVideo.bind( this ) );

      this.$el.on( 'click', '#shareTwitter, #shareFacebook', this.sharePage.bind( this ) );
    },

    sharePage: function ( e ) {
      var twitterBaseUrl = this.copy.twitterBaseUrl;
      var facebookBaseUrl = this.copy.facebookBaseUrl;
      var sharemessage = this.copy.sharePageMessage + " ";
      var network = $( e.currentTarget ).attr( 'data-source' );
      var shareWindow = "";
      var img = this.copy.pageUrl + 'assets/imgs/' + this.copy.sharePageImg;
      var guardianUrl = this.copy.pageUrl;

//      console.log(img,this.path,  this.copy.sharePageImg);

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
          encodeURIComponent( img ) +
          "&redirect_uri=http://www.theguardian.com";
      }
      window.open( shareWindow, network + "share", "width=640, height=320" );
    },

    getComingSoonVideos: function ( playlistVideos ) {
      var self = this;
      var videos = [];
      var playlistCount = playlistVideos.length;
      var comingSoonCount = this.videosExtraData.length;
      var comingSoonToShow = comingSoonCount - playlistCount;

      // Add "coming soon" videos (videos not yet on the YouTube playlist)
      if ( comingSoonToShow > 0 ) {
        var extraData = this.videosExtraData;
        var startAt = comingSoonCount - comingSoonToShow;
        for ( var i = startAt; i < comingSoonCount; i++ ) {
          var video = {};
          video.comingSoon = true;
          video.episode = extraData[i].episode;
          video.publishedAt = extraData[i].publishedAt;
          video.title = extraData[i].comingSoonTitle;
          video.shortDescription = extraData[i].comingSoonDescription;
//          video.shortDescription = self.getShortDescription( extraData[i].description );
          video.img = extraData[i].img;
          video.date = self.formatDate( extraData[i].publishedAt );
          video.dateTitle = this.copy.publishedAtTitle + video.date;

          video.twitterMessage = extraData[i].twitterMessage;

          videos.push( video ); //
        }
      }

      return videos;
    },

    getVideos: function ( playlistItemsData ) {
      var self = this;
      var videos = [];
      var items = playlistItemsData.items;
      var videosExtraData = this.videosExtraData;

      if ( items ) {
        items.forEach( function ( item, i ) {
          var item = item.snippet;

          if ( item.title != 'Private video' && item.resourceId && item.resourceId.kind == "youtube#video" ) {
            var video = {};
            video.comingSoon = false;
            video.id = item.resourceId.videoId;
            video.youtubeId = video.id;
            video.title = item.title;
            video.description = item.description.replace( /\n/g, "<br>" ).trim();
            video.shortDescription = videosExtraData[i].shortDescription; //self.getShortDescription( item.description );

            video.twitterMessage = videosExtraData[i].twitterMessage;

            video.thumbnails = item.thumbnails;
            video.publishedAt = item.publishedAt;
            //          video.date = self.formatDate( item.publishedAt );
            videos.push( video );
          }

        } );
      }

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

      $( '#article-body' ).addClass( 'interactivePadding' );
      $( '#article-header' ).addClass( 'interactiveHide' );

      // Render main template
      this.$el.html( Mustache.render( template, {
        videos: this.allEpisodes,
        comingSoonVideos: this.comingSoonVideos,
        teaser: this.teaser,
        path: this.path
      } ) );

      // Render main video
      this.$( '#mainVideoContainer' ).html( this.mainVideo.render( this.mainEpisode ).el );

      // Remove the poster and create youtube player
      //if ( this.isTouch ) {
      //  this.mainVideo.renderVideo();
      //}

      // Always autoplay the video (render it and play)
      this.mainVideo.renderVideo();


      this.updateActiveVideo();


      // Update main video box sizes
      setTimeout( function () {
        this.mainVideo.onResize();
      }.bind( this ), 0 );


      return this;
    }
  } );
} );

