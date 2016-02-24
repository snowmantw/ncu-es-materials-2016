# ECMAScript Introduction - Asynchronous Programming with Promise and Event
@GregWeng
2016 NCU

---

## Goal

Help you to understand how to develop and debug the asynchronous programming **with the low-level Promise API**.

It is important to know basic difficulties of **asynchronous programming**,
since careless implementation could lead to lethal failure of your application with rapidly growing complexity
and racing traps hidden everywhere.

The **DOM event** is not part of this chapter, because Node.js and Web runtimes both provide lots of asynchronous
APIs that need to be managed carefully. And Node.js is a simpler platform to demo the case, at least the case irrelevant
to UI components is much easier to implement and test.

---

## Asynchronous programming

It is common to develop web server in Node.js, especially when the website is still
relatively small and the performance issues are not critical.

The most notorious issue with Node.js is its asynchronous [APIs][node-apis] are lack of sophisticated
design to organize the control flow.

---

As the API document reveals, the `callback` argument looks the only way to allow developer to know the operation is ended, and the next computation could be performed, then. This is a legacy design toward a famous hell, [the callback hell][callback-hell]:

```javascript
    fs.readdir(source, function (err, files) {
      if (err) {
        console.log('Error finding files: ' + err)
      } else {
        files.forEach(function (filename, fileIndex) {
          console.log(filename)
          gm(source + filename).size(function (err, values) {
            if (err) {
              console.log('Error identifying file size: ' + err)
            } else {
              console.log(filename + ' : ' + values)
              aspect = (values.width / values.height)
              widths.forEach(function (width, widthIndex) {
                height = Math.round(width / aspect)
                console.log('resizing ' + filename + 'to ' + height + 'x' + height)
                this.resize(width, height).write(dest + 'w' + width + '_' + filename, function(err) {
                  if (err) console.log('Error writing file: ' + err)
                })
              }.bind(this))
            }
          })
        })
      }
    })
```

[node-apis]: https://nodejs.org/api/fs.html
[callback-hell]: http://callbackhell.com/

---

The pyramid like code can grow very fast, particularly when it is a collaborating project.

These devastating pyramids not only make lots of useless spaces and the right-side of parenthesis,
they are also hurdles of tracing and debugging the code.

Because the nature flow of a program is from the top to down, or at least in a continuous statement nothing should jump among lines arbitrarily.

However, in a callback hell, it is hard to keep such reading flow, especially when the program need to
define some asynchronous `if...else`.

---

The worst is since there is no `await` before ECMAScript 7, it is not possible to do this:

```javascript
    try {
      // `await` an asynchronous API call.
      let files = await fs.readdir(source);
      // Continue the work on files.
    } catch(err) {
      console.log('Error finding files: ' + err)
    }
```

In the above example, the `await` could make the statement **looks like** synchronous while without
blocking the main thread. This greatly help programmers to organize the code without the overhead
[from Promise][promise-problems] and generator.

However, remember that ECMAScript is basically a single-threading language, the `await` cannot be designed to pause the whole thread. As a result, it actually leads to chaos and another hell if you don't [understand the Promise and even generator first][await-promise].

Anyway, before it is widely implemented in mainstream browsers, developers still need to learn Promise as the most
basic structure to control the asynchronous flow, although it is really a low-level API with lots of pitfalls.

[promise-problems]: http://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html
[await-promise]: https://medium.com/@bluepnume/learn-about-promises-before-you-start-using-async-await-eb148164a9c8#.4evgh6x9e

---

## Promise

Since ECMAScript 6, `Promise` now is [part of the language specification][promise-spec].

It must be constructed with a function as argument:

```javascript
    it('Promise without the argument will throw an error',
    function() {
      debugger;

      // This is incorrect.
      var promise = new Promise();
    });
```

---

And the API will check the type of it:

```javascript
    it('Promise strictly requires a function argument',
    function() {
      debugger;

      // This is incorrect.
      var promise = new Promise(42);
    });
```

---

The most important is, the function will execute **immediately**:

```javascript
    it('the function argument of Promise will execute immediately'
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
```

It is a common mistake that developers think the function argument of a `Promise` will execute **after** the synchronous statements.

**This is wrong**.

---

Don't get confused with the function argument and the asynchronous computation **inside its body**:

```javascript
    it('the function argument is with an asynchronous computation'
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
```

[promise-spec]: http://www.ecma-international.org/ecma-262/6.0/#sec-constructor-properties-of-the-global-object-promise

---

### Weave native APIs with Promise

Most of Node.js and some legacy DOM APIs, the convention to allow developer continue the computation after an asynchronous function is to provide a callback:

```javascript
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

```

---

However, this leads to the terrible callback hell as the first example shows.
Fortunately, to adapt these callback-style APIs with `Promise` is simple:

