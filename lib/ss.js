"use strict";

var Client = require('./client').Client,
    soap = require('soap');

function createFactory(url, options) {
    return new Promise(function(fulfill, reject) {
        soap.createClient(url, function(err, soapClient) {
            if (err) reject(err);
            else fulfill(new Client(soapClient));
        });
    });
};

exports.createFactory = createFactory;