import { Projection } from "./Projection";
import type { CalyrObject } from "../core/CalyrObject";
import type { ProjectionResult } from "./ProjectionResult";

export class AtlasProjection extends Projection {
  constructor() {
    super("atlas");
  }

  project(object: CalyrObject): ProjectionResult {
    return {
      type: "graph",
      title: object.title,
      nodes: [object.id, ...object.relations.map((r) => r.target)],
      edges: object.relations,
    };
  }
}
