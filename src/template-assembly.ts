import { TemplateDefinition } from './template-definition.js';
import { TemplateProcessor } from './template-processor.js';

export class TemplateAssembly {
  constructor(public definition: TemplateDefinition,
      public processor: TemplateProcessor,
      public state?: any) {}
};
