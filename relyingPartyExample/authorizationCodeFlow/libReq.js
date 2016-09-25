


"use strict"


/******************************************************************************
 * reqIndex
 ******************************************************************************/
app.reqIndex=function*() {
  var req=this.req, res=this.res;
  var Str=[];
  Str.push('<!DOCTYPE html>');
  Str.push('<html>');
  Str.push('<head>');
  Str.push('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>');
  Str.push("<meta name='viewport' id='viewportMy' content='initial-scale=1'/>");

  var uJQuery='https://code.jquery.com/jquery-latest.min.js';
  Str.push("<script src='"+uJQuery+"'></script>");

  Str.push('<script src="client.js"></script>');

  Str.push("<script>\n\
leafLoginBack="+JSON.stringify(leafLoginBack)+";\n\
leafBE="+JSON.stringify(leafBE)+";\n\
uRedir="+JSON.stringify(uRedir)+";\n\
AppId="+JSON.stringify(AppId)+";\n\
UrlOAuth="+JSON.stringify(UrlOAuth)+";\n\
  </script>");
  Str.push("</head>");
  Str.push('<body>');
  Str.push("</body></html>");

  var str=Str.join('\n');   res.writeHead(200, "OK", {'Content-Type': 'text/html'});   res.end(str);    
}



/******************************************************************************
 * reqLoginBack
 ******************************************************************************/
app.reqLoginBack=function*() {
  var req=this.req, res=this.res;
  var str='<!DOCTYPE html>\n\
<html><head><meta name="robots" content="noindex"></head>\n\
<body>\n\
<script>\n\
var strQS=location.search;\n\
var strHash=location.hash;\n\
window.opener.loginReturn(strQS,strHash);\n\
window.close();\n\
</script>\n\
</body>\n\
</html>';
  res.writeHead(200, "OK", {'Content-Type': 'text/html'});  res.end(str);
}






