
module.exports = Domain;

var  Repository = require("./Repository"),
     is = require("./_type"),
     Emitter = window?require("emitter"):require("events").EventEmitter;

function Domain(){

    var self = this,
        emitter = new Emitter,
        AggreClassList = [],
        repositoryList = [],
        commandHandleList = [],
        serviceList = [],
        db = null,
        isSeal = false,
        Aggres = {},
        repos = {},
        services = {},
        commandHandles = {},
        publish =  function(){
            emitter.emit.apply(emitter,arguments);
        }

    if(!(this instanceof Domain)){
       return new Domain();
    }
        
    function _push(cache,o){
        if(is(o) === "array"){
           o.forEach(function(obj){
              cache.push(obj);
           })
        }else{
              cache.push(o);
        }                
    }
    
    function _register(type,o){
        switch(type){
            case "DB":
                db = o;
            break;
            case "AggreClass":
                _push(AggreClassList,o);
            break;
            case "repository":
               _push(repositoryList,o)
            break;
            case "commandHandle":
               _push(commandHandleList,o);
            break;
            case "service":
               _push(serviceList,o);            
            break;
            case "listener":
                if(is(o) === "array"){
                   o.forEach(function(obj){
                      emitter.on(obj.NAME,obj(repos,services));
                   })
                }else{
                      emitter.on(o.NAME,o(repos,services));
                }
            break;
            case "listenerOne":
                if(is(o) === "array"){
                   o.forEach(function(obj){
                      emitter.once(obj.NAME,obj(repos,services));
                   })
                }else{
                      emitter.once(o.NAME,o(repos,services));
                }          
            break;
        }    
    }
    
    this.register = function(){
    
        if(isSeal) return this;
        
        var self = this;
        
        var go = true,type = null;
        
        while(go){
            var first = [].shift.call(arguments);
            if(is(first) === "string"){
                type = first;
                var second = [].shift.call(arguments);
                _register(first,second);
            }else if(!first){
                go = false;
            }else{
                _register(type,first);
            }
        }
        
        return this;
    }
    
    this.seal = function(){
    
        if(isSeal){
            return this;
        }else{
            isSeal = true;
        }
        AggreClassList.forEach(function(wrap){
            Aggres[wrap.NAME] = wrap(repos,services,publish);
        })
        
        serviceList.forEach(function(wrap){
            services[wrap.NAME] = wrap(repos,services);
        })
        
        repositoryList.forEach(function(wrap){
            var repository = new Repository(wrap.NAME,db,publish);
            wrap(repository,Aggres[wrap.NAME]);
            repos[wrap.NAME] = repository;
        })
        
        commandHandleList.forEach(function(wrap){
            commandHandles[wrap.NAME] = wrap(repos,services);
        })
        
        return this;
        
    }
    
    this.exec = function(){
        if(!isSeal) throw new Error("sorry! please domain.seal() ");
        var commandName = [].shift.call(arguments);
        var handle = commandHandles[commandName];
        handle.apply(null,arguments);
    }
    
    this.on = function(){
        emitter.on.apply(emitter,arguments);
    }
    
    this.once = function(){
        emitter.once.apply(emitter,arguments);
    }
    
}

module.exports = Domain;
