import { TemplateProcessor } from './template-processor.js';
import {
  TemplatePart,
  NodeTemplatePart,
  AttributeTemplatePart
} from './template-part.js';

export class ExampleTemplateProcessor extends TemplateProcessor {
  processCallback(parts: TemplatePart[], state?: any): void {
    for (const part of parts) {
      if (part instanceof NodeTemplatePart) {
        part.value = state && part.expression && state[part.expression];
      } else if (part instanceof AttributeTemplatePart) {
        part.value = state && part.expressions &&
            part.expressions.map(expression => state && state[expression]);
      }
    }
  }
};
