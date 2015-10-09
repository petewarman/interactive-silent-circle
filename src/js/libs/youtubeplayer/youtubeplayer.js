define( [
  'text!yt-player-icon-play-pause',
  'text!yt-player-icon-embed',
  'text!yt-player-icon-volume',
  'text!yt-player-icon-fullscreen',
  'text!yt-player-icon-cc',
  'text!yt-player-icon-languages',
  'text!yt-player-icon-hd'
], function ( playPauseSvg, embedSvg, volumeSvg, fullscreenSvg, ccSvg, languagesSvg, hdSvg ) {

  'use strict';

  var isTouch = (('ontouchstart' in window) || ('ontouchstart' in document.documentElement) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
  var hasMSPointer = window.navigator.msPointerEnabled;
  var UI_DOWN = isTouch ? 'touchstart' : ( hasMSPointer ? 'MSPointerDown' : 'mousedown' );
  var UI_UP = isTouch ? 'touchend' : ( hasMSPointer ? 'MSPointerUp' : 'mouseup' );
  var UI_MOVE = isTouch ? 'touchmove' : ( hasMSPointer ? 'MSPointerMove' : 'mousemove' );

  var a = function ( elem, options ) {

    var k = this,
      $elem = $( elem ),
      seekbar, handler, g, l;

    var d = this.slider = $.extend( {
      seekbar: null,
      handle: null,
      orientation: "horizontal",
      value: 0,
      min: 0,
      max: 100,
      invert: false,
      slide: function () {
      },
      stop: function () {
      }
    }, options || {} );

    if ( this.slider.seekbar ) {
      seekbar = $( this.slider.seekbar );
    } else {
      seekbar = $( '<div class="slider-seekbar"></div>' );
      $elem.append( seekbar );
    }

    if ( this.slider.handle ) {
      handler = $( this.slider.handle );
    } else {
      handler = $( '<div class="slider-cursor"></div>' );
      seekbar.append( handler );
    }

    g = this.slider.orientation === "horizontal" ? this.slider.invert
      ? "right" : "left" : this.slider.invert ? "bottom" : "top";

    l = this.slider.orientation === "horizontal" ? "width" : "height";

    this.slider.range = this.slider.max - this.slider.min;

    function onMove( e ) {
      e.preventDefault();
      i( e )
    }

    function onUp() {
      $( document ).off( UI_MOVE, onMove );
      $( document ).off( UI_UP, onUp );
      k.slider.stop( $elem, k.slider )
    }

    $elem.on( UI_DOWN, function ( e ) {
      e.preventDefault();
      i( e );
      $( document ).on( UI_MOVE, onMove );
      $( document ).on( UI_UP, onUp )
    } );

    function i( e ) {
      var s = $elem.offset(),
        o = d.orientation === "horizontal" ? s.left : s.top,
        pageX = isTouch ? e.originalEvent.touches[0].pageX : e.pageX,
        pageY = isTouch ? e.originalEvent.touches[0].pageY : e.pageY,
        n = d.orientation === "horizontal" ? pageX : pageY,
        q = k.slider.invert ? (o + $elem[l]() - n) : (n - o),
        p;

      if ( q >= 0 && q <= $elem[l]() ) {
        p = handler[l]() / 2;
        handler.css( g, (q - p) + "px" );
        seekbar[l]( q );
        k.slider.value = k.slider.min + ((k.slider.range / $elem[l]()) * q);
        k.slider.slide( $elem, k.slider )
      }
    }

    this.resizeSeekBar = function ( o ) {
      var n = ((o - this.slider.min) / this.slider.range) * $elem[l]();
      seekbar[l]( n );
      handler.css( g, n + "px" )
    };

    this.update = function ( n ) {
      this.slider.range = this.slider.max - this.slider.min;
      this.resizeSeekBar( this.slider.value )
    };

    this.resizeSeekBar( this.slider.value );

  };

  $.fn.slider = function ( d ) {
    return this.each( function () {
      var $elem = $( this );
      if ( $elem.data( "slider" ) ) {
        return;
      }
      var inst = new a( this, d );
      $elem.data( "slider", inst );
    } )
  };


  /** --------------------------------------------------------------------------- */

  var debug = {};
  debug.log = function ( msg ) {
    $( '#debug' ).append( msg + '<br/>' );
  };


  /**
   * YoutubeCustomPlayer class.
   */
  function YoutubeCustomPlayer( id, options ) {

    this.$elem = $( '#' + id );

    this.id = id;
    this.instanceId = this.id.replace( /\-/g, '' );
    this.videoWrapperId = this.id + '-video';
    this.elemAttributes = this.$elem.prop( "attributes" );

    this.options = $.extend( {
      embedCode: null,
      videoId: this.$elem.attr( 'src' ) || null,
      wmode: 'transparent',
      YTControls: false,
      controls: typeof this.$elem.attr( 'controls' ) != "undefined" ? 1 : 0,
      autoplay: typeof this.$elem.attr( 'autoplay' ) != "undefined" ? 1 : 0,
      showinfo: 0,
      rel: 0,
      //hl: 'en',
      cc_load_policy: 1,
      alwaysVisible: false,
      APIkey: null,
      hideControlsDelay: 2000,
      onVideoReady: function () {
      },
      onVideoEnd: function () {
      },
      onVideoPlay: function () {
      },
      onVideoPause: function () {
      },
      onVideoBuffer: function () {
      },
      onVideoError: function () {
      }
    }, options || {} );


    this.options.skin = this.options.controls == 1 ? "base" : "controlLess";

    if ( this.options.videoId == null ) {
      throw new Error( id + " Sorry, options.videoId key must be specified" );
    }

    if ( typeof YoutubeCustomPlayer.skins[this.options.skin] == "undefined" ) {
      throw new Error( id + "Sorry, the skin you choose doesn't exist on YoutubeCustomPlayer.skins list" )
    }

    this.isIpad = ( navigator.userAgent.match( /.*(iPad).*/ ) ) ? true : false;
    this.isIphone = ( navigator.userAgent.match( /.*(iPhone).*/ ) ) ? true : false;
    this.isIOs = ( this.isIpad || this.isIphone ) ? true : false;
    this.isAndroid = ( navigator.userAgent.match( /.*(Android).*/ ) ) ? true : false;

    this.isTouch = (('ontouchstart' in window) || ('ontouchstart' in document.documentElement) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    this.htmlClass = this.isIpad ? 'yt-ipad yt-ios' : ( this.isIphone ? 'yt-iphone yt-ios' : '' );

    if ( this.isTouch )
      this.htmlClass += ' yt-touch';

    if ( YoutubeCustomPlayer.requestFullScreen ) {
      this.htmlClass += ' yt-support-fullscreen';
      this.supportFullscreen = true;
    }

    this.ytplayer = null;
    this.paused = true;
    this.muted = false;
    this.seeksliding = false;
    this.duration = 0;
    this.currentTime = 0;
    this.isFullScreen = false;
    this.progressTimer = null;
    this.timelineSlider = null;
    this.volumeSlider = null;
    this.isFirstPlay = true;
    this.mouseMoveTimer = null;
    this.isControlsHidden = false;
    this.onFullScrenChangeBinded = this.onFullScrenChange.bind( this );

    $( 'html' ).addClass( this.htmlClass );

    // Customize player?
    this.YTControls = this.options.YTControls;

    this.createSkin();
    this.createPlayer();

  }

  YoutubeCustomPlayer.prototype = {

    createSkin: function () {

//      var self = this;

      this.$elem.replaceWith( '<div id="' + this.id + '"></div>' );
      this.$elem = $( '#' + this.id );
      this.$elem.addClass( 'yt-player' );

      if ( this.YTControls ) {
        this.$elem.addClass( 'NO-custom-player' );
      }

//      $.each( this.elemAttributes, function () {
//        if ( this.value != null && this.value != 'null' ) {
//          self.$elem.attr( this.name, this.value )
//        }
//      } );

      this.$elem.append( YoutubeCustomPlayer.skins[this.options.skin] );


      this.$videoWrapper = this.$elem.find( '.yt-video-wrapper' ).attr( 'id', this.videoWrapperId );
      this.$loadingWrapper = this.$elem.find( '.yt-loading-wrapper' );
      this.$loading = this.$elem.find( '.yt-loading' );
      this.$bigPlayBtn = this.$elem.find( '.yt-big-play-btn' );

      if ( this.options.controls == 1 ) {
        this.$skinWrapper = this.$elem.find( '.yt-skin-wrapper' );
        this.$controlsWrapper = this.$elem.find( '.yt-controls-wrapper' );
        this.$playBtn = this.$elem.find( '.yt-play-btn' );
        this.$muteBtn = this.$elem.find( '.yt-mute-btn' );
        this.$hdBtn = this.$elem.find( '.yt-hd-btn' );
        this.$fullscreenBtn = this.$elem.find( '.yt-fullscreen-btn' );
        this.$timeline = this.$elem.find( '.yt-timeline' );
        this.$timecount = this.$elem.find( '.yt-time' );
        this.$buffer = this.$elem.find( '.yt-buffer' );
        this.$embed = this.$elem.find( '.yt-embed-btn' );
        this.$embedMessage = this.$elem.find( '.yt-embed-message' );
        this.$embedCode = this.$elem.find( '.yt-embed-code' );

        this.$languages = this.$elem.find( '.yt-languages-btn' );
        this.$languagesList = this.$elem.find( '.yt-languages-list' );
        this.$cc = this.$elem.find( '.yt-cc-btn' );

        this.$volume = this.$elem.find( '.yt-volume' );
        this.$volumeLevel = this.$elem.find( '.yt-volume-level' );
      }

      // Remove fullscreen button if iOS or not supported
      if ( this.isIOs || !this.supportFullscreen ) {
        this.$fullscreenBtn.remove();
      }

      if ( this.isIOs || this.isAndroid ) {
        this.$bigPlayBtn.hide();
      }

      this.$skinWrapper.hide();

    },

    updateVolumeLevel: function ( percent ) {
      this.lastVolumeLevel = percent;
      this.ytplayer.setVolume( percent );

      if ( percent == 0 ) {
        this.$muteBtn.removeClass( 'active' );
      } else {
        this.$muteBtn.addClass( 'active' );
      }
    },

    createPlayer: function () {

      this.ytplayer = new YT.Player( this.videoWrapperId, {
        height: '100%',
        width: '100%',
        videoId: this.options.videoId,
        playerVars: {
//          hl: this.options.hl,
          cc_load_policy: this.options.cc_load_policy,
          wmode: this.options.wmode,
          controls: this.YTControls ? 1 : 0,
          showinfo: this.options.showinfo,
          autoplay: this.options.autoplay,
          rel: this.options.rel
        },
        events: {
          onReady: this.onYoutubePlayerReady.bind( this ),
          onStateChange: this.onYoutubePlayerStateChange.bind( this ),
          onError: this.onYoutubePlayerError.bind( this )
        }
      } );

      YoutubeCustomPlayer[this.instanceId] = this;

    },

    onYoutubePlayerReady: function ( e ) {

      // Enable or disable captions
      if ( this.options.cc_load_policy === 1 ) {
        this.enableCaptions();
        this.getLanguagesList();
      } else {
        this.disableCaptions();
      }

      this.$elem.addClass( 'yt-ready' );
      this.currentVolume = this.ytplayer.getVolume();
      this.duration = this.ytplayer.getDuration();
      this.addListeners();
      this.options.onVideoReady.call( this );

      // Get video quality levels available
      //this.qualityLevels = this.ytplayer.getAvailableQualityLevels();
      //console.log( this.qualityLevels );

      this.trigger( 'ready' );
    },

    onYoutubePlayerError: function ( e ) {
      //console.log('onYoutubePlayerError', e);
      this.options.onVideoError.call( this );

      this.trigger( 'error' );
    },

    onYoutubePlayerStateChange: function ( e ) {
//      debug.log( 'onYoutubePlayerStateChange', e.data );

      if ( e.data == 0 ) { //ended
        this.onYoutubePlayerEnded( e );
      }
      if ( e.data == 1 ) { //play
        this.onYoutubePlayerPlay( e );
      }
      if ( e.data == 2 ) { //pause
        this.onYoutubePlayerPause( e );
      }
      if ( e.data == 3 ) { //buffer
        this.onYoutubePlayerBuffer( e );
      }
    },

    onYoutubePlayerBuffer: function () {
      this.options.onVideoBuffer.call( this );

      this.trigger( 'buffer' );
    },

    addListeners: function () {

      var self = this;
      var click = this.isTouch ? 'touchstart' : 'click';

      if ( this.options.controls === 0 ) {
        return;
      }

      this.$skinWrapper.on( click, function ( e ) {
        e.stopPropagation();
      } );

      // Change captions / subtitles language
      this.$skinWrapper.on( click, 'li.lang', function ( e ) {
        if ( self.ytplayer ) {
//          console.log( $( this ).data( 'lang' ) );
          self.ytplayer.setOption( "captions", "track", {"languageCode": $( this ).data( 'lang' )} );
        }
      } );

      // Toggle play
      this.$bigPlayBtn.on( 'click', function ( e ) {
        e.preventDefault();
        self.togglePlay();
      } );

      this.$playBtn.on( 'click', function ( e ) {
        e.preventDefault();
        self.togglePlay();
      } );

      // Toggle captions on/off
      this.$cc.on( click, this.toggleCaptions.bind( this ) );

      // Toggle HD video on/off
      this.$hdBtn.on( click, this.toggleHD.bind( this ) );

      // Toggle mute
      this.$muteBtn.on( click, function ( e ) {
        e.preventDefault();
        if ( self.muted ) {
          self.unmute();
        } else {
          self.mute();
        }
      } ).addClass( "active" );

      this.$embed.on( click, this.toggleEmbedMessage.bind( this ) );

      this.$fullscreenBtn.on( click, this.toggleFullScreen.bind( this ) );

      $( document ).on( 'keydown', function ( event ) {
        if ( event.keyCode == 27 ) {
          if ( self.isFullScreen == true ) {
            self.cancelFullScreen();
          }
        }
      } );

      // Languages list
      this.$languages.on( click, this.toggleLanguagesList );

      // Show/Hide controls on mousemove
      if ( !this.options.alwaysVisible ) {
        this.$elem.on( UI_MOVE + ' ' + (this.isTouch ? UI_DOWN : ''), this.toggleControls.bind( this ) );
      }

      // Create timeline slider
      this.$timeline.slider( {
        seekbar: this.$timeline.find( '.yt-seek' ),
        value: 0,
        min: 0,
        max: this.duration,
        slide: function ( e, slider ) {
          self.seeksliding = true;
          self.stopProgress();
        },
        stop: function ( e, slider ) {
          self.seeksliding = false;
          self.seek( slider.value );
          self.startProgress();
        }
      } );

      if ( this.$timeline.data( 'slider' ) != undefined )
        this.timelineSlider = this.$timeline.data( 'slider' );

      // Create volume slider
      this.$volume.slider( {
        seekbar: this.$volume.find( '.yt-volume-level' ),
        value: this.currentVolume,
        min: 0,
        max: 100,
        slide: function ( e, slider ) {
//          console.log( slider.value );
          self.updateVolumeLevel( slider.value );
        },
        stop: function ( e, slider ) {

        }
      } );

      if ( this.$volume.data( 'slider' ) != undefined )
        this.volumeSlider = this.$volume.data( 'slider' );

    },

//    onBigPlayBtnClick: function () {
//
//      console.log( 'YP plugin - onBigPlayBtnClick' );
//
//      this.options.onBigPlayBtnClick();
//      this.togglePlay();
//      this.trigger( 'playBtnClick' );
//    },

    toggleEmbedMessage: function () {
      this.$embedCode.val( this.ytplayer.getVideoEmbedCode() );

      this.$embedCode.on( 'mouseup touchend', function () {
        $( this ).select();
      } );

      if ( this.$embedMessage.is( ':visible' ) ) {
        this.$embed.removeClass( 'active' );
        this.$embedMessage.hide();
      } else {
        this.pause();
        this.$embed.addClass( 'active' );
        this.$embedMessage.show();
      }

    },

    toggleControls: function () {
//      console.log( 'toggle controls' );

      clearTimeout( this.mouseMoveTimer );

      if ( this.isControlsHidden ) {
        this.showControls();
      }

      this.mouseMoveTimer = setTimeout( this.hideControls.bind( this ), this.options.hideControlsDelay );
    },

    showControls: function () {
//      console.log( 'show controls' );
      this.isControlsHidden = false;
      this.$elem.removeClass( 'yt-no-controls' );
    },

    hideControls: function () {
//      console.log( 'hide controls' );
      this.isControlsHidden = true;
      this.$elem.addClass( 'yt-no-controls' );
    },


    onYoutubePlayerEnded: function () {
      this.onYoutubePlayerPause();
      this.options.onVideoEnd();
      this.trigger( 'ended' );
    },

    onYoutubePlayerPlay: function () {

      this.paused = false;
      this.$bigPlayBtn.addClass( 'active' );
      this.startProgress();

      if ( this.options.controls == 1 ) {
        this.$playBtn.addClass( 'active' );
        this.$skinWrapper.show();
        this.updateHD();

        if ( !this.options.alwaysVisible ) {
          this.toggleControls();
        }
      }

      if ( this.isIOs || this.isAndroid ) {
        this.$bigPlayBtn.show();
      }

      if ( this.isFirstPlay ) {
        this.isFirstPlay = false;
        this.duration = this.getDuration();
        this.updateSeekBar();
      }

      this.options.onVideoPlay.call( this );

      this.trigger( 'play' );
    },

    updateSeekBar: function () {
      if ( this.timelineSlider != null ) {
        this.timelineSlider.slider.max = this.duration;
        this.timelineSlider.slider.min = 0;
        this.timelineSlider.slider.value = 0;
        this.timelineSlider.update();
      }
    },

    onYoutubePlayerPause: function () {
      this.paused = true;
      this.$bigPlayBtn.removeClass( 'active' );
      this.stopProgress();
      if ( this.options.controls == 1 ) {
        this.$playBtn.removeClass( 'active' );
      }

      this.options.onVideoPause.call( this );

      this.trigger( 'pause' );
    },

    togglePlay: function () {
//      console.log( 'toogle Play', this.paused, this.paused ? 'play' : 'pause' );
      this[this.paused ? 'play' : 'pause']();
      this.paused = this.paused ? false : true;
    },

    toggleFullScreen: function () {
      if ( !this.isFullScreen ) {
        this.requestFullScreen();

      } else {
        this.cancelFullScreen();
      }
    },

    requestFullScreen: function () {
      var self = this;

      this.isFullScreen = true;
      this.pause();
      this.$elem.addClass( 'yt-fullscreen' );

      if ( this.options.controls == 1 ) {
        this.$fullscreenBtn.addClass( 'active' );
      }

      if ( YoutubeCustomPlayer.requestFullScreen ) {
        this.$elem[0][YoutubeCustomPlayer.requestFullScreen.requestFn]();
        $( document ).on( YoutubeCustomPlayer.requestFullScreen.eventName, this.onFullScrenChangeBinded );
      } else {
        setTimeout( function () {
          self.play();
        } );
      }

      $( 'body' ).addClass( 'yt-fullscreen' );

      this.onResize();

      //console.log(this.ytplayer.getPlaybackQuality());

    },

    onFullScrenChange: function () {
      if ( !document[YoutubeCustomPlayer.requestFullScreen.isFullScreen] ) {
        $( document ).off( YoutubeCustomPlayer.requestFullScreen.eventName, this.onFullScrenChangeBinded );
        this.cancelFullScreen();
      }
//      console.log( 'fullscreenchanged' );
      this.play();
    },

    cancelFullScreen: function () {

      var self = this;
      this.pause();
      this.$elem.removeClass( 'yt-fullscreen' );
      this.isFullScreen = false;

      if ( this.options.controls == 1 ) {
        this.$fullscreenBtn.removeClass( 'active' );
      }

      if ( YoutubeCustomPlayer.requestFullScreen ) {
        document[YoutubeCustomPlayer.requestFullScreen.cancelFn]();
      } else {
        setTimeout( function () {
          self.play();
        } );
      }
      $( 'body' ).removeClass( 'yt-fullscreen' );
      this.onResize();
    },

    onResize: function () {

    },

    play: function () {
      this.ytplayer.playVideo();
//      this.trigger( 'play' );
    },

    pause: function () {
      this.ytplayer.pauseVideo();
//      this.trigger( 'pause' );
    },

    unmute: function () {
      this.lastVolumeLevel = this.lastVolumeLevel !== 0 ? this.lastVolumeLevel : 50;
      this.$volumeLevel.width( this.lastVolumeLevel + '%' );
      this.muted = false;
      this.ytplayer.unMute();
      this.$muteBtn.addClass( 'active' );
    },

    mute: function () {
      this.lastVolumeLevel = this.$volumeLevel.width();
      this.$volumeLevel.width( 0 );
      this.muted = true;
      this.ytplayer.mute();
      this.$muteBtn.removeClass( 'active' );
    },

    updateHD: function () {

      var currentQuality = this.ytplayer.getPlaybackQuality();
      var qualityLevels = this.ytplayer.getAvailableQualityLevels();

      if ( qualityLevels.indexOf( "hd1080" ) > -1 || qualityLevels.indexOf( "hd720" ) > -1 ) {
        this.$hdBtn.show();
      } else {
        this.$hdBtn.hide();
      }

      if ( currentQuality === "hd1080" ) {
        this.$hdBtn.addClass( 'active' );
      } else if ( currentQuality === "hd720" && qualityLevels.indexOf( "hd1080" ) === -1 ) {
        this.$hdBtn.addClass( 'active' );
      } else {
        this.$hdBtn.removeClass( 'active' );
      }

    },

    toggleHD: function () {

      if ( this.$hdBtn.hasClass( 'active' ) ) {
        this.disableHD();
      } else {
        this.enableHD();
      }

    },

    enableHD: function () {

      // Change quality level to HD
      var qualityLevels = this.ytplayer.getAvailableQualityLevels();
      if ( qualityLevels.indexOf( "hd1080" ) > -1 ) {
        this.ytplayer.setPlaybackQuality( "hd1080" );
      } else if ( qualityLevels.indexOf( "hd720" ) > -1 ) {
        this.ytplayer.setPlaybackQuality( "hd720" );
      }

      // Highlight button
      this.$hdBtn.addClass( 'active' );

    },

    disableHD: function () {

      // Change quality level to default
      this.ytplayer.setPlaybackQuality( "default" );

      //console.log( this.ytplayer.getPlaybackQuality() );

      // Remove button highlight
      this.$hdBtn.removeClass( 'active' );
    },

    toggleCaptions: function () {
      if ( this.$cc.hasClass( 'active' ) ) {
        this.disableCaptions();
      } else {
        this.enableCaptions();
      }
    },

    enableCaptions: function () {
      this.ytplayer.loadModule( 'captions' );
      this.$cc.addClass( 'active' );
    },

    disableCaptions: function () {
      this.ytplayer.unloadModule( 'captions' );
      this.$cc.removeClass( 'active' );
    },

    removeCaptions: function () {
      this.$cc.hide();
    },

    seek: function ( t ) {
      this.ytplayer.seekTo( t, true );
    },

    startProgress: function () {
      clearTimeout( this.progressTimer );
      this.updateTime();
    },

    stopProgress: function () {
      clearTimeout( this.progressTimer );
      this.progressTimer = null;
    },

    getLanguagesList: function () {
      var APIkey = this.options.APIkey;

      if ( !APIkey ) {
        this.disableLanguageSelection();
        return;
      }

      // Get captions data
      var videoId = this.options.videoId;
      var url = 'https://www.googleapis.com/youtube/v3/captions?videoId=' + videoId + '&part=snippet&key=' + APIkey;
      $.ajax( {
        dataType: 'jsonp',
        url: url,
        success: this.createLanguagesMenu.bind( this )
      } );
    },

    localeCodeToEnglish: function ( loc ) {
      if ( typeof loc !== 'string' ) throw new TypeError( 'Input must be string' );

      switch ( loc ) {
        case 'en':
          return 'English';
        case 'en-GB':
          return 'English, UK';
        case 'zh-Hans':
          return 'Chinese, simplified';
        case 'es-419':
          return 'Spanish, LatAm';
      }

      var parts = loc.split( '-' ),
        ISO639_1 = {
          "ab": "Abkhazian",
          "aa": "Afar",
          "af": "Afrikaans",
          "ak": "Akan",
          "sq": "Albanian",
          "am": "Amharic",
          "ar": "Arabic",
          "an": "Aragonese",
          "hy": "Armenian",
          "as": "Assamese",
          "av": "Avaric",
          "ae": "Avestan",
          "ay": "Aymara",
          "az": "Azerbaijani",
          "bm": "Bambara",
          "ba": "Bashkir",
          "eu": "Basque",
          "be": "Belarusian",
          "bn": "Bengali",
          "bh": "Bihari languages",
          "bi": "Bislama",
          "nb": "Norwegian Bokmål",
          "bs": "Bosnian",
          "br": "Breton",
          "bg": "Bulgarian",
          "my": "Burmese",
          "es": "Spanish",
          "ca": "Valencian",
          "km": "Central Khmer",
          "ch": "Chamorro",
          "ce": "Chechen",
          "ny": "Nyanja",
          "zh": "Chinese",
          "za": "Zhuang",
          "cu": "Old Slavonic",
          "cv": "Chuvash",
          "kw": "Cornish",
          "co": "Corsican",
          "cr": "Cree",
          "hr": "Croatian",
          "cs": "Czech",
          "da": "Danish",
          "dv": "Maldivian",
          "nl": "Flemish",
          "dz": "Dzongkha",
          "en": "English",
          "eo": "Esperanto",
          "et": "Estonian",
          "ee": "Ewe",
          "fo": "Faroese",
          "fj": "Fijian",
          "fi": "Finnish",
          "fr": "French",
          "ff": "Fulah",
          "gd": "Scottish Gaelic",
          "gl": "Galician",
          "lg": "Ganda",
          "ka": "Georgian",
          "de": "German",
          "ki": "Kikuyu",
          "el": "Greek, Modern (1453-)",
          "kl": "Kalaallisut",
          "gn": "Guarani",
          "gu": "Gujarati",
          "ht": "Haitian Creole",
          "ha": "Hausa",
          "he": "Hebrew",
          "hz": "Herero",
          "hi": "Hindi",
          "ho": "Hiri Motu",
          "hu": "Hungarian",
          "is": "Icelandic",
          "io": "Ido",
          "ig": "Igbo",
          "id": "Indonesian",
          "ia": "Interlingua (International Auxiliary Language Association)",
          "ie": "Occidental",
          "iu": "Inuktitut",
          "ik": "Inupiaq",
          "ga": "Irish",
          "it": "Italian",
          "ja": "Japanese",
          "jv": "Javanese",
          "kn": "Kannada",
          "kr": "Kanuri",
          "ks": "Kashmiri",
          "kk": "Kazakh",
          "rw": "Kinyarwanda",
          "ky": "Kyrgyz",
          "kv": "Komi",
          "kg": "Kongo",
          "ko": "Korean",
          "kj": "Kwanyama",
          "ku": "Kurdish",
          "lo": "Lao",
          "la": "Latin",
          "lv": "Latvian",
          "lb": "Luxembourgish",
          "li": "Limburgish",
          "ln": "Lingala",
          "lt": "Lithuanian",
          "lu": "Luba-Katanga",
          "mk": "Macedonian",
          "mg": "Malagasy",
          "ms": "Malay",
          "ml": "Malayalam",
          "mt": "Maltese",
          "gv": "Manx",
          "mi": "Maori",
          "mr": "Marathi",
          "mh": "Marshallese",
          "ro": "Romanian",
          "mn": "Mongolian",
          "na": "Nauru",
          "nv": "Navajo",
          "nd": "North Ndebele",
          "nr": "South Ndebele",
          "ng": "Ndonga",
          "ne": "Nepali",
          "se": "Northern Sami",
          "no": "Norwegian",
          "nn": "Nynorsk, Norwegian",
          "ii": "Sichuan Yi",
          "oc": "Occitan (post 1500)",
          "oj": "Ojibwa",
          "or": "Oriya",
          "om": "Oromo",
          "os": "Ossetic",
          "pi": "Pali",
          "pa": "Punjabi",
          "ps": "Pushto",
          "fa": "Persian",
          "pl": "Polish",
          "pt": "Portuguese",
          "qu": "Quechua",
          "rm": "Romansh",
          "rn": "Rundi",
          "ru": "Russian",
          "sm": "Samoan",
          "sg": "Sango",
          "sa": "Sanskrit",
          "sc": "Sardinian",
          "sr": "Serbian",
          "sn": "Shona",
          "sd": "Sindhi",
          "si": "Sinhalese",
          "sk": "Slovak",
          "sl": "Slovenian",
          "so": "Somali",
          "st": "Sotho, Southern",
          "su": "Sundanese",
          "sw": "Swahili",
          "ss": "Swati",
          "sv": "Swedish",
          "tl": "Tagalog",
          "ty": "Tahitian",
          "tg": "Tajik",
          "ta": "Tamil",
          "tt": "Tatar",
          "te": "Telugu",
          "th": "Thai",
          "bo": "Tibetan",
          "ti": "Tigrinya",
          "to": "Tonga (Tonga Islands)",
          "ts": "Tsonga",
          "tn": "Tswana",
          "tr": "Turkish",
          "tk": "Turkmen",
          "tw": "Twi",
          "ug": "Uyghur",
          "uk": "Ukrainian",
          "ur": "Urdu",
          "uz": "Uzbek",
          "ve": "Venda",
          "vi": "Vietnamese",
          "vo": "Volapük",
          "wa": "Walloon",
          "cy": "Welsh",
          "fy": "Western Frisian",
          "wo": "Wolof",
          "xh": "Xhosa",
          "yi": "Yiddish",
          "yo": "Yoruba",
          "zu": "Zulu"
        },
        ISO639_2 = {
          "abk": "Abkhazian",
          "ace": "Achinese",
          "ach": "Acoli",
          "ada": "Adangme",
          "ady": "Adyghe",
          "aar": "Afar",
          "afh": "Afrihili",
          "afr": "Afrikaans",
          "afa": "Afro-Asiatic languages",
          "ain": "Ainu",
          "aka": "Akan",
          "akk": "Akkadian",
          "alb": "Albanian",
          "sqi": "Albanian",
          "gsw": "Swiss German",
          "ale": "Aleut",
          "alg": "Algonquian languages",
          "tut": "Altaic languages",
          "amh": "Amharic",
          "anp": "Angika",
          "apa": "Apache languages",
          "ara": "Arabic",
          "arg": "Aragonese",
          "arp": "Arapaho",
          "arw": "Arawak",
          "arm": "Armenian",
          "hye": "Armenian",
          "rup": "Macedo-Romanian",
          "art": "Artificial languages",
          "asm": "Assamese",
          "ast": "Leonese",
          "ath": "Athapascan languages",
          "aus": "Australian languages",
          "map": "Austronesian languages",
          "ava": "Avaric",
          "ave": "Avestan",
          "awa": "Awadhi",
          "aym": "Aymara",
          "aze": "Azerbaijani",
          "ban": "Balinese",
          "bat": "Baltic languages",
          "bal": "Baluchi",
          "bam": "Bambara",
          "bai": "Bamileke languages",
          "bad": "Banda languages",
          "bnt": "Bantu languages",
          "bas": "Basa",
          "bak": "Bashkir",
          "baq": "Basque",
          "eus": "Basque",
          "btk": "Batak languages",
          "bej": "Beja",
          "bel": "Belarusian",
          "bem": "Bemba",
          "ben": "Bengali",
          "ber": "Berber languages",
          "bho": "Bhojpuri",
          "bih": "Bihari languages",
          "bik": "Bikol",
          "byn": "Blin",
          "bin": "Edo",
          "bis": "Bislama",
          "zbl": "Blissymbols",
          "nob": "Norwegian Bokmål",
          "bos": "Bosnian",
          "bra": "Braj",
          "bre": "Breton",
          "bug": "Buginese",
          "bul": "Bulgarian",
          "bua": "Buriat",
          "bur": "Burmese",
          "mya": "Burmese",
          "cad": "Caddo",
          "spa": "Spanish",
          "cat": "Valencian",
          "cau": "Caucasian languages",
          "ceb": "Cebuano",
          "cel": "Celtic languages",
          "cai": "Central American Indian languages",
          "khm": "Central Khmer",
          "chg": "Chagatai",
          "cmc": "Chamic languages",
          "cha": "Chamorro",
          "che": "Chechen",
          "chr": "Cherokee",
          "nya": "Nyanja",
          "chy": "Cheyenne",
          "chb": "Chibcha",
          "chi": "Chinese",
          "zho": "Chinese",
          "chn": "Chinook jargon",
          "chp": "Dene Suline",
          "cho": "Choctaw",
          "zha": "Zhuang",
          "chu": "Old Slavonic",
          "chk": "Chuukese",
          "chv": "Chuvash",
          "nwc": "Old Newari",
          "syc": "Classical Syriac",
          "rar": "Rarotongan",
          "cop": "Coptic",
          "cor": "Cornish",
          "cos": "Corsican",
          "cre": "Cree",
          "mus": "Creek",
          "crp": "Creoles and pidgins",
          "cpe": "Creoles and pidgins, English based",
          "cpf": "Creoles and pidgins, French-based",
          "cpp": "Creoles and pidgins, Portuguese-based",
          "crh": "Crimean Turkish",
          "hrv": "Croatian",
          "cus": "Cushitic languages",
          "cze": "Czech",
          "ces": "Czech",
          "dak": "Dakota",
          "dan": "Danish",
          "dar": "Dargwa",
          "del": "Delaware",
          "div": "Maldivian",
          "zza": "Zazaki",
          "din": "Dinka",
          "doi": "Dogri",
          "dgr": "Dogrib",
          "dra": "Dravidian languages",
          "dua": "Duala",
          "dut": "Flemish",
          "nld": "Flemish",
          "dum": "Dutch, Middle (ca.1050-1350)",
          "dyu": "Dyula",
          "dzo": "Dzongkha",
          "frs": "Eastern Frisian",
          "efi": "Efik",
          "egy": "Egyptian (Ancient)",
          "eka": "Ekajuk",
          "elx": "Elamite",
          "eng": "English",
          "enm": "English, Middle (1100-1500)",
          "ang": "English, Old (ca.450-1100)",
          "myv": "Erzya",
          "epo": "Esperanto",
          "est": "Estonian",
          "ewe": "Ewe",
          "ewo": "Ewondo",
          "fan": "Fang",
          "fat": "Fanti",
          "fao": "Faroese",
          "fij": "Fijian",
          "fil": "Pilipino",
          "fin": "Finnish",
          "fiu": "Finno-Ugrian languages",
          "fon": "Fon",
          "fre": "French",
          "fra": "French",
          "frm": "French, Middle (ca.1400-1600)",
          "fro": "French, Old (842-ca.1400)",
          "fur": "Friulian",
          "ful": "Fulah",
          "gaa": "Ga",
          "gla": "Scottish Gaelic",
          "car": "Galibi Carib",
          "glg": "Galician",
          "lug": "Ganda",
          "gay": "Gayo",
          "gba": "Gbaya",
          "gez": "Geez",
          "geo": "Georgian",
          "kat": "Georgian",
          "ger": "German",
          "deu": "German",
          "nds": "Saxon, Low",
          "gmh": "German, Middle High (ca.1050-1500)",
          "goh": "German, Old High (ca.750-1050)",
          "gem": "Germanic languages",
          "kik": "Kikuyu",
          "gil": "Gilbertese",
          "gon": "Gondi",
          "gor": "Gorontalo",
          "got": "Gothic",
          "grb": "Grebo",
          "grc": "Greek, Ancient (to 1453)",
          "gre": "Greek, Modern (1453-)",
          "ell": "Greek, Modern (1453-)",
          "kal": "Kalaallisut",
          "grn": "Guarani",
          "guj": "Gujarati",
          "gwi": "Gwich'in",
          "hai": "Haida",
          "hat": "Haitian Creole",
          "hau": "Hausa",
          "haw": "Hawaiian",
          "heb": "Hebrew",
          "her": "Herero",
          "hil": "Hiligaynon",
          "him": "Western Pahari languages",
          "hin": "Hindi",
          "hmo": "Hiri Motu",
          "hit": "Hittite",
          "hmn": "Mong",
          "hun": "Hungarian",
          "hup": "Hupa",
          "iba": "Iban",
          "ice": "Icelandic",
          "isl": "Icelandic",
          "ido": "Ido",
          "ibo": "Igbo",
          "ijo": "Ijo languages",
          "ilo": "Iloko",
          "arc": "Official Aramaic (700-300 BCE)",
          "smn": "Inari Sami",
          "inc": "Indic languages",
          "ine": "Indo-European languages",
          "ind": "Indonesian",
          "inh": "Ingush",
          "ina": "Interlingua (International Auxiliary Language Association)",
          "ile": "Occidental",
          "iku": "Inuktitut",
          "ipk": "Inupiaq",
          "ira": "Iranian languages",
          "gle": "Irish",
          "mga": "Irish, Middle (900-1200)",
          "sga": "Irish, Old (to 900)",
          "iro": "Iroquoian languages",
          "ita": "Italian",
          "jpn": "Japanese",
          "jav": "Javanese",
          "kac": "Kachin",
          "jrb": "Judeo-Arabic",
          "jpr": "Judeo-Persian",
          "kbd": "Kabardian",
          "kab": "Kabyle",
          "xal": "Oirat",
          "kam": "Kamba",
          "kan": "Kannada",
          "kau": "Kanuri",
          "pam": "Pampanga",
          "kaa": "Kara-Kalpak",
          "krc": "Karachay-Balkar",
          "krl": "Karelian",
          "kar": "Karen languages",
          "kas": "Kashmiri",
          "csb": "Kashubian",
          "kaw": "Kawi",
          "kaz": "Kazakh",
          "kha": "Khasi",
          "khi": "Khoisan languages",
          "kho": "Sakan",
          "kmb": "Kimbundu",
          "kin": "Kinyarwanda",
          "kir": "Kyrgyz",
          "tlh": "tlhIngan-Hol",
          "kom": "Komi",
          "kon": "Kongo",
          "kok": "Konkani",
          "kor": "Korean",
          "kos": "Kosraean",
          "kpe": "Kpelle",
          "kro": "Kru languages",
          "kua": "Kwanyama",
          "kum": "Kumyk",
          "kur": "Kurdish",
          "kru": "Kurukh",
          "kut": "Kutenai",
          "lad": "Ladino",
          "lah": "Lahnda",
          "lam": "Lamba",
          "day": "Land Dayak languages",
          "lao": "Lao",
          "lat": "Latin",
          "lav": "Latvian",
          "ltz": "Luxembourgish",
          "lez": "Lezghian",
          "lim": "Limburgish",
          "lin": "Lingala",
          "lit": "Lithuanian",
          "jbo": "Lojban",
          "dsb": "Lower Sorbian",
          "loz": "Lozi",
          "lub": "Luba-Katanga",
          "lua": "Luba-Lulua",
          "lui": "Luiseno",
          "smj": "Lule Sami",
          "lun": "Lunda",
          "luo": "Luo (Kenya and Tanzania)",
          "lus": "Lushai",
          "mac": "Macedonian",
          "mkd": "Macedonian",
          "mad": "Madurese",
          "mag": "Magahi",
          "mai": "Maithili",
          "mak": "Makasar",
          "mlg": "Malagasy",
          "may": "Malay",
          "msa": "Malay",
          "mal": "Malayalam",
          "mlt": "Maltese",
          "mnc": "Manchu",
          "mdr": "Mandar",
          "man": "Mandingo",
          "mni": "Manipuri",
          "mno": "Manobo languages",
          "glv": "Manx",
          "mao": "Maori",
          "mri": "Maori",
          "arn": "Mapudungun",
          "mar": "Marathi",
          "chm": "Mari",
          "mah": "Marshallese",
          "mwr": "Marwari",
          "mas": "Masai",
          "myn": "Mayan languages",
          "men": "Mende",
          "mic": "Micmac",
          "min": "Minangkabau",
          "mwl": "Mirandese",
          "moh": "Mohawk",
          "mdf": "Moksha",
          "rum": "Romanian",
          "ron": "Romanian",
          "mkh": "Mon-Khmer languages",
          "lol": "Mongo",
          "mon": "Mongolian",
          "mos": "Mossi",
          "mul": "Multiple languages",
          "mun": "Munda languages",
          "nqo": "N'Ko",
          "nah": "Nahuatl languages",
          "nau": "Nauru",
          "nav": "Navajo",
          "nde": "North Ndebele",
          "nbl": "South Ndebele",
          "ndo": "Ndonga",
          "nap": "Neapolitan",
          "new": "Newari",
          "nep": "Nepali",
          "nia": "Nias",
          "nic": "Niger-Kordofanian languages",
          "ssa": "Nilo-Saharan languages",
          "niu": "Niuean",
          "zxx": "Not applicable",
          "nog": "Nogai",
          "non": "Norse, Old",
          "nai": "North American Indian languages",
          "frr": "Northern Frisian",
          "sme": "Northern Sami",
          "nso": "Sotho, Northern",
          "nor": "Norwegian",
          "nno": "Nynorsk, Norwegian",
          "nub": "Nubian languages",
          "iii": "Sichuan Yi",
          "nym": "Nyamwezi",
          "nyn": "Nyankole",
          "nyo": "Nyoro",
          "nzi": "Nzima",
          "oci": "Occitan (post 1500)",
          "pro": "Provençal, Old (to 1500)",
          "oji": "Ojibwa",
          "ori": "Oriya",
          "orm": "Oromo",
          "osa": "Osage",
          "oss": "Ossetic",
          "oto": "Otomian languages",
          "pal": "Pahlavi",
          "pau": "Palauan",
          "pli": "Pali",
          "pag": "Pangasinan",
          "pan": "Punjabi",
          "pap": "Papiamento",
          "paa": "Papuan languages",
          "pus": "Pushto",
          "per": "Persian",
          "fas": "Persian",
          "peo": "Persian, Old (ca.600-400 B.C.)",
          "phi": "Philippine languages",
          "phn": "Phoenician",
          "pon": "Pohnpeian",
          "pol": "Polish",
          "por": "Portuguese",
          "pra": "Prakrit languages",
          "que": "Quechua",
          "raj": "Rajasthani",
          "rap": "Rapanui",
          "qaa-qtz": "Reserved for local use",
          "roa": "Romance languages",
          "roh": "Romansh",
          "rom": "Romany",
          "run": "Rundi",
          "rus": "Russian",
          "sal": "Salishan languages",
          "sam": "Samaritan Aramaic",
          "smi": "Sami languages",
          "smo": "Samoan",
          "sad": "Sandawe",
          "sag": "Sango",
          "san": "Sanskrit",
          "sat": "Santali",
          "srd": "Sardinian",
          "sas": "Sasak",
          "sco": "Scots",
          "sel": "Selkup",
          "sem": "Semitic languages",
          "srp": "Serbian",
          "srr": "Serer",
          "shn": "Shan",
          "sna": "Shona",
          "scn": "Sicilian",
          "sid": "Sidamo",
          "sgn": "Sign Languages",
          "bla": "Siksika",
          "snd": "Sindhi",
          "sin": "Sinhalese",
          "sit": "Sino-Tibetan languages",
          "sio": "Siouan languages",
          "sms": "Skolt Sami",
          "den": "Slave (Athapascan)",
          "sla": "Slavic languages",
          "slo": "Slovak",
          "slk": "Slovak",
          "slv": "Slovenian",
          "sog": "Sogdian",
          "som": "Somali",
          "son": "Songhai languages",
          "snk": "Soninke",
          "wen": "Sorbian languages",
          "sot": "Sotho, Southern",
          "sai": "South American Indian languages",
          "alt": "Southern Altai",
          "sma": "Southern Sami",
          "srn": "Sranan Tongo",
          "suk": "Sukuma",
          "sux": "Sumerian",
          "sun": "Sundanese",
          "sus": "Susu",
          "swa": "Swahili",
          "ssw": "Swati",
          "swe": "Swedish",
          "syr": "Syriac",
          "tgl": "Tagalog",
          "tah": "Tahitian",
          "tai": "Tai languages",
          "tgk": "Tajik",
          "tmh": "Tamashek",
          "tam": "Tamil",
          "tat": "Tatar",
          "tel": "Telugu",
          "ter": "Tereno",
          "tet": "Tetum",
          "tha": "Thai",
          "tib": "Tibetan",
          "bod": "Tibetan",
          "tig": "Tigre",
          "tir": "Tigrinya",
          "tem": "Timne",
          "tiv": "Tiv",
          "tli": "Tlingit",
          "tpi": "Tok Pisin",
          "tkl": "Tokelau",
          "tog": "Tonga (Nyasa)",
          "ton": "Tonga (Tonga Islands)",
          "tsi": "Tsimshian",
          "tso": "Tsonga",
          "tsn": "Tswana",
          "tum": "Tumbuka",
          "tup": "Tupi languages",
          "tur": "Turkish",
          "ota": "Turkish, Ottoman (1500-1928)",
          "tuk": "Turkmen",
          "tvl": "Tuvalu",
          "tyv": "Tuvinian",
          "twi": "Twi",
          "udm": "Udmurt",
          "uga": "Ugaritic",
          "uig": "Uyghur",
          "ukr": "Ukrainian",
          "umb": "Umbundu",
          "mis": "Uncoded languages",
          "und": "Undetermined",
          "hsb": "Upper Sorbian",
          "urd": "Urdu",
          "uzb": "Uzbek",
          "vai": "Vai",
          "ven": "Venda",
          "vie": "Vietnamese",
          "vol": "Volapük",
          "vot": "Votic",
          "wak": "Wakashan languages",
          "wln": "Walloon",
          "war": "Waray",
          "was": "Washo",
          "wel": "Welsh",
          "cym": "Welsh",
          "fry": "Western Frisian",
          "wal": "Wolaytta",
          "wol": "Wolof",
          "xho": "Xhosa",
          "sah": "Yakut",
          "yao": "Yao",
          "yap": "Yapese",
          "yid": "Yiddish",
          "yor": "Yoruba",
          "ypk": "Yupik languages",
          "znd": "Zande languages",
          "zap": "Zapotec",
          "zen": "Zenaga",
          "zul": "Zulu",
          "zun": "Zuni"
        },
        ISO3166_1 = {
          "AF": "AFGHANISTAN",
          "AX": "ÅLAND ISLANDS",
          "AL": "ALBANIA",
          "DZ": "ALGERIA",
          "AS": "AMERICAN SAMOA",
          "AD": "ANDORRA",
          "AO": "ANGOLA",
          "AI": "ANGUILLA",
          "AQ": "ANTARCTICA",
          "AG": "ANTIGUA AND BARBUDA",
          "AR": "ARGENTINA",
          "AM": "ARMENIA",
          "AW": "ARUBA",
          "AU": "AUSTRALIA",
          "AT": "AUSTRIA",
          "AZ": "AZERBAIJAN",
          "BS": "BAHAMAS",
          "BH": "BAHRAIN",
          "BD": "BANGLADESH",
          "BB": "BARBADOS",
          "BY": "BELARUS",
          "BE": "BELGIUM",
          "BZ": "BELIZE",
          "BJ": "BENIN",
          "BM": "BERMUDA",
          "BT": "BHUTAN",
          "BO": "BOLIVIA, PLURINATIONAL STATE OF",
          "BQ": "BONAIRE, SINT EUSTATIUS AND SABA",
          "BA": "BOSNIA AND HERZEGOVINA",
          "BW": "BOTSWANA",
          "BV": "BOUVET ISLAND",
          "BR": "BRAZIL",
          "IO": "BRITISH INDIAN OCEAN TERRITORY",
          "BN": "BRUNEI DARUSSALAM",
          "BG": "BULGARIA",
          "BF": "BURKINA FASO",
          "BI": "BURUNDI",
          "KH": "CAMBODIA",
          "CM": "CAMEROON",
          "CA": "CANADA",
          "CV": "CAPE VERDE",
          "KY": "CAYMAN ISLANDS",
          "CF": "CENTRAL AFRICAN REPUBLIC",
          "TD": "CHAD",
          "CL": "CHILE",
          "CN": "CHINA",
          "CX": "CHRISTMAS ISLAND",
          "CC": "COCOS (KEELING) ISLANDS",
          "CO": "COLOMBIA",
          "KM": "COMOROS",
          "CG": "CONGO",
          "CD": "CONGO, THE DEMOCRATIC REPUBLIC OF THE",
          "CK": "COOK ISLANDS",
          "CR": "COSTA RICA",
          "CI": "CÔTE D'IVOIRE",
          "HR": "CROATIA",
          "CU": "CUBA",
          "CW": "CURAÇAO",
          "CY": "CYPRUS",
          "CZ": "CZECH REPUBLIC",
          "DK": "DENMARK",
          "DJ": "DJIBOUTI",
          "DM": "DOMINICA",
          "DO": "DOMINICAN REPUBLIC",
          "EC": "ECUADOR",
          "EG": "EGYPT",
          "SV": "EL SALVADOR",
          "GQ": "EQUATORIAL GUINEA",
          "ER": "ERITREA",
          "EE": "ESTONIA",
          "ET": "ETHIOPIA",
          "FK": "FALKLAND ISLANDS (MALVINAS)",
          "FO": "FAROE ISLANDS",
          "FJ": "FIJI",
          "FI": "FINLAND",
          "FR": "FRANCE",
          "GF": "FRENCH GUIANA",
          "PF": "FRENCH POLYNESIA",
          "TF": "FRENCH SOUTHERN TERRITORIES",
          "GA": "GABON",
          "GM": "GAMBIA",
          "GE": "GEORGIA",
          "DE": "GERMANY",
          "GH": "GHANA",
          "GI": "GIBRALTAR",
          "GR": "GREECE",
          "GL": "GREENLAND",
          "GD": "GRENADA",
          "GP": "GUADELOUPE",
          "GU": "GUAM",
          "GT": "GUATEMALA",
          "GG": "GUERNSEY",
          "GN": "GUINEA",
          "GW": "GUINEA-BISSAU",
          "GY": "GUYANA",
          "HT": "HAITI",
          "HM": "HEARD ISLAND AND MCDONALD ISLANDS",
          "VA": "HOLY SEE (VATICAN CITY STATE)",
          "HN": "HONDURAS",
          "HK": "HONG KONG",
          "HU": "HUNGARY",
          "IS": "ICELAND",
          "IN": "INDIA",
          "ID": "INDONESIA",
          "IR": "IRAN, ISLAMIC REPUBLIC OF",
          "IQ": "IRAQ",
          "IE": "IRELAND",
          "IM": "ISLE OF MAN",
          "IL": "ISRAEL",
          "IT": "ITALY",
          "JM": "JAMAICA",
          "JP": "JAPAN",
          "JE": "JERSEY",
          "JO": "JORDAN",
          "KZ": "KAZAKHSTAN",
          "KE": "KENYA",
          "KI": "KIRIBATI",
          "KP": "KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF",
          "KR": "KOREA, REPUBLIC OF",
          "KW": "KUWAIT",
          "KG": "KYRGYZSTAN",
          "LA": "LAO PEOPLE'S DEMOCRATIC REPUBLIC",
          "LV": "LATVIA",
          "LB": "LEBANON",
          "LS": "LESOTHO",
          "LR": "LIBERIA",
          "LY": "LIBYA",
          "LI": "LIECHTENSTEIN",
          "LT": "LITHUANIA",
          "LU": "LUXEMBOURG",
          "MO": "MACAO",
          "MK": "MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF",
          "MG": "MADAGASCAR",
          "MW": "MALAWI",
          "MY": "MALAYSIA",
          "MV": "MALDIVES",
          "ML": "MALI",
          "MT": "MALTA",
          "MH": "MARSHALL ISLANDS",
          "MQ": "MARTINIQUE",
          "MR": "MAURITANIA",
          "MU": "MAURITIUS",
          "YT": "MAYOTTE",
          "MX": "MEXICO",
          "FM": "MICRONESIA, FEDERATED STATES OF",
          "MD": "MOLDOVA, REPUBLIC OF",
          "MC": "MONACO",
          "MN": "MONGOLIA",
          "ME": "MONTENEGRO",
          "MS": "MONTSERRAT",
          "MA": "MOROCCO",
          "MZ": "MOZAMBIQUE",
          "MM": "MYANMAR",
          "NA": "NAMIBIA",
          "NR": "NAURU",
          "NP": "NEPAL",
          "NL": "NETHERLANDS",
          "NC": "NEW CALEDONIA",
          "NZ": "NEW ZEALAND",
          "NI": "NICARAGUA",
          "NE": "NIGER",
          "NG": "NIGERIA",
          "NU": "NIUE",
          "NF": "NORFOLK ISLAND",
          "MP": "NORTHERN MARIANA ISLANDS",
          "NO": "NORWAY",
          "OM": "OMAN",
          "PK": "PAKISTAN",
          "PW": "PALAU",
          "PS": "PALESTINIAN TERRITORY, OCCUPIED",
          "PA": "PANAMA",
          "PG": "PAPUA NEW GUINEA",
          "PY": "PARAGUAY",
          "PE": "PERU",
          "PH": "PHILIPPINES",
          "PN": "PITCAIRN",
          "PL": "POLAND",
          "PT": "PORTUGAL",
          "PR": "PUERTO RICO",
          "QA": "QATAR",
          "RE": "RÉUNION",
          "RO": "ROMANIA",
          "RU": "RUSSIAN FEDERATION",
          "RW": "RWANDA",
          "BL": "SAINT BARTHÉLEMY",
          "SH": "SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA",
          "KN": "SAINT KITTS AND NEVIS",
          "LC": "SAINT LUCIA",
          "MF": "SAINT MARTIN (FRENCH PART)",
          "PM": "SAINT PIERRE AND MIQUELON",
          "VC": "SAINT VINCENT AND THE GRENADINES",
          "WS": "SAMOA",
          "SM": "SAN MARINO",
          "ST": "SAO TOME AND PRINCIPE",
          "SA": "SAUDI ARABIA",
          "SN": "SENEGAL",
          "RS": "SERBIA",
          "SC": "SEYCHELLES",
          "SL": "SIERRA LEONE",
          "SG": "SINGAPORE",
          "SX": "SINT MAARTEN (DUTCH PART)",
          "SK": "SLOVAKIA",
          "SI": "SLOVENIA",
          "SB": "SOLOMON ISLANDS",
          "SO": "SOMALIA",
          "ZA": "SOUTH AFRICA",
          "GS": "SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS",
          "SS": "SOUTH SUDAN",
          "ES": "SPAIN",
          "LK": "SRI LANKA",
          "SD": "SUDAN",
          "SR": "SURINAME",
          "SJ": "SVALBARD AND JAN MAYEN",
          "SZ": "SWAZILAND",
          "SE": "SWEDEN",
          "CH": "SWITZERLAND",
          "SY": "SYRIAN ARAB REPUBLIC",
          "TW": "TAIWAN, PROVINCE OF CHINA",
          "TJ": "TAJIKISTAN",
          "TZ": "TANZANIA, UNITED REPUBLIC OF",
          "TH": "THAILAND",
          "TL": "TIMOR-LESTE",
          "TG": "TOGO",
          "TK": "TOKELAU",
          "TO": "TONGA",
          "TT": "TRINIDAD AND TOBAGO",
          "TN": "TUNISIA",
          "TR": "TURKEY",
          "TM": "TURKMENISTAN",
          "TC": "TURKS AND CAICOS ISLANDS",
          "TV": "TUVALU",
          "UG": "UGANDA",
          "UA": "UKRAINE",
          "AE": "UNITED ARAB EMIRATES",
          "GB": "UNITED KINGDOM",
          "US": "UNITED STATES",
          "UM": "UNITED STATES MINOR OUTLYING ISLANDS",
          "UY": "URUGUAY",
          "UZ": "UZBEKISTAN",
          "VU": "VANUATU",
          "VE": "VENEZUELA, BOLIVARIAN REPUBLIC OF",
          "VN": "VIET NAM",
          "VG": "VIRGIN ISLANDS, BRITISH",
          "VI": "VIRGIN ISLANDS, U.S.",
          "WF": "WALLIS AND FUTUNA",
          "EH": "WESTERN SAHARA",
          "YE": "YEMEN",
          "ZM": "ZAMBIA",
          "ZW": "ZIMBABWE"
        };
      if ( parts.length > 2 ) throw new SyntaxError( 'Unexpected number of segments ' + parts.length );
      if ( parts.length > 1 )
        return (ISO639_1[parts[0]] || ISO639_2[parts[0]] || parts[0]) + ', ' + parts[1]; //(ISO3166_1[parts[1]] || parts[1]);
      if ( parts.length > 0 )
        return ISO639_1[parts[0]] || ISO639_2[parts[0]] || ISO3166_1[parts[0]] || parts[0];
      return '';
    },

    createLanguagesMenu: function ( captionsData ) {
      this.languages = this.getLanguagesFromCaptions( captionsData.items );

      if ( !this.languages || this.languages.length === 0 ) {
        this.disableLanguageSelection();
        this.removeCaptions();
        return;
      }

      // Render the list
      var html = '';
      this.languages.forEach( function ( lang, i ) {

        var l = this.localeCodeToEnglish( lang );
        if ( l ) {
          html += '<li data-lang="' + lang + '" class="lang ' + lang + '">';
          html += '<p>';
          html += '<span>' + l + '</span>';
          html += '<i></i>';
          html += '</p>';
          html += '</li>';
        }
      }.bind( this ) );
      this.$languagesList.html( html );

      // console.log( this.languages );

    },

    getLanguagesFromCaptions: function ( captions ) {

      if ( !captions )
        return null;

      var languages = [];

      captions.forEach( function ( caption ) {
        var caption = caption.snippet;
        if ( caption )
          languages.push( caption.language );
      } );

      return languages;

    },

    toggleLanguagesList: function ( e ) {
      // console.log( 'toggle languages' );
      var $el = $( this );

      if ( $el.hasClass( 'open' ) ) {
        $el.removeClass( 'open' );
      } else {
        $el.addClass( 'open' );
      }
    },

    disableLanguageSelection: function () {
      this.$languages.hide();
    },

    setLanguage: function ( hl ) {
      this.ytplayer.setOption( "captions", "track", {"languageCode": hl} );
    },

    updateTime: function ( e, time ) {
      var self = this;
      this.currentTime = this.getCurrentTime();
      this.currentBuffer = this.getVideoLoadedFraction();

      if ( this.options.controls == 1 ) {
        this.seekUpdate( this.currentTime );
        this.bufferUpdate( this.currentBuffer );
        this.setTimeCount();
      }

      this.progressTimer = setTimeout( function () {
        self.updateTime();
      }, 500 );

      this.trigger( 'timeupdate' );
    },

    bufferUpdate: function ( currentBuffer ) {
//      console.log( currentBuffer );
      this.$buffer.css( 'width', ~~(currentBuffer * 100) + '%' );
    },

    seekUpdate: function ( currentTime ) {
      if ( !this.seeksliding && typeof this.timelineSlider !== 'undefined' ) {
        this.timelineSlider.resizeSeekBar( currentTime );
      }
    },

    setTimeCount: function () {
      var curr = this.formatTime( this.currentTime * 1000 );
      var dur = this.formatTime( this.duration * 1000 );
      this.$timecount.html( curr + '<span> / ' + dur + '</span>' );
//      console.log( 'setTimeCount', this.currentTime, this.duration );
    },

    formatTime: function ( ms ) {
      var min = (ms / 1000 / 60) << 0,
        sec = ((ms / 1000) % 60) << 0,
        ret = "";
      ret += min < 10 ? "0" : "";
      ret += min + ":";
      ret += sec < 10 ? "0" : "";
      ret += sec;
      return ret;
    },

    getPlaylist: function () {
      return this.ytplayer.getPlaylist();
    },

    getVideoLoadedFraction: function () {
      return this.ytplayer.getVideoLoadedFraction();
    },

    getCurrentTime: function () {
      return this.ytplayer.getCurrentTime();
    },

    getDuration: function () {
      return this.ytplayer.getDuration();
    },

    normaliseTime: function ( t ) {
      return /\./.test( t ) ? t * 1000 : t;
    },

    getSrc: function () {
      return this.options.videoId;
    },

    handlers: {},

    destroy: function () {
      this.pause();
      this.$elem.empty();

      this.ytplayer.destroy();

      delete YoutubeCustomPlayer[this.instanceId];
    },

    on: function ( event, method ) {
      var self = this;
      this.handlers[method] = function () {
//        method.apply( self, arguments );
        method();
      }; //
      this.$elem.on( event, this.handlers[method] );
    },

    off: function () {
      this.$elem.off( event, this.handlers[method] );
    },

    trigger: function ( event, data ) {
      this.$elem.trigger( event, typeof data != 'undefined' ? data : [] );
    }

  };

  YoutubeCustomPlayer.isReady = false;
  YoutubeCustomPlayer.readyList = [];
  YoutubeCustomPlayer.players = {};

  YoutubeCustomPlayer.create = function ( id, options, callback ) {
    var instanceId = id.replace( /\-/g, '' );
    if ( typeof YoutubeCustomPlayer.players[instanceId] != 'undefined' ) {
      if ( typeof callback != "undefined" ) {
        callback.call( YoutubeCustomPlayer.players[instanceId] );
      }
      return;
    }
    YoutubeCustomPlayer.players[instanceId] = new YoutubeCustomPlayer( id, options, callback );
    $( '#' + id ).data( 'YoutubeCustomPlayer', true );
    return YoutubeCustomPlayer.players[instanceId];
  };

  YoutubeCustomPlayer.destroy = function ( id ) {
    var instanceId = id.replace( /\-/g, '' );
    if ( typeof YoutubeCustomPlayer.players[instanceId] == 'undefined' ) return;
    YoutubeCustomPlayer.players[instanceId].destroy();
    $( '#' + id ).removeData( 'YoutubeCustomPlayer' );
  };

  YoutubeCustomPlayer.stopAllVideos = function () {
    for ( var p in YoutubeCustomPlayer.players ) {
      if ( YoutubeCustomPlayer.players[p].video != null && typeof YoutubeCustomPlayer.players[p] != 'undefined' )
        YoutubeCustomPlayer.players[p].pause();
    }
  };

  YoutubeCustomPlayer.requestFullScreen = (function () {

    var vendors = ["moz", "webkit", "", "ms", "o"],
      l = vendors.length,
      fs, requestFn, cancelFn, eventName, isFullScreen;

    if ( document.cancelFullscreen !== undefined ) {
      requestFn = "requestFullscreen";
      cancelFn = "exitFullscreen";
      eventName = "fullscreenchange";
    } else {
      while ( l-- ) {
        if ( ( vendors[l] != "moz" || document.mozFullScreenEnabled) && document[vendors[l] + "CancelFullScreen"] !== undefined ) {
          requestFn = vendors[l] + "RequestFullScreen";
          cancelFn = vendors[l] + "CancelFullScreen";
          eventName = vendors[l] + "fullscreenchange";
          isFullScreen = vendors[l] == "webkit" ? vendors[l] + "IsFullScreen" :
          vendors[l] + "FullScreen";
        }
      }
    }

    var fs = {
      requestFn: requestFn,
      cancelFn: cancelFn,
      eventName: eventName,
      isFullScreen: isFullScreen
    };

    return requestFn ? fs : false;

  })();

  YoutubeCustomPlayer.ready = function ( callback ) {
    if ( YoutubeCustomPlayer.isReady ) {
      callback();
    } else {
      YoutubeCustomPlayer.readyList.push( callback );
    }
  };

  YoutubeCustomPlayer.init = function () {
    YoutubeCustomPlayer.isReady = true;
    for ( var i = 0, l = YoutubeCustomPlayer.readyList.length; i < l; i++ ) {
      YoutubeCustomPlayer.readyList[i]();
    }

    /** autocreate players */
    $( '.js-yt-player' ).each( function () {
      YoutubeCustomPlayer.create( this.getAttribute( 'id' ) );
    } );

  };


  YoutubeCustomPlayer.skins = {

    base: '<div class="yt-video-wrapper"></div>' +
    '<div class="yt-loading-wrapper"><div class="yt-loading"></div></div>' +
    '<div class="yt-skin-wrapper">' +
    '<div class="yt-big-play-btn unselectable">' +
    '<div class="play-button"><span></span></div>' +
    '</div>' +
    '<div class="yt-embed-message">' +
    '<div class="yt-embed-code-wrapper"><div class="yt-embed-title">Embed code</div><input type="text" class="yt-embed-code" value=""></div>' +
    '</div>' +
      // CONTROLS
    '<div class="yt-controls-wrapper">' +

      // CONTROLS - LEFT
    '<div class="yt-controls-left">' +
    '<div class="yt-play-btn">' + playPauseSvg + '</div>' +
    '<div class="yt-time"></div>' +
    '</div>' +

      // CONTROLS - RIGHT
    '<div class="yt-controls-right">' +
    //'<div class="yt-hd-btn unselectable">' + hdSvg + '</div>' +
    '<div class="yt-languages-btn unselectable">' + languagesSvg + ' <span class="label unselectable">Subtitles</span> <ul class="yt-languages-list"></ul></div>' +
    '<div class="yt-cc-btn unselectable">' + ccSvg +
      //'<span class="label unselectable off">Off</span><span class="label unselectable on">On</span>'+
    '</div>' +
    '<div class="yt-embed-btn unselectable">' + embedSvg + ' <span class="unselectable">Embed</span></div>' +
    '<div class="yt-volume-wrapper unselectable">' +
    '<div class="yt-mute-btn unselectable">' + volumeSvg + '</div>' +
    '<div class="yt-volume unselectable"><div class="yt-volume-level unselectable"></div></div>' +
    '</div>' +
    '<div class="yt-fullscreen-btn">' + fullscreenSvg + '</div>' +
    '</div>' +

      // TIMELINE
    '<div class="yt-timeline unselectable"><div class="yt-seek unselectable"></div><div class="yt-buffer"></div></div>' +

      // close
    '</div>' +
    '</div>',

    controlLess: '<div class="yt-video-wrapper"></div>' +
    '<div class="yt-loading-wrapper"><div class="yt-loading">loading</div></div>' +
    '<div class="yt-big-play-btn"></div>'

  };

  window.onYouTubeIframeAPIReady = function () {
    YoutubeCustomPlayer.init();
  };

  // Get YouTube Iframe API
  var tag = document.createElement( 'script' );
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName( 'script' )[0];
  firstScriptTag.parentNode.insertBefore( tag, firstScriptTag );

  return YoutubeCustomPlayer;

} );

