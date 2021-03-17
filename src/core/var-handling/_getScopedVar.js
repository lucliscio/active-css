const _getScopedVar = (nam, scope) => {
	// Accepts any variable type, scoped or not. Returns an object containing full scope name (fullName), name (name) and value (val).
	// If variable is already scoped, it assumes that inheritance has already been sorted out.
	let fullName, scopeName, val, pathName, scopingDone, winVar = false;

	let fullyScoped = (nam.startsWith('window.') || nam.startsWith('scopedProxy.'));

	if (scope == '___none' && !fullyScoped) {
		fullName = 'scopedProxy.' + nam;
		scopeName = nam;
		val = _get(scopedProxy.__getTarget, scopeName);
	} else if (fullyScoped) {
		fullName = nam;
		scopeName = nam.substr(nam.indexOf('.') + 1);
		scopeName = _resolveInnerBracketVars(scopeName, scope);
		if (fullName.substr(0, 1) == 'w') {
			val = _get(window, scopeName);
			winVar = true;
		} else {
			val = _get(scopedProxy.__getTarget, scopeName);
		}
	} else {
		// Handle variables without a scope.
		scopeName = _resolveInnerBracketVars(nam, scope);
		scopeName = ((scope && privVarScopes[scope]) ? scope : 'main') + '.' + scopeName;
		let scopedObj = _resolveInheritance(scopeName);
		scopeName = scopedObj.name;
		fullName = 'scopedProxy.' + scopeName;
		val = scopedObj.val;
	}

	return { fullName, name: scopeName, val, winVar };
};