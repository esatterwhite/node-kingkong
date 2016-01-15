/*jshint mocha:true, esnext:true, node:true, laxcomma:true*/
'use strict';
/**
 * Provides a simple and standard way to include class configuration options
 * @module kingkong/lib/options
 * @author Eric Satterwhite
 * @requires prime
 * @requires mout/object/merge
 * @requires mout/array/append
 * @since 0.1.0
 **/
var Class  = require('prime')
  , merge  = require( 'mout/object/deepMixIn' )
  , append = require( 'mout/array/append' )
  , Options
  ;

function removeOn( name ){
    return name.replace(/^on([A-Z])/, function(full, first ){
        return first.toLowerCase();
    });
}

/**
 * Object class mixing which provides a standard way of defining configuration options on a class instance
 * @constructor
 * @alias module:king/lib/options
 * @param {Object} options and object containing configutation overrides to set on the class instance
 * @example var X = Class({
  mixin: [ Options ]
  ,options:{
    "value1": 1
    ,"value2":2
  } 
  , constructor: function( options ){
      this.setOptions( options )
  }
});

var x = new X({
    "value1":2
    ,"value2"1
})
 */
Options = new Class({
    /**
     * merges an object into existing instance options and stores them in an options property
     * @param {Objecdt} Options conifguration options to be merged into defaults
     * @returns {Object} 
     */ 
    setOptions: function( options ){
        if( !!this.addListener ){
            for( var opt in options ){

                if( typeof( options[ opt ] ) !== 'function' || !(/^on[A-z]/).test(opt)){
                    continue;
                }
                this.addListener( removeOn( opt ), options[ opt ]);
                delete options[opt];
            }
        }
        this.options = merge.apply(null, append([{}, this.options || {} ], arguments ) );
        options = this.options;
        return this;
    }
});

module.exports = Options;
