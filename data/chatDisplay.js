(function() {
  var ChatDisplay, MenuObject, Port, displayer, porter;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Port = (function() {
    function Port() {
      this.on = __bind(this.on, this);
      this.emit = __bind(this.emit, this);
    }
    Port.prototype.emit = function(msg, data) {
      return self.port.emit(msg, data);
    };
    Port.prototype.on = function(msg, callback) {
      return self.port.on(msg, callback);
    };
    return Port;
  })();
  MenuObject = {
    title: 'Actions',
    items: [
      {
        label: 'Get Status',
        action: function(e) {
          var pname;
          pname = $(e.target).closest('[pname]').attr('pname');
          return porter.emit("requestPlayerStatus", {
            "name": pname
          });
        }
      }, {
        label: 'Debug',
        action: __bind(function(e) {
          var obj, oid;
          oid = $(e.target).closest('[oid]').attr('oid');
          obj = displayer.objectLog[oid];
          console.log("\n===================");
          console.log("\n___________________\n");
          console.log(obj.msg);
          console.log('\n');
          console.log(obj.raw);
          console.log("\n===================\n");
          alert("^" + obj.raw + "|$");
          return alert("Context: ^" + obj.context + "|$");
        }, this)
      }
    ]
  };
  ChatDisplay = (function() {
    function ChatDisplay() {
      this.onPrefChange = __bind(this.onPrefChange, this);
      this.setPrefs = __bind(this.setPrefs, this);
      this.init = __bind(this.init, this);
      this.start = __bind(this.start, this);
      this.ChatDisplay = __bind(this.ChatDisplay, this);
      this.onSelect = __bind(this.onSelect, this);
      this.setSize = __bind(this.setSize, this);
      this.removeTabByIndex = __bind(this.removeTabByIndex, this);
      this.historyDown = __bind(this.historyDown, this);
      this.historyUp = __bind(this.historyUp, this);
      this.startHistory = __bind(this.startHistory, this);
      this.sendChatMessage = __bind(this.sendChatMessage, this);
      this.scroll = __bind(this.scroll, this);
      this.checkScroll = __bind(this.checkScroll, this);
      this.displayMsg = __bind(this.displayMsg, this);
      this.addToLog = __bind(this.addToLog, this);
      this.refreshTimeStamps = __bind(this.refreshTimeStamps, this);
      this.showSystemLog = __bind(this.showSystemLog, this);
      this.addTab = __bind(this.addTab, this);
      this.setPlayerHeader = __bind(this.setPlayerHeader, this);
      this.tabLeft = __bind(this.tabLeft, this);
      this.tabRight = __bind(this.tabRight, this);
      this.selectTab = __bind(this.selectTab, this);
      this.clearMessages = __bind(this.clearMessages, this);
      this.getTabHeader = __bind(this.getTabHeader, this);
      this.getWindow = __bind(this.getWindow, this);
      this.currentTab = __bind(this.currentTab, this);
    }
    ChatDisplay.prototype.openTabs = [];
    ChatDisplay.prototype.tabInfo = [];
    ChatDisplay.prototype.openChannel = null;
    ChatDisplay.prototype.playername = "starwed";
    ChatDisplay.prototype.commandHistory = [];
    ChatDisplay.prototype.commandMemory = 15;
    ChatDisplay.prototype.commandMarker = null;
    ChatDisplay.prototype.$tabs = null;
    ChatDisplay.prototype.objectLog = [];
    ChatDisplay.prototype.optShow = false;
    ChatDisplay.prototype.prefs = [];
    ChatDisplay.prototype.logTab = false;
    ChatDisplay.prototype.logInChat = false;
    ChatDisplay.prototype.$options = null;
    ChatDisplay.prototype.$log = null;
    ChatDisplay.prototype.currentTab = function() {
      var tabIndex;
      tabIndex = $("#tabs").tabs("option", "selected");
      return this.openTabs[tabIndex];
    };
    ChatDisplay.prototype.getWindow = function(tab) {
      return $("#" + ("" + tab));
    };
    ChatDisplay.prototype.getTabHeader = function(tab) {
      return $('#tab-head > li >a[href="#' + tab + '"]').parent();
    };
    ChatDisplay.prototype.clearMessages = function(tab) {
      return $(".system", this.getWindow(tab)).each(function() {
        return $(this).remove();
      });
    };
    ChatDisplay.prototype.selectTab = function(tab) {
      var index;
      try {
        index = $("li", this.$tabs).index(this.getTabHeader(tab));
        this.$tabs.tabs("select", index);
        return this.setSize();
      } catch (e) {
        return console.log("" + e);
      }
    };
    ChatDisplay.prototype.tabRight = function() {
      var tabIndex;
      tabIndex = this.$tabs.tabs("option", "selected");
      if (tabIndex >= this.openTabs.length - 1) {
        return this.$tabs.tabs("select", 0);
      } else {
        return this.$tabs.tabs("select", tabIndex + 1);
      }
    };
    ChatDisplay.prototype.tabLeft = function() {
      var tabIndex;
      tabIndex = this.$tabs.tabs("option", "selected");
      if (tabIndex === 0) {
        return this.$tabs.tabs("select", this.openTabs.length - 1);
      } else {
        return this.$tabs.tabs("select", tabIndex - 1);
      }
    };
    ChatDisplay.prototype.setPlayerHeader = function(payload) {
      var chatwindow, headerHTML, lead;
      chatwindow = this.getWindow(payload.name);
      lead = payload.header.info.match(/^(.+?)<\s*?br/);
      if (lead != null) {
        payload.header.info = payload.header.info.replace(lead[1], ("<a class='headerName' pname='" + payload.name + "'>") + lead[1] + "</a>");
      }
      headerHTML = "<table width='100%'><tr>\n<td><div>" + payload.header.info + "</div></td>\n<td width = '30'><img src='" + payload.header.avatar + "' height='50' width='30'/></td>\n</tr></table>";
      chatwindow.children(".chatInfo").html(headerHTML);
      $(".chatInfo a", chatwindow).each(this.formatLink);
      return this.setSize();
    };
    ChatDisplay.prototype.addTab = function(tab) {
      var $clear, $opt, ct, info, label;
      try {
        if (tab != null) {
          console.log("adding tab for " + tab);
          if (tab === '__log') {
            label = 'Log';
            info = '<b>System Log</b>';
          } else if (tab[0] === '_') {
            label = '#' + tab.substring(1);
            porter.emit("requestPlayerHeader", {
              "name": tab
            });
            info = "...loading info for " + (tab.substring(1)) + "...";
          } else {
            info = '';
            label = tab;
          }
          $("#tabs").tabs("add", "#" + tab, label);
          $opt = $("<div/>").addClass('chatOpt');
          $clear = $("<a>clear notifications</a>").click(__bind(function() {
            return this.clearMessages(this.currentTab());
          }, this));
          $opt.append($clear);
          ct = $("#" + tab).addClass("chatTab").append("<div class='chatInfo'>" + info + "</div>").append("<div class='ChatWindow'><br/></div>").append($opt);
          this.tabInfo[tab] = {
            window: $(".ChatWindow", ct)
          };
          this.openTabs.push(tab);
          return this.setSize();
        }
      } catch (e) {
        return console.log("Error while adding tab " + tab + ": " + e);
      }
    };
    ChatDisplay.prototype.showSystemLog = function() {
      var $dialog, properWidth;
      properWidth = $("#tabs").width();
      $dialog = $("<div ></div>");
      $dialog.append(this.$log.clone());
      return $dialog.dialog({
        title: 'System Messages',
        width: properWidth
      });
    };
    ChatDisplay.prototype.refreshTimeStamps = function() {
      return $(".timestamp").toggle(this.prefs.timestampsOn);
    };
    ChatDisplay.prototype.formatLink = function() {
      var href, plname, target;
      target = $(this).attr('target');
      href = $(this).attr('href');
      plname = $(this).attr('pname');
      if ((plname != null ? plname.length : void 0) > 0) {
        return $(this).click(function() {
          porter.emit("loadPlayer", {
            "name": plname
          });
          return false;
        });
      } else if (target === 'mainpane') {
        $(this).attr('starwed', 'isMainpane');
        return $(this).click(function() {
          var pname, rawtext;
          rawtext = $(this).text();
          pname = rawtext.match(/[\w\s]+/);
          if (pname !== null) {
            pname = pname[0];
            porter.emit("loadLink");
          }
          porter.emit("loadLink", {
            "path": href
          });
          return false;
        });
      } else {
        return $(this).attr('starwed', 'touchedButNotMain');
      }
    };
    ChatDisplay.prototype.addToLog = function(msg, timestamp) {
      var $msg, logWindow;
      $msg = $("<div class='log-message'>" + timestamp + msg + "</div>");
      if (!(this.tabInfo['__log'] != null)) {
        this.addTab('__log');
      }
      logWindow = this.tabInfo['__log'].window;
      return logWindow.append($msg);
    };
    ChatDisplay.prototype.displayMsg = function(payload) {
      var $msg, baseMsg, chatWindow, date, doscroll, hours, minutes, msg, oid, removeMsg, spacer, tab, target, timestamp, titleText, tsdisplay, type;
      oid = this.objectLog.push(payload) - 1;
      tab = payload.tab;
      msg = payload.msg;
      type = payload.type;
      if (msg.length < 2) {
        return;
      }
      baseMsg = $("<div>" + msg + "</div>").text();
      date = new Date(payload.time);
      minutes = date.getMinutes();
      hours = date.getHours();
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      if (this.prefs.timestampsOn === true) {
        tsdisplay = 'inline';
      } else {
        tsdisplay = 'none';
      }
      timestamp = "<span  style='display: " + tsdisplay + "' class='timestamp'>[" + hours + ":" + minutes + "]					</span>";
      if (this.logTab === true && (type === 'system' || type === 'system-red')) {
        this.addToLog(msg, timestamp);
      }
      if (tab === "!!current") {
        tab = this.currentTab();
      }
      try {
        if (!(tab != null)) {
          return;
        }
        if (!(this.tabInfo[tab] != null)) {
          this.addTab(tab);
        }
        if (tab !== this.currentTab()) {
          if (payload.self === false) {
            this.getTabHeader(tab).css("font-style", 'italic');
            if (payload.important === true) {
              this.getTabHeader(tab).effect('pulsate', {
                times: 3
              }, 600);
              this.getTabHeader(tab).addClass('important');
              this.setSize();
            }
          } else {
            this.selectTab(tab);
          }
        }
        chatWindow = this.tabInfo[tab].window;
        doscroll = this.checkScroll(chatWindow);
        if (payload.type === 'channel' || payload.type === 'private') {
          spacer = '&nbsp;';
        } else {
          spacer = '';
        }
        titleText = "[" + hours + ":" + minutes + "]";
        $msg = $("<div oid='" + oid + "' title='" + titleText + "' class='chatLine'>" + spacer + timestamp + msg + "</div>");
        $("a", $msg).each(this.formatLink);
        if (type === 'system') {
          this.$log.append($msg.clone());
        }
        if (type === 'system' || type === 'system-red') {
          $msg.addClass('system');
          $msg.append("<span class='ui-icon ui-icon-close'>Remove Tab</span>");
        }
        if (type === 'system-red') {
          $msg.addClass('system-red');
        }
        if (type === 'channel' && payload.important === true) {
          $msg.addClass('important');
        }
        if (type === 'channel' || type === 'private') {
          $msg.addClass('talking');
        }
        $msg.find("[pname]").contextPopup(MenuObject);
        $msg.find("a").contextPopup(MenuObject);
        if ((type !== 'system') || (parseFloat(this.prefs.persistSystemMessages) !== 0)) {
          chatWindow.append($msg);
        }
        if (type === 'system' && parseFloat(this.prefs.persistSystemMessages) > 0) {
          target = $msg.get(0);
          removeMsg = __bind(function() {
            return target.parentNode.removeChild(target);
          }, this);
          window.setTimeout(removeMsg, this.prefs.persistSystemMessages * 1000);
        }
        if (type === 'system' && this.prefs.notifyOn === true) {
          porter.emit("kdNotify", {
            title: 'Kol Chat',
            msg: baseMsg
          });
        }
        if (type === 'private' && this.prefs.pmNotifyOn === true && payload.self === false) {
          porter.emit("kdNotify", {
            title: "Private from " + payload.speaker,
            msg: baseMsg
          });
        }
        if (doscroll) {
          return this.scroll(chatWindow);
        }
      } catch (e) {
        return console.log("Error in displayMsg: " + e);
      }
    };
    ChatDisplay.prototype.checkScroll = function(cw) {
      return cw.outerHeight() + cw.scrollTop() + 5 > cw[0].scrollHeight;
    };
    ChatDisplay.prototype.scroll = function(cw) {
      return cw.animate({
        scrollTop: cw[0].scrollHeight
      });
    };
    ChatDisplay.prototype.sendChatMessage = function() {
      var msg;
      try {
        if (this.commandMarker !== null) {
          this.commandMarker = null;
          this.commandHistory.shift();
        }
        msg = $("#chatBox ").val();
        this.commandHistory.unshift(msg);
        if (this.commandHistory.length > this.commandMemory) {
          this.commandHistory.pop();
        }
        $("#chatBox").val("");
        return porter.emit("newChatSubmission", {
          "msg": msg,
          "currentTab": this.currentTab()
        });
      } catch (e) {
        return console.log(e);
      }
    };
    ChatDisplay.prototype.startHistory = function() {
      this.commandHistory.unshift($("#chatBox ").val());
      return this.commandMarker = 0;
    };
    ChatDisplay.prototype.historyUp = function() {
      if (this.commandMarker === null) {
        this.startHistory();
      }
      this.commandMarker += 1;
      if (this.commandMarker >= this.commandHistory.length) {
        this.commandMarker = 0;
      }
      return $("#chatBox ").val(this.commandHistory[this.commandMarker]);
    };
    ChatDisplay.prototype.historyDown = function() {
      if (this.commandMarker === null) {
        this.startHistory();
      }
      this.commandMarker -= 1;
      if (this.commandMarker < 0) {
        this.commandMarker = this.commandHistory.length;
      }
      return $("#chatBox ").val(this.commandHistory[this.commandMarker]);
    };
    ChatDisplay.prototype.removeTabByIndex = function(index) {
      var tab;
      console.log('removing tab?');
      try {
        tab = this.openTabs[index];
        this.$tabs.tabs("remove", index);
        this.openTabs.splice(index, 1);
        return this.tabInfo[tab] = null;
      } catch (e) {
        return console.log("" + e);
      }
    };
    ChatDisplay.prototype.setSize = function() {
      var inputHeight, tabHeight, totalHeight;
      $(".chatOpt").toggle(this.showOpt);
      tabHeight = $("#tab-head").height();
      inputHeight = $("#bottom-wrapper").height();
      totalHeight = $("#outer-wrapper").height();
      $("#tab-wrapper").height(totalHeight - inputHeight);
      $("#tabs").height(totalHeight - inputHeight);
      return $(".chatTab").each(function() {
        var infoHeight, optHeight;
        infoHeight = $(this).children('.chatInfo').height();
        if ($(this).children('.chatOpt').css('display') === 'none') {
          optHeight = 0;
        } else {
          optHeight = $(this).children('.chatOpt').height();
        }
        $(this).height(totalHeight - tabHeight - inputHeight);
        return $(this).children('.ChatWindow').height(totalHeight - tabHeight - inputHeight - infoHeight - optHeight);
      });
    };
    ChatDisplay.prototype.onSelect = function(event, ui) {
      this.getTabHeader(this.openTabs[ui.index]).css("font-style", 'normal').removeClass('important');
      return this.setSize();
    };
    ChatDisplay.setPlayerStatus = function(data) {
      return alert(data.status);
    };
    ChatDisplay.prototype.start = function() {
      var cd, closeThisTab, tabOptions;
      try {
        console.log("__ I AM STARTING CHAT __");
        porter.emit("chatDisplayReady");
        return;
        tabOptions = {
          select: this.onSelect,
          show: this.setSize,
          tabTemplate: '<li>\n	<a href=\'#{href}\'>#{label}</a> \n	<span class=\'ui-icon ui-icon-close\'>Remove Tab</span>\n	<span class=\'ui-icon ui-icon-comment\'>Message!</span>\n</li>'
        };
        $("#tabs").tabs(tabOptions);
        this.$tabs = $("#tabs").tabs();
        this.$log = $("<div class='log'></div>");
        $(window).resize(this.setSize);
        this.setSize();
        $("#chatBox").keyup(__bind(function(e) {
          if (e.keyCode === 13) {
            this.sendChatMessage();
          }
          if (e.keyCode === 38 && e.shiftKey === true) {
            this.historyUp();
          }
          if (e.keyCode === 40 && e.shiftKey === true) {
            return this.historyDown();
          }
        }, this));
        $("body").keyup(__bind(function(e) {
          if (e.keyCode === 37 && e.ctrlKey === true) {
            this.tabLeft();
          }
          if (e.keyCode === 39 && e.ctrlKey === true) {
            return this.tabRight();
          }
        }, this));
        cd = this;
        closeThisTab = function($target) {
          var $tabs, index;
          $tabs = $("#tabs");
          index = $("li", $tabs).index($target);
          return cd.removeTabByIndex(index);
        };
        $("#tab-head li").live('dblclick', function() {
          return closeThisTab($(this));
        });
        $("#tab-head span.ui-icon-close").live('click', function() {
          return closeThisTab($(this).parent());
        });
        $("span.ui-icon-gear").live('click', __bind(function() {
          this.showOpt = !this.showOpt;
          return this.setSize();
        }, this));
        $(".system span.ui-icon-close").live('click', function() {
          return $(this).parent().remove();
        });
        porter.emit("chatDisplayReady");
        porter.on("chatDisplayInitData", this.init);
        porter.on("setPrefs", this.setPrefs);
        porter.on("newChatMessage", this.displayMsg);
        porter.on("setPlayerHeader", this.setPlayerHeader);
        porter.on("setPlayerStatus", this.setPlayerStatus);
        return console.log("DONE START");
      } catch (e) {
        return console.log("Error starting: " + e);
      }
    };
    ChatDisplay.prototype.init = function(payload) {
      this.openChannel = payload.openChannel;
      return this.addTab(this.openChannel);
    };
    ChatDisplay.prototype.setPrefs = function(payload) {
      var oldPrefs, p, _results;
      oldPrefs = this.prefs;
      this.prefs = payload.prefs;
      console.log(oldPrefs.toSource());
      try {
        _results = [];
        for (p in oldPrefs) {
          _results.push(oldPrefs[p] !== this.prefs[p] ? this.onPrefChange(p) : void 0);
        }
        return _results;
      } catch (e) {
        return console.log("Error " + e);
      }
    };
    ChatDisplay.prototype.onPrefChange = function(p) {
      switch (p) {
        case 'timestampsOn':
          return this.refreshTimeStamps();
      }
    };
    return ChatDisplay;
  })();
  displayer = new ChatDisplay();
  porter = new Port();
  displayer.start();
}).call(this);
