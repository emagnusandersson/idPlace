
(function(){





function popUpExtend($el){
  $el.openPop=function() {
"use strict"
    //siz=getViewPortSize();  winW=siz.w;winH=siz.h;
    //var siz=getViewPortSize(); var winW=siz.w;
    var winW=$(window).width(),winH=$(window).height();
    var $doc=$(document), scrollX=$doc.scrollLeft(), scrollY=$doc.scrollTop(); 
    //var pageYOffset=window.pageYOffset;   if(typeof pageYOffset =='undefined') pageYOffset=document.body.scrollTop;
    $el.setBlanketSize();
  
    $el.addClass('popUpDiv');
    
    $body.prepend($el.$blanket);  
    $body.prepend($el);

    //$(window).scroll($el.setBlanketSize);
    $(window).on('scroll',$el.setBlanketSize);
    //$(window).scroll(function(){alert('tt');});
    
    //var bubW=$el.width(), bubH=$el.height();
    var bubW=$el.outerWidth(), bubH=$el.outerHeight(); //alert('$(window).width(): '+winW+' '+winH+', bubW: '+bubW+' '+bubH);
    var x=scrollX+(winW-bubW)/2; if(x<0) x=0;    var y=scrollY+(winH-bubH)/4;  if(y<0) y=0;
    //$el.append("scrollY:"+scrollY+", winH:"+winH+", bubH:"+bubH);
    //if($.browser.msie)  $el.css({left:x+'px'});   else $el.css({top:y+'px',left:x+'px'});
    $el.css({top:y+'px',left:x+'px'});
  }

  $el.closePop=function() { 
    $el.detach();    
    //$(window).unbind('scroll',$el.setBlanketSize);
    $(window).off('scroll',$el.setBlanketSize);
    $el.$blanket.detach(); 
  }
  
  $el.setBlanketSize=function(){
    
    var docH=$(document).height(), winH=$(window).height(), blankH=docH>winH?docH:winH, blankHOld=$el.$blanket.css("height");
    if(blankH!=blankHOld)  $el.$blanket.css({"height": blankH  });
    var docW=$(document).width(), winW=$(window).width(), blankW=docW>winW?docW:winW, blankWOld=$el.$blanket.css("width");
    if(blankW!=blankWOld)  $el.$blanket.css({"width": blankW  });
    
  }
  
  $el.$blanket=$('<div>').addClass('blanketPop');
  //$el.$blanket.css({background:'#555'});
  $el.$blanket.css({background:'#fff'});
  return $el;
}

var vippButtonExtend=function($el){
"use strict"
  $el.setStat=function(bo1){
    if(!bo1) {$el.css(o0);} else {$el.css(o1);} 
    $el.attr({boOn:bo1});
  }
  var o0={background:'url('+uVipp0+') no-repeat'}, o1={background:'url('+uVipp1+') no-repeat'};
    
  $el.attr({boOn:0});
  $el.css({'background':'url('+uVipp0+') no-repeat',height:'33px',width:'90px',zoom:'60%','vertical-align':'-0.5em',cursor:'pointer',display:'inline-block'}).addClass('unselectable');
  $el.on('click',function(){var t=1-$el.attr('boOn');   $el.setStat(t);});
  return $el;
}

var toggleButtonExtend=function($el){
  $el.setStat=function(bo1){
    if(bo1) {$el.css(colOn);} else {$el.css(colOff);} 
    //$el.toggleClass('on',Boolean(bo1));
    $el.attr({boOn:bo1});
  }
  var colOn={background:'#4f4'}, colOff={background:''};
    
  $el.attr({boOn:0});
  $el.css({height:'1em',width:'1em'});
  $el.on('click',function(){var t=1-$el.attr('boOn');   $el.setStat(t);});
  return $el;
}


messExtend=function($el){
"use strict"
  $el.resetMess=function(time){ 
    if(typeof time =='number')     messTimer=setTimeout('resetMess()',time*1000);
    else {$el.html(''); clearTimeout(messTimer);} 
  }
  $el.setMess=function(str,time,boRot){  
    $el.show();
    $el.html(str);  clearTimeout(messTimer); 
    if(typeof time=='number' && time>0)     messTimer=setTimeout('resetMess()',time*1000);
    if(boRot) $el.append($imgBusy);
  };
  var messTimer;
  //$el.addClass('message').css({'z-index':8100,position:'fixed'}); 
  $el.css({border:'black 1px solid',bottom:'0%',right:'0%',margin:'0',padding:'1px','background-color':'#F7F700','font-size':'0.8em','z-index':18100,position:'fixed'}); 
  $el.click(function(){$el.hide();});
  return $el;
}



/*******************************************************************************************************************
 *******************************************************************************************************************
 *
 * History stuff
 *
 *******************************************************************************************************************
 *******************************************************************************************************************/

histGoTo=function($view){}
doHistBack=function(){  history.back();}
doHistPush=function(obj){ 
    // Set "scroll" of stateNew  (If the scrollable div is already visible) 
  var $view=obj.$view;
  var scrollT=$window.scrollTop();
  if(typeof $view.setScroll=='function') $view.setScroll(scrollT); else history.StateMy[history.state.ind].scroll=scrollT;  //$view.intScroll=scrollT; 

  if((boChrome || boOpera) && !boTouch)  history.boFirstScroll=true;

  var indNew=history.state.ind+1;
  history.pushState({hash:history.state.hash, ind:indNew}, strHistTitle, uCanonical);
  history.StateMy=history.StateMy.slice(0,indNew);
  history.StateMy[indNew]=obj;
}


doHistReplace=function(obj, indDiff){
  if(typeof indDiff=='undefined') indDiff=0;
  history.StateMy[history.state.ind+indDiff]=obj;
}
changeHist=function(obj){
  history.StateMy[history.state.ind]=obj;
}
getHistStatName=function(){
  return history.StateMy[history.state.ind].$view.toString();
}


history.distToGoal=function($viewGoal){
  var ind=history.state.ind;
  var indGoal;
  for(var i=ind; i>=0; i--){
    var obj=history.StateMy[i];
    if(typeof obj=='object') var $view=obj.$view; else continue;
    if($view===$viewGoal) {indGoal=i; break;}
  }
  
  var dist; if(typeof indGoal!='undefined') dist=indGoal-ind;
  return dist;
}
history.fastBack=function($viewGoal, boRefreshHash){
  var dist=history.distToGoal($viewGoal);
  if(dist) {
    if(typeof boRefreshHash!='undefined') history.boResetHashCurrent=boRefreshHash;
    history.go(dist);
  }
}





/*******************************************************************************************************************
 * top-line-div
 *******************************************************************************************************************/
var loginInfoExtend=function($el){
"use strict"
  $el.setStat=function(){
    var boIn=Boolean(Object.keys(userInfoFrDB).length);
    if(boIn){
      $spanName.html(userInfoFrDB.name);
      $el.show();
    }else {
      $el.hide(); 
    }
  }
  $el.cb=null;
  var $spanName=$('<span>'); 
  //var $logoutButt=$('<a>').prop({href:''}).text(langHtml.loginInfo.logoutButt).css({'float':'right'});
  var $logoutButt=$('<button>').text(langHtml.loginInfo.logoutButt).css({'float':'right','font-size':'90%'});
  $logoutButt.click(function(){ 
    //userInfoFrDB={}; 
    var vec=[['logout',1, $el.cb]];
    majax(oAJAX,vec);
    return false;
  });
  $el.append($spanName,$logoutButt);
  return $el;
}




/*******************************************************************************************************************
 *******************************************************************************************************************
 *
 * Main div
 *
 *******************************************************************************************************************
 *******************************************************************************************************************/

var mainDivExtend=function($el){
"use strict"
  $el.toString=function(){return 'mainDiv';}

  $el.setUp=function(){
    var boIn=Boolean(Object.keys(userInfoFrDB).length);
    $loggedOutDiv.toggle(!boIn);
    $loggedInDiv.toggle(boIn);
  }

  var cssCol={display:'inline-block','box-sizing': 'border-box','text-align':'center',padding:'1em',flex:1}; //width:'50%',


    //
    // $loggedOutDiv
    //

  var $buttonSignIn=$('<button>').addClass('highStyle').append('Sign in').click(function(){
    doHistPush({$view:$loginMixDiv});
    $loginMixDiv.setVis();
  });
  var $buttonCreateAccount=$('<button>').addClass('highStyle').append('Create an account').click(function(){
    doHistPush({$view:$createUserPreDiv});
    $createUserPreDiv.setVis();
  });
  var $signInDiv=$('<div>').css(cssCol).append($buttonSignIn);
  var $createAccountDiv=$('<div>').css(cssCol).css({'border-left':'2px solid grey','vertical-align':'top'}).append($buttonCreateAccount);

  var $divWhatIsOpen=$('<div>').append();
  var $imgIdPlaceCompare=$('<img>').css({width:'80%', display:'block', margin:'1em auto'}).prop({src:uIdPlaceCompare});  
  var $aMoreInfo=$('<a>').css({display:'block', margin:'3em auto', 'text-align':'center'}).prop({href:"http://www.emagnusandersson.com/idPlace"}).append("More info");
  var $headComparing=$('<h3>').append("Comparing some common ID providers:").css({'text-align':'center'});

  var $divRowA=$('<div>').append($signInDiv,$createAccountDiv).css({display: 'flex', 'justify-content':'space-around'});
  var $loggedOutDiv=$('<div>').css({'margin-top':'1em'}).append($divRowA, $headComparing, $imgIdPlaceCompare, $aMoreInfo);

    //
    // $loggedInDiv
    //

  var boShowDevStuff=getItem('boShowDevStuff');  if(boShowDevStuff===null)  boShowDevStuff=false;
  $el.devStuffToggleEventF=function(){
    var now=Date.now(); if(now>timeSpecialR+1000*10) {timeSpecialR=now; nSpecialReq=0;}    nSpecialReq++;
    if(nSpecialReq==3) { nSpecialReq=0;boShowDevStuff=!boShowDevStuff; $divDev.toggle(boShowDevStuff);  setItem('boShowDevStuff',boShowDevStuff);  }
  }
  var timeSpecialR=0, nSpecialReq=0;


  var $buttonUserSetting=$('<button>').addClass('highStyle').append('Settings').click(function(){ //.css({display: 'block'})
    doHistPush({$view:$userSettingDiv});
    $userSettingDiv.setVis();
    $el.devStuffToggleEventF();
  });
  var $buttonUserAppList=$('<button>').addClass('highStyle').append('Apps you use').click(function(){ //.css({display: 'block'})
    doHistPush({$view:$userAppList});
    $userAppList.setVis();
  });
  var $buttonDevAppList=$('<button>').addClass('highStyle').append('Apps you own').click(function(){ // .css({display: 'block'})
    doHistPush({$view:$devAppList});
    $devAppList.setVis();
  });
  var $divA=$('<div>').append($buttonUserSetting), $divB=$('<div>').append($buttonUserAppList),  $divDev=$('<div>').append($buttonDevAppList); 

  var $DivAll=$([]).push($divA, $divB, $divDev).css(cssCol);
  $([]).push($divB, $divDev).css({'border-left':'2px solid grey'});

  var $divRowB=$('<div>').append($DivAll).css({display: 'flex', 'justify-content':'space-around'});

  var $loggedInDiv=$('<div>').css({'margin-top':'1em'}).append($divRowB);
  $divDev.toggle(boShowDevStuff);
  //if(boShowDevStuff) $divDev.show(); else   $divDev.hide();


  var $infoLink=$('<a>').prop({href:"http://www.emagnusandersson.com/idPlace"}).append("More info");
  var $menuA=$('<div>').append($infoLink).css({padding:'0 0.3em 0 0', overflow:'hidden', 'max-width':menuMaxWidth+'px', 'text-align':'center', margin:'.3em auto .4em'}); 

  var $divCont=$el.$divCont=$('<div>').css({padding:'0 0.3em 0 0', overflow:'hidden', 'max-width':menuMaxWidth+'px', 'text-align':'left', margin:'1em auto'});
  $el.$divCont.append($loggedOutDiv, $loggedInDiv);
  $el.$fixedDiv=$('<div>').append($menuA).css(cssFixed);

  $el.append($el.$divCont, $el.$fixedDiv);
  return $el;
}

/*******************************************************************************************************************
 *******************************************************************************************************************
 *
 * Authentication stuff
 *
 *******************************************************************************************************************
 *******************************************************************************************************************/
window.loginReturn=function(strQS, strHash){
  var params=parseQS(strQS.substring(1));
  if(!('state' in params) || params.state !== OAuth.nonce) {    alert('Invalid state parameter.'); return;  } 
  OAuth.cb(params);
}
var OAuthT=function(){
  this.urlOAuth={fb:"https://www.facebook.com/v2.5/dialog/oauth", google: "https://accounts.google.com/o/oauth2/v2/auth"};
  this.createUrlNSetStatVar=function(IP, uRedir, fun, caller, cb){
    $.extend(this, {IP:IP, fun:fun, caller:"index", cb:cb});
    this.nonce=randomHash(); //CSRF protection
    var arrQ=["client_id="+site.client_id[IP], "redirect_uri="+encodeURIComponent(uRedir), "state="+this.nonce, "response_type=code"];
    if(IP=='fb')   arrQ.push("scope=email", "display=popup"); //
    else if(IP=='google')    arrQ.push("scope=profile,email");
    else if(IP=='idplace')    arrQ.push("scope=name,email");
    //arrQ.push("auth_type=reauthenticate");
    return this.urlOAuth[IP]+'?'+arrQ.join('&');
  }
}
window.OAuth=new OAuthT();


loginDivExtend=function($el){
  var popupWin=function(IP) {
    var uPop=OAuth.createUrlNSetStatVar(IP, uSite+'/'+leafLoginBack, 'userFun', "index", $el.loginReturn);
    $el.winMy=window.open(uPop, '_blank', 'width=580,height=400'); // , '_blank', 'popup', 'width=580,height=400'
    
    if($el.winMy && !$el.winMy.closed){
      $mess.empty();  $mess.append('Signing you in ',$imgBusy);
      clearInterval(timerClosePoll);
      timerClosePoll = setInterval(function() { if($el.winMy.closed){ clearInterval(timerClosePoll); $mess.html('Sign-in canceled'); }  }, 500);  
    }
  }
  $el.loginReturn=function(params){
    if('error' in params) { setMess(params.error); }
    else{
      if('code' in params) { 
        var timeZone=new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)[1];
        var oT={IP:OAuth.IP, fun:OAuth.fun, caller:OAuth.caller, timeZone:timeZone}; oT.code=params.code;
        var vec=[ ['loginGetGraph', oT], ['specSetup',{idApp:idApp}, $loginMixDiv.cb]];   majax(oAJAX,vec);
      } else setMess('no code parameter in response');
    }
    $el.myReset();
  }

  var timerClosePoll=null;
  $el.myReset=function(){     $mess.empty(); clearInterval(timerClosePoll);   }

  var $mess=$('<span>').css({"margin-left":"0.3em"});
  var strButtonSize='2em';
  var $imgFb=$('<img>').click(function(){popupWin('fb');}).prop({src:uFb});
  var $imgGoogle=$('<img>').click(function(){popupWin('google');}).prop({src:uGoogle});
  var $Im=$([]).push($imgFb).css({align:'center', display:'block', 'margin-top': '0.7em'}); //  , $imgGoogle    position:'relative',top:'0.4em',heigth:strButtonSize,width:strButtonSize
  $el.append($Im, $mess); //,$fbHelp
  return $el;
}



var loginMixDivExtend=function($el){
"use strict"
  $el.toString=function(){return 'loginMixDiv';}
  $el.myToggle=function(boOn){
    if(boOn) $el.show();else $el.hide(); if(boOn) $inpPass.focus();
  }
  var login=function(){  
    var tmp=SHA1($inpPass.val()+strSalt);
    var vec=[['login',{email:$inpEmail.val(), password:tmp}], ['specSetup',{idApp:idApp}, $el.cb]];   majax(oAJAX,vec); 
    $inpPass.val('');
    return false;
  }
  var forgotClickF=function(){ 
    $forgottPWPop.openFunc();
    return false;
  }
  $el.setUp=function(){ $divRight.append($loginDiv);  }
  $el.cb=null;
  var $h1=$('<h1>').append('Sign in');

  var $form=$('#loginTraditional');//.detach();
  var $messDiv=$('<div>').css({color:'red'});
/*  var $labEmail=$('<label>').append('Email'), $inpEmail=$('<input type=email>');
  var $labPass=$('<label>').append('Password'); 
  var $inpPass=$('<input type=password>'); 
*/
  var $labEmail=$form.children("label[name='email']"), $inpEmail=$form.children("input[name='email']").css({'max-width':'100%'});
  var $labPass=$form.children("label[name='password']"), $inpPass=$form.children("input[name='password']").css({'max-width':'100%'});
  var $buttLogin=$form.children("button[name='submit']").css({"margin-top": "1em"}).click(login);
  /*$form.submit(function(event){
    login();
    //event.preventDefault();
  });*/
  //var $buttForgot=$('<button>').append('Forgot your password').click(forgotClickF);
  var $buttForgot=$('<a>').prop({href:''}).text('Forgot your password?').click(forgotClickF);
  var cssCol={display:'inline-block','box-sizing': 'border-box',padding:'1em',flex:1}; //width:'50%',

  var $divForgot=$('<div>').css({'margin-top':'1em'}).append($buttForgot);
 
  //var $buttLogin=$('<button>').append('Sign in').click(login); 
  //var $divLeft=$('<div>').append($messDiv,    $labEmail, $inpEmail,    $labPass, $inpPass,     $buttLogin, $divForgot);
  var $divLeft=$('<div>').append($messDiv,    $form,     $divForgot); //
  //$divLoginTraditional.prepend($messDiv).append($buttLogin, $divForgot);
  //$divLeft.find('input[type=text],[type=email],[type=number],[type=password]').keypress( function(e){ if(e.which==13) {login();return false;}} ).css({display:'block'});
  $divLeft.find('input[type=text],[type=email],[type=number],[type=password]').keypress( function(e){ if(e.which==13) {
    //login(); 
  }} ).css({display:'block'});
  var $divRight=$('<div>');
  $divLeft.css(cssCol); $divRight.css(cssCol).css({'text-align':'center', 'border-left':'2px solid grey'});
  var $divRow=$('<div>').append($divLeft, $divRight).css({display: 'flex', 'justify-content':'space-around'});
  var $divCont=$('<div>').append($h1, $divRow);
  $el.append($divCont);

  return $el;
}




var createUserPreDivExtend=function($el){
"use strict"
  $el.toString=function(){return 'createUserPreDiv';}
  $el.setUp=function(){ $divRight.append($loginDiv);  }
  var cssCol={display:'inline-block','box-sizing': 'border-box',padding:'1em',flex:1}; //width:'50%',
  var $buttonCreateAccount=$('<button>').addClass('highStyle').append('Create an account').click(function(){
    doHistPush({$view:$createUserDiv});
    $createUserDiv.setVis();
  });
  var $divCont=$el.$divCont=$('<div>').css({padding:'0 0.3em 0 0', overflow:'hidden', 'max-width':menuMaxWidth+'px', 'text-align':'left', margin:'1em auto'});
  


  var $h1=$('<h1>').append('Create account');
  var $headUN=$('<h2>').append('Using password');
  var $headFB=$('<h2>').append('Using Facebook');



  var $divLeft=$('<div>').append($headUN, $buttonCreateAccount);
  var $divRight=$('<div>').append($headFB);
  $divLeft.css(cssCol); $divRight.css(cssCol).css({'border-left':'2px solid grey'}); //'text-align':'center', 
  var $divRow=$('<div>').append($divLeft, $divRight).css({display: 'flex', 'justify-content':'space-around'});
  var $divCont=$('<div>').append($h1, $divRow);
  $el.append($divCont);

  return $el;
}

var divDisclaimerExtend=function($el){
"use strict"
  $el.setUp=function(boFrMem){
    var boShowDisclaimer;
    if(typeof boFrMem=='undefined') { boShowDisclaimer=$butTog.text()=='Show';}
    else { boShowDisclaimer=getItem('boShowDisclaimer'); if(boShowDisclaimer===null) boShowDisclaimer=true; }

    setItem('boShowDisclaimer',boShowDisclaimer);
    var strTxt=boShowDisclaimer?langHtml.disclaimer:'';
    $divText.html(strTxt);
    $butTog.html(boShowDisclaimer?'Hide':'Show');
  }
  var $spanLable=$('<span>').append(langHtml.disclaimerHead).css({'font-weight':'bold','margin':'0.5em 0 0.5em'});
  var $butTog=$('<button>').css({'float':'right','font-size':'60%'}).click(function(){$el.setUp();});
  var $divTop=$('<div>').append($spanLable, $butTog), $divText=$('<div>');
  $el.append($divTop, $divText);
  $el.setUp(1);
  return $el;
}

var createUserDivExtend=function($el){
"use strict"
  $el.toString=function(){return 'createUserDiv';}
  var save=function(){ 
    resetMess();  
    if($inpPass.val().trim()!==$inpPassB.val().trim()) { var tmp='Password-fields are not equal'; setMess(tmp); return; }
    var lTmp=boDbg?2:6; if($inpPass.val().trim().length<lTmp) { var tmp='The password must be at least '+lTmp+' characters long'; setMess(tmp); return; }

    var o={},boErr=0;
  /*  $Inp.each(function(i){
      var $inp=$(this),  strName=$inp.attr('name');
      var tmp=Prop[strName].saveInp($inp); if(tmp===false) boErr=1; else o[strName]=tmp; 
    }); 
    if(boErr) return;
*/
    for(var i=0;i<$Inp.length;i++){
      var $inp=$Inp.eq(i),  strName=$inp.attr('name');
      //var tmp=Prop[strName].saveInp($inp); if(tmp===false) return; else o[strName]=tmp; 
      var tmp=Prop[strName].saveInp($inp); if(tmp[0]) {setMess(tmp[0]); return; } else o[strName]=tmp[1];
    }; 
    $.extend(o, {password:SHA1($inpPass.val().trim()+strSalt)});

    var vec=[['createUser',o,$el.setUp], ['specSetup',{idApp:idApp}, $el.cb]];   majax(oAJAX,vec); 
    $inpPass.val(''); $inpPassB.val('');
    setMess('',null,true); 
  }

  $el.createInputs=function(){
    for(var i=0;i<$el.StrProp.length;i++){      
      var strName=$el.StrProp[i];
      var $imgH=''; if(strName in helpBub ) {    var $imgH=$imgHelp.clone();   popupHoverM($imgH,helpBub[strName]);         }

      var $lab=$('<label>').append(calcLabel(langHtml.label, strName));
      var $inp=Prop[strName].crInp().attr('name',strName);
      $Inp.push($inp);
      var strObli=Prop[strName].boObli?' *':'';
      $divCont.append($lab, $imgH, $inp); //, strObli
    }
    //$divCont.find('input[type=text],[type=email],[type=number]').keypress( function(e){ if(e.which==13) {save();return false;}} );
    var $tmp=$divCont.find('input[type=number]').prop({min:0});
    $Inp.css({display:'block', 'margin-bottom':'0.5em'});

  }
  $el.setUp=function(){
    $Inp.each(function(i){
      var $inp=$(this), strName=$inp.attr('name'); Prop[strName].setInp($inp);
    });
    return true; 
  }
  $el.cb=null;

  var $Inp=$([]);
  $el.StrProp=['name', 'email', 'telephone',   'country', 'federatedState', 'county', 'city', 'zip', 'address', 'idNational', 'birthdate', 'motherTongue', 'gender'];

  var $divCont=$el.$divCont=$('<div>').css({padding:'0 0.3em 0 0', overflow:'hidden', 'max-width':menuMaxWidth+'px', 'text-align':'left', margin:'1em auto'});
  

  
  var $h1=$('<h1>').append('Create account');  
  $el.$divDisclaimerW=$('<div>').css({'margin':'0em', 'padding':'0em'});
  var $messDiv=$('<div>').css({color:'red'});
  var $obliDiv=$('<div>').append('* = obligatory');
  var $labPass=$('<label>').append('Password'),  $labPassB=$('<label>').append('Password again');  
  var $inpPass=$('<input type=password placeholder="at least 6 characters">'),  $inpPassB=$('<input type=password>');
  $inpPass.add($inpPassB).css({display:'block', 'margin-bottom':'0.5em'});

  $divCont.append($h1, $el.$divDisclaimerW, $messDiv,   $labPass, $inpPass, $labPassB, $inpPassB);  //, $obliDiv
  $el.createInputs();

  var $spanLabel=$('<span>').append(langHtml.CreateAccount).css({'float':'right',margin:'0.2em 0 0 0'}); 
  var $buttonSave=$("<button>").addClass('highStyle').text(langHtml.Create).click(save);
  var $menuA=$('<div>').append($buttonSave,$spanLabel).css({padding:'0 0.3em 0 0', overflow:'hidden', 'max-width':menuMaxWidth+'px', 'text-align':'left', margin:'.3em auto .4em'}); 

  $el.$fixedDiv=$('<div>').append($menuA).css(cssFixed);
  $el.append($el.$divCont, $el.$fixedDiv);
  return $el;
}


var deleteAccountPopExtend=function($el){
"use strict"
  $el.toString=function(){return 'deleteAccountPop';}
  //var $el=popUpExtend($el);
  var $yes=$('<button>').addClass('highStyle').html(langHtml.Yes).click(function(){
    //var vec=[['VDelete',1,function(data){doHistBack();doHistBack();}]];   majax(oAJAX,vec);
    userInfoFrDB={};
    var vec=[['UDelete',1, function(data){
      history.fastBack($mainDiv,true);
    }]];   majax(oAJAX,vec);
  });
  var $cancel=$('<button>').addClass('highStyle').html(langHtml.Cancel).click(doHistBack);
  //$el.append(langHtml.deleteBox.regret,'<br>',$yes,$cancel);
  //$el.css({padding:'1.1em',border:'1px solid'});
  $el.setVis=function(){
    $el.show();   
    return true;
  }

  var $h1=$('<div>').append(langHtml.deleteBox.regret);
  var $blanket=$('<div>').addClass("blanket");
  var $centerDiv=$('<div>').append($h1,'<br>',$cancel,$yes);
  $centerDiv.addClass("Center").css({'width':'20em', height:'9em', padding:'1.1em'})
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); //

  return $el;
}
var verifyEmailPopExtend=function($el){
"use strict"
  $el.toString=function(){return 'verifyEmailPop';}
  var okF=function(){
    var vec=[['verifyEmail',1, okRet]];   majax(oAJAX,vec); 
    //var vec=[['verifyEmail',{email:userInfoFrDB.email}, okRet]];   majax(oAJAX,vec);
    
  };
  $el.openFunc=function(){
    doHistPush({$view:$verifyEmailPop});
    $spanEmail.html(userInfoFrDB.email);
    $el.setVis();
  }
  $el.setVis=function(){
    $el.show();   
    return true;
  }
  var okRet=function(data){
    if(data.boOK) {  doHistBack(); }
  }

  var $h1=$('<h3>').append('Verify emailaddress');
  var $spanEmail=$('<span>').css({'font-weight': 'bold'});
  var $pTxt=$('<p>').append('Send a verification email to ',$spanEmail);
  var $pBottom=$('<p>').append('Note! The verification code sent will only be valid for 10 minutes.');
  var $blanket=$('<div>').addClass("blanket");

  var $ok=$('<button>').html(langHtml.OK).addClass('highStyle').click(okF);
  //var $cancel=$('<button>').html(langHtml.Cancel).click(doHistBack);
  var $divBottom=$('<div>').append($ok);  //$cancel,

  var $centerDiv=$('<div>').append($h1, $pTxt, $pBottom, $divBottom);
  $centerDiv.addClass("Center").css({'width':'20em', height:'15em', padding:'1.1em'});
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); //

  return $el;
}

