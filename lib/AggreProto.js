module.exports  = AggreProto;
var uuid = {};
if(typeof window !== "undefined"){
    uuid.v1 = require("uuid");
}else{
    uuid = require("node-uuid");
}
var Event = require("./Event");

function AggreProto(){
	
}

AggreProto.get = function(id,callback){
	var self = this;

	if(this._cache[id]){
		callback(this._cache[id]);
	}else{
		this._db.get(self.typeName,id,function(err,data){
			if(data){
				var o = new self(); 
                o._data = data;
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
				this._publish("update",this.data(k));
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
        if(k){
            var v = this._data[k];
            if(typeof v  === "object"){
                
                return JSON.parse(JSON.stringify(v));	
            }else{
                return v;
            }
        }else{
            return JSON.parse(JSON.stringify(this._data));
        }
	}

}