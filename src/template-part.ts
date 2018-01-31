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
    this.relocateTo(node);
  }

  get node(): Node {
    return this.sourceNode;
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

  // SPECIAL NOTE(cdata): Parts in this implementation can be "relocated" to
  // arbitrary positions in a tree.
  abstract relocateTo(node: Node): void;

  protected abstract applyValue(value: any): void;
}

export class AttributeTemplatePart extends TemplatePart {
  rule: AttributeTemplateRule;

  clear() {
    if (this.node != null) {
      (this.node as Element).removeAttribute(this.rule.attributeName);
    }
  }

  relocateTo(node: Node) {
    this.clear();
    this.sourceNode = node;
    this.applyValue(this.value);
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
}

export class NodeTemplatePart extends TemplatePart {
  rule: NodeTemplateRule;

  currentNodes: Node[] = [];
  previousSibling: Node;
  nextSibling: Node | null;

  get parentNode(): Node | null {
    return this.previousSibling.parentNode;
  }

  replace(...nodes: Array<Node | string | NodeTemplatePart>) {
    this.clear();

    for (let i = 0; i < nodes.length; ++i) {
      let node = nodes[i];

      if (typeof node === 'string') {
        node = document.createTextNode(node);
      }

      // SPECIAL NOTE(cdata): This implementation supports NodeTemplatePart as
      // a replacement node:
      if (node instanceof NodeTemplatePart) {
        const part = node as NodeTemplatePart;
        node = part.node;
        this.appendNode(node);
        part.relocateTo(node);
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
   * TemplateRule of the current part.
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
   * TemplateRule of the current part.
   */
  enclose(): NodeTemplatePart {
    const node = document.createTextNode('');

    this.parentNode!.insertBefore(node, this.previousSibling.nextSibling);

    return new NodeTemplatePart(this.templateInstance, this.rule, node);
  }

  relocateTo(node: Node) {
    const { currentNodes, sourceNode } = this;

    if (sourceNode != null && sourceNode !== node) {
      this.clear();
    }

    this.previousSibling = node;
    this.nextSibling = node.nextSibling;
    this.sourceNode = node;

    if (currentNodes != null && currentNodes.length) {
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

