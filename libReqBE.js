"use strict"

/******************************************************************************
 * ReqBE
 ******************************************************************************/
var ReqBE=app.ReqBE=function(req, res, callback){
  this.req=req; this.res=res; this.callback=callback||function(){}; this.site=req.site;  this.Str=[]; 
  this.Out={GRet:{}, dataArr:[]}; this.GRet=this.Out.GRet; 
}





ReqBE.prototype.mes=function(str){ this.Str.push(str); }
ReqBE.prototype.mesO=function(str){
  var GRet=this.GRet;
  if(str) this.Str.push(str);
  GRet.strMessageText=this.Str.join(', '); 
  if('tMod' in GRet) GRet.tMod=GRet.tMod.toUnix();
  if('tModCache' in GRet) GRet.tModCache=GRet.tModCache.toUnix();
  this.res.end(JSON.stringify(this.Out));	
}
ReqBE.prototype.mesEO=function(errIn){
  var GRet=this.GRet;
  var boString=typeof errIn=='string';
  var err=errIn; 
  if(boString) { this.Str.push('E: '+errIn); err=new MyError(errIn); } 
  else{  var tmp=err.syscal||''; this.Str.push('E: '+tmp+' '+err.code);  }
  console.log(err.stack);
  //var error=new MyError(err); console.log(error.stack);
  GRet.strMessageText=this.Str.join(', ');
  if('tMod' in GRet) GRet.tMod=GRet.tMod.toUnix();
  if('tModCache' in GRet) GRet.tModCache=GRet.tModCache.toUnix();

  this.res.writeHead(500, {"Content-Type": "text/plain"}); 
  this.res.end(JSON.stringify(this.Out));	
}





ReqBE.prototype.go=function(){
  var self=this, req=this.req, res=this.res, sessionID=req.sessionID;

  getSessionMain.call(this); // sets this.sessionMain
  if(!this.sessionMain || typeof this.sessionMain!='object') { resetSessionMain.call(this); }  
  var redisVar=this.req.sessionID+'_Main', tmp=wrapRedisSendCommand('expire',[redisVar,maxUnactivity]);
    
  if(req.method=='POST'){ 
    if('x-type' in req.headers ){ //&& req.headers['x-type']=='single'
      var form = new formidable.IncomingForm();
      form.multiples = true;  
      //form.uploadDir='tmp';
      
      //var fT=thisChangedWArg(this.myStoreF, this, null);
      //var myStore=concat(fT);
      //form.onPart = function(part) { debugger
      //  if(!part.filename){  form.handlePart(part);  }  // let formidable handle all non-file parts
      //  //part.pipe(myStore);
      // }

      form.parse(req, function(err, fields, files) {
        if(err){self.mesEO(err);  return; } 
        else{
          self.File=files['fileToUpload[]'];
          if('kind' in fields) self.kind=fields.kind; else self.kind='u';
          if('captcha' in fields) self.captchaIn=fields.captcha; else self.captchaIn='';
          if('strName' in fields) self.strName=fields.strName; else self.strName='';
          if(!(self.File instanceof Array)) self.File=[self.File];
          self.jsonInput=fields.vec;
          Fiber( function(){ self.interpretInput.call(self); }).run();
          //self.interpretInput.call(self);
        }
      });

    }else{  
      var myConcat=concat(function(buf){
        self.jsonInput=buf.toString();
        Fiber( function(){ self.interpretInput.call(self); }).run();
        //self.interpretInput.call(self);
      });
      req.pipe(myConcat);
    }
  }
  else if(req.method=='GET'){
    var objUrl=url.parse(req.url), qs=objUrl.query||''; self.jsonInput=urldecode(qs);
    Fiber( function(){ self.interpretInput.call(self); }).run();
    //self.interpretInput.call(self);
  }
}





