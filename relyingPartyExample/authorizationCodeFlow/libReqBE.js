"use strict"

/******************************************************************************
 * reqBE
 ******************************************************************************/
app.reqBE=async function() {
  var {req, res}=this;
   
 
  if(req.method!='POST'){  res.outCode(405, 'Method Not Allowed');    return;  }

  var [err,buf]=await new Promise(resolve=>{  var myConcat=concat(bT=>resolve([null,bT]));    req.pipe(myConcat);  });  if(err){ res.out500(err); return; }
  var jsonInput=buf.toString();

  try{ var inObj=JSON.parse(jsonInput); }catch(e){ console.log(e);  res.out500(e); return; }

  res.setHeader("Content-type", "application/json");
  
  var strIP=inObj.IP;
  var appCredIP=AppCred[strIP];
  
    // code2Token
  var objForm={grant_type:'authorization_code', client_id:appCredIP.id, redirect_uri:uRedir, client_secret:appCredIP.secret, code:inObj.code};
  var uToGetToken=UrlCode2Token[strIP];
  
  var params = new URLSearchParams(objForm);
  var [err,response]=await fetch(uToGetToken, {method:'POST', body:params}).toNBP(); if(err) {res.out500(err); return; }
  var [err, objT]=await response.json().toNBP(); if(err) { res.out500(err);   debugger; return; }

  console.log("Result from code2Token request:",objT);
  if('error' in objT) { var m=objT.error.message; res.out500(m);   debugger; return;  }
  var access_token=objT.access_token;
  

    // Get Graph
  if(strIP=='fb')  var objForm={access_token, fields:"id,name,verified,picture,email"};
  else if(strIP=='google')  var objForm={access_token, fields:"id,name,verified,image,email"};
  else if(strIP=='idplace' || strIP=='idL' || strIP=='id192')  var objForm={access_token};
  var uGraph=UrlGraph[strIP];

  var arrT = Object.keys(objForm).map(function (key) { return key+'='+objForm[key]; }), strQuery=arrT.join('&'); 
  if(strQuery.length) uGraph+='?'+strQuery;

  var params = new URLSearchParams(objForm);
  var [err,response]=await fetch(uGraph, {method:'POST', body:params}).toNBP(); if(err) {res.out500(err); return; }
  var [err, objGraph]=await response.json().toNBP(); if(err) { res.out500(err);   debugger; return; }
  
  if('error' in objGraph) {var tmp=`Error accessing data from ID provider: ${objGraph.error.type} ${objGraph.error.message}<br>`;  console.log(tmp);  res.out500(tmp); debugger; return; }
  
  
  console.log("Result from data-extraction request:",objGraph);
  res.end(strBody);

}





