
module.exports = Domain;

var  CommandBus = require("./_CommandBus"), 
	 ServiceBus = require("./_ServiceBus"),
	 Repository = require("./Repository"),
     Emitter = require("events").EventEmitter;
     

function Domain(){

    var self = this,
        emitter = new Emitter,
        AggreClassList = [],
        repositoryList = [],
        commandHandleList = [],
        serviceList = [],
        db = null,
        isSeal = false,
        filters = [],
        commandBus = new CommandBus(filters),
        Aggres = {},
        repos = {},
        services = {},
        publish =  function(){
            emitter.emit.apply(emitter,arguments);
        }

    if(!(this instanceof Domain)){
       return new Domain();
    }
    
	this.commandBus = new CommandBus();    
	this.serviceBus = new ServiceBus();	
    
    this.register = function(){
    
        if(isSeal) return this;
        
        var type = [].shift.call(arguments);
       
        switch(type){
            case "DB":
                db = arguments[0];
            break;
            case "AggreClass": 
              for(var i=0;i<arguments.length;i++){
                AggreClassList.push(arguments[i]);
              }
            break;
            case "repository":
              for(var i=0;i<arguments.length;i++){
                repositoryList.push(arguments[i]);
              }
            break;
            case "commandHandle":
              for(var i=0;i<arguments.length;i++){
                commandHandleList.push(arguments[i]);
              }
            break;
            case "service":
              for(var i=0;i<arguments.length;i++){
                serviceList.push(arguments[i]);
              }            
            break;
            case "filter":
              for(var i=0;i<arguments.length;i++){
                filters.push(arguments[i]);
              }  
            break;
            case "listener":
              for(var i=0;i<arguments.length;i++){
                var wrap = arguments[i];
                emitter.on(wrap.NAME,wrap(repos,services));
              }               
            break;
            case "listenerOne":
              for(var i=0;i<arguments.length;i++){
                var wrap = arguments[i];
                emitter.once(wrap.NAME,wrap(repos,services));
              }               
            break;
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
            commandBus.bind(wrap.NAME,wrap(repos,services));
        })
        
        return this;
        
    }
    
    this.exec = function(){
        if(!isSeal) throw new Error("sorry! please domain.seal() ");
        commandBus.exec.apply(commandBus,arguments);
    }
}

module.exports = Domain;
