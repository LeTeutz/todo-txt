import { E as Tn, S as dr, C as Ee, c as En, a as On, f as pr, b as Rn, d as Ce, e as In, M as vr, m as sr, i as Bn, g as Nn, h as Pn, j as Kn, k as Dn, l as at, n as lr, o as gr, s as yr, V as _n, D as kt, R as Fn, P as Hn, p as Vn, q as Wn, r as $n, t as jn, u as Un, v as Qn, w as qn, x as zn, y as Jn, z as Ve } from "./index-BBeAVVhG.js";
const ur = typeof String.prototype.normalize == "function" ? (f) => f.normalize("NFKD") : (f) => f;
class mr {
  /**
  Create a text cursor. The query is the search string, `from` to
  `to` provides the region to search.
  
  When `normalize` is given, it will be called, on both the query
  string and the content it is matched against, before comparing.
  You can, for example, create a case-insensitive search by
  passing `s => s.toLowerCase()`.
  
  Text is always normalized with
  [`.normalize("NFKD")`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize)
  (when supported).
  */
  constructor(i, l, u = 0, d = i.length, g, w) {
    this.test = w, this.value = { from: 0, to: 0, precise: !1 }, this.done = !1, this.matches = [], this.buffer = "", this.bufferPos = 0, this.iter = i.iterRange(u, d), this.bufferStart = u, this.normalize = g ? (S) => g(ur(S)) : ur, this.query = this.normalize(l);
  }
  peek() {
    if (this.bufferPos == this.buffer.length) {
      if (this.bufferStart += this.buffer.length, this.iter.next(), this.iter.done)
        return -1;
      this.bufferPos = 0, this.buffer = this.iter.value;
    }
    return En(this.buffer, this.bufferPos);
  }
  /**
  Look for the next match. Updates the iterator's
  [`value`](https://codemirror.net/6/docs/ref/#search.SearchCursor.value) and
  [`done`](https://codemirror.net/6/docs/ref/#search.SearchCursor.done) properties. Should be called
  at least once before using the cursor.
  */
  next() {
    for (; this.matches.length; )
      this.matches.pop();
    return this.nextOverlapping();
  }
  /**
  The `next` method will ignore matches that partially overlap a
  previous match. This method behaves like `next`, but includes
  such matches.
  */
  nextOverlapping() {
    for (; ; ) {
      let i = this.peek();
      if (i < 0)
        return this.done = !0, this;
      let l = Rn(i), u = this.bufferStart + this.bufferPos;
      this.bufferPos += On(i);
      let d = this.normalize(l);
      if (d.length)
        for (let g = 0, w = u, S = !0; ; g++) {
          let L = d.charCodeAt(g), P = this.match(L, w, S, this.bufferPos + this.bufferStart, g == d.length - 1);
          if (P)
            return this.value = P, this;
          if (g == d.length - 1)
            break;
          S && g < l.length && l.charCodeAt(g) == L ? w++ : S = !1;
        }
    }
  }
  match(i, l, u, d, g) {
    let w = null;
    for (let S = 0; S < this.matches.length; ) {
      let L = this.matches[S], P = !1;
      this.query.charCodeAt(L.index) == i && (L.index == this.query.length - 1 ? w = { from: L.from, to: d, precise: g && L.precise } : (L.index++, P = !0)), P ? S++ : this.matches.splice(S, 1);
    }
    return this.query.charCodeAt(0) == i && (this.query.length == 1 ? w = { from: l, to: d, precise: u && g } : this.matches.push({ from: l, index: 1, precise: u })), w && this.test && !this.test(w.from, w.to, this.buffer, this.bufferStart) && (w = null), w;
  }
}
typeof Symbol < "u" && (mr.prototype[Symbol.iterator] = function() {
  return this;
});
const Cr = { from: -1, to: -1, match: /* @__PURE__ */ /.*/.exec(""), precise: !0 }, Mt = "gm" + (/x/.unicode == null ? "" : "u");
class Lt {
  /**
  Create a cursor that will search the given range in the given
  document. `query` should be the raw pattern (as you'd pass it to
  `new RegExp`).
  */
  constructor(i, l, u, d = 0, g = i.length) {
    if (this.text = i, this.to = g, this.curLine = "", this.done = !1, this.value = Cr, /\\[sWDnr]|\n|\r|\[\^/.test(l))
      return new kr(i, l, u, d, g);
    this.re = new RegExp(l, Mt + (u != null && u.ignoreCase ? "i" : "")), this.test = u == null ? void 0 : u.test, this.iter = i.iter();
    let w = i.lineAt(d);
    this.curLineStart = w.from, this.matchPos = rt(i, d), this.getLine(this.curLineStart);
  }
  getLine(i) {
    this.iter.next(i), this.iter.lineBreak ? this.curLine = "" : (this.curLine = this.iter.value, this.curLineStart + this.curLine.length > this.to && (this.curLine = this.curLine.slice(0, this.to - this.curLineStart)), this.iter.next());
  }
  nextLine() {
    this.curLineStart = this.curLineStart + this.curLine.length + 1, this.curLineStart > this.to ? this.curLine = "" : this.getLine(0);
  }
  /**
  Move to the next match, if there is one.
  */
  next() {
    for (let i = this.matchPos - this.curLineStart; ; ) {
      this.re.lastIndex = i;
      let l = this.matchPos <= this.to && this.re.exec(this.curLine);
      if (l) {
        let u = this.curLineStart + l.index, d = u + l[0].length;
        if (this.matchPos = rt(this.text, d + (u == d ? 1 : 0)), u == this.curLineStart + this.curLine.length && this.nextLine(), (u < d || u > this.value.to) && (!this.test || this.test(u, d, l)))
          return this.value = { from: u, to: d, precise: !0, match: l }, this;
        i = this.matchPos - this.curLineStart;
      } else if (this.curLineStart + this.curLine.length < this.to)
        this.nextLine(), i = 0;
      else
        return this.done = !0, this;
    }
  }
}
const Ct = /* @__PURE__ */ new WeakMap();
class je {
  constructor(i, l) {
    this.from = i, this.text = l;
  }
  get to() {
    return this.from + this.text.length;
  }
  static get(i, l, u) {
    let d = Ct.get(i);
    if (!d || d.from >= u || d.to <= l) {
      let S = new je(l, i.sliceString(l, u));
      return Ct.set(i, S), S;
    }
    if (d.from == l && d.to == u)
      return d;
    let { text: g, from: w } = d;
    return w > l && (g = i.sliceString(l, w) + g, w = l), d.to < u && (g += i.sliceString(d.to, u)), Ct.set(i, new je(w, g)), new je(l, g.slice(l - w, u - w));
  }
}
class kr {
  constructor(i, l, u, d, g) {
    this.text = i, this.to = g, this.done = !1, this.value = Cr, this.matchPos = rt(i, d), this.re = new RegExp(l, Mt + (u != null && u.ignoreCase ? "i" : "")), this.test = u == null ? void 0 : u.test, this.flat = je.get(i, d, this.chunkEnd(
      d + 5e3
      /* Chunk.Base */
    ));
  }
  chunkEnd(i) {
    return i >= this.to ? this.to : this.text.lineAt(i).to;
  }
  next() {
    for (; ; ) {
      let i = this.re.lastIndex = this.matchPos - this.flat.from, l = this.re.exec(this.flat.text);
      if (l && !l[0] && l.index == i && (this.re.lastIndex = i + 1, l = this.re.exec(this.flat.text)), l) {
        let u = this.flat.from + l.index, d = u + l[0].length;
        if ((this.flat.to >= this.to || l.index + l[0].length <= this.flat.text.length - 10) && (!this.test || this.test(u, d, l)))
          return this.value = { from: u, to: d, precise: !0, match: l }, this.matchPos = rt(this.text, d + (u == d ? 1 : 0)), this;
      }
      if (this.flat.to == this.to)
        return this.done = !0, this;
      this.flat = je.get(this.text, this.flat.from, this.chunkEnd(this.flat.from + this.flat.text.length * 2));
    }
  }
}
typeof Symbol < "u" && (Lt.prototype[Symbol.iterator] = kr.prototype[Symbol.iterator] = function() {
  return this;
});
function Xn(f) {
  try {
    return new RegExp(f, Mt), !0;
  } catch {
    return !1;
  }
}
function rt(f, i) {
  if (i >= f.length)
    return i;
  let l = f.lineAt(i), u;
  for (; i < l.to && (u = l.text.charCodeAt(i - l.from)) >= 56320 && u < 57344; )
    i++;
  return i;
}
class Gn {
  /**
  Create a query object.
  */
  constructor(i) {
    this.search = i.search, this.caseSensitive = !!i.caseSensitive, this.literal = !!i.literal, this.regexp = !!i.regexp, this.replace = i.replace || "", this.valid = !!this.search && (!this.regexp || Xn(this.search)), this.unquoted = this.unquote(this.search), this.wholeWord = !!i.wholeWord, this.test = i.test;
  }
  /**
  @internal
  */
  unquote(i) {
    return this.literal ? i : i.replace(/\\([nrt\\])/g, (l, u) => u == "n" ? `
` : u == "r" ? "\r" : u == "t" ? "	" : "\\");
  }
  /**
  Compare this query to another query.
  */
  eq(i) {
    return this.search == i.search && this.replace == i.replace && this.caseSensitive == i.caseSensitive && this.regexp == i.regexp && this.wholeWord == i.wholeWord && this.test == i.test;
  }
  /**
  @internal
  */
  create() {
    return this.regexp ? new ni(this) : new ei(this);
  }
  /**
  Get a search cursor for this query, searching through the given
  range in the given state.
  */
  getCursor(i, l = 0, u) {
    let d = i.doc ? i : Tn.create({ doc: i });
    return u == null && (u = d.doc.length), this.regexp ? $e(this, d, l, u) : We(this, d, l, u);
  }
}
class wr {
  constructor(i) {
    this.spec = i;
  }
}
function Yn(f, i, l) {
  return (u, d, g, w) => {
    if (l && !l(u, d, g, w))
      return !1;
    let S = u >= w && d <= w + g.length ? g.slice(u - w, d - w) : i.doc.sliceString(u, d);
    return f(S, i, u, d);
  };
}
function We(f, i, l, u) {
  let d;
  return f.wholeWord && (d = Zn(i.doc, i.charCategorizer(i.selection.main.head))), f.test && (d = Yn(f.test, i, d)), new mr(i.doc, f.unquoted, l, u, f.caseSensitive ? void 0 : (g) => g.toLowerCase(), d);
}
function Zn(f, i) {
  return (l, u, d, g) => ((g > l || g + d.length < u) && (g = Math.max(0, l - 2), d = f.sliceString(g, Math.min(f.length, u + 2))), (i(nt(d, l - g)) != Ee.Word || i(it(d, l - g)) != Ee.Word) && (i(it(d, u - g)) != Ee.Word || i(nt(d, u - g)) != Ee.Word));
}
class ei extends wr {
  constructor(i) {
    super(i);
  }
  nextMatch(i, l, u) {
    let d = We(this.spec, i, u, i.doc.length).nextOverlapping();
    if (d.done) {
      let g = Math.min(i.doc.length, l + this.spec.unquoted.length);
      d = We(this.spec, i, 0, g).nextOverlapping();
    }
    return d.done || d.value.from == l && d.value.to == u ? null : d.value;
  }
  // Searching in reverse is, rather than implementing an inverted search
  // cursor, done by scanning chunk after chunk forward.
  prevMatchInRange(i, l, u) {
    for (let d = u; ; ) {
      let g = Math.max(l, d - 1e4 - this.spec.unquoted.length), w = We(this.spec, i, g, d), S = null;
      for (; !w.nextOverlapping().done; )
        S = w.value;
      if (S)
        return S;
      if (g == l)
        return null;
      d -= 1e4;
    }
  }
  prevMatch(i, l, u) {
    let d = this.prevMatchInRange(i, 0, l);
    return d || (d = this.prevMatchInRange(i, Math.max(0, u - this.spec.unquoted.length), i.doc.length)), d && (d.from != l || d.to != u) ? d : null;
  }
  getReplacement(i) {
    return this.spec.unquote(this.spec.replace);
  }
  matchAll(i, l) {
    let u = We(this.spec, i, 0, i.doc.length), d = [];
    for (; !u.next().done; ) {
      if (d.length >= l)
        return null;
      d.push(u.value);
    }
    return d;
  }
  highlight(i, l, u, d) {
    let g = We(this.spec, i, Math.max(0, l - this.spec.unquoted.length), Math.min(u + this.spec.unquoted.length, i.doc.length));
    for (; !g.next().done; )
      d(g.value.from, g.value.to);
  }
}
function ti(f, i, l) {
  return (u, d, g) => (!l || l(u, d, g)) && f(g[0], i, u, d);
}
function $e(f, i, l, u) {
  let d;
  return f.wholeWord && (d = ri(i.charCategorizer(i.selection.main.head))), f.test && (d = ti(f.test, i, d)), new Lt(i.doc, f.search, { ignoreCase: !f.caseSensitive, test: d }, l, u);
}
function nt(f, i) {
  return f.slice(pr(f, i, !1), i);
}
function it(f, i) {
  return f.slice(i, pr(f, i));
}
function ri(f) {
  return (i, l, u) => !u[0].length || (f(nt(u.input, u.index)) != Ee.Word || f(it(u.input, u.index)) != Ee.Word) && (f(it(u.input, u.index + u[0].length)) != Ee.Word || f(nt(u.input, u.index + u[0].length)) != Ee.Word);
}
class ni extends wr {
  nextMatch(i, l, u) {
    let d = $e(this.spec, i, u, i.doc.length).next();
    return d.done && (d = $e(this.spec, i, 0, l).next()), d.done ? null : d.value;
  }
  prevMatchInRange(i, l, u) {
    for (let d = 1; ; d++) {
      let g = Math.max(
        l,
        u - d * 1e4
        /* FindPrev.ChunkSize */
      ), w = $e(this.spec, i, g, u), S = null;
      for (; !w.next().done; )
        S = w.value;
      if (S && (g == l || S.from > g + 10))
        return S;
      if (g == l)
        return null;
    }
  }
  prevMatch(i, l, u) {
    return this.prevMatchInRange(i, 0, l) || this.prevMatchInRange(i, u, i.doc.length);
  }
  getReplacement(i) {
    return this.spec.unquote(this.spec.replace).replace(/\$([$&]|\d+)/g, (l, u) => {
      if (u == "&")
        return i.match[0];
      if (u == "$")
        return "$";
      for (let d = u.length; d > 0; d--) {
        let g = +u.slice(0, d);
        if (g > 0 && g < i.match.length)
          return i.match[g] + u.slice(d);
      }
      return l;
    });
  }
  matchAll(i, l) {
    let u = $e(this.spec, i, 0, i.doc.length), d = [];
    for (; !u.next().done; ) {
      if (d.length >= l)
        return null;
      d.push(u.value);
    }
    return d;
  }
  highlight(i, l, u, d) {
    let g = $e(this.spec, i, Math.max(
      0,
      l - 250
      /* RegExp.HighlightMargin */
    ), Math.min(u + 250, i.doc.length));
    for (; !g.next().done; )
      d(g.value.from, g.value.to);
  }
}
const wt = /* @__PURE__ */ dr.define();
function ii(f) {
  var i = f.Pos;
  function l(e, t, r) {
    if (t.line === r.line && t.ch >= r.ch - 1) {
      var n = e.getLine(t.line), a = n.charCodeAt(t.ch);
      55296 <= a && a <= 55551 && (r.ch += 1);
    }
    return { start: t, end: r };
  }
  var u = [
    // Key to key mapping. This goes first to make it possible to override
    // existing mappings.
    { keys: "<Left>", type: "keyToKey", toKeys: "h" },
    { keys: "<Right>", type: "keyToKey", toKeys: "l" },
    { keys: "<Up>", type: "keyToKey", toKeys: "k" },
    { keys: "<Down>", type: "keyToKey", toKeys: "j" },
    { keys: "g<Up>", type: "keyToKey", toKeys: "gk" },
    { keys: "g<Down>", type: "keyToKey", toKeys: "gj" },
    { keys: "<Space>", type: "keyToKey", toKeys: "l" },
    { keys: "<BS>", type: "keyToKey", toKeys: "h" },
    { keys: "<Del>", type: "keyToKey", toKeys: "x" },
    { keys: "<C-Space>", type: "keyToKey", toKeys: "W" },
    { keys: "<C-BS>", type: "keyToKey", toKeys: "B" },
    { keys: "<S-Space>", type: "keyToKey", toKeys: "w" },
    { keys: "<S-BS>", type: "keyToKey", toKeys: "b" },
    { keys: "<C-n>", type: "keyToKey", toKeys: "j" },
    { keys: "<C-p>", type: "keyToKey", toKeys: "k" },
    { keys: "<C-[>", type: "keyToKey", toKeys: "<Esc>" },
    { keys: "<C-c>", type: "keyToKey", toKeys: "<Esc>" },
    { keys: "<C-[>", type: "keyToKey", toKeys: "<Esc>", context: "insert" },
    { keys: "<C-c>", type: "keyToKey", toKeys: "<Esc>", context: "insert" },
    { keys: "<C-Esc>", type: "keyToKey", toKeys: "<Esc>" },
    // ipad keyboard sends C-Esc instead of C-[
    { keys: "<C-Esc>", type: "keyToKey", toKeys: "<Esc>", context: "insert" },
    { keys: "s", type: "keyToKey", toKeys: "cl", context: "normal" },
    { keys: "s", type: "keyToKey", toKeys: "c", context: "visual" },
    { keys: "S", type: "keyToKey", toKeys: "cc", context: "normal" },
    { keys: "S", type: "keyToKey", toKeys: "VdO", context: "visual" },
    { keys: "<Home>", type: "keyToKey", toKeys: "0" },
    { keys: "<End>", type: "keyToKey", toKeys: "$" },
    { keys: "<PageUp>", type: "keyToKey", toKeys: "<C-b>" },
    { keys: "<PageDown>", type: "keyToKey", toKeys: "<C-f>" },
    { keys: "<CR>", type: "keyToKey", toKeys: "j^", context: "normal" },
    { keys: "<Ins>", type: "keyToKey", toKeys: "i", context: "normal" },
    { keys: "<Ins>", type: "action", action: "toggleOverwrite", context: "insert" },
    // Motions
    { keys: "H", type: "motion", motion: "moveToTopLine", motionArgs: { linewise: !0, toJumplist: !0 } },
    { keys: "M", type: "motion", motion: "moveToMiddleLine", motionArgs: { linewise: !0, toJumplist: !0 } },
    { keys: "L", type: "motion", motion: "moveToBottomLine", motionArgs: { linewise: !0, toJumplist: !0 } },
    { keys: "h", type: "motion", motion: "moveByCharacters", motionArgs: { forward: !1 } },
    { keys: "l", type: "motion", motion: "moveByCharacters", motionArgs: { forward: !0 } },
    { keys: "j", type: "motion", motion: "moveByLines", motionArgs: { forward: !0, linewise: !0 } },
    { keys: "k", type: "motion", motion: "moveByLines", motionArgs: { forward: !1, linewise: !0 } },
    { keys: "gj", type: "motion", motion: "moveByDisplayLines", motionArgs: { forward: !0 } },
    { keys: "gk", type: "motion", motion: "moveByDisplayLines", motionArgs: { forward: !1 } },
    { keys: "w", type: "motion", motion: "moveByWords", motionArgs: { forward: !0, wordEnd: !1 } },
    { keys: "W", type: "motion", motion: "moveByWords", motionArgs: { forward: !0, wordEnd: !1, bigWord: !0 } },
    { keys: "e", type: "motion", motion: "moveByWords", motionArgs: { forward: !0, wordEnd: !0, inclusive: !0 } },
    { keys: "E", type: "motion", motion: "moveByWords", motionArgs: { forward: !0, wordEnd: !0, bigWord: !0, inclusive: !0 } },
    { keys: "b", type: "motion", motion: "moveByWords", motionArgs: { forward: !1, wordEnd: !1 } },
    { keys: "B", type: "motion", motion: "moveByWords", motionArgs: { forward: !1, wordEnd: !1, bigWord: !0 } },
    { keys: "ge", type: "motion", motion: "moveByWords", motionArgs: { forward: !1, wordEnd: !0, inclusive: !0 } },
    { keys: "gE", type: "motion", motion: "moveByWords", motionArgs: { forward: !1, wordEnd: !0, bigWord: !0, inclusive: !0 } },
    { keys: "{", type: "motion", motion: "moveByParagraph", motionArgs: { forward: !1, toJumplist: !0 } },
    { keys: "}", type: "motion", motion: "moveByParagraph", motionArgs: { forward: !0, toJumplist: !0 } },
    { keys: "(", type: "motion", motion: "moveBySentence", motionArgs: { forward: !1 } },
    { keys: ")", type: "motion", motion: "moveBySentence", motionArgs: { forward: !0 } },
    { keys: "<C-f>", type: "motion", motion: "moveByPage", motionArgs: { forward: !0 } },
    { keys: "<C-b>", type: "motion", motion: "moveByPage", motionArgs: { forward: !1 } },
    { keys: "<C-d>", type: "motion", motion: "moveByScroll", motionArgs: { forward: !0, explicitRepeat: !0 } },
    { keys: "<C-u>", type: "motion", motion: "moveByScroll", motionArgs: { forward: !1, explicitRepeat: !0 } },
    { keys: "gg", type: "motion", motion: "moveToLineOrEdgeOfDocument", motionArgs: { forward: !1, explicitRepeat: !0, linewise: !0, toJumplist: !0 } },
    { keys: "G", type: "motion", motion: "moveToLineOrEdgeOfDocument", motionArgs: { forward: !0, explicitRepeat: !0, linewise: !0, toJumplist: !0 } },
    { keys: "g$", type: "motion", motion: "moveToEndOfDisplayLine" },
    { keys: "g^", type: "motion", motion: "moveToStartOfDisplayLine" },
    { keys: "g0", type: "motion", motion: "moveToStartOfDisplayLine" },
    { keys: "0", type: "motion", motion: "moveToStartOfLine" },
    { keys: "^", type: "motion", motion: "moveToFirstNonWhiteSpaceCharacter" },
    { keys: "+", type: "motion", motion: "moveByLines", motionArgs: { forward: !0, toFirstChar: !0 } },
    { keys: "-", type: "motion", motion: "moveByLines", motionArgs: { forward: !1, toFirstChar: !0 } },
    { keys: "_", type: "motion", motion: "moveByLines", motionArgs: { forward: !0, toFirstChar: !0, repeatOffset: -1 } },
    { keys: "$", type: "motion", motion: "moveToEol", motionArgs: { inclusive: !0 } },
    { keys: "%", type: "motion", motion: "moveToMatchedSymbol", motionArgs: { inclusive: !0, toJumplist: !0 } },
    { keys: "f<character>", type: "motion", motion: "moveToCharacter", motionArgs: { forward: !0, inclusive: !0 } },
    { keys: "F<character>", type: "motion", motion: "moveToCharacter", motionArgs: { forward: !1 } },
    { keys: "t<character>", type: "motion", motion: "moveTillCharacter", motionArgs: { forward: !0, inclusive: !0 } },
    { keys: "T<character>", type: "motion", motion: "moveTillCharacter", motionArgs: { forward: !1 } },
    { keys: ";", type: "motion", motion: "repeatLastCharacterSearch", motionArgs: { forward: !0 } },
    { keys: ",", type: "motion", motion: "repeatLastCharacterSearch", motionArgs: { forward: !1 } },
    { keys: "'<register>", type: "motion", motion: "goToMark", motionArgs: { toJumplist: !0, linewise: !0 } },
    { keys: "`<register>", type: "motion", motion: "goToMark", motionArgs: { toJumplist: !0 } },
    { keys: "]`", type: "motion", motion: "jumpToMark", motionArgs: { forward: !0 } },
    { keys: "[`", type: "motion", motion: "jumpToMark", motionArgs: { forward: !1 } },
    { keys: "]'", type: "motion", motion: "jumpToMark", motionArgs: { forward: !0, linewise: !0 } },
    { keys: "['", type: "motion", motion: "jumpToMark", motionArgs: { forward: !1, linewise: !0 } },
    // the next two aren't motions but must come before more general motion declarations
    { keys: "]p", type: "action", action: "paste", isEdit: !0, actionArgs: { after: !0, isEdit: !0, matchIndent: !0 } },
    { keys: "[p", type: "action", action: "paste", isEdit: !0, actionArgs: { after: !1, isEdit: !0, matchIndent: !0 } },
    { keys: "]<character>", type: "motion", motion: "moveToSymbol", motionArgs: { forward: !0, toJumplist: !0 } },
    { keys: "[<character>", type: "motion", motion: "moveToSymbol", motionArgs: { forward: !1, toJumplist: !0 } },
    { keys: "|", type: "motion", motion: "moveToColumn" },
    { keys: "o", type: "motion", motion: "moveToOtherHighlightedEnd", context: "visual" },
    { keys: "O", type: "motion", motion: "moveToOtherHighlightedEnd", motionArgs: { sameLine: !0 }, context: "visual" },
    // Operators
    { keys: "d", type: "operator", operator: "delete" },
    { keys: "y", type: "operator", operator: "yank" },
    { keys: "c", type: "operator", operator: "change" },
    { keys: "=", type: "operator", operator: "indentAuto" },
    { keys: ">", type: "operator", operator: "indent", operatorArgs: { indentRight: !0 } },
    { keys: "<", type: "operator", operator: "indent", operatorArgs: { indentRight: !1 } },
    { keys: "g~", type: "operator", operator: "changeCase" },
    { keys: "gu", type: "operator", operator: "changeCase", operatorArgs: { toLower: !0 }, isEdit: !0 },
    { keys: "gU", type: "operator", operator: "changeCase", operatorArgs: { toLower: !1 }, isEdit: !0 },
    { keys: "n", type: "motion", motion: "findNext", motionArgs: { forward: !0, toJumplist: !0 } },
    { keys: "N", type: "motion", motion: "findNext", motionArgs: { forward: !1, toJumplist: !0 } },
    { keys: "gn", type: "motion", motion: "findAndSelectNextInclusive", motionArgs: { forward: !0 } },
    { keys: "gN", type: "motion", motion: "findAndSelectNextInclusive", motionArgs: { forward: !1 } },
    { keys: "gq", type: "operator", operator: "hardWrap" },
    { keys: "gw", type: "operator", operator: "hardWrap", operatorArgs: { keepCursor: !0 } },
    { keys: "g?", type: "operator", operator: "rot13" },
    // Operator-Motion dual commands
    { keys: "x", type: "operatorMotion", operator: "delete", motion: "moveByCharacters", motionArgs: { forward: !0 }, operatorMotionArgs: { visualLine: !1 } },
    { keys: "X", type: "operatorMotion", operator: "delete", motion: "moveByCharacters", motionArgs: { forward: !1 }, operatorMotionArgs: { visualLine: !0 } },
    { keys: "D", type: "operatorMotion", operator: "delete", motion: "moveToEol", motionArgs: { inclusive: !0 }, context: "normal" },
    { keys: "D", type: "operator", operator: "delete", operatorArgs: { linewise: !0 }, context: "visual" },
    { keys: "Y", type: "operatorMotion", operator: "yank", motion: "expandToLine", motionArgs: { linewise: !0 }, context: "normal" },
    { keys: "Y", type: "operator", operator: "yank", operatorArgs: { linewise: !0 }, context: "visual" },
    { keys: "C", type: "operatorMotion", operator: "change", motion: "moveToEol", motionArgs: { inclusive: !0 }, context: "normal" },
    { keys: "C", type: "operator", operator: "change", operatorArgs: { linewise: !0 }, context: "visual" },
    { keys: "~", type: "operatorMotion", operator: "changeCase", motion: "moveByCharacters", motionArgs: { forward: !0 }, operatorArgs: { shouldMoveCursor: !0 }, context: "normal" },
    { keys: "~", type: "operator", operator: "changeCase", context: "visual" },
    { keys: "<C-u>", type: "operatorMotion", operator: "delete", motion: "moveToStartOfLine", context: "insert" },
    { keys: "<C-w>", type: "operatorMotion", operator: "delete", motion: "moveByWords", motionArgs: { forward: !1, wordEnd: !1 }, context: "insert" },
    //ignore C-w in normal mode
    { keys: "<C-w>", type: "idle", context: "normal" },
    // Actions
    { keys: "<C-i>", type: "action", action: "jumpListWalk", actionArgs: { forward: !0 } },
    { keys: "<C-o>", type: "action", action: "jumpListWalk", actionArgs: { forward: !1 } },
    { keys: "<C-e>", type: "action", action: "scroll", actionArgs: { forward: !0, linewise: !0 } },
    { keys: "<C-y>", type: "action", action: "scroll", actionArgs: { forward: !1, linewise: !0 } },
    { keys: "a", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "charAfter" }, context: "normal" },
    { keys: "A", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "eol" }, context: "normal" },
    { keys: "A", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "endOfSelectedArea" }, context: "visual" },
    { keys: "i", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "inplace" }, context: "normal" },
    { keys: "gi", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "lastEdit" }, context: "normal" },
    { keys: "I", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "firstNonBlank" }, context: "normal" },
    { keys: "gI", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "bol" }, context: "normal" },
    { keys: "I", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "startOfSelectedArea" }, context: "visual" },
    { keys: "o", type: "action", action: "newLineAndEnterInsertMode", isEdit: !0, interlaceInsertRepeat: !0, actionArgs: { after: !0 }, context: "normal" },
    { keys: "O", type: "action", action: "newLineAndEnterInsertMode", isEdit: !0, interlaceInsertRepeat: !0, actionArgs: { after: !1 }, context: "normal" },
    { keys: "v", type: "action", action: "toggleVisualMode" },
    { keys: "V", type: "action", action: "toggleVisualMode", actionArgs: { linewise: !0 } },
    { keys: "<C-v>", type: "action", action: "toggleVisualMode", actionArgs: { blockwise: !0 } },
    { keys: "<C-q>", type: "action", action: "toggleVisualMode", actionArgs: { blockwise: !0 } },
    { keys: "gv", type: "action", action: "reselectLastSelection" },
    { keys: "J", type: "action", action: "joinLines", isEdit: !0 },
    { keys: "gJ", type: "action", action: "joinLines", actionArgs: { keepSpaces: !0 }, isEdit: !0 },
    { keys: "p", type: "action", action: "paste", isEdit: !0, actionArgs: { after: !0, isEdit: !0 } },
    { keys: "P", type: "action", action: "paste", isEdit: !0, actionArgs: { after: !1, isEdit: !0 } },
    { keys: "r<character>", type: "action", action: "replace", isEdit: !0 },
    { keys: "@<register>", type: "action", action: "replayMacro" },
    { keys: "q<register>", type: "action", action: "enterMacroRecordMode" },
    // Handle Replace-mode as a special case of insert mode.
    { keys: "R", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { replace: !0 }, context: "normal" },
    { keys: "R", type: "operator", operator: "change", operatorArgs: { linewise: !0, fullLine: !0 }, context: "visual", exitVisualBlock: !0 },
    { keys: "u", type: "action", action: "undo", context: "normal" },
    { keys: "u", type: "operator", operator: "changeCase", operatorArgs: { toLower: !0 }, context: "visual", isEdit: !0 },
    { keys: "U", type: "operator", operator: "changeCase", operatorArgs: { toLower: !1 }, context: "visual", isEdit: !0 },
    { keys: "<C-r>", type: "action", action: "redo" },
    { keys: "m<register>", type: "action", action: "setMark" },
    { keys: '"<register>', type: "action", action: "setRegister" },
    { keys: "<C-r><register>", type: "action", action: "insertRegister", context: "insert", isEdit: !0 },
    { keys: "<C-o>", type: "action", action: "oneNormalCommand", context: "insert" },
    { keys: "zz", type: "action", action: "scrollToCursor", actionArgs: { position: "center" } },
    { keys: "z.", type: "action", action: "scrollToCursor", actionArgs: { position: "center" }, motion: "moveToFirstNonWhiteSpaceCharacter" },
    { keys: "zt", type: "action", action: "scrollToCursor", actionArgs: { position: "top" } },
    { keys: "z<CR>", type: "action", action: "scrollToCursor", actionArgs: { position: "top" }, motion: "moveToFirstNonWhiteSpaceCharacter" },
    { keys: "zb", type: "action", action: "scrollToCursor", actionArgs: { position: "bottom" } },
    { keys: "z-", type: "action", action: "scrollToCursor", actionArgs: { position: "bottom" }, motion: "moveToFirstNonWhiteSpaceCharacter" },
    { keys: ".", type: "action", action: "repeatLastEdit" },
    { keys: "<C-a>", type: "action", action: "incrementNumberToken", isEdit: !0, actionArgs: { increase: !0, backtrack: !1 } },
    { keys: "<C-x>", type: "action", action: "incrementNumberToken", isEdit: !0, actionArgs: { increase: !1, backtrack: !1 } },
    { keys: "<C-t>", type: "action", action: "indent", actionArgs: { indentRight: !0 }, context: "insert" },
    { keys: "<C-d>", type: "action", action: "indent", actionArgs: { indentRight: !1 }, context: "insert" },
    // Text object motions
    { keys: "a<register>", type: "motion", motion: "textObjectManipulation" },
    { keys: "i<register>", type: "motion", motion: "textObjectManipulation", motionArgs: { textObjectInner: !0 } },
    // Search
    { keys: "/", type: "search", searchArgs: { forward: !0, querySrc: "prompt", toJumplist: !0 } },
    { keys: "?", type: "search", searchArgs: { forward: !1, querySrc: "prompt", toJumplist: !0 } },
    { keys: "*", type: "search", searchArgs: { forward: !0, querySrc: "wordUnderCursor", wholeWordOnly: !0, toJumplist: !0 } },
    { keys: "#", type: "search", searchArgs: { forward: !1, querySrc: "wordUnderCursor", wholeWordOnly: !0, toJumplist: !0 } },
    { keys: "g*", type: "search", searchArgs: { forward: !0, querySrc: "wordUnderCursor", toJumplist: !0 } },
    { keys: "g#", type: "search", searchArgs: { forward: !1, querySrc: "wordUnderCursor", toJumplist: !0 } },
    // Ex command
    { keys: ":", type: "ex" }
  ], d = /* @__PURE__ */ Object.create(null), g = u.length, w = [
    { name: "colorscheme", shortName: "colo" },
    { name: "map" },
    { name: "imap", shortName: "im" },
    { name: "nmap", shortName: "nm" },
    { name: "vmap", shortName: "vm" },
    { name: "omap", shortName: "om" },
    { name: "noremap", shortName: "no" },
    { name: "nnoremap", shortName: "nn" },
    { name: "vnoremap", shortName: "vn" },
    { name: "inoremap", shortName: "ino" },
    { name: "onoremap", shortName: "ono" },
    { name: "unmap" },
    { name: "mapclear", shortName: "mapc" },
    { name: "nmapclear", shortName: "nmapc" },
    { name: "vmapclear", shortName: "vmapc" },
    { name: "imapclear", shortName: "imapc" },
    { name: "omapclear", shortName: "omapc" },
    { name: "write", shortName: "w" },
    { name: "undo", shortName: "u" },
    { name: "redo", shortName: "red" },
    { name: "set", shortName: "se" },
    { name: "setlocal", shortName: "setl" },
    { name: "setglobal", shortName: "setg" },
    { name: "sort", shortName: "sor" },
    { name: "substitute", shortName: "s", possiblyAsync: !0 },
    { name: "startinsert", shortName: "start" },
    { name: "nohlsearch", shortName: "noh" },
    { name: "yank", shortName: "y" },
    { name: "delmarks", shortName: "delm" },
    { name: "marks", excludeFromCommandHistory: !0 },
    { name: "registers", shortName: "reg", excludeFromCommandHistory: !0 },
    { name: "vglobal", shortName: "v" },
    { name: "delete", shortName: "d" },
    { name: "join", shortName: "j" },
    { name: "normal", shortName: "norm" },
    { name: "global", shortName: "g" }
  ], S = Et("");
  function L(e) {
    e.setOption("disableInput", !0), e.setOption("showCursorWhenSelecting", !1), f.signal(e, "vim-mode-change", { mode: "normal" }), e.on("cursorActivity", tr), Pe(e), f.on(e.getInputField(), "paste", _(e));
  }
  function P(e) {
    e.setOption("disableInput", !1), e.off("cursorActivity", tr), f.off(e.getInputField(), "paste", _(e)), e.state.vim = null, Je && clearTimeout(Je);
  }
  function _(e) {
    var t = e.state.vim;
    return t.onPasteFn || (t.onPasteFn = function() {
      t.insertMode || (e.setCursor(G(e.getCursor(), 0, 1)), _e.enterInsertMode(e, {}, t));
    }), t.onPasteFn;
  }
  var H = /[\d]/, j = [f.isWordChar, function(e) {
    return e && !f.isWordChar(e) && !/\s/.test(e);
  }], B = [function(e) {
    return /\S/.test(e);
  }], F = ["<", ">"], Q = ["-", '"', ".", ":", "_", "/", "+"], $ = /^\w$/, z = /^[A-Z]$/;
  try {
    z = new RegExp("^[\\p{Lu}]$", "u");
  } catch {
  }
  function ie(e, t) {
    return t >= e.firstLine() && t <= e.lastLine();
  }
  function ae(e) {
    return /^[a-z]$/.test(e);
  }
  function ce(e) {
    return "()[]{}".indexOf(e) != -1;
  }
  function oe(e) {
    return H.test(e);
  }
  function ge(e) {
    return z.test(e);
  }
  function Z(e) {
    return /^\s*$/.test(e);
  }
  function Be(e) {
    return ".?!".indexOf(e) != -1;
  }
  function ot(e, t) {
    for (var r = 0; r < t.length; r++)
      if (t[r] == e)
        return !0;
    return !1;
  }
  var Le = {};
  function Ne(e, t, r, n, a) {
    if (t === void 0 && !a)
      throw Error("defaultValue is required unless callback is provided");
    if (r || (r = "string"), Le[e] = {
      type: r,
      defaultValue: t,
      callback: a
    }, n)
      for (var o = 0; o < n.length; o++)
        Le[n[o]] = Le[e];
    t && Ge(e, t);
  }
  function Ge(e, t, r, n) {
    var a = Le[e];
    n = n || {};
    var o = n.scope;
    if (!a)
      return new Error("Unknown option: " + e);
    if (a.type == "boolean") {
      if (t && t !== !0)
        return new Error("Invalid argument: " + e + "=" + t);
      t !== !1 && (t = !0);
    }
    a.callback ? (o !== "local" && a.callback(t, void 0), o !== "global" && r && a.callback(t, r)) : (o !== "local" && (a.value = a.type == "boolean" ? !!t : t), o !== "global" && r && (r.state.vim.options[e] = { value: t }));
  }
  function le(e, t, r) {
    var n = Le[e];
    r = r || {};
    var a = r.scope;
    if (!n)
      return new Error("Unknown option: " + e);
    if (n.callback) {
      let o = t && n.callback(void 0, t);
      return a !== "global" && o !== void 0 ? o : a !== "local" ? n.callback() : void 0;
    } else
      return (a !== "global" && t && t.state.vim.options[e] || a !== "local" && n || {}).value;
  }
  Ne("filetype", void 0, "string", ["ft"], function(e, t) {
    if (t !== void 0)
      if (e === void 0) {
        let r = t.getOption("mode");
        return r == "null" ? "" : r;
      } else {
        let r = e == "" ? "null" : e;
        t.setOption("mode", r);
      }
  }), Ne("textwidth", 80, "number", ["tw"], function(e, t) {
    if (t !== void 0)
      if (e === void 0) {
        var r = t.getOption("textwidth");
        return r;
      } else {
        var n = Math.round(e);
        n > 1 && t.setOption("textwidth", n);
      }
  });
  var Or = function() {
    var e = 100, t = -1, r = 0, n = 0, a = (
      /**@type {(Marker|undefined)[]} */
      new Array(e)
    );
    function o(h, v, p) {
      var m = t % e, k = a[m];
      function C(x) {
        var M = ++t % e, T = a[M];
        T && T.clear(), a[M] = h.setBookmark(x);
      }
      if (k) {
        var y = k.find();
        y && !he(y, v) && C(v);
      } else
        C(v);
      C(p), r = t, n = t - e + 1, n < 0 && (n = 0);
    }
    function s(h, v) {
      t += v, t > r ? t = r : t < n && (t = n);
      var p = a[(e + t) % e];
      if (p && !p.find()) {
        var m = v > 0 ? 1 : -1, k, C = h.getCursor();
        do
          if (t += m, p = a[(e + t) % e], p && (k = p.find()) && !he(C, k))
            break;
        while (t < r && t > n);
      }
      return p;
    }
    function c(h, v) {
      var p = t, m = s(h, v);
      return t = p, m && m.find();
    }
    return {
      /**@type{Pos|undefined} */
      cachedCursor: void 0,
      //used for # and * jumps
      add: o,
      find: c,
      move: s
    };
  }, bt = function(e) {
    return e ? {
      changes: e.changes,
      expectCursorActivityForChange: e.expectCursorActivityForChange
    } : {
      // Change list
      changes: [],
      // Set to true on change, false on cursorActivity.
      expectCursorActivityForChange: !1
    };
  };
  class Rr {
    constructor() {
      this.latestRegister = void 0, this.isPlaying = !1, this.isRecording = !1, this.replaySearchQueries = [], this.onRecordingDone = void 0, this.lastInsertModeChanges = bt();
    }
    exitMacroRecordMode() {
      var t = A.macroModeState;
      t.onRecordingDone && t.onRecordingDone(), t.onRecordingDone = void 0, t.isRecording = !1;
    }
    /**
     * @arg {CodeMirror} cm
     * @arg {string} registerName
     */
    enterMacroRecordMode(t, r) {
      var n = A.registerController.getRegister(r);
      if (n) {
        if (n.clear(), this.latestRegister = r, t.openDialog) {
          var a = me("span", { class: "cm-vim-message" }, "recording @" + r);
          this.onRecordingDone = t.openDialog(a, function() {
          }, { bottom: !0 });
        }
        this.isRecording = !0;
      }
    }
  }
  function Pe(e) {
    return e.state.vim || (e.state.vim = {
      inputState: new Ot(),
      // Vim's input state that triggered the last edit, used to repeat
      // motions and operators with '.'.
      lastEditInputState: void 0,
      // Vim's action command before the last edit, used to repeat actions
      // with '.' and insert mode repeat.
      lastEditActionCommand: void 0,
      // When using jk for navigation, if you move from a longer line to a
      // shorter line, the cursor may clip to the end of the shorter line.
      // If j is pressed again and cursor goes to the next line, the
      // cursor should go back to its horizontal position on the longer
      // line if it can. This is to keep track of the horizontal position.
      lastHPos: -1,
      // Doing the same with screen-position for gj/gk
      lastHSPos: -1,
      // The last motion command run. Cleared if a non-motion command gets
      // executed in between.
      lastMotion: null,
      marks: {},
      insertMode: !1,
      insertModeReturn: !1,
      // Repeat count for changes made in insert mode, triggered by key
      // sequences like 3,i. Only exists when insertMode is true.
      insertModeRepeat: void 0,
      visualMode: !1,
      // If we are in visual line mode. No effect if visualMode is false.
      visualLine: !1,
      visualBlock: !1,
      lastSelection: (
        /**@type{vimState["lastSelection"]}*/
        /**@type{unknown}*/
        null
      ),
      lastPastedText: void 0,
      sel: { anchor: new i(0, 0), head: new i(0, 0) },
      // Buffer-local/window-local values of vim options.
      options: {},
      // Whether the next character should be interpreted literally
      // Necassary for correct implementation of f<character>, r<character> etc.
      // in terms of langmaps.
      expectLiteralNext: !1,
      status: ""
    }), e.state.vim;
  }
  var A;
  function At() {
    A = {
      // The current search query.
      searchQuery: null,
      // Whether we are searching backwards.
      searchIsReversed: !1,
      // Replace part of the last substituted pattern
      lastSubstituteReplacePart: void 0,
      jumpList: Or(),
      macroModeState: new Rr(),
      // Recording latest f, t, F or T motion command.
      lastCharacterSearch: { increment: 0, forward: !0, selectedCharacter: "" },
      registerController: new Kr({}),
      // search history buffer
      searchHistoryController: new Rt(),
      // ex Command history buffer
      exCommandHistoryController: new Rt()
    };
    for (var e in Le) {
      var t = Le[e];
      t.value = t.defaultValue;
    }
  }
  class st {
    /**
     * Wrapper for special keys pressed in insert mode
     * @arg {string} keyName
     * @arg {KeyboardEvent} e
     * @returns
     */
    constructor(t, r) {
      this.keyName = t, this.key = r.key, this.ctrlKey = r.ctrlKey, this.altKey = r.altKey, this.metaKey = r.metaKey, this.shiftKey = r.shiftKey;
    }
  }
  var Ue, ue = {
    enterVimMode: L,
    leaveVimMode: P,
    buildKeyMap: function() {
    },
    // Testing hook, though it might be useful to expose the register
    // controller anyway.
    getRegisterController: function() {
      return A.registerController;
    },
    // Testing hook.
    resetVimGlobalState_: At,
    // Testing hook.
    getVimGlobalState_: function() {
      return A;
    },
    // Testing hook.
    maybeInitVimState_: Pe,
    suppressErrorLogging: !1,
    InsertModeKey: st,
    /**@type {(lhs: string, rhs: string, ctx: string) => void} */
    map: function(e, t, r) {
      se.map(e, t, r);
    },
    /**@type {(lhs: string, ctx: string) => any} */
    unmap: function(e, t) {
      return se.unmap(e, t);
    },
    // Non-recursive map function.
    // NOTE: This will not create mappings to key maps that aren't present
    // in the default key map. See TODO at bottom of function.
    /**@type {(lhs: string, rhs: string, ctx: string) => void} */
    noremap: function(e, t, r) {
      se.map(e, t, r, !0);
    },
    // Remove all user-defined mappings for the provided context.
    /**@arg {string} [ctx]} */
    mapclear: function(e) {
      var t = u.length, r = g, n = u.slice(0, t - r);
      if (u = u.slice(t - r), e)
        for (var a = n.length - 1; a >= 0; a--) {
          var o = n[a];
          if (e !== o.context)
            if (o.context)
              this._mapCommand(o);
            else {
              var s = ["normal", "insert", "visual"];
              for (var c in s)
                if (s[c] !== e) {
                  var h = Object.assign({}, o);
                  h.context = s[c], this._mapCommand(h);
                }
            }
        }
    },
    langmap: Tt,
    vimKeyFromEvent: qe,
    // TODO: Expose setOption and getOption as instance methods. Need to decide how to namespace
    // them, or somehow make them work with the existing CodeMirror setOption/getOption API.
    setOption: Ge,
    getOption: le,
    defineOption: Ne,
    /**@type {(name: string, prefix: string|undefined, func: ExFn) => void} */
    defineEx: function(e, t, r) {
      if (!t)
        t = e;
      else if (e.indexOf(t) !== 0)
        throw new Error('(Vim.defineEx) "' + t + '" is not a prefix of "' + e + '", command not registered');
      Zt[e] = r, se.commandMap_[t] = { name: e, shortName: t, type: "api" };
    },
    /**@type {(cm: CodeMirror, key: string, origin: string) => undefined | boolean} */
    handleKey: function(e, t, r) {
      var n = this.findKey(e, t, r);
      if (typeof n == "function")
        return n();
    },
    multiSelectHandleKey: bn,
    /**
     * This is the outermost function called by CodeMirror, after keys have
     * been mapped to their Vim equivalents.
     *
     * Finds a command based on the key (and cached keys if there is a
     * multi-key sequence). Returns `undefined` if no key is matched, a noop
     * function if a partial match is found (multi-key), and a function to
     * execute the bound command if a a key is matched. The function always
     * returns true.
     */
    /**@type {(cm_: CodeMirror, key: string, origin?: string| undefined) => (() => boolean|undefined) | undefined} */
    findKey: function(e, t, r) {
      var n = Pe(e), a = (
        /**@type {CodeMirrorV}*/
        e
      );
      function o() {
        var p = A.macroModeState;
        if (p.isRecording) {
          if (t == "q")
            return p.exitMacroRecordMode(), Y(a), !0;
          r != "mapping" && Sn(p, t);
        }
      }
      function s() {
        if (t == "<Esc>") {
          if (n.visualMode)
            xe(a);
          else if (n.insertMode)
            Te(a);
          else
            return;
          return Y(a), !0;
        }
      }
      function c() {
        if (s())
          return !0;
        n.inputState.keyBuffer.push(t);
        var p = n.inputState.keyBuffer.join(""), m = t.length == 1, k = Oe.matchCommand(p, u, n.inputState, "insert"), C = n.inputState.changeQueue;
        if (k.type == "none")
          return Y(a), !1;
        if (k.type == "partial") {
          if (k.expectLiteralNext && (n.expectLiteralNext = !0), Ue && window.clearTimeout(Ue), Ue = m && window.setTimeout(
            function() {
              n.insertMode && n.inputState.keyBuffer.length && Y(a);
            },
            le("insertModeEscKeysTimeout")
          ), m) {
            var y = a.listSelections();
            (!C || C.removed.length != y.length) && (C = n.inputState.changeQueue = new Nr()), C.inserted += t;
            for (var x = 0; x < y.length; x++) {
              var M = ne(y[x].anchor, y[x].head), T = Ae(y[x].anchor, y[x].head), b = a.getRange(M, a.state.overwrite ? G(T, 0, 1) : T);
              C.removed[x] = (C.removed[x] || "") + b;
            }
          }
          return !m;
        } else k.type == "full" && (n.inputState.keyBuffer.length = 0);
        if (n.expectLiteralNext = !1, Ue && window.clearTimeout(Ue), k.command && C) {
          for (var y = a.listSelections(), x = 0; x < y.length; x++) {
            var O = y[x].head;
            a.replaceRange(
              C.removed[x] || "",
              G(O, 0, -C.inserted.length),
              O,
              "+input"
            );
          }
          A.macroModeState.lastInsertModeChanges.changes.pop();
        }
        return k.command || Y(a), k.command;
      }
      function h() {
        if (o() || s())
          return !0;
        n.inputState.keyBuffer.push(t);
        var p = n.inputState.keyBuffer.join("");
        if (/^[1-9]\d*$/.test(p))
          return !0;
        var m = /^(\d*)(.*)$/.exec(p);
        if (!m)
          return Y(a), !1;
        var k = n.visualMode ? "visual" : "normal", C = m[2] || m[1];
        n.inputState.operatorShortcut && n.inputState.operatorShortcut.slice(-1) == C && (C = n.inputState.operatorShortcut);
        var y = Oe.matchCommand(C, u, n.inputState, k);
        return y.type == "none" ? (Y(a), !1) : y.type == "partial" ? (y.expectLiteralNext && (n.expectLiteralNext = !0), !0) : y.type == "clear" ? (Y(a), !0) : (n.expectLiteralNext = !1, n.inputState.keyBuffer.length = 0, m = /^(\d*)(.*)$/.exec(p), m && m[1] && m[1] != "0" && n.inputState.pushRepeatDigit(m[1]), y.command);
      }
      var v = n.insertMode ? c() : h();
      if (v === !1)
        return !n.insertMode && (t.length === 1 || f.isMac && /<A-.>/.test(t)) ? function() {
          return !0;
        } : void 0;
      if (v === !0)
        return function() {
          return !0;
        };
      if (v)
        return function() {
          return a.operation(function() {
            a.curOp.isVimOp = !0;
            try {
              if (typeof v != "object") return;
              v.type == "keyToKey" ? Qe(a, v.toKeys, v) : Oe.processCommand(a, n, v);
            } catch (p) {
              throw a.state.vim = void 0, Pe(a), ue.suppressErrorLogging || console.log(p), p;
            }
            return !0;
          });
        };
    },
    /**@type {(cm: CodeMirrorV, input: string)=>void} */
    handleEx: function(e, t) {
      se.processCommand(e, t);
    },
    defineMotion: Dr,
    defineAction: Fr,
    defineOperator: _r,
    mapCommand: wn,
    _mapCommand: gt,
    defineRegister: Pr,
    exitVisualMode: xe,
    exitInsertMode: Te
  }, Ke = [], Ye = !1, X;
  function Ir(e) {
    if (!X) throw new Error("No prompt to send key to");
    if (e[0] == "<") {
      var t = e.toLowerCase().slice(1, -1), r = t.split("-");
      if (t = r.pop() || "", t == "lt") e = "<";
      else if (t == "space") e = " ";
      else if (t == "cr") e = `
`;
      else if (De[t]) {
        var n = X.value || "", a = {
          key: De[t],
          target: {
            value: n,
            selectionEnd: n.length,
            selectionStart: n.length
          }
        };
        X.onKeyDown && X.onKeyDown(a, X.value, s), X && X.onKeyUp && X.onKeyUp(a, X.value, s);
        return;
      }
    }
    if (e == `
`) {
      var o = X;
      X = null, o.onClose && o.onClose(o.value);
    } else
      X.value = (X.value || "") + e;
    function s(c) {
      X && (typeof c == "string" ? X.value = c : X = null);
    }
  }
  function Qe(e, t, r) {
    var n = Ye;
    if (r) {
      if (Ke.indexOf(r) != -1) return;
      Ke.push(r), Ye = r.noremap != !1;
    }
    try {
      for (var a = Pe(e), o = /<(?:[CSMA]-)*\w+>|./gi, s; s = o.exec(t); ) {
        var c = s[0], h = a.insertMode;
        if (X) {
          Ir(c);
          continue;
        }
        var v = ue.handleKey(e, c, "mapping");
        if (!v && h && a.insertMode) {
          if (c[0] == "<") {
            var p = c.toLowerCase().slice(1, -1), m = p.split("-");
            if (p = m.pop() || "", p == "lt") c = "<";
            else if (p == "space") c = " ";
            else if (p == "cr") c = `
`;
            else if (De.hasOwnProperty(p)) {
              c = De[p], ar(e, c);
              continue;
            } else
              c = c[0], o.lastIndex = s.index + 1;
          }
          e.replaceSelection(c);
        }
      }
    } finally {
      if (Ke.pop(), Ye = Ke.length ? n : !1, !Ke.length && X) {
        var k = X;
        X = null, et(e, k);
      }
    }
  }
  var lt = {
    Return: "CR",
    Backspace: "BS",
    Delete: "Del",
    Escape: "Esc",
    Insert: "Ins",
    ArrowLeft: "Left",
    ArrowRight: "Right",
    ArrowUp: "Up",
    ArrowDown: "Down",
    Enter: "CR",
    " ": "Space"
  }, Br = {
    Shift: 1,
    Alt: 1,
    Command: 1,
    Control: 1,
    CapsLock: 1,
    AltGraph: 1,
    Dead: 1,
    Unidentified: 1
  }, De = {};
  "Left|Right|Up|Down|End|Home".split("|").concat(Object.keys(lt)).forEach(function(e) {
    De[(lt[e] || "").toLowerCase()] = De[e.toLowerCase()] = e;
  });
  function qe(e, t) {
    var o;
    var r = e.key;
    if (!Br[r]) {
      r.length > 1 && r[0] == "n" && (r = r.replace("Numpad", "")), r = lt[r] || r;
      var n = "";
      if (e.ctrlKey && (n += "C-"), e.altKey && (n += "A-"), e.metaKey && (n += "M-"), f.isMac && n == "A-" && r.length == 1 && (n = n.slice(2)), (n || r.length > 1) && e.shiftKey && (n += "S-"), t && !t.expectLiteralNext && r.length == 1) {
        if (S.keymap && r in S.keymap)
          (S.remapCtrl != !1 || !n) && (r = S.keymap[r]);
        else if (r.charCodeAt(0) > 128 && !d[r]) {
          var a = ((o = e.code) == null ? void 0 : o.slice(-1)) || "";
          e.shiftKey || (a = a.toLowerCase()), a && (r = a, !n && e.altKey && (n = "A-"));
        }
      }
      return n += r, n.length > 1 && (n = "<" + n + ">"), n;
    }
  }
  function Tt(e, t) {
    S.string !== e && (S = Et(e)), S.remapCtrl = t;
  }
  function Et(e) {
    let t = {};
    if (!e) return { keymap: t, string: "" };
    function r(n) {
      return n.split(/\\?(.)/).filter(Boolean);
    }
    return e.split(/((?:[^\\,]|\\.)+),/).map((n) => {
      if (!n) return;
      const a = n.split(/((?:[^\\;]|\\.)+);/);
      if (a.length == 3) {
        const o = r(a[1]), s = r(a[2]);
        if (o.length !== s.length) return;
        for (let c = 0; c < o.length; ++c) t[o[c]] = s[c];
      } else if (a.length == 1) {
        const o = r(n);
        if (o.length % 2 !== 0) return;
        for (let s = 0; s < o.length; s += 2) t[o[s]] = o[s + 1];
      }
    }), { keymap: t, string: e };
  }
  Ne("langmap", void 0, "string", ["lmap"], function(e, t) {
    if (e === void 0)
      return S.string;
    Tt(e);
  });
  class Ot {
    constructor() {
      this.prefixRepeat = [], this.motionRepeat = [], this.operator = null, this.operatorArgs = null, this.motion = null, this.motionArgs = null, this.keyBuffer = [], this.registerName = void 0, this.changeQueue = null;
    }
    /** @param {string} n */
    pushRepeatDigit(t) {
      this.operator ? this.motionRepeat = this.motionRepeat.concat(t) : this.prefixRepeat = this.prefixRepeat.concat(t);
    }
    getRepeat() {
      var t = 0;
      return (this.prefixRepeat.length > 0 || this.motionRepeat.length > 0) && (t = 1, this.prefixRepeat.length > 0 && (t *= parseInt(this.prefixRepeat.join(""), 10)), this.motionRepeat.length > 0 && (t *= parseInt(this.motionRepeat.join(""), 10))), t;
    }
  }
  function Y(e, t) {
    e.state.vim.inputState = new Ot(), e.state.vim.expectLiteralNext = !1, f.signal(e, "vim-command-done", t);
  }
  function Nr() {
    this.removed = [], this.inserted = "";
  }
  class ke {
    /** @arg {string} [text] @arg {boolean} [linewise] @arg {boolean } [blockwise] */
    constructor(t, r, n) {
      this.clear(), this.keyBuffer = [t || ""], this.insertModeChanges = [], this.searchQueries = [], this.linewise = !!r, this.blockwise = !!n;
    }
    /** @arg {string} [text] @arg {boolean} [linewise] @arg {boolean } [blockwise] */
    setText(t, r, n) {
      this.keyBuffer = [t || ""], this.linewise = !!r, this.blockwise = !!n;
    }
    /** @arg {string} text @arg {boolean} [linewise] */
    pushText(t, r) {
      r && (this.linewise || this.keyBuffer.push(`
`), this.linewise = !0), this.keyBuffer.push(t);
    }
    /** @arg {InsertModeChanges} changes */
    pushInsertModeChanges(t) {
      this.insertModeChanges.push(bt(t));
    }
    /** @arg {string} query */
    pushSearchQuery(t) {
      this.searchQueries.push(t);
    }
    clear() {
      this.keyBuffer = [], this.insertModeChanges = [], this.searchQueries = [], this.linewise = !1;
    }
    toString() {
      return this.keyBuffer.join("");
    }
  }
  function Pr(e, t) {
    var r = A.registerController.registers;
    if (!e || e.length != 1)
      throw Error("Register name must be 1 character");
    if (r[e])
      throw Error("Register already defined " + e);
    r[e] = t, Q.push(e);
  }
  class Kr {
    /** @arg {Object<string, Register>} registers */
    constructor(t) {
      this.registers = t, this.unnamedRegister = t['"'] = new ke(), t["."] = new ke(), t[":"] = new ke(), t["/"] = new ke(), t["+"] = new ke();
    }
    /**
     * @param {string | null | undefined} registerName
     * @param {string} operator
     * @param {string} text
     * @param {boolean} [linewise]
     * @param {boolean} [blockwise]
     */
    pushText(t, r, n, a, o) {
      if (t !== "_") {
        a && n.charAt(n.length - 1) !== `
` && (n += `
`);
        var s = this.isValidRegister(t) ? this.getRegister(t) : null;
        if (!s || !t) {
          switch (r) {
            case "yank":
              this.registers[0] = new ke(n, a, o);
              break;
            case "delete":
            case "change":
              n.indexOf(`
`) == -1 ? this.registers["-"] = new ke(n, a) : (this.shiftNumericRegisters_(), this.registers[1] = new ke(n, a));
              break;
          }
          this.unnamedRegister.setText(n, a, o);
          return;
        }
        var c = ge(t);
        c ? s.pushText(n, a) : s.setText(n, a, o), t === "+" && navigator.clipboard.writeText(n), this.unnamedRegister.setText(s.toString(), a);
      }
    }
    /**
     * Gets the register named @name.  If one of @name doesn't already exist,
     * create it.  If @name is invalid, return the unnamedRegister.
     * @arg {string} [name]
     */
    getRegister(t) {
      return this.isValidRegister(t) ? (t = t.toLowerCase(), this.registers[t] || (this.registers[t] = new ke()), this.registers[t]) : this.unnamedRegister;
    }
    /**@type {{(name: any): name is string}} */
    isValidRegister(t) {
      return t && (ot(t, Q) || $.test(t));
    }
    shiftNumericRegisters_() {
      for (var t = 9; t >= 2; t--)
        this.registers[t] = this.getRegister("" + (t - 1));
    }
  }
  class Rt {
    constructor() {
      this.historyBuffer = [], this.iterator = 0, this.initialPrefix = null;
    }
    /**
     * the input argument here acts a user entered prefix for a small time
     * until we start autocompletion in which case it is the autocompleted.
     * @arg {string} input
     * @arg {boolean} up
     */
    nextMatch(t, r) {
      var n = this.historyBuffer, a = r ? -1 : 1;
      this.initialPrefix === null && (this.initialPrefix = t);
      for (var o = this.iterator + a; r ? o >= 0 : o < n.length; o += a)
        for (var s = n[o], c = 0; c <= s.length; c++)
          if (this.initialPrefix == s.substring(0, c))
            return this.iterator = o, s;
      if (o >= n.length)
        return this.iterator = n.length, this.initialPrefix;
      if (o < 0) return t;
    }
    /** @arg {string} input */
    pushInput(t) {
      var r = this.historyBuffer.indexOf(t);
      r > -1 && this.historyBuffer.splice(r, 1), t.length && this.historyBuffer.push(t);
    }
    reset() {
      this.initialPrefix = null, this.iterator = this.historyBuffer.length;
    }
  }
  var Oe = {
    /**
     * @param {string} keys
     * @param {vimKey[]} keyMap
     * @param {InputStateInterface} inputState
     * @param {string} context
     */
    matchCommand: function(e, t, r, n) {
      var a = Hr(e, t, n, r), o = a.full[0];
      if (!o)
        return a.partial.length ? {
          type: "partial",
          expectLiteralNext: a.partial.length == 1 && a.partial[0].keys.slice(-11) == "<character>"
          // langmap literal logic
        } : { type: "none" };
      if (o.keys.slice(-11) == "<character>" || o.keys.slice(-10) == "<register>") {
        var s = Wr(e);
        if (!s || s.length > 1) return { type: "clear" };
        r.selectedCharacter = s;
      }
      return { type: "full", command: o };
    },
    /**
     * @arg {CodeMirrorV} cm
     * @arg {vimState} vim
     * @arg {vimKey} command
     */
    processCommand: function(e, t, r) {
      switch (t.inputState.repeatOverride = r.repeatOverride, r.type) {
        case "motion":
          this.processMotion(e, t, r);
          break;
        case "operator":
          this.processOperator(e, t, r);
          break;
        case "operatorMotion":
          this.processOperatorMotion(e, t, r);
          break;
        case "action":
          this.processAction(e, t, r);
          break;
        case "search":
          this.processSearch(e, t, r);
          break;
        case "ex":
        case "keyToEx":
          this.processEx(e, t, r);
          break;
      }
    },
    /**
     * @arg {CodeMirrorV} cm
     * @arg {vimState} vim
     * @arg {import("./types").motionCommand|import("./types").operatorMotionCommand} command
     */
    processMotion: function(e, t, r) {
      t.inputState.motion = r.motion, t.inputState.motionArgs = /**@type {MotionArgs}*/
      Ze(r.motionArgs), this.evalInput(e, t);
    },
    /**
     * @arg {CodeMirrorV} cm
     * @arg {vimState} vim
     * @arg {import("./types").operatorCommand|import("./types").operatorMotionCommand} command
     */
    processOperator: function(e, t, r) {
      var n = t.inputState;
      if (n.operator)
        if (n.operator == r.operator) {
          n.motion = "expandToLine", n.motionArgs = { linewise: !0, repeat: 1 }, this.evalInput(e, t);
          return;
        } else
          Y(e);
      n.operator = r.operator, n.operatorArgs = Ze(r.operatorArgs), r.keys.length > 1 && (n.operatorShortcut = r.keys), r.exitVisualBlock && (t.visualBlock = !1, Fe(e)), t.visualMode && this.evalInput(e, t);
    },
    /**
     * @arg {CodeMirrorV} cm
     * @arg {vimState} vim
     * @arg {import("./types").operatorMotionCommand} command
     */
    processOperatorMotion: function(e, t, r) {
      var n = t.visualMode, a = Ze(r.operatorMotionArgs);
      a && n && a.visualLine && (t.visualLine = !0), this.processOperator(e, t, r), n || this.processMotion(e, t, r);
    },
    /**
     * @arg {CodeMirrorV} cm
     * @arg {vimState} vim
     * @arg {import("./types").actionCommand} command
     */
    processAction: function(e, t, r) {
      var n = t.inputState, a = n.getRepeat(), o = !!a, s = (
        /**@type {ActionArgs}*/
        Ze(r.actionArgs) || { repeat: 1 }
      );
      n.selectedCharacter && (s.selectedCharacter = n.selectedCharacter), r.operator && this.processOperator(e, t, r), r.motion && this.processMotion(e, t, r), (r.motion || r.operator) && this.evalInput(e, t), s.repeat = a || 1, s.repeatIsExplicit = o, s.registerName = n.registerName, Y(e), t.lastMotion = null, r.isEdit && this.recordLastEdit(t, n, r), _e[r.action](e, s, t);
    },
    /** @arg {CodeMirrorV} cm @arg {vimState} vim @arg {import("./types").searchCommand} command*/
    processSearch: function(e, t, r) {
      if (!e.getSearchCursor)
        return;
      var n = r.searchArgs.forward, a = r.searchArgs.wholeWordOnly;
      ye(e).setReversed(!n);
      var o = n ? "/" : "?", s = ye(e).getQuery(), c = e.getScrollInfo(), h = "";
      function v(b, O, N) {
        A.searchHistoryController.pushInput(b), A.searchHistoryController.reset();
        try {
          ze(e, b, O, N);
        } catch {
          D(e, "Invalid regex: " + b), Y(e);
          return;
        }
        Oe.processMotion(e, t, {
          keys: "",
          type: "motion",
          motion: "findNext",
          motionArgs: { forward: !0, toJumplist: r.searchArgs.toJumplist }
        });
      }
      function p(b) {
        e.scrollTo(c.left, c.top), v(
          b,
          !0,
          !0
          /** smartCase */
        );
        var O = A.macroModeState;
        O.isRecording && Ln(O, b);
      }
      function m() {
        return le("pcre") ? "(JavaScript regexp: set pcre)" : "(Vim regexp: set nopcre)";
      }
      function k(b, O, N) {
        var R = qe(b), U, q;
        R == "<Up>" || R == "<Down>" ? (U = R == "<Up>", q = b.target ? b.target.selectionEnd : 0, O = A.searchHistoryController.nextMatch(O, U) || "", N(O), q && b.target && (b.target.selectionEnd = b.target.selectionStart = Math.min(q, b.target.value.length))) : R && R != "<Left>" && R != "<Right>" && A.searchHistoryController.reset(), h = O, C();
      }
      function C() {
        var b;
        try {
          b = ze(
            e,
            h,
            !0,
            !0
            /** smartCase */
          );
        } catch {
        }
        b ? e.scrollIntoView(Gt(e, !n, b), 30) : (He(e), e.scrollTo(c.left, c.top));
      }
      function y(b, O, N) {
        var R = qe(b);
        R == "<Esc>" || R == "<C-c>" || R == "<C-[>" || R == "<BS>" && O == "" ? (A.searchHistoryController.pushInput(O), A.searchHistoryController.reset(), ze(e, (s == null ? void 0 : s.source) || ""), He(e), e.scrollTo(c.left, c.top), f.e_stop(b), Y(e), N(), e.focus()) : R == "<Up>" || R == "<Down>" ? f.e_stop(b) : R == "<C-u>" && (f.e_stop(b), N(""));
      }
      switch (r.searchArgs.querySrc) {
        case "prompt":
          var x = A.macroModeState;
          if (x.isPlaying) {
            let O = x.replaySearchQueries.shift();
            v(
              O || "",
              !0,
              !1
              /** smartCase */
            );
          } else
            et(e, {
              onClose: p,
              prefix: o,
              desc: me(
                "span",
                {
                  $cursor: "pointer",
                  onmousedown: function(O) {
                    O.preventDefault(), Ge("pcre", !le("pcre")), this.textContent = m(), C();
                  }
                },
                m()
              ),
              onKeyUp: k,
              onKeyDown: y
            });
          break;
        case "wordUnderCursor":
          var M = ht(e, { noSymbol: !0 }), T = !0;
          if (M || (M = ht(e, { noSymbol: !1 }), T = !1), !M) {
            D(e, "No word under cursor"), Y(e);
            return;
          }
          let b = e.getLine(M.start.line).substring(
            M.start.ch,
            M.end.ch
          );
          T && a ? b = "\\b" + b + "\\b" : b = $r(b), A.jumpList.cachedCursor = e.getCursor(), e.setCursor(M.start), v(
            b,
            !0,
            !1
            /** smartCase */
          );
          break;
      }
    },
    /**
     * @arg {CodeMirrorV} cm
     * @arg {vimState} vim
     * @arg {import("./types").exCommand | import("./types").keyToExCommand} command
     */
    processEx: function(e, t, r) {
      function n(c) {
        A.exCommandHistoryController.pushInput(c), A.exCommandHistoryController.reset(), se.processCommand(e, c), e.state.vim && Y(e), He(e);
      }
      function a(c, h, v) {
        var p = qe(c), m, k;
        (p == "<Esc>" || p == "<C-c>" || p == "<C-[>" || p == "<BS>" && h == "") && (A.exCommandHistoryController.pushInput(h), A.exCommandHistoryController.reset(), f.e_stop(c), Y(e), He(e), v(), e.focus()), p == "<Up>" || p == "<Down>" ? (f.e_stop(c), m = p == "<Up>", k = c.target ? c.target.selectionEnd : 0, h = A.exCommandHistoryController.nextMatch(h, m) || "", v(h), k && c.target && (c.target.selectionEnd = c.target.selectionStart = Math.min(k, c.target.value.length))) : p == "<C-u>" ? (f.e_stop(c), v("")) : p && p != "<Left>" && p != "<Right>" && A.exCommandHistoryController.reset();
      }
      function o(c, h) {
        var v = new f.StringStream(h), p = (
          /**@type{import("./types").exCommandArgs}*/
          {}
        );
        try {
          if (se.parseInput_(e, v, p), p.commandName != "s") {
            He(e);
            return;
          }
          var m = se.matchCommand_(p.commandName);
          if (!m || (se.parseCommandArgs_(v, p, m), !p.argString)) return;
          var k = Xt(p.argString.slice(1), !0, !0);
          k && pt(e, k);
        } catch {
        }
      }
      if (r.type == "keyToEx")
        se.processCommand(e, r.exArgs.input);
      else {
        var s = {
          onClose: n,
          onKeyDown: a,
          onKeyUp: o,
          prefix: ":"
        };
        t.visualMode && (s.value = "'<,'>", s.selectValueOnOpen = !1), et(e, s);
      }
    },
    /**@arg {CodeMirrorV} cm   @arg {vimState} vim */
    evalInput: function(e, t) {
      var r = t.inputState, n = r.motion, a = r.motionArgs || { repeat: 1 }, o = r.operator, s = r.operatorArgs || {}, c = r.registerName, h = t.sel, v = V(t.visualMode ? re(e, h.head) : e.getCursor("head")), p = V(t.visualMode ? re(e, h.anchor) : e.getCursor("anchor")), m = V(v), k = V(p), C, y, x;
      if (o && this.recordLastEdit(t, r), r.repeatOverride !== void 0 ? x = r.repeatOverride : x = r.getRepeat(), x > 0 && a.explicitRepeat ? a.repeatIsExplicit = !0 : (a.noRepeat || !a.explicitRepeat && x === 0) && (x = 1, a.repeatIsExplicit = !1), r.selectedCharacter && (a.selectedCharacter = s.selectedCharacter = r.selectedCharacter), a.repeat = x, Y(e), n) {
        var M = we[n](e, v, a, t, r);
        if (t.lastMotion = we[n], !M)
          return;
        if (a.toJumplist) {
          var T = A.jumpList, b = T.cachedCursor;
          b ? (_t(e, b, M), delete T.cachedCursor) : _t(e, v, M);
        }
        M instanceof Array ? (y = M[0], C = M[1]) : C = M, C || (C = V(v)), t.visualMode ? (t.visualBlock && C.ch === 1 / 0 || (C = re(e, C, m)), y && (y = re(e, y)), y = y || k, h.anchor = y, h.head = C, Fe(e), be(
          e,
          t,
          "<",
          J(y, C) ? y : C
        ), be(
          e,
          t,
          ">",
          J(y, C) ? C : y
        )) : o || (C = re(e, C, m), e.setCursor(C.line, C.ch));
      }
      if (o) {
        if (s.lastSel) {
          y = k;
          var O = s.lastSel, N = Math.abs(O.head.line - O.anchor.line), R = Math.abs(O.head.ch - O.anchor.ch);
          O.visualLine ? C = new i(k.line + N, k.ch) : O.visualBlock ? C = new i(k.line + N, k.ch + R) : O.head.line == O.anchor.line ? C = new i(k.line, k.ch + R) : C = new i(k.line + N, k.ch), t.visualMode = !0, t.visualLine = O.visualLine, t.visualBlock = O.visualBlock, h = t.sel = {
            anchor: y,
            head: C
          }, Fe(e);
        } else t.visualMode && (s.lastSel = {
          anchor: V(h.anchor),
          head: V(h.head),
          visualBlock: t.visualBlock,
          visualLine: t.visualLine
        });
        var U, q, K, E, W;
        if (t.visualMode) {
          U = ne(h.head, h.anchor), q = Ae(h.head, h.anchor), K = t.visualLine || s.linewise, E = t.visualBlock ? "block" : K ? "line" : "char";
          var de = l(e, U, q);
          if (W = ct(e, {
            anchor: de.start,
            head: de.end
          }, E), K) {
            var ee = W.ranges;
            if (E == "block")
              for (var pe = 0; pe < ee.length; pe++)
                ee[pe].head.ch = te(e, ee[pe].head.line);
            else E == "line" && (ee[0].head = new i(ee[0].head.line + 1, 0));
          }
        } else {
          if (U = V(y || k), q = V(C || m), J(q, U)) {
            var Re = U;
            U = q, q = Re;
          }
          K = a.linewise || s.linewise, K ? Xr(e, U, q) : a.forward && Jr(e, U, q), E = "char";
          var An = !a.inclusive || K, de = l(e, U, q);
          W = ct(e, {
            anchor: de.start,
            head: de.end
          }, E, An);
        }
        e.setSelections(W.ranges, W.primary), t.lastMotion = null, s.repeat = x, s.registerName = c, s.linewise = K;
        var mt = ut[o](
          e,
          s,
          W.ranges,
          k,
          C
        );
        t.visualMode && xe(e, mt != null), mt && e.setCursor(mt);
      }
    },
    /**@arg {vimState} vim  @arg {InputStateInterface} inputState, @arg {import("./types").actionCommand} [actionCommand] */
    recordLastEdit: function(e, t, r) {
      var n = A.macroModeState;
      n.isPlaying || (e.lastEditInputState = t, e.lastEditActionCommand = r, n.lastInsertModeChanges.changes = [], n.lastInsertModeChanges.expectCursorActivityForChange = !1, n.lastInsertModeChanges.visualBlock = e.visualBlock ? e.sel.head.line - e.sel.anchor.line : 0);
    }
  }, we = {
    moveToTopLine: function(e, t, r) {
      var n = vt(e).top + r.repeat - 1;
      return new i(n, Se(e.getLine(n)));
    },
    moveToMiddleLine: function(e) {
      var t = vt(e), r = Math.floor((t.top + t.bottom) * 0.5);
      return new i(r, Se(e.getLine(r)));
    },
    moveToBottomLine: function(e, t, r) {
      var n = vt(e).bottom - r.repeat + 1;
      return new i(n, Se(e.getLine(n)));
    },
    expandToLine: function(e, t, r) {
      var n = t;
      return new i(n.line + r.repeat - 1, 1 / 0);
    },
    findNext: function(e, t, r) {
      var n = ye(e), a = n.getQuery();
      if (a) {
        var o = !r.forward;
        o = n.isReversed() ? !o : o, pt(e, a);
        var s = Gt(e, o, a, r.repeat);
        return s || D(e, "No match found " + a + (le("pcre") ? " (set nopcre to use Vim regexps)" : "")), s;
      }
    },
    /**
     * Find and select the next occurrence of the search query. If the cursor is currently
     * within a match, then find and select the current match. Otherwise, find the next occurrence in the
     * appropriate direction.
     *
     * This differs from `findNext` in the following ways:
     *
     * 1. Instead of only returning the "from", this returns a "from", "to" range.
     * 2. If the cursor is currently inside a search match, this selects the current match
     *    instead of the next match.
     * 3. If there is no associated operator, this will turn on visual mode.
     */
    findAndSelectNextInclusive: function(e, t, r, n, a) {
      var o = ye(e), s = o.getQuery();
      if (s) {
        var c = !r.forward;
        c = o.isReversed() ? !c : c;
        var h = vn(e, c, s, r.repeat, n);
        if (h) {
          if (a.operator)
            return h;
          var v = h[0], p = new i(h[1].line, h[1].ch - 1);
          if (n.visualMode) {
            (n.visualLine || n.visualBlock) && (n.visualLine = !1, n.visualBlock = !1, f.signal(e, "vim-mode-change", { mode: "visual", subMode: "" }));
            var m = n.sel.anchor;
            if (m)
              return o.isReversed() ? r.forward ? [m, v] : [m, p] : r.forward ? [m, p] : [m, v];
          } else
            n.visualMode = !0, n.visualLine = !1, n.visualBlock = !1, f.signal(e, "vim-mode-change", { mode: "visual", subMode: "" });
          return c ? [p, v] : [v, p];
        }
      }
    },
    goToMark: function(e, t, r, n) {
      var a = tt(e, n, r.selectedCharacter || "");
      return a ? r.linewise ? { line: a.line, ch: Se(e.getLine(a.line)) } : a : null;
    },
    moveToOtherHighlightedEnd: function(e, t, r, n) {
      var a = n.sel;
      return n.visualBlock && r.sameLine ? [
        re(e, new i(a.anchor.line, a.head.ch)),
        re(e, new i(a.head.line, a.anchor.ch))
      ] : [a.head, a.anchor];
    },
    jumpToMark: function(e, t, r, n) {
      for (var a = t, o = 0; o < r.repeat; o++) {
        var s = a;
        for (var c in n.marks)
          if (ae(c)) {
            var h = n.marks[c].find(), v = r.forward ? (
              // @ts-ignore
              J(h, s)
            ) : J(s, h);
            if (!v && !(r.linewise && h.line == s.line)) {
              var p = he(s, a), m = r.forward ? (
                // @ts-ignore
                Nt(s, h, a)
              ) : (
                // @ts-ignore
                Nt(a, h, s)
              );
              (p || m) && (a = h);
            }
          }
      }
      return r.linewise && (a = new i(a.line, Se(e.getLine(a.line)))), a;
    },
    moveByCharacters: function(e, t, r) {
      var n = t, a = r.repeat, o = r.forward ? n.ch + a : n.ch - a;
      return new i(n.line, o);
    },
    moveByLines: function(e, t, r, n) {
      var a = t, o = a.ch;
      switch (n.lastMotion) {
        case this.moveByLines:
        case this.moveByDisplayLines:
        case this.moveByScroll:
        case this.moveToColumn:
        case this.moveToEol:
          o = n.lastHPos;
          break;
        default:
          n.lastHPos = o;
      }
      var s = r.repeat + (r.repeatOffset || 0), c = r.forward ? a.line + s : a.line - s, h = e.firstLine(), v = e.lastLine(), p = e.findPosV(a, r.forward ? s : -s, "line", n.lastHSPos), m = r.forward ? p.line > c : p.line < c;
      return m && (c = p.line, o = p.ch), c < h && a.line == h ? this.moveToStartOfLine(e, t, r, n) : c > v && a.line == v ? Wt(e, t, r, n, !0) : (r.toFirstChar && (o = Se(e.getLine(c)), n.lastHPos = o), n.lastHSPos = e.charCoords(new i(c, o), "div").left, new i(c, o));
    },
    moveByDisplayLines: function(e, t, r, n) {
      var a = t;
      switch (n.lastMotion) {
        case this.moveByDisplayLines:
        case this.moveByScroll:
        case this.moveByLines:
        case this.moveToColumn:
        case this.moveToEol:
          break;
        default:
          n.lastHSPos = e.charCoords(a, "div").left;
      }
      var o = r.repeat, s = e.findPosV(a, r.forward ? o : -o, "line", n.lastHSPos);
      if (s.hitSide)
        if (r.forward) {
          var c = e.charCoords(s, "div"), h = { top: c.top + 8, left: n.lastHSPos };
          s = e.coordsChar(h, "div");
        } else {
          var v = e.charCoords(new i(e.firstLine(), 0), "div");
          v.left = n.lastHSPos, s = e.coordsChar(v, "div");
        }
      return n.lastHPos = s.ch, s;
    },
    moveByPage: function(e, t, r) {
      var n = t, a = r.repeat;
      return e.findPosV(n, r.forward ? a : -a, "page");
    },
    moveByParagraph: function(e, t, r) {
      var n = r.forward ? 1 : -1;
      return $t(e, t, r.repeat, n).start;
    },
    moveBySentence: function(e, t, r) {
      var n = r.forward ? 1 : -1;
      return nn(e, t, r.repeat, n);
    },
    moveByScroll: function(e, t, r, n) {
      var a = e.getScrollInfo(), o = null, s = r.repeat;
      s || (s = a.clientHeight / (2 * e.defaultTextHeight()));
      var c = e.charCoords(t, "local");
      if (r.repeat = s, o = we.moveByDisplayLines(e, t, r, n), !o)
        return null;
      var h = e.charCoords(o, "local");
      return e.scrollTo(null, a.top + h.top - c.top), o;
    },
    moveByWords: function(e, t, r) {
      return en(
        e,
        t,
        r.repeat,
        !!r.forward,
        !!r.wordEnd,
        !!r.bigWord
      );
    },
    moveTillCharacter: function(e, t, r) {
      var n = r.repeat, a = dt(
        e,
        n,
        r.forward,
        r.selectedCharacter,
        t
      ), o = r.forward ? -1 : 1;
      return Ft(o, r), a ? (a.ch += o, a) : null;
    },
    moveToCharacter: function(e, t, r) {
      var n = r.repeat;
      return Ft(0, r), dt(
        e,
        n,
        r.forward,
        r.selectedCharacter,
        t
      ) || t;
    },
    moveToSymbol: function(e, t, r) {
      var n = r.repeat;
      return r.selectedCharacter && Zr(
        e,
        n,
        r.forward,
        r.selectedCharacter
      ) || t;
    },
    moveToColumn: function(e, t, r, n) {
      var a = r.repeat;
      return n.lastHPos = a - 1, n.lastHSPos = e.charCoords(t, "div").left, tn(e, a);
    },
    moveToEol: function(e, t, r, n) {
      return Wt(e, t, r, n, !1);
    },
    moveToFirstNonWhiteSpaceCharacter: function(e, t) {
      var r = t;
      return new i(
        r.line,
        Se(e.getLine(r.line))
      );
    },
    moveToMatchedSymbol: function(e, t) {
      for (var r = t, n = r.line, a = r.ch, o = e.getLine(n), s; a < o.length; a++)
        if (s = o.charAt(a), s && ce(s)) {
          var c = e.getTokenTypeAt(new i(n, a + 1));
          if (c !== "string" && c !== "comment")
            break;
        }
      if (a < o.length) {
        var h = s === "<" || s === ">" ? /[(){}[\]<>]/ : /[(){}[\]]/, v = e.findMatchingBracket(new i(n, a), { bracketRegex: h });
        return v.to;
      } else
        return r;
    },
    moveToStartOfLine: function(e, t) {
      return new i(t.line, 0);
    },
    moveToLineOrEdgeOfDocument: function(e, t, r) {
      var n = r.forward ? e.lastLine() : e.firstLine();
      return r.repeatIsExplicit && (n = r.repeat - e.getOption("firstLineNumber")), new i(
        n,
        Se(e.getLine(n))
      );
    },
    moveToStartOfDisplayLine: function(e) {
      return e.execCommand("goLineLeft"), e.getCursor();
    },
    moveToEndOfDisplayLine: function(e) {
      e.execCommand("goLineRight");
      var t = e.getCursor();
      return t.sticky == "before" && t.ch--, t;
    },
    textObjectManipulation: function(e, t, r, n) {
      var a = {
        "(": ")",
        ")": "(",
        "{": "}",
        "}": "{",
        "[": "]",
        "]": "[",
        "<": ">",
        ">": "<"
      }, o = { "'": !0, '"': !0, "`": !0 }, s = r.selectedCharacter || "";
      s == "b" ? s = "(" : s == "B" && (s = "{");
      var c = !r.textObjectInner, h, v;
      if (a[s]) {
        if (v = !0, h = Ut(e, t, s, c), !h) {
          var p = e.getSearchCursor(new RegExp("\\" + s, "g"), t);
          p.find() && (h = Ut(e, p.from(), s, c));
        }
      } else if (o[s])
        v = !0, h = an(e, t, s, c);
      else if (s === "W" || s === "w")
        for (var m = r.repeat || 1; m-- > 0; ) {
          var k = ht(e, {
            inclusive: c,
            innerWord: !c,
            bigWord: s === "W",
            noSymbol: s === "W",
            multiline: !0
          }, h && h.end);
          k && (h || (h = k), h.end = k.end);
        }
      else if (s === "p")
        if (h = $t(e, t, r.repeat, 0, c), r.linewise = !0, n.visualMode)
          n.visualLine || (n.visualLine = !0);
        else {
          var C = n.inputState.operatorArgs;
          C && (C.linewise = !0), h.end.line--;
        }
      else if (s === "t")
        h = Gr(e, t, c);
      else if (s === "s") {
        var y = e.getLine(t.line);
        t.ch > 0 && Be(y[t.ch]) && (t.ch -= 1);
        var x = jt(e, t, r.repeat, 1, c), M = jt(e, t, r.repeat, -1, c);
        Z(e.getLine(M.line)[M.ch]) && Z(e.getLine(x.line)[x.ch - 1]) && (M = { line: M.line, ch: M.ch + 1 }), h = { start: M, end: x };
      }
      return h ? e.state.vim.visualMode ? qr(e, h.start, h.end, v) : [h.start, h.end] : null;
    },
    repeatLastCharacterSearch: function(e, t, r) {
      var n = A.lastCharacterSearch, a = r.repeat, o = r.forward === n.forward, s = (n.increment ? 1 : 0) * (o ? -1 : 1);
      e.moveH(-s, "char"), r.inclusive = !!o;
      var c = dt(e, a, o, n.selectedCharacter);
      return c ? (c.ch += s, c) : (e.moveH(s, "char"), t);
    }
  };
  function Dr(e, t) {
    we[e] = t;
  }
  function It(e, t) {
    for (var r = [], n = 0; n < t; n++)
      r.push(e);
    return r;
  }
  var ut = {
    change: function(e, t, r) {
      var n, a, o = e.state.vim, s = r[0].anchor, c = r[0].head;
      if (o.visualMode)
        if (t.fullLine)
          c.ch = Number.MAX_VALUE, c.line--, e.setSelection(s, c), a = e.getSelection(), e.replaceSelection(""), n = s;
        else {
          a = e.getSelection();
          var p = It("", r.length);
          e.replaceSelections(p), n = ne(r[0].head, r[0].anchor);
        }
      else {
        a = e.getRange(s, c);
        var h = o.lastEditInputState;
        if ((h == null ? void 0 : h.motion) == "moveByWords" && !Z(a)) {
          var v = /\s+$/.exec(a);
          v && h.motionArgs && h.motionArgs.forward && (c = G(c, 0, -v[0].length), a = a.slice(0, -v[0].length));
        }
        t.linewise && (s = new i(s.line, Se(e.getLine(s.line))), c.line > s.line && (c = new i(c.line - 1, Number.MAX_VALUE))), e.replaceRange("", s, c), n = s;
      }
      A.registerController.pushText(
        t.registerName,
        "change",
        a,
        t.linewise,
        r.length > 1
      ), _e.enterInsertMode(e, { head: n }, e.state.vim);
    },
    delete: function(e, t, r) {
      var n, a, o = e.state.vim;
      if (o.visualBlock) {
        a = e.getSelection();
        var h = It("", r.length);
        e.replaceSelections(h), n = ne(r[0].head, r[0].anchor);
      } else {
        var s = r[0].anchor, c = r[0].head;
        t.linewise && c.line != e.firstLine() && s.line == e.lastLine() && s.line == c.line - 1 && (s.line == e.firstLine() ? s.ch = 0 : s = new i(s.line - 1, te(e, s.line - 1))), a = e.getRange(s, c), e.replaceRange("", s, c), n = s, t.linewise && (n = we.moveToFirstNonWhiteSpaceCharacter(e, s));
      }
      return A.registerController.pushText(
        t.registerName,
        "delete",
        a,
        t.linewise,
        o.visualBlock
      ), re(e, n);
    },
    indent: function(e, t, r) {
      var n = e.state.vim, a = n.visualMode && t.repeat || 1;
      if (n.visualBlock) {
        for (var o = e.getOption("tabSize"), s = e.getOption("indentWithTabs") ? "	" : " ".repeat(o), c, h = r.length - 1; h >= 0; h--)
          if (c = ne(r[h].anchor, r[h].head), t.indentRight)
            e.replaceRange(s.repeat(a), c, c);
          else {
            for (var v = e.getLine(c.line), p = 0, m = 0; m < a; m++) {
              var k = v[c.ch + p];
              if (k == "	")
                p++;
              else if (k == " ") {
                p++;
                for (var C = 1; C < s.length && (k = v[c.ch + p], k === " "); C++)
                  p++;
              } else
                break;
            }
            e.replaceRange("", c, G(c, 0, p));
          }
        return c;
      } else if (e.indentMore)
        for (var m = 0; m < a; m++)
          t.indentRight ? e.indentMore() : e.indentLess();
      else {
        var y = r[0].anchor.line, x = n.visualBlock ? r[r.length - 1].anchor.line : r[0].head.line;
        t.linewise && x--;
        for (var h = y; h <= x; h++)
          for (var m = 0; m < a; m++)
            e.indentLine(h, t.indentRight);
      }
      return we.moveToFirstNonWhiteSpaceCharacter(e, r[0].anchor);
    },
    indentAuto: function(e, t, r) {
      return e.execCommand("indentAuto"), we.moveToFirstNonWhiteSpaceCharacter(e, r[0].anchor);
    },
    hardWrap: function(e, t, r, n) {
      if (e.hardWrap) {
        var a = r[0].anchor.line, o = r[0].head.line;
        t.linewise && o--;
        var s = e.hardWrap({ from: a, to: o });
        return s > a && t.linewise && s--, t.keepCursor ? n : new i(s, 0);
      }
    },
    changeCase: function(e, t, r, n, a) {
      for (var o = e.getSelections(), s = [], c = t.toLower, h = 0; h < o.length; h++) {
        var v = o[h], p = "";
        if (c === !0)
          p = v.toLowerCase();
        else if (c === !1)
          p = v.toUpperCase();
        else
          for (var m = 0; m < v.length; m++) {
            var k = v.charAt(m);
            p += ge(k) ? k.toLowerCase() : k.toUpperCase();
          }
        s.push(p);
      }
      return e.replaceSelections(s), t.shouldMoveCursor ? a : !e.state.vim.visualMode && t.linewise && r[0].anchor.line + 1 == r[0].head.line ? we.moveToFirstNonWhiteSpaceCharacter(e, n) : t.linewise ? n : ne(r[0].anchor, r[0].head);
    },
    yank: function(e, t, r, n) {
      var a = e.state.vim, o = e.getSelection(), s = a.visualMode ? ne(a.sel.anchor, a.sel.head, r[0].head, r[0].anchor) : n;
      return A.registerController.pushText(
        t.registerName,
        "yank",
        o,
        t.linewise,
        a.visualBlock
      ), s;
    },
    rot13: function(e, t, r, n, a) {
      for (var o = e.getSelections(), s = [], c = 0; c < o.length; c++) {
        const h = o[c].split("").map((v) => {
          const p = v.charCodeAt(0);
          return p >= 65 && p <= 90 ? String.fromCharCode(65 + (p - 65 + 13) % 26) : p >= 97 && p <= 122 ? String.fromCharCode(97 + (p - 97 + 13) % 26) : v;
        }).join("");
        s.push(h);
      }
      return e.replaceSelections(s), t.shouldMoveCursor ? a : !e.state.vim.visualMode && t.linewise && r[0].anchor.line + 1 == r[0].head.line ? we.moveToFirstNonWhiteSpaceCharacter(e, n) : t.linewise ? n : ne(r[0].anchor, r[0].head);
    }
  };
  function _r(e, t) {
    ut[e] = t;
  }
  var _e = {
    jumpListWalk: function(e, t, r) {
      if (!r.visualMode) {
        var n = t.repeat || 1, a = t.forward, o = A.jumpList, s = o.move(e, a ? n : -n), c = s ? s.find() : void 0;
        c = c || e.getCursor(), e.setCursor(c);
      }
    },
    scroll: function(e, t, r) {
      if (!r.visualMode) {
        var n = t.repeat || 1, a = e.defaultTextHeight(), o = e.getScrollInfo().top, s = a * n, c = t.forward ? o + s : o - s, h = V(e.getCursor()), v = e.charCoords(h, "local");
        if (t.forward)
          c > v.top ? (h.line += (c - v.top) / a, h.line = Math.ceil(h.line), e.setCursor(h), v = e.charCoords(h, "local"), e.scrollTo(null, v.top)) : e.scrollTo(null, c);
        else {
          var p = c + e.getScrollInfo().clientHeight;
          p < v.bottom ? (h.line -= (v.bottom - p) / a, h.line = Math.floor(h.line), e.setCursor(h), v = e.charCoords(h, "local"), e.scrollTo(
            null,
            v.bottom - e.getScrollInfo().clientHeight
          )) : e.scrollTo(null, c);
        }
      }
    },
    scrollToCursor: function(e, t) {
      var r = e.getCursor().line, n = e.charCoords(new i(r, 0), "local"), a = e.getScrollInfo().clientHeight, o = n.top;
      switch (t.position) {
        case "center":
          o = n.bottom - a / 2;
          break;
        case "bottom":
          var s = new i(r, e.getLine(r).length - 1), c = e.charCoords(s, "local"), h = c.bottom - o;
          o = o - a + h;
          break;
      }
      e.scrollTo(null, o);
    },
    replayMacro: function(e, t, r) {
      var n = t.selectedCharacter || "", a = t.repeat || 1, o = A.macroModeState;
      for (n == "@" ? n = o.latestRegister || "" : o.latestRegister = n; a--; )
        xn(e, r, o, n);
    },
    enterMacroRecordMode: function(e, t) {
      var r = A.macroModeState, n = t.selectedCharacter;
      A.registerController.isValidRegister(n) && r.enterMacroRecordMode(e, n);
    },
    toggleOverwrite: function(e) {
      e.state.overwrite ? (e.toggleOverwrite(!1), e.setOption("keyMap", "vim-insert"), f.signal(e, "vim-mode-change", { mode: "insert" })) : (e.toggleOverwrite(!0), e.setOption("keyMap", "vim-replace"), f.signal(e, "vim-mode-change", { mode: "replace" }));
    },
    enterInsertMode: function(e, t, r) {
      if (!e.getOption("readOnly")) {
        r.insertMode = !0, r.insertModeRepeat = t && t.repeat || 1;
        var n = t ? t.insertAt : null, a = r.sel, o = t.head || e.getCursor("head"), s = e.listSelections().length;
        if (n == "eol")
          o = new i(o.line, te(e, o.line));
        else if (n == "bol")
          o = new i(o.line, 0);
        else if (n == "charAfter") {
          var c = l(e, o, G(o, 0, 1));
          o = c.end;
        } else if (n == "firstNonBlank") {
          var c = l(e, o, we.moveToFirstNonWhiteSpaceCharacter(e, o));
          o = c.end;
        } else if (n == "startOfSelectedArea") {
          if (!r.visualMode)
            return;
          r.visualBlock ? (o = new i(
            Math.min(a.head.line, a.anchor.line),
            Math.min(a.head.ch, a.anchor.ch)
          ), s = Math.abs(a.head.line - a.anchor.line) + 1) : a.head.line < a.anchor.line ? o = a.head : o = new i(a.anchor.line, 0);
        } else if (n == "endOfSelectedArea") {
          if (!r.visualMode)
            return;
          r.visualBlock ? (o = new i(
            Math.min(a.head.line, a.anchor.line),
            Math.max(a.head.ch, a.anchor.ch) + 1
          ), s = Math.abs(a.head.line - a.anchor.line) + 1) : a.head.line >= a.anchor.line ? o = G(a.head, 0, 1) : o = new i(a.anchor.line, 0);
        } else if (n == "inplace") {
          if (r.visualMode)
            return;
        } else n == "lastEdit" && (o = Yt(e) || o);
        e.setOption("disableInput", !1), t && t.replace ? (e.toggleOverwrite(!0), e.setOption("keyMap", "vim-replace"), f.signal(e, "vim-mode-change", { mode: "replace" })) : (e.toggleOverwrite(!1), e.setOption("keyMap", "vim-insert"), f.signal(e, "vim-mode-change", { mode: "insert" })), A.macroModeState.isPlaying || (e.on("change", er), r.insertEnd && r.insertEnd.clear(), r.insertEnd = e.setBookmark(o, { insertLeft: !0 }), f.on(e.getInputField(), "keydown", nr)), r.visualMode && xe(e), Kt(e, o, s);
      }
    },
    toggleVisualMode: function(e, t, r) {
      var n = t.repeat, a = e.getCursor(), o;
      if (r.visualMode)
        r.visualLine != !!t.linewise || r.visualBlock != !!t.blockwise ? (r.visualLine = !!t.linewise, r.visualBlock = !!t.blockwise, f.signal(e, "vim-mode-change", { mode: "visual", subMode: r.visualLine ? "linewise" : r.visualBlock ? "blockwise" : "" }), Fe(e)) : xe(e);
      else {
        r.visualMode = !0, r.visualLine = !!t.linewise, r.visualBlock = !!t.blockwise, o = re(
          e,
          new i(a.line, a.ch + n - 1)
        );
        var s = l(e, a, o);
        r.sel = {
          anchor: s.start,
          head: s.end
        }, f.signal(e, "vim-mode-change", { mode: "visual", subMode: r.visualLine ? "linewise" : r.visualBlock ? "blockwise" : "" }), Fe(e), be(e, r, "<", ne(a, o)), be(e, r, ">", Ae(a, o));
      }
    },
    reselectLastSelection: function(e, t, r) {
      var n = r.lastSelection;
      if (r.visualMode && Dt(e, r), n) {
        var a = n.anchorMark.find(), o = n.headMark.find();
        if (!a || !o)
          return;
        r.sel = {
          anchor: a,
          head: o
        }, r.visualMode = !0, r.visualLine = n.visualLine, r.visualBlock = n.visualBlock, Fe(e), be(e, r, "<", ne(a, o)), be(e, r, ">", Ae(a, o)), f.signal(e, "vim-mode-change", {
          mode: "visual",
          subMode: r.visualLine ? "linewise" : r.visualBlock ? "blockwise" : ""
        });
      }
    },
    joinLines: function(e, t, r) {
      var n, a;
      if (r.visualMode) {
        if (n = e.getCursor("anchor"), a = e.getCursor("head"), J(a, n)) {
          var o = a;
          a = n, n = o;
        }
        a.ch = te(e, a.line) - 1;
      } else {
        var s = Math.max(t.repeat, 2);
        n = e.getCursor(), a = re(e, new i(
          n.line + s - 1,
          1 / 0
        ));
      }
      for (var c = 0, h = n.line; h < a.line; h++) {
        c = te(e, n.line);
        var v = "", p = 0;
        if (!t.keepSpaces) {
          var m = e.getLine(n.line + 1);
          p = m.search(/\S/), p == -1 ? p = m.length : v = " ";
        }
        e.replaceRange(
          v,
          new i(n.line, c),
          new i(n.line + 1, p)
        );
      }
      var k = re(e, new i(n.line, c));
      r.visualMode && xe(e, !1), e.setCursor(k);
    },
    newLineAndEnterInsertMode: function(e, t, r) {
      r.insertMode = !0;
      var n = V(e.getCursor());
      if (n.line === e.firstLine() && !t.after)
        e.replaceRange(`
`, new i(e.firstLine(), 0)), e.setCursor(e.firstLine(), 0);
      else {
        n.line = t.after ? n.line : n.line - 1, n.ch = te(e, n.line), e.setCursor(n);
        var a = f.commands.newlineAndIndentContinueComment || f.commands.newlineAndIndent;
        a(e);
      }
      this.enterInsertMode(e, { repeat: t.repeat }, r);
    },
    paste: function(e, t, r) {
      var n = A.registerController.getRegister(
        t.registerName
      );
      if (t.registerName === "+")
        navigator.clipboard.readText().then((o) => {
          this.continuePaste(e, t, r, o, n);
        });
      else {
        var a = n.toString();
        this.continuePaste(e, t, r, a, n);
      }
    },
    continuePaste: function(e, t, r, n, a) {
      var o = V(e.getCursor());
      if (n) {
        if (t.matchIndent) {
          var s = e.getOption("tabSize"), c = function(ee) {
            var pe = ee.split("	").length - 1, Re = ee.split(" ").length - 1;
            return pe * s + Re * 1;
          }, h = e.getLine(e.getCursor().line), v = c(h.match(/^\s*/)[0]), p = n.replace(/\n$/, ""), m = n !== p, k = c(n.match(/^\s*/)[0]), n = p.replace(/^\s*/gm, function(ee) {
            var pe = v + (c(ee) - k);
            if (pe < 0)
              return "";
            if (e.getOption("indentWithTabs")) {
              var Re = Math.floor(pe / s);
              return Array(Re + 1).join("	");
            } else
              return Array(pe + 1).join(" ");
          });
          n += m ? `
` : "";
        }
        t.repeat > 1 && (n = Array(t.repeat + 1).join(n));
        var C = a.linewise, y = a.blockwise, x = y ? n.split(`
`) : void 0;
        if (x) {
          C && x.pop();
          for (var M = 0; M < x.length; M++)
            x[M] = x[M] == "" ? " " : x[M];
          o.ch += t.after ? 1 : 0, o.ch = Math.min(te(e, o.line), o.ch);
        } else C ? r.visualMode ? n = r.visualLine ? n.slice(0, -1) : `
` + n.slice(0, n.length - 1) + `
` : t.after ? (n = `
` + n.slice(0, n.length - 1), o.ch = te(e, o.line)) : o.ch = 0 : o.ch += t.after ? 1 : 0;
        var T;
        if (r.visualMode) {
          r.lastPastedText = n;
          var b, O = Qr(e), N = O[0], R = O[1], U = e.getSelection(), q = e.listSelections(), K = new Array(q.length).join("1").split("1");
          r.lastSelection && (b = r.lastSelection.headMark.find()), A.registerController.unnamedRegister.setText(U), y ? (e.replaceSelections(K), R = new i(N.line + n.length - 1, N.ch), e.setCursor(N), Pt(e, R), e.replaceSelections(n), T = N) : r.visualBlock ? (e.replaceSelections(K), e.setCursor(N), e.replaceRange(n, N, N), T = N) : (e.replaceRange(n, N, R), T = e.posFromIndex(e.indexFromPos(N) + n.length - 1)), b && (r.lastSelection.headMark = e.setBookmark(b)), C && (T.ch = 0);
        } else if (y && x) {
          e.setCursor(o);
          for (var M = 0; M < x.length; M++) {
            var E = o.line + M;
            E > e.lastLine() && e.replaceRange(`
`, new i(E, 0));
            var W = te(e, E);
            W < o.ch && jr(e, E, o.ch);
          }
          e.setCursor(o), Pt(e, new i(o.line + x.length - 1, o.ch)), e.replaceSelections(x), T = o;
        } else if (e.replaceRange(n, o), C) {
          var E = t.after ? o.line + 1 : o.line;
          T = new i(E, Se(e.getLine(E)));
        } else
          T = V(o), /\n/.test(n) || (T.ch += n.length - (t.after ? 1 : 0));
        r.visualMode && xe(e, !1), e.setCursor(T);
      }
    },
    undo: function(e, t) {
      e.operation(function() {
        Bt(e, f.commands.undo, t.repeat)(), e.setCursor(re(e, e.getCursor("start")));
      });
    },
    redo: function(e, t) {
      Bt(e, f.commands.redo, t.repeat)();
    },
    setRegister: function(e, t, r) {
      r.inputState.registerName = t.selectedCharacter;
    },
    insertRegister: function(e, t, r) {
      var n = t.selectedCharacter, a = A.registerController.getRegister(n), o = a && a.toString();
      o && e.replaceSelection(o);
    },
    oneNormalCommand: function(e, t, r) {
      Te(e, !0), r.insertModeReturn = !0, f.on(e, "vim-command-done", function n() {
        r.visualMode || (r.insertModeReturn && (r.insertModeReturn = !1, r.insertMode || _e.enterInsertMode(e, {}, r)), f.off(e, "vim-command-done", n));
      });
    },
    setMark: function(e, t, r) {
      var n = t.selectedCharacter;
      n && be(e, r, n, e.getCursor());
    },
    replace: function(e, t, r) {
      var n = t.selectedCharacter || "", a = e.getCursor(), o, s, c = e.listSelections();
      if (r.visualMode)
        a = e.getCursor("start"), s = e.getCursor("end");
      else {
        var h = e.getLine(a.line);
        o = a.ch + t.repeat, o > h.length && (o = h.length), s = new i(a.line, o);
      }
      var v = l(e, a, s);
      if (a = v.start, s = v.end, n == `
`)
        r.visualMode || e.replaceRange("", a, s), (f.commands.newlineAndIndentContinueComment || f.commands.newlineAndIndent)(e);
      else {
        var p = e.getRange(a, s);
        if (p = p.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, n), p = p.replace(/[^\n]/g, n), r.visualBlock) {
          var m = new Array(e.getOption("tabSize") + 1).join(" ");
          p = e.getSelection(), p = p.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, n);
          var k = p.replace(/\t/g, m).replace(/[^\n]/g, n).split(`
`);
          e.replaceSelections(k);
        } else
          e.replaceRange(p, a, s);
        r.visualMode ? (a = J(c[0].anchor, c[0].head) ? c[0].anchor : c[0].head, e.setCursor(a), xe(e, !1)) : e.setCursor(G(s, 0, -1));
      }
    },
    incrementNumberToken: function(e, t) {
      for (var r = e.getCursor(), n = e.getLine(r.line), a = /(-?)(?:(0x)([\da-f]+)|(0b|0|)(\d+))/gi, o, s, c, h; (o = a.exec(n)) !== null && (s = o.index, c = s + o[0].length, !(r.ch < c)); )
        ;
      if (!(!t.backtrack && c <= r.ch)) {
        if (o) {
          var v = o[2] || o[4], p = o[3] || o[5], m = t.increase ? 1 : -1, k = { "0b": 2, 0: 8, "": 10, "0x": 16 }[v.toLowerCase()], C = parseInt(o[1] + p, k) + m * t.repeat;
          h = C.toString(k);
          var y = v ? new Array(p.length - h.length + 1 + o[1].length).join("0") : "";
          h.charAt(0) === "-" ? h = "-" + v + y + h.substr(1) : h = v + y + h;
          var x = new i(r.line, s), M = new i(r.line, c);
          e.replaceRange(h, x, M);
        } else
          return;
        e.setCursor(new i(r.line, s + h.length - 1));
      }
    },
    repeatLastEdit: function(e, t, r) {
      var n = r.lastEditInputState;
      if (n) {
        var a = t.repeat;
        a && t.repeatIsExplicit ? n.repeatOverride = a : a = n.repeatOverride || a, ir(
          e,
          r,
          a,
          !1
          /** repeatForInsert */
        );
      }
    },
    indent: function(e, t) {
      e.indentLine(e.getCursor().line, t.indentRight);
    },
    exitInsertMode: function(e, t) {
      Te(e);
    }
  };
  function Fr(e, t) {
    _e[e] = t;
  }
  function re(e, t, r) {
    var n = e.state.vim, a = n.insertMode || n.visualMode, o = Math.min(Math.max(e.firstLine(), t.line), e.lastLine()), s = e.getLine(o), c = s.length - 1 + +!!a, h = Math.min(Math.max(0, t.ch), c), v = s.charCodeAt(h);
    if (56320 <= v && v <= 57343) {
      var p = 1;
      r && r.line == o && r.ch > h && (p = -1), h += p, h > c && (h -= 2);
    }
    return new i(o, h);
  }
  function Ze(e) {
    var t = (
      /**@type{typeof args}*/
      {}
    );
    for (var r in e)
      Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
    return (
      /**@type{typeof args}*/
      t
    );
  }
  function G(e, t, r) {
    return typeof t == "object" && (r = t.ch, t = t.line), new i(e.line + t, e.ch + r);
  }
  function Hr(e, t, r, n) {
    n.operator && (r = "operatorPending");
    for (var a, o = [], s = [], c = Ye ? t.length - g : 0, h = c; h < t.length; h++) {
      var v = t[h];
      r == "insert" && v.context != "insert" || v.context && v.context != r || n.operator && v.type == "action" || !(a = Vr(e, v.keys)) || (a == "partial" && o.push(v), a == "full" && s.push(v));
    }
    return {
      partial: o,
      full: s
    };
  }
  function Vr(e, t) {
    const r = t.slice(-11) == "<character>", n = t.slice(-10) == "<register>";
    if (r || n) {
      var a = t.length - (r ? 11 : 10), o = e.slice(0, a), s = t.slice(0, a);
      return o == s && e.length > a ? "full" : s.indexOf(o) == 0 ? "partial" : !1;
    } else
      return e == t ? "full" : t.indexOf(e) == 0 ? "partial" : !1;
  }
  function Wr(e) {
    var t = /^.*(<[^>]+>)$/.exec(e), r = t ? t[1] : e.slice(-1);
    if (r.length > 1)
      switch (r) {
        case "<CR>":
        case "<S-CR>":
          r = `
`;
          break;
        case "<Space>":
        case "<S-Space>":
          r = " ";
          break;
        default:
          r = "";
          break;
      }
    return r;
  }
  function Bt(e, t, r) {
    return function() {
      for (var n = 0; n < r; n++)
        t(e);
    };
  }
  function V(e) {
    return new i(e.line, e.ch);
  }
  function he(e, t) {
    return e.ch == t.ch && e.line == t.line;
  }
  function J(e, t) {
    return e.line < t.line || e.line == t.line && e.ch < t.ch;
  }
  function ne(e, t) {
    return arguments.length > 2 && (t = ne.apply(void 0, Array.prototype.slice.call(arguments, 1))), J(e, t) ? e : t;
  }
  function Ae(e, t) {
    return arguments.length > 2 && (t = Ae.apply(void 0, Array.prototype.slice.call(arguments, 1))), J(e, t) ? t : e;
  }
  function Nt(e, t, r) {
    var n = J(e, t), a = J(t, r);
    return n && a;
  }
  function te(e, t) {
    return e.getLine(t).length;
  }
  function ft(e) {
    return e.trim ? e.trim() : e.replace(/^\s+|\s+$/g, "");
  }
  function $r(e) {
    return e.replace(/([.?*+$\[\]\/\\(){}|\-])/g, "\\$1");
  }
  function jr(e, t, r) {
    var n = te(e, t), a = new Array(r - n + 1).join(" ");
    e.setCursor(new i(t, n)), e.replaceRange(a, e.getCursor());
  }
  function Pt(e, t) {
    var r = [], n = e.listSelections(), a = V(e.clipPos(t)), o = !he(t, a), s = e.getCursor("head"), c = Ur(n, s), h = he(n[c].head, n[c].anchor), v = n.length - 1, p = v - c > c ? v : 0, m = n[p].anchor, k = Math.min(m.line, a.line), C = Math.max(m.line, a.line), y = m.ch, x = a.ch, M = n[p].head.ch - y, T = x - y;
    M > 0 && T <= 0 ? (y++, o || x--) : M < 0 && T >= 0 ? (y--, h || x++) : M < 0 && T == -1 && (y--, x++);
    for (var b = k; b <= C; b++) {
      var O = { anchor: new i(b, y), head: new i(b, x) };
      r.push(O);
    }
    return e.setSelections(r), t.ch = x, m.ch = y, m;
  }
  function Kt(e, t, r) {
    for (var n = [], a = 0; a < r; a++) {
      var o = G(t, a, 0);
      n.push({ anchor: o, head: o });
    }
    e.setSelections(n, 0);
  }
  function Ur(e, t, r) {
    for (var n = 0; n < e.length; n++) {
      var a = he(e[n].anchor, t), o = he(e[n].head, t);
      if (a || o)
        return n;
    }
    return -1;
  }
  function Qr(e, t) {
    var r = e.listSelections(), n = r[0], a = r[r.length - 1], o = J(n.anchor, n.head) ? n.anchor : n.head, s = J(a.anchor, a.head) ? a.head : a.anchor;
    return [o, s];
  }
  function Dt(e, t) {
    var r = t.sel.anchor, n = t.sel.head;
    t.lastPastedText && (n = e.posFromIndex(e.indexFromPos(r) + t.lastPastedText.length), t.lastPastedText = void 0), t.lastSelection = {
      anchorMark: e.setBookmark(r),
      headMark: e.setBookmark(n),
      anchor: V(r),
      head: V(n),
      visualMode: t.visualMode,
      visualLine: t.visualLine,
      visualBlock: t.visualBlock
    };
  }
  function qr(e, t, r, n) {
    var a = e.state.vim.sel, o = n ? t : a.head, s = n ? t : a.anchor, c;
    return J(r, t) && (c = r, r = t, t = c), J(o, s) ? (o = ne(t, o), s = Ae(s, r)) : (s = ne(t, s), o = Ae(o, r), o = G(o, 0, -1), o.ch == -1 && o.line != e.firstLine() && (o = new i(o.line - 1, te(e, o.line - 1)))), [s, o];
  }
  function Fe(e, t, r) {
    var n = e.state.vim;
    t = t || n.sel, r || (r = n.visualLine ? "line" : n.visualBlock ? "block" : "char");
    var a = ct(e, t, r);
    e.setSelections(a.ranges, a.primary);
  }
  function ct(e, t, r, n) {
    var a = V(t.head), o = V(t.anchor);
    if (r == "char") {
      var s = !n && !J(t.head, t.anchor) ? 1 : 0, c = J(t.head, t.anchor) ? 1 : 0;
      return a = G(t.head, 0, s), o = G(t.anchor, 0, c), {
        ranges: [{ anchor: o, head: a }],
        primary: 0
      };
    } else if (r == "line") {
      if (J(t.head, t.anchor))
        a.ch = 0, o.ch = te(e, o.line);
      else {
        o.ch = 0;
        var h = e.lastLine();
        a.line > h && (a.line = h), a.ch = te(e, a.line);
      }
      return {
        ranges: [{ anchor: o, head: a }],
        primary: 0
      };
    } else if (r == "block") {
      var v = Math.min(o.line, a.line), p = o.ch, m = Math.max(o.line, a.line), k = a.ch;
      p < k ? k += 1 : p += 1;
      for (var C = m - v + 1, y = a.line == v ? 0 : C - 1, x = [], M = 0; M < C; M++)
        x.push({
          anchor: new i(v + M, p),
          head: new i(v + M, k)
        });
      return {
        ranges: x,
        primary: y
      };
    }
    throw "never happens";
  }
  function zr(e) {
    var t = e.getCursor("head");
    return e.getSelection().length == 1 && (t = ne(t, e.getCursor("anchor"))), t;
  }
  function xe(e, t) {
    var r = e.state.vim;
    t !== !1 && e.setCursor(re(e, r.sel.head)), Dt(e, r), r.visualMode = !1, r.visualLine = !1, r.visualBlock = !1, r.insertMode || f.signal(e, "vim-mode-change", { mode: "normal" });
  }
  function Jr(e, t, r) {
    var n = e.getRange(t, r);
    if (/\n\s*$/.test(n)) {
      var a = n.split(`
`);
      a.pop();
      for (var o = a.pop(); a.length > 0 && o && Z(o); o = a.pop())
        r.line--, r.ch = 0;
      o ? (r.line--, r.ch = te(e, r.line)) : r.ch = 0;
    }
  }
  function Xr(e, t, r) {
    t.ch = 0, r.ch = 0, r.line++;
  }
  function Se(e) {
    if (!e)
      return 0;
    var t = e.search(/\S/);
    return t == -1 ? e.length : t;
  }
  function ht(e, { inclusive: t, innerWord: r, bigWord: n, noSymbol: a, multiline: o }, s) {
    var c = s || zr(e), h = e.getLine(c.line), v = h, p = c.line, m = p, k = c.ch, C, y = a ? j[0] : B[0];
    if (r && /\s/.test(h.charAt(k)))
      y = function(N) {
        return /\s/.test(N);
      };
    else {
      for (; !y(h.charAt(k)); )
        if (k++, k >= h.length) {
          if (!o) return null;
          k--, C = Vt(e, c, !0, n, !0);
          break;
        }
      n ? y = B[0] : (y = j[0], y(h.charAt(k)) || (y = j[1]));
    }
    for (var x = k, M = k; y(h.charAt(M)) && M >= 0; )
      M--;
    if (M++, C)
      x = C.to, m = C.line, v = e.getLine(m), !v && x == 0 && x++;
    else
      for (; y(h.charAt(x)) && x < h.length; )
        x++;
    if (t) {
      var T = x, b = c.ch <= M && /\s/.test(h.charAt(c.ch));
      if (!b)
        for (; /\s/.test(v.charAt(x)) && x < v.length; )
          x++;
      if (T == x || b) {
        for (var O = M; /\s/.test(h.charAt(M - 1)) && M > 0; )
          M--;
        !M && !b && (M = O);
      }
    }
    return { start: new i(p, M), end: new i(m, x) };
  }
  function Gr(e, t, r) {
    var n = t;
    if (!f.findMatchingTag || !f.findEnclosingTag)
      return { start: n, end: n };
    var a = f.findMatchingTag(e, t) || f.findEnclosingTag(e, t);
    return !a || !a.open || !a.close ? { start: n, end: n } : r ? { start: a.open.from, end: a.close.to } : { start: a.open.to, end: a.close.from };
  }
  function _t(e, t, r) {
    he(t, r) || A.jumpList.add(e, t, r);
  }
  function Ft(e, t) {
    A.lastCharacterSearch.increment = e, A.lastCharacterSearch.forward = t.forward, A.lastCharacterSearch.selectedCharacter = t.selectedCharacter;
  }
  var Yr = {
    "(": "bracket",
    ")": "bracket",
    "{": "bracket",
    "}": "bracket",
    "[": "section",
    "]": "section",
    "*": "comment",
    "/": "comment",
    m: "method",
    M: "method",
    "#": "preprocess"
  }, Ht = {
    bracket: {
      isComplete: function(e) {
        if (e.nextCh === e.symb) {
          if (e.depth++, e.depth >= 1) return !0;
        } else e.nextCh === e.reverseSymb && e.depth--;
        return !1;
      }
    },
    section: {
      init: function(e) {
        e.curMoveThrough = !0, e.symb = (e.forward ? "]" : "[") === e.symb ? "{" : "}";
      },
      isComplete: function(e) {
        return e.index === 0 && e.nextCh === e.symb;
      }
    },
    comment: {
      isComplete: function(e) {
        var t = e.lastCh === "*" && e.nextCh === "/";
        return e.lastCh = e.nextCh, t;
      }
    },
    // TODO: The original Vim implementation only operates on level 1 and 2.
    // The current implementation doesn't check for code block level and
    // therefore it operates on any levels.
    method: {
      init: function(e) {
        e.symb = e.symb === "m" ? "{" : "}", e.reverseSymb = e.symb === "{" ? "}" : "{";
      },
      isComplete: function(e) {
        return e.nextCh === e.symb;
      }
    },
    preprocess: {
      init: function(e) {
        e.index = 0;
      },
      isComplete: function(e) {
        var r;
        if (e.nextCh === "#") {
          var t = (r = e.lineText.match(/^#(\w+)/)) == null ? void 0 : r[1];
          if (t === "endif") {
            if (e.forward && e.depth === 0)
              return !0;
            e.depth++;
          } else if (t === "if") {
            if (!e.forward && e.depth === 0)
              return !0;
            e.depth--;
          }
          if (t === "else" && e.depth === 0) return !0;
        }
        return !1;
      }
    }
  };
  function Zr(e, t, r, n) {
    var a = V(e.getCursor()), o = r ? 1 : -1, s = r ? e.lineCount() : -1, c = a.ch, h = a.line, v = e.getLine(h), p = {
      lineText: v,
      nextCh: v.charAt(c),
      lastCh: null,
      index: c,
      symb: n,
      reverseSymb: (r ? { ")": "(", "}": "{" } : { "(": ")", "{": "}" })[n],
      forward: r,
      depth: 0,
      curMoveThrough: !1
    }, m = Yr[n];
    if (!m) return a;
    var k = Ht[m].init, C = Ht[m].isComplete;
    for (k && k(p); h !== s && t; ) {
      if (p.index += o, p.nextCh = p.lineText.charAt(p.index), !p.nextCh) {
        if (h += o, p.lineText = e.getLine(h) || "", o > 0)
          p.index = 0;
        else {
          var y = p.lineText.length;
          p.index = y > 0 ? y - 1 : 0;
        }
        p.nextCh = p.lineText.charAt(p.index);
      }
      C(p) && (a.line = h, a.ch = p.index, t--);
    }
    return p.nextCh || p.curMoveThrough ? new i(h, p.index) : a;
  }
  function Vt(e, t, r, n, a) {
    var o = t.line, s = t.ch, c = e.getLine(o), h = r ? 1 : -1, v = n ? B : j;
    if (a && c == "") {
      if (o += h, c = e.getLine(o), !ie(e, o))
        return null;
      s = r ? 0 : c.length;
    }
    for (; ; ) {
      if (a && c == "")
        return { from: 0, to: 0, line: o };
      for (var p = h > 0 ? c.length : -1, m = p, k = p; s != p; ) {
        for (var C = !1, y = 0; y < v.length && !C; ++y)
          if (v[y](c.charAt(s))) {
            for (m = s; s != p && v[y](c.charAt(s)); )
              s += h;
            if (k = s, C = m != k, m == t.ch && o == t.line && k == m + h)
              continue;
            return {
              from: Math.min(m, k + 1),
              to: Math.max(m, k),
              line: o
            };
          }
        C || (s += h);
      }
      if (o += h, !ie(e, o))
        return null;
      c = e.getLine(o), s = h > 0 ? 0 : c.length;
    }
  }
  function en(e, t, r, n, a, o) {
    var s = V(t), c = [];
    (n && !a || !n && a) && r++;
    for (var h = !(n && a), v = 0; v < r; v++) {
      var p = Vt(e, t, n, o, h);
      if (!p) {
        var m = te(e, e.lastLine());
        c.push(n ? { line: e.lastLine(), from: m, to: m } : { line: 0, from: 0, to: 0 });
        break;
      }
      c.push(p), t = new i(p.line, n ? p.to - 1 : p.from);
    }
    var k = c.length != r, C = c[0], y = c.pop();
    return n && !a ? (!k && (C.from != s.ch || C.line != s.line) && (y = c.pop()), y && new i(y.line, y.from)) : n && a ? y && new i(y.line, y.to - 1) : !n && a ? (!k && (C.to != s.ch || C.line != s.line) && (y = c.pop()), y && new i(y.line, y.to)) : y && new i(y.line, y.from);
  }
  function Wt(e, t, r, n, a) {
    var o = t, s = new i(o.line + r.repeat - 1, 1 / 0), c = e.clipPos(s);
    return c.ch--, a || (n.lastHPos = 1 / 0, n.lastHSPos = e.charCoords(c, "div").left), s;
  }
  function dt(e, t, r, n, a) {
    if (n) {
      for (var o = a || e.getCursor(), s = o.ch, c, h = 0; h < t; h++) {
        var v = e.getLine(o.line);
        if (c = rn(s, v, n, r), c == -1)
          return;
        s = c;
      }
      if (c != null)
        return new i(e.getCursor().line, c);
    }
  }
  function tn(e, t) {
    var r = e.getCursor().line;
    return re(e, new i(r, t - 1));
  }
  function be(e, t, r, n) {
    !ot(r, F) && !$.test(r) || (t.marks[r] && t.marks[r].clear(), t.marks[r] = e.setBookmark(n));
  }
  function rn(e, t, r, n, a) {
    var o;
    return n ? o = t.indexOf(r, e + 1) : o = t.lastIndexOf(r, e - 1), o;
  }
  function $t(e, t, r, n, a) {
    var o = t.line, s = e.firstLine(), c = e.lastLine(), h, v, p = o;
    function m(M) {
      return !e.getLine(M);
    }
    function k(M, T, b) {
      return b ? m(M) != m(M + T) : !m(M) && m(M + T);
    }
    if (n) {
      for (; s <= p && p <= c && r > 0; )
        k(p, n) && r--, p += n;
      return { start: new i(p, 0), end: t };
    }
    var C = e.state.vim;
    if (C.visualLine && k(o, 1, !0)) {
      var y = C.sel.anchor;
      k(y.line, -1, !0) && (!a || y.line != o) && (o += 1);
    }
    var x = m(o);
    for (p = o; p <= c && r; p++)
      k(p, 1, !0) && (!a || m(p) != x) && r--;
    for (v = new i(p, 0), p > c && !x ? x = !0 : a = !1, p = o; p > s && !((!a || m(p) == x || p == o) && k(p, -1, !0)); p--)
      ;
    return h = new i(p, 0), { start: h, end: v };
  }
  function jt(e, t, r, n, a) {
    function o(v) {
      v.line !== null && (v.pos + v.dir < 0 || v.pos + v.dir >= v.line.length ? v.line = null : v.pos += v.dir);
    }
    function s(v, p, m, k) {
      var C = v.getLine(p), y = {
        line: C,
        ln: p,
        pos: m,
        dir: k
      };
      if (y.line === "")
        return { ln: y.ln, pos: y.pos };
      var x = y.pos;
      for (o(y); y.line !== null; ) {
        if (x = y.pos, Be(y.line[y.pos]))
          if (a) {
            for (o(y); y.line !== null && Z(y.line[y.pos]); )
              x = y.pos, o(y);
            return { ln: y.ln, pos: x + 1 };
          } else
            return { ln: y.ln, pos: y.pos + 1 };
        o(y);
      }
      return { ln: y.ln, pos: x + 1 };
    }
    function c(v, p, m, k) {
      var C = v.getLine(p), y = {
        line: C,
        ln: p,
        pos: m,
        dir: k
      };
      if (y.line === "")
        return { ln: y.ln, pos: y.pos };
      var x = y.pos;
      for (o(y); y.line !== null; ) {
        if (!Z(y.line[y.pos]) && !Be(y.line[y.pos]))
          x = y.pos;
        else if (Be(y.line[y.pos]))
          return a ? Z(y.line[y.pos + 1]) ? { ln: y.ln, pos: y.pos + 1 } : { ln: y.ln, pos: x } : { ln: y.ln, pos: x };
        o(y);
      }
      return y.line = C, a && Z(y.line[y.pos]) ? { ln: y.ln, pos: y.pos } : { ln: y.ln, pos: x };
    }
    for (var h = {
      ln: t.line,
      pos: t.ch
    }; r > 0; )
      n < 0 ? h = c(e, h.ln, h.pos, n) : h = s(e, h.ln, h.pos, n), r--;
    return new i(h.ln, h.pos);
  }
  function nn(e, t, r, n) {
    function a(h, v) {
      if (v.line !== null)
        if (v.pos + v.dir < 0 || v.pos + v.dir >= v.line.length) {
          if (v.ln += v.dir, !ie(h, v.ln)) {
            v.line = null;
            return;
          }
          v.line = h.getLine(v.ln), v.pos = v.dir > 0 ? 0 : v.line.length - 1;
        } else
          v.pos += v.dir;
    }
    function o(h, v, p, m) {
      var M = h.getLine(v), k = M === "", C = {
        line: M,
        ln: v,
        pos: p,
        dir: m
      }, y = {
        ln: C.ln,
        pos: C.pos
      }, x = C.line === "";
      for (a(h, C); C.line !== null; ) {
        if (y.ln = C.ln, y.pos = C.pos, C.line === "" && !x)
          return { ln: C.ln, pos: C.pos };
        if (k && C.line !== "" && !Z(C.line[C.pos]))
          return { ln: C.ln, pos: C.pos };
        Be(C.line[C.pos]) && !k && (C.pos === C.line.length - 1 || Z(C.line[C.pos + 1])) && (k = !0), a(h, C);
      }
      var M = h.getLine(y.ln);
      y.pos = 0;
      for (var T = M.length - 1; T >= 0; --T)
        if (!Z(M[T])) {
          y.pos = T;
          break;
        }
      return y;
    }
    function s(h, v, p, m) {
      var M = h.getLine(v), k = {
        line: M,
        ln: v,
        pos: p,
        dir: m
      }, C = k.ln, y = null, x = k.line === "";
      for (a(h, k); k.line !== null; ) {
        if (k.line === "" && !x)
          return y !== null ? { ln: C, pos: y } : { ln: k.ln, pos: k.pos };
        if (Be(k.line[k.pos]) && y !== null && !(k.ln === C && k.pos + 1 === y))
          return { ln: C, pos: y };
        k.line !== "" && !Z(k.line[k.pos]) && (x = !1, C = k.ln, y = k.pos), a(h, k);
      }
      var M = h.getLine(C);
      y = 0;
      for (var T = 0; T < M.length; ++T)
        if (!Z(M[T])) {
          y = T;
          break;
        }
      return { ln: C, pos: y };
    }
    for (var c = {
      ln: t.line,
      pos: t.ch
    }; r > 0; )
      n < 0 ? c = s(e, c.ln, c.pos, n) : c = o(e, c.ln, c.pos, n), r--;
    return new i(c.ln, c.pos);
  }
  function Ut(e, t, r, n) {
    var a = t, o = {
      "(": /[()]/,
      ")": /[()]/,
      "[": /[[\]]/,
      "]": /[[\]]/,
      "{": /[{}]/,
      "}": /[{}]/,
      "<": /[<>]/,
      ">": /[<>]/
    }[r], s = {
      "(": "(",
      ")": "(",
      "[": "[",
      "]": "[",
      "{": "{",
      "}": "{",
      "<": "<",
      ">": "<"
    }[r], c = e.getLine(a.line).charAt(a.ch), h = c === s ? 1 : 0, v = e.scanForBracket(new i(a.line, a.ch + h), -1, void 0, { bracketRegex: o }), p = e.scanForBracket(new i(a.line, a.ch + h), 1, void 0, { bracketRegex: o });
    if (!v || !p) return null;
    var m = v.pos, k = p.pos;
    if (m.line == k.line && m.ch > k.ch || m.line > k.line) {
      var C = m;
      m = k, k = C;
    }
    return n ? k.ch += 1 : m.ch += 1, { start: m, end: k };
  }
  function an(e, t, r, n) {
    var a = V(t), o = e.getLine(a.line), s = o.split(""), c, h, v, p, m = s.indexOf(r);
    if (a.ch < m)
      a.ch = m;
    else if (m < a.ch && s[a.ch] == r) {
      var k = /string/.test(e.getTokenTypeAt(G(t, 0, 1))), C = /string/.test(e.getTokenTypeAt(t)), y = k && !C;
      y || (h = a.ch, --a.ch);
    }
    if (s[a.ch] == r && !h)
      c = a.ch + 1;
    else
      for (v = a.ch; v > -1 && !c; v--)
        s[v] == r && (c = v + 1);
    if (c && !h)
      for (v = c, p = s.length; v < p && !h; v++)
        s[v] == r && (h = v);
    return !c || !h ? { start: a, end: a } : (n && (--c, ++h), {
      start: new i(a.line, c),
      end: new i(a.line, h)
    });
  }
  Ne("pcre", !0, "boolean");
  class on {
    constructor() {
      this.highlightTimeout;
    }
    getQuery() {
      return A.query;
    }
    setQuery(t) {
      A.query = t;
    }
    getOverlay() {
      return this.searchOverlay;
    }
    setOverlay(t) {
      this.searchOverlay = t;
    }
    isReversed() {
      return A.isReversed;
    }
    setReversed(t) {
      A.isReversed = t;
    }
    getScrollbarAnnotate() {
      return this.annotate;
    }
    setScrollbarAnnotate(t) {
      this.annotate = t;
    }
  }
  function ye(e) {
    var t = e.state.vim;
    return t.searchState_ || (t.searchState_ = new on());
  }
  function sn(e) {
    return Qt(e, "/");
  }
  function ln(e) {
    return qt(e, "/");
  }
  function Qt(e, t) {
    var r = qt(e, t) || [];
    if (!r.length) return [];
    var n = [];
    if (r[0] === 0) {
      for (var a = 0; a < r.length; a++)
        typeof r[a] == "number" && n.push(e.substring(r[a] + 1, r[a + 1]));
      return n;
    }
  }
  function qt(e, t) {
    t || (t = "/");
    for (var r = !1, n = [], a = 0; a < e.length; a++) {
      var o = e.charAt(a);
      !r && o == t && n.push(a), r = !r && o == "\\";
    }
    return n;
  }
  function un(e) {
    var t = {
      V: "|(){+?*.[$^",
      // verynomagic
      M: "|(){+?*.[",
      // nomagic
      m: "|(){+?",
      // magic
      v: "<>"
      // verymagic
    }, r = {
      ">": "(?<=[\\w])(?=[^\\w]|$)",
      "<": "(?<=[^\\w]|^)(?=[\\w])"
    }, n = t.m, a = e.replace(/\\.|[\[|(){+*?.$^<>]/g, function(s) {
      if (s[0] === "\\") {
        var c = s[1];
        return c === "}" || n.indexOf(c) != -1 ? c : c in t ? (n = t[c], "") : c in r ? r[c] : s;
      } else
        return n.indexOf(s) != -1 ? r[s] || "\\" + s : s;
    }), o = a.indexOf("\\zs");
    return o != -1 && (a = "(?<=" + a.slice(0, o) + ")" + a.slice(o + 3)), o = a.indexOf("\\ze"), o != -1 && (a = a.slice(0, o) + "(?=" + a.slice(o + 3) + ")"), a;
  }
  var zt = { "\\n": `
`, "\\r": "\r", "\\t": "	" };
  function fn(e) {
    for (var t = !1, r = [], n = -1; n < e.length; n++) {
      var a = e.charAt(n) || "", o = e.charAt(n + 1) || "";
      zt[a + o] ? (r.push(zt[a + o]), n++) : t ? (r.push(a), t = !1) : a === "\\" ? (t = !0, oe(o) || o === "$" ? r.push("$") : o !== "/" && o !== "\\" && r.push("\\")) : (a === "$" && r.push("$"), r.push(a), o === "/" && r.push("\\"));
    }
    return r.join("");
  }
  var Jt = { "\\/": "/", "\\\\": "\\", "\\n": `
`, "\\r": "\r", "\\t": "	", "\\&": "&" };
  function cn(e) {
    for (var t = new f.StringStream(e), r = []; !t.eol(); ) {
      for (; t.peek() && t.peek() != "\\"; )
        r.push(t.next());
      var n = !1;
      for (var a in Jt)
        if (t.match(a, !0)) {
          n = !0, r.push(Jt[a]);
          break;
        }
      n || r.push(t.next());
    }
    return r.join("");
  }
  function Xt(e, t, r) {
    var n = A.registerController.getRegister("/");
    n.setText(e);
    var a = ln(e), o, s;
    if (!a.length)
      o = e;
    else {
      o = e.substring(0, a[0]);
      var c = e.substring(a[0]);
      s = c.indexOf("i") != -1;
    }
    if (!o)
      return null;
    le("pcre") || (o = un(o)), r && (t = /^[^A-Z]*$/.test(o));
    var h = new RegExp(
      o,
      t || s ? "im" : "m"
    );
    return h;
  }
  function me(e) {
    typeof e == "string" && (e = document.createElement(e));
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      if (r)
        if (typeof r != "object" && (r = document.createTextNode(r)), r.nodeType) e.appendChild(r);
        else for (var n in r)
          Object.prototype.hasOwnProperty.call(r, n) && (n[0] === "$" ? e.style[n.slice(1)] = r[n] : typeof r[n] == "function" ? e[n] = r[n] : e.setAttribute(n, r[n]));
    }
    return e;
  }
  function D(e, t, r) {
    var n = me("div", { $color: "red", $whiteSpace: "pre", class: "cm-vim-message" }, t);
    e.openNotification ? r ? (n = me("div", {}, n, me("div", {}, "Press ENTER or type command to continue")), e.state.closeVimNotification && e.state.closeVimNotification(), e.state.closeVimNotification = e.openNotification(n, { bottom: !0, duration: 0 })) : e.openNotification(n, { bottom: !0, duration: 15e3 }) : alert(n.innerText);
  }
  function hn(e, t) {
    return me(
      "div",
      { $display: "flex", $flex: 1 },
      me(
        "span",
        { $fontFamily: "monospace", $whiteSpace: "pre", $flex: 1, $display: "flex" },
        e,
        me("input", {
          type: "text",
          autocorrect: "off",
          autocapitalize: "off",
          spellcheck: "false",
          $flex: 1
        })
      ),
      t && me("span", { $color: "#888" }, t)
    );
  }
  function et(e, t) {
    var a;
    if (Ke.length) {
      t.value || (t.value = ""), X = t;
      return;
    }
    var r = hn(t.prefix, t.desc);
    if (e.openDialog)
      e.openDialog(r, t.onClose, {
        onKeyDown: t.onKeyDown,
        onKeyUp: t.onKeyUp,
        bottom: !0,
        selectValueOnOpen: !1,
        value: t.value
      });
    else {
      var n = "";
      typeof t.prefix != "string" && t.prefix && (n += t.prefix.textContent), t.desc && (n += " " + t.desc), (a = t.onClose) == null || a.call(t, prompt(n, ""));
    }
  }
  function dn(e, t) {
    return e instanceof RegExp && t instanceof RegExp ? e.flags == t.flags && e.source == t.source : !1;
  }
  function ze(e, t, r, n) {
    if (t) {
      var a = ye(e), o = Xt(t, !!r, !!n);
      if (o)
        return pt(e, o), dn(o, a.getQuery()) || a.setQuery(o), o;
    }
  }
  function pn(e) {
    if (e.source.charAt(0) == "^")
      var t = !0;
    return {
      token: function(r) {
        if (t && !r.sol()) {
          r.skipToEnd();
          return;
        }
        var n = r.match(e, !1);
        if (n)
          return n[0].length == 0 ? (r.next(), "searching") : !r.sol() && (r.backUp(1), !e.exec(r.next() + n[0])) ? (r.next(), null) : (r.match(e), "searching");
        for (; !r.eol() && (r.next(), !r.match(e, !1)); )
          ;
      },
      query: e
    };
  }
  var Je = 0;
  function pt(e, t) {
    clearTimeout(Je);
    var r = ye(e);
    r.highlightTimeout = Je, Je = setTimeout(function() {
      if (e.state.vim) {
        var n = ye(e);
        n.highlightTimeout = void 0;
        var a = n.getOverlay();
        (!a || t != a.query) && (a && e.removeOverlay(a), a = pn(t), e.addOverlay(a), e.showMatchesOnScrollbar && (n.getScrollbarAnnotate() && n.getScrollbarAnnotate().clear(), n.setScrollbarAnnotate(e.showMatchesOnScrollbar(t))), n.setOverlay(a));
      }
    }, 50);
  }
  function Gt(e, t, r, n) {
    return e.operation(function() {
      n === void 0 && (n = 1);
      for (var a = e.getCursor(), o = e.getSearchCursor(r, a), s = 0; s < n; s++) {
        var c = o.find(t);
        if (s == 0 && c && he(o.from(), a)) {
          var h = t ? o.from() : o.to();
          c = o.find(t), c && !c[0] && he(o.from(), h) && e.getLine(h.line).length == h.ch && (c = o.find(t));
        }
        if (!c && (o = e.getSearchCursor(
          r,
          // @ts-ignore
          t ? new i(e.lastLine()) : new i(e.firstLine(), 0)
        ), !o.find(t)))
          return;
      }
      return o.from();
    });
  }
  function vn(e, t, r, n, a) {
    return e.operation(function() {
      n === void 0 && (n = 1);
      var o = e.getCursor(), s = e.getSearchCursor(r, o), c = s.find(!t);
      !a.visualMode && c && he(s.from(), o) && s.find(!t);
      for (var h = 0; h < n; h++)
        if (c = s.find(t), !c && (s = e.getSearchCursor(
          r,
          // @ts-ignore
          t ? new i(e.lastLine()) : new i(e.firstLine(), 0)
        ), !s.find(t)))
          return;
      var v = s.from(), p = s.to();
      return v && p && [v, p];
    });
  }
  function He(e) {
    var t = ye(e);
    t.highlightTimeout && (clearTimeout(t.highlightTimeout), t.highlightTimeout = void 0), e.removeOverlay(ye(e).getOverlay()), t.setOverlay(null), t.getScrollbarAnnotate() && (t.getScrollbarAnnotate().clear(), t.setScrollbarAnnotate(null));
  }
  function gn(e, t, r) {
    return typeof e != "number" && (e = e.line), t instanceof Array ? ot(e, t) : typeof r == "number" ? e >= t && e <= r : e == t;
  }
  function vt(e) {
    var t = e.getScrollInfo(), r = 6, n = 10, a = e.coordsChar({ left: 0, top: r + t.top }, "local"), o = t.clientHeight - n + t.top, s = e.coordsChar({ left: 0, top: o }, "local");
    return { top: a.line, bottom: s.line };
  }
  function tt(e, t, r) {
    if (r == "'" || r == "`")
      return A.jumpList.find(e, -1) || new i(0, 0);
    if (r == ".")
      return Yt(e);
    var n = t.marks[r];
    return n && n.find();
  }
  function Yt(e) {
    if (e.getLastEditEnd)
      return e.getLastEditEnd();
    for (var t = (
      /**@type{any}*/
      e.doc.history.done
    ), r = t.length; r--; )
      if (t[r].changes)
        return V(t[r].changes[0].to);
  }
  class yn {
    constructor() {
      this.commandMap_, this.buildCommandMap_();
    }
    /**
     * @arg {CodeMirrorV} cm
     * @arg {string} input
     * @arg {{ callback: () => void; } | undefined} [opt_params]
     */
    processCommand(t, r, n) {
      var a = this;
      t.operation(function() {
        t.curOp && (t.curOp.isVimOp = !0), a._processCommand(t, r, n);
      });
    }
    /**
     * @arg {CodeMirrorV} cm
     * @arg {string} input
     * @arg {{ callback?: () => void; input?: string, line?: string, commandName?: string  } } [opt_params]
     */
    _processCommand(t, r, n) {
      var a = t.state.vim, o = A.registerController.getRegister(":"), s = o.toString(), c = new f.StringStream(r);
      o.setText(r);
      var h = n || {};
      h.input = r;
      try {
        this.parseInput_(t, c, h);
      } catch (m) {
        throw D(t, m + ""), m;
      }
      a.visualMode && xe(t);
      var v, p;
      if (!h.commandName)
        h.line !== void 0 && (p = "move");
      else if (v = this.matchCommand_(h.commandName), v) {
        if (p = v.name, v.excludeFromCommandHistory && o.setText(s), this.parseCommandArgs_(c, h, v), v.type == "exToKey") {
          Qe(t, v.toKeys || "", v);
          return;
        } else if (v.type == "exToEx") {
          this.processCommand(t, v.toInput || "");
          return;
        }
      }
      if (!p) {
        D(t, 'Not an editor command ":' + r + '"');
        return;
      }
      try {
        Zt[p](t, h), (!v || !v.possiblyAsync) && h.callback && h.callback();
      } catch (m) {
        throw D(t, m + ""), m;
      }
    }
    /**
     * @param {CodeMirrorV} cm
     * @param {import("@codemirror/language").StringStream} inputStream
     * @param {{ callback?: (() => void) | undefined; input?: string | undefined; line?: any; commandName?: any; lineEnd?: any; selectionLine?: any; selectionLineEnd?: any; }} result
     */
    parseInput_(t, r, n) {
      var o, s;
      r.eatWhile(":"), r.eat("%") ? (n.line = t.firstLine(), n.lineEnd = t.lastLine()) : (n.line = this.parseLineSpec_(t, r), n.line !== void 0 && r.eat(",") && (n.lineEnd = this.parseLineSpec_(t, r))), n.line == null ? t.state.vim.visualMode ? (n.selectionLine = (o = tt(t, t.state.vim, "<")) == null ? void 0 : o.line, n.selectionLineEnd = (s = tt(t, t.state.vim, ">")) == null ? void 0 : s.line) : n.selectionLine = t.getCursor().line : (n.selectionLine = n.line, n.selectionLineEnd = n.lineEnd);
      var a = r.match(/^(\w+|!!|@@|[!#&*<=>@~])/);
      return a ? n.commandName = a[1] : n.commandName = (r.match(/.*/) || [""])[0], n;
    }
    /**
     * @param {CodeMirrorV} cm
     * @param {import("@codemirror/language").StringStream} inputStream
     */
    parseLineSpec_(t, r) {
      var n = r.match(/^(\d+)/);
      if (n)
        return parseInt(n[1], 10) - 1;
      switch (r.next()) {
        case ".":
          return this.parseLineSpecOffset_(r, t.getCursor().line);
        case "$":
          return this.parseLineSpecOffset_(r, t.lastLine());
        case "'":
          var a = r.next() || "", o = tt(t, t.state.vim, a);
          if (!o) throw new Error("Mark not set");
          return this.parseLineSpecOffset_(r, o.line);
        case "-":
        case "+":
          return r.backUp(1), this.parseLineSpecOffset_(r, t.getCursor().line);
        default:
          r.backUp(1);
          return;
      }
    }
    /**
     * @param {string | import("@codemirror/language").StringStream} inputStream
     * @param {number} line
     */
    parseLineSpecOffset_(t, r) {
      var n = t.match(/^([+-])?(\d+)/);
      if (n) {
        var a = parseInt(n[2], 10);
        n[1] == "-" ? r -= a : r += a;
      }
      return r;
    }
    /**
     * @param {import("@codemirror/language").StringStream} inputStream
     * @param {import("./types").exCommandArgs} params
     * @param {import("./types").exCommandDefinition} command
     */
    parseCommandArgs_(t, r, n) {
      var s;
      if (!t.eol()) {
        r.argString = (s = t.match(/.*/)) == null ? void 0 : s[0];
        var a = n.argDelimiter || /\s+/, o = ft(r.argString || "").split(a);
        o.length && o[0] && (r.args = o);
      }
    }
    /**
     * @arg {string} commandName
     */
    matchCommand_(t) {
      for (var r = t.length; r > 0; r--) {
        var n = t.substring(0, r);
        if (this.commandMap_[n]) {
          var a = this.commandMap_[n];
          if (a.name.indexOf(t) === 0)
            return a;
        }
      }
    }
    buildCommandMap_() {
      this.commandMap_ = {};
      for (var t = 0; t < w.length; t++) {
        var r = w[t], n = r.shortName || r.name;
        this.commandMap_[n] = r;
      }
    }
    /**@type {(lhs: string, rhs: string, ctx: string|void, noremap?: boolean) => void} */
    map(t, r, n, a) {
      if (t != ":" && t.charAt(0) == ":") {
        if (n)
          throw Error("Mode not supported for ex mappings");
        var o = t.substring(1);
        r != ":" && r.charAt(0) == ":" ? this.commandMap_[o] = {
          name: o,
          type: "exToEx",
          toInput: r.substring(1),
          user: !0
        } : this.commandMap_[o] = {
          name: o,
          type: "exToKey",
          toKeys: r,
          user: !0
        };
      } else {
        var s = {
          keys: t,
          type: "keyToKey",
          toKeys: r,
          noremap: !!a
        };
        n && (s.context = n), gt(s);
      }
    }
    /**@type {(lhs: string, ctx: string) => boolean|void} */
    unmap(t, r) {
      if (t != ":" && t.charAt(0) == ":") {
        if (r)
          throw Error("Mode not supported for ex mappings");
        var n = t.substring(1);
        if (this.commandMap_[n] && this.commandMap_[n].user)
          return delete this.commandMap_[n], !0;
      } else
        for (var a = t, o = 0; o < u.length; o++)
          if (a == u[o].keys && u[o].context === r)
            return u.splice(o, 1), kn(a), !0;
    }
  }
  var Zt = {
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    colorscheme: function(e, t) {
      if (!t.args || t.args.length < 1) {
        D(e, e.getOption("theme"));
        return;
      }
      e.setOption("theme", t.args[0]);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params @arg {'insert'|'normal'|string} [ctx] @arg {boolean} [defaultOnly]*/
    map: function(e, t, r, n) {
      var a = t.args;
      if (!a || a.length < 2) {
        e && D(e, "Invalid mapping: " + t.input);
        return;
      }
      se.map(a[0], a[1], r, n);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    imap: function(e, t) {
      this.map(e, t, "insert");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    nmap: function(e, t) {
      this.map(e, t, "normal");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    vmap: function(e, t) {
      this.map(e, t, "visual");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    omap: function(e, t) {
      this.map(e, t, "operatorPending");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    noremap: function(e, t) {
      this.map(e, t, void 0, !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    inoremap: function(e, t) {
      this.map(e, t, "insert", !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    nnoremap: function(e, t) {
      this.map(e, t, "normal", !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    vnoremap: function(e, t) {
      this.map(e, t, "visual", !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    onoremap: function(e, t) {
      this.map(e, t, "operatorPending", !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params @arg {string} ctx*/
    unmap: function(e, t, r) {
      var n = t.args;
      (!n || n.length < 1 || !se.unmap(n[0], r)) && e && D(e, "No such mapping: " + t.input);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    mapclear: function(e, t) {
      ue.mapclear();
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    imapclear: function(e, t) {
      ue.mapclear("insert");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    nmapclear: function(e, t) {
      ue.mapclear("normal");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    vmapclear: function(e, t) {
      ue.mapclear("visual");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    omapclear: function(e, t) {
      ue.mapclear("operatorPending");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    move: function(e, t) {
      Oe.processCommand(e, e.state.vim, {
        keys: "",
        type: "motion",
        motion: "moveToLineOrEdgeOfDocument",
        motionArgs: { forward: !1, explicitRepeat: !0, linewise: !0 },
        repeatOverride: t.line + 1
      });
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    set: function(e, t) {
      var r = t.args, n = t.setCfg || {};
      if (!r || r.length < 1) {
        e && D(e, "Invalid mapping: " + t.input);
        return;
      }
      var a = r[0].split("="), o = a.shift() || "", s = a.length > 0 ? a.join("=") : void 0, c = !1, h = !1;
      if (o.charAt(o.length - 1) == "?") {
        if (s)
          throw Error("Trailing characters: " + t.argString);
        o = o.substring(0, o.length - 1), c = !0;
      } else o.charAt(o.length - 1) == "!" && (o = o.substring(0, o.length - 1), h = !0);
      s === void 0 && o.substring(0, 2) == "no" && (o = o.substring(2), s = !1);
      var v = Le[o] && Le[o].type == "boolean";
      if (v && (h ? s = !le(o, e, n) : s == null && (s = !0)), !v && s === void 0 || c) {
        var p = le(o, e, n);
        p instanceof Error ? D(e, p.message) : p === !0 || p === !1 ? D(e, " " + (p ? "" : "no") + o) : D(e, "  " + o + "=" + p);
      } else {
        var m = Ge(o, s, e, n);
        m instanceof Error && D(e, m.message);
      }
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    setlocal: function(e, t) {
      t.setCfg = { scope: "local" }, this.set(e, t);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    setglobal: function(e, t) {
      t.setCfg = { scope: "global" }, this.set(e, t);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    registers: function(e, t) {
      var r = t.args, n = A.registerController.registers, a = `----------Registers----------

`;
      if (r)
        for (var c = r.join(""), h = 0; h < c.length; h++) {
          var o = c.charAt(h);
          if (A.registerController.isValidRegister(o)) {
            var v = n[o] || new ke();
            a += '"' + o + "    " + v.toString() + `
`;
          }
        }
      else
        for (var o in n) {
          var s = n[o].toString();
          s.length && (a += '"' + o + "    " + s + `
`);
        }
      D(e, a, !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    marks: function(e, t) {
      var r = t.args, n = e.state.vim.marks, a = `-----------Marks-----------
mark	line	col

`;
      if (r)
        for (var c = r.join(""), h = 0; h < c.length; h++) {
          var o = c.charAt(h), s = n[o] && n[o].find();
          s && (a += o + "	" + s.line + "	" + s.ch + `
`);
        }
      else
        for (var o in n) {
          var s = n[o] && n[o].find();
          s && (a += o + "	" + s.line + "	" + s.ch + `
`);
        }
      D(e, a, !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    sort: function(e, t) {
      var r, n, a, o, s;
      function c() {
        if (t.argString) {
          var K = new f.StringStream(t.argString);
          if (K.eat("!") && (r = !0), K.eol())
            return;
          if (!K.eatSpace())
            return "Invalid arguments";
          var E = K.match(/([dinuox]+)?\s*(\/.+\/)?\s*/);
          if (!E || !K.eol())
            return "Invalid arguments";
          if (E[1]) {
            n = E[1].indexOf("i") != -1, a = E[1].indexOf("u") != -1;
            var W = E[1].indexOf("d") != -1 || E[1].indexOf("n") != -1, de = E[1].indexOf("x") != -1, ee = E[1].indexOf("o") != -1;
            if (Number(W) + Number(de) + Number(ee) > 1)
              return "Invalid arguments";
            o = W && "decimal" || de && "hex" || ee && "octal";
          }
          E[2] && (s = new RegExp(E[2].substr(1, E[2].length - 2), n ? "i" : ""));
        }
      }
      var h = c();
      if (h) {
        D(e, h + ": " + t.argString);
        return;
      }
      var v = t.line || e.firstLine(), p = t.lineEnd || t.line || e.lastLine();
      if (v == p)
        return;
      var m = new i(v, 0), k = new i(p, te(e, p)), C = e.getRange(m, k).split(`
`), y = o == "decimal" ? /(-?)([\d]+)/ : o == "hex" ? /(-?)(?:0x)?([0-9a-f]+)/i : o == "octal" ? /([0-7]+)/ : null, x = o == "decimal" ? 10 : o == "hex" ? 16 : o == "octal" ? 8 : void 0, M = [], T = [];
      if (o || s)
        for (var b = 0; b < C.length; b++) {
          var O = s ? C[b].match(s) : null;
          O && O[0] != "" ? M.push(O) : y && y.exec(C[b]) ? M.push(C[b]) : T.push(C[b]);
        }
      else
        T = C;
      function N(K, E) {
        if (r) {
          var W;
          W = K, K = E, E = W;
        }
        n && (K = K.toLowerCase(), E = E.toLowerCase());
        var de = y && y.exec(K), ee = y && y.exec(E);
        if (!de || !ee)
          return K < E ? -1 : 1;
        var pe = parseInt((de[1] + de[2]).toLowerCase(), x), Re = parseInt((ee[1] + ee[2]).toLowerCase(), x);
        return pe - Re;
      }
      function R(K, E) {
        if (r) {
          var W;
          W = K, K = E, E = W;
        }
        return n && (K[0] = K[0].toLowerCase(), E[0] = E[0].toLowerCase()), K[0] < E[0] ? -1 : 1;
      }
      if (M.sort(s ? R : N), s)
        for (var b = 0; b < M.length; b++)
          M[b] = M[b].input;
      else o || T.sort(N);
      if (C = r ? M.concat(T) : T.concat(M), a) {
        var U = C, q;
        C = [];
        for (var b = 0; b < U.length; b++)
          U[b] != q && C.push(U[b]), q = U[b];
      }
      e.replaceRange(C.join(`
`), m, k);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    vglobal: function(e, t) {
      this.global(e, t);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    normal: function(e, t) {
      var r = !1, n = t.argString;
      if (n && n[0] == "!" && (n = n.slice(1), r = !0), n = n.trimStart(), !n) {
        D(e, "Argument is required.");
        return;
      }
      var a = t.line;
      if (typeof a == "number")
        for (var o = isNaN(t.lineEnd) ? a : t.lineEnd, s = a; s <= o; s++)
          e.setCursor(s, 0), Qe(e, t.argString.trimStart(), { noremap: r }), e.state.vim.insertMode && Te(e, !0);
      else
        Qe(e, t.argString.trimStart(), { noremap: r }), e.state.vim.insertMode && Te(e, !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    global: function(e, t) {
      var r = t.argString;
      if (!r) {
        D(e, "Regular Expression missing from global");
        return;
      }
      var n = t.commandName[0] === "v";
      r[0] === "!" && t.commandName[0] === "g" && (n = !0, r = r.slice(1));
      var a = t.line !== void 0 ? t.line : e.firstLine(), o = t.lineEnd || t.line || e.lastLine(), s = sn(r), c = r, h = "";
      if (s && s.length && (c = s[0], h = s.slice(1, s.length).join("/")), c)
        try {
          ze(
            e,
            c,
            !0,
            !0
            /** smartCase */
          );
        } catch {
          D(e, "Invalid regex: " + c);
          return;
        }
      for (var v = ye(e).getQuery(), p = [], m = a; m <= o; m++) {
        var k = e.getLine(m), C = v.test(k);
        C !== n && p.push(h ? e.getLineHandle(m) : k);
      }
      if (!h) {
        D(e, p.join(`
`));
        return;
      }
      var y = 0, x = function() {
        if (y < p.length) {
          var M = p[y++], T = e.getLineNumber(M);
          if (T == null) {
            x();
            return;
          }
          var b = T + 1 + h;
          se.processCommand(e, b, {
            callback: x
          });
        } else e.releaseLineHandles && e.releaseLineHandles();
      };
      x();
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    substitute: function(e, t) {
      if (!e.getSearchCursor)
        throw new Error("Search feature not available. Requires searchcursor.js or any other getSearchCursor implementation.");
      var r = t.argString, n = r ? Qt(r, r[0]) : [], a = "", o = "", s, c, h, v = !1, p = !1;
      if (n && n.length)
        a = n[0], le("pcre") && a !== "" && (a = new RegExp(a).source), o = n[1], o !== void 0 && (le("pcre") ? o = cn(o.replace(/([^\\])&/g, "$1$$&")) : o = fn(o), A.lastSubstituteReplacePart = o), s = n[2] ? n[2].split(" ") : [];
      else if (r && r.length) {
        D(e, "Substitutions should be of the form :s/pattern/replace/");
        return;
      }
      if (s && (c = s[0], h = parseInt(s[1]), c && (c.indexOf("c") != -1 && (v = !0), c.indexOf("g") != -1 && (p = !0), le("pcre") ? a = a + "/" + c : a = a.replace(/\//g, "\\/") + "/" + c)), a)
        try {
          ze(
            e,
            a,
            !0,
            !0
            /** smartCase */
          );
        } catch {
          D(e, "Invalid regex: " + a);
          return;
        }
      if (o = o || A.lastSubstituteReplacePart, o === void 0) {
        D(e, "No previous substitute regular expression");
        return;
      }
      var m = ye(e), k = m.getQuery(), C = t.line !== void 0 ? t.line : e.getCursor().line, y = t.lineEnd || C;
      C == e.firstLine() && y == e.lastLine() && (y = 1 / 0), h && (C = y, y = C + h - 1);
      var x = re(e, new i(C, 0)), M = e.getSearchCursor(k, x);
      mn(e, v, p, C, y, M, k, o, t.callback);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    startinsert: function(e, t) {
      Qe(e, t.argString == "!" ? "A" : "i", {});
    },
    redo: f.commands.redo,
    undo: f.commands.undo,
    /** @arg {CodeMirrorV} cm */
    write: function(e) {
      f.commands.save ? f.commands.save(e) : e.save && e.save();
    },
    /** @arg {CodeMirrorV} cm */
    nohlsearch: function(e) {
      He(e);
    },
    /** @arg {CodeMirrorV} cm */
    yank: function(e) {
      var t = V(e.getCursor()), r = t.line, n = e.getLine(r);
      A.registerController.pushText(
        "0",
        "yank",
        n,
        !0,
        !0
      );
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    delete: function(e, t) {
      var r = t.selectionLine, n = isNaN(t.selectionLineEnd) ? r : t.selectionLineEnd;
      ut.delete(e, { linewise: !0 }, [
        {
          anchor: new i(r, 0),
          head: new i(n + 1, 0)
        }
      ]);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    join: function(e, t) {
      var r = t.selectionLine, n = isNaN(t.selectionLineEnd) ? r : t.selectionLineEnd;
      e.setCursor(new i(r, 0)), _e.joinLines(e, { repeat: n - r }, e.state.vim);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    delmarks: function(e, t) {
      if (!t.argString || !ft(t.argString)) {
        D(e, "Argument required");
        return;
      }
      for (var r = e.state.vim, n = new f.StringStream(ft(t.argString)); !n.eol(); ) {
        n.eatSpace();
        var a = n.pos;
        if (!n.match(/[a-zA-Z]/, !1)) {
          D(e, "Invalid argument: " + t.argString.substring(a));
          return;
        }
        var o = n.next();
        if (n.match("-", !0)) {
          if (!n.match(/[a-zA-Z]/, !1)) {
            D(e, "Invalid argument: " + t.argString.substring(a));
            return;
          }
          var s = o, c = n.next();
          if (s && c && ae(s) == ae(c)) {
            var h = s.charCodeAt(0), v = c.charCodeAt(0);
            if (h >= v) {
              D(e, "Invalid argument: " + t.argString.substring(a));
              return;
            }
            for (var p = 0; p <= v - h; p++) {
              var m = String.fromCharCode(h + p);
              delete r.marks[m];
            }
          } else {
            D(e, "Invalid argument: " + s + "-");
            return;
          }
        } else o && delete r.marks[o];
      }
    }
  }, se = new yn();
  ue.defineEx("version", "ve", (e) => {
    D(e, "Codemirror-vim version: 6.3.0");
  });
  function mn(e, t, r, n, a, o, s, c, h) {
    e.state.vim.exMode = !0;
    var v = !1, p = 0, m, k, C;
    function y() {
      e.operation(function() {
        for (; !v; )
          x(), T();
        b();
      });
    }
    function x() {
      var N = "", R = o.match || o.pos && o.pos.match;
      if (R)
        N = c.replace(/\$(\d{1,3}|[$&])/g, function(K, E) {
          if (E == "$") return "$";
          if (E == "&") return R[0];
          for (var W = E; parseInt(W) >= R.length && W.length > 0; )
            W = W.slice(0, W.length - 1);
          return W ? R[W] + E.slice(W.length, E.length) : K;
        });
      else {
        var U = e.getRange(o.from(), o.to());
        N = U.replace(s, c);
      }
      var q = o.to().line;
      o.replace(N), k = o.to().line, a += k - q, C = k < q;
    }
    function M() {
      var N = m && V(o.to()), R = o.findNext();
      return R && !R[0] && N && he(o.from(), N) && (R = o.findNext()), R && p++, R;
    }
    function T() {
      for (; M() && gn(o.from(), n, a); )
        if (!(!r && o.from().line == k && !C)) {
          e.scrollIntoView(o.from(), 30), e.setSelection(o.from(), o.to()), m = o.from(), v = !1;
          return;
        }
      v = !0;
    }
    function b(N) {
      if (N && N(), e.focus(), m) {
        e.setCursor(m);
        var R = e.state.vim;
        R.exMode = !1, R.lastHPos = R.lastHSPos = m.ch;
      }
      h ? h() : v && D(
        e,
        (p ? "Found " + p + " matches" : "No matches found") + " for pattern: " + s + (le("pcre") ? " (set nopcre to use Vim regexps)" : "")
      );
    }
    function O(N, R, U) {
      f.e_stop(N);
      var q = qe(N);
      switch (q) {
        case "y":
          x(), T();
          break;
        case "n":
          T();
          break;
        case "a":
          var K = h;
          h = void 0, e.operation(y), h = K;
          break;
        case "l":
          x();
        case "q":
        case "<Esc>":
        case "<C-c>":
        case "<C-[>":
          b(U);
          break;
      }
      return v && b(U), !0;
    }
    if (T(), v) {
      D(e, "No matches for " + s + (le("pcre") ? " (set nopcre to use vim regexps)" : ""));
      return;
    }
    if (!t) {
      y(), h && h();
      return;
    }
    et(e, {
      prefix: me("span", "replace with ", me("strong", c), " (y/n/a/q/l)"),
      onKeyDown: O
    });
  }
  function Te(e, t) {
    var r = e.state.vim, n = A.macroModeState, a = A.registerController.getRegister("."), o = n.isPlaying, s = n.lastInsertModeChanges;
    o || (e.off("change", er), r.insertEnd && r.insertEnd.clear(), r.insertEnd = void 0, f.off(e.getInputField(), "keydown", nr)), !o && r.insertModeRepeat && r.insertModeRepeat > 1 && (ir(
      e,
      r,
      r.insertModeRepeat - 1,
      !0
      /** repeatForInsert */
    ), r.lastEditInputState.repeatOverride = r.insertModeRepeat), delete r.insertModeRepeat, r.insertMode = !1, t || e.setCursor(e.getCursor().line, e.getCursor().ch - 1), e.setOption("keyMap", "vim"), e.setOption("disableInput", !0), e.toggleOverwrite(!1), a.setText(s.changes.join("")), f.signal(e, "vim-mode-change", { mode: "normal" }), n.isRecording && Mn(n);
  }
  function gt(e) {
    u.unshift(e), e.keys && Cn(e.keys);
  }
  function Cn(e) {
    e.split(/(<(?:[CSMA]-)*\w+>|.)/i).forEach(function(t) {
      t && (d[t] || (d[t] = 0), d[t]++);
    });
  }
  function kn(e) {
    e.split(/(<(?:[CSMA]-)*\w+>|.)/i).forEach(function(t) {
      d[t] && d[t]--;
    });
  }
  function wn(e, t, r, n, a) {
    var o = { keys: e, type: t };
    o[t] = r, o[t + "Args"] = n;
    for (var s in a)
      o[s] = a[s];
    gt(o);
  }
  Ne("insertModeEscKeysTimeout", 200, "number");
  function xn(e, t, r, n) {
    var a = A.registerController.getRegister(n);
    if (n == ":") {
      a.keyBuffer[0] && se.processCommand(e, a.keyBuffer[0]), r.isPlaying = !1;
      return;
    }
    var o = a.keyBuffer, s = 0;
    r.isPlaying = !0, r.replaySearchQueries = a.searchQueries.slice(0);
    for (var c = 0; c < o.length; c++)
      for (var h = o[c], v, p, m = /<(?:[CSMA]-)*\w+>|./gi; v = m.exec(h); )
        if (p = v[0], ue.handleKey(e, p, "macro"), t.insertMode) {
          var k = a.insertModeChanges[s++].changes;
          A.macroModeState.lastInsertModeChanges.changes = k, or(e, k, 1), Te(e);
        }
    r.isPlaying = !1;
  }
  function Sn(e, t) {
    if (!e.isPlaying) {
      var r = e.latestRegister, n = A.registerController.getRegister(r);
      n && n.pushText(t);
    }
  }
  function Mn(e) {
    if (!e.isPlaying) {
      var t = e.latestRegister, r = A.registerController.getRegister(t);
      r && r.pushInsertModeChanges && r.pushInsertModeChanges(e.lastInsertModeChanges);
    }
  }
  function Ln(e, t) {
    if (!e.isPlaying) {
      var r = e.latestRegister, n = A.registerController.getRegister(r);
      n && n.pushSearchQuery && n.pushSearchQuery(t);
    }
  }
  function er(e, t) {
    var r = A.macroModeState, n = r.lastInsertModeChanges;
    if (!r.isPlaying)
      for (var a = e.state.vim; t; ) {
        if (n.expectCursorActivityForChange = !0, n.ignoreCount > 1)
          n.ignoreCount--;
        else if (t.origin == "+input" || t.origin == "paste" || t.origin === void 0) {
          var o = e.listSelections().length;
          o > 1 && (n.ignoreCount = o);
          var s = t.text.join(`
`);
          if (n.maybeReset && (n.changes = [], n.maybeReset = !1), s)
            if (e.state.overwrite && !/\n/.test(s))
              n.changes.push([s]);
            else {
              if (s.length > 1) {
                var c = a && a.insertEnd && a.insertEnd.find(), h = e.getCursor();
                if (c && c.line == h.line) {
                  var v = c.ch - h.ch;
                  v > 0 && v < s.length && (n.changes.push([s, v]), s = "");
                }
              }
              s && n.changes.push(s);
            }
        }
        t = t.next;
      }
  }
  function tr(e) {
    var a;
    var t = e.state.vim;
    if (t.insertMode) {
      var r = A.macroModeState;
      if (r.isPlaying)
        return;
      var n = r.lastInsertModeChanges;
      n.expectCursorActivityForChange ? n.expectCursorActivityForChange = !1 : (n.maybeReset = !0, t.insertEnd && t.insertEnd.clear(), t.insertEnd = e.setBookmark(e.getCursor(), { insertLeft: !0 }));
    } else (a = e.curOp) != null && a.isVimOp || rr(e, t);
  }
  function rr(e, t) {
    var r = e.getCursor("anchor"), n = e.getCursor("head");
    if (t.visualMode && !e.somethingSelected() ? xe(e, !1) : !t.visualMode && !t.insertMode && e.somethingSelected() && (t.visualMode = !0, t.visualLine = !1, f.signal(e, "vim-mode-change", { mode: "visual" })), t.visualMode) {
      var a = J(n, r) ? 0 : -1, o = J(n, r) ? -1 : 0;
      n = G(n, 0, a), r = G(r, 0, o), t.sel = {
        anchor: r,
        head: n
      }, be(e, t, "<", ne(n, r)), be(e, t, ">", Ae(n, r));
    } else t.insertMode || (t.lastHPos = e.getCursor().ch);
  }
  function nr(e) {
    var t = A.macroModeState, r = t.lastInsertModeChanges, n = f.keyName ? f.keyName(e) : e.key;
    n && (n.indexOf("Delete") != -1 || n.indexOf("Backspace") != -1) && (r.maybeReset && (r.changes = [], r.maybeReset = !1), r.changes.push(new st(n, e)));
  }
  function ir(e, t, r, n) {
    var a = A.macroModeState;
    a.isPlaying = !0;
    var o = t.lastEditActionCommand, s = t.inputState;
    function c() {
      o ? Oe.processAction(e, t, o) : Oe.evalInput(e, t);
    }
    function h(p) {
      if (a.lastInsertModeChanges.changes.length > 0) {
        p = t.lastEditActionCommand ? p : 1;
        var m = a.lastInsertModeChanges;
        or(e, m.changes, p);
      }
    }
    if (t.inputState = t.lastEditInputState, o && o.interlaceInsertRepeat)
      for (var v = 0; v < r; v++)
        c(), h(1);
    else
      n || c(), h(r);
    t.inputState = s, t.insertMode && !n && Te(e), a.isPlaying = !1;
  }
  function ar(e, t) {
    f.lookupKey(t, "vim-insert", function(n) {
      return typeof n == "string" ? f.commands[n](e) : n(e), !0;
    });
  }
  function or(e, t, r) {
    var n = e.getCursor("head"), a = A.macroModeState.lastInsertModeChanges.visualBlock;
    a && (Kt(e, n, a + 1), r = e.listSelections().length, e.setCursor(n));
    for (var o = 0; o < r; o++) {
      a && e.setCursor(G(n, o, 0));
      for (var s = 0; s < t.length; s++) {
        var c = t[s];
        if (c instanceof st)
          ar(e, c.keyName);
        else if (typeof c == "string")
          e.replaceSelection(c);
        else {
          var h = e.getCursor(), v = G(h, 0, c[0].length - (c[1] || 0));
          e.replaceRange(c[0], h, c[1] ? h : v), e.setCursor(v);
        }
      }
    }
    a && e.setCursor(G(n, 0, 1));
  }
  function yt(e) {
    var t = new e.constructor();
    return Object.keys(e).forEach(function(r) {
      if (r != "insertEnd") {
        var n = e[r];
        Array.isArray(n) ? n = n.slice() : n && typeof n == "object" && n.constructor != Object && (n = yt(n)), t[r] = n;
      }
    }), e.sel && (t.sel = {
      head: e.sel.head && V(e.sel.head),
      anchor: e.sel.anchor && V(e.sel.anchor)
    }), t;
  }
  function bn(e, t, r) {
    var o = Pe(e), n = (
      /**@type {CodeMirrorV}*/
      e
    ), a = !1, o = ue.maybeInitVimState_(n), s = o.visualBlock || o.wasInVisualBlock;
    if (n.state.closeVimNotification) {
      var c = n.state.closeVimNotification;
      if (n.state.closeVimNotification = null, c(), t == "<CR>")
        return Y(n), !0;
    }
    var h = n.isInMultiSelectMode();
    if (o.wasInVisualBlock && !h ? o.wasInVisualBlock = !1 : h && o.visualBlock && (o.wasInVisualBlock = !0), t == "<Esc>" && !o.insertMode && !o.visualMode && h && o.status == "<Esc>")
      Y(n);
    else if (s || !h || n.inVirtualSelectionMode)
      a = ue.handleKey(n, t, r);
    else {
      var v = yt(o), p = o.inputState.changeQueueList || [];
      n.operation(function() {
        var k;
        n.curOp && (n.curOp.isVimOp = !0);
        var m = 0;
        n.forEachSelection(function() {
          n.state.vim.inputState.changeQueue = p[m];
          var C = n.getCursor("head"), y = n.getCursor("anchor"), x = J(C, y) ? 0 : -1, M = J(C, y) ? -1 : 0;
          C = G(C, 0, x), y = G(y, 0, M), n.state.vim.sel.head = C, n.state.vim.sel.anchor = y, a = ue.handleKey(n, t, r), n.virtualSelection && (p[m] = n.state.vim.inputState.changeQueue, n.state.vim = yt(v)), m++;
        }), (k = n.curOp) != null && k.cursorActivity && !a && (n.curOp.cursorActivity = !1), n.state.vim = o, o.inputState.changeQueueList = p, o.inputState.changeQueue = null;
      }, !0);
    }
    return a && !o.visualMode && !o.insertMode && o.visualMode != n.somethingSelected() && rr(n, o), a;
  }
  return At(), ue;
}
function fe(f, i) {
  var l = i.ch, u = i.line + 1;
  u < 1 && (u = 1, l = 0), u > f.lines && (u = f.lines, l = Number.MAX_VALUE);
  var d = f.line(u);
  return Math.min(d.from + Math.max(0, l), d.to);
}
function ve(f, i) {
  let l = f.lineAt(i);
  return { line: l.number - 1, ch: i - l.from };
}
class Me {
  constructor(i, l) {
    this.line = i, this.ch = l;
  }
}
function xr(f, i, l) {
  if (f.addEventListener)
    f.addEventListener(i, l, !1);
  else {
    var u = f._handlers || (f._handlers = {});
    u[i] = (u[i] || []).concat(l);
  }
}
function Sr(f, i, l) {
  if (f.removeEventListener)
    f.removeEventListener(i, l, !1);
  else {
    var u = f._handlers, d = u && u[i];
    if (d) {
      var g = d.indexOf(l);
      g > -1 && (u[i] = d.slice(0, g).concat(d.slice(g + 1)));
    }
  }
}
function Mr(f, i, ...l) {
  var u, d = (u = f._handlers) === null || u === void 0 ? void 0 : u[i];
  if (d)
    for (var g = 0; g < d.length; ++g)
      d[g](...l);
}
function fr(f, ...i) {
  if (f)
    for (var l = 0; l < f.length; ++l)
      f[l](...i);
}
let xt;
try {
  xt = /* @__PURE__ */ new RegExp("[\\w\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
  xt = /[\w]/;
}
function Xe(f, i) {
  var l = f.cm6;
  if (!l.state.readOnly) {
    var u = "input.type.compose";
    if (f.curOp && (f.curOp.lastChange || (u = "input.type.compose.start")), i.annotations)
      try {
        i.annotations.some(function(d) {
          d.value == "input" && (d.value = u);
        });
      } catch (d) {
        console.error(d);
      }
    else
      i.userEvent = u;
    return l.dispatch(i);
  }
}
function cr(f, i) {
  var l;
  f.curOp && (f.curOp.$changeStart = void 0), (i ? zn : Jn)(f.cm6);
  let u = (l = f.curOp) === null || l === void 0 ? void 0 : l.$changeStart;
  u != null && f.cm6.dispatch({ selection: { anchor: u } });
}
var ai = {
  Left: (f) => Ve(f.cm6, { key: "Left" }, "editor"),
  Right: (f) => Ve(f.cm6, { key: "Right" }, "editor"),
  Up: (f) => Ve(f.cm6, { key: "Up" }, "editor"),
  Down: (f) => Ve(f.cm6, { key: "Down" }, "editor"),
  Backspace: (f) => Ve(f.cm6, { key: "Backspace" }, "editor"),
  Delete: (f) => Ve(f.cm6, { key: "Delete" }, "editor")
};
class I {
  // --------------------------
  openDialog(i, l, u) {
    return si(this, i, l, u);
  }
  openNotification(i, l) {
    return oi(this, i, l);
  }
  constructor(i) {
    this.state = {}, this.marks = /* @__PURE__ */ Object.create(null), this.$mid = 0, this.options = {}, this._handlers = {}, this.$lastChangeEndOffset = 0, this.virtualSelection = null, this.cm6 = i, this.onChange = this.onChange.bind(this), this.onSelectionChange = this.onSelectionChange.bind(this);
  }
  on(i, l) {
    xr(this, i, l);
  }
  off(i, l) {
    Sr(this, i, l);
  }
  signal(i, l, u) {
    Mr(this, i, l, u);
  }
  indexFromPos(i) {
    return fe(this.cm6.state.doc, i);
  }
  posFromIndex(i) {
    return ve(this.cm6.state.doc, i);
  }
  foldCode(i) {
    let l = this.cm6, u = l.state.selection.ranges, d = this.cm6.state.doc, g = fe(d, i), w = Ce.create([Ce.range(g, g)], 0).ranges;
    l.state.selection.ranges = w, In(l), l.state.selection.ranges = u;
  }
  firstLine() {
    return 0;
  }
  lastLine() {
    return this.cm6.state.doc.lines - 1;
  }
  lineCount() {
    return this.cm6.state.doc.lines;
  }
  setCursor(i, l) {
    typeof i == "object" && (l = i.ch, i = i.line);
    var u = fe(this.cm6.state.doc, { line: i, ch: l || 0 });
    this.cm6.dispatch({ selection: { anchor: u } }, { scrollIntoView: !this.curOp }), this.curOp && !this.curOp.isVimOp && this.onBeforeEndOperation();
  }
  getCursor(i) {
    var l = this.cm6.state.selection.main, u = i == "head" || !i ? l.head : i == "anchor" ? l.anchor : i == "start" ? l.from : i == "end" ? l.to : null;
    if (u == null)
      throw new Error("Invalid cursor type");
    return this.posFromIndex(u);
  }
  listSelections() {
    var i = this.cm6.state.doc;
    return this.cm6.state.selection.ranges.map((l) => ({
      anchor: ve(i, l.anchor),
      head: ve(i, l.head)
    }));
  }
  setSelections(i, l) {
    var u = this.cm6.state.doc, d = i.map((g) => {
      var w = fe(u, g.head), S = fe(u, g.anchor);
      return w == S ? Ce.cursor(w, 1) : Ce.range(S, w);
    });
    this.cm6.dispatch({
      selection: Ce.create(d, l)
    });
  }
  setSelection(i, l, u) {
    this.setSelections([{ anchor: i, head: l }], 0), u && u.origin == "*mouse" && this.onBeforeEndOperation();
  }
  getLine(i) {
    var l = this.cm6.state.doc;
    return i < 0 || i >= l.lines ? "" : this.cm6.state.doc.line(i + 1).text;
  }
  getLineHandle(i) {
    return this.$lineHandleChanges || (this.$lineHandleChanges = []), { row: i, index: this.indexFromPos(new Me(i, 0)) };
  }
  getLineNumber(i) {
    var l = this.$lineHandleChanges;
    if (!l)
      return null;
    for (var u = i.index, d = 0; d < l.length; d++)
      if (u = l[d].changes.mapPos(u, 1, vr.TrackAfter), u == null)
        return null;
    var g = this.posFromIndex(u);
    return g.ch == 0 ? g.line : null;
  }
  releaseLineHandles() {
    this.$lineHandleChanges = void 0;
  }
  getRange(i, l) {
    var u = this.cm6.state.doc;
    return this.cm6.state.sliceDoc(fe(u, i), fe(u, l));
  }
  replaceRange(i, l, u, d) {
    u || (u = l);
    var g = this.cm6.state.doc, w = fe(g, l), S = fe(g, u);
    Xe(this, { changes: { from: w, to: S, insert: i } });
  }
  replaceSelection(i) {
    Xe(this, this.cm6.state.replaceSelection(i));
  }
  replaceSelections(i) {
    var l = this.cm6.state.selection.ranges, u = l.map((d, g) => ({ from: d.from, to: d.to, insert: i[g] || "" }));
    Xe(this, { changes: u });
  }
  getSelection() {
    return this.getSelections().join(`
`);
  }
  getSelections() {
    var i = this.cm6;
    return i.state.selection.ranges.map((l) => i.state.sliceDoc(l.from, l.to));
  }
  somethingSelected() {
    return this.cm6.state.selection.ranges.some((i) => !i.empty);
  }
  getInputField() {
    return this.cm6.contentDOM;
  }
  clipPos(i) {
    var l = this.cm6.state.doc, u = i.ch, d = i.line + 1;
    d < 1 && (d = 1, u = 0), d > l.lines && (d = l.lines, u = Number.MAX_VALUE);
    var g = l.line(d);
    return u = Math.min(Math.max(0, u), g.to - g.from), new Me(d - 1, u);
  }
  getValue() {
    return this.cm6.state.doc.toString();
  }
  setValue(i) {
    var l = this.cm6;
    return l.dispatch({
      changes: { from: 0, to: l.state.doc.length, insert: i },
      selection: Ce.range(0, 0)
    });
  }
  focus() {
    return this.cm6.focus();
  }
  blur() {
    return this.cm6.contentDOM.blur();
  }
  defaultTextHeight() {
    return this.cm6.defaultLineHeight;
  }
  findMatchingBracket(i, l) {
    var u = this.cm6.state, d = fe(u.doc, i), g = sr(u, d + 1, -1);
    return g && g.end ? { to: ve(u.doc, g.end.from) } : (g = sr(u, d, 1), g && g.end ? { to: ve(u.doc, g.end.from) } : { to: void 0 });
  }
  scanForBracket(i, l, u, d) {
    return fi(this, i, l, u, d);
  }
  indentLine(i, l) {
    l ? this.indentMore() : this.indentLess();
  }
  indentMore() {
    Bn(this.cm6);
  }
  indentLess() {
    Nn(this.cm6);
  }
  execCommand(i) {
    if (i == "indentAuto")
      I.commands.indentAuto(this);
    else if (i == "goLineLeft")
      Pn(this.cm6);
    else if (i == "goLineRight") {
      Kn(this.cm6);
      let l = this.cm6.state, u = l.selection.main.head;
      u < l.doc.length && l.sliceDoc(u, u + 1) !== `
` && Dn(this.cm6);
    } else
      console.log(i + " is not implemented");
  }
  setBookmark(i, l) {
    var u = l != null && l.insertLeft ? 1 : -1, d = this.indexFromPos(i), g = new di(this, d, u);
    return g;
  }
  addOverlay({ query: i }) {
    let l = new Gn({
      regexp: !0,
      search: i.source,
      caseSensitive: !/i/.test(i.flags)
    });
    if (l.valid) {
      l.forVim = !0, this.cm6Query = l;
      let u = wt.of(l);
      return this.cm6.dispatch({ effects: u }), l;
    }
  }
  removeOverlay(i) {
    if (!this.cm6Query)
      return;
    this.cm6Query.forVim = !1;
    let l = wt.of(this.cm6Query);
    this.cm6.dispatch({ effects: l });
  }
  getSearchCursor(i, l) {
    var u = this, d = null, g = null, w = !1;
    l.ch == null && (l.ch = Number.MAX_VALUE);
    var S = fe(u.cm6.state.doc, l), L = i.source.replace(/(\\.|{(?:\d+(?:,\d*)?|,\d+)})|[{}]/g, function(B, F) {
      return F || "\\" + B;
    });
    function P(B, F = 0, Q = B.length) {
      return new Lt(B, L, { ignoreCase: i.ignoreCase }, F, Q);
    }
    function _(B) {
      var F = u.cm6.state.doc;
      if (B > F.length)
        return null;
      let Q = P(F, B).next();
      return Q.done ? null : Q.value;
    }
    var H = 1e4;
    function j(B, F) {
      var Q = u.cm6.state.doc;
      for (let $ = 1; ; $++) {
        let z = Math.max(B, F - $ * H), ie = P(Q, z, F), ae = null;
        for (; !ie.next().done; )
          ae = ie.value;
        if (ae && (z == B || ae.from > z + 10))
          return ae;
        if (z == B)
          return null;
      }
    }
    return {
      findNext: function() {
        return this.find(!1);
      },
      findPrevious: function() {
        return this.find(!0);
      },
      find: function(B) {
        var F = u.cm6.state.doc;
        if (B) {
          let Q = d ? w ? d.to - 1 : d.from : S;
          d = j(0, Q);
        } else {
          let Q = d ? w ? d.to + 1 : d.to : S;
          d = _(Q);
        }
        return g = d && {
          from: ve(F, d.from),
          to: ve(F, d.to),
          match: d.match
        }, w = d ? d.from == d.to : !1, d && d.match;
      },
      from: function() {
        return g == null ? void 0 : g.from;
      },
      to: function() {
        return g == null ? void 0 : g.to;
      },
      replace: function(B) {
        d && (Xe(u, {
          changes: { from: d.from, to: d.to, insert: B }
        }), d.to = d.from + B.length, g && (g.to = ve(u.cm6.state.doc, d.to)));
      },
      get match() {
        return g && g.match;
      }
    };
  }
  findPosV(i, l, u, d) {
    let { cm6: g } = this;
    const w = g.state.doc;
    let S = u == "page" ? g.dom.clientHeight : 0;
    const L = fe(w, i);
    let P = Ce.cursor(L, 1, void 0, d), _ = Math.round(Math.abs(l));
    for (let j = 0; j < _; j++)
      u == "page" ? P = g.moveVertically(P, l > 0, S) : u == "line" && (P = g.moveVertically(P, l > 0));
    let H = ve(w, P.head);
    return (l < 0 && P.head == 0 && d != 0 && i.line == 0 && i.ch != 0 || l > 0 && P.head == w.length && H.ch != d && i.line == H.line) && (H.hitSide = !0), H;
  }
  charCoords(i, l) {
    var u = this.cm6.contentDOM.getBoundingClientRect(), d = fe(this.cm6.state.doc, i), g = this.cm6.coordsAtPos(d), w = -u.top;
    return { left: ((g == null ? void 0 : g.left) || 0) - u.left, top: ((g == null ? void 0 : g.top) || 0) + w, bottom: ((g == null ? void 0 : g.bottom) || 0) + w };
  }
  coordsChar(i, l) {
    var u = this.cm6.contentDOM.getBoundingClientRect(), d = this.cm6.posAtCoords({ x: i.left + u.left, y: i.top + u.top }) || 0;
    return ve(this.cm6.state.doc, d);
  }
  getScrollInfo() {
    var i = this.cm6.scrollDOM;
    return {
      left: i.scrollLeft,
      top: i.scrollTop,
      height: i.scrollHeight,
      width: i.scrollWidth,
      clientHeight: i.clientHeight,
      clientWidth: i.clientWidth
    };
  }
  scrollTo(i, l) {
    i != null && (this.cm6.scrollDOM.scrollLeft = i), l != null && (this.cm6.scrollDOM.scrollTop = l);
  }
  scrollIntoView(i, l) {
    if (i) {
      var u = this.indexFromPos(i);
      this.cm6.dispatch({
        effects: at.scrollIntoView(u)
      });
    } else
      this.cm6.dispatch({ scrollIntoView: !0, userEvent: "scroll" });
  }
  getWrapperElement() {
    return this.cm6.dom;
  }
  // for tests
  getMode() {
    return { name: this.getOption("mode") };
  }
  setSize(i, l) {
    this.cm6.dom.style.width = i + 4 + "px", this.cm6.dom.style.height = l + "px", this.refresh();
  }
  refresh() {
    this.cm6.measure();
  }
  // event listeners
  destroy() {
    this.removeOverlay();
  }
  getLastEditEnd() {
    return this.posFromIndex(this.$lastChangeEndOffset);
  }
  onChange(i) {
    this.$lineHandleChanges && this.$lineHandleChanges.push(i);
    for (let u in this.marks)
      this.marks[u].update(i.changes);
    this.virtualSelection && (this.virtualSelection.ranges = this.virtualSelection.ranges.map((u) => u.map(i.changes)));
    var l = this.curOp = this.curOp || {};
    i.changes.iterChanges((u, d, g, w, S) => {
      (l.$changeStart == null || l.$changeStart > g) && (l.$changeStart = g), this.$lastChangeEndOffset = w;
      var L = { text: S.toJSON() };
      l.lastChange ? l.lastChange.next = l.lastChange = L : l.lastChange = l.change = L;
    }, !0), l.changeHandlers || (l.changeHandlers = this._handlers.change && this._handlers.change.slice());
  }
  onSelectionChange() {
    var i = this.curOp = this.curOp || {};
    i.cursorActivityHandlers || (i.cursorActivityHandlers = this._handlers.cursorActivity && this._handlers.cursorActivity.slice()), this.curOp.cursorActivity = !0;
  }
  operation(i, l) {
    this.curOp || (this.curOp = { $d: 0 }), this.curOp.$d++;
    try {
      var u = i();
    } finally {
      this.curOp && (this.curOp.$d--, this.curOp.$d || this.onBeforeEndOperation());
    }
    return u;
  }
  onBeforeEndOperation() {
    var i = this.curOp, l = !1;
    i && (i.change && fr(i.changeHandlers, this, i.change), i && i.cursorActivity && (fr(i.cursorActivityHandlers, this, null), i.isVimOp && (l = !0)), this.curOp = null), l && this.scrollIntoView();
  }
  moveH(i, l) {
    if (l == "char") {
      var u = this.getCursor();
      this.setCursor(u.line, u.ch + i);
    }
  }
  setOption(i, l) {
    switch (i) {
      case "keyMap":
        this.state.keyMap = l;
        break;
      case "textwidth":
        this.state.textwidth = l;
        break;
    }
  }
  getOption(i) {
    switch (i) {
      case "firstLineNumber":
        return 1;
      case "tabSize":
        return this.cm6.state.tabSize || 4;
      case "readOnly":
        return this.cm6.state.readOnly;
      case "indentWithTabs":
        return this.cm6.state.facet(lr) == "	";
      case "indentUnit":
        return this.cm6.state.facet(lr).length || 2;
      case "textwidth":
        return this.state.textwidth;
      case "keyMap":
        return this.state.keyMap || "vim";
    }
  }
  toggleOverwrite(i) {
    this.state.overwrite = i;
  }
  getTokenTypeAt(i) {
    var l, u = this.indexFromPos(i), d = gr(this.cm6.state, u), g = d == null ? void 0 : d.resolve(u), w = ((l = g == null ? void 0 : g.type) === null || l === void 0 ? void 0 : l.name) || "";
    return /comment/i.test(w) ? "comment" : /string/i.test(w) ? "string" : "";
  }
  overWriteSelection(i) {
    var l = this.cm6.state.doc, u = this.cm6.state.selection, d = u.ranges.map((g) => {
      if (g.empty) {
        var w = g.to < l.length ? l.sliceString(g.from, g.to + 1) : "";
        if (w && !/\n/.test(w))
          return Ce.range(g.from, g.to + 1);
      }
      return g;
    });
    this.cm6.dispatch({
      selection: Ce.create(d, u.mainIndex)
    }), this.replaceSelection(i);
  }
  /*** multiselect ****/
  isInMultiSelectMode() {
    return this.cm6.state.selection.ranges.length > 1;
  }
  virtualSelectionMode() {
    return !!this.virtualSelection;
  }
  forEachSelection(i) {
    var l = this.cm6.state.selection;
    this.virtualSelection = Ce.create(l.ranges, l.mainIndex);
    for (var u = 0; u < this.virtualSelection.ranges.length; u++) {
      var d = this.virtualSelection.ranges[u];
      d && (this.cm6.dispatch({ selection: Ce.create([d]) }), i(), this.virtualSelection.ranges[u] = this.cm6.state.selection.ranges[0]);
    }
    this.cm6.dispatch({ selection: this.virtualSelection }), this.virtualSelection = null;
  }
  hardWrap(i) {
    return pi(this, i);
  }
}
I.isMac = typeof navigator < "u" && /* @__PURE__ */ /Mac/.test(navigator.platform);
I.Pos = Me;
I.StringStream = jn;
I.commands = {
  cursorCharLeft: function(f) {
    qn(f.cm6);
  },
  redo: function(f) {
    cr(f, !1);
  },
  undo: function(f) {
    cr(f, !0);
  },
  newlineAndIndent: function(f) {
    Qn({
      state: f.cm6.state,
      dispatch: (i) => Xe(f, i)
    });
  },
  indentAuto: function(f) {
    Un(f.cm6);
  },
  newlineAndIndentContinueComment: void 0,
  save: void 0
};
I.isWordChar = function(f) {
  return xt.test(f);
};
I.keys = ai;
I.addClass = function(f, i) {
};
I.rmClass = function(f, i) {
};
I.e_preventDefault = function(f) {
  f.preventDefault();
};
I.e_stop = function(f) {
  var i, l;
  (i = f == null ? void 0 : f.stopPropagation) === null || i === void 0 || i.call(f), (l = f == null ? void 0 : f.preventDefault) === null || l === void 0 || l.call(f);
};
I.lookupKey = function(i, l, u) {
  var d = I.keys[i];
  !d && /^Arrow/.test(i) && (d = I.keys[i.slice(5)]), d && u(d);
};
I.on = xr;
I.off = Sr;
I.signal = Mr;
I.findMatchingTag = ci;
I.findEnclosingTag = hi;
I.keyName = void 0;
function Lr(f, i, l) {
  var u = document.createElement("div");
  return u.appendChild(i), u;
}
function br(f, i) {
  f.state.currentNotificationClose && f.state.currentNotificationClose(), f.state.currentNotificationClose = i;
}
function oi(f, i, l) {
  br(f, S);
  var u = Lr(f, i, l && l.bottom), d = !1, g, w = l && typeof l.duration < "u" ? l.duration : 5e3;
  function S() {
    d || (d = !0, clearTimeout(g), u.remove(), Tr(f, u));
  }
  return u.onclick = function(L) {
    L.preventDefault(), S();
  }, Ar(f, u), w && (g = setTimeout(S, w)), S;
}
function Ar(f, i) {
  var l = f.state.dialog;
  f.state.dialog = i, i.style.flex = "1", i && l !== i && (l && l.contains(document.activeElement) && f.focus(), l && l.parentElement ? l.parentElement.replaceChild(i, l) : l && l.remove(), I.signal(f, "dialog"));
}
function Tr(f, i) {
  f.state.dialog == i && (f.state.dialog = null, I.signal(f, "dialog"));
}
function si(f, i, l, u) {
  u || (u = {}), br(f, void 0);
  var d = Lr(f, i, u.bottom), g = !1;
  Ar(f, d);
  function w(L) {
    if (typeof L == "string")
      S.value = L;
    else {
      if (g)
        return;
      g = !0, Tr(f, d), f.state.dialog || f.focus(), u.onClose && u.onClose(d);
    }
  }
  var S = d.getElementsByTagName("input")[0];
  return S && (u.value && (S.value = u.value, u.selectValueOnOpen !== !1 && S.select()), u.onInput && I.on(S, "input", function(L) {
    u.onInput(L, S.value, w);
  }), u.onKeyUp && I.on(S, "keyup", function(L) {
    u.onKeyUp(L, S.value, w);
  }), I.on(S, "keydown", function(L) {
    u && u.onKeyDown && u.onKeyDown(L, S.value, w) || (L.keyCode == 13 && l && l(S.value), (L.keyCode == 27 || u.closeOnEnter !== !1 && L.keyCode == 13) && (S.blur(), I.e_stop(L), w()));
  }), u.closeOnBlur !== !1 && I.on(S, "blur", function() {
    setTimeout(function() {
      document.activeElement !== S && w();
    });
  }), S.focus()), w;
}
var li = { "(": ")>", ")": "(<", "[": "]>", "]": "[<", "{": "}>", "}": "{<", "<": ">>", ">": "<<" };
function ui(f) {
  return f && f.bracketRegex || /[(){}[\]]/;
}
function fi(f, i, l, u, d) {
  for (var g = d && d.maxScanLineLength || 1e4, w = d && d.maxScanLines || 1e3, S = [], L = ui(d), P = l > 0 ? Math.min(i.line + w, f.lastLine() + 1) : Math.max(f.firstLine() - 1, i.line - w), _ = i.line; _ != P; _ += l) {
    var H = f.getLine(_);
    if (H) {
      var j = l > 0 ? 0 : H.length - 1, B = l > 0 ? H.length : -1;
      if (!(H.length > g))
        for (_ == i.line && (j = i.ch - (l < 0 ? 1 : 0)); j != B; j += l) {
          var F = H.charAt(j);
          if (L.test(F)) {
            var Q = li[F];
            if (Q && Q.charAt(1) == ">" == l > 0)
              S.push(F);
            else if (S.length)
              S.pop();
            else
              return { pos: new Me(_, j), ch: F };
          }
        }
    }
  }
  return _ - l == (l > 0 ? f.lastLine() : f.firstLine()) ? !1 : null;
}
function ci(f, i) {
  return null;
}
function hi(f, i) {
  var l, u, d = f.cm6.state, g = f.indexFromPos(i);
  if (g < d.doc.length) {
    var w = d.sliceDoc(g, g + 1);
    w == "<" && g++;
  }
  for (var S = gr(d, g), L = (S == null ? void 0 : S.resolve(g)) || null; L; ) {
    if (((l = L.firstChild) === null || l === void 0 ? void 0 : l.type.name) == "OpenTag" && ((u = L.lastChild) === null || u === void 0 ? void 0 : u.type.name) == "CloseTag")
      return {
        open: hr(d.doc, L.firstChild),
        close: hr(d.doc, L.lastChild)
      };
    L = L.parent;
  }
}
function hr(f, i) {
  return {
    from: ve(f, i.from),
    to: ve(f, i.to)
  };
}
class di {
  constructor(i, l, u) {
    this.cm = i, this.id = i.$mid++, this.offset = l, this.assoc = u, i.marks[this.id] = this;
  }
  clear() {
    delete this.cm.marks[this.id];
  }
  find() {
    return this.offset == null ? null : this.cm.posFromIndex(this.offset);
  }
  update(i) {
    this.offset != null && (this.offset = i.mapPos(this.offset, this.assoc, vr.TrackDel));
  }
}
function pi(f, i) {
  for (var l, u = i.column || f.getOption("textwidth") || 80, d = i.allowMerge != !1, g = Math.min(i.from, i.to), w = Math.max(i.from, i.to); g <= w; ) {
    var S = f.getLine(g);
    if (S.length > u) {
      var L = F(S, u, 5);
      if (L) {
        var P = (l = /^\s*/.exec(S)) === null || l === void 0 ? void 0 : l[0];
        f.replaceRange(`
` + P, new Me(g, L.start), new Me(g, L.end));
      }
      w++;
    } else if (d && /\S/.test(S) && g != w) {
      var _ = f.getLine(g + 1);
      if (_ && /\S/.test(_)) {
        var H = S.replace(/\s+$/, ""), j = _.replace(/^\s+/, ""), B = H + " " + j, L = F(B, u, 5);
        L && L.start > H.length || B.length < u ? (f.replaceRange(" ", new Me(g, H.length), new Me(g + 1, _.length - j.length)), g--, w--) : H.length < S.length && f.replaceRange("", new Me(g, H.length), new Me(g, S.length));
      }
    }
    g++;
  }
  return g;
  function F(Q, $, z) {
    if (!(Q.length < $)) {
      var ie = Q.slice(0, $), ae = Q.slice($), ce = /^(?:(\s+)|(\S+)(\s+))/.exec(ae), oe = /(?:(\s+)|(\s+)(\S+))$/.exec(ie), ge = 0, Z = 0;
      if (oe && !oe[2] && (ge = $ - oe[1].length, Z = $), ce && !ce[2] && (ge || (ge = $), Z = $ + ce[1].length), ge)
        return {
          start: ge,
          end: Z
        };
      if (oe && oe[2] && oe.index > z)
        return {
          start: oe.index,
          end: oe.index + oe[2].length
        };
      if (ce && ce[2])
        return ge = $ + ce[2].length, {
          start: ge,
          end: ge + ce[3].length
        };
    }
  }
}
let St = Wn || /* @__PURE__ */ function() {
  let f = { cursorBlinkRate: 1200 };
  return function() {
    return f;
  };
}();
class vi {
  constructor(i, l, u, d, g, w, S, L, P, _) {
    this.left = i, this.top = l, this.height = u, this.fontFamily = d, this.fontSize = g, this.fontWeight = w, this.color = S, this.className = L, this.letter = P, this.partial = _;
  }
  draw() {
    let i = document.createElement("div");
    return i.className = this.className, this.adjust(i), i;
  }
  adjust(i) {
    i.style.left = this.left + "px", i.style.top = this.top + "px", i.style.height = this.height + "px", i.style.lineHeight = this.height + "px", i.style.fontFamily = this.fontFamily, i.style.fontSize = this.fontSize, i.style.fontWeight = this.fontWeight, i.style.color = this.partial ? "transparent" : this.color, i.className = this.className, i.textContent = this.letter;
  }
  eq(i) {
    return this.left == i.left && this.top == i.top && this.height == i.height && this.fontFamily == i.fontFamily && this.fontSize == i.fontSize && this.fontWeight == i.fontWeight && this.color == i.color && this.className == i.className && this.letter == i.letter;
  }
}
class gi {
  constructor(i, l) {
    this.view = i, this.rangePieces = [], this.cursors = [], this.cm = l, this.measureReq = { read: this.readPos.bind(this), write: this.drawSel.bind(this) }, this.cursorLayer = i.scrollDOM.appendChild(document.createElement("div")), this.cursorLayer.className = "cm-cursorLayer cm-vimCursorLayer", this.cursorLayer.setAttribute("aria-hidden", "true"), i.requestMeasure(this.measureReq), this.setBlinkRate();
  }
  setBlinkRate() {
    let l = St(this.cm.cm6.state).cursorBlinkRate;
    this.cursorLayer.style.animationDuration = l + "ms";
  }
  update(i) {
    (i.selectionSet || i.geometryChanged || i.viewportChanged) && (this.view.requestMeasure(this.measureReq), this.cursorLayer.style.animationName = this.cursorLayer.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink"), yi(i) && this.setBlinkRate();
  }
  scheduleRedraw() {
    this.view.requestMeasure(this.measureReq);
  }
  readPos() {
    let { state: i } = this.view, l = [];
    for (let u of i.selection.ranges) {
      let d = u == i.selection.main, g = wi(this.cm, this.view, u, d);
      g && l.push(g);
    }
    return { cursors: l };
  }
  drawSel({ cursors: i }) {
    if (i.length != this.cursors.length || i.some((l, u) => !l.eq(this.cursors[u]))) {
      let l = this.cursorLayer.children;
      if (l.length !== i.length) {
        this.cursorLayer.textContent = "";
        for (const u of i)
          this.cursorLayer.appendChild(u.draw());
      } else
        i.forEach((u, d) => u.adjust(l[d]));
      this.cursors = i;
    }
  }
  destroy() {
    this.cursorLayer.remove();
  }
}
function yi(f) {
  return St(f.startState) != St(f.state);
}
const mi = {
  ".cm-vimMode .cm-line": {
    "& ::selection": { backgroundColor: "transparent !important" },
    "&::selection": { backgroundColor: "transparent !important" },
    caretColor: "transparent !important"
  },
  ".cm-fat-cursor": {
    position: "absolute",
    background: "#ff9696",
    border: "none",
    whiteSpace: "pre"
  },
  "&:not(.cm-focused) .cm-fat-cursor": {
    background: "none",
    outline: "solid 1px #ff9696",
    color: "transparent !important"
  }
}, Ci = /* @__PURE__ */ Hn.highest(/* @__PURE__ */ at.theme(mi));
function ki(f) {
  let i = f.scrollDOM.getBoundingClientRect();
  return { left: (f.textDirection == $n.LTR ? i.left : i.right - f.scrollDOM.clientWidth) - f.scrollDOM.scrollLeft * f.scaleX, top: i.top - f.scrollDOM.scrollTop * f.scaleY };
}
function wi(f, i, l, u) {
  var d, g, w, S;
  let L = l.head, P = !1, _ = 1, H = f.state.vim;
  if (H && (!H.insertMode || f.state.overwrite)) {
    if (P = !0, H.visualBlock && !u)
      return null;
    l.anchor < l.head && (L < i.state.doc.length && i.state.sliceDoc(L, L + 1)) != `
` && L--, f.state.overwrite ? _ = 0.2 : H.status && (_ = 0.5);
  }
  if (P) {
    let B = L < i.state.doc.length && i.state.sliceDoc(L, L + 1);
    B && /[\uDC00-\uDFFF]/.test(B) && L > 1 && (L--, B = i.state.sliceDoc(L, L + 1));
    let F = i.coordsAtPos(L, 1);
    if (!F)
      return null;
    let Q = ki(i), $ = i.domAtPos(L), z = $ ? $.node : i.contentDOM;
    for (z instanceof Text && $.offset >= z.data.length && !((d = z.parentElement) === null || d === void 0) && d.nextSibling && (z = (g = z.parentElement) === null || g === void 0 ? void 0 : g.nextSibling, $ = { node: z, offset: 0 }); $ && $.node instanceof HTMLElement; )
      z = $.node, $ = { node: $.node.childNodes[$.offset], offset: 0 };
    if (!(z instanceof HTMLElement)) {
      if (!z.parentNode)
        return null;
      z = z.parentNode;
    }
    let ie = getComputedStyle(z), ae = F.left, ce = (S = (w = i).coordsForChar) === null || S === void 0 ? void 0 : S.call(w, L);
    if (ce && (ae = ce.left), !B || B == `
` || B == "\r")
      B = " ";
    else if (B == "	") {
      B = " ";
      var j = i.coordsAtPos(L + 1, -1);
      j && (ae = j.left - (j.left - F.left) / parseInt(ie.tabSize));
    } else /[\uD800-\uDBFF]/.test(B) && L < i.state.doc.length - 1 && (B += i.state.sliceDoc(L + 1, L + 2));
    let oe = F.bottom - F.top;
    return new vi((ae - Q.left) / i.scaleX, (F.top - Q.top + oe * (1 - _)) / i.scaleY, oe * _ / i.scaleY, ie.fontFamily, ie.fontSize, ie.fontWeight, ie.color, u ? "cm-fat-cursor cm-cursor-primary" : "cm-fat-cursor cm-cursor-secondary", B, _ != 1);
  } else
    return null;
}
var xi = typeof navigator < "u" && /* @__PURE__ */ /linux/i.test(navigator.platform) && /* @__PURE__ */ / Gecko\/\d+/.exec(navigator.userAgent);
const Ie = /* @__PURE__ */ ii(I), Si = 250, Mi = /* @__PURE__ */ at.baseTheme({
  ".cm-vimMode .cm-cursorLayer:not(.cm-vimCursorLayer)": {
    display: "none"
  },
  ".cm-vim-panel": {
    padding: "0px 10px",
    fontFamily: "monospace",
    minHeight: "1.3em",
    display: "flex"
  },
  ".cm-vim-panel input": {
    border: "none",
    outline: "none",
    backgroundColor: "inherit"
  },
  "&light .cm-searchMatch": { backgroundColor: "#ffff0054" },
  "&dark .cm-searchMatch": { backgroundColor: "#00ffff8a" }
}), Li = /* @__PURE__ */ _n.fromClass(class {
  constructor(f) {
    this.status = "", this.query = null, this.decorations = kt.none, this.waitForCopy = !1, this.lastKeydown = "", this.useNextTextInput = !1, this.compositionText = "", this.view = f;
    const i = this.cm = new I(f);
    Ie.enterVimMode(this.cm), this.view.cm = this.cm, this.cm.state.vimPlugin = this, this.blockCursor = new gi(f, i), this.updateClass(), this.cm.on("vim-command-done", () => {
      i.state.vim && (i.state.vim.status = ""), this.blockCursor.scheduleRedraw(), this.updateStatus();
    }), this.cm.on("vim-mode-change", (l) => {
      i.state.vim && (i.state.vim.mode = l.mode, l.subMode && (i.state.vim.mode += " block"), i.state.vim.status = "", this.blockCursor.scheduleRedraw(), this.updateClass(), this.updateStatus());
    }), this.cm.on("dialog", () => {
      this.cm.state.statusbar ? this.updateStatus() : f.dispatch({
        effects: Er.of(!!this.cm.state.dialog)
      });
    }), this.dom = document.createElement("span"), this.spacer = document.createElement("span"), this.spacer.style.flex = "1", this.statusButton = document.createElement("span"), this.statusButton.onclick = (l) => {
      Ie.handleKey(this.cm, "<Esc>", "user"), this.cm.focus();
    }, this.statusButton.style.cssText = "cursor: pointer";
  }
  update(f) {
    var i;
    if ((f.viewportChanged || f.docChanged) && this.query && this.highlight(this.query), f.docChanged && this.cm.onChange(f), f.selectionSet && this.cm.onSelectionChange(), f.viewportChanged, this.cm.curOp && !this.cm.curOp.isVimOp && this.cm.onBeforeEndOperation(), f.transactions) {
      for (let l of f.transactions)
        for (let u of l.effects)
          if (u.is(wt))
            if (!((i = u.value) === null || i === void 0 ? void 0 : i.forVim))
              this.highlight(null);
            else {
              let g = u.value.create();
              this.highlight(g);
            }
    }
    this.blockCursor.update(f);
  }
  updateClass() {
    const f = this.cm.state;
    !f.vim || f.vim.insertMode && !f.overwrite ? this.view.scrollDOM.classList.remove("cm-vimMode") : this.view.scrollDOM.classList.add("cm-vimMode");
  }
  updateStatus() {
    let f = this.cm.state.statusbar, i = this.cm.state.vim;
    if (!f || !i)
      return;
    let l = this.cm.state.dialog;
    if (l)
      l.parentElement != f && (f.textContent = "", f.appendChild(l));
    else {
      f.textContent = "";
      var u = (i.mode || "normal").toUpperCase();
      i.insertModeReturn && (u += "(C-O)"), this.statusButton.textContent = `--${u}--`, f.appendChild(this.statusButton), f.appendChild(this.spacer);
    }
    this.dom.textContent = i.status, f.appendChild(this.dom);
  }
  destroy() {
    Ie.leaveVimMode(this.cm), this.updateClass(), this.blockCursor.destroy(), delete this.view.cm;
  }
  highlight(f) {
    if (this.query = f, !f)
      return this.decorations = kt.none;
    let { view: i } = this, l = new Fn();
    for (let u = 0, d = i.visibleRanges, g = d.length; u < g; u++) {
      let { from: w, to: S } = d[u];
      for (; u < g - 1 && S > d[u + 1].from - 2 * Si; )
        S = d[++u].to;
      f.highlight(i.state, w, S, (L, P) => {
        l.add(L, P, Ai);
      });
    }
    return this.decorations = l.finish();
  }
  handleKey(f, i) {
    const l = this.cm;
    let u = l.state.vim;
    if (!u)
      return;
    const d = Ie.vimKeyFromEvent(f, u);
    if (I.signal(this.cm, "inputEvent", { type: "handleKey", key: d }), !d)
      return;
    if (d == "<Esc>" && !u.insertMode && !u.visualMode && this.query) {
      const S = u.searchState_;
      S && (l.removeOverlay(S.getOverlay()), S.setOverlay(null));
    }
    if (d === "<C-c>" && !I.isMac && l.somethingSelected())
      return this.waitForCopy = !0, !0;
    u.status = (u.status || "") + d;
    let w = Ie.multiSelectHandleKey(l, d, "user");
    return u = Ie.maybeInitVimState_(l), !w && u.insertMode && l.state.overwrite && (f.key && f.key.length == 1 && !/\n/.test(f.key) ? (w = !0, l.overWriteSelection(f.key)) : f.key == "Backspace" && (w = !0, I.commands.cursorCharLeft(l))), w && (I.signal(this.cm, "vim-keypress", d), f.preventDefault(), f.stopPropagation(), this.blockCursor.scheduleRedraw()), this.updateStatus(), !!w;
  }
}, {
  eventHandlers: {
    copy: function(f, i) {
      this.waitForCopy && (this.waitForCopy = !1, Promise.resolve().then(() => {
        var l = this.cm, u = l.state.vim;
        u && (u.insertMode ? l.setSelection(l.getCursor(), l.getCursor()) : l.operation(() => {
          l.curOp && (l.curOp.isVimOp = !0), Ie.handleKey(l, "<Esc>", "user");
        }));
      }));
    },
    compositionstart: function(f, i) {
      this.useNextTextInput = !0, I.signal(this.cm, "inputEvent", f);
    },
    compositionupdate: function(f, i) {
      I.signal(this.cm, "inputEvent", f);
    },
    compositionend: function(f, i) {
      I.signal(this.cm, "inputEvent", f);
    },
    keypress: function(f, i) {
      I.signal(this.cm, "inputEvent", f), this.lastKeydown == "Dead" && this.handleKey(f, i);
    },
    keydown: function(f, i) {
      I.signal(this.cm, "inputEvent", f), this.lastKeydown = f.key, this.lastKeydown == "Unidentified" || this.lastKeydown == "Process" || this.lastKeydown == "Dead" ? this.useNextTextInput = !0 : (this.useNextTextInput = !1, this.handleKey(f, i));
    }
  },
  provide: () => [
    at.inputHandler.of((f, i, l, u) => {
      var d, g, w = Ri(f);
      if (!w)
        return !1;
      var S = (d = w.state) === null || d === void 0 ? void 0 : d.vim, L = w.state.vimPlugin;
      if (S && !S.insertMode && !(!((g = w.curOp) === null || g === void 0) && g.isVimOp)) {
        if (u === "\0\0")
          return !0;
        if (I.signal(w, "inputEvent", {
          type: "text",
          text: u,
          from: i,
          to: l
        }), u.length == 1 && L.useNextTextInput) {
          if (S.expectLiteralNext && f.composing)
            return L.compositionText = u, !1;
          if (L.compositionText) {
            var P = L.compositionText;
            L.compositionText = "";
            var _ = f.state.selection.main.head, H = f.state.sliceDoc(_ - P.length, _);
            if (P === H) {
              var j = w.getCursor();
              w.replaceRange("", w.posFromIndex(_ - P.length), j);
            }
          }
          return L.handleKey({
            key: u,
            preventDefault: () => {
            },
            stopPropagation: () => {
            }
          }), bi(f), !0;
        }
      }
      return !1;
    })
  ],
  decorations: (f) => f.decorations
});
function bi(f) {
  var i = f.scrollDOM.parentElement;
  if (i) {
    if (xi) {
      f.contentDOM.textContent = "\0\0", f.contentDOM.dispatchEvent(new CustomEvent("compositionend"));
      return;
    }
    var l = f.scrollDOM.nextSibling, u = window.getSelection(), d = u && {
      anchorNode: u.anchorNode,
      anchorOffset: u.anchorOffset,
      focusNode: u.focusNode,
      focusOffset: u.focusOffset
    };
    f.scrollDOM.remove(), i.insertBefore(f.scrollDOM, l);
    try {
      d && u && (u.setPosition(d.anchorNode, d.anchorOffset), d.focusNode && u.extend(d.focusNode, d.focusOffset));
    } catch (g) {
      console.error(g);
    }
    f.focus(), f.contentDOM.dispatchEvent(new CustomEvent("compositionend"));
  }
}
const Ai = /* @__PURE__ */ kt.mark({ class: "cm-searchMatch" }), Er = /* @__PURE__ */ dr.define(), Ti = /* @__PURE__ */ Vn.define({
  create: () => !1,
  update(f, i) {
    for (let l of i.effects)
      l.is(Er) && (f = l.value);
    return f;
  },
  provide: (f) => yr.from(f, (i) => i ? Ei : null)
});
function Ei(f) {
  let i = document.createElement("div");
  i.className = "cm-vim-panel";
  let l = f.cm;
  return l.state.dialog && i.appendChild(l.state.dialog), { top: !1, dom: i };
}
function Oi(f) {
  let i = document.createElement("div");
  i.className = "cm-vim-panel";
  let l = f.cm;
  return l.state.statusbar = i, l.state.vimPlugin.updateStatus(), { dom: i };
}
function Bi(f = {}) {
  return [
    Mi,
    Li,
    Ci,
    f.status ? yr.of(Oi) : Ti
  ];
}
function Ri(f) {
  return f.cm || null;
}
export {
  I as CodeMirror,
  Ie as Vim,
  Ri as getCM,
  Bi as vim
};
//# sourceMappingURL=index-BgPNUeCy.js.map
