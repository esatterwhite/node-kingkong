/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * Provides api object schema validation
 * @module king/lib/validation/api
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires joi
 */
var joi = require('joi')
  , pluginSchema = require('./plugin')
  ;

module.exports = joi.object({
    name:               joi.string()
  , request_path:       joi.string().optional()
  , request_host:       joi.string().when('request_path',{is:joi.empty(), then:joi.optional(), otherwise:joi.optional() })
  , strip_request_path: joi.boolean().default( false )
  , preserve_host:      joi.boolean().default( false ).description('Preserves the original Host header sent by the client, instead of replacing it with the hostname of the upstream_url')
  , upstream_url:       joi.string().required().description("The base target URL that points to your API server, this URL will be used for proxying requests. For example, https://mockbin.com")
  , plugins:            joi.object().unknown().optional()
});
