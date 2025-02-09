import { LitElement } from "lit";
import { customElement } from "lit/decorators/custom-element.js";
import { property } from "lit/decorators/property.js";

@customElement("dangerous-html")
export class DangerouslySetInnerHtmlContent extends LitElement {
  @property() declare html: string;
  @property() declare shadow: boolean;
  @property() declare file: string;

  createRenderRoot() {
    return this.shadow ? this.attachShadow({ mode: "open" }) : this;
  }

  async connectedCallback() {
    super.connectedCallback();
    let content = this.html;

    if (this.file) {
      content = await (await fetch(this.file)).text();
    }

    const slotHtml = document.createRange().createContextualFragment(content);

    window.addEventListener("load", () => {
      if (this.shadow) {
        this.shadowRoot.append(slotHtml);
        return;
      }

      this.style.display = "contents";
      this.append(slotHtml);
    });
  }
}
