


"use strict"


/******************************************************************************
 * ReqIndex
 ******************************************************************************/
app.ReqIndex=function(req, res){
  this.req=req; this.res=res; this.Str=[];
}

app.ReqIndex.prototype.go=function() {
  var self=this, req=this.req, res=this.res, sessionID=req.sessionID;
  var objQS=req.objQS;
  var site=req.site, siteName=site.siteName, wwwSite=req.wwwSite;

  getSessionMain.call(this); // sets this.sessionMain
  if(!this.sessionMain || typeof this.sessionMain!='object') { resetSessionMain.call(this); }  
  var redisVar=this.req.sessionID+'_Main', tmp=wrapRedisSendCommand('expire',[redisVar,maxUnactivity]);

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

  
  
  var idUser=null; if(typeof this.sessionMain=='object' && 'idUser' in this.sessionMain) idUser=this.sessionMain.idUser;
  var fiber=Fiber.current;

  var Sql=[], Val=[];
  Sql.push("CALL "+siteName+"getUserAppInfo(?,?);"); Val.push(idUser, idApp);

  var sql=Sql.join('\n');
  var boDoExit=0, results;
  myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
    if(err){res.out500(err);  boDoExit=1; return; } 
    else{
      results=resultsT;
      fiber.run(); 
    }
  });
  Fiber.yield();  if(boDoExit==1) return;
  
  
  var userInfoFrDB={};
  if(results[0].length)  {  
    delete results[0][0].idUser;
    userInfoFrDB=results[0][0];
    //if(results[1].length) userInfoFrDB.imageHash=results[1][0].imageHash;
  } else{
    if(idUser!==null) { resetSessionMain.call(this); idUser=null;}
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
  var boMSIE=RegExp('/msie/').test(ua), boAndroid=RegExp('/android/').test(ua), boFireFox=RegExp('/firefox/').test(ua), boIOS= RegExp('/iPhone|iPad|iPod/i').test(ua);
  if(/facebookexternalhit/.test(ua)) { objQS.lang='en';  }
  if('fb_locale' in objQS) objQS.lang=objQS.fb_locale.substr(0,2);   
  var strLang='en';


  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, post-check=0, pre-check=0"); // no-cache
  res.statusCode=200;

  var CSRFCode=randomHash(); 
  var redisVar=sessionID+'_CSRFCodeIndex',  tmp=wrapRedisSendCommand('set',[redisVar,CSRFCode]);    tmp=wrapRedisSendCommand('expire',[redisVar,maxUnactivity]);
//debugger
  
  var Str=[];
  var tmp='<!DOCTYPE html>\n\
<html><head>\n\
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>\n\
<meta name="generator" content="maWiki">';
  Str.push(tmp);


  var uSite=req.strSchemeLong+wwwSite;
  var uIcon16=uSite+'/'+wIcon16,   uIcon114=uSite+'/'+wIcon114,   uIcon200=uSite+'/'+wIcon200;
  Str.push('<link rel="icon" type="image/png" href="'+uIcon16+'" />');
  Str.push('<link rel="apple-touch-icon-precomposed" href="'+uIcon114+'"/>');

  Str.push("<meta name='viewport' id='viewportMy' content='initial-scale=1'/>");

  if(boAuthReq){ Str.push('<meta name="robots" content="noindex">\n'); }

  Str.push('<link rel="canonical" href="'+uSite+'"/>\n');

  var strTitle='idPlace - an ID provider using the OAuth standard';
  var strH1='idPlace - an ID provider using the OAuth standard';
  var strDescription='Open source ID provider using OAuth.';
  var strKeywords=strDescription;
  var strSummary=strDescription;


  Str.push('\
<meta name="description" content="'+strDescription+'"/>\n\
<meta name="keywords" content="'+strKeywords+'"/>\n\
<link rel="canonical" href="'+uSite+'"/>\n');

  
  var tmp='\
<meta property="og:title" content="'+wwwSite+'"/>\n\
<meta property="og:type" content="website" />\n\
<meta property="og:url" content="'+uSite+'"/>\n\
<meta property="og:image" content="'+uIcon200+'"/>\n\
<meta property="og:site_name" content="'+wwwSite+'"/>\n\
<meta property="fb:admins" content="100002646477985"/>\n\
<meta property="fb:app_id" content="'+req.rootDomain.fb.id+'"/>\n\
<meta property="og:description" content="'+strDescription+'"/>\n\
<meta property="og:locale:alternate" content="sv_se" />\n\
<meta property="og:locale:alternate" content="en_US" />\n';
  if(!boDbg) Str.push(tmp);


  var tmp='\
<script>\n\
  window.fbAsyncInit = function() {\n\
    FB.init({\n\
      appId      : "'+req.rootDomain.fb.id+'",\n\
      xfbml      : true,\n\
      version    : "v2.6"\n\
    });\n\
  };\n\
\n\
  (function(d, s, id){\n\
     var js, fjs = d.getElementsByTagName(s)[0];\n\
     if (d.getElementById(id)) {return;}\n\
     js = d.createElement(s); js.id = id;\n\
     js.src = "//connect.facebook.net/en_US/sdk.js";\n\
     fjs.parentNode.insertBefore(js, fjs);\n\
   }(document, "script", "facebook-jssdk"));\n\
</script>\n';
  Str.push(tmp);


  //var uJQuery='https://code.jquery.com/jquery-latest.min.js';    if(boDbg) uJQuery=uSite+'/'+flFoundOnTheInternetFolder+"/jquery-latest.js";      Str.push("<script src='"+uJQuery+"'></script>");
  var uJQuery='https://code.jquery.com/jquery-3.2.1.min.js';    if(boDbg) uJQuery=uSite+'/'+flFoundOnTheInternetFolder+"/jquery-3.2.1.min.js";
  Str.push('<script src="'+uJQuery+'" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>');
 
  
  Str.push('<script src="'+uSite+'/lib/foundOnTheInternet/sha1.js"></script>');
  //Str.push('<script src="'+uSite+'/lib/foundOnTheInternet/md5.js"></script>');

    // If boDbg then set vTmp=0 so that the url is the same, this way the debugger can reopen the file between changes

    // Use normal vTmp on iOS (since I don't have any method of disabling cache on iOS devices (nor any debugging interface))
  var boDbgT=boDbg; if(boIOS) boDbgT=0;
    // Include stylesheets
  var pathTmp='/stylesheets/style.css', vTmp=CacheUri[pathTmp].eTag; if(boDbgT) vTmp=0;    Str.push('<link rel="stylesheet" href="'+uSite+pathTmp+'?v='+vTmp+'" type="text/css">');

    // Include JS-files
  var StrTmp=['lib.js', 'libClient.js', 'client.js'];
  for(var i=0;i<StrTmp.length;i++){
    var pathTmp='/'+StrTmp[i], vTmp=CacheUri[pathTmp].eTag; if(boDbgT) vTmp=0;    Str.push('<script src="'+uSite+pathTmp+'?v='+vTmp+'"></script>');
  }



  var strTracker, tmpID=site.googleAnalyticsTrackingID||null;
  if(boDbg||!tmpID){strTracker="<script> ga=function(){};</script>";}else{ 
  strTracker="\n\
<script type=\"text/javascript\">\n\
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\n\
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n\
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n\
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');\n\
  ga('create', '"+tmpID+"', 'auto');\n\
  ga('send', 'pageview');\n\
</script>\n";
  }
  Str.push(strTracker);

  Str.push("<script src='https://www.google.com/recaptcha/api.js'></script>");



  Str.push("</head>");
  Str.push('<body style="visibility:hidden">');

  Str.push("<title>"+strTitle+"</title>\n<h1>"+strH1+"</h1>\n");

  Str.push("\n<script>\n\
wwwSite="+JSON.stringify(wwwSite)+";\n\
CSRFCode="+JSON.stringify(CSRFCode)+";\n\
leafBE="+JSON.stringify(leafBE)+";\n\
flLibImageFolder="+JSON.stringify(flLibImageFolder)+";\n\
boTLS="+JSON.stringify(site.boTLS)+";\n\
Prop="+JSON.stringify(Prop)+";\n\
strSalt="+JSON.stringify(strSalt)+";\n\
boDbg="+JSON.stringify(boDbg)+";\n\
site="+JSON.stringify(site)+";\n\
leafLoginBack="+JSON.stringify(leafLoginBack)+";\n\
userInfoFrDB="+JSON.stringify(userInfoFrDB)+";\n\
objApp="+JSON.stringify(objApp)+";\n\
objUApp="+JSON.stringify(objUApp)+";\n\
strReCaptchaSiteKey="+JSON.stringify(strReCaptchaSiteKey)+";\n\
\n\
</script>\n\
\n\
<form  id=loginTraditional>\n\
<label name=email>Email</label><input type=email name=email>\n\
<label name=password>Password</label><input type=password name=password>\n\
<button type=submit name=submit class=highStyle value=\"Sign in\">Sign in</button> \n\
</form>\n\
\n\
</body>\n\
</html>");
//maxUnactivityToken="+JSON.stringify(maxUnactivityToken)+";\n\
//specialistDefault="+JSON.stringify(specialistDefault)+";\n\
//scope="+JSON.stringify(scope)+";\n\
//scopeAsked="+JSON.stringify(scopeAsked)+";\n\
//boAuthReq="+JSON.stringify(boAuthReq)+";\n\
//boScopeOK="+JSON.stringify(boScopeOK)+";\n\
//boRedirURIOK="+JSON.stringify(boRedirURIOK)+";\n\

  var str=Str.join('\n');   res.writeHead(200, "OK", {'Content-Type': 'text/html'});   res.end(str);    
}



