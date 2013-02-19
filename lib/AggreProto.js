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