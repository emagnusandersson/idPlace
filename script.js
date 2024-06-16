

global.app=global;
import http from "http";
import https from 'https';
import url from "url";
import path from "path";
import fs, {promises as fsPromises} from "fs";
import mysql from 'mysql';
import concat from 'concat-stream';
import fetch from 'node-fetch';
import formidable from "formidable";
import myCrypto from 'crypto';
import zlib from 'zlib';
//import redis from "redis";
import Redis from "ioredis";
import Streamify from 'streamify-string';
import serialize from 'serialize-javascript';
import validator from 'validator';
import mime from "mime";
import minimist from 'minimist';
//import sgMail from '@sendgrid/mail';
import ip from 'ip';
import gmTmp from 'gm';
app.gm=gmTmp.subClass({ imageMagick: true });
import nodemailer from 'nodemailer';
//UglifyJS from "uglify-js";

app.extend=Object.assign;
extend(app, {http, url, path, fsPromises, mysql, concat, fetch, formidable, myCrypto, zlib, Streamify, serialize, validator, mime, ip, gm}); //, sgMail

var argv = minimist(process.argv.slice(2));

await import('./lib.js');
await import('./libServerGeneral.js');
await import('./libServer.js');
await import('./lib/foundOnTheInternet/sha1.js');


app.strAppName='idPlace';


var strInfrastructure=process.env.strInfrastructure||'local';
app.boHeroku=strInfrastructure=='heroku'; 
app.boAF=strInfrastructure=='af'; 
app.boLocal=strInfrastructure=='local'; 
app.boDO=strInfrastructure=='do'; 


app.StrValidSqlCalls=['createTable', 'dropTable', 'createFunction', 'dropFunction', 'truncate', 'createDummy', 'createDummies'];

app.helpTextExit=function(){
  var arr=[];
  arr.push('USAGE script [OPTION]...');
  arr.push('  -h, --help           Display this text');
  arr.push('  -p, --port [PORT]    Port number (default: 5000)');
  arr.push('  --sql [SQL_ACTION]   Run a sql action.');
  arr.push('    SQL_ACTION='+StrValidSqlCalls.join('|'));
  console.log(arr.join('\n'));
  process.exit(0);
}

var StrUnknown=AMinusB(Object.keys(argv),['_', 'h', 'help', 'p', 'port', 'sql']);
var StrUnknown=[].concat(StrUnknown, argv._);
if(StrUnknown.length){ console.log('Unknown arguments: '+StrUnknown.join(', ')); helpTextExit(); }


  // Set up redisClient
// var urlRedis=process.env.REDIS_URL;
// if(  urlRedis ) {
//   app.redisClient=redis.createClient(urlRedis, {no_ready_check: true}); //
// }else { app.redisClient=redis.createClient();}

var REDIS_URL="redis://localhost:6379"
app.redis = new Redis(REDIS_URL);


  // Default config variables (If you want to change them you can for example create a file config.js and overwrite them there)
extend(app, {boDbg:0, boAllowSql:1, port:5000, levelMaintenance:0, googleSiteVerification:'googleXXX.html',
  boRequireTLD:0,
  intDDOSMax:100, // intDDOSMax: How many requests before DDOSBlocking occurs. 
  tDDOSBan:5, // tDDOSBan: How long in seconds til the blocking is lifted
  intDDOSIPMax:200, // intDDOSIPMax: How many requests before DDOSBlocking occurs. 
  tDDOSIPBan:10, // tDDOSIPBan: How long in seconds til the blocking is lifted
  maxUnactivity:3600*24,  // _Main, _CSRFCodeIndex
  //maxUnactivityToken:120*60,
  leafLoginBack:"loginBack.html",
  boUseSelfSignedCert:false,
  //wseIconRootDefault:"/lib/image/Icon/blackWhite/",
  wsIconDefaultProt:"/Site/Icon/iconWhite<size>.png",
  timeOutDeleteStatusInfo:3600,
  strSalt:'abcdefghijklmnopqrstuvwxyz', // Random letters to prevent that the hashed passwords looks the same as on other sites.
  strSaltID:'abcdefghijklmnopqrstuvwxyz', // Random letters to prevent that the hashed IDs can be predicted.
  UrlOAuth:null,
  UrlToken:null,
  UrlGraph:null, 
  response_type:'code',
  strIPPrim:'fb',  strIPAlt:'google',
  //apiKeySendGrid:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  emailRegisterdUser:"mail@example.com",
  strReCaptchaSiteKey:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  strReCaptchaSecretKey:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  RootDomain:null,
  Site:null,
  RegRedir:null,
  uriDB:""
});