/******************************************************************************
 * ReqMe
 ******************************************************************************/
app.ReqMe=function(req, res){
  this.req=req; this.res=res; this.Str=[];
}

app.ReqMe.prototype.go=function() {
  var self=this, req=this.req, res=this.res, sessionID=req.sessionID, site=req.site, TableName=site.TableName;
  var user2AppTab=TableName.user2AppTab, userTab=TableName.userTab;
  var objQS=req.objQS;
  var site=req.site, siteName=site.siteName;
  var wwwSite=req.wwwSite

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, post-check=0, pre-check=0"); // no-cache
  res.setHeader('Content-Type', 'application/json');

  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");

  if('origin' in req.headers){ //if cross site
    var http_origin=req.headers.origin;
    res.setHeader("Access-Control-Allow-Origin", http_origin); // Allow access. access_token should be available from anywhere (it uses entropy to prevent illegitimate access).
    if(req.method=='OPTIONS'){  res.end(); return;}
  }


  var tmp='access_token'; if(!(tmp in objQS)) {  res.outCode(400, JSON.stringify({error:{type:'invalid_request', message:'The parameter '+tmp+' is required'}}));  return;}
  
  var fiber=Fiber.current;

  var Sql=[], Val=[]; 
  Sql.push("SELECT name, image, eTagImage, sizeImage, imageHash, LENGTH(idFB)>0 AS boFB, LENGTH(idGoogle)>0 AS boGoogle, address, zip, city, county, federatedState, country, timeZone, email, boEmailVerified, telephone, idNational, birthdate,  motherTongue, gender, \n\
UNIX_TIMESTAMP(tCreated) AS tCreated, \n\
UNIX_TIMESTAMP(tName) AS tName,  \n\
UNIX_TIMESTAMP(tImage) AS tImage,  \n\
UNIX_TIMESTAMP(tEmail) AS tEmail,  \n\
UNIX_TIMESTAMP(tTelephone) AS tTelephone,  \n\
UNIX_TIMESTAMP(tCountry) AS tCountry,  \n\
UNIX_TIMESTAMP(tFederatedState) AS tFederatedState,  \n\
UNIX_TIMESTAMP(tCounty) AS tCounty  \n\
UNIX_TIMESTAMP(tCity) AS tCity,  \n\
UNIX_TIMESTAMP(tZip) AS tZip,  \n\
UNIX_TIMESTAMP(tAddress) AS tAddress,  \n\
UNIX_TIMESTAMP(tIdFB) AS tIdFB,  \n\
UNIX_TIMESTAMP(tIdGoogle) AS tIdGoogle,  \n\
UNIX_TIMESTAMP(tIdNational) AS tIdNational,  \n\
UNIX_TIMESTAMP(tBirthdate) AS tBirthdate, \n\
UNIX_TIMESTAMP(tMotherTongue) AS tMotherTongue, \n\
UNIX_TIMESTAMP(tGender) AS tGender, \n\
UNIX_TIMESTAMP(tAccess) AS tAccess, \n\
nName, nImage, nEmail, nTelephone, nCountry, nFederatedState, nCounty, nCity, nZip, nAddress, nIdFB, nIdGoogle, nIdNational, nBirthdate, nMotherTongue, nGender, \n\
scope, maxUnactivityToken, id \n\
FROM "+user2AppTab+" ua JOIN "+userTab+" u ON ua.idUser=u.idUser WHERE access_token=?;");  // u.idUser AS idUser,
  Val.push(objQS.access_token);


//

  
  var sql=Sql.join('\n');
  var boDoExit=0, results;
  myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
    if(err){res.out500(err);  boDoExit=1; return; } 
    else{
      results=resultsT;
      fiber.run(); 
    }
  });
  Fiber.yield();  if(boDoExit==1) return;
   
  if(results.length==0) {  res.outCode(400, JSON.stringify({error:{type:'access_denied', message:'Nothing found for that access_token'}}));  return;  }

  var objUser=results[0], unixNow=(new Date()).valueOf()/1000;
  if(objUser.tAccess+objUser.maxUnactivityToken<unixNow) {  debugger;  var tmp='The access_token has timed out'; res.outCode(400, JSON.stringify({error:{type:'access_denied', message:tmp}}));  return;  }
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
  Str.push(JSON.stringify(objUserN));

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
 * ReqToken
 ******************************************************************************/
app.ReqToken=function(req, res){
  this.req=req; this.res=res; this.Str=[];
}

app.ReqToken.prototype.go=function() {
  var self=this, req=this.req, res=this.res, sessionID=req.sessionID, site=req.site, TableName=site.TableName;
  var user2AppTab=TableName.user2AppTab, userTab=TableName.userTab, appTab=TableName.appTab;
  var objQS=req.objQS;
  var site=req.site, siteName=site.siteName, wwwSite=req.wwwSite;
  var wwwSite=req.wwwSite

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, post-check=0, pre-check=0"); // no-cache
  res.setHeader('Content-Type', 'application/json');

  var fiber=Fiber.current;

  if (req.method == 'POST') {
    var body = '', boDoExit=0;
    req.on('data', function (data) {
      body+=data;  if(body.length > 1000)  { req.connection.destroy(); console.log('Aborting when '+body.length+' bytes data was received!!'); boDoExit=1; fiber.run(); }
    });
    req.on('end', function () {
      objQS=querystring.parse(body); 
      fiber.run(); 
    });
    Fiber.yield();  if(boDoExit==1)  return;
  }



  var StrNeeded=['grant_type', 'client_id', 'redirect_uri', 'client_secret', 'code'];
  for(var i=0;i<StrNeeded.length;i++){
    var tmp=StrNeeded[i]; if(!(tmp in objQS)) { res.outCode(400, JSON.stringify({error:{type:'invalid_request', message:'The parameter '+tmp+' is required'}})); return;}
  }
  

  var Sql=[], Val=[];
  Sql.push("SELECT u.idUser AS idUser, u.name AS name, image, eTagImage, sizeImage, u.imageHash AS imageHash, LENGTH(idFB)>0 AS boFB, LENGTH(idGoogle)>0 AS boGoogle, address, zip, city, county, federatedState, country, timeZone, email, boEmailVerified, telephone, idNational, birthdate,  motherTongue, gender, \n\
UNIX_TIMESTAMP(tCreated) AS tCreated, \n\
UNIX_TIMESTAMP(tName) AS tName,  \n\
UNIX_TIMESTAMP(tImage) AS tImage,  \n\
UNIX_TIMESTAMP(tEmail) AS tEmail,  \n\
UNIX_TIMESTAMP(tTelephone) AS tTelephone,  \n\
UNIX_TIMESTAMP(tCountry) AS tCountry,  \n\
UNIX_TIMESTAMP(tFederatedState) AS tFederatedState,  \n\
UNIX_TIMESTAMP(tCounty) AS tCounty,  \n\
UNIX_TIMESTAMP(tCity) AS tCity,  \n\
UNIX_TIMESTAMP(tZip) AS tZip,  \n\
UNIX_TIMESTAMP(tAddress) AS tAddress,  \n\
UNIX_TIMESTAMP(tIdFB) AS tIdFB,  \n\
UNIX_TIMESTAMP(tIdGoogle) AS tIdGoogle,  \n\
UNIX_TIMESTAMP(tIdNational) AS tIdNational,  \n\
UNIX_TIMESTAMP(tBirthdate) AS tBirthdate, \n\
UNIX_TIMESTAMP(tMotherTongue) AS tMotherTongue, \n\
UNIX_TIMESTAMP(tGender) AS tGender, \n\
UNIX_TIMESTAMP(tAccess) AS tAccess, \n\
nName, nImage, nEmail, nTelephone, nCountry, nFederatedState, nCounty, nCity, nZip, nAddress, nIdFB, nIdGoogle, nIdNational, nBirthdate, nMotherTongue, nGender, \n\
scope, maxUnactivityToken, access_token, secret, id \n\
FROM "+user2AppTab+" ua JOIN "+userTab+" u ON ua.idUser=u.idUser JOIN "+appTab+" a ON ua.idApp=a.idApp WHERE code=?;");
  Val.push(objQS.code);

  
  var sql=Sql.join('\n');
  var boDoExit=0, results;
  myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
    if(err){res.out500(err);  boDoExit=1; return; } 
    else{
      results=resultsT;
      fiber.run(); 
    }
  });
  Fiber.yield();  if(boDoExit==1) return;
   
  if(results.length==0) {  res.outCode(400, JSON.stringify({error:{type:'access_denied', message:'Nothing found for that authentication code'}}));  return;  }

  var objUser=results[0], unixNow=(new Date()).valueOf()/1000;
  if(objUser.tAccess+500<unixNow) {   var tmp='The authentication code has timed out'; res.outCode(400, JSON.stringify({error:{type:'access_denied', message:tmp}}));  return;  }
  if(objUser.secret!=objQS.client_secret) {   var tmp='Wrong client_secret'; res.outCode(400, JSON.stringify({error:{type:'access_denied', message:tmp}}));  return;  }
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
  Str.push(JSON.stringify(objUserN));

  var str=Str.join('\n');   res.writeHead(200, "OK");   res.end(str);    
}