var forgottPWPopExtend=function($el){
"use strict"
  $el.toString=function(){return 'forgottPWPop';}
  var okF=function(){
    var vec=[['verifyPWReset',{email:$inpEmail.val().trim()}, okRet]];   majax(oAJAX,vec);
    
  };
  $el.openFunc=function(){
    doHistPush({$view:$forgottPWPop});
    $el.setVis();
    $inpEmail.val('');
  }
  $el.setVis=function(){
    $el.show();   
    return true;
  }
  var okRet=function(data){
    if(data.boOK) { $inpEmail.val('');  doHistBack(); }
  }

  var $h1=$('<h3>').append('Forgott your password?');
  var $blanket=$('<div>').addClass("blanket");
  var $labEmail=$('<label>').append('Email');  
  var $inpEmail=$('<input type=email>').keypress( function(e){ if(e.which==13) {okF();return false;}} );
  $inpEmail.css({display:'block', 'margin-bottom':'0.5em'});

  var $ok=$('<button>').html(langHtml.OK).addClass('highStyle').click(okF);
  var $cancel=$('<button>').html(langHtml.Cancel).addClass('highStyle').click(doHistBack);
  var $divBottom=$('<div>').append($cancel,$ok);  //$buttonCancel,

  var $centerDiv=$('<div>').append($h1, $labEmail, $inpEmail, $divBottom);
  $centerDiv.addClass("Center").css({'width':'20em', height:'13em', padding:'1.1em'});
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); //

  return $el;
}
var changePWPopExtend=function($el){
"use strict"
  $el.toString=function(){return 'changePWPop';}
  var save=function(){ 
    resetMess();
    $messDiv.html('');
    if($inpPass.val().trim()!==$inpPassB.val().trim()) { setMess('The new password fields are not equal'); return; }
    var lTmp=boDbg?2:6; if($inpPass.val().trim().length<lTmp) { setMess('The password must be at least '+lTmp+' characters long'); return; }

    var o={passwordOld:SHA1($inpPassOld.val().trim()+strSalt), passwordNew:SHA1($inpPass.val().trim()+strSalt)};

    var vec=[['changePW',o,changePWRet]];   majax(oAJAX,vec); 
    setMess('',null,true); 
  }

  $el.openFunc=function(){
    doHistPush({$view:$changePWPop});
    $el.setVis();
    $inpPassOld.val(''); $inpPass.val(''); $inpPassB.val('');
  }
  $el.setVis=function(){
    $el.show();   
    return true;
  }
  var changePWRet=function(data){
    if(data.boOK) { $inpPassOld.val(''); $inpPass.val(''); $inpPassB.val('');  doHistBack(); }
  }

  var $h1=$('<h3>').append('Change your password');
  var $blanket=$('<div>').addClass("blanket");
  var $messDiv=$('<div>').css({color:'red'});
  var $labPassOld=$('<label>').append('Old password'), $labPass=$('<label>').append('New password'),  $labPassB=$('<label>').append('New password again');  
  var $inpPassOld=$('<input type=password>'), $inpPass=$('<input type=password placeholder="at least 6 characters">'),  $inpPassB=$('<input type=password>');

  $([]).push($inpPassOld, $inpPass, $inpPassB).css({display:'block', 'margin-bottom':'0.5em'}).keypress( function(e){ if(e.which==13) {okF();return false;}} );

  var $ok=$('<button>').html(langHtml.OK).addClass('highStyle').click(save);
  var $cancel=$('<button>').html(langHtml.Cancel).addClass('highStyle').click(doHistBack);
  var $divBottom=$('<div>').append($cancel,$ok);  //$buttonCancel,

  var $centerDiv=$('<div>').append($h1, $messDiv,   $labPassOld, $inpPassOld, $labPass, $inpPass, $labPassB, $inpPassB, $divBottom);
  $centerDiv.addClass("Center").css({'width':'20em', height:'21em', padding:'1.1em'})
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); //

  return $el;
}
var consentDivExtend=function($el){
"use strict"
  $el.toString=function(){return 'consentDiv';}

  $el.setUp=function(){
    $spanApp.html(objApp.name);
    var StrPerm=scopeAsked?scopeAsked.split(','):[];
    var $Li=$([]);
    for(var i=0;i<StrPerm.length;i++){
      var $li=$('<li>').append(StrPerm[i]);
      $Li.push($li);
    }
    $listPerm.empty().append($Li);
    var boGotOldScope=Boolean(objUApp);  $pOldPerm.toggle(boGotOldScope); if(boGotOldScope) $spanPermOld.html(objUApp.scope);
  }

  var $spanApp=$('<b>');
  var $listPerm=$('<ul>');
  var $spanPermOld=$('<b>');
  var $pA=$('<p>').append('The app: ', $spanApp, ", would like to be able to read these data: ", $listPerm);
  var $pOldPerm=$('<p>').append('(Old permission: ', $spanPermOld, ')');
  var $pB=$('<p>').append('(You can withdraw this right later.)').css({'font-size':'85%'});
  var $buttCancel=$('<button>').addClass('highStyle').append('Cancel').click(function(){
    $el.cb(false);
  });
  var $buttAllow=$('<button>').addClass('highStyle').append('Allow').click(function(){
    //var vec=[['userAppSet',{scope:scopeAsked, idApp:idApp, maxUnactivityToken:maxUnactivityToken}], ['specSetup',{idApp:idApp},$el.cb]];   majax(oAJAX,vec);
    var maxUnactivityToken=objQS.response_type=='code'?60*24*3600:2*3600;
    var vec=[['setConsent',{scope:scopeAsked, idApp:idApp, maxUnactivityToken:maxUnactivityToken}], ['specSetup',{idApp:idApp},function(data){$el.cb(true);}]];   majax(oAJAX,vec); 
  });
  $el.append($pA, $pOldPerm, $pB, $buttCancel, $buttAllow);

  return $el;
}




