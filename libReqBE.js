
// idplace:
//   client.js
//     $createUserSelectorDiv
//       $createUserDiv (calls createUser) (creates user with email and password)
//     $loginSelectorDiv
//       $formLogin (calls loginWEmail, setupById)
//       $idPLoginDiv (calls loginGetGraph, setupById)
//     $changePWPop (calls changePW)
//     $verifyEmailPop (calls verifyEmail)
//     $forgottPWPop (calls verifyPWReset)
//   libReqBE.js
//     createUser 
//     loginWEmail
//     changePW
//     verifyEmail (Sends an email)
//     verifyPWReset (Sends an email)
//   libReq.js
//     reqVerifyEmailReturn (Return from email)
//     reqVerifyPWResetReturn (Return from email)


// closebymarket:
//   client.js
//     $loginWLinkDiv (calls sendLoginLink)
//     $loginWEmailDiv (calls loginWEmail)
//   libReqBE.js
//     sendLoginLink (from $loginWLinkDiv, Sends an email)
//     loginWEmail (from $loginWEmailDiv)
//     createUser
//   libReq.js
//     reqLoginWLink (Return from email)



// closebymarketNew:
//   client.js
//     $loginWLinkDiv (calls sendLoginLink)
//     $loginSelectorDiv
//       $createUserDiv (calls createUser) (creates user with email and password)
//       $formLogin (calls loginWEmail) 
//     $changePWPop (calls changePW)
//     $verifyEmailPop (calls verifyEmail)
//     $forgottPWPop (calls verifyPWReset)
//   libReqBE.js
//     sendLoginLink ( Sends an email)
//     createUser 
//     loginWEmail
//     changePW
//     verifyEmail (Sends an email)
//     verifyPWReset (Sends an email)
//   libReq.js
//     reqLoginWLink (Return from email)
//     reqVerifyEmailReturn (Return from email)
//     reqVerifyPWResetReturn (Return from email)



//           Sign in                               Create account
// [email]/[PW] [forgotPW]  | [FB]      Using password   |  Using Facebook


// $loginSelectorDiv
//       Sign in / Create account
// Using external |    Using                 
// ID-provider    | email/password
// (recommended)  |
//                |
//                |[email]
//                |[PW][Login]
//                |[forgotPW]
//                |---------------
//     [FB]       |Create account
//                |[Full name]
//                |[email]
//                |[PW]
//                |[PW Again]


//        Sign in / Create account
//                | If you used to login with password
//     [FB]       | (not available for new accounts)    
//                |    [email]
//                |    [sendLoginLink]
//                |
//

//        Sign in / Create account
//                | If you used to login with idPlace or password
//     [FB]       | (not available for new accounts)    
//                |    [email]
//                |    [sendLoginLink]
//                |
//



"use strict"

/******************************************************************************
 * ReqBE
 ******************************************************************************/
//app.ReqBE=function(req, res){
  //this.req=req; this.res=res; this.site=req.site; req.sessionCache=req.sessionCache;  this.Str=[]; 
  //this.Out={GRet:{userInfoFrDBUpd:{}}, dataArr:[]}; this.GRet=this.Out.GRet; 
//}

app.ReqBE=function(objReqRes){
  Object.assign(this, objReqRes);
  //this.sessionCache=this.req.sessionCache;
  this.site=this.req.site;
  //this.Str=[];  this.Out={GRet:{userInfoFrDBUpd:{}}, dataArr:[]};  this.GRet=this.Out.GRet; 
  this.Str=[];  this.dataArr=[];  this.GRet={userInfoFrDBUpd:{}}; 
}

  // Method "mesO" and "mesEO" are only called from "go". Method "mes" can be called from any method.
ReqBE.prototype.mes=function(str){ this.Str.push(str); }
ReqBE.prototype.mesO=function(e){
    // Prepare an error-message for the browser.
  var strEBrowser;
  if(typeof e=='string'){strEBrowser=e; }
  else if(typeof e=='object'){
    if(e instanceof Error) {strEBrowser='message: ' + e.message; }
    else { strEBrowser=e.toString(); }
  }
  
    // Write message (and other data) to browser
  this.Str.push(strEBrowser);
  this.GRet.strMessageText=this.Str.join(', '); 
  
  var objOut=copySome({}, this, ["dataArr", "GRet"]);
  this.res.end(serialize(objOut));
}

ReqBE.prototype.mesEO=function(e, statusCode=500){
    // Prepare an error-message for the browser and one for the error log.
  var StrELog=[], strEBrowser;
  if(typeof e=='string'){strEBrowser=e; StrELog.push(e);}
  else if(typeof e=='object'){
    if('syscal' in e) StrELog.push('syscal: '+e.syscal);
    if(e instanceof Error) {strEBrowser=`name: ${e.name}, code: ${e.code}, message: ${e.message}`; }
    else { strEBrowser=e.toString(); StrELog.push(strEBrowser); }
  }
    
  var strELog=StrELog.join('\n'); console.error(strELog);  // Write message to the error log
  if(e instanceof Error) { console.error(e);}
  
    // Write message (and other data) to browser
  this.Str.push(strEBrowser);
  this.GRet.strMessageText=this.Str.join(', ');
  
  //this.res.writeHead(500, {"Content-Type": MimeType.txt}); 
  var objOut=copySome({}, this, ["dataArr", "GRet"]);
  this.res.end(serialize(objOut));
}



