
// * Boilerplate
var express = require('express'),
    app = express(); 

// * Static files
//
// TODO serveDir: a way to pass it from cdev executable?
var serveDir = process.argv[2];

app.use(express.static(serveDir));
app.use('/cdev', express.static(__dirname + '/public'));

// * Routing

// * SSE: live reloading, repl and etc
//
app.get('/cdev/update-stream', (req, res) => {
  console.log('SSE: one client subscribe to the stream.')

  app.locals.sseResponse = res;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.write('\n');

  req.on('close', function(){
    console.log('SSE: The client close the channel!');

    delete app.locals.sseResponse;
  });
});

// ** /cdev/notify?cmd='reload'
// *** Available cmds:
//     - reload
//     - 
app.get('/cdev/notify', (req, res) => {
  var msg = req.query.cmd,
      sseResponse = app.locals.sseResponse;

  if (sseResponse){
    sseResponse.write(`id: *MANUAL*\n`);
    sseResponse.write(`data: ${msg}\n\n`);

    res.send(`message sent: ${msg}\n\n`);
  }
  else{
    res.status(400).send('Error: Not subscribed yet!\n\n');
  }
});

// * Start server
app.listen(3000);
