    it('Promise strictly requires a function argument',
    function() {
      debugger;

      // This is incorrect.
      var promise = new Promise(42);
    });

    it('the function argument of Promise will execute immediately',
    function() {
      debugger;
      var assert = require('chai').assert;

      var logs = [];
      var promise = new Promise(function(resolve, reject) {
        logs.push('in the Promise constructor');
      });
      logs.push('after creating the Promise');

      assert(logs[0], 'in the Promise constructor');
      assert(logs[1], 'after creating the Promise');
    });

    it('the function argument is with an asynchronous computation',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var logs = [];
      var promise = new Promise(function(resolve, reject) {
        setTimeout(function() {
          logs.push('in the Promise constructor');
          done();
        }, 100)
      });
      logs.push('after creating the Promise');

      // Since the `setTimeout` will execute after all the synchronous statements,
      // this will be incorrect:
      assert(logs[0], 'in the Promise constructor');
      assert(logs[1], 'after creating the Promise');
    });