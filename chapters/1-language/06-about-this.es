    it('01. `this` is magic',
    function() {
      debugger;
      var assert = require('chai').assert;
      var Cube = function(width) {
        this.width = width;
      };
      Cube.prototype.volume = function() {
        return Math.pow(this.width, 3);
      };

      var cube = new Cube(2);
      // This is correct.
      assert.equal(cube.volume(), 8);

      // This is incorrect.
      var cubeVolume = cube.volume;
      assert.equal(cubeVolume(), 8);
    });

    it('02. `this` is magic, but not so magic now',
    function() {
      debugger;
      var assert = require('chai').assert;
      var Cube = function(width) {
        this.width = width;
      };
      Cube.prototype.volume = function() {
        return Math.pow(this.width, 3);
      };

      var cube = new Cube(2);
      // This is correct.
      assert.equal(cube.volume(), 8);

      // This is now correct, too.
      var cubeVolume = cube.volume.bind(cube);
      assert.equal(cubeVolume(), 8);
    });

    it('03. the `bind` will generate another bound version of the function',
    function() {
      debugger;
      var assert = require('chai').assert;
      var foo = function() {};
      var fooBound = foo.bind({});  // bind an empty object

      // This is correct
      assert.equal(foo.toString(), 'function () {}');

      // WRONG: it will be 'function () { [native code] }'
      assert.equal(fooBound.toString(), 'function () {}');
    });

    it('04. compare `bind` to `call` and `apply',
    function(done) {
      debugger;
      var assert = require('chai').assert;
      var Cube = function(width) {
        this.width = width;
      };
      Cube.prototype.volume = function() {
        return Math.pow(this.width, 3);
      };
      var cube = new Cube(2);
      var cubeVolume = cube.volume;
      var cubeVolumeBound = cube.volume.bind(cube);

      // By `bind`, the callback needs nothing when it is called.
      setTimeout(cubeVolumeBound, 200);

      // By `call`, it needs a instance when invoke it.
      setTimeout(function() {
        assert.equal(cubeVolume.call(cube), 8);
        done();
      }, 500);
    });

    it('05. Extend a base type but using its method',
    function() {
      debugger;
      var Clock = function() {};
      Clock.prototype.tick = function() {
        // Implement tick.
      };

      var Alarm = function() {};
      Alarm.prototype = Object.create(Clock.prototype);
      Alarm.prototype.tick = function() {
        // call the parent method.
        Clock.prototype.tick.call(this);
        // And then do the things we need in this instance.
      };
    });