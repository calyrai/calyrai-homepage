import { CalyrObject } from "./CalyrObject";

export type SemanticType = "concept" | "story" | "module" | "workflow";

export class TextObject extends CalyrObject {
  markdown: string;
  semanticType: SemanticType;

  constructor(id: string, title: string, markdown: string, semanticType: SemanticType = "concept") {
    super(id, title, markdown);
    this.markdown = markdown;
    this.semanticType = semanticType;
  }
}
