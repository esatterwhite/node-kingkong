/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * Primay Client class for interfacing with kong
 * @module king
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires prime
 * @requires events
 * @requires urljoin
 * @requires mout/lang/toArray
 * @requires king/lib/options
 * @requires king/lib/king/api
 * @requires king/lib/king/consumer
 * @requires king/lib/king/plugins
 */

var Class    = require( 'prime' )
  , EventEmitter = require('events').EventEmitter
  , toArray  = require('mout/lang/toArray')
  , co  = require('co')
  , urljoin  = require('urljoin')
  , Options  = require('../options')
  , Api      = require('./api')
  , Consumer = require('./consumer')
  , Plugins  = require('./plugins')
  , King
  ;



function next(){
    this.incr = ~~this.incr;
    return this[ this.incr++ % this.length ]
};

function cycle( items ){
    items = toArray( items );
    items.next = next.bind( items );
    return items;
};

/**
 * Description
 * @constructor
 * @extends EventEmitter
 * @alias module:king
 * @param {Object} [options]
 * @param {String|String[]} [options.hosts=http://localhost:8001]
 * @example var x = new require('index.js');
 */
King = new Class({
    mixin:[ Options, Api, Consumer, Plugins ]
    ,inherit: EventEmitter
    ,options:{
        hosts:'http://localhost:8001',
        plugins:{},
        apis:{}
    }
    ,constructor: function( options ){
        EventEmitter.call( this );
        this.setOptions( options );
        this.options.hosts = cycle( this.options.hosts );
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
        return this[ methodname ] ? this[ methodname ]( options ) : Promise.resolve(null);
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
        let methodname = 'destroy_' + resource;
        return this[ methodname ] ? this[ methodname ]( options ) : Promise.resolve(null);
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
        let methodname = 'list_' + resource;
        return this[ methodname ] ? this[ methodname ]( options ) : Promise.resolve(null);
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
        let methodname = 'update_' + resource;
        return this[ methodname ] ? this[ methodname ]( options ) : Promise.resove(null);
    }

    ,sync:co.wrap(function* sync( ){
        this.apis = yield this.list('api');
        this.plugins = yield this.list('plugins');
        this.consumers = yield this.list('consumer');
    })
});

module.exports = King;
