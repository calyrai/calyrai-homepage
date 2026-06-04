import { CalyrObject } from "./CalyrObject";
import { SectionObject } from "./SectionObject";

export class PageObject extends CalyrObject {
  sections: SectionObject[] = [];

  add(section: SectionObject): this {
    this.sections.push(section);
    return this;
  }
}
