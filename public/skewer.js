(function(){
  var evtSource = new EventSource('/node-skewer/update-stream');
  evtSource.addEventListener('log', function(){
    console.log("A log message.");
  });

  evtSource.addEventListener('reload', function(){
    // elegant close
    this.close();
    setTimeout(function(){
      window.location.reload();
    }, 200);
  });

  evtSource.addEventListener('loadScript', function(e){
    var fileref = document.createElement('script');
    fileref.setAttribute("src", e.data);
    document.body.appendChild(fileref);
  });

  evtSource.addEventListener('open-url-new-tab', function(e){
    var url = e.data;
    // only supports http, https, and ftp, anything else will be prepended with
    // double backslashes without any check
    if (url.indexOf('http') === 0 || url.indexOf('ftp') === 0) {
      // nothing
    } else if (url.indexOf('/tmp') === 0) {
      // A very *HACKY*/"smart" indirection to serve out-root files through symlinks
      // NOTE: only for subdirectories under "/tmp"
      //
      // TODO do this within server, dynamic serving, a configuration option maybe?
      //
      // 0. Be aware of the security implications of this "smartness".
      // 1. Under served directory ("test/fixturePublic/somedir" from "make
      // start") create a symlink to the target directory.
      // 2. The link name has to be *THE SAME* as the target.
      // 3. "rweb-open" to the absolute path of files.

      url="/somedir" + url.substr(4); // remove '/tmp'
    } else {
      url = '//' + url;
    }

    console.log('open url in new tab: ' + url);
    window.open(url, '_blank');
  });

  // fallback
  evtSource.onmessage = function(e){
    console.log("Unknown: " + e.data);
  };

  evtSource.onerror = function(e){
    console.error(e);
  };
})();
