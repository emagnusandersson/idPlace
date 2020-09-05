


"use strict"


/******************************************************************************
 * reqIndex
 ******************************************************************************/
app.reqIndex=function*() {
  var req=this.req, flow=req.flow, res=this.res, sessionID=req.sessionID;
  var objQS=req.objQS;
  var site=req.site, siteName=site.siteName, wwwSite=req.wwwSite;

  //var redisVar=req.sessionID+'_Cache';
  //this.sessionCache=yield *getRedis(flow, redisVar, true);
  //if(!this.sessionCache || typeof this.sessionCache!='object') { 
      //this.sessionCache={};   yield* delRedis(flow, redisVar);
  //}  
  //var tmp=yield* expireRedis(flow, redisVar, maxUnactivity);
   

  var boAuthReq=Boolean(Object.keys(objQS).length);

  var idApp=null, scopeAsked='';
  if(boAuthReq){
    var StrNeeded=['response_type', 'client_id', 'redirect_uri', 'scope'];
    for(var i=0;i<StrNeeded.length;i++){
      var tmp=StrNeeded[i]; if(!(tmp in objQS)) { res.out200('The parameter '+tmp+' is required'); return;}
    }
    if(!isNumber(objQS.client_id)) { debugger; res.out200('client_id must be a number'); return;}
    var idApp=Number(objQS.client_id);
    //scopeShortAsked=scopeTranslator.oauth2dbF(objQS.scope); 
    scopeAsked=objQS.scope; 
    if(objQS.response_type!='token' && objQS.response_type!='code') { res.out200('response_type must be "token" or "code"'); return;}
  }

  
  
  //var idUser=null; if(typeof this.sessionCache=='object' && 'idUser' in this.sessionCache) idUser=this.sessionCache.idUser;
  var idUser=req.sessionCache.idUser;

  var Sql=[], Val=[];
  Sql.push("CALL "+siteName+"getUserAppInfo(?,?);"); Val.push(idUser, idApp);

  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
  
  var userInfoFrDB={};
  if(results[0].length)  {  
    delete results[0][0].idUser;
    userInfoFrDB=results[0][0];
    //if(results[1].length) userInfoFrDB.imageHash=results[1][0].imageHash;
  } else{
    if(idUser) { 
      req.sessionCache={}; //yield* delRedis(flow, req.sessionID+'_Cache');
      yield* setRedis(flow, req.sessionID+'_Cache', req.sessionCache, maxUnactivity);
      idUser=null;
    }
    //res.out500("User not found (try reload)");  return;
  }

  
  var objApp=null; if(results[1].length) objApp=results[1][0];  // name, created, redir_uri, imageHash
  var objUApp=null; if(results[2].length) objUApp=results[2][0];  //scope, tAccess, access_token, maxUnactivityToken, code
  if(boAuthReq){
    if(!objApp) { res.out200('No app with that client_id'); return; }

    var urlT=decodeURIComponent(objQS.redirect_uri);
    var regUrlCompare=RegExp("^[^#]+"), Match=regUrlCompare.exec(urlT), urlIn=Match[0];
    var boRedirURIOK=objApp.redir_uri==urlIn;
    if(!boRedirURIOK) { res.out200('The redir_uri you asked for: '+urlIn+', The registered redir_uri: '+objApp.redir_uri); return; }

    if(objUApp){
      if(objQS.response_type=='token') {
        var uRedir=createUriRedir(urlIn, objQS.state, objUApp.access_token, objUApp.maxUnactivityToken); //120*60
      }else if(objQS.response_type=='code'){
        var uRedir=createUriRedirCode(urlIn, objQS.state, objUApp.code);
      }

      var scopeGranted=objUApp.scope;  
      var boScopeOK=isScopeOK(scopeGranted,scopeAsked);
      var boRerequest=objQS.auth_type=='rerequest';
      var boShowForm=boRerequest||!boScopeOK;
      if(!boShowForm) {
        //if(objQS.response_type=='token'){  res.out301(uRedir);   } else { res.out501();  } 
        res.out301(uRedir);
        return;
      }
    }
  }
  

  var ua=req.headers['user-agent']||''; ua=ua.toLowerCase();
  var boMSIE=RegExp('msie').test(ua);
  var boAndroid=RegExp('android').test(ua);
  var boFireFox=RegExp('firefox').test(ua);
  //var boIOS= RegExp('iPhone|iPad|iPod','i').test(ua);
  var boIOS= RegExp('iphone','i').test(ua);
  if(/facebookexternalhit/.test(ua)) { objQS.lang='en';  }
  if('fb_locale' in objQS) objQS.lang=objQS.fb_locale.substr(0,2);   
  var strLang='en';


  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, post-check=0, pre-check=0"); // no-cache
  res.statusCode=200;

  var CSRFCode=randomHash(); 
  yield* setRedis(flow, sessionID+'_CSRFCodeIndex', CSRFCode, maxUnactivity);
//debugger
  
  var Str=[];
  var tmp=`<!DOCTYPE html>
<html lang="en"><head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta name="generator" content="maWiki">`;
  Str.push(tmp);


  var uSite=req.strSchemeLong+wwwSite;
  
  var srcIcon16=site.SrcIcon[IntSizeIconFlip[16]];
  var srcIcon114=site.SrcIcon[IntSizeIconFlip[114]];
  Str.push('<link rel="icon" type="image/png" href="'+srcIcon16+'" />');
  Str.push('<link rel="apple-touch-icon" href="'+srcIcon114+'"/>');

  Str.push("<meta name='viewport' id='viewportMy' content='initial-scale=1'/>");
  Str.push('<meta name="theme-color" content="#ff0"/>');

  if(boAuthReq){ Str.push('<meta name="robots" content="noindex">\n'); }

  Str.push('<link rel="canonical" href="'+uSite+'"/>\n');

  var strTitle='idPlace - an ID provider using OAuth';
  var strH1='idPlace - an ID provider using OAuth';
  var strDescription='Open source ID provider using OAuth';
  var strKeywords=strDescription;
  var strSummary=strDescription;


  Str.push(`
<meta name="description" content="`+strDescription+`"/>
<meta name="keywords" content="`+strKeywords+`"/>
<link rel="canonical" href="`+uSite+`"/>`);

  
  var uIcon200=uSite+site.SrcIcon[IntSizeIconFlip[200]];
  var tmp=`
<meta property="og:title" content="`+wwwSite+`"/>
<meta property="og:type" content="website" />
<meta property="og:url" content="`+uSite+`"/>
<meta property="og:image" content="`+uIcon200+`"/>
<meta property="og:site_name" content="`+wwwSite+`"/>
<meta property="fb:admins" content="100002646477985"/>
<meta property="fb:app_id" content="`+req.rootDomain.fb.id+`"/>
<meta property="og:description" content="`+strDescription+`"/>
<meta property="og:locale:alternate" content="sv_se" />
<meta property="og:locale:alternate" content="en_US" />`;
  if(!boDbg) Str.push(tmp);

  
  Str.push(`<script>var app=window;</script>`);

  var tmp=`
<script>
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '`+req.rootDomain.fb.id+`',
      cookie     : true,
      xfbml      : true,
      version    : 'v4.0'
    });
    FB.AppEvents.logPageView();   
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
</script>`;
  Str.push(tmp);



Str.push(`<style>
:root { --maxWidth:800px; height:100%}
body {margin:0; height:100%; display:flow-root; font-family:arial, verdana, helvetica; }  /*text-align:center;*/
/*.mainDiv { margin: 0em auto; height:100%; width:100%; display:flex; flex-direction:column; max-width:var(--maxWidth) }*/
/*.mainDivR { box-sizing:border-box; margin:0em auto; width:100%; display:flex; max-width:var(--maxWidth) }*/
h1.mainH1 { box-sizing:border-box; margin:0em auto; width:100%; max-width:var(--maxWidth); border:solid 1px; color:black;font-size:1.6em; font-weight:bold; text-align:center; padding:0.4em 0em 0.4em 0em;  }
</style>`);


  //Str.push('<script src="'+uSite+'/lib/foundOnTheInternet/md5.js" async></script>');

    // If boDbg then set vTmp=0 so that the url is the same, this way the debugger can reopen the file between changes

    // Use normal vTmp on iOS (since I don't have any method of disabling cache on iOS devices (nor any debugging interface))
  var boDbgT=boDbg; if(boIOS) boDbgT=0;
  
  var keyTmp=siteName+'/'+leafManifest, vTmp=boDbgT?0:CacheUri[keyTmp].eTag;     Str.push(`<link rel="manifest" href="`+uSite+`/`+leafManifest+`?v=`+vTmp+`"/>`);
  
    // Include stylesheets
  var pathTmp='/stylesheets/style.css', vTmp=boDbgT?0:CacheUri[pathTmp].eTag;    Str.push('<link rel="stylesheet" href="'+uSite+pathTmp+'?v='+vTmp+'" type="text/css">');

    // Include JS-files
  var StrTmp=['lib.js', 'libClient.js', 'client.js'];
  for(var i=0;i<StrTmp.length;i++){
    var pathTmp='/'+StrTmp[i], vTmp=boDbgT?0:CacheUri[pathTmp].eTag;    Str.push('<script src="'+uSite+pathTmp+'?v='+vTmp+'" async></script>');
  }


  Str.push('<script src="'+uSite+'/lib/foundOnTheInternet/sha1.js" async></script>');

  var strTracker, tmpID=site.googleAnalyticsTrackingID||null;
  if(boDbg||!tmpID){strTracker="<script> ga=function(){};</script>";}else{ 
  strTracker=`
<script type="text/javascript">
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
  ga('create', '`+tmpID+`', 'auto');
  ga('send', 'pageview');
</script>`;
  }
  Str.push(strTracker);

  //Str.push("<script src='https://www.google.com/recaptcha/api.js?render=explicit'></script>");
  Str.push("<script src='https://www.google.com/recaptcha/api.js?render=explicit' defer></script>");



  Str.push("</head>");
  Str.push(`<body>
<title>`+strTitle+`</title>
<div id=divLoginInfo class="mainDivR" style="min-height:2rem; visibility:hidden;" ></div>
<h1 class=mainH1>`+strH1+`</h1>
<noscript><div style="text-align:center">You don't have javascript enabled, so this app won't work.</div></noscript>`);







  //var objOut=copySome({}, app, ['wwwSite', 'CSRFCode', 'Prop', 'strSalt', 'boDbg', 'site', 'leafBE', 'flLibImageFolder', 'UrlOAuth', 'leafLoginBack', 'userInfoFrDB', 'objApp', 'objUApp', 'strReCaptchaSiteKey', 'strIPPrim', 'nHash']);

  var objOut={wwwSite, CSRFCode, Prop, strSalt, boDbg, site, leafBE, flLibImageFolder, UrlOAuth, leafLoginBack, userInfoFrDB, objApp, objUApp, strReCaptchaSiteKey, strIPPrim, nHash};
  copySome(objOut,site,['boTLS']);

  Str.push(`<script>
var app=window;
var tmp=`+serialize(objOut)+`;\nObject.assign(window, tmp);
function indexAssign(){
  setItem('CSRFCode',CSRFCode);
}
</script>
<form id=formLogin style="display:none">
<label name=email>Email</label><input type=email name=email>
<label name=password>Password</label><input type=password name=password>
<button type=submit name=submit class=highStyle value="Sign in">Sign in</button>
</form>
</body></html>`);


  var str=Str.join('\n');
  //res.writeHead(200, "OK", {'Content-Type': MimeType.html});   res.end(str);
  res.setHeader("Content-Encoding", 'gzip');
  res.setHeader('Content-Type', MimeType.html);
  Streamify(str).pipe(zlib.createGzip()).pipe(res);  
}



