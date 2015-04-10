"use strict";

function normalizeError(error) {
    if (error instanceof Array) {
        return error;
    }
    if (error.string) {
        return [error.string];
    }
    return [];
};

var util =   require('util'),
    events = require('events');
    

var Client = function(soap) {
    events.EventEmitter.call(this);
    this._soap = soap;
};
util.inherits(Client, events.EventEmitter);

Client.prototype.authenticate = function(username, password, domain) {
    var args = {
        'username': username,
        'password': password,
        'organization': '',
        'domain': domain || '(Local)'
    }, self = this;
    return new Promise(function (fulfill, reject) {
        self._soap.Authenticate(args, function(err, result) {
            if (err) reject(err);
            else if (result.AuthenticateResult.Errors && result.AuthenticateResult.Errors.length > 0) {
                reject(result.Errorr);
            }
            else fulfill(result.AuthenticateResult.Token);
        });
    });
};

Client.prototype.authenticateHosted = function(username, password, organizationCode) {
    var args = {
        'username': username,
        'password': password,
        'organization': organizationCode,
        'domain': ''
    }, self = this;
    return new Promise(function(fulfill, reject) {
        self._soap.Authenticate(args, function(err, result) {
            if (err) reject(err, self);
            else if (result.AuthenticateResult.Errors && result.AuthenticateResult.Errors.length > 0) {
                reject(result.AuthenticateResult.Errors);
            }
            else fulfill(result.AuthenticateResult.Token);
        });
    });
};

Client.prototype.whoAmI = function(token) {
    var args = {
        'token': token
    }, self = this;
    return new Promise(function(fulfill, reject) {
        self._soap.WhoAmI(args, function(err, result) {
            if (err) reject(err);
            else {
                delete result.WhoAmIResult.Errors;
                fulfill(result.WhoAmIResult);
            }
        });
    });
};

Client.prototype.versionGet = function() {
    var self = this;
    return new Promise(function(fulfill, reject) {
        self._soap.VersionGet({}, function(err, result) {
            if (err) reject(err);
            else if(result.VersionGetResult.Errors && result.VersionGetResult.Errors.length > 0) {
                reject(result.VersionGetResult.Errors);
            }
            else fulfill(result.VersionGetResult.Version);
        });
    });
};

Client.prototype.secretGet = function() {
    var args = {
        'token': arguments[0],
        'secretId': arguments[1],
        'loadSettingsAndPermissions': arguments.length < 3 ? false : arguments[2],
        'codeResponses': []
    }, self = this;
    return new Promise(function(fulfill, reject) {
        self._soap.GetSecret(args, function(err, result) {
            if (err) reject(err);
            else if (result.GetSecretResult.Errors) {
                var err = normalizeError(result.GetSecretResult.Errors);
                if (err.length > 0) {
                    reject(err);
                }
                else fulfill(result.GetSecretResult.Secret);
            }
            else fulfill(result.GetSecretResult.Secret);
        });
    });
};

//Secret server is inconsistent where the verb goes. Set an alias so
//either way works.
Client.prototype.getSecret = Client.prototype.secretGet;

exports.Client = Client;