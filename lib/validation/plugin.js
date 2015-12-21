/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * Provides plugin  object schema validation
 * @module kingkong/lib/validation/plugin
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires joi
 */

var joi = require('joi')
   ;

module.exports = joi.object({
    name:joi.string().required()
  , consumer_id: joi.alternatives([joi.string(), joi.number()])
  , config:joi.object({}).unknown()
});
