import { Projection } from "./Projection";
import type { CalyrObject } from "../core/CalyrObject";
import type { ProjectionResult } from "./ProjectionResult";

export class MondrianProjection extends Projection {
  constructor() {
    super("mondrian");
  }

  project(object: CalyrObject): ProjectionResult {
    return {
      type: "grid-composition",
      title: object.title,
      panels: [
        { label: "focus", value: object.title },
        { label: "body", value: object.body || "" },
        { label: "relations", value: String(object.relations.length) },
      ],
    };
  }
}
