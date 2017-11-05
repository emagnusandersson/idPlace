

http = require("http");
//https = require('https');
url = require("url");
path = require("path");
fs = require("fs");
mysql =  require('mysql');
gm =  require('gm').subClass({ imageMagick: true });
//im = require('imagemagick');
//temporary = require('tmp');
util =  require('util');
concat = require('concat-stream');
requestMod = require('request');
//through = require('through')
querystring = require('querystring');
//async = require('async');
formidable = require("formidable");
//NodeRSA = require('node-rsa');
crypto = require('crypto');
//tls=require('tls');
//atob = require('atob');
//childProcess = require('child_process');
zlib = require('zlib');
//imageSize = require('image-size');
//Fiber = require('fibers');
//Future = require('fibers/future');
NodeZip=require('node-zip');
//redis = require("then-redis");
redis = require("redis");
//captchapng = require('captchapng');
//sendgrid  = require('sendgrid');
sgMail = require('@sendgrid/mail');
ip = require('ip');
var argv = require('minimist')(process.argv.slice(2));
//UglifyJS = require("uglify-js");
require('./lib.js');
require('./libServerGeneral.js');
require('./libServer.js');
require('./lib/foundOnTheInternet/sha1.js');


strAppName='idPlace';
app=(typeof window==='undefined')?global:window;
extend=util._extend;


strInfrastructure=process.env.strInfrastructure||'local';
boHeroku=strInfrastructure=='heroku'; 
boAF=strInfrastructure=='af'; 
boLocal=strInfrastructure=='local'; 
boDO=strInfrastructure=='do'; 


StrValidSqlCalls=['createTable', 'dropTable', 'createFunction', 'dropFunction', 'truncate', 'createDummy', 'createDummies'];

helpTextExit=function(){
  var arr=[];
  arr.push('USAGE script [OPTION]...');
  arr.push('  -h, --help           Display this text');
  arr.push('  -p, --port [PORT]    Port number (default: 5000)');
  arr.push('  --sql [SQL_ACTION]   Run a sql action.');
  arr.push('    SQL_ACTION='+StrValidSqlCalls.join('|'));
  console.log(arr.join('\n'));
  process.exit(0);
}


    // Set up redisClient
var urlRedis;
if(  (urlRedis=process.env.REDISTOGO_URL)  || (urlRedis=process.env.REDISCLOUD_URL)  ) {
  var objRedisUrl=url.parse(urlRedis),    password=objRedisUrl.auth.split(":")[1];
  var objConnect={host: objRedisUrl.hostname, port: objRedisUrl.port,  password: password};
  //redisClient=redis.createClient(objConnect); // , {no_ready_check: true}
  redisClient=redis.createClient(urlRedis, {no_ready_check: true}); //
}else {
  //var objConnect={host: 'localhost', port: 6379,  password: 'password'};
  redisClient=redis.createClient();
}




//Fiber( function(){
  //var fiber=Fiber.current;

