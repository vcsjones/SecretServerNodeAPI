/** @module sswebserviceclient */

"use strict";

var Client = require('./client').Client,
    soap = require('soap');

/**
  * A factory for creating clients.
  * @param {string} url - A URL to the WSDL of the web service endpoint.
  * @param {FACTORY_OPTIONS} options - Options for creating the client. Currently none are
  * defined.
  * @returns {Promise} A promise. The parameter of the promise on fulfillment is an
  * instance of the {@link Client}. On error, the parameter value is the error.
  */
function createFactory(url, options) {
    return new Promise(function(fulfill, reject) {
        soap.createClient(url, function(err, soapClient) {
            if (err) reject(err);
            else fulfill(new Client(soapClient));
        });
    });
};


exports.createFactory = createFactory;