#!/usr/bin/env node
/*jshint laxcomma: true, smarttabs: true*/
'use strict';
/**
 * Simple test runner harness. Forks a mocha process so we can control the env a litte better
 * @module scripts/test
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires child_process
 * @requires module:mout/lang/clone
 * @requires fs
 * @requires path
 * @requires os
 * @requires util
 */

var child_process = require('child_process')               // child proces for spawning mocha
  , clone         = require('mout/lang/clone')             // object clone module
  , fs            = require('fs')                          // fs module
  , path          = require('path')                        // path module
  , os            = require('os')                          // os module
  , util          = require("util")                        // util module
  , testing       = ~~process.env.TEST // boolean flag if we are in producion mode
  , env           = clone( process.env )                   // clone of current process env
  , debug         = require('debug')( 'scripts:runner')
  , html                                                   // html stream
  , coverage                                               // mocha code coverage process
  , mocha                                                  // moacha child process
  , reporter
  , root
  ;

root = path.resolve(__dirname)
root = path.join(root,  `../**/test/*.spec.js` )
// inject some test vars into the env
env.MOCHA_COLORS = 1


// TODO: include test / code coverage & reporting in here

if( testing ){
	reporter = fs.createWriteStream('tap.xml',{
		flags:'w'
		,encoding:'utf8'
	})
} else {
	reporter = process.stdout
}

// TODO: Bootstrap a test DB

// spin up mocha configured the way I want it
mocha = child_process.spawn("mocha", [
	"--harmony"
	, "--growl"
	, "--recursive"
	// ,"--debug-brk"
	,"--timeout=10000"
	, util.format("--reporter=%s", testing ? 'xunit':'spec')
	, root
	], { env:env });

	mocha.on('exit', function( code, sig ){
	process.exit( testing ? 0 : code );
});

mocha.stdout.pipe( reporter )
mocha.stderr.pipe( reporter )
