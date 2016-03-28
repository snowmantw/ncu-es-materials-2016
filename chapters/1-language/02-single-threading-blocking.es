    it('single-threading means this will freeze your whole program',
    function() {
      debugger;
      while(true) {};
    });