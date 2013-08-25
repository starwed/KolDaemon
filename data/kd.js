(function() {
  var Chatter, DirectPort, Jax, KolSession, MainFrame, PlayerDaemon, Port, Prefs, URLEncode, frame, getChatDoc, getMainDoc, host, init, makeURL, porter, predicate, prefs, session;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  console.log("------------HELLO------------");
  /* 
  	Up here go all the helper functions
  */
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
  try {
    host = window.location.host;
    console.log("Host is " + host);
  } catch (e) {
    console.log("" + e);
  }
  if (host.match("localhost") != null) {
    predicate = "http://" + host;
  } else {
    predicate = "http://" + host;
  }
  makeURL = function(location) {
    return predicate + "/" + location;
  };
  frame = __bind(function(key) {
    return window.frames[key];
  }, this);
  getChatDoc = __bind(function() {
    try {
      return frame(3).document;
    } catch (e) {
      return console.log("dumb error: " + e + "x");
    }
  }, this);
  getMainDoc = __bind(function() {
    return frame(2).document;
  }, this);
  URLEncode = __bind(function(plaintext) {
    return window.encodeURIComponent(plaintext);
  }, this);
  window.top.charpane = frame(1);
  window.top.mainpane = frame(2);
  Prefs = (function() {
    function Prefs() {
      this.Prefs = __bind(this.Prefs, this);
      this.setPrefs = __bind(this.setPrefs, this);
    }
    Prefs.prototype.prefs = [];
    Prefs.prototype.setPrefs = function(payload) {
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
    Prefs.onPrefChange = function() {};
    return Prefs;
  })();
  MainFrame = (function() {
    MainFrame.prototype.session = null;
    function MainFrame(session) {
      this.session = session;
      this.loadLink = __bind(this.loadLink, this);
    }
    MainFrame.prototype.loadLink = function(payload) {
      var path;
      if (payload === null) {
        return;
      }
      path = payload.path;
      if (path.indexOf('http://') < 0 && path.indexOf('https://') < 0) {
        path = this.session.makeURL(path);
      }
      console.log(path);
      return frame(2).location.href = path;
    };
    return MainFrame;
  })();
  Jax = (function() {
    Jax.prototype.session = [];
    Jax.prototype.text = "";
    function Jax(kolsession, line) {
      this.run = __bind(this.run, this);
      this.handleJaxResponse = __bind(this.handleJaxResponse, this);      this.session = kolsession;
      this.text = line;
    }
    Jax.prototype.handleJaxResponse = function(out) {
      var $eff, body, div;
      console.log("JAX RESPONSE\n____________________");
      try {
        console.log(out);
        $eff = $(getMainDoc()).find("#effdiv");
        if ($eff.length === 0) {
          div = getMainDoc().createElement('DIV');
          div.id = 'effdiv';
          body = getMainDoc().body;
          if ($('#content_').length > 0) {
            body = $('#content_ div:first')[0];
          }
          body.insertBefore(div, body.firstChild);
          $eff = $(div);
        }
        $eff.find('a[name="effdivtop"]').remove().end().prepend('<a name="effdivtop"></a><center>' + out + '</center>').css('display', 'block');
      } catch (e) {
        console.log(e);
      }
      return frame(1).location.href = this.session.makeURL('charpane.php');
    };
    Jax.prototype.run = function() {
      var addr, dojaxList, handlerFactory, i, jax, js, jsFragment, jsList, re1, re2, reJs1, reJs2, _len, _len2, _results;
      console.log("Running jax request! -----");
      re1 = /dojax\('(.*?)'\);?\)/g;
      re2 = /dojax\('(.*?)'\);?\)/;
      handlerFactory = __bind(function(path) {
        return __bind(function() {
          return this.session.kolGet(path).then(this.handleJaxResponse);
        }, this);
      }, this);
      dojaxList = this.text.match(re1);
      if ((dojaxList != null)) {
        for (i = 0, _len = dojaxList.length; i < _len; i++) {
          jax = dojaxList[i];
          addr = jax.match(re2)[1];
          console.log(addr);
          window.setTimeout(handlerFactory(addr), i * 100);
        }
      }
      reJs1 = /js\((.*?)\)-->/g;
      reJs2 = /js\((.*?)\)-->/;
      jsList = this.text.match(reJs1);
      if ((jsList != null)) {
        _results = [];
        for (i = 0, _len2 = jsList.length; i < _len2; i++) {
          js = jsList[i];
          _results.push(js.match('dojax') === null ? (jsFragment = js.match(reJs2)[1], console.log("jsFrament is " + jsFragment), eval(jsFragment)) : void 0);
        }
        return _results;
      }
    };
    return Jax;
  })();
  PlayerDaemon = (function() {
    PlayerDaemon.prototype.session = [];
    PlayerDaemon.prototype.realNames = new Object();
    function PlayerDaemon(session) {
      this.session = session;
      this.parsePlayerChatStatus = __bind(this.parsePlayerChatStatus, this);
      this.getPlayerChatStatus = __bind(this.getPlayerChatStatus, this);
      this.findPlayerStatus = __bind(this.findPlayerStatus, this);
      this.findPlayerHeader = __bind(this.findPlayerHeader, this);
      this.parsePlayerInfo = __bind(this.parsePlayerInfo, this);
      this.getPlayerInfo = __bind(this.getPlayerInfo, this);
      this.loadPlayer = __bind(this.loadPlayer, this);
      this.getPlayerId = __bind(this.getPlayerId, this);
      this.showPlayer = __bind(this.showPlayer, this);
    }
    PlayerDaemon.prototype.pids = {
      "AFHk": 1736457,
      "AFH": 1736451,
      "AFHobo": 1736458
    };
    PlayerDaemon.prototype.headers = [];
    PlayerDaemon.prototype.showPlayer = function(id) {
      try {
        return frame(2).location.href = this.session.makeURL("showplayer.php?who=" + id);
      } catch (e) {
        return console.log(e);
      }
    };
    PlayerDaemon.prototype.getPlayerId = function(name) {
      if (this.pids[name] != null) {
        return this.pids[name];
      }
      return this.session.kolGet("submitnewchat.php?graf=/whois " + name).success(__bind(function(result) {
        if (result.match(/#(\d+)/) !== null) {
          return this.pids[name] = result.match(/#(\d+)/)[1];
        }
      }, this));
    };
    PlayerDaemon.prototype.loadPlayer = function(payload) {
      var name;
      name = payload.name;
      console.log("***\n\nTrying to show " + name + "\n\n***");
      return $.when(this.getPlayerId()).then(__bind(function() {
        return this.showPlayer(this.pids[name]);
      }, this));
    };
    PlayerDaemon.prototype.getPlayerInfo = function(id) {
      if (this.headers[id] != null) {
        return this.headers[id];
      }
      console.log('requesting character sheet');
      return this.session.kolGet("showplayer.php?who=" + id).success(__bind(function(result) {
        return this.headers[id] = this.parsePlayerInfo(result);
      }, this));
    };
    PlayerDaemon.prototype.parsePlayerInfo = function(result) {
      var $sheet, avatar, info;
      $sheet = $(result);
      avatar = $("img", $sheet).first().attr('src');
      info = $("img", $sheet).first().parent().next().children('center').html();
      if (!(info != null)) {
        info = $("img", $sheet).first().parent().next().html();
      }
      return {
        "avatar": avatar,
        "info": info
      };
    };
    PlayerDaemon.prototype.findPlayerHeader = function(payload) {
      var name;
      console.log("Looking up tab name |" + (payload.name.toLowerCase()) + "|");
      console.log(this.realNames);
      if (this.realNames[payload.name.toLowerCase()] != null) {
        name = this.realNames[payload.name.toLowerCase()];
      } else {
        console.log("PROBLEM FINDING TAB NAME!");
        name = payload.name.substr(1);
      }
      return $.when(this.getPlayerId(name)).then(__bind(function() {
        var id;
        try {
          id = this.pids[name];
          return $.when(this.getPlayerInfo(id)).then(__bind(function() {
            return porter.emit("setPlayerHeader", {
              "name": payload.name,
              "header": this.headers[id]
            });
          }, this));
        } catch (e) {
          return console.log("Error looking up: " + e);
        }
      }, this));
    };
    PlayerDaemon.prototype.findPlayerStatus = function(payload) {
      var name;
      console.log("\nFinding player status -8-8-");
      name = payload.name;
      console.log(payload);
      return this.getPlayerChatStatus(name);
    };
    PlayerDaemon.prototype.getPlayerChatStatus = function(name) {
      return this.session.kolGet("submitnewchat.php?graf=/whois " + name).then(__bind(function(data) {
        return porter.emit("setPlayerStatus", {
          "name": name,
          "status": this.parsePlayerChatStatus(data)
        });
      }, this));
    };
    PlayerDaemon.prototype.parsePlayerChatStatus = function(data) {
      var status;
      console.log(data);
      if (data.match("This player is currently away") != null) {
        status = "away";
      } else if (data.match("This player is currently online")) {
        status = "online";
      } else {
        status = "offline";
      }
      console.log("\nStatus is " + status + " \n\t8-8-8\n");
      return status;
    };
    return PlayerDaemon;
  })();
  Chatter = (function() {
    Chatter.prototype.chatDelay = 3000;
    Chatter.prototype.lastseen = 0;
    Chatter.prototype.active = false;
    Chatter.prototype.session = null;
    Chatter.prototype.pd = null;
    Chatter.prototype.openChannel = null;
    function Chatter(session) {
      this.session = session;
      this.stop = __bind(this.stop, this);
      this.start = __bind(this.start, this);
      this.sendChatMessage = __bind(this.sendChatMessage, this);
      this.chatLoop = __bind(this.chatLoop, this);
      this.processChatError = __bind(this.processChatError, this);
      this.processChatResponse = __bind(this.processChatResponse, this);
      this.chatWindow = __bind(this.chatWindow, this);
      this.processChatLine = __bind(this.processChatLine, this);
      this.handleChatBot = __bind(this.handleChatBot, this);
      this.categorizeMsg = __bind(this.categorizeMsg, this);
      this.makePlayerUrl = __bind(this.makePlayerUrl, this);
      this.isChatBot = __bind(this.isChatBot, this);
      this.getOpenChannel = __bind(this.getOpenChannel, this);
      this.parseChannel = __bind(this.parseChannel, this);
      this.getNewChat = __bind(this.getNewChat, this);
    }
    Chatter.prototype.getNewChat = function() {
      return this.session.kolGet("newchatmessages.php?afk=0&lasttime=" + this.lastseen);
    };
    Chatter.prototype.parseChannel = function(response) {
      var matched;
      matched = response.match(/You are now talking in channel: (.+?)\./);
      if (matched != null) {
        this.openChannel = matched[1];
      }
      return matched != null;
    };
    Chatter.prototype.getOpenChannel = function() {
      return this.session.kolGet("submitnewchat.php?graf=/c").fail(__bind(function(failure) {
        return console.log("FAILURE on openchannel " + failure);
      }, this)).success(this.parseChannel).then(__bind(function() {
        return porter.emit("chatDisplayInitData", {
          'openChannel': this.openChannel,
          'playername': this.session.status.name
        });
      }, this));
    };
    Chatter.prototype.registeredChatBots = ["AFHk", "AFH", "AFHobo"];
    Chatter.prototype.isChatBot = function(name) {
      var bot, _i, _len, _ref;
      _ref = this.registeredChatBots;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        bot = _ref[_i];
        if (name === bot) {
          return true;
        }
      }
      return false;
    };
    Chatter.prototype.makePlayerUrl = function(id) {
      return 'showplayer.php?who=#{id}';
    };
    Chatter.prototype.categorizeMsg = function(l) {
      var firstFont, firstFontText, msgType, re;
      firstFont = $('font', l).first();
      firstFontText = $('font', l).first().text();
      re = /^\s*?\[(.+?)]/;
      if (firstFont.attr('color') === 'green') {
        msgType = 'system';
      } else if (firstFont.attr('color') === 'red') {
        msgType = 'system-red';
      } else if ($("table", l).length > 0) {
        msgType = 'system';
      } else if ($('a[href*="showplayer.php"]', l).length === 0) {
        msgType = 'system';
      } else if (firstFont.attr('color') === 'blue') {
        msgType = 'private';
      } else {
        msgType = 'channel';
      }
      return msgType;
    };
    Chatter.prototype.handleChatBot = function(msg, speaker) {
      var alias, bot, displayName, nameMatch;
      try {
        console.log("Chatbot " + speaker + " found");
        nameMatch = msg.match(/[\[\(\{](.+?)[\]\)\}]/);
        if (nameMatch != null) {
          bot = speaker;
          displayName = nameMatch[0];
          alias = nameMatch[1];
          msg = msg.replace(displayName, '');
          if (alias.length > 20 && alias.substr(19, 1) === ' ') {
            alias = alias.substr(0, 19) + alias.substr(20);
            displayName = displayName.substr(0, 20) + displayName.substr(21);
          }
        } else {
          alias = displayName = speaker;
        }
      } catch (e) {
        console.log(e);
      }
      return [msg, alias, displayName];
    };
    Chatter.prototype.processChatLine = function(line, context) {
      var channel, chatPayload, date, displayName, emote, firstFont, firstFontText, idPart, important, l, link, msg, msgPart, msgType, myself, playername, privateChannel, prvPattern, real, speaker, wFrom, _ref, _ref2;
      if (line.length <= 6) {
        return;
      }
      l = $("<div class='line'>" + line + "</div>", getChatDoc());
      playername = $('a[href*="showplayer.php"]', l).first().text();
      if (playername != null) {
        speaker = playername;
      }
      chatPayload = [];
      try {
        important = false;
        emote = false;
        privateChannel = false;
        channel = this.openChannel;
        msgType = 'system';
        firstFont = $('font', l).first();
        firstFontText = $('font', l).first().text();
        if (firstFontText.match(/^\s*?\[(.+?)]/) !== null) {
          channel = (_ref = firstFontText.match(/^\s*?\[(.+?)]/)) != null ? _ref[1] : void 0;
          firstFont.remove();
        }
        msgType = this.categorizeMsg(l);
        if (msgType === 'channel') {
          idPart = $("b", l).first().detach();
          if (l.children().first().filter("i").length > 0) {
            emote = true;
          }
          msgPart = l.html();
          if (this.isChatBot(speaker) === true) {
            _ref2 = this.handleChatBot(msgPart, speaker), msgPart = _ref2[0], speaker = _ref2[1], displayName = _ref2[2];
          } else {
            displayName = speaker;
          }
          if (speaker === this.session.status.name && emote === false) {
            msgPart = ": " + msgPart;
          }
          console.log("msgpart is:" + msgPart);
          prvPattern = /^\s*?:\s*?private:/i;
          if (channel === 'clan' && msgPart.match(prvPattern)) {
            console.log("\n\n private channel attempt");
            privateChannel = true;
            msgPart = msgPart.replace(prvPattern, ": ");
            channel = "private";
          }
        }
        if (msgType === 'private') {
          important = true;
          wFrom = playername.match(/(.+?)\s\(private\)/);
          console.log("\nHTML IS:\n" + l.html());
          if (wFrom !== null) {
            speaker = channel = wFrom[1];
            msgPart = ": " + $("font:eq(1)", l).html();
          } else {
            $("b", l).first().detach();
            msgPart = $("font", l).html();
            channel = playername;
            speaker = this.session.status.name;
          }
          displayName = speaker;
          real = channel;
          channel = "_" + channel;
          channel = channel.replace(" ", "_", "g");
          console.log("Setting real name as " + real + " for channel " + (channel.toLowerCase()) + " ");
          this.session.pd.realNames[channel.toLowerCase()] = real;
        }
        if (speaker === this.session.status.name) {
          myself = true;
        } else {
          myself = false;
          if (msgType === 'channel' && ((msgPart != null ? msgPart.match(this.session.status.name) : void 0) != null)) {
            important = true;
          }
          if (msgType === 'channel' && prefs.prefs.watchWords.length > 0 && ((msgPart != null ? msgPart.match(prefs.prefs.watchWords) : void 0) != null)) {
            important = true;
          }
        }
        if (msgType === 'private' || msgType === 'channel') {
          this.session.pd.getPlayerId(speaker);
          link = "<a pname='" + speaker + "' class='speaker'><font color='black'>" + displayName + "</font></a>";
          msg = ("<b>" + link + "</b>") + msgPart.trim();
          if (emote === true) {
            msg = "<i>" + msg + "</i>";
          }
        } else {
          msg = l.html();
        }
        if (msgType === 'system') {
          channel = "!!current";
          if (this.parseChannel(l.html()) === true) {
            channel = this.openChannel;
            important = true;
          }
        }
        chatPayload = {
          "tab": channel,
          "type": msgType,
          "msg": msg,
          "important": important,
          "speaker": speaker,
          "self": myself,
          "raw": line,
          "context": context
        };
        date = new Date();
        chatPayload.time = date.getTime();
        console.log("About to emit chat message, to tab [" + chatPayload.tab + "]");
        return porter.emit("newChatMessage", chatPayload);
      } catch (e) {
        return console.log(e);
      }
    };
    Chatter.prototype.chatWindow = function(tag) {
      return $("#clan", getChatDoc());
    };
    Chatter.prototype.processChatResponse = function(response) {
      var $res, jax, jaxRe, line, mark, moveBr, _i, _len, _ref, _results;
      if (response.match('<a href="createplayer.php">Create an Account</a>') != null) {
        alert('You were logged out of this session!');
        this.stop();
        return;
      }
      console.log("\n" + response + "\n");
      mark = response.lastIndexOf("<!--lastseen");
      if (mark >= 0) {
        this.lastseen = response.substring(mark + 13, mark + 23);
        response = response.substring(0, mark);
      }
      jaxRe = /<!--js\(/;
      try {
        if (response.match(jaxRe) != null) {
          jax = new Jax(this.session, response);
          jax.run();
        }
      } catch (e) {
        console.log("Error is: " + e);
      }
      $res = $("<span>" + response + "</span>");
      moveBr = function() {
        return $(this).parent().after($(this).detach());
      };
      $('font[color="green"] > br', $res).each(moveBr);
      $('font[color="red"] > br', $res).each(moveBr);
      $("font > br", $res).addClass("bullshit");
      response = $res.html();
      try {
        _ref = response.split(/<\/?br>/);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          line = _ref[_i];
          _results.push(this.processChatLine(line, response));
        }
        return _results;
      } catch (error) {
        return console.log("-----\n parse error!\n" + error + "\n-----");
      }
    };
    Chatter.prototype.processChatError = function(error) {
      return console.log("-----\nChat error!\n" + error + "\n-----");
    };
    Chatter.prototype.chatLoop = function() {
      if (this.active === false) {
        return;
      }
      return this.getNewChat().success(this.processChatResponse).fail(this.processChatError).complete(__bind(function() {
        return window.setTimeout(this.chatLoop, this.chatDelay);
      }, this));
    };
    Chatter.prototype.sendChatMessage = function(chatMessage) {
      var emote, encoded_msg, msg, tab, target;
      msg = chatMessage.msg;
      tab = chatMessage.currentTab;
      console.log("=========================");
      console.log("Submitting message:");
      console.log("tab is " + tab);
      if (msg.substring(0, 4) === '/em ' || msg.substring(0, 4) === '/me ') {
        emote = '/em ';
        msg = msg.substring(4);
      } else {
        emote = '';
      }
      target = null;
      if (msg[0] !== '/') {
        if (tab === "private") {
          tab = "clan PRIVATE: ";
        }
        if (tab[0] !== "_") {
          msg = "/" + tab + " " + emote + msg;
        } else {
          target = tab.substring(1);
          msg = ("/msg " + target + " ") + msg;
        }
      }
      if ((msg.match(/\/who\s*?$/) != null) && (tab[0] !== "_")) {
        msg = "/who " + tab;
      }
      console.log("message is: " + msg);
      console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^");
      encoded_msg = URLEncode(msg);
      return this.session.kolGet("submitnewchat.php?graf=" + encoded_msg).success(this.processChatResponse).fail(this.processChatError);
    };
    Chatter.prototype.start = function() {
      console.log('Staring');
      this.active = true;
      porter.on("newChatSubmission", this.sendChatMessage);
      try {
        porter.on("loadLink", this.session.mf.loadLink);
        porter.on("loadPlayer", this.session.pd.loadPlayer);
        porter.on("requestPlayerHeader", this.session.pd.findPlayerHeader);
        porter.on("requestPlayerStatus", this.session.pd.findPlayerStatus);
      } catch (e) {
        console.log("error " + e);
      }
      try {
        return this.getOpenChannel().fail(__bind(function(failure) {
          return console.log("FAILURE " + failure);
        }, this)).then(this.chatLoop);
      } catch (e) {
        return console.log(e);
      }
    };
    Chatter.prototype.stop = function() {
      return this.active = false;
    };
    return Chatter;
  })();
  KolSession = (function() {
    function KolSession() {
      this.kolGet = __bind(this.kolGet, this);
      this.getStatus = __bind(this.getStatus, this);
      this.makeURL = __bind(this.makeURL, this);
    }
    KolSession.prototype.active = false;
    KolSession.prototype.status = null;
    KolSession.prototype.makeURL = function(path) {
      return makeURL(path);
    };
    KolSession.prototype.start = function() {
      console.log("Starting session");
      return this.getStatus().then(__bind(function() {
        return this.active = true;
      }, this));
    };
    KolSession.prototype.getStatus = function() {
      return $.getJSON(this.makeURL("api.php?what=status&for=KolDaemon")).fail(__bind(function(failure) {
        return console.log("FAILURE " + (JSON.stringify(failure)));
      }, this)).then(__bind(function() {
        return console.log('BACK');
      }, this)).then(__bind(function(data) {
        return this.status = data;
      }, this));
    };
    KolSession.prototype.kolGet = function(location) {
      var url;
      if (location.indexOf("" + this.status.pwd) < 0) {
        if (location.indexOf('?') < 0) {
          location += '?';
        } else {
          location += '&';
        }
        location += "pwd=" + this.status.pwd + "&name=" + this.status.name;
      }
      url = this.makeURL(location);
      return $.ajax({
        "url": url,
        dataType: "html"
      });
    };
    return KolSession;
  })();
  session = new KolSession();
  session.pd = new PlayerDaemon(session);
  session.chat = new Chatter(session);
  session.mf = new MainFrame(session);
  porter = new Port();
  prefs = new Prefs();
  porter.on("setPrefs", prefs.setPrefs);
  init = function() {
    return session.start().done(session.chat.start);
  };
  porter.on("chatDisplayReady", init);
  DirectPort = (function() {
    function DirectPort() {
      this.trigger = __bind(this.trigger, this);
      this.on = __bind(this.on, this);
      this.emit = __bind(this.emit, this);
    }
    DirectPort.prototype.link = null;
    DirectPort.prototype.emit = function(msg, data) {
      return this.link.trigger(msg, data);
    };
    DirectPort.prototype.on = function(msg, callback) {
      return listeners[msg] = callback;
    };
    DirectPort.prototype.listeners = [];
    DirectPort.prototype.trigger = function(msg, data) {
      if (this.listeners[msg] != null) {
        return this.listeners[msg](data);
      }
    };
    return DirectPort;
  })();
}).call(this);
