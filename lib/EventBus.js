
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

	_on:function(aggreType,aggreId,eventName,handle){
        
		var isOn = [].shift.apply(arguments);
		if(arguments.length == 4){
			aggreType = (aggreType?aggreType:"*") + "." +(aggreId?aggreId:"*") + "." +(eventName?eventName:"*") ;
		}else if(arguments.length == 3){
			aggreType = (aggreType?aggreType:"*") + "." + (aggreId?aggreId:"*")+ "." +"*";
			handle = eventName;
		}else if(arguments.length == 2){
            aggreType = (aggreType?aggreType:"*") + ".*.*";
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
		this._emitter.emit('*.*.newEvent',event);
        this._emitter.emit("*.*.*",event,this._my);
		if(!event.aggreType){
			this._emitter.emit('*.*.'+event.name,event,this._my);	
		}else{
			this._emitter.emit(event.aggreType+"."+event.aggreId+"."+event.name,event,this._my);	
			this._emitter.emit(event.aggreType+"."+event.name+".*",event,this._my);
			this._emitter.emit(event.aggreType+".*.*",event,this._my);
			this._emitter.emit("*.*."+event.name,event,this._my);
            this._emitter.emit("*."+event.aggreId+"."+event.name,event,this._my);            
		}
	}
}