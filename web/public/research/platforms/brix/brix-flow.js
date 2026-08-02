function id(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var ld = { exports: {} }, xl = {}, sd = { exports: {} }, q = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Xo = Symbol.for("react.element"), k0 = Symbol.for("react.portal"), N0 = Symbol.for("react.fragment"), C0 = Symbol.for("react.strict_mode"), M0 = Symbol.for("react.profiler"), z0 = Symbol.for("react.provider"), T0 = Symbol.for("react.context"), P0 = Symbol.for("react.forward_ref"), $0 = Symbol.for("react.suspense"), R0 = Symbol.for("react.memo"), A0 = Symbol.for("react.lazy"), tc = Symbol.iterator;
function I0(e) {
  return e === null || typeof e != "object" ? null : (e = tc && e[tc] || e["@@iterator"], typeof e == "function" ? e : null);
}
var ud = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, ad = Object.assign, cd = {};
function Or(e, t, n) {
  this.props = e, this.context = t, this.refs = cd, this.updater = n || ud;
}
Or.prototype.isReactComponent = {};
Or.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
Or.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function fd() {
}
fd.prototype = Or.prototype;
function Vu(e, t, n) {
  this.props = e, this.context = t, this.refs = cd, this.updater = n || ud;
}
var Bu = Vu.prototype = new fd();
Bu.constructor = Vu;
ad(Bu, Or.prototype);
Bu.isPureReactComponent = !0;
var nc = Array.isArray, dd = Object.prototype.hasOwnProperty, Uu = { current: null }, pd = { key: !0, ref: !0, __self: !0, __source: !0 };
function hd(e, t, n) {
  var r, o = {}, i = null, l = null;
  if (t != null) for (r in t.ref !== void 0 && (l = t.ref), t.key !== void 0 && (i = "" + t.key), t) dd.call(t, r) && !pd.hasOwnProperty(r) && (o[r] = t[r]);
  var s = arguments.length - 2;
  if (s === 1) o.children = n;
  else if (1 < s) {
    for (var u = Array(s), a = 0; a < s; a++) u[a] = arguments[a + 2];
    o.children = u;
  }
  if (e && e.defaultProps) for (r in s = e.defaultProps, s) o[r] === void 0 && (o[r] = s[r]);
  return { $$typeof: Xo, type: e, key: i, ref: l, props: o, _owner: Uu.current };
}
function D0(e, t) {
  return { $$typeof: Xo, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function ju(e) {
  return typeof e == "object" && e !== null && e.$$typeof === Xo;
}
function L0(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var rc = /\/+/g;
function Ql(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? L0("" + e.key) : t.toString(36);
}
function Ci(e, t, n, r, o) {
  var i = typeof e;
  (i === "undefined" || i === "boolean") && (e = null);
  var l = !1;
  if (e === null) l = !0;
  else switch (i) {
    case "string":
    case "number":
      l = !0;
      break;
    case "object":
      switch (e.$$typeof) {
        case Xo:
        case k0:
          l = !0;
      }
  }
  if (l) return l = e, o = o(l), e = r === "" ? "." + Ql(l, 0) : r, nc(o) ? (n = "", e != null && (n = e.replace(rc, "$&/") + "/"), Ci(o, t, n, "", function(a) {
    return a;
  })) : o != null && (ju(o) && (o = D0(o, n + (!o.key || l && l.key === o.key ? "" : ("" + o.key).replace(rc, "$&/") + "/") + e)), t.push(o)), 1;
  if (l = 0, r = r === "" ? "." : r + ":", nc(e)) for (var s = 0; s < e.length; s++) {
    i = e[s];
    var u = r + Ql(i, s);
    l += Ci(i, t, n, u, o);
  }
  else if (u = I0(e), typeof u == "function") for (e = u.call(e), s = 0; !(i = e.next()).done; ) i = i.value, u = r + Ql(i, s++), l += Ci(i, t, n, u, o);
  else if (i === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return l;
}
function ei(e, t, n) {
  if (e == null) return e;
  var r = [], o = 0;
  return Ci(e, r, "", "", function(i) {
    return t.call(n, i, o++);
  }), r;
}
function O0(e) {
  if (e._status === -1) {
    var t = e._result;
    t = t(), t.then(function(n) {
      (e._status === 0 || e._status === -1) && (e._status = 1, e._result = n);
    }, function(n) {
      (e._status === 0 || e._status === -1) && (e._status = 2, e._result = n);
    }), e._status === -1 && (e._status = 0, e._result = t);
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var Ve = { current: null }, Mi = { transition: null }, F0 = { ReactCurrentDispatcher: Ve, ReactCurrentBatchConfig: Mi, ReactCurrentOwner: Uu };
function md() {
  throw Error("act(...) is not supported in production builds of React.");
}
q.Children = { map: ei, forEach: function(e, t, n) {
  ei(e, function() {
    t.apply(this, arguments);
  }, n);
}, count: function(e) {
  var t = 0;
  return ei(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return ei(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!ju(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
q.Component = Or;
q.Fragment = N0;
q.Profiler = M0;
q.PureComponent = Vu;
q.StrictMode = C0;
q.Suspense = $0;
q.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = F0;
q.act = md;
q.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = ad({}, e.props), o = e.key, i = e.ref, l = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (i = t.ref, l = Uu.current), t.key !== void 0 && (o = "" + t.key), e.type && e.type.defaultProps) var s = e.type.defaultProps;
    for (u in t) dd.call(t, u) && !pd.hasOwnProperty(u) && (r[u] = t[u] === void 0 && s !== void 0 ? s[u] : t[u]);
  }
  var u = arguments.length - 2;
  if (u === 1) r.children = n;
  else if (1 < u) {
    s = Array(u);
    for (var a = 0; a < u; a++) s[a] = arguments[a + 2];
    r.children = s;
  }
  return { $$typeof: Xo, type: e.type, key: o, ref: i, props: r, _owner: l };
};
q.createContext = function(e) {
  return e = { $$typeof: T0, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: z0, _context: e }, e.Consumer = e;
};
q.createElement = hd;
q.createFactory = function(e) {
  var t = hd.bind(null, e);
  return t.type = e, t;
};
q.createRef = function() {
  return { current: null };
};
q.forwardRef = function(e) {
  return { $$typeof: P0, render: e };
};
q.isValidElement = ju;
q.lazy = function(e) {
  return { $$typeof: A0, _payload: { _status: -1, _result: e }, _init: O0 };
};
q.memo = function(e, t) {
  return { $$typeof: R0, type: e, compare: t === void 0 ? null : t };
};
q.startTransition = function(e) {
  var t = Mi.transition;
  Mi.transition = {};
  try {
    e();
  } finally {
    Mi.transition = t;
  }
};
q.unstable_act = md;
q.useCallback = function(e, t) {
  return Ve.current.useCallback(e, t);
};
q.useContext = function(e) {
  return Ve.current.useContext(e);
};
q.useDebugValue = function() {
};
q.useDeferredValue = function(e) {
  return Ve.current.useDeferredValue(e);
};
q.useEffect = function(e, t) {
  return Ve.current.useEffect(e, t);
};
q.useId = function() {
  return Ve.current.useId();
};
q.useImperativeHandle = function(e, t, n) {
  return Ve.current.useImperativeHandle(e, t, n);
};
q.useInsertionEffect = function(e, t) {
  return Ve.current.useInsertionEffect(e, t);
};
q.useLayoutEffect = function(e, t) {
  return Ve.current.useLayoutEffect(e, t);
};
q.useMemo = function(e, t) {
  return Ve.current.useMemo(e, t);
};
q.useReducer = function(e, t, n) {
  return Ve.current.useReducer(e, t, n);
};
q.useRef = function(e) {
  return Ve.current.useRef(e);
};
q.useState = function(e) {
  return Ve.current.useState(e);
};
q.useSyncExternalStore = function(e, t, n) {
  return Ve.current.useSyncExternalStore(e, t, n);
};
q.useTransition = function() {
  return Ve.current.useTransition();
};
q.version = "18.3.1";
sd.exports = q;
var T = sd.exports;
const R = /* @__PURE__ */ id(T);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var H0 = T, V0 = Symbol.for("react.element"), B0 = Symbol.for("react.fragment"), U0 = Object.prototype.hasOwnProperty, j0 = H0.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, W0 = { key: !0, ref: !0, __self: !0, __source: !0 };
function gd(e, t, n) {
  var r, o = {}, i = null, l = null;
  n !== void 0 && (i = "" + n), t.key !== void 0 && (i = "" + t.key), t.ref !== void 0 && (l = t.ref);
  for (r in t) U0.call(t, r) && !W0.hasOwnProperty(r) && (o[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) o[r] === void 0 && (o[r] = t[r]);
  return { $$typeof: V0, type: e, key: i, ref: l, props: o, _owner: j0.current };
}
xl.Fragment = B0;
xl.jsx = gd;
xl.jsxs = gd;
ld.exports = xl;
var J = ld.exports, yd = { exports: {} }, et = {}, vd = { exports: {} }, wd = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function(e) {
  function t(N, S) {
    var z = N.length;
    N.push(S);
    e: for (; 0 < z; ) {
      var D = z - 1 >>> 1, O = N[D];
      if (0 < o(O, S)) N[D] = S, N[z] = O, z = D;
      else break e;
    }
  }
  function n(N) {
    return N.length === 0 ? null : N[0];
  }
  function r(N) {
    if (N.length === 0) return null;
    var S = N[0], z = N.pop();
    if (z !== S) {
      N[0] = z;
      e: for (var D = 0, O = N.length, j = O >>> 1; D < j; ) {
        var U = 2 * (D + 1) - 1, Y = N[U], K = U + 1, G = N[K];
        if (0 > o(Y, z)) K < O && 0 > o(G, Y) ? (N[D] = G, N[K] = z, D = K) : (N[D] = Y, N[U] = z, D = U);
        else if (K < O && 0 > o(G, z)) N[D] = G, N[K] = z, D = K;
        else break e;
      }
    }
    return S;
  }
  function o(N, S) {
    var z = N.sortIndex - S.sortIndex;
    return z !== 0 ? z : N.id - S.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var i = performance;
    e.unstable_now = function() {
      return i.now();
    };
  } else {
    var l = Date, s = l.now();
    e.unstable_now = function() {
      return l.now() - s;
    };
  }
  var u = [], a = [], c = 1, f = null, d = 3, m = !1, x = !1, w = !1, _ = typeof setTimeout == "function" ? setTimeout : null, p = typeof clearTimeout == "function" ? clearTimeout : null, h = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function g(N) {
    for (var S = n(a); S !== null; ) {
      if (S.callback === null) r(a);
      else if (S.startTime <= N) r(a), S.sortIndex = S.expirationTime, t(u, S);
      else break;
      S = n(a);
    }
  }
  function y(N) {
    if (w = !1, g(N), !x) if (n(u) !== null) x = !0, k(E);
    else {
      var S = n(a);
      S !== null && L(y, S.startTime - N);
    }
  }
  function E(N, S) {
    x = !1, w && (w = !1, p(P), P = -1), m = !0;
    var z = d;
    try {
      for (g(S), f = n(u); f !== null && (!(f.expirationTime > S) || N && !F()); ) {
        var D = f.callback;
        if (typeof D == "function") {
          f.callback = null, d = f.priorityLevel;
          var O = D(f.expirationTime <= S);
          S = e.unstable_now(), typeof O == "function" ? f.callback = O : f === n(u) && r(u), g(S);
        } else r(u);
        f = n(u);
      }
      if (f !== null) var j = !0;
      else {
        var U = n(a);
        U !== null && L(y, U.startTime - S), j = !1;
      }
      return j;
    } finally {
      f = null, d = z, m = !1;
    }
  }
  var C = !1, M = null, P = -1, A = 5, I = -1;
  function F() {
    return !(e.unstable_now() - I < A);
  }
  function B() {
    if (M !== null) {
      var N = e.unstable_now();
      I = N;
      var S = !0;
      try {
        S = M(!0, N);
      } finally {
        S ? V() : (C = !1, M = null);
      }
    } else C = !1;
  }
  var V;
  if (typeof h == "function") V = function() {
    h(B);
  };
  else if (typeof MessageChannel < "u") {
    var v = new MessageChannel(), $ = v.port2;
    v.port1.onmessage = B, V = function() {
      $.postMessage(null);
    };
  } else V = function() {
    _(B, 0);
  };
  function k(N) {
    M = N, C || (C = !0, V());
  }
  function L(N, S) {
    P = _(function() {
      N(e.unstable_now());
    }, S);
  }
  e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(N) {
    N.callback = null;
  }, e.unstable_continueExecution = function() {
    x || m || (x = !0, k(E));
  }, e.unstable_forceFrameRate = function(N) {
    0 > N || 125 < N ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : A = 0 < N ? Math.floor(1e3 / N) : 5;
  }, e.unstable_getCurrentPriorityLevel = function() {
    return d;
  }, e.unstable_getFirstCallbackNode = function() {
    return n(u);
  }, e.unstable_next = function(N) {
    switch (d) {
      case 1:
      case 2:
      case 3:
        var S = 3;
        break;
      default:
        S = d;
    }
    var z = d;
    d = S;
    try {
      return N();
    } finally {
      d = z;
    }
  }, e.unstable_pauseExecution = function() {
  }, e.unstable_requestPaint = function() {
  }, e.unstable_runWithPriority = function(N, S) {
    switch (N) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        N = 3;
    }
    var z = d;
    d = N;
    try {
      return S();
    } finally {
      d = z;
    }
  }, e.unstable_scheduleCallback = function(N, S, z) {
    var D = e.unstable_now();
    switch (typeof z == "object" && z !== null ? (z = z.delay, z = typeof z == "number" && 0 < z ? D + z : D) : z = D, N) {
      case 1:
        var O = -1;
        break;
      case 2:
        O = 250;
        break;
      case 5:
        O = 1073741823;
        break;
      case 4:
        O = 1e4;
        break;
      default:
        O = 5e3;
    }
    return O = z + O, N = { id: c++, callback: S, priorityLevel: N, startTime: z, expirationTime: O, sortIndex: -1 }, z > D ? (N.sortIndex = z, t(a, N), n(u) === null && N === n(a) && (w ? (p(P), P = -1) : w = !0, L(y, z - D))) : (N.sortIndex = O, t(u, N), x || m || (x = !0, k(E))), N;
  }, e.unstable_shouldYield = F, e.unstable_wrapCallback = function(N) {
    var S = d;
    return function() {
      var z = d;
      d = S;
      try {
        return N.apply(this, arguments);
      } finally {
        d = z;
      }
    };
  };
})(wd);
vd.exports = wd;
var Y0 = vd.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var X0 = T, Je = Y0;
function H(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var xd = /* @__PURE__ */ new Set(), xo = {};
function Yn(e, t) {
  Nr(e, t), Nr(e + "Capture", t);
}
function Nr(e, t) {
  for (xo[e] = t, e = 0; e < t.length; e++) xd.add(t[e]);
}
var Bt = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), $s = Object.prototype.hasOwnProperty, Q0 = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, oc = {}, ic = {};
function K0(e) {
  return $s.call(ic, e) ? !0 : $s.call(oc, e) ? !1 : Q0.test(e) ? ic[e] = !0 : (oc[e] = !0, !1);
}
function G0(e, t, n, r) {
  if (n !== null && n.type === 0) return !1;
  switch (typeof t) {
    case "function":
    case "symbol":
      return !0;
    case "boolean":
      return r ? !1 : n !== null ? !n.acceptsBooleans : (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-");
    default:
      return !1;
  }
}
function Z0(e, t, n, r) {
  if (t === null || typeof t > "u" || G0(e, t, n, r)) return !0;
  if (r) return !1;
  if (n !== null) switch (n.type) {
    case 3:
      return !t;
    case 4:
      return t === !1;
    case 5:
      return isNaN(t);
    case 6:
      return isNaN(t) || 1 > t;
  }
  return !1;
}
function Be(e, t, n, r, o, i, l) {
  this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = o, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = i, this.removeEmptyString = l;
}
var ze = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
  ze[e] = new Be(e, 0, !1, e, null, !1, !1);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
  var t = e[0];
  ze[t] = new Be(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
  ze[e] = new Be(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
  ze[e] = new Be(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
  ze[e] = new Be(e, 3, !1, e.toLowerCase(), null, !1, !1);
});
["checked", "multiple", "muted", "selected"].forEach(function(e) {
  ze[e] = new Be(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function(e) {
  ze[e] = new Be(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function(e) {
  ze[e] = new Be(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function(e) {
  ze[e] = new Be(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var Wu = /[\-:]([a-z])/g;
function Yu(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
  var t = e.replace(
    Wu,
    Yu
  );
  ze[t] = new Be(t, 1, !1, e, null, !1, !1);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
  var t = e.replace(Wu, Yu);
  ze[t] = new Be(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
  var t = e.replace(Wu, Yu);
  ze[t] = new Be(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function(e) {
  ze[e] = new Be(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
ze.xlinkHref = new Be("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function(e) {
  ze[e] = new Be(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function Xu(e, t, n, r) {
  var o = ze.hasOwnProperty(t) ? ze[t] : null;
  (o !== null ? o.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (Z0(t, n, o, r) && (n = null), r || o === null ? K0(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : o.mustUseProperty ? e[o.propertyName] = n === null ? o.type === 3 ? !1 : "" : n : (t = o.attributeName, r = o.attributeNamespace, n === null ? e.removeAttribute(t) : (o = o.type, n = o === 3 || o === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var Qt = X0.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, ti = Symbol.for("react.element"), rr = Symbol.for("react.portal"), or = Symbol.for("react.fragment"), Qu = Symbol.for("react.strict_mode"), Rs = Symbol.for("react.profiler"), Sd = Symbol.for("react.provider"), _d = Symbol.for("react.context"), Ku = Symbol.for("react.forward_ref"), As = Symbol.for("react.suspense"), Is = Symbol.for("react.suspense_list"), Gu = Symbol.for("react.memo"), Zt = Symbol.for("react.lazy"), Ed = Symbol.for("react.offscreen"), lc = Symbol.iterator;
function Wr(e) {
  return e === null || typeof e != "object" ? null : (e = lc && e[lc] || e["@@iterator"], typeof e == "function" ? e : null);
}
var de = Object.assign, Kl;
function ro(e) {
  if (Kl === void 0) try {
    throw Error();
  } catch (n) {
    var t = n.stack.trim().match(/\n( *(at )?)/);
    Kl = t && t[1] || "";
  }
  return `
` + Kl + e;
}
var Gl = !1;
function Zl(e, t) {
  if (!e || Gl) return "";
  Gl = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (t) if (t = function() {
      throw Error();
    }, Object.defineProperty(t.prototype, "props", { set: function() {
      throw Error();
    } }), typeof Reflect == "object" && Reflect.construct) {
      try {
        Reflect.construct(t, []);
      } catch (a) {
        var r = a;
      }
      Reflect.construct(e, [], t);
    } else {
      try {
        t.call();
      } catch (a) {
        r = a;
      }
      e.call(t.prototype);
    }
    else {
      try {
        throw Error();
      } catch (a) {
        r = a;
      }
      e();
    }
  } catch (a) {
    if (a && r && typeof a.stack == "string") {
      for (var o = a.stack.split(`
`), i = r.stack.split(`
`), l = o.length - 1, s = i.length - 1; 1 <= l && 0 <= s && o[l] !== i[s]; ) s--;
      for (; 1 <= l && 0 <= s; l--, s--) if (o[l] !== i[s]) {
        if (l !== 1 || s !== 1)
          do
            if (l--, s--, 0 > s || o[l] !== i[s]) {
              var u = `
` + o[l].replace(" at new ", " at ");
              return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
            }
          while (1 <= l && 0 <= s);
        break;
      }
    }
  } finally {
    Gl = !1, Error.prepareStackTrace = n;
  }
  return (e = e ? e.displayName || e.name : "") ? ro(e) : "";
}
function q0(e) {
  switch (e.tag) {
    case 5:
      return ro(e.type);
    case 16:
      return ro("Lazy");
    case 13:
      return ro("Suspense");
    case 19:
      return ro("SuspenseList");
    case 0:
    case 2:
    case 15:
      return e = Zl(e.type, !1), e;
    case 11:
      return e = Zl(e.type.render, !1), e;
    case 1:
      return e = Zl(e.type, !0), e;
    default:
      return "";
  }
}
function Ds(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case or:
      return "Fragment";
    case rr:
      return "Portal";
    case Rs:
      return "Profiler";
    case Qu:
      return "StrictMode";
    case As:
      return "Suspense";
    case Is:
      return "SuspenseList";
  }
  if (typeof e == "object") switch (e.$$typeof) {
    case _d:
      return (e.displayName || "Context") + ".Consumer";
    case Sd:
      return (e._context.displayName || "Context") + ".Provider";
    case Ku:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case Gu:
      return t = e.displayName || null, t !== null ? t : Ds(e.type) || "Memo";
    case Zt:
      t = e._payload, e = e._init;
      try {
        return Ds(e(t));
      } catch {
      }
  }
  return null;
}
function J0(e) {
  var t = e.type;
  switch (e.tag) {
    case 24:
      return "Cache";
    case 9:
      return (t.displayName || "Context") + ".Consumer";
    case 10:
      return (t._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return e = t.render, e = e.displayName || e.name || "", t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
    case 7:
      return "Fragment";
    case 5:
      return t;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return Ds(t);
    case 8:
      return t === Qu ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof t == "function") return t.displayName || t.name || null;
      if (typeof t == "string") return t;
  }
  return null;
}
function mn(e) {
  switch (typeof e) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return e;
    case "object":
      return e;
    default:
      return "";
  }
}
function kd(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function b0(e) {
  var t = kd(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
  if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
    var o = n.get, i = n.set;
    return Object.defineProperty(e, t, { configurable: !0, get: function() {
      return o.call(this);
    }, set: function(l) {
      r = "" + l, i.call(this, l);
    } }), Object.defineProperty(e, t, { enumerable: n.enumerable }), { getValue: function() {
      return r;
    }, setValue: function(l) {
      r = "" + l;
    }, stopTracking: function() {
      e._valueTracker = null, delete e[t];
    } };
  }
}
function ni(e) {
  e._valueTracker || (e._valueTracker = b0(e));
}
function Nd(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(), r = "";
  return e && (r = kd(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
}
function Ui(e) {
  if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function Ls(e, t) {
  var n = t.checked;
  return de({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
}
function sc(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
  n = mn(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
}
function Cd(e, t) {
  t = t.checked, t != null && Xu(e, "checked", t, !1);
}
function Os(e, t) {
  Cd(e, t);
  var n = mn(t.value), r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? Fs(e, t.type, n) : t.hasOwnProperty("defaultValue") && Fs(e, t.type, mn(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
}
function uc(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
    t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
  }
  n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
}
function Fs(e, t, n) {
  (t !== "number" || Ui(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var oo = Array.isArray;
function gr(e, t, n, r) {
  if (e = e.options, t) {
    t = {};
    for (var o = 0; o < n.length; o++) t["$" + n[o]] = !0;
    for (n = 0; n < e.length; n++) o = t.hasOwnProperty("$" + e[n].value), e[n].selected !== o && (e[n].selected = o), o && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + mn(n), t = null, o = 0; o < e.length; o++) {
      if (e[o].value === n) {
        e[o].selected = !0, r && (e[o].defaultSelected = !0);
        return;
      }
      t !== null || e[o].disabled || (t = e[o]);
    }
    t !== null && (t.selected = !0);
  }
}
function Hs(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(H(91));
  return de({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
}
function ac(e, t) {
  var n = t.value;
  if (n == null) {
    if (n = t.children, t = t.defaultValue, n != null) {
      if (t != null) throw Error(H(92));
      if (oo(n)) {
        if (1 < n.length) throw Error(H(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), n = t;
  }
  e._wrapperState = { initialValue: mn(n) };
}
function Md(e, t) {
  var n = mn(t.value), r = mn(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function cc(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function zd(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function Vs(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml" ? zd(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var ri, Td = function(e) {
  return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, o) {
    MSApp.execUnsafeLocalFunction(function() {
      return e(t, n, r, o);
    });
  } : e;
}(function(e, t) {
  if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
  else {
    for (ri = ri || document.createElement("div"), ri.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = ri.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
    for (; t.firstChild; ) e.appendChild(t.firstChild);
  }
});
function So(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var co = {
  animationIterationCount: !0,
  aspectRatio: !0,
  borderImageOutset: !0,
  borderImageSlice: !0,
  borderImageWidth: !0,
  boxFlex: !0,
  boxFlexGroup: !0,
  boxOrdinalGroup: !0,
  columnCount: !0,
  columns: !0,
  flex: !0,
  flexGrow: !0,
  flexPositive: !0,
  flexShrink: !0,
  flexNegative: !0,
  flexOrder: !0,
  gridArea: !0,
  gridRow: !0,
  gridRowEnd: !0,
  gridRowSpan: !0,
  gridRowStart: !0,
  gridColumn: !0,
  gridColumnEnd: !0,
  gridColumnSpan: !0,
  gridColumnStart: !0,
  fontWeight: !0,
  lineClamp: !0,
  lineHeight: !0,
  opacity: !0,
  order: !0,
  orphans: !0,
  tabSize: !0,
  widows: !0,
  zIndex: !0,
  zoom: !0,
  fillOpacity: !0,
  floodOpacity: !0,
  stopOpacity: !0,
  strokeDasharray: !0,
  strokeDashoffset: !0,
  strokeMiterlimit: !0,
  strokeOpacity: !0,
  strokeWidth: !0
}, eg = ["Webkit", "ms", "Moz", "O"];
Object.keys(co).forEach(function(e) {
  eg.forEach(function(t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), co[t] = co[e];
  });
});
function Pd(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || co.hasOwnProperty(e) && co[e] ? ("" + t).trim() : t + "px";
}
function $d(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0, o = Pd(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, o) : e[n] = o;
  }
}
var tg = de({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
function Bs(e, t) {
  if (t) {
    if (tg[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(H(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(H(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(H(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(H(62));
  }
}
function Us(e, t) {
  if (e.indexOf("-") === -1) return typeof t.is == "string";
  switch (e) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;
    default:
      return !0;
  }
}
var js = null;
function Zu(e) {
  return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
}
var Ws = null, yr = null, vr = null;
function fc(e) {
  if (e = Go(e)) {
    if (typeof Ws != "function") throw Error(H(280));
    var t = e.stateNode;
    t && (t = Nl(t), Ws(e.stateNode, e.type, t));
  }
}
function Rd(e) {
  yr ? vr ? vr.push(e) : vr = [e] : yr = e;
}
function Ad() {
  if (yr) {
    var e = yr, t = vr;
    if (vr = yr = null, fc(e), t) for (e = 0; e < t.length; e++) fc(t[e]);
  }
}
function Id(e, t) {
  return e(t);
}
function Dd() {
}
var ql = !1;
function Ld(e, t, n) {
  if (ql) return e(t, n);
  ql = !0;
  try {
    return Id(e, t, n);
  } finally {
    ql = !1, (yr !== null || vr !== null) && (Dd(), Ad());
  }
}
function _o(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = Nl(n);
  if (r === null) return null;
  n = r[t];
  e: switch (t) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      (r = !r.disabled) || (e = e.type, r = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !r;
      break e;
    default:
      e = !1;
  }
  if (e) return null;
  if (n && typeof n != "function") throw Error(H(231, t, typeof n));
  return n;
}
var Ys = !1;
if (Bt) try {
  var Yr = {};
  Object.defineProperty(Yr, "passive", { get: function() {
    Ys = !0;
  } }), window.addEventListener("test", Yr, Yr), window.removeEventListener("test", Yr, Yr);
} catch {
  Ys = !1;
}
function ng(e, t, n, r, o, i, l, s, u) {
  var a = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, a);
  } catch (c) {
    this.onError(c);
  }
}
var fo = !1, ji = null, Wi = !1, Xs = null, rg = { onError: function(e) {
  fo = !0, ji = e;
} };
function og(e, t, n, r, o, i, l, s, u) {
  fo = !1, ji = null, ng.apply(rg, arguments);
}
function ig(e, t, n, r, o, i, l, s, u) {
  if (og.apply(this, arguments), fo) {
    if (fo) {
      var a = ji;
      fo = !1, ji = null;
    } else throw Error(H(198));
    Wi || (Wi = !0, Xs = a);
  }
}
function Xn(e) {
  var t = e, n = e;
  if (e.alternate) for (; t.return; ) t = t.return;
  else {
    e = t;
    do
      t = e, t.flags & 4098 && (n = t.return), e = t.return;
    while (e);
  }
  return t.tag === 3 ? n : null;
}
function Od(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function dc(e) {
  if (Xn(e) !== e) throw Error(H(188));
}
function lg(e) {
  var t = e.alternate;
  if (!t) {
    if (t = Xn(e), t === null) throw Error(H(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t; ; ) {
    var o = n.return;
    if (o === null) break;
    var i = o.alternate;
    if (i === null) {
      if (r = o.return, r !== null) {
        n = r;
        continue;
      }
      break;
    }
    if (o.child === i.child) {
      for (i = o.child; i; ) {
        if (i === n) return dc(o), e;
        if (i === r) return dc(o), t;
        i = i.sibling;
      }
      throw Error(H(188));
    }
    if (n.return !== r.return) n = o, r = i;
    else {
      for (var l = !1, s = o.child; s; ) {
        if (s === n) {
          l = !0, n = o, r = i;
          break;
        }
        if (s === r) {
          l = !0, r = o, n = i;
          break;
        }
        s = s.sibling;
      }
      if (!l) {
        for (s = i.child; s; ) {
          if (s === n) {
            l = !0, n = i, r = o;
            break;
          }
          if (s === r) {
            l = !0, r = i, n = o;
            break;
          }
          s = s.sibling;
        }
        if (!l) throw Error(H(189));
      }
    }
    if (n.alternate !== r) throw Error(H(190));
  }
  if (n.tag !== 3) throw Error(H(188));
  return n.stateNode.current === n ? e : t;
}
function Fd(e) {
  return e = lg(e), e !== null ? Hd(e) : null;
}
function Hd(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = Hd(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var Vd = Je.unstable_scheduleCallback, pc = Je.unstable_cancelCallback, sg = Je.unstable_shouldYield, ug = Je.unstable_requestPaint, ge = Je.unstable_now, ag = Je.unstable_getCurrentPriorityLevel, qu = Je.unstable_ImmediatePriority, Bd = Je.unstable_UserBlockingPriority, Yi = Je.unstable_NormalPriority, cg = Je.unstable_LowPriority, Ud = Je.unstable_IdlePriority, Sl = null, Ct = null;
function fg(e) {
  if (Ct && typeof Ct.onCommitFiberRoot == "function") try {
    Ct.onCommitFiberRoot(Sl, e, void 0, (e.current.flags & 128) === 128);
  } catch {
  }
}
var yt = Math.clz32 ? Math.clz32 : hg, dg = Math.log, pg = Math.LN2;
function hg(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (dg(e) / pg | 0) | 0;
}
var oi = 64, ii = 4194304;
function io(e) {
  switch (e & -e) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return e & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return e;
  }
}
function Xi(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0, o = e.suspendedLanes, i = e.pingedLanes, l = n & 268435455;
  if (l !== 0) {
    var s = l & ~o;
    s !== 0 ? r = io(s) : (i &= l, i !== 0 && (r = io(i)));
  } else l = n & ~o, l !== 0 ? r = io(l) : i !== 0 && (r = io(i));
  if (r === 0) return 0;
  if (t !== 0 && t !== r && !(t & o) && (o = r & -r, i = t & -t, o >= i || o === 16 && (i & 4194240) !== 0)) return t;
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - yt(t), o = 1 << n, r |= e[n], t &= ~o;
  return r;
}
function mg(e, t) {
  switch (e) {
    case 1:
    case 2:
    case 4:
      return t + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function gg(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, o = e.expirationTimes, i = e.pendingLanes; 0 < i; ) {
    var l = 31 - yt(i), s = 1 << l, u = o[l];
    u === -1 ? (!(s & n) || s & r) && (o[l] = mg(s, t)) : u <= t && (e.expiredLanes |= s), i &= ~s;
  }
}
function Qs(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function jd() {
  var e = oi;
  return oi <<= 1, !(oi & 4194240) && (oi = 64), e;
}
function Jl(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function Qo(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - yt(t), e[t] = n;
}
function yg(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var o = 31 - yt(n), i = 1 << o;
    t[o] = 0, r[o] = -1, e[o] = -1, n &= ~i;
  }
}
function Ju(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n; ) {
    var r = 31 - yt(n), o = 1 << r;
    o & t | e[r] & t && (e[r] |= t), n &= ~o;
  }
}
var re = 0;
function Wd(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var Yd, bu, Xd, Qd, Kd, Ks = !1, li = [], ln = null, sn = null, un = null, Eo = /* @__PURE__ */ new Map(), ko = /* @__PURE__ */ new Map(), en = [], vg = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function hc(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      ln = null;
      break;
    case "dragenter":
    case "dragleave":
      sn = null;
      break;
    case "mouseover":
    case "mouseout":
      un = null;
      break;
    case "pointerover":
    case "pointerout":
      Eo.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      ko.delete(t.pointerId);
  }
}
function Xr(e, t, n, r, o, i) {
  return e === null || e.nativeEvent !== i ? (e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: i, targetContainers: [o] }, t !== null && (t = Go(t), t !== null && bu(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, o !== null && t.indexOf(o) === -1 && t.push(o), e);
}
function wg(e, t, n, r, o) {
  switch (t) {
    case "focusin":
      return ln = Xr(ln, e, t, n, r, o), !0;
    case "dragenter":
      return sn = Xr(sn, e, t, n, r, o), !0;
    case "mouseover":
      return un = Xr(un, e, t, n, r, o), !0;
    case "pointerover":
      var i = o.pointerId;
      return Eo.set(i, Xr(Eo.get(i) || null, e, t, n, r, o)), !0;
    case "gotpointercapture":
      return i = o.pointerId, ko.set(i, Xr(ko.get(i) || null, e, t, n, r, o)), !0;
  }
  return !1;
}
function Gd(e) {
  var t = Tn(e.target);
  if (t !== null) {
    var n = Xn(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = Od(n), t !== null) {
          e.blockedOn = t, Kd(e.priority, function() {
            Xd(n);
          });
          return;
        }
      } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function zi(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = Gs(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      js = r, n.target.dispatchEvent(r), js = null;
    } else return t = Go(n), t !== null && bu(t), e.blockedOn = n, !1;
    t.shift();
  }
  return !0;
}
function mc(e, t, n) {
  zi(e) && n.delete(t);
}
function xg() {
  Ks = !1, ln !== null && zi(ln) && (ln = null), sn !== null && zi(sn) && (sn = null), un !== null && zi(un) && (un = null), Eo.forEach(mc), ko.forEach(mc);
}
function Qr(e, t) {
  e.blockedOn === t && (e.blockedOn = null, Ks || (Ks = !0, Je.unstable_scheduleCallback(Je.unstable_NormalPriority, xg)));
}
function No(e) {
  function t(o) {
    return Qr(o, e);
  }
  if (0 < li.length) {
    Qr(li[0], e);
    for (var n = 1; n < li.length; n++) {
      var r = li[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (ln !== null && Qr(ln, e), sn !== null && Qr(sn, e), un !== null && Qr(un, e), Eo.forEach(t), ko.forEach(t), n = 0; n < en.length; n++) r = en[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < en.length && (n = en[0], n.blockedOn === null); ) Gd(n), n.blockedOn === null && en.shift();
}
var wr = Qt.ReactCurrentBatchConfig, Qi = !0;
function Sg(e, t, n, r) {
  var o = re, i = wr.transition;
  wr.transition = null;
  try {
    re = 1, ea(e, t, n, r);
  } finally {
    re = o, wr.transition = i;
  }
}
function _g(e, t, n, r) {
  var o = re, i = wr.transition;
  wr.transition = null;
  try {
    re = 4, ea(e, t, n, r);
  } finally {
    re = o, wr.transition = i;
  }
}
function ea(e, t, n, r) {
  if (Qi) {
    var o = Gs(e, t, n, r);
    if (o === null) us(e, t, r, Ki, n), hc(e, r);
    else if (wg(o, e, t, n, r)) r.stopPropagation();
    else if (hc(e, r), t & 4 && -1 < vg.indexOf(e)) {
      for (; o !== null; ) {
        var i = Go(o);
        if (i !== null && Yd(i), i = Gs(e, t, n, r), i === null && us(e, t, r, Ki, n), i === o) break;
        o = i;
      }
      o !== null && r.stopPropagation();
    } else us(e, t, r, null, n);
  }
}
var Ki = null;
function Gs(e, t, n, r) {
  if (Ki = null, e = Zu(r), e = Tn(e), e !== null) if (t = Xn(e), t === null) e = null;
  else if (n = t.tag, n === 13) {
    if (e = Od(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return Ki = e, null;
}
function Zd(e) {
  switch (e) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (ag()) {
        case qu:
          return 1;
        case Bd:
          return 4;
        case Yi:
        case cg:
          return 16;
        case Ud:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var rn = null, ta = null, Ti = null;
function qd() {
  if (Ti) return Ti;
  var e, t = ta, n = t.length, r, o = "value" in rn ? rn.value : rn.textContent, i = o.length;
  for (e = 0; e < n && t[e] === o[e]; e++) ;
  var l = n - e;
  for (r = 1; r <= l && t[n - r] === o[i - r]; r++) ;
  return Ti = o.slice(e, 1 < r ? 1 - r : void 0);
}
function Pi(e) {
  var t = e.keyCode;
  return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
}
function si() {
  return !0;
}
function gc() {
  return !1;
}
function tt(e) {
  function t(n, r, o, i, l) {
    this._reactName = n, this._targetInst = o, this.type = r, this.nativeEvent = i, this.target = l, this.currentTarget = null;
    for (var s in e) e.hasOwnProperty(s) && (n = e[s], this[s] = n ? n(i) : i[s]);
    return this.isDefaultPrevented = (i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1) ? si : gc, this.isPropagationStopped = gc, this;
  }
  return de(t.prototype, { preventDefault: function() {
    this.defaultPrevented = !0;
    var n = this.nativeEvent;
    n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = si);
  }, stopPropagation: function() {
    var n = this.nativeEvent;
    n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = si);
  }, persist: function() {
  }, isPersistent: si }), t;
}
var Fr = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
  return e.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, na = tt(Fr), Ko = de({}, Fr, { view: 0, detail: 0 }), Eg = tt(Ko), bl, es, Kr, _l = de({}, Ko, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: ra, button: 0, buttons: 0, relatedTarget: function(e) {
  return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
}, movementX: function(e) {
  return "movementX" in e ? e.movementX : (e !== Kr && (Kr && e.type === "mousemove" ? (bl = e.screenX - Kr.screenX, es = e.screenY - Kr.screenY) : es = bl = 0, Kr = e), bl);
}, movementY: function(e) {
  return "movementY" in e ? e.movementY : es;
} }), yc = tt(_l), kg = de({}, _l, { dataTransfer: 0 }), Ng = tt(kg), Cg = de({}, Ko, { relatedTarget: 0 }), ts = tt(Cg), Mg = de({}, Fr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), zg = tt(Mg), Tg = de({}, Fr, { clipboardData: function(e) {
  return "clipboardData" in e ? e.clipboardData : window.clipboardData;
} }), Pg = tt(Tg), $g = de({}, Fr, { data: 0 }), vc = tt($g), Rg = {
  Esc: "Escape",
  Spacebar: " ",
  Left: "ArrowLeft",
  Up: "ArrowUp",
  Right: "ArrowRight",
  Down: "ArrowDown",
  Del: "Delete",
  Win: "OS",
  Menu: "ContextMenu",
  Apps: "ContextMenu",
  Scroll: "ScrollLock",
  MozPrintableKey: "Unidentified"
}, Ag = {
  8: "Backspace",
  9: "Tab",
  12: "Clear",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  19: "Pause",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  45: "Insert",
  46: "Delete",
  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",
  144: "NumLock",
  145: "ScrollLock",
  224: "Meta"
}, Ig = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function Dg(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = Ig[e]) ? !!t[e] : !1;
}
function ra() {
  return Dg;
}
var Lg = de({}, Ko, { key: function(e) {
  if (e.key) {
    var t = Rg[e.key] || e.key;
    if (t !== "Unidentified") return t;
  }
  return e.type === "keypress" ? (e = Pi(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Ag[e.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: ra, charCode: function(e) {
  return e.type === "keypress" ? Pi(e) : 0;
}, keyCode: function(e) {
  return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
}, which: function(e) {
  return e.type === "keypress" ? Pi(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
} }), Og = tt(Lg), Fg = de({}, _l, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), wc = tt(Fg), Hg = de({}, Ko, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: ra }), Vg = tt(Hg), Bg = de({}, Fr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Ug = tt(Bg), jg = de({}, _l, {
  deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  },
  deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), Wg = tt(jg), Yg = [9, 13, 27, 32], oa = Bt && "CompositionEvent" in window, po = null;
Bt && "documentMode" in document && (po = document.documentMode);
var Xg = Bt && "TextEvent" in window && !po, Jd = Bt && (!oa || po && 8 < po && 11 >= po), xc = " ", Sc = !1;
function bd(e, t) {
  switch (e) {
    case "keyup":
      return Yg.indexOf(t.keyCode) !== -1;
    case "keydown":
      return t.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return !0;
    default:
      return !1;
  }
}
function ep(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var ir = !1;
function Qg(e, t) {
  switch (e) {
    case "compositionend":
      return ep(t);
    case "keypress":
      return t.which !== 32 ? null : (Sc = !0, xc);
    case "textInput":
      return e = t.data, e === xc && Sc ? null : e;
    default:
      return null;
  }
}
function Kg(e, t) {
  if (ir) return e === "compositionend" || !oa && bd(e, t) ? (e = qd(), Ti = ta = rn = null, ir = !1, e) : null;
  switch (e) {
    case "paste":
      return null;
    case "keypress":
      if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
        if (t.char && 1 < t.char.length) return t.char;
        if (t.which) return String.fromCharCode(t.which);
      }
      return null;
    case "compositionend":
      return Jd && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var Gg = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
function _c(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!Gg[e.type] : t === "textarea";
}
function tp(e, t, n, r) {
  Rd(r), t = Gi(t, "onChange"), 0 < t.length && (n = new na("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
}
var ho = null, Co = null;
function Zg(e) {
  dp(e, 0);
}
function El(e) {
  var t = ur(e);
  if (Nd(t)) return e;
}
function qg(e, t) {
  if (e === "change") return t;
}
var np = !1;
if (Bt) {
  var ns;
  if (Bt) {
    var rs = "oninput" in document;
    if (!rs) {
      var Ec = document.createElement("div");
      Ec.setAttribute("oninput", "return;"), rs = typeof Ec.oninput == "function";
    }
    ns = rs;
  } else ns = !1;
  np = ns && (!document.documentMode || 9 < document.documentMode);
}
function kc() {
  ho && (ho.detachEvent("onpropertychange", rp), Co = ho = null);
}
function rp(e) {
  if (e.propertyName === "value" && El(Co)) {
    var t = [];
    tp(t, Co, e, Zu(e)), Ld(Zg, t);
  }
}
function Jg(e, t, n) {
  e === "focusin" ? (kc(), ho = t, Co = n, ho.attachEvent("onpropertychange", rp)) : e === "focusout" && kc();
}
function bg(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return El(Co);
}
function ey(e, t) {
  if (e === "click") return El(t);
}
function ty(e, t) {
  if (e === "input" || e === "change") return El(t);
}
function ny(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var xt = typeof Object.is == "function" ? Object.is : ny;
function Mo(e, t) {
  if (xt(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var o = n[r];
    if (!$s.call(t, o) || !xt(e[o], t[o])) return !1;
  }
  return !0;
}
function Nc(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function Cc(e, t) {
  var n = Nc(e);
  e = 0;
  for (var r; n; ) {
    if (n.nodeType === 3) {
      if (r = e + n.textContent.length, e <= t && r >= t) return { node: n, offset: t - e };
      e = r;
    }
    e: {
      for (; n; ) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = Nc(n);
  }
}
function op(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? op(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
}
function ip() {
  for (var e = window, t = Ui(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = Ui(e.document);
  }
  return t;
}
function ia(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
}
function ry(e) {
  var t = ip(), n = e.focusedElem, r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && op(n.ownerDocument.documentElement, n)) {
    if (r !== null && ia(n)) {
      if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
      else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
        e = e.getSelection();
        var o = n.textContent.length, i = Math.min(r.start, o);
        r = r.end === void 0 ? i : Math.min(r.end, o), !e.extend && i > r && (o = r, r = i, i = o), o = Cc(n, i);
        var l = Cc(
          n,
          r
        );
        o && l && (e.rangeCount !== 1 || e.anchorNode !== o.node || e.anchorOffset !== o.offset || e.focusNode !== l.node || e.focusOffset !== l.offset) && (t = t.createRange(), t.setStart(o.node, o.offset), e.removeAllRanges(), i > r ? (e.addRange(t), e.extend(l.node, l.offset)) : (t.setEnd(l.node, l.offset), e.addRange(t)));
      }
    }
    for (t = [], e = n; e = e.parentNode; ) e.nodeType === 1 && t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
    for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++) e = t[n], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
  }
}
var oy = Bt && "documentMode" in document && 11 >= document.documentMode, lr = null, Zs = null, mo = null, qs = !1;
function Mc(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  qs || lr == null || lr !== Ui(r) || (r = lr, "selectionStart" in r && ia(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), mo && Mo(mo, r) || (mo = r, r = Gi(Zs, "onSelect"), 0 < r.length && (t = new na("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = lr)));
}
function ui(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var sr = { animationend: ui("Animation", "AnimationEnd"), animationiteration: ui("Animation", "AnimationIteration"), animationstart: ui("Animation", "AnimationStart"), transitionend: ui("Transition", "TransitionEnd") }, os = {}, lp = {};
Bt && (lp = document.createElement("div").style, "AnimationEvent" in window || (delete sr.animationend.animation, delete sr.animationiteration.animation, delete sr.animationstart.animation), "TransitionEvent" in window || delete sr.transitionend.transition);
function kl(e) {
  if (os[e]) return os[e];
  if (!sr[e]) return e;
  var t = sr[e], n;
  for (n in t) if (t.hasOwnProperty(n) && n in lp) return os[e] = t[n];
  return e;
}
var sp = kl("animationend"), up = kl("animationiteration"), ap = kl("animationstart"), cp = kl("transitionend"), fp = /* @__PURE__ */ new Map(), zc = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function yn(e, t) {
  fp.set(e, t), Yn(t, [e]);
}
for (var is = 0; is < zc.length; is++) {
  var ls = zc[is], iy = ls.toLowerCase(), ly = ls[0].toUpperCase() + ls.slice(1);
  yn(iy, "on" + ly);
}
yn(sp, "onAnimationEnd");
yn(up, "onAnimationIteration");
yn(ap, "onAnimationStart");
yn("dblclick", "onDoubleClick");
yn("focusin", "onFocus");
yn("focusout", "onBlur");
yn(cp, "onTransitionEnd");
Nr("onMouseEnter", ["mouseout", "mouseover"]);
Nr("onMouseLeave", ["mouseout", "mouseover"]);
Nr("onPointerEnter", ["pointerout", "pointerover"]);
Nr("onPointerLeave", ["pointerout", "pointerover"]);
Yn("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
Yn("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
Yn("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Yn("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
Yn("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
Yn("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var lo = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), sy = new Set("cancel close invalid load scroll toggle".split(" ").concat(lo));
function Tc(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, ig(r, t, void 0, e), e.currentTarget = null;
}
function dp(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n], o = r.event;
    r = r.listeners;
    e: {
      var i = void 0;
      if (t) for (var l = r.length - 1; 0 <= l; l--) {
        var s = r[l], u = s.instance, a = s.currentTarget;
        if (s = s.listener, u !== i && o.isPropagationStopped()) break e;
        Tc(o, s, a), i = u;
      }
      else for (l = 0; l < r.length; l++) {
        if (s = r[l], u = s.instance, a = s.currentTarget, s = s.listener, u !== i && o.isPropagationStopped()) break e;
        Tc(o, s, a), i = u;
      }
    }
  }
  if (Wi) throw e = Xs, Wi = !1, Xs = null, e;
}
function se(e, t) {
  var n = t[nu];
  n === void 0 && (n = t[nu] = /* @__PURE__ */ new Set());
  var r = e + "__bubble";
  n.has(r) || (pp(t, e, 2, !1), n.add(r));
}
function ss(e, t, n) {
  var r = 0;
  t && (r |= 4), pp(n, e, r, t);
}
var ai = "_reactListening" + Math.random().toString(36).slice(2);
function zo(e) {
  if (!e[ai]) {
    e[ai] = !0, xd.forEach(function(n) {
      n !== "selectionchange" && (sy.has(n) || ss(n, !1, e), ss(n, !0, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[ai] || (t[ai] = !0, ss("selectionchange", !1, t));
  }
}
function pp(e, t, n, r) {
  switch (Zd(t)) {
    case 1:
      var o = Sg;
      break;
    case 4:
      o = _g;
      break;
    default:
      o = ea;
  }
  n = o.bind(null, t, n, e), o = void 0, !Ys || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (o = !0), r ? o !== void 0 ? e.addEventListener(t, n, { capture: !0, passive: o }) : e.addEventListener(t, n, !0) : o !== void 0 ? e.addEventListener(t, n, { passive: o }) : e.addEventListener(t, n, !1);
}
function us(e, t, n, r, o) {
  var i = r;
  if (!(t & 1) && !(t & 2) && r !== null) e: for (; ; ) {
    if (r === null) return;
    var l = r.tag;
    if (l === 3 || l === 4) {
      var s = r.stateNode.containerInfo;
      if (s === o || s.nodeType === 8 && s.parentNode === o) break;
      if (l === 4) for (l = r.return; l !== null; ) {
        var u = l.tag;
        if ((u === 3 || u === 4) && (u = l.stateNode.containerInfo, u === o || u.nodeType === 8 && u.parentNode === o)) return;
        l = l.return;
      }
      for (; s !== null; ) {
        if (l = Tn(s), l === null) return;
        if (u = l.tag, u === 5 || u === 6) {
          r = i = l;
          continue e;
        }
        s = s.parentNode;
      }
    }
    r = r.return;
  }
  Ld(function() {
    var a = i, c = Zu(n), f = [];
    e: {
      var d = fp.get(e);
      if (d !== void 0) {
        var m = na, x = e;
        switch (e) {
          case "keypress":
            if (Pi(n) === 0) break e;
          case "keydown":
          case "keyup":
            m = Og;
            break;
          case "focusin":
            x = "focus", m = ts;
            break;
          case "focusout":
            x = "blur", m = ts;
            break;
          case "beforeblur":
          case "afterblur":
            m = ts;
            break;
          case "click":
            if (n.button === 2) break e;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            m = yc;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            m = Ng;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            m = Vg;
            break;
          case sp:
          case up:
          case ap:
            m = zg;
            break;
          case cp:
            m = Ug;
            break;
          case "scroll":
            m = Eg;
            break;
          case "wheel":
            m = Wg;
            break;
          case "copy":
          case "cut":
          case "paste":
            m = Pg;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            m = wc;
        }
        var w = (t & 4) !== 0, _ = !w && e === "scroll", p = w ? d !== null ? d + "Capture" : null : d;
        w = [];
        for (var h = a, g; h !== null; ) {
          g = h;
          var y = g.stateNode;
          if (g.tag === 5 && y !== null && (g = y, p !== null && (y = _o(h, p), y != null && w.push(To(h, y, g)))), _) break;
          h = h.return;
        }
        0 < w.length && (d = new m(d, x, null, n, c), f.push({ event: d, listeners: w }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (d = e === "mouseover" || e === "pointerover", m = e === "mouseout" || e === "pointerout", d && n !== js && (x = n.relatedTarget || n.fromElement) && (Tn(x) || x[Ut])) break e;
        if ((m || d) && (d = c.window === c ? c : (d = c.ownerDocument) ? d.defaultView || d.parentWindow : window, m ? (x = n.relatedTarget || n.toElement, m = a, x = x ? Tn(x) : null, x !== null && (_ = Xn(x), x !== _ || x.tag !== 5 && x.tag !== 6) && (x = null)) : (m = null, x = a), m !== x)) {
          if (w = yc, y = "onMouseLeave", p = "onMouseEnter", h = "mouse", (e === "pointerout" || e === "pointerover") && (w = wc, y = "onPointerLeave", p = "onPointerEnter", h = "pointer"), _ = m == null ? d : ur(m), g = x == null ? d : ur(x), d = new w(y, h + "leave", m, n, c), d.target = _, d.relatedTarget = g, y = null, Tn(c) === a && (w = new w(p, h + "enter", x, n, c), w.target = g, w.relatedTarget = _, y = w), _ = y, m && x) t: {
            for (w = m, p = x, h = 0, g = w; g; g = Jn(g)) h++;
            for (g = 0, y = p; y; y = Jn(y)) g++;
            for (; 0 < h - g; ) w = Jn(w), h--;
            for (; 0 < g - h; ) p = Jn(p), g--;
            for (; h--; ) {
              if (w === p || p !== null && w === p.alternate) break t;
              w = Jn(w), p = Jn(p);
            }
            w = null;
          }
          else w = null;
          m !== null && Pc(f, d, m, w, !1), x !== null && _ !== null && Pc(f, _, x, w, !0);
        }
      }
      e: {
        if (d = a ? ur(a) : window, m = d.nodeName && d.nodeName.toLowerCase(), m === "select" || m === "input" && d.type === "file") var E = qg;
        else if (_c(d)) if (np) E = ty;
        else {
          E = bg;
          var C = Jg;
        }
        else (m = d.nodeName) && m.toLowerCase() === "input" && (d.type === "checkbox" || d.type === "radio") && (E = ey);
        if (E && (E = E(e, a))) {
          tp(f, E, n, c);
          break e;
        }
        C && C(e, d, a), e === "focusout" && (C = d._wrapperState) && C.controlled && d.type === "number" && Fs(d, "number", d.value);
      }
      switch (C = a ? ur(a) : window, e) {
        case "focusin":
          (_c(C) || C.contentEditable === "true") && (lr = C, Zs = a, mo = null);
          break;
        case "focusout":
          mo = Zs = lr = null;
          break;
        case "mousedown":
          qs = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          qs = !1, Mc(f, n, c);
          break;
        case "selectionchange":
          if (oy) break;
        case "keydown":
        case "keyup":
          Mc(f, n, c);
      }
      var M;
      if (oa) e: {
        switch (e) {
          case "compositionstart":
            var P = "onCompositionStart";
            break e;
          case "compositionend":
            P = "onCompositionEnd";
            break e;
          case "compositionupdate":
            P = "onCompositionUpdate";
            break e;
        }
        P = void 0;
      }
      else ir ? bd(e, n) && (P = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (P = "onCompositionStart");
      P && (Jd && n.locale !== "ko" && (ir || P !== "onCompositionStart" ? P === "onCompositionEnd" && ir && (M = qd()) : (rn = c, ta = "value" in rn ? rn.value : rn.textContent, ir = !0)), C = Gi(a, P), 0 < C.length && (P = new vc(P, e, null, n, c), f.push({ event: P, listeners: C }), M ? P.data = M : (M = ep(n), M !== null && (P.data = M)))), (M = Xg ? Qg(e, n) : Kg(e, n)) && (a = Gi(a, "onBeforeInput"), 0 < a.length && (c = new vc("onBeforeInput", "beforeinput", null, n, c), f.push({ event: c, listeners: a }), c.data = M));
    }
    dp(f, t);
  });
}
function To(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function Gi(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var o = e, i = o.stateNode;
    o.tag === 5 && i !== null && (o = i, i = _o(e, n), i != null && r.unshift(To(e, i, o)), i = _o(e, t), i != null && r.push(To(e, i, o))), e = e.return;
  }
  return r;
}
function Jn(e) {
  if (e === null) return null;
  do
    e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function Pc(e, t, n, r, o) {
  for (var i = t._reactName, l = []; n !== null && n !== r; ) {
    var s = n, u = s.alternate, a = s.stateNode;
    if (u !== null && u === r) break;
    s.tag === 5 && a !== null && (s = a, o ? (u = _o(n, i), u != null && l.unshift(To(n, u, s))) : o || (u = _o(n, i), u != null && l.push(To(n, u, s)))), n = n.return;
  }
  l.length !== 0 && e.push({ event: t, listeners: l });
}
var uy = /\r\n?/g, ay = /\u0000|\uFFFD/g;
function $c(e) {
  return (typeof e == "string" ? e : "" + e).replace(uy, `
`).replace(ay, "");
}
function ci(e, t, n) {
  if (t = $c(t), $c(e) !== t && n) throw Error(H(425));
}
function Zi() {
}
var Js = null, bs = null;
function eu(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var tu = typeof setTimeout == "function" ? setTimeout : void 0, cy = typeof clearTimeout == "function" ? clearTimeout : void 0, Rc = typeof Promise == "function" ? Promise : void 0, fy = typeof queueMicrotask == "function" ? queueMicrotask : typeof Rc < "u" ? function(e) {
  return Rc.resolve(null).then(e).catch(dy);
} : tu;
function dy(e) {
  setTimeout(function() {
    throw e;
  });
}
function as(e, t) {
  var n = t, r = 0;
  do {
    var o = n.nextSibling;
    if (e.removeChild(n), o && o.nodeType === 8) if (n = o.data, n === "/$") {
      if (r === 0) {
        e.removeChild(o), No(t);
        return;
      }
      r--;
    } else n !== "$" && n !== "$?" && n !== "$!" || r++;
    n = o;
  } while (n);
  No(t);
}
function an(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (t = e.data, t === "$" || t === "$!" || t === "$?") break;
      if (t === "/$") return null;
    }
  }
  return e;
}
function Ac(e) {
  e = e.previousSibling;
  for (var t = 0; e; ) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === "$" || n === "$!" || n === "$?") {
        if (t === 0) return e;
        t--;
      } else n === "/$" && t++;
    }
    e = e.previousSibling;
  }
  return null;
}
var Hr = Math.random().toString(36).slice(2), Nt = "__reactFiber$" + Hr, Po = "__reactProps$" + Hr, Ut = "__reactContainer$" + Hr, nu = "__reactEvents$" + Hr, py = "__reactListeners$" + Hr, hy = "__reactHandles$" + Hr;
function Tn(e) {
  var t = e[Nt];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if (t = n[Ut] || n[Nt]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = Ac(e); e !== null; ) {
        if (n = e[Nt]) return n;
        e = Ac(e);
      }
      return t;
    }
    e = n, n = e.parentNode;
  }
  return null;
}
function Go(e) {
  return e = e[Nt] || e[Ut], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
}
function ur(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(H(33));
}
function Nl(e) {
  return e[Po] || null;
}
var ru = [], ar = -1;
function vn(e) {
  return { current: e };
}
function ue(e) {
  0 > ar || (e.current = ru[ar], ru[ar] = null, ar--);
}
function ie(e, t) {
  ar++, ru[ar] = e.current, e.current = t;
}
var gn = {}, De = vn(gn), Ye = vn(!1), Fn = gn;
function Cr(e, t) {
  var n = e.type.contextTypes;
  if (!n) return gn;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
  var o = {}, i;
  for (i in n) o[i] = t[i];
  return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = o), o;
}
function Xe(e) {
  return e = e.childContextTypes, e != null;
}
function qi() {
  ue(Ye), ue(De);
}
function Ic(e, t, n) {
  if (De.current !== gn) throw Error(H(168));
  ie(De, t), ie(Ye, n);
}
function hp(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var o in r) if (!(o in t)) throw Error(H(108, J0(e) || "Unknown", o));
  return de({}, n, r);
}
function Ji(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || gn, Fn = De.current, ie(De, e), ie(Ye, Ye.current), !0;
}
function Dc(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(H(169));
  n ? (e = hp(e, t, Fn), r.__reactInternalMemoizedMergedChildContext = e, ue(Ye), ue(De), ie(De, e)) : ue(Ye), ie(Ye, n);
}
var Dt = null, Cl = !1, cs = !1;
function mp(e) {
  Dt === null ? Dt = [e] : Dt.push(e);
}
function my(e) {
  Cl = !0, mp(e);
}
function wn() {
  if (!cs && Dt !== null) {
    cs = !0;
    var e = 0, t = re;
    try {
      var n = Dt;
      for (re = 1; e < n.length; e++) {
        var r = n[e];
        do
          r = r(!0);
        while (r !== null);
      }
      Dt = null, Cl = !1;
    } catch (o) {
      throw Dt !== null && (Dt = Dt.slice(e + 1)), Vd(qu, wn), o;
    } finally {
      re = t, cs = !1;
    }
  }
  return null;
}
var cr = [], fr = 0, bi = null, el = 0, nt = [], rt = 0, Hn = null, Lt = 1, Ot = "";
function Cn(e, t) {
  cr[fr++] = el, cr[fr++] = bi, bi = e, el = t;
}
function gp(e, t, n) {
  nt[rt++] = Lt, nt[rt++] = Ot, nt[rt++] = Hn, Hn = e;
  var r = Lt;
  e = Ot;
  var o = 32 - yt(r) - 1;
  r &= ~(1 << o), n += 1;
  var i = 32 - yt(t) + o;
  if (30 < i) {
    var l = o - o % 5;
    i = (r & (1 << l) - 1).toString(32), r >>= l, o -= l, Lt = 1 << 32 - yt(t) + o | n << o | r, Ot = i + e;
  } else Lt = 1 << i | n << o | r, Ot = e;
}
function la(e) {
  e.return !== null && (Cn(e, 1), gp(e, 1, 0));
}
function sa(e) {
  for (; e === bi; ) bi = cr[--fr], cr[fr] = null, el = cr[--fr], cr[fr] = null;
  for (; e === Hn; ) Hn = nt[--rt], nt[rt] = null, Ot = nt[--rt], nt[rt] = null, Lt = nt[--rt], nt[rt] = null;
}
var qe = null, Ze = null, ae = !1, mt = null;
function yp(e, t) {
  var n = it(5, null, null, 0);
  n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
}
function Lc(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, qe = e, Ze = an(t.firstChild), !0) : !1;
    case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, qe = e, Ze = null, !0) : !1;
    case 13:
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = Hn !== null ? { id: Lt, overflow: Ot } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = it(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, qe = e, Ze = null, !0) : !1;
    default:
      return !1;
  }
}
function ou(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function iu(e) {
  if (ae) {
    var t = Ze;
    if (t) {
      var n = t;
      if (!Lc(e, t)) {
        if (ou(e)) throw Error(H(418));
        t = an(n.nextSibling);
        var r = qe;
        t && Lc(e, t) ? yp(r, n) : (e.flags = e.flags & -4097 | 2, ae = !1, qe = e);
      }
    } else {
      if (ou(e)) throw Error(H(418));
      e.flags = e.flags & -4097 | 2, ae = !1, qe = e;
    }
  }
}
function Oc(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  qe = e;
}
function fi(e) {
  if (e !== qe) return !1;
  if (!ae) return Oc(e), ae = !0, !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !eu(e.type, e.memoizedProps)), t && (t = Ze)) {
    if (ou(e)) throw vp(), Error(H(418));
    for (; t; ) yp(e, t), t = an(t.nextSibling);
  }
  if (Oc(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(H(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              Ze = an(e.nextSibling);
              break e;
            }
            t--;
          } else n !== "$" && n !== "$!" && n !== "$?" || t++;
        }
        e = e.nextSibling;
      }
      Ze = null;
    }
  } else Ze = qe ? an(e.stateNode.nextSibling) : null;
  return !0;
}
function vp() {
  for (var e = Ze; e; ) e = an(e.nextSibling);
}
function Mr() {
  Ze = qe = null, ae = !1;
}
function ua(e) {
  mt === null ? mt = [e] : mt.push(e);
}
var gy = Qt.ReactCurrentBatchConfig;
function Gr(e, t, n) {
  if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
    if (n._owner) {
      if (n = n._owner, n) {
        if (n.tag !== 1) throw Error(H(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(H(147, e));
      var o = r, i = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === i ? t.ref : (t = function(l) {
        var s = o.refs;
        l === null ? delete s[i] : s[i] = l;
      }, t._stringRef = i, t);
    }
    if (typeof e != "string") throw Error(H(284));
    if (!n._owner) throw Error(H(290, e));
  }
  return e;
}
function di(e, t) {
  throw e = Object.prototype.toString.call(t), Error(H(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function Fc(e) {
  var t = e._init;
  return t(e._payload);
}
function wp(e) {
  function t(p, h) {
    if (e) {
      var g = p.deletions;
      g === null ? (p.deletions = [h], p.flags |= 16) : g.push(h);
    }
  }
  function n(p, h) {
    if (!e) return null;
    for (; h !== null; ) t(p, h), h = h.sibling;
    return null;
  }
  function r(p, h) {
    for (p = /* @__PURE__ */ new Map(); h !== null; ) h.key !== null ? p.set(h.key, h) : p.set(h.index, h), h = h.sibling;
    return p;
  }
  function o(p, h) {
    return p = pn(p, h), p.index = 0, p.sibling = null, p;
  }
  function i(p, h, g) {
    return p.index = g, e ? (g = p.alternate, g !== null ? (g = g.index, g < h ? (p.flags |= 2, h) : g) : (p.flags |= 2, h)) : (p.flags |= 1048576, h);
  }
  function l(p) {
    return e && p.alternate === null && (p.flags |= 2), p;
  }
  function s(p, h, g, y) {
    return h === null || h.tag !== 6 ? (h = ys(g, p.mode, y), h.return = p, h) : (h = o(h, g), h.return = p, h);
  }
  function u(p, h, g, y) {
    var E = g.type;
    return E === or ? c(p, h, g.props.children, y, g.key) : h !== null && (h.elementType === E || typeof E == "object" && E !== null && E.$$typeof === Zt && Fc(E) === h.type) ? (y = o(h, g.props), y.ref = Gr(p, h, g), y.return = p, y) : (y = Oi(g.type, g.key, g.props, null, p.mode, y), y.ref = Gr(p, h, g), y.return = p, y);
  }
  function a(p, h, g, y) {
    return h === null || h.tag !== 4 || h.stateNode.containerInfo !== g.containerInfo || h.stateNode.implementation !== g.implementation ? (h = vs(g, p.mode, y), h.return = p, h) : (h = o(h, g.children || []), h.return = p, h);
  }
  function c(p, h, g, y, E) {
    return h === null || h.tag !== 7 ? (h = Dn(g, p.mode, y, E), h.return = p, h) : (h = o(h, g), h.return = p, h);
  }
  function f(p, h, g) {
    if (typeof h == "string" && h !== "" || typeof h == "number") return h = ys("" + h, p.mode, g), h.return = p, h;
    if (typeof h == "object" && h !== null) {
      switch (h.$$typeof) {
        case ti:
          return g = Oi(h.type, h.key, h.props, null, p.mode, g), g.ref = Gr(p, null, h), g.return = p, g;
        case rr:
          return h = vs(h, p.mode, g), h.return = p, h;
        case Zt:
          var y = h._init;
          return f(p, y(h._payload), g);
      }
      if (oo(h) || Wr(h)) return h = Dn(h, p.mode, g, null), h.return = p, h;
      di(p, h);
    }
    return null;
  }
  function d(p, h, g, y) {
    var E = h !== null ? h.key : null;
    if (typeof g == "string" && g !== "" || typeof g == "number") return E !== null ? null : s(p, h, "" + g, y);
    if (typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case ti:
          return g.key === E ? u(p, h, g, y) : null;
        case rr:
          return g.key === E ? a(p, h, g, y) : null;
        case Zt:
          return E = g._init, d(
            p,
            h,
            E(g._payload),
            y
          );
      }
      if (oo(g) || Wr(g)) return E !== null ? null : c(p, h, g, y, null);
      di(p, g);
    }
    return null;
  }
  function m(p, h, g, y, E) {
    if (typeof y == "string" && y !== "" || typeof y == "number") return p = p.get(g) || null, s(h, p, "" + y, E);
    if (typeof y == "object" && y !== null) {
      switch (y.$$typeof) {
        case ti:
          return p = p.get(y.key === null ? g : y.key) || null, u(h, p, y, E);
        case rr:
          return p = p.get(y.key === null ? g : y.key) || null, a(h, p, y, E);
        case Zt:
          var C = y._init;
          return m(p, h, g, C(y._payload), E);
      }
      if (oo(y) || Wr(y)) return p = p.get(g) || null, c(h, p, y, E, null);
      di(h, y);
    }
    return null;
  }
  function x(p, h, g, y) {
    for (var E = null, C = null, M = h, P = h = 0, A = null; M !== null && P < g.length; P++) {
      M.index > P ? (A = M, M = null) : A = M.sibling;
      var I = d(p, M, g[P], y);
      if (I === null) {
        M === null && (M = A);
        break;
      }
      e && M && I.alternate === null && t(p, M), h = i(I, h, P), C === null ? E = I : C.sibling = I, C = I, M = A;
    }
    if (P === g.length) return n(p, M), ae && Cn(p, P), E;
    if (M === null) {
      for (; P < g.length; P++) M = f(p, g[P], y), M !== null && (h = i(M, h, P), C === null ? E = M : C.sibling = M, C = M);
      return ae && Cn(p, P), E;
    }
    for (M = r(p, M); P < g.length; P++) A = m(M, p, P, g[P], y), A !== null && (e && A.alternate !== null && M.delete(A.key === null ? P : A.key), h = i(A, h, P), C === null ? E = A : C.sibling = A, C = A);
    return e && M.forEach(function(F) {
      return t(p, F);
    }), ae && Cn(p, P), E;
  }
  function w(p, h, g, y) {
    var E = Wr(g);
    if (typeof E != "function") throw Error(H(150));
    if (g = E.call(g), g == null) throw Error(H(151));
    for (var C = E = null, M = h, P = h = 0, A = null, I = g.next(); M !== null && !I.done; P++, I = g.next()) {
      M.index > P ? (A = M, M = null) : A = M.sibling;
      var F = d(p, M, I.value, y);
      if (F === null) {
        M === null && (M = A);
        break;
      }
      e && M && F.alternate === null && t(p, M), h = i(F, h, P), C === null ? E = F : C.sibling = F, C = F, M = A;
    }
    if (I.done) return n(
      p,
      M
    ), ae && Cn(p, P), E;
    if (M === null) {
      for (; !I.done; P++, I = g.next()) I = f(p, I.value, y), I !== null && (h = i(I, h, P), C === null ? E = I : C.sibling = I, C = I);
      return ae && Cn(p, P), E;
    }
    for (M = r(p, M); !I.done; P++, I = g.next()) I = m(M, p, P, I.value, y), I !== null && (e && I.alternate !== null && M.delete(I.key === null ? P : I.key), h = i(I, h, P), C === null ? E = I : C.sibling = I, C = I);
    return e && M.forEach(function(B) {
      return t(p, B);
    }), ae && Cn(p, P), E;
  }
  function _(p, h, g, y) {
    if (typeof g == "object" && g !== null && g.type === or && g.key === null && (g = g.props.children), typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case ti:
          e: {
            for (var E = g.key, C = h; C !== null; ) {
              if (C.key === E) {
                if (E = g.type, E === or) {
                  if (C.tag === 7) {
                    n(p, C.sibling), h = o(C, g.props.children), h.return = p, p = h;
                    break e;
                  }
                } else if (C.elementType === E || typeof E == "object" && E !== null && E.$$typeof === Zt && Fc(E) === C.type) {
                  n(p, C.sibling), h = o(C, g.props), h.ref = Gr(p, C, g), h.return = p, p = h;
                  break e;
                }
                n(p, C);
                break;
              } else t(p, C);
              C = C.sibling;
            }
            g.type === or ? (h = Dn(g.props.children, p.mode, y, g.key), h.return = p, p = h) : (y = Oi(g.type, g.key, g.props, null, p.mode, y), y.ref = Gr(p, h, g), y.return = p, p = y);
          }
          return l(p);
        case rr:
          e: {
            for (C = g.key; h !== null; ) {
              if (h.key === C) if (h.tag === 4 && h.stateNode.containerInfo === g.containerInfo && h.stateNode.implementation === g.implementation) {
                n(p, h.sibling), h = o(h, g.children || []), h.return = p, p = h;
                break e;
              } else {
                n(p, h);
                break;
              }
              else t(p, h);
              h = h.sibling;
            }
            h = vs(g, p.mode, y), h.return = p, p = h;
          }
          return l(p);
        case Zt:
          return C = g._init, _(p, h, C(g._payload), y);
      }
      if (oo(g)) return x(p, h, g, y);
      if (Wr(g)) return w(p, h, g, y);
      di(p, g);
    }
    return typeof g == "string" && g !== "" || typeof g == "number" ? (g = "" + g, h !== null && h.tag === 6 ? (n(p, h.sibling), h = o(h, g), h.return = p, p = h) : (n(p, h), h = ys(g, p.mode, y), h.return = p, p = h), l(p)) : n(p, h);
  }
  return _;
}
var zr = wp(!0), xp = wp(!1), tl = vn(null), nl = null, dr = null, aa = null;
function ca() {
  aa = dr = nl = null;
}
function fa(e) {
  var t = tl.current;
  ue(tl), e._currentValue = t;
}
function lu(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function xr(e, t) {
  nl = e, aa = dr = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (je = !0), e.firstContext = null);
}
function ut(e) {
  var t = e._currentValue;
  if (aa !== e) if (e = { context: e, memoizedValue: t, next: null }, dr === null) {
    if (nl === null) throw Error(H(308));
    dr = e, nl.dependencies = { lanes: 0, firstContext: e };
  } else dr = dr.next = e;
  return t;
}
var Pn = null;
function da(e) {
  Pn === null ? Pn = [e] : Pn.push(e);
}
function Sp(e, t, n, r) {
  var o = t.interleaved;
  return o === null ? (n.next = n, da(t)) : (n.next = o.next, o.next = n), t.interleaved = n, jt(e, r);
}
function jt(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; ) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
  return n.tag === 3 ? n.stateNode : null;
}
var qt = !1;
function pa(e) {
  e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function _p(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
}
function Ht(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function cn(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, b & 2) {
    var o = r.pending;
    return o === null ? t.next = t : (t.next = o.next, o.next = t), r.pending = t, jt(e, n);
  }
  return o = r.interleaved, o === null ? (t.next = t, da(r)) : (t.next = o.next, o.next = t), r.interleaved = t, jt(e, n);
}
function $i(e, t, n) {
  if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, Ju(e, n);
  }
}
function Hc(e, t) {
  var n = e.updateQueue, r = e.alternate;
  if (r !== null && (r = r.updateQueue, n === r)) {
    var o = null, i = null;
    if (n = n.firstBaseUpdate, n !== null) {
      do {
        var l = { eventTime: n.eventTime, lane: n.lane, tag: n.tag, payload: n.payload, callback: n.callback, next: null };
        i === null ? o = i = l : i = i.next = l, n = n.next;
      } while (n !== null);
      i === null ? o = i = t : i = i.next = t;
    } else o = i = t;
    n = { baseState: r.baseState, firstBaseUpdate: o, lastBaseUpdate: i, shared: r.shared, effects: r.effects }, e.updateQueue = n;
    return;
  }
  e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
}
function rl(e, t, n, r) {
  var o = e.updateQueue;
  qt = !1;
  var i = o.firstBaseUpdate, l = o.lastBaseUpdate, s = o.shared.pending;
  if (s !== null) {
    o.shared.pending = null;
    var u = s, a = u.next;
    u.next = null, l === null ? i = a : l.next = a, l = u;
    var c = e.alternate;
    c !== null && (c = c.updateQueue, s = c.lastBaseUpdate, s !== l && (s === null ? c.firstBaseUpdate = a : s.next = a, c.lastBaseUpdate = u));
  }
  if (i !== null) {
    var f = o.baseState;
    l = 0, c = a = u = null, s = i;
    do {
      var d = s.lane, m = s.eventTime;
      if ((r & d) === d) {
        c !== null && (c = c.next = {
          eventTime: m,
          lane: 0,
          tag: s.tag,
          payload: s.payload,
          callback: s.callback,
          next: null
        });
        e: {
          var x = e, w = s;
          switch (d = t, m = n, w.tag) {
            case 1:
              if (x = w.payload, typeof x == "function") {
                f = x.call(m, f, d);
                break e;
              }
              f = x;
              break e;
            case 3:
              x.flags = x.flags & -65537 | 128;
            case 0:
              if (x = w.payload, d = typeof x == "function" ? x.call(m, f, d) : x, d == null) break e;
              f = de({}, f, d);
              break e;
            case 2:
              qt = !0;
          }
        }
        s.callback !== null && s.lane !== 0 && (e.flags |= 64, d = o.effects, d === null ? o.effects = [s] : d.push(s));
      } else m = { eventTime: m, lane: d, tag: s.tag, payload: s.payload, callback: s.callback, next: null }, c === null ? (a = c = m, u = f) : c = c.next = m, l |= d;
      if (s = s.next, s === null) {
        if (s = o.shared.pending, s === null) break;
        d = s, s = d.next, d.next = null, o.lastBaseUpdate = d, o.shared.pending = null;
      }
    } while (!0);
    if (c === null && (u = f), o.baseState = u, o.firstBaseUpdate = a, o.lastBaseUpdate = c, t = o.shared.interleaved, t !== null) {
      o = t;
      do
        l |= o.lane, o = o.next;
      while (o !== t);
    } else i === null && (o.shared.lanes = 0);
    Bn |= l, e.lanes = l, e.memoizedState = f;
  }
}
function Vc(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t], o = r.callback;
    if (o !== null) {
      if (r.callback = null, r = n, typeof o != "function") throw Error(H(191, o));
      o.call(r);
    }
  }
}
var Zo = {}, Mt = vn(Zo), $o = vn(Zo), Ro = vn(Zo);
function $n(e) {
  if (e === Zo) throw Error(H(174));
  return e;
}
function ha(e, t) {
  switch (ie(Ro, t), ie($o, e), ie(Mt, Zo), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Vs(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Vs(t, e);
  }
  ue(Mt), ie(Mt, t);
}
function Tr() {
  ue(Mt), ue($o), ue(Ro);
}
function Ep(e) {
  $n(Ro.current);
  var t = $n(Mt.current), n = Vs(t, e.type);
  t !== n && (ie($o, e), ie(Mt, n));
}
function ma(e) {
  $o.current === e && (ue(Mt), ue($o));
}
var ce = vn(0);
function ol(e) {
  for (var t = e; t !== null; ) {
    if (t.tag === 13) {
      var n = t.memoizedState;
      if (n !== null && (n = n.dehydrated, n === null || n.data === "$?" || n.data === "$!")) return t;
    } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      t.child.return = t, t = t.child;
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null; ) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    t.sibling.return = t.return, t = t.sibling;
  }
  return null;
}
var fs = [];
function ga() {
  for (var e = 0; e < fs.length; e++) fs[e]._workInProgressVersionPrimary = null;
  fs.length = 0;
}
var Ri = Qt.ReactCurrentDispatcher, ds = Qt.ReactCurrentBatchConfig, Vn = 0, fe = null, we = null, _e = null, il = !1, go = !1, Ao = 0, yy = 0;
function Re() {
  throw Error(H(321));
}
function ya(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!xt(e[n], t[n])) return !1;
  return !0;
}
function va(e, t, n, r, o, i) {
  if (Vn = i, fe = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, Ri.current = e === null || e.memoizedState === null ? Sy : _y, e = n(r, o), go) {
    i = 0;
    do {
      if (go = !1, Ao = 0, 25 <= i) throw Error(H(301));
      i += 1, _e = we = null, t.updateQueue = null, Ri.current = Ey, e = n(r, o);
    } while (go);
  }
  if (Ri.current = ll, t = we !== null && we.next !== null, Vn = 0, _e = we = fe = null, il = !1, t) throw Error(H(300));
  return e;
}
function wa() {
  var e = Ao !== 0;
  return Ao = 0, e;
}
function kt() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return _e === null ? fe.memoizedState = _e = e : _e = _e.next = e, _e;
}
function at() {
  if (we === null) {
    var e = fe.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = we.next;
  var t = _e === null ? fe.memoizedState : _e.next;
  if (t !== null) _e = t, we = e;
  else {
    if (e === null) throw Error(H(310));
    we = e, e = { memoizedState: we.memoizedState, baseState: we.baseState, baseQueue: we.baseQueue, queue: we.queue, next: null }, _e === null ? fe.memoizedState = _e = e : _e = _e.next = e;
  }
  return _e;
}
function Io(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function ps(e) {
  var t = at(), n = t.queue;
  if (n === null) throw Error(H(311));
  n.lastRenderedReducer = e;
  var r = we, o = r.baseQueue, i = n.pending;
  if (i !== null) {
    if (o !== null) {
      var l = o.next;
      o.next = i.next, i.next = l;
    }
    r.baseQueue = o = i, n.pending = null;
  }
  if (o !== null) {
    i = o.next, r = r.baseState;
    var s = l = null, u = null, a = i;
    do {
      var c = a.lane;
      if ((Vn & c) === c) u !== null && (u = u.next = { lane: 0, action: a.action, hasEagerState: a.hasEagerState, eagerState: a.eagerState, next: null }), r = a.hasEagerState ? a.eagerState : e(r, a.action);
      else {
        var f = {
          lane: c,
          action: a.action,
          hasEagerState: a.hasEagerState,
          eagerState: a.eagerState,
          next: null
        };
        u === null ? (s = u = f, l = r) : u = u.next = f, fe.lanes |= c, Bn |= c;
      }
      a = a.next;
    } while (a !== null && a !== i);
    u === null ? l = r : u.next = s, xt(r, t.memoizedState) || (je = !0), t.memoizedState = r, t.baseState = l, t.baseQueue = u, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    o = e;
    do
      i = o.lane, fe.lanes |= i, Bn |= i, o = o.next;
    while (o !== e);
  } else o === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function hs(e) {
  var t = at(), n = t.queue;
  if (n === null) throw Error(H(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch, o = n.pending, i = t.memoizedState;
  if (o !== null) {
    n.pending = null;
    var l = o = o.next;
    do
      i = e(i, l.action), l = l.next;
    while (l !== o);
    xt(i, t.memoizedState) || (je = !0), t.memoizedState = i, t.baseQueue === null && (t.baseState = i), n.lastRenderedState = i;
  }
  return [i, r];
}
function kp() {
}
function Np(e, t) {
  var n = fe, r = at(), o = t(), i = !xt(r.memoizedState, o);
  if (i && (r.memoizedState = o, je = !0), r = r.queue, xa(zp.bind(null, n, r, e), [e]), r.getSnapshot !== t || i || _e !== null && _e.memoizedState.tag & 1) {
    if (n.flags |= 2048, Do(9, Mp.bind(null, n, r, o, t), void 0, null), Ee === null) throw Error(H(349));
    Vn & 30 || Cp(n, t, o);
  }
  return o;
}
function Cp(e, t, n) {
  e.flags |= 16384, e = { getSnapshot: t, value: n }, t = fe.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, fe.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function Mp(e, t, n, r) {
  t.value = n, t.getSnapshot = r, Tp(t) && Pp(e);
}
function zp(e, t, n) {
  return n(function() {
    Tp(t) && Pp(e);
  });
}
function Tp(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !xt(e, n);
  } catch {
    return !0;
  }
}
function Pp(e) {
  var t = jt(e, 1);
  t !== null && vt(t, e, 1, -1);
}
function Bc(e) {
  var t = kt();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Io, lastRenderedState: e }, t.queue = e, e = e.dispatch = xy.bind(null, fe, e), [t.memoizedState, e];
}
function Do(e, t, n, r) {
  return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = fe.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, fe.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function $p() {
  return at().memoizedState;
}
function Ai(e, t, n, r) {
  var o = kt();
  fe.flags |= e, o.memoizedState = Do(1 | t, n, void 0, r === void 0 ? null : r);
}
function Ml(e, t, n, r) {
  var o = at();
  r = r === void 0 ? null : r;
  var i = void 0;
  if (we !== null) {
    var l = we.memoizedState;
    if (i = l.destroy, r !== null && ya(r, l.deps)) {
      o.memoizedState = Do(t, n, i, r);
      return;
    }
  }
  fe.flags |= e, o.memoizedState = Do(1 | t, n, i, r);
}
function Uc(e, t) {
  return Ai(8390656, 8, e, t);
}
function xa(e, t) {
  return Ml(2048, 8, e, t);
}
function Rp(e, t) {
  return Ml(4, 2, e, t);
}
function Ap(e, t) {
  return Ml(4, 4, e, t);
}
function Ip(e, t) {
  if (typeof t == "function") return e = e(), t(e), function() {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function() {
    t.current = null;
  };
}
function Dp(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Ml(4, 4, Ip.bind(null, t, e), n);
}
function Sa() {
}
function Lp(e, t) {
  var n = at();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && ya(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function Op(e, t) {
  var n = at();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && ya(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function Fp(e, t, n) {
  return Vn & 21 ? (xt(n, t) || (n = jd(), fe.lanes |= n, Bn |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, je = !0), e.memoizedState = n);
}
function vy(e, t) {
  var n = re;
  re = n !== 0 && 4 > n ? n : 4, e(!0);
  var r = ds.transition;
  ds.transition = {};
  try {
    e(!1), t();
  } finally {
    re = n, ds.transition = r;
  }
}
function Hp() {
  return at().memoizedState;
}
function wy(e, t, n) {
  var r = dn(e);
  if (n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, Vp(e)) Bp(t, n);
  else if (n = Sp(e, t, n, r), n !== null) {
    var o = He();
    vt(n, e, r, o), Up(n, t, r);
  }
}
function xy(e, t, n) {
  var r = dn(e), o = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (Vp(e)) Bp(t, o);
  else {
    var i = e.alternate;
    if (e.lanes === 0 && (i === null || i.lanes === 0) && (i = t.lastRenderedReducer, i !== null)) try {
      var l = t.lastRenderedState, s = i(l, n);
      if (o.hasEagerState = !0, o.eagerState = s, xt(s, l)) {
        var u = t.interleaved;
        u === null ? (o.next = o, da(t)) : (o.next = u.next, u.next = o), t.interleaved = o;
        return;
      }
    } catch {
    } finally {
    }
    n = Sp(e, t, o, r), n !== null && (o = He(), vt(n, e, r, o), Up(n, t, r));
  }
}
function Vp(e) {
  var t = e.alternate;
  return e === fe || t !== null && t === fe;
}
function Bp(e, t) {
  go = il = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function Up(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, Ju(e, n);
  }
}
var ll = { readContext: ut, useCallback: Re, useContext: Re, useEffect: Re, useImperativeHandle: Re, useInsertionEffect: Re, useLayoutEffect: Re, useMemo: Re, useReducer: Re, useRef: Re, useState: Re, useDebugValue: Re, useDeferredValue: Re, useTransition: Re, useMutableSource: Re, useSyncExternalStore: Re, useId: Re, unstable_isNewReconciler: !1 }, Sy = { readContext: ut, useCallback: function(e, t) {
  return kt().memoizedState = [e, t === void 0 ? null : t], e;
}, useContext: ut, useEffect: Uc, useImperativeHandle: function(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Ai(
    4194308,
    4,
    Ip.bind(null, t, e),
    n
  );
}, useLayoutEffect: function(e, t) {
  return Ai(4194308, 4, e, t);
}, useInsertionEffect: function(e, t) {
  return Ai(4, 2, e, t);
}, useMemo: function(e, t) {
  var n = kt();
  return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
}, useReducer: function(e, t, n) {
  var r = kt();
  return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = wy.bind(null, fe, e), [r.memoizedState, e];
}, useRef: function(e) {
  var t = kt();
  return e = { current: e }, t.memoizedState = e;
}, useState: Bc, useDebugValue: Sa, useDeferredValue: function(e) {
  return kt().memoizedState = e;
}, useTransition: function() {
  var e = Bc(!1), t = e[0];
  return e = vy.bind(null, e[1]), kt().memoizedState = e, [t, e];
}, useMutableSource: function() {
}, useSyncExternalStore: function(e, t, n) {
  var r = fe, o = kt();
  if (ae) {
    if (n === void 0) throw Error(H(407));
    n = n();
  } else {
    if (n = t(), Ee === null) throw Error(H(349));
    Vn & 30 || Cp(r, t, n);
  }
  o.memoizedState = n;
  var i = { value: n, getSnapshot: t };
  return o.queue = i, Uc(zp.bind(
    null,
    r,
    i,
    e
  ), [e]), r.flags |= 2048, Do(9, Mp.bind(null, r, i, n, t), void 0, null), n;
}, useId: function() {
  var e = kt(), t = Ee.identifierPrefix;
  if (ae) {
    var n = Ot, r = Lt;
    n = (r & ~(1 << 32 - yt(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = Ao++, 0 < n && (t += "H" + n.toString(32)), t += ":";
  } else n = yy++, t = ":" + t + "r" + n.toString(32) + ":";
  return e.memoizedState = t;
}, unstable_isNewReconciler: !1 }, _y = {
  readContext: ut,
  useCallback: Lp,
  useContext: ut,
  useEffect: xa,
  useImperativeHandle: Dp,
  useInsertionEffect: Rp,
  useLayoutEffect: Ap,
  useMemo: Op,
  useReducer: ps,
  useRef: $p,
  useState: function() {
    return ps(Io);
  },
  useDebugValue: Sa,
  useDeferredValue: function(e) {
    var t = at();
    return Fp(t, we.memoizedState, e);
  },
  useTransition: function() {
    var e = ps(Io)[0], t = at().memoizedState;
    return [e, t];
  },
  useMutableSource: kp,
  useSyncExternalStore: Np,
  useId: Hp,
  unstable_isNewReconciler: !1
}, Ey = { readContext: ut, useCallback: Lp, useContext: ut, useEffect: xa, useImperativeHandle: Dp, useInsertionEffect: Rp, useLayoutEffect: Ap, useMemo: Op, useReducer: hs, useRef: $p, useState: function() {
  return hs(Io);
}, useDebugValue: Sa, useDeferredValue: function(e) {
  var t = at();
  return we === null ? t.memoizedState = e : Fp(t, we.memoizedState, e);
}, useTransition: function() {
  var e = hs(Io)[0], t = at().memoizedState;
  return [e, t];
}, useMutableSource: kp, useSyncExternalStore: Np, useId: Hp, unstable_isNewReconciler: !1 };
function dt(e, t) {
  if (e && e.defaultProps) {
    t = de({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function su(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : de({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var zl = { isMounted: function(e) {
  return (e = e._reactInternals) ? Xn(e) === e : !1;
}, enqueueSetState: function(e, t, n) {
  e = e._reactInternals;
  var r = He(), o = dn(e), i = Ht(r, o);
  i.payload = t, n != null && (i.callback = n), t = cn(e, i, o), t !== null && (vt(t, e, o, r), $i(t, e, o));
}, enqueueReplaceState: function(e, t, n) {
  e = e._reactInternals;
  var r = He(), o = dn(e), i = Ht(r, o);
  i.tag = 1, i.payload = t, n != null && (i.callback = n), t = cn(e, i, o), t !== null && (vt(t, e, o, r), $i(t, e, o));
}, enqueueForceUpdate: function(e, t) {
  e = e._reactInternals;
  var n = He(), r = dn(e), o = Ht(n, r);
  o.tag = 2, t != null && (o.callback = t), t = cn(e, o, r), t !== null && (vt(t, e, r, n), $i(t, e, r));
} };
function jc(e, t, n, r, o, i, l) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, i, l) : t.prototype && t.prototype.isPureReactComponent ? !Mo(n, r) || !Mo(o, i) : !0;
}
function jp(e, t, n) {
  var r = !1, o = gn, i = t.contextType;
  return typeof i == "object" && i !== null ? i = ut(i) : (o = Xe(t) ? Fn : De.current, r = t.contextTypes, i = (r = r != null) ? Cr(e, o) : gn), t = new t(n, i), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = zl, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = o, e.__reactInternalMemoizedMaskedChildContext = i), t;
}
function Wc(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && zl.enqueueReplaceState(t, t.state, null);
}
function uu(e, t, n, r) {
  var o = e.stateNode;
  o.props = n, o.state = e.memoizedState, o.refs = {}, pa(e);
  var i = t.contextType;
  typeof i == "object" && i !== null ? o.context = ut(i) : (i = Xe(t) ? Fn : De.current, o.context = Cr(e, i)), o.state = e.memoizedState, i = t.getDerivedStateFromProps, typeof i == "function" && (su(e, t, i, n), o.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof o.getSnapshotBeforeUpdate == "function" || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (t = o.state, typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount(), t !== o.state && zl.enqueueReplaceState(o, o.state, null), rl(e, n, o, r), o.state = e.memoizedState), typeof o.componentDidMount == "function" && (e.flags |= 4194308);
}
function Pr(e, t) {
  try {
    var n = "", r = t;
    do
      n += q0(r), r = r.return;
    while (r);
    var o = n;
  } catch (i) {
    o = `
Error generating stack: ` + i.message + `
` + i.stack;
  }
  return { value: e, source: t, stack: o, digest: null };
}
function ms(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function au(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function() {
      throw n;
    });
  }
}
var ky = typeof WeakMap == "function" ? WeakMap : Map;
function Wp(e, t, n) {
  n = Ht(-1, n), n.tag = 3, n.payload = { element: null };
  var r = t.value;
  return n.callback = function() {
    ul || (ul = !0, wu = r), au(e, t);
  }, n;
}
function Yp(e, t, n) {
  n = Ht(-1, n), n.tag = 3;
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var o = t.value;
    n.payload = function() {
      return r(o);
    }, n.callback = function() {
      au(e, t);
    };
  }
  var i = e.stateNode;
  return i !== null && typeof i.componentDidCatch == "function" && (n.callback = function() {
    au(e, t), typeof r != "function" && (fn === null ? fn = /* @__PURE__ */ new Set([this]) : fn.add(this));
    var l = t.stack;
    this.componentDidCatch(t.value, { componentStack: l !== null ? l : "" });
  }), n;
}
function Yc(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new ky();
    var o = /* @__PURE__ */ new Set();
    r.set(t, o);
  } else o = r.get(t), o === void 0 && (o = /* @__PURE__ */ new Set(), r.set(t, o));
  o.has(n) || (o.add(n), e = Fy.bind(null, e, t, n), t.then(e, e));
}
function Xc(e) {
  do {
    var t;
    if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function Qc(e, t, n, r, o) {
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = o, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = Ht(-1, 1), t.tag = 2, cn(n, t, 1))), n.lanes |= 1), e);
}
var Ny = Qt.ReactCurrentOwner, je = !1;
function Fe(e, t, n, r) {
  t.child = e === null ? xp(t, null, n, r) : zr(t, e.child, n, r);
}
function Kc(e, t, n, r, o) {
  n = n.render;
  var i = t.ref;
  return xr(t, o), r = va(e, t, n, r, i, o), n = wa(), e !== null && !je ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~o, Wt(e, t, o)) : (ae && n && la(t), t.flags |= 1, Fe(e, t, r, o), t.child);
}
function Gc(e, t, n, r, o) {
  if (e === null) {
    var i = n.type;
    return typeof i == "function" && !Ta(i) && i.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = i, Xp(e, t, i, r, o)) : (e = Oi(n.type, null, r, t, t.mode, o), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (i = e.child, !(e.lanes & o)) {
    var l = i.memoizedProps;
    if (n = n.compare, n = n !== null ? n : Mo, n(l, r) && e.ref === t.ref) return Wt(e, t, o);
  }
  return t.flags |= 1, e = pn(i, r), e.ref = t.ref, e.return = t, t.child = e;
}
function Xp(e, t, n, r, o) {
  if (e !== null) {
    var i = e.memoizedProps;
    if (Mo(i, r) && e.ref === t.ref) if (je = !1, t.pendingProps = r = i, (e.lanes & o) !== 0) e.flags & 131072 && (je = !0);
    else return t.lanes = e.lanes, Wt(e, t, o);
  }
  return cu(e, t, n, r, o);
}
function Qp(e, t, n) {
  var r = t.pendingProps, o = r.children, i = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, ie(hr, Ge), Ge |= n;
  else {
    if (!(n & 1073741824)) return e = i !== null ? i.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, ie(hr, Ge), Ge |= e, null;
    t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = i !== null ? i.baseLanes : n, ie(hr, Ge), Ge |= r;
  }
  else i !== null ? (r = i.baseLanes | n, t.memoizedState = null) : r = n, ie(hr, Ge), Ge |= r;
  return Fe(e, t, o, n), t.child;
}
function Kp(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function cu(e, t, n, r, o) {
  var i = Xe(n) ? Fn : De.current;
  return i = Cr(t, i), xr(t, o), n = va(e, t, n, r, i, o), r = wa(), e !== null && !je ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~o, Wt(e, t, o)) : (ae && r && la(t), t.flags |= 1, Fe(e, t, n, o), t.child);
}
function Zc(e, t, n, r, o) {
  if (Xe(n)) {
    var i = !0;
    Ji(t);
  } else i = !1;
  if (xr(t, o), t.stateNode === null) Ii(e, t), jp(t, n, r), uu(t, n, r, o), r = !0;
  else if (e === null) {
    var l = t.stateNode, s = t.memoizedProps;
    l.props = s;
    var u = l.context, a = n.contextType;
    typeof a == "object" && a !== null ? a = ut(a) : (a = Xe(n) ? Fn : De.current, a = Cr(t, a));
    var c = n.getDerivedStateFromProps, f = typeof c == "function" || typeof l.getSnapshotBeforeUpdate == "function";
    f || typeof l.UNSAFE_componentWillReceiveProps != "function" && typeof l.componentWillReceiveProps != "function" || (s !== r || u !== a) && Wc(t, l, r, a), qt = !1;
    var d = t.memoizedState;
    l.state = d, rl(t, r, l, o), u = t.memoizedState, s !== r || d !== u || Ye.current || qt ? (typeof c == "function" && (su(t, n, c, r), u = t.memoizedState), (s = qt || jc(t, n, s, r, d, u, a)) ? (f || typeof l.UNSAFE_componentWillMount != "function" && typeof l.componentWillMount != "function" || (typeof l.componentWillMount == "function" && l.componentWillMount(), typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount()), typeof l.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof l.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = u), l.props = r, l.state = u, l.context = a, r = s) : (typeof l.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
  } else {
    l = t.stateNode, _p(e, t), s = t.memoizedProps, a = t.type === t.elementType ? s : dt(t.type, s), l.props = a, f = t.pendingProps, d = l.context, u = n.contextType, typeof u == "object" && u !== null ? u = ut(u) : (u = Xe(n) ? Fn : De.current, u = Cr(t, u));
    var m = n.getDerivedStateFromProps;
    (c = typeof m == "function" || typeof l.getSnapshotBeforeUpdate == "function") || typeof l.UNSAFE_componentWillReceiveProps != "function" && typeof l.componentWillReceiveProps != "function" || (s !== f || d !== u) && Wc(t, l, r, u), qt = !1, d = t.memoizedState, l.state = d, rl(t, r, l, o);
    var x = t.memoizedState;
    s !== f || d !== x || Ye.current || qt ? (typeof m == "function" && (su(t, n, m, r), x = t.memoizedState), (a = qt || jc(t, n, a, r, d, x, u) || !1) ? (c || typeof l.UNSAFE_componentWillUpdate != "function" && typeof l.componentWillUpdate != "function" || (typeof l.componentWillUpdate == "function" && l.componentWillUpdate(r, x, u), typeof l.UNSAFE_componentWillUpdate == "function" && l.UNSAFE_componentWillUpdate(r, x, u)), typeof l.componentDidUpdate == "function" && (t.flags |= 4), typeof l.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof l.componentDidUpdate != "function" || s === e.memoizedProps && d === e.memoizedState || (t.flags |= 4), typeof l.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && d === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = x), l.props = r, l.state = x, l.context = u, r = a) : (typeof l.componentDidUpdate != "function" || s === e.memoizedProps && d === e.memoizedState || (t.flags |= 4), typeof l.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && d === e.memoizedState || (t.flags |= 1024), r = !1);
  }
  return fu(e, t, n, r, i, o);
}
function fu(e, t, n, r, o, i) {
  Kp(e, t);
  var l = (t.flags & 128) !== 0;
  if (!r && !l) return o && Dc(t, n, !1), Wt(e, t, i);
  r = t.stateNode, Ny.current = t;
  var s = l && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && l ? (t.child = zr(t, e.child, null, i), t.child = zr(t, null, s, i)) : Fe(e, t, s, i), t.memoizedState = r.state, o && Dc(t, n, !0), t.child;
}
function Gp(e) {
  var t = e.stateNode;
  t.pendingContext ? Ic(e, t.pendingContext, t.pendingContext !== t.context) : t.context && Ic(e, t.context, !1), ha(e, t.containerInfo);
}
function qc(e, t, n, r, o) {
  return Mr(), ua(o), t.flags |= 256, Fe(e, t, n, r), t.child;
}
var du = { dehydrated: null, treeContext: null, retryLane: 0 };
function pu(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function Zp(e, t, n) {
  var r = t.pendingProps, o = ce.current, i = !1, l = (t.flags & 128) !== 0, s;
  if ((s = l) || (s = e !== null && e.memoizedState === null ? !1 : (o & 2) !== 0), s ? (i = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (o |= 1), ie(ce, o & 1), e === null)
    return iu(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (l = r.children, e = r.fallback, i ? (r = t.mode, i = t.child, l = { mode: "hidden", children: l }, !(r & 1) && i !== null ? (i.childLanes = 0, i.pendingProps = l) : i = $l(l, r, 0, null), e = Dn(e, r, n, null), i.return = t, e.return = t, i.sibling = e, t.child = i, t.child.memoizedState = pu(n), t.memoizedState = du, e) : _a(t, l));
  if (o = e.memoizedState, o !== null && (s = o.dehydrated, s !== null)) return Cy(e, t, l, r, s, o, n);
  if (i) {
    i = r.fallback, l = t.mode, o = e.child, s = o.sibling;
    var u = { mode: "hidden", children: r.children };
    return !(l & 1) && t.child !== o ? (r = t.child, r.childLanes = 0, r.pendingProps = u, t.deletions = null) : (r = pn(o, u), r.subtreeFlags = o.subtreeFlags & 14680064), s !== null ? i = pn(s, i) : (i = Dn(i, l, n, null), i.flags |= 2), i.return = t, r.return = t, r.sibling = i, t.child = r, r = i, i = t.child, l = e.child.memoizedState, l = l === null ? pu(n) : { baseLanes: l.baseLanes | n, cachePool: null, transitions: l.transitions }, i.memoizedState = l, i.childLanes = e.childLanes & ~n, t.memoizedState = du, r;
  }
  return i = e.child, e = i.sibling, r = pn(i, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function _a(e, t) {
  return t = $l({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
}
function pi(e, t, n, r) {
  return r !== null && ua(r), zr(t, e.child, null, n), e = _a(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function Cy(e, t, n, r, o, i, l) {
  if (n)
    return t.flags & 256 ? (t.flags &= -257, r = ms(Error(H(422))), pi(e, t, l, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (i = r.fallback, o = t.mode, r = $l({ mode: "visible", children: r.children }, o, 0, null), i = Dn(i, o, l, null), i.flags |= 2, r.return = t, i.return = t, r.sibling = i, t.child = r, t.mode & 1 && zr(t, e.child, null, l), t.child.memoizedState = pu(l), t.memoizedState = du, i);
  if (!(t.mode & 1)) return pi(e, t, l, null);
  if (o.data === "$!") {
    if (r = o.nextSibling && o.nextSibling.dataset, r) var s = r.dgst;
    return r = s, i = Error(H(419)), r = ms(i, r, void 0), pi(e, t, l, r);
  }
  if (s = (l & e.childLanes) !== 0, je || s) {
    if (r = Ee, r !== null) {
      switch (l & -l) {
        case 4:
          o = 2;
          break;
        case 16:
          o = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          o = 32;
          break;
        case 536870912:
          o = 268435456;
          break;
        default:
          o = 0;
      }
      o = o & (r.suspendedLanes | l) ? 0 : o, o !== 0 && o !== i.retryLane && (i.retryLane = o, jt(e, o), vt(r, e, o, -1));
    }
    return za(), r = ms(Error(H(421))), pi(e, t, l, r);
  }
  return o.data === "$?" ? (t.flags |= 128, t.child = e.child, t = Hy.bind(null, e), o._reactRetry = t, null) : (e = i.treeContext, Ze = an(o.nextSibling), qe = t, ae = !0, mt = null, e !== null && (nt[rt++] = Lt, nt[rt++] = Ot, nt[rt++] = Hn, Lt = e.id, Ot = e.overflow, Hn = t), t = _a(t, r.children), t.flags |= 4096, t);
}
function Jc(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), lu(e.return, t, n);
}
function gs(e, t, n, r, o) {
  var i = e.memoizedState;
  i === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: o } : (i.isBackwards = t, i.rendering = null, i.renderingStartTime = 0, i.last = r, i.tail = n, i.tailMode = o);
}
function qp(e, t, n) {
  var r = t.pendingProps, o = r.revealOrder, i = r.tail;
  if (Fe(e, t, r.children, n), r = ce.current, r & 2) r = r & 1 | 2, t.flags |= 128;
  else {
    if (e !== null && e.flags & 128) e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && Jc(e, n, t);
      else if (e.tag === 19) Jc(e, n, t);
      else if (e.child !== null) {
        e.child.return = e, e = e.child;
        continue;
      }
      if (e === t) break e;
      for (; e.sibling === null; ) {
        if (e.return === null || e.return === t) break e;
        e = e.return;
      }
      e.sibling.return = e.return, e = e.sibling;
    }
    r &= 1;
  }
  if (ie(ce, r), !(t.mode & 1)) t.memoizedState = null;
  else switch (o) {
    case "forwards":
      for (n = t.child, o = null; n !== null; ) e = n.alternate, e !== null && ol(e) === null && (o = n), n = n.sibling;
      n = o, n === null ? (o = t.child, t.child = null) : (o = n.sibling, n.sibling = null), gs(t, !1, o, n, i);
      break;
    case "backwards":
      for (n = null, o = t.child, t.child = null; o !== null; ) {
        if (e = o.alternate, e !== null && ol(e) === null) {
          t.child = o;
          break;
        }
        e = o.sibling, o.sibling = n, n = o, o = e;
      }
      gs(t, !0, n, null, i);
      break;
    case "together":
      gs(t, !1, null, null, void 0);
      break;
    default:
      t.memoizedState = null;
  }
  return t.child;
}
function Ii(e, t) {
  !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
}
function Wt(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies), Bn |= t.lanes, !(n & t.childLanes)) return null;
  if (e !== null && t.child !== e.child) throw Error(H(153));
  if (t.child !== null) {
    for (e = t.child, n = pn(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = pn(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function My(e, t, n) {
  switch (t.tag) {
    case 3:
      Gp(t), Mr();
      break;
    case 5:
      Ep(t);
      break;
    case 1:
      Xe(t.type) && Ji(t);
      break;
    case 4:
      ha(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context, o = t.memoizedProps.value;
      ie(tl, r._currentValue), r._currentValue = o;
      break;
    case 13:
      if (r = t.memoizedState, r !== null)
        return r.dehydrated !== null ? (ie(ce, ce.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? Zp(e, t, n) : (ie(ce, ce.current & 1), e = Wt(e, t, n), e !== null ? e.sibling : null);
      ie(ce, ce.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return qp(e, t, n);
        t.flags |= 128;
      }
      if (o = t.memoizedState, o !== null && (o.rendering = null, o.tail = null, o.lastEffect = null), ie(ce, ce.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, Qp(e, t, n);
  }
  return Wt(e, t, n);
}
var Jp, hu, bp, eh;
Jp = function(e, t) {
  for (var n = t.child; n !== null; ) {
    if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
    else if (n.tag !== 4 && n.child !== null) {
      n.child.return = n, n = n.child;
      continue;
    }
    if (n === t) break;
    for (; n.sibling === null; ) {
      if (n.return === null || n.return === t) return;
      n = n.return;
    }
    n.sibling.return = n.return, n = n.sibling;
  }
};
hu = function() {
};
bp = function(e, t, n, r) {
  var o = e.memoizedProps;
  if (o !== r) {
    e = t.stateNode, $n(Mt.current);
    var i = null;
    switch (n) {
      case "input":
        o = Ls(e, o), r = Ls(e, r), i = [];
        break;
      case "select":
        o = de({}, o, { value: void 0 }), r = de({}, r, { value: void 0 }), i = [];
        break;
      case "textarea":
        o = Hs(e, o), r = Hs(e, r), i = [];
        break;
      default:
        typeof o.onClick != "function" && typeof r.onClick == "function" && (e.onclick = Zi);
    }
    Bs(n, r);
    var l;
    n = null;
    for (a in o) if (!r.hasOwnProperty(a) && o.hasOwnProperty(a) && o[a] != null) if (a === "style") {
      var s = o[a];
      for (l in s) s.hasOwnProperty(l) && (n || (n = {}), n[l] = "");
    } else a !== "dangerouslySetInnerHTML" && a !== "children" && a !== "suppressContentEditableWarning" && a !== "suppressHydrationWarning" && a !== "autoFocus" && (xo.hasOwnProperty(a) ? i || (i = []) : (i = i || []).push(a, null));
    for (a in r) {
      var u = r[a];
      if (s = o != null ? o[a] : void 0, r.hasOwnProperty(a) && u !== s && (u != null || s != null)) if (a === "style") if (s) {
        for (l in s) !s.hasOwnProperty(l) || u && u.hasOwnProperty(l) || (n || (n = {}), n[l] = "");
        for (l in u) u.hasOwnProperty(l) && s[l] !== u[l] && (n || (n = {}), n[l] = u[l]);
      } else n || (i || (i = []), i.push(
        a,
        n
      )), n = u;
      else a === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, s = s ? s.__html : void 0, u != null && s !== u && (i = i || []).push(a, u)) : a === "children" ? typeof u != "string" && typeof u != "number" || (i = i || []).push(a, "" + u) : a !== "suppressContentEditableWarning" && a !== "suppressHydrationWarning" && (xo.hasOwnProperty(a) ? (u != null && a === "onScroll" && se("scroll", e), i || s === u || (i = [])) : (i = i || []).push(a, u));
    }
    n && (i = i || []).push("style", n);
    var a = i;
    (t.updateQueue = a) && (t.flags |= 4);
  }
};
eh = function(e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function Zr(e, t) {
  if (!ae) switch (e.tailMode) {
    case "hidden":
      t = e.tail;
      for (var n = null; t !== null; ) t.alternate !== null && (n = t), t = t.sibling;
      n === null ? e.tail = null : n.sibling = null;
      break;
    case "collapsed":
      n = e.tail;
      for (var r = null; n !== null; ) n.alternate !== null && (r = n), n = n.sibling;
      r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
  }
}
function Ae(e) {
  var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
  if (t) for (var o = e.child; o !== null; ) n |= o.lanes | o.childLanes, r |= o.subtreeFlags & 14680064, r |= o.flags & 14680064, o.return = e, o = o.sibling;
  else for (o = e.child; o !== null; ) n |= o.lanes | o.childLanes, r |= o.subtreeFlags, r |= o.flags, o.return = e, o = o.sibling;
  return e.subtreeFlags |= r, e.childLanes = n, t;
}
function zy(e, t, n) {
  var r = t.pendingProps;
  switch (sa(t), t.tag) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return Ae(t), null;
    case 1:
      return Xe(t.type) && qi(), Ae(t), null;
    case 3:
      return r = t.stateNode, Tr(), ue(Ye), ue(De), ga(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (fi(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, mt !== null && (_u(mt), mt = null))), hu(e, t), Ae(t), null;
    case 5:
      ma(t);
      var o = $n(Ro.current);
      if (n = t.type, e !== null && t.stateNode != null) bp(e, t, n, r, o), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(H(166));
          return Ae(t), null;
        }
        if (e = $n(Mt.current), fi(t)) {
          r = t.stateNode, n = t.type;
          var i = t.memoizedProps;
          switch (r[Nt] = t, r[Po] = i, e = (t.mode & 1) !== 0, n) {
            case "dialog":
              se("cancel", r), se("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              se("load", r);
              break;
            case "video":
            case "audio":
              for (o = 0; o < lo.length; o++) se(lo[o], r);
              break;
            case "source":
              se("error", r);
              break;
            case "img":
            case "image":
            case "link":
              se(
                "error",
                r
              ), se("load", r);
              break;
            case "details":
              se("toggle", r);
              break;
            case "input":
              sc(r, i), se("invalid", r);
              break;
            case "select":
              r._wrapperState = { wasMultiple: !!i.multiple }, se("invalid", r);
              break;
            case "textarea":
              ac(r, i), se("invalid", r);
          }
          Bs(n, i), o = null;
          for (var l in i) if (i.hasOwnProperty(l)) {
            var s = i[l];
            l === "children" ? typeof s == "string" ? r.textContent !== s && (i.suppressHydrationWarning !== !0 && ci(r.textContent, s, e), o = ["children", s]) : typeof s == "number" && r.textContent !== "" + s && (i.suppressHydrationWarning !== !0 && ci(
              r.textContent,
              s,
              e
            ), o = ["children", "" + s]) : xo.hasOwnProperty(l) && s != null && l === "onScroll" && se("scroll", r);
          }
          switch (n) {
            case "input":
              ni(r), uc(r, i, !0);
              break;
            case "textarea":
              ni(r), cc(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof i.onClick == "function" && (r.onclick = Zi);
          }
          r = o, t.updateQueue = r, r !== null && (t.flags |= 4);
        } else {
          l = o.nodeType === 9 ? o : o.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = zd(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = l.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = l.createElement(n, { is: r.is }) : (e = l.createElement(n), n === "select" && (l = e, r.multiple ? l.multiple = !0 : r.size && (l.size = r.size))) : e = l.createElementNS(e, n), e[Nt] = t, e[Po] = r, Jp(e, t, !1, !1), t.stateNode = e;
          e: {
            switch (l = Us(n, r), n) {
              case "dialog":
                se("cancel", e), se("close", e), o = r;
                break;
              case "iframe":
              case "object":
              case "embed":
                se("load", e), o = r;
                break;
              case "video":
              case "audio":
                for (o = 0; o < lo.length; o++) se(lo[o], e);
                o = r;
                break;
              case "source":
                se("error", e), o = r;
                break;
              case "img":
              case "image":
              case "link":
                se(
                  "error",
                  e
                ), se("load", e), o = r;
                break;
              case "details":
                se("toggle", e), o = r;
                break;
              case "input":
                sc(e, r), o = Ls(e, r), se("invalid", e);
                break;
              case "option":
                o = r;
                break;
              case "select":
                e._wrapperState = { wasMultiple: !!r.multiple }, o = de({}, r, { value: void 0 }), se("invalid", e);
                break;
              case "textarea":
                ac(e, r), o = Hs(e, r), se("invalid", e);
                break;
              default:
                o = r;
            }
            Bs(n, o), s = o;
            for (i in s) if (s.hasOwnProperty(i)) {
              var u = s[i];
              i === "style" ? $d(e, u) : i === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, u != null && Td(e, u)) : i === "children" ? typeof u == "string" ? (n !== "textarea" || u !== "") && So(e, u) : typeof u == "number" && So(e, "" + u) : i !== "suppressContentEditableWarning" && i !== "suppressHydrationWarning" && i !== "autoFocus" && (xo.hasOwnProperty(i) ? u != null && i === "onScroll" && se("scroll", e) : u != null && Xu(e, i, u, l));
            }
            switch (n) {
              case "input":
                ni(e), uc(e, r, !1);
                break;
              case "textarea":
                ni(e), cc(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + mn(r.value));
                break;
              case "select":
                e.multiple = !!r.multiple, i = r.value, i != null ? gr(e, !!r.multiple, i, !1) : r.defaultValue != null && gr(
                  e,
                  !!r.multiple,
                  r.defaultValue,
                  !0
                );
                break;
              default:
                typeof o.onClick == "function" && (e.onclick = Zi);
            }
            switch (n) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                r = !!r.autoFocus;
                break e;
              case "img":
                r = !0;
                break e;
              default:
                r = !1;
            }
          }
          r && (t.flags |= 4);
        }
        t.ref !== null && (t.flags |= 512, t.flags |= 2097152);
      }
      return Ae(t), null;
    case 6:
      if (e && t.stateNode != null) eh(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(H(166));
        if (n = $n(Ro.current), $n(Mt.current), fi(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[Nt] = t, (i = r.nodeValue !== n) && (e = qe, e !== null)) switch (e.tag) {
            case 3:
              ci(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== !0 && ci(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          i && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[Nt] = t, t.stateNode = r;
      }
      return Ae(t), null;
    case 13:
      if (ue(ce), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if (ae && Ze !== null && t.mode & 1 && !(t.flags & 128)) vp(), Mr(), t.flags |= 98560, i = !1;
        else if (i = fi(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!i) throw Error(H(318));
            if (i = t.memoizedState, i = i !== null ? i.dehydrated : null, !i) throw Error(H(317));
            i[Nt] = t;
          } else Mr(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          Ae(t), i = !1;
        } else mt !== null && (_u(mt), mt = null), i = !0;
        if (!i) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || ce.current & 1 ? xe === 0 && (xe = 3) : za())), t.updateQueue !== null && (t.flags |= 4), Ae(t), null);
    case 4:
      return Tr(), hu(e, t), e === null && zo(t.stateNode.containerInfo), Ae(t), null;
    case 10:
      return fa(t.type._context), Ae(t), null;
    case 17:
      return Xe(t.type) && qi(), Ae(t), null;
    case 19:
      if (ue(ce), i = t.memoizedState, i === null) return Ae(t), null;
      if (r = (t.flags & 128) !== 0, l = i.rendering, l === null) if (r) Zr(i, !1);
      else {
        if (xe !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
          if (l = ol(e), l !== null) {
            for (t.flags |= 128, Zr(i, !1), r = l.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) i = n, e = r, i.flags &= 14680066, l = i.alternate, l === null ? (i.childLanes = 0, i.lanes = e, i.child = null, i.subtreeFlags = 0, i.memoizedProps = null, i.memoizedState = null, i.updateQueue = null, i.dependencies = null, i.stateNode = null) : (i.childLanes = l.childLanes, i.lanes = l.lanes, i.child = l.child, i.subtreeFlags = 0, i.deletions = null, i.memoizedProps = l.memoizedProps, i.memoizedState = l.memoizedState, i.updateQueue = l.updateQueue, i.type = l.type, e = l.dependencies, i.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
            return ie(ce, ce.current & 1 | 2), t.child;
          }
          e = e.sibling;
        }
        i.tail !== null && ge() > $r && (t.flags |= 128, r = !0, Zr(i, !1), t.lanes = 4194304);
      }
      else {
        if (!r) if (e = ol(l), e !== null) {
          if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), Zr(i, !0), i.tail === null && i.tailMode === "hidden" && !l.alternate && !ae) return Ae(t), null;
        } else 2 * ge() - i.renderingStartTime > $r && n !== 1073741824 && (t.flags |= 128, r = !0, Zr(i, !1), t.lanes = 4194304);
        i.isBackwards ? (l.sibling = t.child, t.child = l) : (n = i.last, n !== null ? n.sibling = l : t.child = l, i.last = l);
      }
      return i.tail !== null ? (t = i.tail, i.rendering = t, i.tail = t.sibling, i.renderingStartTime = ge(), t.sibling = null, n = ce.current, ie(ce, r ? n & 1 | 2 : n & 1), t) : (Ae(t), null);
    case 22:
    case 23:
      return Ma(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? Ge & 1073741824 && (Ae(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Ae(t), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(H(156, t.tag));
}
function Ty(e, t) {
  switch (sa(t), t.tag) {
    case 1:
      return Xe(t.type) && qi(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 3:
      return Tr(), ue(Ye), ue(De), ga(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
    case 5:
      return ma(t), null;
    case 13:
      if (ue(ce), e = t.memoizedState, e !== null && e.dehydrated !== null) {
        if (t.alternate === null) throw Error(H(340));
        Mr();
      }
      return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 19:
      return ue(ce), null;
    case 4:
      return Tr(), null;
    case 10:
      return fa(t.type._context), null;
    case 22:
    case 23:
      return Ma(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var hi = !1, Ie = !1, Py = typeof WeakSet == "function" ? WeakSet : Set, W = null;
function pr(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    pe(e, t, r);
  }
  else n.current = null;
}
function mu(e, t, n) {
  try {
    n();
  } catch (r) {
    pe(e, t, r);
  }
}
var bc = !1;
function $y(e, t) {
  if (Js = Qi, e = ip(), ia(e)) {
    if ("selectionStart" in e) var n = { start: e.selectionStart, end: e.selectionEnd };
    else e: {
      n = (n = e.ownerDocument) && n.defaultView || window;
      var r = n.getSelection && n.getSelection();
      if (r && r.rangeCount !== 0) {
        n = r.anchorNode;
        var o = r.anchorOffset, i = r.focusNode;
        r = r.focusOffset;
        try {
          n.nodeType, i.nodeType;
        } catch {
          n = null;
          break e;
        }
        var l = 0, s = -1, u = -1, a = 0, c = 0, f = e, d = null;
        t: for (; ; ) {
          for (var m; f !== n || o !== 0 && f.nodeType !== 3 || (s = l + o), f !== i || r !== 0 && f.nodeType !== 3 || (u = l + r), f.nodeType === 3 && (l += f.nodeValue.length), (m = f.firstChild) !== null; )
            d = f, f = m;
          for (; ; ) {
            if (f === e) break t;
            if (d === n && ++a === o && (s = l), d === i && ++c === r && (u = l), (m = f.nextSibling) !== null) break;
            f = d, d = f.parentNode;
          }
          f = m;
        }
        n = s === -1 || u === -1 ? null : { start: s, end: u };
      } else n = null;
    }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (bs = { focusedElem: e, selectionRange: n }, Qi = !1, W = t; W !== null; ) if (t = W, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, W = e;
  else for (; W !== null; ) {
    t = W;
    try {
      var x = t.alternate;
      if (t.flags & 1024) switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (x !== null) {
            var w = x.memoizedProps, _ = x.memoizedState, p = t.stateNode, h = p.getSnapshotBeforeUpdate(t.elementType === t.type ? w : dt(t.type, w), _);
            p.__reactInternalSnapshotBeforeUpdate = h;
          }
          break;
        case 3:
          var g = t.stateNode.containerInfo;
          g.nodeType === 1 ? g.textContent = "" : g.nodeType === 9 && g.documentElement && g.removeChild(g.documentElement);
          break;
        case 5:
        case 6:
        case 4:
        case 17:
          break;
        default:
          throw Error(H(163));
      }
    } catch (y) {
      pe(t, t.return, y);
    }
    if (e = t.sibling, e !== null) {
      e.return = t.return, W = e;
      break;
    }
    W = t.return;
  }
  return x = bc, bc = !1, x;
}
function yo(e, t, n) {
  var r = t.updateQueue;
  if (r = r !== null ? r.lastEffect : null, r !== null) {
    var o = r = r.next;
    do {
      if ((o.tag & e) === e) {
        var i = o.destroy;
        o.destroy = void 0, i !== void 0 && mu(t, n, i);
      }
      o = o.next;
    } while (o !== r);
  }
}
function Tl(e, t) {
  if (t = t.updateQueue, t = t !== null ? t.lastEffect : null, t !== null) {
    var n = t = t.next;
    do {
      if ((n.tag & e) === e) {
        var r = n.create;
        n.destroy = r();
      }
      n = n.next;
    } while (n !== t);
  }
}
function gu(e) {
  var t = e.ref;
  if (t !== null) {
    var n = e.stateNode;
    switch (e.tag) {
      case 5:
        e = n;
        break;
      default:
        e = n;
    }
    typeof t == "function" ? t(e) : t.current = e;
  }
}
function th(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, th(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[Nt], delete t[Po], delete t[nu], delete t[py], delete t[hy])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function nh(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function ef(e) {
  e: for (; ; ) {
    for (; e.sibling === null; ) {
      if (e.return === null || nh(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      e.child.return = e, e = e.child;
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function yu(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Zi));
  else if (r !== 4 && (e = e.child, e !== null)) for (yu(e, t, n), e = e.sibling; e !== null; ) yu(e, t, n), e = e.sibling;
}
function vu(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && (e = e.child, e !== null)) for (vu(e, t, n), e = e.sibling; e !== null; ) vu(e, t, n), e = e.sibling;
}
var Ce = null, pt = !1;
function Kt(e, t, n) {
  for (n = n.child; n !== null; ) rh(e, t, n), n = n.sibling;
}
function rh(e, t, n) {
  if (Ct && typeof Ct.onCommitFiberUnmount == "function") try {
    Ct.onCommitFiberUnmount(Sl, n);
  } catch {
  }
  switch (n.tag) {
    case 5:
      Ie || pr(n, t);
    case 6:
      var r = Ce, o = pt;
      Ce = null, Kt(e, t, n), Ce = r, pt = o, Ce !== null && (pt ? (e = Ce, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : Ce.removeChild(n.stateNode));
      break;
    case 18:
      Ce !== null && (pt ? (e = Ce, n = n.stateNode, e.nodeType === 8 ? as(e.parentNode, n) : e.nodeType === 1 && as(e, n), No(e)) : as(Ce, n.stateNode));
      break;
    case 4:
      r = Ce, o = pt, Ce = n.stateNode.containerInfo, pt = !0, Kt(e, t, n), Ce = r, pt = o;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!Ie && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        o = r = r.next;
        do {
          var i = o, l = i.destroy;
          i = i.tag, l !== void 0 && (i & 2 || i & 4) && mu(n, t, l), o = o.next;
        } while (o !== r);
      }
      Kt(e, t, n);
      break;
    case 1:
      if (!Ie && (pr(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
        r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
      } catch (s) {
        pe(n, t, s);
      }
      Kt(e, t, n);
      break;
    case 21:
      Kt(e, t, n);
      break;
    case 22:
      n.mode & 1 ? (Ie = (r = Ie) || n.memoizedState !== null, Kt(e, t, n), Ie = r) : Kt(e, t, n);
      break;
    default:
      Kt(e, t, n);
  }
}
function tf(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new Py()), t.forEach(function(r) {
      var o = Vy.bind(null, e, r);
      n.has(r) || (n.add(r), r.then(o, o));
    });
  }
}
function ft(e, t) {
  var n = t.deletions;
  if (n !== null) for (var r = 0; r < n.length; r++) {
    var o = n[r];
    try {
      var i = e, l = t, s = l;
      e: for (; s !== null; ) {
        switch (s.tag) {
          case 5:
            Ce = s.stateNode, pt = !1;
            break e;
          case 3:
            Ce = s.stateNode.containerInfo, pt = !0;
            break e;
          case 4:
            Ce = s.stateNode.containerInfo, pt = !0;
            break e;
        }
        s = s.return;
      }
      if (Ce === null) throw Error(H(160));
      rh(i, l, o), Ce = null, pt = !1;
      var u = o.alternate;
      u !== null && (u.return = null), o.return = null;
    } catch (a) {
      pe(o, t, a);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) oh(t, e), t = t.sibling;
}
function oh(e, t) {
  var n = e.alternate, r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if (ft(t, e), Et(e), r & 4) {
        try {
          yo(3, e, e.return), Tl(3, e);
        } catch (w) {
          pe(e, e.return, w);
        }
        try {
          yo(5, e, e.return);
        } catch (w) {
          pe(e, e.return, w);
        }
      }
      break;
    case 1:
      ft(t, e), Et(e), r & 512 && n !== null && pr(n, n.return);
      break;
    case 5:
      if (ft(t, e), Et(e), r & 512 && n !== null && pr(n, n.return), e.flags & 32) {
        var o = e.stateNode;
        try {
          So(o, "");
        } catch (w) {
          pe(e, e.return, w);
        }
      }
      if (r & 4 && (o = e.stateNode, o != null)) {
        var i = e.memoizedProps, l = n !== null ? n.memoizedProps : i, s = e.type, u = e.updateQueue;
        if (e.updateQueue = null, u !== null) try {
          s === "input" && i.type === "radio" && i.name != null && Cd(o, i), Us(s, l);
          var a = Us(s, i);
          for (l = 0; l < u.length; l += 2) {
            var c = u[l], f = u[l + 1];
            c === "style" ? $d(o, f) : c === "dangerouslySetInnerHTML" ? Td(o, f) : c === "children" ? So(o, f) : Xu(o, c, f, a);
          }
          switch (s) {
            case "input":
              Os(o, i);
              break;
            case "textarea":
              Md(o, i);
              break;
            case "select":
              var d = o._wrapperState.wasMultiple;
              o._wrapperState.wasMultiple = !!i.multiple;
              var m = i.value;
              m != null ? gr(o, !!i.multiple, m, !1) : d !== !!i.multiple && (i.defaultValue != null ? gr(
                o,
                !!i.multiple,
                i.defaultValue,
                !0
              ) : gr(o, !!i.multiple, i.multiple ? [] : "", !1));
          }
          o[Po] = i;
        } catch (w) {
          pe(e, e.return, w);
        }
      }
      break;
    case 6:
      if (ft(t, e), Et(e), r & 4) {
        if (e.stateNode === null) throw Error(H(162));
        o = e.stateNode, i = e.memoizedProps;
        try {
          o.nodeValue = i;
        } catch (w) {
          pe(e, e.return, w);
        }
      }
      break;
    case 3:
      if (ft(t, e), Et(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
        No(t.containerInfo);
      } catch (w) {
        pe(e, e.return, w);
      }
      break;
    case 4:
      ft(t, e), Et(e);
      break;
    case 13:
      ft(t, e), Et(e), o = e.child, o.flags & 8192 && (i = o.memoizedState !== null, o.stateNode.isHidden = i, !i || o.alternate !== null && o.alternate.memoizedState !== null || (Na = ge())), r & 4 && tf(e);
      break;
    case 22:
      if (c = n !== null && n.memoizedState !== null, e.mode & 1 ? (Ie = (a = Ie) || c, ft(t, e), Ie = a) : ft(t, e), Et(e), r & 8192) {
        if (a = e.memoizedState !== null, (e.stateNode.isHidden = a) && !c && e.mode & 1) for (W = e, c = e.child; c !== null; ) {
          for (f = W = c; W !== null; ) {
            switch (d = W, m = d.child, d.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                yo(4, d, d.return);
                break;
              case 1:
                pr(d, d.return);
                var x = d.stateNode;
                if (typeof x.componentWillUnmount == "function") {
                  r = d, n = d.return;
                  try {
                    t = r, x.props = t.memoizedProps, x.state = t.memoizedState, x.componentWillUnmount();
                  } catch (w) {
                    pe(r, n, w);
                  }
                }
                break;
              case 5:
                pr(d, d.return);
                break;
              case 22:
                if (d.memoizedState !== null) {
                  rf(f);
                  continue;
                }
            }
            m !== null ? (m.return = d, W = m) : rf(f);
          }
          c = c.sibling;
        }
        e: for (c = null, f = e; ; ) {
          if (f.tag === 5) {
            if (c === null) {
              c = f;
              try {
                o = f.stateNode, a ? (i = o.style, typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none") : (s = f.stateNode, u = f.memoizedProps.style, l = u != null && u.hasOwnProperty("display") ? u.display : null, s.style.display = Pd("display", l));
              } catch (w) {
                pe(e, e.return, w);
              }
            }
          } else if (f.tag === 6) {
            if (c === null) try {
              f.stateNode.nodeValue = a ? "" : f.memoizedProps;
            } catch (w) {
              pe(e, e.return, w);
            }
          } else if ((f.tag !== 22 && f.tag !== 23 || f.memoizedState === null || f === e) && f.child !== null) {
            f.child.return = f, f = f.child;
            continue;
          }
          if (f === e) break e;
          for (; f.sibling === null; ) {
            if (f.return === null || f.return === e) break e;
            c === f && (c = null), f = f.return;
          }
          c === f && (c = null), f.sibling.return = f.return, f = f.sibling;
        }
      }
      break;
    case 19:
      ft(t, e), Et(e), r & 4 && tf(e);
      break;
    case 21:
      break;
    default:
      ft(
        t,
        e
      ), Et(e);
  }
}
function Et(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (nh(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(H(160));
      }
      switch (r.tag) {
        case 5:
          var o = r.stateNode;
          r.flags & 32 && (So(o, ""), r.flags &= -33);
          var i = ef(e);
          vu(e, i, o);
          break;
        case 3:
        case 4:
          var l = r.stateNode.containerInfo, s = ef(e);
          yu(e, s, l);
          break;
        default:
          throw Error(H(161));
      }
    } catch (u) {
      pe(e, e.return, u);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function Ry(e, t, n) {
  W = e, ih(e);
}
function ih(e, t, n) {
  for (var r = (e.mode & 1) !== 0; W !== null; ) {
    var o = W, i = o.child;
    if (o.tag === 22 && r) {
      var l = o.memoizedState !== null || hi;
      if (!l) {
        var s = o.alternate, u = s !== null && s.memoizedState !== null || Ie;
        s = hi;
        var a = Ie;
        if (hi = l, (Ie = u) && !a) for (W = o; W !== null; ) l = W, u = l.child, l.tag === 22 && l.memoizedState !== null ? of(o) : u !== null ? (u.return = l, W = u) : of(o);
        for (; i !== null; ) W = i, ih(i), i = i.sibling;
        W = o, hi = s, Ie = a;
      }
      nf(e);
    } else o.subtreeFlags & 8772 && i !== null ? (i.return = o, W = i) : nf(e);
  }
}
function nf(e) {
  for (; W !== null; ) {
    var t = W;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            Ie || Tl(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !Ie) if (n === null) r.componentDidMount();
            else {
              var o = t.elementType === t.type ? n.memoizedProps : dt(t.type, n.memoizedProps);
              r.componentDidUpdate(o, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
            }
            var i = t.updateQueue;
            i !== null && Vc(t, i, r);
            break;
          case 3:
            var l = t.updateQueue;
            if (l !== null) {
              if (n = null, t.child !== null) switch (t.child.tag) {
                case 5:
                  n = t.child.stateNode;
                  break;
                case 1:
                  n = t.child.stateNode;
              }
              Vc(t, l, n);
            }
            break;
          case 5:
            var s = t.stateNode;
            if (n === null && t.flags & 4) {
              n = s;
              var u = t.memoizedProps;
              switch (t.type) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  u.autoFocus && n.focus();
                  break;
                case "img":
                  u.src && (n.src = u.src);
              }
            }
            break;
          case 6:
            break;
          case 4:
            break;
          case 12:
            break;
          case 13:
            if (t.memoizedState === null) {
              var a = t.alternate;
              if (a !== null) {
                var c = a.memoizedState;
                if (c !== null) {
                  var f = c.dehydrated;
                  f !== null && No(f);
                }
              }
            }
            break;
          case 19:
          case 17:
          case 21:
          case 22:
          case 23:
          case 25:
            break;
          default:
            throw Error(H(163));
        }
        Ie || t.flags & 512 && gu(t);
      } catch (d) {
        pe(t, t.return, d);
      }
    }
    if (t === e) {
      W = null;
      break;
    }
    if (n = t.sibling, n !== null) {
      n.return = t.return, W = n;
      break;
    }
    W = t.return;
  }
}
function rf(e) {
  for (; W !== null; ) {
    var t = W;
    if (t === e) {
      W = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      n.return = t.return, W = n;
      break;
    }
    W = t.return;
  }
}
function of(e) {
  for (; W !== null; ) {
    var t = W;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            Tl(4, t);
          } catch (u) {
            pe(t, n, u);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var o = t.return;
            try {
              r.componentDidMount();
            } catch (u) {
              pe(t, o, u);
            }
          }
          var i = t.return;
          try {
            gu(t);
          } catch (u) {
            pe(t, i, u);
          }
          break;
        case 5:
          var l = t.return;
          try {
            gu(t);
          } catch (u) {
            pe(t, l, u);
          }
      }
    } catch (u) {
      pe(t, t.return, u);
    }
    if (t === e) {
      W = null;
      break;
    }
    var s = t.sibling;
    if (s !== null) {
      s.return = t.return, W = s;
      break;
    }
    W = t.return;
  }
}
var Ay = Math.ceil, sl = Qt.ReactCurrentDispatcher, Ea = Qt.ReactCurrentOwner, st = Qt.ReactCurrentBatchConfig, b = 0, Ee = null, ye = null, Me = 0, Ge = 0, hr = vn(0), xe = 0, Lo = null, Bn = 0, Pl = 0, ka = 0, vo = null, Ue = null, Na = 0, $r = 1 / 0, It = null, ul = !1, wu = null, fn = null, mi = !1, on = null, al = 0, wo = 0, xu = null, Di = -1, Li = 0;
function He() {
  return b & 6 ? ge() : Di !== -1 ? Di : Di = ge();
}
function dn(e) {
  return e.mode & 1 ? b & 2 && Me !== 0 ? Me & -Me : gy.transition !== null ? (Li === 0 && (Li = jd()), Li) : (e = re, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Zd(e.type)), e) : 1;
}
function vt(e, t, n, r) {
  if (50 < wo) throw wo = 0, xu = null, Error(H(185));
  Qo(e, n, r), (!(b & 2) || e !== Ee) && (e === Ee && (!(b & 2) && (Pl |= n), xe === 4 && tn(e, Me)), Qe(e, r), n === 1 && b === 0 && !(t.mode & 1) && ($r = ge() + 500, Cl && wn()));
}
function Qe(e, t) {
  var n = e.callbackNode;
  gg(e, t);
  var r = Xi(e, e === Ee ? Me : 0);
  if (r === 0) n !== null && pc(n), e.callbackNode = null, e.callbackPriority = 0;
  else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && pc(n), t === 1) e.tag === 0 ? my(lf.bind(null, e)) : mp(lf.bind(null, e)), fy(function() {
      !(b & 6) && wn();
    }), n = null;
    else {
      switch (Wd(r)) {
        case 1:
          n = qu;
          break;
        case 4:
          n = Bd;
          break;
        case 16:
          n = Yi;
          break;
        case 536870912:
          n = Ud;
          break;
        default:
          n = Yi;
      }
      n = ph(n, lh.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function lh(e, t) {
  if (Di = -1, Li = 0, b & 6) throw Error(H(327));
  var n = e.callbackNode;
  if (Sr() && e.callbackNode !== n) return null;
  var r = Xi(e, e === Ee ? Me : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = cl(e, r);
  else {
    t = r;
    var o = b;
    b |= 2;
    var i = uh();
    (Ee !== e || Me !== t) && (It = null, $r = ge() + 500, In(e, t));
    do
      try {
        Ly();
        break;
      } catch (s) {
        sh(e, s);
      }
    while (!0);
    ca(), sl.current = i, b = o, ye !== null ? t = 0 : (Ee = null, Me = 0, t = xe);
  }
  if (t !== 0) {
    if (t === 2 && (o = Qs(e), o !== 0 && (r = o, t = Su(e, o))), t === 1) throw n = Lo, In(e, 0), tn(e, r), Qe(e, ge()), n;
    if (t === 6) tn(e, r);
    else {
      if (o = e.current.alternate, !(r & 30) && !Iy(o) && (t = cl(e, r), t === 2 && (i = Qs(e), i !== 0 && (r = i, t = Su(e, i))), t === 1)) throw n = Lo, In(e, 0), tn(e, r), Qe(e, ge()), n;
      switch (e.finishedWork = o, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(H(345));
        case 2:
          Mn(e, Ue, It);
          break;
        case 3:
          if (tn(e, r), (r & 130023424) === r && (t = Na + 500 - ge(), 10 < t)) {
            if (Xi(e, 0) !== 0) break;
            if (o = e.suspendedLanes, (o & r) !== r) {
              He(), e.pingedLanes |= e.suspendedLanes & o;
              break;
            }
            e.timeoutHandle = tu(Mn.bind(null, e, Ue, It), t);
            break;
          }
          Mn(e, Ue, It);
          break;
        case 4:
          if (tn(e, r), (r & 4194240) === r) break;
          for (t = e.eventTimes, o = -1; 0 < r; ) {
            var l = 31 - yt(r);
            i = 1 << l, l = t[l], l > o && (o = l), r &= ~i;
          }
          if (r = o, r = ge() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * Ay(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = tu(Mn.bind(null, e, Ue, It), r);
            break;
          }
          Mn(e, Ue, It);
          break;
        case 5:
          Mn(e, Ue, It);
          break;
        default:
          throw Error(H(329));
      }
    }
  }
  return Qe(e, ge()), e.callbackNode === n ? lh.bind(null, e) : null;
}
function Su(e, t) {
  var n = vo;
  return e.current.memoizedState.isDehydrated && (In(e, t).flags |= 256), e = cl(e, t), e !== 2 && (t = Ue, Ue = n, t !== null && _u(t)), e;
}
function _u(e) {
  Ue === null ? Ue = e : Ue.push.apply(Ue, e);
}
function Iy(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
        var o = n[r], i = o.getSnapshot;
        o = o.value;
        try {
          if (!xt(i(), o)) return !1;
        } catch {
          return !1;
        }
      }
    }
    if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
    else {
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return !0;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
  }
  return !0;
}
function tn(e, t) {
  for (t &= ~ka, t &= ~Pl, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
    var n = 31 - yt(t), r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function lf(e) {
  if (b & 6) throw Error(H(327));
  Sr();
  var t = Xi(e, 0);
  if (!(t & 1)) return Qe(e, ge()), null;
  var n = cl(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Qs(e);
    r !== 0 && (t = r, n = Su(e, r));
  }
  if (n === 1) throw n = Lo, In(e, 0), tn(e, t), Qe(e, ge()), n;
  if (n === 6) throw Error(H(345));
  return e.finishedWork = e.current.alternate, e.finishedLanes = t, Mn(e, Ue, It), Qe(e, ge()), null;
}
function Ca(e, t) {
  var n = b;
  b |= 1;
  try {
    return e(t);
  } finally {
    b = n, b === 0 && ($r = ge() + 500, Cl && wn());
  }
}
function Un(e) {
  on !== null && on.tag === 0 && !(b & 6) && Sr();
  var t = b;
  b |= 1;
  var n = st.transition, r = re;
  try {
    if (st.transition = null, re = 1, e) return e();
  } finally {
    re = r, st.transition = n, b = t, !(b & 6) && wn();
  }
}
function Ma() {
  Ge = hr.current, ue(hr);
}
function In(e, t) {
  e.finishedWork = null, e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1, cy(n)), ye !== null) for (n = ye.return; n !== null; ) {
    var r = n;
    switch (sa(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && qi();
        break;
      case 3:
        Tr(), ue(Ye), ue(De), ga();
        break;
      case 5:
        ma(r);
        break;
      case 4:
        Tr();
        break;
      case 13:
        ue(ce);
        break;
      case 19:
        ue(ce);
        break;
      case 10:
        fa(r.type._context);
        break;
      case 22:
      case 23:
        Ma();
    }
    n = n.return;
  }
  if (Ee = e, ye = e = pn(e.current, null), Me = Ge = t, xe = 0, Lo = null, ka = Pl = Bn = 0, Ue = vo = null, Pn !== null) {
    for (t = 0; t < Pn.length; t++) if (n = Pn[t], r = n.interleaved, r !== null) {
      n.interleaved = null;
      var o = r.next, i = n.pending;
      if (i !== null) {
        var l = i.next;
        i.next = o, r.next = l;
      }
      n.pending = r;
    }
    Pn = null;
  }
  return e;
}
function sh(e, t) {
  do {
    var n = ye;
    try {
      if (ca(), Ri.current = ll, il) {
        for (var r = fe.memoizedState; r !== null; ) {
          var o = r.queue;
          o !== null && (o.pending = null), r = r.next;
        }
        il = !1;
      }
      if (Vn = 0, _e = we = fe = null, go = !1, Ao = 0, Ea.current = null, n === null || n.return === null) {
        xe = 1, Lo = t, ye = null;
        break;
      }
      e: {
        var i = e, l = n.return, s = n, u = t;
        if (t = Me, s.flags |= 32768, u !== null && typeof u == "object" && typeof u.then == "function") {
          var a = u, c = s, f = c.tag;
          if (!(c.mode & 1) && (f === 0 || f === 11 || f === 15)) {
            var d = c.alternate;
            d ? (c.updateQueue = d.updateQueue, c.memoizedState = d.memoizedState, c.lanes = d.lanes) : (c.updateQueue = null, c.memoizedState = null);
          }
          var m = Xc(l);
          if (m !== null) {
            m.flags &= -257, Qc(m, l, s, i, t), m.mode & 1 && Yc(i, a, t), t = m, u = a;
            var x = t.updateQueue;
            if (x === null) {
              var w = /* @__PURE__ */ new Set();
              w.add(u), t.updateQueue = w;
            } else x.add(u);
            break e;
          } else {
            if (!(t & 1)) {
              Yc(i, a, t), za();
              break e;
            }
            u = Error(H(426));
          }
        } else if (ae && s.mode & 1) {
          var _ = Xc(l);
          if (_ !== null) {
            !(_.flags & 65536) && (_.flags |= 256), Qc(_, l, s, i, t), ua(Pr(u, s));
            break e;
          }
        }
        i = u = Pr(u, s), xe !== 4 && (xe = 2), vo === null ? vo = [i] : vo.push(i), i = l;
        do {
          switch (i.tag) {
            case 3:
              i.flags |= 65536, t &= -t, i.lanes |= t;
              var p = Wp(i, u, t);
              Hc(i, p);
              break e;
            case 1:
              s = u;
              var h = i.type, g = i.stateNode;
              if (!(i.flags & 128) && (typeof h.getDerivedStateFromError == "function" || g !== null && typeof g.componentDidCatch == "function" && (fn === null || !fn.has(g)))) {
                i.flags |= 65536, t &= -t, i.lanes |= t;
                var y = Yp(i, s, t);
                Hc(i, y);
                break e;
              }
          }
          i = i.return;
        } while (i !== null);
      }
      ch(n);
    } catch (E) {
      t = E, ye === n && n !== null && (ye = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function uh() {
  var e = sl.current;
  return sl.current = ll, e === null ? ll : e;
}
function za() {
  (xe === 0 || xe === 3 || xe === 2) && (xe = 4), Ee === null || !(Bn & 268435455) && !(Pl & 268435455) || tn(Ee, Me);
}
function cl(e, t) {
  var n = b;
  b |= 2;
  var r = uh();
  (Ee !== e || Me !== t) && (It = null, In(e, t));
  do
    try {
      Dy();
      break;
    } catch (o) {
      sh(e, o);
    }
  while (!0);
  if (ca(), b = n, sl.current = r, ye !== null) throw Error(H(261));
  return Ee = null, Me = 0, xe;
}
function Dy() {
  for (; ye !== null; ) ah(ye);
}
function Ly() {
  for (; ye !== null && !sg(); ) ah(ye);
}
function ah(e) {
  var t = dh(e.alternate, e, Ge);
  e.memoizedProps = e.pendingProps, t === null ? ch(e) : ye = t, Ea.current = null;
}
function ch(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = Ty(n, t), n !== null) {
        n.flags &= 32767, ye = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
      else {
        xe = 6, ye = null;
        return;
      }
    } else if (n = zy(n, t, Ge), n !== null) {
      ye = n;
      return;
    }
    if (t = t.sibling, t !== null) {
      ye = t;
      return;
    }
    ye = t = e;
  } while (t !== null);
  xe === 0 && (xe = 5);
}
function Mn(e, t, n) {
  var r = re, o = st.transition;
  try {
    st.transition = null, re = 1, Oy(e, t, n, r);
  } finally {
    st.transition = o, re = r;
  }
  return null;
}
function Oy(e, t, n, r) {
  do
    Sr();
  while (on !== null);
  if (b & 6) throw Error(H(327));
  n = e.finishedWork;
  var o = e.finishedLanes;
  if (n === null) return null;
  if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(H(177));
  e.callbackNode = null, e.callbackPriority = 0;
  var i = n.lanes | n.childLanes;
  if (yg(e, i), e === Ee && (ye = Ee = null, Me = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || mi || (mi = !0, ph(Yi, function() {
    return Sr(), null;
  })), i = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || i) {
    i = st.transition, st.transition = null;
    var l = re;
    re = 1;
    var s = b;
    b |= 4, Ea.current = null, $y(e, n), oh(n, e), ry(bs), Qi = !!Js, bs = Js = null, e.current = n, Ry(n), ug(), b = s, re = l, st.transition = i;
  } else e.current = n;
  if (mi && (mi = !1, on = e, al = o), i = e.pendingLanes, i === 0 && (fn = null), fg(n.stateNode), Qe(e, ge()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) o = t[n], r(o.value, { componentStack: o.stack, digest: o.digest });
  if (ul) throw ul = !1, e = wu, wu = null, e;
  return al & 1 && e.tag !== 0 && Sr(), i = e.pendingLanes, i & 1 ? e === xu ? wo++ : (wo = 0, xu = e) : wo = 0, wn(), null;
}
function Sr() {
  if (on !== null) {
    var e = Wd(al), t = st.transition, n = re;
    try {
      if (st.transition = null, re = 16 > e ? 16 : e, on === null) var r = !1;
      else {
        if (e = on, on = null, al = 0, b & 6) throw Error(H(331));
        var o = b;
        for (b |= 4, W = e.current; W !== null; ) {
          var i = W, l = i.child;
          if (W.flags & 16) {
            var s = i.deletions;
            if (s !== null) {
              for (var u = 0; u < s.length; u++) {
                var a = s[u];
                for (W = a; W !== null; ) {
                  var c = W;
                  switch (c.tag) {
                    case 0:
                    case 11:
                    case 15:
                      yo(8, c, i);
                  }
                  var f = c.child;
                  if (f !== null) f.return = c, W = f;
                  else for (; W !== null; ) {
                    c = W;
                    var d = c.sibling, m = c.return;
                    if (th(c), c === a) {
                      W = null;
                      break;
                    }
                    if (d !== null) {
                      d.return = m, W = d;
                      break;
                    }
                    W = m;
                  }
                }
              }
              var x = i.alternate;
              if (x !== null) {
                var w = x.child;
                if (w !== null) {
                  x.child = null;
                  do {
                    var _ = w.sibling;
                    w.sibling = null, w = _;
                  } while (w !== null);
                }
              }
              W = i;
            }
          }
          if (i.subtreeFlags & 2064 && l !== null) l.return = i, W = l;
          else e: for (; W !== null; ) {
            if (i = W, i.flags & 2048) switch (i.tag) {
              case 0:
              case 11:
              case 15:
                yo(9, i, i.return);
            }
            var p = i.sibling;
            if (p !== null) {
              p.return = i.return, W = p;
              break e;
            }
            W = i.return;
          }
        }
        var h = e.current;
        for (W = h; W !== null; ) {
          l = W;
          var g = l.child;
          if (l.subtreeFlags & 2064 && g !== null) g.return = l, W = g;
          else e: for (l = h; W !== null; ) {
            if (s = W, s.flags & 2048) try {
              switch (s.tag) {
                case 0:
                case 11:
                case 15:
                  Tl(9, s);
              }
            } catch (E) {
              pe(s, s.return, E);
            }
            if (s === l) {
              W = null;
              break e;
            }
            var y = s.sibling;
            if (y !== null) {
              y.return = s.return, W = y;
              break e;
            }
            W = s.return;
          }
        }
        if (b = o, wn(), Ct && typeof Ct.onPostCommitFiberRoot == "function") try {
          Ct.onPostCommitFiberRoot(Sl, e);
        } catch {
        }
        r = !0;
      }
      return r;
    } finally {
      re = n, st.transition = t;
    }
  }
  return !1;
}
function sf(e, t, n) {
  t = Pr(n, t), t = Wp(e, t, 1), e = cn(e, t, 1), t = He(), e !== null && (Qo(e, 1, t), Qe(e, t));
}
function pe(e, t, n) {
  if (e.tag === 3) sf(e, e, n);
  else for (; t !== null; ) {
    if (t.tag === 3) {
      sf(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (fn === null || !fn.has(r))) {
        e = Pr(n, e), e = Yp(t, e, 1), t = cn(t, e, 1), e = He(), t !== null && (Qo(t, 1, e), Qe(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function Fy(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = He(), e.pingedLanes |= e.suspendedLanes & n, Ee === e && (Me & n) === n && (xe === 4 || xe === 3 && (Me & 130023424) === Me && 500 > ge() - Na ? In(e, 0) : ka |= n), Qe(e, t);
}
function fh(e, t) {
  t === 0 && (e.mode & 1 ? (t = ii, ii <<= 1, !(ii & 130023424) && (ii = 4194304)) : t = 1);
  var n = He();
  e = jt(e, t), e !== null && (Qo(e, t, n), Qe(e, n));
}
function Hy(e) {
  var t = e.memoizedState, n = 0;
  t !== null && (n = t.retryLane), fh(e, n);
}
function Vy(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode, o = e.memoizedState;
      o !== null && (n = o.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(H(314));
  }
  r !== null && r.delete(t), fh(e, n);
}
var dh;
dh = function(e, t, n) {
  if (e !== null) if (e.memoizedProps !== t.pendingProps || Ye.current) je = !0;
  else {
    if (!(e.lanes & n) && !(t.flags & 128)) return je = !1, My(e, t, n);
    je = !!(e.flags & 131072);
  }
  else je = !1, ae && t.flags & 1048576 && gp(t, el, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      Ii(e, t), e = t.pendingProps;
      var o = Cr(t, De.current);
      xr(t, n), o = va(null, t, r, e, o, n);
      var i = wa();
      return t.flags |= 1, typeof o == "object" && o !== null && typeof o.render == "function" && o.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, Xe(r) ? (i = !0, Ji(t)) : i = !1, t.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null, pa(t), o.updater = zl, t.stateNode = o, o._reactInternals = t, uu(t, r, e, n), t = fu(null, t, r, !0, i, n)) : (t.tag = 0, ae && i && la(t), Fe(null, t, o, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (Ii(e, t), e = t.pendingProps, o = r._init, r = o(r._payload), t.type = r, o = t.tag = Uy(r), e = dt(r, e), o) {
          case 0:
            t = cu(null, t, r, e, n);
            break e;
          case 1:
            t = Zc(null, t, r, e, n);
            break e;
          case 11:
            t = Kc(null, t, r, e, n);
            break e;
          case 14:
            t = Gc(null, t, r, dt(r.type, e), n);
            break e;
        }
        throw Error(H(
          306,
          r,
          ""
        ));
      }
      return t;
    case 0:
      return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : dt(r, o), cu(e, t, r, o, n);
    case 1:
      return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : dt(r, o), Zc(e, t, r, o, n);
    case 3:
      e: {
        if (Gp(t), e === null) throw Error(H(387));
        r = t.pendingProps, i = t.memoizedState, o = i.element, _p(e, t), rl(t, r, null, n);
        var l = t.memoizedState;
        if (r = l.element, i.isDehydrated) if (i = { element: r, isDehydrated: !1, cache: l.cache, pendingSuspenseBoundaries: l.pendingSuspenseBoundaries, transitions: l.transitions }, t.updateQueue.baseState = i, t.memoizedState = i, t.flags & 256) {
          o = Pr(Error(H(423)), t), t = qc(e, t, r, n, o);
          break e;
        } else if (r !== o) {
          o = Pr(Error(H(424)), t), t = qc(e, t, r, n, o);
          break e;
        } else for (Ze = an(t.stateNode.containerInfo.firstChild), qe = t, ae = !0, mt = null, n = xp(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (Mr(), r === o) {
            t = Wt(e, t, n);
            break e;
          }
          Fe(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return Ep(t), e === null && iu(t), r = t.type, o = t.pendingProps, i = e !== null ? e.memoizedProps : null, l = o.children, eu(r, o) ? l = null : i !== null && eu(r, i) && (t.flags |= 32), Kp(e, t), Fe(e, t, l, n), t.child;
    case 6:
      return e === null && iu(t), null;
    case 13:
      return Zp(e, t, n);
    case 4:
      return ha(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = zr(t, null, r, n) : Fe(e, t, r, n), t.child;
    case 11:
      return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : dt(r, o), Kc(e, t, r, o, n);
    case 7:
      return Fe(e, t, t.pendingProps, n), t.child;
    case 8:
      return Fe(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return Fe(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, o = t.pendingProps, i = t.memoizedProps, l = o.value, ie(tl, r._currentValue), r._currentValue = l, i !== null) if (xt(i.value, l)) {
          if (i.children === o.children && !Ye.current) {
            t = Wt(e, t, n);
            break e;
          }
        } else for (i = t.child, i !== null && (i.return = t); i !== null; ) {
          var s = i.dependencies;
          if (s !== null) {
            l = i.child;
            for (var u = s.firstContext; u !== null; ) {
              if (u.context === r) {
                if (i.tag === 1) {
                  u = Ht(-1, n & -n), u.tag = 2;
                  var a = i.updateQueue;
                  if (a !== null) {
                    a = a.shared;
                    var c = a.pending;
                    c === null ? u.next = u : (u.next = c.next, c.next = u), a.pending = u;
                  }
                }
                i.lanes |= n, u = i.alternate, u !== null && (u.lanes |= n), lu(
                  i.return,
                  n,
                  t
                ), s.lanes |= n;
                break;
              }
              u = u.next;
            }
          } else if (i.tag === 10) l = i.type === t.type ? null : i.child;
          else if (i.tag === 18) {
            if (l = i.return, l === null) throw Error(H(341));
            l.lanes |= n, s = l.alternate, s !== null && (s.lanes |= n), lu(l, n, t), l = i.sibling;
          } else l = i.child;
          if (l !== null) l.return = i;
          else for (l = i; l !== null; ) {
            if (l === t) {
              l = null;
              break;
            }
            if (i = l.sibling, i !== null) {
              i.return = l.return, l = i;
              break;
            }
            l = l.return;
          }
          i = l;
        }
        Fe(e, t, o.children, n), t = t.child;
      }
      return t;
    case 9:
      return o = t.type, r = t.pendingProps.children, xr(t, n), o = ut(o), r = r(o), t.flags |= 1, Fe(e, t, r, n), t.child;
    case 14:
      return r = t.type, o = dt(r, t.pendingProps), o = dt(r.type, o), Gc(e, t, r, o, n);
    case 15:
      return Xp(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : dt(r, o), Ii(e, t), t.tag = 1, Xe(r) ? (e = !0, Ji(t)) : e = !1, xr(t, n), jp(t, r, o), uu(t, r, o, n), fu(null, t, r, !0, e, n);
    case 19:
      return qp(e, t, n);
    case 22:
      return Qp(e, t, n);
  }
  throw Error(H(156, t.tag));
};
function ph(e, t) {
  return Vd(e, t);
}
function By(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function it(e, t, n, r) {
  return new By(e, t, n, r);
}
function Ta(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function Uy(e) {
  if (typeof e == "function") return Ta(e) ? 1 : 0;
  if (e != null) {
    if (e = e.$$typeof, e === Ku) return 11;
    if (e === Gu) return 14;
  }
  return 2;
}
function pn(e, t) {
  var n = e.alternate;
  return n === null ? (n = it(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
}
function Oi(e, t, n, r, o, i) {
  var l = 2;
  if (r = e, typeof e == "function") Ta(e) && (l = 1);
  else if (typeof e == "string") l = 5;
  else e: switch (e) {
    case or:
      return Dn(n.children, o, i, t);
    case Qu:
      l = 8, o |= 8;
      break;
    case Rs:
      return e = it(12, n, t, o | 2), e.elementType = Rs, e.lanes = i, e;
    case As:
      return e = it(13, n, t, o), e.elementType = As, e.lanes = i, e;
    case Is:
      return e = it(19, n, t, o), e.elementType = Is, e.lanes = i, e;
    case Ed:
      return $l(n, o, i, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case Sd:
          l = 10;
          break e;
        case _d:
          l = 9;
          break e;
        case Ku:
          l = 11;
          break e;
        case Gu:
          l = 14;
          break e;
        case Zt:
          l = 16, r = null;
          break e;
      }
      throw Error(H(130, e == null ? e : typeof e, ""));
  }
  return t = it(l, n, t, o), t.elementType = e, t.type = r, t.lanes = i, t;
}
function Dn(e, t, n, r) {
  return e = it(7, e, r, t), e.lanes = n, e;
}
function $l(e, t, n, r) {
  return e = it(22, e, r, t), e.elementType = Ed, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
}
function ys(e, t, n) {
  return e = it(6, e, null, t), e.lanes = n, e;
}
function vs(e, t, n) {
  return t = it(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
}
function jy(e, t, n, r, o) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Jl(0), this.expirationTimes = Jl(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Jl(0), this.identifierPrefix = r, this.onRecoverableError = o, this.mutableSourceEagerHydrationData = null;
}
function Pa(e, t, n, r, o, i, l, s, u) {
  return e = new jy(e, t, n, s, u), t === 1 ? (t = 1, i === !0 && (t |= 8)) : t = 0, i = it(3, null, null, t), e.current = i, i.stateNode = e, i.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, pa(i), e;
}
function Wy(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return { $$typeof: rr, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
}
function hh(e) {
  if (!e) return gn;
  e = e._reactInternals;
  e: {
    if (Xn(e) !== e || e.tag !== 1) throw Error(H(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (Xe(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(H(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (Xe(n)) return hp(e, n, t);
  }
  return t;
}
function mh(e, t, n, r, o, i, l, s, u) {
  return e = Pa(n, r, !0, e, o, i, l, s, u), e.context = hh(null), n = e.current, r = He(), o = dn(n), i = Ht(r, o), i.callback = t ?? null, cn(n, i, o), e.current.lanes = o, Qo(e, o, r), Qe(e, r), e;
}
function Rl(e, t, n, r) {
  var o = t.current, i = He(), l = dn(o);
  return n = hh(n), t.context === null ? t.context = n : t.pendingContext = n, t = Ht(i, l), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = cn(o, t, l), e !== null && (vt(e, o, l, i), $i(e, o, l)), l;
}
function fl(e) {
  if (e = e.current, !e.child) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function uf(e, t) {
  if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function $a(e, t) {
  uf(e, t), (e = e.alternate) && uf(e, t);
}
function Yy() {
  return null;
}
var gh = typeof reportError == "function" ? reportError : function(e) {
  console.error(e);
};
function Ra(e) {
  this._internalRoot = e;
}
Al.prototype.render = Ra.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null) throw Error(H(409));
  Rl(e, t, null, null);
};
Al.prototype.unmount = Ra.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    Un(function() {
      Rl(null, e, null, null);
    }), t[Ut] = null;
  }
};
function Al(e) {
  this._internalRoot = e;
}
Al.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
    var t = Qd();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < en.length && t !== 0 && t < en[n].priority; n++) ;
    en.splice(n, 0, e), n === 0 && Gd(e);
  }
};
function Aa(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
}
function Il(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
}
function af() {
}
function Xy(e, t, n, r, o) {
  if (o) {
    if (typeof r == "function") {
      var i = r;
      r = function() {
        var a = fl(l);
        i.call(a);
      };
    }
    var l = mh(t, r, e, 0, null, !1, !1, "", af);
    return e._reactRootContainer = l, e[Ut] = l.current, zo(e.nodeType === 8 ? e.parentNode : e), Un(), l;
  }
  for (; o = e.lastChild; ) e.removeChild(o);
  if (typeof r == "function") {
    var s = r;
    r = function() {
      var a = fl(u);
      s.call(a);
    };
  }
  var u = Pa(e, 0, !1, null, null, !1, !1, "", af);
  return e._reactRootContainer = u, e[Ut] = u.current, zo(e.nodeType === 8 ? e.parentNode : e), Un(function() {
    Rl(t, u, n, r);
  }), u;
}
function Dl(e, t, n, r, o) {
  var i = n._reactRootContainer;
  if (i) {
    var l = i;
    if (typeof o == "function") {
      var s = o;
      o = function() {
        var u = fl(l);
        s.call(u);
      };
    }
    Rl(t, l, e, o);
  } else l = Xy(n, t, e, o, r);
  return fl(l);
}
Yd = function(e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = io(t.pendingLanes);
        n !== 0 && (Ju(t, n | 1), Qe(t, ge()), !(b & 6) && ($r = ge() + 500, wn()));
      }
      break;
    case 13:
      Un(function() {
        var r = jt(e, 1);
        if (r !== null) {
          var o = He();
          vt(r, e, 1, o);
        }
      }), $a(e, 1);
  }
};
bu = function(e) {
  if (e.tag === 13) {
    var t = jt(e, 134217728);
    if (t !== null) {
      var n = He();
      vt(t, e, 134217728, n);
    }
    $a(e, 134217728);
  }
};
Xd = function(e) {
  if (e.tag === 13) {
    var t = dn(e), n = jt(e, t);
    if (n !== null) {
      var r = He();
      vt(n, e, t, r);
    }
    $a(e, t);
  }
};
Qd = function() {
  return re;
};
Kd = function(e, t) {
  var n = re;
  try {
    return re = e, t();
  } finally {
    re = n;
  }
};
Ws = function(e, t, n) {
  switch (t) {
    case "input":
      if (Os(e, n), t = n.name, n.type === "radio" && t != null) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var o = Nl(r);
            if (!o) throw Error(H(90));
            Nd(r), Os(r, o);
          }
        }
      }
      break;
    case "textarea":
      Md(e, n);
      break;
    case "select":
      t = n.value, t != null && gr(e, !!n.multiple, t, !1);
  }
};
Id = Ca;
Dd = Un;
var Qy = { usingClientEntryPoint: !1, Events: [Go, ur, Nl, Rd, Ad, Ca] }, qr = { findFiberByHostInstance: Tn, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Ky = { bundleType: qr.bundleType, version: qr.version, rendererPackageName: qr.rendererPackageName, rendererConfig: qr.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: Qt.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
  return e = Fd(e), e === null ? null : e.stateNode;
}, findFiberByHostInstance: qr.findFiberByHostInstance || Yy, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var gi = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!gi.isDisabled && gi.supportsFiber) try {
    Sl = gi.inject(Ky), Ct = gi;
  } catch {
  }
}
et.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Qy;
et.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!Aa(t)) throw Error(H(200));
  return Wy(e, t, null, n);
};
et.createRoot = function(e, t) {
  if (!Aa(e)) throw Error(H(299));
  var n = !1, r = "", o = gh;
  return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (o = t.onRecoverableError)), t = Pa(e, 1, !1, null, null, n, !1, r, o), e[Ut] = t.current, zo(e.nodeType === 8 ? e.parentNode : e), new Ra(t);
};
et.findDOMNode = function(e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function" ? Error(H(188)) : (e = Object.keys(e).join(","), Error(H(268, e)));
  return e = Fd(t), e = e === null ? null : e.stateNode, e;
};
et.flushSync = function(e) {
  return Un(e);
};
et.hydrate = function(e, t, n) {
  if (!Il(t)) throw Error(H(200));
  return Dl(null, e, t, !0, n);
};
et.hydrateRoot = function(e, t, n) {
  if (!Aa(e)) throw Error(H(405));
  var r = n != null && n.hydratedSources || null, o = !1, i = "", l = gh;
  if (n != null && (n.unstable_strictMode === !0 && (o = !0), n.identifierPrefix !== void 0 && (i = n.identifierPrefix), n.onRecoverableError !== void 0 && (l = n.onRecoverableError)), t = mh(t, null, e, 1, n ?? null, o, !1, i, l), e[Ut] = t.current, zo(e), r) for (e = 0; e < r.length; e++) n = r[e], o = n._getVersion, o = o(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, o] : t.mutableSourceEagerHydrationData.push(
    n,
    o
  );
  return new Al(t);
};
et.render = function(e, t, n) {
  if (!Il(t)) throw Error(H(200));
  return Dl(null, e, t, !1, n);
};
et.unmountComponentAtNode = function(e) {
  if (!Il(e)) throw Error(H(40));
  return e._reactRootContainer ? (Un(function() {
    Dl(null, null, e, !1, function() {
      e._reactRootContainer = null, e[Ut] = null;
    });
  }), !0) : !1;
};
et.unstable_batchedUpdates = Ca;
et.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!Il(n)) throw Error(H(200));
  if (e == null || e._reactInternals === void 0) throw Error(H(38));
  return Dl(e, t, n, !1, r);
};
et.version = "18.3.1-next-f1338f8080-20240426";
function yh() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(yh);
    } catch (e) {
      console.error(e);
    }
}
yh(), yd.exports = et;
var Gy = yd.exports, vh, cf = Gy;
vh = cf.createRoot, cf.hydrateRoot;
function Te(e) {
  if (typeof e == "string" || typeof e == "number") return "" + e;
  let t = "";
  if (Array.isArray(e))
    for (let n = 0, r; n < e.length; n++)
      (r = Te(e[n])) !== "" && (t += (t && " ") + r);
  else
    for (let n in e)
      e[n] && (t += (t && " ") + n);
  return t;
}
var wh = { exports: {} }, xh = {}, Sh = { exports: {} }, _h = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Rr = T;
function Zy(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var qy = typeof Object.is == "function" ? Object.is : Zy, Jy = Rr.useState, by = Rr.useEffect, ev = Rr.useLayoutEffect, tv = Rr.useDebugValue;
function nv(e, t) {
  var n = t(), r = Jy({ inst: { value: n, getSnapshot: t } }), o = r[0].inst, i = r[1];
  return ev(
    function() {
      o.value = n, o.getSnapshot = t, ws(o) && i({ inst: o });
    },
    [e, n, t]
  ), by(
    function() {
      return ws(o) && i({ inst: o }), e(function() {
        ws(o) && i({ inst: o });
      });
    },
    [e]
  ), tv(n), n;
}
function ws(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !qy(e, n);
  } catch {
    return !0;
  }
}
function rv(e, t) {
  return t();
}
var ov = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? rv : nv;
_h.useSyncExternalStore = Rr.useSyncExternalStore !== void 0 ? Rr.useSyncExternalStore : ov;
Sh.exports = _h;
var iv = Sh.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ll = T, lv = iv;
function sv(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var uv = typeof Object.is == "function" ? Object.is : sv, av = lv.useSyncExternalStore, cv = Ll.useRef, fv = Ll.useEffect, dv = Ll.useMemo, pv = Ll.useDebugValue;
xh.useSyncExternalStoreWithSelector = function(e, t, n, r, o) {
  var i = cv(null);
  if (i.current === null) {
    var l = { hasValue: !1, value: null };
    i.current = l;
  } else l = i.current;
  i = dv(
    function() {
      function u(m) {
        if (!a) {
          if (a = !0, c = m, m = r(m), o !== void 0 && l.hasValue) {
            var x = l.value;
            if (o(x, m))
              return f = x;
          }
          return f = m;
        }
        if (x = f, uv(c, m)) return x;
        var w = r(m);
        return o !== void 0 && o(x, w) ? (c = m, x) : (c = m, f = w);
      }
      var a = !1, c, f, d = n === void 0 ? null : n;
      return [
        function() {
          return u(t());
        },
        d === null ? void 0 : function() {
          return u(d());
        }
      ];
    },
    [t, n, r, o]
  );
  var s = av(e, i[0], i[1]);
  return fv(
    function() {
      l.hasValue = !0, l.value = s;
    },
    [s]
  ), pv(s), s;
};
wh.exports = xh;
var hv = wh.exports;
const mv = /* @__PURE__ */ id(hv), gv = {}, ff = (e) => {
  let t;
  const n = /* @__PURE__ */ new Set(), r = (c, f) => {
    const d = typeof c == "function" ? c(t) : c;
    if (!Object.is(d, t)) {
      const m = t;
      t = f ?? (typeof d != "object" || d === null) ? d : Object.assign({}, t, d), n.forEach((x) => x(t, m));
    }
  }, o = () => t, u = { setState: r, getState: o, getInitialState: () => a, subscribe: (c) => (n.add(c), () => n.delete(c)), destroy: () => {
    (gv ? "production" : void 0) !== "production" && console.warn(
      "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
    ), n.clear();
  } }, a = t = e(r, o, u);
  return u;
}, yv = (e) => e ? ff(e) : ff, { useDebugValue: vv } = R, { useSyncExternalStoreWithSelector: wv } = mv, xv = (e) => e;
function Eh(e, t = xv, n) {
  const r = wv(
    e.subscribe,
    e.getState,
    e.getServerState || e.getInitialState,
    t,
    n
  );
  return vv(r), r;
}
const df = (e, t) => {
  const n = yv(e), r = (o, i = t) => Eh(n, o, i);
  return Object.assign(r, n), r;
}, Sv = (e, t) => e ? df(e, t) : df;
function ke(e, t) {
  if (Object.is(e, t))
    return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null)
    return !1;
  if (e instanceof Map && t instanceof Map) {
    if (e.size !== t.size) return !1;
    for (const [r, o] of e)
      if (!Object.is(o, t.get(r)))
        return !1;
    return !0;
  }
  if (e instanceof Set && t instanceof Set) {
    if (e.size !== t.size) return !1;
    for (const r of e)
      if (!t.has(r))
        return !1;
    return !0;
  }
  const n = Object.keys(e);
  if (n.length !== Object.keys(t).length)
    return !1;
  for (const r of n)
    if (!Object.prototype.hasOwnProperty.call(t, r) || !Object.is(e[r], t[r]))
      return !1;
  return !0;
}
var _v = { value: () => {
} };
function Ol() {
  for (var e = 0, t = arguments.length, n = {}, r; e < t; ++e) {
    if (!(r = arguments[e] + "") || r in n || /[\s.]/.test(r)) throw new Error("illegal type: " + r);
    n[r] = [];
  }
  return new Fi(n);
}
function Fi(e) {
  this._ = e;
}
function Ev(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var r = "", o = n.indexOf(".");
    if (o >= 0 && (r = n.slice(o + 1), n = n.slice(0, o)), n && !t.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: r };
  });
}
Fi.prototype = Ol.prototype = {
  constructor: Fi,
  on: function(e, t) {
    var n = this._, r = Ev(e + "", n), o, i = -1, l = r.length;
    if (arguments.length < 2) {
      for (; ++i < l; ) if ((o = (e = r[i]).type) && (o = kv(n[o], e.name))) return o;
      return;
    }
    if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
    for (; ++i < l; )
      if (o = (e = r[i]).type) n[o] = pf(n[o], e.name, t);
      else if (t == null) for (o in n) n[o] = pf(n[o], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t) e[n] = t[n].slice();
    return new Fi(e);
  },
  call: function(e, t) {
    if ((o = arguments.length - 2) > 0) for (var n = new Array(o), r = 0, o, i; r < o; ++r) n[r] = arguments[r + 2];
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (i = this._[e], r = 0, o = i.length; r < o; ++r) i[r].value.apply(t, n);
  },
  apply: function(e, t, n) {
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (var r = this._[e], o = 0, i = r.length; o < i; ++o) r[o].value.apply(t, n);
  }
};
function kv(e, t) {
  for (var n = 0, r = e.length, o; n < r; ++n)
    if ((o = e[n]).name === t)
      return o.value;
}
function pf(e, t, n) {
  for (var r = 0, o = e.length; r < o; ++r)
    if (e[r].name === t) {
      e[r] = _v, e = e.slice(0, r).concat(e.slice(r + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var Eu = "http://www.w3.org/1999/xhtml";
const hf = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Eu,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function Fl(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), hf.hasOwnProperty(t) ? { space: hf[t], local: e } : e;
}
function Nv(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === Eu && t.documentElement.namespaceURI === Eu ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function Cv(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function kh(e) {
  var t = Fl(e);
  return (t.local ? Cv : Nv)(t);
}
function Mv() {
}
function Ia(e) {
  return e == null ? Mv : function() {
    return this.querySelector(e);
  };
}
function zv(e) {
  typeof e != "function" && (e = Ia(e));
  for (var t = this._groups, n = t.length, r = new Array(n), o = 0; o < n; ++o)
    for (var i = t[o], l = i.length, s = r[o] = new Array(l), u, a, c = 0; c < l; ++c)
      (u = i[c]) && (a = e.call(u, u.__data__, c, i)) && ("__data__" in u && (a.__data__ = u.__data__), s[c] = a);
  return new be(r, this._parents);
}
function Tv(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function Pv() {
  return [];
}
function Nh(e) {
  return e == null ? Pv : function() {
    return this.querySelectorAll(e);
  };
}
function $v(e) {
  return function() {
    return Tv(e.apply(this, arguments));
  };
}
function Rv(e) {
  typeof e == "function" ? e = $v(e) : e = Nh(e);
  for (var t = this._groups, n = t.length, r = [], o = [], i = 0; i < n; ++i)
    for (var l = t[i], s = l.length, u, a = 0; a < s; ++a)
      (u = l[a]) && (r.push(e.call(u, u.__data__, a, l)), o.push(u));
  return new be(r, o);
}
function Ch(e) {
  return function() {
    return this.matches(e);
  };
}
function Mh(e) {
  return function(t) {
    return t.matches(e);
  };
}
var Av = Array.prototype.find;
function Iv(e) {
  return function() {
    return Av.call(this.children, e);
  };
}
function Dv() {
  return this.firstElementChild;
}
function Lv(e) {
  return this.select(e == null ? Dv : Iv(typeof e == "function" ? e : Mh(e)));
}
var Ov = Array.prototype.filter;
function Fv() {
  return Array.from(this.children);
}
function Hv(e) {
  return function() {
    return Ov.call(this.children, e);
  };
}
function Vv(e) {
  return this.selectAll(e == null ? Fv : Hv(typeof e == "function" ? e : Mh(e)));
}
function Bv(e) {
  typeof e != "function" && (e = Ch(e));
  for (var t = this._groups, n = t.length, r = new Array(n), o = 0; o < n; ++o)
    for (var i = t[o], l = i.length, s = r[o] = [], u, a = 0; a < l; ++a)
      (u = i[a]) && e.call(u, u.__data__, a, i) && s.push(u);
  return new be(r, this._parents);
}
function zh(e) {
  return new Array(e.length);
}
function Uv() {
  return new be(this._enter || this._groups.map(zh), this._parents);
}
function dl(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
dl.prototype = {
  constructor: dl,
  appendChild: function(e) {
    return this._parent.insertBefore(e, this._next);
  },
  insertBefore: function(e, t) {
    return this._parent.insertBefore(e, t);
  },
  querySelector: function(e) {
    return this._parent.querySelector(e);
  },
  querySelectorAll: function(e) {
    return this._parent.querySelectorAll(e);
  }
};
function jv(e) {
  return function() {
    return e;
  };
}
function Wv(e, t, n, r, o, i) {
  for (var l = 0, s, u = t.length, a = i.length; l < a; ++l)
    (s = t[l]) ? (s.__data__ = i[l], r[l] = s) : n[l] = new dl(e, i[l]);
  for (; l < u; ++l)
    (s = t[l]) && (o[l] = s);
}
function Yv(e, t, n, r, o, i, l) {
  var s, u, a = /* @__PURE__ */ new Map(), c = t.length, f = i.length, d = new Array(c), m;
  for (s = 0; s < c; ++s)
    (u = t[s]) && (d[s] = m = l.call(u, u.__data__, s, t) + "", a.has(m) ? o[s] = u : a.set(m, u));
  for (s = 0; s < f; ++s)
    m = l.call(e, i[s], s, i) + "", (u = a.get(m)) ? (r[s] = u, u.__data__ = i[s], a.delete(m)) : n[s] = new dl(e, i[s]);
  for (s = 0; s < c; ++s)
    (u = t[s]) && a.get(d[s]) === u && (o[s] = u);
}
function Xv(e) {
  return e.__data__;
}
function Qv(e, t) {
  if (!arguments.length) return Array.from(this, Xv);
  var n = t ? Yv : Wv, r = this._parents, o = this._groups;
  typeof e != "function" && (e = jv(e));
  for (var i = o.length, l = new Array(i), s = new Array(i), u = new Array(i), a = 0; a < i; ++a) {
    var c = r[a], f = o[a], d = f.length, m = Kv(e.call(c, c && c.__data__, a, r)), x = m.length, w = s[a] = new Array(x), _ = l[a] = new Array(x), p = u[a] = new Array(d);
    n(c, f, w, _, p, m, t);
    for (var h = 0, g = 0, y, E; h < x; ++h)
      if (y = w[h]) {
        for (h >= g && (g = h + 1); !(E = _[g]) && ++g < x; ) ;
        y._next = E || null;
      }
  }
  return l = new be(l, r), l._enter = s, l._exit = u, l;
}
function Kv(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function Gv() {
  return new be(this._exit || this._groups.map(zh), this._parents);
}
function Zv(e, t, n) {
  var r = this.enter(), o = this, i = this.exit();
  return typeof e == "function" ? (r = e(r), r && (r = r.selection())) : r = r.append(e + ""), t != null && (o = t(o), o && (o = o.selection())), n == null ? i.remove() : n(i), r && o ? r.merge(o).order() : o;
}
function qv(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, r = t._groups, o = n.length, i = r.length, l = Math.min(o, i), s = new Array(o), u = 0; u < l; ++u)
    for (var a = n[u], c = r[u], f = a.length, d = s[u] = new Array(f), m, x = 0; x < f; ++x)
      (m = a[x] || c[x]) && (d[x] = m);
  for (; u < o; ++u)
    s[u] = n[u];
  return new be(s, this._parents);
}
function Jv() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var r = e[t], o = r.length - 1, i = r[o], l; --o >= 0; )
      (l = r[o]) && (i && l.compareDocumentPosition(i) ^ 4 && i.parentNode.insertBefore(l, i), i = l);
  return this;
}
function bv(e) {
  e || (e = e1);
  function t(f, d) {
    return f && d ? e(f.__data__, d.__data__) : !f - !d;
  }
  for (var n = this._groups, r = n.length, o = new Array(r), i = 0; i < r; ++i) {
    for (var l = n[i], s = l.length, u = o[i] = new Array(s), a, c = 0; c < s; ++c)
      (a = l[c]) && (u[c] = a);
    u.sort(t);
  }
  return new be(o, this._parents).order();
}
function e1(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function t1() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function n1() {
  return Array.from(this);
}
function r1() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var r = e[t], o = 0, i = r.length; o < i; ++o) {
      var l = r[o];
      if (l) return l;
    }
  return null;
}
function o1() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function i1() {
  return !this.node();
}
function l1(e) {
  for (var t = this._groups, n = 0, r = t.length; n < r; ++n)
    for (var o = t[n], i = 0, l = o.length, s; i < l; ++i)
      (s = o[i]) && e.call(s, s.__data__, i, o);
  return this;
}
function s1(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function u1(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function a1(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function c1(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function f1(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function d1(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function p1(e, t) {
  var n = Fl(e);
  if (arguments.length < 2) {
    var r = this.node();
    return n.local ? r.getAttributeNS(n.space, n.local) : r.getAttribute(n);
  }
  return this.each((t == null ? n.local ? u1 : s1 : typeof t == "function" ? n.local ? d1 : f1 : n.local ? c1 : a1)(n, t));
}
function Th(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function h1(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function m1(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function g1(e, t, n) {
  return function() {
    var r = t.apply(this, arguments);
    r == null ? this.style.removeProperty(e) : this.style.setProperty(e, r, n);
  };
}
function y1(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? h1 : typeof t == "function" ? g1 : m1)(e, t, n ?? "")) : Ar(this.node(), e);
}
function Ar(e, t) {
  return e.style.getPropertyValue(t) || Th(e).getComputedStyle(e, null).getPropertyValue(t);
}
function v1(e) {
  return function() {
    delete this[e];
  };
}
function w1(e, t) {
  return function() {
    this[e] = t;
  };
}
function x1(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function S1(e, t) {
  return arguments.length > 1 ? this.each((t == null ? v1 : typeof t == "function" ? x1 : w1)(e, t)) : this.node()[e];
}
function Ph(e) {
  return e.trim().split(/^|\s+/);
}
function Da(e) {
  return e.classList || new $h(e);
}
function $h(e) {
  this._node = e, this._names = Ph(e.getAttribute("class") || "");
}
$h.prototype = {
  add: function(e) {
    var t = this._names.indexOf(e);
    t < 0 && (this._names.push(e), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(e) {
    var t = this._names.indexOf(e);
    t >= 0 && (this._names.splice(t, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(e) {
    return this._names.indexOf(e) >= 0;
  }
};
function Rh(e, t) {
  for (var n = Da(e), r = -1, o = t.length; ++r < o; ) n.add(t[r]);
}
function Ah(e, t) {
  for (var n = Da(e), r = -1, o = t.length; ++r < o; ) n.remove(t[r]);
}
function _1(e) {
  return function() {
    Rh(this, e);
  };
}
function E1(e) {
  return function() {
    Ah(this, e);
  };
}
function k1(e, t) {
  return function() {
    (t.apply(this, arguments) ? Rh : Ah)(this, e);
  };
}
function N1(e, t) {
  var n = Ph(e + "");
  if (arguments.length < 2) {
    for (var r = Da(this.node()), o = -1, i = n.length; ++o < i; ) if (!r.contains(n[o])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? k1 : t ? _1 : E1)(n, t));
}
function C1() {
  this.textContent = "";
}
function M1(e) {
  return function() {
    this.textContent = e;
  };
}
function z1(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function T1(e) {
  return arguments.length ? this.each(e == null ? C1 : (typeof e == "function" ? z1 : M1)(e)) : this.node().textContent;
}
function P1() {
  this.innerHTML = "";
}
function $1(e) {
  return function() {
    this.innerHTML = e;
  };
}
function R1(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function A1(e) {
  return arguments.length ? this.each(e == null ? P1 : (typeof e == "function" ? R1 : $1)(e)) : this.node().innerHTML;
}
function I1() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function D1() {
  return this.each(I1);
}
function L1() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function O1() {
  return this.each(L1);
}
function F1(e) {
  var t = typeof e == "function" ? e : kh(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function H1() {
  return null;
}
function V1(e, t) {
  var n = typeof e == "function" ? e : kh(e), r = t == null ? H1 : typeof t == "function" ? t : Ia(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), r.apply(this, arguments) || null);
  });
}
function B1() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function U1() {
  return this.each(B1);
}
function j1() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function W1() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Y1(e) {
  return this.select(e ? W1 : j1);
}
function X1(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function Q1(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function K1(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", r = t.indexOf(".");
    return r >= 0 && (n = t.slice(r + 1), t = t.slice(0, r)), { type: t, name: n };
  });
}
function G1(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, r = -1, o = t.length, i; n < o; ++n)
        i = t[n], (!e.type || i.type === e.type) && i.name === e.name ? this.removeEventListener(i.type, i.listener, i.options) : t[++r] = i;
      ++r ? t.length = r : delete this.__on;
    }
  };
}
function Z1(e, t, n) {
  return function() {
    var r = this.__on, o, i = Q1(t);
    if (r) {
      for (var l = 0, s = r.length; l < s; ++l)
        if ((o = r[l]).type === e.type && o.name === e.name) {
          this.removeEventListener(o.type, o.listener, o.options), this.addEventListener(o.type, o.listener = i, o.options = n), o.value = t;
          return;
        }
    }
    this.addEventListener(e.type, i, n), o = { type: e.type, name: e.name, value: t, listener: i, options: n }, r ? r.push(o) : this.__on = [o];
  };
}
function q1(e, t, n) {
  var r = K1(e + ""), o, i = r.length, l;
  if (arguments.length < 2) {
    var s = this.node().__on;
    if (s) {
      for (var u = 0, a = s.length, c; u < a; ++u)
        for (o = 0, c = s[u]; o < i; ++o)
          if ((l = r[o]).type === c.type && l.name === c.name)
            return c.value;
    }
    return;
  }
  for (s = t ? Z1 : G1, o = 0; o < i; ++o) this.each(s(r[o], t, n));
  return this;
}
function Ih(e, t, n) {
  var r = Th(e), o = r.CustomEvent;
  typeof o == "function" ? o = new o(t, n) : (o = r.document.createEvent("Event"), n ? (o.initEvent(t, n.bubbles, n.cancelable), o.detail = n.detail) : o.initEvent(t, !1, !1)), e.dispatchEvent(o);
}
function J1(e, t) {
  return function() {
    return Ih(this, e, t);
  };
}
function b1(e, t) {
  return function() {
    return Ih(this, e, t.apply(this, arguments));
  };
}
function ew(e, t) {
  return this.each((typeof t == "function" ? b1 : J1)(e, t));
}
function* tw() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var r = e[t], o = 0, i = r.length, l; o < i; ++o)
      (l = r[o]) && (yield l);
}
var Dh = [null];
function be(e, t) {
  this._groups = e, this._parents = t;
}
function qo() {
  return new be([[document.documentElement]], Dh);
}
function nw() {
  return this;
}
be.prototype = qo.prototype = {
  constructor: be,
  select: zv,
  selectAll: Rv,
  selectChild: Lv,
  selectChildren: Vv,
  filter: Bv,
  data: Qv,
  enter: Uv,
  exit: Gv,
  join: Zv,
  merge: qv,
  selection: nw,
  order: Jv,
  sort: bv,
  call: t1,
  nodes: n1,
  node: r1,
  size: o1,
  empty: i1,
  each: l1,
  attr: p1,
  style: y1,
  property: S1,
  classed: N1,
  text: T1,
  html: A1,
  raise: D1,
  lower: O1,
  append: F1,
  insert: V1,
  remove: U1,
  clone: Y1,
  datum: X1,
  on: q1,
  dispatch: ew,
  [Symbol.iterator]: tw
};
function ot(e) {
  return typeof e == "string" ? new be([[document.querySelector(e)]], [document.documentElement]) : new be([[e]], Dh);
}
function rw(e) {
  let t;
  for (; t = e.sourceEvent; ) e = t;
  return e;
}
function ht(e, t) {
  if (e = rw(e), t === void 0 && (t = e.currentTarget), t) {
    var n = t.ownerSVGElement || t;
    if (n.createSVGPoint) {
      var r = n.createSVGPoint();
      return r.x = e.clientX, r.y = e.clientY, r = r.matrixTransform(t.getScreenCTM().inverse()), [r.x, r.y];
    }
    if (t.getBoundingClientRect) {
      var o = t.getBoundingClientRect();
      return [e.clientX - o.left - t.clientLeft, e.clientY - o.top - t.clientTop];
    }
  }
  return [e.pageX, e.pageY];
}
const ow = { passive: !1 }, Oo = { capture: !0, passive: !1 };
function xs(e) {
  e.stopImmediatePropagation();
}
function _r(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function Lh(e) {
  var t = e.document.documentElement, n = ot(e).on("dragstart.drag", _r, Oo);
  "onselectstart" in t ? n.on("selectstart.drag", _r, Oo) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function Oh(e, t) {
  var n = e.document.documentElement, r = ot(e).on("dragstart.drag", null);
  t && (r.on("click.drag", _r, Oo), setTimeout(function() {
    r.on("click.drag", null);
  }, 0)), "onselectstart" in n ? r.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
const yi = (e) => () => e;
function ku(e, {
  sourceEvent: t,
  subject: n,
  target: r,
  identifier: o,
  active: i,
  x: l,
  y: s,
  dx: u,
  dy: a,
  dispatch: c
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    subject: { value: n, enumerable: !0, configurable: !0 },
    target: { value: r, enumerable: !0, configurable: !0 },
    identifier: { value: o, enumerable: !0, configurable: !0 },
    active: { value: i, enumerable: !0, configurable: !0 },
    x: { value: l, enumerable: !0, configurable: !0 },
    y: { value: s, enumerable: !0, configurable: !0 },
    dx: { value: u, enumerable: !0, configurable: !0 },
    dy: { value: a, enumerable: !0, configurable: !0 },
    _: { value: c }
  });
}
ku.prototype.on = function() {
  var e = this._.on.apply(this._, arguments);
  return e === this._ ? this : e;
};
function iw(e) {
  return !e.ctrlKey && !e.button;
}
function lw() {
  return this.parentNode;
}
function sw(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function uw() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function aw() {
  var e = iw, t = lw, n = sw, r = uw, o = {}, i = Ol("start", "drag", "end"), l = 0, s, u, a, c, f = 0;
  function d(y) {
    y.on("mousedown.drag", m).filter(r).on("touchstart.drag", _).on("touchmove.drag", p, ow).on("touchend.drag touchcancel.drag", h).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function m(y, E) {
    if (!(c || !e.call(this, y, E))) {
      var C = g(this, t.call(this, y, E), y, E, "mouse");
      C && (ot(y.view).on("mousemove.drag", x, Oo).on("mouseup.drag", w, Oo), Lh(y.view), xs(y), a = !1, s = y.clientX, u = y.clientY, C("start", y));
    }
  }
  function x(y) {
    if (_r(y), !a) {
      var E = y.clientX - s, C = y.clientY - u;
      a = E * E + C * C > f;
    }
    o.mouse("drag", y);
  }
  function w(y) {
    ot(y.view).on("mousemove.drag mouseup.drag", null), Oh(y.view, a), _r(y), o.mouse("end", y);
  }
  function _(y, E) {
    if (e.call(this, y, E)) {
      var C = y.changedTouches, M = t.call(this, y, E), P = C.length, A, I;
      for (A = 0; A < P; ++A)
        (I = g(this, M, y, E, C[A].identifier, C[A])) && (xs(y), I("start", y, C[A]));
    }
  }
  function p(y) {
    var E = y.changedTouches, C = E.length, M, P;
    for (M = 0; M < C; ++M)
      (P = o[E[M].identifier]) && (_r(y), P("drag", y, E[M]));
  }
  function h(y) {
    var E = y.changedTouches, C = E.length, M, P;
    for (c && clearTimeout(c), c = setTimeout(function() {
      c = null;
    }, 500), M = 0; M < C; ++M)
      (P = o[E[M].identifier]) && (xs(y), P("end", y, E[M]));
  }
  function g(y, E, C, M, P, A) {
    var I = i.copy(), F = ht(A || C, E), B, V, v;
    if ((v = n.call(y, new ku("beforestart", {
      sourceEvent: C,
      target: d,
      identifier: P,
      active: l,
      x: F[0],
      y: F[1],
      dx: 0,
      dy: 0,
      dispatch: I
    }), M)) != null)
      return B = v.x - F[0] || 0, V = v.y - F[1] || 0, function $(k, L, N) {
        var S = F, z;
        switch (k) {
          case "start":
            o[P] = $, z = l++;
            break;
          case "end":
            delete o[P], --l;
          case "drag":
            F = ht(N || L, E), z = l;
            break;
        }
        I.call(
          k,
          y,
          new ku(k, {
            sourceEvent: L,
            subject: v,
            target: d,
            identifier: P,
            active: z,
            x: F[0] + B,
            y: F[1] + V,
            dx: F[0] - S[0],
            dy: F[1] - S[1],
            dispatch: I
          }),
          M
        );
      };
  }
  return d.filter = function(y) {
    return arguments.length ? (e = typeof y == "function" ? y : yi(!!y), d) : e;
  }, d.container = function(y) {
    return arguments.length ? (t = typeof y == "function" ? y : yi(y), d) : t;
  }, d.subject = function(y) {
    return arguments.length ? (n = typeof y == "function" ? y : yi(y), d) : n;
  }, d.touchable = function(y) {
    return arguments.length ? (r = typeof y == "function" ? y : yi(!!y), d) : r;
  }, d.on = function() {
    var y = i.on.apply(i, arguments);
    return y === i ? d : y;
  }, d.clickDistance = function(y) {
    return arguments.length ? (f = (y = +y) * y, d) : Math.sqrt(f);
  }, d;
}
function La(e, t, n) {
  e.prototype = t.prototype = n, n.constructor = e;
}
function Fh(e, t) {
  var n = Object.create(e.prototype);
  for (var r in t) n[r] = t[r];
  return n;
}
function Jo() {
}
var Fo = 0.7, pl = 1 / Fo, Er = "\\s*([+-]?\\d+)\\s*", Ho = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", zt = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", cw = /^#([0-9a-f]{3,8})$/, fw = new RegExp(`^rgb\\(${Er},${Er},${Er}\\)$`), dw = new RegExp(`^rgb\\(${zt},${zt},${zt}\\)$`), pw = new RegExp(`^rgba\\(${Er},${Er},${Er},${Ho}\\)$`), hw = new RegExp(`^rgba\\(${zt},${zt},${zt},${Ho}\\)$`), mw = new RegExp(`^hsl\\(${Ho},${zt},${zt}\\)$`), gw = new RegExp(`^hsla\\(${Ho},${zt},${zt},${Ho}\\)$`), mf = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
La(Jo, Vo, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: gf,
  // Deprecated! Use color.formatHex.
  formatHex: gf,
  formatHex8: yw,
  formatHsl: vw,
  formatRgb: yf,
  toString: yf
});
function gf() {
  return this.rgb().formatHex();
}
function yw() {
  return this.rgb().formatHex8();
}
function vw() {
  return Hh(this).formatHsl();
}
function yf() {
  return this.rgb().formatRgb();
}
function Vo(e) {
  var t, n;
  return e = (e + "").trim().toLowerCase(), (t = cw.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? vf(t) : n === 3 ? new We(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? vi(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? vi(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = fw.exec(e)) ? new We(t[1], t[2], t[3], 1) : (t = dw.exec(e)) ? new We(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = pw.exec(e)) ? vi(t[1], t[2], t[3], t[4]) : (t = hw.exec(e)) ? vi(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = mw.exec(e)) ? Sf(t[1], t[2] / 100, t[3] / 100, 1) : (t = gw.exec(e)) ? Sf(t[1], t[2] / 100, t[3] / 100, t[4]) : mf.hasOwnProperty(e) ? vf(mf[e]) : e === "transparent" ? new We(NaN, NaN, NaN, 0) : null;
}
function vf(e) {
  return new We(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function vi(e, t, n, r) {
  return r <= 0 && (e = t = n = NaN), new We(e, t, n, r);
}
function ww(e) {
  return e instanceof Jo || (e = Vo(e)), e ? (e = e.rgb(), new We(e.r, e.g, e.b, e.opacity)) : new We();
}
function Nu(e, t, n, r) {
  return arguments.length === 1 ? ww(e) : new We(e, t, n, r ?? 1);
}
function We(e, t, n, r) {
  this.r = +e, this.g = +t, this.b = +n, this.opacity = +r;
}
La(We, Nu, Fh(Jo, {
  brighter(e) {
    return e = e == null ? pl : Math.pow(pl, e), new We(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? Fo : Math.pow(Fo, e), new We(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new We(Ln(this.r), Ln(this.g), Ln(this.b), hl(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: wf,
  // Deprecated! Use color.formatHex.
  formatHex: wf,
  formatHex8: xw,
  formatRgb: xf,
  toString: xf
}));
function wf() {
  return `#${Rn(this.r)}${Rn(this.g)}${Rn(this.b)}`;
}
function xw() {
  return `#${Rn(this.r)}${Rn(this.g)}${Rn(this.b)}${Rn((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function xf() {
  const e = hl(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${Ln(this.r)}, ${Ln(this.g)}, ${Ln(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function hl(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function Ln(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function Rn(e) {
  return e = Ln(e), (e < 16 ? "0" : "") + e.toString(16);
}
function Sf(e, t, n, r) {
  return r <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new gt(e, t, n, r);
}
function Hh(e) {
  if (e instanceof gt) return new gt(e.h, e.s, e.l, e.opacity);
  if (e instanceof Jo || (e = Vo(e)), !e) return new gt();
  if (e instanceof gt) return e;
  e = e.rgb();
  var t = e.r / 255, n = e.g / 255, r = e.b / 255, o = Math.min(t, n, r), i = Math.max(t, n, r), l = NaN, s = i - o, u = (i + o) / 2;
  return s ? (t === i ? l = (n - r) / s + (n < r) * 6 : n === i ? l = (r - t) / s + 2 : l = (t - n) / s + 4, s /= u < 0.5 ? i + o : 2 - i - o, l *= 60) : s = u > 0 && u < 1 ? 0 : l, new gt(l, s, u, e.opacity);
}
function Sw(e, t, n, r) {
  return arguments.length === 1 ? Hh(e) : new gt(e, t, n, r ?? 1);
}
function gt(e, t, n, r) {
  this.h = +e, this.s = +t, this.l = +n, this.opacity = +r;
}
La(gt, Sw, Fh(Jo, {
  brighter(e) {
    return e = e == null ? pl : Math.pow(pl, e), new gt(this.h, this.s, this.l * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? Fo : Math.pow(Fo, e), new gt(this.h, this.s, this.l * e, this.opacity);
  },
  rgb() {
    var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, n = this.l, r = n + (n < 0.5 ? n : 1 - n) * t, o = 2 * n - r;
    return new We(
      Ss(e >= 240 ? e - 240 : e + 120, o, r),
      Ss(e, o, r),
      Ss(e < 120 ? e + 240 : e - 120, o, r),
      this.opacity
    );
  },
  clamp() {
    return new gt(_f(this.h), wi(this.s), wi(this.l), hl(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = hl(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${_f(this.h)}, ${wi(this.s) * 100}%, ${wi(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function _f(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function wi(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function Ss(e, t, n) {
  return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
const Vh = (e) => () => e;
function _w(e, t) {
  return function(n) {
    return e + n * t;
  };
}
function Ew(e, t, n) {
  return e = Math.pow(e, n), t = Math.pow(t, n) - e, n = 1 / n, function(r) {
    return Math.pow(e + r * t, n);
  };
}
function kw(e) {
  return (e = +e) == 1 ? Bh : function(t, n) {
    return n - t ? Ew(t, n, e) : Vh(isNaN(t) ? n : t);
  };
}
function Bh(e, t) {
  var n = t - e;
  return n ? _w(e, n) : Vh(isNaN(e) ? t : e);
}
const Ef = function e(t) {
  var n = kw(t);
  function r(o, i) {
    var l = n((o = Nu(o)).r, (i = Nu(i)).r), s = n(o.g, i.g), u = n(o.b, i.b), a = Bh(o.opacity, i.opacity);
    return function(c) {
      return o.r = l(c), o.g = s(c), o.b = u(c), o.opacity = a(c), o + "";
    };
  }
  return r.gamma = e, r;
}(1);
function Jt(e, t) {
  return e = +e, t = +t, function(n) {
    return e * (1 - n) + t * n;
  };
}
var Cu = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, _s = new RegExp(Cu.source, "g");
function Nw(e) {
  return function() {
    return e;
  };
}
function Cw(e) {
  return function(t) {
    return e(t) + "";
  };
}
function Mw(e, t) {
  var n = Cu.lastIndex = _s.lastIndex = 0, r, o, i, l = -1, s = [], u = [];
  for (e = e + "", t = t + ""; (r = Cu.exec(e)) && (o = _s.exec(t)); )
    (i = o.index) > n && (i = t.slice(n, i), s[l] ? s[l] += i : s[++l] = i), (r = r[0]) === (o = o[0]) ? s[l] ? s[l] += o : s[++l] = o : (s[++l] = null, u.push({ i: l, x: Jt(r, o) })), n = _s.lastIndex;
  return n < t.length && (i = t.slice(n), s[l] ? s[l] += i : s[++l] = i), s.length < 2 ? u[0] ? Cw(u[0].x) : Nw(t) : (t = u.length, function(a) {
    for (var c = 0, f; c < t; ++c) s[(f = u[c]).i] = f.x(a);
    return s.join("");
  });
}
var kf = 180 / Math.PI, Mu = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function Uh(e, t, n, r, o, i) {
  var l, s, u;
  return (l = Math.sqrt(e * e + t * t)) && (e /= l, t /= l), (u = e * n + t * r) && (n -= e * u, r -= t * u), (s = Math.sqrt(n * n + r * r)) && (n /= s, r /= s, u /= s), e * r < t * n && (e = -e, t = -t, u = -u, l = -l), {
    translateX: o,
    translateY: i,
    rotate: Math.atan2(t, e) * kf,
    skewX: Math.atan(u) * kf,
    scaleX: l,
    scaleY: s
  };
}
var xi;
function zw(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? Mu : Uh(t.a, t.b, t.c, t.d, t.e, t.f);
}
function Tw(e) {
  return e == null || (xi || (xi = document.createElementNS("http://www.w3.org/2000/svg", "g")), xi.setAttribute("transform", e), !(e = xi.transform.baseVal.consolidate())) ? Mu : (e = e.matrix, Uh(e.a, e.b, e.c, e.d, e.e, e.f));
}
function jh(e, t, n, r) {
  function o(a) {
    return a.length ? a.pop() + " " : "";
  }
  function i(a, c, f, d, m, x) {
    if (a !== f || c !== d) {
      var w = m.push("translate(", null, t, null, n);
      x.push({ i: w - 4, x: Jt(a, f) }, { i: w - 2, x: Jt(c, d) });
    } else (f || d) && m.push("translate(" + f + t + d + n);
  }
  function l(a, c, f, d) {
    a !== c ? (a - c > 180 ? c += 360 : c - a > 180 && (a += 360), d.push({ i: f.push(o(f) + "rotate(", null, r) - 2, x: Jt(a, c) })) : c && f.push(o(f) + "rotate(" + c + r);
  }
  function s(a, c, f, d) {
    a !== c ? d.push({ i: f.push(o(f) + "skewX(", null, r) - 2, x: Jt(a, c) }) : c && f.push(o(f) + "skewX(" + c + r);
  }
  function u(a, c, f, d, m, x) {
    if (a !== f || c !== d) {
      var w = m.push(o(m) + "scale(", null, ",", null, ")");
      x.push({ i: w - 4, x: Jt(a, f) }, { i: w - 2, x: Jt(c, d) });
    } else (f !== 1 || d !== 1) && m.push(o(m) + "scale(" + f + "," + d + ")");
  }
  return function(a, c) {
    var f = [], d = [];
    return a = e(a), c = e(c), i(a.translateX, a.translateY, c.translateX, c.translateY, f, d), l(a.rotate, c.rotate, f, d), s(a.skewX, c.skewX, f, d), u(a.scaleX, a.scaleY, c.scaleX, c.scaleY, f, d), a = c = null, function(m) {
      for (var x = -1, w = d.length, _; ++x < w; ) f[(_ = d[x]).i] = _.x(m);
      return f.join("");
    };
  };
}
var Pw = jh(zw, "px, ", "px)", "deg)"), $w = jh(Tw, ", ", ")", ")"), Rw = 1e-12;
function Nf(e) {
  return ((e = Math.exp(e)) + 1 / e) / 2;
}
function Aw(e) {
  return ((e = Math.exp(e)) - 1 / e) / 2;
}
function Iw(e) {
  return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const Dw = function e(t, n, r) {
  function o(i, l) {
    var s = i[0], u = i[1], a = i[2], c = l[0], f = l[1], d = l[2], m = c - s, x = f - u, w = m * m + x * x, _, p;
    if (w < Rw)
      p = Math.log(d / a) / t, _ = function(M) {
        return [
          s + M * m,
          u + M * x,
          a * Math.exp(t * M * p)
        ];
      };
    else {
      var h = Math.sqrt(w), g = (d * d - a * a + r * w) / (2 * a * n * h), y = (d * d - a * a - r * w) / (2 * d * n * h), E = Math.log(Math.sqrt(g * g + 1) - g), C = Math.log(Math.sqrt(y * y + 1) - y);
      p = (C - E) / t, _ = function(M) {
        var P = M * p, A = Nf(E), I = a / (n * h) * (A * Iw(t * P + E) - Aw(E));
        return [
          s + I * m,
          u + I * x,
          a * A / Nf(t * P + E)
        ];
      };
    }
    return _.duration = p * 1e3 * t / Math.SQRT2, _;
  }
  return o.rho = function(i) {
    var l = Math.max(1e-3, +i), s = l * l, u = s * s;
    return e(l, s, u);
  }, o;
}(Math.SQRT2, 2, 4);
var Ir = 0, so = 0, Jr = 0, Wh = 1e3, ml, uo, gl = 0, jn = 0, Hl = 0, Bo = typeof performance == "object" && performance.now ? performance : Date, Yh = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function Oa() {
  return jn || (Yh(Lw), jn = Bo.now() + Hl);
}
function Lw() {
  jn = 0;
}
function yl() {
  this._call = this._time = this._next = null;
}
yl.prototype = Xh.prototype = {
  constructor: yl,
  restart: function(e, t, n) {
    if (typeof e != "function") throw new TypeError("callback is not a function");
    n = (n == null ? Oa() : +n) + (t == null ? 0 : +t), !this._next && uo !== this && (uo ? uo._next = this : ml = this, uo = this), this._call = e, this._time = n, zu();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, zu());
  }
};
function Xh(e, t, n) {
  var r = new yl();
  return r.restart(e, t, n), r;
}
function Ow() {
  Oa(), ++Ir;
  for (var e = ml, t; e; )
    (t = jn - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --Ir;
}
function Cf() {
  jn = (gl = Bo.now()) + Hl, Ir = so = 0;
  try {
    Ow();
  } finally {
    Ir = 0, Hw(), jn = 0;
  }
}
function Fw() {
  var e = Bo.now(), t = e - gl;
  t > Wh && (Hl -= t, gl = e);
}
function Hw() {
  for (var e, t = ml, n, r = 1 / 0; t; )
    t._call ? (r > t._time && (r = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : ml = n);
  uo = e, zu(r);
}
function zu(e) {
  if (!Ir) {
    so && (so = clearTimeout(so));
    var t = e - jn;
    t > 24 ? (e < 1 / 0 && (so = setTimeout(Cf, e - Bo.now() - Hl)), Jr && (Jr = clearInterval(Jr))) : (Jr || (gl = Bo.now(), Jr = setInterval(Fw, Wh)), Ir = 1, Yh(Cf));
  }
}
function Mf(e, t, n) {
  var r = new yl();
  return t = t == null ? 0 : +t, r.restart((o) => {
    r.stop(), e(o + t);
  }, t, n), r;
}
var Vw = Ol("start", "end", "cancel", "interrupt"), Bw = [], Qh = 0, zf = 1, Tu = 2, Hi = 3, Tf = 4, Pu = 5, Vi = 6;
function Vl(e, t, n, r, o, i) {
  var l = e.__transition;
  if (!l) e.__transition = {};
  else if (n in l) return;
  Uw(e, n, {
    name: t,
    index: r,
    // For context during callback.
    group: o,
    // For context during callback.
    on: Vw,
    tween: Bw,
    time: i.time,
    delay: i.delay,
    duration: i.duration,
    ease: i.ease,
    timer: null,
    state: Qh
  });
}
function Fa(e, t) {
  var n = St(e, t);
  if (n.state > Qh) throw new Error("too late; already scheduled");
  return n;
}
function Tt(e, t) {
  var n = St(e, t);
  if (n.state > Hi) throw new Error("too late; already running");
  return n;
}
function St(e, t) {
  var n = e.__transition;
  if (!n || !(n = n[t])) throw new Error("transition not found");
  return n;
}
function Uw(e, t, n) {
  var r = e.__transition, o;
  r[t] = n, n.timer = Xh(i, 0, n.time);
  function i(a) {
    n.state = zf, n.timer.restart(l, n.delay, n.time), n.delay <= a && l(a - n.delay);
  }
  function l(a) {
    var c, f, d, m;
    if (n.state !== zf) return u();
    for (c in r)
      if (m = r[c], m.name === n.name) {
        if (m.state === Hi) return Mf(l);
        m.state === Tf ? (m.state = Vi, m.timer.stop(), m.on.call("interrupt", e, e.__data__, m.index, m.group), delete r[c]) : +c < t && (m.state = Vi, m.timer.stop(), m.on.call("cancel", e, e.__data__, m.index, m.group), delete r[c]);
      }
    if (Mf(function() {
      n.state === Hi && (n.state = Tf, n.timer.restart(s, n.delay, n.time), s(a));
    }), n.state = Tu, n.on.call("start", e, e.__data__, n.index, n.group), n.state === Tu) {
      for (n.state = Hi, o = new Array(d = n.tween.length), c = 0, f = -1; c < d; ++c)
        (m = n.tween[c].value.call(e, e.__data__, n.index, n.group)) && (o[++f] = m);
      o.length = f + 1;
    }
  }
  function s(a) {
    for (var c = a < n.duration ? n.ease.call(null, a / n.duration) : (n.timer.restart(u), n.state = Pu, 1), f = -1, d = o.length; ++f < d; )
      o[f].call(e, c);
    n.state === Pu && (n.on.call("end", e, e.__data__, n.index, n.group), u());
  }
  function u() {
    n.state = Vi, n.timer.stop(), delete r[t];
    for (var a in r) return;
    delete e.__transition;
  }
}
function Bi(e, t) {
  var n = e.__transition, r, o, i = !0, l;
  if (n) {
    t = t == null ? null : t + "";
    for (l in n) {
      if ((r = n[l]).name !== t) {
        i = !1;
        continue;
      }
      o = r.state > Tu && r.state < Pu, r.state = Vi, r.timer.stop(), r.on.call(o ? "interrupt" : "cancel", e, e.__data__, r.index, r.group), delete n[l];
    }
    i && delete e.__transition;
  }
}
function jw(e) {
  return this.each(function() {
    Bi(this, e);
  });
}
function Ww(e, t) {
  var n, r;
  return function() {
    var o = Tt(this, e), i = o.tween;
    if (i !== n) {
      r = n = i;
      for (var l = 0, s = r.length; l < s; ++l)
        if (r[l].name === t) {
          r = r.slice(), r.splice(l, 1);
          break;
        }
    }
    o.tween = r;
  };
}
function Yw(e, t, n) {
  var r, o;
  if (typeof n != "function") throw new Error();
  return function() {
    var i = Tt(this, e), l = i.tween;
    if (l !== r) {
      o = (r = l).slice();
      for (var s = { name: t, value: n }, u = 0, a = o.length; u < a; ++u)
        if (o[u].name === t) {
          o[u] = s;
          break;
        }
      u === a && o.push(s);
    }
    i.tween = o;
  };
}
function Xw(e, t) {
  var n = this._id;
  if (e += "", arguments.length < 2) {
    for (var r = St(this.node(), n).tween, o = 0, i = r.length, l; o < i; ++o)
      if ((l = r[o]).name === e)
        return l.value;
    return null;
  }
  return this.each((t == null ? Ww : Yw)(n, e, t));
}
function Ha(e, t, n) {
  var r = e._id;
  return e.each(function() {
    var o = Tt(this, r);
    (o.value || (o.value = {}))[t] = n.apply(this, arguments);
  }), function(o) {
    return St(o, r).value[t];
  };
}
function Kh(e, t) {
  var n;
  return (typeof t == "number" ? Jt : t instanceof Vo ? Ef : (n = Vo(t)) ? (t = n, Ef) : Mw)(e, t);
}
function Qw(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function Kw(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function Gw(e, t, n) {
  var r, o = n + "", i;
  return function() {
    var l = this.getAttribute(e);
    return l === o ? null : l === r ? i : i = t(r = l, n);
  };
}
function Zw(e, t, n) {
  var r, o = n + "", i;
  return function() {
    var l = this.getAttributeNS(e.space, e.local);
    return l === o ? null : l === r ? i : i = t(r = l, n);
  };
}
function qw(e, t, n) {
  var r, o, i;
  return function() {
    var l, s = n(this), u;
    return s == null ? void this.removeAttribute(e) : (l = this.getAttribute(e), u = s + "", l === u ? null : l === r && u === o ? i : (o = u, i = t(r = l, s)));
  };
}
function Jw(e, t, n) {
  var r, o, i;
  return function() {
    var l, s = n(this), u;
    return s == null ? void this.removeAttributeNS(e.space, e.local) : (l = this.getAttributeNS(e.space, e.local), u = s + "", l === u ? null : l === r && u === o ? i : (o = u, i = t(r = l, s)));
  };
}
function bw(e, t) {
  var n = Fl(e), r = n === "transform" ? $w : Kh;
  return this.attrTween(e, typeof t == "function" ? (n.local ? Jw : qw)(n, r, Ha(this, "attr." + e, t)) : t == null ? (n.local ? Kw : Qw)(n) : (n.local ? Zw : Gw)(n, r, t));
}
function ex(e, t) {
  return function(n) {
    this.setAttribute(e, t.call(this, n));
  };
}
function tx(e, t) {
  return function(n) {
    this.setAttributeNS(e.space, e.local, t.call(this, n));
  };
}
function nx(e, t) {
  var n, r;
  function o() {
    var i = t.apply(this, arguments);
    return i !== r && (n = (r = i) && tx(e, i)), n;
  }
  return o._value = t, o;
}
function rx(e, t) {
  var n, r;
  function o() {
    var i = t.apply(this, arguments);
    return i !== r && (n = (r = i) && ex(e, i)), n;
  }
  return o._value = t, o;
}
function ox(e, t) {
  var n = "attr." + e;
  if (arguments.length < 2) return (n = this.tween(n)) && n._value;
  if (t == null) return this.tween(n, null);
  if (typeof t != "function") throw new Error();
  var r = Fl(e);
  return this.tween(n, (r.local ? nx : rx)(r, t));
}
function ix(e, t) {
  return function() {
    Fa(this, e).delay = +t.apply(this, arguments);
  };
}
function lx(e, t) {
  return t = +t, function() {
    Fa(this, e).delay = t;
  };
}
function sx(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? ix : lx)(t, e)) : St(this.node(), t).delay;
}
function ux(e, t) {
  return function() {
    Tt(this, e).duration = +t.apply(this, arguments);
  };
}
function ax(e, t) {
  return t = +t, function() {
    Tt(this, e).duration = t;
  };
}
function cx(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? ux : ax)(t, e)) : St(this.node(), t).duration;
}
function fx(e, t) {
  if (typeof t != "function") throw new Error();
  return function() {
    Tt(this, e).ease = t;
  };
}
function dx(e) {
  var t = this._id;
  return arguments.length ? this.each(fx(t, e)) : St(this.node(), t).ease;
}
function px(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    if (typeof n != "function") throw new Error();
    Tt(this, e).ease = n;
  };
}
function hx(e) {
  if (typeof e != "function") throw new Error();
  return this.each(px(this._id, e));
}
function mx(e) {
  typeof e != "function" && (e = Ch(e));
  for (var t = this._groups, n = t.length, r = new Array(n), o = 0; o < n; ++o)
    for (var i = t[o], l = i.length, s = r[o] = [], u, a = 0; a < l; ++a)
      (u = i[a]) && e.call(u, u.__data__, a, i) && s.push(u);
  return new Yt(r, this._parents, this._name, this._id);
}
function gx(e) {
  if (e._id !== this._id) throw new Error();
  for (var t = this._groups, n = e._groups, r = t.length, o = n.length, i = Math.min(r, o), l = new Array(r), s = 0; s < i; ++s)
    for (var u = t[s], a = n[s], c = u.length, f = l[s] = new Array(c), d, m = 0; m < c; ++m)
      (d = u[m] || a[m]) && (f[m] = d);
  for (; s < r; ++s)
    l[s] = t[s];
  return new Yt(l, this._parents, this._name, this._id);
}
function yx(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var n = t.indexOf(".");
    return n >= 0 && (t = t.slice(0, n)), !t || t === "start";
  });
}
function vx(e, t, n) {
  var r, o, i = yx(t) ? Fa : Tt;
  return function() {
    var l = i(this, e), s = l.on;
    s !== r && (o = (r = s).copy()).on(t, n), l.on = o;
  };
}
function wx(e, t) {
  var n = this._id;
  return arguments.length < 2 ? St(this.node(), n).on.on(e) : this.each(vx(n, e, t));
}
function xx(e) {
  return function() {
    var t = this.parentNode;
    for (var n in this.__transition) if (+n !== e) return;
    t && t.removeChild(this);
  };
}
function Sx() {
  return this.on("end.remove", xx(this._id));
}
function _x(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = Ia(e));
  for (var r = this._groups, o = r.length, i = new Array(o), l = 0; l < o; ++l)
    for (var s = r[l], u = s.length, a = i[l] = new Array(u), c, f, d = 0; d < u; ++d)
      (c = s[d]) && (f = e.call(c, c.__data__, d, s)) && ("__data__" in c && (f.__data__ = c.__data__), a[d] = f, Vl(a[d], t, n, d, a, St(c, n)));
  return new Yt(i, this._parents, t, n);
}
function Ex(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = Nh(e));
  for (var r = this._groups, o = r.length, i = [], l = [], s = 0; s < o; ++s)
    for (var u = r[s], a = u.length, c, f = 0; f < a; ++f)
      if (c = u[f]) {
        for (var d = e.call(c, c.__data__, f, u), m, x = St(c, n), w = 0, _ = d.length; w < _; ++w)
          (m = d[w]) && Vl(m, t, n, w, d, x);
        i.push(d), l.push(c);
      }
  return new Yt(i, l, t, n);
}
var kx = qo.prototype.constructor;
function Nx() {
  return new kx(this._groups, this._parents);
}
function Cx(e, t) {
  var n, r, o;
  return function() {
    var i = Ar(this, e), l = (this.style.removeProperty(e), Ar(this, e));
    return i === l ? null : i === n && l === r ? o : o = t(n = i, r = l);
  };
}
function Gh(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function Mx(e, t, n) {
  var r, o = n + "", i;
  return function() {
    var l = Ar(this, e);
    return l === o ? null : l === r ? i : i = t(r = l, n);
  };
}
function zx(e, t, n) {
  var r, o, i;
  return function() {
    var l = Ar(this, e), s = n(this), u = s + "";
    return s == null && (u = s = (this.style.removeProperty(e), Ar(this, e))), l === u ? null : l === r && u === o ? i : (o = u, i = t(r = l, s));
  };
}
function Tx(e, t) {
  var n, r, o, i = "style." + t, l = "end." + i, s;
  return function() {
    var u = Tt(this, e), a = u.on, c = u.value[i] == null ? s || (s = Gh(t)) : void 0;
    (a !== n || o !== c) && (r = (n = a).copy()).on(l, o = c), u.on = r;
  };
}
function Px(e, t, n) {
  var r = (e += "") == "transform" ? Pw : Kh;
  return t == null ? this.styleTween(e, Cx(e, r)).on("end.style." + e, Gh(e)) : typeof t == "function" ? this.styleTween(e, zx(e, r, Ha(this, "style." + e, t))).each(Tx(this._id, e)) : this.styleTween(e, Mx(e, r, t), n).on("end.style." + e, null);
}
function $x(e, t, n) {
  return function(r) {
    this.style.setProperty(e, t.call(this, r), n);
  };
}
function Rx(e, t, n) {
  var r, o;
  function i() {
    var l = t.apply(this, arguments);
    return l !== o && (r = (o = l) && $x(e, l, n)), r;
  }
  return i._value = t, i;
}
function Ax(e, t, n) {
  var r = "style." + (e += "");
  if (arguments.length < 2) return (r = this.tween(r)) && r._value;
  if (t == null) return this.tween(r, null);
  if (typeof t != "function") throw new Error();
  return this.tween(r, Rx(e, t, n ?? ""));
}
function Ix(e) {
  return function() {
    this.textContent = e;
  };
}
function Dx(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function Lx(e) {
  return this.tween("text", typeof e == "function" ? Dx(Ha(this, "text", e)) : Ix(e == null ? "" : e + ""));
}
function Ox(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function Fx(e) {
  var t, n;
  function r() {
    var o = e.apply(this, arguments);
    return o !== n && (t = (n = o) && Ox(o)), t;
  }
  return r._value = e, r;
}
function Hx(e) {
  var t = "text";
  if (arguments.length < 1) return (t = this.tween(t)) && t._value;
  if (e == null) return this.tween(t, null);
  if (typeof e != "function") throw new Error();
  return this.tween(t, Fx(e));
}
function Vx() {
  for (var e = this._name, t = this._id, n = Zh(), r = this._groups, o = r.length, i = 0; i < o; ++i)
    for (var l = r[i], s = l.length, u, a = 0; a < s; ++a)
      if (u = l[a]) {
        var c = St(u, t);
        Vl(u, e, n, a, l, {
          time: c.time + c.delay + c.duration,
          delay: 0,
          duration: c.duration,
          ease: c.ease
        });
      }
  return new Yt(r, this._parents, e, n);
}
function Bx() {
  var e, t, n = this, r = n._id, o = n.size();
  return new Promise(function(i, l) {
    var s = { value: l }, u = { value: function() {
      --o === 0 && i();
    } };
    n.each(function() {
      var a = Tt(this, r), c = a.on;
      c !== e && (t = (e = c).copy(), t._.cancel.push(s), t._.interrupt.push(s), t._.end.push(u)), a.on = t;
    }), o === 0 && i();
  });
}
var Ux = 0;
function Yt(e, t, n, r) {
  this._groups = e, this._parents = t, this._name = n, this._id = r;
}
function Zh() {
  return ++Ux;
}
var At = qo.prototype;
Yt.prototype = {
  constructor: Yt,
  select: _x,
  selectAll: Ex,
  selectChild: At.selectChild,
  selectChildren: At.selectChildren,
  filter: mx,
  merge: gx,
  selection: Nx,
  transition: Vx,
  call: At.call,
  nodes: At.nodes,
  node: At.node,
  size: At.size,
  empty: At.empty,
  each: At.each,
  on: wx,
  attr: bw,
  attrTween: ox,
  style: Px,
  styleTween: Ax,
  text: Lx,
  textTween: Hx,
  remove: Sx,
  tween: Xw,
  delay: sx,
  duration: cx,
  ease: dx,
  easeVarying: hx,
  end: Bx,
  [Symbol.iterator]: At[Symbol.iterator]
};
function jx(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var Wx = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: jx
};
function Yx(e, t) {
  for (var n; !(n = e.__transition) || !(n = n[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return n;
}
function Xx(e) {
  var t, n;
  e instanceof Yt ? (t = e._id, e = e._name) : (t = Zh(), (n = Wx).time = Oa(), e = e == null ? null : e + "");
  for (var r = this._groups, o = r.length, i = 0; i < o; ++i)
    for (var l = r[i], s = l.length, u, a = 0; a < s; ++a)
      (u = l[a]) && Vl(u, e, t, a, l, n || Yx(u, t));
  return new Yt(r, this._parents, e, t);
}
qo.prototype.interrupt = jw;
qo.prototype.transition = Xx;
const Si = (e) => () => e;
function Qx(e, {
  sourceEvent: t,
  target: n,
  transform: r,
  dispatch: o
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    target: { value: n, enumerable: !0, configurable: !0 },
    transform: { value: r, enumerable: !0, configurable: !0 },
    _: { value: o }
  });
}
function Ft(e, t, n) {
  this.k = e, this.x = t, this.y = n;
}
Ft.prototype = {
  constructor: Ft,
  scale: function(e) {
    return e === 1 ? this : new Ft(this.k * e, this.x, this.y);
  },
  translate: function(e, t) {
    return e === 0 & t === 0 ? this : new Ft(this.k, this.x + this.k * e, this.y + this.k * t);
  },
  apply: function(e) {
    return [e[0] * this.k + this.x, e[1] * this.k + this.y];
  },
  applyX: function(e) {
    return e * this.k + this.x;
  },
  applyY: function(e) {
    return e * this.k + this.y;
  },
  invert: function(e) {
    return [(e[0] - this.x) / this.k, (e[1] - this.y) / this.k];
  },
  invertX: function(e) {
    return (e - this.x) / this.k;
  },
  invertY: function(e) {
    return (e - this.y) / this.k;
  },
  rescaleX: function(e) {
    return e.copy().domain(e.range().map(this.invertX, this).map(e.invert, e));
  },
  rescaleY: function(e) {
    return e.copy().domain(e.range().map(this.invertY, this).map(e.invert, e));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var Vt = new Ft(1, 0, 0);
Ft.prototype;
function Es(e) {
  e.stopImmediatePropagation();
}
function br(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function Kx(e) {
  return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function Gx() {
  var e = this;
  return e instanceof SVGElement ? (e = e.ownerSVGElement || e, e.hasAttribute("viewBox") ? (e = e.viewBox.baseVal, [[e.x, e.y], [e.x + e.width, e.y + e.height]]) : [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]) : [[0, 0], [e.clientWidth, e.clientHeight]];
}
function Pf() {
  return this.__zoom || Vt;
}
function Zx(e) {
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * (e.ctrlKey ? 10 : 1);
}
function qx() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function Jx(e, t, n) {
  var r = e.invertX(t[0][0]) - n[0][0], o = e.invertX(t[1][0]) - n[1][0], i = e.invertY(t[0][1]) - n[0][1], l = e.invertY(t[1][1]) - n[1][1];
  return e.translate(
    o > r ? (r + o) / 2 : Math.min(0, r) || Math.max(0, o),
    l > i ? (i + l) / 2 : Math.min(0, i) || Math.max(0, l)
  );
}
function qh() {
  var e = Kx, t = Gx, n = Jx, r = Zx, o = qx, i = [0, 1 / 0], l = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], s = 250, u = Dw, a = Ol("start", "zoom", "end"), c, f, d, m = 500, x = 150, w = 0, _ = 10;
  function p(v) {
    v.property("__zoom", Pf).on("wheel.zoom", P, { passive: !1 }).on("mousedown.zoom", A).on("dblclick.zoom", I).filter(o).on("touchstart.zoom", F).on("touchmove.zoom", B).on("touchend.zoom touchcancel.zoom", V).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  p.transform = function(v, $, k, L) {
    var N = v.selection ? v.selection() : v;
    N.property("__zoom", Pf), v !== N ? E(v, $, k, L) : N.interrupt().each(function() {
      C(this, arguments).event(L).start().zoom(null, typeof $ == "function" ? $.apply(this, arguments) : $).end();
    });
  }, p.scaleBy = function(v, $, k, L) {
    p.scaleTo(v, function() {
      var N = this.__zoom.k, S = typeof $ == "function" ? $.apply(this, arguments) : $;
      return N * S;
    }, k, L);
  }, p.scaleTo = function(v, $, k, L) {
    p.transform(v, function() {
      var N = t.apply(this, arguments), S = this.__zoom, z = k == null ? y(N) : typeof k == "function" ? k.apply(this, arguments) : k, D = S.invert(z), O = typeof $ == "function" ? $.apply(this, arguments) : $;
      return n(g(h(S, O), z, D), N, l);
    }, k, L);
  }, p.translateBy = function(v, $, k, L) {
    p.transform(v, function() {
      return n(this.__zoom.translate(
        typeof $ == "function" ? $.apply(this, arguments) : $,
        typeof k == "function" ? k.apply(this, arguments) : k
      ), t.apply(this, arguments), l);
    }, null, L);
  }, p.translateTo = function(v, $, k, L, N) {
    p.transform(v, function() {
      var S = t.apply(this, arguments), z = this.__zoom, D = L == null ? y(S) : typeof L == "function" ? L.apply(this, arguments) : L;
      return n(Vt.translate(D[0], D[1]).scale(z.k).translate(
        typeof $ == "function" ? -$.apply(this, arguments) : -$,
        typeof k == "function" ? -k.apply(this, arguments) : -k
      ), S, l);
    }, L, N);
  };
  function h(v, $) {
    return $ = Math.max(i[0], Math.min(i[1], $)), $ === v.k ? v : new Ft($, v.x, v.y);
  }
  function g(v, $, k) {
    var L = $[0] - k[0] * v.k, N = $[1] - k[1] * v.k;
    return L === v.x && N === v.y ? v : new Ft(v.k, L, N);
  }
  function y(v) {
    return [(+v[0][0] + +v[1][0]) / 2, (+v[0][1] + +v[1][1]) / 2];
  }
  function E(v, $, k, L) {
    v.on("start.zoom", function() {
      C(this, arguments).event(L).start();
    }).on("interrupt.zoom end.zoom", function() {
      C(this, arguments).event(L).end();
    }).tween("zoom", function() {
      var N = this, S = arguments, z = C(N, S).event(L), D = t.apply(N, S), O = k == null ? y(D) : typeof k == "function" ? k.apply(N, S) : k, j = Math.max(D[1][0] - D[0][0], D[1][1] - D[0][1]), U = N.__zoom, Y = typeof $ == "function" ? $.apply(N, S) : $, K = u(U.invert(O).concat(j / U.k), Y.invert(O).concat(j / Y.k));
      return function(G) {
        if (G === 1) G = Y;
        else {
          var ne = K(G), te = j / ne[2];
          G = new Ft(te, O[0] - ne[0] * te, O[1] - ne[1] * te);
        }
        z.zoom(null, G);
      };
    });
  }
  function C(v, $, k) {
    return !k && v.__zooming || new M(v, $);
  }
  function M(v, $) {
    this.that = v, this.args = $, this.active = 0, this.sourceEvent = null, this.extent = t.apply(v, $), this.taps = 0;
  }
  M.prototype = {
    event: function(v) {
      return v && (this.sourceEvent = v), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(v, $) {
      return this.mouse && v !== "mouse" && (this.mouse[1] = $.invert(this.mouse[0])), this.touch0 && v !== "touch" && (this.touch0[1] = $.invert(this.touch0[0])), this.touch1 && v !== "touch" && (this.touch1[1] = $.invert(this.touch1[0])), this.that.__zoom = $, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(v) {
      var $ = ot(this.that).datum();
      a.call(
        v,
        this.that,
        new Qx(v, {
          sourceEvent: this.sourceEvent,
          target: p,
          transform: this.that.__zoom,
          dispatch: a
        }),
        $
      );
    }
  };
  function P(v, ...$) {
    if (!e.apply(this, arguments)) return;
    var k = C(this, $).event(v), L = this.__zoom, N = Math.max(i[0], Math.min(i[1], L.k * Math.pow(2, r.apply(this, arguments)))), S = ht(v);
    if (k.wheel)
      (k.mouse[0][0] !== S[0] || k.mouse[0][1] !== S[1]) && (k.mouse[1] = L.invert(k.mouse[0] = S)), clearTimeout(k.wheel);
    else {
      if (L.k === N) return;
      k.mouse = [S, L.invert(S)], Bi(this), k.start();
    }
    br(v), k.wheel = setTimeout(z, x), k.zoom("mouse", n(g(h(L, N), k.mouse[0], k.mouse[1]), k.extent, l));
    function z() {
      k.wheel = null, k.end();
    }
  }
  function A(v, ...$) {
    if (d || !e.apply(this, arguments)) return;
    var k = v.currentTarget, L = C(this, $, !0).event(v), N = ot(v.view).on("mousemove.zoom", O, !0).on("mouseup.zoom", j, !0), S = ht(v, k), z = v.clientX, D = v.clientY;
    Lh(v.view), Es(v), L.mouse = [S, this.__zoom.invert(S)], Bi(this), L.start();
    function O(U) {
      if (br(U), !L.moved) {
        var Y = U.clientX - z, K = U.clientY - D;
        L.moved = Y * Y + K * K > w;
      }
      L.event(U).zoom("mouse", n(g(L.that.__zoom, L.mouse[0] = ht(U, k), L.mouse[1]), L.extent, l));
    }
    function j(U) {
      N.on("mousemove.zoom mouseup.zoom", null), Oh(U.view, L.moved), br(U), L.event(U).end();
    }
  }
  function I(v, ...$) {
    if (e.apply(this, arguments)) {
      var k = this.__zoom, L = ht(v.changedTouches ? v.changedTouches[0] : v, this), N = k.invert(L), S = k.k * (v.shiftKey ? 0.5 : 2), z = n(g(h(k, S), L, N), t.apply(this, $), l);
      br(v), s > 0 ? ot(this).transition().duration(s).call(E, z, L, v) : ot(this).call(p.transform, z, L, v);
    }
  }
  function F(v, ...$) {
    if (e.apply(this, arguments)) {
      var k = v.touches, L = k.length, N = C(this, $, v.changedTouches.length === L).event(v), S, z, D, O;
      for (Es(v), z = 0; z < L; ++z)
        D = k[z], O = ht(D, this), O = [O, this.__zoom.invert(O), D.identifier], N.touch0 ? !N.touch1 && N.touch0[2] !== O[2] && (N.touch1 = O, N.taps = 0) : (N.touch0 = O, S = !0, N.taps = 1 + !!c);
      c && (c = clearTimeout(c)), S && (N.taps < 2 && (f = O[0], c = setTimeout(function() {
        c = null;
      }, m)), Bi(this), N.start());
    }
  }
  function B(v, ...$) {
    if (this.__zooming) {
      var k = C(this, $).event(v), L = v.changedTouches, N = L.length, S, z, D, O;
      for (br(v), S = 0; S < N; ++S)
        z = L[S], D = ht(z, this), k.touch0 && k.touch0[2] === z.identifier ? k.touch0[0] = D : k.touch1 && k.touch1[2] === z.identifier && (k.touch1[0] = D);
      if (z = k.that.__zoom, k.touch1) {
        var j = k.touch0[0], U = k.touch0[1], Y = k.touch1[0], K = k.touch1[1], G = (G = Y[0] - j[0]) * G + (G = Y[1] - j[1]) * G, ne = (ne = K[0] - U[0]) * ne + (ne = K[1] - U[1]) * ne;
        z = h(z, Math.sqrt(G / ne)), D = [(j[0] + Y[0]) / 2, (j[1] + Y[1]) / 2], O = [(U[0] + K[0]) / 2, (U[1] + K[1]) / 2];
      } else if (k.touch0) D = k.touch0[0], O = k.touch0[1];
      else return;
      k.zoom("touch", n(g(z, D, O), k.extent, l));
    }
  }
  function V(v, ...$) {
    if (this.__zooming) {
      var k = C(this, $).event(v), L = v.changedTouches, N = L.length, S, z;
      for (Es(v), d && clearTimeout(d), d = setTimeout(function() {
        d = null;
      }, m), S = 0; S < N; ++S)
        z = L[S], k.touch0 && k.touch0[2] === z.identifier ? delete k.touch0 : k.touch1 && k.touch1[2] === z.identifier && delete k.touch1;
      if (k.touch1 && !k.touch0 && (k.touch0 = k.touch1, delete k.touch1), k.touch0) k.touch0[1] = this.__zoom.invert(k.touch0[0]);
      else if (k.end(), k.taps === 2 && (z = ht(z, this), Math.hypot(f[0] - z[0], f[1] - z[1]) < _)) {
        var D = ot(this).on("dblclick.zoom");
        D && D.apply(this, arguments);
      }
    }
  }
  return p.wheelDelta = function(v) {
    return arguments.length ? (r = typeof v == "function" ? v : Si(+v), p) : r;
  }, p.filter = function(v) {
    return arguments.length ? (e = typeof v == "function" ? v : Si(!!v), p) : e;
  }, p.touchable = function(v) {
    return arguments.length ? (o = typeof v == "function" ? v : Si(!!v), p) : o;
  }, p.extent = function(v) {
    return arguments.length ? (t = typeof v == "function" ? v : Si([[+v[0][0], +v[0][1]], [+v[1][0], +v[1][1]]]), p) : t;
  }, p.scaleExtent = function(v) {
    return arguments.length ? (i[0] = +v[0], i[1] = +v[1], p) : [i[0], i[1]];
  }, p.translateExtent = function(v) {
    return arguments.length ? (l[0][0] = +v[0][0], l[1][0] = +v[1][0], l[0][1] = +v[0][1], l[1][1] = +v[1][1], p) : [[l[0][0], l[0][1]], [l[1][0], l[1][1]]];
  }, p.constrain = function(v) {
    return arguments.length ? (n = v, p) : n;
  }, p.duration = function(v) {
    return arguments.length ? (s = +v, p) : s;
  }, p.interpolate = function(v) {
    return arguments.length ? (u = v, p) : u;
  }, p.on = function() {
    var v = a.on.apply(a, arguments);
    return v === a ? p : v;
  }, p.clickDistance = function(v) {
    return arguments.length ? (w = (v = +v) * v, p) : Math.sqrt(w);
  }, p.tapDistance = function(v) {
    return arguments.length ? (_ = +v, p) : _;
  }, p;
}
const Bl = T.createContext(null), bx = Bl.Provider, Xt = {
  error001: () => "[React Flow]: Seems like you have not used zustand provider as an ancestor. Help: https://reactflow.dev/error#001",
  error002: () => "It looks like you've created a new nodeTypes or edgeTypes object. If this wasn't on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them.",
  error003: (e) => `Node type "${e}" not found. Using fallback type "default".`,
  error004: () => "The React Flow parent container needs a width and a height to render the graph.",
  error005: () => "Only child nodes can use a parent extent.",
  error006: () => "Can't create edge. An edge needs a source and a target.",
  error007: (e) => `The old edge with id=${e} does not exist.`,
  error009: (e) => `Marker type "${e}" doesn't exist.`,
  error008: (e, t) => `Couldn't create edge for ${e ? "target" : "source"} handle id: "${e ? t.targetHandle : t.sourceHandle}", edge id: ${t.id}.`,
  error010: () => "Handle: No node id found. Make sure to only use a Handle inside a custom Node.",
  error011: (e) => `Edge type "${e}" not found. Using fallback type "default".`,
  error012: (e) => `Node with id "${e}" does not exist, it may have been removed. This can happen when a node is deleted before the "onNodeClick" handler is called.`
}, Jh = Xt.error001();
function le(e, t) {
  const n = T.useContext(Bl);
  if (n === null)
    throw new Error(Jh);
  return Eh(n, e, t);
}
const Se = () => {
  const e = T.useContext(Bl);
  if (e === null)
    throw new Error(Jh);
  return T.useMemo(() => ({
    getState: e.getState,
    setState: e.setState,
    subscribe: e.subscribe,
    destroy: e.destroy
  }), [e]);
}, eS = (e) => e.userSelectionActive ? "none" : "all";
function Va({ position: e, children: t, className: n, style: r, ...o }) {
  const i = le(eS), l = `${e}`.split("-");
  return R.createElement("div", { className: Te(["react-flow__panel", n, ...l]), style: { ...r, pointerEvents: i }, ...o }, t);
}
function tS({ proOptions: e, position: t = "bottom-right" }) {
  return e != null && e.hideAttribution ? null : R.createElement(
    Va,
    { position: t, className: "react-flow__attribution", "data-message": "Please only hide this attribution when you are subscribed to React Flow Pro: https://reactflow.dev/pro" },
    R.createElement("a", { href: "https://reactflow.dev", target: "_blank", rel: "noopener noreferrer", "aria-label": "React Flow attribution" }, "React Flow")
  );
}
const nS = ({ x: e, y: t, label: n, labelStyle: r = {}, labelShowBg: o = !0, labelBgStyle: i = {}, labelBgPadding: l = [2, 4], labelBgBorderRadius: s = 2, children: u, className: a, ...c }) => {
  const f = T.useRef(null), [d, m] = T.useState({ x: 0, y: 0, width: 0, height: 0 }), x = Te(["react-flow__edge-textwrapper", a]);
  return T.useEffect(() => {
    if (f.current) {
      const w = f.current.getBBox();
      m({
        x: w.x,
        y: w.y,
        width: w.width,
        height: w.height
      });
    }
  }, [n]), typeof n > "u" || !n ? null : R.createElement(
    "g",
    { transform: `translate(${e - d.width / 2} ${t - d.height / 2})`, className: x, visibility: d.width ? "visible" : "hidden", ...c },
    o && R.createElement("rect", { width: d.width + 2 * l[0], x: -l[0], y: -l[1], height: d.height + 2 * l[1], className: "react-flow__edge-textbg", style: i, rx: s, ry: s }),
    R.createElement("text", { className: "react-flow__edge-text", y: d.height / 2, dy: "0.3em", ref: f, style: r }, n),
    u
  );
};
var rS = T.memo(nS);
const Ba = (e) => ({
  width: e.offsetWidth,
  height: e.offsetHeight
}), Dr = (e, t = 0, n = 1) => Math.min(Math.max(e, t), n), Ua = (e = { x: 0, y: 0 }, t) => ({
  x: Dr(e.x, t[0][0], t[1][0]),
  y: Dr(e.y, t[0][1], t[1][1])
}), $f = (e, t, n) => e < t ? Dr(Math.abs(e - t), 1, 50) / 50 : e > n ? -Dr(Math.abs(e - n), 1, 50) / 50 : 0, bh = (e, t) => {
  const n = $f(e.x, 35, t.width - 35) * 20, r = $f(e.y, 35, t.height - 35) * 20;
  return [n, r];
}, em = (e) => {
  var t;
  return ((t = e.getRootNode) == null ? void 0 : t.call(e)) || (window == null ? void 0 : window.document);
}, tm = (e, t) => ({
  x: Math.min(e.x, t.x),
  y: Math.min(e.y, t.y),
  x2: Math.max(e.x2, t.x2),
  y2: Math.max(e.y2, t.y2)
}), Uo = ({ x: e, y: t, width: n, height: r }) => ({
  x: e,
  y: t,
  x2: e + n,
  y2: t + r
}), nm = ({ x: e, y: t, x2: n, y2: r }) => ({
  x: e,
  y: t,
  width: n - e,
  height: r - t
}), Rf = (e) => ({
  ...e.positionAbsolute || { x: 0, y: 0 },
  width: e.width || 0,
  height: e.height || 0
}), oS = (e, t) => nm(tm(Uo(e), Uo(t))), $u = (e, t) => {
  const n = Math.max(0, Math.min(e.x + e.width, t.x + t.width) - Math.max(e.x, t.x)), r = Math.max(0, Math.min(e.y + e.height, t.y + t.height) - Math.max(e.y, t.y));
  return Math.ceil(n * r);
}, iS = (e) => lt(e.width) && lt(e.height) && lt(e.x) && lt(e.y), lt = (e) => !isNaN(e) && isFinite(e), he = Symbol.for("internals"), rm = ["Enter", " ", "Escape"], lS = (e, t) => {
}, sS = (e) => "nativeEvent" in e;
function Ru(e) {
  var o, i;
  const t = sS(e) ? e.nativeEvent : e, n = ((i = (o = t.composedPath) == null ? void 0 : o.call(t)) == null ? void 0 : i[0]) || e.target;
  return ["INPUT", "SELECT", "TEXTAREA"].includes(n == null ? void 0 : n.nodeName) || (n == null ? void 0 : n.hasAttribute("contenteditable")) || !!(n != null && n.closest(".nokey"));
}
const om = (e) => "clientX" in e, hn = (e, t) => {
  var i, l;
  const n = om(e), r = n ? e.clientX : (i = e.touches) == null ? void 0 : i[0].clientX, o = n ? e.clientY : (l = e.touches) == null ? void 0 : l[0].clientY;
  return {
    x: r - ((t == null ? void 0 : t.left) ?? 0),
    y: o - ((t == null ? void 0 : t.top) ?? 0)
  };
}, vl = () => {
  var e;
  return typeof navigator < "u" && ((e = navigator == null ? void 0 : navigator.userAgent) == null ? void 0 : e.indexOf("Mac")) >= 0;
}, bo = ({ id: e, path: t, labelX: n, labelY: r, label: o, labelStyle: i, labelShowBg: l, labelBgStyle: s, labelBgPadding: u, labelBgBorderRadius: a, style: c, markerEnd: f, markerStart: d, interactionWidth: m = 20 }) => R.createElement(
  R.Fragment,
  null,
  R.createElement("path", { id: e, style: c, d: t, fill: "none", className: "react-flow__edge-path", markerEnd: f, markerStart: d }),
  m && R.createElement("path", { d: t, fill: "none", strokeOpacity: 0, strokeWidth: m, className: "react-flow__edge-interaction" }),
  o && lt(n) && lt(r) ? R.createElement(rS, { x: n, y: r, label: o, labelStyle: i, labelShowBg: l, labelBgStyle: s, labelBgPadding: u, labelBgBorderRadius: a }) : null
);
bo.displayName = "BaseEdge";
function eo(e, t, n) {
  return n === void 0 ? n : (r) => {
    const o = t().edges.find((i) => i.id === e);
    o && n(r, { ...o });
  };
}
function im({ sourceX: e, sourceY: t, targetX: n, targetY: r }) {
  const o = Math.abs(n - e) / 2, i = n < e ? n + o : n - o, l = Math.abs(r - t) / 2, s = r < t ? r + l : r - l;
  return [i, s, o, l];
}
function lm({ sourceX: e, sourceY: t, targetX: n, targetY: r, sourceControlX: o, sourceControlY: i, targetControlX: l, targetControlY: s }) {
  const u = e * 0.125 + o * 0.375 + l * 0.375 + n * 0.125, a = t * 0.125 + i * 0.375 + s * 0.375 + r * 0.125, c = Math.abs(u - e), f = Math.abs(a - t);
  return [u, a, c, f];
}
var Wn;
(function(e) {
  e.Strict = "strict", e.Loose = "loose";
})(Wn || (Wn = {}));
var An;
(function(e) {
  e.Free = "free", e.Vertical = "vertical", e.Horizontal = "horizontal";
})(An || (An = {}));
var jo;
(function(e) {
  e.Partial = "partial", e.Full = "full";
})(jo || (jo = {}));
var nn;
(function(e) {
  e.Bezier = "default", e.Straight = "straight", e.Step = "step", e.SmoothStep = "smoothstep", e.SimpleBezier = "simplebezier";
})(nn || (nn = {}));
var Wo;
(function(e) {
  e.Arrow = "arrow", e.ArrowClosed = "arrowclosed";
})(Wo || (Wo = {}));
var X;
(function(e) {
  e.Left = "left", e.Top = "top", e.Right = "right", e.Bottom = "bottom";
})(X || (X = {}));
function Af({ pos: e, x1: t, y1: n, x2: r, y2: o }) {
  return e === X.Left || e === X.Right ? [0.5 * (t + r), n] : [t, 0.5 * (n + o)];
}
function sm({ sourceX: e, sourceY: t, sourcePosition: n = X.Bottom, targetX: r, targetY: o, targetPosition: i = X.Top }) {
  const [l, s] = Af({
    pos: n,
    x1: e,
    y1: t,
    x2: r,
    y2: o
  }), [u, a] = Af({
    pos: i,
    x1: r,
    y1: o,
    x2: e,
    y2: t
  }), [c, f, d, m] = lm({
    sourceX: e,
    sourceY: t,
    targetX: r,
    targetY: o,
    sourceControlX: l,
    sourceControlY: s,
    targetControlX: u,
    targetControlY: a
  });
  return [
    `M${e},${t} C${l},${s} ${u},${a} ${r},${o}`,
    c,
    f,
    d,
    m
  ];
}
const ja = T.memo(({ sourceX: e, sourceY: t, targetX: n, targetY: r, sourcePosition: o = X.Bottom, targetPosition: i = X.Top, label: l, labelStyle: s, labelShowBg: u, labelBgStyle: a, labelBgPadding: c, labelBgBorderRadius: f, style: d, markerEnd: m, markerStart: x, interactionWidth: w }) => {
  const [_, p, h] = sm({
    sourceX: e,
    sourceY: t,
    sourcePosition: o,
    targetX: n,
    targetY: r,
    targetPosition: i
  });
  return R.createElement(bo, { path: _, labelX: p, labelY: h, label: l, labelStyle: s, labelShowBg: u, labelBgStyle: a, labelBgPadding: c, labelBgBorderRadius: f, style: d, markerEnd: m, markerStart: x, interactionWidth: w });
});
ja.displayName = "SimpleBezierEdge";
const If = {
  [X.Left]: { x: -1, y: 0 },
  [X.Right]: { x: 1, y: 0 },
  [X.Top]: { x: 0, y: -1 },
  [X.Bottom]: { x: 0, y: 1 }
}, uS = ({ source: e, sourcePosition: t = X.Bottom, target: n }) => t === X.Left || t === X.Right ? e.x < n.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : e.y < n.y ? { x: 0, y: 1 } : { x: 0, y: -1 }, Df = (e, t) => Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2));
function aS({ source: e, sourcePosition: t = X.Bottom, target: n, targetPosition: r = X.Top, center: o, offset: i }) {
  const l = If[t], s = If[r], u = { x: e.x + l.x * i, y: e.y + l.y * i }, a = { x: n.x + s.x * i, y: n.y + s.y * i }, c = uS({
    source: u,
    sourcePosition: t,
    target: a
  }), f = c.x !== 0 ? "x" : "y", d = c[f];
  let m = [], x, w;
  const _ = { x: 0, y: 0 }, p = { x: 0, y: 0 }, [h, g, y, E] = im({
    sourceX: e.x,
    sourceY: e.y,
    targetX: n.x,
    targetY: n.y
  });
  if (l[f] * s[f] === -1) {
    x = o.x ?? h, w = o.y ?? g;
    const M = [
      { x, y: u.y },
      { x, y: a.y }
    ], P = [
      { x: u.x, y: w },
      { x: a.x, y: w }
    ];
    l[f] === d ? m = f === "x" ? M : P : m = f === "x" ? P : M;
  } else {
    const M = [{ x: u.x, y: a.y }], P = [{ x: a.x, y: u.y }];
    if (f === "x" ? m = l.x === d ? P : M : m = l.y === d ? M : P, t === r) {
      const V = Math.abs(e[f] - n[f]);
      if (V <= i) {
        const v = Math.min(i - 1, i - V);
        l[f] === d ? _[f] = (u[f] > e[f] ? -1 : 1) * v : p[f] = (a[f] > n[f] ? -1 : 1) * v;
      }
    }
    if (t !== r) {
      const V = f === "x" ? "y" : "x", v = l[f] === s[V], $ = u[V] > a[V], k = u[V] < a[V];
      (l[f] === 1 && (!v && $ || v && k) || l[f] !== 1 && (!v && k || v && $)) && (m = f === "x" ? M : P);
    }
    const A = { x: u.x + _.x, y: u.y + _.y }, I = { x: a.x + p.x, y: a.y + p.y }, F = Math.max(Math.abs(A.x - m[0].x), Math.abs(I.x - m[0].x)), B = Math.max(Math.abs(A.y - m[0].y), Math.abs(I.y - m[0].y));
    F >= B ? (x = (A.x + I.x) / 2, w = m[0].y) : (x = m[0].x, w = (A.y + I.y) / 2);
  }
  return [[
    e,
    { x: u.x + _.x, y: u.y + _.y },
    ...m,
    { x: a.x + p.x, y: a.y + p.y },
    n
  ], x, w, y, E];
}
function cS(e, t, n, r) {
  const o = Math.min(Df(e, t) / 2, Df(t, n) / 2, r), { x: i, y: l } = t;
  if (e.x === i && i === n.x || e.y === l && l === n.y)
    return `L${i} ${l}`;
  if (e.y === l) {
    const a = e.x < n.x ? -1 : 1, c = e.y < n.y ? 1 : -1;
    return `L ${i + o * a},${l}Q ${i},${l} ${i},${l + o * c}`;
  }
  const s = e.x < n.x ? 1 : -1, u = e.y < n.y ? -1 : 1;
  return `L ${i},${l + o * u}Q ${i},${l} ${i + o * s},${l}`;
}
function Au({ sourceX: e, sourceY: t, sourcePosition: n = X.Bottom, targetX: r, targetY: o, targetPosition: i = X.Top, borderRadius: l = 5, centerX: s, centerY: u, offset: a = 20 }) {
  const [c, f, d, m, x] = aS({
    source: { x: e, y: t },
    sourcePosition: n,
    target: { x: r, y: o },
    targetPosition: i,
    center: { x: s, y: u },
    offset: a
  });
  return [c.reduce((_, p, h) => {
    let g = "";
    return h > 0 && h < c.length - 1 ? g = cS(c[h - 1], p, c[h + 1], l) : g = `${h === 0 ? "M" : "L"}${p.x} ${p.y}`, _ += g, _;
  }, ""), f, d, m, x];
}
const Ul = T.memo(({ sourceX: e, sourceY: t, targetX: n, targetY: r, label: o, labelStyle: i, labelShowBg: l, labelBgStyle: s, labelBgPadding: u, labelBgBorderRadius: a, style: c, sourcePosition: f = X.Bottom, targetPosition: d = X.Top, markerEnd: m, markerStart: x, pathOptions: w, interactionWidth: _ }) => {
  const [p, h, g] = Au({
    sourceX: e,
    sourceY: t,
    sourcePosition: f,
    targetX: n,
    targetY: r,
    targetPosition: d,
    borderRadius: w == null ? void 0 : w.borderRadius,
    offset: w == null ? void 0 : w.offset
  });
  return R.createElement(bo, { path: p, labelX: h, labelY: g, label: o, labelStyle: i, labelShowBg: l, labelBgStyle: s, labelBgPadding: u, labelBgBorderRadius: a, style: c, markerEnd: m, markerStart: x, interactionWidth: _ });
});
Ul.displayName = "SmoothStepEdge";
const Wa = T.memo((e) => {
  var t;
  return R.createElement(Ul, { ...e, pathOptions: T.useMemo(() => {
    var n;
    return { borderRadius: 0, offset: (n = e.pathOptions) == null ? void 0 : n.offset };
  }, [(t = e.pathOptions) == null ? void 0 : t.offset]) });
});
Wa.displayName = "StepEdge";
function fS({ sourceX: e, sourceY: t, targetX: n, targetY: r }) {
  const [o, i, l, s] = im({
    sourceX: e,
    sourceY: t,
    targetX: n,
    targetY: r
  });
  return [`M ${e},${t}L ${n},${r}`, o, i, l, s];
}
const Ya = T.memo(({ sourceX: e, sourceY: t, targetX: n, targetY: r, label: o, labelStyle: i, labelShowBg: l, labelBgStyle: s, labelBgPadding: u, labelBgBorderRadius: a, style: c, markerEnd: f, markerStart: d, interactionWidth: m }) => {
  const [x, w, _] = fS({ sourceX: e, sourceY: t, targetX: n, targetY: r });
  return R.createElement(bo, { path: x, labelX: w, labelY: _, label: o, labelStyle: i, labelShowBg: l, labelBgStyle: s, labelBgPadding: u, labelBgBorderRadius: a, style: c, markerEnd: f, markerStart: d, interactionWidth: m });
});
Ya.displayName = "StraightEdge";
function _i(e, t) {
  return e >= 0 ? 0.5 * e : t * 25 * Math.sqrt(-e);
}
function Lf({ pos: e, x1: t, y1: n, x2: r, y2: o, c: i }) {
  switch (e) {
    case X.Left:
      return [t - _i(t - r, i), n];
    case X.Right:
      return [t + _i(r - t, i), n];
    case X.Top:
      return [t, n - _i(n - o, i)];
    case X.Bottom:
      return [t, n + _i(o - n, i)];
  }
}
function um({ sourceX: e, sourceY: t, sourcePosition: n = X.Bottom, targetX: r, targetY: o, targetPosition: i = X.Top, curvature: l = 0.25 }) {
  const [s, u] = Lf({
    pos: n,
    x1: e,
    y1: t,
    x2: r,
    y2: o,
    c: l
  }), [a, c] = Lf({
    pos: i,
    x1: r,
    y1: o,
    x2: e,
    y2: t,
    c: l
  }), [f, d, m, x] = lm({
    sourceX: e,
    sourceY: t,
    targetX: r,
    targetY: o,
    sourceControlX: s,
    sourceControlY: u,
    targetControlX: a,
    targetControlY: c
  });
  return [
    `M${e},${t} C${s},${u} ${a},${c} ${r},${o}`,
    f,
    d,
    m,
    x
  ];
}
const wl = T.memo(({ sourceX: e, sourceY: t, targetX: n, targetY: r, sourcePosition: o = X.Bottom, targetPosition: i = X.Top, label: l, labelStyle: s, labelShowBg: u, labelBgStyle: a, labelBgPadding: c, labelBgBorderRadius: f, style: d, markerEnd: m, markerStart: x, pathOptions: w, interactionWidth: _ }) => {
  const [p, h, g] = um({
    sourceX: e,
    sourceY: t,
    sourcePosition: o,
    targetX: n,
    targetY: r,
    targetPosition: i,
    curvature: w == null ? void 0 : w.curvature
  });
  return R.createElement(bo, { path: p, labelX: h, labelY: g, label: l, labelStyle: s, labelShowBg: u, labelBgStyle: a, labelBgPadding: c, labelBgBorderRadius: f, style: d, markerEnd: m, markerStart: x, interactionWidth: _ });
});
wl.displayName = "BezierEdge";
const Xa = T.createContext(null), dS = Xa.Provider;
Xa.Consumer;
const pS = () => T.useContext(Xa), hS = (e) => "id" in e && "source" in e && "target" in e, mS = ({ source: e, sourceHandle: t, target: n, targetHandle: r }) => `reactflow__edge-${e}${t || ""}-${n}${r || ""}`, Iu = (e, t) => typeof e > "u" ? "" : typeof e == "string" ? e : `${t ? `${t}__` : ""}${Object.keys(e).sort().map((r) => `${r}=${e[r]}`).join("&")}`, gS = (e, t) => t.some((n) => n.source === e.source && n.target === e.target && (n.sourceHandle === e.sourceHandle || !n.sourceHandle && !e.sourceHandle) && (n.targetHandle === e.targetHandle || !n.targetHandle && !e.targetHandle)), yS = (e, t) => {
  if (!e.source || !e.target)
    return t;
  let n;
  return hS(e) ? n = { ...e } : n = {
    ...e,
    id: mS(e)
  }, gS(n, t) ? t : t.concat(n);
}, Du = ({ x: e, y: t }, [n, r, o], i, [l, s]) => {
  const u = {
    x: (e - n) / o,
    y: (t - r) / o
  };
  return i ? {
    x: l * Math.round(u.x / l),
    y: s * Math.round(u.y / s)
  } : u;
}, am = ({ x: e, y: t }, [n, r, o]) => ({
  x: e * o + n,
  y: t * o + r
}), On = (e, t = [0, 0]) => {
  if (!e)
    return {
      x: 0,
      y: 0,
      positionAbsolute: {
        x: 0,
        y: 0
      }
    };
  const n = (e.width ?? 0) * t[0], r = (e.height ?? 0) * t[1], o = {
    x: e.position.x - n,
    y: e.position.y - r
  };
  return {
    ...o,
    positionAbsolute: e.positionAbsolute ? {
      x: e.positionAbsolute.x - n,
      y: e.positionAbsolute.y - r
    } : o
  };
}, jl = (e, t = [0, 0]) => {
  if (e.length === 0)
    return { x: 0, y: 0, width: 0, height: 0 };
  const n = e.reduce((r, o) => {
    const { x: i, y: l } = On(o, t).positionAbsolute;
    return tm(r, Uo({
      x: i,
      y: l,
      width: o.width || 0,
      height: o.height || 0
    }));
  }, { x: 1 / 0, y: 1 / 0, x2: -1 / 0, y2: -1 / 0 });
  return nm(n);
}, cm = (e, t, [n, r, o] = [0, 0, 1], i = !1, l = !1, s = [0, 0]) => {
  const u = {
    x: (t.x - n) / o,
    y: (t.y - r) / o,
    width: t.width / o,
    height: t.height / o
  }, a = [];
  return e.forEach((c) => {
    const { width: f, height: d, selectable: m = !0, hidden: x = !1 } = c;
    if (l && !m || x)
      return !1;
    const { positionAbsolute: w } = On(c, s), _ = {
      x: w.x,
      y: w.y,
      width: f || 0,
      height: d || 0
    }, p = $u(u, _), h = typeof f > "u" || typeof d > "u" || f === null || d === null, g = i && p > 0, y = (f || 0) * (d || 0);
    (h || g || p >= y || c.dragging) && a.push(c);
  }), a;
}, fm = (e, t) => {
  const n = e.map((r) => r.id);
  return t.filter((r) => n.includes(r.source) || n.includes(r.target));
}, dm = (e, t, n, r, o, i = 0.1) => {
  const l = t / (e.width * (1 + i)), s = n / (e.height * (1 + i)), u = Math.min(l, s), a = Dr(u, r, o), c = e.x + e.width / 2, f = e.y + e.height / 2, d = t / 2 - c * a, m = n / 2 - f * a;
  return { x: d, y: m, zoom: a };
}, zn = (e, t = 0) => e.transition().duration(t);
function Of(e, t, n, r) {
  return (t[n] || []).reduce((o, i) => {
    var l, s;
    return `${e.id}-${i.id}-${n}` !== r && o.push({
      id: i.id || null,
      type: n,
      nodeId: e.id,
      x: (((l = e.positionAbsolute) == null ? void 0 : l.x) ?? 0) + i.x + i.width / 2,
      y: (((s = e.positionAbsolute) == null ? void 0 : s.y) ?? 0) + i.y + i.height / 2
    }), o;
  }, []);
}
function vS(e, t, n, r, o, i) {
  const { x: l, y: s } = hn(e), a = t.elementsFromPoint(l, s).find((x) => x.classList.contains("react-flow__handle"));
  if (a) {
    const x = a.getAttribute("data-nodeid");
    if (x) {
      const w = Qa(void 0, a), _ = a.getAttribute("data-handleid"), p = i({ nodeId: x, id: _, type: w });
      if (p) {
        const h = o.find((g) => g.nodeId === x && g.type === w && g.id === _);
        return {
          handle: {
            id: _,
            type: w,
            nodeId: x,
            x: (h == null ? void 0 : h.x) || n.x,
            y: (h == null ? void 0 : h.y) || n.y
          },
          validHandleResult: p
        };
      }
    }
  }
  let c = [], f = 1 / 0;
  if (o.forEach((x) => {
    const w = Math.sqrt((x.x - n.x) ** 2 + (x.y - n.y) ** 2);
    if (w <= r) {
      const _ = i(x);
      w <= f && (w < f ? c = [{ handle: x, validHandleResult: _ }] : w === f && c.push({
        handle: x,
        validHandleResult: _
      }), f = w);
    }
  }), !c.length)
    return { handle: null, validHandleResult: pm() };
  if (c.length === 1)
    return c[0];
  const d = c.some(({ validHandleResult: x }) => x.isValid), m = c.some(({ handle: x }) => x.type === "target");
  return c.find(({ handle: x, validHandleResult: w }) => m ? x.type === "target" : d ? w.isValid : !0) || c[0];
}
const wS = { source: null, target: null, sourceHandle: null, targetHandle: null }, pm = () => ({
  handleDomNode: null,
  isValid: !1,
  connection: wS,
  endHandle: null
});
function hm(e, t, n, r, o, i, l) {
  const s = o === "target", u = l.querySelector(`.react-flow__handle[data-id="${e == null ? void 0 : e.nodeId}-${e == null ? void 0 : e.id}-${e == null ? void 0 : e.type}"]`), a = {
    ...pm(),
    handleDomNode: u
  };
  if (u) {
    const c = Qa(void 0, u), f = u.getAttribute("data-nodeid"), d = u.getAttribute("data-handleid"), m = u.classList.contains("connectable"), x = u.classList.contains("connectableend"), w = {
      source: s ? f : n,
      sourceHandle: s ? d : r,
      target: s ? n : f,
      targetHandle: s ? r : d
    };
    a.connection = w, m && x && (t === Wn.Strict ? s && c === "source" || !s && c === "target" : f !== n || d !== r) && (a.endHandle = {
      nodeId: f,
      handleId: d,
      type: c
    }, a.isValid = i(w));
  }
  return a;
}
function xS({ nodes: e, nodeId: t, handleId: n, handleType: r }) {
  return e.reduce((o, i) => {
    if (i[he]) {
      const { handleBounds: l } = i[he];
      let s = [], u = [];
      l && (s = Of(i, l, "source", `${t}-${n}-${r}`), u = Of(i, l, "target", `${t}-${n}-${r}`)), o.push(...s, ...u);
    }
    return o;
  }, []);
}
function Qa(e, t) {
  return e || (t != null && t.classList.contains("target") ? "target" : t != null && t.classList.contains("source") ? "source" : null);
}
function ks(e) {
  e == null || e.classList.remove("valid", "connecting", "react-flow__handle-valid", "react-flow__handle-connecting");
}
function SS(e, t) {
  let n = null;
  return t ? n = "valid" : e && !t && (n = "invalid"), n;
}
function mm({ event: e, handleId: t, nodeId: n, onConnect: r, isTarget: o, getState: i, setState: l, isValidConnection: s, edgeUpdaterType: u, onReconnectEnd: a }) {
  const c = em(e.target), { connectionMode: f, domNode: d, autoPanOnConnect: m, connectionRadius: x, onConnectStart: w, panBy: _, getNodes: p, cancelConnection: h } = i();
  let g = 0, y;
  const { x: E, y: C } = hn(e), M = c == null ? void 0 : c.elementFromPoint(E, C), P = Qa(u, M), A = d == null ? void 0 : d.getBoundingClientRect();
  if (!A || !P)
    return;
  let I, F = hn(e, A), B = !1, V = null, v = !1, $ = null;
  const k = xS({
    nodes: p(),
    nodeId: n,
    handleId: t,
    handleType: P
  }), L = () => {
    if (!m)
      return;
    const [z, D] = bh(F, A);
    _({ x: z, y: D }), g = requestAnimationFrame(L);
  };
  l({
    connectionPosition: F,
    connectionStatus: null,
    // connectionNodeId etc will be removed in the next major in favor of connectionStartHandle
    connectionNodeId: n,
    connectionHandleId: t,
    connectionHandleType: P,
    connectionStartHandle: {
      nodeId: n,
      handleId: t,
      type: P
    },
    connectionEndHandle: null
  }), w == null || w(e, { nodeId: n, handleId: t, handleType: P });
  function N(z) {
    const { transform: D } = i();
    F = hn(z, A);
    const { handle: O, validHandleResult: j } = vS(z, c, Du(F, D, !1, [1, 1]), x, k, (U) => hm(U, f, n, t, o ? "target" : "source", s, c));
    if (y = O, B || (L(), B = !0), $ = j.handleDomNode, V = j.connection, v = j.isValid, l({
      connectionPosition: y && v ? am({
        x: y.x,
        y: y.y
      }, D) : F,
      connectionStatus: SS(!!y, v),
      connectionEndHandle: j.endHandle
    }), !y && !v && !$)
      return ks(I);
    V.source !== V.target && $ && (ks(I), I = $, $.classList.add("connecting", "react-flow__handle-connecting"), $.classList.toggle("valid", v), $.classList.toggle("react-flow__handle-valid", v));
  }
  function S(z) {
    var D, O;
    (y || $) && V && v && (r == null || r(V)), (O = (D = i()).onConnectEnd) == null || O.call(D, z), u && (a == null || a(z)), ks(I), h(), cancelAnimationFrame(g), B = !1, v = !1, V = null, $ = null, c.removeEventListener("mousemove", N), c.removeEventListener("mouseup", S), c.removeEventListener("touchmove", N), c.removeEventListener("touchend", S);
  }
  c.addEventListener("mousemove", N), c.addEventListener("mouseup", S), c.addEventListener("touchmove", N), c.addEventListener("touchend", S);
}
const Ff = () => !0, _S = (e) => ({
  connectionStartHandle: e.connectionStartHandle,
  connectOnClick: e.connectOnClick,
  noPanClassName: e.noPanClassName
}), ES = (e, t, n) => (r) => {
  const { connectionStartHandle: o, connectionEndHandle: i, connectionClickStartHandle: l } = r;
  return {
    connecting: (o == null ? void 0 : o.nodeId) === e && (o == null ? void 0 : o.handleId) === t && (o == null ? void 0 : o.type) === n || (i == null ? void 0 : i.nodeId) === e && (i == null ? void 0 : i.handleId) === t && (i == null ? void 0 : i.type) === n,
    clickConnecting: (l == null ? void 0 : l.nodeId) === e && (l == null ? void 0 : l.handleId) === t && (l == null ? void 0 : l.type) === n
  };
}, gm = T.forwardRef(({ type: e = "source", position: t = X.Top, isValidConnection: n, isConnectable: r = !0, isConnectableStart: o = !0, isConnectableEnd: i = !0, id: l, onConnect: s, children: u, className: a, onMouseDown: c, onTouchStart: f, ...d }, m) => {
  var A, I;
  const x = l || null, w = e === "target", _ = Se(), p = pS(), { connectOnClick: h, noPanClassName: g } = le(_S, ke), { connecting: y, clickConnecting: E } = le(ES(p, x, e), ke);
  p || (I = (A = _.getState()).onError) == null || I.call(A, "010", Xt.error010());
  const C = (F) => {
    const { defaultEdgeOptions: B, onConnect: V, hasDefaultEdges: v } = _.getState(), $ = {
      ...B,
      ...F
    };
    if (v) {
      const { edges: k, setEdges: L } = _.getState();
      L(yS($, k));
    }
    V == null || V($), s == null || s($);
  }, M = (F) => {
    if (!p)
      return;
    const B = om(F);
    o && (B && F.button === 0 || !B) && mm({
      event: F,
      handleId: x,
      nodeId: p,
      onConnect: C,
      isTarget: w,
      getState: _.getState,
      setState: _.setState,
      isValidConnection: n || _.getState().isValidConnection || Ff
    }), B ? c == null || c(F) : f == null || f(F);
  }, P = (F) => {
    const { onClickConnectStart: B, onClickConnectEnd: V, connectionClickStartHandle: v, connectionMode: $, isValidConnection: k } = _.getState();
    if (!p || !v && !o)
      return;
    if (!v) {
      B == null || B(F, { nodeId: p, handleId: x, handleType: e }), _.setState({ connectionClickStartHandle: { nodeId: p, type: e, handleId: x } });
      return;
    }
    const L = em(F.target), N = n || k || Ff, { connection: S, isValid: z } = hm({
      nodeId: p,
      id: x,
      type: e
    }, $, v.nodeId, v.handleId || null, v.type, N, L);
    z && C(S), V == null || V(F), _.setState({ connectionClickStartHandle: null });
  };
  return R.createElement("div", { "data-handleid": x, "data-nodeid": p, "data-handlepos": t, "data-id": `${p}-${x}-${e}`, className: Te([
    "react-flow__handle",
    `react-flow__handle-${t}`,
    "nodrag",
    g,
    a,
    {
      source: !w,
      target: w,
      connectable: r,
      connectablestart: o,
      connectableend: i,
      connecting: E,
      // this class is used to style the handle when the user is connecting
      connectionindicator: r && (o && !y || i && y)
    }
  ]), onMouseDown: M, onTouchStart: M, onClick: h ? P : void 0, ref: m, ...d }, u);
});
gm.displayName = "Handle";
var Lr = T.memo(gm);
const ym = ({ data: e, isConnectable: t, targetPosition: n = X.Top, sourcePosition: r = X.Bottom }) => R.createElement(
  R.Fragment,
  null,
  R.createElement(Lr, { type: "target", position: n, isConnectable: t }),
  e == null ? void 0 : e.label,
  R.createElement(Lr, { type: "source", position: r, isConnectable: t })
);
ym.displayName = "DefaultNode";
var Lu = T.memo(ym);
const vm = ({ data: e, isConnectable: t, sourcePosition: n = X.Bottom }) => R.createElement(
  R.Fragment,
  null,
  e == null ? void 0 : e.label,
  R.createElement(Lr, { type: "source", position: n, isConnectable: t })
);
vm.displayName = "InputNode";
var wm = T.memo(vm);
const xm = ({ data: e, isConnectable: t, targetPosition: n = X.Top }) => R.createElement(
  R.Fragment,
  null,
  R.createElement(Lr, { type: "target", position: n, isConnectable: t }),
  e == null ? void 0 : e.label
);
xm.displayName = "OutputNode";
var Sm = T.memo(xm);
const Ka = () => null;
Ka.displayName = "GroupNode";
const kS = (e) => ({
  selectedNodes: e.getNodes().filter((t) => t.selected),
  selectedEdges: e.edges.filter((t) => t.selected).map((t) => ({ ...t }))
}), Ei = (e) => e.id;
function NS(e, t) {
  return ke(e.selectedNodes.map(Ei), t.selectedNodes.map(Ei)) && ke(e.selectedEdges.map(Ei), t.selectedEdges.map(Ei));
}
const _m = T.memo(({ onSelectionChange: e }) => {
  const t = Se(), { selectedNodes: n, selectedEdges: r } = le(kS, NS);
  return T.useEffect(() => {
    const o = { nodes: n, edges: r };
    e == null || e(o), t.getState().onSelectionChange.forEach((i) => i(o));
  }, [n, r, e]), null;
});
_m.displayName = "SelectionListener";
const CS = (e) => !!e.onSelectionChange;
function MS({ onSelectionChange: e }) {
  const t = le(CS);
  return e || t ? R.createElement(_m, { onSelectionChange: e }) : null;
}
const zS = (e) => ({
  setNodes: e.setNodes,
  setEdges: e.setEdges,
  setDefaultNodesAndEdges: e.setDefaultNodesAndEdges,
  setMinZoom: e.setMinZoom,
  setMaxZoom: e.setMaxZoom,
  setTranslateExtent: e.setTranslateExtent,
  setNodeExtent: e.setNodeExtent,
  reset: e.reset
});
function bn(e, t) {
  T.useEffect(() => {
    typeof e < "u" && t(e);
  }, [e]);
}
function Z(e, t, n) {
  T.useEffect(() => {
    typeof t < "u" && n({ [e]: t });
  }, [t]);
}
const TS = ({ nodes: e, edges: t, defaultNodes: n, defaultEdges: r, onConnect: o, onConnectStart: i, onConnectEnd: l, onClickConnectStart: s, onClickConnectEnd: u, nodesDraggable: a, nodesConnectable: c, nodesFocusable: f, edgesFocusable: d, edgesUpdatable: m, elevateNodesOnSelect: x, minZoom: w, maxZoom: _, nodeExtent: p, onNodesChange: h, onEdgesChange: g, elementsSelectable: y, connectionMode: E, snapGrid: C, snapToGrid: M, translateExtent: P, connectOnClick: A, defaultEdgeOptions: I, fitView: F, fitViewOptions: B, onNodesDelete: V, onEdgesDelete: v, onNodeDrag: $, onNodeDragStart: k, onNodeDragStop: L, onSelectionDrag: N, onSelectionDragStart: S, onSelectionDragStop: z, noPanClassName: D, nodeOrigin: O, rfId: j, autoPanOnConnect: U, autoPanOnNodeDrag: Y, onError: K, connectionRadius: G, isValidConnection: ne, nodeDragThreshold: te }) => {
  const { setNodes: ee, setEdges: Ne, setDefaultNodesAndEdges: ve, setMinZoom: Le, setMaxZoom: Pe, setTranslateExtent: me, setNodeExtent: Ke, reset: oe } = le(zS, ke), Q = Se();
  return T.useEffect(() => {
    const Oe = r == null ? void 0 : r.map((Pt) => ({ ...Pt, ...I }));
    return ve(n, Oe), () => {
      oe();
    };
  }, []), Z("defaultEdgeOptions", I, Q.setState), Z("connectionMode", E, Q.setState), Z("onConnect", o, Q.setState), Z("onConnectStart", i, Q.setState), Z("onConnectEnd", l, Q.setState), Z("onClickConnectStart", s, Q.setState), Z("onClickConnectEnd", u, Q.setState), Z("nodesDraggable", a, Q.setState), Z("nodesConnectable", c, Q.setState), Z("nodesFocusable", f, Q.setState), Z("edgesFocusable", d, Q.setState), Z("edgesUpdatable", m, Q.setState), Z("elementsSelectable", y, Q.setState), Z("elevateNodesOnSelect", x, Q.setState), Z("snapToGrid", M, Q.setState), Z("snapGrid", C, Q.setState), Z("onNodesChange", h, Q.setState), Z("onEdgesChange", g, Q.setState), Z("connectOnClick", A, Q.setState), Z("fitViewOnInit", F, Q.setState), Z("fitViewOnInitOptions", B, Q.setState), Z("onNodesDelete", V, Q.setState), Z("onEdgesDelete", v, Q.setState), Z("onNodeDrag", $, Q.setState), Z("onNodeDragStart", k, Q.setState), Z("onNodeDragStop", L, Q.setState), Z("onSelectionDrag", N, Q.setState), Z("onSelectionDragStart", S, Q.setState), Z("onSelectionDragStop", z, Q.setState), Z("noPanClassName", D, Q.setState), Z("nodeOrigin", O, Q.setState), Z("rfId", j, Q.setState), Z("autoPanOnConnect", U, Q.setState), Z("autoPanOnNodeDrag", Y, Q.setState), Z("onError", K, Q.setState), Z("connectionRadius", G, Q.setState), Z("isValidConnection", ne, Q.setState), Z("nodeDragThreshold", te, Q.setState), bn(e, ee), bn(t, Ne), bn(w, Le), bn(_, Pe), bn(P, me), bn(p, Ke), null;
}, Hf = { display: "none" }, PS = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  border: 0,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0px, 0px, 0px, 0px)",
  clipPath: "inset(100%)"
}, Em = "react-flow__node-desc", km = "react-flow__edge-desc", $S = "react-flow__aria-live", RS = (e) => e.ariaLiveMessage;
function AS({ rfId: e }) {
  const t = le(RS);
  return R.createElement("div", { id: `${$S}-${e}`, "aria-live": "assertive", "aria-atomic": "true", style: PS }, t);
}
function IS({ rfId: e, disableKeyboardA11y: t }) {
  return R.createElement(
    R.Fragment,
    null,
    R.createElement(
      "div",
      { id: `${Em}-${e}`, style: Hf },
      "Press enter or space to select a node.",
      !t && "You can then use the arrow keys to move the node around.",
      " Press delete to remove it and escape to cancel.",
      " "
    ),
    R.createElement("div", { id: `${km}-${e}`, style: Hf }, "Press enter or space to select an edge. You can then press delete to remove it or escape to cancel."),
    !t && R.createElement(AS, { rfId: e })
  );
}
var Yo = (e = null, t = { actInsideInputWithModifier: !0 }) => {
  const [n, r] = T.useState(!1), o = T.useRef(!1), i = T.useRef(/* @__PURE__ */ new Set([])), [l, s] = T.useMemo(() => {
    if (e !== null) {
      const a = (Array.isArray(e) ? e : [e]).filter((f) => typeof f == "string").map((f) => f.split("+")), c = a.reduce((f, d) => f.concat(...d), []);
      return [a, c];
    }
    return [[], []];
  }, [e]);
  return T.useEffect(() => {
    const u = typeof document < "u" ? document : null, a = (t == null ? void 0 : t.target) || u;
    if (e !== null) {
      const c = (m) => {
        if (o.current = m.ctrlKey || m.metaKey || m.shiftKey, (!o.current || o.current && !t.actInsideInputWithModifier) && Ru(m))
          return !1;
        const w = Bf(m.code, s);
        i.current.add(m[w]), Vf(l, i.current, !1) && (m.preventDefault(), r(!0));
      }, f = (m) => {
        if ((!o.current || o.current && !t.actInsideInputWithModifier) && Ru(m))
          return !1;
        const w = Bf(m.code, s);
        Vf(l, i.current, !0) ? (r(!1), i.current.clear()) : i.current.delete(m[w]), m.key === "Meta" && i.current.clear(), o.current = !1;
      }, d = () => {
        i.current.clear(), r(!1);
      };
      return a == null || a.addEventListener("keydown", c), a == null || a.addEventListener("keyup", f), window.addEventListener("blur", d), () => {
        a == null || a.removeEventListener("keydown", c), a == null || a.removeEventListener("keyup", f), window.removeEventListener("blur", d);
      };
    }
  }, [e, r]), n;
};
function Vf(e, t, n) {
  return e.filter((r) => n || r.length === t.size).some((r) => r.every((o) => t.has(o)));
}
function Bf(e, t) {
  return t.includes(e) ? "code" : "key";
}
function Nm(e, t, n, r) {
  var s, u;
  const o = e.parentNode || e.parentId;
  if (!o)
    return n;
  const i = t.get(o), l = On(i, r);
  return Nm(i, t, {
    x: (n.x ?? 0) + l.x,
    y: (n.y ?? 0) + l.y,
    z: (((s = i[he]) == null ? void 0 : s.z) ?? 0) > (n.z ?? 0) ? ((u = i[he]) == null ? void 0 : u.z) ?? 0 : n.z ?? 0
  }, r);
}
function Cm(e, t, n) {
  e.forEach((r) => {
    var i;
    const o = r.parentNode || r.parentId;
    if (o && !e.has(o))
      throw new Error(`Parent node ${o} not found`);
    if (o || n != null && n[r.id]) {
      const { x: l, y: s, z: u } = Nm(r, e, {
        ...r.position,
        z: ((i = r[he]) == null ? void 0 : i.z) ?? 0
      }, t);
      r.positionAbsolute = {
        x: l,
        y: s
      }, r[he].z = u, n != null && n[r.id] && (r[he].isParent = !0);
    }
  });
}
function Ns(e, t, n, r) {
  const o = /* @__PURE__ */ new Map(), i = {}, l = r ? 1e3 : 0;
  return e.forEach((s) => {
    var m;
    const u = (lt(s.zIndex) ? s.zIndex : 0) + (s.selected ? l : 0), a = t.get(s.id), c = {
      ...s,
      positionAbsolute: {
        x: s.position.x,
        y: s.position.y
      }
    }, f = s.parentNode || s.parentId;
    f && (i[f] = !0);
    const d = (a == null ? void 0 : a.type) && (a == null ? void 0 : a.type) !== s.type;
    Object.defineProperty(c, he, {
      enumerable: !1,
      value: {
        handleBounds: d || (m = a == null ? void 0 : a[he]) == null ? void 0 : m.handleBounds,
        z: u
      }
    }), o.set(s.id, c);
  }), Cm(o, n, i), o;
}
function Mm(e, t = {}) {
  const { getNodes: n, width: r, height: o, minZoom: i, maxZoom: l, d3Zoom: s, d3Selection: u, fitViewOnInitDone: a, fitViewOnInit: c, nodeOrigin: f } = e(), d = t.initial && !a && c;
  if (s && u && (d || !t.initial)) {
    const x = n().filter((_) => {
      var h;
      const p = t.includeHiddenNodes ? _.width && _.height : !_.hidden;
      return (h = t.nodes) != null && h.length ? p && t.nodes.some((g) => g.id === _.id) : p;
    }), w = x.every((_) => _.width && _.height);
    if (x.length > 0 && w) {
      const _ = jl(x, f), { x: p, y: h, zoom: g } = dm(_, r, o, t.minZoom ?? i, t.maxZoom ?? l, t.padding ?? 0.1), y = Vt.translate(p, h).scale(g);
      return typeof t.duration == "number" && t.duration > 0 ? s.transform(zn(u, t.duration), y) : s.transform(u, y), !0;
    }
  }
  return !1;
}
function DS(e, t) {
  return e.forEach((n) => {
    const r = t.get(n.id);
    r && t.set(r.id, {
      ...r,
      [he]: r[he],
      selected: n.selected
    });
  }), new Map(t);
}
function LS(e, t) {
  return t.map((n) => {
    const r = e.find((o) => o.id === n.id);
    return r && (n.selected = r.selected), n;
  });
}
function ki({ changedNodes: e, changedEdges: t, get: n, set: r }) {
  const { nodeInternals: o, edges: i, onNodesChange: l, onEdgesChange: s, hasDefaultNodes: u, hasDefaultEdges: a } = n();
  e != null && e.length && (u && r({ nodeInternals: DS(e, o) }), l == null || l(e)), t != null && t.length && (a && r({ edges: LS(t, i) }), s == null || s(t));
}
const er = () => {
}, OS = {
  zoomIn: er,
  zoomOut: er,
  zoomTo: er,
  getZoom: () => 1,
  setViewport: er,
  getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
  fitView: () => !1,
  setCenter: er,
  fitBounds: er,
  project: (e) => e,
  screenToFlowPosition: (e) => e,
  flowToScreenPosition: (e) => e,
  viewportInitialized: !1
}, FS = (e) => ({
  d3Zoom: e.d3Zoom,
  d3Selection: e.d3Selection
}), HS = () => {
  const e = Se(), { d3Zoom: t, d3Selection: n } = le(FS, ke);
  return T.useMemo(() => n && t ? {
    zoomIn: (o) => t.scaleBy(zn(n, o == null ? void 0 : o.duration), 1.2),
    zoomOut: (o) => t.scaleBy(zn(n, o == null ? void 0 : o.duration), 1 / 1.2),
    zoomTo: (o, i) => t.scaleTo(zn(n, i == null ? void 0 : i.duration), o),
    getZoom: () => e.getState().transform[2],
    setViewport: (o, i) => {
      const [l, s, u] = e.getState().transform, a = Vt.translate(o.x ?? l, o.y ?? s).scale(o.zoom ?? u);
      t.transform(zn(n, i == null ? void 0 : i.duration), a);
    },
    getViewport: () => {
      const [o, i, l] = e.getState().transform;
      return { x: o, y: i, zoom: l };
    },
    fitView: (o) => Mm(e.getState, o),
    setCenter: (o, i, l) => {
      const { width: s, height: u, maxZoom: a } = e.getState(), c = typeof (l == null ? void 0 : l.zoom) < "u" ? l.zoom : a, f = s / 2 - o * c, d = u / 2 - i * c, m = Vt.translate(f, d).scale(c);
      t.transform(zn(n, l == null ? void 0 : l.duration), m);
    },
    fitBounds: (o, i) => {
      const { width: l, height: s, minZoom: u, maxZoom: a } = e.getState(), { x: c, y: f, zoom: d } = dm(o, l, s, u, a, (i == null ? void 0 : i.padding) ?? 0.1), m = Vt.translate(c, f).scale(d);
      t.transform(zn(n, i == null ? void 0 : i.duration), m);
    },
    // @deprecated Use `screenToFlowPosition`.
    project: (o) => {
      const { transform: i, snapToGrid: l, snapGrid: s } = e.getState();
      return console.warn("[DEPRECATED] `project` is deprecated. Instead use `screenToFlowPosition`. There is no need to subtract the react flow bounds anymore! https://reactflow.dev/api-reference/types/react-flow-instance#screen-to-flow-position"), Du(o, i, l, s);
    },
    screenToFlowPosition: (o) => {
      const { transform: i, snapToGrid: l, snapGrid: s, domNode: u } = e.getState();
      if (!u)
        return o;
      const { x: a, y: c } = u.getBoundingClientRect(), f = {
        x: o.x - a,
        y: o.y - c
      };
      return Du(f, i, l, s);
    },
    flowToScreenPosition: (o) => {
      const { transform: i, domNode: l } = e.getState();
      if (!l)
        return o;
      const { x: s, y: u } = l.getBoundingClientRect(), a = am(o, i);
      return {
        x: a.x + s,
        y: a.y + u
      };
    },
    viewportInitialized: !0
  } : OS, [t, n]);
};
function Ga() {
  const e = HS(), t = Se(), n = T.useCallback(() => t.getState().getNodes().map((w) => ({ ...w })), []), r = T.useCallback((w) => t.getState().nodeInternals.get(w), []), o = T.useCallback(() => {
    const { edges: w = [] } = t.getState();
    return w.map((_) => ({ ..._ }));
  }, []), i = T.useCallback((w) => {
    const { edges: _ = [] } = t.getState();
    return _.find((p) => p.id === w);
  }, []), l = T.useCallback((w) => {
    const { getNodes: _, setNodes: p, hasDefaultNodes: h, onNodesChange: g } = t.getState(), y = _(), E = typeof w == "function" ? w(y) : w;
    if (h)
      p(E);
    else if (g) {
      const C = E.length === 0 ? y.map((M) => ({ type: "remove", id: M.id })) : E.map((M) => ({ item: M, type: "reset" }));
      g(C);
    }
  }, []), s = T.useCallback((w) => {
    const { edges: _ = [], setEdges: p, hasDefaultEdges: h, onEdgesChange: g } = t.getState(), y = typeof w == "function" ? w(_) : w;
    if (h)
      p(y);
    else if (g) {
      const E = y.length === 0 ? _.map((C) => ({ type: "remove", id: C.id })) : y.map((C) => ({ item: C, type: "reset" }));
      g(E);
    }
  }, []), u = T.useCallback((w) => {
    const _ = Array.isArray(w) ? w : [w], { getNodes: p, setNodes: h, hasDefaultNodes: g, onNodesChange: y } = t.getState();
    if (g) {
      const C = [...p(), ..._];
      h(C);
    } else if (y) {
      const E = _.map((C) => ({ item: C, type: "add" }));
      y(E);
    }
  }, []), a = T.useCallback((w) => {
    const _ = Array.isArray(w) ? w : [w], { edges: p = [], setEdges: h, hasDefaultEdges: g, onEdgesChange: y } = t.getState();
    if (g)
      h([...p, ..._]);
    else if (y) {
      const E = _.map((C) => ({ item: C, type: "add" }));
      y(E);
    }
  }, []), c = T.useCallback(() => {
    const { getNodes: w, edges: _ = [], transform: p } = t.getState(), [h, g, y] = p;
    return {
      nodes: w().map((E) => ({ ...E })),
      edges: _.map((E) => ({ ...E })),
      viewport: {
        x: h,
        y: g,
        zoom: y
      }
    };
  }, []), f = T.useCallback(({ nodes: w, edges: _ }) => {
    const { nodeInternals: p, getNodes: h, edges: g, hasDefaultNodes: y, hasDefaultEdges: E, onNodesDelete: C, onEdgesDelete: M, onNodesChange: P, onEdgesChange: A } = t.getState(), I = (w || []).map(($) => $.id), F = (_ || []).map(($) => $.id), B = h().reduce(($, k) => {
      const L = k.parentNode || k.parentId, N = !I.includes(k.id) && L && $.find((z) => z.id === L);
      return (typeof k.deletable == "boolean" ? k.deletable : !0) && (I.includes(k.id) || N) && $.push(k), $;
    }, []), V = g.filter(($) => typeof $.deletable == "boolean" ? $.deletable : !0), v = V.filter(($) => F.includes($.id));
    if (B || v) {
      const $ = fm(B, V), k = [...v, ...$], L = k.reduce((N, S) => (N.includes(S.id) || N.push(S.id), N), []);
      if ((E || y) && (E && t.setState({
        edges: g.filter((N) => !L.includes(N.id))
      }), y && (B.forEach((N) => {
        p.delete(N.id);
      }), t.setState({
        nodeInternals: new Map(p)
      }))), L.length > 0 && (M == null || M(k), A && A(L.map((N) => ({
        id: N,
        type: "remove"
      })))), B.length > 0 && (C == null || C(B), P)) {
        const N = B.map((S) => ({ id: S.id, type: "remove" }));
        P(N);
      }
    }
  }, []), d = T.useCallback((w) => {
    const _ = iS(w), p = _ ? null : t.getState().nodeInternals.get(w.id);
    return !_ && !p ? [null, null, _] : [_ ? w : Rf(p), p, _];
  }, []), m = T.useCallback((w, _ = !0, p) => {
    const [h, g, y] = d(w);
    return h ? (p || t.getState().getNodes()).filter((E) => {
      if (!y && (E.id === g.id || !E.positionAbsolute))
        return !1;
      const C = Rf(E), M = $u(C, h);
      return _ && M > 0 || M >= h.width * h.height;
    }) : [];
  }, []), x = T.useCallback((w, _, p = !0) => {
    const [h] = d(w);
    if (!h)
      return !1;
    const g = $u(h, _);
    return p && g > 0 || g >= h.width * h.height;
  }, []);
  return T.useMemo(() => ({
    ...e,
    getNodes: n,
    getNode: r,
    getEdges: o,
    getEdge: i,
    setNodes: l,
    setEdges: s,
    addNodes: u,
    addEdges: a,
    toObject: c,
    deleteElements: f,
    getIntersectingNodes: m,
    isNodeIntersecting: x
  }), [
    e,
    n,
    r,
    o,
    i,
    l,
    s,
    u,
    a,
    c,
    f,
    m,
    x
  ]);
}
const VS = { actInsideInputWithModifier: !1 };
var BS = ({ deleteKeyCode: e, multiSelectionKeyCode: t }) => {
  const n = Se(), { deleteElements: r } = Ga(), o = Yo(e, VS), i = Yo(t);
  T.useEffect(() => {
    if (o) {
      const { edges: l, getNodes: s } = n.getState(), u = s().filter((c) => c.selected), a = l.filter((c) => c.selected);
      r({ nodes: u, edges: a }), n.setState({ nodesSelectionActive: !1 });
    }
  }, [o]), T.useEffect(() => {
    n.setState({ multiSelectionActive: i });
  }, [i]);
};
function US(e) {
  const t = Se();
  T.useEffect(() => {
    let n;
    const r = () => {
      var i, l;
      if (!e.current)
        return;
      const o = Ba(e.current);
      (o.height === 0 || o.width === 0) && ((l = (i = t.getState()).onError) == null || l.call(i, "004", Xt.error004())), t.setState({ width: o.width || 500, height: o.height || 500 });
    };
    return r(), window.addEventListener("resize", r), e.current && (n = new ResizeObserver(() => r()), n.observe(e.current)), () => {
      window.removeEventListener("resize", r), n && e.current && n.unobserve(e.current);
    };
  }, []);
}
const Za = {
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0
}, jS = (e, t) => e.x !== t.x || e.y !== t.y || e.zoom !== t.k, Ni = (e) => ({
  x: e.x,
  y: e.y,
  zoom: e.k
}), tr = (e, t) => e.target.closest(`.${t}`), Uf = (e, t) => t === 2 && Array.isArray(e) && e.includes(2), jf = (e) => {
  const t = e.ctrlKey && vl() ? 10 : 1;
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * t;
}, WS = (e) => ({
  d3Zoom: e.d3Zoom,
  d3Selection: e.d3Selection,
  d3ZoomHandler: e.d3ZoomHandler,
  userSelectionActive: e.userSelectionActive
}), YS = ({ onMove: e, onMoveStart: t, onMoveEnd: n, onPaneContextMenu: r, zoomOnScroll: o = !0, zoomOnPinch: i = !0, panOnScroll: l = !1, panOnScrollSpeed: s = 0.5, panOnScrollMode: u = An.Free, zoomOnDoubleClick: a = !0, elementsSelectable: c, panOnDrag: f = !0, defaultViewport: d, translateExtent: m, minZoom: x, maxZoom: w, zoomActivationKeyCode: _, preventScrolling: p = !0, children: h, noWheelClassName: g, noPanClassName: y }) => {
  const E = T.useRef(), C = Se(), M = T.useRef(!1), P = T.useRef(!1), A = T.useRef(null), I = T.useRef({ x: 0, y: 0, zoom: 0 }), { d3Zoom: F, d3Selection: B, d3ZoomHandler: V, userSelectionActive: v } = le(WS, ke), $ = Yo(_), k = T.useRef(0), L = T.useRef(!1), N = T.useRef();
  return US(A), T.useEffect(() => {
    if (A.current) {
      const S = A.current.getBoundingClientRect(), z = qh().scaleExtent([x, w]).translateExtent(m), D = ot(A.current).call(z), O = Vt.translate(d.x, d.y).scale(Dr(d.zoom, x, w)), j = [
        [0, 0],
        [S.width, S.height]
      ], U = z.constrain()(O, j, m);
      z.transform(D, U), z.wheelDelta(jf), C.setState({
        d3Zoom: z,
        d3Selection: D,
        d3ZoomHandler: D.on("wheel.zoom"),
        // we need to pass transform because zoom handler is not registered when we set the initial transform
        transform: [U.x, U.y, U.k],
        domNode: A.current.closest(".react-flow")
      });
    }
  }, []), T.useEffect(() => {
    B && F && (l && !$ && !v ? B.on("wheel.zoom", (S) => {
      if (tr(S, g))
        return !1;
      S.preventDefault(), S.stopImmediatePropagation();
      const z = B.property("__zoom").k || 1;
      if (S.ctrlKey && i) {
        const ne = ht(S), te = jf(S), ee = z * Math.pow(2, te);
        F.scaleTo(B, ee, ne, S);
        return;
      }
      const D = S.deltaMode === 1 ? 20 : 1;
      let O = u === An.Vertical ? 0 : S.deltaX * D, j = u === An.Horizontal ? 0 : S.deltaY * D;
      !vl() && S.shiftKey && u !== An.Vertical && (O = S.deltaY * D, j = 0), F.translateBy(
        B,
        -(O / z) * s,
        -(j / z) * s,
        // @ts-ignore
        { internal: !0 }
      );
      const U = Ni(B.property("__zoom")), { onViewportChangeStart: Y, onViewportChange: K, onViewportChangeEnd: G } = C.getState();
      clearTimeout(N.current), L.current || (L.current = !0, t == null || t(S, U), Y == null || Y(U)), L.current && (e == null || e(S, U), K == null || K(U), N.current = setTimeout(() => {
        n == null || n(S, U), G == null || G(U), L.current = !1;
      }, 150));
    }, { passive: !1 }) : typeof V < "u" && B.on("wheel.zoom", function(S, z) {
      if (!p && S.type === "wheel" && !S.ctrlKey || tr(S, g))
        return null;
      S.preventDefault(), V.call(this, S, z);
    }, { passive: !1 }));
  }, [
    v,
    l,
    u,
    B,
    F,
    V,
    $,
    i,
    p,
    g,
    t,
    e,
    n
  ]), T.useEffect(() => {
    F && F.on("start", (S) => {
      var O, j;
      if (!S.sourceEvent || S.sourceEvent.internal)
        return null;
      k.current = (O = S.sourceEvent) == null ? void 0 : O.button;
      const { onViewportChangeStart: z } = C.getState(), D = Ni(S.transform);
      M.current = !0, I.current = D, ((j = S.sourceEvent) == null ? void 0 : j.type) === "mousedown" && C.setState({ paneDragging: !0 }), z == null || z(D), t == null || t(S.sourceEvent, D);
    });
  }, [F, t]), T.useEffect(() => {
    F && (v && !M.current ? F.on("zoom", null) : v || F.on("zoom", (S) => {
      var D;
      const { onViewportChange: z } = C.getState();
      if (C.setState({ transform: [S.transform.x, S.transform.y, S.transform.k] }), P.current = !!(r && Uf(f, k.current ?? 0)), (e || z) && !((D = S.sourceEvent) != null && D.internal)) {
        const O = Ni(S.transform);
        z == null || z(O), e == null || e(S.sourceEvent, O);
      }
    }));
  }, [v, F, e, f, r]), T.useEffect(() => {
    F && F.on("end", (S) => {
      if (!S.sourceEvent || S.sourceEvent.internal)
        return null;
      const { onViewportChangeEnd: z } = C.getState();
      if (M.current = !1, C.setState({ paneDragging: !1 }), r && Uf(f, k.current ?? 0) && !P.current && r(S.sourceEvent), P.current = !1, (n || z) && jS(I.current, S.transform)) {
        const D = Ni(S.transform);
        I.current = D, clearTimeout(E.current), E.current = setTimeout(() => {
          z == null || z(D), n == null || n(S.sourceEvent, D);
        }, l ? 150 : 0);
      }
    });
  }, [F, l, f, n, r]), T.useEffect(() => {
    F && F.filter((S) => {
      const z = $ || o, D = i && S.ctrlKey;
      if ((f === !0 || Array.isArray(f) && f.includes(1)) && S.button === 1 && S.type === "mousedown" && (tr(S, "react-flow__node") || tr(S, "react-flow__edge")))
        return !0;
      if (!f && !z && !l && !a && !i || v || !a && S.type === "dblclick" || tr(S, g) && S.type === "wheel" || tr(S, y) && (S.type !== "wheel" || l && S.type === "wheel" && !$) || !i && S.ctrlKey && S.type === "wheel" || !z && !l && !D && S.type === "wheel" || !f && (S.type === "mousedown" || S.type === "touchstart") || Array.isArray(f) && !f.includes(S.button) && S.type === "mousedown")
        return !1;
      const O = Array.isArray(f) && f.includes(S.button) || !S.button || S.button <= 1;
      return (!S.ctrlKey || S.type === "wheel") && O;
    });
  }, [
    v,
    F,
    o,
    i,
    l,
    a,
    f,
    c,
    $
  ]), R.createElement("div", { className: "react-flow__renderer", ref: A, style: Za }, h);
}, XS = (e) => ({
  userSelectionActive: e.userSelectionActive,
  userSelectionRect: e.userSelectionRect
});
function QS() {
  const { userSelectionActive: e, userSelectionRect: t } = le(XS, ke);
  return e && t ? R.createElement("div", { className: "react-flow__selection react-flow__container", style: {
    width: t.width,
    height: t.height,
    transform: `translate(${t.x}px, ${t.y}px)`
  } }) : null;
}
function Wf(e, t) {
  const n = t.parentNode || t.parentId, r = e.find((o) => o.id === n);
  if (r) {
    const o = t.position.x + t.width - r.width, i = t.position.y + t.height - r.height;
    if (o > 0 || i > 0 || t.position.x < 0 || t.position.y < 0) {
      if (r.style = { ...r.style }, r.style.width = r.style.width ?? r.width, r.style.height = r.style.height ?? r.height, o > 0 && (r.style.width += o), i > 0 && (r.style.height += i), t.position.x < 0) {
        const l = Math.abs(t.position.x);
        r.position.x = r.position.x - l, r.style.width += l, t.position.x = 0;
      }
      if (t.position.y < 0) {
        const l = Math.abs(t.position.y);
        r.position.y = r.position.y - l, r.style.height += l, t.position.y = 0;
      }
      r.width = r.style.width, r.height = r.style.height;
    }
  }
}
function KS(e, t) {
  if (e.some((r) => r.type === "reset"))
    return e.filter((r) => r.type === "reset").map((r) => r.item);
  const n = e.filter((r) => r.type === "add").map((r) => r.item);
  return t.reduce((r, o) => {
    const i = e.filter((s) => s.id === o.id);
    if (i.length === 0)
      return r.push(o), r;
    const l = { ...o };
    for (const s of i)
      if (s)
        switch (s.type) {
          case "select": {
            l.selected = s.selected;
            break;
          }
          case "position": {
            typeof s.position < "u" && (l.position = s.position), typeof s.positionAbsolute < "u" && (l.positionAbsolute = s.positionAbsolute), typeof s.dragging < "u" && (l.dragging = s.dragging), l.expandParent && Wf(r, l);
            break;
          }
          case "dimensions": {
            typeof s.dimensions < "u" && (l.width = s.dimensions.width, l.height = s.dimensions.height), typeof s.updateStyle < "u" && (l.style = { ...l.style || {}, ...s.dimensions }), typeof s.resizing == "boolean" && (l.resizing = s.resizing), l.expandParent && Wf(r, l);
            break;
          }
          case "remove":
            return r;
        }
    return r.push(l), r;
  }, n);
}
function GS(e, t) {
  return KS(e, t);
}
const bt = (e, t) => ({
  id: e,
  type: "select",
  selected: t
});
function mr(e, t) {
  return e.reduce((n, r) => {
    const o = t.includes(r.id);
    return !r.selected && o ? (r.selected = !0, n.push(bt(r.id, !0))) : r.selected && !o && (r.selected = !1, n.push(bt(r.id, !1))), n;
  }, []);
}
const Cs = (e, t) => (n) => {
  n.target === t.current && (e == null || e(n));
}, ZS = (e) => ({
  userSelectionActive: e.userSelectionActive,
  elementsSelectable: e.elementsSelectable,
  dragging: e.paneDragging
}), zm = T.memo(({ isSelecting: e, selectionMode: t = jo.Full, panOnDrag: n, onSelectionStart: r, onSelectionEnd: o, onPaneClick: i, onPaneContextMenu: l, onPaneScroll: s, onPaneMouseEnter: u, onPaneMouseMove: a, onPaneMouseLeave: c, children: f }) => {
  const d = T.useRef(null), m = Se(), x = T.useRef(0), w = T.useRef(0), _ = T.useRef(), { userSelectionActive: p, elementsSelectable: h, dragging: g } = le(ZS, ke), y = () => {
    m.setState({ userSelectionActive: !1, userSelectionRect: null }), x.current = 0, w.current = 0;
  }, E = (V) => {
    i == null || i(V), m.getState().resetSelectedElements(), m.setState({ nodesSelectionActive: !1 });
  }, C = (V) => {
    if (Array.isArray(n) && (n != null && n.includes(2))) {
      V.preventDefault();
      return;
    }
    l == null || l(V);
  }, M = s ? (V) => s(V) : void 0, P = (V) => {
    const { resetSelectedElements: v, domNode: $ } = m.getState();
    if (_.current = $ == null ? void 0 : $.getBoundingClientRect(), !h || !e || V.button !== 0 || V.target !== d.current || !_.current)
      return;
    const { x: k, y: L } = hn(V, _.current);
    v(), m.setState({
      userSelectionRect: {
        width: 0,
        height: 0,
        startX: k,
        startY: L,
        x: k,
        y: L
      }
    }), r == null || r(V);
  }, A = (V) => {
    const { userSelectionRect: v, nodeInternals: $, edges: k, transform: L, onNodesChange: N, onEdgesChange: S, nodeOrigin: z, getNodes: D } = m.getState();
    if (!e || !_.current || !v)
      return;
    m.setState({ userSelectionActive: !0, nodesSelectionActive: !1 });
    const O = hn(V, _.current), j = v.startX ?? 0, U = v.startY ?? 0, Y = {
      ...v,
      x: O.x < j ? O.x : j,
      y: O.y < U ? O.y : U,
      width: Math.abs(O.x - j),
      height: Math.abs(O.y - U)
    }, K = D(), G = cm($, Y, L, t === jo.Partial, !0, z), ne = fm(G, k).map((ee) => ee.id), te = G.map((ee) => ee.id);
    if (x.current !== te.length) {
      x.current = te.length;
      const ee = mr(K, te);
      ee.length && (N == null || N(ee));
    }
    if (w.current !== ne.length) {
      w.current = ne.length;
      const ee = mr(k, ne);
      ee.length && (S == null || S(ee));
    }
    m.setState({
      userSelectionRect: Y
    });
  }, I = (V) => {
    if (V.button !== 0)
      return;
    const { userSelectionRect: v } = m.getState();
    !p && v && V.target === d.current && (E == null || E(V)), m.setState({ nodesSelectionActive: x.current > 0 }), y(), o == null || o(V);
  }, F = (V) => {
    p && (m.setState({ nodesSelectionActive: x.current > 0 }), o == null || o(V)), y();
  }, B = h && (e || p);
  return R.createElement(
    "div",
    { className: Te(["react-flow__pane", { dragging: g, selection: e }]), onClick: B ? void 0 : Cs(E, d), onContextMenu: Cs(C, d), onWheel: Cs(M, d), onMouseEnter: B ? void 0 : u, onMouseDown: B ? P : void 0, onMouseMove: B ? A : a, onMouseUp: B ? I : void 0, onMouseLeave: B ? F : c, ref: d, style: Za },
    f,
    R.createElement(QS, null)
  );
});
zm.displayName = "Pane";
function Tm(e, t) {
  const n = e.parentNode || e.parentId;
  if (!n)
    return !1;
  const r = t.get(n);
  return r ? r.selected ? !0 : Tm(r, t) : !1;
}
function Yf(e, t, n) {
  let r = e;
  do {
    if (r != null && r.matches(t))
      return !0;
    if (r === n.current)
      return !1;
    r = r.parentElement;
  } while (r);
  return !1;
}
function qS(e, t, n, r) {
  return Array.from(e.values()).filter((o) => (o.selected || o.id === r) && (!o.parentNode || o.parentId || !Tm(o, e)) && (o.draggable || t && typeof o.draggable > "u")).map((o) => {
    var i, l;
    return {
      id: o.id,
      position: o.position || { x: 0, y: 0 },
      positionAbsolute: o.positionAbsolute || { x: 0, y: 0 },
      distance: {
        x: n.x - (((i = o.positionAbsolute) == null ? void 0 : i.x) ?? 0),
        y: n.y - (((l = o.positionAbsolute) == null ? void 0 : l.y) ?? 0)
      },
      delta: {
        x: 0,
        y: 0
      },
      extent: o.extent,
      parentNode: o.parentNode || o.parentId,
      parentId: o.parentNode || o.parentId,
      width: o.width,
      height: o.height,
      expandParent: o.expandParent
    };
  });
}
function JS(e, t) {
  return !t || t === "parent" ? t : [t[0], [t[1][0] - (e.width || 0), t[1][1] - (e.height || 0)]];
}
function Pm(e, t, n, r, o = [0, 0], i) {
  const l = JS(e, e.extent || r);
  let s = l;
  const u = e.parentNode || e.parentId;
  if (e.extent === "parent" && !e.expandParent)
    if (u && e.width && e.height) {
      const f = n.get(u), { x: d, y: m } = On(f, o).positionAbsolute;
      s = f && lt(d) && lt(m) && lt(f.width) && lt(f.height) ? [
        [d + e.width * o[0], m + e.height * o[1]],
        [
          d + f.width - e.width + e.width * o[0],
          m + f.height - e.height + e.height * o[1]
        ]
      ] : s;
    } else
      i == null || i("005", Xt.error005()), s = l;
  else if (e.extent && u && e.extent !== "parent") {
    const f = n.get(u), { x: d, y: m } = On(f, o).positionAbsolute;
    s = [
      [e.extent[0][0] + d, e.extent[0][1] + m],
      [e.extent[1][0] + d, e.extent[1][1] + m]
    ];
  }
  let a = { x: 0, y: 0 };
  if (u) {
    const f = n.get(u);
    a = On(f, o).positionAbsolute;
  }
  const c = s && s !== "parent" ? Ua(t, s) : t;
  return {
    position: {
      x: c.x - a.x,
      y: c.y - a.y
    },
    positionAbsolute: c
  };
}
function Ms({ nodeId: e, dragItems: t, nodeInternals: n }) {
  const r = t.map((o) => ({
    ...n.get(o.id),
    position: o.position,
    positionAbsolute: o.positionAbsolute
  }));
  return [e ? r.find((o) => o.id === e) : r[0], r];
}
const Xf = (e, t, n, r) => {
  const o = t.querySelectorAll(e);
  if (!o || !o.length)
    return null;
  const i = Array.from(o), l = t.getBoundingClientRect(), s = {
    x: l.width * r[0],
    y: l.height * r[1]
  };
  return i.map((u) => {
    const a = u.getBoundingClientRect();
    return {
      id: u.getAttribute("data-handleid"),
      position: u.getAttribute("data-handlepos"),
      x: (a.left - l.left - s.x) / n,
      y: (a.top - l.top - s.y) / n,
      ...Ba(u)
    };
  });
};
function to(e, t, n) {
  return n === void 0 ? n : (r) => {
    const o = t().nodeInternals.get(e);
    o && n(r, { ...o });
  };
}
function Ou({ id: e, store: t, unselect: n = !1, nodeRef: r }) {
  const { addSelectedNodes: o, unselectNodesAndEdges: i, multiSelectionActive: l, nodeInternals: s, onError: u } = t.getState(), a = s.get(e);
  if (!a) {
    u == null || u("012", Xt.error012(e));
    return;
  }
  t.setState({ nodesSelectionActive: !1 }), a.selected ? (n || a.selected && l) && (i({ nodes: [a], edges: [] }), requestAnimationFrame(() => {
    var c;
    return (c = r == null ? void 0 : r.current) == null ? void 0 : c.blur();
  })) : o([e]);
}
function bS() {
  const e = Se();
  return T.useCallback(({ sourceEvent: n }) => {
    const { transform: r, snapGrid: o, snapToGrid: i } = e.getState(), l = n.touches ? n.touches[0].clientX : n.clientX, s = n.touches ? n.touches[0].clientY : n.clientY, u = {
      x: (l - r[0]) / r[2],
      y: (s - r[1]) / r[2]
    };
    return {
      xSnapped: i ? o[0] * Math.round(u.x / o[0]) : u.x,
      ySnapped: i ? o[1] * Math.round(u.y / o[1]) : u.y,
      ...u
    };
  }, []);
}
function zs(e) {
  return (t, n, r) => e == null ? void 0 : e(t, r);
}
function $m({ nodeRef: e, disabled: t = !1, noDragClassName: n, handleSelector: r, nodeId: o, isSelectable: i, selectNodesOnDrag: l }) {
  const s = Se(), [u, a] = T.useState(!1), c = T.useRef([]), f = T.useRef({ x: null, y: null }), d = T.useRef(0), m = T.useRef(null), x = T.useRef({ x: 0, y: 0 }), w = T.useRef(null), _ = T.useRef(!1), p = T.useRef(!1), h = T.useRef(!1), g = bS();
  return T.useEffect(() => {
    if (e != null && e.current) {
      const y = ot(e.current), E = ({ x: P, y: A }) => {
        const { nodeInternals: I, onNodeDrag: F, onSelectionDrag: B, updateNodePositions: V, nodeExtent: v, snapGrid: $, snapToGrid: k, nodeOrigin: L, onError: N } = s.getState();
        f.current = { x: P, y: A };
        let S = !1, z = { x: 0, y: 0, x2: 0, y2: 0 };
        if (c.current.length > 1 && v) {
          const O = jl(c.current, L);
          z = Uo(O);
        }
        if (c.current = c.current.map((O) => {
          const j = { x: P - O.distance.x, y: A - O.distance.y };
          k && (j.x = $[0] * Math.round(j.x / $[0]), j.y = $[1] * Math.round(j.y / $[1]));
          const U = [
            [v[0][0], v[0][1]],
            [v[1][0], v[1][1]]
          ];
          c.current.length > 1 && v && !O.extent && (U[0][0] = O.positionAbsolute.x - z.x + v[0][0], U[1][0] = O.positionAbsolute.x + (O.width ?? 0) - z.x2 + v[1][0], U[0][1] = O.positionAbsolute.y - z.y + v[0][1], U[1][1] = O.positionAbsolute.y + (O.height ?? 0) - z.y2 + v[1][1]);
          const Y = Pm(O, j, I, U, L, N);
          return S = S || O.position.x !== Y.position.x || O.position.y !== Y.position.y, O.position = Y.position, O.positionAbsolute = Y.positionAbsolute, O;
        }), !S)
          return;
        V(c.current, !0, !0), a(!0);
        const D = o ? F : zs(B);
        if (D && w.current) {
          const [O, j] = Ms({
            nodeId: o,
            dragItems: c.current,
            nodeInternals: I
          });
          D(w.current, O, j);
        }
      }, C = () => {
        if (!m.current)
          return;
        const [P, A] = bh(x.current, m.current);
        if (P !== 0 || A !== 0) {
          const { transform: I, panBy: F } = s.getState();
          f.current.x = (f.current.x ?? 0) - P / I[2], f.current.y = (f.current.y ?? 0) - A / I[2], F({ x: P, y: A }) && E(f.current);
        }
        d.current = requestAnimationFrame(C);
      }, M = (P) => {
        var L;
        const { nodeInternals: A, multiSelectionActive: I, nodesDraggable: F, unselectNodesAndEdges: B, onNodeDragStart: V, onSelectionDragStart: v } = s.getState();
        p.current = !0;
        const $ = o ? V : zs(v);
        (!l || !i) && !I && o && ((L = A.get(o)) != null && L.selected || B()), o && i && l && Ou({
          id: o,
          store: s,
          nodeRef: e
        });
        const k = g(P);
        if (f.current = k, c.current = qS(A, F, k, o), $ && c.current) {
          const [N, S] = Ms({
            nodeId: o,
            dragItems: c.current,
            nodeInternals: A
          });
          $(P.sourceEvent, N, S);
        }
      };
      if (t)
        y.on(".drag", null);
      else {
        const P = aw().on("start", (A) => {
          const { domNode: I, nodeDragThreshold: F } = s.getState();
          F === 0 && M(A), h.current = !1;
          const B = g(A);
          f.current = B, m.current = (I == null ? void 0 : I.getBoundingClientRect()) || null, x.current = hn(A.sourceEvent, m.current);
        }).on("drag", (A) => {
          var V, v;
          const I = g(A), { autoPanOnNodeDrag: F, nodeDragThreshold: B } = s.getState();
          if (A.sourceEvent.type === "touchmove" && A.sourceEvent.touches.length > 1 && (h.current = !0), !h.current) {
            if (!_.current && p.current && F && (_.current = !0, C()), !p.current) {
              const $ = I.xSnapped - (((V = f == null ? void 0 : f.current) == null ? void 0 : V.x) ?? 0), k = I.ySnapped - (((v = f == null ? void 0 : f.current) == null ? void 0 : v.y) ?? 0);
              Math.sqrt($ * $ + k * k) > B && M(A);
            }
            (f.current.x !== I.xSnapped || f.current.y !== I.ySnapped) && c.current && p.current && (w.current = A.sourceEvent, x.current = hn(A.sourceEvent, m.current), E(I));
          }
        }).on("end", (A) => {
          if (!(!p.current || h.current) && (a(!1), _.current = !1, p.current = !1, cancelAnimationFrame(d.current), c.current)) {
            const { updateNodePositions: I, nodeInternals: F, onNodeDragStop: B, onSelectionDragStop: V } = s.getState(), v = o ? B : zs(V);
            if (I(c.current, !1, !1), v) {
              const [$, k] = Ms({
                nodeId: o,
                dragItems: c.current,
                nodeInternals: F
              });
              v(A.sourceEvent, $, k);
            }
          }
        }).filter((A) => {
          const I = A.target;
          return !A.button && (!n || !Yf(I, `.${n}`, e)) && (!r || Yf(I, r, e));
        });
        return y.call(P), () => {
          y.on(".drag", null);
        };
      }
    }
  }, [
    e,
    t,
    n,
    r,
    i,
    s,
    o,
    l,
    g
  ]), u;
}
function Rm() {
  const e = Se();
  return T.useCallback((n) => {
    const { nodeInternals: r, nodeExtent: o, updateNodePositions: i, getNodes: l, snapToGrid: s, snapGrid: u, onError: a, nodesDraggable: c } = e.getState(), f = l().filter((h) => h.selected && (h.draggable || c && typeof h.draggable > "u")), d = s ? u[0] : 5, m = s ? u[1] : 5, x = n.isShiftPressed ? 4 : 1, w = n.x * d * x, _ = n.y * m * x, p = f.map((h) => {
      if (h.positionAbsolute) {
        const g = { x: h.positionAbsolute.x + w, y: h.positionAbsolute.y + _ };
        s && (g.x = u[0] * Math.round(g.x / u[0]), g.y = u[1] * Math.round(g.y / u[1]));
        const { positionAbsolute: y, position: E } = Pm(h, g, r, o, void 0, a);
        h.position = E, h.positionAbsolute = y;
      }
      return h;
    });
    i(p, !0, !1);
  }, []);
}
const kr = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};
var no = (e) => {
  const t = ({ id: n, type: r, data: o, xPos: i, yPos: l, xPosOrigin: s, yPosOrigin: u, selected: a, onClick: c, onMouseEnter: f, onMouseMove: d, onMouseLeave: m, onContextMenu: x, onDoubleClick: w, style: _, className: p, isDraggable: h, isSelectable: g, isConnectable: y, isFocusable: E, selectNodesOnDrag: C, sourcePosition: M, targetPosition: P, hidden: A, resizeObserver: I, dragHandle: F, zIndex: B, isParent: V, noDragClassName: v, noPanClassName: $, initialized: k, disableKeyboardA11y: L, ariaLabel: N, rfId: S, hasHandleBounds: z }) => {
    const D = Se(), O = T.useRef(null), j = T.useRef(null), U = T.useRef(M), Y = T.useRef(P), K = T.useRef(r), G = g || h || c || f || d || m, ne = Rm(), te = to(n, D.getState, f), ee = to(n, D.getState, d), Ne = to(n, D.getState, m), ve = to(n, D.getState, x), Le = to(n, D.getState, w), Pe = (oe) => {
      const { nodeDragThreshold: Q } = D.getState();
      if (g && (!C || !h || Q > 0) && Ou({
        id: n,
        store: D,
        nodeRef: O
      }), c) {
        const Oe = D.getState().nodeInternals.get(n);
        Oe && c(oe, { ...Oe });
      }
    }, me = (oe) => {
      if (!Ru(oe) && !L)
        if (rm.includes(oe.key) && g) {
          const Q = oe.key === "Escape";
          Ou({
            id: n,
            store: D,
            unselect: Q,
            nodeRef: O
          });
        } else h && a && Object.prototype.hasOwnProperty.call(kr, oe.key) && (D.setState({
          ariaLiveMessage: `Moved selected node ${oe.key.replace("Arrow", "").toLowerCase()}. New position, x: ${~~i}, y: ${~~l}`
        }), ne({
          x: kr[oe.key].x,
          y: kr[oe.key].y,
          isShiftPressed: oe.shiftKey
        }));
    };
    T.useEffect(() => () => {
      j.current && (I == null || I.unobserve(j.current), j.current = null);
    }, []), T.useEffect(() => {
      if (O.current && !A) {
        const oe = O.current;
        (!k || !z || j.current !== oe) && (j.current && (I == null || I.unobserve(j.current)), I == null || I.observe(oe), j.current = oe);
      }
    }, [A, k, z]), T.useEffect(() => {
      const oe = K.current !== r, Q = U.current !== M, Oe = Y.current !== P;
      O.current && (oe || Q || Oe) && (oe && (K.current = r), Q && (U.current = M), Oe && (Y.current = P), D.getState().updateNodeDimensions([{ id: n, nodeElement: O.current, forceUpdate: !0 }]));
    }, [n, r, M, P]);
    const Ke = $m({
      nodeRef: O,
      disabled: A || !h,
      noDragClassName: v,
      handleSelector: F,
      nodeId: n,
      isSelectable: g,
      selectNodesOnDrag: C
    });
    return A ? null : R.createElement(
      "div",
      { className: Te([
        "react-flow__node",
        `react-flow__node-${r}`,
        {
          // this is overwritable by passing `nopan` as a class name
          [$]: h
        },
        p,
        {
          selected: a,
          selectable: g,
          parent: V,
          dragging: Ke
        }
      ]), ref: O, style: {
        zIndex: B,
        transform: `translate(${s}px,${u}px)`,
        pointerEvents: G ? "all" : "none",
        visibility: k ? "visible" : "hidden",
        ..._
      }, "data-id": n, "data-testid": `rf__node-${n}`, onMouseEnter: te, onMouseMove: ee, onMouseLeave: Ne, onContextMenu: ve, onClick: Pe, onDoubleClick: Le, onKeyDown: E ? me : void 0, tabIndex: E ? 0 : void 0, role: E ? "button" : void 0, "aria-describedby": L ? void 0 : `${Em}-${S}`, "aria-label": N },
      R.createElement(
        dS,
        { value: n },
        R.createElement(e, { id: n, data: o, type: r, xPos: i, yPos: l, selected: a, isConnectable: y, sourcePosition: M, targetPosition: P, dragging: Ke, dragHandle: F, zIndex: B })
      )
    );
  };
  return t.displayName = "NodeWrapper", T.memo(t);
};
const e_ = (e) => {
  const t = e.getNodes().filter((n) => n.selected);
  return {
    ...jl(t, e.nodeOrigin),
    transformString: `translate(${e.transform[0]}px,${e.transform[1]}px) scale(${e.transform[2]})`,
    userSelectionActive: e.userSelectionActive
  };
};
function t_({ onSelectionContextMenu: e, noPanClassName: t, disableKeyboardA11y: n }) {
  const r = Se(), { width: o, height: i, x: l, y: s, transformString: u, userSelectionActive: a } = le(e_, ke), c = Rm(), f = T.useRef(null);
  if (T.useEffect(() => {
    var x;
    n || (x = f.current) == null || x.focus({
      preventScroll: !0
    });
  }, [n]), $m({
    nodeRef: f
  }), a || !o || !i)
    return null;
  const d = e ? (x) => {
    const w = r.getState().getNodes().filter((_) => _.selected);
    e(x, w);
  } : void 0, m = (x) => {
    Object.prototype.hasOwnProperty.call(kr, x.key) && c({
      x: kr[x.key].x,
      y: kr[x.key].y,
      isShiftPressed: x.shiftKey
    });
  };
  return R.createElement(
    "div",
    { className: Te(["react-flow__nodesselection", "react-flow__container", t]), style: {
      transform: u
    } },
    R.createElement("div", { ref: f, className: "react-flow__nodesselection-rect", onContextMenu: d, tabIndex: n ? void 0 : -1, onKeyDown: n ? void 0 : m, style: {
      width: o,
      height: i,
      top: s,
      left: l
    } })
  );
}
var n_ = T.memo(t_);
const r_ = (e) => e.nodesSelectionActive, Am = ({ children: e, onPaneClick: t, onPaneMouseEnter: n, onPaneMouseMove: r, onPaneMouseLeave: o, onPaneContextMenu: i, onPaneScroll: l, deleteKeyCode: s, onMove: u, onMoveStart: a, onMoveEnd: c, selectionKeyCode: f, selectionOnDrag: d, selectionMode: m, onSelectionStart: x, onSelectionEnd: w, multiSelectionKeyCode: _, panActivationKeyCode: p, zoomActivationKeyCode: h, elementsSelectable: g, zoomOnScroll: y, zoomOnPinch: E, panOnScroll: C, panOnScrollSpeed: M, panOnScrollMode: P, zoomOnDoubleClick: A, panOnDrag: I, defaultViewport: F, translateExtent: B, minZoom: V, maxZoom: v, preventScrolling: $, onSelectionContextMenu: k, noWheelClassName: L, noPanClassName: N, disableKeyboardA11y: S }) => {
  const z = le(r_), D = Yo(f), O = Yo(p), j = O || I, U = O || C, Y = D || d && j !== !0;
  return BS({ deleteKeyCode: s, multiSelectionKeyCode: _ }), R.createElement(
    YS,
    { onMove: u, onMoveStart: a, onMoveEnd: c, onPaneContextMenu: i, elementsSelectable: g, zoomOnScroll: y, zoomOnPinch: E, panOnScroll: U, panOnScrollSpeed: M, panOnScrollMode: P, zoomOnDoubleClick: A, panOnDrag: !D && j, defaultViewport: F, translateExtent: B, minZoom: V, maxZoom: v, zoomActivationKeyCode: h, preventScrolling: $, noWheelClassName: L, noPanClassName: N },
    R.createElement(
      zm,
      { onSelectionStart: x, onSelectionEnd: w, onPaneClick: t, onPaneMouseEnter: n, onPaneMouseMove: r, onPaneMouseLeave: o, onPaneContextMenu: i, onPaneScroll: l, panOnDrag: j, isSelecting: !!Y, selectionMode: m },
      e,
      z && R.createElement(n_, { onSelectionContextMenu: k, noPanClassName: N, disableKeyboardA11y: S })
    )
  );
};
Am.displayName = "FlowRenderer";
var o_ = T.memo(Am);
function i_(e) {
  return le(T.useCallback((n) => e ? cm(n.nodeInternals, { x: 0, y: 0, width: n.width, height: n.height }, n.transform, !0) : n.getNodes(), [e]));
}
function l_(e) {
  const t = {
    input: no(e.input || wm),
    default: no(e.default || Lu),
    output: no(e.output || Sm),
    group: no(e.group || Ka)
  }, n = {}, r = Object.keys(e).filter((o) => !["input", "default", "output", "group"].includes(o)).reduce((o, i) => (o[i] = no(e[i] || Lu), o), n);
  return {
    ...t,
    ...r
  };
}
const s_ = ({ x: e, y: t, width: n, height: r, origin: o }) => !n || !r ? { x: e, y: t } : o[0] < 0 || o[1] < 0 || o[0] > 1 || o[1] > 1 ? { x: e, y: t } : {
  x: e - n * o[0],
  y: t - r * o[1]
}, u_ = (e) => ({
  nodesDraggable: e.nodesDraggable,
  nodesConnectable: e.nodesConnectable,
  nodesFocusable: e.nodesFocusable,
  elementsSelectable: e.elementsSelectable,
  updateNodeDimensions: e.updateNodeDimensions,
  onError: e.onError
}), Im = (e) => {
  const { nodesDraggable: t, nodesConnectable: n, nodesFocusable: r, elementsSelectable: o, updateNodeDimensions: i, onError: l } = le(u_, ke), s = i_(e.onlyRenderVisibleElements), u = T.useRef(), a = T.useMemo(() => {
    if (typeof ResizeObserver > "u")
      return null;
    const c = new ResizeObserver((f) => {
      const d = f.map((m) => ({
        id: m.target.getAttribute("data-id"),
        nodeElement: m.target,
        forceUpdate: !0
      }));
      i(d);
    });
    return u.current = c, c;
  }, []);
  return T.useEffect(() => () => {
    var c;
    (c = u == null ? void 0 : u.current) == null || c.disconnect();
  }, []), R.createElement("div", { className: "react-flow__nodes", style: Za }, s.map((c) => {
    var E, C, M;
    let f = c.type || "default";
    e.nodeTypes[f] || (l == null || l("003", Xt.error003(f)), f = "default");
    const d = e.nodeTypes[f] || e.nodeTypes.default, m = !!(c.draggable || t && typeof c.draggable > "u"), x = !!(c.selectable || o && typeof c.selectable > "u"), w = !!(c.connectable || n && typeof c.connectable > "u"), _ = !!(c.focusable || r && typeof c.focusable > "u"), p = e.nodeExtent ? Ua(c.positionAbsolute, e.nodeExtent) : c.positionAbsolute, h = (p == null ? void 0 : p.x) ?? 0, g = (p == null ? void 0 : p.y) ?? 0, y = s_({
      x: h,
      y: g,
      width: c.width ?? 0,
      height: c.height ?? 0,
      origin: e.nodeOrigin
    });
    return R.createElement(d, { key: c.id, id: c.id, className: c.className, style: c.style, type: f, data: c.data, sourcePosition: c.sourcePosition || X.Bottom, targetPosition: c.targetPosition || X.Top, hidden: c.hidden, xPos: h, yPos: g, xPosOrigin: y.x, yPosOrigin: y.y, selectNodesOnDrag: e.selectNodesOnDrag, onClick: e.onNodeClick, onMouseEnter: e.onNodeMouseEnter, onMouseMove: e.onNodeMouseMove, onMouseLeave: e.onNodeMouseLeave, onContextMenu: e.onNodeContextMenu, onDoubleClick: e.onNodeDoubleClick, selected: !!c.selected, isDraggable: m, isSelectable: x, isConnectable: w, isFocusable: _, resizeObserver: a, dragHandle: c.dragHandle, zIndex: ((E = c[he]) == null ? void 0 : E.z) ?? 0, isParent: !!((C = c[he]) != null && C.isParent), noDragClassName: e.noDragClassName, noPanClassName: e.noPanClassName, initialized: !!c.width && !!c.height, rfId: e.rfId, disableKeyboardA11y: e.disableKeyboardA11y, ariaLabel: c.ariaLabel, hasHandleBounds: !!((M = c[he]) != null && M.handleBounds) });
  }));
};
Im.displayName = "NodeRenderer";
var a_ = T.memo(Im);
const c_ = (e, t, n) => n === X.Left ? e - t : n === X.Right ? e + t : e, f_ = (e, t, n) => n === X.Top ? e - t : n === X.Bottom ? e + t : e, Qf = "react-flow__edgeupdater", Kf = ({ position: e, centerX: t, centerY: n, radius: r = 10, onMouseDown: o, onMouseEnter: i, onMouseOut: l, type: s }) => R.createElement("circle", { onMouseDown: o, onMouseEnter: i, onMouseOut: l, className: Te([Qf, `${Qf}-${s}`]), cx: c_(t, r, e), cy: f_(n, r, e), r, stroke: "transparent", fill: "transparent" }), d_ = () => !0;
var nr = (e) => {
  const t = ({ id: n, className: r, type: o, data: i, onClick: l, onEdgeDoubleClick: s, selected: u, animated: a, label: c, labelStyle: f, labelShowBg: d, labelBgStyle: m, labelBgPadding: x, labelBgBorderRadius: w, style: _, source: p, target: h, sourceX: g, sourceY: y, targetX: E, targetY: C, sourcePosition: M, targetPosition: P, elementsSelectable: A, hidden: I, sourceHandleId: F, targetHandleId: B, onContextMenu: V, onMouseEnter: v, onMouseMove: $, onMouseLeave: k, reconnectRadius: L, onReconnect: N, onReconnectStart: S, onReconnectEnd: z, markerEnd: D, markerStart: O, rfId: j, ariaLabel: U, isFocusable: Y, isReconnectable: K, pathOptions: G, interactionWidth: ne, disableKeyboardA11y: te }) => {
    const ee = T.useRef(null), [Ne, ve] = T.useState(!1), [Le, Pe] = T.useState(!1), me = Se(), Ke = T.useMemo(() => `url('#${Iu(O, j)}')`, [O, j]), oe = T.useMemo(() => `url('#${Iu(D, j)}')`, [D, j]);
    if (I)
      return null;
    const Q = ($e) => {
      var _t;
      const { edges: ct, addSelectedEdges: _n, unselectNodesAndEdges: En, multiSelectionActive: kn } = me.getState(), Rt = ct.find((Ur) => Ur.id === n);
      Rt && (A && (me.setState({ nodesSelectionActive: !1 }), Rt.selected && kn ? (En({ nodes: [], edges: [Rt] }), (_t = ee.current) == null || _t.blur()) : _n([n])), l && l($e, Rt));
    }, Oe = eo(n, me.getState, s), Pt = eo(n, me.getState, V), Vr = eo(n, me.getState, v), Qn = eo(n, me.getState, $), Kn = eo(n, me.getState, k), $t = ($e, ct) => {
      if ($e.button !== 0)
        return;
      const { edges: _n, isValidConnection: En } = me.getState(), kn = ct ? h : p, Rt = (ct ? B : F) || null, _t = ct ? "target" : "source", Ur = En || d_, Wl = ct, jr = _n.find((Nn) => Nn.id === n);
      Pe(!0), S == null || S($e, jr, _t);
      const Yl = (Nn) => {
        Pe(!1), z == null || z(Nn, jr, _t);
      };
      mm({
        event: $e,
        handleId: Rt,
        nodeId: kn,
        onConnect: (Nn) => N == null ? void 0 : N(jr, Nn),
        isTarget: Wl,
        getState: me.getState,
        setState: me.setState,
        isValidConnection: Ur,
        edgeUpdaterType: _t,
        onReconnectEnd: Yl
      });
    }, Gn = ($e) => $t($e, !0), xn = ($e) => $t($e, !1), Sn = () => ve(!0), Zn = () => ve(!1), qn = !A && !l, Br = ($e) => {
      var ct;
      if (!te && rm.includes($e.key) && A) {
        const { unselectNodesAndEdges: _n, addSelectedEdges: En, edges: kn } = me.getState();
        $e.key === "Escape" ? ((ct = ee.current) == null || ct.blur(), _n({ edges: [kn.find((_t) => _t.id === n)] })) : En([n]);
      }
    };
    return R.createElement(
      "g",
      { className: Te([
        "react-flow__edge",
        `react-flow__edge-${o}`,
        r,
        { selected: u, animated: a, inactive: qn, updating: Ne }
      ]), onClick: Q, onDoubleClick: Oe, onContextMenu: Pt, onMouseEnter: Vr, onMouseMove: Qn, onMouseLeave: Kn, onKeyDown: Y ? Br : void 0, tabIndex: Y ? 0 : void 0, role: Y ? "button" : "img", "data-testid": `rf__edge-${n}`, "aria-label": U === null ? void 0 : U || `Edge from ${p} to ${h}`, "aria-describedby": Y ? `${km}-${j}` : void 0, ref: ee },
      !Le && R.createElement(e, { id: n, source: p, target: h, selected: u, animated: a, label: c, labelStyle: f, labelShowBg: d, labelBgStyle: m, labelBgPadding: x, labelBgBorderRadius: w, data: i, style: _, sourceX: g, sourceY: y, targetX: E, targetY: C, sourcePosition: M, targetPosition: P, sourceHandleId: F, targetHandleId: B, markerStart: Ke, markerEnd: oe, pathOptions: G, interactionWidth: ne }),
      K && R.createElement(
        R.Fragment,
        null,
        (K === "source" || K === !0) && R.createElement(Kf, { position: M, centerX: g, centerY: y, radius: L, onMouseDown: Gn, onMouseEnter: Sn, onMouseOut: Zn, type: "source" }),
        (K === "target" || K === !0) && R.createElement(Kf, { position: P, centerX: E, centerY: C, radius: L, onMouseDown: xn, onMouseEnter: Sn, onMouseOut: Zn, type: "target" })
      )
    );
  };
  return t.displayName = "EdgeWrapper", T.memo(t);
};
function p_(e) {
  const t = {
    default: nr(e.default || wl),
    straight: nr(e.bezier || Ya),
    step: nr(e.step || Wa),
    smoothstep: nr(e.step || Ul),
    simplebezier: nr(e.simplebezier || ja)
  }, n = {}, r = Object.keys(e).filter((o) => !["default", "bezier"].includes(o)).reduce((o, i) => (o[i] = nr(e[i] || wl), o), n);
  return {
    ...t,
    ...r
  };
}
function Gf(e, t, n = null) {
  const r = ((n == null ? void 0 : n.x) || 0) + t.x, o = ((n == null ? void 0 : n.y) || 0) + t.y, i = (n == null ? void 0 : n.width) || t.width, l = (n == null ? void 0 : n.height) || t.height;
  switch (e) {
    case X.Top:
      return {
        x: r + i / 2,
        y: o
      };
    case X.Right:
      return {
        x: r + i,
        y: o + l / 2
      };
    case X.Bottom:
      return {
        x: r + i / 2,
        y: o + l
      };
    case X.Left:
      return {
        x: r,
        y: o + l / 2
      };
  }
}
function Zf(e, t) {
  return e ? e.length === 1 || !t ? e[0] : t && e.find((n) => n.id === t) || null : null;
}
const h_ = (e, t, n, r, o, i) => {
  const l = Gf(n, e, t), s = Gf(i, r, o);
  return {
    sourceX: l.x,
    sourceY: l.y,
    targetX: s.x,
    targetY: s.y
  };
};
function m_({ sourcePos: e, targetPos: t, sourceWidth: n, sourceHeight: r, targetWidth: o, targetHeight: i, width: l, height: s, transform: u }) {
  const a = {
    x: Math.min(e.x, t.x),
    y: Math.min(e.y, t.y),
    x2: Math.max(e.x + n, t.x + o),
    y2: Math.max(e.y + r, t.y + i)
  };
  a.x === a.x2 && (a.x2 += 1), a.y === a.y2 && (a.y2 += 1);
  const c = Uo({
    x: (0 - u[0]) / u[2],
    y: (0 - u[1]) / u[2],
    width: l / u[2],
    height: s / u[2]
  }), f = Math.max(0, Math.min(c.x2, a.x2) - Math.max(c.x, a.x)), d = Math.max(0, Math.min(c.y2, a.y2) - Math.max(c.y, a.y));
  return Math.ceil(f * d) > 0;
}
function qf(e) {
  var r, o, i, l, s;
  const t = ((r = e == null ? void 0 : e[he]) == null ? void 0 : r.handleBounds) || null, n = t && (e == null ? void 0 : e.width) && (e == null ? void 0 : e.height) && typeof ((o = e == null ? void 0 : e.positionAbsolute) == null ? void 0 : o.x) < "u" && typeof ((i = e == null ? void 0 : e.positionAbsolute) == null ? void 0 : i.y) < "u";
  return [
    {
      x: ((l = e == null ? void 0 : e.positionAbsolute) == null ? void 0 : l.x) || 0,
      y: ((s = e == null ? void 0 : e.positionAbsolute) == null ? void 0 : s.y) || 0,
      width: (e == null ? void 0 : e.width) || 0,
      height: (e == null ? void 0 : e.height) || 0
    },
    t,
    !!n
  ];
}
const g_ = [{ level: 0, isMaxLevel: !0, edges: [] }];
function y_(e, t, n = !1) {
  let r = -1;
  const o = e.reduce((l, s) => {
    var c, f;
    const u = lt(s.zIndex);
    let a = u ? s.zIndex : 0;
    if (n) {
      const d = t.get(s.target), m = t.get(s.source), x = s.selected || (d == null ? void 0 : d.selected) || (m == null ? void 0 : m.selected), w = Math.max(((c = m == null ? void 0 : m[he]) == null ? void 0 : c.z) || 0, ((f = d == null ? void 0 : d[he]) == null ? void 0 : f.z) || 0, 1e3);
      a = (u ? s.zIndex : 0) + (x ? w : 0);
    }
    return l[a] ? l[a].push(s) : l[a] = [s], r = a > r ? a : r, l;
  }, {}), i = Object.entries(o).map(([l, s]) => {
    const u = +l;
    return {
      edges: s,
      level: u,
      isMaxLevel: u === r
    };
  });
  return i.length === 0 ? g_ : i;
}
function v_(e, t, n) {
  const r = le(T.useCallback((o) => e ? o.edges.filter((i) => {
    const l = t.get(i.source), s = t.get(i.target);
    return (l == null ? void 0 : l.width) && (l == null ? void 0 : l.height) && (s == null ? void 0 : s.width) && (s == null ? void 0 : s.height) && m_({
      sourcePos: l.positionAbsolute || { x: 0, y: 0 },
      targetPos: s.positionAbsolute || { x: 0, y: 0 },
      sourceWidth: l.width,
      sourceHeight: l.height,
      targetWidth: s.width,
      targetHeight: s.height,
      width: o.width,
      height: o.height,
      transform: o.transform
    });
  }) : o.edges, [e, t]));
  return y_(r, t, n);
}
const w_ = ({ color: e = "none", strokeWidth: t = 1 }) => R.createElement("polyline", { style: {
  stroke: e,
  strokeWidth: t
}, strokeLinecap: "round", strokeLinejoin: "round", fill: "none", points: "-5,-4 0,0 -5,4" }), x_ = ({ color: e = "none", strokeWidth: t = 1 }) => R.createElement("polyline", { style: {
  stroke: e,
  fill: e,
  strokeWidth: t
}, strokeLinecap: "round", strokeLinejoin: "round", points: "-5,-4 0,0 -5,4 -5,-4" }), Jf = {
  [Wo.Arrow]: w_,
  [Wo.ArrowClosed]: x_
};
function S_(e) {
  const t = Se();
  return T.useMemo(() => {
    var o, i;
    return Object.prototype.hasOwnProperty.call(Jf, e) ? Jf[e] : ((i = (o = t.getState()).onError) == null || i.call(o, "009", Xt.error009(e)), null);
  }, [e]);
}
const __ = ({ id: e, type: t, color: n, width: r = 12.5, height: o = 12.5, markerUnits: i = "strokeWidth", strokeWidth: l, orient: s = "auto-start-reverse" }) => {
  const u = S_(t);
  return u ? R.createElement(
    "marker",
    { className: "react-flow__arrowhead", id: e, markerWidth: `${r}`, markerHeight: `${o}`, viewBox: "-10 -10 20 20", markerUnits: i, orient: s, refX: "0", refY: "0" },
    R.createElement(u, { color: n, strokeWidth: l })
  ) : null;
}, E_ = ({ defaultColor: e, rfId: t }) => (n) => {
  const r = [];
  return n.edges.reduce((o, i) => ([i.markerStart, i.markerEnd].forEach((l) => {
    if (l && typeof l == "object") {
      const s = Iu(l, t);
      r.includes(s) || (o.push({ id: s, color: l.color || e, ...l }), r.push(s));
    }
  }), o), []).sort((o, i) => o.id.localeCompare(i.id));
}, Dm = ({ defaultColor: e, rfId: t }) => {
  const n = le(
    T.useCallback(E_({ defaultColor: e, rfId: t }), [e, t]),
    // the id includes all marker options, so we just need to look at that part of the marker
    (r, o) => !(r.length !== o.length || r.some((i, l) => i.id !== o[l].id))
  );
  return R.createElement("defs", null, n.map((r) => R.createElement(__, { id: r.id, key: r.id, type: r.type, color: r.color, width: r.width, height: r.height, markerUnits: r.markerUnits, strokeWidth: r.strokeWidth, orient: r.orient })));
};
Dm.displayName = "MarkerDefinitions";
var k_ = T.memo(Dm);
const N_ = (e) => ({
  nodesConnectable: e.nodesConnectable,
  edgesFocusable: e.edgesFocusable,
  edgesUpdatable: e.edgesUpdatable,
  elementsSelectable: e.elementsSelectable,
  width: e.width,
  height: e.height,
  connectionMode: e.connectionMode,
  nodeInternals: e.nodeInternals,
  onError: e.onError
}), Lm = ({ defaultMarkerColor: e, onlyRenderVisibleElements: t, elevateEdgesOnSelect: n, rfId: r, edgeTypes: o, noPanClassName: i, onEdgeContextMenu: l, onEdgeMouseEnter: s, onEdgeMouseMove: u, onEdgeMouseLeave: a, onEdgeClick: c, onEdgeDoubleClick: f, onReconnect: d, onReconnectStart: m, onReconnectEnd: x, reconnectRadius: w, children: _, disableKeyboardA11y: p }) => {
  const { edgesFocusable: h, edgesUpdatable: g, elementsSelectable: y, width: E, height: C, connectionMode: M, nodeInternals: P, onError: A } = le(N_, ke), I = v_(t, P, n);
  return E ? R.createElement(
    R.Fragment,
    null,
    I.map(({ level: F, edges: B, isMaxLevel: V }) => R.createElement(
      "svg",
      { key: F, style: { zIndex: F }, width: E, height: C, className: "react-flow__edges react-flow__container" },
      V && R.createElement(k_, { defaultColor: e, rfId: r }),
      R.createElement("g", null, B.map((v) => {
        const [$, k, L] = qf(P.get(v.source)), [N, S, z] = qf(P.get(v.target));
        if (!L || !z)
          return null;
        let D = v.type || "default";
        o[D] || (A == null || A("011", Xt.error011(D)), D = "default");
        const O = o[D] || o.default, j = M === Wn.Strict ? S.target : (S.target ?? []).concat(S.source ?? []), U = Zf(k.source, v.sourceHandle), Y = Zf(j, v.targetHandle), K = (U == null ? void 0 : U.position) || X.Bottom, G = (Y == null ? void 0 : Y.position) || X.Top, ne = !!(v.focusable || h && typeof v.focusable > "u"), te = v.reconnectable || v.updatable, ee = typeof d < "u" && (te || g && typeof te > "u");
        if (!U || !Y)
          return A == null || A("008", Xt.error008(U, v)), null;
        const { sourceX: Ne, sourceY: ve, targetX: Le, targetY: Pe } = h_($, U, K, N, Y, G);
        return R.createElement(O, { key: v.id, id: v.id, className: Te([v.className, i]), type: D, data: v.data, selected: !!v.selected, animated: !!v.animated, hidden: !!v.hidden, label: v.label, labelStyle: v.labelStyle, labelShowBg: v.labelShowBg, labelBgStyle: v.labelBgStyle, labelBgPadding: v.labelBgPadding, labelBgBorderRadius: v.labelBgBorderRadius, style: v.style, source: v.source, target: v.target, sourceHandleId: v.sourceHandle, targetHandleId: v.targetHandle, markerEnd: v.markerEnd, markerStart: v.markerStart, sourceX: Ne, sourceY: ve, targetX: Le, targetY: Pe, sourcePosition: K, targetPosition: G, elementsSelectable: y, onContextMenu: l, onMouseEnter: s, onMouseMove: u, onMouseLeave: a, onClick: c, onEdgeDoubleClick: f, onReconnect: d, onReconnectStart: m, onReconnectEnd: x, reconnectRadius: w, rfId: r, ariaLabel: v.ariaLabel, isFocusable: ne, isReconnectable: ee, pathOptions: "pathOptions" in v ? v.pathOptions : void 0, interactionWidth: v.interactionWidth, disableKeyboardA11y: p });
      }))
    )),
    _
  ) : null;
};
Lm.displayName = "EdgeRenderer";
var C_ = T.memo(Lm);
const M_ = (e) => `translate(${e.transform[0]}px,${e.transform[1]}px) scale(${e.transform[2]})`;
function z_({ children: e }) {
  const t = le(M_);
  return R.createElement("div", { className: "react-flow__viewport react-flow__container", style: { transform: t } }, e);
}
function T_(e) {
  const t = Ga(), n = T.useRef(!1);
  T.useEffect(() => {
    !n.current && t.viewportInitialized && e && (setTimeout(() => e(t), 1), n.current = !0);
  }, [e, t.viewportInitialized]);
}
const P_ = {
  [X.Left]: X.Right,
  [X.Right]: X.Left,
  [X.Top]: X.Bottom,
  [X.Bottom]: X.Top
}, Om = ({ nodeId: e, handleType: t, style: n, type: r = nn.Bezier, CustomComponent: o, connectionStatus: i }) => {
  var C, M, P;
  const { fromNode: l, handleId: s, toX: u, toY: a, connectionMode: c } = le(T.useCallback((A) => ({
    fromNode: A.nodeInternals.get(e),
    handleId: A.connectionHandleId,
    toX: (A.connectionPosition.x - A.transform[0]) / A.transform[2],
    toY: (A.connectionPosition.y - A.transform[1]) / A.transform[2],
    connectionMode: A.connectionMode
  }), [e]), ke), f = (C = l == null ? void 0 : l[he]) == null ? void 0 : C.handleBounds;
  let d = f == null ? void 0 : f[t];
  if (c === Wn.Loose && (d = d || (f == null ? void 0 : f[t === "source" ? "target" : "source"])), !l || !d)
    return null;
  const m = s ? d.find((A) => A.id === s) : d[0], x = m ? m.x + m.width / 2 : (l.width ?? 0) / 2, w = m ? m.y + m.height / 2 : l.height ?? 0, _ = (((M = l.positionAbsolute) == null ? void 0 : M.x) ?? 0) + x, p = (((P = l.positionAbsolute) == null ? void 0 : P.y) ?? 0) + w, h = m == null ? void 0 : m.position, g = h ? P_[h] : null;
  if (!h || !g)
    return null;
  if (o)
    return R.createElement(o, { connectionLineType: r, connectionLineStyle: n, fromNode: l, fromHandle: m, fromX: _, fromY: p, toX: u, toY: a, fromPosition: h, toPosition: g, connectionStatus: i });
  let y = "";
  const E = {
    sourceX: _,
    sourceY: p,
    sourcePosition: h,
    targetX: u,
    targetY: a,
    targetPosition: g
  };
  return r === nn.Bezier ? [y] = um(E) : r === nn.Step ? [y] = Au({
    ...E,
    borderRadius: 0
  }) : r === nn.SmoothStep ? [y] = Au(E) : r === nn.SimpleBezier ? [y] = sm(E) : y = `M${_},${p} ${u},${a}`, R.createElement("path", { d: y, fill: "none", className: "react-flow__connection-path", style: n });
};
Om.displayName = "ConnectionLine";
const $_ = (e) => ({
  nodeId: e.connectionNodeId,
  handleType: e.connectionHandleType,
  nodesConnectable: e.nodesConnectable,
  connectionStatus: e.connectionStatus,
  width: e.width,
  height: e.height
});
function R_({ containerStyle: e, style: t, type: n, component: r }) {
  const { nodeId: o, handleType: i, nodesConnectable: l, width: s, height: u, connectionStatus: a } = le($_, ke);
  return !(o && i && s && l) ? null : R.createElement(
    "svg",
    { style: e, width: s, height: u, className: "react-flow__edges react-flow__connectionline react-flow__container" },
    R.createElement(
      "g",
      { className: Te(["react-flow__connection", a]) },
      R.createElement(Om, { nodeId: o, handleType: i, style: t, type: n, CustomComponent: r, connectionStatus: a })
    )
  );
}
function bf(e, t) {
  return T.useRef(null), Se(), T.useMemo(() => t(e), [e]);
}
const Fm = ({ nodeTypes: e, edgeTypes: t, onMove: n, onMoveStart: r, onMoveEnd: o, onInit: i, onNodeClick: l, onEdgeClick: s, onNodeDoubleClick: u, onEdgeDoubleClick: a, onNodeMouseEnter: c, onNodeMouseMove: f, onNodeMouseLeave: d, onNodeContextMenu: m, onSelectionContextMenu: x, onSelectionStart: w, onSelectionEnd: _, connectionLineType: p, connectionLineStyle: h, connectionLineComponent: g, connectionLineContainerStyle: y, selectionKeyCode: E, selectionOnDrag: C, selectionMode: M, multiSelectionKeyCode: P, panActivationKeyCode: A, zoomActivationKeyCode: I, deleteKeyCode: F, onlyRenderVisibleElements: B, elementsSelectable: V, selectNodesOnDrag: v, defaultViewport: $, translateExtent: k, minZoom: L, maxZoom: N, preventScrolling: S, defaultMarkerColor: z, zoomOnScroll: D, zoomOnPinch: O, panOnScroll: j, panOnScrollSpeed: U, panOnScrollMode: Y, zoomOnDoubleClick: K, panOnDrag: G, onPaneClick: ne, onPaneMouseEnter: te, onPaneMouseMove: ee, onPaneMouseLeave: Ne, onPaneScroll: ve, onPaneContextMenu: Le, onEdgeContextMenu: Pe, onEdgeMouseEnter: me, onEdgeMouseMove: Ke, onEdgeMouseLeave: oe, onReconnect: Q, onReconnectStart: Oe, onReconnectEnd: Pt, reconnectRadius: Vr, noDragClassName: Qn, noWheelClassName: Kn, noPanClassName: $t, elevateEdgesOnSelect: Gn, disableKeyboardA11y: xn, nodeOrigin: Sn, nodeExtent: Zn, rfId: qn }) => {
  const Br = bf(e, l_), $e = bf(t, p_);
  return T_(i), R.createElement(
    o_,
    { onPaneClick: ne, onPaneMouseEnter: te, onPaneMouseMove: ee, onPaneMouseLeave: Ne, onPaneContextMenu: Le, onPaneScroll: ve, deleteKeyCode: F, selectionKeyCode: E, selectionOnDrag: C, selectionMode: M, onSelectionStart: w, onSelectionEnd: _, multiSelectionKeyCode: P, panActivationKeyCode: A, zoomActivationKeyCode: I, elementsSelectable: V, onMove: n, onMoveStart: r, onMoveEnd: o, zoomOnScroll: D, zoomOnPinch: O, zoomOnDoubleClick: K, panOnScroll: j, panOnScrollSpeed: U, panOnScrollMode: Y, panOnDrag: G, defaultViewport: $, translateExtent: k, minZoom: L, maxZoom: N, onSelectionContextMenu: x, preventScrolling: S, noDragClassName: Qn, noWheelClassName: Kn, noPanClassName: $t, disableKeyboardA11y: xn },
    R.createElement(
      z_,
      null,
      R.createElement(
        C_,
        { edgeTypes: $e, onEdgeClick: s, onEdgeDoubleClick: a, onlyRenderVisibleElements: B, onEdgeContextMenu: Pe, onEdgeMouseEnter: me, onEdgeMouseMove: Ke, onEdgeMouseLeave: oe, onReconnect: Q, onReconnectStart: Oe, onReconnectEnd: Pt, reconnectRadius: Vr, defaultMarkerColor: z, noPanClassName: $t, elevateEdgesOnSelect: !!Gn, disableKeyboardA11y: xn, rfId: qn },
        R.createElement(R_, { style: h, type: p, component: g, containerStyle: y })
      ),
      R.createElement("div", { className: "react-flow__edgelabel-renderer" }),
      R.createElement(a_, { nodeTypes: Br, onNodeClick: l, onNodeDoubleClick: u, onNodeMouseEnter: c, onNodeMouseMove: f, onNodeMouseLeave: d, onNodeContextMenu: m, selectNodesOnDrag: v, onlyRenderVisibleElements: B, noPanClassName: $t, noDragClassName: Qn, disableKeyboardA11y: xn, nodeOrigin: Sn, nodeExtent: Zn, rfId: qn })
    )
  );
};
Fm.displayName = "GraphView";
var A_ = T.memo(Fm);
const Fu = [
  [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
  [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
], Gt = {
  rfId: "1",
  width: 0,
  height: 0,
  transform: [0, 0, 1],
  nodeInternals: /* @__PURE__ */ new Map(),
  edges: [],
  onNodesChange: null,
  onEdgesChange: null,
  hasDefaultNodes: !1,
  hasDefaultEdges: !1,
  d3Zoom: null,
  d3Selection: null,
  d3ZoomHandler: void 0,
  minZoom: 0.5,
  maxZoom: 2,
  translateExtent: Fu,
  nodeExtent: Fu,
  nodesSelectionActive: !1,
  userSelectionActive: !1,
  userSelectionRect: null,
  connectionNodeId: null,
  connectionHandleId: null,
  connectionHandleType: "source",
  connectionPosition: { x: 0, y: 0 },
  connectionStatus: null,
  connectionMode: Wn.Strict,
  domNode: null,
  paneDragging: !1,
  noPanClassName: "nopan",
  nodeOrigin: [0, 0],
  nodeDragThreshold: 0,
  snapGrid: [15, 15],
  snapToGrid: !1,
  nodesDraggable: !0,
  nodesConnectable: !0,
  nodesFocusable: !0,
  edgesFocusable: !0,
  edgesUpdatable: !0,
  elementsSelectable: !0,
  elevateNodesOnSelect: !0,
  fitViewOnInit: !1,
  fitViewOnInitDone: !1,
  fitViewOnInitOptions: void 0,
  onSelectionChange: [],
  multiSelectionActive: !1,
  connectionStartHandle: null,
  connectionEndHandle: null,
  connectionClickStartHandle: null,
  connectOnClick: !0,
  ariaLiveMessage: "",
  autoPanOnConnect: !0,
  autoPanOnNodeDrag: !0,
  connectionRadius: 20,
  onError: lS,
  isValidConnection: void 0
}, I_ = () => Sv((e, t) => ({
  ...Gt,
  setNodes: (n) => {
    const { nodeInternals: r, nodeOrigin: o, elevateNodesOnSelect: i } = t();
    e({ nodeInternals: Ns(n, r, o, i) });
  },
  getNodes: () => Array.from(t().nodeInternals.values()),
  setEdges: (n) => {
    const { defaultEdgeOptions: r = {} } = t();
    e({ edges: n.map((o) => ({ ...r, ...o })) });
  },
  setDefaultNodesAndEdges: (n, r) => {
    const o = typeof n < "u", i = typeof r < "u", l = o ? Ns(n, /* @__PURE__ */ new Map(), t().nodeOrigin, t().elevateNodesOnSelect) : /* @__PURE__ */ new Map();
    e({ nodeInternals: l, edges: i ? r : [], hasDefaultNodes: o, hasDefaultEdges: i });
  },
  updateNodeDimensions: (n) => {
    const { onNodesChange: r, nodeInternals: o, fitViewOnInit: i, fitViewOnInitDone: l, fitViewOnInitOptions: s, domNode: u, nodeOrigin: a } = t(), c = u == null ? void 0 : u.querySelector(".react-flow__viewport");
    if (!c)
      return;
    const f = window.getComputedStyle(c), { m22: d } = new window.DOMMatrixReadOnly(f.transform), m = n.reduce((w, _) => {
      const p = o.get(_.id);
      if (p != null && p.hidden)
        o.set(p.id, {
          ...p,
          [he]: {
            ...p[he],
            // we need to reset the handle bounds when the node is hidden
            // in order to force a new observation when the node is shown again
            handleBounds: void 0
          }
        });
      else if (p) {
        const h = Ba(_.nodeElement);
        !!(h.width && h.height && (p.width !== h.width || p.height !== h.height || _.forceUpdate)) && (o.set(p.id, {
          ...p,
          [he]: {
            ...p[he],
            handleBounds: {
              source: Xf(".source", _.nodeElement, d, a),
              target: Xf(".target", _.nodeElement, d, a)
            }
          },
          ...h
        }), w.push({
          id: p.id,
          type: "dimensions",
          dimensions: h
        }));
      }
      return w;
    }, []);
    Cm(o, a);
    const x = l || i && !l && Mm(t, { initial: !0, ...s });
    e({ nodeInternals: new Map(o), fitViewOnInitDone: x }), (m == null ? void 0 : m.length) > 0 && (r == null || r(m));
  },
  updateNodePositions: (n, r = !0, o = !1) => {
    const { triggerNodeChanges: i } = t(), l = n.map((s) => {
      const u = {
        id: s.id,
        type: "position",
        dragging: o
      };
      return r && (u.positionAbsolute = s.positionAbsolute, u.position = s.position), u;
    });
    i(l);
  },
  triggerNodeChanges: (n) => {
    const { onNodesChange: r, nodeInternals: o, hasDefaultNodes: i, nodeOrigin: l, getNodes: s, elevateNodesOnSelect: u } = t();
    if (n != null && n.length) {
      if (i) {
        const a = GS(n, s()), c = Ns(a, o, l, u);
        e({ nodeInternals: c });
      }
      r == null || r(n);
    }
  },
  addSelectedNodes: (n) => {
    const { multiSelectionActive: r, edges: o, getNodes: i } = t();
    let l, s = null;
    r ? l = n.map((u) => bt(u, !0)) : (l = mr(i(), n), s = mr(o, [])), ki({
      changedNodes: l,
      changedEdges: s,
      get: t,
      set: e
    });
  },
  addSelectedEdges: (n) => {
    const { multiSelectionActive: r, edges: o, getNodes: i } = t();
    let l, s = null;
    r ? l = n.map((u) => bt(u, !0)) : (l = mr(o, n), s = mr(i(), [])), ki({
      changedNodes: s,
      changedEdges: l,
      get: t,
      set: e
    });
  },
  unselectNodesAndEdges: ({ nodes: n, edges: r } = {}) => {
    const { edges: o, getNodes: i } = t(), l = n || i(), s = r || o, u = l.map((c) => (c.selected = !1, bt(c.id, !1))), a = s.map((c) => bt(c.id, !1));
    ki({
      changedNodes: u,
      changedEdges: a,
      get: t,
      set: e
    });
  },
  setMinZoom: (n) => {
    const { d3Zoom: r, maxZoom: o } = t();
    r == null || r.scaleExtent([n, o]), e({ minZoom: n });
  },
  setMaxZoom: (n) => {
    const { d3Zoom: r, minZoom: o } = t();
    r == null || r.scaleExtent([o, n]), e({ maxZoom: n });
  },
  setTranslateExtent: (n) => {
    var r;
    (r = t().d3Zoom) == null || r.translateExtent(n), e({ translateExtent: n });
  },
  resetSelectedElements: () => {
    const { edges: n, getNodes: r } = t(), i = r().filter((s) => s.selected).map((s) => bt(s.id, !1)), l = n.filter((s) => s.selected).map((s) => bt(s.id, !1));
    ki({
      changedNodes: i,
      changedEdges: l,
      get: t,
      set: e
    });
  },
  setNodeExtent: (n) => {
    const { nodeInternals: r } = t();
    r.forEach((o) => {
      o.positionAbsolute = Ua(o.position, n);
    }), e({
      nodeExtent: n,
      nodeInternals: new Map(r)
    });
  },
  panBy: (n) => {
    const { transform: r, width: o, height: i, d3Zoom: l, d3Selection: s, translateExtent: u } = t();
    if (!l || !s || !n.x && !n.y)
      return !1;
    const a = Vt.translate(r[0] + n.x, r[1] + n.y).scale(r[2]), c = [
      [0, 0],
      [o, i]
    ], f = l == null ? void 0 : l.constrain()(a, c, u);
    return l.transform(s, f), r[0] !== f.x || r[1] !== f.y || r[2] !== f.k;
  },
  cancelConnection: () => e({
    connectionNodeId: Gt.connectionNodeId,
    connectionHandleId: Gt.connectionHandleId,
    connectionHandleType: Gt.connectionHandleType,
    connectionStatus: Gt.connectionStatus,
    connectionStartHandle: Gt.connectionStartHandle,
    connectionEndHandle: Gt.connectionEndHandle
  }),
  reset: () => e({ ...Gt })
}), Object.is), Hm = ({ children: e }) => {
  const t = T.useRef(null);
  return t.current || (t.current = I_()), R.createElement(bx, { value: t.current }, e);
};
Hm.displayName = "ReactFlowProvider";
const Vm = ({ children: e }) => T.useContext(Bl) ? R.createElement(R.Fragment, null, e) : R.createElement(Hm, null, e);
Vm.displayName = "ReactFlowWrapper";
const D_ = {
  input: wm,
  default: Lu,
  output: Sm,
  group: Ka
}, L_ = {
  default: wl,
  straight: Ya,
  step: Wa,
  smoothstep: Ul,
  simplebezier: ja
}, O_ = [0, 0], F_ = [15, 15], H_ = { x: 0, y: 0, zoom: 1 }, V_ = {
  width: "100%",
  height: "100%",
  overflow: "hidden",
  position: "relative",
  zIndex: 0
}, Hu = T.forwardRef(({ nodes: e, edges: t, defaultNodes: n, defaultEdges: r, className: o, nodeTypes: i = D_, edgeTypes: l = L_, onNodeClick: s, onEdgeClick: u, onInit: a, onMove: c, onMoveStart: f, onMoveEnd: d, onConnect: m, onConnectStart: x, onConnectEnd: w, onClickConnectStart: _, onClickConnectEnd: p, onNodeMouseEnter: h, onNodeMouseMove: g, onNodeMouseLeave: y, onNodeContextMenu: E, onNodeDoubleClick: C, onNodeDragStart: M, onNodeDrag: P, onNodeDragStop: A, onNodesDelete: I, onEdgesDelete: F, onSelectionChange: B, onSelectionDragStart: V, onSelectionDrag: v, onSelectionDragStop: $, onSelectionContextMenu: k, onSelectionStart: L, onSelectionEnd: N, connectionMode: S = Wn.Strict, connectionLineType: z = nn.Bezier, connectionLineStyle: D, connectionLineComponent: O, connectionLineContainerStyle: j, deleteKeyCode: U = "Backspace", selectionKeyCode: Y = "Shift", selectionOnDrag: K = !1, selectionMode: G = jo.Full, panActivationKeyCode: ne = "Space", multiSelectionKeyCode: te = vl() ? "Meta" : "Control", zoomActivationKeyCode: ee = vl() ? "Meta" : "Control", snapToGrid: Ne = !1, snapGrid: ve = F_, onlyRenderVisibleElements: Le = !1, selectNodesOnDrag: Pe = !0, nodesDraggable: me, nodesConnectable: Ke, nodesFocusable: oe, nodeOrigin: Q = O_, edgesFocusable: Oe, edgesUpdatable: Pt, elementsSelectable: Vr, defaultViewport: Qn = H_, minZoom: Kn = 0.5, maxZoom: $t = 2, translateExtent: Gn = Fu, preventScrolling: xn = !0, nodeExtent: Sn, defaultMarkerColor: Zn = "#b1b1b7", zoomOnScroll: qn = !0, zoomOnPinch: Br = !0, panOnScroll: $e = !1, panOnScrollSpeed: ct = 0.5, panOnScrollMode: _n = An.Free, zoomOnDoubleClick: En = !0, panOnDrag: kn = !0, onPaneClick: Rt, onPaneMouseEnter: _t, onPaneMouseMove: Ur, onPaneMouseLeave: Wl, onPaneScroll: jr, onPaneContextMenu: Yl, children: qa, onEdgeContextMenu: Nn, onEdgeDoubleClick: Ym, onEdgeMouseEnter: Xm, onEdgeMouseMove: Qm, onEdgeMouseLeave: Km, onEdgeUpdate: Gm, onEdgeUpdateStart: Zm, onEdgeUpdateEnd: qm, onReconnect: Jm, onReconnectStart: bm, onReconnectEnd: e0, reconnectRadius: t0 = 10, edgeUpdaterRadius: n0 = 10, onNodesChange: r0, onEdgesChange: o0, noDragClassName: i0 = "nodrag", noWheelClassName: l0 = "nowheel", noPanClassName: Ja = "nopan", fitView: s0 = !1, fitViewOptions: u0, connectOnClick: a0 = !0, attributionPosition: c0, proOptions: f0, defaultEdgeOptions: d0, elevateNodesOnSelect: p0 = !0, elevateEdgesOnSelect: h0 = !1, disableKeyboardA11y: ba = !1, autoPanOnConnect: m0 = !0, autoPanOnNodeDrag: g0 = !0, connectionRadius: y0 = 20, isValidConnection: v0, onError: w0, style: x0, id: ec, nodeDragThreshold: S0, ..._0 }, E0) => {
  const Xl = ec || "1";
  return R.createElement(
    "div",
    { ..._0, style: { ...x0, ...V_ }, ref: E0, className: Te(["react-flow", o]), "data-testid": "rf__wrapper", id: ec },
    R.createElement(
      Vm,
      null,
      R.createElement(A_, { onInit: a, onMove: c, onMoveStart: f, onMoveEnd: d, onNodeClick: s, onEdgeClick: u, onNodeMouseEnter: h, onNodeMouseMove: g, onNodeMouseLeave: y, onNodeContextMenu: E, onNodeDoubleClick: C, nodeTypes: i, edgeTypes: l, connectionLineType: z, connectionLineStyle: D, connectionLineComponent: O, connectionLineContainerStyle: j, selectionKeyCode: Y, selectionOnDrag: K, selectionMode: G, deleteKeyCode: U, multiSelectionKeyCode: te, panActivationKeyCode: ne, zoomActivationKeyCode: ee, onlyRenderVisibleElements: Le, selectNodesOnDrag: Pe, defaultViewport: Qn, translateExtent: Gn, minZoom: Kn, maxZoom: $t, preventScrolling: xn, zoomOnScroll: qn, zoomOnPinch: Br, zoomOnDoubleClick: En, panOnScroll: $e, panOnScrollSpeed: ct, panOnScrollMode: _n, panOnDrag: kn, onPaneClick: Rt, onPaneMouseEnter: _t, onPaneMouseMove: Ur, onPaneMouseLeave: Wl, onPaneScroll: jr, onPaneContextMenu: Yl, onSelectionContextMenu: k, onSelectionStart: L, onSelectionEnd: N, onEdgeContextMenu: Nn, onEdgeDoubleClick: Ym, onEdgeMouseEnter: Xm, onEdgeMouseMove: Qm, onEdgeMouseLeave: Km, onReconnect: Jm ?? Gm, onReconnectStart: bm ?? Zm, onReconnectEnd: e0 ?? qm, reconnectRadius: t0 ?? n0, defaultMarkerColor: Zn, noDragClassName: i0, noWheelClassName: l0, noPanClassName: Ja, elevateEdgesOnSelect: h0, rfId: Xl, disableKeyboardA11y: ba, nodeOrigin: Q, nodeExtent: Sn }),
      R.createElement(TS, { nodes: e, edges: t, defaultNodes: n, defaultEdges: r, onConnect: m, onConnectStart: x, onConnectEnd: w, onClickConnectStart: _, onClickConnectEnd: p, nodesDraggable: me, nodesConnectable: Ke, nodesFocusable: oe, edgesFocusable: Oe, edgesUpdatable: Pt, elementsSelectable: Vr, elevateNodesOnSelect: p0, minZoom: Kn, maxZoom: $t, nodeExtent: Sn, onNodesChange: r0, onEdgesChange: o0, snapToGrid: Ne, snapGrid: ve, connectionMode: S, translateExtent: Gn, connectOnClick: a0, defaultEdgeOptions: d0, fitView: s0, fitViewOptions: u0, onNodesDelete: I, onEdgesDelete: F, onNodeDragStart: M, onNodeDrag: P, onNodeDragStop: A, onSelectionDrag: v, onSelectionDragStart: V, onSelectionDragStop: $, noPanClassName: Ja, nodeOrigin: Q, rfId: Xl, autoPanOnConnect: m0, autoPanOnNodeDrag: g0, onError: w0, connectionRadius: y0, isValidConnection: v0, nodeDragThreshold: S0 }),
      R.createElement(MS, { onSelectionChange: B }),
      qa,
      R.createElement(tS, { proOptions: f0, position: c0 }),
      R.createElement(IS, { rfId: Xl, disableKeyboardA11y: ba })
    )
  );
});
Hu.displayName = "ReactFlow";
const Bm = ({ id: e, x: t, y: n, width: r, height: o, style: i, color: l, strokeColor: s, strokeWidth: u, className: a, borderRadius: c, shapeRendering: f, onClick: d, selected: m }) => {
  const { background: x, backgroundColor: w } = i || {}, _ = l || x || w;
  return R.createElement("rect", { className: Te(["react-flow__minimap-node", { selected: m }, a]), x: t, y: n, rx: c, ry: c, width: r, height: o, fill: _, stroke: s, strokeWidth: u, shapeRendering: f, onClick: d ? (p) => d(p, e) : void 0 });
};
Bm.displayName = "MiniMapNode";
var B_ = T.memo(Bm);
const U_ = (e) => e.nodeOrigin, j_ = (e) => e.getNodes().filter((t) => !t.hidden && t.width && t.height), Ts = (e) => e instanceof Function ? e : () => e;
function W_({
  nodeStrokeColor: e = "transparent",
  nodeColor: t = "#e2e2e2",
  nodeClassName: n = "",
  nodeBorderRadius: r = 5,
  nodeStrokeWidth: o = 2,
  // We need to rename the prop to be `CapitalCase` so that JSX will render it as
  // a component properly.
  nodeComponent: i = B_,
  onClick: l
}) {
  const s = le(j_, ke), u = le(U_), a = Ts(t), c = Ts(e), f = Ts(n), d = typeof window > "u" || window.chrome ? "crispEdges" : "geometricPrecision";
  return R.createElement(R.Fragment, null, s.map((m) => {
    const { x, y: w } = On(m, u).positionAbsolute;
    return R.createElement(i, { key: m.id, x, y: w, width: m.width, height: m.height, style: m.style, selected: m.selected, className: f(m), color: a(m), borderRadius: r, strokeColor: c(m), strokeWidth: o, shapeRendering: d, onClick: l, id: m.id });
  }));
}
var Y_ = T.memo(W_);
const X_ = 200, Q_ = 150, K_ = (e) => {
  const t = e.getNodes(), n = {
    x: -e.transform[0] / e.transform[2],
    y: -e.transform[1] / e.transform[2],
    width: e.width / e.transform[2],
    height: e.height / e.transform[2]
  };
  return {
    viewBB: n,
    boundingRect: t.length > 0 ? oS(jl(t, e.nodeOrigin), n) : n,
    rfId: e.rfId
  };
}, G_ = "react-flow__minimap-desc";
function Um({
  style: e,
  className: t,
  nodeStrokeColor: n = "transparent",
  nodeColor: r = "#e2e2e2",
  nodeClassName: o = "",
  nodeBorderRadius: i = 5,
  nodeStrokeWidth: l = 2,
  // We need to rename the prop to be `CapitalCase` so that JSX will render it as
  // a component properly.
  nodeComponent: s,
  maskColor: u = "rgb(240, 240, 240, 0.6)",
  maskStrokeColor: a = "none",
  maskStrokeWidth: c = 1,
  position: f = "bottom-right",
  onClick: d,
  onNodeClick: m,
  pannable: x = !1,
  zoomable: w = !1,
  ariaLabel: _ = "React Flow mini map",
  inversePan: p = !1,
  zoomStep: h = 10,
  offsetScale: g = 5
}) {
  const y = Se(), E = T.useRef(null), { boundingRect: C, viewBB: M, rfId: P } = le(K_, ke), A = (e == null ? void 0 : e.width) ?? X_, I = (e == null ? void 0 : e.height) ?? Q_, F = C.width / A, B = C.height / I, V = Math.max(F, B), v = V * A, $ = V * I, k = g * V, L = C.x - (v - C.width) / 2 - k, N = C.y - ($ - C.height) / 2 - k, S = v + k * 2, z = $ + k * 2, D = `${G_}-${P}`, O = T.useRef(0);
  O.current = V, T.useEffect(() => {
    if (E.current) {
      const Y = ot(E.current), K = (te) => {
        const { transform: ee, d3Selection: Ne, d3Zoom: ve } = y.getState();
        if (te.sourceEvent.type !== "wheel" || !Ne || !ve)
          return;
        const Le = -te.sourceEvent.deltaY * (te.sourceEvent.deltaMode === 1 ? 0.05 : te.sourceEvent.deltaMode ? 1 : 2e-3) * h, Pe = ee[2] * Math.pow(2, Le);
        ve.scaleTo(Ne, Pe);
      }, G = (te) => {
        const { transform: ee, d3Selection: Ne, d3Zoom: ve, translateExtent: Le, width: Pe, height: me } = y.getState();
        if (te.sourceEvent.type !== "mousemove" || !Ne || !ve)
          return;
        const Ke = O.current * Math.max(1, ee[2]) * (p ? -1 : 1), oe = {
          x: ee[0] - te.sourceEvent.movementX * Ke,
          y: ee[1] - te.sourceEvent.movementY * Ke
        }, Q = [
          [0, 0],
          [Pe, me]
        ], Oe = Vt.translate(oe.x, oe.y).scale(ee[2]), Pt = ve.constrain()(Oe, Q, Le);
        ve.transform(Ne, Pt);
      }, ne = qh().on("zoom", x ? G : null).on("zoom.wheel", w ? K : null);
      return Y.call(ne), () => {
        Y.on("zoom", null);
      };
    }
  }, [x, w, p, h]);
  const j = d ? (Y) => {
    const K = ht(Y);
    d(Y, { x: K[0], y: K[1] });
  } : void 0, U = m ? (Y, K) => {
    const G = y.getState().nodeInternals.get(K);
    m(Y, G);
  } : void 0;
  return R.createElement(
    Va,
    { position: f, style: e, className: Te(["react-flow__minimap", t]), "data-testid": "rf__minimap" },
    R.createElement(
      "svg",
      { width: A, height: I, viewBox: `${L} ${N} ${S} ${z}`, role: "img", "aria-labelledby": D, ref: E, onClick: j },
      _ && R.createElement("title", { id: D }, _),
      R.createElement(Y_, { onClick: U, nodeColor: r, nodeStrokeColor: n, nodeBorderRadius: i, nodeClassName: o, nodeStrokeWidth: l, nodeComponent: s }),
      R.createElement("path", { className: "react-flow__minimap-mask", d: `M${L - k},${N - k}h${S + k * 2}v${z + k * 2}h${-S - k * 2}z
        M${M.x},${M.y}h${M.width}v${M.height}h${-M.width}z`, fill: u, fillRule: "evenodd", stroke: a, strokeWidth: c, pointerEvents: "none" })
    )
  );
}
Um.displayName = "MiniMap";
var Z_ = T.memo(Um);
function q_() {
  return R.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 32" },
    R.createElement("path", { d: "M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" })
  );
}
function J_() {
  return R.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 5" },
    R.createElement("path", { d: "M0 0h32v4.2H0z" })
  );
}
function b_() {
  return R.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 30" },
    R.createElement("path", { d: "M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" })
  );
}
function eE() {
  return R.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32" },
    R.createElement("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z" })
  );
}
function tE() {
  return R.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32" },
    R.createElement("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z" })
  );
}
const ao = ({ children: e, className: t, ...n }) => R.createElement("button", { type: "button", className: Te(["react-flow__controls-button", t]), ...n }, e);
ao.displayName = "ControlButton";
const nE = (e) => ({
  isInteractive: e.nodesDraggable || e.nodesConnectable || e.elementsSelectable,
  minZoomReached: e.transform[2] <= e.minZoom,
  maxZoomReached: e.transform[2] >= e.maxZoom
}), jm = ({ style: e, showZoom: t = !0, showFitView: n = !0, showInteractive: r = !0, fitViewOptions: o, onZoomIn: i, onZoomOut: l, onFitView: s, onInteractiveChange: u, className: a, children: c, position: f = "bottom-left" }) => {
  const d = Se(), [m, x] = T.useState(!1), { isInteractive: w, minZoomReached: _, maxZoomReached: p } = le(nE, ke), { zoomIn: h, zoomOut: g, fitView: y } = Ga();
  if (T.useEffect(() => {
    x(!0);
  }, []), !m)
    return null;
  const E = () => {
    h(), i == null || i();
  }, C = () => {
    g(), l == null || l();
  }, M = () => {
    y(o), s == null || s();
  }, P = () => {
    d.setState({
      nodesDraggable: !w,
      nodesConnectable: !w,
      elementsSelectable: !w
    }), u == null || u(!w);
  };
  return R.createElement(
    Va,
    { className: Te(["react-flow__controls", a]), position: f, style: e, "data-testid": "rf__controls" },
    t && R.createElement(
      R.Fragment,
      null,
      R.createElement(
        ao,
        { onClick: E, className: "react-flow__controls-zoomin", title: "zoom in", "aria-label": "zoom in", disabled: p },
        R.createElement(q_, null)
      ),
      R.createElement(
        ao,
        { onClick: C, className: "react-flow__controls-zoomout", title: "zoom out", "aria-label": "zoom out", disabled: _ },
        R.createElement(J_, null)
      )
    ),
    n && R.createElement(
      ao,
      { className: "react-flow__controls-fitview", onClick: M, title: "fit view", "aria-label": "fit view" },
      R.createElement(b_, null)
    ),
    r && R.createElement(ao, { className: "react-flow__controls-interactive", onClick: P, title: "toggle interactivity", "aria-label": "toggle interactivity" }, w ? R.createElement(tE, null) : R.createElement(eE, null)),
    c
  );
};
jm.displayName = "Controls";
var ed = T.memo(jm), wt;
(function(e) {
  e.Lines = "lines", e.Dots = "dots", e.Cross = "cross";
})(wt || (wt = {}));
function rE({ color: e, dimensions: t, lineWidth: n }) {
  return R.createElement("path", { stroke: e, strokeWidth: n, d: `M${t[0] / 2} 0 V${t[1]} M0 ${t[1] / 2} H${t[0]}` });
}
function oE({ color: e, radius: t }) {
  return R.createElement("circle", { cx: t, cy: t, r: t, fill: e });
}
const iE = {
  [wt.Dots]: "#91919a",
  [wt.Lines]: "#eee",
  [wt.Cross]: "#e2e2e2"
}, lE = {
  [wt.Dots]: 1,
  [wt.Lines]: 1,
  [wt.Cross]: 6
}, sE = (e) => ({ transform: e.transform, patternId: `pattern-${e.rfId}` });
function Wm({
  id: e,
  variant: t = wt.Dots,
  // only used for dots and cross
  gap: n = 20,
  // only used for lines and cross
  size: r,
  lineWidth: o = 1,
  offset: i = 2,
  color: l,
  style: s,
  className: u
}) {
  const a = T.useRef(null), { transform: c, patternId: f } = le(sE, ke), d = l || iE[t], m = r || lE[t], x = t === wt.Dots, w = t === wt.Cross, _ = Array.isArray(n) ? n : [n, n], p = [_[0] * c[2] || 1, _[1] * c[2] || 1], h = m * c[2], g = w ? [h, h] : p, y = x ? [h / i, h / i] : [g[0] / i, g[1] / i];
  return R.createElement(
    "svg",
    { className: Te(["react-flow__background", u]), style: {
      ...s,
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0
    }, ref: a, "data-testid": "rf__background" },
    R.createElement("pattern", { id: f + e, x: c[0] % p[0], y: c[1] % p[1], width: p[0], height: p[1], patternUnits: "userSpaceOnUse", patternTransform: `translate(-${y[0]},-${y[1]})` }, x ? R.createElement(oE, { color: d, radius: h / i }) : R.createElement(rE, { dimensions: g, color: d, lineWidth: o })),
    R.createElement("rect", { x: "0", y: "0", width: "100%", height: "100%", fill: `url(#${f + e})` })
  );
}
Wm.displayName = "Background";
var td = T.memo(Wm);
const Ps = { green: "#34c759", orange: "#ff8c1a", cyan: "#00c7ff", red: "#ff3b30", violet: "#7d42ff", magenta: "#ff2d92", blue: "#2f6bff", yellow: "#ffd60a", pink: "#ff6da8" };
function uE({ data: e, selected: t }) {
  return /* @__PURE__ */ J.jsxs("article", { className: `idea-node ${t ? "is-selected" : ""}`, style: { "--idea-accent": e.color }, children: [
    /* @__PURE__ */ J.jsxs("span", { children: [
      String(e.index).padStart(2, "0"),
      " / ",
      e.domain
    ] }),
    /* @__PURE__ */ J.jsx("strong", { children: e.title }),
    /* @__PURE__ */ J.jsx("small", { children: "Independent surrogate" })
  ] });
}
function aE({ data: e }) {
  return /* @__PURE__ */ J.jsxs("article", { className: "step-node", style: { "--idea-accent": e.color }, children: [
    /* @__PURE__ */ J.jsx(Lr, { type: "target", position: X.Left }),
    /* @__PURE__ */ J.jsx("span", { children: String(e.index).padStart(2, "0") }),
    /* @__PURE__ */ J.jsx("strong", { children: e.label }),
    /* @__PURE__ */ J.jsx(Lr, { type: "source", position: X.Right })
  ] });
}
const nd = { idea: uE, step: aE };
function cE({ concepts: e }) {
  var s;
  const [t, n] = T.useState((s = e[0]) == null ? void 0 : s.id), r = e.find((u) => u.id === t) || e[0], o = T.useMemo(() => e.map((u, a) => ({ id: u.id, type: "idea", position: { x: a % 3 * 310, y: Math.floor(a / 3) * 175 }, data: { ...u, color: Ps[u.accent] || "#00c7ff" } })), [e]), i = T.useMemo(() => r.flow.map((u, a) => ({ id: `${r.id}-${a}`, type: "step", position: { x: a * 225, y: a % 2 ? 150 : 25 }, data: { label: u, index: a + 1, color: Ps[r.accent] || "#00c7ff" } })), [r]), l = T.useMemo(() => r.flow.slice(1).map((u, a) => ({ id: `${r.id}-edge-${a}`, source: `${r.id}-${a}`, target: `${r.id}-${a + 1}`, type: "step", markerEnd: { type: Wo.ArrowClosed, color: "#f2f7ff" }, style: { stroke: "#f2f7ff", strokeWidth: 1.2 } })), [r]);
  return /* @__PURE__ */ J.jsxs("div", { className: "brix-flow-system", children: [
    /* @__PURE__ */ J.jsxs("section", { className: "brix-flow-map", children: [
      /* @__PURE__ */ J.jsxs("header", { children: [
        /* @__PURE__ */ J.jsx("span", { children: "01 / Idea index" }),
        /* @__PURE__ */ J.jsx("strong", { children: "Select an independent surrogate" })
      ] }),
      /* @__PURE__ */ J.jsx("div", { className: "brix-flow-canvas", children: /* @__PURE__ */ J.jsxs(Hu, { nodes: o, edges: [], nodeTypes: nd, onNodeClick: (u, a) => n(a.id), fitView: !0, minZoom: 0.55, maxZoom: 1.35, proOptions: { hideAttribution: !0 }, children: [
        /* @__PURE__ */ J.jsx(td, { variant: "dots", gap: 22, size: 1.2, color: "#343a45" }),
        /* @__PURE__ */ J.jsx(ed, { showInteractive: !1 }),
        /* @__PURE__ */ J.jsx(Z_, { nodeColor: (u) => u.data.color, maskColor: "rgba(5,7,11,.78)" })
      ] }) })
    ] }),
    /* @__PURE__ */ J.jsxs("section", { className: "brix-flow-detail", style: { "--idea-accent": Ps[r.accent] || "#00c7ff" }, children: [
      /* @__PURE__ */ J.jsxs("div", { className: "brix-flow-copy", children: [
        /* @__PURE__ */ J.jsxs("span", { children: [
          "02 / ",
          r.domain
        ] }),
        /* @__PURE__ */ J.jsx("h3", { children: r.title }),
        /* @__PURE__ */ J.jsx("p", { children: r.summary }),
        /* @__PURE__ */ J.jsxs("dl", { children: [
          /* @__PURE__ */ J.jsx("dt", { children: "Public view" }),
          /* @__PURE__ */ J.jsx("dd", { children: "Schematic concept only" }),
          /* @__PURE__ */ J.jsx("dt", { children: "Maturity" }),
          /* @__PURE__ */ J.jsx("dd", { children: r.maturity }),
          /* @__PURE__ */ J.jsx("dt", { children: "License boundary" }),
          /* @__PURE__ */ J.jsx("dd", { children: r.license })
        ] })
      ] }),
      /* @__PURE__ */ J.jsx("div", { className: "brix-step-canvas", children: /* @__PURE__ */ J.jsxs(Hu, { nodes: i, edges: l, nodeTypes: nd, fitView: !0, minZoom: 0.55, maxZoom: 1.35, proOptions: { hideAttribution: !0 }, children: [
        /* @__PURE__ */ J.jsx(td, { variant: "dots", gap: 22, size: 1.2, color: "#343a45" }),
        /* @__PURE__ */ J.jsx(ed, { showInteractive: !1 })
      ] }) })
    ] })
  ] });
}
const rd = document.getElementById("brix-flow-root"), od = document.getElementById("brix-flow-data");
rd && od && vh(rd).render(/* @__PURE__ */ J.jsx(cE, { concepts: JSON.parse(od.textContent) }));
