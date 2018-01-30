import { TemplateDiagram } from './template-diagram.js';
import { TemplateProcessor } from './template-processor.js';

export class TemplateAssembly {
  constructor(public diagram: TemplateDiagram,
      public processor: TemplateProcessor,
      public state?: any) {}
};
