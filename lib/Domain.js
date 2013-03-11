module.exports = Domain;
var  CommandBus = require("./CommandBus"), 
	   ServiceBus = require("./ServiceBus"),
	   EventBus = require("./EventBus"),
	   AggreProto = require("./AggreProto"),
       inherit;
       
if(typeof window !== "undefined"){
    uuid = require("uuid");
    var $ = require("jquery");
    Domain.Proxy = Proxy;
}else{
    uuid = require("node-uuid");
}
 
if(typeof window !== "undefined"){
    inherit = require("inherit");
 }else{
    inherit =  require("util").inherits;
}

function Domain(){

    var self = this;
    if(!(this instanceof Domain)){
       return new Domain();
    }
    
    this._serviceNames = [];
    this._commandHandleNames = [];
    this._aggreNames = [];
    
	var AggreTypes  = this._AggreTypes = {};
	this._db = null;
    var my = {};
    this._filters = [];
    
	var serviceBus = this._serviceBus = new ServiceBus(my);
    
	my.getAgg  = this._getAgg = function(name){
		var T = AggreTypes[name];
		return T;
	}
    
    my.service = this._service = function(serviceName,args){
		serviceBus.exec(serviceName,args);
	}
    
	this._eventBus = new EventBus(my);
	this._commandBus = new CommandBus(my,this._filters);
	
}

function Proxy(url){
    this._url = url;
}

Proxy.prototype = {
    exec:function(commandName,args,callback){
      $.post(this._url,{commandName:commandName,args:JSON.stringify(args)},callback)
    }
}

Domain.prototype = {

	bindService:function(service){
        this._serviceNames.push(service.name);
		this._serviceBus.bind(service.name,service.service);
		return this;
	},
    
    bindServices:function(services){
        var self = this;
        services.forEach(function(service){            
            self._serviceNames.push(service.name);
            self.bindService(service);
        });
        return this;
    },
	
    bindFilter:function(filter){
        this._filters.push(filter);
        return this;
    },
    
	bindAgg:function(Agg){
    
        if(this._isSeal){
            return this;
        }
        var self  =  this;
    
        var methods  =  Agg.proto;
    
		function T() {}
        
        T.init = Agg.init;
		
		if(this._db){
			T._db = this._db;
		}
        
		T.get = AggreProto.get;
        T.create = function(data,callback){            
            var that = this;
            var aggObj = new that();
            var my = {
                service:self._service
            };
            
            that.init(data,function(err,data){
            
                
                if(err){
                  callback(err);
                }else{                  
                  data.id = data.id ? data.id : uuid.v1();
                  aggObj._data = data;
                  that._cache[aggObj.id]  =  aggObj;   
                  aggObj._publish("create",data);
                  callback(undefined,aggObj);
                }
            },my);
                    
        };
		T._cache = {}
		T.typeName = Agg.name;
		
		inherit(T,AggreProto);
		T.prototype._AggreTypes = this._AggreTypes;
		T.prototype._serviceBus = this._serviceBus;
		T.prototype._eventBus = this._eventBus;
		
		for (var k in methods) {
            (function(key,m){    
			T.prototype[key] = function(){
                
                if(arguments.length > 1){ 
                    throw new Error("argument must a json object. example  agg.fun({name:...,age:...}) ;"); 
                }
                
                var that = this;
                
                var my = {
                    data:function(){
                        return that.__data.apply(that,arguments);
                    },
                    publish:function(e,d){
                        return that._publish.apply(that,arguments);
                    },
                    service:self._service,
                    getAgg:self._getAgg
                };

                var args = [];
                args.push(arguments[0]?arguments[0]:{});
                args.push(my); 
                return m.apply(this,args);      
                }
            })(k,methods[k]);
            
		}
		
        this._aggreNames.push(Agg.name);
		this._AggreTypes[Agg.name] = T;
		return this;
        
	},
	bindCommandHandle:function(commandHandle){
        if(this._isSeal){
            return this;
        }
        this._commandHandleNames.push(commandHandle.name);
		this._commandBus.bind(commandHandle.name,commandHandle.handle);
		return this;
	},
    bindCommandHandles:function(handles){
        var self =this;
        handles.forEach(function(handle){
            self.bindCommandHandle(handle);
        })
        return this;
    },
	listen:function(){
        if(this._isSeal){
            return this;
        }
		this._eventBus.on.apply(this._eventBus,arguments)
		return this;
	},
    listenOnce:function(){
        if(this._isSeal){
            return this;
        }
		this._eventBus.once.apply(this._eventBus,arguments)
		return this;
	},
	bindDB:function(db){
        if(this._isSeal){
            return this;
        }
		this._db = db;
		for(var k in this._AggreTypes){
			this._AggreTypes[k]._db = db;
		}
		return this;
	},
    
    seal:function(){
        this._isSeal = true;
    },
    
    _on:function(){
		var isOn = [].shift.apply(arguments);
		var cb = [].pop.apply(arguments);
		function cb_(){
         
			cb.apply(null,[arguments[0]]);
		}
		[].push.call(arguments,cb_);
		if(isOn){
			this._eventBus.on.apply(this._eventBus,arguments);
		}else{
			this._eventBus.once.apply(this._eventBus,arguments);
		}
	},
    
    off:function(eventname,handle){
        this._eventBus.off(eventname,handle);
    },
    
	once:function(){
		[].unshift.call(arguments,false)
		this._on.apply(this,arguments);
	},
	on:function(){
		[].unshift.call(arguments,true)
		this._on.apply(this,arguments);		
    },
	exec:function(commandName,args,callback){
		this._commandBus.exec(commandName,args,callback);
	},
    
    commandHandleNames:function(){
        if(this._isSeal){
            return this;
        }else{
            return this._commandHandleNames;
        }
    },
    
    serviceNames:function(){
        if(this._isSeal){
            return this;
        }else{
            return this._serviceNames;
        }
    },
    
    aggreNames:function(){
        if(this._isSeal){
            return this;
        }else{
            return this._aggreNames;
        }
    }
        
}

if(typeof window !== "undefined"){

    var jq = require("jquery");
    var Emit  = require("emitter");
    
    function _Proxy(url){
        
        this._emitter = new Emit;
        this._url = url;
        this._events = {};
        var self  =  this;
        
        function loop(){
            setTimeout(function(){
                var esk = Object.keys(self._events);
                if(esk.length === 0);
                else{
                    jq.post(self._url+"/on",{events:JSON.stringify(self._events)},function(rs){
               
                        for(var en in rs){
                            if(self._events[en]){
                                var t = Date.now();
                                self._events[en] = t;
                            }
                            self._emitter.emit(en,rs[en]);
                        }
                        loop();
                        
                    });
                }    
            },3000);
        }
        
        loop();
    }

    _Proxy.prototype = {
        on:function(eventname,callback){
            if(eventname in this._events){
            }else{
                this._events[eventname] = Date.now();
            }
            this._emitter.on(eventname,callback);
        },
        exec:function(commandName,args,callback){
        
          jq.post(this._url+"/exec",{commandName:commandName,args:JSON.stringify(args)},callback)
        },
        empty:function(){
            var self = this;
            this._events = {};
            var ks = Object.keys(this._events);
            ks.forEach(function(k){
                self._emitter.off(k);
            })
        },
        off:function(){
            this._emitter.off.apply(this._emitter,arguments);
        }
    }
    
    
    Domain.Proxy = _Proxy;
}

module.exports = Domain;
