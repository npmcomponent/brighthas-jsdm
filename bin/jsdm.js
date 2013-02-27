#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander'),fs = require("fs"),path = require("path"),obj2str = require('./obj2str'),uglify = require('uglify-js'),handles = [],config = {commandHandles:"commandHandles",aggres:[],services:"services",eventHandles:"eventHandles"},services=[],eventHandles={};

    
if(!fs.existsSync(path.join(process.cwd(),"domain.js"))){
    fs.writeFileSync(path.join(process.cwd(),"domain.js"),fs.readFileSync(path.join(__dirname,"domain.js")))
}

if(fs.existsSync(path.join(process.cwd(),"domain-conf.js"))){
    config = require(path.join(process.cwd(),"domain-conf.js"));
}

if(fs.existsSync(path.join(process.cwd(),"commandHandles.js"))){
    handles = require(path.join(process.cwd(),"commandHandles.js"));
}

if(fs.existsSync(path.join(process.cwd(),"services.js"))){
    services = require(path.join(process.cwd(),"services.js"));
}

if(fs.existsSync(path.join(process.cwd(),"eventHandles.js"))){
    eventHandles = require(path.join(process.cwd(),"eventHandles.js"));
}

var uglifyconf = {mangle :false,fromString: true,output:{beautify:true},compress:{
    sequences     : false,  // join consecutive statemets with the “comma operator”
    properties    : false,  // optimize property access: a["foo"] → a.foo
    dead_code     : false,  // discard unreachable code
    drop_debugger : false,  // discard “debugger” statements
    unsafe        : false,  // some unsafe optimizations (see below)
    conditionals  : false,  // optimize if-s and conditional expressions
    comparisons   : false,  // optimize comparisons
    evaluate      : false,  // evaluate constant expressions
    booleans      : false,  // optimize boolean expressions
    loops         : false,  // optimize loops
    unused        : false,  // drop unused variables/functions
    hoist_funs    : true,   // hoist function declarations
    hoist_vars    : true,   // hoist variable declarations
    if_return     : false,  // optimize if-s followed by return/continue
    join_vars     : false,  // join var declarations
    cascade       : false,  // try to cascade `right` into `left` in sequences
    side_effects  : false,  // drop side-effect-free statements
    warnings      : false
}}



program
  .version('0.0.1')
  .option('-c,--createCommandHandle <names>', 'create a command handle',range)
  .option('-a,--createAggreProto <names>', 'create a aggre proto',range)
  .option('-s,--createService <names>', 'create a service',range)
  .option('-e,--createEventHandle <names>','create a event handle',range)
  .option('ls,--ls','list domain components',range)
  .parse(process.argv);

function range(val) {
  return val.split(',');
}


function handlesHaveName(name){
    var bool = false;
    handles.forEach(function(handle){
        if(handle.name === name){
            bool = true;
            return;
        }
    });
    return bool;
}



function servicesHaveName(name){
    var bool = false;
    services.forEach(function(service){
        if(service.name === name){
            bool = true;
            return;
        }
    });
    return bool;
}



function aggresHaveName(name){
    var bool = false;
    config.aggres.forEach(function(aggreName){
        if(aggreName === name){
            bool = true;
            return;
        }
    });
    return bool;
}


function createAggreProto(name){

    if(aggresHaveName(name)){
        console.log("Already have the \""+name+"\" aggre proto.");
        return;
    }
    
    var aggreproto = {
        init:function(data){
            return data;
        },
        proto:{
            test:function(args,my){
            
            }
        }
    }
    
    aggreproto.name = name;
    return aggreproto;
    
}


function createCommandHandle(name){

    name = name.replace(/_/g," ");

    if(handlesHaveName(name)){
        console.log("Already have the \""+name+"\" command handle.");
        return;
    }
    
    var handle = {
        handle:function(args,my){          
          
        }
    }
    
    handle.name = name;
    handles.push(handle);
}


function createService(name){

    if(servicesHaveName(name)){
        console.log("Already have the \""+name+"\" service.");
        return;
    }
    
    var service = {
        service : function(args,my){
        
        }    
    }
    
    service.name = name;
    services.push(service);
}

if(program.createAggreProto){
    
    var names = program.createAggreProto;
    
    names.forEach(function(n){
        var ag = createAggreProto(n);
        if(ag){
    
        config.aggres.push(n);
        var ast = uglify.minify("module.exports="+obj2str(ag),uglifyconf);
        
        fs.writeFileSync(path.join(process.cwd(),ag.name+".js"),ast.code);
    }
    });
}

if(program.createCommandHandle){
    
    var names = program.createCommandHandle;
    
    names.forEach(function(n){
        createCommandHandle(n);
    })
    
    var ast = uglify.minify("module.exports="+obj2str(handles),uglifyconf);
    
    fs.writeFileSync(path.join(process.cwd(),"commandHandles.js"),ast.code);
}

if(program.createService){
    
    var names = program.createService;
        
    names.forEach(function(n){
        createService(n);
    })
    
    var ast = uglify.minify("module.exports="+obj2str(services),uglifyconf);
    
    fs.writeFileSync(path.join(process.cwd(),"services.js"),ast.code);
}

if(program.createEventHandle){
    
    var names = program.createEventHandle;
    
    names.forEach(function(n){
        eventHandles[n] = eventHandles[n]?eventHandles[n]:[];
        eventHandles[n].push(            
            function(event,my){

                
            }            
        );
        console.log(eventHandles)
    })
   
    var ast = "module.exports="+obj2str(eventHandles);
    
    fs.writeFileSync(path.join(process.cwd(),"eventHandles.js"),ast);
}

if(program.ls){
    console.log("> Aggre:\n ------------------- \n");
    console.log(config.aggres);
    
    console.log("\n\n > command handles : \n ------------------- \n");
    handles.forEach(function(h){
        console.log("- " + h.name+"\n");
    })
    console.log("\n\n > services: \n ------------------- \n");
    services.forEach(function(s){
        console.log("- " + s.name+"\n");
    })
    console.log("\n\n > event handles: \n ------------------- \n");
    for(var k in eventHandles){
        console.log("- " + k +"\n");
    }
}


var ast = uglify.minify("module.exports="+obj2str(config),uglifyconf);
fs.writeFileSync(path.join(process.cwd(),"domain-conf.js"),ast.code);