ReqBE.prototype.go=async function(){
  var {req, res}=this, {sessionID}=req;
  
  var boSecFetch='sec-fetch-site' in req.headers
  if(boSecFetch){
    var strT=req.headers['sec-fetch-site'];
    if(strT!='same-origin') { this.mesEO(Error(`sec-fetch-site header is not 'same-origin' (${strT})`));  return;}
    
    var strT=req.headers['sec-fetch-dest'];
    if(strT!='empty') { this.mesEO(Error(`sec-fetch-dest header is not 'empty' (${strT})`));  return;}
  
    var strT=req.headers['sec-fetch-user'];
    if(strT && strT=='?1') { this.mesEO(Error(`sec-fetch-user header equals '?1'`));  return;}
    
    var strT=req.headers['sec-fetch-mode'], boT=strT=='no-cors' || strT=='cors';
    if(!boT) { this.mesEO(Error(`sec-fetch-mode header is neither 'no-cors' or 'cors' (${strT})`));  return;}
  }

  if('x-requested-with' in req.headers){
    var str=req.headers['x-requested-with'];   if(str!=="XMLHttpRequest") { this.mesEO(Error("x-requested-with: "+str));  return; }
  } else {  this.mesEO(Error("x-requested-with not set"));  return;  }

    // Extract input data either 'POST' or 'GET'
  var jsonInput;
  if(req.method=='POST'){ 
    if('x-type' in req.headers ){ //&& req.headers['x-type']=='single'
      //var form = new formidable.IncomingForm();
      var form = formidable({});
      //form.multiples = true;  
      //form.uploadDir='tmp';
      
      //var [err, fields, files]=await new Promise(resolve=>{  form.parse(req, (...arg)=>resolve(arg));  });     if(err){ this.mesEO(err); return; }  
      var [err, arrRes]=await form.parse(req).toNBP();    if(err){ this.mesEO(err); return; } 
      var [fields, files]=arrRes;

      this.File=files['fileToUpload[]'];
      if('kind' in fields) this.kind=fields.kind; else this.kind='u';
      //if('captcha' in fields) this.captchaIn=fields.captcha; else this.captchaIn='';
      if('g-recaptcha-response' in fields) this.captchaIn=fields['g-recaptcha-response']; else this.captchaIn='';
      if('strName' in fields) this.strName=fields.strName; else this.strName='';
      if(!(this.File instanceof Array)) this.File=[this.File];
      jsonInput=fields.vec;   
      
    }else{
      var [err,buf]=await new Promise(resolve=>{  var myConcat=concat(bT=>resolve([null,bT]));    req.pipe(myConcat);  });  if(err){ this.mesEO(err); return; }
      jsonInput=buf.toString();
    }
  }
  else if(1){ this.mesEO(new Error('send me a POST')); return; }
  //else if(req.method=='GET'){ var objUrl=url.parse(req.url), qs=objUrl.query||''; jsonInput=urldecode(qs);}
  
  try{ var beArr=JSON.parse(jsonInput); }catch(e){ this.mesEO(e);  return; }
  
  if(!req.boGotSessionCookie) {
    var StrTmp=Array(beArr.length);
    for(var i=0;i<beArr.length;i++){  StrTmp[i]=beArr[i][0]; }
    console.log("Cookie not set, be.json: "+StrTmp.join(', '));
    console.log('user-agent: '+req.headers['user-agent']);
    console.log('host: '+req.headers.host);
    console.log('origin: '+req.headers.origin);
    console.log('referer: '+req.headers.referer);
    console.log('x-requested-with: '+req.headers['x-requested-with']);
    this.mesEO(Error('Cookie not set'));  return
  }

  //if(!req.boCookieStrictOK) {this.mesEO(new Error('Strict cookie not set'));  return;   }
  
    // Check that sessionIDStrict cookie exists and is valid.
  if(!('sessionIDStrict' in req.cookies)) {this.mesEO('no sessionIDStrict cookie'); return}
  var sessionIDStrict=req.cookies.sessionIDStrict;
  var [err, val]=await redis.myGetNExpire(sessionIDStrict+'_Strict', maxUnactivity).toNBP();
  if(!val) {this.mesEO('sessionIDStrict cookie not valid'); return}

  //var keyR=req.sessionID+'_Main';
  //req.sessionCache=await getRedis(keyR, true);
  //if(!req.sessionCache || typeof req.sessionCache!='object') { req.sessionCache={};  this.GRet.userInfoFrDB={};  await delRedis(keyR); }  
  //else { await expireRedis(keyR, maxUnactivity); }
  

  res.setHeader("Content-type", MimeType.json);

    // Remove 'CSRFCode' and 'caller' form beArr
  var CSRFIn, caller='index';
  for(var i=beArr.length-1;i>=0;i--){ 
    var row=beArr[i];
    if(row[0]=='CSRFCode') {CSRFIn=row[1]; array_removeInd(beArr,i);}
    else if(row[0]=='caller') {caller=row[1]; array_removeInd(beArr,i);}
  }


  var len=beArr.length;
  var StrInFunc=Array(len); for(var i=0;i<len;i++){StrInFunc[i]=beArr[i][0];}
  var arrCSRF, arrNoCSRF, allowed, boCheckCSRF, boSetNewCSRF;
  
  if(caller=='index'){
    arrCSRF=['loginGetGraph', 'deleteExtId', 'uploadUser', 'UUpdate', 'createUser', 'UDelete', 'loginWEmail', 'devAppListGet', 'devAppSecret', 'devAppSet', 'devAppDelete', 'setConsent', 'userAppListGet', 'userAppSet', 'userAppDelete', 'changePW', 'verifyEmail', 'verifyPWReset', 'deleteImage', 'uploadImage', 'uploadImageB64'];  // Functions that changes something must check and refresh CSRF-code
    arrNoCSRF=['setupById','logout'];  // ,'testA','testB'
    allowed=arrCSRF.concat(arrNoCSRF);

      // Assign boCheckCSRF and boSetNewCSRF
    boCheckCSRF=0; boSetNewCSRF=0;   for(var i=0; i<beArr.length; i++){ var row=beArr[i]; if(in_array(row[0],arrCSRF)) {  boCheckCSRF=1; boSetNewCSRF=1;}  }    
    if(StrComp(StrInFunc,['setupById'])){ boCheckCSRF=0; boSetNewCSRF=1; }
  }else if(caller=='pubKeyStore'){
    arrCSRF=['pubKeyStore','loginGetGraph'];   arrNoCSRF=['setupById','logout'];   allowed=arrCSRF.concat(arrNoCSRF);

      // Assign boCheckCSRF and boSetNewCSRF
    boCheckCSRF=0; boSetNewCSRF=0;   for(var i=0;i<beArr.length; i++){ var row=beArr[i]; if(in_array(row[0],arrCSRF)) {  boCheckCSRF=1; boSetNewCSRF=1;}  }
    if(StrComp(StrInFunc,['setupById'])){ boCheckCSRF=0; boSetNewCSRF=1; }
  }else if(caller=='mergeID'){
    arrCSRF=['mergeID','loginGetGraph'];   arrNoCSRF=['setupById','logout'];   allowed=arrCSRF.concat(arrNoCSRF);

      // Assign boCheckCSRF and boSetNewCSRF
    boCheckCSRF=0; boSetNewCSRF=0;   for(var i=0;i<beArr.length; i++){ var row=beArr[i]; if(in_array(row[0],arrCSRF)) {  boCheckCSRF=1; boSetNewCSRF=1;}  }
    if(StrComp(StrInFunc,['setupById'])){ boCheckCSRF=0; boSetNewCSRF=1; }

  }else {debugger; }
  
    // Check/set CSRF-code
  var keyR=req.sessionID+'_CSRFCode'+ucfirst(caller), CSRFCode;
  if(boCheckCSRF){
    // if(!CSRFIn){ this.mesO('CSRFCode not set (try reload page)'); return; }
    // var [err,CSRFStored]=await getRedis(keyR); if(err) { this.mesEO(err);  return; }
    // if(CSRFIn!==CSRFStored){ this.mesO('CSRFCode err (try reload page)'); return;}
  }
  if(boSetNewCSRF){
    var CSRFCode=randomHash();
    var tmp=await setRedis(keyR, CSRFCode, maxUnactivity);
    this.GRet.CSRFCode=CSRFCode;
  }
  
  
  var Func=[];
  for(var k=0; k<beArr.length; k++){
    var strFun=beArr[k][0];
    if(in_array(strFun,allowed)) {
      var inObj=beArr[k][1],     tmpf; if(strFun in this) tmpf=this[strFun]; else tmpf=global[strFun];
      if(typeof inObj=='undefined' || typeof inObj=='object') {} else {this.mesO('inObj should be of type object or undefined'); return;}
      var fT=[tmpf,inObj];   Func.push(fT);
    }
  }


  for(var k=0; k<Func.length; k++){
    var [func,inObj]=Func[k],   [err, result]=await func.call(this, inObj);
    if(res.finished) return;
    else if(err){
      if(typeof err=='object' && err.name=='ErrorClient') this.mesO(err); else this.mesEO(err);     return;
    }
    else this.dataArr.push(result);
  }
  this.mesO();
  
}


