# ECMAScript Introduction

@GregWeng

2016 NCU

---

## How to use this document

This document is written in [Literate JavaScript][literate-js], which means you can execute the document to
get the specific result. The only dependency is `literate-programming`:

```bash
    npm install -g literate-programming
```

And then "compile" the document to an executable ECMAScript file:

```bash
    literate-programming <this file.md>
```

You will get the compiled ECMAScript file as `<this file.es>`. After that, make sure you have the test framework
`mocha` installed:

```bash
    npm install -g mocha
```

This is because executable examples are all in `unit test` format.
Besides that, please also install all dependencies via:

```bash
    npm install
```

---

This will install all necessary packages from the `package.json`.

Finally, to run the compiled tests, type:

```bash
    mocha <the test file>
```

Usually this will report no errors. However, in some example the error is the expected result.

[literate-js]: https://github.com/jostylr/literate-programming

Side note: the tool now is deprecated by developers. However, I found the latest `litpro` adds lots of unnecessary complexity
without any actual useful features for this document. So I decide to keep using the old version.

---
## How to debug

Although to fix the bug is easy, to have a GUI tool can watch and set the breakpoints will be convenient.
Fortunately, `node-inspector` can run with `mocha` perfectly:

```bash
    npm install -g node-inspector
```

Make sure you have `blink` based browser like Chrome in your console.
After that, type:

```bash
    node-inspector
```

To launch the interface. Then you need to navigate to

```
    http://127.0.0.1:8080/debug?port=5858
```

To get the code and result from your Node process.

---

After that, execute the test in command line:

```bash
    mocha --debug-brk <the test file>
```

It should show the code in the debugging tool.

In order to monitor and debug the file, a `debugger` line is added above every test file.
This should make the inspector stop at the first line of the demo script.

---

## How to generate slides

This project uses [Remark.js][remark-github] to turn the document to slides.

In the `/scripts` directory, there is a simple Node.js script to append the document to a HTML template and then print the result out. Therefore, to get the slides the command is:

```bash
    node scripts/make-slides.js <the chapter.md> > <where the file should be>
```

It will redirect the output to a slides file, as the committed ones.

[remark-github]: https://github.com/gnab/remark
