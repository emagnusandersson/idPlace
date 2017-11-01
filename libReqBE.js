
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
//var ReqBE=app.ReqBE=function(req, res){
  //this.req=req; this.res=res; this.site=req.site;  this.Str=[]; 
  //this.Out={GRet:{}, dataArr:[]}; this.GRet=this.Out.GRet; 
//}
var ReqBE=app.ReqBE=function(req, res){
  this.req=req; this.res=res; this.site=req.site;  this.Str=[]; 
  this.Out={GRet:{userInfoFrDBUpd:{}}, dataArr:[]}; this.GRet=this.Out.GRet; 
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
  

  this.res.end(JSON.stringify(this.Out));
}

ReqBE.prototype.mesEO=function(e){
    // Prepare an error-message for the browser and one for the error log.
  var StrELog=[], strEBrowser;
  if(typeof e=='string'){strEBrowser=e; StrELog.push(e);}
  else if(typeof e=='object'){
    if('syscal' in e) StrELog.push('syscal: '+e.syscal);
    if(e instanceof Error) {strEBrowser='name: '+e.name+', code: '+e.code+', message: ' + e.message; }
    else { strEBrowser=e.toString(); StrELog.push(strEBrowser); }
  }
    
  var strELog=StrELog.join('\n'); console.error(strELog);  // Write message to the error log
  if(e instanceof Error) { console.error(e);}
  
    // Write message (and other data) to browser
  this.Str.push(strEBrowser);
  this.GRet.strMessageText=this.Str.join(', ');
  
  this.res.writeHead(500, {"Content-Type": "text/plain"}); 
  this.res.end(JSON.stringify(this.Out));
}



ReqBE.prototype.go=function*(){
  var req=this.req, flow=req.flow, res=this.res, sessionID=req.sessionID;
  
  
    // Extract input data either 'POST' or 'GET'
  var jsonInput;
  if(req.method=='POST'){ 
    if('x-type' in req.headers ){ //&& req.headers['x-type']=='single'
      var form = new formidable.IncomingForm();
      form.multiples = true;  
      //form.uploadDir='tmp';
      
      var err, fields, files;
      form.parse(req, function(errT, fieldsT, filesT) { err=errT; fields=fieldsT; files=filesT; flow.next();  });  yield;
      if(err){ this.mesEO(err);  return; } 
      
      this.File=files['fileToUpload[]'];
      if('kind' in fields) this.kind=fields.kind; else this.kind='u';
      if('captcha' in fields) this.captchaIn=fields.captcha; else this.captchaIn='';
      if('strName' in fields) this.strName=fields.strName; else this.strName='';
      if(!(this.File instanceof Array)) this.File=[this.File];
      jsonInput=fields.vec;

    }else{
      var buf, myConcat=concat(function(bufT){ buf=bufT; flow.next();  });    req.pipe(myConcat);    yield;
      jsonInput=buf.toString();
    }
  }
  else if(1){ this.mesEO('send me a POST'); return; }
  else if(req.method=='GET'){
    var objUrl=url.parse(req.url), qs=objUrl.query||''; jsonInput=urldecode(qs);
  }
  
  try{ var beArr=JSON.parse(jsonInput); }catch(e){ this.mesEO(e);  return; }
  
  var redisVar=req.sessionID+'_Main'; this.sessionMain=yield *getRedis(flow, redisVar, true);
  if(!this.sessionMain || typeof this.sessionMain!='object') { this.sessionMain={};  this.GRet.userInfoFrDB={};  var tmp=yield* cmdRedis(flow, 'del',[redisVar]); }  
  else { yield* expireRedis(flow, redisVar); }
  

  res.setHeader("Content-type", "application/json");

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
    arrCSRF=['loginGetGraph', 'deleteExtId', 'uploadUser', 'UUpdate', 'createUser', 'UDelete', 'loginWEmail', 'devAppListGet', 'devAppSecret', 'devAppSet', 'devAppDelete', 'setConsent', 'userAppListGet', 'userAppSet', 'userAppDelete', 'changePW', 'verifyEmail', 'verifyPWReset', 'deleteImage', 'uploadImage'];  // Functions that changes something must check and refresh CSRF-code
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
  
    // cecking/set CSRF-code
  var redisVar=req.sessionID+'_CSRFCode'+ucfirst(caller), CSRFCode;
  if(boCheckCSRF){
    if(!CSRFIn){ this.mesO('CSRFCode not set (try reload page)'); return; }
    var tmp=yield* getRedis(flow, redisVar);
    if(CSRFIn!==tmp){ this.mesO('CSRFCode err (try reload page)'); return;}
  }
  if(boSetNewCSRF){
    var CSRFCode=randomHash();
    var tmp=yield* setRedis(flow, redisVar, CSRFCode, maxUnactivity);
    this.GRet.CSRFCode=CSRFCode;
  }
  
  
  var Func=[];
  for(var k=0; k<beArr.length; k++){
    var strFun=beArr[k][0];
    if(in_array(strFun,allowed)) {
      var inObj=beArr[k][1],     tmpf; if(strFun in this) tmpf=this[strFun]; else tmpf=global[strFun];
      var fT=[tmpf,inObj];   Func.push(fT);
    }
  }


  for(var k=0; k<Func.length; k++){
    var [func,inObj]=Func[k],   [err, result]=yield* func.call(this, inObj);
    //if(typeof objT=='object') {    if('err' in objT) err=objT.err; else err=objT;    }    else if(typeof objT=='undefined') err='Error when calling BE-fun: '+k;    else err=objT;
    
    if(res.finished) return;
    else if(err){
      if(typeof err=='object' && err.name=='ErrorClient') this.mesO(err); else this.mesEO(err);     return;
    }
    else this.Out.dataArr.push(result);
  }
  this.mesO();
  
}


