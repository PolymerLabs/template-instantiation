import { TemplateInstance } from './template-instance.js';
import {
  TemplateExpression,
  NodeTemplateExpression,
  AttributeTemplateExpression
} from './template-expression.js';

export abstract class TemplatePart {
  rawValue: any = null;

  constructor(public templateInstance: TemplateInstance,
      public expression: TemplateExpression,
      public node: Node) {}

  // NOTE(cdata): rniwa calls for this to be the result of concatenating the
  // textContent of all replacement nodes:
  get value(): any {
    return this.rawValue;
  }

  set value(value: any) {
    this.update(value);
    this.rawValue = value;
  }

  protected abstract update(value: any): void;
}

export class AttributeTemplatePart extends TemplatePart {
  constructor(
      public templateInstance: TemplateInstance,
      public expression: AttributeTemplateExpression,
      public node: Node) {
    super(templateInstance, expression, node);
  }

  protected update(value: any) {
    if (value == null) {
      value = [];
    } else if (!Array.isArray(value)) {
      value = [value];
    }

    const node = this.node as Element;
    const { expression } = this;
    const { strings, attributeName } = expression;
    const valueFragments = [];

    for (let i = 0; i < (strings.length - 1); ++i) {
      valueFragments.push(strings[i]);
      valueFragments.push(value[i] || '');
    }

    const attributeValue = valueFragments.join('');

    if (attributeValue != null) {
      node.setAttribute(attributeName, attributeValue);
    } else {
      node.removeAttribute(attributeName);
    }

    this.rawValue = value;
  }
}

const interstitialTemplate: HTMLTemplateElement =
    document.createElement('template');

export class NodeTemplatePart extends TemplatePart {
  currentNodes: Node[] = [];
  previousSibling: Node;
  nextSibling: Node | null;

  protected insertionFragment: DocumentFragment =
      document.createDocumentFragment();

  constructor(public templateInstance: TemplateInstance,
      public expression: NodeTemplateExpression,
      public node: Node) {
    super(templateInstance, expression, node);

    this.previousSibling = node;
    this.nextSibling = node.nextSibling;
  }

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

  replaceHTML(html: string) {
    interstitialTemplate.innerHTML = html;
    this.replace(...interstitialTemplate.content.childNodes);
  }

  protected appendNode(node: Node) {
    this.parentNode!.insertBefore(node, this.nextSibling);
    this.currentNodes.push(node);
  }

  protected clear() {
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

  protected update(value: any) {
    if (this.currentNodes.length === 1 &&
        this.currentNodes[0].nodeType === Node.TEXT_NODE) {
      this.currentNodes[0].nodeValue = value;
    } else {
      this.replace(document.createTextNode(value));
    }
  }
}