var uploadImageDivExtend=function($el){
  $el.toString=function(){return 'uploadImageDiv';}
  var progressHandlingFunction=function(e){      if(e.lengthComputable){   $progress.attr({value:e.loaded,max:e.total});      }      }
  var oAJAXL={
    url: leafBE,
    type: 'POST',
    xhr: function() {  // Custom XMLHttpRequest
      var myXhr = $.ajaxSettings.xhr();
      if(myXhr.upload){   myXhr.upload.addEventListener('progress',progressHandlingFunction, false);   }
      return myXhr;
    },
    beforeSend: function(){$progress.visible();},
    success: function(){    $progress.attr({value:0});  $progress.invisible();     },
    error: function(){ $progress.invisible(); errorFunc.call(this,arguments);},//errorHandler=function(){setMess('error uploading',5);},
    //Options to tell jQuery not to process data or worry about content-type.
    cache: false,
    contentType: false,
    processData: false,
    headers:{'x-type':'single'}
  }
  oAJAXL.boFormData=1;

  var setMess=function(str) {$divMess.html(str);}
  var clearMess=function() {$divMess.html('');}
  var toggleVerified=function(boT){  boT=Boolean(boT);   $uploadButton.prop("disabled",!boT); }
  var verifyFun=function(){  
    clearMess();
    var arrFile=this.files;
    if(arrFile.length>1) {setMess('Max 1 file',5); toggleVerified(0); return;}
    if(arrFile.length==0) {setMess('No file selected',5); toggleVerified(0); return;}
    objFile=arrFile[0];
    if(objFile.size==0){ setMess("objFile.size==0",5); toggleVerified(0); return; }
    var tmpMB=(objFile.size/(1024*1024)).toFixed(2);

    toggleVerified(1);
  }
  var sendFun=function(){
    clearMess();
    if(boFormDataOK==0) {alert("Your browser doesn't support FormData"); return; };
    var formData = new FormData();
    formData.append("type", 'single');
    formData.append("kind", strKind);
    formData.append("fileToUpload[]", objFile);
     
    majax(oAJAXL,[['uploadImage',formData,sendFunRet]]);
    setMess('Uploading ...');
    $uploadButton.prop("disabled",true);
  }
  var sendFunRet=function(data){
      if('strMessage' in data) setMess(data.strMessage); $progress.invisible(); $uploadButton.prop("disabled",false);
      callback(data);
  }
  $el.openFunc=function(strKindT, callbackT){
    strKind=strKindT; callback=callbackT; setMess('');  $inpFile.val('');
    doHistPush({$view:$uploadImageDiv});
    $el.setVis();    
  };
  $el.setVis=function(){
    $el.show();   
    return true;
  }
  var strKind='u', callback;
  //$el=popUpExtend($el);  
  //$el.css({'max-width':'20em', padding: '0.3em 0.5em 1.2em 0.6em'});

  var $head=$('<h3>').append('Upload Image: ').css({'font-weight':'bold'});
  var $formFile=$('<form >'); //enctype="multipart/form-data"
  var $inpFile=$('<input type=file name=file id=file accept="image/*">').css({background:'lightgrey'});
  //var $inpUploadButton=$('<input type="button" value="Upload">');
  var $uploadButton=$('<button>').text('Upload').addClass('highStyle').prop("disabled",true).css({'margin-right':'0.5em'}); //, 'float':'right'
  var $progress=$('<progress max=100, value=0>').css({'display':'block','margin-top':'1em'}).invisible();
  var $divMess=$('<div>').css({'margin-top':'1.2em', 'min-height':'1em'});
  
  var objFile;
  $inpFile.change(verifyFun).click(function(){$uploadButton.prop("disabled",true);});
  $formFile.append($inpFile);   $formFile.css({display:'inline'});
   

  var $closeButton=$('<button>').append('Close').addClass('highStyle').click(doHistBack);
  var $menuBottom=$('<div>').append($closeButton, $uploadButton).css({'margin-top':'1.2em'});

  //$el.append($head, $formFile, $progress, $divMess,$menuBottom); 

  var $blanket=$('<div>').addClass("blanket");
  var $centerDiv=$('<div>').append($head, $formFile, $progress, $divMess,$menuBottom);
  $centerDiv.addClass("Center").css({'max-width':'21em', height:'15em', padding: '0.3em 0.5em 1.2em 0.6em'})
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); //

  $uploadButton.click(sendFun);
  return $el;
}


