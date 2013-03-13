
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
========

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

domain mean?
============

    domain is a black box , outside operate must use domain.exec function.
    
    domain inside include  Aggre, EventHandle, Service and CommandHandle.
    
    domain.exec ---> command handle ---> serivce / Aggre object (generate events) ---> event handle
    
    
    
    
    











