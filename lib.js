"use strict"

//var app;  if(typeof window!=='undefined') app=window; else if(typeof global!=='undefined') app=global; else app=self;  // if browser else if server else serviceworker
//var app=globalThis;
globalThis.app=globalThis;

Promise.prototype.toNBP=function(){   return this.then(a=>{return [null,a];}).catch(e=>{return [e];});   }  // toNodeBackPromise

//
// String
//

app.ucfirst=function(string){  return string.charAt(0).toUpperCase() + string.slice(1);  }
app.isAlpha=function(star){  var regEx = /^[a-zA-Z0-9]+$/;  return str.match(regEx); } 
//String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g,"");}


app.ltrim=function(str,charlist){
  if(charlist === undefined) charlist = "\\s";
  return str.replace(new RegExp("^[" + charlist + "]+"), "");
};
app.rtrim=function(str,charlist){
  if (charlist === undefined) charlist = "\\s";
  return str.replace(new RegExp("[" + charlist + "]+$"), "");
};
app.trim=function(str,charlist){
  return ltrim(rtrim(str,charlist),charlist);
};

app.arrArrange=function(arrV,arrI){
  var arrNew=[]; if(typeof arrV=='String') arrNew='';
  //for(var i=0;i<arrI.length;i++){    arrNew.push(arrV[arrI[i]]);    }
  for(var i=0;i<arrI.length;i++){    arrNew[i]=arrV[arrI[i]];    }
  return arrNew;
}
app.pad2=function(n) {return (n<10?'0':'')+n;}
app.calcLabel=function(Label,strName){ var strLabel=ucfirst(strName); if(strName in Label) strLabel=Label[strName]; return strLabel;}

app.urldecode=function(url) {
  return decodeURIComponent(url.replace(/\+/g, ' '));
}


//extractLoc=function(obj,strObjName){   // Ex: eval(extractLoc(objMy,'objMy'));
  //var Str=[];  for(var key in obj) Str.push(key+'='+strObjName+'.'+key);
  //var str=''; if(Str.length) str='var '+Str.join(', ')+';';  return str;
//}
////extract=function(obj){  for(var key in obj){  window[key]=obj[key];  }  }
//extract=function(obj,par){
  //if(typeof par=='undefined') par=app; for(var key in obj){
    //par[key]=obj[key];
  //}
//}
//extractLocSome=function(strObjName,arrSome){  // Ex: eval(extractLocSome('objMy',['a','b']));
  //if(typeof arrSome=='string') arrSome=[arrSome];
  //var len=arrSome.length, Str=Array(len);  for(var i=0;i<len;i++) { var key=arrSome[i]; Str[i]=key+'='+strObjName+'.'+key; }
  //return 'var '+Str.join(', ')+';';
//}



app.endsWith=function(str,end){return str.substr(-end.length)==end;}


//
// Array
//

app.arr_max=function(arr){return Math.max.apply(null, arr);}
app.arr_min=function(arr){return Math.min.apply(null, arr);}

app.array_flip=function(A){ var B={}; for(var i=0;i<A.length;i++){B[A[i]]=i;} return B;}
app.array_fill=function(n, val){ return Array.apply(null, new Array(n)).map(String.prototype.valueOf,val); }
app.array_merge=function(){  return Array.prototype.concat.apply([],arguments);  } // Does not modify origin
//array_mergeM=function(a,b){  a.push.apply(a,b); return a; } // Modifies origin (first argument)
app.array_mergeM=function(){var t=[], a=arguments[0], b=t.slice.call(arguments, 1), c=t.concat.apply([],b); t.push.apply(a,c); return a; } // Modifies origin (first argument)

app.AMinusB=function(A,B){var ANew=[]; for(var i=0;i<A.length;i++){var a=A[i]; if(B.indexOf(a)==-1) ANew.push(a);} return ANew;}  // Does not change A, returns ANew

