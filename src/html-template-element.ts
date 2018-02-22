import { TemplateProcessor } from './template-processor.js';
import { TemplateDefinition } from './template-definition.js';
import { TemplateInstance } from './template-instance.js';

const templateDefinitionCache: Map<HTMLTemplateElement, TemplateDefinition> = new Map();

declare global {
  interface HTMLTemplateElement {
    createInstance(
        processor: TemplateProcessor,
        state?: any,
        overrideDiagramCache?: boolean): TemplateInstance
  }
}

HTMLTemplateElement.prototype.createInstance = function(
    processor: TemplateProcessor,
    state?: any,
    overrideDefinitionCache = false): TemplateInstance {
  if (processor == null) {
    throw new Error('The first argument of createInstance must be an implementation of TemplateProcessor');
  }

  if (!templateDefinitionCache.has(this) || overrideDefinitionCache) {
    templateDefinitionCache.set(this, new TemplateDefinition(this));
  }

  const definition = templateDefinitionCache.get(this)!;

  return new TemplateInstance(definition, processor, state);
};
