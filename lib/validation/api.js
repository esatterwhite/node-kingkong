/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * Provides api object schema validation
 * @module kingkong/lib/validation/api
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires joi
 */
var joi = require('joi')
  , pluginSchema = require('./plugin')
  ;

module.exports = joi.object({
    name:               joi.string()
  , hosts:              joi.array().unique()
  , uris:               joi.array().items(joi.string().optional())
  , methods:            joi.array().unique()
  , upstream_url:       joi.string().required().description("The base target URL that points to your API server, this URL will be used for proxying requests. For example, https://mockbin.com")
  , strip_uri:          joi.boolean()
  , preserve_host:      joi.boolean().description('Preserves the original Host header sent by the client, instead of replacing it with the hostname of the upstream_url')
  , retries:            joi.number()
  , upstream_connect_timeout: joi.number()
  , upstream_read_timeout:    joi.number()
  , upstream_send_timeout:    joi.number()
  , https_only:         joi.boolean()
  , http_if_terminated: joi.boolean()
  , plugins:            joi.object().unknown().optional()
});
