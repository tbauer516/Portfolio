var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var port = process.env.OPENSHIFT_NODEJS_PORT || 8000;
var ipadress = process.env.OPENSHIFT_NODEJS_IP;
if (typeof ipadress === 'undefined') {
		console.warn('No OPENSHIFT_NODEJS_IP var, using default ' + port);
		ipadress = 'localhost';
	}

app.listen(port, ipadress, function() {
  console.log(`Application worker ${process.pid} started...`);
});