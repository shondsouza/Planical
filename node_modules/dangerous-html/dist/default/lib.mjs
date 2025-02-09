/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const R = window, V = R.ShadowRoot && (R.ShadyCSS === void 0 || R.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, st = Symbol(), q = /* @__PURE__ */ new WeakMap();
class ht {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== st)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (V && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = q.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && q.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
}
const at = (n) => new ht(typeof n == "string" ? n : n + "", void 0, st), dt = (n, t) => {
  V ? n.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet) : t.forEach((e) => {
    const i = document.createElement("style"), s = R.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = e.cssText, n.appendChild(i);
  });
}, K = V ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules)
    e += i.cssText;
  return at(e);
})(n) : n;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var z;
const N = window, Z = N.trustedTypes, ct = Z ? Z.emptyScript : "", J = N.reactiveElementPolyfillSupport, B = { toAttribute(n, t) {
  switch (t) {
    case Boolean:
      n = n ? ct : null;
      break;
    case Object:
    case Array:
      n = n == null ? n : JSON.stringify(n);
  }
  return n;
}, fromAttribute(n, t) {
  let e = n;
  switch (t) {
    case Boolean:
      e = n !== null;
      break;
    case Number:
      e = n === null ? null : Number(n);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(n);
      } catch {
        e = null;
      }
  }
  return e;
} }, nt = (n, t) => t !== n && (t == t || n == n), j = { attribute: !0, type: String, converter: B, reflect: !1, hasChanged: nt };
class f extends HTMLElement {
  constructor() {
    super(), this._$Ei = /* @__PURE__ */ new Map(), this.isUpdatePending = !1, this.hasUpdated = !1, this._$El = null, this.u();
  }
  static addInitializer(t) {
    var e;
    (e = this.h) !== null && e !== void 0 || (this.h = []), this.h.push(t);
  }
  static get observedAttributes() {
    this.finalize();
    const t = [];
    return this.elementProperties.forEach((e, i) => {
      const s = this._$Ep(i, e);
      s !== void 0 && (this._$Ev.set(s, i), t.push(s));
    }), t;
  }
  static createProperty(t, e = j) {
    if (e.state && (e.attribute = !1), this.finalize(), this.elementProperties.set(t, e), !e.noAccessor && !this.prototype.hasOwnProperty(t)) {
      const i = typeof t == "symbol" ? Symbol() : "__" + t, s = this.getPropertyDescriptor(t, i, e);
      s !== void 0 && Object.defineProperty(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    return { get() {
      return this[e];
    }, set(s) {
      const o = this[t];
      this[e] = s, this.requestUpdate(t, o, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) || j;
  }
  static finalize() {
    if (this.hasOwnProperty("finalized"))
      return !1;
    this.finalized = !0;
    const t = Object.getPrototypeOf(this);
    if (t.finalize(), this.elementProperties = new Map(t.elementProperties), this._$Ev = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
      const e = this.properties, i = [...Object.getOwnPropertyNames(e), ...Object.getOwnPropertySymbols(e)];
      for (const s of i)
        this.createProperty(s, e[s]);
    }
    return this.elementStyles = this.finalizeStyles(this.styles), !0;
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const s of i)
        e.unshift(K(s));
    } else
      t !== void 0 && e.push(K(t));
    return e;
  }
  static _$Ep(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  u() {
    var t;
    this._$E_ = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$Eg(), this.requestUpdate(), (t = this.constructor.h) === null || t === void 0 || t.forEach((e) => e(this));
  }
  addController(t) {
    var e, i;
    ((e = this._$ES) !== null && e !== void 0 ? e : this._$ES = []).push(t), this.renderRoot !== void 0 && this.isConnected && ((i = t.hostConnected) === null || i === void 0 || i.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$ES) === null || e === void 0 || e.splice(this._$ES.indexOf(t) >>> 0, 1);
  }
  _$Eg() {
    this.constructor.elementProperties.forEach((t, e) => {
      this.hasOwnProperty(e) && (this._$Ei.set(e, this[e]), delete this[e]);
    });
  }
  createRenderRoot() {
    var t;
    const e = (t = this.shadowRoot) !== null && t !== void 0 ? t : this.attachShadow(this.constructor.shadowRootOptions);
    return dt(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var t;
    this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$ES) === null || t === void 0 || t.forEach((e) => {
      var i;
      return (i = e.hostConnected) === null || i === void 0 ? void 0 : i.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$ES) === null || t === void 0 || t.forEach((e) => {
      var i;
      return (i = e.hostDisconnected) === null || i === void 0 ? void 0 : i.call(e);
    });
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$EO(t, e, i = j) {
    var s;
    const o = this.constructor._$Ep(t, i);
    if (o !== void 0 && i.reflect === !0) {
      const r = (((s = i.converter) === null || s === void 0 ? void 0 : s.toAttribute) !== void 0 ? i.converter : B).toAttribute(e, i.type);
      this._$El = t, r == null ? this.removeAttribute(o) : this.setAttribute(o, r), this._$El = null;
    }
  }
  _$AK(t, e) {
    var i;
    const s = this.constructor, o = s._$Ev.get(t);
    if (o !== void 0 && this._$El !== o) {
      const r = s.getPropertyOptions(o), d = typeof r.converter == "function" ? { fromAttribute: r.converter } : ((i = r.converter) === null || i === void 0 ? void 0 : i.fromAttribute) !== void 0 ? r.converter : B;
      this._$El = o, this[o] = d.fromAttribute(e, r.type), this._$El = null;
    }
  }
  requestUpdate(t, e, i) {
    let s = !0;
    t !== void 0 && (((i = i || this.constructor.getPropertyOptions(t)).hasChanged || nt)(this[t], e) ? (this._$AL.has(t) || this._$AL.set(t, e), i.reflect === !0 && this._$El !== t && (this._$EC === void 0 && (this._$EC = /* @__PURE__ */ new Map()), this._$EC.set(t, i))) : s = !1), !this.isUpdatePending && s && (this._$E_ = this._$Ej());
  }
  async _$Ej() {
    this.isUpdatePending = !0;
    try {
      await this._$E_;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var t;
    if (!this.isUpdatePending)
      return;
    this.hasUpdated, this._$Ei && (this._$Ei.forEach((s, o) => this[o] = s), this._$Ei = void 0);
    let e = !1;
    const i = this._$AL;
    try {
      e = this.shouldUpdate(i), e ? (this.willUpdate(i), (t = this._$ES) === null || t === void 0 || t.forEach((s) => {
        var o;
        return (o = s.hostUpdate) === null || o === void 0 ? void 0 : o.call(s);
      }), this.update(i)) : this._$Ek();
    } catch (s) {
      throw e = !1, this._$Ek(), s;
    }
    e && this._$AE(i);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$ES) === null || e === void 0 || e.forEach((i) => {
      var s;
      return (s = i.hostUpdated) === null || s === void 0 ? void 0 : s.call(i);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$Ek() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$E_;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$EC !== void 0 && (this._$EC.forEach((e, i) => this._$EO(i, this[i], e)), this._$EC = void 0), this._$Ek();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
}
f.finalized = !0, f.elementProperties = /* @__PURE__ */ new Map(), f.elementStyles = [], f.shadowRootOptions = { mode: "open" }, J == null || J({ ReactiveElement: f }), ((z = N.reactiveElementVersions) !== null && z !== void 0 ? z : N.reactiveElementVersions = []).push("1.4.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var L;
const T = window, m = T.trustedTypes, F = m ? m.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, v = `lit$${(Math.random() + "").slice(9)}$`, ot = "?" + v, ut = `<${ot}>`, y = document, w = (n = "") => y.createComment(n), C = (n) => n === null || typeof n != "object" && typeof n != "function", rt = Array.isArray, pt = (n) => rt(n) || typeof (n == null ? void 0 : n[Symbol.iterator]) == "function", S = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, G = /-->/g, Q = />/g, _ = RegExp(`>|[ 	
\f\r](?:([^\\s"'>=/]+)([ 	
\f\r]*=[ 	
\f\r]*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), X = /'/g, Y = /"/g, lt = /^(?:script|style|textarea|title)$/i, g = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), tt = /* @__PURE__ */ new WeakMap(), A = y.createTreeWalker(y, 129, null, !1), $t = (n, t) => {
  const e = n.length - 1, i = [];
  let s, o = t === 2 ? "<svg>" : "", r = S;
  for (let l = 0; l < e; l++) {
    const h = n[l];
    let $, a, c = -1, p = 0;
    for (; p < h.length && (r.lastIndex = p, a = r.exec(h), a !== null); )
      p = r.lastIndex, r === S ? a[1] === "!--" ? r = G : a[1] !== void 0 ? r = Q : a[2] !== void 0 ? (lt.test(a[2]) && (s = RegExp("</" + a[2], "g")), r = _) : a[3] !== void 0 && (r = _) : r === _ ? a[0] === ">" ? (r = s != null ? s : S, c = -1) : a[1] === void 0 ? c = -2 : (c = r.lastIndex - a[2].length, $ = a[1], r = a[3] === void 0 ? _ : a[3] === '"' ? Y : X) : r === Y || r === X ? r = _ : r === G || r === Q ? r = S : (r = _, s = void 0);
    const H = r === _ && n[l + 1].startsWith("/>") ? " " : "";
    o += r === S ? h + ut : c >= 0 ? (i.push($), h.slice(0, c) + "$lit$" + h.slice(c) + v + H) : h + v + (c === -2 ? (i.push(void 0), l) : H);
  }
  const d = o + (n[e] || "<?>") + (t === 2 ? "</svg>" : "");
  if (!Array.isArray(n) || !n.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return [F !== void 0 ? F.createHTML(d) : d, i];
};
class P {
  constructor({ strings: t, _$litType$: e }, i) {
    let s;
    this.parts = [];
    let o = 0, r = 0;
    const d = t.length - 1, l = this.parts, [h, $] = $t(t, e);
    if (this.el = P.createElement(h, i), A.currentNode = this.el.content, e === 2) {
      const a = this.el.content, c = a.firstChild;
      c.remove(), a.append(...c.childNodes);
    }
    for (; (s = A.nextNode()) !== null && l.length < d; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) {
          const a = [];
          for (const c of s.getAttributeNames())
            if (c.endsWith("$lit$") || c.startsWith(v)) {
              const p = $[r++];
              if (a.push(c), p !== void 0) {
                const H = s.getAttribute(p.toLowerCase() + "$lit$").split(v), O = /([.?@])?(.*)/.exec(p);
                l.push({ type: 1, index: o, name: O[2], strings: H, ctor: O[1] === "." ? _t : O[1] === "?" ? At : O[1] === "@" ? mt : k });
              } else
                l.push({ type: 6, index: o });
            }
          for (const c of a)
            s.removeAttribute(c);
        }
        if (lt.test(s.tagName)) {
          const a = s.textContent.split(v), c = a.length - 1;
          if (c > 0) {
            s.textContent = m ? m.emptyScript : "";
            for (let p = 0; p < c; p++)
              s.append(a[p], w()), A.nextNode(), l.push({ type: 2, index: ++o });
            s.append(a[c], w());
          }
        }
      } else if (s.nodeType === 8)
        if (s.data === ot)
          l.push({ type: 2, index: o });
        else {
          let a = -1;
          for (; (a = s.data.indexOf(v, a + 1)) !== -1; )
            l.push({ type: 7, index: o }), a += v.length - 1;
        }
      o++;
    }
  }
  static createElement(t, e) {
    const i = y.createElement("template");
    return i.innerHTML = t, i;
  }
}
function E(n, t, e = n, i) {
  var s, o, r, d;
  if (t === g)
    return t;
  let l = i !== void 0 ? (s = e._$Co) === null || s === void 0 ? void 0 : s[i] : e._$Cl;
  const h = C(t) ? void 0 : t._$litDirective$;
  return (l == null ? void 0 : l.constructor) !== h && ((o = l == null ? void 0 : l._$AO) === null || o === void 0 || o.call(l, !1), h === void 0 ? l = void 0 : (l = new h(n), l._$AT(n, e, i)), i !== void 0 ? ((r = (d = e)._$Co) !== null && r !== void 0 ? r : d._$Co = [])[i] = l : e._$Cl = l), l !== void 0 && (t = E(n, l._$AS(n, t.values), l, i)), t;
}
class vt {
  constructor(t, e) {
    this.u = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  v(t) {
    var e;
    const { el: { content: i }, parts: s } = this._$AD, o = ((e = t == null ? void 0 : t.creationScope) !== null && e !== void 0 ? e : y).importNode(i, !0);
    A.currentNode = o;
    let r = A.nextNode(), d = 0, l = 0, h = s[0];
    for (; h !== void 0; ) {
      if (d === h.index) {
        let $;
        h.type === 2 ? $ = new U(r, r.nextSibling, this, t) : h.type === 1 ? $ = new h.ctor(r, h.name, h.strings, this, t) : h.type === 6 && ($ = new yt(r, this, t)), this.u.push($), h = s[++l];
      }
      d !== (h == null ? void 0 : h.index) && (r = A.nextNode(), d++);
    }
    return o;
  }
  p(t) {
    let e = 0;
    for (const i of this.u)
      i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class U {
  constructor(t, e, i, s) {
    var o;
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = s, this._$Cm = (o = s == null ? void 0 : s.isConnected) === null || o === void 0 || o;
  }
  get _$AU() {
    var t, e;
    return (e = (t = this._$AM) === null || t === void 0 ? void 0 : t._$AU) !== null && e !== void 0 ? e : this._$Cm;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = E(this, t, e), C(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== g && this.g(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : pt(t) ? this.k(t) : this.g(t);
  }
  O(t, e = this._$AB) {
    return this._$AA.parentNode.insertBefore(t, e);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  g(t) {
    this._$AH !== u && C(this._$AH) ? this._$AA.nextSibling.data = t : this.T(y.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var e;
    const { values: i, _$litType$: s } = t, o = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = P.createElement(s.h, this.options)), s);
    if (((e = this._$AH) === null || e === void 0 ? void 0 : e._$AD) === o)
      this._$AH.p(i);
    else {
      const r = new vt(o, this), d = r.v(this.options);
      r.p(i), this.T(d), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = tt.get(t.strings);
    return e === void 0 && tt.set(t.strings, e = new P(t)), e;
  }
  k(t) {
    rt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, s = 0;
    for (const o of t)
      s === e.length ? e.push(i = new U(this.O(w()), this.O(w()), this, this.options)) : i = e[s], i._$AI(o), s++;
    s < e.length && (this._$AR(i && i._$AB.nextSibling, s), e.length = s);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for ((i = this._$AP) === null || i === void 0 || i.call(this, !1, !0, e); t && t !== this._$AB; ) {
      const s = t.nextSibling;
      t.remove(), t = s;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cm = t, (e = this._$AP) === null || e === void 0 || e.call(this, t));
  }
}
class k {
  constructor(t, e, i, s, o) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = e, this._$AM = s, this.options = o, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = u;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t, e = this, i, s) {
    const o = this.strings;
    let r = !1;
    if (o === void 0)
      t = E(this, t, e, 0), r = !C(t) || t !== this._$AH && t !== g, r && (this._$AH = t);
    else {
      const d = t;
      let l, h;
      for (t = o[0], l = 0; l < o.length - 1; l++)
        h = E(this, d[i + l], e, l), h === g && (h = this._$AH[l]), r || (r = !C(h) || h !== this._$AH[l]), h === u ? t = u : t !== u && (t += (h != null ? h : "") + o[l + 1]), this._$AH[l] = h;
    }
    r && !s && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t != null ? t : "");
  }
}
class _t extends k {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
const ft = m ? m.emptyScript : "";
class At extends k {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    t && t !== u ? this.element.setAttribute(this.name, ft) : this.element.removeAttribute(this.name);
  }
}
class mt extends k {
  constructor(t, e, i, s, o) {
    super(t, e, i, s, o), this.type = 5;
  }
  _$AI(t, e = this) {
    var i;
    if ((t = (i = E(this, t, e, 0)) !== null && i !== void 0 ? i : u) === g)
      return;
    const s = this._$AH, o = t === u && s !== u || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, r = t !== u && (s === u || o);
    o && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e, i;
    typeof this._$AH == "function" ? this._$AH.call((i = (e = this.options) === null || e === void 0 ? void 0 : e.host) !== null && i !== void 0 ? i : this.element, t) : this._$AH.handleEvent(t);
  }
}
class yt {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    E(this, t);
  }
}
const et = T.litHtmlPolyfillSupport;
et == null || et(P, U), ((L = T.litHtmlVersions) !== null && L !== void 0 ? L : T.litHtmlVersions = []).push("2.4.0");
const gt = (n, t, e) => {
  var i, s;
  const o = (i = e == null ? void 0 : e.renderBefore) !== null && i !== void 0 ? i : t;
  let r = o._$litPart$;
  if (r === void 0) {
    const d = (s = e == null ? void 0 : e.renderBefore) !== null && s !== void 0 ? s : null;
    o._$litPart$ = r = new U(t.insertBefore(w(), d), d, void 0, e != null ? e : {});
  }
  return r._$AI(n), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var D, I;
class b extends f {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t, e;
    const i = super.createRenderRoot();
    return (t = (e = this.renderOptions).renderBefore) !== null && t !== void 0 || (e.renderBefore = i.firstChild), i;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = gt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) === null || t === void 0 || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) === null || t === void 0 || t.setConnected(!1);
  }
  render() {
    return g;
  }
}
b.finalized = !0, b._$litElement$ = !0, (D = globalThis.litElementHydrateSupport) === null || D === void 0 || D.call(globalThis, { LitElement: b });
const it = globalThis.litElementPolyfillSupport;
it == null || it({ LitElement: b });
((I = globalThis.litElementVersions) !== null && I !== void 0 ? I : globalThis.litElementVersions = []).push("3.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Et = (n) => (t) => typeof t == "function" ? ((e, i) => (customElements.define(e, i), i))(n, t) : ((e, i) => {
  const { kind: s, elements: o } = i;
  return { kind: s, elements: o, finisher(r) {
    customElements.define(e, r);
  } };
})(n, t);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const St = (n, t) => t.kind === "method" && t.descriptor && !("value" in t.descriptor) ? { ...t, finisher(e) {
  e.createProperty(t.key, n);
} } : { kind: "field", key: Symbol(), placement: "own", descriptor: {}, originalKey: t.key, initializer() {
  typeof t.initializer == "function" && (this[t.key] = t.initializer.call(this));
}, finisher(e) {
  e.createProperty(t.key, n);
} };
function W(n) {
  return (t, e) => e !== void 0 ? ((i, s, o) => {
    s.constructor.createProperty(o, i);
  })(n, t, e) : St(n, t);
}
var bt = Object.defineProperty, wt = Object.getOwnPropertyDescriptor, M = (n, t, e, i) => {
  for (var s = i > 1 ? void 0 : i ? wt(t, e) : t, o = n.length - 1, r; o >= 0; o--)
    (r = n[o]) && (s = (i ? r(t, e, s) : r(s)) || s);
  return i && s && bt(t, e, s), s;
};
let x = class extends b {
  createRenderRoot() {
    return this.shadow ? this.attachShadow({ mode: "open" }) : this;
  }
  async connectedCallback() {
    super.connectedCallback();
    let n = this.html;
    this.file && (n = await (await fetch(this.file)).text());
    const t = document.createRange().createContextualFragment(n);
    window.addEventListener("load", () => {
      if (this.shadow) {
        this.shadowRoot.append(t);
        return;
      }
      this.style.display = "contents", this.append(t);
    });
  }
};
M([
  W()
], x.prototype, "html", 2);
M([
  W()
], x.prototype, "shadow", 2);
M([
  W()
], x.prototype, "file", 2);
x = M([
  Et("dangerous-html")
], x);
export {
  x as DangerouslySetInnerHtmlContent
};
