

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("gjohnson-uuid/index.js", function(exports, require, module){

/**
 * Taken straight from jed's gist: https://gist.github.com/982883
 *
 * Returns a random v4 UUID of the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx,
 * where each x is replaced with a random hexadecimal digit from 0 to f, and
 * y is replaced with a random hexadecimal digit from 8 to b.
 */

module.exports = function uuid(a){
  return a           // if the placeholder was passed, return
    ? (              // a random number from 0 to 15
      a ^            // unless b is 8,
      Math.random()  // in which case
      * 16           // a random number from
      >> a/4         // 8 to 11
      ).toString(16) // in hexadecimal
    : (              // or otherwise a concatenated string:
      [1e7] +        // 10000000 +
      -1e3 +         // -1000 +
      -4e3 +         // -4000 +
      -8e3 +         // -80000000 +
      -1e11          // -100000000000,
      ).replace(     // replacing
        /[018]/g,    // zeroes, ones, and eights with
        uuid         // random hex digits
      )
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = callbacks.indexOf(fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-inherit/index.js", function(exports, require, module){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
});
require.register("jsdm/index.js", function(exports, require, module){
module.exports  =  require("./lib/Domain");
});
require.register("jsdm/lib/AggreProto.js", function(exports, require, module){
module.exports  = AggreProto;
var uuid = {};
if(window){
    uuid.v1 = require("uuid");
}else{
    uuid = require("node-uuid");
}
var Event = require("./Event");

function AggreProto(data){
	this._data = JSON.parse(JSON.stringify(data));
	this._data.id = this._data.id ? this._data.id : uuid.v1();
	this.constructor._cache[this.id]  =  this;
	this._publish("create",Object.create(this._data));
}

AggreProto.get = function(id,callback){
	var self = this;

	if(this._cache[id]){
		callback(this._cache[id]);
	}else if(typeof this._cache[id] === "boolean"){
		callback(null);
	}else{
		this._db.get(self.typeName,id,function(err,data){
			if(data){
				data.__in__ = true;
				var o = new self(data);
				self._cache[o.id] = o;
				callback(o);
			}else{
				callback(null);
			}
		});
	}
}

AggreProto.prototype = {

	_service : function(){
		this._serviceBus.exec.apply(this._serviceBus,arguments);
	},
	
	_getAgg : function(AggreTypeName){
		return this._AggreTypes[AggreTypeName];
	},

	_publish:function(eventName,data){
      
		var event = new Event(eventName,data);
		event._data.aggreType = this.constructor.typeName;
		event._data.aggreId  =  this.id;
		this._eventBus.publish(event);
	},	

	__data:function(k,v){
		if(arguments.length === 0){
				return this._data;	
		}else if(arguments.length === 1){
				return this._data[k];	
		}else if(arguments.length === 2 && k !== "id"){
				this._data[k] = v;
				this._publish("change",this.data(k));
		}
	},

	remove:function(){
		this.constructor._cache[this.id] = false;
		this._publish("remove",this.id);
	},
	
	get id(){
		return this._data.id;
	},

	data:function(k){
		var v = this._data[k];
		if(typeof v  === "string"){
			return v;
		}else{
			return Object.create(this._data);	
		}
	}

}
});
require.register("jsdm/lib/CommandBus.js", function(exports, require, module){
module.exports = CommandBus;

function CommandBus(my){
    
    this._my = my;

	var handles = {};

	this.bind = function(commandName,handle){
		handles[commandName] = handle;
	}

	this.exec = function(commandName,args){
		handles[commandName](args,this._my);
	}
}

});
require.register("jsdm/lib/Domain.js", function(exports, require, module){
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
});
require.register("jsdm/lib/Event.js", function(exports, require, module){
function Event(name,data){

	this._data = {
		name : name,
		data : data,
		aggreType : null,
		aggreId : null,
		time : new Date()
	}

}

var event = Event.prototype;

event.__defineGetter__('aggreType',function(){return this._data.aggreType;});
event.__defineGetter__('aggreId',function(){return this._data.aggreId;});
event.__defineGetter__('time',function(){return this._data.time;});
event.__defineGetter__('name',function(){return this._data.name;});
event.__defineGetter__('data',function(){return this._data.data;});

module.exports = Event;
});
require.register("jsdm/lib/EventBus.js", function(exports, require, module){

module.exports = EventBus;
var EventEmitter;

if(window){
EventEmitter = require("emitter");
}else{
EventEmitter = require("events").EventEmitter;
}


function EventBus(my){
	this._emitter =  new EventEmitter();
	this._my  =  my;
}

EventBus.prototype = {

	_on:function(aggreType,aggreId,eventName,handle){
        
		var isOn = [].shift.apply(arguments);
		if(arguments.length == 4){
			aggreType = aggreType + aggreId + eventName ;
		}else if(arguments.length == 3){
			aggreType = aggreType + aggreId;
			handle = eventName;
		}else{
			handle = aggreId;
		}
        
		if(isOn){
			this._emitter.on(aggreType,handle);
		}else{
			this._emitter.once(aggreType,handle);
		}
		
	},

	once:function(){
		[].unshift.call(arguments,false);
		this._on.apply(this,arguments);
	},
	
	on:function(){
		[].unshift.call(arguments,true);
		this._on.apply(this,arguments);
	},
	
	publish : function(event){
		this._emitter.emit('newEvent',event);
		if(!event.aggreType){
			this._emitter.emit(event.name,event,this._my);	
		}else{
			this._emitter.emit(event.aggreType+event.aggreId+event.name,event,this._my);	
			this._emitter.emit(event.aggreType+event.name,event,this._my);
			this._emitter.emit(event.aggreType,event,this._my);
			this._emitter.emit(event.name,event,this._my);
            
		}
	}
}
});
require.register("jsdm/lib/ServiceBus.js", function(exports, require, module){
module.exports = ServiceBus;

function ServiceBus(my){

    this._my = my;

	var services = {};
	
	this.bind = function(serviceName,service){
		services[serviceName] = service;	
	}

	this.exec = function(serviceName,args){
		services[serviceName](args,this._my);
   	}

}

});
require.alias("gjohnson-uuid/index.js", "jsdm/deps/uuid/index.js");

require.alias("component-emitter/index.js", "jsdm/deps/emitter/index.js");

require.alias("component-inherit/index.js", "jsdm/deps/inherit/index.js");

