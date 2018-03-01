/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */

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