/******************************************************************************
 * reqMe
 ******************************************************************************/
app.reqMe=function*() {
  var req=this.req, flow=req.flow, res=this.res, sessionID=req.sessionID, site=req.site, TableName=site.TableName, {userTab, user2AppTab}=TableName;
  var objQS=req.objQS;
  var site=req.site, siteName=site.siteName;
  var wwwSite=req.wwwSite;
  
  
  //if(!req.boCookieLaxOK) {res.outCode(401, "Lax cookie not set");  return;  }

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, post-check=0, pre-check=0"); // no-cache
  res.setHeader('Content-Type', MimeType.json);

  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");

  if('origin' in req.headers){ //if cross site
    var http_origin=req.headers.origin;
    res.setHeader("Access-Control-Allow-Origin", http_origin); // Allow access. access_token should be available from anywhere (it uses entropy to prevent illegitimate access).
    if(req.method=='OPTIONS'){  res.end(); return;}
  }


  var tmp='access_token'; if(!(tmp in objQS)) {  res.outCode(400, serialize({error:{type:'invalid_request', message:'The parameter '+tmp+' is required'}}));  return;}

  var Sql=[], Val=[]; 
  Sql.push(`SELECT name, image, eTagImage, sizeImage, imageHash, LENGTH(idFB)>0 AS boFB, LENGTH(idGoogle)>0 AS boGoogle, address, zip, city, county, federatedState, country, timeZone, email, boEmailVerified, telephone, idNational, birthdate,  motherTongue, gender,
UNIX_TIMESTAMP(tCreated) AS tCreated,
UNIX_TIMESTAMP(tName) AS tName,
UNIX_TIMESTAMP(tImage) AS tImage,
UNIX_TIMESTAMP(tEmail) AS tEmail,
UNIX_TIMESTAMP(tTelephone) AS tTelephone,
UNIX_TIMESTAMP(tCountry) AS tCountry,
UNIX_TIMESTAMP(tFederatedState) AS tFederatedState,
UNIX_TIMESTAMP(tCounty) AS tCounty,
UNIX_TIMESTAMP(tCity) AS tCity,
UNIX_TIMESTAMP(tZip) AS tZip,
UNIX_TIMESTAMP(tAddress) AS tAddress,
UNIX_TIMESTAMP(tIdFB) AS tIdFB,
UNIX_TIMESTAMP(tIdGoogle) AS tIdGoogle,
UNIX_TIMESTAMP(tIdNational) AS tIdNational,
UNIX_TIMESTAMP(tBirthdate) AS tBirthdate,
UNIX_TIMESTAMP(tMotherTongue) AS tMotherTongue,
UNIX_TIMESTAMP(tGender) AS tGender,
UNIX_TIMESTAMP(tAccess) AS tAccess,
nName, nImage, nEmail, nTelephone, nCountry, nFederatedState, nCounty, nCity, nZip, nAddress, nIdFB, nIdGoogle, nIdNational, nBirthdate, nMotherTongue, nGender,
scope, maxUnactivityToken, id
FROM `+user2AppTab+` ua JOIN `+userTab+` u ON ua.idUser=u.idUser WHERE access_token=?;`);  // u.idUser AS idUser,
  Val.push(objQS.access_token);


//

  
  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
   
  if(results.length==0) {  res.outCode(400, serialize({error:{type:'access_denied', message:'Nothing found for that access_token'}}));  return;  }

  var objUser=results[0], unixNow=(new Date()).valueOf()/1000;
  if(objUser.tAccess+objUser.maxUnactivityToken<unixNow) {  debugger;  var tmp='The access_token has timed out'; res.outCode(400, serialize({error:{type:'access_denied', message:tmp}}));  return;  }
  var objUserN={}, scope=objUser.scope, Scope; if(scope.length) Scope=scope.split(','); else Scope=[]; 
  /*if(Scope.indexOf('all')!=-1) objUserN=objUser;
  else {
    copySome(objUserN,objUser,['id','tCreated']);
    for(var i=0;i<Scope.length;i++){
      var StrTmp=PropAsScope[Scope[i]];
      for(var j=0;j<StrTmp.length;j++){
        var strTmp=StrTmp[j];
        objUserN[strTmp]=objUser[strTmp];
      }  
    }
  }*/
  var uSite=req.strSchemeLong+wwwSite;

  if(objUser.imageHash!=null) objUser.image=uSite+'/image/u'+objUser.imageHash; //+'?v='+objUser.imTag;
  else if(objUser.image.length==0) objUser.image=uSite+'/image/lib/image/anon0.png';
  if(Scope.indexOf('all')!=-1) Scope=['all'];  // If "all" exist then remove all other "scopes"
  copySome(objUserN,objUser,['id','tCreated']);
  for(var i=0;i<Scope.length;i++){
    var StrTmp=PropAsScope[Scope[i]];
    if(!StrTmp) continue;
    for(var j=0;j<StrTmp.length;j++){
      var strTmp=StrTmp[j];
      objUserN[strTmp]=objUser[strTmp];
    }  
  }


  var Str=[];
  Str.push(serialize(objUserN));

  var str=Str.join('\n');   res.writeHead(200, "OK");   res.end(str);    
}

app.PropAsScope={
  name: ['name', 'tName', 'nName'],
  image: ['image', 'tImage', 'nImage'],  //, 'eTagImage', 'sizeImage'
  email: ['email', 'tEmail', 'nEmail', 'boEmailVerified'],
  telephone: ['telephone', 'tTelephone', 'nTelephone'],
  country: ['country', 'tCountry', 'nCountry'],
  federatedState: ['federatedState', 'tFederatedState', 'nFederatedState'],
  county: ['county', 'tCounty', 'nCounty'],
  city: ['city', 'tCity', 'nCity'],
  zip: ['zip', 'tZip', 'nZip'],
  address: ['address', 'tAddress', 'nAddress'],
  boFB: ['boFB', 'tIdFB', 'nIdFB'],
  boGoogle: ['boGoogle', 'tIdGoogle', 'nIdGoogle'],
  idNational: ['idNational', 'tIdNational', 'nIdNational'],
  birthdate: ['birthdate', 'tBirthdate', 'nBirthdate'],
  motherTongue: ['motherTongue', 'tMotherTongue', 'nMotherTongue'],
  gender: ['gender', 'tGender', 'nGender']
}


var objAllTmp={};
for(var key in app.PropAsScope){
  var StrTmp=app.PropAsScope[key];
  for(var j=0;j<StrTmp.length;j++){    var strTmp=StrTmp[j];   objAllTmp[strTmp]=1;    }  
}
app.PropAsScope.all=Object.keys(objAllTmp);


