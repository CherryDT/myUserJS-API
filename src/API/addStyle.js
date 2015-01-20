// +@display_name  Add Style
// +@history (0.0.9) History begins.
// +@history (0.0.13) Added GM_addStyle if it exists.

/**
 * Adds given css to the the page.
 * @function addStyle
 * @memberof jMod.API
 * @param {string} css The CSS to be added to the document.
 * @returns {Object} node The newly created style node
 */
var addStyle = jMod.API.addStyle = function(css){
	if(css && css != ''){
		if(typeof GM_addStyle !== _undefined)
			return GM_addStyle(css) || true;
			
		var style,
			win = (window || unsafeWindow),
			heads = win.document.getElementsByTagName('head');
		if(heads) {
			style = win.document.createElement('style');
			try {
				style.innerHTML = css;
			} catch (x) {
				style.innerText = css;
			}
			style.type = 'text/css';
			return heads[0].appendChild(style);
		} else {
			if(jMod.debug)
				jModLogWarning('jMod.API.addStyle', 'Could not add css', css);
		}
	}
}

jMod.API.addStylesheet = function(url){
	var style,
		win = (window || unsafeWindow),
		heads = win.document.getElementsByTagName('head');
	
	if(heads){
		style = win.document.createElement('link');
		style.setAttribute('rel', 'stylesheet');
		style.href = url;
		return heads[0].appendChild(style);
	} else {
		if(jMod.debug)
			jModLogWarning('jMod.API.addStylesheet', 'Could not add stylesheet', url);
	}
}

jMod.API.importStylesheet = function(url){
	jMod.CSS = "@import url("+url+");\n";
}
