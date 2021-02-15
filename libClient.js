"use strict"

//
// Checking browser functionalities
//

var testBrowserFunctionality=function(){
  var err=null, m0="This browser does not support ", m1;
  try { m1="generators"; eval("(function *(){})");
    m1="default parameters"; eval("(function(a=0){})");
    m1="destructuring assignment"; eval("var {a}={a:1};");
    m1="destructuring assignment with arrays"; eval("var [a]=[1];");
    //m1="this obvious nonsens"; eval("function;");
  } catch(errT) { err=errT; }
  return [err, m0+m1]; 
}


//
// Storage, DOM etc
//

var getItem=function(name){    var tmp=localStorage.getItem(name);   if(tmp!==null) tmp=JSON.parse(tmp);  return tmp;   }
var setItem=function(name,value){  if(typeof value=='undefined') value=null; localStorage[name]=JSON.stringify(value); }
var getItemS=function(name){    var tmp=sessionStorage.getItem(name);    if(tmp!==null) tmp=JSON.parse(tmp);   return tmp;   }
var setItemS=function(name,value){  sessionStorage[name]=JSON.stringify(value); }


var msort=function(compare){
  var length = this.length,  middle = Math.floor(length / 2);
  //if(length < 2) return this;
  if(length==0) return [];
  if(length==1) return [this[0]];
  //return merge(    this.slice(0, middle).msort(compare),    this.slice(middle, length).msort(compare),    compare    );
  var a=this.slice(0, middle),  b=this.slice(middle, length);
  return merge(    msort.call(a,compare),    msort.call(b,compare),    compare    );
}

var merge=function(left, right, compare){
  var result = [];
  while (left.length > 0 || right.length > 0){
    if(left.length > 0 && right.length > 0){
      if(compare(left[0], right[0]) <= 0){ result.push(left[0]);  left = left.slice(1);  }
      else{ result.push(right[0]); right = right.slice(1);  }
    }
    else if(left.length > 0){  result.push(left[0]);  left = left.slice(1);  }
    else if(right.length > 0){  result.push(right[0]);  right = right.slice(1);  }
  }
  return result;
}


var deepExtend=function(oA, oB) {
    // Handle the 3 simple types, and null or undefined
  if(oB==null || typeof oB != "object" ) return oB;
  
    // Handle Date
  if(oB instanceof Date){  oA = new Date(); oA.setTime(oB.getTime()); return oA;  }

    // Handle Array
  if(oB instanceof Array) {
    if(typeof oA=='undefined') oA=[];
    for(var i=0; i<oB.length; i++) oA[i]=deepExtend(oA[i],oB[i]);
    return oA;
  }
    // Handle Object
  if(oB instanceof Object) {
    if(typeof oA=='undefined') oA={};
    for(var key in oB) {
      if(oB.hasOwnProperty(key)) oA[key] = deepExtend(oA[key],oB[key]);
    }
    return oA;
  }
 
  throw new Error("Unable to copy oB! Its type isn't supported.");
};

/*******************************************************************************************************************
 * DOM handling
 *******************************************************************************************************************/

var findPos=function(el) {
  var rect = el.getBoundingClientRect();
  //return {top:rect.top+document.body.scrollTop, left:rect.left + document.body.scrollLeft};
  return {top:rect.top+window.scrollY, left:rect.left + window.scrollX};
}
//var findPosMy=function(el) {
  //var curleft = 0, curtop = 0;
  //while(1){
    //curleft += el.offsetLeft; curtop += el.offsetTop;
    //if(el.offsetParent) el = el.offsetParent; else break;
  //}
  //return { left: curleft, top: curtop };
//}


var removeChildren=function(myNode){
  while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
  }
}

var scrollTop=function(){ return window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop; }
var scrollLeft=function(){ return window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft; }