port=argv.p||argv.port||5000;
if(argv.h || argv.help) {helpTextExit(); }


var strConfig;
if(boHeroku){ 
  if(!process.env.jsConfig) { console.error('jsConfig-environment-variable is not set'); process.exit(-1);} 
  strConfig=process.env.jsConfig||'';
}
else{
  var [err, buf]=await fsPromises.readFile('./config.js').toNBP();    if(err) {console.error(err); process.exit(-1);}
  strConfig=buf.toString();
} 
var strMd5Config=md5(strConfig);
eval(strConfig);
if(typeof strSalt=='undefined') {console.error("typeof strSalt=='undefined'"); process.exit(-1); }

var keyR=`str${ucfirst(strAppName)}Md5Config`;
var [err,tmp] =await getRedis(keyR); if(err) {console.error(err); process.exit(-1);}
var boNewConfig=strMd5Config!==tmp; 
if(boNewConfig) { var tmp=await setRedis(keyR, strMd5Config);  }

if('levelMaintenance' in process.env) levelMaintenance=process.env.levelMaintenance;


//sgMail.setApiKey(apiKeySendGrid);
app.smtpTransport=nodemailer.createTransport({
  host:'smtp-relay.sendinblue.com',
  port:587,
  auth:objSendinblueAuth
})

app.SiteName=Object.keys(Site);

await import('./variablesCommon.js');
await import('./libReqBE.js');
await import('./libReq.js'); 

app.mysqlPool=setUpMysqlPool();
SiteExtend();

  // Do db-query if --sql XXXX was set in the argument
if(typeof argv.sql!='undefined'){
  if(typeof argv.sql!='string') {console.log('sql argument is not a string'); process.exit(-1); }
  var tTmp=new Date().getTime();
  var setupSql=new SetupSql();
  setupSql.myMySql=new MyMySql(mysqlPool);
  var [err]=await setupSql.doQuery(argv.sql);
  setupSql.myMySql.fin();
  if(err) {  console.error(err);  process.exit(-1);}
  console.log('Time elapsed: '+(new Date().getTime()-tTmp)/1000+' s'); 
  process.exit(0);
}

// var tIndexMod=new Date(); tIndexMod.setMilliseconds(0);

app.ETagImage={};

var regexpLib=RegExp('^/(stylesheets|lib|Site)/');
var regexpLooseJS=RegExp('^/(lib|libClient|client|filter|common)\\.js'); //siteSpecific

app.CacheUri=new CacheUriT();
var StrFilePreCache=['lib.js', 'libClient.js', 'client.js', 'stylesheets/style.css'];
for(var i=0;i<StrFilePreCache.length;i++) {
  var filename=StrFilePreCache[i];
  var [err]=await readFileToCache(filename); if(err) {  console.error(err);  process.exit(-1);}
}

  // Write manifest to Cache
var [err]=await createManifestNStoreToCacheMult(SiteName); if(err) {  console.error(err.message);  process.exit(-1);}


if(boDbg){
  fs.watch('.', makeWatchCB('.', ['client.js','libClient.js']) );
  fs.watch('stylesheets', makeWatchCB('stylesheets', ['style.css']) );
}





var tLoginTimeout=300;

const objCookiePropProt={"HttpOnly":1, Path:"/", "Max-Age":3600*24*30, "SameSite":"Lax"};
if(!boLocal || boUseSelfSignedCert) objCookiePropProt["Secure"]=1;
var oTmp=extend({},objCookiePropProt); 
oTmp["SameSite"]="None"; app.strCookiePropNormal=";"+arrayifyCookiePropObj(oTmp).join(';');
oTmp["SameSite"]="Lax"; app.strCookiePropLax=";"+arrayifyCookiePropObj(oTmp).join(';');
oTmp["SameSite"]="Strict"; app.strCookiePropStrict=";"+arrayifyCookiePropObj(oTmp).join(';');

var oTmp=extend({},objCookiePropProt); 
oTmp["Max-Age"]=tLoginTimeout; var str1=";"+arrayifyCookiePropObj(oTmp).join(';');
oTmp["Max-Age"]=0; var str0=";"+arrayifyCookiePropObj(oTmp).join(';');
app.StrSessionIDLoginProp=[str0,str1];



var luaDDosCounterFun=`local c=redis.call('INCR',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`
redis.defineCommand("myDDosCounterFun", { numberOfKeys: 1, lua: luaDDosCounterFun });

