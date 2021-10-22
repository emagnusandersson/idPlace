


app.two31=Math.pow(2,31);  app.intMax=two31-1;  app.intMin=-two31;
app.two32=2*two31; app.uint32Max=two32-1;
app.sPerDay=24*3600;  app.sPerMonth=sPerDay*30;



var fsWebRootFolder=process.cwd();
var flLibFolder='lib';

var flFoundOnTheInternetFolder=flLibFolder+"/foundOnTheInternet";
app.flLibImageFolder=flLibFolder+"/image";  

  // Files: 
app.leafBE='be.json';
app.leafVerifyEmailReturn='verifyEmail';
app.leafVerifyPWResetReturn='verifyPWReset';
app.leafManifest='manifest.json';
app.leafDataDelete='dataDelete';
app.leafDataDeleteStatus='dataDeleteStatus';
app.leafDeAuthorize='deAuthorize';


//lenGZ=100;
app.nHash=1000;


//StrImageExt=['jpg','jpeg','png','gif','svg'];


//version='100';
//maxGroupsInFeat=20;
//preDefault="u.";



//strDBPrefix='mID';
var StrTableKey=["user2App", "imageApp", "app", "setting", "admin", "image", "user"]; //,"cache" , "siteDefault"
var StrViewsKey=[]; 

var TableNameProt={};for(var i=0;i<StrTableKey.length;i++) TableNameProt[StrTableKey[i]]='';
var ViewNameProt={};for(var i=0;i<StrViewsKey.length;i++) ViewNameProt[StrViewsKey[i]]='';


//specialistDefault={user:0,developer:0,admin:0};

var StrProp=['name', 'password', 'image', 'email', 'boEmailVerified', 'telephone',   'country', 'federatedState', 'county', 'city', 'zip', 'address', 'timeZone', 'idFB', 'idGoogle', 'idNational', 'birthdate', 'motherTongue', 'gender'];
app.Prop={};
for(var i=0;i<StrProp.length;i++){  var strName=StrProp[i];  Prop[strName]={};  }




/***************************************************************************
 * SiteExtend
 ***************************************************************************/

var siteCalcValExtend=function(site,siteName){ // Adding stuff that can be calculated from the other properties

  site.TableName={};   for(var name in TableNameProt){  site.TableName[name+"Tab"]=siteName+'_'+name; }
  site.ViewName={}; for(var name in ViewNameProt){  site.ViewName[name+"View"]=siteName+'_'+name; }


}

var IntSizeIcon=[16, 114, 192, 200, 512, 1024];
app.IntSizeIconFlip=array_flip(IntSizeIcon);
app.SiteExtend=function(){
  Site.getSite=function(wwwReq){
    for(var i=0;i<SiteName.length;i++){
      var siteName=SiteName[i];   var tmp; if(tmp=Site[siteName].testWWW(wwwReq)) {return {siteName:siteName, wwwSite:tmp};  }
    }
    return {siteName:null};
  }
  for(var i=0;i<SiteName.length;i++){
    var siteName=SiteName[i], StrPlugIn=[];
    var tmp={siteName:siteName};
    var site=extend(Site[siteName],tmp);    
    site.testWWW=function(wwwReq){
      if(wwwReq.indexOf(this.wwwSite)==0) return this.wwwSite; else return false;
    };
    var objTmp=RootDomain[site.strRootDomain];  site.client_id={fb:objTmp.fb.id, google:objTmp.google.id};
    
    siteCalcValExtend(site,siteName);
    
    
    site.SrcIcon=Array(IntSizeIcon.length);
    site.icons=Array(IntSizeIcon.length);
    var strType='png', wsIconProt=site.wsIconProt || wsIconDefaultProt;
  
    IntSizeIcon.forEach((size, ind)=>{
      site.SrcIcon[ind]=wsIconProt.replace("<size>", size);
      site.icons[ind]={ src:site.SrcIcon[ind], type: mime.getType(strType), sizes: size+"x"+size, purpose: "any maskable" };
    });
  }
}


var nDBConnectionLimit=10, nDBQueueLimit=100, nDBRetry=14;

app.setUpMysqlPool=function(){
  var uriObj=url.parse(uriDB);
  var StrMatch=RegExp('^(.*):(.*)$').exec(uriObj.auth);
  var nameDB=uriObj.pathname.substr(1);
  var mysqlPool  = mysql.createPool({
    connectionLimit : nDBConnectionLimit,
    host            : uriObj.host,
    user            : StrMatch[1],
    password        : StrMatch[2],
    database        : nameDB,
    multipleStatements: true,
    waitForConnections:true,
    queueLimit:nDBQueueLimit,
    dateStrings:'date',
    flags:'-FOUND_ROWS'
  });
  mysqlPool.on('error',function(e){debugger});
  return mysqlPool;
}


//Domain={}; for(var k in Site) {Domain[k]=Site[k].wwwSite;}
//url2Site=myFlip(Domain);


