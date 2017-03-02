/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var run_1 = __webpack_require__(1);
	var main_1 = __webpack_require__(8);
	var dom_1 = __webpack_require__(13);
	var router_1 = __webpack_require__(141);
	var events_1 = __webpack_require__(114);
	var prevent_1 = __webpack_require__(142);
	var meetups_1 = __webpack_require__(117);
	var registrations_1 = __webpack_require__(143);
	var history_1 = __webpack_require__(144);
	var material_1 = __webpack_require__(162);
	run_1.run(main_1.default, {
	    dom: dom_1.makeDOMDriver('#app'),
	    routes: router_1.makeRoutesDriver(),
	    events: events_1.makeEventsDriver(),
	    prevent: prevent_1.makePreventDriver(),
	    meetups: meetups_1.makeMeetupsDriver(),
	    registrations: registrations_1.makeRegistrationsDriver(),
	    history: history_1.makeHistoryDriver({ hash: true }),
	    material: material_1.makeMaterialDriver()
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xstream_1 = __webpack_require__(2);
	var adapt_1 = __webpack_require__(7);
	function logToConsoleError(err) {
	    var target = err.stack || err;
	    if (console && console.error) {
	        console.error(target);
	    }
	    else if (console && console.log) {
	        console.log(target);
	    }
	}
	function makeSinkProxies(drivers) {
	    var sinkProxies = {};
	    for (var name_1 in drivers) {
	        if (drivers.hasOwnProperty(name_1)) {
	            sinkProxies[name_1] = xstream_1.default.createWithMemory();
	        }
	    }
	    return sinkProxies;
	}
	function callDrivers(drivers, sinkProxies) {
	    var sources = {};
	    for (var name_2 in drivers) {
	        if (drivers.hasOwnProperty(name_2)) {
	            sources[name_2] = drivers[name_2](sinkProxies[name_2], name_2);
	            if (sources[name_2] && typeof sources[name_2] === 'object') {
	                sources[name_2]._isCycleSource = name_2;
	            }
	        }
	    }
	    return sources;
	}
	// NOTE: this will mutate `sources`.
	function adaptSources(sources) {
	    for (var name_3 in sources) {
	        if (sources.hasOwnProperty(name_3)
	            && sources[name_3]
	            && typeof sources[name_3]['shamefullySendNext'] === 'function') {
	            sources[name_3] = adapt_1.adapt(sources[name_3]);
	        }
	    }
	    return sources;
	}
	function replicateMany(sinks, sinkProxies) {
	    var sinkNames = Object.keys(sinks).filter(function (name) { return !!sinkProxies[name]; });
	    var buffers = {};
	    var replicators = {};
	    sinkNames.forEach(function (name) {
	        buffers[name] = { _n: [], _e: [] };
	        replicators[name] = {
	            next: function (x) { return buffers[name]._n.push(x); },
	            error: function (err) { return buffers[name]._e.push(err); },
	            complete: function () { },
	        };
	    });
	    var subscriptions = sinkNames
	        .map(function (name) { return xstream_1.default.fromObservable(sinks[name]).subscribe(replicators[name]); });
	    sinkNames.forEach(function (name) {
	        var listener = sinkProxies[name];
	        var next = function (x) { listener._n(x); };
	        var error = function (err) { logToConsoleError(err); listener._e(err); };
	        buffers[name]._n.forEach(next);
	        buffers[name]._e.forEach(error);
	        replicators[name].next = next;
	        replicators[name].error = error;
	        // because sink.subscribe(replicator) had mutated replicator to add
	        // _n, _e, _c, we must also update these:
	        replicators[name]._n = next;
	        replicators[name]._e = error;
	    });
	    buffers = null; // free up for GC
	    return function disposeReplication() {
	        subscriptions.forEach(function (s) { return s.unsubscribe(); });
	        sinkNames.forEach(function (name) { return sinkProxies[name]._c(); });
	    };
	}
	function disposeSources(sources) {
	    for (var k in sources) {
	        if (sources.hasOwnProperty(k) && sources[k] && sources[k].dispose) {
	            sources[k].dispose();
	        }
	    }
	}
	function isObjectEmpty(obj) {
	    return Object.keys(obj).length === 0;
	}
	/**
	 * A function that prepares the Cycle application to be executed. Takes a `main`
	 * function and prepares to circularly connects it to the given collection of
	 * driver functions. As an output, `setup()` returns an object with three
	 * properties: `sources`, `sinks` and `run`. Only when `run()` is called will
	 * the application actually execute. Refer to the documentation of `run()` for
	 * more details.
	 *
	 * **Example:**
	 * ```js
	 * import {setup} from '@cycle/run';
	 * const {sources, sinks, run} = setup(main, drivers);
	 * // ...
	 * const dispose = run(); // Executes the application
	 * // ...
	 * dispose();
	 * ```
	 *
	 * @param {Function} main a function that takes `sources` as input and outputs
	 * `sinks`.
	 * @param {Object} drivers an object where keys are driver names and values
	 * are driver functions.
	 * @return {Object} an object with three properties: `sources`, `sinks` and
	 * `run`. `sources` is the collection of driver sources, `sinks` is the
	 * collection of driver sinks, these can be used for debugging or testing. `run`
	 * is the function that once called will execute the application.
	 * @function setup
	 */
	function setup(main, drivers) {
	    if (typeof main !== "function") {
	        throw new Error("First argument given to Cycle must be the 'main' " +
	            "function.");
	    }
	    if (typeof drivers !== "object" || drivers === null) {
	        throw new Error("Second argument given to Cycle must be an object " +
	            "with driver functions as properties.");
	    }
	    if (isObjectEmpty(drivers)) {
	        throw new Error("Second argument given to Cycle must be an object " +
	            "with at least one driver function declared as a property.");
	    }
	    var sinkProxies = makeSinkProxies(drivers);
	    var sources = callDrivers(drivers, sinkProxies);
	    var adaptedSources = adaptSources(sources);
	    var sinks = main(adaptedSources);
	    if (typeof window !== 'undefined') {
	        window.Cyclejs = window.Cyclejs || {};
	        window.Cyclejs.sinks = sinks;
	    }
	    function run() {
	        var disposeReplication = replicateMany(sinks, sinkProxies);
	        return function dispose() {
	            disposeSources(sources);
	            disposeReplication();
	        };
	    }
	    ;
	    return { sinks: sinks, sources: sources, run: run };
	}
	exports.setup = setup;
	/**
	 * Takes a `main` function and circularly connects it to the given collection
	 * of driver functions.
	 *
	 * **Example:**
	 * ```js
	 * import run from '@cycle/run';
	 * const dispose = run(main, drivers);
	 * // ...
	 * dispose();
	 * ```
	 *
	 * The `main` function expects a collection of "source" streams (returned from
	 * drivers) as input, and should return a collection of "sink" streams (to be
	 * given to drivers). A "collection of streams" is a JavaScript object where
	 * keys match the driver names registered by the `drivers` object, and values
	 * are the streams. Refer to the documentation of each driver to see more
	 * details on what types of sources it outputs and sinks it receives.
	 *
	 * @param {Function} main a function that takes `sources` as input and outputs
	 * `sinks`.
	 * @param {Object} drivers an object where keys are driver names and values
	 * are driver functions.
	 * @return {Function} a dispose function, used to terminate the execution of the
	 * Cycle.js program, cleaning up resources used.
	 * @function run
	 */
	function run(main, drivers) {
	    var _a = setup(main, drivers), run = _a.run, sinks = _a.sinks;
	    if (typeof window !== 'undefined' && window['CyclejsDevTool_startGraphSerializer']) {
	        window['CyclejsDevTool_startGraphSerializer'](sinks);
	    }
	    return run();
	}
	exports.run = run;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = run;
	//# sourceMappingURL=index.js.map

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var symbol_observable_1 = __webpack_require__(3);
	var NO = {};
	exports.NO = NO;
	function noop() { }
	function cp(a) {
	    var l = a.length;
	    var b = Array(l);
	    for (var i = 0; i < l; ++i)
	        b[i] = a[i];
	    return b;
	}
	function and(f1, f2) {
	    return function andFn(t) {
	        return f1(t) && f2(t);
	    };
	}
	function _try(c, t, u) {
	    try {
	        return c.f(t);
	    }
	    catch (e) {
	        u._e(e);
	        return NO;
	    }
	}
	var NO_IL = {
	    _n: noop,
	    _e: noop,
	    _c: noop,
	};
	exports.NO_IL = NO_IL;
	// mutates the input
	function internalizeProducer(producer) {
	    producer._start = function _start(il) {
	        il.next = il._n;
	        il.error = il._e;
	        il.complete = il._c;
	        this.start(il);
	    };
	    producer._stop = producer.stop;
	}
	var StreamSub = (function () {
	    function StreamSub(_stream, _listener) {
	        this._stream = _stream;
	        this._listener = _listener;
	    }
	    StreamSub.prototype.unsubscribe = function () {
	        this._stream.removeListener(this._listener);
	    };
	    return StreamSub;
	}());
	var Observer = (function () {
	    function Observer(_listener) {
	        this._listener = _listener;
	    }
	    Observer.prototype.next = function (value) {
	        this._listener._n(value);
	    };
	    Observer.prototype.error = function (err) {
	        this._listener._e(err);
	    };
	    Observer.prototype.complete = function () {
	        this._listener._c();
	    };
	    return Observer;
	}());
	var FromObservable = (function () {
	    function FromObservable(observable) {
	        this.type = 'fromObservable';
	        this.ins = observable;
	        this.active = false;
	    }
	    FromObservable.prototype._start = function (out) {
	        this.out = out;
	        this.active = true;
	        this._sub = this.ins.subscribe(new Observer(out));
	        if (!this.active)
	            this._sub.unsubscribe();
	    };
	    FromObservable.prototype._stop = function () {
	        if (this._sub)
	            this._sub.unsubscribe();
	        this.active = false;
	    };
	    return FromObservable;
	}());
	var Merge = (function () {
	    function Merge(insArr) {
	        this.type = 'merge';
	        this.insArr = insArr;
	        this.out = NO;
	        this.ac = 0;
	    }
	    Merge.prototype._start = function (out) {
	        this.out = out;
	        var s = this.insArr;
	        var L = s.length;
	        this.ac = L;
	        for (var i = 0; i < L; i++)
	            s[i]._add(this);
	    };
	    Merge.prototype._stop = function () {
	        var s = this.insArr;
	        var L = s.length;
	        for (var i = 0; i < L; i++)
	            s[i]._remove(this);
	        this.out = NO;
	    };
	    Merge.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._n(t);
	    };
	    Merge.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Merge.prototype._c = function () {
	        if (--this.ac <= 0) {
	            var u = this.out;
	            if (u === NO)
	                return;
	            u._c();
	        }
	    };
	    return Merge;
	}());
	var CombineListener = (function () {
	    function CombineListener(i, out, p) {
	        this.i = i;
	        this.out = out;
	        this.p = p;
	        p.ils.push(this);
	    }
	    CombineListener.prototype._n = function (t) {
	        var p = this.p, out = this.out;
	        if (out === NO)
	            return;
	        if (p.up(t, this.i))
	            out._n(p.vals);
	    };
	    CombineListener.prototype._e = function (err) {
	        var out = this.out;
	        if (out === NO)
	            return;
	        out._e(err);
	    };
	    CombineListener.prototype._c = function () {
	        var p = this.p;
	        if (p.out === NO)
	            return;
	        if (--p.Nc === 0)
	            p.out._c();
	    };
	    return CombineListener;
	}());
	var Combine = (function () {
	    function Combine(insArr) {
	        this.type = 'combine';
	        this.insArr = insArr;
	        this.out = NO;
	        this.ils = [];
	        this.Nc = this.Nn = 0;
	        this.vals = [];
	    }
	    Combine.prototype.up = function (t, i) {
	        var v = this.vals[i];
	        var Nn = !this.Nn ? 0 : v === NO ? --this.Nn : this.Nn;
	        this.vals[i] = t;
	        return Nn === 0;
	    };
	    Combine.prototype._start = function (out) {
	        this.out = out;
	        var s = this.insArr;
	        var n = this.Nc = this.Nn = s.length;
	        var vals = this.vals = new Array(n);
	        if (n === 0) {
	            out._n([]);
	            out._c();
	        }
	        else {
	            for (var i = 0; i < n; i++) {
	                vals[i] = NO;
	                s[i]._add(new CombineListener(i, out, this));
	            }
	        }
	    };
	    Combine.prototype._stop = function () {
	        var s = this.insArr;
	        var n = s.length;
	        var ils = this.ils;
	        for (var i = 0; i < n; i++)
	            s[i]._remove(ils[i]);
	        this.out = NO;
	        this.ils = [];
	        this.vals = [];
	    };
	    return Combine;
	}());
	var FromArray = (function () {
	    function FromArray(a) {
	        this.type = 'fromArray';
	        this.a = a;
	    }
	    FromArray.prototype._start = function (out) {
	        var a = this.a;
	        for (var i = 0, n = a.length; i < n; i++)
	            out._n(a[i]);
	        out._c();
	    };
	    FromArray.prototype._stop = function () {
	    };
	    return FromArray;
	}());
	var FromPromise = (function () {
	    function FromPromise(p) {
	        this.type = 'fromPromise';
	        this.on = false;
	        this.p = p;
	    }
	    FromPromise.prototype._start = function (out) {
	        var prod = this;
	        this.on = true;
	        this.p.then(function (v) {
	            if (prod.on) {
	                out._n(v);
	                out._c();
	            }
	        }, function (e) {
	            out._e(e);
	        }).then(noop, function (err) {
	            setTimeout(function () { throw err; });
	        });
	    };
	    FromPromise.prototype._stop = function () {
	        this.on = false;
	    };
	    return FromPromise;
	}());
	var Periodic = (function () {
	    function Periodic(period) {
	        this.type = 'periodic';
	        this.period = period;
	        this.intervalID = -1;
	        this.i = 0;
	    }
	    Periodic.prototype._start = function (out) {
	        var self = this;
	        function intervalHandler() { out._n(self.i++); }
	        this.intervalID = setInterval(intervalHandler, this.period);
	    };
	    Periodic.prototype._stop = function () {
	        if (this.intervalID !== -1)
	            clearInterval(this.intervalID);
	        this.intervalID = -1;
	        this.i = 0;
	    };
	    return Periodic;
	}());
	var Debug = (function () {
	    function Debug(ins, arg) {
	        this.type = 'debug';
	        this.ins = ins;
	        this.out = NO;
	        this.s = noop;
	        this.l = '';
	        if (typeof arg === 'string')
	            this.l = arg;
	        else if (typeof arg === 'function')
	            this.s = arg;
	    }
	    Debug.prototype._start = function (out) {
	        this.out = out;
	        this.ins._add(this);
	    };
	    Debug.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	    };
	    Debug.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        var s = this.s, l = this.l;
	        if (s !== noop) {
	            try {
	                s(t);
	            }
	            catch (e) {
	                u._e(e);
	            }
	        }
	        else if (l)
	            console.log(l + ':', t);
	        else
	            console.log(t);
	        u._n(t);
	    };
	    Debug.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Debug.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    return Debug;
	}());
	var Drop = (function () {
	    function Drop(max, ins) {
	        this.type = 'drop';
	        this.ins = ins;
	        this.out = NO;
	        this.max = max;
	        this.dropped = 0;
	    }
	    Drop.prototype._start = function (out) {
	        this.out = out;
	        this.dropped = 0;
	        this.ins._add(this);
	    };
	    Drop.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	    };
	    Drop.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        if (this.dropped++ >= this.max)
	            u._n(t);
	    };
	    Drop.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Drop.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    return Drop;
	}());
	var EndWhenListener = (function () {
	    function EndWhenListener(out, op) {
	        this.out = out;
	        this.op = op;
	    }
	    EndWhenListener.prototype._n = function () {
	        this.op.end();
	    };
	    EndWhenListener.prototype._e = function (err) {
	        this.out._e(err);
	    };
	    EndWhenListener.prototype._c = function () {
	        this.op.end();
	    };
	    return EndWhenListener;
	}());
	var EndWhen = (function () {
	    function EndWhen(o, ins) {
	        this.type = 'endWhen';
	        this.ins = ins;
	        this.out = NO;
	        this.o = o;
	        this.oil = NO_IL;
	    }
	    EndWhen.prototype._start = function (out) {
	        this.out = out;
	        this.o._add(this.oil = new EndWhenListener(out, this));
	        this.ins._add(this);
	    };
	    EndWhen.prototype._stop = function () {
	        this.ins._remove(this);
	        this.o._remove(this.oil);
	        this.out = NO;
	        this.oil = NO_IL;
	    };
	    EndWhen.prototype.end = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    EndWhen.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._n(t);
	    };
	    EndWhen.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    EndWhen.prototype._c = function () {
	        this.end();
	    };
	    return EndWhen;
	}());
	var Filter = (function () {
	    function Filter(passes, ins) {
	        this.type = 'filter';
	        this.ins = ins;
	        this.out = NO;
	        this.f = passes;
	    }
	    Filter.prototype._start = function (out) {
	        this.out = out;
	        this.ins._add(this);
	    };
	    Filter.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	    };
	    Filter.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        var r = _try(this, t, u);
	        if (r === NO || !r)
	            return;
	        u._n(t);
	    };
	    Filter.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Filter.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    return Filter;
	}());
	var FlattenListener = (function () {
	    function FlattenListener(out, op) {
	        this.out = out;
	        this.op = op;
	    }
	    FlattenListener.prototype._n = function (t) {
	        this.out._n(t);
	    };
	    FlattenListener.prototype._e = function (err) {
	        this.out._e(err);
	    };
	    FlattenListener.prototype._c = function () {
	        this.op.inner = NO;
	        this.op.less();
	    };
	    return FlattenListener;
	}());
	var Flatten = (function () {
	    function Flatten(ins) {
	        this.type = 'flatten';
	        this.ins = ins;
	        this.out = NO;
	        this.open = true;
	        this.inner = NO;
	        this.il = NO_IL;
	    }
	    Flatten.prototype._start = function (out) {
	        this.out = out;
	        this.open = true;
	        this.inner = NO;
	        this.il = NO_IL;
	        this.ins._add(this);
	    };
	    Flatten.prototype._stop = function () {
	        this.ins._remove(this);
	        if (this.inner !== NO)
	            this.inner._remove(this.il);
	        this.out = NO;
	        this.open = true;
	        this.inner = NO;
	        this.il = NO_IL;
	    };
	    Flatten.prototype.less = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        if (!this.open && this.inner === NO)
	            u._c();
	    };
	    Flatten.prototype._n = function (s) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        var _a = this, inner = _a.inner, il = _a.il;
	        if (inner !== NO && il !== NO_IL)
	            inner._remove(il);
	        (this.inner = s)._add(this.il = new FlattenListener(u, this));
	    };
	    Flatten.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Flatten.prototype._c = function () {
	        this.open = false;
	        this.less();
	    };
	    return Flatten;
	}());
	var Fold = (function () {
	    function Fold(f, seed, ins) {
	        var _this = this;
	        this.type = 'fold';
	        this.ins = ins;
	        this.out = NO;
	        this.f = function (t) { return f(_this.acc, t); };
	        this.acc = this.seed = seed;
	    }
	    Fold.prototype._start = function (out) {
	        this.out = out;
	        this.acc = this.seed;
	        out._n(this.acc);
	        this.ins._add(this);
	    };
	    Fold.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	        this.acc = this.seed;
	    };
	    Fold.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        var r = _try(this, t, u);
	        if (r === NO)
	            return;
	        u._n(this.acc = r);
	    };
	    Fold.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Fold.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    return Fold;
	}());
	var Last = (function () {
	    function Last(ins) {
	        this.type = 'last';
	        this.ins = ins;
	        this.out = NO;
	        this.has = false;
	        this.val = NO;
	    }
	    Last.prototype._start = function (out) {
	        this.out = out;
	        this.has = false;
	        this.ins._add(this);
	    };
	    Last.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	        this.val = NO;
	    };
	    Last.prototype._n = function (t) {
	        this.has = true;
	        this.val = t;
	    };
	    Last.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Last.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        if (this.has) {
	            u._n(this.val);
	            u._c();
	        }
	        else
	            u._e(new Error('last() failed because input stream completed'));
	    };
	    return Last;
	}());
	var MapFlattenListener = (function () {
	    function MapFlattenListener(out, op) {
	        this.out = out;
	        this.op = op;
	    }
	    MapFlattenListener.prototype._n = function (r) {
	        this.out._n(r);
	    };
	    MapFlattenListener.prototype._e = function (err) {
	        this.out._e(err);
	    };
	    MapFlattenListener.prototype._c = function () {
	        this.op.inner = NO;
	        this.op.less();
	    };
	    return MapFlattenListener;
	}());
	var MapFlatten = (function () {
	    function MapFlatten(mapOp) {
	        this.type = mapOp.type + "+flatten";
	        this.ins = mapOp.ins;
	        this.out = NO;
	        this.mapOp = mapOp;
	        this.inner = NO;
	        this.il = NO_IL;
	        this.open = true;
	    }
	    MapFlatten.prototype._start = function (out) {
	        this.out = out;
	        this.inner = NO;
	        this.il = NO_IL;
	        this.open = true;
	        this.mapOp.ins._add(this);
	    };
	    MapFlatten.prototype._stop = function () {
	        this.mapOp.ins._remove(this);
	        if (this.inner !== NO)
	            this.inner._remove(this.il);
	        this.out = NO;
	        this.inner = NO;
	        this.il = NO_IL;
	    };
	    MapFlatten.prototype.less = function () {
	        if (!this.open && this.inner === NO) {
	            var u = this.out;
	            if (u === NO)
	                return;
	            u._c();
	        }
	    };
	    MapFlatten.prototype._n = function (v) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        var _a = this, inner = _a.inner, il = _a.il;
	        var s = _try(this.mapOp, v, u);
	        if (s === NO)
	            return;
	        if (inner !== NO && il !== NO_IL)
	            inner._remove(il);
	        (this.inner = s)._add(this.il = new MapFlattenListener(u, this));
	    };
	    MapFlatten.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    MapFlatten.prototype._c = function () {
	        this.open = false;
	        this.less();
	    };
	    return MapFlatten;
	}());
	var MapOp = (function () {
	    function MapOp(project, ins) {
	        this.type = 'map';
	        this.ins = ins;
	        this.out = NO;
	        this.f = project;
	    }
	    MapOp.prototype._start = function (out) {
	        this.out = out;
	        this.ins._add(this);
	    };
	    MapOp.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	    };
	    MapOp.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        var r = _try(this, t, u);
	        if (r === NO)
	            return;
	        u._n(r);
	    };
	    MapOp.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    MapOp.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    return MapOp;
	}());
	var FilterMapFusion = (function (_super) {
	    __extends(FilterMapFusion, _super);
	    function FilterMapFusion(passes, project, ins) {
	        var _this = _super.call(this, project, ins) || this;
	        _this.type = 'filter+map';
	        _this.passes = passes;
	        return _this;
	    }
	    FilterMapFusion.prototype._n = function (t) {
	        if (!this.passes(t))
	            return;
	        var u = this.out;
	        if (u === NO)
	            return;
	        var r = _try(this, t, u);
	        if (r === NO)
	            return;
	        u._n(r);
	    };
	    return FilterMapFusion;
	}(MapOp));
	var Remember = (function () {
	    function Remember(ins) {
	        this.type = 'remember';
	        this.ins = ins;
	        this.out = NO;
	    }
	    Remember.prototype._start = function (out) {
	        this.out = out;
	        this.ins._add(out);
	    };
	    Remember.prototype._stop = function () {
	        this.ins._remove(this.out);
	        this.out = NO;
	    };
	    return Remember;
	}());
	var ReplaceError = (function () {
	    function ReplaceError(replacer, ins) {
	        this.type = 'replaceError';
	        this.ins = ins;
	        this.out = NO;
	        this.f = replacer;
	    }
	    ReplaceError.prototype._start = function (out) {
	        this.out = out;
	        this.ins._add(this);
	    };
	    ReplaceError.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	    };
	    ReplaceError.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._n(t);
	    };
	    ReplaceError.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        try {
	            this.ins._remove(this);
	            (this.ins = this.f(err))._add(this);
	        }
	        catch (e) {
	            u._e(e);
	        }
	    };
	    ReplaceError.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    return ReplaceError;
	}());
	var StartWith = (function () {
	    function StartWith(ins, val) {
	        this.type = 'startWith';
	        this.ins = ins;
	        this.out = NO;
	        this.val = val;
	    }
	    StartWith.prototype._start = function (out) {
	        this.out = out;
	        this.out._n(this.val);
	        this.ins._add(out);
	    };
	    StartWith.prototype._stop = function () {
	        this.ins._remove(this.out);
	        this.out = NO;
	    };
	    return StartWith;
	}());
	var Take = (function () {
	    function Take(max, ins) {
	        this.type = 'take';
	        this.ins = ins;
	        this.out = NO;
	        this.max = max;
	        this.taken = 0;
	    }
	    Take.prototype._start = function (out) {
	        this.out = out;
	        this.taken = 0;
	        if (this.max <= 0)
	            out._c();
	        else
	            this.ins._add(this);
	    };
	    Take.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	    };
	    Take.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        var m = ++this.taken;
	        if (m < this.max)
	            u._n(t);
	        else if (m === this.max) {
	            u._n(t);
	            u._c();
	        }
	    };
	    Take.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Take.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    return Take;
	}());
	var Stream = (function () {
	    function Stream(producer) {
	        this._prod = producer || NO;
	        this._ils = [];
	        this._stopID = NO;
	        this._dl = NO;
	        this._d = false;
	        this._target = NO;
	        this._err = NO;
	    }
	    Stream.prototype._n = function (t) {
	        var a = this._ils;
	        var L = a.length;
	        if (this._d)
	            this._dl._n(t);
	        if (L == 1)
	            a[0]._n(t);
	        else if (L == 0)
	            return;
	        else {
	            var b = cp(a);
	            for (var i = 0; i < L; i++)
	                b[i]._n(t);
	        }
	    };
	    Stream.prototype._e = function (err) {
	        if (this._err !== NO)
	            return;
	        this._err = err;
	        var a = this._ils;
	        var L = a.length;
	        this._x();
	        if (this._d)
	            this._dl._e(err);
	        if (L == 1)
	            a[0]._e(err);
	        else if (L == 0)
	            return;
	        else {
	            var b = cp(a);
	            for (var i = 0; i < L; i++)
	                b[i]._e(err);
	        }
	        if (!this._d && L == 0)
	            throw this._err;
	    };
	    Stream.prototype._c = function () {
	        var a = this._ils;
	        var L = a.length;
	        this._x();
	        if (this._d)
	            this._dl._c();
	        if (L == 1)
	            a[0]._c();
	        else if (L == 0)
	            return;
	        else {
	            var b = cp(a);
	            for (var i = 0; i < L; i++)
	                b[i]._c();
	        }
	    };
	    Stream.prototype._x = function () {
	        if (this._ils.length === 0)
	            return;
	        if (this._prod !== NO)
	            this._prod._stop();
	        this._err = NO;
	        this._ils = [];
	    };
	    Stream.prototype._stopNow = function () {
	        // WARNING: code that calls this method should
	        // first check if this._prod is valid (not `NO`)
	        this._prod._stop();
	        this._err = NO;
	        this._stopID = NO;
	    };
	    Stream.prototype._add = function (il) {
	        var ta = this._target;
	        if (ta !== NO)
	            return ta._add(il);
	        var a = this._ils;
	        a.push(il);
	        if (a.length > 1)
	            return;
	        if (this._stopID !== NO) {
	            clearTimeout(this._stopID);
	            this._stopID = NO;
	        }
	        else {
	            var p = this._prod;
	            if (p !== NO)
	                p._start(this);
	        }
	    };
	    Stream.prototype._remove = function (il) {
	        var _this = this;
	        var ta = this._target;
	        if (ta !== NO)
	            return ta._remove(il);
	        var a = this._ils;
	        var i = a.indexOf(il);
	        if (i > -1) {
	            a.splice(i, 1);
	            if (this._prod !== NO && a.length <= 0) {
	                this._err = NO;
	                this._stopID = setTimeout(function () { return _this._stopNow(); });
	            }
	            else if (a.length === 1) {
	                this._pruneCycles();
	            }
	        }
	    };
	    // If all paths stemming from `this` stream eventually end at `this`
	    // stream, then we remove the single listener of `this` stream, to
	    // force it to end its execution and dispose resources. This method
	    // assumes as a precondition that this._ils has just one listener.
	    Stream.prototype._pruneCycles = function () {
	        if (this._hasNoSinks(this, []))
	            this._remove(this._ils[0]);
	    };
	    // Checks whether *there is no* path starting from `x` that leads to an end
	    // listener (sink) in the stream graph, following edges A->B where B is a
	    // listener of A. This means these paths constitute a cycle somehow. Is given
	    // a trace of all visited nodes so far.
	    Stream.prototype._hasNoSinks = function (x, trace) {
	        if (trace.indexOf(x) !== -1)
	            return true;
	        else if (x.out === this)
	            return true;
	        else if (x.out && x.out !== NO)
	            return this._hasNoSinks(x.out, trace.concat(x));
	        else if (x._ils) {
	            for (var i = 0, N = x._ils.length; i < N; i++)
	                if (!this._hasNoSinks(x._ils[i], trace.concat(x)))
	                    return false;
	            return true;
	        }
	        else
	            return false;
	    };
	    Stream.prototype.ctor = function () {
	        return this instanceof MemoryStream ? MemoryStream : Stream;
	    };
	    /**
	     * Adds a Listener to the Stream.
	     *
	     * @param {Listener} listener
	     */
	    Stream.prototype.addListener = function (listener) {
	        listener._n = listener.next || noop;
	        listener._e = listener.error || noop;
	        listener._c = listener.complete || noop;
	        this._add(listener);
	    };
	    /**
	     * Removes a Listener from the Stream, assuming the Listener was added to it.
	     *
	     * @param {Listener<T>} listener
	     */
	    Stream.prototype.removeListener = function (listener) {
	        this._remove(listener);
	    };
	    /**
	     * Adds a Listener to the Stream returning a Subscription to remove that
	     * listener.
	     *
	     * @param {Listener} listener
	     * @returns {Subscription}
	     */
	    Stream.prototype.subscribe = function (listener) {
	        this.addListener(listener);
	        return new StreamSub(this, listener);
	    };
	    /**
	     * Add interop between most.js and RxJS 5
	     *
	     * @returns {Stream}
	     */
	    Stream.prototype[symbol_observable_1.default] = function () {
	        return this;
	    };
	    /**
	     * Creates a new Stream given a Producer.
	     *
	     * @factory true
	     * @param {Producer} producer An optional Producer that dictates how to
	     * start, generate events, and stop the Stream.
	     * @return {Stream}
	     */
	    Stream.create = function (producer) {
	        if (producer) {
	            if (typeof producer.start !== 'function'
	                || typeof producer.stop !== 'function')
	                throw new Error('producer requires both start and stop functions');
	            internalizeProducer(producer); // mutates the input
	        }
	        return new Stream(producer);
	    };
	    /**
	     * Creates a new MemoryStream given a Producer.
	     *
	     * @factory true
	     * @param {Producer} producer An optional Producer that dictates how to
	     * start, generate events, and stop the Stream.
	     * @return {MemoryStream}
	     */
	    Stream.createWithMemory = function (producer) {
	        if (producer)
	            internalizeProducer(producer); // mutates the input
	        return new MemoryStream(producer);
	    };
	    /**
	     * Creates a Stream that does nothing when started. It never emits any event.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     *          never
	     * -----------------------
	     * ```
	     *
	     * @factory true
	     * @return {Stream}
	     */
	    Stream.never = function () {
	        return new Stream({ _start: noop, _stop: noop });
	    };
	    /**
	     * Creates a Stream that immediately emits the "complete" notification when
	     * started, and that's it.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * empty
	     * -|
	     * ```
	     *
	     * @factory true
	     * @return {Stream}
	     */
	    Stream.empty = function () {
	        return new Stream({
	            _start: function (il) { il._c(); },
	            _stop: noop,
	        });
	    };
	    /**
	     * Creates a Stream that immediately emits an "error" notification with the
	     * value you passed as the `error` argument when the stream starts, and that's
	     * it.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * throw(X)
	     * -X
	     * ```
	     *
	     * @factory true
	     * @param error The error event to emit on the created stream.
	     * @return {Stream}
	     */
	    Stream.throw = function (error) {
	        return new Stream({
	            _start: function (il) { il._e(error); },
	            _stop: noop,
	        });
	    };
	    /**
	     * Creates a stream from an Array, Promise, or an Observable.
	     *
	     * @factory true
	     * @param {Array|Promise|Observable} input The input to make a stream from.
	     * @return {Stream}
	     */
	    Stream.from = function (input) {
	        if (typeof input[symbol_observable_1.default] === 'function')
	            return Stream.fromObservable(input);
	        else if (typeof input.then === 'function')
	            return Stream.fromPromise(input);
	        else if (Array.isArray(input))
	            return Stream.fromArray(input);
	        throw new TypeError("Type of input to from() must be an Array, Promise, or Observable");
	    };
	    /**
	     * Creates a Stream that immediately emits the arguments that you give to
	     * *of*, then completes.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * of(1,2,3)
	     * 123|
	     * ```
	     *
	     * @factory true
	     * @param a The first value you want to emit as an event on the stream.
	     * @param b The second value you want to emit as an event on the stream. One
	     * or more of these values may be given as arguments.
	     * @return {Stream}
	     */
	    Stream.of = function () {
	        var items = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            items[_i] = arguments[_i];
	        }
	        return Stream.fromArray(items);
	    };
	    /**
	     * Converts an array to a stream. The returned stream will emit synchronously
	     * all the items in the array, and then complete.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * fromArray([1,2,3])
	     * 123|
	     * ```
	     *
	     * @factory true
	     * @param {Array} array The array to be converted as a stream.
	     * @return {Stream}
	     */
	    Stream.fromArray = function (array) {
	        return new Stream(new FromArray(array));
	    };
	    /**
	     * Converts a promise to a stream. The returned stream will emit the resolved
	     * value of the promise, and then complete. However, if the promise is
	     * rejected, the stream will emit the corresponding error.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * fromPromise( ----42 )
	     * -----------------42|
	     * ```
	     *
	     * @factory true
	     * @param {Promise} promise The promise to be converted as a stream.
	     * @return {Stream}
	     */
	    Stream.fromPromise = function (promise) {
	        return new Stream(new FromPromise(promise));
	    };
	    /**
	     * Converts an Observable into a Stream.
	     *
	     * @factory true
	     * @param {any} observable The observable to be converted as a stream.
	     * @return {Stream}
	     */
	    Stream.fromObservable = function (obs) {
	        if (obs.endWhen)
	            return obs;
	        return new Stream(new FromObservable(obs));
	    };
	    /**
	     * Creates a stream that periodically emits incremental numbers, every
	     * `period` milliseconds.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     *     periodic(1000)
	     * ---0---1---2---3---4---...
	     * ```
	     *
	     * @factory true
	     * @param {number} period The interval in milliseconds to use as a rate of
	     * emission.
	     * @return {Stream}
	     */
	    Stream.periodic = function (period) {
	        return new Stream(new Periodic(period));
	    };
	    Stream.prototype._map = function (project) {
	        var p = this._prod;
	        var ctor = this.ctor();
	        if (p instanceof Filter)
	            return new ctor(new FilterMapFusion(p.f, project, p.ins));
	        return new ctor(new MapOp(project, this));
	    };
	    /**
	     * Transforms each event from the input Stream through a `project` function,
	     * to get a Stream that emits those transformed events.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --1---3--5-----7------
	     *    map(i => i * 10)
	     * --10--30-50----70-----
	     * ```
	     *
	     * @param {Function} project A function of type `(t: T) => U` that takes event
	     * `t` of type `T` from the input Stream and produces an event of type `U`, to
	     * be emitted on the output Stream.
	     * @return {Stream}
	     */
	    Stream.prototype.map = function (project) {
	        return this._map(project);
	    };
	    /**
	     * It's like `map`, but transforms each input event to always the same
	     * constant value on the output Stream.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --1---3--5-----7-----
	     *       mapTo(10)
	     * --10--10-10----10----
	     * ```
	     *
	     * @param projectedValue A value to emit on the output Stream whenever the
	     * input Stream emits any value.
	     * @return {Stream}
	     */
	    Stream.prototype.mapTo = function (projectedValue) {
	        var s = this.map(function () { return projectedValue; });
	        var op = s._prod;
	        op.type = op.type.replace('map', 'mapTo');
	        return s;
	    };
	    /**
	     * Only allows events that pass the test given by the `passes` argument.
	     *
	     * Each event from the input stream is given to the `passes` function. If the
	     * function returns `true`, the event is forwarded to the output stream,
	     * otherwise it is ignored and not forwarded.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --1---2--3-----4-----5---6--7-8--
	     *     filter(i => i % 2 === 0)
	     * ------2--------4---------6----8--
	     * ```
	     *
	     * @param {Function} passes A function of type `(t: T) +> boolean` that takes
	     * an event from the input stream and checks if it passes, by returning a
	     * boolean.
	     * @return {Stream}
	     */
	    Stream.prototype.filter = function (passes) {
	        var p = this._prod;
	        if (p instanceof Filter)
	            return new Stream(new Filter(and(p.f, passes), p.ins));
	        return new Stream(new Filter(passes, this));
	    };
	    /**
	     * Lets the first `amount` many events from the input stream pass to the
	     * output stream, then makes the output stream complete.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --a---b--c----d---e--
	     *    take(3)
	     * --a---b--c|
	     * ```
	     *
	     * @param {number} amount How many events to allow from the input stream
	     * before completing the output stream.
	     * @return {Stream}
	     */
	    Stream.prototype.take = function (amount) {
	        return new (this.ctor())(new Take(amount, this));
	    };
	    /**
	     * Ignores the first `amount` many events from the input stream, and then
	     * after that starts forwarding events from the input stream to the output
	     * stream.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --a---b--c----d---e--
	     *       drop(3)
	     * --------------d---e--
	     * ```
	     *
	     * @param {number} amount How many events to ignore from the input stream
	     * before forwarding all events from the input stream to the output stream.
	     * @return {Stream}
	     */
	    Stream.prototype.drop = function (amount) {
	        return new Stream(new Drop(amount, this));
	    };
	    /**
	     * When the input stream completes, the output stream will emit the last event
	     * emitted by the input stream, and then will also complete.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --a---b--c--d----|
	     *       last()
	     * -----------------d|
	     * ```
	     *
	     * @return {Stream}
	     */
	    Stream.prototype.last = function () {
	        return new Stream(new Last(this));
	    };
	    /**
	     * Prepends the given `initial` value to the sequence of events emitted by the
	     * input stream. The returned stream is a MemoryStream, which means it is
	     * already `remember()`'d.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * ---1---2-----3---
	     *   startWith(0)
	     * 0--1---2-----3---
	     * ```
	     *
	     * @param initial The value or event to prepend.
	     * @return {MemoryStream}
	     */
	    Stream.prototype.startWith = function (initial) {
	        return new MemoryStream(new StartWith(this, initial));
	    };
	    /**
	     * Uses another stream to determine when to complete the current stream.
	     *
	     * When the given `other` stream emits an event or completes, the output
	     * stream will complete. Before that happens, the output stream will behaves
	     * like the input stream.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * ---1---2-----3--4----5----6---
	     *   endWhen( --------a--b--| )
	     * ---1---2-----3--4--|
	     * ```
	     *
	     * @param other Some other stream that is used to know when should the output
	     * stream of this operator complete.
	     * @return {Stream}
	     */
	    Stream.prototype.endWhen = function (other) {
	        return new (this.ctor())(new EndWhen(other, this));
	    };
	    /**
	     * "Folds" the stream onto itself.
	     *
	     * Combines events from the past throughout
	     * the entire execution of the input stream, allowing you to accumulate them
	     * together. It's essentially like `Array.prototype.reduce`. The returned
	     * stream is a MemoryStream, which means it is already `remember()`'d.
	     *
	     * The output stream starts by emitting the `seed` which you give as argument.
	     * Then, when an event happens on the input stream, it is combined with that
	     * seed value through the `accumulate` function, and the output value is
	     * emitted on the output stream. `fold` remembers that output value as `acc`
	     * ("accumulator"), and then when a new input event `t` happens, `acc` will be
	     * combined with that to produce the new `acc` and so forth.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * ------1-----1--2----1----1------
	     *   fold((acc, x) => acc + x, 3)
	     * 3-----4-----5--7----8----9------
	     * ```
	     *
	     * @param {Function} accumulate A function of type `(acc: R, t: T) => R` that
	     * takes the previous accumulated value `acc` and the incoming event from the
	     * input stream and produces the new accumulated value.
	     * @param seed The initial accumulated value, of type `R`.
	     * @return {MemoryStream}
	     */
	    Stream.prototype.fold = function (accumulate, seed) {
	        return new MemoryStream(new Fold(accumulate, seed, this));
	    };
	    /**
	     * Replaces an error with another stream.
	     *
	     * When (and if) an error happens on the input stream, instead of forwarding
	     * that error to the output stream, *replaceError* will call the `replace`
	     * function which returns the stream that the output stream will replicate.
	     * And, in case that new stream also emits an error, `replace` will be called
	     * again to get another stream to start replicating.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --1---2-----3--4-----X
	     *   replaceError( () => --10--| )
	     * --1---2-----3--4--------10--|
	     * ```
	     *
	     * @param {Function} replace A function of type `(err) => Stream` that takes
	     * the error that occurred on the input stream or on the previous replacement
	     * stream and returns a new stream. The output stream will behave like the
	     * stream that this function returns.
	     * @return {Stream}
	     */
	    Stream.prototype.replaceError = function (replace) {
	        return new (this.ctor())(new ReplaceError(replace, this));
	    };
	    /**
	     * Flattens a "stream of streams", handling only one nested stream at a time
	     * (no concurrency).
	     *
	     * If the input stream is a stream that emits streams, then this operator will
	     * return an output stream which is a flat stream: emits regular events. The
	     * flattening happens without concurrency. It works like this: when the input
	     * stream emits a nested stream, *flatten* will start imitating that nested
	     * one. However, as soon as the next nested stream is emitted on the input
	     * stream, *flatten* will forget the previous nested one it was imitating, and
	     * will start imitating the new nested one.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --+--------+---------------
	     *   \        \
	     *    \       ----1----2---3--
	     *    --a--b----c----d--------
	     *           flatten
	     * -----a--b------1----2---3--
	     * ```
	     *
	     * @return {Stream}
	     */
	    Stream.prototype.flatten = function () {
	        var p = this._prod;
	        return new Stream(p instanceof MapOp && !(p instanceof FilterMapFusion) ?
	            new MapFlatten(p) :
	            new Flatten(this));
	    };
	    /**
	     * Passes the input stream to a custom operator, to produce an output stream.
	     *
	     * *compose* is a handy way of using an existing function in a chained style.
	     * Instead of writing `outStream = f(inStream)` you can write
	     * `outStream = inStream.compose(f)`.
	     *
	     * @param {function} operator A function that takes a stream as input and
	     * returns a stream as well.
	     * @return {Stream}
	     */
	    Stream.prototype.compose = function (operator) {
	        return operator(this);
	    };
	    /**
	     * Returns an output stream that behaves like the input stream, but also
	     * remembers the most recent event that happens on the input stream, so that a
	     * newly added listener will immediately receive that memorised event.
	     *
	     * @return {MemoryStream}
	     */
	    Stream.prototype.remember = function () {
	        return new MemoryStream(new Remember(this));
	    };
	    /**
	     * Returns an output stream that identically behaves like the input stream,
	     * but also runs a `spy` function fo each event, to help you debug your app.
	     *
	     * *debug* takes a `spy` function as argument, and runs that for each event
	     * happening on the input stream. If you don't provide the `spy` argument,
	     * then *debug* will just `console.log` each event. This helps you to
	     * understand the flow of events through some operator chain.
	     *
	     * Please note that if the output stream has no listeners, then it will not
	     * start, which means `spy` will never run because no actual event happens in
	     * that case.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --1----2-----3-----4--
	     *         debug
	     * --1----2-----3-----4--
	     * ```
	     *
	     * @param {function} labelOrSpy A string to use as the label when printing
	     * debug information on the console, or a 'spy' function that takes an event
	     * as argument, and does not need to return anything.
	     * @return {Stream}
	     */
	    Stream.prototype.debug = function (labelOrSpy) {
	        return new (this.ctor())(new Debug(this, labelOrSpy));
	    };
	    /**
	     * *imitate* changes this current Stream to emit the same events that the
	     * `other` given Stream does. This method returns nothing.
	     *
	     * This method exists to allow one thing: **circular dependency of streams**.
	     * For instance, let's imagine that for some reason you need to create a
	     * circular dependency where stream `first$` depends on stream `second$`
	     * which in turn depends on `first$`:
	     *
	     * <!-- skip-example -->
	     * ```js
	     * import delay from 'xstream/extra/delay'
	     *
	     * var first$ = second$.map(x => x * 10).take(3);
	     * var second$ = first$.map(x => x + 1).startWith(1).compose(delay(100));
	     * ```
	     *
	     * However, that is invalid JavaScript, because `second$` is undefined
	     * on the first line. This is how *imitate* can help solve it:
	     *
	     * ```js
	     * import delay from 'xstream/extra/delay'
	     *
	     * var secondProxy$ = xs.create();
	     * var first$ = secondProxy$.map(x => x * 10).take(3);
	     * var second$ = first$.map(x => x + 1).startWith(1).compose(delay(100));
	     * secondProxy$.imitate(second$);
	     * ```
	     *
	     * We create `secondProxy$` before the others, so it can be used in the
	     * declaration of `first$`. Then, after both `first$` and `second$` are
	     * defined, we hook `secondProxy$` with `second$` with `imitate()` to tell
	     * that they are "the same". `imitate` will not trigger the start of any
	     * stream, it just binds `secondProxy$` and `second$` together.
	     *
	     * The following is an example where `imitate()` is important in Cycle.js
	     * applications. A parent component contains some child components. A child
	     * has an action stream which is given to the parent to define its state:
	     *
	     * <!-- skip-example -->
	     * ```js
	     * const childActionProxy$ = xs.create();
	     * const parent = Parent({...sources, childAction$: childActionProxy$});
	     * const childAction$ = parent.state$.map(s => s.child.action$).flatten();
	     * childActionProxy$.imitate(childAction$);
	     * ```
	     *
	     * Note, though, that **`imitate()` does not support MemoryStreams**. If we
	     * would attempt to imitate a MemoryStream in a circular dependency, we would
	     * either get a race condition (where the symptom would be "nothing happens")
	     * or an infinite cyclic emission of values. It's useful to think about
	     * MemoryStreams as cells in a spreadsheet. It doesn't make any sense to
	     * define a spreadsheet cell `A1` with a formula that depends on `B1` and
	     * cell `B1` defined with a formula that depends on `A1`.
	     *
	     * If you find yourself wanting to use `imitate()` with a
	     * MemoryStream, you should rework your code around `imitate()` to use a
	     * Stream instead. Look for the stream in the circular dependency that
	     * represents an event stream, and that would be a candidate for creating a
	     * proxy Stream which then imitates the target Stream.
	     *
	     * @param {Stream} target The other stream to imitate on the current one. Must
	     * not be a MemoryStream.
	     */
	    Stream.prototype.imitate = function (target) {
	        if (target instanceof MemoryStream)
	            throw new Error('A MemoryStream was given to imitate(), but it only ' +
	                'supports a Stream. Read more about this restriction here: ' +
	                'https://github.com/staltz/xstream#faq');
	        this._target = target;
	        for (var ils = this._ils, N = ils.length, i = 0; i < N; i++)
	            target._add(ils[i]);
	        this._ils = [];
	    };
	    /**
	     * Forces the Stream to emit the given value to its listeners.
	     *
	     * As the name indicates, if you use this, you are most likely doing something
	     * The Wrong Way. Please try to understand the reactive way before using this
	     * method. Use it only when you know what you are doing.
	     *
	     * @param value The "next" value you want to broadcast to all listeners of
	     * this Stream.
	     */
	    Stream.prototype.shamefullySendNext = function (value) {
	        this._n(value);
	    };
	    /**
	     * Forces the Stream to emit the given error to its listeners.
	     *
	     * As the name indicates, if you use this, you are most likely doing something
	     * The Wrong Way. Please try to understand the reactive way before using this
	     * method. Use it only when you know what you are doing.
	     *
	     * @param {any} error The error you want to broadcast to all the listeners of
	     * this Stream.
	     */
	    Stream.prototype.shamefullySendError = function (error) {
	        this._e(error);
	    };
	    /**
	     * Forces the Stream to emit the "completed" event to its listeners.
	     *
	     * As the name indicates, if you use this, you are most likely doing something
	     * The Wrong Way. Please try to understand the reactive way before using this
	     * method. Use it only when you know what you are doing.
	     */
	    Stream.prototype.shamefullySendComplete = function () {
	        this._c();
	    };
	    /**
	     * Adds a "debug" listener to the stream. There can only be one debug
	     * listener, that's why this is 'setDebugListener'. To remove the debug
	     * listener, just call setDebugListener(null).
	     *
	     * A debug listener is like any other listener. The only difference is that a
	     * debug listener is "stealthy": its presence/absence does not trigger the
	     * start/stop of the stream (or the producer inside the stream). This is
	     * useful so you can inspect what is going on without changing the behavior
	     * of the program. If you have an idle stream and you add a normal listener to
	     * it, the stream will start executing. But if you set a debug listener on an
	     * idle stream, it won't start executing (not until the first normal listener
	     * is added).
	     *
	     * As the name indicates, we don't recommend using this method to build app
	     * logic. In fact, in most cases the debug operator works just fine. Only use
	     * this one if you know what you're doing.
	     *
	     * @param {Listener<T>} listener
	     */
	    Stream.prototype.setDebugListener = function (listener) {
	        if (!listener) {
	            this._d = false;
	            this._dl = NO;
	        }
	        else {
	            this._d = true;
	            listener._n = listener.next || noop;
	            listener._e = listener.error || noop;
	            listener._c = listener.complete || noop;
	            this._dl = listener;
	        }
	    };
	    return Stream;
	}());
	/**
	 * Blends multiple streams together, emitting events from all of them
	 * concurrently.
	 *
	 * *merge* takes multiple streams as arguments, and creates a stream that
	 * behaves like each of the argument streams, in parallel.
	 *
	 * Marble diagram:
	 *
	 * ```text
	 * --1----2-----3--------4---
	 * ----a-----b----c---d------
	 *            merge
	 * --1-a--2--b--3-c---d--4---
	 * ```
	 *
	 * @factory true
	 * @param {Stream} stream1 A stream to merge together with other streams.
	 * @param {Stream} stream2 A stream to merge together with other streams. Two
	 * or more streams may be given as arguments.
	 * @return {Stream}
	 */
	Stream.merge = function merge() {
	    var streams = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        streams[_i] = arguments[_i];
	    }
	    return new Stream(new Merge(streams));
	};
	/**
	 * Combines multiple input streams together to return a stream whose events
	 * are arrays that collect the latest events from each input stream.
	 *
	 * *combine* internally remembers the most recent event from each of the input
	 * streams. When any of the input streams emits an event, that event together
	 * with all the other saved events are combined into an array. That array will
	 * be emitted on the output stream. It's essentially a way of joining together
	 * the events from multiple streams.
	 *
	 * Marble diagram:
	 *
	 * ```text
	 * --1----2-----3--------4---
	 * ----a-----b-----c--d------
	 *          combine
	 * ----1a-2a-2b-3b-3c-3d-4d--
	 * ```
	 *
	 * Note: to minimize garbage collection, *combine* uses the same array
	 * instance for each emission.  If you need to compare emissions over time,
	 * cache the values with `map` first:
	 *
	 * ```js
	 * import pairwise from 'xstream/extra/pairwise'
	 *
	 * const stream1 = xs.of(1);
	 * const stream2 = xs.of(2);
	 *
	 * xs.combine(stream1, stream2).map(
	 *   combinedEmissions => ([ ...combinedEmissions ])
	 * ).compose(pairwise)
	 * ```
	 *
	 * @factory true
	 * @param {Stream} stream1 A stream to combine together with other streams.
	 * @param {Stream} stream2 A stream to combine together with other streams.
	 * Multiple streams, not just two, may be given as arguments.
	 * @return {Stream}
	 */
	Stream.combine = function combine() {
	    var streams = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        streams[_i] = arguments[_i];
	    }
	    return new Stream(new Combine(streams));
	};
	exports.Stream = Stream;
	var MemoryStream = (function (_super) {
	    __extends(MemoryStream, _super);
	    function MemoryStream(producer) {
	        var _this = _super.call(this, producer) || this;
	        _this._has = false;
	        return _this;
	    }
	    MemoryStream.prototype._n = function (x) {
	        this._v = x;
	        this._has = true;
	        _super.prototype._n.call(this, x);
	    };
	    MemoryStream.prototype._add = function (il) {
	        var ta = this._target;
	        if (ta !== NO)
	            return ta._add(il);
	        var a = this._ils;
	        a.push(il);
	        if (a.length > 1) {
	            if (this._has)
	                il._n(this._v);
	            return;
	        }
	        if (this._stopID !== NO) {
	            if (this._has)
	                il._n(this._v);
	            clearTimeout(this._stopID);
	            this._stopID = NO;
	        }
	        else if (this._has)
	            il._n(this._v);
	        else {
	            var p = this._prod;
	            if (p !== NO)
	                p._start(this);
	        }
	    };
	    MemoryStream.prototype._stopNow = function () {
	        this._has = false;
	        _super.prototype._stopNow.call(this);
	    };
	    MemoryStream.prototype._x = function () {
	        this._has = false;
	        _super.prototype._x.call(this);
	    };
	    MemoryStream.prototype.map = function (project) {
	        return this._map(project);
	    };
	    MemoryStream.prototype.mapTo = function (projectedValue) {
	        return _super.prototype.mapTo.call(this, projectedValue);
	    };
	    MemoryStream.prototype.take = function (amount) {
	        return _super.prototype.take.call(this, amount);
	    };
	    MemoryStream.prototype.endWhen = function (other) {
	        return _super.prototype.endWhen.call(this, other);
	    };
	    MemoryStream.prototype.replaceError = function (replace) {
	        return _super.prototype.replaceError.call(this, replace);
	    };
	    MemoryStream.prototype.remember = function () {
	        return this;
	    };
	    MemoryStream.prototype.debug = function (labelOrSpy) {
	        return _super.prototype.debug.call(this, labelOrSpy);
	    };
	    return MemoryStream;
	}(Stream));
	exports.MemoryStream = MemoryStream;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Stream;
	//# sourceMappingURL=index.js.map

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(4);


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _ponyfill = __webpack_require__(6);
	
	var _ponyfill2 = _interopRequireDefault(_ponyfill);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var root; /* global window */
	
	
	if (typeof self !== 'undefined') {
	  root = self;
	} else if (typeof window !== 'undefined') {
	  root = window;
	} else if (typeof global !== 'undefined') {
	  root = global;
	} else if (true) {
	  root = module;
	} else {
	  root = Function('return this')();
	}
	
	var result = (0, _ponyfill2['default'])(root);
	exports['default'] = result;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(5)(module)))

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports['default'] = symbolObservablePonyfill;
	function symbolObservablePonyfill(root) {
		var result;
		var _Symbol = root.Symbol;
	
		if (typeof _Symbol === 'function') {
			if (_Symbol.observable) {
				result = _Symbol.observable;
			} else {
				result = _Symbol('observable');
				_Symbol.observable = result;
			}
		} else {
			result = '@@observable';
		}
	
		return result;
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	var adaptStream = function (x) { return x; };
	function setAdapt(f) {
	    adaptStream = f;
	}
	exports.setAdapt = setAdapt;
	function adapt(stream) {
	    return adaptStream(stream);
	}
	exports.adapt = adapt;
	//# sourceMappingURL=adapt.js.map

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __assign = (this && this.__assign) || Object.assign || function(t) {
	    for (var s, i = 1, n = arguments.length; i < n; i++) {
	        s = arguments[i];
	        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	            t[p] = s[p];
	    }
	    return t;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	var routes_1 = __webpack_require__(9);
	var layout_1 = __webpack_require__(138);
	function main(sources) {
	    var history$ = sources.history.debug();
	    var sinks$ = history$
	        .map(function (route) { return routes_1.resolve(route.hash); })
	        .map(function (resolution) { return resolution.component(__assign({}, sources, resolution.sources)); });
	    return layout_1.Layout(__assign({}, sources, { sinks$: sinks$ }));
	}
	exports.default = main;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var routes_1 = __webpack_require__(10);
	var switch_path_1 = __webpack_require__(136);
	function resolveImplementation(routes, route) {
	    var _a = switch_path_1.default((route || '#/').replace('#', ''), routes), path = _a.path, value = _a.value;
	    var resolution = value;
	    return {
	        path: path,
	        component: resolution.component,
	        sources: resolution.sources
	    };
	}
	function resolve(route) {
	    return resolveImplementation(routes_1.routes, route);
	}
	exports.resolve = resolve;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var home_1 = __webpack_require__(11);
	var event_detail_1 = __webpack_require__(133);
	var xstream_1 = __webpack_require__(12);
	exports.routes = {
	    '/': { component: home_1.default },
	    '/events/:event_url': function (event_url) { return ({ component: event_detail_1.EventDetail, sources: { eventUrl$: xstream_1.Stream.of(event_url) } }); }
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var xstream_1 = __webpack_require__(12);
	var dom_1 = __webpack_require__(13);
	var events_1 = __webpack_require__(114);
	var event_1 = __webpack_require__(131);
	var delay_1 = __webpack_require__(132);
	var eventHash = location.hash.match('/register/') ? "" : location.hash.replace("#/", "");
	var eventRegisterHash = location.hash.match('/register/') ? location.hash.replace("#/register/", "") : "";
	function getFormData(form) {
	    return {
	        name: form.elements['name'].value,
	        email: form.elements['email'].value,
	        mobile: form.elements['mobile'].value,
	        present: form.elements['presentCheckbox'].checked,
	        title: form.elements['title'] && form.elements['title'].value,
	        abstract: form.elements['abstract'] && form.elements['abstract'].value,
	    };
	}
	function closest(el, selector) {
	    var retval = undefined;
	    while (el) {
	        if (el.matches(selector)) {
	            retval = el;
	            break;
	        }
	        el = el.parentElement;
	    }
	    return retval;
	}
	function home(sources) {
	    var xs = xstream_1.Stream;
	    var dom = sources.dom;
	    var presentClick$ = dom
	        .select('#present')
	        .events('click');
	    var presentCheckboxClick$ = dom
	        .select('#presentCheckbox')
	        .events('click');
	    var present$ = presentClick$
	        .map(function (ev) {
	        var labelElement = ev.currentTarget;
	        var isLabel = labelElement === ev.target;
	        var checkBoxElement = labelElement.children[0];
	        if (isLabel) {
	            checkBoxElement.checked = !checkBoxElement.checked;
	        }
	        return checkBoxElement.checked;
	    })
	        .startWith(false);
	    var route$ = sources.routes.route$;
	    var events$ = sources.events.events$.remember();
	    var registration$ = sources.registrations.registration$;
	    var moreClick$ = dom
	        .select('.more')
	        .events('click');
	    var more$ = moreClick$
	        .map(function (ev) { return true; })
	        .startWith(false);
	    var eventClick$ = dom
	        .select('.event.card:not(.expanded)')
	        .events('click');
	    var navigateTo$ = eventClick$
	        .map(function (ev) { return '#/events/' + ev.currentTarget.attributes['data-url'].value; });
	    var shrinkEventClick$ = dom
	        .select('.shrink')
	        .events('click');
	    var shorten$ = xs.merge(navigateTo$
	        .filter(function (e) { return e !== '' && e !== '/'; })
	        .map(function () { return xs.of(false); }), shrinkEventClick$
	        .map(function (ev) { return xs.of(true); })).flatten()
	        .startWith(true);
	    var joinEventClick$ = dom
	        .select('.join.event')
	        .events('click');
	    var formCloseClick$ = dom
	        .select('button.close')
	        .events('click');
	    var join$ = xs.merge(joinEventClick$
	        .map(function (ev) {
	        var anchor = ev.currentTarget;
	        var card = closest(anchor, '.event.card');
	        anchor.classList.add('expand');
	        return xs.of(card.attributes['data-url'].value);
	    }), formCloseClick$
	        .map(function (ev) {
	        var closeButton = ev.currentTarget;
	        var card = closest(closeButton, '.event.card');
	        var anchor = card.querySelector('.join.event');
	        anchor.classList.remove('expand');
	        return xs.of('');
	    })).flatten().startWith(eventRegisterHash);
	    var formClick$ = dom
	        .select('.form.event')
	        .events('click');
	    var formSubmit$ = dom
	        .select('.form.event button[type=submit]')
	        .events('click');
	    var formSubmitRequest$ = events$
	        .map(function (events) {
	        return formSubmit$
	            .filter(function (ev) {
	            // TODO: Validate
	            var buttonElement = ev.currentTarget;
	            var formElement = closest(buttonElement, 'form');
	            var invalidElements = formElement.querySelectorAll('.is-invalid');
	            return invalidElements.length === 0;
	        })
	            .map(function (ev) {
	            var buttonElement = ev.currentTarget;
	            var formElement = closest(buttonElement, 'form');
	            var cardElement = closest(formElement, '.event.card');
	            var eventUrl = cardElement.attributes['data-url'].value;
	            var event = events.find(function (event) { return event.url === eventUrl; });
	            var request = {
	                event: event,
	                data: getFormData(formElement)
	            };
	            return request;
	        });
	    }).flatten();
	    var registrationSuccessfulUrl$ = registration$
	        .filter(Boolean)
	        .map(function (reg) { return reg.event_url; })
	        .startWith('its-real-time');
	    var currentDate = new Date();
	    var vdom$ = xs.combine(events$, more$, shorten$, join$, registrationSuccessfulUrl$, present$)
	        .map(function (_a) {
	        var events = _a[0], more = _a[1], shorten = _a[2], join = _a[3], registrationSuccessfulUrl = _a[4], present = _a[5];
	        return dom_1.main(events_1.topEvents(events).map(function (event) { return event_1.renderEvent(event, join, shorten, registrationSuccessfulUrl, present); }).concat(events_1.moreEvents(events, more).map(function (event) { return event_1.renderEvent(event, join, shorten, registrationSuccessfulUrl, present); }), [
	            dom_1.nav([
	                dom_1.a('.more', {
	                    props: { href: '#', title: 'view all previous events' },
	                    attrs: { style: more ? 'display: none;' : '' }
	                }, [
	                    'Past events',
	                    dom_1.button([
	                        dom_1.i('.material-icons', { props: { role: 'presentation' } }, 'arrow_forward')
	                    ])
	                ])
	            ])
	        ]));
	    });
	    var prevent$ = xs.merge(moreClick$, eventClick$, shrinkEventClick$, joinEventClick$, formClick$, formCloseClick$, formSubmit$, presentClick$);
	    presentCheckboxClick$.addListener({
	        next: function (ev) {
	            ev.preventDefault();
	            ev.stopPropagation();
	            var checkbox = ev.target;
	            checkbox.checked = !checkbox.checked;
	            setTimeout(function () { return checkbox.parentElement.click(); }, 30);
	        },
	        error: function () { },
	        complete: function () { }
	    });
	    var refresh$ = vdom$.compose(delay_1.default(30)).mapTo(true);
	    return {
	        dom: vdom$,
	        events: xs.empty(),
	        routes: xs.empty(),
	        prevent: prevent$,
	        registrations: formSubmitRequest$,
	        history: navigateTo$,
	        material: refresh$
	    };
	}
	exports.default = home;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var symbol_observable_1 = __webpack_require__(3);
	var NO = {};
	exports.NO = NO;
	function noop() { }
	function cp(a) {
	    var l = a.length;
	    var b = Array(l);
	    for (var i = 0; i < l; ++i)
	        b[i] = a[i];
	    return b;
	}
	function and(f1, f2) {
	    return function andFn(t) {
	        return f1(t) && f2(t);
	    };
	}
	function _try(c, t, u) {
	    try {
	        return c.f(t);
	    }
	    catch (e) {
	        u._e(e);
	        return NO;
	    }
	}
	var NO_IL = {
	    _n: noop,
	    _e: noop,
	    _c: noop,
	};
	exports.NO_IL = NO_IL;
	// mutates the input
	function internalizeProducer(producer) {
	    producer._start = function _start(il) {
	        il.next = il._n;
	        il.error = il._e;
	        il.complete = il._c;
	        this.start(il);
	    };
	    producer._stop = producer.stop;
	}
	var StreamSub = (function () {
	    function StreamSub(_stream, _listener) {
	        this._stream = _stream;
	        this._listener = _listener;
	    }
	    StreamSub.prototype.unsubscribe = function () {
	        this._stream.removeListener(this._listener);
	    };
	    return StreamSub;
	}());
	var Observer = (function () {
	    function Observer(_listener) {
	        this._listener = _listener;
	    }
	    Observer.prototype.next = function (value) {
	        this._listener._n(value);
	    };
	    Observer.prototype.error = function (err) {
	        this._listener._e(err);
	    };
	    Observer.prototype.complete = function () {
	        this._listener._c();
	    };
	    return Observer;
	}());
	var FromObservable = (function () {
	    function FromObservable(observable) {
	        this.type = 'fromObservable';
	        this.ins = observable;
	        this.active = false;
	    }
	    FromObservable.prototype._start = function (out) {
	        this.out = out;
	        this.active = true;
	        this._sub = this.ins.subscribe(new Observer(out));
	        if (!this.active)
	            this._sub.unsubscribe();
	    };
	    FromObservable.prototype._stop = function () {
	        if (this._sub)
	            this._sub.unsubscribe();
	        this.active = false;
	    };
	    return FromObservable;
	}());
	var Merge = (function () {
	    function Merge(insArr) {
	        this.type = 'merge';
	        this.insArr = insArr;
	        this.out = NO;
	        this.ac = 0;
	    }
	    Merge.prototype._start = function (out) {
	        this.out = out;
	        var s = this.insArr;
	        var L = s.length;
	        this.ac = L;
	        for (var i = 0; i < L; i++)
	            s[i]._add(this);
	    };
	    Merge.prototype._stop = function () {
	        var s = this.insArr;
	        var L = s.length;
	        for (var i = 0; i < L; i++)
	            s[i]._remove(this);
	        this.out = NO;
	    };
	    Merge.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._n(t);
	    };
	    Merge.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Merge.prototype._c = function () {
	        if (--this.ac <= 0) {
	            var u = this.out;
	            if (u === NO)
	                return;
	            u._c();
	        }
	    };
	    return Merge;
	}());
	var CombineListener = (function () {
	    function CombineListener(i, out, p) {
	        this.i = i;
	        this.out = out;
	        this.p = p;
	        p.ils.push(this);
	    }
	    CombineListener.prototype._n = function (t) {
	        var p = this.p, out = this.out;
	        if (out === NO)
	            return;
	        if (p.up(t, this.i))
	            out._n(p.vals);
	    };
	    CombineListener.prototype._e = function (err) {
	        var out = this.out;
	        if (out === NO)
	            return;
	        out._e(err);
	    };
	    CombineListener.prototype._c = function () {
	        var p = this.p;
	        if (p.out === NO)
	            return;
	        if (--p.Nc === 0)
	            p.out._c();
	    };
	    return CombineListener;
	}());
	var Combine = (function () {
	    function Combine(insArr) {
	        this.type = 'combine';
	        this.insArr = insArr;
	        this.out = NO;
	        this.ils = [];
	        this.Nc = this.Nn = 0;
	        this.vals = [];
	    }
	    Combine.prototype.up = function (t, i) {
	        var v = this.vals[i];
	        var Nn = !this.Nn ? 0 : v === NO ? --this.Nn : this.Nn;
	        this.vals[i] = t;
	        return Nn === 0;
	    };
	    Combine.prototype._start = function (out) {
	        this.out = out;
	        var s = this.insArr;
	        var n = this.Nc = this.Nn = s.length;
	        var vals = this.vals = new Array(n);
	        if (n === 0) {
	            out._n([]);
	            out._c();
	        }
	        else {
	            for (var i = 0; i < n; i++) {
	                vals[i] = NO;
	                s[i]._add(new CombineListener(i, out, this));
	            }
	        }
	    };
	    Combine.prototype._stop = function () {
	        var s = this.insArr;
	        var n = s.length;
	        var ils = this.ils;
	        for (var i = 0; i < n; i++)
	            s[i]._remove(ils[i]);
	        this.out = NO;
	        this.ils = [];
	        this.vals = [];
	    };
	    return Combine;
	}());
	var FromArray = (function () {
	    function FromArray(a) {
	        this.type = 'fromArray';
	        this.a = a;
	    }
	    FromArray.prototype._start = function (out) {
	        var a = this.a;
	        for (var i = 0, n = a.length; i < n; i++)
	            out._n(a[i]);
	        out._c();
	    };
	    FromArray.prototype._stop = function () {
	    };
	    return FromArray;
	}());
	var FromPromise = (function () {
	    function FromPromise(p) {
	        this.type = 'fromPromise';
	        this.on = false;
	        this.p = p;
	    }
	    FromPromise.prototype._start = function (out) {
	        var prod = this;
	        this.on = true;
	        this.p.then(function (v) {
	            if (prod.on) {
	                out._n(v);
	                out._c();
	            }
	        }, function (e) {
	            out._e(e);
	        }).then(noop, function (err) {
	            setTimeout(function () { throw err; });
	        });
	    };
	    FromPromise.prototype._stop = function () {
	        this.on = false;
	    };
	    return FromPromise;
	}());
	var Periodic = (function () {
	    function Periodic(period) {
	        this.type = 'periodic';
	        this.period = period;
	        this.intervalID = -1;
	        this.i = 0;
	    }
	    Periodic.prototype._start = function (out) {
	        var self = this;
	        function intervalHandler() { out._n(self.i++); }
	        this.intervalID = setInterval(intervalHandler, this.period);
	    };
	    Periodic.prototype._stop = function () {
	        if (this.intervalID !== -1)
	            clearInterval(this.intervalID);
	        this.intervalID = -1;
	        this.i = 0;
	    };
	    return Periodic;
	}());
	var Debug = (function () {
	    function Debug(ins, arg) {
	        this.type = 'debug';
	        this.ins = ins;
	        this.out = NO;
	        this.s = noop;
	        this.l = '';
	        if (typeof arg === 'string')
	            this.l = arg;
	        else if (typeof arg === 'function')
	            this.s = arg;
	    }
	    Debug.prototype._start = function (out) {
	        this.out = out;
	        this.ins._add(this);
	    };
	    Debug.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	    };
	    Debug.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        var s = this.s, l = this.l;
	        if (s !== noop) {
	            try {
	                s(t);
	            }
	            catch (e) {
	                u._e(e);
	            }
	        }
	        else if (l)
	            console.log(l + ':', t);
	        else
	            console.log(t);
	        u._n(t);
	    };
	    Debug.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Debug.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    return Debug;
	}());
	var Drop = (function () {
	    function Drop(max, ins) {
	        this.type = 'drop';
	        this.ins = ins;
	        this.out = NO;
	        this.max = max;
	        this.dropped = 0;
	    }
	    Drop.prototype._start = function (out) {
	        this.out = out;
	        this.dropped = 0;
	        this.ins._add(this);
	    };
	    Drop.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	    };
	    Drop.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        if (this.dropped++ >= this.max)
	            u._n(t);
	    };
	    Drop.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Drop.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    return Drop;
	}());
	var EndWhenListener = (function () {
	    function EndWhenListener(out, op) {
	        this.out = out;
	        this.op = op;
	    }
	    EndWhenListener.prototype._n = function () {
	        this.op.end();
	    };
	    EndWhenListener.prototype._e = function (err) {
	        this.out._e(err);
	    };
	    EndWhenListener.prototype._c = function () {
	        this.op.end();
	    };
	    return EndWhenListener;
	}());
	var EndWhen = (function () {
	    function EndWhen(o, ins) {
	        this.type = 'endWhen';
	        this.ins = ins;
	        this.out = NO;
	        this.o = o;
	        this.oil = NO_IL;
	    }
	    EndWhen.prototype._start = function (out) {
	        this.out = out;
	        this.o._add(this.oil = new EndWhenListener(out, this));
	        this.ins._add(this);
	    };
	    EndWhen.prototype._stop = function () {
	        this.ins._remove(this);
	        this.o._remove(this.oil);
	        this.out = NO;
	        this.oil = NO_IL;
	    };
	    EndWhen.prototype.end = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    EndWhen.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._n(t);
	    };
	    EndWhen.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    EndWhen.prototype._c = function () {
	        this.end();
	    };
	    return EndWhen;
	}());
	var Filter = (function () {
	    function Filter(passes, ins) {
	        this.type = 'filter';
	        this.ins = ins;
	        this.out = NO;
	        this.f = passes;
	    }
	    Filter.prototype._start = function (out) {
	        this.out = out;
	        this.ins._add(this);
	    };
	    Filter.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	    };
	    Filter.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        var r = _try(this, t, u);
	        if (r === NO || !r)
	            return;
	        u._n(t);
	    };
	    Filter.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Filter.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    return Filter;
	}());
	var FlattenListener = (function () {
	    function FlattenListener(out, op) {
	        this.out = out;
	        this.op = op;
	    }
	    FlattenListener.prototype._n = function (t) {
	        this.out._n(t);
	    };
	    FlattenListener.prototype._e = function (err) {
	        this.out._e(err);
	    };
	    FlattenListener.prototype._c = function () {
	        this.op.inner = NO;
	        this.op.less();
	    };
	    return FlattenListener;
	}());
	var Flatten = (function () {
	    function Flatten(ins) {
	        this.type = 'flatten';
	        this.ins = ins;
	        this.out = NO;
	        this.open = true;
	        this.inner = NO;
	        this.il = NO_IL;
	    }
	    Flatten.prototype._start = function (out) {
	        this.out = out;
	        this.open = true;
	        this.inner = NO;
	        this.il = NO_IL;
	        this.ins._add(this);
	    };
	    Flatten.prototype._stop = function () {
	        this.ins._remove(this);
	        if (this.inner !== NO)
	            this.inner._remove(this.il);
	        this.out = NO;
	        this.open = true;
	        this.inner = NO;
	        this.il = NO_IL;
	    };
	    Flatten.prototype.less = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        if (!this.open && this.inner === NO)
	            u._c();
	    };
	    Flatten.prototype._n = function (s) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        var _a = this, inner = _a.inner, il = _a.il;
	        if (inner !== NO && il !== NO_IL)
	            inner._remove(il);
	        (this.inner = s)._add(this.il = new FlattenListener(u, this));
	    };
	    Flatten.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Flatten.prototype._c = function () {
	        this.open = false;
	        this.less();
	    };
	    return Flatten;
	}());
	var Fold = (function () {
	    function Fold(f, seed, ins) {
	        var _this = this;
	        this.type = 'fold';
	        this.ins = ins;
	        this.out = NO;
	        this.f = function (t) { return f(_this.acc, t); };
	        this.acc = this.seed = seed;
	    }
	    Fold.prototype._start = function (out) {
	        this.out = out;
	        this.acc = this.seed;
	        out._n(this.acc);
	        this.ins._add(this);
	    };
	    Fold.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	        this.acc = this.seed;
	    };
	    Fold.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        var r = _try(this, t, u);
	        if (r === NO)
	            return;
	        u._n(this.acc = r);
	    };
	    Fold.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Fold.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    return Fold;
	}());
	var Last = (function () {
	    function Last(ins) {
	        this.type = 'last';
	        this.ins = ins;
	        this.out = NO;
	        this.has = false;
	        this.val = NO;
	    }
	    Last.prototype._start = function (out) {
	        this.out = out;
	        this.has = false;
	        this.ins._add(this);
	    };
	    Last.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	        this.val = NO;
	    };
	    Last.prototype._n = function (t) {
	        this.has = true;
	        this.val = t;
	    };
	    Last.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Last.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        if (this.has) {
	            u._n(this.val);
	            u._c();
	        }
	        else
	            u._e(new Error('last() failed because input stream completed'));
	    };
	    return Last;
	}());
	var MapFlattenListener = (function () {
	    function MapFlattenListener(out, op) {
	        this.out = out;
	        this.op = op;
	    }
	    MapFlattenListener.prototype._n = function (r) {
	        this.out._n(r);
	    };
	    MapFlattenListener.prototype._e = function (err) {
	        this.out._e(err);
	    };
	    MapFlattenListener.prototype._c = function () {
	        this.op.inner = NO;
	        this.op.less();
	    };
	    return MapFlattenListener;
	}());
	var MapFlatten = (function () {
	    function MapFlatten(mapOp) {
	        this.type = mapOp.type + "+flatten";
	        this.ins = mapOp.ins;
	        this.out = NO;
	        this.mapOp = mapOp;
	        this.inner = NO;
	        this.il = NO_IL;
	        this.open = true;
	    }
	    MapFlatten.prototype._start = function (out) {
	        this.out = out;
	        this.inner = NO;
	        this.il = NO_IL;
	        this.open = true;
	        this.mapOp.ins._add(this);
	    };
	    MapFlatten.prototype._stop = function () {
	        this.mapOp.ins._remove(this);
	        if (this.inner !== NO)
	            this.inner._remove(this.il);
	        this.out = NO;
	        this.inner = NO;
	        this.il = NO_IL;
	    };
	    MapFlatten.prototype.less = function () {
	        if (!this.open && this.inner === NO) {
	            var u = this.out;
	            if (u === NO)
	                return;
	            u._c();
	        }
	    };
	    MapFlatten.prototype._n = function (v) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        var _a = this, inner = _a.inner, il = _a.il;
	        var s = _try(this.mapOp, v, u);
	        if (s === NO)
	            return;
	        if (inner !== NO && il !== NO_IL)
	            inner._remove(il);
	        (this.inner = s)._add(this.il = new MapFlattenListener(u, this));
	    };
	    MapFlatten.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    MapFlatten.prototype._c = function () {
	        this.open = false;
	        this.less();
	    };
	    return MapFlatten;
	}());
	var MapOp = (function () {
	    function MapOp(project, ins) {
	        this.type = 'map';
	        this.ins = ins;
	        this.out = NO;
	        this.f = project;
	    }
	    MapOp.prototype._start = function (out) {
	        this.out = out;
	        this.ins._add(this);
	    };
	    MapOp.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	    };
	    MapOp.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        var r = _try(this, t, u);
	        if (r === NO)
	            return;
	        u._n(r);
	    };
	    MapOp.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    MapOp.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    return MapOp;
	}());
	var FilterMapFusion = (function (_super) {
	    __extends(FilterMapFusion, _super);
	    function FilterMapFusion(passes, project, ins) {
	        var _this = _super.call(this, project, ins) || this;
	        _this.type = 'filter+map';
	        _this.passes = passes;
	        return _this;
	    }
	    FilterMapFusion.prototype._n = function (t) {
	        if (!this.passes(t))
	            return;
	        var u = this.out;
	        if (u === NO)
	            return;
	        var r = _try(this, t, u);
	        if (r === NO)
	            return;
	        u._n(r);
	    };
	    return FilterMapFusion;
	}(MapOp));
	var Remember = (function () {
	    function Remember(ins) {
	        this.type = 'remember';
	        this.ins = ins;
	        this.out = NO;
	    }
	    Remember.prototype._start = function (out) {
	        this.out = out;
	        this.ins._add(out);
	    };
	    Remember.prototype._stop = function () {
	        this.ins._remove(this.out);
	        this.out = NO;
	    };
	    return Remember;
	}());
	var ReplaceError = (function () {
	    function ReplaceError(replacer, ins) {
	        this.type = 'replaceError';
	        this.ins = ins;
	        this.out = NO;
	        this.f = replacer;
	    }
	    ReplaceError.prototype._start = function (out) {
	        this.out = out;
	        this.ins._add(this);
	    };
	    ReplaceError.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	    };
	    ReplaceError.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._n(t);
	    };
	    ReplaceError.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        try {
	            this.ins._remove(this);
	            (this.ins = this.f(err))._add(this);
	        }
	        catch (e) {
	            u._e(e);
	        }
	    };
	    ReplaceError.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    return ReplaceError;
	}());
	var StartWith = (function () {
	    function StartWith(ins, val) {
	        this.type = 'startWith';
	        this.ins = ins;
	        this.out = NO;
	        this.val = val;
	    }
	    StartWith.prototype._start = function (out) {
	        this.out = out;
	        this.out._n(this.val);
	        this.ins._add(out);
	    };
	    StartWith.prototype._stop = function () {
	        this.ins._remove(this.out);
	        this.out = NO;
	    };
	    return StartWith;
	}());
	var Take = (function () {
	    function Take(max, ins) {
	        this.type = 'take';
	        this.ins = ins;
	        this.out = NO;
	        this.max = max;
	        this.taken = 0;
	    }
	    Take.prototype._start = function (out) {
	        this.out = out;
	        this.taken = 0;
	        if (this.max <= 0)
	            out._c();
	        else
	            this.ins._add(this);
	    };
	    Take.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = NO;
	    };
	    Take.prototype._n = function (t) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        var m = ++this.taken;
	        if (m < this.max)
	            u._n(t);
	        else if (m === this.max) {
	            u._n(t);
	            u._c();
	        }
	    };
	    Take.prototype._e = function (err) {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._e(err);
	    };
	    Take.prototype._c = function () {
	        var u = this.out;
	        if (u === NO)
	            return;
	        u._c();
	    };
	    return Take;
	}());
	var Stream = (function () {
	    function Stream(producer) {
	        this._prod = producer || NO;
	        this._ils = [];
	        this._stopID = NO;
	        this._dl = NO;
	        this._d = false;
	        this._target = NO;
	        this._err = NO;
	    }
	    Stream.prototype._n = function (t) {
	        var a = this._ils;
	        var L = a.length;
	        if (this._d)
	            this._dl._n(t);
	        if (L == 1)
	            a[0]._n(t);
	        else if (L == 0)
	            return;
	        else {
	            var b = cp(a);
	            for (var i = 0; i < L; i++)
	                b[i]._n(t);
	        }
	    };
	    Stream.prototype._e = function (err) {
	        if (this._err !== NO)
	            return;
	        this._err = err;
	        var a = this._ils;
	        var L = a.length;
	        this._x();
	        if (this._d)
	            this._dl._e(err);
	        if (L == 1)
	            a[0]._e(err);
	        else if (L == 0)
	            return;
	        else {
	            var b = cp(a);
	            for (var i = 0; i < L; i++)
	                b[i]._e(err);
	        }
	        if (!this._d && L == 0)
	            throw this._err;
	    };
	    Stream.prototype._c = function () {
	        var a = this._ils;
	        var L = a.length;
	        this._x();
	        if (this._d)
	            this._dl._c();
	        if (L == 1)
	            a[0]._c();
	        else if (L == 0)
	            return;
	        else {
	            var b = cp(a);
	            for (var i = 0; i < L; i++)
	                b[i]._c();
	        }
	    };
	    Stream.prototype._x = function () {
	        if (this._ils.length === 0)
	            return;
	        if (this._prod !== NO)
	            this._prod._stop();
	        this._err = NO;
	        this._ils = [];
	    };
	    Stream.prototype._stopNow = function () {
	        // WARNING: code that calls this method should
	        // first check if this._prod is valid (not `NO`)
	        this._prod._stop();
	        this._err = NO;
	        this._stopID = NO;
	    };
	    Stream.prototype._add = function (il) {
	        var ta = this._target;
	        if (ta !== NO)
	            return ta._add(il);
	        var a = this._ils;
	        a.push(il);
	        if (a.length > 1)
	            return;
	        if (this._stopID !== NO) {
	            clearTimeout(this._stopID);
	            this._stopID = NO;
	        }
	        else {
	            var p = this._prod;
	            if (p !== NO)
	                p._start(this);
	        }
	    };
	    Stream.prototype._remove = function (il) {
	        var _this = this;
	        var ta = this._target;
	        if (ta !== NO)
	            return ta._remove(il);
	        var a = this._ils;
	        var i = a.indexOf(il);
	        if (i > -1) {
	            a.splice(i, 1);
	            if (this._prod !== NO && a.length <= 0) {
	                this._err = NO;
	                this._stopID = setTimeout(function () { return _this._stopNow(); });
	            }
	            else if (a.length === 1) {
	                this._pruneCycles();
	            }
	        }
	    };
	    // If all paths stemming from `this` stream eventually end at `this`
	    // stream, then we remove the single listener of `this` stream, to
	    // force it to end its execution and dispose resources. This method
	    // assumes as a precondition that this._ils has just one listener.
	    Stream.prototype._pruneCycles = function () {
	        if (this._hasNoSinks(this, []))
	            this._remove(this._ils[0]);
	    };
	    // Checks whether *there is no* path starting from `x` that leads to an end
	    // listener (sink) in the stream graph, following edges A->B where B is a
	    // listener of A. This means these paths constitute a cycle somehow. Is given
	    // a trace of all visited nodes so far.
	    Stream.prototype._hasNoSinks = function (x, trace) {
	        if (trace.indexOf(x) !== -1)
	            return true;
	        else if (x.out === this)
	            return true;
	        else if (x.out && x.out !== NO)
	            return this._hasNoSinks(x.out, trace.concat(x));
	        else if (x._ils) {
	            for (var i = 0, N = x._ils.length; i < N; i++)
	                if (!this._hasNoSinks(x._ils[i], trace.concat(x)))
	                    return false;
	            return true;
	        }
	        else
	            return false;
	    };
	    Stream.prototype.ctor = function () {
	        return this instanceof MemoryStream ? MemoryStream : Stream;
	    };
	    /**
	     * Adds a Listener to the Stream.
	     *
	     * @param {Listener} listener
	     */
	    Stream.prototype.addListener = function (listener) {
	        listener._n = listener.next || noop;
	        listener._e = listener.error || noop;
	        listener._c = listener.complete || noop;
	        this._add(listener);
	    };
	    /**
	     * Removes a Listener from the Stream, assuming the Listener was added to it.
	     *
	     * @param {Listener<T>} listener
	     */
	    Stream.prototype.removeListener = function (listener) {
	        this._remove(listener);
	    };
	    /**
	     * Adds a Listener to the Stream returning a Subscription to remove that
	     * listener.
	     *
	     * @param {Listener} listener
	     * @returns {Subscription}
	     */
	    Stream.prototype.subscribe = function (listener) {
	        this.addListener(listener);
	        return new StreamSub(this, listener);
	    };
	    /**
	     * Add interop between most.js and RxJS 5
	     *
	     * @returns {Stream}
	     */
	    Stream.prototype[symbol_observable_1.default] = function () {
	        return this;
	    };
	    /**
	     * Creates a new Stream given a Producer.
	     *
	     * @factory true
	     * @param {Producer} producer An optional Producer that dictates how to
	     * start, generate events, and stop the Stream.
	     * @return {Stream}
	     */
	    Stream.create = function (producer) {
	        if (producer) {
	            if (typeof producer.start !== 'function'
	                || typeof producer.stop !== 'function')
	                throw new Error('producer requires both start and stop functions');
	            internalizeProducer(producer); // mutates the input
	        }
	        return new Stream(producer);
	    };
	    /**
	     * Creates a new MemoryStream given a Producer.
	     *
	     * @factory true
	     * @param {Producer} producer An optional Producer that dictates how to
	     * start, generate events, and stop the Stream.
	     * @return {MemoryStream}
	     */
	    Stream.createWithMemory = function (producer) {
	        if (producer)
	            internalizeProducer(producer); // mutates the input
	        return new MemoryStream(producer);
	    };
	    /**
	     * Creates a Stream that does nothing when started. It never emits any event.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     *          never
	     * -----------------------
	     * ```
	     *
	     * @factory true
	     * @return {Stream}
	     */
	    Stream.never = function () {
	        return new Stream({ _start: noop, _stop: noop });
	    };
	    /**
	     * Creates a Stream that immediately emits the "complete" notification when
	     * started, and that's it.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * empty
	     * -|
	     * ```
	     *
	     * @factory true
	     * @return {Stream}
	     */
	    Stream.empty = function () {
	        return new Stream({
	            _start: function (il) { il._c(); },
	            _stop: noop,
	        });
	    };
	    /**
	     * Creates a Stream that immediately emits an "error" notification with the
	     * value you passed as the `error` argument when the stream starts, and that's
	     * it.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * throw(X)
	     * -X
	     * ```
	     *
	     * @factory true
	     * @param error The error event to emit on the created stream.
	     * @return {Stream}
	     */
	    Stream.throw = function (error) {
	        return new Stream({
	            _start: function (il) { il._e(error); },
	            _stop: noop,
	        });
	    };
	    /**
	     * Creates a stream from an Array, Promise, or an Observable.
	     *
	     * @factory true
	     * @param {Array|Promise|Observable} input The input to make a stream from.
	     * @return {Stream}
	     */
	    Stream.from = function (input) {
	        if (typeof input[symbol_observable_1.default] === 'function')
	            return Stream.fromObservable(input);
	        else if (typeof input.then === 'function')
	            return Stream.fromPromise(input);
	        else if (Array.isArray(input))
	            return Stream.fromArray(input);
	        throw new TypeError("Type of input to from() must be an Array, Promise, or Observable");
	    };
	    /**
	     * Creates a Stream that immediately emits the arguments that you give to
	     * *of*, then completes.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * of(1,2,3)
	     * 123|
	     * ```
	     *
	     * @factory true
	     * @param a The first value you want to emit as an event on the stream.
	     * @param b The second value you want to emit as an event on the stream. One
	     * or more of these values may be given as arguments.
	     * @return {Stream}
	     */
	    Stream.of = function () {
	        var items = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            items[_i] = arguments[_i];
	        }
	        return Stream.fromArray(items);
	    };
	    /**
	     * Converts an array to a stream. The returned stream will emit synchronously
	     * all the items in the array, and then complete.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * fromArray([1,2,3])
	     * 123|
	     * ```
	     *
	     * @factory true
	     * @param {Array} array The array to be converted as a stream.
	     * @return {Stream}
	     */
	    Stream.fromArray = function (array) {
	        return new Stream(new FromArray(array));
	    };
	    /**
	     * Converts a promise to a stream. The returned stream will emit the resolved
	     * value of the promise, and then complete. However, if the promise is
	     * rejected, the stream will emit the corresponding error.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * fromPromise( ----42 )
	     * -----------------42|
	     * ```
	     *
	     * @factory true
	     * @param {Promise} promise The promise to be converted as a stream.
	     * @return {Stream}
	     */
	    Stream.fromPromise = function (promise) {
	        return new Stream(new FromPromise(promise));
	    };
	    /**
	     * Converts an Observable into a Stream.
	     *
	     * @factory true
	     * @param {any} observable The observable to be converted as a stream.
	     * @return {Stream}
	     */
	    Stream.fromObservable = function (obs) {
	        if (obs.endWhen)
	            return obs;
	        return new Stream(new FromObservable(obs));
	    };
	    /**
	     * Creates a stream that periodically emits incremental numbers, every
	     * `period` milliseconds.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     *     periodic(1000)
	     * ---0---1---2---3---4---...
	     * ```
	     *
	     * @factory true
	     * @param {number} period The interval in milliseconds to use as a rate of
	     * emission.
	     * @return {Stream}
	     */
	    Stream.periodic = function (period) {
	        return new Stream(new Periodic(period));
	    };
	    Stream.prototype._map = function (project) {
	        var p = this._prod;
	        var ctor = this.ctor();
	        if (p instanceof Filter)
	            return new ctor(new FilterMapFusion(p.f, project, p.ins));
	        return new ctor(new MapOp(project, this));
	    };
	    /**
	     * Transforms each event from the input Stream through a `project` function,
	     * to get a Stream that emits those transformed events.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --1---3--5-----7------
	     *    map(i => i * 10)
	     * --10--30-50----70-----
	     * ```
	     *
	     * @param {Function} project A function of type `(t: T) => U` that takes event
	     * `t` of type `T` from the input Stream and produces an event of type `U`, to
	     * be emitted on the output Stream.
	     * @return {Stream}
	     */
	    Stream.prototype.map = function (project) {
	        return this._map(project);
	    };
	    /**
	     * It's like `map`, but transforms each input event to always the same
	     * constant value on the output Stream.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --1---3--5-----7-----
	     *       mapTo(10)
	     * --10--10-10----10----
	     * ```
	     *
	     * @param projectedValue A value to emit on the output Stream whenever the
	     * input Stream emits any value.
	     * @return {Stream}
	     */
	    Stream.prototype.mapTo = function (projectedValue) {
	        var s = this.map(function () { return projectedValue; });
	        var op = s._prod;
	        op.type = op.type.replace('map', 'mapTo');
	        return s;
	    };
	    /**
	     * Only allows events that pass the test given by the `passes` argument.
	     *
	     * Each event from the input stream is given to the `passes` function. If the
	     * function returns `true`, the event is forwarded to the output stream,
	     * otherwise it is ignored and not forwarded.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --1---2--3-----4-----5---6--7-8--
	     *     filter(i => i % 2 === 0)
	     * ------2--------4---------6----8--
	     * ```
	     *
	     * @param {Function} passes A function of type `(t: T) +> boolean` that takes
	     * an event from the input stream and checks if it passes, by returning a
	     * boolean.
	     * @return {Stream}
	     */
	    Stream.prototype.filter = function (passes) {
	        var p = this._prod;
	        if (p instanceof Filter)
	            return new Stream(new Filter(and(p.f, passes), p.ins));
	        return new Stream(new Filter(passes, this));
	    };
	    /**
	     * Lets the first `amount` many events from the input stream pass to the
	     * output stream, then makes the output stream complete.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --a---b--c----d---e--
	     *    take(3)
	     * --a---b--c|
	     * ```
	     *
	     * @param {number} amount How many events to allow from the input stream
	     * before completing the output stream.
	     * @return {Stream}
	     */
	    Stream.prototype.take = function (amount) {
	        return new (this.ctor())(new Take(amount, this));
	    };
	    /**
	     * Ignores the first `amount` many events from the input stream, and then
	     * after that starts forwarding events from the input stream to the output
	     * stream.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --a---b--c----d---e--
	     *       drop(3)
	     * --------------d---e--
	     * ```
	     *
	     * @param {number} amount How many events to ignore from the input stream
	     * before forwarding all events from the input stream to the output stream.
	     * @return {Stream}
	     */
	    Stream.prototype.drop = function (amount) {
	        return new Stream(new Drop(amount, this));
	    };
	    /**
	     * When the input stream completes, the output stream will emit the last event
	     * emitted by the input stream, and then will also complete.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --a---b--c--d----|
	     *       last()
	     * -----------------d|
	     * ```
	     *
	     * @return {Stream}
	     */
	    Stream.prototype.last = function () {
	        return new Stream(new Last(this));
	    };
	    /**
	     * Prepends the given `initial` value to the sequence of events emitted by the
	     * input stream. The returned stream is a MemoryStream, which means it is
	     * already `remember()`'d.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * ---1---2-----3---
	     *   startWith(0)
	     * 0--1---2-----3---
	     * ```
	     *
	     * @param initial The value or event to prepend.
	     * @return {MemoryStream}
	     */
	    Stream.prototype.startWith = function (initial) {
	        return new MemoryStream(new StartWith(this, initial));
	    };
	    /**
	     * Uses another stream to determine when to complete the current stream.
	     *
	     * When the given `other` stream emits an event or completes, the output
	     * stream will complete. Before that happens, the output stream will behaves
	     * like the input stream.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * ---1---2-----3--4----5----6---
	     *   endWhen( --------a--b--| )
	     * ---1---2-----3--4--|
	     * ```
	     *
	     * @param other Some other stream that is used to know when should the output
	     * stream of this operator complete.
	     * @return {Stream}
	     */
	    Stream.prototype.endWhen = function (other) {
	        return new (this.ctor())(new EndWhen(other, this));
	    };
	    /**
	     * "Folds" the stream onto itself.
	     *
	     * Combines events from the past throughout
	     * the entire execution of the input stream, allowing you to accumulate them
	     * together. It's essentially like `Array.prototype.reduce`. The returned
	     * stream is a MemoryStream, which means it is already `remember()`'d.
	     *
	     * The output stream starts by emitting the `seed` which you give as argument.
	     * Then, when an event happens on the input stream, it is combined with that
	     * seed value through the `accumulate` function, and the output value is
	     * emitted on the output stream. `fold` remembers that output value as `acc`
	     * ("accumulator"), and then when a new input event `t` happens, `acc` will be
	     * combined with that to produce the new `acc` and so forth.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * ------1-----1--2----1----1------
	     *   fold((acc, x) => acc + x, 3)
	     * 3-----4-----5--7----8----9------
	     * ```
	     *
	     * @param {Function} accumulate A function of type `(acc: R, t: T) => R` that
	     * takes the previous accumulated value `acc` and the incoming event from the
	     * input stream and produces the new accumulated value.
	     * @param seed The initial accumulated value, of type `R`.
	     * @return {MemoryStream}
	     */
	    Stream.prototype.fold = function (accumulate, seed) {
	        return new MemoryStream(new Fold(accumulate, seed, this));
	    };
	    /**
	     * Replaces an error with another stream.
	     *
	     * When (and if) an error happens on the input stream, instead of forwarding
	     * that error to the output stream, *replaceError* will call the `replace`
	     * function which returns the stream that the output stream will replicate.
	     * And, in case that new stream also emits an error, `replace` will be called
	     * again to get another stream to start replicating.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --1---2-----3--4-----X
	     *   replaceError( () => --10--| )
	     * --1---2-----3--4--------10--|
	     * ```
	     *
	     * @param {Function} replace A function of type `(err) => Stream` that takes
	     * the error that occurred on the input stream or on the previous replacement
	     * stream and returns a new stream. The output stream will behave like the
	     * stream that this function returns.
	     * @return {Stream}
	     */
	    Stream.prototype.replaceError = function (replace) {
	        return new (this.ctor())(new ReplaceError(replace, this));
	    };
	    /**
	     * Flattens a "stream of streams", handling only one nested stream at a time
	     * (no concurrency).
	     *
	     * If the input stream is a stream that emits streams, then this operator will
	     * return an output stream which is a flat stream: emits regular events. The
	     * flattening happens without concurrency. It works like this: when the input
	     * stream emits a nested stream, *flatten* will start imitating that nested
	     * one. However, as soon as the next nested stream is emitted on the input
	     * stream, *flatten* will forget the previous nested one it was imitating, and
	     * will start imitating the new nested one.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --+--------+---------------
	     *   \        \
	     *    \       ----1----2---3--
	     *    --a--b----c----d--------
	     *           flatten
	     * -----a--b------1----2---3--
	     * ```
	     *
	     * @return {Stream}
	     */
	    Stream.prototype.flatten = function () {
	        var p = this._prod;
	        return new Stream(p instanceof MapOp && !(p instanceof FilterMapFusion) ?
	            new MapFlatten(p) :
	            new Flatten(this));
	    };
	    /**
	     * Passes the input stream to a custom operator, to produce an output stream.
	     *
	     * *compose* is a handy way of using an existing function in a chained style.
	     * Instead of writing `outStream = f(inStream)` you can write
	     * `outStream = inStream.compose(f)`.
	     *
	     * @param {function} operator A function that takes a stream as input and
	     * returns a stream as well.
	     * @return {Stream}
	     */
	    Stream.prototype.compose = function (operator) {
	        return operator(this);
	    };
	    /**
	     * Returns an output stream that behaves like the input stream, but also
	     * remembers the most recent event that happens on the input stream, so that a
	     * newly added listener will immediately receive that memorised event.
	     *
	     * @return {MemoryStream}
	     */
	    Stream.prototype.remember = function () {
	        return new MemoryStream(new Remember(this));
	    };
	    /**
	     * Returns an output stream that identically behaves like the input stream,
	     * but also runs a `spy` function fo each event, to help you debug your app.
	     *
	     * *debug* takes a `spy` function as argument, and runs that for each event
	     * happening on the input stream. If you don't provide the `spy` argument,
	     * then *debug* will just `console.log` each event. This helps you to
	     * understand the flow of events through some operator chain.
	     *
	     * Please note that if the output stream has no listeners, then it will not
	     * start, which means `spy` will never run because no actual event happens in
	     * that case.
	     *
	     * Marble diagram:
	     *
	     * ```text
	     * --1----2-----3-----4--
	     *         debug
	     * --1----2-----3-----4--
	     * ```
	     *
	     * @param {function} labelOrSpy A string to use as the label when printing
	     * debug information on the console, or a 'spy' function that takes an event
	     * as argument, and does not need to return anything.
	     * @return {Stream}
	     */
	    Stream.prototype.debug = function (labelOrSpy) {
	        return new (this.ctor())(new Debug(this, labelOrSpy));
	    };
	    /**
	     * *imitate* changes this current Stream to emit the same events that the
	     * `other` given Stream does. This method returns nothing.
	     *
	     * This method exists to allow one thing: **circular dependency of streams**.
	     * For instance, let's imagine that for some reason you need to create a
	     * circular dependency where stream `first$` depends on stream `second$`
	     * which in turn depends on `first$`:
	     *
	     * <!-- skip-example -->
	     * ```js
	     * import delay from 'xstream/extra/delay'
	     *
	     * var first$ = second$.map(x => x * 10).take(3);
	     * var second$ = first$.map(x => x + 1).startWith(1).compose(delay(100));
	     * ```
	     *
	     * However, that is invalid JavaScript, because `second$` is undefined
	     * on the first line. This is how *imitate* can help solve it:
	     *
	     * ```js
	     * import delay from 'xstream/extra/delay'
	     *
	     * var secondProxy$ = xs.create();
	     * var first$ = secondProxy$.map(x => x * 10).take(3);
	     * var second$ = first$.map(x => x + 1).startWith(1).compose(delay(100));
	     * secondProxy$.imitate(second$);
	     * ```
	     *
	     * We create `secondProxy$` before the others, so it can be used in the
	     * declaration of `first$`. Then, after both `first$` and `second$` are
	     * defined, we hook `secondProxy$` with `second$` with `imitate()` to tell
	     * that they are "the same". `imitate` will not trigger the start of any
	     * stream, it just binds `secondProxy$` and `second$` together.
	     *
	     * The following is an example where `imitate()` is important in Cycle.js
	     * applications. A parent component contains some child components. A child
	     * has an action stream which is given to the parent to define its state:
	     *
	     * <!-- skip-example -->
	     * ```js
	     * const childActionProxy$ = xs.create();
	     * const parent = Parent({...sources, childAction$: childActionProxy$});
	     * const childAction$ = parent.state$.map(s => s.child.action$).flatten();
	     * childActionProxy$.imitate(childAction$);
	     * ```
	     *
	     * Note, though, that **`imitate()` does not support MemoryStreams**. If we
	     * would attempt to imitate a MemoryStream in a circular dependency, we would
	     * either get a race condition (where the symptom would be "nothing happens")
	     * or an infinite cyclic emission of values. It's useful to think about
	     * MemoryStreams as cells in a spreadsheet. It doesn't make any sense to
	     * define a spreadsheet cell `A1` with a formula that depends on `B1` and
	     * cell `B1` defined with a formula that depends on `A1`.
	     *
	     * If you find yourself wanting to use `imitate()` with a
	     * MemoryStream, you should rework your code around `imitate()` to use a
	     * Stream instead. Look for the stream in the circular dependency that
	     * represents an event stream, and that would be a candidate for creating a
	     * proxy Stream which then imitates the target Stream.
	     *
	     * @param {Stream} target The other stream to imitate on the current one. Must
	     * not be a MemoryStream.
	     */
	    Stream.prototype.imitate = function (target) {
	        if (target instanceof MemoryStream)
	            throw new Error('A MemoryStream was given to imitate(), but it only ' +
	                'supports a Stream. Read more about this restriction here: ' +
	                'https://github.com/staltz/xstream#faq');
	        this._target = target;
	        for (var ils = this._ils, N = ils.length, i = 0; i < N; i++)
	            target._add(ils[i]);
	        this._ils = [];
	    };
	    /**
	     * Forces the Stream to emit the given value to its listeners.
	     *
	     * As the name indicates, if you use this, you are most likely doing something
	     * The Wrong Way. Please try to understand the reactive way before using this
	     * method. Use it only when you know what you are doing.
	     *
	     * @param value The "next" value you want to broadcast to all listeners of
	     * this Stream.
	     */
	    Stream.prototype.shamefullySendNext = function (value) {
	        this._n(value);
	    };
	    /**
	     * Forces the Stream to emit the given error to its listeners.
	     *
	     * As the name indicates, if you use this, you are most likely doing something
	     * The Wrong Way. Please try to understand the reactive way before using this
	     * method. Use it only when you know what you are doing.
	     *
	     * @param {any} error The error you want to broadcast to all the listeners of
	     * this Stream.
	     */
	    Stream.prototype.shamefullySendError = function (error) {
	        this._e(error);
	    };
	    /**
	     * Forces the Stream to emit the "completed" event to its listeners.
	     *
	     * As the name indicates, if you use this, you are most likely doing something
	     * The Wrong Way. Please try to understand the reactive way before using this
	     * method. Use it only when you know what you are doing.
	     */
	    Stream.prototype.shamefullySendComplete = function () {
	        this._c();
	    };
	    /**
	     * Adds a "debug" listener to the stream. There can only be one debug
	     * listener, that's why this is 'setDebugListener'. To remove the debug
	     * listener, just call setDebugListener(null).
	     *
	     * A debug listener is like any other listener. The only difference is that a
	     * debug listener is "stealthy": its presence/absence does not trigger the
	     * start/stop of the stream (or the producer inside the stream). This is
	     * useful so you can inspect what is going on without changing the behavior
	     * of the program. If you have an idle stream and you add a normal listener to
	     * it, the stream will start executing. But if you set a debug listener on an
	     * idle stream, it won't start executing (not until the first normal listener
	     * is added).
	     *
	     * As the name indicates, we don't recommend using this method to build app
	     * logic. In fact, in most cases the debug operator works just fine. Only use
	     * this one if you know what you're doing.
	     *
	     * @param {Listener<T>} listener
	     */
	    Stream.prototype.setDebugListener = function (listener) {
	        if (!listener) {
	            this._d = false;
	            this._dl = NO;
	        }
	        else {
	            this._d = true;
	            listener._n = listener.next || noop;
	            listener._e = listener.error || noop;
	            listener._c = listener.complete || noop;
	            this._dl = listener;
	        }
	    };
	    return Stream;
	}());
	/**
	 * Blends multiple streams together, emitting events from all of them
	 * concurrently.
	 *
	 * *merge* takes multiple streams as arguments, and creates a stream that
	 * behaves like each of the argument streams, in parallel.
	 *
	 * Marble diagram:
	 *
	 * ```text
	 * --1----2-----3--------4---
	 * ----a-----b----c---d------
	 *            merge
	 * --1-a--2--b--3-c---d--4---
	 * ```
	 *
	 * @factory true
	 * @param {Stream} stream1 A stream to merge together with other streams.
	 * @param {Stream} stream2 A stream to merge together with other streams. Two
	 * or more streams may be given as arguments.
	 * @return {Stream}
	 */
	Stream.merge = function merge() {
	    var streams = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        streams[_i] = arguments[_i];
	    }
	    return new Stream(new Merge(streams));
	};
	/**
	 * Combines multiple input streams together to return a stream whose events
	 * are arrays that collect the latest events from each input stream.
	 *
	 * *combine* internally remembers the most recent event from each of the input
	 * streams. When any of the input streams emits an event, that event together
	 * with all the other saved events are combined into an array. That array will
	 * be emitted on the output stream. It's essentially a way of joining together
	 * the events from multiple streams.
	 *
	 * Marble diagram:
	 *
	 * ```text
	 * --1----2-----3--------4---
	 * ----a-----b-----c--d------
	 *          combine
	 * ----1a-2a-2b-3b-3c-3d-4d--
	 * ```
	 *
	 * Note: to minimize garbage collection, *combine* uses the same array
	 * instance for each emission.  If you need to compare emissions over time,
	 * cache the values with `map` first:
	 *
	 * ```js
	 * import pairwise from 'xstream/extra/pairwise'
	 *
	 * const stream1 = xs.of(1);
	 * const stream2 = xs.of(2);
	 *
	 * xs.combine(stream1, stream2).map(
	 *   combinedEmissions => ([ ...combinedEmissions ])
	 * ).compose(pairwise)
	 * ```
	 *
	 * @factory true
	 * @param {Stream} stream1 A stream to combine together with other streams.
	 * @param {Stream} stream2 A stream to combine together with other streams.
	 * Multiple streams, not just two, may be given as arguments.
	 * @return {Stream}
	 */
	Stream.combine = function combine() {
	    var streams = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        streams[_i] = arguments[_i];
	    }
	    return new Stream(new Combine(streams));
	};
	exports.Stream = Stream;
	var MemoryStream = (function (_super) {
	    __extends(MemoryStream, _super);
	    function MemoryStream(producer) {
	        var _this = _super.call(this, producer) || this;
	        _this._has = false;
	        return _this;
	    }
	    MemoryStream.prototype._n = function (x) {
	        this._v = x;
	        this._has = true;
	        _super.prototype._n.call(this, x);
	    };
	    MemoryStream.prototype._add = function (il) {
	        var ta = this._target;
	        if (ta !== NO)
	            return ta._add(il);
	        var a = this._ils;
	        a.push(il);
	        if (a.length > 1) {
	            if (this._has)
	                il._n(this._v);
	            return;
	        }
	        if (this._stopID !== NO) {
	            if (this._has)
	                il._n(this._v);
	            clearTimeout(this._stopID);
	            this._stopID = NO;
	        }
	        else if (this._has)
	            il._n(this._v);
	        else {
	            var p = this._prod;
	            if (p !== NO)
	                p._start(this);
	        }
	    };
	    MemoryStream.prototype._stopNow = function () {
	        this._has = false;
	        _super.prototype._stopNow.call(this);
	    };
	    MemoryStream.prototype._x = function () {
	        this._has = false;
	        _super.prototype._x.call(this);
	    };
	    MemoryStream.prototype.map = function (project) {
	        return this._map(project);
	    };
	    MemoryStream.prototype.mapTo = function (projectedValue) {
	        return _super.prototype.mapTo.call(this, projectedValue);
	    };
	    MemoryStream.prototype.take = function (amount) {
	        return _super.prototype.take.call(this, amount);
	    };
	    MemoryStream.prototype.endWhen = function (other) {
	        return _super.prototype.endWhen.call(this, other);
	    };
	    MemoryStream.prototype.replaceError = function (replace) {
	        return _super.prototype.replaceError.call(this, replace);
	    };
	    MemoryStream.prototype.remember = function () {
	        return this;
	    };
	    MemoryStream.prototype.debug = function (labelOrSpy) {
	        return _super.prototype.debug.call(this, labelOrSpy);
	    };
	    return MemoryStream;
	}(Stream));
	exports.MemoryStream = MemoryStream;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Stream;
	//# sourceMappingURL=index.js.map

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var thunk_1 = __webpack_require__(14);
	exports.thunk = thunk_1.thunk;
	var MainDOMSource_1 = __webpack_require__(18);
	exports.MainDOMSource = MainDOMSource_1.MainDOMSource;
	var HTMLSource_1 = __webpack_require__(28);
	exports.HTMLSource = HTMLSource_1.HTMLSource;
	/**
	 * A factory for the DOM driver function.
	 *
	 * Takes a `container` to define the target on the existing DOM which this
	 * driver will operate on, and an `options` object as the second argument. The
	 * input to this driver is a stream of virtual DOM objects, or in other words,
	 * Snabbdom "VNode" objects. The output of this driver is a "DOMSource": a
	 * collection of Observables queried with the methods `select()` and `events()`.
	 *
	 * `DOMSource.select(selector)` returns a new DOMSource with scope restricted to
	 * the element(s) that matches the CSS `selector` given.
	 *
	 * `DOMSource.events(eventType, options)` returns a stream of events of
	 * `eventType` happening on the elements that match the current DOMSource. The
	 * event object contains the `ownerTarget` property that behaves exactly like
	 * `currentTarget`. The reason for this is that some browsers doesn't allow
	 * `currentTarget` property to be mutated, hence a new property is created. The
	 * returned stream is an *xstream* Stream if you use `@cycle/xstream-run` to run
	 * your app with this driver, or it is an RxJS Observable if you use
	 * `@cycle/rxjs-run`, and so forth. The `options` parameter can have the
	 * property `useCapture`, which is by default `false`, except it is `true` for
	 * event types that do not bubble. Read more here
	 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
	 * about the `useCapture` and its purpose.
	 *
	 * `DOMSource.elements()` returns a stream of the DOM element(s) matched by the
	 * selectors in the DOMSource. Also, `DOMSource.select(':root').elements()`
	 * returns a stream of DOM element corresponding to the root (or container) of
	 * the app on the DOM.
	 *
	 * @param {(String|HTMLElement)} container the DOM selector for the element
	 * (or the element itself) to contain the rendering of the VTrees.
	 * @param {DOMDriverOptions} options an object with two optional properties:
	 *
	 *   - `modules: array` overrides `@cycle/dom`'s default Snabbdom modules as
	 *     as defined in [`src/modules.ts`](./src/modules.ts).
	 *   - `transposition: boolean` enables/disables transposition of inner streams
	 *     in the virtual DOM tree.
	 * @return {Function} the DOM driver function. The function expects a stream of
	 * VNode as input, and outputs the DOMSource object.
	 * @function makeDOMDriver
	 */
	var makeDOMDriver_1 = __webpack_require__(29);
	exports.makeDOMDriver = makeDOMDriver_1.makeDOMDriver;
	/**
	 * A factory for the HTML driver function.
	 *
	 * Takes an `effect` callback function and an `options` object as arguments. The
	 * input to this driver is a stream of virtual DOM objects, or in other words,
	 * Snabbdom "VNode" objects. The output of this driver is a "DOMSource": a
	 * collection of Observables queried with the methods `select()` and `events()`.
	 *
	 * The HTML Driver is supplementary to the DOM Driver. Instead of producing
	 * elements on the DOM, it generates HTML as strings and does a side effect on
	 * those HTML strings. That side effect is described by the `effect` callback
	 * function. So, if you want to use the HTML Driver on the server-side to render
	 * your application as HTML and send as a response (which is the typical use
	 * case for the HTML Driver), you need to pass something like the
	 * `html => response.send(html)` function as the `effect` argument. This way,
	 * the driver knows what side effect to cause based on the HTML string it just
	 * rendered.
	 *
	 * The HTML driver is useful only for that side effect in the `effect` callback.
	 * It can be considered a sink-only driver. However, in order to serve as a
	 * transparent replacement to the DOM Driver when rendering from the server, the
	 * HTML driver returns a source object that behaves just like the DOMSource.
	 * This helps reuse the same application that is written for the DOM Driver.
	 * This fake DOMSource returns empty streams when you query it, because there
	 * are no user events on the server.
	 *
	 * `DOMSource.select(selector)` returns a new DOMSource with scope restricted to
	 * the element(s) that matches the CSS `selector` given.
	 *
	 * `DOMSource.events(eventType, options)` returns an empty stream. The returned
	 * stream is an *xstream* Stream if you use `@cycle/xstream-run` to run your app
	 * with this driver, or it is an RxJS Observable if you use `@cycle/rxjs-run`,
	 * and so forth.
	 *
	 * `DOMSource.elements()` returns the stream of HTML string rendered from your
	 * sink virtual DOM stream.
	 *
	 * @param {Function} effect a callback function that takes a string of rendered
	 * HTML as input and should run a side effect, returning nothing.
	 * @param {HTMLDriverOptions} options an object with one optional property:
	 * `transposition: boolean` enables/disables transposition of inner streams in
	 * the virtual DOM tree.
	 * @return {Function} the HTML driver function. The function expects a stream of
	 * VNode as input, and outputs the DOMSource object.
	 * @function makeHTMLDriver
	 */
	var makeHTMLDriver_1 = __webpack_require__(96);
	exports.makeHTMLDriver = makeHTMLDriver_1.makeHTMLDriver;
	/**
	 * A factory function to create mocked DOMSource objects, for testing purposes.
	 *
	 * Takes a `streamAdapter` and a `mockConfig` object as arguments, and returns
	 * a DOMSource that can be given to any Cycle.js app that expects a DOMSource in
	 * the sources, for testing.
	 *
	 * The `streamAdapter` parameter is a package such as `@cycle/xstream-adapter`,
	 * `@cycle/rxjs-adapter`, etc. Import it as `import a from '@cycle/rx-adapter`,
	 * then provide it to `mockDOMSource. This is important so the DOMSource created
	 * knows which stream library should it use to export its streams when you call
	 * `DOMSource.events()` for instance.
	 *
	 * The `mockConfig` parameter is an object specifying selectors, eventTypes and
	 * their streams. Example:
	 *
	 * ```js
	 * const domSource = mockDOMSource(RxAdapter, {
	 *   '.foo': {
	 *     'click': Rx.Observable.of({target: {}}),
	 *     'mouseover': Rx.Observable.of({target: {}}),
	 *   },
	 *   '.bar': {
	 *     'scroll': Rx.Observable.of({target: {}}),
	 *     elements: Rx.Observable.of({tagName: 'div'}),
	 *   }
	 * });
	 *
	 * // Usage
	 * const click$ = domSource.select('.foo').events('click');
	 * const element$ = domSource.select('.bar').elements();
	 * ```
	 *
	 * The mocked DOM Source supports isolation. It has the functions `isolateSink`
	 * and `isolateSource` attached to it, and performs simple isolation using
	 * classNames. *isolateSink* with scope `foo` will append the class `___foo` to
	 * the stream of virtual DOM nodes, and *isolateSource* with scope `foo` will
	 * perform a conventional `mockedDOMSource.select('.__foo')` call.
	 *
	 * @param {Object} mockConfig an object where keys are selector strings
	 * and values are objects. Those nested objects have `eventType` strings as keys
	 * and values are streams you created.
	 * @return {Object} fake DOM source object, with an API containing `select()`
	 * and `events()` and `elements()` which can be used just like the DOM Driver's
	 * DOMSource.
	 *
	 * @function mockDOMSource
	 */
	var mockDOMSource_1 = __webpack_require__(112);
	exports.mockDOMSource = mockDOMSource_1.mockDOMSource;
	exports.MockedDOMSource = mockDOMSource_1.MockedDOMSource;
	/**
	 * The hyperscript function `h()` is a function to create virtual DOM objects,
	 * also known as VNodes. Call
	 *
	 * ```js
	 * h('div.myClass', {style: {color: 'red'}}, [])
	 * ```
	 *
	 * to create a VNode that represents a `DIV` element with className `myClass`,
	 * styled with red color, and no children because the `[]` array was passed. The
	 * API is `h(tagOrSelector, optionalData, optionalChildrenOrText)`.
	 *
	 * However, usually you should use "hyperscript helpers", which are shortcut
	 * functions based on hyperscript. There is one hyperscript helper function for
	 * each DOM tagName, such as `h1()`, `h2()`, `div()`, `span()`, `label()`,
	 * `input()`. For instance, the previous example could have been written
	 * as:
	 *
	 * ```js
	 * div('.myClass', {style: {color: 'red'}}, [])
	 * ```
	 *
	 * There are also SVG helper functions, which apply the appropriate SVG
	 * namespace to the resulting elements. `svg()` function creates the top-most
	 * SVG element, and `svg.g`, `svg.polygon`, `svg.circle`, `svg.path` are for
	 * SVG-specific child elements. Example:
	 *
	 * ```js
	 * svg({width: 150, height: 150}, [
	 *   svg.polygon({
	 *     attrs: {
	 *       class: 'triangle',
	 *       points: '20 0 20 150 150 20'
	 *     }
	 *   })
	 * ])
	 * ```
	 *
	 * @function h
	 */
	var h_1 = __webpack_require__(15);
	exports.h = h_1.h;
	var hyperscript_helpers_1 = __webpack_require__(113);
	exports.svg = hyperscript_helpers_1.default.svg;
	exports.a = hyperscript_helpers_1.default.a;
	exports.abbr = hyperscript_helpers_1.default.abbr;
	exports.address = hyperscript_helpers_1.default.address;
	exports.area = hyperscript_helpers_1.default.area;
	exports.article = hyperscript_helpers_1.default.article;
	exports.aside = hyperscript_helpers_1.default.aside;
	exports.audio = hyperscript_helpers_1.default.audio;
	exports.b = hyperscript_helpers_1.default.b;
	exports.base = hyperscript_helpers_1.default.base;
	exports.bdi = hyperscript_helpers_1.default.bdi;
	exports.bdo = hyperscript_helpers_1.default.bdo;
	exports.blockquote = hyperscript_helpers_1.default.blockquote;
	exports.body = hyperscript_helpers_1.default.body;
	exports.br = hyperscript_helpers_1.default.br;
	exports.button = hyperscript_helpers_1.default.button;
	exports.canvas = hyperscript_helpers_1.default.canvas;
	exports.caption = hyperscript_helpers_1.default.caption;
	exports.cite = hyperscript_helpers_1.default.cite;
	exports.code = hyperscript_helpers_1.default.code;
	exports.col = hyperscript_helpers_1.default.col;
	exports.colgroup = hyperscript_helpers_1.default.colgroup;
	exports.dd = hyperscript_helpers_1.default.dd;
	exports.del = hyperscript_helpers_1.default.del;
	exports.dfn = hyperscript_helpers_1.default.dfn;
	exports.dir = hyperscript_helpers_1.default.dir;
	exports.div = hyperscript_helpers_1.default.div;
	exports.dl = hyperscript_helpers_1.default.dl;
	exports.dt = hyperscript_helpers_1.default.dt;
	exports.em = hyperscript_helpers_1.default.em;
	exports.embed = hyperscript_helpers_1.default.embed;
	exports.fieldset = hyperscript_helpers_1.default.fieldset;
	exports.figcaption = hyperscript_helpers_1.default.figcaption;
	exports.figure = hyperscript_helpers_1.default.figure;
	exports.footer = hyperscript_helpers_1.default.footer;
	exports.form = hyperscript_helpers_1.default.form;
	exports.h1 = hyperscript_helpers_1.default.h1;
	exports.h2 = hyperscript_helpers_1.default.h2;
	exports.h3 = hyperscript_helpers_1.default.h3;
	exports.h4 = hyperscript_helpers_1.default.h4;
	exports.h5 = hyperscript_helpers_1.default.h5;
	exports.h6 = hyperscript_helpers_1.default.h6;
	exports.head = hyperscript_helpers_1.default.head;
	exports.header = hyperscript_helpers_1.default.header;
	exports.hgroup = hyperscript_helpers_1.default.hgroup;
	exports.hr = hyperscript_helpers_1.default.hr;
	exports.html = hyperscript_helpers_1.default.html;
	exports.i = hyperscript_helpers_1.default.i;
	exports.iframe = hyperscript_helpers_1.default.iframe;
	exports.img = hyperscript_helpers_1.default.img;
	exports.input = hyperscript_helpers_1.default.input;
	exports.ins = hyperscript_helpers_1.default.ins;
	exports.kbd = hyperscript_helpers_1.default.kbd;
	exports.keygen = hyperscript_helpers_1.default.keygen;
	exports.label = hyperscript_helpers_1.default.label;
	exports.legend = hyperscript_helpers_1.default.legend;
	exports.li = hyperscript_helpers_1.default.li;
	exports.link = hyperscript_helpers_1.default.link;
	exports.main = hyperscript_helpers_1.default.main;
	exports.map = hyperscript_helpers_1.default.map;
	exports.mark = hyperscript_helpers_1.default.mark;
	exports.menu = hyperscript_helpers_1.default.menu;
	exports.meta = hyperscript_helpers_1.default.meta;
	exports.nav = hyperscript_helpers_1.default.nav;
	exports.noscript = hyperscript_helpers_1.default.noscript;
	exports.object = hyperscript_helpers_1.default.object;
	exports.ol = hyperscript_helpers_1.default.ol;
	exports.optgroup = hyperscript_helpers_1.default.optgroup;
	exports.option = hyperscript_helpers_1.default.option;
	exports.p = hyperscript_helpers_1.default.p;
	exports.param = hyperscript_helpers_1.default.param;
	exports.pre = hyperscript_helpers_1.default.pre;
	exports.progress = hyperscript_helpers_1.default.progress;
	exports.q = hyperscript_helpers_1.default.q;
	exports.rp = hyperscript_helpers_1.default.rp;
	exports.rt = hyperscript_helpers_1.default.rt;
	exports.ruby = hyperscript_helpers_1.default.ruby;
	exports.s = hyperscript_helpers_1.default.s;
	exports.samp = hyperscript_helpers_1.default.samp;
	exports.script = hyperscript_helpers_1.default.script;
	exports.section = hyperscript_helpers_1.default.section;
	exports.select = hyperscript_helpers_1.default.select;
	exports.small = hyperscript_helpers_1.default.small;
	exports.source = hyperscript_helpers_1.default.source;
	exports.span = hyperscript_helpers_1.default.span;
	exports.strong = hyperscript_helpers_1.default.strong;
	exports.style = hyperscript_helpers_1.default.style;
	exports.sub = hyperscript_helpers_1.default.sub;
	exports.sup = hyperscript_helpers_1.default.sup;
	exports.table = hyperscript_helpers_1.default.table;
	exports.tbody = hyperscript_helpers_1.default.tbody;
	exports.td = hyperscript_helpers_1.default.td;
	exports.textarea = hyperscript_helpers_1.default.textarea;
	exports.tfoot = hyperscript_helpers_1.default.tfoot;
	exports.th = hyperscript_helpers_1.default.th;
	exports.thead = hyperscript_helpers_1.default.thead;
	exports.title = hyperscript_helpers_1.default.title;
	exports.tr = hyperscript_helpers_1.default.tr;
	exports.u = hyperscript_helpers_1.default.u;
	exports.ul = hyperscript_helpers_1.default.ul;
	exports.video = hyperscript_helpers_1.default.video;
	//# sourceMappingURL=index.js.map

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var h_1 = __webpack_require__(15);
	function copyToThunk(vnode, thunk) {
	    thunk.elm = vnode.elm;
	    vnode.data.fn = thunk.data.fn;
	    vnode.data.args = thunk.data.args;
	    thunk.data = vnode.data;
	    thunk.children = vnode.children;
	    thunk.text = vnode.text;
	    thunk.elm = vnode.elm;
	}
	function init(thunk) {
	    var cur = thunk.data;
	    var vnode = cur.fn.apply(undefined, cur.args);
	    copyToThunk(vnode, thunk);
	}
	function prepatch(oldVnode, thunk) {
	    var i, old = oldVnode.data, cur = thunk.data;
	    var oldArgs = old.args, args = cur.args;
	    if (old.fn !== cur.fn || oldArgs.length !== args.length) {
	        copyToThunk(cur.fn.apply(undefined, args), thunk);
	    }
	    for (i = 0; i < args.length; ++i) {
	        if (oldArgs[i] !== args[i]) {
	            copyToThunk(cur.fn.apply(undefined, args), thunk);
	            return;
	        }
	    }
	    copyToThunk(oldVnode, thunk);
	}
	exports.thunk = function thunk(sel, key, fn, args) {
	    if (args === undefined) {
	        args = fn;
	        fn = key;
	        key = undefined;
	    }
	    return h_1.h(sel, {
	        key: key,
	        hook: { init: init, prepatch: prepatch },
	        fn: fn,
	        args: args
	    });
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = exports.thunk;
	//# sourceMappingURL=thunk.js.map

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var vnode_1 = __webpack_require__(16);
	var is = __webpack_require__(17);
	function addNS(data, children, sel) {
	    data.ns = 'http://www.w3.org/2000/svg';
	    if (sel !== 'foreignObject' && children !== undefined) {
	        for (var i = 0; i < children.length; ++i) {
	            var childData = children[i].data;
	            if (childData !== undefined) {
	                addNS(childData, children[i].children, children[i].sel);
	            }
	        }
	    }
	}
	function h(sel, b, c) {
	    var data = {}, children, text, i;
	    if (c !== undefined) {
	        data = b;
	        if (is.array(c)) {
	            children = c;
	        }
	        else if (is.primitive(c)) {
	            text = c;
	        }
	        else if (c && c.sel) {
	            children = [c];
	        }
	    }
	    else if (b !== undefined) {
	        if (is.array(b)) {
	            children = b;
	        }
	        else if (is.primitive(b)) {
	            text = b;
	        }
	        else if (b && b.sel) {
	            children = [b];
	        }
	        else {
	            data = b;
	        }
	    }
	    if (is.array(children)) {
	        for (i = 0; i < children.length; ++i) {
	            if (is.primitive(children[i]))
	                children[i] = vnode_1.vnode(undefined, undefined, undefined, children[i]);
	        }
	    }
	    if (sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g' &&
	        (sel.length === 3 || sel[3] === '.' || sel[3] === '#')) {
	        addNS(data, children, sel);
	    }
	    return vnode_1.vnode(sel, data, children, text, undefined);
	}
	exports.h = h;
	;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = h;
	//# sourceMappingURL=h.js.map

/***/ },
/* 16 */
/***/ function(module, exports) {

	"use strict";
	function vnode(sel, data, children, text, elm) {
	    var key = data === undefined ? undefined : data.key;
	    return { sel: sel, data: data, children: children,
	        text: text, elm: elm, key: key };
	}
	exports.vnode = vnode;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = vnode;
	//# sourceMappingURL=vnode.js.map

/***/ },
/* 17 */
/***/ function(module, exports) {

	"use strict";
	exports.array = Array.isArray;
	function primitive(s) {
	    return typeof s === 'string' || typeof s === 'number';
	}
	exports.primitive = primitive;
	//# sourceMappingURL=is.js.map

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var adapt_1 = __webpack_require__(7);
	var DocumentDOMSource_1 = __webpack_require__(19);
	var BodyDOMSource_1 = __webpack_require__(21);
	var ElementFinder_1 = __webpack_require__(22);
	var fromEvent_1 = __webpack_require__(20);
	var isolate_1 = __webpack_require__(26);
	var EventDelegator_1 = __webpack_require__(27);
	var utils_1 = __webpack_require__(24);
	var eventTypesThatDontBubble = [
	    "blur",
	    "canplay",
	    "canplaythrough",
	    "change",
	    "durationchange",
	    "emptied",
	    "ended",
	    "focus",
	    "load",
	    "loadeddata",
	    "loadedmetadata",
	    "mouseenter",
	    "mouseleave",
	    "pause",
	    "play",
	    "playing",
	    "ratechange",
	    "reset",
	    "scroll",
	    "seeked",
	    "seeking",
	    "stalled",
	    "submit",
	    "suspend",
	    "timeupdate",
	    "unload",
	    "volumechange",
	    "waiting",
	];
	function determineUseCapture(eventType, options) {
	    var result = false;
	    if (typeof options.useCapture === 'boolean') {
	        result = options.useCapture;
	    }
	    if (eventTypesThatDontBubble.indexOf(eventType) !== -1) {
	        result = true;
	    }
	    return result;
	}
	function filterBasedOnIsolation(domSource, fullScope) {
	    return function filterBasedOnIsolationOperator(rootElement$) {
	        var initialState = {
	            wasIsolated: false,
	            shouldPass: false,
	            element: null,
	        };
	        return rootElement$
	            .fold(function checkIfShouldPass(state, element) {
	            var isIsolated = !!domSource._isolateModule.getElement(fullScope);
	            var shouldPass = isIsolated && !state.wasIsolated;
	            return { wasIsolated: isIsolated, shouldPass: shouldPass, element: element };
	        }, initialState)
	            .drop(1)
	            .filter(function (s) { return s.shouldPass; })
	            .map(function (s) { return s.element; });
	    };
	}
	var MainDOMSource = (function () {
	    function MainDOMSource(_rootElement$, _sanitation$, _namespace, _isolateModule, _delegators, _name) {
	        if (_namespace === void 0) { _namespace = []; }
	        var _this = this;
	        this._rootElement$ = _rootElement$;
	        this._sanitation$ = _sanitation$;
	        this._namespace = _namespace;
	        this._isolateModule = _isolateModule;
	        this._delegators = _delegators;
	        this._name = _name;
	        this.isolateSource = isolate_1.isolateSource;
	        this.isolateSink = function (sink, scope) {
	            var prevFullScope = utils_1.getFullScope(_this._namespace);
	            var nextFullScope = [prevFullScope, scope].filter(function (x) { return !!x; }).join('-');
	            return isolate_1.isolateSink(sink, nextFullScope);
	        };
	    }
	    MainDOMSource.prototype.elements = function () {
	        var output$;
	        if (this._namespace.length === 0) {
	            output$ = this._rootElement$;
	        }
	        else {
	            var elementFinder_1 = new ElementFinder_1.ElementFinder(this._namespace, this._isolateModule);
	            output$ = this._rootElement$.map(function (el) { return elementFinder_1.call(el); });
	        }
	        var out = adapt_1.adapt(output$.remember());
	        out._isCycleSource = this._name;
	        return out;
	    };
	    Object.defineProperty(MainDOMSource.prototype, "namespace", {
	        get: function () {
	            return this._namespace;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    MainDOMSource.prototype.select = function (selector) {
	        if (typeof selector !== 'string') {
	            throw new Error("DOM driver's select() expects the argument to be a " +
	                "string as a CSS selector");
	        }
	        if (selector === 'document') {
	            return new DocumentDOMSource_1.DocumentDOMSource(this._name);
	        }
	        if (selector === 'body') {
	            return new BodyDOMSource_1.BodyDOMSource(this._name);
	        }
	        var trimmedSelector = selector.trim();
	        var childNamespace = trimmedSelector === ":root" ?
	            this._namespace :
	            this._namespace.concat(trimmedSelector);
	        return new MainDOMSource(this._rootElement$, this._sanitation$, childNamespace, this._isolateModule, this._delegators, this._name);
	    };
	    MainDOMSource.prototype.events = function (eventType, options) {
	        if (options === void 0) { options = {}; }
	        if (typeof eventType !== "string") {
	            throw new Error("DOM driver's events() expects argument to be a " +
	                "string representing the event type to listen for.");
	        }
	        var useCapture = determineUseCapture(eventType, options);
	        var namespace = this._namespace;
	        var fullScope = utils_1.getFullScope(namespace);
	        var keyParts = [eventType, useCapture];
	        if (fullScope) {
	            keyParts.push(fullScope);
	        }
	        var key = keyParts.join('~');
	        var domSource = this;
	        var rootElement$;
	        if (fullScope) {
	            rootElement$ = this._rootElement$
	                .compose(filterBasedOnIsolation(domSource, fullScope));
	        }
	        else {
	            rootElement$ = this._rootElement$.take(2);
	        }
	        var event$ = rootElement$
	            .map(function setupEventDelegatorOnTopElement(rootElement) {
	            // Event listener just for the root element
	            if (!namespace || namespace.length === 0) {
	                return fromEvent_1.fromEvent(rootElement, eventType, useCapture);
	            }
	            // Event listener on the origin element as an EventDelegator
	            var delegators = domSource._delegators;
	            var origin = domSource._isolateModule.getElement(fullScope) || rootElement;
	            var delegator;
	            if (delegators.has(key)) {
	                delegator = delegators.get(key);
	                delegator.updateOrigin(origin);
	            }
	            else {
	                delegator = new EventDelegator_1.EventDelegator(origin, eventType, useCapture, domSource._isolateModule);
	                delegators.set(key, delegator);
	            }
	            if (fullScope) {
	                domSource._isolateModule.addEventDelegator(fullScope, delegator);
	            }
	            var subject = delegator.createDestination(namespace);
	            return subject;
	        })
	            .flatten();
	        var out = adapt_1.adapt(event$);
	        out._isCycleSource = domSource._name;
	        return out;
	    };
	    MainDOMSource.prototype.dispose = function () {
	        this._sanitation$.shamefullySendNext(null);
	        this._isolateModule.reset();
	    };
	    return MainDOMSource;
	}());
	exports.MainDOMSource = MainDOMSource;
	//# sourceMappingURL=MainDOMSource.js.map

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xstream_1 = __webpack_require__(12);
	var adapt_1 = __webpack_require__(7);
	var fromEvent_1 = __webpack_require__(20);
	var DocumentDOMSource = (function () {
	    function DocumentDOMSource(_name) {
	        this._name = _name;
	    }
	    DocumentDOMSource.prototype.select = function (selector) {
	        // This functionality is still undefined/undecided.
	        return this;
	    };
	    DocumentDOMSource.prototype.elements = function () {
	        var out = adapt_1.adapt(xstream_1.default.of(document));
	        out._isCycleSource = this._name;
	        return out;
	    };
	    DocumentDOMSource.prototype.events = function (eventType, options) {
	        if (options === void 0) { options = {}; }
	        var stream;
	        if (options && typeof options.useCapture === 'boolean') {
	            stream = fromEvent_1.fromEvent(document, eventType, options.useCapture);
	        }
	        else {
	            stream = fromEvent_1.fromEvent(document, eventType);
	        }
	        var out = adapt_1.adapt(stream);
	        out._isCycleSource = this._name;
	        return out;
	    };
	    return DocumentDOMSource;
	}());
	exports.DocumentDOMSource = DocumentDOMSource;
	//# sourceMappingURL=DocumentDOMSource.js.map

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xstream_1 = __webpack_require__(12);
	function fromEvent(element, eventName, useCapture) {
	    if (useCapture === void 0) { useCapture = false; }
	    return xstream_1.Stream.create({
	        element: element,
	        next: null,
	        start: function start(listener) {
	            this.next = function next(event) { listener.next(event); };
	            this.element.addEventListener(eventName, this.next, useCapture);
	        },
	        stop: function stop() {
	            this.element.removeEventListener(eventName, this.next, useCapture);
	        },
	    });
	}
	exports.fromEvent = fromEvent;
	//# sourceMappingURL=fromEvent.js.map

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xstream_1 = __webpack_require__(12);
	var adapt_1 = __webpack_require__(7);
	var fromEvent_1 = __webpack_require__(20);
	var BodyDOMSource = (function () {
	    function BodyDOMSource(_name) {
	        this._name = _name;
	    }
	    BodyDOMSource.prototype.select = function (selector) {
	        // This functionality is still undefined/undecided.
	        return this;
	    };
	    BodyDOMSource.prototype.elements = function () {
	        var out = adapt_1.adapt(xstream_1.default.of(document.body));
	        out._isCycleSource = this._name;
	        return out;
	    };
	    BodyDOMSource.prototype.events = function (eventType, options) {
	        if (options === void 0) { options = {}; }
	        var stream;
	        if (options && typeof options.useCapture === 'boolean') {
	            stream = fromEvent_1.fromEvent(document.body, eventType, options.useCapture);
	        }
	        else {
	            stream = fromEvent_1.fromEvent(document.body, eventType);
	        }
	        var out = adapt_1.adapt(stream);
	        out._isCycleSource = this._name;
	        return out;
	    };
	    return BodyDOMSource;
	}());
	exports.BodyDOMSource = BodyDOMSource;
	//# sourceMappingURL=BodyDOMSource.js.map

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var ScopeChecker_1 = __webpack_require__(23);
	var utils_1 = __webpack_require__(24);
	var matchesSelector_1 = __webpack_require__(25);
	function toElArray(input) {
	    return Array.prototype.slice.call(input);
	}
	var ElementFinder = (function () {
	    function ElementFinder(namespace, isolateModule) {
	        this.namespace = namespace;
	        this.isolateModule = isolateModule;
	    }
	    ElementFinder.prototype.call = function (rootElement) {
	        var namespace = this.namespace;
	        var selector = utils_1.getSelectors(namespace);
	        if (!selector) {
	            return rootElement;
	        }
	        var fullScope = utils_1.getFullScope(namespace);
	        var scopeChecker = new ScopeChecker_1.ScopeChecker(fullScope, this.isolateModule);
	        var topNode = fullScope ?
	            this.isolateModule.getElement(fullScope) || rootElement :
	            rootElement;
	        var topNodeMatchesSelector = !!fullScope && !!selector && matchesSelector_1.matchesSelector(topNode, selector);
	        return toElArray(topNode.querySelectorAll(selector))
	            .filter(scopeChecker.isDirectlyInScope, scopeChecker)
	            .concat(topNodeMatchesSelector ? [topNode] : []);
	    };
	    return ElementFinder;
	}());
	exports.ElementFinder = ElementFinder;
	//# sourceMappingURL=ElementFinder.js.map

/***/ },
/* 23 */
/***/ function(module, exports) {

	"use strict";
	var ScopeChecker = (function () {
	    function ScopeChecker(fullScope, isolateModule) {
	        this.fullScope = fullScope;
	        this.isolateModule = isolateModule;
	    }
	    /**
	     * Checks whether the given element is *directly* in the scope of this
	     * scope checker. Being contained *indirectly* through other scopes
	     * is not valid. This is crucial for implementing parent-child isolation,
	     * so that the parent selectors don't search inside a child scope.
	     */
	    ScopeChecker.prototype.isDirectlyInScope = function (leaf) {
	        for (var el = leaf; el; el = el.parentElement) {
	            var fullScope = this.isolateModule.getFullScope(el);
	            if (fullScope && fullScope !== this.fullScope) {
	                return false;
	            }
	            if (fullScope) {
	                return true;
	            }
	        }
	        return true;
	    };
	    return ScopeChecker;
	}());
	exports.ScopeChecker = ScopeChecker;
	//# sourceMappingURL=ScopeChecker.js.map

/***/ },
/* 24 */
/***/ function(module, exports) {

	"use strict";
	function isElement(obj) {
	    var ELEM_TYPE = 1;
	    var FRAG_TYPE = 11;
	    return typeof HTMLElement === 'object' ?
	        obj instanceof HTMLElement || obj instanceof DocumentFragment :
	        obj && typeof obj === 'object' && obj !== null &&
	            (obj.nodeType === ELEM_TYPE || obj.nodeType === FRAG_TYPE) &&
	            typeof obj.nodeName === 'string';
	}
	exports.SCOPE_PREFIX = '$$CYCLEDOM$$-';
	function getElement(selectors) {
	    var domElement = typeof selectors === 'string' ?
	        document.querySelector(selectors) :
	        selectors;
	    if (typeof selectors === 'string' && domElement === null) {
	        throw new Error("Cannot render into unknown element `" + selectors + "`");
	    }
	    else if (!isElement(domElement)) {
	        throw new Error('Given container is not a DOM element neither a ' +
	            'selector string.');
	    }
	    return domElement;
	}
	exports.getElement = getElement;
	/**
	 * The full scope of a namespace is the "absolute path" of scopes from
	 * parent to child. This is extracted from the namespace, filter only for
	 * scopes in the namespace.
	 */
	function getFullScope(namespace) {
	    return namespace
	        .filter(function (c) { return c.indexOf(exports.SCOPE_PREFIX) > -1; })
	        .map(function (c) { return c.replace(exports.SCOPE_PREFIX, ''); })
	        .join('-');
	}
	exports.getFullScope = getFullScope;
	function getSelectors(namespace) {
	    return namespace.filter(function (c) { return c.indexOf(exports.SCOPE_PREFIX) === -1; }).join(' ');
	}
	exports.getSelectors = getSelectors;
	//# sourceMappingURL=utils.js.map

/***/ },
/* 25 */
/***/ function(module, exports) {

	"use strict";
	function createMatchesSelector() {
	    var vendor;
	    try {
	        var proto = Element.prototype;
	        vendor = proto.matches
	            || proto.matchesSelector
	            || proto.webkitMatchesSelector
	            || proto.mozMatchesSelector
	            || proto.msMatchesSelector
	            || proto.oMatchesSelector;
	    }
	    catch (err) {
	        vendor = null;
	    }
	    return function match(elem, selector) {
	        if (vendor) {
	            return vendor.call(elem, selector);
	        }
	        var nodes = elem.parentNode.querySelectorAll(selector);
	        for (var i = 0; i < nodes.length; i++) {
	            if (nodes[i] === elem) {
	                return true;
	            }
	        }
	        return false;
	    };
	}
	exports.matchesSelector = createMatchesSelector();
	//# sourceMappingURL=matchesSelector.js.map

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var utils_1 = __webpack_require__(24);
	function isolateSource(source, scope) {
	    return source.select(utils_1.SCOPE_PREFIX + scope);
	}
	exports.isolateSource = isolateSource;
	function isolateSink(sink, fullScope) {
	    return sink.map(function (vnode) {
	        // Ignore if already had up-to-date full scope in vnode.data.isolate
	        if (vnode.data && vnode.data.isolate) {
	            var isolateData = vnode.data.isolate;
	            var prevFullScopeNum = isolateData.replace(/(cycle|\-)/g, '');
	            var fullScopeNum = fullScope.replace(/(cycle|\-)/g, '');
	            if (isNaN(parseInt(prevFullScopeNum))
	                || isNaN(parseInt(fullScopeNum))
	                || prevFullScopeNum > fullScopeNum) {
	                return vnode;
	            }
	        }
	        // Insert up-to-date full scope in vnode.data.isolate, and also a key if needed
	        vnode.data = vnode.data || {};
	        vnode.data.isolate = fullScope;
	        if (typeof vnode.key === 'undefined') {
	            vnode.key = utils_1.SCOPE_PREFIX + fullScope;
	        }
	        return vnode;
	    });
	}
	exports.isolateSink = isolateSink;
	//# sourceMappingURL=isolate.js.map

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xstream_1 = __webpack_require__(12);
	var ScopeChecker_1 = __webpack_require__(23);
	var utils_1 = __webpack_require__(24);
	var matchesSelector_1 = __webpack_require__(25);
	/**
	 * Finds (with binary search) index of the destination that id equal to searchId
	 * among the destinations in the given array.
	 */
	function indexOf(arr, searchId) {
	    var minIndex = 0;
	    var maxIndex = arr.length - 1;
	    var currentIndex;
	    var current;
	    while (minIndex <= maxIndex) {
	        currentIndex = (minIndex + maxIndex) / 2 | 0; // tslint:disable-line:no-bitwise
	        current = arr[currentIndex];
	        var currentId = current.id;
	        if (currentId < searchId) {
	            minIndex = currentIndex + 1;
	        }
	        else if (currentId > searchId) {
	            maxIndex = currentIndex - 1;
	        }
	        else {
	            return currentIndex;
	        }
	    }
	    return -1;
	}
	/**
	 * Manages "Event delegation", by connecting an origin with multiple
	 * destinations.
	 *
	 * Attaches a DOM event listener to the DOM element called the "origin",
	 * and delegates events to "destinations", which are subjects as outputs
	 * for the DOMSource. Simulates bubbling or capturing, with regards to
	 * isolation boundaries too.
	 */
	var EventDelegator = (function () {
	    function EventDelegator(origin, eventType, useCapture, isolateModule) {
	        var _this = this;
	        this.origin = origin;
	        this.eventType = eventType;
	        this.useCapture = useCapture;
	        this.isolateModule = isolateModule;
	        this.destinations = [];
	        this._lastId = 0;
	        if (useCapture) {
	            this.listener = function (ev) { return _this.capture(ev); };
	        }
	        else {
	            this.listener = function (ev) { return _this.bubble(ev); };
	        }
	        origin.addEventListener(eventType, this.listener, useCapture);
	    }
	    EventDelegator.prototype.updateOrigin = function (newOrigin) {
	        this.origin.removeEventListener(this.eventType, this.listener, this.useCapture);
	        newOrigin.addEventListener(this.eventType, this.listener, this.useCapture);
	        this.origin = newOrigin;
	    };
	    /**
	     * Creates a *new* destination given the namespace and returns the subject
	     * representing the destination of events. Is not referentially transparent,
	     * will always return a different output for the same input.
	     */
	    EventDelegator.prototype.createDestination = function (namespace) {
	        var _this = this;
	        var id = this._lastId++;
	        var selector = utils_1.getSelectors(namespace);
	        var scopeChecker = new ScopeChecker_1.ScopeChecker(utils_1.getFullScope(namespace), this.isolateModule);
	        var subject = xstream_1.default.create({
	            start: function () { },
	            stop: function () {
	                if ('requestIdleCallback' in window) {
	                    requestIdleCallback(function () {
	                        _this.removeDestination(id);
	                    });
	                }
	                else {
	                    _this.removeDestination(id);
	                }
	            },
	        });
	        var destination = { id: id, selector: selector, scopeChecker: scopeChecker, subject: subject };
	        this.destinations.push(destination);
	        return subject;
	    };
	    /**
	     * Removes the destination that has the given id.
	     */
	    EventDelegator.prototype.removeDestination = function (id) {
	        var i = indexOf(this.destinations, id);
	        i >= 0 && this.destinations.splice(i, 1); // tslint:disable-line:no-unused-expression
	    };
	    EventDelegator.prototype.capture = function (ev) {
	        var n = this.destinations.length;
	        for (var i = 0; i < n; i++) {
	            var dest = this.destinations[i];
	            if (matchesSelector_1.matchesSelector(ev.target, dest.selector)) {
	                dest.subject._n(ev);
	            }
	        }
	    };
	    EventDelegator.prototype.bubble = function (rawEvent) {
	        var origin = this.origin;
	        if (!origin.contains(rawEvent.currentTarget)) {
	            return;
	        }
	        var roof = origin.parentElement;
	        var ev = this.patchEvent(rawEvent);
	        for (var el = ev.target; el && el !== roof; el = el.parentElement) {
	            if (!origin.contains(el)) {
	                ev.stopPropagation();
	            }
	            if (ev.propagationHasBeenStopped) {
	                return;
	            }
	            this.matchEventAgainstDestinations(el, ev);
	        }
	    };
	    EventDelegator.prototype.patchEvent = function (event) {
	        var pEvent = event;
	        pEvent.propagationHasBeenStopped = false;
	        var oldStopPropagation = pEvent.stopPropagation;
	        pEvent.stopPropagation = function stopPropagation() {
	            oldStopPropagation.call(this);
	            this.propagationHasBeenStopped = true;
	        };
	        return pEvent;
	    };
	    EventDelegator.prototype.matchEventAgainstDestinations = function (el, ev) {
	        var n = this.destinations.length;
	        for (var i = 0; i < n; i++) {
	            var dest = this.destinations[i];
	            if (!dest.scopeChecker.isDirectlyInScope(el)) {
	                continue;
	            }
	            if (matchesSelector_1.matchesSelector(el, dest.selector)) {
	                this.mutateEventCurrentTarget(ev, el);
	                dest.subject._n(ev);
	            }
	        }
	    };
	    EventDelegator.prototype.mutateEventCurrentTarget = function (event, currentTargetElement) {
	        try {
	            Object.defineProperty(event, "currentTarget", {
	                value: currentTargetElement,
	                configurable: true,
	            });
	        }
	        catch (err) {
	            console.log("please use event.ownerTarget");
	        }
	        event.ownerTarget = currentTargetElement;
	    };
	    return EventDelegator;
	}());
	exports.EventDelegator = EventDelegator;
	//# sourceMappingURL=EventDelegator.js.map

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xstream_1 = __webpack_require__(12);
	var adapt_1 = __webpack_require__(7);
	var HTMLSource = (function () {
	    function HTMLSource(html$, _name) {
	        this._name = _name;
	        this._html$ = html$;
	        this._empty$ = adapt_1.adapt(xstream_1.default.empty());
	    }
	    HTMLSource.prototype.elements = function () {
	        var out = adapt_1.adapt(this._html$);
	        out._isCycleSource = this._name;
	        return out;
	    };
	    HTMLSource.prototype.select = function (selector) {
	        return new HTMLSource(xstream_1.default.empty(), this._name);
	    };
	    HTMLSource.prototype.events = function (eventType, options) {
	        var out = this._empty$;
	        out._isCycleSource = this._name;
	        return out;
	    };
	    return HTMLSource;
	}());
	exports.HTMLSource = HTMLSource;
	//# sourceMappingURL=HTMLSource.js.map

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var snabbdom_1 = __webpack_require__(30);
	var xstream_1 = __webpack_require__(12);
	var MainDOMSource_1 = __webpack_require__(18);
	var tovnode_1 = __webpack_require__(32);
	var VNodeWrapper_1 = __webpack_require__(33);
	var utils_1 = __webpack_require__(24);
	var modules_1 = __webpack_require__(36);
	var IsolateModule_1 = __webpack_require__(42);
	var MapPolyfill = __webpack_require__(43);
	function makeDOMDriverInputGuard(modules) {
	    if (!Array.isArray(modules)) {
	        throw new Error("Optional modules option must be " +
	            "an array for snabbdom modules");
	    }
	}
	function domDriverInputGuard(view$) {
	    if (!view$
	        || typeof view$.addListener !== "function"
	        || typeof view$.fold !== "function") {
	        throw new Error("The DOM driver function expects as input a Stream of " +
	            "virtual DOM elements");
	    }
	}
	function dropCompletion(input) {
	    return xstream_1.default.merge(input, xstream_1.default.never());
	}
	function unwrapElementFromVNode(vnode) {
	    return vnode.elm;
	}
	function reportSnabbdomError(err) {
	    (console.error || console.log)(err);
	}
	function makeDOMDriver(container, options) {
	    if (!options) {
	        options = {};
	    }
	    var modules = options.modules || modules_1.default;
	    var isolateModule = new IsolateModule_1.IsolateModule();
	    var patch = snabbdom_1.init([isolateModule.createModule()].concat(modules));
	    var rootElement = utils_1.getElement(container) || document.body;
	    var vnodeWrapper = new VNodeWrapper_1.VNodeWrapper(rootElement);
	    var delegators = new MapPolyfill();
	    makeDOMDriverInputGuard(modules);
	    function DOMDriver(vnode$, name) {
	        if (name === void 0) { name = 'DOM'; }
	        domDriverInputGuard(vnode$);
	        var sanitation$ = xstream_1.default.create();
	        var rootElement$ = xstream_1.default.merge(vnode$.endWhen(sanitation$), sanitation$)
	            .map(function (vnode) { return vnodeWrapper.call(vnode); })
	            .fold(patch, tovnode_1.toVNode(rootElement))
	            .drop(1)
	            .map(unwrapElementFromVNode)
	            .compose(dropCompletion) // don't complete this stream
	            .startWith(rootElement);
	        // Start the snabbdom patching, over time
	        var listener = { error: reportSnabbdomError };
	        if (document.readyState === 'loading') {
	            document.addEventListener('readystatechange', function () {
	                if (document.readyState === 'interactive') {
	                    rootElement$.addListener(listener);
	                }
	            });
	        }
	        else {
	            rootElement$.addListener(listener);
	        }
	        return new MainDOMSource_1.MainDOMSource(rootElement$, sanitation$, [], isolateModule, delegators, name);
	    }
	    ;
	    return DOMDriver;
	}
	exports.makeDOMDriver = makeDOMDriver;
	//# sourceMappingURL=makeDOMDriver.js.map

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var vnode_1 = __webpack_require__(16);
	var is = __webpack_require__(17);
	var htmldomapi_1 = __webpack_require__(31);
	function isUndef(s) { return s === undefined; }
	function isDef(s) { return s !== undefined; }
	var emptyNode = vnode_1.default('', {}, [], undefined, undefined);
	function sameVnode(vnode1, vnode2) {
	    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
	}
	function isVnode(vnode) {
	    return vnode.sel !== undefined;
	}
	function createKeyToOldIdx(children, beginIdx, endIdx) {
	    var i, map = {}, key, ch;
	    for (i = beginIdx; i <= endIdx; ++i) {
	        ch = children[i];
	        if (ch != null) {
	            key = ch.key;
	            if (key !== undefined)
	                map[key] = i;
	        }
	    }
	    return map;
	}
	var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];
	var h_1 = __webpack_require__(15);
	exports.h = h_1.h;
	var thunk_1 = __webpack_require__(14);
	exports.thunk = thunk_1.thunk;
	function init(modules, domApi) {
	    var i, j, cbs = {};
	    var api = domApi !== undefined ? domApi : htmldomapi_1.default;
	    for (i = 0; i < hooks.length; ++i) {
	        cbs[hooks[i]] = [];
	        for (j = 0; j < modules.length; ++j) {
	            var hook = modules[j][hooks[i]];
	            if (hook !== undefined) {
	                cbs[hooks[i]].push(hook);
	            }
	        }
	    }
	    function emptyNodeAt(elm) {
	        var id = elm.id ? '#' + elm.id : '';
	        var c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
	        return vnode_1.default(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
	    }
	    function createRmCb(childElm, listeners) {
	        return function rmCb() {
	            if (--listeners === 0) {
	                var parent_1 = api.parentNode(childElm);
	                api.removeChild(parent_1, childElm);
	            }
	        };
	    }
	    function createElm(vnode, insertedVnodeQueue) {
	        var i, data = vnode.data;
	        if (data !== undefined) {
	            if (isDef(i = data.hook) && isDef(i = i.init)) {
	                i(vnode);
	                data = vnode.data;
	            }
	        }
	        var children = vnode.children, sel = vnode.sel;
	        if (sel === '!') {
	            if (isUndef(vnode.text)) {
	                vnode.text = '';
	            }
	            vnode.elm = api.createComment(vnode.text);
	        }
	        else if (sel !== undefined) {
	            // Parse selector
	            var hashIdx = sel.indexOf('#');
	            var dotIdx = sel.indexOf('.', hashIdx);
	            var hash = hashIdx > 0 ? hashIdx : sel.length;
	            var dot = dotIdx > 0 ? dotIdx : sel.length;
	            var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
	            var elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag)
	                : api.createElement(tag);
	            if (hash < dot)
	                elm.id = sel.slice(hash + 1, dot);
	            if (dotIdx > 0)
	                elm.className = sel.slice(dot + 1).replace(/\./g, ' ');
	            for (i = 0; i < cbs.create.length; ++i)
	                cbs.create[i](emptyNode, vnode);
	            if (is.array(children)) {
	                for (i = 0; i < children.length; ++i) {
	                    var ch = children[i];
	                    if (ch != null) {
	                        api.appendChild(elm, createElm(ch, insertedVnodeQueue));
	                    }
	                }
	            }
	            else if (is.primitive(vnode.text)) {
	                api.appendChild(elm, api.createTextNode(vnode.text));
	            }
	            i = vnode.data.hook; // Reuse variable
	            if (isDef(i)) {
	                if (i.create)
	                    i.create(emptyNode, vnode);
	                if (i.insert)
	                    insertedVnodeQueue.push(vnode);
	            }
	        }
	        else {
	            vnode.elm = api.createTextNode(vnode.text);
	        }
	        return vnode.elm;
	    }
	    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
	        for (; startIdx <= endIdx; ++startIdx) {
	            var ch = vnodes[startIdx];
	            if (ch != null) {
	                api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
	            }
	        }
	    }
	    function invokeDestroyHook(vnode) {
	        var i, j, data = vnode.data;
	        if (data !== undefined) {
	            if (isDef(i = data.hook) && isDef(i = i.destroy))
	                i(vnode);
	            for (i = 0; i < cbs.destroy.length; ++i)
	                cbs.destroy[i](vnode);
	            if (vnode.children !== undefined) {
	                for (j = 0; j < vnode.children.length; ++j) {
	                    i = vnode.children[j];
	                    if (i != null && typeof i !== "string") {
	                        invokeDestroyHook(i);
	                    }
	                }
	            }
	        }
	    }
	    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
	        for (; startIdx <= endIdx; ++startIdx) {
	            var i_1 = void 0, listeners = void 0, rm = void 0, ch = vnodes[startIdx];
	            if (ch != null) {
	                if (isDef(ch.sel)) {
	                    invokeDestroyHook(ch);
	                    listeners = cbs.remove.length + 1;
	                    rm = createRmCb(ch.elm, listeners);
	                    for (i_1 = 0; i_1 < cbs.remove.length; ++i_1)
	                        cbs.remove[i_1](ch, rm);
	                    if (isDef(i_1 = ch.data) && isDef(i_1 = i_1.hook) && isDef(i_1 = i_1.remove)) {
	                        i_1(ch, rm);
	                    }
	                    else {
	                        rm();
	                    }
	                }
	                else {
	                    api.removeChild(parentElm, ch.elm);
	                }
	            }
	        }
	    }
	    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
	        var oldStartIdx = 0, newStartIdx = 0;
	        var oldEndIdx = oldCh.length - 1;
	        var oldStartVnode = oldCh[0];
	        var oldEndVnode = oldCh[oldEndIdx];
	        var newEndIdx = newCh.length - 1;
	        var newStartVnode = newCh[0];
	        var newEndVnode = newCh[newEndIdx];
	        var oldKeyToIdx;
	        var idxInOld;
	        var elmToMove;
	        var before;
	        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
	            if (oldStartVnode == null) {
	                oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
	            }
	            else if (oldEndVnode == null) {
	                oldEndVnode = oldCh[--oldEndIdx];
	            }
	            else if (newStartVnode == null) {
	                newStartVnode = newCh[++newStartIdx];
	            }
	            else if (newEndVnode == null) {
	                newEndVnode = newCh[--newEndIdx];
	            }
	            else if (sameVnode(oldStartVnode, newStartVnode)) {
	                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
	                oldStartVnode = oldCh[++oldStartIdx];
	                newStartVnode = newCh[++newStartIdx];
	            }
	            else if (sameVnode(oldEndVnode, newEndVnode)) {
	                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
	                oldEndVnode = oldCh[--oldEndIdx];
	                newEndVnode = newCh[--newEndIdx];
	            }
	            else if (sameVnode(oldStartVnode, newEndVnode)) {
	                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
	                api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
	                oldStartVnode = oldCh[++oldStartIdx];
	                newEndVnode = newCh[--newEndIdx];
	            }
	            else if (sameVnode(oldEndVnode, newStartVnode)) {
	                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
	                api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
	                oldEndVnode = oldCh[--oldEndIdx];
	                newStartVnode = newCh[++newStartIdx];
	            }
	            else {
	                if (oldKeyToIdx === undefined) {
	                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
	                }
	                idxInOld = oldKeyToIdx[newStartVnode.key];
	                if (isUndef(idxInOld)) {
	                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
	                    newStartVnode = newCh[++newStartIdx];
	                }
	                else {
	                    elmToMove = oldCh[idxInOld];
	                    if (elmToMove.sel !== newStartVnode.sel) {
	                        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
	                    }
	                    else {
	                        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
	                        oldCh[idxInOld] = undefined;
	                        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
	                    }
	                    newStartVnode = newCh[++newStartIdx];
	                }
	            }
	        }
	        if (oldStartIdx > oldEndIdx) {
	            before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
	            addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
	        }
	        else if (newStartIdx > newEndIdx) {
	            removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
	        }
	    }
	    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
	        var i, hook;
	        if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
	            i(oldVnode, vnode);
	        }
	        var elm = vnode.elm = oldVnode.elm;
	        var oldCh = oldVnode.children;
	        var ch = vnode.children;
	        if (oldVnode === vnode)
	            return;
	        if (vnode.data !== undefined) {
	            for (i = 0; i < cbs.update.length; ++i)
	                cbs.update[i](oldVnode, vnode);
	            i = vnode.data.hook;
	            if (isDef(i) && isDef(i = i.update))
	                i(oldVnode, vnode);
	        }
	        if (isUndef(vnode.text)) {
	            if (isDef(oldCh) && isDef(ch)) {
	                if (oldCh !== ch)
	                    updateChildren(elm, oldCh, ch, insertedVnodeQueue);
	            }
	            else if (isDef(ch)) {
	                if (isDef(oldVnode.text))
	                    api.setTextContent(elm, '');
	                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
	            }
	            else if (isDef(oldCh)) {
	                removeVnodes(elm, oldCh, 0, oldCh.length - 1);
	            }
	            else if (isDef(oldVnode.text)) {
	                api.setTextContent(elm, '');
	            }
	        }
	        else if (oldVnode.text !== vnode.text) {
	            api.setTextContent(elm, vnode.text);
	        }
	        if (isDef(hook) && isDef(i = hook.postpatch)) {
	            i(oldVnode, vnode);
	        }
	    }
	    return function patch(oldVnode, vnode) {
	        var i, elm, parent;
	        var insertedVnodeQueue = [];
	        for (i = 0; i < cbs.pre.length; ++i)
	            cbs.pre[i]();
	        if (!isVnode(oldVnode)) {
	            oldVnode = emptyNodeAt(oldVnode);
	        }
	        if (sameVnode(oldVnode, vnode)) {
	            patchVnode(oldVnode, vnode, insertedVnodeQueue);
	        }
	        else {
	            elm = oldVnode.elm;
	            parent = api.parentNode(elm);
	            createElm(vnode, insertedVnodeQueue);
	            if (parent !== null) {
	                api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
	                removeVnodes(parent, [oldVnode], 0, 0);
	            }
	        }
	        for (i = 0; i < insertedVnodeQueue.length; ++i) {
	            insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
	        }
	        for (i = 0; i < cbs.post.length; ++i)
	            cbs.post[i]();
	        return vnode;
	    };
	}
	exports.init = init;
	//# sourceMappingURL=snabbdom.js.map

/***/ },
/* 31 */
/***/ function(module, exports) {

	"use strict";
	function createElement(tagName) {
	    return document.createElement(tagName);
	}
	function createElementNS(namespaceURI, qualifiedName) {
	    return document.createElementNS(namespaceURI, qualifiedName);
	}
	function createTextNode(text) {
	    return document.createTextNode(text);
	}
	function createComment(text) {
	    return document.createComment(text);
	}
	function insertBefore(parentNode, newNode, referenceNode) {
	    parentNode.insertBefore(newNode, referenceNode);
	}
	function removeChild(node, child) {
	    node.removeChild(child);
	}
	function appendChild(node, child) {
	    node.appendChild(child);
	}
	function parentNode(node) {
	    return node.parentNode;
	}
	function nextSibling(node) {
	    return node.nextSibling;
	}
	function tagName(elm) {
	    return elm.tagName;
	}
	function setTextContent(node, text) {
	    node.textContent = text;
	}
	function getTextContent(node) {
	    return node.textContent;
	}
	function isElement(node) {
	    return node.nodeType === 1;
	}
	function isText(node) {
	    return node.nodeType === 3;
	}
	function isComment(node) {
	    return node.nodeType === 8;
	}
	exports.htmlDomApi = {
	    createElement: createElement,
	    createElementNS: createElementNS,
	    createTextNode: createTextNode,
	    createComment: createComment,
	    insertBefore: insertBefore,
	    removeChild: removeChild,
	    appendChild: appendChild,
	    parentNode: parentNode,
	    nextSibling: nextSibling,
	    tagName: tagName,
	    setTextContent: setTextContent,
	    getTextContent: getTextContent,
	    isElement: isElement,
	    isText: isText,
	    isComment: isComment,
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = exports.htmlDomApi;
	//# sourceMappingURL=htmldomapi.js.map

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var vnode_1 = __webpack_require__(16);
	var htmldomapi_1 = __webpack_require__(31);
	function toVNode(node, domApi) {
	    var api = domApi !== undefined ? domApi : htmldomapi_1.default;
	    var text;
	    if (api.isElement(node)) {
	        var id = node.id ? '#' + node.id : '';
	        var cn = node.getAttribute('class');
	        var c = cn ? '.' + cn.split(' ').join('.') : '';
	        var sel = api.tagName(node).toLowerCase() + id + c;
	        var attrs = {};
	        var children = [];
	        var name_1;
	        var i = void 0, n = void 0;
	        var elmAttrs = node.attributes;
	        var elmChildren = node.childNodes;
	        for (i = 0, n = elmAttrs.length; i < n; i++) {
	            name_1 = elmAttrs[i].nodeName;
	            if (name_1 !== 'id' && name_1 !== 'class') {
	                attrs[name_1] = elmAttrs[i].nodeValue;
	            }
	        }
	        for (i = 0, n = elmChildren.length; i < n; i++) {
	            children.push(toVNode(elmChildren[i]));
	        }
	        return vnode_1.default(sel, { attrs: attrs }, children, undefined, node);
	    }
	    else if (api.isText(node)) {
	        text = api.getTextContent(node);
	        return vnode_1.default(undefined, undefined, undefined, text, node);
	    }
	    else if (api.isComment(node)) {
	        text = api.getTextContent(node);
	        return vnode_1.default('!', undefined, undefined, text, undefined);
	    }
	    else {
	        return vnode_1.default('', {}, [], undefined, undefined);
	    }
	}
	exports.toVNode = toVNode;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = toVNode;
	//# sourceMappingURL=tovnode.js.map

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var h_1 = __webpack_require__(15);
	var classNameFromVNode_1 = __webpack_require__(34);
	var selectorParser_1 = __webpack_require__(35);
	var VNodeWrapper = (function () {
	    function VNodeWrapper(rootElement) {
	        this.rootElement = rootElement;
	    }
	    VNodeWrapper.prototype.call = function (vnode) {
	        if (vnode === null) {
	            return this.wrap([]);
	        }
	        var _a = selectorParser_1.selectorParser(vnode), selTagName = _a.tagName, selId = _a.id;
	        var vNodeClassName = classNameFromVNode_1.classNameFromVNode(vnode);
	        var vNodeData = vnode.data || {};
	        var vNodeDataProps = vNodeData.props || {};
	        var _b = vNodeDataProps.id, vNodeId = _b === void 0 ? selId : _b;
	        var isVNodeAndRootElementIdentical = typeof vNodeId === 'string' &&
	            vNodeId.toUpperCase() === this.rootElement.id.toUpperCase() &&
	            selTagName.toUpperCase() === this.rootElement.tagName.toUpperCase() &&
	            vNodeClassName.toUpperCase() === this.rootElement.className.toUpperCase();
	        if (isVNodeAndRootElementIdentical) {
	            return vnode;
	        }
	        return this.wrap([vnode]);
	    };
	    VNodeWrapper.prototype.wrap = function (children) {
	        var _a = this.rootElement, tagName = _a.tagName, id = _a.id, className = _a.className;
	        var selId = id ? "#" + id : '';
	        var selClass = className ?
	            "." + className.split(" ").join(".") : '';
	        return h_1.h("" + tagName.toLowerCase() + selId + selClass, {}, children);
	    };
	    return VNodeWrapper;
	}());
	exports.VNodeWrapper = VNodeWrapper;
	//# sourceMappingURL=VNodeWrapper.js.map

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var selectorParser_1 = __webpack_require__(35);
	function classNameFromVNode(vNode) {
	    var _a = selectorParser_1.selectorParser(vNode).className, cn = _a === void 0 ? '' : _a;
	    if (!vNode.data) {
	        return cn;
	    }
	    var _b = vNode.data, dataClass = _b.class, props = _b.props;
	    if (dataClass) {
	        var c = Object.keys(dataClass)
	            .filter(function (cl) { return dataClass[cl]; });
	        cn += " " + c.join(" ");
	    }
	    if (props && props.className) {
	        cn += " " + props.className;
	    }
	    return cn && cn.trim();
	}
	exports.classNameFromVNode = classNameFromVNode;
	//# sourceMappingURL=classNameFromVNode.js.map

/***/ },
/* 35 */
/***/ function(module, exports) {

	"use strict";
	function selectorParser(_a) {
	    var sel = _a.sel;
	    var hashIdx = sel.indexOf('#');
	    var dotIdx = sel.indexOf('.', hashIdx);
	    var hash = hashIdx > 0 ? hashIdx : sel.length;
	    var dot = dotIdx > 0 ? dotIdx : sel.length;
	    var tagName = hashIdx !== -1 || dotIdx !== -1 ?
	        sel.slice(0, Math.min(hash, dot)) :
	        sel;
	    var id = hash < dot ? sel.slice(hash + 1, dot) : void 0;
	    var className = dotIdx > 0 ? sel.slice(dot + 1).replace(/\./g, ' ') : void 0;
	    return {
	        tagName: tagName,
	        id: id,
	        className: className,
	    };
	}
	exports.selectorParser = selectorParser;
	//# sourceMappingURL=selectorParser.js.map

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var class_1 = __webpack_require__(37);
	exports.ClassModule = class_1.default;
	var props_1 = __webpack_require__(38);
	exports.PropsModule = props_1.default;
	var attributes_1 = __webpack_require__(39);
	exports.AttrsModule = attributes_1.default;
	var style_1 = __webpack_require__(40);
	exports.StyleModule = style_1.default;
	var dataset_1 = __webpack_require__(41);
	exports.DatasetModule = dataset_1.default;
	var modules = [style_1.default, class_1.default, props_1.default, attributes_1.default, dataset_1.default];
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = modules;
	//# sourceMappingURL=modules.js.map

/***/ },
/* 37 */
/***/ function(module, exports) {

	"use strict";
	function updateClass(oldVnode, vnode) {
	    var cur, name, elm = vnode.elm, oldClass = oldVnode.data.class, klass = vnode.data.class;
	    if (!oldClass && !klass)
	        return;
	    if (oldClass === klass)
	        return;
	    oldClass = oldClass || {};
	    klass = klass || {};
	    for (name in oldClass) {
	        if (!klass[name]) {
	            elm.classList.remove(name);
	        }
	    }
	    for (name in klass) {
	        cur = klass[name];
	        if (cur !== oldClass[name]) {
	            elm.classList[cur ? 'add' : 'remove'](name);
	        }
	    }
	}
	exports.classModule = { create: updateClass, update: updateClass };
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = exports.classModule;
	//# sourceMappingURL=class.js.map

/***/ },
/* 38 */
/***/ function(module, exports) {

	"use strict";
	function updateProps(oldVnode, vnode) {
	    var key, cur, old, elm = vnode.elm, oldProps = oldVnode.data.props, props = vnode.data.props;
	    if (!oldProps && !props)
	        return;
	    if (oldProps === props)
	        return;
	    oldProps = oldProps || {};
	    props = props || {};
	    for (key in oldProps) {
	        if (!props[key]) {
	            delete elm[key];
	        }
	    }
	    for (key in props) {
	        cur = props[key];
	        old = oldProps[key];
	        if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
	            elm[key] = cur;
	        }
	    }
	}
	exports.propsModule = { create: updateProps, update: updateProps };
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = exports.propsModule;
	//# sourceMappingURL=props.js.map

/***/ },
/* 39 */
/***/ function(module, exports) {

	"use strict";
	var NamespaceURIs = {
	    "xlink": "http://www.w3.org/1999/xlink"
	};
	var booleanAttrs = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "compact", "controls", "declare",
	    "default", "defaultchecked", "defaultmuted", "defaultselected", "defer", "disabled", "draggable",
	    "enabled", "formnovalidate", "hidden", "indeterminate", "inert", "ismap", "itemscope", "loop", "multiple",
	    "muted", "nohref", "noresize", "noshade", "novalidate", "nowrap", "open", "pauseonexit", "readonly",
	    "required", "reversed", "scoped", "seamless", "selected", "sortable", "spellcheck", "translate",
	    "truespeed", "typemustmatch", "visible"];
	var booleanAttrsDict = Object.create(null);
	for (var i = 0, len = booleanAttrs.length; i < len; i++) {
	    booleanAttrsDict[booleanAttrs[i]] = true;
	}
	function updateAttrs(oldVnode, vnode) {
	    var key, cur, old, elm = vnode.elm, oldAttrs = oldVnode.data.attrs, attrs = vnode.data.attrs, namespaceSplit;
	    if (!oldAttrs && !attrs)
	        return;
	    if (oldAttrs === attrs)
	        return;
	    oldAttrs = oldAttrs || {};
	    attrs = attrs || {};
	    // update modified attributes, add new attributes
	    for (key in attrs) {
	        cur = attrs[key];
	        old = oldAttrs[key];
	        if (old !== cur) {
	            if (!cur && booleanAttrsDict[key])
	                elm.removeAttribute(key);
	            else {
	                namespaceSplit = key.split(":");
	                if (namespaceSplit.length > 1 && NamespaceURIs.hasOwnProperty(namespaceSplit[0]))
	                    elm.setAttributeNS(NamespaceURIs[namespaceSplit[0]], key, cur);
	                else
	                    elm.setAttribute(key, cur);
	            }
	        }
	    }
	    //remove removed attributes
	    // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
	    // the other option is to remove all attributes with value == undefined
	    for (key in oldAttrs) {
	        if (!(key in attrs)) {
	            elm.removeAttribute(key);
	        }
	    }
	}
	exports.attributesModule = { create: updateAttrs, update: updateAttrs };
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = exports.attributesModule;
	//# sourceMappingURL=attributes.js.map

/***/ },
/* 40 */
/***/ function(module, exports) {

	"use strict";
	var raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;
	var nextFrame = function (fn) { raf(function () { raf(fn); }); };
	function setNextFrame(obj, prop, val) {
	    nextFrame(function () { obj[prop] = val; });
	}
	function updateStyle(oldVnode, vnode) {
	    var cur, name, elm = vnode.elm, oldStyle = oldVnode.data.style, style = vnode.data.style;
	    if (!oldStyle && !style)
	        return;
	    if (oldStyle === style)
	        return;
	    oldStyle = oldStyle || {};
	    style = style || {};
	    var oldHasDel = 'delayed' in oldStyle;
	    for (name in oldStyle) {
	        if (!style[name]) {
	            if (name[0] === '-' && name[1] === '-') {
	                elm.style.removeProperty(name);
	            }
	            else {
	                elm.style[name] = '';
	            }
	        }
	    }
	    for (name in style) {
	        cur = style[name];
	        if (name === 'delayed') {
	            for (name in style.delayed) {
	                cur = style.delayed[name];
	                if (!oldHasDel || cur !== oldStyle.delayed[name]) {
	                    setNextFrame(elm.style, name, cur);
	                }
	            }
	        }
	        else if (name !== 'remove' && cur !== oldStyle[name]) {
	            if (name[0] === '-' && name[1] === '-') {
	                elm.style.setProperty(name, cur);
	            }
	            else {
	                elm.style[name] = cur;
	            }
	        }
	    }
	}
	function applyDestroyStyle(vnode) {
	    var style, name, elm = vnode.elm, s = vnode.data.style;
	    if (!s || !(style = s.destroy))
	        return;
	    for (name in style) {
	        elm.style[name] = style[name];
	    }
	}
	function applyRemoveStyle(vnode, rm) {
	    var s = vnode.data.style;
	    if (!s || !s.remove) {
	        rm();
	        return;
	    }
	    var name, elm = vnode.elm, i = 0, compStyle, style = s.remove, amount = 0, applied = [];
	    for (name in style) {
	        applied.push(name);
	        elm.style[name] = style[name];
	    }
	    compStyle = getComputedStyle(elm);
	    var props = compStyle['transition-property'].split(', ');
	    for (; i < props.length; ++i) {
	        if (applied.indexOf(props[i]) !== -1)
	            amount++;
	    }
	    elm.addEventListener('transitionend', function (ev) {
	        if (ev.target === elm)
	            --amount;
	        if (amount === 0)
	            rm();
	    });
	}
	exports.styleModule = {
	    create: updateStyle,
	    update: updateStyle,
	    destroy: applyDestroyStyle,
	    remove: applyRemoveStyle
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = exports.styleModule;
	//# sourceMappingURL=style.js.map

/***/ },
/* 41 */
/***/ function(module, exports) {

	"use strict";
	var CAPS_REGEX = /[A-Z]/g;
	function updateDataset(oldVnode, vnode) {
	    var elm = vnode.elm, oldDataset = oldVnode.data.dataset, dataset = vnode.data.dataset, key;
	    if (!oldDataset && !dataset)
	        return;
	    if (oldDataset === dataset)
	        return;
	    oldDataset = oldDataset || {};
	    dataset = dataset || {};
	    var d = elm.dataset;
	    for (key in oldDataset) {
	        if (!dataset[key]) {
	            if (d) {
	                delete d[key];
	            }
	            else {
	                elm.removeAttribute('data-' + key.replace(CAPS_REGEX, '-$&').toLowerCase());
	            }
	        }
	    }
	    for (key in dataset) {
	        if (oldDataset[key] !== dataset[key]) {
	            if (d) {
	                d[key] = dataset[key];
	            }
	            else {
	                elm.setAttribute('data-' + key.replace(CAPS_REGEX, '-$&').toLowerCase(), dataset[key]);
	            }
	        }
	    }
	}
	exports.datasetModule = { create: updateDataset, update: updateDataset };
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = exports.datasetModule;
	//# sourceMappingURL=dataset.js.map

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var MapPolyfill = __webpack_require__(43);
	var IsolateModule = (function () {
	    function IsolateModule() {
	        this.elementsByFullScope = new MapPolyfill();
	        this.delegatorsByFullScope = new MapPolyfill();
	        this.fullScopesBeingUpdated = [];
	    }
	    IsolateModule.prototype.cleanupVNode = function (_a) {
	        var data = _a.data, elm = _a.elm;
	        var fullScope = (data || {}).isolate || '';
	        var isCurrentElm = this.elementsByFullScope.get(fullScope) === elm;
	        var isScopeBeingUpdated = this.fullScopesBeingUpdated.indexOf(fullScope) >= 0;
	        if (fullScope && isCurrentElm && !isScopeBeingUpdated) {
	            this.elementsByFullScope.delete(fullScope);
	            this.delegatorsByFullScope.delete(fullScope);
	        }
	    };
	    IsolateModule.prototype.getElement = function (fullScope) {
	        return this.elementsByFullScope.get(fullScope);
	    };
	    IsolateModule.prototype.getFullScope = function (elm) {
	        var iterator = this.elementsByFullScope.entries();
	        for (var result = iterator.next(); !!result.value; result = iterator.next()) {
	            var _a = result.value, fullScope = _a[0], element = _a[1];
	            if (elm === element) {
	                return fullScope;
	            }
	        }
	        return '';
	    };
	    IsolateModule.prototype.addEventDelegator = function (fullScope, eventDelegator) {
	        var delegators = this.delegatorsByFullScope.get(fullScope);
	        if (!delegators) {
	            delegators = [];
	            this.delegatorsByFullScope.set(fullScope, delegators);
	        }
	        delegators[delegators.length] = eventDelegator;
	    };
	    IsolateModule.prototype.reset = function () {
	        this.elementsByFullScope.clear();
	        this.delegatorsByFullScope.clear();
	        this.fullScopesBeingUpdated = [];
	    };
	    IsolateModule.prototype.createModule = function () {
	        var self = this;
	        return {
	            create: function (oldVNode, vNode) {
	                var _a = oldVNode.data, oldData = _a === void 0 ? {} : _a;
	                var elm = vNode.elm, _b = vNode.data, data = _b === void 0 ? {} : _b;
	                var oldFullScope = oldData.isolate || '';
	                var fullScope = data.isolate || '';
	                // Update data structures with the newly-created element
	                if (fullScope) {
	                    self.fullScopesBeingUpdated.push(fullScope);
	                    if (oldFullScope) {
	                        self.elementsByFullScope.delete(oldFullScope);
	                    }
	                    self.elementsByFullScope.set(fullScope, elm);
	                    // Update delegators for this scope
	                    var delegators = self.delegatorsByFullScope.get(fullScope);
	                    if (delegators) {
	                        var len = delegators.length;
	                        for (var i = 0; i < len; ++i) {
	                            delegators[i].updateOrigin(elm);
	                        }
	                    }
	                }
	                if (oldFullScope && !fullScope) {
	                    self.elementsByFullScope.delete(fullScope);
	                }
	            },
	            update: function (oldVNode, vNode) {
	                var _a = oldVNode.data, oldData = _a === void 0 ? {} : _a;
	                var elm = vNode.elm, _b = vNode.data, data = _b === void 0 ? {} : _b;
	                var oldFullScope = oldData.isolate || '';
	                var fullScope = data.isolate || '';
	                // Same element, but different scope, so update the data structures
	                if (fullScope && fullScope !== oldFullScope) {
	                    if (oldFullScope) {
	                        self.elementsByFullScope.delete(oldFullScope);
	                    }
	                    self.elementsByFullScope.set(fullScope, elm);
	                    var delegators = self.delegatorsByFullScope.get(oldFullScope);
	                    if (delegators) {
	                        self.delegatorsByFullScope.delete(oldFullScope);
	                        self.delegatorsByFullScope.set(fullScope, delegators);
	                    }
	                }
	                // Same element, but lost the scope, so update the data structures
	                if (oldFullScope && !fullScope) {
	                    self.elementsByFullScope.delete(oldFullScope);
	                    self.delegatorsByFullScope.delete(oldFullScope);
	                }
	            },
	            destroy: function (vNode) {
	                self.cleanupVNode(vNode);
	            },
	            remove: function (vNode, cb) {
	                self.cleanupVNode(vNode);
	                cb();
	            },
	            post: function () {
	                self.fullScopesBeingUpdated = [];
	            },
	        };
	    };
	    return IsolateModule;
	}());
	exports.IsolateModule = IsolateModule;
	//# sourceMappingURL=IsolateModule.js.map

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(44)() ? Map : __webpack_require__(45);


/***/ },
/* 44 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function () {
		var map, iterator, result;
		if (typeof Map !== 'function') return false;
		try {
			// WebKit doesn't support arguments and crashes
			map = new Map([['raz', 'one'], ['dwa', 'two'], ['trzy', 'three']]);
		} catch (e) {
			return false;
		}
		if (String(map) !== '[object Map]') return false;
		if (map.size !== 3) return false;
		if (typeof map.clear !== 'function') return false;
		if (typeof map.delete !== 'function') return false;
		if (typeof map.entries !== 'function') return false;
		if (typeof map.forEach !== 'function') return false;
		if (typeof map.get !== 'function') return false;
		if (typeof map.has !== 'function') return false;
		if (typeof map.keys !== 'function') return false;
		if (typeof map.set !== 'function') return false;
		if (typeof map.values !== 'function') return false;
	
		iterator = map.entries();
		result = iterator.next();
		if (result.done !== false) return false;
		if (!result.value) return false;
		if (result.value[0] !== 'raz') return false;
		if (result.value[1] !== 'one') return false;
	
		return true;
	};


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var clear          = __webpack_require__(46)
	  , eIndexOf       = __webpack_require__(48)
	  , setPrototypeOf = __webpack_require__(54)
	  , callable       = __webpack_require__(59)
	  , validValue     = __webpack_require__(47)
	  , d              = __webpack_require__(60)
	  , ee             = __webpack_require__(72)
	  , Symbol         = __webpack_require__(73)
	  , iterator       = __webpack_require__(78)
	  , forOf          = __webpack_require__(82)
	  , Iterator       = __webpack_require__(92)
	  , isNative       = __webpack_require__(95)
	
	  , call = Function.prototype.call
	  , defineProperties = Object.defineProperties, getPrototypeOf = Object.getPrototypeOf
	  , MapPoly;
	
	module.exports = MapPoly = function (/*iterable*/) {
		var iterable = arguments[0], keys, values, self;
		if (!(this instanceof MapPoly)) throw new TypeError('Constructor requires \'new\'');
		if (isNative && setPrototypeOf && (Map !== MapPoly)) {
			self = setPrototypeOf(new Map(), getPrototypeOf(this));
		} else {
			self = this;
		}
		if (iterable != null) iterator(iterable);
		defineProperties(self, {
			__mapKeysData__: d('c', keys = []),
			__mapValuesData__: d('c', values = [])
		});
		if (!iterable) return self;
		forOf(iterable, function (value) {
			var key = validValue(value)[0];
			value = value[1];
			if (eIndexOf.call(keys, key) !== -1) return;
			keys.push(key);
			values.push(value);
		}, self);
		return self;
	};
	
	if (isNative) {
		if (setPrototypeOf) setPrototypeOf(MapPoly, Map);
		MapPoly.prototype = Object.create(Map.prototype, {
			constructor: d(MapPoly)
		});
	}
	
	ee(defineProperties(MapPoly.prototype, {
		clear: d(function () {
			if (!this.__mapKeysData__.length) return;
			clear.call(this.__mapKeysData__);
			clear.call(this.__mapValuesData__);
			this.emit('_clear');
		}),
		delete: d(function (key) {
			var index = eIndexOf.call(this.__mapKeysData__, key);
			if (index === -1) return false;
			this.__mapKeysData__.splice(index, 1);
			this.__mapValuesData__.splice(index, 1);
			this.emit('_delete', index, key);
			return true;
		}),
		entries: d(function () { return new Iterator(this, 'key+value'); }),
		forEach: d(function (cb/*, thisArg*/) {
			var thisArg = arguments[1], iterator, result;
			callable(cb);
			iterator = this.entries();
			result = iterator._next();
			while (result !== undefined) {
				call.call(cb, thisArg, this.__mapValuesData__[result],
					this.__mapKeysData__[result], this);
				result = iterator._next();
			}
		}),
		get: d(function (key) {
			var index = eIndexOf.call(this.__mapKeysData__, key);
			if (index === -1) return;
			return this.__mapValuesData__[index];
		}),
		has: d(function (key) {
			return (eIndexOf.call(this.__mapKeysData__, key) !== -1);
		}),
		keys: d(function () { return new Iterator(this, 'key'); }),
		set: d(function (key, value) {
			var index = eIndexOf.call(this.__mapKeysData__, key), emit;
			if (index === -1) {
				index = this.__mapKeysData__.push(key) - 1;
				emit = true;
			}
			this.__mapValuesData__[index] = value;
			if (emit) this.emit('_add', index, key);
			return this;
		}),
		size: d.gs(function () { return this.__mapKeysData__.length; }),
		values: d(function () { return new Iterator(this, 'value'); }),
		toString: d(function () { return '[object Map]'; })
	}));
	Object.defineProperty(MapPoly.prototype, Symbol.iterator, d(function () {
		return this.entries();
	}));
	Object.defineProperty(MapPoly.prototype, Symbol.toStringTag, d('c', 'Map'));


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	// Inspired by Google Closure:
	// http://closure-library.googlecode.com/svn/docs/
	// closure_goog_array_array.js.html#goog.array.clear
	
	'use strict';
	
	var value = __webpack_require__(47);
	
	module.exports = function () {
		value(this).length = 0;
		return this;
	};


/***/ },
/* 47 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function (value) {
		if (value == null) throw new TypeError("Cannot use null or undefined");
		return value;
	};


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var toPosInt = __webpack_require__(49)
	  , value    = __webpack_require__(47)
	
	  , indexOf = Array.prototype.indexOf
	  , hasOwnProperty = Object.prototype.hasOwnProperty
	  , abs = Math.abs, floor = Math.floor;
	
	module.exports = function (searchElement/*, fromIndex*/) {
		var i, l, fromIndex, val;
		if (searchElement === searchElement) { //jslint: ignore
			return indexOf.apply(this, arguments);
		}
	
		l = toPosInt(value(this).length);
		fromIndex = arguments[1];
		if (isNaN(fromIndex)) fromIndex = 0;
		else if (fromIndex >= 0) fromIndex = floor(fromIndex);
		else fromIndex = toPosInt(this.length) - floor(abs(fromIndex));
	
		for (i = fromIndex; i < l; ++i) {
			if (hasOwnProperty.call(this, i)) {
				val = this[i];
				if (val !== val) return i; //jslint: ignore
			}
		}
		return -1;
	};


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var toInteger = __webpack_require__(50)
	
	  , max = Math.max;
	
	module.exports = function (value) { return max(0, toInteger(value)); };


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var sign = __webpack_require__(51)
	
	  , abs = Math.abs, floor = Math.floor;
	
	module.exports = function (value) {
		if (isNaN(value)) return 0;
		value = Number(value);
		if ((value === 0) || !isFinite(value)) return value;
		return sign(value) * floor(abs(value));
	};


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(52)()
		? Math.sign
		: __webpack_require__(53);


/***/ },
/* 52 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function () {
		var sign = Math.sign;
		if (typeof sign !== 'function') return false;
		return ((sign(10) === 1) && (sign(-20) === -1));
	};


/***/ },
/* 53 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function (value) {
		value = Number(value);
		if (isNaN(value) || (value === 0)) return value;
		return (value > 0) ? 1 : -1;
	};


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(55)()
		? Object.setPrototypeOf
		: __webpack_require__(56);


/***/ },
/* 55 */
/***/ function(module, exports) {

	'use strict';
	
	var create = Object.create, getPrototypeOf = Object.getPrototypeOf
	  , x = {};
	
	module.exports = function (/*customCreate*/) {
		var setPrototypeOf = Object.setPrototypeOf
		  , customCreate = arguments[0] || create;
		if (typeof setPrototypeOf !== 'function') return false;
		return getPrototypeOf(setPrototypeOf(customCreate(null), x)) === x;
	};


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	// Big thanks to @WebReflection for sorting this out
	// https://gist.github.com/WebReflection/5593554
	
	'use strict';
	
	var isObject      = __webpack_require__(57)
	  , value         = __webpack_require__(47)
	
	  , isPrototypeOf = Object.prototype.isPrototypeOf
	  , defineProperty = Object.defineProperty
	  , nullDesc = { configurable: true, enumerable: false, writable: true,
			value: undefined }
	  , validate;
	
	validate = function (obj, prototype) {
		value(obj);
		if ((prototype === null) || isObject(prototype)) return obj;
		throw new TypeError('Prototype must be null or an object');
	};
	
	module.exports = (function (status) {
		var fn, set;
		if (!status) return null;
		if (status.level === 2) {
			if (status.set) {
				set = status.set;
				fn = function (obj, prototype) {
					set.call(validate(obj, prototype), prototype);
					return obj;
				};
			} else {
				fn = function (obj, prototype) {
					validate(obj, prototype).__proto__ = prototype;
					return obj;
				};
			}
		} else {
			fn = function self(obj, prototype) {
				var isNullBase;
				validate(obj, prototype);
				isNullBase = isPrototypeOf.call(self.nullPolyfill, obj);
				if (isNullBase) delete self.nullPolyfill.__proto__;
				if (prototype === null) prototype = self.nullPolyfill;
				obj.__proto__ = prototype;
				if (isNullBase) defineProperty(self.nullPolyfill, '__proto__', nullDesc);
				return obj;
			};
		}
		return Object.defineProperty(fn, 'level', { configurable: false,
			enumerable: false, writable: false, value: status.level });
	}((function () {
		var x = Object.create(null), y = {}, set
		  , desc = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__');
	
		if (desc) {
			try {
				set = desc.set; // Opera crashes at this point
				set.call(x, y);
			} catch (ignore) { }
			if (Object.getPrototypeOf(x) === y) return { set: set, level: 2 };
		}
	
		x.__proto__ = y;
		if (Object.getPrototypeOf(x) === y) return { level: 2 };
	
		x = {};
		x.__proto__ = y;
		if (Object.getPrototypeOf(x) === y) return { level: 1 };
	
		return false;
	}())));
	
	__webpack_require__(58);


/***/ },
/* 57 */
/***/ function(module, exports) {

	'use strict';
	
	var map = { function: true, object: true };
	
	module.exports = function (x) {
		return ((x != null) && map[typeof x]) || false;
	};


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	// Workaround for http://code.google.com/p/v8/issues/detail?id=2804
	
	'use strict';
	
	var create = Object.create, shim;
	
	if (!__webpack_require__(55)()) {
		shim = __webpack_require__(56);
	}
	
	module.exports = (function () {
		var nullObject, props, desc;
		if (!shim) return create;
		if (shim.level !== 1) return create;
	
		nullObject = {};
		props = {};
		desc = { configurable: false, enumerable: false, writable: true,
			value: undefined };
		Object.getOwnPropertyNames(Object.prototype).forEach(function (name) {
			if (name === '__proto__') {
				props[name] = { configurable: true, enumerable: false, writable: true,
					value: undefined };
				return;
			}
			props[name] = desc;
		});
		Object.defineProperties(nullObject, props);
	
		Object.defineProperty(shim, 'nullPolyfill', { configurable: false,
			enumerable: false, writable: false, value: nullObject });
	
		return function (prototype, props) {
			return create((prototype === null) ? nullObject : prototype, props);
		};
	}());


/***/ },
/* 59 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function (fn) {
		if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
		return fn;
	};


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var assign        = __webpack_require__(61)
	  , normalizeOpts = __webpack_require__(67)
	  , isCallable    = __webpack_require__(68)
	  , contains      = __webpack_require__(69)
	
	  , d;
	
	d = module.exports = function (dscr, value/*, options*/) {
		var c, e, w, options, desc;
		if ((arguments.length < 2) || (typeof dscr !== 'string')) {
			options = value;
			value = dscr;
			dscr = null;
		} else {
			options = arguments[2];
		}
		if (dscr == null) {
			c = w = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
			w = contains.call(dscr, 'w');
		}
	
		desc = { value: value, configurable: c, enumerable: e, writable: w };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};
	
	d.gs = function (dscr, get, set/*, options*/) {
		var c, e, options, desc;
		if (typeof dscr !== 'string') {
			options = set;
			set = get;
			get = dscr;
			dscr = null;
		} else {
			options = arguments[3];
		}
		if (get == null) {
			get = undefined;
		} else if (!isCallable(get)) {
			options = get;
			get = set = undefined;
		} else if (set == null) {
			set = undefined;
		} else if (!isCallable(set)) {
			options = set;
			set = undefined;
		}
		if (dscr == null) {
			c = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
		}
	
		desc = { get: get, set: set, configurable: c, enumerable: e };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(62)()
		? Object.assign
		: __webpack_require__(63);


/***/ },
/* 62 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function () {
		var assign = Object.assign, obj;
		if (typeof assign !== 'function') return false;
		obj = { foo: 'raz' };
		assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
		return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
	};


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var keys  = __webpack_require__(64)
	  , value = __webpack_require__(47)
	
	  , max = Math.max;
	
	module.exports = function (dest, src/*, …srcn*/) {
		var error, i, l = max(arguments.length, 2), assign;
		dest = Object(value(dest));
		assign = function (key) {
			try { dest[key] = src[key]; } catch (e) {
				if (!error) error = e;
			}
		};
		for (i = 1; i < l; ++i) {
			src = arguments[i];
			keys(src).forEach(assign);
		}
		if (error !== undefined) throw error;
		return dest;
	};


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(65)()
		? Object.keys
		: __webpack_require__(66);


/***/ },
/* 65 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function () {
		try {
			Object.keys('primitive');
			return true;
		} catch (e) { return false; }
	};


/***/ },
/* 66 */
/***/ function(module, exports) {

	'use strict';
	
	var keys = Object.keys;
	
	module.exports = function (object) {
		return keys(object == null ? object : Object(object));
	};


/***/ },
/* 67 */
/***/ function(module, exports) {

	'use strict';
	
	var forEach = Array.prototype.forEach, create = Object.create;
	
	var process = function (src, obj) {
		var key;
		for (key in src) obj[key] = src[key];
	};
	
	module.exports = function (options/*, …options*/) {
		var result = create(null);
		forEach.call(arguments, function (options) {
			if (options == null) return;
			process(Object(options), result);
		});
		return result;
	};


/***/ },
/* 68 */
/***/ function(module, exports) {

	// Deprecated
	
	'use strict';
	
	module.exports = function (obj) { return typeof obj === 'function'; };


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(70)()
		? String.prototype.contains
		: __webpack_require__(71);


/***/ },
/* 70 */
/***/ function(module, exports) {

	'use strict';
	
	var str = 'razdwatrzy';
	
	module.exports = function () {
		if (typeof str.contains !== 'function') return false;
		return ((str.contains('dwa') === true) && (str.contains('foo') === false));
	};


/***/ },
/* 71 */
/***/ function(module, exports) {

	'use strict';
	
	var indexOf = String.prototype.indexOf;
	
	module.exports = function (searchString/*, position*/) {
		return indexOf.call(this, searchString, arguments[1]) > -1;
	};


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var d        = __webpack_require__(60)
	  , callable = __webpack_require__(59)
	
	  , apply = Function.prototype.apply, call = Function.prototype.call
	  , create = Object.create, defineProperty = Object.defineProperty
	  , defineProperties = Object.defineProperties
	  , hasOwnProperty = Object.prototype.hasOwnProperty
	  , descriptor = { configurable: true, enumerable: false, writable: true }
	
	  , on, once, off, emit, methods, descriptors, base;
	
	on = function (type, listener) {
		var data;
	
		callable(listener);
	
		if (!hasOwnProperty.call(this, '__ee__')) {
			data = descriptor.value = create(null);
			defineProperty(this, '__ee__', descriptor);
			descriptor.value = null;
		} else {
			data = this.__ee__;
		}
		if (!data[type]) data[type] = listener;
		else if (typeof data[type] === 'object') data[type].push(listener);
		else data[type] = [data[type], listener];
	
		return this;
	};
	
	once = function (type, listener) {
		var once, self;
	
		callable(listener);
		self = this;
		on.call(this, type, once = function () {
			off.call(self, type, once);
			apply.call(listener, this, arguments);
		});
	
		once.__eeOnceListener__ = listener;
		return this;
	};
	
	off = function (type, listener) {
		var data, listeners, candidate, i;
	
		callable(listener);
	
		if (!hasOwnProperty.call(this, '__ee__')) return this;
		data = this.__ee__;
		if (!data[type]) return this;
		listeners = data[type];
	
		if (typeof listeners === 'object') {
			for (i = 0; (candidate = listeners[i]); ++i) {
				if ((candidate === listener) ||
						(candidate.__eeOnceListener__ === listener)) {
					if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
					else listeners.splice(i, 1);
				}
			}
		} else {
			if ((listeners === listener) ||
					(listeners.__eeOnceListener__ === listener)) {
				delete data[type];
			}
		}
	
		return this;
	};
	
	emit = function (type) {
		var i, l, listener, listeners, args;
	
		if (!hasOwnProperty.call(this, '__ee__')) return;
		listeners = this.__ee__[type];
		if (!listeners) return;
	
		if (typeof listeners === 'object') {
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) args[i - 1] = arguments[i];
	
			listeners = listeners.slice();
			for (i = 0; (listener = listeners[i]); ++i) {
				apply.call(listener, this, args);
			}
		} else {
			switch (arguments.length) {
			case 1:
				call.call(listeners, this);
				break;
			case 2:
				call.call(listeners, this, arguments[1]);
				break;
			case 3:
				call.call(listeners, this, arguments[1], arguments[2]);
				break;
			default:
				l = arguments.length;
				args = new Array(l - 1);
				for (i = 1; i < l; ++i) {
					args[i - 1] = arguments[i];
				}
				apply.call(listeners, this, args);
			}
		}
	};
	
	methods = {
		on: on,
		once: once,
		off: off,
		emit: emit
	};
	
	descriptors = {
		on: d(on),
		once: d(once),
		off: d(off),
		emit: d(emit)
	};
	
	base = defineProperties({}, descriptors);
	
	module.exports = exports = function (o) {
		return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
	};
	exports.methods = methods;


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(74)() ? Symbol : __webpack_require__(75);


/***/ },
/* 74 */
/***/ function(module, exports) {

	'use strict';
	
	var validTypes = { object: true, symbol: true };
	
	module.exports = function () {
		var symbol;
		if (typeof Symbol !== 'function') return false;
		symbol = Symbol('test symbol');
		try { String(symbol); } catch (e) { return false; }
	
		// Return 'true' also for polyfills
		if (!validTypes[typeof Symbol.iterator]) return false;
		if (!validTypes[typeof Symbol.toPrimitive]) return false;
		if (!validTypes[typeof Symbol.toStringTag]) return false;
	
		return true;
	};


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	// ES2015 Symbol polyfill for environments that do not support it (or partially support it)
	
	'use strict';
	
	var d              = __webpack_require__(60)
	  , validateSymbol = __webpack_require__(76)
	
	  , create = Object.create, defineProperties = Object.defineProperties
	  , defineProperty = Object.defineProperty, objPrototype = Object.prototype
	  , NativeSymbol, SymbolPolyfill, HiddenSymbol, globalSymbols = create(null)
	  , isNativeSafe;
	
	if (typeof Symbol === 'function') {
		NativeSymbol = Symbol;
		try {
			String(NativeSymbol());
			isNativeSafe = true;
		} catch (ignore) {}
	}
	
	var generateName = (function () {
		var created = create(null);
		return function (desc) {
			var postfix = 0, name, ie11BugWorkaround;
			while (created[desc + (postfix || '')]) ++postfix;
			desc += (postfix || '');
			created[desc] = true;
			name = '@@' + desc;
			defineProperty(objPrototype, name, d.gs(null, function (value) {
				// For IE11 issue see:
				// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
				//    ie11-broken-getters-on-dom-objects
				// https://github.com/medikoo/es6-symbol/issues/12
				if (ie11BugWorkaround) return;
				ie11BugWorkaround = true;
				defineProperty(this, name, d(value));
				ie11BugWorkaround = false;
			}));
			return name;
		};
	}());
	
	// Internal constructor (not one exposed) for creating Symbol instances.
	// This one is used to ensure that `someSymbol instanceof Symbol` always return false
	HiddenSymbol = function Symbol(description) {
		if (this instanceof HiddenSymbol) throw new TypeError('TypeError: Symbol is not a constructor');
		return SymbolPolyfill(description);
	};
	
	// Exposed `Symbol` constructor
	// (returns instances of HiddenSymbol)
	module.exports = SymbolPolyfill = function Symbol(description) {
		var symbol;
		if (this instanceof Symbol) throw new TypeError('TypeError: Symbol is not a constructor');
		if (isNativeSafe) return NativeSymbol(description);
		symbol = create(HiddenSymbol.prototype);
		description = (description === undefined ? '' : String(description));
		return defineProperties(symbol, {
			__description__: d('', description),
			__name__: d('', generateName(description))
		});
	};
	defineProperties(SymbolPolyfill, {
		for: d(function (key) {
			if (globalSymbols[key]) return globalSymbols[key];
			return (globalSymbols[key] = SymbolPolyfill(String(key)));
		}),
		keyFor: d(function (s) {
			var key;
			validateSymbol(s);
			for (key in globalSymbols) if (globalSymbols[key] === s) return key;
		}),
	
		// If there's native implementation of given symbol, let's fallback to it
		// to ensure proper interoperability with other native functions e.g. Array.from
		hasInstance: d('', (NativeSymbol && NativeSymbol.hasInstance) || SymbolPolyfill('hasInstance')),
		isConcatSpreadable: d('', (NativeSymbol && NativeSymbol.isConcatSpreadable) ||
			SymbolPolyfill('isConcatSpreadable')),
		iterator: d('', (NativeSymbol && NativeSymbol.iterator) || SymbolPolyfill('iterator')),
		match: d('', (NativeSymbol && NativeSymbol.match) || SymbolPolyfill('match')),
		replace: d('', (NativeSymbol && NativeSymbol.replace) || SymbolPolyfill('replace')),
		search: d('', (NativeSymbol && NativeSymbol.search) || SymbolPolyfill('search')),
		species: d('', (NativeSymbol && NativeSymbol.species) || SymbolPolyfill('species')),
		split: d('', (NativeSymbol && NativeSymbol.split) || SymbolPolyfill('split')),
		toPrimitive: d('', (NativeSymbol && NativeSymbol.toPrimitive) || SymbolPolyfill('toPrimitive')),
		toStringTag: d('', (NativeSymbol && NativeSymbol.toStringTag) || SymbolPolyfill('toStringTag')),
		unscopables: d('', (NativeSymbol && NativeSymbol.unscopables) || SymbolPolyfill('unscopables'))
	});
	
	// Internal tweaks for real symbol producer
	defineProperties(HiddenSymbol.prototype, {
		constructor: d(SymbolPolyfill),
		toString: d('', function () { return this.__name__; })
	});
	
	// Proper implementation of methods exposed on Symbol.prototype
	// They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
	defineProperties(SymbolPolyfill.prototype, {
		toString: d(function () { return 'Symbol (' + validateSymbol(this).__description__ + ')'; }),
		valueOf: d(function () { return validateSymbol(this); })
	});
	defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d('', function () {
		var symbol = validateSymbol(this);
		if (typeof symbol === 'symbol') return symbol;
		return symbol.toString();
	}));
	defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d('c', 'Symbol'));
	
	// Proper implementaton of toPrimitive and toStringTag for returned symbol instances
	defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
		d('c', SymbolPolyfill.prototype[SymbolPolyfill.toStringTag]));
	
	// Note: It's important to define `toPrimitive` as last one, as some implementations
	// implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
	// And that may invoke error in definition flow:
	// See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
	defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
		d('c', SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isSymbol = __webpack_require__(77);
	
	module.exports = function (value) {
		if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
		return value;
	};


/***/ },
/* 77 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function (x) {
		if (!x) return false;
		if (typeof x === 'symbol') return true;
		if (!x.constructor) return false;
		if (x.constructor.name !== 'Symbol') return false;
		return (x[x.constructor.toStringTag] === 'Symbol');
	};


/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isIterable = __webpack_require__(79);
	
	module.exports = function (value) {
		if (!isIterable(value)) throw new TypeError(value + " is not iterable");
		return value;
	};


/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isArguments    = __webpack_require__(80)
	  , isString       = __webpack_require__(81)
	  , iteratorSymbol = __webpack_require__(73).iterator
	
	  , isArray = Array.isArray;
	
	module.exports = function (value) {
		if (value == null) return false;
		if (isArray(value)) return true;
		if (isString(value)) return true;
		if (isArguments(value)) return true;
		return (typeof value[iteratorSymbol] === 'function');
	};


/***/ },
/* 80 */
/***/ function(module, exports) {

	'use strict';
	
	var toString = Object.prototype.toString
	
	  , id = toString.call((function () { return arguments; }()));
	
	module.exports = function (x) { return (toString.call(x) === id); };


/***/ },
/* 81 */
/***/ function(module, exports) {

	'use strict';
	
	var toString = Object.prototype.toString
	
	  , id = toString.call('');
	
	module.exports = function (x) {
		return (typeof x === 'string') || (x && (typeof x === 'object') &&
			((x instanceof String) || (toString.call(x) === id))) || false;
	};


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isArguments = __webpack_require__(80)
	  , callable    = __webpack_require__(59)
	  , isString    = __webpack_require__(81)
	  , get         = __webpack_require__(83)
	
	  , isArray = Array.isArray, call = Function.prototype.call
	  , some = Array.prototype.some;
	
	module.exports = function (iterable, cb/*, thisArg*/) {
		var mode, thisArg = arguments[2], result, doBreak, broken, i, l, char, code;
		if (isArray(iterable) || isArguments(iterable)) mode = 'array';
		else if (isString(iterable)) mode = 'string';
		else iterable = get(iterable);
	
		callable(cb);
		doBreak = function () { broken = true; };
		if (mode === 'array') {
			some.call(iterable, function (value) {
				call.call(cb, thisArg, value, doBreak);
				if (broken) return true;
			});
			return;
		}
		if (mode === 'string') {
			l = iterable.length;
			for (i = 0; i < l; ++i) {
				char = iterable[i];
				if ((i + 1) < l) {
					code = char.charCodeAt(0);
					if ((code >= 0xD800) && (code <= 0xDBFF)) char += iterable[++i];
				}
				call.call(cb, thisArg, char, doBreak);
				if (broken) break;
			}
			return;
		}
		result = iterable.next();
	
		while (!result.done) {
			call.call(cb, thisArg, result.value, doBreak);
			if (broken) return;
			result = iterable.next();
		}
	};


/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isArguments    = __webpack_require__(80)
	  , isString       = __webpack_require__(81)
	  , ArrayIterator  = __webpack_require__(84)
	  , StringIterator = __webpack_require__(91)
	  , iterable       = __webpack_require__(78)
	  , iteratorSymbol = __webpack_require__(73).iterator;
	
	module.exports = function (obj) {
		if (typeof iterable(obj)[iteratorSymbol] === 'function') return obj[iteratorSymbol]();
		if (isArguments(obj)) return new ArrayIterator(obj);
		if (isString(obj)) return new StringIterator(obj);
		return new ArrayIterator(obj);
	};


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var setPrototypeOf = __webpack_require__(54)
	  , contains       = __webpack_require__(69)
	  , d              = __webpack_require__(60)
	  , Iterator       = __webpack_require__(85)
	
	  , defineProperty = Object.defineProperty
	  , ArrayIterator;
	
	ArrayIterator = module.exports = function (arr, kind) {
		if (!(this instanceof ArrayIterator)) return new ArrayIterator(arr, kind);
		Iterator.call(this, arr);
		if (!kind) kind = 'value';
		else if (contains.call(kind, 'key+value')) kind = 'key+value';
		else if (contains.call(kind, 'key')) kind = 'key';
		else kind = 'value';
		defineProperty(this, '__kind__', d('', kind));
	};
	if (setPrototypeOf) setPrototypeOf(ArrayIterator, Iterator);
	
	ArrayIterator.prototype = Object.create(Iterator.prototype, {
		constructor: d(ArrayIterator),
		_resolve: d(function (i) {
			if (this.__kind__ === 'value') return this.__list__[i];
			if (this.__kind__ === 'key+value') return [i, this.__list__[i]];
			return i;
		}),
		toString: d(function () { return '[object Array Iterator]'; })
	});


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var clear    = __webpack_require__(46)
	  , assign   = __webpack_require__(61)
	  , callable = __webpack_require__(59)
	  , value    = __webpack_require__(47)
	  , d        = __webpack_require__(60)
	  , autoBind = __webpack_require__(86)
	  , Symbol   = __webpack_require__(73)
	
	  , defineProperty = Object.defineProperty
	  , defineProperties = Object.defineProperties
	  , Iterator;
	
	module.exports = Iterator = function (list, context) {
		if (!(this instanceof Iterator)) return new Iterator(list, context);
		defineProperties(this, {
			__list__: d('w', value(list)),
			__context__: d('w', context),
			__nextIndex__: d('w', 0)
		});
		if (!context) return;
		callable(context.on);
		context.on('_add', this._onAdd);
		context.on('_delete', this._onDelete);
		context.on('_clear', this._onClear);
	};
	
	defineProperties(Iterator.prototype, assign({
		constructor: d(Iterator),
		_next: d(function () {
			var i;
			if (!this.__list__) return;
			if (this.__redo__) {
				i = this.__redo__.shift();
				if (i !== undefined) return i;
			}
			if (this.__nextIndex__ < this.__list__.length) return this.__nextIndex__++;
			this._unBind();
		}),
		next: d(function () { return this._createResult(this._next()); }),
		_createResult: d(function (i) {
			if (i === undefined) return { done: true, value: undefined };
			return { done: false, value: this._resolve(i) };
		}),
		_resolve: d(function (i) { return this.__list__[i]; }),
		_unBind: d(function () {
			this.__list__ = null;
			delete this.__redo__;
			if (!this.__context__) return;
			this.__context__.off('_add', this._onAdd);
			this.__context__.off('_delete', this._onDelete);
			this.__context__.off('_clear', this._onClear);
			this.__context__ = null;
		}),
		toString: d(function () { return '[object Iterator]'; })
	}, autoBind({
		_onAdd: d(function (index) {
			if (index >= this.__nextIndex__) return;
			++this.__nextIndex__;
			if (!this.__redo__) {
				defineProperty(this, '__redo__', d('c', [index]));
				return;
			}
			this.__redo__.forEach(function (redo, i) {
				if (redo >= index) this.__redo__[i] = ++redo;
			}, this);
			this.__redo__.push(index);
		}),
		_onDelete: d(function (index) {
			var i;
			if (index >= this.__nextIndex__) return;
			--this.__nextIndex__;
			if (!this.__redo__) return;
			i = this.__redo__.indexOf(index);
			if (i !== -1) this.__redo__.splice(i, 1);
			this.__redo__.forEach(function (redo, i) {
				if (redo > index) this.__redo__[i] = --redo;
			}, this);
		}),
		_onClear: d(function () {
			if (this.__redo__) clear.call(this.__redo__);
			this.__nextIndex__ = 0;
		})
	})));
	
	defineProperty(Iterator.prototype, Symbol.iterator, d(function () {
		return this;
	}));
	defineProperty(Iterator.prototype, Symbol.toStringTag, d('', 'Iterator'));


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var copy       = __webpack_require__(87)
	  , map        = __webpack_require__(88)
	  , callable   = __webpack_require__(59)
	  , validValue = __webpack_require__(47)
	
	  , bind = Function.prototype.bind, defineProperty = Object.defineProperty
	  , hasOwnProperty = Object.prototype.hasOwnProperty
	  , define;
	
	define = function (name, desc, bindTo) {
		var value = validValue(desc) && callable(desc.value), dgs;
		dgs = copy(desc);
		delete dgs.writable;
		delete dgs.value;
		dgs.get = function () {
			if (hasOwnProperty.call(this, name)) return value;
			desc.value = bind.call(value, (bindTo == null) ? this : this[bindTo]);
			defineProperty(this, name, desc);
			return this[name];
		};
		return dgs;
	};
	
	module.exports = function (props/*, bindTo*/) {
		var bindTo = arguments[1];
		return map(props, function (desc, name) {
			return define(name, desc, bindTo);
		});
	};


/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var assign = __webpack_require__(61)
	  , value  = __webpack_require__(47);
	
	module.exports = function (obj) {
		var copy = Object(value(obj));
		if (copy !== obj) return copy;
		return assign({}, obj);
	};


/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var callable = __webpack_require__(59)
	  , forEach  = __webpack_require__(89)
	
	  , call = Function.prototype.call;
	
	module.exports = function (obj, cb/*, thisArg*/) {
		var o = {}, thisArg = arguments[2];
		callable(cb);
		forEach(obj, function (value, key, obj, index) {
			o[key] = call.call(cb, thisArg, value, key, obj, index);
		});
		return o;
	};


/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(90)('forEach');


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	// Internal method, used by iteration functions.
	// Calls a function for each key-value pair found in object
	// Optionally takes compareFn to iterate object in specific order
	
	'use strict';
	
	var callable = __webpack_require__(59)
	  , value    = __webpack_require__(47)
	
	  , bind = Function.prototype.bind, call = Function.prototype.call, keys = Object.keys
	  , propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
	
	module.exports = function (method, defVal) {
		return function (obj, cb/*, thisArg, compareFn*/) {
			var list, thisArg = arguments[2], compareFn = arguments[3];
			obj = Object(value(obj));
			callable(cb);
	
			list = keys(obj);
			if (compareFn) {
				list.sort((typeof compareFn === 'function') ? bind.call(compareFn, obj) : undefined);
			}
			if (typeof method !== 'function') method = list[method];
			return call.call(method, list, function (key, index) {
				if (!propertyIsEnumerable.call(obj, key)) return defVal;
				return call.call(cb, thisArg, obj[key], key, obj, index);
			});
		};
	};


/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	// Thanks @mathiasbynens
	// http://mathiasbynens.be/notes/javascript-unicode#iterating-over-symbols
	
	'use strict';
	
	var setPrototypeOf = __webpack_require__(54)
	  , d              = __webpack_require__(60)
	  , Iterator       = __webpack_require__(85)
	
	  , defineProperty = Object.defineProperty
	  , StringIterator;
	
	StringIterator = module.exports = function (str) {
		if (!(this instanceof StringIterator)) return new StringIterator(str);
		str = String(str);
		Iterator.call(this, str);
		defineProperty(this, '__length__', d('', str.length));
	
	};
	if (setPrototypeOf) setPrototypeOf(StringIterator, Iterator);
	
	StringIterator.prototype = Object.create(Iterator.prototype, {
		constructor: d(StringIterator),
		_next: d(function () {
			if (!this.__list__) return;
			if (this.__nextIndex__ < this.__length__) return this.__nextIndex__++;
			this._unBind();
		}),
		_resolve: d(function (i) {
			var char = this.__list__[i], code;
			if (this.__nextIndex__ === this.__length__) return char;
			code = char.charCodeAt(0);
			if ((code >= 0xD800) && (code <= 0xDBFF)) return char + this.__list__[this.__nextIndex__++];
			return char;
		}),
		toString: d(function () { return '[object String Iterator]'; })
	});


/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var setPrototypeOf    = __webpack_require__(54)
	  , d                 = __webpack_require__(60)
	  , Iterator          = __webpack_require__(85)
	  , toStringTagSymbol = __webpack_require__(73).toStringTag
	  , kinds             = __webpack_require__(93)
	
	  , defineProperties = Object.defineProperties
	  , unBind = Iterator.prototype._unBind
	  , MapIterator;
	
	MapIterator = module.exports = function (map, kind) {
		if (!(this instanceof MapIterator)) return new MapIterator(map, kind);
		Iterator.call(this, map.__mapKeysData__, map);
		if (!kind || !kinds[kind]) kind = 'key+value';
		defineProperties(this, {
			__kind__: d('', kind),
			__values__: d('w', map.__mapValuesData__)
		});
	};
	if (setPrototypeOf) setPrototypeOf(MapIterator, Iterator);
	
	MapIterator.prototype = Object.create(Iterator.prototype, {
		constructor: d(MapIterator),
		_resolve: d(function (i) {
			if (this.__kind__ === 'value') return this.__values__[i];
			if (this.__kind__ === 'key') return this.__list__[i];
			return [this.__list__[i], this.__values__[i]];
		}),
		_unBind: d(function () {
			this.__values__ = null;
			unBind.call(this);
		}),
		toString: d(function () { return '[object Map Iterator]'; })
	});
	Object.defineProperty(MapIterator.prototype, toStringTagSymbol,
		d('c', 'Map Iterator'));


/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(94)('key',
		'value', 'key+value');


/***/ },
/* 94 */
/***/ function(module, exports) {

	'use strict';
	
	var forEach = Array.prototype.forEach, create = Object.create;
	
	module.exports = function (arg/*, …args*/) {
		var set = create(null);
		forEach.call(arguments, function (name) { set[name] = true; });
		return set;
	};


/***/ },
/* 95 */
/***/ function(module, exports) {

	// Exports true if environment provides native `Map` implementation,
	// whatever that is.
	
	'use strict';
	
	module.exports = (function () {
		if (typeof Map === 'undefined') return false;
		return (Object.prototype.toString.call(new Map()) === '[object Map]');
	}());


/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var HTMLSource_1 = __webpack_require__(28);
	var init = __webpack_require__(97);
	var modulesForHTML = __webpack_require__(101);
	var defaultModules = [
	    modulesForHTML.attributes,
	    modulesForHTML.props,
	    modulesForHTML.class,
	    modulesForHTML.style,
	];
	var noop = function () { };
	function makeHTMLDriver(effect, options) {
	    if (!options) {
	        options = {};
	    }
	    var modules = options.modules || defaultModules;
	    var toHTML = init(modules);
	    function htmlDriver(vnode$, name) {
	        var html$ = vnode$.map(toHTML);
	        html$.addListener({
	            next: effect || noop,
	            error: noop,
	            complete: noop,
	        });
	        return new HTMLSource_1.HTMLSource(html$, name);
	    }
	    ;
	    return htmlDriver;
	}
	exports.makeHTMLDriver = makeHTMLDriver;
	//# sourceMappingURL=makeHTMLDriver.js.map

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	
	var parseSelector = __webpack_require__(98)
	var VOID_ELEMENTS = __webpack_require__(100).VOID
	var CONTAINER_ELEMENTS = __webpack_require__(100).CONTAINER
	
	module.exports = function init (modules) {
	  function parse (vnode, node) {
	    var result = []
	    var attributes = new Map([
	      // These can be overwritten because that’s what happens in snabbdom
	      ['id', node.id],
	      ['class', node.className]
	    ])
	
	    modules.forEach(function (fn, index) {
	      fn(vnode, attributes)
	    })
	    attributes.forEach(function (value, key) {
	      if (value && value !== '') {
	        result.push(key + '="' + value + '"')
	      }
	    })
	
	    return result.join(' ')
	  }
	
	  return function renderToString (vnode) {
	    if (!vnode.sel && vnode.text) {
	      return vnode.text
	    }
	
	    vnode.data = vnode.data || {}
	
	    // Support thunks
	    if (vnode.data.hook &&
	      typeof vnode.data.hook.init === 'function' &&
	      typeof vnode.data.fn === 'function') {
	      vnode.data.hook.init(vnode)
	    }
	
	    var node = parseSelector(vnode.sel)
	    var tagName = node.tagName
	    var attributes = parse(vnode, node)
	    var svg = vnode.data.ns === 'http://www.w3.org/2000/svg'
	    var tag = []
	
	    // Open tag
	    tag.push('<' + tagName)
	    if (attributes.length) {
	      tag.push(' ' + attributes)
	    }
	    if (svg && CONTAINER_ELEMENTS[tagName] !== true) {
	      tag.push(' /')
	    }
	    tag.push('>')
	
	    // Close tag, if needed
	    if ((VOID_ELEMENTS[tagName] !== true && !svg) ||
	        (svg && CONTAINER_ELEMENTS[tagName] === true)) {
	      if (vnode.data.props && vnode.data.props.innerHTML) {
	        tag.push(vnode.data.props.innerHTML)
	      } else if (vnode.text) {
	        tag.push(vnode.text)
	      } else if (vnode.children) {
	        vnode.children.forEach(function (child) {
	          tag.push(renderToString(child))
	        })
	      }
	      tag.push('</' + tagName + '>')
	    }
	
	    return tag.join('')
	  }
	}


/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	
	// https://github.com/Matt-Esch/virtual-dom/blob/master/virtual-hyperscript/parse-tag.js
	
	var split = __webpack_require__(99)
	
	var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/
	var notClassId = /^\.|#/
	
	module.exports = function parseSelector (selector, upper) {
	  selector = selector || ''
	  var tagName
	  var id = ''
	  var classes = []
	
	  var tagParts = split(selector, classIdSplit)
	
	  if (notClassId.test(tagParts[1]) || selector === '') {
	    tagName = 'div'
	  }
	
	  var part, type, i
	
	  for (i = 0; i < tagParts.length; i++) {
	    part = tagParts[i]
	
	    if (!part) {
	      continue
	    }
	
	    type = part.charAt(0)
	
	    if (!tagName) {
	      tagName = part
	    } else if (type === '.') {
	      classes.push(part.substring(1, part.length))
	    } else if (type === '#') {
	      id = part.substring(1, part.length)
	    }
	  }
	
	  return {
	    tagName: upper === true ? tagName.toUpperCase() : tagName,
	    id: id,
	    className: classes.join(' ')
	  }
	}


/***/ },
/* 99 */
/***/ function(module, exports) {

	/*!
	 * Cross-Browser Split 1.1.1
	 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
	 * Available under the MIT License
	 * ECMAScript compliant, uniform cross-browser split method
	 */
	
	/**
	 * Splits a string into an array of strings using a regex or string separator. Matches of the
	 * separator are not included in the result array. However, if `separator` is a regex that contains
	 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
	 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
	 * cross-browser.
	 * @param {String} str String to split.
	 * @param {RegExp|String} separator Regex or string to use for separating the string.
	 * @param {Number} [limit] Maximum number of items to include in the result array.
	 * @returns {Array} Array of substrings.
	 * @example
	 *
	 * // Basic use
	 * split('a b c d', ' ');
	 * // -> ['a', 'b', 'c', 'd']
	 *
	 * // With limit
	 * split('a b c d', ' ', 2);
	 * // -> ['a', 'b']
	 *
	 * // Backreferences in result array
	 * split('..word1 word2..', /([a-z]+)(\d+)/i);
	 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
	 */
	module.exports = (function split(undef) {
	
	  var nativeSplit = String.prototype.split,
	    compliantExecNpcg = /()??/.exec("")[1] === undef,
	    // NPCG: nonparticipating capturing group
	    self;
	
	  self = function(str, separator, limit) {
	    // If `separator` is not a regex, use `nativeSplit`
	    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
	      return nativeSplit.call(str, separator, limit);
	    }
	    var output = [],
	      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
	      (separator.sticky ? "y" : ""),
	      // Firefox 3+
	      lastLastIndex = 0,
	      // Make `global` and avoid `lastIndex` issues by working with a copy
	      separator = new RegExp(separator.source, flags + "g"),
	      separator2, match, lastIndex, lastLength;
	    str += ""; // Type-convert
	    if (!compliantExecNpcg) {
	      // Doesn't need flags gy, but they don't hurt
	      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
	    }
	    /* Values for `limit`, per the spec:
	     * If undefined: 4294967295 // Math.pow(2, 32) - 1
	     * If 0, Infinity, or NaN: 0
	     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
	     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
	     * If other: Type-convert, then use the above rules
	     */
	    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
	    limit >>> 0; // ToUint32(limit)
	    while (match = separator.exec(str)) {
	      // `separator.lastIndex` is not reliable cross-browser
	      lastIndex = match.index + match[0].length;
	      if (lastIndex > lastLastIndex) {
	        output.push(str.slice(lastLastIndex, match.index));
	        // Fix browsers whose `exec` methods don't consistently return `undefined` for
	        // nonparticipating capturing groups
	        if (!compliantExecNpcg && match.length > 1) {
	          match[0].replace(separator2, function() {
	            for (var i = 1; i < arguments.length - 2; i++) {
	              if (arguments[i] === undef) {
	                match[i] = undef;
	              }
	            }
	          });
	        }
	        if (match.length > 1 && match.index < str.length) {
	          Array.prototype.push.apply(output, match.slice(1));
	        }
	        lastLength = match[0].length;
	        lastLastIndex = lastIndex;
	        if (output.length >= limit) {
	          break;
	        }
	      }
	      if (separator.lastIndex === match.index) {
	        separator.lastIndex++; // Avoid an infinite loop
	      }
	    }
	    if (lastLastIndex === str.length) {
	      if (lastLength || !separator.test("")) {
	        output.push("");
	      }
	    } else {
	      output.push(str.slice(lastLastIndex));
	    }
	    return output.length > limit ? output.slice(0, limit) : output;
	  };
	
	  return self;
	})();


/***/ },
/* 100 */
/***/ function(module, exports) {

	
	// All SVG children elements, not in this list, should self-close
	
	exports.CONTAINER = {
	  // http://www.w3.org/TR/SVG/intro.html#TermContainerElement
	  'a': true,
	  'defs': true,
	  'glyph': true,
	  'g': true,
	  'marker': true,
	  'mask': true,
	  'missing-glyph': true,
	  'pattern': true,
	  'svg': true,
	  'switch': true,
	  'symbol': true,
	
	  // http://www.w3.org/TR/SVG/intro.html#TermDescriptiveElement
	  'desc': true,
	  'metadata': true,
	  'title': true
	}
	
	// http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
	
	exports.VOID = {
	  area: true,
	  base: true,
	  br: true,
	  col: true,
	  embed: true,
	  hr: true,
	  img: true,
	  input: true,
	  keygen: true,
	  link: true,
	  meta: true,
	  param: true,
	  source: true,
	  track: true,
	  wbr: true
	}


/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports = {
	  class: __webpack_require__(102),
	  props: __webpack_require__(106),
	  attributes: __webpack_require__(108),
	  style: __webpack_require__(109)
	}


/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	
	var forOwn = __webpack_require__(103)
	var remove = __webpack_require__(104)
	var uniq = __webpack_require__(105)
	
	// data.class
	
	module.exports = function classModule (vnode, attributes) {
	  var values
	  var _add = []
	  var _remove = []
	  var classes = vnode.data.class || {}
	  var existing = attributes.get('class')
	  existing = existing.length > 0 ? existing.split(' ') : []
	
	  forOwn(classes, function (value, key) {
	    if (value === true) {
	      _add.push(key)
	    } else {
	      _remove.push(key)
	    }
	  })
	
	  values = remove(uniq(existing.concat(_add)), function (value) {
	    return _remove.indexOf(value) < 0
	  })
	
	  if (values.length) {
	    attributes.set('class', values.join(' '))
	  }
	}


/***/ },
/* 103 */
/***/ function(module, exports) {

	/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */
	
	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]';
	
	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;
	
	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);
	
	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}
	
	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = overArg(Object.keys, Object);
	
	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys(value, inherited) {
	  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
	  // Safari 9 makes `arguments.length` enumerable in strict mode.
	  var result = (isArray(value) || isArguments(value))
	    ? baseTimes(value.length, String)
	    : [];
	
	  var length = result.length,
	      skipIndexes = !!length;
	
	  for (var key in value) {
	    if ((inherited || hasOwnProperty.call(value, key)) &&
	        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	/**
	 * The base implementation of `baseForOwn` which iterates over `object`
	 * properties returned by `keysFunc` and invokes `iteratee` for each property.
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();
	
	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return object && baseFor(object, iteratee, keys);
	}
	
	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!isPrototype(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	/**
	 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;
	
	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}
	
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return !!length &&
	    (typeof value == 'number' || reIsUint.test(value)) &&
	    (value > -1 && value % 1 == 0 && value < length);
	}
	
	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;
	
	  return value === proto;
	}
	
	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
	    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
	}
	
	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;
	
	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(value.length) && !isFunction(value);
	}
	
	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8-9 which returns 'object' for typed array and other constructors.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	/**
	 * Iterates over own enumerable string keyed properties of an object and
	 * invokes `iteratee` for each property. The iteratee is invoked with three
	 * arguments: (value, key, object). Iteratee functions may exit iteration
	 * early by explicitly returning `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.3.0
	 * @category Object
	 * @param {Object} object The object to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 * @see _.forOwnRight
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.forOwn(new Foo, function(value, key) {
	 *   console.log(key);
	 * });
	 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
	 */
	function forOwn(object, iteratee) {
	  return object && baseForOwn(object, typeof iteratee == 'function' ? iteratee : identity);
	}
	
	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}
	
	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}
	
	module.exports = forOwn;


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */
	
	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;
	
	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';
	
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/** Used to compose bitmasks for comparison styles. */
	var UNORDERED_COMPARE_FLAG = 1,
	    PARTIAL_COMPARE_FLAG = 2;
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0,
	    MAX_SAFE_INTEGER = 9007199254740991;
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    promiseTag = '[object Promise]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]',
	    weakMapTag = '[object WeakMap]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';
	
	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/,
	    reLeadingDot = /^\./,
	    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
	
	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
	
	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;
	
	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;
	
	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
	typedArrayTags[errorTag] = typedArrayTags[funcTag] =
	typedArrayTags[mapTag] = typedArrayTags[numberTag] =
	typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
	typedArrayTags[setTag] = typedArrayTags[stringTag] =
	typedArrayTags[weakMapTag] = false;
	
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
	
	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
	
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();
	
	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
	
	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
	
	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;
	
	/** Detect free variable `process` from Node.js. */
	var freeProcess = moduleExports && freeGlobal.process;
	
	/** Used to access faster Node.js helpers. */
	var nodeUtil = (function() {
	  try {
	    return freeProcess && freeProcess.binding('util');
	  } catch (e) {}
	}());
	
	/* Node.js helper references. */
	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
	
	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array ? array.length : 0;
	
	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}
	
	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);
	
	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}
	
	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */
	function baseUnary(func) {
	  return function(value) {
	    return func(value);
	  };
	}
	
	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}
	
	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}
	
	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);
	
	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}
	
	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}
	
	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);
	
	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}
	
	/** Used for built-in method references. */
	var arrayProto = Array.prototype,
	    funcProto = Function.prototype,
	    objectProto = Object.prototype;
	
	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];
	
	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);
	
	/** Built-in value references. */
	var Symbol = root.Symbol,
	    Uint8Array = root.Uint8Array,
	    propertyIsEnumerable = objectProto.propertyIsEnumerable,
	    splice = arrayProto.splice;
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = overArg(Object.keys, Object);
	
	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView'),
	    Map = getNative(root, 'Map'),
	    Promise = getNative(root, 'Promise'),
	    Set = getNative(root, 'Set'),
	    WeakMap = getNative(root, 'WeakMap'),
	    nativeCreate = getNative(Object, 'create');
	
	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map),
	    promiseCtorString = toSource(Promise),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);
	
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;
	
	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	}
	
	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  return this.has(key) && delete this.__data__[key];
	}
	
	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}
	
	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
	}
	
	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}
	
	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;
	
	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	}
	
	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  return true;
	}
	
	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  return index < 0 ? undefined : data[index][1];
	}
	
	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}
	
	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}
	
	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;
	
	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}
	
	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  return getMapData(this, key)['delete'](key);
	}
	
	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}
	
	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}
	
	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  getMapData(this, key).set(key, value);
	  return this;
	}
	
	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;
	
	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache(values) {
	  var index = -1,
	      length = values ? values.length : 0;
	
	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}
	
	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd(value) {
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}
	
	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */
	function setCacheHas(value) {
	  return this.__data__.has(value);
	}
	
	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;
	
	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack(entries) {
	  this.__data__ = new ListCache(entries);
	}
	
	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new ListCache;
	}
	
	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  return this.__data__['delete'](key);
	}
	
	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  return this.__data__.get(key);
	}
	
	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  return this.__data__.has(key);
	}
	
	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet(key, value) {
	  var cache = this.__data__;
	  if (cache instanceof ListCache) {
	    var pairs = cache.__data__;
	    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
	      pairs.push([key, value]);
	      return this;
	    }
	    cache = this.__data__ = new MapCache(pairs);
	  }
	  cache.set(key, value);
	  return this;
	}
	
	// Add methods to `Stack`.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;
	
	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys(value, inherited) {
	  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
	  // Safari 9 makes `arguments.length` enumerable in strict mode.
	  var result = (isArray(value) || isArguments(value))
	    ? baseTimes(value.length, String)
	    : [];
	
	  var length = result.length,
	      skipIndexes = !!length;
	
	  for (var key in value) {
	    if ((inherited || hasOwnProperty.call(value, key)) &&
	        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}
	
	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path) {
	  path = isKey(path, object) ? [path] : castPath(path);
	
	  var index = 0,
	      length = path.length;
	
	  while (object != null && index < length) {
	    object = object[toKey(path[index++])];
	  }
	  return (index && index == length) ? object : undefined;
	}
	
	/**
	 * The base implementation of `getTag`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	  return objectToString.call(value);
	}
	
	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHasIn(object, key) {
	  return object != null && key in Object(object);
	}
	
	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {boolean} [bitmask] The bitmask of comparison flags.
	 *  The bitmask may be composed of the following flags:
	 *     1 - Unordered comparison
	 *     2 - Partial comparison
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, customizer, bitmask, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
	}
	
	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = arrayTag,
	      othTag = arrayTag;
	
	  if (!objIsArr) {
	    objTag = getTag(object);
	    objTag = objTag == argsTag ? objectTag : objTag;
	  }
	  if (!othIsArr) {
	    othTag = getTag(other);
	    othTag = othTag == argsTag ? objectTag : othTag;
	  }
	  var objIsObj = objTag == objectTag && !isHostObject(object),
	      othIsObj = othTag == objectTag && !isHostObject(other),
	      isSameTag = objTag == othTag;
	
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new Stack);
	    return (objIsArr || isTypedArray(object))
	      ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
	      : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
	  }
	  if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
	
	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;
	
	      stack || (stack = new Stack);
	      return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack);
	  return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
	}
	
	/**
	 * The base implementation of `_.isMatch` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Object} source The object of property values to match.
	 * @param {Array} matchData The property names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, source, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;
	
	  if (object == null) {
	    return !length;
	  }
	  object = Object(object);
	  while (index--) {
	    var data = matchData[index];
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];
	
	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var stack = new Stack;
	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }
	      if (!(result === undefined
	            ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
	            : result
	          )) {
	        return false;
	      }
	    }
	  }
	  return true;
	}
	
	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}
	
	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */
	function baseIsTypedArray(value) {
	  return isObjectLike(value) &&
	    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
	}
	
	/**
	 * The base implementation of `_.iteratee`.
	 *
	 * @private
	 * @param {*} [value=_.identity] The value to convert to an iteratee.
	 * @returns {Function} Returns the iteratee.
	 */
	function baseIteratee(value) {
	  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
	  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
	  if (typeof value == 'function') {
	    return value;
	  }
	  if (value == null) {
	    return identity;
	  }
	  if (typeof value == 'object') {
	    return isArray(value)
	      ? baseMatchesProperty(value[0], value[1])
	      : baseMatches(value);
	  }
	  return property(value);
	}
	
	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!isPrototype(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatches(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
	  }
	  return function(object) {
	    return object === source || baseIsMatch(object, source, matchData);
	  };
	}
	
	/**
	 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatchesProperty(path, srcValue) {
	  if (isKey(path) && isStrictComparable(srcValue)) {
	    return matchesStrictComparable(toKey(path), srcValue);
	  }
	  return function(object) {
	    var objValue = get(object, path);
	    return (objValue === undefined && objValue === srcValue)
	      ? hasIn(object, path)
	      : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
	  };
	}
	
	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyDeep(path) {
	  return function(object) {
	    return baseGet(object, path);
	  };
	}
	
	/**
	 * The base implementation of `_.pullAt` without support for individual
	 * indexes or capturing the removed elements.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {number[]} indexes The indexes of elements to remove.
	 * @returns {Array} Returns `array`.
	 */
	function basePullAt(array, indexes) {
	  var length = array ? indexes.length : 0,
	      lastIndex = length - 1;
	
	  while (length--) {
	    var index = indexes[length];
	    if (length == lastIndex || index !== previous) {
	      var previous = index;
	      if (isIndex(index)) {
	        splice.call(array, index, 1);
	      }
	      else if (!isKey(index, array)) {
	        var path = castPath(index),
	            object = parent(array, path);
	
	        if (object != null) {
	          delete object[toKey(last(path))];
	        }
	      }
	      else {
	        delete array[toKey(index)];
	      }
	    }
	  }
	  return array;
	}
	
	/**
	 * The base implementation of `_.slice` without an iteratee call guard.
	 *
	 * @private
	 * @param {Array} array The array to slice.
	 * @param {number} [start=0] The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns the slice of `array`.
	 */
	function baseSlice(array, start, end) {
	  var index = -1,
	      length = array.length;
	
	  if (start < 0) {
	    start = -start > length ? 0 : (length + start);
	  }
	  end = end > length ? length : end;
	  if (end < 0) {
	    end += length;
	  }
	  length = start > end ? 0 : ((end - start) >>> 0);
	  start >>>= 0;
	
	  var result = Array(length);
	  while (++index < length) {
	    result[index] = array[index + start];
	  }
	  return result;
	}
	
	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}
	
	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath(value) {
	  return isArray(value) ? value : stringToPath(value);
	}
	
	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
	  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
	      arrLength = array.length,
	      othLength = other.length;
	
	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(array);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var index = -1,
	      result = true,
	      seen = (bitmask & UNORDERED_COMPARE_FLAG) ? new SetCache : undefined;
	
	  stack.set(array, other);
	  stack.set(other, array);
	
	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];
	
	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, arrValue, index, other, array, stack)
	        : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (seen) {
	      if (!arraySome(other, function(othValue, othIndex) {
	            if (!seen.has(othIndex) &&
	                (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
	              return seen.add(othIndex);
	            }
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(
	          arrValue === othValue ||
	            equalFunc(arrValue, othValue, customizer, bitmask, stack)
	        )) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  stack['delete'](other);
	  return result;
	}
	
	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
	  switch (tag) {
	    case dataViewTag:
	      if ((object.byteLength != other.byteLength) ||
	          (object.byteOffset != other.byteOffset)) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;
	
	    case arrayBufferTag:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
	        return false;
	      }
	      return true;
	
	    case boolTag:
	    case dateTag:
	    case numberTag:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq(+object, +other);
	
	    case errorTag:
	      return object.name == other.name && object.message == other.message;
	
	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');
	
	    case mapTag:
	      var convert = mapToArray;
	
	    case setTag:
	      var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
	      convert || (convert = setToArray);
	
	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= UNORDERED_COMPARE_FLAG;
	
	      // Recursively compare objects (susceptible to call stack limits).
	      stack.set(object, other);
	      var result = equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);
	      stack['delete'](object);
	      return result;
	
	    case symbolTag:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}
	
	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
	  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
	      objProps = keys(object),
	      objLength = objProps.length,
	      othProps = keys(other),
	      othLength = othProps.length;
	
	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
	      return false;
	    }
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(object);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var result = true;
	  stack.set(object, other);
	  stack.set(other, object);
	
	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];
	
	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, objValue, key, other, object, stack)
	        : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined
	          ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
	          : compared
	        )) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;
	
	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  stack['delete'](other);
	  return result;
	}
	
	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}
	
	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = keys(object),
	      length = result.length;
	
	  while (length--) {
	    var key = result[length],
	        value = object[key];
	
	    result[length] = [key, value, isStrictComparable(value)];
	  }
	  return result;
	}
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}
	
	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag = baseGetTag;
	
	// Fallback for data views, maps, sets, and weak maps in IE 11,
	// for data views in Edge < 14, and promises in Node.js.
	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map && getTag(new Map) != mapTag) ||
	    (Promise && getTag(Promise.resolve()) != promiseTag) ||
	    (Set && getTag(new Set) != setTag) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	  getTag = function(value) {
	    var result = objectToString.call(value),
	        Ctor = result == objectTag ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : undefined;
	
	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag;
	        case mapCtorString: return mapTag;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}
	
	/**
	 * Checks if `path` exists on `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @param {Function} hasFunc The function to check properties.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 */
	function hasPath(object, path, hasFunc) {
	  path = isKey(path, object) ? [path] : castPath(path);
	
	  var result,
	      index = -1,
	      length = path.length;
	
	  while (++index < length) {
	    var key = toKey(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result) {
	    return result;
	  }
	  var length = object ? object.length : 0;
	  return !!length && isLength(length) && isIndex(key, length) &&
	    (isArray(object) || isArguments(object));
	}
	
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return !!length &&
	    (typeof value == 'number' || reIsUint.test(value)) &&
	    (value > -1 && value % 1 == 0 && value < length);
	}
	
	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey(value, object) {
	  if (isArray(value)) {
	    return false;
	  }
	  var type = typeof value;
	  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	      value == null || isSymbol(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	    (object != null && value in Object(object));
	}
	
	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}
	
	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}
	
	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;
	
	  return value === proto;
	}
	
	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && !isObject(value);
	}
	
	/**
	 * A specialized version of `matchesProperty` for source values suitable
	 * for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function matchesStrictComparable(key, srcValue) {
	  return function(object) {
	    if (object == null) {
	      return false;
	    }
	    return object[key] === srcValue &&
	      (srcValue !== undefined || (key in Object(object)));
	  };
	}
	
	/**
	 * Gets the parent value at `path` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} path The path to get the parent value of.
	 * @returns {*} Returns the parent value.
	 */
	function parent(object, path) {
	  return path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
	}
	
	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath = memoize(function(string) {
	  string = toString(string);
	
	  var result = [];
	  if (reLeadingDot.test(string)) {
	    result.push('');
	  }
	  string.replace(rePropName, function(match, number, quote, string) {
	    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	});
	
	/**
	 * Converts `value` to a string key if it's not a string or symbol.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {string|symbol} Returns the key.
	 */
	function toKey(value) {
	  if (typeof value == 'string' || isSymbol(value)) {
	    return value;
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}
	
	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to process.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}
	
	/**
	 * Gets the last element of `array`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to query.
	 * @returns {*} Returns the last element of `array`.
	 * @example
	 *
	 * _.last([1, 2, 3]);
	 * // => 3
	 */
	function last(array) {
	  var length = array ? array.length : 0;
	  return length ? array[length - 1] : undefined;
	}
	
	/**
	 * Removes all elements from `array` that `predicate` returns truthy for
	 * and returns an array of the removed elements. The predicate is invoked
	 * with three arguments: (value, index, array).
	 *
	 * **Note:** Unlike `_.filter`, this method mutates `array`. Use `_.pull`
	 * to pull elements from an array by value.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.0.0
	 * @category Array
	 * @param {Array} array The array to modify.
	 * @param {Function} [predicate=_.identity]
	 *  The function invoked per iteration.
	 * @returns {Array} Returns the new array of removed elements.
	 * @example
	 *
	 * var array = [1, 2, 3, 4];
	 * var evens = _.remove(array, function(n) {
	 *   return n % 2 == 0;
	 * });
	 *
	 * console.log(array);
	 * // => [1, 3]
	 *
	 * console.log(evens);
	 * // => [2, 4]
	 */
	function remove(array, predicate) {
	  var result = [];
	  if (!(array && array.length)) {
	    return result;
	  }
	  var index = -1,
	      indexes = [],
	      length = array.length;
	
	  predicate = baseIteratee(predicate, 3);
	  while (++index < length) {
	    var value = array[index];
	    if (predicate(value, index, array)) {
	      result.push(value);
	      indexes.push(index);
	    }
	  }
	  basePullAt(array, indexes);
	  return result;
	}
	
	/**
	 * Creates a function that memoizes the result of `func`. If `resolver` is
	 * provided, it determines the cache key for storing the result based on the
	 * arguments provided to the memoized function. By default, the first argument
	 * provided to the memoized function is used as the map cache key. The `func`
	 * is invoked with the `this` binding of the memoized function.
	 *
	 * **Note:** The cache is exposed as the `cache` property on the memoized
	 * function. Its creation may be customized by replacing the `_.memoize.Cache`
	 * constructor with one whose instances implement the
	 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	 * method interface of `delete`, `get`, `has`, and `set`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to have its output memoized.
	 * @param {Function} [resolver] The function to resolve the cache key.
	 * @returns {Function} Returns the new memoized function.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': 2 };
	 * var other = { 'c': 3, 'd': 4 };
	 *
	 * var values = _.memoize(_.values);
	 * values(object);
	 * // => [1, 2]
	 *
	 * values(other);
	 * // => [3, 4]
	 *
	 * object.a = 2;
	 * values(object);
	 * // => [1, 2]
	 *
	 * // Modify the result cache.
	 * values.cache.set(object, ['a', 'b']);
	 * values(object);
	 * // => ['a', 'b']
	 *
	 * // Replace `_.memoize.Cache`.
	 * _.memoize.Cache = WeakMap;
	 */
	function memoize(func, resolver) {
	  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  var memoized = function() {
	    var args = arguments,
	        key = resolver ? resolver.apply(this, args) : args[0],
	        cache = memoized.cache;
	
	    if (cache.has(key)) {
	      return cache.get(key);
	    }
	    var result = func.apply(this, args);
	    memoized.cache = cache.set(key, result);
	    return result;
	  };
	  memoized.cache = new (memoize.Cache || MapCache);
	  return memoized;
	}
	
	// Assign cache to `_.memoize`.
	memoize.Cache = MapCache;
	
	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}
	
	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
	    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
	}
	
	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;
	
	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(value.length) && !isFunction(value);
	}
	
	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8-9 which returns 'object' for typed array and other constructors.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}
	
	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
	
	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  return value == null ? '' : baseToString(value);
	}
	
	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is returned in its place.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.7.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */
	function get(object, path, defaultValue) {
	  var result = object == null ? undefined : baseGet(object, path);
	  return result === undefined ? defaultValue : result;
	}
	
	/**
	 * Checks if `path` is a direct or inherited property of `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
	 *
	 * _.hasIn(object, 'a');
	 * // => true
	 *
	 * _.hasIn(object, 'a.b');
	 * // => true
	 *
	 * _.hasIn(object, ['a', 'b']);
	 * // => true
	 *
	 * _.hasIn(object, 'b');
	 * // => false
	 */
	function hasIn(object, path) {
	  return object != null && hasPath(object, path, baseHasIn);
	}
	
	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}
	
	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}
	
	/**
	 * Creates a function that returns the value at `path` of a given object.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': 2 } },
	 *   { 'a': { 'b': 1 } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b'));
	 * // => [2, 1]
	 *
	 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	 * // => [1, 2]
	 */
	function property(path) {
	  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
	}
	
	module.exports = remove;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(5)(module)))

/***/ },
/* 105 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */
	
	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;
	
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/** `Object#toString` result references. */
	var funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]';
	
	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
	
	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
	
	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
	
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();
	
	/**
	 * A specialized version of `_.includes` for arrays without support for
	 * specifying an index to search from.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludes(array, value) {
	  var length = array ? array.length : 0;
	  return !!length && baseIndexOf(array, value, 0) > -1;
	}
	
	/**
	 * This function is like `arrayIncludes` except that it accepts a comparator.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @param {Function} comparator The comparator invoked per element.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludesWith(array, value, comparator) {
	  var index = -1,
	      length = array ? array.length : 0;
	
	  while (++index < length) {
	    if (comparator(value, array[index])) {
	      return true;
	    }
	  }
	  return false;
	}
	
	/**
	 * The base implementation of `_.findIndex` and `_.findLastIndex` without
	 * support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {number} fromIndex The index to search from.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseFindIndex(array, predicate, fromIndex, fromRight) {
	  var length = array.length,
	      index = fromIndex + (fromRight ? 1 : -1);
	
	  while ((fromRight ? index-- : ++index < length)) {
	    if (predicate(array[index], index, array)) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	/**
	 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseIndexOf(array, value, fromIndex) {
	  if (value !== value) {
	    return baseFindIndex(array, baseIsNaN, fromIndex);
	  }
	  var index = fromIndex - 1,
	      length = array.length;
	
	  while (++index < length) {
	    if (array[index] === value) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	/**
	 * The base implementation of `_.isNaN` without support for number objects.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	 */
	function baseIsNaN(value) {
	  return value !== value;
	}
	
	/**
	 * Checks if a cache value for `key` exists.
	 *
	 * @private
	 * @param {Object} cache The cache to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function cacheHas(cache, key) {
	  return cache.has(key);
	}
	
	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}
	
	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}
	
	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);
	
	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}
	
	/** Used for built-in method references. */
	var arrayProto = Array.prototype,
	    funcProto = Function.prototype,
	    objectProto = Object.prototype;
	
	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];
	
	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);
	
	/** Built-in value references. */
	var splice = arrayProto.splice;
	
	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map'),
	    Set = getNative(root, 'Set'),
	    nativeCreate = getNative(Object, 'create');
	
	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	}
	
	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  return this.has(key) && delete this.__data__[key];
	}
	
	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}
	
	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
	}
	
	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}
	
	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;
	
	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	}
	
	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  return true;
	}
	
	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  return index < 0 ? undefined : data[index][1];
	}
	
	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}
	
	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}
	
	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;
	
	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}
	
	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  return getMapData(this, key)['delete'](key);
	}
	
	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}
	
	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}
	
	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  getMapData(this, key).set(key, value);
	  return this;
	}
	
	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;
	
	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache(values) {
	  var index = -1,
	      length = values ? values.length : 0;
	
	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}
	
	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd(value) {
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}
	
	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */
	function setCacheHas(value) {
	  return this.__data__.has(value);
	}
	
	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;
	
	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}
	
	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}
	
	/**
	 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} [iteratee] The iteratee invoked per element.
	 * @param {Function} [comparator] The comparator invoked per element.
	 * @returns {Array} Returns the new duplicate free array.
	 */
	function baseUniq(array, iteratee, comparator) {
	  var index = -1,
	      includes = arrayIncludes,
	      length = array.length,
	      isCommon = true,
	      result = [],
	      seen = result;
	
	  if (comparator) {
	    isCommon = false;
	    includes = arrayIncludesWith;
	  }
	  else if (length >= LARGE_ARRAY_SIZE) {
	    var set = iteratee ? null : createSet(array);
	    if (set) {
	      return setToArray(set);
	    }
	    isCommon = false;
	    includes = cacheHas;
	    seen = new SetCache;
	  }
	  else {
	    seen = iteratee ? [] : result;
	  }
	  outer:
	  while (++index < length) {
	    var value = array[index],
	        computed = iteratee ? iteratee(value) : value;
	
	    value = (comparator || value !== 0) ? value : 0;
	    if (isCommon && computed === computed) {
	      var seenIndex = seen.length;
	      while (seenIndex--) {
	        if (seen[seenIndex] === computed) {
	          continue outer;
	        }
	      }
	      if (iteratee) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	    else if (!includes(seen, computed, comparator)) {
	      if (seen !== result) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	  }
	  return result;
	}
	
	/**
	 * Creates a set object of `values`.
	 *
	 * @private
	 * @param {Array} values The values to add to the set.
	 * @returns {Object} Returns the new set.
	 */
	var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
	  return new Set(values);
	};
	
	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}
	
	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}
	
	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}
	
	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to process.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}
	
	/**
	 * Creates a duplicate-free version of an array, using
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons, in which only the first occurrence of each
	 * element is kept.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @returns {Array} Returns the new duplicate free array.
	 * @example
	 *
	 * _.uniq([2, 1, 2]);
	 * // => [2, 1]
	 */
	function uniq(array) {
	  return (array && array.length)
	    ? baseUniq(array)
	    : [];
	}
	
	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8-9 which returns 'object' for typed array and other constructors.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}
	
	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	/**
	 * This method returns `undefined`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.3.0
	 * @category Util
	 * @example
	 *
	 * _.times(2, _.noop);
	 * // => [undefined, undefined]
	 */
	function noop() {
	  // No operation performed.
	}
	
	module.exports = uniq;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	
	var forOwn = __webpack_require__(103)
	var escape = __webpack_require__(107)
	
	// https://developer.mozilla.org/en-US/docs/Web/API/element
	var omit = [
	  'attributes',
	  'childElementCount',
	  'children',
	  'classList',
	  'clientHeight',
	  'clientLeft',
	  'clientTop',
	  'clientWidth',
	  'currentStyle',
	  'firstElementChild',
	  'innerHTML',
	  'lastElementChild',
	  'nextElementSibling',
	  'ongotpointercapture',
	  'onlostpointercapture',
	  'onwheel',
	  'outerHTML',
	  'previousElementSibling',
	  'runtimeStyle',
	  'scrollHeight',
	  'scrollLeft',
	  'scrollLeftMax',
	  'scrollTop',
	  'scrollTopMax',
	  'scrollWidth',
	  'tabStop',
	  'tagName'
	]
	
	// data.props
	
	module.exports = function propsModule (vnode, attributes) {
	  var props = vnode.data.props || {}
	
	  forOwn(props, function (value, key) {
	    if (omit.indexOf(key) > -1) {
	      return
	    }
	    if (key === 'htmlFor') {
	      key = 'for'
	    }
	    if (key === 'className') {
	      key = 'class'
	    }
	
	    attributes.set(key.toLowerCase(), escape(value))
	  })
	}


/***/ },
/* 107 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';
	
	/** Used to match HTML entities and HTML characters. */
	var reUnescapedHtml = /[&<>"'`]/g,
	    reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
	
	/** Used to map characters to HTML entities. */
	var htmlEscapes = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&#39;',
	  '`': '&#96;'
	};
	
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
	
	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
	
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();
	
	/**
	 * The base implementation of `_.propertyOf` without support for deep paths.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyOf(object) {
	  return function(key) {
	    return object == null ? undefined : object[key];
	  };
	}
	
	/**
	 * Used by `_.escape` to convert characters to HTML entities.
	 *
	 * @private
	 * @param {string} chr The matched character to escape.
	 * @returns {string} Returns the escaped character.
	 */
	var escapeHtmlChar = basePropertyOf(htmlEscapes);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/** Built-in value references. */
	var Symbol = root.Symbol;
	
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;
	
	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}
	
	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}
	
	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  return value == null ? '' : baseToString(value);
	}
	
	/**
	 * Converts the characters "&", "<", ">", '"', "'", and "\`" in `string` to
	 * their corresponding HTML entities.
	 *
	 * **Note:** No other characters are escaped. To escape additional
	 * characters use a third-party library like [_he_](https://mths.be/he).
	 *
	 * Though the ">" character is escaped for symmetry, characters like
	 * ">" and "/" don't need escaping in HTML and have no special meaning
	 * unless they're part of a tag or unquoted attribute value. See
	 * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
	 * (under "semi-related fun fact") for more details.
	 *
	 * Backticks are escaped because in IE < 9, they can break out of
	 * attribute values or HTML comments. See [#59](https://html5sec.org/#59),
	 * [#102](https://html5sec.org/#102), [#108](https://html5sec.org/#108), and
	 * [#133](https://html5sec.org/#133) of the
	 * [HTML5 Security Cheatsheet](https://html5sec.org/) for more details.
	 *
	 * When working with HTML you should always
	 * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
	 * XSS vectors.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category String
	 * @param {string} [string=''] The string to escape.
	 * @returns {string} Returns the escaped string.
	 * @example
	 *
	 * _.escape('fred, barney, & pebbles');
	 * // => 'fred, barney, &amp; pebbles'
	 */
	function escape(string) {
	  string = toString(string);
	  return (string && reHasUnescapedHtml.test(string))
	    ? string.replace(reUnescapedHtml, escapeHtmlChar)
	    : string;
	}
	
	module.exports = escape;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	
	var forOwn = __webpack_require__(103)
	var escape = __webpack_require__(107)
	
	// data.attrs
	
	module.exports = function attrsModule (vnode, attributes) {
	  var attrs = vnode.data.attrs || {}
	
	  forOwn(attrs, function (value, key) {
	    attributes.set(key, escape(value))
	  })
	}


/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	
	var assign = __webpack_require__(110)
	var forOwn = __webpack_require__(103)
	var escape = __webpack_require__(107)
	var kebabCase = __webpack_require__(111)
	
	// data.style
	
	module.exports = function styleModule (vnode, attributes) {
	  var values = []
	  var style = vnode.data.style || {}
	
	  // merge in `delayed` properties
	  if (style.delayed) {
	    assign(style, style.delayed)
	  }
	
	  forOwn(style, function (value, key) {
	    // omit hook objects
	    if (typeof value === 'string' || typeof value === 'number') {
	      values.push(kebabCase(key) + ': ' + escape(value))
	    }
	  })
	
	  if (values.length) {
	    attributes.set('style', values.join('; '))
	  }
	}


/***/ },
/* 110 */
/***/ function(module, exports) {

	'use strict';
	/* eslint-disable no-unused-vars */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;
	
	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}
	
		return Object(val);
	}
	
	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}
	
			// Detect buggy property enumeration order in older V8 versions.
	
			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}
	
			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}
	
			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}
	
			return true;
		} catch (e) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}
	
	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;
	
		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);
	
			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}
	
			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}
	
		return to;
	};


/***/ },
/* 111 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';
	
	/** Used to match words composed of alphanumeric characters. */
	var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
	
	/** Used to match Latin Unicode letters (excluding mathematical operators). */
	var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
	
	/** Used to compose unicode character classes. */
	var rsAstralRange = '\\ud800-\\udfff',
	    rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23',
	    rsComboSymbolsRange = '\\u20d0-\\u20f0',
	    rsDingbatRange = '\\u2700-\\u27bf',
	    rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff',
	    rsMathOpRange = '\\xac\\xb1\\xd7\\xf7',
	    rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
	    rsPunctuationRange = '\\u2000-\\u206f',
	    rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000',
	    rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
	    rsVarRange = '\\ufe0e\\ufe0f',
	    rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
	
	/** Used to compose unicode capture groups. */
	var rsApos = "['\u2019]",
	    rsBreak = '[' + rsBreakRange + ']',
	    rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']',
	    rsDigits = '\\d+',
	    rsDingbat = '[' + rsDingbatRange + ']',
	    rsLower = '[' + rsLowerRange + ']',
	    rsMisc = '[^' + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']',
	    rsFitz = '\\ud83c[\\udffb-\\udfff]',
	    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
	    rsNonAstral = '[^' + rsAstralRange + ']',
	    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
	    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
	    rsUpper = '[' + rsUpperRange + ']',
	    rsZWJ = '\\u200d';
	
	/** Used to compose unicode regexes. */
	var rsLowerMisc = '(?:' + rsLower + '|' + rsMisc + ')',
	    rsUpperMisc = '(?:' + rsUpper + '|' + rsMisc + ')',
	    rsOptLowerContr = '(?:' + rsApos + '(?:d|ll|m|re|s|t|ve))?',
	    rsOptUpperContr = '(?:' + rsApos + '(?:D|LL|M|RE|S|T|VE))?',
	    reOptMod = rsModifier + '?',
	    rsOptVar = '[' + rsVarRange + ']?',
	    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
	    rsSeq = rsOptVar + reOptMod + rsOptJoin,
	    rsEmoji = '(?:' + [rsDingbat, rsRegional, rsSurrPair].join('|') + ')' + rsSeq;
	
	/** Used to match apostrophes. */
	var reApos = RegExp(rsApos, 'g');
	
	/**
	 * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
	 * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
	 */
	var reComboMark = RegExp(rsCombo, 'g');
	
	/** Used to match complex or compound words. */
	var reUnicodeWord = RegExp([
	  rsUpper + '?' + rsLower + '+' + rsOptLowerContr + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')',
	  rsUpperMisc + '+' + rsOptUpperContr + '(?=' + [rsBreak, rsUpper + rsLowerMisc, '$'].join('|') + ')',
	  rsUpper + '?' + rsLowerMisc + '+' + rsOptLowerContr,
	  rsUpper + '+' + rsOptUpperContr,
	  rsDigits,
	  rsEmoji
	].join('|'), 'g');
	
	/** Used to detect strings that need a more robust regexp to match words. */
	var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
	
	/** Used to map Latin Unicode letters to basic Latin letters. */
	var deburredLetters = {
	  // Latin-1 Supplement block.
	  '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
	  '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
	  '\xc7': 'C',  '\xe7': 'c',
	  '\xd0': 'D',  '\xf0': 'd',
	  '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
	  '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
	  '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
	  '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
	  '\xd1': 'N',  '\xf1': 'n',
	  '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
	  '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
	  '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
	  '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
	  '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
	  '\xc6': 'Ae', '\xe6': 'ae',
	  '\xde': 'Th', '\xfe': 'th',
	  '\xdf': 'ss',
	  // Latin Extended-A block.
	  '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
	  '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
	  '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
	  '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
	  '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
	  '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
	  '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
	  '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
	  '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
	  '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
	  '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
	  '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
	  '\u0134': 'J',  '\u0135': 'j',
	  '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
	  '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
	  '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
	  '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
	  '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
	  '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
	  '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
	  '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
	  '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
	  '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
	  '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
	  '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
	  '\u0163': 't',  '\u0165': 't', '\u0167': 't',
	  '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
	  '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
	  '\u0174': 'W',  '\u0175': 'w',
	  '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
	  '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
	  '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
	  '\u0132': 'IJ', '\u0133': 'ij',
	  '\u0152': 'Oe', '\u0153': 'oe',
	  '\u0149': "'n", '\u017f': 'ss'
	};
	
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
	
	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
	
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();
	
	/**
	 * A specialized version of `_.reduce` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {*} [accumulator] The initial value.
	 * @param {boolean} [initAccum] Specify using the first element of `array` as
	 *  the initial value.
	 * @returns {*} Returns the accumulated value.
	 */
	function arrayReduce(array, iteratee, accumulator, initAccum) {
	  var index = -1,
	      length = array ? array.length : 0;
	
	  if (initAccum && length) {
	    accumulator = array[++index];
	  }
	  while (++index < length) {
	    accumulator = iteratee(accumulator, array[index], index, array);
	  }
	  return accumulator;
	}
	
	/**
	 * Splits an ASCII `string` into an array of its words.
	 *
	 * @private
	 * @param {string} The string to inspect.
	 * @returns {Array} Returns the words of `string`.
	 */
	function asciiWords(string) {
	  return string.match(reAsciiWord) || [];
	}
	
	/**
	 * The base implementation of `_.propertyOf` without support for deep paths.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyOf(object) {
	  return function(key) {
	    return object == null ? undefined : object[key];
	  };
	}
	
	/**
	 * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
	 * letters to basic Latin letters.
	 *
	 * @private
	 * @param {string} letter The matched letter to deburr.
	 * @returns {string} Returns the deburred letter.
	 */
	var deburrLetter = basePropertyOf(deburredLetters);
	
	/**
	 * Checks if `string` contains a word composed of Unicode symbols.
	 *
	 * @private
	 * @param {string} string The string to inspect.
	 * @returns {boolean} Returns `true` if a word is found, else `false`.
	 */
	function hasUnicodeWord(string) {
	  return reHasUnicodeWord.test(string);
	}
	
	/**
	 * Splits a Unicode `string` into an array of its words.
	 *
	 * @private
	 * @param {string} The string to inspect.
	 * @returns {Array} Returns the words of `string`.
	 */
	function unicodeWords(string) {
	  return string.match(reUnicodeWord) || [];
	}
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/** Built-in value references. */
	var Symbol = root.Symbol;
	
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;
	
	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}
	
	/**
	 * Creates a function like `_.camelCase`.
	 *
	 * @private
	 * @param {Function} callback The function to combine each word.
	 * @returns {Function} Returns the new compounder function.
	 */
	function createCompounder(callback) {
	  return function(string) {
	    return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
	  };
	}
	
	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}
	
	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  return value == null ? '' : baseToString(value);
	}
	
	/**
	 * Deburrs `string` by converting
	 * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
	 * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
	 * letters to basic Latin letters and removing
	 * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category String
	 * @param {string} [string=''] The string to deburr.
	 * @returns {string} Returns the deburred string.
	 * @example
	 *
	 * _.deburr('déjà vu');
	 * // => 'deja vu'
	 */
	function deburr(string) {
	  string = toString(string);
	  return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
	}
	
	/**
	 * Converts `string` to
	 * [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category String
	 * @param {string} [string=''] The string to convert.
	 * @returns {string} Returns the kebab cased string.
	 * @example
	 *
	 * _.kebabCase('Foo Bar');
	 * // => 'foo-bar'
	 *
	 * _.kebabCase('fooBar');
	 * // => 'foo-bar'
	 *
	 * _.kebabCase('__FOO_BAR__');
	 * // => 'foo-bar'
	 */
	var kebabCase = createCompounder(function(result, word, index) {
	  return result + (index ? '-' : '') + word.toLowerCase();
	});
	
	/**
	 * Splits `string` into an array of its words.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category String
	 * @param {string} [string=''] The string to inspect.
	 * @param {RegExp|string} [pattern] The pattern to match words.
	 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	 * @returns {Array} Returns the words of `string`.
	 * @example
	 *
	 * _.words('fred, barney, & pebbles');
	 * // => ['fred', 'barney', 'pebbles']
	 *
	 * _.words('fred, barney, & pebbles', /[^, ]+/g);
	 * // => ['fred', 'barney', '&', 'pebbles']
	 */
	function words(string, pattern, guard) {
	  string = toString(string);
	  pattern = guard ? undefined : pattern;
	
	  if (pattern === undefined) {
	    return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
	  }
	  return string.match(pattern) || [];
	}
	
	module.exports = kebabCase;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xstream_1 = __webpack_require__(12);
	var adapt_1 = __webpack_require__(7);
	var SCOPE_PREFIX = '___';
	var MockedDOMSource = (function () {
	    function MockedDOMSource(_mockConfig) {
	        this._mockConfig = _mockConfig;
	        if (_mockConfig['elements']) {
	            this._elements = _mockConfig['elements'];
	        }
	        else {
	            this._elements = adapt_1.adapt(xstream_1.default.empty());
	        }
	    }
	    MockedDOMSource.prototype.elements = function () {
	        var out = this._elements;
	        out._isCycleSource = 'MockedDOM';
	        return out;
	    };
	    MockedDOMSource.prototype.events = function (eventType, options) {
	        var streamForEventType = this._mockConfig[eventType];
	        var out = adapt_1.adapt(streamForEventType || xstream_1.default.empty());
	        out._isCycleSource = 'MockedDOM';
	        return out;
	    };
	    MockedDOMSource.prototype.select = function (selector) {
	        var mockConfigForSelector = this._mockConfig[selector] || {};
	        return new MockedDOMSource(mockConfigForSelector);
	    };
	    MockedDOMSource.prototype.isolateSource = function (source, scope) {
	        return source.select('.' + SCOPE_PREFIX + scope);
	    };
	    MockedDOMSource.prototype.isolateSink = function (sink, scope) {
	        return sink.map(function (vnode) {
	            if (vnode.sel && vnode.sel.indexOf(SCOPE_PREFIX + scope) !== -1) {
	                return vnode;
	            }
	            else {
	                vnode.sel += "." + SCOPE_PREFIX + scope;
	                return vnode;
	            }
	        });
	    };
	    return MockedDOMSource;
	}());
	exports.MockedDOMSource = MockedDOMSource;
	function mockDOMSource(mockConfig) {
	    return new MockedDOMSource(mockConfig);
	}
	exports.mockDOMSource = mockDOMSource;
	//# sourceMappingURL=mockDOMSource.js.map

/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var h_1 = __webpack_require__(15);
	function isValidString(param) {
	    return typeof param === 'string' && param.length > 0;
	}
	function isSelector(param) {
	    return isValidString(param) && (param[0] === '.' || param[0] === '#');
	}
	function createTagFunction(tagName) {
	    return function hyperscript(a, b, c) {
	        var hasA = typeof a !== 'undefined';
	        var hasB = typeof b !== 'undefined';
	        var hasC = typeof c !== 'undefined';
	        if (isSelector(a)) {
	            if (hasB && hasC) {
	                return h_1.h(tagName + a, b, c);
	            }
	            else if (hasB) {
	                return h_1.h(tagName + a, b);
	            }
	            else {
	                return h_1.h(tagName + a, {});
	            }
	        }
	        else if (hasC) {
	            return h_1.h(tagName + a, b, c);
	        }
	        else if (hasB) {
	            return h_1.h(tagName, a, b);
	        }
	        else if (hasA) {
	            return h_1.h(tagName, a);
	        }
	        else {
	            return h_1.h(tagName, {});
	        }
	    };
	}
	var SVG_TAG_NAMES = [
	    'a', 'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor',
	    'animateMotion', 'animateTransform', 'circle', 'clipPath', 'colorProfile',
	    'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix',
	    'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
	    'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB',
	    'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode',
	    'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting',
	    'feSpotlight', 'feTile', 'feTurbulence', 'filter', 'font', 'fontFace',
	    'fontFaceFormat', 'fontFaceName', 'fontFaceSrc', 'fontFaceUri',
	    'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line',
	    'linearGradient', 'marker', 'mask', 'metadata', 'missingGlyph', 'mpath',
	    'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'script',
	    'set', 'stop', 'style', 'switch', 'symbol', 'text', 'textPath', 'title',
	    'tref', 'tspan', 'use', 'view', 'vkern',
	];
	var svg = createTagFunction('svg');
	SVG_TAG_NAMES.forEach(function (tag) {
	    svg[tag] = createTagFunction(tag);
	});
	var TAG_NAMES = [
	    'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base',
	    'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption',
	    'cite', 'code', 'col', 'colgroup', 'dd', 'del', 'dfn', 'dir', 'div', 'dl',
	    'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
	    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html',
	    'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend',
	    'li', 'link', 'main', 'map', 'mark', 'menu', 'meta', 'nav', 'noscript',
	    'object', 'ol', 'optgroup', 'option', 'p', 'param', 'pre', 'progress', 'q',
	    'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small',
	    'source', 'span', 'strong', 'style', 'sub', 'sup', 'table', 'tbody', 'td',
	    'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'u', 'ul', 'video',
	];
	var exported = { SVG_TAG_NAMES: SVG_TAG_NAMES, TAG_NAMES: TAG_NAMES, svg: svg, isSelector: isSelector, createTagFunction: createTagFunction };
	TAG_NAMES.forEach(function (n) {
	    exported[n] = createTagFunction(n);
	});
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = exported;
	//# sourceMappingURL=hyperscript-helpers.js.map

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var xstream_1 = __webpack_require__(12);
	var events_1 = __webpack_require__(115);
	var meetups_1 = __webpack_require__(117);
	var events_2 = __webpack_require__(115);
	var EventsSource = (function () {
	    function EventsSource(event$) {
	        var xs = xstream_1.Stream;
	        this.event$ =
	            event$
	                .map(function (url) {
	                return events_1.default
	                    .filter(function (event) { return url === event.url; })
	                    .shift();
	            });
	        var meetupsEvent$ = xs.fromArray(events_1.default.filter(function (event) {
	            return event.meetup_event_id != undefined
	                && event.meetup_urlname != undefined
	                && event.event_time.start_time.getTime() > new Date().getTime();
	        }));
	        var meetups = meetups_1.makeMeetupsDriver()(meetupsEvent$);
	        var meetup$ = meetups.event$;
	        var eventsChange$ = meetup$.map(function (meetup) {
	            var event = events_1.default.find(function (event) { return event.url === meetup.event_url; });
	            if (event != undefined)
	                event.attending = meetup.yes_rsvp_count;
	            return true;
	        });
	        this.events$ =
	            eventsChange$
	                .map(function () { return events_1.default; })
	                .startWith(events_1.default);
	    }
	    return EventsSource;
	}());
	exports.EventsSource = EventsSource;
	function makeEventsDriver() {
	    function eventsDriver(event$) {
	        return new EventsSource(event$);
	    }
	    return eventsDriver;
	}
	exports.makeEventsDriver = makeEventsDriver;
	function topEvents(events) {
	    var chennaiEvent = events
	        .filter(function (ev) { return ev.venue === events_2.CHENNAI_ADDRESS; })
	        .sort(function (a, b) { return b.event_time.start_time.getTime() - a.event_time.start_time.getTime(); })
	        .shift();
	    var bangaloreEvent = events
	        .filter(function (ev) { return ev.venue === events_2.BANGALORE_ADDRESS; })
	        .sort(function (a, b) { return b.event_time.start_time.getTime() - a.event_time.start_time.getTime(); })
	        .shift();
	    return [bangaloreEvent, chennaiEvent];
	}
	exports.topEvents = topEvents;
	function moreEvents(events, more) {
	    if (!more)
	        return [];
	    var topEventsResult = topEvents(events);
	    var sortedEvents = events
	        .sort(function (a, b) { return b.event_time.start_time.getTime() - a.event_time.start_time.getTime(); });
	    return sortedEvents.filter(function (event) { return topEventsResult.indexOf(event) === -1; });
	}
	exports.moreEvents = moreEvents;
	exports.default = makeEventsDriver;


/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var definitions_1 = __webpack_require__(116);
	exports.BANGALORE_ADDRESS = {
	    line_one: '#365, 3rd Floor, Sulochana Building',
	    line_two: '1st Cross Road, 3rd Block, Sarjapura Main Road',
	    locality: 'Koramangala',
	    city: 'Bangalore',
	    zip: 560034,
	    map_link: 'https://goo.gl/maps/ziSASk4tmvM2',
	    map_image: 'images/bangalore-map.jpg'
	};
	exports.CHENNAI_ADDRESS = {
	    line_one: 'Sahaj Software Solutions Pvt. Ltd.',
	    line_two: 'Type 2/15, Dr.V.S.I Estate, Rajiv Gandhi Salai',
	    locality: 'Thiruvanmiyur',
	    city: 'Chennai',
	    zip: 600041,
	    map_link: 'https://goo.gl/maps/7Z8iBAdjT1o',
	    map_image: 'images/chennai-map.png'
	};
	exports.events = [
	    {
	        title: 'Data science: How it helps',
	        url: 'data-science-how-it-helps',
	        categories: ['events'],
	        tags: ['data-science'],
	        author: 'devday_team',
	        abstract: 'On this 3 Edition of DevDay, we have Viral B. Shah, co-inventor of JuliaLang, and other speakers from Sahaj, to share their  experiences and learnings on Data Science.',
	        event_time: {
	            start_time: new Date('2016-05-07T10:30:00+05:30'),
	            end_time: new Date('2016-05-07T13:30:00+05:30'),
	        },
	        publish_time: new Date('2016-05-07T10:30:00+05:30'),
	        registration_time: {
	            start_time: new Date('2016-05-07T10:30:00+05:30'),
	            end_time: new Date('2016-05-07T13:30:00+05:30')
	        },
	        venue: exports.BANGALORE_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Julia - A fresh approach to data science and technical computing',
	                abstract: '',
	                authors: [
	                    {
	                        name: "Viral B. Shah",
	                        image_url: 'images/speakers/viral-shah.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-05-07T10:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Break,
	                time: {
	                    start_time: new Date('2016-04-02T11:15:00+05:30')
	                },
	                title: 'Tea Break'
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Applied data science for developers',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Dileep Bapat',
	                        image_url: 'images/speakers/dileep.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-05-07T11:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Break,
	                time: {
	                    start_time: new Date('2016-05-07T13:00:00+05:30')
	                },
	                title: 'Lunch Break'
	            }
	        ]
	    },
	    {
	        title: 'All about databases',
	        url: 'all-about-databases',
	        categories: ['events'],
	        tags: ['databases', 'sqlite', 'event streams'],
	        author: 'devday_team',
	        abstract: 'A Date with Databases. This meet up would be all about Databases - the internals and the overall. The idea is to tear down databases, across relational/non relational, and understand them deep down.',
	        event_time: {
	            start_time: new Date('2016-06-04T10:30:00+05:30'),
	            end_time: new Date('2016-06-04T13:30:00+05:30'),
	        },
	        publish_time: new Date('2016-06-04T10:30:00+05:30'),
	        registration_time: {
	            start_time: new Date('2016-06-04T10:30:00+05:30'),
	            end_time: new Date('2016-06-04T10:30:00+05:30')
	        },
	        venue: exports.BANGALORE_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Databases: Days of the future past',
	                abstract: '',
	                authors: [
	                    {
	                        name: "Avinash Nijampure"
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-06-04T10:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Break,
	                time: {
	                    start_time: new Date('2016-06-04T11:15:00+05:30')
	                },
	                title: 'Tea and snacks'
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'SQLite: Why aren\'t you using it more?',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Srimathi Harinarayanan',
	                        image_url: 'images/speakers/srimathi.jpg'
	                    },
	                    {
	                        name: 'Navaneeth KN',
	                        image_url: 'images/speakers/navneeth.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-06-04T11:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Databases as event streams',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Shashank Teotia',
	                        image_url: 'images/speakers/shashank-teotia.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-06-04T12:15:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Break,
	                time: {
	                    start_time: new Date('2016-06-04T13:00:00+05:30')
	                },
	                title: 'Lunch'
	            }
	        ]
	    },
	    {
	        title: 'Arduino Day',
	        url: 'arduino-day',
	        categories: ['events'],
	        tags: ['arduino-genuino-iot'],
	        author: 'devday_team',
	        abstract: 'Arduino Day is a worldwide birthday celebration of Arduino and Genuino. It\'s a one day event –organized directly by the community, or by the Arduino founders– where people interested in Arduino and Genuino get together, share their experiences, and learn more.',
	        event_time: {
	            start_time: new Date('2016-04-02T10:30:00+05:30'),
	            end_time: new Date('2016-04-02T14:30:00+05:30'),
	        },
	        publish_time: new Date('2016-04-02T10:30:00+05:30'),
	        registration_time: {
	            start_time: new Date('2016-04-02T10:30:00+05:30'),
	            end_time: new Date('2016-04-02T10:30:00+05:30')
	        },
	        venue: exports.BANGALORE_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Adventures with Arduino',
	                abstract: '',
	                authors: [
	                    {
	                        name: "Himesh Reddivari",
	                        image_url: 'images/speakers/himesh-reddivari.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-04-02T10:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Break,
	                time: {
	                    start_time: new Date('2016-04-02T11:15:00+05:30')
	                },
	                title: 'Tea Break'
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Journey of Samvid',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Shashank Teotia',
	                        image_url: 'images/speakers/shashank-teotia.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-04-02T11:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Simple obstacle avoiding Robot using Arduino',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Deepak Nararyana Rao',
	                        image_url: 'images/speakers/deepak.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-04-02T12:15:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Workshop,
	                title: 'Workshop on Arduino',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Dileep Bapat',
	                        image_url: 'images/speakers/dileep.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-04-02T13:00:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Break,
	                time: {
	                    start_time: new Date('2016-06-04T13:45:00+05:30')
	                },
	                title: 'Lunch Break'
	            }
	        ]
	    },
	    {
	        title: 'DevDay',
	        url: 'first-devday',
	        categories: ['events'],
	        tags: ['devday', 'Neo4j', 'patttern to scale mobile', 'IOT'],
	        author: 'devday_team',
	        abstract: 'DevDay is a monthly informal event for developers to share their experiences, ideas, opinions & perspectives about technology',
	        event_time: {
	            start_time: new Date('2016-03-05T10:30:00+05:30'),
	            end_time: new Date('2016-03-03T13:00:00+05:30'),
	        },
	        publish_time: new Date('2016-02-27T10:30:00+05:30'),
	        registration_time: {
	            start_time: new Date('2016-02-27T10:30:00+05:30'),
	            end_time: new Date('2016-03-05T10:00:00+05:30')
	        },
	        venue: exports.BANGALORE_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Neo4j - Graph Database',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Mahesh Lal',
	                        image_url: 'images/speakers/mahesh-lal.png'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-03-05T10:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Break,
	                time: {
	                    start_time: new Date('2016-03-05T11:30:00+05:30')
	                },
	                title: 'Tea Break'
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Patterns to Scale Mobile Developmen',
	                abstract: '',
	                authors: [
	                    {
	                        name: "Priyank Gupta",
	                        image_url: 'images/speakers/priyank.png'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-03-05T11:45:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'IOT (Lightning Talk)',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Dileep Bapat',
	                        image_url: 'images/speakers/dileep.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-03-05T12:45:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'IOT (Lightning Talk)',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Mahesh B R',
	                        image_url: 'images/speakers/mahesh.png'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-03-05T13:00:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Break,
	                time: {
	                    start_time: new Date('2016-03-05T13:15:00+05:30')
	                },
	                title: 'Lunch Break'
	            }
	        ]
	    },
	    {
	        title: 'DevOps in Cloud',
	        url: 'devops-in-cloud',
	        categories: ['events'],
	        tags: ['cloud computing', 'cloud', 'devops'],
	        author: 'devday_team',
	        abstract: 'Upload. Download. Dock. Serve. Functions on demand. Everything to do with the cloud.',
	        event_time: {
	            start_time: new Date('2016-07-16T10:30:00+05:30'),
	            end_time: new Date('2016-07-16T13:30:00+05:30'),
	        },
	        publish_time: new Date('2016-07-08T10:30:00+05:30'),
	        registration_time: {
	            start_time: new Date('2016-07-08T10:30:00+05:30'),
	            end_time: new Date('2016-07-16T10:15:00+05:30')
	        },
	        venue: exports.BANGALORE_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Product For Blue - Green Deployments Verification',
	                abstract: '',
	                authors: [
	                    {
	                        name: "Srikanth Seshadri",
	                        image_url: 'images/speakers/srikanth.png'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-07-09T10:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Break,
	                time: {
	                    start_time: new Date('2016-07-09T11:15:00+05:30')
	                },
	                title: 'Tea and snacks'
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Misconceptions of cloud: Automation!',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Arther Antony',
	                        image_url: 'images/speakers/arther.png'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-07-09T11:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Introduction to DevOps, the pain-points and the frameworks',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Raghavendrra Mahesh',
	                        image_url: 'images/speakers/mahesh.png'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-07-09T12:15:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Break,
	                time: {
	                    start_time: new Date('2016-07-09T13:00:00+05:30')
	                },
	                title: 'Lunch Break'
	            }
	        ],
	        color: 'black',
	        image_url: 'images/events/cloud_computing.jpg'
	    },
	    {
	        title: 'JS Everywhere',
	        url: 'js-everywhere',
	        categories: ['events'],
	        tags: ['js', 'javascript', 'react-native', 'cycle-js'],
	        author: 'devday_team',
	        abstract: 'Desktop or offline applications? We\'ve got you covered. Reactive applications? Try cycle. Native moblie applications? We have React Native. Internet of Things? Johnny Five\'s here to help. JavaScript has evolved into one of the easiest and ubiquitous language around, and it looks like there isn\'t much that can\'t be done with it. JS Everywhere - Let\'s rejoice!',
	        event_time: {
	            start_time: new Date('2016-08-04T18:30:00+05:30'),
	            end_time: new Date('2016-08-04T20:30:00+05:30'),
	        },
	        publish_time: new Date('2016-08-04T18:30:00+05:30'),
	        registration_time: {
	            start_time: new Date('2016-08-04T18:30:00+05:30'),
	            end_time: new Date('2016-08-04T18:30:00+05:30')
	        },
	        venue: exports.CHENNAI_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Creating offline/desktop applications using Electron',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Sairam Krishnamurthy',
	                        image_url: 'images/speakers/sairam.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-08-04T18:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Building native mobile applications using React Native',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Vagmi Mudumbai',
	                        image_url: 'images/speakers/vagmi.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-08-04T19:00:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Functional Reactive Programming with Cycle.js',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Sudarsan Balaji',
	                        image_url: 'images/speakers/sudarsan.png'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-08-04T19:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Writing for IoT using Johnny-Five',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Raj Bharath Kannan',
	                        image_url: 'images/speakers/raj.png'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-04-02T13:00:00+05:30')
	                }
	            }
	        ],
	        color: '#f7df1e',
	        background_size: '200px',
	        image_url: 'images/events/js_everywhere.png',
	        meetup_urlname: 'devday_chennai',
	        meetup_event_id: '232886624'
	    },
	    {
	        title: 'Functional programming: Hands on Elixir',
	        url: 'hands-on-elixir',
	        categories: ['events'],
	        tags: ['elixir', 'functional programming', 'concurrent programming'],
	        author: 'devday_team',
	        abstract: 'We bring to you Elixir - a concurrent, functional programming language.',
	        event_time: {
	            start_time: new Date('2016-08-27T10:30:00+05:30'),
	            end_time: new Date('2016-08-28T13:30:00+05:30'),
	        },
	        publish_time: new Date('2016-07-09T10:30:00+05:30'),
	        registration_time: {
	            start_time: new Date('2016-08-27T10:30:00+05:30'),
	            end_time: new Date('2016-08-28T13:30:00+05:30'),
	        },
	        venue: exports.BANGALORE_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Workshop,
	                title: 'Hands-On with Elixir',
	                abstract: '',
	                authors: [
	                    {
	                        name: "Navaneeth N",
	                        image_url: 'images/speakers/navneeth.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-08-27T10:30:00+05:30')
	                }
	            }
	        ],
	        color: '#211b33',
	        image_url: 'images/events/tasting_elixir.jpg',
	        meetup_urlname: 'devday_bangalore',
	        meetup_event_id: '233530425'
	    },
	    {
	        title: 'This time it\'s real-time',
	        url: 'its-real-time',
	        categories: ['events'],
	        tags: ['real-time', 'rtc', 'webrtc', 'peer-js'],
	        author: 'devday_team',
	        abstract: 'In this edition of Dev Day (Chennai) we have talks scheduled on RTC. Come learn about aspects of real time communication and the way real time systems are built.',
	        event_time: {
	            start_time: new Date('2016-09-10T10:00:00+05:30'),
	            end_time: new Date('2016-09-10T13:00:00+05:30'),
	        },
	        publish_time: new Date('2016-08-04T18:30:00+05:30'),
	        registration_time: {
	            start_time: new Date('2016-09-10T10:00:00+05:30'),
	            end_time: new Date('2016-09-10T13:00:00+05:30'),
	        },
	        venue: exports.CHENNAI_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Realtime Chat using Socket.io on Production',
	                abstract: 'The web has typically been a client request server protocol from the beginning of time. Websockets are starting to change that with a bi-directional data flow. This talk will explore how socket.io, a framework for websockets was used to develop a chat application that was on production.',
	                authors: [
	                    {
	                        name: 'Arvind Sridharan',
	                        image_url: 'images/speakers/arvind.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-08-04T10:00:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Real Time Communication, Fast and Slow',
	                abstract: 'Browsers and servers have always constituted a distributed system, and with the rise of (micro?)services, servers have now become distributed systems too. The fundamental need of any of these systems is to communicate effectively - we\'ll look at the various options and methods of doing just that.',
	                authors: [
	                    {
	                        name: 'Sudhir Jonathan',
	                        image_url: 'images/speakers/sudhir.png'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-08-04T11:00:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Getting started with WebRTC',
	                abstract: 'WebRTC is a framework for the web that enables Real Time Communication in the browser. Get to know about WebRTC technology & also learn how to build a webrtc application.',
	                authors: [
	                    {
	                        name: 'Vijayakumar Nagarajan',
	                        image_url: 'images/speakers/vijayakumar.png'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-08-04T12:00:00+05:30')
	                }
	            },
	        ],
	        color: '#040509',
	        image_url: 'images/events/its_real_time.jpg',
	        meetup_urlname: 'devday_chennai',
	        meetup_event_id: '232886624',
	        form: {
	            url: 'https://docs.google.com/forms/d/e/1FAIpQLSd7wUzgQ7VuP3z41GtnTemaxFzv-4K10TuBHjCZqjcI8xxDJA/formResponse',
	            name: 'entry.2092238618',
	            email: 'entry.1556369182',
	            mobile: 'entry.479301265',
	            type: 'entry.630971362',
	            title: 'entry.1832696420',
	            abstract: 'entry.354689399'
	        }
	    },
	    {
	        title: 'Math For Machine Learning',
	        url: 'math-for-machine-learning',
	        categories: ['Machine Learning'],
	        tags: ['Machine Learning', 'Math', 'Data Science'],
	        author: 'devday_team',
	        abstract: 'Learn about the basic math and algorithms required for machine learning',
	        event_time: {
	            start_time: new Date('2016-11-19T10:30:00+05:30'),
	            end_time: new Date('2016-11-19T10:00:00+05:30')
	        },
	        publish_time: new Date('2016-11-11T23:45:00+05:30'),
	        registration_time: {
	            start_time: new Date('2016-11-11T23:45:00+05:30'),
	            end_time: new Date('2016-11-19T09:45:00+05:30'),
	        },
	        venue: exports.BANGALORE_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Basic concepts of statistics and introduction to ML',
	                abstract: 'Get started with basic statistics and see them in action with real-time datasets. Discuss the basic definitions of machine learning and also about when and when not to use ML. We will be using Python notebook to demonstrate the concepts.',
	                authors: [
	                    {
	                        name: 'Deepthi Chand',
	                        image_url: '/images/speakers/deepthi.png'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-11-19T10:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Diving into machine learning with simple maths and statistics',
	                abstract: "Ever felt intimidated by the nuances and world of machine learning? Come and hear someone reason about it using rudimentary maths and concepts like Euclidean distance and Pearson's correlation score to build a super simple recommendation engine and unsupervised clusters of data. Understand how linear regression allows for predictive capabilities on datasets. Look at how to build simple classifiers using python libraries without understanding the guts of machine learning. This talk uses python for the code. Classifiers are built using the nltk library with Python.",
	                authors: [
	                    {
	                        name: 'Priyank Gupta',
	                        image_url: '/images/speakers/priyank.png'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-11-19T11:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Introduction to Linear Regression',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Shashank Teotia',
	                        image_url: '/images/speakers/shashank-teotia.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-11-19T12:30:00+05:30')
	                }
	            },
	        ],
	        color: '#211b33',
	        meetup_urlname: 'devday_bangalore',
	        meetup_event_id: '235590887',
	        form: {
	            spreadsheetId: '1xR-opuZ3sIEvjktfzpkuC60J3gJNlRExMYP74Ym4zwo',
	            sheetName: 'Form Responses 1'
	        },
	        image_url: '/images/events/hackathon.jpg',
	    },
	    {
	        title: 'DevOps for Devs',
	        url: 'devops-for-devs',
	        categories: ['events'],
	        tags: ['devops'],
	        author: 'devday_team',
	        abstract: 'In this edition of the Dev Day, we are presenting talks on Devops - "DevOps for Devs". Come join us to understand why "DevOps" is relevant today from a technology standpoint',
	        event_time: {
	            start_time: new Date('2016-10-13T18:30:00+05:30'),
	            end_time: new Date('2016-10-13T20:30:00+05:30'),
	        },
	        publish_time: new Date('2016-08-04T18:30:00+05:30'),
	        registration_time: {
	            start_time: new Date('2016-09-10T10:00:00+05:30'),
	            end_time: new Date('2016-10-13T18:30:00+05:30'),
	        },
	        venue: exports.CHENNAI_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'DevOps 101',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Srimathi Harinarayanan',
	                        image_url: 'images/speakers/srimathi.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-08-13T18:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Ephemeral Infrastructure',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Mahesh and Arther',
	                        image_url: 'images/speakers/arther.png'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-08-13T18:45:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Kubernetes in Production',
	                abstract: 'In this talk, Manoj will be talking about the Kubernetes setup at Indix which has been running for the last 10 months now. He will be going into the details of bringing up and managing a Kubernetes cluster and the features of Kubernetes that they use at Indix.',
	                authors: [
	                    {
	                        name: 'Manoj Mahalingam',
	                        image_url: '/images/speakers/manoj.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2016-08-13T19:30:00+05:30')
	                }
	            },
	        ],
	        color: '#040509',
	        image_url: '/images/events/devops-for-devs.jpeg',
	        meetup_urlname: 'devday_chennai',
	        meetup_event_id: '234495890',
	        form: {
	            spreadsheetId: '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
	            sheetName: 'Form Responses 1'
	        }
	    },
	    {
	        title: 'Hack Hack and just Hack!',
	        url: 'hack-and-just-hack',
	        categories: ['Hackathon'],
	        tags: ['IOT', 'Machine Learning', 'Data Science'],
	        author: 'devday_team',
	        abstract: "This time let's just code to make amazing products. Software/hardware and all things awesome.",
	        event_time: {
	            start_time: new Date('2016-10-15T10:00:00+05:30'),
	            end_time: new Date('2016-10-15T17:30:00+05:30')
	        },
	        publish_time: new Date('2016-10-07T23:45:00+05:30'),
	        registration_time: {
	            start_time: new Date('2016-10-07T23:45:00+05:30'),
	            end_time: new Date('2016-10-15T09:45:00+05:30'),
	        },
	        venue: exports.BANGALORE_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Hack Hack and just Hack!',
	                abstract: 'Problem Statements:-\n\r 1. Design and develop a device/wearable that has the capability to detect the direction and intensity of sound (the required hardware would be provided at the venue). \n\r 2. Classification of certain datasets using machine learning algorithms (Dataset would be provided). \n\r 3. Device a solution to predict an indoor location of a entity (hardware would be provided).',
	                time: {
	                    start_time: new Date('2016-10-15T10:00:00+05:30')
	                }
	            }
	        ],
	        color: '#211b33',
	        meetup_urlname: 'devday_bangalore',
	        meetup_event_id: '235590887',
	        form: {
	            spreadsheetId: '1xR-opuZ3sIEvjktfzpkuC60J3gJNlRExMYP74Ym4zwo',
	            sheetName: 'Form Responses 1'
	        },
	        image_url: '/images/events/hackathon.jpg',
	    },
	    {
	        title: 'Cross Platform Mobile Apps',
	        url: 'cross-platform-mobile-apps-handson',
	        categories: ['events'],
	        tags: ['cross platform', 'mobile apps', 'handson'],
	        author: 'devday_team',
	        abstract: 'Participants will form teams and pick a technology of their interest (i.e. Xamarin, Cordova, React Native) to build a cross platform mobile app. The app to be built is a todo list where users can add todo items with a photo and a location. The problem has been designed so that it can be built within a few hours.',
	        event_time: {
	            start_time: new Date('2016-11-19T10:00:00+05:30'),
	            end_time: new Date('2016-11-19T15:00:00+05:30'),
	        },
	        publish_time: new Date('2016-08-04T18:30:00+05:30'),
	        registration_time: {
	            start_time: new Date('2016-09-10T10:00:00+05:30'),
	            end_time: new Date('2016-11-19T10:00:00+05:30'),
	        },
	        venue: exports.CHENNAI_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Workshop,
	                title: 'Introduction',
	                abstract: 'A brief introduction to the event format along with a detailed explanation of the problem.',
	                time: {
	                    start_time: new Date('2016-11-19T10:00:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Workshop,
	                title: 'Team Formation',
	                abstract: 'Participants will form teams based on their interest.',
	                time: {
	                    start_time: new Date('2016-11-19T10:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Workshop,
	                title: 'Get cracking with the code',
	                abstract: 'Teams can organise their own lunch breaks during the coding time. Lunch will be provided by Sahaj.',
	                time: {
	                    start_time: new Date('2016-11-19T10:45:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Workshop,
	                title: 'Showcase and discussion',
	                abstract: 'All the apps built will be showcased. This will be followed by a discussion on pros and cons of the technologies they the individual teams would have used to solve the problem.',
	                time: {
	                    start_time: new Date('2016-11-19T14:00:00+05:30')
	                }
	            },
	        ],
	        color: '#040509',
	        image_url: 'images/events/cross_platform.jpg',
	        meetup_urlname: 'devday_chennai',
	        meetup_event_id: '235318558',
	        form: {
	            spreadsheetId: '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
	            sheetName: 'Form Responses 1'
	        }
	    },
	    {
	        title: 'Coding a Tic Tac Toe Game',
	        url: 'game-programming-101',
	        categories: ['events'],
	        tags: ['tic tac toe', 'game Programming 101'],
	        author: 'devday_team',
	        abstract: 'Ever thought playing tic-tac-toe was easy? Let’s learn to build a tic-tac-toe program that can beat us every time – on a grid of any size, not just 3x3. We will be learning about modelling a game, writing an evaluation function, and searching for the optimal move. What’s more, all that we learn can be used to program for chess! ',
	        event_time: {
	            start_time: new Date('2017-01-19T18:30:00+05:30'),
	            end_time: new Date('2017-01-19T20:30:00+05:30'),
	        },
	        publish_time: new Date('2017-01-02T18:30:00+05:30'),
	        registration_time: {
	            start_time: new Date('2017-01-02T18:30:00+05:30'),
	            end_time: new Date('2017-01-19T18:30:00+05:30'),
	        },
	        venue: exports.CHENNAI_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Writing a tic-tac-toe program that can beat you every time',
	                abstract: '',
	                authors: [
	                    {
	                        name: 'Sudarsan Balaji',
	                        image_url: 'images/speakers/sudarsan.png'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2017-01-19T18:00:00+05:30')
	                }
	            },
	        ],
	        color: '#040509',
	        image_url: '',
	        meetup_urlname: 'devday_chennai',
	        meetup_event_id: '236605725',
	        form: {
	            spreadsheetId: '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
	            sheetName: 'Form Responses 1'
	        }
	    }, {
	        title: 'First Dive into Deep Learning',
	        url: 'first-dive-deep-learning',
	        categories: ['events'],
	        tags: ['deep learning', 'data science'],
	        author: 'devday_team',
	        abstract: 'This time lets discuss basic concepts of Deep Learning and gets our hands dirty by solving a problem using the very basics we discussed.',
	        event_time: {
	            start_time: new Date('2016-12-10T11:00:00+05:30'),
	            end_time: new Date('2016-12-10T16:00:00+05:30'),
	        },
	        publish_time: new Date('2016-12-02T18:30:00+05:30'),
	        registration_time: {
	            start_time: new Date('2016-12-02T10:30:00+05:30'),
	            end_time: new Date('2016-12-10T18:30:00+05:30'),
	        },
	        venue: exports.BANGALORE_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Introduction to Deep learning ',
	                abstract: '',
	                authors: [],
	                time: {
	                    start_time: new Date('2016-12-10T11:00:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Basic concepts of Deep Learning',
	                abstract: '',
	                authors: [],
	                time: {
	                    start_time: new Date('2016-12-10T12:00:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Break,
	                time: {
	                    start_time: new Date('2016-02-10T13:00:00+05:30')
	                },
	                title: 'Lunch and Networking'
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Hands - on Deep Learning',
	                abstract: '',
	                authors: [],
	                time: {
	                    start_time: new Date('2016-12-10T14:00:00+05:30')
	                }
	            }
	        ],
	        color: '#211b33',
	        meetup_urlname: 'devday_bangalore',
	        meetup_event_id: '235960569',
	        form: {
	            spreadsheetId: '1xR-opuZ3sIEvjktfzpkuC60J3gJNlRExMYP74Ym4zwo',
	            sheetName: 'Form Responses 1'
	        },
	        image_url: '',
	    },
	    {
	        title: 'Know NoSQL',
	        url: 'know-nosql',
	        categories: ['events'],
	        tags: ['NoSQL', 'CouchDB'],
	        author: 'devday_team',
	        abstract: 'In this edition of DevDay we will start with an introduction to NoSQL and the various types of NoSQL stores followed by a talk on how CouchDB was used in production',
	        event_time: {
	            start_time: new Date('2017-02-16T18:30:00+05:30'),
	            end_time: new Date('2017-02-16T20:30:00+05:30'),
	        },
	        publish_time: new Date('2017-01-02T18:30:00+05:30'),
	        registration_time: {
	            start_time: new Date('2017-01-02T18:30:00+05:30'),
	            end_time: new Date('2017-02-16T18:30:00+05:30'),
	        },
	        venue: exports.CHENNAI_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'NoSQL 101',
	                abstract: 'We start the devday by exploring different types of NoSQL databases and discuss scenarios where each type of NoSQL store are typically used.',
	                authors: [
	                    {
	                        name: 'Ramanathan',
	                        image_url: '/images/speakers/ramanathan.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2017-01-19T18:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'A deep dive into CouchDB',
	                abstract: 'In this talk we will discuss how various features of CouchDB (i.e. MapReduce, indices, sorting) were used in production in context of the CAP theorem.',
	                authors: [
	                    {
	                        name: 'Raj Bharath',
	                        image_url: '/images/speakers/raj.png'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2017-01-19T19:30:00+05:30')
	                }
	            },
	        ],
	        color: '#040509',
	        image_url: '',
	        meetup_urlname: 'devday_chennai',
	        meetup_event_id: '237520259',
	        form: {
	            spreadsheetId: '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
	            sheetName: 'Form Responses 1'
	        }
	    },
	    {
	        title: 'Microservice Architectures - How To?',
	        url: 'microservice-architectue',
	        categories: ['events'],
	        tags: ['microservice', 'distributed', 'microservice architecture'],
	        author: 'devday_team',
	        abstract: 'This time we are talking about the implementation of Microservice Architectures. Scaling, distribution, inter service communication and so on..',
	        event_time: {
	            start_time: new Date('2017-02-16T17:30:00+05:30'),
	            end_time: new Date('2017-02-16T19:30:00+05:30'),
	        },
	        publish_time: new Date('2017-02-09T18:30:00+05:30'),
	        registration_time: {
	            start_time: new Date('2017-02-09T18:30:00+05:30'),
	            end_time: new Date('2017-02-16T17:30:00+05:30'),
	        },
	        venue: exports.BANGALORE_ADDRESS,
	        agenda: [
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Microservices - Check List',
	                abstract: 'Kickoff with nuts and bolts needed for implementing microservice.',
	                authors: [
	                    {
	                        name: 'Navaneeth K N',
	                        image_url: '/images/speakers/navneeth.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2017-01-19T17:30:00+05:30')
	                }
	            },
	            {
	                type: definitions_1.AgendaEntryType.Talk,
	                title: 'Monolith to Microservice - A case study.',
	                abstract: 'This session takes you to a case study about trasnforming a giant monolith application to a distributed microservice application.',
	                authors: [
	                    {
	                        name: 'Thirunavukkarasu',
	                        image_url: '/images/speakers/thiru.jpg'
	                    }
	                ],
	                time: {
	                    start_time: new Date('2017-01-19T18:30:00+05:30')
	                }
	            },
	        ],
	        color: '#040509',
	        image_url: '/images/events/hackathon.jpg',
	        meetup_urlname: 'devday_bangalore',
	        meetup_event_id: '237578088',
	        form: {
	            spreadsheetId: '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
	            sheetName: 'Form Responses 1'
	        }
	    }
	];
	exports.default = exports.events;


/***/ },
/* 116 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var AgendaEntryType;
	(function (AgendaEntryType) {
	    AgendaEntryType[AgendaEntryType["Talk"] = 0] = "Talk";
	    AgendaEntryType[AgendaEntryType["Break"] = 1] = "Break";
	    AgendaEntryType[AgendaEntryType["Workshop"] = 2] = "Workshop";
	    AgendaEntryType[AgendaEntryType["Hackathon"] = 3] = "Hackathon";
	})(AgendaEntryType = exports.AgendaEntryType || (exports.AgendaEntryType = {}));


/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var xstream_1 = __webpack_require__(12);
	var http_1 = __webpack_require__(118);
	var flattenConcurrently_1 = __webpack_require__(130);
	var MEETUP_EVENT_URL = '/attendees/:eventUrl?meetup_url=:urlname&meetup_event_id=:id&spreadsheetData=:spreadsheetData';
	var MeetupsSource = (function () {
	    function MeetupsSource(meetupRequest$) {
	        var request$ = meetupRequest$
	            .debug()
	            .map(function (event) {
	            var requestOptions = {
	                url: MEETUP_EVENT_URL
	                    .replace(':urlname', event.meetup_urlname)
	                    .replace(':id', event.meetup_event_id)
	                    .replace(':eventUrl', event.url)
	                    .replace(':spreadsheetData', JSON.stringify(event.form)),
	                category: 'meetups',
	                lazy: true
	            };
	            return requestOptions;
	        });
	        var http = http_1.makeHTTPDriver()(request$, 'meetupsHttp');
	        var response$$ = http.select('meetups');
	        this.event$ =
	            response$$
	                .map(function (response$) { return response$.replaceError(function () {
	                return xstream_1.default.of({ body: { 'event_url': undefined, 'yes_rsvp_count': 0 } });
	            }); })
	                .compose(flattenConcurrently_1.default)
	                .map(function (response) {
	                return {
	                    event_url: response.body['event_url'],
	                    yes_rsvp_count: response.body['yes_rsvp_count']
	                };
	            });
	    }
	    return MeetupsSource;
	}());
	exports.MeetupsSource = MeetupsSource;
	function makeMeetupsDriver() {
	    function meetupsDriver(meetupRequest$) {
	        return new MeetupsSource(meetupRequest$);
	    }
	    return meetupsDriver;
	}
	exports.makeMeetupsDriver = makeMeetupsDriver;


/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/**
	 * HTTP Driver factory.
	 *
	 * This is a function which, when called, returns a HTTP Driver for Cycle.js
	 * apps. The driver is also a function, and it takes a stream of requests as
	 * input, and outputs an HTTP Source, an object with some functions to query for
	 * response streams.
	 *
	 * **Requests**. The stream of requests should emit either strings or objects.
	 * If the stream emits strings, those should be the URL of the remote resource
	 * over HTTP. If the stream emits objects, these should be instructions how
	 * superagent should execute the request. These objects follow a structure
	 * similar to superagent's request API itself. `request` object properties:
	 *
	 * - `url` *(String)*: the remote resource path. **required**
	 * - `method` *(String)*: HTTP Method for the request (GET, POST, PUT, etc).
	 * - `category` *(String)*: an optional and arbitrary key that may be used in
	 * the HTTP Source when querying for the response. E.g.
	 * `sources.http.select(category)`
	 * - `query` *(Object)*: an object with the payload for `GET` or `POST`.
	 * - `send` *(Object)*: an object with the payload for `POST`.
	 * - `headers` *(Object)*: object specifying HTTP headers.
	 * - `accept` *(String)*: the Accept header.
	 * - `type` *(String)*: a short-hand for setting Content-Type.
	 * - `user` *(String)*: username for authentication.
	 * - `password` *(String)*: password for authentication.
	 * - `field` *(Object)*: object where key/values are Form fields.
	 * - `progress` *(Boolean)*: whether or not to detect and emit progress events
	 * on the response Observable.
	 * - `attach` *(Array)*: array of objects, where each object specifies `name`,
	 * `path`, and `filename` of a resource to upload.
	 * - `withCredentials` *(Boolean)*: enables the ability to send cookies from the
	 * origin.
	 * - `agent` *(Object)*: an object specifying `cert` and `key` for SSL
	 * certificate authentication.
	 * - `redirects` *(Number)*: number of redirects to follow.
	 * - `lazy` *(Boolean)*: whether or not this request runs lazily, which means
	 * the request happens if and only if its corresponding response stream from the
	 * HTTP Source is subscribed to. By default this value is false: requests run
	 * eagerly, even if their response is ignored by the application.
	 *
	 * **Responses**. A metastream is a stream that emits streams. The HTTP Source
	 * manages response metastreams. These streams of responses have a `request`
	 * field attached to them (to the stream object itself) indicating which request
	 * (from the driver input) generated this response streams. The HTTP Source has
	 * functions `filter()` and `select()`, but is not itself a stream. So you can
	 * call `sources.HTTP.filter(request => request.url === X)` to get a new HTTP
	 * Source object which is filtered for response streams that match the condition
	 * given, and may call `sources.HTTP.select(category)` to get a metastream of
	 * response that match the category key. With an HTTP Source, you can also call
	 * `httpSource.select()` with no param to get the metastream. You should flatten
	 * the metastream before consuming it, then the resulting response stream will
	 * emit the response object received through superagent.
	 *
	 * @return {Function} the HTTP Driver function
	 * @function makeHTTPDriver
	 */
	var http_driver_1 = __webpack_require__(119);
	exports.makeHTTPDriver = http_driver_1.makeHTTPDriver;
	//# sourceMappingURL=index.js.map

/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xstream_1 = __webpack_require__(12);
	var adapt_1 = __webpack_require__(7);
	var MainHTTPSource_1 = __webpack_require__(120);
	var superagent = __webpack_require__(122);
	function preprocessReqOptions(reqOptions) {
	    reqOptions.withCredentials = reqOptions.withCredentials || false;
	    reqOptions.redirects = typeof reqOptions.redirects === 'number' ? reqOptions.redirects : 5;
	    reqOptions.method = reqOptions.method || "get";
	    return reqOptions;
	}
	function optionsToSuperagent(rawReqOptions) {
	    var reqOptions = preprocessReqOptions(rawReqOptions);
	    if (typeof reqOptions.url !== "string") {
	        throw new Error("Please provide a `url` property in the request options.");
	    }
	    var lowerCaseMethod = (reqOptions.method || 'GET').toLowerCase();
	    var sanitizedMethod = lowerCaseMethod === "delete" ? "del" : lowerCaseMethod;
	    var request = superagent[sanitizedMethod](reqOptions.url);
	    if (typeof request.redirects === "function") {
	        request = request.redirects(reqOptions.redirects);
	    }
	    if (reqOptions.type) {
	        request = request.type(reqOptions.type);
	    }
	    if (reqOptions.send) {
	        request = request.send(reqOptions.send);
	    }
	    if (reqOptions.accept) {
	        request = request.accept(reqOptions.accept);
	    }
	    if (reqOptions.query) {
	        request = request.query(reqOptions.query);
	    }
	    if (reqOptions.withCredentials) {
	        request = request.withCredentials();
	    }
	    if (reqOptions.agent) {
	        request = request.key(reqOptions.agent.key);
	        request = request.cert(reqOptions.agent.cert);
	    }
	    if (typeof reqOptions.user === 'string' && typeof reqOptions.password === 'string') {
	        request = request.auth(reqOptions.user, reqOptions.password);
	    }
	    if (reqOptions.headers) {
	        for (var key in reqOptions.headers) {
	            if (reqOptions.headers.hasOwnProperty(key)) {
	                request = request.set(key, reqOptions.headers[key]);
	            }
	        }
	    }
	    if (reqOptions.field) {
	        for (var key in reqOptions.field) {
	            if (reqOptions.field.hasOwnProperty(key)) {
	                request = request.field(key, reqOptions.field[key]);
	            }
	        }
	    }
	    if (reqOptions.attach) {
	        for (var i = reqOptions.attach.length - 1; i >= 0; i--) {
	            var a = reqOptions.attach[i];
	            request = request.attach(a.name, a.path, a.filename);
	        }
	    }
	    return request;
	}
	exports.optionsToSuperagent = optionsToSuperagent;
	function createResponse$(reqInput) {
	    return xstream_1.default.create({
	        start: function startResponseStream(listener) {
	            try {
	                var reqOptions_1 = normalizeRequestInput(reqInput);
	                this.request = optionsToSuperagent(reqOptions_1);
	                if (reqOptions_1.progress) {
	                    this.request = this.request.on('progress', function (res) {
	                        res.request = reqOptions_1;
	                        listener.next(res);
	                    });
	                }
	                this.request.end(function (err, res) {
	                    if (err) {
	                        err.response.request = reqOptions_1;
	                        listener.error(err);
	                    }
	                    else {
	                        res.request = reqOptions_1;
	                        listener.next(res);
	                        listener.complete();
	                    }
	                });
	            }
	            catch (err) {
	                listener.error(err);
	            }
	        },
	        stop: function stopResponseStream() {
	            if (this.request && this.request.abort) {
	                this.request.abort();
	            }
	        },
	    });
	}
	exports.createResponse$ = createResponse$;
	function softNormalizeRequestInput(reqInput) {
	    var reqOptions;
	    try {
	        reqOptions = normalizeRequestInput(reqInput);
	    }
	    catch (err) {
	        reqOptions = { url: 'Error', _error: err };
	    }
	    return reqOptions;
	}
	function normalizeRequestInput(reqInput) {
	    if (typeof reqInput === 'string') {
	        return { url: reqInput };
	    }
	    else if (typeof reqInput === 'object') {
	        return reqInput;
	    }
	    else {
	        throw new Error("Observable of requests given to HTTP Driver must emit " +
	            "either URL strings or objects with parameters.");
	    }
	}
	function requestInputToResponse$(reqInput) {
	    var response$ = createResponse$(reqInput).remember();
	    var reqOptions = softNormalizeRequestInput(reqInput);
	    if (!reqOptions.lazy) {
	        response$.addListener({ next: function () { }, error: function () { }, complete: function () { } });
	    }
	    response$ = adapt_1.adapt(response$);
	    Object.defineProperty(response$, 'request', {
	        value: reqOptions,
	        writable: false,
	    });
	    return response$;
	}
	;
	function makeHTTPDriver() {
	    function httpDriver(request$, name) {
	        var response$$ = request$
	            .map(requestInputToResponse$);
	        var httpSource = new MainHTTPSource_1.MainHTTPSource(response$$, name, []);
	        response$$.addListener({ next: function () { }, error: function () { }, complete: function () { } });
	        return httpSource;
	    }
	    return httpDriver;
	}
	exports.makeHTTPDriver = makeHTTPDriver;
	//# sourceMappingURL=http-driver.js.map

/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var isolate_1 = __webpack_require__(121);
	var adapt_1 = __webpack_require__(7);
	var MainHTTPSource = (function () {
	    function MainHTTPSource(_res$$, _name, _namespace) {
	        if (_namespace === void 0) { _namespace = []; }
	        this._res$$ = _res$$;
	        this._name = _name;
	        this._namespace = _namespace;
	        this.isolateSource = isolate_1.isolateSource;
	        this.isolateSink = isolate_1.isolateSink;
	    }
	    MainHTTPSource.prototype.filter = function (predicate) {
	        var filteredResponse$$ = this._res$$.filter(function (r$) { return predicate(r$.request); });
	        return new MainHTTPSource(filteredResponse$$, this._name, this._namespace);
	    };
	    MainHTTPSource.prototype.select = function (category) {
	        var res$$ = category ?
	            this._res$$.filter(function (res$) { return res$.request && res$.request.category === category; }) :
	            this._res$$;
	        var out = adapt_1.adapt(res$$);
	        out._isCycleSource = this._name;
	        return out;
	    };
	    return MainHTTPSource;
	}());
	exports.MainHTTPSource = MainHTTPSource;
	//# sourceMappingURL=MainHTTPSource.js.map

/***/ },
/* 121 */
/***/ function(module, exports) {

	"use strict";
	function isolateSource(httpSource, scope) {
	    return httpSource.filter(function (request) {
	        return Array.isArray(request._namespace) &&
	            request._namespace.indexOf(scope) !== -1;
	    });
	}
	exports.isolateSource = isolateSource;
	function isolateSink(request$, scope) {
	    return request$.map(function (req) {
	        if (typeof req === 'string') {
	            return { url: req, _namespace: [scope] };
	        }
	        req._namespace = req._namespace || [];
	        req._namespace.push(scope);
	        return req;
	    });
	}
	exports.isolateSink = isolateSink;
	//# sourceMappingURL=isolate.js.map

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Root reference for iframes.
	 */
	
	var root;
	if (typeof window !== 'undefined') { // Browser window
	  root = window;
	} else if (typeof self !== 'undefined') { // Web Worker
	  root = self;
	} else { // Other environments
	  console.warn("Using browser-only version of superagent in non-browser environment");
	  root = this;
	}
	
	var Emitter = __webpack_require__(123);
	var RequestBase = __webpack_require__(124);
	var isObject = __webpack_require__(125);
	var isFunction = __webpack_require__(126);
	var ResponseBase = __webpack_require__(127);
	var shouldRetry = __webpack_require__(129);
	
	/**
	 * Noop.
	 */
	
	function noop(){};
	
	/**
	 * Expose `request`.
	 */
	
	var request = exports = module.exports = function(method, url) {
	  // callback
	  if ('function' == typeof url) {
	    return new exports.Request('GET', method).end(url);
	  }
	
	  // url first
	  if (1 == arguments.length) {
	    return new exports.Request('GET', method);
	  }
	
	  return new exports.Request(method, url);
	}
	
	exports.Request = Request;
	
	/**
	 * Determine XHR.
	 */
	
	request.getXHR = function () {
	  if (root.XMLHttpRequest
	      && (!root.location || 'file:' != root.location.protocol
	          || !root.ActiveXObject)) {
	    return new XMLHttpRequest;
	  } else {
	    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
	  }
	  throw Error("Browser-only verison of superagent could not find XHR");
	};
	
	/**
	 * Removes leading and trailing whitespace, added to support IE.
	 *
	 * @param {String} s
	 * @return {String}
	 * @api private
	 */
	
	var trim = ''.trim
	  ? function(s) { return s.trim(); }
	  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };
	
	/**
	 * Serialize the given `obj`.
	 *
	 * @param {Object} obj
	 * @return {String}
	 * @api private
	 */
	
	function serialize(obj) {
	  if (!isObject(obj)) return obj;
	  var pairs = [];
	  for (var key in obj) {
	    pushEncodedKeyValuePair(pairs, key, obj[key]);
	  }
	  return pairs.join('&');
	}
	
	/**
	 * Helps 'serialize' with serializing arrays.
	 * Mutates the pairs array.
	 *
	 * @param {Array} pairs
	 * @param {String} key
	 * @param {Mixed} val
	 */
	
	function pushEncodedKeyValuePair(pairs, key, val) {
	  if (val != null) {
	    if (Array.isArray(val)) {
	      val.forEach(function(v) {
	        pushEncodedKeyValuePair(pairs, key, v);
	      });
	    } else if (isObject(val)) {
	      for(var subkey in val) {
	        pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
	      }
	    } else {
	      pairs.push(encodeURIComponent(key)
	        + '=' + encodeURIComponent(val));
	    }
	  } else if (val === null) {
	    pairs.push(encodeURIComponent(key));
	  }
	}
	
	/**
	 * Expose serialization method.
	 */
	
	 request.serializeObject = serialize;
	
	 /**
	  * Parse the given x-www-form-urlencoded `str`.
	  *
	  * @param {String} str
	  * @return {Object}
	  * @api private
	  */
	
	function parseString(str) {
	  var obj = {};
	  var pairs = str.split('&');
	  var pair;
	  var pos;
	
	  for (var i = 0, len = pairs.length; i < len; ++i) {
	    pair = pairs[i];
	    pos = pair.indexOf('=');
	    if (pos == -1) {
	      obj[decodeURIComponent(pair)] = '';
	    } else {
	      obj[decodeURIComponent(pair.slice(0, pos))] =
	        decodeURIComponent(pair.slice(pos + 1));
	    }
	  }
	
	  return obj;
	}
	
	/**
	 * Expose parser.
	 */
	
	request.parseString = parseString;
	
	/**
	 * Default MIME type map.
	 *
	 *     superagent.types.xml = 'application/xml';
	 *
	 */
	
	request.types = {
	  html: 'text/html',
	  json: 'application/json',
	  xml: 'application/xml',
	  urlencoded: 'application/x-www-form-urlencoded',
	  'form': 'application/x-www-form-urlencoded',
	  'form-data': 'application/x-www-form-urlencoded'
	};
	
	/**
	 * Default serialization map.
	 *
	 *     superagent.serialize['application/xml'] = function(obj){
	 *       return 'generated xml here';
	 *     };
	 *
	 */
	
	 request.serialize = {
	   'application/x-www-form-urlencoded': serialize,
	   'application/json': JSON.stringify
	 };
	
	 /**
	  * Default parsers.
	  *
	  *     superagent.parse['application/xml'] = function(str){
	  *       return { object parsed from str };
	  *     };
	  *
	  */
	
	request.parse = {
	  'application/x-www-form-urlencoded': parseString,
	  'application/json': JSON.parse
	};
	
	/**
	 * Parse the given header `str` into
	 * an object containing the mapped fields.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */
	
	function parseHeader(str) {
	  var lines = str.split(/\r?\n/);
	  var fields = {};
	  var index;
	  var line;
	  var field;
	  var val;
	
	  lines.pop(); // trailing CRLF
	
	  for (var i = 0, len = lines.length; i < len; ++i) {
	    line = lines[i];
	    index = line.indexOf(':');
	    field = line.slice(0, index).toLowerCase();
	    val = trim(line.slice(index + 1));
	    fields[field] = val;
	  }
	
	  return fields;
	}
	
	/**
	 * Check if `mime` is json or has +json structured syntax suffix.
	 *
	 * @param {String} mime
	 * @return {Boolean}
	 * @api private
	 */
	
	function isJSON(mime) {
	  return /[\/+]json\b/.test(mime);
	}
	
	/**
	 * Initialize a new `Response` with the given `xhr`.
	 *
	 *  - set flags (.ok, .error, etc)
	 *  - parse header
	 *
	 * Examples:
	 *
	 *  Aliasing `superagent` as `request` is nice:
	 *
	 *      request = superagent;
	 *
	 *  We can use the promise-like API, or pass callbacks:
	 *
	 *      request.get('/').end(function(res){});
	 *      request.get('/', function(res){});
	 *
	 *  Sending data can be chained:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' })
	 *        .end(function(res){});
	 *
	 *  Or passed to `.send()`:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' }, function(res){});
	 *
	 *  Or passed to `.post()`:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' })
	 *        .end(function(res){});
	 *
	 * Or further reduced to a single call for simple cases:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' }, function(res){});
	 *
	 * @param {XMLHTTPRequest} xhr
	 * @param {Object} options
	 * @api private
	 */
	
	function Response(req) {
	  this.req = req;
	  this.xhr = this.req.xhr;
	  // responseText is accessible only if responseType is '' or 'text' and on older browsers
	  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
	     ? this.xhr.responseText
	     : null;
	  this.statusText = this.req.xhr.statusText;
	  var status = this.xhr.status;
	  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
	  if (status === 1223) {
	      status = 204;
	  }
	  this._setStatusProperties(status);
	  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
	  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
	  // getResponseHeader still works. so we get content-type even if getting
	  // other headers fails.
	  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
	  this._setHeaderProperties(this.header);
	
	  if (null === this.text && req._responseType) {
	    this.body = this.xhr.response;
	  } else {
	    this.body = this.req.method != 'HEAD'
	      ? this._parseBody(this.text ? this.text : this.xhr.response)
	      : null;
	  }
	}
	
	ResponseBase(Response.prototype);
	
	/**
	 * Parse the given body `str`.
	 *
	 * Used for auto-parsing of bodies. Parsers
	 * are defined on the `superagent.parse` object.
	 *
	 * @param {String} str
	 * @return {Mixed}
	 * @api private
	 */
	
	Response.prototype._parseBody = function(str){
	  var parse = request.parse[this.type];
	  if(this.req._parser) {
	    return this.req._parser(this, str);
	  }
	  if (!parse && isJSON(this.type)) {
	    parse = request.parse['application/json'];
	  }
	  return parse && str && (str.length || str instanceof Object)
	    ? parse(str)
	    : null;
	};
	
	/**
	 * Return an `Error` representative of this response.
	 *
	 * @return {Error}
	 * @api public
	 */
	
	Response.prototype.toError = function(){
	  var req = this.req;
	  var method = req.method;
	  var url = req.url;
	
	  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
	  var err = new Error(msg);
	  err.status = this.status;
	  err.method = method;
	  err.url = url;
	
	  return err;
	};
	
	/**
	 * Expose `Response`.
	 */
	
	request.Response = Response;
	
	/**
	 * Initialize a new `Request` with the given `method` and `url`.
	 *
	 * @param {String} method
	 * @param {String} url
	 * @api public
	 */
	
	function Request(method, url) {
	  var self = this;
	  this._query = this._query || [];
	  this.method = method;
	  this.url = url;
	  this.header = {}; // preserves header name case
	  this._header = {}; // coerces header names to lowercase
	  this.on('end', function(){
	    var err = null;
	    var res = null;
	
	    try {
	      res = new Response(self);
	    } catch(e) {
	      err = new Error('Parser is unable to parse the response');
	      err.parse = true;
	      err.original = e;
	      // issue #675: return the raw response if the response parsing fails
	      if (self.xhr) {
	        // ie9 doesn't have 'response' property
	        err.rawResponse = typeof self.xhr.responseType == 'undefined' ? self.xhr.responseText : self.xhr.response;
	        // issue #876: return the http status code if the response parsing fails
	        err.status = self.xhr.status ? self.xhr.status : null;
	        err.statusCode = err.status; // backwards-compat only
	      } else {
	        err.rawResponse = null;
	        err.status = null;
	      }
	
	      return self.callback(err);
	    }
	
	    self.emit('response', res);
	
	    var new_err;
	    try {
	      if (!self._isResponseOK(res)) {
	        new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
	        new_err.original = err;
	        new_err.response = res;
	        new_err.status = res.status;
	      }
	    } catch(e) {
	      new_err = e; // #985 touching res may cause INVALID_STATE_ERR on old Android
	    }
	
	    // #1000 don't catch errors from the callback to avoid double calling it
	    if (new_err) {
	      self.callback(new_err, res);
	    } else {
	      self.callback(null, res);
	    }
	  });
	}
	
	/**
	 * Mixin `Emitter` and `RequestBase`.
	 */
	
	Emitter(Request.prototype);
	RequestBase(Request.prototype);
	
	/**
	 * Set Content-Type to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.xml = 'application/xml';
	 *
	 *      request.post('/')
	 *        .type('xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 *      request.post('/')
	 *        .type('application/xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 * @param {String} type
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.type = function(type){
	  this.set('Content-Type', request.types[type] || type);
	  return this;
	};
	
	/**
	 * Set Accept to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.json = 'application/json';
	 *
	 *      request.get('/agent')
	 *        .accept('json')
	 *        .end(callback);
	 *
	 *      request.get('/agent')
	 *        .accept('application/json')
	 *        .end(callback);
	 *
	 * @param {String} accept
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.accept = function(type){
	  this.set('Accept', request.types[type] || type);
	  return this;
	};
	
	/**
	 * Set Authorization field value with `user` and `pass`.
	 *
	 * @param {String} user
	 * @param {String} pass
	 * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.auth = function(user, pass, options){
	  if (!options) {
	    options = {
	      type: 'function' === typeof btoa ? 'basic' : 'auto',
	    }
	  }
	
	  switch (options.type) {
	    case 'basic':
	      this.set('Authorization', 'Basic ' + btoa(user + ':' + pass));
	    break;
	
	    case 'auto':
	      this.username = user;
	      this.password = pass;
	    break;
	  }
	  return this;
	};
	
	/**
	 * Add query-string `val`.
	 *
	 * Examples:
	 *
	 *   request.get('/shoes')
	 *     .query('size=10')
	 *     .query({ color: 'blue' })
	 *
	 * @param {Object|String} val
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.query = function(val){
	  if ('string' != typeof val) val = serialize(val);
	  if (val) this._query.push(val);
	  return this;
	};
	
	/**
	 * Queue the given `file` as an attachment to the specified `field`,
	 * with optional `options` (or filename).
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} field
	 * @param {Blob|File} file
	 * @param {String|Object} options
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.attach = function(field, file, options){
	  if (this._data) {
	    throw Error("superagent can't mix .send() and .attach()");
	  }
	
	  this._getFormData().append(field, file, options || file.name);
	  return this;
	};
	
	Request.prototype._getFormData = function(){
	  if (!this._formData) {
	    this._formData = new root.FormData();
	  }
	  return this._formData;
	};
	
	/**
	 * Invoke the callback with `err` and `res`
	 * and handle arity check.
	 *
	 * @param {Error} err
	 * @param {Response} res
	 * @api private
	 */
	
	Request.prototype.callback = function(err, res){
	  // console.log(this._retries, this._maxRetries)
	  if (this._maxRetries && this._retries++ < this._maxRetries && shouldRetry(err, res)) {
	    return this._retry();
	  }
	
	  var fn = this._callback;
	  this.clearTimeout();
	
	  if (err) {
	    if (this._maxRetries) err.retries = this._retries - 1;
	    this.emit('error', err);
	  }
	
	  fn(err, res);
	};
	
	/**
	 * Invoke callback with x-domain error.
	 *
	 * @api private
	 */
	
	Request.prototype.crossDomainError = function(){
	  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
	  err.crossDomain = true;
	
	  err.status = this.status;
	  err.method = this.method;
	  err.url = this.url;
	
	  this.callback(err);
	};
	
	// This only warns, because the request is still likely to work
	Request.prototype.buffer = Request.prototype.ca = Request.prototype.agent = function(){
	  console.warn("This is not supported in browser version of superagent");
	  return this;
	};
	
	// This throws, because it can't send/receive data as expected
	Request.prototype.pipe = Request.prototype.write = function(){
	  throw Error("Streaming is not supported in browser version of superagent");
	};
	
	/**
	 * Compose querystring to append to req.url
	 *
	 * @api private
	 */
	
	Request.prototype._appendQueryString = function(){
	  var query = this._query.join('&');
	  if (query) {
	    this.url += (this.url.indexOf('?') >= 0 ? '&' : '?') + query;
	  }
	
	  if (this._sort) {
	    var index = this.url.indexOf('?');
	    if (index >= 0) {
	      var queryArr = this.url.substring(index + 1).split('&');
	      if (isFunction(this._sort)) {
	        queryArr.sort(this._sort);
	      } else {
	        queryArr.sort();
	      }
	      this.url = this.url.substring(0, index) + '?' + queryArr.join('&');
	    }
	  }
	};
	
	/**
	 * Check if `obj` is a host object,
	 * we don't want to serialize these :)
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */
	Request.prototype._isHost = function _isHost(obj) {
	  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
	  return obj && 'object' === typeof obj && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
	}
	
	/**
	 * Initiate request, invoking callback `fn(res)`
	 * with an instanceof `Response`.
	 *
	 * @param {Function} fn
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.end = function(fn){
	  if (this._endCalled) {
	    console.warn("Warning: .end() was called twice. This is not supported in superagent");
	  }
	  this._endCalled = true;
	
	  // store callback
	  this._callback = fn || noop;
	
	  // querystring
	  this._appendQueryString();
	
	  return this._end();
	};
	
	Request.prototype._end = function() {
	  var self = this;
	  var xhr = this.xhr = request.getXHR();
	  var data = this._formData || this._data;
	
	  this._setTimeouts();
	
	  // state change
	  xhr.onreadystatechange = function(){
	    var readyState = xhr.readyState;
	    if (readyState >= 2 && self._responseTimeoutTimer) {
	      clearTimeout(self._responseTimeoutTimer);
	    }
	    if (4 != readyState) {
	      return;
	    }
	
	    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
	    // result in the error "Could not complete the operation due to error c00c023f"
	    var status;
	    try { status = xhr.status } catch(e) { status = 0; }
	
	    if (!status) {
	      if (self.timedout || self._aborted) return;
	      return self.crossDomainError();
	    }
	    self.emit('end');
	  };
	
	  // progress
	  var handleProgress = function(direction, e) {
	    if (e.total > 0) {
	      e.percent = e.loaded / e.total * 100;
	    }
	    e.direction = direction;
	    self.emit('progress', e);
	  }
	  if (this.hasListeners('progress')) {
	    try {
	      xhr.onprogress = handleProgress.bind(null, 'download');
	      if (xhr.upload) {
	        xhr.upload.onprogress = handleProgress.bind(null, 'upload');
	      }
	    } catch(e) {
	      // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
	      // Reported here:
	      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
	    }
	  }
	
	  // initiate request
	  try {
	    if (this.username && this.password) {
	      xhr.open(this.method, this.url, true, this.username, this.password);
	    } else {
	      xhr.open(this.method, this.url, true);
	    }
	  } catch (err) {
	    // see #1149
	    return this.callback(err);
	  }
	
	  // CORS
	  if (this._withCredentials) xhr.withCredentials = true;
	
	  // body
	  if (!this._formData && 'GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
	    // serialize stuff
	    var contentType = this._header['content-type'];
	    var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
	    if (!serialize && isJSON(contentType)) {
	      serialize = request.serialize['application/json'];
	    }
	    if (serialize) data = serialize(data);
	  }
	
	  // set header fields
	  for (var field in this.header) {
	    if (null == this.header[field]) continue;
	    xhr.setRequestHeader(field, this.header[field]);
	  }
	
	  if (this._responseType) {
	    xhr.responseType = this._responseType;
	  }
	
	  // send stuff
	  this.emit('request', this);
	
	  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
	  // We need null here if data is undefined
	  xhr.send(typeof data !== 'undefined' ? data : null);
	  return this;
	};
	
	/**
	 * GET `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.get = function(url, data, fn){
	  var req = request('GET', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.query(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * HEAD `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.head = function(url, data, fn){
	  var req = request('HEAD', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * OPTIONS query to `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.options = function(url, data, fn){
	  var req = request('OPTIONS', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * DELETE `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} [data]
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	function del(url, data, fn){
	  var req = request('DELETE', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	request['del'] = del;
	request['delete'] = del;
	
	/**
	 * PATCH `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} [data]
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.patch = function(url, data, fn){
	  var req = request('PATCH', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * POST `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} [data]
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.post = function(url, data, fn){
	  var req = request('POST', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * PUT `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.put = function(url, data, fn){
	  var req = request('PUT', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};


/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Expose `Emitter`.
	 */
	
	if (true) {
	  module.exports = Emitter;
	}
	
	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */
	
	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};
	
	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
	    .push(fn);
	  return this;
	};
	
	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.once = function(event, fn){
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }
	
	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};
	
	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	
	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }
	
	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;
	
	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }
	
	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};
	
	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */
	
	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks['$' + event];
	
	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */
	
	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};
	
	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */
	
	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module of mixed-in functions shared between node and client code
	 */
	var isObject = __webpack_require__(125);
	
	/**
	 * Expose `RequestBase`.
	 */
	
	module.exports = RequestBase;
	
	/**
	 * Initialize a new `RequestBase`.
	 *
	 * @api public
	 */
	
	function RequestBase(obj) {
	  if (obj) return mixin(obj);
	}
	
	/**
	 * Mixin the prototype properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in RequestBase.prototype) {
	    obj[key] = RequestBase.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Clear previous timeout.
	 *
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.clearTimeout = function _clearTimeout(){
	  clearTimeout(this._timer);
	  clearTimeout(this._responseTimeoutTimer);
	  delete this._timer;
	  delete this._responseTimeoutTimer;
	  return this;
	};
	
	/**
	 * Override default response body parser
	 *
	 * This function will be called to convert incoming data into request.body
	 *
	 * @param {Function}
	 * @api public
	 */
	
	RequestBase.prototype.parse = function parse(fn){
	  this._parser = fn;
	  return this;
	};
	
	/**
	 * Set format of binary response body.
	 * In browser valid formats are 'blob' and 'arraybuffer',
	 * which return Blob and ArrayBuffer, respectively.
	 *
	 * In Node all values result in Buffer.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .responseType('blob')
	 *        .end(callback);
	 *
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.responseType = function(val){
	  this._responseType = val;
	  return this;
	};
	
	/**
	 * Override default request body serializer
	 *
	 * This function will be called to convert data set via .send or .attach into payload to send
	 *
	 * @param {Function}
	 * @api public
	 */
	
	RequestBase.prototype.serialize = function serialize(fn){
	  this._serializer = fn;
	  return this;
	};
	
	/**
	 * Set timeouts.
	 *
	 * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
	 * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
	 *
	 * Value of 0 or false means no timeout.
	 *
	 * @param {Number|Object} ms or {response, read, deadline}
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.timeout = function timeout(options){
	  if (!options || 'object' !== typeof options) {
	    this._timeout = options;
	    this._responseTimeout = 0;
	    return this;
	  }
	
	  if ('undefined' !== typeof options.deadline) {
	    this._timeout = options.deadline;
	  }
	  if ('undefined' !== typeof options.response) {
	    this._responseTimeout = options.response;
	  }
	  return this;
	};
	
	/**
	 * Set number of retry attempts on error.
	 *
	 * Failed requests will be retried 'count' times if timeout or err.code >= 500.
	 *
	 * @param {Number} count
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.retry = function retry(count){
	  // Default to 1 if no count passed or true
	  if (arguments.length === 0 || count === true) count = 1;
	  if (count <= 0) count = 0;
	  this._maxRetries = count;
	  this._retries = 0;
	  return this;
	};
	
	/**
	 * Retry request
	 *
	 * @return {Request} for chaining
	 * @api private
	 */
	
	RequestBase.prototype._retry = function() {
	  this.clearTimeout();
	
	  // node
	  if (this.req) {
	    this.req = null;
	    this.req = this.request();
	  }
	
	  this._aborted = false;
	  this.timedout = false;
	
	  return this._end();
	};
	
	/**
	 * Promise support
	 *
	 * @param {Function} resolve
	 * @param {Function} [reject]
	 * @return {Request}
	 */
	
	RequestBase.prototype.then = function then(resolve, reject) {
	  if (!this._fullfilledPromise) {
	    var self = this;
	    if (this._endCalled) {
	      console.warn("Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises");
	    }
	    this._fullfilledPromise = new Promise(function(innerResolve, innerReject){
	      self.end(function(err, res){
	        if (err) innerReject(err); else innerResolve(res);
	      });
	    });
	  }
	  return this._fullfilledPromise.then(resolve, reject);
	}
	
	RequestBase.prototype.catch = function(cb) {
	  return this.then(undefined, cb);
	};
	
	/**
	 * Allow for extension
	 */
	
	RequestBase.prototype.use = function use(fn) {
	  fn(this);
	  return this;
	}
	
	RequestBase.prototype.ok = function(cb) {
	  if ('function' !== typeof cb) throw Error("Callback required");
	  this._okCallback = cb;
	  return this;
	};
	
	RequestBase.prototype._isResponseOK = function(res) {
	  if (!res) {
	    return false;
	  }
	
	  if (this._okCallback) {
	    return this._okCallback(res);
	  }
	
	  return res.status >= 200 && res.status < 300;
	};
	
	
	/**
	 * Get request header `field`.
	 * Case-insensitive.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */
	
	RequestBase.prototype.get = function(field){
	  return this._header[field.toLowerCase()];
	};
	
	/**
	 * Get case-insensitive header `field` value.
	 * This is a deprecated internal API. Use `.get(field)` instead.
	 *
	 * (getHeader is no longer used internally by the superagent code base)
	 *
	 * @param {String} field
	 * @return {String}
	 * @api private
	 * @deprecated
	 */
	
	RequestBase.prototype.getHeader = RequestBase.prototype.get;
	
	/**
	 * Set header `field` to `val`, or multiple fields with one object.
	 * Case-insensitive.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .set('Accept', 'application/json')
	 *        .set('X-API-Key', 'foobar')
	 *        .end(callback);
	 *
	 *      req.get('/')
	 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
	 *        .end(callback);
	 *
	 * @param {String|Object} field
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.set = function(field, val){
	  if (isObject(field)) {
	    for (var key in field) {
	      this.set(key, field[key]);
	    }
	    return this;
	  }
	  this._header[field.toLowerCase()] = val;
	  this.header[field] = val;
	  return this;
	};
	
	/**
	 * Remove header `field`.
	 * Case-insensitive.
	 *
	 * Example:
	 *
	 *      req.get('/')
	 *        .unset('User-Agent')
	 *        .end(callback);
	 *
	 * @param {String} field
	 */
	RequestBase.prototype.unset = function(field){
	  delete this._header[field.toLowerCase()];
	  delete this.header[field];
	  return this;
	};
	
	/**
	 * Write the field `name` and `val`, or multiple fields with one object
	 * for "multipart/form-data" request bodies.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .field('foo', 'bar')
	 *   .end(callback);
	 *
	 * request.post('/upload')
	 *   .field({ foo: 'bar', baz: 'qux' })
	 *   .end(callback);
	 * ```
	 *
	 * @param {String|Object} name
	 * @param {String|Blob|File|Buffer|fs.ReadStream} val
	 * @return {Request} for chaining
	 * @api public
	 */
	RequestBase.prototype.field = function(name, val) {
	
	  // name should be either a string or an object.
	  if (null === name ||  undefined === name) {
	    throw new Error('.field(name, val) name can not be empty');
	  }
	
	  if (this._data) {
	    console.error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
	  }
	
	  if (isObject(name)) {
	    for (var key in name) {
	      this.field(key, name[key]);
	    }
	    return this;
	  }
	
	  if (Array.isArray(val)) {
	    for (var i in val) {
	      this.field(name, val[i]);
	    }
	    return this;
	  }
	
	  // val should be defined now
	  if (null === val || undefined === val) {
	    throw new Error('.field(name, val) val can not be empty');
	  }
	  if ('boolean' === typeof val) {
	    val = '' + val;
	  }
	  this._getFormData().append(name, val);
	  return this;
	};
	
	/**
	 * Abort the request, and clear potential timeout.
	 *
	 * @return {Request}
	 * @api public
	 */
	RequestBase.prototype.abort = function(){
	  if (this._aborted) {
	    return this;
	  }
	  this._aborted = true;
	  this.xhr && this.xhr.abort(); // browser
	  this.req && this.req.abort(); // node
	  this.clearTimeout();
	  this.emit('abort');
	  return this;
	};
	
	/**
	 * Enable transmission of cookies with x-domain requests.
	 *
	 * Note that for this to work the origin must not be
	 * using "Access-Control-Allow-Origin" with a wildcard,
	 * and also must set "Access-Control-Allow-Credentials"
	 * to "true".
	 *
	 * @api public
	 */
	
	RequestBase.prototype.withCredentials = function(){
	  // This is browser-only functionality. Node side is no-op.
	  this._withCredentials = true;
	  return this;
	};
	
	/**
	 * Set the max redirects to `n`. Does noting in browser XHR implementation.
	 *
	 * @param {Number} n
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.redirects = function(n){
	  this._maxRedirects = n;
	  return this;
	};
	
	/**
	 * Convert to a plain javascript object (not JSON string) of scalar properties.
	 * Note as this method is designed to return a useful non-this value,
	 * it cannot be chained.
	 *
	 * @return {Object} describing method, url, and data of this request
	 * @api public
	 */
	
	RequestBase.prototype.toJSON = function(){
	  return {
	    method: this.method,
	    url: this.url,
	    data: this._data,
	    headers: this._header
	  };
	};
	
	
	/**
	 * Send `data` as the request body, defaulting the `.type()` to "json" when
	 * an object is given.
	 *
	 * Examples:
	 *
	 *       // manual json
	 *       request.post('/user')
	 *         .type('json')
	 *         .send('{"name":"tj"}')
	 *         .end(callback)
	 *
	 *       // auto json
	 *       request.post('/user')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // manual x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send('name=tj')
	 *         .end(callback)
	 *
	 *       // auto x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // defaults to x-www-form-urlencoded
	 *      request.post('/user')
	 *        .send('name=tobi')
	 *        .send('species=ferret')
	 *        .end(callback)
	 *
	 * @param {String|Object} data
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.send = function(data){
	  var isObj = isObject(data);
	  var type = this._header['content-type'];
	
	  if (this._formData) {
	    console.error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
	  }
	
	  if (isObj && !this._data) {
	    if (Array.isArray(data)) {
	      this._data = [];
	    } else if (!this._isHost(data)) {
	      this._data = {};
	    }
	  } else if (data && this._data && this._isHost(this._data)) {
	    throw Error("Can't merge these send calls");
	  }
	
	  // merge
	  if (isObj && isObject(this._data)) {
	    for (var key in data) {
	      this._data[key] = data[key];
	    }
	  } else if ('string' == typeof data) {
	    // default to x-www-form-urlencoded
	    if (!type) this.type('form');
	    type = this._header['content-type'];
	    if ('application/x-www-form-urlencoded' == type) {
	      this._data = this._data
	        ? this._data + '&' + data
	        : data;
	    } else {
	      this._data = (this._data || '') + data;
	    }
	  } else {
	    this._data = data;
	  }
	
	  if (!isObj || this._isHost(data)) {
	    return this;
	  }
	
	  // default to json
	  if (!type) this.type('json');
	  return this;
	};
	
	
	/**
	 * Sort `querystring` by the sort function
	 *
	 *
	 * Examples:
	 *
	 *       // default order
	 *       request.get('/user')
	 *         .query('name=Nick')
	 *         .query('search=Manny')
	 *         .sortQuery()
	 *         .end(callback)
	 *
	 *       // customized sort function
	 *       request.get('/user')
	 *         .query('name=Nick')
	 *         .query('search=Manny')
	 *         .sortQuery(function(a, b){
	 *           return a.length - b.length;
	 *         })
	 *         .end(callback)
	 *
	 *
	 * @param {Function} sort
	 * @return {Request} for chaining
	 * @api public
	 */
	
	RequestBase.prototype.sortQuery = function(sort) {
	  // _sort default to true but otherwise can be a function or boolean
	  this._sort = typeof sort === 'undefined' ? true : sort;
	  return this;
	};
	
	/**
	 * Invoke callback with timeout error.
	 *
	 * @api private
	 */
	
	RequestBase.prototype._timeoutError = function(reason, timeout){
	  if (this._aborted) {
	    return;
	  }
	  var err = new Error(reason + timeout + 'ms exceeded');
	  err.timeout = timeout;
	  err.code = 'ECONNABORTED';
	  this.timedout = true;
	  this.abort();
	  this.callback(err);
	};
	
	RequestBase.prototype._setTimeouts = function() {
	  var self = this;
	
	  // deadline
	  if (this._timeout && !this._timer) {
	    this._timer = setTimeout(function(){
	      self._timeoutError('Timeout of ', self._timeout);
	    }, this._timeout);
	  }
	  // response timeout
	  if (this._responseTimeout && !this._responseTimeoutTimer) {
	    this._responseTimeoutTimer = setTimeout(function(){
	      self._timeoutError('Response timeout of ', self._responseTimeout);
	    }, this._responseTimeout);
	  }
	}


/***/ },
/* 125 */
/***/ function(module, exports) {

	/**
	 * Check if `obj` is an object.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */
	
	function isObject(obj) {
	  return null !== obj && 'object' === typeof obj;
	}
	
	module.exports = isObject;


/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Check if `fn` is a function.
	 *
	 * @param {Function} fn
	 * @return {Boolean}
	 * @api private
	 */
	var isObject = __webpack_require__(125);
	
	function isFunction(fn) {
	  var tag = isObject(fn) ? Object.prototype.toString.call(fn) : '';
	  return tag === '[object Function]';
	}
	
	module.exports = isFunction;


/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */
	
	var utils = __webpack_require__(128);
	
	/**
	 * Expose `ResponseBase`.
	 */
	
	module.exports = ResponseBase;
	
	/**
	 * Initialize a new `ResponseBase`.
	 *
	 * @api public
	 */
	
	function ResponseBase(obj) {
	  if (obj) return mixin(obj);
	}
	
	/**
	 * Mixin the prototype properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in ResponseBase.prototype) {
	    obj[key] = ResponseBase.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Get case-insensitive `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */
	
	ResponseBase.prototype.get = function(field){
	    return this.header[field.toLowerCase()];
	};
	
	/**
	 * Set header related properties:
	 *
	 *   - `.type` the content type without params
	 *
	 * A response of "Content-Type: text/plain; charset=utf-8"
	 * will provide you with a `.type` of "text/plain".
	 *
	 * @param {Object} header
	 * @api private
	 */
	
	ResponseBase.prototype._setHeaderProperties = function(header){
	    // TODO: moar!
	    // TODO: make this a util
	
	    // content-type
	    var ct = header['content-type'] || '';
	    this.type = utils.type(ct);
	
	    // params
	    var params = utils.params(ct);
	    for (var key in params) this[key] = params[key];
	
	    this.links = {};
	
	    // links
	    try {
	        if (header.link) {
	            this.links = utils.parseLinks(header.link);
	        }
	    } catch (err) {
	        // ignore
	    }
	};
	
	/**
	 * Set flags such as `.ok` based on `status`.
	 *
	 * For example a 2xx response will give you a `.ok` of __true__
	 * whereas 5xx will be __false__ and `.error` will be __true__. The
	 * `.clientError` and `.serverError` are also available to be more
	 * specific, and `.statusType` is the class of error ranging from 1..5
	 * sometimes useful for mapping respond colors etc.
	 *
	 * "sugar" properties are also defined for common cases. Currently providing:
	 *
	 *   - .noContent
	 *   - .badRequest
	 *   - .unauthorized
	 *   - .notAcceptable
	 *   - .notFound
	 *
	 * @param {Number} status
	 * @api private
	 */
	
	ResponseBase.prototype._setStatusProperties = function(status){
	    var type = status / 100 | 0;
	
	    // status / class
	    this.status = this.statusCode = status;
	    this.statusType = type;
	
	    // basics
	    this.info = 1 == type;
	    this.ok = 2 == type;
	    this.redirect = 3 == type;
	    this.clientError = 4 == type;
	    this.serverError = 5 == type;
	    this.error = (4 == type || 5 == type)
	        ? this.toError()
	        : false;
	
	    // sugar
	    this.accepted = 202 == status;
	    this.noContent = 204 == status;
	    this.badRequest = 400 == status;
	    this.unauthorized = 401 == status;
	    this.notAcceptable = 406 == status;
	    this.forbidden = 403 == status;
	    this.notFound = 404 == status;
	};


/***/ },
/* 128 */
/***/ function(module, exports) {

	
	/**
	 * Return the mime type for the given `str`.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */
	
	exports.type = function(str){
	  return str.split(/ *; */).shift();
	};
	
	/**
	 * Return header field parameters.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */
	
	exports.params = function(str){
	  return str.split(/ *; */).reduce(function(obj, str){
	    var parts = str.split(/ *= */);
	    var key = parts.shift();
	    var val = parts.shift();
	
	    if (key && val) obj[key] = val;
	    return obj;
	  }, {});
	};
	
	/**
	 * Parse Link header fields.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */
	
	exports.parseLinks = function(str){
	  return str.split(/ *, */).reduce(function(obj, str){
	    var parts = str.split(/ *; */);
	    var url = parts[0].slice(1, -1);
	    var rel = parts[1].split(/ *= */)[1].slice(1, -1);
	    obj[rel] = url;
	    return obj;
	  }, {});
	};
	
	/**
	 * Strip content related fields from `header`.
	 *
	 * @param {Object} header
	 * @return {Object} header
	 * @api private
	 */
	
	exports.cleanHeader = function(header, shouldStripCookie){
	  delete header['content-type'];
	  delete header['content-length'];
	  delete header['transfer-encoding'];
	  delete header['host'];
	  if (shouldStripCookie) {
	    delete header['cookie'];
	  }
	  return header;
	};

/***/ },
/* 129 */
/***/ function(module, exports) {

	var ERROR_CODES = [
	  'ECONNRESET',
	  'ETIMEDOUT',
	  'EADDRINFO',
	  'ESOCKETTIMEDOUT'
	];
	
	/**
	 * Determine if a request should be retried.
	 * (Borrowed from segmentio/superagent-retry)
	 *
	 * @param {Error} err
	 * @param {Response} [res]
	 * @returns {Boolean}
	 */
	module.exports = function shouldRetry(err, res) {
	  if (err && err.code && ~ERROR_CODES.indexOf(err.code)) return true;
	  if (res && res.status && res.status >= 500) return true;
	  // Superagent timeout
	  if (err && 'timeout' in err && err.code == 'ECONNABORTED') return true;
	  return false;
	};

/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var index_1 = __webpack_require__(12);
	var FCIL = (function () {
	    function FCIL(out, op) {
	        this.out = out;
	        this.op = op;
	    }
	    FCIL.prototype._n = function (t) {
	        this.out._n(t);
	    };
	    FCIL.prototype._e = function (err) {
	        this.out._e(err);
	    };
	    FCIL.prototype._c = function () {
	        this.op.less();
	    };
	    return FCIL;
	}());
	var FlattenConcOperator = (function () {
	    function FlattenConcOperator(ins) {
	        this.ins = ins;
	        this.type = 'flattenConcurrently';
	        this.active = 1; // number of outers and inners that have not yet ended
	        this.out = null;
	    }
	    FlattenConcOperator.prototype._start = function (out) {
	        this.out = out;
	        this.ins._add(this);
	    };
	    FlattenConcOperator.prototype._stop = function () {
	        this.ins._remove(this);
	        this.active = 1;
	        this.out = null;
	    };
	    FlattenConcOperator.prototype.less = function () {
	        if (--this.active === 0) {
	            var u = this.out;
	            if (!u)
	                return;
	            u._c();
	        }
	    };
	    FlattenConcOperator.prototype._n = function (s) {
	        var u = this.out;
	        if (!u)
	            return;
	        this.active++;
	        s._add(new FCIL(u, this));
	    };
	    FlattenConcOperator.prototype._e = function (err) {
	        var u = this.out;
	        if (!u)
	            return;
	        u._e(err);
	    };
	    FlattenConcOperator.prototype._c = function () {
	        this.less();
	    };
	    return FlattenConcOperator;
	}());
	exports.FlattenConcOperator = FlattenConcOperator;
	/**
	 * Flattens a "stream of streams", handling multiple concurrent nested streams
	 * simultaneously.
	 *
	 * If the input stream is a stream that emits streams, then this operator will
	 * return an output stream which is a flat stream: emits regular events. The
	 * flattening happens concurrently. It works like this: when the input stream
	 * emits a nested stream, *flattenConcurrently* will start imitating that
	 * nested one. When the next nested stream is emitted on the input stream,
	 * *flattenConcurrently* will also imitate that new one, but will continue to
	 * imitate the previous nested streams as well.
	 *
	 * Marble diagram:
	 *
	 * ```text
	 * --+--------+---------------
	 *   \        \
	 *    \       ----1----2---3--
	 *    --a--b----c----d--------
	 *     flattenConcurrently
	 * -----a--b----c-1--d-2---3--
	 * ```
	 *
	 * @return {Stream}
	 */
	function flattenConcurrently(ins) {
	    return new index_1.Stream(new FlattenConcOperator(ins));
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = flattenConcurrently;
	//# sourceMappingURL=flattenConcurrently.js.map

/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var dom_1 = __webpack_require__(13);
	var definitions_1 = __webpack_require__(116);
	var fadeInOutStyle = {
	    opacity: '0', delayed: { opacity: '1' }
	};
	function pad(n, width, z) {
	    z = z || '0';
	    n = n + '';
	    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}
	function getHHMM(date) {
	    var hours = date.getHours();
	    var minutes = date.getMinutes();
	    return (hours > 12 ? pad((hours - 12).toString(), 2) : pad(hours.toString(), 2)) + ':' + pad(minutes.toString(), 2);
	}
	function getMeridien(date) {
	    return date.getHours() >= 12 ? 'PM' : 'AM';
	}
	function getAuthorInfo(entry) {
	    var authorChildren = entry.authors && entry.authors[0] ? [dom_1.img('.avatar', {
	            props: {
	                src: entry.authors[0] != undefined
	                    ? entry.authors[0].image_url || 'images/speakers/devday-speaker.png'
	                    : 'images/speakers/devday-speaker.png'
	            }
	        }),
	        dom_1.h5(entry.title),
	        dom_1.h6(['by ' + entry.authors.map(function (a) { return a.name; }).join(', ')])]
	        : [dom_1.h5(entry.title)];
	    return dom_1.div('.info', authorChildren.concat([
	        dom_1.p(entry.abstract)
	    ]));
	}
	function renderAgendaEntry(entry) {
	    switch (entry.type) {
	        case definitions_1.AgendaEntryType.Talk:
	        case definitions_1.AgendaEntryType.Workshop:
	            return [
	                dom_1.div('.agenda', [
	                    dom_1.div('.thumbnail', [
	                        dom_1.h5([getHHMM(entry.time.start_time)]),
	                        dom_1.h6([getMeridien(entry.time.start_time)])
	                    ]),
	                    getAuthorInfo(entry)
	                ])
	            ];
	        case definitions_1.AgendaEntryType.Break:
	            return [
	                dom_1.div('.agenda', [
	                    dom_1.div('.thumbnail.break', [
	                        dom_1.h5([getHHMM(entry.time.start_time)]),
	                        dom_1.h6([getMeridien(entry.time.start_time)])
	                    ]),
	                    dom_1.div('.info.break', [
	                        dom_1.div('.centerer', [
	                            dom_1.h5(entry.title)
	                        ])
	                    ])
	                ])
	            ];
	    }
	}
	function renderBackground(event) {
	    var style = {};
	    if (event.color)
	        style['background-color'] = event.color;
	    if (event.image_url != undefined)
	        style['background-image'] = "url(\"" + event.image_url + "\")";
	    if (event.background_size != undefined)
	        style['background-size'] = event.background_size;
	    return dom_1.div('.background', { style: style });
	}
	function renderFormFields(present) {
	    var presentFields = present
	        ? [
	            dom_1.div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
	                dom_1.input('.mdl-textfield__input', {
	                    props: {
	                        id: 'title',
	                        placeholder: 'Title',
	                        required: 'required'
	                    }
	                }),
	                dom_1.label('.mdl-textfield__label', {
	                    props: {
	                        for: 'title'
	                    }
	                }, ['Title']),
	                dom_1.span('mdl-textfield__error', 'Please enter a title!')
	            ]),
	            dom_1.div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
	                dom_1.textarea('.mdl-textfield__input', {
	                    props: {
	                        id: 'abstract',
	                        placeholder: 'Abstract',
	                        required: 'required'
	                    }
	                }),
	                dom_1.label('.mdl-textfield__label', {
	                    props: {
	                        for: 'abstract'
	                    }
	                }, ['Abstract']),
	                dom_1.span('mdl-textfield__error', 'Please enter an abstract!')
	            ])
	        ]
	        : [];
	    return [
	        dom_1.div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
	            dom_1.input('.mdl-textfield__input', {
	                props: {
	                    id: 'name',
	                    placeholder: 'Name',
	                    pattern: '^[a-zA-Z][a-zA-Z ]{4,}',
	                    required: 'required'
	                }
	            }),
	            dom_1.label('.mdl-textfield__label', {
	                props: {
	                    for: 'name'
	                }
	            }, ['Name']),
	            dom_1.span('mdl-textfield__error', 'Please enter a valid name!')
	        ]),
	        dom_1.div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
	            dom_1.input('.mdl-textfield__input', {
	                props: {
	                    id: 'email',
	                    placeholder: 'Email',
	                    type: 'email',
	                    required: 'required'
	                }
	            }),
	            dom_1.label('.mdl-textfield__label', {
	                props: {
	                    for: 'email'
	                }
	            }, ['Email']),
	            dom_1.span('mdl-textfield__error', 'Please enter a valid email!')
	        ]),
	        dom_1.div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
	            dom_1.input('.mdl-textfield__input', {
	                props: {
	                    id: 'mobile',
	                    placeholder: 'Mobile',
	                    pattern: '^[987][0-9]{9}$',
	                    required: 'required'
	                },
	                attrs: {
	                    maxlength: '10'
	                }
	            }),
	            dom_1.label('.mdl-textfield__label', {
	                props: {
	                    for: 'mobile'
	                }
	            }, ['Mobile']),
	            dom_1.span('mdl-textfield__error', 'Please enter a valid mobile number!')
	        ]),
	        dom_1.label('#present', {
	            props: {
	                for: 'presentCheckbox'
	            }
	        }, [
	            dom_1.input('#presentCheckbox', { attrs: { type: 'checkbox' } }),
	            'I want to present a talk/workshop'
	        ])
	    ].concat(presentFields);
	}
	function renderForm(event, clicked, shorten, registrationSuccessful, present) {
	    var showForm = event.form != undefined && event.registration_time.end_time.getTime() > new Date().getTime();
	    var buttonSelector = '.join.event.button' + (shorten ? '' : '.no.delay');
	    if (!showForm)
	        return [];
	    if (!clicked)
	        return [
	            dom_1.a(buttonSelector, {
	                props: {
	                    title: 'join event',
	                    href: '#'
	                },
	                style: {
	                    transform: 'scale3d(0, 0, 1)',
	                    delayed: {
	                        transform: 'scale3d(1,1,1)'
	                    }
	                },
	                attrs: {
	                    'data-url': event.url
	                }
	            }, [
	                dom_1.span('.hidden', 'join event'),
	                dom_1.i('.material-icons.join.icon', { style: fadeInOutStyle }, 'add')
	            ])
	        ];
	    return [
	        dom_1.a('.join.event.button', {
	            props: {
	                title: 'join event',
	                href: '#'
	            },
	            style: {
	                transform: 'scale3d(1, 1, 1)',
	                delayed: {
	                    transform: 'scale3d(21,21,1)'
	                }
	            },
	            attrs: {
	                'data-url': event.url
	            }
	        }, [
	            dom_1.span('.hidden', 'join event')
	        ]),
	        registrationSuccessful
	            ? dom_1.div('.registration.success', [
	                dom_1.h4('.message', ['Your registration was successful!', dom_1.br(), "See you on " + event.event_time.start_time.toDateString()]),
	                dom_1.button('.close .mdl-button', {
	                    style: {
	                        color: '#ff4081',
	                        background: 'white'
	                    },
	                    props: {
	                        tabindex: '0'
	                    }
	                }, 'Close')
	            ])
	            : dom_1.form('.event.form', { style: fadeInOutStyle }, [
	                dom_1.button('.close', {
	                    style: {
	                        float: 'right'
	                    },
	                    props: {
	                        tabindex: '0'
	                    }
	                }, 'x')
	            ].concat(renderFormFields(present), [
	                dom_1.button({
	                    props: {
	                        type: 'submit',
	                        tabindex: '1'
	                    }
	                }, ['Join Us!'])
	            ]))
	    ];
	}
	function renderEvent(event, joinUrl, shorten, registrationSuccessfulUrl, present) {
	    var getAttendingElement = function () {
	        if (!event.attending) {
	            return null;
	        }
	        return dom_1.div('.attending', [
	            dom_1.p([event.attending + " attending"])
	        ]);
	    };
	    var clickedBoolean = joinUrl === event.url;
	    var registrationSuccessful = registrationSuccessfulUrl === event.url;
	    var authors = [].concat.apply([], event.agenda.filter(function (entry) { return Boolean(entry.authors) && Boolean(entry.authors.length); }).map(function (entry) { return entry.authors; }));
	    return dom_1.article('.event.card', {
	        attrs: {
	            'data-url': event.url
	        },
	        style: {
	            transform: 'scale(0)',
	            opacity: '0',
	            delayed: {
	                transform: 'scale(1)',
	                opacity: '1'
	            }
	        }
	    }, [
	        dom_1.div('.primary.info', {
	            style: {
	                right: '100%',
	                delayed: {
	                    right: '35%'
	                }
	            }
	        }, [
	            dom_1.div('.content', { style: fadeInOutStyle }, [
	                dom_1.h5('.location', [
	                    dom_1.i(".material-icons detail-icon", "location_on"),
	                    event.venue.city
	                ]),
	                dom_1.h4('', [
	                    dom_1.i(".material-icons detail-icon", "event"),
	                    event.event_time.start_time.toDateString()
	                ]),
	                dom_1.h3([event.title]),
	                dom_1.p([event.abstract])
	            ])
	        ]),
	        renderBackground(event),
	        dom_1.div('.speakers', {
	            style: {
	                top: '540px',
	                delayed: {
	                    top: '312px'
	                }
	            }
	        }, [
	            dom_1.div('.content', {
	                style: fadeInOutStyle
	            }, authors.length > 0
	                ? authors.map(function (speaker) { return dom_1.img('.avatar', { props: { src: speaker.image_url || 'images/speakers/devday-speaker.png' } }); })
	                : [dom_1.p(['Walk in with your laptops for a hands-on experience!!!'])])
	        ]),
	        dom_1.div('.secondary.info', {
	            style: {
	                top: '540px',
	                delayed: {
	                    top: '440px'
	                }
	            }
	        }, [
	            dom_1.div('.content', {
	                style: fadeInOutStyle
	            }, [
	                dom_1.div('.location', [
	                    dom_1.address([
	                        event.venue.locality + ',',
	                        dom_1.br(),
	                        event.venue.city
	                    ]),
	                    dom_1.a({ props: { href: event.venue.map_link } }, [
	                        dom_1.div('.filler', {
	                            attrs: {
	                                style: "background-image: url(\"" + event.venue.map_image + "\");"
	                            }
	                        })
	                    ])
	                ]),
	                getAttendingElement()
	            ])
	        ])
	    ].concat(renderForm(event, clickedBoolean, shorten, registrationSuccessful, present)));
	}
	exports.renderEvent = renderEvent;


/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var index_1 = __webpack_require__(12);
	var DelayOperator = (function () {
	    function DelayOperator(dt, ins) {
	        this.dt = dt;
	        this.ins = ins;
	        this.type = 'delay';
	        this.out = null;
	    }
	    DelayOperator.prototype._start = function (out) {
	        this.out = out;
	        this.ins._add(this);
	    };
	    DelayOperator.prototype._stop = function () {
	        this.ins._remove(this);
	        this.out = null;
	    };
	    DelayOperator.prototype._n = function (t) {
	        var u = this.out;
	        if (!u)
	            return;
	        var id = setInterval(function () {
	            u._n(t);
	            clearInterval(id);
	        }, this.dt);
	    };
	    DelayOperator.prototype._e = function (err) {
	        var u = this.out;
	        if (!u)
	            return;
	        var id = setInterval(function () {
	            u._e(err);
	            clearInterval(id);
	        }, this.dt);
	    };
	    DelayOperator.prototype._c = function () {
	        var u = this.out;
	        if (!u)
	            return;
	        var id = setInterval(function () {
	            u._c();
	            clearInterval(id);
	        }, this.dt);
	    };
	    return DelayOperator;
	}());
	/**
	 * Delays periodic events by a given time period.
	 *
	 * Marble diagram:
	 *
	 * ```text
	 * 1----2--3--4----5|
	 *     delay(60)
	 * ---1----2--3--4----5|
	 * ```
	 *
	 * Example:
	 *
	 * ```js
	 * import fromDiagram from 'xstream/extra/fromDiagram'
	 * import delay from 'xstream/extra/delay'
	 *
	 * const stream = fromDiagram('1----2--3--4----5|')
	 *  .compose(delay(60))
	 *
	 * stream.addListener({
	 *   next: i => console.log(i),
	 *   error: err => console.error(err),
	 *   complete: () => console.log('completed')
	 * })
	 * ```
	 *
	 * ```text
	 * > 1  (after 60 ms)
	 * > 2  (after 160 ms)
	 * > 3  (after 220 ms)
	 * > 4  (after 280 ms)
	 * > 5  (after 380 ms)
	 * > completed
	 * ```
	 *
	 * @param {number} period The amount of silence required in milliseconds.
	 * @return {Stream}
	 */
	function delay(period) {
	    return function delayOperator(ins) {
	        return new index_1.Stream(new DelayOperator(period, ins));
	    };
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = delay;
	//# sourceMappingURL=delay.js.map

/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var definitions_1 = __webpack_require__(116);
	var dom_1 = __webpack_require__(13);
	var utils_1 = __webpack_require__(134);
	var isolate_1 = __webpack_require__(135);
	function getHHMM(date) {
	    var hours = date.getHours();
	    var minutes = date.getMinutes();
	    return (hours > 12 ? utils_1.pad((hours - 12).toString(), 2) : utils_1.pad(hours.toString(), 2)) + ':' + utils_1.pad(minutes.toString(), 2);
	}
	function getMeridien(date) {
	    return date.getHours() >= 12 ? 'PM' : 'AM';
	}
	function getAuthorInfo(entry) {
	    var authorChildren = entry.authors && entry.authors[0] ? [dom_1.img('.avatar', {
	            props: {
	                src: entry.authors[0] != undefined
	                    ? entry.authors[0].image_url || 'images/speakers/devday-speaker.png'
	                    : 'images/speakers/devday-speaker.png'
	            }
	        }),
	        dom_1.h5(entry.title),
	        dom_1.h6(['by ' + entry.authors.map(function (a) { return a.name; }).join(', ')])]
	        : [dom_1.h5(entry.title)];
	    return dom_1.div('.info', authorChildren.concat([
	        dom_1.p(entry.abstract)
	    ]));
	}
	function renderAgendaEntry(entry) {
	    switch (entry.type) {
	        case definitions_1.AgendaEntryType.Talk:
	        case definitions_1.AgendaEntryType.Workshop:
	            return [
	                dom_1.div('.agenda', [
	                    dom_1.div('.thumbnail', [
	                        dom_1.h5([getHHMM(entry.time.start_time)]),
	                        dom_1.h6([getMeridien(entry.time.start_time)])
	                    ]),
	                    getAuthorInfo(entry)
	                ])
	            ];
	        case definitions_1.AgendaEntryType.Break:
	            return [
	                dom_1.div('.agenda', [
	                    dom_1.div('.thumbnail.break', [
	                        dom_1.h5([getHHMM(entry.time.start_time)]),
	                        dom_1.h6([getMeridien(entry.time.start_time)])
	                    ]),
	                    dom_1.div('.info.break', [
	                        dom_1.div('.centerer', [
	                            dom_1.h5(entry.title)
	                        ])
	                    ])
	                ])
	            ];
	    }
	}
	function renderBackground(event) {
	    var style = {};
	    if (event.color)
	        style['background-color'] = event.color;
	    if (event.image_url != undefined)
	        style['background-image'] = "url(\"" + event.image_url + "\")";
	    if (event.background_size != undefined)
	        style['background-size'] = event.background_size;
	    return dom_1.div('.background', { style: style });
	}
	function renderFormFields(present) {
	    var presentFields = present
	        ? [
	            dom_1.div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
	                dom_1.input('.mdl-textfield__input', {
	                    props: {
	                        id: 'title',
	                        placeholder: 'Title',
	                        required: 'required'
	                    }
	                }),
	                dom_1.label('.mdl-textfield__label', {
	                    props: {
	                        for: 'title'
	                    }
	                }, ['Title']),
	                dom_1.span('mdl-textfield__error', 'Please enter a title!')
	            ]),
	            dom_1.div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
	                dom_1.textarea('.mdl-textfield__input', {
	                    props: {
	                        id: 'abstract',
	                        placeholder: 'Abstract',
	                        required: 'required'
	                    }
	                }),
	                dom_1.label('.mdl-textfield__label', {
	                    props: {
	                        for: 'abstract'
	                    }
	                }, ['Abstract']),
	                dom_1.span('mdl-textfield__error', 'Please enter an abstract!')
	            ])
	        ]
	        : [];
	    return [
	        dom_1.div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
	            dom_1.input('.mdl-textfield__input', {
	                props: {
	                    id: 'name',
	                    placeholder: 'Name',
	                    pattern: '^[a-zA-Z][a-zA-Z ]{4,}',
	                    required: 'required'
	                }
	            }),
	            dom_1.label('.mdl-textfield__label', {
	                props: {
	                    for: 'name'
	                }
	            }, ['Name']),
	            dom_1.span('mdl-textfield__error', 'Please enter a valid name!')
	        ]),
	        dom_1.div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
	            dom_1.input('.mdl-textfield__input', {
	                props: {
	                    id: 'email',
	                    placeholder: 'Email',
	                    type: 'email',
	                    required: 'required'
	                }
	            }),
	            dom_1.label('.mdl-textfield__label', {
	                props: {
	                    for: 'email'
	                }
	            }, ['Email']),
	            dom_1.span('mdl-textfield__error', 'Please enter a valid email!')
	        ]),
	        dom_1.div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
	            dom_1.input('.mdl-textfield__input', {
	                props: {
	                    id: 'mobile',
	                    placeholder: 'Mobile',
	                    pattern: '^[987][0-9]{9}$',
	                    required: 'required'
	                },
	                attrs: {
	                    maxlength: '10'
	                }
	            }),
	            dom_1.label('.mdl-textfield__label', {
	                props: {
	                    for: 'mobile'
	                }
	            }, ['Mobile']),
	            dom_1.span('mdl-textfield__error', 'Please enter a valid mobile number!')
	        ]),
	        dom_1.label('#present', {
	            props: {
	                for: 'presentCheckbox'
	            }
	        }, [
	            dom_1.input('#presentCheckbox', { attrs: { type: 'checkbox' } }),
	            'I want to present a talk/workshop'
	        ])
	    ].concat(presentFields);
	}
	function renderExpandedForm(event, registrationSuccessful, present) {
	    var showForm = event.form != undefined && event.registration_time.end_time.getTime() > new Date().getTime();
	    if (!showForm)
	        return dom_1.p(['This event no longer accepts new registrations.']);
	    return registrationSuccessful
	        ? dom_1.div('.registration.success', [
	            dom_1.p('.message', "Your registration was successful! See you on " + event.event_time.start_time.toDateString())
	        ])
	        : dom_1.form('.event.form', { style: utils_1.fadeInOutStyle }, renderFormFields(present).concat([
	            dom_1.button({
	                props: {
	                    type: 'submit',
	                    tabindex: '0'
	                }
	            }, ['Join Us!'])
	        ]));
	}
	function renderExpandedEvent(event, registrationSuccessUrl, present) {
	    var registrationSuccessful = registrationSuccessUrl === event.url;
	    return dom_1.article('.event.card.expanded', {
	        attrs: {
	            'data-url': event.url
	        },
	        style: {
	            transform: 'scale(0)',
	            opacity: '0',
	            delayed: {
	                transform: 'scale(1)',
	                opacity: '1'
	            }
	        },
	    }, [
	        dom_1.div('.primary.info', {
	            style: {
	                right: '100%',
	                delayed: {
	                    right: '35%'
	                }
	            }
	        }, [
	            dom_1.div('.content', {
	                style: utils_1.fadeInOutStyle
	            }, [
	                dom_1.h4([event.event_time.start_time.toDateString()]),
	                dom_1.h3([event.title]),
	                dom_1.p([event.abstract]),
	            ])
	        ]),
	        renderBackground(event),
	        dom_1.div('.agenda', [
	            dom_1.div('.content', { style: utils_1.fadeInOutStyle }, [].concat.apply([], event.agenda.map(renderAgendaEntry)))
	        ]),
	        dom_1.div('.secondary.info', {
	            style: {
	                top: '540px',
	                delayed: {
	                    top: '440px'
	                }
	            }
	        }, [
	            dom_1.div('.content', {
	                style: utils_1.fadeInOutStyle
	            }, [
	                dom_1.div('.location', [
	                    dom_1.a({
	                        props: {
	                            target: '_blank',
	                            href: event.venue.map_link
	                        }
	                    }, [
	                        dom_1.div('.filler', {
	                            attrs: {
	                                style: "background-image: url(\"" + event.venue.map_image + "\");"
	                            }
	                        })
	                    ]),
	                    dom_1.address([
	                        event.venue.line_one,
	                        dom_1.br(),
	                        event.venue.line_two,
	                        dom_1.br(),
	                        event.venue.locality,
	                        dom_1.br(),
	                        event.venue.city + ' - ' + event.venue.zip
	                    ])
	                ]),
	                dom_1.div('.attending', [
	                    renderExpandedForm(event, registrationSuccessful, present)
	                ])
	            ]),
	        ]),
	        dom_1.a('.shrink.button', {
	            props: {
	                title: 'close event',
	                href: '#/'
	            }
	        }, [
	            dom_1.span('.hidden', 'close event'),
	            dom_1.i('.material-icons', 'close')
	        ])
	    ]);
	}
	exports.renderExpandedEvent = renderExpandedEvent;
	function EventDetailComponent(sources) {
	    var eventUrl$ = sources.eventUrl$;
	    var event$ = eventUrl$
	        .map(function (eventUrl) {
	        return sources.events.events$
	            .map(function (events) { return events.find(function (event) { return event.url === eventUrl; }); });
	    })
	        .flatten();
	    var shrinkButtonClick$ = sources.dom.select('.shrink.button').events('.click');
	    var history$ = shrinkButtonClick$.mapTo('/');
	    var vdom$ = event$.map(function (event) { return dom_1.main([renderExpandedEvent(event, '', false)]); });
	    return {
	        dom: vdom$,
	        history: history$,
	        prevent: shrinkButtonClick$
	    };
	}
	exports.EventDetailComponent = EventDetailComponent;
	exports.EventDetail = function (sources) { return isolate_1.default(EventDetailComponent)(sources); };


/***/ },
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var xstream_1 = __webpack_require__(12);
	function pluck(stream, getter) {
	    return stream.map(function (str) { return getter(str) || xstream_1.Stream.empty(); }).flatten();
	}
	exports.pluck = pluck;
	exports.fadeInOutStyle = {
	    opacity: '0', delayed: { opacity: '1' }
	};
	function pad(n, width, z) {
	    z = z || '0';
	    n = n + '';
	    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}
	exports.pad = pad;


/***/ },
/* 135 */
/***/ function(module, exports) {

	"use strict";
	var counter = 0;
	function newScope() {
	    return "cycle" + ++counter;
	}
	function checkIsolateArgs(dataflowComponent, scope) {
	    if (typeof dataflowComponent !== "function") {
	        throw new Error("First argument given to isolate() must be a " +
	            "'dataflowComponent' function");
	    }
	    if (scope === null) {
	        throw new Error("Second argument given to isolate() must not be null");
	    }
	}
	function isolateAllSources(sources, scope) {
	    var scopedSources = {};
	    for (var key in sources) {
	        var source = sources[key];
	        if (sources.hasOwnProperty(key)
	            && source
	            && typeof source.isolateSource === 'function') {
	            scopedSources[key] = source.isolateSource(source, scope);
	        }
	        else if (sources.hasOwnProperty(key)) {
	            scopedSources[key] = sources[key];
	        }
	    }
	    return scopedSources;
	}
	function isolateAllSinks(sources, sinks, scope) {
	    var scopedSinks = {};
	    for (var key in sinks) {
	        var source = sources[key];
	        if (sinks.hasOwnProperty(key)
	            && source
	            && typeof source.isolateSink === 'function') {
	            scopedSinks[key] = source.isolateSink(sinks[key], scope);
	        }
	        else if (sinks.hasOwnProperty(key)) {
	            scopedSinks[key] = sinks[key];
	        }
	    }
	    return scopedSinks;
	}
	/**
	 * Takes a `component` function and an optional `scope` string, and returns a
	 * scoped version of the `component` function.
	 *
	 * When the scoped component is invoked, each source provided to the scoped
	 * component is isolated to the given `scope` using
	 * `source.isolateSource(source, scope)`, if possible. Likewise, the sinks
	 * returned from the scoped component are isolated to the `scope` using
	 * `source.isolateSink(sink, scope)`.
	 *
	 * If the `scope` is not provided, a new scope will be automatically created.
	 * This means that while **`isolate(component, scope)` is pure**
	 * (referentially transparent), **`isolate(component)` is impure**
	 * (not referentially transparent). Two calls to `isolate(Foo, bar)` will
	 * generate the same component. But, two calls to `isolate(Foo)` will generate
	 * two distinct components.
	 *
	 * Note that both `isolateSource()` and `isolateSink()` are static members of
	 * `source`. The reason for this is that drivers produce `source` while the
	 * application produces `sink`, and it's the driver's responsibility to
	 * implement `isolateSource()` and `isolateSink()`.
	 *
	 * @param {Function} component a function that takes `sources` as input
	 * and outputs a collection of `sinks`.
	 * @param {String} scope an optional string that is used to isolate each
	 * `sources` and `sinks` when the returned scoped component is invoked.
	 * @return {Function} the scoped component function that, as the original
	 * `component` function, takes `sources` and returns `sinks`.
	 * @function isolate
	 */
	function isolate(component, scope) {
	    if (scope === void 0) { scope = newScope(); }
	    checkIsolateArgs(component, scope);
	    var convertedScope = typeof scope === 'string' ? scope : scope.toString();
	    return function scopedComponent(sources) {
	        var rest = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            rest[_i - 1] = arguments[_i];
	        }
	        var scopedSources = isolateAllSources(sources, convertedScope);
	        var sinks = component.apply(void 0, [scopedSources].concat(rest));
	        var scopedSinks = isolateAllSinks(sources, sinks, convertedScope);
	        return scopedSinks;
	    };
	}
	isolate.reset = function () { return counter = 0; };
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = isolate;
	//# sourceMappingURL=index.js.map

/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var util_1 = __webpack_require__(137);
	function switchPathInputGuard(path, routes) {
	    if (!util_1.isPattern(path)) {
	        throw new Error("First parameter to switchPath must be a route path.");
	    }
	    if (!util_1.isRouteDefinition(routes)) {
	        throw new Error("Second parameter to switchPath must be an object " +
	            "containing route patterns.");
	    }
	}
	function validatePath(sourcePath, matchedPath) {
	    var sourceParts = util_1.splitPath(sourcePath);
	    var matchedParts = util_1.splitPath(matchedPath);
	    for (var i = 0; i < matchedParts.length; ++i) {
	        if (matchedParts[i] !== sourceParts[i]) {
	            return null;
	        }
	    }
	    return "/" + util_1.extractPartial(sourcePath, matchedPath);
	}
	function betterMatch(candidate, reference) {
	    if (!util_1.isNotNull(candidate)) {
	        return false;
	    }
	    if (!util_1.isNotNull(reference)) {
	        return true;
	    }
	    if (!validatePath(candidate, reference)) {
	        return false;
	    }
	    return candidate.length >= reference.length;
	}
	function matchesWithParams(sourcePath, pattern) {
	    var sourceParts = util_1.splitPath(sourcePath);
	    var patternParts = util_1.splitPath(pattern);
	    var params = patternParts
	        .map(function (part, i) { return util_1.isParam(part) ? sourceParts[i] : null; })
	        .filter(util_1.isNotNull);
	    var matched = patternParts
	        .every(function (part, i) { return util_1.isParam(part) || part === sourceParts[i]; });
	    return matched ? params : [];
	}
	function getParamFnValue(paramFn, params) {
	    var _paramFn = util_1.isRouteDefinition(paramFn) ? paramFn["/"] : paramFn;
	    return typeof _paramFn === "function" ? _paramFn.apply(void 0, params) : _paramFn;
	}
	function validate(_a) {
	    var sourcePath = _a.sourcePath, matchedPath = _a.matchedPath, matchedValue = _a.matchedValue, routes = _a.routes;
	    var path = matchedPath ? validatePath(sourcePath, matchedPath) : null;
	    var value = matchedValue;
	    if (!path) {
	        path = routes["*"] ? sourcePath : null;
	        value = path ? routes["*"] : null;
	    }
	    return { path: path, value: value };
	}
	function switchPath(sourcePath, routes) {
	    switchPathInputGuard(sourcePath, routes);
	    var matchedPath = null;
	    var matchedValue = null;
	    util_1.traverseRoutes(routes, function matchPattern(pattern) {
	        if (sourcePath.search(pattern) === 0 && betterMatch(pattern, matchedPath)) {
	            matchedPath = pattern;
	            matchedValue = routes[pattern];
	        }
	        var params = matchesWithParams(sourcePath, pattern).filter(Boolean);
	        if (params.length > 0 && betterMatch(sourcePath, matchedPath)) {
	            matchedPath = util_1.extractPartial(sourcePath, pattern);
	            matchedValue = getParamFnValue(routes[pattern], params);
	        }
	        if (util_1.isRouteDefinition(routes[pattern]) && params.length === 0) {
	            if (sourcePath !== "/") {
	                var child = switchPath(util_1.unprefixed(sourcePath, pattern) || "/", routes[pattern]);
	                var nestedPath = pattern + child.path;
	                if (child.path !== null &&
	                    betterMatch(nestedPath, matchedPath)) {
	                    matchedPath = nestedPath;
	                    matchedValue = child.value;
	                }
	            }
	        }
	    });
	    return validate({ sourcePath: sourcePath, matchedPath: matchedPath, matchedValue: matchedValue, routes: routes });
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = switchPath;
	//# sourceMappingURL=index.js.map

/***/ },
/* 137 */
/***/ function(module, exports) {

	"use strict";
	function isPattern(candidate) {
	    return candidate.charAt(0) === "/" || candidate === "*";
	}
	exports.isPattern = isPattern;
	function isRouteDefinition(candidate) {
	    return !candidate || typeof candidate !== "object" ?
	        false : isPattern(Object.keys(candidate)[0]);
	}
	exports.isRouteDefinition = isRouteDefinition;
	function traverseRoutes(routes, callback) {
	    var keys = Object.keys(routes);
	    for (var i = 0; i < keys.length; ++i) {
	        var pattern = keys[i];
	        if (pattern === "*")
	            continue;
	        callback(pattern);
	    }
	}
	exports.traverseRoutes = traverseRoutes;
	function isNotNull(candidate) {
	    return candidate !== null;
	}
	exports.isNotNull = isNotNull;
	function splitPath(path) {
	    return path.split("/").filter(function (s) { return !!s; });
	}
	exports.splitPath = splitPath;
	function isParam(candidate) {
	    return candidate.match(/:\w+/) !== null;
	}
	exports.isParam = isParam;
	function extractPartial(sourcePath, pattern) {
	    var patternParts = splitPath(pattern);
	    var sourceParts = splitPath(sourcePath);
	    var matchedParts = [];
	    for (var i = 0; i < patternParts.length; ++i) {
	        matchedParts.push(sourceParts[i]);
	    }
	    return matchedParts.filter(isNotNull).join("/");
	}
	exports.extractPartial = extractPartial;
	function unprefixed(fullString, prefix) {
	    return fullString.split(prefix)[1];
	}
	exports.unprefixed = unprefixed;
	//# sourceMappingURL=util.js.map

/***/ },
/* 138 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var header_1 = __webpack_require__(139);
	var footer_1 = __webpack_require__(140);
	var xstream_1 = __webpack_require__(12);
	var dom_1 = __webpack_require__(13);
	var utils_1 = __webpack_require__(134);
	function Layout(sources) {
	    var xs = xstream_1.Stream;
	    var headerDom$ = header_1.Header().dom;
	    var footerDom$ = footer_1.Footer().dom;
	    var sinks$ = sources.sinks$;
	    var componentDom$ = utils_1.pluck(sinks$, function (sinks) { return sinks.dom; });
	    var vtree$ = xs.combine(headerDom$, componentDom$, footerDom$)
	        .map(function (_a) {
	        var headerDom = _a[0], componentDom = _a[1], footerDom = _a[2];
	        return dom_1.div('.devday.home', [
	            dom_1.div('.container', [
	                dom_1.div('.layout', [
	                    dom_1.div('.content', [
	                        headerDom,
	                        componentDom,
	                        footerDom
	                    ])
	                ])
	            ])
	        ]);
	    });
	    return {
	        dom: vtree$,
	        routes: utils_1.pluck(sinks$, function (sinks) { return sinks.routes; }),
	        events: utils_1.pluck(sinks$, function (sinks) { return sinks.events; }),
	        prevent: utils_1.pluck(sinks$, function (sinks) { return sinks.prevent; }),
	        registrations: utils_1.pluck(sinks$, function (sinks) { return sinks.registrations; }),
	        history: utils_1.pluck(sinks$, function (sinks) { return sinks.history; }),
	        material: utils_1.pluck(sinks$, function (sinks) { return sinks.material; })
	    };
	}
	exports.Layout = Layout;


/***/ },
/* 139 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var xstream_1 = __webpack_require__(12);
	var dom_1 = __webpack_require__(13);
	var nouns = ['experiences', 'ideas', 'opinions', 'perspectives'];
	var topics = ['technology', 'internet of things', 'cloud computing', 'arduino', 'databases'];
	function renderHeader(noun, topic) {
	    return dom_1.header([
	        dom_1.h1([
	            dom_1.span('.hidden', 'devday_'),
	            dom_1.img({ props: { src: 'images/logo.gif' } })
	        ]),
	        dom_1.h2([
	            'a monthly informal event for developers to share their ',
	            dom_1.span('.noun', noun),
	            ' about ',
	            dom_1.span('.topic', topic)
	        ])
	    ]);
	}
	function Header() {
	    var xs = xstream_1.Stream;
	    var noun$ = xs.periodic(1000)
	        .startWith(0)
	        .map(function (x) { return x % nouns.length; })
	        .map(function (i) { return nouns[i]; });
	    var topic$ = xs.periodic(3000)
	        .startWith(0)
	        .map(function (x) { return x % topics.length; })
	        .map(function (i) { return topics[i]; });
	    var vtree$ = xs.combine(noun$, topic$)
	        .map(function (_a) {
	        var noun = _a[0], topic = _a[1];
	        return renderHeader(noun, topic);
	    });
	    return {
	        dom: vtree$
	    };
	}
	exports.Header = Header;


/***/ },
/* 140 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var xstream_1 = __webpack_require__(12);
	var dom_1 = __webpack_require__(13);
	function Footer() {
	    var vtree$ = xstream_1.Stream.of(dom_1.footer([
	        dom_1.div('.left.section', [
	            dom_1.a('.twitter.social.button', {
	                props: {
	                    href: 'https://twitter.com/devday_',
	                    target: '_blank'
	                }
	            }, [
	                dom_1.span('.hidden', 'twitter')
	            ]),
	            dom_1.a('.facebook.social.button', {
	                props: {
	                    href: 'https://facebook.com/d3vday',
	                    target: '_blank'
	                }
	            }, [
	                dom_1.span('.hidden', 'facebook')
	            ])
	        ]),
	        dom_1.div('.right.section', [
	            dom_1.p([
	                '© 2016 - Organised by ',
	                dom_1.a('.sahaj.org.link', {
	                    props: {
	                        href: 'https://sahajsoft.com',
	                        target: '_blank'
	                    }
	                }, 'Sahaj Software Solutions')
	            ])
	        ])
	    ]));
	    return {
	        dom: vtree$
	    };
	}
	exports.Footer = Footer;


/***/ },
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var xstream_1 = __webpack_require__(12);
	var HashChangeProducer = (function () {
	    function HashChangeProducer() {
	        var _this = this;
	        this.start = function (listener) {
	            _this.stream = listener;
	            window.addEventListener('hashchange', _this.handler);
	        };
	        this.stop = function () {
	            window.removeEventListener('hashchange', _this.handler);
	            _this.stream = null;
	        };
	        this.stream = null;
	        this.handler = function (event) { return _this.stream.next(event); };
	    }
	    return HashChangeProducer;
	}());
	var RoutesSource = (function () {
	    function RoutesSource(route$) {
	        route$.addListener({
	            next: function (route) {
	                window.location.hash = "/" + route;
	            },
	            error: function () { },
	            complete: function () { }
	        });
	        var xs = xstream_1.Stream;
	        var hashChangeProducer = new HashChangeProducer();
	        var hashRoute$ = xs.create(hashChangeProducer)
	            .map(function (ev) { return ev.target.location.hash.replace('#/', ''); })
	            .startWith(window.location.hash.replace('#', '') || '');
	        this.route$ = hashRoute$;
	    }
	    return RoutesSource;
	}());
	exports.RoutesSource = RoutesSource;
	function makeRoutesDriver() {
	    function routesDriver(route$) {
	        return new RoutesSource(route$);
	    }
	    return routesDriver;
	}
	exports.makeRoutesDriver = makeRoutesDriver;
	exports.default = makeRoutesDriver;


/***/ },
/* 142 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var PreventSource = (function () {
	    function PreventSource(event$) {
	        var noop = function () { };
	        event$.addListener({
	            next: function (ev) {
	                ev.preventDefault();
	                ev.stopPropagation();
	            },
	            error: noop,
	            complete: noop
	        });
	    }
	    return PreventSource;
	}());
	exports.PreventSource = PreventSource;
	function makePreventDriver() {
	    function preventDriver(event$) {
	        return new PreventSource(event$);
	    }
	    return preventDriver;
	}
	exports.makePreventDriver = makePreventDriver;
	exports.default = makePreventDriver;


/***/ },
/* 143 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var xstream_1 = __webpack_require__(12);
	var http_1 = __webpack_require__(118);
	var RegistrationsSource = (function () {
	    function RegistrationsSource(registration$) {
	        var request$ = registration$.map(function (req) { return register(req.event, req.data); });
	        var http = http_1.makeHTTPDriver()(request$, 'resgistrationsHttp');
	        var response$$ = http.select('registrations');
	        this.registration$ =
	            response$$
	                .map(function (response$) { return response$.replaceError(function (error) { return xstream_1.default.of(null); }); })
	                .flatten()
	                .filter(Boolean)
	                .map(function (response) { return ({
	                event_url: response.request.send.event_url,
	                success: response.status === 200
	            }); })
	                .remember();
	    }
	    return RegistrationsSource;
	}());
	exports.RegistrationsSource = RegistrationsSource;
	function makeRegistrationsDriver() {
	    function registrationsDriver(registration$) {
	        return new RegistrationsSource(registration$);
	    }
	    return registrationsDriver;
	}
	exports.makeRegistrationsDriver = makeRegistrationsDriver;
	function register(event, data) {
	    var form = event.form;
	    if (form == undefined)
	        return null;
	    var payload = {
	        name: data.name,
	        email: data.email,
	        mobile: data.mobile,
	        spreadsheetId: form.spreadsheetId,
	        sheetName: form.sheetName,
	        event_url: event.url,
	        present: data.present,
	        title: data.title,
	        abstract: data.abstract
	    };
	    return {
	        url: '/register',
	        method: 'POST',
	        send: payload,
	        category: 'registrations',
	        type: 'application/x-www-form-urlencoded; charset=UTF-8'
	    };
	}


/***/ },
/* 144 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/**
	 * Wraps a History Driver to add "click capturing" functionality.
	 *
	 * If you want to intercept and handle any click event that leads to a link,
	 * like on an `<a>` element, you pass your existing driver (e.g. created from
	 * `makeHistoryDriver()`) as argument and this function will return another
	 * driver of the same nature, but including click capturing logic.
	 *
	 * @param {Function} driver an existing History Driver function.
	 * @return {Function} a History Driver function
	 * @function captureClicks
	 */
	var captureClicks_1 = __webpack_require__(145);
	exports.captureClicks = captureClicks_1.captureClicks;
	/**
	 * Create a History Driver to be used in the browser.
	 *
	 * This is a function which, when called, returns a History Driver for Cycle.js
	 * apps. The driver is also a function, and it takes a stream of new locations
	 * (strings representing pathnames or location objects) as input, and outputs
	 * another stream of locations that were applied.
	 *
	 * @param {object} options an object with some options specific to
	 * this driver. These options are the same as for the corresponding
	 * `createBrowserHistory()` function in History v4. Check its
	 * [docs](https://github.com/mjackson/history/tree/v4.5.1#usage) for a good
	 * description on the options.
	 * @return {Function} the History Driver function
	 * @function makeHistoryDriver
	 */
	var drivers_1 = __webpack_require__(146);
	exports.makeHistoryDriver = drivers_1.makeHistoryDriver;
	/**
	 * Create a History Driver for older browsers using hash routing.
	 *
	 * This is a function which, when called, returns a History Driver for Cycle.js
	 * apps. The driver is also a function, and it takes a stream of new locations
	 * (strings representing pathnames or location objects) as input, and outputs
	 * another stream of locations that were applied.
	 *
	 * @param {object} options an object with some options specific to
	 * this driver. These options are the same as for the corresponding
	 * `createHashHistory()` function in History v4. Check its
	 * [docs](https://github.com/mjackson/history/tree/v4.5.1#usage) for a good
	 * description on the options.
	 * @return {Function} the History Driver function
	 * @function makeHashHistoryDriver
	 */
	var drivers_2 = __webpack_require__(146);
	exports.makeHashHistoryDriver = drivers_2.makeHashHistoryDriver;
	/**
	 * Create a History Driver to be used in non-browser enviroments such as
	 * server-side Node.js.
	 *
	 * This is a function which, when called, returns a History Driver for Cycle.js
	 * apps. The driver is also a function, and it takes a stream of new locations
	 * (strings representing pathnames or location objects) as input, and outputs
	 * another stream of locations that were applied.
	 *
	 * @param {object} options an object with some options specific to
	 * this driver. These options are the same as for the corresponding
	 * `createMemoryHistory()` function in History v4. Check its
	 * [docs](https://github.com/mjackson/history/tree/v4.5.1#usage) for a good
	 * description on the options.
	 * @return {Function} the History Driver function
	 * @function makeHashHistoryDriver
	 */
	var drivers_3 = __webpack_require__(146);
	exports.makeServerHistoryDriver = drivers_3.makeServerHistoryDriver;
	//# sourceMappingURL=index.js.map

/***/ },
/* 145 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xstream_1 = __webpack_require__(12);
	var CLICK_EVENT = typeof document !== 'undefined' && document.ontouchstart ?
	    'touchstart' :
	    'click';
	function which(ev) {
	    if (typeof window === 'undefined') {
	        return false;
	    }
	    var e = ev || window.event;
	    return e.which === null ? e.button : e.which;
	}
	function sameOrigin(href) {
	    if (typeof window === 'undefined') {
	        return false;
	    }
	    return href && href.indexOf(window.location.origin) === 0;
	}
	function makeClickListener(push) {
	    return function clickListener(event) {
	        if (which(event) !== 1) {
	            return;
	        }
	        if (event.metaKey || event.ctrlKey || event.shiftKey) {
	            return;
	        }
	        if (event.defaultPrevented) {
	            return;
	        }
	        var element = event.target;
	        while (element && element.nodeName !== 'A') {
	            element = element.parentNode;
	        }
	        if (!element || element.nodeName !== 'A') {
	            return;
	        }
	        if (element.hasAttribute('download') ||
	            element.getAttribute('rel') === 'external') {
	            return;
	        }
	        if (element.target) {
	            return;
	        }
	        var link = element.getAttribute('href');
	        if (link && link.indexOf('mailto:') > -1 || link.charAt(0) === '#') {
	            return;
	        }
	        if (!sameOrigin(element.href)) {
	            return;
	        }
	        event.preventDefault();
	        var pathname = element.pathname, search = element.search, _a = element.hash, hash = _a === void 0 ? '' : _a;
	        push(pathname + search + hash);
	    };
	}
	function captureAnchorClicks(push) {
	    var listener = makeClickListener(push);
	    if (typeof window !== 'undefined') {
	        document.addEventListener(CLICK_EVENT, listener, false);
	    }
	}
	function captureClicks(historyDriver) {
	    return function historyDriverWithClickCapture(sink$) {
	        var internalSink$ = xstream_1.default.create();
	        captureAnchorClicks(function (pathname) {
	            internalSink$._n({ type: 'push', pathname: pathname });
	        });
	        sink$._add(internalSink$);
	        return historyDriver(internalSink$);
	    };
	}
	exports.captureClicks = captureClicks;
	//# sourceMappingURL=captureClicks.js.map

/***/ },
/* 146 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var history_1 = __webpack_require__(147);
	var createHistory_1 = __webpack_require__(161);
	function makeHistoryDriver(options) {
	    var history = history_1.createBrowserHistory(options);
	    return function historyDriver(sink$) {
	        return createHistory_1.createHistory$(history, sink$);
	    };
	}
	exports.makeHistoryDriver = makeHistoryDriver;
	function makeServerHistoryDriver(options) {
	    var history = history_1.createMemoryHistory(options);
	    return function serverHistoryDriver(sink$) {
	        return createHistory_1.createHistory$(history, sink$);
	    };
	}
	exports.makeServerHistoryDriver = makeServerHistoryDriver;
	function makeHashHistoryDriver(options) {
	    var history = history_1.createHashHistory(options);
	    return function hashHistoryDriver(sink$) {
	        return createHistory_1.createHistory$(history, sink$);
	    };
	}
	exports.makeHashHistoryDriver = makeHashHistoryDriver;
	//# sourceMappingURL=drivers.js.map

/***/ },
/* 147 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.createPath = exports.parsePath = exports.locationsAreEqual = exports.createLocation = exports.createMemoryHistory = exports.createHashHistory = exports.createBrowserHistory = undefined;
	
	var _LocationUtils = __webpack_require__(148);
	
	Object.defineProperty(exports, 'createLocation', {
	  enumerable: true,
	  get: function get() {
	    return _LocationUtils.createLocation;
	  }
	});
	Object.defineProperty(exports, 'locationsAreEqual', {
	  enumerable: true,
	  get: function get() {
	    return _LocationUtils.locationsAreEqual;
	  }
	});
	
	var _PathUtils = __webpack_require__(151);
	
	Object.defineProperty(exports, 'parsePath', {
	  enumerable: true,
	  get: function get() {
	    return _PathUtils.parsePath;
	  }
	});
	Object.defineProperty(exports, 'createPath', {
	  enumerable: true,
	  get: function get() {
	    return _PathUtils.createPath;
	  }
	});
	
	var _createBrowserHistory2 = __webpack_require__(152);
	
	var _createBrowserHistory3 = _interopRequireDefault(_createBrowserHistory2);
	
	var _createHashHistory2 = __webpack_require__(159);
	
	var _createHashHistory3 = _interopRequireDefault(_createHashHistory2);
	
	var _createMemoryHistory2 = __webpack_require__(160);
	
	var _createMemoryHistory3 = _interopRequireDefault(_createMemoryHistory2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.createBrowserHistory = _createBrowserHistory3.default;
	exports.createHashHistory = _createHashHistory3.default;
	exports.createMemoryHistory = _createMemoryHistory3.default;

/***/ },
/* 148 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.locationsAreEqual = exports.createLocation = undefined;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _resolvePathname = __webpack_require__(149);
	
	var _resolvePathname2 = _interopRequireDefault(_resolvePathname);
	
	var _valueEqual = __webpack_require__(150);
	
	var _valueEqual2 = _interopRequireDefault(_valueEqual);
	
	var _PathUtils = __webpack_require__(151);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var createLocation = exports.createLocation = function createLocation(path, state, key, currentLocation) {
	  var location = void 0;
	  if (typeof path === 'string') {
	    // Two-arg form: push(path, state)
	    location = (0, _PathUtils.parsePath)(path);
	    location.state = state;
	  } else {
	    // One-arg form: push(location)
	    location = _extends({}, path);
	
	    if (location.pathname === undefined) location.pathname = '';
	
	    if (location.search) {
	      if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
	    } else {
	      location.search = '';
	    }
	
	    if (location.hash) {
	      if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
	    } else {
	      location.hash = '';
	    }
	
	    if (state !== undefined && location.state === undefined) location.state = state;
	  }
	
	  location.key = key;
	
	  if (currentLocation) {
	    // Resolve incomplete/relative pathname relative to current location.
	    if (!location.pathname) {
	      location.pathname = currentLocation.pathname;
	    } else if (location.pathname.charAt(0) !== '/') {
	      location.pathname = (0, _resolvePathname2.default)(location.pathname, currentLocation.pathname);
	    }
	  }
	
	  return location;
	};
	
	var locationsAreEqual = exports.locationsAreEqual = function locationsAreEqual(a, b) {
	  return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash && a.key === b.key && (0, _valueEqual2.default)(a.state, b.state);
	};

/***/ },
/* 149 */
/***/ function(module, exports) {

	'use strict';
	
	var isAbsolute = function isAbsolute(pathname) {
	  return pathname.charAt(0) === '/';
	};
	
	// About 1.5x faster than the two-arg version of Array#splice()
	var spliceOne = function spliceOne(list, index) {
	  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
	    list[i] = list[k];
	  }list.pop();
	};
	
	// This implementation is based heavily on node's url.parse
	var resolvePathname = function resolvePathname(to) {
	  var from = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
	
	  var toParts = to && to.split('/') || [];
	  var fromParts = from && from.split('/') || [];
	
	  var isToAbs = to && isAbsolute(to);
	  var isFromAbs = from && isAbsolute(from);
	  var mustEndAbs = isToAbs || isFromAbs;
	
	  if (to && isAbsolute(to)) {
	    // to is absolute
	    fromParts = toParts;
	  } else if (toParts.length) {
	    // to is relative, drop the filename
	    fromParts.pop();
	    fromParts = fromParts.concat(toParts);
	  }
	
	  if (!fromParts.length) return '/';
	
	  var hasTrailingSlash = void 0;
	  if (fromParts.length) {
	    var last = fromParts[fromParts.length - 1];
	    hasTrailingSlash = last === '.' || last === '..' || last === '';
	  } else {
	    hasTrailingSlash = false;
	  }
	
	  var up = 0;
	  for (var i = fromParts.length; i >= 0; i--) {
	    var part = fromParts[i];
	
	    if (part === '.') {
	      spliceOne(fromParts, i);
	    } else if (part === '..') {
	      spliceOne(fromParts, i);
	      up++;
	    } else if (up) {
	      spliceOne(fromParts, i);
	      up--;
	    }
	  }
	
	  if (!mustEndAbs) for (; up--; up) {
	    fromParts.unshift('..');
	  }if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) fromParts.unshift('');
	
	  var result = fromParts.join('/');
	
	  if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';
	
	  return result;
	};
	
	module.exports = resolvePathname;

/***/ },
/* 150 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var valueEqual = function valueEqual(a, b) {
	  if (a === b) return true;
	
	  if (a == null || b == null) return false;
	
	  if (Array.isArray(a)) {
	    if (!Array.isArray(b) || a.length !== b.length) return false;
	
	    return a.every(function (item, index) {
	      return valueEqual(item, b[index]);
	    });
	  }
	
	  var aType = typeof a === 'undefined' ? 'undefined' : _typeof(a);
	  var bType = typeof b === 'undefined' ? 'undefined' : _typeof(b);
	
	  if (aType !== bType) return false;
	
	  if (aType === 'object') {
	    var aValue = a.valueOf();
	    var bValue = b.valueOf();
	
	    if (aValue !== a || bValue !== b) return valueEqual(aValue, bValue);
	
	    var aKeys = Object.keys(a);
	    var bKeys = Object.keys(b);
	
	    if (aKeys.length !== bKeys.length) return false;
	
	    return aKeys.every(function (key) {
	      return valueEqual(a[key], b[key]);
	    });
	  }
	
	  return false;
	};
	
	exports.default = valueEqual;

/***/ },
/* 151 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	var addLeadingSlash = exports.addLeadingSlash = function addLeadingSlash(path) {
	  return path.charAt(0) === '/' ? path : '/' + path;
	};
	
	var stripLeadingSlash = exports.stripLeadingSlash = function stripLeadingSlash(path) {
	  return path.charAt(0) === '/' ? path.substr(1) : path;
	};
	
	var stripPrefix = exports.stripPrefix = function stripPrefix(path, prefix) {
	  return path.indexOf(prefix) === 0 ? path.substr(prefix.length) : path;
	};
	
	var parsePath = exports.parsePath = function parsePath(path) {
	  var pathname = path || '/';
	  var search = '';
	  var hash = '';
	
	  var hashIndex = pathname.indexOf('#');
	  if (hashIndex !== -1) {
	    hash = pathname.substr(hashIndex);
	    pathname = pathname.substr(0, hashIndex);
	  }
	
	  var searchIndex = pathname.indexOf('?');
	  if (searchIndex !== -1) {
	    search = pathname.substr(searchIndex);
	    pathname = pathname.substr(0, searchIndex);
	  }
	
	  return {
	    pathname: pathname,
	    search: search === '?' ? '' : search,
	    hash: hash === '#' ? '' : hash
	  };
	};
	
	var createPath = exports.createPath = function createPath(location) {
	  var pathname = location.pathname,
	      search = location.search,
	      hash = location.hash;
	
	
	  var path = pathname || '/';
	
	  if (search && search !== '?') path += search.charAt(0) === '?' ? search : '?' + search;
	
	  if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : '#' + hash;
	
	  return path;
	};

/***/ },
/* 152 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	exports.__esModule = true;
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _warning = __webpack_require__(154);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	var _invariant = __webpack_require__(155);
	
	var _invariant2 = _interopRequireDefault(_invariant);
	
	var _LocationUtils = __webpack_require__(148);
	
	var _PathUtils = __webpack_require__(151);
	
	var _createTransitionManager = __webpack_require__(156);
	
	var _createTransitionManager2 = _interopRequireDefault(_createTransitionManager);
	
	var _ExecutionEnvironment = __webpack_require__(157);
	
	var _DOMUtils = __webpack_require__(158);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var PopStateEvent = 'popstate';
	var HashChangeEvent = 'hashchange';
	
	var getHistoryState = function getHistoryState() {
	  try {
	    return window.history.state || {};
	  } catch (e) {
	    // IE 11 sometimes throws when accessing window.history.state
	    // See https://github.com/mjackson/history/pull/289
	    return {};
	  }
	};
	
	/**
	 * Creates a history object that uses the HTML5 history API including
	 * pushState, replaceState, and the popstate event.
	 */
	var createBrowserHistory = function createBrowserHistory() {
	  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	
	  !_ExecutionEnvironment.canUseDOM ? process.env.NODE_ENV !== 'production' ? (0, _invariant2.default)(false, 'Browser history needs a DOM') : (0, _invariant2.default)(false) : void 0;
	
	  var globalHistory = window.history;
	  var canUseHistory = (0, _DOMUtils.supportsHistory)();
	  var needsHashChangeListener = !(0, _DOMUtils.supportsPopStateOnHashChange)();
	
	  var _props$basename = props.basename,
	      basename = _props$basename === undefined ? '' : _props$basename,
	      _props$forceRefresh = props.forceRefresh,
	      forceRefresh = _props$forceRefresh === undefined ? false : _props$forceRefresh,
	      _props$getUserConfirm = props.getUserConfirmation,
	      getUserConfirmation = _props$getUserConfirm === undefined ? _DOMUtils.getConfirmation : _props$getUserConfirm,
	      _props$keyLength = props.keyLength,
	      keyLength = _props$keyLength === undefined ? 6 : _props$keyLength;
	
	
	  var getDOMLocation = function getDOMLocation(historyState) {
	    var _ref = historyState || {},
	        key = _ref.key,
	        state = _ref.state;
	
	    var _window$location = window.location,
	        pathname = _window$location.pathname,
	        search = _window$location.search,
	        hash = _window$location.hash;
	
	
	    var path = pathname + search + hash;
	
	    if (basename) path = (0, _PathUtils.stripPrefix)(path, basename);
	
	    return _extends({}, (0, _PathUtils.parsePath)(path), {
	      state: state,
	      key: key
	    });
	  };
	
	  var createKey = function createKey() {
	    return Math.random().toString(36).substr(2, keyLength);
	  };
	
	  var transitionManager = (0, _createTransitionManager2.default)();
	
	  var setState = function setState(nextState) {
	    _extends(history, nextState);
	
	    history.length = globalHistory.length;
	
	    transitionManager.notifyListeners(history.location, history.action);
	  };
	
	  var handlePopState = function handlePopState(event) {
	    // Ignore extraneous popstate events in WebKit.
	    if ((0, _DOMUtils.isExtraneousPopstateEvent)(event)) return;
	
	    handlePop(getDOMLocation(event.state));
	  };
	
	  var handleHashChange = function handleHashChange() {
	    handlePop(getDOMLocation(getHistoryState()));
	  };
	
	  var forceNextPop = false;
	
	  var handlePop = function handlePop(location) {
	    if (forceNextPop) {
	      forceNextPop = false;
	      setState();
	    } else {
	      (function () {
	        var action = 'POP';
	
	        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
	          if (ok) {
	            setState({ action: action, location: location });
	          } else {
	            revertPop(location);
	          }
	        });
	      })();
	    }
	  };
	
	  var revertPop = function revertPop(fromLocation) {
	    var toLocation = history.location;
	
	    // TODO: We could probably make this more reliable by
	    // keeping a list of keys we've seen in sessionStorage.
	    // Instead, we just default to 0 for keys we don't know.
	
	    var toIndex = allKeys.indexOf(toLocation.key);
	
	    if (toIndex === -1) toIndex = 0;
	
	    var fromIndex = allKeys.indexOf(fromLocation.key);
	
	    if (fromIndex === -1) fromIndex = 0;
	
	    var delta = toIndex - fromIndex;
	
	    if (delta) {
	      forceNextPop = true;
	      go(delta);
	    }
	  };
	
	  var initialLocation = getDOMLocation(getHistoryState());
	  var allKeys = [initialLocation.key];
	
	  // Public interface
	
	  var createHref = function createHref(location) {
	    return basename + (0, _PathUtils.createPath)(location);
	  };
	
	  var push = function push(path, state) {
	    process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
	
	    var action = 'PUSH';
	    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);
	
	    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
	      if (!ok) return;
	
	      var href = createHref(location);
	      var key = location.key,
	          state = location.state;
	
	
	      if (canUseHistory) {
	        globalHistory.pushState({ key: key, state: state }, null, href);
	
	        if (forceRefresh) {
	          window.location.href = href;
	        } else {
	          var prevIndex = allKeys.indexOf(history.location.key);
	          var nextKeys = allKeys.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);
	
	          nextKeys.push(location.key);
	          allKeys = nextKeys;
	
	          setState({ action: action, location: location });
	        }
	      } else {
	        process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history') : void 0;
	
	        window.location.href = href;
	      }
	    });
	  };
	
	  var replace = function replace(path, state) {
	    process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
	
	    var action = 'REPLACE';
	    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);
	
	    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
	      if (!ok) return;
	
	      var href = createHref(location);
	      var key = location.key,
	          state = location.state;
	
	
	      if (canUseHistory) {
	        globalHistory.replaceState({ key: key, state: state }, null, href);
	
	        if (forceRefresh) {
	          window.location.replace(href);
	        } else {
	          var prevIndex = allKeys.indexOf(history.location.key);
	
	          if (prevIndex !== -1) allKeys[prevIndex] = location.key;
	
	          setState({ action: action, location: location });
	        }
	      } else {
	        process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history') : void 0;
	
	        window.location.replace(href);
	      }
	    });
	  };
	
	  var go = function go(n) {
	    globalHistory.go(n);
	  };
	
	  var goBack = function goBack() {
	    return go(-1);
	  };
	
	  var goForward = function goForward() {
	    return go(1);
	  };
	
	  var listenerCount = 0;
	
	  var checkDOMListeners = function checkDOMListeners(delta) {
	    listenerCount += delta;
	
	    if (listenerCount === 1) {
	      (0, _DOMUtils.addEventListener)(window, PopStateEvent, handlePopState);
	
	      if (needsHashChangeListener) (0, _DOMUtils.addEventListener)(window, HashChangeEvent, handleHashChange);
	    } else if (listenerCount === 0) {
	      (0, _DOMUtils.removeEventListener)(window, PopStateEvent, handlePopState);
	
	      if (needsHashChangeListener) (0, _DOMUtils.removeEventListener)(window, HashChangeEvent, handleHashChange);
	    }
	  };
	
	  var isBlocked = false;
	
	  var block = function block() {
	    var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
	
	    var unblock = transitionManager.setPrompt(prompt);
	
	    if (!isBlocked) {
	      checkDOMListeners(1);
	      isBlocked = true;
	    }
	
	    return function () {
	      if (isBlocked) {
	        isBlocked = false;
	        checkDOMListeners(-1);
	      }
	
	      return unblock();
	    };
	  };
	
	  var listen = function listen(listener) {
	    var unlisten = transitionManager.appendListener(listener);
	    checkDOMListeners(1);
	
	    return function () {
	      checkDOMListeners(-1);
	      return unlisten();
	    };
	  };
	
	  var history = {
	    length: globalHistory.length,
	    action: 'POP',
	    location: initialLocation,
	    createHref: createHref,
	    push: push,
	    replace: replace,
	    go: go,
	    goBack: goBack,
	    goForward: goForward,
	    block: block,
	    listen: listen
	  };
	
	  return history;
	};
	
	exports.default = createBrowserHistory;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(153)))

/***/ },
/* 153 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 154 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */
	
	'use strict';
	
	/**
	 * Similar to invariant but only logs a warning if the condition is not met.
	 * This can be used to log issues in development environments in critical
	 * paths. Removing the logging code for production environments will keep the
	 * same logic and follow the same code paths.
	 */
	
	var warning = function() {};
	
	if (process.env.NODE_ENV !== 'production') {
	  warning = function(condition, format, args) {
	    var len = arguments.length;
	    args = new Array(len > 2 ? len - 2 : 0);
	    for (var key = 2; key < len; key++) {
	      args[key - 2] = arguments[key];
	    }
	    if (format === undefined) {
	      throw new Error(
	        '`warning(condition, format, ...args)` requires a warning ' +
	        'message argument'
	      );
	    }
	
	    if (format.length < 10 || (/^[s\W]*$/).test(format)) {
	      throw new Error(
	        'The warning format should be able to uniquely identify this ' +
	        'warning. Please, use a more descriptive format than: ' + format
	      );
	    }
	
	    if (!condition) {
	      var argIndex = 0;
	      var message = 'Warning: ' +
	        format.replace(/%s/g, function() {
	          return args[argIndex++];
	        });
	      if (typeof console !== 'undefined') {
	        console.error(message);
	      }
	      try {
	        // This error was thrown as a convenience so that you can use this stack
	        // to find the callsite that caused this warning to fire.
	        throw new Error(message);
	      } catch(x) {}
	    }
	  };
	}
	
	module.exports = warning;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(153)))

/***/ },
/* 155 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */
	
	'use strict';
	
	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */
	
	var invariant = function(condition, format, a, b, c, d, e, f) {
	  if (process.env.NODE_ENV !== 'production') {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  }
	
	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error(
	        'Minified exception occurred; use the non-minified dev environment ' +
	        'for the full error message and additional helpful warnings.'
	      );
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(
	        format.replace(/%s/g, function() { return args[argIndex++]; })
	      );
	      error.name = 'Invariant Violation';
	    }
	
	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};
	
	module.exports = invariant;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(153)))

/***/ },
/* 156 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	exports.__esModule = true;
	
	var _warning = __webpack_require__(154);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var createTransitionManager = function createTransitionManager() {
	  var prompt = null;
	
	  var setPrompt = function setPrompt(nextPrompt) {
	    process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(prompt == null, 'A history supports only one prompt at a time') : void 0;
	
	    prompt = nextPrompt;
	
	    return function () {
	      if (prompt === nextPrompt) prompt = null;
	    };
	  };
	
	  var confirmTransitionTo = function confirmTransitionTo(location, action, getUserConfirmation, callback) {
	    // TODO: If another transition starts while we're still confirming
	    // the previous one, we may end up in a weird state. Figure out the
	    // best way to handle this.
	    if (prompt != null) {
	      var result = typeof prompt === 'function' ? prompt(location, action) : prompt;
	
	      if (typeof result === 'string') {
	        if (typeof getUserConfirmation === 'function') {
	          getUserConfirmation(result, callback);
	        } else {
	          process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(false, 'A history needs a getUserConfirmation function in order to use a prompt message') : void 0;
	
	          callback(true);
	        }
	      } else {
	        // Return false from a transition hook to cancel the transition.
	        callback(result !== false);
	      }
	    } else {
	      callback(true);
	    }
	  };
	
	  var listeners = [];
	
	  var appendListener = function appendListener(fn) {
	    var isActive = true;
	
	    var listener = function listener() {
	      if (isActive) fn.apply(undefined, arguments);
	    };
	
	    listeners.push(listener);
	
	    return function () {
	      isActive = false;
	      listeners = listeners.filter(function (item) {
	        return item !== listener;
	      });
	    };
	  };
	
	  var notifyListeners = function notifyListeners() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
	    listeners.forEach(function (listener) {
	      return listener.apply(undefined, args);
	    });
	  };
	
	  return {
	    setPrompt: setPrompt,
	    confirmTransitionTo: confirmTransitionTo,
	    appendListener: appendListener,
	    notifyListeners: notifyListeners
	  };
	};
	
	exports.default = createTransitionManager;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(153)))

/***/ },
/* 157 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	var canUseDOM = exports.canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

/***/ },
/* 158 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	var addEventListener = exports.addEventListener = function addEventListener(node, event, listener) {
	  return node.addEventListener ? node.addEventListener(event, listener, false) : node.attachEvent('on' + event, listener);
	};
	
	var removeEventListener = exports.removeEventListener = function removeEventListener(node, event, listener) {
	  return node.removeEventListener ? node.removeEventListener(event, listener, false) : node.detachEvent('on' + event, listener);
	};
	
	var getConfirmation = exports.getConfirmation = function getConfirmation(message, callback) {
	  return callback(window.confirm(message));
	}; // eslint-disable-line no-alert
	
	/**
	 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
	 *
	 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
	 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
	 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
	 */
	var supportsHistory = exports.supportsHistory = function supportsHistory() {
	  var ua = window.navigator.userAgent;
	
	  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;
	
	  return window.history && 'pushState' in window.history;
	};
	
	/**
	 * Returns true if browser fires popstate on hash change.
	 * IE10 and IE11 do not.
	 */
	var supportsPopStateOnHashChange = exports.supportsPopStateOnHashChange = function supportsPopStateOnHashChange() {
	  return window.navigator.userAgent.indexOf('Trident') === -1;
	};
	
	/**
	 * Returns false if using go(n) with hash history causes a full page reload.
	 */
	var supportsGoWithoutReloadUsingHash = exports.supportsGoWithoutReloadUsingHash = function supportsGoWithoutReloadUsingHash() {
	  return window.navigator.userAgent.indexOf('Firefox') === -1;
	};
	
	/**
	 * Returns true if a given popstate event is an extraneous WebKit event.
	 * Accounts for the fact that Chrome on iOS fires real popstate events
	 * containing undefined state when pressing the back button.
	 */
	var isExtraneousPopstateEvent = exports.isExtraneousPopstateEvent = function isExtraneousPopstateEvent(event) {
	  return event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
	};

/***/ },
/* 159 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _warning = __webpack_require__(154);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	var _invariant = __webpack_require__(155);
	
	var _invariant2 = _interopRequireDefault(_invariant);
	
	var _LocationUtils = __webpack_require__(148);
	
	var _PathUtils = __webpack_require__(151);
	
	var _createTransitionManager = __webpack_require__(156);
	
	var _createTransitionManager2 = _interopRequireDefault(_createTransitionManager);
	
	var _ExecutionEnvironment = __webpack_require__(157);
	
	var _DOMUtils = __webpack_require__(158);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var HashChangeEvent = 'hashchange';
	
	var HashPathCoders = {
	  hashbang: {
	    encodePath: function encodePath(path) {
	      return path.charAt(0) === '!' ? path : '!/' + (0, _PathUtils.stripLeadingSlash)(path);
	    },
	    decodePath: function decodePath(path) {
	      return path.charAt(0) === '!' ? path.substr(1) : path;
	    }
	  },
	  noslash: {
	    encodePath: _PathUtils.stripLeadingSlash,
	    decodePath: _PathUtils.addLeadingSlash
	  },
	  slash: {
	    encodePath: _PathUtils.addLeadingSlash,
	    decodePath: _PathUtils.addLeadingSlash
	  }
	};
	
	var getHashPath = function getHashPath() {
	  // We can't use window.location.hash here because it's not
	  // consistent across browsers - Firefox will pre-decode it!
	  var href = window.location.href;
	  var hashIndex = href.indexOf('#');
	  return hashIndex === -1 ? '' : href.substring(hashIndex + 1);
	};
	
	var pushHashPath = function pushHashPath(path) {
	  return window.location.hash = path;
	};
	
	var replaceHashPath = function replaceHashPath(path) {
	  var hashIndex = window.location.href.indexOf('#');
	
	  window.location.replace(window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path);
	};
	
	var createHashHistory = function createHashHistory() {
	  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	
	  !_ExecutionEnvironment.canUseDOM ? process.env.NODE_ENV !== 'production' ? (0, _invariant2.default)(false, 'Hash history needs a DOM') : (0, _invariant2.default)(false) : void 0;
	
	  var globalHistory = window.history;
	  var canGoWithoutReload = (0, _DOMUtils.supportsGoWithoutReloadUsingHash)();
	
	  var _props$basename = props.basename,
	      basename = _props$basename === undefined ? '' : _props$basename,
	      _props$getUserConfirm = props.getUserConfirmation,
	      getUserConfirmation = _props$getUserConfirm === undefined ? _DOMUtils.getConfirmation : _props$getUserConfirm,
	      _props$hashType = props.hashType,
	      hashType = _props$hashType === undefined ? 'slash' : _props$hashType;
	  var _HashPathCoders$hashT = HashPathCoders[hashType],
	      encodePath = _HashPathCoders$hashT.encodePath,
	      decodePath = _HashPathCoders$hashT.decodePath;
	
	
	  var getDOMLocation = function getDOMLocation() {
	    var path = decodePath(getHashPath());
	
	    if (basename) path = (0, _PathUtils.stripPrefix)(path, basename);
	
	    return (0, _PathUtils.parsePath)(path);
	  };
	
	  var transitionManager = (0, _createTransitionManager2.default)();
	
	  var setState = function setState(nextState) {
	    _extends(history, nextState);
	
	    history.length = globalHistory.length;
	
	    transitionManager.notifyListeners(history.location, history.action);
	  };
	
	  var forceNextPop = false;
	  var ignorePath = null;
	
	  var handleHashChange = function handleHashChange() {
	    var path = getHashPath();
	    var encodedPath = encodePath(path);
	
	    if (path !== encodedPath) {
	      // Ensure we always have a properly-encoded hash.
	      replaceHashPath(encodedPath);
	    } else {
	      var location = getDOMLocation();
	      var prevLocation = history.location;
	
	      if (!forceNextPop && (0, _LocationUtils.locationsAreEqual)(prevLocation, location)) return; // A hashchange doesn't always == location change.
	
	      if (ignorePath === (0, _PathUtils.createPath)(location)) return; // Ignore this change; we already setState in push/replace.
	
	      ignorePath = null;
	
	      handlePop(location);
	    }
	  };
	
	  var handlePop = function handlePop(location) {
	    if (forceNextPop) {
	      forceNextPop = false;
	      setState();
	    } else {
	      (function () {
	        var action = 'POP';
	
	        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
	          if (ok) {
	            setState({ action: action, location: location });
	          } else {
	            revertPop(location);
	          }
	        });
	      })();
	    }
	  };
	
	  var revertPop = function revertPop(fromLocation) {
	    var toLocation = history.location;
	
	    // TODO: We could probably make this more reliable by
	    // keeping a list of paths we've seen in sessionStorage.
	    // Instead, we just default to 0 for paths we don't know.
	
	    var toIndex = allPaths.lastIndexOf((0, _PathUtils.createPath)(toLocation));
	
	    if (toIndex === -1) toIndex = 0;
	
	    var fromIndex = allPaths.lastIndexOf((0, _PathUtils.createPath)(fromLocation));
	
	    if (fromIndex === -1) fromIndex = 0;
	
	    var delta = toIndex - fromIndex;
	
	    if (delta) {
	      forceNextPop = true;
	      go(delta);
	    }
	  };
	
	  // Ensure the hash is encoded properly before doing anything else.
	  var path = getHashPath();
	  var encodedPath = encodePath(path);
	
	  if (path !== encodedPath) replaceHashPath(encodedPath);
	
	  var initialLocation = getDOMLocation();
	  var allPaths = [(0, _PathUtils.createPath)(initialLocation)];
	
	  // Public interface
	
	  var createHref = function createHref(location) {
	    return '#' + encodePath(basename + (0, _PathUtils.createPath)(location));
	  };
	
	  var push = function push(path, state) {
	    process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(state === undefined, 'Hash history cannot push state; it is ignored') : void 0;
	
	    var action = 'PUSH';
	    var location = (0, _LocationUtils.createLocation)(path, undefined, undefined, history.location);
	
	    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
	      if (!ok) return;
	
	      var path = (0, _PathUtils.createPath)(location);
	      var encodedPath = encodePath(basename + path);
	      var hashChanged = getHashPath() !== encodedPath;
	
	      if (hashChanged) {
	        // We cannot tell if a hashchange was caused by a PUSH, so we'd
	        // rather setState here and ignore the hashchange. The caveat here
	        // is that other hash histories in the page will consider it a POP.
	        ignorePath = path;
	        pushHashPath(encodedPath);
	
	        var prevIndex = allPaths.lastIndexOf((0, _PathUtils.createPath)(history.location));
	        var nextPaths = allPaths.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);
	
	        nextPaths.push(path);
	        allPaths = nextPaths;
	
	        setState({ action: action, location: location });
	      } else {
	        process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(false, 'Hash history cannot PUSH the same path; a new entry will not be added to the history stack') : void 0;
	
	        setState();
	      }
	    });
	  };
	
	  var replace = function replace(path, state) {
	    process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(state === undefined, 'Hash history cannot replace state; it is ignored') : void 0;
	
	    var action = 'REPLACE';
	    var location = (0, _LocationUtils.createLocation)(path, undefined, undefined, history.location);
	
	    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
	      if (!ok) return;
	
	      var path = (0, _PathUtils.createPath)(location);
	      var encodedPath = encodePath(basename + path);
	      var hashChanged = getHashPath() !== encodedPath;
	
	      if (hashChanged) {
	        // We cannot tell if a hashchange was caused by a REPLACE, so we'd
	        // rather setState here and ignore the hashchange. The caveat here
	        // is that other hash histories in the page will consider it a POP.
	        ignorePath = path;
	        replaceHashPath(encodedPath);
	      }
	
	      var prevIndex = allPaths.indexOf((0, _PathUtils.createPath)(history.location));
	
	      if (prevIndex !== -1) allPaths[prevIndex] = path;
	
	      setState({ action: action, location: location });
	    });
	  };
	
	  var go = function go(n) {
	    process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(canGoWithoutReload, 'Hash history go(n) causes a full page reload in this browser') : void 0;
	
	    globalHistory.go(n);
	  };
	
	  var goBack = function goBack() {
	    return go(-1);
	  };
	
	  var goForward = function goForward() {
	    return go(1);
	  };
	
	  var listenerCount = 0;
	
	  var checkDOMListeners = function checkDOMListeners(delta) {
	    listenerCount += delta;
	
	    if (listenerCount === 1) {
	      (0, _DOMUtils.addEventListener)(window, HashChangeEvent, handleHashChange);
	    } else if (listenerCount === 0) {
	      (0, _DOMUtils.removeEventListener)(window, HashChangeEvent, handleHashChange);
	    }
	  };
	
	  var isBlocked = false;
	
	  var block = function block() {
	    var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
	
	    var unblock = transitionManager.setPrompt(prompt);
	
	    if (!isBlocked) {
	      checkDOMListeners(1);
	      isBlocked = true;
	    }
	
	    return function () {
	      if (isBlocked) {
	        isBlocked = false;
	        checkDOMListeners(-1);
	      }
	
	      return unblock();
	    };
	  };
	
	  var listen = function listen(listener) {
	    var unlisten = transitionManager.appendListener(listener);
	    checkDOMListeners(1);
	
	    return function () {
	      checkDOMListeners(-1);
	      return unlisten();
	    };
	  };
	
	  var history = {
	    length: globalHistory.length,
	    action: 'POP',
	    location: initialLocation,
	    createHref: createHref,
	    push: push,
	    replace: replace,
	    go: go,
	    goBack: goBack,
	    goForward: goForward,
	    block: block,
	    listen: listen
	  };
	
	  return history;
	};
	
	exports.default = createHashHistory;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(153)))

/***/ },
/* 160 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	exports.__esModule = true;
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _warning = __webpack_require__(154);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	var _PathUtils = __webpack_require__(151);
	
	var _LocationUtils = __webpack_require__(148);
	
	var _createTransitionManager = __webpack_require__(156);
	
	var _createTransitionManager2 = _interopRequireDefault(_createTransitionManager);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var clamp = function clamp(n, lowerBound, upperBound) {
	  return Math.min(Math.max(n, lowerBound), upperBound);
	};
	
	/**
	 * Creates a history object that stores locations in memory.
	 */
	var createMemoryHistory = function createMemoryHistory() {
	  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  var getUserConfirmation = props.getUserConfirmation,
	      _props$initialEntries = props.initialEntries,
	      initialEntries = _props$initialEntries === undefined ? ['/'] : _props$initialEntries,
	      _props$initialIndex = props.initialIndex,
	      initialIndex = _props$initialIndex === undefined ? 0 : _props$initialIndex,
	      _props$keyLength = props.keyLength,
	      keyLength = _props$keyLength === undefined ? 6 : _props$keyLength;
	
	
	  var transitionManager = (0, _createTransitionManager2.default)();
	
	  var setState = function setState(nextState) {
	    _extends(history, nextState);
	
	    history.length = history.entries.length;
	
	    transitionManager.notifyListeners(history.location, history.action);
	  };
	
	  var createKey = function createKey() {
	    return Math.random().toString(36).substr(2, keyLength);
	  };
	
	  var index = clamp(initialIndex, 0, initialEntries.length - 1);
	  var entries = initialEntries.map(function (entry, index) {
	    return typeof entry === 'string' ? (0, _LocationUtils.createLocation)(entry, undefined, index ? createKey() : undefined) : (0, _LocationUtils.createLocation)(entry, undefined, index ? entry.key || createKey() : undefined);
	  });
	
	  // Public interface
	
	  var createHref = _PathUtils.createPath;
	
	  var push = function push(path, state) {
	    process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
	
	    var action = 'PUSH';
	    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);
	
	    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
	      if (!ok) return;
	
	      var prevIndex = history.index;
	      var nextIndex = prevIndex + 1;
	
	      var nextEntries = history.entries.slice(0);
	      if (nextEntries.length > nextIndex) {
	        nextEntries.splice(nextIndex, nextEntries.length - nextIndex, location);
	      } else {
	        nextEntries.push(location);
	      }
	
	      setState({
	        action: action,
	        location: location,
	        index: nextIndex,
	        entries: nextEntries
	      });
	    });
	  };
	
	  var replace = function replace(path, state) {
	    process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
	
	    var action = 'REPLACE';
	    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);
	
	    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
	      if (!ok) return;
	
	      history.entries[history.index] = location;
	
	      setState({ action: action, location: location });
	    });
	  };
	
	  var go = function go(n) {
	    var nextIndex = clamp(history.index + n, 0, history.entries.length - 1);
	
	    var action = 'POP';
	    var location = history.entries[nextIndex];
	
	    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
	      if (ok) {
	        setState({
	          action: action,
	          location: location,
	          index: nextIndex
	        });
	      } else {
	        // Mimic the behavior of DOM histories by
	        // causing a render after a cancelled POP.
	        setState();
	      }
	    });
	  };
	
	  var goBack = function goBack() {
	    return go(-1);
	  };
	
	  var goForward = function goForward() {
	    return go(1);
	  };
	
	  var canGo = function canGo(n) {
	    var nextIndex = history.index + n;
	    return nextIndex >= 0 && nextIndex < history.entries.length;
	  };
	
	  var block = function block() {
	    var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
	    return transitionManager.setPrompt(prompt);
	  };
	
	  var listen = function listen(listener) {
	    return transitionManager.appendListener(listener);
	  };
	
	  var history = {
	    length: entries.length,
	    action: 'POP',
	    location: entries[index],
	    index: index,
	    entries: entries,
	    createHref: createHref,
	    push: push,
	    replace: replace,
	    go: go,
	    goBack: goBack,
	    goForward: goForward,
	    canGo: canGo,
	    block: block,
	    listen: listen
	  };
	
	  return history;
	};
	
	exports.default = createMemoryHistory;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(153)))

/***/ },
/* 161 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xstream_1 = __webpack_require__(12);
	function createHistory$(history, sink$) {
	    var history$ = xstream_1.default.createWithMemory().startWith(history.location);
	    var call = makeCallOnHistory(history);
	    var unlisten = history.listen(function (loc) { history$._n(loc); });
	    var sub = sink$.subscribe(createObserver(call, unlisten));
	    history$.dispose = function () { sub.unsubscribe(); unlisten(); };
	    return history$;
	}
	exports.createHistory$ = createHistory$;
	;
	function makeCallOnHistory(history) {
	    return function call(input) {
	        if (input.type === 'push') {
	            history.push(input.pathname, input.state);
	        }
	        if (input.type === 'replace') {
	            history.replace(input.pathname, input.state);
	        }
	        if (input.type === 'go') {
	            history.go(input.amount);
	        }
	        if (input.type === 'goBack') {
	            history.goBack();
	        }
	        if (input.type === 'goForward') {
	            history.goForward();
	        }
	    };
	}
	function createObserver(call, unlisten) {
	    return {
	        next: function (input) {
	            if (typeof input === 'string') {
	                call({ type: 'push', pathname: input });
	            }
	            else {
	                call(input);
	            }
	        },
	        error: function (err) { unlisten(); },
	        complete: function () { setTimeout(unlisten); },
	    };
	}
	//# sourceMappingURL=createHistory$.js.map

/***/ },
/* 162 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var MaterialSource = (function () {
	    function MaterialSource(refresh$) {
	        var noop = function () { };
	        refresh$.addListener({
	            next: function () { return window.componentHandler.upgradeDom(); },
	            error: noop,
	            complete: noop
	        });
	    }
	    return MaterialSource;
	}());
	exports.MaterialSource = MaterialSource;
	function makeMaterialDriver() {
	    function materialDriver(request$) {
	        return new MaterialSource(request$);
	    }
	    return materialDriver;
	}
	exports.makeMaterialDriver = makeMaterialDriver;
	exports.default = makeMaterialDriver;


/***/ }
/******/ ]);
//# sourceMappingURL=app.js.map