ReqBE.prototype.interpretInput=function(){
  var self=this, req=this.req, res=this.res, sessionID=req.sessionID;

 
  var jsonInput=this.jsonInput;
  try{ var beArr=JSON.parse(jsonInput); }catch(e){ console.log(e); res.out500('Error in JSON.parse, '+e); debugger; return; }


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
    arrCSRF=['loginGetGraph', 'deleteExtId', 'uploadUser', 'UUpdate', 'createUser', 'UDelete', 'login', 'devAppListGet', 'devAppSecret', 'devAppSet', 'devAppDelete', 'setConsent', 'userAppListGet', 'userAppSet', 'userAppDelete', 'changePW', 'verifyEmail', 'verifyPWReset', 'deleteImage', 'uploadImage'];  // Functions that changes something must check and refresh CSRF-code
    arrNoCSRF=['specSetup','logout'];  // ,'testA','testB'
    allowed=arrCSRF.concat(arrNoCSRF);

      // Assign boCheckCSRF and boSetNewCSRF
    boCheckCSRF=0; boSetNewCSRF=0;   for(var i=0; i<beArr.length; i++){ var row=beArr[i]; if(in_array(row[0],arrCSRF)) {  boCheckCSRF=1; boSetNewCSRF=1;}  }    
    if(StrComp(StrInFunc,['specSetup'])){ boCheckCSRF=0; boSetNewCSRF=1; }
  }else if(caller=='pubKeyStore'){
    arrCSRF=['pubKeyStore','loginGetGraph'];   arrNoCSRF=['specSetup','logout'];   allowed=arrCSRF.concat(arrNoCSRF);

      // Assign boCheckCSRF and boSetNewCSRF
    boCheckCSRF=0; boSetNewCSRF=0;   for(var i=0;i<beArr.length; i++){ var row=beArr[i]; if(in_array(row[0],arrCSRF)) {  boCheckCSRF=1; boSetNewCSRF=1;}  }
    if(StrComp(StrInFunc,['specSetup'])){ boCheckCSRF=0; boSetNewCSRF=1; }
  }else if(caller=='mergeID'){
    arrCSRF=['mergeID','loginGetGraph'];   arrNoCSRF=['specSetup','logout'];   allowed=arrCSRF.concat(arrNoCSRF);

      // Assign boCheckCSRF and boSetNewCSRF
    boCheckCSRF=0; boSetNewCSRF=0;   for(var i=0;i<beArr.length; i++){ var row=beArr[i]; if(in_array(row[0],arrCSRF)) {  boCheckCSRF=1; boSetNewCSRF=1;}  }
    if(StrComp(StrInFunc,['specSetup'])){ boCheckCSRF=0; boSetNewCSRF=1; }

  }else {debugger; }


    // cecking/set CSRF-code
  var redisVar=this.req.sessionID+'_CSRFCode'+ucfirst(caller), CSRFCode;
  if(boCheckCSRF){
    if(!CSRFIn){ var tmp='CSRFCode not set (try reload page)', error=new MyError(tmp); self.mesO(tmp); return;}
    var tmp=wrapRedisSendCommand('get',[redisVar]);
    if(CSRFIn!==tmp){ var tmp='CSRFCode err (try reload page)', error=new MyError(tmp); self.mesO(tmp); return;}
  }
  if(boSetNewCSRF) {
    var CSRFCode=randomHash();
    var tmp=wrapRedisSendCommand('set',[redisVar,CSRFCode]);   var tmp=wrapRedisSendCommand('expire',[redisVar,maxUnactivity]);
    self.GRet.CSRFCode=CSRFCode;
  }

  var Func=[];
  for(var k=0; k<beArr.length; k++){
    var strFun=beArr[k][0]; 
    if(in_array(strFun,allowed)) { 
      var inObj=beArr[k][1],     tmpf; if(strFun in self) tmpf=self[strFun]; else tmpf=global[strFun];     
      //var fT=thisChangedWArg(tmpf, self, inObj);   Func.push(fT);
      var fT=[tmpf,inObj];   Func.push(fT);
    }
  }

  var fiber=Fiber.current; 
  for(var k=0; k<Func.length; k++){
    var Tmp=Func[k], func=Tmp[0], inObj=Tmp[1];
    var semY=0, semCB=0, boDoExit=0;
    func.call(self, function(err, results) {
        if(err){ 
          boDoExit=1;
          if(err!='exited') { debugger; res.out500(err); }
        }
        else {
          self.Out.dataArr.push(results);
        }      
        if(semY) { fiber.run(); } semCB=1;
      }
      , inObj
    );      
    if(!semCB) { semY=1; Fiber.yield();}
    if(boDoExit==1) return;
  }
  self.mesO();
}




/******************************************************************************
 * loginGetGraph
 ******************************************************************************/
