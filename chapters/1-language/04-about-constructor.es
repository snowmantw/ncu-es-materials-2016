    it('01. how to create a type and new it',
    function() {
      debugger;
      var Foo = function() {};
      var foo = new Foo();
    });

    it('02. add data and function members to the Foo',
    function() {
      debugger;
      var assert = require('chai').assert;
      var Foo = function() {
        this.name = 'foo name';
        this.callMyName = function() {
          console.log(this.name);
          return this.name;
        };
      };
      var foo = new Foo();
      assert.equal(foo.callMyName(), 'foo name');
    });

    this.name

    it('03. construct an instance by `call`',
    function() {
      debugger;
      var assert = require('chai').assert;
      var Foo = function() {
        this.name = 'foo name';
        this.callMyName = function() {
          console.log(this.name);
          return this.name;
        };
        return this;
      };
      // Don't use the keyword `new` to create an instance.
      var foo = Foo.call({});
      assert.equal(foo.callMyName(), 'foo name');
    });

    // Quiz: try to figure out what happens?
    it('04.QUIZ. from "call" to ordinary function call',
    function() {
      debugger;
      var Foo = function() {
        this.name = 'foo name';
        this.callMyName = function() {
          console.log(this.name);
          return this.name;
        };
        return this;
      };
      var foo = Foo();
      // TypeError: Cannot set property 'name' of undefined
    });

    it('05. note the difference of properties set in constructor and on the prototype',
    function() {
      debugger;
      var assert = require('chai').assert;
      var Cuboid = function(name) {
        this.name = name;
      };
      Cuboid.prototype.cuboidSize = [12, 8, 10];

      var cuboid1= new Cuboid('cuboid 1');
      var cuboid2 = new Cuboid('cuboid 2');

      cuboid1.name = 'cuboid one';
      assert.equal(cuboid1.name, 'cuboid one');
      assert.equal(cuboid2.name, 'cuboid 2');

      // It looks like to modify its own property only.
      cuboid1.cuboidSize[2] = 99;
      assert.equal(cuboid1.cuboidSize[2], 99);

      // But it will affect all the instances
      assert.equal(cuboid2.cuboidSize[2], 10);
      // WRONG.
    });