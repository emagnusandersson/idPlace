


//
// Storage, DOM etc
//
/*
if(typeof(sessionStorage) == 'undefined'){
    sessionStorage = {
        getItem: function(){return null;},
        setItem: function(){}
    };
}
if(typeof(localStorage) == 'undefined'){
    localStorage = {
        getItem: function(){return null;},
        setItem: function(){}
    };
}*/
getItem=function(name){    var tmp=localStorage.getItem(name);   if(tmp!==null) tmp=JSON.parse(tmp);  return tmp;   }
setItem=function(name,value){  if(typeof value=='undefined') value=null; localStorage[name]=JSON.stringify(value); }
getItemS=function(name){    var tmp=sessionStorage.getItem(name);    if(tmp!==null) tmp=JSON.parse(tmp);   return tmp;   }
setItemS=function(name,value){  sessionStorage[name]=JSON.stringify(value); }

function bindEvent(element, type, handler) {
   if(element.addEventListener) {
      element.addEventListener(type, handler, false);
   } else {
      element.attachEvent('on'+type, handler);
   }
}

uVipp0="lib/image/vipp0.png";
uVipp1="lib/image/vipp1.png";
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

//
// Hardware checking
//

getBrowser=function(){
    var ua=navigator.userAgent.toLowerCase();

    var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
        /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
        /(msie) ([\w.]+)/.exec( ua ) ||
        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
        [];

    var brand=match[ 1 ] || "";
    var version=match[ 2 ] || "0";
    
    return {brand:brand,version:version};
};
detectIE=function() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
       // IE 12 => return version number
       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

isGeneratorSupported = function(){
    try {
       eval("(function*(){})()");
       return true;
    } catch(err){
       return false;
    }
}

//
// JQuery extentions
//

// $.fn.push = function(selector) {    Array.prototype.push.apply(this, $.makeArray($(selector)));   return this;   };
$.fn.pushOne = function(selector){
    Array.prototype.push.apply(this, $.makeArray($(selector)));
    return this;
};
$.fn.push = function(){
  for(var i=0; i<arguments.length; i++){
    this.pushOne(arguments[i]);
  }
  return this;
}
$.fn.visible = function() {    return this.css('visibility', 'visible');  };
$.fn.invisible = function() {    return this.css('visibility', 'hidden');  };
$.fn.visibilityToggle = function() {
    if(arguments.length) return this.css('visibility', arguments[0]?'visible':'hidden');
    return this.css('visibility', function(i, visibility) {
        return (visibility == 'visible') ? 'hidden' : 'visible';
    });
};
jQuery.fn.sortElements = (function(){
 
    var funcSort = [].sort;
    //var funcSort=merge_sort;
    var funcSort = [].msort;
 
    return function(comparator, getSortable){
 
        getSortable = getSortable || function(){return this;};
 
        var placements = this.map(function(){   // A vector of functions, each function asumes that its 'this' will be the moved object, which will then be moved to the corresponding 'flagNode'
 
            var sortElement = getSortable.call(this),
                parentNode = sortElement.parentNode,
 
                // Since the element itself will change position, we have
                // to have some way of storing it's original position in
                // the DOM. The easiest way is to have a 'flag' node:
                flagNode = parentNode.insertBefore(
                    document.createTextNode(''),
                    sortElement.nextSibling
                );
 
            return function(){
 
                if (parentNode === this){
                    throw new Error(
                        "You can't sort elements if any one is a descendant of another."
                    );
                }
 
                // Insert before flag:
                parentNode.insertBefore(this, flagNode);
                // Remove flag:
                parentNode.removeChild(flagNode);
 
            };
 
        });
 

        //var tmp=funcSort.call(this, comparator); 
        //var tmp=this.msort(comparator); 
        var tmp=msort.call(this,comparator); 

        //var tmp=merge_sort(this, comparator); 
        return tmp.forEach(function(v,i){
            placements[i].call(getSortable.call(v));
        });
        /*return this.each(function(i){
            placements[i].call(getSortable.call(this));
        });*/
        //return funcSort.call(this, comparator).each(function(i){
        //    placements[i].call(getSortable.call(this));
        //});
 
    };
 
})();



// Add stable merge sort to Array and jQuery prototypes

  // expose to Array and jQuery