app.mySplice1=function(arr,iItem){ var item=arr[iItem]; for(var i=iItem, len=arr.length-1; i<len; i++)  arr[i]=arr[i+1];  arr.length = len; return item; }  // GC-friendly splice
app.myCopy=function(arr,brr){  if(typeof arr=="undefined") arr=[]; for(var i=0, len=brr.length; i<len; i++)  arr[i]=brr[i];  arr.length = len; return arr; }  // GC-friendly copy

app.is_array=function(a){return a instanceof Array;}
app.in_array=function(needle,haystack){ return haystack.indexOf(needle)!=-1;}
app.array_filter=function(A,f){f=f||function(a){return a;}; return A.filter(f);}

app.array_removeInd=function(a,i){a.splice(i,1);}


app.arrValMerge=function(arr,val){  var indOf=arr.indexOf(val); if(indOf==-1) arr.push(val); }
//arrValRemove=function(arr,val){  var indOf=arr.indexOf(val); if(indOf!=-1) arr.splice(indOf,1); }
app.arrValRemove=function(arr,val){  var indOf=arr.indexOf(val); if(indOf!=-1) mySplice1(arr,indOf); }

//
// Str (Array of Strings)
//

app.StrComp=function(A,B){var lA=A.length; if(lA!==B.length) return false; for(var i=0;i<lA;i++){ if(A[i]!==B[i]) return false;} return true;}

//
// Object
//

app.extend=Object.assign;
app.copySome=function(a,b,Str){for(var i=0;i<Str.length;i++) { var name=Str[i]; a[name]=b[name]; } return a; }
app.object_values=function(obj){
  var arr=[];      for(var name in obj) arr.push(obj[name]);
  return arr;
}
app.isEmpty=function(obj) {    return Object.keys(obj).length === 0;  }
app.copyDeep=function(objI) { return JSON.parse(JSON.stringify(objI));};
app.myFlip=function(A){ var B={}; for(var k in A){B[A[k]]=k;} return B;} // Flips key and values

/*JSON.myParse=function(str){
    try{
        return [null, JSON.parse(str)];
    }catch(err){
        return [err, undefined];
    }
}*/


//
// Dates and time
//

Date.prototype.toUnix=function(){return Math.round(this.valueOf()/1000);}
Date.prototype.toISOStringMy=function(){return this.toISOString().substr(0,19);}
app.arrMonths=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
app.arrDay=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
app.arrDay=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
app.mySwedDate=function(tmp){ 
  if(!tmp) return tmp;
  var t=UTC2JS(tmp), now=new Date(), diff=(Number(now)-Number(t))/1000; //, y=t.getFullYear(), mo=t.getMonth(), d=t.getDate();
  if(diff>3600*24*365) return Math.floor(diff/(3600*24*365))+'y'; 
  if(diff>3600*24*275) return '¾y'; 
  if(diff>3600*24*183) return '½y'; 
  if(diff>3600*24*91) return '¼y'; 
  //if(diff>3600*24*60) return '2mo'; 
  if(diff>3600*24*7) return Math.floor(diff/(3600*24*7))+'w'; 
  if(diff>3600*24*2) return Math.floor(diff/(3600*24))+'d'; 
  if(diff>3600) return Math.floor(diff/3600)+'h';
  if(diff>60*45) return '¾h';  
  if(diff>60*30) return '½h';  
  if(diff>60*15) return '¼h';  
  return '0h'; 
  //if(diff>3600*24*90) return arrMonths[t.getMonth()]); // After 90 days, use Month
  //if(diff>3600*24*4) return arrMonths[t.getMonth()]+'-'+pad2(t.getDate()); // After 4 days, use Month-Date
  //var day=t.getDay(); if(diff>3600*24) return arrDay[t.getDay()]; // After 1 day, use Weekday
  //if(diff>3600) return Math.floor(diff/3600)+'h ago'; // After 1 hour, use Hours
  //return Math.floor(diff/60)+'min';  // Else use Minutes
}
app.swedDate=function(tmp){ if(tmp){tmp=UTC2JS(tmp);  tmp=tmp.getFullYear()+'-'+pad2(tmp.getMonth()+1)+'-'+pad2(tmp.getDate());}  return tmp;}
app.swedTime=function(tmp){ if(tmp){tmp=UTC2JS(tmp);  tmp=tmp.getFullYear()+'-'+pad2(tmp.getMonth()+1)+'-'+pad2(tmp.getDate())+' '+pad2(tmp.getHours())+':'+pad2(tmp.getMinutes());}  return tmp;}
app.UTC2JS=function(utcTime){ var tmp=new Date(Number(utcTime)*1000);  return tmp;  }
app.UTC2Readable=function(utcTime){ var tmp=new Date(Number(utcTime)*1000);   return tmp.toLocaleString();  }
//myISODATE=function(d){ return d.toISOString().substr(0,19);}
//unixNowMS=function(){var tmp=new Date(); return Number(tmp);}
//unixNow=function(){return Math.round(unixNowMS()/1000);}
app.unixNow=function(){return (new Date()).toUnix();}

