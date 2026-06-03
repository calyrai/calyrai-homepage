import type { Relation } from "../core/Relation";

export interface ProjectionScene {
  focus: string;
  narration?: string;
  motion?: string;
}

export interface ProjectionResult {
  type: string;
  title: string;
  body?: string;
  scenes?: ProjectionScene[];
  nodes?: string[];
  edges?: Relation[];
  panels?: Array<{ label: string; value: string }>;
  modules?: string[];
}
