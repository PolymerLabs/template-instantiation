/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */

import { PreparedTemplate } from './prepared-template.js';
import { createTreeWalker } from
    './template-tree-walker.js';
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

export class TemplateInstance {
  protected updateInvoked: boolean = false;
  protected previousState: any = null;
  protected contentFragment: DocumentFragment | null = null;
  public parts: TemplatePart[];

  createContent(): DocumentFragment {
    if (this.contentFragment != null) {
      throw new Error('TemplateInstance content can only be created once');
    }

    this.contentFragment = this.preparedTemplate.cloneContent();
    this.generateParts();

    // NOTE(cdata): At this stage, potentially there could be an optimized
    // expansion of the DOM tree:
    this.update(this.initialValues);

    return this.contentFragment;
  }

  update(newValues?: any) {
    const { processor, expressionRules } = this.preparedTemplate;
    const evaluatedState = processor.evaluate(expressionRules, newValues);

    processor.update(this, evaluatedState);

    this.previousState = evaluatedState;
  }

  // NOTE(cdata): Initial values are passed to the constructor so that a
  // nested theoretical nested `TemplateInstace` can be expanded without
  // knowing what its initial values should be:
  constructor(public preparedTemplate: PreparedTemplate,
      protected initialValues?: any) {}

  protected generateParts() {
    const { preparedTemplate } = this;
    const { expressionRules } = preparedTemplate;
    const parts = [];

    const walker = createTreeWalker(this.contentFragment!);

    let walkerIndex = -1;

    for (let i = 0; i < expressionRules.length; ++i) {
      const rule = expressionRules[i];
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

