function c(n, i, a, d, s, o, f, h) {
  var e = typeof n == "function" ? n.options : n;
  i && (e.render = i, e.staticRenderFns = a, e._compiled = !0), d && (e.functional = !0), o && (e._scopeId = "data-v-" + o);
  var r;
  if (f ? (r = function(t) {
    t = t || this.$vnode && this.$vnode.ssrContext || this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext, !t && typeof __VUE_SSR_CONTEXT__ < "u" && (t = __VUE_SSR_CONTEXT__), s && s.call(this, t), t && t._registeredComponents && t._registeredComponents.add(f);
  }, e._ssrRegister = r) : s && (r = h ? function() {
    s.call(
      this,
      (e.functional ? this.parent : this).$root.$options.shadowRoot
    );
  } : s), r)
    if (e.functional) {
      e._injectStyles = r;
      var u = e.render;
      e.render = function(p, _) {
        return r.call(_), u(p, _);
      };
    } else {
      var l = e.beforeCreate;
      e.beforeCreate = l ? [].concat(l, r) : [r];
    }
  return {
    exports: n,
    options: e
  };
}
const m = {
  name: "DangerousHTML",
  props: ["html", "file"],
  async mounted() {
    var a;
    let n;
    if (!((a = this.$refs) != null && a.wrapper))
      return;
    this.html && (n = this.html), this.file && !this.html && (n = await (await fetch(this.file)).text());
    const i = document.createRange().createContextualFragment(n);
    this.$refs.wrapper.append(i);
  }
};
var v = function() {
  var i = this, a = i._self._c;
  return a("div", { ref: "wrapper", style: { display: "contents" } });
}, C = [], $ = /* @__PURE__ */ c(
  m,
  v,
  C,
  !1,
  null,
  null,
  null,
  null
);
const R = $.exports;
export {
  R as default
};