/******************************************************************************
 * loginGetGraph
 ******************************************************************************/
ReqBE.prototype.loginGetGraph=function*(inObj){
  var req=this.req, flow=req.flow, res=this.res, site=req.site, sessionID=req.sessionID, objQS=req.objQS;
  var strFun=inObj.fun;
  var Ou={};
  //if(!this.sessionMain.userInfoFrDB){ this.sessionMain.userInfoFrDB=extend({},specialistDefault); yield* setRedis(flow, req.sessionID+'_Main', this.sessionMain, maxUnactivity); }
  

  var strIP=inObj.IP;
  var rootDomain=req.rootDomain, objIPCred=rootDomain[strIP];
  var uRedir=req.strSchemeLong+site.wwwSite+'/'+leafLoginBack;
    // getToken
  var objForm={grant_type:'authorization_code', client_id:objIPCred.id, redirect_uri:uRedir, client_secret:objIPCred.secret, code:inObj.code};
  if(strIP=='fb') {
    var uToGetToken = "https://graph.facebook.com/v2.5/oauth/access_token";
  }else if(strIP=='google') {
    var uToGetToken = "https://accounts.google.com/o/oauth2/token"; 
  }else if(strIP=='idplace') {
    var uToGetToken = urlAuthIdplace+"/access_token";
  } 

  var arrT = Object.keys(objForm).map(function (key) { return key+'='+objForm[key]; }), strQuery=arrT.join('&'); 
  //if(strQuery.length) uToGetToken+='?'+strQuery;
  var semY=0, semCB=0, err, response, body;
  var reqStream=requestMod.post({url:uToGetToken, form: objForm},  function(errT, responseT, bodyT) { err=errT; response=responseT; body=bodyT; if(semY)flow.next(); semCB=1;  }); if(!semCB){semY=1; yield;}
  var buf=body;

 
  try{ var objT=JSON.parse(buf.toString()); }catch(e){ return [e]; }
  if('error' in objT) { var m=objT.error.message; return [new Error(m)]; }
  var access_token=this.access_token=objT.access_token;
  //var access_token=this.access_token=inObj.access_token;



    // Get Graph
  if(strIP=='fb') {
    var uGraph = "https://graph.facebook.com/v2.5/me";
    var objForm={access_token:this.access_token, fields:"id,name,verified,picture,email"};
  }else if(strIP=='google') {
    var uGraph = "https://www.googleapis.com/plus/v1/people/me";
    var objForm={access_token:this.access_token, fields:"id,name,verified,image,email"};
  }else if(strIP=='idplace') {
    var uGraph = urlAuthIdplace+"/me";
    var objForm={access_token:this.access_token};
  } 
  var arrT = Object.keys(objForm).map(function (key) { return key+'='+objForm[key]; }), strQuery=arrT.join('&'); 
  if(strQuery.length) uGraph+='?'+strQuery;
  var semY=0, semCB=0, err, response, body;
  var reqStream=requestMod.get(uGraph,  function(errT, responseT, bodyT) { err=errT; response=responseT; body=bodyT; if(semY)flow.next(); semCB=1;  }); if(!semCB){semY=1; yield;}
  var buf=body;
  

  try{ var objGraph=JSON.parse(buf.toString()); }catch(e){ return [e]; }
  this.objGraph=objGraph;

    // interpretGraph
  if('error' in objGraph) {var {type,message}=objGraph.error, tmp='Error accessing data from ID provider: '+type+' '+message+'<br>';  return [new Error(tmp)]; }


  if(strIP=='fb'){ 
    if(!objGraph.verified) { var tmp="Your facebook account is not verified. Try search internet for  \"How to verify facebook account\".";    return [new ErrorClient(tmp)]; }
    var IP='fb', idIP=objGraph.id, nameIP=objGraph.name, image=objGraph.picture.data.url, email=objGraph.email;
  }else if(strIP=='google'){
    var IP='google', idIP=objGraph.id, nameIP=objGraph.name.givenName+' '+objGraph.name.familyName, image=objGraph.image.url;
  }else if(strIP=='idplace'){
    var IP='idplace', idIP=objGraph.id, nameIP=objGraph.name, image=objGraph.image;
    //var IP='idplace', idIP=objGraph.idUser, nameIP=objGraph.name, image='';
  }

  if(typeof idIP=='undefined') { return [new Error("Error idIP is empty")];}
  if(typeof nameIP=='undefined' ) {nameIP=idIP;}
  extend(this,{IP:IP, idIP:idIP, nameIP:nameIP, image:image, email:email, timeZone:inObj.timeZone});
  
  if(['userFun', 'fetchFun', 'getSecretFun'].indexOf(strFun)!=-1){
    var [err, result]=yield *this[strFun](inObj);  if(err) return [err];
    if(result) Ou.resultOfFun=result;
  }

  return [null, [Ou]];
}


