/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * Command for managing plugins
 * @module kingkong/commands/plugin
 * @author Eric Satterwhite
 * @since 0.0.1
 * @requires seeli
 * @requires mout/object/set
 */

var seeli = require( 'seeli' )
  , King = require('../lib/index')
  , util = require('util')
  , set  = require('mout/object/set')
  , typecast = require('mout/string/typecast')
  , configexp = /^config\.(\w+)/
  , Plugin
  ;

Plugin = new seeli.Command({
    description:'Manage Plugin instance registered with a Kong cluster'
    ,usage:[
	    , seeli.bold('Usage: ')
	    , 'king plugin create -n jwt -a cde882f0-b434-4e52-bb0c-fa4b169f59fc --config.foo=1 --config.bar=2'
	    , ''
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
            ,description:'The Plugin name. If none is specified, will default to the request_host or request_path'
        }

        ,id:{
            type:String
        }

        ,api_id:{
            type: String
            ,shorthand:'a'
            ,description:'id of the api associated with the plugin instance'
        }
    }
    ,run: function( directive, data, done ){
        var instance = new King({
            hosts:data.host
        });

        var config = {};

        for( let key in data ){
            var valid = configexp.exec( key )
            if( valid ){
                set( config, valid[1], typecast( data[key] ) );
                delete data[key];
            }
        }

        data.config = config;
        return done(null, ' done ');         
        switch( directive ){
            case 'create':
            case 'list':
                instance[directive]('plugins', data ).then( function( resp ){
                    done( null, JSON.stringify( resp, null, 2 ));
                })
                break;
            case 'destroy':
            case 'update':
                instance[directive]('plugins', data.id ).then(function(res){
                    done( );
                });
                break;

            default:
                return done( new Error(util.format( 'Invalid directive %s. Valid options are %s', directive, 'create, list, destroy, update') ) )
        }
    }
});

module.exports = Plugin;