var flow=( function*(){


    // Default config variables
  boDbg=0; boAllowSql=1; port=5000; levelMaintenance=0; googleSiteVerification='googleXXX.html';
  intDDOSMax=100; tDDOSBan=5; 
  strSalt='wqriinnabcradfcpose';
  maxUnactivity=3600*24;
  maxUnactivityToken=120*60;
  leafLoginBack="loginBack.html";
  
  port=argv.p||argv.port||5000;
  if(argv.h || argv.help) {helpTextExit(); return;}


  var strConfig;
  if(boHeroku){ 
    if(!process.env.jsConfig) { console.error('jsConfig-environment-variable is not set'); return;} //process.exit(1);
    strConfig=process.env.jsConfig||'';
  }
  else{
    var err, buf; fs.readFile('./config.js', function(errT, bufT) { err=errT;  buf=bufT;  flow.next();  });  yield;     if(err) {console.error(err); return;}
    strConfig=buf.toString();
    //require('./config.js');    //require('./config.example.js');
  } 
  var strMd5Config=md5(strConfig);
  eval(strConfig);
  var redisVar='str'+ucfirst(strAppName)+'Md5Config';
  var tmp=yield *getRedis(flow, redisVar);
  var boNewConfig=strMd5Config!==tmp; 
  if(boNewConfig) { var tmp=yield *setRedis(flow, redisVar, strMd5Config);  }

  if('levelMaintenance' in process.env) levelMaintenance=process.env.levelMaintenance;


  sgMail.setApiKey(apiKeySendGrid);
  //objSendgrid  = sendgrid(sendgridName, sendgridPassword);

  SiteName=Object.keys(Site);

  require('./variablesCommon.js');
  require('./libReqBE.js');
  require('./libReq.js'); 

  setUpMysqlPool();
  SiteExtend();

    // Do db-query if --sql XXXX was set in the argument
  if(typeof argv.sql!='undefined'){
    if(typeof argv.sql!='string') {console.log('sql argument is not a string'); process.exit(-1); return; }
    var tTmp=new Date().getTime();
    var objSetupSql=new SetupSql(); yield *objSetupSql.doQuery(flow, argv.sql);
    console.log('Time elapsed: '+(new Date().getTime()-tTmp)/1000+' s'); 
    process.exit(0);
  }

  tIndexMod=new Date(); tIndexMod.setMilliseconds(0);

  ETagImage={};

  regexpLib=RegExp('^/(stylesheets|lib|Site)/');
  regexpLooseJS=RegExp('^/(lib|libClient|client|filter|common)\\.js'); //siteSpecific

  CacheUri=new CacheUriT();
  StrFilePreCache=['lib.js', 'libClient.js', 'client.js', 'stylesheets/style.css'];
  for(var i=0;i<StrFilePreCache.length;i++) {
    var filename=StrFilePreCache[i];
    var [err]=yield *readFileToCache(flow, filename); if(err) {  console.error(err);  return;}
  }
  
  if(boDbg){
    fs.watch('.', makeWatchCB('.', ['client.js','libClient.js']) );
    fs.watch('stylesheets', makeWatchCB('stylesheets', ['style.css']) );
  }


  handler=function(req, res){
    //Fiber( function(){
      //var fiber=Fiber.current; 
    req.flow=(function*(){
      if(typeof isRedirAppropriate!='undefined'){ 
        var tmpUrl=isRedirAppropriate(req); if(tmpUrl) { res.out301(tmpUrl); return; }
      }
    
      var cookies = parseCookies(req);
      var sessionID;  if('sessionID' in cookies) sessionID=cookies.sessionID; else { sessionID=randomHash();   res.setHeader("Set-Cookie", "sessionID="+sessionID+"; SameSite=Lax"); }  //+ " HttpOnly" 



      var ipClient=getIP(req);
      var redisVarSession=sessionID+'_Main';
      var redisVarCounter=sessionID+'_Counter', redisVarCounterIP=ipClient+'_Counter'; 


        // get intCount
      var semY=0, semCB=0, err, intCount;
      var tmp=redisClient.send_command('eval',[luaCountFunc, 3, redisVarSession, redisVarCounter, redisVarCounterIP, tDDOSBan], function(errT,intCountT){
        err=errT; intCount=intCountT; if(semY) { req.flow.next(); } semCB=1;
      });
      if(!semCB) { semY=1; yield;}
      if(err) {console.log(err); return;}
      if(intCount>intDDOSMax) {res.outCode(429,"Too Many Requests ("+intCount+"), wait "+tDDOSBan+"s\n"); return; }
  
      
      var domainName=req.headers.host; 
      var objUrl=url.parse(req.url), qs=objUrl.query||'', objQS=querystring.parse(qs),  pathNameOrg=objUrl.pathname;
      var wwwReq=domainName+pathNameOrg;
      var tmp=Site.getSite(wwwReq);  
      if(!tmp){ res.out404("404 Nothing at that url\n"); return; }
      var siteName=tmp.siteName, wwwSite=tmp.wwwSite, pathName=wwwReq.substr(wwwSite.length); if(pathName.length==0) pathName='/';
      var site=Site[siteName];


      if(boHeroku && site.boTLS && req.headers['x-forwarded-proto']!='https') {
        if(pathName=='/' && qs.length==0) {        res.out301('https://'+req.headers.host); return; }
        else { res.writeHead(400);  res.end('You must use https'); return;}
      }

 
      var strScheme='http'+(site.boTLS?'s':''),  strSchemeLong=strScheme+'://';


      if(boDbg) console.log(req.method+' '+pathName);
 

      req.wwwSite=wwwSite;
      req.sessionID=sessionID; req.objUrl=objUrl; req.objQS=objQS; req.strSchemeLong=strSchemeLong;   req.site=site;  req.pathName=pathName;     req.siteName=siteName;
      req.rootDomain=RootDomain[site.strRootDomain];

      var objReqRes={req:req, res:res};
      if(pathName.substr(0,5)=='/sql/'){
        if(!boDbg && !boAllowSql){ res.out200('Set boAllowSql=1 (or boDbg=1) in the config.js-file');  return }
        var reqSql=new ReqSql(req, res),  objSetupSql=new SetupSql();
        req.pathNameWOPrefix=pathName.substr(5);
        if(req.pathNameWOPrefix=='zip'){       reqSql.createZip(objSetupSql);     }
        else {  reqSql.toBrowser(objSetupSql); }             
      }
      else {
        if(levelMaintenance){res.outCode(503, "Down for maintenance, try again in a little while."); return;}
        if(pathName=='/'+leafBE){  var reqBE=new ReqBE(req, res);  yield* reqBE.go();    }
        else if(pathName=='/' ){  yield* reqIndex.call(objReqRes);    }
        else if(pathName.indexOf('/image/')==0){  yield* reqImage.call(objReqRes);   } //RegExp('^/image/').test(pathName)
        //else if(pathName=='/captcha.png'){  yield* reqCaptcha.call(objReqRes);   }
        else if(regexpLib.test(pathName) || regexpLooseJS.test(pathName)  || pathName=='/conversion.html'){   yield* reqStatic.call(objReqRes);   }
        else if(pathName=='/'+leafLoginBack){    yield* reqLoginBack.call(objReqRes);   }
        else if(pathName=='/access_token' ){  yield* reqToken.call(objReqRes);   }
        else if(pathName=='/me' ){  yield* reqMe.call(objReqRes);   }
        else if(pathName=='/'+leafVerifyEmailReturn ){  yield* reqVerifyEmailReturn.call(objReqRes);   }
        else if(pathName=='/'+leafVerifyPWResetReturn ){  yield* reqVerifyPWResetReturn.call(objReqRes);   }
        else if(pathName=='/monitor.html'){  yield* reqMonitor.call(objReqRes);   }
        else if(pathName=='/stat.html'){  yield* reqStat.call(objReqRes);   }
        else if(pathName=='/createDumpCommand'){  var str=createDumpCommand(); res.out200(str);     }
        else if(pathName=='/debug'){    debugger;  res.end();}
        else if(pathName=='/'+googleSiteVerification) res.end('google-site-verification: '+googleSiteVerification);
        else {res.out404("404 Not Found\n"); return; }
      }
    })(); req.flow.next();
    //}).run();
  }




  http.createServer(handler).listen(port);   console.log("Listening to HTTP requests at port " + port);

})(); flow.next();
//}).run();






