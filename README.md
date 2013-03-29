Note:
====
  please wait docs and apidoc.

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
    
    module.exports = wrap;
    
    function wrap(repos,services,publish){
        
            function User(name){
                this._name = name;
            }
            
            User.prototype = {
                getName:function(){
                   return this._name;
                },
                changeName:function(name){
                    this._name = name;
                    publish("user."+this.id+".changeName",name);
                    publish("user.*.changeName",this.id,name);
                }
            }
            
            return User;
        }
        
        wrap.NAME = "user";
        
```    

step 2. define user repository
==============================

```javascript

// user_repo.js
    moduel.exports = wrap
    
        // define aggre repository
        function wrap(repository,User){
        
            // repository is Repository instance , must implement _create/_data2aggre/_aggre2data
            repository._create = function(data,callback){
                var user = new User(data.name);
                callback(undefined,user);
            }
            
            repository._data2aggre = function(data){
                var user = new User(data.name);
                user.id = data.id;
                return user;
            }
            
            repository._aggre2data = function(aggre){
                var data = {
                    name:aggre.getName(),
                    id:aggre.id
                }
                return data;
            }
            
        }
        wrap.NAME = "user";  // and user aggre wrap same.
        
```
step 3. define command handle   
==============================

```javascript
    
    // handle.js
    
        // define command handle 1
        function wrap1(repos,services){
            function handle(args,callback){
                var repo = repos.user;
                repo.get(args.id,function(err,user){
                    user.changeName(args.name);
                    callback();
                })
            }
            return handle;
        }
        wrap1.NAME = "change user name";
        
        // define command handle 2
        function wrap2(repos,services){
            function handle(args,callback){
                var repo = repos.user;
                repo.create({name:args.name},callback)
            }
            return handle;
        }
        wrap2.NAME = "create a user";        
        module.exports = [wrap1,wrap2];

```
    
step 4.  register and run
==========================

```javascript
    
   var domain = require("jsdm")();
   var UserClass = require("./User"),
       user_repo = require("./user_repo"),
       handles = require("./handle");
       
   domain.register("AggreClass",UserClass)
         .register("repository",user_repo)
         .register("commandHandle",handles[0],handles[1])
         .seal();

   domain.exec("create a user",{name:"bright.has"},function(){
    console.log("lol")
   })
         
```


