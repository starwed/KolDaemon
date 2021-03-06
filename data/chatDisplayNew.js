// Generated by CoffeeScript 1.4.0
(function() {
  var ChatDisplay, MenuAction, MenuObject, Port, daemonChatSource, displayer, logit, porter,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    _this = this;

  logit = function(msg) {
    return console.log("~CD: " + msg);
  };

  daemonChatSource = '<div id="outer-wrapper">		<div id="tab-wrapper">		<div id="tabs" class="tabs-bottom">			<ul id="tab-head">	</ul>	</div>	</div>	<div id="bottom-wrapper">		<div id="InputForm">			<center>				<input id="chatBox" class="TextInput"  maxlength="200" 					type="text" size="12" id="entry" autocomplete="off" />				<span id="gear" class="ui-icon ui-icon-gear">Options</span>			</center>		</div>	</div></div>';

  logit("------- CHATDISPLAY SCRIPT RUNNING!   YO YO YO ----------\n");

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
        label: 'Open private tab',
        action: function(e) {
          var pid, pname;
          try {
            pname = $(e.target).closest('[pname]').attr('pname');
            pid = $(e.target).closest('[pid]').attr('pid');
            return displayer.addTab(pid, 'private', pname);
          } catch (e) {
            return logit(e);
          }
        }
      }
    ]
  };

  MenuAction = function(e, action) {
    var pname;
    pname = $(e.target).closest('[pname]').attr('pname');
    return porter.emit("doPlayerAction", {
      "name": pname,
      "action": action
    });
  };

  ChatDisplay = (function() {

    function ChatDisplay() {
      this.onPrefChange = __bind(this.onPrefChange, this);

      this.setPrefs = __bind(this.setPrefs, this);

      this.addMenuOptions = __bind(this.addMenuOptions, this);

      this.init = __bind(this.init, this);

      this.start = __bind(this.start, this);

      this.setPlayerStatus = __bind(this.setPlayerStatus, this);

      this.onSelect = __bind(this.onSelect, this);

      this.setSize = __bind(this.setSize, this);

      this.removeTabByIndex = __bind(this.removeTabByIndex, this);

      this.historyDown = __bind(this.historyDown, this);

      this.historyUp = __bind(this.historyUp, this);

      this.startHistory = __bind(this.startHistory, this);

      this.handleSpecialCommands = __bind(this.handleSpecialCommands, this);

      this.sendChatMessage = __bind(this.sendChatMessage, this);

      this.scroll = __bind(this.scroll, this);

      this.checkScroll = __bind(this.checkScroll, this);

      this.displayMsg = __bind(this.displayMsg, this);

      this.formatMsgLine = __bind(this.formatMsgLine, this);

      this.createMsgLine = __bind(this.createMsgLine, this);

      this.createGuts = __bind(this.createGuts, this);

      this.setSpeakerId = __bind(this.setSpeakerId, this);

      this.createSpeaker = __bind(this.createSpeaker, this);

      this.createTimeStamp = __bind(this.createTimeStamp, this);

      this.refreshTimeStamps = __bind(this.refreshTimeStamps, this);

      this.addTab = __bind(this.addTab, this);

      this.setPlayerHeader = __bind(this.setPlayerHeader, this);

      this.setOwnInfo = __bind(this.setOwnInfo, this);

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

    ChatDisplay.prototype.playername = "";

    ChatDisplay.prototype.commandHistory = [];

    ChatDisplay.prototype.commandMemory = 15;

    ChatDisplay.prototype.commandMarker = null;

    ChatDisplay.prototype.$tabs = null;

    ChatDisplay.prototype.selectedTab = null;

    ChatDisplay.prototype.objectLog = [];

    ChatDisplay.prototype.showOpt = true;

    ChatDisplay.prototype.prefs = [];

    ChatDisplay.prototype.logTab = false;

    ChatDisplay.prototype.logInChat = false;

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
      $(".output", this.getWindow(tab)).each(function() {
        return $(this).remove();
      });
      return $("hr.marker", this.getWindow(tab)).remove();
    };

    ChatDisplay.prototype.selectTab = function(tab) {
      var index;
      try {
        index = $("li", this.$tabs).index(this.getTabHeader(tab));
        this.$tabs.tabs("select", index);
        this.setSize();
        return $("#chatBox").select();
      } catch (e) {
        return logit("" + e);
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

    ChatDisplay.prototype.setOwnInfo = function(payload) {
      var setClanInfo, tab, _i, _len, _ref,
        _this = this;
      setClanInfo = function(tabName) {
        var clanwindow, headerHTML;
        logit("setting clan info for " + tabName);
        clanwindow = _this.getWindow(tabName);
        headerHTML = "<b>" + payload.header.clan + "</b>";
        clanwindow.children(".chatInfo").html(headerHTML);
        return clanwindow.children(".chatInfo").addClass('clanInfo');
      };
      logit("The header info is " + (payload.header.toSource()));
      _ref = ['clan', 'hobopolis', 'slimetube', 'hauntedhouse', 'private'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tab = _ref[_i];
        setClanInfo(tab);
      }
      return this.setSize();
    };

    ChatDisplay.prototype.setPlayerHeader = function(payload) {
      var chatwindow, headerHTML, lead, statusclass;
      if (!(payload.header != null)) {
        return;
      }
      if (payload.name === this.playername) {
        this.setOwnInfo(payload);
      }
      chatwindow = this.getWindow(payload.id);
      lead = payload.header.info.match(/^(.+?)<\s*?br/);
      if (lead != null) {
        payload.header.info = payload.header.info.replace(lead[1], ("<a class='headerName' pname='" + payload.name + "'>") + lead[1] + "</a>");
      }
      statusclass = payload.status;
      headerHTML = "<table width='100%' class=" + statusclass + "><tr>\n<td><div>" + payload.header.info + "</div></td>\n<td width = '30'><img src='" + payload.header.avatar + "' height='50' width='30'/><br/><small class='status " + statusclass + "'>" + payload.status + "</small></td>\n</tr>\n</table>";
      chatwindow.children(".chatInfo").html(headerHTML);
      $(".chatInfo a", chatwindow).each(this.formatLink).contextPopup(MenuObject);
      return this.setSize();
    };

    ChatDisplay.prototype.addTab = function(id, type, name) {
      var $clear, $opt, $prefs, clearClick, ct, info, label, prefClick,
        _this = this;
      try {
        if (!(name != null)) {
          name = id;
        }
        if (id != null) {
          logit("adding tab for " + id);
          if (type === 'log') {
            info = '<b>System Log</b>';
            label = name;
          } else if (type === 'private') {
            porter.emit("requestPlayerInfo", {
              "name": name
            });
            label = '#' + name;
            info = "...loading info for " + name + "...";
          } else {
            info = '';
            label = name;
          }
          $("#tabs").tabs("add", "#" + id, label);
          $opt = $("<div/>").addClass('chatOpt');
          clearClick = function() {
            return _this.clearMessages(_this.currentTab());
          };
          $clear = $("<a title='Clear green chat ouput (/clear)'>clear output</a>").click(clearClick);
          $opt.append($clear);
          prefClick = function() {
            return porter.emit("openPreferences");
          };
          $prefs = $("&nbsp;&nbsp;<a title='Open addon settings (/prefs)'>settings</a>").click(prefClick);
          $opt.append($prefs);
          ct = $("#" + id).addClass("chatTab").append("<div class='chatInfo'>" + info + "</div>").append("<div class='ChatWindow'><br/></div>").append($opt);
          this.tabInfo[id] = {
            'window': $(".ChatWindow", ct),
            'id': id,
            'type': type,
            'label': label,
            'name': name
          };
          this.openTabs.push(id);
          return this.setSize();
        }
      } catch (e) {
        return logit("Error while adding tab " + id + ": " + e);
      }
    };

    ChatDisplay.prototype.refreshTimeStamps = function() {
      return $(".timestamp").toggle(this.prefs.timestampsOn);
    };

    ChatDisplay.prototype.formatLink = function() {
      var href, pid, plname, target;
      target = $(this).attr('target');
      href = $(this).attr('href');
      plname = $(this).attr('pname');
      logit("\n\nFormatting link!");
      if ((plname != null ? plname.length : void 0) > 0) {
        return $(this).click(function() {
          logit("SEEKING TO LOAD PLAYER " + plname);
          porter.emit("loadPlayer", {
            "name": plname
          });
          return false;
        });
      } else if (href.match(/who=\d+/)) {
        plname = $(this).text().match(/([\w\s]+)/)[1];
        pid = href.match(/who=(\d+)/)[1];
        logit("Found player match for " + plname + ", (" + pid + ")");
        $(this).attr('pname', plname).attr('pid', pid).attr('href', "showplayer.php?who=" + pid);
        return $(this).click(function() {
          logit("SEEKING TO LOAD PLAYER " + plname);
          porter.emit("loadLink", {
            "path": href
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

    ChatDisplay.prototype.createTimeStamp = function(msg) {
      var date, hours, minutes;
      date = new Date(msg.timestamp);
      logit("Transmitted timestamp: " + msg.timestamp);
      minutes = date.getMinutes();
      hours = date.getHours();
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      logit("Hours are " + hours);
      return "[" + hours + ":" + minutes + "]";
    };

    ChatDisplay.prototype.createSpeaker = function(msg) {
      var dName;
      try {
        if (!(msg.who != null)) {
          return $("");
        }
        if (msg.format === '1') {
          return $("");
        }
        if (msg.who.displayName != null) {
          dName = msg.who.displayName;
        } else {
          dName = msg.who.name;
        }
        return $("<a class='player' target='mainpane'>" + dName + "</a>").css('color', msg.who.color).attr('pname', msg.who.name).attr('pid', msg.who.id).attr('href', "showplayer.php?who=" + msg.who.id);
      } catch (e) {
        return logit("Error speaker making " + e);
      }
    };

    ChatDisplay.prototype.setSpeakerId = function(who) {
      var selector;
      logit("attempting to set speaker id for " + (who.toSource()));
      selector = "a[pname=\"" + who.name + "\"]";
      return $(selector).each(function() {
        $(this).attr('pid', who.id);
        return $(this).attr('href', "showplayer.php?who=" + who.id);
      });
    };

    ChatDisplay.prototype.createGuts = function(msg) {
      var $msg, delimiter;
      try {
        if ((msg.who != null) && !(msg.format === '1')) {
          delimiter = ":";
        } else {
          delimiter = "";
        }
        $msg = $("<span class='guts'>" + delimiter + "  " + msg.msg + "</span>");
        if ((msg.link != null) && msg.type === 'event' && msg.link !== 'false' && msg.link !== fals) {
          logit('trying to wrap message in link');
          $msg = $("<a href='" + msg.link + "' target='mainpane' class='event' />").append($msg);
        }
      } catch (e) {
        logit("Error creating guts " + e);
      }
      return $msg;
    };

    ChatDisplay.prototype.createMsgLine = function(msg) {
      var $guts, $msgLine, $speaker, $timestamp, timestamp;
      try {
        timestamp = this.createTimeStamp(msg);
        $timestamp = $("<span  class='timestamp'>" + timestamp + "</span>").toggle(this.prefs.timestampsOn);
        $speaker = this.createSpeaker(msg);
        $guts = this.createGuts(msg);
        $msgLine = $("<div/>").append($timestamp).append($speaker).append($guts).attr("title", timestamp);
      } catch (e) {
        logit("error creating msgline " + e);
      }
      return $msgLine;
    };

    ChatDisplay.prototype.formatMsgLine = function($msgLine, msg) {
      var firstFilter, formats, lastFilter;
      logit("Formatting msgline");
      if (msg.type === 'output') {
        $msgLine.addClass('output');
        firstFilter = function() {
          var prev;
          prev = this.previousSibling;
          logit("prev is " + (prev != null ? prev.nodeName : void 0) + "and type is " + (prev != null ? prev.nodeType : void 0));
          logit("Logicks are " + (!prev) + " and " + ((prev != null ? prev.nodeType : void 0) !== 3));
          return (!prev) || (prev.nodeType === 3 && prev.nodeValue.match(/^\s*$/));
        };
        lastFilter = function() {
          var next;
          next = this.nextSibling;
          logit("next is " + (next != null ? next.nodeName : void 0) + "and type is " + (next != null ? next.nodeType : void 0));
          return (!next) || (next.nodeType === 3 && next.nodeValue.match(/^\s*$/));
        };
        $("span.guts > br", $msgLine).filter(firstFilter).remove();
        $("span.guts > br", $msgLine).filter(lastFilter).remove();
      } else {
        $msgLine.addClass("msg");
      }
      if (msg.type === 'output' || msg.type === 'system' || msg.type === 'event' || (msg.type === 'public' && (msg.format === 98 || msg.format === 3 || msg.format === 4 || msg.format === 2))) {
        $msgLine.addClass('boxmsg');
        $msgLine.append("<span class='ui-icon ui-icon-close'>Remove Tab</span>");
      }
      if (msg.type === 'output') {
        $msgLine.addClass('output');
      }
      if (msg.type === 'event') {
        $msgLine.addClass('event');
      }
      if (msg.type === 'system') {
        $msgLine.addClass('system');
      }
      if (msg.type === 'public') {
        switch (msg.format) {
          case '0':
          case '1':
          case '2':
          case '3':
          case '4':
            $msgLine.addClass('talking');
        }
        formats = [
          {
            0: '',
            1: 'emote',
            2: 'system-red',
            3: 'warn',
            4: 'annc',
            98: 'event',
            99: 'welcome'
          }
        ];
        $msgLine.addClass(formats[msg.format]);
        if (msg.format === 2 || msg.format === 3 || msg.format === 4) {
          $msgLine.addClass('system');
        }
        if (msg.format === 98) {
          $msgLine.addClass('event');
        }
        if (msg.format === '1') {
          $('a', $msgLine).first().addClass('player');
        }
      }
      if (msg.type === 'private') {
        $msgLine.addClass('talking');
      }
      if (msg.important) {
        $msgLine.addClass('important');
      }
      $("a", $msgLine).each(this.formatLink);
      $msgLine.find("[pname]").contextPopup(MenuObject);
      return $msgLine;
    };

    ChatDisplay.prototype.displayMsg = function(payload) {
      var $msg, addMarker, baseMsg, chatWindow, doscroll, fakeMsg, msg, removeMsg, tab, target, type, _ref,
        _this = this;
      logit("recieved message: " + (payload.toSource()));
      tab = payload.channel;
      msg = payload.msg;
      type = payload.type;
      doscroll = false;
      addMarker = false;
      if (type === 'private' && this.currentTab() !== payload.channel && ((_ref = payload.who) != null ? _ref.id : void 0) === payload.channel && this.prefs.pmEvents === true) {
        fakeMsg = {
          "type": "event",
          "msg": "" + payload.who.name + " just messaged you!",
          "timestamp": payload.timestamp,
          "channel": "!!current"
        };
        this.displayMsg(fakeMsg);
      }
      baseMsg = $("<div>" + msg + "</div>").text();
      if (tab === "!!current") {
        tab = this.currentTab();
      }
      try {
        if (!(tab != null)) {
          return;
        }
        if (!(this.tabInfo[tab] != null)) {
          this.addTab(tab, type, payload.tabName);
        }
        chatWindow = this.tabInfo[tab].window;
        if (tab !== this.currentTab()) {
          if (payload.self === true) {
            this.selectTab(tab);
          } else {
            this.getTabHeader(tab).css("font-style", 'italic');
            if (this.prefs.loudTabs === true) {
              this.getTabHeader(tab).addClass('loud');
              this.getTabHeader(tab).stop(true, true).effect('pulsate', {
                times: 1
              }, 600);
              this.setSize();
            }
            if (payload.important === true || payload.type === 'private') {
              this.getTabHeader(tab).stop(true, true).effect('pulsate', {
                times: 3
              }, 700);
              this.getTabHeader(tab).addClass('important');
              this.setSize();
            }
            if ($("hr.marker", chatWindow).length === 0 && this.prefs.chatMarkers === true) {
              addMarker = true;
            }
          }
        }
        doscroll = this.checkScroll(chatWindow);
        $msg = this.createMsgLine(payload);
        $msg = this.formatMsgLine($msg, payload);
        if (type === 'system') {
          this.$log.append($msg.clone());
        }
        if ((type !== 'output') || (parseFloat(this.prefs.persistSystemMessages) !== 0)) {
          if (addMarker === true) {
            chatWindow.append("<hr class='marker'/>");
            if ($("div", chatWindow).length === 0) {
              $("hr.marker", chatWindow).toggle(false);
            }
          }
          chatWindow.append($msg);
        }
        logit("ADDED MESSAGE TO WINDOW?");
        if (type === 'output' && parseFloat(this.prefs.persistSystemMessages) > 0) {
          target = $msg.get(0);
          removeMsg = function() {
            return target.parentNode.removeChild(target);
          };
          window.setTimeout(removeMsg, this.prefs.persistSystemMessages * 1000);
        }
        if ((type === 'output' || type === 'system' || type === 'event') && this.prefs.notifyOn === true) {
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
        return logit("Error in displayMsg: " + e);
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
      var ctInfo, msg;
      try {
        if (this.commandMarker !== null) {
          this.commandMarker = null;
          this.commandHistory.shift();
        }
        msg = $("#chatBox ").val();
        if (msg !== this.commandHistory[0]) {
          this.commandHistory.unshift(msg);
        }
        if (this.commandHistory.length > this.commandMemory) {
          this.commandHistory.pop();
        }
        $("#chatBox").val("");
        if (this.handleSpecialCommands(msg)) {

        } else {
          ctInfo = this.tabInfo[this.currentTab()];
          return porter.emit("newChatSubmission", {
            "msg": msg,
            "currentTab": ctInfo
          });
        }
      } catch (e) {
        return logit('error sending chat: ' + e);
      }
    };

    ChatDisplay.prototype.handleSpecialCommands = function(msg) {
      logit("hsc:     |" + (msg.trim()) + "|");
      try {
        logit(msg.indexOf("/clear"));
        switch (msg.trim()) {
          case "/clear":
            this.clearMessages(this.currentTab());
            break;
          case "/prefs":
            porter.emit("openPreferences");
            break;
          default:
            return false;
        }
        return true;
      } catch (e) {
        logit("hsc error: " + e);
        return false;
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
      logit('removing tab?');
      try {
        tab = this.openTabs[index];
        this.$tabs.tabs("remove", index);
        this.openTabs.splice(index, 1);
        return this.tabInfo[tab] = null;
      } catch (e) {
        return logit("" + e);
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
      var oldTab;
      this.getTabHeader(this.openTabs[ui.index]).css("font-style", 'normal').removeClass('important').removeClass('loud');
      $("#chatBox").select();
      if (this.selectedTab != null) {
        try {
          oldTab = this.currentTab();
          this.selectedTab = this.openTabs[ui.index];
          logit("\nCurrent tab is " + this.selectedTab);
          console.log("Removing marker from tab " + oldTab + "\n\n");
          $("hr.marker", this.tabInfo[oldTab].window).remove();
        } catch (e) {
          logit("HR error: " + e);
        }
      }
      return this.setSize();
    };

    ChatDisplay.prototype.setPlayerStatus = function(data) {
      return alert(data.status);
    };

    ChatDisplay.prototype.start = function() {
      var cd, closeThisTab, tabOptions,
        _this = this;
      try {
        logit("__ I AM STARTING CHAT __");
        window.document.body.innerHTML = daemonChatSource;
        tabOptions = {
          select: this.onSelect,
          show: this.setSize,
          tabTemplate: ' <li>\n	<a href=\'#{href}\'>#{label}</a> \n	<span class=\'ui-icon ui-icon-close\'>Remove Tab</span>\n	<span class=\'ui-icon ui-icon-comment\'>Message!</span>\n</li> '
        };
        $("#tabs").tabs(tabOptions);
        this.$tabs = $("#tabs").tabs();
        /*
        			$( ".tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *" )
        				.removeClass( "ui-corner-all ui-corner-top" )
        				.addClass( "ui-corner-bottom" );
        */

        this.$log = $("<div class='log'></div>");
        $(window).resize(this.setSize);
        this.setSize();
        $("#chatBox").keyup(function(e) {
          if (e.keyCode === 13) {
            _this.sendChatMessage();
          }
          if (e.keyCode === 38 && e.shiftKey === true) {
            _this.historyUp();
          }
          if (e.keyCode === 40 && e.shiftKey === true) {
            return _this.historyDown();
          }
        });
        $("body").keyup(function(e) {
          if (e.keyCode === 37 && e.ctrlKey === true) {
            _this.tabLeft();
          }
          if (e.keyCode === 39 && e.ctrlKey === true) {
            return _this.tabRight();
          }
        });
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
        $("span.ui-icon-gear").live('click', function() {
          logit("Flipping showOpt! \n");
          _this.showOpt = !_this.showOpt;
          return _this.setSize();
        });
        $(".boxmsg span.ui-icon-close").live('click', function() {
          return $(this).parent().remove();
        });
        porter.emit("chatDisplayReady");
        porter.on("chatDisplayInitData", this.init);
        logit("-a-");
        porter.on("setPrefs", this.setPrefs);
        logit("-b-");
        porter.on("newChatMessage", this.displayMsg);
        logit("-c-");
        porter.on("setPlayerHeader", this.setPlayerHeader);
        porter.on("setPlayerInfo", this.setPlayerHeader);
        logit("-d-");
        porter.on("setSpeakerId", this.setSpeakerId);
        return logit("DONE START");
      } catch (e) {
        return logit("Error starting: " + e);
      }
    };

    ChatDisplay.prototype.init = function(payload) {
      this.openChannel = payload.openChannel;
      this.playername = payload.playername;
      logit('about to add menu options');
      this.addMenuOptions(payload.menu);
      this.addTab(this.openChannel, 'public', this.openChannel);
      return this.selectedTab = this.openChannel;
    };

    ChatDisplay.prototype.addMenuOptions = function(menu) {
      var MenuItem, actionHandlerFactory, args, location, root, _results;
      logit("MENU IS " + (menu.toSource()));
      try {
        actionHandlerFactory = function(loc) {
          return function(e) {
            return MenuAction(e, loc);
          };
        };
        _results = [];
        for (root in menu) {
          args = menu[root];
          if (args.action === 1) {
            location = root + "?" + args.arg;
            MenuItem = {
              "label": args.title,
              "action": actionHandlerFactory(location)
            };
            _results.push(MenuObject.items.push(MenuItem));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      } catch (e) {
        return logit("\n\nMenu problem: " + e);
      }
    };

    ChatDisplay.prototype.setPrefs = function(payload) {
      var oldPrefs, p, _results;
      oldPrefs = this.prefs;
      this.prefs = payload.prefs;
      logit(oldPrefs.toSource());
      try {
        _results = [];
        for (p in oldPrefs) {
          if (oldPrefs[p] !== this.prefs[p]) {
            _results.push(this.onPrefChange(p));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      } catch (e) {
        return logit("Error " + e);
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