/******************************************************************************
 * reqToken
 ******************************************************************************/
app.reqToken=function*() {
  var req=this.req, flow=req.flow, res=this.res, sessionID=req.sessionID, site=req.site, TableName=site.TableName, {userTab, appTab, user2AppTab}=TableName;
  var objQS=req.objQS;
  var site=req.site, siteName=site.siteName, wwwSite=req.wwwSite;
  var wwwSite=req.wwwSite;
  
  //if(!req.boCookieLaxOK) {res.outCode(401, "Lax cookie not set");  return;  }

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, post-check=0, pre-check=0"); // no-cache
  res.setHeader('Content-Type', MimeType.json);

  if (req.method == 'POST') {
    var body = '', boDoExit=0;
    req.on('data', function (data) {
      body+=data;  if(body.length > 1000)  { req.connection.destroy(); console.log('Aborting when '+body.length+' bytes data was received!!'); boDoExit=1; flow.next(); }
    });
    req.on('end', function () {
      objQS=querystring.parse(body); 
      flow.next(); 
    });
    yield;  if(boDoExit==1)  return;
  }



  var StrNeeded=['grant_type', 'client_id', 'redirect_uri', 'client_secret', 'code'];
  for(var i=0;i<StrNeeded.length;i++){
    var tmp=StrNeeded[i]; if(!(tmp in objQS)) { res.outCode(400, serialize({error:{type:'invalid_request', message:'The parameter '+tmp+' is required'}})); return;}
  }
  

  var Sql=[], Val=[];
  Sql.push(`SELECT u.idUser AS idUser, u.name AS name, image, eTagImage, sizeImage, u.imageHash AS imageHash, LENGTH(idFB)>0 AS boFB, LENGTH(idGoogle)>0 AS boGoogle, address, zip, city, county, federatedState, country, timeZone, email, boEmailVerified, telephone, idNational, birthdate,  motherTongue, gender,
UNIX_TIMESTAMP(tCreated) AS tCreated,
UNIX_TIMESTAMP(tName) AS tName,
UNIX_TIMESTAMP(tImage) AS tImage,
UNIX_TIMESTAMP(tEmail) AS tEmail,
UNIX_TIMESTAMP(tTelephone) AS tTelephone,
UNIX_TIMESTAMP(tCountry) AS tCountry,
UNIX_TIMESTAMP(tFederatedState) AS tFederatedState,
UNIX_TIMESTAMP(tCounty) AS tCounty,
UNIX_TIMESTAMP(tCity) AS tCity,
UNIX_TIMESTAMP(tZip) AS tZip,
UNIX_TIMESTAMP(tAddress) AS tAddress,
UNIX_TIMESTAMP(tIdFB) AS tIdFB,
UNIX_TIMESTAMP(tIdGoogle) AS tIdGoogle,
UNIX_TIMESTAMP(tIdNational) AS tIdNational,
UNIX_TIMESTAMP(tBirthdate) AS tBirthdate,
UNIX_TIMESTAMP(tMotherTongue) AS tMotherTongue,
UNIX_TIMESTAMP(tGender) AS tGender,
UNIX_TIMESTAMP(tAccess) AS tAccess,
nName, nImage, nEmail, nTelephone, nCountry, nFederatedState, nCounty, nCity, nZip, nAddress, nIdFB, nIdGoogle, nIdNational, nBirthdate, nMotherTongue, nGender,
scope, maxUnactivityToken, access_token, secret, id
FROM `+user2AppTab+` ua JOIN `+userTab+` u ON ua.idUser=u.idUser JOIN `+appTab+` a ON ua.idApp=a.idApp WHERE code=?;`);
  Val.push(objQS.code);

  
  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
   
  if(results.length==0) {  res.outCode(400, serialize({error:{type:'access_denied', message:'Nothing found for that authentication code'}}));  return;  }

  var objUser=results[0], unixNow=(new Date()).valueOf()/1000;
  if(objUser.tAccess+500<unixNow) {   var tmp='The authentication code has timed out'; res.outCode(400, serialize({error:{type:'access_denied', message:tmp}}));  return;  }
  if(objUser.secret!=objQS.client_secret) {   var tmp='Wrong client_secret'; res.outCode(400, serialize({error:{type:'access_denied', message:tmp}}));  return;  }
  delete objUser.secret;
/*
  var objUserN={}, scope=objUser.scope, Scope=scope.split(','); if(scope.length==0) Scope=[];
  if(Scope.indexOf('all')!=-1) objUserN=objUser;
  else {
    copySome(objUserN,objUser,['idUser','tCreated']);
    for(var i=0;i<Scope.length;i++){
      var StrTmp=PropAsScope[Scope[i]];
      for(var j=0;j<StrTmp.length;j++){
        var strTmp=StrTmp[j];
        objUserN[strTmp]=objUser[strTmp];
      }  
    }
  }
*/
  var objUserN={access_token:objUser.access_token, token_type:'bearer', expires_in:objUser.maxUnactivityToken};

  var Str=[];
  Str.push(serialize(objUserN));

  var str=Str.join('\n');   res.writeHead(200, "OK");   res.end(str);    
}


/******************************************************************************
 * reqLoginBack
 ******************************************************************************/
app.reqLoginBack=function*(){
  var {req, res}=this;
  var wwwLoginScopeTmp=null; if('wwwLoginScope' in req.site) wwwLoginScopeTmp=req.site.wwwLoginScope;
  var uSite=req.strSchemeLong+req.wwwSite;

  if(!req.boCookieLaxOK) {res.outCode(401, "Lax cookie not set");  return;  }
  
  var Str=[];
  Str.push(`
<html lang="en"><head><meta name='robots' content='noindex'>
<link rel='canonical' href='`+uSite+`'/>
</head>
<body>
<script>
var wwwLoginScope=`+serialize(wwwLoginScopeTmp)+`;
if(wwwLoginScope) document.domain = wwwLoginScope;
var strQS=location.search;
var strHash=location.hash;
debugger
//alert('strHash: '+strHash);
window.opener.loginReturn(strQS,strHash);
window.close();
</script>
</body>
</html>
`);
  res.setHeader('Content-Type', MimeType.html);
  var str=Str.join('\n');  res.end(str);
}



/******************************************************************************
 * reqVerifyEmailReturn
 ******************************************************************************/
app.reqVerifyEmailReturn=function*() {
  var req=this.req, flow=req.flow, res=this.res, site=req.site, sessionID=req.sessionID;
  var userTab=site.TableName.userTab;
  var objQS=req.objQS;
  
  if(!req.boCookieLaxOK) {res.outCode(401, "Lax cookie not set");  return;  }
  
  var tmp='code'; if(!(tmp in objQS)) { res.out200('The parameter '+tmp+' is required'); return;}
  var codeIn=objQS.code;
  var idUser=yield* getRedis(flow, codeIn+'_verifyEmail');
  
  if(idUser===null) { res.out200('No such code'); return;}

  var Sql=[], Val=[];
  Sql.push("UPDATE "+userTab+" SET boEmailVerified=1 WHERE idUser=?;");
  Val.push(idUser);

  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }

  var c=results.affectedRows, mestmp; 
  if(c==1) { mestmp="Email verified. <br>Close this tab and reload the original tab to see the changes."; } else {mestmp="Error (Nothing done)"; }
  res.setHeader('Content-Type', MimeType.html);
  res.end(mestmp);
}


/******************************************************************************
 * reqVerifyPWResetReturn
 ******************************************************************************/
app.reqVerifyPWResetReturn=function*() {
  var req=this.req, flow=req.flow, res=this.res, site=req.site, sessionID=req.sessionID;
  var userTab=site.TableName.userTab;
  var objQS=req.objQS;
  
  if(!req.boCookieLaxOK) {res.outCode(401, "Lax cookie not set");  return;  }
  
  var tmp='code'; if(!(tmp in objQS)) { res.out200('The parameter '+tmp+' is required'); return;}
  var codeIn=objQS.code;
  var email=yield* getRedis(flow, codeIn+'_verifyPWReset');
  
  if(email===null) { res.out200('No such code'); return;}

  var password=randomHash();
  var hashPW=password+strSalt; for(var i=0;i<nHash;i++) hashPW=SHA1(hashPW);

  var Sql=[], Val=[];
  Sql.push("UPDATE "+userTab+" SET password=? WHERE email=?;");
  Val.push(hashPW, email);

  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }

  var c=results.affectedRows, mestmp; 
  if(c!=1) { res.out500("Error ("+c+" affectedRows)"); return; }


  var wwwSite=req.wwwSite;
  var strTxt='<h3>New password on '+wwwSite+'</h3><p>Your new password on '+wwwSite+' is '+password+'</p>';
  
  const msg = { to: email, from: 'noreply@idplace.org', subject: 'Password reset', html: strTxt }; sgMail.send(msg);
  res.setHeader('Content-Type', MimeType.html);
  res.end("A new password has been generated and sent to your email address.<br>Close this tab and login with your new passoword in the orignal tab.");
}



/******************************************************************************
 * reqImage
 ******************************************************************************/