ReqBE.prototype.loginGetGraph=function(callback,inObj){
  var self=this, req=this.req, res=this.res, site=req.site, sessionID=req.sessionID, objQS=req.objQS;
  var fiber=Fiber.current;
  var strFun=inObj.fun;
  var Ou={};
  //if(!this.sessionMain.userInfoFrDB){ this.sessionMain.userInfoFrDB=extend({},specialistDefault); setSessionMain.call(this);  }
  

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
  //var reqStream=requestMod.get(uToGetToken).on('error', function(err) { if(err) console.log(err);  })
  var reqStream=requestMod.post({url:uToGetToken, form: objForm},  function(err) { if(err) console.log(err);  })
  var semCB=0, semY=0, boDoExit=0, buf;
  var myConcat=concat(function(bufT){ 
    buf=bufT
    if(semY)fiber.run(); semCB=1;
  });
  reqStream.pipe(myConcat);
  if(!semCB){semY=1; Fiber.yield();}  if(boDoExit==1) {callback('exited'); return; }

 
  try{ var objT=JSON.parse(buf.toString()); }catch(e){ console.log(e); res.out500('Error in JSON.parse, '+e);  callback('exited'); debugger; return; }
  if('error' in objT) { var m=objT.error.message; console.log(m); res.out500(m);  callback('exited'); debugger; return; }
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
  var reqStream=requestMod.get(uGraph).on('error', function(err) { if(err) console.log(err);  });
  //var reqStream=requestMod.post({url:uGraph, form: objForm},  function(err) { if(err) console.log(err);  })
  var semCB=0, semY=0, boDoExit=0, buf;
  var myConcat=concat(function(bufT){ 
    buf=bufT
    if(semY)fiber.run(); semCB=1;
  });
  reqStream.pipe(myConcat);
  if(!semCB){semY=1; Fiber.yield();}  if(boDoExit==1) {callback('exited'); return; }

  //var tmp=JSON.myParse(buf.toString()), err=tmp[0], objGraph=tmp[1];    if(err) { console.log(err); res.out500('Error in JSON.parse, '+err); callback('exited'); debugger; return; }
  try{ var objGraph=JSON.parse(buf.toString()); }catch(e){ console.log(e); res.out500('Error in JSON.parse, '+e);  callback('exited'); debugger; return; }
  self.objGraph=objGraph;

    // interpretGraph
  if('error' in objGraph) {console.log('Error accessing data from ID provider: '+objGraph.error.type+' '+objGraph.error.message+'<br>');  debugger; return; }


  if(strIP=='fb'){ 
    if(!objGraph.verified) { var tmp="Your facebook account is not verified. Try search internet for  \"How to verify facebook account\".";  res.out500(tmp);   return; }
    var IP='fb', idIP=objGraph.id, nameIP=objGraph.name, image=objGraph.picture.data.url, email=objGraph.email;
  }else if(strIP=='google'){
    var IP='google', idIP=objGraph.id, nameIP=objGraph.name.givenName+' '+objGraph.name.familyName, image=objGraph.image.url;
  }else if(strIP=='idplace'){
    var IP='idplace', idIP=objGraph.id, nameIP=objGraph.name, image=objGraph.image;
    //var IP='idplace', idIP=objGraph.idUser, nameIP=objGraph.name, image='';
  }

  if(typeof idIP=='undefined') {console.log("Error idIP is empty");}  else if(typeof nameIP=='undefined' ) {nameIP=idIP;}
  extend(this,{IP:IP, idIP:idIP, nameIP:nameIP, image:image, email:email, timeZone:inObj.timeZone});


  if(['userFun', 'fetchFun'].indexOf(strFun)!=-1){
    var  semCB=0, semY=0, boDoExit=0; 
    this[strFun](function(err,result){
      if(err){  boDoExit=1; if(err!='exited') res.out500(err);  }
      if(semY)fiber.run(); semCB=1;
    });
    if(!semCB){semY=1; Fiber.yield();}  if(boDoExit==1) {callback('exited'); return; }
  }




  callback(null,[Ou]);
}


ReqBE.prototype.userFun=function(callback){
  var self=this, req=this.req, res=this.res, site=req.site,  siteName=site.siteName, userTab=site.TableName.userTab;
   
  var password=randomHash();
  var Sql=[], Val=[]; 
  Sql.push("CALL "+siteName+"loginWExternalIP(?,?,?,?,?);"); Val.push(this.idIP, this.nameIP, this.image, this.email, this.timeZone);

  var sql=Sql.join('\n');
  var fiber = Fiber.current, semCB=0, semY=0, boDoExit=0, results; 
  myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
    if(err){ res.out500(err); boDoExit=1; return; }
    results=resultsT;
    if(semY)fiber.run(); semCB=1;
  });
  if(!semCB){semY=1; Fiber.yield();}  if(boDoExit==1) {callback('exited'); return; }

  var messA=results[0][0].mess;
  var boOK=messA=='ok';
  if(!boOK) {this.mesO(messA); callback('exited'); return; }
  var idUser=Number(results[1][0].idUser);
  self.sessionMain.idUser=idUser;
  setSessionMain.call(self);
  callback(null,0);
}

ReqBE.prototype.fetchFun=function(callback){
  var self=this, req=this.req, res=this.res, site=req.site,  siteName=site.siteName, userTab=site.TableName.userTab;
  var Ou={}; 
   
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
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
Val.push(this.idIP, this.nameIP, this.image, this.email, this.timeZone, idUser);
  var sql=Sql.join('\n');
  var fiber = Fiber.current, semCB=0, semY=0, boDoExit=0, results; 
  myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
    if(err){ res.out500(err); boDoExit=1; return; }
    results=resultsT;
    if(semY)fiber.run(); semCB=1;
  });
  if(!semCB){semY=1; Fiber.yield();}  if(boDoExit==1) {callback('exited'); return; }

  var c=results.affectedRows, boOK, mestmp; 
  if(c>0) {boOK=1; mestmp="Data changed"; } else {boOK=1; mestmp="Nothing changed"; }
  self.mes(mestmp);
  Ou.boOK=boOK; 
  callback(null,0);
}


ReqBE.prototype.deleteExtId=function(callback,inObj){ // Remove link to the external IP
  var self=this, req=this.req, res=this.res, site=req.site,  siteName=site.siteName, userTab=site.TableName.userTab;
   
  var Ou={}; 
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
  var idUser=this.sessionMain.idUser;

  var Sql=[], Val=[]; 
  Sql.push("UPDATE "+userTab+" SET idFB=NULL, image='', tIdFB=now(), tImage=IF(imageHash IS NULL, now(), tImage) WHERE idUser=?"); Val.push(idUser);

  var sql=Sql.join('\n');
  var fiber = Fiber.current, semCB=0, semY=0, boDoExit=0, results; 
  myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
    if(err){ self.mesEO(err); boDoExit=1; return; }
    results=resultsT;
    if(semY)fiber.run(); semCB=1;
  });
  if(!semCB){semY=1; Fiber.yield();}  if(boDoExit==1) {callback('exited'); return; }

  var c=results.affectedRows, boOK, mestmp; 
  if(c>0) {boOK=1; mestmp="Data deleted"; } else {boOK=1; mestmp="Nothing changed"; }
  self.mes(mestmp);
  Ou.boOK=boOK;      
  callback(null, [Ou]);

}


