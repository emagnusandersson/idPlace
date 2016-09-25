parseCookies=function(req) {
"use strict"
  var list={}, rc=req.headers.cookie;
  if(typeof rc=='string'){
    rc.split(';').forEach(function( cookie ) {
      var parts = cookie.split('=');
      list[parts.shift().trim()]=unescape(parts.join('='));
    });
  }
  return list;
}

MyQuery=function(sql,Val,pool,callback){this.sql=sql; this.Val=Val; this.callback=callback; this.pool=pool; this.iCount=0;};
MyQuery.prototype.go=function(){
  var self=this;  //console.log(this.sql); 
  //console.log('iCount '+this.iCount); 
  this.iCount++;
  this.pool.getConnection(function(err, connection) {
    if(err) {
      console.log('Error when getting mysql connection: ');
      if(typeof err=='object' && 'code' in err) {
        console.log('err.code: '+err.code);
        if(err.code=='PROTOCOL_CONNECTION_LOST' || err.code=='ECONNREFUSED' || err.code=='ECONNRESET'){
          if(self.iCount<nDBRetry) { setTimeout(thisChanged(self.go,self),2000); return;  }
          console.log('self.iCount=='+self.iCount+'>=nDBRetry');         
        }
      }
      else if(typeof err=='object') { console.log('err has no property "code" in it: '+err); }
      else if(typeof err=='string') {console.log('err: '+err); }
      else {console.log('err is neither an object nor a string: '+err); }
      self.callback(err); 
      return;
    }
    connection.query(self.sql, self.Val, function(err, results, fields) {
      connection.release();
      if(err) {
        console.log('Error when making mysql query: ');
        if(typeof err=='object' && 'code' in err) {
          console.log('err.code: '+err.code); debugger
          if(err.code=='PROTOCOL_CONNECTION_LOST' || err.code=='ECONNREFUSED'){
            if(self.iCount<nDBRetry) { setTimeout(thisChanged(self.go,self),2000); return;  }
            console.log('self.iCount=='+self.iCount+'>=nDBRetry');  
          }
        }
        else if(typeof err=='object') {console.log('err has no property "code" in it: '+err); }
        else if(typeof err=='string') {console.log('err: '+err); }
        else {console.log('err is neither an object nor a string: '+err); }
        console.log('sql: '+self.sql);
        console.log('Val.length: '+self.Val.length);
        self.callback(err); 
        return;
      }
      self.callback(null,results, fields);
    });
  });
}
myQueryF=function(sql,Val,pool,callback){
  var q=new MyQuery(sql,Val,pool,callback); q.go();
}



MyError=Error;
//MyError=function(){ debugger;}

getETag=function(headers){var t=false, f='if-none-match'; if(f in headers) t=headers[f]; return t;}
getRequesterTime=function(headers){if("if-modified-since" in headers) return new Date(headers["if-modified-since"]); else return false;}

var tmp=http.ServerResponse.prototype;
tmp.outCode=function(iCode,str){  str=str||''; this.statusCode=iCode; if(str) this.setHeader("Content-Type", "text/plain");   this.end(str);}
tmp.out200=function(str){ this.outCode(200, str); }
tmp.out201=function(str){ this.outCode(201, str); }
tmp.out204=function(str){ this.outCode(204, str); }
tmp.out301=function(url){  this.writeHead(301, {Location: url});  this.end();   }
tmp.out301Loc=function(url){  this.writeHead(301, {Location: '/'+url});  this.end();   }
tmp.out403=function(){ this.outCode(403, "403 Forbidden\n");  }
tmp.out304=function(){  this.outCode(304);   }
tmp.out404=function(str){ str=str||"404 Not Found\n"; this.outCode(404, str);    }
tmp.out500=function(err){ var errN=(err instanceof Error)?err:(new MyError(err)); console.log(errN.stack); this.writeHead(500, {"Content-Type": "text/plain"});  this.end(err+ "\n");   }
tmp.out501=function(){ this.outCode(501, "Not implemented\n");   }




checkIfLangIsValid=function(langShort){
  for(var i=0; i<arrLang.length; i++){ var langRow=arrLang[i]; if(langShort==langRow[0]){return true;} }  return false;
}

getBrowserLang=function(req){
"use strict"
  //echo _SERVER['accept-language']; exit;
  var Lang=[];
  if('accept-language' in req.headers) {
    var myRe=new RegExp('/([a-z]{1,8}(-[a-z]{1,8})?)\\s*(;\\s*q\\s*=\\s*(1|0\\.[0-9]+))?/ig');
    var str=req.headers['accept-language'];

      // create a list like [["en", 0.8], ["sv", 0.6], ...]
    var Match;
    while ((Match = myRe.exec(str)) !== null)    {
      var val=Match[4]; if(val=='') val=1;
      Lang.push([Match[1], Number(val)]);
    }
    if(Lang.length) {
      Lang.sort(function(a, b){return b[1]-a[1];});
    }
  }
  var strLang='en';
  for(var i=0; i<Lang.length; i++){
    var lang=Lang[i][0];
	  if(lang.substr(0,2)=='sv'){  strLang='sv';  } 
  }
  return strLang;
}


