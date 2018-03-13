/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */

export enum TemplateExpressionKind {
  Node = 0,
  Attribute = 1,
  InnerTemplate = 2
};

export class TemplateExpressionRule {
  readonly kind: TemplateExpressionKind;

  constructor(public nodeIndex: number) {}
}

export class NodeTemplateExpressionRule extends TemplateExpressionRule {
  readonly kind: TemplateExpressionKind = TemplateExpressionKind.Node;

  constructor(public nodeIndex: number, public expression: string) {
    super(nodeIndex);
  }
}

export class AttributeTemplateExpressionRule extends TemplateExpressionRule {
  readonly kind: TemplateExpressionKind = TemplateExpressionKind.Attribute;

  constructor(public nodeIndex: number,
      public attributeName: string,
      public strings: string[],
      public expressions: string[]) {
    super(nodeIndex);
  }
}

export class InnerTemplateExpressionRule extends NodeTemplateExpressionRule {
  readonly kind: TemplateExpressionKind = TemplateExpressionKind.InnerTemplate;

  constructor(public nodeIndex: number, public template: HTMLTemplateElement) {
    super(nodeIndex, template.getAttribute('expression') || '');
  }
}
