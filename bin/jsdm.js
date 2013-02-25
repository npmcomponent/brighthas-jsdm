#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander'),fs = require("fs"),path = require("path"),obj2str = require('./obj2str');

program
  .version('0.0.1')
  .option('-cc', '--createCommandHandle [names]', 'create a command handle')
  .option('-ca', '--createAggreProto [names]', 'create a aggre proto')
  .option('-cs', '--createService [names]', 'create a command handle')
  .option('-ce', '--createEventHandle [names]','create a event handle')
  .parse(process.argv);

  
if(program.createCommandHandle){
    var name = program.createCommandHandle;
    if(fs.existsSync(path.join(process.cmd(),"commandHandles.js"))){
        
    }else{
        var f = [];
        var handle = {handle:function(){
            var args = arguments[0],my = arguments[1];
            
        }}
        handle["name"] = program.createCommandHandle;
        f.push(handle);
        fs.writeFileSync(path.join(process.cmd(),"commandHandles.js"),"moudle.exports="+obj2str(f));
    }
}