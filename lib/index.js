/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * Primay Client class for interfacing with kong
 * @module kingkong
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires prime
 * @requires url
 * @requires util
 * @requires debug
 * @requires co
 * @requires co-request
 * @requires urljoin
 * @requires events
 * @requires mout/lang/toArray
 * @requires mout/lang/isString
 * @requires mout/lang/compact
 * @requires mout/collection/forEach
 * @requires kingkong/lib/options
 * @requires kingkong/lib/validation/api
 * @requires kingkong/lib/validation/consumer
 * @requires kingkong/lib/validation/plugin
 */

var Class             = require( 'prime' )             // simple class helper
  , url               = require('url')                 // node url module
  , util              = require('util')               // node util module
  , debug             = require('debug')('kingkong:main')
  , co                = require('co')                  // coroutine helper
  , request           = require('co-request')          // co wrapper for requests
  , urljoin           = require('urljoin')             // like path.join for urls
  , EventEmitter      = require('events').EventEmitter // node events modules
  , toArray           = require('mout/lang/toArray')   // array conversion helper
  , isString          = require('mout/lang/isString')   // array conversion helper
  , merge             = require('mout/object/merge')
  , compact           = require('mout/array/compact')  // removes empty items from an array
  , clone             = require('mout/lang/clone')
  , each              = require('mout/collection/forEach')
  , Options           = require('./options')           // options class mixin
  , apiValidator      = require('./validation/api')
  , consumerValidator = require('./validation/consumer')
  , pluginValidator   = require('./validation/plugin')
  , King
  , validators

validators = {
    apis: apiValidator
   , consumers: consumerValidator
   , plugins: pluginValidator
}

/**
 * Configuration for creating an api instance with kong
 * @typedef {Object} Api
 * @property {Object} [plugins] An object where the key is the name of a valid plugin, and the value is an object of the configuration to create/update it with
 * @property {String} name The name of the being created / updated
 * @property {String} [request_host] Public DNS, or ip address
 * @property {String} [request_path] The public path that points to your api - `/somservice`. On of `request_host` or `request_path` must be specified
 * @property {Boolean} [strip_request_path=false] Determines if the original request path is removed before proxying the request to the upstream service
 * @property {Boolean} [preserve_host=false] Determines if the original `Host` header sent from the client should be preserved. If false, `upstream_url` is used
 * @property {String} upstream_url The target URL of the backend service responsible for handling the request - `http://api.foobar.com`
 **/

const resource_exp = /(api|plugin|consumer)s?$/;
const protocol     = /https?/;
const trailing_slash = /\/$/;
const nested_methods = /(patch|delete)$/;
//  Object mapping Kong REST API methods used in the library with acceptable status codes.
const acceptable_method_codes = {
    'get': [200],
    'post': [201],
    'put': [200, 201],
    'delete': [204, 404],
    'patch': [200, 204],
};

function isNested( method, resource ){
    method = method.toLowerCase();
    let result = resource_exp.exec( resource );

    return !!( result && result[1] == 'plugin' && method.match( nested_methods ) );
}

function next(){
    return this[ this.incr++ % this.length ];
}

function clean( str ){
    str = str || '';
    return toArray( isString( str ) ? str.replace(/\s+/g,'').split(',') : str );
}

function cycle( items ){
    items = clean( items )
                .filter(function(host){
                    let opts = url.parse( host );
                    return opts.host && ( protocol ).test( opts.protocol );
                });
    items.next = next.bind( items );
    items.incr = Math.floor(Math.random() * (items.length) - Math.random() + 1 );
    return items;
}