ReqBE.prototype.userFun=function*(inObj){
  var req=this.req, flow=req.flow, res=this.res, site=req.site,  siteName=site.siteName, userTab=site.TableName.userTab;
  var Ou={}; 
   
  var password=randomHash();
  var Sql=[], Val=[]; 
  Sql.push("CALL "+siteName+"loginWExternalIP(?,?,?,?,?);"); Val.push(this.idIP, this.nameIP, this.image, this.email, this.timeZone);

  var sql=Sql.join('\n');
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];
  
  var messA=results[0][0].mess;
  var boOK=messA=='ok';
  if(!boOK) { return [new Error(messA)]; }
  var idUser=Number(results[1][0].idUser);
  this.sessionMain.idUser=idUser;
  yield* setRedis(flow, req.sessionID+'_Main', this.sessionMain, maxUnactivity);
  return [null, Ou];
}

ReqBE.prototype.fetchFun=function*(inObj){
  var req=this.req, flow=req.flow, res=this.res, site=req.site,  siteName=site.siteName, userTab=site.TableName.userTab;
  var Ou={}; 
   
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser;

  var password=randomHash();
  var Sql=[], Val=[]; 
  Sql.push("UPDATE "+userTab+" SET \n\
tIdFB=IF(idFB IS NULL OR idFB!=?, now(), tIdFB), \n\
tName=IF(name!=?, now(), tName), \n\
tImage=IF(image!=? AND imageHash IS NULL, now(), tImage), \n\
tEmail=IF(email!=?, now(), tEmail), \n\
boEmailVerified=IF(email!=?, 0, boEmailVerified), \n\
nIdFB=nIdFB+(idFB IS NULL OR idFB!=?), \n\
nName=nName+(name!=?), \n\
nImage=nImage+(image!=? AND imageHash IS NULL), \n\
nEmail=nEmail+(email!=?), \n\
idFB=?, name=?, image=?, email=?, timeZone=? WHERE idUser=?;");
Val.push(this.idIP, this.nameIP, this.image, this.email, this.email);
Val.push(this.idIP, this.nameIP, this.image, this.email);
Val.push(this.idIP, this.nameIP, this.image, this.email, this.timeZone, idUser);
  var sql=Sql.join('\n');
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];

  var c=results.affectedRows, boOK, mestmp; 
  if(c>0) {boOK=1; mestmp="Data changed"; } else {boOK=1; mestmp="Nothing changed"; }
  this.mes(mestmp);
  Ou.boOK=boOK; 
  return [null, Ou];
}
ReqBE.prototype.getSecretFun=function*(inObj){
  var req=this.req, flow=req.flow, res=this.res, site=req.site,  siteName=site.siteName, {userTab, appTab}=site.TableName;;
  var Ou={};
   
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser;

  var Sql=[], Val=[]; 
  Sql.push("SELECT @idUser:=idUser FROM "+userTab+" WHERE idFB=?;");
  Sql.push("SELECT @idUser AS idUser;");     Val.push(this.idIP);
  Sql.push("SELECT secret FROM "+appTab+" WHERE idOwner=@idUser AND idApp=?;");    Val.push(inObj.idApp);
  //var sql="SELECT idUser, secret FROM "+userTab+" u JOIN "+appTab+" a ON u.idUser=a.idOwner WHERE u.idFB=? AND a.idApp=?;";
  //var Val=[this.idIP, inObj.idApp];
  var sql=Sql.join('\n');
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];
  //if(results.length!=1) {  return [new ErrorClient('results.length='+results.length)]; }
  if(results[1][0].idUser!=idUser) return [new ErrorClient('Wrong user')];
  if(results[2].length!=1) return [new Error('Found '+results[2].length+' results')];
  Ou.secret=results[2][0].secret;
  return [null, Ou];
}



ReqBE.prototype.deleteExtId=function*(inObj){ // Remove link to the external IP
  var req=this.req, flow=req.flow, res=this.res, site=req.site,  siteName=site.siteName, userTab=site.TableName.userTab;
   
  var Ou={}; 
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) {return [new ErrorClient('No session')]; }
  var idUser=this.sessionMain.idUser;

  var Sql=[], Val=[]; 
  Sql.push("UPDATE "+userTab+" SET idFB=NULL, image='', tIdFB=now(), tImage=IF(imageHash IS NULL, now(), tImage) WHERE idUser=?"); Val.push(idUser);

  var sql=Sql.join('\n');
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];

  var c=results.affectedRows, boOK, mestmp; 
  if(c>0) {boOK=1; mestmp="Data deleted"; } else {boOK=1; mestmp="Nothing changed"; }
  this.mes(mestmp);
  Ou.boOK=boOK;      
  return [null, [Ou]];

}


ReqBE.prototype.setupById=function*(inObj){
  var req=this.req, flow=req.flow, site=req.site,  siteName=site.siteName, Ou={};
  var userTab=site.TableName.userTab;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}


  var idApp=inObj.idApp||null;

  var Sql=[], Val=[];
  Sql.push("CALL "+siteName+"getUserAppInfo(?,?);"); Val.push(this.sessionMain.idUser, idApp);

  var sql=Sql.join('\n');
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];


  //this.GRet.userInfoFrDB={};
  if(results[0].length)  {  
    delete results[0][0].idUser;
    this.GRet.userInfoFrDB=results[0][0];
    //if(results[1].length) this.GRet.userInfoFrDB.imageHash=results[1][0].imageHash;
  } else{
    if(idUser!==null) { 
      this.sessionMain={};  this.GRet.userInfoFrDB={};  var tmp=yield* cmdRedis(flow, 'del',[req.sessionID+'_Main']);
      idUser=null;
    }
    // return [new Error("User not found?!? (try reload)")];
  }
  
  
  var objApp=null; if(results[1].length) this.GRet.objApp=results[1][0];  // name, created, redir_uri, imageHash
  var objUApp=null; if(results[2].length) this.GRet.objUApp=results[2][0];  //scope, tAccess, access_token, maxUnactivityToken, code

  return [null, [Ou]];
}

