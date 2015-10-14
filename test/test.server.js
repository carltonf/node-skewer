var createServer = require('..');

var path = require('path'),
    assert = require('assert'),
    http = require('http');

var fixturePublic = path.join(__dirname, 'fixturePublic');

describe('Server basic', function(){
  var address = null,
      url = null,
      server = createServer(fixturePublic);
  before(function(done){
    server.listen(function(){
      address = server.address();
      url = `http://localhost:${address.port}`;

      done();
    })
  })

  describe('routing', function(){
    it('GET / succeeds', function(done){
      http.get(url, function(res){
        assert.equal(200, res.statusCode);

        done();
      });
    });

    it('GET /node-skewer/ is not found', function(done){
      http.get(`${url}/node-skewer/`, function(res){
        assert.equal(404, res.statusCode);

        done();
      });
    });

    it('GET /node-skewer/skewer.js can loaded', function(done){
      http.get(`${url}/node-skewer/skewer.js`, function(res){
        assert.equal(200, res.statusCode);

        done();
      });
    });
  });

  describe('directory listing', function(){
    var targetFile = "some.file";

    it(`should list ${targetFile}`, function(done){
      http.get(`${url}/somedir/`, function(res){
        var buf = new Buffer(20480); //20K

        res.setEncoding('utf8');

        res.on('data', function(chunk){
          buf.write(chunk);
        })

        res.on('end', function(){
          if (buf.toString().includes(targetFile)){
            done();
          }
          else {
            throw new Error(`"${targetFile}" is not found!`);
          }
        })
      })
    });
  });

  describe('SSE', function(){
    var sseResponse = null,
        sseString = "";

    before(function(done){
      http.get(`${url}/node-skewer/update-stream`, function(res){
        assert.equal(200, res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function(chunk){
          sseString += chunk;
        });
        sseResponse = res;

        done();
      });
    });

    it('"log" should be recieved', function(done){
      function logVerifier(){
        if(sseString.match(/data: ['"]log['"]/)){
          sseString = "";
          sseResponse.removeListener('data', logVerifier);

          done();
        }
        // o/w let it time out to fail
      };
      sseResponse.on('data', logVerifier);

      http.get(`${url}/node-skewer/notify?cmd="log"`, function(res){
        assert.equal(200, res.statusCode);
      });
    });


    it('"reload" should be recieved', function(done){
      function reloadVerifier(){
        if(sseString.match(/data: ['"]reload['"]/)){
          sseString = "";
          sseResponse.removeListener('data', reloadVerifier);

          done();
        }
        // o/w let it time out to fail
      };
      sseResponse.on('data', reloadVerifier);

      http.get(`${url}/node-skewer/notify?cmd="reload"`, function(res){
        assert.equal(200, res.statusCode);
      });
    });

    after(function(){
      sseResponse.removeAllListeners('data');
      sseResponse.emit('end');
    });
  });

  after(function(){
    server.close();
  })
})