var luaGetNExpire=`local c=redis.call('GET',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`;
//var luaGetNExpire=`local c=redis.call('GET',KEYS[1]); if(c) then redis.call('EXPIRE',KEYS[1], ARGV[1]); end; return c`;
redis.defineCommand("myGetNExpire", { numberOfKeys: 1, lua: luaGetNExpire });




const handler=async function(req, res){
    // If isRedirAppropriate
  if(typeof isRedirAppropriate!='undefined'){   var uTmp=isRedirAppropriate(req); if(uTmp){res.out301(uTmp); return;}   }

    // Set boTLS
  var boTLS=false;
  if(boHeroku || boAF) {
    const strTmp=req.headers['x-forwarded-proto']
    if(strTmp=='https') boTLS=true;
  }
  else if(boDO) { boTLS=true; }
  else if(boLocal) { if(app.boUseSelfSignedCert) boTLS=true;}

    // Setting some headers
  //res.setHeader("X-Frame-Options", "deny");  // Deny for all (note: this header is removed for images (see reqMediaImage) (should also be removed for videos))
  res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");  // Deny for all (note: this header is removed in certain requests
  res.setHeader("X-Content-Type-Options", "nosniff");  // Don't try to guess the mime-type (I prefer the rendering of the page to fail if the mime-type is wrong)
  if(!boLocal || boUseSelfSignedCert) res.setHeader("Strict-Transport-Security", "max-age="+3600*24*365); // All future requests must be with https (forget this after a year)
  res.setHeader("Referrer-Policy", "origin");  //  Don't write the refer unless the request comes from the origin
  

    // Extract qs, objQS
  var objUrl=url.parse(req.url), qs=objUrl.query||'', objQS=parseQS2(qs)



    // Extract siteName, wwwSite
  var domainName=req.headers.host;
  var pathNameOrg=objUrl.pathname;
  var wwwReq=domainName+pathNameOrg;

  var {siteName,wwwSite}=Site.getSite(wwwReq);  
  if(!siteName){ res.out404("404 Nothing at that url\n"); return; }
  var pathName=wwwReq.substr(wwwSite.length); if(pathName.length==0) pathName='/';
  var site=Site[siteName];

  if(boDbg) console.log(req.method+' '+pathName);

  var cookies=req.cookies=parseCookies(req);
  

    //
    // sessionIDDDos cookie
    //

    // Assign boCookieDDOSCameNExist
  let boCookieDDOSCameNExist=false;
  let {sessionIDDDos=null}=cookies, keyR_DDOS;
  if(sessionIDDDos) {
    keyR_DDOS=sessionIDDDos+'_DDOS';
    let [err, tmp]=await existsRedis(keyR_DDOS); boCookieDDOSCameNExist=tmp;
  }
    // If !boCookieDDOSCameNExist then create a new sessionIDDDos (and keyR_DDOS).
  if(!boCookieDDOSCameNExist) { sessionIDDDos=randomHash();  keyR_DDOS=sessionIDDDos+'_DDOS'; }
    // Update keyR_DDOS counter
  var [err, intCount]=await redis.myDDosCounterFun(keyR_DDOS, tDDOSBan).toNBP();
    // Write to response
  res.replaceCookie("sessionIDDDos="+sessionIDDDos+strCookiePropNormal);

    // Update keyR_DDOSIP counter
  let ipClient=getIP(req), keyR_DDOSIP=ipClient+'_DDOS';
  var [err, intCountIP]=await redis.myDDosCounterFun(keyR_DDOSIP, tDDOSIPBan).toNBP();
  
    // Determine which DDOS counter to use
  let [intCountT, intDDOSMaxT, tDDOSBanT]=boCookieDDOSCameNExist?[intCount, intDDOSMax, tDDOSBan]:[intCountIP, intDDOSIPMax, tDDOSIPBan]
  
    // If the counter is to high, then respond with 429
  if(intCountT>intDDOSMaxT) {
    let strMess=`Too Many Requests (${intCountT}), wait ${tDDOSBanT}s\n`;
    if(pathName=='/'+leafBE){ let reqBE=new ReqBE({req, res}); reqBE.mesEO(strMess, 429); }
    else res.outCode(429, strMess);
    return;
  }


    //
    // sessionID cookie
    //

    // Check if a valid sessionID-cookie came in
  req.boGotSessionCookie=false;
  var boSessionCookieInInput='sessionID' in cookies, sessionID=null, keyR_Main;
  if(boSessionCookieInInput) {
    sessionID=cookies.sessionID;  keyR_Main=sessionID+'_Main';
    var [err, tmp]=await existsRedis(keyR_Main); req.boGotSessionCookie=tmp;
  } 
  
  if(!req.boGotSessionCookie){ sessionID=randomHash();  keyR_Main=sessionID+'_Main'; }
  
  res.replaceCookie("sessionID="+sessionID+strCookiePropLax);
  
      // Refresh / create  keyR_Main
  if(req.boGotSessionCookie){
    //var [err, value]=await cmdRedis('EVAL',[luaGetNExpire, 1, keyR_Main, maxUnactivity]); req.sessionCache=JSON.parse(value)
    var [err, value]=await redis.myGetNExpire(keyR_Main, maxUnactivity).toNBP(); req.sessionCache=JSON.parse(value);
  
  } else { 
    await setRedis(keyR_Main, {}, maxUnactivity); 
    req.sessionCache={};
  }
  


    // Set mimetype if the extention is recognized
  var regexpExt=RegExp('\.([a-zA-Z0-9]+)$');
  var Match=pathName.match(regexpExt), strExt; if(Match) strExt=Match[1];
  if(strExt in MimeType) res.setHeader('Content-type', MimeType[strExt]);


  var strScheme='http'+(boTLS?'s':''),   strSchemeLong=strScheme+'://';
  var uSite=strSchemeLong+wwwSite;

  extend(req, {objUrl, objQS, boTLS, strSchemeLong, uSite, wwwSite, site, pathName, siteName, sessionID, rootDomain:RootDomain[site.strRootDomain]});

  var objReqRes={req, res};
  objReqRes.myMySql=new MyMySql(mysqlPool);
  if(levelMaintenance){res.outCode(503, "Down for maintenance, try again in a little while."); return;}
  if(pathName=='/'+leafBE){  var reqBE=new ReqBE(objReqRes);  await reqBE.go();    }
  else if(pathName=='/' ){  await reqIndex.call(objReqRes);    }
  else if(pathName.indexOf('/image/')==0){  await reqImage.call(objReqRes);   } //RegExp('^/image/').test(pathName)
  //else if(pathName=='/captcha.png'){  await reqCaptcha.call(objReqRes);   }
  else if(regexpLib.test(pathName) || regexpLooseJS.test(pathName)  || pathName=='/conversion.html' || pathName=='/'+leafManifest){
    if(pathName=='/conversion.html') res.removeHeader("Content-Security-Policy");
    await reqStatic.call(objReqRes);
  }
  else if(pathName=='/'+leafLoginBack){    await reqLoginBack.call(objReqRes);   }
  else if(pathName=='/access_token' ){  await reqToken.call(objReqRes);   }
  else if(pathName=='/me' ){  await reqMe.call(objReqRes);   }
  else if(pathName=='/'+leafVerifyEmailReturn ){  await reqVerifyEmailReturn.call(objReqRes);   }
  else if(pathName=='/'+leafVerifyPWResetReturn ){  await reqVerifyPWResetReturn.call(objReqRes);   }
  else if(pathName=='/'+leafDataDelete){  await reqDataDelete.call(objReqRes);  }
  else if(pathName=='/'+leafDataDeleteStatus){  await reqDataDeleteStatus.call(objReqRes);  }
  //else if(pathName=='/'+leafDeAuthorize){  await reqDeAuthorize.call(objReqRes);  }
  else if(pathName=='/monitor.html'){  await reqMonitor.call(objReqRes);   }
  else if(pathName=='/stat.html'){  await reqStat.call(objReqRes);   }
  else if(pathName=='/createDumpCommand'){  var str=createDumpCommand(); res.out200(str);     }
  else if(pathName=='/debug'){    debugger;  res.end();}
  else if(pathName=='/'+googleSiteVerification) res.end('google-site-verification: '+googleSiteVerification);
  else {res.out404("404 Not Found\n"); return; }
  objReqRes.myMySql.fin();
  
    
  
}



if(boUseSelfSignedCert){
  //const options = { key: fs.readFileSync('0SelfSignedCert/server.key'), cert: fs.readFileSync('0SelfSignedCert/server.cert') };

  var [err, buf]=await fsPromises.readFile('0SelfSignedCert/server.key').toNBP(); if(err) {console.error(err); process.exit(-1);}
  var key=buf.toString();
  var [err, buf]=await fsPromises.readFile('0SelfSignedCert/server.cert').toNBP(); if(err) {console.error(err); process.exit(-1);}
  var cert=buf.toString();
  const options= {key, cert};

  https.createServer(options, handler).listen(port);   console.log("Listening to HTTPS requests at port " + port);
} else{
  http.createServer(handler).listen(port);   console.log("Listening to HTTP requests at port " + port);
}