ReqBE.prototype.logout=function*(inObj){
  var req=this.req, flow=req.flow, Ou={};
  this.sessionMain={};  this.GRet.userInfoFrDB={};  var tmp=yield* cmdRedis(flow, 'del',[req.sessionID+'_Main']);
  this.mes('Logged out'); return [null, [Ou]];
}

ReqBE.prototype.loginWEmail=function*(inObj){
  var req=this.req, flow=req.flow, site=req.site, Ou={};
  var userTab=site.TableName.userTab;
  var Sql=[], Val=[];
  var StrRequired=['email', 'password'];
  for(var i=0; i<StrRequired.length; i++){      var tmp=StrRequired[i]; if(!(tmp in inObj)) { return [new ErrorClient('The parameter: '+tmp+' is required')]; }     }
  

  Sql.push("SELECT idUser, password FROM "+userTab+" WHERE email=?");
  Val.push(inObj.email);

  var sql=Sql.join('\n');
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];
  
  if(results.length==0) return [new ErrorClient('Email not found')];
  var objT=results[0];
  if(objT.password!==inObj.password) { return [new ErrorClient('Wrong password')]; }
  //this.GRet.userInfoFrDB=objT;
  var idUser=this.sessionMain.idUser=Number(objT.idUser);
  yield* setRedis(flow, req.sessionID+'_Main', this.sessionMain, maxUnactivity);

  return [null, [Ou]];
}



/*********************************************************************************************
 * User-functions
 *********************************************************************************************/

ReqBE.prototype.UUpdate=function*(inObj){ // writing needSession
  var req=this.req, flow=req.flow, site=req.site, siteName=site.siteName;
  var userTab=site.TableName.userTab;
  var Ou={}; 
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser;

  if(!/\S+@\S+/.test(inObj.email)) return [new ErrorClient('Invalid email')];
    

  var Sql=[], Val=[];

  Sql.push("UPDATE "+userTab+" SET \n\
tName=IF(name!=?, now(), tName), \n\
tEmail=IF(email!=?, now(), tEmail), \n\
boEmailVerified=IF(email!=?, 0, boEmailVerified), \n\
tTelephone=IF(telephone!=?, now(), tTelephone), \n\
tCountry=IF(country!=?, now(), tCountry), \n\
tFederatedState=IF(federatedState!=?, now(), tFederatedState), \n\
tCounty=IF(county!=?, now(), tCounty), \n\
tCity=IF(city!=?, now(), tCity), \n\
tZip=IF(zip!=?, now(), tZip), \n\
tAddress=IF(address!=?, now(), tAddress), \n\
tIdNational=IF(idNational!=?, now(), tIdNational), \n\
tBirthdate=IF(birthdate!=?, now(), tBirthdate), \n\
tMotherTongue=IF(motherTongue!=?, now(), tMotherTongue), \n\
tGender=IF(gender!=?, now(), tGender), \n\
nName=nName+(name!=?), \n\
nEmail=nEmail+(email!=?), \n\
nTelephone=nTelephone+(telephone!=?), \n\
nCountry=nCountry+(country!=?), \n\
nFederatedState=nFederatedState+(federatedState!=?), \n\
nCounty=nCounty+(county!=?), \n\
nCity=nCity+(city!=?), \n\
nZip=nZip+(zip!=?), \n\
nAddress=nAddress+(address!=?), \n\
nIdNational=nIdNational+(idNational!=?), \n\
nBirthdate=nBirthdate+(birthdate!=?), \n\
nMotherTongue=nMotherTongue+(motherTongue!=?), \n\
nGender=nGender+(gender!=?), \n\
name=?, \n\
email=?, \n\
telephone=?, \n\
country=?, federatedState=?, county=?, city=?, zip=?, address=?, \n\
idNational=?, \n\
birthdate=?, \n\
motherTongue=?, \n\
gender=? \n\
WHERE idUser=?;");


//tImage=IF(boImageOwn!=? OR image!=?OR eTagImage!=?, now(), tImage), \n\
//tIdFB=IF(idFB!=?, now(), tIdFB), \n\
//tIdGoogle=IF(idGoogle!=?, now(), tIdGoogle), \n\
//boImageOwn=?, eTagImage=?, sizeImage=?, \n\
//idFB=?, \n\
//idGoogle=?, \n\
//boImageOwn, eTagImage, idFB, idGoogle, 
//boImageOwn, eTagImage, sizeImage, idFB, idGoogle, 
//timeZone=?, \n\
//timeZone,



  var o=inObj;
  Val=Val.concat(o.name, o.email, o.email, o.telephone, o.country, o.federatedState, o.county, o.city, o.zip, o.address, o.idNational, o.birthdate, o.motherTongue, o.gender);
  Val=Val.concat(o.name, o.email, o.telephone, o.country, o.federatedState, o.county, o.city, o.zip, o.address, o.idNational, o.birthdate, o.motherTongue, o.gender);
  Val=Val.concat(o.name, o.email, o.telephone, o.country, o.federatedState, o.county, o.city, o.zip, o.address, o.idNational, o.birthdate, o.motherTongue, o.gender);
  Val=Val.concat(idUser);

  var sql=Sql.join('\n');
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];
  this.mes('Data updated');      
  return [null, [Ou]];
}
//'name', 'password', 'image', 'email', 'telephone',    'country', 'federatedState', 'county', 'city', 'zip', 'address',    'fb', 'google', 'idNational', 'birthdate', 'motherTongue', 'gender' 


