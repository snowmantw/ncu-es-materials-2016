# ECMAScript Introduction - the Language

@GregWeng

2016 NCU

---

## Chapter Goal

Help you to understand a **dynamic type-checking**, **single-threading**, **prototype-based** Object Orient
language with **first class function** support, which has been unfortunately bound with 1 or maybe 2 **awful
runtimes** and a messy **UI representation layer**.

Besides those language essences, the asynchronous flow control is another topic
need to be elaborated. Therefore, the **event dispatching**, **Promise** and other related features will have their
places. In the end, some advanced ECMAScript tips and new features are worth to have a look, so there is another chapter for that.

---

## (Translation)

---

### Dynamic type-checking

Which means you can do this:

```javascript
    it('dynamic type-checking means it won\'t report any type issue before encountering that',
    function() {
      debugger;
      var foo = {};
      foo = 4;
      foo = foo + '2';
    });
```

[01-dynamic-type-checking.es](# "save: ")


Without any checking caused rejection before and during you run it.

---

### Single-threading

How to screw your Web site with one single ECMAScript line:

```javascript
    it('single-threading means this will freeze your whole program',
    function() {
      debugger;
      while(true) {};
    });
```

[02-single-threading-blocking.es](# "save: ")

In other languages, you can always bypass this trick by owning lots of *threads* to keep the process alive.

In fact, some kinds of program heavily rely on this multi-threading with one infinite loop pattern, like in a [game-related framework][sdl-main-loop].

[sdl-main-loop]: https://interhacker.wordpress.com/2012/08/26/chapter-3-the-sdl-event-loop/

---

ECMAScript, in contrast, has never been a language with the ability to deal with multi-threading tasks.

If any infinite loop or recursion exists in the program, the process will freeze **forever**.

It will even block all the user events, since asynchronous tasks will be scheduled **after the synchronous tasks**.

Readers might hear of `WebWorker` before, but please note that it is **not** in [the specification of ECMAScript][es6-spec].
**To understand the difference between a language and its runtime is essential**.

[es6-spec]: http://www.ecma-international.org/ecma-262/6.0/

---

For the single-threading and asynchronous model, there is a diagram explains that well:

<img style="max-width: 500px" src="http://exploringjs.com/es6/images/async----event_loop.jpg" />

---

### Prototype-based

It is a recognized Object Orient paradigm to construct different and instantiable types via extending prototypes:

```javascript
    it('prototype-based language means it extends one prototype to create new types',
    function() {
      debugger;
      var Foo = function() {};
      Foo.prototype.bark = function() {
        console.log('    A Foo barks');
      };

      console.log('# foo.bark(): \n');
      var foo = new Foo();
      foo.bark();
      // -> A Foo barks

      console.log('----');

      var Bar = function() {};
      // Copy the object to Bar.prototype
      Bar.prototype = Object.create(Foo.prototype);
      Bar.prototype.bark = function() {
        Foo.prototype.bark.apply(this);
        console.log('    A Bar barks');
      };

      console.log('# bar.bark(): \n');
      var bar = new Bar();
      bar.bark()
      // -> A Foo barks
      // -> A Bar barks
    });
```

[03-prototype-based.es](# "save: ")

---

This is essential because even in ES6, the `class` feature is still a syntax sugar that makes not much differences
from the original prototype-based pattern.

The following list shows common mistakes usually occur when developers try to resemble similar patterns in other languages.

---

#### Constructor

In ECMAScript, an instantiable object is an ordinary function:

```javascript
    it('01. how to create a type and new it',
    function() {
      debugger;
      var Foo = function() {};
      var foo = new Foo();
    });
```

The `Foo` function is actually a `Constructor` for `foo`. In constructor, you can easily add some data or function members:

```javascript
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
```

---

In the example,

```javascript
    this.name
```

Means to append a property to the instance when it gets instantiated.

Don't get confused by the keyword. Currently, the `this` is equal to **the instance**.

---

In fact, the `new` is a sugar for calling the constructor. Another de-sugared way to do that is:

```javascript
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
```

It looks like Python now. The only difference is we have no `self` parameter in the definition of constructor,
but give it when calling the function.

---

In fact, this reveals the secret of `this` in ECMAScript. Consider why this is not what we expect:

```javascript
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
```

---

The `this` topic will be discussed in the following section.

Back to the constructor. The example shows that if programmer define some properties *inside the constructor*,
it will set properties in the instance with *individual copies* if we have multiple instances.

---

In contrast, properties on the `prototype` object **could be shared** among all the instances:

```javascript
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
```

[04-about-constructor.es](# "save: ")

As a result, the simple rule is **initialize data members in constructor and function members on prototype.**

---

#### Prototype

Usually, developers define methods on prototype because it can reduces the copies of them.

Every instance by `new` has exactly the **same prototype**, so for things like methods or constant properties,
engine can save lots of memory compare to defining them in the constructor.

---

However, if the property is not a simple value like string or number, modify it on one instance will **affect all other instances, too**.

```javascript
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
```

---

This is why in ECMAScript to create a new prototype explicitly before extending it is necessary:

```javascript
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
```

---

Readers should be able to address the issue in the following but incorrect example:

```javascript
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
```

[05-about-prototype.es](# "save: ")

---

#### Keyword `this` and function binding

It is the source of frustration to try use `this` as in other languages:

```javascript
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
```

The problem is, in ECMAScript ordinary functions **are not bound with the instance by default.**

---

Therefore the actual instance represented by keyword `this` in the function definition is not bound to any specific instance.

For ECMAScript instances with methods using `this` inside, it can be inferred as:

* If the function call is come after an instance, it will be the instance
* If it is called by `apply` or `call`, it will be the instance specified in the argument list
* If there is no instance or the two functions, it will be `undefined`

Please note this is not a strict or formal description, but it is enough to do the actual work.

---

And it explains why the second line in the example above is wrong: the `cubeVolume` refer to the *unbound instance method* `cube.volume`,
and then invokes it without specify any valid instance as `this`. To solve this, we need to *bind it*:

```javascript
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
```

---

The `bind` API will **generate a new function with bound instance.** As a result, it is a whole new function differs from the original one:

```javascript
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
```

Although this doesn't bother in most cases, to use `bind` with a function referred as [event listener][event-listener] will cause troubles
when developers need to remove it. Since API like `addEventListener` requires to get the reference of the function to remove it.

---

If it is a bound one, unless it has been stored before, there is no way to do that.

[event-listener]: https://developer.mozilla.org/en-US/docs/Web/API/EventListener

Since the `bind` API could generate a bound function, unlike `call` and `apply`, it requires no instance when use it:

```javascript
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
```

---

However, `call` and `apply` are useful particularly when extending things:

```javascript
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
```

[06-about-this.es](# "save: ")

---

In conclusion, even though `call` and `apply` could be used as `bind`, they should be in the different occasions: when binding an instance is the only
requirement, use `bind`; otherwise, especially when extending a type, use `call` and `apply`.

---

### First-class function and closure

In some other languages a function could not be an independent unit to be held and invoked.

For example, in C++, people use `Functor` to [resemble a function][functor-example]:

#### Example of Functor in C++

```cpp
  // this is a functor
  struct add_x {
    add_x(int x) : x(x) {}
    int operator()(int y) const { return x + y; }

  private:
    int x;
  };

  // Now you can use it like this:
  add_x add42(42); // create an instance of the functor class
  int i = add42(8); // and "call" it
  assert(i == 50); // and it added 42 to its argument
```

[functor-example]: http://stackoverflow.com/questions/356950/c-functors-and-their-uses

---

Compare to that, in ECMAScript a function can be defined and used without any other wrapped structure:

#### Example of function in ECMAScript

```javascript
    it('do the same thing with first-class function',
    function() {
      debugger;
      function add_x(x) {
        return function(y) {
          return x + y;
        };
      };

      // Now use it:
      var add42 = add_x(42);
      assert.equal(add42(8), 50);
    });
```

This example actually involves what a `closure` is and the reason to use it.

---

Image that there is a function with a variable never defined inside its body:

```javascript
    it('these kinds of variables are *free variables*',
    function() {
      debugger;
      var addX = function(b) {
        return x + b;
      };
      // An exception here:
      addX(42);
    });
```

The variable `x` is undeclared and undefined in the function `foo`, so it is a *free variable* to the function `foo`.

In ECMAScript, however, a function could capture undefined variables from its *parent context* to be a **closure**.

---

For example, this correct the example and trigger no exception:

```javascript
    it('a simple way to capture the variable',
    function() {
      debugger;
      var x = 1;
      var addX = function(b) {
        return x + b;
      };
      addX(42);
    });
```

[07-function-and-closure.es](# "save: ")

Note that the variable `x` is not defined in the context of `foo`, but obviously `foo` can *capture and use it*.

---

Usually developers expect to have all states in an object, and its methods will access these states by `this`.

However, in some cases, the need to meet is generating another function after giving some constrains,
or just to have a fully defined object is too redundant, then using `closure` to capture *free variables* outside the target function
is a good solution.

It is also noticeable that the convenience (['lexical scope'][lexical-scope])in the example sometimes makes it much simple than other similar features in other languages.

For example, in C++11, a `lambda` could [capture variables for the parent context as well][cpp-closure-example]:

#### Example of closure and lambda in C++

```cpp
    // captures_lambda_expression.cpp
    // compile with: /W4 /EHsc 
    #include <iostream>
    using namespace std;

    int main()
    {
       int m = 0;
       int n = 0;
       [&, n] (int a) mutable { m = ++n + a; }(4);
       cout << m << endl << n << endl;
    }
```

---

In the C++ case, the lambda here:

```cpp
    [&, n] (int a) mutable { m = ++n + a; }(4);
```

[lexical-scope]: https://en.wikipedia.org/wiki/Scope_(computer_science)#Lexical_scope_vs._dynamic_scope
[cpp-closure-example]: https://msdn.microsoft.com/zh-tw/library/dd293608.aspx

Indicates that it will automatically capture the address of variable `m` (by the default capturing symbol `&`), and explicitly capture the value of `n`.

---

Compare to ECMAScript, the syntax is more strict and verbose, albeit it might be necessary for a complicated language like C++.

Nevertheless, please note that the convenience of creating a closure is also the root of evil to a ECMAScript programmer.

As a result, if it is a unfamiliar feature to you or your co-workers, including the concept and usage of this technique, please use it only when it is necessary.
There are too many miserable code come with muddy closures that makes it cannot be tested and extended.

For example, there is a 1.3K LOCs *Window Manager* written in a huge closure with numerous nested closures:

https://github.com/mozilla-b2g/gaia/blob/v1.3/apps/system/js/window_manager.js

**Bonus Quiz: could you list what's the problems in this example? **

*(hint: consider that a unit test wants to test different behaviors with various configs, how to achieve that?)*

---

### ECMAScript runtimes and test environments

Although most of readers might be familiar with the most famous runtime: web browser (strictly, its engine), in fact,
the language could appear much differently on various runtimes. For example, Node.js provides module system like:

```javascript
    it('to require a module in Node.js',
    function() {
      var os = require('os');
      // It will print out the OS architecture like 'darwin' for MacOSX.
      console.log(os.arch());
    });
```

This code never runs correctly in an browser, unless 3rd-party module systems to be installed.

APIs and functions like these are not parts of the language, and to distinguish the difference is essential.

---

For the browser side (so-called "front-end"), the most crucial inconvenience is the absence of module system.
Therefore any attempt to make code isolated or the dependencies clear is doomed to rely on lots of nasty tricks.
Compare to that, in Node.js, there is no DOM support, which means developers cannot construct and manipulate programmer's UI elements easily:

```javascript
    it('in Node.js there is no DOM APIs',
    function() {
      var userTweets = document.querySelectorAll('body #list-tweets.tweet');
      for (var i = 0; i < userTweets.length; i++) {
        (function() {
          userTweets[i].addEventListener('click', onTweetsClicked(userTweets[i].id));
        })();
      }
    });
```

[08-runtimes.es](# "save: ")

---

It is a common mistake that developers try to test DOM relevant functions in Node.js but encounter undefined APIs like the example shows.

However, because to launch test and report logs in the console is much simpler in browser, the current mainstream is divided to two methods:

1. Write tests in framework style; mock DOM APIs use Node.js library
2. Write tests in framework style; launch browser in the background and then host a server to serve all test files in the browser

The first method is a simple solution, but when the mocking library cannot cover all DOM features, developers would encounter troubles.

The second method could fully support DOM features, but it is complicated to set up.
To maintain a server for serving tests also introduce more unnecessary dependencies and coupling to simple tests.

---

Although in practical programs the usage of language will inevitably molded by different runtimes,
to understand what are basic features supported by the language itself could help readers to avoid generating confused code with nonexistent APIs.
And the examples from DOM and module system demo that distinctly.

---

Besides that, there are various ECMAScript runtimes all with different APIs and conventions:

1. Java 8 Nashorn (see [the tutorial][nashorn-tutorial])
2. Gecko JSAPI (using [xpconnect] to provide APIs and module system)
3. Rhino ([an old runtime; embedded in J2SE6 as the default ECMAScript engine][rhino])

Note that sometimes the language would be modified, so it cannot be strictly called as "ECMAScript", especially when the runtime was born before the language got standardized.
Therefore, such list is just an example to show a language could have multiple runtimes, and it is important to know the difference if readers unfortunately need to work on that.

[nashorn-tutorial]: http://winterbe.com/posts/2014/04/05/java8-nashorn-tutorial/
[xpconnect]: https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Language_bindings/XPConnect
[rhino]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino

---

### UI representation layer

Now the topic is the most messy but unfortunately valuable part to most ECMAScript developers.
In the browser, ECMAScript could access DOM, or [Document Object Model][dom], via various APIs.
With that, developers could control UI from layering to animation without actually manipulate details down to pixels:

https://codepen.io/rachelnabors/pen/rxpmJL/?editors=0010

It is pure ECMAScript, focusing on manipulating the element's CSS properties frame by frame.

---

Another more common case is to make DOM element could react according to users' inputs, like touch or drag & drop:

https://jsbin.com/hiqasek/edit?html,js,output

However, DOM is full of legacy and has been blamed on that so long: it suffers from outdated design and engine implementation.
It is also notorious because most of advanced features aren't really cross-browser.

---

The situation is so fragile that people need such a compatibility table to see if they can use certain features in their projects:

http://caniuse.com/

As a result, generally developers would like to use libraries in front-end projects to build a more smooth abstraction to control DOM.

---

Famous libraries like [jQuery][jquery] could improve the expressiveness and avoid those ugly and verbose APIs, although this is not free at all.

Every DOM manipulation comes with some performance overhead, particularly when developers try to extend the usage of APIs without knowing the cost well.
For example, this is a very effective way to slow down user's browser by alternating an elements' `left` every loop:

http://www.html5rocks.com/en/tutorials/speed/high-performance-animations/

Of course a good enough library should handle these obvious issues for developers.
The point is, if readers need to use library because the failure of DOM makes things go crazy, just use it **wisely and carefully**.

[dom]: https://en.wikipedia.org/wiki/Document_Object_Model
[jquery]: https://jquery.com/

---

