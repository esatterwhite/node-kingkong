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
 */

var Class        = require( 'prime' )
  , assert       = require('assert')
  , EventEmitter = require('events').EventEmitter
  , toArray      = require('mout/lang/toArray')
  , co           = require('co')
  , request      = require('co-request')
  , urljoin      = require('urljoin')
  , Options      = require('./options')
  , url          = require('url')
  , compact      = require('mout/array/compact')
  , King
  ;

const resource_exp = /(api|plugin|component)s?$/;
const protocol     = /https?/;

function next(){
    return this[ this.incr++ % this.length ];
}

function cycle( items ){
    items = toArray( items )
                .filter(function(host){
                    let opts = url.parse( host );
                    return opts.host && ( protocol ).test( opts.protocol );
                });
    items.next = next.bind( items );
    items.incr =Math.floor(Math.random() * (items.length) - Math.random() + 1 ); 
    return items;
}

/**
 * @constructor
 * @extends EventEmitter
 * @alias module:king
 * @param {Object} [options]
 * @param {String|String[]} [options.hosts=http://localhost:8001]
 * @example var x = new require('index.js');
 */
King = new Class({
    mixin:[ Options ]
    ,inherits: EventEmitter
    ,options:{
        hosts:'http://localhost:8001',
        plugins:[],
        consumers:[],
        apis:[]
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
        this.emit('autocreate');
    }

    /**
     * Creates one or more instance of a resource. If the resource already exists, it will be updated
     * @method module:king#create
     * @param {String} resource The type of resource to generate a url for ( api, plugin, consumer ) 
     * @param {Object|Object[]} items configurations of the resource to create
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
     * Destroys a specific resource
     * @method module:king#destroy
     * @param {String} resource the type of resource to operate on ( api, consumer, plugin )
     * @param {String} id The id or name of a specific resource to destroy
     **/
    ,destroy:co.wrap(function* destroy( resource, id ){
        return yield this.request('delete', resource, ( toArray( arguments ).slice( 1 ) ) );
    })

    /**
     * List a specific resource type
     * @method module:king#list
     * @param {String} resource the resource to list
     * @returns {Array}
     **/
    ,list:co.wrap(function* list( resource ){
        let resp = yield this.request('get', resource );
        return (resp.body).data;
    })
    
    /**
     * List a specific resource 
     * @method module:king#get
     * @param {String} resource the resource to get
     * @param {String} id or name of the specific instance to get
     * @returns {Array}
     **/
    ,get:co.wrap(function* list( resource, id ){
        let resp = yield this.request('get', resource, id);
        return (resp.body)
    })

    /**
     * pudates a resource in place by id, or name
     * @method module:king#update
     * @param {String} resource the name of the resource type ( api, plugin, consumer)
     * @param {String} id The id or name of the resource to update
     * @param {Object} data a data object to update the resource with
     * @returns {Object}
     **/
    ,update:co.wrap(function* update( resource, id, data){
        let resp = yield this.request('patch', resource, id, data );
        return {
            status:resp.statusCode,
            content:resp.body
        }
    })

    /**
     * Generates a valid url for a kong request, cycling through one of the hosts for each call
     * @method module:king#url
     * @param {String} resource The type of resource to generate a url for ( api, plugin, consumer ) 
     * @param {String} [id] the id or name of a specific resource
     * @return {String} the url for request to kong
     **/
    ,url: function url( resource, id ){
        return urljoin(
            this.options.hosts.next()
          , resource
          , id
        );
    }

    /**
     * Generates a valid url for a kong request, cycling through one of the hosts for each call
     * @method module:king#request
     * @param {String} resource The type of resource to generate a url for ( api, plugin, consumer ) 
     * @param {String} [id] the id or name of a specific resource
     * @return {Promise} A promise that will resolve to the result of the request 
     **/
    ,request: function( action, resource, id, data ){
        let result = resource_exp.exec( resource )
          , error
          , uri
          ;

        if(!result){
            error = new Error('invalid resource type ' + resource);
            error.name = 'InvalidResourceError';
            throw erorr;
        }
        uri = this.url( result[result.index], id );
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
