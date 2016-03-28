    it('when an error occurs, the world still works well'
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        resolve();
      }).then(function() {
        throw new Error('An error here');
      });

      setTimeout(function() {
        console.log('even after the exception, this part of program still goes well');
        done();
      }, 500);
    });

    it('in `Promise`, to print the error and re-throw is important',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        resolve();
      }).then(function() {
        throw new Error('An error here');
      }).catch(function(err) {
        console.error(err);
        throw err;
      }).catch(function() { done() });
      // Ignore it.
      // The last line is just for the test.

      // To concate another Promise after the defined one:
      promise = promise.then(function() {
        done('this should never happen');
      });
    });

    it('let\'s see what will happen if the re-throwing is missing',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        resolve();
      }).then(function() {
        throw new Error('An error here');
      }).catch(function(err) {
        console.error(err);
        // throw err;
      });

      promise = promise.then(function() {
        done('this should never happen');
      });
    });