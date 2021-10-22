
"use strict"


import http from "http";

app.parseCookies=function(req) {
  var list={}, rc=req.headers.cookie;
  if(typeof rc=='string'){
    rc.split(';').forEach(function( cookie ) {
      var parts = cookie.split('=');
      list[parts.shift().trim()]=unescape(parts.join('='));
    });
  }
  return list;
}


//
// Mysql
//

app.MyMySql=function(pool){ this.pool=pool; this.connection=null;  }
MyMySql.prototype.getConnection=async function(){
  var [err, connection]= await new Promise(resolve=>{   this.pool.getConnection((...arg)=>resolve(arg));    });
  this.connection=connection; return [err];
}
MyMySql.prototype.startTransaction=async function(){
  if(!this.connection) {var [err]=await this.getConnection(); if(err) return [err];}
  var err=await new Promise(resolve=>{   this.connection.beginTransaction(eT=>resolve(eT));   });     if(err) return [err];
  this.transactionState='started';
  return [null];
}
MyMySql.prototype.query=async function(sql, Val=[]){
  if(!this.connection) {var [err]=await this.getConnection(); if(err) return [err];}
  var [err, results, fields]=await new Promise(resolve=>{    this.connection.query(sql, Val, (...arg)=>resolve(arg) );      });
  return [err, results, fields];
}
MyMySql.prototype.rollback=async function(){  await new Promise(resolve=>{this.connection.rollback(()=>resolve());   });   }
MyMySql.prototype.commit=async function(){
  var err=await new Promise(resolve=>{   this.connection.commit(eT=>resolve(eT));   });   return [err];
}
MyMySql.prototype.rollbackNRelease=async function(){  await new Promise(resolve=>{this.connection.rollback(()=>resolve())});  this.connection.release(); }
MyMySql.prototype.commitNRelease=async function(){
  var err=await new Promise(resolve=>{this.connection.commit(eT=>resolve(eT));  });  this.connection.release();  return [err];
}
MyMySql.prototype.fin=function(){   if(this.connection) { this.connection.destroy();this.connection=null;};  }




//
// Errors
//

app.ErrorClient=class extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErrorClient';
  }
}

app.getETag=function(headers){var t=false, f='if-none-match'; if(f in headers) t=headers[f]; return t;}
app.getRequesterTime=function(headers){if("if-modified-since" in headers) return new Date(headers["if-modified-since"]); else return false;}

var tmp=http.ServerResponse.prototype;
tmp.outCode=function(iCode,str){  str=str||''; this.statusCode=iCode; if(str) this.setHeader("Content-Type", MimeType.txt);   this.end(str);}
tmp.out200=function(str){ this.outCode(200, str); }
tmp.out201=function(str){ this.outCode(201, str); }
tmp.out204=function(str){ this.outCode(204, str); }
tmp.out301=function(url){  this.writeHead(301, {Location: url});  this.end();   }
tmp.out301Loc=function(url){  this.writeHead(301, {Location: '/'+url});  this.end();   }
tmp.out403=function(){ this.outCode(403, "403 Forbidden\n");  }
tmp.out304=function(){  this.outCode(304);   }
tmp.out404=function(str){ str=str||"404 Not Found\n"; this.outCode(404, str);    }
tmp.out500=function(e){
  if(e instanceof Error) {var mess=e.name + ': ' + e.message; console.error(e);} else {var mess=e; console.error(mess);} 
  this.writeHead(500, {"Content-Type": MimeType.txt});  this.end(mess+ "\n");
}
tmp.out501=function(){ this.outCode(501, "Not implemented\n");   }




app.checkIfLangIsValid=function(langShort){
  for(var i=0; i<arrLang.length; i++){ var langRow=arrLang[i]; if(langShort==langRow[0]){return true;} }  return false;
}

