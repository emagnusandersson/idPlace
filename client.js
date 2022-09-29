


"use strict"
app.funLoad=function(){

var popUpExtend=function(el){
  el.openPop=function() {
    el.append(spanMessageText);
    container.empty().append(el);  elBody.append(blanket);  elBody.append(container);
  }
  el.closePop=function() {  el.remove();  container.remove();  blanket.remove();  elBody.append(spanMessageText);  }

  el.addClass('Center');
  var blanket=createElement('div').addClass('blanket');
  var container=createElement('div').addClass('Center-Container');
  return el;
}

var vippButtonExtend=function(el){
  el.setStat=function(bo1){
    if(!bo1) {el.css(o0);} else {el.css(o1);} 
    el.attr({boOn:bo1});
  }
  var o0={background:'url('+uVipp0+') no-repeat'}, o1={background:'url('+uVipp1+') no-repeat'};
    
  el.attr({boOn:0});
  el.css({'background':'url('+uVipp0+') no-repeat',height:'33px',width:'90px',transform:'scale(0.60)','vertical-align':'-0.5em',cursor:'pointer',display:'inline-block'}).addClass('unselectable');
  el.on('click',function(){var t=1-el.attr('boOn');   el.setStat(t);});
  return el;
}

var toggleButtonExtend=function(el){
  el.setStat=function(bo1){
    if(bo1) {el.css(colOn);} else {el.css(colOff);} 
    //el.toggleClass('on',Boolean(bo1));
    el.attr({boOn:bo1});
  }
  var colOn={background:'#4f4'}, colOff={background:''};
    
  el.attr({boOn:0});
  el.css({height:'1em',width:'1em'});
  el.on('click',function(){var t=1-el.attr('boOn');   el.setStat(t);});
  return el;
}



var divMessageTextCreate=function(){
  var spanInner=createElement('span');
  var imgBusyLoc=imgBusy.cloneNode().css({transform:'scale(0.65)','margin-left':'0.4em'}).hide();
  var el=createElement('div').myAppend(spanInner, imgBusyLoc);
  el.resetMess=function(time){
    clearTimeout(messTimer);
    if(time) { messTimer=setTimeout(resetMess, time*1000); return; }
    spanInner.myText(' ');
    imgBusyLoc.hide();
  }
  el.setMess=function(str='',time,boRot){
    spanInner.myText(str);
    clearTimeout(messTimer);
    if(time)     messTimer=setTimeout(resetMess, time*1000);
    imgBusyLoc.toggle(Boolean(boRot));
  };
  el.setHtml=function(str='',time,boRot){
    spanInner.myHtml(str);
    clearTimeout(messTimer);
    if(time)     messTimer=setTimeout(resetMess, time*1000);
    imgBusyLoc.toggle(Boolean(boRot));
  };
  var messTimer;
  el.addClass('message');
  return el;
}

  //
  // History stuff
  //

app.histGoTo=function(view){}
app.historyBack=function(){  history.back();}
app.doHistPush=function(obj){
  var stateT=history.state
  var {strView}=obj;
  var scroll=(strView==stateT.strView)?stateT.scroll:0;
  
  var indNew=stateT.ind+1;
  stateMem={hash:stateT.hash, ind:indNew, strView, scroll};
  history.pushState(stateMem, strHistTitle, uCanonical);
  history.StateOpen=history.StateOpen.slice(0, indNew);
  history.StateOpen[indNew]=obj;
}
app.doHistReplace=function(obj, indDiff=0){
  if(indDiff==0){
    copySome(stateMem, obj, ['strView']);
    history.pushState(stateMem, strHistTitle, uCanonical);
  }
  history.StateOpen[history.state.ind+indDiff]=obj;
}
app.changeHist=function(obj){
  doHistReplace(obj, 0)
}
app.getHistStatName=function(){
  return history.StateOpen[history.state.ind].strView;
}
history.distToGoal=function(strViewGoal){
  var ind=history.state.ind;
  var indGoal;
  for(var i=ind; i>=0; i--){
    var obj=history.StateOpen[i];
    var strView; if(typeof obj=='object') strView=obj.strView; else continue;
    if(strView===strViewGoal) {indGoal=i; break;}
  }
  var dist; if(typeof indGoal!='undefined') dist=indGoal-ind;
  return dist;
}
history.fastBack=function(strViewGoal, boRefreshHash){
  var dist=history.distToGoal(strViewGoal);
  if(dist) {
    if(typeof boRefreshHash!='undefined') history.boResetHashCurrent=boRefreshHash;
    history.go(dist);
  }
}
// doHistPush\(\{view:([a-zA-Z]+)\}\)
//   doHistPush({strView:'$1'})



/*******************************************************************************************************************
 * top-line-div
 *******************************************************************************************************************/
var divLoginInfoExtend=function(el){
  el.setStat=function(){
    var boIn=Boolean(Object.keys(userInfoFrDB).length);
    if(boIn){
      spanName.myText(userInfoFrDB.name);
      //el.show();
    }else {
      //el.hide(); 
    }
    //el.visible();
    el.visibilityToggle(boIn);
  }
  el.cb=null;
  var spanName=createElement('span'); 
  var logoutButt=createElement('button').myText(langHtml.divLoginInfo.logoutButt).css({'margin-left':'auto'}); //.css({'float':'right','font-size':'90%'});
  logoutButt.on('click',function(e){
    e.preventDefault();
    //userInfoFrDB={}; 
    userAppList.boStale=1;  devAppList.boStale=1;
    var vec=[['logout',{}, el.cb]];
    majax(vec);
    return false;
  });
  el.myAppend(spanName,logoutButt).css({display:'flex', 'justify-content':'space-between', 'align-items':'center', 'font-size':'12px'});
  return el;
}





/*******************************************************************************************************************
 *******************************************************************************************************************
 *
 * Main div
 *
 *******************************************************************************************************************
 *******************************************************************************************************************/

var mainDivExtend=function(el){
  el.toString=function(){return 'mainDiv';}
  el.setUp=function(){
    var boIn=Boolean(Object.keys(userInfoFrDB).length);
    loggedOutDiv.toggle(!boIn);
    loggedInDiv.toggle(boIn);
  }

  var cssCol={display:'inline-block','text-align':'center',padding:'1em',flex:1}; //width:'50%',


    //
    // loggedOutDiv
    //

  var buttonSignIn=createElement('button').addClass('highStyle').myText('Sign in').on('click',function(){
    doHistPush({strView:'loginSelectorDiv'});
    loginSelectorDiv.setVis();
  });
  var buttonCreateAccount=createElement('button').addClass('highStyle').myText('Create an account').on('click',function(){
    doHistPush({strView:'createUserSelectorDiv'});
    createUserSelectorDiv.setVis();
  });
  var signInDiv=createElement('div').css(cssCol).myAppend(buttonSignIn);
  var createAccountDiv=createElement('div').css(cssCol).css({'border-left':'2px solid grey','vertical-align':'top'}).myAppend(buttonCreateAccount);

  var divWhatIsOpen=createElement('div');
  var imgIdPlaceCompare=createElement('img').css({width:'100%', 'max-width':'calc(var(--maxWidth)*0.8)', display:'block', margin:'1em auto'}).prop({src:uIdPlaceCompare, alt:"IdP comparission"});  
  var aMoreInfo=createElement('a').css({display:'block', margin:'3em auto', 'text-align':'center'}).prop({href:"http://emagnusandersson.com/idPlace"}).myText("More info");
  var headComparing=createElement('h2').myText("Comparing some common ID providers:").css({'text-align':'center'});

  var divRowA=createElement('div').myAppend(signInDiv,createAccountDiv).css({display: 'flex', 'justify-content':'space-around'});
  var loggedOutDiv=createElement('div').css({'margin-top':'1em'}).myAppend(divRowA, headComparing, imgIdPlaceCompare); //, aMoreInfo

    //
    // loggedInDiv
    //

  var boShowDevStuff=getItem('boShowDevStuff');  if(boShowDevStuff===null)  boShowDevStuff=false;
  el.devStuffToggleEventF=function(){
    var now=Date.now(); if(now>timeSpecialR+1000*10) {timeSpecialR=now; nSpecialReq=0;}    nSpecialReq++;
    if(nSpecialReq==3) { nSpecialReq=0;boShowDevStuff=!boShowDevStuff; divDev.toggle(boShowDevStuff);  setItem('boShowDevStuff',boShowDevStuff);  }
  }
  var timeSpecialR=0, nSpecialReq=0;


  var buttonUserSetting=createElement('button').addClass('highStyle').myText('Settings').on('click',function(){ //.css({display: 'block'})
    doHistPush({strView:'userSettingDiv'});
    userSettingDiv.setVis();
    el.devStuffToggleEventF();
  });
  var buttonUserAppList=createElement('button').addClass('highStyle').myText('Apps I use').on('click',function(){ //.css({display: 'block'})
    doHistPush({strView:'userAppList'});
    userAppList.setVis();
  });
  var buttonDevAppList=createElement('button').addClass('highStyle').myText('Apps I own').on('click',function(){ // .css({display: 'block'})
    doHistPush({strView:'devAppList'});
    devAppList.setVis();
  });
  var divA=createElement('div').myAppend(buttonUserSetting), divB=createElement('div').myAppend(buttonUserAppList),  divDev=createElement('div').myAppend(buttonDevAppList); 

  var DivAll=[divA, divB, divDev]; DivAll.forEach(ele=>ele.css(cssCol));
  [divB, divDev].forEach(ele=>ele.css({'border-left':'2px solid grey'}));

  var divRowB=createElement('div').myAppend(...DivAll).css({display: 'flex', 'justify-content':'space-around'});

  var loggedInDiv=createElement('div').css({'margin-top':'1em'}).myAppend(divRowB);
  divDev.toggle(boShowDevStuff);
  //if(boShowDevStuff) divDev.show(); else   divDev.hide();


  var infoLink=createElement('a').prop({href:"http://emagnusandersson.com/idPlace"}).myText("More info");
  var menuA=createElement('div').myAppend(infoLink).css({padding:'0 0.3em 0 0', overflow:'hidden', 'max-width':maxWidth, 'text-align':'center', margin:'.3em auto .4em'}); 

  //el.divCont.myAppend(loggedOutDiv, loggedInDiv);

  el.divCont=createElement('div').css({padding:'0 0.3em 0 0', overflow:'hidden', 'max-width':maxWidth, 'text-align':'left', margin:'1em auto 0'}).myAppend(loggedOutDiv, loggedInDiv);
  el.fixedDiv=createElement('div').myAppend(menuA).css(cssFixed);

  el.append(el.divCont, el.fixedDiv);
  return el;
}

/*******************************************************************************************************************
 *******************************************************************************************************************
 *
 * Authentication stuff
 *
 *******************************************************************************************************************
 *******************************************************************************************************************/

app.objToQueryArr=function(o){
  var K=Object.keys(o), V=Object.values(o), l=K.length, arr=Array(l);
  for(var i=0; i<l; i++){ arr[i]=K[i]+'='+V[i]; }
  return arr;
}

var createUPop=function(IP, uRedir, nonce, boReauthenticate=false){
  var arrQ=["client_id="+site.client_id[IP], "redirect_uri="+encodeURIComponent(uRedir), "state="+nonce, "response_type="+response_type];
  if(IP=='fb')   arrQ.push("scope=email"); //, "display=popup"
  else if(IP=='google')    arrQ.push("scope=profile,email");
  else if(IP=='idplace')    arrQ.push("scope=name,image,email");
  if(boReauthenticate) arrQ.push("auth_type=reauthenticate");
  return UrlOAuth[IP]+'?'+arrQ.join('&');
}
var getOAuthCode=async function(boReauthenticate=false){
  var strQS, nonce=randomHash(), uPop=createUPop(strIPPrim, uSite+'/'+leafLoginBack, nonce, boReauthenticate);
  //if('wwwLoginScope' in site) document.domain = site.wwwLoginScope;  // Commented out because document.domain is discouraged

  var strBroadcastChannel='broadcastChannel_'+randomHash();
  var objCookie={strBroadcastChannel:encodeURIComponent(strBroadcastChannel), 'max-age':300, SameSite:'Strict', Secure:'True'}
  var {hostname}=new URL(uSite);
  // if(/^192\.168\.0\.[0-9]$/.test(hostname)) objCookie.domain=hostname;  // To make it work when debugging
  // else {
  //   var ind=hostname.indexOf('.');  if(ind!=-1) objCookie.domain=hostname.substr(ind+1);  
  // }
  var strCookie=objToQueryArr(objCookie).join(';');
  document.cookie=strCookie

  extend(sessionStorage, {strBroadcastChannel});

  window.open(uPop); //, '_blank', 'popup', 'width=580,height=400'  , '_blank', 'width=580,height=400'
  // var strQS=await new Promise(resolve=>{
  //   window.loginReturn=function(strQST){ resolve(strQST); }
  // });

  var broadcastChannel=new BroadcastChannel(strBroadcastChannel);
  var strQS=await new Promise(resolve=>{
    broadcastChannel.on('message', function(e){
      resolve(e.data)
    })
  });
  broadcastChannel.close()
  var strParams=response_type=='code'?strQS:strHash;
  
  var params=parseQS(strParams.substring(1));
  if(!('state' in params) || params.state !== nonce) {   return ['Invalid state parameter: '+params.state]; } 
  if('error' in params) { return [params.error]; }
  if(!('code' in params)) { return ['No "code" parameter in response from IdP']; }
  return [null, params.code];
}


  // Used in loginSelectorDiv and createUserSelectorDiv
var idPLoginDivExtend=function(el){
  var strButtonSize='2em';
  var imgFb=createElement('img').prop({src:uFb, alt:"fb"}).on('click',async function(){
      var [err, code]=await getOAuthCode(); if(err) {setMess(err); return;}
      var timeZone=new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)[1];
      var oT={IP:strIPPrim, fun:'userFun', caller:'index', code, timeZone};
      await new Promise(resolve=>{var vec=[['loginGetGraph', oT], ['setupById',{idApp}, function(){ resolve(); }]];   majax(vec);  });
      
      if(el.cb) el.cb();
  });
  var imgGoogle=createElement('img').prop({src:uGoogle, alt:"google"}).on('click',function(){
    popupWin('google');
  });
  el.cb=null;
  var Im=[imgFb]; Im.forEach(ele=>ele.css({align:'center', display:'block', 'margin-top': '0.7em'})); //  , imgGoogle    position:'relative',top:'0.4em',heigth:strButtonSize,width:strButtonSize
  el.append(...Im); //,fbHelp , mess
  return el;
}

