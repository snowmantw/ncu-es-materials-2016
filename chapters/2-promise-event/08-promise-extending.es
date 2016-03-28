    it('the correct way to extend a Promise',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        // Step 0.
        resolve();
      });
      promise = promise.then(function() {
        // Step 1.
        done();
      });
    });

    it('create a long promise without the chaining style',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        // Step 0.
        resolve(0);
      });
      promise = promise.then(function(number) {
        // Step 1.
        return number + 1;
      });
      promise = promise.then(function(number) {
        // Step 2.
        return number + 1;
      });
      promise = promise.then(function(number) {
        // Step 3.
        assert(number + 1, 3);
        done();
      });
      promise = promise.catch(function(error) {
        console.error(error);
        done(error);
      });
    });

    // Quiz: try to guess what will happen?
    it('QUIZ. the WRONG way to create a long promise without the chaining style',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        // Step 0.
        resolve(0);
      });
      promise = promise.catch(function(error) {
        console.error(error);
        done(error);
      });

      // This is incorrect.
      //
      promise.then(function(number) {
        // Step 1.
        return number + 1;
      });
      promise.then(function(number) {
        // Step 2.
        return number + 1;
      });
      promise.then(function(number) {
        // Step 3.
        assert(number + 1, 3);
        done();
      });
    });

    it('can concate new steps to the Promise in a loop',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        // Step 0.
        resolve(0);
      });
      for (var i = 0; i < 2; i++) {
        promise = promise.then(function(number) {
          return number + 1;
        });
      }
      promise = promise.then(function(number) {
        // Step 3.
        assert(number + 1, 4);
        done();
      }).catch(function(error) {
        console.error(error);
        done(error);
      });
    });