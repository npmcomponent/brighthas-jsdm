
module.exports = Domain;

var  Repository = require("./Repository"),
    is = require("./_type");


if(typeof window !== 'undefined'){
    Emitter = require("emitter")
}else{
    Emitter = require("events").EventEmitter;
}

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
        closeMethods = {},
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
                        var handles = obj(repos,services);
                        if(is(handles) === "array"){
                            handles.forEach(function(handle){
                                emitter.on(handle.eventName,handle);
                            })
                        }else{
                            emitter.on(handles.eventName,handles);
                        }
                    })
                }else{
                    var handles = o(repos,services);
                    if(is(handles) === "array"){
                        handles.forEach(function(handle){
                            emitter.on(handle.eventName,handle);
                        })
                    }else{
                        emitter.on(handles.eventName,handles);
                    }
                }
                break;
            case "listenerOne":
                if(is(o) === "array"){
                    o.forEach(function(obj){
                        var handles = obj(repos,services);
                        if(is(o) === "array"){
                            handle.forEach(function(handle){
                                emitter.once(handle.eventName,handle);
                            })
                        }else{
                            emitter.once(handles.eventName,handles);
                        }
                    })
                }else{
                    var handles = o(repos,services);
                    if(is(handles) === "array"){
                        handles.forEach(function(handle){
                            emitter.once(handle.eventName,handle);
                        })
                    }else{
                        emitter.once(handles.eventName,handles);
                    }
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
            var o = wrap(repos,services,publish);
            if(is(o) === "array"){
                o.forEach(function(a){
                    Aggres[a.className] = a;
                })
            }else{
                Aggres[o.className] = o;
            }
        })

        serviceList.forEach(function(wrap){
            var o = wrap(repos,services);
            if(is(o) === "array"){
                o.forEach(function(a){
                    services[a.serviceName] = a;
                })
            }else{
                services[o.serviceName] = o;
            }
        })

        Repository.prototype._db = db;
        Repository.prototype._publish = publish;

        repositoryList.forEach(function(wrap){
            var o = wrap(Repository,Aggres,services);
            if(is(o) === "array"){
                o.forEach(function(a){
                    repos[a.className] = a;
                })
            }else{
                repos[o.className] = o;
            }
        })

        commandHandleList.forEach(function(wrap){
            var o = wrap(repos,services);
            if(is(o) === "array"){
                o.forEach(function(a){
                    commandHandles[a.commandName] = a;
                })
            }else{
                commandHandles[o.commandName] = o;
            }
        })

        return this;

    }


    this.exec = function(commandName,args,callback){
        var handle = commandHandles[commandName];
        handle(args,callback);
    }

    this.closeMethod = function(){
        if(isSeal) return this;
        for(var i=0;i<arguments.length;i++){
            closeMethods[arguments[i]] = true;
        }
        return this;
    }

    this.call = function(methodName,id,args,callback){

        if(closeMethods[methodName]){
            callback(new Error("the method no publish."));
        }else{
            var cm = methodName.split("."),
                className = cm[0],methodName = cm[1],
                args = JSON.parse(JSON.stringify(args? args:[])),

                callback = callback?callback:function(){}


            var repo = repos[className];
            repo.get(id,function(err,a){

                if(a){
                    var method = a[methodName];
                    var rs;
                    try{
                        rs = method.apply(a,args);
                        callback(rs);
                    }catch(e){
                        callback(e);
                    }
                }else{
                    callback();
                }
            })
        }
    }

    this.on = function(){
        emitter.on.apply(emitter,arguments);
    }

    this.once = function(){
        emitter.once.apply(emitter,arguments);
    }

    this.removeListener = function(event,listener){
        if(typeof window !== 'undefined'){
            emitter.off(event,listener);
        }else{
            emitter.removeListener(event,listener);
        }
    }

}

module.exports = Domain;
