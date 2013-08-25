// Generated by CoffeeScript 1.4.0

/* 
	Up here go all the helper functions
*/


(function() {
  var Chatter, DirectPort, Jax, KolSession, MainFrame, PlayerDaemon, Port, Prefs, URLEncode, frame, getChatDoc, getMainDoc, host, init, logit, makeURL, porter, predicate, prefs, session, xhr,
    _this = this,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  logit = function(msg) {
    return console.log("~kd: " + msg);
  };

  logit("------------HELLO FROM KD.COFFEE! ------------");

  xhr = new XMLHttpRequest();

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
    logit("Host is " + host);
  } catch (e) {
    logit("" + e);
  }

  if (host.match("localhost") != null) {
    predicate = "http://" + host;
  } else {
    predicate = "http://" + host;
  }

  makeURL = function(location) {
    return predicate + "/" + location;
  };

  frame = function(key) {
    return window.frames[key];
  };

  getChatDoc = function() {
    try {
      return frame(3).document;
    } catch (e) {
      return logit("dumb error: " + e);
    }
  };

  getMainDoc = function() {
    return frame(2).document;
  };

  URLEncode = function(plaintext) {
    return window.encodeURIComponent(plaintext);
  };

  Prefs = (function() {

    function Prefs() {
      this.setPrefs = __bind(this.setPrefs, this);

    }

    Prefs.prototype.prefs = [];

    Prefs.prototype.setPrefs = function(payload) {
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

    Prefs.onPrefChange = function() {};

    return Prefs;

  }).call(this);

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
      logit(path);
      return frame(2).location.href = path;
    };

    return MainFrame;

  })();

  Jax = (function() {

    Jax.prototype.session = [];

    Jax.prototype.text = "";

    function Jax(kolsession, line) {
      this.run = __bind(this.run, this);

      this.handleJaxResponse = __bind(this.handleJaxResponse, this);
      this.session = kolsession;
      this.text = line;
    }

    Jax.prototype.handleJaxResponse = function(out) {
      var $eff, body, div;
      logit("JAX RESPONSE\n____________________");
      try {
        logit(out);
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
        logit(e);
      }
      return frame(1).location.href = this.session.makeURL('charpane.php');
    };

    Jax.prototype.run = function() {
      var addr, dojaxList, handlerFactory, i, jax, js, jsFragment, jsList, re1, re2, reJs1, reJs2, _i, _j, _len, _len1, _results,
        _this = this;
      logit("Running jax request! -----");
      re1 = /dojax\('(.*?)'\);?\)/g;
      re2 = /dojax\('(.*?)'\);?\)/;
      handlerFactory = function(path) {
        return function() {
          return _this.session.kolGet(path).then(_this.handleJaxResponse);
        };
      };
      dojaxList = this.text.match(re1);
      if ((dojaxList != null)) {
        for (i = _i = 0, _len = dojaxList.length; _i < _len; i = ++_i) {
          jax = dojaxList[i];
          addr = jax.match(re2)[1];
          logit(addr);
          window.setTimeout(handlerFactory(addr), i * 100);
        }
      }
      reJs1 = /js\((.*?)\)-->/g;
      reJs2 = /js\((.*?)\)-->/;
      jsList = this.text.match(reJs1);
      if ((jsList != null)) {
        _results = [];
        for (i = _j = 0, _len1 = jsList.length; _j < _len1; i = ++_j) {
          js = jsList[i];
          if (js.match('dojax') === null) {
            jsFragment = js.match(reJs2)[1];
            logit("jsFrament is " + jsFragment);
            _results.push(eval(jsFragment));
          } else {
            _results.push(void 0);
          }
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
      this.stop = __bind(this.stop, this);

      this.start = __bind(this.start, this);

      this.watchLoop = __bind(this.watchLoop, this);

      this.broadcastPlayerInfo = __bind(this.broadcastPlayerInfo, this);

      this.getAllPlayers = __bind(this.getAllPlayers, this);

      this.requestPlayerInfo = __bind(this.requestPlayerInfo, this);

      this.watchPlayer = __bind(this.watchPlayer, this);

      this.normalizeName = __bind(this.normalizeName, this);

      this.findPlayer = __bind(this.findPlayer, this);

      this.getAllPlayerInfo = __bind(this.getAllPlayerInfo, this);

      this.parsePlayerChatStatus = __bind(this.parsePlayerChatStatus, this);

      this.getPlayerChatStatus = __bind(this.getPlayerChatStatus, this);

      this.findPlayerStatus = __bind(this.findPlayerStatus, this);

      this.getPlayerHeader = __bind(this.getPlayerHeader, this);

      this.parsePlayerSheet = __bind(this.parsePlayerSheet, this);

      this.doPlayerAction = __bind(this.doPlayerAction, this);

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
      return frame(2).location.href = this.session.makeURL("showplayer.php?who=" + id);
    };

    PlayerDaemon.prototype.getPlayerId = function(name) {
      var _this = this;
      if (this.pids[name] != null) {
        return this.pids[name];
      }
      return this.session.kolGet("submitnewchat.php?j=1&	graf=/whois " + name).success(function(result) {
        if (result.match(/#(\d+)/) !== null) {
          return _this.pids[name] = result.match(/#(\d+)/)[1];
        }
      });
    };

    PlayerDaemon.prototype.loadPlayer = function(payload) {
      var action, name,
        _this = this;
      name = payload.name;
      action = payload.name;
      logit("***\n\nTrying to show " + name + "\n\n***");
      return $.when(this.getPlayerId(name)).then(function() {
        return _this.showPlayer(_this.pids[name]);
      });
    };

    PlayerDaemon.prototype.doPlayerAction = function(payload) {
      var name,
        _this = this;
      console.log("DoPlayerAction: " + (payload.toSource()));
      name = payload.name;
      logit("***\n\nTrying to do player action for: " + name + "\n\n***");
      return $.when(this.getPlayerId(name)).then(function() {
        return frame(2).location.href = _this.session.makeURL("" + payload.action + "=" + _this.pids[name]);
      });
    };

    PlayerDaemon.prototype.parsePlayerSheet = function(result) {
      var $sheet, avatar, busymatch, clan, info;
      busymatch = /action=fight\.php|choice\.php/;
      if (result.match(busymatch) != null) {
        logit(result.match(busymatch));
        logit(result.match(busymatch) != null);
        logit("\t!!!\nTotally in a fight/choice page, bailing\n\n");
        return null;
      }
      logit("Parsing player sheet...");
      $sheet = $(result);
      avatar = $("img", $sheet).first().attr('src');
      info = $("img", $sheet).first().parent().next().children('center').html();
      clan = $("[href*=\"showclan.php\"]", $sheet).last().text();
      if (!(info != null)) {
        info = $("img", $sheet).first().parent().next().html();
      }
      logit("found info " + (info.toSource()));
      return {
        "avatar": avatar,
        "info": info,
        "clan": clan
      };
    };

    PlayerDaemon.prototype.getPlayerHeader = function(name) {
      var defer, getSheet,
        _this = this;
      defer = $.Deferred();
      getSheet = function(id) {
        return _this.session.kolGet("showplayer.php?who=" + id).success(function(result, status, request) {
          _this.findPlayer(name).header = _this.parsePlayerSheet(result);
          logit("TRYING TO RESOLVE DEFERRED 1");
          return defer.resolve();
        });
      };
      $.when(this.getPlayerId(name)).then(function() {
        return getSheet(_this.pids[name]);
      });
      return defer.promise();
    };

    PlayerDaemon.prototype.findPlayerStatus = function(payload) {
      var name;
      logit("\nFinding player status -8-8-");
      name = payload.name;
      logit(payload);
      return this.getPlayerChatStatus(name);
    };

    PlayerDaemon.prototype.getPlayerChatStatus = function(name) {
      var _this = this;
      return this.session.kolGet("submitnewchat.php?j=1&graf=/whois " + name).then(function(data) {
        return _this.findPlayer(name).status = _this.parsePlayerChatStatus(data);
      });
    };

    PlayerDaemon.prototype.parsePlayerChatStatus = function(data) {
      var status;
      logit(data);
      if (data.match("This player is currently away") != null) {
        status = "away";
      } else if (data.match("This player is currently online")) {
        status = "online";
      } else {
        status = "offline";
      }
      logit("\nStatus is " + status + " \n\t8-8-8\n");
      return status;
    };

    PlayerDaemon.prototype.getAllPlayerInfo = function(name) {
      var defer,
        _this = this;
      defer = $.Deferred();
      $.when(this.getPlayerId(name)).then(function() {
        _this.findPlayer(name).id = _this.pids[name];
        logit("--- found id ---");
        return $.when(_this.getPlayerChatStatus(name), _this.getPlayerHeader(name)).then(function() {
          return defer.resolve();
        });
      });
      return defer.promise();
    };

    PlayerDaemon.prototype.findPlayer = function(name) {
      name = this.normalizeName(name);
      if (!(this.playerInfo[name] != null)) {
        this.playerInfo[name] = new Object();
        this.playerInfo[name].name = name;
      }
      return this.playerInfo[name];
    };

    PlayerDaemon.prototype.normalizeName = function(name) {
      return name.toLowerCase();
    };

    PlayerDaemon.prototype.watchPlayer = function(name) {
      if (!(this.playersToWatch[this.normalizeName(name)] != null)) {
        return this.playersToWatch.push(this.normalizeName(name));
      }
    };

    PlayerDaemon.prototype.requestPlayerInfo = function(payload) {
      var name,
        _this = this;
      name = payload.name;
      this.watchPlayer(name);
      return this.getAllPlayerInfo(name).then(function() {
        return _this.broadcastPlayerInfo(name);
      });
    };

    PlayerDaemon.prototype.getAllPlayers = function() {
      var handlerFactory, name, _i, _len, _ref, _results,
        _this = this;
      handlerFactory = function(name) {
        return function() {
          return _this.broadcastPlayerInfo(name);
        };
      };
      _ref = this.playersToWatch;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        _results.push(this.getAllPlayerInfo(name).then(handlerFactory(name)));
      }
      return _results;
    };

    PlayerDaemon.prototype.broadcastPlayerInfo = function(name) {
      logit("BROADCASTING PLAYER INFO");
      return porter.emit("setPlayerInfo", this.playerInfo[name]);
    };

    PlayerDaemon.prototype.watchLoop = function() {
      logit("\n\n\n !!!!!!   !!!!!!!  \n Watch loop running!  " + this.active + "  \n\n\n");
      if (!this.active) {
        return;
      }
      try {
        this.getAllPlayers();
      } catch (e) {
        logit('Error ' + e);
      }
      return window.setTimeout(this.watchLoop, 30000);
    };

    PlayerDaemon.prototype.start = function() {
      this.active = true;
      this.watchPlayer(this.session.status.name);
      return this.watchLoop();
    };

    PlayerDaemon.prototype.stop = function() {
      return this.active = false;
    };

    PlayerDaemon.prototype.active = false;

    PlayerDaemon.prototype.playerInfo = [];

    PlayerDaemon.prototype.playersToWatch = [];

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

      this.processOutput = __bind(this.processOutput, this);

      this.processChatResponse = __bind(this.processChatResponse, this);

      this.chatWindow = __bind(this.chatWindow, this);

      this.processChatLine = __bind(this.processChatLine, this);

      this.handleChatBot = __bind(this.handleChatBot, this);

      this.makePlayerUrl = __bind(this.makePlayerUrl, this);

      this.isChatBot = __bind(this.isChatBot, this);

      this.getPlayerMenuOptions = __bind(this.getPlayerMenuOptions, this);

      this.getOpenChannel = __bind(this.getOpenChannel, this);

      this.parseChannel = __bind(this.parseChannel, this);

      this.getNewChat = __bind(this.getNewChat, this);

    }

    Chatter.prototype.getNewChat = function() {
      return this.session.kolGetJson("newchatmessages.php?j=1");
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
      var _this = this;
      return this.session.kolGet("submitnewchat.php?graf=/c").fail(function(failure) {
        return logit("FAILURE on openchannel " + failure);
      }).success(function() {
        return logit('stage 1 finished');
      }).success(this.parseChannel).success(function() {
        return logit('stage 2 finished');
      });
    };

    Chatter.prototype.getPlayerMenuOptions = function() {
      var _this = this;
      return this.session.kolGet("mchat.php").then(function(result) {
        var menuMatch, menuPattern;
        menuPattern = /actions\s*\=\s*({.+?});/;
        menuMatch = result.match(menuPattern);
        _this.menuJSON = JSON.parse(menuMatch[1]);
        return logit("Menu match:\n " + (_this.menuJSON.toSource()));
      });
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

    Chatter.prototype.handleChatBot = function(msg) {
      var $emote, $link, alias, bot, displayName, nameMatch,
        _this = this;
      try {
        nameMatch = msg.msg.match(/[\[\(\{](.+?)[\]\)\}]/);
        if (nameMatch != null) {
          bot = msg.who;
          displayName = nameMatch[0];
          alias = nameMatch[1];
          msg.msg = msg.msg.replace(displayName, '');
          if (alias.length > 20 && alias.substr(19, 1) === ' ') {
            alias = alias.substr(0, 19) + alias.substr(20);
            displayName = displayName.substr(0, 20) + displayName.substr(21);
          }
        } else {
          alias = displayName = msg.who.name;
        }
      } catch (e) {
        logit(e);
      }
      logit("\nDealing with chatbot for " + displayName + "\n");
      if (this.session.pd.pids[alias] != null) {
        msg.who.id = this.session.pd.pids[alias];
      } else {
        msg.who.id = '???';
        $.when(this.session.pd.getPlayerId("" + alias)).then(function() {
          return porter.emit('setSpeakerId', {
            'name': alias,
            id: _this.session.pd.pids[alias]
          });
        });
      }
      if (msg.type === 'public' && msg.format === '1') {
        $emote = $("<div>" + msg.msg + "</div>");
        $link = $("<i><a pname='" + alias + "'	 href='showplayer.php?who=" + msg.who.id + "'<font color='black'>" + alias + "</font></a></i>");
        $("a", $emote).first().replaceWith($link);
        msg.msg = $emote.html();
      }
      msg.who.name = alias;
      msg.who.displayName = displayName;
      logit("Displayname is " + displayName);
      logit("Returning chatbot message " + (msg.toSource()));
      return msg;
    };

    Chatter.prototype.processChatLine = function(msg, context) {
      var date, offPattern, prvPattern, tlcName, _ref, _ref1, _ref2;
      if (!(msg.channel != null)) {
        msg.channel = '!!current';
      }
      if (msg.channel === 'clan PRIVATE:') {
        msg.channel = 'private';
      }
      if (msg.channel === 'clan OFFTOPIC:') {
        msg.channel = 'offtopic';
      }
      if (!(msg.msg != null)) {
        return;
      }
      /*
      		Need to do the following things with msg data
      
      		* Flag whether the message was actively requested, and thus should initiate a tab switch
      */

      try {
        if (msg.type === 'public' && (msg.who != null)) {
          prvPattern = /^\s*?private:/i;
          offPattern = /^\s*?offtopic:/i;
          if (msg.channel === 'clan' && msg.msg.match(prvPattern)) {
            logit("\n\n private channel attempt");
            msg.msg = msg.msg.replace(prvPattern, "");
            msg.channel = "private";
          } else if (msg.channel === 'clan' && msg.msg.match(offPattern)) {
            msg.msg = msg.msg.replace(offPattern, "");
            msg.channel = "offtopic";
          }
          if (prefs.prefs.splitPvP === true && ((msg.who.id === '-69') || (msg.who.id === '-43')) && msg.channel === "pvp") {
            msg.channel = "pvp_radio";
            msg.tabName = "pvp/radio";
          }
          if (this.isChatBot(msg.who.name)) {
            msg = this.handleChatBot(msg);
          }
        }
        if (msg.type === 'private') {
          if (msg["for"] != null) {
            msg.channel = msg["for"].id;
            msg.tabName = msg["for"].name;
          } else {
            msg.channel = msg.who.id;
            msg.tabName = msg.who.name;
          }
        } else if (!(msg.tabName != null)) {
          msg.tabName = msg.channel;
        }
        tlcName = this.session.status.name.toLowerCase();
        if (msg.type === 'public' && (((_ref = msg.msg) != null ? _ref.toLowerCase().match(tlcName) : void 0) != null) && (tlcName !== ((_ref1 = msg.who) != null ? _ref1.name.toLowerCase() : void 0))) {
          msg.important = true;
        }
        if (msg.type === 'public' && prefs.prefs.watchWords.length > 0 && (((_ref2 = msg.msg) != null ? _ref2.match(prefs.prefs.watchWords) : void 0) != null)) {
          msg.important = true;
        }
        date = new Date();
        msg.timestamp = date.getTime();
        logit('initial timestamp: ' + msg.timestamp);
      } catch (e) {
        logit("Error " + e + " ... ");
      }
      return porter.emit("newChatMessage", msg);
    };

    Chatter.prototype.chatWindow = function(tag) {
      return $("#clan", getChatDoc());
    };

    Chatter.prototype.processChatResponse = function(response) {
      var msg, _i, _len, _ref, _results;
      logit("Raw chat response is: \n\n " + (response.toSource()) + "  \n\n");
      if (response.output != null) {
        this.processOutput(response.output, response);
      }
      _ref = response.msgs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        msg = _ref[_i];
        _results.push(this.processChatLine(msg, response));
      }
      return _results;
    };

    Chatter.prototype.processOutput = function(output, context) {
      var dojax, oMsg;
      logit("Output was: " + output);
      if (output.length < 1) {
        return;
      }
      if ((output != null ? output.match(/<!--js\(/) : void 0) != null) {
        dojax = new Jax(this.session, output);
        dojax.run();
      }
      oMsg = {
        msg: output,
        type: 'output',
        channel: "!!current"
      };
      return this.processChatLine(oMsg, context);
    };

    Chatter.prototype.processChatError = function(error) {
      return logit("-----\nChat error!\n" + (error.toSource()) + "\n-----");
    };

    Chatter.prototype.chatLoop = function() {
      var _this = this;
      logit("\nChat loop " + this.active + "...\n");
      if (this.active === false) {
        return;
      }
      return this.getNewChat().success(this.processChatResponse).fail(this.processChatError).complete(function() {
        return window.setTimeout(_this.chatLoop, _this.chatDelay);
      });
    };

    Chatter.prototype.sendChatMessage = function(chatMessage) {
      var emote, encoded_msg, msg, tab, target,
        _this = this;
      msg = chatMessage.msg;
      tab = chatMessage.currentTab;
      logit("=========================");
      logit("Submitting message:");
      logit("tab is " + tab);
      if (msg.substring(0, 4) === '/em ' || msg.substring(0, 4) === '/me ') {
        emote = '/em ';
        msg = msg.substring(4);
      } else {
        emote = '';
      }
      if (msg[0] !== '/') {
        if (tab.type !== 'private') {
          if (tab.id === 'private') {
            msg = "/clan PRIVATE: " + emote + msg;
          } else if (tab.id === 'offtopic') {
            msg = "/clan OFFTOPIC: " + emote + msg;
          } else if (tab.id === 'pvp_radio') {
            msg = "/pvp " + emote + msg;
          } else {
            msg = "/" + tab.id + " " + emote + msg;
          }
        } else {
          target = tab.name.replace(' ', '_');
          msg = ("/msg " + target + " ") + msg;
        }
      }
      if ((msg.match(/^\/who\s*?$/) != null) && (tab.type !== 'private')) {
        msg = "/who " + tab.id;
      }
      logit("message is: " + msg);
      logit("^^^^^^^^^^^^^^^^^^^^^^^^^^");
      encoded_msg = URLEncode(msg);
      return this.session.kolGetJson("submitnewchat.php?graf=" + encoded_msg + "&j=1").success(this.processChatResponse).success(function() {
        return _this.getNewChat().success(_this.processChatResponse).fail(_this.processChatError);
      }).fail(this.processChatError);
    };

    Chatter.prototype.start = function() {
      var _this = this;
      logit('Staring');
      this.active = true;
      porter.on("newChatSubmission", this.sendChatMessage);
      try {
        porter.on("loadLink", this.session.mf.loadLink);
        porter.on("loadPlayer", this.session.pd.loadPlayer);
        porter.on("requestPlayerInfo", this.session.pd.requestPlayerInfo);
        porter.on("testChatMessage", this.processChatLine);
        porter.on("doPlayerAction", this.session.pd.doPlayerAction);
      } catch (e) {
        logit("error " + e);
      }
      try {
        logit("-open channel-");
        return $.when(this.getPlayerMenuOptions(), this.getOpenChannel()).fail(function(failure) {
          return logit("FAILURE " + failure);
        }).then(function() {
          return porter.emit("chatDisplayInitData", {
            'openChannel': _this.openChannel,
            'playername': _this.session.status.name,
            'menu': _this.menuJSON
          });
        }).then(this.chatLoop);
      } catch (e) {
        return logit(e);
      }
    };

    Chatter.prototype.stop = function() {
      return this.active = false;
    };

    return Chatter;

  })();

  KolSession = (function() {

    function KolSession() {
      this.kolGetJson = __bind(this.kolGetJson, this);

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
      var _this = this;
      logit("Starting session");
      return this.getStatus().then(function() {
        return _this.active = true;
      });
    };

    KolSession.prototype.getStatus = function() {
      var url,
        _this = this;
      url = this.makeURL("api.php?what=status&for=KolDaemon");
      logit('json url is ' + url);
      return $.getJSON(url).fail(function(failure) {
        return logit("Json FAILURE " + (JSON.stringify(failure)));
      }).then(function() {
        return logit('BACK');
      }).then(function(data) {
        return _this.status = data;
      });
    };

    KolSession.prototype.kolGet = function(location) {
      var url;
      logit("Attempting to get " + location);
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

    KolSession.prototype.kolGetJson = function(location) {
      var url;
      logit("Getting " + location);
      if (location.indexOf("" + this.status.pwd) < 0) {
        if (location.indexOf('?') < 0) {
          location += '?';
        } else {
          location += '&';
        }
        location += "pwd=" + this.status.pwd + "&name=" + this.status.name;
      }
      url = this.makeURL(location);
      return $.getJSON(url);
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
    logit("Reached init()");
    return session.start().done(session.chat.start).done(session.pd.start);
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
