    debugger;
    var fs = require('fs');

    // Define a Reader first:
    var Reader = function() {
      this.counter = 0;
      this.filePath = '/tmp/urandom-example.txt';
    };

    Reader.prototype.start = function() {
      // It is a convention to create a main Promise to
      // append all following steps on that.
      //
      this.mainPromise = this.createFile()
      .then((function() {
        this.urandomStream = fs.createReadStream('/dev/urandom');
        this.urandomStream.setEncoding('hex');
        this.urandomStream.on('data', this.onChunk.bind(this));
      }).bind(this))
      .catch(function(error) {
        console.error(error);
        throw error;  // re-throwing
      });

      // Returning it to keep the method could be tested.
      return this.mainPromise;
    };

    Reader.prototype.onChunk = function(chunk) {
      // For demo purpose, we only write 3 files to the target.
      if (this.counter && this.counter ===  3) {
        this.urandomStream.close();
        this.targetStream.close();
        return;
      }
      this.counter += 1;

      // Append new step to the mainPromise every event.
      // Rember to update the reference!
      this.mainPromise = this.mainPromise
      .then(this.writeContent(chunk).bind(this))
      .catch(function(error) {
        console.error(error);
        throw error;
      });
    };

    Reader.prototype.createFile = function() {
      // Sometimes, even if the method is actually an synchronous method,
      // in order to maintain the consistency, the method might return a Promise.
      // (and that's why `Promise.resolve` is useful.
      this.targetStream = fs.createWriteStream(this.filePath);
      return Promise.resolve();
    };

    Reader.prototype.writeContent = function(chunk) {
      return (function() {
        return new Promise((function(resolve, reject) {
          this.targetStream.write(chunk, 'utf8', resolve);
        }).bind(this));
      }).bind(this);
    };

    var reader = new Reader();
    reader.start();