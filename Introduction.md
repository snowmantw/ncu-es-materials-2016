# ECMAScript in Practice
@GregWeng
2016 NCU
---
## Goal

Help you to understand a **dynamic type-checking**, **single-threading**, **prototype-based** Object Orient
language with **first class function** support, which has been unfortunately bound with 1 or maybe 2 **awful
runtimes** and a messy **UI representation layer**.

---
## How to use this document

This document is written in [Literate JavaScript][literate-js], therefore you can execute the document to
get the specific result. The only dependency is `literate-programming`:

    npm install -g literate-programming

And then "compile" the document to an executable ECMAScript file:

    literate-programming <this file.md>

You will get the compiled ECMAScript file as `<this file.es>`. After that, just execute it as ordinary
ECMAScript files:

    node <this file.es>

[literate-js]: https://github.com/jostylr/literate-programming
---
## (Translation)

### Dynamic type-checking

Which means you can do this:

    describe('dynamic type-checking means it won\'t report any type issue before encountering that',
    function() {
      let foo = {};
      foo = 4;
      foo = foo + '2';
    });

Without any checking caused rejection before and during you run it.

### Single-threading

How to screw your Web site with one single ECMAScript line:

    describe('single-threading means this will freeze your whole program',
    function() {
      while(true) {};
    });

This may not matter because you can use C or any other language to freeze your process as well.
However, in other languages, you can always bypass this trick by owning lots of *threads* to keep the process alive.
In fact, some kinds of program heavily rely on this multi-threading with one infinite loop pattern, like in a [game-related framework][sdl-main-loop].

[sdl-main-loop]: https://interhacker.wordpress.com/2012/08/26/chapter-3-the-sdl-event-loop/

ECMAScript, in contrast, has never been a language with the ability to deal with multi-threading tasks.
If any infinite loop or recursion exists in the program, the process will freeze forever.
It will even block all the user events, since asynchronous tasks will be scheduled **after the synchronous tasks**.
You might hear of `WebWorker` before, but please note that it is **not** in [the specification of ECMAScript][es6-spec].
**To understand the difference between a language and its runtime is essential**.

[es6-spec]: http://www.ecma-international.org/ecma-262/6.0/

### Prototype-based

It is a recognized Object Orient paradigm to construct different and instantiable types via extending prototypes:

    describe('prototype-based language means it extends one prototype to create new types',
    function() {
      let Foo = function() {};
      Foo.prototype.bark = function() {
        console.log('A Foo barks');
      };

      let foo = new Foo();
      foo.bark();
      // -> A Foo barks

      let Bar = function() {};
      // Copy the object to Bar.prototype
      Bar.prototype = Object.create(Foo.prototype);
      Bar.prototype.bark = function() {
        Foo.prototype.bark.apply(this);
        console.log('A Bar barks');
      };

      let bar = new Bar();
      bar.bark()
      // -> A Foo barks
      // -> A Bar barks
    });

This is essential because even in ES6, the `class` feature is still a syntax sugar that makes not much differences
from the original prototype-based pattern.

The following list shows common mistakes usually occur when developers try to resemble similar patterns in other languages.

### Constructor

In ECMAScript, an instantiable object is an ordinary function:

    describe('how to create a type and new it',
    function() {
      let Foo = function() {};
      let foo = new Foo();
    });

The `Foo` function is actually a `Constructor` for `foo`. In constructor, you can easily add some data or function members:

    describe('add data and function members to the Foo',
    function() {
      let Foo = function() {
        this.name = 'foo name';
        this.callMyName = function() {
          return this.name;
        };
      };
      let foo = new Foo();
      assert.equal(foo.callMyName(), 'foo name');
    });

In this example, `this.name` means to append a property to the instance when it gets instantiated.
Don't get confused by the keyword. For now, the `this` is equal to **the instance**.

In fact, the `new` is a sugar for calling the constructor. Another de-sugared way to do that is:

    describe('construct an instance by `call`',
    function() {
      let Foo = function() {
        this.name = 'foo name';
        this.callMyName = function() {
          console.log(this.name);
        };
      };
      let foo = Foo.call({});
      assert.equal(foo.callMyName(), 'foo name');
    });

