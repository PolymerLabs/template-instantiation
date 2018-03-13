import { TemplateProcessor } from './template-processor.js';
import { TemplateExpressionRule } from './template-expression.js';

export class PreparedTemplate {
  constructor(readonly processor: TemplateProcessor,
      readonly template: HTMLTemplateElement,
      readonly expressionRules: TemplateExpressionRule[]) {}

  cloneContent(): DocumentFragment {
    return this.template.content.cloneNode(true) as DocumentFragment;
  }
};
