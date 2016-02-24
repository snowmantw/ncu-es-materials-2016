
(function() {
	var fs = require('fs');
	fs.accessSync(process.argv[2]);
	var markdown = require('fs').readFileSync(process.argv[2]);
	var template = `<!DOCTYPE html>
	<html>
		<head>
			<title>Title</title>
			<meta charset="utf-8">
			<style>
				@import url(https://fonts.googleapis.com/css?family=Yanone+Kaffeesatz);
				@import url(https://fonts.googleapis.com/css?family=Droid+Serif:400,700,400italic);
				@import url(https://fonts.googleapis.com/css?family=Ubuntu+Mono:400,700,400italic);

				body { font-family: 'Droid Serif'; }
				h1, h2, h3 {
					font-family: 'Yanone Kaffeesatz';
					font-weight: normal;
				}
				.remark-code, .remark-inline-code { font-family: 'Ubuntu Mono'; background-color: #F0F0F0; }
        .remark-code-line { min-height: 0px !important; }
			</style>
		</head>
		<body>
			<textarea id="source">
      ${markdown}

			</textarea>
			<script src="https://gnab.github.io/remark/downloads/remark-latest.min.js">
			</script>
			<script>
				var slideshow = remark.create();
			</script>
		</body>
	</html>
	`;
	console.log(template);
})();
