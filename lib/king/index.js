/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * Primay Client class for interfacing with kong
 * @module king
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires prime
 */

var Class    = require( 'prime' )
  , toArray  = require('mout/lang/toArray')
  , urljoin  = require('urljoin')
  , Options  = require('../options')
  , Api      = require('./api')
  , Consumer = require('./consumer')
  , Plugins  = require('./plugins')
  , King
  ;

/**
 * Description
 * @constructor
 * @alias module:king
 * @param {TYPE} [param]
 * @param {TYPE} [?param.val=1j]
 * @example var x = new require('index.js');
 */
King = new Class({
    mixin:[ Options, Api, Consumer, Plugins ]
    ,options:{
        hosts:'http://localhost:8001',
        plugins:{},
        apis:{}
    }
    ,constructor: function( options ){
        this.setOptions( options );
        this.create('apis', this.options.apis );
        this.create('plugins', this.options.plugins);
    }

    /**
     * This does someKing
     * @method module:index.js#method
     * @param {TYPE} var_1 description
     * @param {TYPE} var_2 description
     * @param {TYPE} var_3 description
     * @returns {TYPE}
     **/
    ,create:function create( resource, id, options ){
        let methodname = 'create_' + resource;
        return this[ methodname ] ? this.methodname( options ) : Promise.resolve(null);
    }

    /**
     * This does someKing
     * @method module:index.js#method
     * @param {TYPE} var_1 description
     * @param {TYPE} var_2 description
     * @param {TYPE} var_3 description
     * @returns {TYPE}
     **/
    ,destroy:function destroy( resource, id, options ){
        let methodname = 'create_' + resource;
        return this[ methodname ] ? this.methodname( options ) : Promise.resolve(null);
    }

    /**
     * This does someKing
     * @method module:index.js#method
     * @param {TYPE} var_1 description
     * @param {TYPE} var_2 description
     * @param {TYPE} var_3 description
     * @returns {TYPE}
     **/
    ,list:function list( resource, options ){
        let methodname = 'create_' + resource;
        return this[ methodname ] ? this.methodname( options ) : Promise.resolve(null);
    }

    /**
     * This does someKing
     * @method module:index.js#method
     * @param {TYPE} var_1 description
     * @param {TYPE} var_2 description
     * @param {TYPE} var_3 description
     * @returns {TYPE}
     **/
    ,update:function update( resource, id, options ){
        let methodname = 'create_' + resource;
        return this[ methodname ] ? this.methodname( options ) : Promise.resove(null);
    }
});

module.exports = King;