/******************************************************************************
 * ReqLoginBack
 ******************************************************************************/
var ReqLoginBack=app.ReqLoginBack=function(req, res){
  this.req=req; this.res=res; this.site=req.site; this.mess=[];  this.Str=[];
}
ReqLoginBack.prototype.go=function(){
  var self=this, req=this.req, res=this.res, objQS=req.objQS;
  var wwwLoginScopeTmp=null; if('wwwLoginScope' in this.site) wwwLoginScopeTmp=this.site.wwwLoginScope;
  var uSite=req.strSchemeLong+req.wwwSite;

  var Str=[];
  Str.push("\n\
<html><head><meta name='robots' content='noindex'>\n\
<link rel='canonical' href='"+uSite+"'/>\n\
</head>\n\
<body>\n\
<script>\n\
var wwwLoginScope="+JSON.stringify(wwwLoginScopeTmp)+";\n\
if(wwwLoginScope) document.domain = wwwLoginScope;\n\
var strQS=location.search;\n\
var strHash=location.hash;\n\
debugger\n\
//alert('strHash: '+strHash);\n\
window.opener.loginReturn(strQS,strHash);\n\
window.close();\n\
</script>\n\
</body>\n\
</html>\n\
");
  var str=Str.join('\n');  this.res.end(str);
}


/******************************************************************************
 * ReqImage
 ******************************************************************************/
app.ReqImage=function(req, res){
  this.req=req; this.res=res; this.site=req.site;
}
app.ReqImage.prototype.go=function() {
  var self=this, req=this.req, res=this.res;
  var site=req.site, objQS=req.objQS, wwwSite=req.wwwSite, siteName=req.siteName, pathName=req.pathName;
  var TableName=site.TableName;
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
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err) { res.out500(err); return;}
    if(results.length>0){
      var strData=results[0].data;
      var eTag=crypto.createHash('md5').update(strData).digest('hex'); 
      ETagImage[keyCache]=eTag;  if(eTag===this.eTagIn) { res.out304(); return; }
      var maxAge=3600*8760, mimeType=MimeType.jpg;
      res.writeHead(200, {"Content-Type": mimeType, "Content-Length":strData.length, ETag: eTag, "Cache-Control":"public, max-age="+maxAge}); // "Last-Modified": maxModTime.toUTCString(),
      res.end(strData);
    }else{
      //res.setHeader("Content-type", "image/png");
      var uNew=uSite+"/lib/image/anonHashNotInDB.png";
      res.writeHead(302, {'Location': uNew});   res.end();
    }
  });
}


/******************************************************************************
 * ReqVerifyEmailReturn
 ******************************************************************************/
app.ReqVerifyEmailReturn=function(req, res){
  this.req=req; this.res=res; this.Str=[];
}
app.ReqVerifyEmailReturn.prototype.go=function(){
  var self=this, req=this.req, res=this.res, site=req.site, sessionID=req.sessionID;
  var userTab=site.TableName.userTab;
  var objQS=req.objQS;
  var tmp='code'; if(!(tmp in objQS)) { res.out200('The parameter '+tmp+' is required'); return;}
  var codeIn=objQS.code;
  var redisVar=codeIn+'_verifyEmail';
  var idUser=wrapRedisSendCommand('get',[redisVar]);
  
  if(idUser===null) { res.out200('No such code'); return;}

  var fiber=Fiber.current;

  var Sql=[], Val=[];
  Sql.push("UPDATE "+userTab+" SET boEmailVerified=1 WHERE idUser=?;");
  Val.push(idUser);

  var sql=Sql.join('\n');
  var boDoExit=0, results;
  myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
    if(err){res.out500(err);  boDoExit=1; return; } 
    else{
      results=resultsT;
      fiber.run(); 
    }
  });
  Fiber.yield();  if(boDoExit==1) return;

  var c=results.affectedRows, mestmp; 
  if(c==1) { mestmp="Email verified"; } else {mestmp="Error (Nothing done)"; }
  res.end(mestmp);
}





/******************************************************************************
 * ReqVerifyPWResetReturn
 ******************************************************************************/
app.ReqVerifyPWResetReturn=function(req, res){
  this.req=req; this.res=res; this.Str=[];
}
app.ReqVerifyPWResetReturn.prototype.go=function(){
  var self=this, req=this.req, res=this.res, site=req.site, sessionID=req.sessionID;
  var userTab=site.TableName.userTab;
  var objQS=req.objQS;
  var tmp='code'; if(!(tmp in objQS)) { res.out200('The parameter '+tmp+' is required'); return;}
  var codeIn=objQS.code;
  var redisVar=codeIn+'_verifyPWReset';
  var email=wrapRedisSendCommand('get',[redisVar]);
  
  if(email===null) { res.out200('No such code'); return;}

  var password=randomHash();
  var passwordHash=SHA1(password+strSalt);

  var fiber=Fiber.current;

  var Sql=[], Val=[];
  Sql.push("UPDATE "+userTab+" SET password=? WHERE email=?;");
  Val.push(passwordHash, email);

  var sql=Sql.join('\n');
  var boDoExit=0, results;
  myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
    if(err){res.out500(err);  boDoExit=1; return; } 
    else{
      results=resultsT;
      fiber.run(); 
    }
  });
  Fiber.yield();  if(boDoExit==1) return;

  var c=results.affectedRows, mestmp; 
  if(c!=1) { res.out500("Error ("+c+" affectedRows)"); return; }


  var wwwSite=req.wwwSite;
  var strTxt='<h3>New password on '+wwwSite+'</h3> \n\
<p>Your new password on '+wwwSite+' is '+password+'</p>';
  

  var semCB=0, semY=0, boDoExit=0;
  objSendgrid.send({
    to:       email,
    from:     sendgridName,
    subject:  'Password reset',
    html:     strTxt
  }, function(err, json) {
    if(err){self.mesEO(err); boDoExit=1;} 
    if(semY)fiber.run(); semCB=1;
  });
  if(!semCB){semY=1; Fiber.yield();}  if(boDoExit==1) {callback('exited'); return; }

  res.end("A new password has been generated and sent to your email address.");
}




