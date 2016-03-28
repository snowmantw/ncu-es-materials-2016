    it('resolving leads to the next `then`',
    function() {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        setTimeout(function() {
        // Step 0.
          resolve(42);
        }, 100)
      }).then(function(number) {
        // Step 1.
        assert.equal(number, 42);
        done();
      });
    });

    it('a never ending Promise (always pending)',
    function() {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        // Never resolve the Promise.
      }).then(function(number) {
        // Then the test will never end.
        done();
      });
    });

    it('a never ending Promise (always pending)',
    function() {
      debugger;
      var assert = require('chai').assert;

      // Declare it but not define it.
      var resolve;
      var promise = new Promise(function(r, j) {
        // Not reolve it here; but assign it to a closure variable:
        resolve = r;
      }).then(function(number) {
        // This will not execute until the `resolve` get resolved.
        done();
      });

      // Since the resolve is pulled, we can "deferred" the promise until something happens:
      // ... after 200 lines
      resolve();
    });