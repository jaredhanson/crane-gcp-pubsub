/**
 * Module dependencies.
 */
var Connection = require('./connection');


/**
 * Create connection with optional message listener.
 *
 * @param {Function} messageListener
 * @return {Broker}
 * @api public
 */
exports.createConnection = function(messageListener) {
  var connection = new Connection();
  if (messageListener) { connection.on('message', messageListener); }
  return connection;
}

/**
 * Export constructors.
 */
exports.Connection = Connection;
