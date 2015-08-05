define( [
  'backbone',
  'mustache',
  'routes',
  'text!templates/appTemplate.html',
  'views/mainVideo',
  'underscore',
  'views/analytics'
], function ( Backbone, Mustache, routes, template, mainVideo, _, ga ) {
  'use strict';

  return Backbone.View.extend( {

    className: 'guInteractive',

    events: {
      'click .episodeBlock.published-yes.inactiveVideo': 'switchVideo'
    },

    switchVideo: function ( e ) {
      var videoId = $( e.currentTarget ).attr( 'data-video-id' );

      window.ga( 'send', {
        'hitType': 'event',          // Required.
        'eventCategory': 'switch video',   // Required.
        'eventAction': 'click',      // Required.
        'eventLabel': videoId
      } );

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
      var currentDateId = this.mainEpisode.coupleid;
      $( '.episodeBlock' ).removeClass( 'activeVideo' );

      $( '.episodeBlock' ).removeClass( 'inactiveVideo' );
      $( '.episodeBlock' ).addClass( 'inactiveVideo' );

      $( '.episodeBlock.' + currentDateId ).removeClass( 'inactiveVideo' );
      $( '.episodeBlock.' + currentDateId ).addClass( 'activeVideo' );
    },

    selectInitialDate: function () {
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
          'coupleid': this.queryValue
        } );
        if ( foundValue ) {
          this.mainEpisode = foundValue;
        }
      }

      if ( typeof this.mainEpisode === "undefined" ) {
        this.mainEpisode = _.last( _.where( this.allEpisodes, {'published': 'yes'} ) );
      }
    },

    animateHeader: function () {
      $( '<img/>' ).attr( 'src', '{{assets}}/imgs/header_off.jpg' ).load( function () {
        var $header = $( '#headerImage img' );
        setInterval( function () {
          var i = 0;
          var state = {
            off: "on",
            on: "off"
          };

          function flicker( current ) {
            $header.attr( 'src', '{{assets}}/imgs/header_' + current + '.jpg' );
            if ( i < 3 ) {
              i++;
              setTimeout( function () {
                flicker( state[current] );
              }, 100 * (i / 2) );
            }
          }

          flicker( 'off' );
        }, 8000 )
      } );
    },

    initialize: function ( options ) {
      this.mainVideo = new mainVideo();
      this.data = options.data.sheets;
      console.log(this.data);
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
      this.allEpisodes = _.map( this.data.videos, function ( episode ) {
        episode.date = _this.formatDate( episode.date );
        if ( episode.video ) {
          episode.video = _this.getEmbedPath( episode.video );
        }
        return episode;
      } );

      this.teaser = this.data.teaser[0];
      this.teaser.date = this.formatDate( this.teaser.date );
      this.teaser.video = this.getEmbedPath( this.teaser.video );

      //Decide which video to play first
      this.selectInitialDate();

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

      this.animateHeader();
      this.updateActiveVideo();

      return this;
    }
  } );
} );

