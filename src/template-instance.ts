import { TemplateDiagram } from './template-diagram.js';
import { TemplateProcessor, defaultTemplateProcessor } from
    './template-processor.js';
import { TemplatePart } from './template-part.js';

export class TemplateInstance extends DocumentFragment {
  protected previousState: any = null;
  protected parts: TemplatePart[];

  update(state?: any) {
    this.processor.processCallback(this.parts, state);
    this.previousState = state;
  }

  constructor(
      public diagram: TemplateDiagram,
      state?: any,
      public processor: TemplateProcessor = defaultTemplateProcessor) {
    super();

    this.appendChild(diagram.cloneContent());
    this.generateParts();
    this.update(state);
  }

  protected generateParts() {
    const { diagram } = this;
    const { sentinels } = diagram;
    const parts = [];

    const walker = document.createTreeWalker(
        this,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
        null as any,
        false);

    let walkerIndex = -1;

    for (let i = 0; i < sentinels.length; ++i) {
      const sentinel = sentinels[i];
      const { nodeIndex } = sentinel;

      while (walkerIndex < nodeIndex) {
        walkerIndex++;
        walker.nextNode();
      }

      const part = this.processor.partCallback(
          this, sentinel, walker.currentNode);

      parts.push(part);
    }

    this.parts = parts;
  }
}


