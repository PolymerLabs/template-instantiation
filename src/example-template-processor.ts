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
import {
  TemplatePart,
  NodeTemplatePart,
  AttributeTemplatePart,
  InnerTemplatePart
} from './template-part.js';
import {
  NodeTemplateRule,
  AttributeTemplateRule
} from './template-rule.js';

export class ExampleTemplateProcessor extends TemplateProcessor {
  createdCallback(_parts: TemplatePart[], _state?: any): void {}

  processCallback(parts: TemplatePart[], state?: any): void {
    for (const part of parts) {
      if (part instanceof InnerTemplatePart) {
        // TODO
      } else if (part instanceof NodeTemplatePart) {
        const { expression } = part.rule as NodeTemplateRule;
        part.value = state && expression && state[expression];
      } else if (part instanceof AttributeTemplatePart) {
        const { expressions } = part.rule as AttributeTemplateRule;
        part.value = state && expressions &&
            expressions.map(expression => state && state[expression]);
      }
    }
  }
};