app.reqImage=function*() {
  var req=this.req, flow=req.flow, res=this.res;
  var site=req.site, objQS=req.objQS, wwwSite=req.wwwSite, siteName=req.siteName, pathName=req.pathName;
  var TableName=site.TableName;
  
  res.removeHeader("Content-Security-Policy"); // Allow to be shown in frame, iframe, embed, object
  
  var uSite=req.strSchemeLong+wwwSite;

  this.eTagIn=getETag(req.headers);
  var keyCache=siteName+'/'+pathName;
  if(keyCache in ETagImage && ETagImage[keyCache]===this.eTagIn) { res.out304(); return; }

  //if("id" in objQS) {id=Number(objQS.id);} else {id=0;}    if("kind" in objQS) {kind=objQS.kind;} else {kind='v';}

  var Match=RegExp('^/image/(u|a)([0-9a-fA-Z]*)$').exec(pathName), idApp, kind;
  if(Match && Match.length>2){
    kind=Match[1]; 
  } else { res.outCode(400,'Bad Request'); return; }


  var imageHash=Match[2];
  if(imageHash.length==0){
    var uNew=uSite+"/lib/image/anonEmptyHash.png";    res.writeHead(302, {'Location': uNew});   res.end(); return;
  }
  
  if(kind=='u'){
    var sql = "SELECT data FROM "+TableName.imageTab+" i JOIN "+TableName.userTab+" u ON i.idUser=u.idUser WHERE imageHash=?", Val=[imageHash];
  }
  else {
    var sql = "SELECT data FROM "+TableName.imageAppTab+" i JOIN "+TableName.appTab+" a ON i.idApp=a.idApp WHERE imageHash=?", Val=[imageHash];
  }
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
  
  if(results.length>0){
    var strData=results[0].data;
    var eTag=crypto.createHash('md5').update(strData).digest('hex'); 
    ETagImage[keyCache]=eTag;  if(eTag===this.eTagIn) { res.out304(); return; }
    var maxAge=3600*8760, mimeType=MimeType.jpg;
    res.writeHead(200, {"Content-Type": mimeType, "Content-Length":strData.length, ETag: eTag, "Cache-Control":"public, max-age="+maxAge}); // "Last-Modified": maxModTime.toUTCString(),
    res.end(strData);
  }else{
    //res.setHeader("Content-type", MimeType.png);
    var uNew=uSite+"/lib/image/anonHashNotInDB.png";
    res.writeHead(302, {'Location': uNew});   res.end();
  }
}



/******************************************************************************
 * reqStatic (request for static files)
 ******************************************************************************/
app.reqStatic=function*() {
  var {req, res}=this;
  var {flow, site, pathName}=req, siteName=site.siteName;


  //var RegAllowedOriginOfStaticFile=[RegExp("^https\:\/\/(closeby\.market|gavott\.com)")];
  //var RegAllowedOriginOfStaticFile=[RegExp("^http\:\/\/(localhost|192\.168\.0)")];
  var RegAllowedOriginOfStaticFile=[];
  setAccessControlAllowOrigin(req, res, RegAllowedOriginOfStaticFile);
  if(req.method=='OPTIONS'){ res.end(); return ;}
  
  var eTagIn=getETag(req.headers);
  var keyCache=pathName; if(pathName==='/'+leafManifest) keyCache=siteName+keyCache;
  if(!(keyCache in CacheUri)){
    var filename=pathName.substr(1);
    var [err]=yield* readFileToCache(flow, filename);
    if(err) {
      if(err.code=='ENOENT') {res.out404(); return;}
      if('host' in req.headers) console.error('Faulty request from'+req.headers.host);
      if('Referer' in req.headers) console.error('Referer:'+req.headers.Referer);
      res.out500(err); return;
    }
  }
  var {buf, type, eTag, boZip, boUglify}=CacheUri[keyCache];
  if(eTag===eTagIn){ res.out304(); return; }
  var mimeType=MimeType[type];
  if(typeof mimeType!='string') console.log('type: '+type+', mimeType: ', mimeType);
  if(typeof buf!='object' || !('length' in buf)) console.log('typeof buf: '+typeof buf);
  if(typeof eTag!='string') console.log('typeof eTag: '+eTag);
  var objHead={"Content-Type": mimeType, "Content-Length":buf.length, ETag: eTag, "Cache-Control":"public, max-age=31536000"};
  if(boZip) objHead["Content-Encoding"]='gzip';
  res.writeHead(200, objHead); // "Last-Modified": maxModTime.toUTCString(),
  res.write(buf); //, this.encWrite
  res.end();
}



/******************************************************************************
 * reqMonitor
 ******************************************************************************/
app.reqMonitor=function*() {
  var req=this.req, flow=req.flow, res=this.res;

  if(!req.boCookieLaxOK) {res.outCode(401, "Lax cookie not set");  return;  }
  
  res.removeHeader("Content-Security-Policy"); // Allow to be shown in frame, iframe, embed, object
  
  if(!objOthersActivity){  //  && boPageBUNeeded===null && boImageBUNeeded===null
    var Sql=[];
    Sql.push("SELECT SQL_CALC_FOUND_ROWS imageName, created FROM "+imageTab+" WHERE boOther=1  LIMIT 1;");
    Sql.push("SELECT FOUND_ROWS() AS n;");
    //Sql.push("SELECT key, value FROM "+settingTab+" WHERE key='tPageBU' OR key 'tImageBU';");
    //Sql.push("SELECT max(tMod) AS tMax FROM "+versionTab+";");
    //Sql.push("SELECT max(created) AS tMax FROM "+imageTab+";");


    var sql=Sql.join('\n'), Val=[];
    var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }

    var resP=results[0], nEdit=results[1][0].n, pageName=nEdit==1?resP[0].siteName+':'+resP[0].pageName:nEdit;
    var resI=results[2], nImage=results[3][0].n, imageName=nImage==1?resI[0].imageName:nImage;
    objOthersActivity={nEdit, pageName,  nImage, imageName};

    //var objT={}; for(var i=0;i<results[4].length;i++){      var r=results[4][i];      objT[r.key]=r.value;    }
    //if(results[5].length && 'tPageBU' in objT){  var tMaxP=results[5][0].tMax; boPageBUNeeded=tMaxP>objT.tPageBU;  }
    //if(results[6].length && 'tImageBU' in objT){  var tMaxI=results[6][0].tMax; boImageBUNeeded=tMaxI>objT.tImageBU;  }
  }


  var colPage='';   //if(boPageBUNeeded) colPage='orange';
  var n=objOthersActivity.nEdit,  strPage=n==1?objOthersActivity.pageName:n;   if(n) colPage='red';   

  var colImg='';  //if(boImageBUNeeded) colImg='orange';
  var n=objOthersActivity.nImage,  strImg=n==1?objOthersActivity.imageName:n;   if(n) colImg='red';   

  if(colPage) strPage="<span style=\"background-color:"+colPage+"\">"+strPage+"</span>";
  if(colImg) strImg="<span style=\"background-color:"+colImg+"\">"+strImg+"</span>";
  
  res.setHeader('Content-Type', MimeType.html);
  res.end("<body style=\"margin: 0px;padding: 0px\">"+strPage+" / "+strImg+"</body>");

}


/******************************************************************************
 * reqStat (request for status of the tables)
 ******************************************************************************/