ReqBE.prototype.createUser=function*(inObj){ // writing needSession
  var req=this.req, flow=req.flow, site=req.site;
  var userTab=site.TableName.userTab;
  var Ou={}; //debugger

  //var tmp=this.sessionMain.userInfoFrIP, IP=tmp.IP, idIP=tmp.idIP, nameIP=tmp.nameIP, image=tmp.image;

    // Check reCaptcha with google
  var uGogCheck = "https://www.google.com/recaptcha/api/siteverify"; 
  var objForm={  secret:strReCaptchaSecretKey, response:inObj['g-recaptcha-response'], remoteip:req.connection.remoteAddress  };

  var semY=0, semCB=0, err, response, body;
  var reqStream=requestMod.post({url:uGogCheck, form: objForm},  function(errT, responseT, bodyT) { err=errT; response=responseT; body=bodyT; if(semY)flow.next(); semCB=1;  }); if(!semCB){semY=1; yield;}
  var buf=body;
  try{ var data = JSON.parse(buf.toString()); }catch(e){ return [e]; }
  //console.log('Data: ', data);
  if(!data.success) return [new ErrorClient('reCaptcha test not successfull')];
  
  if(!/\S+@\S+/.test(inObj.email)) return [new ErrorClient('Invalid email')]; 
  
  var Sql=[]; 
  Sql.push("INSERT INTO "+userTab+" SET name=?, password=?, email=?, telephone=?, country=?, federatedState=?, county=?, city=?, zip=?, address=?, timeZone=?, idNational=?, birthdate=?, motherTongue=?, gender=?,\n\
  tCreated=now(), tName=now(), tImage=now(), tEmail=now(), tTelephone=now(), tCountry=now(), tFederatedState=now(), tCounty=now(), tCity=now(), tZip=now(), tAddress=now(), tIdFB=now(), tIdGoogle=now(), tIdNational=now(), tBirthdate=now(), tMotherTongue=now(), tGender=now();");
  var Val=[inObj.name, inObj.password, inObj.email, inObj.telephone, inObj.country, inObj.federatedState, inObj.county, inObj.city, inObj.zip, inObj.address, inObj.timeZone, inObj.idNational, inObj.birthdate, inObj.motherTongue, inObj.gender];
  Sql.push("SELECT LAST_INSERT_ID() AS idUser;");
  //Sql.push("UPDATE "+userTab+" SET imageHash=LAST_INSERT_ID()%32 WHERE idUser=LAST_INSERT_ID();");

  var sql=Sql.join('\n');
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); 
  
  var boOK, mestmp;
  if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup email';}
  else if(err) return [err];
  else{
    boOK=1; mestmp="Done"; 
    var idUser=this.sessionMain.idUser=Number(results[1][0].idUser);
  }
  this.mes(mestmp);
  extend(Ou, {boOK:boOK});
  yield* setRedis(flow, req.sessionID+'_Main', this.sessionMain, maxUnactivity);
  
  return [null, [Ou]];
}


ReqBE.prototype.setConsent=function*(inObj){
  var req=this.req, flow=req.flow, site=req.site, siteName=site.siteName, {appTab, user2AppTab}=site.TableName;
  var Ou={};
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser;
  //var access_token=randomHash();
  //var code=randomHash();
  //var sql="INSERT INTO "+user2AppTab+" (idUser, idApp, scope, tAccess, access_token, maxUnactivityToken, code) VALUES (?,?,?,now(),?,?,?) ON DUPLICATE KEY UPDATE scope=?, access_token=?, maxUnactivityToken=?, code=?;";
  //var Val=[idUser, inObj.idApp, inObj.scope, access_token, inObj.maxUnactivityToken, code,    inObj.scope, access_token, inObj.maxUnactivityToken, code ];

  var Sql=[], Val=[];
  Sql.push("CALL "+siteName+"setConsent(?,?,?,?);"); Val.push(idUser, inObj.idApp, inObj.scope, inObj.maxUnactivityToken);
  //var sql="UPDATE "+user2AppTab+" SET scope=? WHERE idUser=? AND idApp=?;"; 
  //var Val=[inObj.scope, idUser, inObj.idApp];
  //var sql="INSERT INTO "+user2AppTab+" (idUser, idApp, scope, tAccess, access_token, maxUnactivityToken) VALUES (?, ?, ?, now(), ?, ?);";
  //var Val=[idUser, inObj.idApp, inObj.scope, access_token, maxUnactivityToken];
  
  var sql=Sql.join('\n');
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); 
  
  var boOK, mestmp;
  //if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup key';} 
  if(err) return [err];
  else{
    boOK=1; mestmp="Done";
  }
  this.mes(mestmp);
  //this.GRet.objUApp={scope:inObj.scope, tAccess:tAccess, access_token:access_token, maxUnactivityToken:inObj.maxUnactivityToken};
  extend(Ou, {boOK:boOK});
  return [null, [Ou]];
    
  
}

