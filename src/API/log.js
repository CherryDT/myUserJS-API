// +@display_name  Log
// +@history (0.0.9) History begins.
// +@history (0.0.13) Fixed output to the Web Console using GM_log.
// +@history (0.0.14) Removed "Debug" from list of functions mapped to jMod.
// +@history (0.0.14) Minor fixes / improvements.
// +@history (0.0.15) Removed ref to jMod.fn (__proto__ is depreciated).
// +@history (0.0.16) Consolidated similar functions.
// +@history (0.0.16) Added dir and dirxml functions.
// +@history (0.0.17) Updated format builder to include integer types.
// +@history (0.0.17) Updated format builder to handle arguments without a type as an object without including it in the format string.
// +@history (0.0.17) Added a jMod specific Warning and Info logger.
// +@history (0.0.18) Minor improvements to "ScopedConsoleCommand"
// +@history (0.0.18) Minor improvements to "logFormatBuilder"
// +@history (0.0.18) Major update/fixes to "jModError"
// +@history (0.0.20) Error cloning now works so "ScopedConsoleCommand" is obsolete.


/**
 * A logging interface that allows safe console interactions. It can handle permission/scope problems and multiple console instances.<br /><br />
 * <b>Multiple consoles</b> - Userscripts executing before the DOM exists (@run-at document-start) can cause some problems with the console.
 * Sometimes firebug is unavailable at document-start and console commands are only run by the Web Console. But once firebug initiates,
 * it can be greedy and the Web Console no longer runs your console commands. So you wind up with two windows, each with half the information.<br /><br />
 * This logging interface fixes these issue by isolating the individual console instances, and making sure the maximum amount of information
 * is sent to each of them<br /><br />
 * It also features varying <b>Verbosity Levels</b> and specific functions can be enabled / disabled.
 * @namespace log
 * @memberof jMod.API
 */

var LogFormatCSS = new (function(){
	var _this = this,
		SansationFontFamily = 'font-family:"Sansation","Open Sans",Arial;',
		jModHeaderFontStyle = 'font-size:175%;font-weight:300;' + SansationFontFamily,
		stripedBackground = 'repeating-linear-gradient(-45deg, red, red 5px, transparent 5px, transparent 10px);background-size:auto 75% 100%, 0px 0px;'
	
	_this.time = 'font-weight:bold;font-size:120%;color:red;';
	
	_this.stchange = 'font-weight:bold;font-size:130%;color:blue;';
	
	//_this.iconStyle = 'font-size:175%;background-image:url("http://myuserjs.org/img/favicon/favicon.png");background-size:auto 75%;background-repeat: no-repeat;background-position:left center;';
	_this.iconStyle = ''
		//+'font-size:175%;'
		+'font-size:1.75em;'
		+'background-color: transparent;'
		+'background-image:url("http://myuserjs.org/img/favicon/favicon.png");'
		//+'background-origin: border-box;'
		+'background-clip: border-box;'
		+'background-position:left center;'
		+'background-size:auto 75%;'
		//+'background-size:auto 0.75em;'
		+'background-repeat: no-repeat;'
		+'letter-spacing: 20px;'
		+'white-space: pre;'
		//+'background-size: contain;'
		+'display: run-in;';
		
	
	_this.logDefaultStyle = 'display: run-in;';
	_this.logHeaderStyle = jModHeaderFontStyle;
	_this.logTitleStyle = 'color:#000;font-size:125%;';
	_this.logTextStyle = 'font-weight:bold;font-size:120%;color:#000;';
	
	_this.infoDefaultStyle = 'display: run-in;';
	_this.infoHeaderStyle = jModHeaderFontStyle;
	_this.infoTitleStyle = 'color:#000;font-size:125%;';
	_this.infoTextStyle = 'font-weight:bold;font-size:120%;color:blue;';
	
	_this.warningDefaultStyle = 'display: run-in;';
	_this.warningHeaderStyle = jModHeaderFontStyle;
	_this.warningTitleStyle = 'color:#000;font-size:125%;';
	_this.warningTextStyle = 'font-weight:bold;font-size:120%;color:red;';
	
	_this.errorDefaultStyle = 'display: run-in;';
	_this.errorHeaderStyle = jModHeaderFontStyle + 'color:red;';
	_this.errorTitleStyle = 'color:#000;font-size:125%;';
	_this.errorLineStyle = 'color:blue;';
})();
 