/******************************************************************************
 * ReqStatic
 ******************************************************************************/
var ReqStatic=app.ReqStatic=function(req, res){
  this.req=req; this.res=res;  this.Str=[];
}
ReqStatic.prototype.go=function() {
  var self=this, req=this.req, res=this.res;
  var pathName=req.pathName;

  var fiber = Fiber.current; 
  var eTagIn=getETag(req.headers);
  var keyCache=pathName; //if(pathName==='/'+leafSiteSpecific) keyCache=req.strSite+keyCache; 
  if(!(keyCache in CacheUri)){
    var filename=pathName.substr(1);    
    var err=readFileToCache(filename);
    if(err) {
      if(err.code=='ENOENT') {res.out404(); return;}
      res.out500(err); return;
    }
  }
  var cacheUri=CacheUri[keyCache];
  if(cacheUri.eTag===eTagIn){ res.out304(); return; } 
  var buf=cacheUri.buf, type=cacheUri.type,  eTag=cacheUri.eTag, boZip=cacheUri.boZip, boUglify=cacheUri.boUglify;
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
 * ReqCaptcha
 ******************************************************************************/
app.ReqCaptcha=function(req, res){
  this.req=req; this.res=res; this.Str=[];
}
app.ReqCaptcha.prototype.go=function(){
  var self=this, req=this.req, res=this.res, sessionID=req.sessionID;
  var strCaptcha=parseInt(Math.random()*9000+1000);
  var redisVar=sessionID+'_captcha';
  var tmp=wrapRedisSendCommand('set',[redisVar,strCaptcha]);
  var tmp=wrapRedisSendCommand('expire',[redisVar,3600]);
  var p = new captchapng(80,30,strCaptcha); // width,height,numeric captcha
  p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
  p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

  var img = p.getBase64();
  var imgbase64 = new Buffer(img,'base64');
  res.writeHead(200, {
      'Content-Type': 'image/png'
  });
  res.end(imgbase64);
}





/******************************************************************************
 * ReqMonitor
 ******************************************************************************/
app.ReqMonitor=function(req, res){
  this.req=req; this.res=res;   this.Str=[];
}
app.ReqMonitor.prototype.go=function(){
  var self=this, req=this.req, res=this.res;

  if(!objOthersActivity){  //  && boPageBUNeeded===null && boImageBUNeeded===null
    var Sql=[];
    Sql.push("SELECT SQL_CALC_FOUND_ROWS siteName, pageName, tMod FROM "+pageLastView+" WHERE boOther=1 LIMIT 1;");
    Sql.push("SELECT FOUND_ROWS() AS n;");
    Sql.push("SELECT SQL_CALC_FOUND_ROWS imageName, created FROM "+imageTab+" WHERE boOther=1  LIMIT 1;");
    Sql.push("SELECT FOUND_ROWS() AS n;");
    //Sql.push("SELECT key, value FROM "+settingTab+" WHERE key='tPageBU' OR key 'tImageBU';");
    //Sql.push("SELECT max(tMod) AS tMax FROM "+versionTab+";");
    //Sql.push("SELECT max(created) AS tMax FROM "+imageTab+";");


    var sql=Sql.join('\n'), Val=[];
    var fiber = Fiber.current, boDoExit=0, results;
    myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
      if(err){res.out500(err);  boDoExit=1; return; } 
      else{
        results=resultsT;
        fiber.run(); 
      }
    });
    Fiber.yield();  if(boDoExit==1) return;

    var resP=results[0], nEdit=results[1][0].n, pageName=nEdit==1?resP[0].siteName+':'+resP[0].pageName:nEdit;
    var resI=results[2], nImage=results[3][0].n, imageName=nImage==1?resI[0].imageName:nImage;
    objOthersActivity={nEdit:nEdit, pageName:pageName,  nImage:nImage, imageName:imageName};

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
  res.end("<body style=\"margin: 0px;padding: 0px\">"+strPage+" / "+strImg+"</body>");

}


/******************************************************************************
 * ReqStat
 ******************************************************************************/
app.ReqStat=function(req, res){
  this.req=req; this.res=res; this.Str=[];
}
app.ReqStat.prototype.go=function(){
  var self=this, req=this.req, res=this.res;

  var Sql=[]; 
  Sql.push("SELECT count(*) AS n FROM "+versionTab+";"); 
  Sql.push("SELECT count(*) AS n FROM "+imageTab+";"); 
  Sql.push("SELECT count(*) AS n FROM "+thumbTab+";");
  Sql.push("SELECT count(*) AS n FROM "+videoTab+";"); 
  Sql.push("SELECT count(*) AS n FROM "+fileTab+";");
  Sql.push("SELECT f.idFile AS file, v.idPage AS page, vc.idPage AS cache, i.idImage AS image, t.idImage AS thumb, vid.idVideo AS video FROM "+fileTab+" f \n\
   LEFT JOIN "+versionTab+" v ON f.idFile=v.idFile \n\
   LEFT JOIN "+versionTab+" vc ON f.idFile=vc.idFileCache \n\
   LEFT JOIN "+imageTab+" i ON f.idFile=i.idFile \n\
   LEFT JOIN "+thumbTab+" t ON f.idFile=t.idFile \n\
   LEFT JOIN "+videoTab+" vid ON f.idFile=vid.idFile");

  var sql=Sql.join('\n'), Val=[];
  myQueryF(sql, Val, mysqlPool, function(err, results){
    if(err){res.out500(err); callback(err); return; }
    var nVersion=results[0][0].n, nImage=results[1][0].n, nThumb=results[2][0].n, nVideo=results[3][0].n, nFile=results[4][0].n, resT=results[5];


    var Str=[]; 
    Str.push('<!DOCTYPE html>\n\
    <html><head>\n\
    <meta name="robots" content="noindex">\n\
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" >\n\
    <meta name="viewport" id="viewportMy" content="initial-scale=1" />');


    var uSite=req.strSchemeLong+wwwSite;
    //var uJQuery='https://code.jquery.com/jquery-latest.min.js';    if(boDbg) uJQuery=uSite+'/'+flFoundOnTheInternetFolder+"/jquery-latest.js";      Str.push("<script src='"+uJQuery+"'></script>");
    var uJQuery='https://code.jquery.com/jquery-3.2.1.min.js';    if(boDbg) uJQuery=uSite+'/'+flFoundOnTheInternetFolder+"/jquery-3.2.1.min.js";
    Str.push('<script src="'+uJQuery+'" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>');
 
      // If boDbg then set vTmp=0 so that the url is the same, this way the debugger can reopen the file between changes

      // Include stylesheets
    var pathTmp='/stylesheets/style.css', vTmp=CacheUri[pathTmp].eTag; if(boDbg) vTmp=0;    Str.push('<link rel="stylesheet" href="'+uSite+pathTmp+'?v='+vTmp+'" type="text/css">');

      // Include site specific JS-files
    //var uSite=req.strSchemeLong+req.wwwSite;
    //var keyCache=req.strSite+'/'+leafSiteSpecific, vTmp=CacheUri[keyCache].eTag; if(boDbg) vTmp=0;  Str.push('<script src="'+uSite+'/'+leafSiteSpecific+'?v='+vTmp+'"></script>');

      // Include JS-files
    var StrTmp=['lib.js', 'libClient.js'];
    for(var i=0;i<StrTmp.length;i++){
      var pathTmp='/'+StrTmp[i], vTmp=CacheUri[pathTmp].eTag; if(boDbg) vTmp=0;    Str.push('<script src="'+uSite+pathTmp+'?v='+vTmp+'"></script>');
    }

    Str.push('<script src="'+uSite+'/lib/foundOnTheInternet/sortable.js"></script>');

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

    var str=Str.join('\n');  // res.writeHead(200, "OK", {'Content-Type': 'text/html'}); 
    res.end(str);  
  });
  
}



/******************************************************************************
 * SetupSql
 ******************************************************************************/
