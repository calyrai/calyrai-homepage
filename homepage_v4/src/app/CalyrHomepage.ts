import { Experience } from "../core/Experience";
import { SectionObject } from "../core/SectionObject";

export class CalyrHomepage extends Experience {
  heroScene: SectionObject;
  principleScene: SectionObject;
  projectionDemo: SectionObject;
  objectOrientedSection: SectionObject;
  arteInterface: SectionObject;
  atlasInterface: SectionObject;
  workspaceInterface: SectionObject;
  footerScene: SectionObject;

  constructor() {
    super(
      "calyr-homepage",
      "CALYR.AI",
      "Text becomes object. Objects become projections.",
      "homepage-experience"
    );

    this.heroScene = new SectionObject("hero", "One Text. Many Projections.", "hero");
    this.principleScene = new SectionObject("principle", "TEXT -> OBJECT -> PROJECTION -> EXPERIENCE", "scene");
    this.projectionDemo = new SectionObject("demo", "Live Projection Demo", "split");
    this.objectOrientedSection = new SectionObject("oo", "Object-Oriented Production", "grid");
    this.arteInterface = new SectionObject("arte", "Arte Interface", "timeline");
    this.atlasInterface = new SectionObject("atlas", "Atlas Interface", "timeline");
    this.workspaceInterface = new SectionObject("workspace", "Workspace Interface", "timeline");
    this.footerScene = new SectionObject("footer", "CALYR.AI", "scene");

    this
      .add(this.heroScene)
      .add(this.principleScene)
      .add(this.projectionDemo)
      .add(this.objectOrientedSection)
      .add(this.arteInterface)
      .add(this.atlasInterface)
      .add(this.workspaceInterface)
      .add(this.footerScene);
  }
}