+function(){
	var i;
	var OUTPUT_TYPES = {
		'ERROR':     {level: 1,	value: 'error'     },
		'EXCEPTION': {level: 1,	value: 'exception' },
		'WARNING':   {level: 2,	value: 'warn'      },
		'INFO':      {level: 3,	value: 'info'      },
		'LOG':       {level: 4,	value: 'log'       },
		'DEBUG':     {level: 5,	value: 'debug'     }
	}
	
	var msgList = [
		['Error', 'ERROR'],
		['logError', 'ERROR'],
		['Exception', 'EXCEPTION'],
		['Warning', 'WARNING'],
		['Info', 'INFO'],
		['Log', 'LOG'],
		['Debug', 'DEBUG'],
	];
	
	var fnList = [
		'assert',
		'clear',
		'count',
		'dir',
		'dirxml',
		'group',
		'groupCollapsed',
		'groupEnd',
		'profile',
		'profileEnd',
		'table',
		'time',
		'timeEnd',
		'timeStamp',
		'trace',
	];
	
	var exportFunctions = [
		'Debug',
		'Log',
		'Info',
		'Warning',
		'logError',
		'Exception'
	];

	function isFirebug(ptr){
		if(_undefined!==typeof ptr && _undefined!== typeof ptr.timeStamp) return true;
		return false;
	}

	function isWebConsole(ptr){
		if(RealTypeOf(ptr) == "console") return true;
		if(_undefined!==typeof ptr&&!isFirebug(ptr)&&_undefined===typeof ptr.dirxml&&_undefined!==typeof ptr.trace) return true;
		return false;
	}

	function isConsole2(ptr){
		if(_undefined!==typeof ptr&&!isFirebug(ptr)&&!isWebConsole(ptr)&&_undefined===typeof ptr.dirxml&&_undefined===typeof ptr.exception) return true;
		return false;
	}
	
	function checkConsole(fn){
		if(fn(window.console)) return window.console;
		if(fn(console)) return console;
		if(fn(this.console)) return this.console;
		if(fn(unsafeWindow.console)) return unsafeWindow.console;
		if(fn(unsafeWindow.window.console)) return unsafeWindow.window.console;
		
		if(EXISTS(Console) && fn(Console)) return Console;
		if(fn(this.Console)) return this.Console;
		if(fn(window.Console)) return window.Console;
		if(fn(unsafeWindow.Console)) return unsafeWindow.Console;
		if(fn(unsafeWindow.window.Console)) return unsafeWindow.window.Console;
		
		return undefined;
	}

	function getFB(){
		return checkConsole(isFirebug);
	}

	function getC2(){
		return checkConsole(isConsole2);
	}

	function getWC(){
		return checkConsole(isWebConsole);
	}
	
	function functionEnabled(name){
		return ((jConfig('API.log.disabled').indexOf(name) == -1) && jConfig('API.log.verbosity_level') > 1);
	}
	
	jMod.isFormatted = function(command, value){
		return (['debug','log','info','warn','error','exception'].indexOf(command)!=-1&&"string"==typeof value&&/(?:\%s|\%c|\%o|\%d|\%f|\%\.\df|\%i)/.test(value)); // Don't use GM_log on formatted logs
	}
	
	jMod.log = API.log = {
		'OUTPUT_TYPES': OUTPUT_TYPES,
		fb: undefined,
		c2: undefined,
		wc: undefined,
		
		fnList: ([].concat(exportFunctions, fnList)),

		updateFB: function(new_ptr){
			if(isFirebug(new_ptr)) {
				if(jConfig('API.log.debug'))
					console.info('jMod.API.log - Firebug Object: ', new_ptr);
				this.fb = new_ptr;
			}
		},
		
		updateC2: function(new_ptr){
			if(isConsole2(new_ptr)) {
				if(jConfig('API.log.debug'))
					console.info('jMod.API.log - Console2 Object: ', new_ptr);
				this.c2 = new_ptr;
			}
		},
		
		updateWC: function(new_ptr){
			if(isWebConsole(new_ptr)) {
				if(jConfig('API.log.debug'))
					console.info('jMod.API.log - Web Console Object: ', new_ptr);
				this.wc = new_ptr;
			}
		},
		
		UpdateAll: function(){
			this.updateFB(getFB());
			this.updateC2(getC2());
			this.updateWC(getWC());
		},
		
		/*
		// For commands you can't call .apply on (like when an error object is involved)
		ScopedConsoleCommand: function(command, value){
			var i = 0, ptr, cmd, args = arguments,
				order = ['WebConsole', 'Firebug'],
				objs = {Firebug: this.fb, WebConsole: this.wc};
			//isFormatted = jMod.isFormatted(command, value); // Don't use GM_log on formatted logs
			if(['profile', 'profileEnd', 'error'].indexOf(command) != -1 || !jConfig.API.log.WebConsole)
				order = ['Firebug', 'WebConsole'];
			
			for( ; i < order.length; i++){
				ptr = objs[order[i]];
				cmd = ptr[command];
				if(NOTEXISTS(ptr)||NOTEXISTS(cmd))
					continue;
				try{
				if(ptr === this.fb){
					console.log('is fb');
					if(!ptr._apply){
						var _apply = function(command, arg){
							if(this && this.log && this[command]){
								try{
									this[command].apply(this, arg);
								}catch(ex){
									console.log('fb _apply err', ex);
								}
							} else {
								console.log("no this", this, command);
							}
						};
						if(unsafeWindow !== window){
							this.fb._apply = mExportFunction(_apply.bind(this.fb), unsafeWindow, {
								//defineAs: "_apply",
								allowCallbacks: true,
								allowCrossOriginArguments: true
							});
						} else {
							this.fb._apply = _apply.bind(this.fb);
						}
					}
					var tmp, tmp2;
					try{
						tmp = Slice.call(arguments, 1);
					}catch(te){
						console.log('tmp error', te);
						tmp = arguments;
					}
					try{
						tmp2 = mCloneInto(tmp, unsafeWindow, {cloneFunctions: true, wrapReflectors: true}, true);
					}catch(te){
						console.log('tmp2 error', te);
						tmp2 = tmp;
					}
					
					try{
						//return this.fb._apply.call(this.fb, command, mCloneInto(tmp, unsafeWindow, {cloneFunctions: true, wrapReflectors: true}));
						console.log("_apply input", RealTypeOf(tmp2), tmp2);
						return this.fb._apply.call(this.fb, command, tmp2);
					}catch(te){
						console.log('_apply error', te);
					}
				}
				
				
					//cmd.apply(ptr, arguments);
					switch(args.length){
						case 1:  return cmd.call(ptr);
						case 2:  return cmd.call(ptr, args[1]);
						case 3:  return cmd.call(ptr, args[1], args[2]);
						case 4:  return cmd.call(ptr, args[1], args[2], args[3]);
						case 5:  return cmd.call(ptr, args[1], args[2], args[3], args[4]);
						case 6:  return cmd.call(ptr, args[1], args[2], args[3], args[4], args[5]);
						case 7:  return cmd.call(ptr, args[1], args[2], args[3], args[4], args[5], args[6]);
						case 8:  return cmd.call(ptr, args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
						case 9:  return cmd.call(ptr, args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
						case 10: return cmd.call(ptr, args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
						case 11: return cmd.call(ptr, args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10]);
						case 12: return cmd.call(ptr, args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11]);
						case 13: return cmd.call(ptr, args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12]);
						case 14: return cmd.call(ptr, args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13]);
						case 15: return cmd.call(ptr, args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13], args[14]);
						case 16: return cmd.call(ptr, args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13], args[14], args[15]);
						case 17: return cmd.call(ptr, args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13], args[14], args[15], args[16]);
						case 18: return cmd.call(ptr, args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13], args[14], args[15], args[16], args[17]);
						default: return false;
					}
					return true;
				}catch(e){
					console.log('log error', e);
				}
			}
			return false;
		},
		*/
		ConsoleCommand: function(command, value){
			try{
				var i = 0, key, order = ['WebConsole', 'Firebug'],
					args = Slice.call(arguments, 1),
					objs = {Firebug: this.fb, WebConsole: this.wc};
					//isFormatted = jMod.isFormatted(command, value); // Don't use GM_log on formatted logs
					
				var safeArgs = mCloneInto(args, unsafeWindow, {
					cloneFunctions: true,
					wrapReflectors: true
				});
				//if(isFormatted || ['profile', 'profileEnd'].indexOf(command) != -1 || !jConfig.API.log.WebConsole)
				if(['profile', 'profileEnd', 'error'].indexOf(command) != -1 || !jConfig.API.log.WebConsole)
					order = ['Firebug', 'WebConsole'];
				
				for( ; i < order.length; i++){
					key = order[i];
					if(objs[key] != null && typeof objs[key][command] !== _undefined && jConfig.API.log[key]){
						try {
							return objs[key][command].apply(objs[key], args);
						} catch(e){}
						try {
							return objs[key][command].apply(objs[key], safeArgs);
						} catch(e){}
					}
				}
				// disabled for now
				/*
					if(typeof this.c2 !== _undefined && typeof this.c2[command] !== _undefined)
						this.c2[command].apply(this.c2, safeArgs);
						//this.WebConsole_ptr[command].apply(this.WebConsole_ptr, safeArgs);
					if(typeof GM_log !== _undefined && jConfig('API.log.GM_log') && ['debug', 'log', 'info', 'warning', 'error', 'exception'].indexOf(command.toLowerCase()) != -1){
						// Cannot use function.apply on GM_log
						// Greasemonkey can only handle one argument
						if(args.length == 0) GM_log('');
						else if(args.length == 1) GM_log(args[0]);
						else GM_log(JSON.stringify(args));
					}
					
				}
				*/
			}catch(e){
				//console.log('ConsoleCommand Error! getUpdateData: ', e.name, e.fileName, e.lineNumber + ':' + e.columnNumber, e);
				console.error(e);
			}
			return false;
		},
		
		outputMessage: function(output_type, str){
			if(output_type.level <= jConfig('API.log.verbosity_level'))
				this.ConsoleCommand.apply(this, [output_type.value].concat(Slice.call(arguments, 1)));
		},
		
		fmt: LogFormatCSS
	};
	
	for(i = 0; i < msgList.length; i++){
		API.log[msgList[i][0]] = (function(oType){
			return (function(){return this.outputMessage.apply(this, [OUTPUT_TYPES[oType]].concat(Slice.call(arguments)));}).bind(API.log);
		})(msgList[i][1]);
	}
	
	for(i = 0; i < fnList.length; i++){
		API.log[fnList[i]] = (function(fName){
			return (function(){if(functionEnabled(fName))return this.ConsoleCommand.apply(this, [fName].concat(Slice.call(arguments)));}).bind(API.log);
		})(fnList[i]);
	}
	
	for(i = 0; i < exportFunctions.length; i++)
		jMod[exportFunctions[i]] = (jMod.log[exportFunctions[i]]).bind(API.log);
	
	
	API.logFormatBuilder = function(){
		this.args = [];
		
		var addLine = function(value, type, style){
			var isUndef = _undefined===typeof value,
				origType = typeof type;
			if(typeof type === _undefined) type = typeof value;
			var fmtType;
			switch(type){
				case "d":
				case "%d":
					fmtType = "%d";
					break;
				case "i":
				case "%i":
					fmtType = "%i";
					break;
				case "f":
				case "%f":
					fmtType = "%.2f";
					break;
				case "number":
					if(parseInt(value) === value && value === +value){
						fmtType = "%d";
						value = parseInt(value);
					} else {
						fmtType = "%.2f";
						value = parseFloat(value);
					}
					break;
				case "s":
				case "%s":
					if(value == "\n" || value == " \n"){
						fmtType = " \n";
						value = undefined;
						style = undefined;
						isUndef = false;
					} else
						fmtType = "%s";
					break;
				case "string":
					fmtType = value;
					value = undefined;
					isUndef = false;
					break;
				case "o":
				case "%o":
					fmtType = "%o";
					break;
				case "object":
				default:
					if(origType==_undefined && _undefined==typeof style)
						fmtType = "";
					else
						fmtType = "%o";
					break;
			}
			
			this.args.push({
				valueIsUndefined: isUndef,
				value: value,
				fmtString: fmtType,
				style: style
			});
		}
		
		this.add = function(){
			var i = 0, var0 = arguments[0];
			if(arguments.length == 1 && RealTypeOf(var0) == "array"){
				for( ; i < var0.length; i++){
					addLine.apply(this, var0[i]);
				}
			} else {
				addLine.apply(this, Slice.call(arguments));
			}
		}
		
		this.build = function(){
			var fmtString = '';
			
			var arr = [];
			
			for(var i = 0; i < this.args.length; i++){
				fmtString += (typeof this.args[i].style !== "undefined" ? '%c' : '') + this.args[i].fmtString;
				if(typeof this.args[i].style !== "undefined")
					arr.push(this.args[i].style != "" ? this.args[i].style : " ");
					
				if(typeof this.args[i].value !== "undefined" || this.args[i].valueIsUndefined)
					arr.push(this.args[i].value);
			}
			
			return [fmtString].concat(arr);
		}
		
		if(arguments.length > 0)
			this.add.apply(this, arguments);
	};
		
	jMod.log.UpdateAll();
		
}();



