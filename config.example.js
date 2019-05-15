

//
// For variable naming convention see https://emagnusandersson.com/prefixes_to_variables
//


intDDOSMax=200; // intDDOSMax: How many requests before DDOSBlocking occurs. 
tDDOSBan=5; // tDDOSBan: How long in seconds till the blocking is lifted

strSalt='abcdefghij'; // Random letters to prevent that the hashed passwords looks the same as on other sites.

strSaltID='klmnopqrstu'; // Random letters to prevent that the hashed IDs can be predicted.

googleSiteVerification="googleXXXXXXXXXXXXXXXX.html"; // Needed if you use Google Webmaster Tools  (www.google.com/webmasters)

  // Sendgrid credentials
apiKeySendGrid="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
//sendgridName="appXXXXXXX@heroku.com"; sendgridPassword="XXXXXXXXXXXX";

  //
  //  Since one might want use the software on several different infrastrucures (heroku.com, appfog.com, digitalocean.com, localhost ...),
  //  then I personally use an environment variable "strInfrastructure" on respective site, set to either to 'heroku', 'af', 'do' or nothing assigned (localhost)
  //  This way one can use the same config file for all the infrastructures.
  //

if(process.env.strInfrastructure=='heroku'){  
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

  
}
else if(process.env.strInfrastructure=='af'){

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

}else if(process.env.strInfrastructure=='do'){
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
}
else {
  uriDB='mysql://user:password@localhost/database';
  boDbg=1;

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

  //port = process.argv[2] || 8084;
  //port = port || 8084;
  var wwwLocalhost='localhost:'+port, www192='192.168.0.5:'+port;
  Site={
    "id192":{wwwSite:www192, strRootDomain:"192Loc", googleAnalyticsTrackingID:"", boTLS:0},
    idLoc:{wwwSite:wwwLocalhost, strRootDomain:"localhost", googleAnalyticsTrackingID:"", boTLS:0}
  }

  //levelMaintenance=1;
} 





//
// If you are using TLS (SSL) on localhost and possibly on other (untested) sites (heroku and appfog see below):
// ===============================================================================================================
//
// The array "TLSData" (below) is used for storing key/certificate-pairs.
//
// TLSData properties:
//   *domainReg: A "regular expression": when a request comes, its domain is tested to this regular expression to
//    see if the certificate in question is to be used, if the test fail, then the next entry's domainReg is
//    tested etc.
//   *strKey/strCert: Private key and public key certificate (as a pem-string) 
//     *Also notice that newlines (in strKey/strCert) needs to be escaped (like so: '\n') and the 
//      "newline-to-get-a-comfortable-syntax" also needs a '\'-character to be "neglected". So write an '\n\' at
//      the end of each line and you will be fine. (One can't have newlines in the JSON syntax)
//


/*
TLSData=[
  {
    domainReg:"^localhost(:[0-9]{1,5})?$",
    strKey:"-----BEGIN RSA PRIVATE KEY-----\n\
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\
XXXXX(about 13 rows of text)XXXXX\n\
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\
-----END RSA PRIVATE KEY-----",
    strCert:"-----BEGIN CERTIFICATE-----\n\
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\
XXXXX(about 14 rows of text)XXXXX\n\
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\
-----END CERTIFICATE-----"
  }
];
*/


//
// If you are using TLS (SSL) on Heroku and Appfog :
// =================================================
//
// Heroku and Appfog implements the TLS layer seperatly so the TLSData-variable is not used.
//
// On heroku.com:
// *On YOURAPP.herokuapp.com addresses you don't have to bother with certificates at all. 
// *For custom domain names you enter your keys/certificates in any of herokus interfaces (I assume, I haven't
// tried this, because of their fees).
// When you have the app started you can switch between using TLS or not under the siteTab View




// How to get a certificate:
// =========================
// On custom domain names you have get a certificate from a Certificate Authority "CA".
// On localhost you can create a self signed certificate.  Notice that no browser will trust a self signed
// certificate, so you'll get warning messages that the site is not trusted.
//





//
// See also under the "Default config variables" in the script.js-file for more variables that can be configured.
//



