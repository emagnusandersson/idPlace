







//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

getSessionMain=function(){ 
  var redisVar=this.req.sessionID+'_Main', strTmp=wrapRedisSendCommand('get',[redisVar]);   this.sessionMain=JSON.parse(strTmp);
}
setSessionMain=function(){
  var strA=JSON.stringify(this.sessionMain);
  var redisVar=this.req.sessionID+'_Main', strTmp=wrapRedisSendCommand('set',[redisVar,strA]);   var tmp=wrapRedisSendCommand('expire',[redisVar,maxUnactivity]);
}
resetSessionMain=function(){
  this.sessionMain={};
  setSessionMain.call(this);
  //var strA=JSON.stringify(this.sessionMain);
  //var redisVar=this.req.sessionID+'_Main', tmp=wrapRedisSendCommand('set',[redisVar,strA]);     var tmp=wrapRedisSendCommand('expire',[redisVar,maxUnactivity]);
}










