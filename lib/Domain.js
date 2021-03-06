module.exports = Domain;

// commented out by npm-component: var q = require("q");

var Repository = require("./Repository"),
    is = require("./_type");

if (typeof window !== 'undefined') {
    Emitter = require('component-emitter')
} else {
    Emitter = require("events").EventEmitter;
}

function Domain() {

    if (!(this instanceof Domain)) {
        return new Domain();
    }


    var self = this,
        emitter = new Emitter,
        AggreClassList = [],
        repositoryList = [],
        domains = {},
        commandHandleList = [],
        serviceList = [],
        get = null,
        isSeal = false,
        Aggres = {},
        repos = {},
        openMethods = [],
        services = {},
        commandHandles = {},
        callActions = {},
        execActions = {},
        publish = function () {

            emitter.emit.apply(emitter, arguments);

            var args = [].slice.apply(arguments);

            // emit event for parent domains.
            self._parents.forEach(function (parent) {
                var name = parent[0];
                var parentDomain = parent[1];
                var pargs = args.slice();
                pargs[0] = name + " " + pargs[0];
                parentDomain._publish.apply(parentDomain, pargs);
            });

        }

    this._parents = [];

    this._publish = publish;

    function _push(cache, o) {
        if (is(o) === "array") {
            o.forEach(function (obj) {
                cache.push(obj);
            })
        } else {
            cache.push(o);
        }
    }

    function _register(type, o) {
        switch (type) {
            case "domain":
                for (var k in o) {
                    var sub = domains[k] = o[k]._my;
                    var parent = [k, self];
                    o[k]._parents.push(parent);
                }
                break;
            case "get":
                get = o;
                break;
            case "AggreClass":
                _push(AggreClassList, o);
                break;
            case "repository":
                _push(repositoryList, o)
                break;
            case "commandHandle":
                _push(commandHandleList, o);
                break;
            case "service":
                _push(serviceList, o);
                break;
            case "listener":
                if (is(o) === "array") {
                    o.forEach(function (obj) {
                        var handles = obj({
                            q: q,
                            repos: repos,
                            services: services
                        }, domains);
                        if (is(handles) === "array") {
                            handles.forEach(function (handle) {
                                emitter.on(handle.eventName, handle);
                            })
                        } else {
                            emitter.on(handles.eventName, handles);
                        }
                    })
                } else {
                    var handles = o({
                        q: q,
                        repos: repos,
                        services: services
                    }, domains);
                    if (is(handles) === "array") {
                        handles.forEach(function (handle) {
                            emitter.on(handle.eventName, handle);
                        })
                    } else {
                        emitter.on(handles.eventName, handles);
                    }
                }
                break;
            case "listenerOne":
                if (is(o) === "array") {
                    o.forEach(function (obj) {
                        var handles = obj({
                            q: q,
                            repos: repos,
                            services: services
                        }, domains);
                        if (is(o) === "array") {
                            handle.forEach(function (handle) {
                                emitter.once(handle.eventName, handle);
                            })
                        } else {
                            emitter.once(handles.eventName, handles);
                        }
                    })
                } else {
                    var handles = o({
                        q: q,
                        repos: repos,
                        services: services
                    }, domains);
                    if (is(handles) === "array") {
                        handles.forEach(function (handle) {
                            emitter.once(handle.eventName, handle);
                        })
                    } else {
                        emitter.once(handles.eventName, handles);
                    }
                }
                break;
        }
    }

    this.register = function () {

        if (isSeal) return this;

        var self = this;

        var go = true,
            type = null;

        while (go) {
            var first = [].shift.call(arguments);
            if (is(first) === "string") {
                type = first;
                var second = [].shift.call(arguments);
                _register(first, second);
            } else if (!first) {
                go = false;
            } else {
                _register(type, first);
            }
        }

        return this;
    }

    this.seal = function () {

        if (isSeal) {
            return this;
        } else {
            isSeal = true;
        }
        AggreClassList.forEach(function (wrap) {
            var o = wrap({
                q: q,
                repos: repos,
                services: services,
                publish: publish
            }, domains);
            if (is(o) === "array") {
                o.forEach(function (a) {
                    Aggres[a.className] = a;
                })
            } else {
                Aggres[o.className] = o;
            }
        })

        serviceList.forEach(function (wrap) {
            var o = wrap({
                q: q,
                repos: repos,
                services: services
            }, domains);
            if (is(o) === "array") {
                o.forEach(function (a) {
                    services[a.serviceName] = a;
                })
            } else {
                services[o.serviceName] = o;
            }
        })

        repositoryList.forEach(function (wrap) {
            var o = wrap({
                q: q,
                repos: repos,
                Repository: Repository,
                Aggres: Aggres,
                services: services
            }, domains);
            if (is(o) === "array") {
                o.forEach(function (a) {
                    a._get = get;
                    a._publish = publish;
                    repos[a.className] = a;
                })
            } else {
                o._get = get;
                o._publish = publish;
                repos[o.className] = o;
            }
        })

        commandHandleList.forEach(function (wrap) {
            var o = wrap({
                q: q,
                repos: repos,
                services: services
            }, domains);
            if (is(o) === "array") {
                o.forEach(function (a) {
                    commandHandles[a.commandName] = a;
                })
            } else {
                commandHandles[o.commandName] = o;
            }
        })

        Object.seal(services);
        Object.seal(repos);
        Object.seal(Aggres);

        return this;
    }

    /*
     *@param commandName , command name.
     *@param args , command handle's arguments.
     *@param callback , command handle's callback.
     */
    this.exec = function (commandName, args, callback) {

        args = args || {};

        var defer;

        if (!callback) {
            defer = q.defer();
        }

        var handle = commandHandles[commandName];

        if (handle) {

            var actions = execActions[commandName];

            if (actions) {

                var num = actions.length;

                var i = -1;

                function next(data) {
                    i += 1;
                    if (i === num) {
                        handle(args, function(){});
                    } else {
                        actions[i](args, next, data)
                    }
                }

                next();

            } else {
                if(callback){
                    handle(args, callback);
                }else{
                    handle(args,function(err,rs){
                        if(err){
                            defer.reject(err);
                        }else{
                            defer.resolve(rs);
                        }
                    })
                }
            }

        } else {
            if(callback)
                callback(new Error("no command handle"));
            else
                defer.reject(new Error("no command handle"));
        }

        return defer.promise;
    }

    this.openMethod = function () {
        if (isSeal) return this;
        for (var i = 0; i < arguments.length; i++) {
            openMethods.push(arguments[i]);
        }
        return this;
    }

    /*
     * @api public
     * only call aggre object method, no result.
     * @param methodName , AggreName.methodName
     * @param id , aggre's ID.
     * @param args , method arguments array.
     * @param [callback] callback(err) mean, if there is an error.
     * @return , if params error , then return ParamError object (see strict-method).
     * @throw if params error.
     */
    this.call = function (methodName, id, args, callback) {

        args = args || [];

        var defer;

        if (!callback) {
            defer = q.defer();
        }

        if (openMethods.indexOf(methodName) !== -1) {
            var actions = callActions[methodName];

            if (actions) {

                var num = actions.length;
                var i = -1;

                function next(data) {
                    i += 1;
                    if (i === num) {
                        run(methodName, id, args, callback);
                    } else {
                        actions[i](id, args, next, data)
                    }
                }

                next();

            } else {
                run(methodName, id, args, callback);
            }

            function run(methodName, id, args, callback) {
                try {
                    var cm = methodName.split("."),
                        className = cm[0],
                        methodName = cm[1],
                        repo = repos[className];
                    repo.get(id, function (err, a) {
                        try {
                            var method = a[methodName];
                            var rs = method.apply(a, args);

                            if (callback) {
                                callback(null, rs);
                            } else {
                                defer.resolve(rs);
                            }

                        } catch (err) {
                            if (callback)
                                callback(err);
                            else
                                defer.reject(err);
                        }
                    });
                } catch (err) {
                    if (callback)
                        callback(err);
                    else
                        defer.reject(err);
                }
            }

        } else {
            if (callback)
                callback(new Error("no method"));
            else
                defer.reject(new Error("no method"));

        }

        return defer.promise;

    }

    this.on = function (event, listener) {
        emitter.on(event, listener);
    }

    this.once = function (event, listener) {
        emitter.once(event, listener);
    }

    this.removeListener = function (event, listener) {
        if (typeof window !== 'undefined') {
            emitter.off(event, listener);
        } else {
            emitter.removeListener(event, listener);
        }
    }

    this.services = services;
    this.repos = repos;

    this.addCallBefor = function (name, action) {
        if (callActions[name]) {
            callActions[name].push(action);
        } else {
            callActions[name] = [action];
        }
        return this;
    }

    this.addExecBefor = function (name, action) {
        if (execActions[name]) {
            execActions[name].push(action);
        } else {
            execActions[name] = [action];
        }
        return this;
    }

    this._my = {
        call: this.call,
        exec: this.exec,
        on: this.on,
        once: this.once,
        removeListener: this.removeListener,
        services: services,
        repos: repos,
        Aggres:Aggres
    };

}

module.exports = Domain;
