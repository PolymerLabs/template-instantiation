import { TemplateInstance } from './template-instance.js';
import {
  TemplateSentinel,
  NodeTemplateSentinel,
  AttributeTemplateSentinel
} from './template-sentinel.js';

import {
  TemplatePart,
  NodeTemplatePart,
  AttributeTemplatePart
} from './template-part.js';

export abstract class TemplateProcessor {
  abstract partCallback(instance: TemplateInstance,
      sentinel: TemplateSentinel,
      node: Node): TemplatePart;

  abstract processCallback(parts: TemplatePart[], state?: any): void;
}

export class DefaultTemplateProcessor extends TemplateProcessor {
  partCallback(instance: TemplateInstance,
      sentinel: TemplateSentinel,
      node: Node): TemplatePart {
    if (sentinel instanceof AttributeTemplateSentinel) {
      return new AttributeTemplatePart(instance, sentinel, node);
    } else if (sentinel instanceof NodeTemplateSentinel) {
      return new NodeTemplatePart(instance, sentinel, node);
    }

    throw new Error(`Unknown sentinel type.`);
  }

  processCallback(parts: TemplatePart[], state?: any): void {
    for (const part of parts) {
      if (part instanceof NodeTemplatePart) {
        part.value = state && state[part.expression];
      } else if (part instanceof AttributeTemplatePart) {
        part.value = part.expressions.map(expression => state && state[expression]);
      }
    }
  }
}

export const defaultTemplateProcessor = new DefaultTemplateProcessor;