```javascript
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
```

It wraps the whole API call in a `Promise` constructor, and use the `resolve` and `reject` representing the result.

---

The example could be even simpler if it postpones the handler of error:

```javascript
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
```

In this way, the `resolve` is the only endpoint to receive the result.
And since `Promise` can receive the result in the following steps via `then` and `catch`,
the annoyed anonymous function could be eliminated.

Following section will elaborate `then` and `catch` in detail.

---

### Control flow with Promise

A `Promise` can construct the flow by its `then` and `catch`:

```javascript
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
```

---

This `Promise` chain will execute by:

1. After the `Promise` created, the `setTimeout` will perform the `resolve(42)` after 100ms.
2. Then the first `then` will do `assert` to see if the `number` equals to `42`
3. Then the second `then` will throw the exception after it check the data passed by the previous one is `foo`
4. It will skip the third `then` because **after the exception, the following `then`(s) will never execute**
5. Finally, because of the exception, the `catch` will receive that and end the process

---

It is important to understand that the `Promise` only [guarantee very few things][promise-spec].

In brief, there are some basic rules in each `Promise` and its `then`:


#### Resolve a Promise

I. If a function of constructor argument `resolve` itself, then the next `then` starts:

```javascript
    it('resolving leads to the next `then`',
    function() {
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
        done();
      });
    });
```

This is irrelevant whether the function is asynchronous or synchronous.

---

It is simple and strict: if the function doesn't resolve it, the next `then` will never start:

```javascript
    it('a never ending Promise (always pending)',
    function() {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        // Never resolve the Promise.
      }).then(function(number) {
        // Then the test will never end.
        done();
      });
    });
```

---

In fact, you can pull the `resolve` out of the `Promise`:

```javascript
    it('a never ending Promise (always pending)',
    function() {
      debugger;
      var assert = require('chai').assert;

      // Declare it but not define it.
      var resolve;
      var promise = new Promise(function(r, j) {
        // Not reolve it here; but assign it to a closure variable:
        resolve = r;
      }).then(function(number) {
        // This will not execute until the `resolve` get resolved.
        done();
      });

      // Since the resolve is pulled, we can "deferred" the promise until something happens:
      // ... after 200 lines
      resolve();
    });
```

This is a "standard trick" to make a **Deferred** object, which already provides in lots of 3rd-party libraries
like [q][node-q] or [bluebird][node-bluebird].

It is unfortunate that the specification doesn't include a wrapped version of that.
In the following chapters, it will show how useful this trick is, especially when developers need to weave `Event` and `Promise` together.

[node-q]: https://github.com/kriskowal/q/wiki/API-Reference
[node-bluebird]: http://bluebirdjs.com/docs/api/deferred-migration.html

---

#### Then, catch and exception

II. If a `then` throw an exception, the following `then`(s) will get skipped **until the nearest `catch`**:

```javascript
    it('the function argument is with an asynchronous computation'
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        resolve();
      }).then(function() {
        throw new Error('An error occur');
      }).then(function() {
        console.log('it');
      }).then(function() {
        console.log('will');
      }).then(function() {
        console.log('never');
      }).then(function() {
        console.log('execute');
      }).then(function() {
        console.log('due to the error');
      }).catch(function(error) {
        console.log('in a chain with exception, only this catch will execute');
        done();
      });
    });
```

---

It is an interesting and important **quiz**: what happen to those `then`(s) *after the `catch`?*

```javascript
    // Quiz: what happen to the `then`(s) after the first `catch`?
    it('QUIZ. the function argument is with an asynchronous computation'
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        // Step 0.
        resolve();
      }).then(function() {
        // Step 1.
        throw new Error('An error occur');
      }).then(function() {
        // Skip
      }).catch(function(error) {
        // Step 2.
      }).then(function() {
        // How about this?
        throw new Error('Another error');
      }).then(function() {
        // And this?
      }).catch(function() {
        // And this?
        done();
      })
    });
```

---

#### Nested Promises

III. If a `then` return a `Promise`, then the following `then`(s) won't execute until the returned one get `resolved`


```javascript
    it('a Promise returned by `then` must be resolved first before the next `then`'
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        resolve();
      }).then(function() {
        return new Promise(function(resolve, reject) {
          // Never resolve the inner Promise so the chain is blocked.
        });
      }).then(function() {
        // The test will never done.
        done();
      });
    });
```

It is essential to know how to concate other `Promise`(s) in another one like this, since usually there are lots of asynchronous methods returning `Promise` that need to be organized via the main control-flow, which is usually another `Promise`.

---

#### Interruption from exception

VI. This is the most important thing to know: an error occurs in a `Promise` won't interrupt the process.

In fact, it even won't print anything:

