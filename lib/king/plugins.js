/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * plugins.js
 * @module plugins.js
 * @author 
 * @since 0.0.1
 * @requires prime
 */

var Class = require( 'prime' )
  , Plugins
  ;

Plugins = new Class({
    list_plugins: function(){
        return Promise.resolve( [] );
    }
});
module.exports = Plugins;
