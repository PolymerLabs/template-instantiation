import { TemplatePart } from '../template-part.js';
import { TemplateProcessor } from '../template-processor.js';
import { TemplateInstance } from '../template-instance.js';

export class DefaultTemplateProcessor extends TemplateProcessor {
  declareCallback(template: HTMLTemplateElement) {}

  processCallback(instance: TemplateInstance,
      parts: TemplatePart[],
      state: any): void {}
}
