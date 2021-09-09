



"use strict"


var randomHash=function(){ return Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);}
var parseQS=function(str){
  var params = {},      regex = /([^&=]+)=([^&]*)/g, m;
  while (m = regex.exec(str)) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }
  return params;
}

window.onload=function(){
  var $body=$('body');

  var popupWin=function(IP) {
    flowLogin=flowLoginF.call(this, IP);  flowLogin.next();
  }
  var flowLoginF=async function(IP){
      // Get authorization code
    var nonce=randomHash();
    var arrQ=["client_id="+AppId[IP], "redirect_uri="+encodeURIComponent(uRedir), "state="+nonce, "response_type=code"];
    if(IP=='fb')   arrQ.push( "display=popup");
    else if(IP=='google')    arrQ.push("scope=profile");
    else if(IP=='idplace' || IP=='idL' || IP=='id192')    arrQ.push("scope=name,image");
    var uPop=UrlOAuth[IP]+'?'+arrQ.join('&');
    window.open(uPop, '_blank', 'width=580,height=400');

    var [strQS, strHash]=await new Promise(resolve=>{
      window.loginReturn=function(strQST, strHashT){ resolve([strQST, strHashT]); }
    });
    var param=parseQS(strQS.substring(1));
    var tmp='<b>Result of "authentication code" request</b>:<pre>'+JSON.stringify(param, null,2)+"</pre>";   $divParamAccessTokenReq.html(tmp);

    if(!('state' in param) || param.state !== nonce) {    alert('Invalid state.'); return;  } 

    
    if('error' in param) { $divMess.html(param.error); return }   
    if(!('code' in param)) {  $divMess.html('no "code" parameter in response from IP');  return;  }
      

      // AJAX request
    var oT={IP, code:param.code}; 

    var xhr = new XMLHttpRequest();
    xhr.open('POST', leafBE);  // I'm using "POST" but with this little data one could have used "GET" 
    xhr.setRequestHeader('Content-Type', 'application/json');
    var [err]=await new Promise(resolve=>{
      xhr.onload = function() {
        if(xhr.status !== 200) {   resolve([new Error('Request failed.  Returned status of ' + xhr.status)]); return;   }
        resolve([null]);
      };
      xhr.send(JSON.stringify(oT));
    });
    if(err) return [err];

    var data=xhr.responseText;
    try{ var objAJAX=JSON.parse(data); }catch(e){  return [e]; }


    //var headers={'X-Requested-With':'XMLHttpRequest'};
    //var argFetch={method:'POST', headers}
    // var [err, response]= await fetch(leafBE, argFetch).toNBP();  if(err) return [err];
    // var [err, objAJAX]=await response.json().toNBP();  if(err) return [err];

    var tmp='<b>Result of "AJAX"-request to your server (intermediate requests are logged to the server console)</b>:<pre>'+JSON.stringify(objAJAX, null,2)+"</pre>";   $divParamMeReq.html(tmp);

  }
  var flowLogin;  


  var $buttonFB=$('<button>').click(function(){popupWin('fb');}).append('Facebook');
  var $buttonGoogle=$('<button>').click(function(){popupWin('google');}).append('Google');
  var $buttonIdPlace=$('<button>').click(function(){popupWin('idplace');}).append('idPlace');
  var $buttonIdL=$('<button>').click(function(){popupWin('idL');}).append('idL');   // <-- The following lines could/should be commented out (or removed)  (only for the developer of idplace)
  var $buttonId192=$('<button>').click(function(){popupWin('id192');}).append('id192');   // <-- The following lines could/should be commented out (or removed)  (only for the developer of idplace)

  var $divParamAccessTokenReq=$('<div>');
  var $divParamMeReq=$('<div>');
  var $divMess=$('<div>'),  setMess=function(strMess){$divMess.html(strMess);}

  $body.append($buttonFB,$buttonGoogle,$buttonIdPlace, $divParamAccessTokenReq, $divParamMeReq, $divMess); 
  $buttonIdPlace.after($buttonIdL,$buttonId192);   // <-- The following lines could/should be commented out (or removed)  (only for the developer of idplace)
}














