(function() {
	'use strict';
	var _animationEndEvents = 'webkitAnimationEnd mozAnimationEnd msAnimationEnd oAnimationEnd animationend',
		_animationStartEvents = 'webkitAnimationStart mozAnimationStart msAnimationStart oAnimationStart animationstart';

	function _createElement(type, attr, parent, html) {
		var el, arr;
		if (!attr) attr = {};
		if (type.indexOf('.') !== -1) {
			arr = type.split('.');
			type = arr[0];
			arr.shift();
			attr.class = arr.join(' ');
		}
		if (type.indexOf('#') !== -1) {
			arr = type.split('#');
			type = arr[0];
			attr.id = arr[1];
		}
		el = document.createElement(type);
		for (var i in attr) el.setAttribute(i, attr[i]);
		if (parent) parent.appendChild(el);
		if (html) el.innerHTML = html;
		return el;
	}

	function _each(o, func) {
		if (!o || (o.length === 0 && o != window)) return;
		if (!o.length) func(o);
		else Array.prototype.forEach.call(o, function(el, i) {
			func(el);
		});
	}

	function _one(el, events, func, useCapture) {
		_on(el, events, function(ev) {
			func(ev);
			_off(el, events, func);
		}, useCapture);
	}

	function _on(els, events, func, useCapture) {
		_each(els, function(el) {
			var ev = events.split(' ');
			for (var e in ev) el.addEventListener(ev[e], func, useCapture);
		});
	}

	function _off(els, events, func) {
		_each(els, function(el) {
			var ev = events.split(' ');
			for (var e in ev) el.removeEventListener(ev[e], func);
		});
	}

	function _setOptions(opt) {
		if (opt === undefined) opt = {};
		var o = {};
		for (var i in defaults) o[i] = (opt[i] !== undefined) ? opt[i] : defaults[i];
		return o;
	}

	function _animateCSS(el, cls, start, end) {
		if (start) _one(el, _animationStartEvents, start);
		_one(el, _animationEndEvents, function(ev) {
			_removeClass(el, cls);
			if (end) end(ev);
		});
		_addClass(el, cls);
	}

	function _addClass(els, cls) {
		_each(els, function(el) {
			if (el.classList) {
				var arr = cls.split(' ');
				for (var i in arr) el.classList.add(arr[i]);
			} else el.className += ' ' + cls;
		});
	}

	function _removeClass(els, cls) {
		_each(els, function(el) {
			if (el.classList) {
				var arr = cls.split(' ');
				for (var i in arr) el.classList.remove(arr[i]);
			} else el.className = el.className.replace(new RegExp('(^|\\b)' + cls.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		});
	}

	function _getWeek(dt) {
		var d = new Date(dt);
		d.setHours(0, 0, 0);
		d.setDate(d.getDate() + 4 - (d.getDay() || 7));
		var yearStart = new Date(d.getFullYear(), 0, 1);
		return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
	}

	function _format(dt) {
		var s = dt.getFullYear() + "-";
		s += (dt.getMonth() < 9 ? "0" + (dt.getMonth() + 1) : (dt.getMonth() + 1)) + "-";
		s += (dt.getDate() < 10 ? "0" + dt.getDate() : dt.getDate());
		return s;
	}
	function _setWeek(dt,w, y) {
		if (y === undefined) y = dt.getFullYear();
		var simple = new Date(y, 0, 1 + (w - 1) * 7);
		var dow = simple.getDay();
		var ISOweekStart = simple;
		if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
		else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
		dt.setFullYear(ISOweekStart.getFullYear());
		dt.setMonth(ISOweekStart.getMonth());
		dt.setDate(ISOweekStart.getDate());
	}

	/* ************************************
	############## MY PLUGIN ##############
	************************************ */

	var defaults = {
		date: null
	};

	var Base = function(container, options) {
		this.opt = _setOptions(options);
		this.container = container;
		this.contentEl = _createElement('div.week-content', null, this.container);
		this.yearEl = _createElement('input.week-year', {
			type: 'text',
			placeholder: 'YYYY',
			maxlength: '4'
		}, this.contentEl);
		this.weekEl = _createElement('input.week-week', {
			type: 'text',
			maxlength: '2'
		}, this.contentEl);
		this.dateEl = _createElement('input.week-date', {
			type: 'text',
			placeholder: 'YYYY-MM-DD',
			maxlength: '10'
		}, this.contentEl);
		this.infoEl = _createElement('div.week-info', null, this.contentEl);
		if (!this.opt.date) {
			this.opt.date = new Date();
			this.autoupdate();
		}

		this.resetAll(this.opt.date);
		_on([document.documentElement], 'keyup', this.containerElKeyUp.bind(this));
		_on(this.dateEl, 'keyup', this.dateElKeyUp.bind(this), false);
		_on(this.weekEl, 'keyup', this.weekElKeyUp.bind(this), false);
		_on(this.yearEl, 'keyup', this.yearElKeyUp.bind(this), false);
	};
	Base.prototype.containerElKeyUp = function(ev) {
		if (ev.srcElement != document.body) return;
		if (ev.keyCode == 70) {
			/*_launchFullscreen(document.documentElement);*/
		} else if (ev.keyCode == 72) {
			/*showHelp();*/
		} else if (ev.keyCode == 82) {
			this.resetAll(new Date());
		} else if (ev.keyCode == 65) {
			if (this.interval === null) this.resetAll(new Date());
			this.autoupdate(this.interval === null);
		}
	};
	Base.prototype.weekElKeyUp = function(ev) {
		if (this.weekEl.value > 53 || this.weekEl.value < 1 || this.weekEl.lastValue == this.weekEl.value) return;
		if (isNaN(this.opt.date)) this.opt.date = new Date();
		this.weekEl.lastValue = this.weekEl.value;
		_setWeek(this.opt.date,parseInt(this.weekEl.value, 10), this.yearEl.value);
		this.updateDate();
		this.setSpan();
		this.autoupdate(false);
	};
	Base.prototype.yearElKeyUp = function(ev) {
		if (this.yearEl.value.length < 4 || this.yearEl.lastValue == this.yearEl.value) return;
		this.opt.date.setFullYear(this.yearEl.value);
		this.yearEl.lastValue = this.yearEl.value;
		this.updateWeek();
		this.updateDate();
		this.setSpan();
		this.autoupdate(false);
	};
	Base.prototype.dateElKeyUp = function(ev) {
		if (this.dateEl.value.length < 10 || this.dateEl.lastValue == this.dateEl.value) return;
		this.dateEl.lastValue = this.dateEl.value;
		this.opt.date = new Date(this.dateEl.value);
		this.updateYear();
		this.updateWeek();
		this.setSpan();
		this.autoupdate(false);
	};
	Base.prototype.autoupdate = function(on) {
		if (on === undefined) on = true;
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
			console.log('autoupdate off');
		}
		if (on) {
			this.interval = setInterval(this.tick.bind(this), 1000);
			console.log('autoupdate on');
		}
	};
	Base.prototype.tick = function() {
		var dt = new Date();
		if (_format(this.opt.date) != _format(dt)) {
			this.resetAll(dt);
		}
	};
	Base.prototype.setSpan = function() {
		if (isNaN(this.opt.date)) return;
		var start = new Date(this.opt.date);
		_setWeek(start,_getWeek(this.opt.date), this.yearEl.value);
		var end = new Date(start);
		end.setDate(end.getDate() + 6);
		var html = _format(start) + ' → ' + _format(end);
		if (this.infoEl.textContent != html) {
			this.infoEl.textContent = html;
			_animateCSS(this.infoEl, 'week-bounce-in');
		}
	};

	Base.prototype.resetAll = function(dt) {
		if (dt) this.opt.date = dt;
		this.yearEl.value = this.yearEl.lastValue = this.opt.date.getFullYear();
		this.weekEl.value = this.weekEl.lastValue = _getWeek(this.opt.date);
		this.dateEl.value = this.dateEl.lastValue = _format(this.opt.date);
		this.setSpan();
		_animateCSS(this.weekEl, 'week-bounce-in');
		_animateCSS(this.yearEl, 'week-bounce-in');
		_animateCSS(this.dateEl, 'week-bounce-in');
	};

	Base.prototype.updateDate = function() {
		if (isNaN(this.opt.date) || this.dateEl.lastValue == _format(this.opt.date)) return;

		this.dateEl.value = this.dateEl.lastValue = isNaN(this.opt.date) ? '?' : _format(this.opt.date);
		_animateCSS(this.dateEl, 'week-bounce-in');
	};

	Base.prototype.updateWeek = function() {
		if (isNaN(this.opt.date) || this.weekEl.lastValue == _getWeek(this.opt.date)) return;

		this.weekEl.value = this.weekEl.lastValue = isNaN(this.opt.date) ? '?' : _getWeek(this.opt.date);
		_animateCSS(this.weekEl, 'week-bounce-in');
	};

	Base.prototype.updateYear = function() {
		if (isNaN(this.opt.date) || this.yearEl.lastValue == this.opt.date.getFullYear()) return;

		this.yearEl.value = this.yearEl.lastValue = this.opt.date.getFullYear();
		_animateCSS(this.yearEl, 'week-bounce-in');
	};
	this.Week = function(el, options) {
		var instance = new Base(el, options);
		return instance;
	};

	this.Week.globals = defaults;

}).call(this);
