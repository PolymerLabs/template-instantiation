import { TemplateProcessor } from './template-processor.js';
import {
  TemplatePart,
  NodeTemplatePart,
  AttributeTemplatePart
} from './template-part.js';
import {
  NodeTemplateRule,
  AttributeTemplateRule
} from './template-rule.js';

export class ExampleTemplateProcessor extends TemplateProcessor {
  processCallback(parts: TemplatePart[], state?: any): void {
    for (const part of parts) {
      if (part instanceof NodeTemplatePart) {
        const { expression } = part.rule as NodeTemplateRule;
        part.value = state && expression && state[expression];
      } else if (part instanceof AttributeTemplatePart) {
        const { expressions } = part.rule as AttributeTemplateRule;
        part.value = state && expressions &&
            expressions.map(expression => state && state[expression]);
      }
    }
  }
};
