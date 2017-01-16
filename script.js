

http = require("http");
https = require('https');
url = require("url");
path = require("path");
fs = require("fs");
mysql =  require('mysql');
gm =  require('gm').subClass({ imageMagick: true });
im = require('imagemagick');
temporary = require('tmp');
util =  require('util');
concat = require('concat-stream');
requestMod = require('request');
through = require('through')
querystring = require('querystring');
//async = require('async');
formidable = require("formidable");
NodeRSA = require('node-rsa');
crypto = require('crypto');
tls=require('tls');
atob = require('atob');
childProcess = require('child_process');
zlib = require('zlib');
imageSize = require('image-size');
Fiber = require('fibers');
Future = require('fibers/future');
NodeZip=require('node-zip');
//redis = require("then-redis");
redis = require("redis");
captchapng = require('captchapng');
sendgrid  = require('sendgrid');
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


interpretArgv=function(){
  var myArg=process.argv.slice(2);
  for(var i=0;i<myArg.length;i++){
    var Match=RegExp("^(-{1,2})([^-\\s]+)$").exec(myArg[i]);
    if(Match[1]=='-') {
      var tmp=Match[2][0];
      if(tmp=='p') port=Match[2].substr(1);
      else if(tmp=='h') helpTextExit();
    }else if(Match[1]=='--') {
      var tmp=Match[2], tmpSql='sql';
      if(tmp.slice(0,tmpSql.length)==tmpSql) strCreateSql=Match[2].substr(tmpSql.length).toLowerCase();
      else if(tmp=='help') helpTextExit();
    }
  }
}

