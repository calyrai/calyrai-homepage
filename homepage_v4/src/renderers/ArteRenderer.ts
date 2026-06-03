import type { Renderer } from "./Renderer";
import type { ProjectionResult } from "../projections/ProjectionResult";

export class ArteRenderer implements Renderer {
  render(result: ProjectionResult): HTMLElement {
    const section = document.createElement("section");
    section.dataset.type = result.type;
    section.className = "arte-sequence";

    const title = document.createElement("h2");
    title.textContent = result.title;
    section.appendChild(title);

    (result.scenes || []).forEach((scene, index) => {
      const sceneEl = document.createElement("article");
      sceneEl.className = "arte-scene";
      sceneEl.dataset.motion = scene.motion || "static";
      sceneEl.innerHTML = `<h3>Scene ${index + 1}: ${scene.focus}</h3><p>${scene.narration || ""}</p>`;
      section.appendChild(sceneEl);
    });

    return section;
  }
}
