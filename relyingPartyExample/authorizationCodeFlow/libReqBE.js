"use strict"

/******************************************************************************
 * reqBE
 ******************************************************************************/
app.reqBE=function*() {
  var req=this.req, res=this.res;
   
 
  if(req.method!='POST'){  res.setCodeNEnd(405, 'Method Not Allowed');    return;  }
  var jsonInput;
  var myConcat=concat(function(buf){
    jsonInput=buf.toString();
    req.flow.next();
  });
  req.pipe(myConcat);
  yield;
  try{ var inObj=JSON.parse(jsonInput); }catch(e){ console.log(e);  res.setCodeNEnd(500, 'Error in JSON.parse, '+e); return; }
  res.setHeader("Content-type", "application/json");
  
  var strIP=inObj.IP;
  var appCredIP=AppCred[strIP];
    // code2Token
  var objForm={grant_type:'authorization_code', client_id:appCredIP.id, redirect_uri:uRedir, client_secret:appCredIP.secret, code:inObj.code};
  var urlCode2Token=UrlCode2Token[strIP];
  
  var arrT = Object.keys(objForm).map(function (key) { return key+'='+objForm[key]; }), strQuery=arrT.join('&'); 
  var boExit=0, strBody;
  var reqStream=requestMod.post({url:urlCode2Token, form: objForm},  function(err,httpResponse,body) {
    if(err) {console.log(err);  res.setCodeNEnd(500, 'Error in requestMod.post, '+err); boExit=1; }
    else if(httpResponse.statusCode != 200) { var tmp='httpResponse.statusCode != 200'; console.log(tmp);  res.setCodeNEnd(500, tmp); boExit=1; }
    else strBody=body;
    req.flow.next();
  });
  yield; if(boExit) return;

  try{ var objT=JSON.parse(strBody); }catch(e){ console.log(e); res.setCodeNEnd(500, 'Error in JSON.parse, '+e);   debugger; return; }
  console.log("Result from code2Token request:",objT);
  var access_token=objT.access_token;


    // Get Graph
  var uGraph=UrlGraph[strIP];
  if(strIP=='fb')  var objForm={access_token:access_token, fields:"id,name,verified,picture"};
  else if(strIP=='google')  var objForm={access_token:access_token, fields:"id,name,verified,image"};
  else if(strIP=='idplace' || strIP=='idL' || strIP=='id192')  var objForm={access_token:access_token};

  var arrT = Object.keys(objForm).map(function (key) { return key+'='+objForm[key]; }), strQuery=arrT.join('&'); 
  if(strQuery.length) uGraph+='?'+strQuery;

  var boExit=0, strBody;
  var reqStream=requestMod.get({url:uGraph},  function(err,httpResponse,body) {
    if(err) {console.log(err);  res.setCodeNEnd(500, 'Error in requestMod, '+err); boExit=1; }
    else if(httpResponse.statusCode != 200) { var tmp='httpResponse.statusCode != 200'; console.log(tmp);  res.setCodeNEnd(500, tmp); boExit=1; }
    else strBody=body;
    req.flow.next();
  });
  yield; if(boExit) return;

  try{ var objGraph=JSON.parse(strBody); }catch(e){ console.log(e); res.setCodeNEnd(500, 'Error in JSON.parse, '+e);   debugger; return; }
  
  if('error' in objGraph) {var tmp='Error accessing data from ID provider: '+objGraph.error.type+' '+objGraph.error.message+'<br>';  console.log(tmp);  res.setCodeNEnd(500, tmp); debugger; return; }
  
  
  console.log("Result from data-extraction request:",objGraph);
  res.end(strBody);

}