var userSettingDivExtend=function($el){
"use strict"
  $el.toString=function(){return 'userSetting';}
  var save=function(){ 
    resetMess();  
    var o={},boErr=0;
    $Inp.each(function(i){
      var $inp=$(this),  strName=$inp.attr('name');
      //var tmp=Prop[strName].saveInp($inp); if(tmp===false) boErr=1; else o[strName]=tmp; 
      var tmp=Prop[strName].saveInp($inp); if(tmp[0]) {setMess(tmp[0]); return; } else o[strName]=tmp[1];
    }); 
    if(boErr) return;
    var vec=[['UUpdate',o], ['specSetup',{},$el.setUp]];   majax(oAJAX,vec);
    setMess('',null,true); 
  }

  $el.createInputs=function(){
    for(var i=0;i<$el.StrProp.length;i++){      
      var strName=$el.StrProp[i];
      var $imgH=''; if(strName in helpBub ) {    var $imgH=$imgHelp.clone();   popupHoverM($imgH,helpBub[strName]);         }

      var $lab=$('<label>').append(calcLabel(langHtml.label, strName));
      var $spanLastChange=Prop[strName].crLastChangeSpan().attr('name',strName);
      var $inp=Prop[strName].crInp().attr('name',strName);
      $SpanLastChange.push($spanLastChange);  $Inp.push($inp);
      $divCont.append($lab,$imgH,$spanLastChange,$inp);
    }
    //$divCont.find('input[type=text],[type=email],[type=number]').keypress( function(e){ if(e.which==13) {save();return false;}} );
    var $tmp=$divCont.find('input[type=number]').prop({min:0});
    $Inp.css({display:'block', 'margin-bottom':'0.5em'});

  }
  $el.setUp=function(){
    $SpanLastChange.each(function(i){
      var $spanLastChange=$(this), strName=$spanLastChange.attr('name'); Prop[strName].setLastChange($spanLastChange);
    });  
    $Inp.each(function(i){
      var $inp=$(this), strName=$inp.attr('name'); Prop[strName].setInp($inp);
    });
    var arrTmp=getSuitableTimeUnit(unixNow()-userInfoFrDB.tCreated); arrTmp[0]=Math.round(arrTmp[0]);
    $divCreated.children('b').html(arrTmp.join(' '));
    return true; 
  }
  var $Inp=$([]), $SpanLastChange=$([]);

  $el.StrProp=['name', 'password', 'image', 'email', 'boEmailVerified', 'telephone',   'country', 'federatedState', 'county', 'city', 'zip', 'address',     'idFB', 'idNational', 'birthdate', 'motherTongue', 'gender']; //'idFB', 'idGoogle', 

  var $buttonDelete=$('<button>').append('Delete account').addClass('highStyle').click(function(){ 
    doHistPush({$view:$deleteAccountPop});
    $deleteAccountPop.setVis();
  }).css({margin:'0.2em 0 0 0'});  //'float':'right',
  var $divCreated=$('<div>').append('Account created <b></b> ago ', $buttonDelete).css({'font-size':'90%', 'border-bottom':'2px solid grey', 'margin-bottom':'1em', 'padding-bottom':'0.5em'});
  $el.$divDisclaimerW=$('<div>').css({'margin':'0em', 'padding':'0em'});

  var $divCont=$el.$divCont=$('<div>').append($divCreated,$el.$divDisclaimerW).css({padding:'0 0.3em 0 0', overflow:'hidden', 'max-width':menuMaxWidth+'px', 'text-align':'left', margin:'1em auto'}); 
  $el.createInputs();

  var $spanLabel=$('<span>').append(langHtml.Settings).css({'float':'right',margin:'0.2em 0 0 0'});
  var $buttonSave=$("<button>").text(langHtml.Save).addClass('highStyle').click(save);
  var $menuA=$('<div>').append($buttonSave, $spanLabel).css({padding:'0 0.3em 0 0', overflow:'hidden', 'max-width':menuMaxWidth+'px', 'text-align':'left', margin:'.3em auto .4em'}); 

  $el.$fixedDiv=$('<div>').append($menuA).css(cssFixed);
  $el.append($el.$divCont, $el.$fixedDiv);
  return $el;
}



var headExtend=function($el, $tableDiv, StrName, BoAscDefault, Label, strTR, strTD){  // $tableDiv must have a property $table, $tbody and nRowVisible (int)
"use strict"
  $el.setArrow=function(strName,dir){
    boAsc=dir==1;
    $sortImages.prop({src:uUnsorted});     var tmp=boAsc?uIncreasing:uDecreasing;  $el.children(strTH+'[name='+strName+']').children('img[data-type=sort]').prop({src:tmp});
  }
  $el.clearArrow=function(){
    thSorted=null, boAsc=false;  $sortImages.prop({src:uUnsorted});
  }
  var thClick=function() { 
    var $ele=$(this), strName=$ele.attr('name'); boAscDefault=$ele.data('boAscDefault');
    boAsc=(thSorted===this)?!boAsc:boAscDefault;  thSorted=this;
    $sortImages.prop({src:uUnsorted});     var tmp=boAsc?uIncreasing:uDecreasing;  $ele.children('img[data-type=sort]').prop({src:tmp});
    $tableDiv.$tbody.detach();
    var $tr=$tableDiv.$tbody.children(strTR+':lt('+$tableDiv.nRowVisible+')');
    var $tdNameSort =$tr.children(strTD+'[name='+strName+']'); 
    $tdNameSort.sortElements(function(aT, bT){               
      var $a=$(aT), $b=$(bT), a = $a.data('valSort'),  b = $b.data('valSort'),   dire=boAsc?1:-1;
      var boAStr=0,boBStr=0;
      var aN=Number(a); if(!isNaN(aN) && a!=='') {a=aN;} else {a=a.toLowerCase(); boAStr=1;}
      var bN=Number(b); if(!isNaN(bN) && b!=='') {b=bN;} else {b=b.toLowerCase(); boBStr=1;}
      if(boAStr!=boBStr) return ((boAStr<boBStr)?-1:1)*dire; 
      if(a==b) {return 0;} else return ((a<b)?-1:1)*dire; 
    }, function(){ return this.parentNode;  });
    $tableDiv.$table.append($tableDiv.$tbody);

  }
  strTR=strTR||'tr'; strTD=strTD||'td'; var strTH=strTD=='td'?'th':strTD;
  var boAsc=false, thSorted=null;

  for(var i=0;i<StrName.length;i++){
    var strName=StrName[i];  
    var $imgSort=$('<img data-type=sort>');
    var boAscDefault=(strName in BoAscDefault)?BoAscDefault[strName]:true;
    var label=(strName in Label)?Label[strName]:ucfirst(strName);
    var $h=$("<"+strTH+">").append($imgSort).addClass('unselectable').prop({UNSELECTABLE:"on"}).attr('name',strName).data('boAscDefault',boAscDefault).prop('title',label).click(thClick);
    $el.append($h);
  }

  var $th=$el.children(strTH);
  var $sortImages=$th.children('img[data-type=sort]').prop({src:uUnsorted});
  //$sortImages.css({zoom:1.5,'margin':'auto','margin-top':'0.3em','margin-bottom':'0.3em'}); // display:'block',
  $el.addClass('listHead');
  //$el.css({'font-family':'initial'});
  //$el.css({ position:'fixed'});
  
  return $el;
}

/*******************************************************************************************************************
 *******************************************************************************************************************
 *
 * userAppList, devAppList
 *
 *******************************************************************************************************************
 *******************************************************************************************************************/

