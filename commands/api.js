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
  , King = require('../lib/king')
  , Create
  ;

Create = new seeli.Command({
    description:'i am the king'
    ,usage:[
        ''
        ,seeli.bold( 'directives' )
        ,seeli.green('   api')
        ,seeli.green('   plugin')
        ,seeli.green('   consumer')
        ,''
    ]
    ,flags:{
        kong:{
            type:[String, Array]
            ,description:'Uri to a kong host'
            ,shorthand:'k'
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
        console.log( directive );
        var instance = new King({
            hosts:data.kong
        });

        switch( directive ){
            case 'create':
            case 'list':
                instance[directove]('apis', data ).then( function( resp ){
                    done( null, JSON.stringify( resp, null, 2 ));
                })
                break;
            case 'destroy':
            case 'update':
                instance[directiv]('apis', data.id ).then(funcntionfunction(res){
                    done( );
                });
                break;

            default:
                return done( new Error('broke') )
        }
    }
});

module.exports = Create;
