    it('raise fs.access as an example',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      fs.access('/tmp/non-exist-file.txt', fs.R_OK , function(err) {
        try {
          assert.isDefined(err);    // Assume it fails
          done();
        } catch(e) {
          done(e);
        }
      });
    });

    it('shows how to convert callback to promise',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        fs.access('/tmp/non-exist-file.txt', fs.R_OK, function(error) {
          if (error) { resolve(); }
          else       { reject();  }
        });
      }).then(function(err) {
        assert.isDefined(err);    // Assume it fails
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('shows how to convert callback to promise',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        fs.access('/tmp/non-exist-file.txt', fs.R_OK, resolve);
      }).then(function(err) {
        assert.isDefined(err);    // Assume it fails
        done();
      }).catch(function(err) {
        done(err);
      });
    });