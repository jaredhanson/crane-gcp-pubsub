/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter
  , PubSub = require('@google-cloud/pubsub')
  , Message = require('./message')
  , util = require('util');


/**
 * `Broker` constructor.
 *
 * @api public
 */
function Broker(options) {
  EventEmitter.call(this);
  this._projectId = options.projectId;
}

/**
 * Inherit from `EventEmitter`.
 */
util.inherits(Broker, EventEmitter);

Broker.prototype.connect = function(options, readyListener) {

  // Instantiates a client
  this._connection = PubSub({
    projectId: this._projectId
  });
}

Broker.prototype.publish = function(topic, msg, cb) {
  // TODO: cache these objects?
  var topic = this._connection.topic(topic);
  var publisher = topic.publisher();
  
  const dataBuffer = Buffer.from(msg.body);
  publisher.publish(dataBuffer).then(function(results) {
    const messageId = results[0];

    console.log(`Message ${messageId} published.`);

    return messageId;
  }).catch(function(err) {
    console.log(err);
  });
}

Broker.prototype.subscribe = function(topic, options, cb) {
  if (typeof options == 'function') {
    cb = options;
    options = undefined;
  }
  options = options || {};
  
  var self = this;
  
  var subscription = this._connection.subscription(topic);
  
  subscription.on('message', function(m) {
    var msg = new Message(m, topic);
    msg.broker = self;
    
    self.emit('message', msg);
  });
}




/**
 * Expose `Broker`.
 */
module.exports = Broker;
