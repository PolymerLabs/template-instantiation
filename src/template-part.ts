import { TemplateAssembly } from './template-assembly.js';
import { TemplateInstance } from './template-instance.js';
import {
  TemplateSentinel,
  NodeTemplateSentinel,
  AttributeTemplateSentinel
} from './template-sentinel.js';

export abstract class TemplatePart {
  protected previousValue: any;

  constructor(
      public templateInstance: TemplateInstance,
      public sentinel: TemplateSentinel,
      public node: Node) {}


  get value(): any {
    return this.previousValue;
  }

  set value(value: any) {
    this.previousValue = value;
  }
}

export class AttributeTemplatePart extends TemplatePart {
  constructor(
      public templateInstance: TemplateInstance,
      public sentinel: AttributeTemplateSentinel,
      public node: Node) {
    super(templateInstance, sentinel, node);
  }

  get expressions(): string[] {
    return this.sentinel.expressions;
  }

  set value(value: any) {
    if (value == null) {
      value = [];
    } else if (!Array.isArray(value)) {
      value = [value];
    }

    const node = this.node as Element;
    const { sentinel } = this;
    const { strings, attributeName } = sentinel;
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
  }
}

export class NodeTemplatePart extends TemplatePart {
  protected previousValue: any = null;
  protected previousPartNodes: Node[] = [];

  nextSibling: Node | null;

  constructor(public templateInstance: TemplateInstance,
      public sentinel: NodeTemplateSentinel,
      public node: Node) {
    super(templateInstance, sentinel, node);

    this.nextSibling = node.nextSibling;
  }

  get expression() {
    return this.sentinel.expression;
  }

  get previousSibling(): Node {
    return this.node;
  }

  get parentNode(): Node | null {
    return this.node.parentNode;
  }

  set value(value: any) {
    if (value === null ||
        !(typeof value === 'object' || typeof value === 'function')) {
      // Handle primitive values
      // If the value didn't change, do nothing
      if (value === this.previousValue) {
        return;
      }

      this.setTextValue(value);
    } else if (value instanceof TemplateAssembly) {
      this.setTemplateAssemblyValue(value);
    }/* else if (Array.isArray(value) || value[Symbol.iterator]) {
      this._setIterable(value);
    }*/ else if (value instanceof Node) {
      this.setNodeValue(value);
    }/* else if (value.then !== undefined) {
      this._setPromise(value);
    }*/ else {
      // Fallback, will render the string representation
      this.setTextValue(value);
    }
  }

  protected setTemplateAssemblyValue(value: TemplateAssembly) {
    let instance: TemplateInstance;

    if (this.previousValue &&
        this.previousValue.diagram === value.diagram) {
      instance = this.previousValue;
    } else {
      instance = new TemplateInstance(value.diagram, value.processor);

      this.setNodeValue(instance);
      this.previousValue = instance;
    }

    instance.update(value.state);
  }

  protected setTextValue(value: string = '') {
    const node = this.previousSibling!;

    if (node.nextSibling === this.nextSibling &&
        node.nodeType === Node.TEXT_NODE) {
      node.textContent = value;
    } else {
      this.setNodeValue(document.createTextNode(value));
    }

    this.previousValue = value;
  }

  protected setNodeValue(value: Node) {
    if (this.previousValue === value) {
      return;
    }

    this.clear();
    this.parentNode!.insertBefore(value, this.nextSibling);
    this.previousValue = value;
  }

  protected clear() {
    if (this.parentNode === null) {
      return;
    }

    let node = this.previousSibling;

    while (node !== this.nextSibling) {
      const nextNode: Node | null = node.nextSibling;
      this.parentNode.removeChild(node);
      node = nextNode as Node;
    }
  }
}

