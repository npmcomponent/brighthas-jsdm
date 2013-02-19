module.exports = Domain;
var  CommandBus = require("./CommandBus"), 
	   ServiceBus = require("./ServiceBus"),
	   EventBus = require("./EventBus"),
	   AggreProto = require("./AggreProto"),
       inherit;
 
 if(window){
    inherit = require("inherit");
 }else{
    inherit =  require("util").inherits;
 }
	    

function Domain(){
    
    if(!(this instanceof Domain)){
       return new Domain();
    }

	var AggreTypes  = this._AggreTypes = {};
	this._db = null;
    var my = {}
    
	var serviceBus = this._serviceBus = new ServiceBus(my);
    
	my.getAgg  = this._getAgg = function(name){
		var T = AggreTypes[name];
		return T;
	}
    
    my.service = this._service = function(serviceName,args){
		serviceBus.exec(serviceName,args);
	}
    
	this._eventBus = new EventBus(my);
	this._commandBus = new CommandBus(my);
	
}

Domain.prototype = {

	bindService:function(service){
		this._serviceBus.bind(service.name,service.service);
		return this;
	},
	
	bindAgg:function(Agg){
        if(this._isSeal){
            return this;
        }
        var self  =  this;
    
        var methods  =  Agg.proto;
    
		function T(data) {
            if(arguments.length > 1){ 
                throw new Error("argument must a json object. example  new Aggre({name:...  ,  age:...});"); 
            } else{
                data = {}
            }
			if (data.__in__) {
				delete data.__in__;
				AggreProto.call(this, data);
			} else {
				AggreProto.call(this, Agg.init(data));
			}
		}
		
		if(this._db){
			T._db = this._db;
		}
        
		T.get = AggreProto.get;
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
		
		this._AggreTypes[Agg.name] = T;
		return this;
        
	},
	bindCommandHandle:function(commandHandle){
        if(this._isSeal){
            return this;
        }
		this._commandBus.bind(commandHandle.name,commandHandle.commandHandle);
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
	once:function(){
		[].unshift.call(arguments,false)
		this._on.apply(this,arguments);
	},
	on:function(){
		[].unshift.call(arguments,true)
		this._on.apply(this,arguments);		
    },
	exec:function(commandName,args){
		this._commandBus.exec(commandName,args);
	}
    
}