//Array.prototype.msort = jQuery.fn.msort = msort;

msort=function(compare){
"use strict"
  var length = this.length,  middle = Math.floor(length / 2);
  //if(length < 2) return this;
  if(length==0) return [];
  if(length==1) return [this[0]];
  //return merge(    this.slice(0, middle).msort(compare),    this.slice(middle, length).msort(compare),    compare    );
  var a=this.slice(0, middle),  b=this.slice(middle, length);
  return merge(    msort.call(a,compare),    msort.call(b,compare),    compare    );
}

merge=function(left, right, compare){
"use strict"
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


/*******************************************************************************************************************
 * My popup
 *******************************************************************************************************************/

function popupHover($area,$bubble){
  function setBubblePos(e){
    var xClear=6, yClear=6;
    var x = e.pageX;
    var y = e.pageY;

    var borderMarg=10;
    var $win = $(window), $doc=$(document);
    var winW=$win.width(),winH=$win.height(),   bubW=$bubble.width(),bubH=$bubble.height(),   scrollX=$doc.scrollLeft(),scrollY=$doc.scrollTop();

    var paddingBorderNMarginX=3+1+10; bubW+=2*paddingBorderNMarginX;
    var paddingBorderNMarginY=3+1+5; bubH+=2*paddingBorderNMarginY;
    
    var xFar=x+xClear+bubW, xBorder=scrollX+winW-borderMarg;
    if(xFar<xBorder) x=x+xClear; else x=x-bubW-xClear;   // if the bubble doesn't fit on the right side then flip to the left side
    if(x<scrollX) x=scrollX;
    
    var yFar=y+yClear+bubH, yBorder=scrollY+winH-borderMarg;
    if(yFar<yBorder) y=y+yClear; else y=y-bubH-yClear;   // if the bubble doesn't fit below then flip to above
    if(y<scrollY) y=scrollY;
    
    $bubble.css({'position': 'absolute', 'top': y, 'left': x});
  };
  var closeFunc=function(){ 
    if(boTouch){ 
      $bubble.detach();//fadeOut(400); 
      if(boIOS) $blanket.detach();
    } 
    else { $bubble.detach();  }
  }
  var $blanket;
  if(boIOS){
    $blanket=$('<div>').css({'background':'#555',opacity:0,'z-index': 9001,top:'0px',left:'0px',width:'100%',position:'fixed',height:'100%'}).click(closeFunc);
  }
  if(boTouch){
    $area.click(function(e){ e.stopPropagation();  $body.append($bubble); setBubblePos(e); setTimeout(closeFunc, 4000); if(boIOS) $body.append($blanket);  });
    $bubble.click(function(e){ closeFunc(); });
    $('html').click(function(e){ closeFunc(); });
    
  }else{
    $area.mousemove(setBubblePos);  
    $area.mouseenter(function(e){$body.append($bubble);}).mouseleave(function(){$bubble.detach();});
  }
}

function popupHoverM($area,$bubble){ 
  $bubble.addClass('popupHover'); 
  //var z=$area.css('z-index');
  //$bubble.css({'z-index':9005,'text-align':'left'}); 
  $bubble.css({'z-index':9005,'text-align':'left',padding:'0.4em'});  
  popupHover($area,$bubble);  
  return $area;
}





/*******************************************************************************************************************
 * menuExtend (Display a menu under (or above) a button (when button is clicked))       (mousedown, drag, mouseup-on-option)
 *******************************************************************************************************************/
var menuExtend=function($el,$items){
"use strict"
  //  var objEdgeDist=$menu[0].getBoundingClientRect();
  $el.openFunc=function(e,$button,$itemsT){ 
    e.stopPropagation();
    if($el[0].parentNode) { $el.closeFunc();  return; }
    if(e.which==3) return;

    if(typeof $itemsT!='undefined') {
      $items=$itemsT;  $el.children('*').detach();   $el.append($items);  }
    $items.addClass('menuItem');

    var $ancestor=$button.offsetParent();  $ancestor.append($el);

    var x,y;

    var borderMarg=10;
    var $win = $(window), $doc=$(document);
    var winW=$win.width(),winH=$win.height()
    var xButt=$button.offset().left, yButt=$button.offset().top,  butW=$button.width(),butH=$button.height();
    var scrollX=$doc.scrollLeft(),scrollY=$doc.scrollTop(), winEdgeX=scrollX+winW, winEdgeY=scrollY+winH; 
    
    var boDown, boRight, boYFits=1;
    if(xButt-scrollX < winEdgeX-(xButt+butW)) {boRight=1;}  else {boRight=0;} 
    //if(yButt-scrollY < winEdgeY-(yButt+butH)) {boDown=1;} else {boDown=0;}
    var hExtraMargin=boAndroid&&boChrome?55:5;
    if(winEdgeY-(yButt+butH)>$el.outerHeight()+hExtraMargin) {boDown=1;} 
    else if(yButt-scrollY>$el.outerHeight()+5) {boDown=0;} 
    else {boDown=1; boYFits=0; }
    
    var xButtAnc=$button.position().left, yButtAnc=$button.position().top; 

    if(boRight) {x=xButtAnc; $el.css({left:Number(x)+'px',right:''});}
    else { x=$ancestor.width()-(xButtAnc+$button.outerWidth()); $el.css({left:'',right:Number(x)+'px'});}
    if(boYFits){
      if(boDown) {y=yButtAnc+$button.outerHeight(); $el.css({top:Number(y)+'px',bottom:''});}
      else { y=$ancestor.height()-yButtAnc; $el.css({top:'',bottom:Number(y)+'px'});}
    }else{ 
      y=scrollY-$ancestor.offset().top; y=boIOS?Math.max(0,y):y; $el.css({top:Number(y)+'px',bottom:''});
    }
    $items.css({background:''});
  }
  
  $el.closeFunc=function() {  
    $el.detach();
  } 
  if(typeof $items=='undefined') {$items=$([]);}  $el.append($items);   $items.addClass('menuItem');

  $el.css({position:'absolute',border:'black 1px solid',background:'#fff',cursor:'pointer'});
  $el.on('mouseover','.menuItem',function(e){$(this).css({background:'grey'});});
  $el.on('mouseout','.menuItem',function(e){$(this).css({background:''});});
  $el.on('mouseup','.menuItem',function(e){$(this).css({background:''});});

  var strEventOff='mouseup'; if(boTouch) strEventOff='click';
  if(boTouch) {$el.css('line-height',2);}
  $el.css({'z-index':100});
  $('html').on(strEventOff,$el.closeFunc);
  return $el;
}



/*******************************************************************************************************************
 * popupDragExtend  (Display a draggable bubble (div) (when button is clicked))
 *******************************************************************************************************************/
function popupDragExtend($area,$bubble,strTitle,$parent){
  var xLoc, yLoc, xBubStart, xMouseStart, wBubStart, wWinStart;
  var mouseDownGrab= function(e){
    var e = e || window.event; if(e.which==3) return; 
    var pTmp; if(boTouch) {e.preventDefault(); pTmp=e.originalEvent.changedTouches[0]; }  else pTmp=e;     var mouseX=pTmp.pageX, mouseY=pTmp.pageY;
    var xBub=$bubble.offset().left, yBub=$bubble.offset().top;
    xLoc=mouseX-xBub;yLoc=mouseY-yBub;
    wBubStart=$bubble.outerWidth(); wWinStart=$window.width();
    xBubStart=xBub;

    $bubble.css({opacity:0.70,'z-index':'auto'});  
  	$parent.on(strEventMove,mouseMoveGrab).on(strEventEnd,mouseUpGrab);
    $dragBarB.css({cursor:'move'});
    //setMess('Down');
    if(e.cancelable) e.preventDefault(); 
    return false;
  } 
  var mouseUpGrab= function(e){  
    $bubble.css({opacity:1,'z-index':'auto'});
    $parent.off(strEventMove,mouseMoveGrab).off(strEventEnd,mouseUpGrab); 
    $dragBarB.css({cursor:'-webkit-grab'});
    //setMess(print_r($el.myGet(),1));
    if(e.cancelable) e.preventDefault(); 
    return false;
  } 
  var mouseMoveGrab= function(e){ 
    var pTmp; if(boTouch) {e.preventDefault(); pTmp=e.originalEvent.changedTouches[0]; }  else pTmp=e;     var mouseX=pTmp.pageX, mouseY=pTmp.pageY;
    var xBub=mouseX-xLoc, yBub=mouseY-yLoc;
    var xBubR=xBub+wBubStart;
    var wBub=wBubStart;
    if(xBub<0) {
      wBub=wBubStart+xBub; xBub=0;
      if(wBub<minBubWidth) wBub=minBubWidth;
    } 

    if(xBubR>wWinStart) {
      wBub=wWinStart-xBub;
      if(wBub<minBubWidth) {wBub=minBubWidth; xBub=wWinStart-wBub; }
    }
    $bubble.css({width:wBub+'px'});

    if(yBub<0) yBub=0;
    $bubble.offset({ left: xBub, top: yBub});
    if(e.cancelable) e.preventDefault(); 
    return false;
  };

  var mouseDownNW= function(e){
    var e = e || window.event; if(e.which==3) return; 
    var pTmp; if(boTouch) {e.preventDefault(); pTmp=e.originalEvent.changedTouches[0]; }  else pTmp=e;     var mouseX=pTmp.pageX, mouseY=pTmp.pageY;
    var xBub=$bubble.offset().left, yBub=$bubble.offset().top;
    xBubStart=xBub;
    xLoc=mouseX-xBub;yLoc=mouseY-yBub;
    wBubStart=$bubble.outerWidth();
    $bubble.css({opacity:0.70,'z-index':'auto'});   	$parent.on(strEventMove,mouseMoveNW).on(strEventEnd,mouseUpNW); 
    if(e.cancelable) e.preventDefault();   
    return false;
  } 
  var mouseUpNW= function(e){  
    $bubble.css({opacity:1,'z-index':'auto'});    $parent.off(strEventMove,mouseMoveNW).off(strEventEnd,mouseUpNW);
    if(e.cancelable) e.preventDefault(); 
    return false;
  } 
  var mouseMoveNW= function(e){
    var pTmp; if(boTouch) {e.preventDefault(); pTmp=e.originalEvent.changedTouches[0]; }  else pTmp=e;     var mouseX=pTmp.pageX, mouseY=pTmp.pageY;
    var xBub=mouseX-xLoc, yBub=mouseY-yLoc;
    if(xBub<0) {xBub=0; }
    var xDiff=xBub-xBubStart, wBub=wBubStart-xDiff;

    if(wBub<minBubWidth) {wBub=minBubWidth; xBub=xBubStart-(wBub-wBubStart); }
    $bubble.css({width:wBub+'px'});
    if(yBub<0) yBub=0;
    $bubble.offset({ left: xBub, top: yBub});
    if(e.cancelable) e.preventDefault(); 
    return false;
  };

  var mouseDownNE= function(e){
    var e = e || window.event; if(e.which==3) return;
    var pTmp; if(boTouch) {e.preventDefault(); pTmp=e.originalEvent.changedTouches[0]; }  else pTmp=e;     var mouseX=pTmp.pageX, mouseY=pTmp.pageY;
    var xBub=$bubble.offset().left, yBub=$bubble.offset().top;
    xMouseStart=mouseX; xBubStart=xBub; wWinStart=$window.width();
    xLoc=mouseX-xBub;yLoc=mouseY-yBub;
    wBubStart=$bubble.outerWidth();
    $bubble.css({opacity:0.70,'z-index':'auto'});   	$parent.on(strEventMove,mouseMoveNE).on(strEventEnd,mouseUpNE); 
    if(e.cancelable) e.preventDefault();    
    return false;
  } 
  var mouseUpNE= function(e){
    $bubble.css({opacity:1,'z-index':'auto'});    $parent.off(strEventMove,mouseMoveNE).off(strEventEnd,mouseUpNE);
    if(e.cancelable) e.preventDefault(); 
    return false;
  } 
  var mouseMoveNE= function(e){
    var pTmp; if(boTouch) {e.preventDefault(); pTmp=e.originalEvent.changedTouches[0]; }  else pTmp=e;     var mouseX=pTmp.pageX, mouseY=pTmp.pageY;
    var xBub=xBubStart, yBub=mouseY-yLoc;
    var xDiff=mouseX-xMouseStart;
    var wBub=wBubStart+xDiff;
    var xBubR=xBubStart+wBub;  if(xBubR>wWinStart) {wBub=wWinStart-xBubStart; }
    if(wBub<minBubWidth) wBub=minBubWidth;
    $bubble.css({width:wBub+'px'});
    if(yBub<0) yBub=0;
    $bubble.offset({ top: yBub});
    if(e.cancelable) e.preventDefault(); 
    return false;
  };

  var minBubWidth=140; 
  if(typeof $parent=='undefined') $parent=$body;
  $bubble.openFunc=function(){ $parent.append($bubble);  }
  $bubble.closeFunc=function(){ $bubble.detach();  }
  $bubble.toggleFunc=function(boOn){
    if(typeof boOn=='undefined') boOn=!Boolean($bubble[0].parentNode); if(boOn) $parent.append($bubble); else $bubble.detach();}

  strTitle=(typeof strTitle==='undefined')?'':strTitle;
  //var $deleteButton=$('<img>').attr({src:uDelete}).mouseover(function(){$(this).attr({src:uDelete1})}).mouseout(function(){$(this).attr({src:uDelete})})
  //     .click(function(){$bubble.closeFunc();}).css({cursor:'pointer'});
  var $deleteButton=$('<div>').append('✘').click(function(e){
    $bubble.closeFunc(); e.preventDefault(); 
    return false;
  });
  if(!boTouch) {  $deleteButton.mouseover(function(){$(this).css({'font-weight':'bold', color:'white'});}).mouseout(function(){$(this).css({'font-weight':'', color:''});});  }


  var strEventStart='mousedown', strEventMove='mousemove', strEventEnd='mouseup'; if(boTouch){strEventStart='touchstart'; strEventMove='touchmove'; strEventEnd='touchend';}

  var floatSize=1.30;
  $deleteButton.css({flex:'0 0 '+floatSize+'em', cursor:'pointer', background:'red'}); 

  var $dragBarA=$('<div>').append('⌜'), $dragBarB=$('<div>').append('&nbsp;&nbsp;'), $dragBarC=$('<div>').append('⌝');
  var $DragBar=$([]).push($dragBarA).push($dragBarB).push($dragBarC).css({ background:'darkgrey', flex:'1 1 33%'});
  $DragBar.add($deleteButton).css({height:'100%', 'box-sizing':'border-box', 'text-align':'center'});
  if(boIOS) {  $DragBar.add($deleteButton).css({width:'25%', 'box-sizing':'border-box', display:'inline-block', 'vertical-align':'top'});  }
  $dragBarB.css({background:'grey'});

  var $title=$('<div>').append(strTitle).css({color:'white', position:'absolute', top:'0px', 'text-align':'center', width:'100%', 'white-space':'nowrap'});
  var $bar=$('<div>').append($dragBarA, $dragBarB, $deleteButton, $dragBarC, $title).css({height:floatSize+'em',position:'relative',display:'flex'}); //
  //if(boIOS) $deleteButton.detach();
  $bubble.prepend($bar);
 
  $dragBarA.on(strEventStart,mouseDownNW).css({cursor:'nw-resize'});
  $dragBarB.on(strEventStart,mouseDownGrab).css({cursor:'-webkit-grab'});
  $dragBarC.on(strEventStart,mouseDownNE).css({cursor:'ne-resize'});

//⬌⬍↔↕╔╗

  $title.prop({UNSELECTABLE:"on"}).addClass('unselectable');
  
  $area.click(function(e){ if($bubble[0].parentNode) $bubble.closeFunc();  else {  e.stopPropagation();  $bubble.openFunc();  }    });  //setBubblePos(e);
  
  $bubble.css({left:'0px',top:'0px', 'box-sizing':'border-box', 'min-width':'8em'});
  return $bubble;
}

function popupDragExtendM($area,$bubble,strTitle,$parent){ 
  $bubble.css({position:'absolute','z-index':200,'background-color':'#ccc','text-align':'left',padding:'0em',border:'solid black 1px'}); 
  //var z=$area.css('z-index');
  //$bubble.css({'z-index':9005,'text-align':'left'});   
  
 
  $bubble=popupDragExtend($area,$bubble,strTitle,$parent);    
  return $bubble;
}

