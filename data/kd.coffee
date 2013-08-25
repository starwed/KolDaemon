console.log("------------HELLO------------")




# TODO

# Then, right click menus for players



# HARD to reproduce/fix bugs

# /searchmall does something really weird with focus
## -- FF bug!
# switching to an inactive tab, scrolling can get weird
# sometimes two tabs get selected at once.  (Probably a jqueryui bug?)
#  (Doesn't seem to happen in recent version of FF?)
# Generally, hard to test mod messages!  :(   Need to capture the raw response to test with

#Probably finished
# messages (mods/system) with <br/> in the wrong place can add empty lines to chat
# Implement proper parsing of messages
#		??? The special negative player ids



# MINOR
#	PREF: Whether to autoswitch to channel when sent message indicates it
# 	PREF: Keyboard shortcuts




### 
	Up here go all the helper functions
###

#Object for abstracting messaging a little
class Port
	constructor: ()->
	emit: (msg, data)=>
		self.port.emit(msg, data)
	on: (msg, callback)=>
		self.port.on(msg, callback)


try
	host = window.location.host
	console.log("Host is #{host}")
catch e
	console.log("#{e}")

if host.match("localhost")?
	predicate = "http://" + host
else
	predicate = "http://" + host
makeURL = (location) -> predicate + "/" + location

# menu: 0 charpane:1 mainpane:2 chat:3
frame = (key)=> window.frames[key]
getChatDoc = () => 
	try
		frame(3).document
	catch e
		console.log("dumb error: #{e}x")
getMainDoc = () => frame(2).document


# Replacement for that weird Kol custom function
URLEncode = (plaintext) => window.encodeURIComponent(plaintext)


#Definitions to replace KoL's own shortcuts
window.top.charpane = frame(1)
window.top.mainpane = frame(2)
#Somtimes the jax code calls inv_update() -- should maybe define that function as well



class Prefs
	prefs: []
	#constructor: ()->
	#	porter.on("setPrefs", @setPrefs)
	setPrefs: (payload) =>
		#console.log('setting prefs')
		oldPrefs = @prefs
		@prefs = payload.prefs
		console.log(oldPrefs.toSource() )
		try 
			for p of oldPrefs
				if oldPrefs[p]!=@prefs[p] then @onPrefChange(p)
		catch e
			console.log("Error #{e}")

	@onPrefChange: ()=> #Nothing needed here for now


class MainFrame
	session: null
	constructor: (@session) ->
	loadLink: (payload)=>
		return if payload is null
		path=payload.path
		if path.indexOf('http://')<0 and path.indexOf('https://') < 0
			path=@session.makeURL(path)
		console.log(path)
		frame(2).location.href=path
	
	

class Jax
	session: []
	text: ""
	constructor: (kolsession, line)->
		@session= kolsession
		@text = line


	handleJaxResponse: (out) =>
		console.log("JAX RESPONSE\n____________________")

		# Much of this is just following what KoL does directly
		try
			console.log(out)
			$eff = $(getMainDoc() ).find("#effdiv")
			if $eff.length is 0
				div = getMainDoc().createElement('DIV')
				div.id = 'effdiv'
				# By default, insert into the body, but then if there's a content div get that as the 'body' instead.
				body = getMainDoc().body
				if $('#content_').length > 0 then body = $('#content_ div:first')[0]
				body.insertBefore(div, body.firstChild);
				$eff = $(div)
			$eff.find('a[name="effdivtop"]').remove().end()
				.prepend('<a name="effdivtop"></a><center>' + out + '</center>').css('display','block');
		catch e
			console.log(e)
		#refresh chat pane
		frame(1).location.href = @session.makeURL('charpane.php')



	run: ()=>
		console.log("Running jax request! -----")
		re1 = /dojax\('(.*?)'\);?\)/g
		re2 = /dojax\('(.*?)'\);?\)/
		handlerFactory = (path)=>
			return () => @session.kolGet(path).then( @handleJaxResponse )
		dojaxList=@text.match(re1)
		if(dojaxList?)
			for jax, i in dojaxList
				addr = jax.match(re2)[1]
				
				#Sad that ~let~ doesn't work in CS :(
				#Use handlerFactory to bind the value instead
				console.log(addr)
				window.setTimeout( handlerFactory(addr),i*100)
		
		reJs1 = /js\((.*?)\)-->/g
		reJs2 = /js\((.*?)\)-->/
		jsList = @text.match(reJs1)
		if( jsList? )
			for js, i in jsList
				if js.match('dojax') is null
					jsFragment = js.match(reJs2)[1]
					console.log("jsFrament is #{jsFragment}")
					eval(jsFragment)
	
	
	
	
	
