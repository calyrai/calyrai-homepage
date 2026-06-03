import type { Renderer } from "./Renderer";
import type { ProjectionResult } from "../projections/ProjectionResult";

export class AtlasRenderer implements Renderer {
  render(result: ProjectionResult): HTMLElement {
    const section = document.createElement("section");
    section.dataset.type = result.type;
    section.className = "atlas-graph";

    const title = document.createElement("h2");
    title.textContent = result.title;
    section.appendChild(title);

    const nodes = document.createElement("pre");
    nodes.textContent = `nodes: ${(result.nodes || []).join(", ")}`;
    section.appendChild(nodes);

    const edges = document.createElement("pre");
    edges.textContent = `edges: ${(result.edges || []).map((e) => `${e.type}:${e.target}`).join(", ")}`;
    section.appendChild(edges);

    return section;
  }
}