/******************************************************************************
 * loginGetGraph
 ******************************************************************************/
ReqBE.prototype.loginGetGraph=async function(inObj){
  var {req, res}=this, {site, rootDomain}=req;
  var strFun=inObj.fun;
  var Ou={};
  

  var strIP=inObj.IP;
  var objIPCred=rootDomain[strIP];
  var uRedir=req.strSchemeLong+site.wwwSite+'/'+leafLoginBack;
    // getToken
  var objForm={grant_type:'authorization_code', client_id:objIPCred.id, redirect_uri:uRedir, client_secret:objIPCred.secret, code:inObj.code};
  if(strIP=='fb' || strIP=='google') { var uToGetToken=UrlToken[strIP]; }
  else{ return [new Error('strIP=='+strIP)];}
  //else if(strIP=='idplace') {
    //var uToGetToken = urlAuthIdplace+"/access_token";
  //} 

  

  var params = new URLSearchParams(objForm);
  var [err,response]=await fetch(uToGetToken, {method:'POST', body:params}).toNBP(); if(err) return [err];
  var [err, objT]=await response.json().toNBP(); if(err) return [err];

  if('error' in objT) { var m=objT.error.message; return [new Error(m)]; }
  var access_token=this.access_token=objT.access_token;
  //var access_token=this.access_token=inObj.access_token;



    // Get Graph
  var uGraph=UrlGraph[strIP];
  
  if(strIP=='fb') { var objForm={access_token:this.access_token, fields:"id,name,picture,email"}; }  //,verified
  else if(strIP=='google') { var objForm={access_token:this.access_token, fields:"id,name,verified,image,email"}; }
  //else if(strIP=='idplace') {
    //var uGraph = urlAuthIdplace+"/me";
    //var objForm={access_token:this.access_token};
  //}
  else{ return [new Error('strIP=='+strIP)];}
  



  var params = new URLSearchParams(objForm);
  var [err,response]=await fetch(uGraph, {method:'POST', body:params}).toNBP(); if(err) return [err];
  var [err, objGraph]=await response.json().toNBP(); if(err) return [err];

  this.objGraph=objGraph;

    // interpretGraph
  if('error' in objGraph) {var {type,message}=objGraph.error, tmp=`Error accessing data from ID provider: ${type} ${message}<br>`;  return [new Error(tmp)]; }


  if(strIP=='fb'){ 
    //if(!objGraph.verified) { var tmp="Your facebook account is not verified. Try search internet for  \"How to verify facebook account\".";    return [new ErrorClient(tmp)]; }
    var IP='fb', idIP=objGraph.id, nameIP=objGraph.name, image=objGraph.picture.data.url, email=objGraph.email;
  }else if(strIP=='google'){
    var IP='google', idIP=objGraph.id, nameIP=objGraph.name.givenName+' '+objGraph.name.familyName, image=objGraph.image.url;
  }else if(strIP=='idplace'){
    var IP='idplace', idIP=objGraph.id, nameIP=objGraph.name, image=objGraph.image;
    //var IP='idplace', idIP=objGraph.idUser, nameIP=objGraph.name, image='';
  }

  if(typeof email=='undefined') { return [new ErrorClient("Email is required")];}
  if(typeof idIP=='undefined') { return [new Error("Error idIP is empty")];}
  if(typeof nameIP=='undefined' ) {nameIP=idIP;}
  var regTZ=RegExp('[-]?[0-9]+'), M=inObj.timeZone.match(regTZ), timeZone=M[0];  // timeZone converted from like "GMT+0100 (Central European Standard Time)" to "0100"
  extend(this,{IP, idIP, nameIP, image, email, timeZone});
  
  if(['userFun', 'fetchFun', 'getSecretFun'].indexOf(strFun)!=-1){
    var [err, result]=await this[strFun](inObj);  if(err) return [err];
    if(result) Ou.resultOfFun=result;
  }

  return [null, [Ou]];
}


ReqBE.prototype.userFun=async function(inObj){
  var {req, res}=this, {site}=req,  {siteName}=site;
  var Ou={}; 
   
  var password=randomHash();
  var Sql=[], Val=[]; 
  Sql.push(`CALL ${siteName}loginWExternalIP(?,?,?,?,?);`); Val.push(this.idIP, this.nameIP, this.image, this.email, this.timeZone);

  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  
  var messA=results[0][0].mess;
  var boOK=messA=='ok';
  if(!boOK) { return [new Error(messA)]; }
  var idUser=Number(results[1][0].idUser);
  req.sessionCache.idUser=idUser;
  await setRedis(req.sessionID+'_Main', req.sessionCache, maxUnactivity);
  return [null, Ou];
}

