


"use strict"


/******************************************************************************
 * reqIndex
 ******************************************************************************/
app.reqIndex=async function() {
  var {req, res}=this;
  var Str=[];
  Str.push(`<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta name='viewport' id='viewportMy' content='initial-scale=1'/>
<script type="module" src="client.js"></script>
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
app.reqLoginBack=async function() {
  var {req, res}=this;
  var str=`<!DOCTYPE html>
<html lang="en"><head><meta name="robots" content="noindex"></head>
<body>
<script>
var {search:strQS, hash:strHash}=location;
window.opener.loginReturn(strQS,strHash);
window.close();
</script>
</body>
</html>`;
  res.writeHead(200, "OK", {'Content-Type': 'text/html'});  res.end(str);
}






