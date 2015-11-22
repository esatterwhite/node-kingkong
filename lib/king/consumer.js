/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * consumer.js
 * @module consumer.js
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires prime
 */

var Class = require( 'prime' )
  , Consumer
  ;

/**
 * Description
 * @constructor
 * @alias module:consumer.js
 * @param {TYPE} [param]
 * @param {TYPE} [?param.val=1j]
 * @example var x = new require('consumer.js');
 */

Consumer = new Class({
    list_consumer:function(){
        console.log('consumers');
        return Promise.resolve( [] );
    }
});

module.exports = Consumer
