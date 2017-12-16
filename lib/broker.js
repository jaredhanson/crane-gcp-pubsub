/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter
  , PubSub = require('@google-cloud/pubsub')
  , util = require('util');


/**
 * `Broker` constructor.
 *
 * @api public
 */
function Broker() {
  EventEmitter.call(this);
}

/**
 * Inherit from `EventEmitter`.
 */
util.inherits(Broker, EventEmitter);

Broker.prototype.connect = function(options, readyListener) {

  // Instantiates a client
  this._connection = PubSub({
    projectId: options.projectId
  });
}

Broker.prototype.subscribe = function(topic, options, cb) {
  if (typeof options == 'function') {
    cb = options;
    options = undefined;
  }
  options = options || {};
  
  console.log('SUBSCRIBE TO TOPIC! - ' + topic);
 
  var subscription = this._connection.subscription(topic);
  
  subscription.on('message', function(msg) {
    console.log('GOT MESSAGE!');
    console.log(msg);
  });
}




/**
 * Expose `Broker`.
 */
module.exports = Broker;
