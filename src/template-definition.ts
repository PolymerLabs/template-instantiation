/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */

import { parse } from './template-string-parser.js';
import {
  TemplateRule,
  NodeTemplateRule,
  AttributeTemplateRule,
  InnerTemplateRule
} from './template-rule.js';

// Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
export const createTreeWalker = (node: Node) => document.createTreeWalker(
    node,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null as any,
    false);

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

    const walker = createTreeWalker(content);
    let nodeIndex = -1;

    while (walker.nextNode()) {
      nodeIndex++;

      const node = walker.currentNode as Element;

      if (node.nodeType === Node.ELEMENT_NODE) {
        if (!node.hasAttributes()) {
          continue;
        }

        if (node instanceof HTMLTemplateElement) {
          const { parentNode } = node;
          const partNode = document.createTextNode('');

          parentNode!.replaceChild(partNode, node);

          rules.push(new InnerTemplateRule(nodeIndex, node));
        } else {
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