var formLoginExtend=function(el){  
  var login=function(e){
    e.preventDefault();
    //var hashPW=SHA1(formLogin.inpPass.value+strSalt);
    var hashPW=formLogin.inpPass.value+strSalt; for(var i=0;i<nHash;i++) hashPW=SHA1(hashPW);
    var vec=[['loginWEmail',{email:formLogin.inpEmail.value, password:hashPW}], ['setupById',{idApp}, el.cb]];   majax(vec); 
    formLogin.inpPass.value='';
    return false;
  }
  el.cb=null;
  el.labEmail=el.querySelector("label[name='email']"); el.inpEmail=el.querySelector("input[name='email']").css({'max-width':'100%'});
  el.labPass=el.querySelector("label[name='password']"); el.inpPass=el.querySelector("input[name='password']").css({'max-width':'100%'});
  el.buttLogin=el.querySelector("button[name='submit']").css({"margin-top": "1em"}).on('click',login);

  [...el.querySelectorAll('input[type=text],[type=email],[type=number],[type=password]')].forEach(ele=>ele.css({display:'block'}).on('keypress', function(e){ if(e.which==13) { login(e); }} ) );
  return el;
}


var loginSelectorDivExtend=function(el){
  el.toString=function(){return 'loginSelectorDiv';}
  el.myToggle=function(boOn){
    if(boOn) el.show();else el.hide(); if(boOn) formLogin.inpPass.focus();
  }
  var forgotClickF=function(e){ 
    e.preventDefault();
    forgottPWPop.openFunc();
  }
  //el.setUp=function(){ messDiv.insertAfter(formLogin); divRight.append(idPLoginDiv);  }
  el.setUp=function(){ formLogin.insertAdjacentElement('afterEnd', messDiv); divRight.append(idPLoginDiv);  }
  var h1=createElement('h1').myText('Sign in');
  var cssCol={display:'inline-block',padding:'1em',flex:1}; //width:'50%',

  var messDiv=createElement('div').css({color:'red'});
  var buttForgot=createElement('a').prop({href:''}).myText('Forgot your password?').on('click',forgotClickF);
  var divForgot=createElement('div').css({'margin-top':'1em'}).myAppend(buttForgot);
 
  var divLeft=createElement('div').css(cssCol).myAppend(messDiv,    formLogin,     divForgot); formLogin.show();
  var divRight=createElement('div').css(cssCol).css({'text-align':'center', 'border-left':'2px solid grey'});
  var divRow=createElement('div').myAppend(divLeft, divRight).css({display: 'flex', 'justify-content':'space-around'});
  var divCont=createElement('div').myAppend(h1, divRow);
  el.append(divCont);

  return el;
}


var devAppSecretDivExtend=function(el){
  el.toString=function(){return 'devAppSecretDiv';}
  var ret=function(data){
    spanSecret.myText(data.secret); inpPass.value=''
  }
  el.openFunc=function(){
    var elR=this.parentNode.parentNode; idApp=elR.r.idApp;
    spanSecret.myText('');
    doHistPush({strView:'devAppSecretDiv'});
    el.setVis();
    inpPass.focus()
  }
  var send=function(){
    //var hashPW=SHA1(inpPass.value+strSalt);
    var hashPW=inpPass.value+strSalt; for(var i=0;i<nHash;i++) hashPW=SHA1(hashPW);
    var vec=[['devAppSecret',{idApp, password:hashPW},ret]];   majax(vec);
    
  }
  el.setVis=function(){
    el.show(); return 1;
  }
  var idApp;
 
    // Authenticate with password
  var inpPass=createElement('input').prop('type','password').on('keypress', function(e){ if(e.which==13) { send();   }} );
  var buttSend=createElement('button').myText('Send').css({"margin-top": "1em"}).on('click',send);


    // Authenticate with IdP
  var strButtonSize='2em';
  var imgFb=createElement('img').prop({src:uFb, alt:"fb"}).on('click',async function(){
      var [err, code]=await getOAuthCode(true); if(err) {setMess(err); return;}
      //var oT={IP:strIPPrim, fun:'getSecretFun', caller:'index', code, idApp};
      var timeZone=new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)[1];
      var oT={IP:strIPPrim, fun:'getSecretFun', caller:'index', code, idApp, timeZone};
      var result;
      await new Promise(resolve=>{var vec=[['loginGetGraph', oT, function(resultT){ result=resultT; resolve(); }]];   majax(vec);   });
      spanSecret.append(result.resultOfFun.secret);
  });
  var Im=[imgFb]; Im.forEach(ele=>ele.css({align:'center', display:'block', 'margin-top': '0.7em'})); 


 
  var head=createElement('h3').myText('Reauthenticate to see secret');
  var hSecret=createElement('span').css({margin:'0 .5em 0 0','font-weight': 'bold'}).myText('Secret: ');
  
  
  var cssCol={display:'inline-block',padding:'1em',flex:1}; //width:'50%',
  var divLeft=createElement('div').css(cssCol).myText('Password: ').myAppend(inpPass, buttSend);
  var divRight=createElement('div').css(cssCol).css({'text-align':'center', 'border-left':'2px solid grey'}).myAppend(...Im);
  var divRow=createElement('div').myAppend(divLeft, divRight).css({display: 'flex', 'justify-content':'space-around'});
  
  var spanSecret=createElement('span');//.css({'font-weight': 'bold'});
  var p=createElement('div').myAppend(hSecret, spanSecret).css({margin:'0.5em 0',border:'solid 1px',background:'yellow'});
  var cancel=createElement('button').addClass('highStyle').myText('Back').on('click',historyBack).css({display:'block', margin:'1em 0em'});

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center").myAppend(head, divRow, p,cancel).css({'min-width':'17em','max-width':'25em', padding:'0.1em'}); // height:'19em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); 
  return el;
}


var createUserSelectorDivExtend=function(el){
  el.toString=function(){return 'createUserSelectorDiv';}
  el.setUp=function(){ divRight.append(idPLoginDiv);   }
  var cssCol={display:'inline-block',padding:'1em',flex:1}; //width:'50%',
  var buttonCreateAccount=createElement('button').addClass('highStyle').myText('Create an account').on('click',function(){
    doHistPush({strView:'createUserDiv'});
    createUserDiv.setVis();
  });
  
  var h1=createElement('h1').myText('Create account');
  var headUN=createElement('h2').myText('Using password');
  var headFB=createElement('h2').myText('Using Facebook');

  var divLeft=createElement('div').myAppend(headUN, buttonCreateAccount);
  var divRight=createElement('div').myAppend(headFB);
  divLeft.css(cssCol); divRight.css(cssCol).css({'border-left':'2px solid grey'}); //'text-align':'center', 
  var divRow=createElement('div').myAppend(divLeft, divRight).css({display: 'flex', 'justify-content':'space-around'});
  el.divCont=createElement('div').css({padding:'0 0.3em 0 0', overflow:'hidden', 'max-width':maxWidth, 'text-align':'left', margin:'1em auto 0'}).myAppend(h1, divRow);
  el.append(el.divCont);

  return el;
}

var divDisclaimerExtend=function(el){
  el.setUp=function(boFrMem){
    var boShowDisclaimer;
    if(typeof boFrMem=='undefined') { boShowDisclaimer=butTog.myText()=='Show';}
    else { boShowDisclaimer=getItem('boShowDisclaimer'); if(boShowDisclaimer===null) boShowDisclaimer=true; }

    setItem('boShowDisclaimer',boShowDisclaimer);
    var strTxt=boShowDisclaimer?langHtml.disclaimer:'';
    divText.myHtml(strTxt);
    butTog.myText(boShowDisclaimer?'Hide':'Show');
  }
  var spanLable=createElement('span').myText(langHtml.disclaimerHead).css({'font-weight':'bold','margin':'0.5em 0 0.5em'});
  var butTog=createElement('button').css({'float':'right','font-size':'60%'}).on('click',function(){el.setUp();});
  var divTop=createElement('div').myAppend(spanLable, butTog), divText=createElement('div');
  el.append(divTop, divText);
  el.setUp(1);
  return el;
}

