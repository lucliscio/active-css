const _ajaxCallbackErr = (str, resp, o) => {
	o.error = true;
	o.errorCode = resp || '';

	// Wipe any existing action commands after await, if await was used.
	_syncEmpty(o._subEvCo);

	// Handle error code event.
	let generalEvent = 'afterAjax' + ((o.preGet) ? 'PreGet' : '') + ((o.formSubmit) ? 'Form' + (o.formPreview ? 'Preview' : o.formSubmit ? 'Submit' : '') : '');
	let commonObj = { obj: o.obj, evType: generalEvent + o.errorCode, eve: o.e, otherObj: o, varScope: o.varScope, evScope: o.evScope, compDoc: o.compDoc, component: o.component, _maEvCo: o._maEvCo };
	if (o.errorCode) _handleEvents(commonObj);
	commonObj.evType = generalEvent + 'Error';

	// Handle general error event.
	_handleEvents(commonObj);
	if (!o.preGet) {
		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
			_debugOutput('Ajax callback error debug: failed with error "' + resp + '".');
		}
	} else {
		delete preGetting[o.finalURL];
		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
			_debugOutput('Ajax-pre-get callback error debug: failed with error "' + resp + '".');
		}
	}
};