```javascript
    it('when an error occurs, the world still works well'
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        resolve();
      }).then(function() {
        throw new Error('An error here');
      });

      setTimeout(function() {
        console.log('even after the exception, this part of program still goes well');
        done();
      }, 500);
    });
```

Compare to the ordinary synchronous functions, that an uncatched exception always interruts the process and print messages on the console, `Promise` **eat the error and never ends the program**.

That's why to put a `catch` in the end of a `Promise` chain to print the error is always a good idea.

---

However, **make sure the `catch` re-throw the error**, otherwise it won't interrupt the following concated chain. 

For example:

```javascript
    it('in `Promise`, to print the error and re-throw is important',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        resolve();
      }).then(function() {
        throw new Error('An error here');
      }).catch(function(err) {
        console.error(err);
        throw err;
      }).catch(function() { done() });
      // Ignore it.
      // The last line is just for the test.

      // To concate another Promise after the defined one:
      promise = promise.then(function() {
        done('this should never happen');
      });
    });
```

---


Without the re-throwing it will NOT interrupt the flow after the error:


```javascript
    it('let\'s see what will happen if the re-throwing is missing',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        resolve();
      }).then(function() {
        throw new Error('An error here');
      }).catch(function(err) {
        console.error(err);
        // throw err;
      });

      promise = promise.then(function() {
        done('this should never happen');
      });
    });
```

And yes, as the example shows, it is also critical to know how to concate one `Promise` after another one:

---

#### How to extend a Promise chain

V. Remember update the reference while extending a Promise chain

It is a common mistake to extend a `Promise` without updating the reference. This example:

```javascript
    it('the correct way to extend a Promise',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        // Step 0.
        resolve();
      });
      promise = promise.then(function() {
        // Step 1.
        done();
      });
    });
```

Shows that the original `promise` with only one constructor function as the step zero,
is extended by its own `then`.

---

However, because the `then` will **return a whole new `Promise` instance** with the concated step, the following concating must based on it to get the correct order of steps:

```javascript
    it('create a long promise without the chaining style',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        // Step 0.
        resolve(0);
      });
      promise = promise.then(function(number) {
        // Step 1.
        return number + 1;
      });
      promise = promise.then(function(number) {
        // Step 2.
        return number + 1;
      });
      promise = promise.then(function(number) {
        // Step 3.
        assert(number + 1, 3);
        done();
      });
      promise = promise.catch(function(error) {
        console.error(error);
        done(error);
      });
    });
```

---

The following **quiz** will fail because it won't work without using the updated reference:

```javascript
    // Quiz: try to guess what will happen?
    it('QUIZ. the WRONG way to create a long promise without the chaining style',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        // Step 0.
        resolve(0);
      });
      promise = promise.catch(function(error) {
        console.error(error);
        done(error);
      });

      // This is incorrect.
      //
      promise.then(function(number) {
        // Step 1.
        return number + 1;
      });
      promise.then(function(number) {
        // Step 2.
        return number + 1;
      });
      promise.then(function(number) {
        // Step 3.
        assert(number + 1, 3);
        done();
      });
    });
```

It is even possible to concate new steps in a loop:

```javascript
    it('can concate new steps to the Promise in a loop',
    function(done) {
      debugger;
      var assert = require('chai').assert;

      var promise = new Promise(function(resolve, reject) {
        // Step 0.
        resolve(0);
      });
      for (var i = 0; i < 2; i++) {
        promise = promise.then(function(number) {
          return number + 1;
        });
      }
      promise = promise.then(function(number) {
        // Step 3.
        assert(number + 1, 4);
        done();
      }).catch(function(error) {
        console.error(error);
        done(error);
      });
    });

---


### Miscellaneous

All the caveats of `Promise` list above. The rest are some useful APIs in summary:

1. To wait multiple asynchronous tasks as one `Promise`, use [Promise.prototype.all][promise-all]. Please note the arguments of it is an `Array`, not a `Promise`.

2. To get a resolved `Promise`, use [Promise.prototype.resolve][promise-resolve]. This is useful because sometimes we just need a `Promise`, no matter whether it is resolved or not.

3. If the first function in the constructor need to throw any error, it should use the `reject` function:


```javascript
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
```

[promise-spec]: http://www.ecma-international.org/ecma-262/6.0/#sec-promise-constructor
[promise-all]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
[promise-resolve]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve

---

### Promise + Event

To survive in a asynchronous world, knowing how to weave `Promise` with `Event` is critical.

---

For example, this is a typical snippet to handle reading data from a stream, it will fire endless events:

```javascript
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

