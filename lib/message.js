/**
 * `Message` constructor.
 *
 * @api protected
 */
function Message(msg, topic, queue) {
  this.topic = topic;
  this.queue = queue;
  this.data = msg.data;
  
  this.__msg = msg;
}

/**
 * Acknowledge message.
 *
 * Examples:
 *
 *     msg.ack();
 *
 * @api public
 */
Message.prototype.ack = function() {
  this.__msg.ack();
}

/**
 * Reject message.
 *
 * Examples:
 *
 *     msg.nack();
 *
 *     msg.nack(true);
 *
 * @api public
 */
Message.prototype.nack = function(requeue) {
  //this.__msg.reject(requeue);
}


/**
 * Expose `Message`.
 */
module.exports = Message;