var jModLogError = function(){
	var i = 3,
		e = arguments[0],
		title = arguments[1],
		message;
	try{
		message = arguments[2]
	}catch(x){};
	
	//if(!(e && (e.message && e.lineNumber))){
	if(!(e && e instanceof Error)){
		message = title;
		title = e;
		e = undefined;
		i = 2;
	}
	
	var errorDefaultStyle = LogFormatCSS.errorDefaultStyle;
	
	var fmtBuild = new API.logFormatBuilder([
		['  ', "%s", errorDefaultStyle + LogFormatCSS.iconStyle],
		['jMod', "string", errorDefaultStyle + LogFormatCSS.errorHeaderStyle],
		
		[' - ', "string", errorDefaultStyle],
		[title || ' ', "%s", errorDefaultStyle + LogFormatCSS.errorTitleStyle],
		[" \n", "string"],
		[message || '', "%s", errorDefaultStyle + 'color:red;']
	]);
	
	for(; i < arguments.length; i++){
		fmtBuild.add([
			[" \n", "string"],
			[arguments[i], typeof arguments[i] == "string" ? "string" : "object", "color:red;"]
		]);
	}
	
	if(typeof e != _undefined && e != null){
		fmtBuild.add([
			[" \n", "string"],
			[e.message + " ", "%s", errorDefaultStyle + "color:red;"],
			[e.lineNumber, "%s", errorDefaultStyle + LogFormatCSS.errorLineStyle + "color:red;"],
			[" \n", "string", " "],
			[e && e.err ? e.err : e, "%0", "color:red;"]
		]);
	}
	
	//var arr = fmtBuild.build();
	//arr.unshift('error');
	try{
		//jMod.log.ScopedConsoleCommand.apply(jMod.log, arr); // This works
		//jMod.log.ConsoleCommand.apply(jMod.log, arr); // This will not work!
		jMod.logError.apply(jMod.log, fmtBuild.build());
	} catch(e){}
}

