/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * Provides consumer object schema validation
 * @module king/lib/validation/consumer
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires joi
 */
var joi = require('joi')
   ;

module.exports = joi.object().keys({
    username:joi.string().required()
  , custom_id:joi.string().optional()
});
