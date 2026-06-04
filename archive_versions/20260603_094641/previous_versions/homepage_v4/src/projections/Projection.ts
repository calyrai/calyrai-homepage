import type { CalyrObject } from "../core/CalyrObject";
import type { ProjectionResult } from "./ProjectionResult";

export abstract class Projection {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract project(object: CalyrObject): ProjectionResult;
}
