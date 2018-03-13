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
import { TemplateInstance } from './template-instance.js';
import {
  TemplateExpressionKind,
  NodeTemplateExpressionRule,
  AttributeTemplateExpressionRule
} from './template-expression.js';

export class ExampleTemplateProcessor extends TemplateProcessor {
  update(templateInstance: TemplateInstance, state?: any): void {
    const { parts } = templateInstance;

    for (const part of parts) {
      switch (part.rule.kind) {
        case TemplateExpressionKind.InnerTemplate:
          // TODO
          break;
        case TemplateExpressionKind.Node:
          const { expression } = part.rule as NodeTemplateExpressionRule;
          part.value = state && expression && state[expression];
          break;
        case TemplateExpressionKind.Attribute:
          const { expressions } = part.rule as AttributeTemplateExpressionRule;
          part.value = state && expressions &&
              expressions.map(expression => state && state[expression]);
          break;
      }
    }
  }
};
