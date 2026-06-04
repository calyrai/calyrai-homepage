import { Projection } from "./Projection";
import type { CalyrObject } from "../core/CalyrObject";
import type { ProjectionResult } from "./ProjectionResult";

export class ArticleProjection extends Projection {
  constructor() {
    super("article");
  }

  project(object: CalyrObject): ProjectionResult {
    return {
      type: "article",
      title: object.title,
      body: object.body,
    };
  }
}
