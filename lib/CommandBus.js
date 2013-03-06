module.exports = CommandBus;

function CommandBus(my,filters){

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
                if(this.filters[this.num]){
                    this.filters[this.num](commandName,args,function(){
                        self.num += 1;self.run();
                    })
                }else{
                        self.ok();
                }
            },
            filters:filters,
            ok:function(){
                if(handles[commandName]){
                    handles[commandName](args,callback_,my);
                }
            }
        }
		exer.run();
	}
}