app.reqStat=function*() {
  var req=this.req, flow=req.flow, res=this.res;
  
  if(!req.boCookieLaxOK) {res.outCode(401, "Lax cookie not set");  return;  }

  var Sql=[]; 
  Sql.push("SELECT count(*) AS n FROM "+versionTab+";"); 
  Sql.push("SELECT count(*) AS n FROM "+imageTab+";"); 
  Sql.push("SELECT count(*) AS n FROM "+thumbTab+";");
  Sql.push("SELECT count(*) AS n FROM "+videoTab+";"); 
  Sql.push("SELECT count(*) AS n FROM "+fileTab+";");
  Sql.push(`SELECT f.idFile AS file, v.idPage AS page, vc.idPage AS cache, i.idImage AS image, t.idImage AS thumb, vid.idVideo AS video FROM `+fileTab+` f
   LEFT JOIN `+versionTab+` v ON f.idFile=v.idFile
   LEFT JOIN `+versionTab+` vc ON f.idFile=vc.idFileCache
   LEFT JOIN `+imageTab+` i ON f.idFile=i.idFile
   LEFT JOIN `+thumbTab+` t ON f.idFile=t.idFile
   LEFT JOIN `+videoTab+` vid ON f.idFile=vid.idFile`);

  var sql=Sql.join('\n'), Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
    

  var nVersion=results[0][0].n, nImage=results[1][0].n, nThumb=results[2][0].n, nVideo=results[3][0].n, nFile=results[4][0].n, resT=results[5];


  var Str=[]; 
  Str.push(`<!DOCTYPE html>
  <html lang="en"><head>
  <meta name="robots" content="noindex">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" >
  <meta name="viewport" id="viewportMy" content="initial-scale=1" />`);


  var uSite=req.strSchemeLong+wwwSite;

    // If boDbg then set vTmp=0 so that the url is the same, this way the debugger can reopen the file between changes

    // Include stylesheets
  var pathTmp='/stylesheets/style.css', vTmp=CacheUri[pathTmp].eTag; if(boDbg) vTmp=0;    Str.push('<link rel="stylesheet" href="'+uSite+pathTmp+'?v='+vTmp+'" type="text/css">');

    // Include site specific JS-files
  //var uSite=req.strSchemeLong+req.wwwSite;
  //var keyCache=req.strSite+'/'+leafSiteSpecific, vTmp=CacheUri[keyCache].eTag; if(boDbg) vTmp=0;  Str.push('<script src="'+uSite+'/'+leafSiteSpecific+'?v='+vTmp+'" async></script>');

    // Include JS-files
  var StrTmp=['lib.js', 'libClient.js'];
  for(var i=0;i<StrTmp.length;i++){
    var pathTmp='/'+StrTmp[i], vTmp=CacheUri[pathTmp].eTag; if(boDbg) vTmp=0;    Str.push('<script src="'+uSite+pathTmp+'?v='+vTmp+'" async></script>');
  }

  Str.push('<script src="'+uSite+'/lib/foundOnTheInternet/sortable.js" async></script>');

  Str.push("</head>");
  Str.push('<body style="margin:0">');

  Str.push('<h3>Comparing tables</h3>');


  Str.push("<p>nFile: <b>"+nFile+"</b>");
  Str.push("<br><br>");

  Str.push("<p>nImage:"+nImage);
  Str.push("<p>nVersion:"+nVersion+" (*2) (each creates 2 files)");
  Str.push("<p>nThumb:"+nThumb);
  Str.push("<p>nVideo:"+nVideo);
  Str.push("<p>---------------");
  var sum=2*nVersion+nImage+nThumb+nVideo;  Str.push("<p>Sum: <b>"+sum+'</b>, ');
  var diff=nFile-nVersion*2-nImage-nThumb-nVideo;  Str.push("(diff="+diff+")");

  var tmp="<br>";    if(diff<0) tmp=" (fileTab contains too few entries)<br>";    else if(diff>0) tmp=" (fileTab contains too many entries)<br>";
  Str.push(tmp);

  var arrHead=['idFile','Src [idPage]','Cache [idPage]','Image','Thumb [idImage]','Video','Diff'];
  var strHead='<tr style="font-weight:bold"><td>'+arrHead.join('</td><td>')+'</td></tr>';

  var arrSum=[nFile,nVersion,nVersion,nImage,nThumb,nVideo,diff];
  var strSum='<tr style="font-weight:bold"><td>'+arrSum.join('</td><td>')+'</td></tr>';


  var arrR=[strHead,strSum]; 
  for(var i=0;i<resT.length;i++){
    var r=resT[i];
             // 'file' will be on each row. Other than that, each row should have one other entry. (that is 2 entries per row), (rows with a single entry are marked red) 
    var strD='', col='red'; for(var name in r){var d=r[name]; if(d==null) d=''; strD+="<td>"+d+"</td>"; if(d && name!='file') col='';} 
    if(col.length) col="style=\"background-color:"+col+"\"";
    arrR.push("<tr "+col+">"+strD+"</tr>\n");
  }
  var strR=arrR.join('');
  Str.push("<table style=\"  border: solid 1px;border-collapse:collapse\">\n"+strR+"</table>");

  res.setHeader('Content-Type', MimeType.html);
  var str=Str.join('\n');  // res.writeHead(200, "OK", {'Content-Type': MimeType.html}); 
  res.end(str);  
  
  
}



/******************************************************************************
 * SetupSql
 ******************************************************************************/
app.SetupSql=function(){
  this.strSETScope="SET('name', 'image', 'email', 'telephone', 'country', 'federatedState', 'county', 'zip', 'city', 'address', 'timeZone', 'boFB', 'boGoogle', 'idNational', 'birthdate', 'motherTongue', 'gender', 'all')";
}
app.SetupSql.prototype.createTable=function*(flow, siteName,boDropOnly){
  var site=Site[siteName]; 
  
  var SqlTabDrop=[], SqlTab=[];
  var {Prop, TableName, ViewName}=site;
  var {user2AppTab, imageAppTab, appTab, settingTab, adminTab, imageTab, userTab}=TableName;
  //eval(extractLoc(ViewName,'ViewName'));

  var StrTabName=object_values(TableName);
  var tmp=StrTabName.join(', ');
  SqlTabDrop.push("DROP TABLE IF EXISTS "+tmp);     
  SqlTabDrop.push('DROP TABLE IF EXISTS '+userTab);     
  //var tmp=object_values(ViewName).join(', ');   if(tmp.length) SqlTabDrop.push("DROP VIEW IF EXISTS "+tmp+"");


  var collate="utf8_general_ci";

  var engine='INNODB';  //engine='MyISAM';
  var auto_increment=1;
    
  var strEnumGender="ENUM('male','female')";
  var strEnumImageSource="ENUM('db','url')";
  //boImageOwn tinyint(1) NOT NULL DEFAULT 0,
  //enumImageSource "+strEnumImageSource+" NOT NULL DEFAULT 'db',
  //imTag int(4) NOT NULL DEFAULT 0,

    // Create users
  SqlTab.push(`CREATE TABLE `+userTab+` (
  idUser int(4) NOT NULL auto_increment,
  name varchar(128) NOT NULL DEFAULT '',
  password char(40) NOT NULL DEFAULT '',
  image varchar(256) NOT NULL DEFAULT '',
  eTagImage char(32) NOT NULL DEFAULT '',
  sizeImage int(4) NOT NULL DEFAULT 0,
  imageHash char(56) NULL,
  email varchar(128) NOT NULL DEFAULT '',
  boEmailVerified tinyint(1) NOT NULL DEFAULT 0,
  telephone varchar(128) NOT NULL DEFAULT '',
  country varchar(128) NOT NULL DEFAULT '',
  federatedState varchar(128) NOT NULL DEFAULT '',
  county varchar(128) NOT NULL DEFAULT '',
  city varchar(128) NOT NULL DEFAULT '',
  zip varchar(128) NOT NULL DEFAULT '',
  address varchar(128) NOT NULL DEFAULT '',
  timeZone varchar(16) NULL DEFAULT 0,
  idFB char(16) CHARSET utf8 NULL,
  idGoogle varchar(128) CHARSET utf8 NULL,
  idNational varchar(128) CHARSET utf8 NOT NULL DEFAULT '',
  birthdate DATE NOT NULL,
  motherTongue varchar(32) NOT NULL DEFAULT '',
  gender `+strEnumGender+` NOT NULL DEFAULT 'male',
  tCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tName TIMESTAMP NOT NULL,
  tImage TIMESTAMP NOT NULL,
  tEmail TIMESTAMP NOT NULL,
  tTelephone TIMESTAMP NOT NULL,
  tCountry TIMESTAMP NOT NULL,
  tFederatedState TIMESTAMP NOT NULL,
  tCounty TIMESTAMP NOT NULL,
  tCity TIMESTAMP NOT NULL,
  tZip TIMESTAMP NOT NULL,
  tAddress TIMESTAMP NOT NULL,
  tIdFB TIMESTAMP NOT NULL,
  tIdGoogle TIMESTAMP NOT NULL,
  tIdNational TIMESTAMP NOT NULL,
  tBirthdate TIMESTAMP NOT NULL,
  tMotherTongue TIMESTAMP NOT NULL,
  tGender TIMESTAMP NOT NULL,
  nName int(4) NOT NULL DEFAULT 0,
  nImage int(4) NOT NULL DEFAULT 0,
  nEmail int(4) NOT NULL DEFAULT 0,
  nTelephone int(4) NOT NULL DEFAULT 0,
  nCountry int(4) NOT NULL DEFAULT 0,
  nFederatedState int(4) NOT NULL DEFAULT 0,
  nCounty int(4) NOT NULL DEFAULT 0,
  nCity int(4) NOT NULL DEFAULT 0,
  nZip int(4) NOT NULL DEFAULT 0,
  nAddress int(4) NOT NULL DEFAULT 0,
  nIdFB int(4) NOT NULL DEFAULT 0,
  nIdGoogle int(4) NOT NULL DEFAULT 0,
  nIdNational int(4) NOT NULL DEFAULT 0,
  nBirthdate int(4) NOT NULL DEFAULT 0,
  nMotherTongue int(4) NOT NULL DEFAULT 0,
  nGender int(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (idUser),
  UNIQUE KEY (email),
  UNIQUE KEY (imageHash),
  UNIQUE KEY (idFB),
  UNIQUE KEY (idGoogle)
  ) AUTO_INCREMENT = `+auto_increment+`, ENGINE=`+engine+` COLLATE `+collate); 
  SqlTab.push("ALTER TABLE "+userTab+" AUTO_INCREMENT=100000");

       // Columns allowd to be null: imageHash, timeZone, idFB, idGoogle, tCreated


  SqlTab.push(`CREATE TABLE `+imageTab+` (
  idUser int(4) NOT NULL,
  data BLOB NOT NULL,
  UNIQUE KEY (idUser),
  FOREIGN KEY (idUser) REFERENCES `+userTab+`(idUser) ON DELETE CASCADE
  ) ENGINE=`+engine+` COLLATE `+collate); 

  SqlTab.push(`CREATE TABLE `+settingTab+` (
  name varchar(65) CHARSET utf8 NOT NULL,
  value TEXT CHARSET utf8 NOT NULL,
  UNIQUE KEY (name)
  ) ENGINE=`+engine+` COLLATE `+collate);

	  // Create admin
  SqlTab.push(`CREATE TABLE `+adminTab+` (
  idUser int(4) NOT NULL,
  boApproved tinyint(1) NOT NULL DEFAULT 0,
  created TIMESTAMP default CURRENT_TIMESTAMP,
  FOREIGN KEY (idUser) REFERENCES `+userTab+`(idUser) ON DELETE CASCADE,
  UNIQUE KEY (idUser)
  ) ENGINE=`+engine+` COLLATE `+collate);

  //imTag int(4) NOT NULL DEFAULT 0,
	  // Create app
  SqlTab.push(`CREATE TABLE `+appTab+` (
  idApp int(4) NOT NULL auto_increment,
  name varchar(32) NOT NULL DEFAULT '',
  idOwner int(4) NOT NULL,
  redir_uri varchar(128) NOT NULL DEFAULT '',
  created TIMESTAMP default CURRENT_TIMESTAMP,
  secret char(32) NOT NULL DEFAULT '',
  imageHash char(56) NULL,
  PRIMARY KEY (idApp),
  UNIQUE KEY (name),
  UNIQUE KEY (imageHash),
  FOREIGN KEY (idOwner) REFERENCES `+userTab+`(idUser) ON DELETE CASCADE
  ) ENGINE=`+engine+` COLLATE `+collate);
  SqlTab.push("ALTER TABLE "+appTab+" AUTO_INCREMENT=11000");

  SqlTab.push(`CREATE TABLE `+imageAppTab+` (
  idApp int(4) NOT NULL,
  data BLOB NOT NULL,
  UNIQUE KEY (idApp),
  FOREIGN KEY (idApp) REFERENCES `+appTab+`(idApp) ON DELETE CASCADE
  ) ENGINE=`+engine+` COLLATE `+collate); 


    // Create user2App
  SqlTab.push(`CREATE TABLE `+user2AppTab+` (
  idUser int(4) NOT NULL,
  idApp int(4) NOT NULL,
  scope `+this.strSETScope+`,
  tAccess TIMESTAMP default CURRENT_TIMESTAMP,
  access_token char(128) NOT NULL DEFAULT '',
  code char(128) NOT NULL DEFAULT '',
  id char(56) NOT NULL DEFAULT '',
  maxUnactivityToken int(4) NOT NULL DEFAULT 0,
  FOREIGN KEY (idUser) REFERENCES `+userTab+`(idUser) ON DELETE CASCADE,
  FOREIGN KEY (idApp) REFERENCES `+appTab+`(idApp) ON DELETE CASCADE,
  UNIQUE KEY (idUser, idApp),
  UNIQUE KEY (access_token),
  UNIQUE KEY (code),
  UNIQUE KEY (id)
  ) ENGINE=`+engine+` COLLATE `+collate);

  // scope="PECA" //Public, Email, Contact, All
  //scope varchar(128) NOT NULL DEFAULT '',

  
  if(boDropOnly) var Sql=SqlTabDrop;
  else var Sql=array_merge(SqlTabDrop, SqlTab);
  
  var strDelim=';', sql=Sql.join(strDelim+'\n')+strDelim, Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val);  if(err) {  return [err]; }
  return [null];
  
}