EventTarget.prototype.on=function(){ this.addEventListener.apply(this, [...arguments]); return this; }
EventTarget.prototype.off=function(){ this.removeEventListener.apply(this, [...arguments]); return this; }
//if(!Node.prototype.append) Node.prototype.append=Node.prototype.appendChild;
if(!Node.prototype.prepend) Node.prototype.prepend=function(el){ this.insertBefore(el, this.firstChild);  }
Node.prototype.myAppend=function(){ this.append.apply(this, [...arguments]); return this; }
Node.prototype.myAppendHtml=function(){
  var arg=[...arguments], elTmp=null, argB=[];
  arg.forEach(ele=>{
    if(typeof ele=='string') {
      if(!elTmp) elTmp=createElement('div');
      elTmp.innerHTML=ele;  // Convert html to nodes (found in elTmp.childNodes)
      argB.push(...elTmp.childNodes);
    } else argB.push(ele);
  }); 
  this.append.call(this, ...argB); return this;
}
Node.prototype.myBefore=function(elN){
  this.parentNode.insertBefore(elN,this); return this;
}
Node.prototype.empty = function() {
  while (this.lastChild) {
    this.lastChild.remove();
  }
  return this;
}
Element.prototype.insertChildAtIndex=function(child, index){
  if(!index) index=0;
  if(index >= this.children.length){
    this.appendChild(child);
  }else{
    this.insertBefore(child, this.children[index]);
  }
}
Element.prototype.attr=function(attr, value) {
  if(!attr) return;
  if(typeof attr=='string') {
    if(arguments.length<2) return this.getAttribute(attr);
    this.setAttribute(attr, value); return this;
  }
  for(var key in attr) { this.setAttribute(key, attr[key]);}
  return this;
}
Element.prototype.prop=function(prop, value) {
  if(!prop) return;
  if(typeof prop=='string') {
    if(arguments.length<2) return this[prop];
    this[prop]=value; return this;
  }
  for(var key in prop) { this[key]=prop[key];}
  return this;
}
Element.prototype.css=function(style, value) {
  if(!style) return;
  if(typeof style=='string') {
    if(arguments.length<2) return this.style[style];
    this.style[style]=value; return this;
  }
  for(var key in style) { this.style[key]=style[key];}
  return this;
}
Element.prototype.addClass=function() {this.classList.add(...arguments);return this;}
Element.prototype.removeClass=function() {this.classList.remove(...arguments);return this;}
Element.prototype.toggleClass=function() {this.classList.toggle(...arguments);return this;}
Element.prototype.hasClass=function() {return this.classList.contains(...arguments);}
Node.prototype.cssChildren=function(styles){  this.childNodes.forEach(function(elA){ Object.assign(elA.style, styles);  }); return this;  }
Node.prototype.myText=function(str){
  if(arguments.length==0) { return this.textContent; }
  if(typeof str!='string') { if(str==null) str=' '; str=str.toString(); }
  if(this.childNodes.length==1 && this.firstChild.nodeName=="#text" ) { this.firstChild.nodeValue=str||' ';  return this;} // Being a bit GC-friendly
  this.textContent=str||' '; return this;
}
Node.prototype.myHtml=function(str=' '){
  if(typeof str!='string') { if(str==null) str=' '; str=str.toString(); }
  this.innerHTML=str||' '; return this;
}
Node.prototype.hide=function(){
  if(this.style.display=='none') return this;
  this.displayLast=this.style.display;
  this.style.display='none';
  return this;
}
Node.prototype.show=function(){
  if(this.style.display!='none') return this;
  if(typeof this.displayLast!='undefined') var tmp=this.displayLast; else var tmp='';
  this.style.display=tmp;
  return this;
}
Node.prototype.toggle=function(b){
  if(typeof b=='undefined') b=this.style.display=='none'?1:0;
  if(b==0) this.hide(); else this.show();
  return this;
}
NodeList.prototype.toggle=function(b){
  if(typeof b=='undefined') {if(this.length) b=this[0].style.display=='none'?1:0; else return this;}
  this.forEach(function(ele){ ele.toggle(b); });
  return this;
}
var createTextNode=function(str){ return document.createTextNode(str); }
var createElement=function(str){ return document.createElement(str); }
var createFragment=function(){ var fr=document.createDocumentFragment(); if(arguments.length) fr.append(...arguments); return fr; }

var getNodeIndex=function( elm ){ return [...elm.parentNode.childNodes].indexOf(elm); }
Element.prototype.myIndex=function() {return [...this.parentNode.childNodes].indexOf(this);}

Element.prototype.offset=function() {
  var rect = this.getBoundingClientRect();
  return { top: rect.top + document.body.scrollTop,  left: rect.left + document.body.scrollLeft  };
}

Element.prototype.visible = function() {    this.style.visibility='';  return this;};
Element.prototype.invisible = function() {    this.style.visibility='hidden'; return this; };
Element.prototype.visibilityToggle=function(b){
  if(typeof b=='undefined') b=this.style.visibility=='hidden'?1:0;
  this.style.visibility= b?'':'hidden';
  return this;
};

