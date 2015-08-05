define( [
  'backbone',
  'nestedmodel',
  'crossdomain'
], function ( Backbone ) {
  'use strict';

  return Backbone.Collection.extend( {

    url: function () {
      return 'http://interactive.guim.co.uk/spreadsheetdata/' + this.key + '.json';
    },

    originalData: null,

    model: Backbone.NestedModel.extend( {} ),

    initialize: function ( options ) {
      this.sheetname = options.sheetname;
      this.key = options.key;
    },

    parse: function ( data ) {
      if ( !data || !data.hasOwnProperty( 'sheets' ) || !data.sheets.hasOwnProperty( this.sheetname )
        ) {
        console.error( 'Error parsing sheet JSON' );
        return false;
      }
      this.originalData = data.sheets;

      console.log(data);

      return data.sheets[this.sheetname];
    }

  } );
} );

