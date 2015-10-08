// Library paths
// If you want to use a new library, add it here.
require.config( {
  paths: {
    'underscore': '../libs/underscore',
    'jquery': '../libs/jquery',
    'backbone': '../libs/backbone',
//    'crossdomain': '../libs/Backbone.CrossDomain',
    'velocity': '../libs/velocity',
//    'velocity-ui': '../libs/velocity.ui',
//    'nestedmodel': '../libs/backbone-nested',
    'text': '../libs/text',
//    'json': '../libs/json',
//    'd3': '../libs/d3',
    'mustache': '../libs/mustache',
//    'iframeMessenger': '../libs/iframeMessenger',
//    'mediator-js': '../libs/mediator',

    // Greensock
//    'TweenLite': '../libs/gsap/uncompressed/TweenLite',
//    'TweenLite-css': '../libs/gsap/uncompressed/plugins/CSSPlugin',
//    'TweenLite-ease': '../libs/gsap/uncompressed/easing/EasePack',

    // YouTube custom player
    'yt-player': '../libs/youtubeplayer/youtubeplayer',
    'yt-player-icon-embed': '../libs/youtubeplayer/svg/embed.svg',
    'yt-player-icon-volume': '../libs/youtubeplayer/svg/volume.svg',
    'yt-player-icon-fullscreen': '../libs/youtubeplayer/svg/fullscreen.svg',
    'yt-player-icon-play-pause': '../libs/youtubeplayer/svg/play-pause.svg',
    'yt-player-icon-cc': '../libs/youtubeplayer/svg/cc.svg',
    'yt-player-icon-languages': '../libs/youtubeplayer/svg/languages.svg',
    'yt-player-icon-hd': '../libs/youtubeplayer/svg/hd.svg'

  },
  shims: {
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    }
  }
} );

