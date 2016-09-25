


two31=Math.pow(2,31);  intMax=two31-1;  intMin=-two31;
two32=2*two31; uint32Max=two32-1;
sPerDay=24*3600;  sPerMonth=sPerDay*30;



fsWebRootFolder=process.cwd();
flLibFolder='lib';

flFoundOnTheInternetFolder=flLibFolder+"/foundOnTheInternet";
flLibImageFolder=flLibFolder+"/image";  

  // Files: 
leafBE='be.json';
leafVerifyEmailReturn='verifyEmail';
leafVerifyPWResetReturn='verifyPWReset';


StrImageExt=['jpg','jpeg','png','gif','svg'];



version='100';
maxGroupsInFeat=20;
preDefault="u.";




//strDBPrefix='mID';
StrTableKey=["user2App", "imageApp", "app", "setting", "admin", "image", "user"]; //,"cache" , "siteDefault"
StrViewsKey=[]; 
//TableName={};for(var i=0;i<StrTableKey.length;i++) {var name=StrTableKey[i]; TableName[StrTableKey[i]+"Tab"]=strDBPrefix+'_'+name;}
//ViewName={};for(var i=0;i<StrViewsKey.length;i++) {var name=StrViewsKey[i]; ViewName[StrViewsKey[i]+"View"]=strDBPrefix+'_'+name;}

TableNameProt={};for(var i=0;i<StrTableKey.length;i++) TableNameProt[StrTableKey[i]]='';
ViewNameProt={};for(var i=0;i<StrViewsKey.length;i++) ViewNameProt[StrViewsKey[i]]='';
//extract(TableName);
//extract(ViewName);




specialistDefault={user:0,developer:0,admin:0};


var StrProp=['name', 'password', 'image', 'telephone', 'email', 'boEmailVerified',   'country', 'federatedState', 'city', 'zip', 'address', 'timeZone', 'idFB', 'idGoogle', 'birthdate', 'motherTongue', 'gender'];
Prop={};
for(var i=0;i<StrProp.length;i++){  var strName=StrProp[i];  Prop[strName]={};  }




/***************************************************************************
 * SiteExtend
 ***************************************************************************/

siteCalcValExtend=function(site,siteName){ // Adding stuff that can be calculated from the other properties

  site.TableName={};   for(var name in TableNameProt){  site.TableName[name+"Tab"]=siteName+'_'+name; }
  site.ViewName={}; for(var name in ViewNameProt){  site.ViewName[name+"View"]=siteName+'_'+name; }


}

SiteExtend=function(){
  Site.getSite=function(wwwReq){
    for(var i=0;i<SiteName.length;i++){
      var siteName=SiteName[i];   var tmp; if(tmp=Site[siteName].testWWW(wwwReq)) {return {siteName:siteName, wwwSite:tmp};  }
    }
    return false;
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
  }
}


nDBConnectionLimit=10; nDBQueueLimit=100;
nDBRetry=14;

setUpMysqlPool=function(){
  var uriObj=url.parse(uriDB); 
  var StrMatch=RegExp('^(.*):(.*)$').exec(uriObj.auth);
  var nameDB=uriObj.pathname.substr(1);
  mysqlPool  = mysql.createPool({
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
}


//Domain={}; for(var k in Site) {Domain[k]=Site[k].wwwSite;}
//url2Site=myFlip(Domain);


