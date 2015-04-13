Secret Server Node.js API
----

##What is it?

Secret Server offers a SOAP API to facilitate automation and invoking certain functionality. Using SOAP is rather
tedious from certain platforms and languages, node.js and JavaScript included. This package aims to abstract away
a lot of SOAP's and Secret Server's complex API.

It also leverages node.js 0.12's native Promise's allowing for an asynchronous model without getting into deep
levels of callbacks.

##How to install

Using npm:

    npm install sswebserviceclient
    
##Samples

###Authenticating

    var ss = require('sswebserviceclient');
    var uri = 'https://mysecretserver/webservices/sswebservice.asmx?wsdl';
    var username = 'foo', password = 'bar';
    var factory = ss.createFactory(uri, {});
    factory.then(function(client) {
        client.authenticate(username, password).then(function(token) {
            //use the 'token' to call other service methods.
        });
    });
    
###Loading a Secret

    factory.then(function(client) {
        client.authenticate(username, password).then(function(token) {
            return client.secretGet(token, 1, true);
        }).then(function(secret) {
            console.log(secret);
        });
    });
    
##Documentation

The npm module exports a single function, `createFactory`. This factory is used to obtain a client instance.
The factory returns a Promise, which is fulfilled when the client is ready and the WSDL has been parsed.

The `Client` can be reused multiple times, and does not maintain any state or cache. 

The JSDoc documentation contains information on the parameters and functions available.

The `Client` type makes a departure from how Secret Server's API expects you handle errors. Most of Secret Server's
SOAP APIs always return an HTTP 200, and if there is an error, a property on the object called `Errors` contains an
array of errors. This makes error checking tedious. The Secret Server node.js API hides this with Promises. Only if
the API actually succeeded is the Promise fulfilled. If the call fails, or Secret Server returns errors, then the 
Promise is rejected.

Example of authentication failure:

    var factory = ss.createFactory(uri, {});
    factory.then(function(client) {
        client.authenticate('username', 'badpassword').then(function(token) {
            console.log('SUCCESS!' + token);
        }, function(errors) {
            console.log('Something went wrong.' + errors);
        });
    });
    
Even though the API call was successful, the Promise is still rejected. In the case of Secret Server reporting
errors, the rejection handler is always the string array returned by the server. In the case of authentication,
the fulfillment callback contains a string of just the token, not an object where the token must be extracted from.

##Compatibility

This project's goal is to maintain compatibility with Secret Server 8.8.000000 and onward.