app.SetupSql=function(){
  this.strSETScope="SET('name', 'image', 'email', 'telephone', 'country', 'federatedState', 'county', 'zip', 'city', 'address', 'timeZone', 'boFB', 'boGoogle', 'idNational', 'birthdate', 'motherTongue', 'gender', 'all')";
}
app.SetupSql.prototype.table=function(SiteName,boDropOnly){
  if(typeof SiteName=='string') SiteName=[SiteName];
  
  var SqlTabDrop=[], SqlTab=[];
  for(var iSite=0;iSite<SiteName.length;iSite++){
  var siteName=SiteName[iSite]
  var site=Site[siteName]; 
  var Prop=site.Prop, TableName=site.TableName, ViewName=site.ViewName; //, Enum=site.Enum;
  var user2AppTab=TableName.user2AppTab, imageAppTab=TableName.imageAppTab, appTab=TableName.appTab, settingTab=TableName.settingTab, adminTab=TableName.adminTab, imageTab=TableName.imageTab, userTab=TableName.userTab;
  //eval(extractLoc(TableName,'TableName'));  // Doesn't seem to work, perhaps because there is a number in the name one table
  eval(extractLoc(ViewName,'ViewName'));

  var StrTabName=object_values(TableName);
  var tmp=StrTabName.join(', ');
  SqlTabDrop.push("DROP TABLE IF EXISTS "+tmp);     
  SqlTabDrop.push('DROP TABLE IF EXISTS '+userTab);     
  var tmp=object_values(ViewName).join(', ');   if(tmp.length) SqlTabDrop.push("DROP VIEW IF EXISTS "+tmp+"");


  var collate="utf8_general_ci";

  var engine='INNODB';  //engine='MyISAM';
  var auto_increment=1;
    
  var strEnumGender="ENUM('male','female')";
  var strEnumImageSource="ENUM('db','url')";
  //boImageOwn tinyint(1) NOT NULL DEFAULT 0, \n\
  //enumImageSource "+strEnumImageSource+" NOT NULL DEFAULT 'db', \n\
  //imTag int(4) NOT NULL DEFAULT 0, \n\


	  // Create users
  SqlTab.push("CREATE TABLE "+userTab+" ( \n\
  idUser int(4) NOT NULL auto_increment, \n\
  name varchar(128) NOT NULL DEFAULT '', \n\
  password char(40) NOT NULL DEFAULT '', \n\
  image varchar(256) NOT NULL DEFAULT '', \n\
  eTagImage char(32) NOT NULL DEFAULT '', \n\
  sizeImage int(4) NOT NULL DEFAULT 0, \n\
  imageHash char(56) NULL, \n\
  email varchar(128) NOT NULL DEFAULT '', \n\
  boEmailVerified tinyint(1) NOT NULL DEFAULT 0, \n\
  telephone varchar(128) NOT NULL DEFAULT '', \n\
  country varchar(128) NOT NULL DEFAULT '', \n\
  federatedState varchar(128) NOT NULL DEFAULT '', \n\
  county varchar(128) NOT NULL DEFAULT '', \n\
  city varchar(128) NOT NULL DEFAULT '', \n\
  zip varchar(128) NOT NULL DEFAULT '', \n\
  address varchar(128) NOT NULL DEFAULT '', \n\
  timeZone varchar(16) NULL DEFAULT 0, \n\
  idFB char(16) CHARSET utf8 NULL, \n\
  idGoogle varchar(128) CHARSET utf8 NULL, \n\
  idNational varchar(128) CHARSET utf8 NOT NULL DEFAULT '', \n\
  birthdate DATE NOT NULL, \n\
  motherTongue varchar(32) NOT NULL DEFAULT '', \n\
  gender "+strEnumGender+" NOT NULL DEFAULT 'male', \n\
  tCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \n\
  tName TIMESTAMP NOT NULL, \n\
  tImage TIMESTAMP NOT NULL, \n\
  tEmail TIMESTAMP NOT NULL, \n\
  tTelephone TIMESTAMP NOT NULL, \n\
  tCountry TIMESTAMP NOT NULL, \n\
  tFederatedState TIMESTAMP NOT NULL, \n\
  tCounty TIMESTAMP NOT NULL, \n\
  tCity TIMESTAMP NOT NULL, \n\
  tZip TIMESTAMP NOT NULL, \n\
  tAddress TIMESTAMP NOT NULL, \n\
  tIdFB TIMESTAMP NOT NULL, \n\
  tIdGoogle TIMESTAMP NOT NULL, \n\
  tIdNational TIMESTAMP NOT NULL, \n\
  tBirthdate TIMESTAMP NOT NULL, \n\
  tMotherTongue TIMESTAMP NOT NULL, \n\
  tGender TIMESTAMP NOT NULL, \n\
  nName int(4) NOT NULL, \n\
  nImage int(4) NOT NULL, \n\
  nEmail int(4) NOT NULL, \n\
  nTelephone int(4) NOT NULL, \n\
  nCountry int(4) NOT NULL, \n\
  nFederatedState int(4) NOT NULL, \n\
  nCounty int(4) NOT NULL, \n\
  nCity int(4) NOT NULL, \n\
  nZip int(4) NOT NULL, \n\
  nAddress int(4) NOT NULL, \n\
  nIdFB int(4) NOT NULL, \n\
  nIdGoogle int(4) NOT NULL, \n\
  nIdNational int(4) NOT NULL, \n\
  nBirthdate int(4) NOT NULL, \n\
  nMotherTongue int(4) NOT NULL, \n\
  nGender int(4) NOT NULL, \n\
  PRIMARY KEY (idUser), \n\
  UNIQUE KEY (email), \n\
  UNIQUE KEY (imageHash), \n\
  UNIQUE KEY (idFB), \n\
  UNIQUE KEY (idGoogle) \n\
  ) AUTO_INCREMENT = "+auto_increment+", ENGINE="+engine+" COLLATE "+collate+""); 
  SqlTab.push("ALTER TABLE "+userTab+" AUTO_INCREMENT=100000");
  //


  SqlTab.push("CREATE TABLE "+imageTab+" ( \n\
  idUser int(4) NOT NULL, \n\
  data BLOB NOT NULL, \n\
  UNIQUE KEY (idUser), \n\
  FOREIGN KEY (idUser) REFERENCES "+userTab+"(idUser) ON DELETE CASCADE   \n\
  ) ENGINE="+engine+" COLLATE "+collate+""); 

  SqlTab.push("CREATE TABLE "+settingTab+" ( \n\
  name varchar(65) CHARSET utf8 NOT NULL, \n\
  value TEXT CHARSET utf8 NOT NULL, \n\
  UNIQUE KEY (name) \n\
  ) ENGINE="+engine+" COLLATE "+collate+"");

	  // Create admin
  SqlTab.push("CREATE TABLE "+adminTab+" ( \n\
  idUser int(4) NOT NULL, \n\
  boApproved tinyint(1) NOT NULL DEFAULT 0, \n\
  created TIMESTAMP default CURRENT_TIMESTAMP, \n\
  FOREIGN KEY (idUser) REFERENCES "+userTab+"(idUser) ON DELETE CASCADE, \n\
  UNIQUE KEY (idUser) \n\
  ) ENGINE="+engine+" COLLATE "+collate+"");

  //imTag int(4) NOT NULL DEFAULT 0, \n\
	  // Create app
  SqlTab.push("CREATE TABLE "+appTab+" ( \n\
  idApp int(4) NOT NULL auto_increment, \n\
  name varchar(32) NOT NULL DEFAULT '', \n\
  idOwner int(4) NOT NULL, \n\
  redir_uri varchar(128) NOT NULL DEFAULT '', \n\
  created TIMESTAMP default CURRENT_TIMESTAMP, \n\
  secret char(32) NOT NULL DEFAULT '', \n\
  imageHash char(56) NULL, \n\
  PRIMARY KEY (idApp), \n\
  UNIQUE KEY (name), \n\
  UNIQUE KEY (imageHash), \n\
  FOREIGN KEY (idOwner) REFERENCES "+userTab+"(idUser) ON DELETE CASCADE \n\
  ) ENGINE="+engine+" COLLATE "+collate+"");
  SqlTab.push("ALTER TABLE "+appTab+" AUTO_INCREMENT=11000");

  SqlTab.push("CREATE TABLE "+imageAppTab+" ( \n\
  idApp int(4) NOT NULL, \n\
  data BLOB NOT NULL, \n\
  UNIQUE KEY (idApp), \n\
  FOREIGN KEY (idApp) REFERENCES "+appTab+"(idApp) ON DELETE CASCADE   \n\
  ) ENGINE="+engine+" COLLATE "+collate+""); 


    // Create user2App
  SqlTab.push("CREATE TABLE "+user2AppTab+" ( \n\
  idUser int(4) NOT NULL, \n\
  idApp int(4) NOT NULL, \n\
  scope "+this.strSETScope+", \n\
  tAccess TIMESTAMP default CURRENT_TIMESTAMP, \n\
  access_token char(128) NOT NULL DEFAULT '', \n\
  code char(128) NOT NULL DEFAULT '', \n\
  id char(56) NOT NULL DEFAULT '', \n\
  maxUnactivityToken int(4) NOT NULL DEFAULT 0, \n\
  FOREIGN KEY (idUser) REFERENCES "+userTab+"(idUser) ON DELETE CASCADE, \n\
  FOREIGN KEY (idApp) REFERENCES "+appTab+"(idApp) ON DELETE CASCADE, \n\
  UNIQUE KEY (idUser, idApp), \n\
  UNIQUE KEY (access_token), \n\
  UNIQUE KEY (code), \n\
  UNIQUE KEY (id) \n\
  ) ENGINE="+engine+" COLLATE "+collate+"");

  // scope="PECA" //Public, Email, Contact, All
  //scope varchar(128) NOT NULL DEFAULT '', \n\

  }
  if(boDropOnly) return SqlTabDrop;
  else return array_merge(SqlTabDrop, SqlTab);
}



