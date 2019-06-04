/*
 * Primary file for API
 */

//dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const config = require('./config');

//http server
const httpServer = http.createServer((req, res) => unifiedServer(req, res));
httpServer.listen(config.httpPort, () =>
  console.log('HTTP Server started at port: ', config.httpPort, 'in ', config.envName)
);

//https server
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => unifiedServer(req, res));
httpsServer.listen(config.httpsPort, () =>
  console.log('HTTPS Server started at port: ', config.httpsPort, 'in ', config.envName)
);

//server logic for HTTP and HTTPS
const unifiedServer = (req, res) => {
  //parse url
  const parsedUrl = url.parse(req.url, true);
  //get path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  //check for a route handler. If none is found, then notFound handler is used
  const chosenHandler =
    typeof router[trimmedPath] !== 'undefined' ? router[trimmedPath] : handlers.notFound;

  //route request to handler specified in router
  chosenHandler((statusCode, payload) => {
    statusCode = typeof statusCode === 'number' ? statusCode : 200;

    //use payload from handler or return empty object
    payload = typeof payload === 'object' ? payload : {};

    //convert payload to JSON string
    const payloadString = JSON.stringify(payload);

    //response
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(statusCode);
    res.end(payloadString);
  });
};

//route handlers
const handlers = {};

//hello handler
handlers.hello = function(callback) {
  callback(200, { msg: 'Hello World!' });
};

//not found handler
handlers.notFound = function(callback) {
  callback(404);
};

//request router
const router = {
  hello: handlers.hello
};