Node.prototype.detach=function(){ this.remove(); return this; }

var isVisible=function(el) {
  return !!( el.offsetWidth || el.offsetHeight || el.getClientRects().length );
}





/*******************************************************************************************************************
 * popupHover: popup a elBubble when you hover over elArea
 *******************************************************************************************************************/
var popupHover=function(elArea, elBubble, tClose=4){
  elBubble.css({position:'absolute', 'box-sizing':'border-box', margin:'0px', 'text-align':'left'}); //
  function setBubblePos(e){
    var xClear=6, yClear=6;
    var x = e.pageX, y = e.pageY;

    var borderMarg=10;
    var winW=window.innerWidth,winH=window.innerHeight,   bubW=elBubble.clientWidth,bubH=elBubble.clientHeight,   scrollX=scrollLeft(),scrollY=scrollTop();


    var boRight=true, boBottom=true;

    var boMounted=Boolean(elBubble.parentNode);
    if(boMounted){
      var xFar=x+xClear+bubW, xBorder=scrollX+winW-borderMarg;
      if(xFar<xBorder){ 
        x=x+xClear;
      } else {
        x=x-bubW-xClear;  // if the bubble doesn't fit on the right side then flip to the left side
        //x=x-xClear; boRight=false;
      }
        
      var yFar=y+yClear+bubH, yBorder=scrollY+winH-borderMarg;
      if(yFar<yBorder) {
        y=y+yClear;
      }else{ 
        y=y-bubH-yClear;   // if the bubble doesn't fit below then flip to above
        //y=y-yClear; boBottom=false;
      }
    } else {
      x=x+xClear;
      y=y+yClear;
    }
    if(x<scrollX) x=scrollX;
    if(y<scrollY) y=scrollY;
    //elBubble.style.top=y+'px'; elBubble.style.left=x+'px';
    elBubble.css({top:y+'px', left:x+'px'});
    //if(boRight) {elBubble.style.left=x+'px'; elBubble.style.right='';} else {elBubble.style.left=''; elBubble.style.right=x+'px'; }
    //if(boBottom) {elBubble.style.top=y+'px'; elBubble.style.bottom='';} else {elBubble.style.top=''; elBubble.style.bottom=y+'px'; } 
  };
  var closeFunc=function(){ 
    if(boTouch){ 
      elBubble.remove(); 
      if(boIOSTmp) elBlanket.remove();
      clearTimeout(timer);
    } 
    else { elBubble.remove();  }
  }
  var elBlanket, timer, boIOSTmp=boTouch;
  if(boIOSTmp){
    elBlanket=createElement('div').css({'background':'#555',opacity:0,'z-index': 9001,top:'0px',left:'0px',width:'100%',position:'fixed',height:'100%'});
    elBlanket.on('click', closeFunc);
  }
  if(boTouch){
    elArea.on('click', function(e){
      e.stopPropagation();
      if(elBubble.parentNode) closeFunc();
      else {
        elBody.append(elBubble); setBubblePos(e);
        clearTimeout(timer);  if(tClose) timer=setTimeout(closeFunc, tClose*1000);
        if(boIOSTmp) elBody.append(elBlanket);
      }
    });
    elBubble.on('click', closeFunc);
    elHtml.on('click', closeFunc);
    
  }else{
    elArea.on('mousemove', setBubblePos);  
    elArea.on('mouseenter', function(e){elBody.append(elBubble);});
    elArea.on('mouseleave', closeFunc);
  }
  elBubble.classList.add('popupHover'); 
}




var uVipp0="lib/image/vipp0.png";
var uVipp1="lib/image/vipp1.png";
var vippButtonExtend=function($el){
"use strict"
  $el.setStat=function(bo1){
    if(!bo1) {$el.css(o0);} else {$el.css(o1);} 
    $el.attr({boOn:bo1});
  }
  var o0={background:'url('+uVipp0+') no-repeat'}, o1={background:'url('+uVipp1+') no-repeat'};
    
  $el.attr({boOn:0});
  $el.css({'background':'url('+uVipp0+') no-repeat',height:'54px',width:'102px',zoom:'60%','vertical-align':'-0.5em',cursor:'pointer',display:'inline-block'}).addClass('unselectable');
  $el.on('click',function(){var t=1-$el.attr('boOn');   $el.setStat(t);});
  return $el;
}


