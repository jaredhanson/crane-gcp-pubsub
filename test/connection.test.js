/* global describe, it */

var $require = require('proxyquire');
var expect = require('chai').expect;
var sinon = require('sinon');
var Connection = require('../lib/connection');
var EventEmitter = require('events').EventEmitter;


describe('Connection', function() {
  
  it('should export constructor', function() {
    expect(Connection).to.be.a('function');
  });
  
  
  describe('#publish', function() {
    
    describe('successfully publishing message', function() {
      var topicObj = {
        publisher: function() {}
      };
      var publisherObj = {
        publish: function() {}
      };
    
      function MockPubSub(options) {
        this.options = options;
      }
      MockPubSub.prototype.topic = function(topic) {
        if (topic !== 'my-topic') { throw new Error('Invalid topic: ' + topic) };
        return topicObj;
      }
    
    
      var Connection = $require('../lib/connection',
        { '@google-cloud/pubsub': MockPubSub });
      var connection = new Connection({ projectId: 'example' });
  
      before(function() {
        sinon.stub(publisherObj, 'publish').yields(null, 1234);
        sinon.stub(topicObj, 'publisher').returns(publisherObj);
      });
    
      after(function() {
        topicObj.publisher.restore();
        publisherObj.publish.restore();
      });
  
      before(function(done) {
        connection.connect(function() {
          connection.publish('my-topic', { body: 'Hello, world!' }, function(err) {
            done(err);
          })
        });
      })
      
      it('should construct client with correct options', function() {
        expect(connection._client.options).to.deep.equal({ projectId: 'example' });
      });
  
      it('should publish message', function() {
        expect(publisherObj.publish.callCount).to.equal(1);
        expect(publisherObj.publish.args[0][0]).to.deep.equal(Buffer.from('Hello, world!'));
      });
    }); // successfully publishing message
    
    describe('encountering an error publishing message', function() {
      var topicObj = {
        publisher: function() {}
      };
      var publisherObj = {
        publish: function() {}
      };
    
      function MockPubSub(options) {
        this.options = options;
      }
      MockPubSub.prototype.topic = function(topic) {
        if (topic !== 'my-topic') { throw new Error('Invalid topic: ' + topic) };
        return topicObj;
      }
    
    
      var Connection = $require('../lib/connection',
        { '@google-cloud/pubsub': MockPubSub });
      var connection = new Connection({ projectId: 'example' });
  
      before(function() {
        sinon.stub(publisherObj, 'publish').yields(new Error('something went wrong'));
        sinon.stub(topicObj, 'publisher').returns(publisherObj);
      });
    
      after(function() {
        topicObj.publisher.restore();
        publisherObj.publish.restore();
      });
  
      var error;
      before(function(done) {
        connection.connect(function() {
          connection.publish('my-topic', { body: 'Hello, world!' }, function(err) {
            error = err;
            done();
          })
        });
      })
      
      it('should construct client with correct options', function() {
        expect(connection._client.options).to.deep.equal({ projectId: 'example' });
      });
  
      it('should attempt to publish message', function() {
        expect(publisherObj.publish.callCount).to.equal(1);
        expect(publisherObj.publish.args[0][0]).to.deep.equal(Buffer.from('Hello, world!'));
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceof(Error);
        expect(error.message).to.equal('something went wrong');
      });
    }); // encountering an error publishing message
  
  }); // #publish
  
  describe('#consume', function() {
    
    describe('successfully consuming a subscription', function() {
      var subscriptionObj = new EventEmitter()
    
      function MockPubSub(options) {
        this.options = options;
      }
      MockPubSub.prototype.subscription = function(topic) {
        if (topic !== 'my-subscription') { throw new Error('Invalid subscription: ' + subscription) };
        return subscriptionObj;
      }
    
    
      var Connection = $require('../lib/connection',
        { '@google-cloud/pubsub': MockPubSub });
      var connection = new Connection({ projectId: 'example' });
  
      before(function(done) {
        connection.connect(function() {
          connection.consume('my-subscription', function(err) {
            done(err);
          })
        });
      })
      
      it('should construct client with correct options', function() {
        expect(connection._client.options).to.deep.equal({ projectId: 'example' });
      });
      
      describe('and receiving default message', function() {
        var msg;
        before(function(done) {
          connection.once('message', function(m) {
            msg = m;
            done();
          });
          
          subscriptionObj.emit('message', {
            id: '136969346945',
            attributes: {
              key: 'value'
            },
            data: Buffer.from('Hello Cloud Pub/Sub! Here is my message!')
          })
        })
        
        it('should emit message', function() {
          expect(msg.topic).to.equal('my-subscription');
          expect(msg.data).to.deep.equal(Buffer.from('Hello Cloud Pub/Sub! Here is my message!'));
        });
      }); // and receiving default message
      
    }); // successfully consuming a subscription
    
  }); // #consume
  
});