app.SetupSql.prototype.fun=function(SiteName,boDropOnly){
  if(typeof SiteName=='string') SiteName=[SiteName];
  
  var SqlFunctionDrop=[], SqlFunction=[];
  for(var iSite=0;iSite<SiteName.length;iSite++){
  var siteName=SiteName[iSite];
  var site=Site[siteName]; 
  var Prop=site.Prop, TableName=site.TableName, ViewName=site.ViewName; //, Enum=site.Enum;
  var user2AppTab=TableName.user2AppTab, imageAppTab=TableName.imageAppTab, appTab=TableName.appTab, settingTab=TableName.settingTab, adminTab=TableName.adminTab, imageTab=TableName.imageTab, userTab=TableName.userTab;
  //eval(extractLoc(TableName,'TableName'));  // Doesn't seem to work, perhaps because there is a number in the name one table
  eval(extractLoc(ViewName,'ViewName'));
  
  

  //SELECT imageHash FROM "+imageTab+" WHERE idUser=IidUser; \n\

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"getUserAppInfo");
  SqlFunction.push("CREATE PROCEDURE "+siteName+"getUserAppInfo(IidUser int(4), IidApp int(4)) \n\
    proc_label:BEGIN \n\
      SELECT idUser, name, image, eTagImage, sizeImage, imageHash, email, boEmailVerified, telephone, country, federatedState, county, city, zip, address, timeZone, idFB, idGoogle, idNational, birthdate, motherTongue, gender,  \n\
UNIX_TIMESTAMP(tCreated) AS tCreated,  \n\
UNIX_TIMESTAMP(tName) AS tName,  \n\
UNIX_TIMESTAMP(tImage) AS tImage,  \n\
UNIX_TIMESTAMP(tEmail) AS tEmail,  \n\
UNIX_TIMESTAMP(tTelephone) AS tTelephone,  \n\
UNIX_TIMESTAMP(tCountry) AS tCountry,  \n\
UNIX_TIMESTAMP(tFederatedState) AS tFederatedState,  \n\
UNIX_TIMESTAMP(tCounty) AS tCounty,  \n\
UNIX_TIMESTAMP(tCity) AS tCity,  \n\
UNIX_TIMESTAMP(tZip) AS tZip,  \n\
UNIX_TIMESTAMP(tAddress) AS tAddress,  \n\
UNIX_TIMESTAMP(tIdFB) AS tIdFB,  \n\
UNIX_TIMESTAMP(tIdGoogle) AS tIdGoogle,  \n\
UNIX_TIMESTAMP(tIdNational) AS tIdNational,  \n\
UNIX_TIMESTAMP(tBirthdate) AS tBirthdate,  \n\
UNIX_TIMESTAMP(tMotherTongue) AS tMotherTongue,  \n\
UNIX_TIMESTAMP(tGender) AS tGender,  \n\
nName, nImage, nEmail, nTelephone, nCountry, nFederatedState, nCounty, nCity, nZip, nAddress, nIdFB, nIdGoogle, nIdNational, nBirthdate, nMotherTongue, nGender \n\
 FROM "+userTab+" WHERE idUser=IidUser; \n\
 \n\
         # Note on the below query: If row doesn't exist, then nothing is done \n\
      UPDATE "+user2AppTab+" SET access_token=CONCAT(MD5(RAND()),MD5(RAND())), tAccess=now(), code=CONCAT(MD5(RAND()),MD5(RAND())) WHERE idUser=IidUser AND idApp=IidApp; \n\
      SELECT idApp, name, UNIX_TIMESTAMP(created) AS created, redir_uri, imageHash FROM "+appTab+" WHERE idApp=IidApp; \n\
      SELECT scope, UNIX_TIMESTAMP(tAccess) AS tAccess, access_token, maxUnactivityToken, code, id FROM "+user2AppTab+" ua JOIN "+appTab+" a ON ua.idApp=a.idApp WHERE idUser=IidUser AND a.idApp=IidApp; \n\
    END");  //, password


  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"setConsent");
  SqlFunction.push("CREATE PROCEDURE "+siteName+"setConsent(IidUser int(4), IidApp int(4), Iscope "+this.strSETScope+", ImaxUnactivityToken int(4)) \n\
    proc_label:BEGIN \n\
      DECLARE Vc INT(4); \n\
      DECLARE Vid char(56); \n\
      DECLARE Vaccess_token, Vcode char(128); \n\
      SELECT SQL_CALC_FOUND_ROWS id INTO Vid FROM "+user2AppTab+" WHERE idUser=IidUser AND idApp=IidApp; \n\
      SELECT FOUND_ROWS() INTO Vc; \n\
      SET Vaccess_token=CONCAT(MD5(RAND()),MD5(RAND())); \n\
      SET Vcode=CONCAT(MD5(RAND()),MD5(RAND())); \n\
      IF Vc=0 THEN \n\
        SET Vid=SHA2(CONCAT(IidUser,IidApp,'"+strSaltID+"'),224); \n\
        INSERT INTO "+user2AppTab+" (idUser, idApp, scope, tAccess, access_token, code, maxUnactivityToken, id) VALUES (IidUser, IidApp, Iscope, now(), Vaccess_token, Vcode, ImaxUnactivityToken, Vid);\n\
      ELSE \n\
        UPDATE "+user2AppTab+" SET scope=Iscope, tAccess=now(), access_token=Vaccess_token, code=Vcode, maxUnactivityToken=ImaxUnactivityToken WHERE idUser=IidUser AND idApp=IidApp;\n\
      END IF; \n\
    END");  //, password




  // FLOOR(POW(2,32)*RAND())<<32) | FLOOR(POW(2,32)*RAND();
  //Vaccess_token=CONCAT(MD5(RAND()),MD5(RAND())
