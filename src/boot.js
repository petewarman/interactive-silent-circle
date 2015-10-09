define( [], function () {

  'use strict';

  // Get paths for assets (css + js)
  var rootPath = isLocal() ? "{{local-root}}" : "{{remote-root}}";
  var assetsPath = rootPath + 'assets/';

  function isLocal() {
    return window.location.hostname === 'localhost' || window.location.hostname === '0.0.0.0' || window.location.port === '8080' || window.location.port === '8089' || window.location.port === '8888';
  }

  function addCSS( url ) {
    var head = document.querySelector( 'head' );
    var link = document.createElement( 'link' );
    link.setAttribute( 'rel', 'stylesheet' );
    link.setAttribute( 'type', 'text/css' );
    link.setAttribute( 'href', url );
    head.appendChild( link );
  }

  return {
    boot: function ( el, context, config, mediator ) {
      // Load CSS
      addCSS( assetsPath + 'css/main.css' );

      // Load main application
      require( [ assetsPath + 'js/main.js'], function ( req ) {
        // Main app returns a almond instance of require to avoid
        // R2 / NGW inconsistencies.
        req( ['main'], function ( main ) {
          main.init( el, context, config, mediator );


        } );
      }, function ( err ) {
        console.error( 'Error loading boot.', err );
      } );
    }
  };
} );
