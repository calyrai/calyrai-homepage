import { TextObject } from "../core/TextObject";
import { SectionObject } from "../core/SectionObject";
import { CalyrHomepage } from "./CalyrHomepage";
import { ArticleProjection } from "../projections/ArticleProjection";
import { ArteProjection } from "../projections/ArteProjection";
import { AtlasProjection } from "../projections/AtlasProjection";
import { MondrianProjection } from "../projections/MondrianProjection";
import { WorkspaceProjection } from "../projections/WorkspaceProjection";
import { HtmlRenderer } from "../renderers/HtmlRenderer";
import { buildFlagshipObjects } from "../core/ScientificObjects";

export interface HomepageProgram {
  homepage: CalyrHomepage;
  sourceText: TextObject;
}

export function buildHomepageProgram(): HomepageProgram {
  const homepage = new CalyrHomepage();
  const flagshipObjects = buildFlagshipObjects();

  const sourceText = new TextObject(
    "nexus-source",
    "Nexus",
    "Nexus separates text, models and projections.",
    "concept"
  );

  sourceText
    .relate("projects-to", "article")
    .relate("projects-to", "arte")
    .relate("projects-to", "atlas")
    .relate("projects-to", "mondrian")
    .relate("projects-to", "workspace")
    .useProjection(new ArticleProjection())
    .useProjection(new ArteProjection())
    .useProjection(new AtlasProjection())
    .useProjection(new MondrianProjection())
    .useProjection(new WorkspaceProjection());

  const sections = new Map(homepage.sections.map((section) => [section.id, section]));

  (sections.get("hero") as SectionObject)
    .body = "CALYR.AI\nAI-Native Scientific Design\n\nSupercomputing infrastructure, surrogate modelling, and semantic engineering to design molecular, nano biological, as well as physical systems and objects.";

  (sections.get("principle") as SectionObject)
    .body = "TEXT / CONTENT -> Content Objects -> Page Objects -> Projection Objects -> Renderer -> Website";

  (sections.get("demo") as SectionObject)
    .add(sourceText)
    .body = "Same text, different projection: Article | Arte | Atlas | Mondrian | Workspace.";

  (sections.get("oo") as SectionObject)
    .body = "Everything important becomes an object. Tile is only a renderer. The same object can project to Tile, Atlas, Arte, Workspace, and Slide.";

  (sections.get("arte") as SectionObject)
    .body = "TextObject -> Scene -> Narration -> Camera -> Motion. Not a page. A sequence.";

  (sections.get("atlas") as SectionObject)
    .body = "TextObject -> Concepts -> Relations -> Graph";

  (sections.get("workspace") as SectionObject)
    .body = "TextObject -> Tasks -> Modules -> Scientific Workflows";

  (sections.get("atlas") as SectionObject)
    .body = "TextObject -> Concepts -> Relations -> Graph";

  (sections.get("footer") as SectionObject)
    .body = "Homepage = first application of the engine. Atlas = second. Arte = third. Workspace = fourth.";

  const flagshipSection = sections.get("workspace") as SectionObject;
  flagshipSection.body = "Flagship Scientific Objects are first-class assets with color, metadata, projections, relations, workflows, and engines.";
  flagshipObjects.forEach((object) => flagshipSection.add(object));

  return { homepage, sourceText };
}

export function renderHomepageInto(root: HTMLElement): void {
  const { homepage, sourceText } = buildHomepageProgram();
  const htmlRenderer = new HtmlRenderer();

  const title = document.createElement("header");
  title.innerHTML = `<h1>${homepage.title}</h1><p>${homepage.body || ""}</p>`;
  root.appendChild(title);

  const conceptLead = document.createElement("section");
  conceptLead.dataset.type = "concept-lead";
  conceptLead.innerHTML = `
    <h2>Scientific Objects for Molecular Intelligence</h2>
    <p>The homepage introduces the concepts as text first.</p>
    <p>The flagship assets are instantiated as object models, not static page text.</p>
  `;
  root.appendChild(conceptLead);

  homepage.sections.forEach((section) => {
    const sectionObject = new TextObject(section.id, section.title, section.body || "", "story");
    const result = htmlRenderer.render(new ArticleProjection().project(sectionObject));
    result.dataset.layout = section.layout;
    root.appendChild(result);
  });

  const demoRoot = document.createElement("section");
  demoRoot.dataset.type = "projection-demo";
  demoRoot.innerHTML = `<h2>Live Projection Demo</h2><p># Nexus ${sourceText.markdown}</p>`;

  sourceText.projections.forEach((projection) => {
    const projected = projection.project(sourceText);
    const card = document.createElement("article");
    card.innerHTML = `<h3>${projection.name}</h3><pre>${JSON.stringify(projected, null, 2)}</pre>`;
    demoRoot.appendChild(card);
  });

  root.appendChild(demoRoot);

  const flagship = buildFlagshipObjects();
  const flagshipRoot = document.createElement("section");
  flagshipRoot.dataset.type = "flagship-objects";
  flagshipRoot.innerHTML = "<h2>Flagship Publications and Engines</h2>";

  flagship.forEach((object) => {
    const card = document.createElement("article");
    card.dataset.objectId = object.id;
    card.style.borderLeft = `6px solid ${object.theme.primaryColor}`;
    card.style.padding = "0.75rem 0.9rem";
    card.style.marginBottom = "0.55rem";
    card.style.background = "rgba(8, 18, 28, 0.74)";
    card.style.borderRadius = "10px";
    card.innerHTML = `
      <h3 style="margin:0;">${object.title}</h3>
      <p style="margin:0.25rem 0 0; opacity:0.9;">${object.category || "Scientific Object"}</p>
      <p style="margin:0.35rem 0 0; font-size:0.9em; opacity:0.85;">Projections: ${object.projectionModes.join(" | ")}</p>
    `;
    flagshipRoot.appendChild(card);
  });

  root.appendChild(flagshipRoot);
}
