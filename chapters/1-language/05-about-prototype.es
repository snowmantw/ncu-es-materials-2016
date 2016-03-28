    it('01. one method shared by all instances',
    function() {
      debugger;
      var assert = require('chai').assert;
      var Cuboid = function(l, w, h) {
        this.size = [l, w, h];
        this.volume = function() {
          return this.size.reduce(
          function(v, e) {
            return v * e;
          }, 1);
        };
      };

      Cuboid.prototype.surfaceArea = function() {
        return (this.size[0] * this.size[1] * 2) +
               (this.size[0] * this.size[2] * 2) +
               (this.size[1] * this.size[2] * 2);
      };

      var cuboid1 = new Cuboid(3, 9, 27);
      var cuboid2 = new Cuboid(2, 4, 8);
      cuboid1.volume = function() {
        // Let's make a cache:
        return 729;
      };
      assert.equal(cuboid1.volume(), 729);
      assert.equal(cuboid2.volume(), 64);

      // Try to make a cache as well; but this will screw them both.
      cuboid1.surfaceArea = function() {
          return 702;
      };
      assert.equal(cuboid1.surfaceArea(), 702);
      // WRONG: the method on the prototype has been modified incorrectly.
      assert.equal(cuboid2.surfaceArea(), 112);
    });

    it('02. extend the cuboid to get a cube',
    function() {
      debugger;
      var assert = require('chai').assert;
      var Cuboid = function(l, w, h) {
        this.size = [l, w, h];
      };

      Cuboid.prototype.volume = function() {
        return this.size.reduce(
        function(v, e) {
          return v * e;
        }, 1);
      };

      // Cube is a simplified Cuboid.
      var Cube = function(width) {
        this.w = width;
      };

      // This will creates a new object with the specified prototype object and properties.
      // Therefore we can guarantee that Cuboid and Cube will NOT refer to the same prototype.
      Cube.prototype = Object.create(Cuboid.prototype);
      Cube.prototype.volume = function() {
        return Math.pow(this.w, 3);
      };

      var cuboid = new Cuboid(2, 4, 8)
      var cube = new Cube(2);

      assert.equal(cuboid.volume(), 64);
      assert.equal(cube.volume(), 8);
    });

    // Quiz: why this is incorrect while the previous one is correct?
    it('03.QUIZ. extend the cuboid to get a cached cube, in a WRONG way',
    function() {
      debugger;
      var assert = require('chai').assert;
      var Cuboid = function(l, w, h) {
        this.size = [l, w, h];
      };

      Cuboid.prototype.volume = function() {
        return this.size.reduce(
        function(v, e) {
          return v * e;
        }, 1);
      };

      // Cube is a simplified Cuboid.
      var Cube = function(width) {
        this.width = width;
      };

      Cube.prototype = Cuboid.prototype;
      Cube.prototype.volume = function() {
        assert.isNumber(this.width);
        return Math.pow(this.width, 3);
      };

      var cuboid = new Cuboid(2, 4, 8)
      var cube = new Cube(2);

      // WRONG
      assert.equal(cuboid.volume(), 64);
      assert.equal(cube.volume(), 8);
    });