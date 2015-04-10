"use strict";

var util =   require('util'),
    events = require('events');

var Client = function(soap) {
    events.EventEmitter.call(this);
    this.soap = soap;
    
};
util.inherits(Client, events.EventEmitter);