app.SetupSql.prototype.createFunction=function*(flow, siteName,boDropOnly){
  var site=Site[siteName]; 
  
  var SqlFunctionDrop=[], SqlFunction=[];
  var {Prop, TableName, ViewName}=site;
  var {user2AppTab, imageAppTab, appTab, settingTab, adminTab, imageTab, userTab}=TableName;
  //eval(extractLoc(ViewName,'ViewName'));
  
  

  //SELECT imageHash FROM "+imageTab+" WHERE idUser=IidUser;

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"getUserAppInfo");
  SqlFunction.push(`CREATE PROCEDURE `+siteName+`getUserAppInfo(IidUser int(4), IidApp int(4))
    proc_label:BEGIN
      SELECT idUser, name, image, eTagImage, sizeImage, imageHash, email, boEmailVerified, telephone, country, federatedState, county, city, zip, address, timeZone, idFB, idGoogle, idNational, birthdate, motherTongue, gender,
UNIX_TIMESTAMP(tCreated) AS tCreated,
UNIX_TIMESTAMP(tName) AS tName,
UNIX_TIMESTAMP(tImage) AS tImage,
UNIX_TIMESTAMP(tEmail) AS tEmail,
UNIX_TIMESTAMP(tTelephone) AS tTelephone,
UNIX_TIMESTAMP(tCountry) AS tCountry,
UNIX_TIMESTAMP(tFederatedState) AS tFederatedState,
UNIX_TIMESTAMP(tCounty) AS tCounty,
UNIX_TIMESTAMP(tCity) AS tCity,
UNIX_TIMESTAMP(tZip) AS tZip,
UNIX_TIMESTAMP(tAddress) AS tAddress,
UNIX_TIMESTAMP(tIdFB) AS tIdFB,
UNIX_TIMESTAMP(tIdGoogle) AS tIdGoogle,
UNIX_TIMESTAMP(tIdNational) AS tIdNational,
UNIX_TIMESTAMP(tBirthdate) AS tBirthdate,
UNIX_TIMESTAMP(tMotherTongue) AS tMotherTongue,
UNIX_TIMESTAMP(tGender) AS tGender,
nName, nImage, nEmail, nTelephone, nCountry, nFederatedState, nCounty, nCity, nZip, nAddress, nIdFB, nIdGoogle, nIdNational, nBirthdate, nMotherTongue, nGender
 FROM `+userTab+` WHERE idUser=IidUser;

         # Note on the below query: If row doesn't exist, then nothing is done
      UPDATE `+user2AppTab+` SET access_token=CONCAT(MD5(RAND()),MD5(RAND())), tAccess=now(), code=CONCAT(MD5(RAND()),MD5(RAND())) WHERE idUser=IidUser AND idApp=IidApp;
      SELECT idApp, name, UNIX_TIMESTAMP(created) AS created, redir_uri, imageHash FROM `+appTab+` WHERE idApp=IidApp;
      SELECT scope, UNIX_TIMESTAMP(tAccess) AS tAccess, access_token, maxUnactivityToken, code, id FROM `+user2AppTab+` ua JOIN `+appTab+` a ON ua.idApp=a.idApp WHERE idUser=IidUser AND a.idApp=IidApp;
    END`);  //, password


  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"setConsent");
  SqlFunction.push(`CREATE PROCEDURE `+siteName+`setConsent(IidUser int(4), IidApp int(4), Iscope `+this.strSETScope+`, ImaxUnactivityToken int(4))
    proc_label:BEGIN
      DECLARE Vc INT(4);
      DECLARE Vid char(56);
      DECLARE Vaccess_token, Vcode char(128);
      SELECT SQL_CALC_FOUND_ROWS id INTO Vid FROM `+user2AppTab+` WHERE idUser=IidUser AND idApp=IidApp;
      SELECT FOUND_ROWS() INTO Vc;
      SET Vaccess_token=CONCAT(MD5(RAND()),MD5(RAND()));
      SET Vcode=CONCAT(MD5(RAND()),MD5(RAND()));
      IF Vc=0 THEN
        SET Vid=SHA2(CONCAT(IidUser,IidApp,'`+strSaltID+`'),224);
        INSERT INTO `+user2AppTab+` (idUser, idApp, scope, tAccess, access_token, code, maxUnactivityToken, id) VALUES (IidUser, IidApp, Iscope, now(), Vaccess_token, Vcode, ImaxUnactivityToken, Vid);
      ELSE
        UPDATE `+user2AppTab+` SET scope=Iscope, tAccess=now(), access_token=Vaccess_token, code=Vcode, maxUnactivityToken=ImaxUnactivityToken WHERE idUser=IidUser AND idApp=IidApp;
      END IF;
    END`);  //, password




  // FLOOR(POW(2,32)*RAND())<<32) | FLOOR(POW(2,32)*RAND();
  //Vaccess_token=CONCAT(MD5(RAND()),MD5(RAND())
