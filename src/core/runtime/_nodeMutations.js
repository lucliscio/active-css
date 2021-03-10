// This has been set up to only run when Active CSS setup has fully loaded and completed.
ActiveCSS._nodeMutations = function(mutations) {
	mutations.forEach(mutation => {
		if (mutation.type == 'childList') {
			if (mutation.removedNodes) {
				mutation.removedNodes.forEach(nod => {
					if (!(nod instanceof HTMLElement)) return;
					// We only get the top-level removed node, so we have to do some searching for childnodes and clean-up.
					idMap.splice(idMap.indexOf(nod), 1);
					varInStyleMap.splice(varInStyleMap.indexOf(nod._acssActiveID), 1);

					// Handle the removal of inline Active CSS styles from the config. This works with DevTools and also when navigating via SPA tools.
					if (_isACSSStyleTag(nod)) {
						_regenConfig(nod, 'remove');
					} else {
						nod.querySelectorAll('style[type="text/acss"]').forEach(function (obj, index) {
							_regenConfig(obj, 'remove');
						});
					}

// Note to self: when onto the clean-up issue, all the nodes in the childlist need iterating...

//					if (typeof clickOutsideSels[activeID] !== 'undefined') {
//						console.log('ActiveCSS._nodeMutations, removing clickoutside ref');
//						delete clickOutsideSels[activeID];
//					}

				});
			}

			if (mutation.addedNodes) {
				mutation.addedNodes.forEach(nod => {
					if (!(nod instanceof HTMLElement)) return;

					// Handle the addition of inline Active CSS styles into the config via DevTools. Config is already loaded if called via ajax.
					if (_isACSSStyleTag(nod) && !nod._acssActiveID && !_isInlineLoaded(nod)) {
						_regenConfig(nod, 'addDevTools');
					} else {
						nod.querySelectorAll('style[type="text/acss"]').forEach(function (obj, index) {
							if (!nod._acssActiveID && !_isInlineLoaded(nod)) _regenConfig(obj, 'addDevTools');
						});
					}
				});
			}
		} else if (mutation.type == 'characterData') {
			// Detect change to inline Active CSS. The handling is just to copy the insides of the tag and replace it with a new one.
			// This will be sufficient to set off the processes to sort out the config.
			let el = mutation.target;
			if (el.nodeType == Node.TEXT_NODE && _isACSSStyleTag(el.parentElement)) {
				// We need to run this at the end of the call stack, otherwise we could clash with other stuff going on.
				setTimeout(function() {
					// This is an inline Active CSS tag. Replace it so it triggers off the config changes.
					let parEl = el.parentElement;
					let newTag = '<style type="text/acss">' + parEl.innerText + '</style>';
					// Remove from the config first. If we remove the element after we've changed the content we get the scenario of the removal happening
					// after the addition and it buggers things up. So just do a manual removal.
					_regenConfig(parEl, 'remove');
					// Now we can safely add it.
					parEl.insertAdjacentHTML('beforebegin', newTag);	// Can't do a straight replace with a real node because of br tags being inserted.
					// Now change the type of the element so it doesn't get picked up in mutations.
					parEl.type = 'text/dummy';
					// Now it's safe to remove - it's not going to trigger a delete mutation.
					parEl.remove();
				}, 0);
			}
		}
	});
};