```

---

The code reveals some typical patterns developers need to know in either Node.js and Web browser. In detail:

#### Event target

In both Node.js (as "[EventEmitter][eventemitter]") and Web browser, an `EventTarget` is [an interface implemented by objects that can receive events and may have listeners for them.][eventtarget-mdn]. Therefore, this line:

```javascript
      this.urandomStream = fs.createReadStream('/dev/urandom');
```

Creates a [Readable stream][readable-stream] fires events when there are [fresh data from the source file][stream-event-data], also when the stream is [closed][stream-event-closed], [ended][stream-event-ended] or [has some errors][stream-event-error].

Of course in browser developers usually deal with events from the user and HTTP request. However, for a demo the most important is to have a source of event, and in Node.js the file system API provides an easy to do that.

---

After the creation of the stream, this line will add an `EventListener` on that:

```javascript
    this.urandomStream.on('data', this.onChunk.bind(this));
```

It is essential to **bind the instance ** as the Chapter 1. elaborates.
Otherwise, the `onChunk` method, will not have a correct instance to execute statements like `this.createFile()`.

In browser, it allows to add an instance with `handleEvent` to be the `EventTarget`:

```javascript
    var Foo = function() {};
    Foo.prototype.handleEvent = function(event) {
      // Handle the event.
    };
    var foo = new Foo();
    window.addEventListener('click', foo);
```

As the example shows, the `window` will automatically invoke the `handleEvent` of the `foo`.
And the `this` inside the `handleEvent` will automatically be bound as the `foo`.


[eventemitter]: https://nodejs.org/api/events.html#events_class_eventemitter
[eventtarget-mdn]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
[readable-stream]: https://nodejs.org/api/stream.html#stream_class_stream_readable
[stream-event-data]: https://nodejs.org/api/stream.html#stream_event_data
[stream-event-closed]: https://nodejs.org/api/stream.html#stream_event_close
[stream-event-ended]: https://nodejs.org/api/stream.html#stream_event_end
[stream-event-error]: https://nodejs.org/api/stream.html#stream_event_error


---

#### Event handler and Promise

The code:

```javascript
    Reader.prototype.onChunk = function(chunk) {
      // (omit other details)...

      this.mainPromise = this.mainPromise
      .then(this.writeContent(chunk).bind(this))
      .catch(function(error) {
        console.error(error);
        throw error;
      });
    };
```

Shows that when a `data` event comes, it will append another new step of writing data to the `mainPromise`.

To have a `mainPromise` coordinate event handling actions allow developers preventing racing in asynchronous programs.

For example, if the event handler looks like this:

```javascript
    Reader.prototype.onChunk = function(chunk) {
      // (omit other details)...

      this.writeContent(chunk)();
    };
```

It will soon leave lots of **intermittent errors** because every time when the event comes, the `writeContent` may not complete its task yet.

---

Moreover, unless the `writeContent` is an entirely synchronous operation which blocks the main thread and events,
**to assume it is fast enough to avoid debugging intermittent errors is impractical**,
particularly when the program is running on the usually much slower integration test environment.

Besides that, the way to concate a `Promise` with more steps is just a transformed loop that concate steps in synchronous.
That is why in the previous section, there is an example to show such concating tactic.

---

Also, the example shows a case about using closure properly. The definition:

```javascript
    Reader.prototype.writeContent = function(chunk) {
      return (function() {
        return new Promise((function(resolve, reject) {
          this.targetStream.write(chunk, 'utf8', resolve);
        }).bind(this));
      }).bind(this);
    };
```

Reveals the `writeContent` is a function **returns another function**, with the **captured variable `chunk`**.
Without such trick, this step:

```javascript
    this.mainPromise = this.mainPromise
    .then(this.writeContent(chunk).bind(this))
```

Will become more verbose:

```javascript
    this.mainPromise = this.mainPromise
    .then((function(chunk) { return this.writeContent(chunk); }).bind(this))
```

It blurs the real intention with details like binding and function application,
plus to return the `Promise` in a `then` step to block it before the writing is done.

---

## Conclusion

Although there are some advanced features in the latest ECMAScript to simplify the work of asynchronous programming,
`Promise` is still the most common low-level tool to manage callback and event based APIs.

As a result, it is essential to know such principles while programming around that:

I. Promise must have a function as the only valid argument of its constructor

II. The function must call the `resolve` to kick-off the whole chain, unless the function is to create a `Defer` instance

III. To append new steps to a `Promise`, use `then` with an usually **bound function** as its callback

IV. The callback function could return another `Promise` to block the chain until its resolved; there are no other ways to make the `Promise` wait its steps

---

V. Throwing errors in a `then` will interrupt the whole `Promise` chain until the nearest `catch`

VI. Forgetting to update the `Promise` instance while appending new steps will lead to unexpected results

VII. For event handling, using a main `Promise` that grows with asynchronous steps by every event is a common pattern

---
