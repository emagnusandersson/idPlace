"use strict"

//
// Checking browser functionalities
//

app.testBrowserFunctionality=function(){
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

app.getItem=function(name){    var tmp=localStorage.getItem(name);   if(tmp!==null) tmp=JSON.parse(tmp);  return tmp;   }
app.setItem=function(name,value){  if(typeof value=='undefined') value=null; localStorage[name]=JSON.stringify(value); }
app.getItemS=function(name){    var tmp=sessionStorage.getItem(name);    if(tmp!==null) tmp=JSON.parse(tmp);   return tmp;   }
app.setItemS=function(name,value){  sessionStorage[name]=JSON.stringify(value); }


app.msort=function(compare){
  var length = this.length,  middle = Math.floor(length / 2);
  //if(length < 2) return this;
  if(length==0) return [];
  if(length==1) return [this[0]];
  //return merge(    this.slice(0, middle).msort(compare),    this.slice(middle, length).msort(compare),    compare    );
  var a=this.slice(0, middle),  b=this.slice(middle, length);
  return merge(    msort.call(a,compare),    msort.call(b,compare),    compare    );
}

app.merge=function(left, right, compare){
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


app.deepExtend=function(oA, oB) {
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

app.findPos=function(el) {
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


app.removeChildren=function(myNode){
  while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
  }
}

app.scrollTop=function(){ return window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop; }
app.scrollLeft=function(){ return window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft; }

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
app.createTextNode=function(str){ return document.createTextNode(str); }
app.createElement=function(str){ return document.createElement(str); }
app.createFragment=function(){ var fr=document.createDocumentFragment(); if(arguments.length) fr.append(...arguments); return fr; }

app.getNodeIndex=function( elm ){ return [...elm.parentNode.childNodes].indexOf(elm); }
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

app.isVisible=function(el) {
  return !!( el.offsetWidth || el.offsetHeight || el.getClientRects().length );
}




//
// Image compress, autorotate etc
//

// Modified from https://stackoverflow.com/a/32490603, cc by-sa 3.0
// returns an array [error, orientation];
// orientation = 1..8 (see link above)
app.getExifOrientation=function(abData) { // The input is an ArrayBuffer
  const intSOI=0xFFD8, APP1=0xFFE1, intExifHeader=0x45786966;
  var view = new DataView(abData);
  if(view.getUint16(0, false) != intSOI) { return [new Error("notJpeg")];   }
  var length = view.byteLength, offset = 2;
  while(offset < length) {
    if(view.getUint16(offset+2, false) <= 8) return [new Error("notDefined")];
    var marker = view.getUint16(offset, false);
    offset += 2;
    if(marker == APP1) {
      if(view.getUint32(offset += 2, false) != intExifHeader) { return [new Error("notDefined")];  }
      var little = view.getUint16(offset += 6, false) == 0x4949;
      offset += view.getUint32(offset + 4, little);
      var tags = view.getUint16(offset, little);
      offset += 2;
      for(var i = 0; i < tags; i++)
        if(view.getUint16(offset + (i * 12), little) == 0x0112) {
          var orientation=view.getUint16(offset + (i * 12) + 8, little);  return [null, orientation]; 
        }
    }
    else if((marker & 0xFF00) != 0xFF00) break;
    else offset += view.getUint16(offset, false);
  }
  return [new Error("notDefined")];
}


// Derived from https://stackoverflow.com/a/40867559, cc by-sa
app.imgToCanvasWithOrientation=function(img, rawWidth, rawHeight, orientation) {
  var canvas = document.createElement('canvas');
  if(orientation > 4) {  canvas.width=rawHeight; canvas.height=rawWidth; }
  else {  canvas.width=rawWidth;  canvas.height=rawHeight;  }

  if(orientation > 1) { console.log("EXIF orientation = " + orientation + ", rotating picture"); }

  var ctx = canvas.getContext('2d');
  switch(orientation) {
    case 2: ctx.transform(-1, 0, 0, 1, rawWidth, 0); break;
    case 3: ctx.transform(-1, 0, 0, -1, rawWidth, rawHeight); break;
    case 4: ctx.transform(1, 0, 0, -1, 0, rawHeight); break;
    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
    case 6: ctx.transform(0, 1, -1, 0, rawHeight, 0); break;
    case 7: ctx.transform(0, -1, -1, 0, rawHeight, rawWidth); break;
    case 8: ctx.transform(0, -1, 1, 0, 0, rawWidth); break;
  }
  ctx.drawImage(img, 0, 0, rawWidth, rawHeight);
  return canvas;
}

app.reduceImageSize=async function(file, acceptFileSize, maxWidth, maxHeight, quality) {
  if(file.size <= acceptFileSize) {  return [null, file]; }

    // Extract w and h (one could probably read these from the jpeg header more or less as one reads the orientation from the header below. (And doing this would probably be faster))
  var img = new Image();
  var [err]=await new Promise(function(resolve) {
    img.onerror = function(e) { resolve([e]);  };
    img.onload = function() { resolve([null]); };
    img.src = URL.createObjectURL(file);
  });
  URL.revokeObjectURL(img.src);
  if(err){ return [err];}

    // Slice out the beginning of the file
      // Suggestion from http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/:
  if(file.slice) {
    file = file.slice(0, 131072);
  } else if(file.webkitSlice) {
    file = file.webkitSlice(0, 131072);
  }

    // Convert the beginning of the file to ArrayBuffer
  var reader = new FileReader();
  var abData=await new Promise(function(resolve) {
    reader.onload = function(e) { resolve(e.target.result); };
    reader.readAsArrayBuffer(file);
  });
  
    // Extract orientation
  var [err, orientation]=getExifOrientation(abData);
  if(err) {
    var {message}=err
    if(message=="notDefined" || message=="notJpeg") orientation=1;
    else  return [err]  
  }

    // Decide new dimensions
  var w=img.width, h=img.height;
  var scale=(orientation>4 ?
    Math.min(maxHeight/w, maxWidth/h, 1) :
    Math.min(maxWidth/w, maxHeight/h, 1));
  h=Math.round(h*scale);    w=Math.round(w*scale);

    // Create canvas
  var canvas = imgToCanvasWithOrientation(img, w, h, orientation);
    // Create new image
  var [err, blob]=await new Promise(function(resolve) {
    canvas.toBlob(function(blob) { resolve([null, blob]) }, 'image/jpeg', quality);
  });

  return [null, blob];
}


/*******************************************************************************************************************
 * popupHover: popup a elBubble when you hover over elArea
 *******************************************************************************************************************/
app.popupHover=function(elArea, elBubble, tClose=4){
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




app.uVipp0="lib/image/vipp0.png";
app.uVipp1="lib/image/vipp1.png";
app.vippButtonExtend=function($el){
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