/*
  var access_token=randomHash();
  var code=randomHash();
  var sql="INSERT INTO "+user2AppTab+" (idUser, idApp, scope, tAccess, access_token, maxUnactivityToken, code) VALUES (?,?,?,now(),?,?,?) ON DUPLICATE KEY UPDATE scope=?, access_token=?, maxUnactivityToken=?, code=?;";
  var Val=[idUser, inObj.idApp, inObj.scope, access_token, inObj.maxUnactivityToken, code,    inObj.scope, access_token, inObj.maxUnactivityToken, code ];
*/


  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"setPassword");
  SqlFunction.push(`CREATE PROCEDURE `+siteName+`setPassword(IidUser int(4), IpwOld VARCHAR(40), IpwNew VARCHAR(40))
    proc_label:BEGIN
      DECLARE VpwOld VARCHAR(40);
      SELECT password INTO VpwOld FROM `+userTab+` WHERE idUser=IidUser;
      IF FOUND_ROWS()!=1 THEN SELECT CONCAT('Found ', FOUND_ROWS(), ' users') AS mess; LEAVE proc_label; END IF;
      IF VpwOld!=IpwOld THEN SELECT 'Old password does not match' AS mess; LEAVE proc_label; END IF;
      UPDATE `+userTab+` SET password=IpwNew WHERE idUser=IidUser;
      SELECT 'Password changed' AS mess;
    END`);  


  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"setImage");
  SqlFunction.push(`CREATE PROCEDURE `+siteName+`setImage(IidUser int(4), Idata BLOB)
    proc_label:BEGIN
      DECLARE VimageHash char(56);
      SET VimageHash=sha2(Idata,224);
      REPLACE INTO `+imageTab+` (idUser,data) VALUES (IidUser,Idata);
      UPDATE `+userTab+` SET tImage=IF(imageHash IS NULL OR imageHash!=VimageHash, now(), tImage), nImage=nImage+(imageHash IS NULL OR imageHash!=VimageHash), imageHash=VimageHash WHERE idUser=IidUser;
      SELECT VimageHash AS imageHash;
    END`); 

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"deleteImage");
  SqlFunction.push(`CREATE PROCEDURE `+siteName+`deleteImage(IidUser int(4))
    proc_label:BEGIN
      DELETE FROM `+imageTab+` WHERE idUser=IidUser;
      UPDATE `+userTab+` SET tImage=IF(imageHash IS NULL, tImage, now()), imageHash=NULL WHERE idUser=IidUser;
      SELECT NULL AS imageHash;
    END`); 

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"setAppImage");
  SqlFunction.push(`CREATE PROCEDURE `+siteName+`setAppImage(IidUser int(4), IidApp int(4), Idata BLOB)
    proc_label:BEGIN
      DECLARE Vtrash int(4);
      DECLARE VimageHash char(56);
      SELECT idApp INTO Vtrash FROM `+appTab+` WHERE idOwner=IidUser AND idApp=IidApp;
      IF FOUND_ROWS()!=1 THEN SELECT CONCAT('Found ', FOUND_ROWS(), ' apps') AS mess; LEAVE proc_label;
      ELSE SELECT 'ok' AS mess;
      END IF;
      SET VimageHash=sha2(Idata,224);
      REPLACE INTO `+imageAppTab+` (idApp,data) VALUES (IidApp,Idata);
      UPDATE `+appTab+` SET imageHash=VimageHash WHERE idApp=IidApp;
      SELECT VimageHash AS imageHash;
    END`);  
 
  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"deleteAppImage");
  SqlFunction.push(`CREATE PROCEDURE `+siteName+`deleteAppImage(IidUser int(4), IidApp int(4))
    proc_label:BEGIN
      DECLARE Vtrash int(4);
      SELECT idApp INTO Vtrash FROM `+appTab+` WHERE idOwner=IidUser AND idApp=IidApp;
      IF FOUND_ROWS()!=1 THEN SELECT CONCAT('Found ', FOUND_ROWS(), ' apps') AS mess; LEAVE proc_label;
      ELSE SELECT 'ok' AS mess;
      END IF;
      DELETE FROM `+imageAppTab+` WHERE idApp=IidApp;
      UPDATE `+appTab+` SET imageHash=NULL WHERE idApp=IidApp;
      SELECT NULL AS imageHash;
    END`);  

     // START TRANSACTION;
     // IF FOUND_ROWS()=0 THEN SELECT 'user not found' AS mess; LEAVE proc_label; ELSE SELECT '' AS mess; END IF;
     // COMMIT


  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"loginWExternalIP");
  SqlFunction.push(`CREATE PROCEDURE `+siteName+`loginWExternalIP(IidIP varchar(128), InameIP varchar(128), Iimage varchar(512), Iemail varchar(128), ItimeZone varchar(16))
    proc_label:BEGIN
      DECLARE VidUser, VidUserIP, VidUserE int(4);
      SELECT idUser INTO VidUserIP FROM `+userTab+` WHERE idFB=IidIP;
      SELECT idUser INTO VidUserE  FROM `+userTab+` WHERE email=Iemail;

          # Check that VidUserIP and VidUserE are the same
      IF VidUserIP IS NOT NULL AND VidUserE IS NOT NULL AND VidUserIP!=VidUserE THEN SELECT 'Email used for another account' AS mess; LEAVE proc_label;
      ELSE SELECT 'ok' AS mess;
      END IF;
      SET VidUser=COALESCE(VidUserIP,VidUserE);

      IF VidUser IS NULL THEN
        INSERT INTO `+userTab+` SET idFB=IidIP, name=InameIP, password=MD5(RAND()), image=Iimage, email=Iemail, timeZone=ItimeZone, birthdate='2000-01-01',
   tCreated=now(), tName=now(), tImage=now(), tEmail=now(), tTelephone=now(), tCountry=now(), tFederatedState=now(), tCounty=now(), tCity=now(), tZip=now(), tAddress=now(), tIdFB=now(), tIdGoogle=now(), tIdNational=now(), tBirthdate=now(), tMotherTongue=now(), tGender=now();
        SELECT LAST_INSERT_ID() INTO VidUser;
      ELSE
        UPDATE `+userTab+` SET
tIdFB=IF(idFB<=>IidIP, tIdFB, now()),
tName=IF(name<=>InameIP, tName, now()),
tImage=IF(!(image<=>Iimage) AND imageHash IS NULL, now(), tImage),
tEmail=IF(email<=>Iemail, tEmail, now()),
boEmailVerified=IF(email<=>Iemail, boEmailVerified, 0),
nIdFB=nIdFB+!(idFB<=>IidIP),
nImage=nImage+(!(image<=>Iimage) AND imageHash IS NULL),
nName=nName+!(name<=>InameIP),
nEmail=nEmail+!(email<=>Iemail),
idFB=IidIP, name=InameIP, image=Iimage, email=Iemail, timeZone=ItimeZone WHERE idUser=VidUser;
      END IF;
      SELECT VidUser AS idUser;
    END`);  



/*
  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"setUser");
  SqlFunction.push(`CREATE PROCEDURE `+siteName+`setUser(IIP `+strIPEnum+`, IidIP varchar(128), InameIP varchar(128), Iimage varchar(512), OUT OboInserted INT, OUT OidUser INT)
    BEGIN
      DECLARE Vc INT;
      START TRANSACTION;
      INSERT INTO `+userTab+` (IP, idIP, nameIP, image) VALUES (IIP, IidIP, InameIP, Iimage ) ON DUPLICATE KEY UPDATE idUser=LAST_INSERT_ID(idUser), nameIP=InameIP, image=Iimage;
      SET OidUser=LAST_INSERT_ID();

      INSERT INTO `+vendorTab+` (idUser,created, lastPriceChange, posTime, tLastWriteOfTA, histActive) VALUES (OidUser, now(), now(), now(), now(), 1 )
        ON DUPLICATE KEY UPDATE idUser=idUser;

      SET OboInserted=(ROW_COUNT()=1);

      COMMIT;
    END;`);
  var id='100002646477985';
  SqlFunction.push("CALL "+siteName+"vendorSetup('fb', "+id+", 'Minnie the Moocher', 'http://example.com/abc.jpg', @boInserted, @idUser)");
*/

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"dupMake");
  SqlFunction.push(`CREATE PROCEDURE `+siteName+`dupMake()
      BEGIN
        CALL copyTable('`+userTab+`_dup','`+userTab+`');
        CALL copyTable('`+imageTab+`_dup','`+imageTab+`');
        CALL copyTable('`+settingTab+`_dup','`+settingTab+`');
        CALL copyTable('`+adminTab+`_dup','`+adminTab+`');
        CALL copyTable('`+appTab+`_dup','`+appTab+`');
        CALL copyTable('`+user2AppTab+`_dup','`+user2AppTab+`');
      END`);

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"dupRename");
 /* SqlFunction.push(`CREATE PROCEDURE `+siteName+`dupRename()
      BEGIN
RENAME TABLE `+userTab+` TO `+userTab+`_dup,
             `+imageTab+` TO `+imageTab+`_dup,
             `+settingTab+` TO `+settingTab+`_dup,
             `+adminTab+` TO `+adminTab+`_dup,
             `+appTab+` TO `+appTab+`_dup,
             `+user2AppTab+` TO `+user2AppTab+`_dup;
      END`);*/

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"dupTrunkOrgNCopyBack");
  SqlFunction.push(`CREATE PROCEDURE `+siteName+`dupTrunkOrgNCopyBack()
      BEGIN
        DELETE FROM `+user2AppTab+` WHERE 1;
        DELETE FROM `+appTab+` WHERE 1;
        DELETE FROM `+adminTab+` WHERE 1;
        DELETE FROM `+settingTab+` WHERE 1;
        DELETE FROM `+imageTab+` WHERE 1;
        DELETE FROM `+userTab+` WHERE 1;
        INSERT INTO `+userTab+` SELECT * FROM `+userTab+`_dup;
        INSERT INTO `+imageTab+` SELECT * FROM `+imageTab+`_dup;
        INSERT INTO `+settingTab+` SELECT * FROM `+settingTab+`_dup;
        INSERT INTO `+adminTab+` SELECT * FROM `+adminTab+`_dup;
        INSERT INTO `+appTab+` SELECT * FROM `+appTab+`_dup;
        INSERT INTO `+user2AppTab+` SELECT * FROM `+user2AppTab+`_dup;
      END`);

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"dupDrop");
  SqlFunction.push(`CREATE PROCEDURE `+siteName+`dupDrop()
      BEGIN
        DROP TABLE IF EXISTS `+user2AppTab+`_dup;
        DROP TABLE IF EXISTS `+appTab+`_dup;
        DROP TABLE IF EXISTS `+adminTab+`_dup;
        DROP TABLE IF EXISTS `+settingTab+`_dup;
        DROP TABLE IF EXISTS `+imageTab+`_dup;
        DROP TABLE IF EXISTS `+userTab+`_dup;
      END`);

  

  if(boDropOnly) var Sql=SqlFunctionDrop;
  else var Sql=array_merge(SqlFunctionDrop, SqlFunction);
  
  var strDelim=';', sql=Sql.join(strDelim+'\n')+strDelim, Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val);  if(err) {  return [err]; }
  return [null];
}