ReqBE.prototype.specSetup=function(callback,inObj){
  var self=this, req=this.req, site=req.site,  siteName=site.siteName, Ou={};
  var userTab=site.TableName.userTab;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
  var fiber = Fiber.current, boDoExit=0;


  var idApp=inObj.idApp||null;

  var Sql=[], Val=[];
  Sql.push("CALL "+siteName+"getUserAppInfo(?,?);"); Val.push(this.sessionMain.idUser, idApp);

  var sql=Sql.join('\n'), results;
  myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
    if(err){self.mesEO(err); boDoExit=1;} 
    else{ 
      results=resultsT;
    }
    fiber.run();
  });
  Fiber.yield();  if(boDoExit==1) {callback('exited'); return; }


  self.GRet.userInfoFrDB={};
  if(results[0].length)  {  
    delete results[0][0].idUser;
    self.GRet.userInfoFrDB=results[0][0];
    //if(results[1].length) self.GRet.userInfoFrDB.imageHash=results[1][0].imageHash;
  } else{
    if(idUser!==null) { resetSessionMain.call(this); idUser=null;}
    //res.out500("User not found (try reload)");  return;
  }
  
  
  var objApp=null; if(results[1].length) self.GRet.objApp=results[1][0];  // name, created, redir_uri, imageHash
  var objUApp=null; if(results[2].length) self.GRet.objUApp=results[2][0];  //scope, tAccess, access_token, maxUnactivityToken, code

  callback(null,[Ou]);
}

ReqBE.prototype.logout=function(callback,inObj){
  var self=this, req=this.req;
  resetSessionMain.call(this); 
  this.GRet.userInfoFrDB={};
  self.mes('Logged out'); callback(null,[0]); return;
}
ReqBE.prototype.login=function(callback,inObj){
  var self=this, req=this.req, site=req.site, Ou={};
  var userTab=site.TableName.userTab;
  var fiber = Fiber.current, boDoExit=0;
  var Sql=[], Val=[];
  var tmp='email'; if(!(tmp in inObj)) { this.mesO('The parameter: '+tmp+' is required'); callback('exited'); return; }
  var tmp='password'; if(!(tmp in inObj)) { this.mesO('The parameter: '+tmp+' is required'); callback('exited'); return; }
  

  Sql.push("SELECT idUser, password FROM "+userTab+" WHERE email=?");
  Val.push(inObj.email);

  var sql=Sql.join('\n'), results;
  myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
    if(err){self.mesEO(err); boDoExit=1;} 
    else{ results=resultsT;    }
    fiber.run();
  });
  Fiber.yield();  if(boDoExit==1) {callback('exited'); return; }
  if(results.length==0) {this.mesO('Email not found'); callback('exited'); return; }
  var objT=results[0];
  if(objT.password!==inObj.password) {this.mesO('Wrong password'); callback('exited'); return; }
  //self.GRet.userInfoFrDB=objT;
  var idUser=self.sessionMain.idUser=Number(objT.idUser);
  setSessionMain.call(this);

  callback(null,[Ou]);
}



/*********************************************************************************************
 * User-functions
 *********************************************************************************************/

ReqBE.prototype.UUpdate=function(callback,inObj){ // writing needSession
  var self=this, req=this.req, site=req.site, siteName=site.siteName;
  var userTab=site.TableName.userTab;
  var Ou={}; 
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
  var idUser=this.sessionMain.idUser;

    

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
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      self.mes('Data updated');      
      callback(null, [Ou]);
    }
  });
}
//'name', 'password', 'image', 'email', 'telephone',    'country', 'federatedState', 'county', 'city', 'zip', 'address',    'fb', 'google', 'idNational', 'birthdate', 'motherTongue', 'gender' 


