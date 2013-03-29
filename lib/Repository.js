if(typeof window !== "undefined"){
    uuid = require("uuid");
}else{
    uuid = require("node-uuid").v1;
}

function Repository(NAME,db,publish){
    
    var cache = {};
    
    this.getData = function(id,callback){
        var self = this;
        this.get(id,function(err,aggre){
            if(aggre){
                callback(self._aggre2data(aggre));
            }else{
                callback();
            }
        })
    }
        
    /* @public */
    this.get = function(id,callback){
        var self = this;
        if(cache[id]){
            callback(undefined,cache[id])
        }else if(typeof cache[id] === 'boolean'){
            callback();
        }else{
            db.get(NAME,id,function(err,data){
                if(data){
                    var aggobj = self._data2aggre(data);
                    callback(undefined,aggobj);
                }else{
                    callback(err);
                }
            })
        }
    }
    
    /* @public */
    this.create = function(data,callback){
        var self = this;
        this._create(data,function(err,aggobj){
            if(err){
                callback(err);
            }else{
                var data = self._aggre2data(aggobj);
                data.id = uuid();
                aggobj = self._data2aggre(data);
                cache[data.id] = aggobj;
                callback(undefined,aggobj);
                publish(NAME+".*.create",data);
                publish("*.*.create",data);
            };
        });
    }
    
    /* @public */
    this.remove = function(id){
        cache[id] = false;
        publish(NAME+"."+id+".remove",NAME,id);
        publish(NAME+".*.remove",NAME,id);
        publish("*.*.remove",NAME,id);
    }
    
}

module.exports = Repository;