It looks like Python now. The only difference is we have no `self` parameter in the definition of constructor,
but give it when calling the function.

In fact, this reveals the secret of `this` in ECMAScript. Consider why this is not as we expect:

    // Quiz: try to figure out what happens?
    describe('from "call" to ordinary function call',
    function() {
      let Foo = function() {
        this.name = 'foo name';
        this.callMyName = function() {
          console.log(this.name);
        };
      };
      let foo = Foo();
      // TypeError: Cannot set property 'name' of undefined
    });

The `this` topic will be discussed in the following section. Back to the constructor, the example shows that
it will set properties in the instance with *individual copies* if we have multiple instances. In contrast,
properties on the `prototype` object **could be shared** among all the instances:

    describe('note the difference of properties set in constructor and on the prototype',
    function() {
      let Cuboid = function(name) {
        this.name = name;
      };
      Cuboid.prototype.cuboidSize = [12, 8, 10];

      let cuboid1= new Cuboid('cuboid 1');
      let cuboid2 = new Cuboid('cuboid 2');

      cuboid1.name = 'cuboid one';
      assert.equal(cuboid1.name, 'cuboid one');
      assert.equal(cuboid2.name, 'cuboid 2');

      // It looks like modify its own property only.
      cuboid1.cuboidSize[2] = 99;
      assert.equal(cuboid1.cuboidSize[2], 99);

      // But it will affect all the instances
      assert.equal(cuboid2.cuboidSize[2], 10);
      // WRONG.
    });

As a result, the simple rule is **initialize data members in constructor and function members on prototype.**

### Prototype

Usually, developers define methods on prototype because it can reduces the copies of them.

