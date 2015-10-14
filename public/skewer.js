(new EventSource('/node-skewer/update-stream')).onmessage = function(e) {
  switch (e.data){
  case "log":
    console.log("A log message.");
    break;
  case "reload":
    // elegant close
    this.close();
    setTimeout(function(){
      window.location.reload();
    }, 200);
    break;
  default:
    console.log("Unknown: " + e.data);
  }
};
