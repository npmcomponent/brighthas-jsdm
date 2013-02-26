var domain = require("jsdm")();
var conf = require("./domain-conf");

var commandHandles = require(conf.commandHandles);
var services = require(conf.services);
var aggreNames = require(conf.aggres);
var eventHandles = require(conf)

aggreNames.forEach(function(name){
    domain.bindAgg(require(name));
});

domain.bindServices(services);
domain.bindCommandHandles(commandHandles);

for(var k in eventHandles){
    var handles = eventHandles[k];
    handles.forEach(function(handle){
        var args = k.split(".");
        args.push(handle);
        domain.listen.apply(domain.listen,args);
    })
}

module.exports = domain;