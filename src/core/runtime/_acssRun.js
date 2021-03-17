const _run = (str, varScope, o) => {
	let inn;
	let funky = '"use strict";' + str.replace(/\{\=([\s\S]*?)\=\}/m, function(_, wot) {
		inn = _handleVarsInJS(wot, varScope);
		return inn;
	});

	try {
		return Function('scopedProxy, o', funky)(scopedProxy, o);		// jshint ignore:line
	} catch (err) {
		console.log('Function syntax error (' + err + '): ' + funky);
	}
};
