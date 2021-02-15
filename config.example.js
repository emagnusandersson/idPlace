

//
// For variable naming convention see https://emagnusandersson.com/prefixes_to_variables
//


intDDOSMax=200; // intDDOSMax: How many requests before DDOSBlocking occurs. 
tDDOSBan=5; // tDDOSBan: How long in seconds till the blocking is lifted


googleSiteVerification="googleXXXXXXXXXXXXXXXX.html"; // Needed if you use Google Webmaster Tools  (www.google.com/webmasters)
strSalt='abcdefghij'; // Random letters to prevent that the hashed passwords looks the same as on other sites.

strSaltID='klmnopqrstu'; // Random letters to prevent that the hashed IDs can be predicted.


strFBVersion="v9.0"
UrlOAuth={fb:"https://www.facebook.com/"+strFBVersion+"/dialog/oauth", google:"https://accounts.google.com/o/oauth2/v2/auth"}
UrlToken={fb:"https://graph.facebook.com/"+strFBVersion+"/oauth/access_token", google:"https://accounts.google.com/o/oauth2/token"}
UrlGraph={fb:"https://graph.facebook.com/"+strFBVersion+"/me", google:"https://www.googleapis.com/plus/v1/people/me"}; 

strIPPrim='fb';  strIPAlt='google';

  // Sendgrid credentials
apiKeySendGrid="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
//sendgridName="appXXXXXXX@heroku.com"; sendgridPassword="XXXXXXXXXXXX";

  //
  //  Since one might want use the software on several different infrastrucures (heroku.com, appfog.com, digitalocean.com, localhost ...),
  //  then I personally use an environment variable "strInfrastructure" on respective site, set to either to 'heroku', 'af', 'do' or nothing assigned (localhost)
  //  This way one can use the same config file for all the infrastructures.
  //

if(process.env.strInfrastructure=='af'){

    // Setting what port number to use:
  port = parseInt(process.env.VCAP_APP_PORT, 10);
 
    // Setting uriDB 
    // If you added the MySql-database on the appfog.com-interface then that one is used.
  if('VCAP_SERVICES' in process.env) {
    var tmp=process.env.VCAP_SERVICES, services_json = JSON.parse(tmp);
    var mysql_config = services_json["mysql-5.1"][0]["credentials"];
    var sqlUserName = mysql_config["username"];
    var sqlPassword = mysql_config["password"];
    var sqlHost = mysql_config["hostname"];
    var portTmp = mysql_config["port"];
    var sqlDBName = mysql_config["name"];
    uriDB="mysql://"+sqlUserName+':'+sqlPassword+'@'+sqlHost+'/'+sqlDBName+"?reconnect=true";
  }
    // If you want to use some other urlDB then fill it in here
  //uriDB='mysql://user:password@localhost/database';



  RootDomain={
    exampleDomain:{
      fb:{id:"XXXXXXXXXXXXXXX", secret:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"}
    }
  }

 
  Site={
    id:{wwwSite:"id.example.com", strRootDomain:"exampleDomain", googleAnalyticsTrackingID:"", boTLS:1}
  }

  //levelMaintenance=1;
  strReCaptchaSiteKey="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";   strReCaptchaSecretKey="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

}
else if(process.env.strInfrastructure=='heroku'){
    // Setting what port number to use:
  port = parseInt(process.env.PORT, 10); 


    // Setting uriDB
    // If you added the ClearDB-database on the heroku.com-interface then that one is used.
  if('CLEARDB_DATABASE_URL' in process.env) uriDB=process.env.CLEARDB_DATABASE_URL;
    // If you want to use some other urlDB then fill it in here
  //uriDB='mysql://user:password@localhost/database';


  RootDomain={
    exampleDomain:{
      fb:{id:"XXXXXXXXXXXXXXX", secret:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"}
    },
    herokuappCom:{
      fb:{id:"XXXXXXXXXXXXXXX", secret:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"},
    }
  }

 
  Site={
    id:{wwwSite:"id.example.com", strRootDomain:"exampleDomain", googleAnalyticsTrackingID:"", boTLS:1},
    idS:{wwwSite:"idplace.herokuapp.com", strRootDomain:"herokuappCom", googleAnalyticsTrackingID:"", boTLS:1}
  }
  
    // If levelMaintenance=1 then site visitors gets a "Down for maintenance"-message
  //levelMaintenance=1;

  
  strReCaptchaSiteKey="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";   strReCaptchaSecretKey="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
}
else if(process.env.strInfrastructure=='do'){
  uriDB='mysql://user:password@localhost/database';

  RootDomain={
    exampleDomain:   {
      fb:{id:"XXXXXXXXXXXXXXX", secret:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"},
      google:{id: "", secret:""}
    }
  }

  port = 8084;  
  Site={
    id:{wwwSite:"id.example.com", strRootDomain:"exampleDomain", googleAnalyticsTrackingID:"", boTLS:1}
  }

  //levelMaintenance=1;
  
  strReCaptchaSiteKey="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";   strReCaptchaSecretKey="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
}
else {
  boDbg=1;
  uriDB='mysql://user:password@localhost/database';

  RootDomain={
    localhost:   {
      fb:{id:"XXXXXXXXXXXXXXX", secret:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"},
      google:{id: "", secret:""}
    },
    "192Loc":   {
      fb:{id:"XXXXXXXXXXXXXXX", secret:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"},
      google:{id: "", secret:""}
    }
  }


  boUseSSLViaNodeJS=true;
  
  //port = process.argv[2] || 8084;
  //port = port || 8084;
  var www192=ip.address();
  var wwwLocalhost='localhost:'+port, www192WPort=www192+':'+port;
  Site={
    "id192":{wwwSite:www192WPort, strRootDomain:"192Loc", googleAnalyticsTrackingID:"", boTLS:1},
    idLoc:{wwwSite:wwwLocalhost, strRootDomain:"localhost", googleAnalyticsTrackingID:"", boTLS:1}
  }

  //levelMaintenance=1;
  
  strReCaptchaSiteKey="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";   strReCaptchaSecretKey="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
  
} // End of boLocal




//
// See also under the "Default config variables" in the script.js-file for more variables that can be configured.
//



