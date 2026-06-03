import { Projection } from "./Projection";
import type { CalyrObject } from "../core/CalyrObject";
import type { ProjectionResult } from "./ProjectionResult";

export class ArteProjection extends Projection {
  constructor() {
    super("arte");
  }

  project(object: CalyrObject): ProjectionResult {
    return {
      type: "scene-sequence",
      title: object.title,
      scenes: [
        {
          focus: object.title,
          narration: object.body,
          motion: "slow-zoom",
        },
      ],
    };
  }
}
