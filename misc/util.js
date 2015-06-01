(function () {
	'use strict';
	var templates = [];
	var model = {};
	var _animationEndEvents = 'webkitAnimationEnd mozAnimationEnd msAnimationEnd oAnimationEnd animationend',
		_animationStartEvents = 'webkitAnimationStart mozAnimationStart msAnimationStart oAnimationStart animationstart';

	function _getTemplate(tmpl) {
		var t = document.getElementById(tmpl);
		if (!t) return null;
		var clone = document.importNode(t.content, true);
		return clone;
	}

	function _removeNode(element) {
		if (!element || !element.parentNode) return;
		element.parentNode.removeChild(element);
		return undefined;
	}

	function _detectCSSFeature(featurename) {
		var feature = false,
			domPrefixes = 'Webkit Moz ms O'.split(' '),
			el = document.createElement('div'),
			featurenameCapital = null;

		featurename = featurename.toLowerCase();
		if (el.style[featurename] !== undefined) feature = true;
		if (feature === false) {
			featurenameCapital = featurename.charAt(0).toUpperCase() + featurename.substr(1);
			for (var i = 0; i < domPrefixes.length; i++) {
				if (el.style[domPrefixes[i] + featurenameCapital] !== undefined) {
					feature = true;
					break;
				}
			}
		}
		return feature;
	}

	function _each(o, func) {
		if (!o || (o.length === 0 && o != window)) return;
		if (!o.length) func(o);
		else Array.prototype.forEach.call(o, function (el, i) {
			func(el);
		});
	}

	function _one(el, events, func, useCapture) {
		_on(el, events, function (ev) {
			func(ev);
			_off(el, events, func);
		}, useCapture);
	}

	function _on(els, events, func, useCapture) {
		_each(els, function (el) {
			var ev = events.split(' ');
			for (var e in ev) el.addEventListener(ev[e], func, useCapture);
		});
	}

	function _off(els, events, func) {
		_each(els, function (el) {
			var ev = events.split(' ');
			for (var e in ev) el.removeEventListener(ev[e], func);
		});
	}

	function _addClass(els, cls) {
		_each(els, function (el) {
			if (el.classList) {
				var arr = cls.split(' ');
				for (var i in arr) el.classList.add(arr[i]);
			} else el.className += ' ' + cls;
		});
	}

	function _removeClass(els, cls) {
		_each(els, function (el) {
			if (el.classList) {
				var arr = cls.split(' ');
				for (var i in arr) el.classList.remove(arr[i]);
			} else el.className = el.className.replace(new RegExp('(^|\\b)' + cls.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		});
	}

	function _animateCSS(el, cls, start, end) {
		if (start) _one(el, _animationStartEvents, start);
		_one(el, _animationEndEvents, function (ev) {
			_removeClass(el, cls);
			if (end) end(ev);
		});
		_addClass(el, cls);
	}

	function _isObject(obj) {
		return obj === Object(obj);
	}

	function _get(obj, callback) {
		obj.pretty = true;
		if (obj && !(obj.module == 'user' && obj.method == 'login') && !_readLocal('apikey')) window.location = 'index.html';
		var url = _createUrl(obj);
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.onload = function () {
			if (request.status >= 200 && request.status < 400) {
				var data = JSON.parse(request.responseText);
				if (data.error) {
					console.log(data.error);
				}
				if (callback) {
					callback(data.result, data.error);
				}
			}
		};
		request.onerror = function () {
			console.log('connection error');
		};
		request.send();
	}

	function _createUrl(obj) {
		var apikey = _readLocal('apikey');
		if (apikey) obj.apikey = apikey;
		for (var i in obj) {
			if (_isObject(obj[i])) {
				obj[i] = encodeURIComponent(JSON.stringify(obj[i]));
			} else {
				obj[i] = encodeURIComponent(obj[i]);
			}
		}
		var url = '/api?';
		if (obj) {
			for (var key in obj) {
				url += key + '=' + obj[key] + '&';
			}
			url = url.slice(0, url.length - 1);
		}
		return url;
	}

	model.getTemplate = function (template, callback) {
		if (!callback) {
			return;
		}
		if (!templates[template]) {
			var request = new XMLHttpRequest();
			request.open('GET', 'app/view/' + template + '.html?v=' + _version, true);
			request.responseType = 'text';
			request.onload = function () {
				templates[template] = doT.template(request.responseText);
				callback(templates[template]);
			};
			request.onerror = function () {};
			request.send();
		} else {
			callback(templates[template]);
		}
	};

	function _readLocal(key, default_value) {
		var val = localStorage[key];
		if (val) {
			if (val.charAt(0) === '{' || val.charAt(0) === '[') {
				try {
					var res = JSON.parse(val);
					if (res === null || res === undefined) {
						return default_value;
					}
					return res;
				} catch (e) {
					console.error(e);
				}
			} else {
				return val;
			}
		}
		return default_value;
	}

	function _writeLocal(key, value) {
		if (key) {
			try {
				if (value === null || value === undefined) {
					return localStorage.removeItem(key);
				} else {
					if (Array.isArray(value) || _isObject(value)) {
						return localStorage.setItem(key, JSON.stringify(value));
					} else {
						return localStorage.setItem(key, value);
					}
				}
			} catch (e) {
				console.error(e);
			}
		}
		return null;
	}

	model.readLocal = _readLocal;
	model.writeLocal = _writeLocal;
	model.removeNode = _removeNode;
	model.detectCSSFeature = _detectCSSFeature;
	model.each = _each;
	model.one = _one;
	model.on = _on;
	model.off = _off;
	model.addClass = _addClass;
	model.removeClass = _removeClass;
	model.animateCSS = _animateCSS;
	model.isObject = _isObject;
	model.get = _get;
	model.getTemplate = _getTemplate;
	this.util = model;

}).call(this);