ReqBE.prototype.fetchFun=async function(inObj){
  var {req, res}=this, {site}=req,  {siteName}=site, {userTab}=site.TableName;
  var Ou={}; 
   
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}

  var password=randomHash();
  var Sql=[], Val=[]; 
  Sql.push(`UPDATE ${userTab} SET
tIdFB=IF(idFB<=>?, tIdFB, now()),
tName=IF(name<=>?, tName, now()),
tImage=IF(!(image<=>?) AND imageHash IS NULL, now(), tImage),
tEmail=IF(email<=>?, tEmail, now()),
boEmailVerified=IF(email<=>?, boEmailVerified, 0),
nIdFB=nIdFB+!(idFB<=>?),
nName=nName+!(name<=>?),
nImage=nImage+(!(image<=>?) AND imageHash IS NULL),
nEmail=nEmail+!(email<=>?),
idFB=?, name=?, image=?, email=?, timeZone=? WHERE idUser=?;`);
//tIdFB=IF(idFB IS NULL OR idFB!=?, now(), tIdFB),
//nIdFB=nIdFB+!(idFB IS NULL OR idFB!=?),
Val.push(this.idIP, this.nameIP, this.image, this.email, this.email);
Val.push(this.idIP, this.nameIP, this.image, this.email);
Val.push(this.idIP, this.nameIP, this.image, this.email, this.timeZone, idUser);
  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];

  var c=results.affectedRows, boOK, mestmp; 
  if(c>0) {boOK=1; mestmp="Data changed"; } else {boOK=1; mestmp="Nothing changed"; }
  this.mes(mestmp);
  Ou.boOK=boOK; 
  return [null, Ou];
}
ReqBE.prototype.getSecretFun=async function(inObj){
  var {req, res}=this, {site}=req,  {siteName}=site, {userTab, appTab}=site.TableName;;
  var Ou={};
   
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}

  var Sql=[], Val=[]; 
  Sql.push(`SELECT @idUser:=idUser FROM ${userTab} WHERE idFB=?;`);
  Sql.push("SELECT @idUser AS idUser;");     Val.push(this.idIP);
  Sql.push(`SELECT secret FROM ${appTab} WHERE idOwner=@idUser AND idApp=?;`);    Val.push(inObj.idApp);
  //var sql=`SELECT idUser, secret FROM ${userTab} u JOIN ${appTab} a ON u.idUser=a.idOwner WHERE u.idFB=? AND a.idApp=?;`;
  //var Val=[this.idIP, inObj.idApp];
  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  //if(results.length!=1) {  return [new ErrorClient('results.length='+results.length)]; }
  if(results[1][0].idUser!=idUser) return [new ErrorClient('Wrong user')];
  if(results[2].length!=1) return [new Error(`Found ${results[2].length} results`)];
  Ou.secret=results[2][0].secret;
  return [null, Ou];
}



ReqBE.prototype.deleteExtId=async function(inObj){ // Remove link to the external IP
  var {req, res}=this, {site}=req,  {siteName}=site, {userTab}=site.TableName;
   
  var Ou={}; 
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) {return [new ErrorClient('No session')]; }
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}

  var Sql=[], Val=[]; 
  Sql.push(`UPDATE ${userTab} SET idFB=NULL, image='', tIdFB=now(), tImage=IF(imageHash IS NULL, now(), tImage) WHERE idUser=?`); Val.push(idUser);

  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];

  var c=results.affectedRows, boOK, mestmp; 
  if(c>0) {boOK=1; mestmp="Data deleted"; } else {boOK=1; mestmp="Nothing changed"; }
  this.mes(mestmp);
  Ou.boOK=boOK;      
  return [null, [Ou]];

}


ReqBE.prototype.setupById=async function(inObj){
  var {req}=this, {site}=req,  {siteName}=site, Ou={};
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}


  var idApp=inObj.idApp||null;

  var Sql=[], Val=[];
  Sql.push(`CALL ${siteName}getUserAppInfo(?,?);`); Val.push(idUser, idApp);

  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];


  //this.GRet.userInfoFrDB={};
  if(results[0].length)  {  
    delete results[0][0].idUser;
    this.GRet.userInfoFrDB=results[0][0];
    //if(results[1].length) this.GRet.userInfoFrDB.imageHash=results[1][0].imageHash;
  } else{
    if(idUser!==null) { 
      req.sessionCache={};  this.GRet.userInfoFrDB={};
      //await delRedis(req.sessionID+'_Main');
      await setRedis(req.sessionID+'_Main', req.sessionCache, maxUnactivity);
      idUser=null;
    }
    // return [new Error("User not found?!? (try reload)")];
  }
  
  
  var objApp=null; if(results[1].length) this.GRet.objApp=results[1][0];  // name, created, redir_uri, imageHash
  var objUApp=null; if(results[2].length) this.GRet.objUApp=results[2][0];  //scope, tAccess, access_token, maxUnactivityToken, code

  return [null, [Ou]];
}

ReqBE.prototype.logout=async function(inObj){
  var {req}=this, Ou={};
  req.sessionCache={};  this.GRet.userInfoFrDB={};
  var [err,tmp]=await delRedis([req.sessionID+'_Main']); if(err) return [err]
  //await setRedis(req.sessionID+'_Main', req.sessionCache, maxUnactivity);
  var strMess=`Logged out`;if(boDbg) strMess+=`, ${tmp} session variables deleted`
  this.mes(strMess); return [null, [Ou]];
}

ReqBE.prototype.loginWEmail=async function(inObj){
  var {req}=this, {site}=req, Ou={};
  var userTab=site.TableName.userTab;
  var Sql=[], Val=[];
  var StrRequired=['email', 'password'];
  for(var i=0; i<StrRequired.length; i++){      var tmp=StrRequired[i]; if(!(tmp in inObj)) { return [new ErrorClient(`The parameter: ${tmp} is required`)]; }     }
  

  Sql.push(`SELECT idUser, password FROM ${userTab} WHERE email=?`);
  Val.push(inObj.email);

  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  
  if(results.length==0) return [new ErrorClient('Email not found')];
  var objT=results[0];
  if(objT.password!==inObj.password) { return [new ErrorClient('Wrong password')]; }
  //this.GRet.userInfoFrDB=objT;
  var idUser=req.sessionCache.idUser=Number(objT.idUser);
  await setRedis(req.sessionID+'_Main', req.sessionCache, maxUnactivity);

  return [null, [Ou]];
}



/*********************************************************************************************
 * User-functions
 *********************************************************************************************/

