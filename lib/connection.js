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
  
  // Instantiates a client
  this._client = new PubSub({
    projectId: options.projectId
  });
}

/**
 * Inherit from `EventEmitter`.
 */
util.inherits(Connection, EventEmitter);

Connection.prototype.connect = function(readyListener) {
  if (readyListener) { this.once('ready', readyListener); }
  
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

Connection.prototype.consume = function(queue, options, cb) {
  if (typeof options == 'function') {
    cb = options;
    options = undefined;
  }
  options = options || {};
  cb = cb || function(){};
  
  var self = this;
  var subscription = this._client.subscription(queue);
  subscription.get(function(err, subscription, metadata) {
    if (err) {
      return cb(err);
    }
    
    var topic = metadata.topic.split('/');
    topic = topic[topic.length - 1];
    
    subscription.on('message', function(m) {
      var msg = new Message(m, topic, queue);
      self.emit('message', msg);
    });
    
    subscription.on('error', function(err) {
      // TODO:
      console.log('ERROR');
      console.log(err);
    });
    
    return cb();
  });
}




/**
 * Expose `Connection`.
 */
module.exports = Connection;