var createUserDivExtend=function(el){
  el.toString=function(){return 'createUserDiv';}
  var save=function(){ 
    resetMess();  
    if(inpPass.value.trim()!==inpPassB.value.trim()) { var tmp='Password-fields are not equal'; setMess(tmp); return; }
    var lTmp=boDbg?2:6; if(inpPass.value.trim().length<lTmp) { var tmp='The password must be at least '+lTmp+' characters long'; setMess(tmp); return; }

    var o={},boErr=0;
  /*  Inp.forEach(function(inp){
      var strName=inp.attr('name');
      var tmp=Prop[strName].saveInp(inp); if(tmp===false) boErr=1; else o[strName]=tmp; 
    }); 
    if(boErr) return;
*/
    for(var i=0;i<Inp.length;i++){
      var inp=Inp[i],  strName=inp.attr('name');
      //var tmp=Prop[strName].saveInp(inp); if(tmp===false) return; else o[strName]=tmp; 
      var tmp=Prop[strName].saveInp(inp); if(tmp[0]) {setMess(tmp[0]); return; } else o[strName]=tmp[1];
    };
    var strTmp=grecaptcha.getResponse(); if(!strTmp) {setMess("Captcha response is empty"); return; }
    var hashPW=inpPass.value.trim()+strSalt; for(var i=0;i<nHash;i++) hashPW=SHA1(hashPW);
    extend(o, {password:hashPW,  'g-recaptcha-response': strTmp});

    var vec=[['createUser',o], ['setupById',{idApp}, el.cb]];   majax(vec); 
    inpPass.value=''; inpPassB.value='';
    setMess('',null,true); 
  }

  el.createInputs=function(){
    for(var i=0;i<el.StrProp.length;i++){
      var strName=el.StrProp[i];
      var imgH=''; if(strName in helpBub ) {    var imgH=imgHelp.cloneNode(1);   popupHover(imgH,helpBub[strName]);         }

      var lab=createElement('label').myText(calcLabel(langHtml.label, strName));
      var inp=Prop[strName].crInp().attr('name',strName);
      Inp.push(inp);
      var strObli=Prop[strName].boObli?' *':'';
      divCont.append(lab, imgH, inp); //, strObli
      if(inp.type=='number') inp.min=0;
    }
    //divCont.find('input[type=text],[type=email],[type=number]').on('keypress', function(e){ if(e.which==13) {save();return false;}} );
    //var tmp=Inp.filter('input[type=number]');  tmp.prop({min:0});
    Inp.forEach(ele=>ele.css({display:'block', 'margin-bottom':'0.5em'}));
    divCont.append(divReCaptcha);
  }
  el.setUp=function(){
    //if(divReCaptcha.hasChildNodes()){
      //grecaptcha.render(divReCaptcha, {sitekey:strReCaptchaSiteKey});
    //}
    divReCaptcha.setUp();
    return true;
  }
  //el.setUp=function(){
    //Inp.forEach(function(inp){
      //var strName=inp.attr('name'); Prop[strName].setInp(inp);
    //});
    //return true; 
  //}
  el.cb=null;

  var Inp=[];
  el.StrProp=['name', 'email', 'telephone',   'country', 'federatedState', 'county', 'city', 'zip', 'address', 'idNational', 'birthdate', 'motherTongue', 'gender'];

  var divCont=el.divCont=createElement('div').css({padding:'0 0.3em 0 0', overflow:'hidden', 'max-width':maxWidth, 'text-align':'left', margin:'1em auto 0'});
  
  //var divReCaptcha=createElement('div');
  var divReCaptcha=divReCaptchaExtend(createElement('div'));
  
  var h1=createElement('h1').myText('Create account');  
  el.divDisclaimerW=createElement('div').css({'margin':'0em', 'padding':'0em'});
  var messDiv=createElement('div').css({color:'red'});
  var obliDiv=createElement('div').myText('* = obligatory');
  var labPass=createElement('label').myText('Password'),  labPassB=createElement('label').myText('Password again');  
  var inpPass=createElement('input').prop({type:'password', placeholder:"at least 6 characters"}),  inpPassB=createElement('input').prop({type:'password'});
  [inpPass, inpPassB].forEach(ele=>ele.css({display:'block', 'margin-bottom':'0.5em'}));

  divCont.append(h1, el.divDisclaimerW, messDiv,   labPass, inpPass, labPassB, inpPassB);  //, obliDiv
  el.createInputs();

  var spanLabel=createElement('span').myText(langHtml.CreateAccount).css({'float':'right',margin:'0.2em 0 0 0'}); 
  var buttonSave=createElement('button').addClass('highStyle').myText(langHtml.Create).on('click',save);
  var menuA=createElement('div').myAppend(buttonSave,spanLabel).css({padding:'0 0.3em 0 0', overflow:'hidden', 'max-width':maxWidth, 'text-align':'left', margin:'.3em auto .4em'}); 

  el.fixedDiv=createElement('div').myAppend(menuA).css(cssFixed);
  el.append(el.divCont, el.fixedDiv);
  return el;
}

var divReCaptchaExtend=function(el){
  el.setUp=function(){
    //if(typeof grecaptcha=='undefined') var grecaptcha={render:function(){console.log('no grecaptcha');}};
    if(typeof grecaptcha=='undefined' || !('render' in grecaptcha)) {console.log('no grecaptcha'); return; }
    if(el.children.length==0){    grecaptcha.render(el, {sitekey:strReCaptchaSiteKey});    } else grecaptcha.reset();
  }
  el.addClass("g-recaptcha");
  //el.prop({"data-sitekey": strReCaptchaSiteKey});
  return el;
}

var deleteAccountPopExtend=function(el){
  el.toString=function(){return 'deleteAccountPop';}
  //var el=popUpExtend(el);
  var yes=createElement('button').addClass('highStyle').myText(langHtml.Yes).on('click',function(){
    //var vec=[['VDelete',{},function(data){historyBack();historyBack();}]];   majax(vec);
    userInfoFrDB={};
    var vec=[['UDelete',{}, function(data){
      history.fastBack('mainDiv',true);
    }]];   majax(vec);
  });
  var cancel=createElement('button').addClass('highStyle').myText(langHtml.Cancel).on('click',historyBack);
  //el.myAppendHtml(langHtml.deleteBox.regret,'<br>',yes,cancel);
  //el.css({padding:'1.1em',border:'1px solid'});
  el.setVis=function(){
    el.show();   
    return true;
  }

  var h1=createElement('div').myText(langHtml.deleteBox.regret).css({'margin-bottom':'1em'});
  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').myAppend(h1,cancel,yes);
  centerDiv.addClass("Center").css({padding:'1.1em'}); // 'width':'20em', height:'9em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); //

  return el;
}

var changePWPopExtend=function(el){
  el.toString=function(){return 'changePWPop';}
  var save=function(){ 
    resetMess();
    messDiv.myText('');
    if(inpPass.value.trim()!==inpPassB.value.trim()) { setMess('The new password fields are not equal'); return; }
    var lTmp=boDbg?2:6; if(inpPass.value.trim().length<lTmp) { setMess('The password must be at least '+lTmp+' characters long'); return; }

    var hashPWO=inpPassOld.value.trim()+strSalt; for(var i=0;i<nHash;i++) hashPWO=SHA1(hashPWO);
    var hashPWN=inpPass.value.trim()+strSalt; for(var i=0;i<nHash;i++) hashPWN=SHA1(hashPWN);
    var o={passwordOld:hashPWO, passwordNew:hashPWN};

    var vec=[['changePW',o,changePWRet]];   majax(vec); 
    setMess('',null,true); 
  }

  el.openFunc=function(){
    doHistPush({strView:'changePWPop'});
    el.setVis();
    inpPassOld.value=''; inpPass.value=''; inpPassB.value='';
  }
  el.setVis=function(){
    el.show();   
    return true;
  }
  var changePWRet=function(data){
    if(data.boOK) { inpPassOld.value=''; inpPass.value=''; inpPassB.value='';  historyBack(); }
  }

  var h1=createElement('h3').myText('Change your password');
  var blanket=createElement('div').addClass("blanket");
  var messDiv=createElement('div').css({color:'red'});
  var labPassOld=createElement('label').myText('Old password'), labPass=createElement('label').myText('New password'),  labPassB=createElement('label').myText('New password again');  
  var inpPassOld=createElement('input').prop({type:'password'}), inpPass=createElement('input').prop({type:'password', placeholder:"at least 6 characters"}),  inpPassB=createElement('input').prop({type:'password'});

  [inpPassOld, inpPass, inpPassB].forEach(ele=>ele.css({display:'block', 'margin-bottom':'0.5em'}).on('keypress', function(e){ if(e.which==13) {okF();return false;}} )   );

  var ok=createElement('button').myText(langHtml.OK).addClass('highStyle').on('click',save);
  var cancel=createElement('button').myText(langHtml.Cancel).addClass('highStyle').on('click',historyBack);
  var divBottom=createElement('div').myAppend(cancel,ok);  //buttonCancel,

  var centerDiv=createElement('div').myAppend(h1, messDiv,   labPassOld, inpPassOld, labPass, inpPass, labPassB, inpPassB, divBottom);
  centerDiv.addClass("Center").css({padding:'1.1em'}); // 'width':'20em', height:'21em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); //

  return el;
}
var verifyEmailPopExtend=function(el){
  el.toString=function(){return 'verifyEmailPop';}
  var okF=function(){
    var vec=[['verifyEmail',{}, okRet]];   majax(vec); 
    //var vec=[['verifyEmail',{email:userInfoFrDB.email}, okRet]];   majax(vec);
    
  };
  el.openFunc=function(){
    doHistPush({strView:'verifyEmailPop'});
    spanEmail.myText(userInfoFrDB.email);
    el.setVis();
  }
  el.setVis=function(){
    el.show();   
    return true;
  }
  var okRet=function(data){
    if(data.boOK) {  historyBack(); }
  }

  var h1=createElement('h3').myText('Verify emailaddress');
  var spanEmail=createElement('span').css({'font-weight': 'bold'});
  var pTxt=createElement('p').myText('Send a verification email to ').myAppend(spanEmail);
  var pBottom=createElement('p').myText('Note! The verification code sent will only be valid for 10 minutes.');
  var blanket=createElement('div').addClass("blanket");

  var ok=createElement('button').myText(langHtml.OK).addClass('highStyle').on('click',okF);
  //var cancel=createElement('button').myText(langHtml.Cancel).on('click',historyBack);
  var divBottom=createElement('div').myAppend(ok);  //cancel,

  var centerDiv=createElement('div').myAppend(h1, pTxt, pBottom, divBottom);
  centerDiv.addClass("Center").css({padding:'1.1em'});  // 'width':'20em', height:'15em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); //

  return el;
}

var forgottPWPopExtend=function(el){
  el.toString=function(){return 'forgottPWPop';}
  var okF=function(){
    var vec=[['verifyPWReset',{email:inpEmail.value.trim()}, okRet]];   majax(vec);
    
  };
  el.openFunc=function(){
    doHistPush({strView:'forgottPWPop'});
    el.setVis();
    inpEmail.value='';
  }
  el.setVis=function(){
    el.show();   
    return true;
  }
  var okRet=function(data){
    if(data.boOK) { inpEmail.value='';  historyBack(); }
  }

  var h1=createElement('h3').myText('Forgott your password?');
  var blanket=createElement('div').addClass("blanket");
  var labEmail=createElement('label').myText('Email');  
  var inpEmail=createElement('input').prop({type:'email'}).on('keypress', function(e){ if(e.which==13) {okF();return false;}} );
  inpEmail.css({display:'block', 'margin-bottom':'0.5em'});

  var ok=createElement('button').myText(langHtml.OK).addClass('highStyle').on('click',okF);
  var cancel=createElement('button').myText(langHtml.Cancel).addClass('highStyle').on('click',historyBack);
  var divBottom=createElement('div').myAppend(cancel,ok);  //buttonCancel,

  var centerDiv=createElement('div').myAppend(h1, labEmail, inpEmail, divBottom);
  centerDiv.addClass("Center").css({padding:'1.1em'}); // 'width':'20em', height:'13em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); //

  return el;
}
var consentDivExtend=function(el){
  el.toString=function(){return 'consentDiv';}

  el.setUp=function(){
    spanApp.myText(objApp.name);
    var StrPerm=scopeAsked?scopeAsked.split(','):[];
    var Li=[];
    for(var i=0;i<StrPerm.length;i++){
      var li=createElement('li').myText(StrPerm[i]);
      Li.push(li);
    }
    listPerm.empty().myAppend(...Li);
    var boGotOldScope=Boolean(objUApp);  pOldPerm.toggle(boGotOldScope); if(boGotOldScope) spanPermOld.myText(objUApp.scope);
  }

  var spanApp=createElement('b');
  var listPerm=createElement('ul');
  var spanPermOld=createElement('b');
  var pA=createElement('p').myAppend('The app: ', spanApp, ", would like to be able to read these data: ", listPerm);
  var pOldPerm=createElement('p').myAppend('(Old permission: ', spanPermOld, ')');
  var pB=createElement('p').myText('(You can withdraw this right later.)').css({'font-size':'85%'});
  var buttCancel=createElement('button').addClass('highStyle').myText('Cancel').on('click',function(){
    el.cb(false);
  });
  var buttAllow=createElement('button').addClass('highStyle').myText('Allow').on('click',function(){
    //var vec=[['userAppSet',{scope:scopeAsked, idApp, maxUnactivityToken}], ['setupById',{idApp},el.cb]];   majax(vec);
    var maxUnactivityToken=objQS.response_type=='code'?60*24*3600:2*3600;
    var vec=[['setConsent',{scope:scopeAsked, idApp, maxUnactivityToken}], ['setupById',{idApp},function(data){el.cb(true);}]];   majax(vec); 
  });
  el.append(pA, pOldPerm, pB, buttCancel, buttAllow);

  return el;
}




