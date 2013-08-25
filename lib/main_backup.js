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


var prefList = ["notifyOn", "timestampsOn", 'persistSystemMessages'];
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
  var tracker = {"tab":tab}
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
          'loadPlayer', "requestPlayerHeader", "setPlayerHeader"];
function detachWorker(){};

var prevTab;
var currentTracker;

widget.Widget({
  id: "mozilla-icon",
  label: "My Mozilla Widget",
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


// Run after attaching to the main page
var AfterAttach = function(worker){
  //worker = tabs.activeTab.attach(mainPageModifier);
  //if (MainPageWorker != null)
  //  MainPageWorker.destroy();
  var trackIndex = getTrackerForTab(tabs.activeTab);
  var tracker = workerTracker[trackIndex];
  //MainPageWorker = worker;
  tracker.mainWorker = worker;
  //MainWorkers.push(tracker)
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
var mainPageModifier = {
  include: /.*kingdomofloathing\.com\/game\.php.*/,
  //include: /.*FramesetTest.html/,
  contentScriptWhen: "ready",
  contentScriptFile: [ data.url('jquery-1.6.1.min.js'), 
        data.url('jquery-ui-1.8.16.custom.min.js'), 
        data.url('kd.js') ],
  contentScript: "window.frames[3].location.assign('"  + data.url('foo.html') + "'); ",
   onAttach: function(worker) {
      console.log('attached')  

      AfterAttach(worker);

  }
}

pageMod.PageMod( mainPageModifier );







// Chat page script
pageMod.PageMod({
  include: /.*foo\.html/,
  contentScriptFile: [data.url('jquery-1.6.1.min.js'), 
        data.url('jquery-ui-1.8.16.custom.min.js'), 
        data.url('chatDisplay.js') ],
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

      worker.port.on("showHtml", function(payload){showQuickPanel(payload.plaintext) } )
;
      showQuickPanel("<p>Hello yo</p><p>This is the second</p>");

      //displayNotification({title:"KolDaemon", msg:"Started, <i>yes!</i>"});
      worker.port.emit("setPrefs", {prefs: getPrefObj()})
          
     
  }
});


var notifications = require("notifications");
function displayNotification(payload){
  notifications.notify({
        title: payload.title,
        text: payload.msg,
        data: payload.msg,
        onClick: function (data) {
          console.log(data);
          // console.log(this.data) would produce the same result.
        }
  });
}

console.log("PREFS!!! " + JSON.stringify(getPrefObj()) );