app.getSuitableTimeUnit=function(t){ // t in seconds
  var tAbs=Math.abs(t), tSign=t>=0?+1:-1;
  if(tAbs<=90) return [tSign*tAbs,'s'];
  tAbs/=60; // t in minutes
  if(tAbs<=90) return [tSign*tAbs,'m']; 
  tAbs/=60; // t in hours
  if(tAbs<=36) return [tSign*tAbs,'h'];
  tAbs/=24; // t in days
  if(tAbs<=2*365) return [tSign*tAbs,'d'];
  tAbs/=365; // t in years
  return [tSign*tAbs,'y'];
}
app.getSuitableTimeUnitStr=function(tdiff,objLang=langHtml.timeUnit,boLong=0,boArr=0){
  var [ttmp,u]=getSuitableTimeUnit(tdiff), n=Math.round(ttmp);
  var strU=objLang[u][boLong][Number(n!=1)];
  if(boArr){  return [n,strU];  } else{  return n+' '+strU;   }
}
app.dosTime2Arr=function(dosDate,dosTime){
  var sec=(dosTime & 0x1f)*2;
  var minute=dosTime>>>5 & 0x3f;
  var hour=dosTime>>>11 & 0x1f;
  var date=dosDate & 0x1f;
  var month=dosDate>>>5 & 0xf;
  var year=1980+(dosDate>>>9 & 0x7f);
  return [year, month, date, hour, minute, sec];
}

app.dosTime2t=function(dosDate,dosTime){ //dosTime interpreted as local time
  var arr=dosTime2Arr(dosDate,dosTime);
  return new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]);
}

app.dosTime2tUTC=function(dosDate,dosTime){ //dosTime interpreted as UTC time
  var arr=dosTime2Arr(dosDate,dosTime);
  arr[1]=arr[1]-1;
  return new Date(Date.UTC.apply(undefined,arr));
}



app.t2dosTime=function(t){
  var sec=t.getSeconds();
  var minute=t.getMinutes();
  var hour=t.getHours();
  var date=t.getDate();
  var month=t.getMonth()+1;
  var year=t.getFullYear();
  var dosTime= Math.round(sec/2) |minute<<5 |hour<<11;
  var dosDate=date |month<<5 |(year-1980)<<9;
  return {dosDate,dosTime};
}

//
// Random
//

app.randomInt=function(min, max){    return min + Math.floor(Math.random() * (max - min + 1));  }
app.randomHash=function(){ return Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);}
app.genRandomString=function(len) {
  //var characters = 'abcdefghijklmnopqrstuvwxyz';
  var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var str ='';    
  for(var p=0; p<len; p++) {
    str+=characters[randomInt(0, characters.length-1)];
  }
  return str;
}

//
// Math
//

app.isNumber=function(n) { return !isNaN(parseFloat(n)) && isFinite(n);}
app.sign=function(val){if(val<0) return -1; else if(val>0) return 1; else return 0;}

app.bound=function(value, opt_min, opt_max) {
  if (opt_min != null) value = Math.max(value, opt_min);
  if (opt_max != null) value = Math.min(value, opt_max);
  return value;
}

app.closest2Val=function(v, val){
  var bestFit=Number.MAX_VALUE, curFit, len=v.length, best_i;
  for(var i=0;i<len;i++){
    curFit=Math.abs(v[i]-val);
    if(curFit<bestFit) {bestFit=curFit; best_i=i;}
  }
  return [v[best_i],best_i];
}