app.SetupSql.prototype.funcGen=function*(flow, boDropOnly){
  var SqlFunction=[], SqlFunctionDrop=[];
  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS copyTable");
  SqlFunction.push(`CREATE PROCEDURE copyTable(INameN varchar(128),IName varchar(128))
    BEGIN
      SET @q=CONCAT('DROP TABLE IF EXISTS ', INameN,';');     PREPARE stmt1 FROM @q;  EXECUTE stmt1;  DEALLOCATE PREPARE stmt1;
      SET @q=CONCAT('CREATE TABLE ',INameN,' LIKE ',IName,';');   PREPARE stmt1 FROM @q;  EXECUTE stmt1; DEALLOCATE PREPARE stmt1;
      SET @q=CONCAT('INSERT INTO ',INameN, ' SELECT * FROM ',IName,';');    PREPARE stmt1 FROM @q;  EXECUTE stmt1;  DEALLOCATE PREPARE stmt1;
    END`);

  if(boDropOnly) var Sql=SqlFunctionDrop;
  else var Sql=array_merge(SqlFunctionDrop, SqlFunction);
  
  var strDelim=';', sql=Sql.join(strDelim+'\n')+strDelim, Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val);  if(err) {  return [err]; }
  return [null];
}

app.SetupSql.prototype.createDummies=function*(flow, siteName){
  var site=Site[siteName]; 
  var SqlDummies=[];
  return [null];
}

app.SetupSql.prototype.createDummy=function*(flow, siteName){
  var site=Site[siteName]; 
  var SqlDummy=[];
  return [null];
}

app.SetupSql.prototype.truncate=function*(flow, siteName){
  var site=Site[siteName]; 
  
  var Sql=[];

  var StrTabName=object_values(site.TableName);

  var SqlTmp=[];
  for(var i=0;i<StrTabName.length;i++){
    SqlTmp.push(StrTabName[i]+" WRITE");
  }
  Sql.push('SET FOREIGN_KEY_CHECKS=0');
  var tmp="LOCK TABLES "+SqlTmp.join(', ');
  Sql.push(tmp);
  for(var i=0;i<StrTabName.length;i++){
    Sql.push("DELETE FROM "+StrTabName[i]);
    Sql.push("ALTER TABLE "+StrTabName[i]+" AUTO_INCREMENT = 1");
  }
  Sql.push('UNLOCK TABLES');
  Sql.push('SET FOREIGN_KEY_CHECKS=1');
  
  var strDelim=';', sql=Sql.join(strDelim+'\n')+strDelim, Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val);  if(err) {  return [err]; }
  return [null];
}



  // Called when --sql command line option is used
app.SetupSql.prototype.doQuery=function*(flow, strCreateSql){
  if(StrValidSqlCalls.indexOf(strCreateSql)==-1){var tmp=strCreateSql+' is not valid input, try any of these: '+StrValidSqlCalls.join(', '); return [new Error(tmp)]; }
  var Match=RegExp("^(drop|create)?(.*?)$").exec(strCreateSql);
  if(!Match) { debugger;  return [new Error("!Match")]; }
  
  var boDropOnly=false, strMeth=Match[2];
  if(Match[1]=='drop') { boDropOnly=true; strMeth='create'+strMeth;}
  else if(Match[1]=='create')  { strMeth='create'+strMeth; }
  
  if(strMeth=='createFunction'){ 
    var [err]=yield* this.funcGen(flow, boDropOnly); if(err){  return [err]; }  // Create common functions
  }
  for(var iSite=0;iSite<SiteName.length;iSite++){
    var siteName=SiteName[iSite];
    console.log(siteName);
    var [err]=yield* this[strMeth](flow, siteName, boDropOnly);  if(err){  return [err]; }
  }
  return [null];
}

var writeMessTextOfMultQuery=function(Sql, err, results){
  var nSql=Sql.length, nResults='(single query)'; if(results instanceof Array) nResults=results.length;
  console.log('nSql='+nSql+', nResults='+nResults);
  var StrMess=[];
  if(err){
    StrMess.push('err.index: '+err.index+', err: '+err);
    if(nSql==nResults){
      var tmp=Sql.slice(bound(err.index-1,0,nSql), bound(err.index+2,0,nSql)),  sql=tmp.join('\n');
      StrMess.push('Since "Sql" and "results" seem correctly aligned (has the same size), then 3 queries are printed (the preceding, the indexed, and following query (to get a context)):\n'+sql); 
    }
    console.log(StrMess.join('\n'));
  }
}



/******************************************************************************
 * ReqSql
 ******************************************************************************/
app.ReqSql=function(req, res){
  this.req=req; this.res=res;
  this.StrType=['table', 'fun', 'dropTable', 'dropFun', 'truncate', 'dummy', 'dummies']; 
}
app.ReqSql.prototype.createZip=function(objSetupSql){
  var res=this.res, StrType=this.StrType;

  var zipfile = new NodeZip();
  for(var i=0;i<StrType.length;i++) {
    var strType=StrType[i], SqlA;
    var Match=RegExp("^(drop)?(.*)$").exec(strType), boDropOnly=Match[1]=='drop';
    var SqlA=objSetupSql[Match[2].toLowerCase()](SiteName, boDropOnly);
    var strDelim=';;', sql='-- DELIMITER '+strDelim+'\n'      +SqlA.join(strDelim+'\n')+strDelim      +'\n-- DELIMITER ;\n';
    zipfile.file(strType+".sql", sql, {date:new Date(), compression:'DEFLATE'});
  }

  //var objArg={base64:false}; if(boCompress) objArg.compression='DEFLATE';
  var objArg={type:'string'}; //if(boCompress) objArg.compression='DEFLATE';
  var outdata = zipfile.generate(objArg);


  var outFileName=strAppName+'Setup.zip';
  var objHead={"Content-Type": MimeType.zip, "Content-Length":outdata.length, 'Content-Disposition':'attachment; filename='+outFileName};
  res.writeHead(200,objHead);
  res.end(outdata,'binary');
}
app.ReqSql.prototype.toBrowser=function(objSetupSql){
  var {req, res}=this;
  var Match=RegExp("^(drop)?(.*?)(All)?$").exec(req.pathNameWOPrefix), boDropOnly=Match[1]=='drop', strMeth=Match[2].toLowerCase(), boAll=Match[3]=='All', SiteNameT=boAll?SiteName:[req.siteName];
  var StrValidMeth=['table', 'fun', 'truncate',  'dummy', 'dummies'];
  //var objTmp=Object.getPrototypeOf(objSetupSql);
  if(StrValidMeth.indexOf(strMeth)!=-1){
    var SqlA=objSetupSql[strMeth](SiteNameT, boDropOnly); 
    var strDelim=';;', sql='-- DELIMITER '+strDelim+'\n'      +SqlA.join(strDelim+'\n')+strDelim      +'\n-- DELIMITER ;\n';
    res.out200(sql);
  }else{ var tmp=req.pathNameWOPrefix+' is not valid input, try: '+this.StrType; console.log(tmp); res.out404(tmp); }
}  


app.createDumpCommand=function(){ 
  var strCommand='', StrTabType=["user2App", "imageApp", "app", "setting", "admin", "image", "user"];
  for(var i=0;i<StrTabType.length;i++){
    var strTabType=StrTabType[i], StrTab=[];
    for(var j=0;j<SiteName.length;j++){
      var siteName=SiteName[j];
      StrTab.push(siteName+'_'+strTabType);
    }
    strCommand+='          '+StrTab.join(' ');
  }
  strCommand="mysqldump mmm --user=root -p --no-create-info --hex-blob"+strCommand+'          >idplace.sql';

  return strCommand;
}





// When reinstalling, to keep the table content, run these mysql queries in for example phpmyadmin:
// CALL "+siteName+"dupMake(); // After this, verify that the duplicate tables have the same number of rows
// (then do the install (run createTable.php))
// CALL "+siteName+"dupTrunkOrgNCopyBack();    // After this, verify that the tables have the same number of rows as the duplicates
// CALL "+siteName+"dupDrop();

