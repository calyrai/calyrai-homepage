import { CalyrObject } from "./CalyrObject";

export type SectionLayout = "hero" | "split" | "scene" | "grid" | "timeline";

export class SectionObject extends CalyrObject {
  layout: SectionLayout;
  children: CalyrObject[] = [];

  constructor(id: string, title: string, layout: SectionLayout, body?: string) {
    super(id, title, body);
    this.layout = layout;
  }

  add(child: CalyrObject): this {
    this.children.push(child);
    return this;
  }
}
