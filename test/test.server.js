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

  it('root / succeeds', function(done){
    http.get(url, function(res){
      assert.equal(200, res.statusCode);

      done();
    });
  });

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

  after(function(){
    server.close();
  })
})
