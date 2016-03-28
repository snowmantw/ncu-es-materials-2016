    it('dynamic type-checking means it won\'t report any type issue before encountering that',
    function() {
      debugger;
      var foo = {};
      foo = 4;
      foo = foo + '2';
    });