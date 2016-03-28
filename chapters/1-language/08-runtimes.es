    it('to require a module in Node.js',
    function() {
      var os = require('os');
      // It will print out the OS architecture like 'darwin' for MacOSX.
      console.log(os.arch());
    });

    it('in Node.js there is no DOM APIs',
    function() {
      var userTweets = document.querySelectorAll('body #list-tweets.tweet');
      for (var i = 0; i < userTweets.length; i++) {
        (function() {
          userTweets[i].addEventListener('click', onTweetsClicked(userTweets[i].id));
        })();
      }
    });