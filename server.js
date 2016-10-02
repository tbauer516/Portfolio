var   http         = require('http'),
      express      = require('express'),
      fs           = require('fs'),
      path         = require('path'),
      contentTypes = require('./utils/content-types'),
      sysInfo      = require('./utils/sys-info'),
      env          = process.env;

// var server = http.createServer(function (req, res) {
//   var url = req.url;
//   if (url == '/') {
//     url += 'index.html';
//   }

//   // IMPORTANT: Your application HAS to respond to GET /health with status 200
//   //            for OpenShift health monitoring

//   if (url == '/health') {
//     res.writeHead(200);
//     res.end();
//   } else if (url == '/info/gen' || url == '/info/poll') {
//     res.setHeader('Content-Type', 'application/json');
//     res.setHeader('Cache-Control', 'no-cache, no-store');
//     res.end(JSON.stringify(sysInfo[url.slice(6)]()));
//   } else {
//     fs.readFile('./static' + url, function (err, data) {
//       if (err) {
//         res.writeHead(404);
//         res.end('Not found');
//       } else {
//         let ext = path.extname(url).slice(1);
//         res.setHeader('Content-Type', contentTypes[ext]);
//         if (ext === 'html') {
//           res.setHeader('Cache-Control', 'no-cache, no-store');
//         }
//         res.end(data);
//       }
//     });
//   }
// });

var app = express();

// app.get('/', function(req, res) {
// 	var url = req.url;
// 	if (url == '/health') {
// 		res.writeHead(200);
// 		res.end();
// 	} else if (url == '/info/gen' || url == '/info/poll') {
// 		res.setHeader('Content-Type', 'application/json');
// 		res.setHeader('Cache-Control', 'no-cache, no-store');
// 		res.end(JSON.stringify(sysInfo[url.slice(6)]()));
// 	} else {
// 		fs.readFile('./public' + url, function (err, data) {
// 			if (err) {
// 				res.writeHead(404);
// 				res.end('Not found');
// 			} else {
// 				var ext = path.extname(url).slice(1);
// 				res.setHeader('Content-Type', contentTypes[ext]);
// 				if (ext === 'html') {
// 					res.setHeader('Cache-Control', 'no-cache, no-store');
// 				}
// 				res.end(data);
// 			}
// 		});
// 	}
// });

app.use(express.static(__dirname + '/public'));

// server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {
//   console.log(`Application worker ${process.pid} started...`);
// });

var port = process.env.OPENSHIFT_NODEJS_PORT || 8000;
var ipadress;
var initIPAdress = function() {
	var adress = process.env.OPENSHIFT_NODEJS_IP;
	if (typeof adress === 'undefined') {
		console.warn('No OPENSHIFT_NODEJS_IP var, using default ' + port);
		adress = 'localhost';
	}
	ipadress = adress;
}

initIPAdress();

app.listen(port, ipadress, function() {
  console.log(`Application worker ${process.pid} started...`);
});