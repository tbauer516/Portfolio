var express = require('express');
var compression = require('compression');
var app = express();

var oneDay = 86400000;

app.use(compression());

app.use(express.static(__dirname + '/public', {maxAge: oneDay}));

var port = process.env.OPENSHIFT_NODEJS_PORT || 8000;
var ipadress = process.env.OPENSHIFT_NODEJS_IP;
if (typeof ipadress === 'undefined') {
		console.warn('No OPENSHIFT_NODEJS_IP var, using default ' + port);
		ipadress = 'localhost';
	}

app.listen(port, ipadress, function() {
  console.log(`Application worker ${process.pid} started...`);
});