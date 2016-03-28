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

    it('these kinds of variables are *free variables*',
    function() {
      debugger;
      var addX = function(b) {
        return x + b;
      };
      // An exception here:
      addX(42);
    });

    it('a simple way to capture the variable',
    function() {
      debugger;
      var x = 1;
      var addX = function(b) {
        return x + b;
      };
      addX(42);
    });