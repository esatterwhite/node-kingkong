/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * api.js
 * @module api.js
 * @author Eric Satterwhite
 * @since 0.0.1
 * @requires seeli
 */

var seeli = require( 'seeli' )
  , King = require('../lib/index')
  , util = require('util')
  , Api
  ;

Api = new seeli.Command({
    description:'Manage API instance registered with a Kong cluster'
    ,usage:[
        ''
        , seeli.bold( 'Directives:' )
        , seeli.bold( seeli.green('   create') )  + (' - create new api instances')
        , seeli.bold( seeli.green('   list') )    + (' - dsplay api instances')
        , seeli.bold( seeli.green('   destroy') ) + (' - remove api instances')
        , seeli.bold( seeli.green('   update') )  + (' - modify api instances')
        , ''
    ]
    ,flags:{
        host:{
            type:[String, Array]
            ,description:'Uri to a kong host'
            ,shorthand:'H'
            ,default:'http://0.0.0.0:8001'
        }
        ,name:{
            type:String
            ,required:true
            ,shorthand:'n'
            ,description:'The API name. If none is specified, will default to the request_host or request_path'
        }

        ,request_host:{
            type:String
            ,description:'The public DNS address that points to your API. For example, mockbin.com. At least request_host or request_path or both should be specified'
        }

        ,preserve_host:{
            type:Boolean
            ,defauljt:false
            ,shorthand:'P'
            ,description:'Preserves the original Host header sent by the client, instead of replacing it with the hostname of the upstream_url. By default is false'
        }

        ,upstream_url:{
            type:String
            ,shorthand:'u'
            ,required:true
            ,description:'The base target URL that points to your API server, this URL will be used for proxying requests. For example, https://mockbin.com'
        }

        ,request_path:{
            type:String
            ,required:true
            ,description:'The public path that points to your API. For example, /someservice. At least request_host or request_path or both should be specified'
            ,shorthand:'p'
        }

        ,strip_request_path:{
            type:Boolean
            ,default:false
            ,description:'Strip the request_path value before proxying the request to the final API. For example a request made to /someservice/hello will be resolved to upstream_url/hello. By default is false'
        }
        ,id:{
            type:String
        }

    }
    ,run: function( directive, data, done ){
        var instance = new King({
            hosts:data.host
        });

        switch( directive ){
            case 'create':
            case 'list':
                instance[directive]('apis', data ).then( function( resp ){
                    done( null, JSON.stringify( resp, null, 2 ));
                })
                break;
            case 'destroy':
            case 'update':
                instance[directive]('apis', data.id ).then(function(res){
                    done( );
                });
                break;

            default:
                return done( new Error(util.format( 'Invalid directive %s. Valid options are %s', directive, 'create, list, destroy, update') ) )
        }
    }
});

module.exports = Api;
