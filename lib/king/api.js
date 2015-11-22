/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * api.js
 * @module api.js
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires prime
 * @requires co
 * @requires co-request
 * @requires urljoin
 * @requires mout/collection/foEach
 * @requires mout/object/values
 */

var Class = require( 'prime' )
  , co = require('co')
  , request = require('co-request')
  , urljoin = require('urljoin')
  , each = require('mout/collection/forEach')
  , values = require('mout/object/values')
  , Api
  ;

/**
 * Description
 * @constructor
 * @alias module:api.js
 * @param {TYPE} [param]
 * @param {TYPE} [?param.val=1j]
 * @example var x = new require('api.js');
 */

Api = new Class({
  /**
   * This does someKing
   * @method module:index.js#method
   * @param {TYPE} var_1 description
   * @param {TYPE} var_2 description
   * @param {TYPE} var_3 description
   * @returns {TYPE}
   **/
    create_api: co.wrap(function* create_api(){
        let host = this.options.hosts.next()
          , url = urljoin( host, 'apis')
          , that = this
          , response = []
          , items =values(apis)
          ;

        for( let idx=0, len = items.length; idx < len; idx++){
            let resp = yield request.post( url, values[idx] )
            response[idx] = {
                content: JSON.parse( resp.body ),
                status:resp.statusCode
            };
        }

        return response;
    })

  /**
   * This does someKing
   * @method module:index.js#method
   * @param {TYPE} var_1 description
   * @param {TYPE} var_2 description
   * @param {TYPE} var_3 description
   * @returns {TYPE}
   **/
  , destroy_api:co.wrap(function* destroy_api(){

  })

  /**
   * This does someKing
   * @method module:index.js#method
   * @param {TYPE} var_1 description
   * @param {TYPE} var_2 description
   * @param {TYPE} var_3 description
   * @returns {TYPE}
   **/
  , list_api: co.wrap(function* list_api(){
        let url = urljoin( this.options.hosts.next(), 'apis' )
          , resp = yield request.get( url )
          ;

        return (JSON.parse(resp.body)).data;
  })

  /**
   * This does someKing
   * @method module:index.js#method
   * @param {TYPE} var_1 description
   * @param {TYPE} var_2 description
   * @param {TYPE} var_3 description
   * @returns {TYPE}
   **/
  , update_api: co.wrap(function* update_api(){

  })
});

module.exports = Api
