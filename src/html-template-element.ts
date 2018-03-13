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
import { PreparedTemplate } from './prepared-template.js';
import { TemplateInstance } from './template-instance.js';

type PreparedTemplateCache = Map<TemplateProcessor, PreparedTemplate>;

const templateProcessorCache =
    new Map<HTMLTemplateElement, PreparedTemplateCache>();

declare global {
  interface HTMLTemplateElement {
    createInstance(
        processor: TemplateProcessor,
        state?: any,
        overrideDiagramCache?: boolean): TemplateInstance
  }
}

HTMLTemplateElement.prototype.createInstance = function(
    processor: TemplateProcessor, initialValues?: any): TemplateInstance {
  if (processor == null) {
    throw new Error('A processor is required in order to create a TemplateInstance');
  }

  let preparedTemplateCache = templateProcessorCache.get(this);
  let preparedTemplate: PreparedTemplate | undefined = preparedTemplateCache
      ? preparedTemplateCache.get(processor)
      : undefined;

  if (preparedTemplate == null) {
    if (preparedTemplateCache == null) {
      preparedTemplateCache = new Map<TemplateProcessor, PreparedTemplate>();
      templateProcessorCache.set(this, preparedTemplateCache);
    }

    preparedTemplate = processor.prepare(this);

    preparedTemplateCache.set(processor, preparedTemplate);
  }

  return new TemplateInstance(preparedTemplate, initialValues);
};
