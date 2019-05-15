


"use strict"


/******************************************************************************
 * reqIndex
 ******************************************************************************/
app.reqIndex=function*() {
  var req=this.req, res=this.res;
  var uJQuery='https://code.jquery.com/jquery-latest.min.js';
  var Str=[];
  Str.push(`<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta name='viewport' id='viewportMy' content='initial-scale=1'/>
<script src='`+uJQuery+`'></script>
<script src="client.js"></script>
<script>
var leafLoginBack=`+JSON.stringify(leafLoginBack)+`;
var leafBE=`+JSON.stringify(leafBE)+`;
var uRedir=`+JSON.stringify(uRedir)+`;
var AppId=`+JSON.stringify(AppId)+`;
var UrlOAuth=`+JSON.stringify(UrlOAuth)+`;
</script>
</head>
<body>
</body></html>`);

  var str=Str.join('\n');   res.writeHead(200, "OK", {'Content-Type': 'text/html'});   res.end(str);    
}



/******************************************************************************
 * reqLoginBack
 ******************************************************************************/
app.reqLoginBack=function*() {
  var req=this.req, res=this.res;
  var str=`<!DOCTYPE html>
<html><head><meta name="robots" content="noindex"></head>
<body>
<script>
var strQS=location.search;
var strHash=location.hash;
window.opener.loginReturn(strQS,strHash);
window.close();
</script>
</body>
</html>`;
  res.writeHead(200, "OK", {'Content-Type': 'text/html'});  res.end(str);
}






