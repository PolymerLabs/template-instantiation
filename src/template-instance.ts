import { TemplateDefinition } from './template-definition.js';
import { TemplateProcessor } from
    './template-processor.js';
import {
  TemplatePart,
  AttributeTemplatePart,
  NodeTemplatePart
} from './template-part.js';
import {
  TemplateExpression,
  AttributeTemplateExpression,
  NodeTemplateExpression
} from './template-expression.js';

export class TemplateInstance extends DocumentFragment {
  protected previousState: any = null;
  protected parts: TemplatePart[];

  update(state?: any) {
    this.processor.processCallback(this.parts, state);
    this.previousState = state;
  }

  constructor(public definition: TemplateDefinition,
      public processor: TemplateProcessor,
      state?: any) {
    super();

    this.appendChild(definition.cloneContent());
    this.generateParts();
    this.update(state);
  }

  protected generateParts() {
    const { definition } = this;
    const { expressions } = definition;
    const parts = [];

    const walker = document.createTreeWalker(
        this,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
        null as any,
        false);

    let walkerIndex = -1;

    for (let i = 0; i < expressions.length; ++i) {
      const expression = expressions[i];
      const { nodeIndex } = expression;

      while (walkerIndex < nodeIndex) {
        walkerIndex++;
        walker.nextNode();
      }

      const part = this.createPart(expression, walker.currentNode);

      parts.push(part);
    }

    this.parts = parts;
  }

  // NOTE(cdata): In the original pass, this was exposed in the
  // TemplateProcessor to be optionally overridden so that parts could
  // have custom implementations.
  protected createPart(expression: TemplateExpression, node: Node): TemplatePart {
    if (expression instanceof AttributeTemplateExpression) {
      return new AttributeTemplatePart(this, expression, node);
    } else if (expression instanceof NodeTemplateExpression) {
      return new NodeTemplatePart(this, expression, node);
    }

    throw new Error(`Unknown expression type.`);
  }
}