var uploadImageDivExtend=function(el){
  el.toString=function(){return 'uploadImageDiv';}
  //var progressHandlingFunction=function(e){      if(e.lengthComputable){   progress.attr({value:e.loaded,max:e.total});      }      }

  var setMess=function(str) {divMess.myText(str);}
  var clearMess=function() {divMess.myText('');}
  var toggleVerified=function(boT){  boT=Boolean(boT);   uploadButton.prop("disabled",!boT); }
  var verifyFun=async function(){  
    clearMess();
    var arrFile=this.files;
    if(arrFile.length>1) {setMess('Max 1 file',5); toggleVerified(0); return;}
    if(arrFile.length==0) {setMess('No file selected',5); toggleVerified(0); return;}
    objFile=arrFile[0];
    if(objFile.size==0){ setMess("objFile.size==0",5); toggleVerified(0); return; }
    var tmpMB=(objFile.size/(1024*1024)).toFixed(2);


    var [err,blob]=await reduceImageSize(objFile, 200, 50, 50, 0.9); if(err){setMess(err); toggleVerified(0); return;}
    //el.image.src=URL.createObjectURL(blob);
    var base64Img=el.base64Img=await blobToBase64(blob);
    


    toggleVerified(1);
  }
  var sendFun=function(){
    clearMess();
    // if(boFormDataOK==0) {alert("This browser doesn't support FormData"); return; };
    // var formData = new FormData();
    // formData.append("type", 'single');
    // formData.append("kind", strKind);
    // formData.append("fileToUpload[]", objFile);
     
    // //var vecIn=[['uploadImage'], ['CSRFCode',CSRFCode]];
    // var vecIn=[['uploadImage'], ['CSRFCode',getItem('CSRFCode')]];
    // var arrRet=[sendFunRet];
    // formData.append('vec', JSON.stringify(vecIn));
    // var xhr = new XMLHttpRequest();
    // xhr.open('POST', uBE, true);
    // var dataOut=formData;
    // xhr.setRequestHeader('x-type','single');
    
    // progress.visible(); //progress.visible();
    // xhr.onprogress=progressHandlingFunction;
    // xhr.onload=function() {
    //   var dataFetched=this.response;
    //   //var data; try{ data=JSON.parse(this.response); }catch(e){ setMess(e);  return; }
    //   var data=deserialize(this.response);  
    //   var dataArr=data.dataArr||[];  // Each argument of dataArr is an array, either [argument] or [altFuncArg,altFunc]
    //   delete data.dataArr;
    //   beRet(data);
    //   for(var i=0;i<dataArr.length;i++){
    //     var r=dataArr[i];
    //     //if(r.length) { if('strMessage' in r[0]) setMess(r[0].strMessage);   }
    //     if(r.length==1) {var f=arrRet[i]; if(f) f(r[0]);} else { window[r[1]].call(window,r[0]);   }
    //   }
    //   progress.attr({value:0});  progress.invisible();  //sendFunRet();
    // }
    // xhr.onerror=function(e){ progress.invisible(); errorFunc.call(this,arguments); }
    
    // xhr.send(dataOut); 
    

    var vec=[['uploadImageB64', {kind:strKind, base64Img:el.base64Img}, uploadRet]];   majax(vec);
     

    busyLarge.show();    setMess('Uploading ...');
    uploadButton.prop("disabled",true);
  }
  var uploadRet=function(data){
    var {boOK, strMessage, imageHash}=data; setMess(strMessage);  uploadButton.prop("disabled",false);
    callback(data);
  }
  var sendFunRet=function(data){
    if('strMessage' in data) setMess(data.strMessage); progress.invisible(); uploadButton.prop("disabled",false);
    callback(data);
  }
  el.openFunc=function(strKindT, callbackT){
    strKind=strKindT; callback=callbackT; setMess('');  inpFile.value='';
    doHistPush({strView:'uploadImageDiv'});
    el.setVis();    
  };
  el.setVis=function(){
    el.show();   
    return true;
  }
  var strKind='u', callback;
  //el=popUpExtend(el);  
  //el.css({'max-width':'20em', padding: '0.3em 0.5em 1.2em 0.6em'});

  var head=createElement('h3').myText('Upload Image: ').css({'font-weight':'bold'});
  var formFile=createElement('form'); //enctype="multipart/form-data"
  var inpFile=createElement('input').prop({type:'file', name:'file', id:'file', accept:"image/*"}).css({background:'lightgrey'});
  //var inpUploadButton=createElement('input').prop({type:"button", value:"Upload"});
  var uploadButton=createElement('button').myText('Upload').addClass('highStyle').prop("disabled",true).css({'margin-right':'0.5em'}); //, 'float':'right'
  //var progress=createElement('progress').prop({max:100, value:0}).css({'display':'block','margin-top':'1em'}).invisible();
  var divMess=createElement('div').css({'margin-top':'1.2em', 'min-height':'1em'});
  
  var objFile;
  inpFile.on('change',verifyFun).on('click',function(){uploadButton.prop("disabled",true);});
  formFile.append(inpFile);   formFile.css({display:'inline'});
   

  var closeButton=createElement('button').myText('Close').addClass('highStyle').on('click',historyBack);
  var menuBottom=createElement('div').myAppend(closeButton, uploadButton).css({'margin-top':'1.2em'});

  //el.append(head, formFile, progress, divMess,menuBottom); 

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').myAppend(head, formFile, divMess,menuBottom);  //, progress
  centerDiv.addClass("Center").css({'max-width':'21em', padding: '0.3em 0.5em 1.2em 0.6em'}); // , height:'15em'
  el.addClass("Center-Container").myAppend(centerDiv,blanket); //

  uploadButton.on('click',sendFun);
  return el;
}


var userSettingDivExtend=function(el){
  el.toString=function(){return 'userSettingDiv';}
  var save=function(){ 
    resetMess();  
    var o={},boErr=0;
    Inp.forEach(function(inp){
      var strName=inp.attr('name');
      //var tmp=Prop[strName].saveInp(inp); if(tmp===false) boErr=1; else o[strName]=tmp; 
      var tmp=Prop[strName].saveInp(inp); if(tmp[0]) {setMess(tmp[0]); return; } else o[strName]=tmp[1];
    }); 
    if(boErr) return;
    var vec=[['UUpdate',o], ['setupById',{},el.setUp]];   majax(vec);
    setMess('',null,true); 
  }

  el.createInputs=function(){
    for(var i=0;i<el.StrProp.length;i++){      
      var strName=el.StrProp[i];
      var imgH=''; if(strName in helpBub ) {    var imgH=imgHelp.cloneNode(1);   popupHover(imgH,helpBub[strName]);         }

      var lab=createElement('label').myText(calcLabel(langHtml.label, strName));
      var spanLastChange=Prop[strName].crStatisticSpan().attr('name',strName);
      var inp=Prop[strName].crInp().attr('name',strName);
      SpanLastChange.push(spanLastChange);  Inp.push(inp);
      divCont.myAppend(lab,imgH,spanLastChange,inp);
      if(inp.type=='number') inp.min=0;
    }
    //divCont.find('input[type=text],[type=email],[type=number]').on('keypress', function(e){ if(e.which==13) {save();return false;}} );
    //var tmp=divCont.find('input[type=number]').prop({min:0});
    Inp.forEach(ele=>ele.css({display:'block', 'margin-bottom':'0.5em'}));

  }
  el.setUp=function(){
    SpanLastChange.forEach(function(spanLastChange){
      var strName=spanLastChange.attr('name'); Prop[strName].setStatisticSpan(spanLastChange);
    });  
    Inp.forEach(function(inp){
      var strName=inp.attr('name'); Prop[strName].setInp(inp);
    });
    var strT=getSuitableTimeUnitStr(unixNow()-userInfoFrDB.tCreated);
    divCreated.querySelector('b').myText(strT);
    return true; 
  }
  var Inp=[], SpanLastChange=[];

  el.StrProp=['name', 'password', 'image', 'email', 'boEmailVerified', 'telephone',   'country', 'federatedState', 'county', 'city', 'zip', 'address',     'idFB', 'idNational', 'birthdate', 'motherTongue', 'gender']; //'idFB', 'idGoogle', 

  var buttonDelete=createElement('button').myText('Delete account').addClass('highStyle').on('click',function(){ 
    doHistPush({strView:'deleteAccountPop'});
    deleteAccountPop.setVis();
  }).css({margin:'0.2em 0 0 0'});  //'float':'right',
  var divCreated=createElement('div').myAppendHtml('Account created <b></b> ago ', buttonDelete).css({'font-size':'90%', 'border-bottom':'2px solid grey', 'margin-bottom':'1em', 'padding-bottom':'0.5em'});
  el.divDisclaimerW=createElement('div').css({'margin':'0em', 'padding':'0em'});

  var divCont=el.divCont=createElement('div').myAppend(divCreated,el.divDisclaimerW).css({padding:'0 0.3em 0 0', overflow:'hidden', 'max-width':maxWidth, 'text-align':'left', margin:'1em auto 0'}); 
  el.createInputs();

  var spanLabel=createElement('span').myText(langHtml.Settings).css({'float':'right',margin:'0.2em 0 0 0'});
  var buttonSave=createElement('button').myText(langHtml.Save).addClass('highStyle').on('click',save);
  var menuA=createElement('div').myAppend(buttonSave, spanLabel).css({padding:'0 0.3em 0 0', overflow:'hidden', 'max-width':maxWidth, 'text-align':'left', margin:'.3em auto .4em'}); 

  el.fixedDiv=createElement('div').myAppend(menuA).css(cssFixed);
  el.append(el.divCont, el.fixedDiv);
  return el;
}


var headExtend=function(el, tableDiv, StrName, BoAscDefault, Label, strTR='tr', strTD='td'){  // tableDiv must have a property table, tbody and nRowVisible (int)
  el.setArrow=function(strName,dir){
    boAsc=dir==1;
    arrImgSort.forEach(function(ele){ele.prop({src:uUnsorted}) });
    var tmp=boAsc?uIncreasing:uDecreasing;
    el.querySelector(strTH+'[name='+strName+']').querySelector('img[data-type=sort]').prop({src:tmp});
  }
  el.clearArrow=function(){
    thSorted=null, boAsc=false;
    arrImgSort.forEach(function(ele){ele.prop({src:uUnsorted}) });
  }
  var thClick=function() {
    var ele=this, strName=ele.attr('name'), boAscDefault=ele.boAscDefault;
    boAsc=(thSorted===this)?!boAsc:boAscDefault;  thSorted=this;
    arrImgSort.forEach(function(ele){ele.prop({src:uUnsorted}) });
    var tmp=boAsc?uIncreasing:uDecreasing;  ele.querySelector('img[data-type=sort]').prop({src:tmp});
    var tBody=tableDiv.tBody;
    var arrT=[...tBody.querySelectorAll('tr')];
    var arrToSort=arrT.slice(0, tableDiv.nRowVisible);
    var iChild=ele.myIndex();
    var comparator=function(aT, bT){
      var a = aT.children[iChild].valSort,  b = bT.children[iChild].valSort,   dire=boAsc?1:-1; 
      var boAStr=0,boBStr=0;
      var aN=Number(a); if(!isNaN(aN) && a!=='') {a=aN;} else {a=a.toLowerCase(); boAStr=1;}
      var bN=Number(b); if(!isNaN(bN) && b!=='') {b=bN;} else {b=b.toLowerCase(); boBStr=1;}
      if(boAStr!=boBStr) return ((boAStr<boBStr)?-1:1)*dire;
      if(a==b) {return 0;} else return ((a<b)?-1:1)*dire;
    }
    var arrToSortN=msort.call(arrToSort,comparator);
    tBody.prepend.apply(tBody,arrToSortN);
  }

  var strTH=strTD=='td'?'th':strTD;
  var boAsc=false, thSorted=null;
  var len=StrName.length;
  var Th=Array(len), arrImgSort=Array(len);
  for(var i=0;i<len;i++){
    var strName=StrName[i];  
    var imgSort=createElement('img').attr('data-type', 'sort').prop({src:uUnsorted, alt:"sort"});
    var boAscDefault=(strName in BoAscDefault)?BoAscDefault[strName]:true;
    var label=(strName in Label)?Label[strName]:ucfirst(strName);
    var h=createElement(strTH).myAppend(imgSort).addClass('unselectable').prop({UNSELECTABLE:"on"}).attr('name',strName).prop('boAscDefault',boAscDefault).prop('title',label).on('click',thClick);
    Th[i]=h;
    arrImgSort[i]=imgSort;
  }

  el.append(...Th);
  el.addClass('listHead');
  return el;
}


