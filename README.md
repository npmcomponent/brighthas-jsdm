
JSDM
====
Domain development , DDD-CRS framework for node.js and  browser's component/component  framework .

Node.js  Install 
===========
        
		npm install jsdm

Component  Install 
==============
        
		component install brighthas/jsdm
        
Example
======

```javascript

        var Domain = require("jsdm");
        var domain = new Domain();
        
        domain.bindAgg(AggreType)
            .bindCommandHandle(CommandHandle).
            .bindService(service)
            .listen(eventName,handle)
            .listenOnce(eventName,handle)
            .seal();

```


