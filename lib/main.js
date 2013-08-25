var pageMod = require("page-mod");
var contextMenu = require("context-menu");
var widget = require("widget")
var tabs = require("tabs");
//var userStyles = require("userstyles")
var self = require("self")
const data = self.data;
//var Request = require("request").Request;
//var {MatchPattern} = require("match-pattern");
//var pattern = new MatchPattern(/.*kingdomofloathing.*/);
var jqueryCSS = data.load('jquery-ui-1.8.16.custom.css');



var preferences = require("simple-prefs");
// helper stuff for preferences


var prefList = ["notifyOn", "timestampsOn", 'persistSystemMessages', 'watchWords', 'proxyTrigger', 'pmNotifyOn', 'loudTabs', 'splitPvP', 'pmEvents', 'chatMarkers'];

function getPrefObj(){
  var prefObj = new Object();
  for each (p in prefList){
      prefObj[p] = preferences.prefs[p];
  }
  return prefObj;
}

function setPrefs(prefObj){
  for each (p in prefList){
      preferences.prefs[p] = prefObj[p];
  }
}

function pushPrefs(){
  for each (w in workerTracker){
    w.chatWorker.port.emit("setPrefs", {prefs:getPrefObj()} )
    w.mainWorker.port.emit("setPrefs", {prefs:getPrefObj()} )
  }
}




// Set up pref listeners
for each (p in prefList){
  preferences.on(p, pushPrefs)
}


var workerTracker =[]

function getTrackerForTab( tab ){
  for (var i in workerTracker){
    if(tab === workerTracker[i].tab){
      console.log('returning existing tracker')
      return i;
    }
      
  }
  console.log('creating new tracker')
  var tracker = {"tab":tab};
  var l = workerTracker.push(tracker);
  return l-1;
}


function showQuickPanel(html){
  var panel = require("panel").Panel({
    contentURL: "data:text/html," + encodeURIComponent(html)
  });
  panel.show();
}



through = ['newChatMessage', 'newChatSubmission','chatDisplayReady', 'loadLink', 'chatDisplayInitData', 
          'loadPlayer', "requestPlayerHeader", "setPlayerHeader", 'requestPlayerStatus',
           'setPlayerStatus', 'setSpeakerId', 'setPlayerInfo', 'requestPlayerInfo',
           'setMenu', 'doPlayerAction'];
function detachWorker(){};

var prevTab;
var currentTracker;

widget.Widget({
  id: "kd-icon",
  label: "Kol Daemon Chat Trigger",
  content: "KD",
  width: 40,
  onClick: function() {
    var i = getTrackerForTab(tabs.activeTab);
    var tracker = workerTracker[i];

    if (tracker.mainWorker!=null)
      tracker.mainWorker.destroy();
    if (tracker.chatWorker!=null)
      tracker.chatWorker.destroy();

    var worker = tabs.activeTab.attach(mainPageModifier);
    tracker.mainWorker=worker;
    currentTracker = tracker;
    
    var testTab = tabs.activeTab;
    if (testTab === prevTab)
      console.log("Equality holds")
    else
      console.log("Not equal")

    prevTab = testTab;

    AfterAttach(worker);

  }
});


/*widget.Widget({
  id: "kd-test-icon",
  label: "Test Message",
  content: "tKD",
  width: 60,
  onClick: function() {
      console.log("CLICK tKD widget")
      //testMsg({"type":"event","msg":"You have been attacked by VinOven.","link":"messages.php?box=PvP","time":"1332957946"});
      testMsg({msg:"LotsOfPhil takes the hill!", type:"public", mid:"1307461017", who:{name:"Biggus", id:"-43", color:"green"}, format:"0", channel:"pvp", channelcolor:"#663399", time:"1335122096"});

  }
});*/

function testMsg(msg){
  for(var i in workerTracker){
    workerTracker[i].mainWorker.port.emit("testChatMessage", msg)
  }
}

function openPrefs(){
  require('window-utils').activeBrowserWindow
    .BrowserOpenAddonsMgr("addons://detail/"+require("self").id);
}

