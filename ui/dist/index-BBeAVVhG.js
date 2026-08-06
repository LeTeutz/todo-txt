var yf = Object.defineProperty;
var xf = (r, e, t) => e in r ? yf(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var Et = (r, e, t) => xf(r, typeof e != "symbol" ? e + "" : e, t);
import { jsxs as C, jsx as y, Fragment as bf } from "react/jsx-runtime";
import { forwardRef as tl, createElement as ns, useState as q, useEffect as U, useCallback as P, useRef as z, useMemo as Qe, Fragment as wf, useImperativeHandle as vf } from "react";
import { useChatLauncher as kf } from "@kirocrew/app-sdk";
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Sf = (r) => r.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Xc = (...r) => r.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim();
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var Cf = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Af = tl(
  ({
    color: r = "currentColor",
    size: e = 24,
    strokeWidth: t = 2,
    absoluteStrokeWidth: n,
    className: i = "",
    children: o,
    iconNode: s,
    ...l
  }, a) => ns(
    "svg",
    {
      ref: a,
      ...Cf,
      width: e,
      height: e,
      stroke: r,
      strokeWidth: n ? Number(t) * 24 / Number(e) : t,
      className: Xc("lucide", i),
      ...l
    },
    [
      ...s.map(([c, h]) => ns(c, h)),
      ...Array.isArray(o) ? o : [o]
    ]
  )
);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ye = (r, e) => {
  const t = tl(
    ({ className: n, ...i }, o) => ns(Af, {
      ref: o,
      iconNode: e,
      className: Xc(`lucide-${Sf(r)}`, n),
      ...i
    })
  );
  return t.displayName = `${r}`, t;
};
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mf = ye("Archive", [
  ["rect", { width: "20", height: "5", x: "2", y: "3", rx: "1", key: "1wp1u1" }],
  ["path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8", key: "1s80jp" }],
  ["path", { d: "M10 12h4", key: "a56b0p" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Df = ye("CalendarClock", [
  ["path", { d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5", key: "1osxxc" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M3 10h5", key: "r794hk" }],
  ["path", { d: "M17.5 17.5 16 16.3V14", key: "akvzfd" }],
  ["circle", { cx: "16", cy: "16", r: "6", key: "qoo3c4" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Tf = ye("Calendar", [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Zc = ye("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ql = ye("ChevronDown", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ef = ye("CircleHelp", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Of = ye("CopyPlus", [
  ["line", { x1: "15", x2: "15", y1: "12", y2: "18", key: "1p7wdc" }],
  ["line", { x1: "12", x2: "18", y1: "15", y2: "15", key: "1nscbv" }],
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Lf = ye("Copy", [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Rf = ye("Download", [
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["polyline", { points: "7 10 12 15 17 10", key: "2ggqvy" }],
  ["line", { x1: "12", x2: "12", y1: "15", y2: "3", key: "1vk2je" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Yl = ye("EyeOff", [
  [
    "path",
    {
      d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
      key: "ct8e1f"
    }
  ],
  ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
  [
    "path",
    {
      d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
      key: "13bj9a"
    }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Nf = ye("Highlighter", [
  ["path", { d: "m9 11-6 6v3h9l3-3", key: "1a3l36" }],
  ["path", { d: "m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4", key: "14a9rk" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Gl = ye("History", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Bf = ye("ListFilter", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M7 12h10", key: "b7w52i" }],
  ["path", { d: "M10 18h4", key: "1ulq68" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const If = ye("Maximize2", [
  ["polyline", { points: "15 3 21 3 21 9", key: "mznyad" }],
  ["polyline", { points: "9 21 3 21 3 15", key: "1avn1i" }],
  ["line", { x1: "21", x2: "14", y1: "3", y2: "10", key: "ota7mn" }],
  ["line", { x1: "3", x2: "10", y1: "21", y2: "14", key: "1atl0r" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pf = ye("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const $f = ye("Minimize2", [
  ["polyline", { points: "4 14 10 14 10 20", key: "11kfnr" }],
  ["polyline", { points: "20 10 14 10 14 4", key: "rlmsce" }],
  ["line", { x1: "14", x2: "21", y1: "10", y2: "3", key: "o5lafz" }],
  ["line", { x1: "3", x2: "10", y1: "21", y2: "14", key: "1atl0r" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ff = ye("MousePointer2", [
  [
    "path",
    {
      d: "M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z",
      key: "edeuup"
    }
  ]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Hf = ye("NotebookPen", [
  ["path", { d: "M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4", key: "re6nr2" }],
  ["path", { d: "M2 6h4", key: "aawbzj" }],
  ["path", { d: "M2 10h4", key: "l0bgd4" }],
  ["path", { d: "M2 14h4", key: "1gsvsf" }],
  ["path", { d: "M2 18h4", key: "1bu2t1" }],
  [
    "path",
    {
      d: "M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z",
      key: "pqwjuv"
    }
  ]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Wf = ye("Pencil", [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zf = ye("RefreshCw", [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Vf = ye("RotateCcw", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const nl = ye("Sparkles", [
  [
    "path",
    {
      d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      key: "4pj2yx"
    }
  ],
  ["path", { d: "M20 3v4", key: "1olli1" }],
  ["path", { d: "M22 5h-4", key: "1gvqau" }],
  ["path", { d: "M4 17v2", key: "vumght" }],
  ["path", { d: "M5 18H3", key: "zchphs" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Qc = ye("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const _f = ye("TriangleAlert", [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
]);
/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Oo = ye("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]), rl = "todotxt.syntaxHighlight", zi = "todotxt-syntax-highlight-changed", Vi = !0;
function eh(r) {
  if (typeof r != "string") return Vi;
  const e = r.trim().toLowerCase();
  return e === "true" ? !0 : e === "false" ? !1 : Vi;
}
function Jl() {
  try {
    return typeof window > "u" || !window.localStorage ? Vi : eh(
      window.localStorage.getItem(rl)
    );
  } catch {
    return Vi;
  }
}
function Xl(r) {
  try {
    if (typeof window > "u" || !window.localStorage) return;
    window.localStorage.setItem(
      rl,
      r ? "true" : "false"
    );
  } catch {
  }
  try {
    if (typeof window > "u") return;
    typeof CustomEvent == "function" ? window.dispatchEvent(
      new CustomEvent(zi, {
        detail: { enabled: r }
      })
    ) : typeof window.Event == "function" && window.dispatchEvent(
      new Event(zi)
    );
  } catch {
  }
}
function jf() {
  const [r, e] = q(
    () => Jl()
  );
  U(() => {
    const i = () => e(Jl());
    return window.addEventListener(
      zi,
      i
    ), () => window.removeEventListener(
      zi,
      i
    );
  }, []), U(() => {
    const i = (o) => {
      o.key === rl && e(eh(o.newValue));
    };
    return window.addEventListener("storage", i), () => window.removeEventListener("storage", i);
  }, []);
  const t = P((i) => {
    Xl(i), e(i);
  }, []), n = P(() => {
    e((i) => {
      const o = !i;
      return Xl(o), o;
    });
  }, []);
  return { enabled: r, setEnabled: t, toggle: n };
}
const $r = /^\(([A-Z])\)\s/, Zl = /^(\d{4}-\d{2}-\d{2})(?=\s|$)/, th = /^x /, Kf = /^x\s+(\d{4}-\d{2}-\d{2})(?:\s+|$)/;
function xt(r) {
  return th.test(r);
}
function _i(r) {
  if (xt(r)) return null;
  const e = r.match($r);
  return e ? e[1] : null;
}
function uo(r, e) {
  if (r.trim() === "") return r;
  if (xt(r)) {
    const l = r.match(Kf);
    let a = l ? r.slice(l[0].length) : r.replace(th, "");
    const c = a.match(/(?:^|\s)pri:([A-Z])(?=\s|$)/);
    if (c) {
      const h = a.endsWith("\r") ? "\r" : "";
      a = a.replace(/(^|\s)pri:[A-Z](?=\s|$)/, "$1").replace(/\s+$/, "").replace(/\s{2,}/g, " ") + h, a = Gt(a, c[1]);
    }
    return a;
  }
  const t = r.match($r), n = t ? t[1] : null, i = r.endsWith("\r") ? "\r" : "", o = (i ? r.slice(0, -1) : r).replace($r, ""), s = `x ${e} ${o}`;
  return n ? `${s} pri:${n}${i}` : s + i;
}
function Gt(r, e) {
  if (r.trim() === "" || xt(r))
    return r;
  const t = r.replace($r, "");
  if (!e)
    return t;
  const n = e.toUpperCase();
  return /^[A-Z]$/.test(n) ? `(${n}) ${t}` : t;
}
function il(r, e) {
  if (r.trim() === "" || xt(r))
    return r;
  const t = r.match($r);
  if (t) {
    const n = r.slice(t[0].length);
    return Zl.test(n) ? r : `${t[0]}${e} ${n}`;
  }
  return Zl.test(r) ? r : `${e} ${r}`;
}
function Uf(r) {
  const e = r.value, t = r.selectionStart ?? 0, n = r.selectionEnd ?? t, i = Math.max(0, Math.min(e.length, t));
  let o = Math.max(i, Math.min(e.length, n));
  o > i && o > 0 && e[o - 1] === `
` && (o -= 1);
  let s = i;
  for (; s > 0 && e[s - 1] !== `
`; )
    s -= 1;
  let l = o;
  for (; l < e.length && e[l] !== `
`; )
    l += 1;
  return { start: s, end: l };
}
const qf = /^\(([A-Z])\)\s/, Yf = /(?:^|\s)pri:([A-Za-z])(?=\s|$)/, Gf = /(?:^|\s)due:(\d{4}-\d{2}-\d{2})(?=\s|$)/i, Jf = /^<=(\d{1,5})d?$/, Xf = /* @__PURE__ */ new Set(["clear", "off", "none", "reset"]);
function Zf(r) {
  return r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ji(r) {
  return String(r).padStart(2, "0");
}
function Fr() {
  const r = /* @__PURE__ */ new Date();
  return `${r.getFullYear()}-${ji(r.getMonth() + 1)}-${ji(r.getDate())}`;
}
function Wn(r, e) {
  const t = /^(\d{4})-(\d{2})-(\d{2})$/.exec(r);
  if (!t) throw new Error(`addDaysIso: expected YYYY-MM-DD, got "${r}"`);
  const n = Date.UTC(Number(t[1]), Number(t[2]) - 1, Number(t[3])), i = new Date(n + e * 864e5);
  return `${i.getUTCFullYear()}-${ji(i.getUTCMonth() + 1)}-${ji(i.getUTCDate())}`;
}
function Qf(r) {
  return Xf.has(r.trim().toLowerCase());
}
function ol(r) {
  const e = /^(\d{4})-(\d{2})-(\d{2})$/.exec(r);
  if (!e) return !1;
  const [t, n, i] = [Number(e[1]), Number(e[2]), Number(e[3])];
  if (n < 1 || n > 12 || i < 1 || i > 31) return !1;
  const o = new Date(Date.UTC(t, n - 1, i));
  return o.getUTCFullYear() === t && o.getUTCMonth() === n - 1 && o.getUTCDate() === i;
}
function nh(r) {
  return r.trim() !== "";
}
function ep(r, e, t) {
  const n = r.trim().toUpperCase();
  if (/^[A-Z]$/.test(n))
    return { kind: "priority", negate: e, raw: t, lo: n, hi: n };
  const i = /^([A-Z])-([A-Z])$/.exec(n);
  if (i) {
    const [, o, s] = i;
    if (o > s)
      throw new Error(
        `pri: range "${r}" is reversed — did you mean pri:${s}-${o}?`
      );
    return { kind: "priority", negate: e, raw: t, lo: o, hi: s };
  }
  throw new Error(
    `pri: expected a letter or a range (pri:A, pri:A-C) — got "${r}"`
  );
}
function tp(r, e, t) {
  const n = r.trim().toLowerCase();
  if (n === "today") return { kind: "due", negate: e, raw: t, mode: "today", days: 0 };
  if (n === "overdue")
    return { kind: "due", negate: e, raw: t, mode: "overdue", days: 0 };
  const i = Jf.exec(n);
  if (i)
    return {
      kind: "due",
      negate: e,
      raw: t,
      mode: "within",
      days: Number.parseInt(i[1], 10)
    };
  throw new Error(
    `due: expected today, overdue, or <=Nd (e.g. due:<=7d) — got "${r}"`
  );
}
function np(r) {
  let e = !1, t = r;
  if (t.startsWith("-") && (e = !0, t = t.slice(1), t === ""))
    throw new Error('"-" is not a term — negate something, e.g. -@waiting');
  if (t.startsWith("@") && t.length > 1)
    return { kind: "context", negate: e, raw: r, value: t.slice(1) };
  if (t.startsWith("+") && t.length > 1)
    return { kind: "project", negate: e, raw: r, value: t.slice(1) };
  const n = /^pri:(.*)$/i.exec(t);
  if (n) return ep(n[1], e, r);
  const i = /^due:(.*)$/i.exec(t);
  return i ? tp(i[1], e, r) : { kind: "text", negate: e, raw: r, value: t };
}
function rh(r) {
  const e = (r ?? "").trim().split(/\s+/).filter((t) => t.length > 0);
  if (e.length === 0)
    throw new Error(
      'an expression is required — try @home, +proj, pri:A-C, due:overdue, or "filter clear"'
    );
  return { source: e.join(" "), terms: e.map(np) };
}
function rs(r) {
  try {
    return rh(r);
  } catch {
    return null;
  }
}
function Ql(r, e) {
  return new RegExp(`(^|\\s)${Zf(e)}(?=\\s|$)`, "i").test(r);
}
function rp(r) {
  const e = qf.exec(r);
  if (e) return e[1];
  const t = Yf.exec(r);
  return t ? t[1].toUpperCase() : null;
}
function sl(r) {
  const e = Gf.exec(r);
  return e ? e[1] : null;
}
function ip(r, e, t) {
  switch (e.kind) {
    case "context":
      return Ql(r, `@${e.value}`);
    case "project":
      return Ql(r, `+${e.value}`);
    case "priority": {
      const n = rp(r);
      return n !== null && n >= e.lo && n <= e.hi;
    }
    case "due": {
      const n = sl(r);
      return n === null || !ol(n) ? !1 : e.mode === "today" ? n === t : e.mode === "overdue" ? n < t : n <= Wn(t, e.days);
    }
    case "text":
      return r.toLowerCase().includes(e.value.toLowerCase());
  }
}
function ih(r, e, t = Fr()) {
  for (const n of e.terms) {
    const i = ip(r, n, t);
    if (n.negate ? i : !i) return !1;
  }
  return !0;
}
function ea(r, e, t = Fr()) {
  let n = 0, i = 0;
  for (const o of r.split(`
`))
    nh(o) && (i += 1, (e === null || ih(o, e, t)) && (n += 1));
  return { matched: n, total: i };
}
const is = "todo-txt.filter.v1";
function op() {
  try {
    const r = localStorage.getItem(is);
    if (r === null || r.trim() === "") return null;
    const e = rs(r);
    return e === null ? null : e.source;
  } catch {
    return null;
  }
}
function sp(r) {
  try {
    r === null ? localStorage.removeItem(is) : localStorage.setItem(is, r);
  } catch {
  }
}
const lp = /(?:^|\s)t:(\d{4}-\d{2}-\d{2})(?=\s|$)/i;
function oh(r) {
  const e = lp.exec(r);
  return e ? e[1] : null;
}
function sh(r, e) {
  const t = oh(r);
  return t !== null && ol(t) && t > e;
}
function lh(r) {
  return r.trim() !== "";
}
function ta(r, e, t) {
  let n = 0, i = 0;
  for (const o of r.split(`
`))
    lh(o) && (i += 1, e === "hide" && sh(o, t) && (n += 1));
  return { hidden: n, total: i };
}
const ap = /* @__PURE__ */ new Set(["hide", "hidden", "on", "yes", "true", "1"]), cp = /* @__PURE__ */ new Set(["show", "shown", "off", "no", "false", "0", "all", "clear"]), hp = /* @__PURE__ */ new Set(["toggle", "flip"]);
function dp(r) {
  const e = (r ?? "").trim().toLowerCase();
  if (e === "" || hp.has(e)) return "toggle";
  if (ap.has(e)) return "hide";
  if (cp.has(e)) return "show";
  throw new Error(
    `expected hide or show (or no argument to toggle) — got "${r}"`
  );
}
const os = "todo-txt.threshold.v1";
function up() {
  try {
    return localStorage.getItem(os) === "hide" ? "hide" : "show";
  } catch {
    return "show";
  }
}
function fp(r) {
  try {
    r === "hide" ? localStorage.setItem(os, "hide") : localStorage.removeItem(os);
  } catch {
  }
}
const pp = /(?:^|\s)rec:(\S+)(?=\s|$)/i, mp = /^(\+?)(\d{1,4})([dwmyb]?)$/i, gp = /^(\d{4}-\d{2}-\d{2})(\s+|$)/, yp = /^\([A-Z]\)\s/, xp = 864e5;
function na(r) {
  return String(r).padStart(2, "0");
}
function Ki(r) {
  const e = /^(\d{4})-(\d{2})-(\d{2})$/.exec(r);
  if (!e) throw new Error(`expected YYYY-MM-DD, got "${r}"`);
  return { y: Number(e[1]), m: Number(e[2]), d: Number(e[3]) };
}
function bp(r, e) {
  return new Date(Date.UTC(r, e, 0)).getUTCDate();
}
function wp(r, e) {
  const t = Ki(r), n = Ki(e), i = Date.UTC(t.y, t.m - 1, t.d), o = Date.UTC(n.y, n.m - 1, n.d);
  return Math.round((o - i) / xp);
}
function ra(r, e) {
  const { y: t, m: n, d: i } = Ki(r), o = t * 12 + (n - 1) + e, s = Math.floor(o / 12), l = (o % 12 + 12) % 12 + 1;
  return `${String(s).padStart(4, "0")}-${na(l)}-${na(
    Math.min(i, bp(s, l))
  )}`;
}
function vp(r) {
  const { y: e, m: t, d: n } = Ki(r), i = new Date(Date.UTC(e, t - 1, n)).getUTCDay();
  return i === 0 || i === 6;
}
function kp(r, e) {
  let t = r;
  for (let n = 0; n < e; n += 1)
    for (t = Wn(t, 1); vp(t); ) t = Wn(t, 1);
  return t;
}
function Sp(r, e) {
  switch (e.unit) {
    case "d":
      return Wn(r, e.count);
    case "w":
      return Wn(r, e.count * 7);
    case "m":
      return ra(r, e.count);
    case "y":
      return ra(r, e.count * 12);
    case "b":
      return kp(r, e.count);
  }
}
function Cp(r) {
  const e = mp.exec(r.trim());
  if (!e) return null;
  const t = Number.parseInt(e[2], 10);
  if (!Number.isInteger(t) || t < 1) return null;
  const n = e[3] === "" ? "d" : e[3].toLowerCase();
  return { raw: r.trim(), strict: e[1] === "+", count: t, unit: n };
}
function Ap(r) {
  const e = pp.exec(r);
  return e ? Cp(e[1]) : null;
}
function ia(r, e, t) {
  const n = new RegExp(`(^|\\s)(${e}:)\\d{4}-\\d{2}-\\d{2}(?=\\s|$)`, "i");
  return r.replace(n, `$1$2${t}`);
}
function Mp(r) {
  const e = yp.exec(r), t = e ? e[0] : "", n = r.slice(t.length), i = gp.exec(n);
  return i ? t + n.slice(i[0].length) : r;
}
function ah(r, e) {
  if (r.trim() === "" || xt(r)) return null;
  const t = Ap(r);
  if (t === null) return null;
  const n = sl(r), i = oh(r), o = n ?? i, s = t.strict ? o ?? e : e, l = Sp(s, t), a = o === null ? 0 : wp(o, l);
  let c = r;
  return n !== null && (c = ia(c, "due", Wn(n, a))), i !== null && (c = ia(c, "t", Wn(i, a))), il(Mp(c), e);
}
function ss(r, e) {
  const t = ah(r, e), n = uo(r, e);
  return t === null ? n : `${n}
${t}`;
}
function Nn(r, e = /* @__PURE__ */ new Date()) {
  const t = new Date(e.getFullYear(), e.getMonth(), e.getDate());
  t.setDate(t.getDate() + r);
  const n = (i) => String(i).padStart(2, "0");
  return `${t.getFullYear()}-${n(t.getMonth() + 1)}-${n(t.getDate())}`;
}
function Dp(r = /* @__PURE__ */ new Date()) {
  const e = Nn(0, r);
  return [
    `${e} todo.txt — a plain-text format for tasks`,
    `(A) ${e} ship the feature +kirocrew @work due:${Nn(3, r)}`,
    `(B) ${e} write tests for the new command palette +kirocrew @work`,
    `(C) ${e} clean up garage @home`,
    // Completed yesterday, created the day before: a done line carrying both
    // dates, which is what a done.txt entry looks like.
    `x ${Nn(-1, r)} ${Nn(-2, r)} pay the electric bill +home @admin`,
    `${e} call the dentist @phone @admin due:${Nn(2, r)}`,
    `${e} review quarterly goals +work @planning id:q4review`,
    // `rec:` needs a due:/t: to anchor to. Without one the engine
    // deliberately invents no deadline, so the next instance is identical
    // to this line and reads as a duplicate. Anchor the starter's example.
    `${e} weekly review +work @meta due:${Nn(7, r)} rec:+1w`,
    `${e} renew passport +admin @errands t:${Nn(90, r)} rec:+10y`,
    `${e} someday: learn the tin whistle +music h:1`,
    `${e} buy +groceries for the week @errands`,
    `${e} press Ctrl+K to explore the command palette @hint`,
    ""
  ].join(`
`);
}
const ch = Dp(), Ui = "dim", Tp = /(?:^|\s)h:1(?=\s|$)/i;
function hh(r) {
  return Tp.test(r);
}
function dh(r) {
  return r.trim() !== "";
}
function oa(r, e) {
  let t = 0, n = 0;
  for (const i of r.split(`
`))
    dh(i) && (n += 1, e !== "show" && hh(i) && (t += 1));
  return { hidden: t, total: n };
}
const Ep = /* @__PURE__ */ new Set([
  "dim",
  "dimmed",
  "fade",
  "faded",
  "on",
  "yes",
  "true",
  "1"
]), Op = /* @__PURE__ */ new Set(["hide", "hidden", "collapse", "gone", "remove"]), Lp = /* @__PURE__ */ new Set([
  "show",
  "shown",
  "reveal",
  "off",
  "no",
  "false",
  "0",
  "all",
  "clear",
  "none"
]), Rp = /* @__PURE__ */ new Set(["toggle", "flip"]);
function Np(r) {
  const e = (r ?? "").trim().toLowerCase();
  if (e === "" || Rp.has(e)) return "toggle";
  if (Ep.has(e)) return "dim";
  if (Op.has(e)) return "hide";
  if (Lp.has(e)) return "show";
  throw new Error(
    `expected dim, hide or show (or no argument to toggle) — got "${r}"`
  );
}
const ls = "todo-txt.hidden.v1";
function Bp() {
  try {
    const r = localStorage.getItem(ls);
    return r === "show" || r === "hide" || r === "dim" ? r : Ui;
  } catch {
    return Ui;
  }
}
function Ip(r) {
  try {
    r === Ui ? localStorage.removeItem(ls) : localStorage.setItem(ls, r);
  } catch {
  }
}
const Pp = /* @__PURE__ */ new Set([
  "default",
  "defaults",
  "reset",
  "clear",
  "none",
  "off"
]);
function $p(r) {
  const e = (r ?? "").trim();
  if (e === "")
    throw new Error(
      "expected a directory path — e.g. `set-root ~/Documents/todo`, or `set-root default` to go back to the app folder"
    );
  return Pp.has(e.toLowerCase()) ? null : Fp(e);
}
function Fp(r) {
  if (r.length >= 2) {
    const e = r[0], t = r[r.length - 1];
    if ((e === '"' || e === "'") && e === t)
      return r.slice(1, -1).trim();
  }
  return r;
}
function Hp(r) {
  const e = r.is_default ? " (app default)" : " (custom)";
  return `${r.root}${e} — todo.txt, done.txt, report.txt`;
}
function Wp(r) {
  return r.is_default ? `back to the app folder: ${r.root}` : `now reading ${r.root}`;
}
function sa(r, e) {
  if (r !== null && typeof r == "object") {
    const t = r.error;
    if (typeof t == "string" && t.trim() !== "") return t;
  }
  return `HTTP ${e}`;
}
class uh extends Error {
  constructor(e) {
    super(`NotImplementedError: command "${e}" is not yet implemented`), this.name = "NotImplementedError";
  }
}
function zp(r) {
  return (e, t, n) => {
    throw new uh(r);
  };
}
function la(r, e) {
  const t = `${r}: `;
  return e.startsWith(t) ? e : `${t}${e}`;
}
function vt(r) {
  if (r.length === 0) return { lines: [], trailingNewline: !1 };
  const e = r.endsWith(`
`);
  return { lines: (e ? r.slice(0, -1) : r).split(`
`), trailingNewline: e };
}
function ht(r, e) {
  return r.length === 0 ? e ? `
` : "" : r.join(`
`) + (e ? `
` : "");
}
function Un(r, e, t) {
  if (!Number.isInteger(r) || r < 1 || r > e.length)
    throw new Error(`${t}: item# ${r} out of range (1..${e.length})`);
}
function kn(r, e) {
  const t = (r ?? "").trim();
  if (t === "" || !/^-?\d+$/.test(t))
    throw new Error(`${e}: item# must be an integer, got "${r}"`);
  return Number.parseInt(t, 10);
}
const on = /^\(([A-Z])\) /, Vp = /^x \d{4}-\d{2}-\d{2} /;
function _p() {
  const r = /* @__PURE__ */ new Date(), e = String(r.getMonth() + 1).padStart(2, "0"), t = String(r.getDate()).padStart(2, "0");
  return `${r.getFullYear()}-${e}-${t}`;
}
function jp(r, e) {
  const t = (e[0] ?? "").trim();
  if (t === "") throw new Error("add: text is required");
  const { lines: n, trailingNewline: i } = vt(r);
  return n.push(t), { type: "mutation", content: ht(n, i) };
}
function Kp(r, e) {
  const t = kn(e[0], "append"), n = (e[1] ?? "").trim();
  if (n === "") throw new Error("append: text is required");
  const { lines: i, trailingNewline: o } = vt(r);
  Un(t, i, "append");
  const s = t - 1, l = i[s], a = l === "" ? n : `${l} ${n}`;
  return i[s] = a.replace(/ {2,}/g, " "), { type: "mutation", content: ht(i, o) };
}
function Up(r, e) {
  const t = kn(e[0], "prepend"), n = (e[1] ?? "").trim();
  if (n === "") throw new Error("prepend: text is required");
  const { lines: i, trailingNewline: o } = vt(r);
  Un(t, i, "prepend");
  const s = t - 1, l = i[s], a = on.exec(l);
  if (a) {
    const c = a[0], h = l.slice(c.length);
    i[s] = h === "" ? `${c}${n}` : `${c}${n} ${h}`;
  } else l === "" ? i[s] = n : i[s] = `${n} ${l}`;
  return { type: "mutation", content: ht(i, o) };
}
function qp(r, e) {
  const t = kn(e[0], "del"), n = e[1], { lines: i, trailingNewline: o } = vt(r);
  Un(t, i, "del");
  const s = t - 1;
  if (n === void 0 || n === "")
    i.splice(s, 1);
  else {
    const l = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), a = new RegExp(`(?:^|(?<=\\s))${l}(?=\\s|$)`, "gi");
    i[s] = i[s].replace(a, "").replace(/ {2,}/g, " ").trimEnd();
  }
  return { type: "mutation", content: ht(i, o) };
}
function Yp(r, e) {
  const t = kn(e[0], "replace"), n = (e[1] ?? "").trim();
  if (n === "") throw new Error("replace: text is required");
  const { lines: i, trailingNewline: o } = vt(r);
  return Un(t, i, "replace"), i[t - 1] = n, { type: "mutation", content: ht(i, o) };
}
function Gp(r, e) {
  const t = kn(e[0], "do"), { lines: n, trailingNewline: i } = vt(r);
  Un(t, n, "do");
  const o = t - 1;
  let s = n[o];
  if (s.trim() === "")
    return { type: "mutation", content: ht(n, i) };
  if (Vp.test(s))
    return { type: "mutation", content: ht(n, i) };
  const l = _p(), a = ah(s, l), c = on.exec(s), h = c ? c[1] : null;
  s = s.replace(on, "");
  const d = `x ${l} ${s}`;
  return n[o] = h ? `${d} pri:${h}` : d, a !== null && n.splice(o + 1, 0, a), { type: "mutation", content: ht(n, i) };
}
function Jp(r, e) {
  const t = kn(e[0], "pri"), n = (e[1] ?? "").trim().toUpperCase();
  if (!/^[A-Z]$/.test(n))
    throw new Error(`pri: priority must be A-Z, got "${e[1]}"`);
  const { lines: i, trailingNewline: o } = vt(r);
  Un(t, i, "pri");
  const s = t - 1, l = i[s];
  if (/^x\s/.test(l)) {
    const a = l.replace(/(^|\s)pri:[A-Z](?=\s|$)/, "$1").replace(/\s+$/, "").replace(/\s{2,}/g, " ");
    i[s] = `${a} pri:${n}`;
  } else {
    const a = l.replace(on, "");
    i[s] = `(${n}) ${a}`;
  }
  return { type: "mutation", content: ht(i, o) };
}
function Xp(r, e) {
  const t = kn(e[0], "depri"), { lines: n, trailingNewline: i } = vt(r);
  Un(t, n, "depri");
  const o = t - 1;
  return n[o] = n[o].replace(on, ""), { type: "mutation", content: ht(n, i) };
}
function Zp(r, e) {
  const t = (e[0] ?? "priority").trim().toLowerCase();
  if (!["priority", "date", "project", "context"].includes(t))
    throw new Error(
      `sort: unknown mode "${t}" (expected priority | date | project | context)`
    );
  const n = t, { lines: i, trailingNewline: o } = vt(r), s = "￿", l = i.map((a, c) => {
    let h;
    switch (n) {
      case "priority": {
        const d = on.exec(a);
        h = d ? d[1] : s;
        break;
      }
      case "date": {
        const d = a.replace(on, ""), u = /^(\d{4}-\d{2}-\d{2})/.exec(d);
        h = u ? u[1] : s;
        break;
      }
      case "project": {
        const d = /\+(\S+)/.exec(a);
        h = d ? d[1] : s;
        break;
      }
      case "context": {
        const d = /@(\S+)/.exec(a);
        h = d ? d[1] : s;
        break;
      }
    }
    return { line: a, key: h, i: c };
  });
  return l.sort((a, c) => a.key < c.key ? -1 : a.key > c.key ? 1 : a.i - c.i), {
    type: "mutation",
    content: ht(
      l.map((a) => a.line),
      o
    )
  };
}
function fh(r) {
  return r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Yr(r) {
  const { lines: e } = vt(r), t = [];
  return e.forEach((n, i) => {
    n.trim() !== "" && t.push({ index: i + 1, text: n });
  }), t;
}
function ph(r, e) {
  const t = r.toLowerCase();
  for (const n of e)
    if (n.startsWith("-") && n.length > 1) {
      if (t.includes(n.slice(1).toLowerCase())) return !1;
    } else if (!t.includes(n.toLowerCase())) return !1;
  return !0;
}
function Qp(r, e) {
  const t = (e[0] ?? "").trim(), n = Yr(r);
  if (t === "")
    return { type: "filter", lines: n, title: "All active items" };
  const i = t.split(/\s+/).filter((l) => l.length > 0), o = n.filter((l) => ph(l.text, i)), s = `Items matching "${t}"`;
  return { type: "filter", lines: o, title: s };
}
function em(r, e) {
  const t = (e[0] ?? "").trim(), n = Yr(r);
  if (t === "")
    return { type: "filter", lines: n, title: "All items (active + done)" };
  const i = t.split(/\s+/).filter((l) => l.length > 0), o = n.filter((l) => ph(l.text, i)), s = `All items matching "${t}"`;
  return { type: "filter", lines: o, title: s };
}
function tm(r, e) {
  const t = (e[0] ?? "").trim(), n = Yr(r);
  if (t === "") {
    const l = /* @__PURE__ */ new Map();
    for (const { text: c } of n) {
      const h = c.match(/@\S+/g) ?? [];
      for (const d of h)
        l.set(d, (l.get(d) ?? 0) + 1);
    }
    return { type: "aggregate", groups: Array.from(l.entries()).map(([c, h]) => ({ key: c, count: h })).sort((c, h) => c.key < h.key ? -1 : c.key > h.key ? 1 : 0), title: "All @contexts" };
  }
  const i = t.startsWith("@") ? t : `@${t}`, o = new RegExp(`(^|\\s)${fh(i)}(?=\\s|$)`);
  return { type: "filter", lines: n.filter((l) => o.test(l.text)), title: `Items with ${i}` };
}
function nm(r, e) {
  const t = (e[0] ?? "").trim(), n = Yr(r);
  if (t === "") {
    const l = /* @__PURE__ */ new Map();
    for (const { text: c } of n) {
      const h = c.match(/\+\S+/g) ?? [];
      for (const d of h)
        l.set(d, (l.get(d) ?? 0) + 1);
    }
    return { type: "aggregate", groups: Array.from(l.entries()).map(([c, h]) => ({ key: c, count: h })).sort((c, h) => c.key < h.key ? -1 : c.key > h.key ? 1 : 0), title: "All +projects" };
  }
  const i = t.startsWith("+") ? t : `+${t}`, o = new RegExp(`(^|\\s)${fh(i)}(?=\\s|$)`);
  return { type: "filter", lines: n.filter((l) => o.test(l.text)), title: `Items with ${i}` };
}
function rm(r, e) {
  const t = (e[0] ?? "").trim().toUpperCase(), n = Yr(r);
  if (t === "")
    return { type: "filter", lines: n.filter((a) => on.test(a.text)), title: "All prioritized items" };
  let i, o;
  if (/^[A-Z]$/.test(t))
    i = (l) => l === t, o = `Items with priority ${t}`;
  else if (/^[A-Z]-[A-Z]$/.test(t)) {
    const [l, a] = t.split("-");
    if (l > a)
      throw new Error(`listpri: range "${t}" is reversed`);
    i = (c) => c >= l && c <= a, o = `Items with priority ${l}..${a}`;
  } else
    throw new Error(
      `listpri: priority must be A-Z or a range A-C, got "${e[0]}"`
    );
  return { type: "filter", lines: n.filter((l) => {
    const a = on.exec(l.text);
    return a !== null && i(a[1]);
  }), title: o };
}
function im(r, e, t) {
  return {
    type: "server-action",
    endpoint: "/apps/todo-txt/api/archive",
    method: "POST",
    body: {}
  };
}
function om(r, e, t) {
  if (t !== "todo" && t !== "done")
    throw new Error("move: switch to the todo or done tab first");
  const n = kn(e[0], "move"), i = (e[1] ?? "").trim().toLowerCase();
  if (i !== "todo" && i !== "done")
    throw new Error(`move: dest must be "todo" or "done", got "${e[1]}"`);
  if (i === t)
    throw new Error(`move: source and destination are both "${t}"`);
  return {
    type: "server-action",
    endpoint: "/apps/todo-txt/api/move",
    method: "POST",
    body: { item: n, from: t, to: i }
  };
}
function sm(r, e, t) {
  return {
    type: "server-action",
    endpoint: "/apps/todo-txt/api/report/snapshot",
    method: "POST",
    body: {}
  };
}
function lm(r, e, t) {
  return { type: "mutation", content: ch };
}
function am(r, e) {
  const { lines: t, trailingNewline: n } = vt(r), i = /* @__PURE__ */ new Set(), o = [];
  for (const s of t) {
    if (s.trim() === "") {
      o.push(s);
      continue;
    }
    i.has(s) || (i.add(s), o.push(s));
  }
  return { type: "mutation", content: ht(o, n) };
}
const cm = {
  todo: "todo",
  done: "done",
  report: "report",
  t: "todo",
  d: "done",
  r: "report"
};
function hm(r, e, t) {
  const n = (e[0] ?? "").trim().toLowerCase(), i = cm[n];
  if (!i)
    throw new Error(
      `unknown file "${e[0] ?? ""}" — valid: todo, done, report`
    );
  return { type: "switch-file", target: i };
}
function dm(r, e, t) {
  const n = (e[0] ?? "").trim();
  return n === "" || Qf(n) ? { type: "set-filter", expr: null } : { type: "set-filter", expr: rh(n).source };
}
function um(r, e, t) {
  return { type: "set-threshold", mode: dp(e[0]) };
}
function fm(r, e, t) {
  return { type: "set-hidden", mode: Np(e[0]) };
}
function pm(r, e, t) {
  return { type: "set-root", root: $p(e[0]) };
}
function mm(r, e, t) {
  return { type: "show-root" };
}
const Lo = [
  // --- Deterministic mutations ------------------------------------------
  {
    name: "add",
    shortName: "a",
    description: "Add a new task to todo.txt.",
    argSchema: [{ name: "text", type: "string", description: "Task text" }],
    apply: jp
  },
  {
    name: "append",
    shortName: "app",
    description: "Append text to an existing item.",
    argSchema: [
      { name: "item#", type: "number", description: "1-indexed line number" },
      { name: "text", type: "string", description: "Text to append" }
    ],
    apply: Kp
  },
  {
    name: "prepend",
    shortName: "prep",
    description: "Prepend text to an existing item.",
    argSchema: [
      { name: "item#", type: "number", description: "1-indexed line number" },
      { name: "text", type: "string", description: "Text to prepend" }
    ],
    apply: Up
  },
  {
    name: "del",
    shortName: "rm",
    description: "Delete an item (or a term from an item).",
    argSchema: [
      { name: "item#", type: "number", description: "1-indexed line number" },
      { name: "term", type: "string", optional: !0, description: "Optional term to remove" }
    ],
    apply: qp
  },
  {
    name: "replace",
    description: "Replace an item with new text.",
    argSchema: [
      { name: "item#", type: "number", description: "1-indexed line number" },
      { name: "text", type: "string", description: "Replacement text" }
    ],
    apply: Yp
  },
  {
    name: "do",
    shortName: "x",
    description: "Mark an item as done.",
    argSchema: [{ name: "item#", type: "number", description: "1-indexed line number" }],
    apply: Gp
  },
  {
    name: "pri",
    shortName: "p",
    description: "Set the priority of an item.",
    argSchema: [
      { name: "item#", type: "number", description: "1-indexed line number" },
      { name: "priority", type: "priority", description: "A-Z" }
    ],
    apply: Jp
  },
  {
    name: "depri",
    shortName: "dp",
    description: "Remove the priority from an item.",
    argSchema: [{ name: "item#", type: "number", description: "1-indexed line number" }],
    apply: Xp
  },
  {
    name: "sort",
    description: "Sort items by priority / date / project / context.",
    argSchema: [
      {
        name: "mode",
        type: "string",
        optional: !0,
        description: "priority | date | project | context"
      }
    ],
    apply: Zp
  },
  // --- Filter / list views ----------------------------------------------
  {
    name: "list",
    shortName: "ls",
    description: "List active items, optionally filtered by term.",
    argSchema: [{ name: "term", type: "string", optional: !0, description: "Filter term" }],
    apply: Qp
  },
  {
    name: "listall",
    shortName: "lsa",
    description: "List both active and done items.",
    argSchema: [{ name: "term", type: "string", optional: !0, description: "Filter term" }],
    apply: em
  },
  {
    name: "listcon",
    shortName: "lsc",
    description: "List all @contexts (or items for one @context).",
    argSchema: [
      { name: "context", type: "string", optional: !0, description: "Specific @context" }
    ],
    apply: tm
  },
  {
    name: "listproj",
    shortName: "lsprj",
    description: "List all +projects (or items for one +project).",
    argSchema: [
      { name: "project", type: "string", optional: !0, description: "Specific +project" }
    ],
    apply: nm
  },
  {
    name: "listpri",
    shortName: "lsp",
    description: "List items matching a priority (or range).",
    argSchema: [
      { name: "priority", type: "priority", optional: !0, description: "A-Z or range (A-C)" }
    ],
    apply: rm
  },
  {
    name: "listfile",
    shortName: "lf",
    description: "List items from a specific file (todo / done / report).",
    argSchema: [{ name: "file", type: "file", description: "todo | done | report" }],
    apply: hm
  },
  {
    name: "filter",
    shortName: "f",
    description: "Dim lines that do not match an expression — stays editable. `filter clear` removes it.",
    argSchema: [
      {
        name: "expr",
        type: "string",
        optional: !0,
        description: '@ctx +proj pri:A pri:A-C due:today|overdue|<=7d text -negated — or "clear"'
      }
    ],
    apply: dm
  },
  {
    name: "threshold",
    shortName: "th",
    description: "Push tasks whose t: date is still in the future into the background. `threshold show` restores them.",
    argSchema: [
      {
        name: "mode",
        type: "string",
        optional: !0,
        description: "hide | show — omit to toggle"
      }
    ],
    apply: um
  },
  {
    name: "hidden",
    shortName: "h",
    description: "How h:1 lines look: dim (default), hide (out of view), or show. Omit the argument to flip.",
    argSchema: [
      {
        name: "mode",
        type: "string",
        optional: !0,
        description: "dim | hide | show — omit to toggle"
      }
    ],
    apply: fm
  },
  {
    name: "set-root",
    description: "Point the app at a directory that holds your todo.txt. `set-root default` restores the app folder.",
    argSchema: [
      {
        name: "dir",
        type: "string",
        description: 'absolute path inside your home directory — or "default"'
      }
    ],
    apply: pm
  },
  {
    name: "where",
    description: "Show which directory todo.txt, done.txt and report.txt are read from.",
    argSchema: [],
    apply: mm
  },
  // --- File-crossing ----------------------------------------------------
  {
    name: "archive",
    description: "Move all done (x-prefixed) items from todo.txt to done.txt.",
    argSchema: [],
    apply: im
  },
  {
    name: "move",
    shortName: "mv",
    description: "Move an item between todo.txt and done.txt.",
    argSchema: [
      { name: "item#", type: "number", description: "1-indexed line number" },
      { name: "dest", type: "file", description: "todo | done" }
    ],
    apply: om
  },
  {
    name: "report",
    description: "Snapshot active/done counts into report.txt.",
    argSchema: [],
    apply: sm
  },
  // --- Meta -------------------------------------------------------------
  {
    name: "deduplicate",
    shortName: "dedup",
    description: "Remove duplicate lines (keep first occurrence).",
    argSchema: [],
    apply: am
  },
  {
    name: "help",
    shortName: "?",
    description: "Show format spec and list of all commands.",
    argSchema: [],
    apply: zp("help")
  },
  // --- Example template -------------------------------------------------
  {
    name: "example",
    shortName: "template",
    description: "Insert the starter example (priorities, projects, contexts, dates, recurring) — replaces current todo.txt content.",
    argSchema: [],
    apply: lm
  }
];
function fo() {
  const r = /* @__PURE__ */ new Date();
  return `${r.getFullYear()}-${String(r.getMonth() + 1).padStart(2, "0")}-${String(r.getDate()).padStart(2, "0")}`;
}
function gm(r) {
  if (xt(r)) return r;
  const e = _i(r);
  return e ? e === "Z" ? Gt(r, null) : Gt(r, String.fromCharCode(e.charCodeAt(0) + 1)) : Gt(r, "A");
}
function ym(r) {
  if (xt(r)) return r;
  const e = _i(r);
  return e ? e === "A" ? r : Gt(r, String.fromCharCode(e.charCodeAt(0) - 1)) : Gt(r, "A");
}
function mh(r) {
  return ss(r, fo());
}
function gh(r, e) {
  return e === "todo" || e === void 0 ? mh(r) : uo(r, fo());
}
function xm(r) {
  return il(r, fo());
}
function bm(r) {
  if (r.trim() === "") return r;
  let e = r;
  return xt(e) || (e = uo(e, fo())), /\barchived:1\b/.test(e) || (e = `${e} archived:1`), e;
}
function wm(r) {
  const { lines: e, trailingNewline: t } = vt(r);
  return e.sort((n, i) => {
    const o = xt(n) ? 1 : 0, s = xt(i) ? 1 : 0;
    if (o !== s) return o - s;
    const l = _i(n) ?? "ÿ", a = _i(i) ?? "ÿ";
    return l !== a ? l < a ? -1 : 1 : n.localeCompare(i);
  }), ht(e, t);
}
function yh(r) {
  const e = (i) => {
    var o;
    return !((o = i == null ? void 0 : i.state) != null && o.readOnly);
  }, t = (i, o) => {
    r.defineAction(i, (s) => {
      const l = s.cm6 ?? s;
      if (!(l != null && l.state) || !e(l)) return;
      const a = l.state, c = a.doc.lineAt(a.selection.main.head), h = c.text, d = o(h);
      d !== h && l.dispatch({
        changes: { from: c.from, to: c.to, insert: d }
      });
    });
  }, n = (i, o) => {
    r.defineAction(i, (s) => {
      const l = s.cm6 ?? s;
      if (!(l != null && l.state) || !e(l)) return;
      const a = l.state.doc.toString(), c = o(a);
      c !== a && l.dispatch({
        changes: { from: 0, to: a.length, insert: c }
      });
    });
  };
  r.defineAction("todotxt-toggle-done", (i) => {
    var d, u, f;
    const o = i.cm6 ?? i;
    if (!(o != null && o.state) || !e(o)) return;
    const s = (u = (d = o.dom) == null ? void 0 : d.closest) == null ? void 0 : u.call(
      d,
      "[data-todo-file]"
    ), l = (f = s == null ? void 0 : s.dataset) == null ? void 0 : f.todoFile, a = o.state, c = a.doc.lineAt(a.selection.main.head), h = gh(c.text, l);
    h !== c.text && o.dispatch({
      changes: { from: c.from, to: c.to, insert: h }
    });
  }), t("todotxt-priority-down", gm), t("todotxt-priority-up", ym), t("todotxt-set-pri-a", (i) => Gt(i, "A")), t("todotxt-set-pri-b", (i) => Gt(i, "B")), t("todotxt-set-pri-c", (i) => Gt(i, "C")), t("todotxt-insert-date", xm), t("todotxt-archive", bm), n("todotxt-sort", wm), r.mapCommand("\\x", "action", "todotxt-toggle-done", {}, { context: "normal" }), r.mapCommand("\\j", "action", "todotxt-priority-down", {}, { context: "normal" }), r.mapCommand("\\k", "action", "todotxt-priority-up", {}, { context: "normal" }), r.mapCommand("\\a", "action", "todotxt-set-pri-a", {}, { context: "normal" }), r.mapCommand("\\b", "action", "todotxt-set-pri-b", {}, { context: "normal" }), r.mapCommand("\\c", "action", "todotxt-set-pri-c", {}, { context: "normal" }), r.mapCommand("\\d", "action", "todotxt-insert-date", {}, { context: "normal" }), r.mapCommand("\\D", "action", "todotxt-archive", {}, { context: "normal" }), r.mapCommand("\\s", "action", "todotxt-sort", {}, { context: "normal" });
}
function xh(r) {
  return r.ctrlKey !== r.metaKey;
}
function vm(r) {
  return xh(r) && !r.altKey && !r.shiftKey && r.key === "/";
}
function bh(r, e) {
  return !xh(r) || r.altKey || r.key.toLowerCase() !== "d" ? !1 : r.shiftKey ? e && r.ctrlKey : !(e && r.ctrlKey);
}
function km(r, e = window) {
  const t = (n) => {
    vm(n) && (n.preventDefault(), n.stopPropagation(), r());
  };
  return e.addEventListener("keydown", t, { capture: !0 }), () => e.removeEventListener("keydown", t, { capture: !0 });
}
function Sm(r, e, t = window, n = mh) {
  const i = (o) => {
    if (!bh(o, e)) return;
    const s = r();
    if (!s || !s.hasFocus) return;
    const { from: l, to: a } = s.state.selection.main;
    if (l !== a) return;
    const c = s.state.doc.lineAt(l);
    if (c.text.trim() === "") return;
    const h = n(c.text);
    h !== c.text && (o.preventDefault(), o.stopPropagation(), s.dispatch({ changes: { from: c.from, to: c.to, insert: h } }));
  };
  return t.addEventListener("keydown", i, { capture: !0 }), () => t.removeEventListener("keydown", i, { capture: !0 });
}
function Cm(r) {
  var t;
  if (r.trim().toLowerCase() === "transparent")
    return { r: 0, g: 0, b: 0, a: 0 };
  const e = (t = r.match(/\d+(?:\.\d+)?/g)) == null ? void 0 : t.map(Number);
  return !e || e.length < 3 ? null : {
    r: e[0],
    g: e[1],
    b: e[2],
    a: e[3] ?? 1
  };
}
function Am(r) {
  var e;
  for (let t = r; t; t = t.parentElement)
    try {
      const n = Cm(getComputedStyle(t).backgroundColor);
      if (n && n.a > 0.01)
        return (0.299 * n.r + 0.587 * n.g + 0.114 * n.b) / 255 < 0.4;
    } catch {
      break;
    }
  try {
    return ((e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-color-scheme: dark)").matches) ?? !0;
  } catch {
    return !0;
  }
}
function Mm(r, e) {
  r.removeAttribute("data-amoled");
  const t = e && Am(r);
  return t && r.setAttribute("data-amoled", "true"), t;
}
function Dm(r, e) {
  var l, a;
  const t = () => {
    const c = r();
    c && Mm(c, e);
  };
  if (t(), !e)
    return () => {
      var c;
      return (c = r()) == null ? void 0 : c.removeAttribute("data-amoled");
    };
  const n = new MutationObserver(t), i = r();
  for (let c = (i == null ? void 0 : i.parentElement) ?? null; c; c = c.parentElement)
    n.observe(c, {
      attributes: !0,
      attributeFilter: ["class", "style", "data-theme", "data-color-scheme"]
    });
  document.head && n.observe(document.head, {
    attributes: !0,
    attributeFilter: ["disabled", "media"],
    childList: !0,
    characterData: !0,
    subtree: !0
  });
  const o = (l = window.matchMedia) == null ? void 0 : l.call(window, "(prefers-color-scheme: dark)"), s = () => t();
  return (a = o == null ? void 0 : o.addEventListener) == null || a.call(o, "change", s), () => {
    var c, h;
    n.disconnect(), (c = o == null ? void 0 : o.removeEventListener) == null || c.call(o, "change", s), (h = r()) == null || h.removeAttribute("data-amoled");
  };
}
const Tm = 320, Em = 220, hn = 8, fi = 8;
function Om({
  selection: r,
  anchorRect: e,
  rangeCount: t = 1,
  vimMode: n = !1,
  onClose: i,
  containerRef: o,
  scrollRef: s,
  scrollElement: l,
  onMarkDone: a,
  onSetPriority: c,
  onAddCreationDate: h,
  onCopy: d,
  onDeleteLine: u,
  onDuplicateLine: f,
  onArchiveSelection: g,
  onSetDueDate: w,
  onAddComment: k,
  onAskInChat: v,
  file: D = "todo"
}) {
  const N = z(null), [Y, A] = q(Em), [, T] = q(0);
  U(() => {
    const j = N.current;
    if (!j || typeof ResizeObserver > "u") return;
    const J = new ResizeObserver((ze) => {
      var Pt, Xt;
      for (const ri of ze) {
        const Gn = ((Xt = (Pt = ri.borderBoxSize) == null ? void 0 : Pt[0]) == null ? void 0 : Xt.blockSize) ?? ri.contentRect.height;
        Gn > 0 && A(Gn);
      }
    });
    return J.observe(j), () => J.disconnect();
  }, []), U(() => {
    let j = null;
    const J = () => {
      j === null && (j = requestAnimationFrame(() => {
        j = null, T((ze) => ze + 1);
      }));
    };
    return window.addEventListener("resize", J, { passive: !0 }), () => {
      window.removeEventListener("resize", J), j !== null && cancelAnimationFrame(j);
    };
  }, []);
  const S = e.left, B = e.bottom, $ = (o == null ? void 0 : o.current) ?? null, G = $ == null ? void 0 : $.getBoundingClientRect(), W = !!($ && G), _ = W ? S - G.left + $.scrollLeft : S, le = W ? B - G.top + $.scrollTop : B, ne = W ? e.top - G.top + $.scrollTop : e.top, ae = W ? G.width : window.innerWidth, Ce = Math.max(
    0,
    Math.min(Tm, ae - hn * 2)
  ), Ue = W ? Math.max(G.top, 0) : 0, rt = W ? Math.min(G.bottom, window.innerHeight) : window.innerHeight, Oe = Math.max(
    0,
    rt - e.bottom - fi - hn
  ), it = Math.max(
    0,
    e.top - Ue - fi - hn
  ), O = Y <= Oe, X = Y <= it, Q = !O && (X || it > Oe), de = Q ? it : Oe, fe = Math.min(Y, de), Ae = W ? $.scrollLeft : 0, be = W ? $.scrollTop : 0, St = W ? be + Ue - G.top + hn : hn, Pe = z(i);
  U(() => {
    Pe.current = i;
  }, [i]), U(() => {
    const j = l ?? (s == null ? void 0 : s.current) ?? (o == null ? void 0 : o.current) ?? window, J = () => Pe.current();
    return j.addEventListener("scroll", J, { passive: !0 }), () => j.removeEventListener("scroll", J);
  }, [l, s, o]);
  const [ot, K] = q(!1), we = z(null), [Ct, Re] = q(!1), Be = z(null);
  U(() => {
    if (!ot) return;
    const j = (J) => {
      we.current && !we.current.contains(J.target) && K(!1);
    };
    return document.addEventListener("mousedown", j), () => document.removeEventListener("mousedown", j);
  }, [ot]), U(() => {
    if (!Ct) return;
    const j = (J) => {
      Be.current && !Be.current.contains(J.target) && Re(!1);
    };
    return document.addEventListener("mousedown", j), () => document.removeEventListener("mousedown", j);
  }, [Ct]);
  const Yn = P(
    (j) => {
      K(!1), c(j);
    },
    [c]
  ), [dt, At] = q(""), ti = z(null), Ie = P((j) => {
    j.style.height = "auto", j.style.height = Math.min(j.scrollHeight, 160) + "px";
  }, []), ni = P(() => {
    var J;
    const j = dt.trim();
    j && (k({ anchor: r, text: j }), At(""), (J = ti.current) == null || J.focus());
  }, [dt, k, r]), An = P(() => {
    const j = dt.trim();
    j && (v({ anchor: r, text: j }), At(""));
  }, [dt, v, r]), Ao = P(() => {
    if (dt.trim()) {
      At("");
      return;
    }
    i();
  }, [dt, i]), It = z(a), Mn = z(c);
  return U(() => {
    It.current = a;
  }, [a]), U(() => {
    Mn.current = c;
  }, [c]), U(() => {
    const j = (J) => {
      if (J.key === "Escape") {
        J.preventDefault(), J.stopPropagation(), Pe.current();
        return;
      }
      const ze = J.key.toLowerCase();
      if (ze === "d") {
        if (!bh(J, n)) return;
        J.preventDefault(), J.stopPropagation(), It.current();
        return;
      }
      !(J.ctrlKey !== J.metaKey) || J.altKey || J.shiftKey || (ze === "1" ? (J.preventDefault(), J.stopPropagation(), Mn.current("A")) : ze === "2" ? (J.preventDefault(), J.stopPropagation(), Mn.current("B")) : ze === "3" ? (J.preventDefault(), J.stopPropagation(), Mn.current("C")) : ze === "0" && (J.preventDefault(), J.stopPropagation(), Mn.current(null)));
    };
    return document.addEventListener("keydown", j), () => document.removeEventListener("keydown", j);
  }, [n]), /* @__PURE__ */ C(
    "div",
    {
      ref: N,
      role: "dialog",
      "aria-label": "Todo-txt selection actions",
      className: `${W ? "absolute" : "fixed"} z-50 box-border bg-[var(--color-bg-elevated)] text-[var(--color-fg)] border border-solid border-[var(--border-strong,var(--color-border))] rounded-lg shadow-lg p-3 animate-scale-in`,
      style: {
        // Clamp BOTH edges so a stale/negative anchor can never push the
        // popover left of the editor pane (i.e. on top of the sidebar) or
        // off the right edge. `left` is bounded to [MARGIN, maxW-WIDTH-MARGIN];
        // `top` to >= MARGIN. Previously only the right edge was clamped, so a
        // negative posX rendered the popover over the dashboard sidebar.
        left: Math.max(
          Ae + hn,
          Math.min(
            _,
            Math.max(
              Ae + hn,
              Ae + ae - Ce - hn
            )
          )
        ),
        top: Math.max(
          St,
          Q ? ne - fe - fi : le + fi
        ),
        width: Ce,
        maxWidth: "calc(100vw - 16px)",
        maxHeight: Math.max(1, de),
        overflowY: "auto"
      },
      onMouseDown: (j) => j.stopPropagation(),
      children: [
        t > 1 && /* @__PURE__ */ C(
          "div",
          {
            className: "mb-2 text-[11px] font-medium text-[var(--muted-aa)]",
            "data-testid": "todo-txt-selection-count",
            role: "status",
            children: [
              t,
              " selections · actions apply to each selected line"
            ]
          }
        ),
        /* @__PURE__ */ C("div", { className: "flex items-start gap-1 flex-wrap", role: "toolbar", "aria-label": "Quick actions", children: [
          /* @__PURE__ */ C(
            "button",
            {
              type: "button",
              "aria-label": "Mark done (Cmd/Ctrl+D)",
              title: "Mark done (Cmd/Ctrl+D)",
              onClick: a,
              className: "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-fg)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer",
              children: [
                /* @__PURE__ */ y(Zc, { className: "lucide-inline w-3.5 h-3.5" }),
                /* @__PURE__ */ y("span", { children: "Done" }),
                /* @__PURE__ */ y(
                  "span",
                  {
                    "aria-hidden": "true",
                    className: "ml-1 text-[var(--muted-aa)] text-[10px] font-sans font-normal",
                    children: "⌘D"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ C("div", { ref: we, className: "flex flex-col items-start", children: [
            /* @__PURE__ */ C(
              "button",
              {
                type: "button",
                "aria-haspopup": "menu",
                "aria-expanded": ot,
                "aria-label": "Set priority",
                title: "Set priority (Cmd/Ctrl+1/2/3, Cmd/Ctrl+0 to clear)",
                onClick: () => {
                  Re(!1), K((j) => !j);
                },
                className: "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-fg)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer",
                children: [
                  /* @__PURE__ */ y("span", { className: "font-mono", children: "(A/B/C)" }),
                  /* @__PURE__ */ y(ql, { className: "lucide-inline w-3 h-3" })
                ]
              }
            ),
            ot && /* @__PURE__ */ C(
              "div",
              {
                role: "menu",
                "aria-label": "Priority options",
                className: "box-border mt-1 w-[120px] max-w-full bg-[var(--color-bg-elevated)] text-[var(--color-fg)] border border-solid border-[var(--color-border)] rounded-md shadow-lg py-1",
                children: [
                  /* @__PURE__ */ C(
                    "button",
                    {
                      type: "button",
                      role: "menuitem",
                      onClick: () => Yn("A"),
                      title: "Set priority A (Cmd/Ctrl+1)",
                      className: "flex w-full items-center justify-between px-3 py-1 text-[12px] text-[var(--color-danger)] font-mono font-bold hover:bg-[var(--color-bg-hover)] cursor-pointer",
                      children: [
                        /* @__PURE__ */ y("span", { children: "(A)" }),
                        /* @__PURE__ */ y("span", { className: "text-[var(--muted-aa)] text-[10px] font-sans font-normal", children: "⌘1" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ C(
                    "button",
                    {
                      type: "button",
                      role: "menuitem",
                      onClick: () => Yn("B"),
                      title: "Set priority B (Cmd/Ctrl+2)",
                      className: "flex w-full items-center justify-between px-3 py-1 text-[12px] text-[var(--warning)] font-mono font-bold hover:bg-[var(--color-bg-hover)] cursor-pointer",
                      children: [
                        /* @__PURE__ */ y("span", { children: "(B)" }),
                        /* @__PURE__ */ y("span", { className: "text-[var(--muted-aa)] text-[10px] font-sans font-normal", children: "⌘2" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ C(
                    "button",
                    {
                      type: "button",
                      role: "menuitem",
                      onClick: () => Yn("C"),
                      title: "Set priority C (Cmd/Ctrl+3)",
                      className: "flex w-full items-center justify-between px-3 py-1 text-[12px] text-[var(--accent)] font-mono font-bold hover:bg-[var(--color-bg-hover)] cursor-pointer",
                      children: [
                        /* @__PURE__ */ y("span", { children: "(C)" }),
                        /* @__PURE__ */ y("span", { className: "text-[var(--muted-aa)] text-[10px] font-sans font-normal", children: "⌘3" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ y("div", { className: "border-t border-solid border-[var(--color-border)] my-1" }),
                  /* @__PURE__ */ C(
                    "button",
                    {
                      type: "button",
                      role: "menuitem",
                      onClick: () => Yn(null),
                      title: "Clear priority (Cmd/Ctrl+0)",
                      className: "flex w-full items-center justify-between px-3 py-1 text-[12px] text-[var(--muted-aa)] hover:bg-[var(--color-bg-hover)] cursor-pointer",
                      children: [
                        /* @__PURE__ */ y("span", { children: "Clear" }),
                        /* @__PURE__ */ y("span", { className: "text-[var(--muted-aa)] text-[10px] font-sans font-normal", children: "⌘0" })
                      ]
                    }
                  )
                ]
              }
            )
          ] }),
          /* @__PURE__ */ C(
            "button",
            {
              type: "button",
              "aria-label": "Add creation date",
              title: "Add today's creation date",
              onClick: h,
              className: "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-fg)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer",
              children: [
                /* @__PURE__ */ y(Tf, { className: "lucide-inline w-3.5 h-3.5" }),
                /* @__PURE__ */ y("span", { children: "Date" })
              ]
            }
          ),
          /* @__PURE__ */ C(
            "button",
            {
              type: "button",
              "aria-label": "Copy selection",
              title: "Copy selection to clipboard",
              onClick: d,
              className: "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-fg)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer",
              children: [
                /* @__PURE__ */ y(Lf, { className: "lucide-inline w-3.5 h-3.5" }),
                /* @__PURE__ */ y("span", { children: "Copy" })
              ]
            }
          ),
          /* @__PURE__ */ C("div", { ref: Be, className: "flex flex-col items-start", children: [
            /* @__PURE__ */ C(
              "button",
              {
                type: "button",
                "aria-haspopup": "menu",
                "aria-expanded": Ct,
                "aria-label": "Set due date",
                title: "Set due:YYYY-MM-DD on this line",
                onClick: () => {
                  K(!1), Re((j) => !j);
                },
                className: "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-fg)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer",
                children: [
                  /* @__PURE__ */ y(Df, { className: "lucide-inline w-3.5 h-3.5" }),
                  /* @__PURE__ */ y("span", { children: "Due" }),
                  /* @__PURE__ */ y(ql, { className: "lucide-inline w-3 h-3" })
                ]
              }
            ),
            Ct && /* @__PURE__ */ y(
              "div",
              {
                role: "menu",
                "aria-label": "Due date options",
                className: "box-border mt-1 w-[140px] max-w-full bg-[var(--color-bg-elevated)] text-[var(--color-fg)] border border-solid border-[var(--color-border)] rounded-md shadow-lg py-1",
                children: [
                  ["today", "Today"],
                  ["tom", "Tomorrow"],
                  ["+3d", "In 3 days"],
                  ["+1w", "In 1 week"],
                  ["+2w", "In 2 weeks"],
                  ["fri", "Next Friday"],
                  ["mon", "Next Monday"]
                ].map(([j, J]) => /* @__PURE__ */ C(
                  "button",
                  {
                    type: "button",
                    role: "menuitem",
                    onClick: () => {
                      Re(!1), w(j);
                    },
                    className: "flex w-full items-center justify-between px-3 py-1 text-[12px] text-[var(--color-fg)] hover:bg-[var(--color-bg-hover)] cursor-pointer",
                    children: [
                      /* @__PURE__ */ y("span", { children: J }),
                      /* @__PURE__ */ y("span", { className: "text-[var(--muted-aa)] text-[10px] font-mono", children: j })
                    ]
                  },
                  j
                ))
              }
            )
          ] }),
          /* @__PURE__ */ C(
            "button",
            {
              type: "button",
              "aria-label": "Duplicate line",
              title: "Duplicate line(s) below",
              onClick: f,
              className: "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-fg)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer",
              children: [
                /* @__PURE__ */ y(Of, { className: "lucide-inline w-3.5 h-3.5" }),
                /* @__PURE__ */ y("span", { children: "Dup" })
              ]
            }
          ),
          D === "todo" && /* @__PURE__ */ C(
            "button",
            {
              type: "button",
              "aria-label": "Archive line to done.txt",
              title: "Mark done + move to done.txt — also archives every line already marked x",
              onClick: g,
              className: "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-fg)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer",
              children: [
                /* @__PURE__ */ y(Mf, { className: "lucide-inline w-3.5 h-3.5" }),
                /* @__PURE__ */ y("span", { children: "→ Done" })
              ]
            }
          ),
          /* @__PURE__ */ C(
            "button",
            {
              type: "button",
              "aria-label": "Delete line",
              title: "Delete line(s) — destructive",
              onClick: u,
              className: "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-danger)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--color-danger)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer",
              children: [
                /* @__PURE__ */ y(Qc, { className: "lucide-inline w-3.5 h-3.5" }),
                /* @__PURE__ */ y("span", { children: "Del" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ y("div", { className: "border-t border-solid border-[var(--color-border)] my-2" }),
        /* @__PURE__ */ y(
          "textarea",
          {
            ref: ti,
            "aria-label": "Add a comment for KiroCrew",
            placeholder: "Tell KiroCrew what to do…",
            title: "Enter to run · Shift+Enter for a new line",
            value: dt,
            rows: 1,
            onChange: (j) => {
              At(j.target.value), Ie(j.target);
            },
            onKeyDown: (j) => {
              j.key === "Enter" && !j.shiftKey && dt.trim() && (j.preventDefault(), j.stopPropagation(), ni());
            },
            className: "box-border bg-[var(--color-bg)] border border-solid border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-fg)] text-sm font-sans outline-none w-full mb-2 transition-colors focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] placeholder:text-[13px] placeholder:text-[var(--muted-aa)] resize-none leading-[21px]",
            "data-testid": "todo-txt-selection-prompt"
          }
        ),
        /* @__PURE__ */ C("div", { className: "flex gap-1.5 justify-end", children: [
          /* @__PURE__ */ y(
            "button",
            {
              type: "button",
              onClick: Ao,
              className: "px-3 py-1 rounded-md text-[12px] text-[var(--muted-aa)] bg-transparent border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--color-fg)] transition-colors cursor-pointer",
              "data-testid": "todo-txt-selection-cancel",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ y(
            "button",
            {
              type: "button",
              onClick: An,
              disabled: !dt.trim(),
              className: "px-3 py-1 rounded-md text-[12px] whitespace-nowrap text-[var(--muted-aa)] bg-transparent border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--color-fg)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
              "data-testid": "todo-txt-ask-in-chat",
              title: "Open a KiroCrew chat with this selection and your prompt",
              "aria-label": "Ask in chat — hand the selection to KiroCrew chat",
              children: "Chat"
            }
          ),
          /* @__PURE__ */ y(
            "button",
            {
              type: "button",
              onClick: ni,
              disabled: !dt.trim(),
              className: "px-3 py-1 rounded-md text-[12px] whitespace-nowrap text-[var(--accent-fg)] bg-[var(--accent)] border border-solid border-[var(--accent)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
              "data-testid": "todo-txt-just-do-it",
              title: "Stage this edit — KiroCrew rewrites the line; destructive changes are shown as a diff first",
              "aria-label": "Just do it — stage an AI edit for this selection",
              children: "Just do it ▸"
            }
          )
        ] })
      ]
    }
  );
}
const Lm = /* @__PURE__ */ new Set([" ", `
`]);
function qi(r) {
  return r < 10 ? `0${r}` : String(r);
}
function Ye(r) {
  return `${r.getFullYear()}-${qi(r.getMonth() + 1)}-${qi(r.getDate())}`;
}
function wh(r) {
  return `${qi(r.getHours())}:${qi(r.getMinutes())}`;
}
function Rm(r) {
  return `${Ye(r)}T${wh(r)}`;
}
function tn(r, e) {
  const t = new Date(r);
  return t.setDate(t.getDate() + e), t;
}
function aa(r, e) {
  const t = new Date(r), n = t.getMonth() + e;
  return t.setMonth(n), t;
}
function Nm(r, e) {
  const t = new Date(r);
  let n = e;
  const i = e >= 0 ? 1 : -1;
  for (n = Math.abs(n); n > 0; ) {
    t.setDate(t.getDate() + i);
    const o = t.getDay();
    o !== 0 && o !== 6 && (n -= 1);
  }
  return t;
}
const ll = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6
};
function vh(r, e) {
  const t = ll[e.toLowerCase()];
  if (t === void 0) return null;
  const n = r.getDay();
  let i = t - n;
  return i < 0 && (i += 7), i === 0 && (i = 7), tn(r, i);
}
function Bi(r, e) {
  const t = r.toLowerCase().trim();
  if (!t) return null;
  if (t === "today" || t === "tod") return e;
  if (t === "tom" || t === "tomorrow") return tn(e, 1);
  if (t === "yday" || t === "yesterday") return tn(e, -1);
  if (ll[t] !== void 0) return vh(e, t);
  const n = t.match(/^\+(\d+)([dwmyb])$/);
  if (n) {
    const i = parseInt(n[1], 10);
    switch (n[2]) {
      case "d":
        return tn(e, i);
      case "w":
        return tn(e, i * 7);
      case "m":
        return aa(e, i);
      case "y":
        return aa(e, i * 12);
      case "b":
        return Nm(e, i);
    }
  }
  return null;
}
function Bm() {
  const r = "abcdefghijklmnopqrstuvwxyz0123456789";
  let e = "";
  const t = globalThis.crypto;
  if (t && typeof t.getRandomValues == "function") {
    const n = new Uint8Array(8);
    t.getRandomValues(n);
    for (let i = 0; i < 8; i++)
      e += r[n[i] % r.length];
    return e;
  }
  for (let n = 0; n < 8; n++)
    e += r[Math.floor(Math.random() * r.length)];
  return e;
}
function Im(r, e) {
  let t = e;
  for (; t > 0 && r[t - 1] !== `
`; ) t -= 1;
  let n = e;
  for (; n < r.length && r[n] !== `
`; ) n += 1;
  return [t, n];
}
function Pm(r, e) {
  const t = r.indexOf(e);
  if (t < 0) return r;
  const n = t + e.length, i = r[n] === " ";
  return (r.slice(0, t) + (i ? r.slice(n + 1) : r.slice(n))).replace(/ {2,}/g, " ").trimEnd();
}
function $e(r, e) {
  const { value: t, triggerStart: n, triggerEnd: i, triggerChar: o, full: s } = r, l = t.slice(0, n) + e + o + t.slice(i + 1), a = n + e.length + 1;
  return { value: l, caret: a, trigger: s, expansion: e };
}
function dn(r, e) {
  const { value: t, triggerStart: n, triggerEnd: i, triggerChar: o, full: s } = r, l = t.slice(0, i) + t.slice(i + 1), [a, c] = Im(l, n), h = l.slice(a, c), d = Pm(h, s), u = e(d), f = l.slice(0, a) + u + l.slice(c), g = a + u.length;
  return o === `
` ? {
    value: f.slice(0, g) + `
` + f.slice(g),
    caret: g + 1,
    trigger: s,
    expansion: u
  } : { value: f, caret: g, trigger: s, expansion: u };
}
const ca = {
  // ---- inline: date/time ----
  t: (r) => $e(r, `time:${wh(r.now)}`),
  now: (r) => $e(r, Rm(r.now)),
  d: (r) => $e(r, Ye(r.now)),
  today: (r) => $e(r, Ye(r.now)),
  tom: (r) => $e(r, Ye(tn(r.now, 1))),
  tomorrow: (r) => $e(r, Ye(tn(r.now, 1))),
  yday: (r) => $e(r, Ye(tn(r.now, -1))),
  yesterday: (r) => $e(r, Ye(tn(r.now, -1))),
  // ---- inline: id ----
  id: (r) => $e(r, `id:${Bm()}`),
  // ---- inline: hidden flag (SwiftoDo/Simpletask convention) ----
  h: (r) => $e(r, "h:1"),
  // ---- line-level: archive (ADDS archived:1 flag, NOT move-to-done.txt;
  //      kept because the CLI's `archive` command is semantically different) ----
  archive: (r) => dn(r, (e) => {
    if (!e.trim()) return e;
    const t = xt(e) ? e : `x ${Ye(r.now)} ${e.replace(/^\([A-Z]\)\s/, "")}`;
    return t.includes("archived:1") ? t : `${t} archived:1`;
  }),
  // ---- line-level: completion / priority. Whole-line transforms, exposed
  //      here as inline quick-keys as well as from the CLI palette so they
  //      work without leaving the editor.
  //      !!d / !!t / !!h stay inline — matched as exact handlers ABOVE first. ----
  done: (r) => dn(r, (e) => !e.trim() || xt(e) ? e : `x ${Ye(r.now)} ${e.replace(/^\([A-Z]\)\s/, "")}`),
  undone: (r) => dn(r, (e) => e.replace(/^x\s+(\d{4}-\d{2}-\d{2}\s+)?/, "")),
  "pri-": (r) => dn(r, (e) => e.replace(/^\([A-Z]\)\s+/, "")),
  priup: (r) => dn(r, (e) => {
    const t = e.match(/^\(([A-Z])\)\s+/), n = t ? e.slice(t[0].length) : e;
    return n.trim() ? `(${t ? String.fromCharCode(Math.max(65, t[1].charCodeAt(0) - 1)) : "A"}) ${n}` : e;
  }),
  pridown: (r) => dn(r, (e) => {
    const t = e.match(/^\(([A-Z])\)\s+/);
    if (!t) return e;
    const n = e.slice(t[0].length), i = t[1].charCodeAt(0);
    return i >= 90 ? n : `(${String.fromCharCode(i + 1)}) ${n}`;
  }),
  date: (r) => dn(r, (e) => {
    if (!e.trim()) return e;
    const t = e.match(/^(\([A-Z]\)\s+)/), n = t ? t[1] : "", i = t ? e.slice(t[0].length) : e;
    return /^\d{4}-\d{2}-\d{2}\s/.test(i) ? e : `${n}${Ye(r.now)} ${i}`;
  })
}, $m = [
  // !!due:<rel> → due:<date>
  (r) => {
    const e = r.body.match(/^due:(.+)$/);
    if (!e) return null;
    const t = Bi(e[1], r.now);
    return t ? $e(r, `due:${Ye(t)}`) : null;
  },
  // !!t:<rel> → t:<date> (threshold)
  (r) => {
    const e = r.body.match(/^t:(.+)$/);
    if (!e) return null;
    const t = Bi(e[1], r.now);
    return t ? $e(r, `t:${Ye(t)}`) : null;
  },
  // !!rec:<spec> → rec:+<spec> (auto-prepend + if missing)
  (r) => {
    const e = r.body.match(/^rec:(.+)$/);
    if (!e) return null;
    const t = e[1].startsWith("+") ? e[1] : `+${e[1]}`;
    return /^\+\d+[dwmyb]$/.test(t) ? $e(r, `rec:${t}`) : null;
  },
  // !!p+foo → +foo (quick project insertion mid-typing)
  (r) => {
    const e = r.body.match(/^p(\+[A-Za-z0-9_-]+)$/);
    return e ? $e(r, e[1]) : null;
  },
  // !!@bar → @bar (quick context insertion mid-typing)
  (r) => /^@[A-Za-z0-9_-]+$/.test(r.body) ? $e(r, r.body) : null,
  // !!a .. !!z → set whole-line priority to that letter. d/t/h are matched
  // as exact inline handlers ABOVE, so they never reach this pattern.
  (r) => {
    if (!/^[a-z]$/.test(r.body)) return null;
    const e = r.body.toUpperCase();
    return dn(r, (t) => {
      const n = t.replace(/^\([A-Z]\)\s+/, "");
      return n.trim() ? `(${e}) ${n}` : t;
    });
  },
  // !!+Nd / +Nw / +Nm / +Ny / +Nb → absolute date today+offset
  (r) => {
    const e = Bi(`+${r.body.replace(/^\+/, "")}`, r.now);
    return !e || !/^\+?\d+[dwmyb]$/.test(r.body) ? null : $e(r, Ye(e));
  },
  // !!mon .. !!sun on their own → next-occurrence date
  (r) => {
    if (!(r.body in ll)) return null;
    const e = vh(r.now, r.body);
    return e ? $e(r, Ye(e)) : null;
  }
];
function Fm(r, e, t = () => /* @__PURE__ */ new Date()) {
  if (e <= 0 || e > r.length) return null;
  const n = r[e - 1];
  if (!Lm.has(n)) return null;
  let i = e - 2;
  for (; i >= 1; ) {
    if (r[i] === `
`) return null;
    if (r[i - 1] === "!" && r[i] === "!") break;
    i -= 1;
  }
  if (i < 1 || r[i - 1] !== "!" || r[i] !== "!") return null;
  const o = i - 1, s = e - 2;
  if (s < o + 1) return null;
  const l = r.slice(o + 2, s + 1);
  if (!l) return null;
  const c = {
    full: `!!${l}`,
    body: l,
    value: r,
    caret: e,
    triggerStart: o,
    triggerEnd: s + 1,
    // exclusive for splice math
    now: t(),
    triggerChar: n
  }, h = ca[l] || ca[l.toLowerCase()];
  if (h)
    return h(c);
  for (const d of $m) {
    const u = d(c);
    if (u) return u;
  }
  return null;
}
const ha = [
  // --- inline text expanders (kept; no CLI equivalent — mid-typing only) ---
  { trigger: "!!d / !!today", expansion: "YYYY-MM-DD (today)", kind: "inline" },
  { trigger: "!!tom", expansion: "tomorrow", kind: "inline" },
  { trigger: "!!yday", expansion: "yesterday", kind: "inline" },
  { trigger: "!!mon … !!sun", expansion: "next that weekday", kind: "inline" },
  { trigger: "!!+3d / !!+1w / !!+2m / !!+5b", expansion: "offset from today (b=business days)", kind: "inline" },
  { trigger: "!!t", expansion: "time:HH:MM (now)", kind: "inline" },
  { trigger: "!!now", expansion: "YYYY-MM-DDTHH:MM", kind: "inline" },
  { trigger: "!!due:fri / +1w / tom", expansion: "due:<resolved-date>", kind: "inline" },
  { trigger: "!!t:<rel>", expansion: "t:<resolved-date> (defer)", kind: "inline" },
  { trigger: "!!rec:1w / 3d / 1m / 5b", expansion: "rec:+1w (recurring, b=biz days)", kind: "inline" },
  { trigger: "!!id", expansion: "id:<8-char-random>", kind: "inline" },
  { trigger: "!!h", expansion: "h:1 (hide from default view)", kind: "inline" },
  // --- line-level (kept; unique semantic vs CLI `archive` which moves to done.txt) ---
  { trigger: "!!archive", expansion: "complete + add archived:1 tag (same line)", kind: "line" },
  { trigger: "!!done", expansion: "complete: prepend x + today, strip priority", kind: "line" },
  { trigger: "!!undone", expansion: "un-complete: strip x + completion date", kind: "line" },
  { trigger: "!!a … !!z", expansion: "set priority to that letter", kind: "line" },
  { trigger: "!!pri-", expansion: "strip priority", kind: "line" },
  { trigger: "!!priup / !!pridown", expansion: "bump priority up / down (A = top)", kind: "line" },
  { trigger: "!!date", expansion: "prepend creation date (today)", kind: "line" },
  { trigger: "!!p+proj", expansion: "+proj (quick project)", kind: "inline" },
  { trigger: "!!@ctx", expansion: "@ctx (quick context)", kind: "inline" },
  // --- Tab-complete (not a !! shortcut; documented here for discoverability) ---
  { trigger: "+par<Tab>", expansion: 'cycle +projects starting with "par" (file)', kind: "inline" },
  { trigger: "@hom<Tab>", expansion: 'cycle @contexts starting with "hom" (file)', kind: "inline" }
];
function Hm(r, e) {
  let t = e;
  for (; t > 0 && !/\s/.test(r[t - 1]); ) t--;
  const n = r.slice(t, e);
  if (n.length < 1) return null;
  const i = n[0];
  if (i !== "+" && i !== "@") return null;
  const o = n.slice(1);
  return { prefix: i, partial: o, start: t, end: e };
}
function Wm(r) {
  const e = /* @__PURE__ */ new Set(), t = /* @__PURE__ */ new Set(), n = /(^|\s)([+@])([A-Za-z0-9_-]+)/g;
  let i;
  for (; (i = n.exec(r)) !== null; )
    i[2] === "+" ? e.add(i[3]) : t.add(i[3]);
  return {
    projects: [...e].sort(),
    contexts: [...t].sort()
  };
}
function zm(r, e, t = 0) {
  const n = Hm(r, e);
  if (!n) return null;
  const { projects: i, contexts: o } = Wm(r), s = n.prefix === "+" ? i : o, l = n.partial.toLowerCase(), c = s.filter((w) => w.toLowerCase().startsWith(l)).filter(
    (w) => w.toLowerCase() !== l || l === ""
  );
  if (c.length === 0) return null;
  const h = (t % c.length + c.length) % c.length, d = c[h], u = n.prefix + d, f = r.slice(0, n.start) + u + r.slice(n.end), g = n.start + u.length;
  return { value: f, caret: g, matches: c, chosen: d };
}
const Vm = [
  "boxSizing",
  "width",
  // explicitly set below to match clientWidth
  "height",
  "overflowX",
  "overflowY",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStyle",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "fontSizeAdjust",
  "lineHeight",
  "fontFamily",
  "textAlign",
  "textTransform",
  "textIndent",
  "textDecoration",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
  "MozTabSize",
  "whiteSpace",
  "wordWrap",
  "wordBreak"
];
function da(r, e) {
  const t = document.createElement("div"), n = window.getComputedStyle(r);
  for (const g of Vm)
    t.style[g] = n.getPropertyValue(
      g.replace(/([A-Z])/g, "-$1").toLowerCase()
    );
  t.style.position = "absolute", t.style.visibility = "hidden", t.style.top = "0", t.style.left = "-9999px", t.style.overflow = "hidden", t.style.width = `${r.clientWidth}px`, t.style.height = "auto", t.style.whiteSpace = "pre-wrap", t.style.wordWrap = "break-word";
  const i = r.value.substring(0, e);
  t.textContent = i;
  const o = document.createElement("span");
  o.textContent = "​", t.appendChild(o), document.body.appendChild(t);
  const s = o.getBoundingClientRect(), l = t.getBoundingClientRect(), a = r.getBoundingClientRect(), c = s.left - l.left, h = s.top - l.top, d = a.left + c - r.scrollLeft, u = a.top + h - r.scrollTop, f = parseFloat(n.lineHeight) || parseFloat(n.fontSize) * 1.4 || 16;
  return document.body.removeChild(t), new DOMRect(d, u, 0, f);
}
function _m(r, e, t) {
  const n = da(r, e);
  if (e === t) return n;
  const i = da(r, t), o = Math.min(n.left, i.left), s = Math.min(n.top, i.top), l = Math.max(
    n.top + n.height,
    i.top + i.height
  ), a = Math.max(n.left, i.left);
  return new DOMRect(o, s, a - o, l - s);
}
function jm(r) {
  if (typeof r != "string") return null;
  const e = r.trim();
  if (e === "") return null;
  const t = e.split(/\s+/);
  if (t.length !== 3) return null;
  const [n, i, o] = t, s = new Date(n);
  if (Number.isNaN(s.getTime()) || !/^\d+$/.test(i) || !/^\d+$/.test(o)) return null;
  const l = Number.parseInt(i, 10), a = Number.parseInt(o, 10);
  return !Number.isFinite(l) || !Number.isFinite(a) ? null : { timestamp: s, active: l, done: a };
}
function kh(r) {
  if (typeof r != "string" || r === "") return [];
  const e = r.split(/\r?\n/), t = [];
  for (const n of e) {
    const i = jm(n);
    i !== null && t.push(i);
  }
  return t;
}
const Km = 90, as = 720, cs = 260, Sh = 44, Ch = 12, Ah = 12, Mh = 40, Um = "No snapshots yet. Run `report` from the command palette to capture one.", qm = 7, hs = 4, ds = 24 * 60 * 60 * 1e3;
function Ym(r, e, t) {
  const n = e.getTime(), i = n - t * ds;
  return r.filter((o) => {
    const s = o.timestamp.getTime();
    return s >= i && s <= n;
  });
}
function Gm(r) {
  if (!Number.isFinite(r) || r <= 0) return 1;
  const e = r / hs, t = Math.pow(10, Math.floor(Math.log10(e))), n = e / t;
  let i;
  return n <= 1 ? i = 1 * t : n <= 2 ? i = 2 * t : n <= 5 ? i = 5 * t : i = 10 * t, Math.ceil(r / i) * i;
}
function Ro(r) {
  const e = String(r.getUTCMonth() + 1).padStart(2, "0"), t = String(r.getUTCDate()).padStart(2, "0");
  return `${e}/${t}`;
}
function ua(r, e, t, n, i) {
  const o = Sh, s = as - Ch, l = Ah, a = cs - Mh, c = s - o, h = a - l, d = Math.max(1, n - t), u = i <= 0 ? 1 : i;
  return r.map((f) => {
    const g = (f.timestamp.getTime() - t) / d, w = e(f), k = w / u;
    return {
      x: o + g * c,
      y: a - k * h,
      value: w,
      timestamp: f.timestamp
    };
  });
}
function fa(r) {
  return r.map((e) => `${e.x.toFixed(2)},${e.y.toFixed(2)}`).join(" ");
}
const pi = {
  width: "100%",
  minHeight: 260,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  fontFamily: "inherit",
  color: "var(--color-fg, #222)"
}, Jm = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  fontSize: 12,
  color: "var(--color-muted-fg, #888)"
}, pa = (r) => ({
  display: "inline-block",
  width: 10,
  height: 10,
  marginRight: 6,
  borderRadius: 2,
  verticalAlign: "middle",
  background: r
}), Xm = {
  width: "100%",
  height: "auto",
  maxHeight: 360,
  display: "block"
}, ma = {
  padding: "24px 16px",
  textAlign: "center",
  color: "var(--color-muted-fg, #888)",
  fontSize: 13,
  fontFamily: "inherit"
}, Zm = {
  padding: "12px 16px",
  color: "var(--color-danger, var(--color-error, #c33))",
  fontSize: 12
};
function Qm({
  data: r,
  fetcher: e,
  now: t,
  windowDays: n = Km
} = {}) {
  const [i, o] = q(
    () => r !== void 0 ? { status: "ready", points: r } : { status: "idle" }
  );
  U(() => {
    if (r !== void 0) {
      o({ status: "ready", points: r });
      return;
    }
    let S = !1;
    const B = e ?? (($) => fetch($));
    return o({ status: "loading" }), B("/apps/todo-txt/api/file?name=report").then(async ($) => {
      if (!$.ok)
        throw new Error(`HTTP ${$.status}`);
      const G = await $.json(), W = typeof G.content == "string" ? G.content : "";
      return kh(W);
    }).then(($) => {
      S || o({ status: "ready", points: $ });
    }).catch(($) => {
      if (S) return;
      const G = $ instanceof Error ? $.message : String($);
      o({ status: "error", message: G });
    }), () => {
      S = !0;
    };
  }, [r, e]);
  const s = Qe(
    () => t instanceof Date ? t : /* @__PURE__ */ new Date(),
    [t]
  ), l = Qe(() => i.status !== "ready" ? [] : Ym(i.points, s, n), [i, s, n]);
  if (i.status === "loading")
    return /* @__PURE__ */ y("div", { style: pi, "data-testid": "report-chart-loading", children: /* @__PURE__ */ y("div", { style: ma, children: "Loading snapshots…" }) });
  if (i.status === "error")
    return /* @__PURE__ */ y("div", { style: pi, "data-testid": "report-chart-error", children: /* @__PURE__ */ C("div", { style: Zm, children: [
      "Failed to load report.txt: ",
      i.message
    ] }) });
  if (l.length === 0)
    return /* @__PURE__ */ y("div", { style: pi, "data-testid": "report-chart-empty", children: /* @__PURE__ */ y("div", { style: ma, children: Um }) });
  const a = s.getTime(), c = a - n * ds, h = l.reduce((S, B) => Math.max(S, B.active), 0), d = l.reduce((S, B) => Math.max(S, B.done), 0), u = Gm(Math.max(h, d)), f = ua(
    l,
    (S) => S.active,
    c,
    a,
    u
  ), g = ua(
    l,
    (S) => S.done,
    c,
    a,
    u
  ), w = Sh, k = as - Ch, v = Ah, D = cs - Mh, N = k - w, Y = D - v, A = [];
  for (let S = 0; S <= n; S += qm) {
    const B = c + S * ds, $ = (B - c) / Math.max(1, a - c);
    A.push({
      x: w + $ * N,
      label: Ro(new Date(B))
    });
  }
  const T = [];
  for (let S = 0; S <= hs; S += 1) {
    const B = u * S / hs, $ = B / Math.max(1, u);
    T.push({
      y: D - $ * Y,
      label: Number.isInteger(B) ? String(B) : B.toFixed(1)
    });
  }
  return /* @__PURE__ */ C("div", { style: pi, "data-testid": "report-chart", children: [
    /* @__PURE__ */ C("div", { style: Jm, "data-testid": "report-chart-legend", children: [
      /* @__PURE__ */ C("span", { children: [
        /* @__PURE__ */ y(
          "span",
          {
            style: pa("var(--warning, #f59e0b)"),
            "aria-hidden": "true",
            "data-testid": "report-chart-legend-active"
          }
        ),
        "active"
      ] }),
      /* @__PURE__ */ C("span", { children: [
        /* @__PURE__ */ y(
          "span",
          {
            style: pa("var(--success, #10b981)"),
            "aria-hidden": "true",
            "data-testid": "report-chart-legend-done"
          }
        ),
        "done"
      ] }),
      /* @__PURE__ */ C("span", { style: { marginLeft: "auto" }, children: [
        l.length,
        " snapshot",
        l.length === 1 ? "" : "s",
        " ·",
        " ",
        "last ",
        n,
        " days"
      ] })
    ] }),
    /* @__PURE__ */ C(
      "svg",
      {
        role: "img",
        "aria-label": `todo.txt history — last ${n} days`,
        "data-testid": "report-chart-svg",
        viewBox: `0 0 ${as} ${cs}`,
        preserveAspectRatio: "xMidYMid meet",
        style: Xm,
        children: [
          /* @__PURE__ */ y(
            "rect",
            {
              x: w,
              y: v,
              width: N,
              height: Y,
              fill: "transparent",
              "data-testid": "report-chart-plot-area"
            }
          ),
          /* @__PURE__ */ y("g", { "data-testid": "report-chart-y-axis", children: T.map((S, B) => /* @__PURE__ */ C("g", { children: [
            /* @__PURE__ */ y(
              "line",
              {
                x1: w,
                x2: k,
                y1: S.y,
                y2: S.y,
                stroke: "var(--color-border, #e5e7eb)",
                strokeWidth: 1,
                strokeDasharray: "2 3"
              }
            ),
            /* @__PURE__ */ y(
              "text",
              {
                x: w - 6,
                y: S.y + 3,
                fontSize: 10,
                textAnchor: "end",
                fill: "var(--color-muted-fg, #888)",
                children: S.label
              }
            )
          ] }, `ytick-${B}`)) }),
          /* @__PURE__ */ C("g", { "data-testid": "report-chart-x-axis", children: [
            /* @__PURE__ */ y(
              "line",
              {
                x1: w,
                x2: k,
                y1: D,
                y2: D,
                stroke: "var(--color-border, #e5e7eb)",
                strokeWidth: 1
              }
            ),
            A.map((S, B) => /* @__PURE__ */ C("g", { children: [
              /* @__PURE__ */ y(
                "line",
                {
                  x1: S.x,
                  x2: S.x,
                  y1: D,
                  y2: D + 4,
                  stroke: "var(--color-border, #e5e7eb)",
                  strokeWidth: 1
                }
              ),
              /* @__PURE__ */ y(
                "text",
                {
                  x: S.x,
                  y: D + 16,
                  fontSize: 10,
                  textAnchor: "middle",
                  fill: "var(--color-muted-fg, #888)",
                  children: S.label
                }
              )
            ] }, `xtick-${B}`))
          ] }),
          /* @__PURE__ */ y(
            "polyline",
            {
              "data-testid": "report-chart-series-active",
              fill: "none",
              stroke: "var(--warning, #f59e0b)",
              strokeWidth: 2,
              strokeLinejoin: "round",
              strokeLinecap: "round",
              points: fa(f)
            }
          ),
          f.map((S, B) => /* @__PURE__ */ y(
            "circle",
            {
              cx: S.x,
              cy: S.y,
              r: 2.5,
              fill: "var(--warning, #f59e0b)",
              "data-testid": "report-chart-series-active-point",
              children: /* @__PURE__ */ C("title", { children: [
                Ro(S.timestamp),
                " · active=",
                S.value
              ] })
            },
            `active-pt-${B}`
          )),
          /* @__PURE__ */ y(
            "polyline",
            {
              "data-testid": "report-chart-series-done",
              fill: "none",
              stroke: "var(--success, #10b981)",
              strokeWidth: 2,
              strokeLinejoin: "round",
              strokeLinecap: "round",
              points: fa(g)
            }
          ),
          g.map((S, B) => /* @__PURE__ */ y(
            "circle",
            {
              cx: S.x,
              cy: S.y,
              r: 2.5,
              fill: "var(--success, #10b981)",
              "data-testid": "report-chart-series-done-point",
              children: /* @__PURE__ */ C("title", { children: [
                Ro(S.timestamp),
                " · done=",
                S.value
              ] })
            },
            `done-pt-${B}`
          ))
        ]
      }
    )
  ] });
}
function eg(r, e) {
  if (!e) return !0;
  const t = e.trim().toLowerCase();
  return t ? `${r.name} ${r.shortName ?? ""} ${r.description}`.toLowerCase().includes(t) : !0;
}
function tg(r, e) {
  const t = r.trim();
  if (!t) return null;
  const n = t.indexOf(" ");
  if (n === -1) return null;
  const i = t.slice(0, n).toLowerCase(), o = t.slice(n + 1).trim();
  if (!o) return null;
  for (const s of e)
    if (s.name.toLowerCase() === i || s.shortName && s.shortName.toLowerCase() === i)
      return { cmd: s, rest: o };
  return null;
}
function ng(r, e) {
  if (e <= 1) return [r];
  const t = r.split(/\s+/);
  if (t.length <= e) {
    for (; t.length < e; ) t.push("");
    return t;
  }
  const n = t.slice(0, e - 1);
  return n.push(t.slice(e - 1).join(" ")), n;
}
const rg = {
  position: "fixed",
  inset: 0,
  zIndex: 1e3,
  background: "rgba(0, 0, 0, 0.72)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: "10vh"
}, ig = {
  width: "min(640px, 92vw)",
  maxHeight: "70vh",
  display: "flex",
  flexDirection: "column",
  // Follow the active UI theme. Fallback only kicks in when the dashboard
  // theme hasn't published --color-bg (never in practice). Earlier fix
  // used a fixed #0f172a which broke light themes; drop that.
  background: "var(--color-bg, #111827)",
  color: "var(--color-fg, #e2e8f0)",
  border: "1px solid var(--color-border, #334155)",
  borderRadius: 8,
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04)",
  overflow: "hidden"
}, og = {
  width: "100%",
  padding: "12px 14px",
  fontSize: 14,
  background: "transparent",
  color: "var(--color-fg)",
  border: "none",
  borderBottom: "1px solid var(--color-border)",
  outline: "none",
  fontFamily: "inherit"
}, sg = {
  flex: 1,
  overflowY: "auto",
  listStyle: "none",
  margin: 0,
  padding: 4
}, lg = {
  padding: "16px 14px",
  color: "var(--color-muted-fg)",
  fontSize: 13
};
function ag(r) {
  return {
    padding: "8px 10px",
    borderRadius: 4,
    cursor: "pointer",
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    background: r ? "var(--color-bg-hover)" : "transparent",
    borderLeft: r ? "2px solid var(--accent)" : "2px solid transparent"
  };
}
const cg = {
  fontWeight: 600,
  color: "var(--color-fg)"
}, hg = {
  color: "var(--accent)",
  fontSize: 11,
  fontFamily: "var(--font-mono, monospace)"
}, dg = {
  color: "var(--color-muted-fg)",
  fontSize: 12,
  marginLeft: "auto",
  textAlign: "right",
  maxWidth: "60%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
}, ug = {
  borderTop: "1px solid var(--color-border)",
  padding: "10px 12px",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  background: "var(--color-bg)"
}, fg = {
  display: "flex",
  flexDirection: "column",
  gap: 2
}, pg = {
  fontSize: 11,
  color: "var(--color-muted-fg)"
}, mg = {
  padding: "6px 8px",
  fontSize: 13,
  background: "var(--color-bg)",
  color: "var(--color-fg)",
  border: "1px solid var(--color-border)",
  borderRadius: 4,
  outline: "none",
  fontFamily: "inherit"
}, gg = {
  fontSize: 11,
  color: "var(--color-muted-fg)",
  padding: "6px 12px",
  borderTop: "1px solid var(--color-border)"
};
function yg({
  open: r,
  onClose: e,
  onExecute: t,
  commands: n
}) {
  const [i, o] = q(""), [s, l] = q(0), [a, c] = q(null), [h, d] = q([]), u = z(null), f = z(null), g = z(null), w = Qe(
    () => n.filter((A) => eg(A, i)),
    [n, i]
  );
  U(() => {
    var S;
    const A = f.current;
    if (!A) return;
    const T = A.children[s];
    T && ((S = T.scrollIntoView) == null || S.call(T, { block: "nearest", inline: "nearest" }));
  }, [s, w.length]), U(() => {
    if (r) {
      o(""), l(0), c(null), d([]);
      const A = window.setTimeout(() => {
        var T;
        (T = u.current) == null || T.focus();
      }, 0);
      return () => window.clearTimeout(A);
    }
  }, [r]), U(() => {
    l((A) => w.length === 0 ? 0 : A >= w.length ? w.length - 1 : A < 0 ? 0 : A);
  }, [w.length]), U(() => {
    if (a) {
      const A = window.setTimeout(() => {
        var T;
        (T = g.current) == null || T.focus();
      }, 0);
      return () => window.clearTimeout(A);
    }
  }, [a]), U(() => {
    if (!r) return;
    const A = (T) => {
      T.key === "Escape" && (T.preventDefault(), T.stopPropagation(), T.stopImmediatePropagation(), a ? (c(null), d([]), window.setTimeout(() => {
        var S;
        return (S = u.current) == null ? void 0 : S.focus();
      }, 0)) : e());
    };
    return window.addEventListener("keydown", A, { capture: !0 }), () => window.removeEventListener("keydown", A, { capture: !0 });
  }, [r, e, a]);
  const k = P(
    (A, T) => {
      t(A, T), e();
    },
    [e, t]
  ), v = P(
    (A) => {
      if (A.argSchema.length === 0) {
        k(A, []);
        return;
      }
      c(A), d(new Array(A.argSchema.length).fill(""));
    },
    [k]
  ), D = P(
    (A) => {
      if (A.key === "Escape") {
        A.preventDefault(), e();
        return;
      }
      if (A.key === "ArrowDown" || A.key === "Tab" && !A.shiftKey) {
        A.preventDefault(), l(
          (T) => w.length === 0 ? 0 : Math.min(T + 1, w.length - 1)
        );
        return;
      }
      if (A.key === "ArrowUp" || A.key === "Tab" && A.shiftKey) {
        A.preventDefault(), l((T) => Math.max(T - 1, 0));
        return;
      }
      if (A.key === "Enter") {
        A.preventDefault();
        const T = tg(i, n);
        if (T) {
          const B = T.cmd.argSchema.length, $ = ng(T.rest, B || 1);
          k(T.cmd, B === 0 ? [] : $);
          return;
        }
        const S = w[s];
        S && v(S);
      }
    },
    [v, w, e, s]
  ), N = P(
    (A, T) => {
      var S, B, $;
      if (A.key === "Escape") {
        A.preventDefault(), c(null), d([]), window.setTimeout(() => {
          var G;
          return (G = u.current) == null ? void 0 : G.focus();
        }, 0);
        return;
      }
      if (A.key === "Enter") {
        if (A.preventDefault(), !a) return;
        if (T === a.argSchema.length - 1)
          k(a, h);
        else {
          const W = ($ = (B = (S = A.currentTarget.parentElement) == null ? void 0 : S.parentElement) == null ? void 0 : B.children[T + 1]) == null ? void 0 : $.querySelector("input");
          W == null || W.focus();
        }
      }
    },
    [h, a, k]
  ), Y = P(
    (A) => {
      A.target === A.currentTarget && e();
    },
    [e]
  );
  return r ? /* @__PURE__ */ y(
    "div",
    {
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Command palette",
      style: rg,
      onClick: Y,
      "data-testid": "command-palette-backdrop",
      children: /* @__PURE__ */ C("div", { style: ig, "data-testid": "command-palette", children: [
        /* @__PURE__ */ y(
          "input",
          {
            ref: u,
            type: "text",
            value: i,
            placeholder: "Type a command… (Esc to close)",
            style: og,
            onChange: (A) => {
              o(A.target.value), l(0);
            },
            onKeyDown: D,
            "aria-label": "Search commands",
            "data-testid": "command-palette-search"
          }
        ),
        w.length === 0 ? /* @__PURE__ */ C("div", { style: lg, "data-testid": "command-palette-empty", children: [
          'No commands match "',
          i,
          '".'
        ] }) : /* @__PURE__ */ y(
          "ul",
          {
            ref: f,
            style: sg,
            role: "listbox",
            "aria-label": "Commands",
            "data-testid": "command-palette-list",
            children: w.map((A, T) => {
              const S = T === s;
              return /* @__PURE__ */ C(
                "li",
                {
                  role: "option",
                  "aria-selected": S,
                  style: ag(S),
                  onMouseEnter: () => l(T),
                  onClick: () => v(A),
                  "data-testid": `command-item-${A.name}`,
                  "data-active": S ? "true" : "false",
                  children: [
                    /* @__PURE__ */ y("span", { style: cg, children: A.name }),
                    A.shortName ? /* @__PURE__ */ C("span", { style: hg, children: [
                      "(",
                      A.shortName,
                      ")"
                    ] }) : null,
                    /* @__PURE__ */ y("span", { style: dg, children: A.description })
                  ]
                },
                A.name
              );
            })
          }
        ),
        a ? /* @__PURE__ */ C("div", { style: ug, "data-testid": "command-palette-args", children: [
          /* @__PURE__ */ C("div", { style: { fontSize: 12, color: "var(--color-muted-fg)" }, children: [
            /* @__PURE__ */ y("strong", { style: { color: "var(--color-fg)" }, children: a.name }),
            " — ",
            a.description
          ] }),
          a.argSchema.map((A, T) => /* @__PURE__ */ C("label", { style: fg, children: [
            /* @__PURE__ */ C("span", { style: pg, children: [
              A.name,
              A.optional ? " (optional)" : "",
              A.description ? ` — ${A.description}` : ""
            ] }),
            /* @__PURE__ */ y(
              "input",
              {
                ref: T === 0 ? g : void 0,
                type: "text",
                value: h[T] ?? "",
                onChange: (S) => {
                  const B = h.slice();
                  B[T] = S.target.value, d(B);
                },
                onKeyDown: (S) => N(S, T),
                style: mg,
                "aria-label": A.name,
                "data-testid": `arg-input-${T}`
              }
            )
          ] }, A.name)),
          /* @__PURE__ */ y("div", { style: { fontSize: 11, color: "var(--color-muted-fg)" }, children: "Enter to run · Esc to go back" })
        ] }) : /* @__PURE__ */ y("div", { style: gg, children: "↑↓ to navigate · Enter to run · Esc to close" })
      ] })
    }
  ) : null;
}
const xg = {
  position: "fixed",
  inset: 0,
  zIndex: 1100,
  background: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  justifyContent: "flex-end"
}, bg = {
  width: "min(560px, 90vw)",
  height: "100%",
  background: "var(--color-bg, #0f172a)",
  color: "var(--color-fg, #e5e7eb)",
  borderLeft: "1px solid var(--color-border, #334155)",
  display: "flex",
  flexDirection: "column",
  fontFamily: "inherit",
  boxShadow: "-6px 0 24px rgba(0,0,0,0.4)"
}, wg = {
  padding: "10px 14px",
  borderBottom: "1px solid var(--color-border, #334155)",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
  fontWeight: 600
}, vg = {
  marginLeft: "auto",
  appearance: "none",
  background: "transparent",
  border: "none",
  color: "var(--color-muted-fg, #94a3b8)",
  cursor: "pointer",
  padding: "4px 8px",
  borderRadius: 4,
  fontSize: 13
}, kg = {
  flex: 1,
  overflowY: "auto",
  padding: "6px 0"
}, Sg = {
  display: "flex",
  alignItems: "baseline",
  gap: 12,
  padding: "6px 14px",
  cursor: "pointer",
  fontSize: 12,
  lineHeight: 1.4,
  borderLeft: "3px solid transparent"
};
function ga(r) {
  return {
    ...Sg,
    background: r ? "var(--color-bg-hover, rgba(255,255,255,0.04))" : "transparent",
    borderLeftColor: r ? "var(--accent, #6366f1)" : "transparent"
  };
}
const Cg = {
  fontFamily: "ui-monospace, SFMono-Regular, monospace",
  fontSize: 11,
  color: "var(--color-muted-fg, #94a3b8)",
  minWidth: 32,
  textAlign: "right",
  flexShrink: 0
}, Ag = {
  fontFamily: "ui-monospace, SFMono-Regular, monospace",
  fontSize: 11,
  color: "var(--color-muted-fg, #94a3b8)",
  marginLeft: "auto",
  background: "var(--color-bg-subtle, rgba(255,255,255,0.05))",
  padding: "1px 6px",
  borderRadius: 8,
  flexShrink: 0
}, ya = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  flex: 1,
  color: "var(--color-fg, #e5e7eb)"
}, xa = {
  padding: "24px 14px",
  color: "var(--color-muted-fg, #94a3b8)",
  fontSize: 12,
  textAlign: "center"
}, Mg = {
  padding: "6px 14px",
  borderTop: "1px solid var(--color-border, #334155)",
  fontSize: 10,
  color: "var(--color-muted-fg, #94a3b8)",
  display: "flex",
  gap: 12,
  justifyContent: "space-between"
};
function Dg({
  open: r,
  result: e,
  onClose: t,
  onJumpToLine: n,
  onDrillIn: i
}) {
  const o = z(null), [s, l] = q(0);
  U(() => {
    l(0);
  }, [e]), U(() => {
    if (!r) return;
    const d = (u) => {
      u.key === "Escape" && (u.preventDefault(), u.stopPropagation(), u.stopImmediatePropagation(), t());
    };
    return window.addEventListener("keydown", d, { capture: !0 }), () => window.removeEventListener("keydown", d, { capture: !0 });
  }, [r, t]), U(() => {
    if (!r) return;
    const d = requestAnimationFrame(() => {
      var u;
      (u = o.current) == null || u.focus();
    });
    return () => cancelAnimationFrame(d);
  }, [r]);
  const a = P(
    (d) => {
      if (e)
        if (e.type === "filter") {
          const u = e.lines[d];
          if (!u) return;
          n == null || n(u.index), t();
        } else {
          const u = e.groups[d];
          if (!u || !i) return;
          i(u.key, e.drillMode ?? "context");
        }
    },
    [e, n, i, t]
  ), c = (d) => {
    if (!e) return;
    const u = e.type === "filter" ? e.lines.length : e.groups.length;
    u !== 0 && (d.key === "ArrowDown" ? (d.preventDefault(), l((f) => (f + 1) % u)) : d.key === "ArrowUp" ? (d.preventDefault(), l((f) => (f - 1 + u) % u)) : d.key === "Home" ? (d.preventDefault(), l(0)) : d.key === "End" ? (d.preventDefault(), l(u - 1)) : d.key === "Enter" && (d.preventDefault(), a(s)));
  };
  return !r || !e ? null : /* @__PURE__ */ y(
    "div",
    {
      style: xg,
      onMouseDown: (d) => {
        d.target === d.currentTarget && t();
      },
      "data-testid": "todo-txt-result-backdrop",
      children: /* @__PURE__ */ C(
        "div",
        {
          ref: o,
          style: bg,
          role: "dialog",
          "aria-modal": "true",
          "aria-label": e.title,
          tabIndex: -1,
          onKeyDown: c,
          "data-testid": "todo-txt-result-panel",
          children: [
            /* @__PURE__ */ C("div", { style: wg, children: [
              /* @__PURE__ */ y("span", { "data-testid": "todo-txt-result-title", children: e.title }),
              /* @__PURE__ */ y(
                "span",
                {
                  style: {
                    fontWeight: 400,
                    fontSize: 11,
                    color: "var(--color-muted-fg, #94a3b8)"
                  },
                  children: e.type === "filter" ? `${e.lines.length} item${e.lines.length === 1 ? "" : "s"}` : `${e.groups.length} group${e.groups.length === 1 ? "" : "s"}`
                }
              ),
              /* @__PURE__ */ y(
                "button",
                {
                  type: "button",
                  style: vg,
                  onClick: t,
                  "aria-label": "Close result panel",
                  "data-testid": "todo-txt-result-close",
                  children: "Close ✕"
                }
              )
            ] }),
            /* @__PURE__ */ y("div", { style: kg, "data-testid": "todo-txt-result-body", children: e.type === "filter" ? e.lines.length === 0 ? /* @__PURE__ */ y("div", { style: xa, children: "No matching items." }) : e.lines.map((d, u) => /* @__PURE__ */ C(
              "div",
              {
                style: ga(u === s),
                onClick: () => {
                  l(u), a(u);
                },
                onMouseEnter: () => l(u),
                "data-testid": `todo-txt-result-row-${u}`,
                role: "button",
                tabIndex: -1,
                children: [
                  /* @__PURE__ */ y("span", { style: Cg, children: d.index }),
                  /* @__PURE__ */ y("span", { style: ya, children: d.text })
                ]
              },
              `${d.index}-${u}`
            )) : e.groups.length === 0 ? /* @__PURE__ */ y("div", { style: xa, children: "No groups found." }) : e.groups.map((d, u) => /* @__PURE__ */ C(
              "div",
              {
                style: ga(u === s),
                onClick: () => {
                  l(u), a(u);
                },
                onMouseEnter: () => l(u),
                "data-testid": `todo-txt-result-row-${u}`,
                role: "button",
                tabIndex: -1,
                children: [
                  /* @__PURE__ */ y("span", { style: ya, children: d.key }),
                  /* @__PURE__ */ y("span", { style: Ag, children: d.count })
                ]
              },
              d.key
            )) }),
            /* @__PURE__ */ y("div", { style: Mg, children: /* @__PURE__ */ C("span", { children: [
              "↑↓ navigate · Enter",
              " ",
              e.type === "filter" ? "jump to line" : "drill in",
              " · Esc close"
            ] }) })
          ]
        }
      )
    }
  );
}
const Bn = [
  {
    name: "todo",
    label: "Todo",
    ariaLabel: "Active tasks (todo.txt)"
  },
  {
    name: "done",
    label: "Done",
    ariaLabel: "Archived completed tasks (done.txt)"
  },
  {
    name: "report",
    label: "Report",
    ariaLabel: "Daily history snapshots (report.txt)"
  }
], Tg = {
  display: "flex",
  alignItems: "flex-end",
  gap: 2,
  // The parent header already has its own padding; FileTabs sits flush.
  margin: 0,
  padding: 0
};
function Eg(r) {
  return {
    appearance: "none",
    background: "transparent",
    border: "none",
    // 2-px "tab underline". Transparent when inactive keeps heights
    // identical so clicking through tabs doesn't reflow the header row.
    borderBottom: r ? "2px solid var(--accent, #6366f1)" : "2px solid transparent",
    padding: "6px 10px",
    fontSize: 13,
    fontFamily: "inherit",
    cursor: "pointer",
    color: r ? "var(--accent, #6366f1)" : "var(--text-muted, var(--color-muted-fg, #888))",
    fontWeight: r ? 700 : 500,
    outline: "none",
    // Remove the default button focus ring on non-keyboard activation.
    // `:focus-visible` is handled by the global stylesheet (same
    // convention as CommandPalette).
    transition: "color 120ms ease-out, border-color 120ms ease-out"
  };
}
function Og({ activeFile: r, onChange: e }) {
  const t = (i) => (o) => {
    o.preventDefault(), i !== r && e(i);
  }, n = (i) => (o) => {
    var h;
    const s = Bn.findIndex((d) => d.name === i);
    let l;
    switch (o.key) {
      case "ArrowRight":
        l = (s + 1) % Bn.length;
        break;
      case "ArrowLeft":
        l = (s - 1 + Bn.length) % Bn.length;
        break;
      case "Home":
        l = 0;
        break;
      case "End":
        l = Bn.length - 1;
        break;
      default:
        return;
    }
    o.preventDefault();
    const a = Bn[l], c = o.currentTarget.parentElement;
    (h = c == null ? void 0 : c.querySelector(
      `[data-testid="todo-txt-file-tab-${a.name}"]`
    )) == null || h.focus(), a.name !== r && e(a.name);
  };
  return /* @__PURE__ */ y(
    "nav",
    {
      role: "tablist",
      "aria-label": "todo.txt file switcher",
      "data-testid": "todo-txt-file-tabs",
      style: Tg,
      children: Bn.map((i) => {
        const o = i.name === r;
        return /* @__PURE__ */ y(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": o,
            "aria-label": i.ariaLabel,
            "data-testid": `todo-txt-file-tab-${i.name}`,
            tabIndex: o ? 0 : -1,
            onClick: t(i.name),
            onKeyDown: n(i.name),
            style: Eg(o),
            children: i.label
          },
          i.name
        );
      })
    }
  );
}
const Dh = [
  {
    key: "file-nav",
    title: "File & Navigation",
    // `where` / `set-root` answer and change WHICH directory the three files
    // live in, so they belong with the verbs that move between those files
    // rather than in the catch-all Other bucket.
    commandNames: ["example", "listfile", "archive", "move", "where", "set-root"]
  },
  {
    key: "task-ops",
    title: "Task Ops",
    commandNames: [
      "add",
      "do",
      "pri",
      "depri",
      "del",
      "replace",
      "append",
      "prepend",
      "sort",
      // `report` writes a snapshot to report.txt — belongs with mutating
      // task verbs. DESIGN.md §4 didn't list it; documented as a deviation
      // in the milestone 2 ping to the manager.
      "report"
    ]
  },
  {
    key: "filters",
    title: "Filters",
    commandNames: [
      "filter",
      "threshold",
      "hidden",
      "list",
      "listall",
      "listcon",
      "listproj",
      "listpri"
    ]
  },
  { key: "inline-shortcuts", title: "Inline Shortcuts", commandNames: [] }
], Lg = /* @__PURE__ */ new Set(["help"]), Th = "todo-txt.rail.v1", us = {
  "file-nav": !0,
  "task-ops": !0,
  filters: !0,
  "inline-shortcuts": !1,
  other: !0
}, mi = {
  open: !1,
  categories: { ...us }
};
function Eh() {
  if (typeof window > "u" || !window.localStorage) return mi;
  try {
    const r = window.localStorage.getItem(Th);
    if (!r) return mi;
    const e = JSON.parse(r), t = { ...us };
    if (e.categories && typeof e.categories == "object")
      for (const n of Object.keys(us)) {
        const i = e.categories[n];
        typeof i == "boolean" && (t[n] = i);
      }
    return {
      open: typeof e.open == "boolean" ? e.open : mi.open,
      categories: t
    };
  } catch {
    return mi;
  }
}
function Rg(r) {
  if (!(typeof window > "u" || !window.localStorage))
    try {
      window.localStorage.setItem(Th, JSON.stringify(r));
    } catch {
    }
}
function Ng() {
  return Eh().open;
}
const Bg = [
  { key: "palette", label: "Command palette", hint: "Ctrl+K", description: "Open every verb" },
  { key: "add", label: "add", hint: "a", description: "Append a new task line" },
  { key: "do", label: "do", hint: "x", description: "Mark item # done" },
  { key: "example", label: "example", hint: "template", description: "Fill todo.txt with a starter set" },
  { key: "help", label: "Help rail", hint: "Ctrl+/", description: "Toggle this panel" }
], Ig = {
  // Milestone 2-3 landing: fixed-position overlay pinned to the viewport's
  // right edge so we don't need to restructure TodoTxtPage's layout yet.
  // Milestone 4 (surface retirement) will promote this to a side-by-side
  // flex integration per DESIGN.md §6 once the cheatsheet/popover/modal
  // are gone and there's room to re-flow.
  position: "fixed",
  right: 0,
  top: "var(--todo-txt-rail-top, 56px)",
  bottom: 0,
  // Bumped 900 → 950 to explicitly sit above the editor
  // textarea (z-[3]) and its line-numbered gutter (z-[2]). 900 was
  // already enough in principle, but the user reported "renders BEHIND
  // editor text on lines 2–8" in the live dist — bumping leaves zero
  // ambiguity and stays under the palette/backups modals (z-[1000+]).
  zIndex: 950,
  width: "clamp(240px, 18%, 360px)",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  borderLeft: "1px solid var(--color-border, var(--border-strong))",
  background: "var(--color-bg, var(--bg))",
  color: "var(--color-fg, var(--text))",
  fontSize: "13px",
  overflow: "hidden",
  boxShadow: "-4px 0 16px rgba(0, 0, 0, 0.2)"
}, Pg = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 12px",
  borderBottom: "1px solid var(--color-border, var(--border-strong))",
  flexShrink: 0
}, $g = {
  fontSize: "13px",
  fontWeight: 600,
  color: "var(--color-fg, var(--text))",
  margin: 0
}, Fg = {
  fontSize: "11px",
  fontWeight: 400,
  color: "var(--color-muted-fg, var(--muted-aa))",
  marginLeft: 8
}, Hg = {
  appearance: "none",
  background: "transparent",
  border: "1px solid transparent",
  color: "var(--color-muted-fg, var(--muted-aa))",
  padding: "2px 6px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: "14px",
  lineHeight: 1
}, Wg = {
  flex: 1,
  overflowY: "auto",
  padding: "8px 0"
}, zg = {
  padding: "6px 12px 10px",
  borderBottom: "1px solid var(--color-border, var(--border-strong))"
}, Vg = {
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "var(--color-muted-fg, var(--muted-aa))",
  margin: "4px 0 6px"
}, _g = {
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: "6px 10px",
  alignItems: "baseline",
  padding: "3px 0"
}, jg = {
  fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
  fontSize: "11px",
  padding: "1px 5px",
  borderRadius: 3,
  background: "var(--color-bg-hover, rgba(255, 255, 255, 0.08))",
  color: "var(--color-fg, var(--text))",
  whiteSpace: "nowrap"
}, Kg = {
  fontSize: "12px",
  color: "var(--color-fg, var(--text))"
}, Hr = {
  fontSize: "11px",
  color: "var(--color-muted-fg, var(--muted-aa))",
  marginTop: 1
}, Ug = {
  appearance: "none",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 12px",
  background: "transparent",
  border: "none",
  color: "var(--color-fg, var(--text))",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "left"
}, Oh = {
  padding: "2px 12px 10px"
}, qg = {
  ...Oh,
  opacity: 0.7
}, Yg = {
  fontSize: "11px",
  fontStyle: "italic",
  color: "var(--color-muted-fg, var(--muted-aa))",
  margin: "0 0 6px"
}, Gg = {
  display: "inline-block",
  width: 12,
  marginRight: 8,
  color: "var(--color-muted-fg, var(--muted-aa))",
  fontSize: "10px",
  transition: "transform 120ms ease"
}, Jg = {
  fontSize: "10px",
  fontWeight: 500,
  color: "var(--color-muted-fg, var(--muted-aa))",
  marginLeft: "auto"
}, Xg = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "4px 10px",
  alignItems: "baseline",
  padding: "3px 0"
}, Zg = {
  fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
  fontSize: "12px",
  color: "var(--accent, var(--ring))"
}, Qg = {
  display: "grid",
  // Widened from 'auto auto 1fr' (8-px dot + trigger +
  // expansion) to 'auto auto 1fr' where the first slot is now a text
  // badge ("LINE" / "INLINE") instead of an ambiguous colored square.
  // The dot required legend decoding at the bottom of the section;
  // the badge is self-describing.
  gridTemplateColumns: "auto auto 1fr",
  gap: "4px 8px",
  alignItems: "baseline",
  padding: "3px 0"
}, e0 = (r) => ({
  display: "inline-block",
  fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
  fontSize: "9px",
  fontWeight: 600,
  letterSpacing: "0.04em",
  padding: "1px 5px",
  borderRadius: 3,
  textTransform: "uppercase",
  lineHeight: 1.4,
  whiteSpace: "nowrap",
  color: r === "line" ? "var(--color-muted-fg, var(--muted-aa))" : "var(--accent, var(--ring))",
  background: r === "line" ? "var(--color-bg-hover, rgba(148, 163, 184, 0.12))" : "var(--accent-subtle, rgba(125, 211, 252, 0.14))",
  border: "1px solid",
  borderColor: r === "line" ? "var(--color-border, var(--border-strong))" : "var(--accent, var(--ring))",
  flexShrink: 0
}), t0 = {
  padding: "10px 12px 12px",
  margin: "4px 10px 8px",
  borderRadius: 6,
  border: "1px solid var(--color-border, var(--border-strong))",
  background: "var(--color-bg-hover, rgba(125, 211, 252, 0.06))",
  color: "var(--color-fg, var(--text))",
  fontSize: "12px",
  lineHeight: 1.5
}, Ze = {
  display: "inline-block",
  fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
  fontSize: "11px",
  fontWeight: 600,
  padding: "1px 5px",
  borderRadius: 3,
  background: "var(--color-bg, var(--bg))",
  color: "var(--color-fg, var(--text))",
  border: "1px solid var(--color-border, var(--border-strong))",
  whiteSpace: "nowrap"
}, n0 = {
  padding: "16px 12px",
  fontSize: "12px",
  lineHeight: 1.5,
  color: "var(--color-muted-fg, var(--muted-aa))"
};
function r0(r, e) {
  if (e.commandNames.length === 0) return [];
  const t = new Map(r.map((n) => [n.name, n]));
  return e.commandNames.map((n) => t.get(n)).filter((n) => !!n);
}
function i0(r) {
  const e = /* @__PURE__ */ new Set();
  for (const t of Dh)
    for (const n of t.commandNames) e.add(n);
  return r.filter(
    (t) => !e.has(t.name) && !Lg.has(t.name)
  );
}
function o0(r, e) {
  return r !== "done" ? !1 : e === "task-ops" || e === "inline-shortcuts";
}
function ba(r) {
  return `todo-txt-help-category-${r}`;
}
function s0(r) {
  return !r.argSchema || r.argSchema.length === 0 ? "" : r.argSchema.map((e) => `<${e.name}>`).join(" ");
}
function wa({ command: r }) {
  const e = s0(r);
  return /* @__PURE__ */ y("div", { style: Xg, children: /* @__PURE__ */ C("div", { children: [
    /* @__PURE__ */ y("span", { style: Zg, children: r.name }),
    r.shortName ? /* @__PURE__ */ C("span", { style: { ...Hr, marginLeft: 6, display: "inline" }, children: [
      "(",
      r.shortName,
      ")"
    ] }) : null,
    e ? /* @__PURE__ */ y(
      "span",
      {
        style: {
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
          fontSize: "11px",
          color: "var(--color-muted-fg, var(--muted-aa))",
          marginLeft: 6
        },
        children: e
      }
    ) : null,
    /* @__PURE__ */ y("div", { style: Hr, children: r.description })
  ] }) });
}
function l0({
  trigger: r,
  expansion: e,
  kind: t
}) {
  return /* @__PURE__ */ C("div", { style: Qg, children: [
    /* @__PURE__ */ y("span", { style: e0(t), children: t === "line" ? "LINE" : "INLINE" }),
    /* @__PURE__ */ y(
      "span",
      {
        style: {
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
          fontSize: "11px",
          color: "var(--color-fg, var(--text))",
          whiteSpace: "nowrap"
        },
        children: r
      }
    ),
    /* @__PURE__ */ y("span", { style: Hr, children: e })
  ] });
}
function a0() {
  return /* @__PURE__ */ C("div", { style: t0, "data-testid": "todo-txt-help-palette-tip", children: [
    /* @__PURE__ */ y("div", { style: { fontWeight: 600, marginBottom: 4 }, children: "Command palette" }),
    /* @__PURE__ */ C("div", { children: [
      "Press ",
      /* @__PURE__ */ y("kbd", { style: Ze, children: "Ctrl" }),
      /* @__PURE__ */ y("span", { "aria-hidden": "true", children: " + " }),
      /* @__PURE__ */ y("kbd", { style: Ze, children: "K" }),
      " ",
      "(or",
      " ",
      /* @__PURE__ */ y("kbd", { style: Ze, children: "⌘" }),
      /* @__PURE__ */ y("span", { "aria-hidden": "true", children: " + " }),
      /* @__PURE__ */ y("kbd", { style: Ze, children: "K" }),
      ") to open the command palette for",
      " ",
      /* @__PURE__ */ y("code", { style: { fontFamily: "var(--font-mono, monospace)" }, children: "add" }),
      " / ",
      /* @__PURE__ */ y("code", { style: { fontFamily: "var(--font-mono, monospace)" }, children: "do" }),
      " / ",
      /* @__PURE__ */ y("code", { style: { fontFamily: "var(--font-mono, monospace)" }, children: "list" }),
      " / ",
      /* @__PURE__ */ y("code", { style: { fontFamily: "var(--font-mono, monospace)" }, children: "example" }),
      " / etc."
    ] })
  ] });
}
function va({
  id: r,
  title: e,
  count: t,
  expanded: n,
  onToggle: i,
  dimmed: o,
  hint: s,
  children: l,
  testId: a
}) {
  const c = `${r}-header`, h = `${r}-body`;
  return /* @__PURE__ */ C("section", { "data-testid": a, children: [
    /* @__PURE__ */ C(
      "button",
      {
        type: "button",
        id: c,
        "aria-expanded": n,
        "aria-controls": h,
        onClick: i,
        style: Ug,
        children: [
          /* @__PURE__ */ y("span", { style: { ...Gg, transform: n ? "rotate(90deg)" : "none" }, children: "▶" }),
          /* @__PURE__ */ y("span", { children: e }),
          /* @__PURE__ */ y("span", { style: Jg, children: t })
        ]
      }
    ),
    n ? /* @__PURE__ */ C(
      "div",
      {
        id: h,
        role: "region",
        "aria-labelledby": c,
        style: o ? qg : Oh,
        children: [
          s ? /* @__PURE__ */ y("p", { style: Yg, children: s }) : null,
          l
        ]
      }
    ) : null
  ] });
}
function c0() {
  return /* @__PURE__ */ C("div", { style: zg, "data-testid": "todo-txt-help-pinned", children: [
    /* @__PURE__ */ y("h3", { style: Vg, children: "Pinned" }),
    Bg.map((r) => /* @__PURE__ */ C("div", { style: _g, children: [
      /* @__PURE__ */ y("span", { style: jg, children: r.hint }),
      /* @__PURE__ */ C("div", { children: [
        /* @__PURE__ */ y("div", { style: Kg, children: r.label }),
        /* @__PURE__ */ y("div", { style: Hr, children: r.description })
      ] })
    ] }, r.key))
  ] });
}
const h0 = {
  padding: "10px 12px",
  borderBottom: "1px solid var(--color-border, var(--border-strong))",
  fontSize: "12px",
  lineHeight: 1.5
}, d0 = {
  display: "grid",
  gridTemplateColumns: "minmax(92px, auto) 1fr",
  gap: "4px 10px",
  marginTop: 6
}, wr = {
  fontFamily: "var(--font-mono, monospace)",
  color: "var(--accent, #f59e0b)",
  whiteSpace: "nowrap"
};
function u0() {
  return /* @__PURE__ */ C("div", { style: h0, "data-testid": "todo-txt-help-getting-started", children: [
    /* @__PURE__ */ y("div", { style: { fontWeight: 600, marginBottom: 4 }, children: "Getting started" }),
    /* @__PURE__ */ C("div", { children: [
      "It's a plain",
      " ",
      /* @__PURE__ */ y("code", { style: wr, children: "todo.txt" }),
      " file — edit it directly (it saves live) or use the command palette. The crucial commands:"
    ] }),
    /* @__PURE__ */ y("div", { style: d0, children: [
      ["add <task>", "new task (+proj @ctx due:YYYY-MM-DD)"],
      ["do 2", "complete item 2"],
      ["pri 2 A", "set priority A"],
      ["list @home", "filter (prefix -term to exclude)"],
      ["archive", "move done tasks to done.txt"],
      ["sort", "order by priority"]
    ].map(([e, t]) => /* @__PURE__ */ C(wf, { children: [
      /* @__PURE__ */ y("code", { style: wr, children: e }),
      /* @__PURE__ */ y("span", { children: t })
    ] }, e)) }),
    /* @__PURE__ */ C("div", { style: { marginTop: 8 }, children: [
      "Toggle ",
      /* @__PURE__ */ y("strong", { children: "VIM" }),
      " in the header (leader",
      " ",
      /* @__PURE__ */ y("kbd", { style: Ze, children: "\\" }),
      ":",
      " ",
      /* @__PURE__ */ y("code", { style: wr, children: "\\x" }),
      " done,",
      " ",
      /* @__PURE__ */ y("code", { style: wr, children: "\\d" }),
      " date). Press",
      " ",
      /* @__PURE__ */ y("kbd", { style: Ze, children: "Ctrl/⌘" }),
      /* @__PURE__ */ y("span", { "aria-hidden": "true", children: " + " }),
      /* @__PURE__ */ y("kbd", { style: Ze, children: "/" }),
      " toggles this panel;",
      " ",
      /* @__PURE__ */ y("kbd", { style: Ze, children: "Ctrl/⌘" }),
      /* @__PURE__ */ y("span", { "aria-hidden": "true", children: " + " }),
      /* @__PURE__ */ y("kbd", { style: Ze, children: "D" }),
      " completes the current line. In VIM, ",
      /* @__PURE__ */ y("kbd", { style: Ze, children: "Ctrl+D" }),
      " keeps its half-page scroll; use ",
      /* @__PURE__ */ y("code", { style: wr, children: "\\x" }),
      " to complete."
    ] }),
    /* @__PURE__ */ C("div", { style: { marginTop: 8 }, children: [
      "Multi-cursor: ",
      /* @__PURE__ */ y("kbd", { style: Ze, children: "Alt" }),
      " + click adds a cursor, ",
      /* @__PURE__ */ y("kbd", { style: Ze, children: "Ctrl/⌘+Alt+↑/↓" }),
      " adds one above or below, and ",
      /* @__PURE__ */ y("kbd", { style: Ze, children: "Alt" }),
      " + drag makes a rectangular selection. The ",
      /* @__PURE__ */ y("strong", { children: "Actions" }),
      " header setting cycles Auto, Manual (",
      /* @__PURE__ */ y("kbd", { style: Ze, children: "Alt+Enter" }),
      "), and Off."
    ] })
  ] });
}
function f0(r) {
  const { open: e, onClose: t, activeFile: n, commands: i } = r, [o, s] = q(
    () => Eh().categories
  );
  U(() => {
    Rg({ open: e, categories: o });
  }, [e, o]);
  const l = z(null), a = z(null);
  U(() => {
    var f;
    e ? (a.current = document.activeElement, (f = l.current) == null || f.focus()) : a.current && (a.current.focus(), a.current = null);
  }, [e]);
  const c = P(
    (f) => {
      f.key === "Escape" && (f.stopPropagation(), t());
    },
    [t]
  ), h = P((f) => {
    s((g) => ({ ...g, [f]: !g[f] }));
  }, []), d = Qe(() => i0(i), [i]);
  if (!e) return null;
  const u = n === "done" ? "On Done tab — Task Ops and inline shortcuts apply after switching to Todo." : "";
  return /* @__PURE__ */ C(
    "aside",
    {
      role: "complementary",
      "aria-label": "Help and reference",
      "data-testid": "todo-txt-help-panel",
      style: Ig,
      onKeyDown: c,
      children: [
        /* @__PURE__ */ C("div", { style: Pg, children: [
          /* @__PURE__ */ C("h2", { style: $g, id: "todo-txt-rail-title", children: [
            "Help & reference",
            n !== "todo" ? /* @__PURE__ */ C("span", { style: Fg, children: [
              "(",
              n,
              ")"
            ] }) : null
          ] }),
          /* @__PURE__ */ y(
            "button",
            {
              type: "button",
              ref: l,
              onClick: t,
              style: Hg,
              "aria-label": "Close help",
              "data-testid": "todo-txt-help-close",
              children: "×"
            }
          )
        ] }),
        n === "report" ? /* @__PURE__ */ C("div", { style: n0, children: [
          /* @__PURE__ */ C("p", { style: { margin: "0 0 10px" }, children: [
            "The Report tab accumulates snapshots written by the",
            " ",
            /* @__PURE__ */ y("code", { style: { fontFamily: "var(--font-mono, monospace)" }, children: "report" }),
            " ",
            "command. It isn't editable, so the command catalogue is hidden here."
          ] }),
          /* @__PURE__ */ y("p", { style: { margin: 0 }, children: "Switch back to the Todo tab to open the full reference." })
        ] }) : /* @__PURE__ */ C("div", { style: Wg, children: [
          /* @__PURE__ */ y(u0, {}),
          /* @__PURE__ */ y(a0, {}),
          /* @__PURE__ */ y(c0, {}),
          Dh.map((f) => {
            const g = f.key === "inline-shortcuts" ? ha : r0(i, f), w = g.length, k = o0(n, f.key), v = k && n === "done" ? "Switch to the Todo tab to run these." : void 0;
            return /* @__PURE__ */ y(
              va,
              {
                id: `todo-txt-rail-${f.key}`,
                testId: ba(f.key),
                title: f.title,
                count: w,
                expanded: !!o[f.key],
                onToggle: () => h(f.key),
                dimmed: k,
                hint: v,
                children: f.key === "inline-shortcuts" ? /* @__PURE__ */ y(bf, { children: ha.map((D) => /* @__PURE__ */ y(
                  l0,
                  {
                    trigger: D.trigger,
                    expansion: D.expansion,
                    kind: D.kind
                  },
                  D.trigger
                )) }) : g.map((D) => /* @__PURE__ */ y(wa, { command: D }, D.name))
              },
              f.key
            );
          }),
          d.length > 0 ? /* @__PURE__ */ y(
            va,
            {
              id: "todo-txt-rail-other",
              testId: ba("other"),
              title: "Other",
              count: d.length,
              expanded: !!o.other,
              onToggle: () => h("other"),
              children: d.map((f) => /* @__PURE__ */ y(wa, { command: f }, f.name))
            }
          ) : null,
          u ? /* @__PURE__ */ y(
            "div",
            {
              style: {
                ...Hr,
                padding: "8px 12px 14px",
                fontStyle: "italic"
              },
              "data-testid": "todo-txt-help-tab-hint",
              children: u
            }
          ) : null
        ] })
      ]
    }
  );
}
let fs = [], Lh = [];
(() => {
  let r = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((e) => e ? parseInt(e, 36) : 1);
  for (let e = 0, t = 0; e < r.length; e++)
    (e % 2 ? Lh : fs).push(t = t + r[e]);
})();
function p0(r) {
  if (r < 768) return !1;
  for (let e = 0, t = fs.length; ; ) {
    let n = e + t >> 1;
    if (r < fs[n]) t = n;
    else if (r >= Lh[n]) e = n + 1;
    else return !0;
    if (e == t) return !1;
  }
}
function ka(r) {
  return r >= 127462 && r <= 127487;
}
const Sa = 8205;
function m0(r, e, t = !0, n = !0) {
  return (t ? Rh : g0)(r, e, n);
}
function Rh(r, e, t) {
  if (e == r.length) return e;
  e && Nh(r.charCodeAt(e)) && Bh(r.charCodeAt(e - 1)) && e--;
  let n = No(r, e);
  for (e += Ca(n); e < r.length; ) {
    let i = No(r, e);
    if (n == Sa || i == Sa || t && p0(i))
      e += Ca(i), n = i;
    else if (ka(i)) {
      let o = 0, s = e - 2;
      for (; s >= 0 && ka(No(r, s)); )
        o++, s -= 2;
      if (o % 2 == 0) break;
      e += 2;
    } else
      break;
  }
  return e;
}
function g0(r, e, t) {
  for (; e > 1; ) {
    let n = Rh(r, e - 2, t);
    if (n < e) return n;
    e--;
  }
  return 0;
}
function No(r, e) {
  let t = r.charCodeAt(e);
  if (!Bh(t) || e + 1 == r.length) return t;
  let n = r.charCodeAt(e + 1);
  return Nh(n) ? (t - 55296 << 10) + (n - 56320) + 65536 : t;
}
function Nh(r) {
  return r >= 56320 && r < 57344;
}
function Bh(r) {
  return r >= 55296 && r < 56320;
}
function Ca(r) {
  return r < 65536 ? 1 : 2;
}
class se {
  /**
  Get the line description around the given position.
  */
  lineAt(e) {
    if (e < 0 || e > this.length)
      throw new RangeError(`Invalid position ${e} in document of length ${this.length}`);
    return this.lineInner(e, !1, 1, 0);
  }
  /**
  Get the description for the given (1-based) line number.
  */
  line(e) {
    if (e < 1 || e > this.lines)
      throw new RangeError(`Invalid line number ${e} in ${this.lines}-line document`);
    return this.lineInner(e, !0, 1, 0);
  }
  /**
  Replace a range of the text with the given content.
  */
  replace(e, t, n) {
    [e, t] = ar(this, e, t);
    let i = [];
    return this.decompose(
      0,
      e,
      i,
      2
      /* Open.To */
    ), n.length && n.decompose(
      0,
      n.length,
      i,
      3
      /* Open.To */
    ), this.decompose(
      t,
      this.length,
      i,
      1
      /* Open.From */
    ), _t.from(i, this.length - (t - e) + n.length);
  }
  /**
  Append another document to this one.
  */
  append(e) {
    return this.replace(this.length, this.length, e);
  }
  /**
  Retrieve the text between the given points.
  */
  slice(e, t = this.length) {
    [e, t] = ar(this, e, t);
    let n = [];
    return this.decompose(e, t, n, 0), _t.from(n, t - e);
  }
  /**
  Test whether this text is equal to another instance.
  */
  eq(e) {
    if (e == this)
      return !0;
    if (e.length != this.length || e.lines != this.lines)
      return !1;
    let t = this.scanIdentical(e, 1), n = this.length - this.scanIdentical(e, -1), i = new Or(this), o = new Or(e);
    for (let s = t, l = t; ; ) {
      if (i.next(s), o.next(s), s = 0, i.lineBreak != o.lineBreak || i.done != o.done || i.value != o.value)
        return !1;
      if (l += i.value.length, i.done || l >= n)
        return !0;
    }
  }
  /**
  Iterate over the text. When `dir` is `-1`, iteration happens
  from end to start. This will return lines and the breaks between
  them as separate strings.
  */
  iter(e = 1) {
    return new Or(this, e);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(e, t = this.length) {
    return new Ih(this, e, t);
  }
  /**
  Return a cursor that iterates over the given range of lines,
  _without_ returning the line breaks between, and yielding empty
  strings for empty lines.
  
  When `from` and `to` are given, they should be 1-based line numbers.
  */
  iterLines(e, t) {
    let n;
    if (e == null)
      n = this.iter();
    else {
      t == null && (t = this.lines + 1);
      let i = this.line(e).from;
      n = this.iterRange(i, Math.max(i, t == this.lines + 1 ? this.length : t <= 1 ? 0 : this.line(t - 1).to));
    }
    return new Ph(n);
  }
  /**
  Return the document as a string, using newline characters to
  separate lines.
  */
  toString() {
    return this.sliceString(0);
  }
  /**
  Convert the document to an array of lines (which can be
  deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
  */
  toJSON() {
    let e = [];
    return this.flatten(e), e;
  }
  /**
  @internal
  */
  constructor() {
  }
  /**
  Create a `Text` instance for the given array of lines.
  */
  static of(e) {
    if (e.length == 0)
      throw new RangeError("A document must have at least one line");
    return e.length == 1 && !e[0] ? se.empty : e.length <= 32 ? new De(e) : _t.from(De.split(e, []));
  }
}
class De extends se {
  constructor(e, t = y0(e)) {
    super(), this.text = e, this.length = t;
  }
  get lines() {
    return this.text.length;
  }
  get children() {
    return null;
  }
  lineInner(e, t, n, i) {
    for (let o = 0; ; o++) {
      let s = this.text[o], l = i + s.length;
      if ((t ? n : l) >= e)
        return new x0(i, l, n, s);
      i = l + 1, n++;
    }
  }
  decompose(e, t, n, i) {
    let o = e <= 0 && t >= this.length ? this : new De(Aa(this.text, e, t), Math.min(t, this.length) - Math.max(0, e));
    if (i & 1) {
      let s = n.pop(), l = Ii(o.text, s.text.slice(), 0, o.length);
      if (l.length <= 32)
        n.push(new De(l, s.length + o.length));
      else {
        let a = l.length >> 1;
        n.push(new De(l.slice(0, a)), new De(l.slice(a)));
      }
    } else
      n.push(o);
  }
  replace(e, t, n) {
    if (!(n instanceof De))
      return super.replace(e, t, n);
    [e, t] = ar(this, e, t);
    let i = Ii(this.text, Ii(n.text, Aa(this.text, 0, e)), t), o = this.length + n.length - (t - e);
    return i.length <= 32 ? new De(i, o) : _t.from(De.split(i, []), o);
  }
  sliceString(e, t = this.length, n = `
`) {
    [e, t] = ar(this, e, t);
    let i = "";
    for (let o = 0, s = 0; o <= t && s < this.text.length; s++) {
      let l = this.text[s], a = o + l.length;
      o > e && s && (i += n), e < a && t > o && (i += l.slice(Math.max(0, e - o), t - o)), o = a + 1;
    }
    return i;
  }
  flatten(e) {
    for (let t of this.text)
      e.push(t);
  }
  scanIdentical() {
    return 0;
  }
  static split(e, t) {
    let n = [], i = -1;
    for (let o of e)
      n.push(o), i += o.length + 1, n.length == 32 && (t.push(new De(n, i)), n = [], i = -1);
    return i > -1 && t.push(new De(n, i)), t;
  }
}
class _t extends se {
  constructor(e, t) {
    super(), this.children = e, this.length = t, this.lines = 0;
    for (let n of e)
      this.lines += n.lines;
  }
  lineInner(e, t, n, i) {
    for (let o = 0; ; o++) {
      let s = this.children[o], l = i + s.length, a = n + s.lines - 1;
      if ((t ? a : l) >= e)
        return s.lineInner(e, t, n, i);
      i = l + 1, n = a + 1;
    }
  }
  decompose(e, t, n, i) {
    for (let o = 0, s = 0; s <= t && o < this.children.length; o++) {
      let l = this.children[o], a = s + l.length;
      if (e <= a && t >= s) {
        let c = i & ((s <= e ? 1 : 0) | (a >= t ? 2 : 0));
        s >= e && a <= t && !c ? n.push(l) : l.decompose(e - s, t - s, n, c);
      }
      s = a + 1;
    }
  }
  replace(e, t, n) {
    if ([e, t] = ar(this, e, t), n.lines < this.lines)
      for (let i = 0, o = 0; i < this.children.length; i++) {
        let s = this.children[i], l = o + s.length;
        if (e >= o && t <= l) {
          let a = s.replace(e - o, t - o, n), c = this.lines - s.lines + a.lines;
          if (a.lines < c >> 4 && a.lines > c >> 6) {
            let h = this.children.slice();
            return h[i] = a, new _t(h, this.length - (t - e) + n.length);
          }
          return super.replace(o, l, a);
        }
        o = l + 1;
      }
    return super.replace(e, t, n);
  }
  sliceString(e, t = this.length, n = `
`) {
    [e, t] = ar(this, e, t);
    let i = "";
    for (let o = 0, s = 0; o < this.children.length && s <= t; o++) {
      let l = this.children[o], a = s + l.length;
      s > e && o && (i += n), e < a && t > s && (i += l.sliceString(e - s, t - s, n)), s = a + 1;
    }
    return i;
  }
  flatten(e) {
    for (let t of this.children)
      t.flatten(e);
  }
  scanIdentical(e, t) {
    if (!(e instanceof _t))
      return 0;
    let n = 0, [i, o, s, l] = t > 0 ? [0, 0, this.children.length, e.children.length] : [this.children.length - 1, e.children.length - 1, -1, -1];
    for (; ; i += t, o += t) {
      if (i == s || o == l)
        return n;
      let a = this.children[i], c = e.children[o];
      if (a != c)
        return n + a.scanIdentical(c, t);
      n += a.length + 1;
    }
  }
  static from(e, t = e.reduce((n, i) => n + i.length + 1, -1)) {
    let n = 0;
    for (let f of e)
      n += f.lines;
    if (n < 32) {
      let f = [];
      for (let g of e)
        g.flatten(f);
      return new De(f, t);
    }
    let i = Math.max(
      32,
      n >> 5
      /* Tree.BranchShift */
    ), o = i << 1, s = i >> 1, l = [], a = 0, c = -1, h = [];
    function d(f) {
      let g;
      if (f.lines > o && f instanceof _t)
        for (let w of f.children)
          d(w);
      else f.lines > s && (a > s || !a) ? (u(), l.push(f)) : f instanceof De && a && (g = h[h.length - 1]) instanceof De && f.lines + g.lines <= 32 ? (a += f.lines, c += f.length + 1, h[h.length - 1] = new De(g.text.concat(f.text), g.length + 1 + f.length)) : (a + f.lines > i && u(), a += f.lines, c += f.length + 1, h.push(f));
    }
    function u() {
      a != 0 && (l.push(h.length == 1 ? h[0] : _t.from(h, c)), c = -1, a = h.length = 0);
    }
    for (let f of e)
      d(f);
    return u(), l.length == 1 ? l[0] : new _t(l, t);
  }
}
se.empty = /* @__PURE__ */ new De([""], 0);
function y0(r) {
  let e = -1;
  for (let t of r)
    e += t.length + 1;
  return e;
}
function Ii(r, e, t = 0, n = 1e9) {
  for (let i = 0, o = 0, s = !0; o < r.length && i <= n; o++) {
    let l = r[o], a = i + l.length;
    a >= t && (a > n && (l = l.slice(0, n - i)), i < t && (l = l.slice(t - i)), s ? (e[e.length - 1] += l, s = !1) : e.push(l)), i = a + 1;
  }
  return e;
}
function Aa(r, e, t) {
  return Ii(r, [""], e, t);
}
class Or {
  constructor(e, t = 1) {
    this.dir = t, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [e], this.offsets = [t > 0 ? 1 : (e instanceof De ? e.text.length : e.children.length) << 1];
  }
  nextInner(e, t) {
    for (this.done = this.lineBreak = !1; ; ) {
      let n = this.nodes.length - 1, i = this.nodes[n], o = this.offsets[n], s = o >> 1, l = i instanceof De ? i.text.length : i.children.length;
      if (s == (t > 0 ? l : 0)) {
        if (n == 0)
          return this.done = !0, this.value = "", this;
        t > 0 && this.offsets[n - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((o & 1) == (t > 0 ? 0 : 1)) {
        if (this.offsets[n] += t, e == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        e--;
      } else if (i instanceof De) {
        let a = i.text[s + (t < 0 ? -1 : 0)];
        if (this.offsets[n] += t, a.length > Math.max(0, e))
          return this.value = e == 0 ? a : t > 0 ? a.slice(e) : a.slice(0, a.length - e), this;
        e -= a.length;
      } else {
        let a = i.children[s + (t < 0 ? -1 : 0)];
        e > a.length ? (e -= a.length, this.offsets[n] += t) : (t < 0 && this.offsets[n]--, this.nodes.push(a), this.offsets.push(t > 0 ? 1 : (a instanceof De ? a.text.length : a.children.length) << 1));
      }
    }
  }
  next(e = 0) {
    return e < 0 && (this.nextInner(-e, -this.dir), e = this.value.length), this.nextInner(e, this.dir);
  }
}
class Ih {
  constructor(e, t, n) {
    this.value = "", this.done = !1, this.cursor = new Or(e, t > n ? -1 : 1), this.pos = t > n ? e.length : 0, this.from = Math.min(t, n), this.to = Math.max(t, n);
  }
  nextInner(e, t) {
    if (t < 0 ? this.pos <= this.from : this.pos >= this.to)
      return this.value = "", this.done = !0, this;
    e += Math.max(0, t < 0 ? this.pos - this.to : this.from - this.pos);
    let n = t < 0 ? this.pos - this.from : this.to - this.pos;
    e > n && (e = n), n -= e;
    let { value: i } = this.cursor.next(e);
    return this.pos += (i.length + e) * t, this.value = i.length <= n ? i : t < 0 ? i.slice(i.length - n) : i.slice(0, n), this.done = !this.value, this;
  }
  next(e = 0) {
    return e < 0 ? e = Math.max(e, this.from - this.pos) : e > 0 && (e = Math.min(e, this.to - this.pos)), this.nextInner(e, this.cursor.dir);
  }
  get lineBreak() {
    return this.cursor.lineBreak && this.value != "";
  }
}
class Ph {
  constructor(e) {
    this.inner = e, this.afterBreak = !0, this.value = "", this.done = !1;
  }
  next(e = 0) {
    let { done: t, lineBreak: n, value: i } = this.inner.next(e);
    return t && this.afterBreak ? (this.value = "", this.afterBreak = !1) : t ? (this.done = !0, this.value = "") : n ? this.afterBreak ? this.value = "" : (this.afterBreak = !0, this.next()) : (this.value = i, this.afterBreak = !1), this;
  }
  get lineBreak() {
    return !1;
  }
}
typeof Symbol < "u" && (se.prototype[Symbol.iterator] = function() {
  return this.iter();
}, Or.prototype[Symbol.iterator] = Ih.prototype[Symbol.iterator] = Ph.prototype[Symbol.iterator] = function() {
  return this;
});
class x0 {
  /**
  @internal
  */
  constructor(e, t, n, i) {
    this.from = e, this.to = t, this.number = n, this.text = i;
  }
  /**
  The length of the line (not including any line break after it).
  */
  get length() {
    return this.to - this.from;
  }
}
function ar(r, e, t) {
  return e = Math.max(0, Math.min(r.length, e)), [e, Math.max(e, Math.min(r.length, t))];
}
function je(r, e, t = !0, n = !0) {
  return m0(r, e, t, n);
}
function b0(r) {
  return r >= 56320 && r < 57344;
}
function w0(r) {
  return r >= 55296 && r < 56320;
}
function v0(r, e) {
  let t = r.charCodeAt(e);
  if (!w0(t) || e + 1 == r.length)
    return t;
  let n = r.charCodeAt(e + 1);
  return b0(n) ? (t - 55296 << 10) + (n - 56320) + 65536 : t;
}
function kv(r) {
  return r <= 65535 ? String.fromCharCode(r) : (r -= 65536, String.fromCharCode((r >> 10) + 55296, (r & 1023) + 56320));
}
function k0(r) {
  return r < 65536 ? 1 : 2;
}
const ps = /\r\n?|\n/;
var ct = /* @__PURE__ */ function(r) {
  return r[r.Simple = 0] = "Simple", r[r.TrackDel = 1] = "TrackDel", r[r.TrackBefore = 2] = "TrackBefore", r[r.TrackAfter = 3] = "TrackAfter", r;
}(ct || (ct = {}));
class Jt {
  // Sections are encoded as pairs of integers. The first is the
  // length in the current document, and the second is -1 for
  // unaffected sections, and the length of the replacement content
  // otherwise. So an insertion would be (0, n>0), a deletion (n>0,
  // 0), and a replacement two positive numbers.
  /**
  @internal
  */
  constructor(e) {
    this.sections = e;
  }
  /**
  The length of the document before the change.
  */
  get length() {
    let e = 0;
    for (let t = 0; t < this.sections.length; t += 2)
      e += this.sections[t];
    return e;
  }
  /**
  The length of the document after the change.
  */
  get newLength() {
    let e = 0;
    for (let t = 0; t < this.sections.length; t += 2) {
      let n = this.sections[t + 1];
      e += n < 0 ? this.sections[t] : n;
    }
    return e;
  }
  /**
  False when there are actual changes in this set.
  */
  get empty() {
    return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
  }
  /**
  Iterate over the unchanged parts left by these changes. `posA`
  provides the position of the range in the old document, `posB`
  the new position in the changed document.
  */
  iterGaps(e) {
    for (let t = 0, n = 0, i = 0; t < this.sections.length; ) {
      let o = this.sections[t++], s = this.sections[t++];
      s < 0 ? (e(n, i, o), i += o) : i += s, n += o;
    }
  }
  /**
  Iterate over the ranges changed by these changes. (See
  [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
  variant that also provides you with the inserted text.)
  `fromA`/`toA` provides the extent of the change in the starting
  document, `fromB`/`toB` the extent of the replacement in the
  changed document.
  
  When `individual` is true, adjacent changes (which are kept
  separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
  reported separately.
  */
  iterChangedRanges(e, t = !1) {
    ms(this, e, t);
  }
  /**
  Get a description of the inverted form of these changes.
  */
  get invertedDesc() {
    let e = [];
    for (let t = 0; t < this.sections.length; ) {
      let n = this.sections[t++], i = this.sections[t++];
      i < 0 ? e.push(n, i) : e.push(i, n);
    }
    return new Jt(e);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(e) {
    return this.empty ? e : e.empty ? this : $h(this, e);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `this` happened before the ones in `other`.
  */
  mapDesc(e, t = !1) {
    return e.empty ? this : gs(this, e, t);
  }
  mapPos(e, t = -1, n = ct.Simple) {
    let i = 0, o = 0;
    for (let s = 0; s < this.sections.length; ) {
      let l = this.sections[s++], a = this.sections[s++], c = i + l;
      if (a < 0) {
        if (c > e)
          return o + (e - i);
        o += l;
      } else {
        if (n != ct.Simple && c >= e && (n == ct.TrackDel && i < e && c > e || n == ct.TrackBefore && i < e || n == ct.TrackAfter && c > e))
          return null;
        if (c > e || c == e && t < 0 && !l)
          return e == i || t < 0 ? o : o + a;
        o += a;
      }
      i = c;
    }
    if (e > i)
      throw new RangeError(`Position ${e} is out of range for changeset of length ${i}`);
    return o;
  }
  /**
  Check whether these changes touch a given range. When one of the
  changes entirely covers the range, the string `"cover"` is
  returned.
  */
  touchesRange(e, t = e) {
    for (let n = 0, i = 0; n < this.sections.length && i <= t; ) {
      let o = this.sections[n++], s = this.sections[n++], l = i + o;
      if (s >= 0 && i <= t && l >= e)
        return i < e && l > t ? "cover" : !0;
      i = l;
    }
    return !1;
  }
  /**
  @internal
  */
  toString() {
    let e = "";
    for (let t = 0; t < this.sections.length; ) {
      let n = this.sections[t++], i = this.sections[t++];
      e += (e ? " " : "") + n + (i >= 0 ? ":" + i : "");
    }
    return e;
  }
  /**
  Serialize this change desc to a JSON-representable value.
  */
  toJSON() {
    return this.sections;
  }
  /**
  Create a change desc from its JSON representation (as produced
  by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
  */
  static fromJSON(e) {
    if (!Array.isArray(e) || e.length % 2 || e.some((t) => typeof t != "number"))
      throw new RangeError("Invalid JSON representation of ChangeDesc");
    return new Jt(e);
  }
  /**
  @internal
  */
  static create(e) {
    return new Jt(e);
  }
}
class Ne extends Jt {
  constructor(e, t) {
    super(e), this.inserted = t;
  }
  /**
  Apply the changes to a document, returning the modified
  document.
  */
  apply(e) {
    if (this.length != e.length)
      throw new RangeError("Applying change set to a document with the wrong length");
    return ms(this, (t, n, i, o, s) => e = e.replace(i, i + (n - t), s), !1), e;
  }
  mapDesc(e, t = !1) {
    return gs(this, e, t, !0);
  }
  /**
  Given the document as it existed _before_ the changes, return a
  change set that represents the inverse of this set, which could
  be used to go from the document created by the changes back to
  the document as it existed before the changes.
  */
  invert(e) {
    let t = this.sections.slice(), n = [];
    for (let i = 0, o = 0; i < t.length; i += 2) {
      let s = t[i], l = t[i + 1];
      if (l >= 0) {
        t[i] = l, t[i + 1] = s;
        let a = i >> 1;
        for (; n.length < a; )
          n.push(se.empty);
        n.push(s ? e.slice(o, o + s) : se.empty);
      }
      o += s;
    }
    return new Ne(t, n);
  }
  /**
  Combine two subsequent change sets into a single set. `other`
  must start in the document produced by `this`. If `this` goes
  `docA` → `docB` and `other` represents `docB` → `docC`, the
  returned value will represent the change `docA` → `docC`.
  */
  compose(e) {
    return this.empty ? e : e.empty ? this : $h(this, e, !0);
  }
  /**
  Given another change set starting in the same document, maps this
  change set over the other, producing a new change set that can be
  applied to the document produced by applying `other`. When
  `before` is `true`, order changes as if `this` comes before
  `other`, otherwise (the default) treat `other` as coming first.
  
  Given two changes `A` and `B`, `A.compose(B.map(A))` and
  `B.compose(A.map(B, true))` will produce the same document. This
  provides a basic form of [operational
  transformation](https://en.wikipedia.org/wiki/Operational_transformation),
  and can be used for collaborative editing.
  */
  map(e, t = !1) {
    return e.empty ? this : gs(this, e, t, !0);
  }
  /**
  Iterate over the changed ranges in the document, calling `f` for
  each, with the range in the original document (`fromA`-`toA`)
  and the range that replaces it in the new document
  (`fromB`-`toB`).
  
  When `individual` is true, adjacent changes are reported
  separately.
  */
  iterChanges(e, t = !1) {
    ms(this, e, t);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return Jt.create(this.sections);
  }
  /**
  @internal
  */
  filter(e) {
    let t = [], n = [], i = [], o = new Wr(this);
    e: for (let s = 0, l = 0; ; ) {
      let a = s == e.length ? 1e9 : e[s++];
      for (; l < a || l == a && o.len == 0; ) {
        if (o.done)
          break e;
        let h = Math.min(o.len, a - l);
        _e(i, h, -1);
        let d = o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0;
        _e(t, h, d), d > 0 && gn(n, t, o.text), o.forward(h), l += h;
      }
      let c = e[s++];
      for (; l < c; ) {
        if (o.done)
          break e;
        let h = Math.min(o.len, c - l);
        _e(t, h, -1), _e(i, h, o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0), o.forward(h), l += h;
      }
    }
    return {
      changes: new Ne(t, n),
      filtered: Jt.create(i)
    };
  }
  /**
  Serialize this change set to a JSON-representable value.
  */
  toJSON() {
    let e = [];
    for (let t = 0; t < this.sections.length; t += 2) {
      let n = this.sections[t], i = this.sections[t + 1];
      i < 0 ? e.push(n) : i == 0 ? e.push([n]) : e.push([n].concat(this.inserted[t >> 1].toJSON()));
    }
    return e;
  }
  /**
  Create a change set for the given changes, for a document of the
  given length, using `lineSep` as line separator.
  */
  static of(e, t, n) {
    let i = [], o = [], s = 0, l = null;
    function a(h = !1) {
      if (!h && !i.length)
        return;
      s < t && _e(i, t - s, -1);
      let d = new Ne(i, o);
      l = l ? l.compose(d.map(l)) : d, i = [], o = [], s = 0;
    }
    function c(h) {
      if (Array.isArray(h))
        for (let d of h)
          c(d);
      else if (h instanceof Ne) {
        if (h.length != t)
          throw new RangeError(`Mismatched change set length (got ${h.length}, expected ${t})`);
        a(), l = l ? l.compose(h.map(l)) : h;
      } else {
        let { from: d, to: u = d, insert: f } = h;
        if (d > u || d < 0 || u > t)
          throw new RangeError(`Invalid change range ${d} to ${u} (in doc of length ${t})`);
        let g = f ? typeof f == "string" ? se.of(f.split(n || ps)) : f : se.empty, w = g.length;
        if (d == u && w == 0)
          return;
        d < s && a(), d > s && _e(i, d - s, -1), _e(i, u - d, w), gn(o, i, g), s = u;
      }
    }
    return c(e), a(!l), l;
  }
  /**
  Create an empty changeset of the given length.
  */
  static empty(e) {
    return new Ne(e ? [e, -1] : [], []);
  }
  /**
  Create a changeset from its JSON representation (as produced by
  [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
  */
  static fromJSON(e) {
    if (!Array.isArray(e))
      throw new RangeError("Invalid JSON representation of ChangeSet");
    let t = [], n = [];
    for (let i = 0; i < e.length; i++) {
      let o = e[i];
      if (typeof o == "number")
        t.push(o, -1);
      else {
        if (!Array.isArray(o) || typeof o[0] != "number" || o.some((s, l) => l && typeof s != "string"))
          throw new RangeError("Invalid JSON representation of ChangeSet");
        if (o.length == 1)
          t.push(o[0], 0);
        else {
          for (; n.length < i; )
            n.push(se.empty);
          n[i] = se.of(o.slice(1)), t.push(o[0], n[i].length);
        }
      }
    }
    return new Ne(t, n);
  }
  /**
  @internal
  */
  static createSet(e, t) {
    return new Ne(e, t);
  }
}
function _e(r, e, t, n = !1) {
  if (e == 0 && t <= 0)
    return;
  let i = r.length - 2;
  i >= 0 && t <= 0 && t == r[i + 1] ? r[i] += e : i >= 0 && e == 0 && r[i] == 0 ? r[i + 1] += t : n ? (r[i] += e, r[i + 1] += t) : r.push(e, t);
}
function gn(r, e, t) {
  if (t.length == 0)
    return;
  let n = e.length - 2 >> 1;
  if (n < r.length)
    r[r.length - 1] = r[r.length - 1].append(t);
  else {
    for (; r.length < n; )
      r.push(se.empty);
    r.push(t);
  }
}
function ms(r, e, t) {
  let n = r.inserted;
  for (let i = 0, o = 0, s = 0; s < r.sections.length; ) {
    let l = r.sections[s++], a = r.sections[s++];
    if (a < 0)
      i += l, o += l;
    else {
      let c = i, h = o, d = se.empty;
      for (; c += l, h += a, a && n && (d = d.append(n[s - 2 >> 1])), !(t || s == r.sections.length || r.sections[s + 1] < 0); )
        l = r.sections[s++], a = r.sections[s++];
      e(i, c, o, h, d), i = c, o = h;
    }
  }
}
function gs(r, e, t, n = !1) {
  let i = [], o = n ? [] : null, s = new Wr(r), l = new Wr(e);
  for (let a = -1; ; ) {
    if (s.done && l.len || l.done && s.len)
      throw new Error("Mismatched change set lengths");
    if (s.ins == -1 && l.ins == -1) {
      let c = Math.min(s.len, l.len);
      _e(i, c, -1), s.forward(c), l.forward(c);
    } else if (l.ins >= 0 && (s.ins < 0 || a == s.i || s.off == 0 && (l.len < s.len || l.len == s.len && !t))) {
      let c = l.len;
      for (_e(i, l.ins, -1); c; ) {
        let h = Math.min(s.len, c);
        s.ins >= 0 && a < s.i && s.len <= h && (_e(i, 0, s.ins), o && gn(o, i, s.text), a = s.i), s.forward(h), c -= h;
      }
      l.next();
    } else if (s.ins >= 0) {
      let c = 0, h = s.len;
      for (; h; )
        if (l.ins == -1) {
          let d = Math.min(h, l.len);
          c += d, h -= d, l.forward(d);
        } else if (l.ins == 0 && l.len < h)
          h -= l.len, l.next();
        else
          break;
      _e(i, c, a < s.i ? s.ins : 0), o && a < s.i && gn(o, i, s.text), a = s.i, s.forward(s.len - h);
    } else {
      if (s.done && l.done)
        return o ? Ne.createSet(i, o) : Jt.create(i);
      throw new Error("Mismatched change set lengths");
    }
  }
}
function $h(r, e, t = !1) {
  let n = [], i = t ? [] : null, o = new Wr(r), s = new Wr(e);
  for (let l = !1; ; ) {
    if (o.done && s.done)
      return i ? Ne.createSet(n, i) : Jt.create(n);
    if (o.ins == 0)
      _e(n, o.len, 0, l), o.next();
    else if (s.len == 0 && !s.done)
      _e(n, 0, s.ins, l), i && gn(i, n, s.text), s.next();
    else {
      if (o.done || s.done)
        throw new Error("Mismatched change set lengths");
      {
        let a = Math.min(o.len2, s.len), c = n.length;
        if (o.ins == -1) {
          let h = s.ins == -1 ? -1 : s.off ? 0 : s.ins;
          _e(n, a, h, l), i && h && gn(i, n, s.text);
        } else s.ins == -1 ? (_e(n, o.off ? 0 : o.len, a, l), i && gn(i, n, o.textBit(a))) : (_e(n, o.off ? 0 : o.len, s.off ? 0 : s.ins, l), i && !s.off && gn(i, n, s.text));
        l = (o.ins > a || s.ins >= 0 && s.len > a) && (l || n.length > c), o.forward2(a), s.forward(a);
      }
    }
  }
}
class Wr {
  constructor(e) {
    this.set = e, this.i = 0, this.next();
  }
  next() {
    let { sections: e } = this.set;
    this.i < e.length ? (this.len = e[this.i++], this.ins = e[this.i++]) : (this.len = 0, this.ins = -2), this.off = 0;
  }
  get done() {
    return this.ins == -2;
  }
  get len2() {
    return this.ins < 0 ? this.len : this.ins;
  }
  get text() {
    let { inserted: e } = this.set, t = this.i - 2 >> 1;
    return t >= e.length ? se.empty : e[t];
  }
  textBit(e) {
    let { inserted: t } = this.set, n = this.i - 2 >> 1;
    return n >= t.length && !e ? se.empty : t[n].slice(this.off, e == null ? void 0 : this.off + e);
  }
  forward(e) {
    e == this.len ? this.next() : (this.len -= e, this.off += e);
  }
  forward2(e) {
    this.ins == -1 ? this.forward(e) : e == this.ins ? this.next() : (this.ins -= e, this.off += e);
  }
}
class pn {
  constructor(e, t, n, i) {
    this.from = e, this.to = t, this.flags = n, this.goalColumn = i;
  }
  /**
  The anchor of the range—the side that doesn't move when you
  extend it.
  */
  get anchor() {
    return this.flags & 32 ? this.to : this.from;
  }
  /**
  The head of the range, which is moved when the range is
  [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
  */
  get head() {
    return this.flags & 32 ? this.from : this.to;
  }
  /**
  True when `anchor` and `head` are at the same position.
  */
  get empty() {
    return this.from == this.to;
  }
  /**
  If this is a cursor that is explicitly associated with the
  character on one of its sides, this returns the side. -1 means
  the character before its position, 1 the character after, and 0
  means no association.
  */
  get assoc() {
    return this.flags & 8 ? -1 : this.flags & 16 ? 1 : 0;
  }
  /**
  A flag that, when set, makes some selection-extending commands
  treat the range's head and anchor as exchangeable, so that for
  example Shift-ArrowUp will make the lower side of the selection
  the anchor, even if that was the head before. Used to implement
  MacOS-style undirectional selections.
  */
  get undirectional() {
    return (this.flags & 64) > 0;
  }
  /**
  The bidirectional text level associated with this cursor, if
  any.
  */
  get bidiLevel() {
    let e = this.flags & 7;
    return e == 7 ? null : e;
  }
  /**
  Map this range through a change, producing a valid range in the
  updated document.
  */
  map(e, t = -1) {
    let n, i;
    return this.empty ? n = i = e.mapPos(this.from, t) : (n = e.mapPos(this.from, 1), i = e.mapPos(this.to, -1)), n == this.from && i == this.to ? this : new pn(n, i, this.flags, this.goalColumn);
  }
  /**
  Extend this range to cover at least `from` to `to`.
  */
  extend(e, t = e, n = 0) {
    if (e <= this.anchor && t >= this.anchor)
      return E.range(e, t, void 0, void 0, n);
    let i = Math.abs(e - this.anchor) > Math.abs(t - this.anchor) ? e : t;
    return E.range(this.anchor, i, void 0, void 0, n);
  }
  /**
  Compare this range to another range.
  */
  eq(e, t = !1) {
    return this.anchor == e.anchor && this.head == e.head && this.goalColumn == e.goalColumn && (!t || !this.empty || this.assoc == e.assoc);
  }
  /**
  Return a JSON-serializable object representing the range.
  */
  toJSON() {
    return { anchor: this.anchor, head: this.head };
  }
  /**
  Convert a JSON representation of a range to a `SelectionRange`
  instance.
  */
  static fromJSON(e) {
    if (!e || typeof e.anchor != "number" || typeof e.head != "number")
      throw new RangeError("Invalid JSON representation for SelectionRange");
    return E.range(e.anchor, e.head);
  }
  /**
  @internal
  */
  static create(e, t, n, i) {
    return new pn(e, t, n, i);
  }
}
class E {
  constructor(e, t) {
    this.ranges = e, this.mainIndex = t;
  }
  /**
  Map a selection through a change. Used to adjust the selection
  position for changes.
  */
  map(e, t = -1) {
    return e.empty ? this : E.create(this.ranges.map((n) => n.map(e, t)), this.mainIndex);
  }
  /**
  Compare this selection to another selection. By default, ranges
  are compared only by position. When `includeAssoc` is true,
  cursor ranges must also have the same
  [`assoc`](https://codemirror.net/6/docs/ref/#state.SelectionRange.assoc) value.
  */
  eq(e, t = !1) {
    if (this.ranges.length != e.ranges.length || this.mainIndex != e.mainIndex)
      return !1;
    for (let n = 0; n < this.ranges.length; n++)
      if (!this.ranges[n].eq(e.ranges[n], t))
        return !1;
    return !0;
  }
  /**
  Get the primary selection range. Usually, you should make sure
  your code applies to _all_ ranges, by using methods like
  [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
  */
  get main() {
    return this.ranges[this.mainIndex];
  }
  /**
  Make sure the selection only has one range. Returns a selection
  holding only the main range from this selection.
  */
  asSingle() {
    return this.ranges.length == 1 ? this : new E([this.main], 0);
  }
  /**
  Extend this selection with an extra range.
  */
  addRange(e, t = !0) {
    return E.create([e].concat(this.ranges), t ? 0 : this.mainIndex + 1);
  }
  /**
  Replace a given range with another range, and then normalize the
  selection to merge and sort ranges if necessary.
  */
  replaceRange(e, t = this.mainIndex) {
    let n = this.ranges.slice();
    return n[t] = e, E.create(n, this.mainIndex);
  }
  /**
  Convert this selection to an object that can be serialized to
  JSON.
  */
  toJSON() {
    return { ranges: this.ranges.map((e) => e.toJSON()), main: this.mainIndex };
  }
  /**
  Create a selection from a JSON representation.
  */
  static fromJSON(e) {
    if (!e || !Array.isArray(e.ranges) || typeof e.main != "number" || e.main >= e.ranges.length)
      throw new RangeError("Invalid JSON representation for EditorSelection");
    return new E(e.ranges.map((t) => pn.fromJSON(t)), e.main);
  }
  /**
  Create a selection holding a single range.
  */
  static single(e, t = e) {
    return new E([E.range(e, t)], 0);
  }
  /**
  Sort and merge the given set of ranges, creating a valid
  selection.
  */
  static create(e, t = 0) {
    if (e.length == 0)
      throw new RangeError("A selection needs at least one range");
    for (let n = 0, i = 0; i < e.length; i++) {
      let o = e[i];
      if (o.empty ? o.from <= n : o.from < n)
        return E.normalized(e.slice(), t);
      n = o.to;
    }
    return new E(e, t);
  }
  /**
  Create a cursor selection range at the given position. You can
  safely ignore the optional arguments in most situations.
  */
  static cursor(e, t = 0, n, i) {
    return pn.create(e, e, (t == 0 ? 0 : t < 0 ? 8 : 16) | (n == null ? 7 : Math.min(6, n)), i);
  }
  /**
  Create a selection range.
  */
  static range(e, t, n, i, o) {
    let s = i == null ? 7 : Math.min(6, i);
    return !o && e != t && (o = t < e ? 1 : -1), o && (s |= o < 0 ? 8 : 16), t < e ? pn.create(t, e, s | 32, n) : pn.create(e, t, s, n);
  }
  /**
  Create an [undirectional](https://codemirror.net/6/docs/ref/#state.SelectionRange.undirectional)
  selection range.
  */
  static undirectionalRange(e, t) {
    return pn.create(e, t, 64, void 0);
  }
  /**
  @internal
  */
  static normalized(e, t = 0) {
    let n = e[t];
    e.sort((i, o) => i.from - o.from), t = e.indexOf(n);
    for (let i = 1; i < e.length; i++) {
      let o = e[i], s = e[i - 1];
      if (o.empty ? o.from <= s.to : o.from < s.to) {
        let l = s.from, a = Math.max(o.to, s.to);
        i <= t && t--, e.splice(--i, 2, o.anchor > o.head ? E.range(a, l) : E.range(l, a));
      }
    }
    return new E(e, t);
  }
}
function Fh(r, e) {
  for (let t of r.ranges)
    if (t.to > e)
      throw new RangeError("Selection points outside of document");
}
let al = 0;
class H {
  constructor(e, t, n, i, o) {
    this.combine = e, this.compareInput = t, this.compare = n, this.isStatic = i, this.id = al++, this.default = e([]), this.extensions = typeof o == "function" ? o(this) : o;
  }
  /**
  Returns a facet reader for this facet, which can be used to
  [read](https://codemirror.net/6/docs/ref/#state.EditorState.facet) it but not to define values for it.
  */
  get reader() {
    return this;
  }
  /**
  Define a new facet.
  */
  static define(e = {}) {
    return new H(e.combine || ((t) => t), e.compareInput || ((t, n) => t === n), e.compare || (e.combine ? (t, n) => t === n : cl), !!e.static, e.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(e) {
    return new Pi([], this, 0, e);
  }
  /**
  Create an extension that computes a value for the facet from a
  state. You must take care to declare the parts of the state that
  this value depends on, since your function is only called again
  for a new state when one of those parts changed.
  
  In cases where your value depends only on a single field, you'll
  want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
  */
  compute(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Pi(e, this, 1, t);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Pi(e, this, 2, t);
  }
  from(e, t) {
    return t || (t = (n) => n), this.compute([e], (n) => t(n.field(e)));
  }
}
function cl(r, e) {
  return r == e || r.length == e.length && r.every((t, n) => t === e[n]);
}
class Pi {
  constructor(e, t, n, i) {
    this.dependencies = e, this.facet = t, this.type = n, this.value = i, this.id = al++;
  }
  dynamicSlot(e) {
    var t;
    let n = this.value, i = this.facet.compareInput, o = this.id, s = e[o] >> 1, l = this.type == 2, a = !1, c = !1, h = [];
    for (let d of this.dependencies)
      d == "doc" ? a = !0 : d == "selection" ? c = !0 : ((t = e[d.id]) !== null && t !== void 0 ? t : 1) & 1 || h.push(e[d.id]);
    return {
      create(d) {
        return d.values[s] = n(d), 1;
      },
      update(d, u) {
        if (a && u.docChanged || c && (u.docChanged || u.selection) || ys(d, h)) {
          let f = n(d);
          if (l ? !Ma(f, d.values[s], i) : !i(f, d.values[s]))
            return d.values[s] = f, 1;
        }
        return 0;
      },
      reconfigure: (d, u) => {
        let f, g = u.config.address[o];
        if (g != null) {
          let w = Gi(u, g);
          if (this.dependencies.every((k) => k instanceof H ? u.facet(k) === d.facet(k) : k instanceof an ? u.field(k, !1) == d.field(k, !1) : !0) || (l ? Ma(f = n(d), w, i) : i(f = n(d), w)))
            return d.values[s] = w, 0;
        } else
          f = n(d);
        return d.values[s] = f, 1;
      }
    };
  }
  get extension() {
    return this;
  }
}
function Ma(r, e, t) {
  if (r.length != e.length)
    return !1;
  for (let n = 0; n < r.length; n++)
    if (!t(r[n], e[n]))
      return !1;
  return !0;
}
function ys(r, e) {
  let t = !1;
  for (let n of e)
    Lr(r, n) & 1 && (t = !0);
  return t;
}
function S0(r, e, t) {
  let n = t.map((a) => r[a.id]), i = t.map((a) => a.type), o = n.filter((a) => !(a & 1)), s = r[e.id] >> 1;
  function l(a) {
    let c = [];
    for (let h = 0; h < n.length; h++) {
      let d = Gi(a, n[h]);
      if (i[h] == 2)
        for (let u of d)
          c.push(u);
      else
        c.push(d);
    }
    return e.combine(c);
  }
  return {
    create(a) {
      for (let c of n)
        Lr(a, c);
      return a.values[s] = l(a), 1;
    },
    update(a, c) {
      if (!ys(a, o))
        return 0;
      let h = l(a);
      return e.compare(h, a.values[s]) ? 0 : (a.values[s] = h, 1);
    },
    reconfigure(a, c) {
      let h = ys(a, n), d = c.config.facets[e.id], u = c.facet(e);
      if (d && !h && cl(t, d))
        return a.values[s] = u, 0;
      let f = l(a);
      return e.compare(f, u) ? (a.values[s] = u, 0) : (a.values[s] = f, 1);
    }
  };
}
const gi = /* @__PURE__ */ H.define({ static: !0 });
class an {
  constructor(e, t, n, i, o) {
    this.id = e, this.createF = t, this.updateF = n, this.compareF = i, this.spec = o, this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(e) {
    let t = new an(al++, e.create, e.update, e.compare || ((n, i) => n === i), e);
    return e.provide && (t.provides = e.provide(t)), t;
  }
  create(e) {
    let t = e.facet(gi).find((n) => n.field == this);
    return ((t == null ? void 0 : t.create) || this.createF)(e);
  }
  /**
  @internal
  */
  slot(e) {
    let t = e[this.id] >> 1;
    return {
      create: (n) => (n.values[t] = this.create(n), 1),
      update: (n, i) => {
        let o = n.values[t], s = this.updateF(o, i);
        return this.compareF(o, s) ? 0 : (n.values[t] = s, 1);
      },
      reconfigure: (n, i) => {
        let o = n.facet(gi), s = i.facet(gi), l;
        return (l = o.find((a) => a.field == this)) && l != s.find((a) => a.field == this) ? (n.values[t] = l.create(n), 1) : i.config.address[this.id] != null ? (n.values[t] = i.field(this), 0) : (n.values[t] = this.create(n), 1);
      }
    };
  }
  /**
  Returns an extension that enables this field and overrides the
  way it is initialized. Can be useful when you need to provide a
  non-default starting value for the field.
  */
  init(e) {
    return [this, gi.of({ field: this, create: e })];
  }
  /**
  State field instances can be used as
  [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
  given state.
  */
  get extension() {
    return this;
  }
}
const $n = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function vr(r) {
  return (e) => new Hh(e, r);
}
const hl = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ vr($n.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ vr($n.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ vr($n.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ vr($n.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ vr($n.lowest)
};
class Hh {
  constructor(e, t) {
    this.inner = e, this.prec = t;
  }
  get extension() {
    return this;
  }
}
class Vt {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(e) {
    return new xs(this, e);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(e) {
    return Vt.reconfigure.of({ compartment: this, extension: e });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(e) {
    return e.config.compartments.get(this);
  }
}
class xs {
  constructor(e, t) {
    this.compartment = e, this.inner = t;
  }
  get extension() {
    return this;
  }
}
class Yi {
  constructor(e, t, n, i, o, s) {
    for (this.base = e, this.compartments = t, this.dynamicSlots = n, this.address = i, this.staticValues = o, this.facets = s, this.statusTemplate = []; this.statusTemplate.length < n.length; )
      this.statusTemplate.push(
        0
        /* SlotStatus.Unresolved */
      );
  }
  staticFacet(e) {
    let t = this.address[e.id];
    return t == null ? e.default : this.staticValues[t >> 1];
  }
  static resolve(e, t, n) {
    let i = [], o = /* @__PURE__ */ Object.create(null), s = /* @__PURE__ */ new Map();
    for (let u of C0(e, t, s))
      u instanceof an ? i.push(u) : (o[u.facet.id] || (o[u.facet.id] = [])).push(u);
    let l = /* @__PURE__ */ Object.create(null), a = [], c = [];
    for (let u of i)
      l[u.id] = c.length << 1, c.push((f) => u.slot(f));
    let h = n == null ? void 0 : n.config.facets;
    for (let u in o) {
      let f = o[u], g = f[0].facet, w = h && h[u] || [];
      if (f.every(
        (k) => k.type == 0
        /* Provider.Static */
      ))
        if (l[g.id] = a.length << 1 | 1, cl(w, f))
          a.push(n.facet(g));
        else {
          let k = g.combine(f.map((v) => v.value));
          a.push(n && g.compare(k, n.facet(g)) ? n.facet(g) : k);
        }
      else {
        for (let k of f)
          k.type == 0 ? (l[k.id] = a.length << 1 | 1, a.push(k.value)) : (l[k.id] = c.length << 1, c.push((v) => k.dynamicSlot(v)));
        l[g.id] = c.length << 1, c.push((k) => S0(k, g, f));
      }
    }
    let d = c.map((u) => u(l));
    return new Yi(e, s, d, l, a, o);
  }
}
function C0(r, e, t) {
  let n = [[], [], [], [], []], i = /* @__PURE__ */ new Map();
  function o(s, l) {
    let a = i.get(s);
    if (a != null) {
      if (a <= l)
        return;
      let c = n[a].indexOf(s);
      c > -1 && n[a].splice(c, 1), s instanceof xs && t.delete(s.compartment);
    }
    if (i.set(s, l), Array.isArray(s))
      for (let c of s)
        o(c, l);
    else if (s instanceof xs) {
      if (t.has(s.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let c = e.get(s.compartment) || s.inner;
      t.set(s.compartment, c), o(c, l);
    } else if (s instanceof Hh)
      o(s.inner, s.prec);
    else if (s instanceof an)
      n[l].push(s), s.provides && o(s.provides, l);
    else if (s instanceof Pi)
      n[l].push(s), s.facet.extensions && o(s.facet.extensions, $n.default);
    else {
      let c = s.extension;
      if (!c)
        throw new Error(`Unrecognized extension value in extension set (${s}).`);
      if (c == s)
        throw new Error(`Unrecognized extension value in extension set (${s}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      o(c, l);
    }
  }
  return o(r, $n.default), n.reduce((s, l) => s.concat(l));
}
function Lr(r, e) {
  if (e & 1)
    return 2;
  let t = e >> 1, n = r.status[t];
  if (n == 4)
    throw new Error("Cyclic dependency between fields and/or facets");
  if (n & 2)
    return n;
  r.status[t] = 4;
  let i = r.computeSlot(r, r.config.dynamicSlots[t]);
  return r.status[t] = 2 | i;
}
function Gi(r, e) {
  return e & 1 ? r.config.staticValues[e >> 1] : r.values[e >> 1];
}
const Wh = /* @__PURE__ */ H.define(), bs = /* @__PURE__ */ H.define({
  combine: (r) => r.some((e) => e),
  static: !0
}), zh = /* @__PURE__ */ H.define({
  combine: (r) => r.length ? r[0] : void 0,
  static: !0
}), Vh = /* @__PURE__ */ H.define(), _h = /* @__PURE__ */ H.define(), jh = /* @__PURE__ */ H.define(), Kh = /* @__PURE__ */ H.define({
  combine: (r) => r.length ? r[0] : !1
});
class Sn {
  /**
  @internal
  */
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  /**
  Define a new type of annotation.
  */
  static define() {
    return new A0();
  }
}
class A0 {
  /**
  Create an instance of this annotation.
  */
  of(e) {
    return new Sn(this, e);
  }
}
class M0 {
  /**
  @internal
  */
  constructor(e) {
    this.map = e;
  }
  /**
  Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
  type.
  */
  of(e) {
    return new xe(this, e);
  }
}
class xe {
  /**
  @internal
  */
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  /**
  Map this effect through a position mapping. Will return
  `undefined` when that ends up deleting the effect.
  */
  map(e) {
    let t = this.type.map(this.value, e);
    return t === void 0 ? void 0 : t == this.value ? this : new xe(this.type, t);
  }
  /**
  Tells you whether this effect object is of a given
  [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
  */
  is(e) {
    return this.type == e;
  }
  /**
  Define a new effect type. The type parameter indicates the type
  of values that his effect holds. It should be a type that
  doesn't include `undefined`, since that is used in
  [mapping](https://codemirror.net/6/docs/ref/#state.StateEffect.map) to indicate that an effect is
  removed.
  */
  static define(e = {}) {
    return new M0(e.map || ((t) => t));
  }
  /**
  Map an array of effects through a change set.
  */
  static mapEffects(e, t) {
    if (!e.length)
      return e;
    let n = [];
    for (let i of e) {
      let o = i.map(t);
      o && n.push(o);
    }
    return n;
  }
}
xe.reconfigure = /* @__PURE__ */ xe.define();
xe.appendConfig = /* @__PURE__ */ xe.define();
class Le {
  constructor(e, t, n, i, o, s) {
    this.startState = e, this.changes = t, this.selection = n, this.effects = i, this.annotations = o, this.scrollIntoView = s, this._doc = null, this._state = null, n && Fh(n, t.newLength), o.some((l) => l.type == Le.time) || (this.annotations = o.concat(Le.time.of(Date.now())));
  }
  /**
  @internal
  */
  static create(e, t, n, i, o, s) {
    return new Le(e, t, n, i, o, s);
  }
  /**
  The new document produced by the transaction. Contrary to
  [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
  force the entire new state to be computed right away, so it is
  recommended that [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
  when they need to look at the new document.
  */
  get newDoc() {
    return this._doc || (this._doc = this.changes.apply(this.startState.doc));
  }
  /**
  The new selection produced by the transaction. If
  [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
  this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
  current selection through the changes made by the transaction.
  */
  get newSelection() {
    return this.selection || this.startState.selection.map(this.changes);
  }
  /**
  The new state created by the transaction. Computed on demand
  (but retained for subsequent access), so it is recommended not to
  access it in [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
  */
  get state() {
    return this._state || this.startState.applyTransaction(this), this._state;
  }
  /**
  Get the value of the given annotation type, if any.
  */
  annotation(e) {
    for (let t of this.annotations)
      if (t.type == e)
        return t.value;
  }
  /**
  Indicates whether the transaction changed the document.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Indicates whether this transaction reconfigures the state
  (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
  with a top-level configuration
  [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
  */
  get reconfigured() {
    return this.startState.config != this.state.config;
  }
  /**
  Returns true if the transaction has a [user
  event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
  or more specific than `event`. For example, if the transaction
  has `"select.pointer"` as user event, `"select"` and
  `"select.pointer"` will match it.
  */
  isUserEvent(e) {
    let t = this.annotation(Le.userEvent);
    return !!(t && (t == e || t.length > e.length && t.slice(0, e.length) == e && t[e.length] == "."));
  }
}
Le.time = /* @__PURE__ */ Sn.define();
Le.userEvent = /* @__PURE__ */ Sn.define();
Le.addToHistory = /* @__PURE__ */ Sn.define();
Le.remote = /* @__PURE__ */ Sn.define();
function D0(r, e) {
  let t = [];
  for (let n = 0, i = 0; ; ) {
    let o, s;
    if (n < r.length && (i == e.length || e[i] >= r[n]))
      o = r[n++], s = r[n++];
    else if (i < e.length)
      o = e[i++], s = e[i++];
    else
      return t;
    !t.length || t[t.length - 1] < o ? t.push(o, s) : t[t.length - 1] < s && (t[t.length - 1] = s);
  }
}
function Uh(r, e, t) {
  var n;
  let i, o, s;
  return t ? (i = e.changes, o = Ne.empty(e.changes.length), s = r.changes.compose(e.changes)) : (i = e.changes.map(r.changes), o = r.changes.mapDesc(e.changes, !0), s = r.changes.compose(i)), {
    changes: s,
    selection: e.selection ? e.selection.map(o) : (n = r.selection) === null || n === void 0 ? void 0 : n.map(i),
    effects: xe.mapEffects(r.effects, i).concat(xe.mapEffects(e.effects, o)),
    annotations: r.annotations.length ? r.annotations.concat(e.annotations) : e.annotations,
    scrollIntoView: r.scrollIntoView || e.scrollIntoView
  };
}
function ws(r, e, t) {
  let n = e.selection, i = ir(e.annotations);
  return e.userEvent && (i = i.concat(Le.userEvent.of(e.userEvent))), {
    changes: e.changes instanceof Ne ? e.changes : Ne.of(e.changes || [], t, r.facet(zh)),
    selection: n && (n instanceof E ? n : E.single(n.anchor, n.head)),
    effects: ir(e.effects),
    annotations: i,
    scrollIntoView: !!e.scrollIntoView
  };
}
function qh(r, e, t) {
  let n = ws(r, e.length ? e[0] : {}, r.doc.length);
  e.length && e[0].filter === !1 && (t = !1);
  for (let o = 1; o < e.length; o++) {
    e[o].filter === !1 && (t = !1);
    let s = !!e[o].sequential;
    n = Uh(n, ws(r, e[o], s ? n.changes.newLength : r.doc.length), s);
  }
  let i = Le.create(r, n.changes, n.selection, n.effects, n.annotations, n.scrollIntoView);
  return E0(t ? T0(i) : i);
}
function T0(r) {
  let e = r.startState, t = !0;
  for (let i of e.facet(Vh)) {
    let o = i(r);
    if (o === !1) {
      t = !1;
      break;
    }
    Array.isArray(o) && (t = t === !0 ? o : D0(t, o));
  }
  if (t !== !0) {
    let i, o;
    if (t === !1)
      o = r.changes.invertedDesc, i = Ne.empty(e.doc.length);
    else {
      let s = r.changes.filter(t);
      i = s.changes, o = s.filtered.mapDesc(s.changes).invertedDesc;
    }
    r = Le.create(e, i, r.selection && r.selection.map(o), xe.mapEffects(r.effects, o), r.annotations, r.scrollIntoView);
  }
  let n = e.facet(_h);
  for (let i = n.length - 1; i >= 0; i--) {
    let o = n[i](r);
    o instanceof Le ? r = o : Array.isArray(o) && o.length == 1 && o[0] instanceof Le ? r = o[0] : r = qh(e, ir(o), !1);
  }
  return r;
}
function E0(r) {
  let e = r.startState, t = e.facet(jh), n = r;
  for (let i = t.length - 1; i >= 0; i--) {
    let o = t[i](r);
    o && Object.keys(o).length && (n = Uh(n, ws(e, o, r.changes.newLength), !0));
  }
  return n == r ? r : Le.create(e, r.changes, r.selection, n.effects, n.annotations, n.scrollIntoView);
}
const O0 = [];
function ir(r) {
  return r == null ? O0 : Array.isArray(r) ? r : [r];
}
var nn = /* @__PURE__ */ function(r) {
  return r[r.Word = 0] = "Word", r[r.Space = 1] = "Space", r[r.Other = 2] = "Other", r;
}(nn || (nn = {}));
const L0 = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let vs;
try {
  vs = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function R0(r) {
  if (vs)
    return vs.test(r);
  for (let e = 0; e < r.length; e++) {
    let t = r[e];
    if (/\w/.test(t) || t > "" && (t.toUpperCase() != t.toLowerCase() || L0.test(t)))
      return !0;
  }
  return !1;
}
function N0(r) {
  return (e) => {
    if (!/\S/.test(e))
      return nn.Space;
    if (R0(e))
      return nn.Word;
    for (let t = 0; t < r.length; t++)
      if (e.indexOf(r[t]) > -1)
        return nn.Word;
    return nn.Other;
  };
}
class ie {
  constructor(e, t, n, i, o, s) {
    this.config = e, this.doc = t, this.selection = n, this.values = i, this.status = e.statusTemplate.slice(), this.computeSlot = o, s && (s._state = this);
    for (let l = 0; l < this.config.dynamicSlots.length; l++)
      Lr(this, l << 1);
    this.computeSlot = null;
  }
  field(e, t = !0) {
    let n = this.config.address[e.id];
    if (n == null) {
      if (t)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return Lr(this, n), Gi(this, n);
  }
  /**
  Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
  state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
  can be passed. Unless
  [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
  [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
  are assumed to start in the _current_ document (not the document
  produced by previous specs), and its
  [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
  [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
  to the document created by its _own_ changes. The resulting
  transaction contains the combined effect of all the different
  specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
  specs take precedence over earlier ones.
  */
  update(...e) {
    return qh(this, e, !0);
  }
  /**
  @internal
  */
  applyTransaction(e) {
    let t = this.config, { base: n, compartments: i } = t;
    for (let l of e.effects)
      l.is(Vt.reconfigure) ? (t && (i = /* @__PURE__ */ new Map(), t.compartments.forEach((a, c) => i.set(c, a)), t = null), i.set(l.value.compartment, l.value.extension)) : l.is(xe.reconfigure) ? (t = null, n = l.value) : l.is(xe.appendConfig) && (t = null, n = ir(n).concat(l.value));
    let o;
    t ? o = e.startState.values.slice() : (t = Yi.resolve(n, i, this), o = new ie(t, this.doc, this.selection, t.dynamicSlots.map(() => null), (a, c) => c.reconfigure(a, this), null).values);
    let s = e.startState.facet(bs) ? e.newSelection : e.newSelection.asSingle();
    new ie(t, e.newDoc, s, o, (l, a) => a.update(l, e), e);
  }
  /**
  Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
  replaces every selection range with the given content.
  */
  replaceSelection(e) {
    return typeof e == "string" && (e = this.toText(e)), this.changeByRange((t) => ({
      changes: { from: t.from, to: t.to, insert: e },
      range: E.cursor(t.from + e.length)
    }));
  }
  /**
  Create a set of changes and a new selection by running the given
  function for each range in the active selection. The function
  can return an optional set of changes (in the coordinate space
  of the start document), plus an updated range (in the coordinate
  space of the document produced by the call's own changes). This
  method will merge all the changes and ranges into a single
  changeset and selection, and return it as a [transaction
  spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
  [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
  */
  changeByRange(e) {
    let t = this.selection, n = e(t.ranges[0]), i = this.changes(n.changes), o = [n.range], s = ir(n.effects);
    for (let l = 1; l < t.ranges.length; l++) {
      let a = e(t.ranges[l]), c = this.changes(a.changes), h = c.map(i);
      for (let u = 0; u < l; u++)
        o[u] = o[u].map(h);
      let d = i.mapDesc(c, !0);
      o.push(a.range.map(d)), i = i.compose(h), s = xe.mapEffects(s, h).concat(xe.mapEffects(ir(a.effects), d));
    }
    return {
      changes: i,
      selection: E.create(o, t.mainIndex),
      effects: s
    };
  }
  /**
  Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
  description, taking the state's document length and line
  separator into account.
  */
  changes(e = []) {
    return e instanceof Ne ? e : Ne.of(e, this.doc.length, this.facet(ie.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(e) {
    return se.of(e.split(this.facet(ie.lineSeparator) || ps));
  }
  /**
  Return the given range of the document as a string.
  */
  sliceDoc(e = 0, t = this.doc.length) {
    return this.doc.sliceString(e, t, this.lineBreak);
  }
  /**
  Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
  */
  facet(e) {
    let t = this.config.address[e.id];
    return t == null ? e.default : (Lr(this, t), Gi(this, t));
  }
  /**
  Convert this state to a JSON-serializable object. When custom
  fields should be serialized, you can pass them in as an object
  mapping property names (in the resulting object, which should
  not use `doc` or `selection`) to fields.
  */
  toJSON(e) {
    let t = {
      doc: this.sliceDoc(),
      selection: this.selection.toJSON()
    };
    if (e)
      for (let n in e) {
        let i = e[n];
        i instanceof an && this.config.address[i.id] != null && (t[n] = i.spec.toJSON(this.field(e[n]), this));
      }
    return t;
  }
  /**
  Deserialize a state from its JSON representation. When custom
  fields should be deserialized, pass the same object you passed
  to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
  third argument.
  */
  static fromJSON(e, t = {}, n) {
    if (!e || typeof e.doc != "string")
      throw new RangeError("Invalid JSON representation for EditorState");
    let i = [];
    if (n) {
      for (let o in n)
        if (Object.prototype.hasOwnProperty.call(e, o)) {
          let s = n[o], l = e[o];
          i.push(s.init((a) => s.spec.fromJSON(l, a)));
        }
    }
    return ie.create({
      doc: e.doc,
      selection: E.fromJSON(e.selection),
      extensions: t.extensions ? i.concat([t.extensions]) : i
    });
  }
  /**
  Create a new state. You'll usually only need this when
  initializing an editor—updated states are created by applying
  transactions.
  */
  static create(e = {}) {
    let t = Yi.resolve(e.extensions || [], /* @__PURE__ */ new Map()), n = e.doc instanceof se ? e.doc : se.of((e.doc || "").split(t.staticFacet(ie.lineSeparator) || ps)), i = e.selection ? e.selection instanceof E ? e.selection : E.single(e.selection.anchor, e.selection.head) : E.single(0);
    return Fh(i, n.length), t.staticFacet(bs) || (i = i.asSingle()), new ie(t, n, i, t.dynamicSlots.map(() => null), (o, s) => s.create(o), null);
  }
  /**
  The size (in columns) of a tab in the document, determined by
  the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
  */
  get tabSize() {
    return this.facet(ie.tabSize);
  }
  /**
  Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
  string for this state.
  */
  get lineBreak() {
    return this.facet(ie.lineSeparator) || `
`;
  }
  /**
  Returns true when the editor is
  [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
  */
  get readOnly() {
    return this.facet(Kh);
  }
  /**
  Look up a translation for the given phrase (via the
  [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
  original string if no translation is found.
  
  If additional arguments are passed, they will be inserted in
  place of markers like `$1` (for the first value) and `$2`, etc.
  A single `$` is equivalent to `$1`, and `$$` will produce a
  literal dollar sign.
  */
  phrase(e, ...t) {
    for (let n of this.facet(ie.phrases))
      if (Object.prototype.hasOwnProperty.call(n, e)) {
        e = n[e];
        break;
      }
    return t.length && (e = e.replace(/\$(\$|\d*)/g, (n, i) => {
      if (i == "$")
        return "$";
      let o = +(i || 1);
      return !o || o > t.length ? n : t[o - 1];
    })), e;
  }
  /**
  Find the values for a given language data field, provided by the
  the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
  
  Examples of language data fields are...
  
  - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
    comment syntax.
  - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
    for providing language-specific completion sources.
  - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
    characters that should be considered part of words in this
    language.
  - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
    bracket closing behavior.
  */
  languageDataAt(e, t, n = -1) {
    let i = [];
    for (let o of this.facet(Wh))
      for (let s of o(this, t, n))
        Object.prototype.hasOwnProperty.call(s, e) && i.push(s[e]);
    return i;
  }
  /**
  Return a function that can categorize strings (expected to
  represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
  into one of:
  
   - Word (contains an alphanumeric character or a character
     explicitly listed in the local language's `"wordChars"`
     language data, which should be a string)
   - Space (contains only whitespace)
   - Other (anything else)
  */
  charCategorizer(e) {
    let t = this.languageDataAt("wordChars", e);
    return N0(t.length ? t[0] : "");
  }
  /**
  Find the word at the given position, meaning the range
  containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
  around it. If no word characters are adjacent to the position,
  this returns null.
  */
  wordAt(e) {
    let { text: t, from: n, length: i } = this.doc.lineAt(e), o = this.charCategorizer(e), s = e - n, l = e - n;
    for (; s > 0; ) {
      let a = je(t, s, !1);
      if (o(t.slice(a, s)) != nn.Word)
        break;
      s = a;
    }
    for (; l < i; ) {
      let a = je(t, l);
      if (o(t.slice(l, a)) != nn.Word)
        break;
      l = a;
    }
    return s == l ? null : E.range(s + n, l + n);
  }
}
ie.allowMultipleSelections = bs;
ie.tabSize = /* @__PURE__ */ H.define({
  combine: (r) => r.length ? r[0] : 4
});
ie.lineSeparator = zh;
ie.readOnly = Kh;
ie.phrases = /* @__PURE__ */ H.define({
  compare(r, e) {
    let t = Object.keys(r), n = Object.keys(e);
    return t.length == n.length && t.every((i) => r[i] == e[i]);
  }
});
ie.languageData = Wh;
ie.changeFilter = Vh;
ie.transactionFilter = _h;
ie.transactionExtender = jh;
Vt.reconfigure = /* @__PURE__ */ xe.define();
function po(r, e, t = {}) {
  let n = {};
  for (let i of r)
    for (let o of Object.keys(i)) {
      let s = i[o], l = n[o];
      if (l === void 0)
        n[o] = s;
      else if (!(l === s || s === void 0)) if (Object.hasOwnProperty.call(t, o))
        n[o] = t[o](l, s);
      else
        throw new Error("Config merge conflict for field " + o);
    }
  for (let i in e)
    n[i] === void 0 && (n[i] = e[i]);
  return n;
}
class zn {
  /**
  Compare this value with another value. Used when comparing
  rangesets. The default implementation compares by identity.
  Unless you are only creating a fixed number of unique instances
  of your value type, it is a good idea to implement this
  properly.
  */
  eq(e) {
    return this == e;
  }
  /**
  Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
  */
  range(e, t = e) {
    return ks.create(e, t, this);
  }
}
zn.prototype.startSide = zn.prototype.endSide = 0;
zn.prototype.point = !1;
zn.prototype.mapMode = ct.TrackDel;
function dl(r, e) {
  return r == e || r.constructor == e.constructor && r.eq(e);
}
let ks = class Yh {
  constructor(e, t, n) {
    this.from = e, this.to = t, this.value = n;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new Yh(e, t, n);
  }
};
function Ss(r, e) {
  return r.from - e.from || r.value.startSide - e.value.startSide;
}
class ul {
  constructor(e, t, n, i) {
    this.from = e, this.to = t, this.value = n, this.maxPoint = i;
  }
  get length() {
    return this.to[this.to.length - 1];
  }
  // Find the index of the given position and side. Use the ranges'
  // `from` pos when `end == false`, `to` when `end == true`.
  findIndex(e, t, n, i = 0) {
    let o = n ? this.to : this.from;
    for (let s = i, l = o.length; ; ) {
      if (s == l)
        return s;
      let a = s + l >> 1, c = o[a] - e || (n ? this.value[a].endSide : this.value[a].startSide) - t;
      if (a == s)
        return c >= 0 ? s : l;
      c >= 0 ? l = a : s = a + 1;
    }
  }
  between(e, t, n, i) {
    for (let o = this.findIndex(t, -1e9, !0), s = this.findIndex(n, 1e9, !1, o); o < s; o++)
      if (i(this.from[o] + e, this.to[o] + e, this.value[o]) === !1)
        return !1;
  }
  map(e, t) {
    let n = [], i = [], o = [], s = -1, l = -1;
    for (let a = 0; a < this.value.length; a++) {
      let c = this.value[a], h = this.from[a] + e, d = this.to[a] + e, u, f;
      if (h == d) {
        let g = t.mapPos(h, c.startSide, c.mapMode);
        if (g == null || (u = f = g, c.startSide != c.endSide && (f = t.mapPos(h, c.endSide), f < u)))
          continue;
      } else if (u = t.mapPos(h, c.startSide), f = t.mapPos(d, c.endSide), u > f || u == f && c.startSide > 0 && c.endSide <= 0)
        continue;
      (f - u || c.endSide - c.startSide) < 0 || (s < 0 && (s = u), c.point && (l = Math.max(l, f - u)), n.push(c), i.push(u - s), o.push(f - s));
    }
    return { mapped: n.length ? new ul(i, o, n, l) : null, pos: s };
  }
}
class oe {
  constructor(e, t, n, i) {
    this.chunkPos = e, this.chunk = t, this.nextLayer = n, this.maxPoint = i;
  }
  /**
  @internal
  */
  static create(e, t, n, i) {
    return new oe(e, t, n, i);
  }
  /**
  @internal
  */
  get length() {
    let e = this.chunk.length - 1;
    return e < 0 ? 0 : Math.max(this.chunkEnd(e), this.nextLayer.length);
  }
  /**
  The number of ranges in the set.
  */
  get size() {
    if (this.isEmpty)
      return 0;
    let e = this.nextLayer.size;
    for (let t of this.chunk)
      e += t.value.length;
    return e;
  }
  /**
  @internal
  */
  chunkEnd(e) {
    return this.chunkPos[e] + this.chunk[e].length;
  }
  /**
  Update the range set, optionally adding new ranges or filtering
  out existing ones.
  
  (Note: The type parameter is just there as a kludge to work
  around TypeScript variance issues that prevented `RangeSet<X>`
  from being a subtype of `RangeSet<Y>` when `X` is a subtype of
  `Y`.)
  */
  update(e) {
    let { add: t = [], sort: n = !1, filterFrom: i = 0, filterTo: o = this.length } = e, s = e.filter;
    if (t.length == 0 && !s)
      return this;
    if (n && (t = t.slice().sort(Ss)), this.isEmpty)
      return t.length ? oe.of(t) : this;
    let l = new Gh(this, null, -1).goto(0), a = 0, c = [], h = new cr();
    for (; l.value || a < t.length; )
      if (a < t.length && (l.from - t[a].from || l.startSide - t[a].value.startSide) >= 0) {
        let d = t[a++];
        h.addInner(d.from, d.to, d.value) || c.push(d);
      } else l.rangeIndex == 1 && l.chunkIndex < this.chunk.length && (a == t.length || this.chunkEnd(l.chunkIndex) < t[a].from) && (!s || i > this.chunkEnd(l.chunkIndex) || o < this.chunkPos[l.chunkIndex]) && h.addChunk(this.chunkPos[l.chunkIndex], this.chunk[l.chunkIndex]) ? l.nextChunk() : ((!s || i > l.to || o < l.from || s(l.from, l.to, l.value)) && (h.addInner(l.from, l.to, l.value) || c.push(ks.create(l.from, l.to, l.value))), l.next());
    return h.finishInner(this.nextLayer.isEmpty && !c.length ? oe.empty : this.nextLayer.update({ add: c, filter: s, filterFrom: i, filterTo: o }));
  }
  /**
  Map this range set through a set of changes, return the new set.
  */
  map(e) {
    if (e.empty || this.isEmpty)
      return this;
    let t = [], n = [], i = -1;
    for (let s = 0; s < this.chunk.length; s++) {
      let l = this.chunkPos[s], a = this.chunk[s], c = e.touchesRange(l, l + a.length);
      if (c === !1)
        i = Math.max(i, a.maxPoint), t.push(a), n.push(e.mapPos(l));
      else if (c === !0) {
        let { mapped: h, pos: d } = a.map(l, e);
        h && (i = Math.max(i, h.maxPoint), t.push(h), n.push(d));
      }
    }
    let o = this.nextLayer.map(e);
    return t.length == 0 ? o : new oe(n, t, o || oe.empty, i);
  }
  /**
  Iterate over the ranges that touch the region `from` to `to`,
  calling `f` for each. There is no guarantee that the ranges will
  be reported in any specific order. When the callback returns
  `false`, iteration stops.
  */
  between(e, t, n) {
    if (!this.isEmpty) {
      for (let i = 0; i < this.chunk.length; i++) {
        let o = this.chunkPos[i], s = this.chunk[i];
        if (t >= o && e <= o + s.length && s.between(o, e - o, t - o, n) === !1)
          return;
      }
      this.nextLayer.between(e, t, n);
    }
  }
  /**
  Iterate over the ranges in this set, in order, including all
  ranges that end at or after `from`.
  */
  iter(e = 0) {
    return zr.from([this]).goto(e);
  }
  /**
  @internal
  */
  get isEmpty() {
    return this.nextLayer == this;
  }
  /**
  Iterate over the ranges in a collection of sets, in order,
  starting from `from`.
  */
  static iter(e, t = 0) {
    return zr.from(e).goto(t);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(e, t, n, i, o = -1) {
    let s = e.filter((d) => d.maxPoint > 0 || !d.isEmpty && d.maxPoint >= o), l = t.filter((d) => d.maxPoint > 0 || !d.isEmpty && d.maxPoint >= o), a = Da(s, l, n), c = new kr(s, a, o), h = new kr(l, a, o);
    n.iterGaps((d, u, f) => Ta(c, d, h, u, f, i)), n.empty && n.length == 0 && Ta(c, 0, h, 0, 0, i);
  }
  /**
  Compare the contents of two groups of range sets, returning true
  if they are equivalent in the given range.
  */
  static eq(e, t, n = 0, i) {
    i == null && (i = 999999999);
    let o = e.filter((h) => !h.isEmpty && t.indexOf(h) < 0), s = t.filter((h) => !h.isEmpty && e.indexOf(h) < 0);
    if (o.length != s.length)
      return !1;
    if (!o.length)
      return !0;
    let l = Da(o, s), a = new kr(o, l, 0).goto(n), c = new kr(s, l, 0).goto(n);
    for (; ; ) {
      if (a.to != c.to || !Cs(a.active, c.active) || a.point && (!c.point || !dl(a.point, c.point)))
        return !1;
      if (a.to > i)
        return !0;
      a.next(), c.next();
    }
  }
  /**
  Iterate over a group of range sets at the same time, notifying
  the iterator about the ranges covering every given piece of
  content. Returns the open count (see
  [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
  of the iteration.
  */
  static spans(e, t, n, i, o = -1) {
    let s = new kr(e, null, o).goto(t), l = t, a = s.openStart;
    for (; ; ) {
      let c = Math.min(s.to, n);
      if (s.point) {
        let h = s.activeForPoint(s.to), d = s.pointFrom < t ? h.length + 1 : s.point.startSide < 0 ? h.length : Math.min(h.length, a);
        i.point(l, c, s.point, h, d, s.pointRank), a = Math.min(s.openEnd(c), h.length);
      } else c > l && (i.span(l, c, s.active, a), a = s.openEnd(c));
      if (s.to > n)
        return a + (s.point && s.to > n ? 1 : 0);
      l = s.to, s.next();
    }
  }
  /**
  Create a range set for the given range or array of ranges. By
  default, this expects the ranges to be _sorted_ (by start
  position and, if two start at the same position,
  `value.startSide`). You can pass `true` as second argument to
  cause the method to sort them.
  */
  static of(e, t = !1) {
    let n = new cr();
    for (let i of e instanceof ks ? [e] : t ? B0(e) : e)
      n.add(i.from, i.to, i.value);
    return n.finish();
  }
  /**
  Join an array of range sets into a single set.
  */
  static join(e) {
    if (!e.length)
      return oe.empty;
    let t = e[e.length - 1];
    for (let n = e.length - 2; n >= 0; n--)
      for (let i = e[n]; i != oe.empty; i = i.nextLayer)
        t = new oe(i.chunkPos, i.chunk, t, Math.max(i.maxPoint, t.maxPoint));
    return t;
  }
}
oe.empty = /* @__PURE__ */ new oe([], [], null, -1);
function B0(r) {
  if (r.length > 1)
    for (let e = r[0], t = 1; t < r.length; t++) {
      let n = r[t];
      if (Ss(e, n) > 0)
        return r.slice().sort(Ss);
      e = n;
    }
  return r;
}
oe.empty.nextLayer = oe.empty;
class cr {
  finishChunk(e) {
    this.chunks.push(new ul(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, e && (this.from = [], this.to = [], this.value = []);
  }
  /**
  Create an empty builder.
  */
  constructor() {
    this.chunks = [], this.chunkPos = [], this.chunkStart = -1, this.last = null, this.lastFrom = -1e9, this.lastTo = -1e9, this.from = [], this.to = [], this.value = [], this.maxPoint = -1, this.setMaxPoint = -1, this.nextLayer = null;
  }
  /**
  Add a range. Ranges should be added in sorted (by `from` and
  `value.startSide`) order.
  */
  add(e, t, n) {
    this.addInner(e, t, n) || (this.nextLayer || (this.nextLayer = new cr())).add(e, t, n);
  }
  /**
  @internal
  */
  addInner(e, t, n) {
    let i = e - this.lastTo || n.startSide - this.last.endSide;
    if (i <= 0 && (e - this.lastFrom || n.startSide - this.last.startSide) < 0)
      throw new Error("Ranges must be added sorted by `from` position and `startSide`");
    return i < 0 ? !1 : (this.from.length == 250 && this.finishChunk(!0), this.chunkStart < 0 && (this.chunkStart = e), this.from.push(e - this.chunkStart), this.to.push(t - this.chunkStart), this.last = n, this.lastFrom = e, this.lastTo = t, this.value.push(n), n.point && (this.maxPoint = Math.max(this.maxPoint, t - e)), !0);
  }
  /**
  @internal
  */
  addChunk(e, t) {
    if ((e - this.lastTo || t.value[0].startSide - this.last.endSide) < 0)
      return !1;
    this.from.length && this.finishChunk(!0), this.setMaxPoint = Math.max(this.setMaxPoint, t.maxPoint), this.chunks.push(t), this.chunkPos.push(e);
    let n = t.value.length - 1;
    return this.last = t.value[n], this.lastFrom = t.from[n] + e, this.lastTo = t.to[n] + e, !0;
  }
  /**
  Finish the range set. Returns the new set. The builder can't be
  used anymore after this has been called.
  */
  finish() {
    return this.finishInner(oe.empty);
  }
  /**
  @internal
  */
  finishInner(e) {
    if (this.from.length && this.finishChunk(!1), this.chunks.length == 0)
      return e;
    let t = oe.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(e) : e, this.setMaxPoint);
    return this.from = null, t;
  }
}
function Da(r, e, t) {
  let n = /* @__PURE__ */ new Map();
  for (let o of r)
    for (let s = 0; s < o.chunk.length; s++)
      o.chunk[s].maxPoint <= 0 && n.set(o.chunk[s], o.chunkPos[s]);
  let i = /* @__PURE__ */ new Set();
  for (let o of e)
    for (let s = 0; s < o.chunk.length; s++) {
      let l = n.get(o.chunk[s]);
      l != null && (t ? t.mapPos(l) : l) == o.chunkPos[s] && !(t != null && t.touchesRange(l, l + o.chunk[s].length)) && i.add(o.chunk[s]);
    }
  return i;
}
class Gh {
  constructor(e, t, n, i = 0) {
    this.layer = e, this.skip = t, this.minPoint = n, this.rank = i;
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  get endSide() {
    return this.value ? this.value.endSide : 0;
  }
  goto(e, t = -1e9) {
    return this.chunkIndex = this.rangeIndex = 0, this.gotoInner(e, t, !1), this;
  }
  gotoInner(e, t, n) {
    for (; this.chunkIndex < this.layer.chunk.length; ) {
      let i = this.layer.chunk[this.chunkIndex];
      if (!(this.skip && this.skip.has(i) || this.layer.chunkEnd(this.chunkIndex) < e || i.maxPoint < this.minPoint))
        break;
      this.chunkIndex++, n = !1;
    }
    if (this.chunkIndex < this.layer.chunk.length) {
      let i = this.layer.chunk[this.chunkIndex].findIndex(e - this.layer.chunkPos[this.chunkIndex], t, !0);
      (!n || this.rangeIndex < i) && this.setRangeIndex(i);
    }
    this.next();
  }
  forward(e, t) {
    (this.to - e || this.endSide - t) < 0 && this.gotoInner(e, t, !0);
  }
  next() {
    for (; ; )
      if (this.chunkIndex == this.layer.chunk.length) {
        this.from = this.to = 1e9, this.value = null;
        break;
      } else {
        let e = this.layer.chunkPos[this.chunkIndex], t = this.layer.chunk[this.chunkIndex], n = e + t.from[this.rangeIndex];
        if (this.from = n, this.to = e + t.to[this.rangeIndex], this.value = t.value[this.rangeIndex], this.setRangeIndex(this.rangeIndex + 1), this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
          break;
      }
  }
  setRangeIndex(e) {
    if (e == this.layer.chunk[this.chunkIndex].value.length) {
      if (this.chunkIndex++, this.skip)
        for (; this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]); )
          this.chunkIndex++;
      this.rangeIndex = 0;
    } else
      this.rangeIndex = e;
  }
  nextChunk() {
    this.chunkIndex++, this.rangeIndex = 0, this.next();
  }
  compare(e) {
    return this.from - e.from || this.startSide - e.startSide || this.rank - e.rank || this.to - e.to || this.endSide - e.endSide;
  }
}
class zr {
  constructor(e) {
    this.heap = e;
  }
  static from(e, t = null, n = -1) {
    let i = [];
    for (let o = 0; o < e.length; o++)
      for (let s = e[o]; !s.isEmpty; s = s.nextLayer)
        s.maxPoint >= n && i.push(new Gh(s, t, n, o));
    return i.length == 1 ? i[0] : new zr(i);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(e, t = -1e9) {
    for (let n of this.heap)
      n.goto(e, t);
    for (let n = this.heap.length >> 1; n >= 0; n--)
      Bo(this.heap, n);
    return this.next(), this;
  }
  forward(e, t) {
    for (let n of this.heap)
      n.forward(e, t);
    for (let n = this.heap.length >> 1; n >= 0; n--)
      Bo(this.heap, n);
    (this.to - e || this.value.endSide - t) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let e = this.heap[0];
      this.from = e.from, this.to = e.to, this.value = e.value, this.rank = e.rank, e.value && e.next(), Bo(this.heap, 0);
    }
  }
}
function Bo(r, e) {
  for (let t = r[e]; ; ) {
    let n = (e << 1) + 1;
    if (n >= r.length)
      break;
    let i = r[n];
    if (n + 1 < r.length && i.compare(r[n + 1]) >= 0 && (i = r[n + 1], n++), t.compare(i) < 0)
      break;
    r[n] = t, r[e] = i, e = n;
  }
}
class kr {
  constructor(e, t, n) {
    this.minPoint = n, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = zr.from(e, t, n);
  }
  goto(e, t = -1e9) {
    return this.cursor.goto(e, t), this.active.length = this.activeTo.length = this.activeRank.length = 0, this.minActive = -1, this.to = e, this.endSide = t, this.openStart = -1, this.next(), this;
  }
  forward(e, t) {
    for (; this.minActive > -1 && (this.activeTo[this.minActive] - e || this.active[this.minActive].endSide - t) < 0; )
      this.removeActive(this.minActive);
    this.cursor.forward(e, t);
  }
  removeActive(e) {
    yi(this.active, e), yi(this.activeTo, e), yi(this.activeRank, e), this.minActive = Ea(this.active, this.activeTo);
  }
  addActive(e) {
    let t = 0, { value: n, to: i, rank: o } = this.cursor;
    for (; t < this.activeRank.length && (o - this.activeRank[t] || i - this.activeTo[t]) > 0; )
      t++;
    xi(this.active, t, n), xi(this.activeTo, t, i), xi(this.activeRank, t, o), e && xi(e, t, this.cursor.from), this.minActive = Ea(this.active, this.activeTo);
  }
  // After calling this, if `this.point` != null, the next range is a
  // point. Otherwise, it's a regular range, covered by `this.active`.
  next() {
    let e = this.to, t = this.point;
    this.point = null;
    let n = this.openStart < 0 ? [] : null;
    for (; ; ) {
      let i = this.minActive;
      if (i > -1 && (this.activeTo[i] - this.cursor.from || this.active[i].endSide - this.cursor.startSide) < 0) {
        if (this.activeTo[i] > e) {
          this.to = this.activeTo[i], this.endSide = this.active[i].endSide;
          break;
        }
        this.removeActive(i), n && yi(n, i);
      } else if (this.cursor.value)
        if (this.cursor.from > e) {
          this.to = this.cursor.from, this.endSide = this.cursor.startSide;
          break;
        } else {
          let o = this.cursor.value;
          if (!o.point)
            this.addActive(n), this.cursor.next();
          else if (t && this.cursor.to == this.to && this.cursor.from < this.cursor.to)
            this.cursor.next();
          else {
            this.point = o, this.pointFrom = this.cursor.from, this.pointRank = this.cursor.rank, this.to = this.cursor.to, this.endSide = o.endSide, this.cursor.next(), this.forward(this.to, this.endSide);
            break;
          }
        }
      else {
        this.to = this.endSide = 1e9;
        break;
      }
    }
    if (n) {
      this.openStart = 0;
      for (let i = n.length - 1; i >= 0 && n[i] < e; i--)
        this.openStart++;
    }
  }
  activeForPoint(e) {
    if (!this.active.length)
      return this.active;
    let t = [];
    for (let n = this.active.length - 1; n >= 0 && !(this.activeRank[n] < this.pointRank); n--)
      (this.activeTo[n] > e || this.activeTo[n] == e && this.active[n].endSide >= this.point.endSide) && t.push(this.active[n]);
    return t.reverse();
  }
  openEnd(e) {
    let t = 0;
    for (let n = this.activeTo.length - 1; n >= 0 && this.activeTo[n] > e; n--)
      t++;
    return t;
  }
}
function Ta(r, e, t, n, i, o) {
  r.goto(e), t.goto(n);
  let s = n + i, l = n, a = n - e, c = !!o.boundChange;
  for (let h = !1; ; ) {
    let d = r.to + a - t.to, u = d || r.endSide - t.endSide, f = u < 0 ? r.to + a : t.to, g = Math.min(f, s);
    if (r.point || t.point ? (r.point && t.point && dl(r.point, t.point) && Cs(r.activeForPoint(r.to), t.activeForPoint(t.to)) || o.comparePoint(l, g, r.point, t.point), h = !1) : (h && o.boundChange(l), g > l && !Cs(r.active, t.active) && o.compareRange(l, g, r.active, t.active), c && g < s && (d || r.openEnd(f) != t.openEnd(f)) && (h = !0)), f > s)
      break;
    l = f, u <= 0 && r.next(), u >= 0 && t.next();
  }
}
function Cs(r, e) {
  if (r.length != e.length)
    return !1;
  for (let t = 0; t < r.length; t++)
    if (r[t] != e[t] && !dl(r[t], e[t]))
      return !1;
  return !0;
}
function yi(r, e) {
  for (let t = e, n = r.length - 1; t < n; t++)
    r[t] = r[t + 1];
  r.pop();
}
function xi(r, e, t) {
  for (let n = r.length - 1; n >= e; n--)
    r[n + 1] = r[n];
  r[e] = t;
}
function Ea(r, e) {
  let t = -1, n = 1e9;
  for (let i = 0; i < e.length; i++)
    (e[i] - n || r[i].endSide - r[t].endSide) < 0 && (t = i, n = e[i]);
  return t;
}
function Gr(r, e, t = r.length) {
  let n = 0;
  for (let i = 0; i < t && i < r.length; )
    r.charCodeAt(i) == 9 ? (n += e - n % e, i++) : (n++, i = je(r, i));
  return n;
}
function As(r, e, t, n) {
  for (let i = 0, o = 0; ; ) {
    if (o >= e)
      return i;
    if (i == r.length)
      break;
    o += r.charCodeAt(i) == 9 ? t - o % t : 1, i = je(r, i);
  }
  return n === !0 ? -1 : r.length;
}
const Ms = "ͼ", Oa = typeof Symbol > "u" ? "__" + Ms : Symbol.for(Ms), Ds = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet"), La = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class hr {
  // :: (Object<Style>, ?{finish: ?(string) → string})
  // Create a style module from the given spec.
  //
  // When `finish` is given, it is called on regular (non-`@`)
  // selectors (after `&` expansion) to compute the final selector.
  constructor(e, t) {
    this.rules = [];
    let { finish: n } = t || {};
    function i(s) {
      return /^@/.test(s) ? [s] : s.split(/,\s*/);
    }
    function o(s, l, a, c) {
      let h = [], d = /^@(\w+)\b/.exec(s[0]), u = d && d[1] == "keyframes";
      if (d && l == null) return a.push(s[0] + ";");
      for (let f in l) {
        let g = l[f];
        if (/&/.test(f))
          o(
            f.split(/,\s*/).map((w) => s.map((k) => w.replace(/&/, k))).reduce((w, k) => w.concat(k)),
            g,
            a
          );
        else if (g && typeof g == "object") {
          if (!d) throw new RangeError("The value of a property (" + f + ") should be a primitive value.");
          o(i(f), g, h, u);
        } else g != null && h.push(f.replace(/_.*/, "").replace(/[A-Z]/g, (w) => "-" + w.toLowerCase()) + ": " + g + ";");
      }
      (h.length || u) && a.push((n && !d && !c ? s.map(n) : s).join(", ") + " {" + h.join(" ") + "}");
    }
    for (let s in e) o(i(s), e[s], this.rules);
  }
  // :: () → string
  // Returns a string containing the module's CSS rules.
  getRules() {
    return this.rules.join(`
`);
  }
  // :: () → string
  // Generate a new unique CSS class name.
  static newName() {
    let e = La[Oa] || 1;
    return La[Oa] = e + 1, Ms + e.toString(36);
  }
  // :: (union<Document, ShadowRoot>, union<[StyleModule], StyleModule>, ?{nonce: ?string})
  //
  // Mount the given set of modules in the given DOM root, which ensures
  // that the CSS rules defined by the module are available in that
  // context.
  //
  // Rules are only added to the document once per root.
  //
  // Rule order will follow the order of the modules, so that rules from
  // modules later in the array take precedence of those from earlier
  // modules. If you call this function multiple times for the same root
  // in a way that changes the order of already mounted modules, the old
  // order will be changed.
  //
  // If a Content Security Policy nonce is provided, it is added to
  // the `<style>` tag generated by the library.
  static mount(e, t, n) {
    let i = e[Ds], o = n && n.nonce;
    i ? o && i.setNonce(o) : i = new I0(e, o), i.mount(Array.isArray(t) ? t : [t], e);
  }
}
let Ra = /* @__PURE__ */ new Map();
class I0 {
  constructor(e, t) {
    let n = e.ownerDocument || e, i = n.defaultView;
    if (!e.head && e.adoptedStyleSheets && i.CSSStyleSheet) {
      let o = Ra.get(n);
      if (o) return e[Ds] = o;
      this.sheet = new i.CSSStyleSheet(), Ra.set(n, this);
    } else
      this.styleTag = n.createElement("style"), t && this.styleTag.setAttribute("nonce", t);
    this.modules = [], e[Ds] = this;
  }
  mount(e, t) {
    let n = this.sheet, i = 0, o = 0;
    for (let s = 0; s < e.length; s++) {
      let l = e[s], a = this.modules.indexOf(l);
      if (a < o && a > -1 && (this.modules.splice(a, 1), o--, a = -1), a == -1) {
        if (this.modules.splice(o++, 0, l), n) for (let c = 0; c < l.rules.length; c++)
          n.insertRule(l.rules[c], i++);
      } else {
        for (; o < a; ) i += this.modules[o++].rules.length;
        i += l.rules.length, o++;
      }
    }
    if (n)
      t.adoptedStyleSheets.indexOf(this.sheet) < 0 && (t.adoptedStyleSheets = [this.sheet, ...t.adoptedStyleSheets]);
    else {
      let s = "";
      for (let a = 0; a < this.modules.length; a++)
        s += this.modules[a].getRules() + `
`;
      this.styleTag.textContent = s;
      let l = t.head || t;
      this.styleTag.parentNode != l && l.insertBefore(this.styleTag, l.firstChild);
    }
  }
  setNonce(e) {
    this.styleTag && this.styleTag.getAttribute("nonce") != e && this.styleTag.setAttribute("nonce", e);
  }
}
var xn = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
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
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
}, Vr = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: '"'
}, P0 = typeof navigator < "u" && /Mac/.test(navigator.platform), $0 = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var He = 0; He < 10; He++) xn[48 + He] = xn[96 + He] = String(He);
for (var He = 1; He <= 24; He++) xn[He + 111] = "F" + He;
for (var He = 65; He <= 90; He++)
  xn[He] = String.fromCharCode(He + 32), Vr[He] = String.fromCharCode(He);
for (var Io in xn) Vr.hasOwnProperty(Io) || (Vr[Io] = xn[Io]);
function F0(r) {
  var e = P0 && r.metaKey && r.shiftKey && !r.ctrlKey && !r.altKey || $0 && r.shiftKey && r.key && r.key.length == 1 || r.key == "Unidentified", t = !e && r.key || (r.shiftKey ? Vr : xn)[r.keyCode] || r.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
let Ge = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, Ts = typeof document < "u" ? document : { documentElement: { style: {} } };
const Es = /* @__PURE__ */ /Edge\/(\d+)/.exec(Ge.userAgent), Jh = /* @__PURE__ */ /MSIE \d/.test(Ge.userAgent), Os = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(Ge.userAgent), mo = !!(Jh || Os || Es), Na = !mo && /* @__PURE__ */ /gecko\/(\d+)/i.test(Ge.userAgent), Po = !mo && /* @__PURE__ */ /Chrome\/(\d+)/.exec(Ge.userAgent), Ba = "webkitFontSmoothing" in Ts.documentElement.style, Ls = !mo && /* @__PURE__ */ /Apple Computer/.test(Ge.vendor), Ia = Ls && (/* @__PURE__ */ /Mobile\/\w+/.test(Ge.userAgent) || Ge.maxTouchPoints > 2);
var I = {
  mac: Ia || /* @__PURE__ */ /Mac/.test(Ge.platform),
  windows: /* @__PURE__ */ /Win/.test(Ge.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(Ge.platform),
  ie: mo,
  ie_version: Jh ? Ts.documentMode || 6 : Os ? +Os[1] : Es ? +Es[1] : 0,
  gecko: Na,
  gecko_version: Na ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(Ge.userAgent) || [0, 0])[1] : 0,
  chrome: !!Po,
  chrome_version: Po ? +Po[1] : 0,
  ios: Ia,
  android: /* @__PURE__ */ /Android\b/.test(Ge.userAgent),
  webkit: Ba,
  webkit_version: Ba ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(Ge.userAgent) || [0, 0])[1] : 0,
  safari: Ls,
  safari_version: Ls ? +(/* @__PURE__ */ /\bVersion\/(\d+(\.\d+)?)/.exec(Ge.userAgent) || [0, 0])[1] : 0,
  tabSize: Ts.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
function fl(r, e) {
  for (let t in r)
    t == "class" && e.class ? e.class += " " + r.class : t == "style" && e.style ? e.style += ";" + r.style : e[t] = r[t];
  return e;
}
const Ji = /* @__PURE__ */ Object.create(null);
function pl(r, e, t) {
  if (r == e)
    return !0;
  r || (r = Ji), e || (e = Ji);
  let n = Object.keys(r), i = Object.keys(e);
  if (n.length - 0 != i.length - 0)
    return !1;
  for (let o of n)
    if (o != t && (i.indexOf(o) == -1 || r[o] !== e[o]))
      return !1;
  return !0;
}
function H0(r, e) {
  for (let t = r.attributes.length - 1; t >= 0; t--) {
    let n = r.attributes[t].name;
    e[n] == null && r.removeAttribute(n);
  }
  for (let t in e) {
    let n = e[t];
    t == "style" ? r.style.cssText = n : r.getAttribute(t) != n && r.setAttribute(t, n);
  }
}
function Pa(r, e, t) {
  let n = !1;
  if (e)
    for (let i in e)
      t && i in t || (n = !0, i == "style" ? r.style.cssText = "" : r.removeAttribute(i));
  if (t)
    for (let i in t)
      e && e[i] == t[i] || (n = !0, i == "style" ? r.style.cssText = t[i] : r.setAttribute(i, t[i]));
  return n;
}
function W0(r) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t = 0; t < r.attributes.length; t++) {
    let n = r.attributes[t];
    e[n.name] = n.value;
  }
  return e;
}
class qn {
  /**
  Compare this instance to another instance of the same type.
  (TypeScript can't express this, but only instances of the same
  specific class will be passed to this method.) This is used to
  avoid redrawing widgets when they are replaced by a new
  decoration of the same type. The default implementation just
  returns `false`, which will cause new instances of the widget to
  always be redrawn.
  */
  eq(e) {
    return !1;
  }
  /**
  Update a DOM element created by a widget of the same type (but
  different, non-`eq` content) to reflect this widget. May return
  true to indicate that it could update, false to indicate it
  couldn't (in which case the widget will be redrawn). The default
  implementation just returns false.
  */
  updateDOM(e, t, n) {
    return !1;
  }
  /**
  @internal
  */
  compare(e) {
    return this == e || this.constructor == e.constructor && this.eq(e);
  }
  /**
  The estimated height this widget will have, to be used when
  estimating the height of content that hasn't been drawn. May
  return -1 to indicate you don't know. The default implementation
  returns -1.
  */
  get estimatedHeight() {
    return -1;
  }
  /**
  For inline widgets that are displayed inline (as opposed to
  `inline-block`) and introduce line breaks (through `<br>` tags
  or textual newlines), this must indicate the amount of line
  breaks they introduce. Defaults to 0.
  */
  get lineBreaks() {
    return 0;
  }
  /**
  Can be used to configure which kinds of events inside the widget
  should be ignored by the editor. The default is to ignore all
  events.
  */
  ignoreEvent(e) {
    return !0;
  }
  /**
  Override the way screen coordinates for positions at/in the
  widget are found. `pos` will be the offset into the widget, and
  `side` the side of the position that is being queried—less than
  zero for before, greater than zero for after, and zero for
  directly at that position.
  */
  coordsAt(e, t, n) {
    return null;
  }
  /**
  @internal
  */
  get isHidden() {
    return !1;
  }
  /**
  @internal
  */
  get editable() {
    return !1;
  }
  /**
  This is called when the an instance of the widget is removed
  from the editor view.
  */
  destroy(e) {
  }
}
var nt = /* @__PURE__ */ function(r) {
  return r[r.Text = 0] = "Text", r[r.WidgetBefore = 1] = "WidgetBefore", r[r.WidgetAfter = 2] = "WidgetAfter", r[r.WidgetRange = 3] = "WidgetRange", r;
}(nt || (nt = {}));
class te extends zn {
  constructor(e, t, n, i) {
    super(), this.startSide = e, this.endSide = t, this.widget = n, this.spec = i;
  }
  /**
  @internal
  */
  get heightRelevant() {
    return !1;
  }
  /**
  Create a mark decoration, which influences the styling of the
  content in its range. Nested mark decorations will cause nested
  DOM elements to be created. Nesting order is determined by
  precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
  the higher-precedence decorations creating the inner DOM nodes.
  Such elements are split on line boundaries and on the boundaries
  of lower-precedence decorations.
  */
  static mark(e) {
    return new Jr(e);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(e) {
    let t = Math.max(-1e4, Math.min(1e4, e.side || 0)), n = !!e.block;
    return t += n && !e.inlineOrder ? t > 0 ? 3e8 : -4e8 : t > 0 ? 1e8 : -1e8, new Vn(e, t, t, n, e.widget || null, !1);
  }
  /**
  Create a replace decoration which replaces the given range with
  a widget, or simply hides it.
  */
  static replace(e) {
    let t = !!e.block, n, i;
    if (e.isBlockGap)
      n = -5e8, i = 4e8;
    else {
      let { start: o, end: s } = Xh(e, t);
      n = (o ? t ? -3e8 : -1 : 5e8) - 1, i = (s ? t ? 2e8 : 1 : -6e8) + 1;
    }
    return new Vn(e, n, i, t, e.widget || null, !0);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(e) {
    return new Xr(e);
  }
  /**
  Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
  decorated range or ranges. If the ranges aren't already sorted,
  pass `true` for `sort` to make the library sort them for you.
  */
  static set(e, t = !1) {
    return oe.of(e, t);
  }
  /**
  @internal
  */
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : !1;
  }
}
te.none = oe.empty;
class Jr extends te {
  constructor(e) {
    let { start: t, end: n } = Xh(e);
    super(t ? -1 : 5e8, n ? 1 : -6e8, null, e), this.tagName = e.tagName || "span", this.attrs = e.class && e.attributes ? fl(e.attributes, { class: e.class }) : e.class ? { class: e.class } : e.attributes || Ji;
  }
  eq(e) {
    return this == e || e instanceof Jr && this.tagName == e.tagName && pl(this.attrs, e.attrs);
  }
  range(e, t = e) {
    if (e >= t)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(e, t);
  }
}
Jr.prototype.point = !1;
class Xr extends te {
  constructor(e) {
    super(-2e8, -2e8, null, e);
  }
  eq(e) {
    return e instanceof Xr && this.spec.class == e.spec.class && pl(this.spec.attributes, e.spec.attributes);
  }
  range(e, t = e) {
    if (t != e)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(e, t);
  }
}
Xr.prototype.mapMode = ct.TrackBefore;
Xr.prototype.point = !0;
class Vn extends te {
  constructor(e, t, n, i, o, s) {
    super(t, n, o, e), this.block = i, this.isReplace = s, this.mapMode = i ? t <= 0 ? ct.TrackBefore : ct.TrackAfter : ct.TrackDel;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide != this.endSide ? nt.WidgetRange : this.startSide <= 0 ? nt.WidgetBefore : nt.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(e) {
    return e instanceof Vn && z0(this.widget, e.widget) && this.block == e.block && this.startSide == e.startSide && this.endSide == e.endSide;
  }
  range(e, t = e) {
    if (this.isReplace && (e > t || e == t && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && t != e)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(e, t);
  }
}
Vn.prototype.point = !0;
function Xh(r, e = !1) {
  let { inclusiveStart: t, inclusiveEnd: n } = r;
  return t == null && (t = r.inclusive), n == null && (n = r.inclusive), { start: t ?? e, end: n ?? e };
}
function z0(r, e) {
  return r == e || !!(r && e && r.compare(e));
}
function or(r, e, t, n = 0) {
  let i = t.length - 1;
  i >= 0 && t[i] + n >= r ? t[i] = Math.max(t[i], e) : t.push(r, e);
}
class _r extends zn {
  constructor(e, t, n) {
    super(), this.tagName = e, this.attributes = t, this.rank = n;
  }
  eq(e) {
    return e == this || e instanceof _r && this.tagName == e.tagName && pl(this.attributes, e.attributes);
  }
  /**
  Create a block wrapper object with the given tag name and
  attributes.
  */
  static create(e) {
    return new _r(e.tagName, e.attributes || Ji, e.rank == null ? 50 : Math.max(0, Math.min(e.rank, 100)));
  }
  /**
  Create a range set from the given block wrapper ranges.
  */
  static set(e, t = !1) {
    return oe.of(e, t);
  }
}
_r.prototype.startSide = _r.prototype.endSide = -1;
function jr(r) {
  let e;
  return r.nodeType == 11 ? e = r.getSelection ? r : r.ownerDocument : e = r, e.getSelection();
}
function Rs(r, e) {
  return e ? r == e || r.contains(e.nodeType != 1 ? e.parentNode : e) : !1;
}
function Rr(r, e) {
  if (!e.anchorNode)
    return !1;
  try {
    return Rs(r, e.anchorNode);
  } catch {
    return !1;
  }
}
function Nr(r) {
  return r.nodeType == 3 ? Ur(r, 0, r.nodeValue.length).getClientRects() : r.nodeType == 1 ? r.getClientRects() : [];
}
function Br(r, e, t, n) {
  return t ? $a(r, e, t, n, -1) || $a(r, e, t, n, 1) : !1;
}
function bn(r) {
  for (var e = 0; ; e++)
    if (r = r.previousSibling, !r)
      return e;
}
function Xi(r) {
  return r.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(r.nodeName);
}
function $a(r, e, t, n, i) {
  for (; ; ) {
    if (r == t && e == n)
      return !0;
    if (e == (i < 0 ? 0 : sn(r))) {
      if (r.nodeName == "DIV")
        return !1;
      let o = r.parentNode;
      if (!o || o.nodeType != 1)
        return !1;
      e = bn(r) + (i < 0 ? 0 : 1), r = o;
    } else if (r.nodeType == 1) {
      if (r = r.childNodes[e + (i < 0 ? -1 : 0)], r.nodeType == 1 && r.contentEditable == "false")
        return !1;
      e = i < 0 ? sn(r) : 0;
    } else
      return !1;
  }
}
function sn(r) {
  return r.nodeType == 3 ? r.nodeValue.length : r.childNodes.length;
}
function Kr(r, e) {
  let { left: t, right: n } = r;
  if (t == n)
    return r;
  let i = e ? t : n;
  return { left: i, right: i, top: r.top, bottom: r.bottom };
}
function V0(r) {
  let e = r.visualViewport;
  return e ? {
    left: 0,
    right: e.width,
    top: 0,
    bottom: e.height
  } : {
    left: 0,
    right: r.innerWidth,
    top: 0,
    bottom: r.innerHeight
  };
}
function Zh(r, e) {
  let t = e.width / r.offsetWidth, n = e.height / r.offsetHeight;
  return (t > 0.995 && t < 1.005 || !isFinite(t) || Math.abs(e.width - r.offsetWidth) < 1) && (t = 1), (n > 0.995 && n < 1.005 || !isFinite(n) || Math.abs(e.height - r.offsetHeight) < 1) && (n = 1), { scaleX: t, scaleY: n };
}
function _0(r, e, t, n, i, o, s, l) {
  let a = r.ownerDocument, c = a.defaultView || window;
  for (let h = r, d = !1; h && !d; )
    if (h.nodeType == 1) {
      let u, f = h == a.body, g = 1, w = 1;
      if (f)
        u = V0(c);
      else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(h).position) && (d = !0), h.scrollHeight <= h.clientHeight && h.scrollWidth <= h.clientWidth) {
          h = h.assignedSlot || h.parentNode;
          continue;
        }
        let D = h.getBoundingClientRect();
        ({ scaleX: g, scaleY: w } = Zh(h, D)), u = {
          left: D.left,
          right: D.left + h.clientWidth * g,
          top: D.top,
          bottom: D.top + h.clientHeight * w
        };
      }
      let k = 0, v = 0;
      if (i == "nearest")
        e.top < u.top + s ? (v = e.top - (u.top + s), t > 0 && e.bottom > u.bottom + v && (v = e.bottom - u.bottom + s)) : e.bottom > u.bottom - s && (v = e.bottom - u.bottom + s, t < 0 && e.top - v < u.top && (v = e.top - (u.top + s)));
      else {
        let D = e.bottom - e.top, N = u.bottom - u.top;
        v = (i == "center" && D <= N ? e.top + D / 2 - N / 2 : i == "start" || i == "center" && t < 0 ? e.top - s : e.bottom - N + s) - u.top;
      }
      if (n == "nearest" ? e.left < u.left + o ? (k = e.left - (u.left + o), t > 0 && e.right > u.right + k && (k = e.right - u.right + o)) : e.right > u.right - o && (k = e.right - u.right + o, t < 0 && e.left < u.left + k && (k = e.left - (u.left + o))) : k = (n == "center" ? e.left + (e.right - e.left) / 2 - (u.right - u.left) / 2 : n == "start" == l ? e.left - o : e.right - (u.right - u.left) + o) - u.left, k || v)
        if (f)
          c.scrollBy(k, v);
        else {
          let D = 0, N = 0;
          if (v) {
            let Y = h.scrollTop;
            h.scrollTop += v / w, N = (h.scrollTop - Y) * w;
          }
          if (k) {
            let Y = h.scrollLeft;
            h.scrollLeft += k / g, D = (h.scrollLeft - Y) * g;
          }
          e = {
            left: e.left - D,
            top: e.top - N,
            right: e.right - D,
            bottom: e.bottom - N
          }, D && Math.abs(D - k) < 1 && (n = "nearest"), N && Math.abs(N - v) < 1 && (i = "nearest");
        }
      if (f)
        break;
      (e.top < u.top || e.bottom > u.bottom || e.left < u.left || e.right > u.right) && (e = {
        left: Math.max(e.left, u.left),
        right: Math.min(e.right, u.right),
        top: Math.max(e.top, u.top),
        bottom: Math.min(e.bottom, u.bottom)
      }), h = h.assignedSlot || h.parentNode;
    } else if (h.nodeType == 11)
      h = h.host;
    else
      break;
}
function Qh(r, e = !0) {
  let t = r.ownerDocument, n = null, i = null;
  for (let o = r.parentNode; o && !(o == t.body || (!e || n) && i); )
    if (o.nodeType == 1)
      !i && o.scrollHeight > o.clientHeight && (i = o), e && !n && o.scrollWidth > o.clientWidth && (n = o), o = o.assignedSlot || o.parentNode;
    else if (o.nodeType == 11)
      o = o.host;
    else
      break;
  return { x: n, y: i };
}
class j0 {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(e) {
    return this.anchorNode == e.anchorNode && this.anchorOffset == e.anchorOffset && this.focusNode == e.focusNode && this.focusOffset == e.focusOffset;
  }
  setRange(e) {
    let { anchorNode: t, focusNode: n } = e;
    this.set(t, Math.min(e.anchorOffset, t ? sn(t) : 0), n, Math.min(e.focusOffset, n ? sn(n) : 0));
  }
  set(e, t, n, i) {
    this.anchorNode = e, this.anchorOffset = t, this.focusNode = n, this.focusOffset = i;
  }
}
let Pn = null;
I.safari && I.safari_version >= 26 && (Pn = !1);
function ed(r) {
  if (r.setActive)
    return r.setActive();
  if (Pn)
    return r.focus(Pn);
  let e = [];
  for (let t = r; t && (e.push(t, t.scrollTop, t.scrollLeft), t != t.ownerDocument); t = t.parentNode)
    ;
  if (r.focus(Pn == null ? {
    get preventScroll() {
      return Pn = { preventScroll: !0 }, !0;
    }
  } : void 0), !Pn) {
    Pn = !1;
    for (let t = 0; t < e.length; ) {
      let n = e[t++], i = e[t++], o = e[t++];
      n.scrollTop != i && (n.scrollTop = i), n.scrollLeft != o && (n.scrollLeft = o);
    }
  }
}
let Fa;
function Ur(r, e, t = e) {
  let n = Fa || (Fa = document.createRange());
  return n.setEnd(r, t), n.setStart(r, e), n;
}
function sr(r, e, t, n) {
  let i = { key: e, code: e, keyCode: t, which: t, cancelable: !0 };
  n && ({ altKey: i.altKey, ctrlKey: i.ctrlKey, shiftKey: i.shiftKey, metaKey: i.metaKey } = n);
  let o = new KeyboardEvent("keydown", i);
  o.synthetic = !0, r.dispatchEvent(o);
  let s = new KeyboardEvent("keyup", i);
  return s.synthetic = !0, r.dispatchEvent(s), o.defaultPrevented || s.defaultPrevented;
}
function K0(r) {
  for (; r; ) {
    if (r && (r.nodeType == 9 || r.nodeType == 11 && r.host))
      return r;
    r = r.assignedSlot || r.parentNode;
  }
  return null;
}
function U0(r, e) {
  let t = e.focusNode, n = e.focusOffset;
  if (!t || e.anchorNode != t || e.anchorOffset != n)
    return !1;
  for (n = Math.min(n, sn(t)); ; )
    if (n) {
      if (t.nodeType != 1)
        return !1;
      let i = t.childNodes[n - 1];
      i.contentEditable == "false" ? n-- : (t = i, n = sn(t));
    } else {
      if (t == r)
        return !0;
      n = bn(t), t = t.parentNode;
    }
}
function td(r) {
  return r instanceof Window ? r.pageYOffset > Math.max(0, r.document.documentElement.scrollHeight - r.innerHeight - 4) : r.scrollTop > Math.max(1, r.scrollHeight - r.clientHeight - 4);
}
function nd(r, e) {
  for (let t = r, n = e; ; ) {
    if (t.nodeType == 3 && n > 0)
      return { node: t, offset: n };
    if (t.nodeType == 1 && n > 0) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[n - 1], n = sn(t);
    } else if (t.parentNode && !Xi(t))
      n = bn(t), t = t.parentNode;
    else
      return null;
  }
}
function rd(r, e) {
  for (let t = r, n = e; ; ) {
    if (t.nodeType == 3 && n < t.nodeValue.length)
      return { node: t, offset: n };
    if (t.nodeType == 1 && n < t.childNodes.length) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[n], n = 0;
    } else if (t.parentNode && !Xi(t))
      n = bn(t) + 1, t = t.parentNode;
    else
      return null;
  }
}
class Lt {
  constructor(e, t, n = !0) {
    this.node = e, this.offset = t, this.precise = n;
  }
  static before(e, t) {
    return new Lt(e.parentNode, bn(e), t);
  }
  static after(e, t) {
    return new Lt(e.parentNode, bn(e) + 1, t);
  }
}
var Ee = /* @__PURE__ */ function(r) {
  return r[r.LTR = 0] = "LTR", r[r.RTL = 1] = "RTL", r;
}(Ee || (Ee = {}));
const _n = Ee.LTR, ml = Ee.RTL;
function id(r) {
  let e = [];
  for (let t = 0; t < r.length; t++)
    e.push(1 << +r[t]);
  return e;
}
const q0 = /* @__PURE__ */ id("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), Y0 = /* @__PURE__ */ id("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), Ns = /* @__PURE__ */ Object.create(null), Ft = [];
for (let r of ["()", "[]", "{}"]) {
  let e = /* @__PURE__ */ r.charCodeAt(0), t = /* @__PURE__ */ r.charCodeAt(1);
  Ns[e] = t, Ns[t] = -e;
}
function od(r) {
  return r <= 247 ? q0[r] : 1424 <= r && r <= 1524 ? 2 : 1536 <= r && r <= 1785 ? Y0[r - 1536] : 1774 <= r && r <= 2220 ? 4 : 8192 <= r && r <= 8204 ? 256 : 64336 <= r && r <= 65023 ? 4 : 1;
}
const G0 = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class Kt {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? ml : _n;
  }
  /**
  @internal
  */
  constructor(e, t, n) {
    this.from = e, this.to = t, this.level = n;
  }
  /**
  @internal
  */
  side(e, t) {
    return this.dir == t == e ? this.to : this.from;
  }
  /**
  @internal
  */
  forward(e, t) {
    return e == (this.dir == t);
  }
  /**
  @internal
  */
  static find(e, t, n, i) {
    let o = -1;
    for (let s = 0; s < e.length; s++) {
      let l = e[s];
      if (l.from <= t && l.to >= t) {
        if (l.level == n)
          return s;
        (o < 0 || (i != 0 ? i < 0 ? l.from < t : l.to > t : e[o].level > l.level)) && (o = s);
      }
    }
    if (o < 0)
      throw new RangeError("Index out of range");
    return o;
  }
}
function sd(r, e) {
  if (r.length != e.length)
    return !1;
  for (let t = 0; t < r.length; t++) {
    let n = r[t], i = e[t];
    if (n.from != i.from || n.to != i.to || n.direction != i.direction || !sd(n.inner, i.inner))
      return !1;
  }
  return !0;
}
const ue = [];
function J0(r, e, t, n, i) {
  for (let o = 0; o <= n.length; o++) {
    let s = o ? n[o - 1].to : e, l = o < n.length ? n[o].from : t, a = o ? 256 : i;
    for (let c = s, h = a, d = a; c < l; c++) {
      let u = od(r.charCodeAt(c));
      u == 512 ? u = h : u == 8 && d == 4 && (u = 16), ue[c] = u == 4 ? 2 : u, u & 7 && (d = u), h = u;
    }
    for (let c = s, h = a, d = a; c < l; c++) {
      let u = ue[c];
      if (u == 128)
        c < l - 1 && h == ue[c + 1] && h & 24 ? u = ue[c] = h : ue[c] = 256;
      else if (u == 64) {
        let f = c + 1;
        for (; f < l && ue[f] == 64; )
          f++;
        let g = c && h == 8 || f < t && ue[f] == 8 ? d == 1 ? 1 : 8 : 256;
        for (let w = c; w < f; w++)
          ue[w] = g;
        c = f - 1;
      } else u == 8 && d == 1 && (ue[c] = 1);
      h = u, u & 7 && (d = u);
    }
  }
}
function X0(r, e, t, n, i) {
  let o = i == 1 ? 2 : 1;
  for (let s = 0, l = 0, a = 0; s <= n.length; s++) {
    let c = s ? n[s - 1].to : e, h = s < n.length ? n[s].from : t;
    for (let d = c, u, f, g; d < h; d++)
      if (f = Ns[u = r.charCodeAt(d)])
        if (f < 0) {
          for (let w = l - 3; w >= 0; w -= 3)
            if (Ft[w + 1] == -f) {
              let k = Ft[w + 2], v = k & 2 ? i : k & 4 ? k & 1 ? o : i : 0;
              v && (ue[d] = ue[Ft[w]] = v), l = w;
              break;
            }
        } else {
          if (Ft.length == 189)
            break;
          Ft[l++] = d, Ft[l++] = u, Ft[l++] = a;
        }
      else if ((g = ue[d]) == 2 || g == 1) {
        let w = g == i;
        a = w ? 0 : 1;
        for (let k = l - 3; k >= 0; k -= 3) {
          let v = Ft[k + 2];
          if (v & 2)
            break;
          if (w)
            Ft[k + 2] |= 2;
          else {
            if (v & 4)
              break;
            Ft[k + 2] |= 4;
          }
        }
      }
  }
}
function Z0(r, e, t, n) {
  for (let i = 0, o = n; i <= t.length; i++) {
    let s = i ? t[i - 1].to : r, l = i < t.length ? t[i].from : e;
    for (let a = s; a < l; ) {
      let c = ue[a];
      if (c == 256) {
        let h = a + 1;
        for (; ; )
          if (h == l) {
            if (i == t.length)
              break;
            h = t[i++].to, l = i < t.length ? t[i].from : e;
          } else if (ue[h] == 256)
            h++;
          else
            break;
        let d = o == 1, u = (h < e ? ue[h] : n) == 1, f = d == u ? d ? 1 : 2 : n;
        for (let g = h, w = i, k = w ? t[w - 1].to : r; g > a; )
          g == k && (g = t[--w].from, k = w ? t[w - 1].to : r), ue[--g] = f;
        a = h;
      } else
        o = c, a++;
    }
  }
}
function Bs(r, e, t, n, i, o, s) {
  let l = n % 2 ? 2 : 1;
  if (n % 2 == i % 2)
    for (let a = e, c = 0; a < t; ) {
      let h = !0, d = !1;
      if (c == o.length || a < o[c].from) {
        let w = ue[a];
        w != l && (h = !1, d = w == 16);
      }
      let u = !h && l == 1 ? [] : null, f = h ? n : n + 1, g = a;
      e: for (; ; )
        if (c < o.length && g == o[c].from) {
          if (d)
            break e;
          let w = o[c];
          if (!h)
            for (let k = w.to, v = c + 1; ; ) {
              if (k == t)
                break e;
              if (v < o.length && o[v].from == k)
                k = o[v++].to;
              else {
                if (ue[k] == l)
                  break e;
                break;
              }
            }
          if (c++, u)
            u.push(w);
          else {
            w.from > a && s.push(new Kt(a, w.from, f));
            let k = w.direction == _n != !(f % 2);
            Is(r, k ? n + 1 : n, i, w.inner, w.from, w.to, s), a = w.to;
          }
          g = w.to;
        } else {
          if (g == t || (h ? ue[g] != l : ue[g] == l))
            break;
          g++;
        }
      u ? Bs(r, a, g, n + 1, i, u, s) : a < g && s.push(new Kt(a, g, f)), a = g;
    }
  else
    for (let a = t, c = o.length; a > e; ) {
      let h = !0, d = !1;
      if (!c || a > o[c - 1].to) {
        let w = ue[a - 1];
        w != l && (h = !1, d = w == 16);
      }
      let u = !h && l == 1 ? [] : null, f = h ? n : n + 1, g = a;
      e: for (; ; )
        if (c && g == o[c - 1].to) {
          if (d)
            break e;
          let w = o[--c];
          if (!h)
            for (let k = w.from, v = c; ; ) {
              if (k == e)
                break e;
              if (v && o[v - 1].to == k)
                k = o[--v].from;
              else {
                if (ue[k - 1] == l)
                  break e;
                break;
              }
            }
          if (u)
            u.push(w);
          else {
            w.to < a && s.push(new Kt(w.to, a, f));
            let k = w.direction == _n != !(f % 2);
            Is(r, k ? n + 1 : n, i, w.inner, w.from, w.to, s), a = w.from;
          }
          g = w.from;
        } else {
          if (g == e || (h ? ue[g - 1] != l : ue[g - 1] == l))
            break;
          g--;
        }
      u ? Bs(r, g, a, n + 1, i, u, s) : g < a && s.push(new Kt(g, a, f)), a = g;
    }
}
function Is(r, e, t, n, i, o, s) {
  let l = e % 2 ? 2 : 1;
  J0(r, i, o, n, l), X0(r, i, o, n, l), Z0(i, o, n, l), Bs(r, i, o, e, t, n, s);
}
function Q0(r, e, t) {
  if (!r)
    return [new Kt(0, 0, e == ml ? 1 : 0)];
  if (e == _n && !t.length && !G0.test(r))
    return ld(r.length);
  if (t.length)
    for (; r.length > ue.length; )
      ue[ue.length] = 256;
  let n = [], i = e == _n ? 0 : 1;
  return Is(r, i, i, t, 0, r.length, n), n;
}
function ld(r) {
  return [new Kt(0, r, 0)];
}
let ad = "";
function ey(r, e, t, n, i) {
  var o;
  let s = n.head - r.from, l = Kt.find(e, s, (o = n.bidiLevel) !== null && o !== void 0 ? o : -1, n.assoc), a = e[l], c = a.side(i, t);
  if (s == c) {
    let u = l += i ? 1 : -1;
    if (u < 0 || u >= e.length)
      return null;
    a = e[l = u], s = a.side(!i, t), c = a.side(i, t);
  }
  let h = je(r.text, s, a.forward(i, t));
  (h < a.from || h > a.to) && (h = c), ad = r.text.slice(Math.min(s, h), Math.max(s, h));
  let d = l == (i ? e.length - 1 : 0) ? null : e[l + (i ? 1 : -1)];
  return d && h == c && d.level + (i ? 0 : 1) < a.level ? E.cursor(d.side(!i, t) + r.from, d.forward(i, t) ? 1 : -1, d.level) : E.cursor(h + r.from, a.forward(i, t) ? -1 : 1, a.level);
}
function ty(r, e, t) {
  for (let n = e; n < t; n++) {
    let i = od(r.charCodeAt(n));
    if (i == 1)
      return _n;
    if (i == 2 || i == 4)
      return ml;
  }
  return _n;
}
const cd = /* @__PURE__ */ H.define(), hd = /* @__PURE__ */ H.define(), dd = /* @__PURE__ */ H.define(), ud = /* @__PURE__ */ H.define(), Ps = /* @__PURE__ */ H.define(), fd = /* @__PURE__ */ H.define(), pd = /* @__PURE__ */ H.define(), gl = /* @__PURE__ */ H.define(), yl = /* @__PURE__ */ H.define(), md = /* @__PURE__ */ H.define({
  combine: (r) => r.some((e) => e)
}), ny = /* @__PURE__ */ H.define({
  combine: (r) => r.some((e) => e)
}), gd = /* @__PURE__ */ H.define();
class lr {
  constructor(e, t, n, i, o, s = !1) {
    this.range = e, this.y = t, this.x = n, this.yMargin = i, this.xMargin = o, this.isSnapshot = s;
  }
  map(e) {
    return e.empty ? this : new lr(this.range.map(e), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(e) {
    return this.range.to <= e.doc.length ? this : new lr(E.cursor(e.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
}
const bi = /* @__PURE__ */ xe.define({ map: (r, e) => r.map(e) }), yd = /* @__PURE__ */ xe.define();
function Ut(r, e, t) {
  let n = r.facet(ud);
  n.length ? n[0](e) : window.onerror && window.onerror(String(e), t, void 0, void 0, e) || (t ? console.error(t + ":", e) : console.error(e));
}
const en = /* @__PURE__ */ H.define({ combine: (r) => r.length ? r[0] : !0 });
let ry = 0;
const tr = /* @__PURE__ */ H.define({
  combine(r) {
    return r.filter((e, t) => {
      for (let n = 0; n < t; n++)
        if (r[n].plugin == e.plugin)
          return !1;
      return !0;
    });
  }
});
class bt {
  constructor(e, t, n, i, o) {
    this.id = e, this.create = t, this.domEventHandlers = n, this.domEventObservers = i, this.baseExtensions = o(this), this.extension = this.baseExtensions.concat(tr.of({ plugin: this, arg: void 0 }));
  }
  /**
  Create an extension for this plugin with the given argument.
  */
  of(e) {
    return this.baseExtensions.concat(tr.of({ plugin: this, arg: e }));
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(e, t) {
    const { eventHandlers: n, eventObservers: i, provide: o, decorations: s } = t || {};
    return new bt(ry++, e, n, i, (l) => {
      let a = [];
      return s && a.push(go.of((c) => {
        let h = c.plugin(l);
        return h ? s(h) : te.none;
      })), o && a.push(o(l)), a;
    });
  }
  /**
  Create a plugin for a class whose constructor takes a single
  editor view as argument.
  */
  static fromClass(e, t) {
    return bt.define((n, i) => new e(n, i), t);
  }
}
class $o {
  constructor(e) {
    this.spec = e, this.mustUpdate = null, this.value = null;
  }
  get plugin() {
    return this.spec && this.spec.plugin;
  }
  update(e) {
    if (this.value) {
      if (this.mustUpdate) {
        let t = this.mustUpdate;
        if (this.mustUpdate = null, this.value.update)
          try {
            this.value.update(t);
          } catch (n) {
            if (Ut(t.state, n, "CodeMirror plugin crashed"), this.value.destroy)
              try {
                this.value.destroy();
              } catch {
              }
            this.deactivate();
          }
      }
    } else if (this.spec)
      try {
        this.value = this.spec.plugin.create(e, this.spec.arg);
      } catch (t) {
        Ut(e.state, t, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(e) {
    var t;
    if (!((t = this.value) === null || t === void 0) && t.destroy)
      try {
        this.value.destroy();
      } catch (n) {
        Ut(e.state, n, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const xd = /* @__PURE__ */ H.define(), xl = /* @__PURE__ */ H.define(), go = /* @__PURE__ */ H.define(), bd = /* @__PURE__ */ H.define(), bl = /* @__PURE__ */ H.define(), Zr = /* @__PURE__ */ H.define(), wd = /* @__PURE__ */ H.define();
function Ha(r, e) {
  let t = r.state.facet(wd);
  if (!t.length)
    return t;
  let n = t.map((o) => o instanceof Function ? o(r) : o), i = [];
  return oe.spans(n, e.from, e.to, {
    point() {
    },
    span(o, s, l, a) {
      let c = o - e.from, h = s - e.from, d = i;
      for (let u = l.length - 1; u >= 0; u--, a--) {
        let f = l[u].spec.bidiIsolate, g;
        if (f == null && (f = ty(e.text, c, h)), a > 0 && d.length && (g = d[d.length - 1]).to == c && g.direction == f)
          g.to = h, d = g.inner;
        else {
          let w = { from: c, to: h, direction: f, inner: [] };
          d.push(w), d = w.inner;
        }
      }
    }
  }), i;
}
const vd = /* @__PURE__ */ H.define();
function kd(r) {
  let e = 0, t = 0, n = 0, i = 0;
  for (let o of r.state.facet(vd)) {
    let s = o(r);
    s && (s.left != null && (e = Math.max(e, s.left)), s.right != null && (t = Math.max(t, s.right)), s.top != null && (n = Math.max(n, s.top)), s.bottom != null && (i = Math.max(i, s.bottom)));
  }
  return { left: e, right: t, top: n, bottom: i };
}
const Tr = /* @__PURE__ */ H.define();
class mt {
  constructor(e, t, n, i) {
    this.fromA = e, this.toA = t, this.fromB = n, this.toB = i;
  }
  join(e) {
    return new mt(Math.min(this.fromA, e.fromA), Math.max(this.toA, e.toA), Math.min(this.fromB, e.fromB), Math.max(this.toB, e.toB));
  }
  addToSet(e) {
    let t = e.length, n = this;
    for (; t > 0; t--) {
      let i = e[t - 1];
      if (!(i.fromA > n.toA)) {
        if (i.toA < n.fromA)
          break;
        n = n.join(i), e.splice(t - 1, 1);
      }
    }
    return e.splice(t, 0, n), e;
  }
  // Extend a set to cover all the content in `ranges`, which is a
  // flat array with each pair of numbers representing fromB/toB
  // positions. These pairs are generated in unchanged ranges, so the
  // offset between doc A and doc B is the same for their start and
  // end points.
  static extendWithRanges(e, t) {
    if (t.length == 0)
      return e;
    let n = [];
    for (let i = 0, o = 0, s = 0; ; ) {
      let l = i < e.length ? e[i].fromB : 1e9, a = o < t.length ? t[o] : 1e9, c = Math.min(l, a);
      if (c == 1e9)
        break;
      let h = c + s, d = c, u = h;
      for (; ; )
        if (o < t.length && t[o] <= d) {
          let f = t[o + 1];
          o += 2, d = Math.max(d, f);
          for (let g = i; g < e.length && e[g].fromB <= d; g++)
            s = e[g].toA - e[g].toB;
          u = Math.max(u, f + s);
        } else if (i < e.length && e[i].fromB <= d) {
          let f = e[i++];
          d = Math.max(d, f.toB), u = Math.max(u, f.toA), s = f.toA - f.toB;
        } else
          break;
      n.push(new mt(h, u, c, d));
    }
    return n;
  }
}
class Zi {
  constructor(e, t, n) {
    this.view = e, this.state = t, this.transactions = n, this.flags = 0, this.startState = e.state, this.changes = Ne.empty(this.startState.doc.length);
    for (let o of n)
      this.changes = this.changes.compose(o.changes);
    let i = [];
    this.changes.iterChangedRanges((o, s, l, a) => i.push(new mt(o, s, l, a))), this.changedRanges = i;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new Zi(e, t, n);
  }
  /**
  Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
  [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
  update.
  */
  get viewportChanged() {
    return (this.flags & 4) > 0;
  }
  /**
  Returns true when
  [`viewportChanged`](https://codemirror.net/6/docs/ref/#view.ViewUpdate.viewportChanged) is true
  and the viewport change is not just the result of mapping it in
  response to document changes.
  */
  get viewportMoved() {
    return (this.flags & 8) > 0;
  }
  /**
  Indicates whether the height of a block element in the editor
  changed in this update.
  */
  get heightChanged() {
    return (this.flags & 2) > 0;
  }
  /**
  Returns true when the document was modified or the size of the
  editor, or elements within the editor, changed.
  */
  get geometryChanged() {
    return this.docChanged || (this.flags & 18) > 0;
  }
  /**
  True when this update indicates a focus change.
  */
  get focusChanged() {
    return (this.flags & 1) > 0;
  }
  /**
  Whether the document changed in this update.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Whether the selection was explicitly set in this update.
  */
  get selectionSet() {
    return this.transactions.some((e) => e.selection);
  }
  /**
  @internal
  */
  get empty() {
    return this.flags == 0 && this.transactions.length == 0;
  }
}
const iy = [];
class Se {
  constructor(e, t, n = 0) {
    this.dom = e, this.length = t, this.flags = n, this.parent = null, e.cmTile = this;
  }
  get breakAfter() {
    return this.flags & 1;
  }
  get children() {
    return iy;
  }
  isWidget() {
    return !1;
  }
  get isHidden() {
    return !1;
  }
  isComposite() {
    return !1;
  }
  isLine() {
    return !1;
  }
  isText() {
    return !1;
  }
  isBlock() {
    return !1;
  }
  get domAttrs() {
    return null;
  }
  sync(e) {
    if (this.flags |= 2, this.flags & 4) {
      this.flags &= -5;
      let t = this.domAttrs;
      t && H0(this.dom, t);
    }
  }
  toString() {
    return this.constructor.name + (this.children.length ? `(${this.children})` : "") + (this.breakAfter ? "#" : "");
  }
  destroy() {
    this.parent = null;
  }
  setDOM(e) {
    this.dom = e, e.cmTile = this;
  }
  get posAtStart() {
    return this.parent ? this.parent.posBefore(this) : 0;
  }
  get posAtEnd() {
    return this.posAtStart + this.length;
  }
  posBefore(e, t = this.posAtStart) {
    let n = t;
    for (let i of this.children) {
      if (i == e)
        return n;
      n += i.length + i.breakAfter;
    }
    throw new RangeError("Invalid child in posBefore");
  }
  posAfter(e) {
    return this.posBefore(e) + e.length;
  }
  covers(e) {
    return !0;
  }
  coordsIn(e, t, n) {
    return null;
  }
  domPosFor(e, t) {
    let n = bn(this.dom), i = this.length ? e > 0 : t > 0;
    return new Lt(this.parent.dom, n + (i ? 1 : 0), e == 0 || e == this.length);
  }
  markDirty(e) {
    this.flags &= -3, e && (this.flags |= 4), this.parent && this.parent.flags & 2 && this.parent.markDirty(!1);
  }
  get overrideDOMText() {
    return null;
  }
  get root() {
    for (let e = this; e; e = e.parent)
      if (e instanceof xo)
        return e;
    return null;
  }
  static get(e) {
    return e.cmTile;
  }
}
class yo extends Se {
  constructor(e) {
    super(e, 0), this._children = [];
  }
  isComposite() {
    return !0;
  }
  get children() {
    return this._children;
  }
  get lastChild() {
    return this.children.length ? this.children[this.children.length - 1] : null;
  }
  append(e) {
    this.children.push(e), e.parent = this;
  }
  sync(e) {
    if (this.flags & 2)
      return;
    super.sync(e);
    let t = this.dom, n = null, i, o = (e == null ? void 0 : e.node) == t ? e : null, s = 0;
    for (let l of this.children) {
      if (l.sync(e), s += l.length + l.breakAfter, i = n ? n.nextSibling : t.firstChild, o && i != l.dom && (o.written = !0), l.dom.parentNode == t)
        for (; i && i != l.dom; )
          i = Wa(i);
      else
        t.insertBefore(l.dom, i);
      n = l.dom;
    }
    for (i = n ? n.nextSibling : t.firstChild, o && i && (o.written = !0); i; )
      i = Wa(i);
    this.length = s;
  }
}
function Wa(r) {
  let e = r.nextSibling;
  return r.parentNode.removeChild(r), e;
}
class xo extends yo {
  constructor(e, t) {
    super(t), this.view = e;
  }
  owns(e) {
    for (; e; e = e.parent)
      if (e == this)
        return !0;
    return !1;
  }
  isBlock() {
    return !0;
  }
  nearest(e) {
    for (; ; ) {
      if (!e)
        return null;
      let t = Se.get(e);
      if (t && this.owns(t))
        return t;
      e = e.parentNode;
    }
  }
  blockTiles(e) {
    for (let t = [], n = this, i = 0, o = 0; ; )
      if (i == n.children.length) {
        if (!t.length)
          return;
        n = n.parent, n.breakAfter && o++, i = t.pop();
      } else {
        let s = n.children[i++];
        if (s instanceof rn)
          t.push(i), n = s, i = 0;
        else {
          let l = o + s.length, a = e(s, o);
          if (a !== void 0)
            return a;
          o = l + s.breakAfter;
        }
      }
  }
  // Find the block at the given position. If side < -1, make sure to
  // stay before block widgets at that position, if side > 1, after
  // such widgets (used for selection drawing, which needs to be able
  // to get coordinates for positions that aren't valid cursor positions).
  resolveBlock(e, t) {
    let n, i = -1, o, s = -1;
    if (this.blockTiles((l, a) => {
      let c = a + l.length;
      if (e >= a && e <= c) {
        if (l.isWidget() && t >= -1 && t <= 1) {
          if (l.flags & 32)
            return !0;
          l.flags & 16 && (n = void 0);
        }
        (a < e || e == c && (t < -1 ? l.length : l.covers(1))) && (!n || !l.isWidget() && n.isWidget()) && (n = l, i = e - a), (c > e || e == a && (t > 1 ? l.length : l.covers(-1))) && (!o || !l.isWidget() && o.isWidget()) && (o = l, s = e - a);
      }
    }), !n && !o)
      throw new Error("No tile at position " + e);
    return n && t < 0 || !o ? { tile: n, offset: i } : { tile: o, offset: s };
  }
}
class rn extends yo {
  constructor(e, t) {
    super(e), this.wrapper = t;
  }
  isBlock() {
    return !0;
  }
  covers(e) {
    return this.children.length ? e < 0 ? this.children[0].covers(-1) : this.lastChild.covers(1) : !1;
  }
  get domAttrs() {
    return this.wrapper.attributes;
  }
  static of(e, t) {
    let n = new rn(t || document.createElement(e.tagName), e);
    return t || (n.flags |= 4), n;
  }
}
class dr extends yo {
  constructor(e, t) {
    super(e), this.attrs = t;
  }
  isLine() {
    return !0;
  }
  static start(e, t, n) {
    let i = new dr(t || document.createElement("div"), e);
    return (!t || !n) && (i.flags |= 4), i;
  }
  get domAttrs() {
    return this.attrs;
  }
  // Find the tile associated with a given position in this line.
  resolveInline(e, t, n) {
    let i = null, o = -1, s = null, l = -1;
    function a(h, d) {
      for (let u = 0, f = 0; u < h.children.length && f <= d; u++) {
        let g = h.children[u], w = f + g.length;
        w >= d && (g.isComposite() ? a(g, d - f) : (!s || s.isHidden && (t > 0 && !(s.flags & 32) || n && sy(s, g))) && (w > d || g.flags & 32) ? (s = g, l = d - f) : (f < d || g.flags & 16 && !g.isHidden) && (i = g, o = d - f)), f = w;
      }
    }
    a(this, e);
    let c = (t < 0 ? i : s) || i || s;
    return c ? { tile: c, offset: c == i ? o : l } : null;
  }
  coordsIn(e, t, n) {
    let i = this.resolveInline(e, t, !0);
    return i ? i.tile.coordsIn(Math.max(0, i.offset), t, n) : oy(this);
  }
  domIn(e, t) {
    let n = this.resolveInline(e, t);
    if (n) {
      let { tile: i, offset: o } = n;
      if (this.dom.contains(i.dom))
        return i.isText() ? new Lt(i.dom, Math.min(i.dom.nodeValue.length, o)) : i.domPosFor(o, i.flags & 16 ? 1 : i.flags & 32 ? -1 : t);
      let s = n.tile.parent, l = !1;
      for (let a of s.children) {
        if (l)
          return new Lt(a.dom, 0);
        a == n.tile && (l = !0);
      }
    }
    return new Lt(this.dom, 0);
  }
}
function oy(r) {
  let e = r.dom.lastChild;
  if (!e)
    return r.dom.getBoundingClientRect();
  let t = Nr(e);
  return t[t.length - 1] || null;
}
function sy(r, e) {
  let t = r.coordsIn(0, 1), n = e.coordsIn(0, 1);
  return t && n && n.top < t.bottom;
}
class et extends yo {
  constructor(e, t) {
    super(e), this.mark = t;
  }
  get domAttrs() {
    return this.mark.attrs;
  }
  static of(e, t) {
    let n = new et(t || document.createElement(e.tagName), e);
    return t || (n.flags |= 4), n;
  }
}
class Fn extends Se {
  constructor(e, t) {
    super(e, t.length), this.text = t;
  }
  sync(e) {
    this.flags & 2 || (super.sync(e), this.dom.nodeValue != this.text && (e && e.node == this.dom && (e.written = !0), this.dom.nodeValue = this.text));
  }
  isText() {
    return !0;
  }
  toString() {
    return JSON.stringify(this.text);
  }
  coordsIn(e, t, n) {
    let i = this.dom.nodeValue.length;
    e > i && (e = i);
    let o = e, s = e, l = 0;
    e == 0 && t < 0 || e == i && t >= 0 ? I.chrome || I.gecko || (e ? (o--, l = 1) : s < i && (s++, l = -1)) : t < 0 ? o-- : s < i && s++;
    let a = Ur(this.dom, o, s).getClientRects();
    if (!a.length)
      return null;
    let c = a[(l ? l < 0 : t >= 0) ? 0 : a.length - 1];
    return I.safari && !l && c.width == 0 && (c = Array.prototype.find.call(a, (h) => h.width) || c), n == null ? c : Kr(c, (l ? l > 0 : t < 0) == n);
  }
  static of(e, t) {
    let n = new Fn(t || document.createTextNode(e), e);
    return t || (n.flags |= 2), n;
  }
}
class jn extends Se {
  constructor(e, t, n, i) {
    super(e, t, i), this.widget = n;
  }
  isWidget() {
    return !0;
  }
  get isHidden() {
    return this.widget.isHidden;
  }
  covers(e) {
    return this.flags & 48 ? !1 : (this.flags & (e < 0 ? 64 : 128)) > 0;
  }
  coordsIn(e, t) {
    return this.coordsInWidget(e, t, !1);
  }
  coordsInWidget(e, t, n) {
    let i = this.widget.coordsAt(this.dom, e, t);
    if (i)
      return i;
    if (n)
      return Kr(this.dom.getBoundingClientRect(), this.length ? e == 0 : t <= 0);
    {
      let o = this.dom.getClientRects(), s = null;
      if (!o.length)
        return null;
      let l = this.flags & 16 ? !0 : this.flags & 32 ? !1 : e > 0;
      for (let a = l ? o.length - 1 : 0; s = o[a], !(e > 0 ? a == 0 : a == o.length - 1 || s.top < s.bottom); a += l ? -1 : 1)
        ;
      return Kr(s, !l);
    }
  }
  get overrideDOMText() {
    if (!this.length)
      return se.empty;
    let { root: e } = this;
    if (!e)
      return se.empty;
    let t = this.posAtStart;
    return e.view.state.doc.slice(t, t + this.length);
  }
  destroy() {
    super.destroy(), this.widget.destroy(this.dom);
  }
  static of(e, t, n, i, o) {
    return o || (o = e.toDOM(t), e.editable || (o.contentEditable = "false")), new jn(o, n, e, i);
  }
}
class Qi extends Se {
  constructor(e) {
    let t = document.createElement("img");
    t.className = "cm-widgetBuffer", t.setAttribute("aria-hidden", "true"), super(t, 0, e);
  }
  get isHidden() {
    return !0;
  }
  get overrideDOMText() {
    return se.empty;
  }
  coordsIn(e, t, n) {
    let i = this.dom.getBoundingClientRect();
    return n == null ? i : Kr(i, t > 0 == n);
  }
}
class ly {
  constructor(e) {
    this.index = 0, this.beforeBreak = !1, this.parents = [], this.tile = e;
  }
  // Advance by the given distance. If side is -1, stop leaving or
  // entering tiles, or skipping zero-length tiles, once the distance
  // has been traversed. When side is 1, leave, enter, or skip
  // everything at the end position.
  advance(e, t, n) {
    let { tile: i, index: o, beforeBreak: s, parents: l } = this;
    for (; e || t > 0; )
      if (i.isComposite())
        if (s) {
          if (!e)
            break;
          n && n.break(), e--, s = !1;
        } else if (o == i.children.length) {
          if (!e && !l.length)
            break;
          n && n.leave(i), s = !!i.breakAfter, { tile: i, index: o } = l.pop(), o++;
        } else {
          let a = i.children[o], c = a.breakAfter;
          (t > 0 ? a.length <= e : a.length < e) && (!n || n.skip(a, 0, a.length) !== !1 || !a.isComposite) ? (s = !!c, o++, e -= a.length) : (l.push({ tile: i, index: o }), i = a, o = 0, n && a.isComposite() && n.enter(a));
        }
      else if (o == i.length)
        s = !!i.breakAfter, { tile: i, index: o } = l.pop(), o++;
      else if (e) {
        let a = Math.min(e, i.length - o);
        n && n.skip(i, o, o + a), e -= a, o += a;
      } else
        break;
    return this.tile = i, this.index = o, this.beforeBreak = s, this;
  }
  get root() {
    return this.parents.length ? this.parents[0].tile : this.tile;
  }
}
class ay {
  constructor(e, t, n, i) {
    this.from = e, this.to = t, this.wrapper = n, this.rank = i;
  }
}
class cy {
  constructor(e, t, n) {
    this.cache = e, this.root = t, this.blockWrappers = n, this.curLine = null, this.lastBlock = null, this.afterWidget = null, this.pos = 0, this.wrappers = [], this.wrapperPos = 0;
  }
  addText(e, t, n, i) {
    var o;
    this.flushBuffer();
    let s = this.ensureMarks(t, n), l = s.lastChild;
    if (l && l.isText() && !(l.flags & 8) && l.length + e.length < 512) {
      this.cache.reused.set(
        l,
        2
        /* Reused.DOM */
      );
      let a = s.children[s.children.length - 1] = new Fn(l.dom, l.text + e);
      a.parent = s;
    } else
      s.append(i || Fn.of(e, (o = this.cache.find(Fn)) === null || o === void 0 ? void 0 : o.dom));
    this.pos += e.length, this.afterWidget = null;
  }
  addComposition(e, t) {
    let n = this.curLine;
    n.dom != t.line.dom && (n.setDOM(this.cache.reused.has(t.line) ? Fo(t.line.dom) : t.line.dom), this.cache.reused.set(
      t.line,
      2
      /* Reused.DOM */
    ));
    let i = n;
    for (let l = t.marks.length - 1; l >= 0; l--) {
      let a = t.marks[l], c = i.lastChild;
      if (c instanceof et && c.mark.eq(a.mark))
        c.dom != a.dom && c.setDOM(Fo(a.dom)), i = c;
      else {
        if (this.cache.reused.get(a)) {
          let d = Se.get(a.dom);
          d && d.setDOM(Fo(a.dom));
        }
        let h = et.of(a.mark, a.dom);
        i.append(h), i = h;
      }
      this.cache.reused.set(
        a,
        2
        /* Reused.DOM */
      );
    }
    let o = Se.get(e.text);
    o && this.cache.reused.set(
      o,
      2
      /* Reused.DOM */
    );
    let s = new Fn(e.text, e.text.nodeValue);
    s.flags |= 8, this.pos = e.range.toB, i.append(s);
  }
  addInlineWidget(e, t, n) {
    let i = this.afterWidget && e.flags & 48 && (this.afterWidget.flags & 48) == (e.flags & 48);
    i || this.flushBuffer();
    let o = this.ensureMarks(t, n);
    !i && !(e.flags & 16) && o.append(this.getBuffer(1)), o.append(e), this.pos += e.length, this.afterWidget = e;
  }
  addMark(e, t, n) {
    this.flushBuffer(), this.ensureMarks(t, n).append(e), this.pos += e.length, this.afterWidget = null;
  }
  addBlockWidget(e) {
    this.getBlockPos().append(e), this.pos += e.length, this.lastBlock = e, this.endLine();
  }
  continueWidget(e) {
    let t = this.afterWidget || this.lastBlock;
    t.length += e, this.pos += e;
  }
  addLineStart(e, t) {
    var n;
    e || (e = Sd);
    let i = dr.start(e, t || ((n = this.cache.find(dr)) === null || n === void 0 ? void 0 : n.dom), !!t);
    this.getBlockPos().append(this.lastBlock = this.curLine = i);
  }
  addLine(e) {
    this.getBlockPos().append(e), this.pos += e.length, this.lastBlock = e, this.endLine();
  }
  addBreak() {
    this.lastBlock.flags |= 1, this.endLine(), this.pos++;
  }
  addLineStartIfNotCovered(e) {
    this.blockPosCovered() || this.addLineStart(e);
  }
  ensureLine(e) {
    this.curLine || this.addLineStart(e);
  }
  ensureMarks(e, t) {
    var n;
    let i = this.curLine;
    for (let o = e.length - 1; o >= 0; o--) {
      let s = e[o], l;
      if (t > 0 && (l = i.lastChild) && l instanceof et && l.mark.eq(s))
        i = l, t--;
      else {
        let a = et.of(s, (n = this.cache.find(et, (c) => c.mark.eq(s))) === null || n === void 0 ? void 0 : n.dom);
        i.append(a), i = a, t = 0;
      }
    }
    return i;
  }
  endLine() {
    if (this.curLine) {
      this.flushBuffer();
      let e = this.curLine.lastChild;
      (!e || !za(this.curLine, !1) || e.dom.nodeName != "BR" && e.isWidget() && !(I.ios && za(this.curLine, !0))) && this.curLine.append(this.cache.findWidget(
        Ho,
        0,
        32
        /* TileFlag.After */
      ) || new jn(
        Ho.toDOM(),
        0,
        Ho,
        32
        /* TileFlag.After */
      )), this.curLine = this.afterWidget = null;
    }
  }
  updateBlockWrappers() {
    this.wrapperPos > this.pos + 1e4 && (this.blockWrappers.goto(this.pos), this.wrappers.length = 0);
    for (let e = this.wrappers.length - 1; e >= 0; e--)
      this.wrappers[e].to < this.pos && this.wrappers.splice(e, 1);
    for (let e = this.blockWrappers; e.value && e.from <= this.pos; e.next())
      if (e.to >= this.pos) {
        let t = e.rank * 102 + e.value.rank, n = new ay(e.from, e.to, e.value, t), i = this.wrappers.length;
        for (; i > 0 && (this.wrappers[i - 1].rank - n.rank || this.wrappers[i - 1].to - n.to) < 0; )
          i--;
        this.wrappers.splice(i, 0, n);
      }
    this.wrapperPos = this.pos;
  }
  getBlockPos() {
    var e;
    this.updateBlockWrappers();
    let t = this.root;
    for (let n of this.wrappers) {
      let i = t.lastChild;
      if (n.from < this.pos && i instanceof rn && i.wrapper.eq(n.wrapper))
        t = i;
      else {
        let o = rn.of(n.wrapper, (e = this.cache.find(rn, (s) => s.wrapper.eq(n.wrapper))) === null || e === void 0 ? void 0 : e.dom);
        t.append(o), t = o;
      }
    }
    return t;
  }
  blockPosCovered() {
    let e = this.lastBlock;
    return e != null && !e.breakAfter && (!e.isWidget() || (e.flags & 160) > 0);
  }
  getBuffer(e) {
    let t = 2 | (e < 0 ? 16 : 32), n = this.cache.find(
      Qi,
      void 0,
      1
      /* Reused.Full */
    );
    return n && (n.flags = t), n || new Qi(t);
  }
  flushBuffer() {
    this.afterWidget && !(this.afterWidget.flags & 32) && (this.afterWidget.parent.append(this.getBuffer(-1)), this.afterWidget = null);
  }
}
class hy {
  constructor(e) {
    this.skipCount = 0, this.text = "", this.textOff = 0, this.cursor = e.iter();
  }
  skip(e) {
    this.textOff + e <= this.text.length ? this.textOff += e : (this.skipCount += e - (this.text.length - this.textOff), this.text = "", this.textOff = 0);
  }
  next(e) {
    if (this.textOff == this.text.length) {
      let { value: i, lineBreak: o, done: s } = this.cursor.next(this.skipCount);
      if (this.skipCount = 0, s)
        throw new Error("Ran out of text content when drawing inline views");
      this.text = i;
      let l = this.textOff = Math.min(e, i.length);
      return o ? null : i.slice(0, l);
    }
    let t = Math.min(this.text.length, this.textOff + e), n = this.text.slice(this.textOff, t);
    return this.textOff = t, n;
  }
}
const eo = [jn, dr, Fn, et, Qi, rn, xo];
for (let r = 0; r < eo.length; r++)
  eo[r].bucket = r;
class dy {
  constructor(e) {
    this.view = e, this.buckets = eo.map(() => []), this.index = eo.map(() => 0), this.reused = /* @__PURE__ */ new Map();
  }
  // Put a tile in the cache.
  add(e) {
    let t = e.constructor.bucket, n = this.buckets[t];
    n.length < 6 ? n.push(e) : n[
      this.index[t] = (this.index[t] + 1) % 6
      /* C.Bucket */
    ] = e;
  }
  find(e, t, n = 2) {
    let i = e.bucket, o = this.buckets[i], s = this.index[i];
    for (let l = 0; l < o.length; l++) {
      let a = (l + s) % o.length, c = o[a];
      if ((!t || t(c)) && !this.reused.has(c))
        return o.splice(a, 1), a < s && this.index[i]--, this.reused.set(c, n), c;
    }
    return null;
  }
  findWidget(e, t, n) {
    let i = this.buckets[0];
    if (i.length)
      for (let o = 0, s = 0; ; o++) {
        if (o == i.length) {
          if (s)
            return null;
          s = 1, o = 0;
        }
        let l = i[o];
        if (!this.reused.has(l) && (s == 0 ? l.widget.compare(e) : l.widget.constructor == e.constructor && e.updateDOM(l.dom, this.view, l.widget)))
          return i.splice(o, 1), o < this.index[0] && this.index[0]--, l.widget == e && l.length == t && (l.flags & 497) == n ? (this.reused.set(
            l,
            1
            /* Reused.Full */
          ), l) : (this.reused.set(
            l,
            2
            /* Reused.DOM */
          ), new jn(l.dom, t, e, l.flags & -498 | n));
      }
  }
  reuse(e) {
    return this.reused.set(
      e,
      1
      /* Reused.Full */
    ), e;
  }
  maybeReuse(e, t = 2) {
    if (!this.reused.has(e))
      return this.reused.set(e, t), e.dom;
  }
  clear() {
    for (let e = 0; e < this.buckets.length; e++)
      this.buckets[e].length = this.index[e] = 0;
  }
}
class uy {
  constructor(e, t, n, i, o) {
    this.view = e, this.decorations = i, this.disallowBlockEffectsFor = o, this.openWidget = !1, this.openMarks = 0, this.cache = new dy(e), this.text = new hy(e.state.doc), this.builder = new cy(this.cache, new xo(e, e.contentDOM), oe.iter(n)), this.cache.reused.set(
      t,
      2
      /* Reused.DOM */
    ), this.old = new ly(t), this.reuseWalker = {
      skip: (s, l, a) => {
        if (this.cache.add(s), s.isComposite())
          return !1;
      },
      enter: (s) => this.cache.add(s),
      leave: () => {
      },
      break: () => {
      }
    };
  }
  run(e, t) {
    let n = t && this.getCompositionContext(t.text);
    for (let i = 0, o = 0, s = 0; ; ) {
      let l = s < e.length ? e[s++] : null, a = l ? l.fromA : this.old.root.length;
      if (a > i) {
        let c = a - i;
        this.preserve(c, !s, !l), i = a, o += c;
      }
      if (!l)
        break;
      t && l.fromA <= t.range.fromA && l.toA >= t.range.toA ? (this.forward(l.fromA, t.range.fromA, t.range.fromA < t.range.toA ? 1 : -1), this.emit(o, t.range.fromB), this.builder.flushBuffer(), this.cache.clear(), this.builder.addComposition(t, n), this.text.skip(t.range.toB - t.range.fromB), this.forward(t.range.fromA, l.toA), this.emit(t.range.toB, l.toB)) : (this.forward(l.fromA, l.toA), this.emit(o, l.toB)), o = l.toB, i = l.toA;
    }
    return this.builder.curLine && this.builder.endLine(), this.builder.root;
  }
  preserve(e, t, n) {
    let i = my(this.old), o = this.openMarks;
    this.old.advance(e, n ? 1 : -1, {
      skip: (s, l, a) => {
        if (s.isWidget())
          if (this.openWidget)
            this.builder.continueWidget(a - l);
          else {
            let c = a > 0 || l < s.length ? jn.of(s.widget, this.view, a - l, s.flags & 496, this.cache.maybeReuse(s)) : this.cache.reuse(s);
            c.flags & 256 ? (c.flags &= -2, this.builder.addBlockWidget(c)) : (this.builder.ensureLine(null), this.builder.addInlineWidget(c, i, o), o = i.length);
          }
        else if (s.isText())
          this.builder.ensureLine(null), !l && a == s.length && !this.cache.reused.has(s) ? this.builder.addText(s.text, i, o, this.cache.reuse(s)) : (this.cache.add(s), this.builder.addText(s.text.slice(l, a), i, o)), o = i.length;
        else if (s.isLine())
          s.flags &= -2, this.cache.reused.set(
            s,
            1
            /* Reused.Full */
          ), this.builder.addLine(s);
        else if (s instanceof Qi)
          this.cache.add(s);
        else if (s instanceof et)
          this.builder.ensureLine(null), this.builder.addMark(s, i, o), this.cache.reused.set(
            s,
            1
            /* Reused.Full */
          ), o = i.length;
        else
          return !1;
        this.openWidget = !1;
      },
      enter: (s) => {
        s.isLine() ? this.builder.addLineStart(s.attrs, this.cache.maybeReuse(s)) : (this.cache.add(s), s instanceof et && i.unshift(s.mark)), this.openWidget = !1;
      },
      leave: (s) => {
        s.isLine() ? i.length && (i.length = o = 0) : s instanceof et && (i.shift(), o = Math.min(o, i.length));
      },
      break: () => {
        this.builder.addBreak(), this.openWidget = !1;
      }
    }), this.text.skip(e);
  }
  emit(e, t) {
    let n = null, i = this.builder, o = -1, s = oe.spans(this.decorations, e, t, {
      point: (l, a, c, h, d, u) => {
        if (c instanceof Vn) {
          if (this.disallowBlockEffectsFor[u]) {
            if (c.block)
              throw new RangeError("Block decorations may not be specified via plugins");
            if (a > this.view.state.doc.lineAt(l).to)
              throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
          }
          if (o = h.length, d > h.length)
            i.continueWidget(a - l);
          else {
            let f = c.widget || (c.block ? ur.block : ur.inline), g = fy(c), w = this.cache.findWidget(f, a - l, g) || jn.of(f, this.view, a - l, g);
            c.block ? (c.startSide > 0 && i.addLineStartIfNotCovered(n), i.addBlockWidget(w)) : (i.ensureLine(n), i.addInlineWidget(w, h, d));
          }
          n = null;
        } else
          n = py(n, c);
        a > l && this.text.skip(a - l);
      },
      span: (l, a, c, h) => {
        for (let d = l; d < a; ) {
          let u = this.text.next(Math.min(512, a - d));
          u == null ? (i.addLineStartIfNotCovered(n), i.addBreak(), d++) : (i.ensureLine(n), i.addText(u, c, d == l ? h : c.length), d += u.length), n = null;
        }
        o = c.length;
      }
    });
    o > -1 && (this.openWidget = s > o), this.openWidget || i.addLineStartIfNotCovered(n), this.openMarks = s;
  }
  forward(e, t, n = 1) {
    t - e <= 10 ? this.old.advance(t - e, n, this.reuseWalker) : (this.old.advance(5, -1, this.reuseWalker), this.old.advance(t - e - 10, -1), this.old.advance(5, n, this.reuseWalker));
  }
  getCompositionContext(e) {
    let t = [], n = null;
    for (let i = e.parentNode; ; i = i.parentNode) {
      let o = Se.get(i);
      if (i == this.view.contentDOM)
        break;
      o instanceof et ? t.push(o) : o != null && o.isLine() ? n = o : o instanceof rn || (i.nodeName == "DIV" && !n && i != this.view.contentDOM ? n = new dr(i, Sd) : n || t.push(et.of(new Jr({ tagName: i.nodeName.toLowerCase(), attributes: W0(i) }), i)));
    }
    return { line: n, marks: t };
  }
}
function za(r, e) {
  let t = (n) => {
    for (let i of n.children)
      if ((e ? i.isText() : i.length) || t(i))
        return !0;
    return !1;
  };
  return t(r);
}
function fy(r) {
  let e = r.isReplace ? (r.startSide < 0 ? 64 : 0) | (r.endSide > 0 ? 128 : 0) : r.startSide > 0 ? 32 : 16;
  return r.block && (e |= 256), e;
}
const Sd = { class: "cm-line" };
function py(r, e) {
  let t = e.spec.attributes, n = e.spec.class;
  return !t && !n || (r || (r = { class: "cm-line" }), t && fl(t, r), n && (r.class += " " + n)), r;
}
function my(r) {
  let e = [];
  for (let t = r.parents.length; t > 1; t--) {
    let n = t == r.parents.length ? r.tile : r.parents[t].tile;
    n instanceof et && e.push(n.mark);
  }
  return e;
}
function Fo(r) {
  let e = Se.get(r);
  return e && e.setDOM(r.cloneNode()), r;
}
class ur extends qn {
  constructor(e) {
    super(), this.tag = e;
  }
  eq(e) {
    return e.tag == this.tag;
  }
  toDOM() {
    return document.createElement(this.tag);
  }
  updateDOM(e) {
    return e.nodeName.toLowerCase() == this.tag;
  }
  get isHidden() {
    return !0;
  }
}
ur.inline = /* @__PURE__ */ new ur("span");
ur.block = /* @__PURE__ */ new ur("div");
const Ho = /* @__PURE__ */ new class extends qn {
  toDOM() {
    return document.createElement("br");
  }
  get isHidden() {
    return !0;
  }
  get editable() {
    return !0;
  }
}();
class Va {
  constructor(e) {
    this.view = e, this.decorations = [], this.blockWrappers = [], this.dynamicDecorationMap = [!1], this.domChanged = null, this.hasComposition = null, this.editContextFormatting = te.none, this.lastCompositionAfterCursor = !1, this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.updateDeco(), this.tile = new xo(e, e.contentDOM), this.updateInner([new mt(0, 0, 0, e.state.doc.length)], null);
  }
  // Update the document view to a given state.
  update(e) {
    var t;
    let n = e.changedRanges;
    this.minWidth > 0 && n.length && (n.every(({ fromA: h, toA: d }) => d < this.minWidthFrom || h > this.minWidthTo) ? (this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.updateEditContextFormatting(e);
    let i = -1;
    this.view.inputState.composing >= 0 && !this.view.observer.editContext && (!((t = this.domChanged) === null || t === void 0) && t.newSel ? i = this.domChanged.newSel.head : !Cy(e.changes, this.hasComposition) && !e.selectionSet && (i = e.state.selection.main.head));
    let o = i > -1 ? yy(this.view, e.changes, i) : null;
    if (this.domChanged = null, this.hasComposition) {
      let { from: h, to: d } = this.hasComposition;
      n = new mt(h, d, e.changes.mapPos(h, -1), e.changes.mapPos(d, 1)).addToSet(n.slice());
    }
    this.hasComposition = o ? { from: o.range.fromB, to: o.range.toB } : null, (I.ie || I.chrome) && !o && e && e.state.doc.lines != e.startState.doc.lines && (this.forceSelection = !0);
    let s = this.decorations, l = this.blockWrappers;
    this.updateDeco();
    let a = wy(s, this.decorations, e.changes);
    a.length && (n = mt.extendWithRanges(n, a));
    let c = ky(l, this.blockWrappers, e.changes);
    return c.length && (n = mt.extendWithRanges(n, c)), o && !n.some((h) => h.fromA <= o.range.fromA && h.toA >= o.range.toA) && (n = o.range.addToSet(n.slice())), this.tile.flags & 2 && n.length == 0 ? !1 : (this.updateInner(n, o), e.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(e, t) {
    this.view.viewState.mustMeasureContent = !0;
    let { observer: n } = this.view;
    n.ignore(() => {
      if (t || e.length) {
        let s = this.tile, l = new uy(this.view, s, this.blockWrappers, this.decorations, this.dynamicDecorationMap);
        t && Se.get(t.text) && l.cache.reused.set(
          Se.get(t.text),
          2
          /* Reused.DOM */
        ), this.tile = l.run(e, t), $s(s, l.cache.reused);
      }
      this.tile.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px", this.tile.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let o = I.chrome || I.ios ? { node: n.selectionRange.focusNode, written: !1 } : void 0;
      this.tile.sync(o), o && (o.written || n.selectionRange.focusNode != o.node || !this.tile.dom.contains(o.node)) && (this.forceSelection = !0), this.tile.dom.style.height = "";
    });
    let i = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let o of this.tile.children)
        o.isWidget() && o.widget instanceof Wo && i.push(o.dom);
    n.updateGaps(i);
  }
  updateEditContextFormatting(e) {
    this.editContextFormatting = this.editContextFormatting.map(e.changes);
    for (let t of e.transactions)
      for (let n of t.effects)
        n.is(yd) && (this.editContextFormatting = n.value);
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(e = !1, t = !1) {
    (e || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange();
    let { dom: n } = this.tile, i = this.view.root.activeElement, o = i == n, s = !o && !(this.view.state.facet(en) || n.tabIndex > -1) && Rr(n, this.view.observer.selectionRange) && !(i && n.contains(i));
    if (!(o || t || s))
      return;
    let l = this.forceSelection;
    this.forceSelection = !1;
    let a = this.view.state.selection.main, c, h;
    if (a.empty ? h = c = this.inlineDOMNearPos(a.anchor, a.assoc || 1) : (h = this.inlineDOMNearPos(a.head, a.head == a.from ? 1 : -1), c = this.inlineDOMNearPos(a.anchor, a.anchor == a.from ? 1 : -1)), I.gecko && a.empty && !this.hasComposition && gy(c)) {
      let u = document.createTextNode("");
      this.view.observer.ignore(() => c.node.insertBefore(u, c.node.childNodes[c.offset] || null)), c = h = new Lt(u, 0), l = !0;
    }
    let d = this.view.observer.selectionRange;
    (l || !d.focusNode || (!Br(c.node, c.offset, d.anchorNode, d.anchorOffset) || !Br(h.node, h.offset, d.focusNode, d.focusOffset)) && !this.suppressWidgetCursorChange(d, a)) && (this.view.observer.ignore(() => {
      I.android && I.chrome && n.contains(d.focusNode) && Sy(d.focusNode, n) && (n.blur(), n.focus({ preventScroll: !0 }));
      let u = jr(this.view.root);
      if (u) if (a.empty) {
        if (I.gecko) {
          let f = xy(c.node, c.offset);
          if (f && f != 3) {
            let g = (f == 1 ? nd : rd)(c.node, c.offset);
            g && (c = new Lt(g.node, g.offset));
          }
        }
        u.collapse(c.node, c.offset), a.bidiLevel != null && u.caretBidiLevel !== void 0 && (u.caretBidiLevel = a.bidiLevel);
      } else if (u.extend) {
        u.collapse(c.node, c.offset);
        try {
          u.extend(h.node, h.offset);
        } catch {
        }
      } else {
        let f = document.createRange();
        a.anchor > a.head && ([c, h] = [h, c]), f.setEnd(h.node, h.offset), f.setStart(c.node, c.offset), u.removeAllRanges(), u.addRange(f);
      }
      s && this.view.root.activeElement == n && (n.blur(), i && i.focus());
    }), this.view.observer.setSelectionRange(c, h)), this.impreciseAnchor = c.precise ? null : new Lt(d.anchorNode, d.anchorOffset), this.impreciseHead = h.precise ? null : new Lt(d.focusNode, d.focusOffset);
  }
  // If a zero-length widget is inserted next to the cursor during
  // composition, avoid moving it across it and disrupting the
  // composition.
  suppressWidgetCursorChange(e, t) {
    return this.hasComposition && t.empty && Br(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset) && this.posFromDOM(e.focusNode, e.focusOffset) == t.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view: e } = this, t = e.state.selection.main, n = jr(e.root), { anchorNode: i, anchorOffset: o } = e.observer.selectionRange;
    if (!n || !t.empty || !t.assoc || !n.modify)
      return;
    let s = this.lineAt(t.head, t.assoc);
    if (!s)
      return;
    let l = s.posAtStart;
    if (t.head == l || t.head == l + s.length)
      return;
    let a = this.coordsAt(t.head, -1), c = this.coordsAt(t.head, 1);
    if (!a || !c || a.bottom > c.top)
      return;
    let h = this.domAtPos(t.head + t.assoc, t.assoc);
    n.collapse(h.node, h.offset), n.modify("move", t.assoc < 0 ? "forward" : "backward", "lineboundary"), e.observer.readSelectionRange();
    let d = e.observer.selectionRange;
    e.docView.posFromDOM(d.anchorNode, d.anchorOffset) != t.from && n.collapse(i, o);
  }
  posFromDOM(e, t) {
    let n = this.tile.nearest(e);
    if (!n)
      return this.tile.dom.compareDocumentPosition(e) & 2 ? 0 : this.view.state.doc.length;
    let i = n.posAtStart;
    if (n.isComposite()) {
      let o;
      if (e == n.dom)
        o = n.dom.childNodes[t];
      else {
        let s = sn(e) == 0 ? 0 : t == 0 ? -1 : 1;
        for (; ; ) {
          let l = e.parentNode;
          if (l == n.dom)
            break;
          s == 0 && l.firstChild != l.lastChild && (e == l.firstChild ? s = -1 : s = 1), e = l;
        }
        s < 0 ? o = e : o = e.nextSibling;
      }
      if (o == n.dom.firstChild)
        return i;
      for (; o && !Se.get(o); )
        o = o.nextSibling;
      if (!o)
        return i + n.length;
      for (let s = 0, l = i; ; s++) {
        let a = n.children[s];
        if (a.dom == o)
          return l;
        l += a.length + a.breakAfter;
      }
    } else return n.isText() ? e == n.dom ? i + t : i + (t ? n.length : 0) : i;
  }
  domAtPos(e, t) {
    let { tile: n, offset: i } = this.tile.resolveBlock(e, t);
    return n.isWidget() ? n.domPosFor(i, t) : n.domIn(i, t);
  }
  inlineDOMNearPos(e, t) {
    let n, i = -1, o = !1, s, l = -1, a = !1;
    return this.tile.blockTiles((c, h) => {
      if (c.isWidget()) {
        if (c.flags & 32 && h >= e)
          return !0;
        c.flags & 16 && (o = !0);
      } else {
        let d = h + c.length;
        if (h <= e && (n = c, i = e - h, o = d < e), d >= e && !s && (s = c, l = e - h, a = h > e), h > e && s)
          return !0;
      }
    }), !n && !s ? this.domAtPos(e, t) : (o && s ? n = null : a && n && (s = null), n && t < 0 || !s ? n.domIn(i, t) : s.domIn(l, t));
  }
  // Get the coord of the element at the given side of the given
  // position. If rtl is given, flatten it using that text direction.
  coordsAt(e, t, n) {
    let { tile: i, offset: o } = this.tile.resolveBlock(e, t);
    return i.isWidget() ? i.widget instanceof Wo ? null : i.coordsInWidget(o, t, !0) : i.coordsIn(o, t, n);
  }
  lineAt(e, t) {
    let { tile: n } = this.tile.resolveBlock(e, t);
    return n.isLine() ? n : null;
  }
  coordsForChar(e) {
    let { tile: t, offset: n } = this.tile.resolveBlock(e, 1);
    if (!t.isLine())
      return null;
    function i(o, s) {
      if (o.isComposite())
        for (let l of o.children) {
          if (l.length >= s) {
            let a = i(l, s);
            if (a)
              return a;
          }
          if (s -= l.length, s < 0)
            break;
        }
      else if (o.isText() && s < o.length) {
        let l = je(o.text, s);
        if (l == s)
          return null;
        let a = Ur(o.dom, s, l).getClientRects();
        for (let c = 0; c < a.length; c++) {
          let h = a[c];
          if (c == a.length - 1 || h.top < h.bottom && h.left < h.right)
            return h;
        }
      }
      return null;
    }
    return i(t, n);
  }
  measureVisibleLineHeights(e) {
    let t = [], { from: n, to: i } = e, o = this.view.contentDOM.clientWidth, s = o > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, l = -1, a = this.view.textDirection == Ee.LTR, c = 0, h = (d, u, f) => {
      for (let g = 0; g < d.children.length && !(u > i); g++) {
        let w = d.children[g], k = u + w.length, v = w.dom.getBoundingClientRect(), { height: D } = v;
        if (f && !g && (c += v.top - f.top), w instanceof rn)
          k > n && h(w, u, v);
        else if (u >= n && (c > 0 && t.push(-c), t.push(D + c), c = 0, s)) {
          let N = w.dom.lastChild, Y = N ? Nr(N) : [];
          if (Y.length) {
            let A = Y[Y.length - 1], T = a ? A.right - v.left : v.right - A.left;
            T > l && (l = T, this.minWidth = o, this.minWidthFrom = u, this.minWidthTo = k);
          }
        }
        f && g == d.children.length - 1 && (c += f.bottom - v.bottom), u = k + w.breakAfter;
      }
    };
    return h(this.tile, 0, null), t;
  }
  textDirectionAt(e) {
    let { tile: t } = this.tile.resolveBlock(e, 1);
    return getComputedStyle(t.dom).direction == "rtl" ? Ee.RTL : Ee.LTR;
  }
  measureTextSize() {
    let e = this.tile.blockTiles((s) => {
      if (s.isLine() && s.children.length && s.length <= 20) {
        let l = 0, a;
        for (let c of s.children) {
          if (!c.isText() || /[^ -~]/.test(c.text))
            return;
          let h = Nr(c.dom);
          if (h.length != 1)
            return;
          l += h[0].width, a = h[0].height;
        }
        if (l)
          return {
            lineHeight: s.dom.getBoundingClientRect().height,
            charWidth: l / s.length,
            textHeight: a
          };
      }
    });
    if (e)
      return e;
    let t = document.createElement("div"), n, i, o;
    return t.className = "cm-line", t.style.width = "99999px", t.style.position = "absolute", t.textContent = "abc def ghi jkl mno pqr stu", this.view.observer.ignore(() => {
      this.tile.dom.appendChild(t);
      let s = Nr(t.firstChild)[0];
      n = t.getBoundingClientRect().height, i = s && s.width ? s.width / 27 : 7, o = s && s.height ? s.height : n, t.remove();
    }), { lineHeight: n, charWidth: i, textHeight: o };
  }
  computeBlockGapDeco() {
    let e = [], t = this.view.viewState;
    for (let n = 0, i = 0; ; i++) {
      let o = i == t.viewports.length ? null : t.viewports[i], s = o ? o.from - 1 : this.view.state.doc.length;
      if (s > n) {
        let l = (t.lineBlockAt(s).bottom - t.lineBlockAt(n).top) / this.view.scaleY;
        e.push(te.replace({
          widget: new Wo(l),
          block: !0,
          inclusive: !0,
          isBlockGap: !0
        }).range(n, s));
      }
      if (!o)
        break;
      n = o.to + 1;
    }
    return te.set(e);
  }
  updateDeco() {
    let e = 1, t = this.view.state.facet(go).map((o) => (this.dynamicDecorationMap[e++] = typeof o == "function") ? o(this.view) : o), n = !1, i = this.view.state.facet(bl).map((o, s) => {
      let l = typeof o == "function";
      return l && (n = !0), l ? o(this.view) : o;
    });
    for (i.length && (this.dynamicDecorationMap[e++] = n, t.push(oe.join(i))), this.decorations = [
      this.editContextFormatting,
      ...t,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ]; e < this.decorations.length; )
      this.dynamicDecorationMap[e++] = !1;
    this.blockWrappers = this.view.state.facet(bd).map((o) => typeof o == "function" ? o(this.view) : o);
  }
  scrollIntoView(e) {
    if (e.isSnapshot) {
      let c = this.view.viewState.lineBlockAt(e.range.head);
      this.view.scrollDOM.scrollTop = c.top - e.yMargin, this.view.scrollDOM.scrollLeft = e.xMargin;
      return;
    }
    for (let c of this.view.state.facet(gd))
      try {
        if (c(this.view, e.range, e))
          return !0;
      } catch (h) {
        Ut(this.view.state, h, "scroll handler");
      }
    let { range: t } = e, n = this.coordsAt(t.head, t.assoc || (t.head > t.anchor ? -1 : 1)), i;
    if (!n)
      return;
    !t.empty && (i = this.coordsAt(t.anchor, t.anchor > t.head ? -1 : 1)) && (n = {
      left: Math.min(n.left, i.left),
      top: Math.min(n.top, i.top),
      right: Math.max(n.right, i.right),
      bottom: Math.max(n.bottom, i.bottom)
    });
    let o = kd(this.view), s = {
      left: n.left - o.left,
      top: n.top - o.top,
      right: n.right + o.right,
      bottom: n.bottom + o.bottom
    }, { offsetWidth: l, offsetHeight: a } = this.view.scrollDOM;
    if (_0(this.view.scrollDOM, s, t.head < t.anchor ? -1 : 1, e.x, e.y, Math.max(Math.min(e.xMargin, l), -l), Math.max(Math.min(e.yMargin, a), -a), this.view.textDirection == Ee.LTR), window.visualViewport && window.innerHeight - window.visualViewport.height > 1 && (n.top > window.pageYOffset + window.visualViewport.offsetTop + window.visualViewport.height || n.bottom < window.pageYOffset + window.visualViewport.offsetTop)) {
      let c = this.view.docView.lineAt(t.head, 1);
      c && c.dom.scrollIntoView({ block: "nearest" });
    }
  }
  lineHasWidget(e) {
    let t = (n) => n.isWidget() || n.children.some(t);
    return t(this.tile.resolveBlock(e, 1).tile);
  }
  destroy() {
    $s(this.tile);
  }
}
function $s(r, e) {
  let t = e == null ? void 0 : e.get(r);
  if (t != 1) {
    t == null && r.destroy();
    for (let n of r.children)
      $s(n, e);
  }
}
function gy(r) {
  return r.node.nodeType == 1 && r.node.firstChild && (r.offset == 0 || r.node.childNodes[r.offset - 1].contentEditable == "false") && (r.offset == r.node.childNodes.length || r.node.childNodes[r.offset].contentEditable == "false");
}
function Cd(r, e) {
  let t = r.observer.selectionRange;
  if (!t.focusNode)
    return null;
  let n = nd(t.focusNode, t.focusOffset), i = rd(t.focusNode, t.focusOffset), o = n || i;
  if (i && n && i.node != n.node) {
    let l = Se.get(i.node);
    if (!l || l.isText() && l.text != i.node.nodeValue)
      o = i;
    else if (r.docView.lastCompositionAfterCursor) {
      let a = Se.get(n.node);
      !a || a.isText() && a.text != n.node.nodeValue || (o = i);
    }
  }
  if (r.docView.lastCompositionAfterCursor = o != n, !o)
    return null;
  let s = e - o.offset;
  return { from: s, to: s + o.node.nodeValue.length, node: o.node };
}
function yy(r, e, t) {
  let n = Cd(r, t);
  if (!n)
    return null;
  let { node: i, from: o, to: s } = n, l = i.nodeValue;
  if (/[\n\r]/.test(l) || r.state.doc.sliceString(n.from, n.to) != l)
    return null;
  let a = e.invertedDesc;
  return { range: new mt(a.mapPos(o), a.mapPos(s), o, s), text: i };
}
function xy(r, e) {
  return r.nodeType != 1 ? 0 : (e && r.childNodes[e - 1].contentEditable == "false" ? 1 : 0) | (e < r.childNodes.length && r.childNodes[e].contentEditable == "false" ? 2 : 0);
}
let by = class {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    or(e, t, this.changes);
  }
  comparePoint(e, t) {
    or(e, t, this.changes);
  }
  boundChange(e) {
    or(e, e, this.changes);
  }
};
function wy(r, e, t) {
  let n = new by();
  return oe.compare(r, e, t, n), n.changes;
}
class vy {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    or(e, t, this.changes);
  }
  comparePoint() {
  }
  boundChange(e) {
    or(e, e, this.changes);
  }
}
function ky(r, e, t) {
  let n = new vy();
  return oe.compare(r, e, t, n), n.changes;
}
function Sy(r, e) {
  for (let t = r; t && t != e; t = t.assignedSlot || t.parentNode)
    if (t.nodeType == 1 && t.contentEditable == "false")
      return !0;
  return !1;
}
function Cy(r, e) {
  let t = !1;
  return e && r.iterChangedRanges((n, i) => {
    n < e.to && i > e.from && (t = !0);
  }), t;
}
class Wo extends qn {
  constructor(e) {
    super(), this.height = e;
  }
  toDOM() {
    let e = document.createElement("div");
    return e.className = "cm-gap", this.updateDOM(e), e;
  }
  eq(e) {
    return e.height == this.height;
  }
  updateDOM(e) {
    return e.style.height = this.height + "px", !0;
  }
  get editable() {
    return !0;
  }
  get estimatedHeight() {
    return this.height;
  }
  ignoreEvent() {
    return !1;
  }
}
function Ay(r, e, t = 1) {
  let n = r.charCategorizer(e), i = r.doc.lineAt(e), o = e - i.from;
  if (i.length == 0)
    return E.cursor(e);
  o == 0 ? t = 1 : o == i.length && (t = -1);
  let s = o, l = o;
  t < 0 ? s = je(i.text, o, !1) : l = je(i.text, o);
  let a = n(i.text.slice(s, l));
  for (; s > 0; ) {
    let c = je(i.text, s, !1);
    if (n(i.text.slice(c, s)) != a)
      break;
    s = c;
  }
  for (; l < i.length; ) {
    let c = je(i.text, l);
    if (n(i.text.slice(l, c)) != a)
      break;
    l = c;
  }
  return E.undirectionalRange(s + i.from, l + i.from);
}
function My(r, e, t, n, i) {
  let o = Math.round((n - e.left) * r.defaultCharacterWidth);
  if (r.lineWrapping && t.height > r.defaultLineHeight * 1.5) {
    let l = r.viewState.heightOracle.textHeight, a = Math.floor((i - t.top - (r.defaultLineHeight - l) * 0.5) / l);
    o += a * r.viewState.heightOracle.lineLength;
  }
  let s = r.state.sliceDoc(t.from, t.to);
  return t.from + As(s, o, r.state.tabSize);
}
function Dy(r, e, t) {
  let n = r.lineBlockAt(e);
  if (Array.isArray(n.type)) {
    let i;
    for (let o of n.type) {
      if (o.from > e)
        break;
      if (!(o.to < e)) {
        if (o.from < e && o.to > e)
          return o;
        (!i || o.type == nt.Text && (i.type != o.type || (t < 0 ? o.from < e : o.to > e))) && (i = o);
      }
    }
    return i || n;
  }
  return n;
}
function Ty(r, e, t, n) {
  let i = Dy(r, e.head, e.assoc || -1), o = !n || i.type != nt.Text || !(r.lineWrapping || i.widgetLineBreaks) ? null : r.coordsAtPos(e.assoc < 0 && e.head > i.from ? e.head - 1 : e.head);
  if (o) {
    let s = r.dom.getBoundingClientRect(), l = r.textDirectionAt(i.from), a = r.posAtCoords({
      x: t == (l == Ee.LTR) ? s.right - 1 : s.left + 1,
      y: (o.top + o.bottom) / 2
    });
    if (a != null)
      return E.cursor(a, t ? -1 : 1);
  }
  return E.cursor(t ? i.to : i.from, t ? -1 : 1);
}
function _a(r, e, t, n) {
  let i = r.state.doc.lineAt(e.head), o = r.bidiSpans(i), s = r.textDirectionAt(i.from);
  for (let l = e, a = null; ; ) {
    let c = ey(i, o, s, l, t), h = ad;
    if (!c) {
      if (i.number == (t ? r.state.doc.lines : 1))
        return l;
      h = `
`, i = r.state.doc.line(i.number + (t ? 1 : -1)), o = r.bidiSpans(i), c = r.visualLineSide(i, !t);
    }
    if (a) {
      if (!a(h))
        return l;
    } else {
      if (!n)
        return c;
      a = n(h);
    }
    l = c;
  }
}
function Ey(r, e, t) {
  let n = r.state.charCategorizer(e), i = n(t);
  return (o) => {
    let s = n(o);
    return i == nn.Space && (i = s), i == s;
  };
}
function Oy(r, e, t, n) {
  let i = e.head, o = t ? 1 : -1;
  if (i == (t ? r.state.doc.length : 0))
    return E.cursor(i, e.assoc);
  let s = e.goalColumn, l, a = r.contentDOM.getBoundingClientRect(), c = r.coordsAtPos(i, e.assoc || ((e.empty ? t : e.head == e.from) ? 1 : -1)), h = r.documentTop;
  if (c)
    s == null && (s = c.left - a.left), l = o < 0 ? c.top : c.bottom;
  else {
    let g = r.viewState.lineBlockAt(i);
    s == null && (s = Math.min(a.right - a.left, r.defaultCharacterWidth * (i - g.from))), l = (o < 0 ? g.top : g.bottom) + h;
  }
  let d = a.left + s, u = r.viewState.heightOracle.textHeight >> 1, f = n ?? u;
  for (let g = 0; ; g += u) {
    let w = l + (f + g) * o, k = Fs(r, { x: d, y: w }, !1, o);
    if (t ? w > a.bottom : w < a.top)
      return E.cursor(k.pos, k.assoc);
    let v = r.coordsAtPos(k.pos, k.assoc), D = v ? (v.top + v.bottom) / 2 : 0;
    if (!v || (t ? D > l : D < l))
      return E.cursor(k.pos, k.assoc, void 0, s);
  }
}
function Ir(r, e, t) {
  for (; ; ) {
    let n = 0;
    for (let i of r)
      i.between(e - 1, e + 1, (o, s, l) => {
        if (e > o && e < s) {
          let a = n || t || (e - o < s - e ? -1 : 1);
          e = a < 0 ? o : s, n = a;
        }
      });
    if (!n)
      return e;
  }
}
function Ad(r, e) {
  let t = null;
  for (let n = 0; n < e.ranges.length; n++) {
    let i = e.ranges[n], o = null;
    if (i.empty) {
      let s = Ir(r, i.from, 0);
      s != i.from && (o = E.cursor(s, -1));
    } else {
      let s = Ir(r, i.from, -1), l = Ir(r, i.to, 1);
      (s != i.from || l != i.to) && (i.undirectional ? o = E.undirectionalRange(i.from, i.to) : o = E.range(i.from == i.anchor ? s : l, i.from == i.head ? s : l));
    }
    o && (t || (t = e.ranges.slice()), t[n] = o);
  }
  return t ? E.create(t, e.mainIndex) : e;
}
function zo(r, e, t) {
  let n = Ir(r.state.facet(Zr).map((i) => i(r)), t.from, e.head > t.from ? -1 : 1);
  return n == t.from ? t : E.cursor(n, n < t.from ? 1 : -1);
}
class jt {
  constructor(e, t) {
    this.pos = e, this.assoc = t;
  }
}
function Fs(r, e, t, n) {
  let i = r.contentDOM.getBoundingClientRect(), o = i.top + r.viewState.paddingTop, { x: s, y: l } = e, a = l - o, c;
  for (; ; ) {
    if (a < 0)
      return new jt(0, 1);
    if (a > r.viewState.docHeight)
      return new jt(r.state.doc.length, -1);
    if (c = r.elementAtHeight(a), n == null)
      break;
    if (c.type == nt.Text) {
      if (n < 0 ? c.to < r.viewport.from : c.from > r.viewport.to)
        break;
      let u = r.docView.coordsAt(n < 0 ? c.from : c.to, n > 0 ? -1 : 1);
      if (u && (n < 0 ? u.top <= a + o : u.bottom >= a + o))
        break;
    }
    let d = r.viewState.heightOracle.textHeight / 2;
    a = n > 0 ? c.bottom + d : c.top - d;
  }
  if (r.viewport.from >= c.to || r.viewport.to <= c.from) {
    if (t)
      return null;
    if (c.type == nt.Text) {
      let d = My(r, i, c, s, l);
      return new jt(d, d == c.from ? 1 : -1);
    }
  }
  if (c.type != nt.Text)
    return a < (c.top + c.bottom) / 2 ? new jt(c.from, 1) : new jt(c.to, -1);
  let h = r.docView.lineAt(c.from, 2);
  return (!h || h.length != c.length) && (h = r.docView.lineAt(c.from, -2)), new Ly(r, s, l, r.textDirectionAt(c.from)).scanTile(h, c.from);
}
class Ly {
  constructor(e, t, n, i) {
    this.view = e, this.x = t, this.y = n, this.baseDir = i, this.line = null, this.spans = null;
  }
  bidiSpansAt(e) {
    return (!this.line || this.line.from > e || this.line.to < e) && (this.line = this.view.state.doc.lineAt(e), this.spans = this.view.bidiSpans(this.line)), this;
  }
  baseDirAt(e, t) {
    let { line: n, spans: i } = this.bidiSpansAt(e);
    return i[Kt.find(i, e - n.from, -1, t)].level == this.baseDir;
  }
  dirAt(e, t) {
    let { line: n, spans: i } = this.bidiSpansAt(e);
    return i[Kt.find(i, e - n.from, -1, t)].dir;
  }
  // Used to short-circuit bidi tests for content with a uniform direction
  bidiIn(e, t) {
    let { spans: n, line: i } = this.bidiSpansAt(e);
    return n.length > 1 || n.length && (n[0].level != this.baseDir || n[0].to + i.from < t);
  }
  // Scan through the rectangles for the content of a tile with inline
  // content, looking for one that overlaps the queried position
  // vertically and is closest horizontally. The caller is responsible
  // for dividing its content into N pieces, and pass an array with
  // N+1 positions (including the position after the last piece). For
  // a text tile, these will be character clusters, for a composite
  // tile, these will be child tiles.
  scan(e, t, n = !1) {
    let i = 0, o = e.length - 1, s = /* @__PURE__ */ new Set(), l = this.bidiIn(e[0], e[o]), a, c, h = -1, d = 1e9, u;
    e: for (; i < o; ) {
      let g = o - i, w = i + o >> 1;
      t: if (s.has(w)) {
        let v = i + Math.floor(Math.random() * g);
        for (let D = 0; D < g; D++) {
          if (!s.has(v)) {
            w = v;
            break t;
          }
          v++, v == o && (v = i);
        }
        break e;
      }
      s.add(w);
      let k = t(w);
      if (k)
        for (let v = 0; v < k.length; v++) {
          let D = k[v], N = 0;
          if (!(D.width == 0 && k.length > 1)) {
            if (D.bottom < this.y)
              (!a || a.bottom < D.bottom) && (a = D), N = 1;
            else if (D.top > this.y)
              (!c || c.top > D.top) && (c = D), N = -1;
            else {
              let Y = D.left > this.x ? this.x - D.left : D.right < this.x ? this.x - D.right : 0, A = Math.abs(Y);
              A < d && (h = w, d = A, u = D), Y && (N = Y < 0 == (this.baseDir == Ee.LTR) ? -1 : 1);
            }
            N == -1 && (!l || this.baseDirAt(e[w], 1)) ? o = w : N == 1 && (!l || this.baseDirAt(e[w + 1], -1)) && (i = w + 1);
          }
        }
    }
    if (!u) {
      if (!c && !a)
        return { i: e[0], after: !1 };
      let g = a && (!c || this.y - a.bottom < c.top - this.y) ? a : c;
      return this.y = (g.top + g.bottom) / 2, this.scan(e, t, !0);
    }
    if (d && !n) {
      let { top: g, bottom: w } = u;
      if (a && a.bottom > (g + g + w) / 3)
        return this.y = a.bottom - 1, this.scan(e, t, !0);
      if (c && c.top < (g + w + w) / 3)
        return this.y = c.top + 1, this.scan(e, t, !0);
    }
    let f = (l ? this.dirAt(e[h], 1) : this.baseDir) == Ee.LTR;
    return {
      i: h,
      // Test whether x is closes to the start or end of this element
      after: this.x > (u.left + u.right) / 2 == f
    };
  }
  scanText(e, t) {
    let n = [];
    for (let o = 0; o < e.length; o = je(e.text, o))
      n.push(t + o);
    n.push(t + e.length);
    let i = this.scan(n, (o) => {
      let s = n[o] - t, l = n[o + 1] - t;
      return Ur(e.dom, s, l).getClientRects();
    });
    return i.after ? new jt(n[i.i + 1], -1) : new jt(n[i.i], 1);
  }
  scanTile(e, t) {
    if (!e.length)
      return new jt(t, 1);
    if (e.children.length == 1) {
      let l = e.children[0];
      if (l.isText())
        return this.scanText(l, t);
      if (l.isComposite())
        return this.scanTile(l, t);
    }
    let n = [t];
    for (let l = 0, a = t; l < e.children.length; l++)
      n.push(a += e.children[l].length);
    let i = this.scan(n, (l) => {
      let a = e.children[l];
      return a.flags & 48 ? null : (a.dom.nodeType == 1 ? a.dom : Ur(a.dom, 0, a.length)).getClientRects();
    }), o = e.children[i.i], s = n[i.i];
    return o.isText() ? this.scanText(o, s) : o.isComposite() ? this.scanTile(o, s) : i.after ? new jt(n[i.i + 1], -1) : new jt(s, 1);
  }
}
const er = "￿";
class Ry {
  constructor(e, t) {
    this.points = e, this.view = t, this.text = "", this.lineSeparator = t.state.facet(ie.lineSeparator);
  }
  append(e) {
    this.text += e;
  }
  lineBreak() {
    this.text += er;
  }
  readRange(e, t) {
    if (!e)
      return this;
    let n = e.parentNode;
    for (let i = e; ; ) {
      this.findPointBefore(n, i);
      let o = this.text.length;
      this.readNode(i);
      let s = Se.get(i), l = i.nextSibling;
      if (l == t) {
        s != null && s.breakAfter && !l && n != this.view.contentDOM && this.lineBreak();
        break;
      }
      let a = Se.get(l);
      (s && a ? s.breakAfter : (s ? s.breakAfter : Xi(i)) || Xi(l) && (i.nodeName != "BR" || s != null && s.isWidget()) && this.text.length > o) && !By(l, t) && this.lineBreak(), i = l;
    }
    return this.findPointBefore(n, t), this;
  }
  readTextNode(e) {
    let t = e.nodeValue;
    for (let n of this.points)
      n.node == e && (n.pos = this.text.length + Math.min(n.offset, t.length));
    for (let n = 0, i = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
      let o = -1, s = 1, l;
      if (this.lineSeparator ? (o = t.indexOf(this.lineSeparator, n), s = this.lineSeparator.length) : (l = i.exec(t)) && (o = l.index, s = l[0].length), this.append(t.slice(n, o < 0 ? t.length : o)), o < 0)
        break;
      if (this.lineBreak(), s > 1)
        for (let a of this.points)
          a.node == e && a.pos > this.text.length && (a.pos -= s - 1);
      n = o + s;
    }
  }
  readNode(e) {
    let t = Se.get(e), n = t && t.overrideDOMText;
    if (n != null) {
      this.findPointInside(e, n.length);
      for (let i = n.iter(); !i.next().done; )
        i.lineBreak ? this.lineBreak() : this.append(i.value);
    } else e.nodeType == 3 ? this.readTextNode(e) : e.nodeName == "BR" ? e.nextSibling && this.lineBreak() : e.nodeType == 1 && this.readRange(e.firstChild, null);
  }
  findPointBefore(e, t) {
    for (let n of this.points)
      n.node == e && e.childNodes[n.offset] == t && (n.pos = this.text.length);
  }
  findPointInside(e, t) {
    for (let n of this.points)
      (e.nodeType == 3 ? n.node == e : e.contains(n.node)) && (n.pos = this.text.length + (Ny(e, n.node, n.offset) ? t : 0));
  }
}
function Ny(r, e, t) {
  for (; ; ) {
    if (!e || t < sn(e))
      return !1;
    if (e == r)
      return !0;
    t = bn(e) + 1, e = e.parentNode;
  }
}
function By(r, e) {
  let t;
  for (; !(r == e || !r); r = r.nextSibling) {
    let n = Se.get(r);
    if (!(n != null && n.isWidget()))
      return !1;
    n && (t || (t = [])).push(n);
  }
  if (t)
    for (let n of t) {
      let i = n.overrideDOMText;
      if (i != null && i.length)
        return !1;
    }
  return !0;
}
class ja {
  constructor(e, t) {
    this.node = e, this.offset = t, this.pos = -1;
  }
}
class Iy {
  constructor(e, t, n, i) {
    this.typeOver = i, this.bounds = null, this.text = "", this.domChanged = t > -1;
    let { impreciseHead: o, impreciseAnchor: s } = e.docView, l = e.state.selection;
    if (e.state.readOnly && t > -1)
      this.newSel = null;
    else if (t > -1 && (this.bounds = Md(e.docView.tile, t, n, 0))) {
      let a = o || s ? [] : $y(e), c = new Ry(a, e);
      c.readRange(this.bounds.startDOM, this.bounds.endDOM), this.text = c.text, this.newSel = Fy(a, this.bounds.from);
    } else {
      let a = e.observer.selectionRange, c = o && o.node == a.focusNode && o.offset == a.focusOffset || !Rs(e.contentDOM, a.focusNode) ? l.main.head : e.docView.posFromDOM(a.focusNode, a.focusOffset), h = s && s.node == a.anchorNode && s.offset == a.anchorOffset || !Rs(e.contentDOM, a.anchorNode) ? l.main.anchor : e.docView.posFromDOM(a.anchorNode, a.anchorOffset), d = e.viewport;
      if ((I.ios || I.chrome) && c != h && Math.min(c, h) <= l.main.from && Math.max(c, h) >= l.main.to && (d.from > 0 || d.to < e.state.doc.length)) {
        let u = Math.min(c, h), f = Math.max(c, h), g = d.from - u, w = d.to - f;
        (g == 0 || g == 1 || u == 0) && (w == 0 || w == -1 || f == e.state.doc.length) && (c = 0, h = e.state.doc.length);
      }
      if (e.inputState.composing > -1 && l.ranges.length > 1)
        this.newSel = l.replaceRange(E.range(h, c));
      else if (e.lineWrapping && h == c && !(l.main.empty && l.main.head == c) && e.inputState.lastTouchTime > Date.now() - 100) {
        let u = e.coordsAtPos(c, -1), f = 0;
        u && (f = e.inputState.lastTouchY <= u.bottom ? -1 : 1), this.newSel = E.create([E.cursor(c, f)]);
      } else
        this.newSel = E.single(h, c);
    }
  }
}
function Md(r, e, t, n) {
  if (r.isComposite()) {
    let i = -1, o = -1, s = -1, l = -1;
    for (let a = 0, c = n, h = n; a < r.children.length; a++) {
      let d = r.children[a], u = c + d.length;
      if (c < e && u > t)
        return Md(d, e, t, c);
      if (u >= e && i == -1 && (i = a, o = c), c > t && d.dom.parentNode == r.dom) {
        s = a, l = h;
        break;
      }
      h = u, c = u + d.breakAfter;
    }
    return {
      from: o,
      to: l < 0 ? n + r.length : l,
      startDOM: (i ? r.children[i - 1].dom.nextSibling : null) || r.dom.firstChild,
      endDOM: s < r.children.length && s >= 0 ? r.children[s].dom : null
    };
  } else return r.isText() ? { from: n, to: n + r.length, startDOM: r.dom, endDOM: r.dom.nextSibling } : null;
}
function Dd(r, e) {
  let t, { newSel: n } = e, { state: i } = r, o = i.selection.main, s = r.inputState.lastKeyTime > Date.now() - 100 ? r.inputState.lastKeyCode : -1;
  if (e.bounds) {
    let { from: l, to: a } = e.bounds, c = o.from, h = null;
    (s === 8 || I.android && e.text.length < a - l) && (c = o.to, h = "end");
    let d = i.doc.sliceString(l, a, er), u, f;
    !o.empty && o.from >= l && o.to <= a && (e.typeOver || d != e.text) && d.slice(0, o.from - l) == e.text.slice(0, o.from - l) && d.slice(o.to - l) == e.text.slice(u = e.text.length - (d.length - (o.to - l))) ? t = {
      from: o.from,
      to: o.to,
      insert: se.of(e.text.slice(o.from - l, u).split(er))
    } : (f = Td(d, e.text, c - l, h)) && (I.chrome && s == 13 && f.toB == f.from + 2 && e.text.slice(f.from, f.toB) == er + er && f.toB--, t = {
      from: l + f.from,
      to: l + f.toA,
      insert: se.of(e.text.slice(f.from, f.toB).split(er))
    });
  } else n && (!r.hasFocus && i.facet(en) || to(n, o)) && (n = null);
  if (!t && !n)
    return !1;
  if ((I.mac || I.android) && t && t.from == t.to && t.from == o.head - 1 && /^\. ?$/.test(t.insert.toString()) && r.contentDOM.getAttribute("autocorrect") == "off" ? (n && t.insert.length == 2 && (n = E.single(n.main.anchor - 1, n.main.head - 1)), t = { from: t.from, to: t.to, insert: se.of([t.insert.toString().replace(".", " ")]) }) : i.doc.lineAt(o.from).to < o.to && r.docView.lineHasWidget(o.to) && r.inputState.insertingTextAt > Date.now() - 50 ? t = {
    from: o.from,
    to: o.to,
    insert: i.toText(r.inputState.insertingText)
  } : I.chrome && t && t.from == t.to && t.from == o.head && t.insert.toString() == `
 ` && r.lineWrapping && (n && (n = E.single(n.main.anchor - 1, n.main.head - 1)), t = { from: o.from, to: o.to, insert: se.of([" "]) }), t)
    return wl(r, t, n, s);
  if (n && !to(n, o)) {
    let l = !1, a = "select";
    return r.inputState.lastSelectionTime > Date.now() - 50 && (r.inputState.lastSelectionOrigin == "select" && (l = !0), a = r.inputState.lastSelectionOrigin, a == "select.pointer" && (n = Ad(i.facet(Zr).map((c) => c(r)), n))), r.dispatch({ selection: n, scrollIntoView: l, userEvent: a }), !0;
  } else
    return !1;
}
function wl(r, e, t, n = -1) {
  if (I.ios && r.inputState.flushIOSKey(e))
    return !0;
  let i = r.state.selection.main;
  if (I.android && (e.to == i.to && // GBoard will sometimes remove a space it just inserted
  // after a completion when you press enter
  (e.from == i.from || e.from == i.from - 1 && r.state.sliceDoc(e.from, i.from) == " ") && e.insert.length == 1 && e.insert.lines == 2 && sr(r.contentDOM, "Enter", 13) || (e.from == i.from - 1 && e.to == i.to && e.insert.length == 0 || n == 8 && e.insert.length < e.to - e.from && e.to > i.head) && sr(r.contentDOM, "Backspace", 8) || e.from == i.from && e.to == i.to + 1 && e.insert.length == 0 && sr(r.contentDOM, "Delete", 46)))
    return !0;
  let o = e.insert.toString();
  r.inputState.composing >= 0 && r.inputState.composing++;
  let s, l = () => s || (s = Py(r, e, t));
  return r.state.facet(fd).some((a) => a(r, e.from, e.to, o, l)) || r.dispatch(l()), !0;
}
function Py(r, e, t) {
  let n, i = r.state, o = i.selection.main, s = -1;
  if (e.from == e.to && e.from < o.from || e.from > o.to) {
    let a = e.from < o.from ? -1 : 1, c = a < 0 ? o.from : o.to, h = Ir(i.facet(Zr).map((d) => d(r)), c, a);
    e.from == h && (s = h);
  }
  if (s > -1)
    n = {
      changes: e,
      selection: E.cursor(e.from + e.insert.length, -1)
    };
  else if (e.from >= o.from && e.to <= o.to && e.to - e.from >= (o.to - o.from) / 3 && (!t || t.main.empty && t.main.from == e.from + e.insert.length) && r.inputState.composing < 0) {
    let a = o.from < e.from ? i.sliceDoc(o.from, e.from) : "", c = o.to > e.to ? i.sliceDoc(e.to, o.to) : "";
    n = i.replaceSelection(r.state.toText(a + e.insert.sliceString(0, void 0, r.state.lineBreak) + c));
  } else {
    let a = i.changes(e), c = t && t.main.to <= a.newLength ? t.main : void 0;
    if (i.selection.ranges.length > 1 && (r.inputState.composing >= 0 || r.inputState.compositionPendingChange) && e.to <= o.to + 10 && e.to >= o.to - 10) {
      let h = r.state.sliceDoc(e.from, e.to), d, u = t && Cd(r, t.main.head);
      if (u) {
        let g = e.insert.length - (e.to - e.from);
        d = { from: u.from, to: u.to - g };
      } else
        d = r.state.doc.lineAt(o.head);
      let f = o.to - e.to;
      n = i.changeByRange((g) => {
        if (g.from == o.from && g.to == o.to)
          return { changes: a, range: c || g.map(a) };
        let w = g.to - f, k = w - h.length;
        if (r.state.sliceDoc(k, w) != h || // Unfortunately, there's no way to make multiple
        // changes in the same node work without aborting
        // composition, so cursors in the composition range are
        // ignored.
        w >= d.from && k <= d.to)
          return { range: g };
        let v = i.changes({ from: k, to: w, insert: e.insert }), D = g.to - o.to;
        return {
          changes: v,
          range: c ? E.range(Math.max(0, c.anchor + D), Math.max(0, c.head + D)) : g.map(v)
        };
      });
    } else
      n = {
        changes: a,
        selection: c && i.selection.replaceRange(c)
      };
  }
  let l = "input.type";
  return (r.composing || r.inputState.compositionPendingChange && r.inputState.compositionEndedAt > Date.now() - 50) && (r.inputState.compositionPendingChange = !1, l += ".compose", r.inputState.compositionFirstChange && (l += ".start", r.inputState.compositionFirstChange = !1)), i.update(n, { userEvent: l, scrollIntoView: !0 });
}
function Td(r, e, t, n) {
  let i = Math.min(r.length, e.length), o = 0;
  for (; o < i && r.charCodeAt(o) == e.charCodeAt(o); )
    o++;
  if (o == i && r.length == e.length)
    return null;
  let s = r.length, l = e.length;
  for (; s > 0 && l > 0 && r.charCodeAt(s - 1) == e.charCodeAt(l - 1); )
    s--, l--;
  if (n == "end") {
    let a = Math.max(0, o - Math.min(s, l));
    t -= s + a - o;
  }
  if (s < o && r.length < e.length) {
    let a = t <= o && t >= s ? o - t : 0;
    o -= a, l = o + (l - s), s = o;
  } else if (l < o) {
    let a = t <= o && t >= l ? o - t : 0;
    o -= a, s = o + (s - l), l = o;
  }
  return { from: o, toA: s, toB: l };
}
function $y(r) {
  let e = [];
  if (r.root.activeElement != r.contentDOM)
    return e;
  let { anchorNode: t, anchorOffset: n, focusNode: i, focusOffset: o } = r.observer.selectionRange;
  return t && (e.push(new ja(t, n)), (i != t || o != n) && e.push(new ja(i, o))), e;
}
function Fy(r, e) {
  if (r.length == 0)
    return null;
  let t = r[0].pos, n = r.length == 2 ? r[1].pos : t;
  return t > -1 && n > -1 ? E.single(t + e, n + e) : null;
}
function to(r, e) {
  return e.head == r.main.head && e.anchor == r.main.anchor;
}
class Hy {
  setSelectionOrigin(e) {
    this.lastSelectionOrigin = e, this.lastSelectionTime = Date.now();
  }
  constructor(e) {
    this.view = e, this.lastKeyCode = 0, this.lastKeyTime = 0, this.touchActive = !1, this.lastTouchTime = 0, this.lastTouchX = 0, this.lastTouchY = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.lastWheelEvent = 0, this.pendingIOSKey = void 0, this.lastIOSMomentumScroll = 0, this.tabFocusMode = -1, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.handlers = /* @__PURE__ */ Object.create(null), this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.compositionPendingKey = !1, this.compositionPendingChange = !1, this.insertingText = "", this.insertingTextAt = 0, this.mouseSelection = null, this.draggedContent = null, this.handleEvent = this.handleEvent.bind(this), this.notifiedFocused = e.hasFocus, I.safari && e.contentDOM.addEventListener("input", () => null), I.gecko && tx(e.contentDOM.ownerDocument);
  }
  handleEvent(e) {
    !Yy(this.view, e) || this.ignoreDuringComposition(e) || e.type == "keydown" && this.keydown(e) || (this.view.updateState != 0 ? Promise.resolve().then(() => this.runHandlers(e.type, e)) : this.runHandlers(e.type, e));
  }
  runHandlers(e, t) {
    let n = this.handlers[e];
    if (n) {
      for (let i of n.observers)
        i(this.view, t);
      for (let i of n.handlers) {
        if (t.defaultPrevented)
          break;
        if (i(this.view, t)) {
          t.preventDefault();
          break;
        }
      }
    }
  }
  ensureHandlers(e) {
    let t = zy(e), n = this.handlers, i = this.view.contentDOM;
    for (let o in t)
      if (o != "scroll") {
        let s = !t[o].handlers.length, l = n[o];
        l && s != !l.handlers.length && (i.removeEventListener(o, this.handleEvent), l = null), l || i.addEventListener(o, this.handleEvent, { passive: s });
      }
    for (let o in n)
      o != "scroll" && !t[o] && i.removeEventListener(o, this.handleEvent);
    this.handlers = t;
  }
  keydown(e) {
    if (this.lastKeyCode = e.keyCode, this.lastKeyTime = Date.now(), e.keyCode == 9 && this.tabFocusMode > -1 && (!this.tabFocusMode || Date.now() <= this.tabFocusMode))
      return !0;
    if (this.tabFocusMode > 0 && e.keyCode != 27 && Od.indexOf(e.keyCode) < 0 && (this.tabFocusMode = -1), I.android && I.chrome && !e.synthetic && (e.keyCode == 13 || e.keyCode == 8))
      return this.view.observer.delayAndroidKey(e.key, e.keyCode), !0;
    if (I.ios && !e.synthetic && !e.altKey && !e.metaKey && (Ed.some((t) => t.keyCode == e.keyCode) && !e.ctrlKey || Vy.indexOf(e.key) > -1 && e.ctrlKey)) {
      let t = { ctrlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey, shiftKey: e.shiftKey };
      return t.shiftKey && I.ios && !/^(off|none)$/.test(this.view.contentDOM.autocapitalize) && Wy(this.view.win) && (t.shiftKey = !1), this.pendingIOSKey = { key: e.key, keyCode: e.keyCode, mods: t }, setTimeout(() => this.flushIOSKey(), 250), !0;
    }
    return e.keyCode != 229 && this.view.observer.forceFlush(), !1;
  }
  flushIOSKey(e) {
    let t = this.pendingIOSKey;
    return !t || t.key == "Enter" && e && e.from < e.to && /^\S+$/.test(e.insert.toString()) ? !1 : (this.pendingIOSKey = void 0, sr(this.view.contentDOM, t.key, t.keyCode, t.mods));
  }
  ignoreDuringComposition(e) {
    return !/^key/.test(e.type) || e.synthetic ? !1 : this.composing > 0 ? !0 : I.safari && !I.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100 ? (this.compositionPendingKey = !1, !0) : !1;
  }
  startMouseSelection(e) {
    this.mouseSelection && this.mouseSelection.destroy(), this.mouseSelection = e;
  }
  update(e) {
    this.view.observer.update(e), this.mouseSelection && this.mouseSelection.update(e), this.draggedContent && e.docChanged && (this.draggedContent = this.draggedContent.map(e.changes)), e.transactions.length && (this.lastKeyCode = this.lastSelectionTime = 0);
  }
  destroy() {
    this.mouseSelection && this.mouseSelection.destroy();
  }
}
function Wy(r) {
  return r.visualViewport ? r.visualViewport.height * r.visualViewport.scale / r.document.documentElement.clientHeight < 0.85 : !1;
}
function Ka(r, e) {
  return (t, n) => {
    try {
      return e.call(r, n, t);
    } catch (i) {
      Ut(t.state, i);
    }
  };
}
function zy(r) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(n) {
    return e[n] || (e[n] = { observers: [], handlers: [] });
  }
  for (let n of r) {
    let i = n.spec, o = i && i.plugin.domEventHandlers, s = i && i.plugin.domEventObservers;
    if (o)
      for (let l in o) {
        let a = o[l];
        a && t(l).handlers.push(Ka(n.value, a));
      }
    if (s)
      for (let l in s) {
        let a = s[l];
        a && t(l).observers.push(Ka(n.value, a));
      }
  }
  for (let n in Rt)
    t(n).handlers.push(Rt[n]);
  for (let n in Xe)
    t(n).observers.push(Xe[n]);
  return e;
}
const Ed = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], Vy = "dthko", Od = [16, 17, 18, 20, 91, 92, 224, 225], wi = 6;
function vi(r) {
  return Math.max(0, r) * 0.7 + 8;
}
function _y(r, e) {
  return Math.max(Math.abs(r.clientX - e.clientX), Math.abs(r.clientY - e.clientY));
}
class jy {
  constructor(e, t, n, i) {
    this.view = e, this.startEvent = t, this.style = n, this.mustSelect = i, this.scrollSpeed = { x: 0, y: 0 }, this.scrolling = -1, this.lastEvent = t, this.scrollParents = Qh(e.contentDOM), this.atoms = e.state.facet(Zr).map((s) => s(e));
    let o = e.contentDOM.ownerDocument;
    o.addEventListener("mousemove", this.move = this.move.bind(this)), o.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = t.shiftKey, this.multiple = e.state.facet(ie.allowMultipleSelections) && Ky(e, t), this.dragging = qy(e, t) && Nd(t) == 1 ? null : !1;
  }
  start(e) {
    this.dragging === !1 && this.select(e);
  }
  move(e) {
    if (e.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && _y(this.startEvent, e) < 10)
      return;
    this.select(this.lastEvent = e);
    let t = 0, n = 0, i = 0, o = 0, s = this.view.win.innerWidth, l = this.view.win.innerHeight;
    this.scrollParents.x && ({ left: i, right: s } = this.scrollParents.x.getBoundingClientRect()), this.scrollParents.y && ({ top: o, bottom: l } = this.scrollParents.y.getBoundingClientRect());
    let a = kd(this.view);
    e.clientX - a.left <= i + wi ? t = -vi(i - e.clientX) : e.clientX + a.right >= s - wi && (t = vi(e.clientX - s)), e.clientY - a.top <= o + wi ? n = -vi(o - e.clientY) : e.clientY + a.bottom >= l - wi && (n = vi(e.clientY - l)), this.setScrollSpeed(t, n);
  }
  up(e) {
    this.dragging == null && this.select(this.lastEvent), this.dragging || e.preventDefault(), this.destroy();
  }
  destroy() {
    this.setScrollSpeed(0, 0);
    let e = this.view.contentDOM.ownerDocument;
    e.removeEventListener("mousemove", this.move), e.removeEventListener("mouseup", this.up), this.view.inputState.mouseSelection = this.view.inputState.draggedContent = null;
  }
  setScrollSpeed(e, t) {
    this.scrollSpeed = { x: e, y: t }, e || t ? this.scrolling < 0 && (this.scrolling = setInterval(() => this.scroll(), 50)) : this.scrolling > -1 && (clearInterval(this.scrolling), this.scrolling = -1);
  }
  scroll() {
    let { x: e, y: t } = this.scrollSpeed;
    e && this.scrollParents.x && (this.scrollParents.x.scrollLeft += e, e = 0), t && this.scrollParents.y && (this.scrollParents.y.scrollTop += t, t = 0), (e || t) && this.view.win.scrollBy(e, t), this.dragging === !1 && this.select(this.lastEvent);
  }
  select(e) {
    let { view: t } = this, n = Ad(this.atoms, this.style.get(e, this.extend, this.multiple));
    (this.mustSelect || !n.eq(t.state.selection, this.dragging === !1)) && this.view.dispatch({
      selection: n,
      userEvent: "select.pointer"
    }), this.mustSelect = !1;
  }
  update(e) {
    e.transactions.some((t) => t.isUserEvent("input.type")) ? this.destroy() : this.style.update(e) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function Ky(r, e) {
  let t = r.state.facet(cd);
  return t.length ? t[0](e) : I.mac ? e.metaKey : e.ctrlKey;
}
function Uy(r, e) {
  let t = r.state.facet(hd);
  return t.length ? t[0](e) : I.mac ? !e.altKey : !e.ctrlKey;
}
function qy(r, e) {
  let { main: t } = r.state.selection;
  if (t.empty)
    return !1;
  let n = jr(r.root);
  if (!n || n.rangeCount == 0)
    return !0;
  let i = n.getRangeAt(0).getClientRects();
  for (let o = 0; o < i.length; o++) {
    let s = i[o];
    if (s.left <= e.clientX && s.right >= e.clientX && s.top <= e.clientY && s.bottom >= e.clientY)
      return !0;
  }
  return !1;
}
function Yy(r, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target, n; t != r.contentDOM; t = t.parentNode)
    if (!t || t.nodeType == 11 || (n = Se.get(t)) && n.isWidget() && !n.isHidden && n.widget.ignoreEvent(e))
      return !1;
  return !0;
}
const Rt = /* @__PURE__ */ Object.create(null), Xe = /* @__PURE__ */ Object.create(null), Ld = I.ie && I.ie_version < 15 || I.ios && I.webkit_version < 604;
function Gy(r) {
  let e = r.dom.parentNode;
  if (!e)
    return;
  let t = e.appendChild(document.createElement("textarea"));
  t.style.cssText = "position: fixed; left: -10000px; top: 10px", t.focus(), setTimeout(() => {
    r.focus(), t.remove(), Rd(r, t.value);
  }, 50);
}
function bo(r, e, t) {
  for (let n of r.facet(e))
    t = n(t, r);
  return t;
}
function Rd(r, e) {
  e = bo(r.state, gl, e);
  let { state: t } = r, n, i = 1, o = t.toText(e), s = o.lines == t.selection.ranges.length;
  if (Hs != null && t.selection.ranges.every((a) => a.empty) && Hs == o.toString()) {
    let a = -1;
    n = t.changeByRange((c) => {
      let h = t.doc.lineAt(c.from);
      if (h.from == a)
        return { range: c };
      a = h.from;
      let d = t.toText((s ? o.line(i++).text : e) + t.lineBreak);
      return {
        changes: { from: h.from, insert: d },
        range: E.cursor(c.from + d.length)
      };
    });
  } else s ? n = t.changeByRange((a) => {
    let c = o.line(i++);
    return {
      changes: { from: a.from, to: a.to, insert: c.text },
      range: E.cursor(a.from + c.length)
    };
  }) : n = t.replaceSelection(o);
  r.dispatch(n, {
    userEvent: "input.paste",
    scrollIntoView: !0
  });
}
Xe.scroll = (r) => {
  let e = r.inputState;
  e.lastScrollTop = r.scrollDOM.scrollTop, e.lastScrollLeft = r.scrollDOM.scrollLeft, I.ios && !e.touchActive && (e.lastIOSMomentumScroll = Date.now());
};
Xe.wheel = Xe.mousewheel = (r) => {
  r.inputState.lastWheelEvent = Date.now();
};
Rt.keydown = (r, e) => (r.inputState.setSelectionOrigin("select"), e.keyCode == 27 && r.inputState.tabFocusMode != 0 && (r.inputState.tabFocusMode = Date.now() + 2e3), !1);
Xe.touchstart = (r, e) => {
  let t = r.inputState, n = e.targetTouches[0];
  t.touchActive = !0, t.lastTouchTime = Date.now(), n && (t.lastTouchX = n.clientX, t.lastTouchY = n.clientY), t.setSelectionOrigin("select.pointer");
};
Xe.touchmove = (r) => {
  r.inputState.setSelectionOrigin("select.pointer");
};
Xe.touchend = (r, e) => {
  r.inputState.touchActive = !1;
};
Rt.mousedown = (r, e) => {
  if (r.observer.flush(), r.inputState.lastTouchTime > Date.now() - 2e3)
    return !1;
  let t = null;
  for (let n of r.state.facet(dd))
    if (t = n(r, e), t)
      break;
  if (!t && e.button == 0 && (t = Xy(r, e)), t) {
    let n = !r.hasFocus;
    r.inputState.startMouseSelection(new jy(r, e, t, n)), n && r.observer.ignore(() => {
      ed(r.contentDOM);
      let o = r.root.activeElement;
      o && !o.contains(r.contentDOM) && o.blur();
    });
    let i = r.inputState.mouseSelection;
    if (i)
      return i.start(e), i.dragging === !1;
  } else
    r.inputState.setSelectionOrigin("select.pointer");
  return !1;
};
function Ua(r, e, t, n) {
  if (n == 1)
    return E.cursor(e, t);
  if (n == 2)
    return Ay(r.state, e, t);
  {
    let i = r.docView.lineAt(e, t), o = r.state.doc.lineAt(i ? i.posAtEnd : e), s = i ? i.posAtStart : o.from, l = i ? i.posAtEnd : o.to;
    return l < r.state.doc.length && l == o.to && l++, E.undirectionalRange(s, l);
  }
}
const Jy = I.ie && I.ie_version <= 11;
let qa = null, Ya = 0, Ga = 0;
function Nd(r) {
  if (!Jy)
    return r.detail;
  let e = qa, t = Ga;
  return qa = r, Ga = Date.now(), Ya = !e || t > Date.now() - 400 && Math.abs(e.clientX - r.clientX) < 2 && Math.abs(e.clientY - r.clientY) < 2 ? (Ya + 1) % 3 : 1;
}
function Xy(r, e) {
  let t = r.posAndSideAtCoords({ x: e.clientX, y: e.clientY }, !1), n = Nd(e), i = r.state.selection;
  return {
    update(o) {
      o.docChanged && (t.pos = o.changes.mapPos(t.pos), i = i.map(o.changes));
    },
    get(o, s, l) {
      let a = r.posAndSideAtCoords({ x: o.clientX, y: o.clientY }, !1), c, h = Ua(r, a.pos, a.assoc, n);
      if (t.pos != a.pos && !s) {
        let d = Ua(r, t.pos, t.assoc, n), u = Math.min(d.from, h.from), f = Math.max(d.to, h.to);
        h = u < h.from ? E.range(u, f, h.assoc) : E.range(f, u, h.assoc);
      }
      return s ? i.replaceRange(i.main.extend(h.from, h.to, h.assoc)) : l && n == 1 && i.ranges.length > 1 && (c = Zy(i, a.pos)) ? c : l ? i.addRange(h) : E.create([h]);
    }
  };
}
function Zy(r, e) {
  for (let t = 0; t < r.ranges.length; t++) {
    let { from: n, to: i } = r.ranges[t];
    if (n <= e && i >= e)
      return E.create(r.ranges.slice(0, t).concat(r.ranges.slice(t + 1)), r.mainIndex == t ? 0 : r.mainIndex - (r.mainIndex > t ? 1 : 0));
  }
  return null;
}
Rt.dragstart = (r, e) => {
  let { selection: { main: t } } = r.state;
  if (e.target.draggable) {
    let i = r.docView.tile.nearest(e.target);
    if (i && i.isWidget()) {
      let o = i.posAtStart, s = o + i.length;
      (o >= t.to || s <= t.from) && (t = E.undirectionalRange(o, s));
    }
  }
  let { inputState: n } = r;
  return n.mouseSelection && (n.mouseSelection.dragging = !0), n.draggedContent = t, e.dataTransfer && (e.dataTransfer.setData("Text", bo(r.state, yl, r.state.sliceDoc(t.from, t.to))), e.dataTransfer.effectAllowed = "copyMove"), !1;
};
Rt.dragend = (r) => (r.inputState.draggedContent = null, !1);
function Ja(r, e, t, n) {
  if (t = bo(r.state, gl, t), !t)
    return;
  let i = r.posAtCoords({ x: e.clientX, y: e.clientY }, !1), { draggedContent: o } = r.inputState, s = n && o && Uy(r, e) ? { from: o.from, to: o.to } : null, l = { from: i, insert: t }, a = r.state.changes(s ? [s, l] : l);
  r.focus(), r.dispatch({
    changes: a,
    selection: { anchor: a.mapPos(i, -1), head: a.mapPos(i, 1) },
    userEvent: s ? "move.drop" : "input.drop"
  }), r.inputState.draggedContent = null;
}
Rt.drop = (r, e) => {
  if (!e.dataTransfer)
    return !1;
  if (r.state.readOnly)
    return !0;
  let t = e.dataTransfer.files;
  if (t && t.length) {
    let n = Array(t.length), i = 0, o = () => {
      ++i == t.length && Ja(r, e, n.filter((s) => s != null).join(r.state.lineBreak), !1);
    };
    for (let s = 0; s < t.length; s++) {
      let l = new FileReader();
      l.onerror = o, l.onload = () => {
        /[\x00-\x08\x0e-\x1f]{2}/.test(l.result) || (n[s] = l.result), o();
      }, l.readAsText(t[s]);
    }
    return !0;
  } else {
    let n = e.dataTransfer.getData("Text");
    if (n)
      return Ja(r, e, n, !0), !0;
  }
  return !1;
};
Rt.paste = (r, e) => {
  if (r.state.readOnly)
    return !0;
  r.observer.flush();
  let t = Ld ? null : e.clipboardData;
  return t ? (Rd(r, t.getData("text/plain") || t.getData("text/uri-list")), !0) : (Gy(r), !1);
};
function Qy(r, e) {
  let t = r.dom.parentNode;
  if (!t)
    return;
  let n = t.appendChild(document.createElement("textarea"));
  n.style.cssText = "position: fixed; left: -10000px; top: 10px", n.value = e, n.focus(), n.selectionEnd = e.length, n.selectionStart = 0, setTimeout(() => {
    n.remove(), r.focus();
  }, 50);
}
function ex(r) {
  let e = [], t = [], n = !1;
  for (let i of r.selection.ranges)
    i.empty || (e.push(r.sliceDoc(i.from, i.to)), t.push(i));
  if (!e.length) {
    let i = -1;
    for (let { from: o } of r.selection.ranges) {
      let s = r.doc.lineAt(o);
      s.number > i && (e.push(s.text), t.push({ from: s.from, to: Math.min(r.doc.length, s.to + 1) })), i = s.number;
    }
    n = !0;
  }
  return { text: bo(r, yl, e.join(r.lineBreak)), ranges: t, linewise: n };
}
let Hs = null;
Rt.copy = Rt.cut = (r, e) => {
  if (!Rr(r.contentDOM, r.observer.selectionRange))
    return !1;
  let { text: t, ranges: n, linewise: i } = ex(r.state);
  if (!t && !i)
    return !1;
  Hs = i ? t : null, e.type == "cut" && !r.state.readOnly && r.dispatch({
    changes: n,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
  let o = Ld ? null : e.clipboardData;
  return o ? (o.clearData(), o.setData("text/plain", t), !0) : (Qy(r, t), !1);
};
const Bd = /* @__PURE__ */ Sn.define();
function Id(r, e) {
  let t = [];
  for (let n of r.facet(pd)) {
    let i = n(r, e);
    i && t.push(i);
  }
  return t.length ? r.update({ effects: t, annotations: Bd.of(!0) }) : null;
}
function Pd(r) {
  setTimeout(() => {
    let e = r.hasFocus;
    if (e != r.inputState.notifiedFocused) {
      let t = Id(r.state, e);
      t ? r.dispatch(t) : r.update([]);
    }
  }, 10);
}
Xe.focus = (r) => {
  r.inputState.lastFocusTime = Date.now(), !r.scrollDOM.scrollTop && (r.inputState.lastScrollTop || r.inputState.lastScrollLeft) && (r.scrollDOM.scrollTop = r.inputState.lastScrollTop, r.scrollDOM.scrollLeft = r.inputState.lastScrollLeft), Pd(r);
};
Xe.blur = (r) => {
  r.observer.clearSelectionRange(), Pd(r);
};
Xe.compositionstart = Xe.compositionupdate = (r) => {
  r.observer.editContext || (r.inputState.compositionFirstChange == null && (r.inputState.compositionFirstChange = !0), r.inputState.composing < 0 && (r.inputState.composing = 0));
};
Xe.compositionend = (r) => {
  r.observer.editContext || (r.inputState.composing = -1, r.inputState.compositionEndedAt = Date.now(), r.inputState.compositionPendingKey = !0, r.inputState.compositionPendingChange = r.observer.pendingRecords().length > 0, r.inputState.compositionFirstChange = null, I.chrome && I.android ? r.observer.flushSoon() : r.inputState.compositionPendingChange ? Promise.resolve().then(() => r.observer.flush()) : setTimeout(() => {
    r.inputState.composing < 0 && r.docView.hasComposition && r.update([]);
  }, 50));
};
Xe.contextmenu = (r) => {
  r.inputState.lastContextMenu = Date.now();
};
Rt.beforeinput = (r, e) => {
  var t, n;
  if ((e.inputType == "insertText" || e.inputType == "insertCompositionText") && (r.inputState.insertingText = e.data, r.inputState.insertingTextAt = Date.now()), e.inputType == "insertReplacementText" && r.observer.editContext) {
    let o = (t = e.dataTransfer) === null || t === void 0 ? void 0 : t.getData("text/plain"), s = e.getTargetRanges();
    if (o && s.length) {
      let l = s[0], a = r.posAtDOM(l.startContainer, l.startOffset), c = r.posAtDOM(l.endContainer, l.endOffset);
      return wl(r, { from: a, to: c, insert: r.state.toText(o) }, null), !0;
    }
  }
  let i;
  if (I.chrome && I.android && (i = Ed.find((o) => o.inputType == e.inputType)) && (r.observer.delayAndroidKey(i.key, i.keyCode), i.key == "Backspace" || i.key == "Delete")) {
    let o = ((n = window.visualViewport) === null || n === void 0 ? void 0 : n.height) || 0;
    setTimeout(() => {
      var s;
      (((s = window.visualViewport) === null || s === void 0 ? void 0 : s.height) || 0) > o + 10 && r.hasFocus && (r.contentDOM.blur(), r.focus());
    }, 100);
  }
  return I.ios && e.inputType == "deleteContentForward" && r.observer.flushSoon(), I.safari && e.inputType == "insertText" && r.inputState.composing >= 0 && setTimeout(() => Xe.compositionend(r, e), 20), !1;
};
const Xa = /* @__PURE__ */ new Set();
function tx(r) {
  Xa.has(r) || (Xa.add(r), r.addEventListener("copy", () => {
  }), r.addEventListener("cut", () => {
  }));
}
const Za = ["pre-wrap", "normal", "pre-line", "break-spaces"];
let fr = !1;
function Qa() {
  fr = !1;
}
class nx {
  constructor(e) {
    this.lineWrapping = e, this.doc = se.empty, this.heightSamples = {}, this.lineHeight = 14, this.charWidth = 7, this.textHeight = 14, this.lineLength = 30;
  }
  heightForGap(e, t) {
    let n = this.doc.lineAt(t).number - this.doc.lineAt(e).number + 1;
    return this.lineWrapping && (n += Math.max(0, Math.ceil((t - e - n * this.lineLength * 0.5) / this.lineLength))), this.lineHeight * n;
  }
  heightForLine(e) {
    return this.lineWrapping ? (1 + Math.max(0, Math.ceil((e - this.lineLength) / Math.max(1, this.lineLength - 5)))) * this.lineHeight : this.lineHeight;
  }
  setDoc(e) {
    return this.doc = e, this;
  }
  mustRefreshForWrapping(e) {
    return Za.indexOf(e) > -1 != this.lineWrapping;
  }
  mustRefreshForHeights(e) {
    let t = !1;
    for (let n = 0; n < e.length; n++) {
      let i = e[n];
      i < 0 ? n++ : this.heightSamples[Math.floor(i * 10)] || (t = !0, this.heightSamples[Math.floor(i * 10)] = !0);
    }
    return t;
  }
  refresh(e, t, n, i, o, s) {
    let l = Za.indexOf(e) > -1, a = Math.abs(t - this.lineHeight) > 0.3 || this.lineWrapping != l;
    if (this.lineWrapping = l, this.lineHeight = t, this.charWidth = n, this.textHeight = i, this.lineLength = o, a) {
      this.heightSamples = {};
      for (let c = 0; c < s.length; c++) {
        let h = s[c];
        h < 0 ? c++ : this.heightSamples[Math.floor(h * 10)] = !0;
      }
    }
    return a;
  }
}
class rx {
  constructor(e, t) {
    this.from = e, this.heights = t, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class Ot {
  /**
  @internal
  */
  constructor(e, t, n, i, o) {
    this.from = e, this.length = t, this.top = n, this.height = i, this._content = o;
  }
  /**
  The type of element this is. When querying lines, this may be
  an array of all the blocks that make up the line.
  */
  get type() {
    return typeof this._content == "number" ? nt.Text : Array.isArray(this._content) ? this._content : this._content.type;
  }
  /**
  The end of the element as a document position.
  */
  get to() {
    return this.from + this.length;
  }
  /**
  The bottom position of the element.
  */
  get bottom() {
    return this.top + this.height;
  }
  /**
  If this is a widget block, this will return the widget
  associated with it.
  */
  get widget() {
    return this._content instanceof Vn ? this._content.widget : null;
  }
  /**
  If this is a textblock, this holds the number of line breaks
  that appear in widgets inside the block.
  */
  get widgetLineBreaks() {
    return typeof this._content == "number" ? this._content : 0;
  }
  /**
  @internal
  */
  join(e) {
    let t = (Array.isArray(this._content) ? this._content : [this]).concat(Array.isArray(e._content) ? e._content : [e]);
    return new Ot(this.from, this.length + e.length, this.top, this.height + e.height, t);
  }
}
var pe = /* @__PURE__ */ function(r) {
  return r[r.ByPos = 0] = "ByPos", r[r.ByHeight = 1] = "ByHeight", r[r.ByPosNoHeight = 2] = "ByPosNoHeight", r;
}(pe || (pe = {}));
const $i = 1e-3;
class Je {
  constructor(e, t, n = 2) {
    this.length = e, this.height = t, this.flags = n;
  }
  get outdated() {
    return (this.flags & 2) > 0;
  }
  set outdated(e) {
    this.flags = (e ? 2 : 0) | this.flags & -3;
  }
  setHeight(e) {
    this.height != e && (Math.abs(this.height - e) > $i && (fr = !0), this.height = e);
  }
  // Base case is to replace a leaf node, which simply builds a tree
  // from the new nodes and returns that (HeightMapBranch and
  // HeightMapGap override this to actually use from/to)
  replace(e, t, n) {
    return Je.of(n);
  }
  // Again, these are base cases, and are overridden for branch and gap nodes.
  decomposeLeft(e, t) {
    t.push(this);
  }
  decomposeRight(e, t) {
    t.push(this);
  }
  applyChanges(e, t, n, i) {
    let o = this, s = n.doc;
    for (let l = i.length - 1; l >= 0; l--) {
      let { fromA: a, toA: c, fromB: h, toB: d } = i[l], u = o.lineAt(a, pe.ByPosNoHeight, n.setDoc(t), 0, 0), f = u.to >= c ? u : o.lineAt(c, pe.ByPosNoHeight, n, 0, 0);
      for (d += f.to - c, c = f.to; l > 0 && u.from <= i[l - 1].toA; )
        a = i[l - 1].fromA, h = i[l - 1].fromB, l--, a < u.from && (u = o.lineAt(a, pe.ByPosNoHeight, n, 0, 0));
      h += u.from - a, a = u.from;
      let g = vl.build(n.setDoc(s), e, h, d);
      o = no(o, o.replace(a, c, g));
    }
    return o.updateHeight(n, 0);
  }
  static empty() {
    return new at(0, 0, 0);
  }
  // nodes uses null values to indicate the position of line breaks.
  // There are never line breaks at the start or end of the array, or
  // two line breaks next to each other, and the array isn't allowed
  // to be empty (same restrictions as return value from the builder).
  static of(e) {
    if (e.length == 1)
      return e[0];
    let t = 0, n = e.length, i = 0, o = 0;
    for (; ; )
      if (t == n)
        if (i > o * 2) {
          let l = e[t - 1];
          l.break ? e.splice(--t, 1, l.left, null, l.right) : e.splice(--t, 1, l.left, l.right), n += 1 + l.break, i -= l.size;
        } else if (o > i * 2) {
          let l = e[n];
          l.break ? e.splice(n, 1, l.left, null, l.right) : e.splice(n, 1, l.left, l.right), n += 2 + l.break, o -= l.size;
        } else
          break;
      else if (i < o) {
        let l = e[t++];
        l && (i += l.size);
      } else {
        let l = e[--n];
        l && (o += l.size);
      }
    let s = 0;
    return e[t - 1] == null ? (s = 1, t--) : e[t] == null && (s = 1, n++), new ox(Je.of(e.slice(0, t)), s, Je.of(e.slice(n)));
  }
}
function no(r, e) {
  return r == e ? r : (r.constructor != e.constructor && (fr = !0), e);
}
Je.prototype.size = 1;
const ix = /* @__PURE__ */ te.replace({});
class $d extends Je {
  constructor(e, t, n) {
    super(e, t), this.deco = n, this.spaceAbove = 0;
  }
  mainBlock(e, t) {
    return new Ot(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.deco || 0);
  }
  blockAt(e, t, n, i) {
    return this.spaceAbove && e < n + this.spaceAbove ? new Ot(i, 0, n, this.spaceAbove, ix) : this.mainBlock(n, i);
  }
  lineAt(e, t, n, i, o) {
    let s = this.mainBlock(i, o);
    return this.spaceAbove ? this.blockAt(0, n, i, o).join(s) : s;
  }
  forEachLine(e, t, n, i, o, s) {
    e <= o + this.length && t >= o && s(this.lineAt(0, pe.ByPos, n, i, o));
  }
  setMeasuredHeight(e) {
    let t = e.heights[e.index++];
    t < 0 ? (this.spaceAbove = -t, t = e.heights[e.index++]) : this.spaceAbove = 0, this.setHeight(t);
  }
  updateHeight(e, t = 0, n = !1, i) {
    return i && i.from <= t && i.more && this.setMeasuredHeight(i), this.outdated = !1, this;
  }
  toString() {
    return `block(${this.length})`;
  }
}
class at extends $d {
  constructor(e, t, n) {
    super(e, t, null), this.collapsed = 0, this.widgetHeight = 0, this.breaks = 0, this.spaceAbove = n;
  }
  mainBlock(e, t) {
    return new Ot(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.breaks);
  }
  replace(e, t, n) {
    let i = n[0];
    return n.length == 1 && (i instanceof at || i instanceof Fe && i.flags & 4) && Math.abs(this.length - i.length) < 10 ? (i instanceof Fe ? i = new at(i.length, this.height, this.spaceAbove) : i.height = this.height, this.outdated || (i.outdated = !1), i) : Je.of(n);
  }
  updateHeight(e, t = 0, n = !1, i) {
    return i && i.from <= t && i.more ? this.setMeasuredHeight(i) : (n || this.outdated) && (this.spaceAbove = 0, this.setHeight(Math.max(this.widgetHeight, e.heightForLine(this.length - this.collapsed)) + this.breaks * e.lineHeight)), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class Fe extends Je {
  constructor(e) {
    super(e, 0);
  }
  heightMetrics(e, t) {
    let n = e.doc.lineAt(t).number, i = e.doc.lineAt(t + this.length).number, o = i - n + 1, s, l = 0;
    if (e.lineWrapping) {
      let a = Math.min(this.height, e.lineHeight * o);
      s = a / o, this.length > o + 1 && (l = (this.height - a) / (this.length - o - 1));
    } else
      s = this.height / o;
    return { firstLine: n, lastLine: i, perLine: s, perChar: l };
  }
  blockAt(e, t, n, i) {
    let { firstLine: o, lastLine: s, perLine: l, perChar: a } = this.heightMetrics(t, i);
    if (t.lineWrapping) {
      let c = i + (e < t.lineHeight ? 0 : Math.round(Math.max(0, Math.min(1, (e - n) / this.height)) * this.length)), h = t.doc.lineAt(c), d = l + h.length * a, u = Math.max(n, e - d / 2);
      return new Ot(h.from, h.length, u, d, 0);
    } else {
      let c = Math.max(0, Math.min(s - o, Math.floor((e - n) / l))), { from: h, length: d } = t.doc.line(o + c);
      return new Ot(h, d, n + l * c, l, 0);
    }
  }
  lineAt(e, t, n, i, o) {
    if (t == pe.ByHeight)
      return this.blockAt(e, n, i, o);
    if (t == pe.ByPosNoHeight) {
      let { from: f, to: g } = n.doc.lineAt(e);
      return new Ot(f, g - f, 0, 0, 0);
    }
    let { firstLine: s, perLine: l, perChar: a } = this.heightMetrics(n, o), c = n.doc.lineAt(e), h = l + c.length * a, d = c.number - s, u = i + l * d + a * (c.from - o - d);
    return new Ot(c.from, c.length, Math.max(i, Math.min(u, i + this.height - h)), h, 0);
  }
  forEachLine(e, t, n, i, o, s) {
    e = Math.max(e, o), t = Math.min(t, o + this.length);
    let { firstLine: l, perLine: a, perChar: c } = this.heightMetrics(n, o);
    for (let h = e, d = i; h <= t; ) {
      let u = n.doc.lineAt(h);
      if (h == e) {
        let g = u.number - l;
        d += a * g + c * (e - o - g);
      }
      let f = a + c * u.length;
      s(new Ot(u.from, u.length, d, f, 0)), d += f, h = u.to + 1;
    }
  }
  replace(e, t, n) {
    let i = this.length - t;
    if (i > 0) {
      let o = n[n.length - 1];
      o instanceof Fe ? n[n.length - 1] = new Fe(o.length + i) : n.push(null, new Fe(i - 1));
    }
    if (e > 0) {
      let o = n[0];
      o instanceof Fe ? n[0] = new Fe(e + o.length) : n.unshift(new Fe(e - 1), null);
    }
    return Je.of(n);
  }
  decomposeLeft(e, t) {
    t.push(new Fe(e - 1), null);
  }
  decomposeRight(e, t) {
    t.push(null, new Fe(this.length - e - 1));
  }
  updateHeight(e, t = 0, n = !1, i) {
    let o = t + this.length;
    if (i && i.from <= t + this.length && i.more) {
      let s = [], l = Math.max(t, i.from), a = -1;
      for (i.from > t && s.push(new Fe(i.from - t - 1).updateHeight(e, t)); l <= o && i.more; ) {
        let h = e.doc.lineAt(l).length;
        s.length && s.push(null);
        let d = i.heights[i.index++], u = 0;
        d < 0 && (u = -d, d = i.heights[i.index++]), a == -1 ? a = d : Math.abs(d - a) >= $i && (a = -2);
        let f = new at(h, d, u);
        f.outdated = !1, s.push(f), l += h + 1;
      }
      l <= o && s.push(null, new Fe(o - l).updateHeight(e, l));
      let c = Je.of(s);
      return (a < 0 || Math.abs(c.height - this.height) >= $i || Math.abs(a - this.heightMetrics(e, t).perLine) >= $i) && (fr = !0), no(this, c);
    } else (n || this.outdated) && (this.setHeight(e.heightForGap(t, t + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class ox extends Je {
  constructor(e, t, n) {
    super(e.length + t + n.length, e.height + n.height, t | (e.outdated || n.outdated ? 2 : 0)), this.left = e, this.right = n, this.size = e.size + n.size;
  }
  get break() {
    return this.flags & 1;
  }
  blockAt(e, t, n, i) {
    let o = n + this.left.height;
    return e < o ? this.left.blockAt(e, t, n, i) : this.right.blockAt(e, t, o, i + this.left.length + this.break);
  }
  lineAt(e, t, n, i, o) {
    let s = i + this.left.height, l = o + this.left.length + this.break, a = t == pe.ByHeight ? e < s : e < l, c = a ? this.left.lineAt(e, t, n, i, o) : this.right.lineAt(e, t, n, s, l);
    if (this.break || (a ? c.to < l : c.from > l))
      return c;
    let h = t == pe.ByPosNoHeight ? pe.ByPosNoHeight : pe.ByPos;
    return a ? c.join(this.right.lineAt(l, h, n, s, l)) : this.left.lineAt(l, h, n, i, o).join(c);
  }
  forEachLine(e, t, n, i, o, s) {
    let l = i + this.left.height, a = o + this.left.length + this.break;
    if (this.break)
      e < a && this.left.forEachLine(e, t, n, i, o, s), t >= a && this.right.forEachLine(e, t, n, l, a, s);
    else {
      let c = this.lineAt(a, pe.ByPos, n, i, o);
      e < c.from && this.left.forEachLine(e, c.from - 1, n, i, o, s), c.to >= e && c.from <= t && s(c), t > c.to && this.right.forEachLine(c.to + 1, t, n, l, a, s);
    }
  }
  replace(e, t, n) {
    let i = this.left.length + this.break;
    if (t < i)
      return this.balanced(this.left.replace(e, t, n), this.right);
    if (e > this.left.length)
      return this.balanced(this.left, this.right.replace(e - i, t - i, n));
    let o = [];
    e > 0 && this.decomposeLeft(e, o);
    let s = o.length;
    for (let l of n)
      o.push(l);
    if (e > 0 && ec(o, s - 1), t < this.length) {
      let l = o.length;
      this.decomposeRight(t, o), ec(o, l);
    }
    return Je.of(o);
  }
  decomposeLeft(e, t) {
    let n = this.left.length;
    if (e <= n)
      return this.left.decomposeLeft(e, t);
    t.push(this.left), this.break && (n++, e >= n && t.push(null)), e > n && this.right.decomposeLeft(e - n, t);
  }
  decomposeRight(e, t) {
    let n = this.left.length, i = n + this.break;
    if (e >= i)
      return this.right.decomposeRight(e - i, t);
    e < n && this.left.decomposeRight(e, t), this.break && e < i && t.push(null), t.push(this.right);
  }
  balanced(e, t) {
    return e.size > 2 * t.size || t.size > 2 * e.size ? Je.of(this.break ? [e, null, t] : [e, t]) : (this.left = no(this.left, e), this.right = no(this.right, t), this.setHeight(e.height + t.height), this.outdated = e.outdated || t.outdated, this.size = e.size + t.size, this.length = e.length + this.break + t.length, this);
  }
  updateHeight(e, t = 0, n = !1, i) {
    let { left: o, right: s } = this, l = t + o.length + this.break, a = null;
    return i && i.from <= t + o.length && i.more ? a = o = o.updateHeight(e, t, n, i) : o.updateHeight(e, t, n), i && i.from <= l + s.length && i.more ? a = s = s.updateHeight(e, l, n, i) : s.updateHeight(e, l, n), a ? this.balanced(o, s) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function ec(r, e) {
  let t, n;
  r[e] == null && (t = r[e - 1]) instanceof Fe && (n = r[e + 1]) instanceof Fe && r.splice(e - 1, 3, new Fe(t.length + 1 + n.length));
}
const sx = 5;
class vl {
  constructor(e, t) {
    this.pos = e, this.oracle = t, this.nodes = [], this.lineStart = -1, this.lineEnd = -1, this.covering = null, this.writtenTo = e;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(e, t) {
    if (this.lineStart > -1) {
      let n = Math.min(t, this.lineEnd), i = this.nodes[this.nodes.length - 1];
      i instanceof at ? i.length += n - this.pos : (n > this.pos || !this.isCovered) && this.nodes.push(new at(n - this.pos, -1, 0)), this.writtenTo = n, t > n && (this.nodes.push(null), this.writtenTo++, this.lineStart = -1);
    }
    this.pos = t;
  }
  point(e, t, n) {
    if (e < t || n.heightRelevant) {
      let i = n.widget ? n.widget.estimatedHeight : 0, o = n.widget ? n.widget.lineBreaks : 0;
      i < 0 && (i = this.oracle.lineHeight);
      let s = t - e;
      n.block ? this.addBlock(new $d(s, i, n)) : (s || o || i >= sx) && this.addLineDeco(i, o, s);
    } else t > e && this.span(e, t);
    this.lineEnd > -1 && this.lineEnd < this.pos && (this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from: e, to: t } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = e, this.lineEnd = t, this.writtenTo < e && ((this.writtenTo < e - 1 || this.nodes[this.nodes.length - 1] == null) && this.nodes.push(this.blankContent(this.writtenTo, e - 1)), this.nodes.push(null)), this.pos > e && this.nodes.push(new at(this.pos - e, -1, 0)), this.writtenTo = this.pos;
  }
  blankContent(e, t) {
    let n = new Fe(t - e);
    return this.oracle.doc.lineAt(e).to == t && (n.flags |= 4), n;
  }
  ensureLine() {
    this.enterLine();
    let e = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (e instanceof at)
      return e;
    let t = new at(0, -1, 0);
    return this.nodes.push(t), t;
  }
  addBlock(e) {
    this.enterLine();
    let t = e.deco;
    t && t.startSide > 0 && !this.isCovered && this.ensureLine(), this.nodes.push(e), this.writtenTo = this.pos = this.pos + e.length, t && t.endSide > 0 && (this.covering = e);
  }
  addLineDeco(e, t, n) {
    let i = this.ensureLine();
    i.length += n, i.collapsed += n, i.widgetHeight = Math.max(i.widgetHeight, e), i.breaks += t, this.writtenTo = this.pos = this.pos + n;
  }
  finish(e) {
    let t = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
    this.lineStart > -1 && !(t instanceof at) && !this.isCovered ? this.nodes.push(new at(0, -1, 0)) : (this.writtenTo < this.pos || t == null) && this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let n = e;
    for (let i of this.nodes)
      i instanceof at && i.updateHeight(this.oracle, n), n += i ? i.length : 1;
    return this.nodes;
  }
  // Always called with a region that on both sides either stretches
  // to a line break or the end of the document.
  // The returned array uses null to indicate line breaks, but never
  // starts or ends in a line break, or has multiple line breaks next
  // to each other.
  static build(e, t, n, i) {
    let o = new vl(n, e);
    return oe.spans(t, n, i, o, 0), o.finish(n);
  }
}
function lx(r, e, t) {
  let n = new ax();
  return oe.compare(r, e, t, n, 0), n.changes;
}
class ax {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(e, t, n, i) {
    (e < t || n && n.heightRelevant || i && i.heightRelevant) && or(e, t, this.changes, 5);
  }
}
function cx(r, e) {
  let t = r.getBoundingClientRect(), n = r.ownerDocument, i = n.defaultView || window, o = Math.max(0, t.left), s = Math.min(i.innerWidth, t.right), l = Math.max(0, t.top), a = Math.min(i.innerHeight, t.bottom);
  for (let c = r.parentNode; c && c != n.body; )
    if (c.nodeType == 1) {
      let h = c, d = window.getComputedStyle(h);
      if ((h.scrollHeight > h.clientHeight || h.scrollWidth > h.clientWidth) && d.overflow != "visible") {
        let u = h.getBoundingClientRect();
        o = Math.max(o, u.left), s = Math.min(s, u.right), l = Math.max(l, u.top), a = Math.min(c == r.parentNode ? i.innerHeight : a, u.bottom);
      }
      c = d.position == "absolute" || d.position == "fixed" ? h.offsetParent : h.parentNode;
    } else if (c.nodeType == 11)
      c = c.host;
    else
      break;
  return {
    left: o - t.left,
    right: Math.max(o, s) - t.left,
    top: l - (t.top + e),
    bottom: Math.max(l, a) - (t.top + e)
  };
}
function hx(r) {
  let e = r.getBoundingClientRect(), t = r.ownerDocument.defaultView || window;
  return e.left < t.innerWidth && e.right > 0 && e.top < t.innerHeight && e.bottom > 0;
}
function dx(r, e) {
  let t = r.getBoundingClientRect();
  return {
    left: 0,
    right: t.right - t.left,
    top: e,
    bottom: t.bottom - (t.top + e)
  };
}
class Vo {
  constructor(e, t, n, i) {
    this.from = e, this.to = t, this.size = n, this.displaySize = i;
  }
  static same(e, t) {
    if (e.length != t.length)
      return !1;
    for (let n = 0; n < e.length; n++) {
      let i = e[n], o = t[n];
      if (i.from != o.from || i.to != o.to || i.size != o.size)
        return !1;
    }
    return !0;
  }
  draw(e, t) {
    return te.replace({
      widget: new ux(this.displaySize * (t ? e.scaleY : e.scaleX), t)
    }).range(this.from, this.to);
  }
}
class ux extends qn {
  constructor(e, t) {
    super(), this.size = e, this.vertical = t;
  }
  eq(e) {
    return e.size == this.size && e.vertical == this.vertical;
  }
  toDOM() {
    let e = document.createElement("div");
    return this.vertical ? e.style.height = this.size + "px" : (e.style.width = this.size + "px", e.style.height = "2px", e.style.display = "inline-block"), e;
  }
  get estimatedHeight() {
    return this.vertical ? this.size : -1;
  }
}
class tc {
  constructor(e, t) {
    this.view = e, this.state = t, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.scaleX = 1, this.scaleY = 1, this.scrollOffset = 0, this.scrolledToBottom = !1, this.scrollAnchorPos = 0, this.scrollAnchorHeight = -1, this.scaler = nc, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = Ee.LTR, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1;
    let n = t.facet(xl).some((i) => typeof i != "function" && i.class == "cm-lineWrapping");
    this.heightOracle = new nx(n), this.stateDeco = rc(t), this.heightMap = Je.empty().applyChanges(this.stateDeco, se.empty, this.heightOracle.setDoc(t.doc), [new mt(0, 0, 0, t.doc.length)]);
    for (let i = 0; i < 2 && (this.viewport = this.getViewport(0, null), !!this.updateForViewport()); i++)
      ;
    this.updateViewportLines(), this.lineGaps = this.ensureLineGaps([]), this.lineGapDeco = te.set(this.lineGaps.map((i) => i.draw(this, !1))), this.scrollParent = e.scrollDOM, this.computeVisibleRanges();
  }
  updateForViewport() {
    let e = [this.viewport], { main: t } = this.state.selection;
    for (let n = 0; n <= 1; n++) {
      let i = n ? t.head : t.anchor;
      if (!e.some(({ from: o, to: s }) => i >= o && i <= s)) {
        let { from: o, to: s } = this.lineBlockAt(i);
        e.push(new ki(o, s));
      }
    }
    return this.viewports = e.sort((n, i) => n.from - i.from), this.updateScaler();
  }
  updateScaler() {
    let e = this.scaler;
    return this.scaler = this.heightMap.height <= 7e6 ? nc : new kl(this.heightOracle, this.heightMap, this.viewports), e.eq(this.scaler) ? 0 : 2;
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (e) => {
      this.viewportLines.push(Er(e, this.scaler));
    });
  }
  update(e, t = null) {
    this.state = e.state;
    let n = this.stateDeco;
    this.stateDeco = rc(this.state);
    let i = e.changedRanges, o = mt.extendWithRanges(i, lx(n, this.stateDeco, e ? e.changes : Ne.empty(this.state.doc.length))), s = this.heightMap.height, l = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollOffset);
    Qa(), this.heightMap = this.heightMap.applyChanges(this.stateDeco, e.startState.doc, this.heightOracle.setDoc(this.state.doc), o), (this.heightMap.height != s || fr) && (e.flags |= 2), l ? (this.scrollAnchorPos = e.changes.mapPos(l.from, -1), this.scrollAnchorHeight = l.top) : (this.scrollAnchorPos = -1, this.scrollAnchorHeight = s);
    let a = o.length ? this.mapViewport(this.viewport, e.changes) : this.viewport;
    (t && (t.range.head < a.from || t.range.head > a.to) || !this.viewportIsAppropriate(a)) && (a = this.getViewport(0, t));
    let c = a.from != this.viewport.from || a.to != this.viewport.to;
    this.viewport = a, e.flags |= this.updateForViewport(), (c || !e.changes.empty || e.flags & 2) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes))), e.flags |= this.computeVisibleRanges(e.changes), t && (this.scrollTarget = t), !this.mustEnforceCursorAssoc && (e.selectionSet || e.focusChanged) && e.view.lineWrapping && e.state.selection.main.empty && e.state.selection.main.assoc && !e.state.facet(ny) && (this.mustEnforceCursorAssoc = !0);
  }
  measure() {
    let { view: e } = this, t = e.contentDOM, n = window.getComputedStyle(t), i = this.heightOracle, o = n.whiteSpace;
    this.defaultTextDirection = n.direction == "rtl" ? Ee.RTL : Ee.LTR;
    let s = this.heightOracle.mustRefreshForWrapping(o) || this.mustMeasureContent === "refresh", l = t.getBoundingClientRect(), a = s || this.mustMeasureContent || this.contentDOMHeight != l.height;
    this.contentDOMHeight = l.height, this.mustMeasureContent = !1;
    let c = 0, h = 0;
    if (l.width && l.height) {
      let { scaleX: A, scaleY: T } = Zh(t, l);
      (A > 5e-3 && Math.abs(this.scaleX - A) > 5e-3 || T > 5e-3 && Math.abs(this.scaleY - T) > 5e-3) && (this.scaleX = A, this.scaleY = T, c |= 16, s = a = !0);
    }
    let d = (parseInt(n.paddingTop) || 0) * this.scaleY, u = (parseInt(n.paddingBottom) || 0) * this.scaleY;
    (this.paddingTop != d || this.paddingBottom != u) && (this.paddingTop = d, this.paddingBottom = u, c |= 18), this.editorWidth != e.scrollDOM.clientWidth && (i.lineWrapping && (a = !0), this.editorWidth = e.scrollDOM.clientWidth, c |= 16);
    let f = Qh(this.view.contentDOM, !1).y;
    f != this.scrollParent && (this.scrollParent = f, this.scrollAnchorHeight = -1, this.scrollOffset = 0);
    let g = this.getScrollOffset();
    this.scrollOffset != g && (this.scrollAnchorHeight = -1, this.scrollOffset = g), this.scrolledToBottom = td(this.scrollParent || e.win);
    let w = (this.printing ? dx : cx)(t, this.paddingTop), k = w.top - this.pixelViewport.top, v = w.bottom - this.pixelViewport.bottom;
    this.pixelViewport = w;
    let D = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (D != this.inView && (this.inView = D, D && (a = !0)), !this.inView && !this.scrollTarget && !hx(e.dom))
      return 0;
    let N = l.width;
    if ((this.contentDOMWidth != N || this.editorHeight != e.scrollDOM.clientHeight) && (this.contentDOMWidth = l.width, this.editorHeight = e.scrollDOM.clientHeight, c |= 16), a) {
      let A = e.docView.measureVisibleLineHeights(this.viewport);
      if (i.mustRefreshForHeights(A) && (s = !0), s || i.lineWrapping && Math.abs(N - this.contentDOMWidth) > i.charWidth) {
        let { lineHeight: T, charWidth: S, textHeight: B } = e.docView.measureTextSize();
        s = T > 0 && i.refresh(o, T, S, B, Math.max(5, N / S), A), s && (e.docView.minWidth = 0, c |= 16);
      }
      k > 0 && v > 0 ? h = Math.max(k, v) : k < 0 && v < 0 && (h = Math.min(k, v)), Qa();
      for (let T of this.viewports) {
        let S = T.from == this.viewport.from ? A : e.docView.measureVisibleLineHeights(T);
        this.heightMap = (s ? Je.empty().applyChanges(this.stateDeco, se.empty, this.heightOracle, [new mt(0, 0, 0, e.state.doc.length)]) : this.heightMap).updateHeight(i, 0, s, new rx(T.from, S));
      }
      fr && (c |= 2);
    }
    let Y = !this.viewportIsAppropriate(this.viewport, h) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    return Y && (c & 2 && (c |= this.updateScaler()), this.viewport = this.getViewport(h, this.scrollTarget), c |= this.updateForViewport()), (c & 2 || Y) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(s ? [] : this.lineGaps, e)), c |= this.computeVisibleRanges(), this.mustEnforceCursorAssoc && (this.mustEnforceCursorAssoc = !1, e.docView.enforceCursorAssoc()), c;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(e, t) {
    let n = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)), i = this.heightMap, o = this.heightOracle, { visibleTop: s, visibleBottom: l } = this, a = new ki(i.lineAt(s - n * 1e3, pe.ByHeight, o, 0, 0).from, i.lineAt(l + (1 - n) * 1e3, pe.ByHeight, o, 0, 0).to);
    if (t) {
      let { head: c } = t.range;
      if (c < a.from || c > a.to) {
        let h = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), d = i.lineAt(c, pe.ByPos, o, 0, 0), u;
        t.y == "center" ? u = (d.top + d.bottom) / 2 - h / 2 : t.y == "start" || t.y == "nearest" && c < a.from ? u = d.top : u = d.bottom - h, a = new ki(i.lineAt(u - 1e3 / 2, pe.ByHeight, o, 0, 0).from, i.lineAt(u + h + 1e3 / 2, pe.ByHeight, o, 0, 0).to);
      }
    }
    return a;
  }
  mapViewport(e, t) {
    let n = t.mapPos(e.from, -1), i = t.mapPos(e.to, 1);
    return new ki(this.heightMap.lineAt(n, pe.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(i, pe.ByPos, this.heightOracle, 0, 0).to);
  }
  // Checks if a given viewport covers the visible part of the
  // document and not too much beyond that.
  viewportIsAppropriate({ from: e, to: t }, n = 0) {
    if (!this.inView)
      return !0;
    let { top: i } = this.heightMap.lineAt(e, pe.ByPos, this.heightOracle, 0, 0), { bottom: o } = this.heightMap.lineAt(t, pe.ByPos, this.heightOracle, 0, 0), { visibleTop: s, visibleBottom: l } = this;
    return (e == 0 || i <= s - Math.max(10, Math.min(
      -n,
      250
      /* VP.MaxCoverMargin */
    ))) && (t == this.state.doc.length || o >= l + Math.max(10, Math.min(
      n,
      250
      /* VP.MaxCoverMargin */
    ))) && i > s - 2 * 1e3 && o < l + 2 * 1e3;
  }
  mapLineGaps(e, t) {
    if (!e.length || t.empty)
      return e;
    let n = [];
    for (let i of e)
      t.touchesRange(i.from, i.to) || n.push(new Vo(t.mapPos(i.from), t.mapPos(i.to), i.size, i.displaySize));
    return n;
  }
  // Computes positions in the viewport where the start or end of a
  // line should be hidden, trying to reuse existing line gaps when
  // appropriate to avoid unneccesary redraws.
  // Uses crude character-counting for the positioning and sizing,
  // since actual DOM coordinates aren't always available and
  // predictable. Relies on generous margins (see LG.Margin) to hide
  // the artifacts this might produce from the user.
  ensureLineGaps(e, t) {
    let n = this.heightOracle.lineWrapping, i = n ? 1e4 : 2e3, o = i >> 1, s = i << 1;
    if (this.defaultTextDirection != Ee.LTR && !n)
      return [];
    let l = [], a = (h, d, u, f) => {
      if (d - h < o)
        return;
      let g = this.state.selection.main, w = [g.from];
      g.empty || w.push(g.to);
      for (let v of w)
        if (v > h && v < d) {
          a(h, v - 10, u, f), a(v + 10, d, u, f);
          return;
        }
      let k = px(e, (v) => v.from >= u.from && v.to <= u.to && Math.abs(v.from - h) < o && Math.abs(v.to - d) < o && !w.some((D) => v.from < D && v.to > D));
      if (!k) {
        if (d < u.to && t && n && t.visibleRanges.some((N) => N.from <= d && N.to >= d)) {
          let N = t.moveToLineBoundary(E.cursor(d), !1, !0).head;
          N > h && (d = N);
        }
        let v = this.gapSize(u, h, d, f), D = n || v < 2e6 ? v : 2e6;
        k = new Vo(h, d, v, D);
      }
      l.push(k);
    }, c = (h) => {
      if (h.length < s || h.type != nt.Text)
        return;
      let d = fx(h.from, h.to, this.stateDeco);
      if (d.total < s)
        return;
      let u = this.scrollTarget ? this.scrollTarget.range.head : null, f, g;
      if (n) {
        let w = i / this.heightOracle.lineLength * this.heightOracle.lineHeight, k, v;
        if (u != null) {
          let D = Ci(d, u), N = ((this.visibleBottom - this.visibleTop) / 2 + w) / h.height;
          k = D - N, v = D + N;
        } else
          k = (this.visibleTop - h.top - w) / h.height, v = (this.visibleBottom - h.top + w) / h.height;
        f = Si(d, k), g = Si(d, v);
      } else {
        let w = d.total * this.heightOracle.charWidth, k = i * this.heightOracle.charWidth, v = 0;
        if (w > 2e6)
          for (let T of e)
            T.from >= h.from && T.from < h.to && T.size != T.displaySize && T.from * this.heightOracle.charWidth + v < this.pixelViewport.left && (v = T.size - T.displaySize);
        let D = this.pixelViewport.left + v, N = this.pixelViewport.right + v, Y, A;
        if (u != null) {
          let T = Ci(d, u), S = ((N - D) / 2 + k) / w;
          Y = T - S, A = T + S;
        } else
          Y = (D - k) / w, A = (N + k) / w;
        f = Si(d, Y), g = Si(d, A);
      }
      f > h.from && a(h.from, f, h, d), g < h.to && a(g, h.to, h, d);
    };
    for (let h of this.viewportLines)
      Array.isArray(h.type) ? h.type.forEach(c) : c(h);
    return l;
  }
  gapSize(e, t, n, i) {
    let o = Ci(i, n) - Ci(i, t);
    return this.heightOracle.lineWrapping ? e.height * o : i.total * this.heightOracle.charWidth * o;
  }
  updateLineGaps(e) {
    Vo.same(e, this.lineGaps) || (this.lineGaps = e, this.lineGapDeco = te.set(e.map((t) => t.draw(this, this.heightOracle.lineWrapping))));
  }
  computeVisibleRanges(e) {
    let t = this.stateDeco;
    this.lineGaps.length && (t = t.concat(this.lineGapDeco));
    let n = [];
    oe.spans(t, this.viewport.from, this.viewport.to, {
      span(o, s) {
        n.push({ from: o, to: s });
      },
      point() {
      }
    }, 20);
    let i = 0;
    if (n.length != this.visibleRanges.length)
      i = 12;
    else
      for (let o = 0; o < n.length && !(i & 8); o++) {
        let s = this.visibleRanges[o], l = n[o];
        (s.from != l.from || s.to != l.to) && (i |= 4, e && e.mapPos(s.from, -1) == l.from && e.mapPos(s.to, 1) == l.to || (i |= 8));
      }
    return this.visibleRanges = n, i;
  }
  lineBlockAt(e) {
    return e >= this.viewport.from && e <= this.viewport.to && this.viewportLines.find((t) => t.from <= e && t.to >= e) || Er(this.heightMap.lineAt(e, pe.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(e) {
    return e >= this.viewportLines[0].top && e <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((t) => t.top <= e && t.bottom >= e) || Er(this.heightMap.lineAt(this.scaler.fromDOM(e), pe.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  getScrollOffset() {
    return (this.scrollParent == this.view.scrollDOM ? this.scrollParent.scrollTop : (this.scrollParent ? this.scrollParent.getBoundingClientRect().top : 0) - this.view.contentDOM.getBoundingClientRect().top) * this.scaleY;
  }
  scrollAnchorAt(e) {
    let t = this.lineBlockAtHeight(e + 8);
    return t.from >= this.viewport.from || this.viewportLines[0].top - e > 200 ? t : this.viewportLines[0];
  }
  elementAtHeight(e) {
    return Er(this.heightMap.blockAt(this.scaler.fromDOM(e), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class ki {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
function fx(r, e, t) {
  let n = [], i = r, o = 0;
  return oe.spans(t, r, e, {
    span() {
    },
    point(s, l) {
      s > i && (n.push({ from: i, to: s }), o += s - i), i = l;
    }
  }, 20), i < e && (n.push({ from: i, to: e }), o += e - i), { total: o, ranges: n };
}
function Si({ total: r, ranges: e }, t) {
  if (t <= 0)
    return e[0].from;
  if (t >= 1)
    return e[e.length - 1].to;
  let n = Math.floor(r * t);
  for (let i = 0; ; i++) {
    let { from: o, to: s } = e[i], l = s - o;
    if (n <= l)
      return o + n;
    n -= l;
  }
}
function Ci(r, e) {
  let t = 0;
  for (let { from: n, to: i } of r.ranges) {
    if (e <= i) {
      t += e - n;
      break;
    }
    t += i - n;
  }
  return t / r.total;
}
function px(r, e) {
  for (let t of r)
    if (e(t))
      return t;
}
const nc = {
  toDOM(r) {
    return r;
  },
  fromDOM(r) {
    return r;
  },
  scale: 1,
  eq(r) {
    return r == this;
  }
};
function rc(r) {
  let e = r.facet(go).filter((n) => typeof n != "function"), t = r.facet(bl).filter((n) => typeof n != "function");
  return t.length && e.push(oe.join(t)), e;
}
class kl {
  constructor(e, t, n) {
    let i = 0, o = 0, s = 0;
    this.viewports = n.map(({ from: l, to: a }) => {
      let c = t.lineAt(l, pe.ByPos, e, 0, 0).top, h = t.lineAt(a, pe.ByPos, e, 0, 0).bottom;
      return i += h - c, { from: l, to: a, top: c, bottom: h, domTop: 0, domBottom: 0 };
    }), this.scale = (7e6 - i) / (t.height - i);
    for (let l of this.viewports)
      l.domTop = s + (l.top - o) * this.scale, s = l.domBottom = l.domTop + (l.bottom - l.top), o = l.bottom;
  }
  toDOM(e) {
    for (let t = 0, n = 0, i = 0; ; t++) {
      let o = t < this.viewports.length ? this.viewports[t] : null;
      if (!o || e < o.top)
        return i + (e - n) * this.scale;
      if (e <= o.bottom)
        return o.domTop + (e - o.top);
      n = o.bottom, i = o.domBottom;
    }
  }
  fromDOM(e) {
    for (let t = 0, n = 0, i = 0; ; t++) {
      let o = t < this.viewports.length ? this.viewports[t] : null;
      if (!o || e < o.domTop)
        return n + (e - i) / this.scale;
      if (e <= o.domBottom)
        return o.top + (e - o.domTop);
      n = o.bottom, i = o.domBottom;
    }
  }
  eq(e) {
    return e instanceof kl ? this.scale == e.scale && this.viewports.length == e.viewports.length && this.viewports.every((t, n) => t.from == e.viewports[n].from && t.to == e.viewports[n].to) : !1;
  }
}
function Er(r, e) {
  if (e.scale == 1)
    return r;
  let t = e.toDOM(r.top), n = e.toDOM(r.bottom);
  return new Ot(r.from, r.length, t, n - t, Array.isArray(r._content) ? r._content.map((i) => Er(i, e)) : r._content);
}
const Ai = /* @__PURE__ */ H.define({ combine: (r) => r.join(" ") }), Ws = /* @__PURE__ */ H.define({ combine: (r) => r.indexOf(!0) > -1 }), zs = /* @__PURE__ */ hr.newName(), Fd = /* @__PURE__ */ hr.newName(), Hd = /* @__PURE__ */ hr.newName(), Wd = { "&light": "." + Fd, "&dark": "." + Hd };
function Vs(r, e, t) {
  return new hr(e, {
    finish(n) {
      return /&/.test(n) ? n.replace(/&\w*/, (i) => {
        if (i == "&")
          return r;
        if (!t || !t[i])
          throw new RangeError(`Unsupported selector: ${i}`);
        return t[i];
      }) : r + " " + n;
    }
  });
}
const mx = /* @__PURE__ */ Vs("." + zs, {
  "&": {
    position: "relative !important",
    boxSizing: "border-box",
    "&.cm-focused": {
      // Provide a simple default outline to make sure a focused
      // editor is visually distinct. Can't leave the default behavior
      // because that will apply to the content element, which is
      // inside the scrollable container and doesn't include the
      // gutters. We also can't use an 'auto' outline, since those
      // are, for some reason, drawn behind the element content, which
      // will cause things like the active line background to cover
      // the outline (#297).
      outline: "1px dotted #212121"
    },
    display: "flex !important",
    flexDirection: "column"
  },
  ".cm-scroller": {
    display: "flex !important",
    alignItems: "flex-start !important",
    fontFamily: "monospace",
    lineHeight: 1.4,
    height: "100%",
    overflowX: "auto",
    position: "relative",
    zIndex: 0,
    overflowAnchor: "none"
  },
  ".cm-content": {
    margin: 0,
    flexGrow: 2,
    flexShrink: 0,
    display: "block",
    whiteSpace: "pre",
    wordWrap: "normal",
    // Issue #456
    boxSizing: "border-box",
    minHeight: "100%",
    padding: "4px 0",
    outline: "none",
    "&[contenteditable=true]": {
      WebkitUserModify: "read-write-plaintext-only"
    }
  },
  ".cm-lineWrapping": {
    whiteSpace_fallback: "pre-wrap",
    // For IE
    whiteSpace: "break-spaces",
    wordBreak: "break-word",
    // For Safari, which doesn't support overflow-wrap: anywhere
    overflowWrap: "anywhere",
    flexShrink: 1
  },
  "&light .cm-content": { caretColor: "black" },
  "&dark .cm-content": { caretColor: "white" },
  ".cm-line": {
    display: "block",
    padding: "0 2px 0 6px"
  },
  ".cm-layer": {
    userSelect: "none",
    // #1708
    position: "absolute",
    left: 0,
    top: 0,
    contain: "size style",
    "& > *": {
      position: "absolute"
    }
  },
  "&light .cm-selectionBackground": {
    background: "#d9d9d9"
  },
  "&dark .cm-selectionBackground": {
    background: "#222"
  },
  "&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#d7d4f0"
  },
  "&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#233"
  },
  ".cm-cursorLayer": {
    pointerEvents: "none"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer": {
    animation: "steps(1) cm-blink 1.2s infinite"
  },
  // Two animations defined so that we can switch between them to
  // restart the animation without forcing another style
  // recomputation.
  "@keyframes cm-blink": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  "@keyframes cm-blink2": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  ".cm-cursor, .cm-dropCursor": {
    borderLeft: "1.2px solid black",
    marginLeft: "-0.6px",
    pointerEvents: "none"
  },
  ".cm-cursor": {
    display: "none"
  },
  "&dark .cm-cursor": {
    borderLeftColor: "#ddd"
  },
  ".cm-selectionHandle": {
    backgroundColor: "currentColor",
    width: "1.5px"
  },
  ".cm-selectionHandle-start::before, .cm-selectionHandle-end::before": {
    content: '""',
    backgroundColor: "inherit",
    borderRadius: "50%",
    width: "8px",
    height: "8px",
    position: "absolute",
    left: "-3.25px"
  },
  ".cm-selectionHandle-start::before": { top: "-8px" },
  ".cm-selectionHandle-end::before": { bottom: "-8px" },
  ".cm-dropCursor": {
    position: "absolute"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor": {
    display: "block"
  },
  ".cm-iso": {
    unicodeBidi: "isolate"
  },
  ".cm-announced": {
    position: "fixed",
    top: "-10000px"
  },
  "@media print": {
    ".cm-announced": { display: "none" }
  },
  "&light .cm-activeLine": { backgroundColor: "#cceeff44" },
  "&dark .cm-activeLine": { backgroundColor: "#99eeff33" },
  "&light .cm-specialChar": { color: "red" },
  "&dark .cm-specialChar": { color: "#f78" },
  ".cm-gutters": {
    flexShrink: 0,
    display: "flex",
    height: "100%",
    boxSizing: "border-box",
    zIndex: 200
  },
  ".cm-gutters-before": { insetInlineStart: 0 },
  ".cm-gutters-after": { insetInlineEnd: 0 },
  "&light .cm-gutters": {
    backgroundColor: "#f5f5f5",
    color: "#6c6c6c",
    border: "0px solid #ddd",
    "&.cm-gutters-before": { borderRightWidth: "1px" },
    "&.cm-gutters-after": { borderLeftWidth: "1px" }
  },
  "&dark .cm-gutters": {
    backgroundColor: "#333338",
    color: "#ccc"
  },
  ".cm-gutter": {
    display: "flex !important",
    // Necessary -- prevents margin collapsing
    flexDirection: "column",
    flexShrink: 0,
    boxSizing: "border-box",
    minHeight: "100%",
    overflow: "hidden"
  },
  ".cm-gutterElement": {
    boxSizing: "border-box"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 3px 0 5px",
    minWidth: "20px",
    textAlign: "right",
    whiteSpace: "nowrap"
  },
  "&light .cm-activeLineGutter": {
    backgroundColor: "#e2f2ff"
  },
  "&dark .cm-activeLineGutter": {
    backgroundColor: "#222227"
  },
  ".cm-panels": {
    boxSizing: "border-box",
    position: "sticky",
    left: 0,
    right: 0,
    zIndex: 300
  },
  "&light .cm-panels": {
    backgroundColor: "#f5f5f5",
    color: "black"
  },
  "&light .cm-panels-top": {
    borderBottom: "1px solid #ddd"
  },
  "&light .cm-panels-bottom": {
    borderTop: "1px solid #ddd"
  },
  "&dark .cm-panels": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-dialog": {
    padding: "2px 19px 4px 6px",
    position: "relative",
    "& label": { fontSize: "80%" }
  },
  ".cm-dialog-close": {
    position: "absolute",
    top: "3px",
    right: "4px",
    backgroundColor: "inherit",
    border: "none",
    font: "inherit",
    fontSize: "14px",
    padding: "0"
  },
  ".cm-tab": {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "bottom"
  },
  ".cm-widgetBuffer": {
    verticalAlign: "text-top",
    height: "1em",
    width: 0,
    display: "inline"
  },
  ".cm-placeholder": {
    color: "#888",
    display: "inline-block",
    verticalAlign: "top",
    userSelect: "none"
  },
  ".cm-highlightSpace": {
    backgroundImage: "radial-gradient(circle at 50% 55%, #aaa 20%, transparent 5%)",
    backgroundPosition: "center"
  },
  ".cm-highlightTab": {
    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,
    backgroundSize: "auto 100%",
    backgroundPosition: "right 90%",
    backgroundRepeat: "no-repeat"
  },
  ".cm-trailingSpace": {
    backgroundColor: "#ff332255"
  },
  ".cm-button": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    padding: ".2em 1em",
    borderRadius: "1px"
  },
  "&light .cm-button": {
    backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
    }
  },
  "&dark .cm-button": {
    backgroundImage: "linear-gradient(#393939, #111)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#111, #333)"
    }
  },
  ".cm-textfield": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    border: "1px solid silver",
    padding: ".2em .5em"
  },
  "&light .cm-textfield": {
    backgroundColor: "white"
  },
  "&dark .cm-textfield": {
    border: "1px solid #555",
    backgroundColor: "inherit"
  }
}, Wd), gx = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, _o = I.ie && I.ie_version <= 11;
class yx {
  constructor(e) {
    this.view = e, this.active = !1, this.editContext = null, this.selectionRange = new j0(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.flushingAndroidKey = -1, this.lastChange = 0, this.scrollTargets = [], this.intersection = null, this.resizeScroll = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.printQuery = null, this.parentCheck = -1, this.dom = e.contentDOM, this.observer = new MutationObserver((t) => {
      for (let n of t)
        this.queue.push(n);
      (I.ie && I.ie_version <= 11 || I.ios && e.composing) && t.some((n) => n.type == "childList" && n.removedNodes.length || n.type == "characterData" && n.oldValue.length > n.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), window.EditContext && I.android && e.constructor.EDIT_CONTEXT !== !1 && // Chrome <126 doesn't support inverted selections in edit context (#1392)
    !(I.chrome && I.chrome_version < 126) && (this.editContext = new bx(e), e.state.facet(en) && (e.contentDOM.editContext = this.editContext.editContext)), _o && (this.onCharData = (t) => {
      this.queue.push({
        target: t.target,
        type: "characterData",
        oldValue: t.prevValue
      }), this.flushSoon();
    }), this.onSelectionChange = this.onSelectionChange.bind(this), this.onResize = this.onResize.bind(this), this.onPrint = this.onPrint.bind(this), this.onScroll = this.onScroll.bind(this), window.matchMedia && (this.printQuery = window.matchMedia("print")), typeof ResizeObserver == "function" && (this.resizeScroll = new ResizeObserver(() => {
      var t;
      ((t = this.view.docView) === null || t === void 0 ? void 0 : t.lastUpdate) < Date.now() - 75 && this.onResize();
    }), this.resizeScroll.observe(e.scrollDOM)), this.addWindowListeners(this.win = e.win), this.start(), typeof IntersectionObserver == "function" && (this.intersection = new IntersectionObserver((t) => {
      this.parentCheck < 0 && (this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3)), t.length > 0 && t[t.length - 1].intersectionRatio > 0 != this.intersecting && (this.intersecting = !this.intersecting, this.intersecting != this.view.inView && this.onScrollChanged(document.createEvent("Event")));
    }, { threshold: [0, 1e-3] }), this.intersection.observe(this.dom), this.gapIntersection = new IntersectionObserver((t) => {
      t.length > 0 && t[t.length - 1].intersectionRatio > 0 && this.onScrollChanged(document.createEvent("Event"));
    }, {})), this.listenForScroll(), this.readSelectionRange();
  }
  onScrollChanged(e) {
    this.view.inputState.runHandlers("scroll", e), this.intersecting && this.view.measure();
  }
  onScroll(e) {
    this.intersecting && this.flush(!1), this.editContext && this.view.requestMeasure(this.editContext.measureReq), this.onScrollChanged(e);
  }
  onResize() {
    this.resizeTimeout < 0 && (this.resizeTimeout = setTimeout(() => {
      this.resizeTimeout = -1, this.view.requestMeasure();
    }, 50));
  }
  onPrint(e) {
    (e.type == "change" || !e.type) && !e.matches || (this.view.viewState.printing = !0, this.view.measure(), setTimeout(() => {
      this.view.viewState.printing = !1, this.view.requestMeasure();
    }, 500));
  }
  updateGaps(e) {
    if (this.gapIntersection && (e.length != this.gaps.length || this.gaps.some((t, n) => t != e[n]))) {
      this.gapIntersection.disconnect();
      for (let t of e)
        this.gapIntersection.observe(t);
      this.gaps = e;
    }
  }
  onSelectionChange(e) {
    let t = this.selectionChanged;
    if (!this.readSelectionRange() || this.delayedAndroidKey)
      return;
    let { view: n } = this, i = this.selectionRange;
    if (n.state.facet(en) ? n.root.activeElement != this.dom : !Rr(this.dom, i))
      return;
    let o = i.anchorNode && n.docView.tile.nearest(i.anchorNode);
    if (o && o.isWidget() && o.widget.ignoreEvent(e)) {
      t || (this.selectionChanged = !1);
      return;
    }
    (I.ie && I.ie_version <= 11 || I.android && I.chrome) && !n.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    i.focusNode && Br(i.focusNode, i.focusOffset, i.anchorNode, i.anchorOffset) ? this.flushSoon() : this.flush(!1);
  }
  readSelectionRange() {
    let { view: e } = this, t = jr(e.root);
    if (!t)
      return !1;
    let n = I.safari && e.root.nodeType == 11 && e.root.activeElement == this.dom && xx(this.view, t) || t;
    if (!n || this.selectionRange.eq(n))
      return !1;
    let i = Rr(this.dom, n);
    return i && !this.selectionChanged && e.inputState.lastFocusTime > Date.now() - 200 && e.inputState.lastTouchTime < Date.now() - 300 && U0(this.dom, n) ? (this.view.inputState.lastFocusTime = 0, e.docView.updateSelection(), !1) : (this.selectionRange.setRange(n), i && (this.selectionChanged = !0), !0);
  }
  setSelectionRange(e, t) {
    this.selectionRange.set(e.node, e.offset, t.node, t.offset), this.selectionChanged = !1;
  }
  clearSelectionRange() {
    this.selectionRange.set(null, 0, null, 0);
  }
  listenForScroll() {
    this.parentCheck = -1;
    let e = 0, t = null;
    for (let n = this.dom; n; )
      if (n.nodeType == 1)
        !t && e < this.scrollTargets.length && this.scrollTargets[e] == n ? e++ : t || (t = this.scrollTargets.slice(0, e)), t && t.push(n), n = n.assignedSlot || n.parentNode;
      else if (n.nodeType == 11)
        n = n.host;
      else
        break;
    if (e < this.scrollTargets.length && !t && (t = this.scrollTargets.slice(0, e)), t) {
      for (let n of this.scrollTargets)
        n.removeEventListener("scroll", this.onScroll);
      for (let n of this.scrollTargets = t)
        n.addEventListener("scroll", this.onScroll);
    }
  }
  ignore(e) {
    if (!this.active)
      return e();
    try {
      return this.stop(), e();
    } finally {
      this.start(), this.clear();
    }
  }
  start() {
    this.active || (this.observer.observe(this.dom, gx), _o && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    this.active && (this.active = !1, this.observer.disconnect(), _o && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
  }
  // Throw away any pending changes
  clear() {
    this.processRecords(), this.queue.length = 0, this.selectionChanged = !1;
  }
  // Chrome Android, especially in combination with GBoard, not only
  // doesn't reliably fire regular key events, but also often
  // surrounds the effect of enter or backspace with a bunch of
  // composition events that, when interrupted, cause text duplication
  // or other kinds of corruption. This hack makes the editor back off
  // from handling DOM changes for a moment when such a key is
  // detected (via beforeinput or keydown), and then tries to flush
  // them or, if that has no effect, dispatches the given key.
  delayAndroidKey(e, t) {
    var n;
    if (!this.delayedAndroidKey) {
      let i = () => {
        let o = this.delayedAndroidKey;
        o && (this.clearDelayedAndroidKey(), this.view.inputState.lastKeyCode = o.keyCode, this.view.inputState.lastKeyTime = Date.now(), !this.flush() && o.force && sr(this.dom, o.key, o.keyCode));
      };
      this.flushingAndroidKey = this.view.win.requestAnimationFrame(i);
    }
    (!this.delayedAndroidKey || e == "Enter") && (this.delayedAndroidKey = {
      key: e,
      keyCode: t,
      // Only run the key handler when no changes are detected if
      // this isn't coming right after another change, in which case
      // it is probably part of a weird chain of updates, and should
      // be ignored if it returns the DOM to its previous state.
      force: this.lastChange < Date.now() - 50 || !!(!((n = this.delayedAndroidKey) === null || n === void 0) && n.force)
    });
  }
  clearDelayedAndroidKey() {
    this.win.cancelAnimationFrame(this.flushingAndroidKey), this.delayedAndroidKey = null, this.flushingAndroidKey = -1;
  }
  flushSoon() {
    this.delayedFlush < 0 && (this.delayedFlush = this.view.win.requestAnimationFrame(() => {
      this.delayedFlush = -1, this.flush();
    }));
  }
  forceFlush() {
    this.delayedFlush >= 0 && (this.view.win.cancelAnimationFrame(this.delayedFlush), this.delayedFlush = -1), this.flush();
  }
  pendingRecords() {
    for (let e of this.observer.takeRecords())
      this.queue.push(e);
    return this.queue;
  }
  processRecords() {
    let e = this.pendingRecords();
    e.length && (this.queue = []);
    let t = -1, n = -1, i = !1;
    for (let o of e) {
      let s = this.readMutation(o);
      s && (s.typeOver && (i = !0), t == -1 ? { from: t, to: n } = s : (t = Math.min(s.from, t), n = Math.max(s.to, n)));
    }
    return { from: t, to: n, typeOver: i };
  }
  readChange() {
    let { from: e, to: t, typeOver: n } = this.processRecords(), i = this.selectionChanged && Rr(this.dom, this.selectionRange);
    if (e < 0 && !i)
      return null;
    e > -1 && (this.lastChange = Date.now()), this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let o = new Iy(this.view, e, t, n);
    return this.view.docView.domChanged = { newSel: o.newSel ? o.newSel.main : null }, o;
  }
  // Apply pending changes, if any
  flush(e = !0) {
    if (this.delayedFlush >= 0 || this.delayedAndroidKey)
      return !1;
    e && this.readSelectionRange();
    let t = this.readChange();
    if (!t)
      return this.view.requestMeasure(), !1;
    let n = this.view.state, i = Dd(this.view, t);
    return this.view.state == n && (t.domChanged || t.newSel && !to(this.view.state.selection, t.newSel.main)) && this.view.update([]), i;
  }
  readMutation(e) {
    let t = this.view.docView.tile.nearest(e.target);
    if (!t || t.isWidget())
      return null;
    if (t.markDirty(e.type == "attributes"), e.type == "childList") {
      let n = ic(t, e.previousSibling || e.target.previousSibling, -1), i = ic(t, e.nextSibling || e.target.nextSibling, 1);
      return {
        from: n ? t.posAfter(n) : t.posAtStart,
        to: i ? t.posBefore(i) : t.posAtEnd,
        typeOver: !1
      };
    } else return e.type == "characterData" ? { from: t.posAtStart, to: t.posAtEnd, typeOver: e.target.nodeValue == e.oldValue } : null;
  }
  setWindow(e) {
    e != this.win && (this.removeWindowListeners(this.win), this.win = e, this.addWindowListeners(this.win));
  }
  addWindowListeners(e) {
    e.addEventListener("resize", this.onResize), this.printQuery ? this.printQuery.addEventListener ? this.printQuery.addEventListener("change", this.onPrint) : this.printQuery.addListener(this.onPrint) : e.addEventListener("beforeprint", this.onPrint), e.addEventListener("scroll", this.onScroll), e.document.addEventListener("selectionchange", this.onSelectionChange);
  }
  removeWindowListeners(e) {
    e.removeEventListener("scroll", this.onScroll), e.removeEventListener("resize", this.onResize), this.printQuery ? this.printQuery.removeEventListener ? this.printQuery.removeEventListener("change", this.onPrint) : this.printQuery.removeListener(this.onPrint) : e.removeEventListener("beforeprint", this.onPrint), e.document.removeEventListener("selectionchange", this.onSelectionChange);
  }
  update(e) {
    this.editContext && (this.editContext.update(e), e.startState.facet(en) != e.state.facet(en) && (e.view.contentDOM.editContext = e.state.facet(en) ? this.editContext.editContext : null));
  }
  destroy() {
    var e, t, n;
    this.stop(), (e = this.intersection) === null || e === void 0 || e.disconnect(), (t = this.gapIntersection) === null || t === void 0 || t.disconnect(), (n = this.resizeScroll) === null || n === void 0 || n.disconnect();
    for (let i of this.scrollTargets)
      i.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout), this.win.cancelAnimationFrame(this.delayedFlush), this.win.cancelAnimationFrame(this.flushingAndroidKey), this.editContext && (this.view.contentDOM.editContext = null, this.editContext.destroy());
  }
}
function ic(r, e, t) {
  for (; e; ) {
    let n = Se.get(e);
    if (n && n.parent == r)
      return n;
    let i = e.parentNode;
    e = i != r.dom ? i : t > 0 ? e.nextSibling : e.previousSibling;
  }
  return null;
}
function oc(r, e) {
  let t = e.startContainer, n = e.startOffset, i = e.endContainer, o = e.endOffset, s = r.docView.domAtPos(r.state.selection.main.anchor, 1);
  return Br(s.node, s.offset, i, o) && ([t, n, i, o] = [i, o, t, n]), { anchorNode: t, anchorOffset: n, focusNode: i, focusOffset: o };
}
function xx(r, e) {
  if (e.getComposedRanges) {
    let i = e.getComposedRanges(r.root)[0];
    if (i)
      return oc(r, i);
  }
  let t = null;
  function n(i) {
    i.preventDefault(), i.stopImmediatePropagation(), t = i.getTargetRanges()[0];
  }
  return r.contentDOM.addEventListener("beforeinput", n, !0), r.dom.ownerDocument.execCommand("indent"), r.contentDOM.removeEventListener("beforeinput", n, !0), t ? oc(r, t) : null;
}
class bx {
  constructor(e) {
    this.from = 0, this.to = 0, this.pendingContextChange = null, this.handlers = /* @__PURE__ */ Object.create(null), this.composing = null, this.resetRange(e.state);
    let t = this.editContext = new window.EditContext({
      text: e.state.doc.sliceString(this.from, this.to),
      selectionStart: this.toContextPos(Math.max(this.from, Math.min(this.to, e.state.selection.main.anchor))),
      selectionEnd: this.toContextPos(e.state.selection.main.head)
    });
    this.handlers.textupdate = (n) => {
      let i = e.state.selection.main, { anchor: o, head: s } = i, l = this.toEditorPos(n.updateRangeStart), a = this.toEditorPos(n.updateRangeEnd);
      e.inputState.composing >= 0 && !this.composing && (this.composing = { contextBase: n.updateRangeStart, editorBase: l, drifted: !1 });
      let c = a - l > n.text.length;
      l == this.from && o < this.from ? l = o : a == this.to && o > this.to && (a = o);
      let h = Td(e.state.sliceDoc(l, a), n.text, (c ? i.from : i.to) - l, c ? "end" : null);
      if (!h) {
        let u = E.single(this.toEditorPos(n.selectionStart), this.toEditorPos(n.selectionEnd));
        to(u, i) || e.dispatch({ selection: u, userEvent: "select" });
        return;
      }
      let d = {
        from: h.from + l,
        to: h.toA + l,
        insert: se.of(n.text.slice(h.from, h.toB).split(`
`))
      };
      if ((I.mac || I.android) && d.from == s - 1 && /^\. ?$/.test(n.text) && e.contentDOM.getAttribute("autocorrect") == "off" && (d = { from: l, to: a, insert: se.of([n.text.replace(".", " ")]) }), this.pendingContextChange = d, !e.state.readOnly) {
        let u = this.to - this.from + (d.to - d.from + d.insert.length);
        wl(e, d, E.single(this.toEditorPos(n.selectionStart, u), this.toEditorPos(n.selectionEnd, u)));
      }
      this.pendingContextChange && (this.revertPending(e.state), this.setSelection(e.state)), d.from < d.to && !d.insert.length && e.inputState.composing >= 0 && !/[\\p{Alphabetic}\\p{Number}_]/.test(t.text.slice(Math.max(0, n.updateRangeStart - 1), Math.min(t.text.length, n.updateRangeStart + 1))) && this.handlers.compositionend(n);
    }, this.handlers.characterboundsupdate = (n) => {
      let i = [], o = null;
      for (let s = this.toEditorPos(n.rangeStart), l = this.toEditorPos(n.rangeEnd); s < l; s++) {
        let a = e.coordsForChar(s);
        o = a && new DOMRect(a.left, a.top, a.right - a.left, a.bottom - a.top) || o || new DOMRect(), i.push(o);
      }
      t.updateCharacterBounds(n.rangeStart, i);
    }, this.handlers.textformatupdate = (n) => {
      let i = [];
      for (let o of n.getTextFormats()) {
        let s = o.underlineStyle, l = o.underlineThickness;
        if (!/none/i.test(s) && !/none/i.test(l)) {
          let a = this.toEditorPos(o.rangeStart), c = this.toEditorPos(o.rangeEnd);
          if (a < c) {
            let h = `text-decoration: underline ${/^[a-z]/.test(s) ? s + " " : s == "Dashed" ? "dashed " : s == "Squiggle" ? "wavy " : ""}${/thin/i.test(l) ? 1 : 2}px`;
            i.push(te.mark({ attributes: { style: h } }).range(a, c));
          }
        }
      }
      e.dispatch({ effects: yd.of(te.set(i)) });
    }, this.handlers.compositionstart = () => {
      e.inputState.composing < 0 && (e.inputState.composing = 0, e.inputState.compositionFirstChange = !0);
    }, this.handlers.compositionend = () => {
      if (e.inputState.composing = -1, e.inputState.compositionFirstChange = null, this.composing) {
        let { drifted: n } = this.composing;
        this.composing = null, n && this.reset(e.state);
      }
    };
    for (let n in this.handlers)
      t.addEventListener(n, this.handlers[n]);
    this.measureReq = { read: (n) => {
      let i = jr(n.root);
      i && i.rangeCount && this.editContext.updateSelectionBounds(i.getRangeAt(0).getBoundingClientRect());
    } };
  }
  applyEdits(e) {
    let t = 0, n = !1, i = this.pendingContextChange;
    return e.changes.iterChanges((o, s, l, a, c) => {
      if (n)
        return;
      let h = c.length - (s - o);
      if (i && s >= i.to)
        if (i.from == o && i.to == s && i.insert.eq(c)) {
          i = this.pendingContextChange = null, t += h, this.to += h;
          return;
        } else
          i = null, this.revertPending(e.state);
      if (o += t, s += t, s <= this.from)
        this.from += h, this.to += h;
      else if (o < this.to) {
        if (o < this.from || s > this.to || this.to - this.from + c.length > 3e4) {
          n = !0;
          return;
        }
        this.editContext.updateText(this.toContextPos(o), this.toContextPos(s), c.toString()), this.to += h;
      }
      t += h;
    }), i && !n && this.revertPending(e.state), !n;
  }
  update(e) {
    let t = this.pendingContextChange, n = e.startState.selection.main;
    this.composing && (this.composing.drifted || !e.changes.touchesRange(n.from, n.to) && e.transactions.some((i) => !i.isUserEvent("input.type") && i.changes.touchesRange(this.from, this.to))) ? (this.composing.drifted = !0, this.composing.editorBase = e.changes.mapPos(this.composing.editorBase)) : !this.applyEdits(e) || !this.rangeIsValid(e.state) ? (this.pendingContextChange = null, this.reset(e.state)) : (e.docChanged || e.selectionSet || t) && this.setSelection(e.state), (e.geometryChanged || e.docChanged || e.selectionSet) && e.view.requestMeasure(this.measureReq);
  }
  resetRange(e) {
    let { head: t } = e.selection.main;
    this.from = Math.max(
      0,
      t - 1e4
      /* CxVp.Margin */
    ), this.to = Math.min(
      e.doc.length,
      t + 1e4
      /* CxVp.Margin */
    );
  }
  reset(e) {
    this.resetRange(e), this.editContext.updateText(0, this.editContext.text.length, e.doc.sliceString(this.from, this.to)), this.setSelection(e);
  }
  revertPending(e) {
    let t = this.pendingContextChange;
    this.pendingContextChange = null, this.editContext.updateText(this.toContextPos(t.from), this.toContextPos(t.from + t.insert.length), e.doc.sliceString(t.from, t.to));
  }
  setSelection(e) {
    let { main: t } = e.selection, n = this.toContextPos(Math.max(this.from, Math.min(this.to, t.anchor))), i = this.toContextPos(t.head);
    (this.editContext.selectionStart != n || this.editContext.selectionEnd != i) && this.editContext.updateSelection(n, i);
  }
  rangeIsValid(e) {
    let { head: t } = e.selection.main;
    return !(this.from > 0 && t - this.from < 500 || this.to < e.doc.length && this.to - t < 500 || this.to - this.from > 1e4 * 3);
  }
  toEditorPos(e, t = this.to - this.from) {
    e = Math.min(e, t);
    let n = this.composing;
    return n && n.drifted ? n.editorBase + (e - n.contextBase) : e + this.from;
  }
  toContextPos(e) {
    let t = this.composing;
    return t && t.drifted ? t.contextBase + (e - t.editorBase) : e - this.from;
  }
  destroy() {
    for (let e in this.handlers)
      this.editContext.removeEventListener(e, this.handlers[e]);
  }
}
class V {
  /**
  The current editor state.
  */
  get state() {
    return this.viewState.state;
  }
  /**
  To be able to display large documents without consuming too much
  memory or overloading the browser, CodeMirror only draws the
  code that is visible (plus a margin around it) to the DOM. This
  property tells you the extent of the current drawn viewport, in
  document positions.
  */
  get viewport() {
    return this.viewState.viewport;
  }
  /**
  When there are, for example, large collapsed ranges in the
  viewport, its size can be a lot bigger than the actual visible
  content. Thus, if you are doing something like styling the
  content in the viewport, it is preferable to only do so for
  these ranges, which are the subset of the viewport that is
  actually drawn.
  */
  get visibleRanges() {
    return this.viewState.visibleRanges;
  }
  /**
  Returns false when the editor is entirely scrolled out of view
  or otherwise hidden.
  */
  get inView() {
    return this.viewState.inView;
  }
  /**
  Indicates whether the user is currently composing text via
  [IME](https://en.wikipedia.org/wiki/Input_method), and at least
  one change has been made in the current composition.
  */
  get composing() {
    return !!this.inputState && this.inputState.composing > 0;
  }
  /**
  Indicates whether the user is currently in composing state. Note
  that on some platforms, like Android, this will be the case a
  lot, since just putting the cursor on a word starts a
  composition there.
  */
  get compositionStarted() {
    return !!this.inputState && this.inputState.composing >= 0;
  }
  /**
  The document or shadow root that the view lives in.
  */
  get root() {
    return this._root;
  }
  /**
  @internal
  */
  get win() {
    return this.dom.ownerDocument.defaultView || window;
  }
  /**
  Construct a new view. You'll want to either provide a `parent`
  option, or put `view.dom` into your document after creating a
  view, so that the user can see the editor.
  */
  constructor(e = {}) {
    var t;
    this.plugins = [], this.pluginMap = /* @__PURE__ */ new Map(), this.editorAttrs = {}, this.contentAttrs = {}, this.bidiCache = [], this.destroyed = !1, this.updateState = 2, this.measureScheduled = -1, this.measureRequests = [], this.contentDOM = document.createElement("div"), this.scrollDOM = document.createElement("div"), this.scrollDOM.tabIndex = -1, this.scrollDOM.className = "cm-scroller", this.scrollDOM.appendChild(this.contentDOM), this.announceDOM = document.createElement("div"), this.announceDOM.className = "cm-announced", this.announceDOM.setAttribute("aria-live", "polite"), this.dom = document.createElement("div"), this.dom.appendChild(this.announceDOM), this.dom.appendChild(this.scrollDOM), e.parent && e.parent.appendChild(this.dom);
    let { dispatch: n } = e;
    this.dispatchTransactions = e.dispatchTransactions || n && ((i) => i.forEach((o) => n(o, this))) || ((i) => this.update(i)), this.dispatch = this.dispatch.bind(this), this._root = e.root || K0(e.parent) || document, this.viewState = new tc(this, e.state || ie.create(e)), e.scrollTo && e.scrollTo.is(bi) && (this.viewState.scrollTarget = e.scrollTo.value.clip(this.viewState.state)), this.plugins = this.state.facet(tr).map((i) => new $o(i));
    for (let i of this.plugins)
      i.update(this);
    this.observer = new yx(this), this.inputState = new Hy(this), this.inputState.ensureHandlers(this.plugins), this.docView = new Va(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), !((t = document.fonts) === null || t === void 0) && t.ready && document.fonts.ready.then(() => {
      this.viewState.mustMeasureContent = "refresh", this.requestMeasure();
    });
  }
  dispatch(...e) {
    let t = e.length == 1 && e[0] instanceof Le ? e : e.length == 1 && Array.isArray(e[0]) ? e[0] : [this.state.update(...e)];
    this.dispatchTransactions(t, this);
  }
  /**
  Update the view for the given array of transactions. This will
  update the visible document and selection to match the state
  produced by the transactions, and notify view plugins of the
  change. You should usually call
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
  as a primitive.
  */
  update(e) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
    let t = !1, n = !1, i, o = this.state;
    for (let u of e) {
      if (u.startState != o)
        throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
      o = u.state;
    }
    if (this.destroyed) {
      this.viewState.state = o;
      return;
    }
    let s = this.hasFocus, l = 0, a = null;
    e.some((u) => u.annotation(Bd)) ? (this.inputState.notifiedFocused = s, l = 1) : s != this.inputState.notifiedFocused && (this.inputState.notifiedFocused = s, a = Id(o, s), a || (l = 1));
    let c = this.observer.delayedAndroidKey, h = null;
    if (c ? (this.observer.clearDelayedAndroidKey(), h = this.observer.readChange(), (h && !this.state.doc.eq(o.doc) || !this.state.selection.eq(o.selection)) && (h = null)) : this.observer.clear(), o.facet(ie.phrases) != this.state.facet(ie.phrases))
      return this.setState(o);
    i = Zi.create(this, o, e), i.flags |= l;
    let d = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let u of e) {
        if (d && (d = d.map(u.changes)), u.scrollIntoView) {
          let { main: f } = u.state.selection, { x: g, y: w } = this.state.facet(V.cursorScrollMargin);
          d = new lr(f.empty ? f : E.cursor(f.head, f.head > f.anchor ? -1 : 1), "nearest", "nearest", w, g);
        }
        for (let f of u.effects)
          f.is(bi) && (d = f.value.clip(this.state));
      }
      this.viewState.update(i, d), this.bidiCache = ro.update(this.bidiCache, i.changes), i.empty || (this.updatePlugins(i), this.inputState.update(i)), t = this.docView.update(i), this.state.facet(Tr) != this.styleModules && this.mountStyles(), n = this.updateAttrs(), this.showAnnouncements(e), this.docView.updateSelection(t, e.some((u) => u.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (i.startState.facet(Ai) != i.state.facet(Ai) && (this.viewState.mustMeasureContent = !0), (t || n || d || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), t && this.docViewUpdate(), !i.empty)
      for (let u of this.state.facet(Ps))
        try {
          u(i);
        } catch (f) {
          Ut(this.state, f, "update listener");
        }
    (a || h) && Promise.resolve().then(() => {
      a && this.state == a.startState && this.dispatch(a), h && !Dd(this, h) && c.force && sr(this.contentDOM, c.key, c.keyCode);
    });
  }
  /**
  Reset the view to the given state. (This will cause the entire
  document to be redrawn and all view plugins to be reinitialized,
  so you should probably only use it when the new state isn't
  derived from the old state. Otherwise, use
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
  */
  setState(e) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
    if (this.destroyed) {
      this.viewState.state = e;
      return;
    }
    this.updateState = 2;
    let t = this.hasFocus;
    try {
      for (let n of this.plugins)
        n.destroy(this);
      this.viewState = new tc(this, e), this.plugins = e.facet(tr).map((n) => new $o(n)), this.pluginMap.clear();
      for (let n of this.plugins)
        n.update(this);
      this.docView.destroy(), this.docView = new Va(this), this.inputState.ensureHandlers(this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    t && this.focus(), this.requestMeasure();
  }
  updatePlugins(e) {
    let t = e.startState.facet(tr), n = e.state.facet(tr);
    if (t != n) {
      let i = [];
      for (let o of n) {
        let s = t.indexOf(o);
        if (s < 0)
          i.push(new $o(o));
        else {
          let l = this.plugins[s];
          l.mustUpdate = e, i.push(l);
        }
      }
      for (let o of this.plugins)
        o.mustUpdate != e && o.destroy(this);
      this.plugins = i, this.pluginMap.clear();
    } else
      for (let i of this.plugins)
        i.mustUpdate = e;
    for (let i = 0; i < this.plugins.length; i++)
      this.plugins[i].update(this);
    t != n && this.inputState.ensureHandlers(this.plugins);
  }
  docViewUpdate() {
    for (let e of this.plugins) {
      let t = e.value;
      if (t && t.docViewUpdate)
        try {
          t.docViewUpdate(this);
        } catch (n) {
          Ut(this.state, n, "doc view update listener");
        }
    }
  }
  /**
  @internal
  */
  measure(e = !0) {
    if (this.destroyed)
      return;
    if (this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.observer.delayedAndroidKey) {
      this.measureScheduled = -1, this.requestMeasure();
      return;
    }
    this.measureScheduled = 0, e && this.observer.forceFlush();
    let t = null, n = this.viewState.scrollParent, i = this.viewState.getScrollOffset(), { scrollAnchorPos: o, scrollAnchorHeight: s } = this.viewState;
    Math.abs(i - this.viewState.scrollOffset) > 1 && (s = -1), this.viewState.scrollAnchorHeight = -1;
    try {
      for (let l = 0; ; l++) {
        if (s < 0)
          if (td(n || this.win))
            o = -1, s = this.viewState.heightMap.height;
          else {
            let f = this.viewState.scrollAnchorAt(i);
            o = f.from, s = f.top;
          }
        this.updateState = 1;
        let a = this.viewState.measure();
        if (!a && !this.measureRequests.length && this.viewState.scrollTarget == null)
          break;
        if (l > 5) {
          console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
          break;
        }
        let c = [];
        a & 4 || ([this.measureRequests, c] = [c, this.measureRequests]);
        let h = c.map((f) => {
          try {
            return f.read(this);
          } catch (g) {
            return Ut(this.state, g), sc;
          }
        }), d = Zi.create(this, this.state, []), u = !1;
        d.flags |= a, t ? t.flags |= a : t = d, this.updateState = 2, d.empty || (this.updatePlugins(d), this.inputState.update(d), this.updateAttrs(), u = this.docView.update(d), u && this.docViewUpdate());
        for (let f = 0; f < c.length; f++)
          if (h[f] != sc)
            try {
              let g = c[f];
              g.write && g.write(h[f], this);
            } catch (g) {
              Ut(this.state, g);
            }
        if (u && this.docView.updateSelection(!0), !d.viewportChanged && this.measureRequests.length == 0) {
          if (this.viewState.editorHeight)
            if (this.viewState.scrollTarget) {
              this.docView.scrollIntoView(this.viewState.scrollTarget), this.viewState.scrollTarget = null, s = -1;
              continue;
            } else {
              let g = ((o < 0 ? this.viewState.heightMap.height : this.viewState.lineBlockAt(o).top) - s) / this.scaleY;
              if ((g > 1 || g < -1) && !(I.ios && this.inputState.lastIOSMomentumScroll > Date.now() - 100) && (n == this.scrollDOM || this.hasFocus || Math.max(this.inputState.lastWheelEvent, this.inputState.lastTouchTime) > Date.now() - 100)) {
                i = i + g, n ? n.scrollTop += g : this.win.scrollBy(0, g), s = -1;
                continue;
              }
            }
          break;
        }
      }
    } finally {
      this.updateState = 0, this.measureScheduled = -1;
    }
    if (t && !t.empty)
      for (let l of this.state.facet(Ps))
        l(t);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return zs + " " + (this.state.facet(Ws) ? Hd : Fd) + " " + this.state.facet(Ai);
  }
  updateAttrs() {
    let e = lc(this, xd, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), t = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      writingsuggestions: "false",
      translate: "no",
      contenteditable: this.state.facet(en) ? "true" : "false",
      class: "cm-content",
      style: `${I.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (t["aria-readonly"] = "true"), lc(this, xl, t);
    let n = this.observer.ignore(() => {
      let i = Pa(this.contentDOM, this.contentAttrs, t), o = Pa(this.dom, this.editorAttrs, e);
      return i || o;
    });
    return this.editorAttrs = e, this.contentAttrs = t, n;
  }
  showAnnouncements(e) {
    let t = !0;
    for (let n of e)
      for (let i of n.effects)
        if (i.is(V.announce)) {
          t && (this.announceDOM.textContent = ""), t = !1;
          let o = this.announceDOM.appendChild(document.createElement("div"));
          o.textContent = i.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(Tr);
    let e = this.state.facet(V.cspNonce);
    hr.mount(this.root, this.styleModules.concat(mx).reverse(), e ? { nonce: e } : void 0);
  }
  readMeasured() {
    if (this.updateState == 2)
      throw new Error("Reading the editor layout isn't allowed during an update");
    this.updateState == 0 && this.measureScheduled > -1 && this.measure(!1);
  }
  /**
  Schedule a layout measurement, optionally providing callbacks to
  do custom DOM measuring followed by a DOM write phase. Using
  this is preferable reading DOM layout directly from, for
  example, an event handler, because it'll make sure measuring and
  drawing done by other components is synchronized, avoiding
  unnecessary DOM layout computations.
  */
  requestMeasure(e) {
    if (this.measureScheduled < 0 && (this.measureScheduled = this.win.requestAnimationFrame(() => this.measure())), e) {
      if (this.measureRequests.indexOf(e) > -1)
        return;
      if (e.key != null) {
        for (let t = 0; t < this.measureRequests.length; t++)
          if (this.measureRequests[t].key === e.key) {
            this.measureRequests[t] = e;
            return;
          }
      }
      this.measureRequests.push(e);
    }
  }
  /**
  Get the value of a specific plugin, if present. Note that
  plugins that crash can be dropped from a view, so even when you
  know you registered a given plugin, it is recommended to check
  the return value of this method.
  */
  plugin(e) {
    let t = this.pluginMap.get(e);
    return (t === void 0 || t && t.plugin != e) && this.pluginMap.set(e, t = this.plugins.find((n) => n.plugin == e) || null), t && t.update(this).value;
  }
  /**
  The top position of the document, in screen coordinates. This
  may be negative when the editor is scrolled down. Points
  directly to the top of the first line, not above the padding.
  */
  get documentTop() {
    return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
  }
  /**
  Reports the padding above and below the document.
  */
  get documentPadding() {
    return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
  }
  /**
  If the editor is transformed with CSS, this provides the scale
  along the X axis. Otherwise, it will just be 1. Note that
  transforms other than translation and scaling are not supported.
  */
  get scaleX() {
    return this.viewState.scaleX;
  }
  /**
  Provide the CSS transformed scale along the Y axis.
  */
  get scaleY() {
    return this.viewState.scaleY;
  }
  /**
  Find the text line or block widget at the given vertical
  position (which is interpreted as relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
  */
  elementAtHeight(e) {
    return this.readMeasured(), this.viewState.elementAtHeight(e);
  }
  /**
  Find the line block (see
  [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt)) at the given
  height, again interpreted relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
  */
  lineBlockAtHeight(e) {
    return this.readMeasured(), this.viewState.lineBlockAtHeight(e);
  }
  /**
  Get the extent and vertical position of all [line
  blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
  are relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
  */
  get viewportLineBlocks() {
    return this.viewState.viewportLines;
  }
  /**
  Find the line block around the given document position. A line
  block is a range delimited on both sides by either a
  non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line break, or the
  start/end of the document. It will usually just hold a line of
  text, but may be broken into multiple textblocks by block
  widgets.
  */
  lineBlockAt(e) {
    return this.viewState.lineBlockAt(e);
  }
  /**
  The editor's total content height.
  */
  get contentHeight() {
    return this.viewState.contentHeight;
  }
  /**
  Move a cursor position by [grapheme
  cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
  the motion is away from the line start, or towards it. In
  bidirectional text, the line is traversed in visual order, using
  the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
  When the start position was the last one on the line, the
  returned position will be across the line break. If there is no
  further line, the original position is returned.
  
  By default, this method moves over a single cluster. The
  optional `by` argument can be used to move across more. It will
  be called with the first cluster as argument, and should return
  a predicate that determines, for each subsequent cluster,
  whether it should also be moved over.
  */
  moveByChar(e, t, n) {
    return zo(this, e, _a(this, e, t, n));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(e, t) {
    return zo(this, e, _a(this, e, t, (n) => Ey(this, e.head, n)));
  }
  /**
  Get the cursor position visually at the start or end of a line.
  Note that this may differ from the _logical_ position at its
  start or end (which is simply at `line.from`/`line.to`) if text
  at the start or end goes against the line's base text direction.
  */
  visualLineSide(e, t) {
    let n = this.bidiSpans(e), i = this.textDirectionAt(e.from), o = n[t ? n.length - 1 : 0];
    return E.cursor(o.side(t, i) + e.from, o.forward(!t, i) ? 1 : -1);
  }
  /**
  Move to the next line boundary in the given direction. If
  `includeWrap` is true, line wrapping is on, and there is a
  further wrap point on the current line, the wrap point will be
  returned. Otherwise this function will return the start or end
  of the line.
  */
  moveToLineBoundary(e, t, n = !0) {
    return Ty(this, e, t, n);
  }
  /**
  Move a cursor position vertically. When `distance` isn't given,
  it defaults to moving to the next line (including wrapped
  lines). Otherwise, `distance` should provide a positive distance
  in pixels.
  
  When `start` has a
  [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
  motion will use that as a target horizontal position. Otherwise,
  the cursor's own horizontal position is used. The returned
  cursor will have its goal column set to whichever column was
  used.
  */
  moveVertically(e, t, n) {
    return zo(this, e, Oy(this, e, t, n));
  }
  /**
  Find the DOM parent node and offset (child offset if `node` is
  an element, character offset when it is a text node) at the
  given document position.
  
  Note that for positions that aren't currently in
  `visibleRanges`, the resulting DOM position isn't necessarily
  meaningful (it may just point before or after a placeholder
  element).
  */
  domAtPos(e, t = 1) {
    return this.docView.domAtPos(e, t);
  }
  /**
  Find the document position at the given DOM node. Can be useful
  for associating positions with DOM events. Will raise an error
  when `node` isn't part of the editor content.
  */
  posAtDOM(e, t = 0) {
    return this.docView.posFromDOM(e, t);
  }
  posAtCoords(e, t = !0) {
    this.readMeasured();
    let n = Fs(this, e, t);
    return n && n.pos;
  }
  posAndSideAtCoords(e, t = !0) {
    return this.readMeasured(), Fs(this, e, t);
  }
  /**
  Get the screen coordinates at the given document position.
  `side` determines whether the coordinates are based on the
  element before (-1) or after (1) the position (if no element is
  available on the given side, the method will transparently use
  another strategy to get reasonable coordinates).
  */
  coordsAtPos(e, t = 1) {
    this.readMeasured();
    let n = this.state.doc.lineAt(e), i = this.bidiSpans(n), o = i[Kt.find(i, e - n.from, -1, t)];
    return this.docView.coordsAt(e, t, o.dir == Ee.RTL);
  }
  /**
  Return the rectangle around a given character. If `pos` does not
  point in front of a character that is in the viewport and
  rendered (i.e. not replaced, not a line break), this will return
  null. For space characters that are a line wrap point, this will
  return the position before the line break.
  */
  coordsForChar(e) {
    return this.readMeasured(), this.docView.coordsForChar(e);
  }
  /**
  The default width of a character in the editor. May not
  accurately reflect the width of all characters (given variable
  width fonts or styling of invididual ranges).
  */
  get defaultCharacterWidth() {
    return this.viewState.heightOracle.charWidth;
  }
  /**
  The default height of a line in the editor. May not be accurate
  for all lines.
  */
  get defaultLineHeight() {
    return this.viewState.heightOracle.lineHeight;
  }
  /**
  The text direction
  ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
  CSS property) of the editor's content element.
  */
  get textDirection() {
    return this.viewState.defaultTextDirection;
  }
  /**
  Find the text direction of the block at the given position, as
  assigned by CSS. If
  [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
  isn't enabled, or the given position is outside of the viewport,
  this will always return the same as
  [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
  this may trigger a DOM layout.
  */
  textDirectionAt(e) {
    return !this.state.facet(md) || e < this.viewport.from || e > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(e));
  }
  /**
  Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
  (as determined by the
  [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
  CSS property of its content element).
  */
  get lineWrapping() {
    return this.viewState.heightOracle.lineWrapping;
  }
  /**
  Returns the bidirectional text structure of the given line
  (which should be in the current document) as an array of span
  objects. The order of these spans matches the [text
  direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
  left-to-right, the leftmost spans come first, otherwise the
  rightmost spans come first.
  */
  bidiSpans(e) {
    if (e.length > wx)
      return ld(e.length);
    let t = this.textDirectionAt(e.from), n;
    for (let o of this.bidiCache)
      if (o.from == e.from && o.dir == t && (o.fresh || sd(o.isolates, n = Ha(this, e))))
        return o.order;
    n || (n = Ha(this, e));
    let i = Q0(e.text, t, n);
    return this.bidiCache.push(new ro(e.from, e.to, t, n, !0, i)), i;
  }
  /**
  Check whether the editor has focus.
  */
  get hasFocus() {
    var e;
    return (this.dom.ownerDocument.hasFocus() || I.safari && ((e = this.inputState) === null || e === void 0 ? void 0 : e.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  /**
  Put focus on the editor.
  */
  focus() {
    this.observer.ignore(() => {
      ed(this.contentDOM), this.docView.updateSelection();
    });
  }
  /**
  Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
  necessary when moving the editor's existing DOM to a new window or shadow root.
  */
  setRoot(e) {
    this._root != e && (this._root = e, this.observer.setWindow((e.nodeType == 9 ? e : e.ownerDocument).defaultView || window), this.mountStyles());
  }
  /**
  Clean up this editor view, removing its element from the
  document, unregistering event handlers, and notifying
  plugins. The view instance can no longer be used after
  calling this.
  */
  destroy() {
    this.root.activeElement == this.contentDOM && this.contentDOM.blur();
    for (let e of this.plugins)
      e.destroy(this);
    this.plugins = [], this.inputState.destroy(), this.docView.destroy(), this.dom.remove(), this.observer.destroy(), this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.destroyed = !0;
  }
  /**
  Returns an effect that can be
  [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
  cause it to scroll the given position or range into view.
  */
  static scrollIntoView(e, t = {}) {
    var n, i, o, s;
    return bi.of(new lr(typeof e == "number" ? E.cursor(e) : e, (n = t.y) !== null && n !== void 0 ? n : "nearest", (i = t.x) !== null && i !== void 0 ? i : "nearest", (o = t.yMargin) !== null && o !== void 0 ? o : 5, (s = t.xMargin) !== null && s !== void 0 ? s : 5));
  }
  /**
  Return an effect that resets the editor to its current (at the
  time this method was called) scroll position. Note that this
  only affects the editor's own scrollable element, not parents.
  See also
  [`EditorViewConfig.scrollTo`](https://codemirror.net/6/docs/ref/#view.EditorViewConfig.scrollTo).
  
  The effect should be used with a document identical to the one
  it was created for. Failing to do so is not an error, but may
  not scroll to the expected position. You can
  [map](https://codemirror.net/6/docs/ref/#state.StateEffect.map) the effect to account for changes.
  */
  scrollSnapshot() {
    let { scrollTop: e, scrollLeft: t } = this.scrollDOM, n = this.viewState.scrollAnchorAt(e);
    return bi.of(new lr(E.cursor(n.from), "start", "start", n.top - e, t, !0));
  }
  /**
  Enable or disable tab-focus mode, which disables key bindings
  for Tab and Shift-Tab, letting the browser's default
  focus-changing behavior go through instead. This is useful to
  prevent trapping keyboard users in your editor.
  
  Without argument, this toggles the mode. With a boolean, it
  enables (true) or disables it (false). Given a number, it
  temporarily enables the mode until that number of milliseconds
  have passed or another non-Tab key is pressed.
  */
  setTabFocusMode(e) {
    e == null ? this.inputState.tabFocusMode = this.inputState.tabFocusMode < 0 ? 0 : -1 : typeof e == "boolean" ? this.inputState.tabFocusMode = e ? 0 : -1 : this.inputState.tabFocusMode != 0 && (this.inputState.tabFocusMode = Date.now() + e);
  }
  /**
  Returns an extension that can be used to add DOM event handlers.
  The value should be an object mapping event names to handler
  functions. For any given event, such functions are ordered by
  extension precedence, and the first handler to return true will
  be assumed to have handled that event, and no other handlers or
  built-in behavior will be activated for it. These are registered
  on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
  for `scroll` handlers, which will be called any time the
  editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
  its parent nodes is scrolled.
  */
  static domEventHandlers(e) {
    return bt.define(() => ({}), { eventHandlers: e });
  }
  /**
  Create an extension that registers DOM event observers. Contrary
  to event [handlers](https://codemirror.net/6/docs/ref/#view.EditorView^domEventHandlers),
  observers can't be prevented from running by a higher-precedence
  handler returning true. They also don't prevent other handlers
  and observers from running when they return true, and should not
  call `preventDefault`.
  */
  static domEventObservers(e) {
    return bt.define(() => ({}), { eventObservers: e });
  }
  /**
  Create a theme extension. The first argument can be a
  [`style-mod`](https://code.haverbeke.berlin/marijn/style-mod#documentation)
  style spec providing the styles for the theme. These will be
  prefixed with a generated class for the style.
  
  Because the selectors will be prefixed with a scope class, rule
  that directly match the editor's [wrapper
  element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
  added—need to be explicitly differentiated by adding an `&` to
  the selector for that element—for example
  `&.cm-focused`.
  
  When `dark` is set to true, the theme will be marked as dark,
  which will cause the `&dark` rules from [base
  themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
  `&light` when a light theme is active).
  */
  static theme(e, t) {
    let n = hr.newName(), i = [Ai.of(n), Tr.of(Vs(`.${n}`, e))];
    return t && t.dark && i.push(Ws.of(!0)), i;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(e) {
    return hl.lowest(Tr.of(Vs("." + zs, e, Wd)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(e) {
    var t;
    let n = e.querySelector(".cm-content"), i = n && Se.get(n) || Se.get(e);
    return ((t = i == null ? void 0 : i.root) === null || t === void 0 ? void 0 : t.view) || null;
  }
}
V.styleModule = Tr;
V.inputHandler = fd;
V.clipboardInputFilter = gl;
V.clipboardOutputFilter = yl;
V.scrollHandler = gd;
V.focusChangeEffect = pd;
V.perLineTextDirection = md;
V.exceptionSink = ud;
V.updateListener = Ps;
V.editable = en;
V.mouseSelectionStyle = dd;
V.dragMovesSelection = hd;
V.clickAddsSelectionRange = cd;
V.decorations = go;
V.blockWrappers = bd;
V.outerDecorations = bl;
V.atomicRanges = Zr;
V.bidiIsolatedRanges = wd;
V.cursorScrollMargin = /* @__PURE__ */ H.define({
  combine: (r) => {
    let e = 5, t = 5;
    for (let n of r)
      typeof n == "number" ? e = t = n : { x: e, y: t } = n;
    return { x: e, y: t };
  }
});
V.scrollMargins = vd;
V.darkTheme = Ws;
V.cspNonce = /* @__PURE__ */ H.define({ combine: (r) => r.length ? r[0] : "" });
V.contentAttributes = xl;
V.editorAttributes = xd;
V.lineWrapping = /* @__PURE__ */ V.contentAttributes.of({ class: "cm-lineWrapping" });
V.announce = /* @__PURE__ */ xe.define();
const wx = 4096, sc = {};
class ro {
  constructor(e, t, n, i, o, s) {
    this.from = e, this.to = t, this.dir = n, this.isolates = i, this.fresh = o, this.order = s;
  }
  static update(e, t) {
    if (t.empty && !e.some((o) => o.fresh))
      return e;
    let n = [], i = e.length ? e[e.length - 1].dir : Ee.LTR;
    for (let o = Math.max(0, e.length - 10); o < e.length; o++) {
      let s = e[o];
      s.dir == i && !t.touchesRange(s.from, s.to) && n.push(new ro(t.mapPos(s.from, 1), t.mapPos(s.to, -1), s.dir, s.isolates, !1, s.order));
    }
    return n;
  }
}
function lc(r, e, t) {
  for (let n = r.state.facet(e), i = n.length - 1; i >= 0; i--) {
    let o = n[i], s = typeof o == "function" ? o(r) : o;
    s && fl(s, t);
  }
  return t;
}
const vx = I.mac ? "mac" : I.windows ? "win" : I.linux ? "linux" : "key";
function kx(r, e) {
  const t = r.split(/-(?!$)/);
  let n = t[t.length - 1];
  n == "Space" && (n = " ");
  let i, o, s, l;
  for (let a = 0; a < t.length - 1; ++a) {
    const c = t[a];
    if (/^(cmd|meta|m)$/i.test(c))
      l = !0;
    else if (/^a(lt)?$/i.test(c))
      i = !0;
    else if (/^(c|ctrl|control)$/i.test(c))
      o = !0;
    else if (/^s(hift)?$/i.test(c))
      s = !0;
    else if (/^mod$/i.test(c))
      e == "mac" ? l = !0 : o = !0;
    else
      throw new Error("Unrecognized modifier name: " + c);
  }
  return i && (n = "Alt-" + n), o && (n = "Ctrl-" + n), l && (n = "Meta-" + n), s && (n = "Shift-" + n), n;
}
function Mi(r, e, t) {
  return e.altKey && (r = "Alt-" + r), e.ctrlKey && (r = "Ctrl-" + r), e.metaKey && (r = "Meta-" + r), t !== !1 && e.shiftKey && (r = "Shift-" + r), r;
}
const Sx = /* @__PURE__ */ hl.default(/* @__PURE__ */ V.domEventHandlers({
  keydown(r, e) {
    return _d(Vd(e.state), r, e, "editor");
  }
})), zd = /* @__PURE__ */ H.define({ enables: Sx }), ac = /* @__PURE__ */ new WeakMap();
function Vd(r) {
  let e = r.facet(zd), t = ac.get(e);
  return t || ac.set(e, t = Ax(e.reduce((n, i) => n.concat(i), []))), t;
}
function Cv(r, e, t) {
  return _d(Vd(r.state), e, r, t);
}
let mn = null;
const Cx = 4e3;
function Ax(r, e = vx) {
  let t = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null), i = (s, l) => {
    let a = n[s];
    if (a == null)
      n[s] = l;
    else if (a != l)
      throw new Error("Key binding " + s + " is used both as a regular binding and as a multi-stroke prefix");
  }, o = (s, l, a, c, h) => {
    var d, u;
    let f = t[s] || (t[s] = /* @__PURE__ */ Object.create(null)), g = l.split(/ (?!$)/).map((v) => kx(v, e));
    for (let v = 1; v < g.length; v++) {
      let D = g.slice(0, v).join(" ");
      i(D, !0), f[D] || (f[D] = {
        preventDefault: !0,
        stopPropagation: !1,
        run: [(N) => {
          let Y = mn = { view: N, prefix: D, scope: s };
          return setTimeout(() => {
            mn == Y && (mn = null);
          }, Cx), !0;
        }]
      });
    }
    let w = g.join(" ");
    i(w, !1);
    let k = f[w] || (f[w] = {
      preventDefault: !1,
      stopPropagation: !1,
      run: ((u = (d = f._any) === null || d === void 0 ? void 0 : d.run) === null || u === void 0 ? void 0 : u.slice()) || []
    });
    a && k.run.push(a), c && (k.preventDefault = !0), h && (k.stopPropagation = !0);
  };
  for (let s of r) {
    let l = s.scope ? s.scope.split(" ") : ["editor"];
    if (s.any)
      for (let c of l) {
        let h = t[c] || (t[c] = /* @__PURE__ */ Object.create(null));
        h._any || (h._any = { preventDefault: !1, stopPropagation: !1, run: [] });
        let { any: d } = s;
        for (let u in h)
          h[u].run.push((f) => d(f, _s));
      }
    let a = s[e] || s.key;
    if (a)
      for (let c of l)
        o(c, a, s.run, s.preventDefault, s.stopPropagation), s.shift && o(c, "Shift-" + a, s.shift, s.preventDefault, s.stopPropagation);
  }
  return t;
}
let _s = null;
function _d(r, e, t, n) {
  _s = e;
  let i = F0(e), o = v0(i, 0), s = k0(o) == i.length && i != " ", l = "", a = !1, c = !1, h = !1;
  mn && mn.view == t && mn.scope == n && (l = mn.prefix + " ", Od.indexOf(e.keyCode) < 0 && (c = !0, mn = null));
  let d = /* @__PURE__ */ new Set(), u = (k) => {
    if (k) {
      for (let v of k.run)
        if (!d.has(v) && (d.add(v), v(t)))
          return k.stopPropagation && (h = !0), !0;
      k.preventDefault && (k.stopPropagation && (h = !0), c = !0);
    }
    return !1;
  }, f = r[n], g, w;
  return f && (u(f[l + Mi(i, e, !s)]) ? a = !0 : s && (e.altKey || e.metaKey || e.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
  !(I.windows && e.ctrlKey && e.altKey) && // Alt-combinations on macOS tend to be typed characters
  !(I.mac && e.altKey && !(e.ctrlKey || e.metaKey)) && (g = xn[e.keyCode]) && g != i ? (u(f[l + Mi(g, e, !0)]) || e.shiftKey && (w = Vr[e.keyCode]) != i && w != g && u(f[l + Mi(w, e, !1)])) && (a = !0) : s && e.shiftKey && u(f[l + Mi(i, e, !0)]) && (a = !0), !a && u(f._any) && (a = !0)), c && (a = !0), a && h && e.stopPropagation(), _s = null, a;
}
const Mx = /* @__PURE__ */ H.define({
  combine(r) {
    return po(r, {
      cursorBlinkRate: 1200,
      drawRangeCursor: !0,
      iosSelectionHandles: !0
    }, {
      cursorBlinkRate: (e, t) => Math.min(e, t),
      drawRangeCursor: (e, t) => e || t
    });
  }
});
function Av(r) {
  return r.facet(Mx);
}
class Dx extends qn {
  constructor(e) {
    super(), this.content = e;
  }
  toDOM(e) {
    let t = document.createElement("span");
    return t.className = "cm-placeholder", t.style.pointerEvents = "none", t.appendChild(typeof this.content == "string" ? document.createTextNode(this.content) : typeof this.content == "function" ? this.content(e) : this.content.cloneNode(!0)), t.setAttribute("aria-hidden", "true"), t;
  }
  coordsAt(e) {
    let t = e.firstChild ? Nr(e.firstChild) : [];
    if (!t.length)
      return null;
    let n = window.getComputedStyle(e.parentNode), i = Kr(t[0], n.direction != "rtl"), o = parseInt(n.lineHeight);
    return i.bottom - i.top > o * 1.5 ? { left: i.left, right: i.right, top: i.top, bottom: i.top + o } : i;
  }
  ignoreEvent() {
    return !1;
  }
}
function Tx(r) {
  let e = bt.fromClass(class {
    constructor(t) {
      this.view = t, this.placeholder = r ? te.set([te.widget({ widget: new Dx(r), side: 1 }).range(0)]) : te.none;
    }
    get decorations() {
      return this.view.state.doc.length ? te.none : this.placeholder;
    }
  }, { decorations: (t) => t.decorations });
  return typeof r == "string" ? [
    e,
    V.contentAttributes.of({ "aria-placeholder": r })
  ] : e;
}
const js = 2e3;
function Ex(r, e, t) {
  let n = Math.min(e.line, t.line), i = Math.max(e.line, t.line), o = [];
  if (e.off > js || t.off > js || e.col < 0 || t.col < 0) {
    let s = Math.min(e.off, t.off), l = Math.max(e.off, t.off);
    for (let a = n; a <= i; a++) {
      let c = r.doc.line(a);
      c.length <= l && o.push(E.range(c.from + s, c.to + l));
    }
  } else {
    let s = Math.min(e.col, t.col), l = Math.max(e.col, t.col);
    for (let a = n; a <= i; a++) {
      let c = r.doc.line(a), h = As(c.text, s, r.tabSize, !0);
      if (h < 0)
        o.push(E.cursor(c.to));
      else {
        let d = As(c.text, l, r.tabSize);
        o.push(E.range(c.from + h, c.from + d));
      }
    }
  }
  return o;
}
function Ox(r, e) {
  let t = r.coordsAtPos(r.viewport.from);
  return t ? Math.round(Math.abs((t.left - e) / r.defaultCharacterWidth)) : -1;
}
function cc(r, e) {
  let t = r.posAtCoords({ x: e.clientX, y: e.clientY }, !1), n = r.state.doc.lineAt(t), i = t - n.from, o = i > js ? -1 : i == n.length ? Ox(r, e.clientX) : Gr(n.text, r.state.tabSize, t - n.from);
  return { line: n.number, col: o, off: i };
}
function Lx(r, e) {
  let t = cc(r, e), n = r.state.selection;
  return t ? {
    update(i) {
      if (i.docChanged) {
        let o = i.changes.mapPos(i.startState.doc.line(t.line).from), s = i.state.doc.lineAt(o);
        t = { line: s.number, col: t.col, off: Math.min(t.off, s.length) }, n = n.map(i.changes);
      }
    },
    get(i, o, s) {
      let l = cc(r, i);
      if (!l)
        return n;
      let a = Ex(r.state, t, l);
      return a.length ? s ? E.create(a.concat(n.ranges)) : E.create(a) : n;
    }
  } : null;
}
function Rx(r) {
  let e = (t) => t.altKey && t.button == 0;
  return V.mouseSelectionStyle.of((t, n) => e(n) ? Lx(t, n) : null);
}
const Nx = {
  Alt: [18, (r) => !!r.altKey],
  Control: [17, (r) => !!r.ctrlKey],
  Shift: [16, (r) => !!r.shiftKey],
  Meta: [91, (r) => !!r.metaKey]
}, Bx = { style: "cursor: crosshair" };
function Ix(r = {}) {
  let [e, t] = Nx[r.key || "Alt"], n = bt.fromClass(class {
    constructor(i) {
      this.view = i, this.isDown = !1;
    }
    set(i) {
      this.isDown != i && (this.isDown = i, this.view.update([]));
    }
  }, {
    eventObservers: {
      keydown(i) {
        this.set(i.keyCode == e || t(i));
      },
      keyup(i) {
        (i.keyCode == e || !t(i)) && this.set(!1);
      },
      mousemove(i) {
        this.set(t(i));
      }
    }
  });
  return [
    n,
    V.contentAttributes.of((i) => {
      var o;
      return !((o = i.plugin(n)) === null || o === void 0) && o.isDown ? Bx : null;
    })
  ];
}
const hc = /* @__PURE__ */ H.define({
  combine(r) {
    let e, t;
    for (let n of r)
      e = e || n.topContainer, t = t || n.bottomContainer;
    return { topContainer: e, bottomContainer: t };
  }
}), Px = /* @__PURE__ */ bt.fromClass(class {
  constructor(r) {
    this.input = r.state.facet(uc), this.specs = this.input.filter((t) => t), this.panels = this.specs.map((t) => t(r));
    let e = r.state.facet(hc);
    this.top = new Di(r, !0, e.topContainer), this.bottom = new Di(r, !1, e.bottomContainer), this.top.sync(this.panels.filter((t) => t.top)), this.bottom.sync(this.panels.filter((t) => !t.top));
    for (let t of this.panels)
      t.dom.classList.add("cm-panel"), t.mount && t.mount();
  }
  update(r) {
    let e = r.state.facet(hc);
    this.top.container != e.topContainer && (this.top.sync([]), this.top = new Di(r.view, !0, e.topContainer)), this.bottom.container != e.bottomContainer && (this.bottom.sync([]), this.bottom = new Di(r.view, !1, e.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let t = r.state.facet(uc);
    if (t != this.input) {
      let n = t.filter((a) => a), i = [], o = [], s = [], l = [];
      for (let a of n) {
        let c = this.specs.indexOf(a), h;
        c < 0 ? (h = a(r.view), l.push(h)) : (h = this.panels[c], h.update && h.update(r)), i.push(h), (h.top ? o : s).push(h);
      }
      this.specs = n, this.panels = i, this.top.sync(o), this.bottom.sync(s);
      for (let a of l)
        a.dom.classList.add("cm-panel"), a.mount && a.mount();
    } else
      for (let n of this.panels)
        n.update && n.update(r);
  }
  destroy() {
    this.top.sync([]), this.bottom.sync([]);
  }
}, {
  provide: (r) => V.scrollMargins.of((e) => {
    let t = e.plugin(r);
    return t && { top: t.top.scrollMargin(), bottom: t.bottom.scrollMargin() };
  })
});
class Di {
  constructor(e, t, n) {
    this.view = e, this.top = t, this.container = n, this.dom = void 0, this.classes = "", this.panels = [], this.syncClasses();
  }
  sync(e) {
    for (let t of this.panels)
      t.destroy && e.indexOf(t) < 0 && t.destroy();
    this.panels = e, this.syncDOM();
  }
  syncDOM() {
    if (this.panels.length == 0) {
      this.dom && (this.dom.remove(), this.dom = void 0);
      return;
    }
    if (!this.dom) {
      this.dom = document.createElement("div"), this.dom.className = this.top ? "cm-panels cm-panels-top" : "cm-panels cm-panels-bottom", this.dom.style[this.top ? "top" : "bottom"] = "0";
      let t = this.container || this.view.dom;
      t.insertBefore(this.dom, this.top ? t.firstChild : null);
    }
    let e = this.dom.firstChild;
    for (let t of this.panels)
      if (t.dom.parentNode == this.dom) {
        for (; e != t.dom; )
          e = dc(e);
        e = e.nextSibling;
      } else
        this.dom.insertBefore(t.dom, e);
    for (; e; )
      e = dc(e);
  }
  scrollMargin() {
    return !this.dom || this.container ? 0 : Math.max(0, this.top ? this.dom.getBoundingClientRect().bottom - Math.max(0, this.view.scrollDOM.getBoundingClientRect().top) : Math.min(innerHeight, this.view.scrollDOM.getBoundingClientRect().bottom) - this.dom.getBoundingClientRect().top);
  }
  syncClasses() {
    if (!(!this.container || this.classes == this.view.themeClasses)) {
      for (let e of this.classes.split(" "))
        e && this.container.classList.remove(e);
      for (let e of (this.classes = this.view.themeClasses).split(" "))
        e && this.container.classList.add(e);
    }
  }
}
function dc(r) {
  let e = r.nextSibling;
  return r.remove(), e;
}
const uc = /* @__PURE__ */ H.define({
  enables: Px
});
class Kn extends zn {
  /**
  @internal
  */
  compare(e) {
    return this == e || this.constructor == e.constructor && this.eq(e);
  }
  /**
  Compare this marker to another marker of the same type.
  */
  eq(e) {
    return !1;
  }
  /**
  Called if the marker has a `toDOM` method and its representation
  was removed from a gutter.
  */
  destroy(e) {
  }
}
Kn.prototype.elementClass = "";
Kn.prototype.toDOM = void 0;
Kn.prototype.mapMode = ct.TrackBefore;
Kn.prototype.startSide = Kn.prototype.endSide = -1;
Kn.prototype.point = !0;
const jo = /* @__PURE__ */ H.define(), $x = /* @__PURE__ */ H.define(), Fi = /* @__PURE__ */ H.define(), fc = /* @__PURE__ */ H.define({
  combine: (r) => r.some((e) => e)
});
function Fx(r) {
  return [
    Hx
  ];
}
const Hx = /* @__PURE__ */ bt.fromClass(class {
  constructor(r) {
    this.view = r, this.domAfter = null, this.prevViewport = r.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters cm-gutters-before", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.gutters = r.state.facet(Fi).map((e) => new mc(r, e)), this.fixed = !r.state.facet(fc);
    for (let e of this.gutters)
      e.config.side == "after" ? this.getDOMAfter().appendChild(e.dom) : this.dom.appendChild(e.dom);
    this.fixed && (this.dom.style.position = "sticky"), this.syncGutters(!1), r.scrollDOM.insertBefore(this.dom, r.contentDOM);
  }
  getDOMAfter() {
    return this.domAfter || (this.domAfter = document.createElement("div"), this.domAfter.className = "cm-gutters cm-gutters-after", this.domAfter.setAttribute("aria-hidden", "true"), this.domAfter.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.domAfter.style.position = this.fixed ? "sticky" : "", this.view.scrollDOM.appendChild(this.domAfter)), this.domAfter;
  }
  update(r) {
    if (this.updateGutters(r)) {
      let e = this.prevViewport, t = r.view.viewport, n = Math.min(e.to, t.to) - Math.max(e.from, t.from);
      this.syncGutters(n < (t.to - t.from) * 0.8);
    }
    if (r.geometryChanged) {
      let e = this.view.contentHeight / this.view.scaleY + "px";
      this.dom.style.minHeight = e, this.domAfter && (this.domAfter.style.minHeight = e);
    }
    this.view.state.facet(fc) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : "", this.domAfter && (this.domAfter.style.position = this.fixed ? "sticky" : "")), this.prevViewport = r.view.viewport;
  }
  syncGutters(r) {
    let e = this.dom.nextSibling;
    r && (this.dom.remove(), this.domAfter && this.domAfter.remove());
    let t = oe.iter(this.view.state.facet(jo), this.view.viewport.from), n = [], i = this.gutters.map((o) => new Wx(o, this.view.viewport, -this.view.documentPadding.top));
    for (let o of this.view.viewportLineBlocks)
      if (n.length && (n = []), Array.isArray(o.type)) {
        let s = !0;
        for (let l of o.type)
          if (l.type == nt.Text && s) {
            Ks(t, n, l.from);
            for (let a of i)
              a.line(this.view, l, n);
            s = !1;
          } else if (l.widget)
            for (let a of i)
              a.widget(this.view, l);
      } else if (o.type == nt.Text) {
        Ks(t, n, o.from);
        for (let s of i)
          s.line(this.view, o, n);
      } else if (o.widget)
        for (let s of i)
          s.widget(this.view, o);
    for (let o of i)
      o.finish();
    r && (this.view.scrollDOM.insertBefore(this.dom, e), this.domAfter && this.view.scrollDOM.appendChild(this.domAfter));
  }
  updateGutters(r) {
    let e = r.startState.facet(Fi), t = r.state.facet(Fi), n = r.docChanged || r.heightChanged || r.viewportChanged || !oe.eq(r.startState.facet(jo), r.state.facet(jo), r.view.viewport.from, r.view.viewport.to);
    if (e == t)
      for (let i of this.gutters)
        i.update(r) && (n = !0);
    else {
      n = !0;
      let i = [];
      for (let o of t) {
        let s = e.indexOf(o);
        s < 0 ? i.push(new mc(this.view, o)) : (this.gutters[s].update(r), i.push(this.gutters[s]));
      }
      for (let o of this.gutters)
        o.dom.remove(), i.indexOf(o) < 0 && o.destroy();
      for (let o of i)
        o.config.side == "after" ? this.getDOMAfter().appendChild(o.dom) : this.dom.appendChild(o.dom);
      this.gutters = i;
    }
    return n;
  }
  destroy() {
    for (let r of this.gutters)
      r.destroy();
    this.dom.remove(), this.domAfter && this.domAfter.remove();
  }
}, {
  provide: (r) => V.scrollMargins.of((e) => {
    let t = e.plugin(r);
    if (!t || t.gutters.length == 0 || !t.fixed)
      return null;
    let n = t.dom.offsetWidth * e.scaleX, i = t.domAfter ? t.domAfter.offsetWidth * e.scaleX : 0;
    return e.textDirection == Ee.LTR ? { left: n, right: i } : { right: n, left: i };
  })
});
function pc(r) {
  return Array.isArray(r) ? r : [r];
}
function Ks(r, e, t) {
  for (; r.value && r.from <= t; )
    r.from == t && e.push(r.value), r.next();
}
class Wx {
  constructor(e, t, n) {
    this.gutter = e, this.height = n, this.i = 0, this.cursor = oe.iter(e.markers, t.from);
  }
  addElement(e, t, n) {
    let { gutter: i } = this, o = (t.top - this.height) / e.scaleY, s = t.height / e.scaleY;
    if (this.i == i.elements.length) {
      let l = new jd(e, s, o, n);
      i.elements.push(l), i.dom.appendChild(l.dom);
    } else
      i.elements[this.i].update(e, s, o, n);
    this.height = t.bottom, this.i++;
  }
  line(e, t, n) {
    let i = [];
    Ks(this.cursor, i, t.from), n.length && (i = i.concat(n));
    let o = this.gutter.config.lineMarker(e, t, i);
    o && i.unshift(o);
    let s = this.gutter;
    i.length == 0 && !s.config.renderEmptyElements || this.addElement(e, t, i);
  }
  widget(e, t) {
    let n = this.gutter.config.widgetMarker(e, t.widget, t), i = n ? [n] : null;
    for (let o of e.state.facet($x)) {
      let s = o(e, t.widget, t);
      s && (i || (i = [])).push(s);
    }
    i && this.addElement(e, t, i);
  }
  finish() {
    let e = this.gutter;
    for (; e.elements.length > this.i; ) {
      let t = e.elements.pop();
      e.dom.removeChild(t.dom), t.destroy();
    }
  }
}
class mc {
  constructor(e, t) {
    this.view = e, this.config = t, this.elements = [], this.spacer = null, this.dom = document.createElement("div"), this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
    for (let n in t.domEventHandlers)
      this.dom.addEventListener(n, (i) => {
        let o = i.target, s;
        if (o != this.dom && this.dom.contains(o)) {
          for (; o.parentNode != this.dom; )
            o = o.parentNode;
          let a = o.getBoundingClientRect();
          s = (a.top + a.bottom) / 2;
        } else
          s = i.clientY;
        let l = e.lineBlockAtHeight(s - e.documentTop);
        t.domEventHandlers[n](e, l, i) && i.preventDefault();
      });
    this.markers = pc(t.markers(e)), t.initialSpacer && (this.spacer = new jd(e, 0, 0, [t.initialSpacer(e)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(e) {
    let t = this.markers;
    if (this.markers = pc(this.config.markers(e.view)), this.spacer && this.config.updateSpacer) {
      let i = this.config.updateSpacer(this.spacer.markers[0], e);
      i != this.spacer.markers[0] && this.spacer.update(e.view, 0, 0, [i]);
    }
    let n = e.view.viewport;
    return !oe.eq(this.markers, t, n.from, n.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(e) : !1);
  }
  destroy() {
    for (let e of this.elements)
      e.destroy();
  }
}
class jd {
  constructor(e, t, n, i) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(e, t, n, i);
  }
  update(e, t, n, i) {
    this.height != t && (this.height = t, this.dom.style.height = t + "px"), this.above != n && (this.dom.style.marginTop = (this.above = n) ? n + "px" : ""), zx(this.markers, i) || this.setMarkers(e, i);
  }
  setMarkers(e, t) {
    let n = "cm-gutterElement", i = this.dom.firstChild;
    for (let o = 0, s = 0; ; ) {
      let l = s, a = o < t.length ? t[o++] : null, c = !1;
      if (a) {
        let h = a.elementClass;
        h && (n += " " + h);
        for (let d = s; d < this.markers.length; d++)
          if (this.markers[d].compare(a)) {
            l = d, c = !0;
            break;
          }
      } else
        l = this.markers.length;
      for (; s < l; ) {
        let h = this.markers[s++];
        if (h.toDOM) {
          h.destroy(i);
          let d = i.nextSibling;
          i.remove(), i = d;
        }
      }
      if (!a)
        break;
      a.toDOM && (c ? i = i.nextSibling : this.dom.insertBefore(a.toDOM(e), i)), c && s++;
    }
    this.dom.className = n, this.markers = t;
  }
  destroy() {
    this.setMarkers(null, []);
  }
}
function zx(r, e) {
  if (r.length != e.length)
    return !1;
  for (let t = 0; t < r.length; t++)
    if (!r[t].compare(e[t]))
      return !1;
  return !0;
}
const Vx = /* @__PURE__ */ H.define(), _x = /* @__PURE__ */ H.define(), nr = /* @__PURE__ */ H.define({
  combine(r) {
    return po(r, { formatNumber: String, domEventHandlers: {} }, {
      domEventHandlers(e, t) {
        let n = Object.assign({}, e);
        for (let i in t) {
          let o = n[i], s = t[i];
          n[i] = o ? (l, a, c) => o(l, a, c) || s(l, a, c) : s;
        }
        return n;
      }
    });
  }
});
class Ko extends Kn {
  constructor(e) {
    super(), this.number = e;
  }
  eq(e) {
    return this.number == e.number;
  }
  toDOM() {
    return document.createTextNode(this.number);
  }
}
function Uo(r, e) {
  return r.state.facet(nr).formatNumber(e, r.state);
}
const jx = /* @__PURE__ */ Fi.compute([nr], (r) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(e) {
    return e.state.facet(Vx);
  },
  lineMarker(e, t, n) {
    return n.some((i) => i.toDOM) ? null : new Ko(Uo(e, e.state.doc.lineAt(t.from).number));
  },
  widgetMarker: (e, t, n) => {
    for (let i of e.state.facet(_x)) {
      let o = i(e, t, n);
      if (o)
        return o;
    }
    return null;
  },
  lineMarkerChange: (e) => e.startState.facet(nr) != e.state.facet(nr),
  initialSpacer(e) {
    return new Ko(Uo(e, gc(e.state.doc.lines)));
  },
  updateSpacer(e, t) {
    let n = Uo(t.view, gc(t.view.state.doc.lines));
    return n == e.number ? e : new Ko(n);
  },
  domEventHandlers: r.facet(nr).domEventHandlers,
  side: "before"
}));
function Kx(r = {}) {
  return [
    nr.of(r),
    Fx(),
    jx
  ];
}
function gc(r) {
  let e = 9;
  for (; e < r; )
    e = e * 10 + 9;
  return e;
}
const Ux = 1024;
let qx = 0;
class qo {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
class re {
  /**
  Create a new node prop type.
  */
  constructor(e = {}) {
    this.id = qx++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
      throw new Error("This node type doesn't define a deserialize function");
    }), this.combine = e.combine || null;
  }
  /**
  This is meant to be used with
  [`NodeSet.extend`](#common.NodeSet.extend) or
  [`LRParser.configure`](#lr.ParserConfig.props) to compute
  prop values for each node type in the set. Takes a [match
  object](#common.NodeType^match) or function that returns undefined
  if the node type doesn't get this prop, and the prop's value if
  it does.
  */
  add(e) {
    if (this.perNode)
      throw new RangeError("Can't add per-node props to node types");
    return typeof e != "function" && (e = wt.match(e)), (t) => {
      let n = e(t);
      return n === void 0 ? null : [this, n];
    };
  }
}
re.closedBy = new re({ deserialize: (r) => r.split(" ") });
re.openedBy = new re({ deserialize: (r) => r.split(" ") });
re.group = new re({ deserialize: (r) => r.split(" ") });
re.isolate = new re({ deserialize: (r) => {
  if (r && r != "rtl" && r != "ltr" && r != "auto")
    throw new RangeError("Invalid value for isolate: " + r);
  return r || "auto";
} });
re.contextHash = new re({ perNode: !0 });
re.lookAhead = new re({ perNode: !0 });
re.mounted = new re({ perNode: !0 });
class Pr {
  constructor(e, t, n, i = !1) {
    this.tree = e, this.overlay = t, this.parser = n, this.bracketed = i;
  }
  /**
  @internal
  */
  static get(e) {
    return e && e.props && e.props[re.mounted.id];
  }
}
const Yx = /* @__PURE__ */ Object.create(null);
class wt {
  /**
  @internal
  */
  constructor(e, t, n, i = 0) {
    this.name = e, this.props = t, this.id = n, this.flags = i;
  }
  /**
  Define a node type.
  */
  static define(e) {
    let t = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : Yx, n = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), i = new wt(e.name || "", t, e.id, n);
    if (e.props) {
      for (let o of e.props)
        if (Array.isArray(o) || (o = o(i)), o) {
          if (o[0].perNode)
            throw new RangeError("Can't store a per-node prop on a node type");
          t[o[0].id] = o[1];
        }
    }
    return i;
  }
  /**
  Retrieves a node prop for this type. Will return `undefined` if
  the prop isn't present on this node.
  */
  prop(e) {
    return this.props[e.id];
  }
  /**
  True when this is the top node of a grammar.
  */
  get isTop() {
    return (this.flags & 1) > 0;
  }
  /**
  True when this node is produced by a skip rule.
  */
  get isSkipped() {
    return (this.flags & 2) > 0;
  }
  /**
  Indicates whether this is an error node.
  */
  get isError() {
    return (this.flags & 4) > 0;
  }
  /**
  When true, this node type doesn't correspond to a user-declared
  named node, for example because it is used to cache repetition.
  */
  get isAnonymous() {
    return (this.flags & 8) > 0;
  }
  /**
  Returns true when this node's name or one of its
  [groups](#common.NodeProp^group) matches the given string.
  */
  is(e) {
    if (typeof e == "string") {
      if (this.name == e)
        return !0;
      let t = this.prop(re.group);
      return t ? t.indexOf(e) > -1 : !1;
    }
    return this.id == e;
  }
  /**
  Create a function from node types to arbitrary values by
  specifying an object whose property names are node or
  [group](#common.NodeProp^group) names. Often useful with
  [`NodeProp.add`](#common.NodeProp.add). You can put multiple
  names, separated by spaces, in a single property name to map
  multiple node names to a single value.
  */
  static match(e) {
    let t = /* @__PURE__ */ Object.create(null);
    for (let n in e)
      for (let i of n.split(" "))
        t[i] = e[n];
    return (n) => {
      for (let i = n.prop(re.group), o = -1; o < (i ? i.length : 0); o++) {
        let s = t[o < 0 ? n.name : i[o]];
        if (s)
          return s;
      }
    };
  }
}
wt.none = new wt(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
const Ti = /* @__PURE__ */ new WeakMap(), yc = /* @__PURE__ */ new WeakMap();
var Te;
(function(r) {
  r[r.ExcludeBuffers = 1] = "ExcludeBuffers", r[r.IncludeAnonymous = 2] = "IncludeAnonymous", r[r.IgnoreMounts = 4] = "IgnoreMounts", r[r.IgnoreOverlays = 8] = "IgnoreOverlays", r[r.EnterBracketed = 16] = "EnterBracketed";
})(Te || (Te = {}));
class We {
  /**
  Construct a new tree. See also [`Tree.build`](#common.Tree^build).
  */
  constructor(e, t, n, i, o) {
    if (this.type = e, this.children = t, this.positions = n, this.length = i, this.props = null, o && o.length) {
      this.props = /* @__PURE__ */ Object.create(null);
      for (let [s, l] of o)
        this.props[typeof s == "number" ? s : s.id] = l;
    }
  }
  /**
  @internal
  */
  toString() {
    let e = Pr.get(this);
    if (e && !e.overlay)
      return e.tree.toString();
    let t = "";
    for (let n of this.children) {
      let i = n.toString();
      i && (t && (t += ","), t += i);
    }
    return this.type.name ? (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (t.length ? "(" + t + ")" : "") : t;
  }
  /**
  Get a [tree cursor](#common.TreeCursor) positioned at the top of
  the tree. Mode can be used to [control](#common.IterMode) which
  nodes the cursor visits.
  */
  cursor(e = 0) {
    return new qs(this.topNode, e);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(e, t = 0, n = 0) {
    let i = Ti.get(this) || this.topNode, o = new qs(i);
    return o.moveTo(e, t), Ti.set(this, o._tree), o;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new yt(this, 0, 0, null);
  }
  /**
  Get the [syntax node](#common.SyntaxNode) at the given position.
  If `side` is -1, this will move into nodes that end at the
  position. If 1, it'll move into nodes that start at the
  position. With 0, it'll only enter nodes that cover the position
  from both sides.
  
  Note that this will not enter
  [overlays](#common.MountedTree.overlay), and you often want
  [`resolveInner`](#common.Tree.resolveInner) instead.
  */
  resolve(e, t = 0) {
    let n = qr(Ti.get(this) || this.topNode, e, t, !1);
    return Ti.set(this, n), n;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(e, t = 0) {
    let n = qr(yc.get(this) || this.topNode, e, t, !0);
    return yc.set(this, n), n;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(e, t = 0) {
    return Xx(this, e, t);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(e) {
    let { enter: t, leave: n, from: i = 0, to: o = this.length } = e, s = e.mode || 0, l = (s & Te.IncludeAnonymous) > 0;
    for (let a = this.cursor(s | Te.IncludeAnonymous); ; ) {
      let c = !1;
      if (a.from <= o && a.to >= i && (!l && a.type.isAnonymous || t(a) !== !1)) {
        if (a.firstChild())
          continue;
        c = !0;
      }
      for (; c && n && (l || !a.type.isAnonymous) && n(a), !a.nextSibling(); ) {
        if (!a.parent())
          return;
        c = !0;
      }
    }
  }
  /**
  Get the value of the given [node prop](#common.NodeProp) for this
  node. Works with both per-node and per-type props.
  */
  prop(e) {
    return e.perNode ? this.props ? this.props[e.id] : void 0 : this.type.prop(e);
  }
  /**
  Returns the node's [per-node props](#common.NodeProp.perNode) in a
  format that can be passed to the [`Tree`](#common.Tree)
  constructor.
  */
  get propValues() {
    let e = [];
    if (this.props)
      for (let t in this.props)
        e.push([+t, this.props[t]]);
    return e;
  }
  /**
  Balance the direct children of this tree, producing a copy of
  which may have children grouped into subtrees with type
  [`NodeType.none`](#common.NodeType^none).
  */
  balance(e = {}) {
    return this.children.length <= 8 ? this : Al(wt.none, this.children, this.positions, 0, this.children.length, 0, this.length, (t, n, i) => new We(this.type, t, n, i, this.propValues), e.makeTree || ((t, n, i) => new We(wt.none, t, n, i)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(e) {
    return Zx(e);
  }
}
We.empty = new We(wt.none, [], [], 0);
class Sl {
  constructor(e, t) {
    this.buffer = e, this.index = t;
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  get pos() {
    return this.index;
  }
  next() {
    this.index -= 4;
  }
  fork() {
    return new Sl(this.buffer, this.index);
  }
}
class wn {
  /**
  Create a tree buffer.
  */
  constructor(e, t, n) {
    this.buffer = e, this.length = t, this.set = n;
  }
  /**
  @internal
  */
  get type() {
    return wt.none;
  }
  /**
  @internal
  */
  toString() {
    let e = [];
    for (let t = 0; t < this.buffer.length; )
      e.push(this.childString(t)), t = this.buffer[t + 3];
    return e.join(",");
  }
  /**
  @internal
  */
  childString(e) {
    let t = this.buffer[e], n = this.buffer[e + 3], i = this.set.types[t], o = i.name;
    if (/\W/.test(o) && !i.isError && (o = JSON.stringify(o)), e += 4, n == e)
      return o;
    let s = [];
    for (; e < n; )
      s.push(this.childString(e)), e = this.buffer[e + 3];
    return o + "(" + s.join(",") + ")";
  }
  /**
  @internal
  */
  findChild(e, t, n, i, o) {
    let { buffer: s } = this, l = -1;
    for (let a = e; a != t && !(Kd(o, i, s[a + 1], s[a + 2]) && (l = a, n > 0)); a = s[a + 3])
      ;
    return l;
  }
  /**
  @internal
  */
  slice(e, t, n) {
    let i = this.buffer, o = new Uint16Array(t - e), s = 0;
    for (let l = e, a = 0; l < t; ) {
      o[a++] = i[l++], o[a++] = i[l++] - n;
      let c = o[a++] = i[l++] - n;
      o[a++] = i[l++] - e, s = Math.max(s, c);
    }
    return new wn(o, s, this.set);
  }
}
function Kd(r, e, t, n) {
  switch (r) {
    case -2:
      return t < e;
    case -1:
      return n >= e && t < e;
    case 0:
      return t < e && n > e;
    case 1:
      return t <= e && n > e;
    case 2:
      return n > e;
    case 4:
      return !0;
  }
}
function qr(r, e, t, n) {
  for (var i; r.from == r.to || (t < 1 ? r.from >= e : r.from > e) || (t > -1 ? r.to <= e : r.to < e); ) {
    let s = !n && r instanceof yt && r.index < 0 ? null : r.parent;
    if (!s)
      return r;
    r = s;
  }
  let o = n ? 0 : Te.IgnoreOverlays;
  if (n)
    for (let s = r, l = s.parent; l; s = l, l = s.parent)
      s instanceof yt && s.index < 0 && ((i = l.enter(e, t, o)) === null || i === void 0 ? void 0 : i.from) != s.from && (r = l);
  for (; ; ) {
    let s = r.enter(e, t, o);
    if (!s)
      return r;
    r = s;
  }
}
class Ud {
  cursor(e = 0) {
    return new qs(this, e);
  }
  getChild(e, t = null, n = null) {
    let i = xc(this, e, t, n);
    return i.length ? i[0] : null;
  }
  getChildren(e, t = null, n = null) {
    return xc(this, e, t, n);
  }
  resolve(e, t = 0) {
    return qr(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return qr(this, e, t, !0);
  }
  matchContext(e) {
    return Us(this.parent, e);
  }
  enterUnfinishedNodesBefore(e) {
    let t = this.childBefore(e), n = this;
    for (; t; ) {
      let i = t.lastChild;
      if (!i || i.to != t.to)
        break;
      i.type.isError && i.from == i.to ? (n = t, t = i.prevSibling) : t = i;
    }
    return n;
  }
  get node() {
    return this;
  }
  get next() {
    return this.parent;
  }
}
class yt extends Ud {
  constructor(e, t, n, i) {
    super(), this._tree = e, this.from = t, this.index = n, this._parent = i;
  }
  get type() {
    return this._tree.type;
  }
  get name() {
    return this._tree.type.name;
  }
  get to() {
    return this.from + this._tree.length;
  }
  nextChild(e, t, n, i, o = 0) {
    for (let s = this; ; ) {
      for (let { children: l, positions: a } = s._tree, c = t > 0 ? l.length : -1; e != c; e += t) {
        let h = l[e], d = a[e] + s.from, u;
        if (!(!(o & Te.EnterBracketed && h instanceof We && (u = Pr.get(h)) && !u.overlay && u.bracketed && n >= d && n <= d + h.length) && !Kd(i, n, d, d + h.length))) {
          if (h instanceof wn) {
            if (o & Te.ExcludeBuffers)
              continue;
            let f = h.findChild(0, h.buffer.length, t, n - d, i);
            if (f > -1)
              return new yn(new Gx(s, h, e, d), null, f);
          } else if (o & Te.IncludeAnonymous || !h.type.isAnonymous || Cl(h)) {
            let f;
            if (!(o & Te.IgnoreMounts) && (f = Pr.get(h)) && !f.overlay)
              return new yt(f.tree, d, e, s);
            let g = new yt(h, d, e, s);
            return o & Te.IncludeAnonymous || !g.type.isAnonymous ? g : g.nextChild(t < 0 ? h.children.length - 1 : 0, t, n, i, o);
          }
        }
      }
      if (o & Te.IncludeAnonymous || !s.type.isAnonymous || (s.index >= 0 ? e = s.index + t : e = t < 0 ? -1 : s._parent._tree.children.length, s = s._parent, !s))
        return null;
    }
  }
  get firstChild() {
    return this.nextChild(
      0,
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(e) {
    return this.nextChild(
      0,
      1,
      e,
      2
      /* Side.After */
    );
  }
  childBefore(e) {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  prop(e) {
    return this._tree.prop(e);
  }
  enter(e, t, n = 0) {
    let i;
    if (!(n & Te.IgnoreOverlays) && (i = Pr.get(this._tree)) && i.overlay) {
      let o = e - this.from, s = n & Te.EnterBracketed && i.bracketed;
      for (let { from: l, to: a } of i.overlay)
        if ((t > 0 || s ? l <= o : l < o) && (t < 0 || s ? a >= o : a > o))
          return new yt(i.tree, i.overlay[0].from + this.from, -1, this);
    }
    return this.nextChild(0, 1, e, t, n);
  }
  nextSignificantParent() {
    let e = this;
    for (; e.type.isAnonymous && e._parent; )
      e = e._parent;
    return e;
  }
  get parent() {
    return this._parent ? this._parent.nextSignificantParent() : null;
  }
  get nextSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index + 1,
      1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get prevSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get tree() {
    return this._tree;
  }
  toTree() {
    return this._tree;
  }
  /**
  @internal
  */
  toString() {
    return this._tree.toString();
  }
}
function xc(r, e, t, n) {
  let i = r.cursor(), o = [];
  if (!i.firstChild())
    return o;
  if (t != null) {
    for (let s = !1; !s; )
      if (s = i.type.is(t), !i.nextSibling())
        return o;
  }
  for (; ; ) {
    if (n != null && i.type.is(n))
      return o;
    if (i.type.is(e) && o.push(i.node), !i.nextSibling())
      return n == null ? o : [];
  }
}
function Us(r, e, t = e.length - 1) {
  for (let n = r; t >= 0; n = n.parent) {
    if (!n)
      return !1;
    if (!n.type.isAnonymous) {
      if (e[t] && e[t] != n.name)
        return !1;
      t--;
    }
  }
  return !0;
}
class Gx {
  constructor(e, t, n, i) {
    this.parent = e, this.buffer = t, this.index = n, this.start = i;
  }
}
class yn extends Ud {
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  constructor(e, t, n) {
    super(), this.context = e, this._parent = t, this.index = n, this.type = e.buffer.set.types[e.buffer.buffer[n]];
  }
  child(e, t, n) {
    let { buffer: i } = this.context, o = i.findChild(this.index + 4, i.buffer[this.index + 3], e, t - this.context.start, n);
    return o < 0 ? null : new yn(this.context, this, o);
  }
  get firstChild() {
    return this.child(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.child(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(e) {
    return this.child(
      1,
      e,
      2
      /* Side.After */
    );
  }
  childBefore(e) {
    return this.child(
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  prop(e) {
    return this.type.prop(e);
  }
  enter(e, t, n = 0) {
    if (n & Te.ExcludeBuffers)
      return null;
    let { buffer: i } = this.context, o = i.findChild(this.index + 4, i.buffer[this.index + 3], t > 0 ? 1 : -1, e - this.context.start, t);
    return o < 0 ? null : new yn(this.context, this, o);
  }
  get parent() {
    return this._parent || this.context.parent.nextSignificantParent();
  }
  externalSibling(e) {
    return this._parent ? null : this.context.parent.nextChild(
      this.context.index + e,
      e,
      0,
      4
      /* Side.DontCare */
    );
  }
  get nextSibling() {
    let { buffer: e } = this.context, t = e.buffer[this.index + 3];
    return t < (this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length) ? new yn(this.context, this._parent, t) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: e } = this.context, t = this._parent ? this._parent.index + 4 : 0;
    return this.index == t ? this.externalSibling(-1) : new yn(this.context, this._parent, e.findChild(
      t,
      this.index,
      -1,
      0,
      4
      /* Side.DontCare */
    ));
  }
  get tree() {
    return null;
  }
  toTree() {
    let e = [], t = [], { buffer: n } = this.context, i = this.index + 4, o = n.buffer[this.index + 3];
    if (o > i) {
      let s = n.buffer[this.index + 1];
      e.push(n.slice(i, o, s)), t.push(0);
    }
    return new We(this.type, e, t, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
}
function qd(r) {
  if (!r.length)
    return null;
  let e = 0, t = r[0];
  for (let o = 1; o < r.length; o++) {
    let s = r[o];
    (s.from > t.from || s.to < t.to) && (t = s, e = o);
  }
  let n = t instanceof yt && t.index < 0 ? null : t.parent, i = r.slice();
  return n ? i[e] = n : i.splice(e, 1), new Jx(i, t);
}
class Jx {
  constructor(e, t) {
    this.heads = e, this.node = t;
  }
  get next() {
    return qd(this.heads);
  }
}
function Xx(r, e, t) {
  let n = r.resolveInner(e, t), i = null;
  for (let o = n instanceof yt ? n : n.context.parent; o; o = o.parent)
    if (o.index < 0) {
      let s = o.parent;
      (i || (i = [n])).push(s.resolve(e, t)), o = s;
    } else {
      let s = Pr.get(o.tree);
      if (s && s.overlay && s.overlay[0].from <= e && s.overlay[s.overlay.length - 1].to >= e) {
        let l = new yt(s.tree, s.overlay[0].from + o.from, -1, o);
        (i || (i = [n])).push(qr(l, e, t, !1));
      }
    }
  return i ? qd(i) : n;
}
class qs {
  /**
  Shorthand for `.type.name`.
  */
  get name() {
    return this.type.name;
  }
  /**
  @internal
  */
  constructor(e, t = 0) {
    if (this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, this.mode = t & ~Te.EnterBracketed, e instanceof yt)
      this.yieldNode(e);
    else {
      this._tree = e.context.parent, this.buffer = e.context;
      for (let n = e._parent; n; n = n._parent)
        this.stack.unshift(n.index);
      this.bufferNode = e, this.yieldBuf(e.index);
    }
  }
  yieldNode(e) {
    return e ? (this._tree = e, this.type = e.type, this.from = e.from, this.to = e.to, !0) : !1;
  }
  yieldBuf(e, t) {
    this.index = e;
    let { start: n, buffer: i } = this.buffer;
    return this.type = t || i.set.types[i.buffer[e]], this.from = n + i.buffer[e + 1], this.to = n + i.buffer[e + 2], !0;
  }
  /**
  @internal
  */
  yield(e) {
    return e ? e instanceof yt ? (this.buffer = null, this.yieldNode(e)) : (this.buffer = e.context, this.yieldBuf(e.index, e.type)) : !1;
  }
  /**
  @internal
  */
  toString() {
    return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
  }
  /**
  @internal
  */
  enterChild(e, t, n) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(e < 0 ? this._tree._tree.children.length - 1 : 0, e, t, n, this.mode));
    let { buffer: i } = this.buffer, o = i.findChild(this.index + 4, i.buffer[this.index + 3], e, t - this.buffer.start, n);
    return o < 0 ? !1 : (this.stack.push(this.index), this.yieldBuf(o));
  }
  /**
  Move the cursor to this node's first child. When this returns
  false, the node has no child, and the cursor has not been moved.
  */
  firstChild() {
    return this.enterChild(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to this node's last child.
  */
  lastChild() {
    return this.enterChild(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to the first child that ends after `pos`.
  */
  childAfter(e) {
    return this.enterChild(
      1,
      e,
      2
      /* Side.After */
    );
  }
  /**
  Move to the last child that starts before `pos`.
  */
  childBefore(e) {
    return this.enterChild(
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  /**
  Move the cursor to the child around `pos`. If side is -1 the
  child may end at that position, when 1 it may start there. This
  will also enter [overlaid](#common.MountedTree.overlay)
  [mounted](#common.NodeProp^mounted) trees unless `overlays` is
  set to false.
  */
  enter(e, t, n = this.mode) {
    return this.buffer ? n & Te.ExcludeBuffers ? !1 : this.enterChild(1, e, t) : this.yield(this._tree.enter(e, t, n));
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & Te.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let e = this.mode & Te.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    return this.buffer = null, this.yieldNode(e);
  }
  /**
  @internal
  */
  sibling(e) {
    if (!this.buffer)
      return this._tree._parent ? this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + e, e, 0, 4, this.mode)) : !1;
    let { buffer: t } = this.buffer, n = this.stack.length - 1;
    if (e < 0) {
      let i = n < 0 ? 0 : this.stack[n] + 4;
      if (this.index != i)
        return this.yieldBuf(t.findChild(
          i,
          this.index,
          -1,
          0,
          4
          /* Side.DontCare */
        ));
    } else {
      let i = t.buffer[this.index + 3];
      if (i < (n < 0 ? t.buffer.length : t.buffer[this.stack[n] + 3]))
        return this.yieldBuf(i);
    }
    return n < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + e, e, 0, 4, this.mode)) : !1;
  }
  /**
  Move to this node's next sibling, if any.
  */
  nextSibling() {
    return this.sibling(1);
  }
  /**
  Move to this node's previous sibling, if any.
  */
  prevSibling() {
    return this.sibling(-1);
  }
  atLastNode(e) {
    let t, n, { buffer: i } = this;
    if (i) {
      if (e > 0) {
        if (this.index < i.buffer.buffer.length)
          return !1;
      } else
        for (let o = 0; o < this.index; o++)
          if (i.buffer.buffer[o + 3] < this.index)
            return !1;
      ({ index: t, parent: n } = i);
    } else
      ({ index: t, _parent: n } = this._tree);
    for (; n; { index: t, _parent: n } = n)
      if (t > -1)
        for (let o = t + e, s = e < 0 ? -1 : n._tree.children.length; o != s; o += e) {
          let l = n._tree.children[o];
          if (this.mode & Te.IncludeAnonymous || l instanceof wn || !l.type.isAnonymous || Cl(l))
            return !1;
        }
    return !0;
  }
  move(e, t) {
    if (t && this.enterChild(
      e,
      0,
      4
      /* Side.DontCare */
    ))
      return !0;
    for (; ; ) {
      if (this.sibling(e))
        return !0;
      if (this.atLastNode(e) || !this.parent())
        return !1;
    }
  }
  /**
  Move to the next node in a
  [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order,_NLR)
  traversal, going from a node to its first child or, if the
  current node is empty or `enter` is false, its next sibling or
  the next sibling of the first parent node that has one.
  */
  next(e = !0) {
    return this.move(1, e);
  }
  /**
  Move to the next node in a last-to-first pre-order traversal. A
  node is followed by its last child or, if it has none, its
  previous sibling or the previous sibling of the first parent
  node that has one.
  */
  prev(e = !0) {
    return this.move(-1, e);
  }
  /**
  Move the cursor to the innermost node that covers `pos`. If
  `side` is -1, it will enter nodes that end at `pos`. If it is 1,
  it will enter nodes that start at `pos`.
  */
  moveTo(e, t = 0) {
    for (; (this.from == this.to || (t < 1 ? this.from >= e : this.from > e) || (t > -1 ? this.to <= e : this.to < e)) && this.parent(); )
      ;
    for (; this.enterChild(1, e, t); )
      ;
    return this;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) at the cursor's current
  position.
  */
  get node() {
    if (!this.buffer)
      return this._tree;
    let e = this.bufferNode, t = null, n = 0;
    if (e && e.context == this.buffer)
      e: for (let i = this.index, o = this.stack.length; o >= 0; ) {
        for (let s = e; s; s = s._parent)
          if (s.index == i) {
            if (i == this.index)
              return s;
            t = s, n = o + 1;
            break e;
          }
        i = this.stack[--o];
      }
    for (let i = n; i < this.stack.length; i++)
      t = new yn(this.buffer, t, this.stack[i]);
    return this.bufferNode = new yn(this.buffer, t, this.index);
  }
  /**
  Get the [tree](#common.Tree) that represents the current node, if
  any. Will return null when the node is in a [tree
  buffer](#common.TreeBuffer).
  */
  get tree() {
    return this.buffer ? null : this._tree._tree;
  }
  /**
  Iterate over the current node and all its descendants, calling
  `enter` when entering a node and `leave`, if given, when leaving
  one. When `enter` returns `false`, any children of that node are
  skipped, and `leave` isn't called for it.
  */
  iterate(e, t) {
    for (let n = 0; ; ) {
      let i = !1;
      if (this.type.isAnonymous || e(this) !== !1) {
        if (this.firstChild()) {
          n++;
          continue;
        }
        this.type.isAnonymous || (i = !0);
      }
      for (; ; ) {
        if (i && t && t(this), i = this.type.isAnonymous, !n)
          return;
        if (this.nextSibling())
          break;
        this.parent(), n--, i = !0;
      }
    }
  }
  /**
  Test whether the current node matches a given context—a sequence
  of direct parent node names. Empty strings in the context array
  are treated as wildcards.
  */
  matchContext(e) {
    if (!this.buffer)
      return Us(this.node.parent, e);
    let { buffer: t } = this.buffer, { types: n } = t.set;
    for (let i = e.length - 1, o = this.stack.length - 1; i >= 0; o--) {
      if (o < 0)
        return Us(this._tree, e, i);
      let s = n[t.buffer[this.stack[o]]];
      if (!s.isAnonymous) {
        if (e[i] && e[i] != s.name)
          return !1;
        i--;
      }
    }
    return !0;
  }
}
function Cl(r) {
  return r.children.some((e) => e instanceof wn || !e.type.isAnonymous || Cl(e));
}
function Zx(r) {
  var e;
  let { buffer: t, nodeSet: n, maxBufferLength: i = Ux, reused: o = [], minRepeatType: s = n.types.length } = r, l = Array.isArray(t) ? new Sl(t, t.length) : t, a = n.types, c = 0, h = 0;
  function d(A, T, S, B, $, G) {
    let { id: W, start: _, end: le, size: ne } = l, ae = h, Ce = c;
    if (ne < 0)
      if (l.next(), ne == -1) {
        let O = o[W];
        S.push(O), B.push(_ - A);
        return;
      } else if (ne == -3) {
        c = W;
        return;
      } else if (ne == -4) {
        h = W;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${ne}`);
    let Ue = a[W], rt, Oe, it = _ - A;
    if (le - _ <= i && (Oe = k(l.pos - T, $))) {
      let O = new Uint16Array(Oe.size - Oe.skip), X = l.pos - Oe.size, Q = O.length;
      for (; l.pos > X; )
        Q = v(Oe.start, O, Q);
      rt = new wn(O, le - Oe.start, n), it = Oe.start - A;
    } else {
      let O = l.pos - ne;
      l.next();
      let X = [], Q = [], de = W >= s ? W : -1, fe = 0, Ae = le;
      for (; l.pos > O; )
        de >= 0 && l.id == de && l.size >= 0 ? (l.end <= Ae - i && (g(X, Q, _, fe, l.end, Ae, de, ae, Ce), fe = X.length, Ae = l.end), l.next()) : G > 2500 ? u(_, O, X, Q) : d(_, O, X, Q, de, G + 1);
      if (de >= 0 && fe > 0 && fe < X.length && g(X, Q, _, fe, _, Ae, de, ae, Ce), X.reverse(), Q.reverse(), de > -1 && fe > 0) {
        let be = f(Ue, Ce);
        rt = Al(Ue, X, Q, 0, X.length, 0, le - _, be, be);
      } else
        rt = w(Ue, X, Q, le - _, ae - le, Ce);
    }
    S.push(rt), B.push(it);
  }
  function u(A, T, S, B) {
    let $ = [], G = 0, W = -1;
    for (; l.pos > T; ) {
      let { id: _, start: le, end: ne, size: ae } = l;
      if (ae > 4)
        l.next();
      else {
        if (W > -1 && le < W)
          break;
        W < 0 && (W = ne - i), $.push(_, le, ne), G++, l.next();
      }
    }
    if (G) {
      let _ = new Uint16Array(G * 4), le = $[$.length - 2];
      for (let ne = $.length - 3, ae = 0; ne >= 0; ne -= 3)
        _[ae++] = $[ne], _[ae++] = $[ne + 1] - le, _[ae++] = $[ne + 2] - le, _[ae++] = ae;
      S.push(new wn(_, $[2] - le, n)), B.push(le - A);
    }
  }
  function f(A, T) {
    return (S, B, $) => {
      let G = 0, W = S.length - 1, _, le;
      if (W >= 0 && (_ = S[W]) instanceof We) {
        if (!W && _.type == A && _.length == $)
          return _;
        (le = _.prop(re.lookAhead)) && (G = B[W] + _.length + le);
      }
      return w(A, S, B, $, G, T);
    };
  }
  function g(A, T, S, B, $, G, W, _, le) {
    let ne = [], ae = [];
    for (; A.length > B; )
      ne.push(A.pop()), ae.push(T.pop() + S - $);
    A.push(w(n.types[W], ne, ae, G - $, _ - G, le)), T.push($ - S);
  }
  function w(A, T, S, B, $, G, W) {
    if (G) {
      let _ = [re.contextHash, G];
      W = W ? [_].concat(W) : [_];
    }
    if ($ > 25) {
      let _ = [re.lookAhead, $];
      W = W ? [_].concat(W) : [_];
    }
    return new We(A, T, S, B, W);
  }
  function k(A, T) {
    let S = l.fork(), B = 0, $ = 0, G = 0, W = S.end - i, _ = { size: 0, start: 0, skip: 0 };
    e: for (let le = S.pos - A; S.pos > le; ) {
      let ne = S.size;
      if (S.id == T && ne >= 0) {
        _.size = B, _.start = $, _.skip = G, G += 4, B += 4, S.next();
        continue;
      }
      let ae = S.pos - ne;
      if (ne < 0 || ae < le || S.start < W)
        break;
      let Ce = S.id >= s ? 4 : 0, Ue = S.start;
      for (S.next(); S.pos > ae; ) {
        if (S.size < 0)
          if (S.size == -3 || S.size == -4)
            Ce += 4;
          else
            break e;
        else S.id >= s && (Ce += 4);
        S.next();
      }
      $ = Ue, B += ne, G += Ce;
    }
    return (T < 0 || B == A) && (_.size = B, _.start = $, _.skip = G), _.size > 4 ? _ : void 0;
  }
  function v(A, T, S) {
    let { id: B, start: $, end: G, size: W } = l;
    if (l.next(), W >= 0 && B < s) {
      let _ = S;
      if (W > 4) {
        let le = l.pos - (W - 4);
        for (; l.pos > le; )
          S = v(A, T, S);
      }
      T[--S] = _, T[--S] = G - A, T[--S] = $ - A, T[--S] = B;
    } else W == -3 ? c = B : W == -4 && (h = B);
    return S;
  }
  let D = [], N = [];
  for (; l.pos > 0; )
    d(r.start || 0, r.bufferStart || 0, D, N, -1, 0);
  let Y = (e = r.length) !== null && e !== void 0 ? e : D.length ? N[0] + D[0].length : 0;
  return new We(a[r.topID], D.reverse(), N.reverse(), Y);
}
const bc = /* @__PURE__ */ new WeakMap();
function Hi(r, e) {
  if (!r.isAnonymous || e instanceof wn || e.type != r)
    return 1;
  let t = bc.get(e);
  if (t == null) {
    t = 1;
    for (let n of e.children) {
      if (n.type != r || !(n instanceof We)) {
        t = 1;
        break;
      }
      t += Hi(r, n);
    }
    bc.set(e, t);
  }
  return t;
}
function Al(r, e, t, n, i, o, s, l, a) {
  let c = 0;
  for (let g = n; g < i; g++)
    c += Hi(r, e[g]);
  let h = Math.ceil(
    c * 1.5 / 8
    /* Balance.BranchFactor */
  ), d = [], u = [];
  function f(g, w, k, v, D) {
    for (let N = k; N < v; ) {
      let Y = N, A = w[N], T = Hi(r, g[N]);
      for (N++; N < v; N++) {
        let S = Hi(r, g[N]);
        if (T + S >= h)
          break;
        T += S;
      }
      if (N == Y + 1) {
        if (T > h) {
          let S = g[Y];
          f(S.children, S.positions, 0, S.children.length, w[Y] + D);
          continue;
        }
        d.push(g[Y]);
      } else {
        let S = w[N - 1] + g[N - 1].length - A;
        d.push(Al(r, g, w, Y, N, A, S, null, a));
      }
      u.push(A + D - o);
    }
  }
  return f(e, t, n, i, 0), (l || a)(d, u, s);
}
class Hn {
  /**
  Construct a tree fragment. You'll usually want to use
  [`addTree`](#common.TreeFragment^addTree) and
  [`applyChanges`](#common.TreeFragment^applyChanges) instead of
  calling this directly.
  */
  constructor(e, t, n, i, o = !1, s = !1) {
    this.from = e, this.to = t, this.tree = n, this.offset = i, this.open = (o ? 1 : 0) | (s ? 2 : 0);
  }
  /**
  Whether the start of the fragment represents the start of a
  parse, or the end of a change. (In the second case, it may not
  be safe to reuse some nodes at the start, depending on the
  parsing algorithm.)
  */
  get openStart() {
    return (this.open & 1) > 0;
  }
  /**
  Whether the end of the fragment represents the end of a
  full-document parse, or the start of a change.
  */
  get openEnd() {
    return (this.open & 2) > 0;
  }
  /**
  Create a set of fragments from a freshly parsed tree, or update
  an existing set of fragments by replacing the ones that overlap
  with a tree with content from the new tree. When `partial` is
  true, the parse is treated as incomplete, and the resulting
  fragment has [`openEnd`](#common.TreeFragment.openEnd) set to
  true.
  */
  static addTree(e, t = [], n = !1) {
    let i = [new Hn(0, e.length, e, 0, !1, n)];
    for (let o of t)
      o.to > e.length && i.push(o);
    return i;
  }
  /**
  Apply a set of edits to an array of fragments, removing or
  splitting fragments as necessary to remove edited ranges, and
  adjusting offsets for fragments that moved.
  */
  static applyChanges(e, t, n = 128) {
    if (!t.length)
      return e;
    let i = [], o = 1, s = e.length ? e[0] : null;
    for (let l = 0, a = 0, c = 0; ; l++) {
      let h = l < t.length ? t[l] : null, d = h ? h.fromA : 1e9;
      if (d - a >= n)
        for (; s && s.from < d; ) {
          let u = s;
          if (a >= u.from || d <= u.to || c) {
            let f = Math.max(u.from, a) - c, g = Math.min(u.to, d) - c;
            u = f >= g ? null : new Hn(f, g, u.tree, u.offset + c, l > 0, !!h);
          }
          if (u && i.push(u), s.to > d)
            break;
          s = o < e.length ? e[o++] : null;
        }
      if (!h)
        break;
      a = h.toA, c = h.toA - h.toB;
    }
    return i;
  }
}
class Qx {
  /**
  Start a parse, returning a [partial parse](#common.PartialParse)
  object. [`fragments`](#common.TreeFragment) can be passed in to
  make the parse incremental.
  
  By default, the entire input is parsed. You can pass `ranges`,
  which should be a sorted array of non-empty, non-overlapping
  ranges, to parse only those ranges. The tree returned in that
  case will start at `ranges[0].from`.
  */
  startParse(e, t, n) {
    return typeof e == "string" && (e = new e1(e)), n = n ? n.length ? n.map((i) => new qo(i.from, i.to)) : [new qo(0, 0)] : [new qo(0, e.length)], this.createParse(e, t || [], n);
  }
  /**
  Run a full parse, returning the resulting tree.
  */
  parse(e, t, n) {
    let i = this.startParse(e, t, n);
    for (; ; ) {
      let o = i.advance();
      if (o)
        return o;
    }
  }
}
class e1 {
  constructor(e) {
    this.string = e;
  }
  get length() {
    return this.string.length;
  }
  chunk(e) {
    return this.string.slice(e);
  }
  get lineChunks() {
    return !1;
  }
  read(e, t) {
    return this.string.slice(e, t);
  }
}
new re({ perNode: !0 });
let t1 = 0;
class pt {
  /**
  @internal
  */
  constructor(e, t, n, i) {
    this.name = e, this.set = t, this.base = n, this.modified = i, this.id = t1++;
  }
  toString() {
    let { name: e } = this;
    for (let t of this.modified)
      t.name && (e = `${t.name}(${e})`);
    return e;
  }
  static define(e, t) {
    let n = typeof e == "string" ? e : "?";
    if (e instanceof pt && (t = e), t != null && t.base)
      throw new Error("Can not derive from a modified tag");
    let i = new pt(n, [], null, []);
    if (i.set.push(i), t)
      for (let o of t.set)
        i.set.push(o);
    return i;
  }
  /**
  Define a tag _modifier_, which is a function that, given a tag,
  will return a tag that is a subtag of the original. Applying the
  same modifier to a twice tag will return the same value (`m1(t1)
  == m1(t1)`) and applying multiple modifiers will, regardless or
  order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
  
  When multiple modifiers are applied to a given base tag, each
  smaller set of modifiers is registered as a parent, so that for
  example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
  `m1(m3(t1)`, and so on.
  */
  static defineModifier(e) {
    let t = new io(e);
    return (n) => n.modified.indexOf(t) > -1 ? n : io.get(n.base || n, n.modified.concat(t).sort((i, o) => i.id - o.id));
  }
}
let n1 = 0;
class io {
  constructor(e) {
    this.name = e, this.instances = [], this.id = n1++;
  }
  static get(e, t) {
    if (!t.length)
      return e;
    let n = t[0].instances.find((l) => l.base == e && r1(t, l.modified));
    if (n)
      return n;
    let i = [], o = new pt(e.name, i, e, t);
    for (let l of t)
      l.instances.push(o);
    let s = i1(t);
    for (let l of e.set)
      if (!l.modified.length)
        for (let a of s)
          i.push(io.get(l, a));
    return o;
  }
}
function r1(r, e) {
  return r.length == e.length && r.every((t, n) => t == e[n]);
}
function i1(r) {
  let e = [[]];
  for (let t = 0; t < r.length; t++)
    for (let n = 0, i = e.length; n < i; n++)
      e.push(e[n].concat(r[t]));
  return e.sort((t, n) => n.length - t.length);
}
function o1(r) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in r) {
    let n = r[t];
    Array.isArray(n) || (n = [n]);
    for (let i of t.split(" "))
      if (i) {
        let o = [], s = 2, l = i;
        for (let d = 0; ; ) {
          if (l == "..." && d > 0 && d + 3 == i.length) {
            s = 1;
            break;
          }
          let u = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(l);
          if (!u)
            throw new RangeError("Invalid path: " + i);
          if (o.push(u[0] == "*" ? "" : u[0][0] == '"' ? JSON.parse(u[0]) : u[0]), d += u[0].length, d == i.length)
            break;
          let f = i[d++];
          if (d == i.length && f == "!") {
            s = 0;
            break;
          }
          if (f != "/")
            throw new RangeError("Invalid path: " + i);
          l = i.slice(d);
        }
        let a = o.length - 1, c = o[a];
        if (!c)
          throw new RangeError("Invalid path: " + i);
        let h = new oo(n, s, a > 0 ? o.slice(0, a) : null);
        e[c] = h.sort(e[c]);
      }
  }
  return s1.add(e);
}
const s1 = new re({
  combine(r, e) {
    let t, n, i;
    for (; r || e; ) {
      if (!r || e && r.depth >= e.depth ? (i = e, e = e.next) : (i = r, r = r.next), t && t.mode == i.mode && !i.context && !t.context)
        continue;
      let o = new oo(i.tags, i.mode, i.context);
      t ? t.next = o : n = o, t = o;
    }
    return n;
  }
});
class oo {
  constructor(e, t, n, i) {
    this.tags = e, this.mode = t, this.context = n, this.next = i;
  }
  get opaque() {
    return this.mode == 0;
  }
  get inherit() {
    return this.mode == 1;
  }
  sort(e) {
    return !e || e.depth < this.depth ? (this.next = e, this) : (e.next = this.sort(e.next), e);
  }
  get depth() {
    return this.context ? this.context.length : 0;
  }
}
oo.empty = new oo([], 2, null);
function l1(r, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let o of r)
    if (!Array.isArray(o.tag))
      t[o.tag.id] = o.class;
    else
      for (let s of o.tag)
        t[s.id] = o.class;
  let { scope: n, all: i = null } = {};
  return {
    style: (o) => {
      let s = i;
      for (let l of o)
        for (let a of l.set) {
          let c = t[a.id];
          if (c) {
            s = s ? s + " " + c : c;
            break;
          }
        }
      return s;
    },
    scope: n
  };
}
const R = pt.define, Ei = R(), un = R(), wc = R(un), vc = R(un), fn = R(), Oi = R(fn), Yo = R(fn), zt = R(), In = R(zt), Ht = R(), Wt = R(), Ys = R(), Sr = R(Ys), Li = R(), ee = {
  /**
  A comment.
  */
  comment: Ei,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: R(Ei),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: R(Ei),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: R(Ei),
  /**
  Any kind of identifier.
  */
  name: un,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: R(un),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: wc,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: R(wc),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: vc,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: R(vc),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: R(un),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: R(un),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: R(un),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: R(un),
  /**
  A literal value.
  */
  literal: fn,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: Oi,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: R(Oi),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: R(Oi),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: R(Oi),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: Yo,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: R(Yo),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: R(Yo),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: R(fn),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: R(fn),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: R(fn),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: R(fn),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: R(fn),
  /**
  A language keyword.
  */
  keyword: Ht,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: R(Ht),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: R(Ht),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: R(Ht),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: R(Ht),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: R(Ht),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: R(Ht),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: R(Ht),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: R(Ht),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: R(Ht),
  /**
  An operator.
  */
  operator: Wt,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: R(Wt),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: R(Wt),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: R(Wt),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: R(Wt),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: R(Wt),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: R(Wt),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: R(Wt),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: R(Wt),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: R(Wt),
  /**
  Program or markup punctuation.
  */
  punctuation: Ys,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: R(Ys),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: Sr,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: R(Sr),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: R(Sr),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: R(Sr),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: R(Sr),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: zt,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading: In,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: R(In),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: R(In),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: R(In),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: R(In),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: R(In),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: R(In),
  /**
  A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
  */
  contentSeparator: R(zt),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: R(zt),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: R(zt),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: R(zt),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: R(zt),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: R(zt),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: R(zt),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: R(zt),
  /**
  Inserted text in a change-tracking format.
  */
  inserted: R(),
  /**
  Deleted text.
  */
  deleted: R(),
  /**
  Changed text.
  */
  changed: R(),
  /**
  An invalid or unsyntactic element.
  */
  invalid: R(),
  /**
  Metadata or meta-instruction.
  */
  meta: Li,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: R(Li),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: R(Li),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: R(Li),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that a
  given element is being defined. Expected to be used with the
  various [name](#highlight.tags.name) tags.
  */
  definition: pt.defineModifier("definition"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that
  something is constant. Mostly expected to be used with
  [variable names](#highlight.tags.variableName).
  */
  constant: pt.defineModifier("constant"),
  /**
  [Modifier](#highlight.Tag^defineModifier) used to indicate that
  a [variable](#highlight.tags.variableName) or [property
  name](#highlight.tags.propertyName) is being called or defined
  as a function.
  */
  function: pt.defineModifier("function"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that can be applied to
  [names](#highlight.tags.name) to indicate that they belong to
  the language's standard environment.
  */
  standard: pt.defineModifier("standard"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates a given
  [names](#highlight.tags.name) is local to some scope.
  */
  local: pt.defineModifier("local"),
  /**
  A generic variant [modifier](#highlight.Tag^defineModifier) that
  can be used to tag language-specific alternative variants of
  some common tag. It is recommended for themes to define special
  forms of at least the [string](#highlight.tags.string) and
  [variable name](#highlight.tags.variableName) tags, since those
  come up a lot.
  */
  special: pt.defineModifier("special")
};
for (let r in ee) {
  let e = ee[r];
  e instanceof pt && (e.name = r);
}
l1([
  { tag: ee.link, class: "tok-link" },
  { tag: ee.heading, class: "tok-heading" },
  { tag: ee.emphasis, class: "tok-emphasis" },
  { tag: ee.strong, class: "tok-strong" },
  { tag: ee.keyword, class: "tok-keyword" },
  { tag: ee.atom, class: "tok-atom" },
  { tag: ee.bool, class: "tok-bool" },
  { tag: ee.url, class: "tok-url" },
  { tag: ee.labelName, class: "tok-labelName" },
  { tag: ee.inserted, class: "tok-inserted" },
  { tag: ee.deleted, class: "tok-deleted" },
  { tag: ee.literal, class: "tok-literal" },
  { tag: ee.string, class: "tok-string" },
  { tag: ee.number, class: "tok-number" },
  { tag: [ee.regexp, ee.escape, ee.special(ee.string)], class: "tok-string2" },
  { tag: ee.variableName, class: "tok-variableName" },
  { tag: ee.local(ee.variableName), class: "tok-variableName tok-local" },
  { tag: ee.definition(ee.variableName), class: "tok-variableName tok-definition" },
  { tag: ee.special(ee.variableName), class: "tok-variableName2" },
  { tag: ee.definition(ee.propertyName), class: "tok-propertyName tok-definition" },
  { tag: ee.typeName, class: "tok-typeName" },
  { tag: ee.namespace, class: "tok-namespace" },
  { tag: ee.className, class: "tok-className" },
  { tag: ee.macroName, class: "tok-macroName" },
  { tag: ee.propertyName, class: "tok-propertyName" },
  { tag: ee.operator, class: "tok-operator" },
  { tag: ee.comment, class: "tok-comment" },
  { tag: ee.meta, class: "tok-meta" },
  { tag: ee.invalid, class: "tok-invalid" },
  { tag: ee.punctuation, class: "tok-punctuation" }
]);
var Go;
const Ri = /* @__PURE__ */ new re(), a1 = /* @__PURE__ */ new re();
class qt {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(e, t, n = [], i = "") {
    this.data = e, this.name = i, ie.prototype.hasOwnProperty("tree") || Object.defineProperty(ie.prototype, "tree", { get() {
      return ln(this);
    } }), this.parser = t, this.extension = [
      mr.of(this),
      ie.languageData.of((o, s, l) => {
        let a = kc(o, s, l), c = a.type.prop(Ri);
        if (!c)
          return [];
        let h = o.facet(c), d = a.type.prop(a1);
        if (d) {
          let u = a.resolve(s - a.from, l);
          for (let f of d)
            if (f.test(u, o)) {
              let g = o.facet(f.facet);
              return f.type == "replace" ? g : g.concat(h);
            }
        }
        return h;
      })
    ].concat(n);
  }
  /**
  Query whether this language is active at the given position.
  */
  isActiveAt(e, t, n = -1) {
    return kc(e, t, n).type.prop(Ri) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(e) {
    let t = e.facet(mr);
    if ((t == null ? void 0 : t.data) == this.data)
      return [{ from: 0, to: e.doc.length }];
    if (!t || !t.allowsNesting)
      return [];
    let n = [], i = (o, s) => {
      if (o.prop(Ri) == this.data) {
        n.push({ from: s, to: s + o.length });
        return;
      }
      let l = o.prop(re.mounted);
      if (l) {
        if (l.tree.prop(Ri) == this.data) {
          if (l.overlay)
            for (let a of l.overlay)
              n.push({ from: a.from + s, to: a.to + s });
          else
            n.push({ from: s, to: s + o.length });
          return;
        } else if (l.overlay) {
          let a = n.length;
          if (i(l.tree, l.overlay[0].from + s), n.length > a)
            return;
        }
      }
      for (let a = 0; a < o.children.length; a++) {
        let c = o.children[a];
        c instanceof We && i(c, o.positions[a] + s);
      }
    };
    return i(ln(e), 0), n;
  }
  /**
  Indicates whether this language allows nested languages. The
  default implementation returns true.
  */
  get allowsNesting() {
    return !0;
  }
}
qt.setState = /* @__PURE__ */ xe.define();
function kc(r, e, t) {
  let n = r.facet(mr), i = ln(r).topNode;
  if (!n || n.allowsNesting)
    for (let o = i; o; o = o.enter(e, t, Te.ExcludeBuffers | Te.EnterBracketed))
      o.type.isTop && (i = o);
  return i;
}
function ln(r) {
  let e = r.field(qt.state, !1);
  return e ? e.tree : We.empty;
}
function Mv(r, e, t = 50) {
  var n;
  let i = (n = r.field(qt.state, !1)) === null || n === void 0 ? void 0 : n.context;
  if (!i)
    return null;
  let o = i.viewport;
  i.updateViewport({ from: 0, to: e });
  let s = i.isDone(e) || i.work(t, e) ? i.tree : null;
  return i.updateViewport(o), s;
}
class c1 {
  /**
  Create an input object for the given document.
  */
  constructor(e) {
    this.doc = e, this.cursorPos = 0, this.string = "", this.cursor = e.iter();
  }
  get length() {
    return this.doc.length;
  }
  syncTo(e) {
    return this.string = this.cursor.next(e - this.cursorPos).value, this.cursorPos = e + this.string.length, this.cursorPos - this.string.length;
  }
  chunk(e) {
    return this.syncTo(e), this.string;
  }
  get lineChunks() {
    return !0;
  }
  read(e, t) {
    let n = this.cursorPos - this.string.length;
    return e < n || t >= this.cursorPos ? this.doc.sliceString(e, t) : this.string.slice(e - n, t - n);
  }
}
let Cr = null;
class so {
  constructor(e, t, n = [], i, o, s, l, a) {
    this.parser = e, this.state = t, this.fragments = n, this.tree = i, this.treeLen = o, this.viewport = s, this.skipped = l, this.scheduleOn = a, this.parse = null, this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new so(e, t, [], We.empty, 0, n, [], null);
  }
  startParse() {
    return this.parser.startParse(new c1(this.state.doc), this.fragments);
  }
  /**
  @internal
  */
  work(e, t) {
    return t != null && t >= this.state.doc.length && (t = void 0), this.tree != We.empty && this.isDone(t ?? this.state.doc.length) ? (this.takeTree(), !0) : this.withContext(() => {
      var n;
      if (typeof e == "number") {
        let i = Date.now() + e;
        e = () => Date.now() > i;
      }
      for (this.parse || (this.parse = this.startParse()), t != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > t) && t < this.state.doc.length && this.parse.stopAt(t); ; ) {
        let i = this.parse.advance();
        if (i)
          if (this.fragments = this.withoutTempSkipped(Hn.addTree(i, this.fragments, this.parse.stoppedAt != null)), this.treeLen = (n = this.parse.stoppedAt) !== null && n !== void 0 ? n : this.state.doc.length, this.tree = i, this.parse = null, this.treeLen < (t ?? this.state.doc.length))
            this.parse = this.startParse();
          else
            return !0;
        if (e())
          return !1;
      }
    });
  }
  /**
  @internal
  */
  takeTree() {
    let e, t;
    this.parse && (e = this.parse.parsedPos) >= this.treeLen && ((this.parse.stoppedAt == null || this.parse.stoppedAt > e) && this.parse.stopAt(e), this.withContext(() => {
      for (; !(t = this.parse.advance()); )
        ;
    }), this.treeLen = e, this.tree = t, this.fragments = this.withoutTempSkipped(Hn.addTree(this.tree, this.fragments, !0)), this.parse = null);
  }
  withContext(e) {
    let t = Cr;
    Cr = this;
    try {
      return e();
    } finally {
      Cr = t;
    }
  }
  withoutTempSkipped(e) {
    for (let t; t = this.tempSkipped.pop(); )
      e = Sc(e, t.from, t.to);
    return e;
  }
  /**
  @internal
  */
  changes(e, t) {
    let { fragments: n, tree: i, treeLen: o, viewport: s, skipped: l } = this;
    if (this.takeTree(), !e.empty) {
      let a = [];
      if (e.iterChangedRanges((c, h, d, u) => a.push({ fromA: c, toA: h, fromB: d, toB: u })), n = Hn.applyChanges(n, a), i = We.empty, o = 0, s = { from: e.mapPos(s.from, -1), to: e.mapPos(s.to, 1) }, this.skipped.length) {
        l = [];
        for (let c of this.skipped) {
          let h = e.mapPos(c.from, 1), d = e.mapPos(c.to, -1);
          h < d && l.push({ from: h, to: d });
        }
      }
    }
    return new so(this.parser, t, n, i, o, s, l, this.scheduleOn);
  }
  /**
  @internal
  */
  updateViewport(e) {
    if (this.viewport.from == e.from && this.viewport.to == e.to)
      return !1;
    this.viewport = e;
    let t = this.skipped.length;
    for (let n = 0; n < this.skipped.length; n++) {
      let { from: i, to: o } = this.skipped[n];
      i < e.to && o > e.from && (this.fragments = Sc(this.fragments, i, o), this.skipped.splice(n--, 1));
    }
    return this.skipped.length >= t ? !1 : (this.reset(), !0);
  }
  /**
  @internal
  */
  reset() {
    this.parse && (this.takeTree(), this.parse = null);
  }
  /**
  Notify the parse scheduler that the given region was skipped
  because it wasn't in view, and the parse should be restarted
  when it comes into view.
  */
  skipUntilInView(e, t) {
    this.skipped.push({ from: e, to: t });
  }
  /**
  Returns a parser intended to be used as placeholder when
  asynchronously loading a nested parser. It'll skip its input and
  mark it as not-really-parsed, so that the next update will parse
  it again.
  
  When `until` is given, a reparse will be scheduled when that
  promise resolves.
  */
  static getSkippingParser(e) {
    return new class extends Qx {
      createParse(t, n, i) {
        let o = i[0].from, s = i[i.length - 1].to;
        return {
          parsedPos: o,
          advance() {
            let a = Cr;
            if (a) {
              for (let c of i)
                a.tempSkipped.push(c);
              e && (a.scheduleOn = a.scheduleOn ? Promise.all([a.scheduleOn, e]) : e);
            }
            return this.parsedPos = s, new We(wt.none, [], [], s - o);
          },
          stoppedAt: null,
          stopAt() {
          }
        };
      }
    }();
  }
  /**
  @internal
  */
  isDone(e) {
    e = Math.min(e, this.state.doc.length);
    let t = this.fragments;
    return this.treeLen >= e && t.length && t[0].from == 0 && t[0].to >= e;
  }
  /**
  Get the context for the current parse, or `null` if no editor
  parse is in progress.
  */
  static get() {
    return Cr;
  }
}
function Sc(r, e, t) {
  return Hn.applyChanges(r, [{ fromA: e, toA: t, fromB: e, toB: t }]);
}
class pr {
  constructor(e) {
    this.context = e, this.tree = e.tree;
  }
  apply(e) {
    if (!e.docChanged && this.tree == this.context.tree)
      return this;
    let t = this.context.changes(e.changes, e.state), n = this.context.treeLen == e.startState.doc.length ? void 0 : Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
    return t.work(20, n) || t.takeTree(), new pr(t);
  }
  static init(e) {
    let t = Math.min(3e3, e.doc.length), n = so.create(e.facet(mr).parser, e, { from: 0, to: t });
    return n.work(20, t) || n.takeTree(), new pr(n);
  }
}
qt.state = /* @__PURE__ */ an.define({
  create: pr.init,
  update(r, e) {
    for (let t of e.effects)
      if (t.is(qt.setState))
        return t.value;
    return e.startState.facet(mr) != e.state.facet(mr) ? pr.init(e.state) : r.apply(e);
  }
});
let Yd = (r) => {
  let e = setTimeout(
    () => r(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(e);
};
typeof requestIdleCallback < "u" && (Yd = (r) => {
  let e = -1, t = setTimeout(
    () => {
      e = requestIdleCallback(r, {
        timeout: 400
        /* Work.MinPause */
      });
    },
    100
    /* Work.MinPause */
  );
  return () => e < 0 ? clearTimeout(t) : cancelIdleCallback(e);
});
const Jo = typeof navigator < "u" && (!((Go = navigator.scheduling) === null || Go === void 0) && Go.isInputPending) ? () => navigator.scheduling.isInputPending() : null, h1 = /* @__PURE__ */ bt.fromClass(class {
  constructor(e) {
    this.view = e, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(e) {
    let t = this.view.state.field(qt.state).context;
    (t.updateViewport(e.view.viewport) || this.view.viewport.to > t.treeLen) && this.scheduleWork(), (e.docChanged || e.selectionSet) && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(t);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: e } = this.view, t = e.field(qt.state);
    (t.tree != t.context.tree || !t.context.isDone(e.doc.length)) && (this.working = Yd(this.work));
  }
  work(e) {
    this.working = null;
    let t = Date.now();
    if (this.chunkEnd < t && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = t + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: n, viewport: { to: i } } = this.view, o = n.field(qt.state);
    if (o.tree == o.context.tree && o.context.isDone(
      i + 1e5
      /* Work.MaxParseAhead */
    ))
      return;
    let s = Date.now() + Math.min(this.chunkBudget, 100, e && !Jo ? Math.max(25, e.timeRemaining() - 5) : 1e9), l = o.context.treeLen < i && n.doc.length > i + 1e3, a = o.context.work(() => Jo && Jo() || Date.now() > s, i + (l ? 0 : 1e5));
    this.chunkBudget -= Date.now() - t, (a || this.chunkBudget <= 0) && (o.context.takeTree(), this.view.dispatch({ effects: qt.setState.of(new pr(o.context)) })), this.chunkBudget > 0 && !(a && !l) && this.scheduleWork(), this.checkAsyncSchedule(o.context);
  }
  checkAsyncSchedule(e) {
    e.scheduleOn && (this.workScheduled++, e.scheduleOn.then(() => this.scheduleWork()).catch((t) => Ut(this.view.state, t)).then(() => this.workScheduled--), e.scheduleOn = null);
  }
  destroy() {
    this.working && this.working();
  }
  isWorking() {
    return !!(this.working || this.workScheduled > 0);
  }
}, {
  eventHandlers: { focus() {
    this.scheduleWork();
  } }
}), mr = /* @__PURE__ */ H.define({
  combine(r) {
    return r.length ? r[0] : null;
  },
  enables: (r) => [
    qt.state,
    h1,
    V.contentAttributes.compute([r], (e) => {
      let t = e.facet(r);
      return t && t.name ? { "data-language": t.name } : {};
    })
  ]
}), d1 = /* @__PURE__ */ H.define(), Ml = /* @__PURE__ */ H.define({
  combine: (r) => {
    if (!r.length)
      return "  ";
    let e = r[0];
    if (!e || /\S/.test(e) || Array.from(e).some((t) => t != e[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(r[0]));
    return e;
  }
});
function lo(r) {
  let e = r.facet(Ml);
  return e.charCodeAt(0) == 9 ? r.tabSize * e.length : e.length;
}
function ao(r, e) {
  let t = "", n = r.tabSize, i = r.facet(Ml)[0];
  if (i == "	") {
    for (; e >= n; )
      t += "	", e -= n;
    i = " ";
  }
  for (let o = 0; o < e; o++)
    t += i;
  return t;
}
function Gd(r, e) {
  r instanceof ie && (r = new wo(r));
  for (let n of r.state.facet(d1)) {
    let i = n(r, e);
    if (i !== void 0)
      return i;
  }
  let t = ln(r.state);
  return t.length >= e ? f1(r, t, e) : null;
}
class wo {
  /**
  Create an indent context.
  */
  constructor(e, t = {}) {
    this.state = e, this.options = t, this.unit = lo(e);
  }
  /**
  Get a description of the line at the given position, taking
  [simulated line
  breaks](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  into account. If there is such a break at `pos`, the `bias`
  argument determines whether the part of the line line before or
  after the break is used.
  */
  lineAt(e, t = 1) {
    let n = this.state.doc.lineAt(e), { simulateBreak: i, simulateDoubleBreak: o } = this.options;
    return i != null && i >= n.from && i <= n.to ? o && i == e ? { text: "", from: e } : (t < 0 ? i < e : i <= e) ? { text: n.text.slice(i - n.from), from: i } : { text: n.text.slice(0, i - n.from), from: n.from } : n;
  }
  /**
  Get the text directly after `pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  textAfterPos(e, t = 1) {
    if (this.options.simulateDoubleBreak && e == this.options.simulateBreak)
      return "";
    let { text: n, from: i } = this.lineAt(e, t);
    return n.slice(e - i, Math.min(n.length, e + 100 - i));
  }
  /**
  Find the column for the given position.
  */
  column(e, t = 1) {
    let { text: n, from: i } = this.lineAt(e, t), o = this.countColumn(n, e - i), s = this.options.overrideIndentation ? this.options.overrideIndentation(i) : -1;
    return s > -1 && (o += s - this.countColumn(n, n.search(/\S|$/))), o;
  }
  /**
  Find the column position (taking tabs into account) of the given
  position in the given string.
  */
  countColumn(e, t = e.length) {
    return Gr(e, this.state.tabSize, t);
  }
  /**
  Find the indentation column of the line at the given point.
  */
  lineIndent(e, t = 1) {
    let { text: n, from: i } = this.lineAt(e, t), o = this.options.overrideIndentation;
    if (o) {
      let s = o(i);
      if (s > -1)
        return s;
    }
    return this.countColumn(n, n.search(/\S|$/));
  }
  /**
  Returns the [simulated line
  break](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  for this context, if any.
  */
  get simulatedBreak() {
    return this.options.simulateBreak || null;
  }
}
const u1 = /* @__PURE__ */ new re();
function f1(r, e, t) {
  let n = e.resolveStack(t), i = e.resolveInner(t, -1).resolve(t, 0).enterUnfinishedNodesBefore(t);
  if (i != n.node) {
    let o = [];
    for (let s = i; s && !(s.from < n.node.from || s.to > n.node.to || s.from == n.node.from && s.type == n.node.type); s = s.parent)
      o.push(s);
    for (let s = o.length - 1; s >= 0; s--)
      n = { node: o[s], next: n };
  }
  return Jd(n, r, t);
}
function Jd(r, e, t) {
  for (let n = r; n; n = n.next) {
    let i = m1(n.node);
    if (i)
      return i(Dl.create(e, t, n));
  }
  return 0;
}
function p1(r) {
  return r.pos == r.options.simulateBreak && r.options.simulateDoubleBreak;
}
function m1(r) {
  let e = r.type.prop(u1);
  if (e)
    return e;
  let t = r.firstChild, n;
  if (t && (n = t.type.prop(re.closedBy))) {
    let i = r.lastChild, o = i && n.indexOf(i.name) > -1;
    return (s) => b1(s, !0, 1, void 0, o && !p1(s) ? i.from : void 0);
  }
  return r.parent == null ? g1 : null;
}
function g1() {
  return 0;
}
class Dl extends wo {
  constructor(e, t, n) {
    super(e.state, e.options), this.base = e, this.pos = t, this.context = n;
  }
  /**
  The syntax tree node to which the indentation strategy
  applies.
  */
  get node() {
    return this.context.node;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new Dl(e, t, n);
  }
  /**
  Get the text directly after `this.pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  get textAfter() {
    return this.textAfterPos(this.pos);
  }
  /**
  Get the indentation at the reference line for `this.node`, which
  is the line on which it starts, unless there is a node that is
  _not_ a parent of this node covering the start of that line. If
  so, the line at the start of that node is tried, again skipping
  on if it is covered by another such node.
  */
  get baseIndent() {
    return this.baseIndentFor(this.node);
  }
  /**
  Get the indentation for the reference line of the given node
  (see [`baseIndent`](https://codemirror.net/6/docs/ref/#language.TreeIndentContext.baseIndent)).
  */
  baseIndentFor(e) {
    let t = this.state.doc.lineAt(e.from);
    for (; ; ) {
      let n = e.resolve(t.from);
      for (; n.parent && n.parent.from == n.from; )
        n = n.parent;
      if (y1(n, e))
        break;
      t = this.state.doc.lineAt(n.from);
    }
    return this.lineIndent(t.from);
  }
  /**
  Continue looking for indentations in the node's parent nodes,
  and return the result of that.
  */
  continue() {
    return Jd(this.context.next, this.base, this.pos);
  }
}
function y1(r, e) {
  for (let t = e; t; t = t.parent)
    if (r == t)
      return !0;
  return !1;
}
function x1(r) {
  let e = r.node, t = e.childAfter(e.from), n = e.lastChild;
  if (!t)
    return null;
  let i = r.options.simulateBreak, o = r.state.doc.lineAt(t.from), s = i == null || i <= o.from ? o.to : Math.min(o.to, i);
  for (let l = t.to; ; ) {
    let a = e.childAfter(l);
    if (!a || a == n)
      return null;
    if (!a.type.isSkipped) {
      if (a.from >= s)
        return null;
      let c = /^ */.exec(o.text.slice(t.to - o.from))[0].length;
      return { from: t.from, to: t.to + c };
    }
    l = a.to;
  }
}
function b1(r, e, t, n, i) {
  let o = r.textAfter, s = o.match(/^\s*/)[0].length, l = n && o.slice(s, s + n.length) == n || i == r.pos + s, a = x1(r);
  return a ? l ? r.column(a.from) : r.column(a.to) : r.baseIndent + (l ? 0 : r.unit * t);
}
const w1 = /* @__PURE__ */ H.define(), v1 = /* @__PURE__ */ new re();
function k1(r, e, t) {
  let n = ln(r);
  if (n.length < t)
    return null;
  let i = n.resolveStack(t, 1), o = null;
  for (let s = i; s; s = s.next) {
    let l = s.node;
    if (l.to <= t || l.from > t)
      continue;
    if (o && l.from < e)
      break;
    let a = l.type.prop(v1);
    if (a && (l.to < n.length - 50 || n.length == r.doc.length || !S1(l))) {
      let c = a(l, r);
      c && c.from <= t && c.from >= e && c.to > t && (o = c);
    }
  }
  return o;
}
function S1(r) {
  let e = r.lastChild;
  return e && e.to == r.to && e.type.isError;
}
function C1(r, e, t) {
  for (let n of r.facet(w1)) {
    let i = n(r, e, t);
    if (i)
      return i;
  }
  return k1(r, e, t);
}
function Xd(r, e) {
  let t = e.mapPos(r.from, 1), n = e.mapPos(r.to, -1);
  return t >= n ? void 0 : { from: t, to: n };
}
const Zd = /* @__PURE__ */ xe.define({ map: Xd }), Qd = /* @__PURE__ */ xe.define({ map: Xd });
function A1(r) {
  let e = [];
  for (let { head: t } of r.state.selection.ranges)
    e.some((n) => n.from <= t && n.to >= t) || e.push(r.lineBlockAt(t));
  return e;
}
const Tl = /* @__PURE__ */ an.define({
  create() {
    return te.none;
  },
  update(r, e) {
    e.isUserEvent("delete") && e.changes.iterChangedRanges((n, i) => r = Cc(r, n, i)), r = r.map(e.changes);
    let t = [];
    for (let n of e.effects)
      n.is(Zd) && !D1(r, n.value.from, n.value.to) ? t.push(n.value) : n.is(Qd) && (r = r.update({
        filter: (i, o) => n.value.from != i || n.value.to != o,
        filterFrom: n.value.from,
        filterTo: n.value.to
      }));
    if (t.length) {
      let { preparePlaceholder: n } = e.state.facet(eu), i = t.map((o) => (n ? te.replace({ widget: new R1(n(e.state, o)) }) : Ac).range(o.from, o.to));
      r = r.update({ add: i });
    }
    return e.selection && (r = Cc(r, e.selection.main.head)), r;
  },
  provide: (r) => V.decorations.from(r),
  toJSON(r, e) {
    let t = [];
    return r.between(0, e.doc.length, (n, i) => {
      t.push(n, i);
    }), t;
  },
  fromJSON(r) {
    if (!Array.isArray(r) || r.length % 2)
      throw new RangeError("Invalid JSON for fold state");
    let e = [];
    for (let t = 0; t < r.length; ) {
      let n = r[t++], i = r[t++];
      if (typeof n != "number" || typeof i != "number")
        throw new RangeError("Invalid JSON for fold state");
      e.push(Ac.range(n, i));
    }
    return te.set(e, !0);
  }
});
function Cc(r, e, t = e) {
  let n = !1;
  return r.between(e, t, (i, o) => {
    i < t && o > e && (n = !0);
  }), n ? r.update({
    filterFrom: e,
    filterTo: t,
    filter: (i, o) => i >= t || o <= e
  }) : r;
}
function M1(r, e, t) {
  var n;
  let i = null;
  return (n = r.field(Tl, !1)) === null || n === void 0 || n.between(e, t, (o, s) => {
    (!i || i.from > o) && (i = { from: o, to: s });
  }), i;
}
function D1(r, e, t) {
  let n = !1;
  return r.between(e, e, (i, o) => {
    i == e && o == t && (n = !0);
  }), n;
}
function T1(r, e) {
  return r.field(Tl, !1) ? e : e.concat(xe.appendConfig.of(L1()));
}
const Tv = (r) => {
  for (let e of A1(r)) {
    let t = C1(r.state, e.from, e.to);
    if (t)
      return r.dispatch({ effects: T1(r.state, [Zd.of(t), E1(r, t)]) }), !0;
  }
  return !1;
};
function E1(r, e, t = !0) {
  let n = r.state.doc.lineAt(e.from).number, i = r.state.doc.lineAt(e.to).number;
  return V.announce.of(`${r.state.phrase(t ? "Folded lines" : "Unfolded lines")} ${n} ${r.state.phrase("to")} ${i}.`);
}
const O1 = {
  placeholderDOM: null,
  preparePlaceholder: null,
  placeholderText: "…"
}, eu = /* @__PURE__ */ H.define({
  combine(r) {
    return po(r, O1);
  }
});
function L1(r) {
  return [Tl, N1];
}
function tu(r, e) {
  let { state: t } = r, n = t.facet(eu), i = (s) => {
    let l = r.lineBlockAt(r.posAtDOM(s.target)), a = M1(r.state, l.from, l.to);
    a && r.dispatch({ effects: Qd.of(a) }), s.preventDefault();
  };
  if (n.placeholderDOM)
    return n.placeholderDOM(r, i, e);
  let o = document.createElement("span");
  return o.textContent = n.placeholderText, o.setAttribute("aria-label", t.phrase("folded code")), o.title = t.phrase("unfold"), o.className = "cm-foldPlaceholder", o.onclick = i, o;
}
const Ac = /* @__PURE__ */ te.replace({ widget: /* @__PURE__ */ new class extends qn {
  toDOM(r) {
    return tu(r, null);
  }
}() });
class R1 extends qn {
  constructor(e) {
    super(), this.value = e;
  }
  eq(e) {
    return this.value == e.value;
  }
  toDOM(e) {
    return tu(e, this.value);
  }
}
const N1 = /* @__PURE__ */ V.baseTheme({
  ".cm-foldPlaceholder": {
    backgroundColor: "#eee",
    border: "1px solid #ddd",
    color: "#888",
    borderRadius: ".2em",
    margin: "0 1px",
    padding: "0 1px",
    cursor: "pointer"
  },
  ".cm-foldGutter span": {
    padding: "0 1px",
    cursor: "pointer"
  }
}), B1 = 1e4, I1 = "()[]{}", P1 = /* @__PURE__ */ new re();
function Gs(r, e, t) {
  let n = r.prop(e < 0 ? re.openedBy : re.closedBy);
  if (n)
    return n;
  if (r.name.length == 1) {
    let i = t.indexOf(r.name);
    if (i > -1 && i % 2 == (e < 0 ? 1 : 0))
      return [t[i + e]];
  }
  return null;
}
function Js(r) {
  let e = r.type.prop(P1);
  return e ? e(r.node) : r;
}
function rr(r, e, t, n = {}) {
  let i = n.maxScanDistance || B1, o = n.brackets || I1, s = ln(r), l = s.resolveInner(e, t);
  for (let a = l; a; a = a.parent) {
    let c = Gs(a.type, t, o);
    if (c && a.from < a.to) {
      let h = Js(a);
      if (h && (t > 0 ? e >= h.from && e < h.to : e > h.from && e <= h.to))
        return $1(r, e, t, a, h, c, o);
    }
  }
  return F1(r, e, t, s, l.type, i, o);
}
function $1(r, e, t, n, i, o, s) {
  let l = n.parent, a = { from: i.from, to: i.to }, c = 0, h = l == null ? void 0 : l.cursor();
  if (h && (t < 0 ? h.childBefore(n.from) : h.childAfter(n.to)))
    do
      if (t < 0 ? h.to <= n.from : h.from >= n.to) {
        if (c == 0 && o.indexOf(h.type.name) > -1 && h.from < h.to) {
          let d = Js(h);
          return { start: a, end: d ? { from: d.from, to: d.to } : void 0, matched: !0 };
        } else if (Gs(h.type, t, s))
          c++;
        else if (Gs(h.type, -t, s)) {
          if (c == 0) {
            let d = Js(h);
            return {
              start: a,
              end: d && d.from < d.to ? { from: d.from, to: d.to } : void 0,
              matched: !1
            };
          }
          c--;
        }
      }
    while (t < 0 ? h.prevSibling() : h.nextSibling());
  return { start: a, matched: !1 };
}
function F1(r, e, t, n, i, o, s) {
  if (t < 0 ? !e : e == r.doc.length)
    return null;
  let l = t < 0 ? r.sliceDoc(e - 1, e) : r.sliceDoc(e, e + 1), a = s.indexOf(l);
  if (a < 0 || a % 2 == 0 != t > 0)
    return null;
  let c = { from: t < 0 ? e - 1 : e, to: t > 0 ? e + 1 : e }, h = r.doc.iterRange(e, t > 0 ? r.doc.length : 0), d = 0;
  for (let u = 0; !h.next().done && u <= o; ) {
    let f = h.value;
    t < 0 && (u += f.length);
    let g = e + u * t;
    for (let w = t > 0 ? 0 : f.length - 1, k = t > 0 ? f.length : -1; w != k; w += t) {
      let v = s.indexOf(f[w]);
      if (!(v < 0 || n.resolveInner(g + w, 1).type != i))
        if (v % 2 == 0 == t > 0)
          d++;
        else {
          if (d == 1)
            return { start: c, end: { from: g + w, to: g + w + 1 }, matched: v >> 1 == a >> 1 };
          d--;
        }
    }
    t > 0 && (u += f.length);
  }
  return h.done ? { start: c, matched: !1 } : null;
}
function Mc(r, e, t, n = 0, i = 0) {
  e == null && (e = r.search(/[^\s\u00a0]/), e == -1 && (e = r.length));
  let o = i;
  for (let s = n; s < e; s++)
    r.charCodeAt(s) == 9 ? o += t - o % t : o++;
  return o;
}
class Ev {
  /**
  Create a stream.
  */
  constructor(e, t, n, i) {
    this.string = e, this.tabSize = t, this.indentUnit = n, this.overrideIndent = i, this.pos = 0, this.start = 0, this.lastColumnPos = 0, this.lastColumnValue = 0;
  }
  /**
  True if we are at the end of the line.
  */
  eol() {
    return this.pos >= this.string.length;
  }
  /**
  True if we are at the start of the line.
  */
  sol() {
    return this.pos == 0;
  }
  /**
  Get the next code unit after the current position, or undefined
  if we're at the end of the line.
  */
  peek() {
    return this.string.charAt(this.pos) || void 0;
  }
  /**
  Read the next code unit and advance `this.pos`.
  */
  next() {
    if (this.pos < this.string.length)
      return this.string.charAt(this.pos++);
  }
  /**
  Match the next character against the given string, regular
  expression, or predicate. Consume and return it if it matches.
  */
  eat(e) {
    let t = this.string.charAt(this.pos), n;
    if (typeof e == "string" ? n = t == e : n = t && (e instanceof RegExp ? e.test(t) : e(t)), n)
      return ++this.pos, t;
  }
  /**
  Continue matching characters that match the given string,
  regular expression, or predicate function. Return true if any
  characters were consumed.
  */
  eatWhile(e) {
    let t = this.pos;
    for (; this.eat(e); )
      ;
    return this.pos > t;
  }
  /**
  Consume whitespace ahead of `this.pos`. Return true if any was
  found.
  */
  eatSpace() {
    let e = this.pos;
    for (; /[\s\u00a0]/.test(this.string.charAt(this.pos)); )
      ++this.pos;
    return this.pos > e;
  }
  /**
  Move to the end of the line.
  */
  skipToEnd() {
    this.pos = this.string.length;
  }
  /**
  Move to directly before the given character, if found on the
  current line.
  */
  skipTo(e) {
    let t = this.string.indexOf(e, this.pos);
    if (t > -1)
      return this.pos = t, !0;
  }
  /**
  Move back `n` characters.
  */
  backUp(e) {
    this.pos -= e;
  }
  /**
  Get the column position at `this.pos`.
  */
  column() {
    return this.lastColumnPos < this.start && (this.lastColumnValue = Mc(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue;
  }
  /**
  Get the indentation column of the current line.
  */
  indentation() {
    var e;
    return (e = this.overrideIndent) !== null && e !== void 0 ? e : Mc(this.string, null, this.tabSize);
  }
  /**
  Match the input against the given string or regular expression
  (which should start with a `^`). Return true or the regexp match
  if it matches.
  
  Unless `consume` is set to `false`, this will move `this.pos`
  past the matched text.
  
  When matching a string `caseInsensitive` can be set to true to
  make the match case-insensitive.
  */
  match(e, t, n) {
    if (typeof e == "string") {
      let i = (s) => n ? s.toLowerCase() : s, o = this.string.substr(this.pos, e.length);
      return i(o) == i(e) ? (t !== !1 && (this.pos += e.length), !0) : null;
    } else {
      let i = this.string.slice(this.pos).match(e);
      return i && i.index > 0 ? null : (i && t !== !1 && (this.pos += i[0].length), i);
    }
  }
  /**
  Get the current token.
  */
  current() {
    return this.string.slice(this.start, this.pos);
  }
}
const H1 = /* @__PURE__ */ Object.create(null), Dc = [wt.none], Tc = [], Ec = /* @__PURE__ */ Object.create(null), W1 = /* @__PURE__ */ Object.create(null);
for (let [r, e] of [
  ["variable", "variableName"],
  ["variable-2", "variableName.special"],
  ["string-2", "string.special"],
  ["def", "variableName.definition"],
  ["tag", "tagName"],
  ["attribute", "attributeName"],
  ["type", "typeName"],
  ["builtin", "variableName.standard"],
  ["qualifier", "modifier"],
  ["error", "invalid"],
  ["header", "heading"],
  ["property", "propertyName"]
])
  W1[r] = /* @__PURE__ */ z1(H1, e);
function Xo(r, e) {
  Tc.indexOf(r) > -1 || (Tc.push(r), console.warn(e));
}
function z1(r, e) {
  let t = [];
  for (let l of e.split(" ")) {
    let a = [];
    for (let c of l.split(".")) {
      let h = r[c] || ee[c];
      h ? typeof h == "function" ? a.length ? a = a.map(h) : Xo(c, `Modifier ${c} used at start of tag`) : a.length ? Xo(c, `Tag ${c} used as modifier`) : a = Array.isArray(h) ? h : [h] : Xo(c, `Unknown highlighting tag ${c}`);
    }
    for (let c of a)
      t.push(c);
  }
  if (!t.length)
    return 0;
  let n = e.replace(/ /g, "_"), i = n + " " + t.map((l) => l.id), o = Ec[i];
  if (o)
    return o.id;
  let s = Ec[i] = wt.define({
    id: Dc.length,
    name: n,
    props: [o1({ [n]: t })]
  });
  return Dc.push(s), s.id;
}
Ee.RTL, Ee.LTR;
const V1 = (r) => {
  let { state: e } = r, t = e.doc.lineAt(e.selection.main.from), n = Ol(r.state, t.from);
  return n.line ? _1(r) : n.block ? K1(r) : !1;
};
function El(r, e) {
  return ({ state: t, dispatch: n }) => {
    if (t.readOnly)
      return !1;
    let i = r(e, t);
    return i ? (n(t.update(i)), !0) : !1;
  };
}
const _1 = /* @__PURE__ */ El(
  Y1,
  0
  /* CommentOption.Toggle */
), j1 = /* @__PURE__ */ El(
  nu,
  0
  /* CommentOption.Toggle */
), K1 = /* @__PURE__ */ El(
  (r, e) => nu(r, e, q1(e)),
  0
  /* CommentOption.Toggle */
);
function Ol(r, e) {
  let t = r.languageDataAt("commentTokens", e, 1);
  return t.length ? t[0] : {};
}
const Ar = 50;
function U1(r, { open: e, close: t }, n, i) {
  let o = r.sliceDoc(n - Ar, n), s = r.sliceDoc(i, i + Ar), l = /\s*$/.exec(o)[0].length, a = /^\s*/.exec(s)[0].length, c = o.length - l;
  if (o.slice(c - e.length, c) == e && s.slice(a, a + t.length) == t)
    return {
      open: { pos: n - l, margin: l && 1 },
      close: { pos: i + a, margin: a && 1 }
    };
  let h, d;
  i - n <= 2 * Ar ? h = d = r.sliceDoc(n, i) : (h = r.sliceDoc(n, n + Ar), d = r.sliceDoc(i - Ar, i));
  let u = /^\s*/.exec(h)[0].length, f = /\s*$/.exec(d)[0].length, g = d.length - f - t.length;
  return h.slice(u, u + e.length) == e && d.slice(g, g + t.length) == t ? {
    open: {
      pos: n + u + e.length,
      margin: /\s/.test(h.charAt(u + e.length)) ? 1 : 0
    },
    close: {
      pos: i - f - t.length,
      margin: /\s/.test(d.charAt(g - 1)) ? 1 : 0
    }
  } : null;
}
function q1(r) {
  let e = [];
  for (let t of r.selection.ranges) {
    let n = r.doc.lineAt(t.from), i = t.to <= n.to ? n : r.doc.lineAt(t.to);
    i.from > n.from && i.from == t.to && (i = t.to == n.to + 1 ? n : r.doc.lineAt(t.to - 1));
    let o = e.length - 1;
    o >= 0 && e[o].to > n.from ? e[o].to = i.to : e.push({ from: n.from + /^\s*/.exec(n.text)[0].length, to: i.to });
  }
  return e;
}
function nu(r, e, t = e.selection.ranges) {
  let n = t.map((o) => Ol(e, o.from).block);
  if (!n.every((o) => o))
    return null;
  let i = t.map((o, s) => U1(e, n[s], o.from, o.to));
  if (r != 2 && !i.every((o) => o))
    return { changes: e.changes(t.map((o, s) => i[s] ? [] : [{ from: o.from, insert: n[s].open + " " }, { from: o.to, insert: " " + n[s].close }])) };
  if (r != 1 && i.some((o) => o)) {
    let o = [];
    for (let s = 0, l; s < i.length; s++)
      if (l = i[s]) {
        let a = n[s], { open: c, close: h } = l;
        o.push({ from: c.pos - a.open.length, to: c.pos + c.margin }, { from: h.pos - h.margin, to: h.pos + a.close.length });
      }
    return { changes: o };
  }
  return null;
}
function Y1(r, e, t = e.selection.ranges) {
  let n = [], i = -1;
  e: for (let { from: o, to: s } of t) {
    let l = n.length, a = 1e9, c;
    for (let h = o; h <= s; ) {
      let d = e.doc.lineAt(h);
      if (c == null && (c = Ol(e, d.from).line, !c))
        continue e;
      if (d.from > i && (o == s || s > d.from)) {
        i = d.from;
        let u = /^\s*/.exec(d.text)[0].length, f = u == d.length, g = d.text.slice(u, u + c.length) == c ? u : -1;
        u < d.text.length && u < a && (a = u), n.push({ line: d, comment: g, token: c, indent: u, empty: f, single: !1 });
      }
      h = d.to + 1;
    }
    if (a < 1e9)
      for (let h = l; h < n.length; h++)
        n[h].indent < n[h].line.text.length && (n[h].indent = a);
    n.length == l + 1 && (n[l].single = !0);
  }
  if (r != 2 && n.some((o) => o.comment < 0 && (!o.empty || o.single))) {
    let o = [];
    for (let { line: l, token: a, indent: c, empty: h, single: d } of n)
      (d || !h) && o.push({ from: l.from + c, insert: a + " " });
    let s = e.changes(o);
    return { changes: s, selection: e.selection.map(s, 1) };
  } else if (r != 1 && n.some((o) => o.comment >= 0)) {
    let o = [];
    for (let { line: s, comment: l, token: a } of n)
      if (l >= 0) {
        let c = s.from + l, h = c + a.length;
        s.text[h - s.from] == " " && h++, o.push({ from: c, to: h });
      }
    return { changes: o };
  }
  return null;
}
const Xs = /* @__PURE__ */ Sn.define(), G1 = /* @__PURE__ */ Sn.define(), J1 = /* @__PURE__ */ H.define(), ru = /* @__PURE__ */ H.define({
  combine(r) {
    return po(r, {
      minDepth: 100,
      newGroupDelay: 500,
      joinToEvent: (e, t) => t
    }, {
      minDepth: Math.max,
      newGroupDelay: Math.min,
      joinToEvent: (e, t) => (n, i) => e(n, i) || t(n, i)
    });
  }
}), iu = /* @__PURE__ */ an.define({
  create() {
    return Yt.empty;
  },
  update(r, e) {
    let t = e.state.facet(ru), n = e.annotation(Xs);
    if (n) {
      let a = tt.fromTransaction(e, n.selection), c = n.side, h = c == 0 ? r.undone : r.done;
      return a ? h = co(h, h.length, t.minDepth, a) : h = lu(h, e.startState.selection), new Yt(c == 0 ? n.rest : h, c == 0 ? h : n.rest);
    }
    let i = e.annotation(G1);
    if ((i == "full" || i == "before") && (r = r.isolate()), e.annotation(Le.addToHistory) === !1)
      return e.changes.empty ? r : r.addMapping(e.changes.desc);
    let o = tt.fromTransaction(e), s = e.annotation(Le.time), l = e.annotation(Le.userEvent);
    return o ? r = r.addChanges(o, s, l, t, e) : e.selection && (r = r.addSelection(e.startState.selection, s, l, t.newGroupDelay)), (i == "full" || i == "after") && (r = r.isolate()), r;
  },
  toJSON(r) {
    return { done: r.done.map((e) => e.toJSON()), undone: r.undone.map((e) => e.toJSON()) };
  },
  fromJSON(r) {
    return new Yt(r.done.map(tt.fromJSON), r.undone.map(tt.fromJSON));
  }
});
function X1(r = {}) {
  return [
    iu,
    ru.of(r),
    V.domEventHandlers({
      beforeinput(e, t) {
        let n = e.inputType == "historyUndo" ? ou : e.inputType == "historyRedo" ? Zs : null;
        return n ? (e.preventDefault(), n(t)) : !1;
      }
    })
  ];
}
function vo(r, e) {
  return function({ state: t, dispatch: n }) {
    if (!e && t.readOnly)
      return !1;
    let i = t.field(iu, !1);
    if (!i)
      return !1;
    let o = i.pop(r, t, e);
    return o ? (n(o), !0) : !1;
  };
}
const ou = /* @__PURE__ */ vo(0, !1), Zs = /* @__PURE__ */ vo(1, !1), Z1 = /* @__PURE__ */ vo(0, !0), Q1 = /* @__PURE__ */ vo(1, !0);
class tt {
  constructor(e, t, n, i, o) {
    this.changes = e, this.effects = t, this.mapped = n, this.startSelection = i, this.selectionsAfter = o;
  }
  setSelAfter(e) {
    return new tt(this.changes, this.effects, this.mapped, this.startSelection, e);
  }
  toJSON() {
    var e, t, n;
    return {
      changes: (e = this.changes) === null || e === void 0 ? void 0 : e.toJSON(),
      mapped: (t = this.mapped) === null || t === void 0 ? void 0 : t.toJSON(),
      startSelection: (n = this.startSelection) === null || n === void 0 ? void 0 : n.toJSON(),
      selectionsAfter: this.selectionsAfter.map((i) => i.toJSON())
    };
  }
  static fromJSON(e) {
    return new tt(e.changes && Ne.fromJSON(e.changes), [], e.mapped && Jt.fromJSON(e.mapped), e.startSelection && E.fromJSON(e.startSelection), e.selectionsAfter.map(E.fromJSON));
  }
  // This does not check `addToHistory` and such, it assumes the
  // transaction needs to be converted to an item. Returns null when
  // there are no changes or effects in the transaction.
  static fromTransaction(e, t) {
    let n = gt;
    for (let i of e.startState.facet(J1)) {
      let o = i(e);
      o.length && (n = n.concat(o));
    }
    return !n.length && e.changes.empty ? null : new tt(e.changes.invert(e.startState.doc), n, void 0, t || e.startState.selection, gt);
  }
  static selection(e) {
    return new tt(void 0, gt, void 0, void 0, e);
  }
}
function co(r, e, t, n) {
  let i = e + 1 > t + 20 ? e - t - 1 : 0, o = r.slice(i, e);
  return o.push(n), o;
}
function eb(r, e) {
  let t = [], n = !1;
  return r.iterChangedRanges((i, o) => t.push(i, o)), e.iterChangedRanges((i, o, s, l) => {
    for (let a = 0; a < t.length; ) {
      let c = t[a++], h = t[a++];
      l >= c && s <= h && (n = !0);
    }
  }), n;
}
function tb(r, e) {
  return r.ranges.length == e.ranges.length && r.ranges.filter((t, n) => t.empty != e.ranges[n].empty).length === 0;
}
function su(r, e) {
  return r.length ? e.length ? r.concat(e) : r : e;
}
const gt = [], nb = 200;
function lu(r, e) {
  if (r.length) {
    let t = r[r.length - 1], n = t.selectionsAfter.slice(Math.max(0, t.selectionsAfter.length - nb));
    return n.length && n[n.length - 1].eq(e) ? r : (n.push(e), co(r, r.length - 1, 1e9, t.setSelAfter(n)));
  } else
    return [tt.selection([e])];
}
function rb(r) {
  let e = r[r.length - 1], t = r.slice();
  return t[r.length - 1] = e.setSelAfter(e.selectionsAfter.slice(0, e.selectionsAfter.length - 1)), t;
}
function Zo(r, e) {
  if (!r.length)
    return r;
  let t = r.length, n = gt;
  for (; t; ) {
    let i = ib(r[t - 1], e, n);
    if (i.changes && !i.changes.empty || i.effects.length) {
      let o = r.slice(0, t);
      return o[t - 1] = i, o;
    } else
      e = i.mapped, t--, n = i.selectionsAfter;
  }
  return n.length ? [tt.selection(n)] : gt;
}
function ib(r, e, t) {
  let n = su(r.selectionsAfter.length ? r.selectionsAfter.map((l) => l.map(e)) : gt, t);
  if (!r.changes)
    return tt.selection(n);
  let i = r.changes.map(e), o = e.mapDesc(r.changes, !0), s = r.mapped ? r.mapped.composeDesc(o) : o;
  return new tt(i, xe.mapEffects(r.effects, e), s, r.startSelection.map(o), n);
}
const ob = /^(input\.type|delete)($|\.)/;
class Yt {
  constructor(e, t, n = 0, i = void 0) {
    this.done = e, this.undone = t, this.prevTime = n, this.prevUserEvent = i;
  }
  isolate() {
    return this.prevTime ? new Yt(this.done, this.undone) : this;
  }
  addChanges(e, t, n, i, o) {
    let s = this.done, l = s[s.length - 1];
    return l && l.changes && !l.changes.empty && e.changes && (!n || ob.test(n)) && (!l.selectionsAfter.length && t - this.prevTime < i.newGroupDelay && i.joinToEvent(o, eb(l.changes, e.changes)) || // For compose (but not compose.start) events, always join with previous event
    n == "input.type.compose") ? s = co(s, s.length - 1, i.minDepth, new tt(e.changes.compose(l.changes), su(xe.mapEffects(e.effects, l.changes), l.effects), l.mapped, l.startSelection, gt)) : s = co(s, s.length, i.minDepth, e), new Yt(s, gt, t, n);
  }
  addSelection(e, t, n, i) {
    let o = this.done.length ? this.done[this.done.length - 1].selectionsAfter : gt;
    return o.length > 0 && t - this.prevTime < i && n == this.prevUserEvent && n && /^select($|\.)/.test(n) && tb(o[o.length - 1], e) ? this : new Yt(lu(this.done, e), this.undone, t, n);
  }
  addMapping(e) {
    return new Yt(Zo(this.done, e), Zo(this.undone, e), this.prevTime, this.prevUserEvent);
  }
  pop(e, t, n) {
    let i = e == 0 ? this.done : this.undone;
    if (i.length == 0)
      return null;
    let o = i[i.length - 1], s = o.selectionsAfter[0] || (o.startSelection ? o.startSelection.map(o.changes.invertedDesc, 1) : t.selection);
    if (n && o.selectionsAfter.length)
      return t.update({
        selection: o.selectionsAfter[o.selectionsAfter.length - 1],
        annotations: Xs.of({ side: e, rest: rb(i), selection: s }),
        userEvent: e == 0 ? "select.undo" : "select.redo",
        scrollIntoView: !0
      });
    if (o.changes) {
      let l = i.length == 1 ? gt : i.slice(0, i.length - 1);
      return o.mapped && (l = Zo(l, o.mapped)), t.update({
        changes: o.changes,
        selection: o.startSelection,
        effects: o.effects,
        annotations: Xs.of({ side: e, rest: l, selection: s }),
        filter: !1,
        userEvent: e == 0 ? "undo" : "redo",
        scrollIntoView: !0
      });
    } else
      return null;
  }
}
Yt.empty = /* @__PURE__ */ new Yt(gt, gt);
const sb = [
  { key: "Mod-z", run: ou, preventDefault: !0 },
  { key: "Mod-y", mac: "Mod-Shift-z", run: Zs, preventDefault: !0 },
  { linux: "Ctrl-Shift-z", run: Zs, preventDefault: !0 },
  { key: "Mod-u", run: Z1, preventDefault: !0 },
  { key: "Alt-u", mac: "Mod-Shift-u", run: Q1, preventDefault: !0 }
];
function gr(r, e) {
  return E.create(r.ranges.map(e), r.mainIndex);
}
function Nt(r, e) {
  return r.update({ selection: e, scrollIntoView: !0, userEvent: "select" });
}
function Bt({ state: r, dispatch: e }, t) {
  let n = gr(r.selection, t);
  return n.eq(r.selection, !0) ? !1 : (e(Nt(r, n)), !0);
}
function ko(r, e) {
  return E.cursor(e ? r.to : r.from);
}
function Ll(r, e) {
  return Bt(r, (t) => t.empty ? r.moveByChar(t, e) : ko(t, e));
}
function Ke(r) {
  return r.textDirectionAt(r.state.selection.main.head) == Ee.LTR;
}
const au = (r) => Ll(r, !Ke(r)), cu = (r) => Ll(r, Ke(r)), Ov = (r) => Ll(r, !1);
function hu(r, e) {
  return Bt(r, (t) => t.empty ? r.moveByGroup(t, e) : ko(t, e));
}
const lb = (r) => hu(r, !Ke(r)), ab = (r) => hu(r, Ke(r));
function cb(r, e, t) {
  if (e.type.prop(t))
    return !0;
  let n = e.to - e.from;
  return n && (n > 2 || /[^\s,.;:]/.test(r.sliceDoc(e.from, e.to))) || e.firstChild;
}
function So(r, e, t) {
  let n = ln(r).resolveInner(e.head), i = t ? re.closedBy : re.openedBy;
  for (let a = e.head; ; ) {
    let c = t ? n.childAfter(a) : n.childBefore(a);
    if (!c)
      break;
    cb(r, c, i) ? n = c : a = t ? c.to : c.from;
  }
  let o = n.type.prop(i), s, l;
  return o && (s = t ? rr(r, n.from, 1) : rr(r, n.to, -1)) && s.matched ? l = t ? s.end.to : s.end.from : l = t ? n.to : n.from, E.cursor(l, t ? -1 : 1);
}
const hb = (r) => Bt(r, (e) => So(r.state, e, !Ke(r))), db = (r) => Bt(r, (e) => So(r.state, e, Ke(r)));
function du(r, e) {
  return Bt(r, (t) => {
    if (!t.empty)
      return ko(t, e);
    let n = r.moveVertically(t, e);
    return n.head != t.head ? n : r.moveToLineBoundary(t, e);
  });
}
const uu = (r) => du(r, !1), fu = (r) => du(r, !0);
function pu(r) {
  let e = r.scrollDOM.clientHeight < r.scrollDOM.scrollHeight - 2, t = 0, n = 0, i;
  if (e) {
    for (let o of r.state.facet(V.scrollMargins)) {
      let s = o(r);
      s != null && s.top && (t = Math.max(s == null ? void 0 : s.top, t)), s != null && s.bottom && (n = Math.max(s == null ? void 0 : s.bottom, n));
    }
    i = r.scrollDOM.clientHeight - t - n;
  } else
    i = (r.dom.ownerDocument.defaultView || window).innerHeight;
  return {
    marginTop: t,
    marginBottom: n,
    selfScroll: e,
    height: Math.max(r.defaultLineHeight, i - 5)
  };
}
function mu(r, e) {
  let t = pu(r), { state: n } = r, i = gr(n.selection, (s) => s.empty ? r.moveVertically(s, e, t.height) : ko(s, e));
  if (i.eq(n.selection))
    return !1;
  let o;
  if (t.selfScroll) {
    let s = r.coordsAtPos(n.selection.main.head), l = r.scrollDOM.getBoundingClientRect(), a = l.top + t.marginTop, c = l.bottom - t.marginBottom;
    s && s.top > a && s.bottom < c && (o = V.scrollIntoView(i.main.head, { y: "start", yMargin: s.top - a }));
  }
  return r.dispatch(Nt(n, i), { effects: o }), !0;
}
const Oc = (r) => mu(r, !1), Qs = (r) => mu(r, !0);
function Cn(r, e, t) {
  let n = r.lineBlockAt(e.head), i = r.moveToLineBoundary(e, t);
  if (i.head == e.head && i.head != (t ? n.to : n.from) && (i = r.moveToLineBoundary(e, t, !1)), !t && i.head == n.from && n.length) {
    let o = /^\s*/.exec(r.state.sliceDoc(n.from, Math.min(n.from + 100, n.to)))[0].length;
    o && e.head != n.from + o && (i = E.cursor(n.from + o));
  }
  return i;
}
const ub = (r) => Bt(r, (e) => Cn(r, e, !0)), fb = (r) => Bt(r, (e) => Cn(r, e, !1)), pb = (r) => Bt(r, (e) => Cn(r, e, !Ke(r))), mb = (r) => Bt(r, (e) => Cn(r, e, Ke(r))), gb = (r) => Bt(r, (e) => E.cursor(r.lineBlockAt(e.head).from, 1)), yb = (r) => Bt(r, (e) => E.cursor(r.lineBlockAt(e.head).to, -1));
function xb(r, e, t) {
  let n = !1, i = gr(r.selection, (o) => {
    let s = rr(r, o.head, -1) || rr(r, o.head, 1) || o.head > 0 && rr(r, o.head - 1, 1) || o.head < r.doc.length && rr(r, o.head + 1, -1);
    if (!s || !s.end)
      return o;
    n = !0;
    let l = s.start.from == o.head ? s.end.to : s.end.from;
    return E.cursor(l);
  });
  return n ? (e(Nt(r, i)), !0) : !1;
}
const bb = ({ state: r, dispatch: e }) => xb(r, e);
function kt(r, e, t) {
  let n = gr(r.state.selection, (i) => {
    i.undirectional && i.head >= i.anchor != e && (i = E.range(i.head, i.anchor));
    let o = t(i);
    return E.range(i.anchor, o.head, o.goalColumn, o.bidiLevel || void 0, o.assoc);
  });
  return n.eq(r.state.selection) ? !1 : (r.dispatch(Nt(r.state, n)), !0);
}
function gu(r, e) {
  return kt(r, e, (t) => r.moveByChar(t, e));
}
const yu = (r) => gu(r, !Ke(r)), xu = (r) => gu(r, Ke(r));
function bu(r, e) {
  return kt(r, e, (t) => r.moveByGroup(t, e));
}
const wb = (r) => bu(r, !Ke(r)), vb = (r) => bu(r, Ke(r)), kb = (r) => {
  let e = !Ke(r);
  return kt(r, e, (t) => So(r.state, t, e));
}, Sb = (r) => {
  let e = Ke(r);
  return kt(r, e, (t) => So(r.state, t, e));
};
function wu(r, e) {
  return kt(r, e, (t) => r.moveVertically(t, e));
}
const vu = (r) => wu(r, !1), ku = (r) => wu(r, !0);
function Su(r, e) {
  return kt(r, e, (t) => r.moveVertically(t, e, pu(r).height));
}
const Lc = (r) => Su(r, !1), Rc = (r) => Su(r, !0), Cb = (r) => kt(r, !0, (e) => Cn(r, e, !0)), Ab = (r) => kt(r, !1, (e) => Cn(r, e, !1)), Mb = (r) => {
  let e = !Ke(r);
  return kt(r, e, (t) => Cn(r, t, e));
}, Db = (r) => {
  let e = Ke(r);
  return kt(r, e, (t) => Cn(r, t, e));
}, Tb = (r) => kt(r, !1, (e) => E.cursor(r.lineBlockAt(e.head).from)), Eb = (r) => kt(r, !0, (e) => E.cursor(r.lineBlockAt(e.head).to)), Nc = ({ state: r, dispatch: e }) => (e(Nt(r, { anchor: 0 })), !0), Bc = ({ state: r, dispatch: e }) => (e(Nt(r, { anchor: r.doc.length })), !0), Ic = ({ state: r, dispatch: e }) => (e(Nt(r, { anchor: r.selection.main.anchor, head: 0 })), !0), Pc = ({ state: r, dispatch: e }) => (e(Nt(r, { anchor: r.selection.main.anchor, head: r.doc.length })), !0), Ob = ({ state: r, dispatch: e }) => (e(r.update({ selection: { anchor: 0, head: r.doc.length }, userEvent: "select" })), !0), Lb = ({ state: r, dispatch: e }) => {
  let t = Co(r).map(({ from: n, to: i }) => E.range(n, Math.min(i + 1, r.doc.length)));
  return e(r.update({ selection: E.create(t), userEvent: "select" })), !0;
}, Rb = ({ state: r, dispatch: e }) => {
  let t = gr(r.selection, (n) => {
    let i = ln(r), o = i.resolveStack(n.from, 1);
    if (n.empty) {
      let s = i.resolveStack(n.from, -1);
      s.node.from >= o.node.from && s.node.to <= o.node.to && (o = s);
    }
    for (let s = o; s; s = s.next) {
      let { node: l } = s;
      if ((l.from < n.from && l.to >= n.to || l.to > n.to && l.from <= n.from) && s.next)
        return E.range(l.to, l.from);
    }
    return n;
  });
  return t.eq(r.selection) ? !1 : (e(Nt(r, t)), !0);
};
function Cu(r, e) {
  let { state: t } = r, n = t.selection, i = t.selection.ranges.slice();
  for (let o of t.selection.ranges) {
    let s = t.doc.lineAt(o.head);
    if (e ? s.to < r.state.doc.length : s.from > 0)
      for (let l = o; ; ) {
        let a = r.moveVertically(l, e);
        if (a.head < s.from || a.head > s.to) {
          i.some((c) => c.head == a.head) || i.push(a);
          break;
        } else {
          if (a.head == l.head)
            break;
          l = a;
        }
      }
  }
  return i.length == n.ranges.length ? !1 : (r.dispatch(Nt(t, E.create(i, i.length - 1))), !0);
}
const Nb = (r) => Cu(r, !1), Bb = (r) => Cu(r, !0), Ib = ({ state: r, dispatch: e }) => {
  let t = r.selection, n = null;
  return t.ranges.length > 1 ? n = E.create([t.main]) : t.main.empty || (n = E.create([E.cursor(t.main.head)])), n ? (e(Nt(r, n)), !0) : !1;
};
function Qr(r, e) {
  if (r.state.readOnly)
    return !1;
  let t = "delete.selection", { state: n } = r, i = n.changeByRange((o) => {
    let { from: s, to: l } = o;
    if (s == l) {
      let a = e(o);
      a < s ? (t = "delete.backward", a = Ni(r, a, !1)) : a > s && (t = "delete.forward", a = Ni(r, a, !0)), s = Math.min(s, a), l = Math.max(l, a);
    } else
      s = Ni(r, s, !1), l = Ni(r, l, !0);
    return s == l ? { range: o } : { changes: { from: s, to: l }, range: E.cursor(s, s < o.head ? -1 : 1) };
  });
  return i.changes.empty ? !1 : (r.dispatch(n.update(i, {
    scrollIntoView: !0,
    userEvent: t,
    effects: t == "delete.selection" ? V.announce.of(n.phrase("Selection deleted")) : void 0
  })), !0);
}
function Ni(r, e, t) {
  if (r instanceof V)
    for (let n of r.state.facet(V.atomicRanges).map((i) => i(r)))
      n.between(e, e, (i, o) => {
        i < e && o > e && (e = t ? o : i);
      });
  return e;
}
const Au = (r, e, t) => Qr(r, (n) => {
  let i = n.from, { state: o } = r, s = o.doc.lineAt(i), l, a;
  if (t && !e && i > s.from && i < s.from + 200 && !/[^ \t]/.test(l = s.text.slice(0, i - s.from))) {
    if (l[l.length - 1] == "	")
      return i - 1;
    let c = Gr(l, o.tabSize), h = c % lo(o) || lo(o);
    for (let d = 0; d < h && l[l.length - 1 - d] == " "; d++)
      i--;
    a = i;
  } else
    a = je(s.text, i - s.from, e, e) + s.from, a == i && s.number != (e ? o.doc.lines : 1) ? a += e ? 1 : -1 : !e && /[\ufe00-\ufe0f]/.test(s.text.slice(a - s.from, i - s.from)) && (a = je(s.text, a - s.from, !1, !1) + s.from);
  return a;
}), el = (r) => Au(r, !1, !0), Mu = (r) => Au(r, !0, !1), Du = (r, e) => Qr(r, (t) => {
  let n = t.head, { state: i } = r, o = i.doc.lineAt(n), s = i.charCategorizer(n);
  for (let l = null; ; ) {
    if (n == (e ? o.to : o.from)) {
      n == t.head && o.number != (e ? i.doc.lines : 1) && (n += e ? 1 : -1);
      break;
    }
    let a = je(o.text, n - o.from, e) + o.from, c = o.text.slice(Math.min(n, a) - o.from, Math.max(n, a) - o.from), h = s(c);
    if (l != null && h != l)
      break;
    (c != " " || n != t.head) && (l = h), n = a;
  }
  return n;
}), Tu = (r) => Du(r, !1), Pb = (r) => Du(r, !0), $b = (r) => Qr(r, (e) => {
  let t = r.lineBlockAt(e.head).to;
  return e.head < t ? t : Math.min(r.state.doc.length, e.head + 1);
}), Fb = (r) => Qr(r, (e) => {
  let t = r.moveToLineBoundary(e, !1).head;
  return e.head > t ? t : Math.max(0, e.head - 1);
}), Hb = (r) => Qr(r, (e) => {
  let t = r.moveToLineBoundary(e, !0).head;
  return e.head < t ? t : Math.min(r.state.doc.length, e.head + 1);
}), Wb = ({ state: r, dispatch: e }) => {
  if (r.readOnly)
    return !1;
  let t = r.changeByRange((n) => ({
    changes: { from: n.from, to: n.to, insert: se.of(["", ""]) },
    range: E.cursor(n.from)
  }));
  return e(r.update(t, { scrollIntoView: !0, userEvent: "input" })), !0;
}, zb = ({ state: r, dispatch: e }) => {
  if (r.readOnly)
    return !1;
  let t = r.changeByRange((n) => {
    if (!n.empty || n.from == 0 || n.from == r.doc.length)
      return { range: n };
    let i = n.from, o = r.doc.lineAt(i), s = i == o.from ? i - 1 : je(o.text, i - o.from, !1) + o.from, l = i == o.to ? i + 1 : je(o.text, i - o.from, !0) + o.from;
    return {
      changes: { from: s, to: l, insert: r.doc.slice(i, l).append(r.doc.slice(s, i)) },
      range: E.cursor(l)
    };
  });
  return t.changes.empty ? !1 : (e(r.update(t, { scrollIntoView: !0, userEvent: "move.character" })), !0);
};
function Co(r) {
  let e = [], t = -1;
  for (let n of r.selection.ranges) {
    let i = r.doc.lineAt(n.from), o = r.doc.lineAt(n.to);
    if (!n.empty && n.to == o.from && (o = r.doc.lineAt(n.to - 1)), t >= i.number) {
      let s = e[e.length - 1];
      s.to = o.to, s.ranges.push(n);
    } else
      e.push({ from: i.from, to: o.to, ranges: [n] });
    t = o.number + 1;
  }
  return e;
}
function Eu(r, e, t) {
  if (r.readOnly)
    return !1;
  let n = [], i = [];
  for (let o of Co(r)) {
    if (t ? o.to == r.doc.length : o.from == 0)
      continue;
    let s = r.doc.lineAt(t ? o.to + 1 : o.from - 1), l = s.length + 1;
    if (t) {
      n.push({ from: o.to, to: s.to }, { from: o.from, insert: s.text + r.lineBreak });
      for (let a of o.ranges)
        i.push(E.range(Math.min(r.doc.length, a.anchor + l), Math.min(r.doc.length, a.head + l)));
    } else {
      n.push({ from: s.from, to: o.from }, { from: o.to, insert: r.lineBreak + s.text });
      for (let a of o.ranges)
        i.push(E.range(a.anchor - l, a.head - l));
    }
  }
  return n.length ? (e(r.update({
    changes: n,
    scrollIntoView: !0,
    selection: E.create(i, r.selection.mainIndex),
    userEvent: "move.line"
  })), !0) : !1;
}
const Vb = ({ state: r, dispatch: e }) => Eu(r, e, !1), _b = ({ state: r, dispatch: e }) => Eu(r, e, !0);
function Ou(r, e, t) {
  if (r.readOnly)
    return !1;
  let n = [];
  for (let o of Co(r))
    t ? n.push({ from: o.from, insert: r.doc.slice(o.from, o.to) + r.lineBreak }) : n.push({ from: o.to, insert: r.lineBreak + r.doc.slice(o.from, o.to) });
  let i = r.changes(n);
  return e(r.update({
    changes: i,
    selection: r.selection.map(i, t ? 1 : -1),
    scrollIntoView: !0,
    userEvent: "input.copyline"
  })), !0;
}
const jb = ({ state: r, dispatch: e }) => Ou(r, e, !1), Kb = ({ state: r, dispatch: e }) => Ou(r, e, !0), Ub = (r) => {
  if (r.state.readOnly)
    return !1;
  let { state: e } = r, t = e.changes(Co(e).map(({ from: i, to: o }) => (i > 0 ? i-- : o < e.doc.length && o++, { from: i, to: o }))), n = gr(e.selection, (i) => {
    let o;
    if (r.lineWrapping) {
      let s = r.lineBlockAt(i.head), l = r.coordsAtPos(i.head, i.assoc || 1);
      l && (o = s.bottom + r.documentTop - l.bottom + r.defaultLineHeight / 2);
    }
    return r.moveVertically(i, !0, o);
  }).map(t);
  return r.dispatch({ changes: t, selection: n, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function qb(r, e) {
  if (/\(\)|\[\]|\{\}/.test(r.sliceDoc(e - 1, e + 1)))
    return { from: e, to: e };
  let t = ln(r).resolveInner(e), n = t.childBefore(e), i = t.childAfter(e), o;
  return n && i && n.to <= e && i.from >= e && (o = n.type.prop(re.closedBy)) && o.indexOf(i.name) > -1 && r.doc.lineAt(n.to).from == r.doc.lineAt(i.from).from && !/\S/.test(r.sliceDoc(n.to, i.from)) ? { from: n.to, to: i.from } : null;
}
const $c = /* @__PURE__ */ Lu(!1), Yb = /* @__PURE__ */ Lu(!0);
function Lu(r) {
  return ({ state: e, dispatch: t }) => {
    if (e.readOnly)
      return !1;
    let n = e.changeByRange((i) => {
      let { from: o, to: s } = i, l = e.doc.lineAt(o), a = !r && o == s && qb(e, o);
      r && (o = s = (s <= l.to ? l : e.doc.lineAt(s)).to);
      let c = new wo(e, { simulateBreak: o, simulateDoubleBreak: !!a }), h = Gd(c, o);
      for (h == null && (h = Gr(/^\s*/.exec(e.doc.lineAt(o).text)[0], e.tabSize)); s < l.to && /\s/.test(l.text[s - l.from]); )
        s++;
      a ? { from: o, to: s } = a : o > l.from && o < l.from + 100 && !/\S/.test(l.text.slice(0, o)) && (o = l.from);
      let d = ["", ao(e, h)];
      return a && d.push(ao(e, c.lineIndent(l.from, -1))), {
        changes: { from: o, to: s, insert: se.of(d) },
        range: E.cursor(o + 1 + d[1].length)
      };
    });
    return t(e.update(n, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function Rl(r, e) {
  let t = -1;
  return r.changeByRange((n) => {
    let i = [];
    for (let s = n.from; s <= n.to; ) {
      let l = r.doc.lineAt(s);
      l.number > t && (n.empty || n.to > l.from) && (e(l, i, n), t = l.number), s = l.to + 1;
    }
    let o = r.changes(i);
    return {
      changes: i,
      range: E.range(o.mapPos(n.anchor, 1), o.mapPos(n.head, 1))
    };
  });
}
const Gb = ({ state: r, dispatch: e }) => {
  if (r.readOnly)
    return !1;
  let t = /* @__PURE__ */ Object.create(null), n = new wo(r, { overrideIndentation: (o) => {
    let s = t[o];
    return s ?? -1;
  } }), i = Rl(r, (o, s, l) => {
    let a = Gd(n, o.from);
    if (a == null)
      return;
    /\S/.test(o.text) || (a = 0);
    let c = /^\s*/.exec(o.text)[0], h = ao(r, a);
    (c != h || l.from < o.from + c.length) && (t[o.from] = a, s.push({ from: o.from, to: o.from + c.length, insert: h }));
  });
  return i.changes.empty || e(r.update(i, { userEvent: "indent" })), !0;
}, Jb = ({ state: r, dispatch: e }) => r.readOnly ? !1 : (e(r.update(Rl(r, (t, n) => {
  n.push({ from: t.from, insert: r.facet(Ml) });
}), { userEvent: "input.indent" })), !0), Xb = ({ state: r, dispatch: e }) => r.readOnly ? !1 : (e(r.update(Rl(r, (t, n) => {
  let i = /^\s*/.exec(t.text)[0];
  if (!i)
    return;
  let o = Gr(i, r.tabSize), s = 0, l = ao(r, Math.max(0, o - lo(r)));
  for (; s < i.length && s < l.length && i.charCodeAt(s) == l.charCodeAt(s); )
    s++;
  n.push({ from: t.from + s, to: t.from + i.length, insert: l.slice(s) });
}), { userEvent: "delete.dedent" })), !0), Zb = (r) => (r.setTabFocusMode(), !0), Qb = [
  { key: "Ctrl-b", run: au, shift: yu, preventDefault: !0 },
  { key: "Ctrl-f", run: cu, shift: xu },
  { key: "Ctrl-p", run: uu, shift: vu },
  { key: "Ctrl-n", run: fu, shift: ku },
  { key: "Ctrl-a", run: gb, shift: Tb },
  { key: "Ctrl-e", run: yb, shift: Eb },
  { key: "Ctrl-d", run: Mu },
  { key: "Ctrl-h", run: el },
  { key: "Ctrl-k", run: $b },
  { key: "Ctrl-Alt-h", run: Tu },
  { key: "Ctrl-o", run: Wb },
  { key: "Ctrl-t", run: zb },
  { key: "Ctrl-v", run: Qs }
], ew = /* @__PURE__ */ [
  { key: "ArrowLeft", run: au, shift: yu, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: lb, shift: wb, preventDefault: !0 },
  { mac: "Cmd-ArrowLeft", run: pb, shift: Mb, preventDefault: !0 },
  { key: "ArrowRight", run: cu, shift: xu, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: ab, shift: vb, preventDefault: !0 },
  { mac: "Cmd-ArrowRight", run: mb, shift: Db, preventDefault: !0 },
  { key: "ArrowUp", run: uu, shift: vu, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: Nc, shift: Ic },
  { mac: "Ctrl-ArrowUp", run: Oc, shift: Lc },
  { key: "ArrowDown", run: fu, shift: ku, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: Bc, shift: Pc },
  { mac: "Ctrl-ArrowDown", run: Qs, shift: Rc },
  { key: "PageUp", run: Oc, shift: Lc },
  { key: "PageDown", run: Qs, shift: Rc },
  { key: "Home", run: fb, shift: Ab, preventDefault: !0 },
  { key: "Mod-Home", run: Nc, shift: Ic },
  { key: "End", run: ub, shift: Cb, preventDefault: !0 },
  { key: "Mod-End", run: Bc, shift: Pc },
  { key: "Enter", run: $c, shift: $c },
  { key: "Mod-a", run: Ob },
  { key: "Backspace", run: el, shift: el, preventDefault: !0 },
  { key: "Delete", run: Mu, preventDefault: !0 },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: Tu, preventDefault: !0 },
  { key: "Mod-Delete", mac: "Alt-Delete", run: Pb, preventDefault: !0 },
  { mac: "Mod-Backspace", run: Fb, preventDefault: !0 },
  { mac: "Mod-Delete", run: Hb, preventDefault: !0 }
].concat(/* @__PURE__ */ Qb.map((r) => ({ mac: r.key, run: r.run, shift: r.shift }))), tw = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: hb, shift: kb },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: db, shift: Sb },
  { key: "Alt-ArrowUp", run: Vb },
  { key: "Shift-Alt-ArrowUp", run: jb },
  { key: "Alt-ArrowDown", run: _b },
  { key: "Shift-Alt-ArrowDown", run: Kb },
  { key: "Mod-Alt-ArrowUp", run: Nb },
  { key: "Mod-Alt-ArrowDown", run: Bb },
  { key: "Escape", run: Ib },
  { key: "Mod-Enter", run: Yb },
  { key: "Alt-l", mac: "Ctrl-l", run: Lb },
  { key: "Mod-i", run: Rb, preventDefault: !0 },
  { key: "Mod-[", run: Xb },
  { key: "Mod-]", run: Jb },
  { key: "Mod-Alt-\\", run: Gb },
  { key: "Shift-Mod-k", run: Ub },
  { key: "Shift-Mod-\\", run: bb },
  { key: "Mod-/", run: V1 },
  { key: "Alt-A", run: j1 },
  { key: "Ctrl-m", mac: "Shift-Alt-m", run: Zb }
].concat(ew);
function nw(r, e) {
  const t = sl(r);
  return t === null || !ol(t) ? null : t < e ? "past" : t === e ? "today" : "future";
}
const rw = /^\(([A-Z])\)\s/, Fc = /\d{4}-\d{2}-\d{2}/g, iw = /^x\s/, Hc = /(?:^|\s)(\+\S+)/g, Wc = /(?:^|\s)(@\S+)/g, zc = /(?:^|\s)([A-Za-z][A-Za-z0-9_-]*:\S+)/g, ow = /(?:^|\s)h:1(?=\s|$)/i, sw = /(?:^|\s)(due:\d{4}-\d{2}-\d{2})(?=\s|$)/i, lw = te.mark({ class: "todotxt-pri-a" }), aw = te.mark({ class: "todotxt-pri-b" }), cw = te.mark({ class: "todotxt-pri-c" }), hw = te.mark({ class: "todotxt-pri-other" }), dw = te.mark({ class: "todotxt-project" }), uw = te.mark({ class: "todotxt-context" }), fw = te.mark({ class: "todotxt-date" }), pw = te.mark({ class: "todotxt-keyvalue" }), mw = te.mark({ class: "todotxt-due-past" }), gw = te.mark({ class: "todotxt-due-today" }), yw = te.mark({ class: "todotxt-done" }), xw = te.mark({ class: "todotxt-hidden" });
let Qo = "", Vc = 0;
function bw() {
  const r = Date.now();
  if (r - Vc < 6e4) return Qo;
  const e = /* @__PURE__ */ new Date();
  return Qo = `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`, Vc = r, Qo;
}
function ww(r, e, t) {
  const n = [], i = r.match(rw);
  if (i) {
    const l = e + i[0].length, a = i[1], c = a === "A" ? lw : a === "B" ? aw : a === "C" ? cw : hw;
    n.push({ from: e, to: l, deco: c });
  }
  const o = nw(r, t);
  if (o === "past" || o === "today") {
    const l = sw.exec(r);
    if (l) {
      const a = l.index + l[0].indexOf(l[1]);
      n.push({
        from: e + a,
        to: e + a + l[1].length,
        deco: o === "past" ? mw : gw
      });
    }
  }
  Fc.lastIndex = 0;
  let s;
  for (; (s = Fc.exec(r)) !== null; )
    n.push({
      from: e + s.index,
      to: e + s.index + s[0].length,
      deco: fw
    });
  for (Hc.lastIndex = 0; (s = Hc.exec(r)) !== null; ) {
    const l = s.index + s[0].indexOf(s[1]);
    n.push({
      from: e + l,
      to: e + l + s[1].length,
      deco: dw
    });
  }
  for (Wc.lastIndex = 0; (s = Wc.exec(r)) !== null; ) {
    const l = s.index + s[0].indexOf(s[1]);
    n.push({
      from: e + l,
      to: e + l + s[1].length,
      deco: uw
    });
  }
  for (zc.lastIndex = 0; (s = zc.exec(r)) !== null; ) {
    const l = s.index + s[0].indexOf(s[1]);
    n.push({
      from: e + l,
      to: e + l + s[1].length,
      deco: pw
    });
  }
  return n.sort((l, a) => l.from - a.from || l.to - a.to), n;
}
function _c(r) {
  const e = new cr(), t = bw();
  for (const { from: n, to: i } of r.visibleRanges) {
    const o = r.state.doc, s = o.lineAt(n).number, l = o.lineAt(i).number;
    for (let a = s; a <= l; a++) {
      const c = o.line(a), h = c.text, d = c.from;
      if (h.trim() !== "") {
        if (ow.test(h)) {
          e.add(d, c.to, xw);
          continue;
        }
        if (iw.test(h)) {
          e.add(d, c.to, yw);
          continue;
        }
        for (const u of ww(h, d, t))
          e.add(u.from, u.to, u.deco);
      }
    }
  }
  return e.finish();
}
class vw {
  constructor(e) {
    Et(this, "decorations");
    this.decorations = _c(e);
  }
  update(e) {
    (e.docChanged || e.viewportChanged) && (this.decorations = _c(e.view));
  }
}
const kw = bt.fromClass(vw, {
  decorations: (r) => r.decorations
}), Sw = V.baseTheme({
  ".todotxt-pri-a": {
    color: "var(--warn, #f59e0b)",
    fontWeight: "bold"
  },
  ".todotxt-pri-b": {
    color: "var(--ok, #22c55e)",
    fontWeight: "bold"
  },
  ".todotxt-pri-c": {
    color: "var(--accent, #3b82f6)",
    fontWeight: "bold"
  },
  ".todotxt-pri-other": {
    color: "var(--muted, #71717a)",
    fontWeight: "bold"
  },
  ".todotxt-project": {
    color: "#a78bfa"
    // violet-400
  },
  ".todotxt-context": {
    color: "#2dd4bf"
    // teal-400
  },
  ".todotxt-date": {
    color: "#60a5fa"
    // blue-400
  },
  ".todotxt-keyvalue": {
    color: "#22d3ee"
    // cyan-400
  },
  ".todotxt-due-past": {
    color: "var(--danger, #ef4444)",
    fontWeight: "bold"
  },
  ".todotxt-due-today": {
    color: "var(--warn, #f59e0b)",
    fontWeight: "bold"
  },
  // A `due:` token is covered by up to three overlapping marks — the urgency
  // mark, the generic key:value mark, and the `todotxt-date` mark on the date
  // portion — and CodeMirror renders overlapping marks as NESTED spans. An
  // inner span's own `color` beats an outer one's whatever the rule order, so
  // without these descendant rules the urgency tint silently loses the date
  // digits (or the whole token) to cyan/blue. Declared after both, and in both
  // nesting directions, so the tint wins either way.
  ".todotxt-due-past .todotxt-date, .todotxt-due-past .todotxt-keyvalue": {
    color: "var(--danger, #ef4444)"
  },
  ".todotxt-due-today .todotxt-date, .todotxt-due-today .todotxt-keyvalue": {
    color: "var(--warn, #f59e0b)"
  },
  ".todotxt-done": {
    color: "var(--muted, #71717a)",
    textDecoration: "line-through",
    opacity: "0.6"
  },
  // Colour only — no opacity. How far an `h:1` line is pushed out of the way
  // is the user's `hidden` view mode, which owns opacity in its own
  // compartment (components/cm-todotxt-filter.ts). Splitting it this way is
  // what makes `hidden dim` look identical with highlighting on or off.
  ".todotxt-hidden": {
    color: "var(--muted, #71717a)",
    fontStyle: "italic"
  }
});
function jc() {
  return [kw, Sw];
}
const Cw = te.line({ class: "todotxt-filter-dim" }), Aw = te.line({ class: "todotxt-threshold-hidden" }), Mw = te.line({ class: "todotxt-hidden-dim" }), Dw = te.line({ class: "todotxt-hidden-gone" });
function Ru(r) {
  return typeof r == "number" ? (e) => e === r : r;
}
function Nu(r, e) {
  const t = e.map(({ from: n, to: i }) => {
    const o = Math.min(n, i), s = Math.max(n, i);
    return [r.lineAt(o).number, r.lineAt(s).number];
  });
  return (n) => t.some(([i, o]) => n >= i && n <= o);
}
function Nl(r, e, t) {
  const n = [];
  let i = 0;
  for (const { from: o, to: s } of e) {
    const l = r.lineAt(o).number, a = r.lineAt(s).number;
    for (let c = Math.max(l, i + 1); c <= a; c++) {
      const h = r.line(c);
      t(h.text, c) && n.push(h.from);
    }
    i = Math.max(i, a);
  }
  return n;
}
function Tw(r, e, t, n) {
  return t === null || t.terms.length === 0 ? [] : Nl(
    r,
    e,
    (i) => nh(i) && !ih(i, t, n)
  );
}
function Ew(r, e, t, n, i = 0) {
  const o = Ru(i);
  return Nl(
    r,
    e,
    (s, l) => !o(l) && lh(s) && sh(s, n)
  );
}
function Ow(r, e, t, n = 0) {
  if (t === "show") return [];
  const i = Ru(n);
  return Nl(
    r,
    e,
    (o, s) => !i(s) && dh(o) && hh(o)
  );
}
function Kc(r, e, t, n) {
  const i = new cr();
  for (const o of n(Fr()))
    i.add(o, o, t);
  return i.finish();
}
const Lw = V.baseTheme({
  ".todotxt-filter-dim": {
    // Readable enough to edit in place, faint enough that matching lines
    // pop out at a glance. Saturation is pulled down too so the syntax
    // colours of a dimmed line do not compete with the matches.
    opacity: "0.32",
    filter: "saturate(0.4)"
  }
}), Rw = V.baseTheme({
  ".todotxt-threshold-hidden": {
    // Much fainter than a filter dim (0.32): the user asked for these to be
    // OUT of the way, not merely de-emphasized, and the two treatments must
    // stay tellable apart when a filter and threshold hiding are both on.
    // Not display:none — see the module note in utils/threshold.ts on why
    // the document is never collapsed.
    opacity: "0.14",
    filter: "saturate(0.15)"
  }
  // No `.cm-activeLine` escape rule here: this editor never installs
  // `highlightActiveLine()`, so that class is never applied and such a rule
  // would be dead. Legibility of the line being edited is guaranteed by the
  // computed cursor exemption in `thresholdHiddenLineStarts` instead — the
  // caret's line is simply never decorated.
}), Nw = V.baseTheme({
  // `dim` — the default. Same strength as an R2 threshold hide (0.14): the
  // user flagged these themselves, so "out of the way" is the goal, not mere
  // de-emphasis. The syntax layer's own `.todotxt-hidden` mark handles colour;
  // opacity is owned here so the treatment is identical with highlighting on
  // or off.
  ".todotxt-hidden-dim": {
    opacity: "0.14",
    filter: "saturate(0.15)"
  },
  // `hide` — gone from the view. The ONLY place this app collapses a line, and
  // only because `h:1` literally means "hide this" (see utils/hidden.ts). The
  // document is untouched: `getValue()`, Ctrl+A, the character count, the save
  // payload and the Tab-complete vocabulary all still see these lines.
  ".todotxt-hidden-gone": {
    display: "none"
  }
});
function Bl(r, e, t, n = !1) {
  return bt.fromClass(
    class {
      constructor(i) {
        Et(this, "decorations");
        this.decorations = Kc(
          i,
          e,
          r,
          (o) => t(i, o)
        );
      }
      update(i) {
        (i.docChanged || i.viewportChanged || n && i.selectionSet) && (this.decorations = Kc(
          i.view,
          e,
          r,
          (o) => t(i.view, o)
        ));
      }
    },
    { decorations: (i) => i.decorations }
  );
}
function Uc(r, e) {
  return r === null || r.terms.length === 0 ? [] : [
    Bl(
      Cw,
      e,
      (t, n) => Tw(t.state.doc, t.visibleRanges, r, n)
    ),
    Lw
  ];
}
function qc(r, e) {
  return r ? [
    Bl(
      Aw,
      e,
      (t, n) => Ew(
        t.state.doc,
        t.visibleRanges,
        !0,
        n,
        Nu(t.state.doc, t.state.selection.ranges)
      ),
      // Rebuild on selection change: the exempt lines are wherever the
      // selection is.
      !0
    ),
    Rw
  ] : [];
}
function Yc(r, e) {
  return r === "show" ? [] : [
    Bl(
      r === "hide" ? Dw : Mw,
      void 0,
      (n) => Ow(
        n.state.doc,
        n.visibleRanges,
        r,
        Nu(n.state.doc, n.state.selection.ranges)
      ),
      // Rebuild on selection change: the exempt lines are wherever the
      // selection is.
      !0
    ),
    Nw
  ];
}
let Mr = null, es = null, Gc = !1;
async function Bw() {
  return Mr || (es || (es = import("./index-BgPNUeCy.js")), Mr = await es, Gc || (yh(Mr.Vim), Gc = !0), Mr);
}
const Iw = tl(function({
  value: e,
  onChange: t,
  onSelectionChange: n,
  onViewportChange: i,
  vimMode: o = !1,
  syntaxHighlight: s = !0,
  filter: l = null,
  thresholdHidden: a = !1,
  hiddenMode: c = Ui,
  placeholder: h = "",
  disabled: d = !1,
  onVimModeChange: u,
  onKeyDown: f,
  onMouseUp: g
}, w) {
  const k = z(null), v = z(null), D = z(t), N = z(n), Y = z(i), A = z(u), T = z(null), S = z(f), B = z(g), $ = z(l);
  $.current = l;
  const G = z(a);
  G.current = a;
  const W = z(c);
  W.current = c, D.current = t, N.current = n, Y.current = i, A.current = u, S.current = f, B.current = g;
  const _ = Qe(() => new Vt(), []), le = Qe(() => new Vt(), []), ne = Qe(() => new Vt(), []), ae = Qe(() => new Vt(), []), Ce = Qe(() => new Vt(), []), Ue = Qe(() => new Vt(), []), rt = z(!1), Oe = z(null);
  U(() => {
    if (!k.current) return;
    let O = null, X = null;
    const Q = (K) => {
      O !== null && cancelAnimationFrame(O), O = requestAnimationFrame(() => {
        var Re;
        O = null;
        const we = K.state.selection.main, Ct = K.state.selection.ranges.map((Be) => ({
          from: Be.from,
          to: Be.to
        }));
        (Re = N.current) == null || Re.call(N, we.from, we.to, Ct);
      });
    }, de = () => {
      X === null && (X = requestAnimationFrame(() => {
        var K;
        X = null, (K = Y.current) == null || K.call(Y);
      }));
    }, fe = V.updateListener.of((K) => {
      if (!rt.current && K.docChanged) {
        const we = K.state.doc.toString();
        Oe.current = we;
        const Ct = K.transactions.some((Re) => Re.isUserEvent("input"));
        D.current(we, { typed: Ct });
      }
      (K.selectionSet || K.docChanged) && Q(K.view), (K.viewportChanged || K.geometryChanged) && de();
    }), Ae = V.domEventHandlers({
      mouseup: () => (requestAnimationFrame(() => {
        var K;
        return (K = B.current) == null ? void 0 : K.call(B);
      }), !1),
      keyup: () => (requestAnimationFrame(() => {
        var K;
        return (K = B.current) == null ? void 0 : K.call(B);
      }), !1)
    }), be = V.theme({
      "&": {
        height: "100%",
        fontSize: "0.875rem",
        // The mono chain, not --font-body: the editor shows a todo.txt FILE,
        // and --font-body resolves to the host's proportional body font. The
        // user's selected mono comes through --font-mono -> --mono.
        fontFamily: "var(--font-mono, ui-monospace, monospace)",
        backgroundColor: "transparent",
        color: "var(--color-fg, #e4e4e7)"
      },
      ".cm-content": {
        // A small left inset is enough: CodeMirror renders a real line-number
        // gutter to our left, so the content does not need to reserve space
        // for one of its own.
        padding: "0.75rem 1rem 0.75rem 0.75rem",
        lineHeight: "1.5rem",
        caretColor: "var(--color-fg, #e4e4e7)",
        fontFamily: "inherit"
      },
      ".cm-gutters": {
        backgroundColor: "transparent",
        // Divider between the number gutter and the text area.
        borderRight: "1px solid var(--color-border, #27272a)",
        color: "var(--color-muted-fg, #71717a)",
        minWidth: "2.75rem",
        // NOTE: no paddingTop here — CodeMirror aligns the first gutter
        // element to the content's top padding by itself; adding our own
        // padding double-offsets every number ~half a row downward.
        fontFamily: "inherit",
        fontSize: "0.8125rem"
      },
      // Vertically center each number in the 1.5rem line box so numbers line
      // up with their text rows (the default gutter line-height, derived
      // from the smaller gutter font, floated the digits too high).
      ".cm-lineNumbers .cm-gutterElement": {
        lineHeight: "1.5rem",
        padding: "0 0.55rem 0 0.4rem"
      },
      ".cm-activeLineGutter": {
        backgroundColor: "transparent",
        color: "var(--color-fg, #e4e4e7)"
      },
      ".cm-activeLine": {
        backgroundColor: "var(--color-bg-hover, rgba(255,255,255,0.03))"
      },
      ".cm-cursor": {
        borderLeftColor: "var(--color-fg, #e4e4e7)"
      },
      ".cm-selectionBackground": {
        backgroundColor: "var(--accent-bg, rgba(245, 158, 50, 0.15)) !important"
      },
      "&.cm-focused .cm-selectionBackground": {
        backgroundColor: "var(--accent-bg, rgba(245, 158, 50, 0.15)) !important"
      },
      ".cm-scroller": {
        overflow: "auto",
        fontFamily: "inherit"
      },
      // Vim status bar styling.
      ".cm-vim-panel": {
        backgroundColor: "var(--color-bg-elevated, #1a1d25)",
        color: "var(--color-fg, #e4e4e7)",
        padding: "2px 8px",
        fontSize: "0.75rem",
        fontFamily: "var(--font-mono, monospace)"
      }
    }), St = ie.create({
      doc: e,
      extensions: [
        Kx(),
        be,
        fe,
        Ae,
        X1(),
        ie.allowMultipleSelections.of(!0),
        // Alt+click adds a cursor; Alt+drag creates a rectangular selection.
        V.clickAddsSelectionRange.of((K) => K.altKey),
        Rx(),
        Ix(),
        zd.of([...tw, ...sb]),
        _.of([]),
        le.of(s ? jc() : []),
        // Separate compartment from syntax highlighting on purpose: a filter
        // must keep dimming even with highlighting switched off.
        ne.of(Uc(l)),
        // Third compartment: threshold hiding toggles independently of both
        // the filter and syntax highlighting, so changing one must not tear
        // down the others.
        ae.of(qc(a)),
        // Fifth compartment: the `h:1` view mode. Independent of the filter,
        // the threshold layer and syntax highlighting for the same reason —
        // four unrelated reasons to narrow the view, four independent toggles.
        Ce.of(Yc(c)),
        Ue.of(ie.readOnly.of(d)),
        Tx(h),
        V.lineWrapping
      ]
    }), Pe = new V({
      state: St,
      parent: k.current
    });
    v.current = Pe;
    const ot = (K) => {
      var we;
      (we = S.current) == null || we.call(S, K);
    };
    return Pe.contentDOM.addEventListener("keydown", ot, {
      capture: !0
    }), Pe.contentDOM.setAttribute("data-testid", "todo-txt-textarea"), Pe.contentDOM.setAttribute("aria-label", "todo.txt contents"), () => {
      O !== null && cancelAnimationFrame(O), X !== null && cancelAnimationFrame(X), Pe.contentDOM.removeEventListener("keydown", ot, {
        capture: !0
      }), Pe.destroy(), v.current = null;
    };
  }, []), U(() => {
    const O = v.current;
    if (!O || Oe.current === e) return;
    const X = O.state.doc.toString();
    if (X !== e) {
      rt.current = !0;
      try {
        O.dispatch({
          changes: { from: 0, to: X.length, insert: e },
          // NOT undoable. This transaction is how the app LOADS a document —
          // the initial GET, a tab switch, a reload-from-disk, a set-root, a
          // recovery-draft restore, and the echo of a page-level rewrite all
          // arrive through here. Left in the undo stack, `history()` treats
          // "the file was loaded" as an edit, so one vim `u` (or Ctrl+Z) before
          // the user has typed anything reverts the document to the empty string
          // CmEditor was constructed with — which then flows out through
          // onChange -> setContent -> scheduleSave and is PUT over todo.txt.
          // History still MAPS its stored events through this change, so undo of
          // the user's own edits stays coherent.
          annotations: Le.addToHistory.of(!1)
        }), Oe.current = e;
      } finally {
        rt.current = !1;
      }
    }
  }, [e]), U(() => {
    var Q, de;
    const O = v.current;
    if (!O) return;
    let X = !1;
    return o ? Bw().then((fe) => {
      var be;
      if (X || !v.current) return;
      v.current.dispatch({
        // PRECEDENCE IS LOAD-BEARING. `keymap.of([...defaultKeymap, ...])`
        // is registered above this compartment, so without Prec.high the
        // default keymap outranks vim for every overlapping key. The
        // observable consequence (found by tests/vim-motion.e2e.spec.ts,
        // invisible to jsdom): on macOS the standard keymap binds Ctrl-d to
        // deleteCharForward, so in vim mode Ctrl+D silently DELETED the
        // character under the cursor — it neither scrolled (vim's meaning)
        // nor marked done (the app yields Ctrl+D while vim is on). A vim
        // user pressing a scroll key was corrupting a task, one character
        // at a time.
        effects: _.reconfigure(hl.high(fe.vim()))
      });
      const Ae = fe.getCM(v.current);
      if (Ae) {
        const St = (Pe) => {
          var we;
          const ot = (Pe.mode || "normal").toUpperCase(), K = Pe.subMode ? ` ${Pe.subMode.toUpperCase()}` : "";
          (we = A.current) == null || we.call(A, ot === "VISUAL" && K ? `VISUAL${K}` : ot);
        };
        Ae.on("vim-mode-change", St), T.current = () => Ae.off("vim-mode-change", St);
      }
      (be = A.current) == null || be.call(A, "NORMAL");
    }) : ((Q = T.current) == null || Q.call(T), T.current = null, O.dispatch({
      effects: _.reconfigure([])
    }), (de = A.current) == null || de.call(A, "NORMAL")), () => {
      X = !0;
    };
  }, [o, _]), U(() => {
    const O = v.current;
    O && O.dispatch({
      effects: le.reconfigure(
        s ? jc() : []
      )
    });
  }, [s, le]);
  const it = (l == null ? void 0 : l.source) ?? null;
  return U(() => {
    const O = v.current;
    O && O.dispatch({
      effects: ne.reconfigure(Uc($.current))
    });
  }, [it, ne]), U(() => {
    const O = v.current;
    O && O.dispatch({
      effects: ae.reconfigure(
        qc(G.current)
      )
    });
  }, [a, ae]), U(() => {
    const O = v.current;
    O && O.dispatch({
      effects: Ce.reconfigure(
        Yc(W.current)
      )
    });
  }, [c, Ce]), U(() => {
    const O = v.current;
    O && O.dispatch({
      effects: Ue.reconfigure(
        ie.readOnly.of(d)
      )
    });
  }, [d, Ue]), vf(w, () => ({
    focus() {
      var O;
      (O = v.current) == null || O.focus();
    },
    getCaret() {
      var O;
      return ((O = v.current) == null ? void 0 : O.state.selection.main.head) ?? 0;
    },
    setCaret(O) {
      const X = v.current;
      if (!X) return;
      const Q = Math.max(0, Math.min(O, X.state.doc.length));
      X.dispatch({ selection: { anchor: Q } });
    },
    setSelection(O, X) {
      const Q = v.current;
      if (!Q) return;
      const de = Math.max(0, Math.min(O, Q.state.doc.length)), fe = Math.max(0, Math.min(X, Q.state.doc.length));
      Q.dispatch({ selection: { anchor: de, head: fe } });
    },
    getSelections() {
      var O;
      return ((O = v.current) == null ? void 0 : O.state.selection.ranges.map((X) => ({
        from: X.from,
        to: X.to
      }))) ?? [];
    },
    getScrollElement() {
      var O;
      return ((O = v.current) == null ? void 0 : O.scrollDOM) ?? null;
    },
    getValue() {
      var O;
      return ((O = v.current) == null ? void 0 : O.state.doc.toString()) ?? "";
    },
    getView() {
      return v.current;
    },
    applyEdit(O, X) {
      const Q = v.current;
      if (!Q) return;
      const de = Q.state.doc.toString();
      if (de === O) {
        if (X !== void 0) {
          const Ae = Math.max(0, Math.min(X, O.length));
          Q.dispatch({ selection: { anchor: Ae } });
        }
        return;
      }
      const fe = X === void 0 ? void 0 : Math.max(0, Math.min(X, O.length));
      Q.dispatch({
        changes: { from: 0, to: de.length, insert: O },
        ...fe === void 0 ? {} : { selection: { anchor: fe } }
      });
    }
  })), /* @__PURE__ */ y(
    "div",
    {
      ref: k,
      className: "flex-1 overflow-hidden",
      style: { height: "100%" }
    }
  );
}), Pw = "todo-txt.recovery.v1.", $w = "todo-txt", Fw = 1, vn = "recovery-drafts";
let Dr = null;
function Il(r) {
  return `${Pw}${r}`;
}
function Bu(r, e) {
  if (!r || typeof r != "object") return null;
  const t = r;
  return t.version !== 1 || t.file !== e || typeof t.content != "string" || typeof t.baseMtime != "number" || !Number.isFinite(t.baseMtime) || t.baseMtime < 0 || typeof t.updatedAt != "number" || !Number.isFinite(t.updatedAt) || t.updatedAt <= 0 || // `root` is optional (legacy records predate scoping) but must be a
  // non-empty string when present — a blank or non-string root would
  // compare equal to nothing and silently disable scoping.
  t.root !== void 0 && (typeof t.root != "string" || t.root === "") ? null : t;
}
function Hw(r) {
  if (typeof window > "u" || !window.localStorage) return null;
  try {
    const e = window.localStorage.getItem(Il(r));
    return e ? Bu(JSON.parse(e), r) : null;
  } catch {
    return null;
  }
}
function Ww(r) {
  if (!(typeof window > "u" || !window.localStorage))
    try {
      window.localStorage.setItem(
        Il(r.file),
        JSON.stringify(r)
      );
    } catch {
    }
}
function zw(r) {
  if (!(typeof window > "u" || !window.localStorage))
    try {
      window.localStorage.removeItem(Il(r));
    } catch {
    }
}
function Pl() {
  if (Dr) return Dr;
  if (typeof indexedDB > "u") return Promise.resolve(null);
  const r = new Promise((e) => {
    let t = !1;
    const n = (i) => {
      if (t) {
        i == null || i.close();
        return;
      }
      t = !0, e(i);
    };
    try {
      const i = indexedDB.open($w, Fw);
      i.onupgradeneeded = () => {
        const o = i.result;
        o.objectStoreNames.contains(vn) || o.createObjectStore(vn, { keyPath: "file" });
      }, i.onsuccess = () => n(i.result), i.onerror = () => n(null), i.onblocked = () => n(null);
    } catch {
      n(null);
    }
  });
  return Dr = r, r.then((e) => {
    !e && Dr === r && (Dr = null);
  }), r;
}
function Iu(r) {
  return new Promise((e) => {
    r.oncomplete = () => e(), r.onerror = () => e(), r.onabort = () => e();
  });
}
async function Vw(r) {
  const e = await Pl();
  if (!e) return null;
  try {
    const n = e.transaction(vn, "readonly").objectStore(vn).get(r), i = await new Promise((o) => {
      n.onsuccess = () => o(n.result), n.onerror = () => o(null);
    });
    return Bu(i, r);
  } catch {
    return null;
  }
}
async function _w(r) {
  const e = await Pl();
  if (e)
    try {
      const t = e.transaction(vn, "readwrite");
      t.objectStore(vn).put(r), await Iu(t);
    } catch {
    }
}
async function jw(r) {
  const e = await Pl();
  if (e)
    try {
      const t = e.transaction(vn, "readwrite");
      t.objectStore(vn).delete(r), await Iu(t);
    } catch {
    }
}
async function ts(r, e) {
  const t = Hw(r), n = await Vw(r), i = t ? n ? t.updatedAt >= n.updatedAt ? t : n : t : n;
  return i === null ? null : Kw() ? i : null;
}
function Kw(r, e) {
  return !0;
}
function Uw(r) {
  return Ww(r), _w(r);
}
async function Qn(r, e) {
  zw(r), await jw(r);
}
function qw(r) {
  return Math.min(3e4, 1e3 * 2 ** Math.max(0, r - 1));
}
class Yw {
  constructor(e) {
    Et(this, "pending", null);
    Et(this, "worker", null);
    Et(this, "retryTimer", null);
    Et(this, "retryAttempt", 0);
    Et(this, "revision", 0);
    Et(this, "disposed", !1);
    Et(this, "setTimer");
    Et(this, "clearTimer");
    this.options = e, this.setTimer = e.setTimer ?? setTimeout, this.clearTimer = e.clearTimer ?? clearTimeout;
  }
  enqueue(e) {
    const t = { ...e, revision: ++this.revision };
    return this.pending = t, this.cancelRetryTimer(), this.pump(), t;
  }
  /** Attempt every currently queued value now, bypassing retry delay. */
  flush() {
    return this.cancelRetryTimer(), this.pump();
  }
  cancelPending() {
    this.pending = null, this.retryAttempt = 0, this.cancelRetryTimer();
  }
  hasUnsavedWork() {
    return !!(this.pending || this.worker || this.retryTimer);
  }
  dispose() {
    this.disposed = !0, this.pending = null, this.cancelRetryTimer();
  }
  cancelRetryTimer() {
    this.retryTimer && (this.clearTimer(this.retryTimer), this.retryTimer = null);
  }
  pump() {
    if (this.disposed) return Promise.resolve(null);
    if (this.worker) return this.worker;
    const e = this.run();
    return this.worker = e, e.finally(() => {
      this.worker === e && (this.worker = null), this.pending && !this.retryTimer && !this.disposed && this.pump();
    }), e;
  }
  async run() {
    var t, n, i, o, s, l, a, c, h, d;
    let e = null;
    for (; this.pending && !this.disposed; ) {
      const u = this.pending;
      this.pending = null, (n = (t = this.options).onAttempt) == null || n.call(t, u);
      let f;
      try {
        f = await this.options.save(u);
      } catch (v) {
        f = {
          kind: "retry",
          message: v instanceof Error ? v.message : String(v)
        };
      }
      if (e = f, this.disposed) return f;
      const g = this.pending, w = !!(g && g.revision > u.revision);
      if (f.kind === "saved") {
        this.retryAttempt = 0, (o = (i = this.options).onSaved) == null || o.call(i, u, f, !w);
        continue;
      }
      if (f.kind === "conflict") {
        if (this.retryAttempt = 0, (l = (s = this.options).onConflict) == null || l.call(s, u, f), w) continue;
        return f;
      }
      if (f.kind === "fatal") {
        if (this.retryAttempt = 0, (c = (a = this.options).onFatal) == null || c.call(a, u, f), w) continue;
        return f;
      }
      w || (this.pending = u), this.retryAttempt += 1;
      const k = qw(this.retryAttempt);
      return (d = (h = this.options).onRetry) == null || d.call(
        h,
        this.pending ?? u,
        f,
        this.retryAttempt,
        k
      ), this.retryTimer = this.setTimer(() => {
        this.retryTimer = null, this.pump();
      }, k), f;
    }
    return e;
  }
}
const Pu = "todo-txt.selection-toolbar.v1", Wi = [
  "automatic",
  "on-demand",
  "off"
];
function Gw(r) {
  return Wi.includes(r) ? r : "automatic";
}
function Jw() {
  if (typeof window > "u" || !window.localStorage)
    return "automatic";
  try {
    return Gw(
      window.localStorage.getItem(Pu)
    );
  } catch {
    return "automatic";
  }
}
function Xw(r) {
  if (!(typeof window > "u" || !window.localStorage))
    try {
      window.localStorage.setItem(Pu, r);
    } catch {
    }
}
function Zw(r) {
  const e = Wi.indexOf(r);
  return Wi[(e + 1) % Wi.length];
}
function Qw(r) {
  return r === "automatic" ? "Auto" : r === "on-demand" ? "Manual" : "Off";
}
function ho(r, e) {
  return Math.max(0, Math.min(r, e));
}
function $l(r, e) {
  const t = [...r].sort((i, o) => i.from - o.from || i.to - o.to), n = [];
  for (const i of t) {
    const o = n[n.length - 1], s = e ? (o == null ? void 0 : o.to) + 1 : o == null ? void 0 : o.to;
    o && i.from <= s ? o.to = Math.max(o.to, i.to) : n.push({ ...i });
  }
  return n;
}
function ei(r, e) {
  const t = [];
  for (const n of e) {
    const i = Math.min(n.from, n.to), o = Math.max(n.from, n.to), s = ho(i, r.length), l = ho(o, r.length);
    if (i !== o && s === l) continue;
    const a = s === 0 ? 0 : r.lastIndexOf(`
`, s - 1) + 1, c = l > s && r[l - 1] === `
` ? l - 1 : l, h = r.indexOf(`
`, c), d = h === -1 ? r.length : h;
    t.push({ from: a, to: d });
  }
  return $l(t, !0);
}
function ev(r, e) {
  return ei(r, e).reduce((t, n) => {
    const i = r.slice(n.from, n.to);
    return t + (i === "" ? 1 : i.split(`
`).length);
  }, 0);
}
function tv(r, e) {
  return $l(
    e.map(({ from: t, to: n }) => ({
      from: ho(Math.min(t, n), r.length),
      to: ho(Math.max(t, n), r.length)
    })).filter((t) => t.from !== t.to),
    !1
  ).map((t) => r.slice(t.from, t.to)).join(`
`);
}
function nv(r, e, t) {
  return ei(r, e).map((n) => {
    const i = r.slice(n.from, n.to);
    return {
      ...n,
      insert: i.split(`
`).map(t).join(`
`)
    };
  }).filter((n) => n.insert !== r.slice(n.from, n.to));
}
function Jc(r, e) {
  const t = ei(r, e).map((n) => n.to < r.length && r[n.to] === `
` ? { from: n.from, to: n.to + 1 } : n.from > 0 && r[n.from - 1] === `
` ? { from: n.from - 1, to: n.to } : n);
  return $l(t, !1).map((n) => ({
    ...n,
    insert: ""
  }));
}
function $u(r, e) {
  return ei(r, e).map((t) => ({
    from: t.to,
    to: t.to,
    insert: `
${r.slice(t.from, t.to)}`
  }));
}
function rv(r, e) {
  const t = ei(r, e), n = $u(r, e);
  let i = 0;
  const o = t.map((s) => {
    const l = s.from + i;
    return i += s.to - s.from + 1, { from: l, to: s.to + i };
  });
  return { changes: n, ranges: o };
}
const ge = "/apps/todo-txt/api";
async function iv() {
  try {
    const r = await fetch(`${ge}/settings`);
    if (!r.ok) return;
    const e = await r.json();
    return typeof e.root != "string" || e.root === "" ? void 0 : { root: e.root, isDefault: e.is_default === !0 };
  } catch {
    return;
  }
}
function ov(r, e) {
  return e ? r.root === void 0 ? e.isDefault : r.root === e.root : !0;
}
const sv = /* @__PURE__ */ new Set([
  "do",
  "undo",
  "del",
  "move",
  "pri",
  "depri",
  "replace",
  "append",
  "prepend",
  "due"
]), lv = 400, av = 4e3, cv = 5e3, hv = 4e3;
function dv(r) {
  const e = Math.abs(r.line_delta);
  if (r.tier === 3 && r.line_delta < 0)
    return e === 1 ? "KiroCrew removed 1 line (YOLO)" : `KiroCrew removed ${e} lines (YOLO)`;
  if (r.line_delta === 0)
    return "KiroCrew modified todo.txt";
  const t = r.line_delta > 0 ? "added" : "modified";
  return e === 1 ? `KiroCrew ${t} 1 line` : `KiroCrew ${t} ${e} lines`;
}
function uv(r) {
  const e = r.toLowerCase();
  return !(e.includes("malformed") || e.includes("parse") || e.includes("invalid llm"));
}
function fv() {
  var Ul;
  const { openChat: r } = kf(), [e, t] = q(""), [n, i] = q({ kind: "idle" }), [o, s] = q(0), [l, a] = q(!1), [c, h] = q(!1), d = z(!1), [u, f] = q(() => Ng()), [g, w] = q(!1), [k, v] = q(null), [D, N] = q(null), [Y, A] = q(!1), [T, S] = q(!1), [B, $] = q([]), [G, W] = q(!1), [_, le] = q("todo"), [ne, ae] = q(null);
  U(() => {
    if (!T) return;
    const p = (m) => {
      m.key === "Escape" && (m.preventDefault(), m.stopPropagation(), ne ? ae(null) : S(!1));
    };
    return window.addEventListener("keydown", p, { capture: !0 }), () => window.removeEventListener("keydown", p, { capture: !0 });
  }, [T, ne]);
  const [Ce, Ue] = q(!1), rt = z(!1);
  U(() => {
    rt.current = Ce;
  }, [Ce]);
  const [Oe, it] = q(null), [O, X] = q("todo"), [Q, de] = q([]), [fe, Ae] = q(!1), [be, St] = q(null), [Pe, ot] = q([]), [K, we] = q(null), [Ct, Re] = q(!1), [Be, Yn] = q(() => Jw()), dt = P(() => {
    Yn((p) => {
      const m = Zw(p);
      return Xw(m), m === "off" && Re(!1), m === "automatic" && K && Re(!0), m;
    });
  }, [K]), { enabled: At, toggle: ti } = jf(), [Ie, ni] = q(() => {
    try {
      return localStorage.getItem("todotxt.vimMode") === "true";
    } catch {
      return !1;
    }
  }), [An, Ao] = q("NORMAL"), [It, Mn] = q(
    () => op()
  ), j = z(It);
  j.current = It;
  const J = Qe(
    () => It === null ? null : rs(It),
    [It]
  ), ze = P((p) => {
    Mn(p), sp(p);
  }, []), Pt = Qe(
    () => J === null ? null : ea(e, J),
    [e, J]
  ), [Xt, ri] = q(
    () => up()
  ), Gn = z(Xt);
  Gn.current = Xt;
  const Mo = P((p) => {
    ri(p), fp(p);
  }, []), ii = Qe(
    () => ta(e, Xt, Fr()),
    [e, Xt]
  ), [Dn, Fu] = q(
    () => Bp()
  ), oi = z(Dn);
  oi.current = Dn;
  const Do = P((p) => {
    Fu(p), Ip(p);
  }, []), Tn = Qe(
    () => oa(e, Dn),
    [e, Dn]
  ), si = z(Tn);
  si.current = Tn;
  const Hu = P(() => {
    ni((p) => {
      const m = !p;
      try {
        localStorage.setItem("todotxt.vimMode", m ? "true" : "false");
      } catch {
      }
      return m;
    });
  }, []), st = z(null), Fl = z(!1), [yv, Wu] = q({ top: 0, left: 0 }), ce = z(null), En = z(null), Zt = z(0), Hl = z(void 0), qe = z({
    todo: 0,
    done: 0,
    report: 0
  }), ut = z({
    todo: "",
    done: ""
  }), Mt = z(/* @__PURE__ */ new Set()), ke = z("todo"), Qt = z(null), yr = z(null), Wl = z(0), Me = z(""), Jn = z(null), zu = z(0), On = z(null), zl = z(null), [Ln, Vu] = q(() => {
    try {
      return localStorage.getItem("todotxt.amoled") === "true";
    } catch {
      return !1;
    }
  }), _u = P(() => {
    Vu((p) => {
      const m = !p;
      try {
        localStorage.setItem("todotxt.amoled", m ? "true" : "false");
      } catch {
      }
      return m;
    });
  }, []);
  U(
    () => Dm(() => On.current, Ln),
    [Ln]
  ), U(
    () => km(() => f((p) => !p)),
    []
  ), U(
    () => Sm(
      () => {
        var p;
        return (p = st.current) == null ? void 0 : p.getView();
      },
      Ie,
      window,
      // File-aware at keypress time (ref read, no rebind on tab switch):
      // recurrence spawning only in todo.txt — see handleMarkDone.
      (p) => gh(p, ke.current)
    ),
    [Ie]
  );
  const li = z(null), Vl = z(null);
  z(0), U(() => {
    Me.current = e;
  }, [e]), U(() => {
    ke.current = O;
  }, [O]), U(() => {
    Ie && !Fl.current && import("./index-BgPNUeCy.js").then((p) => {
      yh(p.Vim), Fl.current = !0;
    });
  }, [Ie]);
  const ai = P(
    async (p) => {
      const m = p.file === "todo" ? `${ge}/content` : `${ge}/file?name=done`, x = {
        content: p.content
      };
      p.force || (x.base_mtime = p.baseMtime);
      try {
        const b = await fetch(m, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(x)
        });
        if (b.status === 409)
          return {
            kind: "conflict",
            message: "File changed on disk — reload or overwrite explicitly"
          };
        if (!b.ok) {
          const Z = await b.text().catch(() => `HTTP ${b.status}`) || `HTTP ${b.status}`;
          return b.status === 408 || b.status === 425 || b.status === 429 || b.status >= 500 ? { kind: "retry", message: Z } : { kind: "fatal", message: Z };
        }
        const M = await b.json().catch(() => ({}));
        return {
          kind: "saved",
          mtime: typeof M.mtime == "number" && Number.isFinite(M.mtime) ? M.mtime : Date.now() / 1e3
        };
      } catch (b) {
        return {
          kind: "retry",
          message: b instanceof Error ? b.message : String(b)
        };
      }
    },
    []
  );
  U(() => {
    const p = new Yw({
      save: ai,
      onAttempt: (m) => {
        ke.current === m.file && i({ kind: "saving" });
      },
      onSaved: (m, x) => {
        qe.current[m.file] = x.mtime, ke.current === m.file && (Zt.current = x.mtime, s(x.mtime), i({ kind: "saved", at: Date.now() }), a(!1), A(!1)), ut.current[m.file] === m.content && (Mt.current.delete(m.file), Qn(m.file), N(
          (b) => (b == null ? void 0 : b.file) === m.file ? null : b
        ));
      },
      onConflict: (m, x) => {
        ke.current === m.file && (a(!0), A(!0), i({ kind: "error", message: x.message }));
      },
      onRetry: (m, x, b, M) => {
        ke.current === m.file && i({
          kind: "error",
          message: `${x.message} — retrying in ${Math.ceil(M / 1e3)}s`
        });
      },
      onFatal: (m, x) => {
        ke.current === m.file && i({ kind: "error", message: x.message });
      }
    });
    return Qt.current = p, () => {
      p.dispose(), Qt.current === p && (Qt.current = null);
    };
  }, [ai]);
  const ft = P(
    async (p, m = ke.current, x = !1) => {
      if (m !== "todo" && m !== "done") return null;
      const b = Qt.current;
      return b ? (b.enqueue({
        file: m,
        content: p,
        baseMtime: qe.current[m],
        force: x
      }), b.flush()) : ai({
        file: m,
        content: p,
        baseMtime: qe.current[m],
        force: x,
        revision: 0
      });
    },
    [ai]
  ), Ve = P(
    (p) => {
      var F;
      const m = ke.current;
      if (m === "report") return;
      const x = m;
      Me.current = p, ut.current[x] = p, Mt.current.add(x), N(
        (Z) => (Z == null ? void 0 : Z.file) === x ? null : Z
      ), Uw({
        version: 1,
        file: x,
        content: p,
        baseMtime: qe.current[x],
        updatedAt: Date.now(),
        // Stamp the root so this draft is only ever offered back for the
        // directory it was actually typed against.
        root: (F = Hl.current) == null ? void 0 : F.root
      }), ce.current && clearTimeout(ce.current), En.current === null && (En.current = Date.now());
      const M = Date.now() - En.current >= av ? 0 : lv;
      ce.current = setTimeout(() => {
        ce.current = null, En.current = null, ft(p, x);
      }, M);
    },
    [ft]
  ), ci = P(async () => {
    var m;
    const p = ke.current;
    ce.current ? (clearTimeout(ce.current), ce.current = null, En.current = null, p !== "report" && await ft(
      ut.current[p],
      p
    )) : (m = Qt.current) != null && m.hasUnsavedWork() && await Qt.current.flush();
  }, [ft]), xr = P(
    async (p, m) => {
      if (!(p === ke.current && !(m != null && m.force))) {
        await ci(), ke.current = p, X(p), we(null), Re(!1), N(null), A(!1);
        try {
          const x = await fetch(
            `${ge}/file?name=${encodeURIComponent(p)}`
          );
          if (!x.ok) {
            i({
              kind: "error",
              message: `Load ${p}.txt failed: HTTP ${x.status}`
            });
            return;
          }
          const b = await x.json(), M = b.content ?? "", F = b.mtime ?? 0;
          if (t(M), Me.current = M, s(F), Zt.current = F, qe.current[p] = F, p !== "report") {
            const Z = p;
            ut.current[Z] = M, Mt.current.delete(Z);
            const he = await ts(Z);
            he && he.content !== M ? N(he) : he && Qn(Z);
          }
          i({ kind: "saved", at: Date.now() }), a(!1), v(null);
        } catch (x) {
          const b = x instanceof Error ? x.message : String(x);
          i({
            kind: "error",
            message: `Load ${p}.txt failed: ${b}`
          });
        }
      }
    },
    [ci]
  );
  U(() => {
    let p = !1;
    const m = iv(), x = ts("todo");
    return (async () => {
      try {
        const b = await fetch(`${ge}/content`);
        if (!b.ok) {
          const me = await x;
          p || (N(me), i({
            kind: "error",
            message: `Load failed: HTTP ${b.status}`
          }), v(`HTTP ${b.status}`), w(!0));
          return;
        }
        const M = await b.json(), F = await x;
        if (p) return;
        ce.current && (clearTimeout(ce.current), ce.current = null);
        const Z = M.content ?? "", he = M.mtime ?? 0;
        if (t(Z), Me.current = Z, ut.current.todo = Z, Mt.current.delete("todo"), s(he), Zt.current = he, qe.current.todo = he, F && F.content !== Z) {
          const me = await m;
          if (p) return;
          Hl.current = me, ov(F, me) && N(F);
        } else F && Qn("todo");
        i({ kind: "saved", at: Date.now() }), v(null), w(!0);
      } catch (b) {
        if (p) return;
        const M = await x;
        if (p) return;
        const F = b instanceof Error ? b.message : String(b);
        N(M), i({ kind: "error", message: `Load failed: ${F}` }), v(F), w(!0);
      }
    })(), () => {
      p = !0;
    };
  }, []);
  const ju = P(async () => {
    ce.current && (clearTimeout(ce.current), ce.current = null), i({ kind: "idle" });
    try {
      const p = await fetch(`${ge}/content`);
      if (!p.ok) {
        i({ kind: "error", message: `Load failed: HTTP ${p.status}` }), v(`HTTP ${p.status}`);
        return;
      }
      const m = await p.json(), x = m.content ?? "", b = m.mtime ?? 0;
      t(x), Me.current = x, ut.current.todo = x, Mt.current.delete("todo"), s(b), Zt.current = b, qe.current.todo = b;
      const M = await ts("todo");
      M && M.content !== x ? N(M) : M && Qn("todo"), i({ kind: "saved", at: Date.now() }), v(null);
    } catch (p) {
      const m = p instanceof Error ? p.message : String(p);
      i({ kind: "error", message: `Load failed: ${m}` }), v(m);
    } finally {
      w(!0);
    }
  }, []), Ku = P(() => {
    var m;
    if (!D) return;
    const p = D.file;
    (m = Qt.current) == null || m.cancelPending(), ce.current && (clearTimeout(ce.current), ce.current = null), ke.current = p, X(p), Me.current = D.content, ut.current[p] = D.content, t(D.content), qe.current[p] === 0 && (qe.current[p] = D.baseMtime, Zt.current = D.baseMtime), w(!0), v(null), N(null), i({ kind: "saving" }), Ve(D.content);
  }, [D, Ve]), Uu = P(() => {
    D && (Qn(D.file), N(null));
  }, [D]), qu = P(async () => {
    const p = ke.current;
    if (p === "report") return;
    const m = await ft(
      ut.current[p],
      p,
      !0
    );
    (m == null ? void 0 : m.kind) === "saved" && (A(!1), a(!1));
  }, [ft]);
  U(() => {
    yr.current && clearInterval(yr.current);
    const p = async () => {
      var F;
      if (document.visibilityState !== "visible") return;
      const m = ke.current, x = qe.current[m], b = Number.isFinite(x) && x > 0 ? `if_none_mtime=${encodeURIComponent(String(x))}` : "", M = m === "todo" ? `${ge}/content${b ? `?${b}` : ""}` : `${ge}/file?name=${encodeURIComponent(m)}` + (b ? `&${b}` : "");
      try {
        const Z = await fetch(M);
        if (!Z.ok) return;
        const he = await Z.json();
        if (ke.current !== m || he.unchanged === !0) return;
        const me = he.mtime ?? 0;
        if (me <= 0 || me <= qe.current[m])
          return;
        if (m !== "report" && (Mt.current.has(m) || !!((F = Qt.current) != null && F.hasUnsavedWork()))) {
          a(!0);
          return;
        }
        const Tt = he.content ?? "";
        t(Tt), Me.current = Tt, m !== "report" && (ut.current[m] = Tt), s(me), Zt.current = me, qe.current[m] = me, i({ kind: "saved", at: Date.now() });
      } catch {
      }
    };
    return yr.current = setInterval(p, cv), () => {
      yr.current && clearInterval(yr.current);
    };
  }, []), U(() => {
    const p = () => {
      if (Mt.current.size !== 0) {
        ce.current && (clearTimeout(ce.current), ce.current = null), En.current = null;
        for (const b of Mt.current)
          ft(ut.current[b], b);
      }
    }, m = () => {
      if (Mt.current.size !== 0) {
        ce.current && (clearTimeout(ce.current), ce.current = null), En.current = null;
        for (const b of Mt.current) {
          const M = b === "todo" ? `${ge}/content` : `${ge}/file?name=${encodeURIComponent(b)}`, F = JSON.stringify({
            content: ut.current[b],
            base_mtime: qe.current[b]
          });
          let Z = !1;
          if (typeof navigator.sendBeacon == "function")
            try {
              const he = new Blob([F], { type: "application/json" });
              Z = navigator.sendBeacon(M, he);
            } catch {
            }
          Z || fetch(M, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: F,
            keepalive: !0
          }).catch(() => {
          });
        }
      }
    }, x = () => {
      document.visibilityState === "hidden" && m();
    };
    return window.addEventListener("blur", p), window.addEventListener("beforeunload", m), window.addEventListener("pagehide", m), document.addEventListener("visibilitychange", x), () => {
      window.removeEventListener("blur", p), window.removeEventListener("beforeunload", m), window.removeEventListener("pagehide", m), document.removeEventListener("visibilitychange", x), m();
    };
  }, [ft]);
  const Xn = z(null), Yu = P(
    (p) => {
      const m = st.current, x = m == null ? void 0 : m.getView();
      if (!(!m || !x)) {
        if (p.key === "Tab" && !p.shiftKey && !p.ctrlKey && !p.metaKey && !p.altKey) {
          const b = x.state.selection.main;
          if (b.empty) {
            const M = m.getValue(), F = b.head, Z = `${F}:${M.slice(
              Math.max(0, F - 40),
              F
            )}`, he = li.current, me = he && he.key === Z ? he.index + 1 : 0, Dt = zm(M, F, me);
            if (Dt && Dt.matches.length > 0) {
              p.preventDefault(), p.stopPropagation(), Xn.current = null, li.current = { key: Z, index: me }, t(Dt.value), Ve(Dt.value), requestAnimationFrame(() => m.setCaret(Dt.caret));
              return;
            }
          }
          li.current = null;
        } else
          li.current = null;
        if (p.key === "Backspace" && Xn.current) {
          const b = Xn.current, M = m.getValue();
          if (M === b.afterValue || M.trimEnd() === b.afterValue.trimEnd()) {
            p.preventDefault(), p.stopPropagation(), Xn.current = null, t(b.beforeValue), Ve(b.beforeValue), requestAnimationFrame(() => m.setCaret(b.beforeCaret));
            return;
          }
        }
        ["Shift", "Control", "Alt", "Meta"].includes(p.key) || (Xn.current = null), Be === "on-demand" && K && p.altKey && !p.ctrlKey && !p.metaKey && p.key === "Enter" && (p.preventDefault(), p.stopPropagation(), Re(!0));
      }
    },
    [Ve, K, Be]
  ), cn = P(async () => {
    var p;
    (p = Qt.current) == null || p.cancelPending(), ce.current && (clearTimeout(ce.current), ce.current = null);
    try {
      const m = ke.current, x = await fetch(
        `${ge}/file?name=${encodeURIComponent(m)}`
      );
      if (!x.ok) {
        i({
          kind: "error",
          message: `Reload failed: HTTP ${x.status}`
        });
        return;
      }
      const b = await x.json(), M = b.content ?? "", F = b.mtime ?? 0;
      if (t(M), Me.current = M, m !== "report") {
        const Z = m;
        ut.current[Z] = M, Mt.current.delete(Z), Qn(Z);
      }
      s(F), Zt.current = F, qe.current[m] = F, i({ kind: "saved", at: Date.now() }), a(!1), A(!1);
    } catch (m) {
      const x = m instanceof Error ? m.message : String(m);
      i({ kind: "error", message: `Reload failed: ${x}` });
    }
  }, []), L = P((p, m) => {
    const x = ++zu.current;
    ot((b) => [...b, { id: x, tone: p, message: m }]), setTimeout(() => {
      ot((b) => b.filter((M) => M.id !== x));
    }, hv);
  }, []);
  U(() => {
    const p = (m) => {
      if ((m.metaKey || m.ctrlKey) && !m.altKey && !m.shiftKey && m.key.toLowerCase() === "k") {
        const b = On.current, M = document.activeElement;
        if (!!!(b && M && b.contains(M)) && !rt.current) return;
        m.preventDefault(), m.stopPropagation(), Ue((Z) => !Z);
      }
    };
    return window.addEventListener("keydown", p, { capture: !0 }), () => {
      window.removeEventListener("keydown", p, { capture: !0 });
    };
  }, []);
  const _l = P(
    async (p, m) => {
      switch (oi.current === "hide" && si.current.hidden > 0 && sv.has(p.name) && (m.type === "mutation" || m.type === "server-action") && L(
        "info",
        `${si.current.hidden} h:1 line${si.current.hidden === 1 ? "" : "s"} out of view — item numbers count every line in the file, including hidden ones. Run \`hidden show\` to see them.`
      ), m.type) {
        case "mutation": {
          if (t(m.content), Ve(m.content), p.name === "example") {
            const x = Me.current.split(`
`).filter((M) => M !== "").length, b = m.content.split(`
`).filter((M) => M !== "").length;
            L(
              "success",
              `example: replaced ${x} line${x === 1 ? "" : "s"} with ${b} starter line${b === 1 ? "" : "s"}`
            );
          } else
            L("success", `${p.name}: applied.`);
          return;
        }
        case "server-action": {
          try {
            const x = m.endpoint === `${ge}/move` && m.body !== null && typeof m.body == "object" ? m.body.from : void 0, b = x !== void 0 ? {
              ...m.body,
              base_mtime: qe.current[x]
            } : m.body, M = await fetch(m.endpoint, {
              method: m.method,
              headers: b !== void 0 ? { "Content-Type": "application/json" } : void 0,
              body: b !== void 0 ? JSON.stringify(b) : void 0
            });
            if (M.status === 409) {
              await cn(), L(
                "error",
                `${p.name}: ${x ?? "file"}.txt changed on disk — reloaded, nothing moved.`
              );
              return;
            }
            if (!M.ok) {
              const F = await M.text().catch(() => `HTTP ${M.status}`);
              L("error", `${p.name}: ${F || `HTTP ${M.status}`}`);
              return;
            }
            if (p.name === "report") {
              await xr("report");
              const F = await M.json().catch(() => null);
              L(
                "success",
                F != null && F.snapshot ? `report: ${F.snapshot}` : "report: snapshot saved."
              );
            } else
              await cn(), L("success", `${p.name}: done.`);
          } catch (x) {
            const b = x instanceof Error ? x.message : String(x);
            L("error", `${p.name}: ${b}`);
          }
          return;
        }
        case "filter": {
          it(m);
          return;
        }
        case "aggregate": {
          it({
            ...m,
            drillMode: p.name === "listproj" ? "project" : "context"
          });
          return;
        }
        case "info": {
          L("info", m.text);
          return;
        }
        case "set-filter": {
          if (m.expr === null) {
            if (j.current === null) {
              L("info", `${p.name}: no filter is active.`);
              return;
            }
            ze(null), L("success", `${p.name}: cleared.`);
            return;
          }
          ze(m.expr);
          const x = rs(m.expr), b = x === null ? null : ea(Me.current, x);
          L(
            "success",
            b === null ? `${p.name}: ${m.expr}` : `${p.name}: ${m.expr} — ${b.matched}/${b.total} match` + (b.matched === 0 ? " (nothing matches — Esc to clear)" : "")
          );
          return;
        }
        case "set-threshold": {
          const x = m.mode === "toggle" ? Gn.current === "hide" ? "show" : "hide" : m.mode;
          if (x === Gn.current) {
            L("info", `${p.name}: already ${x}ing future t: tasks.`);
            return;
          }
          Mo(x);
          const b = ta(
            Me.current,
            x,
            Fr()
          );
          L(
            "success",
            x === "show" ? `${p.name}: showing all ${b.total} lines.` : b.hidden === 0 ? `${p.name}: hide is on — no t: dates are in the future yet.` : `${p.name}: ${b.hidden}/${b.total} future t: task${b.hidden === 1 ? "" : "s"} pushed back.`
          );
          return;
        }
        case "set-hidden": {
          const x = m.mode === "toggle" ? oi.current === "show" ? "dim" : "show" : m.mode;
          if (x === oi.current) {
            L("info", `${p.name}: h:1 lines are already ${x}.`);
            return;
          }
          Do(x);
          const b = oa(Me.current, x), M = b.hidden === 1 ? "" : "s";
          L(
            "success",
            x === "show" ? `${p.name}: showing all ${b.total} lines.` : b.hidden === 0 ? `${p.name}: ${x} is on — no line carries h:1 yet.` : x === "hide" ? `${p.name}: ${b.hidden}/${b.total} h:1 line${M} removed from view (still in the file).` : `${p.name}: ${b.hidden}/${b.total} h:1 line${M} dimmed.`
          );
          return;
        }
        case "set-root": {
          try {
            await ci();
            const x = await fetch(`${ge}/settings`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ root: m.root })
            }), b = await x.json().catch(() => null);
            if (!x.ok || b === null) {
              L(
                "error",
                `${p.name}: ${sa(b, x.status)}`
              );
              return;
            }
            await xr(ke.current, { force: !0 }), L("success", `${p.name}: ${Wp(b)}`);
          } catch (x) {
            const b = x instanceof Error ? x.message : String(x);
            L("error", `${p.name}: ${b}`);
          }
          return;
        }
        case "show-root": {
          try {
            const x = await fetch(`${ge}/settings`), b = await x.json().catch(() => null);
            if (!x.ok || b === null) {
              L(
                "error",
                `${p.name}: ${sa(b, x.status)}`
              );
              return;
            }
            L("info", `${p.name}: ${Hp(b)}`);
          } catch (x) {
            const b = x instanceof Error ? x.message : String(x);
            L("error", `${p.name}: ${b}`);
          }
          return;
        }
        case "switch-file": {
          if (m.target === O) {
            L("info", `${p.name}: already on ${m.target}.`);
            return;
          }
          try {
            await xr(m.target), L("success", `${p.name}: showing ${m.target}.txt`);
          } catch (x) {
            const b = x instanceof Error ? x.message : String(x);
            L("error", `${p.name}: ${b}`);
          }
          return;
        }
      }
    },
    [
      O,
      ze,
      Do,
      Mo,
      ci,
      xr,
      cn,
      L,
      Ve
    ]
  ), Gu = /* @__PURE__ */ new Set([
    "add",
    "append",
    "prepend",
    "del",
    "replace",
    "do",
    "pri",
    "depri",
    "sort",
    "deduplicate",
    "archive",
    // NOT 'move': applyMove is file-aware (`from` = active file) and
    // `move N todo` from the DONE tab is the sanctioned un-archive path —
    // gating it here made reverse-move unreachable. applyMove itself
    // rejects the report tab with a clear error.
    "report",
    "example"
  ]), Ju = P(
    (p, m) => {
      if (p.name === "help") {
        f(!0);
        return;
      }
      if (Gu.has(p.name) && O !== "todo") {
        L(
          "error",
          `${p.name}: switch to the todo tab first — this command operates on todo.txt`
        );
        return;
      }
      try {
        const x = p.apply(Me.current, m, O);
        _l(p, x);
      } catch (x) {
        if (x instanceof uh) {
          L("info", `${p.name}: not yet implemented (follow-up task).`);
          return;
        }
        const b = x instanceof Error ? x.message : String(x);
        L("error", la(p.name, b));
      }
    },
    [O, _l, L]
  ), Xu = P((p) => {
    var M;
    const m = (M = st.current) == null ? void 0 : M.getView();
    if (!m) return;
    const x = Math.max(
      1,
      Math.min(p, m.state.doc.lines)
    ), b = m.state.doc.line(x);
    m.dispatch({
      selection: { anchor: b.from, head: b.to },
      scrollIntoView: !0
    }), m.focus();
  }, []), Zu = P(
    (p, m) => {
      const x = m === "project" ? "listproj" : "listcon", b = Lo.find((M) => M.name === x);
      if (!b) {
        L("error", `${x}: command unavailable`);
        return;
      }
      try {
        const M = b.apply(
          Me.current,
          [p],
          O
        );
        M.type === "filter" ? it(M) : L("error", `${x}: unexpected result`);
      } catch (M) {
        const F = M instanceof Error ? M.message : String(M);
        L("error", la(x, F));
      }
    },
    [O, L]
  ), jl = P(async () => {
    if (!(Q.length === 0 || fe)) {
      if (ce.current) {
        clearTimeout(ce.current), ce.current = null;
        try {
          await ft(Me.current);
        } catch {
        }
      }
      Ae(!0);
      try {
        const p = await fetch(`${ge}/ai-edit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comments: Q })
        });
        let m;
        try {
          m = await p.json();
        } catch {
          L("error", "AI edit failed: malformed response");
          return;
        }
        if ("error" in m) {
          L("error", `AI edit failed: ${m.error}`);
          return;
        }
        if (m.status === "applied") {
          L("success", dv(m)), de([]), await (async () => {
            try {
              const x = await fetch(`${ge}/content`);
              if (!x.ok) return;
              const b = await x.json();
              t(b.content ?? ""), s(b.mtime ?? 0), Zt.current = b.mtime ?? 0, i({ kind: "saved", at: Date.now() }), a(!1);
            } catch {
            }
          })();
          return;
        }
        if (m.status === "staged") {
          St({
            current: Me.current,
            proposed: m.proposed,
            diff: m.diff,
            reason: m.reason,
            lineDelta: m.line_delta,
            charDelta: m.char_delta,
            snapshot: m.snapshot
          }), de([]);
          return;
        }
        if (m.status === "rejected") {
          L("error", `AI edit rejected: ${m.reason}`), uv(m.reason) && de([]);
          return;
        }
      } catch (p) {
        const m = p instanceof Error ? p.message : String(p);
        L("error", `AI edit failed: ${m}`);
      } finally {
        Ae(!1);
      }
    }
  }, [Q, fe, ft, L]), Qu = P(async () => {
    if (be) {
      Ae(!0);
      try {
        const p = await fetch(
          `${ge}/ai-snapshots/${encodeURIComponent(be.snapshot)}/apply`,
          { method: "POST" }
        );
        if (!p.ok) {
          if (p.status === 409) {
            await fetch(
              `${ge}/ai-snapshots/${encodeURIComponent(be.snapshot)}/discard`,
              { method: "POST" }
            ).catch(() => {
            }), St(null), L(
              "error",
              "todo.txt changed after this edit was staged — stale proposal discarded. Re-run the AI edit."
            );
            return;
          }
          const m = await p.text().catch(() => `HTTP ${p.status}`);
          L("error", `Apply failed: ${m || p.status}`);
          return;
        }
        L(
          "success",
          `KiroCrew applied staged edit (Δ${be.lineDelta >= 0 ? "+" : ""}${be.lineDelta} lines)`
        ), St(null);
        try {
          const m = await fetch(`${ge}/content`);
          if (m.ok) {
            const x = await m.json();
            t(x.content ?? ""), s(x.mtime ?? 0), Zt.current = x.mtime ?? 0, i({ kind: "saved", at: Date.now() }), a(!1);
          }
        } catch {
        }
      } catch (p) {
        const m = p instanceof Error ? p.message : String(p);
        L("error", `Apply failed: ${m}`);
      } finally {
        Ae(!1);
      }
    }
  }, [be, L]), ef = P(async () => {
    if (be)
      try {
        await fetch(
          `${ge}/ai-snapshots/${encodeURIComponent(be.snapshot)}/discard`,
          { method: "POST" }
        ).catch(() => {
        });
      } finally {
        St(null), L("info", "Staged AI edit discarded");
      }
  }, [be, L]), Zn = P(
    (p, m) => {
      const x = Math.max(0, Math.min(m, p.length)), b = p.slice(0, x), M = (b.match(/\n/g) || []).length, F = b.lastIndexOf(`
`);
      return {
        line: M + 1,
        column: x - (F + 1) + 1
      };
    },
    []
  ), To = P(
    (p, m = !0) => {
      var br;
      const x = (br = st.current) == null ? void 0 : br.getView();
      if (!x) return;
      const b = (p ?? x.state.selection.ranges).map((lt) => ({ from: lt.from, to: lt.to })).filter((lt) => lt.from !== lt.to);
      if (b.length === 0) {
        we(null), Re(!1);
        return;
      }
      const M = (p ?? x.state.selection.ranges).map(
        (lt) => ({ from: lt.from, to: lt.to })
      ), F = ev(
        x.state.doc.toString(),
        M
      ), Z = b.find(
        (lt) => lt.from === x.state.selection.main.from && lt.to === x.state.selection.main.to
      ) ?? b[0], he = x.coordsAtPos(Z.from), me = x.coordsAtPos(Z.to);
      if (!he || !me) {
        Re(!1);
        return;
      }
      const Dt = new DOMRect(
        Math.min(he.left, me.left),
        Math.min(he.top, me.top),
        Math.max(he.right, me.right) - Math.min(he.left, me.left),
        Math.max(he.bottom, me.bottom) - Math.min(he.top, me.top)
      ), Tt = x.state.doc.toString(), { line: Eo, column: ui } = Zn(Tt, Z.from);
      we({
        anchor: tv(Tt, b),
        ranges: b,
        rect: Dt,
        line: Eo,
        column: ui,
        affectedLines: F
      }), Re((lt) => Be === "off" ? !1 : Be === "automatic" && m ? !0 : lt);
    },
    [Zn, Be]
  );
  P(() => {
    const p = Jn.current;
    if (!p) return;
    const m = p.selectionStart ?? 0, x = p.selectionEnd ?? 0;
    if (m === x) {
      K && we(null);
      return;
    }
    const b = Me.current.slice(m, x), M = _m(p, m, x), { line: F, column: Z } = Zn(Me.current, m);
    we({
      anchor: b,
      // Textarea fallback: a single contiguous range, hence one line block.
      affectedLines: 1,
      ranges: [{ from: m, to: x }],
      rect: M,
      line: F,
      column: Z
    }), Re(Be === "automatic");
  }, [K, Zn]), P(
    (p) => {
      const m = p.currentTarget;
      Wu({ top: m.scrollTop, left: m.scrollLeft }), K && we(null);
    },
    [K]
  );
  const ve = P(() => {
    Re(!1), we(null);
  }, []), Rn = P(() => {
    const p = /* @__PURE__ */ new Date(), m = p.getFullYear(), x = String(p.getMonth() + 1).padStart(2, "0"), b = String(p.getDate()).padStart(2, "0");
    return `${m}-${x}-${b}`;
  }, []), $t = P(
    (p) => {
      var Dt;
      const m = (Dt = st.current) == null ? void 0 : Dt.getView();
      if (m) {
        const Tt = m.state.doc.toString(), Eo = m.state.selection.ranges.map((br) => ({
          from: br.from,
          to: br.to
        })), ui = nv(Tt, Eo, p);
        return ui.length === 0 ? null : (m.dispatch({ changes: ui }), m.state.doc.toString());
      }
      const x = Jn.current;
      if (!x) return null;
      const b = Uf(x), M = e.slice(0, b.start), F = e.slice(b.start, b.end), Z = e.slice(b.end), he = F.split(`
`).map(p).join(`
`);
      if (he === F) return null;
      const me = M + he + Z;
      return Wl.current = Date.now(), t(me), a(!1), Ve(me), requestAnimationFrame(() => {
        var Tt;
        (Tt = Jn.current) == null || Tt.setSelectionRange(
          b.start,
          b.start + he.length
        );
      }), me;
    },
    [e, Ve]
  ), tf = P(() => {
    $t(
      (p) => ke.current === "todo" ? ss(p, Rn()) : uo(p, Rn())
    ), ve();
  }, [$t, Rn, ve]), nf = P(
    (p) => {
      $t((m) => Gt(m, p)), ve();
    },
    [$t, ve]
  ), rf = P(() => {
    $t((p) => il(p, Rn())), ve();
  }, [$t, Rn, ve]), hi = P(
    (p, m) => [...m].sort((x, b) => b.from - x.from || b.to - x.to).reduce(
      (x, b) => x.slice(0, b.from) + b.insert + x.slice(b.to),
      p
    ),
    []
  ), of = P(() => {
    if (!K) {
      ve();
      return;
    }
    const p = K.anchor;
    typeof navigator < "u" && navigator.clipboard && typeof navigator.clipboard.writeText == "function" ? navigator.clipboard.writeText(p).then(
      () => L("success", "Copied to clipboard"),
      (m) => {
        const x = m instanceof Error ? m.message : String(m);
        L("error", `Copy failed: ${x}`);
      }
    ) : L("error", "Clipboard unavailable"), ve();
  }, [K, L, ve]), sf = P(() => {
    var m;
    const p = (m = st.current) == null ? void 0 : m.getView();
    if (p) {
      const x = p.state.doc.toString(), b = Jc(
        x,
        p.state.selection.ranges
      );
      b.length > 0 && p.dispatch({ changes: b });
    } else {
      const x = Jn.current;
      if (!x) return;
      const b = Jc(e, [
        { from: x.selectionStart, to: x.selectionEnd }
      ]), M = hi(e, b);
      t(M), Ve(M);
    }
    L("success", "Selected line(s) deleted"), ve();
  }, [e, Ve, L, ve, hi]), lf = P(() => {
    var m;
    const p = (m = st.current) == null ? void 0 : m.getView();
    if (p) {
      const x = p.state.doc.toString(), { changes: b, ranges: M } = rv(
        x,
        p.state.selection.ranges
      );
      b.length > 0 && p.dispatch({
        changes: b,
        selection: E.create(
          M.map((F) => E.range(F.from, F.to))
        )
      });
    } else {
      const x = Jn.current;
      if (!x) return;
      const b = $u(e, [
        { from: x.selectionStart, to: x.selectionEnd }
      ]), M = hi(e, b);
      t(M), Ve(M);
    }
    L("success", "Selected line(s) duplicated"), ve();
  }, [e, Ve, L, ve, hi]), af = P(async () => {
    if (ke.current !== "todo") {
      L("error", "Archive works from the todo tab — this line is already in done.txt"), ve();
      return;
    }
    const p = $t(
      (x) => ss(x, Rn())
    );
    if (!p) {
      ve();
      return;
    }
    ce.current && (clearTimeout(ce.current), ce.current = null);
    const m = await ft(p, "todo");
    if ((m == null ? void 0 : m.kind) !== "saved") {
      L("error", "Archive paused until todo.txt is safely saved"), ve();
      return;
    }
    try {
      const x = await fetch(`${ge}/archive`, { method: "POST" });
      x.ok ? (await cn(), L("success", "Line archived to done.txt")) : L("error", `Archive failed: HTTP ${x.status}`);
    } catch (x) {
      const b = x instanceof Error ? x.message : String(x);
      L("error", `Archive failed: ${b}`);
    }
    ve();
  }, [
    $t,
    Rn,
    ft,
    cn,
    L,
    ve
  ]), cf = P(
    (p) => {
      const m = Bi(p, /* @__PURE__ */ new Date());
      if (!m) {
        L("error", `Unknown date: "${p}"`);
        return;
      }
      const x = Ye(m);
      $t((b) => b.trim() ? /\bdue:\d{4}-\d{2}-\d{2}\b/.test(b) ? b.replace(/\bdue:\d{4}-\d{2}-\d{2}\b/, `due:${x}`) : `${b.trimEnd()} due:${x}` : b), L("success", `due:${x}`), ve();
    },
    [$t, L, ve]
  ), hf = P(
    (p) => {
      const m = K, x = Me.current, b = m && m.ranges.length > 1 ? m.ranges.map((M) => ({
        anchor: x.slice(M.from, M.to),
        ...Zn(x, M.from)
      })) : [
        {
          anchor: p.anchor,
          line: (m == null ? void 0 : m.line) ?? 1,
          column: (m == null ? void 0 : m.column) ?? 1
        }
      ];
      de((M) => [
        ...M,
        ...b.map((F, Z) => ({
          // crypto.randomUUID is unavailable on insecure origins in some
          // browsers; the counter suffix keeps ids unique either way.
          id: typeof crypto < "u" && "randomUUID" in crypto ? crypto.randomUUID() : `c-${Date.now()}-${M.length}-${Z}`,
          anchor: F.anchor,
          text: p.text,
          // Fall back to 1/1 rather than 0: the backend renders these into
          // the prompt as 1-based line references, and the anchor TEXT is
          // what actually resolves the target, so a missing snapshot
          // degrades the hint, never the edit.
          line: F.line,
          column: F.column
        }))
      ]);
    },
    [K, Zn]
  ), df = P(
    async (p) => {
      const m = p.anchor.trim(), x = p.text.trim(), b = [
        `I'm editing my ${ke.current === "done" ? "done" : "todo"}.txt file. Here's the selected task(s):`,
        "",
        "```",
        m,
        "```",
        "",
        `My request: ${x}`,
        "",
        "Please reply with just the rewritten task line(s). I will paste them back myself."
      ].join(`
`);
      ve();
      try {
        r({ message: b });
      } catch (M) {
        L(
          "error",
          `Could not open chat: ${M instanceof Error ? M.message : String(M)}`
        );
      }
    },
    [ve, r, L]
  ), uf = P((p) => {
    de((m) => m.filter((x) => x.id !== p));
  }, []), ff = P((p, m) => {
    const x = m.trim();
    x && de(
      (b) => b.map((M) => M.id === p ? { ...M, text: x } : M)
    );
  }, []), pf = e.length, Kl = e === "" ? 0 : e.split(`
`).length, mf = (() => {
    switch (n.kind) {
      case "idle":
        return g ? "Saved" : "Loading…";
      case "saving":
        return "Saving…";
      case "saved":
        return "Saved";
      case "error":
        return `Error: ${n.message}`;
    }
  })(), gf = (() => {
    switch (n.kind) {
      case "error":
        return "text-[var(--color-status-err)]";
      case "saving":
        return "text-[var(--color-status-warn)]";
      default:
        return "text-[var(--color-status-ok)]";
    }
  })();
  U(() => {
    const p = () => {
      document.fullscreenElement === On.current ? h(!0) : document.fullscreenElement === null && d.current && (d.current = !1, h(!1));
    };
    return document.addEventListener("fullscreenchange", p), () => document.removeEventListener("fullscreenchange", p);
  }, []);
  const di = P((p) => {
    var b, M;
    const m = p.target;
    if (!(m instanceof Node)) return !1;
    const x = (M = (b = st.current) == null ? void 0 : b.getView()) == null ? void 0 : M.dom;
    return x ? x.contains(m) : !1;
  }, []);
  return U(() => {
    if (!c || document.fullscreenElement) return;
    const p = (m) => {
      m.key === "Escape" && (Ie && An !== "NORMAL" && di(m) || (m.preventDefault(), m.stopPropagation(), h(!1)));
    };
    return window.addEventListener("keydown", p, { capture: !0 }), () => window.removeEventListener("keydown", p, {
      capture: !0
    });
  }, [di, c, Ie, An]), U(() => {
    if (It === null) return;
    const p = (m) => {
      m.key !== "Escape" || m.defaultPrevented || Ce || Oe || be || T || ne || D || Ie && di(m) || (ze(null), L("info", "filter: cleared."));
    };
    return window.addEventListener("keydown", p), () => window.removeEventListener("keydown", p);
  }, [
    ze,
    ne,
    di,
    It,
    Ce,
    L,
    D,
    Oe,
    T,
    be,
    Ie
  ]), U(() => {
    const p = zl.current, m = On.current;
    if (!p || !m) return;
    let x = null;
    const b = () => {
      x !== null && cancelAnimationFrame(x), x = requestAnimationFrame(() => {
        x = null, m.style.setProperty(
          "--todo-txt-rail-top",
          `${Math.ceil(p.getBoundingClientRect().bottom)}px`
        );
      });
    };
    b();
    const M = typeof ResizeObserver > "u" ? null : new ResizeObserver(b);
    return M == null || M.observe(p), window.addEventListener("resize", b, { passive: !0 }), () => {
      M == null || M.disconnect(), window.removeEventListener("resize", b), x !== null && cancelAnimationFrame(x);
    };
  }, [c]), /* @__PURE__ */ C(
    "div",
    {
      ref: On,
      className: c ? "fixed inset-0 z-[9000] flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)]" : "flex h-full flex-col bg-[var(--color-bg)] text-[var(--color-fg)]",
      style: { fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)" },
      "data-testid": "todo-txt-page",
      children: [
        /* @__PURE__ */ C(
          "header",
          {
            ref: zl,
            className: "flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[var(--color-border)] px-3 py-2 sm:px-4",
            "data-testid": "todo-txt-header",
            children: [
              /* @__PURE__ */ y(Hf, { className: "shrink-0", size: 16, "aria-hidden": "true" }),
              /* @__PURE__ */ y("h1", { className: "shrink-0 text-sm font-medium", children: "todo.txt" }),
              /* @__PURE__ */ C(
                "span",
                {
                  className: `text-xs ${gf}`,
                  "data-testid": "todo-txt-status",
                  "aria-live": "polite",
                  children: [
                    "● ",
                    mf
                  ]
                }
              ),
              /* @__PURE__ */ C("div", { className: "order-last flex w-full min-w-0 flex-wrap items-center justify-end gap-x-1.5 gap-y-1 text-xs text-[var(--color-muted-fg)] sm:order-none sm:ml-auto sm:w-auto sm:flex-1 md:gap-x-2", children: [
                Q.length > 0 && /* @__PURE__ */ C(
                  "button",
                  {
                    type: "button",
                    onClick: () => void jl(),
                    disabled: fe,
                    className: "inline-flex items-center gap-1 rounded bg-[var(--accent-subtle)] px-2 py-1 text-[var(--accent)] hover:bg-[var(--accent-glow)] disabled:opacity-50",
                    "data-testid": "todo-txt-submit-all",
                    "aria-label": `Submit ${Q.length} AI edit ${Q.length === 1 ? "comment" : "comments"}`,
                    children: [
                      /* @__PURE__ */ y(nl, { size: 14, "aria-hidden": "true" }),
                      /* @__PURE__ */ y("span", { className: "hidden lg:inline", children: fe ? "Submitting…" : `Submit All (${Q.length})` }),
                      /* @__PURE__ */ y("span", { className: "lg:hidden", "aria-hidden": "true", children: fe ? "…" : Q.length })
                    ]
                  }
                ),
                J !== null && Pt !== null && /* @__PURE__ */ C(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      ze(null), L("info", "filter: cleared.");
                    },
                    className: `inline-flex max-w-[16rem] items-center gap-1 rounded px-2 py-1 ${Pt.matched === 0 ? "bg-[var(--color-bg-hover)] text-[var(--color-warn-fg,#f59e0b)]" : "bg-[var(--accent-subtle)] text-[var(--accent)]"} hover:bg-[var(--accent-glow)]`,
                    "data-testid": "todo-txt-filter-chip",
                    title: "Clear filter (Esc)",
                    "aria-label": `Filter ${J.source} — ${Pt.matched} of ${Pt.total} lines match. Activate to clear.`,
                    children: [
                      /* @__PURE__ */ y(Bf, { size: 14, "aria-hidden": "true" }),
                      /* @__PURE__ */ C(
                        "span",
                        {
                          className: "truncate",
                          style: { fontFamily: "var(--font-mono)" },
                          "data-testid": "todo-txt-filter-chip-expr",
                          children: [
                            "filter: ",
                            J.source
                          ]
                        }
                      ),
                      /* @__PURE__ */ C("span", { "data-testid": "todo-txt-filter-chip-counts", children: [
                        "(",
                        Pt.matched,
                        "/",
                        Pt.total,
                        ")"
                      ] }),
                      /* @__PURE__ */ y(Oo, { size: 12, "aria-hidden": "true" })
                    ]
                  }
                ),
                Xt === "hide" && /* @__PURE__ */ C(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      Mo("show"), L("info", "threshold: showing all lines.");
                    },
                    className: "inline-flex items-center gap-1 rounded bg-[var(--accent-subtle)] px-2 py-1 text-[var(--accent)] hover:bg-[var(--accent-glow)]",
                    "data-testid": "todo-txt-threshold-chip",
                    title: "Show future t: tasks again",
                    "aria-label": `Threshold hiding is on — ${ii.hidden} of ${ii.total} lines have a future t: date. Activate to show them.`,
                    children: [
                      /* @__PURE__ */ y(Yl, { size: 14, "aria-hidden": "true" }),
                      /* @__PURE__ */ C(
                        "span",
                        {
                          style: { fontFamily: "var(--font-mono)" },
                          "data-testid": "todo-txt-threshold-chip-counts",
                          children: [
                            "t: ",
                            ii.hidden,
                            "/",
                            ii.total
                          ]
                        }
                      ),
                      /* @__PURE__ */ y(Oo, { size: 12, "aria-hidden": "true" })
                    ]
                  }
                ),
                Dn !== "show" && Tn.hidden > 0 && /* @__PURE__ */ C(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      Do("show"), L("info", "hidden: showing h:1 lines.");
                    },
                    className: "inline-flex items-center gap-1 rounded bg-[var(--accent-subtle)] px-2 py-1 text-[var(--accent)] hover:bg-[var(--accent-glow)]",
                    "data-testid": "todo-txt-hidden-chip",
                    title: "Show h:1 lines again",
                    "aria-label": `h:1 lines are ${Dn === "hide" ? "out of view" : "dimmed"} — ${Tn.hidden} of ${Tn.total} lines carry the tag. They are still in the file. Activate to show them.`,
                    children: [
                      /* @__PURE__ */ y(Yl, { size: 14, "aria-hidden": "true" }),
                      /* @__PURE__ */ C(
                        "span",
                        {
                          style: { fontFamily: "var(--font-mono)" },
                          "data-testid": "todo-txt-hidden-chip-counts",
                          children: [
                            "h:1 ",
                            Tn.hidden,
                            "/",
                            Tn.total
                          ]
                        }
                      ),
                      /* @__PURE__ */ y(Oo, { size: 12, "aria-hidden": "true" })
                    ]
                  }
                ),
                /* @__PURE__ */ C("span", { className: "hidden lg:inline", "data-testid": "todo-txt-counts", children: [
                  pf,
                  " chars · ",
                  Kl,
                  " ",
                  Kl === 1 ? "line" : "lines"
                ] }),
                /* @__PURE__ */ C(
                  "button",
                  {
                    type: "button",
                    onClick: () => f((p) => !p),
                    className: `inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)] ${u ? "text-[var(--accent)]" : "text-[var(--color-muted-fg)]"}`,
                    "data-testid": "todo-txt-help-toggle",
                    "aria-pressed": u,
                    "aria-controls": "todo-txt-rail-title",
                    "aria-label": u ? "Hide help panel" : "Show help panel",
                    title: "Help panel (Ctrl+/)",
                    children: [
                      /* @__PURE__ */ y(Ef, { size: 14, "aria-hidden": "true" }),
                      /* @__PURE__ */ y("span", { className: "hidden lg:inline", children: "?" })
                    ]
                  }
                ),
                /* @__PURE__ */ y(
                  Og,
                  {
                    activeFile: O,
                    onChange: (p) => {
                      xr(p);
                    }
                  }
                ),
                /* @__PURE__ */ C(
                  "button",
                  {
                    type: "button",
                    onClick: ti,
                    className: `inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)] ${At ? "text-[var(--accent)]" : "text-[var(--color-muted-fg)]"}`,
                    "data-testid": "todo-txt-syntax-toggle",
                    "aria-pressed": At,
                    "aria-label": At ? "Disable syntax highlighting" : "Enable syntax highlighting",
                    title: At ? "Syntax highlighting: ON" : "Syntax highlighting: OFF",
                    children: [
                      /* @__PURE__ */ y(Nf, { size: 14, "aria-hidden": "true" }),
                      /* @__PURE__ */ C("span", { className: "hidden lg:inline", children: [
                        "SH ",
                        At ? "on" : "off"
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ C(
                  "button",
                  {
                    type: "button",
                    onClick: dt,
                    className: `inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)] ${Be === "off" ? "text-[var(--color-muted-fg)]" : "text-[var(--accent)]"}`,
                    "data-testid": "todo-txt-selection-toolbar-mode",
                    "aria-label": `Selection actions: ${Be}`,
                    title: Be === "automatic" ? "Selection actions open automatically" : Be === "on-demand" ? "Selection actions open with Alt+Enter" : "Selection actions disabled",
                    children: [
                      /* @__PURE__ */ y(Ff, { size: 14, "aria-hidden": "true" }),
                      /* @__PURE__ */ C("span", { className: "hidden lg:inline", children: [
                        "Actions ",
                        Qw(Be)
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ C(
                  "button",
                  {
                    type: "button",
                    onClick: Hu,
                    className: `inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)] ${Ie ? "text-[var(--accent)]" : "text-[var(--color-muted-fg)]"}`,
                    "data-testid": "todo-txt-vim-toggle",
                    "aria-pressed": Ie,
                    "aria-label": Ie ? "Disable vim mode" : "Enable vim mode",
                    title: Ie ? "Vim mode: ON" : "Vim mode: OFF",
                    children: [
                      /* @__PURE__ */ y("span", { style: { fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: "bold" }, children: "VIM" }),
                      /* @__PURE__ */ y("span", { className: "hidden lg:inline", children: Ie ? "on" : "off" })
                    ]
                  }
                ),
                /* @__PURE__ */ C(
                  "button",
                  {
                    type: "button",
                    onClick: _u,
                    className: `inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)] ${Ln ? "text-[var(--accent)]" : "text-[var(--color-muted-fg)]"}`,
                    "data-testid": "todo-txt-amoled-toggle",
                    "aria-pressed": Ln,
                    "aria-label": Ln ? "Disable AMOLED black background" : "Enable AMOLED black background",
                    title: Ln ? "AMOLED black: ON (dark themes)" : "AMOLED black: OFF",
                    children: [
                      /* @__PURE__ */ y("span", { style: { fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: "bold" }, children: "AMOLED" }),
                      /* @__PURE__ */ y("span", { className: "hidden lg:inline", children: Ln ? "on" : "off" })
                    ]
                  }
                ),
                /* @__PURE__ */ C(
                  "button",
                  {
                    type: "button",
                    onClick: async () => {
                      const p = ke.current === "done" ? "done" : "todo";
                      le(p), S(!0), W(!0);
                      try {
                        const m = await fetch(
                          `${ge}/backups?file=${p}`
                        );
                        if (m.ok) {
                          const x = await m.json();
                          $(x.backups ?? []);
                        } else
                          L("error", `Backups fetch failed: HTTP ${m.status}`);
                      } catch (m) {
                        L(
                          "error",
                          `Backups fetch failed: ${m instanceof Error ? m.message : String(m)}`
                        );
                      } finally {
                        W(!1);
                      }
                    },
                    className: "inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)]",
                    "data-testid": "todo-txt-backups",
                    "aria-label": "Open backups",
                    title: "Browse and restore backups",
                    children: [
                      /* @__PURE__ */ y(Gl, { size: 14 }),
                      /* @__PURE__ */ y("span", { className: "hidden lg:inline", children: "Backups" })
                    ]
                  }
                ),
                /* @__PURE__ */ C(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      try {
                        const p = Me.current ?? "", m = new Blob([p], {
                          type: "text/plain;charset=utf-8"
                        }), x = URL.createObjectURL(m), b = document.createElement("a");
                        b.href = x, b.download = `${O}.txt`, document.body.appendChild(b), b.click(), document.body.removeChild(b), URL.revokeObjectURL(x);
                      } catch (p) {
                        const m = p instanceof Error ? p.message : String(p);
                        L("error", `Download failed: ${m}`);
                      }
                    },
                    className: "inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)]",
                    "data-testid": "todo-txt-download",
                    "aria-label": `Download ${O}.txt`,
                    title: `Download ${O}.txt`,
                    children: [
                      /* @__PURE__ */ y(Rf, { size: 14 }),
                      /* @__PURE__ */ y("span", { className: "hidden lg:inline", children: "Download" })
                    ]
                  }
                ),
                /* @__PURE__ */ C(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      var p;
                      if (document.fullscreenElement) {
                        document.exitFullscreen().catch(() => {
                        }), h(!1);
                        return;
                      }
                      if (c) {
                        h(!1);
                        return;
                      }
                      h(!0), document.fullscreenEnabled && ((p = On.current) != null && p.requestFullscreen) && (d.current = !0, On.current.requestFullscreen().catch(() => {
                        d.current = !1;
                      }));
                    },
                    className: "inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)]",
                    "data-testid": "todo-txt-fullscreen",
                    "aria-label": c ? "Exit fullscreen" : "Enter fullscreen",
                    children: [
                      c ? /* @__PURE__ */ y($f, { size: 14 }) : /* @__PURE__ */ y(If, { size: 14 }),
                      /* @__PURE__ */ y("span", { className: "hidden lg:inline", children: c ? "Exit" : "Fullscreen" })
                    ]
                  }
                )
              ] })
            ]
          }
        ),
        D && /* @__PURE__ */ C(
          "div",
          {
            className: "flex flex-wrap items-center gap-3 border-b border-[var(--accent)] bg-[var(--accent-subtle)] px-4 py-2 text-xs",
            "data-testid": "todo-txt-recovery-banner",
            role: "alert",
            children: [
              /* @__PURE__ */ C("span", { children: [
                "Unsaved ",
                D.file,
                ".txt draft from",
                " ",
                new Date(D.updatedAt).toLocaleString(),
                " (",
                D.content.length,
                " chars)."
              ] }),
              /* @__PURE__ */ y(
                "button",
                {
                  type: "button",
                  onClick: Ku,
                  className: "rounded border border-[var(--accent)] px-2 py-0.5 font-medium text-[var(--accent)]",
                  "data-testid": "todo-txt-recovery-restore",
                  children: "Restore draft"
                }
              ),
              /* @__PURE__ */ y(
                "button",
                {
                  type: "button",
                  onClick: Uu,
                  className: "rounded px-2 py-0.5 text-[var(--color-muted-fg)] hover:bg-[var(--color-bg-hover)]",
                  "data-testid": "todo-txt-recovery-discard",
                  children: "Discard"
                }
              )
            ]
          }
        ),
        l && /* @__PURE__ */ C(
          "div",
          {
            className: "flex items-center gap-3 border-b border-[var(--warn)] bg-[var(--warn-subtle)] px-4 py-2 text-xs",
            "data-testid": "todo-txt-reload-banner",
            role: "status",
            children: [
              /* @__PURE__ */ y("span", { children: "File changed on disk." }),
              /* @__PURE__ */ y(
                "button",
                {
                  type: "button",
                  onClick: () => void cn(),
                  className: "rounded px-2 py-0.5 underline hover:bg-[var(--warn-subtle)]",
                  "data-testid": "todo-txt-reload-button",
                  children: "Reload from disk"
                }
              ),
              Y && /* @__PURE__ */ y(
                "button",
                {
                  type: "button",
                  onClick: () => void qu(),
                  className: "rounded border border-[var(--warn)] px-2 py-0.5 font-medium",
                  "data-testid": "todo-txt-overwrite-disk",
                  children: "Overwrite disk with mine"
                }
              ),
              /* @__PURE__ */ y(
                "button",
                {
                  type: "button",
                  onClick: () => a(!1),
                  className: "ml-auto rounded px-2 py-0.5 text-[var(--color-muted-fg)] hover:bg-[var(--warn-subtle)]",
                  "data-testid": "todo-txt-reload-dismiss",
                  "aria-label": "Dismiss reload banner",
                  children: "✕"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ y(
          "div",
          {
            className: "flex flex-1 flex-col min-h-0",
            style: {
              paddingRight: u ? "clamp(240px, 18%, 360px)" : 0,
              transition: "padding-right 180ms ease"
            },
            "data-testid": "todo-txt-body-wrap",
            children: k && e === "" ? /* @__PURE__ */ C(
              "div",
              {
                className: "flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center",
                "data-testid": "todo-txt-load-error",
                role: "alert",
                children: [
                  /* @__PURE__ */ y(
                    _f,
                    {
                      size: 28,
                      "aria-hidden": "true",
                      style: { color: "var(--danger)" }
                    }
                  ),
                  /* @__PURE__ */ y(
                    "div",
                    {
                      className: "text-sm font-medium",
                      style: { color: "var(--color-fg)" },
                      children: "Couldn’t load todo.txt"
                    }
                  ),
                  /* @__PURE__ */ y(
                    "div",
                    {
                      className: "max-w-sm text-xs leading-5",
                      style: { color: "var(--color-muted-fg)" },
                      children: k
                    }
                  ),
                  /* @__PURE__ */ C(
                    "button",
                    {
                      type: "button",
                      onClick: () => void ju(),
                      "data-testid": "todo-txt-load-retry",
                      className: "mt-1 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium",
                      style: {
                        borderColor: "var(--border-strong)",
                        color: "var(--accent)",
                        background: "var(--accent-subtle)"
                      },
                      children: [
                        /* @__PURE__ */ y(zf, { size: 13, "aria-hidden": "true" }),
                        "Try again"
                      ]
                    }
                  )
                ]
              }
            ) : O === "report" ? (
              /* P6: the report tab renders the real chart when report.txt has
               * parseable snapshots. The chart receives the ALREADY-LOADED
               * content via `data` (parsed here) instead of using its internal
               * self-fetch — one source of truth, no second network request,
               * and a freshly captured snapshot re-renders the chart because
               * `content` is state. The placeholder remains the empty state. */
              (() => {
                const p = kh(e);
                return p.length > 0 ? /* @__PURE__ */ y(
                  "div",
                  {
                    className: "flex flex-1 flex-col overflow-auto px-4 py-4",
                    "data-testid": "todo-txt-report-body",
                    children: /* @__PURE__ */ y(Qm, { data: p })
                  }
                ) : /* @__PURE__ */ C(
                  "div",
                  {
                    className: "flex flex-1 flex-col items-center justify-center px-4 py-8 text-sm text-[var(--color-muted-fg)]",
                    "data-testid": "todo-txt-report-body",
                    children: [
                      /* @__PURE__ */ y("div", { className: "mb-2 font-mono text-xs uppercase tracking-wider", children: "report.txt" }),
                      /* @__PURE__ */ y("div", { className: "mb-4 text-center", children: "No snapshots yet — run `report` from the command palette (Ctrl+K) to capture one." })
                    ]
                  }
                );
              })()
            ) : /* @__PURE__ */ C(
              "div",
              {
                ref: Vl,
                className: "relative flex min-h-0 flex-1 flex-col",
                "data-testid": "todo-txt-editor-wrap",
                "data-todo-file": O,
                children: [
                  /* @__PURE__ */ y(
                    Iw,
                    {
                      ref: st,
                      value: e,
                      filter: J,
                      thresholdHidden: Xt === "hide",
                      hiddenMode: Dn,
                      onChange: (p, m) => {
                        var M, F;
                        const x = ((M = st.current) == null ? void 0 : M.getCaret()) ?? p.length;
                        Wl.current = Date.now(), a(!1);
                        const b = (m == null ? void 0 : m.typed) === !1 ? null : Fm(p, x);
                        if (b) {
                          Xn.current = {
                            beforeValue: p,
                            beforeCaret: x,
                            afterValue: b.value
                          }, (F = st.current) == null || F.applyEdit(b.value, b.caret), t(b.value), Ve(b.value);
                          return;
                        }
                        t(p), Ve(p);
                      },
                      onSelectionChange: (p, m, x) => To(x, !0),
                      onMouseUp: () => To(void 0, !0),
                      onViewportChange: () => {
                        Ct && To(void 0, !1);
                      },
                      onKeyDown: Yu,
                      vimMode: Ie,
                      syntaxHighlight: At,
                      placeholder: g ? "Start typing…" : "Loading…",
                      disabled: !g,
                      onVimModeChange: Ao
                    }
                  ),
                  g && O === "todo" && e.trim() === "" && /* @__PURE__ */ y(
                    "div",
                    {
                      className: "pointer-events-none absolute inset-0 flex items-center justify-center px-6",
                      "data-testid": "todo-txt-starter-example",
                      children: /* @__PURE__ */ C("div", { className: "pointer-events-auto max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated,var(--color-bg))] p-5 text-sm shadow-lg", children: [
                        /* @__PURE__ */ y("div", { className: "mb-2 font-medium text-[var(--color-fg)]", children: "Empty todo.txt" }),
                        /* @__PURE__ */ C("div", { className: "mb-3 text-xs text-[var(--color-muted-fg)]", children: [
                          "Try a starter example that shows priorities, projects, contexts, dates, recurring tasks, and the ",
                          /* @__PURE__ */ y("code", { children: "!!" }),
                          "inline shortcuts. You can wipe it anytime."
                        ] }),
                        /* @__PURE__ */ C("div", { className: "flex gap-2", children: [
                          /* @__PURE__ */ y(
                            "button",
                            {
                              type: "button",
                              onClick: () => {
                                const p = ch;
                                t(p), Me.current = p, Ve(p), L("success", "Starter example inserted.");
                              },
                              className: "inline-flex items-center gap-1 rounded bg-[var(--accent-subtle)] px-3 py-1.5 text-xs text-[var(--accent)] hover:bg-[var(--accent-glow)]",
                              "data-testid": "todo-txt-insert-starter",
                              children: /* @__PURE__ */ y("span", { children: "📋 Load example" })
                            }
                          ),
                          /* @__PURE__ */ y(
                            "button",
                            {
                              type: "button",
                              onClick: () => {
                                var p, m;
                                (p = Jn.current) == null || p.focus(), (m = st.current) == null || m.focus();
                              },
                              className: "rounded border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-muted-fg)] hover:bg-[var(--color-bg-hover)]",
                              children: "Start blank"
                            }
                          )
                        ] })
                      ] })
                    }
                  ),
                  Ie && /* @__PURE__ */ C(
                    "div",
                    {
                      className: "flex items-center gap-2 border-t border-[var(--color-border)] px-3 py-1 text-xs",
                      "data-testid": "todo-txt-vim-status",
                      style: { fontFamily: "var(--font-mono, monospace)" },
                      children: [
                        /* @__PURE__ */ C(
                          "span",
                          {
                            className: `rounded px-1.5 py-0.5 font-bold ${An === "INSERT" ? "bg-[var(--ok,#22c55e)] text-[#000]" : An === "VISUAL" ? "bg-[var(--warn,#f59e0b)] text-[#000]" : "bg-[var(--color-muted-fg,#71717a)] text-[#000]"}`,
                            children: [
                              "-- ",
                              An,
                              " --"
                            ]
                          }
                        ),
                        /* @__PURE__ */ y("span", { className: "text-[var(--color-muted-fg)]", children: "Leader: \\" }),
                        /* @__PURE__ */ C(
                          "span",
                          {
                            className: "text-[var(--color-muted-fg)]",
                            "data-testid": "todo-txt-vim-hints",
                            children: [
                              /* @__PURE__ */ y("span", { className: "font-bold", children: "\\x" }),
                              " done ·",
                              " ",
                              /* @__PURE__ */ y("span", { className: "font-bold", children: "^⇧D" }),
                              " done ·",
                              " ",
                              /* @__PURE__ */ y("span", { className: "font-bold", children: "\\d" }),
                              " due ·",
                              " ",
                              /* @__PURE__ */ y("span", { className: "font-bold", children: "\\a" }),
                              /* @__PURE__ */ y("span", { className: "font-bold", children: "\\b" }),
                              /* @__PURE__ */ y("span", { className: "font-bold", children: "\\c" }),
                              " priority"
                            ]
                          }
                        )
                      ]
                    }
                  ),
                  K && Ct && /* @__PURE__ */ C("div", { "data-testid": "todo-txt-selection-popover-portal", children: [
                    /* @__PURE__ */ y(
                      "span",
                      {
                        "data-testid": "todo-txt-selection-ready",
                        "aria-hidden": "true",
                        style: { display: "none" }
                      }
                    ),
                    /* @__PURE__ */ y(
                      Om,
                      {
                        selection: K.anchor,
                        anchorRect: K.rect,
                        rangeCount: K.affectedLines,
                        vimMode: Ie,
                        file: O === "done" ? "done" : "todo",
                        containerRef: Vl,
                        scrollElement: (Ul = st.current) == null ? void 0 : Ul.getScrollElement(),
                        onClose: ve,
                        onMarkDone: tf,
                        onSetPriority: nf,
                        onAddCreationDate: rf,
                        onCopy: of,
                        onAddComment: hf,
                        onAskInChat: (p) => void df(p),
                        onDeleteLine: sf,
                        onDuplicateLine: lf,
                        onArchiveSelection: () => void af(),
                        onSetDueDate: cf
                      }
                    )
                  ] })
                ]
              }
            )
          }
        ),
        /* @__PURE__ */ y(
          mv,
          {
            comments: Q,
            content: e,
            submitting: fe,
            onEdit: ff,
            onRemove: uf,
            onSubmitAll: () => void jl()
          }
        ),
        be && /* @__PURE__ */ y(
          pv,
          {
            staged: be,
            submitting: fe,
            onApply: () => void Qu(),
            onReject: () => void ef()
          }
        ),
        Pe.length > 0 && /* @__PURE__ */ y(
          "div",
          {
            className: "pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 z-[9500] flex flex-col gap-2",
            "data-testid": "todo-txt-toasts",
            "aria-live": "polite",
            children: Pe.map((p) => /* @__PURE__ */ C(
              "div",
              {
                className: "pointer-events-auto flex items-center gap-2 rounded-md border px-3 py-2 text-xs shadow-lg",
                style: {
                  // Opaque elevated surface (no /10 bleed) with the tone
                  // carried by border + text via canonical status tokens,
                  // so the toast reads correctly and clears AA under
                  // light/dark and the 6 CRT themes instead of the old
                  // fixed dark-red / dark-green / dark-navy hexes.
                  background: "var(--color-bg-elevated, #1a1d25)",
                  borderColor: p.tone === "error" ? "var(--danger, #ef4444)" : p.tone === "success" ? "var(--ok, #22c55e)" : "var(--color-border, #27272a)",
                  color: p.tone === "error" ? "var(--danger, #ef4444)" : p.tone === "success" ? "var(--ok, #22c55e)" : "var(--color-fg, #e4e4e7)"
                },
                "data-testid": `todo-txt-toast-${p.tone}`,
                role: "status",
                children: [
                  /* @__PURE__ */ y(
                    "span",
                    {
                      "aria-hidden": "true",
                      style: {
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "currentColor",
                        flexShrink: 0
                      }
                    }
                  ),
                  /* @__PURE__ */ y("span", { children: p.message })
                ]
              },
              p.id
            ))
          }
        ),
        /* @__PURE__ */ y(
          Dg,
          {
            open: Oe !== null,
            result: Oe,
            onClose: () => it(null),
            onJumpToLine: Xu,
            onDrillIn: Zu
          }
        ),
        /* @__PURE__ */ y(
          yg,
          {
            open: Ce,
            onClose: () => Ue(!1),
            onExecute: Ju,
            commands: Lo
          }
        ),
        /* @__PURE__ */ y(
          f0,
          {
            open: u,
            onClose: () => f(!1),
            activeFile: O,
            commands: Lo
          }
        ),
        T && /* @__PURE__ */ y(
          "div",
          {
            className: "fixed inset-0 z-[1000] flex items-center justify-center",
            style: {
              background: "rgba(0, 0, 0, 0.72)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)"
            },
            onClick: () => {
              S(!1), ae(null);
            },
            "data-testid": "todo-txt-backups-modal",
            children: /* @__PURE__ */ C(
              "div",
              {
                className: "flex max-h-[80vh] w-[min(720px,92vw)] flex-col gap-3 rounded-lg border border-[var(--color-border,#334155)] p-4 shadow-xl",
                style: {
                  // Opaque themed surface (host --bg is always opaque) so the
                  // seeded todo content never shows through the modal.
                  background: "var(--bg, #12141a)",
                  color: "var(--color-fg, #e2e8f0)",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)"
                },
                onClick: (p) => p.stopPropagation(),
                children: [
                  /* @__PURE__ */ C("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ C("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ y(Gl, { size: 16 }),
                      /* @__PURE__ */ C("span", { className: "font-medium", children: [
                        "Backups — ",
                        _,
                        ".txt"
                      ] }),
                      /* @__PURE__ */ y("span", { className: "text-xs text-[var(--color-muted-fg)]", children: B.length ? `${B.length} entries (newest first, max 20)` : "no backups yet" })
                    ] }),
                    /* @__PURE__ */ y(
                      "button",
                      {
                        type: "button",
                        onClick: () => {
                          S(!1), ae(null);
                        },
                        className: "rounded px-2 py-1 text-sm hover:bg-[var(--color-bg-hover)]",
                        children: "Close"
                      }
                    )
                  ] }),
                  G ? /* @__PURE__ */ y("div", { className: "flex flex-1 items-center justify-center py-12 text-sm text-[var(--color-muted-fg)]", children: "Loading…" }) : B.length === 0 ? /* @__PURE__ */ y("div", { className: "flex flex-1 items-center justify-center py-12 text-sm text-[var(--color-muted-fg)]", children: "Backups are created automatically every 5 min while you edit. Come back here once you've made some changes." }) : ne ? /* @__PURE__ */ C("div", { className: "flex flex-1 flex-col gap-2 overflow-hidden", children: [
                    /* @__PURE__ */ C("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ y("span", { className: "font-mono text-xs text-[var(--color-muted-fg)]", children: ne.name }),
                      /* @__PURE__ */ C("div", { className: "flex gap-2", children: [
                        /* @__PURE__ */ y(
                          "button",
                          {
                            type: "button",
                            onClick: () => ae(null),
                            className: "rounded border border-[var(--color-border)] px-3 py-1 text-xs hover:bg-[var(--color-bg-hover)]",
                            children: "← Back to list"
                          }
                        ),
                        /* @__PURE__ */ C(
                          "button",
                          {
                            type: "button",
                            onClick: async () => {
                              const p = ne.name;
                              ae(null), S(!1);
                              try {
                                const m = await fetch(
                                  `${ge}/backups/${encodeURIComponent(p)}/restore`,
                                  { method: "POST" }
                                );
                                if (!m.ok) {
                                  L(
                                    "error",
                                    `Restore failed: HTTP ${m.status}`
                                  );
                                  return;
                                }
                                await cn(), L("success", `Restored ${_}.txt from ${p}. A safety backup was created first — you can undo via Backups.`);
                              } catch (m) {
                                L(
                                  "error",
                                  `Restore failed: ${m instanceof Error ? m.message : String(m)}`
                                );
                              }
                            },
                            className: "rounded bg-[var(--accent-subtle)] px-3 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent-glow)]",
                            children: [
                              /* @__PURE__ */ y(Vf, { size: 12, className: "inline mr-1" }),
                              "Restore this backup"
                            ]
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ y("pre", { className: "flex-1 overflow-auto whitespace-pre-wrap rounded border border-[var(--color-border)] bg-[var(--color-bg-subtle,rgba(0,0,0,0.15))] p-3 text-xs font-mono text-[var(--color-fg)]", children: ne.content })
                  ] }) : /* @__PURE__ */ y("ul", { className: "flex-1 overflow-auto divide-y divide-[var(--color-border)]", children: B.map((p) => {
                    const m = new Date(p.mtime * 1e3), x = m.toLocaleDateString() + " " + m.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    });
                    return /* @__PURE__ */ C(
                      "li",
                      {
                        className: "flex items-center justify-between gap-3 py-2",
                        children: [
                          /* @__PURE__ */ C("div", { className: "flex-1 overflow-hidden", children: [
                            /* @__PURE__ */ y("div", { className: "font-mono text-xs text-[var(--color-fg)] truncate", children: p.name }),
                            /* @__PURE__ */ C("div", { className: "text-[11px] text-[var(--color-muted-fg)]", children: [
                              x,
                              " · ",
                              p.bytes,
                              " bytes"
                            ] })
                          ] }),
                          /* @__PURE__ */ C("div", { className: "flex gap-2 shrink-0", children: [
                            /* @__PURE__ */ y(
                              "button",
                              {
                                type: "button",
                                onClick: async () => {
                                  try {
                                    const b = await fetch(
                                      `${ge}/backups/${encodeURIComponent(p.name)}`
                                    );
                                    if (!b.ok) {
                                      L(
                                        "error",
                                        `Preview failed: HTTP ${b.status}`
                                      );
                                      return;
                                    }
                                    const M = await b.json();
                                    ae({
                                      name: M.name,
                                      content: M.content
                                    });
                                  } catch (b) {
                                    L(
                                      "error",
                                      `Preview failed: ${b instanceof Error ? b.message : String(b)}`
                                    );
                                  }
                                },
                                className: "rounded border border-[var(--color-border)] px-2 py-1 text-xs hover:bg-[var(--color-bg-hover)]",
                                children: "Preview"
                              }
                            ),
                            /* @__PURE__ */ y(
                              "button",
                              {
                                type: "button",
                                onClick: async () => {
                                  if (window.confirm(
                                    `Restore ${p.name}? Your current todo.txt will be backed up first.`
                                  )) {
                                    S(!1);
                                    try {
                                      const b = await fetch(
                                        `${ge}/backups/${encodeURIComponent(p.name)}/restore`,
                                        { method: "POST" }
                                      );
                                      if (!b.ok) {
                                        L(
                                          "error",
                                          `Restore failed: HTTP ${b.status}`
                                        );
                                        return;
                                      }
                                      await cn(), L(
                                        "success",
                                        `Restored from ${p.name}.`
                                      );
                                    } catch (b) {
                                      L(
                                        "error",
                                        `Restore failed: ${b instanceof Error ? b.message : String(b)}`
                                      );
                                    }
                                  }
                                },
                                className: "rounded bg-[var(--accent-subtle)] px-2 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent-glow)]",
                                children: "Restore"
                              }
                            )
                          ] })
                        ]
                      },
                      p.name
                    );
                  }) })
                ]
              }
            )
          }
        )
      ]
    }
  );
}
function pv({
  staged: r,
  submitting: e,
  onApply: t,
  onReject: n
}) {
  return /* @__PURE__ */ y(
    "div",
    {
      className: "fixed inset-0 z-[1050] flex items-center justify-center bg-black/50",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "todo-txt-staged-title",
      "data-testid": "todo-txt-staged-modal",
      children: /* @__PURE__ */ C("div", { className: "flex max-h-[80vh] w-[min(800px,92vw)] flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-xl", children: [
        /* @__PURE__ */ C("header", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ y(nl, { size: 16, className: "text-[var(--accent)]", "aria-hidden": "true" }),
          /* @__PURE__ */ y("h2", { id: "todo-txt-staged-title", className: "text-sm font-medium", children: "Review AI edit" }),
          /* @__PURE__ */ C("span", { className: "ml-auto text-xs text-[var(--color-muted-fg)]", children: [
            "Δ ",
            r.lineDelta >= 0 ? "+" : "",
            r.lineDelta,
            " lines · ",
            r.charDelta >= 0 ? "+" : "",
            r.charDelta,
            " chars"
          ] })
        ] }),
        /* @__PURE__ */ y("p", { className: "text-xs text-[var(--color-muted-fg)]", children: r.reason || "This edit removes lines. Review before applying." }),
        /* @__PURE__ */ y(
          "pre",
          {
            className: "flex-1 overflow-auto rounded border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-2 text-xs leading-5",
            "data-testid": "todo-txt-staged-diff",
            children: r.diff
          }
        ),
        /* @__PURE__ */ C("footer", { className: "flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ y(
            "button",
            {
              type: "button",
              onClick: n,
              disabled: e,
              className: "rounded border border-[var(--color-border)] px-3 py-1 text-sm hover:bg-[var(--color-bg-hover)] disabled:opacity-50",
              "data-testid": "todo-txt-staged-reject",
              children: "Reject"
            }
          ),
          /* @__PURE__ */ y(
            "button",
            {
              type: "button",
              onClick: t,
              disabled: e,
              className: "rounded bg-[var(--accent)] px-3 py-1 text-sm text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] disabled:opacity-50",
              "data-testid": "todo-txt-staged-apply",
              children: e ? "Applying…" : "Apply"
            }
          )
        ] })
      ] })
    }
  );
}
function mv({
  comments: r,
  content: e,
  submitting: t,
  onEdit: n,
  onRemove: i,
  onSubmitAll: o
}) {
  return r.length === 0 ? null : /* @__PURE__ */ C(
    "div",
    {
      className: "border-t border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2",
      "data-testid": "todo-txt-pending-comments",
      children: [
        /* @__PURE__ */ C("div", { className: "mb-2 flex items-center justify-between", children: [
          /* @__PURE__ */ C(
            "span",
            {
              className: "text-[13px] font-semibold",
              "data-testid": "todo-txt-pending-count",
              children: [
                r.length,
                " comment",
                r.length > 1 ? "s" : "",
                " pending"
              ]
            }
          ),
          /* @__PURE__ */ C(
            "button",
            {
              type: "button",
              onClick: o,
              disabled: t,
              className: "inline-flex items-center gap-1 rounded bg-[var(--accent-subtle)] px-2 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent-glow)] disabled:opacity-50",
              "data-testid": "todo-txt-pending-submit-all",
              "aria-label": `Submit ${r.length} AI edit ${r.length === 1 ? "comment" : "comments"}`,
              children: [
                /* @__PURE__ */ y(nl, { size: 14, "aria-hidden": "true" }),
                /* @__PURE__ */ y("span", { children: t ? "Submitting…" : "Submit All ▶" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ y("div", { className: "max-h-[200px] space-y-1.5 overflow-y-auto", children: r.map((s) => /* @__PURE__ */ y(
          gv,
          {
            comment: s,
            content: e,
            onEdit: n,
            onRemove: i
          },
          s.id
        )) })
      ]
    }
  );
}
function gv({
  comment: r,
  content: e,
  onEdit: t,
  onRemove: n
}) {
  const [i, o] = q(!1), [s, l] = q(r.text), a = z(null), c = z(!1);
  U(() => {
    var u, f;
    i && ((u = a.current) == null || u.focus(), (f = a.current) == null || f.select());
  }, [i]);
  const h = P(() => {
    if (c.current) {
      c.current = !1, l(r.text), o(!1);
      return;
    }
    const u = s.trim();
    u && u !== r.text && t(r.id, u), o(!1);
  }, [s, r.id, r.text, t]), d = P(
    (u) => u.preventDefault(),
    []
  );
  return /* @__PURE__ */ C(
    "div",
    {
      className: "flex items-start gap-2 rounded-md bg-[var(--color-bg-elevated,rgba(255,255,255,0.03))] px-2.5 py-1.5 text-[13px]",
      "data-testid": "todo-txt-pending-comment",
      children: [
        /* @__PURE__ */ y(
          Pf,
          {
            size: 14,
            className: "mt-0.5 shrink-0 text-[var(--color-muted-fg)]",
            "aria-hidden": "true"
          }
        ),
        /* @__PURE__ */ C("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ C(
            "div",
            {
              className: "truncate font-mono text-[11px] text-[var(--color-muted-fg)]",
              title: r.anchor,
              "data-testid": "todo-txt-pending-comment-anchor",
              children: [
                '"',
                r.anchor.slice(0, 60),
                r.anchor.length > 60 ? "…" : "",
                '"',
                !e.includes(r.anchor) && /* @__PURE__ */ y(
                  "span",
                  {
                    className: "ml-2 text-[10px] text-[var(--color-danger)]",
                    "data-testid": "todo-txt-pending-comment-stale",
                    title: "This line changed or was deleted after the comment was staged",
                    children: "anchor no longer in file"
                  }
                ),
                r.line != null && r.column != null && /* @__PURE__ */ C("span", { className: "ml-2 text-[10px] opacity-70", children: [
                  "line ",
                  r.line,
                  ":",
                  r.column
                ] })
              ]
            }
          ),
          i ? /* @__PURE__ */ y(
            "input",
            {
              ref: a,
              value: s,
              onChange: (u) => l(u.target.value),
              onKeyDown: (u) => {
                u.key === "Enter" && s.trim() ? (u.preventDefault(), h()) : u.key === "Escape" && (u.preventDefault(), c.current = !0, l(r.text), o(!1));
              },
              onBlur: h,
              className: "w-full rounded border border-[var(--color-border)] bg-transparent px-1.5 py-0.5 text-[13px] outline-none focus-ring",
              "data-testid": "todo-txt-pending-comment-edit-input"
            }
          ) : /* @__PURE__ */ y(
            "div",
            {
              className: "cursor-pointer text-[var(--color-fg)]",
              onClick: () => {
                l(r.text), o(!0);
              },
              "data-testid": "todo-txt-pending-comment-text",
              children: r.text
            }
          )
        ] }),
        i ? /* @__PURE__ */ y(
          "button",
          {
            type: "button",
            "aria-label": "Save",
            onMouseDown: d,
            onClick: h,
            className: "shrink-0 cursor-pointer border-none bg-transparent text-[var(--ok)] hover:opacity-80",
            "data-testid": "todo-txt-pending-comment-save",
            children: /* @__PURE__ */ y(Zc, { size: 14 })
          }
        ) : /* @__PURE__ */ y(
          "button",
          {
            type: "button",
            "aria-label": "Edit",
            onClick: () => {
              l(r.text), o(!0);
            },
            className: "shrink-0 cursor-pointer border-none bg-transparent text-[var(--color-muted-fg)] hover:text-[var(--accent)]",
            "data-testid": "todo-txt-pending-comment-edit",
            children: /* @__PURE__ */ y(Wf, { size: 14 })
          }
        ),
        /* @__PURE__ */ y(
          "button",
          {
            type: "button",
            "aria-label": "Remove",
            onMouseDown: d,
            onClick: () => n(r.id),
            className: "shrink-0 cursor-pointer border-none bg-transparent text-[var(--color-muted-fg)] hover:text-[var(--danger)]",
            "data-testid": "todo-txt-pending-comment-remove",
            children: /* @__PURE__ */ y(Qc, { size: 14 })
          }
        )
      ]
    }
  );
}
function Lv() {
  return /* @__PURE__ */ y(fv, {});
}
export {
  nn as C,
  te as D,
  ie as E,
  ct as M,
  hl as P,
  cr as R,
  xe as S,
  Lv as T,
  bt as V,
  k0 as a,
  kv as b,
  v0 as c,
  E as d,
  Tv as e,
  je as f,
  Xb as g,
  fb as h,
  Jb as i,
  ub as j,
  Ov as k,
  V as l,
  rr as m,
  Ml as n,
  Mv as o,
  an as p,
  Av as q,
  Ee as r,
  uc as s,
  Ev as t,
  Gb as u,
  $c as v,
  au as w,
  ou as x,
  Zs as y,
  Cv as z
};
//# sourceMappingURL=index-BBeAVVhG.js.map