userAppSetDivExtend=function($el){
"use strict"
  $el.toString=function(){return 'userAppSetDiv';}
  return $el;
}
userAppDeleteDivExtend=function($el){
"use strict"
  $el.toString=function(){return 'userAppDeleteDiv';}
  var $ok=$('<button>').html('OK').addClass('highStyle').css({'margin-top':'1em'}).click(function(){    
    var idApp=$r.attr('idApp'), vec=[['userAppDelete',{idApp:idApp},okRet]];   majax(oAJAX,vec);    
  });
  var okRet=function(data){
    if(!data.boOK) return;
    $userAppList.myRemove($r);
    doHistBack();
  }
  $el.openFunc=function(){
    $r=$(this).parent().parent(); $spanApp.text($r.data('r').appName);
    doHistPush({$view:$userAppDeleteDiv});
    $el.setVis();
  }
  $el.setVis=function(){
    $el.show(); return 1;
  }
 
  var $r;
  var $head=$('<h3>').append('Remove');
  var $spanApp=$('<span>');//.css({'font-weight': 'bold'});
  var $p=$('<div>').append($spanApp);

  var $blanket=$('<div>').addClass("blanket");
  var $centerDiv=$('<div>').addClass("Center").append($head,$p,$ok).css({height:'10em', 'min-width':'17em','max-width':'25em', padding:'0.1em'}); //,$cancel
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); 
  return $el;
}
userAppListExtend=function($el){
"use strict"
  $el.toString=function(){return 'userAppList';}
  $el.setUp=function(){};
  var TDProt={
    tAccess:{
      mySetVal:function(tT){ var arrT=getSuitableTimeUnit(unixNow()-tT);  $(this).text(Math.round(arrT[0])+arrT[1]);  }
    },
    imageHash:{
      mySetVal:function(imageHash){
        var r=$(this).parent().data('r'), $i=$(this).children(), uImg; if(r.imageHash!=null) uImg=uAppImage+r.imageHash;  else uImg=uSite+"/lib/image/anonEmptyHash.png";
        $i.prop({src:uImg});
      }
    }
  }
  var TDConstructors={
    tAccess:function(){ var $el=$('<td>');  $.extend($el[0],TDProt.tAccess);  return $el;  },
    imageHash:function(){ var $image=$('<img>').css({'vertical-align':'middle'}), $el=$('<td>').css('text-align','center').append($image);  $.extend($el[0],TDProt.imageHash);  return $el;  }
  }
  $el.myAdd=function(r){
    var $Td=$([]);
    for(var i=0;i<StrCol.length;i++) { 
      var name=StrCol[i], val=r[name], $td; if(name in TDConstructors) {$td=new TDConstructors[name](); }   else $td=$('<td>');   $Td.push($td.attr('name',name));
      //if('mySetVal' in $td[0]) { $td[0].mySetVal(val);}   else $td.append(val);
      //if('mySetSortVal' in $td[0]) { $td[0].mySetSortVal(val);}   else $td.data('valSort',val);
    }
    var $buttEdit=$('<button>').attr('name','buttonEdit').append('Edit').addClass('highStyle').click(function(){
      $userAppSetDiv.openFunc.call(this,1,1);
    });
    var $buttDelete=$('<button>').attr('name','buttonDelete').addClass('highStyle').css({'margin-right':'0.2em'}).append($imgDelete.clone()).click($userAppDeleteDiv.openFunc);
    var $tEdit=$('<td>').append($buttEdit), $tDelete=$('<td>').append($buttDelete); 
    var $r=$('<tr>').append($Td, $tDelete); $r.attr({idApp:r.idApp,appName:r.appName}).data('r',r);  //, $tEdit
    for(var i=0;i<StrCol.length;i++) { 
      var $td=$Td.eq(i), name=StrCol[i], val=r[name]
      if('mySetVal' in $td[0]) { $td[0].mySetVal(val);}   else $td.append(val);
      if('mySetSortVal' in $td[0]) { $td[0].mySetSortVal(val);}   else $td.data('valSort',val);
    }
    $tbody.append($r); 
    $el.nRowVisible=$tbody.children('tr').length;
    return $el;
  }
  $el.myRemove=function($r){
    $r.remove();  return $el; 
    $el.nRowVisible=$tbody.children('tr').length;
  }
  $el.myEdit=function(r){
    var $r=$tbody.children('[idApp='+r.idApp+']');
    $r.attr({idApp:r.idApp});
    for(var i=0;i<StrCol.length;i++) { var name=StrCol[i], val=r[name], $td=$r.children('td:eq('+i+')'); if($td[0].mySetVal) $td[0].mySetVal(val); else $td.text(val); }
    return $el;
  }
  $el.setUp=function(){
    if($el.boStale) {
      var vec=[['userAppListGet',1,setUpRet]];   majax(oAJAX,vec);
      $el.boStale=0;
    }
  }
  var setUpRet=function(data){
    var tab=data.tab||[];
    var StrColTmp=data.StrCol; 
    $tbody.empty(); 
    for(var i=0;i<tab.length;i++) {  
      var obj={}; for(var j=0;j<StrColTmp.length;j++){ obj[StrColTmp[j]]=tab[i][j];}
      tab[i]=obj;
      $el.myAdd(tab[i]);      
    }
    $el.nRowVisible=tab.length;
  }
  $el.boStale=1;

  var $tbody=$el.$tbody=$("<tbody>");
  $el.$table=$("<table>").append($tbody); //.css({width:'100%',position:'relative'});
  $el.$divCont=$("<div>").append($el.$table).css({'margin':'1em auto','text-align':'left',display:'inline-block'});

  var StrCol=['idApp', 'appName','scope', 'imageHash', 'tAccess'], BoAscDefault={tAccess:0};
  var Label={tAccess:'Accessed',imageHash:'Image'};
  var $thead=headExtend($('<thead>'),$el,StrCol,BoAscDefault,Label);
  $thead.css({background:'white', width:'inherit'});  //,height:'calc(12px + 1.2em)'
  $el.$table.prepend($thead);
  $el.nRowVisible=0;

  var $imgDelete=$imgProt.clone().prop({src:uDelete});
      // menuA
  var $spanLabel=$('<span>').append('userAppList').css({'float':'right',margin:'0.2em 0 0 0'});  
  var $menuA=$('<div>').append($spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'}); 

  $el.addClass('userAppList');
  $el.$fixedDiv=$('<div>').append($menuA).css(cssFixed);
  $el.css({'text-align':'center'});
  $el.append($el.$divCont, $el.$fixedDiv);
  return $el;
}


devAppSetDivExtend=function($el){
"use strict"
  $el.toString=function(){return 'devAppSetDiv';}
  var save=function(){
    r.appName=$inpAppName.val().trim(); if(r.appName.length==0){ setMess('empty app name',2);  return;}
    var uri=$inpURL.val().trim();  if(uri.length==0){ setMess('empty redir_uri',2);  return;}
    if(RegExp('^https?:\/\/$').test(uri)) { setMess('empty domain',2);  return;}
    if(!RegExp('^https?:\/\/').test(uri)){  uri="http://"+uri;   }
    r.redir_uri=uri;
    var objTmp=$.extend({boUpd:boUpd},r);
    var vec=[['devAppSet', objTmp, saveRet]];   majax(oAJAX,vec);
  }
  var saveRet=function(data){
    if(!data.boOK) return;
    if('idApp' in data)  { r.idApp=data.idApp; }
    if('imageHash' in data)  { r.imageHash=data.imageHash; }
    if(boUpd) {  $devAppList.myEdit(r); } 
    else {r.created=unixNow(); $devAppList.myAdd(r); }
    doHistBack();
  }
  $el.setUp=function(){
    $inpAppName.val(r.appName); $inpURL.val(r.redir_uri);
    $inpAppName.focus();  return true;
  }
  $el.openFunc=function(boUpdT,boGotData){
    boUpd=boUpdT;
    if(boGotData){
      var $r=$(this).parent().parent();
      r=$r.data('r');
    } else {r=rDefault;}
    doHistPush({$view:$devAppSetDiv});
    $el.setVis();
    $el.setUp();
  }
  $el.setVis=function(){
    $el.show(); return 1;
  }
 
  var rDefault={appName:'', redir_uri:''};
  var boUpd, r; 
  

  var $labAppName=$('<b>').append('appName');
  var $inpAppName=$('<input type=text>');
  var $labURL=$('<b>').append('Redirect uri');
  var $inpURL=$('<input type=text>');


  var $Lab=$([]).push($labAppName, $labURL).css({'margin-right':'0.5em'});
  var $Inp=$([]).push($inpAppName, $inpURL).css({display:'block',width:'100%'}).keypress( function(e){ if(e.which==13) {save();return false;}} );
  var $inpNLab=$([]).push($labAppName, $inpAppName, $labURL, $inpURL);


  var $buttonSave=$('<button>').append('Save').addClass('highStyle').click(save).css({'margin-top':'1em'});
  var $divBottom=$('<div>').append($buttonSave);  //$buttonCancel,

  var $blanket=$('<div>').addClass("blanket");
  var $centerDiv=$('<div>').addClass("Center").append($inpNLab,$divBottom).css({height:'18em', 'min-width':'17em','max-width':'30em', padding: '1.2em 0.5em 1.2em 1.2em'});
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); 
   
  return $el;
}


devAppDeleteDivExtend=function($el){
"use strict"
  $el.toString=function(){return 'devAppDeleteDiv';}
  var $ok=$('<button>').html('OK').addClass('highStyle').css({'margin-top':'1em'}).click(function(){    
    var idApp=$r.attr('idApp'), vec=[['devAppDelete',{idApp:idApp},okRet]];   majax(oAJAX,vec);    
  });
  var okRet=function(data){
    if(!data.boOK) return;
    $devAppList.myRemove($r);
    doHistBack();
  }
  $el.openFunc=function(){
    $r=$(this).parent().parent(); $spanApp.text($r.data('r').appName);
    doHistPush({$view:$devAppDeleteDiv});
    $el.setVis();
  }
  $el.setVis=function(){
    $el.show(); return 1;
  }
 
  var $r;
  var $head=$('<h3>').append('Delete');
  var $spanApp=$('<span>');//.css({'font-weight': 'bold'});
  var $p=$('<div>').append($spanApp);

  var $blanket=$('<div>').addClass("blanket");
  var $centerDiv=$('<div>').addClass("Center").append($head,$p,$ok).css({height:'10em', 'min-width':'17em','max-width':'25em', padding:'0.1em'}); //,$cancel
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); 
  return $el;
}


devAppSecretDivExtend=function($el){
"use strict"
  $el.toString=function(){return 'devAppSecretDiv';}
  var ret=function(data){
    $spanSecret.append(data.secret);
  }
  $el.openFunc=function(){
    var $r=$(this).parent().parent(), idApp=$r.data('r').idApp;
    var vec=[['devAppSecret',{idApp:idApp},ret]];   majax(oAJAX,vec);
    $spanSecret.text('');
    doHistPush({$view:$devAppSecretDiv});
    $el.setVis();
  }
  $el.setVis=function(){
    $el.show(); return 1;
  }
 
  var $head=$('<h3>').append('Secret');
  var $spanSecret=$('<span>');//.css({'font-weight': 'bold'});
  var $p=$('<div>').append($spanSecret);

  var $blanket=$('<div>').addClass("blanket");
  var $centerDiv=$('<div>').addClass("Center").append($head,$p).css({height:'10em', 'min-width':'17em','max-width':'25em', padding:'0.1em'}); //,$cancel
  if(boIE) $centerDiv.css({'width':'20em'}); 
  $el.addClass("Center-Container").append($centerDiv,$blanket); 
  return $el;
}

