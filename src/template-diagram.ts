import { parse } from './template-string-parser.js';
import {
  TemplateSentinel,
  NodeTemplateSentinel,
  AttributeTemplateSentinel
} from './template-sentinel.js';

export class TemplateDiagram {
  sentinels: TemplateSentinel[];

  protected parsedTemplate: HTMLTemplateElement;

  constructor(public template: HTMLTemplateElement) {
    this.parseAndGenerateSentinels();
  }

  cloneContent() {
    return this.parsedTemplate.content.cloneNode(true);
  }

  protected parseAndGenerateSentinels() {
    const { template } = this;
    const content = template.content.cloneNode(true);
    const sentinels = [];

    // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
    const walker = document.createTreeWalker(
        content,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
        null as any,
        false);
    let nodeIndex = -1;

    while (walker.nextNode()) {
      nodeIndex++;

      const node = walker.currentNode as Element;

      if (node.nodeType === Node.ELEMENT_NODE) {
        if (!node.hasAttributes()) {
          continue;
        }

        // TODO(cdata): Inner template nodes handled here...?

        const { attributes } = node;

        // TODO(cdata): Fix IE/Edge attribute order here
        // @see https://github.com/Polymer/lit-html/blob/master/src/lit-html.ts#L220-L229

        for (let i = 0; i < attributes.length; ++i) {
          const attribute = attributes[i];
          const { name, value } = attribute;

          const [ strings, expressions ] = parse(value);

          if (strings.length === 1) {
            continue;
          }

          sentinels.push(new AttributeTemplateSentinel(
              nodeIndex, name, strings, expressions));

          node.removeAttribute(name);
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        const [ strings, expressions ] = parse(node.nodeValue || '');
        const { parentNode } = node;
        const document = node.ownerDocument;

        if (strings.length === 1) {
          continue;
        }

        for (let i = 0; i < expressions.length; ++i) {
          const partNode = document.createTextNode('');

          nodeIndex++;

          // NOTE(cdata): Lit only uses one node for this. Can probably be optimized....
          // @see https://github.com/Polymer/lit-html/blob/master/src/lit-html.ts#L267-L272
          parentNode!.insertBefore(document.createTextNode(strings[i]), node);
          parentNode!.insertBefore(partNode, node);

          sentinels.push(new NodeTemplateSentinel(nodeIndex++, expressions[i]));
        }

        node.nodeValue = strings[strings.length - 1];
      }
    }

    this.sentinels = sentinels;

    this.parsedTemplate = document.createElement('template');
    this.parsedTemplate.content.appendChild(content);
  }
};