ReqBE.prototype.UDelete=function*(inObj){  // writing needSession
  var req=this.req, flow=req.flow, res=this.res, site=req.site;
  var userTab=site.TableName.userTab;
  var Ou={};
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser;
  
  var Sql=[], Val=[];
  Sql.push("DELETE FROM "+userTab+" WHERE idUser=?;"); Val.push(idUser);
  Sql.push("SELECT count(*) AS n FROM "+userTab+";");
  var sql=Sql.join('\n'); 
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];

  var c=results[0].affectedRows, boOK, mestmp; 
  if(c==0) return [new Error("Nothing changed")];
  this.mes("Entry deleted");  
  //site.boNUserChanged=1; // variabel should be called boNUsers changed or something..
  site.nUser=Number(results[1][0].n);
  this.sessionMain={};  this.GRet.userInfoFrDB={};  var tmp=yield* cmdRedis(flow, 'del',[req.sessionID+'_Main']);
  return [null, [Ou]];
}


/********************************************************************************
 * userAppList
 ********************************************************************************/
ReqBE.prototype.userAppListGet=function*(inObj){ 
  var req=this.req, flow=req.flow, site=req.site, {appTab, user2AppTab}=site.TableName;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser;

  var sql="SELECT a.idApp AS idApp, a.name AS appName, scope, UNIX_TIMESTAMP(tAccess) AS tAccess, imageHash FROM "+user2AppTab+" ua JOIN  "+appTab+" a ON ua.idApp=a.idApp WHERE idUser=?;";

  var Val=[idUser];
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];
  
  var Ou=arrObj2TabNStrCol(results); 
  this.mes("Got "+results.length+" entries"); 
  extend(Ou, {boOK:1,nEntry:results.length});
  return [null, [Ou]];
}
  //idUser, idApp, scope, tAccess, access_token, maxUnactivityToken
ReqBE.prototype.userAppSet=function*(inObj){
  var req=this.req, flow=req.flow, site=req.site, {appTab, user2AppTab}=site.TableName;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser;
  var Ou={};
  var access_token=randomHash();
  var code=randomHash();
  var sql="INSERT INTO "+user2AppTab+" (idUser, idApp, scope, tAccess, access_token, maxUnactivityToken, code) VALUES (?,?,?,now(),?,?,?) ON DUPLICATE KEY UPDATE scope=?, access_token=?, maxUnactivityToken=?, code=?;";
  var Val=[idUser, inObj.idApp, inObj.scope, access_token, inObj.maxUnactivityToken, code,    inObj.scope, access_token, inObj.maxUnactivityToken, code ];
  //var sql="UPDATE "+user2AppTab+" SET scope=? WHERE idUser=? AND idApp=?;"; 
  //var Val=[inObj.scope, idUser, inObj.idApp];
  //var sql="INSERT INTO "+user2AppTab+" (idUser, idApp, scope, tAccess, access_token, maxUnactivityToken) VALUES (?, ?, ?, now(), ?, ?);";
  //var Val=[idUser, inObj.idApp, inObj.scope, access_token, maxUnactivityToken];
  
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool);
  
  var boOK, mestmp;
  //if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup key';} 
  if(err) return [err];
  else{
    boOK=1; mestmp="Done";
  }
  this.mes(mestmp);
  //this.GRet.objUApp={scope:inObj.scope, tAccess:tAccess, access_token:access_token, maxUnactivityToken:inObj.maxUnactivityToken};
  extend(Ou, {boOK:boOK});
  return [null, [Ou]];
    
}
ReqBE.prototype.userAppDelete=function*(inObj){ 
  var req=this.req, flow=req.flow, site=req.site, {appTab, user2AppTab}=site.TableName;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser;
  var Ou={};
  
  //var sql="DELETE au FROM "+user2AppTab+" ua JOIN  "+appTab+" a ON ua.idApp=a.idApp WHERE au.idUser=?;";
  var sql="DELETE FROM "+user2AppTab+" WHERE idUser=? AND idApp=?;";
  var Val=[idUser, inObj.idApp];
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];
  
  var c=results.affectedRows, boOK, mestmp; 
  if(c>0) {boOK=1; mestmp="Entry deleted"; } else {boOK=1; mestmp="Nothing changed"; }
  this.mes(mestmp);
  Ou.boOK=boOK;      
  return [null, [Ou]];
  
  
}