app.getBrowserLang=function(req){
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


app.MimeType={
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
  xml:'text/xml',
  json:'application/json',
  zip:'application/zip'
};


app.md5=function(str){return crypto.createHash('md5').update(str).digest('hex');}


  // Redis
app.cmdRedis=async function(strCommand, arr){
  if(!(arr instanceof Array)) arr=[arr];
  return await new Promise(resolve=>{
    redisClient.send_command(strCommand, arr, (...arg)=>resolve(arg)  ); 
  });
}
app.getRedis=async function(strVar, boObj=false){
  var [err,res]=await cmdRedis('GET', [strVar]);  if(boObj) res=JSON.parse(res);  return [err,res];
}
app.setRedis=async function(strVar, val, tExpire=-1){
  if(typeof val!='string') var strA=JSON.stringify(val); else var strA=val;
  var arr=[strVar,strA];  if(tExpire>0) arr.push('EX',tExpire);   var [err,strTmp]=await cmdRedis('SET', arr);
  return [err,strTmp];
}
app.expireRedis=async function(strVar, tExpire=-1){
  if(tExpire==-1) var [err,strTmp]=await cmdRedis('PERSIST', [strVar]);
  else var [err,strTmp]=await cmdRedis('EXPIRE', [strVar,tExpire]);
  return [err,strTmp];
}
app.delRedis=async function(arr){ 
  if(!(arr instanceof Array)) arr=[arr];
  var [err,strTmp]=await cmdRedis('DEL', arr);
  return [err,strTmp];
}


    // closebymarket
  //var StrSuffix=['_Main', '_LoginIdP', '_LoginIdUser', '_UserInfoFrDB', '_Counter'];  var StrCaller=['index'], for(var i=0;i<StrCaller.length;i++){  StrSuffix.push('_CSRFCode'+ucfirst(StrCaller[i])); }
  //var err=await changeSessionId.call(this, sessionIDNew, StrSuffix);
app.changeSessionId=async function(sessionIDNew, StrSuffix){
  for(var i=0;i<StrSuffix.length;i++){
    var strSuffix=StrSuffix[i];
    var redisVarO=this.req.sessionID+strSuffix, redisVarN=sessionIDNew+strSuffix; 
    var [err,value]=await cmdRedis('rename', [redisVarO, redisVarN]); //if(err) return err;
  }
  this.req.sessionID=sessionIDNew;
  return null;
}


app.getIP=function(req){
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

app.luaCountFunc=`
local boSessionExist=redis.call('EXISTS',KEYS[1]);
local c;
if(boSessionExist>0) then c=redis.call('INCR',KEYS[2]); redis.call('EXPIRE',KEYS[2], ARGV[1]);
else c=redis.call('INCR',KEYS[3]); redis.call('EXPIRE', KEYS[3], ARGV[1]);
end;
return c`;



app.CacheUriT=function(){
  this.set=async function(key, buf, type, boZip, boUglify){
    var eTag=md5(buf);
    //if(boUglify) { // UglifyJS does not handle ecma6 (when I tested it 2019-05-05).
      //var objU=UglifyJS.minify(buf.toString());
      //buf=new Buffer(objU.code,'utf8');
    //}
    if(boZip){
      var [err, buf]=await new Promise( resolve=>{  zlib.gzip(buf, (...arg)=>resolve(arg)  ); });
    } else{  var err=null; }
    this[key]={buf,type,eTag,boZip,boUglify};
    return [err,buf];
  }
}

var regFileType=RegExp('\\.([a-z0-9]+)$','i'),    regZip=RegExp('^(css|js|txt|html)$'),   regUglify=RegExp('^js$');
app.readFileToCache=async function(strFileName) {
  var type, Match=regFileType.exec(strFileName);    if(Match && Match.length>1) type=Match[1]; else type='txt';
  var boZip=regZip.test(type),  boUglify=regUglify.test(type);
  var [err, buf]=await fsPromises.readFile(strFileName).toNBP();    if(err) return [err];
  var [err]=await CacheUri.set('/'+strFileName, buf, type, boZip, boUglify);
  return [err];
}

app.makeWatchCB=function(strFolder, StrFile) {
  return function(ev,filename){
    if(StrFile.indexOf(filename)!=-1){
      var strFileName=path.normalize(strFolder+'/'+filename);
      console.log(filename+' changed: '+ev);
      (async function(){ 
        var [err]=await readFileToCache(strFileName); if(err) console.error(err);
      })();
    }
  }
}

app.isRedirAppropriate=function(req){
  if(typeof RegRedir=='undefined') return false;
  for(var i=0;i<RegRedir.length;i++){
    var url=RegRedir[i](req); if(url) return url;
  }
  return false;
}



app.setAccessControlAllowOrigin=function(req, res, RegAllowed){
  if('origin' in req.headers){ //if cross site
    var http_origin=req.headers.origin;
    //var boAllowDbg=boDbg && RegExp("^http\:\/\/(localhost|192\.168\.0)").test(http_origin);
    //var boAllowed=false; for(var i=0;i<RegAllowed.length;i++){ boAllowed=http_origin===RegAllowed[i]; if(boAllowed) break; }
    var boAllowed=false;
    if(RegAllowed.length==0) boAllowed=true;
    else {
      for(var i=0;i<RegAllowed.length;i++){ boAllowed=RegAllowed[i].test(http_origin); if(boAllowed) break; }
    }
    //if(boAllowDbg || http_origin == "https://control.closeby.market" || http_origin == "https://controlclosebymarket.herokuapp.com" || http_origin == "https://emagnusandersson.github.io" ){
    if(boAllowed){
      res.setHeader("Access-Control-Allow-Origin", http_origin);
      res.setHeader("Vary", "Origin"); 
    }
  }
}
//RegAllowedOriginOfStaticFile=[RegExp("^https\:\/\/(control\.closeby\.market|controlclosebymarket\.herokuapp\.com|emagnusandersson\.github\.io)")];
//if(boDbg) RegAllowedOriginOfStaticFile.push(RegExp("^http\:\/\/(localhost|192\.168\.0)"));
//setAccessControlAllowOrigin(res, req, RegAllowedOriginOfStaticFile);
