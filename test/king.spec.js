'use strict';
var assert = require('assert');
var King = require('../lib');
var co = require('co');

describe('King', function(){
	describe('~hosts', function(){

        it('should accept a comma separated list of hosts', function( ){
            var k1 = new King({
                hosts:"http://localhost:8001, http://localhost:8002,http://localhost:8003"
            });
            assert.ok( Array.isArray( k1.options.hosts ) );
            assert.equal( k1.options.hosts.length, 3 );

            assert.equal( k1.options.hosts[0], 'http://localhost:8001' )
            assert.equal( k1.options.hosts[1], 'http://localhost:8002' )
            assert.equal( k1.options.hosts[2], 'http://localhost:8003' )
        });

        it('should ignore invalid urls', function(  ){
            var k1 = new King({
                hosts:"http:/localhost, http://localhost:8002,http://localhost:8003"
            });
            assert.ok( Array.isArray( k1.options.hosts ) );
            assert.equal( k1.options.hosts.length, 2 );

            assert.equal( k1.options.hosts[0], 'http://localhost:8002' )
            assert.equal( k1.options.hosts[1], 'http://localhost:8003' )

        })

		describe('#url', function(){
			var k1, k2
			before( function(){
				k1 = new King()
				k2 = new King({
					hosts:[
						'http://localhost:8001',
						'http://localhost:8002'
					]
				})
			})
			it('should accept a single url', function(){
				assert.equal(k1.url(), 'http://localhost:8001')
				assert.equal(k1.url(), 'http://localhost:8001')
			});

			it('should accept a resource parameter', function(){
				assert.equal(k1.url('test'), 'http://localhost:8001/test')
			})

			it('should accept a resource and id parameter', function(){
				assert.equal(k1.url('test', 1), 'http://localhost:8001/test/1')
			})

			it('should cycle through an array of host urls', function(){
				var first = k2.url().replace(/\/$/,'')
				  , second
				  ;

                assert.notEqual(k2.options.hosts.indexOf( first, -1 ) )
				second = k2.url().replace(/\/$/, '')
				assert.notEqual( first, second )
				assert.notEqual(k2.options.hosts.indexOf( second, -1 ) )
			})
		});
	});

    describe('~apis', function( ){
        var k1;
        before(function( done ){
            k1 = new King({
                sync:true,
                apis:[{
                    name:'__test',
                    upstream_url:'http://localhost:9000',
                    request_path:'/test',
                    strip_request_path:true,
                    request_path:'/test'
                }]
                ,onSync: function(){
                    done();
                }
            });
        });

        after( function( done ){
            k1
                .destroy('apis','__test')
                .then( done.bind(null,null) )
                .catch( done );
        });

        it('should auto create an api', function( done ){
            k1.list('apis').then( function( ls ){
               assert.ok( ls.length, 'should have created an api' );
               assert.equal(1, ls.filter( function(i){return i.name === '__test'}).length, 'should have a __test api');
               done();
            }).catch( done );
        });

        it('should create defined plugins', function( done ){
            var k2 = new King({
                sync:true,
                apis:[{
                    name:'__test',
                    upstream_url:'http://localhost:9000',
                    request_path:'/test',
                    strip_request_path:true,
                    request_path:'/test',
                    plugins:{
                        'http-log':{
                            config:{
                                http_endpoint:'http://localhost:4343',
                                method:'POST'
                            }
                        }
                    }
                }]
                ,onSync: function(){
                    k2.list('plugins').then(function( pls ){
                        pls.forEach( function(plugin){
                            assert(plugin.name, 'http-log')
                        });
                        done();
                    })
                }
            });
        })

        it('should fail on bad api configuration', function( done ){
            var k = new King({
                apis:[{
                    name:'__test',
                    upstream_url:'localhost:9000',
                    request_path:'/test',
                    strip_request_path:true,
                    request_path:'/test'
                }]
            });
            k.sync()
                .then(() => {
                    //  This should never happen.
                    assert(false);
                })
                .catch((err) => {
                    assert(err);
                    assert(err.message);
                    assert(err.message.startsWith('Kong API failed for POST'));
                    assert(err.message.endsWith('with 400: {"upstream_url":"upstream_url is not a url"}'));
                    done();
                });
        })

        it('should fail on unknown plugin', function( done ){
            var k = new King({
                apis:[{
                    name:'__test',
                    upstream_url:'http://localhost:9000',
                    request_path:'/test',
                    strip_request_path:true,
                    request_path:'/test',
                    plugins:{
                        'bad-plugin':{
                            config:{
                                http_endpoint:'http://localhost:4343',
                                method:'POST'
                            }
                        }
                    }
                }]
            });
            k.sync()
                .then(() => {
                    //  This should never happen.
                    assert(false);
                })
                .catch((err) => {
                    assert(err);
                    assert(err.message);
                    assert(err.message.startsWith('Kong API failed for PUT'));
                    assert(err.message.endsWith('with 400: {"config":"Plugin \\"bad-plugin\\" not found"}'));
                    done();
                });
        })

        it('should fail on bad plugin config (1)', function( done ){
            var k = new King({
                apis:[{
                    name:'__test',
                    upstream_url:'http://localhost:9000',
                    request_path:'/test',
                    strip_request_path:true,
                    request_path:'/test',
                    plugins:{
                        'http-log':{
                            configs:{
                                http_endpoint:'http://localhost:4343',
                                method:'POST'
                            }
                        }
                    }
                }]
            });
            k.sync()
                .then(() => {
                    //  This should never happen.
                    assert(false);
                })
                .catch((err) => {
                    assert(err);
                    assert(err.message);
                    assert(err.message.startsWith('Kong API failed for PUT'));
                    assert(err.message.endsWith('/plugins with 400: {"configs":"configs is an unknown field"}'));
                    done();
                });
        })

        it('should fail on bad plugin config (2)', function( done ){
            var k = new King({
                apis:[{
                    name:'__test',
                    upstream_url:'http://localhost:9000',
                    request_path:'/test',
                    strip_request_path:true,
                    request_path:'/test',
                    plugins:{
                        'http-log':{
                            config:{
                                httpendpoint:'http://localhost:4343',
                                method:'POST'
                            }
                        }
                    }
                }]
            });
            k.sync()
                .then(() => {
                    //  This should never happen.
                    assert(false);
                })
                .catch((err) => {
                    assert(err);
                    assert(err.message);
                    assert(err.message.startsWith('Kong API failed for PUT'));
                    assert(err.message.endsWith('plugins with 400: {"config.httpendpoint":"httpendpoint is an unknown field"}'));
                    done();
                });
        })

        it('should auto update existing apis when instanciated', function( done ){
            var k2 = new King({
                sync:true,
                apis:[{
                    name:'__test',
                    upstream_url:'http://localhost:9000',
                    request_path:'/test',
                    strip_request_path:false,
                    request_path:'/test'
                }]
                ,onSync:function(){
                    setTimeout(function(){
                        k2.request('get','apis','__test')
                          .then( function( data ){
                                assert.strictEqual(data.body.strip_request_path, false);
                                done();
                          })
                          .catch( done )
                    },250);
                }
            });
        });
    });

    describe('#request', function(){
        var k3;
        before(function( done ){
            k3 = new King({
                host:['http://locahost:8001', 'http://localhost:8002']
            });
            done();
        });

        it('should not allow requests to unknown resource types', function(done){
            assert.throws(function(){
                k3.request('get', 'foobars');
            });
            done();
        });

        it('should allow known resource types',function( done ){
            co( function*(){
                yield k3.request('get','api');
                yield k3.request('get','apis');
                yield k3.request('get','consumer');
                yield k3.request('get','consumers');
                yield k3.request('get','plugin');
                yield k3.request('get','plugins');
            }).then( done.bind(null, null )).catch( done );
        })
    });
});
