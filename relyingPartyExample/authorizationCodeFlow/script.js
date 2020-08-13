
http = require("http");
url = require("url");
fs = require("fs");
concat = require('concat-stream');
requestMod = require('request');
querystring = require('querystring');

http.ServerResponse.prototype.setCodeNEnd=function(iCode,str){  str=str||''; this.statusCode=iCode; if(str) this.setHeader("Content-Type", "text/plain");   this.end(str);}

app=(typeof window==='undefined')?global:window;

port=8000;


require('./libReqBE.js');
require('./libReq.js'); 


var leafClient='client.js';
leafBE='be.json';
leafLoginBack="loginBack.html"; 


/********************************************************************
 * Instructions:
 * On the IdP-site you will get the app-id + app-secret which you fill in below.
 * Usually the uRedir (found below) should also be filled in on the IdP site.
 * 
 * IdP-app: the app that runs the IdP.
 ********************************************************************/


AppCred={   // <-- Fill in the credentials of whatever IdP you want to test !!!!
  fb:{id:"your-fb-app-id", secret:"your-fb-app-secret"},
  google:{id: "your-google-app-id", secret:"your-google-app-secret"},
  idplace:{id: "your-idplace-app-id", secret:"your-idplace-app-secret"},
  idL:{id:1, secret:''},  // <-- The following lines could/should be commented out (or removed)  (only for the developer of idplace)
  id192:{id:1, secret:'8lpvhbiqh5cemu4r8i7jza'},  // <-- The following lines could/should be commented out (or removed)  (only for the developer of idplace) (if this app is running on 192.168.0.4:5000)
  id192:{id:11000, secret:'xcce3335tjft3vp3q9b7e'}  // <-- The following lines could/should be commented out (or removed)  (only for the developer of idplace) (if this app is running on localhost:5000)
}


var wwwApp='localhost:'+port;
//var wwwApp='192.168.0.4:'+port;
var wwwRedir=wwwApp+"/"+leafLoginBack;
uRedir='http://'+wwwRedir;  // <-- This url should be quite often be entered on the IdP site


/********************************************************************/



AppId={};   for(var k in AppCred){   AppId[k]=AppCred[k].id;    } // Create a variable without secrets that can be sent to the client


strFBVersion="v7.0"
UrlOAuth={fb:"https://www.facebook.com/"+strFBVersion+"/dialog/oauth", google: "https://accounts.google.com/o/oauth2/v2/auth", idplace:'https://idplace.org', idL:'http://localhost:5000', id192:'http://192.168.0.4:5000'};
UrlGraph={fb:"https://graph.facebook.com/"+strFBVersion+"/me", google: "https://www.googleapis.com/plus/v1/people/me", idplace:'https://idplace.org/me', idL:'http://localhost:5000/me', id192:'http://192.168.0.4:5000/me'};

UrlCode2Token={fb:"https://graph.facebook.com/"+strFBVersion+"/oauth/access_token", google: "https://accounts.google.com/o/oauth2/token", idplace:'https://idplace.org/access_token', idL:'http://localhost:5000/access_token', id192:'http://192.168.0.4:5000/access_token'};


var handler=function(req, res){

  var objUrl=url.parse(req.url), qs=objUrl.query||'', objQS=querystring.parse(qs),  pathName=objUrl.pathname;
  if(req.headers.host!=wwwApp){ res.writeHead(404);  res.end("404 Nothing at that url\n"); return; }
  req.flow=(function*(){
    var objReqRes={req, res};
    if(pathName=='/'){  yield* reqIndex.call(objReqRes);      }
    else if(pathName=='/'+leafBE){      yield* reqBE.call(objReqRes);       }
    else if(pathName=='/'+leafClient){
      var fileStream = fs.createReadStream(leafClient);
      fileStream.pipe(res);
    }
    else if(pathName=='/'+leafLoginBack){   yield* reqLoginBack.call(objReqRes);    }
    else if(pathName=='/debug'){    debugger  }
    else {res.writeHead(404); res.end("404 Not Found\n"); return; }
    
  }).call(); req.flow.next();
}


http.createServer(handler).listen(port);   console.log("Listening to HTTP requests at port " + port);


