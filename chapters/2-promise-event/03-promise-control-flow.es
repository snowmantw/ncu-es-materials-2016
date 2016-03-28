    it('the function argument is with an asynchronous computation'
    function(done) {
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
        return 'foo'
      }).then(function(str) {
        assert.equal(str, 'foo');
        // Step 2.
        throw new Error('Error will be catched by the `catch`');
      }).then(function() {
        // Skip because of the exception
        done('this should never execute');
      }).catch(function(error) {
        // Step 3.
        console.log('So the flow will end here');
        done();
      });
    });