ReqBE.prototype.createUser=function(callback,inObj){ // writing needSession
  var self=this, req=this.req, site=req.site;
  var userTab=site.TableName.userTab;
  var Ou={}; //debugger
  var fiber = Fiber.current;

  //var tmp=this.sessionMain.userInfoFrIP, IP=tmp.IP, idIP=tmp.idIP, nameIP=tmp.nameIP, image=tmp.image;

    // Check reCaptcha with google
  var uGogCheck = "https://www.google.com/recaptcha/api/siteverify"; 
  var objForm={  secret:strReCaptchaSecretKey, response:inObj['g-recaptcha-response'], remoteip:req.connection.remoteAddress  };
  var reqStream=requestMod.post({url:uGogCheck, form: objForm},  function(err) { if(err) console.log(err);  });
  var buf, myConcat=concat(function(bufT){ buf=bufT; fiber.run(); });  reqStream.pipe(myConcat); Fiber.yield();
  var data = JSON.parse(buf.toString());
  //console.log('Data: ', data);
  if(!data.success) { self.mesEO('reCaptcha test not successfull'); callback('exited'); return; }
  
  var Sql=[]; 
  Sql.push("INSERT INTO "+userTab+" SET name=?, password=?, email=?, telephone=?, country=?, federatedState=?, county=?, city=?, zip=?, address=?, timeZone=?, idNational=?, birthdate=?, motherTongue=?, gender=?,\n\
  tCreated=now(), tName=now(), tImage=now(), tEmail=now(), tTelephone=now(), tCountry=now(), tFederatedState=now(), tCounty=now(), tCity=now(), tZip=now(), tAddress=now(), tIdFB=now(), tIdGoogle=now(), tIdNational=now(), tBirthdate=now(), tMotherTongue=now(), tGender=now();");
  var Val=[inObj.name, inObj.password, inObj.email, inObj.telephone, inObj.country, inObj.federatedState, inObj.county, inObj.city, inObj.zip, inObj.address, inObj.timeZone, inObj.idNational, inObj.birthdate, inObj.motherTongue, inObj.gender];
  Sql.push("SELECT LAST_INSERT_ID() AS idUser;");
  //Sql.push("UPDATE "+userTab+" SET imageHash=LAST_INSERT_ID()%32 WHERE idUser=LAST_INSERT_ID();");

  var sql=Sql.join('\n');
  var boDoExit=0;
  myQueryF(sql, Val, mysqlPool, function(err, results){
    var boOK, mestmp;
    if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup email';}
    else if(err){
      self.mesEO(err); boDoExit=1;
    }
    else{
      boOK=1; mestmp="Done"; 
      var idUser=self.sessionMain.idUser=Number(results[1][0].idUser);
    }
    self.mes(mestmp);
    extend(Ou, {boOK:boOK});
    fiber.run();
  });
  Fiber.yield();  if(boDoExit==1) {callback('exited'); return; }
  setSessionMain.call(this);
  callback(null, [Ou]);
}


ReqBE.prototype.setConsent=function(callback,inObj){
  var self=this, req=this.req, site=req.site, siteName=site.siteName;
  var appTab=site.TableName.appTab, user2AppTab=site.TableName.user2AppTab;
  var Ou={};
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
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
  myQueryF(sql, Val, mysqlPool, function(err, results){
    var boOK, mestmp;
    //if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup key';} 
    if(err){
      self.mesEO(err); callback('exited');  return;
    }
    else{
      boOK=1; mestmp="Done";
    }
    self.mes(mestmp);
    //self.GRet.objUApp={scope:inObj.scope, tAccess:tAccess, access_token:access_token, maxUnactivityToken:inObj.maxUnactivityToken};
    extend(Ou, {boOK:boOK});
    callback(null, [Ou]);
    
  });
}

ReqBE.prototype.UDelete=function(callback,inObj){  // writing needSession
  var self=this, req=this.req, res=this.res, site=req.site;
  var userTab=site.TableName.userTab;
  var Ou={};
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
  var idUser=this.sessionMain.idUser;
  
  var Sql=[], Val=[];
  Sql.push("DELETE FROM "+userTab+" WHERE idUser=?;"); Val.push(idUser);
  Sql.push("SELECT count(*) AS n FROM "+userTab+";");
  var sql=Sql.join('\n'); 
  var fiber = Fiber.current, err, results; 
  myQueryF(sql, Val, mysqlPool, function(errT, resultsT) {
    err=errT;  results=resultsT;
    fiber.run();  
  });
  Fiber.yield();
  if(err){self.mesEO(err); callback('exited');  return; } 

  var c=results[0].affectedRows, boOK, mestmp; 
  if(c==0) {self.mesEO("Nothing changed"); callback('exited');  return; }
  self.mes("Entry deleted");  
  //site.boNUserChanged=1; // variabel should be called boNUsers changed or something..
  site.nUser=Number(results[1][0].n);  
  resetSessionMain.call(this);
  this.GRet.userInfoFrDB={};
  callback(null, [Ou]);
}


/********************************************************************************
 * userAppList
 ********************************************************************************/
ReqBE.prototype.userAppListGet=function(callback,inObj){ 
  var self=this, req=this.req, site=req.site;
  var appTab=site.TableName.appTab, user2AppTab=site.TableName.user2AppTab;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
  var idUser=this.sessionMain.idUser;

  var sql="SELECT a.idApp AS idApp, a.name AS appName, scope, UNIX_TIMESTAMP(tAccess) AS tAccess, imageHash FROM "+user2AppTab+" ua JOIN  "+appTab+" a ON ua.idApp=a.idApp WHERE idUser=?;";

  var Val=[idUser];
  var fiber=Fiber.current, semY=0, semCB=0, err, results;
  myQueryF(sql, Val, mysqlPool, function(errT, resultsT) {
    err=errT;  results=resultsT;
    if(semY) { fiber.run(); } semCB=1;
  });
  if(!semCB) { semY=1; Fiber.yield();}
  if(err){ self.mesEO(err); callback('exited');  return;  }
  var Ou=arrObj2TabNStrCol(results); 
  self.mes("Got "+results.length+" entries"); 
  extend(Ou, {boOK:1,nEntry:results.length});
  callback(null, [Ou]);
}
  //idUser, idApp, scope, tAccess, access_token, maxUnactivityToken
