import { TemplateDiagram } from './template-diagram.js';
import { TemplateProcessor, defaultTemplateProcessor } from './template-processor.js';

export class TemplateAssembly {
  constructor(public diagram: TemplateDiagram,
      public processor: TemplateProcessor = defaultTemplateProcessor,
      public state?: any) {}
};
