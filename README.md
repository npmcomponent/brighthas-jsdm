
JSDM
====

Domain development , DDD-CRS framework for node.js and  browser's component/component  framework .

Node.js  Install 
==================
        
		npm install jsdm

Component  Install 
====================
        
		component install brighthas/jsdm
        

domain mean?
============

    domain is a black box , outside operate must use domain.exec function.
    
    domain inside include  Aggre, EventHandle, Service and CommandHandle.
    
    domain.exec ---> command handle ---> serivce / Aggre object (generate events) ---> event handle
    

step 1. define Aggre
=====================

```javascript    
    // User.js
    
    module.exports = {
    
        name:"User",
        
        init:function(data,callback){
        
            var err = null;
            
            var mydata = {
            
                name:data.name
                
            }
            
            callback(err,mydata);
            
        },
        
        proto:{
        
            updateName:function(args,my){
            
                var name = args.name;
                
                my.data("name",name);
                
                my.publish("updateName",{name:name});
                
            }                    
            
        }
        
    }
```    

step 2. define command handle   
==============================

```javascript
    
    // commandHandles.js
    
    module.exports = [{
    
        name: "create a user",
        
        handle: function(args, callback, my) {
        
            var User = my.getAgg("User");
            
            User.create({name: args.name},function(err,user){});
            
        }
        
    },
    
    {
    
        name: "update user name",
        
        handle: function(args, callback, my) {
        
            var User = my.getAgg("User");
            
            User.get(args.userId,function(user){
            
                user.updateName({name:args.name});
            
            })
            
        }
        
    }]

```
    
step 3.  database interface
============================

```javascript

    // jsdm core only need 'get' function, from database get obj data , the data is json.
    // testdb.js
    module.exports = {
    
        _dbs = {
        
           User:{
           
            'id001':{name:'brighthas'}
            
           } 
           
        },
        
        // typename is aggre type name, example 'User'.
        
        get:function(typename,id,callback){
            
            if(this._dbs[typename] && this._dbs[typename][id]){
            
                callback(null,this._dbs[typename][id]);
                
            }else{
            
                callback(null);
                
            }
            
        }
    }
```

step 4. create domain and run
=============================

```javascript

    var domain = require("jsdm")(),
        User = require("./User"),
        commandHandles = require("./commandHandles"),
        db = require("./testdb");
        
    domain.bindAgg(User)
          .bindCommandHandle(commandHandles[0])
          .bindCommandHandle(commandHandles[1])
          
        //.bindService(service)
        //.listen(eventName,handle)
        //.listenOnce(eventName,handle)
        //.seal()
        
          .on("User.*.updateName",function(event){
            
             console.log(event.data.name);
            
          });
          
    domain.exec("update user name",{userId:"id001",name:"leo"},function(){});
    
    // execute result is : leo

```


