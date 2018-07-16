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

Broker.prototype.connect = function(readyListener) {
  if (readyListener) { this.once('ready', readyListener); }


  // Instantiates a client
  this._connection = new PubSub({
    projectId: this._projectId
  });
  
  var self = this;
  process.nextTick(function() {
    self.emit('ready');
  });
}

Broker.prototype.publish = function(topic, msg, cb) {
  // TODO: cache these objects?
  try {
  var topic = this._connection.topic(topic);
  var publisher = topic.publisher();
  
  console.log('?????');
  
  const dataBuffer = Buffer.from(msg.body);
  
    publisher.publish(dataBuffer).then(function(results) {
      console.log('PUBLISHED!');
      console.log(results);
    
      const messageId = results[0];

      console.log(`Message ${messageId} published.`);

      return messageId;
    
      return cb();
    
    }).catch(function(err) {
      console.log('XXXX');
    
      console.log(err);
    
      return cb(err);
    });
  } catch (ex) {
    console.log('XCEPT');
    console.log(ex);
  }
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
