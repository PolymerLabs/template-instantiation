import { TemplateDiagram } from './template-diagram.js';
import { TemplateProcessor, defaultTemplateProcessor } from './template-processor.js';

export class TemplateAssembly {
  constructor(public diagram: TemplateDiagram,
      public state?: any,
      public processor: TemplateProcessor = defaultTemplateProcessor) {}
};
