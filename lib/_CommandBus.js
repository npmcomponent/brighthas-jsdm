module.exports = CommandBus;

function CommandBus(filters){

	var handles = {};

	this.bind = function(commandName,handle){
		handles[commandName] = handle;
	}

	this.exec = function(commandName,args,callback){
        var callback = callback?callback:function(){};
        var callback_ = function(){
            callback(arguments[0]);
        }
        var exer = {
            num:0,
            run:function(){
                var self  =  this;
                if(filters[this.num]){
                    filters[this.num](commandName,args,function(err){
                        if(err){
                            callback_({error:err});
                        }else{
                            self.num += 1;self.run();
                        }
                    })
                }else{
                        self.ok();
                }
            },
            ok:function(){
                if(handles[commandName]){
                    handles[commandName](args,callback_);
                }
            }
        }
		exer.run();
	}
}