ReqBE.prototype.UUpdate=async function(inObj){ // writing needSession
  var {req}=this, {site}=req, {siteName}=site;
  var {userTab}=site.TableName;
  var Ou={}; 
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}

  if(!/\S+@\S+/.test(inObj.email)) return [new ErrorClient('Invalid email')];
    

  var Sql=[], Val=[];

  Sql.push(`UPDATE ${userTab} SET
tName=IF(name!=?, now(), tName),
tEmail=IF(email!=?, now(), tEmail),
boEmailVerified=IF(email!=?, 0, boEmailVerified),
tTelephone=IF(telephone!=?, now(), tTelephone),
tCountry=IF(country!=?, now(), tCountry),
tFederatedState=IF(federatedState!=?, now(), tFederatedState),
tCounty=IF(county!=?, now(), tCounty),
tCity=IF(city!=?, now(), tCity),
tZip=IF(zip!=?, now(), tZip),
tAddress=IF(address!=?, now(), tAddress),
tIdNational=IF(idNational!=?, now(), tIdNational),
tBirthdate=IF(birthdate!=?, now(), tBirthdate),
tMotherTongue=IF(motherTongue!=?, now(), tMotherTongue),
tGender=IF(gender!=?, now(), tGender),
nName=nName+(name!=?),
nEmail=nEmail+(email!=?),
nTelephone=nTelephone+(telephone!=?),
nCountry=nCountry+(country!=?),
nFederatedState=nFederatedState+(federatedState!=?),
nCounty=nCounty+(county!=?),
nCity=nCity+(city!=?),
nZip=nZip+(zip!=?),
nAddress=nAddress+(address!=?),
nIdNational=nIdNational+(idNational!=?),
nBirthdate=nBirthdate+(birthdate!=?),
nMotherTongue=nMotherTongue+(motherTongue!=?),
nGender=nGender+(gender!=?),
name=?,
email=?,
telephone=?,
country=?, federatedState=?, county=?, city=?, zip=?, address=?,
idNational=?,
birthdate=?,
motherTongue=?,
gender=?
WHERE idUser=?;`);


//tImage=IF(boImageOwn!=? OR image!=?OR eTagImage!=?, now(), tImage),
//tIdFB=IF(idFB!=?, now(), tIdFB),
//tIdGoogle=IF(idGoogle!=?, now(), tIdGoogle),
//boImageOwn=?, eTagImage=?, sizeImage=?,
//idFB=?,
//idGoogle=?,
//boImageOwn, eTagImage, idFB, idGoogle, 
//boImageOwn, eTagImage, sizeImage, idFB, idGoogle, 
//timeZone=?,
//timeZone,

  for(var name in inObj){
    var value=inObj[name];
    if(name=='email') {
      var boOK=validator.isEmail(value); if(!boOK) return [new ErrorClient(name+" didn't pass validation test. Searching/contacting support might be an idea.")];
    } else if(typeof value=='string') inObj[name]=myJSEscape(value);
    
  };

  var o=inObj;
  Val=Val.concat(o.name, o.email, o.email, o.telephone, o.country, o.federatedState, o.county, o.city, o.zip, o.address, o.idNational, o.birthdate, o.motherTongue, o.gender);
  Val=Val.concat(o.name, o.email, o.telephone, o.country, o.federatedState, o.county, o.city, o.zip, o.address, o.idNational, o.birthdate, o.motherTongue, o.gender);
  Val=Val.concat(o.name, o.email, o.telephone, o.country, o.federatedState, o.county, o.city, o.zip, o.address, o.idNational, o.birthdate, o.motherTongue, o.gender);
  Val=Val.concat(idUser);

  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  this.mes('Data updated');      
  return [null, [Ou]];
}
//'name', 'password', 'image', 'email', 'telephone',    'country', 'federatedState', 'county', 'city', 'zip', 'address',    'fb', 'google', 'idNational', 'birthdate', 'motherTongue', 'gender' 


ReqBE.prototype.createUser=async function(inObj){ // writing needSession
  var {req}=this, {site}=req;
  var userTab=site.TableName.userTab;
  var Ou={}; //debugger

  //var tmp=req.sessionCache.userInfoFrIP, IP=tmp.IP, idIP=tmp.idIP, nameIP=tmp.nameIP, image=tmp.image;

    // Check reCaptcha with google
  var strCaptchaIn=inObj['g-recaptcha-response'];
  var uGogCheck = "https://www.google.com/recaptcha/api/siteverify"; 
  var objForm={  secret:strReCaptchaSecretKey, response:strCaptchaIn, remoteip:req.connection.remoteAddress  };
  
  
  const params = new URLSearchParams(objForm);
  var [err,response]=await fetch(uGogCheck, {method:'POST', body:params}).toNBP(); if(err) return [err];
  var [err, data]=await response.json().toNBP(); if(err) return [err];

  if(!data.success) return [new ErrorClient('reCaptcha test not successfull')];
  
  
  //if(!/\S+@\S+/.test(inObj.email)) return [new ErrorClient('Invalid email')]; 
  
  for(var name in inObj){
    var value=inObj[name];
    if(/link/.test(name)) {
      var boOK=validator.isURL(value, {protocols: ['http','https'], require_tld:boRequireTLD}); if(!boOK) return [new ErrorClient(name+' validation failed.')];
    } else if(/email/i.test(name)) {
      var boOK=validator.isEmail(value); if(!boOK) return [new ErrorClient(name+" didn't pass validation test. Searching/contacting support might be an idea.")];
    } else if(typeof value=='string') inObj[name]=myJSEscape(value);
  };
  
  var Sql=[]; 
  Sql.push(`INSERT INTO ${userTab} SET name=?, password=?, email=?, telephone=?, country=?, federatedState=?, county=?, city=?, zip=?, address=?, timeZone=?, idNational=?, birthdate=?, motherTongue=?, gender=?,
  tCreated=now(), tName=now(), tImage=now(), tEmail=now(), tTelephone=now(), tCountry=now(), tFederatedState=now(), tCounty=now(), tCity=now(), tZip=now(), tAddress=now(), tIdFB=now(), tIdGoogle=now(), tIdNational=now(), tBirthdate=now(), tMotherTongue=now(), tGender=now();`);
  var Val=[inObj.name, inObj.password, inObj.email, inObj.telephone, inObj.country, inObj.federatedState, inObj.county, inObj.city, inObj.zip, inObj.address, inObj.timeZone, inObj.idNational, inObj.birthdate, inObj.motherTongue, inObj.gender];
  Sql.push("SELECT LAST_INSERT_ID() AS idUser;");
  //Sql.push(`UPDATE ${userTab} SET imageHash=LAST_INSERT_ID()%32 WHERE idUser=LAST_INSERT_ID();`);

  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val); 
  
  var boOK, mestmp;
  if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup email';}
  else if(err) return [err];
  else{
    boOK=1; mestmp="Done"; 
    var idUser=req.sessionCache.idUser=Number(results[1][0].idUser);
  }
  this.mes(mestmp);
  extend(Ou, {boOK});
  await setRedis(req.sessionID+'_Main', req.sessionCache, maxUnactivity);
  
  return [null, [Ou]];
}


