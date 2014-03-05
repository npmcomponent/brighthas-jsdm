if (typeof window !== "undefined") {
    uuid = require("uuid");
} else {
    uuid = require("node-uuid").v1;
}

var Q = require("q");

function Repository(className) {

    if(!className) throw new Error("No class name");
    
    var cache = {},self = this;
    this.className = className;

    this.getData = function(id, callback) {
        var self = this;
        this.get(id, function(err, aggre) {
            if (aggre) {
                callback(self._aggre2data(aggre));
            } else {
                callback();
            }
        })
    }

    /* @public */
    this.get = function(id, callback) {
		
		var deferred = Q.defer();
		
        var self = this;
        if (cache[id]) {
			if(callback){
	            callback(undefined, cache[id])
			}else{
				deferred.resolve(cache[id]);
			}
        } else if (typeof cache[id] === 'boolean') {
			if(callback){
	            callback(null);
			}else{
		        deferred.resolve(null);
			}
        } else {
            self._get(this.className, id, function(err, data) {
                if (data) {
					var aggobj = cache[id] = self._data2aggre(data);
					
					if(callback){
						callback(undefined, aggobj);
					}else{
						deferred.resolve(aggobj);
					}
                } else {
					if(callback){
						callback(null);
					}else{
						deferred.resolve(null);
					}
                }
            })
        }
		
		return deferred.promise;
		
    }

    /* @public */
    this.create = function(data, callback) {
        var self = this;
		var deferred = Q.defer();
		
        this._create(data, function(err, aggobj) {
            if (err) {
				if(callback){
					callback(err);
				}else{
					deferred.reject(err);
				}
            } else {
                var data = self._aggre2data(aggobj);
                if (!data.id) {
                    data.id = uuid();
                }
                aggobj = self._data2aggre(data);
                cache[data.id] = aggobj;
				if(callback){
	                callback(undefined, aggobj);
				}else{
					deferred.resolve(aggobj);
				}
                self._publish(className + ".*.create", className, data);
                self._publish("*.*.create", className, data);
            };
        });
		
		return deferred.promise;
    }

    /* @public */
    this.remove = function(id) {
        cache[id] = false;
        this._publish(this.className + "." + id + ".remove", className, id);
        this._publish(this.className + ".*.remove", className, id);
        this._publish("*.*.remove", className, id);
    }

    // DOTO test step.
    this.clearTime = 1000 * 60 * 5;
    (function loopClear() {
        setTimeout(function() {
            cache = {}
            loopClear();
        }, self.clearTime);
    }());

}

module.exports = Repository;