/*******************************************************************************************************************
 *******************************************************************************************************************
 *
 * userAppList, devAppList
 *
 *******************************************************************************************************************
 *******************************************************************************************************************/

var userAppSetDivExtend=function(el){
  el.toString=function(){return 'userAppSetDiv';}
  return el;
}
var userAppDeleteDivExtend=function(el){
  el.toString=function(){return 'userAppDeleteDiv';}
  var ok=createElement('button').myText('OK').addClass('highStyle').css({'margin-top':'1em'}).on('click',function(){    
    var idApp=elR.attr('idApp'), vec=[['userAppDelete',{idApp},okRet]];   majax(vec);    
  });
  var okRet=function(data){
    if(!data.boOK) return;
    userAppList.myRemove(elR);
    historyBack();
  }
  el.openFunc=function(){
    elR=this.parentNode.parentNode; spanApp.myText(elR.r.appName);
    doHistPush({strView:'userAppDeleteDiv'});
    el.setVis();
  }
  el.setVis=function(){
    el.show(); return 1;
  }
 
  var elR;
  var head=createElement('h3').myText('Remove');
  var spanApp=createElement('span');//.css({'font-weight': 'bold'});
  var p=createElement('div').myAppend(spanApp);

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center").myAppend(head,p,ok).css({'min-width':'17em','max-width':'25em', padding:'0.1em'}); //,cancel  height:'10em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); 
  return el;
}
var userAppListExtend=function(el){
  el.toString=function(){return 'userAppList';}
  //el.setUp=function(){};
  var TDProt={
    tAccess:{
      mySetVal:function(tT){ var strT=getSuitableTimeUnitStr(unixNow()-tT);  this.myText(strT);  }
    },
    imageHash:{
      mySetVal:function(imageHash){
        var r=this.parentNode.r, im=this.firstChild, uImg; if(r.imageHash!=null) uImg=uAppImage+r.imageHash;  else uImg=uSite+"/lib/image/anonEmptyHash.png";
        im.prop({src:uImg});
      }
    }
  }
  var TDConstructors={
    tAccess:function(){ var el=createElement('td');  extend(el,TDProt.tAccess);  return el;  },
    imageHash:function(){ var image=createElement('img').css({'vertical-align':'middle'}).prop({alt:"app"}), el=createElement('td').css('text-align','center').myAppend(image);  extend(el,TDProt.imageHash);  return el;  }
  }
  el.myAdd=function(r){
    var Td=[];
    for(var i=0;i<StrCol.length;i++) { 
      var name=StrCol[i], val=r[name], td; if(name in TDConstructors) {td=new TDConstructors[name](); }   else td=createElement('td');   Td.push(td.attr('name',name));
      //if('mySetVal' in td) { td.mySetVal(val);}   else td.append(val);
      //if('mySetSortVal' in td) { td.mySetSortVal(val);}   else td.valSort=val;
    }
    var buttEdit=createElement('button').attr('name','buttonEdit').myText('Edit').addClass('highStyle').on('click',function(){
      userAppSetDiv.openFunc.call(this,1,1);
    });
    var buttDelete=createElement('button').attr('name','buttonDelete').addClass('highStyle').css({'margin-right':'0.2em'}).myAppend(imgDelete.cloneNode()).on('click',userAppDeleteDiv.openFunc);
    var tEdit=createElement('td').myAppend(buttEdit), tDelete=createElement('td').myAppend(buttDelete); 
    var elR=createElement('tr').myAppend(...Td, tDelete); elR.attr({idApp:r.idApp,appName:r.appName}).prop('r',r);  //, tEdit
    for(var i=0;i<StrCol.length;i++) { 
      var td=Td[i], name=StrCol[i], val=r[name]
      if('mySetVal' in td) { td.mySetVal(val);}   else td.append(val);
      if('mySetSortVal' in td) { td.mySetSortVal(val);}   else td.valSort=val;
    }
    tBody.append(elR); 
    el.nRowVisible=tBody.children.length;
    return el;
  }
  el.myRemove=function(elR){
    elR.remove();  return el; 
    el.nRowVisible=tBody.children.length;
  }
  el.myEdit=function(r){
    var elR=tBody.querySelector('[idApp="'+r.idApp+'"]');
    elR.attr({idApp:r.idApp});
    //for(var i=0;i<StrCol.length;i++) { var name=StrCol[i], val=r[name], td=elR.children('td:eq('+i+')'); if(td.mySetVal) td.mySetVal(val); else td.empty().myAppend(val); }
    for(var i=0;i<StrCol.length;i++) { var name=StrCol[i], val=r[name], td=elR.children[i]; if(td.mySetVal) td.mySetVal(val); else td.empty().myAppend(val); }
    return el;
  }
  el.setUp=function(){
    if(el.boStale) {
      var vec=[['userAppListGet',{},setUpRet]];   majax(vec);
      el.boStale=0;
    }
  }
  var setUpRet=function(data){
    var tab=data.tab||[];
    var StrColTmp=data.StrCol; 
    tBody.empty(); 
    for(var i=0;i<tab.length;i++) {  
      var obj={}; for(var j=0;j<StrColTmp.length;j++){ obj[StrColTmp[j]]=tab[i][j];}
      tab[i]=obj;
      el.myAdd(tab[i]);      
    }
    el.nRowVisible=tab.length;
  }
  el.boStale=1;

  var tBody=el.tBody=createElement('tbody');
  el.table=createElement('table').myAppend(tBody); //.css({width:'100%',position:'relative'});
  el.divCont=createElement('div').myAppend(el.table).css({'margin':'1em auto 0','text-align':'left', display:'inline-block', overflow:'hidden'});

  var StrCol=['idApp', 'appName','scope', 'imageHash', 'tAccess'], BoAscDefault={tAccess:0};
  var Label={tAccess:'Accessed',imageHash:'Image'};
  var tHead=headExtend(createElement('thead'),el,StrCol,BoAscDefault,Label);
  tHead.css({background:'white', width:'inherit'});  //,height:'calc(12px + 1.2em)'
  el.table.prepend(tHead);
  el.nRowVisible=0;

  var imgDelete=imgProt.cloneNode().prop({src:uDelete, alt:"delete"});
      // menuA
  var spanLabel=createElement('span').myText('userAppList').css({'float':'right',margin:'0.2em 0 0 0'});  
  var menuA=createElement('div').myAppend(spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':maxWidth,'text-align':'left',margin:'.3em auto .4em'}); 

  el.addClass('userAppList');
  el.fixedDiv=createElement('div').myAppend(menuA).css(cssFixed);
  el.css({'text-align':'center'});
  el.append(el.divCont, el.fixedDiv);
  return el;
}


var devAppSetDivExtend=function(el){
  el.toString=function(){return 'devAppSetDiv';}
  var save=function(){
    r.appName=inpAppName.value.trim(); if(r.appName.length==0){ setMess('empty app name',2);  return;}
    var uri=inpURL.value.trim();  if(uri.length==0){ setMess('empty redir_uri',2);  return;}
    if(RegExp('^https?:\/\/$').test(uri)) { setMess('empty domain',2);  return;}
    if(!RegExp('^https?:\/\/').test(uri)){  uri="http://"+uri;   }
    r.redir_uri=uri;
    var objTmp=extend({boUpd},r);
    var vec=[['devAppSet', objTmp, saveRet]];   majax(vec);
  }
  var saveRet=function(data){
    if(!data.boOK) return;
    if('idApp' in data)  { r.idApp=data.idApp; }
    if('imageHash' in data)  { r.imageHash=data.imageHash; }
    if(boUpd) {  devAppList.myEdit(r); } 
    else {r.created=unixNow(); devAppList.myAdd(r); }
    historyBack();
  }
  el.setUp=function(){
    inpAppName.value=r.appName; inpURL.value=r.redir_uri;
    inpAppName.focus();  return true;
  }
  el.openFunc=function(boUpdT,boGotData){
    boUpd=boUpdT;
    if(boGotData){
      var elR=this.parentNode.parentNode;
      r=elR.r;
    } else {r=rDefault;}
    doHistPush({strView:'devAppSetDiv'});
    el.setVis();
    el.setUp();
  }
  el.setVis=function(){
    el.show(); return 1;
  }
 
  var rDefault={appName:'', redir_uri:''};
  var boUpd, r; 
  

  var labAppName=createElement('b').myText('appName');
  var inpAppName=createElement('input').prop({type:'text'});
  var labURL=createElement('b').myText('Redirect uri');
  var inpURL=createElement('input').prop({type:'text'});


  var Lab=[labAppName, labURL]; Lab.forEach(ele=>ele.css({'margin-right':'0.5em'}));
  var Inp=[inpAppName, inpURL]; Inp.forEach(ele=>ele.css({display:'block',width:'100%'}).on('keypress', function(e){ if(e.which==13) {save();return false;}} )  );
  var InpNLab=[labAppName, inpAppName, labURL, inpURL];


  var buttonSave=createElement('button').myText('Save').addClass('highStyle').on('click',save).css({'margin-top':'1em'});
  var divBottom=createElement('div').myAppend(buttonSave);  //buttonCancel,

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center").myAppend(...InpNLab,divBottom).css({'min-width':'17em','max-width':'30em', padding: '1.2em 0.5em 1.2em 1.2em'}); // height:'18em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); 
   
  return el;
}


var devAppDeleteDivExtend=function(el){
  el.toString=function(){return 'devAppDeleteDiv';}
  var ok=createElement('button').myText('OK').addClass('highStyle').css({'margin-top':'1em'}).on('click',function(){    
    var idApp=elR.attr('idApp'), vec=[['devAppDelete',{idApp},okRet]];   majax(vec);    
  });
  var okRet=function(data){
    if(!data.boOK) return;
    devAppList.myRemove(elR);
    historyBack();
  }
  el.openFunc=function(){
    elR=this.parentNode.parentNode; spanApp.myText(elR.r.appName);
    doHistPush({strView:'devAppDeleteDiv'});
    el.setVis();
  }
  el.setVis=function(){
    el.show(); return 1;
  }
 
  var elR;
  var head=createElement('h3').myText('Delete');
  var spanApp=createElement('span');//.css({'font-weight': 'bold'});
  var p=createElement('div').myAppend(spanApp);

  var blanket=createElement('div').addClass("blanket");
  var centerDiv=createElement('div').addClass("Center").myAppend(head,p,ok).css({'min-width':'17em','max-width':'25em', padding:'0.1em'}); //,cancel  height:'10em', 
  el.addClass("Center-Container").myAppend(centerDiv,blanket); 
  return el;
}


//idApp, name, redir_uri, imageHash, created
var devAppListExtend=function(el){
  el.toString=function(){return 'devAppList';}
  var TDProt={
    created:{
      mySetVal:function(tCreated){ var strT=getSuitableTimeUnitStr(unixNow()-tCreated);  this.myText(strT);  }
    },
    imageHash:{
      mySetVal:function(imageHash){
        var r=this.parentNode.r, im=this.firstChild, uImg; if(r.imageHash!=null) uImg=uAppImage+r.imageHash;  else uImg=uSite+"/lib/image/anonEmptyHash.png";
        im.prop({src:uImg});
      }
    }
  }
  var TDConstructors={
    created:function(){ var el=createElement('td');  extend(el,TDProt.created);  return el;  },
    imageHash:function(){
      var image=createElement('img').prop({alt:"app"}).css({'vertical-align':'middle'}).on('click',setImage), el=createElement('td').css('text-align','center').myAppend(image);  extend(el,TDProt.imageHash);  return el;  }
  }
  var setImage=function(){
    var i=this, elR=this.parentNode.parentNode, r=elR.r;
    var uploadCallback=function(data){
      var imageHash=null; if('imageHash' in data) imageHash=data.imageHash;
      var uImg; if(imageHash!=null) uImg=uAppImage+imageHash;  else uImg=uSite+"/lib/image/anonEmptyHash.png";
      if('imageHash' in data)  i.prop({src:uImg}); 
      historyBack();
    }
    uploadImageDiv.openFunc('a'+r.idApp, uploadCallback);

  }
  el.myAdd=function(r){
    var Td=[];
    for(var i=0;i<StrCol.length;i++) { 
      var name=StrCol[i], val=r[name], td; if(name in TDConstructors) {td=new TDConstructors[name](); }   else td=createElement('td');   Td.push(td.attr('name',name));
      //if('mySetVal' in td) { td.mySetVal(val);}   else td.append(val);
      //if('mySetSortVal' in td) { td.mySetSortVal(val);}   else td.valSort=val;
    }
    var buttEdit=createElement('button').attr('name','buttonEdit').myText('Edit').addClass('highStyle').on('click',function(){
      devAppSetDiv.openFunc.call(this,1,1);
    });
    var buttSecret=createElement('button').attr('name','buttonSecret').myText('Secret').addClass('highStyle').on('click',function(){
      devAppSecretDiv.openFunc.call(this);
    });
    var buttDelete=createElement('button').attr('name','buttonDelete').addClass('highStyle').css({'margin-right':'0.2em'}).myAppend(imgDelete.cloneNode()).on('click',devAppDeleteDiv.openFunc);
    var tEdit=createElement('td').myAppend(buttEdit), tSecret=createElement('td').myAppend(buttSecret), tDelete=createElement('td').myAppend(buttDelete); 
    var elR=createElement('tr').myAppend(...Td, tSecret, tEdit, tDelete); elR.attr({idApp:r.idApp,appName:r.appName}).prop('r',r);
    for(var i=0;i<StrCol.length;i++) { 
      var td=Td[i], name=StrCol[i], val=r[name]
      if('mySetVal' in td) { td.mySetVal(val);}   else td.append(val);
      if('mySetSortVal' in td) { td.mySetSortVal(val);}   else td.valSort=val;
    }
    tBody.append(elR); 
    el.nRowVisible=tBody.children.length;
    return el;
  }
  el.myRemove=function(elR){
    elR.remove();  return el; 
    el.nRowVisible=tBody.children.length;
  }
  el.myEdit=function(r){
    var elR=tBody.querySelector('[idApp="'+r.idApp+'"]');
    elR.attr({idApp:r.idApp});
    //for(var i=0;i<StrCol.length;i++) { var name=StrCol[i], val=r[name], td=elR.children('td:eq('+i+')'); if(td.mySetVal) td.mySetVal(val); else td.empty().myAppend(val); }
    for(var i=0;i<StrCol.length;i++) { var name=StrCol[i], val=r[name], td=elR.children[i]; if(td.mySetVal) td.mySetVal(val); else td.empty().myAppend(val); }
    return el;
  }
  el.setUp=function(){
    if(el.boStale) {
      var vec=[['devAppListGet',{},setUpRet]];   majax(vec);
      el.boStale=0;
    }
  }
  var setUpRet=function(data){
    var tab=data.tab||[];
    var StrColTmp=data.StrCol; 
    tBody.empty(); 
    for(var i=0;i<tab.length;i++) {  
      var obj={}; for(var j=0;j<StrColTmp.length;j++){ obj[StrColTmp[j]]=tab[i][j];}
      tab[i]=obj;
      el.myAdd(tab[i]);      
    }
    el.nRowVisible=tab.length;
  }
  el.boStale=1;

  var tBody=el.tBody=createElement('tbody');
  el.table=createElement('table').myAppend(tBody); //.css({width:'100%',position:'relative'});
  el.divCont=createElement('div').myAppend(el.table).css({'margin':'1em auto 0','text-align':'left',display:'inline-block', overflow:'hidden'});

  var StrCol=['idApp','appName','redir_uri', 'imageHash', 'created'], BoAscDefault={created:0};
  var Label={imageHash:'Image', created:'Age'};
  var tHead=headExtend(createElement('thead'),el,StrCol,BoAscDefault,Label);
  tHead.css({background:'white', width:'inherit'});  //,height:'calc(12px + 1.2em)'
  el.table.prepend(tHead);
  el.nRowVisible=0;

  var imgDelete=imgProt.cloneNode().prop({src:uDelete, alt:"delete"});
      // menuA
  var buttonAdd=createElement('button').myText('Add').addClass('highStyle', 'fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).on('click',function(){
    devAppSetDiv.openFunc.call({},0,0);
  });
  var spanLabel=createElement('span').myText('devAppList').css({'float':'right',margin:'0.2em 0 0 0'});  
  var menuA=createElement('div').myAppend(buttonAdd,spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':maxWidth,'text-align':'left',margin:'.3em auto .4em'}); 

  el.addClass('devAppList');
  el.fixedDiv=createElement('div').myAppend(menuA).css(cssFixed);
  el.css({'text-align':'center'});
  el.append(el.divCont, el.fixedDiv);
  return el;
}



var majax=function(vecIn){  // Each argument of vecIn is an array: [serverSideFunc, serverSideFuncArg, returnFunc]
  var xhr = new XMLHttpRequest();
  xhr.open('POST', uBE, true);
  var arrRet=[]; vecIn.forEach(function(el,i){var f=null; if(el.length==3) f=el.pop(); arrRet[i]=f;}); // Put return functions in a separate array
  //vecIn.push(['CSRFCode',CSRFCode]);
  vecIn.push(['CSRFCode',getItem('CSRFCode')]);
  if(vecIn.length==2 && vecIn[0][1] instanceof FormData){
    var formData=vecIn[0][1]; vecIn[0][1]=0; // First element in vecIn contains the formData object. Rearrange it as "root object" and add the remainder to a property 'vec'
    formData.append('vec', JSON.stringify(vecIn));
    var dataOut=formData;
    xhr.setRequestHeader('x-type','single');
  } else { var dataOut=JSON.stringify(vecIn); }
  
  xhr.onload=function () {
    var dataFetched=this.response;
    //var data; try{ data=JSON.parse(this.response); }catch(e){ setMess(e);  return; }
    var data=deserialize(this.response);
    
    var dataArr=data.dataArr;  // Each argument of dataArr is an array, either [argument] or [altFuncArg,altFunc]
    delete data.dataArr;
    beRet(data);
    for(var i=0;i<dataArr.length;i++){
      var r=dataArr[i];
      if(r.length==1) {var f=arrRet[i]; if(f) f(r[0]);} else { window[r[1]].call(window,r[0]);   }
    }
  }
  xhr.onerror=function(e){ var tmp='statusText : '+xhr.statusText;  setMess(tmp); console.log(tmp);   throw 'bla';}
  
  xhr.send(dataOut); 
  busyLarge.show();
}



var beRet=function(data){ //,textStatus,jqXHR
  //if(typeof jqXHR!='undefined') var tmp=jqXHR.responseText;
  for(var key in data){
    window[key].call(this,data[key]); 
  }
  busyLarge.hide();
}

app.GRet=function(data){
  var tmp;
  //if(typeof userInfoFrDB=='undefined') window.userInfoFrDB={};navigator.vibrate(100);
  tmp=data.strMessageText;   if(typeof tmp!="undefined") {setMess(tmp); if(/error/i.test(tmp)) navigator.vibrate(100);}
  //tmp=data.CSRFCode;   if(typeof tmp!="undefined") CSRFCode=tmp;
  if('CSRFCode' in data) setItem('CSRFCode',data.CSRFCode);
  //tmp=data.userInfoFrDB; if(typeof tmp!="undefined") {  for(var key in tmp){ userInfoFrDB[key]=tmp[key]; }   } 
  tmp=data.userInfoFrDB; if(typeof tmp!="undefined") {  userInfoFrDB=tmp; }
  tmp=data.objApp; if(typeof tmp!="undefined") {  objApp=tmp; }  
  tmp=data.objUApp; if(typeof tmp!="undefined") {  objUApp=tmp; }  
  divLoginInfo.setStat();
 
}

/*******************************************************************************************************************
 * Plugin (Prop)
 *******************************************************************************************************************/


 // el.StrProp=['name', 'password', 'image', 'email', 'telephone',   'country', 'federatedState', 'county', 'city', 'zip', 'address',     'idFB', 'idGoogle', 'idNational', 'birthdate', 'motherTongue', 'gender'];
var PropExtend=function(){
  var saveInpDefault=function(inp){ return [null, inp.value.trim()];}
  var crInpDefault=function(){
    //var strType=('strType' in this)?this.strType:'';
    var inp=createElement('input').prop({type:this.strType||''});
    if('inpW' in this)  inp.css({width:this.inpW+'em'});
    return inp;
  }
  var setInpDefault=function(inp){  var strName=inp.attr('name');   inp.value=userInfoFrDB[strName];  }

  var crStatisticSpanDefault=function(){
    //var spanNChange=createElement('span').css({'font-weight':'bold'}).attr('name','nChange'), spanLastChange=createElement('span').css({'font-weight':'bold'}).attr('name','lastChange'), spanLastChangeW=createElement('span').myAppend('(', spanLastChange, ' ago)');
    //var span=createElement('span').myAppend('Changed ', spanNChange, ' times ', spanLastChangeW).css({'font-size':'85%', 'margin-left':'0.4em'});
    //return span;
    var span=createElement('span').css({'font-size':'85%', 'margin-left':'0.4em'});
    return span;
  }
  var setStatisticSpanDefault=function(span){
    var strNName='n'+ucfirst(span.attr('name')), nChange=userInfoFrDB[strNName];//, spanNChange=span.querySelector('span[name=nChange]'); spanNChange.myText(nChange);
    var strTName='t'+ucfirst(span.attr('name')), strT=getSuitableTimeUnitStr(unixNow()-userInfoFrDB[strTName]);
    //var spanTChange=span.querySelector('span[name=lastChange]'); spanTChange.myText(strT); spanTChange.parentNode.toggle(nChange); 
    if(nChange==0) span.myHtml('Changed <b>0</b> times');
    else if(nChange==1) span.myHtml('Changed <b>1</b> time, <b>'+strT+'</b> ago');
    else if(nChange==2) span.myHtml('Changed <b>'+nChange+'</b> times, <b>'+strT+'</b> ago');
  }


  var StrProp=Object.keys(Prop);
  for(var i=0;i<StrProp.length;i++){
    var strName=StrProp[i];  
    extend(Prop[strName], {
      saveInp:saveInpDefault, crInp:crInpDefault, setInp:setInpDefault,
      crStatisticSpan:crStatisticSpanDefault,
      setStatisticSpan:setStatisticSpanDefault
    });
  }

  var tmpCrF=function(){return createElement('button').addClass('highStyle').myText('Fetch');};
  var tmpSetF=function(){};


    // text
  extend(Prop.name, {strType:'text',inpW:9});


    // password
  extend(Prop.password, {
    strType:'password',
    inpW:9,
    crInp:function(){return createElement('button').addClass('highStyle').myText('Change').on('click',function(){
      changePWPop.openFunc();
    });},
    crStatisticSpan:function(){return createElement('span'); },
    setStatisticSpan:function(){ }
  });


    // misc
  //extend(Prop.idFB, { crInp:tmpCrF, setInp:tmpSetF });
  extend(Prop.idGoogle, { crInp:tmpCrF, setInp:tmpSetF });
  extend(Prop.telephone, {strType:'tel'});
  extend(Prop.email, {strType:'email'});


    // idFB
  var tmpCrInp=function(){
    var c=createElement('span');
    c.nr=createElement('span');
    c.butDelete=createElement('button').addClass('highStyle').myText('Clear').on('click',function(){
      var vec=[['deleteExtId', {kind:'fb'}], ['setupById',{}, userSettingDiv.setUp]];   majax(vec); 
    });
    c.buttFetch=createElement('button').addClass('highStyle').myText('Fetch').on('click',async function(){
        var [err, code]=await getOAuthCode(); if(err) {setMess(err); return;}
        var timeZone=new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)[1];
        var oT={IP:strIPPrim, fun:'fetchFun', caller:'index', code, timeZone};
        await new Promise(resolve=>{var vec=[['loginGetGraph', oT], ['setupById',{idApp}, function(){ resolve(); }]];   majax(vec);   });
        
        userSettingDiv.setUp();
    });
    c.thumb=createElement('img').prop({alt:"user"}).css({'vertical-align':'middle'});
    c.append(c.nr, c.thumb, c.butDelete, c.buttFetch);  //langHtml.YourImage+': ',
    return c;
  };
  var tmpSetInp=function(c){
    c.nr.myText(userInfoFrDB.idFB);
    var boExist=Boolean(userInfoFrDB.idFB); c.butDelete.toggle(boExist);  c.buttFetch.toggle(!boExist);
    var tmp=userInfoFrDB.image; c.thumb.prop({src:tmp}).toggle(Boolean(tmp.length)); 
  };
  extend(Prop.idFB, { strType:'span', crInp:tmpCrInp, setInp:tmpSetInp, saveInp:function(){return [null, null];}  });



    // email
  extend(Prop.email, {
    saveInp:function(inp){ var val=inp.value.trim(); if(/\S+@\S+/.test(val)) return [null,val]; else return ['Invalid email'];}
  });
  
    //boEmailVerified 
  var tmpCrInp=function(){
    var c=createElement('span');
    c.spanYes=createElement('span').css({'color':'green', 'margin-right':'1em'}).myText('Yes');
    c.spanNo=createElement('span').css({'color':'red', 'margin-right':'1em'}).myText('No');
    c.butVerify=createElement('button').addClass('highStyle').myText(langHtml.emailVerificationOfEmail).on('click',function(){
      //var vec=[['verifyEmail',{}]];   majax(vec); 
      verifyEmailPop.openFunc();
    });
    c.append(c.spanYes, c.spanNo, c.butVerify);  //langHtml.YourImage+': ',
    return c;
  }; 
  var tmpSetInp=function(c){
    var boT=Boolean(userInfoFrDB.boEmailVerified);
    c.spanYes.toggle(boT); c.spanNo.toggle(!boT);    c.butVerify.toggle(!boT);
  };
  extend(Prop.boEmailVerified, {
    strType:'span', crInp:tmpCrInp, setInp:tmpSetInp, saveInp:function(){return [null, null];},
    crStatisticSpan:function(){return createElement('span'); },
    setStatisticSpan:function(){ }
  });

    // birthdate
  extend(Prop.birthdate, {
    strType:'date', 
    saveInp:function(inp){ var val=inp.value.trim(); if(val) return [null,val]; else return ['Invalid Birthdate'];},
    //setInp:function(inp){  debugger; var strName=inp.attr('name'), val=new Date(userInfoFrDB[strName]*1000).toISOString().split('T')[0];   inp.value=val; }
    setInp:function(inp){   var strName=inp.attr('name'), val=userInfoFrDB[strName];   inp.value=val; }
  });

    // gender
  var crInpFunc=function(){
    var c=createElement('select').addClass('highStyle'), arrTmp=['male','female'];
    for(var i=0;i<arrTmp.length;i++){  var opt=createElement('option').myText(arrTmp[i]).prop('value',arrTmp[i]);   c.append(opt);    } 
    c.value='male';
    return c;
  };
  extend(Prop.gender, {strType:'select', crInp:crInpFunc});

    // image
  var tmpCrInp=function(){
    var c=createElement('span');
    c.thumb=createElement('img').prop({alt:"user"}).css({'vertical-align':'middle'});
    c.butDeleteImg=createElement('button').addClass('highStyle').myText('Clear').on('click',function(){
      var vec=[['deleteImage', {kind:'u'}], ['setupById',{}, userSettingDiv.setUp]];   majax(vec); 
    });
    var uploadCallback=function(){
      var tmpF=function(){
        var tmp=calcImageUrlUser(); c.thumb.prop({src:tmp}); historyBack();
      };
      var vec=[ ['setupById',{},tmpF]];   majax(vec);
    }
    var buttUploadImage=createElement('button').addClass('highStyle').myText(langHtml.uploadNewImg).on('click',function(){uploadImageDiv.openFunc('u',uploadCallback);});
    c.append(c.thumb, c.butDeleteImg, buttUploadImage);  //langHtml.YourImage+': ',
    return c;
  };
  app.calcImageUrl=function(rT){
    var uImg;
    if(rT.imageHash!==null) uImg=uUserImage+rT.imageHash;
    else if(rT.image.length) uImg=rT.image;
    else uImg=uSite+"/lib/image/anonEmptyHash.png";
    return uImg;
  };
  app.calcImageUrlUser=function(){    return calcImageUrl(userInfoFrDB);     }
  var tmpSetInp=function(c){
    var tmp=calcImageUrlUser();
    c.thumb.prop({src:tmp});
  };
  extend(Prop.image, { strType:'span', crInp:tmpCrInp, setInp:tmpSetInp, saveInp:function(){return [null, null];}  });

  var StrObli=['name', 'email', 'password', 'birthdate'];
  for(var i=0;i<StrObli.length;i++){  var strName=StrObli[i];  Prop[strName].boObli=true;  }

}

