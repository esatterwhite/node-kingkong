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

var Class        = require( 'prime' )
  , assert       = require('assert')
  , EventEmitter = require('events').EventEmitter
  , toArray      = require('mout/lang/toArray')
  , co           = require('co')
  , request      = require('co-request')
  , urljoin      = require('urljoin')
  , Options      = require('../options')
  , url          = require('url')
  , compact      = require('mout/array/compact')
  , King
  ;

const EMPTY_ARRY = [];

function next(){
    this.incr = ~~this.incr;
    return this[ this.incr++ % this.length ];
}

function cycle( items ){
    items = toArray( items )
                .filter(function(host){
                    let opts = url.parse( host );
                    return opts.host && (/https?:/).test( opts.protocol );
                });
    items.next = next.bind( items );
    return items;
}

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
    mixin:[ Options ]
    ,inherit: EventEmitter
    ,options:{
        hosts:'http://localhost:8001',
        plugins:[],
        consumers:[],
        apis:[{
            "upstream_url": "http://0.0.0.0:1000/api/v1",
            "request_path": "/integration",
            "strip_request_path": true,
            "name": "integration",
        }]
    }
    ,constructor: function( options ){
        EventEmitter.call( this );


        this.setOptions( options );
        this.options.hosts = cycle( this.options.hosts );

        if( !compact( this.options.hosts ).length ){
            let error = new Error();
            error.name='ImproperlyConfiguredError';
            error.message = 'hosts must contain one or more valid urls';
            throw error;
        }

        this.create('plugins', this.options.plugins);
        this.create('consumers', this.options.consumers);
        this.create('apis', this.options.apis );
    }

    /**
     * This does someKing
     * @method module:index.js#method
     * @param {TYPE} var_1 description
     * @param {TYPE} var_2 description
     * @param {TYPE} var_3 description
     * @returns {TYPE}
     **/
    ,create: co.wrap(function* create( resource, items ){
        let response = []
          , resp
          ;

        items = toArray( items );
        for( let idx=0, len=items.length; idx < len; idx++){
            let data = items[idx];
            resp = yield this.request('post', resource, null, data );
            resp = resp.statusCode == 409 ? yield this.request('patch', resource, data.name, data ) : resp;
            response[idx] = {
                content: resp.body,
                status:resp.statusCode
            };
        }
        return response;
    })

    /**
     * This does someKing
     * @method module:index.js#method
     * @param {TYPE} var_1 description
     * @param {TYPE} var_2 description
     * @param {TYPE} var_3 description
     * @returns {TYPE}
     **/
    ,destroy:co.wrap(function* destroy( resource, id ){
        assert.ok( (/api|consumer|plugin/).test( resource ) );
        return yield this.reqest('delete', resource, ( toArray( arguments ).slice( 1 ) ) );
    })

    /**
     * This does someKing
     * @method module:index.js#method
     * @param {TYPE} var_1 description
     * @param {TYPE} var_2 description
     * @param {TYPE} var_3 description
     * @returns {TYPE}
     **/
    ,list:co.wrap(function* list( resource ){
        let resp = yield this.request('get', resource );
        return (resp.body).data;
    })

    /**
     * This does someKing
     * @method module:index.js#method
     * @param {TYPE} var_1 description
     * @param {TYPE} var_2 description
     * @param {TYPE} var_3 description
     * @returns {TYPE}
     **/
    ,update:co.wrap(function* update( resource, id, data){
        let resp = yield this.request('patch', resource, id, data );
        return {
            status:resp.statusCode,
            content:resp.body
        }
    })


    ,url: function url( resource, id ){
        return urljoin(
            this.options.hosts.next()
          , resource
          , id
        );
    }

    ,request: function( action, resource, id, data ){
        let uri = this.url( resource, id );
        return request({
            method:action.toUpperCase()
          , uri: uri
          , json:true
          , body: data
        });
    }

    ,sync:co.wrap(function* sync( ){
        this.plugins = yield this.list('plugins');
        this.consumers = yield this.list('consumer');
        this.apis = yield this.list('api');
        return this;
    })
});

module.exports = King;
