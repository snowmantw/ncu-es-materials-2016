    it('reject the Promise because of some errors',
    function() {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        reject('some error message');
      }).then(function() {
        done('this step should not execute');
      }).catch(function(error) {
        console.log('it will directly go to here');
        done();
      });
    });