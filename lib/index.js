/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * Primay Client class for interfacing with kong
 * @module king
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires prime
 * @requires url
 * @requires co
 * @requires co-request
 * @requires urljoin
 * @requires events
 * @requires mout/lang/toArray
 * @requires mout/lang/compact
 * @requires king/lib/options
 */

var Class        = require( 'prime' )             // simple class helper
  , url          = require('url')                 // node url module
  , util          = require('util')               // node util module
  , co           = require('co')                  // coroutine helper
  , request      = require('co-request')          // co wrapper for requests
  , urljoin      = require('urljoin')             // like path.join for urls
  , EventEmitter = require('events').EventEmitter // node events modules
  , toArray      = require('mout/lang/toArray')   // array conversion helper
  , merge        = require('mout/object/merge')
  , compact      = require('mout/array/compact')  // removes empty items from an array
  , clone        = require('mout/lang/clone')
  , each         = require('mout/collection/forEach')
  , Options      = require('./options')           // options class mixin
  , apiValidator = require('./validation/api')
  , consumerValidator = require('./validation/consumer')
  , pluginValidator = require('./validation/plugin')
  , King 
  , validators
  
validators = {
    apis: apiValidator
   , consumers: consumerValidator
   , plugins: pluginValidator
}
  

const resource_exp = /(api|plugin|consumer)s?$/;
const protocol     = /https?/;
const trailing_slash = /\/$/;
const nested_methods = /(patch|delete)$/;

function isNested( method, resource ){
    method = method.toLowerCase();
    let result = resource_exp.exec( resource );

    return !!( result && result[1] == 'plugin' && method.match( nested_methods ) );
}

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
        sync:false,
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
        this.options.sync && this.sync();
    }

    /**
     * Creates one or more instance of a resource. If the resource already exists, it will be updated
     * @method module:king#create
     * @param {String} resource The type of resource to generate a url for ( api, plugin, consumer ) 
     * @param {Object|Object[]} items configurations of the resource to create
     * @returns {TYPE}
     **/
    ,create: co.wrap(function* create( resource, items, replace ){
        let response = []
          , resp
          , plugins
          ;
        items = toArray( items );

        for( let idx=0, len=items.length; idx < len; idx++){
            let data = items[idx];
            let validator = validators[resource]
            let valid = true;
            let result;

            debugger;
            result = validator.validate( data )
            
            if( result.error ){
                throw result.error
            }
            plugins = result.value.plugins
            delete result.value.plugins;
            resp = yield this.request('post', resource, null, result.value );
            resp = resp.statusCode == 409 ? yield this.request( replace ? 'put' : 'patch', resource, ( result.value.id || result.value.name ), result.value ) : resp;
            resp.plugins = yield this.plugins( resp.body.id, plugins );
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
    ,list:co.wrap(function* list( resource, id ){
        let resp = yield this.request('get', resource, id );
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
        return (resp.body);
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
        };
    })

    /**
     * Generates a valid url for a kong request, cycling through one of the hosts for each call
     * @method module:king#url
     * @param {String} resource The type of resource to generate a url for ( api, plugin, consumer ) 
     * @param {String} [id] the id or name of a specific resource
     * @return {String} the url for request to kong
     **/
    ,url: function url( resource, id, sub ){
        let host = this.options.hosts.next();
        return urljoin(
            host,
            resource,
            id,
            sub
        ).replace(trailing_slash,'');
    }

    /**
     * Generates a valid url for a kong request, cycling through one of the hosts for each call
     * @method module:king#request
     * @param {String} resource The type of resource to generate a url for ( api, plugin, consumer ) 
     * @param {String} [id] the id or name of a specific resource
     * @return {Promise} A promise that will resolve to the result of the request 
     **/
    ,request:co.wrap(function( action, resource, id, data ){
        let result = resource_exp.exec( resource )
          , method = action.toUpperCase()
          , body = clone( data )
          , error
          , uri
          ;

        if(!result){
            error = new Error('invalid resource type ' + resource);
            error.name = 'InvalidResourceError';
            throw error;
        }

        result = result[1] + 's';
        uri = this.url( result, id ); 
        return request({
            method:method
          , uri: uri
          , json:true
          , body: body
        });
    })

    ,sync:co.wrap(function* sync( ){
        yield this.create('consumers', this.options.consumers);
        yield this.create('apis', this.options.apis );
        this.emit('sync');
        return this;
    })
    
    ,plugins: co.wrap(function*( id, data ){
        let url = this.url( 'apis', id, 'plugins')
        let plugins_list = yield request({
            method:'GET'
          , url
          ,json:true
        })
        let plugins = plugins_list.body.data;
        let to_do = clone( data )

        for( let idx=0,len=plugins.length; idx<len; idx++){
            let plugin = plugins[idx]
            if( to_do.hasOwnProperty( plugin.name ) ){
                yield request({
                    method:'PUT'
                    ,uri:this.url( 'apis', id, 'plugins')
                    ,json:true
                    ,body:merge( plugin, to_do[ plugin.name ] );
                })
            } else {
                resp = yield request({
                    method:'DELETE'
                    ,uri:this.url('plugins', plugin.id )
                });
            }
            delete to_do[ plugin.name ];
        }

    })
});

module.exports = King;
