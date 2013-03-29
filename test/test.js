var should = require("should");
var Domain = require("..");
var domain;
describe("Domain",function(){
    
    it("#new",function(){
        domain = new Domain();
    })
    
    it("#register",function(){
    
        // define aggre class
        function user_wrap(repos,services,publish){
        
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
        user_wrap.NAME = "user";
        
        // define aggre repository
        function user_repo_wrap(repository,User){
        
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
        user_repo_wrap.NAME = "user";
        
        // define command handle 1
        function ch_wrap1(repos,services){
            function handle(args,callback){
                var repo = repos.user;
                repo.get(args.id,function(err,user){
                    user.changeName(args.name);
                    callback();
                })
            }
            return handle;
        }
        ch_wrap1.NAME = "change user name";
        
        // define command handle 2
        function ch_wrap2(repos,services){
            function handle(args,callback){
                var repo = repos.user;
                repo.create({name:args.name},callback)
            }
            return handle;
        }
        ch_wrap2.NAME = "create a user";
        
        // define a listener
        function lis_wrap(repos,services){
            return function(data){
                repos.user.getData(data.id,function(d){
                   console.log( services.testservice(2,3,6) );
                });
            }
        }
        lis_wrap.NAME = "user.*.create";
        
        // define a service
        function ser_wrap(repos,services){
        
            return function(a,b,c){
               
                return a+b+c;
            }
            
        }
        ser_wrap.NAME = "testservice"
        
        domain.register("AggreClass",user_wrap)
              .register("repository",user_repo_wrap)
              .register("commandHandle",ch_wrap2,ch_wrap1)
              .register("listener",lis_wrap)
              .register("service",ser_wrap)
              .register("filter",function(cname,args,callback){
                  callback();
              })
              .seal();
        
    })
    it("#register",function(){
        domain.exec("create a user",{name:"leo"},function(err,user){
            console.log("good")
        })
    })
})