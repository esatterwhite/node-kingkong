#!/usr/bin/env node
'use strict';
/**
 * Command line Interface for fulfill. This module is here to load other management
 * commands. And that is about it.
 * @module cage/bin/cli
 * @author Eric Satterwhite
 * @since 1.3.0
 * @requires seeli
 * @requires path
 * @requires fs
 * @requires debug
 */

 var cli = require( 'seeli' )
   , fs            = require('fs')   // fs module
   , path          = require('path') // fs module
   , debug         = require('debug')( 'king:bin')
   , jsregex       = /\.js$/
   ;

[ path.join( process.cwd(), 'commands' ) ] 
.forEach( function( searchpath ){
    debug('searching for commands %s', searchpath);
    if( fs.existsSync( searchpath ) && fs.statSync( searchpath ).isDirectory() ){
        fs.readdirSync(searchpath).forEach( function(module){
            if( jsregex.test( module ) ){
                debug( requirepath );
                var requirepath = path.join( searchpath, module )
                  , cmd = require(requirepath)
                  , name = ((cmd.options.name ? cmd.options.name : module)).replace(jsregex,'').toLowerCase().replace('-', '_');

                try{
                    debug('loading %s', requirepath);
                    debug('registering %s command', module );
                    cli.use( name, cmd);
                } catch( e ){
                    debug('unable to register module %s', module );
                }
            }
        } );
    }
});
cli.set('name', 'king')
cli.set('color', 'magenta');
cli.run();
