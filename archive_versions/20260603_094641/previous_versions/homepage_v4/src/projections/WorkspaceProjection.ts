import { Projection } from "./Projection";
import type { CalyrObject } from "../core/CalyrObject";
import type { ProjectionResult } from "./ProjectionResult";

export class WorkspaceProjection extends Projection {
  constructor() {
    super("workspace");
  }

  project(object: CalyrObject): ProjectionResult {
    return {
      type: "workflow",
      title: object.title,
      modules: [
        "tasks",
        "modules",
        "scientific-workflows",
        ...object.relations.map((r) => r.target),
      ],
    };
  }
}