//idApp, name, redir_uri, imageHash, created
devAppListExtend=function($el){
"use strict"
  $el.toString=function(){return 'devAppList';}
  var TDProt={
    created:{
      mySetVal:function(tCreated){ var arrT=getSuitableTimeUnit(unixNow()-tCreated);  $(this).text(Math.round(arrT[0])+arrT[1]);  }
    },
    imageHash:{
      mySetVal:function(imageHash){
        var r=$(this).parent().data('r'), $i=$(this).children(), uImg; if(r.imageHash!=null) uImg=uAppImage+r.imageHash;  else uImg=uSite+"/lib/image/anonEmptyHash.png";
        $i.prop({src:uImg});
      }
    }
  }
  var TDConstructors={
    created:function(){ var $el=$('<td>');  $.extend($el[0],TDProt.created);  return $el;  },
    imageHash:function(){
      var $image=$('<img>').css({'vertical-align':'middle'}).click(setImage), $el=$('<td>').css('text-align','center').append($image);  $.extend($el[0],TDProt.imageHash);  return $el;  }
  }
  var setImage=function(){
    var $i=$(this), $r=$(this).parent().parent(), r=$r.data('r');
    var uploadCallback=function(data){
      var imageHash=null; if('imageHash' in data) imageHash=data.imageHash;
      var uImg; if(imageHash!=null) uImg=uAppImage+imageHash;  else uImg=uSite+"/lib/image/anonEmptyHash.png";
      if('imageHash' in data)  $i.prop({src:uImg}); 
      doHistBack();
    }
    $uploadImageDiv.openFunc('a'+r.idApp, uploadCallback);

  }
  $el.myAdd=function(r){
    var $Td=$([]);
    for(var i=0;i<StrCol.length;i++) { 
      var name=StrCol[i], val=r[name], $td; if(name in TDConstructors) {$td=new TDConstructors[name](); }   else $td=$('<td>');   $Td.push($td.attr('name',name));
      //if('mySetVal' in $td[0]) { $td[0].mySetVal(val);}   else $td.append(val);
      //if('mySetSortVal' in $td[0]) { $td[0].mySetSortVal(val);}   else $td.data('valSort',val);
    }
    var $buttEdit=$('<button>').attr('name','buttonEdit').append('Edit').addClass('highStyle').click(function(){
      $devAppSetDiv.openFunc.call(this,1,1);
    });
    var $buttSecret=$('<button>').attr('name','buttonSecret').append('Secret').addClass('highStyle').click(function(){
      $devAppSecretDiv.openFunc.call(this);
    });
    var $buttDelete=$('<button>').attr('name','buttonDelete').addClass('highStyle').css({'margin-right':'0.2em'}).append($imgDelete.clone()).click($devAppDeleteDiv.openFunc);
    var $tEdit=$('<td>').append($buttEdit), $tSecret=$('<td>').append($buttSecret), $tDelete=$('<td>').append($buttDelete); 
    var $r=$('<tr>').append($Td, $tSecret, $tEdit, $tDelete); $r.attr({idApp:r.idApp,appName:r.appName}).data('r',r);
    for(var i=0;i<StrCol.length;i++) { 
      var $td=$Td.eq(i), name=StrCol[i], val=r[name]
      if('mySetVal' in $td[0]) { $td[0].mySetVal(val);}   else $td.append(val);
      if('mySetSortVal' in $td[0]) { $td[0].mySetSortVal(val);}   else $td.data('valSort',val);
    }
    $tbody.append($r); 
    $el.nRowVisible=$tbody.children('tr').length;
    return $el;
  }
  $el.myRemove=function($r){
    $r.remove();  return $el; 
    $el.nRowVisible=$tbody.children('tr').length;
  }
  $el.myEdit=function(r){
    var $r=$tbody.children('[idApp='+r.idApp+']');
    $r.attr({idApp:r.idApp});
    for(var i=0;i<StrCol.length;i++) { var name=StrCol[i], val=r[name], $td=$r.children('td:eq('+i+')'); if($td[0].mySetVal) $td[0].mySetVal(val); else $td.text(val); }
    return $el;
  }
  $el.setUp=function(){
    if($el.boStale) {
      var vec=[['devAppListGet',1,setUpRet]];   majax(oAJAX,vec);
      $el.boStale=0;
    }
  }
  var setUpRet=function(data){
    var tab=data.tab||[];
    var StrColTmp=data.StrCol; 
    $tbody.empty(); 
    for(var i=0;i<tab.length;i++) {  
      var obj={}; for(var j=0;j<StrColTmp.length;j++){ obj[StrColTmp[j]]=tab[i][j];}
      tab[i]=obj;
      $el.myAdd(tab[i]);      
    }
    $el.nRowVisible=tab.length;
  }
  $el.boStale=1;

  var $tbody=$el.$tbody=$("<tbody>");
  $el.$table=$("<table>").append($tbody); //.css({width:'100%',position:'relative'});
  $el.$divCont=$("<div>").append($el.$table).css({'margin':'1em auto','text-align':'left',display:'inline-block'});

  var StrCol=['idApp','appName','redir_uri', 'imageHash', 'created'], BoAscDefault={created:0};
  var Label={imageHash:'Image', created:'Age'};
  var $thead=headExtend($('<thead>'),$el,StrCol,BoAscDefault,Label);
  $thead.css({background:'white', width:'inherit'});  //,height:'calc(12px + 1.2em)'
  $el.$table.prepend($thead);
  $el.nRowVisible=0;

  var $imgDelete=$imgProt.clone().prop({src:uDelete});
      // menuA
  var $buttonAdd=$("<button>").append('Add').addClass('highStyle fixWidth').css({'margin-left':'0.8em','margin-right':'1em'}).click(function(){
    $devAppSetDiv.openFunc.call({},0,0);
  });
  var $spanLabel=$('<span>').append('devAppList').css({'float':'right',margin:'0.2em 0 0 0'});  
  var $menuA=$('<div>').append($buttonAdd,$spanLabel).css({padding:'0 0.3em 0 0',overflow:'hidden','max-width':menuMaxWidth+'px','text-align':'left',margin:'.3em auto .4em'}); 

  $el.addClass('devAppList');
  $el.$fixedDiv=$('<div>').append($menuA).css(cssFixed);
  $el.css({'text-align':'center'});
  $el.append($el.$divCont, $el.$fixedDiv);
  return $el;
}




majax=function(oAJAX,vecIn){  // Each argument of vecIn is an array: [serverSideFunc, serverSideFuncArg, returnFunc]
"use strict"
  var makeRetF=function(vecT){ return function(data,textStatus,jqXHR){
      var dataArr=data.dataArr;  // Each argument of dataArr is an array, either [argument] or [altFuncArg,altFunc]
      delete data.dataArr;
      beRet(data,textStatus,jqXHR);
      for(var i=0;i<dataArr.length;i++){
        var r=dataArr[i];
        if(r.length==1) {var f=vecT[i][2]; if(f) f(r[0]);} else { window[r[1]].call(window,r[0]);   }
      }
    };
  }

  var oOut=$.extend(true, [], oAJAX);
  if('boFormData' in oAJAX && oAJAX.boFormData){
    var formData=vecIn[0][1]; vecIn[0][1]=0; // First element in vecIn contains the formData object. Rearrange it as "root object" and add the remainder to a property 'vec'
    var vecMod=$.extend(true, [], vecIn);
    for(var i=0; i<vecMod.length; i++){delete vecMod[i][2];}
    vecMod.push(['CSRFCode',CSRFCode]);  
    oOut.data=formData; oOut.data.append('vec', JSON.stringify(vecMod));
  }else{
    var vecMod=$.extend(true, [], vecIn);
    for(var i=0; i<vecMod.length; i++){delete vecMod[i][2];}
    vecMod.push(['CSRFCode',CSRFCode]);  
    oOut.data=JSON.stringify(vecMod);
  }
  $busyLarge.show();
  //if(oAJAX.crossDomain) tmp=o;
  oOut.success=makeRetF(vecIn);  return $.ajax(oOut);
}

beRet=function(data,textStatus,jqXHR){
"use strict"
  if(typeof jqXHR!='undefined') var tmp=jqXHR.responseText;
  for(var key in data){
    window[key].call(this,data[key]); 
  }
  $busyLarge.hide();
}

GRet=function(data){
"use strict"
  var tmp;
  //if(typeof userInfoFrDB=='undefined') window.userInfoFrDB={};
  tmp=data.strMessageText;   if(typeof tmp!="undefined") setMess(tmp);
  tmp=data.CSRFCode;   if(typeof tmp!="undefined") CSRFCode=tmp;
  //tmp=data.userInfoFrDB; if(typeof tmp!="undefined") {  for(var key in tmp){ userInfoFrDB[key]=tmp[key]; }   } 
  tmp=data.userInfoFrDB; if(typeof tmp!="undefined") {  userInfoFrDB=tmp; }
  tmp=data.objApp; if(typeof tmp!="undefined") {  objApp=tmp; }  
  tmp=data.objUApp; if(typeof tmp!="undefined") {  objUApp=tmp; }  
  $loginInfo.setStat();
 
}

/*******************************************************************************************************************
 * Plugin (Prop)
 *******************************************************************************************************************/


 // $el.StrProp=['name', 'password', 'image', 'email', 'telephone',   'country', 'federatedState', 'county', 'city', 'zip', 'address',     'idFB', 'idGoogle', 'idNational', 'birthdate', 'motherTongue', 'gender'];
