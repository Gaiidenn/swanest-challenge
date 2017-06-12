var args = process.argv;
var fileName = args[2];

var fs = require('fs');

var timeouts = [];

fs.readFile(fileName, function(err, data){
	if (err) throw err;
	var lines = data.toString().replace(/\r?\n|\r/g, '').split(';');
	for (var i in lines) {
		var line = lines[i];
		parse(line);
	}

  timeouts.sort(function(a, b) {
    if (a.delay < b.delay) return -1;
    if (a.delay > b.delay) return 1;
    return 0;
  });

	var lastDelay = 0;
  for (var i in timeouts) {
    var timeout = timeouts[i];
    var newDelay = timeout.delay - lastDelay;
		if (newDelay < 0) newDelay = 0;
    setTimeout(timeout.func, newDelay);
    lastDelay += newDelay;
  }
});

//------------------------------------------------------------------------------

function parse(line) {
	var argsStartPos = line.indexOf('(');
	if (argsStartPos === -1) return;
	var argsEndPos = line.lastIndexOf(')');
	var funcName = line.substring(0, argsStartPos);
	switch (funcName) {
		case "setTimeout":
      var func = line.substring('setTimeout('.length, line.lastIndexOf('}')+1);
      var args = line.substring(argsStartPos+1, argsEndPos).split(',');
			timeouts.push({func: func, delay: parseInt(args[1])});
			break;
		case "console.log":
      var arg = line.substring(argsStartPos+1, argsEndPos);
			console.log(arg);
	}
}

setTimeout = function(myFunc, delay) {
  sleep(delay);
  if (typeof myFunc === "function") {
  	myFunc();
  	return;
	}
	var startPos = myFunc.indexOf('{');
  var endPos = myFunc.lastIndexOf('}');
  var instructions = myFunc.substring(startPos+1, endPos);
  var func = new Function(instructions);
  func();
};

console.log = function(args) {
	process.stdout.write(args + '\n');
};

sleep = function(delay) {
	var now = Date.now();
	var end = Date.now() + delay;
	while (now < end){
		now = Date.now();
	}
};