ReqBE.prototype.setConsent=async function(inObj){
  var {req}=this, {site}=req, {siteName}=site, {appTab, user2AppTab}=site.TableName;
  var Ou={};
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}
  //var access_token=randomHash();
  //var code=randomHash();
  //var sql=`INSERT INTO ${user2AppTab} (idUser, idApp, scope, tAccess, access_token, maxUnactivityToken, code) VALUES (?,?,?,now(),?,?,?) ON DUPLICATE KEY UPDATE scope=?, access_token=?, maxUnactivityToken=?, code=?;`;
  //var Val=[idUser, inObj.idApp, inObj.scope, access_token, inObj.maxUnactivityToken, code,    inObj.scope, access_token, inObj.maxUnactivityToken, code ];

  inObj.scope=myJSEscape(inObj.scope);

  var Sql=[], Val=[];
  Sql.push(`CALL ${siteName}setConsent(?,?,?,?);`); Val.push(idUser, inObj.idApp, inObj.scope, inObj.maxUnactivityToken);
  //var sql=`UPDATE ${user2AppTab} SET scope=? WHERE idUser=? AND idApp=?;`; 
  //var Val=[inObj.scope, idUser, inObj.idApp];
  //var sql=`INSERT INTO ${user2AppTab} (idUser, idApp, scope, tAccess, access_token, maxUnactivityToken) VALUES (?, ?, ?, now(), ?, ?);`;
  //var Val=[idUser, inObj.idApp, inObj.scope, access_token, maxUnactivityToken];
  
  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val); 
  
  var boOK, mestmp;
  //if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup key';} 
  if(err) return [err];
  else{
    boOK=1; mestmp="Done";
  }
  this.mes(mestmp);
  //this.GRet.objUApp={scope:inObj.scope, tAccess, access_token, maxUnactivityToken:inObj.maxUnactivityToken};
  extend(Ou, {boOK});
  return [null, [Ou]];
    
  
}

ReqBE.prototype.UDelete=async function(inObj){  // writing needSession
  var {req, res}=this, {site}=req;
  var userTab=site.TableName.userTab;
  var Ou={};
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}
  
  var Sql=[], Val=[];
  Sql.push(`DELETE FROM ${userTab} WHERE idUser=?;`); Val.push(idUser);
  Sql.push(`SELECT count(*) AS n FROM ${userTab};`);
  var sql=Sql.join('\n'); 
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];

  var c=results[0].affectedRows, boOK, mestmp; 
  if(c==0) return [new Error("Nothing changed")];
  this.mes("Entry deleted");  
  //site.boNUserChanged=1; // variabel should be called boNUsers changed or something..
  site.nUser=Number(results[1][0].n);
  req.sessionCache={};  this.GRet.userInfoFrDB={};
  //await delRedis(req.sessionID+'_Main');
  await setRedis(req.sessionID+'_Main', req.sessionCache, maxUnactivity);
  return [null, [Ou]];
}


/********************************************************************************
 * userAppList
 ********************************************************************************/
ReqBE.prototype.userAppListGet=async function(inObj){ 
  var {req}=this, {site}=req, {appTab, user2AppTab}=site.TableName;
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}

  var sql=`SELECT a.idApp AS idApp, a.name AS appName, scope, UNIX_TIMESTAMP(tAccess) AS tAccess, imageHash FROM ${user2AppTab} ua JOIN  ${appTab} a ON ua.idApp=a.idApp WHERE idUser=?;`;

  var Val=[idUser];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  
  var Ou=arrObj2TabNStrCol(results); 
  var nEntry=results.length, strEntry=nEntry==1?'entry':'entries'
  this.mes(`Got ${nEntry} ${strEntry}`);
  extend(Ou, {boOK:1,nEntry});
  return [null, [Ou]];
}
  //idUser, idApp, scope, tAccess, access_token, maxUnactivityToken
ReqBE.prototype.userAppSet=async function(inObj){
  var {req}=this, {site}=req, {appTab, user2AppTab}=site.TableName;
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}
  var Ou={};
  var access_token=randomHash();
  var code=randomHash();
  inObj.scope=myJSEscape(inObj.scope);
  var sql=`INSERT INTO ${user2AppTab} (idUser, idApp, scope, tAccess, access_token, maxUnactivityToken, code) VALUES (?,?,?,now(),?,?,?) ON DUPLICATE KEY UPDATE scope=?, access_token=?, maxUnactivityToken=?, code=?;`;
  var Val=[idUser, inObj.idApp, inObj.scope, access_token, inObj.maxUnactivityToken, code,    inObj.scope, access_token, inObj.maxUnactivityToken, code ];
  //var sql=`UPDATE ${user2AppTab} SET scope=? WHERE idUser=? AND idApp=?;`; 
  //var Val=[inObj.scope, idUser, inObj.idApp];
  //var sql=`INSERT INTO ${user2AppTab} (idUser, idApp, scope, tAccess, access_token, maxUnactivityToken) VALUES (?, ?, ?, now(), ?, ?);`;
  //var Val=[idUser, inObj.idApp, inObj.scope, access_token, maxUnactivityToken];
  
  var [err, results]=await this.myMySql.query(sql, Val);
  
  var boOK, mestmp;
  //if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup key';} 
  if(err) return [err];
  else{
    boOK=1; mestmp="Done";
  }
  this.mes(mestmp);
  //this.GRet.objUApp={scope:inObj.scope, tAccess, access_token, maxUnactivityToken:inObj.maxUnactivityToken};
  extend(Ou, {boOK});
  return [null, [Ou]];
    
}
ReqBE.prototype.userAppDelete=async function(inObj){ 
  var {req}=this, {site}=req, {appTab, user2AppTab}=site.TableName;
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}
  var Ou={};
  
  //var sql=`DELETE au FROM ${user2AppTab} ua JOIN  ${appTab} a ON ua.idApp=a.idApp WHERE au.idUser=?;`;
  var sql=`DELETE FROM ${user2AppTab} WHERE idUser=? AND idApp=?;`;
  var Val=[idUser, inObj.idApp];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  
  var c=results.affectedRows, boOK, mestmp; 
  if(c>0) {boOK=1; mestmp="Entry deleted"; } else {boOK=1; mestmp="Nothing changed"; }
  this.mes(mestmp);
  Ou.boOK=boOK;      
  return [null, [Ou]];
  
  
}