ReqBE.prototype.userAppSet=function(callback,inObj){
  var self=this, req=this.req, site=req.site;
  var appTab=site.TableName.appTab, user2AppTab=site.TableName.user2AppTab;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
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
  
  myQueryF(sql, Val, mysqlPool, function(err, results){
    var boOK, mestmp;
    //if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup key';} 
    if(err){
      self.mesEO(err); callback('exited');  return;
    }
    else{
      boOK=1; mestmp="Done";
    }
    self.mes(mestmp);
    //self.GRet.objUApp={scope:inObj.scope, tAccess:tAccess, access_token:access_token, maxUnactivityToken:inObj.maxUnactivityToken};
    extend(Ou, {boOK:boOK});
    callback(null, [Ou]);
    
  });
}
ReqBE.prototype.userAppDelete=function(callback,inObj){ 
  var self=this, req=this.req, site=req.site;
  var appTab=site.TableName.appTab, user2AppTab=site.TableName.user2AppTab;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
  var idUser=this.sessionMain.idUser;
  var Ou={};
  
  //var sql="DELETE au FROM "+user2AppTab+" ua JOIN  "+appTab+" a ON ua.idApp=a.idApp WHERE au.idUser=?;";
  var sql="DELETE FROM "+user2AppTab+" WHERE idUser=? AND idApp=?;";
  var Val=[idUser, inObj.idApp];
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      var c=results.affectedRows, boOK, mestmp; 
      if(c>0) {boOK=1; mestmp="Entry deleted"; } else {boOK=1; mestmp="Nothing changed"; }
      self.mes(mestmp);
      Ou.boOK=boOK;      
      callback(null, [Ou]);
    }
  });
}


ReqBE.prototype.devAppListGet=function(callback,inObj){ 
  var self=this, req=this.req, site=req.site;
  var appTab=site.TableName.appTab;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
  var idUser=this.sessionMain.idUser;

  var GRet=this.GRet;
  var sql="SELECT idApp, name AS appName, redir_uri, imageHash, UNIX_TIMESTAMP(created) AS created FROM "+appTab+" WHERE idOwner=?;";
  var Val=[idUser];
  var fiber=Fiber.current, semY=0, semCB=0, err, results;
  myQueryF(sql, Val, mysqlPool, function(errT, resultsT) {
    err=errT;  results=resultsT;
    if(semY) { fiber.run(); } semCB=1;
  });
  if(!semCB) { semY=1; Fiber.yield();}
  if(err){ self.mesEO(err); callback('exited');  return;  }
  var Ou=arrObj2TabNStrCol(results);
  self.mes("Got "+results.length+" entries"); 
  extend(Ou, {boOK:1,nEntry:results.length});
  callback(null, [Ou]);
}
ReqBE.prototype.devAppSecret=function(callback,inObj){ 
  var self=this, req=this.req, site=req.site;
  var appTab=site.TableName.appTab;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
  var idUser=this.sessionMain.idUser;

  var Ou={};
  var sql="SELECT secret FROM "+appTab+" WHERE idOwner=? AND idApp=?;";
  var Val=[idUser, inObj.idApp];
  var fiber=Fiber.current, semY=0, semCB=0, err, results;
  myQueryF(sql, Val, mysqlPool, function(errT, resultsT) {
    err=errT;  results=resultsT;
    if(semY) { fiber.run(); } semCB=1;
  });
  if(!semCB) { semY=1; Fiber.yield();}
  if(err){ self.mesEO(err); callback('exited');  return;  }
  Ou.secret=results[0].secret;
  callback(null, [Ou]);
}
ReqBE.prototype.devAppSet=function(callback,inObj){
  var self=this, req=this.req, site=req.site;
  var appTab=site.TableName.appTab;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
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
  myQueryF(sql, Val, mysqlPool, function(err, results){
    var mestmp, idApp=inObj.idApp, imageHash;
    if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup key';}
    else if(err){
      self.mesEO(err); callback('exited'); 
      Ou.boOK=0; return;
    }
    else{
      mestmp="Done"; Ou.boOK=1;
      if(!boUpd){
        //extend(Ou, results[3][0]);
        extend(Ou, results[1][0]);
      }
    }
    self.mes(mestmp);
    callback(null, [Ou]);
    
  });
}
ReqBE.prototype.devAppDelete=function(callback,inObj){ 
  var self=this, req=this.req, site=req.site;
  var appTab=site.TableName.appTab;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
  var idUser=this.sessionMain.idUser;
  var GRet=this.GRet;
  var Ou={};
  var sql="DELETE FROM "+appTab+" WHERE idOwner=? AND idApp=?";
  var Val=[idUser, inObj.idApp];
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      var c=results.affectedRows, boOK, mestmp; 
      if(c>0) {boOK=1; mestmp="Entry deleted"; } else {boOK=1; mestmp="Nothing changed"; }
      self.mes(mestmp);
      Ou.boOK=boOK;      
      callback(null, [Ou]);
    }
  });
}