//
// Data Formatting
//

app.arrObj2TabNStrCol=function(arrObj){ //  Ex: [{abc:0,def:1},{abc:2,def:3}] => {tab:[[0,1],[2,3]],StrCol:['abc','def']}
  var Ou={tab:[]}, lenI=arrObj.length, StrCol=[]; if(!lenI) return Ou;
  StrCol=Object.keys(arrObj[0]);  var lenJ=StrCol.length;
  for(var i=0;i<lenI;i++) {
    var row=arrObj[i], rowN=Array(lenJ);
    for(var j=0;j<lenJ;j++){ var key=StrCol[j]; rowN[j]=row[key]; }
    Ou.tab.push(rowN);
  }
  Ou.StrCol=StrCol;
  return Ou;
}
app.tabNStrCol2ArrObj=function(tabNStrCol){  //Ex: {tab:[[0,1],[2,3]],StrCol:['abc','def']}    =>    [{abc:0,def:1},{abc:2,def:3}] 
  var tab=tabNStrCol.tab, StrCol=tabNStrCol.StrCol, arrObj=Array(tab.length);
  for(var i=0;i<tab.length;i++){
    var row={};
    for(var j=0;j<StrCol.length;j++){  var key=StrCol[j]; row[key]=tab[i][j];  }
    arrObj[i]=row;
  }
  return arrObj;
}

app.deserialize=function(serializedJavascript){
  return eval('(' + serializedJavascript + ')');
}


app.b64UrlDecode=function(b64UrlString, boUint8Array=false){  // boUint8Array==true => output is in Uint8Array
  const padding='='.repeat((4-b64UrlString.length%4) % 4);
  const base64=(b64UrlString+padding).replace(/\-/g, '+').replace(/_/g, '/');

  //const rawData=window.atob(base64);
  const rawData=Buffer.from(base64, 'base64').toString();
  if(!boUint8Array) return rawData;
  const outputArray=new Uint8Array(rawData.length);

  for(let i=0; i<rawData.length; ++i){ outputArray[i]=rawData.charCodeAt(i); }
  return outputArray;
}

app.blobToBase64=function(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

app.parseQS2=function(qs){
  var objQS={}, objTmp=new URLSearchParams(qs);
  for(const [name, value] of objTmp) {  objQS[name]=value;  }
  return objQS;
}

//
// Escaping data
//

app.myJSEscape=function(str){return str.replace(/&/g,"&amp;").replace(/</g,"&lt;");}
  // myAttrEscape
  // Only one of " or ' must be escaped depending on how it is wrapped when on the client.
app.myAttrEscape=function(str){return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/\//g,"&#47;");} // This will keep any single quataions.
app.myLinkEscape=function(str){ str=myAttrEscape(str); if(str.startsWith('javascript:')) str='javascript&#58;'+str.substr(11); return str; }


//
// Misc
//

app.isScopeOK=function(strScope,strScopeAsked){
  for(var i=0;i<strScopeAsked.length;i++){
    var tmp=strScopeAsked[i];     if(strScope.indexOf(tmp)==-1) return false;
  }
  return true;
}





app.createUriRedir=function(uriIn,strStateVar,access_token,expires_in){
  return uriIn+'#'+['state='+strStateVar, 'access_token='+access_token, 'expires_in='+expires_in].join('&');
}
app.createUriRedirCode=function(uriIn,strStateVar,code){
  return uriIn+'?'+['state='+strStateVar, 'code='+code].join('&');
}
app.createUriRedirDeny=function(uriIn,strStateVar){
  return uriIn+'#'+['state='+strStateVar, 'error=access_denied'].join('&');
}
app.createUriRedirCodeDeny=function(uriIn,strStateVar){
  return uriIn+'?'+['state='+strStateVar, 'error=access_denied'].join('&');
}

app.parseQS=function(str){
  var params = {},      regex = /([^&=]+)=([^&]*)/g, m;
  while (m = regex.exec(str)) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }
  return params;
}





    


