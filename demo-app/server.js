var http = require('http');
var os = require("os");
var hostname = os.hostname();

http.createServer(function (req, res) {
  res.write(hostname);
  res.end();
}).listen(5000);

