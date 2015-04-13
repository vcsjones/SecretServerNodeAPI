"use strict";

function mapError(result, errorProperty) {
    errorProperty = errorProperty || 'Errors';
    if (!result) return [];
    if (result[errorProperty] === 'undefined') {
        return [];
    }
    if (result[errorProperty] instanceof Array) {
            return error;
    }
    if (result[errorProperty].string) {
        return [result[errorProperty].string];
    }
    return [];
};

var util =   require('util'),
    events = require('events');
    
/**
 * Creates a new client. Use {@link module:sswebserviceclient~createFactory} to create new 
 * Client instances.
 * @constructor
 * @param {SOAP} soap - A SOAP client.
 */
var Client = function(soap) {
    events.EventEmitter.call(this);
    this._soap = soap;
};
util.inherits(Client, events.EventEmitter);

/**
 * Authenticates to Secret Server with local or domain credentials.
 * @func
 * @param {string} username - The user name to authenticate with.
 * @param {string} password - The password for the user.
 * @param {string} [domain=(Local)] - The domain of the user.
 * @returns {Promise} A Promise for the authentication. On fulfillment, the Promise's
 * value is the token. On rejection, the value can be a string array of errors from the
 * server, or an Error object if the call failed.
 */
Client.prototype.authenticate = function(username, password, domain) {
    var args = {
        'username': username,
        'password': password,
        'organization': '',
        'domain': domain || '(Local)'
    }, self = this;
    return new Promise(function (fulfill, reject) {
        self._soap.Authenticate(args, function(err, result) {
            if (err) {
                reject(err);
                return;
            }
            var ssErr = mapError(result.AuthenticateResult);
            if (ssErr.length > 0) {
                reject(sErr);
            }
            else fulfill(result.AuthenticateResult.Token);
        });
    });
};

/**
 * Authenticates to Secret Server Online.
 * @func
 * @param {string} username - The user name to authenticate with.
 * @param {string} password - The password for the user.
 * @param {string} organizationCode - The organization code for the Organization that
 * the user belongs to.
 * @returns {Promise} A Promise for the authentication. On fulfillment, the Promise's
 * value is a string token. On rejection, the value can be a string array of errors from
 * the server, or an Error object if the call failed.
 */
Client.prototype.authenticateHosted = function(username, password, organizationCode) {
    var args = {
        'username': username,
        'password': password,
        'organization': organizationCode,
        'domain': ''
    }, self = this;
    return new Promise(function(fulfill, reject) {
        self._soap.Authenticate(args, function(err, result) {
            if (err) {
                reject(err);
                return;
            }
            var ssErr = mapError(result.AuthenticateResult);
            if (ssErr.length > 0) {
                reject(sErr);
            }
            else fulfill(result.AuthenticateResult.Token);
        });
    });
};

/**
 * Returns information about the user a token was created from.
 * @func
 * @param {string} token - The token of the user to obtain information for.
 * @returns {Promise} A promise for the user information. On fulfillment, the Promise's
 * value is an object with properties containing user information. On rejection, the value
 * can be a string array of errors from the server, or an Error object if the call failed.
 */
Client.prototype.whoAmI = function(token) {
    var args = {
        'token': token
    }, self = this;
    return new Promise(function(fulfill, reject) {
        self._soap.WhoAmI(args, function(err, result) {
           if (err) {
                reject(err);
                return;
            }
            var ssErr = mapError(result.WhoAmIResult);
            if (ssErr.length > 0) {
                reject(sErr);
            }
            else {
                delete result.WhoAmIResult.Errors;
                fulfill(result.WhoAmIResult);
            }
        });
    });
};

/**
 * Gets the version of Secret Server. No authentication token is required.
 * @func
 * @returns {Promise} A promise for the version. On fulfillment, the Promise's value is a
 * string with the Secret Server version. On rejection, the value can be a string array of
 * errors from the server, or an Error object if the call failed.
 */
Client.prototype.versionGet = function() {
    var self = this;
    return new Promise(function(fulfill, reject) {
        self._soap.VersionGet({}, function(err, result) {
            if (err) {
                reject(err);
                return;
            }
            var ssErr = mapError(result.VersionGetResult);
            if (ssErr.length > 0) {
                reject(sErr);
            }
            else fulfill(result.VersionGetResult.Version);
        });
    });
};

/**
 * Gets a secret.
 * @func
 @param {string} token - The authentication token.
 @param {integer} secretId - The ID of the secret to load.
 @param {boolean} [loadSettingsAndPermissions=false] - Load the settings and
 permissions associated with the secret.
 @returns {Promise} A promise for the secret. On fulfillment, the Promise's value is an
 object of the secret. On rejection, the value can be a string array of errors from the
 server, or an Error if the call failed.
 @todo Support Code Responses.
 */
Client.prototype.secretGet = function() {
    var args = {
        'token': arguments[0],
        'secretId': arguments[1],
        'loadSettingsAndPermissions': arguments.length < 3 ? false : arguments[2],
        'codeResponses': []
    }, self = this;
    return new Promise(function(fulfill, reject) {
        self._soap.GetSecret(args, function(err, result) {
            if (err) {
                reject(err);
                return;
            }
            var ssErr = mapError(result.GetSecretResult);
            if (ssErr.length > 0) {
                reject(sErr);
            }
            else fulfill(result.GetSecretResult.Secret);
        });
    });
};

/**
 * Searches for a secret.
 * @func
 * @param {string} token - The authentication token.
 * @param {string} searchTerm - The value to search for.
 * @param {boolean} [includedDeleted=false] - True to included deleted secrets in the
 * results.
 * @param {boolean} [includeRestricted=false] - True to include restricted items in the
 * results.
 * @returns {Promise} A Promise for the search results. On fulfillment, the Promise's
 * value is an array of summary objects. The field values of the secret can be obtained
 * using {@link Client#secretGet}. On rejection, the value can be a string array of errors
 * from the server, or an Error if the call failed.
 */
Client.prototype.searchSecrets = function() {
    var args = {
        'token': arguments[0],
        'searchTerm': arguments[1],
        'includeDeleted': arguments.length < 3 ? false : arguments[2],
        'includeRestricted': arguments.length < 4 ? false : arguments[3]
    }, self = this;
    return new Promise(function(fulfill, reject) {
        self._soap.SearchSecrets(args, function(err, result) {
            if (err) {
                reject(err);
                return;
            }
            var ssErr = mapError(result.SearchSecretsResult);
            if (ssErr.length > 0) {
                reject(sErr);
            }
            else fulfill(result.SearchSecretsResult.SecretSummaries.SecretSummary);
        });
    });
};

/**
 * Gets all templates.
 * @func
 * @param {string} token - The authentication token.
 * @returns {Promise} A promise for the templates. On fulfillment, the Promise's value is
 * an array of template objects. On rejection, the value can be a string array of errors
 * from the server, or an Error if the call failed.
 */ 
Client.prototype.getSecretTemplates = function(token) {
    var args = {
        'token': token
    }, self = this;
    return new Promise(function(fulfill, reject) {
        self._soap.GetSecretTemplates(args, function(err, result) {
            if (err) {
                reject(err);
                return;
            }
            var ssErr = mapError(result.GetSecretTemplatesResult);
            if (ssErr.length > 0) {
                reject(sErr);
            }
            else fulfill(result.GetSecretTemplatesResult.SecretTemplates.SecretTemplate);
        });
    });
};

/**
 * An alias for {@link Client#secretGet}.
 * @func
 * @see {@link Client#secretGet}
 */
Client.prototype.getSecret = Client.prototype.secretGet;

exports.Client = Client;