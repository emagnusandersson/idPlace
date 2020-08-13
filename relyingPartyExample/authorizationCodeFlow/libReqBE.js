"use strict"

/******************************************************************************
 * reqBE
 ******************************************************************************/
app.reqBE=function*() {
  var req=this.req, res=this.res, flow=req.flow;
   
 
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
  var uToGetToken=UrlCode2Token[strIP];
  
  var arrT = Object.keys(objForm).map(function (key) { return key+'='+objForm[key]; }), strQuery=arrT.join('&'); 
  var semY=0, semCB=0, err, response, body;
  var reqStream=requestMod.post({url:uToGetToken, form: objForm},  function(errT, responseT, bodyT) { err=errT; response=responseT; body=bodyT; if(semY)flow.next(); semCB=1;  }); if(!semCB){semY=1; yield;}
  
  if(err) {console.log(err);  res.setCodeNEnd(500, 'Error in requestMod.post, '+err); return; }
  //else if(response.statusCode != 200) { var tmp='response.statusCode != 200'; console.log(tmp);  res.setCodeNEnd(500, tmp); return; }
  var buf=body;
  
  try{ var objT=JSON.parse(buf.toString()); }catch(e){ console.log(e); res.setCodeNEnd(500, 'Error in JSON.parse, '+e);   debugger; return; }
  console.log("Result from code2Token request:",objT);
  if('error' in objT) { var m=objT.error.message; res.setCodeNEnd(500, '"error" in objT, '+m);   debugger; return;  }
  var access_token=objT.access_token;
  

    // Get Graph
  if(strIP=='fb')  var objForm={access_token, fields:"id,name,verified,picture,email"};
  else if(strIP=='google')  var objForm={access_token, fields:"id,name,verified,image,email"};
  else if(strIP=='idplace' || strIP=='idL' || strIP=='id192')  var objForm={access_token};
  var uGraph=UrlGraph[strIP];

  var arrT = Object.keys(objForm).map(function (key) { return key+'='+objForm[key]; }), strQuery=arrT.join('&'); 
  if(strQuery.length) uGraph+='?'+strQuery;

  var semY=0, semCB=0, err, response, body;
  var reqStream=requestMod.get(uGraph,  function(errT, responseT, bodyT) { err=errT; response=responseT; body=bodyT; if(semY)flow.next(); semCB=1;  }); if(!semCB){semY=1; yield;}
  if(err) {console.log(err);  res.setCodeNEnd(500, 'Error in requestMod, '+err); debugger; return; }
  else if(response.statusCode != 200) { var tmp='response.statusCode != 200'; console.log(tmp);  res.setCodeNEnd(500, tmp); debugger; return; }
  var strBody=buf.toString()


  try{ var objGraph=JSON.parse(strBody); }catch(e){ console.log(e); res.setCodeNEnd(500, 'Error in JSON.parse, '+e);   debugger; return; }
  
  if('error' in objGraph) {var tmp='Error accessing data from ID provider: '+objGraph.error.type+' '+objGraph.error.message+'<br>';  console.log(tmp);  res.setCodeNEnd(500, tmp); debugger; return; }
  
  
  console.log("Result from data-extraction request:",objGraph);
  res.end(strBody);

}





