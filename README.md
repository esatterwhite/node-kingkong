# king
HTTP Client For Kong Api Gateway

King is a small library for managing `api`, `consumer` and `plugin` configuration of a KONG cluster.
The primary purpose is to keep API configuration in sync by either creating or updating records using the kong
admin api.

It is **not** intended to configure kong servers

A `king` instance can take multiple hosts and will round-robbin between them. Currently it will not remove hosts that fail to respond.

```javascript
require('util');
var King = require('king');

var k = new King({
    hosts:'http://localhost:8001, http://localhost:8002'
    ,sync:true // auto sync configuration
    ,apis:[{
          "upstream_url": "http://127.0.0.1:3000/api/v1",
          "request_path": "/fakeservice",
          "strip_request_path": true,
          "name": "integration",
          "plugins":{
            "http-log":{
              config:{
                  http_endpoint:'http://127.0.0.1:3005',
                  method:'POST'
              } 
            }
          }
    }]
    ,onSync: function(){
        console.log('synced');
    }
});
```

### List all APIs

You can fetch all apis currently registered using the `list` method

```javascript
var King = require('king')

var k = new King({
    hosts:['http://localhost:8001', 'http://localhost:8002']
});

k.list('apis').then( console.log)
```


### List all Plugins

You can fetch all Plugins currently registered using the `list` method

```javascript
var King = require('king')

var k = new King({
    hosts:['http://localhost:8001', 'http://localhost:8002']
});

k.list('plugins').then( console.log )
```

### List all Consumers

You can fetch all Consumers currently registered using the `list` method

```javascript
var King = require('king')

var k = new King({
    hosts:['http://localhost:8001', 'http://localhost:8002']
});

k.list('consumers').then( console.log )
```
