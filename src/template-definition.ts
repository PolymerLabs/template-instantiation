import { parse } from './template-string-parser.js';
import {
  TemplateRule,
  NodeTemplateRule,
  AttributeTemplateRule
} from './template-rule.js';

export class TemplateDefinition {
  rules: TemplateRule[];

  parsedTemplate: HTMLTemplateElement;

  constructor(public template: HTMLTemplateElement) {
    this.parseAndGenerateRules();
  }

  cloneContent() {
    return this.parsedTemplate.content.cloneNode(true);
  }

  protected parseAndGenerateRules() {
    const { template } = this;
    const content = template.content.cloneNode(true);
    const rules: TemplateRule[] = [];

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

        for (let i = 0; i < attributes.length;) {
          const attribute = attributes[i];
          const { name, value } = attribute;

          const [ strings, values ] = parse(value);

          if (strings.length === 1) {
            ++i;
            continue;
          }

          rules.push(new AttributeTemplateRule(
              nodeIndex, name, strings, values));

          node.removeAttribute(name);
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        const [ strings, values ] = parse(node.nodeValue || '');
        const { parentNode } = node;
        const document = node.ownerDocument;

        if (strings.length === 1) {
          continue;
        }

        for (let i = 0; i < values.length; ++i) {
          const partNode = document.createTextNode(strings[i]);

          // @see https://github.com/Polymer/lit-html/blob/master/src/lit-html.ts#L267-L272
          parentNode!.insertBefore(partNode, node);
          rules.push(new NodeTemplateRule(nodeIndex++, values[i]));
        }

        node.nodeValue = strings[strings.length - 1];
      }
    }

    this.rules = rules;

    this.parsedTemplate = document.createElement('template');
    this.parsedTemplate.content.appendChild(content);
  }
};