/*
  var access_token=randomHash();
  var code=randomHash();
  var sql="INSERT INTO "+user2AppTab+" (idUser, idApp, scope, tAccess, access_token, maxUnactivityToken, code) VALUES (?,?,?,now(),?,?,?) ON DUPLICATE KEY UPDATE scope=?, access_token=?, maxUnactivityToken=?, code=?;";
  var Val=[idUser, inObj.idApp, inObj.scope, access_token, inObj.maxUnactivityToken, code,    inObj.scope, access_token, inObj.maxUnactivityToken, code ];
*/


  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"setPassword");
  SqlFunction.push("CREATE PROCEDURE "+siteName+"setPassword(IidUser int(4), IpwOld VARCHAR(40), IpwNew VARCHAR(40)) \n\
    proc_label:BEGIN \n\
      DECLARE VpwOld VARCHAR(40); \n\
      SELECT password INTO VpwOld FROM "+userTab+" WHERE idUser=IidUser; \n\
      IF FOUND_ROWS()!=1 THEN SELECT CONCAT('Found ', FOUND_ROWS(), ' users') AS mess; LEAVE proc_label; END IF; \n\
      IF VpwOld!=IpwOld THEN SELECT 'Old password does not match' AS mess; LEAVE proc_label; END IF; \n\
      UPDATE "+userTab+" SET password=IpwNew WHERE idUser=IidUser; \n\
      SELECT 'Password changed' AS mess; \n\
 \n\
    END");  


  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"setImage");
  SqlFunction.push("CREATE PROCEDURE "+siteName+"setImage(IidUser int(4), Idata BLOB) \n\
    proc_label:BEGIN \n\
      DECLARE VimageHash char(56); \n\
      SET VimageHash=sha2(Idata,224); \n\
      REPLACE INTO "+imageTab+" (idUser,data) VALUES (IidUser,Idata); \n\
      UPDATE "+userTab+" SET tImage=IF(imageHash IS NULL OR imageHash!=VimageHash, now(), tImage), nImage=nImage+(imageHash IS NULL OR imageHash!=VimageHash), imageHash=VimageHash WHERE idUser=IidUser; \n\
      SELECT VimageHash AS imageHash; \n\
    END"); 

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"deleteImage");
  SqlFunction.push("CREATE PROCEDURE "+siteName+"deleteImage(IidUser int(4)) \n\
    proc_label:BEGIN \n\
      DELETE FROM "+imageTab+" WHERE idUser=IidUser; \n\
      UPDATE "+userTab+" SET tImage=IF(imageHash IS NULL, tImage, now()), imageHash=NULL WHERE idUser=IidUser; \n\
      SELECT NULL AS imageHash; \n\
    END"); 

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"setAppImage");
  SqlFunction.push("CREATE PROCEDURE "+siteName+"setAppImage(IidUser int(4), IidApp int(4), Idata BLOB) \n\
    proc_label:BEGIN \n\
      DECLARE Vtrash int(4); \n\
      DECLARE VimageHash char(56); \n\
      SELECT idApp INTO Vtrash FROM "+appTab+" WHERE idOwner=IidUser AND idApp=IidApp; \n\
      IF FOUND_ROWS()!=1 THEN SELECT CONCAT('Found ', FOUND_ROWS(), ' apps') AS mess; LEAVE proc_label; \n\
      ELSE SELECT 'ok' AS mess; \n\
      END IF; \n\
      SET VimageHash=sha2(Idata,224); \n\
      REPLACE INTO "+imageAppTab+" (idApp,data) VALUES (IidApp,Idata); \n\
      UPDATE "+appTab+" SET imageHash=VimageHash WHERE idApp=IidApp; \n\
      SELECT VimageHash AS imageHash; \n\
    END");  
 
  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"deleteAppImage");
  SqlFunction.push("CREATE PROCEDURE "+siteName+"deleteAppImage(IidUser int(4), IidApp int(4)) \n\
    proc_label:BEGIN \n\
      DECLARE Vtrash int(4); \n\
      SELECT idApp INTO Vtrash FROM "+appTab+" WHERE idOwner=IidUser AND idApp=IidApp; \n\
      IF FOUND_ROWS()!=1 THEN SELECT CONCAT('Found ', FOUND_ROWS(), ' apps') AS mess; LEAVE proc_label; \n\
      ELSE SELECT 'ok' AS mess; \n\
      END IF; \n\
      DELETE FROM "+imageAppTab+" WHERE idApp=IidApp; \n\
      UPDATE "+appTab+" SET imageHash=NULL WHERE idApp=IidApp; \n\
      SELECT NULL AS imageHash; \n\
    END");  

     // START TRANSACTION; \n\
     // IF FOUND_ROWS()=0 THEN SELECT 'user not found' AS mess; LEAVE proc_label; ELSE SELECT '' AS mess; END IF; \n\
     // COMMIT \n\


  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"loginWExternalIP");
  SqlFunction.push("CREATE PROCEDURE "+siteName+"loginWExternalIP(IidIP varchar(128), InameIP varchar(128), Iimage varchar(256), Iemail varchar(128), ItimeZone varchar(16)) \n\
    proc_label:BEGIN \n\
      DECLARE VidUser, VidUserIP, VidUserE int(4); \n\
      SELECT idUser INTO VidUserIP FROM "+userTab+" WHERE idFB=IidIP; \n\
      SELECT idUser INTO VidUserE  FROM "+userTab+" WHERE email=Iemail; \n\
\n\
          # Check that VidUserIP and VidUserE are the same\n\
      IF VidUserIP IS NOT NULL AND VidUserE IS NOT NULL AND VidUserIP!=VidUserE THEN SELECT 'Email used for another account' AS mess; LEAVE proc_label; \n\
      ELSE SELECT 'ok' AS mess; \n\
      END IF; \n\
      SET VidUser=COALESCE(VidUserIP,VidUserE); \n\
\n\
      IF VidUser IS NULL THEN \n\
        INSERT INTO "+userTab+" SET idFB=IidIP, name=InameIP, password=MD5(RAND()), image=Iimage, email=Iemail, timeZone=ItimeZone, birthdate='2000-01-01', \n\
   tCreated=now(), tName=now(), tImage=now(), tEmail=now(), tTelephone=now(), tCountry=now(), tFederatedState=now(), tCounty=now(), tCity=now(), tZip=now(), tAddress=now(), tIdFB=now(), tIdGoogle=now(), tIdNational=now(), tBirthdate=now(), tMotherTongue=now(), tGender=now(); \n\
        SELECT LAST_INSERT_ID() INTO VidUser; \n\
      ELSE \n\
        UPDATE "+userTab+" SET \n\
tIdFB=IF(idFB!=IidIP, now(), tIdFB), \n\
tName=IF(name!=InameIP, now(), tName), \n\
tImage=IF(image!=Iimage AND imageHash IS NULL, now(), tImage), \n\
tEmail=IF(email!=Iemail, now(), tEmail), \n\
boEmailVerified=IF(email!=Iemail, 0, boEmailVerified), \n\
nIdFB=nIdFB+(idFB!=IidIP), \n\
nImage=nImage+(image!=Iimage AND imageHash IS NULL), \n\
nName=nName+(name!=InameIP), \n\
nEmail=nEmail+(email!=Iemail), \n\
idFB=IidIP, name=InameIP, image=Iimage, email=Iemail, timeZone=ItimeZone WHERE idUser=VidUser;\n\
      END IF; \n\
      SELECT VidUser AS idUser; \n\
    END");  