/**
 * @constructor
 * @extends EventEmitter
 * @alias module:kingkong
 * @param {Object} [options]
 * @param {String|String[]} [options.hosts=http://localhost:8001]
 * @param {module:kingkong~Ap|imodule:kingkong~Api[]} [options.apis] an array of api configurations to be created or updated when the instance is created
 * @param {Boolean} [options.autodelete=false] if set to true api plugins will be deleted from kong when they are not present in the related config
 * @example var king = (new require('kingkong')({
 *    hosts:['http://localhost:8001', 'http://localhost:8002', 'http://locahost:8003']
 * });
 * @example var king = (new require('kingkong')({
      hosts:'http://localhost:8001, http://localhost:8002, http://locahost:8003',
      apis:[{
          "upstream_url": "http://192.168.1.135:3000/api/v1",
          "request_path": "/integration",
          "strip_request_path": true,
          "name": "integration",
          "plugins":{
            "http-log":{
              config:{
                  http_endpoint:'http://192.168.1.135:3005',
                  method:'POST'
              }
            }
          }
      }]
   });
 */
King = new Class({
    mixin:[ Options ]
    ,inherits: EventEmitter
    ,options:{
        hosts:'http://localhost:8001',
        sync:false,
        autodelete:false,
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
        debug('sync set to %s: ', this.options.sync )
        this.options.sync && this.sync();
    }

    /**
     * Creates one or more instance of a resource. If the resource already exists, it will be updated
     * @method module:kingkong#create
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
            let data = items[idx]
              , validator = validators[resource]
              , valid = true
              , result
              ;

            result = validator.validate( data )

            if( result.error ){
                debug('error', result.error);
                throw result.error
            }
            plugins = result.value.plugins
            delete result.value.plugins;
            debug('creating %s instance', resource);
            resp = yield this.request('post', resource, null, result.value, [201, 409 /* we accept 409 to recognize when we need to update */]);
            resp = resp.statusCode === 409 ?
                yield this.request( replace ? 'put' : 'patch', resource, ( result.value.id || result.value.name ), result.value ) :
                resp;
            debug('clean plugins', plugins);
            debug('original', data.plugins );
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
     * @method module:kingkong#destroy
     * @param {String} resource the type of resource to operate on ( api, consumer, plugin )
     * @param {String} id The id or name of a specific resource to destroy
	 * @returns {Promise}
     **/
    ,destroy:co.wrap(function* destroy( resource, id ){
        let resp = yield this.request('delete', resource, id );
        return resp.body;
    })

    /**
     * List a specific resource type
     * @method module:kingkong#list
     * @param {String} resource the resource to list
     * @returns {Promise} Resolves an array of resource objects
     **/
    ,list:co.wrap(function* list( resource, id ){
        let resp = yield this.request('get', resource, id );
        return (resp.body) && resp.body.data;
    })

    /**
     * List a specific resource
     * @method module:kingkong#get
     * @param {String} resource the resource to get
     * @param {String} id or name of the specific instance to get
     * @returns {Array}
     **/
    ,get:co.wrap(function* list( resource, id ){
        let resp = yield this.request('get', resource, id);
        return (resp.body) && resp.body.data;
    })

    /**
     * pudates a resource in place by id, or name
     * @method module:kingkong#update
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
     * @method module:kingkong#url
     * @param {String} resource The type of resource to generate a url for ( api, plugin, consumer )
     * @param {String} [id] the id or name of a specific resource
     * @return {String} the url for request to kong
     **/
    ,url: function url( resource, id, sub ){
        let host = this.options.hosts.next();
        let uri = urljoin(
            host,
            resource,
            id,
            sub
        ).replace(trailing_slash,'');
        debug('request uri: ', uri);
        return uri;
    }

    /**
     * Generates a valid url for a kong request, cycling through one of the hosts for each call
     * @method module:kingkong#request
     * @param {String} resource The type of resource to generate a url for ( api, plugin, consumer )
     * @param {String} [id] the id or name of a specific resource
     * @param {Object} [data] optional body of the request
     * @param {Array} [codes] optional array of HTTP status codes that are not considered an error
     * @return {Promise} A promise that will resolve to the result of the request
     **/
    ,request:function _request( action, resource, id, data, codes ){
        let result = resource_exp.exec( resource )
          , method = action.toUpperCase()
          , body   = clone( data )
          , error
          , uri
          , options
          ;

        if(!result){
            error = new Error('invalid resource type ' + resource);
            error.name = 'InvalidResourceError';
            throw error;
        }

        result  = result[1] + 's';
        uri     = this.url( result, id );
        options = {
            method:method
          , uri: uri
          , json:true
          , body: body
        };

        return request(options)
            .then((result) => this._process_result( options, result, codes ));
    }

    /**
     * Make a request to Kong with defined request options.
     * @method module:kingkong#_request
     * @param {Object} options Object describing the request options
     * @param {Array} [codes] optional array of HTTP status codes that are not considered an error
     * @return {Promise} A promise that will resolve to the result of the request
     * @private
     **/
    ,_request:function _request( options, codes ){
        return request(options).then((result) => this._process_result( options, result, codes ));
    }

    /**
     * Analyzes Kong response to the request made with the given options
     * @method module:kingkong#_process_result
     * @param {Object} options Object describing the request options
     * @param {Array} [codes] optional array of HTTP status codes that are not considered an error
     * @return {Promise} A promise that will resolve to the result of the request
     * @private
     **/
    ,_process_result:function _process_result( options, result, codes ) {
        // If no codes were specified then get the default codes acceptable for the given method.
        if (!codes || codes.length === 0) {
            codes = acceptable_method_codes[options.method.toLowerCase()];
        }
        // Try to find the resulting status code in the acceptable codes.
        if (codes.indexOf(result.statusCode) >= 0) {
            return Promise.resolve(result);
        }

        return Promise.reject(new Error(
            `Kong API failed for ${options.method} ${options.uri} with ${result.statusCode}: ${JSON.stringify(result.body)}`));
    }

    /**
     * Syncs api and consumer configuration with a kong instance.
     * matching records will be updated
     * missing records will be created
     * records that do not exists in the configuration will be removed
     * @fires module:kingkong#sync
     * @method module:kingkong#sync
     * @return {Promise}
     **/
    ,sync:co.wrap(function* sync( ){
        yield this.create('consumers', this.options.consumers);
        yield this.create('apis', this.options.apis );
        /**
         * @name module:kingkong#sync
         * @event
         **/
        this.emit('sync');
        return this;
    })

    /**
     * Creates and configures plugins for a specific API instance
     * @method module:kingkong#plugins
     * @param {String} id of the api the plugin should be assiociated with
     * @param {Object} data The configuration for the plugin
     * @return {Promise}
     **/
    ,plugins: co.wrap(function* plugins( id, data ){
        var url, plugins_list,plugins, to_do, resp, result;
        url = this.url( 'apis', id, 'plugins');
        debug('request url %s', url, data );

        plugins_list = yield this._request({
            method:'GET'
          , uri:url
          ,json:true
        });

        plugins = plugins_list.body.data;
        to_do = clone( data || {} );
        for( let idx=0,len=plugins.length; idx<len; idx++){
            let plugin = plugins[idx];
            debug('plugin', plugin.name)
            if( to_do.hasOwnProperty( plugin.name ) ){
               resp = yield this._request({
                    method:'PUT'
                    ,uri:this.url( 'apis', id, 'plugins')
                    ,json:true
                    ,body:merge( plugin, to_do[ plugin.name ] )
                })
            } else {
                debug('%sstale plugin %s', this.options.autodelete ? 'deleting ' :'', plugin.name);
                if( this.options.autodelete ){
                    resp = yield this._request({
                        method:'DELETE'
                        ,uri:this.url('plugins', plugin.id )
                    });
                }
            }
            delete to_do[ plugin.name ];
        }

        debug('no plugins loaded, creating all defined', to_do)
        for( let key in to_do ){
            debug('creating %s plugin for api %s', key, id)
            to_do[ key ].name = key
            result = validators.plugins.validate( to_do[key] );

            if( result.error ){
                throw result.error;
            }

            resp = yield this._request({
                method:'PUT'
                ,uri:this.url( 'apis', id, 'plugins')
                ,json:true
                ,body:to_do[ key ]
            })

            to_do[key].id = resp.body.id
            debug('plugin created', resp.body )
        }
    })
});

module.exports = King;
