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