/*
  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"setUser");
  SqlFunction.push("CREATE PROCEDURE "+siteName+"setUser(IIP "+strIPEnum+", IidIP varchar(128), InameIP varchar(128), Iimage varchar(256), OUT OboInserted INT, OUT OidUser INT) \n\
    BEGIN \n\
      DECLARE Vc INT; \n\
      START TRANSACTION; \n\
      INSERT INTO "+userTab+" (IP, idIP, nameIP, image) VALUES (IIP, IidIP, InameIP, Iimage ) ON DUPLICATE KEY UPDATE idUser=LAST_INSERT_ID(idUser), nameIP=InameIP, image=Iimage; \n\
      SET OidUser=LAST_INSERT_ID(); \n\
       \n\
      INSERT INTO "+vendorTab+" (idUser,created, lastPriceChange, posTime, tLastWriteOfTA, histActive) VALUES (OidUser, now(), now(), now(), now(), 1 ) \n\
        ON DUPLICATE KEY UPDATE idUser=idUser; \n\
       \n\
      SET OboInserted=(ROW_COUNT()=1); \n\
       \n\
      COMMIT; \n\
    END;");
  var id='100002646477985';
  SqlFunction.push("CALL "+siteName+"vendorSetup('fb', "+id+", 'Minnie the Moocher', 'http://example.com/abc.jpg', @boInserted, @idUser)");
*/

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"dupMake");
  SqlFunction.push("CREATE PROCEDURE "+siteName+"dupMake() \n\
      BEGIN \n\
        CALL copyTable('"+userTab+"_dup','"+userTab+"'); \n\
        CALL copyTable('"+imageTab+"_dup','"+imageTab+"'); \n\
        CALL copyTable('"+settingTab+"_dup','"+settingTab+"'); \n\
        CALL copyTable('"+adminTab+"_dup','"+adminTab+"'); \n\
        CALL copyTable('"+appTab+"_dup','"+appTab+"'); \n\
        CALL copyTable('"+user2AppTab+"_dup','"+user2AppTab+"'); \n\
      END");

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"dupRename");
 /* SqlFunction.push("CREATE PROCEDURE "+siteName+"dupRename() \n\
      BEGIN \n\
RENAME TABLE "+userTab+" TO "+userTab+"_dup,\n\
             "+imageTab+" TO "+imageTab+"_dup,\n\
             "+settingTab+" TO "+settingTab+"_dup,\n\
             "+adminTab+" TO "+adminTab+"_dup,\n\
             "+appTab+" TO "+appTab+"_dup,\n\
             "+user2AppTab+" TO "+user2AppTab+"_dup;\n\
      END");*/

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"dupTrunkOrgNCopyBack");
  SqlFunction.push("CREATE PROCEDURE "+siteName+"dupTrunkOrgNCopyBack() \n\
      BEGIN \n\
        DELETE FROM "+user2AppTab+" WHERE 1; \n\
        DELETE FROM "+appTab+" WHERE 1; \n\
        DELETE FROM "+adminTab+" WHERE 1; \n\
        DELETE FROM "+settingTab+" WHERE 1; \n\
        DELETE FROM "+imageTab+" WHERE 1; \n\
        DELETE FROM "+userTab+" WHERE 1; \n\
        INSERT INTO "+userTab+" SELECT * FROM "+userTab+"_dup; \n\
        INSERT INTO "+imageTab+" SELECT * FROM "+imageTab+"_dup; \n\
        INSERT INTO "+settingTab+" SELECT * FROM "+settingTab+"_dup; \n\
        INSERT INTO "+adminTab+" SELECT * FROM "+adminTab+"_dup; \n\
        INSERT INTO "+appTab+" SELECT * FROM "+appTab+"_dup; \n\
        INSERT INTO "+user2AppTab+" SELECT * FROM "+user2AppTab+"_dup; \n\
      END");

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+siteName+"dupDrop");
  SqlFunction.push("CREATE PROCEDURE "+siteName+"dupDrop() \n\
      BEGIN \n\
        DROP TABLE IF EXISTS "+user2AppTab+"_dup; \n\
        DROP TABLE IF EXISTS "+appTab+"_dup; \n\
        DROP TABLE IF EXISTS "+adminTab+"_dup; \n\
        DROP TABLE IF EXISTS "+settingTab+"_dup; \n\
        DROP TABLE IF EXISTS "+imageTab+"_dup; \n\
        DROP TABLE IF EXISTS "+userTab+"_dup; \n\
      END");

  }

  var SqlA=this.funcGen(boDropOnly);
  if(boDropOnly) var SqlB=SqlFunctionDrop;
  else var SqlB=array_merge(SqlFunctionDrop, SqlFunction);
  return array_merge(SqlA, SqlB);
}

app.SetupSql.prototype.funcGen=function(boDropOnly){
  var SqlFunction=[], SqlFunctionDrop=[];
  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS copyTable");
  SqlFunction.push("CREATE PROCEDURE copyTable(INameN varchar(128),IName varchar(128)) \n\
    BEGIN \n\
      SET @q=CONCAT('DROP TABLE IF EXISTS ', INameN,';');     PREPARE stmt1 FROM @q;  EXECUTE stmt1;  DEALLOCATE PREPARE stmt1; \n\
      SET @q=CONCAT('CREATE TABLE ',INameN,' LIKE ',IName,';');   PREPARE stmt1 FROM @q;  EXECUTE stmt1; DEALLOCATE PREPARE stmt1; \n\
      SET @q=CONCAT('INSERT INTO ',INameN, ' SELECT * FROM ',IName,';');    PREPARE stmt1 FROM @q;  EXECUTE stmt1;  DEALLOCATE PREPARE stmt1; \n\
    END");

  if(boDropOnly) return SqlFunctionDrop;
  else return array_merge(SqlFunctionDrop, SqlFunction);
}

app.SetupSql.prototype.dummies=function(SiteName){
  if(typeof SiteName=='string') SiteName=[SiteName];
  var SqlDummies=[];
  return SqlDummies;
}

app.SetupSql.prototype.dummy=function(SiteName){
  if(typeof SiteName=='string') SiteName=[SiteName];
  var SqlDummy=[];
  return SqlDummy;
}

app.SetupSql.prototype.truncate=function(SiteName){
  if(typeof SiteName=='string') SiteName=[SiteName];
  
  var SqlTableTruncate=[];
  for(var iSite=0;iSite<SiteName.length;iSite++){
  var siteName=SiteName[iSite]
  var site=Site[siteName]; 

  var StrTabName=object_values(site.TableName);

  var SqlTmp=[];
  for(var i=0;i<StrTabName.length;i++){
    SqlTmp.push(StrTabName[i]+" WRITE");
  }
  var tmp="LOCK TABLES "+SqlTmp.join(', ');
  SqlTableTruncate.push(tmp);
  for(var i=0;i<StrTabName.length;i++){
    SqlTableTruncate.push("DELETE FROM "+StrTabName[i]);
    SqlTableTruncate.push("ALTER TABLE "+StrTabName[i]+" AUTO_INCREMENT = 1");
  }
  SqlTableTruncate.push('UNLOCK TABLES');
  }
  return SqlTableTruncate;
}


app.SetupSql.prototype.doQuery=function(strCreateSql){
  var fiber = Fiber.current;
  var StrValid=['table', 'dropTable', 'fun', 'dropFun', 'truncate', 'dummy', 'dummies'];
  var StrValidMeth=['table', 'fun', 'truncate', 'dummy', 'dummies'];
  var Match=RegExp("^(drop)?(.*?)(All)?$").exec(strCreateSql);
  //var Match=RegExp("^(drop)?(.*?)All$").exec(strCreateSql);
  var boErr=true;
  if(Match) {
    var boDropOnly=Match[1]=='drop', strMeth=Match[2].toLowerCase(); //, boAll=Match[3]=='All';
    //var objProtT=Object.getPrototypeOf(this); 
    if(StrValidMeth.indexOf(strMeth)!=-1){
      //var SqlA=objProtT[strMeth].call(this, SiteName, boDropOnly); 
      var SqlA=this[strMeth](SiteName, boDropOnly); 
      var strDelim=';', sql=SqlA.join(strDelim+'\n')+strDelim, Val=[], boDoExit=0;  
      myQueryF(sql, Val, mysqlPool, function(err, results){ 
        var tmp=createMessTextOfMultQuery(SqlA, err, results);  console.log(tmp); 
        if(err){            boDoExit=1;  debugger;         } 
        fiber.run();
      });
      Fiber.yield();  if(boDoExit==1) return;

      boErr=false;
    }
  }
  if(boErr) {var tmp=strCreateSql+' is not valid input, try: '+StrValid+' (suffixed with "All")'; console.log(tmp); }
}

var createMessTextOfMultQuery=function(Sql, err, results){
  var nSql=Sql.length, nResults='na'; if(results instanceof Array) nResults=results.length;
  var StrMess=[];   StrMess.push('nSql='+nSql+', nResults='+nResults);
  if(err){
    StrMess.push('err.index: '+err.index+', err: '+err);
    if(nSql==nResults){
      var tmp=Sql.slice(bound(err.index-1,0,nSql), bound(err.index+2,0,nSql)),  sql=tmp.join('\n');
      StrMess.push('Since "Sql" and "results" seem correctly aligned (has the same size), then here, in the middle, is printed the query with the corresponding index (surounded by the preceding and following query to get a context):\n'+sql); 
    }
  }
  return StrMess.join('\n');
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
  var objHead={"Content-Type": 'application/zip', "Content-Length":outdata.length, 'Content-Disposition':'attachment; filename='+outFileName};
  res.writeHead(200,objHead);
  res.end(outdata,'binary');
}
ReqSql.prototype.toBrowser=function(objSetupSql){
  var req=this.req, res=this.res, StrType=this.StrType;
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

