/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */

import { TemplateInstance } from './template-instance.js';
import {
  TemplateExpressionRule,
  AttributeTemplateExpressionRule,
  NodeTemplateExpressionRule,
  InnerTemplateExpressionRule
} from './template-expression.js';



export abstract class TemplatePart {
  protected sourceValue: any;

  constructor(readonly templateInstance: TemplateInstance,
      readonly rule: TemplateExpressionRule) {}

  get value(): any {
    return this.sourceValue;
  }

  set value(value: any) {
    if (value !== this.sourceValue) {
      this.sourceValue = value;
      this.applyValue(value);
    }
  }

  abstract clear(): void;
  protected abstract applyValue(value: any): void;
}



export class AttributeTemplatePart extends TemplatePart {
  constructor(readonly templateInstance: TemplateInstance,
      readonly rule: AttributeTemplateExpressionRule,
      readonly element: HTMLElement) {
    super(templateInstance, rule);
  }

  clear() {
    this.element.removeAttribute(this.rule.attributeName);
  }

  protected applyValue(value: any) {
    if (value == null) {
      value = [];
    } else if (!Array.isArray(value)) {
      value = [value];
    }

    const { rule, element } = this;
    const { strings, attributeName } = rule;
    const valueFragments = [];

    for (let i = 0; i < (strings.length - 1); ++i) {
      valueFragments.push(strings[i]);
      valueFragments.push(value[i] || '');
    }

    const attributeValue = valueFragments.join('');

    if (attributeValue != null) {
      element.setAttribute(attributeName, attributeValue);
    } else {
      element.removeAttribute(attributeName);
    }
  }
}



export class NodeTemplatePart extends TemplatePart {
  parentNode: Node;
  previousSibling: Node;
  nextSibling: Node | null;

  currentNodes: Node[] = [];

  constructor(readonly templateInstance: TemplateInstance,
      readonly rule: NodeTemplateExpressionRule,
      protected startNode: Node) {
    super(templateInstance, rule);
    this.move(startNode);
  }

  replace(...nodes: Array<Node | string | NodeTemplatePart>) {
    this.clear();

    for (let i = 0; i < nodes.length; ++i) {
      let node = nodes[i];

      if (typeof node === 'string') {
        node = document.createTextNode(node);
      }

      // SPECIAL NOTE(cdata): This implementation supports NodeTemplatePart as
      // a replacement node. Usefulness TBD.
      if (node instanceof NodeTemplatePart) {
        const part = node as NodeTemplatePart;
        node = part.startNode;
        this.appendNode(node);
        part.move(node);
      } else if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE ||
          node.nodeType === Node.DOCUMENT_NODE) {
        // NOTE(cdata): Apple's proposal explicit forbid's document fragments
        // @see https://github.com/w3c/webcomponents/blob/gh-pages/proposals/Template-Instantiation.md
        throw new DOMException('InvalidNodeTypeError');
      } else {
        this.appendNode(node);
      }
    }
  }

  /**
   * Forks the current part, inserting a new part after the current one and
   * returning it. The forked part shares the TemplateInstance and the
   * TemplateExpressionRule of the current part.
   */
  fork(): NodeTemplatePart {
    const node = document.createTextNode('');

    this.parentNode!.insertBefore(node, this.nextSibling);
    this.nextSibling = node;

    return new NodeTemplatePart(this.templateInstance, this.rule, node);
  }

  /**
   * Creates a new inner part that is enclosed completely by the current
   * part and returns it. The enclosed part shares the TemplateInstance and the
   * TemplateExpressionRule of the current part.
   */
  enclose(): NodeTemplatePart {
    const node = document.createTextNode('');

    this.parentNode!.insertBefore(node, this.previousSibling.nextSibling);

    return new NodeTemplatePart(this.templateInstance, this.rule, node);
  }

  move(startNode: Node) {
    const { currentNodes, startNode: currentStartNode } = this;

    if (currentStartNode != null &&
        currentStartNode !== startNode &&
        currentNodes.length) {
      this.clear();
    }

    this.parentNode = startNode.parentNode!;
    this.previousSibling = startNode;
    this.nextSibling = startNode.nextSibling;
    this.startNode = startNode;

    if (currentNodes && currentNodes.length) {
      this.replace(...currentNodes);
    }
  }

  // SPECIAL NOTE(cdata): This clear is specialized a la lit-html to accept a
  // starting node from which to clear. This supports efficient cleanup of
  // subparts of a part (subparts are also particular to lit-html compared to
  // Apple's proposal).
  clear(startNode: Node = this.previousSibling.nextSibling!) {
    if (this.parentNode === null) {
      return;
    }

    let node = startNode;

    while (node !== this.nextSibling) {
      const nextNode: Node | null = node.nextSibling;
      this.parentNode.removeChild(node);
      node = nextNode as Node;
    }

    this.currentNodes = [];
  }

  protected appendNode(node: Node) {
    this.parentNode!.insertBefore(node, this.nextSibling);
    this.currentNodes.push(node);
  }

  protected applyValue(value: any) {
    if (this.currentNodes.length === 1 &&
        this.currentNodes[0].nodeType === Node.TEXT_NODE) {
      this.currentNodes[0].nodeValue = value;
    } else {
      this.replace(document.createTextNode(value));
    }
  }
}



export class InnerTemplatePart extends NodeTemplatePart {
  constructor(readonly templateInstance: TemplateInstance,
      readonly rule: InnerTemplateExpressionRule,
      protected startNode: Node) {
    super(templateInstance, rule, startNode);
  }

  get template(): HTMLTemplateElement {
    return this.rule.template;
  }
}