ReqBE.prototype.changePW=function(callback,inObj){ 
  var self=this, req=this.req, site=req.site, siteName=site.siteName;
  var userTab=site.TableName.userTab;
  var Ou={boOK:0};
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
  var idUser=this.sessionMain.idUser
  var passwordOld=inObj.passwordOld;
  var passwordNew=inObj.passwordNew;


  var fiber=Fiber.current;

  var Sql=[], Val=[];
  //Sql.push("UPDATE "+userTab+" SET password=? WHERE password=? AND idUser=?;");
  //Val.push(inObj.password, inObj.passwordOld, idUser);
  Sql.push("CALL "+siteName+"setPassword(?,?,?);"); Val.push(idUser, passwordOld, passwordNew);

  var sql=Sql.join('\n');
  var boDoExit=0, results;
  myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
    if(err){self.mesEO(err); boDoExit=1;} 
    else{ results=resultsT;    }
    fiber.run();
  });
  Fiber.yield();  if(boDoExit==1) {callback('exited'); return; }

  var mess=results[0][0].mess;
  if(mess=='Password changed') Ou.boOK=1;
  self.mes(mess); 
  
  callback(null,[Ou]);
}

ReqBE.prototype.verifyEmail=function(callback,inObj){ 
  var self=this, req=this.req, site=req.site;
  var userTab=site.TableName.userTab;
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
  var idUser=this.sessionMain.idUser;

  var expirationTime=600;

  var code=randomHash()+randomHash();
  var redisVar=code+'_verifyEmail';
  var tmp=wrapRedisSendCommand('set',[redisVar,idUser]);
  var tmp=wrapRedisSendCommand('expire',[redisVar,expirationTime]);
  var Ou={};

  var fiber=Fiber.current;

  var Sql=[], Val=[];
  Sql.push("SELECT email FROM "+userTab+" WHERE idUser=?;");
  Val.push(idUser);

  var sql=Sql.join('\n');
  var boDoExit=0, results;
  myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
    if(err){self.mesEO(err); boDoExit=1;} 
    else{ results=resultsT;    }
    fiber.run();
  });
  Fiber.yield();  if(boDoExit==1) {callback('exited'); return; }


  if(results.length==0) { self.mes('No such idUser in the database'); callback(null,[Ou]); return;}
  var email=results[0].email;
  var wwwSite=req.wwwSite;
  var uVerification=req.strSchemeLong+wwwSite+'/'+leafVerifyEmailReturn+'?code='+code;
  var strTxt='<h3>Email verification on '+wwwSite+'</h3> \n\
<p>Someone (maybe you) uses '+wwwSite+' and claims that '+email+' is their email address. Is this you? If so use the link below to verify that you are the owner of this email address.</p> \n\
<p>Otherwise neglect this message.</p> \n\
<p><a href='+uVerification+'>'+uVerification+'</a></p>  \n\
<p>Note! The links stops working '+expirationTime/60+' minutes after the email was sent.</p>';
  
  const msg = {
    to: email,
    from: 'noreply@idplace.org',
    subject: 'Email verification',
    html: strTxt,
  };
  sgMail.send(msg);
  //var semCB=0, semY=0, boDoExit=0;
  //objSendgrid.send({
    //to:       email,
    //from:     sendgridName,
    //subject:  'Email verification',
    //html:     strTxt
  //}, function(err, json) {
    //if(err){self.mesEO(err); boDoExit=1;} 
    //if(semY)fiber.run(); semCB=1;
  //});
  //if(!semCB){semY=1; Fiber.yield();}  if(boDoExit==1) {callback('exited'); return; }
  self.mes('Email sent');
  Ou.boOK=1;
  callback(null, [Ou]);

}


ReqBE.prototype.verifyPWReset=function(callback,inObj){ 
  var self=this, req=this.req, site=req.site;
  var userTab=site.TableName.userTab;
  var Ou={boOK:0};

  var tmp='email'; if(!(tmp in inObj)) { self.mes('The parameter '+tmp+' is required'); callback(null,[Ou]); return;}
  var email=inObj.email;

  var fiber=Fiber.current;

  var Sql=[], Val=[];
  Sql.push("SELECT email FROM "+userTab+" WHERE email=?;");
  Val.push(email);

  var sql=Sql.join('\n');
  var boDoExit=0, results;
  myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
    if(err){self.mesEO(err); boDoExit=1;} 
    else{ results=resultsT;    }
    fiber.run();
  });
  Fiber.yield();  if(boDoExit==1) {callback('exited'); return; }

  if(results.length==0) { self.mes('No such email in the database'); callback(null,[Ou]); return;}

  var expirationTime=600;

  var code=randomHash()+randomHash();
  var redisVar=code+'_verifyPWReset';
  var tmp=wrapRedisSendCommand('set',[redisVar,email]);
  var tmp=wrapRedisSendCommand('expire',[redisVar,expirationTime]);


  var wwwSite=req.wwwSite;
  var uVerification=req.strSchemeLong+wwwSite+'/'+leafVerifyPWResetReturn+'?code='+code;
  var strTxt='<h3>Password reset request on '+wwwSite+'</h3> \n\
<p>Someone (maybe you) tries to reset their '+wwwSite+' password and entered '+email+' as their email.</p> \n\
<p>Is this you, then use the link below to have a new password generated and sent to you.</p> \n\
<p>Otherwise neglect this message.</p> \n\
<p><a href='+uVerification+'>'+uVerification+'</a></p>  \n\
<p>Note! The links stops working '+expirationTime/60+' minutes after the email was sent.</p>';
  

  const msg = {
    to: email,
    from: 'noreply@idplace.org',
    subject: 'Password reset request',
    html: strTxt,
  };
  sgMail.send(msg);
  //var semCB=0, semY=0, boDoExit=0;
  //objSendgrid.send({
    //to:       email,
    //from:     sendgridName,
    //subject:  'Password reset request',
    //html:     strTxt
  //}, function(err, json) {
    //if(err){self.mesEO(err); boDoExit=1;} 
    //if(semY)fiber.run(); semCB=1;
  //});
  //if(!semCB){semY=1; Fiber.yield();}  if(boDoExit==1) {callback('exited'); return; }
  self.mes('Email sent'); Ou.boOK=1;
  callback(null, [Ou]);

}


