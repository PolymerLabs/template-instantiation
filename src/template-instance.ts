import { TemplateDiagram } from './template-diagram.js';
import { TemplateProcessor } from
    './template-processor.js';
import {
  TemplatePart,
  AttributeTemplatePart,
  NodeTemplatePart
} from './template-part.js';
import {
  TemplateSentinel,
  AttributeTemplateSentinel,
  NodeTemplateSentinel
} from './template-sentinel.js';

export class TemplateInstance extends DocumentFragment {
  protected previousState: any = null;
  protected parts: TemplatePart[];

  update(state?: any) {
    this.processor.processCallback(this.parts, state);
    this.previousState = state;
  }

  constructor(public diagram: TemplateDiagram,
      public processor: TemplateProcessor,
      state?: any) {
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

      const part = this.createPart(sentinel, walker.currentNode);

      parts.push(part);
    }

    this.parts = parts;
  }

  // NOTE(cdata): In the original pass, this was exposed in the
  // TemplateProcessor to be optionally overridden so that parts could
  // have custom implementations.
  protected createPart(sentinel: TemplateSentinel, node: Node): TemplatePart {
    if (sentinel instanceof AttributeTemplateSentinel) {
      return new AttributeTemplatePart(this, sentinel, node);
    } else if (sentinel instanceof NodeTemplateSentinel) {
      return new NodeTemplatePart(this, sentinel, node);
    }

    throw new Error(`Unknown sentinel type.`);
  }
}


