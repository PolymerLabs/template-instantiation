/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */

import { PreparedTemplate } from './prepared-template.js';
import { TemplateInstance } from './template-instance.js';
import { parse } from './template-string-parser.js';
import {
  TemplateExpressionRule,
  InnerTemplateExpressionRule,
  NodeTemplateExpressionRule,
  AttributeTemplateExpressionRule
} from './template-expression.js';
import { createTreeWalker } from './template-tree-walker.js';

export abstract class TemplateProcessor {
  // NOTE(cdata): The `prepare` stage represents the default process for
  // parsing part expressions from a given template. This can be overridden
  // to extend or replace completely the algorithm for deciding what parts
  // should be created for a given template.
  prepare(template: HTMLTemplateElement): PreparedTemplate {
    const content = template.content.cloneNode(true);
    const rules: TemplateExpressionRule[] = [];

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

          rules.push(new InnerTemplateExpressionRule(nodeIndex, node));
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

            rules.push(new AttributeTemplateExpressionRule(
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
          rules.push(new NodeTemplateExpressionRule(nodeIndex++, values[i]));
        }

        node.nodeValue = strings[strings.length - 1];
      }
    }

    const parsedTemplate = document.createElement('template');
    parsedTemplate.content.appendChild(content);

    return new PreparedTemplate(this, parsedTemplate, rules);
  }

  // NOTE(cdata): The `evaluate` stage receives expressions and input values,
  // and returns generated state suitable for assigning to the parts that
  // correspond to those expressions.
  evaluate(_expressionRules: TemplateExpressionRule[], inputValues: any): any {
    return inputValues;
  }

  // NOTE(cdata): Author will have access to parts via `templateInstance`
  abstract update(templateInstance: TemplateInstance, evaluatedState: any): void;
}