ReqBE.prototype.deleteImage=function(callback,inObj){
  var self=this, req=this.req, res=this.res, site=req.site, siteName=site.siteName;
  var Ou={};   
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
  var idUser=this.sessionMain.idUser;
  var fiber = Fiber.current;

  var Sql=[], Val=[];
  if(inObj.kind=='u'){
    Sql.push("CALL "+siteName+"deleteImage(?);"); Val.push(idUser);
  }else{ 
    Sql.push("CALL "+siteName+"deleteAppImage(?);"); Val.push(idUser, inObj.idApp);
  }


  var sql=Sql.join('\n'), boDoExit=0, results; 
  myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    results=resultsT;
    fiber.run(); 
  });
  Fiber.yield();  if(boDoExit==1) { return; }

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
  //if(nDel==1) {self.mes('Image deleted'); } else { self.mes(nDel+" images deleted");}

  callback(null, [Ou]);
}

ReqBE.prototype.uploadImage=function(callback,inObj){
  var self=this, req=this.req, res=this.res, site=req.site, siteName=site.siteName;
  var Ou={};
  if(typeof this.sessionMain!='object' || !('idUser' in this.sessionMain)) { self.mes('No session'); callback(null,[Ou]); return;}
  var idUser=this.sessionMain.idUser;
  var fiber = Fiber.current;
  var regImg=RegExp("^(png|jpeg|jpg|gif|svg)$");

  var File=self.File;
  var n=File.length; self.mes("nFile: "+n);

  var file=File[0], tmpname=file.path, fileName=file.name; 
  var Match=RegExp('\\.(\\w{1,3})$').exec(fileName); 
  if(!Match){ Ou.strMessage="The file name should have an extension: \".xxx\""; callback(null,[Ou]); return; }
  var type=Match[1].toLowerCase(),data, boDoExit=0;
  fs.readFile(tmpname, function(err, buf) { //, this.encRead
    if(err){ boDoExit=1; self.mesEO(err);  }
    else data=buf;//.toString();
    fiber.run();
  });
  Fiber.yield();  if(boDoExit==1) {callback('exited'); return; }
  if(data.length==0){ self.mes("data.length==0"); callback(null,[Ou]); return; }

  if(!regImg.test(type)){ Ou.strMessage="Unrecognized file type: "+type; callback(null,[Ou]); return; }


  var semY=0, semCB=0, boDoExit=0;
  var myCollector=concat(function(buf){
    data=buf;
    if(semY) { fiber.run(); } semCB=1;
  }); 
  var streamImg=gm(data).autoOrient().resize(50, 50).stream(function streamOut(err, stdout, stderr) {
    if(err){ boDoExit=1; self.mesEO(err); return; } 
    stdout.pipe(myCollector); 
  });
  if(!semCB) { semY=1; Fiber.yield();}
  if(boDoExit==1) {callback('exited'); return; }


  var TableName=site.TableName, userTab=TableName.userTab, appTab=TableName.appTab;
  
  console.log('uploadImage data.length: '+data.length);
  if(data.length==0) {self.mesEO('data.length==0');  callback('exited'); return; }
  
  var Sql=[], Val=[];
  if(this.kind=='u'){ 
    //Sql.push("REPLACE INTO "+imageTab+" (idUser,data) VALUES (?,?);"); Val.push(idUser,data);
    //Sql.push("UPDATE "+userTab+" SET imTag=imTag+1 WHERE idUser=?;");  Val.push(idUser);
    Sql.push("CALL "+siteName+"setImage(?, ?)"); Val.push(idUser, data);
  }else{  
    var idApp=Number(this.kind.substr(1));
    Sql.push("CALL "+siteName+"setAppImage(?, ?, ?)"); Val.push(idUser, idApp, data);
  }

  var sql=Sql.join('\n'), boDoExit=0, results; 
  myQueryF(sql, Val, mysqlPool, function(err, resultsT) {
    if(err){res.out500(err);  boDoExit=1;  } 
    results=resultsT;
    fiber.run(); 
  });
  Fiber.yield();  if(boDoExit==1) {callback('exited'); return; }

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

  callback(null, [Ou]);
}
  


