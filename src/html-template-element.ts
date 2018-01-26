import { TemplateProcessor, defaultTemplateProcessor } from './template-processor.js';
import { TemplateDiagram } from './template-diagram.js';
import { TemplateInstance } from './template-instance.js';

const templateDiagramCache: Map<HTMLTemplateElement, TemplateDiagram> = new Map();

HTMLTemplateElement.prototype.createInstance = function(
    state?: any,
    processor: TemplateProcessor = defaultTemplateProcessor,
    overrideDiagramCache = false): TemplateInstance {

  if (!templateDiagramCache.has(this) || overrideDiagramCache) {
    templateDiagramCache.set(this, new TemplateDiagram(this));
  }

  const diagram = templateDiagramCache.get(this)!;

  return new TemplateInstance(diagram, state, processor);
}