ReqBE.prototype.devAppListGet=async function(inObj){ 
  var {req}=this, {site}=req;
  var appTab=site.TableName.appTab;
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}

  var GRet=this.GRet;
  var sql=`SELECT idApp, name AS appName, redir_uri, imageHash, UNIX_TIMESTAMP(created) AS created FROM ${appTab} WHERE idOwner=?;`;
  var Val=[idUser];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  
  var Ou=arrObj2TabNStrCol(results);
  var nEntry=results.length, strEntry=nEntry==1?'entry':'entries'
  this.mes(`Got ${nEntry} ${strEntry}`); 
  extend(Ou, {boOK:1, nEntry});
  return [null, [Ou]];
}
ReqBE.prototype.devAppSecret=async function(inObj){ 
  var {req}=this, {site}=req, {userTab, appTab}=site.TableName;
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}

  var Ou={};
  //var sql=`SELECT secret FROM ${appTab} WHERE idOwner=? AND idApp=?;`;
  var sql=`SELECT password, secret FROM ${userTab} u JOIN ${appTab} a ON u.idUser=a.idOwner WHERE u.idUser=? AND a.idApp=?;`;
  var Val=[idUser, inObj.idApp];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  if(results.length!=1){ debugger;  return [new Error('results.length='+results.length)];}
  if(results[0].password!=inObj.password) return [new ErrorClient('password missmatch')];
  Ou.secret=results[0].secret;
  return [null, [Ou]];
}
ReqBE.prototype.devAppSet=async function(inObj){
  var {req}=this, {site}=req;
  var appTab=site.TableName.appTab;
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}
  
  

  var boOK=validator.isURL(inObj.redir_uri, {protocols: ['http','https'], require_tld:boRequireTLD});
  if(!boOK) return [new ErrorClient('redir_uri validation failed.')];
  inObj.appName=myJSEscape(inObj.appName);
  
  
  var GRet=this.GRet;
  var Ou={};
  var Sql=[], Val=[];
  var boUpd=inObj.boUpd||false;
  if(boUpd){
    Sql.push(`UPDATE ${appTab} SET name=?, redir_uri=? WHERE idOwner=? AND idApp=?;`); 
    var Val=[inObj.appName, inObj.redir_uri, idUser, inObj.idApp];
  } else {
    var secret=randomHash();
    Sql.push(`INSERT INTO ${appTab} (name, redir_uri, idOwner, secret, created) VALUES (?, ?, ?, ?, now());`);
    var Val=[inObj.appName, inObj.redir_uri, idUser, secret];
    Sql.push("SELECT LAST_INSERT_ID() AS idApp, NULL AS imageHash;");
    //Sql.push("SET @Vid=LAST_INSERT_ID(), @imageHash=LAST_INSERT_ID()%32;");
    //Sql.push(`UPDATE  ${appTab} SET imageHash=LAST_INSERT_ID()%32 WHERE idApp=LAST_INSERT_ID();`);
    //Sql.push("SELECT @Vid AS idApp, @imageHash AS imageHash;");
    //Sql.push("COMMIT;");
  }
  
  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val);
  
  
  var mestmp, idApp=inObj.idApp, imageHash;
  if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup key';}
  else if(err) return [err];
  else{
    mestmp="Done"; Ou.boOK=1;
    if(!boUpd){
      //extend(Ou, results[3][0]);
      extend(Ou, results[1][0]);
    }
  }
  this.mes(mestmp);
  return [null, [Ou]];
    
  
}
ReqBE.prototype.devAppDelete=async function(inObj){ 
  var {req}=this, {site}=req;
  var appTab=site.TableName.appTab;
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}
  var GRet=this.GRet;
  var Ou={};
  var sql=`DELETE FROM ${appTab} WHERE idOwner=? AND idApp=?`;
  var Val=[idUser, inObj.idApp];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];
  
  var c=results.affectedRows, boOK, mestmp; 
  if(c>0) {boOK=1; mestmp="Entry deleted"; } else {boOK=1; mestmp="Nothing changed"; }
  this.mes(mestmp);
  Ou.boOK=boOK;      
  return [null, [Ou]];
}



ReqBE.prototype.changePW=async function(inObj){ 
  var {req}=this, {site}=req, {siteName}=site;
  var Ou={boOK:0};
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}
  var passwordOld=inObj.passwordOld;
  var passwordNew=inObj.passwordNew;

  var Sql=[], Val=[];
  //Sql.push(`UPDATE ${userTab} SET password=? WHERE password=? AND idUser=?;`);
  //Val.push(inObj.password, inObj.passwordOld, idUser);
  Sql.push(`CALL ${siteName}setPassword(?,?,?);`); Val.push(idUser, passwordOld, passwordNew);

  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];

  var mess=results[0][0].mess;
  if(mess=='Password changed') Ou.boOK=1;
  this.mes(mess); 
  
  return [null, [Ou]];
}

ReqBE.prototype.verifyEmail=async function(inObj){ 
  var {req}=this, {site}=req;
  var userTab=site.TableName.userTab;
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}

  var expirationTime=600;

  var code=randomHash()+randomHash();
  var tmp=await setRedis(code+'_verifyEmail', idUser, expirationTime);
  var Ou={};

  var Sql=[], Val=[];
  Sql.push(`SELECT email FROM ${userTab} WHERE idUser=?;`);
  Val.push(idUser);

  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];

  if(results.length==0) { this.mes('No such idUser in the database'); return [null, [Ou]];}
  var email=results[0].email;
  var wwwSite=req.wwwSite;
  var uVerification=`${req.strSchemeLong}${wwwSite}/${leafVerifyEmailReturn}?code=${code}`;
  var strTxt=`<h3>Email verification on ${wwwSite}</h3>
<p>Someone (maybe you) uses ${wwwSite} and claims that ${email} is their email address. Is this you? If so use the link below to verify that you are the owner of this email address.</p>
<p>Otherwise neglect this message.</p>
<p><a href=${uVerification}>${uVerification}</a></p>
<p>Note! The links stops working ${expirationTime/60} minutes after the email was sent.</p>`;
  

  const msg = { to:email, from:emailRegisterdUser, subject:'Email verification',  html:strTxt};

  // var [err]=await sgMail.send(msg).toNBP();
  // if(err) {console.log(err); return [new ErrorClient(err.body)]; }
  // this.mes('Email sent');

  let sendResult=await smtpTransport.sendMail(msg)
  this.mes(sendResult.response);

  
  Ou.boOK=1;
  return [null, [Ou]];
}


