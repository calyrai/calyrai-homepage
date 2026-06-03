import type { ProjectionResult } from "../projections/ProjectionResult";

export interface Renderer {
  render(result: ProjectionResult): HTMLElement;
}
