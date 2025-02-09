A simple custom-element to render html using lit-html.

Browsers by default won't render any html that is injected using `innerHtml`. In extreme cases where we want this to happen. And when the user is in control of scripts they are trying to add. You can use this simple custom-element.

## :warning: :warning: :warning:


### Install

```sh
yarn add danngerous-html
```

### Usage

If you are using it in any build system based projects. You can just import the module and leave it.

```js
import './dangerous-html'
```

If you are using with traditional scripts.

```html
<script type="text/javascript" src="https://unpkg.com/dangerous-html/dist/lib.umd.js" ></script>
```

### Example

```html
<dangerous-html html='...html...'></dangerous-html>
```

