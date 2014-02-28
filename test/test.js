var should = require("should");
var Domain = require("..");
var domain;

domain = new Domain();

// define aggre class

function user_wrap(my) {

    function User(name) {
        this._name = name;
		this.id = "001";
    }

    User.prototype = {
        getName: function() {
            return this._name;
        },
        changeName: function(name) {
            this._name = name;
            my.publish("user." + this.id + ".changeName", this.id, name);
            my.publish("user.*.changeName", this.id, name);
        }
    }
    User.className = "User";
    return User;
}


function info_wrap(my) {

    function Info(body) {
        this._body = body;
    }

    Info.prototype = {
        getBody: function() {
            return this._body;
        },
        changeBody: function(body) {
			my.repos.User.get("001",function(err,user){
				console.log(",,,,,,",user);
			})
            this._body = body;
            my.publish("info." + this.id + ".changeBody", this.id, body);
            my.publish("info.*.changeName", this.id, body);
        }
    }
    Info.className = "Info";
    return Info;
}

// define aggre repository

function user_repo_wrap(my) {

    var User = my.Aggres.User;
    var repository = new my.Repository("User");

    repository._create = function(data, callback) {
        var user = new User(data.name);
        callback(undefined, user);
    }

    repository._data2aggre = function(data) {
        var user = new User(data.name);
        user.id = data.id;
        return user;
    }

    repository._aggre2data = function(aggre) {
        var data = {
            name: aggre.getName(),
            id: aggre.id
        }
        return data;
    }

    return repository;

}

// define aggre repository

function info_repo_wrap(my) {

    var Info = my.Aggres.Info;
    var repository = new my.Repository("Info");

    repository._create = function(data, callback) {
        var info = new Info(data.body);
        callback(undefined, info);
    }

    repository._data2aggre = function(data) {
        var info = new Info(data.body);
        info.id = data.id;
        return info;
    }

    repository._aggre2data = function(aggre) {
        var data = {
            body: aggre.getBody(),
            id: aggre.id
        }
        return data;
    }

    return repository;

}

// define command handle 1

function ch_wrap1(my) {
    function handle(args, callback) {
        var repo = my.repos.user;
        repo.get(args.id, function(err, user) {
            user.changeName(args.name);
            callback();
        })
    }
    handle.commandName = "change user name";
    return handle;
}

// define command handle 2

function ch_wrap2(my) {
    function handle(args, callback) {
        var repo = my.repos.User;
        repo.create(args, callback)
    }
    handle.commandName = "create a user";
    return handle;
}

// define command handle 3

function ch_wrap3(my) {
    function handle(args, callback) {
        var repo = my.repos.Info;
        repo.create(args, callback)
    }
    handle.commandName = "create a info";
    return handle;
}

// define a listener

function lis_wrap(my) {

    function handle(id, data) {
        my.repos.User.getData(data.id, function(d) {
          //  console.log(my.services.testservice(2, 3, 6));
        });
    }

    handle.eventName = "User.*.create";

    function handle2(id, data) {
       // console.log(data)
    }

    handle2.eventName = "user.*.changeName";

    return [handle, handle2];
}

// define a service

function ser_wrap(my) {

    function service(a, b, c) {

        return a + b + c;
    }

    service.serviceName = "testservice";

    return service;

}

domain.register(
    "AggreClass", info_wrap,
    "repository", info_repo_wrap,
    "commandHandle", [ch_wrap2, ch_wrap1,ch_wrap3],
    "listener", lis_wrap,
    "service", ser_wrap)
    .openMethod("User.changeName","Info.changeBody")
    .seal();


var domain2 = new Domain();
domain2.seal();

domain2.on("*.*.create",function(){
	//console.log("success !!")
})


Domain.share({
	d1:domain,
	d2:domain2
},[user_wrap],[user_repo_wrap]);




domain.exec("create a user", {
    name: "leo",
	id:"001"
}, function(err, data) {
	//console.log(data)
    domain.call("User.changeName", data.id, ["brighthas"], function() {
       // console.log(arguments)
    })
})

domain.exec("create a info", {
    body: "leo",
	id:"003"
}, function(err, data) {
	//console.log(arguments)
    domain.call("Info.changeBody", data.id, ["brighthas"], function() {
        console.log(arguments)
    })
})