var timerALogout=null;


app.langHtml={
  OK:'OK',
  Yes:'Yes',
  uploadNewImg:'Upload new image',
  Save:'Save',
  Delete:'Delete',
  Settings:'Settings',
  CreateAccount:'Create Account',
  Create:'Create',
  Login:'Login',
  WhyOAuth:'Why is an external account needed?',
  helpLoginCommenter:'<p>An external ID provider (currently Google or Facebook) is used to ensure uniqness (so that noone creates more than one account).<p>Your integrity has the highest priority. No data is sent to ID provider. You can at any time remove your comments an thereby all references to you',
  anIdentityIsNeeded:'An identity is needed...',
  noteLoginVendor:'<p>An external ID provider (currently Google or Facebook) is used to ensure uniqness (so that noone creates more than one account).<p>Your integrity has the highest priority. No data is sent to ID provider.<p>If your disappointed or just want to try around, then just login, play around, and delete you account, no hard feelings (And you are welcome back any time)',
  Cancel:'Cancel',
  pendingMessLogin:'Signing you in',
  cancelMessLogin:'Sign-in canceled',
  emailVerificationOfEmail:"Send verification email",
      //login
  divLoginInfo:{'user':'user',
    'admin':'admin',
    'logoutButt':'Sign-out'
  },
  deleteBox:{
    regret:"Do you really want to delete the account",
    help:"As long as you haven't made any payments, you can delete the account"
  },
  disclaimerHead:'Disclamer etc.',
  disclaimer:`<p>The site might be taken down at any moment simply because the developer feels like it. The software is still free (to use and change) (<a href="https://github.com/emagnusandersson/idPlace">link</a>)\n
  <h5>Your account might be deleted...</h5>
  <p>... in attempts to keep the register free of fake accounts. (<a href="https://emagnusandersson.com/idPlace">Why is it important to get rid of fake accounts</a>)
  <h5>Best practices to keep your account from being deleted</h5>
  <p>• Don't enter fake data, it's better to leave a field empty than entering fake data. Note that just because you entered your data on this site, doesn't mean that you have to share them with the "Relying party" (the site you are "identifying" yourself to.)
  <p>• Don't change data that is expected to be constant too often (Social security number, birth date ...)
  <p>• Tie your account to Facebook. (This since Facebook also has a policy of maintaining unique accounts. (And they have much better resources to work on the issue.))
  <h5>Also note:</h5>
  <p>You can always delete your account and create a new one later.`,
  // time units [[singularShort, pluralShort], [singularLong, pluralLong]]
  timeUnit:{
  s:[['s','s'],['second','seconds']],
  m:[['min','min'],['minute','minutes']],
  h:[['h','h'],['hour','hours']],
  d:[['d','d'],['day','days']],
  M:[['mo','mo'],['month','months']],
  y:[['y','y'],['year','years']]
  },
};
//<p>• If you entered a correct email address you will most likely be emailed before you are deleted.
//<p>(Taking someone elses identity may also go against the laws of the local justice system.)
//<p>See Also: <a href='https://emagnusandersson.com/idPlace_purge_philosophy'>Purging philosophy</a>
//People who create multiple/fake/non-legitimate IDs may be deleted without warning.<p>It is better to leave fields empty than to write erratic information in them.'


