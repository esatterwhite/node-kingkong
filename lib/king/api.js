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
    create_api: co.wrap(function* create_api( apis ){
        let host = this.options.hosts.next()
          , url = urljoin( host, 'apis')
          , that = this
          , response = []
          , resp
          ;

        for( let idx=0, len = apis.length; idx < len; idx++){
            let data = apis[idx]
            resp = yield request.post( url, {json:true, body:data} )
            resp =resp.statusCode == 409 ? yield this.update_api( data.name, data ) : resp;
            response[idx] = {
                content: resp.body,
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
  , destroy_api:co.wrap(function* destroy_api( id ){
        let url = urljoin( this.options.hosts.next(), 'apis',id );
        return yield request.delete( url, {json:true});
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
          , resp = yield request.get( url,{json:true} )
          ;

        return (resp.body).data;
  })

  /**
   * This does someKing
   * @method module:index.js#method
   * @param {TYPE} var_1 description
   * @param {TYPE} var_2 description
   * @param {TYPE} var_3 description
   * @returns {TYPE}
   **/
  , update_api: co.wrap(function* update_api(id, data){
     let url = urljoin( this.options.hosts.next(), 'apis', id );
     return yield request.patch( url, {json:true, body:data} );
  })
});

module.exports = Api
