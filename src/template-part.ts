import { TemplateInstance } from './template-instance.js';
import {
  TemplateRule,
  AttributeTemplateRule,
  NodeTemplateRule
} from './template-rule.js';

export abstract class TemplatePart {
  protected sourceValue: any = null;
  protected sourceNode: Node;

  constructor(public templateInstance: TemplateInstance,
      public rule: TemplateRule,
      node: Node) {
    this.relocateToNode(node);
  }

  get node() {
    return this.sourceNode;
  }

  set node(node: Node) {
    this.relocateToNode(node);
  }

  // NOTE(cdata): rniwa calls for this to be the result of concatenating the
  // textContent of all replacement nodes:
  get value(): any {
    return this.sourceValue;
  }

  set value(value: any) {
    this.sourceValue = value;
    this.applyValue(value);
  }

  abstract clear(): void;
  protected abstract applyValue(value: any): void;
  protected abstract relocateToNode(node: Node): void;
}

export class AttributeTemplatePart extends TemplatePart {
  rule: AttributeTemplateRule;

  clear() {
    if (this.node != null) {
      (this.node as Element).removeAttribute(this.rule.attributeName);
    }
  }

  protected applyValue(value: any) {
    if (value == null) {
      value = [];
    } else if (!Array.isArray(value)) {
      value = [value];
    }

    const element = this.node as Element;
    const { rule } = this;
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

  protected relocateToNode(node: Node) {
    this.clear();
    this.sourceNode = node;
    this.applyValue(this.value);
  }
}

export class NodeTemplatePart extends TemplatePart {
  rule: NodeTemplateRule;

  currentNodes: Node[] = [];
  previousSibling: Node;
  nextSibling: Node | null;

  protected insertionFragment: DocumentFragment =
      document.createDocumentFragment();

  get parentNode(): Node | null {
    return this.previousSibling.parentNode;
  }

  replace(...nodes: Array<Node | string>) {
    this.clear();

    for (let i = 0; i < nodes.length; ++i) {
      let node = nodes[i];
      if (typeof node === 'string') {
        node = document.createTextNode(node);
      } else if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE ||
          node.nodeType === Node.DOCUMENT_NODE) {
        throw new DOMException('InvalidNodeTypeError');
      }

      this.appendNode(node);
    }
  }

  fork(): NodeTemplatePart {
    if (this.nextSibling == null) {
      this.nextSibling = document.createTextNode('');
      this.previousSibling.parentNode!.appendChild(this.nextSibling);
    }

    return new NodeTemplatePart(this.templateInstance, this.rule,
        this.nextSibling);
  }

  clear() {
    if (this.parentNode === null) {
      return;
    }

    let node = this.previousSibling.nextSibling!;

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

  protected relocateToNode(node: Node) {
    const { currentNodes, sourceNode } = this;

    if (sourceNode != null) {
      this.clear();
    }

    this.previousSibling = node;
    this.nextSibling = node.nextSibling;
    this.sourceNode = node;

    if (currentNodes != null && currentNodes.length) {
      this.replace(...currentNodes);
    }
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