var jModLogWarning = function(title, text){
	if(jMod.log.OUTPUT_TYPES.WARNING.level > jConfig('API.log.verbosity_level'))
		return;
		
	var i = 2,
		warningDefaultStyle = LogFormatCSS.warningDefaultStyle,
		fmtBuild = new API.logFormatBuilder([
			['  ', "%s", warningDefaultStyle + LogFormatCSS.iconStyle],
			['jMod Warning', "string", warningDefaultStyle + LogFormatCSS.warningHeaderStyle]
		]);
		
	if(_undefined!==typeof text){
		fmtBuild.add([
			[' - ', "string", warningDefaultStyle],
			[title || ' ', "%s", warningDefaultStyle + LogFormatCSS.warningTitleStyle],
			[" \n", "string"],
			[text || '', "%s", warningDefaultStyle + LogFormatCSS.warningTextStyle]
		]);
	} else {
		fmtBuild.add([
			[" \n", "string"],
			[title || '', "%s", warningDefaultStyle + LogFormatCSS.warningTextStyle]
		]);
	}
	
	if(arguments.length > 2)
		fmtBuild.add(" \n", "string");
		
	for(i; i < arguments.length; i++){
		fmtBuild.add(arguments[i]);
	}
	
	jMod.Warning.apply(jMod.log,fmtBuild.build());
}

