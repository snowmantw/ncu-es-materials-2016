    it('a Promise returned by `then` must be resolved first before the next `then`'
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        resolve();
      }).then(function() {
        return new Promise(function(resolve, reject) {
          // Never resolve the inner Promise so the chain is blocked.
        });
      }).then(function() {
        // The test will never done.
        done();
      });
    });