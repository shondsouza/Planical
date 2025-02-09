import i, { useRef as l, useEffect as s } from "react";
const f = (t) => {
  const n = l(null);
  s(() => {
    if (!n.current)
      return;
    let e = '<script type="text/javascript"><\/script>';
    if ("html" in t)
      e = t.html;
    else if ("src" in t)
      e = `<script src=${t.src}><\/script>`;
    else if ("children" in t) {
      const { children: r } = t;
      e = `<script type=${"type" in t ? t.type : "text/javascript"}>` + r + "<\/script>";
    } else if ("file" in t) {
      a(t.file);
      return;
    }
    const c = document.createRange().createContextualFragment(e);
    n.current.append(c);
  }, []);
  const a = async (e) => {
    if (!n.current)
      return;
    const c = await (await fetch(e)).text(), r = document.createRange().createContextualFragment(c);
    n.current.append(r);
  };
  return /* @__PURE__ */ i.createElement("div", {
    style: { display: "contents" },
    ref: n
  });
};
export {
  f as default
};
