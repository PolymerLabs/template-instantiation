import { TemplateProcessor } from './template-processor.js';
import {
  TemplatePart,
  NodeTemplatePart,
  AttributeTemplatePart
} from './template-part.js';
import {
  NodeTemplateExpression,
  AttributeTemplateExpression
} from './template-expression.js';

export class ExampleTemplateProcessor extends TemplateProcessor {
  processCallback(parts: TemplatePart[], state?: any): void {
    for (const part of parts) {
      if (part instanceof NodeTemplatePart) {
        const { value } = part.expression as NodeTemplateExpression;
        part.value = state && value && state[value];
      } else if (part instanceof AttributeTemplatePart) {
        const { values } = part.expression as AttributeTemplateExpression;
        part.value = state && values &&
            values.map(value => state && state[value]);
      }
    }
  }
};
