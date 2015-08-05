define( function ( require ) {

  var Event = function ( el ) {

    console.log(el);

    this.el = el ? el : document;
    this.pointerX = 0;
    this.pointerY = 0;

    this.initialize();
  };

  Event.prototype = {
    initialize: function () {

      this.el.addEventListener( 'touchstart', this.onDocumentTouchStart.bind( this ), false );
      this.el.addEventListener( 'touchmove', this.onDocumentTouchMove.bind( this ), false );
      this.el.addEventListener( 'mousemove', this.onDocumentMouseMove.bind( this ), false );

    },

    onDocumentTouchStart: function ( event ) {
      if ( event.touches.length === 1 ) {
        event.preventDefault();
        this.pointerX = event.touches[ 0 ].pageX;
        this.pointerY = event.touches[ 0 ].pageY;
      }
    },

    onDocumentTouchMove: function ( event ) {
      if ( event.touches.length === 1 ) {
        event.preventDefault();
        this.pointerX = event.touches[ 0 ].pageX;
        this.pointerY = event.touches[ 0 ].pageY;
      }

      this.onPointerMove();
    },

    onDocumentMouseMove: function () {
      this.pointerX = event.clientX;
      this.pointerY = event.clientY;

      this.onPointerMove();
    },

    onPointerMove: function () {
      App.mediator.publish( 'pointer', {
        x: this.pointerX,
        y: this.pointerY
      } );
    }
  };

  return Event;

} );