var jModLogInfo = function(title, text){
	if(jMod.log.OUTPUT_TYPES.INFO.level > jConfig('API.log.verbosity_level'))
		return;
		
	var i = 2,
		infoDefaultStyle = LogFormatCSS.infoDefaultStyle,
		fmtBuild = new API.logFormatBuilder([
			['  ', "%s", infoDefaultStyle + LogFormatCSS.iconStyle],
			['jMod', "string", infoDefaultStyle + LogFormatCSS.infoHeaderStyle]
		]);
		
	if(_undefined!==typeof text){
		fmtBuild.add([
			[' - ', "string", infoDefaultStyle],
			[title || ' ', "%s", infoDefaultStyle + LogFormatCSS.infoTitleStyle],
			[" \n", "string"],
			[text || '', "%s", infoDefaultStyle + LogFormatCSS.infoTextStyle]
		]);
	} else {
		fmtBuild.add([
			[" \n", "string"],
			[title || '', "%s", infoDefaultStyle + LogFormatCSS.infoTextStyle]
		]);
	}
	
	if(arguments.length > 2)
		fmtBuild.add(" \n", "string");
		
	for(i; i < arguments.length; i++){
		fmtBuild.add(arguments[i]);
	}
	
	jMod.Info.apply(jMod.log,fmtBuild.build());
}

