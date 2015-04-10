"use strict";

var Client = require('./client').Client,
    soap = require('soap');

function createClient(url, options) {
    return new Promise(function(fulfill, reject) {
        soap.createClient(url, function(err, client) {
            if (err) reject(err);
            else fulfill(new Client(client));
        });
    });
};