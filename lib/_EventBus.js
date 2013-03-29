
module.exports = EventBus;

var EventEmitter;

if(typeof window !== "undefined"){
EventEmitter = require("emitter");
}else{
EventEmitter = require("events").EventEmitter;
}


function EventBus(my){
	this._emitter =  new EventEmitter();
	this._my  =  my;
}

EventBus.prototype = {

	_on:function(isOn,e,handle){
		if(isOn){
			this._emitter.on(e,handle);
		}else{
			this._emitter.once(e,handle);
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
    
    off:function(eventname,handle){
        this._emitter.removeListener(eventname,handle);
    },
	
	publish : function(event){
		this._emitter.emit('*.*.newEvent',event,this._my);
        this._emitter.emit("*.*.*",event,this._my);
		if(!event.aggreType){
			this._emitter.emit('*.*.'+event.name,event,this._my);	
		}else{
			this._emitter.emit(event.aggreType+"."+event.aggreId+"."+event.name,event,this._my);	
			this._emitter.emit(event.aggreType+"."+event.name+".*",event,this._my);
			this._emitter.emit(event.aggreType+".*.*",event,this._my);
            this._emitter.emit(event.aggreType+".*."+event.name,event,this._my);
			this._emitter.emit("*.*."+event.name,event,this._my);
            this._emitter.emit("*."+event.aggreId+"."+event.name,event,this._my);            
		}
	}
}