langHtml.label={
id:'id',
//idUser:'idUser',
name:'Name',
image:'Image',
email:'Email',
boEmailVerified:'Email verified',
telephone:'Telephone',

country:'Country',
federatedState:'Federated state',
county:'County',
city:'City',
zip:'Zip',
address:'Address',

idFB:'Facebook ID',
idGoogle:'Google ID',

idNational: 'Social security number / National ID number',
birthdate:'Birthdate',
motherTongue:'Mother tongue',
gender:'Gender'
}
var helpBub={}



app.elHtml=document.documentElement;  app.elBody=document.body
elBody.css({margin:'0px'});

app.boTouch = Boolean('ontouchstart' in document.documentElement);
//boTouch=1;




var ua=navigator.userAgent, uaLC = ua.toLowerCase(); //alert(ua);
app.boAndroid = uaLC.indexOf("android") > -1;
app.boFF = uaLC.indexOf("firefox") > -1; 

app.boChrome= /chrome/.test(uaLC);
app.boIOS= /iphone|ipad|ipod/.test(uaLC);
app.boEpiphany=/epiphany/.test(uaLC);    if(boEpiphany && !boAndroid) boTouch=false;  // Ugly workaround

app.boOpera=RegExp('OPR\\/').test(ua); if(boOpera) boChrome=false; //alert(ua);


if(boTouch){
  if(boIOS) {  
    // var tmp={height:"100%", "overflow-y":"scroll", "-webkit-overflow-scrolling":"touch"};
    // elBody.css(tmp);  elHtml.css(tmp);
  }
} 

//boHistPushOK='pushState' in history && 'state' in history;
var boHistPushOK='pushState' in history;
if(!boHistPushOK) { alert('This browser does not support history'); return;}
var boStateInHistory='state' in history;
if(!boStateInHistory) { alert('This browser does not support history.state'); return;}


var boFormDataOK=1;  if(typeof FormData=='undefined') {  boFormDataOK=0;  }


if(!(typeof sessionStorage=='object' && sessionStorage.getItem)) {console.log("This browser doesn't support sessionStorage"); return;}

var boImgCreationOK=1;

indexAssign();

PropExtend();

var objQS=parseQS(location.search.substring(1));
var boAuthReq=Boolean(Object.keys(objQS).length);
var scopeAsked=objQS.scope||'';
var idApp=Number(objQS.client_id)||null;

var cssFixedTop={margin:'0em 0','text-align':'center',position:'fixed',top:0,width:'100%','border-top':'3px #aaa solid',background:'#fff'}; //,'z-index':5
var cssFixed={margin:'0em 0','text-align':'center',position:'fixed',bottom:0,width:'100%','border-top':'3px #aaa solid',background:'#fff'}; //,'z-index':5
var cssFixedDrag={margin:'0em 0','text-align':'center',position:'fixed',bottom:0,width:'100%',background:'#fff'}; //,'z-index':5
if(boTouch) cssFixedDrag=cssFixed;


var strScheme='http'+(boTLS?'s':''),    strSchemeLong=strScheme+'://',    uSite=strSchemeLong+site.wwwSite,      uBE=uSite+"/"+leafBE;
var uCanonical=uSite;

var uUserImage=uSite+'/image/u';
var uAppImage=uSite+'/image/a';

var wcseLibImageFolder='/'+flLibImageFolder+'/';
var uLibImageFolder=uSite+wcseLibImageFolder;

var uHelpFile=uLibImageFolder+'help.png';

var uVipp0=uLibImageFolder+'vipp0.png';
var uVipp1=uLibImageFolder+'vipp1.png';

var uFBTiny=uLibImageFolder+'fb.png';
//uFBFacebook=uLibImageFolder+'fbFacebook.png';
var uFb=uLibImageFolder+'fbLogin.png';
var uGoogle=uLibImageFolder+'googleWide.jpg';

var uIncreasing=uLibImageFolder+'increasing.png';
var uDecreasing=uLibImageFolder+'decreasing.png';
var uUnsorted=uLibImageFolder+'unsorted.png';

//uAnon=uLibImageFolder+'anon.png';
var uBusy=uLibImageFolder+'busy.gif';
var uBusyLarge=uLibImageFolder+'busyLarge.gif';

var uDelete=uLibImageFolder+'delete.png';
var uDelete1=uLibImageFolder+'delete1.png';
var uIdPlaceCompare=uLibImageFolder+'idPlaceCompare.png';


var imgHelp=createElement('img').prop({src:uHelpFile, alt:"help"}).css({'vertical-align':'-0.4em'});
var hovHelpMy=createElement('span').myText('❓').addClass('btn-round', 'helpButtonGradient').css({color:'transparent', 'text-shadow':'0 0 0 #5780a8'});
imgHelp=hovHelpMy;

var sizeIcon=1.5, strSizeIcon=sizeIcon+'em';
var imgProt=createElement('img').css({height:strSizeIcon,width:strSizeIcon,'vertical-align':'text-bottom'}); 


  //
  // History
  //

