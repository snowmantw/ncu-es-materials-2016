    it('the function argument is with an asynchronous computation'
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        resolve();
      }).then(function() {
        throw new Error('An error occur');
      }).then(function() {
        console.log('it');
      }).then(function() {
        console.log('will');
      }).then(function() {
        console.log('never');
      }).then(function() {
        console.log('execute');
      }).then(function() {
        console.log('due to the error');
      }).catch(function(error) {
        console.log('in a chain with exception, only this catch will execute');
        done();
      });
    });

    // Quiz: what happen to the `then`(s) after the first `catch`?
    it('QUIZ. the function argument is with an asynchronous computation'
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        // Step 0.
        resolve();
      }).then(function() {
        // Step 1.
        throw new Error('An error occur');
      }).then(function() {
        // Skip
      }).catch(function(error) {
        // Step 2.
      }).then(function() {
        // How about this?
        throw new Error('Another error');
      }).then(function() {
        // And this?
      }).catch(function() {
        // And this?
        done();
      })
    });