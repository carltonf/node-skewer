
var express = require('express'),
    path = require('path');

function createServer(serveDir) {

  var app = express();

  // * Env
  app.set('port', process.env.PORT || 3000);
  var testingp = (process.env.NODE_ENV == "testing");
  // * Middleware
  // ** logger
  // Before all other routings
  if (!testingp){
    var logger = require('morgan')
    app.use(logger('dev'));
  }

  // * Routing
  // ** Directory listing
  //
  app.use(express.static(serveDir));

  var serveIndex = require('serve-index');
  app.use('/', serveIndex(serveDir, {view: "details"}));

  // *** Special node-skewer files
  // From this routing:
  // 1. client-side skewer.js is served.
  // 2. various SSE/WebSocket is attached.
  app.locals.skewerPath = 'node-skewer'; // at root
  app.use(`/${app.locals.skewerPath}`, express.static(path.join(__dirname, 'public')));


  // * SSE: live reloading, repl and etc
  //
  app.get(`/${app.locals.skewerPath}/update-stream`, (req, res) => {
    app.locals.sseResponse = res;

    res.setTimeout(0);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write('\n');

    req.on('close', function(){
      app.locals.sseResponse.end();
      delete app.locals.sseResponse;
    });
  });

  // ** /${app.locals.skewerPath}/notify?cmd='reload'
  // *** Available cmds:
  //     - reload
  //     - log
  //     - loadScript <pathname>
  //       /${app.locals.skewerPath}/notify?cmd='loadScript'&data='somefile.js'
  //     - open-url-in-new-tab <url>
  //       /${app.locals.skewerPath}/notify?cmd='open-url-new-tab'&data='www.example.com'
  app.get(`/${app.locals.skewerPath}/notify`, (req, res) => {
    var cmd = req.query.cmd,
        data = req.query.data || "", // only data field is mandatory
        sseResponse = app.locals.sseResponse;

    if (sseResponse){
      sseResponse.write(`event: ${cmd}\n`);
      sseResponse.write(`id: *MANUAL*\n`);
      sseResponse.write(`data: ${data}\n`);
      sseResponse.write('\n');

      res.send(`message sent: ${cmd}\n\n`);
    }
    else{
      res.status(400).send('Error: Not subscribed yet!\n\n');
    }
  });

  // return an http server
  return require('http').createServer(app);

}// createServer ends

// * Module build up
module.exports = createServer;