var strViewOrg='mainDiv';
var strHistTitle=site.wwwSite;
var stateRun=history.state;
var stateMem={hash:randomHash(), ind:0, strView:strViewOrg, scroll:0}
if(stateRun){
  let {strView, ind, scroll}=stateRun;
  if(strView!=strViewOrg)  scroll=0;
  extend(stateMem, {ind, scroll});
}
history.replaceState(stateMem, '', uCanonical);  // ind, hash, strView, scroll
history.StateOpen=[];
history.StateOpen[history.state.ind]=copySome({}, stateMem, ['strView','scroll']);    //  strView, scroll



window.on('popstate', function(event) {
  var stateT=history.state;
  var dir=stateT.ind-stateMem.ind;
  //if(Math.abs(dir)>1) {debugger; alert('dir=',dir); }
  var boSameHash=stateT.hash==stateMem.hash;
  if(boSameHash){
    if('boResetHashCurrent' in history && history.boResetHashCurrent) {
      stateT.hash=randomHash();
      history.replaceState(stateT, '', uCanonical);
      history.boResetHashCurrent=false;
    }

    var scroll=(stateMem.strView==stateT.strView && stateT.strView==strViewOrg)?stateMem.scroll:stateT.scroll;
    stateT.scroll=scroll
    stateMem=copyDeep(stateT);
    history.replaceState(stateMem, '', uCanonical);
    var stateOpen=history.StateOpen[stateT.ind]
    stateOpen.scroll=scroll
    setMyState(stateOpen);
  }else{
    if(stateMem.strView!=strViewOrg) stateMem.scroll=0
    extend(stateMem, {hash:randomHash(), strView:strViewOrg});  //, arg:"page"
    copySome(stateMem, stateT, ["ind"]);
    history.replaceState(stateMem, '', uCanonical);
    history.StateOpen[stateT.ind]={strView:strViewOrg, scroll:stateMem.scroll};
    history.go(sign(dir));
  }
});

var setMyState=function(state){
  var view=MainDiv[StrMainDivFlip[state.strView]];
  view.setVis();  // state.arg
  if(history.funOverRule) {history.funOverRule(); history.funOverRule=null;}
  else if(state.fun) {state.fun(state); }
  else{ view.funPopped?.(state); }
}

window.on('pagehide', function(){ 
  var stateT=history.state, stateOpen=history.StateOpen[stateT.ind];
  var {strView, scroll}=stateOpen;
  if(strView!=strViewOrg) scroll=0;
  extend(stateT, {strView:strViewOrg, scroll});
  history.replaceState(stateT, '', uCanonical);
});

if(boFF){ window.on('beforeunload', function(){   }); } 

app.errorFunc=function(jqXHR, textStatus, errorThrown){
  setMess('responseText: '+jqXHR.responseText+', textStatus: '+' '+textStatus+', errorThrown: '+errorThrown);     throw 'bla';
}



var imgBusy=createElement('img').prop({src:uBusy});
//messageText=messExtend(createElement('span'));  window.setMess=messageText.setMess;  window.resetMess=messageText.resetMess;   elBody.myText(messageText); 
//var spanMessageText=spanMessageTextCreate();  window.setMess=spanMessageText.setMess;  window.resetMess=spanMessageText.resetMess;  window.appendMess=spanMessageText.appendMess;  elBody.append(spanMessageText)

var maxWidth='var(--maxWidth)';

var divMessageText=divMessageTextCreate();  copySome(window, divMessageText, ['setMess', 'resetMess', 'appendMess']);
var divMessageTextWInner=createElement('div').myAppend(divMessageText).css({margin:'0em auto', width:'100%', 'max-width':maxWidth, 'text-align':'center', position:'relative'});
var divMessageTextW=createElement('div').myAppend(divMessageTextWInner).css({width:'100%', position:'fixed', bottom:'0px', left:'0px', 'z-index':'10'});
elBody.append(divMessageTextW);

var busyLarge=createElement('img').prop({src:uBusyLarge}).css({position:'fixed',top:'50%',left:'50%','margin-top':'-42px','margin-left':'-42px','z-index':'1000',border:'black solid 1px'}).hide();
elBody.append(busyLarge);


var H1=elBody.querySelector('h1');//.detach()
//H1.css({background:'#fff',border:'solid 1px',color:'black','font-size':'1.6em','font-weight':'bold','text-align':'center', padding:'0.4em 0em 0.4em 0em', margin:'0.3em 0em 0em 0em'});
elBody.querySelector('noscript').detach();

var divLoginInfo=elBody.querySelector('#divLoginInfo').css({'min-height':'2rem'})
var divLoginInfo=divLoginInfoExtend(divLoginInfo);  //flex:'0 0 auto', 
//elBody.prepend(divLoginInfo);


var mainDiv=mainDivExtend(createElement('div')); 
var idPLoginDiv=idPLoginDivExtend(createElement('div'));
var formLogin=formLoginExtend(elBody.querySelector('#formLogin'));
var loginSelectorDiv=loginSelectorDivExtend(createElement('div'));
//loginForSecretDiv=loginForSecretDivExtend(createElement('div'));


var deleteAccountPop=deleteAccountPopExtend(createElement('div'));
var changePWPop=changePWPopExtend(createElement('div'));
var verifyEmailPop=verifyEmailPopExtend(createElement('div'));
var forgottPWPop=forgottPWPopExtend(createElement('div'));
var uploadImageDiv=uploadImageDivExtend(createElement('div'));

var devAppList=devAppListExtend(createElement('div'));
var devAppSetDiv=devAppSetDivExtend(createElement('div'));
var devAppDeleteDiv=devAppDeleteDivExtend(createElement('div'));
var devAppSecretDiv=devAppSecretDivExtend(createElement('div'));
var userAppSetDiv=userAppSetDivExtend(createElement('div'));
var userAppDeleteDiv=userAppDeleteDivExtend(createElement('div'));
var userAppList=userAppListExtend(createElement('div'));


var divDisclaimer=divDisclaimerExtend(createElement('div')).css({'background':'#fff5f6', 'margin-bottom':'1em', 'padding':'0.2em', border:'1px red solid'});


var createUserDiv=createUserDivExtend(createElement('div'));
var createUserSelectorDiv=createUserSelectorDivExtend(createElement('div'));
var userSettingDiv=userSettingDivExtend(createElement('div'));
var consentDiv=consentDivExtend(createElement('div'));



var MainDiv=[mainDiv, loginSelectorDiv, deleteAccountPop, changePWPop, verifyEmailPop, forgottPWPop, uploadImageDiv, devAppList, devAppSetDiv, devAppDeleteDiv, devAppSecretDiv, userAppSetDiv, userAppDeleteDiv, userAppList, createUserDiv, createUserSelectorDiv, userSettingDiv, consentDiv]; 

var StrMainDiv=MainDiv.map(obj=>obj.toString());
var StrMainDivFlip=array_flip(StrMainDiv);





mainDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  mainDiv.setUp();
  return true;
}
loginSelectorDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.setUp();
  return true;
}
createUserSelectorDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.setUp();
  return true;
}
createUserDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.divDisclaimerW.append(divDisclaimer);
  this.setUp();
  return true;
}
userSettingDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.setUp(); 
  this.divDisclaimerW.append(divDisclaimer);
  return true;
}
consentDiv.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.setUp();
  return true; 
}

devAppList.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.setUp();
  return true;
}
userAppList.setVis=function(){
  MainDiv.forEach(ele=>ele.hide()); this.show();
  this.setUp();
  return true;
}


MainDiv.forEach(ele=>ele.hide());
elBody.append(divLoginInfo, H1, ...MainDiv);


elBody.css({'text-align':'center'});
//MainDiv.css({'margin-left':'auto','margin-right':'auto'});
//MainDiv.not(H1).css({'text-align':'left',background:'#fff'});
[...MainDiv, divLoginInfo, H1].forEach(ele=>ele.css({'margin-left':'auto','margin-right':'auto'}));
[...MainDiv, divLoginInfo].forEach(ele=>ele.css({'text-align':'left',background:'#fff'}));


var mainDivsNonFixWidth=[mainDiv, devAppList, userAppList, userSettingDiv, createUserDiv];
var mainDivsPop=[deleteAccountPop, verifyEmailPop, forgottPWPop, changePWPop, uploadImageDiv, devAppSetDiv, devAppDeleteDiv, devAppSecretDiv, userAppSetDiv, userAppDeleteDiv];

mainDivsNonFixWidth.forEach(ele=>ele.css({display:'block','text-align':'center'}));
mainDivsPop.forEach(ele=>ele.css({display:'block','text-align':'left'}));

var mainDivsFixWidth=AMinusB([...MainDiv, divLoginInfo, H1],[...mainDivsNonFixWidth, ...mainDivsPop]);  mainDivsFixWidth.forEach(ele=>ele.css({'max-width':maxWidth}));


elBody.visible();
H1.show();
mainDiv.setVis();
divLoginInfo.setStat();


var setBottomMargin=function() { // This is not very beautiful. But how should one else make a fixed div at the bottom without hiding the bottom of the scrollable content behind??
  if(mainDiv.style.display!='none'){mainDiv.divCont.css({'padding-bottom':mainDiv.fixedDiv.offsetHeight+'px'});}
  else if(createUserDiv.style.display!='none'){createUserDiv.divCont.css({'padding-bottom':createUserDiv.fixedDiv.offsetHeight+'px'});}
  else if(userSettingDiv.style.display!='none'){userSettingDiv.divCont.css({'padding-bottom':userSettingDiv.fixedDiv.offsetHeight+'px'});}
  else if(userAppList.style.display!='none'){userAppList.divCont.css({'padding-bottom':userAppList.fixedDiv.offsetHeight+'px'});}
  else if(devAppList.style.display!='none'){devAppList.divCont.css({'padding-bottom':devAppList.fixedDiv.offsetHeight+'px'});}
}
if(boFF) window.on("DOMMouseScroll", setBottomMargin, false); else   window.on('mousewheel', setBottomMargin);

if(boTouch) elBody.on('touchstart',setBottomMargin); else { elBody.on('click',setBottomMargin);  window.scroll(setBottomMargin); }


//mainDiv
//  loginSelectorDiv  (idPLoginDiv, formLogin)
//  createUserSelectorDiv  (idPLoginDiv)
//    createUserDiv


  // In normal case: go back to mainDiv after successfull login/logout/createUser
idPLoginDiv.cb=formLogin.cb=createUserDiv.cb=divLoginInfo.cb=function(){
  if(history.StateOpen[history.state.ind].strView==='mainDiv') {mainDiv.setVis();}
  else history.fastBack('mainDiv');
};
if(boAuthReq){
  (async function (){ 
    if(Object.keys(userInfoFrDB).length==0){
      await new Promise(resolve=>{
        idPLoginDiv.cb=function(){
          resolve();
        };
        formLogin.cb=function(){
          resolve();
        };
        createUserDiv.cb=function(){
          resolve();
        };
      });
      idPLoginDiv.cb=null;formLogin.cb=null; createUserDiv.cb=null;
    }
    var tmpScopeGranted=objUApp?objUApp.scope:'';
    var boScopeOK=isScopeOK(tmpScopeGranted, scopeAsked);
    var boRerequest=objQS.auth_type=='rerequest';
    var boShowForm=boRerequest||!boScopeOK;
  
    
    var boAllow=true;
    if(boShowForm){
      boAllow=false;
      consentDiv.setVis();
      await new Promise(resolve=>{
        consentDiv.cb=function(boAllowT){
          boAllow=boAllowT;
          resolve();
        };
      });
    }
    var urlT=decodeURIComponent(objQS.redirect_uri);
    var regUrlCompare=RegExp("^[^#]+"), Match=regUrlCompare.exec(urlT), urlIn=Match[0];
    if(objQS.response_type=='token') {
      if(boAllow) var uRedir=createUriRedir(urlIn, objQS.state, objUApp.access_token, objUApp.maxUnactivityToken);
      else var uRedir=createUriRedirDeny(urlIn, objQS.state);
    }else if(objQS.response_type=='code'){
      if(boAllow) var uRedir=createUriRedirCode(urlIn, objQS.state, objUApp.code);
      else var uRedir=createUriRedirCodeDeny(urlIn, objQS.state);
    }
    window.location.replace(uRedir);

  })();
}

}

//window.onload=funLoad;
funLoad()





