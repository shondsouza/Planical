import React, { useRef, useEffect } from "react";

type Props = { html: string } | { type?: 'type/javascript' | 'module', children: string } | { src: string } | { file: string }

const DangerousHTML: React.FC<Props> = (props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    let content: string = `<script type="text/javascript"></script>`

    if ('html' in props) {
      content = props.html
    } else if ('src' in props) {
      content = `<script src=${props.src}></script>`
    } else if ('children' in props) {
      const { children } = props
      content = `<script type=${'type' in props ? props.type : 'text/javascript'}>` + children + `</script>`
    } else if ('file' in props) {
      load(props.file)
      return
    }

    const slotHtml = document.createRange().createContextualFragment(content);
    ref.current.append(slotHtml);
  }, []);

  const load = async (path: string) => {
    if (!ref.current) {
      return;
    }

    const content = await (await fetch(path)).text();
    const slotHtml = document.createRange().createContextualFragment(content);
    ref.current.append(slotHtml);
  };

  return <div style={{ display: 'contents' }} ref={ref}></div>;
};

export default DangerousHTML;
