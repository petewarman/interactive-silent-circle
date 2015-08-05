define([
    'backbone'
],
function(Backbone) {
    'use strict';

    var Routes = Backbone.Router.extend({
        routes: {
            'games/:gameid' : 'singleGame',
            'games(/)'      : 'catalogue',
            '*other'        : 'default'
        }
    });

    return new Routes();
});

