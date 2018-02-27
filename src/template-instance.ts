import { TemplateDefinition, createTreeWalker } from './template-definition.js';
import { TemplateProcessor } from
    './template-processor.js';
import {
  TemplatePart,
  AttributeTemplatePart,
  NodeTemplatePart,
  InnerTemplatePart
} from './template-part.js';
import {
  TemplateRule,
  AttributeTemplateRule,
  NodeTemplateRule,
  InnerTemplateRule
} from './template-rule.js';

export class TemplateInstance extends DocumentFragment {
  protected createdCallbackInvoked: boolean = false;
  protected previousState: any = null;
  protected parts: TemplatePart[];

  update(state?: any) {
    if (!this.createdCallbackInvoked) {
      this.processor.createdCallback(this.parts, state);
      this.createdCallbackInvoked = true;
    }

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
    const { rules } = definition;
    const parts = [];

    const walker = createTreeWalker(this);

    let walkerIndex = -1;

    for (let i = 0; i < rules.length; ++i) {
      const rule = rules[i];
      const { nodeIndex } = rule;

      while (walkerIndex < nodeIndex) {
        walkerIndex++;
        walker.nextNode();
      }

      const part = this.createPart(rule, walker.currentNode);

      parts.push(part);
    }

    this.parts = parts;
  }

  // NOTE(cdata): In the original pass, this was exposed in the
  // TemplateProcessor to be optionally overridden so that parts could
  // have custom implementations.
  protected createPart(rule: TemplateRule, node: Node): TemplatePart {
    if (rule instanceof AttributeTemplateRule) {
      return new AttributeTemplatePart(this, rule, node as HTMLElement);
    } else if (rule instanceof InnerTemplateRule) {
      return new InnerTemplatePart(this, rule, node);
    } else if (rule instanceof NodeTemplateRule) {
      return new NodeTemplatePart(this, rule, node);
    }

    throw new Error(`Unknown rule type.`);
  }
}

