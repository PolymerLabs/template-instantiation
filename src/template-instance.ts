/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */

import { TemplateDefinition, createTreeWalker } from './template-definition.js';
import { TemplateProcessor } from
    './template-processor.js';
import {
  TemplatePart,
  AttributeTemplatePart,
  NodeTemplatePart,
  InnerTemplatePart
} from './template-part.js';
import {
  TemplateExpressionKind,
  TemplateExpressionRule,
  AttributeTemplateExpressionRule,
  NodeTemplateExpressionRule,
  InnerTemplateExpressionRule
} from './template-expression.js';

export class TemplateInstance extends DocumentFragment {
  protected createdCallbackInvoked: boolean = false;
  protected previousState: any = null;
  protected parts: TemplatePart[];

  update(state?: any) {
    if (!this.createdCallbackInvoked) {
      this.processor.createdCallback(this.parts, state);
      this.createdCallbackInvoked = true;
    }

    this.processor.processCallback(this.parts, state);
    this.previousState = state;
  }

  constructor(public definition: TemplateDefinition,
      public processor: TemplateProcessor,
      state?: any) {
    super();

    this.appendChild(definition.cloneContent());
    this.generateParts();
    this.update(state);
  }

  protected generateParts() {
    const { definition } = this;
    const { rules } = definition;
    const parts = [];

    const walker = createTreeWalker(this);

    let walkerIndex = -1;

    for (let i = 0; i < rules.length; ++i) {
      const rule = rules[i];
      const { nodeIndex } = rule;

      while (walkerIndex < nodeIndex) {
        walkerIndex++;
        walker.nextNode();
      }

      const part = this.createPart(rule, walker.currentNode);

      parts.push(part);
    }

    this.parts = parts;
  }

  // NOTE(cdata): In the original pass, this was exposed in the
  // TemplateProcessor to be optionally overridden so that parts could
  // have custom implementations.
  protected createPart(rule: TemplateExpressionRule, node: Node): TemplatePart {
    switch (rule.kind) {
      case TemplateExpressionKind.Attribute:
        return new AttributeTemplatePart(this,
            rule as AttributeTemplateExpressionRule, node as HTMLElement);
      case TemplateExpressionKind.InnerTemplate:
        return new InnerTemplatePart(this,
            rule as InnerTemplateExpressionRule, node);
      case TemplateExpressionKind.Node:
        return new NodeTemplatePart(this,
            rule as NodeTemplateExpressionRule, node);
    }

    throw new Error(`Unknown rule type.`);
  }
}