ReqBE.prototype.devAppListGet=function*(inObj){ 
  var req=this.req, flow=req.flow, site=req.site;
  var appTab=site.TableName.appTab;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser;

  var GRet=this.GRet;
  var sql="SELECT idApp, name AS appName, redir_uri, imageHash, UNIX_TIMESTAMP(created) AS created FROM "+appTab+" WHERE idOwner=?;";
  var Val=[idUser];
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];
  
  var Ou=arrObj2TabNStrCol(results);
  this.mes("Got "+results.length+" entries"); 
  extend(Ou, {boOK:1,nEntry:results.length});
  return [null, [Ou]];
}
ReqBE.prototype.devAppSecret=function*(inObj){ 
  var req=this.req, flow=req.flow, site=req.site, {userTab, appTab}=site.TableName;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser;

  var Ou={};
  //var sql="SELECT secret FROM "+appTab+" WHERE idOwner=? AND idApp=?;";
  var sql="SELECT password, secret FROM "+userTab+" u JOIN "+appTab+" a ON u.idUser=a.idOwner WHERE u.idUser=? AND a.idApp=?;";
  var Val=[idUser, inObj.idApp];
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];
  if(results.length!=1){ debugger;  return [new Error('results.length='+results.length)];}
  if(results[0].password!=inObj.password) return [new ErrorClient('password missmatch')];
  Ou.secret=results[0].secret;
  return [null, [Ou]];
}
ReqBE.prototype.devAppSet=function*(inObj){
  var req=this.req, flow=req.flow, site=req.site;
  var appTab=site.TableName.appTab;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser;
  var GRet=this.GRet;
  var Ou={};
  var Sql=[], Val=[];
  var boUpd=inObj.boUpd||false;
  if(boUpd){
    Sql.push("UPDATE "+appTab+" SET name=?, redir_uri=? WHERE idOwner=? AND idApp=?;"); 
    var Val=[inObj.appName, inObj.redir_uri, idUser, inObj.idApp];
  } else {
    var secret=randomHash();
    Sql.push("INSERT INTO "+appTab+" (name, redir_uri, idOwner, secret, created) VALUES (?, ?, ?, ?, now());");
    var Val=[inObj.appName, inObj.redir_uri, idUser, secret];
    Sql.push("SELECT LAST_INSERT_ID() AS idApp, NULL AS imageHash;");
    //Sql.push("SET @Vid=LAST_INSERT_ID(), @imageHash=LAST_INSERT_ID()%32;");
    //Sql.push("UPDATE  "+appTab+" SET imageHash=LAST_INSERT_ID()%32 WHERE idApp=LAST_INSERT_ID();");
    //Sql.push("SELECT @Vid AS idApp, @imageHash AS imageHash;");
    //Sql.push("COMMIT;");
  }
  
  var sql=Sql.join('\n');
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool);
  
  
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
ReqBE.prototype.devAppDelete=function*(inObj){ 
  var req=this.req, flow=req.flow, site=req.site;
  var appTab=site.TableName.appTab;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser;
  var GRet=this.GRet;
  var Ou={};
  var sql="DELETE FROM "+appTab+" WHERE idOwner=? AND idApp=?";
  var Val=[idUser, inObj.idApp];
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];
  
  var c=results.affectedRows, boOK, mestmp; 
  if(c>0) {boOK=1; mestmp="Entry deleted"; } else {boOK=1; mestmp="Nothing changed"; }
  this.mes(mestmp);
  Ou.boOK=boOK;      
  return [null, [Ou]];
}



ReqBE.prototype.changePW=function*(inObj){ 
  var req=this.req, flow=req.flow, site=req.site, siteName=site.siteName;
  var userTab=site.TableName.userTab;
  var Ou={boOK:0};
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser
  var passwordOld=inObj.passwordOld;
  var passwordNew=inObj.passwordNew;

  var Sql=[], Val=[];
  //Sql.push("UPDATE "+userTab+" SET password=? WHERE password=? AND idUser=?;");
  //Val.push(inObj.password, inObj.passwordOld, idUser);
  Sql.push("CALL "+siteName+"setPassword(?,?,?);"); Val.push(idUser, passwordOld, passwordNew);

  var sql=Sql.join('\n');
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];

  var mess=results[0][0].mess;
  if(mess=='Password changed') Ou.boOK=1;
  this.mes(mess); 
  
  return [null, [Ou]];
}

ReqBE.prototype.verifyEmail=function*(inObj){ 
  var req=this.req, flow=req.flow, site=req.site;
  var userTab=site.TableName.userTab;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser;

  var expirationTime=600;

  var code=randomHash()+randomHash();
  var redisVar=code+'_verifyEmail';
  var tmp=yield* setRedis(flow, redisVar, idUser, expirationTime);
  var Ou={};

  var Sql=[], Val=[];
  Sql.push("SELECT email FROM "+userTab+" WHERE idUser=?;");
  Val.push(idUser);

  var sql=Sql.join('\n');
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];

  if(results.length==0) { this.mes('No such idUser in the database'); return [null, [Ou]];}
  var email=results[0].email;
  var wwwSite=req.wwwSite;
  var uVerification=req.strSchemeLong+wwwSite+'/'+leafVerifyEmailReturn+'?code='+code;
  var strTxt='<h3>Email verification on '+wwwSite+'</h3> \n\
<p>Someone (maybe you) uses '+wwwSite+' and claims that '+email+' is their email address. Is this you? If so use the link below to verify that you are the owner of this email address.</p> \n\
<p>Otherwise neglect this message.</p> \n\
<p><a href='+uVerification+'>'+uVerification+'</a></p>  \n\
<p>Note! The links stops working '+expirationTime/60+' minutes after the email was sent.</p>';
  
  const msg = { to: email, from: 'noreply@idplace.org', subject: 'Email verification', html: strTxt }; sgMail.send(msg);
  this.mes('Email sent');
  Ou.boOK=1;
  return [null, [Ou]];
}


