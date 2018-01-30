import { TemplateProcessor } from './template-processor.js';
import { TemplateDiagram } from './template-diagram.js';
import { TemplateInstance } from './template-instance.js';

const templateDiagramCache: Map<HTMLTemplateElement, TemplateDiagram> = new Map();

HTMLTemplateElement.prototype.createInstance = function(
    processor: TemplateProcessor,
    state?: any,
    overrideDiagramCache = false): TemplateInstance {
  if (processor == null) {
    throw new Error('The first argument of createInstance must be an implementation of TemplateProcessor');
  }

  if (!templateDiagramCache.has(this) || overrideDiagramCache) {
    templateDiagramCache.set(this, new TemplateDiagram(this));
  }

  const diagram = templateDiagramCache.get(this)!;

  return new TemplateInstance(diagram, processor, state);
};
