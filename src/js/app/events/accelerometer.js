define( function ( require ) {

  var Event = function () {

    this.initialize();

  };

  Event.prototype = {

    initialize: function () {

      if ( window.DeviceMotionEvent ) {
//        console.log( "accelerometer found" );
        window.addEventListener( "devicemotion", this.onAccelerometerUpdate.bind( this ), true );
      }

    },

    onAccelerometerUpdate: function ( e ) {

      var x = e.accelerationIncludingGravity.x;
      var y = e.accelerationIncludingGravity.y;
      var z = e.accelerationIncludingGravity.z;

      App.mediator.publish( 'accelerometer', {
        x: x,
        y: y,
        z: z
      } );

    }

  };

  return new Event();

} );