helpTextExit=function(){
  var arr=[];
  arr.push('USAGE script [OPTION]...');
  arr.push('\t-h, --help\t\tDisplay this text');
  arr.push('\t-p[PORT]\t\tPort number (default: 5000)');
  arr.push('\t--sql[SQL_ACTION]\tRun a sql action.');
  var StrValid=['table', 'dropTable', 'fun', 'dropFun', 'truncate', 'dummy', 'dummies'];
  arr.push('\t\tSQL_ACTION='+StrValid.join('|'));
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




Fiber( function(){
  var fiber=Fiber.current;


    // Default config variables
  boDbg=0; boAllowSql=1; port=5000; levelMaintenance=0; googleSiteVerification='googleXXX.html';
  intDDOSMax=100; tDDOSBan=5; 
  strSalt='wqriinnabcradfcpose';
  maxUnactivity=3600*24;
  maxUnactivityToken=120*60;
  leafLoginBack="loginBack.html";
  interpretArgv();

  var strConfig;
  if(boHeroku){ 
    if(!process.env.jsConfig) { console.log('jsConfig-environment-variable is not set'); process.exit(1);}
    strConfig=process.env.jsConfig||'';
  }
  else{
    fs.readFile('./config.js', function(errT, bufT) { //, this.encRead
      if(errT){  console.log(errT); }
      strConfig=bufT.toString();
      fiber.run();
    });
    Fiber.yield();
    //require('./config.js');    //require('./config.example.js');
  } 

  var strMd5Config=md5(strConfig);
  eval(strConfig);
  var redisVar='str'+ucfirst(strAppName)+'Md5Config';
  var tmp=wrapRedisSendCommand('get',[redisVar]);
  var boNewConfig=strMd5Config!==tmp; 
  if(boNewConfig) { var tmp=wrapRedisSendCommand('set',[redisVar,strMd5Config]);  }

  if('levelMaintenance' in process.env) levelMaintenance=process.env.levelMaintenance;

  objSendgrid  = sendgrid(sendgridName, sendgridPassword);

  SiteName=Object.keys(Site);

  require('./variablesCommon.js');
  require('./libReqBE.js');
  require('./libReq.js'); 

  setUpMysqlPool();
  SiteExtend();

    // Do db-query if --sqlXXXX was set in the argument
  if(typeof strCreateSql!='undefined'){
    var tTmp=new Date().getTime();
    var objSetupSql=new SetupSql(); objSetupSql.doQuery(strCreateSql);
    console.log('Time elapsed: '+(new Date().getTime()-tTmp)/1000+' s'); 
    process.exit(0);
  }

  bootTime=new Date();  strBootTime=bootTime.toISOStringMy();

  ETagUri={}; CacheUri={};
  ETagImage={};

  regexpLib=RegExp('^/(stylesheets|lib|Site)/');
  regexpLooseJS=RegExp('^/(lib|libClient|client|filter|common)\\.js'); //siteSpecific


  StrFilePreCache=['lib.js', 'libClient.js', 'client.js', 'stylesheets/style.css'];
  if(boDbg){
    fs.watch('.',function (ev,filename) {
      var StrFile=['client.js'];
        //console.log(filename+' changed: '+ev);
      if(StrFile.indexOf(filename)!=-1){
        console.log(filename+' changed: '+ev);
        Fiber( function(){ 
          var err=readFileToCache(filename); if(err) console.log(err.message);
        }).run();
      }
    });
    fs.watch('stylesheets',function (ev,filename) {
      var StrFile=['style.css'];
        //console.log(filename+' changed: '+ev);
      if(StrFile.indexOf(filename)!=-1){
        console.log(filename+' changed: '+ev);
        Fiber( function(){ 
          var err=readFileToCache('stylesheets/'+filename); if(err) console.log(err.message);
        }).run();
      }
    });
  }

  CacheUri=new CacheUriT();
  for(var i=0;i<StrFilePreCache.length;i++) {
    var filename=StrFilePreCache[i];
    var err=readFileToCache(filename); if(err) {  console.log(err.message);  return;}
  }

   

  handler=function(req, res){
    Fiber( function(){
      var fiber=Fiber.current; 
      if(typeof isRedirAppropriate!='undefined'){ 
        var tmpUrl=isRedirAppropriate(req); if(tmpUrl) { res.out301(tmpUrl); return; }
      }
    
      var cookies = parseCookies(req);
      var sessionID;  if('sessionID' in cookies) sessionID=cookies.sessionID; else { sessionID=randomHash();   res.setHeader("Set-Cookie", "sessionID="+sessionID); }  //+ " HttpOnly" 


      var ipClient=getIP(req);
      var redisVarSession=sessionID+'_Main';
      var redisVarCounter=sessionID+'_Counter', redisVarCounterIP=ipClient+'_Counter'; 


        // get intCount
      var semY=0, semCB=0, intCount;
      //var tmp=redisClient.send('eval',[luaCountFunc, 3, redisVarSession, redisVarCounter, redisVarCounterIP, tDDOSBan]).then(function(intCountT){
      var tmp=redisClient.send_command('eval',[luaCountFunc, 3, redisVarSession, redisVarCounter, redisVarCounterIP, tDDOSBan], function(err,intCountT){
        intCount=intCountT;
        if(semY) { fiber.run(); } semCB=1;
      });
      if(!semCB) { semY=1; Fiber.yield();}
      if(intCount>intDDOSMax) {res.outCode(429,"Too Many Requests, wait "+tDDOSBan+"s\n"); return; }


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


      if(pathName.substr(0,5)=='/sql/'){
        if(!boDbg && !boAllowSql){ res.out200('Set boAllowSql=1 (or boDbg=1) in the config.js-file');  return }
        var reqSql=new ReqSql(req, res),  objSetupSql=new SetupSql();
        req.pathNameWOPrefix=pathName.substr(5);
        if(req.pathNameWOPrefix=='zip'){       reqSql.createZip(objSetupSql);     }
        else {  reqSql.toBrowser(objSetupSql); }             
      }
      else {
        if(levelMaintenance){res.outCode(503, "Down for maintenance, try again in a little while."); return;}
        if(pathName=='/'+leafBE){  var reqBE=new ReqBE(req, res);  reqBE.go();    }
        else if(pathName=='/' ){  var reqIndex=new ReqIndex(req, res);    reqIndex.go();    }
        else if(pathName.indexOf('/image/')==0){  var reqImage=new ReqImage(req, res); reqImage.go();   } //RegExp('^/image/').test(pathName)
        else if(pathName=='/captcha.png'){  var reqCaptcha=new ReqCaptcha(req, res);    reqCaptcha.go();    }
        else if(regexpLib.test(pathName) || regexpLooseJS.test(pathName)  || pathName=='/conversion.html'){   var reqStatic=new ReqStatic(req, res);      reqStatic.go();   }
        else if(pathName=='/'+leafLoginBack){    var reqLoginBack=new ReqLoginBack(req, res);  reqLoginBack.go();    }
        else if(pathName=='/access_token' ){  var reqToken=new ReqToken(req, res);    reqToken.go();    }
        else if(pathName=='/me' ){  var reqMe=new ReqMe(req, res);    reqMe.go();    }
        else if(pathName=='/'+leafVerifyEmailReturn ){  var reqT=new ReqVerifyEmailReturn(req, res);    reqT.go();    }
        else if(pathName=='/'+leafVerifyPWResetReturn ){  var reqT=new ReqVerifyPWResetReturn(req, res);    reqT.go();    }
        //else if(pathName=='/auth' ){  var reqAuth=new ReqAuth(req, res);    reqAuth.go();    }
        else if(pathName=='/monitor.html'){  var reqMonitor=new ReqMonitor(req, res);      reqMonitor.go();  }
        else if(pathName=='/stat.html'){  var reqStat=new ReqStat(req, res);      reqStat.go();  }
        else if(pathName=='/createDumpCommand'){  var str=createDumpCommand(); res.out200(str);     }
        else if(pathName=='/debug'){    debugger;  res.end();}
        else if(pathName=='/'+googleSiteVerification) res.end('google-site-verification: '+googleSiteVerification);
        else {res.out404("404 Not Found\n"); return; }
      }
    }).run();
  }




  http.createServer(handler).listen(port);   console.log("Listening to HTTP requests at port " + port);

}).run();






