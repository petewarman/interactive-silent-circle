define( [
  'text!yt-player-icon-play-pause',
  'text!yt-player-icon-embed',
  'text!yt-player-icon-volume',
  'text!yt-player-icon-fullscreen'
], function ( playPauseSvg, embedSvg, volumeSvg, fullscreenSvg ) {

  'use strict';

  var hasTouch = (('ontouchstart' in window) || ('ontouchstart' in document.documentElement) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
  var hasMSPointer = window.navigator.msPointerEnabled;
  var UI_DOWN = hasTouch ? 'touchstart' : ( hasMSPointer ? 'MSPointerDown' : 'mousedown' );
  var UI_UP = hasTouch ? 'touchend' : ( hasMSPointer ? 'MSPointerUp' : 'mouseup' );
  var UI_MOVE = hasTouch ? 'touchmove' : ( hasMSPointer ? 'MSPointerMove' : 'mousemove' );

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
      seekbar = $( '<div class="ultima-slider-seekbar"></div>' );
      $elem.append( seekbar );
    }

    if ( this.slider.handle ) {
      handler = $( this.slider.handle );
    } else {
      handler = $( '<div class="ultima-slider-cursor"></div>' );
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
        pageX = hasTouch ? e.originalEvent.touches[0].pageX : e.pageX,
        pageY = hasTouch ? e.originalEvent.touches[0].pageY : e.pageY,
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

  $.fn.ultimaSlider = function ( d ) {
    return this.each( function () {
      var $elem = $( this );
      if ( $elem.data( "ultimaSlider" ) ) {
        return;
      }
      var inst = new a( this, d );
      $elem.data( "ultimaSlider", inst );
    } )
  };


  /** --------------------------------------------------------------------------- */

  var debug = {};
  debug.log = function ( msg ) {
    $( '#debug' ).append( msg + '<br/>' );
  };

  function YoutubeCustomPlayer( id, options, callback ) {

    this.$elem = $( '#' + id );

    this.id = id;
    this.instanceId = this.id.replace( /\-/g, '' );
    this.videoWrapperId = this.id + '-video';
    this.elemAttributes = this.$elem.prop( "attributes" );

    this.options = $.extend( {
      embedCode: null,
      videoId: this.$elem.attr( 'src' ) || null,
      wmode: 'transparent',
      controls: typeof this.$elem.attr( 'controls' ) != "undefined" ? 1 : 0,
      autoplay: typeof this.$elem.attr( 'autoplay' ) != "undefined" ? 1 : 0,
      showinfo: 0,
      rel: 0,
      hl: 'en',
      cc_load_policy: 1,
      alwaysVisible: true
    }, options || {} );


    this.options.skin = this.options.controls == 1 ? "base" : "controlLess";

    this.callback = callback || function () {
    };

    if ( this.options.videoId == null ) {
      throw new Error( id + " Sorry, options.videoId key must be specified" );
    }

    if ( typeof YoutubeCustomPlayer.skins[ this.options.skin ] == "undefined" ) {
      throw new Error( id + "Sorry, the skin you choose doesn't exist on YoutubeCustomPlayer.skins list" )
    }

    this.isIpad = ( navigator.userAgent.match( /.*(iPad).*/ ) ) ? true : false;
    this.isIphone = ( navigator.userAgent.match( /.*(iPhone).*/ ) ) ? true : false;
    this.isIOs = ( this.isIpad || this.isIphone ) ? true : false;
    this.isAndroid = ( navigator.userAgent.match( /.*(Android).*/ ) ) ? true : false;

    this.hasTouch = (('ontouchstart' in window) || ('ontouchstart' in document.documentElement) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    this.htmlClass = this.isIpad ? 'yt-ipad yt-ios' : ( this.isIphone ? 'yt-iphone yt-ios' : '' );

    if ( this.hasTouch )
      this.htmlClass += ' yt-touch';

    if ( YoutubeCustomPlayer.requestFullScreen )
      this.htmlClass += ' yt-support-fullscreen';

    this.ytplayer = null;
    this.paused = true;
    this.muted = false;
    this.seeksliding = false;
    this.duration = 0;
    this.currentTime = 0;
    this.isFullScreen = false;
    this.progressTimer = null;
    this.ultimaTimelineSlider = null;
    this.isFirstPlay = true;
    this.mouseMoveTimer = null;
    this.isControlsHidden = false;
    this.onFullScrenChangeBinded = this.onFullScrenChange.bind( this );

    $( 'html' ).addClass( this.htmlClass );
    this.createSkin();
    this.createPlayer();

  }

  YoutubeCustomPlayer.prototype = {

    createSkin: function () {

      var self = this;

      this.$elem.replaceWith( '<div id="' + this.id + '"></div>' );
      this.$elem = $( '#' + this.id );

      $.each( this.elemAttributes, function () {
        if ( this.value != null && this.value != 'null' ) {
          self.$elem.attr( this.name, this.value )
        }
      } );

      this.$elem.append( YoutubeCustomPlayer.skins[ this.options.skin ] );

      this.$videoWrapper = this.$elem.find( '.yt-video-wrapper' ).attr( 'id', this.videoWrapperId );
      this.$loadingWrapper = this.$elem.find( '.yt-loading-wrapper' );
      this.$loading = this.$elem.find( '.yt-loading' );
      this.$bigPlayBtn = this.$elem.find( '.yt-big-play-btn' );

      if ( this.options.controls == 1 ) {
        this.$skinWrapper = this.$elem.find( '.yt-skin-wrapper' );
        this.$controlsWrapper = this.$elem.find( '.yt-controls-wrapper' );
        this.$playBtn = this.$elem.find( '.yt-play-btn' );
        this.$muteBtn = this.$elem.find( '.yt-mute-btn' );
        this.$fullscreenBtn = this.$elem.find( '.yt-fullscreen-btn' );
        this.$timeline = this.$elem.find( '.yt-timeline' );
        this.$timecount = this.$elem.find( '.yt-time' );
        this.$buffer = this.$elem.find( '.yt-buffer' );
        this.$embed = this.$elem.find( '.yt-embed-btn' );
        this.$embedMessage = this.$elem.find( '.yt-embed-message' );
        this.$embedCode = this.$elem.find( '.yt-embed-code' );

        this.$volumeLevel = this.$elem.find( '.yt-volume-level' );
      }

      if ( this.isIOs || this.isAndroid ) {
        this.$bigPlayBtn.hide();
      }

      this.$skinWrapper.hide();

    },

    updateVolumeLevel: function(percent) {
      this.$volumeLevel.width(percent + "%");
    },

    createPlayer: function () {

      this.ytplayer = new YT.Player( this.videoWrapperId, {
        height: '100%',
        width: '100%',
        videoId: this.options.videoId,
        playerVars: {
          hl: this.options.hl,
          cc_load_policy: this.options.cc_load_policy,
          wmode: this.options.wmode,
          controls: 0,
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

      YoutubeCustomPlayer[ this.instanceId ] = this;

    },

    onYoutubePlayerReady: function ( e ) {
      this.$elem.addClass( 'yt-ready' );
      this.duration = this.ytplayer.getDuration();
      this.addListenners();
      this.callback.call( this );
      this.trigger( 'ready' );
    },

    onYoutubePlayerError: function ( e ) {
      //console.log('onYoutubePlayerError', e);
      this.trigger( 'error' );
    },

    onYoutubePlayerStateChange: function ( e ) {
//      debug.log( 'onYoutubePlayerStateChange', e.data );

      if ( e.data == 0 ) { //ended
        this.onYoutubePlayerEnded();
      }
      if ( e.data == 1 ) { //play
        this.onYoutubePlayerPlay();
      }
      if ( e.data == 2 ) { //pause
        this.onYoutubePlayerPause();
      }
      if ( e.data == 3 ) { //buffer
        this.onYoutubePlayerBuffer();
      }
    },

    onYoutubePlayerBuffer: function () {
//      this.trigger( 'buffer' );
    },

//    updateBuffer: function() {
//      console.log(this.ytplayer.getVideoLoadedFraction());
//    },

    addListenners: function () {

      var self = this;

      this.$bigPlayBtn.on( 'click', function ( e ) {
        e.preventDefault();
        self.togglePlay();
      } );

      if ( this.options.controls === 0 ) {
        return;
      }

      this.$skinWrapper.on( 'click', function ( e ) {
        e.stopPropagation();
      } );

      this.$playBtn.on( 'click', function ( e ) {
        e.preventDefault();
        self.togglePlay();
      } );

      this.$muteBtn.on( 'click',function ( e ) {
        e.preventDefault();
        if ( self.muted ) {
          self.unmute();
        } else {
          self.mute();
        }
      } ).addClass( "active" );


      this.$embed.on( 'click', this.toggleEmbedMessage.bind( this ) );

      this.$fullscreenBtn.on( 'click', function () {
        self.toggleFullScreen();
      } );

      $( document ).on( 'keydown', function ( event ) {
        if ( event.keyCode == 27 ) {
          if ( self.isFullScreen == true ) {
            self.cancelFullScreen();
          }
        }
      } );

      //show/hide controls on user activity
      if ( !this.options.alwaysVisible ) {
        $( document ).on( UI_MOVE + ' ' + (this.hasTouch ? this.UI_DOWN : ''), this.toggleControls.bind( this ) );
      }


      this.$timeline.ultimaSlider( {
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

      if ( this.$timeline.data( 'ultimaSlider' ) != undefined )
        this.ultimaTimelineSlider = this.$timeline.data( 'ultimaSlider' );

    },

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
      var self = this;
      clearTimeout( this.mouseMoveTimer );
      if ( this.isControlsHidden ) {
        this.isControlsHidden = false;
        this.$elem.removeClass( 'yt-no-controls' );
      }
      this.mouseMoveTimer = setTimeout( function () {
        self.isControlsHidden = true;
        self.$elem.addClass( 'yt-no-controls' );
      }, 2000 );
    },


    onYoutubePlayerEnded: function () {
      this.onYoutubePlayerPause();
      this.trigger( 'ended' );
    },

    onYoutubePlayerPlay: function () {

      this.paused = false;
//      this.$bigPlayBtn.addClass( 'active' );
      this.startProgress();

      if ( this.options.controls == 1 ) {
        this.$playBtn.addClass( 'active' );
        this.$skinWrapper.show();

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

      this.trigger( 'play' );

    },

    updateSeekBar: function () {
      if ( this.ultimaTimelineSlider != null ) {
        this.ultimaTimelineSlider.slider.max = this.duration;
        this.ultimaTimelineSlider.slider.min = 0;
        this.ultimaTimelineSlider.slider.value = 0;
        this.ultimaTimelineSlider.update();
      }
    },

    onYoutubePlayerPause: function () {
      this.paused = true;
//      this.$bigPlayBtn.removeClass( 'active' );
      this.stopProgress();
      if ( this.options.controls == 1 ) {
        this.$playBtn.removeClass( 'active' );
      }
      this.trigger( 'pause' );
    },

    togglePlay: function () {
      console.log( 'toogle Play', this.paused, this.paused ? 'play' : 'pause' );
      this[ this.paused ? 'play' : 'pause' ]();
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
        this.$elem[0][ YoutubeCustomPlayer.requestFullScreen.requestFn ]();
        $( document ).on( YoutubeCustomPlayer.requestFullScreen.eventName, this.onFullScrenChangeBinded );
      } else {
        setTimeout( function () {
          self.play();
        } );
      }

      $( 'body' ).addClass( 'yt-fullscreen' );

      this.onResize();

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
        document[ YoutubeCustomPlayer.requestFullScreen.cancelFn ]();
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
    },

    pause: function () {
      this.ytplayer.pauseVideo();
    },

    unmute: function () {
      this.lastVolumeLevel = this.lastVolumeLevel || '75%';
      this.$volumeLevel.width(this.lastVolumeLevel);
      this.muted = false;
      this.ytplayer.unMute();
      this.$muteBtn.addClass( 'active' );
    },

    mute: function () {
      this.lastVolumeLevel = this.$volumeLevel.width();
      this.$volumeLevel.width(0);
      this.muted = true;
      this.ytplayer.mute();
      this.$muteBtn.removeClass( 'active' );
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
      if ( !this.seeksliding && typeof this.ultimaTimelineSlider !== 'undefined' ) {
        this.ultimaTimelineSlider.resizeSeekBar( currentTime );
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
      delete YoutubeCustomPlayer[ this.instanceId ];
    },

    on: function ( event, method ) {
      var self = this;
      this.handlers[method] = function () {
        method.apply( self, arguments );
      };
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
    if ( typeof YoutubeCustomPlayer.players[ instanceId ] != 'undefined' ) {
      if ( typeof callback != "undefined" ) {
        callback.call( YoutubeCustomPlayer.players[ instanceId ] );
      }
      return;
    }
    YoutubeCustomPlayer.players[ instanceId ] = new YoutubeCustomPlayer( id, options, callback );
    $( '#' + id ).data( 'YoutubeCustomPlayer', true );
    return YoutubeCustomPlayer.players[ instanceId ];
  };

  YoutubeCustomPlayer.destroy = function ( id ) {
    var instanceId = id.replace( /\-/g, '' );
    if ( typeof YoutubeCustomPlayer.players[ instanceId ] == 'undefined' ) return;
    YoutubeCustomPlayer.players[ instanceId ].destroy();
    $( '#' + id ).removeData( 'YoutubeCustomPlayer' );
  };

  YoutubeCustomPlayer.stopAllVideos = function () {
    for ( var p in YoutubeCustomPlayer.players ) {
      if ( YoutubeCustomPlayer.players[p].video != null && typeof YoutubeCustomPlayer.players[p] != 'undefined' )
        YoutubeCustomPlayer.players[p].pause();
    }
  };

  YoutubeCustomPlayer.requestFullScreen = (function () {

    var vendors = ["moz", "webkit", "", "ms", "o" ],
      l = vendors.length,
      fs, requestFn, cancelFn, eventName, isFullScreen;

    if ( document.cancelFullscreen !== undefined ) {
      requestFn = "requestFullscreen";
      cancelFn = "exitFullscreen";
      eventName = "fullscreenchange";
    } else {
      while ( l-- ) {
        if ( ( vendors[l] != "moz" || document.mozFullScreenEnabled) && document[ vendors[l] + "CancelFullScreen"] !== undefined ) {
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
      '<div class="yt-big-play-btn"></div>' +
      '<div class="yt-embed-message">' +
      '<div class="yt-embed-code-wrapper"><div class="yt-embed-title">Embed code</div><input type="text" class="yt-embed-code" value=""></div>' +
      '</div>' +
      '<div class="yt-controls-wrapper">' +
      '<div class="yt-play-btn">' + playPauseSvg + '</div>' +
      '<div class="yt-time"></div>' +
      '<div class="yt-embed-btn">' + embedSvg + ' <span>Embed</span></div>' +
      '<div class="yt-volume-wrapper">' +
      '<div class="yt-mute-btn">' + volumeSvg + '</div>' +
      '<div class="yt-volume"><div class="yt-volume-level"></div></div>' +
      '</div>' +
      '<div class="yt-fullscreen-btn">' + fullscreenSvg + '</div>' +
      '<div class="yt-timeline"><div class="yt-seek"></div><div class="yt-buffer"></div></div>' +
      '</div>' +
      '</div>',

    controlLess: '<div class="yt-video-wrapper"></div>' +
      '<div class="yt-loading-wrapper"><div class="yt-loading">loading</div></div>' +
      '<div class="yt-big-play-btn"></div>'

  };

  window.onYouTubeIframeAPIReady = function () {
    YoutubeCustomPlayer.init();
  };

  /** load YT API */
  var tag = document.createElement( 'script' );
  tag.src = "https://www.youtube.com/player_api";
  var firstScriptTag = document.getElementsByTagName( 'script' )[0];
  firstScriptTag.parentNode.insertBefore( tag, firstScriptTag );

// Export YoutubeCustomPlayer
//    window.YoutubeCustomPlayer = YoutubeCustomPlayer;

  return YoutubeCustomPlayer;

} );

