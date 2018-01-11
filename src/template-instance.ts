//import { parse } from './template-string-parser.js';

export class TemplateInstance extends DocumentFragment {
  state: any;

  update(state: any) {}
}

const nonWhitespaceRe = /\S/;

class TemplateInstanceFactory {
  readonly template: HTMLTemplateElement;

  constructor(template: HTMLTemplateElement) {
    this.template = template;
  }

  private nodeIsFullyTemplatizable(node: Node): boolean {
    // TODO(cdata): What if parentNode is null?
    const { parentNode } = node;

    if (parentNode instanceof TemplateInstance) {
      return false;
    }

    let child = parentNode!.firstChild;

    while (child != null) {
      if (child !== node) {
        if (child.nodeType !== Node.TEXT_NODE ||
            nonWhitespaceRe.test((child as Text).data)) {
          return false;
        }
      }

      child = child.nextSibling;
    }

    return true;
  }

  private adjustSingleNode(node: Node) {
    const { parentNode, ownerDocument } = node;

    if (parentNode instanceof TemplateInstance &&
        parentNode.childNodes.length === 1) {
      parentNode.insertBefore(ownerDocument.createTextNode(''), node);
    }
  }

  createInstance(state?: any): TemplateInstance {
    const instance = new TemplateInstance();
    const content = this.template.content.cloneNode(true);
    const remainingNodes = [];

    remainingNodes.push(...Array.from(content.childNodes));
    instance.appendChild(content);

    while (remainingNodes.length) {
      const node: Node = remainingNodes.shift() as Node;

      switch (node.nodeType) {
        case Node.TEXT_NODE:
          const text = node as Text;
          const data = text.data.trim();
          const [strings, expressions] = parse(data);

          if (strings.length === 1 && expressions.length === 0) {
            continue;
          }

          this.adjustSingleNode(text);

          break;
        case Node.ELEMENT_NODE:
          const element: Element = node as Element;

          switch (element.localName) {
            case 'template':

              this.adjustSingleNode(element);

              break;
            default:
              break;
          }

          break;
        default:
          break;
      }

      if (node.childNodes && node.childNodes.length) {
        remainingNodes.unshift(Array.from(node.childNodes));
      }
    }

    instance.update(state);
    return instance;
  }
};

const templateInstanceFactoryCache: Map<HTMLTemplateElement, TemplateInstanceFactory> = new Map();

HTMLTemplateElement.prototype.createInstance = function(state?: any) {
  if (!templateInstanceFactoryCache.has(this)) {
    templateInstanceFactoryCache.set(this, new TemplateInstanceFactory(this));
  }

  const templateInstanceFactory = templateInstanceFactoryCache.get(this);
  return templateInstanceFactory!.createInstance(state);
}