class PlayerDaemon
	session: []
	realNames: new Object()
	constructor: (@session) ->
	pids: {"AFHk":1736457, "AFH":1736451, "AFHobo":1736458}
	headers: []
	showPlayer: (id) => 
		try
			frame(2).location.href= @session.makeURL("showplayer.php?who=#{id}")
		catch e
			console.log(e)

	getPlayerId: (name)=>
		return @pids[name] if @pids[name]?
		return @session.kolGet("submitnewchat.php?graf=/whois #{name}")
			.success( (result) => @pids[name]=result.match(/#(\d+)/)[1] if result.match(/#(\d+)/) != null )
			
		
	loadPlayer: (payload)=> 
		name=payload.name
		console.log("***\n\nTrying to show #{name}\n\n***")
		$.when(@getPlayerId() )
			.then( ()=> @showPlayer(@pids[name]) )	

	getPlayerInfo: (id)=>
		return @headers[id] if @headers[id]? 
		console.log('requesting character sheet')
		return @session.kolGet("showplayer.php?who=#{id}")
			.success( (result)=> @headers[id] = @parsePlayerInfo(result) )
	
	parsePlayerInfo: (result) =>
		$sheet = $(result)
		avatar = $("img", $sheet).first().attr('src')
		info = $("img", $sheet).first().parent().next().children('center').html()
		# Deal with astral spirits
		if not info?
			info = $("img", $sheet).first().parent().next().html()		
		return {"avatar":avatar, "info":info}

	findPlayerHeader: (payload) =>			
		
		console.log("Looking up tab name |#{payload.name.toLowerCase()}|")
		console.log(@realNames)
		if @realNames[payload.name.toLowerCase()]?
			name = @realNames[payload.name.toLowerCase()]
		else
			console.log("PROBLEM FINDING TAB NAME!")
			name = payload.name.substr(1)
		
		#payload.name
		$.when( @getPlayerId(name) )
			.then( ()=> 
				try
					id = @pids[name]
					$.when( @getPlayerInfo(id) )
						.then( ()=>
							porter.emit("setPlayerHeader", {"name": payload.name, "header":@headers[id]}) )
				catch e
					console.log("Error looking up: #{e}")
			)

	findPlayerStatus: (payload) =>
		console.log("\nFinding player status -8-8-")
		#if @realNames[payload.name.toLowerCase()]?
		#	name = @realNames[payload.name.toLowerCase()]
		#else
		#	console.log("PROBLEM FINDING TAB NAME!")
		name = payload.name
		console.log(payload)
		@getPlayerChatStatus(name)

	
	getPlayerChatStatus: (name)=>
		@session.kolGet("submitnewchat.php?graf=/whois #{name}") 
			.then( 
					(data)=> porter.emit("setPlayerStatus", {"name":name, "status":@parsePlayerChatStatus(data) } )
				) 

	parsePlayerChatStatus: (data)=>
		console.log(data)
		if data.match("This player is currently away")?
			status = "away"
		else if data.match("This player is currently online")
			status = "online"
		else
			status = "offline"
		console.log("\nStatus is #{status} \n\t8-8-8\n")
		return status



class Chatter
	chatDelay: 3000	#Default delay set by kol
	lastseen:  0
	active: false
	session: null
	pd: null
	openChannel: null

	constructor: (@session) ->
		

	getNewChat: => @session.kolGet("newchatmessages.php?afk=0&lasttime=#{@lastseen}")
	
	parseChannel: (response)=>
		matched = response.match(/You are now talking in channel: (.+?)\./)
		@openChannel = matched[1] if matched? 
		return matched?


	getOpenChannel: =>
		
		return @session.kolGet("submitnewchat.php?graf=/c")
				.fail( (failure )=> console.log("FAILURE on openchannel #{failure}"))
				.success( @parseChannel )
				.then( ()=>porter.emit("chatDisplayInitData", 
					{'openChannel':@openChannel, 'playername':@session.status.name})
				)
		




	# One day, let these be edited
	registeredChatBots: ["AFHk", "AFH", "AFHobo"]

	isChatBot: (name)=> 
		return true for bot in @registeredChatBots when name is bot
		return false


	
	makePlayerUrl: (id) => 'showplayer.php?who=#{id}'

	categorizeMsg: (l) => 
		firstFont = $('font', l).first()
		firstFontText = $('font', l).first().text()
		re = /^\s*?\[(.+?)]/ 

		#Since the channel tags are stripped out, best way to categorize is by initial font color!
		if firstFont.attr('color') is 'green' 
			msgType = 'system'
		else if firstFont.attr('color') is 'red' 
			msgType = 'system-red'
		else if $("table", l).length >0		
			#if the response has a table in it, it can't be a regular message
			msgType = 'system'
		else if $('a[href*="showplayer.php"]', l).length is 0	
			# anything without a playername link must be a system message 
			#	(Well, could be part of a stupid chat effect like gothy, possible to fix?)
			msgType = 'system'
		else if firstFont.attr('color') is 'blue'
			# If the first font tag doesn't contain a [channel], and is blue, it should be a private message!
			msgType = 'private'
		else
			# Make the default type of message a 'channel' message -- closest to 'normal'
			# and we only get down here if the line contains an appropriate link to a player
			msgType = 'channel'
		return msgType

	handleChatBot: (msg, speaker) =>
		try
			# Attempt to deal with chatbots
			console.log("Chatbot #{speaker} found")
			nameMatch = msg.match(/[\[\(\{](.+?)[\]\)\}]/)
			if nameMatch?
				bot = speaker
				displayName = nameMatch[0]
				alias = nameMatch[1] 

				msg = msg.replace(displayName, '')
				#Remove spaces introduced by chat backend.  No one has names of length>40, right?
				# TODO this isn't quite airtight, there are corner cases, but those hypothetical people suck :P
				if alias.length>20 and alias.substr(19,1) is ' '				
					alias = alias.substr(0, 19) + alias.substr(20)
					displayName = displayName.substr(0, 20) + displayName.substr(21)
			else
				alias = displayName = speaker
		catch e
			console.log(e)
		return [msg, alias, displayName]
		




	processChatLine: (line, context)=>
		return if line.length <= 6 	#Kill wayward fragments "<br/>".  Might not actually help?

		l = $("<div class='line'>#{line}</div>", getChatDoc() )

		#Check for player name, text value of first link that 

		playername = $('a[href*="showplayer.php"]', l).first().text() 
		if playername? then speaker=playername
		chatPayload = []

		try
			important=false
			emote = false
			privateChannel = false
			channel = @openChannel	#default
			msgType = 'system'	#default
			firstFont = $('font', l).first()
			firstFontText = $('font', l).first().text()

			if (firstFontText.match(/^\s*?\[(.+?)]/ ) isnt null)
				channel = firstFontText.match(/^\s*?\[(.+?)]/)?[1]
				firstFont.remove() 

			# Figure out what type of messsage we're dealing with
			msgType = @categorizeMsg(l)

			#Take appropriate actions!
			if msgType is 'channel'
				# If channel name is shown, set and then get rid of channel tag.
				
				# First bold element is the player name, everything else is the message, I think...
				idPart = $("b", l).first().detach()
				if l.children().first().filter("i").length>0
					emote=on
				msgPart = l.html()


				if @isChatBot(speaker) is true
					[msgPart, speaker, displayName] = @handleChatBot(msgPart, speaker)
				else
					displayName = speaker
				if speaker is @session.status.name and emote is off
					msgPart = ": "+msgPart

				console.log("msgpart is:#{msgPart}")
				#Deal with PRIVATE messages.  Should work for your own messages too!
				prvPattern = /^\s*?:\s*?private:/i
				if channel is 'clan' and msgPart.match( prvPattern)
					console.log("\n\n private channel attempt")
					privateChannel =true
					msgPart = msgPart.replace(prvPattern, ": ")
					channel = "private"
			
				

			if msgType is 'private'
				important=true					
				wFrom = playername.match(/(.+?)\s\(private\)/)
				#Remove that first bold part 
				
				# get the inside contents of the second font tag -- that corresponds to the message
				console.log("\nHTML IS:\n" + l.html())
				
				if wFrom != null
					speaker = channel =  wFrom[1]
					msgPart = ": " + $("font:eq(1)", l).html()
				else
					$("b", l).first().detach()
					msgPart = $("font", l).html()
					channel =  playername
					speaker =@session.status.name
				
				#$.when( @session.pd.getPlayerInfo(@session.pd) )
				#	.then( porter.emit( @session.pd.headers[])  )

				displayName = speaker
				#keep track of original playername
				real = channel
				channel = "_" + channel  	#Make shift thing to indicate private channels should probably fix this
				# Replace any spaces in channel name, caused by player names w/ spaces

				channel = channel.replace(" ", "_", "g")
				#Allow looking up channel to find realname
				console.log("Setting real name as #{real} for channel #{channel.toLowerCase()} ")
				@session.pd.realNames[channel.toLowerCase()] = real



			
			if speaker is @session.status.name
				myself=true
			else
				myself=false
				if msgType is 'channel' and msgPart?.match(@session.status.name)?
					important = true
				if msgType is 'channel' and prefs.prefs.watchWords.length>0 and msgPart?.match(prefs.prefs.watchWords)?
					important = true

			# Reconstruct the spoken message
			if msgType is 'private' or msgType is 'channel'	
				@session.pd.getPlayerId(speaker)
				link = "<a pname='#{speaker}' class='speaker'><font color='black'>#{displayName}</font></a>"
				msg = "<b>#{link}</b>" + msgPart.trim()
				if emote is on
					msg = "<i>" + msg + "</i>"
			else
				msg = l.html()

			#Check system messages for new open channel listing
			# This means looking for the string 'you are now talking in channel: XXX'
			if msgType is 'system'	
				channel= "!!current" #by default	
				if @parseChannel(l.html()) is true
					channel = @openChannel
					important = true

			
			chatPayload = 
				"tab": 	channel
				"type": msgType
				"msg": 	msg 
				"important": important
				"speaker": speaker
				"self": myself
				"raw":line
				"context":context


			date = new Date()
			chatPayload.time = date.getTime();

			console.log("About to emit chat message, to tab [#{chatPayload.tab}]")
			porter.emit("newChatMessage", chatPayload)
		catch e
			console.log(e)
		
	chatWindow: (tag) =>  $("#clan", getChatDoc()  )

	processChatResponse: (response)=>
		#Bail if login page is returned, and stop chat from running.
		if response.match('<a href="createplayer.php">Create an Account</a>')?
			alert( 'You were logged out of this session!')
			@stop()
			return

		console.log("\n" + response + "\n")
		mark = response.lastIndexOf("<!--lastseen");
		if(mark>=0)	
			@lastseen = response.substring(mark+13, mark+23);
			response = response.substring(0, mark)

		jaxRe = /<!--js\(/
		try
			if response.match(jaxRe)?
				jax = new Jax( @session, response)
				jax.run()
		catch e
			console.log("Error is: #{e}")

		#Process response to deal with bullshit <br> elements
		$res = $("<span>#{response}</span>")
		

		#move break elements up on level
		moveBr = () -> $(this).parent().after( $(this).detach() )
		$('font[color="green"] > br', $res).each( moveBr )
		$('font[color="red"] > br', $res).each( moveBr )

		#Any remaining break tags are BS?
		$("font > br", $res).addClass("bullshit")

		response = $res.html()
		
		try			
			for line in response.split(/<\/?br>/)
				@processChatLine(line, response)
		catch error
			console.log("-----\n parse error!\n#{error}\n-----")
		
	processChatError: (error) => console.log("-----\nChat error!\n#{error}\n-----")

	chatLoop: =>
		return if @active == false
		@getNewChat()
			.success( @processChatResponse )
			.fail(  @processChatError )
			.complete( => window.setTimeout( @chatLoop, @chatDelay)  )

	sendChatMessage: (chatMessage)=>
		#console.log("submitting chat message #{msg}")
		msg = chatMessage.msg
		tab = chatMessage.currentTab
		console.log("=========================")
		console.log("Submitting message:")
		console.log("tab is #{tab}")

		# Target message at the correct place  TODO fix wonky private system
		if msg.substring(0,4) is '/em ' or  msg.substring(0,4) is '/me '
			emote = '/em '
			msg = msg.substring(4)
		else 
			emote=''

		target = null

		if msg[0] isnt '/' 
			if tab is "private"
				tab="clan PRIVATE: "
			if tab[0] isnt "_"
				msg = "/#{tab} #{emote}#{msg}" 
			else
				target = tab.substring(1)
				msg ="/msg #{target} " + msg
		if msg.match(/\/who\s*?$/)? and (tab[0] isnt "_")
			msg =  "/who #{tab}"
		
		
		console.log("message is: #{msg}")
		console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^")
		encoded_msg = URLEncode(msg)
		return @session.kolGet("submitnewchat.php?graf=#{encoded_msg}")
			.success( @processChatResponse )
			.fail(  @processChatError )
		



	start: =>
		console.log('Staring')
		@active=true
		porter.on("newChatSubmission", @sendChatMessage)
		
		try
			porter.on("loadLink",  @session.mf.loadLink)
			porter.on("loadPlayer", @session.pd.loadPlayer)
			porter.on("requestPlayerHeader", @session.pd.findPlayerHeader)
			porter.on("requestPlayerStatus", @session.pd.findPlayerStatus)
			#porter.on("")

		catch e
			console.log("error #{e}")
		
		try
			@getOpenChannel()
				.fail( (failure )=> console.log("FAILURE #{failure}"))
				.then( @chatLoop )
		catch e
			console.log(e)


	stop: => @active = false

		

class KolSession
	active: false
	status: null
	makeURL: (path) => makeURL(path)

	start: ->
		console.log("Starting session")
		return @getStatus().then ()=>@active=true

	getStatus:  => 
		return $.getJSON( @makeURL("api.php?what=status&for=KolDaemon") )
			.fail( (failure )=> console.log("FAILURE #{JSON.stringify(failure)}"))
			.then( ()=> console.log('BACK') )
			.then( (data) => @status = data )

	kolGet: (location) =>
		if location.indexOf("#{@status.pwd}") < 0 
			if location.indexOf('?') < 0 
				location+='?'
			else
				location+='&'
			location+="pwd=#{@status.pwd}&name=#{@status.name}"
		url = @makeURL(location)
		return( $.ajax({"url":url, dataType:"html" } ))




session = new KolSession()
session.pd = new PlayerDaemon(session)
session.chat = new Chatter(session)
session.mf = new MainFrame(session)
porter = new Port()

prefs = new Prefs()
porter.on("setPrefs", prefs.setPrefs)


init = ()->
	session
		.start()
		.done( session.chat.start )

#wait until chat display is ready to start things up?
porter.on("chatDisplayReady", init )




# Pretend direct connection?
class DirectPort
	link: null
	emit: (msg, data) => @link.trigger(msg, data)
	on: (msg, callback) => listeners[msg] = callback
	listeners: []
	trigger: (msg, data) =>
		if @listeners[msg]?
			@listeners[msg](data)

# porter = new DirectPort()
# window.['charpane'].porter = new DirectPort()
# porter.link = window['charpane'].porter
# window['charpane'].porter.link = porter




		


