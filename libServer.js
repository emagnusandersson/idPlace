







//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




app.createManifest=function(siteName){
  var site=Site[siteName], {wwwSite, icons}=site;
  var uSite="https://"+wwwSite;
  let objOut={theme_color:"#ff0", background_color:"#fff", display:"minimal-ui", prefer_related_applications:false, short_name:siteName, name:siteName, start_url: uSite, icons }

  //let str=serialize(objOut);
  let str=JSON.stringify(objOut);
  return str;
}

app.createManifestNStoreToCache=async function(siteName){
  var strT=createManifest(siteName);
  var buf=Buffer.from(strT, 'utf8');
  var [err]=await CacheUri.set(siteName+'/'+leafManifest, buf, 'json', true, false);   if(err) return [err];
  return [null];
}
app.createManifestNStoreToCacheMult=async function(SiteName){
  for(var i=0;i<SiteName.length;i++){
    var [err]=await createManifestNStoreToCache(SiteName[i]);   if(err) return [err];
  }
  return [null];
}





