var should = require("should");
var Proto = require("../lib/AggreProto");
var SS = require("..");

describe("proto",function(){

    var agg;
    
    it("new",function(){
        var ss = SS();
        ss.bindAgg(
        {
        init:function(data){return data;},
        name:"M",
        proto:{
            changeName:function(args,my){
                my.publish("changename",{name:"leo"});
            }
        }}).
        bindCommandHandle({name:"comd",commandHandle:function(cmd,my){
            var M = my.getAgg("M");
            var m  =   new M();
            m.changeName();
            }
        }).
        bindService({name:"S1",service:function(args,my){
            console.log(args);
            }
        }).
        listen("changename",function(event,my){
            console.log(my);
        });
        
        ss.seal();
        
        ss.listenOnce("changename",function(event,my){
            console.log(my);
        });
        
        ss.exec("comd");
        ss.exec("comd");
        
    })

    

})