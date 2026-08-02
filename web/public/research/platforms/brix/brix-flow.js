function ld(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var sd = { exports: {} }, Sl = {}, ud = { exports: {} }, J = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Qo = Symbol.for("react.element"), N0 = Symbol.for("react.portal"), C0 = Symbol.for("react.fragment"), M0 = Symbol.for("react.strict_mode"), z0 = Symbol.for("react.profiler"), T0 = Symbol.for("react.provider"), P0 = Symbol.for("react.context"), $0 = Symbol.for("react.forward_ref"), R0 = Symbol.for("react.suspense"), A0 = Symbol.for("react.memo"), I0 = Symbol.for("react.lazy"), nc = Symbol.iterator;
function D0(e) {
  return e === null || typeof e != "object" ? null : (e = nc && e[nc] || e["@@iterator"], typeof e == "function" ? e : null);
}
var ad = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, cd = Object.assign, fd = {};
function Fr(e, t, n) {
  this.props = e, this.context = t, this.refs = fd, this.updater = n || ad;
}
Fr.prototype.isReactComponent = {};
Fr.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
Fr.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function dd() {
}
dd.prototype = Fr.prototype;
function Bu(e, t, n) {
  this.props = e, this.context = t, this.refs = fd, this.updater = n || ad;
}
var ju = Bu.prototype = new dd();
ju.constructor = Bu;
cd(ju, Fr.prototype);
ju.isPureReactComponent = !0;
var rc = Array.isArray, pd = Object.prototype.hasOwnProperty, Uu = { current: null }, hd = { key: !0, ref: !0, __self: !0, __source: !0 };
function md(e, t, n) {
  var r, o = {}, i = null, l = null;
  if (t != null) for (r in t.ref !== void 0 && (l = t.ref), t.key !== void 0 && (i = "" + t.key), t) pd.call(t, r) && !hd.hasOwnProperty(r) && (o[r] = t[r]);
  var s = arguments.length - 2;
  if (s === 1) o.children = n;
  else if (1 < s) {
    for (var u = Array(s), a = 0; a < s; a++) u[a] = arguments[a + 2];
    o.children = u;
  }
  if (e && e.defaultProps) for (r in s = e.defaultProps, s) o[r] === void 0 && (o[r] = s[r]);
  return { $$typeof: Qo, type: e, key: i, ref: l, props: o, _owner: Uu.current };
}
function L0(e, t) {
  return { $$typeof: Qo, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function Wu(e) {
  return typeof e == "object" && e !== null && e.$$typeof === Qo;
}
function O0(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var oc = /\/+/g;
function Kl(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? O0("" + e.key) : t.toString(36);
}
function Mi(e, t, n, r, o) {
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
        case Qo:
        case N0:
          l = !0;
      }
  }
  if (l) return l = e, o = o(l), e = r === "" ? "." + Kl(l, 0) : r, rc(o) ? (n = "", e != null && (n = e.replace(oc, "$&/") + "/"), Mi(o, t, n, "", function(a) {
    return a;
  })) : o != null && (Wu(o) && (o = L0(o, n + (!o.key || l && l.key === o.key ? "" : ("" + o.key).replace(oc, "$&/") + "/") + e)), t.push(o)), 1;
  if (l = 0, r = r === "" ? "." : r + ":", rc(e)) for (var s = 0; s < e.length; s++) {
    i = e[s];
    var u = r + Kl(i, s);
    l += Mi(i, t, n, u, o);
  }
  else if (u = D0(e), typeof u == "function") for (e = u.call(e), s = 0; !(i = e.next()).done; ) i = i.value, u = r + Kl(i, s++), l += Mi(i, t, n, u, o);
  else if (i === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return l;
}
function ti(e, t, n) {
  if (e == null) return e;
  var r = [], o = 0;
  return Mi(e, r, "", "", function(i) {
    return t.call(n, i, o++);
  }), r;
}
function F0(e) {
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
var Ve = { current: null }, zi = { transition: null }, H0 = { ReactCurrentDispatcher: Ve, ReactCurrentBatchConfig: zi, ReactCurrentOwner: Uu };
function gd() {
  throw Error("act(...) is not supported in production builds of React.");
}
J.Children = { map: ti, forEach: function(e, t, n) {
  ti(e, function() {
    t.apply(this, arguments);
  }, n);
}, count: function(e) {
  var t = 0;
  return ti(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return ti(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!Wu(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
J.Component = Fr;
J.Fragment = C0;
J.Profiler = z0;
J.PureComponent = Bu;
J.StrictMode = M0;
J.Suspense = R0;
J.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = H0;
J.act = gd;
J.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = cd({}, e.props), o = e.key, i = e.ref, l = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (i = t.ref, l = Uu.current), t.key !== void 0 && (o = "" + t.key), e.type && e.type.defaultProps) var s = e.type.defaultProps;
    for (u in t) pd.call(t, u) && !hd.hasOwnProperty(u) && (r[u] = t[u] === void 0 && s !== void 0 ? s[u] : t[u]);
  }
  var u = arguments.length - 2;
  if (u === 1) r.children = n;
  else if (1 < u) {
    s = Array(u);
    for (var a = 0; a < u; a++) s[a] = arguments[a + 2];
    r.children = s;
  }
  return { $$typeof: Qo, type: e.type, key: o, ref: i, props: r, _owner: l };
};
J.createContext = function(e) {
  return e = { $$typeof: P0, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: T0, _context: e }, e.Consumer = e;
};
J.createElement = md;
J.createFactory = function(e) {
  var t = md.bind(null, e);
  return t.type = e, t;
};
J.createRef = function() {
  return { current: null };
};
J.forwardRef = function(e) {
  return { $$typeof: $0, render: e };
};
J.isValidElement = Wu;
J.lazy = function(e) {
  return { $$typeof: I0, _payload: { _status: -1, _result: e }, _init: F0 };
};
J.memo = function(e, t) {
  return { $$typeof: A0, type: e, compare: t === void 0 ? null : t };
};
J.startTransition = function(e) {
  var t = zi.transition;
  zi.transition = {};
  try {
    e();
  } finally {
    zi.transition = t;
  }
};
J.unstable_act = gd;
J.useCallback = function(e, t) {
  return Ve.current.useCallback(e, t);
};
J.useContext = function(e) {
  return Ve.current.useContext(e);
};
J.useDebugValue = function() {
};
J.useDeferredValue = function(e) {
  return Ve.current.useDeferredValue(e);
};
J.useEffect = function(e, t) {
  return Ve.current.useEffect(e, t);
};
J.useId = function() {
  return Ve.current.useId();
};
J.useImperativeHandle = function(e, t, n) {
  return Ve.current.useImperativeHandle(e, t, n);
};
J.useInsertionEffect = function(e, t) {
  return Ve.current.useInsertionEffect(e, t);
};
J.useLayoutEffect = function(e, t) {
  return Ve.current.useLayoutEffect(e, t);
};
J.useMemo = function(e, t) {
  return Ve.current.useMemo(e, t);
};
J.useReducer = function(e, t, n) {
  return Ve.current.useReducer(e, t, n);
};
J.useRef = function(e) {
  return Ve.current.useRef(e);
};
J.useState = function(e) {
  return Ve.current.useState(e);
};
J.useSyncExternalStore = function(e, t, n) {
  return Ve.current.useSyncExternalStore(e, t, n);
};
J.useTransition = function() {
  return Ve.current.useTransition();
};
J.version = "18.3.1";
ud.exports = J;
var T = ud.exports;
const R = /* @__PURE__ */ ld(T);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var V0 = T, B0 = Symbol.for("react.element"), j0 = Symbol.for("react.fragment"), U0 = Object.prototype.hasOwnProperty, W0 = V0.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, Y0 = { key: !0, ref: !0, __self: !0, __source: !0 };
function yd(e, t, n) {
  var r, o = {}, i = null, l = null;
  n !== void 0 && (i = "" + n), t.key !== void 0 && (i = "" + t.key), t.ref !== void 0 && (l = t.ref);
  for (r in t) U0.call(t, r) && !Y0.hasOwnProperty(r) && (o[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) o[r] === void 0 && (o[r] = t[r]);
  return { $$typeof: B0, type: e, key: i, ref: l, props: o, _owner: W0.current };
}
Sl.Fragment = j0;
Sl.jsx = yd;
Sl.jsxs = yd;
sd.exports = Sl;
var W = sd.exports, vd = { exports: {} }, et = {}, wd = { exports: {} }, xd = {};
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
      e: for (var D = 0, O = N.length, U = O >>> 1; D < U; ) {
        var j = 2 * (D + 1) - 1, X = N[j], G = j + 1, Z = N[G];
        if (0 > o(X, z)) G < O && 0 > o(Z, X) ? (N[D] = Z, N[G] = z, D = G) : (N[D] = X, N[j] = z, D = j);
        else if (G < O && 0 > o(Z, z)) N[D] = Z, N[G] = z, D = G;
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
  var u = [], a = [], c = 1, f = null, d = 3, m = !1, x = !1, y = !1, _ = typeof setTimeout == "function" ? setTimeout : null, p = typeof clearTimeout == "function" ? clearTimeout : null, h = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function g(N) {
    for (var S = n(a); S !== null; ) {
      if (S.callback === null) r(a);
      else if (S.startTime <= N) r(a), S.sortIndex = S.expirationTime, t(u, S);
      else break;
      S = n(a);
    }
  }
  function v(N) {
    if (y = !1, g(N), !x) if (n(u) !== null) x = !0, k(E);
    else {
      var S = n(a);
      S !== null && L(v, S.startTime - N);
    }
  }
  function E(N, S) {
    x = !1, y && (y = !1, p(P), P = -1), m = !0;
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
      if (f !== null) var U = !0;
      else {
        var j = n(a);
        j !== null && L(v, j.startTime - S), U = !1;
      }
      return U;
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
    var w = new MessageChannel(), $ = w.port2;
    w.port1.onmessage = B, V = function() {
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
    return O = z + O, N = { id: c++, callback: S, priorityLevel: N, startTime: z, expirationTime: O, sortIndex: -1 }, z > D ? (N.sortIndex = z, t(a, N), n(u) === null && N === n(a) && (y ? (p(P), P = -1) : y = !0, L(v, z - D))) : (N.sortIndex = O, t(u, N), x || m || (x = !0, k(E))), N;
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
})(xd);
wd.exports = xd;
var X0 = wd.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Q0 = T, Je = X0;
function H(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var Sd = /* @__PURE__ */ new Set(), So = {};
function Xn(e, t) {
  Cr(e, t), Cr(e + "Capture", t);
}
function Cr(e, t) {
  for (So[e] = t, e = 0; e < t.length; e++) Sd.add(t[e]);
}
var Bt = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Rs = Object.prototype.hasOwnProperty, K0 = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, ic = {}, lc = {};
function G0(e) {
  return Rs.call(lc, e) ? !0 : Rs.call(ic, e) ? !1 : K0.test(e) ? lc[e] = !0 : (ic[e] = !0, !1);
}
function Z0(e, t, n, r) {
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
function q0(e, t, n, r) {
  if (t === null || typeof t > "u" || Z0(e, t, n, r)) return !0;
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
var Yu = /[\-:]([a-z])/g;
function Xu(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
  var t = e.replace(
    Yu,
    Xu
  );
  ze[t] = new Be(t, 1, !1, e, null, !1, !1);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
  var t = e.replace(Yu, Xu);
  ze[t] = new Be(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
  var t = e.replace(Yu, Xu);
  ze[t] = new Be(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function(e) {
  ze[e] = new Be(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
ze.xlinkHref = new Be("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function(e) {
  ze[e] = new Be(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function Qu(e, t, n, r) {
  var o = ze.hasOwnProperty(t) ? ze[t] : null;
  (o !== null ? o.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (q0(t, n, o, r) && (n = null), r || o === null ? G0(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : o.mustUseProperty ? e[o.propertyName] = n === null ? o.type === 3 ? !1 : "" : n : (t = o.attributeName, r = o.attributeNamespace, n === null ? e.removeAttribute(t) : (o = o.type, n = o === 3 || o === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var Qt = Q0.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, ni = Symbol.for("react.element"), or = Symbol.for("react.portal"), ir = Symbol.for("react.fragment"), Ku = Symbol.for("react.strict_mode"), As = Symbol.for("react.profiler"), _d = Symbol.for("react.provider"), Ed = Symbol.for("react.context"), Gu = Symbol.for("react.forward_ref"), Is = Symbol.for("react.suspense"), Ds = Symbol.for("react.suspense_list"), Zu = Symbol.for("react.memo"), qt = Symbol.for("react.lazy"), kd = Symbol.for("react.offscreen"), sc = Symbol.iterator;
function Yr(e) {
  return e === null || typeof e != "object" ? null : (e = sc && e[sc] || e["@@iterator"], typeof e == "function" ? e : null);
}
var de = Object.assign, Gl;
function oo(e) {
  if (Gl === void 0) try {
    throw Error();
  } catch (n) {
    var t = n.stack.trim().match(/\n( *(at )?)/);
    Gl = t && t[1] || "";
  }
  return `
` + Gl + e;
}
var Zl = !1;
function ql(e, t) {
  if (!e || Zl) return "";
  Zl = !0;
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
    Zl = !1, Error.prepareStackTrace = n;
  }
  return (e = e ? e.displayName || e.name : "") ? oo(e) : "";
}
function J0(e) {
  switch (e.tag) {
    case 5:
      return oo(e.type);
    case 16:
      return oo("Lazy");
    case 13:
      return oo("Suspense");
    case 19:
      return oo("SuspenseList");
    case 0:
    case 2:
    case 15:
      return e = ql(e.type, !1), e;
    case 11:
      return e = ql(e.type.render, !1), e;
    case 1:
      return e = ql(e.type, !0), e;
    default:
      return "";
  }
}
function Ls(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case ir:
      return "Fragment";
    case or:
      return "Portal";
    case As:
      return "Profiler";
    case Ku:
      return "StrictMode";
    case Is:
      return "Suspense";
    case Ds:
      return "SuspenseList";
  }
  if (typeof e == "object") switch (e.$$typeof) {
    case Ed:
      return (e.displayName || "Context") + ".Consumer";
    case _d:
      return (e._context.displayName || "Context") + ".Provider";
    case Gu:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case Zu:
      return t = e.displayName || null, t !== null ? t : Ls(e.type) || "Memo";
    case qt:
      t = e._payload, e = e._init;
      try {
        return Ls(e(t));
      } catch {
      }
  }
  return null;
}
function b0(e) {
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
      return Ls(t);
    case 8:
      return t === Ku ? "StrictMode" : "Mode";
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
function gn(e) {
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
function Nd(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function eg(e) {
  var t = Nd(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
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
function ri(e) {
  e._valueTracker || (e._valueTracker = eg(e));
}
function Cd(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(), r = "";
  return e && (r = Nd(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
}
function Ui(e) {
  if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function Os(e, t) {
  var n = t.checked;
  return de({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
}
function uc(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
  n = gn(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
}
function Md(e, t) {
  t = t.checked, t != null && Qu(e, "checked", t, !1);
}
function Fs(e, t) {
  Md(e, t);
  var n = gn(t.value), r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? Hs(e, t.type, n) : t.hasOwnProperty("defaultValue") && Hs(e, t.type, gn(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
}
function ac(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
    t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
  }
  n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
}
function Hs(e, t, n) {
  (t !== "number" || Ui(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var io = Array.isArray;
function yr(e, t, n, r) {
  if (e = e.options, t) {
    t = {};
    for (var o = 0; o < n.length; o++) t["$" + n[o]] = !0;
    for (n = 0; n < e.length; n++) o = t.hasOwnProperty("$" + e[n].value), e[n].selected !== o && (e[n].selected = o), o && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + gn(n), t = null, o = 0; o < e.length; o++) {
      if (e[o].value === n) {
        e[o].selected = !0, r && (e[o].defaultSelected = !0);
        return;
      }
      t !== null || e[o].disabled || (t = e[o]);
    }
    t !== null && (t.selected = !0);
  }
}
function Vs(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(H(91));
  return de({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
}
function cc(e, t) {
  var n = t.value;
  if (n == null) {
    if (n = t.children, t = t.defaultValue, n != null) {
      if (t != null) throw Error(H(92));
      if (io(n)) {
        if (1 < n.length) throw Error(H(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), n = t;
  }
  e._wrapperState = { initialValue: gn(n) };
}
function zd(e, t) {
  var n = gn(t.value), r = gn(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function fc(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function Td(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function Bs(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml" ? Td(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var oi, Pd = function(e) {
  return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, o) {
    MSApp.execUnsafeLocalFunction(function() {
      return e(t, n, r, o);
    });
  } : e;
}(function(e, t) {
  if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
  else {
    for (oi = oi || document.createElement("div"), oi.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = oi.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
    for (; t.firstChild; ) e.appendChild(t.firstChild);
  }
});
function _o(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var fo = {
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
}, tg = ["Webkit", "ms", "Moz", "O"];
Object.keys(fo).forEach(function(e) {
  tg.forEach(function(t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), fo[t] = fo[e];
  });
});
function $d(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || fo.hasOwnProperty(e) && fo[e] ? ("" + t).trim() : t + "px";
}
function Rd(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0, o = $d(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, o) : e[n] = o;
  }
}
var ng = de({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
function js(e, t) {
  if (t) {
    if (ng[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(H(137, e));
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
var Ws = null;
function qu(e) {
  return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
}
var Ys = null, vr = null, wr = null;
function dc(e) {
  if (e = Zo(e)) {
    if (typeof Ys != "function") throw Error(H(280));
    var t = e.stateNode;
    t && (t = Cl(t), Ys(e.stateNode, e.type, t));
  }
}
function Ad(e) {
  vr ? wr ? wr.push(e) : wr = [e] : vr = e;
}
function Id() {
  if (vr) {
    var e = vr, t = wr;
    if (wr = vr = null, dc(e), t) for (e = 0; e < t.length; e++) dc(t[e]);
  }
}
function Dd(e, t) {
  return e(t);
}
function Ld() {
}
var Jl = !1;
function Od(e, t, n) {
  if (Jl) return e(t, n);
  Jl = !0;
  try {
    return Dd(e, t, n);
  } finally {
    Jl = !1, (vr !== null || wr !== null) && (Ld(), Id());
  }
}
function Eo(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = Cl(n);
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
var Xs = !1;
if (Bt) try {
  var Xr = {};
  Object.defineProperty(Xr, "passive", { get: function() {
    Xs = !0;
  } }), window.addEventListener("test", Xr, Xr), window.removeEventListener("test", Xr, Xr);
} catch {
  Xs = !1;
}
function rg(e, t, n, r, o, i, l, s, u) {
  var a = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, a);
  } catch (c) {
    this.onError(c);
  }
}
var po = !1, Wi = null, Yi = !1, Qs = null, og = { onError: function(e) {
  po = !0, Wi = e;
} };
function ig(e, t, n, r, o, i, l, s, u) {
  po = !1, Wi = null, rg.apply(og, arguments);
}
function lg(e, t, n, r, o, i, l, s, u) {
  if (ig.apply(this, arguments), po) {
    if (po) {
      var a = Wi;
      po = !1, Wi = null;
    } else throw Error(H(198));
    Yi || (Yi = !0, Qs = a);
  }
}
function Qn(e) {
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
function Fd(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function pc(e) {
  if (Qn(e) !== e) throw Error(H(188));
}
function sg(e) {
  var t = e.alternate;
  if (!t) {
    if (t = Qn(e), t === null) throw Error(H(188));
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
        if (i === n) return pc(o), e;
        if (i === r) return pc(o), t;
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
function Hd(e) {
  return e = sg(e), e !== null ? Vd(e) : null;
}
function Vd(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = Vd(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var Bd = Je.unstable_scheduleCallback, hc = Je.unstable_cancelCallback, ug = Je.unstable_shouldYield, ag = Je.unstable_requestPaint, ge = Je.unstable_now, cg = Je.unstable_getCurrentPriorityLevel, Ju = Je.unstable_ImmediatePriority, jd = Je.unstable_UserBlockingPriority, Xi = Je.unstable_NormalPriority, fg = Je.unstable_LowPriority, Ud = Je.unstable_IdlePriority, _l = null, Ct = null;
function dg(e) {
  if (Ct && typeof Ct.onCommitFiberRoot == "function") try {
    Ct.onCommitFiberRoot(_l, e, void 0, (e.current.flags & 128) === 128);
  } catch {
  }
}
var yt = Math.clz32 ? Math.clz32 : mg, pg = Math.log, hg = Math.LN2;
function mg(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (pg(e) / hg | 0) | 0;
}
var ii = 64, li = 4194304;
function lo(e) {
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
function Qi(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0, o = e.suspendedLanes, i = e.pingedLanes, l = n & 268435455;
  if (l !== 0) {
    var s = l & ~o;
    s !== 0 ? r = lo(s) : (i &= l, i !== 0 && (r = lo(i)));
  } else l = n & ~o, l !== 0 ? r = lo(l) : i !== 0 && (r = lo(i));
  if (r === 0) return 0;
  if (t !== 0 && t !== r && !(t & o) && (o = r & -r, i = t & -t, o >= i || o === 16 && (i & 4194240) !== 0)) return t;
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - yt(t), o = 1 << n, r |= e[n], t &= ~o;
  return r;
}
function gg(e, t) {
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
function yg(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, o = e.expirationTimes, i = e.pendingLanes; 0 < i; ) {
    var l = 31 - yt(i), s = 1 << l, u = o[l];
    u === -1 ? (!(s & n) || s & r) && (o[l] = gg(s, t)) : u <= t && (e.expiredLanes |= s), i &= ~s;
  }
}
function Ks(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function Wd() {
  var e = ii;
  return ii <<= 1, !(ii & 4194240) && (ii = 64), e;
}
function bl(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function Ko(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - yt(t), e[t] = n;
}
function vg(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var o = 31 - yt(n), i = 1 << o;
    t[o] = 0, r[o] = -1, e[o] = -1, n &= ~i;
  }
}
function bu(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n; ) {
    var r = 31 - yt(n), o = 1 << r;
    o & t | e[r] & t && (e[r] |= t), n &= ~o;
  }
}
var re = 0;
function Yd(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var Xd, ea, Qd, Kd, Gd, Gs = !1, si = [], sn = null, un = null, an = null, ko = /* @__PURE__ */ new Map(), No = /* @__PURE__ */ new Map(), tn = [], wg = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function mc(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      sn = null;
      break;
    case "dragenter":
    case "dragleave":
      un = null;
      break;
    case "mouseover":
    case "mouseout":
      an = null;
      break;
    case "pointerover":
    case "pointerout":
      ko.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      No.delete(t.pointerId);
  }
}
function Qr(e, t, n, r, o, i) {
  return e === null || e.nativeEvent !== i ? (e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: i, targetContainers: [o] }, t !== null && (t = Zo(t), t !== null && ea(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, o !== null && t.indexOf(o) === -1 && t.push(o), e);
}
function xg(e, t, n, r, o) {
  switch (t) {
    case "focusin":
      return sn = Qr(sn, e, t, n, r, o), !0;
    case "dragenter":
      return un = Qr(un, e, t, n, r, o), !0;
    case "mouseover":
      return an = Qr(an, e, t, n, r, o), !0;
    case "pointerover":
      var i = o.pointerId;
      return ko.set(i, Qr(ko.get(i) || null, e, t, n, r, o)), !0;
    case "gotpointercapture":
      return i = o.pointerId, No.set(i, Qr(No.get(i) || null, e, t, n, r, o)), !0;
  }
  return !1;
}
function Zd(e) {
  var t = Pn(e.target);
  if (t !== null) {
    var n = Qn(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = Fd(n), t !== null) {
          e.blockedOn = t, Gd(e.priority, function() {
            Qd(n);
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
function Ti(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = Zs(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      Ws = r, n.target.dispatchEvent(r), Ws = null;
    } else return t = Zo(n), t !== null && ea(t), e.blockedOn = n, !1;
    t.shift();
  }
  return !0;
}
function gc(e, t, n) {
  Ti(e) && n.delete(t);
}
function Sg() {
  Gs = !1, sn !== null && Ti(sn) && (sn = null), un !== null && Ti(un) && (un = null), an !== null && Ti(an) && (an = null), ko.forEach(gc), No.forEach(gc);
}
function Kr(e, t) {
  e.blockedOn === t && (e.blockedOn = null, Gs || (Gs = !0, Je.unstable_scheduleCallback(Je.unstable_NormalPriority, Sg)));
}
function Co(e) {
  function t(o) {
    return Kr(o, e);
  }
  if (0 < si.length) {
    Kr(si[0], e);
    for (var n = 1; n < si.length; n++) {
      var r = si[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (sn !== null && Kr(sn, e), un !== null && Kr(un, e), an !== null && Kr(an, e), ko.forEach(t), No.forEach(t), n = 0; n < tn.length; n++) r = tn[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < tn.length && (n = tn[0], n.blockedOn === null); ) Zd(n), n.blockedOn === null && tn.shift();
}
var xr = Qt.ReactCurrentBatchConfig, Ki = !0;
function _g(e, t, n, r) {
  var o = re, i = xr.transition;
  xr.transition = null;
  try {
    re = 1, ta(e, t, n, r);
  } finally {
    re = o, xr.transition = i;
  }
}
function Eg(e, t, n, r) {
  var o = re, i = xr.transition;
  xr.transition = null;
  try {
    re = 4, ta(e, t, n, r);
  } finally {
    re = o, xr.transition = i;
  }
}
function ta(e, t, n, r) {
  if (Ki) {
    var o = Zs(e, t, n, r);
    if (o === null) as(e, t, r, Gi, n), mc(e, r);
    else if (xg(o, e, t, n, r)) r.stopPropagation();
    else if (mc(e, r), t & 4 && -1 < wg.indexOf(e)) {
      for (; o !== null; ) {
        var i = Zo(o);
        if (i !== null && Xd(i), i = Zs(e, t, n, r), i === null && as(e, t, r, Gi, n), i === o) break;
        o = i;
      }
      o !== null && r.stopPropagation();
    } else as(e, t, r, null, n);
  }
}
var Gi = null;
function Zs(e, t, n, r) {
  if (Gi = null, e = qu(r), e = Pn(e), e !== null) if (t = Qn(e), t === null) e = null;
  else if (n = t.tag, n === 13) {
    if (e = Fd(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return Gi = e, null;
}
function qd(e) {
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
      switch (cg()) {
        case Ju:
          return 1;
        case jd:
          return 4;
        case Xi:
        case fg:
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
var on = null, na = null, Pi = null;
function Jd() {
  if (Pi) return Pi;
  var e, t = na, n = t.length, r, o = "value" in on ? on.value : on.textContent, i = o.length;
  for (e = 0; e < n && t[e] === o[e]; e++) ;
  var l = n - e;
  for (r = 1; r <= l && t[n - r] === o[i - r]; r++) ;
  return Pi = o.slice(e, 1 < r ? 1 - r : void 0);
}
function $i(e) {
  var t = e.keyCode;
  return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
}
function ui() {
  return !0;
}
function yc() {
  return !1;
}
function tt(e) {
  function t(n, r, o, i, l) {
    this._reactName = n, this._targetInst = o, this.type = r, this.nativeEvent = i, this.target = l, this.currentTarget = null;
    for (var s in e) e.hasOwnProperty(s) && (n = e[s], this[s] = n ? n(i) : i[s]);
    return this.isDefaultPrevented = (i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1) ? ui : yc, this.isPropagationStopped = yc, this;
  }
  return de(t.prototype, { preventDefault: function() {
    this.defaultPrevented = !0;
    var n = this.nativeEvent;
    n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = ui);
  }, stopPropagation: function() {
    var n = this.nativeEvent;
    n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = ui);
  }, persist: function() {
  }, isPersistent: ui }), t;
}
var Hr = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
  return e.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, ra = tt(Hr), Go = de({}, Hr, { view: 0, detail: 0 }), kg = tt(Go), es, ts, Gr, El = de({}, Go, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: oa, button: 0, buttons: 0, relatedTarget: function(e) {
  return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
}, movementX: function(e) {
  return "movementX" in e ? e.movementX : (e !== Gr && (Gr && e.type === "mousemove" ? (es = e.screenX - Gr.screenX, ts = e.screenY - Gr.screenY) : ts = es = 0, Gr = e), es);
}, movementY: function(e) {
  return "movementY" in e ? e.movementY : ts;
} }), vc = tt(El), Ng = de({}, El, { dataTransfer: 0 }), Cg = tt(Ng), Mg = de({}, Go, { relatedTarget: 0 }), ns = tt(Mg), zg = de({}, Hr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Tg = tt(zg), Pg = de({}, Hr, { clipboardData: function(e) {
  return "clipboardData" in e ? e.clipboardData : window.clipboardData;
} }), $g = tt(Pg), Rg = de({}, Hr, { data: 0 }), wc = tt(Rg), Ag = {
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
}, Ig = {
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
}, Dg = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function Lg(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = Dg[e]) ? !!t[e] : !1;
}
function oa() {
  return Lg;
}
var Og = de({}, Go, { key: function(e) {
  if (e.key) {
    var t = Ag[e.key] || e.key;
    if (t !== "Unidentified") return t;
  }
  return e.type === "keypress" ? (e = $i(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Ig[e.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: oa, charCode: function(e) {
  return e.type === "keypress" ? $i(e) : 0;
}, keyCode: function(e) {
  return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
}, which: function(e) {
  return e.type === "keypress" ? $i(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
} }), Fg = tt(Og), Hg = de({}, El, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), xc = tt(Hg), Vg = de({}, Go, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: oa }), Bg = tt(Vg), jg = de({}, Hr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Ug = tt(jg), Wg = de({}, El, {
  deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  },
  deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), Yg = tt(Wg), Xg = [9, 13, 27, 32], ia = Bt && "CompositionEvent" in window, ho = null;
Bt && "documentMode" in document && (ho = document.documentMode);
var Qg = Bt && "TextEvent" in window && !ho, bd = Bt && (!ia || ho && 8 < ho && 11 >= ho), Sc = " ", _c = !1;
function ep(e, t) {
  switch (e) {
    case "keyup":
      return Xg.indexOf(t.keyCode) !== -1;
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
function tp(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var lr = !1;
function Kg(e, t) {
  switch (e) {
    case "compositionend":
      return tp(t);
    case "keypress":
      return t.which !== 32 ? null : (_c = !0, Sc);
    case "textInput":
      return e = t.data, e === Sc && _c ? null : e;
    default:
      return null;
  }
}
function Gg(e, t) {
  if (lr) return e === "compositionend" || !ia && ep(e, t) ? (e = Jd(), Pi = na = on = null, lr = !1, e) : null;
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
      return bd && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var Zg = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
function Ec(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!Zg[e.type] : t === "textarea";
}
function np(e, t, n, r) {
  Ad(r), t = Zi(t, "onChange"), 0 < t.length && (n = new ra("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
}
var mo = null, Mo = null;
function qg(e) {
  pp(e, 0);
}
function kl(e) {
  var t = ar(e);
  if (Cd(t)) return e;
}
function Jg(e, t) {
  if (e === "change") return t;
}
var rp = !1;
if (Bt) {
  var rs;
  if (Bt) {
    var os = "oninput" in document;
    if (!os) {
      var kc = document.createElement("div");
      kc.setAttribute("oninput", "return;"), os = typeof kc.oninput == "function";
    }
    rs = os;
  } else rs = !1;
  rp = rs && (!document.documentMode || 9 < document.documentMode);
}
function Nc() {
  mo && (mo.detachEvent("onpropertychange", op), Mo = mo = null);
}
function op(e) {
  if (e.propertyName === "value" && kl(Mo)) {
    var t = [];
    np(t, Mo, e, qu(e)), Od(qg, t);
  }
}
function bg(e, t, n) {
  e === "focusin" ? (Nc(), mo = t, Mo = n, mo.attachEvent("onpropertychange", op)) : e === "focusout" && Nc();
}
function ey(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return kl(Mo);
}
function ty(e, t) {
  if (e === "click") return kl(t);
}
function ny(e, t) {
  if (e === "input" || e === "change") return kl(t);
}
function ry(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var xt = typeof Object.is == "function" ? Object.is : ry;
function zo(e, t) {
  if (xt(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var o = n[r];
    if (!Rs.call(t, o) || !xt(e[o], t[o])) return !1;
  }
  return !0;
}
function Cc(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function Mc(e, t) {
  var n = Cc(e);
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
    n = Cc(n);
  }
}
function ip(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? ip(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
}
function lp() {
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
function la(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
}
function oy(e) {
  var t = lp(), n = e.focusedElem, r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && ip(n.ownerDocument.documentElement, n)) {
    if (r !== null && la(n)) {
      if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
      else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
        e = e.getSelection();
        var o = n.textContent.length, i = Math.min(r.start, o);
        r = r.end === void 0 ? i : Math.min(r.end, o), !e.extend && i > r && (o = r, r = i, i = o), o = Mc(n, i);
        var l = Mc(
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
var iy = Bt && "documentMode" in document && 11 >= document.documentMode, sr = null, qs = null, go = null, Js = !1;
function zc(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Js || sr == null || sr !== Ui(r) || (r = sr, "selectionStart" in r && la(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), go && zo(go, r) || (go = r, r = Zi(qs, "onSelect"), 0 < r.length && (t = new ra("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = sr)));
}
function ai(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var ur = { animationend: ai("Animation", "AnimationEnd"), animationiteration: ai("Animation", "AnimationIteration"), animationstart: ai("Animation", "AnimationStart"), transitionend: ai("Transition", "TransitionEnd") }, is = {}, sp = {};
Bt && (sp = document.createElement("div").style, "AnimationEvent" in window || (delete ur.animationend.animation, delete ur.animationiteration.animation, delete ur.animationstart.animation), "TransitionEvent" in window || delete ur.transitionend.transition);
function Nl(e) {
  if (is[e]) return is[e];
  if (!ur[e]) return e;
  var t = ur[e], n;
  for (n in t) if (t.hasOwnProperty(n) && n in sp) return is[e] = t[n];
  return e;
}
var up = Nl("animationend"), ap = Nl("animationiteration"), cp = Nl("animationstart"), fp = Nl("transitionend"), dp = /* @__PURE__ */ new Map(), Tc = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function vn(e, t) {
  dp.set(e, t), Xn(t, [e]);
}
for (var ls = 0; ls < Tc.length; ls++) {
  var ss = Tc[ls], ly = ss.toLowerCase(), sy = ss[0].toUpperCase() + ss.slice(1);
  vn(ly, "on" + sy);
}
vn(up, "onAnimationEnd");
vn(ap, "onAnimationIteration");
vn(cp, "onAnimationStart");
vn("dblclick", "onDoubleClick");
vn("focusin", "onFocus");
vn("focusout", "onBlur");
vn(fp, "onTransitionEnd");
Cr("onMouseEnter", ["mouseout", "mouseover"]);
Cr("onMouseLeave", ["mouseout", "mouseover"]);
Cr("onPointerEnter", ["pointerout", "pointerover"]);
Cr("onPointerLeave", ["pointerout", "pointerover"]);
Xn("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
Xn("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
Xn("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Xn("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
Xn("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
Xn("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var so = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), uy = new Set("cancel close invalid load scroll toggle".split(" ").concat(so));
function Pc(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, lg(r, t, void 0, e), e.currentTarget = null;
}
function pp(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n], o = r.event;
    r = r.listeners;
    e: {
      var i = void 0;
      if (t) for (var l = r.length - 1; 0 <= l; l--) {
        var s = r[l], u = s.instance, a = s.currentTarget;
        if (s = s.listener, u !== i && o.isPropagationStopped()) break e;
        Pc(o, s, a), i = u;
      }
      else for (l = 0; l < r.length; l++) {
        if (s = r[l], u = s.instance, a = s.currentTarget, s = s.listener, u !== i && o.isPropagationStopped()) break e;
        Pc(o, s, a), i = u;
      }
    }
  }
  if (Yi) throw e = Qs, Yi = !1, Qs = null, e;
}
function se(e, t) {
  var n = t[ru];
  n === void 0 && (n = t[ru] = /* @__PURE__ */ new Set());
  var r = e + "__bubble";
  n.has(r) || (hp(t, e, 2, !1), n.add(r));
}
function us(e, t, n) {
  var r = 0;
  t && (r |= 4), hp(n, e, r, t);
}
var ci = "_reactListening" + Math.random().toString(36).slice(2);
function To(e) {
  if (!e[ci]) {
    e[ci] = !0, Sd.forEach(function(n) {
      n !== "selectionchange" && (uy.has(n) || us(n, !1, e), us(n, !0, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[ci] || (t[ci] = !0, us("selectionchange", !1, t));
  }
}
function hp(e, t, n, r) {
  switch (qd(t)) {
    case 1:
      var o = _g;
      break;
    case 4:
      o = Eg;
      break;
    default:
      o = ta;
  }
  n = o.bind(null, t, n, e), o = void 0, !Xs || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (o = !0), r ? o !== void 0 ? e.addEventListener(t, n, { capture: !0, passive: o }) : e.addEventListener(t, n, !0) : o !== void 0 ? e.addEventListener(t, n, { passive: o }) : e.addEventListener(t, n, !1);
}
function as(e, t, n, r, o) {
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
        if (l = Pn(s), l === null) return;
        if (u = l.tag, u === 5 || u === 6) {
          r = i = l;
          continue e;
        }
        s = s.parentNode;
      }
    }
    r = r.return;
  }
  Od(function() {
    var a = i, c = qu(n), f = [];
    e: {
      var d = dp.get(e);
      if (d !== void 0) {
        var m = ra, x = e;
        switch (e) {
          case "keypress":
            if ($i(n) === 0) break e;
          case "keydown":
          case "keyup":
            m = Fg;
            break;
          case "focusin":
            x = "focus", m = ns;
            break;
          case "focusout":
            x = "blur", m = ns;
            break;
          case "beforeblur":
          case "afterblur":
            m = ns;
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
            m = vc;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            m = Cg;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            m = Bg;
            break;
          case up:
          case ap:
          case cp:
            m = Tg;
            break;
          case fp:
            m = Ug;
            break;
          case "scroll":
            m = kg;
            break;
          case "wheel":
            m = Yg;
            break;
          case "copy":
          case "cut":
          case "paste":
            m = $g;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            m = xc;
        }
        var y = (t & 4) !== 0, _ = !y && e === "scroll", p = y ? d !== null ? d + "Capture" : null : d;
        y = [];
        for (var h = a, g; h !== null; ) {
          g = h;
          var v = g.stateNode;
          if (g.tag === 5 && v !== null && (g = v, p !== null && (v = Eo(h, p), v != null && y.push(Po(h, v, g)))), _) break;
          h = h.return;
        }
        0 < y.length && (d = new m(d, x, null, n, c), f.push({ event: d, listeners: y }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (d = e === "mouseover" || e === "pointerover", m = e === "mouseout" || e === "pointerout", d && n !== Ws && (x = n.relatedTarget || n.fromElement) && (Pn(x) || x[jt])) break e;
        if ((m || d) && (d = c.window === c ? c : (d = c.ownerDocument) ? d.defaultView || d.parentWindow : window, m ? (x = n.relatedTarget || n.toElement, m = a, x = x ? Pn(x) : null, x !== null && (_ = Qn(x), x !== _ || x.tag !== 5 && x.tag !== 6) && (x = null)) : (m = null, x = a), m !== x)) {
          if (y = vc, v = "onMouseLeave", p = "onMouseEnter", h = "mouse", (e === "pointerout" || e === "pointerover") && (y = xc, v = "onPointerLeave", p = "onPointerEnter", h = "pointer"), _ = m == null ? d : ar(m), g = x == null ? d : ar(x), d = new y(v, h + "leave", m, n, c), d.target = _, d.relatedTarget = g, v = null, Pn(c) === a && (y = new y(p, h + "enter", x, n, c), y.target = g, y.relatedTarget = _, v = y), _ = v, m && x) t: {
            for (y = m, p = x, h = 0, g = y; g; g = bn(g)) h++;
            for (g = 0, v = p; v; v = bn(v)) g++;
            for (; 0 < h - g; ) y = bn(y), h--;
            for (; 0 < g - h; ) p = bn(p), g--;
            for (; h--; ) {
              if (y === p || p !== null && y === p.alternate) break t;
              y = bn(y), p = bn(p);
            }
            y = null;
          }
          else y = null;
          m !== null && $c(f, d, m, y, !1), x !== null && _ !== null && $c(f, _, x, y, !0);
        }
      }
      e: {
        if (d = a ? ar(a) : window, m = d.nodeName && d.nodeName.toLowerCase(), m === "select" || m === "input" && d.type === "file") var E = Jg;
        else if (Ec(d)) if (rp) E = ny;
        else {
          E = ey;
          var C = bg;
        }
        else (m = d.nodeName) && m.toLowerCase() === "input" && (d.type === "checkbox" || d.type === "radio") && (E = ty);
        if (E && (E = E(e, a))) {
          np(f, E, n, c);
          break e;
        }
        C && C(e, d, a), e === "focusout" && (C = d._wrapperState) && C.controlled && d.type === "number" && Hs(d, "number", d.value);
      }
      switch (C = a ? ar(a) : window, e) {
        case "focusin":
          (Ec(C) || C.contentEditable === "true") && (sr = C, qs = a, go = null);
          break;
        case "focusout":
          go = qs = sr = null;
          break;
        case "mousedown":
          Js = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Js = !1, zc(f, n, c);
          break;
        case "selectionchange":
          if (iy) break;
        case "keydown":
        case "keyup":
          zc(f, n, c);
      }
      var M;
      if (ia) e: {
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
      else lr ? ep(e, n) && (P = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (P = "onCompositionStart");
      P && (bd && n.locale !== "ko" && (lr || P !== "onCompositionStart" ? P === "onCompositionEnd" && lr && (M = Jd()) : (on = c, na = "value" in on ? on.value : on.textContent, lr = !0)), C = Zi(a, P), 0 < C.length && (P = new wc(P, e, null, n, c), f.push({ event: P, listeners: C }), M ? P.data = M : (M = tp(n), M !== null && (P.data = M)))), (M = Qg ? Kg(e, n) : Gg(e, n)) && (a = Zi(a, "onBeforeInput"), 0 < a.length && (c = new wc("onBeforeInput", "beforeinput", null, n, c), f.push({ event: c, listeners: a }), c.data = M));
    }
    pp(f, t);
  });
}
function Po(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function Zi(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var o = e, i = o.stateNode;
    o.tag === 5 && i !== null && (o = i, i = Eo(e, n), i != null && r.unshift(Po(e, i, o)), i = Eo(e, t), i != null && r.push(Po(e, i, o))), e = e.return;
  }
  return r;
}
function bn(e) {
  if (e === null) return null;
  do
    e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function $c(e, t, n, r, o) {
  for (var i = t._reactName, l = []; n !== null && n !== r; ) {
    var s = n, u = s.alternate, a = s.stateNode;
    if (u !== null && u === r) break;
    s.tag === 5 && a !== null && (s = a, o ? (u = Eo(n, i), u != null && l.unshift(Po(n, u, s))) : o || (u = Eo(n, i), u != null && l.push(Po(n, u, s)))), n = n.return;
  }
  l.length !== 0 && e.push({ event: t, listeners: l });
}
var ay = /\r\n?/g, cy = /\u0000|\uFFFD/g;
function Rc(e) {
  return (typeof e == "string" ? e : "" + e).replace(ay, `
`).replace(cy, "");
}
function fi(e, t, n) {
  if (t = Rc(t), Rc(e) !== t && n) throw Error(H(425));
}
function qi() {
}
var bs = null, eu = null;
function tu(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var nu = typeof setTimeout == "function" ? setTimeout : void 0, fy = typeof clearTimeout == "function" ? clearTimeout : void 0, Ac = typeof Promise == "function" ? Promise : void 0, dy = typeof queueMicrotask == "function" ? queueMicrotask : typeof Ac < "u" ? function(e) {
  return Ac.resolve(null).then(e).catch(py);
} : nu;
function py(e) {
  setTimeout(function() {
    throw e;
  });
}
function cs(e, t) {
  var n = t, r = 0;
  do {
    var o = n.nextSibling;
    if (e.removeChild(n), o && o.nodeType === 8) if (n = o.data, n === "/$") {
      if (r === 0) {
        e.removeChild(o), Co(t);
        return;
      }
      r--;
    } else n !== "$" && n !== "$?" && n !== "$!" || r++;
    n = o;
  } while (n);
  Co(t);
}
function cn(e) {
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
function Ic(e) {
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
var Vr = Math.random().toString(36).slice(2), Nt = "__reactFiber$" + Vr, $o = "__reactProps$" + Vr, jt = "__reactContainer$" + Vr, ru = "__reactEvents$" + Vr, hy = "__reactListeners$" + Vr, my = "__reactHandles$" + Vr;
function Pn(e) {
  var t = e[Nt];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if (t = n[jt] || n[Nt]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = Ic(e); e !== null; ) {
        if (n = e[Nt]) return n;
        e = Ic(e);
      }
      return t;
    }
    e = n, n = e.parentNode;
  }
  return null;
}
function Zo(e) {
  return e = e[Nt] || e[jt], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
}
function ar(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(H(33));
}
function Cl(e) {
  return e[$o] || null;
}
var ou = [], cr = -1;
function wn(e) {
  return { current: e };
}
function ue(e) {
  0 > cr || (e.current = ou[cr], ou[cr] = null, cr--);
}
function ie(e, t) {
  cr++, ou[cr] = e.current, e.current = t;
}
var yn = {}, De = wn(yn), Ye = wn(!1), Hn = yn;
function Mr(e, t) {
  var n = e.type.contextTypes;
  if (!n) return yn;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
  var o = {}, i;
  for (i in n) o[i] = t[i];
  return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = o), o;
}
function Xe(e) {
  return e = e.childContextTypes, e != null;
}
function Ji() {
  ue(Ye), ue(De);
}
function Dc(e, t, n) {
  if (De.current !== yn) throw Error(H(168));
  ie(De, t), ie(Ye, n);
}
function mp(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var o in r) if (!(o in t)) throw Error(H(108, b0(e) || "Unknown", o));
  return de({}, n, r);
}
function bi(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || yn, Hn = De.current, ie(De, e), ie(Ye, Ye.current), !0;
}
function Lc(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(H(169));
  n ? (e = mp(e, t, Hn), r.__reactInternalMemoizedMergedChildContext = e, ue(Ye), ue(De), ie(De, e)) : ue(Ye), ie(Ye, n);
}
var Dt = null, Ml = !1, fs = !1;
function gp(e) {
  Dt === null ? Dt = [e] : Dt.push(e);
}
function gy(e) {
  Ml = !0, gp(e);
}
function xn() {
  if (!fs && Dt !== null) {
    fs = !0;
    var e = 0, t = re;
    try {
      var n = Dt;
      for (re = 1; e < n.length; e++) {
        var r = n[e];
        do
          r = r(!0);
        while (r !== null);
      }
      Dt = null, Ml = !1;
    } catch (o) {
      throw Dt !== null && (Dt = Dt.slice(e + 1)), Bd(Ju, xn), o;
    } finally {
      re = t, fs = !1;
    }
  }
  return null;
}
var fr = [], dr = 0, el = null, tl = 0, nt = [], rt = 0, Vn = null, Lt = 1, Ot = "";
function Mn(e, t) {
  fr[dr++] = tl, fr[dr++] = el, el = e, tl = t;
}
function yp(e, t, n) {
  nt[rt++] = Lt, nt[rt++] = Ot, nt[rt++] = Vn, Vn = e;
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
function sa(e) {
  e.return !== null && (Mn(e, 1), yp(e, 1, 0));
}
function ua(e) {
  for (; e === el; ) el = fr[--dr], fr[dr] = null, tl = fr[--dr], fr[dr] = null;
  for (; e === Vn; ) Vn = nt[--rt], nt[rt] = null, Ot = nt[--rt], nt[rt] = null, Lt = nt[--rt], nt[rt] = null;
}
var qe = null, Ze = null, ae = !1, mt = null;
function vp(e, t) {
  var n = it(5, null, null, 0);
  n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
}
function Oc(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, qe = e, Ze = cn(t.firstChild), !0) : !1;
    case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, qe = e, Ze = null, !0) : !1;
    case 13:
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = Vn !== null ? { id: Lt, overflow: Ot } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = it(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, qe = e, Ze = null, !0) : !1;
    default:
      return !1;
  }
}
function iu(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function lu(e) {
  if (ae) {
    var t = Ze;
    if (t) {
      var n = t;
      if (!Oc(e, t)) {
        if (iu(e)) throw Error(H(418));
        t = cn(n.nextSibling);
        var r = qe;
        t && Oc(e, t) ? vp(r, n) : (e.flags = e.flags & -4097 | 2, ae = !1, qe = e);
      }
    } else {
      if (iu(e)) throw Error(H(418));
      e.flags = e.flags & -4097 | 2, ae = !1, qe = e;
    }
  }
}
function Fc(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  qe = e;
}
function di(e) {
  if (e !== qe) return !1;
  if (!ae) return Fc(e), ae = !0, !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !tu(e.type, e.memoizedProps)), t && (t = Ze)) {
    if (iu(e)) throw wp(), Error(H(418));
    for (; t; ) vp(e, t), t = cn(t.nextSibling);
  }
  if (Fc(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(H(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              Ze = cn(e.nextSibling);
              break e;
            }
            t--;
          } else n !== "$" && n !== "$!" && n !== "$?" || t++;
        }
        e = e.nextSibling;
      }
      Ze = null;
    }
  } else Ze = qe ? cn(e.stateNode.nextSibling) : null;
  return !0;
}
function wp() {
  for (var e = Ze; e; ) e = cn(e.nextSibling);
}
function zr() {
  Ze = qe = null, ae = !1;
}
function aa(e) {
  mt === null ? mt = [e] : mt.push(e);
}
var yy = Qt.ReactCurrentBatchConfig;
function Zr(e, t, n) {
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
function pi(e, t) {
  throw e = Object.prototype.toString.call(t), Error(H(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function Hc(e) {
  var t = e._init;
  return t(e._payload);
}
function xp(e) {
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
    return p = hn(p, h), p.index = 0, p.sibling = null, p;
  }
  function i(p, h, g) {
    return p.index = g, e ? (g = p.alternate, g !== null ? (g = g.index, g < h ? (p.flags |= 2, h) : g) : (p.flags |= 2, h)) : (p.flags |= 1048576, h);
  }
  function l(p) {
    return e && p.alternate === null && (p.flags |= 2), p;
  }
  function s(p, h, g, v) {
    return h === null || h.tag !== 6 ? (h = vs(g, p.mode, v), h.return = p, h) : (h = o(h, g), h.return = p, h);
  }
  function u(p, h, g, v) {
    var E = g.type;
    return E === ir ? c(p, h, g.props.children, v, g.key) : h !== null && (h.elementType === E || typeof E == "object" && E !== null && E.$$typeof === qt && Hc(E) === h.type) ? (v = o(h, g.props), v.ref = Zr(p, h, g), v.return = p, v) : (v = Fi(g.type, g.key, g.props, null, p.mode, v), v.ref = Zr(p, h, g), v.return = p, v);
  }
  function a(p, h, g, v) {
    return h === null || h.tag !== 4 || h.stateNode.containerInfo !== g.containerInfo || h.stateNode.implementation !== g.implementation ? (h = ws(g, p.mode, v), h.return = p, h) : (h = o(h, g.children || []), h.return = p, h);
  }
  function c(p, h, g, v, E) {
    return h === null || h.tag !== 7 ? (h = Ln(g, p.mode, v, E), h.return = p, h) : (h = o(h, g), h.return = p, h);
  }
  function f(p, h, g) {
    if (typeof h == "string" && h !== "" || typeof h == "number") return h = vs("" + h, p.mode, g), h.return = p, h;
    if (typeof h == "object" && h !== null) {
      switch (h.$$typeof) {
        case ni:
          return g = Fi(h.type, h.key, h.props, null, p.mode, g), g.ref = Zr(p, null, h), g.return = p, g;
        case or:
          return h = ws(h, p.mode, g), h.return = p, h;
        case qt:
          var v = h._init;
          return f(p, v(h._payload), g);
      }
      if (io(h) || Yr(h)) return h = Ln(h, p.mode, g, null), h.return = p, h;
      pi(p, h);
    }
    return null;
  }
  function d(p, h, g, v) {
    var E = h !== null ? h.key : null;
    if (typeof g == "string" && g !== "" || typeof g == "number") return E !== null ? null : s(p, h, "" + g, v);
    if (typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case ni:
          return g.key === E ? u(p, h, g, v) : null;
        case or:
          return g.key === E ? a(p, h, g, v) : null;
        case qt:
          return E = g._init, d(
            p,
            h,
            E(g._payload),
            v
          );
      }
      if (io(g) || Yr(g)) return E !== null ? null : c(p, h, g, v, null);
      pi(p, g);
    }
    return null;
  }
  function m(p, h, g, v, E) {
    if (typeof v == "string" && v !== "" || typeof v == "number") return p = p.get(g) || null, s(h, p, "" + v, E);
    if (typeof v == "object" && v !== null) {
      switch (v.$$typeof) {
        case ni:
          return p = p.get(v.key === null ? g : v.key) || null, u(h, p, v, E);
        case or:
          return p = p.get(v.key === null ? g : v.key) || null, a(h, p, v, E);
        case qt:
          var C = v._init;
          return m(p, h, g, C(v._payload), E);
      }
      if (io(v) || Yr(v)) return p = p.get(g) || null, c(h, p, v, E, null);
      pi(h, v);
    }
    return null;
  }
  function x(p, h, g, v) {
    for (var E = null, C = null, M = h, P = h = 0, A = null; M !== null && P < g.length; P++) {
      M.index > P ? (A = M, M = null) : A = M.sibling;
      var I = d(p, M, g[P], v);
      if (I === null) {
        M === null && (M = A);
        break;
      }
      e && M && I.alternate === null && t(p, M), h = i(I, h, P), C === null ? E = I : C.sibling = I, C = I, M = A;
    }
    if (P === g.length) return n(p, M), ae && Mn(p, P), E;
    if (M === null) {
      for (; P < g.length; P++) M = f(p, g[P], v), M !== null && (h = i(M, h, P), C === null ? E = M : C.sibling = M, C = M);
      return ae && Mn(p, P), E;
    }
    for (M = r(p, M); P < g.length; P++) A = m(M, p, P, g[P], v), A !== null && (e && A.alternate !== null && M.delete(A.key === null ? P : A.key), h = i(A, h, P), C === null ? E = A : C.sibling = A, C = A);
    return e && M.forEach(function(F) {
      return t(p, F);
    }), ae && Mn(p, P), E;
  }
  function y(p, h, g, v) {
    var E = Yr(g);
    if (typeof E != "function") throw Error(H(150));
    if (g = E.call(g), g == null) throw Error(H(151));
    for (var C = E = null, M = h, P = h = 0, A = null, I = g.next(); M !== null && !I.done; P++, I = g.next()) {
      M.index > P ? (A = M, M = null) : A = M.sibling;
      var F = d(p, M, I.value, v);
      if (F === null) {
        M === null && (M = A);
        break;
      }
      e && M && F.alternate === null && t(p, M), h = i(F, h, P), C === null ? E = F : C.sibling = F, C = F, M = A;
    }
    if (I.done) return n(
      p,
      M
    ), ae && Mn(p, P), E;
    if (M === null) {
      for (; !I.done; P++, I = g.next()) I = f(p, I.value, v), I !== null && (h = i(I, h, P), C === null ? E = I : C.sibling = I, C = I);
      return ae && Mn(p, P), E;
    }
    for (M = r(p, M); !I.done; P++, I = g.next()) I = m(M, p, P, I.value, v), I !== null && (e && I.alternate !== null && M.delete(I.key === null ? P : I.key), h = i(I, h, P), C === null ? E = I : C.sibling = I, C = I);
    return e && M.forEach(function(B) {
      return t(p, B);
    }), ae && Mn(p, P), E;
  }
  function _(p, h, g, v) {
    if (typeof g == "object" && g !== null && g.type === ir && g.key === null && (g = g.props.children), typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case ni:
          e: {
            for (var E = g.key, C = h; C !== null; ) {
              if (C.key === E) {
                if (E = g.type, E === ir) {
                  if (C.tag === 7) {
                    n(p, C.sibling), h = o(C, g.props.children), h.return = p, p = h;
                    break e;
                  }
                } else if (C.elementType === E || typeof E == "object" && E !== null && E.$$typeof === qt && Hc(E) === C.type) {
                  n(p, C.sibling), h = o(C, g.props), h.ref = Zr(p, C, g), h.return = p, p = h;
                  break e;
                }
                n(p, C);
                break;
              } else t(p, C);
              C = C.sibling;
            }
            g.type === ir ? (h = Ln(g.props.children, p.mode, v, g.key), h.return = p, p = h) : (v = Fi(g.type, g.key, g.props, null, p.mode, v), v.ref = Zr(p, h, g), v.return = p, p = v);
          }
          return l(p);
        case or:
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
            h = ws(g, p.mode, v), h.return = p, p = h;
          }
          return l(p);
        case qt:
          return C = g._init, _(p, h, C(g._payload), v);
      }
      if (io(g)) return x(p, h, g, v);
      if (Yr(g)) return y(p, h, g, v);
      pi(p, g);
    }
    return typeof g == "string" && g !== "" || typeof g == "number" ? (g = "" + g, h !== null && h.tag === 6 ? (n(p, h.sibling), h = o(h, g), h.return = p, p = h) : (n(p, h), h = vs(g, p.mode, v), h.return = p, p = h), l(p)) : n(p, h);
  }
  return _;
}
var Tr = xp(!0), Sp = xp(!1), nl = wn(null), rl = null, pr = null, ca = null;
function fa() {
  ca = pr = rl = null;
}
function da(e) {
  var t = nl.current;
  ue(nl), e._currentValue = t;
}
function su(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function Sr(e, t) {
  rl = e, ca = pr = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (Ue = !0), e.firstContext = null);
}
function ut(e) {
  var t = e._currentValue;
  if (ca !== e) if (e = { context: e, memoizedValue: t, next: null }, pr === null) {
    if (rl === null) throw Error(H(308));
    pr = e, rl.dependencies = { lanes: 0, firstContext: e };
  } else pr = pr.next = e;
  return t;
}
var $n = null;
function pa(e) {
  $n === null ? $n = [e] : $n.push(e);
}
function _p(e, t, n, r) {
  var o = t.interleaved;
  return o === null ? (n.next = n, pa(t)) : (n.next = o.next, o.next = n), t.interleaved = n, Ut(e, r);
}
function Ut(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; ) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
  return n.tag === 3 ? n.stateNode : null;
}
var Jt = !1;
function ha(e) {
  e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function Ep(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
}
function Ht(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function fn(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, b & 2) {
    var o = r.pending;
    return o === null ? t.next = t : (t.next = o.next, o.next = t), r.pending = t, Ut(e, n);
  }
  return o = r.interleaved, o === null ? (t.next = t, pa(r)) : (t.next = o.next, o.next = t), r.interleaved = t, Ut(e, n);
}
function Ri(e, t, n) {
  if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, bu(e, n);
  }
}
function Vc(e, t) {
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
function ol(e, t, n, r) {
  var o = e.updateQueue;
  Jt = !1;
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
          var x = e, y = s;
          switch (d = t, m = n, y.tag) {
            case 1:
              if (x = y.payload, typeof x == "function") {
                f = x.call(m, f, d);
                break e;
              }
              f = x;
              break e;
            case 3:
              x.flags = x.flags & -65537 | 128;
            case 0:
              if (x = y.payload, d = typeof x == "function" ? x.call(m, f, d) : x, d == null) break e;
              f = de({}, f, d);
              break e;
            case 2:
              Jt = !0;
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
    jn |= l, e.lanes = l, e.memoizedState = f;
  }
}
function Bc(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t], o = r.callback;
    if (o !== null) {
      if (r.callback = null, r = n, typeof o != "function") throw Error(H(191, o));
      o.call(r);
    }
  }
}
var qo = {}, Mt = wn(qo), Ro = wn(qo), Ao = wn(qo);
function Rn(e) {
  if (e === qo) throw Error(H(174));
  return e;
}
function ma(e, t) {
  switch (ie(Ao, t), ie(Ro, e), ie(Mt, qo), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Bs(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Bs(t, e);
  }
  ue(Mt), ie(Mt, t);
}
function Pr() {
  ue(Mt), ue(Ro), ue(Ao);
}
function kp(e) {
  Rn(Ao.current);
  var t = Rn(Mt.current), n = Bs(t, e.type);
  t !== n && (ie(Ro, e), ie(Mt, n));
}
function ga(e) {
  Ro.current === e && (ue(Mt), ue(Ro));
}
var ce = wn(0);
function il(e) {
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
var ds = [];
function ya() {
  for (var e = 0; e < ds.length; e++) ds[e]._workInProgressVersionPrimary = null;
  ds.length = 0;
}
var Ai = Qt.ReactCurrentDispatcher, ps = Qt.ReactCurrentBatchConfig, Bn = 0, fe = null, we = null, _e = null, ll = !1, yo = !1, Io = 0, vy = 0;
function Re() {
  throw Error(H(321));
}
function va(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!xt(e[n], t[n])) return !1;
  return !0;
}
function wa(e, t, n, r, o, i) {
  if (Bn = i, fe = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, Ai.current = e === null || e.memoizedState === null ? _y : Ey, e = n(r, o), yo) {
    i = 0;
    do {
      if (yo = !1, Io = 0, 25 <= i) throw Error(H(301));
      i += 1, _e = we = null, t.updateQueue = null, Ai.current = ky, e = n(r, o);
    } while (yo);
  }
  if (Ai.current = sl, t = we !== null && we.next !== null, Bn = 0, _e = we = fe = null, ll = !1, t) throw Error(H(300));
  return e;
}
function xa() {
  var e = Io !== 0;
  return Io = 0, e;
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
function Do(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function hs(e) {
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
      if ((Bn & c) === c) u !== null && (u = u.next = { lane: 0, action: a.action, hasEagerState: a.hasEagerState, eagerState: a.eagerState, next: null }), r = a.hasEagerState ? a.eagerState : e(r, a.action);
      else {
        var f = {
          lane: c,
          action: a.action,
          hasEagerState: a.hasEagerState,
          eagerState: a.eagerState,
          next: null
        };
        u === null ? (s = u = f, l = r) : u = u.next = f, fe.lanes |= c, jn |= c;
      }
      a = a.next;
    } while (a !== null && a !== i);
    u === null ? l = r : u.next = s, xt(r, t.memoizedState) || (Ue = !0), t.memoizedState = r, t.baseState = l, t.baseQueue = u, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    o = e;
    do
      i = o.lane, fe.lanes |= i, jn |= i, o = o.next;
    while (o !== e);
  } else o === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function ms(e) {
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
    xt(i, t.memoizedState) || (Ue = !0), t.memoizedState = i, t.baseQueue === null && (t.baseState = i), n.lastRenderedState = i;
  }
  return [i, r];
}
function Np() {
}
function Cp(e, t) {
  var n = fe, r = at(), o = t(), i = !xt(r.memoizedState, o);
  if (i && (r.memoizedState = o, Ue = !0), r = r.queue, Sa(Tp.bind(null, n, r, e), [e]), r.getSnapshot !== t || i || _e !== null && _e.memoizedState.tag & 1) {
    if (n.flags |= 2048, Lo(9, zp.bind(null, n, r, o, t), void 0, null), Ee === null) throw Error(H(349));
    Bn & 30 || Mp(n, t, o);
  }
  return o;
}
function Mp(e, t, n) {
  e.flags |= 16384, e = { getSnapshot: t, value: n }, t = fe.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, fe.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function zp(e, t, n, r) {
  t.value = n, t.getSnapshot = r, Pp(t) && $p(e);
}
function Tp(e, t, n) {
  return n(function() {
    Pp(t) && $p(e);
  });
}
function Pp(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !xt(e, n);
  } catch {
    return !0;
  }
}
function $p(e) {
  var t = Ut(e, 1);
  t !== null && vt(t, e, 1, -1);
}
function jc(e) {
  var t = kt();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Do, lastRenderedState: e }, t.queue = e, e = e.dispatch = Sy.bind(null, fe, e), [t.memoizedState, e];
}
function Lo(e, t, n, r) {
  return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = fe.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, fe.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function Rp() {
  return at().memoizedState;
}
function Ii(e, t, n, r) {
  var o = kt();
  fe.flags |= e, o.memoizedState = Lo(1 | t, n, void 0, r === void 0 ? null : r);
}
function zl(e, t, n, r) {
  var o = at();
  r = r === void 0 ? null : r;
  var i = void 0;
  if (we !== null) {
    var l = we.memoizedState;
    if (i = l.destroy, r !== null && va(r, l.deps)) {
      o.memoizedState = Lo(t, n, i, r);
      return;
    }
  }
  fe.flags |= e, o.memoizedState = Lo(1 | t, n, i, r);
}
function Uc(e, t) {
  return Ii(8390656, 8, e, t);
}
function Sa(e, t) {
  return zl(2048, 8, e, t);
}
function Ap(e, t) {
  return zl(4, 2, e, t);
}
function Ip(e, t) {
  return zl(4, 4, e, t);
}
function Dp(e, t) {
  if (typeof t == "function") return e = e(), t(e), function() {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function() {
    t.current = null;
  };
}
function Lp(e, t, n) {
  return n = n != null ? n.concat([e]) : null, zl(4, 4, Dp.bind(null, t, e), n);
}
function _a() {
}
function Op(e, t) {
  var n = at();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && va(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function Fp(e, t) {
  var n = at();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && va(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function Hp(e, t, n) {
  return Bn & 21 ? (xt(n, t) || (n = Wd(), fe.lanes |= n, jn |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, Ue = !0), e.memoizedState = n);
}
function wy(e, t) {
  var n = re;
  re = n !== 0 && 4 > n ? n : 4, e(!0);
  var r = ps.transition;
  ps.transition = {};
  try {
    e(!1), t();
  } finally {
    re = n, ps.transition = r;
  }
}
function Vp() {
  return at().memoizedState;
}
function xy(e, t, n) {
  var r = pn(e);
  if (n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, Bp(e)) jp(t, n);
  else if (n = _p(e, t, n, r), n !== null) {
    var o = He();
    vt(n, e, r, o), Up(n, t, r);
  }
}
function Sy(e, t, n) {
  var r = pn(e), o = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (Bp(e)) jp(t, o);
  else {
    var i = e.alternate;
    if (e.lanes === 0 && (i === null || i.lanes === 0) && (i = t.lastRenderedReducer, i !== null)) try {
      var l = t.lastRenderedState, s = i(l, n);
      if (o.hasEagerState = !0, o.eagerState = s, xt(s, l)) {
        var u = t.interleaved;
        u === null ? (o.next = o, pa(t)) : (o.next = u.next, u.next = o), t.interleaved = o;
        return;
      }
    } catch {
    } finally {
    }
    n = _p(e, t, o, r), n !== null && (o = He(), vt(n, e, r, o), Up(n, t, r));
  }
}
function Bp(e) {
  var t = e.alternate;
  return e === fe || t !== null && t === fe;
}
function jp(e, t) {
  yo = ll = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function Up(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, bu(e, n);
  }
}
var sl = { readContext: ut, useCallback: Re, useContext: Re, useEffect: Re, useImperativeHandle: Re, useInsertionEffect: Re, useLayoutEffect: Re, useMemo: Re, useReducer: Re, useRef: Re, useState: Re, useDebugValue: Re, useDeferredValue: Re, useTransition: Re, useMutableSource: Re, useSyncExternalStore: Re, useId: Re, unstable_isNewReconciler: !1 }, _y = { readContext: ut, useCallback: function(e, t) {
  return kt().memoizedState = [e, t === void 0 ? null : t], e;
}, useContext: ut, useEffect: Uc, useImperativeHandle: function(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Ii(
    4194308,
    4,
    Dp.bind(null, t, e),
    n
  );
}, useLayoutEffect: function(e, t) {
  return Ii(4194308, 4, e, t);
}, useInsertionEffect: function(e, t) {
  return Ii(4, 2, e, t);
}, useMemo: function(e, t) {
  var n = kt();
  return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
}, useReducer: function(e, t, n) {
  var r = kt();
  return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = xy.bind(null, fe, e), [r.memoizedState, e];
}, useRef: function(e) {
  var t = kt();
  return e = { current: e }, t.memoizedState = e;
}, useState: jc, useDebugValue: _a, useDeferredValue: function(e) {
  return kt().memoizedState = e;
}, useTransition: function() {
  var e = jc(!1), t = e[0];
  return e = wy.bind(null, e[1]), kt().memoizedState = e, [t, e];
}, useMutableSource: function() {
}, useSyncExternalStore: function(e, t, n) {
  var r = fe, o = kt();
  if (ae) {
    if (n === void 0) throw Error(H(407));
    n = n();
  } else {
    if (n = t(), Ee === null) throw Error(H(349));
    Bn & 30 || Mp(r, t, n);
  }
  o.memoizedState = n;
  var i = { value: n, getSnapshot: t };
  return o.queue = i, Uc(Tp.bind(
    null,
    r,
    i,
    e
  ), [e]), r.flags |= 2048, Lo(9, zp.bind(null, r, i, n, t), void 0, null), n;
}, useId: function() {
  var e = kt(), t = Ee.identifierPrefix;
  if (ae) {
    var n = Ot, r = Lt;
    n = (r & ~(1 << 32 - yt(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = Io++, 0 < n && (t += "H" + n.toString(32)), t += ":";
  } else n = vy++, t = ":" + t + "r" + n.toString(32) + ":";
  return e.memoizedState = t;
}, unstable_isNewReconciler: !1 }, Ey = {
  readContext: ut,
  useCallback: Op,
  useContext: ut,
  useEffect: Sa,
  useImperativeHandle: Lp,
  useInsertionEffect: Ap,
  useLayoutEffect: Ip,
  useMemo: Fp,
  useReducer: hs,
  useRef: Rp,
  useState: function() {
    return hs(Do);
  },
  useDebugValue: _a,
  useDeferredValue: function(e) {
    var t = at();
    return Hp(t, we.memoizedState, e);
  },
  useTransition: function() {
    var e = hs(Do)[0], t = at().memoizedState;
    return [e, t];
  },
  useMutableSource: Np,
  useSyncExternalStore: Cp,
  useId: Vp,
  unstable_isNewReconciler: !1
}, ky = { readContext: ut, useCallback: Op, useContext: ut, useEffect: Sa, useImperativeHandle: Lp, useInsertionEffect: Ap, useLayoutEffect: Ip, useMemo: Fp, useReducer: ms, useRef: Rp, useState: function() {
  return ms(Do);
}, useDebugValue: _a, useDeferredValue: function(e) {
  var t = at();
  return we === null ? t.memoizedState = e : Hp(t, we.memoizedState, e);
}, useTransition: function() {
  var e = ms(Do)[0], t = at().memoizedState;
  return [e, t];
}, useMutableSource: Np, useSyncExternalStore: Cp, useId: Vp, unstable_isNewReconciler: !1 };
function dt(e, t) {
  if (e && e.defaultProps) {
    t = de({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function uu(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : de({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var Tl = { isMounted: function(e) {
  return (e = e._reactInternals) ? Qn(e) === e : !1;
}, enqueueSetState: function(e, t, n) {
  e = e._reactInternals;
  var r = He(), o = pn(e), i = Ht(r, o);
  i.payload = t, n != null && (i.callback = n), t = fn(e, i, o), t !== null && (vt(t, e, o, r), Ri(t, e, o));
}, enqueueReplaceState: function(e, t, n) {
  e = e._reactInternals;
  var r = He(), o = pn(e), i = Ht(r, o);
  i.tag = 1, i.payload = t, n != null && (i.callback = n), t = fn(e, i, o), t !== null && (vt(t, e, o, r), Ri(t, e, o));
}, enqueueForceUpdate: function(e, t) {
  e = e._reactInternals;
  var n = He(), r = pn(e), o = Ht(n, r);
  o.tag = 2, t != null && (o.callback = t), t = fn(e, o, r), t !== null && (vt(t, e, r, n), Ri(t, e, r));
} };
function Wc(e, t, n, r, o, i, l) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, i, l) : t.prototype && t.prototype.isPureReactComponent ? !zo(n, r) || !zo(o, i) : !0;
}
function Wp(e, t, n) {
  var r = !1, o = yn, i = t.contextType;
  return typeof i == "object" && i !== null ? i = ut(i) : (o = Xe(t) ? Hn : De.current, r = t.contextTypes, i = (r = r != null) ? Mr(e, o) : yn), t = new t(n, i), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = Tl, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = o, e.__reactInternalMemoizedMaskedChildContext = i), t;
}
function Yc(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Tl.enqueueReplaceState(t, t.state, null);
}
function au(e, t, n, r) {
  var o = e.stateNode;
  o.props = n, o.state = e.memoizedState, o.refs = {}, ha(e);
  var i = t.contextType;
  typeof i == "object" && i !== null ? o.context = ut(i) : (i = Xe(t) ? Hn : De.current, o.context = Mr(e, i)), o.state = e.memoizedState, i = t.getDerivedStateFromProps, typeof i == "function" && (uu(e, t, i, n), o.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof o.getSnapshotBeforeUpdate == "function" || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (t = o.state, typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount(), t !== o.state && Tl.enqueueReplaceState(o, o.state, null), ol(e, n, o, r), o.state = e.memoizedState), typeof o.componentDidMount == "function" && (e.flags |= 4194308);
}
function $r(e, t) {
  try {
    var n = "", r = t;
    do
      n += J0(r), r = r.return;
    while (r);
    var o = n;
  } catch (i) {
    o = `
Error generating stack: ` + i.message + `
` + i.stack;
  }
  return { value: e, source: t, stack: o, digest: null };
}
function gs(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function cu(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function() {
      throw n;
    });
  }
}
var Ny = typeof WeakMap == "function" ? WeakMap : Map;
function Yp(e, t, n) {
  n = Ht(-1, n), n.tag = 3, n.payload = { element: null };
  var r = t.value;
  return n.callback = function() {
    al || (al = !0, xu = r), cu(e, t);
  }, n;
}
function Xp(e, t, n) {
  n = Ht(-1, n), n.tag = 3;
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var o = t.value;
    n.payload = function() {
      return r(o);
    }, n.callback = function() {
      cu(e, t);
    };
  }
  var i = e.stateNode;
  return i !== null && typeof i.componentDidCatch == "function" && (n.callback = function() {
    cu(e, t), typeof r != "function" && (dn === null ? dn = /* @__PURE__ */ new Set([this]) : dn.add(this));
    var l = t.stack;
    this.componentDidCatch(t.value, { componentStack: l !== null ? l : "" });
  }), n;
}
function Xc(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new Ny();
    var o = /* @__PURE__ */ new Set();
    r.set(t, o);
  } else o = r.get(t), o === void 0 && (o = /* @__PURE__ */ new Set(), r.set(t, o));
  o.has(n) || (o.add(n), e = Hy.bind(null, e, t, n), t.then(e, e));
}
function Qc(e) {
  do {
    var t;
    if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function Kc(e, t, n, r, o) {
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = o, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = Ht(-1, 1), t.tag = 2, fn(n, t, 1))), n.lanes |= 1), e);
}
var Cy = Qt.ReactCurrentOwner, Ue = !1;
function Fe(e, t, n, r) {
  t.child = e === null ? Sp(t, null, n, r) : Tr(t, e.child, n, r);
}
function Gc(e, t, n, r, o) {
  n = n.render;
  var i = t.ref;
  return Sr(t, o), r = wa(e, t, n, r, i, o), n = xa(), e !== null && !Ue ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~o, Wt(e, t, o)) : (ae && n && sa(t), t.flags |= 1, Fe(e, t, r, o), t.child);
}
function Zc(e, t, n, r, o) {
  if (e === null) {
    var i = n.type;
    return typeof i == "function" && !Pa(i) && i.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = i, Qp(e, t, i, r, o)) : (e = Fi(n.type, null, r, t, t.mode, o), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (i = e.child, !(e.lanes & o)) {
    var l = i.memoizedProps;
    if (n = n.compare, n = n !== null ? n : zo, n(l, r) && e.ref === t.ref) return Wt(e, t, o);
  }
  return t.flags |= 1, e = hn(i, r), e.ref = t.ref, e.return = t, t.child = e;
}
function Qp(e, t, n, r, o) {
  if (e !== null) {
    var i = e.memoizedProps;
    if (zo(i, r) && e.ref === t.ref) if (Ue = !1, t.pendingProps = r = i, (e.lanes & o) !== 0) e.flags & 131072 && (Ue = !0);
    else return t.lanes = e.lanes, Wt(e, t, o);
  }
  return fu(e, t, n, r, o);
}
function Kp(e, t, n) {
  var r = t.pendingProps, o = r.children, i = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, ie(mr, Ge), Ge |= n;
  else {
    if (!(n & 1073741824)) return e = i !== null ? i.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, ie(mr, Ge), Ge |= e, null;
    t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = i !== null ? i.baseLanes : n, ie(mr, Ge), Ge |= r;
  }
  else i !== null ? (r = i.baseLanes | n, t.memoizedState = null) : r = n, ie(mr, Ge), Ge |= r;
  return Fe(e, t, o, n), t.child;
}
function Gp(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function fu(e, t, n, r, o) {
  var i = Xe(n) ? Hn : De.current;
  return i = Mr(t, i), Sr(t, o), n = wa(e, t, n, r, i, o), r = xa(), e !== null && !Ue ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~o, Wt(e, t, o)) : (ae && r && sa(t), t.flags |= 1, Fe(e, t, n, o), t.child);
}
function qc(e, t, n, r, o) {
  if (Xe(n)) {
    var i = !0;
    bi(t);
  } else i = !1;
  if (Sr(t, o), t.stateNode === null) Di(e, t), Wp(t, n, r), au(t, n, r, o), r = !0;
  else if (e === null) {
    var l = t.stateNode, s = t.memoizedProps;
    l.props = s;
    var u = l.context, a = n.contextType;
    typeof a == "object" && a !== null ? a = ut(a) : (a = Xe(n) ? Hn : De.current, a = Mr(t, a));
    var c = n.getDerivedStateFromProps, f = typeof c == "function" || typeof l.getSnapshotBeforeUpdate == "function";
    f || typeof l.UNSAFE_componentWillReceiveProps != "function" && typeof l.componentWillReceiveProps != "function" || (s !== r || u !== a) && Yc(t, l, r, a), Jt = !1;
    var d = t.memoizedState;
    l.state = d, ol(t, r, l, o), u = t.memoizedState, s !== r || d !== u || Ye.current || Jt ? (typeof c == "function" && (uu(t, n, c, r), u = t.memoizedState), (s = Jt || Wc(t, n, s, r, d, u, a)) ? (f || typeof l.UNSAFE_componentWillMount != "function" && typeof l.componentWillMount != "function" || (typeof l.componentWillMount == "function" && l.componentWillMount(), typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount()), typeof l.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof l.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = u), l.props = r, l.state = u, l.context = a, r = s) : (typeof l.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
  } else {
    l = t.stateNode, Ep(e, t), s = t.memoizedProps, a = t.type === t.elementType ? s : dt(t.type, s), l.props = a, f = t.pendingProps, d = l.context, u = n.contextType, typeof u == "object" && u !== null ? u = ut(u) : (u = Xe(n) ? Hn : De.current, u = Mr(t, u));
    var m = n.getDerivedStateFromProps;
    (c = typeof m == "function" || typeof l.getSnapshotBeforeUpdate == "function") || typeof l.UNSAFE_componentWillReceiveProps != "function" && typeof l.componentWillReceiveProps != "function" || (s !== f || d !== u) && Yc(t, l, r, u), Jt = !1, d = t.memoizedState, l.state = d, ol(t, r, l, o);
    var x = t.memoizedState;
    s !== f || d !== x || Ye.current || Jt ? (typeof m == "function" && (uu(t, n, m, r), x = t.memoizedState), (a = Jt || Wc(t, n, a, r, d, x, u) || !1) ? (c || typeof l.UNSAFE_componentWillUpdate != "function" && typeof l.componentWillUpdate != "function" || (typeof l.componentWillUpdate == "function" && l.componentWillUpdate(r, x, u), typeof l.UNSAFE_componentWillUpdate == "function" && l.UNSAFE_componentWillUpdate(r, x, u)), typeof l.componentDidUpdate == "function" && (t.flags |= 4), typeof l.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof l.componentDidUpdate != "function" || s === e.memoizedProps && d === e.memoizedState || (t.flags |= 4), typeof l.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && d === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = x), l.props = r, l.state = x, l.context = u, r = a) : (typeof l.componentDidUpdate != "function" || s === e.memoizedProps && d === e.memoizedState || (t.flags |= 4), typeof l.getSnapshotBeforeUpdate != "function" || s === e.memoizedProps && d === e.memoizedState || (t.flags |= 1024), r = !1);
  }
  return du(e, t, n, r, i, o);
}
function du(e, t, n, r, o, i) {
  Gp(e, t);
  var l = (t.flags & 128) !== 0;
  if (!r && !l) return o && Lc(t, n, !1), Wt(e, t, i);
  r = t.stateNode, Cy.current = t;
  var s = l && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && l ? (t.child = Tr(t, e.child, null, i), t.child = Tr(t, null, s, i)) : Fe(e, t, s, i), t.memoizedState = r.state, o && Lc(t, n, !0), t.child;
}
function Zp(e) {
  var t = e.stateNode;
  t.pendingContext ? Dc(e, t.pendingContext, t.pendingContext !== t.context) : t.context && Dc(e, t.context, !1), ma(e, t.containerInfo);
}
function Jc(e, t, n, r, o) {
  return zr(), aa(o), t.flags |= 256, Fe(e, t, n, r), t.child;
}
var pu = { dehydrated: null, treeContext: null, retryLane: 0 };
function hu(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function qp(e, t, n) {
  var r = t.pendingProps, o = ce.current, i = !1, l = (t.flags & 128) !== 0, s;
  if ((s = l) || (s = e !== null && e.memoizedState === null ? !1 : (o & 2) !== 0), s ? (i = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (o |= 1), ie(ce, o & 1), e === null)
    return lu(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (l = r.children, e = r.fallback, i ? (r = t.mode, i = t.child, l = { mode: "hidden", children: l }, !(r & 1) && i !== null ? (i.childLanes = 0, i.pendingProps = l) : i = Rl(l, r, 0, null), e = Ln(e, r, n, null), i.return = t, e.return = t, i.sibling = e, t.child = i, t.child.memoizedState = hu(n), t.memoizedState = pu, e) : Ea(t, l));
  if (o = e.memoizedState, o !== null && (s = o.dehydrated, s !== null)) return My(e, t, l, r, s, o, n);
  if (i) {
    i = r.fallback, l = t.mode, o = e.child, s = o.sibling;
    var u = { mode: "hidden", children: r.children };
    return !(l & 1) && t.child !== o ? (r = t.child, r.childLanes = 0, r.pendingProps = u, t.deletions = null) : (r = hn(o, u), r.subtreeFlags = o.subtreeFlags & 14680064), s !== null ? i = hn(s, i) : (i = Ln(i, l, n, null), i.flags |= 2), i.return = t, r.return = t, r.sibling = i, t.child = r, r = i, i = t.child, l = e.child.memoizedState, l = l === null ? hu(n) : { baseLanes: l.baseLanes | n, cachePool: null, transitions: l.transitions }, i.memoizedState = l, i.childLanes = e.childLanes & ~n, t.memoizedState = pu, r;
  }
  return i = e.child, e = i.sibling, r = hn(i, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function Ea(e, t) {
  return t = Rl({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
}
function hi(e, t, n, r) {
  return r !== null && aa(r), Tr(t, e.child, null, n), e = Ea(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function My(e, t, n, r, o, i, l) {
  if (n)
    return t.flags & 256 ? (t.flags &= -257, r = gs(Error(H(422))), hi(e, t, l, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (i = r.fallback, o = t.mode, r = Rl({ mode: "visible", children: r.children }, o, 0, null), i = Ln(i, o, l, null), i.flags |= 2, r.return = t, i.return = t, r.sibling = i, t.child = r, t.mode & 1 && Tr(t, e.child, null, l), t.child.memoizedState = hu(l), t.memoizedState = pu, i);
  if (!(t.mode & 1)) return hi(e, t, l, null);
  if (o.data === "$!") {
    if (r = o.nextSibling && o.nextSibling.dataset, r) var s = r.dgst;
    return r = s, i = Error(H(419)), r = gs(i, r, void 0), hi(e, t, l, r);
  }
  if (s = (l & e.childLanes) !== 0, Ue || s) {
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
      o = o & (r.suspendedLanes | l) ? 0 : o, o !== 0 && o !== i.retryLane && (i.retryLane = o, Ut(e, o), vt(r, e, o, -1));
    }
    return Ta(), r = gs(Error(H(421))), hi(e, t, l, r);
  }
  return o.data === "$?" ? (t.flags |= 128, t.child = e.child, t = Vy.bind(null, e), o._reactRetry = t, null) : (e = i.treeContext, Ze = cn(o.nextSibling), qe = t, ae = !0, mt = null, e !== null && (nt[rt++] = Lt, nt[rt++] = Ot, nt[rt++] = Vn, Lt = e.id, Ot = e.overflow, Vn = t), t = Ea(t, r.children), t.flags |= 4096, t);
}
function bc(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), su(e.return, t, n);
}
function ys(e, t, n, r, o) {
  var i = e.memoizedState;
  i === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: o } : (i.isBackwards = t, i.rendering = null, i.renderingStartTime = 0, i.last = r, i.tail = n, i.tailMode = o);
}
function Jp(e, t, n) {
  var r = t.pendingProps, o = r.revealOrder, i = r.tail;
  if (Fe(e, t, r.children, n), r = ce.current, r & 2) r = r & 1 | 2, t.flags |= 128;
  else {
    if (e !== null && e.flags & 128) e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && bc(e, n, t);
      else if (e.tag === 19) bc(e, n, t);
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
      for (n = t.child, o = null; n !== null; ) e = n.alternate, e !== null && il(e) === null && (o = n), n = n.sibling;
      n = o, n === null ? (o = t.child, t.child = null) : (o = n.sibling, n.sibling = null), ys(t, !1, o, n, i);
      break;
    case "backwards":
      for (n = null, o = t.child, t.child = null; o !== null; ) {
        if (e = o.alternate, e !== null && il(e) === null) {
          t.child = o;
          break;
        }
        e = o.sibling, o.sibling = n, n = o, o = e;
      }
      ys(t, !0, n, null, i);
      break;
    case "together":
      ys(t, !1, null, null, void 0);
      break;
    default:
      t.memoizedState = null;
  }
  return t.child;
}
function Di(e, t) {
  !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
}
function Wt(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies), jn |= t.lanes, !(n & t.childLanes)) return null;
  if (e !== null && t.child !== e.child) throw Error(H(153));
  if (t.child !== null) {
    for (e = t.child, n = hn(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = hn(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function zy(e, t, n) {
  switch (t.tag) {
    case 3:
      Zp(t), zr();
      break;
    case 5:
      kp(t);
      break;
    case 1:
      Xe(t.type) && bi(t);
      break;
    case 4:
      ma(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context, o = t.memoizedProps.value;
      ie(nl, r._currentValue), r._currentValue = o;
      break;
    case 13:
      if (r = t.memoizedState, r !== null)
        return r.dehydrated !== null ? (ie(ce, ce.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? qp(e, t, n) : (ie(ce, ce.current & 1), e = Wt(e, t, n), e !== null ? e.sibling : null);
      ie(ce, ce.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return Jp(e, t, n);
        t.flags |= 128;
      }
      if (o = t.memoizedState, o !== null && (o.rendering = null, o.tail = null, o.lastEffect = null), ie(ce, ce.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, Kp(e, t, n);
  }
  return Wt(e, t, n);
}
var bp, mu, eh, th;
bp = function(e, t) {
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
mu = function() {
};
eh = function(e, t, n, r) {
  var o = e.memoizedProps;
  if (o !== r) {
    e = t.stateNode, Rn(Mt.current);
    var i = null;
    switch (n) {
      case "input":
        o = Os(e, o), r = Os(e, r), i = [];
        break;
      case "select":
        o = de({}, o, { value: void 0 }), r = de({}, r, { value: void 0 }), i = [];
        break;
      case "textarea":
        o = Vs(e, o), r = Vs(e, r), i = [];
        break;
      default:
        typeof o.onClick != "function" && typeof r.onClick == "function" && (e.onclick = qi);
    }
    js(n, r);
    var l;
    n = null;
    for (a in o) if (!r.hasOwnProperty(a) && o.hasOwnProperty(a) && o[a] != null) if (a === "style") {
      var s = o[a];
      for (l in s) s.hasOwnProperty(l) && (n || (n = {}), n[l] = "");
    } else a !== "dangerouslySetInnerHTML" && a !== "children" && a !== "suppressContentEditableWarning" && a !== "suppressHydrationWarning" && a !== "autoFocus" && (So.hasOwnProperty(a) ? i || (i = []) : (i = i || []).push(a, null));
    for (a in r) {
      var u = r[a];
      if (s = o != null ? o[a] : void 0, r.hasOwnProperty(a) && u !== s && (u != null || s != null)) if (a === "style") if (s) {
        for (l in s) !s.hasOwnProperty(l) || u && u.hasOwnProperty(l) || (n || (n = {}), n[l] = "");
        for (l in u) u.hasOwnProperty(l) && s[l] !== u[l] && (n || (n = {}), n[l] = u[l]);
      } else n || (i || (i = []), i.push(
        a,
        n
      )), n = u;
      else a === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, s = s ? s.__html : void 0, u != null && s !== u && (i = i || []).push(a, u)) : a === "children" ? typeof u != "string" && typeof u != "number" || (i = i || []).push(a, "" + u) : a !== "suppressContentEditableWarning" && a !== "suppressHydrationWarning" && (So.hasOwnProperty(a) ? (u != null && a === "onScroll" && se("scroll", e), i || s === u || (i = [])) : (i = i || []).push(a, u));
    }
    n && (i = i || []).push("style", n);
    var a = i;
    (t.updateQueue = a) && (t.flags |= 4);
  }
};
th = function(e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function qr(e, t) {
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
function Ty(e, t, n) {
  var r = t.pendingProps;
  switch (ua(t), t.tag) {
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
      return Xe(t.type) && Ji(), Ae(t), null;
    case 3:
      return r = t.stateNode, Pr(), ue(Ye), ue(De), ya(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (di(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, mt !== null && (Eu(mt), mt = null))), mu(e, t), Ae(t), null;
    case 5:
      ga(t);
      var o = Rn(Ao.current);
      if (n = t.type, e !== null && t.stateNode != null) eh(e, t, n, r, o), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(H(166));
          return Ae(t), null;
        }
        if (e = Rn(Mt.current), di(t)) {
          r = t.stateNode, n = t.type;
          var i = t.memoizedProps;
          switch (r[Nt] = t, r[$o] = i, e = (t.mode & 1) !== 0, n) {
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
              for (o = 0; o < so.length; o++) se(so[o], r);
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
              uc(r, i), se("invalid", r);
              break;
            case "select":
              r._wrapperState = { wasMultiple: !!i.multiple }, se("invalid", r);
              break;
            case "textarea":
              cc(r, i), se("invalid", r);
          }
          js(n, i), o = null;
          for (var l in i) if (i.hasOwnProperty(l)) {
            var s = i[l];
            l === "children" ? typeof s == "string" ? r.textContent !== s && (i.suppressHydrationWarning !== !0 && fi(r.textContent, s, e), o = ["children", s]) : typeof s == "number" && r.textContent !== "" + s && (i.suppressHydrationWarning !== !0 && fi(
              r.textContent,
              s,
              e
            ), o = ["children", "" + s]) : So.hasOwnProperty(l) && s != null && l === "onScroll" && se("scroll", r);
          }
          switch (n) {
            case "input":
              ri(r), ac(r, i, !0);
              break;
            case "textarea":
              ri(r), fc(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof i.onClick == "function" && (r.onclick = qi);
          }
          r = o, t.updateQueue = r, r !== null && (t.flags |= 4);
        } else {
          l = o.nodeType === 9 ? o : o.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = Td(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = l.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = l.createElement(n, { is: r.is }) : (e = l.createElement(n), n === "select" && (l = e, r.multiple ? l.multiple = !0 : r.size && (l.size = r.size))) : e = l.createElementNS(e, n), e[Nt] = t, e[$o] = r, bp(e, t, !1, !1), t.stateNode = e;
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
                for (o = 0; o < so.length; o++) se(so[o], e);
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
                uc(e, r), o = Os(e, r), se("invalid", e);
                break;
              case "option":
                o = r;
                break;
              case "select":
                e._wrapperState = { wasMultiple: !!r.multiple }, o = de({}, r, { value: void 0 }), se("invalid", e);
                break;
              case "textarea":
                cc(e, r), o = Vs(e, r), se("invalid", e);
                break;
              default:
                o = r;
            }
            js(n, o), s = o;
            for (i in s) if (s.hasOwnProperty(i)) {
              var u = s[i];
              i === "style" ? Rd(e, u) : i === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, u != null && Pd(e, u)) : i === "children" ? typeof u == "string" ? (n !== "textarea" || u !== "") && _o(e, u) : typeof u == "number" && _o(e, "" + u) : i !== "suppressContentEditableWarning" && i !== "suppressHydrationWarning" && i !== "autoFocus" && (So.hasOwnProperty(i) ? u != null && i === "onScroll" && se("scroll", e) : u != null && Qu(e, i, u, l));
            }
            switch (n) {
              case "input":
                ri(e), ac(e, r, !1);
                break;
              case "textarea":
                ri(e), fc(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + gn(r.value));
                break;
              case "select":
                e.multiple = !!r.multiple, i = r.value, i != null ? yr(e, !!r.multiple, i, !1) : r.defaultValue != null && yr(
                  e,
                  !!r.multiple,
                  r.defaultValue,
                  !0
                );
                break;
              default:
                typeof o.onClick == "function" && (e.onclick = qi);
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
      if (e && t.stateNode != null) th(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(H(166));
        if (n = Rn(Ao.current), Rn(Mt.current), di(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[Nt] = t, (i = r.nodeValue !== n) && (e = qe, e !== null)) switch (e.tag) {
            case 3:
              fi(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== !0 && fi(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          i && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[Nt] = t, t.stateNode = r;
      }
      return Ae(t), null;
    case 13:
      if (ue(ce), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if (ae && Ze !== null && t.mode & 1 && !(t.flags & 128)) wp(), zr(), t.flags |= 98560, i = !1;
        else if (i = di(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!i) throw Error(H(318));
            if (i = t.memoizedState, i = i !== null ? i.dehydrated : null, !i) throw Error(H(317));
            i[Nt] = t;
          } else zr(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          Ae(t), i = !1;
        } else mt !== null && (Eu(mt), mt = null), i = !0;
        if (!i) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || ce.current & 1 ? xe === 0 && (xe = 3) : Ta())), t.updateQueue !== null && (t.flags |= 4), Ae(t), null);
    case 4:
      return Pr(), mu(e, t), e === null && To(t.stateNode.containerInfo), Ae(t), null;
    case 10:
      return da(t.type._context), Ae(t), null;
    case 17:
      return Xe(t.type) && Ji(), Ae(t), null;
    case 19:
      if (ue(ce), i = t.memoizedState, i === null) return Ae(t), null;
      if (r = (t.flags & 128) !== 0, l = i.rendering, l === null) if (r) qr(i, !1);
      else {
        if (xe !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
          if (l = il(e), l !== null) {
            for (t.flags |= 128, qr(i, !1), r = l.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) i = n, e = r, i.flags &= 14680066, l = i.alternate, l === null ? (i.childLanes = 0, i.lanes = e, i.child = null, i.subtreeFlags = 0, i.memoizedProps = null, i.memoizedState = null, i.updateQueue = null, i.dependencies = null, i.stateNode = null) : (i.childLanes = l.childLanes, i.lanes = l.lanes, i.child = l.child, i.subtreeFlags = 0, i.deletions = null, i.memoizedProps = l.memoizedProps, i.memoizedState = l.memoizedState, i.updateQueue = l.updateQueue, i.type = l.type, e = l.dependencies, i.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
            return ie(ce, ce.current & 1 | 2), t.child;
          }
          e = e.sibling;
        }
        i.tail !== null && ge() > Rr && (t.flags |= 128, r = !0, qr(i, !1), t.lanes = 4194304);
      }
      else {
        if (!r) if (e = il(l), e !== null) {
          if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), qr(i, !0), i.tail === null && i.tailMode === "hidden" && !l.alternate && !ae) return Ae(t), null;
        } else 2 * ge() - i.renderingStartTime > Rr && n !== 1073741824 && (t.flags |= 128, r = !0, qr(i, !1), t.lanes = 4194304);
        i.isBackwards ? (l.sibling = t.child, t.child = l) : (n = i.last, n !== null ? n.sibling = l : t.child = l, i.last = l);
      }
      return i.tail !== null ? (t = i.tail, i.rendering = t, i.tail = t.sibling, i.renderingStartTime = ge(), t.sibling = null, n = ce.current, ie(ce, r ? n & 1 | 2 : n & 1), t) : (Ae(t), null);
    case 22:
    case 23:
      return za(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? Ge & 1073741824 && (Ae(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Ae(t), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(H(156, t.tag));
}
function Py(e, t) {
  switch (ua(t), t.tag) {
    case 1:
      return Xe(t.type) && Ji(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 3:
      return Pr(), ue(Ye), ue(De), ya(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
    case 5:
      return ga(t), null;
    case 13:
      if (ue(ce), e = t.memoizedState, e !== null && e.dehydrated !== null) {
        if (t.alternate === null) throw Error(H(340));
        zr();
      }
      return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 19:
      return ue(ce), null;
    case 4:
      return Pr(), null;
    case 10:
      return da(t.type._context), null;
    case 22:
    case 23:
      return za(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var mi = !1, Ie = !1, $y = typeof WeakSet == "function" ? WeakSet : Set, Y = null;
function hr(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    pe(e, t, r);
  }
  else n.current = null;
}
function gu(e, t, n) {
  try {
    n();
  } catch (r) {
    pe(e, t, r);
  }
}
var ef = !1;
function Ry(e, t) {
  if (bs = Ki, e = lp(), la(e)) {
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
  for (eu = { focusedElem: e, selectionRange: n }, Ki = !1, Y = t; Y !== null; ) if (t = Y, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, Y = e;
  else for (; Y !== null; ) {
    t = Y;
    try {
      var x = t.alternate;
      if (t.flags & 1024) switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (x !== null) {
            var y = x.memoizedProps, _ = x.memoizedState, p = t.stateNode, h = p.getSnapshotBeforeUpdate(t.elementType === t.type ? y : dt(t.type, y), _);
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
    } catch (v) {
      pe(t, t.return, v);
    }
    if (e = t.sibling, e !== null) {
      e.return = t.return, Y = e;
      break;
    }
    Y = t.return;
  }
  return x = ef, ef = !1, x;
}
function vo(e, t, n) {
  var r = t.updateQueue;
  if (r = r !== null ? r.lastEffect : null, r !== null) {
    var o = r = r.next;
    do {
      if ((o.tag & e) === e) {
        var i = o.destroy;
        o.destroy = void 0, i !== void 0 && gu(t, n, i);
      }
      o = o.next;
    } while (o !== r);
  }
}
function Pl(e, t) {
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
function yu(e) {
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
function nh(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, nh(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[Nt], delete t[$o], delete t[ru], delete t[hy], delete t[my])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function rh(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function tf(e) {
  e: for (; ; ) {
    for (; e.sibling === null; ) {
      if (e.return === null || rh(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      e.child.return = e, e = e.child;
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function vu(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = qi));
  else if (r !== 4 && (e = e.child, e !== null)) for (vu(e, t, n), e = e.sibling; e !== null; ) vu(e, t, n), e = e.sibling;
}
function wu(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && (e = e.child, e !== null)) for (wu(e, t, n), e = e.sibling; e !== null; ) wu(e, t, n), e = e.sibling;
}
var Ce = null, pt = !1;
function Kt(e, t, n) {
  for (n = n.child; n !== null; ) oh(e, t, n), n = n.sibling;
}
function oh(e, t, n) {
  if (Ct && typeof Ct.onCommitFiberUnmount == "function") try {
    Ct.onCommitFiberUnmount(_l, n);
  } catch {
  }
  switch (n.tag) {
    case 5:
      Ie || hr(n, t);
    case 6:
      var r = Ce, o = pt;
      Ce = null, Kt(e, t, n), Ce = r, pt = o, Ce !== null && (pt ? (e = Ce, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : Ce.removeChild(n.stateNode));
      break;
    case 18:
      Ce !== null && (pt ? (e = Ce, n = n.stateNode, e.nodeType === 8 ? cs(e.parentNode, n) : e.nodeType === 1 && cs(e, n), Co(e)) : cs(Ce, n.stateNode));
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
          i = i.tag, l !== void 0 && (i & 2 || i & 4) && gu(n, t, l), o = o.next;
        } while (o !== r);
      }
      Kt(e, t, n);
      break;
    case 1:
      if (!Ie && (hr(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
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
function nf(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new $y()), t.forEach(function(r) {
      var o = By.bind(null, e, r);
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
      oh(i, l, o), Ce = null, pt = !1;
      var u = o.alternate;
      u !== null && (u.return = null), o.return = null;
    } catch (a) {
      pe(o, t, a);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) ih(t, e), t = t.sibling;
}
function ih(e, t) {
  var n = e.alternate, r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if (ft(t, e), Et(e), r & 4) {
        try {
          vo(3, e, e.return), Pl(3, e);
        } catch (y) {
          pe(e, e.return, y);
        }
        try {
          vo(5, e, e.return);
        } catch (y) {
          pe(e, e.return, y);
        }
      }
      break;
    case 1:
      ft(t, e), Et(e), r & 512 && n !== null && hr(n, n.return);
      break;
    case 5:
      if (ft(t, e), Et(e), r & 512 && n !== null && hr(n, n.return), e.flags & 32) {
        var o = e.stateNode;
        try {
          _o(o, "");
        } catch (y) {
          pe(e, e.return, y);
        }
      }
      if (r & 4 && (o = e.stateNode, o != null)) {
        var i = e.memoizedProps, l = n !== null ? n.memoizedProps : i, s = e.type, u = e.updateQueue;
        if (e.updateQueue = null, u !== null) try {
          s === "input" && i.type === "radio" && i.name != null && Md(o, i), Us(s, l);
          var a = Us(s, i);
          for (l = 0; l < u.length; l += 2) {
            var c = u[l], f = u[l + 1];
            c === "style" ? Rd(o, f) : c === "dangerouslySetInnerHTML" ? Pd(o, f) : c === "children" ? _o(o, f) : Qu(o, c, f, a);
          }
          switch (s) {
            case "input":
              Fs(o, i);
              break;
            case "textarea":
              zd(o, i);
              break;
            case "select":
              var d = o._wrapperState.wasMultiple;
              o._wrapperState.wasMultiple = !!i.multiple;
              var m = i.value;
              m != null ? yr(o, !!i.multiple, m, !1) : d !== !!i.multiple && (i.defaultValue != null ? yr(
                o,
                !!i.multiple,
                i.defaultValue,
                !0
              ) : yr(o, !!i.multiple, i.multiple ? [] : "", !1));
          }
          o[$o] = i;
        } catch (y) {
          pe(e, e.return, y);
        }
      }
      break;
    case 6:
      if (ft(t, e), Et(e), r & 4) {
        if (e.stateNode === null) throw Error(H(162));
        o = e.stateNode, i = e.memoizedProps;
        try {
          o.nodeValue = i;
        } catch (y) {
          pe(e, e.return, y);
        }
      }
      break;
    case 3:
      if (ft(t, e), Et(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
        Co(t.containerInfo);
      } catch (y) {
        pe(e, e.return, y);
      }
      break;
    case 4:
      ft(t, e), Et(e);
      break;
    case 13:
      ft(t, e), Et(e), o = e.child, o.flags & 8192 && (i = o.memoizedState !== null, o.stateNode.isHidden = i, !i || o.alternate !== null && o.alternate.memoizedState !== null || (Ca = ge())), r & 4 && nf(e);
      break;
    case 22:
      if (c = n !== null && n.memoizedState !== null, e.mode & 1 ? (Ie = (a = Ie) || c, ft(t, e), Ie = a) : ft(t, e), Et(e), r & 8192) {
        if (a = e.memoizedState !== null, (e.stateNode.isHidden = a) && !c && e.mode & 1) for (Y = e, c = e.child; c !== null; ) {
          for (f = Y = c; Y !== null; ) {
            switch (d = Y, m = d.child, d.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                vo(4, d, d.return);
                break;
              case 1:
                hr(d, d.return);
                var x = d.stateNode;
                if (typeof x.componentWillUnmount == "function") {
                  r = d, n = d.return;
                  try {
                    t = r, x.props = t.memoizedProps, x.state = t.memoizedState, x.componentWillUnmount();
                  } catch (y) {
                    pe(r, n, y);
                  }
                }
                break;
              case 5:
                hr(d, d.return);
                break;
              case 22:
                if (d.memoizedState !== null) {
                  of(f);
                  continue;
                }
            }
            m !== null ? (m.return = d, Y = m) : of(f);
          }
          c = c.sibling;
        }
        e: for (c = null, f = e; ; ) {
          if (f.tag === 5) {
            if (c === null) {
              c = f;
              try {
                o = f.stateNode, a ? (i = o.style, typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none") : (s = f.stateNode, u = f.memoizedProps.style, l = u != null && u.hasOwnProperty("display") ? u.display : null, s.style.display = $d("display", l));
              } catch (y) {
                pe(e, e.return, y);
              }
            }
          } else if (f.tag === 6) {
            if (c === null) try {
              f.stateNode.nodeValue = a ? "" : f.memoizedProps;
            } catch (y) {
              pe(e, e.return, y);
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
      ft(t, e), Et(e), r & 4 && nf(e);
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
          if (rh(n)) {
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
          r.flags & 32 && (_o(o, ""), r.flags &= -33);
          var i = tf(e);
          wu(e, i, o);
          break;
        case 3:
        case 4:
          var l = r.stateNode.containerInfo, s = tf(e);
          vu(e, s, l);
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
function Ay(e, t, n) {
  Y = e, lh(e);
}
function lh(e, t, n) {
  for (var r = (e.mode & 1) !== 0; Y !== null; ) {
    var o = Y, i = o.child;
    if (o.tag === 22 && r) {
      var l = o.memoizedState !== null || mi;
      if (!l) {
        var s = o.alternate, u = s !== null && s.memoizedState !== null || Ie;
        s = mi;
        var a = Ie;
        if (mi = l, (Ie = u) && !a) for (Y = o; Y !== null; ) l = Y, u = l.child, l.tag === 22 && l.memoizedState !== null ? lf(o) : u !== null ? (u.return = l, Y = u) : lf(o);
        for (; i !== null; ) Y = i, lh(i), i = i.sibling;
        Y = o, mi = s, Ie = a;
      }
      rf(e);
    } else o.subtreeFlags & 8772 && i !== null ? (i.return = o, Y = i) : rf(e);
  }
}
function rf(e) {
  for (; Y !== null; ) {
    var t = Y;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            Ie || Pl(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !Ie) if (n === null) r.componentDidMount();
            else {
              var o = t.elementType === t.type ? n.memoizedProps : dt(t.type, n.memoizedProps);
              r.componentDidUpdate(o, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
            }
            var i = t.updateQueue;
            i !== null && Bc(t, i, r);
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
              Bc(t, l, n);
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
                  f !== null && Co(f);
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
        Ie || t.flags & 512 && yu(t);
      } catch (d) {
        pe(t, t.return, d);
      }
    }
    if (t === e) {
      Y = null;
      break;
    }
    if (n = t.sibling, n !== null) {
      n.return = t.return, Y = n;
      break;
    }
    Y = t.return;
  }
}
function of(e) {
  for (; Y !== null; ) {
    var t = Y;
    if (t === e) {
      Y = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      n.return = t.return, Y = n;
      break;
    }
    Y = t.return;
  }
}
function lf(e) {
  for (; Y !== null; ) {
    var t = Y;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            Pl(4, t);
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
            yu(t);
          } catch (u) {
            pe(t, i, u);
          }
          break;
        case 5:
          var l = t.return;
          try {
            yu(t);
          } catch (u) {
            pe(t, l, u);
          }
      }
    } catch (u) {
      pe(t, t.return, u);
    }
    if (t === e) {
      Y = null;
      break;
    }
    var s = t.sibling;
    if (s !== null) {
      s.return = t.return, Y = s;
      break;
    }
    Y = t.return;
  }
}
var Iy = Math.ceil, ul = Qt.ReactCurrentDispatcher, ka = Qt.ReactCurrentOwner, st = Qt.ReactCurrentBatchConfig, b = 0, Ee = null, ye = null, Me = 0, Ge = 0, mr = wn(0), xe = 0, Oo = null, jn = 0, $l = 0, Na = 0, wo = null, je = null, Ca = 0, Rr = 1 / 0, It = null, al = !1, xu = null, dn = null, gi = !1, ln = null, cl = 0, xo = 0, Su = null, Li = -1, Oi = 0;
function He() {
  return b & 6 ? ge() : Li !== -1 ? Li : Li = ge();
}
function pn(e) {
  return e.mode & 1 ? b & 2 && Me !== 0 ? Me & -Me : yy.transition !== null ? (Oi === 0 && (Oi = Wd()), Oi) : (e = re, e !== 0 || (e = window.event, e = e === void 0 ? 16 : qd(e.type)), e) : 1;
}
function vt(e, t, n, r) {
  if (50 < xo) throw xo = 0, Su = null, Error(H(185));
  Ko(e, n, r), (!(b & 2) || e !== Ee) && (e === Ee && (!(b & 2) && ($l |= n), xe === 4 && nn(e, Me)), Qe(e, r), n === 1 && b === 0 && !(t.mode & 1) && (Rr = ge() + 500, Ml && xn()));
}
function Qe(e, t) {
  var n = e.callbackNode;
  yg(e, t);
  var r = Qi(e, e === Ee ? Me : 0);
  if (r === 0) n !== null && hc(n), e.callbackNode = null, e.callbackPriority = 0;
  else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && hc(n), t === 1) e.tag === 0 ? gy(sf.bind(null, e)) : gp(sf.bind(null, e)), dy(function() {
      !(b & 6) && xn();
    }), n = null;
    else {
      switch (Yd(r)) {
        case 1:
          n = Ju;
          break;
        case 4:
          n = jd;
          break;
        case 16:
          n = Xi;
          break;
        case 536870912:
          n = Ud;
          break;
        default:
          n = Xi;
      }
      n = hh(n, sh.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function sh(e, t) {
  if (Li = -1, Oi = 0, b & 6) throw Error(H(327));
  var n = e.callbackNode;
  if (_r() && e.callbackNode !== n) return null;
  var r = Qi(e, e === Ee ? Me : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = fl(e, r);
  else {
    t = r;
    var o = b;
    b |= 2;
    var i = ah();
    (Ee !== e || Me !== t) && (It = null, Rr = ge() + 500, Dn(e, t));
    do
      try {
        Oy();
        break;
      } catch (s) {
        uh(e, s);
      }
    while (!0);
    fa(), ul.current = i, b = o, ye !== null ? t = 0 : (Ee = null, Me = 0, t = xe);
  }
  if (t !== 0) {
    if (t === 2 && (o = Ks(e), o !== 0 && (r = o, t = _u(e, o))), t === 1) throw n = Oo, Dn(e, 0), nn(e, r), Qe(e, ge()), n;
    if (t === 6) nn(e, r);
    else {
      if (o = e.current.alternate, !(r & 30) && !Dy(o) && (t = fl(e, r), t === 2 && (i = Ks(e), i !== 0 && (r = i, t = _u(e, i))), t === 1)) throw n = Oo, Dn(e, 0), nn(e, r), Qe(e, ge()), n;
      switch (e.finishedWork = o, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(H(345));
        case 2:
          zn(e, je, It);
          break;
        case 3:
          if (nn(e, r), (r & 130023424) === r && (t = Ca + 500 - ge(), 10 < t)) {
            if (Qi(e, 0) !== 0) break;
            if (o = e.suspendedLanes, (o & r) !== r) {
              He(), e.pingedLanes |= e.suspendedLanes & o;
              break;
            }
            e.timeoutHandle = nu(zn.bind(null, e, je, It), t);
            break;
          }
          zn(e, je, It);
          break;
        case 4:
          if (nn(e, r), (r & 4194240) === r) break;
          for (t = e.eventTimes, o = -1; 0 < r; ) {
            var l = 31 - yt(r);
            i = 1 << l, l = t[l], l > o && (o = l), r &= ~i;
          }
          if (r = o, r = ge() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * Iy(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = nu(zn.bind(null, e, je, It), r);
            break;
          }
          zn(e, je, It);
          break;
        case 5:
          zn(e, je, It);
          break;
        default:
          throw Error(H(329));
      }
    }
  }
  return Qe(e, ge()), e.callbackNode === n ? sh.bind(null, e) : null;
}
function _u(e, t) {
  var n = wo;
  return e.current.memoizedState.isDehydrated && (Dn(e, t).flags |= 256), e = fl(e, t), e !== 2 && (t = je, je = n, t !== null && Eu(t)), e;
}
function Eu(e) {
  je === null ? je = e : je.push.apply(je, e);
}
function Dy(e) {
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
function nn(e, t) {
  for (t &= ~Na, t &= ~$l, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
    var n = 31 - yt(t), r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function sf(e) {
  if (b & 6) throw Error(H(327));
  _r();
  var t = Qi(e, 0);
  if (!(t & 1)) return Qe(e, ge()), null;
  var n = fl(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Ks(e);
    r !== 0 && (t = r, n = _u(e, r));
  }
  if (n === 1) throw n = Oo, Dn(e, 0), nn(e, t), Qe(e, ge()), n;
  if (n === 6) throw Error(H(345));
  return e.finishedWork = e.current.alternate, e.finishedLanes = t, zn(e, je, It), Qe(e, ge()), null;
}
function Ma(e, t) {
  var n = b;
  b |= 1;
  try {
    return e(t);
  } finally {
    b = n, b === 0 && (Rr = ge() + 500, Ml && xn());
  }
}
function Un(e) {
  ln !== null && ln.tag === 0 && !(b & 6) && _r();
  var t = b;
  b |= 1;
  var n = st.transition, r = re;
  try {
    if (st.transition = null, re = 1, e) return e();
  } finally {
    re = r, st.transition = n, b = t, !(b & 6) && xn();
  }
}
function za() {
  Ge = mr.current, ue(mr);
}
function Dn(e, t) {
  e.finishedWork = null, e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1, fy(n)), ye !== null) for (n = ye.return; n !== null; ) {
    var r = n;
    switch (ua(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && Ji();
        break;
      case 3:
        Pr(), ue(Ye), ue(De), ya();
        break;
      case 5:
        ga(r);
        break;
      case 4:
        Pr();
        break;
      case 13:
        ue(ce);
        break;
      case 19:
        ue(ce);
        break;
      case 10:
        da(r.type._context);
        break;
      case 22:
      case 23:
        za();
    }
    n = n.return;
  }
  if (Ee = e, ye = e = hn(e.current, null), Me = Ge = t, xe = 0, Oo = null, Na = $l = jn = 0, je = wo = null, $n !== null) {
    for (t = 0; t < $n.length; t++) if (n = $n[t], r = n.interleaved, r !== null) {
      n.interleaved = null;
      var o = r.next, i = n.pending;
      if (i !== null) {
        var l = i.next;
        i.next = o, r.next = l;
      }
      n.pending = r;
    }
    $n = null;
  }
  return e;
}
function uh(e, t) {
  do {
    var n = ye;
    try {
      if (fa(), Ai.current = sl, ll) {
        for (var r = fe.memoizedState; r !== null; ) {
          var o = r.queue;
          o !== null && (o.pending = null), r = r.next;
        }
        ll = !1;
      }
      if (Bn = 0, _e = we = fe = null, yo = !1, Io = 0, ka.current = null, n === null || n.return === null) {
        xe = 1, Oo = t, ye = null;
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
          var m = Qc(l);
          if (m !== null) {
            m.flags &= -257, Kc(m, l, s, i, t), m.mode & 1 && Xc(i, a, t), t = m, u = a;
            var x = t.updateQueue;
            if (x === null) {
              var y = /* @__PURE__ */ new Set();
              y.add(u), t.updateQueue = y;
            } else x.add(u);
            break e;
          } else {
            if (!(t & 1)) {
              Xc(i, a, t), Ta();
              break e;
            }
            u = Error(H(426));
          }
        } else if (ae && s.mode & 1) {
          var _ = Qc(l);
          if (_ !== null) {
            !(_.flags & 65536) && (_.flags |= 256), Kc(_, l, s, i, t), aa($r(u, s));
            break e;
          }
        }
        i = u = $r(u, s), xe !== 4 && (xe = 2), wo === null ? wo = [i] : wo.push(i), i = l;
        do {
          switch (i.tag) {
            case 3:
              i.flags |= 65536, t &= -t, i.lanes |= t;
              var p = Yp(i, u, t);
              Vc(i, p);
              break e;
            case 1:
              s = u;
              var h = i.type, g = i.stateNode;
              if (!(i.flags & 128) && (typeof h.getDerivedStateFromError == "function" || g !== null && typeof g.componentDidCatch == "function" && (dn === null || !dn.has(g)))) {
                i.flags |= 65536, t &= -t, i.lanes |= t;
                var v = Xp(i, s, t);
                Vc(i, v);
                break e;
              }
          }
          i = i.return;
        } while (i !== null);
      }
      fh(n);
    } catch (E) {
      t = E, ye === n && n !== null && (ye = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function ah() {
  var e = ul.current;
  return ul.current = sl, e === null ? sl : e;
}
function Ta() {
  (xe === 0 || xe === 3 || xe === 2) && (xe = 4), Ee === null || !(jn & 268435455) && !($l & 268435455) || nn(Ee, Me);
}
function fl(e, t) {
  var n = b;
  b |= 2;
  var r = ah();
  (Ee !== e || Me !== t) && (It = null, Dn(e, t));
  do
    try {
      Ly();
      break;
    } catch (o) {
      uh(e, o);
    }
  while (!0);
  if (fa(), b = n, ul.current = r, ye !== null) throw Error(H(261));
  return Ee = null, Me = 0, xe;
}
function Ly() {
  for (; ye !== null; ) ch(ye);
}
function Oy() {
  for (; ye !== null && !ug(); ) ch(ye);
}
function ch(e) {
  var t = ph(e.alternate, e, Ge);
  e.memoizedProps = e.pendingProps, t === null ? fh(e) : ye = t, ka.current = null;
}
function fh(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = Py(n, t), n !== null) {
        n.flags &= 32767, ye = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
      else {
        xe = 6, ye = null;
        return;
      }
    } else if (n = Ty(n, t, Ge), n !== null) {
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
function zn(e, t, n) {
  var r = re, o = st.transition;
  try {
    st.transition = null, re = 1, Fy(e, t, n, r);
  } finally {
    st.transition = o, re = r;
  }
  return null;
}
function Fy(e, t, n, r) {
  do
    _r();
  while (ln !== null);
  if (b & 6) throw Error(H(327));
  n = e.finishedWork;
  var o = e.finishedLanes;
  if (n === null) return null;
  if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(H(177));
  e.callbackNode = null, e.callbackPriority = 0;
  var i = n.lanes | n.childLanes;
  if (vg(e, i), e === Ee && (ye = Ee = null, Me = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || gi || (gi = !0, hh(Xi, function() {
    return _r(), null;
  })), i = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || i) {
    i = st.transition, st.transition = null;
    var l = re;
    re = 1;
    var s = b;
    b |= 4, ka.current = null, Ry(e, n), ih(n, e), oy(eu), Ki = !!bs, eu = bs = null, e.current = n, Ay(n), ag(), b = s, re = l, st.transition = i;
  } else e.current = n;
  if (gi && (gi = !1, ln = e, cl = o), i = e.pendingLanes, i === 0 && (dn = null), dg(n.stateNode), Qe(e, ge()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) o = t[n], r(o.value, { componentStack: o.stack, digest: o.digest });
  if (al) throw al = !1, e = xu, xu = null, e;
  return cl & 1 && e.tag !== 0 && _r(), i = e.pendingLanes, i & 1 ? e === Su ? xo++ : (xo = 0, Su = e) : xo = 0, xn(), null;
}
function _r() {
  if (ln !== null) {
    var e = Yd(cl), t = st.transition, n = re;
    try {
      if (st.transition = null, re = 16 > e ? 16 : e, ln === null) var r = !1;
      else {
        if (e = ln, ln = null, cl = 0, b & 6) throw Error(H(331));
        var o = b;
        for (b |= 4, Y = e.current; Y !== null; ) {
          var i = Y, l = i.child;
          if (Y.flags & 16) {
            var s = i.deletions;
            if (s !== null) {
              for (var u = 0; u < s.length; u++) {
                var a = s[u];
                for (Y = a; Y !== null; ) {
                  var c = Y;
                  switch (c.tag) {
                    case 0:
                    case 11:
                    case 15:
                      vo(8, c, i);
                  }
                  var f = c.child;
                  if (f !== null) f.return = c, Y = f;
                  else for (; Y !== null; ) {
                    c = Y;
                    var d = c.sibling, m = c.return;
                    if (nh(c), c === a) {
                      Y = null;
                      break;
                    }
                    if (d !== null) {
                      d.return = m, Y = d;
                      break;
                    }
                    Y = m;
                  }
                }
              }
              var x = i.alternate;
              if (x !== null) {
                var y = x.child;
                if (y !== null) {
                  x.child = null;
                  do {
                    var _ = y.sibling;
                    y.sibling = null, y = _;
                  } while (y !== null);
                }
              }
              Y = i;
            }
          }
          if (i.subtreeFlags & 2064 && l !== null) l.return = i, Y = l;
          else e: for (; Y !== null; ) {
            if (i = Y, i.flags & 2048) switch (i.tag) {
              case 0:
              case 11:
              case 15:
                vo(9, i, i.return);
            }
            var p = i.sibling;
            if (p !== null) {
              p.return = i.return, Y = p;
              break e;
            }
            Y = i.return;
          }
        }
        var h = e.current;
        for (Y = h; Y !== null; ) {
          l = Y;
          var g = l.child;
          if (l.subtreeFlags & 2064 && g !== null) g.return = l, Y = g;
          else e: for (l = h; Y !== null; ) {
            if (s = Y, s.flags & 2048) try {
              switch (s.tag) {
                case 0:
                case 11:
                case 15:
                  Pl(9, s);
              }
            } catch (E) {
              pe(s, s.return, E);
            }
            if (s === l) {
              Y = null;
              break e;
            }
            var v = s.sibling;
            if (v !== null) {
              v.return = s.return, Y = v;
              break e;
            }
            Y = s.return;
          }
        }
        if (b = o, xn(), Ct && typeof Ct.onPostCommitFiberRoot == "function") try {
          Ct.onPostCommitFiberRoot(_l, e);
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
function uf(e, t, n) {
  t = $r(n, t), t = Yp(e, t, 1), e = fn(e, t, 1), t = He(), e !== null && (Ko(e, 1, t), Qe(e, t));
}
function pe(e, t, n) {
  if (e.tag === 3) uf(e, e, n);
  else for (; t !== null; ) {
    if (t.tag === 3) {
      uf(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (dn === null || !dn.has(r))) {
        e = $r(n, e), e = Xp(t, e, 1), t = fn(t, e, 1), e = He(), t !== null && (Ko(t, 1, e), Qe(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function Hy(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = He(), e.pingedLanes |= e.suspendedLanes & n, Ee === e && (Me & n) === n && (xe === 4 || xe === 3 && (Me & 130023424) === Me && 500 > ge() - Ca ? Dn(e, 0) : Na |= n), Qe(e, t);
}
function dh(e, t) {
  t === 0 && (e.mode & 1 ? (t = li, li <<= 1, !(li & 130023424) && (li = 4194304)) : t = 1);
  var n = He();
  e = Ut(e, t), e !== null && (Ko(e, t, n), Qe(e, n));
}
function Vy(e) {
  var t = e.memoizedState, n = 0;
  t !== null && (n = t.retryLane), dh(e, n);
}
function By(e, t) {
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
  r !== null && r.delete(t), dh(e, n);
}
var ph;
ph = function(e, t, n) {
  if (e !== null) if (e.memoizedProps !== t.pendingProps || Ye.current) Ue = !0;
  else {
    if (!(e.lanes & n) && !(t.flags & 128)) return Ue = !1, zy(e, t, n);
    Ue = !!(e.flags & 131072);
  }
  else Ue = !1, ae && t.flags & 1048576 && yp(t, tl, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      Di(e, t), e = t.pendingProps;
      var o = Mr(t, De.current);
      Sr(t, n), o = wa(null, t, r, e, o, n);
      var i = xa();
      return t.flags |= 1, typeof o == "object" && o !== null && typeof o.render == "function" && o.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, Xe(r) ? (i = !0, bi(t)) : i = !1, t.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null, ha(t), o.updater = Tl, t.stateNode = o, o._reactInternals = t, au(t, r, e, n), t = du(null, t, r, !0, i, n)) : (t.tag = 0, ae && i && sa(t), Fe(null, t, o, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (Di(e, t), e = t.pendingProps, o = r._init, r = o(r._payload), t.type = r, o = t.tag = Uy(r), e = dt(r, e), o) {
          case 0:
            t = fu(null, t, r, e, n);
            break e;
          case 1:
            t = qc(null, t, r, e, n);
            break e;
          case 11:
            t = Gc(null, t, r, e, n);
            break e;
          case 14:
            t = Zc(null, t, r, dt(r.type, e), n);
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
      return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : dt(r, o), fu(e, t, r, o, n);
    case 1:
      return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : dt(r, o), qc(e, t, r, o, n);
    case 3:
      e: {
        if (Zp(t), e === null) throw Error(H(387));
        r = t.pendingProps, i = t.memoizedState, o = i.element, Ep(e, t), ol(t, r, null, n);
        var l = t.memoizedState;
        if (r = l.element, i.isDehydrated) if (i = { element: r, isDehydrated: !1, cache: l.cache, pendingSuspenseBoundaries: l.pendingSuspenseBoundaries, transitions: l.transitions }, t.updateQueue.baseState = i, t.memoizedState = i, t.flags & 256) {
          o = $r(Error(H(423)), t), t = Jc(e, t, r, n, o);
          break e;
        } else if (r !== o) {
          o = $r(Error(H(424)), t), t = Jc(e, t, r, n, o);
          break e;
        } else for (Ze = cn(t.stateNode.containerInfo.firstChild), qe = t, ae = !0, mt = null, n = Sp(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (zr(), r === o) {
            t = Wt(e, t, n);
            break e;
          }
          Fe(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return kp(t), e === null && lu(t), r = t.type, o = t.pendingProps, i = e !== null ? e.memoizedProps : null, l = o.children, tu(r, o) ? l = null : i !== null && tu(r, i) && (t.flags |= 32), Gp(e, t), Fe(e, t, l, n), t.child;
    case 6:
      return e === null && lu(t), null;
    case 13:
      return qp(e, t, n);
    case 4:
      return ma(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Tr(t, null, r, n) : Fe(e, t, r, n), t.child;
    case 11:
      return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : dt(r, o), Gc(e, t, r, o, n);
    case 7:
      return Fe(e, t, t.pendingProps, n), t.child;
    case 8:
      return Fe(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return Fe(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, o = t.pendingProps, i = t.memoizedProps, l = o.value, ie(nl, r._currentValue), r._currentValue = l, i !== null) if (xt(i.value, l)) {
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
                i.lanes |= n, u = i.alternate, u !== null && (u.lanes |= n), su(
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
            l.lanes |= n, s = l.alternate, s !== null && (s.lanes |= n), su(l, n, t), l = i.sibling;
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
      return o = t.type, r = t.pendingProps.children, Sr(t, n), o = ut(o), r = r(o), t.flags |= 1, Fe(e, t, r, n), t.child;
    case 14:
      return r = t.type, o = dt(r, t.pendingProps), o = dt(r.type, o), Zc(e, t, r, o, n);
    case 15:
      return Qp(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : dt(r, o), Di(e, t), t.tag = 1, Xe(r) ? (e = !0, bi(t)) : e = !1, Sr(t, n), Wp(t, r, o), au(t, r, o, n), du(null, t, r, !0, e, n);
    case 19:
      return Jp(e, t, n);
    case 22:
      return Kp(e, t, n);
  }
  throw Error(H(156, t.tag));
};
function hh(e, t) {
  return Bd(e, t);
}
function jy(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function it(e, t, n, r) {
  return new jy(e, t, n, r);
}
function Pa(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function Uy(e) {
  if (typeof e == "function") return Pa(e) ? 1 : 0;
  if (e != null) {
    if (e = e.$$typeof, e === Gu) return 11;
    if (e === Zu) return 14;
  }
  return 2;
}
function hn(e, t) {
  var n = e.alternate;
  return n === null ? (n = it(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
}
function Fi(e, t, n, r, o, i) {
  var l = 2;
  if (r = e, typeof e == "function") Pa(e) && (l = 1);
  else if (typeof e == "string") l = 5;
  else e: switch (e) {
    case ir:
      return Ln(n.children, o, i, t);
    case Ku:
      l = 8, o |= 8;
      break;
    case As:
      return e = it(12, n, t, o | 2), e.elementType = As, e.lanes = i, e;
    case Is:
      return e = it(13, n, t, o), e.elementType = Is, e.lanes = i, e;
    case Ds:
      return e = it(19, n, t, o), e.elementType = Ds, e.lanes = i, e;
    case kd:
      return Rl(n, o, i, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case _d:
          l = 10;
          break e;
        case Ed:
          l = 9;
          break e;
        case Gu:
          l = 11;
          break e;
        case Zu:
          l = 14;
          break e;
        case qt:
          l = 16, r = null;
          break e;
      }
      throw Error(H(130, e == null ? e : typeof e, ""));
  }
  return t = it(l, n, t, o), t.elementType = e, t.type = r, t.lanes = i, t;
}
function Ln(e, t, n, r) {
  return e = it(7, e, r, t), e.lanes = n, e;
}
function Rl(e, t, n, r) {
  return e = it(22, e, r, t), e.elementType = kd, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
}
function vs(e, t, n) {
  return e = it(6, e, null, t), e.lanes = n, e;
}
function ws(e, t, n) {
  return t = it(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
}
function Wy(e, t, n, r, o) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = bl(0), this.expirationTimes = bl(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = bl(0), this.identifierPrefix = r, this.onRecoverableError = o, this.mutableSourceEagerHydrationData = null;
}
function $a(e, t, n, r, o, i, l, s, u) {
  return e = new Wy(e, t, n, s, u), t === 1 ? (t = 1, i === !0 && (t |= 8)) : t = 0, i = it(3, null, null, t), e.current = i, i.stateNode = e, i.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, ha(i), e;
}
function Yy(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return { $$typeof: or, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
}
function mh(e) {
  if (!e) return yn;
  e = e._reactInternals;
  e: {
    if (Qn(e) !== e || e.tag !== 1) throw Error(H(170));
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
    if (Xe(n)) return mp(e, n, t);
  }
  return t;
}
function gh(e, t, n, r, o, i, l, s, u) {
  return e = $a(n, r, !0, e, o, i, l, s, u), e.context = mh(null), n = e.current, r = He(), o = pn(n), i = Ht(r, o), i.callback = t ?? null, fn(n, i, o), e.current.lanes = o, Ko(e, o, r), Qe(e, r), e;
}
function Al(e, t, n, r) {
  var o = t.current, i = He(), l = pn(o);
  return n = mh(n), t.context === null ? t.context = n : t.pendingContext = n, t = Ht(i, l), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = fn(o, t, l), e !== null && (vt(e, o, l, i), Ri(e, o, l)), l;
}
function dl(e) {
  if (e = e.current, !e.child) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function af(e, t) {
  if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function Ra(e, t) {
  af(e, t), (e = e.alternate) && af(e, t);
}
function Xy() {
  return null;
}
var yh = typeof reportError == "function" ? reportError : function(e) {
  console.error(e);
};
function Aa(e) {
  this._internalRoot = e;
}
Il.prototype.render = Aa.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null) throw Error(H(409));
  Al(e, t, null, null);
};
Il.prototype.unmount = Aa.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    Un(function() {
      Al(null, e, null, null);
    }), t[jt] = null;
  }
};
function Il(e) {
  this._internalRoot = e;
}
Il.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
    var t = Kd();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < tn.length && t !== 0 && t < tn[n].priority; n++) ;
    tn.splice(n, 0, e), n === 0 && Zd(e);
  }
};
function Ia(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
}
function Dl(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
}
function cf() {
}
function Qy(e, t, n, r, o) {
  if (o) {
    if (typeof r == "function") {
      var i = r;
      r = function() {
        var a = dl(l);
        i.call(a);
      };
    }
    var l = gh(t, r, e, 0, null, !1, !1, "", cf);
    return e._reactRootContainer = l, e[jt] = l.current, To(e.nodeType === 8 ? e.parentNode : e), Un(), l;
  }
  for (; o = e.lastChild; ) e.removeChild(o);
  if (typeof r == "function") {
    var s = r;
    r = function() {
      var a = dl(u);
      s.call(a);
    };
  }
  var u = $a(e, 0, !1, null, null, !1, !1, "", cf);
  return e._reactRootContainer = u, e[jt] = u.current, To(e.nodeType === 8 ? e.parentNode : e), Un(function() {
    Al(t, u, n, r);
  }), u;
}
function Ll(e, t, n, r, o) {
  var i = n._reactRootContainer;
  if (i) {
    var l = i;
    if (typeof o == "function") {
      var s = o;
      o = function() {
        var u = dl(l);
        s.call(u);
      };
    }
    Al(t, l, e, o);
  } else l = Qy(n, t, e, o, r);
  return dl(l);
}
Xd = function(e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = lo(t.pendingLanes);
        n !== 0 && (bu(t, n | 1), Qe(t, ge()), !(b & 6) && (Rr = ge() + 500, xn()));
      }
      break;
    case 13:
      Un(function() {
        var r = Ut(e, 1);
        if (r !== null) {
          var o = He();
          vt(r, e, 1, o);
        }
      }), Ra(e, 1);
  }
};
ea = function(e) {
  if (e.tag === 13) {
    var t = Ut(e, 134217728);
    if (t !== null) {
      var n = He();
      vt(t, e, 134217728, n);
    }
    Ra(e, 134217728);
  }
};
Qd = function(e) {
  if (e.tag === 13) {
    var t = pn(e), n = Ut(e, t);
    if (n !== null) {
      var r = He();
      vt(n, e, t, r);
    }
    Ra(e, t);
  }
};
Kd = function() {
  return re;
};
Gd = function(e, t) {
  var n = re;
  try {
    return re = e, t();
  } finally {
    re = n;
  }
};
Ys = function(e, t, n) {
  switch (t) {
    case "input":
      if (Fs(e, n), t = n.name, n.type === "radio" && t != null) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var o = Cl(r);
            if (!o) throw Error(H(90));
            Cd(r), Fs(r, o);
          }
        }
      }
      break;
    case "textarea":
      zd(e, n);
      break;
    case "select":
      t = n.value, t != null && yr(e, !!n.multiple, t, !1);
  }
};
Dd = Ma;
Ld = Un;
var Ky = { usingClientEntryPoint: !1, Events: [Zo, ar, Cl, Ad, Id, Ma] }, Jr = { findFiberByHostInstance: Pn, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Gy = { bundleType: Jr.bundleType, version: Jr.version, rendererPackageName: Jr.rendererPackageName, rendererConfig: Jr.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: Qt.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
  return e = Hd(e), e === null ? null : e.stateNode;
}, findFiberByHostInstance: Jr.findFiberByHostInstance || Xy, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var yi = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!yi.isDisabled && yi.supportsFiber) try {
    _l = yi.inject(Gy), Ct = yi;
  } catch {
  }
}
et.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Ky;
et.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!Ia(t)) throw Error(H(200));
  return Yy(e, t, null, n);
};
et.createRoot = function(e, t) {
  if (!Ia(e)) throw Error(H(299));
  var n = !1, r = "", o = yh;
  return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (o = t.onRecoverableError)), t = $a(e, 1, !1, null, null, n, !1, r, o), e[jt] = t.current, To(e.nodeType === 8 ? e.parentNode : e), new Aa(t);
};
et.findDOMNode = function(e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function" ? Error(H(188)) : (e = Object.keys(e).join(","), Error(H(268, e)));
  return e = Hd(t), e = e === null ? null : e.stateNode, e;
};
et.flushSync = function(e) {
  return Un(e);
};
et.hydrate = function(e, t, n) {
  if (!Dl(t)) throw Error(H(200));
  return Ll(null, e, t, !0, n);
};
et.hydrateRoot = function(e, t, n) {
  if (!Ia(e)) throw Error(H(405));
  var r = n != null && n.hydratedSources || null, o = !1, i = "", l = yh;
  if (n != null && (n.unstable_strictMode === !0 && (o = !0), n.identifierPrefix !== void 0 && (i = n.identifierPrefix), n.onRecoverableError !== void 0 && (l = n.onRecoverableError)), t = gh(t, null, e, 1, n ?? null, o, !1, i, l), e[jt] = t.current, To(e), r) for (e = 0; e < r.length; e++) n = r[e], o = n._getVersion, o = o(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, o] : t.mutableSourceEagerHydrationData.push(
    n,
    o
  );
  return new Il(t);
};
et.render = function(e, t, n) {
  if (!Dl(t)) throw Error(H(200));
  return Ll(null, e, t, !1, n);
};
et.unmountComponentAtNode = function(e) {
  if (!Dl(e)) throw Error(H(40));
  return e._reactRootContainer ? (Un(function() {
    Ll(null, null, e, !1, function() {
      e._reactRootContainer = null, e[jt] = null;
    });
  }), !0) : !1;
};
et.unstable_batchedUpdates = Ma;
et.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!Dl(n)) throw Error(H(200));
  if (e == null || e._reactInternals === void 0) throw Error(H(38));
  return Ll(e, t, n, !1, r);
};
et.version = "18.3.1-next-f1338f8080-20240426";
function vh() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(vh);
    } catch (e) {
      console.error(e);
    }
}
vh(), vd.exports = et;
var Zy = vd.exports, wh, ff = Zy;
wh = ff.createRoot, ff.hydrateRoot;
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
var xh = { exports: {} }, Sh = {}, _h = { exports: {} }, Eh = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ar = T;
function qy(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Jy = typeof Object.is == "function" ? Object.is : qy, by = Ar.useState, ev = Ar.useEffect, tv = Ar.useLayoutEffect, nv = Ar.useDebugValue;
function rv(e, t) {
  var n = t(), r = by({ inst: { value: n, getSnapshot: t } }), o = r[0].inst, i = r[1];
  return tv(
    function() {
      o.value = n, o.getSnapshot = t, xs(o) && i({ inst: o });
    },
    [e, n, t]
  ), ev(
    function() {
      return xs(o) && i({ inst: o }), e(function() {
        xs(o) && i({ inst: o });
      });
    },
    [e]
  ), nv(n), n;
}
function xs(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Jy(e, n);
  } catch {
    return !0;
  }
}
function ov(e, t) {
  return t();
}
var iv = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? ov : rv;
Eh.useSyncExternalStore = Ar.useSyncExternalStore !== void 0 ? Ar.useSyncExternalStore : iv;
_h.exports = Eh;
var lv = _h.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ol = T, sv = lv;
function uv(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var av = typeof Object.is == "function" ? Object.is : uv, cv = sv.useSyncExternalStore, fv = Ol.useRef, dv = Ol.useEffect, pv = Ol.useMemo, hv = Ol.useDebugValue;
Sh.useSyncExternalStoreWithSelector = function(e, t, n, r, o) {
  var i = fv(null);
  if (i.current === null) {
    var l = { hasValue: !1, value: null };
    i.current = l;
  } else l = i.current;
  i = pv(
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
        if (x = f, av(c, m)) return x;
        var y = r(m);
        return o !== void 0 && o(x, y) ? (c = m, x) : (c = m, f = y);
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
  var s = cv(e, i[0], i[1]);
  return dv(
    function() {
      l.hasValue = !0, l.value = s;
    },
    [s]
  ), hv(s), s;
};
xh.exports = Sh;
var mv = xh.exports;
const gv = /* @__PURE__ */ ld(mv), yv = {}, df = (e) => {
  let t;
  const n = /* @__PURE__ */ new Set(), r = (c, f) => {
    const d = typeof c == "function" ? c(t) : c;
    if (!Object.is(d, t)) {
      const m = t;
      t = f ?? (typeof d != "object" || d === null) ? d : Object.assign({}, t, d), n.forEach((x) => x(t, m));
    }
  }, o = () => t, u = { setState: r, getState: o, getInitialState: () => a, subscribe: (c) => (n.add(c), () => n.delete(c)), destroy: () => {
    (yv ? "production" : void 0) !== "production" && console.warn(
      "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
    ), n.clear();
  } }, a = t = e(r, o, u);
  return u;
}, vv = (e) => e ? df(e) : df, { useDebugValue: wv } = R, { useSyncExternalStoreWithSelector: xv } = gv, Sv = (e) => e;
function kh(e, t = Sv, n) {
  const r = xv(
    e.subscribe,
    e.getState,
    e.getServerState || e.getInitialState,
    t,
    n
  );
  return wv(r), r;
}
const pf = (e, t) => {
  const n = vv(e), r = (o, i = t) => kh(n, o, i);
  return Object.assign(r, n), r;
}, _v = (e, t) => e ? pf(e, t) : pf;
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
var Ev = { value: () => {
} };
function Fl() {
  for (var e = 0, t = arguments.length, n = {}, r; e < t; ++e) {
    if (!(r = arguments[e] + "") || r in n || /[\s.]/.test(r)) throw new Error("illegal type: " + r);
    n[r] = [];
  }
  return new Hi(n);
}
function Hi(e) {
  this._ = e;
}
function kv(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var r = "", o = n.indexOf(".");
    if (o >= 0 && (r = n.slice(o + 1), n = n.slice(0, o)), n && !t.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: r };
  });
}
Hi.prototype = Fl.prototype = {
  constructor: Hi,
  on: function(e, t) {
    var n = this._, r = kv(e + "", n), o, i = -1, l = r.length;
    if (arguments.length < 2) {
      for (; ++i < l; ) if ((o = (e = r[i]).type) && (o = Nv(n[o], e.name))) return o;
      return;
    }
    if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
    for (; ++i < l; )
      if (o = (e = r[i]).type) n[o] = hf(n[o], e.name, t);
      else if (t == null) for (o in n) n[o] = hf(n[o], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t) e[n] = t[n].slice();
    return new Hi(e);
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
function Nv(e, t) {
  for (var n = 0, r = e.length, o; n < r; ++n)
    if ((o = e[n]).name === t)
      return o.value;
}
function hf(e, t, n) {
  for (var r = 0, o = e.length; r < o; ++r)
    if (e[r].name === t) {
      e[r] = Ev, e = e.slice(0, r).concat(e.slice(r + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var ku = "http://www.w3.org/1999/xhtml";
const mf = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: ku,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function Hl(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), mf.hasOwnProperty(t) ? { space: mf[t], local: e } : e;
}
function Cv(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === ku && t.documentElement.namespaceURI === ku ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function Mv(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function Nh(e) {
  var t = Hl(e);
  return (t.local ? Mv : Cv)(t);
}
function zv() {
}
function Da(e) {
  return e == null ? zv : function() {
    return this.querySelector(e);
  };
}
function Tv(e) {
  typeof e != "function" && (e = Da(e));
  for (var t = this._groups, n = t.length, r = new Array(n), o = 0; o < n; ++o)
    for (var i = t[o], l = i.length, s = r[o] = new Array(l), u, a, c = 0; c < l; ++c)
      (u = i[c]) && (a = e.call(u, u.__data__, c, i)) && ("__data__" in u && (a.__data__ = u.__data__), s[c] = a);
  return new be(r, this._parents);
}
function Pv(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function $v() {
  return [];
}
function Ch(e) {
  return e == null ? $v : function() {
    return this.querySelectorAll(e);
  };
}
function Rv(e) {
  return function() {
    return Pv(e.apply(this, arguments));
  };
}
function Av(e) {
  typeof e == "function" ? e = Rv(e) : e = Ch(e);
  for (var t = this._groups, n = t.length, r = [], o = [], i = 0; i < n; ++i)
    for (var l = t[i], s = l.length, u, a = 0; a < s; ++a)
      (u = l[a]) && (r.push(e.call(u, u.__data__, a, l)), o.push(u));
  return new be(r, o);
}
function Mh(e) {
  return function() {
    return this.matches(e);
  };
}
function zh(e) {
  return function(t) {
    return t.matches(e);
  };
}
var Iv = Array.prototype.find;
function Dv(e) {
  return function() {
    return Iv.call(this.children, e);
  };
}
function Lv() {
  return this.firstElementChild;
}
function Ov(e) {
  return this.select(e == null ? Lv : Dv(typeof e == "function" ? e : zh(e)));
}
var Fv = Array.prototype.filter;
function Hv() {
  return Array.from(this.children);
}
function Vv(e) {
  return function() {
    return Fv.call(this.children, e);
  };
}
function Bv(e) {
  return this.selectAll(e == null ? Hv : Vv(typeof e == "function" ? e : zh(e)));
}
function jv(e) {
  typeof e != "function" && (e = Mh(e));
  for (var t = this._groups, n = t.length, r = new Array(n), o = 0; o < n; ++o)
    for (var i = t[o], l = i.length, s = r[o] = [], u, a = 0; a < l; ++a)
      (u = i[a]) && e.call(u, u.__data__, a, i) && s.push(u);
  return new be(r, this._parents);
}
function Th(e) {
  return new Array(e.length);
}
function Uv() {
  return new be(this._enter || this._groups.map(Th), this._parents);
}
function pl(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
pl.prototype = {
  constructor: pl,
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
function Wv(e) {
  return function() {
    return e;
  };
}
function Yv(e, t, n, r, o, i) {
  for (var l = 0, s, u = t.length, a = i.length; l < a; ++l)
    (s = t[l]) ? (s.__data__ = i[l], r[l] = s) : n[l] = new pl(e, i[l]);
  for (; l < u; ++l)
    (s = t[l]) && (o[l] = s);
}
function Xv(e, t, n, r, o, i, l) {
  var s, u, a = /* @__PURE__ */ new Map(), c = t.length, f = i.length, d = new Array(c), m;
  for (s = 0; s < c; ++s)
    (u = t[s]) && (d[s] = m = l.call(u, u.__data__, s, t) + "", a.has(m) ? o[s] = u : a.set(m, u));
  for (s = 0; s < f; ++s)
    m = l.call(e, i[s], s, i) + "", (u = a.get(m)) ? (r[s] = u, u.__data__ = i[s], a.delete(m)) : n[s] = new pl(e, i[s]);
  for (s = 0; s < c; ++s)
    (u = t[s]) && a.get(d[s]) === u && (o[s] = u);
}
function Qv(e) {
  return e.__data__;
}
function Kv(e, t) {
  if (!arguments.length) return Array.from(this, Qv);
  var n = t ? Xv : Yv, r = this._parents, o = this._groups;
  typeof e != "function" && (e = Wv(e));
  for (var i = o.length, l = new Array(i), s = new Array(i), u = new Array(i), a = 0; a < i; ++a) {
    var c = r[a], f = o[a], d = f.length, m = Gv(e.call(c, c && c.__data__, a, r)), x = m.length, y = s[a] = new Array(x), _ = l[a] = new Array(x), p = u[a] = new Array(d);
    n(c, f, y, _, p, m, t);
    for (var h = 0, g = 0, v, E; h < x; ++h)
      if (v = y[h]) {
        for (h >= g && (g = h + 1); !(E = _[g]) && ++g < x; ) ;
        v._next = E || null;
      }
  }
  return l = new be(l, r), l._enter = s, l._exit = u, l;
}
function Gv(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function Zv() {
  return new be(this._exit || this._groups.map(Th), this._parents);
}
function qv(e, t, n) {
  var r = this.enter(), o = this, i = this.exit();
  return typeof e == "function" ? (r = e(r), r && (r = r.selection())) : r = r.append(e + ""), t != null && (o = t(o), o && (o = o.selection())), n == null ? i.remove() : n(i), r && o ? r.merge(o).order() : o;
}
function Jv(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, r = t._groups, o = n.length, i = r.length, l = Math.min(o, i), s = new Array(o), u = 0; u < l; ++u)
    for (var a = n[u], c = r[u], f = a.length, d = s[u] = new Array(f), m, x = 0; x < f; ++x)
      (m = a[x] || c[x]) && (d[x] = m);
  for (; u < o; ++u)
    s[u] = n[u];
  return new be(s, this._parents);
}
function bv() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var r = e[t], o = r.length - 1, i = r[o], l; --o >= 0; )
      (l = r[o]) && (i && l.compareDocumentPosition(i) ^ 4 && i.parentNode.insertBefore(l, i), i = l);
  return this;
}
function e1(e) {
  e || (e = t1);
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
function t1(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function n1() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function r1() {
  return Array.from(this);
}
function o1() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var r = e[t], o = 0, i = r.length; o < i; ++o) {
      var l = r[o];
      if (l) return l;
    }
  return null;
}
function i1() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function l1() {
  return !this.node();
}
function s1(e) {
  for (var t = this._groups, n = 0, r = t.length; n < r; ++n)
    for (var o = t[n], i = 0, l = o.length, s; i < l; ++i)
      (s = o[i]) && e.call(s, s.__data__, i, o);
  return this;
}
function u1(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function a1(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function c1(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function f1(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function d1(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function p1(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function h1(e, t) {
  var n = Hl(e);
  if (arguments.length < 2) {
    var r = this.node();
    return n.local ? r.getAttributeNS(n.space, n.local) : r.getAttribute(n);
  }
  return this.each((t == null ? n.local ? a1 : u1 : typeof t == "function" ? n.local ? p1 : d1 : n.local ? f1 : c1)(n, t));
}
function Ph(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function m1(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function g1(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function y1(e, t, n) {
  return function() {
    var r = t.apply(this, arguments);
    r == null ? this.style.removeProperty(e) : this.style.setProperty(e, r, n);
  };
}
function v1(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? m1 : typeof t == "function" ? y1 : g1)(e, t, n ?? "")) : Ir(this.node(), e);
}
function Ir(e, t) {
  return e.style.getPropertyValue(t) || Ph(e).getComputedStyle(e, null).getPropertyValue(t);
}
function w1(e) {
  return function() {
    delete this[e];
  };
}
function x1(e, t) {
  return function() {
    this[e] = t;
  };
}
function S1(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function _1(e, t) {
  return arguments.length > 1 ? this.each((t == null ? w1 : typeof t == "function" ? S1 : x1)(e, t)) : this.node()[e];
}
function $h(e) {
  return e.trim().split(/^|\s+/);
}
function La(e) {
  return e.classList || new Rh(e);
}
function Rh(e) {
  this._node = e, this._names = $h(e.getAttribute("class") || "");
}
Rh.prototype = {
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
function Ah(e, t) {
  for (var n = La(e), r = -1, o = t.length; ++r < o; ) n.add(t[r]);
}
function Ih(e, t) {
  for (var n = La(e), r = -1, o = t.length; ++r < o; ) n.remove(t[r]);
}
function E1(e) {
  return function() {
    Ah(this, e);
  };
}
function k1(e) {
  return function() {
    Ih(this, e);
  };
}
function N1(e, t) {
  return function() {
    (t.apply(this, arguments) ? Ah : Ih)(this, e);
  };
}
function C1(e, t) {
  var n = $h(e + "");
  if (arguments.length < 2) {
    for (var r = La(this.node()), o = -1, i = n.length; ++o < i; ) if (!r.contains(n[o])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? N1 : t ? E1 : k1)(n, t));
}
function M1() {
  this.textContent = "";
}
function z1(e) {
  return function() {
    this.textContent = e;
  };
}
function T1(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function P1(e) {
  return arguments.length ? this.each(e == null ? M1 : (typeof e == "function" ? T1 : z1)(e)) : this.node().textContent;
}
function $1() {
  this.innerHTML = "";
}
function R1(e) {
  return function() {
    this.innerHTML = e;
  };
}
function A1(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function I1(e) {
  return arguments.length ? this.each(e == null ? $1 : (typeof e == "function" ? A1 : R1)(e)) : this.node().innerHTML;
}
function D1() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function L1() {
  return this.each(D1);
}
function O1() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function F1() {
  return this.each(O1);
}
function H1(e) {
  var t = typeof e == "function" ? e : Nh(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function V1() {
  return null;
}
function B1(e, t) {
  var n = typeof e == "function" ? e : Nh(e), r = t == null ? V1 : typeof t == "function" ? t : Da(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), r.apply(this, arguments) || null);
  });
}
function j1() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function U1() {
  return this.each(j1);
}
function W1() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Y1() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function X1(e) {
  return this.select(e ? Y1 : W1);
}
function Q1(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function K1(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function G1(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", r = t.indexOf(".");
    return r >= 0 && (n = t.slice(r + 1), t = t.slice(0, r)), { type: t, name: n };
  });
}
function Z1(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, r = -1, o = t.length, i; n < o; ++n)
        i = t[n], (!e.type || i.type === e.type) && i.name === e.name ? this.removeEventListener(i.type, i.listener, i.options) : t[++r] = i;
      ++r ? t.length = r : delete this.__on;
    }
  };
}
function q1(e, t, n) {
  return function() {
    var r = this.__on, o, i = K1(t);
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
function J1(e, t, n) {
  var r = G1(e + ""), o, i = r.length, l;
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
  for (s = t ? q1 : Z1, o = 0; o < i; ++o) this.each(s(r[o], t, n));
  return this;
}
function Dh(e, t, n) {
  var r = Ph(e), o = r.CustomEvent;
  typeof o == "function" ? o = new o(t, n) : (o = r.document.createEvent("Event"), n ? (o.initEvent(t, n.bubbles, n.cancelable), o.detail = n.detail) : o.initEvent(t, !1, !1)), e.dispatchEvent(o);
}
function b1(e, t) {
  return function() {
    return Dh(this, e, t);
  };
}
function ew(e, t) {
  return function() {
    return Dh(this, e, t.apply(this, arguments));
  };
}
function tw(e, t) {
  return this.each((typeof t == "function" ? ew : b1)(e, t));
}
function* nw() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var r = e[t], o = 0, i = r.length, l; o < i; ++o)
      (l = r[o]) && (yield l);
}
var Lh = [null];
function be(e, t) {
  this._groups = e, this._parents = t;
}
function Jo() {
  return new be([[document.documentElement]], Lh);
}
function rw() {
  return this;
}
be.prototype = Jo.prototype = {
  constructor: be,
  select: Tv,
  selectAll: Av,
  selectChild: Ov,
  selectChildren: Bv,
  filter: jv,
  data: Kv,
  enter: Uv,
  exit: Zv,
  join: qv,
  merge: Jv,
  selection: rw,
  order: bv,
  sort: e1,
  call: n1,
  nodes: r1,
  node: o1,
  size: i1,
  empty: l1,
  each: s1,
  attr: h1,
  style: v1,
  property: _1,
  classed: C1,
  text: P1,
  html: I1,
  raise: L1,
  lower: F1,
  append: H1,
  insert: B1,
  remove: U1,
  clone: X1,
  datum: Q1,
  on: J1,
  dispatch: tw,
  [Symbol.iterator]: nw
};
function ot(e) {
  return typeof e == "string" ? new be([[document.querySelector(e)]], [document.documentElement]) : new be([[e]], Lh);
}
function ow(e) {
  let t;
  for (; t = e.sourceEvent; ) e = t;
  return e;
}
function ht(e, t) {
  if (e = ow(e), t === void 0 && (t = e.currentTarget), t) {
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
const iw = { passive: !1 }, Fo = { capture: !0, passive: !1 };
function Ss(e) {
  e.stopImmediatePropagation();
}
function Er(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function Oh(e) {
  var t = e.document.documentElement, n = ot(e).on("dragstart.drag", Er, Fo);
  "onselectstart" in t ? n.on("selectstart.drag", Er, Fo) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function Fh(e, t) {
  var n = e.document.documentElement, r = ot(e).on("dragstart.drag", null);
  t && (r.on("click.drag", Er, Fo), setTimeout(function() {
    r.on("click.drag", null);
  }, 0)), "onselectstart" in n ? r.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
const vi = (e) => () => e;
function Nu(e, {
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
Nu.prototype.on = function() {
  var e = this._.on.apply(this._, arguments);
  return e === this._ ? this : e;
};
function lw(e) {
  return !e.ctrlKey && !e.button;
}
function sw() {
  return this.parentNode;
}
function uw(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function aw() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function cw() {
  var e = lw, t = sw, n = uw, r = aw, o = {}, i = Fl("start", "drag", "end"), l = 0, s, u, a, c, f = 0;
  function d(v) {
    v.on("mousedown.drag", m).filter(r).on("touchstart.drag", _).on("touchmove.drag", p, iw).on("touchend.drag touchcancel.drag", h).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function m(v, E) {
    if (!(c || !e.call(this, v, E))) {
      var C = g(this, t.call(this, v, E), v, E, "mouse");
      C && (ot(v.view).on("mousemove.drag", x, Fo).on("mouseup.drag", y, Fo), Oh(v.view), Ss(v), a = !1, s = v.clientX, u = v.clientY, C("start", v));
    }
  }
  function x(v) {
    if (Er(v), !a) {
      var E = v.clientX - s, C = v.clientY - u;
      a = E * E + C * C > f;
    }
    o.mouse("drag", v);
  }
  function y(v) {
    ot(v.view).on("mousemove.drag mouseup.drag", null), Fh(v.view, a), Er(v), o.mouse("end", v);
  }
  function _(v, E) {
    if (e.call(this, v, E)) {
      var C = v.changedTouches, M = t.call(this, v, E), P = C.length, A, I;
      for (A = 0; A < P; ++A)
        (I = g(this, M, v, E, C[A].identifier, C[A])) && (Ss(v), I("start", v, C[A]));
    }
  }
  function p(v) {
    var E = v.changedTouches, C = E.length, M, P;
    for (M = 0; M < C; ++M)
      (P = o[E[M].identifier]) && (Er(v), P("drag", v, E[M]));
  }
  function h(v) {
    var E = v.changedTouches, C = E.length, M, P;
    for (c && clearTimeout(c), c = setTimeout(function() {
      c = null;
    }, 500), M = 0; M < C; ++M)
      (P = o[E[M].identifier]) && (Ss(v), P("end", v, E[M]));
  }
  function g(v, E, C, M, P, A) {
    var I = i.copy(), F = ht(A || C, E), B, V, w;
    if ((w = n.call(v, new Nu("beforestart", {
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
      return B = w.x - F[0] || 0, V = w.y - F[1] || 0, function $(k, L, N) {
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
          v,
          new Nu(k, {
            sourceEvent: L,
            subject: w,
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
  return d.filter = function(v) {
    return arguments.length ? (e = typeof v == "function" ? v : vi(!!v), d) : e;
  }, d.container = function(v) {
    return arguments.length ? (t = typeof v == "function" ? v : vi(v), d) : t;
  }, d.subject = function(v) {
    return arguments.length ? (n = typeof v == "function" ? v : vi(v), d) : n;
  }, d.touchable = function(v) {
    return arguments.length ? (r = typeof v == "function" ? v : vi(!!v), d) : r;
  }, d.on = function() {
    var v = i.on.apply(i, arguments);
    return v === i ? d : v;
  }, d.clickDistance = function(v) {
    return arguments.length ? (f = (v = +v) * v, d) : Math.sqrt(f);
  }, d;
}
function Oa(e, t, n) {
  e.prototype = t.prototype = n, n.constructor = e;
}
function Hh(e, t) {
  var n = Object.create(e.prototype);
  for (var r in t) n[r] = t[r];
  return n;
}
function bo() {
}
var Ho = 0.7, hl = 1 / Ho, kr = "\\s*([+-]?\\d+)\\s*", Vo = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", zt = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", fw = /^#([0-9a-f]{3,8})$/, dw = new RegExp(`^rgb\\(${kr},${kr},${kr}\\)$`), pw = new RegExp(`^rgb\\(${zt},${zt},${zt}\\)$`), hw = new RegExp(`^rgba\\(${kr},${kr},${kr},${Vo}\\)$`), mw = new RegExp(`^rgba\\(${zt},${zt},${zt},${Vo}\\)$`), gw = new RegExp(`^hsl\\(${Vo},${zt},${zt}\\)$`), yw = new RegExp(`^hsla\\(${Vo},${zt},${zt},${Vo}\\)$`), gf = {
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
Oa(bo, Bo, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: yf,
  // Deprecated! Use color.formatHex.
  formatHex: yf,
  formatHex8: vw,
  formatHsl: ww,
  formatRgb: vf,
  toString: vf
});
function yf() {
  return this.rgb().formatHex();
}
function vw() {
  return this.rgb().formatHex8();
}
function ww() {
  return Vh(this).formatHsl();
}
function vf() {
  return this.rgb().formatRgb();
}
function Bo(e) {
  var t, n;
  return e = (e + "").trim().toLowerCase(), (t = fw.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? wf(t) : n === 3 ? new We(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? wi(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? wi(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = dw.exec(e)) ? new We(t[1], t[2], t[3], 1) : (t = pw.exec(e)) ? new We(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = hw.exec(e)) ? wi(t[1], t[2], t[3], t[4]) : (t = mw.exec(e)) ? wi(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = gw.exec(e)) ? _f(t[1], t[2] / 100, t[3] / 100, 1) : (t = yw.exec(e)) ? _f(t[1], t[2] / 100, t[3] / 100, t[4]) : gf.hasOwnProperty(e) ? wf(gf[e]) : e === "transparent" ? new We(NaN, NaN, NaN, 0) : null;
}
function wf(e) {
  return new We(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function wi(e, t, n, r) {
  return r <= 0 && (e = t = n = NaN), new We(e, t, n, r);
}
function xw(e) {
  return e instanceof bo || (e = Bo(e)), e ? (e = e.rgb(), new We(e.r, e.g, e.b, e.opacity)) : new We();
}
function Cu(e, t, n, r) {
  return arguments.length === 1 ? xw(e) : new We(e, t, n, r ?? 1);
}
function We(e, t, n, r) {
  this.r = +e, this.g = +t, this.b = +n, this.opacity = +r;
}
Oa(We, Cu, Hh(bo, {
  brighter(e) {
    return e = e == null ? hl : Math.pow(hl, e), new We(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? Ho : Math.pow(Ho, e), new We(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new We(On(this.r), On(this.g), On(this.b), ml(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: xf,
  // Deprecated! Use color.formatHex.
  formatHex: xf,
  formatHex8: Sw,
  formatRgb: Sf,
  toString: Sf
}));
function xf() {
  return `#${An(this.r)}${An(this.g)}${An(this.b)}`;
}
function Sw() {
  return `#${An(this.r)}${An(this.g)}${An(this.b)}${An((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function Sf() {
  const e = ml(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${On(this.r)}, ${On(this.g)}, ${On(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function ml(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function On(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function An(e) {
  return e = On(e), (e < 16 ? "0" : "") + e.toString(16);
}
function _f(e, t, n, r) {
  return r <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new gt(e, t, n, r);
}
function Vh(e) {
  if (e instanceof gt) return new gt(e.h, e.s, e.l, e.opacity);
  if (e instanceof bo || (e = Bo(e)), !e) return new gt();
  if (e instanceof gt) return e;
  e = e.rgb();
  var t = e.r / 255, n = e.g / 255, r = e.b / 255, o = Math.min(t, n, r), i = Math.max(t, n, r), l = NaN, s = i - o, u = (i + o) / 2;
  return s ? (t === i ? l = (n - r) / s + (n < r) * 6 : n === i ? l = (r - t) / s + 2 : l = (t - n) / s + 4, s /= u < 0.5 ? i + o : 2 - i - o, l *= 60) : s = u > 0 && u < 1 ? 0 : l, new gt(l, s, u, e.opacity);
}
function _w(e, t, n, r) {
  return arguments.length === 1 ? Vh(e) : new gt(e, t, n, r ?? 1);
}
function gt(e, t, n, r) {
  this.h = +e, this.s = +t, this.l = +n, this.opacity = +r;
}
Oa(gt, _w, Hh(bo, {
  brighter(e) {
    return e = e == null ? hl : Math.pow(hl, e), new gt(this.h, this.s, this.l * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? Ho : Math.pow(Ho, e), new gt(this.h, this.s, this.l * e, this.opacity);
  },
  rgb() {
    var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, n = this.l, r = n + (n < 0.5 ? n : 1 - n) * t, o = 2 * n - r;
    return new We(
      _s(e >= 240 ? e - 240 : e + 120, o, r),
      _s(e, o, r),
      _s(e < 120 ? e + 240 : e - 120, o, r),
      this.opacity
    );
  },
  clamp() {
    return new gt(Ef(this.h), xi(this.s), xi(this.l), ml(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = ml(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${Ef(this.h)}, ${xi(this.s) * 100}%, ${xi(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function Ef(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function xi(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function _s(e, t, n) {
  return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
const Bh = (e) => () => e;
function Ew(e, t) {
  return function(n) {
    return e + n * t;
  };
}
function kw(e, t, n) {
  return e = Math.pow(e, n), t = Math.pow(t, n) - e, n = 1 / n, function(r) {
    return Math.pow(e + r * t, n);
  };
}
function Nw(e) {
  return (e = +e) == 1 ? jh : function(t, n) {
    return n - t ? kw(t, n, e) : Bh(isNaN(t) ? n : t);
  };
}
function jh(e, t) {
  var n = t - e;
  return n ? Ew(e, n) : Bh(isNaN(e) ? t : e);
}
const kf = function e(t) {
  var n = Nw(t);
  function r(o, i) {
    var l = n((o = Cu(o)).r, (i = Cu(i)).r), s = n(o.g, i.g), u = n(o.b, i.b), a = jh(o.opacity, i.opacity);
    return function(c) {
      return o.r = l(c), o.g = s(c), o.b = u(c), o.opacity = a(c), o + "";
    };
  }
  return r.gamma = e, r;
}(1);
function bt(e, t) {
  return e = +e, t = +t, function(n) {
    return e * (1 - n) + t * n;
  };
}
var Mu = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, Es = new RegExp(Mu.source, "g");
function Cw(e) {
  return function() {
    return e;
  };
}
function Mw(e) {
  return function(t) {
    return e(t) + "";
  };
}
function zw(e, t) {
  var n = Mu.lastIndex = Es.lastIndex = 0, r, o, i, l = -1, s = [], u = [];
  for (e = e + "", t = t + ""; (r = Mu.exec(e)) && (o = Es.exec(t)); )
    (i = o.index) > n && (i = t.slice(n, i), s[l] ? s[l] += i : s[++l] = i), (r = r[0]) === (o = o[0]) ? s[l] ? s[l] += o : s[++l] = o : (s[++l] = null, u.push({ i: l, x: bt(r, o) })), n = Es.lastIndex;
  return n < t.length && (i = t.slice(n), s[l] ? s[l] += i : s[++l] = i), s.length < 2 ? u[0] ? Mw(u[0].x) : Cw(t) : (t = u.length, function(a) {
    for (var c = 0, f; c < t; ++c) s[(f = u[c]).i] = f.x(a);
    return s.join("");
  });
}
var Nf = 180 / Math.PI, zu = {
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
    rotate: Math.atan2(t, e) * Nf,
    skewX: Math.atan(u) * Nf,
    scaleX: l,
    scaleY: s
  };
}
var Si;
function Tw(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? zu : Uh(t.a, t.b, t.c, t.d, t.e, t.f);
}
function Pw(e) {
  return e == null || (Si || (Si = document.createElementNS("http://www.w3.org/2000/svg", "g")), Si.setAttribute("transform", e), !(e = Si.transform.baseVal.consolidate())) ? zu : (e = e.matrix, Uh(e.a, e.b, e.c, e.d, e.e, e.f));
}
function Wh(e, t, n, r) {
  function o(a) {
    return a.length ? a.pop() + " " : "";
  }
  function i(a, c, f, d, m, x) {
    if (a !== f || c !== d) {
      var y = m.push("translate(", null, t, null, n);
      x.push({ i: y - 4, x: bt(a, f) }, { i: y - 2, x: bt(c, d) });
    } else (f || d) && m.push("translate(" + f + t + d + n);
  }
  function l(a, c, f, d) {
    a !== c ? (a - c > 180 ? c += 360 : c - a > 180 && (a += 360), d.push({ i: f.push(o(f) + "rotate(", null, r) - 2, x: bt(a, c) })) : c && f.push(o(f) + "rotate(" + c + r);
  }
  function s(a, c, f, d) {
    a !== c ? d.push({ i: f.push(o(f) + "skewX(", null, r) - 2, x: bt(a, c) }) : c && f.push(o(f) + "skewX(" + c + r);
  }
  function u(a, c, f, d, m, x) {
    if (a !== f || c !== d) {
      var y = m.push(o(m) + "scale(", null, ",", null, ")");
      x.push({ i: y - 4, x: bt(a, f) }, { i: y - 2, x: bt(c, d) });
    } else (f !== 1 || d !== 1) && m.push(o(m) + "scale(" + f + "," + d + ")");
  }
  return function(a, c) {
    var f = [], d = [];
    return a = e(a), c = e(c), i(a.translateX, a.translateY, c.translateX, c.translateY, f, d), l(a.rotate, c.rotate, f, d), s(a.skewX, c.skewX, f, d), u(a.scaleX, a.scaleY, c.scaleX, c.scaleY, f, d), a = c = null, function(m) {
      for (var x = -1, y = d.length, _; ++x < y; ) f[(_ = d[x]).i] = _.x(m);
      return f.join("");
    };
  };
}
var $w = Wh(Tw, "px, ", "px)", "deg)"), Rw = Wh(Pw, ", ", ")", ")"), Aw = 1e-12;
function Cf(e) {
  return ((e = Math.exp(e)) + 1 / e) / 2;
}
function Iw(e) {
  return ((e = Math.exp(e)) - 1 / e) / 2;
}
function Dw(e) {
  return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const Lw = function e(t, n, r) {
  function o(i, l) {
    var s = i[0], u = i[1], a = i[2], c = l[0], f = l[1], d = l[2], m = c - s, x = f - u, y = m * m + x * x, _, p;
    if (y < Aw)
      p = Math.log(d / a) / t, _ = function(M) {
        return [
          s + M * m,
          u + M * x,
          a * Math.exp(t * M * p)
        ];
      };
    else {
      var h = Math.sqrt(y), g = (d * d - a * a + r * y) / (2 * a * n * h), v = (d * d - a * a - r * y) / (2 * d * n * h), E = Math.log(Math.sqrt(g * g + 1) - g), C = Math.log(Math.sqrt(v * v + 1) - v);
      p = (C - E) / t, _ = function(M) {
        var P = M * p, A = Cf(E), I = a / (n * h) * (A * Dw(t * P + E) - Iw(E));
        return [
          s + I * m,
          u + I * x,
          a * A / Cf(t * P + E)
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
var Dr = 0, uo = 0, br = 0, Yh = 1e3, gl, ao, yl = 0, Wn = 0, Vl = 0, jo = typeof performance == "object" && performance.now ? performance : Date, Xh = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function Fa() {
  return Wn || (Xh(Ow), Wn = jo.now() + Vl);
}
function Ow() {
  Wn = 0;
}
function vl() {
  this._call = this._time = this._next = null;
}
vl.prototype = Qh.prototype = {
  constructor: vl,
  restart: function(e, t, n) {
    if (typeof e != "function") throw new TypeError("callback is not a function");
    n = (n == null ? Fa() : +n) + (t == null ? 0 : +t), !this._next && ao !== this && (ao ? ao._next = this : gl = this, ao = this), this._call = e, this._time = n, Tu();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Tu());
  }
};
function Qh(e, t, n) {
  var r = new vl();
  return r.restart(e, t, n), r;
}
function Fw() {
  Fa(), ++Dr;
  for (var e = gl, t; e; )
    (t = Wn - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --Dr;
}
function Mf() {
  Wn = (yl = jo.now()) + Vl, Dr = uo = 0;
  try {
    Fw();
  } finally {
    Dr = 0, Vw(), Wn = 0;
  }
}
function Hw() {
  var e = jo.now(), t = e - yl;
  t > Yh && (Vl -= t, yl = e);
}
function Vw() {
  for (var e, t = gl, n, r = 1 / 0; t; )
    t._call ? (r > t._time && (r = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : gl = n);
  ao = e, Tu(r);
}
function Tu(e) {
  if (!Dr) {
    uo && (uo = clearTimeout(uo));
    var t = e - Wn;
    t > 24 ? (e < 1 / 0 && (uo = setTimeout(Mf, e - jo.now() - Vl)), br && (br = clearInterval(br))) : (br || (yl = jo.now(), br = setInterval(Hw, Yh)), Dr = 1, Xh(Mf));
  }
}
function zf(e, t, n) {
  var r = new vl();
  return t = t == null ? 0 : +t, r.restart((o) => {
    r.stop(), e(o + t);
  }, t, n), r;
}
var Bw = Fl("start", "end", "cancel", "interrupt"), jw = [], Kh = 0, Tf = 1, Pu = 2, Vi = 3, Pf = 4, $u = 5, Bi = 6;
function Bl(e, t, n, r, o, i) {
  var l = e.__transition;
  if (!l) e.__transition = {};
  else if (n in l) return;
  Uw(e, n, {
    name: t,
    index: r,
    // For context during callback.
    group: o,
    // For context during callback.
    on: Bw,
    tween: jw,
    time: i.time,
    delay: i.delay,
    duration: i.duration,
    ease: i.ease,
    timer: null,
    state: Kh
  });
}
function Ha(e, t) {
  var n = St(e, t);
  if (n.state > Kh) throw new Error("too late; already scheduled");
  return n;
}
function Tt(e, t) {
  var n = St(e, t);
  if (n.state > Vi) throw new Error("too late; already running");
  return n;
}
function St(e, t) {
  var n = e.__transition;
  if (!n || !(n = n[t])) throw new Error("transition not found");
  return n;
}
function Uw(e, t, n) {
  var r = e.__transition, o;
  r[t] = n, n.timer = Qh(i, 0, n.time);
  function i(a) {
    n.state = Tf, n.timer.restart(l, n.delay, n.time), n.delay <= a && l(a - n.delay);
  }
  function l(a) {
    var c, f, d, m;
    if (n.state !== Tf) return u();
    for (c in r)
      if (m = r[c], m.name === n.name) {
        if (m.state === Vi) return zf(l);
        m.state === Pf ? (m.state = Bi, m.timer.stop(), m.on.call("interrupt", e, e.__data__, m.index, m.group), delete r[c]) : +c < t && (m.state = Bi, m.timer.stop(), m.on.call("cancel", e, e.__data__, m.index, m.group), delete r[c]);
      }
    if (zf(function() {
      n.state === Vi && (n.state = Pf, n.timer.restart(s, n.delay, n.time), s(a));
    }), n.state = Pu, n.on.call("start", e, e.__data__, n.index, n.group), n.state === Pu) {
      for (n.state = Vi, o = new Array(d = n.tween.length), c = 0, f = -1; c < d; ++c)
        (m = n.tween[c].value.call(e, e.__data__, n.index, n.group)) && (o[++f] = m);
      o.length = f + 1;
    }
  }
  function s(a) {
    for (var c = a < n.duration ? n.ease.call(null, a / n.duration) : (n.timer.restart(u), n.state = $u, 1), f = -1, d = o.length; ++f < d; )
      o[f].call(e, c);
    n.state === $u && (n.on.call("end", e, e.__data__, n.index, n.group), u());
  }
  function u() {
    n.state = Bi, n.timer.stop(), delete r[t];
    for (var a in r) return;
    delete e.__transition;
  }
}
function ji(e, t) {
  var n = e.__transition, r, o, i = !0, l;
  if (n) {
    t = t == null ? null : t + "";
    for (l in n) {
      if ((r = n[l]).name !== t) {
        i = !1;
        continue;
      }
      o = r.state > Pu && r.state < $u, r.state = Bi, r.timer.stop(), r.on.call(o ? "interrupt" : "cancel", e, e.__data__, r.index, r.group), delete n[l];
    }
    i && delete e.__transition;
  }
}
function Ww(e) {
  return this.each(function() {
    ji(this, e);
  });
}
function Yw(e, t) {
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
function Xw(e, t, n) {
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
function Qw(e, t) {
  var n = this._id;
  if (e += "", arguments.length < 2) {
    for (var r = St(this.node(), n).tween, o = 0, i = r.length, l; o < i; ++o)
      if ((l = r[o]).name === e)
        return l.value;
    return null;
  }
  return this.each((t == null ? Yw : Xw)(n, e, t));
}
function Va(e, t, n) {
  var r = e._id;
  return e.each(function() {
    var o = Tt(this, r);
    (o.value || (o.value = {}))[t] = n.apply(this, arguments);
  }), function(o) {
    return St(o, r).value[t];
  };
}
function Gh(e, t) {
  var n;
  return (typeof t == "number" ? bt : t instanceof Bo ? kf : (n = Bo(t)) ? (t = n, kf) : zw)(e, t);
}
function Kw(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function Gw(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function Zw(e, t, n) {
  var r, o = n + "", i;
  return function() {
    var l = this.getAttribute(e);
    return l === o ? null : l === r ? i : i = t(r = l, n);
  };
}
function qw(e, t, n) {
  var r, o = n + "", i;
  return function() {
    var l = this.getAttributeNS(e.space, e.local);
    return l === o ? null : l === r ? i : i = t(r = l, n);
  };
}
function Jw(e, t, n) {
  var r, o, i;
  return function() {
    var l, s = n(this), u;
    return s == null ? void this.removeAttribute(e) : (l = this.getAttribute(e), u = s + "", l === u ? null : l === r && u === o ? i : (o = u, i = t(r = l, s)));
  };
}
function bw(e, t, n) {
  var r, o, i;
  return function() {
    var l, s = n(this), u;
    return s == null ? void this.removeAttributeNS(e.space, e.local) : (l = this.getAttributeNS(e.space, e.local), u = s + "", l === u ? null : l === r && u === o ? i : (o = u, i = t(r = l, s)));
  };
}
function ex(e, t) {
  var n = Hl(e), r = n === "transform" ? Rw : Gh;
  return this.attrTween(e, typeof t == "function" ? (n.local ? bw : Jw)(n, r, Va(this, "attr." + e, t)) : t == null ? (n.local ? Gw : Kw)(n) : (n.local ? qw : Zw)(n, r, t));
}
function tx(e, t) {
  return function(n) {
    this.setAttribute(e, t.call(this, n));
  };
}
function nx(e, t) {
  return function(n) {
    this.setAttributeNS(e.space, e.local, t.call(this, n));
  };
}
function rx(e, t) {
  var n, r;
  function o() {
    var i = t.apply(this, arguments);
    return i !== r && (n = (r = i) && nx(e, i)), n;
  }
  return o._value = t, o;
}
function ox(e, t) {
  var n, r;
  function o() {
    var i = t.apply(this, arguments);
    return i !== r && (n = (r = i) && tx(e, i)), n;
  }
  return o._value = t, o;
}
function ix(e, t) {
  var n = "attr." + e;
  if (arguments.length < 2) return (n = this.tween(n)) && n._value;
  if (t == null) return this.tween(n, null);
  if (typeof t != "function") throw new Error();
  var r = Hl(e);
  return this.tween(n, (r.local ? rx : ox)(r, t));
}
function lx(e, t) {
  return function() {
    Ha(this, e).delay = +t.apply(this, arguments);
  };
}
function sx(e, t) {
  return t = +t, function() {
    Ha(this, e).delay = t;
  };
}
function ux(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? lx : sx)(t, e)) : St(this.node(), t).delay;
}
function ax(e, t) {
  return function() {
    Tt(this, e).duration = +t.apply(this, arguments);
  };
}
function cx(e, t) {
  return t = +t, function() {
    Tt(this, e).duration = t;
  };
}
function fx(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? ax : cx)(t, e)) : St(this.node(), t).duration;
}
function dx(e, t) {
  if (typeof t != "function") throw new Error();
  return function() {
    Tt(this, e).ease = t;
  };
}
function px(e) {
  var t = this._id;
  return arguments.length ? this.each(dx(t, e)) : St(this.node(), t).ease;
}
function hx(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    if (typeof n != "function") throw new Error();
    Tt(this, e).ease = n;
  };
}
function mx(e) {
  if (typeof e != "function") throw new Error();
  return this.each(hx(this._id, e));
}
function gx(e) {
  typeof e != "function" && (e = Mh(e));
  for (var t = this._groups, n = t.length, r = new Array(n), o = 0; o < n; ++o)
    for (var i = t[o], l = i.length, s = r[o] = [], u, a = 0; a < l; ++a)
      (u = i[a]) && e.call(u, u.__data__, a, i) && s.push(u);
  return new Yt(r, this._parents, this._name, this._id);
}
function yx(e) {
  if (e._id !== this._id) throw new Error();
  for (var t = this._groups, n = e._groups, r = t.length, o = n.length, i = Math.min(r, o), l = new Array(r), s = 0; s < i; ++s)
    for (var u = t[s], a = n[s], c = u.length, f = l[s] = new Array(c), d, m = 0; m < c; ++m)
      (d = u[m] || a[m]) && (f[m] = d);
  for (; s < r; ++s)
    l[s] = t[s];
  return new Yt(l, this._parents, this._name, this._id);
}
function vx(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var n = t.indexOf(".");
    return n >= 0 && (t = t.slice(0, n)), !t || t === "start";
  });
}
function wx(e, t, n) {
  var r, o, i = vx(t) ? Ha : Tt;
  return function() {
    var l = i(this, e), s = l.on;
    s !== r && (o = (r = s).copy()).on(t, n), l.on = o;
  };
}
function xx(e, t) {
  var n = this._id;
  return arguments.length < 2 ? St(this.node(), n).on.on(e) : this.each(wx(n, e, t));
}
function Sx(e) {
  return function() {
    var t = this.parentNode;
    for (var n in this.__transition) if (+n !== e) return;
    t && t.removeChild(this);
  };
}
function _x() {
  return this.on("end.remove", Sx(this._id));
}
function Ex(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = Da(e));
  for (var r = this._groups, o = r.length, i = new Array(o), l = 0; l < o; ++l)
    for (var s = r[l], u = s.length, a = i[l] = new Array(u), c, f, d = 0; d < u; ++d)
      (c = s[d]) && (f = e.call(c, c.__data__, d, s)) && ("__data__" in c && (f.__data__ = c.__data__), a[d] = f, Bl(a[d], t, n, d, a, St(c, n)));
  return new Yt(i, this._parents, t, n);
}
function kx(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = Ch(e));
  for (var r = this._groups, o = r.length, i = [], l = [], s = 0; s < o; ++s)
    for (var u = r[s], a = u.length, c, f = 0; f < a; ++f)
      if (c = u[f]) {
        for (var d = e.call(c, c.__data__, f, u), m, x = St(c, n), y = 0, _ = d.length; y < _; ++y)
          (m = d[y]) && Bl(m, t, n, y, d, x);
        i.push(d), l.push(c);
      }
  return new Yt(i, l, t, n);
}
var Nx = Jo.prototype.constructor;
function Cx() {
  return new Nx(this._groups, this._parents);
}
function Mx(e, t) {
  var n, r, o;
  return function() {
    var i = Ir(this, e), l = (this.style.removeProperty(e), Ir(this, e));
    return i === l ? null : i === n && l === r ? o : o = t(n = i, r = l);
  };
}
function Zh(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function zx(e, t, n) {
  var r, o = n + "", i;
  return function() {
    var l = Ir(this, e);
    return l === o ? null : l === r ? i : i = t(r = l, n);
  };
}
function Tx(e, t, n) {
  var r, o, i;
  return function() {
    var l = Ir(this, e), s = n(this), u = s + "";
    return s == null && (u = s = (this.style.removeProperty(e), Ir(this, e))), l === u ? null : l === r && u === o ? i : (o = u, i = t(r = l, s));
  };
}
function Px(e, t) {
  var n, r, o, i = "style." + t, l = "end." + i, s;
  return function() {
    var u = Tt(this, e), a = u.on, c = u.value[i] == null ? s || (s = Zh(t)) : void 0;
    (a !== n || o !== c) && (r = (n = a).copy()).on(l, o = c), u.on = r;
  };
}
function $x(e, t, n) {
  var r = (e += "") == "transform" ? $w : Gh;
  return t == null ? this.styleTween(e, Mx(e, r)).on("end.style." + e, Zh(e)) : typeof t == "function" ? this.styleTween(e, Tx(e, r, Va(this, "style." + e, t))).each(Px(this._id, e)) : this.styleTween(e, zx(e, r, t), n).on("end.style." + e, null);
}
function Rx(e, t, n) {
  return function(r) {
    this.style.setProperty(e, t.call(this, r), n);
  };
}
function Ax(e, t, n) {
  var r, o;
  function i() {
    var l = t.apply(this, arguments);
    return l !== o && (r = (o = l) && Rx(e, l, n)), r;
  }
  return i._value = t, i;
}
function Ix(e, t, n) {
  var r = "style." + (e += "");
  if (arguments.length < 2) return (r = this.tween(r)) && r._value;
  if (t == null) return this.tween(r, null);
  if (typeof t != "function") throw new Error();
  return this.tween(r, Ax(e, t, n ?? ""));
}
function Dx(e) {
  return function() {
    this.textContent = e;
  };
}
function Lx(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function Ox(e) {
  return this.tween("text", typeof e == "function" ? Lx(Va(this, "text", e)) : Dx(e == null ? "" : e + ""));
}
function Fx(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function Hx(e) {
  var t, n;
  function r() {
    var o = e.apply(this, arguments);
    return o !== n && (t = (n = o) && Fx(o)), t;
  }
  return r._value = e, r;
}
function Vx(e) {
  var t = "text";
  if (arguments.length < 1) return (t = this.tween(t)) && t._value;
  if (e == null) return this.tween(t, null);
  if (typeof e != "function") throw new Error();
  return this.tween(t, Hx(e));
}
function Bx() {
  for (var e = this._name, t = this._id, n = qh(), r = this._groups, o = r.length, i = 0; i < o; ++i)
    for (var l = r[i], s = l.length, u, a = 0; a < s; ++a)
      if (u = l[a]) {
        var c = St(u, t);
        Bl(u, e, n, a, l, {
          time: c.time + c.delay + c.duration,
          delay: 0,
          duration: c.duration,
          ease: c.ease
        });
      }
  return new Yt(r, this._parents, e, n);
}
function jx() {
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
function qh() {
  return ++Ux;
}
var At = Jo.prototype;
Yt.prototype = {
  constructor: Yt,
  select: Ex,
  selectAll: kx,
  selectChild: At.selectChild,
  selectChildren: At.selectChildren,
  filter: gx,
  merge: yx,
  selection: Cx,
  transition: Bx,
  call: At.call,
  nodes: At.nodes,
  node: At.node,
  size: At.size,
  empty: At.empty,
  each: At.each,
  on: xx,
  attr: ex,
  attrTween: ix,
  style: $x,
  styleTween: Ix,
  text: Ox,
  textTween: Vx,
  remove: _x,
  tween: Qw,
  delay: ux,
  duration: fx,
  ease: px,
  easeVarying: mx,
  end: jx,
  [Symbol.iterator]: At[Symbol.iterator]
};
function Wx(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var Yx = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: Wx
};
function Xx(e, t) {
  for (var n; !(n = e.__transition) || !(n = n[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return n;
}
function Qx(e) {
  var t, n;
  e instanceof Yt ? (t = e._id, e = e._name) : (t = qh(), (n = Yx).time = Fa(), e = e == null ? null : e + "");
  for (var r = this._groups, o = r.length, i = 0; i < o; ++i)
    for (var l = r[i], s = l.length, u, a = 0; a < s; ++a)
      (u = l[a]) && Bl(u, e, t, a, l, n || Xx(u, t));
  return new Yt(r, this._parents, e, t);
}
Jo.prototype.interrupt = Ww;
Jo.prototype.transition = Qx;
const _i = (e) => () => e;
function Kx(e, {
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
function ks(e) {
  e.stopImmediatePropagation();
}
function eo(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function Gx(e) {
  return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function Zx() {
  var e = this;
  return e instanceof SVGElement ? (e = e.ownerSVGElement || e, e.hasAttribute("viewBox") ? (e = e.viewBox.baseVal, [[e.x, e.y], [e.x + e.width, e.y + e.height]]) : [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]) : [[0, 0], [e.clientWidth, e.clientHeight]];
}
function $f() {
  return this.__zoom || Vt;
}
function qx(e) {
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * (e.ctrlKey ? 10 : 1);
}
function Jx() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function bx(e, t, n) {
  var r = e.invertX(t[0][0]) - n[0][0], o = e.invertX(t[1][0]) - n[1][0], i = e.invertY(t[0][1]) - n[0][1], l = e.invertY(t[1][1]) - n[1][1];
  return e.translate(
    o > r ? (r + o) / 2 : Math.min(0, r) || Math.max(0, o),
    l > i ? (i + l) / 2 : Math.min(0, i) || Math.max(0, l)
  );
}
function Jh() {
  var e = Gx, t = Zx, n = bx, r = qx, o = Jx, i = [0, 1 / 0], l = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], s = 250, u = Lw, a = Fl("start", "zoom", "end"), c, f, d, m = 500, x = 150, y = 0, _ = 10;
  function p(w) {
    w.property("__zoom", $f).on("wheel.zoom", P, { passive: !1 }).on("mousedown.zoom", A).on("dblclick.zoom", I).filter(o).on("touchstart.zoom", F).on("touchmove.zoom", B).on("touchend.zoom touchcancel.zoom", V).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  p.transform = function(w, $, k, L) {
    var N = w.selection ? w.selection() : w;
    N.property("__zoom", $f), w !== N ? E(w, $, k, L) : N.interrupt().each(function() {
      C(this, arguments).event(L).start().zoom(null, typeof $ == "function" ? $.apply(this, arguments) : $).end();
    });
  }, p.scaleBy = function(w, $, k, L) {
    p.scaleTo(w, function() {
      var N = this.__zoom.k, S = typeof $ == "function" ? $.apply(this, arguments) : $;
      return N * S;
    }, k, L);
  }, p.scaleTo = function(w, $, k, L) {
    p.transform(w, function() {
      var N = t.apply(this, arguments), S = this.__zoom, z = k == null ? v(N) : typeof k == "function" ? k.apply(this, arguments) : k, D = S.invert(z), O = typeof $ == "function" ? $.apply(this, arguments) : $;
      return n(g(h(S, O), z, D), N, l);
    }, k, L);
  }, p.translateBy = function(w, $, k, L) {
    p.transform(w, function() {
      return n(this.__zoom.translate(
        typeof $ == "function" ? $.apply(this, arguments) : $,
        typeof k == "function" ? k.apply(this, arguments) : k
      ), t.apply(this, arguments), l);
    }, null, L);
  }, p.translateTo = function(w, $, k, L, N) {
    p.transform(w, function() {
      var S = t.apply(this, arguments), z = this.__zoom, D = L == null ? v(S) : typeof L == "function" ? L.apply(this, arguments) : L;
      return n(Vt.translate(D[0], D[1]).scale(z.k).translate(
        typeof $ == "function" ? -$.apply(this, arguments) : -$,
        typeof k == "function" ? -k.apply(this, arguments) : -k
      ), S, l);
    }, L, N);
  };
  function h(w, $) {
    return $ = Math.max(i[0], Math.min(i[1], $)), $ === w.k ? w : new Ft($, w.x, w.y);
  }
  function g(w, $, k) {
    var L = $[0] - k[0] * w.k, N = $[1] - k[1] * w.k;
    return L === w.x && N === w.y ? w : new Ft(w.k, L, N);
  }
  function v(w) {
    return [(+w[0][0] + +w[1][0]) / 2, (+w[0][1] + +w[1][1]) / 2];
  }
  function E(w, $, k, L) {
    w.on("start.zoom", function() {
      C(this, arguments).event(L).start();
    }).on("interrupt.zoom end.zoom", function() {
      C(this, arguments).event(L).end();
    }).tween("zoom", function() {
      var N = this, S = arguments, z = C(N, S).event(L), D = t.apply(N, S), O = k == null ? v(D) : typeof k == "function" ? k.apply(N, S) : k, U = Math.max(D[1][0] - D[0][0], D[1][1] - D[0][1]), j = N.__zoom, X = typeof $ == "function" ? $.apply(N, S) : $, G = u(j.invert(O).concat(U / j.k), X.invert(O).concat(U / X.k));
      return function(Z) {
        if (Z === 1) Z = X;
        else {
          var ne = G(Z), te = U / ne[2];
          Z = new Ft(te, O[0] - ne[0] * te, O[1] - ne[1] * te);
        }
        z.zoom(null, Z);
      };
    });
  }
  function C(w, $, k) {
    return !k && w.__zooming || new M(w, $);
  }
  function M(w, $) {
    this.that = w, this.args = $, this.active = 0, this.sourceEvent = null, this.extent = t.apply(w, $), this.taps = 0;
  }
  M.prototype = {
    event: function(w) {
      return w && (this.sourceEvent = w), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(w, $) {
      return this.mouse && w !== "mouse" && (this.mouse[1] = $.invert(this.mouse[0])), this.touch0 && w !== "touch" && (this.touch0[1] = $.invert(this.touch0[0])), this.touch1 && w !== "touch" && (this.touch1[1] = $.invert(this.touch1[0])), this.that.__zoom = $, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(w) {
      var $ = ot(this.that).datum();
      a.call(
        w,
        this.that,
        new Kx(w, {
          sourceEvent: this.sourceEvent,
          target: p,
          transform: this.that.__zoom,
          dispatch: a
        }),
        $
      );
    }
  };
  function P(w, ...$) {
    if (!e.apply(this, arguments)) return;
    var k = C(this, $).event(w), L = this.__zoom, N = Math.max(i[0], Math.min(i[1], L.k * Math.pow(2, r.apply(this, arguments)))), S = ht(w);
    if (k.wheel)
      (k.mouse[0][0] !== S[0] || k.mouse[0][1] !== S[1]) && (k.mouse[1] = L.invert(k.mouse[0] = S)), clearTimeout(k.wheel);
    else {
      if (L.k === N) return;
      k.mouse = [S, L.invert(S)], ji(this), k.start();
    }
    eo(w), k.wheel = setTimeout(z, x), k.zoom("mouse", n(g(h(L, N), k.mouse[0], k.mouse[1]), k.extent, l));
    function z() {
      k.wheel = null, k.end();
    }
  }
  function A(w, ...$) {
    if (d || !e.apply(this, arguments)) return;
    var k = w.currentTarget, L = C(this, $, !0).event(w), N = ot(w.view).on("mousemove.zoom", O, !0).on("mouseup.zoom", U, !0), S = ht(w, k), z = w.clientX, D = w.clientY;
    Oh(w.view), ks(w), L.mouse = [S, this.__zoom.invert(S)], ji(this), L.start();
    function O(j) {
      if (eo(j), !L.moved) {
        var X = j.clientX - z, G = j.clientY - D;
        L.moved = X * X + G * G > y;
      }
      L.event(j).zoom("mouse", n(g(L.that.__zoom, L.mouse[0] = ht(j, k), L.mouse[1]), L.extent, l));
    }
    function U(j) {
      N.on("mousemove.zoom mouseup.zoom", null), Fh(j.view, L.moved), eo(j), L.event(j).end();
    }
  }
  function I(w, ...$) {
    if (e.apply(this, arguments)) {
      var k = this.__zoom, L = ht(w.changedTouches ? w.changedTouches[0] : w, this), N = k.invert(L), S = k.k * (w.shiftKey ? 0.5 : 2), z = n(g(h(k, S), L, N), t.apply(this, $), l);
      eo(w), s > 0 ? ot(this).transition().duration(s).call(E, z, L, w) : ot(this).call(p.transform, z, L, w);
    }
  }
  function F(w, ...$) {
    if (e.apply(this, arguments)) {
      var k = w.touches, L = k.length, N = C(this, $, w.changedTouches.length === L).event(w), S, z, D, O;
      for (ks(w), z = 0; z < L; ++z)
        D = k[z], O = ht(D, this), O = [O, this.__zoom.invert(O), D.identifier], N.touch0 ? !N.touch1 && N.touch0[2] !== O[2] && (N.touch1 = O, N.taps = 0) : (N.touch0 = O, S = !0, N.taps = 1 + !!c);
      c && (c = clearTimeout(c)), S && (N.taps < 2 && (f = O[0], c = setTimeout(function() {
        c = null;
      }, m)), ji(this), N.start());
    }
  }
  function B(w, ...$) {
    if (this.__zooming) {
      var k = C(this, $).event(w), L = w.changedTouches, N = L.length, S, z, D, O;
      for (eo(w), S = 0; S < N; ++S)
        z = L[S], D = ht(z, this), k.touch0 && k.touch0[2] === z.identifier ? k.touch0[0] = D : k.touch1 && k.touch1[2] === z.identifier && (k.touch1[0] = D);
      if (z = k.that.__zoom, k.touch1) {
        var U = k.touch0[0], j = k.touch0[1], X = k.touch1[0], G = k.touch1[1], Z = (Z = X[0] - U[0]) * Z + (Z = X[1] - U[1]) * Z, ne = (ne = G[0] - j[0]) * ne + (ne = G[1] - j[1]) * ne;
        z = h(z, Math.sqrt(Z / ne)), D = [(U[0] + X[0]) / 2, (U[1] + X[1]) / 2], O = [(j[0] + G[0]) / 2, (j[1] + G[1]) / 2];
      } else if (k.touch0) D = k.touch0[0], O = k.touch0[1];
      else return;
      k.zoom("touch", n(g(z, D, O), k.extent, l));
    }
  }
  function V(w, ...$) {
    if (this.__zooming) {
      var k = C(this, $).event(w), L = w.changedTouches, N = L.length, S, z;
      for (ks(w), d && clearTimeout(d), d = setTimeout(function() {
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
  return p.wheelDelta = function(w) {
    return arguments.length ? (r = typeof w == "function" ? w : _i(+w), p) : r;
  }, p.filter = function(w) {
    return arguments.length ? (e = typeof w == "function" ? w : _i(!!w), p) : e;
  }, p.touchable = function(w) {
    return arguments.length ? (o = typeof w == "function" ? w : _i(!!w), p) : o;
  }, p.extent = function(w) {
    return arguments.length ? (t = typeof w == "function" ? w : _i([[+w[0][0], +w[0][1]], [+w[1][0], +w[1][1]]]), p) : t;
  }, p.scaleExtent = function(w) {
    return arguments.length ? (i[0] = +w[0], i[1] = +w[1], p) : [i[0], i[1]];
  }, p.translateExtent = function(w) {
    return arguments.length ? (l[0][0] = +w[0][0], l[1][0] = +w[1][0], l[0][1] = +w[0][1], l[1][1] = +w[1][1], p) : [[l[0][0], l[0][1]], [l[1][0], l[1][1]]];
  }, p.constrain = function(w) {
    return arguments.length ? (n = w, p) : n;
  }, p.duration = function(w) {
    return arguments.length ? (s = +w, p) : s;
  }, p.interpolate = function(w) {
    return arguments.length ? (u = w, p) : u;
  }, p.on = function() {
    var w = a.on.apply(a, arguments);
    return w === a ? p : w;
  }, p.clickDistance = function(w) {
    return arguments.length ? (y = (w = +w) * w, p) : Math.sqrt(y);
  }, p.tapDistance = function(w) {
    return arguments.length ? (_ = +w, p) : _;
  }, p;
}
const jl = T.createContext(null), eS = jl.Provider, Xt = {
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
}, bh = Xt.error001();
function le(e, t) {
  const n = T.useContext(jl);
  if (n === null)
    throw new Error(bh);
  return kh(n, e, t);
}
const Se = () => {
  const e = T.useContext(jl);
  if (e === null)
    throw new Error(bh);
  return T.useMemo(() => ({
    getState: e.getState,
    setState: e.setState,
    subscribe: e.subscribe,
    destroy: e.destroy
  }), [e]);
}, tS = (e) => e.userSelectionActive ? "none" : "all";
function Ba({ position: e, children: t, className: n, style: r, ...o }) {
  const i = le(tS), l = `${e}`.split("-");
  return R.createElement("div", { className: Te(["react-flow__panel", n, ...l]), style: { ...r, pointerEvents: i }, ...o }, t);
}
function nS({ proOptions: e, position: t = "bottom-right" }) {
  return e != null && e.hideAttribution ? null : R.createElement(
    Ba,
    { position: t, className: "react-flow__attribution", "data-message": "Please only hide this attribution when you are subscribed to React Flow Pro: https://reactflow.dev/pro" },
    R.createElement("a", { href: "https://reactflow.dev", target: "_blank", rel: "noopener noreferrer", "aria-label": "React Flow attribution" }, "React Flow")
  );
}
const rS = ({ x: e, y: t, label: n, labelStyle: r = {}, labelShowBg: o = !0, labelBgStyle: i = {}, labelBgPadding: l = [2, 4], labelBgBorderRadius: s = 2, children: u, className: a, ...c }) => {
  const f = T.useRef(null), [d, m] = T.useState({ x: 0, y: 0, width: 0, height: 0 }), x = Te(["react-flow__edge-textwrapper", a]);
  return T.useEffect(() => {
    if (f.current) {
      const y = f.current.getBBox();
      m({
        x: y.x,
        y: y.y,
        width: y.width,
        height: y.height
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
var oS = T.memo(rS);
const ja = (e) => ({
  width: e.offsetWidth,
  height: e.offsetHeight
}), Lr = (e, t = 0, n = 1) => Math.min(Math.max(e, t), n), Ua = (e = { x: 0, y: 0 }, t) => ({
  x: Lr(e.x, t[0][0], t[1][0]),
  y: Lr(e.y, t[0][1], t[1][1])
}), Rf = (e, t, n) => e < t ? Lr(Math.abs(e - t), 1, 50) / 50 : e > n ? -Lr(Math.abs(e - n), 1, 50) / 50 : 0, em = (e, t) => {
  const n = Rf(e.x, 35, t.width - 35) * 20, r = Rf(e.y, 35, t.height - 35) * 20;
  return [n, r];
}, tm = (e) => {
  var t;
  return ((t = e.getRootNode) == null ? void 0 : t.call(e)) || (window == null ? void 0 : window.document);
}, nm = (e, t) => ({
  x: Math.min(e.x, t.x),
  y: Math.min(e.y, t.y),
  x2: Math.max(e.x2, t.x2),
  y2: Math.max(e.y2, t.y2)
}), Uo = ({ x: e, y: t, width: n, height: r }) => ({
  x: e,
  y: t,
  x2: e + n,
  y2: t + r
}), rm = ({ x: e, y: t, x2: n, y2: r }) => ({
  x: e,
  y: t,
  width: n - e,
  height: r - t
}), Af = (e) => ({
  ...e.positionAbsolute || { x: 0, y: 0 },
  width: e.width || 0,
  height: e.height || 0
}), iS = (e, t) => rm(nm(Uo(e), Uo(t))), Ru = (e, t) => {
  const n = Math.max(0, Math.min(e.x + e.width, t.x + t.width) - Math.max(e.x, t.x)), r = Math.max(0, Math.min(e.y + e.height, t.y + t.height) - Math.max(e.y, t.y));
  return Math.ceil(n * r);
}, lS = (e) => lt(e.width) && lt(e.height) && lt(e.x) && lt(e.y), lt = (e) => !isNaN(e) && isFinite(e), he = Symbol.for("internals"), om = ["Enter", " ", "Escape"], sS = (e, t) => {
}, uS = (e) => "nativeEvent" in e;
function Au(e) {
  var o, i;
  const t = uS(e) ? e.nativeEvent : e, n = ((i = (o = t.composedPath) == null ? void 0 : o.call(t)) == null ? void 0 : i[0]) || e.target;
  return ["INPUT", "SELECT", "TEXTAREA"].includes(n == null ? void 0 : n.nodeName) || (n == null ? void 0 : n.hasAttribute("contenteditable")) || !!(n != null && n.closest(".nokey"));
}
const im = (e) => "clientX" in e, mn = (e, t) => {
  var i, l;
  const n = im(e), r = n ? e.clientX : (i = e.touches) == null ? void 0 : i[0].clientX, o = n ? e.clientY : (l = e.touches) == null ? void 0 : l[0].clientY;
  return {
    x: r - ((t == null ? void 0 : t.left) ?? 0),
    y: o - ((t == null ? void 0 : t.top) ?? 0)
  };
}, wl = () => {
  var e;
  return typeof navigator < "u" && ((e = navigator == null ? void 0 : navigator.userAgent) == null ? void 0 : e.indexOf("Mac")) >= 0;
}, ei = ({ id: e, path: t, labelX: n, labelY: r, label: o, labelStyle: i, labelShowBg: l, labelBgStyle: s, labelBgPadding: u, labelBgBorderRadius: a, style: c, markerEnd: f, markerStart: d, interactionWidth: m = 20 }) => R.createElement(
  R.Fragment,
  null,
  R.createElement("path", { id: e, style: c, d: t, fill: "none", className: "react-flow__edge-path", markerEnd: f, markerStart: d }),
  m && R.createElement("path", { d: t, fill: "none", strokeOpacity: 0, strokeWidth: m, className: "react-flow__edge-interaction" }),
  o && lt(n) && lt(r) ? R.createElement(oS, { x: n, y: r, label: o, labelStyle: i, labelShowBg: l, labelBgStyle: s, labelBgPadding: u, labelBgBorderRadius: a }) : null
);
ei.displayName = "BaseEdge";
function to(e, t, n) {
  return n === void 0 ? n : (r) => {
    const o = t().edges.find((i) => i.id === e);
    o && n(r, { ...o });
  };
}
function lm({ sourceX: e, sourceY: t, targetX: n, targetY: r }) {
  const o = Math.abs(n - e) / 2, i = n < e ? n + o : n - o, l = Math.abs(r - t) / 2, s = r < t ? r + l : r - l;
  return [i, s, o, l];
}
function sm({ sourceX: e, sourceY: t, targetX: n, targetY: r, sourceControlX: o, sourceControlY: i, targetControlX: l, targetControlY: s }) {
  const u = e * 0.125 + o * 0.375 + l * 0.375 + n * 0.125, a = t * 0.125 + i * 0.375 + s * 0.375 + r * 0.125, c = Math.abs(u - e), f = Math.abs(a - t);
  return [u, a, c, f];
}
var Yn;
(function(e) {
  e.Strict = "strict", e.Loose = "loose";
})(Yn || (Yn = {}));
var In;
(function(e) {
  e.Free = "free", e.Vertical = "vertical", e.Horizontal = "horizontal";
})(In || (In = {}));
var Wo;
(function(e) {
  e.Partial = "partial", e.Full = "full";
})(Wo || (Wo = {}));
var rn;
(function(e) {
  e.Bezier = "default", e.Straight = "straight", e.Step = "step", e.SmoothStep = "smoothstep", e.SimpleBezier = "simplebezier";
})(rn || (rn = {}));
var Yo;
(function(e) {
  e.Arrow = "arrow", e.ArrowClosed = "arrowclosed";
})(Yo || (Yo = {}));
var Q;
(function(e) {
  e.Left = "left", e.Top = "top", e.Right = "right", e.Bottom = "bottom";
})(Q || (Q = {}));
function If({ pos: e, x1: t, y1: n, x2: r, y2: o }) {
  return e === Q.Left || e === Q.Right ? [0.5 * (t + r), n] : [t, 0.5 * (n + o)];
}
function um({ sourceX: e, sourceY: t, sourcePosition: n = Q.Bottom, targetX: r, targetY: o, targetPosition: i = Q.Top }) {
  const [l, s] = If({
    pos: n,
    x1: e,
    y1: t,
    x2: r,
    y2: o
  }), [u, a] = If({
    pos: i,
    x1: r,
    y1: o,
    x2: e,
    y2: t
  }), [c, f, d, m] = sm({
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
const Wa = T.memo(({ sourceX: e, sourceY: t, targetX: n, targetY: r, sourcePosition: o = Q.Bottom, targetPosition: i = Q.Top, label: l, labelStyle: s, labelShowBg: u, labelBgStyle: a, labelBgPadding: c, labelBgBorderRadius: f, style: d, markerEnd: m, markerStart: x, interactionWidth: y }) => {
  const [_, p, h] = um({
    sourceX: e,
    sourceY: t,
    sourcePosition: o,
    targetX: n,
    targetY: r,
    targetPosition: i
  });
  return R.createElement(ei, { path: _, labelX: p, labelY: h, label: l, labelStyle: s, labelShowBg: u, labelBgStyle: a, labelBgPadding: c, labelBgBorderRadius: f, style: d, markerEnd: m, markerStart: x, interactionWidth: y });
});
Wa.displayName = "SimpleBezierEdge";
const Df = {
  [Q.Left]: { x: -1, y: 0 },
  [Q.Right]: { x: 1, y: 0 },
  [Q.Top]: { x: 0, y: -1 },
  [Q.Bottom]: { x: 0, y: 1 }
}, aS = ({ source: e, sourcePosition: t = Q.Bottom, target: n }) => t === Q.Left || t === Q.Right ? e.x < n.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : e.y < n.y ? { x: 0, y: 1 } : { x: 0, y: -1 }, Lf = (e, t) => Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2));
function cS({ source: e, sourcePosition: t = Q.Bottom, target: n, targetPosition: r = Q.Top, center: o, offset: i }) {
  const l = Df[t], s = Df[r], u = { x: e.x + l.x * i, y: e.y + l.y * i }, a = { x: n.x + s.x * i, y: n.y + s.y * i }, c = aS({
    source: u,
    sourcePosition: t,
    target: a
  }), f = c.x !== 0 ? "x" : "y", d = c[f];
  let m = [], x, y;
  const _ = { x: 0, y: 0 }, p = { x: 0, y: 0 }, [h, g, v, E] = lm({
    sourceX: e.x,
    sourceY: e.y,
    targetX: n.x,
    targetY: n.y
  });
  if (l[f] * s[f] === -1) {
    x = o.x ?? h, y = o.y ?? g;
    const M = [
      { x, y: u.y },
      { x, y: a.y }
    ], P = [
      { x: u.x, y },
      { x: a.x, y }
    ];
    l[f] === d ? m = f === "x" ? M : P : m = f === "x" ? P : M;
  } else {
    const M = [{ x: u.x, y: a.y }], P = [{ x: a.x, y: u.y }];
    if (f === "x" ? m = l.x === d ? P : M : m = l.y === d ? M : P, t === r) {
      const V = Math.abs(e[f] - n[f]);
      if (V <= i) {
        const w = Math.min(i - 1, i - V);
        l[f] === d ? _[f] = (u[f] > e[f] ? -1 : 1) * w : p[f] = (a[f] > n[f] ? -1 : 1) * w;
      }
    }
    if (t !== r) {
      const V = f === "x" ? "y" : "x", w = l[f] === s[V], $ = u[V] > a[V], k = u[V] < a[V];
      (l[f] === 1 && (!w && $ || w && k) || l[f] !== 1 && (!w && k || w && $)) && (m = f === "x" ? M : P);
    }
    const A = { x: u.x + _.x, y: u.y + _.y }, I = { x: a.x + p.x, y: a.y + p.y }, F = Math.max(Math.abs(A.x - m[0].x), Math.abs(I.x - m[0].x)), B = Math.max(Math.abs(A.y - m[0].y), Math.abs(I.y - m[0].y));
    F >= B ? (x = (A.x + I.x) / 2, y = m[0].y) : (x = m[0].x, y = (A.y + I.y) / 2);
  }
  return [[
    e,
    { x: u.x + _.x, y: u.y + _.y },
    ...m,
    { x: a.x + p.x, y: a.y + p.y },
    n
  ], x, y, v, E];
}
function fS(e, t, n, r) {
  const o = Math.min(Lf(e, t) / 2, Lf(t, n) / 2, r), { x: i, y: l } = t;
  if (e.x === i && i === n.x || e.y === l && l === n.y)
    return `L${i} ${l}`;
  if (e.y === l) {
    const a = e.x < n.x ? -1 : 1, c = e.y < n.y ? 1 : -1;
    return `L ${i + o * a},${l}Q ${i},${l} ${i},${l + o * c}`;
  }
  const s = e.x < n.x ? 1 : -1, u = e.y < n.y ? -1 : 1;
  return `L ${i},${l + o * u}Q ${i},${l} ${i + o * s},${l}`;
}
function Iu({ sourceX: e, sourceY: t, sourcePosition: n = Q.Bottom, targetX: r, targetY: o, targetPosition: i = Q.Top, borderRadius: l = 5, centerX: s, centerY: u, offset: a = 20 }) {
  const [c, f, d, m, x] = cS({
    source: { x: e, y: t },
    sourcePosition: n,
    target: { x: r, y: o },
    targetPosition: i,
    center: { x: s, y: u },
    offset: a
  });
  return [c.reduce((_, p, h) => {
    let g = "";
    return h > 0 && h < c.length - 1 ? g = fS(c[h - 1], p, c[h + 1], l) : g = `${h === 0 ? "M" : "L"}${p.x} ${p.y}`, _ += g, _;
  }, ""), f, d, m, x];
}
const Ul = T.memo(({ sourceX: e, sourceY: t, targetX: n, targetY: r, label: o, labelStyle: i, labelShowBg: l, labelBgStyle: s, labelBgPadding: u, labelBgBorderRadius: a, style: c, sourcePosition: f = Q.Bottom, targetPosition: d = Q.Top, markerEnd: m, markerStart: x, pathOptions: y, interactionWidth: _ }) => {
  const [p, h, g] = Iu({
    sourceX: e,
    sourceY: t,
    sourcePosition: f,
    targetX: n,
    targetY: r,
    targetPosition: d,
    borderRadius: y == null ? void 0 : y.borderRadius,
    offset: y == null ? void 0 : y.offset
  });
  return R.createElement(ei, { path: p, labelX: h, labelY: g, label: o, labelStyle: i, labelShowBg: l, labelBgStyle: s, labelBgPadding: u, labelBgBorderRadius: a, style: c, markerEnd: m, markerStart: x, interactionWidth: _ });
});
Ul.displayName = "SmoothStepEdge";
const Ya = T.memo((e) => {
  var t;
  return R.createElement(Ul, { ...e, pathOptions: T.useMemo(() => {
    var n;
    return { borderRadius: 0, offset: (n = e.pathOptions) == null ? void 0 : n.offset };
  }, [(t = e.pathOptions) == null ? void 0 : t.offset]) });
});
Ya.displayName = "StepEdge";
function dS({ sourceX: e, sourceY: t, targetX: n, targetY: r }) {
  const [o, i, l, s] = lm({
    sourceX: e,
    sourceY: t,
    targetX: n,
    targetY: r
  });
  return [`M ${e},${t}L ${n},${r}`, o, i, l, s];
}
const Xa = T.memo(({ sourceX: e, sourceY: t, targetX: n, targetY: r, label: o, labelStyle: i, labelShowBg: l, labelBgStyle: s, labelBgPadding: u, labelBgBorderRadius: a, style: c, markerEnd: f, markerStart: d, interactionWidth: m }) => {
  const [x, y, _] = dS({ sourceX: e, sourceY: t, targetX: n, targetY: r });
  return R.createElement(ei, { path: x, labelX: y, labelY: _, label: o, labelStyle: i, labelShowBg: l, labelBgStyle: s, labelBgPadding: u, labelBgBorderRadius: a, style: c, markerEnd: f, markerStart: d, interactionWidth: m });
});
Xa.displayName = "StraightEdge";
function Ei(e, t) {
  return e >= 0 ? 0.5 * e : t * 25 * Math.sqrt(-e);
}
function Of({ pos: e, x1: t, y1: n, x2: r, y2: o, c: i }) {
  switch (e) {
    case Q.Left:
      return [t - Ei(t - r, i), n];
    case Q.Right:
      return [t + Ei(r - t, i), n];
    case Q.Top:
      return [t, n - Ei(n - o, i)];
    case Q.Bottom:
      return [t, n + Ei(o - n, i)];
  }
}
function am({ sourceX: e, sourceY: t, sourcePosition: n = Q.Bottom, targetX: r, targetY: o, targetPosition: i = Q.Top, curvature: l = 0.25 }) {
  const [s, u] = Of({
    pos: n,
    x1: e,
    y1: t,
    x2: r,
    y2: o,
    c: l
  }), [a, c] = Of({
    pos: i,
    x1: r,
    y1: o,
    x2: e,
    y2: t,
    c: l
  }), [f, d, m, x] = sm({
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
const xl = T.memo(({ sourceX: e, sourceY: t, targetX: n, targetY: r, sourcePosition: o = Q.Bottom, targetPosition: i = Q.Top, label: l, labelStyle: s, labelShowBg: u, labelBgStyle: a, labelBgPadding: c, labelBgBorderRadius: f, style: d, markerEnd: m, markerStart: x, pathOptions: y, interactionWidth: _ }) => {
  const [p, h, g] = am({
    sourceX: e,
    sourceY: t,
    sourcePosition: o,
    targetX: n,
    targetY: r,
    targetPosition: i,
    curvature: y == null ? void 0 : y.curvature
  });
  return R.createElement(ei, { path: p, labelX: h, labelY: g, label: l, labelStyle: s, labelShowBg: u, labelBgStyle: a, labelBgPadding: c, labelBgBorderRadius: f, style: d, markerEnd: m, markerStart: x, interactionWidth: _ });
});
xl.displayName = "BezierEdge";
const Qa = T.createContext(null), pS = Qa.Provider;
Qa.Consumer;
const hS = () => T.useContext(Qa), mS = (e) => "id" in e && "source" in e && "target" in e, gS = ({ source: e, sourceHandle: t, target: n, targetHandle: r }) => `reactflow__edge-${e}${t || ""}-${n}${r || ""}`, Du = (e, t) => typeof e > "u" ? "" : typeof e == "string" ? e : `${t ? `${t}__` : ""}${Object.keys(e).sort().map((r) => `${r}=${e[r]}`).join("&")}`, yS = (e, t) => t.some((n) => n.source === e.source && n.target === e.target && (n.sourceHandle === e.sourceHandle || !n.sourceHandle && !e.sourceHandle) && (n.targetHandle === e.targetHandle || !n.targetHandle && !e.targetHandle)), vS = (e, t) => {
  if (!e.source || !e.target)
    return t;
  let n;
  return mS(e) ? n = { ...e } : n = {
    ...e,
    id: gS(e)
  }, yS(n, t) ? t : t.concat(n);
}, Lu = ({ x: e, y: t }, [n, r, o], i, [l, s]) => {
  const u = {
    x: (e - n) / o,
    y: (t - r) / o
  };
  return i ? {
    x: l * Math.round(u.x / l),
    y: s * Math.round(u.y / s)
  } : u;
}, cm = ({ x: e, y: t }, [n, r, o]) => ({
  x: e * o + n,
  y: t * o + r
}), Fn = (e, t = [0, 0]) => {
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
}, Wl = (e, t = [0, 0]) => {
  if (e.length === 0)
    return { x: 0, y: 0, width: 0, height: 0 };
  const n = e.reduce((r, o) => {
    const { x: i, y: l } = Fn(o, t).positionAbsolute;
    return nm(r, Uo({
      x: i,
      y: l,
      width: o.width || 0,
      height: o.height || 0
    }));
  }, { x: 1 / 0, y: 1 / 0, x2: -1 / 0, y2: -1 / 0 });
  return rm(n);
}, fm = (e, t, [n, r, o] = [0, 0, 1], i = !1, l = !1, s = [0, 0]) => {
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
    const { positionAbsolute: y } = Fn(c, s), _ = {
      x: y.x,
      y: y.y,
      width: f || 0,
      height: d || 0
    }, p = Ru(u, _), h = typeof f > "u" || typeof d > "u" || f === null || d === null, g = i && p > 0, v = (f || 0) * (d || 0);
    (h || g || p >= v || c.dragging) && a.push(c);
  }), a;
}, dm = (e, t) => {
  const n = e.map((r) => r.id);
  return t.filter((r) => n.includes(r.source) || n.includes(r.target));
}, pm = (e, t, n, r, o, i = 0.1) => {
  const l = t / (e.width * (1 + i)), s = n / (e.height * (1 + i)), u = Math.min(l, s), a = Lr(u, r, o), c = e.x + e.width / 2, f = e.y + e.height / 2, d = t / 2 - c * a, m = n / 2 - f * a;
  return { x: d, y: m, zoom: a };
}, Tn = (e, t = 0) => e.transition().duration(t);
function Ff(e, t, n, r) {
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
function wS(e, t, n, r, o, i) {
  const { x: l, y: s } = mn(e), a = t.elementsFromPoint(l, s).find((x) => x.classList.contains("react-flow__handle"));
  if (a) {
    const x = a.getAttribute("data-nodeid");
    if (x) {
      const y = Ka(void 0, a), _ = a.getAttribute("data-handleid"), p = i({ nodeId: x, id: _, type: y });
      if (p) {
        const h = o.find((g) => g.nodeId === x && g.type === y && g.id === _);
        return {
          handle: {
            id: _,
            type: y,
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
    const y = Math.sqrt((x.x - n.x) ** 2 + (x.y - n.y) ** 2);
    if (y <= r) {
      const _ = i(x);
      y <= f && (y < f ? c = [{ handle: x, validHandleResult: _ }] : y === f && c.push({
        handle: x,
        validHandleResult: _
      }), f = y);
    }
  }), !c.length)
    return { handle: null, validHandleResult: hm() };
  if (c.length === 1)
    return c[0];
  const d = c.some(({ validHandleResult: x }) => x.isValid), m = c.some(({ handle: x }) => x.type === "target");
  return c.find(({ handle: x, validHandleResult: y }) => m ? x.type === "target" : d ? y.isValid : !0) || c[0];
}
const xS = { source: null, target: null, sourceHandle: null, targetHandle: null }, hm = () => ({
  handleDomNode: null,
  isValid: !1,
  connection: xS,
  endHandle: null
});
function mm(e, t, n, r, o, i, l) {
  const s = o === "target", u = l.querySelector(`.react-flow__handle[data-id="${e == null ? void 0 : e.nodeId}-${e == null ? void 0 : e.id}-${e == null ? void 0 : e.type}"]`), a = {
    ...hm(),
    handleDomNode: u
  };
  if (u) {
    const c = Ka(void 0, u), f = u.getAttribute("data-nodeid"), d = u.getAttribute("data-handleid"), m = u.classList.contains("connectable"), x = u.classList.contains("connectableend"), y = {
      source: s ? f : n,
      sourceHandle: s ? d : r,
      target: s ? n : f,
      targetHandle: s ? r : d
    };
    a.connection = y, m && x && (t === Yn.Strict ? s && c === "source" || !s && c === "target" : f !== n || d !== r) && (a.endHandle = {
      nodeId: f,
      handleId: d,
      type: c
    }, a.isValid = i(y));
  }
  return a;
}
function SS({ nodes: e, nodeId: t, handleId: n, handleType: r }) {
  return e.reduce((o, i) => {
    if (i[he]) {
      const { handleBounds: l } = i[he];
      let s = [], u = [];
      l && (s = Ff(i, l, "source", `${t}-${n}-${r}`), u = Ff(i, l, "target", `${t}-${n}-${r}`)), o.push(...s, ...u);
    }
    return o;
  }, []);
}
function Ka(e, t) {
  return e || (t != null && t.classList.contains("target") ? "target" : t != null && t.classList.contains("source") ? "source" : null);
}
function Ns(e) {
  e == null || e.classList.remove("valid", "connecting", "react-flow__handle-valid", "react-flow__handle-connecting");
}
function _S(e, t) {
  let n = null;
  return t ? n = "valid" : e && !t && (n = "invalid"), n;
}
function gm({ event: e, handleId: t, nodeId: n, onConnect: r, isTarget: o, getState: i, setState: l, isValidConnection: s, edgeUpdaterType: u, onReconnectEnd: a }) {
  const c = tm(e.target), { connectionMode: f, domNode: d, autoPanOnConnect: m, connectionRadius: x, onConnectStart: y, panBy: _, getNodes: p, cancelConnection: h } = i();
  let g = 0, v;
  const { x: E, y: C } = mn(e), M = c == null ? void 0 : c.elementFromPoint(E, C), P = Ka(u, M), A = d == null ? void 0 : d.getBoundingClientRect();
  if (!A || !P)
    return;
  let I, F = mn(e, A), B = !1, V = null, w = !1, $ = null;
  const k = SS({
    nodes: p(),
    nodeId: n,
    handleId: t,
    handleType: P
  }), L = () => {
    if (!m)
      return;
    const [z, D] = em(F, A);
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
  }), y == null || y(e, { nodeId: n, handleId: t, handleType: P });
  function N(z) {
    const { transform: D } = i();
    F = mn(z, A);
    const { handle: O, validHandleResult: U } = wS(z, c, Lu(F, D, !1, [1, 1]), x, k, (j) => mm(j, f, n, t, o ? "target" : "source", s, c));
    if (v = O, B || (L(), B = !0), $ = U.handleDomNode, V = U.connection, w = U.isValid, l({
      connectionPosition: v && w ? cm({
        x: v.x,
        y: v.y
      }, D) : F,
      connectionStatus: _S(!!v, w),
      connectionEndHandle: U.endHandle
    }), !v && !w && !$)
      return Ns(I);
    V.source !== V.target && $ && (Ns(I), I = $, $.classList.add("connecting", "react-flow__handle-connecting"), $.classList.toggle("valid", w), $.classList.toggle("react-flow__handle-valid", w));
  }
  function S(z) {
    var D, O;
    (v || $) && V && w && (r == null || r(V)), (O = (D = i()).onConnectEnd) == null || O.call(D, z), u && (a == null || a(z)), Ns(I), h(), cancelAnimationFrame(g), B = !1, w = !1, V = null, $ = null, c.removeEventListener("mousemove", N), c.removeEventListener("mouseup", S), c.removeEventListener("touchmove", N), c.removeEventListener("touchend", S);
  }
  c.addEventListener("mousemove", N), c.addEventListener("mouseup", S), c.addEventListener("touchmove", N), c.addEventListener("touchend", S);
}
const Hf = () => !0, ES = (e) => ({
  connectionStartHandle: e.connectionStartHandle,
  connectOnClick: e.connectOnClick,
  noPanClassName: e.noPanClassName
}), kS = (e, t, n) => (r) => {
  const { connectionStartHandle: o, connectionEndHandle: i, connectionClickStartHandle: l } = r;
  return {
    connecting: (o == null ? void 0 : o.nodeId) === e && (o == null ? void 0 : o.handleId) === t && (o == null ? void 0 : o.type) === n || (i == null ? void 0 : i.nodeId) === e && (i == null ? void 0 : i.handleId) === t && (i == null ? void 0 : i.type) === n,
    clickConnecting: (l == null ? void 0 : l.nodeId) === e && (l == null ? void 0 : l.handleId) === t && (l == null ? void 0 : l.type) === n
  };
}, ym = T.forwardRef(({ type: e = "source", position: t = Q.Top, isValidConnection: n, isConnectable: r = !0, isConnectableStart: o = !0, isConnectableEnd: i = !0, id: l, onConnect: s, children: u, className: a, onMouseDown: c, onTouchStart: f, ...d }, m) => {
  var A, I;
  const x = l || null, y = e === "target", _ = Se(), p = hS(), { connectOnClick: h, noPanClassName: g } = le(ES, ke), { connecting: v, clickConnecting: E } = le(kS(p, x, e), ke);
  p || (I = (A = _.getState()).onError) == null || I.call(A, "010", Xt.error010());
  const C = (F) => {
    const { defaultEdgeOptions: B, onConnect: V, hasDefaultEdges: w } = _.getState(), $ = {
      ...B,
      ...F
    };
    if (w) {
      const { edges: k, setEdges: L } = _.getState();
      L(vS($, k));
    }
    V == null || V($), s == null || s($);
  }, M = (F) => {
    if (!p)
      return;
    const B = im(F);
    o && (B && F.button === 0 || !B) && gm({
      event: F,
      handleId: x,
      nodeId: p,
      onConnect: C,
      isTarget: y,
      getState: _.getState,
      setState: _.setState,
      isValidConnection: n || _.getState().isValidConnection || Hf
    }), B ? c == null || c(F) : f == null || f(F);
  }, P = (F) => {
    const { onClickConnectStart: B, onClickConnectEnd: V, connectionClickStartHandle: w, connectionMode: $, isValidConnection: k } = _.getState();
    if (!p || !w && !o)
      return;
    if (!w) {
      B == null || B(F, { nodeId: p, handleId: x, handleType: e }), _.setState({ connectionClickStartHandle: { nodeId: p, type: e, handleId: x } });
      return;
    }
    const L = tm(F.target), N = n || k || Hf, { connection: S, isValid: z } = mm({
      nodeId: p,
      id: x,
      type: e
    }, $, w.nodeId, w.handleId || null, w.type, N, L);
    z && C(S), V == null || V(F), _.setState({ connectionClickStartHandle: null });
  };
  return R.createElement("div", { "data-handleid": x, "data-nodeid": p, "data-handlepos": t, "data-id": `${p}-${x}-${e}`, className: Te([
    "react-flow__handle",
    `react-flow__handle-${t}`,
    "nodrag",
    g,
    a,
    {
      source: !y,
      target: y,
      connectable: r,
      connectablestart: o,
      connectableend: i,
      connecting: E,
      // this class is used to style the handle when the user is connecting
      connectionindicator: r && (o && !v || i && v)
    }
  ]), onMouseDown: M, onTouchStart: M, onClick: h ? P : void 0, ref: m, ...d }, u);
});
ym.displayName = "Handle";
var Or = T.memo(ym);
const vm = ({ data: e, isConnectable: t, targetPosition: n = Q.Top, sourcePosition: r = Q.Bottom }) => R.createElement(
  R.Fragment,
  null,
  R.createElement(Or, { type: "target", position: n, isConnectable: t }),
  e == null ? void 0 : e.label,
  R.createElement(Or, { type: "source", position: r, isConnectable: t })
);
vm.displayName = "DefaultNode";
var Ou = T.memo(vm);
const wm = ({ data: e, isConnectable: t, sourcePosition: n = Q.Bottom }) => R.createElement(
  R.Fragment,
  null,
  e == null ? void 0 : e.label,
  R.createElement(Or, { type: "source", position: n, isConnectable: t })
);
wm.displayName = "InputNode";
var xm = T.memo(wm);
const Sm = ({ data: e, isConnectable: t, targetPosition: n = Q.Top }) => R.createElement(
  R.Fragment,
  null,
  R.createElement(Or, { type: "target", position: n, isConnectable: t }),
  e == null ? void 0 : e.label
);
Sm.displayName = "OutputNode";
var _m = T.memo(Sm);
const Ga = () => null;
Ga.displayName = "GroupNode";
const NS = (e) => ({
  selectedNodes: e.getNodes().filter((t) => t.selected),
  selectedEdges: e.edges.filter((t) => t.selected).map((t) => ({ ...t }))
}), ki = (e) => e.id;
function CS(e, t) {
  return ke(e.selectedNodes.map(ki), t.selectedNodes.map(ki)) && ke(e.selectedEdges.map(ki), t.selectedEdges.map(ki));
}
const Em = T.memo(({ onSelectionChange: e }) => {
  const t = Se(), { selectedNodes: n, selectedEdges: r } = le(NS, CS);
  return T.useEffect(() => {
    const o = { nodes: n, edges: r };
    e == null || e(o), t.getState().onSelectionChange.forEach((i) => i(o));
  }, [n, r, e]), null;
});
Em.displayName = "SelectionListener";
const MS = (e) => !!e.onSelectionChange;
function zS({ onSelectionChange: e }) {
  const t = le(MS);
  return e || t ? R.createElement(Em, { onSelectionChange: e }) : null;
}
const TS = (e) => ({
  setNodes: e.setNodes,
  setEdges: e.setEdges,
  setDefaultNodesAndEdges: e.setDefaultNodesAndEdges,
  setMinZoom: e.setMinZoom,
  setMaxZoom: e.setMaxZoom,
  setTranslateExtent: e.setTranslateExtent,
  setNodeExtent: e.setNodeExtent,
  reset: e.reset
});
function er(e, t) {
  T.useEffect(() => {
    typeof e < "u" && t(e);
  }, [e]);
}
function q(e, t, n) {
  T.useEffect(() => {
    typeof t < "u" && n({ [e]: t });
  }, [t]);
}
const PS = ({ nodes: e, edges: t, defaultNodes: n, defaultEdges: r, onConnect: o, onConnectStart: i, onConnectEnd: l, onClickConnectStart: s, onClickConnectEnd: u, nodesDraggable: a, nodesConnectable: c, nodesFocusable: f, edgesFocusable: d, edgesUpdatable: m, elevateNodesOnSelect: x, minZoom: y, maxZoom: _, nodeExtent: p, onNodesChange: h, onEdgesChange: g, elementsSelectable: v, connectionMode: E, snapGrid: C, snapToGrid: M, translateExtent: P, connectOnClick: A, defaultEdgeOptions: I, fitView: F, fitViewOptions: B, onNodesDelete: V, onEdgesDelete: w, onNodeDrag: $, onNodeDragStart: k, onNodeDragStop: L, onSelectionDrag: N, onSelectionDragStart: S, onSelectionDragStop: z, noPanClassName: D, nodeOrigin: O, rfId: U, autoPanOnConnect: j, autoPanOnNodeDrag: X, onError: G, connectionRadius: Z, isValidConnection: ne, nodeDragThreshold: te }) => {
  const { setNodes: ee, setEdges: Ne, setDefaultNodesAndEdges: ve, setMinZoom: Le, setMaxZoom: Pe, setTranslateExtent: me, setNodeExtent: Ke, reset: oe } = le(TS, ke), K = Se();
  return T.useEffect(() => {
    const Oe = r == null ? void 0 : r.map((Pt) => ({ ...Pt, ...I }));
    return ve(n, Oe), () => {
      oe();
    };
  }, []), q("defaultEdgeOptions", I, K.setState), q("connectionMode", E, K.setState), q("onConnect", o, K.setState), q("onConnectStart", i, K.setState), q("onConnectEnd", l, K.setState), q("onClickConnectStart", s, K.setState), q("onClickConnectEnd", u, K.setState), q("nodesDraggable", a, K.setState), q("nodesConnectable", c, K.setState), q("nodesFocusable", f, K.setState), q("edgesFocusable", d, K.setState), q("edgesUpdatable", m, K.setState), q("elementsSelectable", v, K.setState), q("elevateNodesOnSelect", x, K.setState), q("snapToGrid", M, K.setState), q("snapGrid", C, K.setState), q("onNodesChange", h, K.setState), q("onEdgesChange", g, K.setState), q("connectOnClick", A, K.setState), q("fitViewOnInit", F, K.setState), q("fitViewOnInitOptions", B, K.setState), q("onNodesDelete", V, K.setState), q("onEdgesDelete", w, K.setState), q("onNodeDrag", $, K.setState), q("onNodeDragStart", k, K.setState), q("onNodeDragStop", L, K.setState), q("onSelectionDrag", N, K.setState), q("onSelectionDragStart", S, K.setState), q("onSelectionDragStop", z, K.setState), q("noPanClassName", D, K.setState), q("nodeOrigin", O, K.setState), q("rfId", U, K.setState), q("autoPanOnConnect", j, K.setState), q("autoPanOnNodeDrag", X, K.setState), q("onError", G, K.setState), q("connectionRadius", Z, K.setState), q("isValidConnection", ne, K.setState), q("nodeDragThreshold", te, K.setState), er(e, ee), er(t, Ne), er(y, Le), er(_, Pe), er(P, me), er(p, Ke), null;
}, Vf = { display: "none" }, $S = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  border: 0,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0px, 0px, 0px, 0px)",
  clipPath: "inset(100%)"
}, km = "react-flow__node-desc", Nm = "react-flow__edge-desc", RS = "react-flow__aria-live", AS = (e) => e.ariaLiveMessage;
function IS({ rfId: e }) {
  const t = le(AS);
  return R.createElement("div", { id: `${RS}-${e}`, "aria-live": "assertive", "aria-atomic": "true", style: $S }, t);
}
function DS({ rfId: e, disableKeyboardA11y: t }) {
  return R.createElement(
    R.Fragment,
    null,
    R.createElement(
      "div",
      { id: `${km}-${e}`, style: Vf },
      "Press enter or space to select a node.",
      !t && "You can then use the arrow keys to move the node around.",
      " Press delete to remove it and escape to cancel.",
      " "
    ),
    R.createElement("div", { id: `${Nm}-${e}`, style: Vf }, "Press enter or space to select an edge. You can then press delete to remove it or escape to cancel."),
    !t && R.createElement(IS, { rfId: e })
  );
}
var Xo = (e = null, t = { actInsideInputWithModifier: !0 }) => {
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
        if (o.current = m.ctrlKey || m.metaKey || m.shiftKey, (!o.current || o.current && !t.actInsideInputWithModifier) && Au(m))
          return !1;
        const y = jf(m.code, s);
        i.current.add(m[y]), Bf(l, i.current, !1) && (m.preventDefault(), r(!0));
      }, f = (m) => {
        if ((!o.current || o.current && !t.actInsideInputWithModifier) && Au(m))
          return !1;
        const y = jf(m.code, s);
        Bf(l, i.current, !0) ? (r(!1), i.current.clear()) : i.current.delete(m[y]), m.key === "Meta" && i.current.clear(), o.current = !1;
      }, d = () => {
        i.current.clear(), r(!1);
      };
      return a == null || a.addEventListener("keydown", c), a == null || a.addEventListener("keyup", f), window.addEventListener("blur", d), () => {
        a == null || a.removeEventListener("keydown", c), a == null || a.removeEventListener("keyup", f), window.removeEventListener("blur", d);
      };
    }
  }, [e, r]), n;
};
function Bf(e, t, n) {
  return e.filter((r) => n || r.length === t.size).some((r) => r.every((o) => t.has(o)));
}
function jf(e, t) {
  return t.includes(e) ? "code" : "key";
}
function Cm(e, t, n, r) {
  var s, u;
  const o = e.parentNode || e.parentId;
  if (!o)
    return n;
  const i = t.get(o), l = Fn(i, r);
  return Cm(i, t, {
    x: (n.x ?? 0) + l.x,
    y: (n.y ?? 0) + l.y,
    z: (((s = i[he]) == null ? void 0 : s.z) ?? 0) > (n.z ?? 0) ? ((u = i[he]) == null ? void 0 : u.z) ?? 0 : n.z ?? 0
  }, r);
}
function Mm(e, t, n) {
  e.forEach((r) => {
    var i;
    const o = r.parentNode || r.parentId;
    if (o && !e.has(o))
      throw new Error(`Parent node ${o} not found`);
    if (o || n != null && n[r.id]) {
      const { x: l, y: s, z: u } = Cm(r, e, {
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
function Cs(e, t, n, r) {
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
  }), Mm(o, n, i), o;
}
function zm(e, t = {}) {
  const { getNodes: n, width: r, height: o, minZoom: i, maxZoom: l, d3Zoom: s, d3Selection: u, fitViewOnInitDone: a, fitViewOnInit: c, nodeOrigin: f } = e(), d = t.initial && !a && c;
  if (s && u && (d || !t.initial)) {
    const x = n().filter((_) => {
      var h;
      const p = t.includeHiddenNodes ? _.width && _.height : !_.hidden;
      return (h = t.nodes) != null && h.length ? p && t.nodes.some((g) => g.id === _.id) : p;
    }), y = x.every((_) => _.width && _.height);
    if (x.length > 0 && y) {
      const _ = Wl(x, f), { x: p, y: h, zoom: g } = pm(_, r, o, t.minZoom ?? i, t.maxZoom ?? l, t.padding ?? 0.1), v = Vt.translate(p, h).scale(g);
      return typeof t.duration == "number" && t.duration > 0 ? s.transform(Tn(u, t.duration), v) : s.transform(u, v), !0;
    }
  }
  return !1;
}
function LS(e, t) {
  return e.forEach((n) => {
    const r = t.get(n.id);
    r && t.set(r.id, {
      ...r,
      [he]: r[he],
      selected: n.selected
    });
  }), new Map(t);
}
function OS(e, t) {
  return t.map((n) => {
    const r = e.find((o) => o.id === n.id);
    return r && (n.selected = r.selected), n;
  });
}
function Ni({ changedNodes: e, changedEdges: t, get: n, set: r }) {
  const { nodeInternals: o, edges: i, onNodesChange: l, onEdgesChange: s, hasDefaultNodes: u, hasDefaultEdges: a } = n();
  e != null && e.length && (u && r({ nodeInternals: LS(e, o) }), l == null || l(e)), t != null && t.length && (a && r({ edges: OS(t, i) }), s == null || s(t));
}
const tr = () => {
}, FS = {
  zoomIn: tr,
  zoomOut: tr,
  zoomTo: tr,
  getZoom: () => 1,
  setViewport: tr,
  getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
  fitView: () => !1,
  setCenter: tr,
  fitBounds: tr,
  project: (e) => e,
  screenToFlowPosition: (e) => e,
  flowToScreenPosition: (e) => e,
  viewportInitialized: !1
}, HS = (e) => ({
  d3Zoom: e.d3Zoom,
  d3Selection: e.d3Selection
}), VS = () => {
  const e = Se(), { d3Zoom: t, d3Selection: n } = le(HS, ke);
  return T.useMemo(() => n && t ? {
    zoomIn: (o) => t.scaleBy(Tn(n, o == null ? void 0 : o.duration), 1.2),
    zoomOut: (o) => t.scaleBy(Tn(n, o == null ? void 0 : o.duration), 1 / 1.2),
    zoomTo: (o, i) => t.scaleTo(Tn(n, i == null ? void 0 : i.duration), o),
    getZoom: () => e.getState().transform[2],
    setViewport: (o, i) => {
      const [l, s, u] = e.getState().transform, a = Vt.translate(o.x ?? l, o.y ?? s).scale(o.zoom ?? u);
      t.transform(Tn(n, i == null ? void 0 : i.duration), a);
    },
    getViewport: () => {
      const [o, i, l] = e.getState().transform;
      return { x: o, y: i, zoom: l };
    },
    fitView: (o) => zm(e.getState, o),
    setCenter: (o, i, l) => {
      const { width: s, height: u, maxZoom: a } = e.getState(), c = typeof (l == null ? void 0 : l.zoom) < "u" ? l.zoom : a, f = s / 2 - o * c, d = u / 2 - i * c, m = Vt.translate(f, d).scale(c);
      t.transform(Tn(n, l == null ? void 0 : l.duration), m);
    },
    fitBounds: (o, i) => {
      const { width: l, height: s, minZoom: u, maxZoom: a } = e.getState(), { x: c, y: f, zoom: d } = pm(o, l, s, u, a, (i == null ? void 0 : i.padding) ?? 0.1), m = Vt.translate(c, f).scale(d);
      t.transform(Tn(n, i == null ? void 0 : i.duration), m);
    },
    // @deprecated Use `screenToFlowPosition`.
    project: (o) => {
      const { transform: i, snapToGrid: l, snapGrid: s } = e.getState();
      return console.warn("[DEPRECATED] `project` is deprecated. Instead use `screenToFlowPosition`. There is no need to subtract the react flow bounds anymore! https://reactflow.dev/api-reference/types/react-flow-instance#screen-to-flow-position"), Lu(o, i, l, s);
    },
    screenToFlowPosition: (o) => {
      const { transform: i, snapToGrid: l, snapGrid: s, domNode: u } = e.getState();
      if (!u)
        return o;
      const { x: a, y: c } = u.getBoundingClientRect(), f = {
        x: o.x - a,
        y: o.y - c
      };
      return Lu(f, i, l, s);
    },
    flowToScreenPosition: (o) => {
      const { transform: i, domNode: l } = e.getState();
      if (!l)
        return o;
      const { x: s, y: u } = l.getBoundingClientRect(), a = cm(o, i);
      return {
        x: a.x + s,
        y: a.y + u
      };
    },
    viewportInitialized: !0
  } : FS, [t, n]);
};
function Za() {
  const e = VS(), t = Se(), n = T.useCallback(() => t.getState().getNodes().map((y) => ({ ...y })), []), r = T.useCallback((y) => t.getState().nodeInternals.get(y), []), o = T.useCallback(() => {
    const { edges: y = [] } = t.getState();
    return y.map((_) => ({ ..._ }));
  }, []), i = T.useCallback((y) => {
    const { edges: _ = [] } = t.getState();
    return _.find((p) => p.id === y);
  }, []), l = T.useCallback((y) => {
    const { getNodes: _, setNodes: p, hasDefaultNodes: h, onNodesChange: g } = t.getState(), v = _(), E = typeof y == "function" ? y(v) : y;
    if (h)
      p(E);
    else if (g) {
      const C = E.length === 0 ? v.map((M) => ({ type: "remove", id: M.id })) : E.map((M) => ({ item: M, type: "reset" }));
      g(C);
    }
  }, []), s = T.useCallback((y) => {
    const { edges: _ = [], setEdges: p, hasDefaultEdges: h, onEdgesChange: g } = t.getState(), v = typeof y == "function" ? y(_) : y;
    if (h)
      p(v);
    else if (g) {
      const E = v.length === 0 ? _.map((C) => ({ type: "remove", id: C.id })) : v.map((C) => ({ item: C, type: "reset" }));
      g(E);
    }
  }, []), u = T.useCallback((y) => {
    const _ = Array.isArray(y) ? y : [y], { getNodes: p, setNodes: h, hasDefaultNodes: g, onNodesChange: v } = t.getState();
    if (g) {
      const C = [...p(), ..._];
      h(C);
    } else if (v) {
      const E = _.map((C) => ({ item: C, type: "add" }));
      v(E);
    }
  }, []), a = T.useCallback((y) => {
    const _ = Array.isArray(y) ? y : [y], { edges: p = [], setEdges: h, hasDefaultEdges: g, onEdgesChange: v } = t.getState();
    if (g)
      h([...p, ..._]);
    else if (v) {
      const E = _.map((C) => ({ item: C, type: "add" }));
      v(E);
    }
  }, []), c = T.useCallback(() => {
    const { getNodes: y, edges: _ = [], transform: p } = t.getState(), [h, g, v] = p;
    return {
      nodes: y().map((E) => ({ ...E })),
      edges: _.map((E) => ({ ...E })),
      viewport: {
        x: h,
        y: g,
        zoom: v
      }
    };
  }, []), f = T.useCallback(({ nodes: y, edges: _ }) => {
    const { nodeInternals: p, getNodes: h, edges: g, hasDefaultNodes: v, hasDefaultEdges: E, onNodesDelete: C, onEdgesDelete: M, onNodesChange: P, onEdgesChange: A } = t.getState(), I = (y || []).map(($) => $.id), F = (_ || []).map(($) => $.id), B = h().reduce(($, k) => {
      const L = k.parentNode || k.parentId, N = !I.includes(k.id) && L && $.find((z) => z.id === L);
      return (typeof k.deletable == "boolean" ? k.deletable : !0) && (I.includes(k.id) || N) && $.push(k), $;
    }, []), V = g.filter(($) => typeof $.deletable == "boolean" ? $.deletable : !0), w = V.filter(($) => F.includes($.id));
    if (B || w) {
      const $ = dm(B, V), k = [...w, ...$], L = k.reduce((N, S) => (N.includes(S.id) || N.push(S.id), N), []);
      if ((E || v) && (E && t.setState({
        edges: g.filter((N) => !L.includes(N.id))
      }), v && (B.forEach((N) => {
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
  }, []), d = T.useCallback((y) => {
    const _ = lS(y), p = _ ? null : t.getState().nodeInternals.get(y.id);
    return !_ && !p ? [null, null, _] : [_ ? y : Af(p), p, _];
  }, []), m = T.useCallback((y, _ = !0, p) => {
    const [h, g, v] = d(y);
    return h ? (p || t.getState().getNodes()).filter((E) => {
      if (!v && (E.id === g.id || !E.positionAbsolute))
        return !1;
      const C = Af(E), M = Ru(C, h);
      return _ && M > 0 || M >= h.width * h.height;
    }) : [];
  }, []), x = T.useCallback((y, _, p = !0) => {
    const [h] = d(y);
    if (!h)
      return !1;
    const g = Ru(h, _);
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
const BS = { actInsideInputWithModifier: !1 };
var jS = ({ deleteKeyCode: e, multiSelectionKeyCode: t }) => {
  const n = Se(), { deleteElements: r } = Za(), o = Xo(e, BS), i = Xo(t);
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
      const o = ja(e.current);
      (o.height === 0 || o.width === 0) && ((l = (i = t.getState()).onError) == null || l.call(i, "004", Xt.error004())), t.setState({ width: o.width || 500, height: o.height || 500 });
    };
    return r(), window.addEventListener("resize", r), e.current && (n = new ResizeObserver(() => r()), n.observe(e.current)), () => {
      window.removeEventListener("resize", r), n && e.current && n.unobserve(e.current);
    };
  }, []);
}
const qa = {
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0
}, WS = (e, t) => e.x !== t.x || e.y !== t.y || e.zoom !== t.k, Ci = (e) => ({
  x: e.x,
  y: e.y,
  zoom: e.k
}), nr = (e, t) => e.target.closest(`.${t}`), Uf = (e, t) => t === 2 && Array.isArray(e) && e.includes(2), Wf = (e) => {
  const t = e.ctrlKey && wl() ? 10 : 1;
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * t;
}, YS = (e) => ({
  d3Zoom: e.d3Zoom,
  d3Selection: e.d3Selection,
  d3ZoomHandler: e.d3ZoomHandler,
  userSelectionActive: e.userSelectionActive
}), XS = ({ onMove: e, onMoveStart: t, onMoveEnd: n, onPaneContextMenu: r, zoomOnScroll: o = !0, zoomOnPinch: i = !0, panOnScroll: l = !1, panOnScrollSpeed: s = 0.5, panOnScrollMode: u = In.Free, zoomOnDoubleClick: a = !0, elementsSelectable: c, panOnDrag: f = !0, defaultViewport: d, translateExtent: m, minZoom: x, maxZoom: y, zoomActivationKeyCode: _, preventScrolling: p = !0, children: h, noWheelClassName: g, noPanClassName: v }) => {
  const E = T.useRef(), C = Se(), M = T.useRef(!1), P = T.useRef(!1), A = T.useRef(null), I = T.useRef({ x: 0, y: 0, zoom: 0 }), { d3Zoom: F, d3Selection: B, d3ZoomHandler: V, userSelectionActive: w } = le(YS, ke), $ = Xo(_), k = T.useRef(0), L = T.useRef(!1), N = T.useRef();
  return US(A), T.useEffect(() => {
    if (A.current) {
      const S = A.current.getBoundingClientRect(), z = Jh().scaleExtent([x, y]).translateExtent(m), D = ot(A.current).call(z), O = Vt.translate(d.x, d.y).scale(Lr(d.zoom, x, y)), U = [
        [0, 0],
        [S.width, S.height]
      ], j = z.constrain()(O, U, m);
      z.transform(D, j), z.wheelDelta(Wf), C.setState({
        d3Zoom: z,
        d3Selection: D,
        d3ZoomHandler: D.on("wheel.zoom"),
        // we need to pass transform because zoom handler is not registered when we set the initial transform
        transform: [j.x, j.y, j.k],
        domNode: A.current.closest(".react-flow")
      });
    }
  }, []), T.useEffect(() => {
    B && F && (l && !$ && !w ? B.on("wheel.zoom", (S) => {
      if (nr(S, g))
        return !1;
      S.preventDefault(), S.stopImmediatePropagation();
      const z = B.property("__zoom").k || 1;
      if (S.ctrlKey && i) {
        const ne = ht(S), te = Wf(S), ee = z * Math.pow(2, te);
        F.scaleTo(B, ee, ne, S);
        return;
      }
      const D = S.deltaMode === 1 ? 20 : 1;
      let O = u === In.Vertical ? 0 : S.deltaX * D, U = u === In.Horizontal ? 0 : S.deltaY * D;
      !wl() && S.shiftKey && u !== In.Vertical && (O = S.deltaY * D, U = 0), F.translateBy(
        B,
        -(O / z) * s,
        -(U / z) * s,
        // @ts-ignore
        { internal: !0 }
      );
      const j = Ci(B.property("__zoom")), { onViewportChangeStart: X, onViewportChange: G, onViewportChangeEnd: Z } = C.getState();
      clearTimeout(N.current), L.current || (L.current = !0, t == null || t(S, j), X == null || X(j)), L.current && (e == null || e(S, j), G == null || G(j), N.current = setTimeout(() => {
        n == null || n(S, j), Z == null || Z(j), L.current = !1;
      }, 150));
    }, { passive: !1 }) : typeof V < "u" && B.on("wheel.zoom", function(S, z) {
      if (!p && S.type === "wheel" && !S.ctrlKey || nr(S, g))
        return null;
      S.preventDefault(), V.call(this, S, z);
    }, { passive: !1 }));
  }, [
    w,
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
      var O, U;
      if (!S.sourceEvent || S.sourceEvent.internal)
        return null;
      k.current = (O = S.sourceEvent) == null ? void 0 : O.button;
      const { onViewportChangeStart: z } = C.getState(), D = Ci(S.transform);
      M.current = !0, I.current = D, ((U = S.sourceEvent) == null ? void 0 : U.type) === "mousedown" && C.setState({ paneDragging: !0 }), z == null || z(D), t == null || t(S.sourceEvent, D);
    });
  }, [F, t]), T.useEffect(() => {
    F && (w && !M.current ? F.on("zoom", null) : w || F.on("zoom", (S) => {
      var D;
      const { onViewportChange: z } = C.getState();
      if (C.setState({ transform: [S.transform.x, S.transform.y, S.transform.k] }), P.current = !!(r && Uf(f, k.current ?? 0)), (e || z) && !((D = S.sourceEvent) != null && D.internal)) {
        const O = Ci(S.transform);
        z == null || z(O), e == null || e(S.sourceEvent, O);
      }
    }));
  }, [w, F, e, f, r]), T.useEffect(() => {
    F && F.on("end", (S) => {
      if (!S.sourceEvent || S.sourceEvent.internal)
        return null;
      const { onViewportChangeEnd: z } = C.getState();
      if (M.current = !1, C.setState({ paneDragging: !1 }), r && Uf(f, k.current ?? 0) && !P.current && r(S.sourceEvent), P.current = !1, (n || z) && WS(I.current, S.transform)) {
        const D = Ci(S.transform);
        I.current = D, clearTimeout(E.current), E.current = setTimeout(() => {
          z == null || z(D), n == null || n(S.sourceEvent, D);
        }, l ? 150 : 0);
      }
    });
  }, [F, l, f, n, r]), T.useEffect(() => {
    F && F.filter((S) => {
      const z = $ || o, D = i && S.ctrlKey;
      if ((f === !0 || Array.isArray(f) && f.includes(1)) && S.button === 1 && S.type === "mousedown" && (nr(S, "react-flow__node") || nr(S, "react-flow__edge")))
        return !0;
      if (!f && !z && !l && !a && !i || w || !a && S.type === "dblclick" || nr(S, g) && S.type === "wheel" || nr(S, v) && (S.type !== "wheel" || l && S.type === "wheel" && !$) || !i && S.ctrlKey && S.type === "wheel" || !z && !l && !D && S.type === "wheel" || !f && (S.type === "mousedown" || S.type === "touchstart") || Array.isArray(f) && !f.includes(S.button) && S.type === "mousedown")
        return !1;
      const O = Array.isArray(f) && f.includes(S.button) || !S.button || S.button <= 1;
      return (!S.ctrlKey || S.type === "wheel") && O;
    });
  }, [
    w,
    F,
    o,
    i,
    l,
    a,
    f,
    c,
    $
  ]), R.createElement("div", { className: "react-flow__renderer", ref: A, style: qa }, h);
}, QS = (e) => ({
  userSelectionActive: e.userSelectionActive,
  userSelectionRect: e.userSelectionRect
});
function KS() {
  const { userSelectionActive: e, userSelectionRect: t } = le(QS, ke);
  return e && t ? R.createElement("div", { className: "react-flow__selection react-flow__container", style: {
    width: t.width,
    height: t.height,
    transform: `translate(${t.x}px, ${t.y}px)`
  } }) : null;
}
function Yf(e, t) {
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
function GS(e, t) {
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
            typeof s.position < "u" && (l.position = s.position), typeof s.positionAbsolute < "u" && (l.positionAbsolute = s.positionAbsolute), typeof s.dragging < "u" && (l.dragging = s.dragging), l.expandParent && Yf(r, l);
            break;
          }
          case "dimensions": {
            typeof s.dimensions < "u" && (l.width = s.dimensions.width, l.height = s.dimensions.height), typeof s.updateStyle < "u" && (l.style = { ...l.style || {}, ...s.dimensions }), typeof s.resizing == "boolean" && (l.resizing = s.resizing), l.expandParent && Yf(r, l);
            break;
          }
          case "remove":
            return r;
        }
    return r.push(l), r;
  }, n);
}
function ZS(e, t) {
  return GS(e, t);
}
const en = (e, t) => ({
  id: e,
  type: "select",
  selected: t
});
function gr(e, t) {
  return e.reduce((n, r) => {
    const o = t.includes(r.id);
    return !r.selected && o ? (r.selected = !0, n.push(en(r.id, !0))) : r.selected && !o && (r.selected = !1, n.push(en(r.id, !1))), n;
  }, []);
}
const Ms = (e, t) => (n) => {
  n.target === t.current && (e == null || e(n));
}, qS = (e) => ({
  userSelectionActive: e.userSelectionActive,
  elementsSelectable: e.elementsSelectable,
  dragging: e.paneDragging
}), Tm = T.memo(({ isSelecting: e, selectionMode: t = Wo.Full, panOnDrag: n, onSelectionStart: r, onSelectionEnd: o, onPaneClick: i, onPaneContextMenu: l, onPaneScroll: s, onPaneMouseEnter: u, onPaneMouseMove: a, onPaneMouseLeave: c, children: f }) => {
  const d = T.useRef(null), m = Se(), x = T.useRef(0), y = T.useRef(0), _ = T.useRef(), { userSelectionActive: p, elementsSelectable: h, dragging: g } = le(qS, ke), v = () => {
    m.setState({ userSelectionActive: !1, userSelectionRect: null }), x.current = 0, y.current = 0;
  }, E = (V) => {
    i == null || i(V), m.getState().resetSelectedElements(), m.setState({ nodesSelectionActive: !1 });
  }, C = (V) => {
    if (Array.isArray(n) && (n != null && n.includes(2))) {
      V.preventDefault();
      return;
    }
    l == null || l(V);
  }, M = s ? (V) => s(V) : void 0, P = (V) => {
    const { resetSelectedElements: w, domNode: $ } = m.getState();
    if (_.current = $ == null ? void 0 : $.getBoundingClientRect(), !h || !e || V.button !== 0 || V.target !== d.current || !_.current)
      return;
    const { x: k, y: L } = mn(V, _.current);
    w(), m.setState({
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
    const { userSelectionRect: w, nodeInternals: $, edges: k, transform: L, onNodesChange: N, onEdgesChange: S, nodeOrigin: z, getNodes: D } = m.getState();
    if (!e || !_.current || !w)
      return;
    m.setState({ userSelectionActive: !0, nodesSelectionActive: !1 });
    const O = mn(V, _.current), U = w.startX ?? 0, j = w.startY ?? 0, X = {
      ...w,
      x: O.x < U ? O.x : U,
      y: O.y < j ? O.y : j,
      width: Math.abs(O.x - U),
      height: Math.abs(O.y - j)
    }, G = D(), Z = fm($, X, L, t === Wo.Partial, !0, z), ne = dm(Z, k).map((ee) => ee.id), te = Z.map((ee) => ee.id);
    if (x.current !== te.length) {
      x.current = te.length;
      const ee = gr(G, te);
      ee.length && (N == null || N(ee));
    }
    if (y.current !== ne.length) {
      y.current = ne.length;
      const ee = gr(k, ne);
      ee.length && (S == null || S(ee));
    }
    m.setState({
      userSelectionRect: X
    });
  }, I = (V) => {
    if (V.button !== 0)
      return;
    const { userSelectionRect: w } = m.getState();
    !p && w && V.target === d.current && (E == null || E(V)), m.setState({ nodesSelectionActive: x.current > 0 }), v(), o == null || o(V);
  }, F = (V) => {
    p && (m.setState({ nodesSelectionActive: x.current > 0 }), o == null || o(V)), v();
  }, B = h && (e || p);
  return R.createElement(
    "div",
    { className: Te(["react-flow__pane", { dragging: g, selection: e }]), onClick: B ? void 0 : Ms(E, d), onContextMenu: Ms(C, d), onWheel: Ms(M, d), onMouseEnter: B ? void 0 : u, onMouseDown: B ? P : void 0, onMouseMove: B ? A : a, onMouseUp: B ? I : void 0, onMouseLeave: B ? F : c, ref: d, style: qa },
    f,
    R.createElement(KS, null)
  );
});
Tm.displayName = "Pane";
function Pm(e, t) {
  const n = e.parentNode || e.parentId;
  if (!n)
    return !1;
  const r = t.get(n);
  return r ? r.selected ? !0 : Pm(r, t) : !1;
}
function Xf(e, t, n) {
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
function JS(e, t, n, r) {
  return Array.from(e.values()).filter((o) => (o.selected || o.id === r) && (!o.parentNode || o.parentId || !Pm(o, e)) && (o.draggable || t && typeof o.draggable > "u")).map((o) => {
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
function bS(e, t) {
  return !t || t === "parent" ? t : [t[0], [t[1][0] - (e.width || 0), t[1][1] - (e.height || 0)]];
}
function $m(e, t, n, r, o = [0, 0], i) {
  const l = bS(e, e.extent || r);
  let s = l;
  const u = e.parentNode || e.parentId;
  if (e.extent === "parent" && !e.expandParent)
    if (u && e.width && e.height) {
      const f = n.get(u), { x: d, y: m } = Fn(f, o).positionAbsolute;
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
    const f = n.get(u), { x: d, y: m } = Fn(f, o).positionAbsolute;
    s = [
      [e.extent[0][0] + d, e.extent[0][1] + m],
      [e.extent[1][0] + d, e.extent[1][1] + m]
    ];
  }
  let a = { x: 0, y: 0 };
  if (u) {
    const f = n.get(u);
    a = Fn(f, o).positionAbsolute;
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
function zs({ nodeId: e, dragItems: t, nodeInternals: n }) {
  const r = t.map((o) => ({
    ...n.get(o.id),
    position: o.position,
    positionAbsolute: o.positionAbsolute
  }));
  return [e ? r.find((o) => o.id === e) : r[0], r];
}
const Qf = (e, t, n, r) => {
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
      ...ja(u)
    };
  });
};
function no(e, t, n) {
  return n === void 0 ? n : (r) => {
    const o = t().nodeInternals.get(e);
    o && n(r, { ...o });
  };
}
function Fu({ id: e, store: t, unselect: n = !1, nodeRef: r }) {
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
function e_() {
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
function Ts(e) {
  return (t, n, r) => e == null ? void 0 : e(t, r);
}
function Rm({ nodeRef: e, disabled: t = !1, noDragClassName: n, handleSelector: r, nodeId: o, isSelectable: i, selectNodesOnDrag: l }) {
  const s = Se(), [u, a] = T.useState(!1), c = T.useRef([]), f = T.useRef({ x: null, y: null }), d = T.useRef(0), m = T.useRef(null), x = T.useRef({ x: 0, y: 0 }), y = T.useRef(null), _ = T.useRef(!1), p = T.useRef(!1), h = T.useRef(!1), g = e_();
  return T.useEffect(() => {
    if (e != null && e.current) {
      const v = ot(e.current), E = ({ x: P, y: A }) => {
        const { nodeInternals: I, onNodeDrag: F, onSelectionDrag: B, updateNodePositions: V, nodeExtent: w, snapGrid: $, snapToGrid: k, nodeOrigin: L, onError: N } = s.getState();
        f.current = { x: P, y: A };
        let S = !1, z = { x: 0, y: 0, x2: 0, y2: 0 };
        if (c.current.length > 1 && w) {
          const O = Wl(c.current, L);
          z = Uo(O);
        }
        if (c.current = c.current.map((O) => {
          const U = { x: P - O.distance.x, y: A - O.distance.y };
          k && (U.x = $[0] * Math.round(U.x / $[0]), U.y = $[1] * Math.round(U.y / $[1]));
          const j = [
            [w[0][0], w[0][1]],
            [w[1][0], w[1][1]]
          ];
          c.current.length > 1 && w && !O.extent && (j[0][0] = O.positionAbsolute.x - z.x + w[0][0], j[1][0] = O.positionAbsolute.x + (O.width ?? 0) - z.x2 + w[1][0], j[0][1] = O.positionAbsolute.y - z.y + w[0][1], j[1][1] = O.positionAbsolute.y + (O.height ?? 0) - z.y2 + w[1][1]);
          const X = $m(O, U, I, j, L, N);
          return S = S || O.position.x !== X.position.x || O.position.y !== X.position.y, O.position = X.position, O.positionAbsolute = X.positionAbsolute, O;
        }), !S)
          return;
        V(c.current, !0, !0), a(!0);
        const D = o ? F : Ts(B);
        if (D && y.current) {
          const [O, U] = zs({
            nodeId: o,
            dragItems: c.current,
            nodeInternals: I
          });
          D(y.current, O, U);
        }
      }, C = () => {
        if (!m.current)
          return;
        const [P, A] = em(x.current, m.current);
        if (P !== 0 || A !== 0) {
          const { transform: I, panBy: F } = s.getState();
          f.current.x = (f.current.x ?? 0) - P / I[2], f.current.y = (f.current.y ?? 0) - A / I[2], F({ x: P, y: A }) && E(f.current);
        }
        d.current = requestAnimationFrame(C);
      }, M = (P) => {
        var L;
        const { nodeInternals: A, multiSelectionActive: I, nodesDraggable: F, unselectNodesAndEdges: B, onNodeDragStart: V, onSelectionDragStart: w } = s.getState();
        p.current = !0;
        const $ = o ? V : Ts(w);
        (!l || !i) && !I && o && ((L = A.get(o)) != null && L.selected || B()), o && i && l && Fu({
          id: o,
          store: s,
          nodeRef: e
        });
        const k = g(P);
        if (f.current = k, c.current = JS(A, F, k, o), $ && c.current) {
          const [N, S] = zs({
            nodeId: o,
            dragItems: c.current,
            nodeInternals: A
          });
          $(P.sourceEvent, N, S);
        }
      };
      if (t)
        v.on(".drag", null);
      else {
        const P = cw().on("start", (A) => {
          const { domNode: I, nodeDragThreshold: F } = s.getState();
          F === 0 && M(A), h.current = !1;
          const B = g(A);
          f.current = B, m.current = (I == null ? void 0 : I.getBoundingClientRect()) || null, x.current = mn(A.sourceEvent, m.current);
        }).on("drag", (A) => {
          var V, w;
          const I = g(A), { autoPanOnNodeDrag: F, nodeDragThreshold: B } = s.getState();
          if (A.sourceEvent.type === "touchmove" && A.sourceEvent.touches.length > 1 && (h.current = !0), !h.current) {
            if (!_.current && p.current && F && (_.current = !0, C()), !p.current) {
              const $ = I.xSnapped - (((V = f == null ? void 0 : f.current) == null ? void 0 : V.x) ?? 0), k = I.ySnapped - (((w = f == null ? void 0 : f.current) == null ? void 0 : w.y) ?? 0);
              Math.sqrt($ * $ + k * k) > B && M(A);
            }
            (f.current.x !== I.xSnapped || f.current.y !== I.ySnapped) && c.current && p.current && (y.current = A.sourceEvent, x.current = mn(A.sourceEvent, m.current), E(I));
          }
        }).on("end", (A) => {
          if (!(!p.current || h.current) && (a(!1), _.current = !1, p.current = !1, cancelAnimationFrame(d.current), c.current)) {
            const { updateNodePositions: I, nodeInternals: F, onNodeDragStop: B, onSelectionDragStop: V } = s.getState(), w = o ? B : Ts(V);
            if (I(c.current, !1, !1), w) {
              const [$, k] = zs({
                nodeId: o,
                dragItems: c.current,
                nodeInternals: F
              });
              w(A.sourceEvent, $, k);
            }
          }
        }).filter((A) => {
          const I = A.target;
          return !A.button && (!n || !Xf(I, `.${n}`, e)) && (!r || Xf(I, r, e));
        });
        return v.call(P), () => {
          v.on(".drag", null);
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
function Am() {
  const e = Se();
  return T.useCallback((n) => {
    const { nodeInternals: r, nodeExtent: o, updateNodePositions: i, getNodes: l, snapToGrid: s, snapGrid: u, onError: a, nodesDraggable: c } = e.getState(), f = l().filter((h) => h.selected && (h.draggable || c && typeof h.draggable > "u")), d = s ? u[0] : 5, m = s ? u[1] : 5, x = n.isShiftPressed ? 4 : 1, y = n.x * d * x, _ = n.y * m * x, p = f.map((h) => {
      if (h.positionAbsolute) {
        const g = { x: h.positionAbsolute.x + y, y: h.positionAbsolute.y + _ };
        s && (g.x = u[0] * Math.round(g.x / u[0]), g.y = u[1] * Math.round(g.y / u[1]));
        const { positionAbsolute: v, position: E } = $m(h, g, r, o, void 0, a);
        h.position = E, h.positionAbsolute = v;
      }
      return h;
    });
    i(p, !0, !1);
  }, []);
}
const Nr = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};
var ro = (e) => {
  const t = ({ id: n, type: r, data: o, xPos: i, yPos: l, xPosOrigin: s, yPosOrigin: u, selected: a, onClick: c, onMouseEnter: f, onMouseMove: d, onMouseLeave: m, onContextMenu: x, onDoubleClick: y, style: _, className: p, isDraggable: h, isSelectable: g, isConnectable: v, isFocusable: E, selectNodesOnDrag: C, sourcePosition: M, targetPosition: P, hidden: A, resizeObserver: I, dragHandle: F, zIndex: B, isParent: V, noDragClassName: w, noPanClassName: $, initialized: k, disableKeyboardA11y: L, ariaLabel: N, rfId: S, hasHandleBounds: z }) => {
    const D = Se(), O = T.useRef(null), U = T.useRef(null), j = T.useRef(M), X = T.useRef(P), G = T.useRef(r), Z = g || h || c || f || d || m, ne = Am(), te = no(n, D.getState, f), ee = no(n, D.getState, d), Ne = no(n, D.getState, m), ve = no(n, D.getState, x), Le = no(n, D.getState, y), Pe = (oe) => {
      const { nodeDragThreshold: K } = D.getState();
      if (g && (!C || !h || K > 0) && Fu({
        id: n,
        store: D,
        nodeRef: O
      }), c) {
        const Oe = D.getState().nodeInternals.get(n);
        Oe && c(oe, { ...Oe });
      }
    }, me = (oe) => {
      if (!Au(oe) && !L)
        if (om.includes(oe.key) && g) {
          const K = oe.key === "Escape";
          Fu({
            id: n,
            store: D,
            unselect: K,
            nodeRef: O
          });
        } else h && a && Object.prototype.hasOwnProperty.call(Nr, oe.key) && (D.setState({
          ariaLiveMessage: `Moved selected node ${oe.key.replace("Arrow", "").toLowerCase()}. New position, x: ${~~i}, y: ${~~l}`
        }), ne({
          x: Nr[oe.key].x,
          y: Nr[oe.key].y,
          isShiftPressed: oe.shiftKey
        }));
    };
    T.useEffect(() => () => {
      U.current && (I == null || I.unobserve(U.current), U.current = null);
    }, []), T.useEffect(() => {
      if (O.current && !A) {
        const oe = O.current;
        (!k || !z || U.current !== oe) && (U.current && (I == null || I.unobserve(U.current)), I == null || I.observe(oe), U.current = oe);
      }
    }, [A, k, z]), T.useEffect(() => {
      const oe = G.current !== r, K = j.current !== M, Oe = X.current !== P;
      O.current && (oe || K || Oe) && (oe && (G.current = r), K && (j.current = M), Oe && (X.current = P), D.getState().updateNodeDimensions([{ id: n, nodeElement: O.current, forceUpdate: !0 }]));
    }, [n, r, M, P]);
    const Ke = Rm({
      nodeRef: O,
      disabled: A || !h,
      noDragClassName: w,
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
        pointerEvents: Z ? "all" : "none",
        visibility: k ? "visible" : "hidden",
        ..._
      }, "data-id": n, "data-testid": `rf__node-${n}`, onMouseEnter: te, onMouseMove: ee, onMouseLeave: Ne, onContextMenu: ve, onClick: Pe, onDoubleClick: Le, onKeyDown: E ? me : void 0, tabIndex: E ? 0 : void 0, role: E ? "button" : void 0, "aria-describedby": L ? void 0 : `${km}-${S}`, "aria-label": N },
      R.createElement(
        pS,
        { value: n },
        R.createElement(e, { id: n, data: o, type: r, xPos: i, yPos: l, selected: a, isConnectable: v, sourcePosition: M, targetPosition: P, dragging: Ke, dragHandle: F, zIndex: B })
      )
    );
  };
  return t.displayName = "NodeWrapper", T.memo(t);
};
const t_ = (e) => {
  const t = e.getNodes().filter((n) => n.selected);
  return {
    ...Wl(t, e.nodeOrigin),
    transformString: `translate(${e.transform[0]}px,${e.transform[1]}px) scale(${e.transform[2]})`,
    userSelectionActive: e.userSelectionActive
  };
};
function n_({ onSelectionContextMenu: e, noPanClassName: t, disableKeyboardA11y: n }) {
  const r = Se(), { width: o, height: i, x: l, y: s, transformString: u, userSelectionActive: a } = le(t_, ke), c = Am(), f = T.useRef(null);
  if (T.useEffect(() => {
    var x;
    n || (x = f.current) == null || x.focus({
      preventScroll: !0
    });
  }, [n]), Rm({
    nodeRef: f
  }), a || !o || !i)
    return null;
  const d = e ? (x) => {
    const y = r.getState().getNodes().filter((_) => _.selected);
    e(x, y);
  } : void 0, m = (x) => {
    Object.prototype.hasOwnProperty.call(Nr, x.key) && c({
      x: Nr[x.key].x,
      y: Nr[x.key].y,
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
var r_ = T.memo(n_);
const o_ = (e) => e.nodesSelectionActive, Im = ({ children: e, onPaneClick: t, onPaneMouseEnter: n, onPaneMouseMove: r, onPaneMouseLeave: o, onPaneContextMenu: i, onPaneScroll: l, deleteKeyCode: s, onMove: u, onMoveStart: a, onMoveEnd: c, selectionKeyCode: f, selectionOnDrag: d, selectionMode: m, onSelectionStart: x, onSelectionEnd: y, multiSelectionKeyCode: _, panActivationKeyCode: p, zoomActivationKeyCode: h, elementsSelectable: g, zoomOnScroll: v, zoomOnPinch: E, panOnScroll: C, panOnScrollSpeed: M, panOnScrollMode: P, zoomOnDoubleClick: A, panOnDrag: I, defaultViewport: F, translateExtent: B, minZoom: V, maxZoom: w, preventScrolling: $, onSelectionContextMenu: k, noWheelClassName: L, noPanClassName: N, disableKeyboardA11y: S }) => {
  const z = le(o_), D = Xo(f), O = Xo(p), U = O || I, j = O || C, X = D || d && U !== !0;
  return jS({ deleteKeyCode: s, multiSelectionKeyCode: _ }), R.createElement(
    XS,
    { onMove: u, onMoveStart: a, onMoveEnd: c, onPaneContextMenu: i, elementsSelectable: g, zoomOnScroll: v, zoomOnPinch: E, panOnScroll: j, panOnScrollSpeed: M, panOnScrollMode: P, zoomOnDoubleClick: A, panOnDrag: !D && U, defaultViewport: F, translateExtent: B, minZoom: V, maxZoom: w, zoomActivationKeyCode: h, preventScrolling: $, noWheelClassName: L, noPanClassName: N },
    R.createElement(
      Tm,
      { onSelectionStart: x, onSelectionEnd: y, onPaneClick: t, onPaneMouseEnter: n, onPaneMouseMove: r, onPaneMouseLeave: o, onPaneContextMenu: i, onPaneScroll: l, panOnDrag: U, isSelecting: !!X, selectionMode: m },
      e,
      z && R.createElement(r_, { onSelectionContextMenu: k, noPanClassName: N, disableKeyboardA11y: S })
    )
  );
};
Im.displayName = "FlowRenderer";
var i_ = T.memo(Im);
function l_(e) {
  return le(T.useCallback((n) => e ? fm(n.nodeInternals, { x: 0, y: 0, width: n.width, height: n.height }, n.transform, !0) : n.getNodes(), [e]));
}
function s_(e) {
  const t = {
    input: ro(e.input || xm),
    default: ro(e.default || Ou),
    output: ro(e.output || _m),
    group: ro(e.group || Ga)
  }, n = {}, r = Object.keys(e).filter((o) => !["input", "default", "output", "group"].includes(o)).reduce((o, i) => (o[i] = ro(e[i] || Ou), o), n);
  return {
    ...t,
    ...r
  };
}
const u_ = ({ x: e, y: t, width: n, height: r, origin: o }) => !n || !r ? { x: e, y: t } : o[0] < 0 || o[1] < 0 || o[0] > 1 || o[1] > 1 ? { x: e, y: t } : {
  x: e - n * o[0],
  y: t - r * o[1]
}, a_ = (e) => ({
  nodesDraggable: e.nodesDraggable,
  nodesConnectable: e.nodesConnectable,
  nodesFocusable: e.nodesFocusable,
  elementsSelectable: e.elementsSelectable,
  updateNodeDimensions: e.updateNodeDimensions,
  onError: e.onError
}), Dm = (e) => {
  const { nodesDraggable: t, nodesConnectable: n, nodesFocusable: r, elementsSelectable: o, updateNodeDimensions: i, onError: l } = le(a_, ke), s = l_(e.onlyRenderVisibleElements), u = T.useRef(), a = T.useMemo(() => {
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
  }, []), R.createElement("div", { className: "react-flow__nodes", style: qa }, s.map((c) => {
    var E, C, M;
    let f = c.type || "default";
    e.nodeTypes[f] || (l == null || l("003", Xt.error003(f)), f = "default");
    const d = e.nodeTypes[f] || e.nodeTypes.default, m = !!(c.draggable || t && typeof c.draggable > "u"), x = !!(c.selectable || o && typeof c.selectable > "u"), y = !!(c.connectable || n && typeof c.connectable > "u"), _ = !!(c.focusable || r && typeof c.focusable > "u"), p = e.nodeExtent ? Ua(c.positionAbsolute, e.nodeExtent) : c.positionAbsolute, h = (p == null ? void 0 : p.x) ?? 0, g = (p == null ? void 0 : p.y) ?? 0, v = u_({
      x: h,
      y: g,
      width: c.width ?? 0,
      height: c.height ?? 0,
      origin: e.nodeOrigin
    });
    return R.createElement(d, { key: c.id, id: c.id, className: c.className, style: c.style, type: f, data: c.data, sourcePosition: c.sourcePosition || Q.Bottom, targetPosition: c.targetPosition || Q.Top, hidden: c.hidden, xPos: h, yPos: g, xPosOrigin: v.x, yPosOrigin: v.y, selectNodesOnDrag: e.selectNodesOnDrag, onClick: e.onNodeClick, onMouseEnter: e.onNodeMouseEnter, onMouseMove: e.onNodeMouseMove, onMouseLeave: e.onNodeMouseLeave, onContextMenu: e.onNodeContextMenu, onDoubleClick: e.onNodeDoubleClick, selected: !!c.selected, isDraggable: m, isSelectable: x, isConnectable: y, isFocusable: _, resizeObserver: a, dragHandle: c.dragHandle, zIndex: ((E = c[he]) == null ? void 0 : E.z) ?? 0, isParent: !!((C = c[he]) != null && C.isParent), noDragClassName: e.noDragClassName, noPanClassName: e.noPanClassName, initialized: !!c.width && !!c.height, rfId: e.rfId, disableKeyboardA11y: e.disableKeyboardA11y, ariaLabel: c.ariaLabel, hasHandleBounds: !!((M = c[he]) != null && M.handleBounds) });
  }));
};
Dm.displayName = "NodeRenderer";
var c_ = T.memo(Dm);
const f_ = (e, t, n) => n === Q.Left ? e - t : n === Q.Right ? e + t : e, d_ = (e, t, n) => n === Q.Top ? e - t : n === Q.Bottom ? e + t : e, Kf = "react-flow__edgeupdater", Gf = ({ position: e, centerX: t, centerY: n, radius: r = 10, onMouseDown: o, onMouseEnter: i, onMouseOut: l, type: s }) => R.createElement("circle", { onMouseDown: o, onMouseEnter: i, onMouseOut: l, className: Te([Kf, `${Kf}-${s}`]), cx: f_(t, r, e), cy: d_(n, r, e), r, stroke: "transparent", fill: "transparent" }), p_ = () => !0;
var rr = (e) => {
  const t = ({ id: n, className: r, type: o, data: i, onClick: l, onEdgeDoubleClick: s, selected: u, animated: a, label: c, labelStyle: f, labelShowBg: d, labelBgStyle: m, labelBgPadding: x, labelBgBorderRadius: y, style: _, source: p, target: h, sourceX: g, sourceY: v, targetX: E, targetY: C, sourcePosition: M, targetPosition: P, elementsSelectable: A, hidden: I, sourceHandleId: F, targetHandleId: B, onContextMenu: V, onMouseEnter: w, onMouseMove: $, onMouseLeave: k, reconnectRadius: L, onReconnect: N, onReconnectStart: S, onReconnectEnd: z, markerEnd: D, markerStart: O, rfId: U, ariaLabel: j, isFocusable: X, isReconnectable: G, pathOptions: Z, interactionWidth: ne, disableKeyboardA11y: te }) => {
    const ee = T.useRef(null), [Ne, ve] = T.useState(!1), [Le, Pe] = T.useState(!1), me = Se(), Ke = T.useMemo(() => `url('#${Du(O, U)}')`, [O, U]), oe = T.useMemo(() => `url('#${Du(D, U)}')`, [D, U]);
    if (I)
      return null;
    const K = ($e) => {
      var _t;
      const { edges: ct, addSelectedEdges: En, unselectNodesAndEdges: kn, multiSelectionActive: Nn } = me.getState(), Rt = ct.find((Ur) => Ur.id === n);
      Rt && (A && (me.setState({ nodesSelectionActive: !1 }), Rt.selected && Nn ? (kn({ nodes: [], edges: [Rt] }), (_t = ee.current) == null || _t.blur()) : En([n])), l && l($e, Rt));
    }, Oe = to(n, me.getState, s), Pt = to(n, me.getState, V), Br = to(n, me.getState, w), Kn = to(n, me.getState, $), Gn = to(n, me.getState, k), $t = ($e, ct) => {
      if ($e.button !== 0)
        return;
      const { edges: En, isValidConnection: kn } = me.getState(), Nn = ct ? h : p, Rt = (ct ? B : F) || null, _t = ct ? "target" : "source", Ur = kn || p_, Yl = ct, Wr = En.find((Cn) => Cn.id === n);
      Pe(!0), S == null || S($e, Wr, _t);
      const Xl = (Cn) => {
        Pe(!1), z == null || z(Cn, Wr, _t);
      };
      gm({
        event: $e,
        handleId: Rt,
        nodeId: Nn,
        onConnect: (Cn) => N == null ? void 0 : N(Wr, Cn),
        isTarget: Yl,
        getState: me.getState,
        setState: me.setState,
        isValidConnection: Ur,
        edgeUpdaterType: _t,
        onReconnectEnd: Xl
      });
    }, Zn = ($e) => $t($e, !0), Sn = ($e) => $t($e, !1), _n = () => ve(!0), qn = () => ve(!1), Jn = !A && !l, jr = ($e) => {
      var ct;
      if (!te && om.includes($e.key) && A) {
        const { unselectNodesAndEdges: En, addSelectedEdges: kn, edges: Nn } = me.getState();
        $e.key === "Escape" ? ((ct = ee.current) == null || ct.blur(), En({ edges: [Nn.find((_t) => _t.id === n)] })) : kn([n]);
      }
    };
    return R.createElement(
      "g",
      { className: Te([
        "react-flow__edge",
        `react-flow__edge-${o}`,
        r,
        { selected: u, animated: a, inactive: Jn, updating: Ne }
      ]), onClick: K, onDoubleClick: Oe, onContextMenu: Pt, onMouseEnter: Br, onMouseMove: Kn, onMouseLeave: Gn, onKeyDown: X ? jr : void 0, tabIndex: X ? 0 : void 0, role: X ? "button" : "img", "data-testid": `rf__edge-${n}`, "aria-label": j === null ? void 0 : j || `Edge from ${p} to ${h}`, "aria-describedby": X ? `${Nm}-${U}` : void 0, ref: ee },
      !Le && R.createElement(e, { id: n, source: p, target: h, selected: u, animated: a, label: c, labelStyle: f, labelShowBg: d, labelBgStyle: m, labelBgPadding: x, labelBgBorderRadius: y, data: i, style: _, sourceX: g, sourceY: v, targetX: E, targetY: C, sourcePosition: M, targetPosition: P, sourceHandleId: F, targetHandleId: B, markerStart: Ke, markerEnd: oe, pathOptions: Z, interactionWidth: ne }),
      G && R.createElement(
        R.Fragment,
        null,
        (G === "source" || G === !0) && R.createElement(Gf, { position: M, centerX: g, centerY: v, radius: L, onMouseDown: Zn, onMouseEnter: _n, onMouseOut: qn, type: "source" }),
        (G === "target" || G === !0) && R.createElement(Gf, { position: P, centerX: E, centerY: C, radius: L, onMouseDown: Sn, onMouseEnter: _n, onMouseOut: qn, type: "target" })
      )
    );
  };
  return t.displayName = "EdgeWrapper", T.memo(t);
};
function h_(e) {
  const t = {
    default: rr(e.default || xl),
    straight: rr(e.bezier || Xa),
    step: rr(e.step || Ya),
    smoothstep: rr(e.step || Ul),
    simplebezier: rr(e.simplebezier || Wa)
  }, n = {}, r = Object.keys(e).filter((o) => !["default", "bezier"].includes(o)).reduce((o, i) => (o[i] = rr(e[i] || xl), o), n);
  return {
    ...t,
    ...r
  };
}
function Zf(e, t, n = null) {
  const r = ((n == null ? void 0 : n.x) || 0) + t.x, o = ((n == null ? void 0 : n.y) || 0) + t.y, i = (n == null ? void 0 : n.width) || t.width, l = (n == null ? void 0 : n.height) || t.height;
  switch (e) {
    case Q.Top:
      return {
        x: r + i / 2,
        y: o
      };
    case Q.Right:
      return {
        x: r + i,
        y: o + l / 2
      };
    case Q.Bottom:
      return {
        x: r + i / 2,
        y: o + l
      };
    case Q.Left:
      return {
        x: r,
        y: o + l / 2
      };
  }
}
function qf(e, t) {
  return e ? e.length === 1 || !t ? e[0] : t && e.find((n) => n.id === t) || null : null;
}
const m_ = (e, t, n, r, o, i) => {
  const l = Zf(n, e, t), s = Zf(i, r, o);
  return {
    sourceX: l.x,
    sourceY: l.y,
    targetX: s.x,
    targetY: s.y
  };
};
function g_({ sourcePos: e, targetPos: t, sourceWidth: n, sourceHeight: r, targetWidth: o, targetHeight: i, width: l, height: s, transform: u }) {
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
function Jf(e) {
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
const y_ = [{ level: 0, isMaxLevel: !0, edges: [] }];
function v_(e, t, n = !1) {
  let r = -1;
  const o = e.reduce((l, s) => {
    var c, f;
    const u = lt(s.zIndex);
    let a = u ? s.zIndex : 0;
    if (n) {
      const d = t.get(s.target), m = t.get(s.source), x = s.selected || (d == null ? void 0 : d.selected) || (m == null ? void 0 : m.selected), y = Math.max(((c = m == null ? void 0 : m[he]) == null ? void 0 : c.z) || 0, ((f = d == null ? void 0 : d[he]) == null ? void 0 : f.z) || 0, 1e3);
      a = (u ? s.zIndex : 0) + (x ? y : 0);
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
  return i.length === 0 ? y_ : i;
}
function w_(e, t, n) {
  const r = le(T.useCallback((o) => e ? o.edges.filter((i) => {
    const l = t.get(i.source), s = t.get(i.target);
    return (l == null ? void 0 : l.width) && (l == null ? void 0 : l.height) && (s == null ? void 0 : s.width) && (s == null ? void 0 : s.height) && g_({
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
  return v_(r, t, n);
}
const x_ = ({ color: e = "none", strokeWidth: t = 1 }) => R.createElement("polyline", { style: {
  stroke: e,
  strokeWidth: t
}, strokeLinecap: "round", strokeLinejoin: "round", fill: "none", points: "-5,-4 0,0 -5,4" }), S_ = ({ color: e = "none", strokeWidth: t = 1 }) => R.createElement("polyline", { style: {
  stroke: e,
  fill: e,
  strokeWidth: t
}, strokeLinecap: "round", strokeLinejoin: "round", points: "-5,-4 0,0 -5,4 -5,-4" }), bf = {
  [Yo.Arrow]: x_,
  [Yo.ArrowClosed]: S_
};
function __(e) {
  const t = Se();
  return T.useMemo(() => {
    var o, i;
    return Object.prototype.hasOwnProperty.call(bf, e) ? bf[e] : ((i = (o = t.getState()).onError) == null || i.call(o, "009", Xt.error009(e)), null);
  }, [e]);
}
const E_ = ({ id: e, type: t, color: n, width: r = 12.5, height: o = 12.5, markerUnits: i = "strokeWidth", strokeWidth: l, orient: s = "auto-start-reverse" }) => {
  const u = __(t);
  return u ? R.createElement(
    "marker",
    { className: "react-flow__arrowhead", id: e, markerWidth: `${r}`, markerHeight: `${o}`, viewBox: "-10 -10 20 20", markerUnits: i, orient: s, refX: "0", refY: "0" },
    R.createElement(u, { color: n, strokeWidth: l })
  ) : null;
}, k_ = ({ defaultColor: e, rfId: t }) => (n) => {
  const r = [];
  return n.edges.reduce((o, i) => ([i.markerStart, i.markerEnd].forEach((l) => {
    if (l && typeof l == "object") {
      const s = Du(l, t);
      r.includes(s) || (o.push({ id: s, color: l.color || e, ...l }), r.push(s));
    }
  }), o), []).sort((o, i) => o.id.localeCompare(i.id));
}, Lm = ({ defaultColor: e, rfId: t }) => {
  const n = le(
    T.useCallback(k_({ defaultColor: e, rfId: t }), [e, t]),
    // the id includes all marker options, so we just need to look at that part of the marker
    (r, o) => !(r.length !== o.length || r.some((i, l) => i.id !== o[l].id))
  );
  return R.createElement("defs", null, n.map((r) => R.createElement(E_, { id: r.id, key: r.id, type: r.type, color: r.color, width: r.width, height: r.height, markerUnits: r.markerUnits, strokeWidth: r.strokeWidth, orient: r.orient })));
};
Lm.displayName = "MarkerDefinitions";
var N_ = T.memo(Lm);
const C_ = (e) => ({
  nodesConnectable: e.nodesConnectable,
  edgesFocusable: e.edgesFocusable,
  edgesUpdatable: e.edgesUpdatable,
  elementsSelectable: e.elementsSelectable,
  width: e.width,
  height: e.height,
  connectionMode: e.connectionMode,
  nodeInternals: e.nodeInternals,
  onError: e.onError
}), Om = ({ defaultMarkerColor: e, onlyRenderVisibleElements: t, elevateEdgesOnSelect: n, rfId: r, edgeTypes: o, noPanClassName: i, onEdgeContextMenu: l, onEdgeMouseEnter: s, onEdgeMouseMove: u, onEdgeMouseLeave: a, onEdgeClick: c, onEdgeDoubleClick: f, onReconnect: d, onReconnectStart: m, onReconnectEnd: x, reconnectRadius: y, children: _, disableKeyboardA11y: p }) => {
  const { edgesFocusable: h, edgesUpdatable: g, elementsSelectable: v, width: E, height: C, connectionMode: M, nodeInternals: P, onError: A } = le(C_, ke), I = w_(t, P, n);
  return E ? R.createElement(
    R.Fragment,
    null,
    I.map(({ level: F, edges: B, isMaxLevel: V }) => R.createElement(
      "svg",
      { key: F, style: { zIndex: F }, width: E, height: C, className: "react-flow__edges react-flow__container" },
      V && R.createElement(N_, { defaultColor: e, rfId: r }),
      R.createElement("g", null, B.map((w) => {
        const [$, k, L] = Jf(P.get(w.source)), [N, S, z] = Jf(P.get(w.target));
        if (!L || !z)
          return null;
        let D = w.type || "default";
        o[D] || (A == null || A("011", Xt.error011(D)), D = "default");
        const O = o[D] || o.default, U = M === Yn.Strict ? S.target : (S.target ?? []).concat(S.source ?? []), j = qf(k.source, w.sourceHandle), X = qf(U, w.targetHandle), G = (j == null ? void 0 : j.position) || Q.Bottom, Z = (X == null ? void 0 : X.position) || Q.Top, ne = !!(w.focusable || h && typeof w.focusable > "u"), te = w.reconnectable || w.updatable, ee = typeof d < "u" && (te || g && typeof te > "u");
        if (!j || !X)
          return A == null || A("008", Xt.error008(j, w)), null;
        const { sourceX: Ne, sourceY: ve, targetX: Le, targetY: Pe } = m_($, j, G, N, X, Z);
        return R.createElement(O, { key: w.id, id: w.id, className: Te([w.className, i]), type: D, data: w.data, selected: !!w.selected, animated: !!w.animated, hidden: !!w.hidden, label: w.label, labelStyle: w.labelStyle, labelShowBg: w.labelShowBg, labelBgStyle: w.labelBgStyle, labelBgPadding: w.labelBgPadding, labelBgBorderRadius: w.labelBgBorderRadius, style: w.style, source: w.source, target: w.target, sourceHandleId: w.sourceHandle, targetHandleId: w.targetHandle, markerEnd: w.markerEnd, markerStart: w.markerStart, sourceX: Ne, sourceY: ve, targetX: Le, targetY: Pe, sourcePosition: G, targetPosition: Z, elementsSelectable: v, onContextMenu: l, onMouseEnter: s, onMouseMove: u, onMouseLeave: a, onClick: c, onEdgeDoubleClick: f, onReconnect: d, onReconnectStart: m, onReconnectEnd: x, reconnectRadius: y, rfId: r, ariaLabel: w.ariaLabel, isFocusable: ne, isReconnectable: ee, pathOptions: "pathOptions" in w ? w.pathOptions : void 0, interactionWidth: w.interactionWidth, disableKeyboardA11y: p });
      }))
    )),
    _
  ) : null;
};
Om.displayName = "EdgeRenderer";
var M_ = T.memo(Om);
const z_ = (e) => `translate(${e.transform[0]}px,${e.transform[1]}px) scale(${e.transform[2]})`;
function T_({ children: e }) {
  const t = le(z_);
  return R.createElement("div", { className: "react-flow__viewport react-flow__container", style: { transform: t } }, e);
}
function P_(e) {
  const t = Za(), n = T.useRef(!1);
  T.useEffect(() => {
    !n.current && t.viewportInitialized && e && (setTimeout(() => e(t), 1), n.current = !0);
  }, [e, t.viewportInitialized]);
}
const $_ = {
  [Q.Left]: Q.Right,
  [Q.Right]: Q.Left,
  [Q.Top]: Q.Bottom,
  [Q.Bottom]: Q.Top
}, Fm = ({ nodeId: e, handleType: t, style: n, type: r = rn.Bezier, CustomComponent: o, connectionStatus: i }) => {
  var C, M, P;
  const { fromNode: l, handleId: s, toX: u, toY: a, connectionMode: c } = le(T.useCallback((A) => ({
    fromNode: A.nodeInternals.get(e),
    handleId: A.connectionHandleId,
    toX: (A.connectionPosition.x - A.transform[0]) / A.transform[2],
    toY: (A.connectionPosition.y - A.transform[1]) / A.transform[2],
    connectionMode: A.connectionMode
  }), [e]), ke), f = (C = l == null ? void 0 : l[he]) == null ? void 0 : C.handleBounds;
  let d = f == null ? void 0 : f[t];
  if (c === Yn.Loose && (d = d || (f == null ? void 0 : f[t === "source" ? "target" : "source"])), !l || !d)
    return null;
  const m = s ? d.find((A) => A.id === s) : d[0], x = m ? m.x + m.width / 2 : (l.width ?? 0) / 2, y = m ? m.y + m.height / 2 : l.height ?? 0, _ = (((M = l.positionAbsolute) == null ? void 0 : M.x) ?? 0) + x, p = (((P = l.positionAbsolute) == null ? void 0 : P.y) ?? 0) + y, h = m == null ? void 0 : m.position, g = h ? $_[h] : null;
  if (!h || !g)
    return null;
  if (o)
    return R.createElement(o, { connectionLineType: r, connectionLineStyle: n, fromNode: l, fromHandle: m, fromX: _, fromY: p, toX: u, toY: a, fromPosition: h, toPosition: g, connectionStatus: i });
  let v = "";
  const E = {
    sourceX: _,
    sourceY: p,
    sourcePosition: h,
    targetX: u,
    targetY: a,
    targetPosition: g
  };
  return r === rn.Bezier ? [v] = am(E) : r === rn.Step ? [v] = Iu({
    ...E,
    borderRadius: 0
  }) : r === rn.SmoothStep ? [v] = Iu(E) : r === rn.SimpleBezier ? [v] = um(E) : v = `M${_},${p} ${u},${a}`, R.createElement("path", { d: v, fill: "none", className: "react-flow__connection-path", style: n });
};
Fm.displayName = "ConnectionLine";
const R_ = (e) => ({
  nodeId: e.connectionNodeId,
  handleType: e.connectionHandleType,
  nodesConnectable: e.nodesConnectable,
  connectionStatus: e.connectionStatus,
  width: e.width,
  height: e.height
});
function A_({ containerStyle: e, style: t, type: n, component: r }) {
  const { nodeId: o, handleType: i, nodesConnectable: l, width: s, height: u, connectionStatus: a } = le(R_, ke);
  return !(o && i && s && l) ? null : R.createElement(
    "svg",
    { style: e, width: s, height: u, className: "react-flow__edges react-flow__connectionline react-flow__container" },
    R.createElement(
      "g",
      { className: Te(["react-flow__connection", a]) },
      R.createElement(Fm, { nodeId: o, handleType: i, style: t, type: n, CustomComponent: r, connectionStatus: a })
    )
  );
}
function ed(e, t) {
  return T.useRef(null), Se(), T.useMemo(() => t(e), [e]);
}
const Hm = ({ nodeTypes: e, edgeTypes: t, onMove: n, onMoveStart: r, onMoveEnd: o, onInit: i, onNodeClick: l, onEdgeClick: s, onNodeDoubleClick: u, onEdgeDoubleClick: a, onNodeMouseEnter: c, onNodeMouseMove: f, onNodeMouseLeave: d, onNodeContextMenu: m, onSelectionContextMenu: x, onSelectionStart: y, onSelectionEnd: _, connectionLineType: p, connectionLineStyle: h, connectionLineComponent: g, connectionLineContainerStyle: v, selectionKeyCode: E, selectionOnDrag: C, selectionMode: M, multiSelectionKeyCode: P, panActivationKeyCode: A, zoomActivationKeyCode: I, deleteKeyCode: F, onlyRenderVisibleElements: B, elementsSelectable: V, selectNodesOnDrag: w, defaultViewport: $, translateExtent: k, minZoom: L, maxZoom: N, preventScrolling: S, defaultMarkerColor: z, zoomOnScroll: D, zoomOnPinch: O, panOnScroll: U, panOnScrollSpeed: j, panOnScrollMode: X, zoomOnDoubleClick: G, panOnDrag: Z, onPaneClick: ne, onPaneMouseEnter: te, onPaneMouseMove: ee, onPaneMouseLeave: Ne, onPaneScroll: ve, onPaneContextMenu: Le, onEdgeContextMenu: Pe, onEdgeMouseEnter: me, onEdgeMouseMove: Ke, onEdgeMouseLeave: oe, onReconnect: K, onReconnectStart: Oe, onReconnectEnd: Pt, reconnectRadius: Br, noDragClassName: Kn, noWheelClassName: Gn, noPanClassName: $t, elevateEdgesOnSelect: Zn, disableKeyboardA11y: Sn, nodeOrigin: _n, nodeExtent: qn, rfId: Jn }) => {
  const jr = ed(e, s_), $e = ed(t, h_);
  return P_(i), R.createElement(
    i_,
    { onPaneClick: ne, onPaneMouseEnter: te, onPaneMouseMove: ee, onPaneMouseLeave: Ne, onPaneContextMenu: Le, onPaneScroll: ve, deleteKeyCode: F, selectionKeyCode: E, selectionOnDrag: C, selectionMode: M, onSelectionStart: y, onSelectionEnd: _, multiSelectionKeyCode: P, panActivationKeyCode: A, zoomActivationKeyCode: I, elementsSelectable: V, onMove: n, onMoveStart: r, onMoveEnd: o, zoomOnScroll: D, zoomOnPinch: O, zoomOnDoubleClick: G, panOnScroll: U, panOnScrollSpeed: j, panOnScrollMode: X, panOnDrag: Z, defaultViewport: $, translateExtent: k, minZoom: L, maxZoom: N, onSelectionContextMenu: x, preventScrolling: S, noDragClassName: Kn, noWheelClassName: Gn, noPanClassName: $t, disableKeyboardA11y: Sn },
    R.createElement(
      T_,
      null,
      R.createElement(
        M_,
        { edgeTypes: $e, onEdgeClick: s, onEdgeDoubleClick: a, onlyRenderVisibleElements: B, onEdgeContextMenu: Pe, onEdgeMouseEnter: me, onEdgeMouseMove: Ke, onEdgeMouseLeave: oe, onReconnect: K, onReconnectStart: Oe, onReconnectEnd: Pt, reconnectRadius: Br, defaultMarkerColor: z, noPanClassName: $t, elevateEdgesOnSelect: !!Zn, disableKeyboardA11y: Sn, rfId: Jn },
        R.createElement(A_, { style: h, type: p, component: g, containerStyle: v })
      ),
      R.createElement("div", { className: "react-flow__edgelabel-renderer" }),
      R.createElement(c_, { nodeTypes: jr, onNodeClick: l, onNodeDoubleClick: u, onNodeMouseEnter: c, onNodeMouseMove: f, onNodeMouseLeave: d, onNodeContextMenu: m, selectNodesOnDrag: w, onlyRenderVisibleElements: B, noPanClassName: $t, noDragClassName: Kn, disableKeyboardA11y: Sn, nodeOrigin: _n, nodeExtent: qn, rfId: Jn })
    )
  );
};
Hm.displayName = "GraphView";
var I_ = T.memo(Hm);
const Hu = [
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
  translateExtent: Hu,
  nodeExtent: Hu,
  nodesSelectionActive: !1,
  userSelectionActive: !1,
  userSelectionRect: null,
  connectionNodeId: null,
  connectionHandleId: null,
  connectionHandleType: "source",
  connectionPosition: { x: 0, y: 0 },
  connectionStatus: null,
  connectionMode: Yn.Strict,
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
  onError: sS,
  isValidConnection: void 0
}, D_ = () => _v((e, t) => ({
  ...Gt,
  setNodes: (n) => {
    const { nodeInternals: r, nodeOrigin: o, elevateNodesOnSelect: i } = t();
    e({ nodeInternals: Cs(n, r, o, i) });
  },
  getNodes: () => Array.from(t().nodeInternals.values()),
  setEdges: (n) => {
    const { defaultEdgeOptions: r = {} } = t();
    e({ edges: n.map((o) => ({ ...r, ...o })) });
  },
  setDefaultNodesAndEdges: (n, r) => {
    const o = typeof n < "u", i = typeof r < "u", l = o ? Cs(n, /* @__PURE__ */ new Map(), t().nodeOrigin, t().elevateNodesOnSelect) : /* @__PURE__ */ new Map();
    e({ nodeInternals: l, edges: i ? r : [], hasDefaultNodes: o, hasDefaultEdges: i });
  },
  updateNodeDimensions: (n) => {
    const { onNodesChange: r, nodeInternals: o, fitViewOnInit: i, fitViewOnInitDone: l, fitViewOnInitOptions: s, domNode: u, nodeOrigin: a } = t(), c = u == null ? void 0 : u.querySelector(".react-flow__viewport");
    if (!c)
      return;
    const f = window.getComputedStyle(c), { m22: d } = new window.DOMMatrixReadOnly(f.transform), m = n.reduce((y, _) => {
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
        const h = ja(_.nodeElement);
        !!(h.width && h.height && (p.width !== h.width || p.height !== h.height || _.forceUpdate)) && (o.set(p.id, {
          ...p,
          [he]: {
            ...p[he],
            handleBounds: {
              source: Qf(".source", _.nodeElement, d, a),
              target: Qf(".target", _.nodeElement, d, a)
            }
          },
          ...h
        }), y.push({
          id: p.id,
          type: "dimensions",
          dimensions: h
        }));
      }
      return y;
    }, []);
    Mm(o, a);
    const x = l || i && !l && zm(t, { initial: !0, ...s });
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
        const a = ZS(n, s()), c = Cs(a, o, l, u);
        e({ nodeInternals: c });
      }
      r == null || r(n);
    }
  },
  addSelectedNodes: (n) => {
    const { multiSelectionActive: r, edges: o, getNodes: i } = t();
    let l, s = null;
    r ? l = n.map((u) => en(u, !0)) : (l = gr(i(), n), s = gr(o, [])), Ni({
      changedNodes: l,
      changedEdges: s,
      get: t,
      set: e
    });
  },
  addSelectedEdges: (n) => {
    const { multiSelectionActive: r, edges: o, getNodes: i } = t();
    let l, s = null;
    r ? l = n.map((u) => en(u, !0)) : (l = gr(o, n), s = gr(i(), [])), Ni({
      changedNodes: s,
      changedEdges: l,
      get: t,
      set: e
    });
  },
  unselectNodesAndEdges: ({ nodes: n, edges: r } = {}) => {
    const { edges: o, getNodes: i } = t(), l = n || i(), s = r || o, u = l.map((c) => (c.selected = !1, en(c.id, !1))), a = s.map((c) => en(c.id, !1));
    Ni({
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
    const { edges: n, getNodes: r } = t(), i = r().filter((s) => s.selected).map((s) => en(s.id, !1)), l = n.filter((s) => s.selected).map((s) => en(s.id, !1));
    Ni({
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
}), Object.is), Vm = ({ children: e }) => {
  const t = T.useRef(null);
  return t.current || (t.current = D_()), R.createElement(eS, { value: t.current }, e);
};
Vm.displayName = "ReactFlowProvider";
const Bm = ({ children: e }) => T.useContext(jl) ? R.createElement(R.Fragment, null, e) : R.createElement(Vm, null, e);
Bm.displayName = "ReactFlowWrapper";
const L_ = {
  input: xm,
  default: Ou,
  output: _m,
  group: Ga
}, O_ = {
  default: xl,
  straight: Xa,
  step: Ya,
  smoothstep: Ul,
  simplebezier: Wa
}, F_ = [0, 0], H_ = [15, 15], V_ = { x: 0, y: 0, zoom: 1 }, B_ = {
  width: "100%",
  height: "100%",
  overflow: "hidden",
  position: "relative",
  zIndex: 0
}, Vu = T.forwardRef(({ nodes: e, edges: t, defaultNodes: n, defaultEdges: r, className: o, nodeTypes: i = L_, edgeTypes: l = O_, onNodeClick: s, onEdgeClick: u, onInit: a, onMove: c, onMoveStart: f, onMoveEnd: d, onConnect: m, onConnectStart: x, onConnectEnd: y, onClickConnectStart: _, onClickConnectEnd: p, onNodeMouseEnter: h, onNodeMouseMove: g, onNodeMouseLeave: v, onNodeContextMenu: E, onNodeDoubleClick: C, onNodeDragStart: M, onNodeDrag: P, onNodeDragStop: A, onNodesDelete: I, onEdgesDelete: F, onSelectionChange: B, onSelectionDragStart: V, onSelectionDrag: w, onSelectionDragStop: $, onSelectionContextMenu: k, onSelectionStart: L, onSelectionEnd: N, connectionMode: S = Yn.Strict, connectionLineType: z = rn.Bezier, connectionLineStyle: D, connectionLineComponent: O, connectionLineContainerStyle: U, deleteKeyCode: j = "Backspace", selectionKeyCode: X = "Shift", selectionOnDrag: G = !1, selectionMode: Z = Wo.Full, panActivationKeyCode: ne = "Space", multiSelectionKeyCode: te = wl() ? "Meta" : "Control", zoomActivationKeyCode: ee = wl() ? "Meta" : "Control", snapToGrid: Ne = !1, snapGrid: ve = H_, onlyRenderVisibleElements: Le = !1, selectNodesOnDrag: Pe = !0, nodesDraggable: me, nodesConnectable: Ke, nodesFocusable: oe, nodeOrigin: K = F_, edgesFocusable: Oe, edgesUpdatable: Pt, elementsSelectable: Br, defaultViewport: Kn = V_, minZoom: Gn = 0.5, maxZoom: $t = 2, translateExtent: Zn = Hu, preventScrolling: Sn = !0, nodeExtent: _n, defaultMarkerColor: qn = "#b1b1b7", zoomOnScroll: Jn = !0, zoomOnPinch: jr = !0, panOnScroll: $e = !1, panOnScrollSpeed: ct = 0.5, panOnScrollMode: En = In.Free, zoomOnDoubleClick: kn = !0, panOnDrag: Nn = !0, onPaneClick: Rt, onPaneMouseEnter: _t, onPaneMouseMove: Ur, onPaneMouseLeave: Yl, onPaneScroll: Wr, onPaneContextMenu: Xl, children: Ja, onEdgeContextMenu: Cn, onEdgeDoubleClick: Xm, onEdgeMouseEnter: Qm, onEdgeMouseMove: Km, onEdgeMouseLeave: Gm, onEdgeUpdate: Zm, onEdgeUpdateStart: qm, onEdgeUpdateEnd: Jm, onReconnect: bm, onReconnectStart: e0, onReconnectEnd: t0, reconnectRadius: n0 = 10, edgeUpdaterRadius: r0 = 10, onNodesChange: o0, onEdgesChange: i0, noDragClassName: l0 = "nodrag", noWheelClassName: s0 = "nowheel", noPanClassName: ba = "nopan", fitView: u0 = !1, fitViewOptions: a0, connectOnClick: c0 = !0, attributionPosition: f0, proOptions: d0, defaultEdgeOptions: p0, elevateNodesOnSelect: h0 = !0, elevateEdgesOnSelect: m0 = !1, disableKeyboardA11y: ec = !1, autoPanOnConnect: g0 = !0, autoPanOnNodeDrag: y0 = !0, connectionRadius: v0 = 20, isValidConnection: w0, onError: x0, style: S0, id: tc, nodeDragThreshold: _0, ...E0 }, k0) => {
  const Ql = tc || "1";
  return R.createElement(
    "div",
    { ...E0, style: { ...S0, ...B_ }, ref: k0, className: Te(["react-flow", o]), "data-testid": "rf__wrapper", id: tc },
    R.createElement(
      Bm,
      null,
      R.createElement(I_, { onInit: a, onMove: c, onMoveStart: f, onMoveEnd: d, onNodeClick: s, onEdgeClick: u, onNodeMouseEnter: h, onNodeMouseMove: g, onNodeMouseLeave: v, onNodeContextMenu: E, onNodeDoubleClick: C, nodeTypes: i, edgeTypes: l, connectionLineType: z, connectionLineStyle: D, connectionLineComponent: O, connectionLineContainerStyle: U, selectionKeyCode: X, selectionOnDrag: G, selectionMode: Z, deleteKeyCode: j, multiSelectionKeyCode: te, panActivationKeyCode: ne, zoomActivationKeyCode: ee, onlyRenderVisibleElements: Le, selectNodesOnDrag: Pe, defaultViewport: Kn, translateExtent: Zn, minZoom: Gn, maxZoom: $t, preventScrolling: Sn, zoomOnScroll: Jn, zoomOnPinch: jr, zoomOnDoubleClick: kn, panOnScroll: $e, panOnScrollSpeed: ct, panOnScrollMode: En, panOnDrag: Nn, onPaneClick: Rt, onPaneMouseEnter: _t, onPaneMouseMove: Ur, onPaneMouseLeave: Yl, onPaneScroll: Wr, onPaneContextMenu: Xl, onSelectionContextMenu: k, onSelectionStart: L, onSelectionEnd: N, onEdgeContextMenu: Cn, onEdgeDoubleClick: Xm, onEdgeMouseEnter: Qm, onEdgeMouseMove: Km, onEdgeMouseLeave: Gm, onReconnect: bm ?? Zm, onReconnectStart: e0 ?? qm, onReconnectEnd: t0 ?? Jm, reconnectRadius: n0 ?? r0, defaultMarkerColor: qn, noDragClassName: l0, noWheelClassName: s0, noPanClassName: ba, elevateEdgesOnSelect: m0, rfId: Ql, disableKeyboardA11y: ec, nodeOrigin: K, nodeExtent: _n }),
      R.createElement(PS, { nodes: e, edges: t, defaultNodes: n, defaultEdges: r, onConnect: m, onConnectStart: x, onConnectEnd: y, onClickConnectStart: _, onClickConnectEnd: p, nodesDraggable: me, nodesConnectable: Ke, nodesFocusable: oe, edgesFocusable: Oe, edgesUpdatable: Pt, elementsSelectable: Br, elevateNodesOnSelect: h0, minZoom: Gn, maxZoom: $t, nodeExtent: _n, onNodesChange: o0, onEdgesChange: i0, snapToGrid: Ne, snapGrid: ve, connectionMode: S, translateExtent: Zn, connectOnClick: c0, defaultEdgeOptions: p0, fitView: u0, fitViewOptions: a0, onNodesDelete: I, onEdgesDelete: F, onNodeDragStart: M, onNodeDrag: P, onNodeDragStop: A, onSelectionDrag: w, onSelectionDragStart: V, onSelectionDragStop: $, noPanClassName: ba, nodeOrigin: K, rfId: Ql, autoPanOnConnect: g0, autoPanOnNodeDrag: y0, onError: x0, connectionRadius: v0, isValidConnection: w0, nodeDragThreshold: _0 }),
      R.createElement(zS, { onSelectionChange: B }),
      Ja,
      R.createElement(nS, { proOptions: d0, position: f0 }),
      R.createElement(DS, { rfId: Ql, disableKeyboardA11y: ec })
    )
  );
});
Vu.displayName = "ReactFlow";
const jm = ({ id: e, x: t, y: n, width: r, height: o, style: i, color: l, strokeColor: s, strokeWidth: u, className: a, borderRadius: c, shapeRendering: f, onClick: d, selected: m }) => {
  const { background: x, backgroundColor: y } = i || {}, _ = l || x || y;
  return R.createElement("rect", { className: Te(["react-flow__minimap-node", { selected: m }, a]), x: t, y: n, rx: c, ry: c, width: r, height: o, fill: _, stroke: s, strokeWidth: u, shapeRendering: f, onClick: d ? (p) => d(p, e) : void 0 });
};
jm.displayName = "MiniMapNode";
var j_ = T.memo(jm);
const U_ = (e) => e.nodeOrigin, W_ = (e) => e.getNodes().filter((t) => !t.hidden && t.width && t.height), Ps = (e) => e instanceof Function ? e : () => e;
function Y_({
  nodeStrokeColor: e = "transparent",
  nodeColor: t = "#e2e2e2",
  nodeClassName: n = "",
  nodeBorderRadius: r = 5,
  nodeStrokeWidth: o = 2,
  // We need to rename the prop to be `CapitalCase` so that JSX will render it as
  // a component properly.
  nodeComponent: i = j_,
  onClick: l
}) {
  const s = le(W_, ke), u = le(U_), a = Ps(t), c = Ps(e), f = Ps(n), d = typeof window > "u" || window.chrome ? "crispEdges" : "geometricPrecision";
  return R.createElement(R.Fragment, null, s.map((m) => {
    const { x, y } = Fn(m, u).positionAbsolute;
    return R.createElement(i, { key: m.id, x, y, width: m.width, height: m.height, style: m.style, selected: m.selected, className: f(m), color: a(m), borderRadius: r, strokeColor: c(m), strokeWidth: o, shapeRendering: d, onClick: l, id: m.id });
  }));
}
var X_ = T.memo(Y_);
const Q_ = 200, K_ = 150, G_ = (e) => {
  const t = e.getNodes(), n = {
    x: -e.transform[0] / e.transform[2],
    y: -e.transform[1] / e.transform[2],
    width: e.width / e.transform[2],
    height: e.height / e.transform[2]
  };
  return {
    viewBB: n,
    boundingRect: t.length > 0 ? iS(Wl(t, e.nodeOrigin), n) : n,
    rfId: e.rfId
  };
}, Z_ = "react-flow__minimap-desc";
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
  zoomable: y = !1,
  ariaLabel: _ = "React Flow mini map",
  inversePan: p = !1,
  zoomStep: h = 10,
  offsetScale: g = 5
}) {
  const v = Se(), E = T.useRef(null), { boundingRect: C, viewBB: M, rfId: P } = le(G_, ke), A = (e == null ? void 0 : e.width) ?? Q_, I = (e == null ? void 0 : e.height) ?? K_, F = C.width / A, B = C.height / I, V = Math.max(F, B), w = V * A, $ = V * I, k = g * V, L = C.x - (w - C.width) / 2 - k, N = C.y - ($ - C.height) / 2 - k, S = w + k * 2, z = $ + k * 2, D = `${Z_}-${P}`, O = T.useRef(0);
  O.current = V, T.useEffect(() => {
    if (E.current) {
      const X = ot(E.current), G = (te) => {
        const { transform: ee, d3Selection: Ne, d3Zoom: ve } = v.getState();
        if (te.sourceEvent.type !== "wheel" || !Ne || !ve)
          return;
        const Le = -te.sourceEvent.deltaY * (te.sourceEvent.deltaMode === 1 ? 0.05 : te.sourceEvent.deltaMode ? 1 : 2e-3) * h, Pe = ee[2] * Math.pow(2, Le);
        ve.scaleTo(Ne, Pe);
      }, Z = (te) => {
        const { transform: ee, d3Selection: Ne, d3Zoom: ve, translateExtent: Le, width: Pe, height: me } = v.getState();
        if (te.sourceEvent.type !== "mousemove" || !Ne || !ve)
          return;
        const Ke = O.current * Math.max(1, ee[2]) * (p ? -1 : 1), oe = {
          x: ee[0] - te.sourceEvent.movementX * Ke,
          y: ee[1] - te.sourceEvent.movementY * Ke
        }, K = [
          [0, 0],
          [Pe, me]
        ], Oe = Vt.translate(oe.x, oe.y).scale(ee[2]), Pt = ve.constrain()(Oe, K, Le);
        ve.transform(Ne, Pt);
      }, ne = Jh().on("zoom", x ? Z : null).on("zoom.wheel", y ? G : null);
      return X.call(ne), () => {
        X.on("zoom", null);
      };
    }
  }, [x, y, p, h]);
  const U = d ? (X) => {
    const G = ht(X);
    d(X, { x: G[0], y: G[1] });
  } : void 0, j = m ? (X, G) => {
    const Z = v.getState().nodeInternals.get(G);
    m(X, Z);
  } : void 0;
  return R.createElement(
    Ba,
    { position: f, style: e, className: Te(["react-flow__minimap", t]), "data-testid": "rf__minimap" },
    R.createElement(
      "svg",
      { width: A, height: I, viewBox: `${L} ${N} ${S} ${z}`, role: "img", "aria-labelledby": D, ref: E, onClick: U },
      _ && R.createElement("title", { id: D }, _),
      R.createElement(X_, { onClick: j, nodeColor: r, nodeStrokeColor: n, nodeBorderRadius: i, nodeClassName: o, nodeStrokeWidth: l, nodeComponent: s }),
      R.createElement("path", { className: "react-flow__minimap-mask", d: `M${L - k},${N - k}h${S + k * 2}v${z + k * 2}h${-S - k * 2}z
        M${M.x},${M.y}h${M.width}v${M.height}h${-M.width}z`, fill: u, fillRule: "evenodd", stroke: a, strokeWidth: c, pointerEvents: "none" })
    )
  );
}
Um.displayName = "MiniMap";
var q_ = T.memo(Um);
function J_() {
  return R.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 32" },
    R.createElement("path", { d: "M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" })
  );
}
function b_() {
  return R.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 5" },
    R.createElement("path", { d: "M0 0h32v4.2H0z" })
  );
}
function eE() {
  return R.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 30" },
    R.createElement("path", { d: "M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" })
  );
}
function tE() {
  return R.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32" },
    R.createElement("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z" })
  );
}
function nE() {
  return R.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32" },
    R.createElement("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z" })
  );
}
const co = ({ children: e, className: t, ...n }) => R.createElement("button", { type: "button", className: Te(["react-flow__controls-button", t]), ...n }, e);
co.displayName = "ControlButton";
const rE = (e) => ({
  isInteractive: e.nodesDraggable || e.nodesConnectable || e.elementsSelectable,
  minZoomReached: e.transform[2] <= e.minZoom,
  maxZoomReached: e.transform[2] >= e.maxZoom
}), Wm = ({ style: e, showZoom: t = !0, showFitView: n = !0, showInteractive: r = !0, fitViewOptions: o, onZoomIn: i, onZoomOut: l, onFitView: s, onInteractiveChange: u, className: a, children: c, position: f = "bottom-left" }) => {
  const d = Se(), [m, x] = T.useState(!1), { isInteractive: y, minZoomReached: _, maxZoomReached: p } = le(rE, ke), { zoomIn: h, zoomOut: g, fitView: v } = Za();
  if (T.useEffect(() => {
    x(!0);
  }, []), !m)
    return null;
  const E = () => {
    h(), i == null || i();
  }, C = () => {
    g(), l == null || l();
  }, M = () => {
    v(o), s == null || s();
  }, P = () => {
    d.setState({
      nodesDraggable: !y,
      nodesConnectable: !y,
      elementsSelectable: !y
    }), u == null || u(!y);
  };
  return R.createElement(
    Ba,
    { className: Te(["react-flow__controls", a]), position: f, style: e, "data-testid": "rf__controls" },
    t && R.createElement(
      R.Fragment,
      null,
      R.createElement(
        co,
        { onClick: E, className: "react-flow__controls-zoomin", title: "zoom in", "aria-label": "zoom in", disabled: p },
        R.createElement(J_, null)
      ),
      R.createElement(
        co,
        { onClick: C, className: "react-flow__controls-zoomout", title: "zoom out", "aria-label": "zoom out", disabled: _ },
        R.createElement(b_, null)
      )
    ),
    n && R.createElement(
      co,
      { className: "react-flow__controls-fitview", onClick: M, title: "fit view", "aria-label": "fit view" },
      R.createElement(eE, null)
    ),
    r && R.createElement(co, { className: "react-flow__controls-interactive", onClick: P, title: "toggle interactivity", "aria-label": "toggle interactivity" }, y ? R.createElement(nE, null) : R.createElement(tE, null)),
    c
  );
};
Wm.displayName = "Controls";
var td = T.memo(Wm), wt;
(function(e) {
  e.Lines = "lines", e.Dots = "dots", e.Cross = "cross";
})(wt || (wt = {}));
function oE({ color: e, dimensions: t, lineWidth: n }) {
  return R.createElement("path", { stroke: e, strokeWidth: n, d: `M${t[0] / 2} 0 V${t[1]} M0 ${t[1] / 2} H${t[0]}` });
}
function iE({ color: e, radius: t }) {
  return R.createElement("circle", { cx: t, cy: t, r: t, fill: e });
}
const lE = {
  [wt.Dots]: "#91919a",
  [wt.Lines]: "#eee",
  [wt.Cross]: "#e2e2e2"
}, sE = {
  [wt.Dots]: 1,
  [wt.Lines]: 1,
  [wt.Cross]: 6
}, uE = (e) => ({ transform: e.transform, patternId: `pattern-${e.rfId}` });
function Ym({
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
  const a = T.useRef(null), { transform: c, patternId: f } = le(uE, ke), d = l || lE[t], m = r || sE[t], x = t === wt.Dots, y = t === wt.Cross, _ = Array.isArray(n) ? n : [n, n], p = [_[0] * c[2] || 1, _[1] * c[2] || 1], h = m * c[2], g = y ? [h, h] : p, v = x ? [h / i, h / i] : [g[0] / i, g[1] / i];
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
    R.createElement("pattern", { id: f + e, x: c[0] % p[0], y: c[1] % p[1], width: p[0], height: p[1], patternUnits: "userSpaceOnUse", patternTransform: `translate(-${v[0]},-${v[1]})` }, x ? R.createElement(iE, { color: d, radius: h / i }) : R.createElement(oE, { dimensions: g, color: d, lineWidth: o })),
    R.createElement("rect", { x: "0", y: "0", width: "100%", height: "100%", fill: `url(#${f + e})` })
  );
}
Ym.displayName = "Background";
var nd = T.memo(Ym);
const $s = { green: "#34c759", orange: "#ff8c1a", cyan: "#00c7ff", red: "#ff3b30", violet: "#7d42ff", magenta: "#ff2d92", blue: "#2f6bff", yellow: "#ffd60a", pink: "#ff6da8" };
function aE({ data: e, selected: t }) {
  return /* @__PURE__ */ W.jsxs("article", { className: `idea-node ${t ? "is-selected" : ""}`, style: { "--idea-accent": e.color }, children: [
    /* @__PURE__ */ W.jsxs("span", { children: [
      String(e.index).padStart(2, "0"),
      " / ",
      e.domain
    ] }),
    /* @__PURE__ */ W.jsx("strong", { children: e.title }),
    /* @__PURE__ */ W.jsx("small", { children: "Independent surrogate" })
  ] });
}
function cE({ data: e }) {
  return /* @__PURE__ */ W.jsxs("article", { className: "step-node", style: { "--idea-accent": e.color }, children: [
    /* @__PURE__ */ W.jsx(Or, { type: "target", position: Q.Left }),
    /* @__PURE__ */ W.jsx("span", { children: String(e.index).padStart(2, "0") }),
    /* @__PURE__ */ W.jsx("strong", { children: e.label }),
    /* @__PURE__ */ W.jsx(Or, { type: "source", position: Q.Right })
  ] });
}
function Zt({ label: e, children: t }) {
  return !t || Array.isArray(t) && !t.length ? null : /* @__PURE__ */ W.jsxs("section", { className: "algorithm-field", children: [
    /* @__PURE__ */ W.jsx("span", { children: e }),
    Array.isArray(t) ? /* @__PURE__ */ W.jsx("ul", { children: t.map((n) => /* @__PURE__ */ W.jsx("li", { children: n }, n)) }) : /* @__PURE__ */ W.jsx("p", { children: t })
  ] });
}
const rd = { idea: aE, step: cE };
function fE({ concepts: e }) {
  var d, m, x;
  const [t, n] = T.useState((d = e[0]) == null ? void 0 : d.id), [r, o] = T.useState(0), i = e.find((y) => y.id === t) || e[0];
  T.useEffect(() => o(0), [t]);
  const l = T.useMemo(() => e.map((y, _) => ({ id: y.id, type: "idea", position: { x: _ % 3 * 310, y: Math.floor(_ / 3) * 175 }, data: { ...y, color: $s[y.accent] || "#00c7ff" } })), [e]), s = T.useMemo(() => i.flow.map((y, _) => ({ id: `${i.id}-${_}`, type: "step", position: { x: _ * 225, y: _ % 2 ? 150 : 25 }, data: { label: y, index: _ + 1, color: $s[i.accent] || "#00c7ff" } })), [i]), u = T.useMemo(() => i.flow.slice(1).map((y, _) => ({ id: `${i.id}-edge-${_}`, source: `${i.id}-${_}`, target: `${i.id}-${_ + 1}`, type: "step", markerEnd: { type: Yo.ArrowClosed, color: "#f2f7ff" }, style: { stroke: "#f2f7ff", strokeWidth: 1.2 } })), [i]), a = i.functions[r], c = r === 0 ? (i.inputs || []).join(" · ") : i.flow[r - 1], f = r === i.flow.length - 1 ? (i.outputs || []).join(" · ") : i.flow[r + 1];
  return /* @__PURE__ */ W.jsxs("div", { className: "brix-flow-system", children: [
    /* @__PURE__ */ W.jsxs("section", { className: "brix-flow-map", children: [
      /* @__PURE__ */ W.jsxs("header", { children: [
        /* @__PURE__ */ W.jsx("span", { children: "01 / Idea index" }),
        /* @__PURE__ */ W.jsx("strong", { children: "Select an independent surrogate" })
      ] }),
      /* @__PURE__ */ W.jsx("div", { className: "brix-flow-canvas", children: /* @__PURE__ */ W.jsxs(Vu, { nodes: l, edges: [], nodeTypes: rd, onNodeClick: (y, _) => n(_.id), fitView: !0, minZoom: 0.55, maxZoom: 1.35, proOptions: { hideAttribution: !0 }, children: [
        /* @__PURE__ */ W.jsx(nd, { variant: "dots", gap: 22, size: 1.2, color: "#343a45" }),
        /* @__PURE__ */ W.jsx(td, { showInteractive: !1 }),
        /* @__PURE__ */ W.jsx(q_, { nodeColor: (y) => y.data.color, maskColor: "rgba(5,7,11,.78)" })
      ] }) })
    ] }),
    /* @__PURE__ */ W.jsxs("section", { className: "brix-flow-detail", style: { "--idea-accent": $s[i.accent] || "#00c7ff" }, children: [
      /* @__PURE__ */ W.jsxs("div", { className: "brix-flow-copy", children: [
        /* @__PURE__ */ W.jsxs("span", { children: [
          "02 / ",
          i.domain
        ] }),
        /* @__PURE__ */ W.jsx("h3", { children: i.title }),
        /* @__PURE__ */ W.jsx("p", { children: i.summary }),
        /* @__PURE__ */ W.jsxs("dl", { children: [
          /* @__PURE__ */ W.jsx("dt", { children: "Maturity" }),
          /* @__PURE__ */ W.jsx("dd", { children: i.maturity }),
          /* @__PURE__ */ W.jsx("dt", { children: "License boundary" }),
          /* @__PURE__ */ W.jsx("dd", { children: i.license }),
          /* @__PURE__ */ W.jsx("dt", { children: "Code status" }),
          /* @__PURE__ */ W.jsx("dd", { children: (m = i.code) != null && m.repository ? /* @__PURE__ */ W.jsxs("a", { href: i.code.repository, children: [
            i.code.status,
            " · open repository"
          ] }) : `${((x = i.code) == null ? void 0 : x.status) || "planned"} · repository link not assigned` })
        ] })
      ] }),
      /* @__PURE__ */ W.jsx("div", { className: "brix-step-canvas", children: /* @__PURE__ */ W.jsxs(Vu, { nodes: s, edges: u, nodeTypes: rd, onNodeClick: (y, _) => o(Number(_.id.split("-").at(-1))), fitView: !0, minZoom: 0.55, maxZoom: 1.35, proOptions: { hideAttribution: !0 }, children: [
        /* @__PURE__ */ W.jsx(nd, { variant: "dots", gap: 22, size: 1.2, color: "#343a45" }),
        /* @__PURE__ */ W.jsx(td, { showInteractive: !1 })
      ] }) }),
      /* @__PURE__ */ W.jsxs("div", { className: "function-inspector", children: [
        /* @__PURE__ */ W.jsxs("header", { children: [
          /* @__PURE__ */ W.jsx("span", { children: "03 / Algorithm function" }),
          /* @__PURE__ */ W.jsx("strong", { children: i.flow[r] })
        ] }),
        /* @__PURE__ */ W.jsxs("div", { className: "function-signature", children: [
          /* @__PURE__ */ W.jsxs("code", { children: [
            a.name,
            "()"
          ] }),
          /* @__PURE__ */ W.jsx("p", { children: a.role }),
          /* @__PURE__ */ W.jsxs("dl", { children: [
            /* @__PURE__ */ W.jsx("dt", { children: "Receives" }),
            /* @__PURE__ */ W.jsx("dd", { children: c }),
            /* @__PURE__ */ W.jsx("dt", { children: "Returns / advances to" }),
            /* @__PURE__ */ W.jsx("dd", { children: f })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ W.jsxs("div", { className: "algorithm-contract", children: [
        /* @__PURE__ */ W.jsxs("header", { children: [
          /* @__PURE__ */ W.jsx("span", { children: "04 / Public algorithm contract" }),
          /* @__PURE__ */ W.jsx("strong", { children: "Architecture disclosed. Sensitive implementation retained." })
        ] }),
        /* @__PURE__ */ W.jsxs("div", { className: "algorithm-grid", children: [
          /* @__PURE__ */ W.jsx(Zt, { label: "Upstream systems", children: i.upstream }),
          /* @__PURE__ */ W.jsx(Zt, { label: "Inputs", children: i.inputs }),
          /* @__PURE__ */ W.jsx(Zt, { label: "Outputs", children: i.outputs }),
          /* @__PURE__ */ W.jsx(Zt, { label: "Scientific method", children: i.method }),
          /* @__PURE__ */ W.jsx(Zt, { label: "Uncertainty", children: i.uncertainty }),
          /* @__PURE__ */ W.jsx(Zt, { label: "Validation", children: i.validation }),
          /* @__PURE__ */ W.jsx(Zt, { label: "Evidence & provenance", children: i.evidence }),
          /* @__PURE__ */ W.jsx(Zt, { label: "Protected boundary", children: i.disclosure })
        ] })
      ] })
    ] })
  ] });
}
const od = document.getElementById("brix-flow-root"), id = document.getElementById("brix-flow-data");
od && id && wh(od).render(/* @__PURE__ */ W.jsx(fE, { concepts: JSON.parse(id.textContent) }));
