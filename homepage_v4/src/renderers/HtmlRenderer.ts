import type { Renderer } from "./Renderer";
import type { ProjectionResult } from "../projections/ProjectionResult";

export class HtmlRenderer implements Renderer {
  render(result: ProjectionResult): HTMLElement {
    const el = document.createElement("section");
    el.dataset.type = result.type;
    const title = document.createElement("h2");
    title.textContent = result.title;
    el.appendChild(title);

    if (result.body) {
      const p = document.createElement("p");
      p.textContent = result.body;
      el.appendChild(p);
    }

    return el;
  }
}
