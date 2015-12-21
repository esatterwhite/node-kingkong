/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * api.js
 * @module api.js
 * @author Eric Satterwhite
 * @since 0.0.1
 * @requires seeli
 * @requires king
 */

var seeli = require( 'seeli' )
  , King = require('../lib/index')
  , List
  ;

List = new seeli.Command({
    description:'Manage plugin instance registered with a kong cluster'
    ,usage:["test"]
    ,flags:{}
    ,run: function( directive, data, done ){

        var instance = new King({
            hosts:data.hosts
        });

        switch( directive ){
            case 'api':
                break;
            case 'plugin':
                break;
            case 'consumer':
                break;

            default:
                return done( new Error('broke') )
        }
    }
});

module.exports = List;