/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter
  , PubSub = require('@google-cloud/pubsub')
  , Message = require('./message')
  , util = require('util');


/**
 * `Connection` constructor.
 *
 * @api public
 */
function Connection(options) {
  EventEmitter.call(this);
  this._projectId = options.projectId;
}

/**
 * Inherit from `EventEmitter`.
 */
util.inherits(Connection, EventEmitter);

Connection.prototype.connect = function(readyListener) {
  if (readyListener) { this.once('ready', readyListener); }


  // Instantiates a client
  this._client = new PubSub({
    projectId: this._projectId
  });
  
  var self = this;
  process.nextTick(function() {
    self.emit('ready');
  });
}

Connection.prototype.publish = function(topic, msg, cb) {
  // TODO: cache these objects?
  var topic = this._client.topic(topic);
  var publisher = topic.publisher();
  
  var data = Buffer.from(msg.body);
  publisher.publish(data, function(err, messageId) {
    if (err) { return cb(err); }
    return cb();
  });
}

Connection.prototype.subscribe = function(topic, options, cb) {
  if (typeof options == 'function') {
    cb = options;
    options = undefined;
  }
  options = options || {};
  
  var self = this;
  
  var subscription = this._client.subscription(topic);
  
  subscription.on('message', function(m) {
    var msg = new Message(m, topic);
    msg.broker = self;
    
    self.emit('message', msg);
  });
}




/**
 * Expose `Connection`.
 */
module.exports = Connection;