ReqBE.prototype.verifyPWReset=function*(inObj){ 
  var req=this.req, flow=req.flow, site=req.site;
  var userTab=site.TableName.userTab;
  var Ou={boOK:0};

  var tmp='email'; if(!(tmp in inObj)) { this.mes('The parameter '+tmp+' is required'); return [null, [Ou]];}
  var email=inObj.email;

  var Sql=[], Val=[];
  Sql.push("SELECT email FROM "+userTab+" WHERE email=?;");
  Val.push(email);

  var sql=Sql.join('\n');
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];

  if(results.length==0) { this.mes('No such email in the database'); return [null, [Ou]];}

  var expirationTime=600;

  var code=randomHash()+randomHash();
  var redisVar=code+'_verifyPWReset';
  var tmp=yield* setRedis(flow, redisVar, email, expirationTime);

  var wwwSite=req.wwwSite;
  var uVerification=req.strSchemeLong+wwwSite+'/'+leafVerifyPWResetReturn+'?code='+code;
  var strTxt='<h3>Password reset request on '+wwwSite+'</h3> \n\
<p>Someone (maybe you) tries to reset their '+wwwSite+' password and entered '+email+' as their email.</p> \n\
<p>Is this you, then use the link below to have a new password generated and sent to you.</p> \n\
<p>Otherwise neglect this message.</p> \n\
<p><a href='+uVerification+'>'+uVerification+'</a></p>  \n\
<p>Note! The links stops working '+expirationTime/60+' minutes after the email was sent.</p>';
  
  const msg = { to: email, from: 'noreply@idplace.org', subject: 'Password reset request', html: strTxt };  sgMail.send(msg);
  this.mes('Email sent'); Ou.boOK=1;
  return [null, [Ou]];
}


ReqBE.prototype.deleteImage=function*(inObj){
  var req=this.req, flow=req.flow, res=this.res, site=req.site, siteName=site.siteName;
  var Ou={};   
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser;

  var Sql=[], Val=[];
  if(inObj.kind=='u'){
    Sql.push("CALL "+siteName+"deleteImage(?);"); Val.push(idUser);
  }else{ 
    Sql.push("CALL "+siteName+"deleteAppImage(?);"); Val.push(idUser, inObj.idApp);
  }


  var sql=Sql.join('\n');
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];

  if(inObj.kind=='u'){ 
    Ou.strMessage="Done";
    Ou.imageHash=results[0].imageHash;
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

ReqBE.prototype.uploadImage=function*(inObj){
  var self=this, req=this.req, flow=req.flow, res=this.res, site=req.site, siteName=site.siteName,  {userTab, appTab}=site.TableName;
  var Ou={};
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { return [new ErrorClient('No session')];}
  var idUser=this.sessionMain.idUser;
  var regImg=RegExp("^(png|jpeg|jpg|gif|svg)$");

  var File=this.File;
  var n=File.length; this.mes("nFile: "+n);

  var file=File[0], tmpname=file.path, fileName=file.name; 
  var Match=RegExp('\\.(\\w{1,3})$').exec(fileName); 
  if(!Match){ Ou.strMessage="The file name should have an extension: \".xxx\""; return [null, [Ou]]; }
  var type=Match[1].toLowerCase();
  var err, buf;  fs.readFile(tmpname, function(errT, bufT) { err=errT; buf=bufT;  flow.next();  }); yield;  if(err) return [err];
  var data=buf; 
  if(data.length==0){ this.mes("data.length==0"); return [null, [Ou]]; }

  if(!regImg.test(type)){ Ou.strMessage="Unrecognized file type: "+type; return [null, [Ou]]; }


    // autoOrient, create thumb
  var semY=0, semCB=0, err;
  var myCollector=concat(function(buf){  data=buf;  if(semY) flow.next(); semCB=1;  });
  var streamImg=gm(data).autoOrient().resize(50, 50).stream(function streamOut(errT, stdout, stderr) {
    err=errT; if(err){ if(semY) flow.next(); semCB=1; return; }
    stdout.pipe(myCollector);
  });
  if(!semCB) { semY=1; yield;}
  if(err) return [err];


  
  console.log('uploadImage data.length: '+data.length);
  if(data.length==0) {  return [new Error('data.length==0')]; }
  
  var Sql=[], Val=[];
  if(this.kind=='u'){ 
    //Sql.push("REPLACE INTO "+imageTab+" (idUser,data) VALUES (?,?);"); Val.push(idUser,data);
    //Sql.push("UPDATE "+userTab+" SET imTag=imTag+1 WHERE idUser=?;");  Val.push(idUser);
    Sql.push("CALL "+siteName+"setImage(?, ?)"); Val.push(idUser, data);
  }else{  
    var idApp=Number(this.kind.substr(1));
    Sql.push("CALL "+siteName+"setAppImage(?, ?, ?)"); Val.push(idUser, idApp, data);
  }

  var sql=Sql.join('\n');
  var [err, results]=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) return [err];

  if(this.kind=='u'){ 
    Ou.strMessage="Done";
    Ou.imageHash=results[0].imageHash;
  }else{  
    var mess=results[0][0].mess;
    Ou.strMessage=mess;
    if(mess=='ok'){
      Ou.imageHash=results[1][0].imageHash;
    }
  }

  return [null, [Ou]];
}
  


