

#Object for abstracting messaging a little
class Port
	emit: (msg, data)=>
		self.port.emit(msg, data)

	on: (msg, callback)=>
		self.port.on(msg, callback)

	



MenuObject =  {
	title: 'Actions',
	items: [
		{
			label:'Get Status',  
			action: (e)-> 
				#console.log("Event target 4" + e.target)
				#alert('clicked one')
				pname = $(e.target).closest('[pname]').attr('pname')
				porter.emit("requestPlayerStatus", {"name":pname})

				#alert( $(this).attr('pname'))
				#alert(  )
				#console.log('----- !!!!!!!! _----_-_-_-_-')
				#console.log(e.toSource() )
		},
	    {
	    	label:'Debug',
	    	action: (e)=> 
	    		oid = $(e.target).closest('[oid]').attr('oid')
	    		#alert(oid)
	    		obj = displayer.objectLog[oid]
	    		console.log("\n===================")
	    		console.log("\n___________________\n")
	    		console.log(obj.msg)
	    		console.log('\n')
	    		console.log(obj.raw)	    		
	    		console.log("\n===================\n")
	    		alert("^" + obj.raw + "|$")
	    		alert("Context: ^" + obj.context + "|$")
	    }
	]
}


class ChatDisplay
	openTabs: []	
	#tabWindows: []
	tabInfo: []
	openChannel: null
	playername: "starwed"
	commandHistory: []
	commandMemory: 15
	commandMarker: null
	$tabs: null


	objectLog: []

	optShow: false
	#Prefs
	prefs: []

	logTab: off
	logInChat: off


	$options: null
	$log: null

	currentTab:  => 
		tabIndex = $("#tabs").tabs("option", "selected")
		return @openTabs[tabIndex]
	getWindow: (tab) => 
		return $("#" + "#{tab}")

	getTabHeader: (tab) =>
		#console.log("Getting header for #{tab}")
		return $('#tab-head > li >a[href="#' + tab + '"]').parent()

	clearMessages: (tab) =>
		$(".system", @getWindow(tab) ).each( ()-> $(this).remove() )


	selectTab: (tab) =>
		try
			index = $( "li", @$tabs ).index( @getTabHeader(tab) )
			#console.log(index)
			@$tabs.tabs("select", index)
			@setSize()
		catch e
			console.log("#{e}")




	tabRight: ()=>
		tabIndex = @$tabs.tabs("option", "selected")
		if tabIndex >= @openTabs.length-1
			@$tabs.tabs("select", 0)
		else
			@$tabs.tabs("select", tabIndex+1)
			

	tabLeft: ()=>	
		tabIndex = @$tabs.tabs("option", "selected")		
		if tabIndex is 0
			@$tabs.tabs("select", @openTabs.length-1)
		else
			@$tabs.tabs("select", tabIndex-1)


	setPlayerHeader: (payload) =>
		chatwindow = @getWindow(payload.name)
		lead=payload.header.info.match(/^(.+?)<\s*?br/)
		#console.log("INFO IS #{payload.header.info}")
		if lead?
			#console.log("LEAD is #{lead[1]}")
			payload.header.info = payload.header.info.replace(lead[1], "<a class='headerName' pname='#{payload.name}'>" + lead[1] + "</a>")
		headerHTML = """
			<table width='100%'><tr>
			<td><div>#{payload.header.info}</div></td>
			<td width = '30'><img src='#{payload.header.avatar}' height='50' width='30'/></td>
			</tr></table>
		"""
		chatwindow.children(".chatInfo").html(headerHTML)
		$(".chatInfo a", chatwindow).each( @formatLink)
		@setSize()
		

	addTab: (tab) => 
		try
			if tab?
				console.log("adding tab for #{tab}")
				if tab is '__log'
					label = 'Log'
					info = '<b>System Log</b>'
				else if tab[0] is '_' 
					label = '#'+tab.substring(1)
					porter.emit("requestPlayerHeader", {"name":tab})
					info = "...loading info for #{tab.substring(1)}..."
				else
					info = ''
					label = tab
				$("#tabs").tabs( "add", "##{tab}", label )
				
				
				$opt = $("<div/>").addClass('chatOpt')
				$clear = $("<a>clear notifications</a>").click(
						()=> @clearMessages(@currentTab() )
				)
				$opt.append($clear)
				
				ct = $( "##{tab}")
					.addClass("chatTab")
				  	.append("<div class='chatInfo'>#{info}</div>")
					.append("<div class='ChatWindow'><br/></div>")
					.append($opt)

				@tabInfo[tab] = {window: $(".ChatWindow", ct)}
				@openTabs.push(tab)
				@setSize()

		catch e
			console.log("Error while adding tab #{tab}: #{e}")
				
			

	#tabFlash: (tab) => 
	#	@getTabHeader(tab).css("font-style", 'italic').effect('pulsate', {times:3}, 600)#css("background-color", "green")
	

	showSystemLog: =>
		properWidth = $("#tabs").width()


		$dialog = $("<div ></div>")
		$dialog.append(@$log.clone())

		$dialog.dialog({
			title: 'System Messages'
			width: properWidth
		})

		#$dialog.append(@log)

		#$dialog.dialog( "option", "width", 460 );


	

	
	refreshTimeStamps: ()=> $(".timestamp").toggle(@prefs.timestampsOn)
		
	
	#called in a context where this points to a link's dom node
	formatLink: () ->
		target = $(this).attr('target')
		href = $(this).attr('href')
		plname =  $(this).attr('pname')
		if plname?.length>0	
			$(this).click(
				()->
					porter.emit("loadPlayer", {"name":plname})
					return false
			)
		else if target is 'mainpane'
			$(this).attr('starwed', 'isMainpane')
			$(this).click(
				()->
					rawtext = $(this).text()
					pname = rawtext.match(/[\w\s]+/)
					if pname isnt null
						pname = pname[0]
						porter.emit("loadLink")
					
					#console.log("CLICK NAME IS: |#{pname}|")
					porter.emit("loadLink", {"path":href})

					return false
			)
		else
			$(this).attr('starwed', 'touchedButNotMain')
		
	
	
	addToLog: (msg, timestamp)=>

		$msg = $( "<div class='log-message'>#{timestamp}#{msg}</div>")
		if not @tabInfo['__log']?
			@addTab('__log')

		logWindow = @tabInfo['__log'].window
		logWindow.append($msg)
		
		
			
	displayMsg: (payload) => 
		oid = @objectLog.push(payload) - 1
		#console.log("Displaying Message")
		tab = payload.tab
		msg = payload.msg
		type = payload.type

		return if msg.length<2   # Kill those silly fragments, might not be necessary right now

		#Get the base message text before we add timestamps etc.
		baseMsg = $("<div>#{msg}</div>").text()
	
		
		date = new Date(payload.time)
		minutes = date.getMinutes()
		hours = date.getHours()
		if minutes <10 
			minutes = "0" + minutes
		if @prefs.timestampsOn is true
			tsdisplay = 'inline'
		else
			tsdisplay = 'none'
		
		timestamp = "<span  style='display: #{tsdisplay}' class='timestamp'>[#{hours}:#{minutes}]
					</span>"	
		#console.log(timestamp)

		if @logTab is on and (type is 'system' or type is 'system-red')
			@addToLog(msg, timestamp )
		
		
			

		if tab is "!!current"
			tab = @currentTab()
		try
			if not tab?
				return
			if not @tabInfo[tab]? 
				@addTab(tab)



			
			#Note unread messages, flash if important. 
			if tab isnt @currentTab()
				if payload.self is false 
					@getTabHeader(tab).css("font-style", 'italic')
					if payload.important is true
						@getTabHeader(tab).effect('pulsate', {times:3}, 600)
						@getTabHeader(tab).addClass('important')
						@setSize()		
				else
					@selectTab(tab)
					
			chatWindow = @tabInfo[tab].window
			doscroll = @checkScroll(chatWindow)
			



			#TODO: this might not be necessary any more, now that negative indent works...
			if payload.type is 'channel' or payload.type is 'private'
				spacer = '&nbsp;'
			else
				spacer = '';
			titleText = "[#{hours}:#{minutes}]"
			$msg = $("<div oid='#{oid}' title='#{titleText}' class='chatLine'>#{spacer}#{timestamp}#{msg}</div>")

			# Need to override link behavior, becuase relative links break badly
			# Also, special handling for speaker names! 
			$("a", $msg).each( @formatLink)

		
			#add the message to the system log if appropriate
			if type is 'system' #or type is 'system-red'
				@$log.append($msg.clone())


			# Add the appropriate styles
			if type is 'system' or type is 'system-red'
				$msg.addClass('system')
				$msg.append("<span class='ui-icon ui-icon-close'>Remove Tab</span>")
			if type is 'system-red'
				$msg.addClass('system-red')
			if type is 'channel' and payload.important is true
				$msg.addClass('important')
			if type is 'channel' or type is 'private'
				$msg.addClass('talking')

			$msg.find("[pname]").contextPopup(MenuObject)
			$msg.find("a").contextPopup(MenuObject)
			#Now, add the message to the chatwindow, scrolling if necessary
			# Don't add system messages if persist is set to 0
			if (type isnt 'system') or ( parseFloat(@prefs.persistSystemMessages)!=0)
				#if type is 'system' then console.log(parseFloat(@prefs.persistSystemMessages))
				chatWindow.append($msg)





			#Remove note after a while if that pref is a positive number
			if type is 'system' and parseFloat(@prefs.persistSystemMessages)>0
				target = $msg.get(0)
				removeMsg =  ()=> target.parentNode.removeChild(target)
				window.setTimeout( removeMsg,  @prefs.persistSystemMessages * 1000 )
			if type is 'system' and @prefs.notifyOn is on
				porter.emit("kdNotify", {title:'Kol Chat', msg:baseMsg})
			if type is 'private' and @prefs.pmNotifyOn is on and payload.self is false
				porter.emit("kdNotify", {title:"Private from #{payload.speaker}", msg:baseMsg})
			@scroll(chatWindow) if doscroll	
		catch e
			console.log("Error in displayMsg: #{e}")

		

	
	# returns true if we need to scrollb
	checkScroll:  (cw)=> true   #( cw.outerHeight() + cw.scrollTop() + 5 > cw[0].scrollHeight )

	scroll: (cw) => true #cw.animate({scrollTop: cw[0].scrollHeight})

	sendChatMessage: () => 
		try
			# If we're sending a message, reset commandhistory
			if @commandMarker != null
				@commandMarker= null
				@commandHistory.shift()
			
			#console.log('[cd] sending message')
			msg = $("#chatBox ").val()
			@commandHistory.unshift(msg)
			if @commandHistory.length > @commandMemory
				@commandHistory.pop()
			$("#chatBox").val("")
				
			porter.emit("newChatSubmission", {"msg":msg, "currentTab": @currentTab() })
		catch e
			console.log(e)

	startHistory: =>
		@commandHistory.unshift($("#chatBox ").val() )
		@commandMarker = 0

	historyUp: =>
		if @commandMarker is null then @startHistory()
		@commandMarker+=1
		if @commandMarker >= @commandHistory.length then @commandMarker = 0
		$("#chatBox ").val(@commandHistory[ @commandMarker])
	
	historyDown: =>
		if @commandMarker is null then @startHistory()
		@commandMarker-=1
		if @commandMarker < 0 then @commandMarker = @commandHistory.length
		$("#chatBox ").val(@commandHistory[ @commandMarker])
		

	removeTabByIndex: (index) =>
		console.log('removing tab?')
		try
			tab =  @openTabs[index]
			@$tabs.tabs("remove", index)
			@openTabs.splice(index, 1)
			@tabInfo[tab] = null
		catch e
			console.log("#{e}")

	setSize: =>
		#Set display of options, before setting size!
		$(".chatOpt").toggle(@showOpt)

		tabHeight = $("#tab-head").height();
		inputHeight = $("#bottom-wrapper").height();
		totalHeight = $("#outer-wrapper").height();
		#infoHeight = $(".tabInfo").height()
		$("#tab-wrapper" ).height(totalHeight - inputHeight);
		$("#tabs" ).height(totalHeight - inputHeight);
		$(".chatTab" ).each( ()->  
			infoHeight = $(this).children('.chatInfo').height() 
			if $(this).children('.chatOpt').css('display') is 'none'
				optHeight =  0
			else
				optHeight =  $(this).children('.chatOpt').height()
			#console.log("Opt height is #{optHeight}")
			#$(this).children('.ChatWindow').children('.infoPadder').height(infoHeight*1.0+3)
			#if infoHeight>0
				#console.log("infoHeight is #{infoHeight}")
				#console.log("top should now be " + tabHeight)
			$(this).height(  (totalHeight-tabHeight - inputHeight) ) 
			#$(this).children('.chatInfo').css('top', tabHeight*1.0 +3.0)
			$(this).children('.ChatWindow').height(totalHeight-tabHeight - inputHeight-infoHeight - optHeight)
			
		)

	
	onSelect: (event, ui)=>
		@getTabHeader( @openTabs[ui.index]  ).css("font-style", 'normal').removeClass('important')
		@setSize()


	@setPlayerStatus: (data)=>
		alert(data.status)

	start: ()=>
		
		try
			console.log("__ I AM STARTING CHAT __")
			#FIX
			porter.emit("chatDisplayReady")
			return
			tabOptions = {
				select: @onSelect
				show: @setSize
				tabTemplate:'''
								<li>
									<a href='#{href}'>#{label}</a> 
									<span class='ui-icon ui-icon-close'>Remove Tab</span>
									<span class='ui-icon ui-icon-comment'>Message!</span>
								</li>
							'''
			}
			$("#tabs").tabs(tabOptions);

			@$tabs= $("#tabs").tabs()
			@$log=$("<div class='log'></div>")
			
			$(window).resize( @setSize)
			@setSize()


			# Bind the up/down keys only when the textbox has focus.  
			# but the (opt) left right keys should occur anytime the frame is in focus
			$("#chatBox")
				.keyup( 
					(e)=>
						if e.keyCode is 13 then @sendChatMessage() 
						## up/down are 38/40
						if e.keyCode is 38 and e.shiftKey is true then @historyUp()
						if e.keyCode is 40 and e.shiftKey is true then @historyDown()

				)
			$("body").keyup(
				(e)=>				
					if e.keyCode is 37 and e.ctrlKey is true then @tabLeft()
					if e.keyCode is 39 and e.ctrlKey is true then @tabRight()
					## left/right are 37/39		
			)
			cd = this
			closeThisTab = ($target)->
				$tabs = $("#tabs")
				index = $( "li", $tabs ).index( $target );
				cd.removeTabByIndex(index)

			$("#tab-head li").live( 'dblclick', ()->closeThisTab( $(this)))
		
			$( "#tab-head span.ui-icon-close").live('click', ()->closeThisTab($(this).parent() ))

			$("span.ui-icon-gear").live('click', 
				()=>					 
					@showOpt = not @showOpt
					@setSize()
			)

			# Remove system message on clicking the X
			$(".system span.ui-icon-close").live('click', ()-> $( this ).parent().remove() )
			
			#We're done, so let main thread know that!  Then wait for response to go go go.
			porter.emit("chatDisplayReady")
			#Set responses to various messages
			porter.on("chatDisplayInitData", @init)
			porter.on("setPrefs", @setPrefs)
			porter.on("newChatMessage", @displayMsg )
			porter.on("setPlayerHeader", @setPlayerHeader)
			porter.on("setPlayerStatus", @setPlayerStatus)

			

			console.log("DONE START")
		catch e
			console.log("Error starting: #{e}")
	
	init: (payload) =>	
		
		@openChannel=payload.openChannel
		@addTab(@openChannel)



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

	# Actions to be taken on the change of a pref
	onPrefChange: (p) =>
		switch p
			when 'timestampsOn'
				@refreshTimeStamps()

displayer = new ChatDisplay()
porter = new Port()



displayer.start()