MimeType={
  txt:'text/plain; charset=utf-8',
  jpg:'image/jpg',
  jpeg:'image/jpg',
  gif:'image/gif',
  png:'image/png',
  svg:'image/svg+xml',
  ico:'image/x-icon',
  mp4:'video/mp4',
  ogg:'video/ogg',
  webm:'video/webm',
  js:'application/javascript; charset=utf-8',
  css:'text/css',
  pdf:'application/pdf',
  html:'text/html',
  xml:'text/xml'
};



genRandomString=function(len) {
  var characters = 'abcdefghijklmnopqrstuvwxyz';
  //var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var str ='';    
  for(var p=0; p<len; p++) {
    str+=characters[randomInt(0, characters.length-1)];
  }
  return string;
}
md5=function(str){return crypto.createHash('md5').update(str).digest('hex');}

wrapRedisSendCommand=function(strCommand,arr){
  var future=new Future;
  //redisClient.send(strCommand,arr).then(function(value){ future.return(value);});
  redisClient.send_command(strCommand,arr, function(err, value){ future.return(value);});
  return future.wait();
}



getIP=function(req){
  var ipClient='', Match;
    // AppFog ipClient
  if('x-forwarded-for' in req.headers){
    var tmp=req.headers['x-forwarded-for'];
    //tmp="79.136.116.122, 127.0.0.1";
    Match=/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.exec(tmp);
    if(Match && Match.length) return Match[0];
  }

  if('remoteAddress' in req.connection){
    var tmp=req.connection.remoteAddress;
    Match=/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.exec(tmp);
    if(Match && Match.length) return Match[0];
  }

  if('remoteAddress' in req.socket){
    var tmp=req.socket.remoteAddress;
    Match=/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.exec(tmp);
    if(Match && Match.length) return Match[0];
  }

  if('REMOTE_ADDR' in req.headers){return req.headers.REMOTE_ADDR;}
  return false
}

luaCountFunc="\n\
local boSessionExist=redis.call('EXISTS',KEYS[1]);\n\
local c;\n\
if(boSessionExist>0) then c=redis.call('INCR',KEYS[2]); redis.call('EXPIRE',KEYS[2], ARGV[1]);\n\
else c=redis.call('INCR',KEYS[3]); redis.call('EXPIRE', KEYS[3], ARGV[1]);\n\
end;\n\
return c";




var regFileType=RegExp('\\.([a-z0-9]+)$','i'),    regZip=RegExp('^(css|js|txt|html)$'),   regUglify=RegExp('^js$');
readFileToCache=function(strFileName) {
  var type, Match=regFileType.exec(strFileName);    if(Match && Match.length>1) type=Match[1]; else type='txt';
  var boZip=regZip.test(type),  boUglify=regUglify.test(type);
  var buf, fiber=Fiber.current;
  var err=null;
  fs.readFile(strFileName, function(errT, bufT) { //, this.encRead
    if(errT){  err=errT; }
    buf=bufT;
    fiber.run();
  });
  Fiber.yield();
  if(!err) {    CacheUri.set('/'+strFileName, buf, type, boZip, boUglify);    }
  return err;
}

CacheUriT=function(){
  var self=this;
  self.set=function(key,buf,type,boZip,boUglify){
    var eTag=crypto.createHash('md5').update(buf).digest('hex'); 
    /*if(boUglify) {
      var objU; objU=UglifyJS.minify(bufO.toString(), {fromString: true});
      bufO=new Buffer(objU.code,'utf8');
    }*/
    var fiber=Fiber.current;
    if(boZip){
      var bufI=buf;
      var gzip = zlib.createGzip(), boDoExit=0;
      zlib.gzip(bufI, function(err, bufT) {
        if(err){ boDoExit=1;  console.log(err);    }
        buf=bufT; //.toString();
        fiber.run();
      });
      Fiber.yield();  if(boDoExit==1) {process.exit(); return;}
    }
    self[key]={buf:buf,type:type,eTag:eTag,boZip:boZip,boUglify:boUglify};
  }
  
}



isRedirAppropriate=function(req){
  if(typeof RegRedir=='undefined') return false;

  var domainName=req.headers.host;
  for(var i=0;i<RegRedir.length;i++){
    var regTmp=RegRedir[i][0], strNew=RegRedir[i][1];
    var boT=regTmp.test(domainName);
    if(boT) {
      var domainNameNew=domainName.replace(regTmp, strNew);
      return 'http://'+domainNameNew+req.url;
    }
  }
  return false;
}




