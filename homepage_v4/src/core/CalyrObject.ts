import type { Relation } from "./Relation";
import type { Projection } from "../projections/Projection";

export abstract class CalyrObject {
  id: string;
  title: string;
  body?: string;
  relations: Relation[] = [];
  projections: Projection[] = [];

  constructor(id: string, title: string, body?: string) {
    this.id = id;
    this.title = title;
    this.body = body;
  }

  relate(type: string, target: string, label?: string): this {
    this.relations.push({ type, target, label });
    return this;
  }

  useProjection(projection: Projection): this {
    this.projections.push(projection);
    return this;
  }
}
