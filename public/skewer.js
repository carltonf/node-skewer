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

  // fallback
  evtSource.onmessage = function(e){
    console.log("Unknown: " + e.data);
  };

  evtSource.onerror = function(e){
    console.error(e);
  };
})();