PropExtend=function(){
  var saveInpDefault=function($inp){ return [null, $inp.val().trim()];}
  var crInpDefault=function(){
    var strType=('strType' in this)?'type='+this.strType:'', $inp=$('<input '+strType+'>');
    if('inpW' in this)  $inp.css({width:this.inpW+'em'});
    return $inp;
  }
  var setInpDefault=function($inp){  var strName=$inp.attr('name');   $inp.val(userInfoFrDB[strName]);  }

  var crLastChangeSpanDefault=function(){
    var $bold=$('<b>'), $span=$('<span>').append(', Last changed ', $bold, ' ago').css({'font-size':'90%'});
    return $span;
  }
  var setLastChangeDefault=function($span){
    var strName='t'+ucfirst($span.attr('name')), arrTmp=getSuitableTimeUnit(unixNow()-userInfoFrDB[strName]); arrTmp[0]=Math.round(arrTmp[0]);
    $span.children('b').html(arrTmp.join(' '));
  }


  var StrProp=Object.keys(Prop);
  for(var i=0;i<StrProp.length;i++){
    var strName=StrProp[i];  
    $.extend(Prop[strName], {
      saveInp:saveInpDefault, crInp:crInpDefault, setInp:setInpDefault,
      crLastChangeSpan:crLastChangeSpanDefault,
      setLastChange:setLastChangeDefault
    });
  }

  var tmpCrF=function(){return $('<button>').addClass('highStyle').append('Fetch');};
  var tmpSetF=function(){};


    // text
  $.extend(Prop.name, {strType:'text',inpW:9});


    // password
  $.extend(Prop.password, {
    strType:'password',
    inpW:9,
    crInp:function(){return $('<button>').addClass('highStyle').append('Change').click(function(){
      $changePWPop.openFunc();
    });},
    crLastChangeSpan:function(){return $('<span>'); },
    setLastChange:function(){ }
  });


    // misc
  //$.extend(Prop.idFB, { crInp:tmpCrF, setInp:tmpSetF });
  $.extend(Prop.idGoogle, { crInp:tmpCrF, setInp:tmpSetF });
  $.extend(Prop.telephone, {strType:'tel'});
  $.extend(Prop.email, {strType:'email'});


    // idFB
  var tmpCrInp=function(){
    var $c=$('<span>');
    $c[0].$nr=$('<span>');
    $c[0].$butDelete=$('<button>').addClass('highStyle').append('Clear').click(function(){
      var vec=[['deleteExtId', {kind:'fb'}], ['specSetup',{}, $userSettingDiv.setUp]];   majax(oAJAX,vec); 
    });
    $c[0].$buttFetch=$('<button>').addClass('highStyle').html('Fetch').click(function(){
      var uPop=OAuth.createUrlNSetStatVar('fb', uSite+'/'+leafLoginBack, 'fetchFun', "index", loginReturnLocal);
      window.open(uPop, '_blank', 'width=580,height=400'); //, '_blank', 'popup', 'width=580,height=400'
    });
    $c[0].$thumb=$('<img>').css({'vertical-align':'middle'});
    var loginReturnLocal=function(params){
      var timeZone=new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)[1];
      var oT={IP:OAuth.IP, fun:OAuth.fun, caller:OAuth.caller, timeZone:timeZone}; oT['code']=params['code'];
      var vec=[ ['loginGetGraph', oT], ['specSetup',{idApp:idApp}, $userSettingDiv.setUp]];   majax(oAJAX,vec);
    }
    $c.append($c[0].$nr, $c[0].$thumb, $c[0].$butDelete, $c[0].$buttFetch);  //langHtml.YourImage+': ',
    return $c;
  };
  var tmpSetInp=function($c){
    $c[0].$nr.html(userInfoFrDB.idFB);
    var boExist=Boolean(userInfoFrDB.idFB); $c[0].$butDelete.toggle(boExist);  $c[0].$buttFetch.toggle(!boExist);
    var tmp=userInfoFrDB.image; $c[0].$thumb.prop({src:tmp}).toggle(Boolean(tmp.length)); 
  };
  $.extend(Prop.idFB, { strType:'span', crInp:tmpCrInp, setInp:tmpSetInp, saveInp:function(){return [null, null];}  });




    //boEmailVerified 
  var tmpCrInp=function(){
    var $c=$('<span>');
    $c[0].$spanYes=$('<span>').css({'color':'green', 'margin-right':'1em'}).append('Yes');
    $c[0].$spanNo=$('<span>').css({'color':'red', 'margin-right':'1em'}).append('No');
    $c[0].$butVerify=$('<button>').addClass('highStyle').append(langHtml.emailVerificationOfEmail).click(function(){
      //var vec=[['verifyEmail',1]];   majax(oAJAX,vec); 
      $verifyEmailPop.openFunc();
    });
    $c.append($c[0].$spanYes, $c[0].$spanNo, $c[0].$butVerify);  //langHtml.YourImage+': ',
    return $c;
  }; 
  var tmpSetInp=function($c){
    var boT=Boolean(userInfoFrDB.boEmailVerified);
    $c[0].$spanYes.toggle(boT); $c[0].$spanNo.toggle(!boT);    $c[0].$butVerify.toggle(!boT);
  };
  $.extend(Prop.boEmailVerified, {
    strType:'span', crInp:tmpCrInp, setInp:tmpSetInp, saveInp:function(){return [null, null];},
    crLastChangeSpan:function(){return $('<span>'); },
    setLastChange:function(){ }
  });

    // birthdate
  $.extend(Prop.birthdate, {
    strType:'date', 
    saveInp:function($inp){ var val=$inp.val().trim(); if(val) return [null,val]; else return ['Invalid Birthdate'];},
    //setInp:function($inp){  debugger; var strName=$inp.attr('name'), val=new Date(userInfoFrDB[strName]*1000).toISOString().split('T')[0];   $inp.val(val); }
    setInp:function($inp){   var strName=$inp.attr('name'), val=userInfoFrDB[strName];   $inp.val(val); }
  });

    // gender
  var crInpFunc=function(){
    var $c=$('<select>').addClass('highStyle'), arrTmp=['male','female'];
    for(var i=0;i<arrTmp.length;i++){  var $opt=$("<option>").text(arrTmp[i]).val(arrTmp[i]);   $c.append($opt);    } 
    $c.val('male');
    return $c;
  };
  $.extend(Prop.gender, {strType:'select', crInp:crInpFunc});

    // image
  var tmpCrInp=function(){
    var $c=$('<span>');
    $c[0].$thumb=$('<img>').css({'vertical-align':'middle'});
    $c[0].$butDeleteImg=$('<button>').addClass('highStyle').append('Clear').click(function(){
      var vec=[['deleteImage', {kind:'u'}], ['specSetup',{}, $userSettingDiv.setUp]];   majax(oAJAX,vec); 
    });
    var uploadCallback=function(){
      var tmpF=function(){
        var tmp=calcImageUrlUser(); $c[0].$thumb.prop({src:tmp}); doHistBack();
      };
      var vec=[ ['specSetup',{},tmpF]];   majax(oAJAX,vec);
    }
    var $buttUploadImage=$('<button>').addClass('highStyle').html(langHtml.uploadNewImg).click(function(){$uploadImageDiv.openFunc('u',uploadCallback);});
    $c.append($c[0].$thumb, $c[0].$butDeleteImg, $buttUploadImage);  //langHtml.YourImage+': ',
    return $c;
  };
  calcImageUrl=function(rT){
    var uImg;
    if(rT.imageHash!==null) uImg=uUserImage+rT.imageHash;
    else if(rT.image.length) uImg=rT.image;
    else uImg=uSite+"/lib/image/anonEmptyHash.png";
    return uImg;
  };
  calcImageUrlUser=function(){    return calcImageUrl(userInfoFrDB);     }
  var tmpSetInp=function($c){
    var tmp=calcImageUrlUser();
    $c[0].$thumb.prop({src:tmp});
  };
  $.extend(Prop.image, { strType:'span', crInp:tmpCrInp, setInp:tmpSetInp, saveInp:function(){return [null, null];}  });

  var StrObli=['name', 'email', 'password', 'birthdate'];
  for(var i=0;i<StrObli.length;i++){  var strName=StrObli[i];  Prop[strName].boObli=true;  }

}

timerALogout=null;