// Run after attaching to the main page
var AfterAttach = function(worker){

  var trackIndex = getTrackerForTab(tabs.activeTab);
  var tracker = workerTracker[trackIndex];
  
  tracker.mainWorker = worker;
  for (c in through){
    let (msgName = through[c]){
      responder = function(payload){ 
        console.log('message ' + msgName + " recieved from main worker #{trackIndex}");
        workerTracker[trackIndex].chatWorker.port.emit(msgName, payload)
      };
      worker.port.on(msgName, responder);
    }
  }

}

//Main page mod script
var includePatterns = new Array();

function setPatterns(){
  includePatterns = new Array();
  includePatterns.push(/.*kingdomofloathing\.com\/game\.php.*/)
  if (preferences.prefs.proxyTrigger == true){
    includePatterns.push(/.*localhost.*\/game\.php.*/)
    includePatterns.push(/.*127\.0\.0\.1.*\/game\.php.*/)
    
  }

  chatPatterns = new Array();
  chatPatterns.push(/.*kingdomofloathing\.com\/(chatlaunch|mchat).php.*/)
  if (preferences.prefs.proxyTrigger == true){
    chatPatterns.push(/.*localhost.*\/(chatlaunch|mchat)\.php.*/)
    chatPatterns.push(/.*127\.0\.0\.1.*\/(chatlaunch|mchat)\.php.*/)
    
  }

}

setPatterns();

var mainPageModifier = {
  include: includePatterns,
  //include: /.*FramesetTest.html/,
  contentScriptWhen: "ready",
  contentScriptFile: [ data.url('jquery-1.6.1.min.js'), 
        data.url('jquery-ui-1.8.16.custom.min.js'),
        data.url('kdNew.js') ],

   onAttach: function(worker) {
      console.log('attached')  
      worker.port.emit("setPrefs", {prefs: getPrefObj()})
      AfterAttach(worker);

  }
}

pageMod.PageMod( mainPageModifier );







// Chat page script
pageMod.PageMod({
  include: chatPatterns,
  contentScriptFile: [data.url('jquery-1.6.1.min.js'), 
        data.url('jquery-ui-1.8.16.custom.min.js'), 
        data.url('jquery.contextmenu.js'),
        data.url('chatDisplayNew.js') ],
  //contentScript: "window.document.body.innerHTML = " + "'" + data.load('daemonChat.html').replace(/\n/g, '') + "'",

  contentStyleFile: [data.url("aux.css"), 
    data.url("jquery-ui-1.8.16.custom.css"), 
    data.url("jquery.contextmenu.css")],

  onAttach: function(worker) {

      var trackIndex = getTrackerForTab(tabs.activeTab)
      var tracker = workerTracker[trackIndex];
     

      tracker.chatWorker = worker;
      for (c in through){
        
          let (msgName = through[c]){
            responder = function(payload){ 
              console.log('message ' + msgName + ' recieved from chat worker #{trackIndex}');
              workerTracker[trackIndex].mainWorker.port.emit(msgName, payload)
          };
          worker.port.on(msgName, responder);
        }
      }
      worker.port.on("kdNotify", 
          function(payload){
            displayNotification(payload);
          }
      )
      //Addon may request prefs
      worker.port.on("openPreferences", 
          function(){
            openPrefs();
          }
      )

      worker.port.on("showHtml", function(payload){showQuickPanel(payload.plaintext) } );
      //showQuickPanel("<p>Hello yo</p><p>This is the second</p>");

      //displayNotification({title:"KolDaemon", msg:"Started, <i>yes!</i>"});
      worker.port.emit("setPrefs", {prefs: getPrefObj()})
          
     
  }
});

var swordguyURL = self.data.url("chat_icon.png");
var notifications = require("notifications");
function displayNotification(payload){
  notifications.notify({
        title: payload.title,
        text: payload.msg,
        data: payload.msg,
        iconURL: swordguyURL,
        onClick: function (data) {
          console.log(data);
          // console.log(this.data) would produce the same result.
        }
  });
}

console.log("PREFS!!! " + JSON.stringify(getPrefObj()) );
