/* global describe, it */

var pkg = require('..');
var expect = require('chai').expect;


describe('crane-gcp-pubsub', function() {
  
  it('should export functions', function() {
    expect(pkg.createConnection).to.be.a('function');
  });
  
  it('should export constructors', function() {
    expect(pkg.Connection).to.be.a('function');
  });
  
});
