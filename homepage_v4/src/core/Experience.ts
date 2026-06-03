import { PageObject } from "./PageObject";

export abstract class Experience extends PageObject {
  mode: string;

  constructor(id: string, title: string, body?: string, mode = "experience") {
    super(id, title, body);
    this.mode = mode;
  }
}
