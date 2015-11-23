var assert = require('assert');
var King = require('../lib')
describe('King', function(){
	describe('~hosts', function(){
		describe('#url', function(){
			var k1, k2
			before( function(){
				k1 = new King()
				k2 = new King({
					hosts:[
						'http://localhost:8001',
						'http://localhost:8002',
					]
				})
			})
			it('should accept a single url', function(){
				assert.equal(k1.url(), 'http://localhost:8001/')
				assert.equal(k1.url(), 'http://localhost:8001/')
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
				assert.notEqual( first, seond )
				assert.notEqual(k2.options.hosts.indexOf( second, -1 ) )
				
			})
		})
	});
});