langHtml={
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
  loginInfo:{'user':'user',
    'admin':'admin',
    'logoutButt':'Sign-out'
  },
  deleteBox:{
    regret:"Do you really want to delete the account",
    help:"As long as you haven't made any payments, you can delete the account"
  },
  disclaimerHead:'Disclamer etc.',
  disclaimer:`<p>The site might be taken down at any moment simply because the developer feels like it. The software is still free (to use and change) (<a href="https://github.com/emagnusandersson/idPlace">link</a>) and anyone who feel like it should be able to take over.\n
  <h5>Your account might be deleted...</h5>
  <p>... in attempts to keep the register free of fake accounts. (<a href="https://emagnusandersson.com/idPlace">Why is it important to get rid of fake accounts</a>)
  <h5>Best practices to keep your account from being deleted</h5>
  <p>• Don't enter fake data, it's better to leave a field empty than entering fake data. Note that just because you entered your data on this site, doesn't mean that you have to share them with the "Relying party" (the site you are "identifying" yourself to.)
  <p>• Don't change data that is expected to be constant too often (Social security number, birth date ...)
  <p>• Tie your account to Facebook. (This since Facebook also has a policy of maintaining unique accounts. (And they have much better resources to work on the issue.))
  <h5>Also note:</h5>
  <p>You can always delete your account and create a new one later.`
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
helpBub={}

setUp1=function(){


  $body=$('body');  $html=$('html');
  $bodyNHtml=$body.add($html);  
  $body.css({margin:'0px'});
  $document=$(document);
  $window=$(window);
  
  boTouch = Boolean('ontouchstart' in document.documentElement);
  //boTouch=1;


  browser=getBrowser();
  var intBrowserVersion=parseInt(browser.version.slice(0, 2));


  var ua=navigator.userAgent, uaLC = ua.toLowerCase(); //alert(ua);
  boAndroid = uaLC.indexOf("android") > -1;
  boFF = uaLC.indexOf("firefox") > -1; 
  //boIE = uaLC.indexOf("msie") > -1; 
  versionIE=detectIE();
  boIE=versionIE>0; if(boIE) browser.brand='msie';

  boChrome= /chrome/i.test(uaLC);
  boIOS= /iPhone|iPad|iPod/i.test(uaLC);
  boEpiphany=/epiphany/.test(uaLC);    if(boEpiphany && !boAndroid) boTouch=false;  // Ugly workaround

  boOpera=RegExp('OPR\\/').test(ua); if(boOpera) boChrome=false; //alert(ua);



  boSmallAndroid=0;
  
  if(boTouch){
    if(boIOS) {  
      $bodyNHtml.css({"height":"100%", "overflow-y":"scroll", "-webkit-overflow-scrolling":"touch"});
    } else {
      //var h=screen.height, w=screen.width;
      var h=window.innerHeight, w=window.innerWidth;
      //alert(window.devicePixelRatio+' '+ screen.height+' '+screen.width);
      if(boTouch && h*w>230400) $body.css({'font-size':'120%'}); // between 320*480=153600 and 480*640=307200
      if(boTouch && h*w<115200) { $body.css({'font-size':'85%'}); boSmallAndroid=1;} // between 240*320=76800 and 320*480=153600
    }
  } 

  //boHistPushOK='pushState' in history && 'state' in history;
  boHistPushOK='pushState' in history;
  if(!boHistPushOK) { alert('This browser does not support history'); return;}
  boStateInHistory='state' in history;
  if(!boStateInHistory) { alert('This browser does not support history.state'); return;}


  boIsGeneratorSupported=isGeneratorSupported();
  boFormDataOK=1;  if(typeof FormData=='undefined') {  boFormDataOK=0;  }


  if(!(typeof sessionStorage=='object' && sessionStorage.getItem)) {console.log("Your browser doesn't support sessionStorage"); return;}

  menuMaxWidth=500;
  boImgCreationOK=1;

  PropExtend();

  objQS=parseQS(location.search.substring(1));
  boAuthReq=Boolean(Object.keys(objQS).length);
  scopeAsked=objQS.scope||'';
  idApp=Number(objQS.client_id)||null;

  cssFixedTop={margin:'0em 0','text-align':'center',position:'fixed',top:0,width:'100%','border-top':'3px #aaa solid',background:'#fff'}; //,'z-index':5
  cssFixed={margin:'0em 0','text-align':'center',position:'fixed',bottom:0,width:'100%','border-top':'3px #aaa solid',background:'#fff'}; //,'z-index':5
  cssFixedDrag={margin:'0em 0','text-align':'center',position:'fixed',bottom:0,width:'100%',background:'#fff'}; //,'z-index':5
  if(boTouch) cssFixedDrag=cssFixed;
  sizeIcon=1.5; strSizeIcon=sizeIcon+'em';
 

  strScheme='http'+(boTLS?'s':'');    strSchemeLong=strScheme+'://';    uSite=strSchemeLong+wwwSite;      uBE=uSite+"/"+leafBE;
  uCanonical=uSite;

  uUserImage=uSite+'/image/u';
  uAppImage=uSite+'/image/a';

  wcseLibImageFolder='/'+flLibImageFolder+'/';
  uLibImageFolder=uSite+wcseLibImageFolder;

  uHelpFile=uLibImageFolder+'help.png';

  uVipp0=uLibImageFolder+'vipp0.png';
  uVipp1=uLibImageFolder+'vipp1.png';

  uFBTiny=uLibImageFolder+'fb.png';
  //uFBFacebook=uLibImageFolder+'fbFacebook.png';
  uFb=uLibImageFolder+'fbLogin.png';
  uGoogle=uLibImageFolder+'googleWide.jpg';

  uIncreasing=uLibImageFolder+'increasing.png';
  uDecreasing=uLibImageFolder+'decreasing.png';
  uUnsorted=uLibImageFolder+'unsorted.png';

  //uAnon=uLibImageFolder+'anon.png';
  uBusy=uLibImageFolder+'busy.gif';
  uBusyLarge=uLibImageFolder+'busyLarge.gif';

  uDelete=uLibImageFolder+'delete.png';
  uDelete1=uLibImageFolder+'delete1.png';
  uIdPlaceCompare=uLibImageFolder+'idPlaceCompare.png';


  $imgHelp=$('<img>').prop({src:uHelpFile}).css({'vertical-align':'-0.4em'});
  $hovHelp=$('<span>').text('?').css({'font-size':'88%',color:'#a7a7a7','vertical-align':'-0.4em'});

  sizeIcon=1.5; strSizeIcon=sizeIcon+'em';
  $imgProt=$('<img>').css({height:strSizeIcon,width:strSizeIcon,'vertical-align':'text-bottom'}); 


  strHistTitle=wwwSite;
  histList=[];
  stateLoaded=history.state; 
  var tmpi=stateLoaded?stateLoaded.ind:0;    stateLoadedNew={hash:randomHash(), ind:tmpi};
  history.replaceState(stateLoadedNew,'',uCanonical);
  stateTrans=stateLoadedNew;
  history.StateMy=[];


  bindEvent(window,'popstate', function(event) {
    var dir=history.state.ind-stateTrans.ind;
    var boSameHash=history.state.hash==stateTrans.hash;
    if(boSameHash){
      var tmpObj=history.state;
      if('boResetHashCurrent' in history && history.boResetHashCurrent) {
        tmpObj.hash=randomHash();
        history.replaceState(tmpObj,'',uCanonical);
        history.boResetHashCurrent=false;
      }

      //var strName=tmpObj.strName, $obj=window['$'+strName];
      //$obj.setVis();       $body.scrollTop(tmpObj.scroll);

      var stateMy=history.StateMy[history.state.ind];
      if(typeof stateMy!='object' ) {alert("Error: typeof stateMy!='object'"); return; }
      var $view=stateMy.$view;
      $view.setVis();
      if(typeof $view.getScroll=='function') {
        var scrollT=$view.getScroll();
        setTimeout(function(){$window.scrollTop(scrollT);},1);
      } else {
        //var scrollT=stateMy.scroll;  setTimeout(function(){  $window.scrollTop(scrollT);},1);
      }
      

      if('funOverRule' in history && history.funOverRule) {history.funOverRule(); history.funOverRule=null;}
      else{
        if('fun' in stateMy && stateMy.fun) {var fun=stateMy.fun(stateMy); }
      }

      stateTrans=$.extend({},tmpObj);
    }else{
      stateTrans=history.state; $.extend(stateTrans,{hash:randomHash()}); history.replaceState(stateTrans,'',uCanonical);
      history.go(sign(dir));
    }
  }); 

  if(boFF){
    $(window).on('beforeunload', function(){   });
  } 


  errorFunc=function(jqXHR, textStatus, errorThrown){
    setMess('responseText: '+jqXHR.responseText+', textStatus: '+' '+textStatus+', errorThrown: '+errorThrown);     throw 'bla';
  }
  //oAJAX={url:uBE, crossDomain:false, contentType:'application/json', error: errorFunc, type: "POST",dataType:'json', processData:false,success: beRet};
  oAJAX={url:uBE, crossDomain:false, contentType:false, error: errorFunc, type: "POST", processData:false,success: beRet};  
  oAJAXCacheable={url:uBE, crossDomain:false, error: errorFunc, type: "GET", dataType:'json', processData:false, success: beRet};



  $imgBusy=$('<img>').prop({src:uBusy});
  $messageText=messExtend($("<span>"));  window.setMess=$messageText.setMess;  window.resetMess=$messageText.resetMess;   $body.append($messageText); 
   
  $busyLarge=$('<img>').prop({src:uBusyLarge}).css({position:'fixed',top:'50%',left:'50%','margin-top':'-42px','margin-left':'-42px','z-index':'1000',border:'black solid 1px'}).hide();
  $body.append($busyLarge);


  $H1=$('h1:eq(0)');//.detach()
  $H1.css({background:'#fff',border:'solid 1px',color:'black','font-size':'1.6em','font-weight':'bold','text-align':'center',
      padding:'0.4em 0em 0.4em 0em',margin:'0.3em 0em 0em 0em'}); 

  $loginInfo=loginInfoExtend($('<div>'));  $loginInfo.css({padding:'0em 0em 0em 0em','font-size':'75%'});
  $body.prepend($loginInfo);
  

  $mainDiv=mainDivExtend($('<div>')); 
  $loginDiv=loginDivExtend($("<div>"));
  $loginMixDiv=loginMixDivExtend($('<div>'));


  $deleteAccountPop=deleteAccountPopExtend($('<div>'));
  $verifyEmailPop=verifyEmailPopExtend($('<div>'));
  $forgottPWPop=forgottPWPopExtend($('<div>'));
  $changePWPop=changePWPopExtend($('<div>'));
  $uploadImageDiv=uploadImageDivExtend($("<div>"));

  $devAppList=devAppListExtend($('<div>'));
  $devAppSetDiv=devAppSetDivExtend($("<div>"));
  $devAppDeleteDiv=devAppDeleteDivExtend($('<div>'));
  $devAppSecretDiv=devAppSecretDivExtend($('<div>'));
  $userAppSetDiv=userAppSetDivExtend($("<div>"));
  $userAppDeleteDiv=userAppDeleteDivExtend($('<div>'));
  $userAppList=userAppListExtend($('<div>'));


  $divDisclaimer=divDisclaimerExtend($('<div>')).css({'background':'pink', 'margin-bottom':'1em', 'padding':'0.2em', border:'1px red solid'});


  $createUserDiv=createUserDivExtend($('<div>'));
  $createUserPreDiv=createUserPreDivExtend($('<div>'));
  $userSettingDiv=userSettingDivExtend($('<div>'));
  $consentDiv=consentDivExtend($('<div>'));
  
 
  StrMainDiv=['loginInfo', 'H1', 'mainDiv', 'loginMixDiv', 'createUserPreDiv', 'createUserDiv', 'userSettingDiv', 'consentDiv', 'deleteAccountPop', 'verifyEmailPop', 'forgottPWPop', 'changePWPop', 'uploadImageDiv',
 'devAppList', 'devAppSetDiv', 'devAppDeleteDiv', 'devAppSecretDiv', 'userAppSetDiv', 'userAppDeleteDiv', 'userAppList'];  


  MainDiv=[];  for(var i=0;i<StrMainDiv.length;i++){    var key=StrMainDiv[i], $el=window['$'+key];   MainDiv[i]=$el;  };
  $MainDiv=$([]); $MainDiv.push.apply($MainDiv,MainDiv); 


  $mainDivsNonFixWidth=$([]);
  $mainDivsPop=$([]);
  if(1){ //if(!boTouch) {
    $mainDivsNonFixWidth.push($mainDiv, $devAppList, $userAppList, $userSettingDiv, $createUserDiv);
    $mainDivsPop.push($deleteAccountPop, $verifyEmailPop, $forgottPWPop, $changePWPop, $uploadImageDiv, $devAppSetDiv, $devAppDeleteDiv, $devAppSecretDiv, $userAppSetDiv, $userAppDeleteDiv);
  }
  $mainDivsFixWidth=$MainDiv.not($mainDivsNonFixWidth).not($mainDivsPop);


  history.StateMy[history.state.ind]={$view:$mainDiv};

  $mainDivsTogglable=$MainDiv.not($loginInfo.add($H1));
  
  $mainDiv.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    $mainDiv.setUp();
    //$tmp.$divCont.css({'margin-bottom':285+'px'});
    return true;
  }
  $loginMixDiv.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    $tmp.setUp();
    //$tmp.$divCont.css({'margin-bottom':285+'px'});
    return true;
  }
  $createUserPreDiv.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    $tmp.setUp();
    //$tmp.$divCont.css({'margin-bottom':285+'px'});
    return true;
  }
  $createUserDiv.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    //$tmp.$divCont.css({'margin-bottom':285+'px'}); 
    $tmp.$divDisclaimerW.append($divDisclaimer);
    return true;
  }
  $userSettingDiv.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    //$tmp.$divCont.css({'margin-bottom':285+'px'});
    $tmp.setUp(); 
    $tmp.$divDisclaimerW.append($divDisclaimer);
    return true;
  }
  $consentDiv.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    $tmp.setUp();
    return true; 
  }

  $devAppList.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    $tmp.setUp();
    return true;
  }
  $userAppList.setVis=function(){
    var $tmp=this;  $mainDivsTogglable.not($tmp).hide(); $tmp.show();
    $tmp.setUp();
    return true;
  }

  
  $MainDiv.hide();
  $body.append($MainDiv);


  $body.css({'text-align':'center'});
  //$MainDiv.css({'margin-left':'auto','margin-right':'auto','text-align':'left',background:'#fff'});
  $MainDiv.css({'margin-left':'auto','margin-right':'auto'});
  $MainDiv.not($H1).css({'text-align':'left',background:'#fff'});
  $mainDivsFixWidth.css({'max-width':'800px'});

  $mainDivsNonFixWidth.css({display:'block','text-align':'center'});
  $mainDivsPop.css({display:'block','text-align':'left'});
  $mainDivsNonFixWidth.hide();  
  $mainDivsPop.hide();  



  $body.visible();
  $H1.show();
  $mainDiv.setVis();
  $loginInfo.setStat();

  
  setBottomMargin=function() { // This is not very beautiful. But how should one else make a fixed div at the bottom without hiding the bottom of the scrollable content behind??
    if($devAppList.$divCont.is(':visible')){$devAppList.$divCont.css({'margin-bottom':$devAppList.$fixedDiv.height()+'px'});}
    //else if($userAppList.$divCont.is(':visible')){$userAppList.$divCont.css({'margin-bottom':$userAppList.$fixedDiv.height()+'px'});}
    else if($userSettingDiv.$divCont.is(':visible')){$userSettingDiv.$divCont.css({'margin-bottom':$userSettingDiv.$fixedDiv.height()+'px'});}
    else if($createUserDiv.$divCont.is(':visible')){$createUserDiv.$divCont.css({'margin-bottom':$createUserDiv.$fixedDiv.height()+'px'});}
  }
  if(boFF) window.addEventListener("DOMMouseScroll", setBottomMargin, false); else   $(window).bind('mousewheel', setBottomMargin);
  $(window).scroll(setBottomMargin);
  $body.click(setBottomMargin);

  $loginMixDiv.cb=$loginInfo.cb=$createUserDiv.cb=function(){
    if(history.StateMy[history.state.ind].$view===$mainDiv) {$mainDiv.setVis();}
    else history.fastBack($mainDiv);
  };
  if(boAuthReq){
    //iterator=authFlowF.call(this);  iterator.next();
    var authFlowObj=new authFlowT();
    authFlowObj.continueStart();
  }

  

}
/*
authFlowF=function*(){
  if(Object.keys(userInfoFrDB).length==0){
    $loginMixDiv.cb=function(){
      iterator.next();
    };
    $createUserDiv.cb=function(){
      iterator.next();
    };
    yield;
  }
  var tmpScopeGranted=objUApp?objUApp.scope:'';
  var boScopeOK=isScopeOK(tmpScopeGranted, scopeAsked);
  var boRerequest=objQS.auth_type=='rerequest';
  var boShowForm=boRerequest||!boScopeOK;

  
  var boAllow=true;
  if(boShowForm){
    boAllow=false;
    $consentDiv.setVis();
    $consentDiv.cb=function(boAllowT){
      boAllow=boAllowT;
      iterator.next();
    };
    yield;
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
}
*/
authFlowT=function(){
  this.continueStart=function(){
    if(Object.keys(userInfoFrDB).length==0){
      $loginMixDiv.cb=continueGotUser;
      $createUserDiv.cb=continueGotUser;
    } else continueGotUser();
  }
  var continueGotUser=function(){
    var tmpScopeGranted=objUApp?objUApp.scope:'';
    var boScopeOK=isScopeOK(tmpScopeGranted, scopeAsked);
    var boRerequest=objQS.auth_type=='rerequest';
    var boShowForm=boRerequest||!boScopeOK;

    
    if(boShowForm){
      boAllow=false;
      $consentDiv.setVis();
      $consentDiv.cb=function(boAllowT){
        boAllow=boAllowT;
        continueGotConsent();
      };
    } else continueGotConsent();
  }
  var continueGotConsent=function(){
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
  }
  var boAllow=true;


  
}


//window.onload=function(){  setUp1(); };
$(function(){
  setUp1();
});


})();