var jModLog = function(title, text){
	if(jMod.log.OUTPUT_TYPES.LOG.level > jConfig('API.log.verbosity_level'))
		return;
		
	var i = 2,
		logDefaultStyle = LogFormatCSS.infoDefaultStyle,
		fmtBuild = new API.logFormatBuilder([
			['  ', "%s", logDefaultStyle + LogFormatCSS.iconStyle],
			['jMod', "string", logDefaultStyle + LogFormatCSS.logHeaderStyle]
		]);
		
	if(_undefined!==typeof text){
		fmtBuild.add([
			[' - ', "string", logDefaultStyle],
			[title || ' ', "%s", logDefaultStyle + LogFormatCSS.logTitleStyle],
			[" \n", "string"],
			[text || '', "%s", logDefaultStyle + LogFormatCSS.logTextStyle]
		]);
	} else {
		fmtBuild.add([
			[" \n", "string"],
			[title || '', "%s", logDefaultStyle + LogFormatCSS.logTextStyle]
		]);
	}
	
	if(arguments.length > 2)
		fmtBuild.add(" \n", "string");
		
	for(i; i < arguments.length; i++){
		fmtBuild.add(arguments[i]);
	}
	
	jMod.Log.apply(jMod.log,fmtBuild.build());
}

var jModLogTime = function(title, prefix, suffix){
	if(jMod.log.OUTPUT_TYPES.INFO.level > jConfig('API.log.verbosity_level'))
		return;
	var text = (prefix || '') +  jMod.timeElapsed.toFixed(2) + 'ms' + (suffix || '');
	
	var infoDefaultStyle = LogFormatCSS.infoDefaultStyle;
	
	var fmtBuild = new API.logFormatBuilder([
		['  ', "%s", infoDefaultStyle + LogFormatCSS.iconStyle],
		['jMod', "string", infoDefaultStyle + LogFormatCSS.infoHeaderStyle],
		[' - ', "string", infoDefaultStyle],
		[title || ' ', "%s", infoDefaultStyle + LogFormatCSS.infoTitleStyle],
		[' ', "string"],
		[text, "%s", infoDefaultStyle + LogFormatCSS.time]
	]);
	
	jMod.Info.apply(jMod.log,fmtBuild.build());
}