ReqBE.prototype.verifyPWReset=async function(inObj){ 
  var {req}=this, {site}=req;
  var userTab=site.TableName.userTab;
  var Ou={boOK:0};

  var tmp='email'; if(!(tmp in inObj)) { this.mes(`The parameter ${tmp} is required`); return [null, [Ou]];}
  var email=inObj.email;

  var Sql=[], Val=[];
  Sql.push(`SELECT email FROM ${userTab} WHERE email=?;`);
  Val.push(email);

  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];

  if(results.length==0) { this.mes('No such email in the database'); return [null, [Ou]];}

  var expirationTime=600;

  var code=randomHash()+randomHash();
  var tmp=await setRedis(code+'_verifyPWReset', email, expirationTime);

  var wwwSite=req.wwwSite;
  var uVerification=`${req.strSchemeLong}${wwwSite}/${leafVerifyPWResetReturn}?code=${code}`;
  var strTxt=`<h3>Password reset request on ${wwwSite}</h3>
<p>Someone (maybe you) tries to reset their ${wwwSite} password and entered ${email} as their email.</p>
<p>Is this you, then use the link below to have a new password generated and sent to you.</p>
<p>Otherwise neglect this message.</p>
<p><a href=${uVerification}>${uVerification}</a></p>
<p>Note! The links stops working ${expirationTime/60} minutes after the email was sent.</p>`;
  
  const msg = { to:email, from:emailRegisterdUser, subject:'Password reset request',  html:strTxt};

  // var [err]=await sgMail.send(msg).toNBP();
  // if(err) {console.log(err); return [new ErrorClient(err.body)]; }
  // this.mes('Email sent');
  
  let sendResult=await smtpTransport.sendMail(msg)
  this.mes(sendResult.response);

  Ou.boOK=1;
  return [null, [Ou]];
}


ReqBE.prototype.deleteImage=async function(inObj){
  var {req, res}=this, {site}=req, {siteName}=site;
  var Ou={};   
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}

  var Sql=[], Val=[];
  if(inObj.kind=='u'){
    Sql.push(`CALL ${siteName}deleteImage(?);`); Val.push(idUser);
  }else{ 
    Sql.push(`CALL ${siteName}deleteAppImage(?);`); Val.push(idUser, inObj.idApp);
  }


  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];

  if(inObj.kind=='u'){ 
    Ou.strMessage="Done";
    Ou.imageHash=results[0][0].imageHash;
  }else{  
    var mess=results[0][0].mess;
    Ou.strMessage=mess;
    if(mess=='ok'){
      Ou.imageHash=results[1][0].imageHash;
    }
  }
  //var nDel=results.affectedRows; 
  //if(nDel==1) {this.mes('Image deleted'); } else { this.mes(nDel+" images deleted");}

  return [null, [Ou]];
}

ReqBE.prototype.uploadImage=async function(inObj){
  var self=this, {req, res}=this, {site}=req, {siteName}=site,  {userTab, appTab}=site.TableName;
  var Ou={};
  //if(typeof req.sessionCache!='object' || !('idUser' in req.sessionCache)) { return [new ErrorClient('No session')];}
  var idUser=req.sessionCache.idUser; if(!idUser){ return [new ErrorClient('No session')];}
  var regImg=RegExp("^(png|jpeg|jpg|gif|svg)$");

  var File=this.File;
  var n=File.length; this.mes("nFile: "+n);

  var file=File[0], tmpname=file.filepath, fileName=file.originalFilename; 
  var Match=RegExp('\\.(\\w{1,4})$').exec(fileName); 
  if(!Match){ Ou.strMessage='The file name should have a three or four letter extension, ex: ".jpg"'; return [null, [Ou]]; }
  var type=Match[1].toLowerCase();
  var [err, buf]=await fsPromises.readFile(tmpname).toNBP();    if(err) return [err];
  var data=buf; 
  if(data.length==0){ this.mes("data.length==0"); return [null, [Ou]]; }

  if(!regImg.test(type)){ Ou.strMessage="Unrecognized file type: "+type; return [null, [Ou]]; }



  var wNew=50, hNew=50;
  var [err,data]=await new Promise(resolve=>{
    var myCollector=concat(function(buf){  resolve([null,buf]);   });
    var streamImg=gm(data).autoOrient().resize(wNew, hNew).stream(function streamOut(err, stdout, stderr) {
      if(err) {resolve([err]); return;}
      stdout.pipe(myCollector); 
    });
  });
  if(err) return [err];

  
  console.log('uploadImage data.length: '+data.length);
  if(data.length==0) {  return [new Error('data.length==0')]; }
  
  var Sql=[], Val=[];
  if(this.kind=='u'){ 
    //Sql.push(`REPLACE INTO ${imageTab} (idUser,data) VALUES (?,?);`); Val.push(idUser,data);
    //Sql.push(`UPDATE ${userTab} SET imTag=imTag+1 WHERE idUser=?;`);  Val.push(idUser);
    Sql.push(`CALL ${siteName}setImage(?, ?)`); Val.push(idUser, data);
  }else{  
    var idApp=Number(this.kind.substr(1));
    Sql.push(`CALL ${siteName}setAppImage(?, ?, ?)`); Val.push(idUser, idApp, data);
  }

  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];

  if(this.kind=='u'){ 
    Ou.strMessage="Done";
    Ou.imageHash=results[0][0].imageHash;
  }else{  
    var mess=results[0][0].mess;
    Ou.strMessage=mess;
    if(mess=='ok'){
      Ou.imageHash=results[1][0].imageHash;
    }
  }

  return [null, [Ou]];
}
  

ReqBE.prototype.uploadImageB64=async function(inObj){
  var self=this, {req}=this, {site}=req, {siteName}=site,  {userTab, appTab}=site.TableName;
  var {idUser}=req.sessionCache; if(!idUser){ return [new ErrorClient('No session')];}

  var Ou={};

  var {kind, base64Img}=inObj;

    // base64Img
  var data = Buffer.from(base64Img.split(",")[1], 'base64');
  console.log('data.length: '+data.length);
  if(data.length==0) return [Error('data.length==0')];
  if(data.length>10000) return [Error('data.length>10000 !?!, aborting!')];

  var Sql=[], Val=[];
  if(kind=='u'){ 
    Sql.push(`CALL ${siteName}setImage(?, ?)`); Val.push(idUser, data);
  }else{  
    var idApp=Number(kind.substr(1));
    Sql.push(`CALL ${siteName}setAppImage(?, ?, ?)`); Val.push(idUser, idApp, data);
  }

  var sql=Sql.join('\n');
  var [err, results]=await this.myMySql.query(sql, Val); if(err) return [err];

  Ou.boOK=1;
  if(kind=='u'){ 
    Ou.strMessage="ok";
    Ou.imageHash=results[0][0].imageHash;
  }else{  
    var mess=results[0][0].mess;
    Ou.strMessage=mess;
    if(mess=='ok'){
      Ou.imageHash=results[1][0].imageHash;
    } else Ou.boOK=0;
  }
  return [null, [Ou]];
}

