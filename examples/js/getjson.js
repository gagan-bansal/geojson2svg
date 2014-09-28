//code from https://developer.mozilla.org/en-US/docs/AJAX/Getting_Started
(function() {
  var makeRequest = function(url,callback,opt) {
    var httpRequest;
    var handler;
    if (window.XMLHttpRequest) { // Mozilla, Safari, ...
      httpRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE
      try {
        httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
      } 
      catch (e) {
        try {
          httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        } 
        catch (e) {}
      }
    }

    if (!httpRequest) {
      alert('Giving up :( Cannot create an XMLHTTP instance');
      return false;
    }
    handler = callback;
    httpRequest.onreadystatechange = success;
    httpRequest.open('GET', url);
    httpRequest.send();
    function success() {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          handler.call(this,httpRequest.responseText);
        } else {
          alert('There was a problem with the request.');
       }
      }
    }
  }

  if(window) {
    window.getjson = makeRequest;
  } 
})();