Every instance by `new` has exactly the same prototype, so for things like methods or constant properties,
engine can save lots of memory compare to defining them in the constructor. However, if the property is not
a simple value like string or number, modify it on one instance will **affect all other instances, too**.

    describe('one method shared by all instances',
    function() {
      let Cuboid = function(l, w, h) {
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

      let cuboid1 = new Cuboid(3, 9, 27);
      let cuboid2 = new Cuboid(2, 4, 8);
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

This is why in ECMAScript to create a new prototype explicitly before extending it is necessary:

    describe('extend the cuboid to get a cube',
    function() {
      let Cuboid = function(l, w, h) {
        this.size = [l, w, h];
      };

      Cuboid.prototype.volume = function() {
				return this.size.reduce(
				function(v, e) {
					return v * e;
				}, 1);
			};

      // Cube is a simplified Cuboid.
      let Cube = function(w) {
        this.w = w;
      };

      // This will creates a new object with the specified prototype object and properties.
      // Therefore we can guarantee that Cuboid and Cube will NOT refer to the same prototype.
      Cube.prototype = Object.create(Cuboid.prototype);
      Cube.prototype.volume = function() {
        return Math.pow(this.w, 3);
      };

			let cuboid = new Cuboid(2, 4, 8)
			let cube = new Cube(2);

			assert(cuboid.volume(), 64);
			assert(cube.volume(), 8);
    });

Readers should be able to address the issue in the following but incorrect example:

		// Quiz: why this is wrong while the previous one is correct?
    describe('extend the cuboid to get a cached cube, in a WRONG way',
    function() {
      let Cuboid = function(l, w, h) {
        this.size = [l, w, h];
      };

      Cuboid.prototype.volume = function() {
				return this.size.reduce(
				function(v, e) {
					return v * e;
				}, 1);
			};

      // Cube is a simplified Cuboid.
      let Cube = function(w) {
        this.width = width;
      };

      Cube.prototype = Cuboid.prototype;
      Cube.prototype.volume = function() {
        return Math.pow(this.width, 3);
      };

			let cuboid = new Cuboid(2, 4, 8)
			let cube = new Cube(2);

      // WRONG
			assert(cuboid.volume(), 64);
			assert(cube.volume(), 8);
    });

### Keyword `this` and function binding

It is the source of frustration to try use `this` as in other languages:

    describe('`this` is magic',
    function() {
      let Cube = function(w) {
        this.width = w;
      };
      Cube.prototype.volume = function() {
        return Math.pow(this.width, 3);
      };

      let cube = new Cube(2);
      // This is correct.
      assert.equal(cube.volume(), 8);

      // This is incorrect.
      let cubeVolume = cube.volume;
      assert.equal(cubeVolume(), 8);
    });

The problem is, in ECMAScript ordinary functions **are not bound with the instance by default.**
Therefore the actual instance represented by keyword `this` in the function definition is not bound to any specific instance.
For ECMAScript instances with methods using `this` inside, it can be inferred as:

* If the function call is come after an instance, it will be the instance
* If it is called by `apply` or `call`, it will be the instance specified in the argument list
* If there is no instance or the two functions, it will be `undefined`

Please note this is not a strict or formal description, but it is enough to do the actual work.
And it explains why the second line in the example above is wrong: the `cubeVolume` refer to the *unbound instance method* `cube.volume`,
and then invokes it without specify any valid instance as `this`. To solve this, we need to *bind it*:

    describe('`this` is magic, but not so magic now',
    function() {
      let Cube = function(w) {
        this.width = w;
      };
      Cube.prototype.volume = function() {
        return Math.pow(this.width, 3);
      };

      let cube = new Cube(2);
      // This is correct.
      assert.equal(cube.volume(), 8);

      // This is now correct, too.
      let cubeVolume = cube.volume.bind(cube);
      assert.equal(cubeVolume(), 8);
    });

The `bind` API will **generate a new function with bound instance.** As a result, it is a whole new function differs from the original one:

    describe('the `bind` will generate another bound version of the function',
    function() {
      let foo = function() {};
      let fooBound = foo.bind({});  // bind an empty object

			// This is correct
      assert.equal(foo.toString(), 'function () {}');

      // WRONG: it will be 'function () { [native code] }'
      assert.equal(fooBound.toString(), 'function () {}');
    });

Although this doesn't bother in most cases, to use `bind` with a function referred as [event listener][event-listener] will cause troubles
when developers need to remove it. Since API like `addEventListener` requires to get the reference of the function to remove it.
If it is a bound one, unless it has been stored before, there is no way to do that.

[event-listener]: https://developer.mozilla.org/en-US/docs/Web/API/EventListener

Since the `bind` API could generate a bound function, unlike `call` and `apply`, it requires no instance when use it:

    describe('compare `bind` to `call` and `apply',
    function(done) {
      let Cube = function(w) {
        this.width = w;
      };
      Cube.prototype.volume = function() {
        return Math.pow(this.width, 3);
      };
      let cube = new Cube(2);
      let cubeVolume = cube.volume;
      let cubeVolumeBound = cube.volume.bind(cube);

      // By `bind`, the callback needs nothing when it is called.
      setTimeout(cubeVolumeBound, 200);

      // By `call`, it needs a instance when invoke it.
			setTimeout(function() {
        assert.equal(cubeVolume.call(cube), 8);
        done();
      }, 500);
    });

However, `call` and `apply` is useful particularly when extending things:

    describe('Extend a base type but use its method',
    function() {
      let Clock = function() {};
      Clock.prototype.tick = function() {
        // Implement tick.
      };

      let Alarm = function() {};
      Alarm.prototype = Object.create(Clock.prototype);
      Alarm.prototype.tick = function() {
        // call the parent method.
        Clock.prototype.tick.call(this);
        // And then do the things we need in this instance.
      };
    });

As a result, albeit `call` and `apply` could be used as `bind`, they should be in the different occasions: when binding an instance is the only
requirement, use `bind`; otherwise, especially when extending a type, use `call` and `apply`.

---
## Structure

[dynamic-type-checking](# )

    _"Dynamic type-checking"

[single-threading](# )
    _"Single-threading"

[prototype-based](# )
    _"Prototype-based"

[Introduction-dynamic-type-checking.es](#Structure "save: dynamic-type-checking")
[Introduction-single-threading.es](#Structure "save: single-threading")
[Introduction-prototype-based.es](#Structure "save: prototype-based")

