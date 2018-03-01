/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */

const partOpenRe = /{{/g;
const partCloseRe = /}}/g;

export const parse = (templateString: string):
    [string[], string[]] => {
  const strings: string[] = [];
  const expressions: string[] = [];
  const boundaryIndex = templateString.length + 1;

  let lastExpressionIndex =
      partOpenRe.lastIndex =
      partCloseRe.lastIndex = 0;

  while (lastExpressionIndex < boundaryIndex) {
    const openResults = partOpenRe.exec(templateString);

    if (openResults == null) {
      strings.push(templateString.substring(
          lastExpressionIndex, boundaryIndex));
      break;
    } else {
      const openIndex = openResults.index;

      partCloseRe.lastIndex = partOpenRe.lastIndex = openIndex + 2;

      const closeResults = partCloseRe.exec(templateString);

      if (closeResults == null) {
        strings.push(templateString.substring(
              lastExpressionIndex, boundaryIndex));
      } else {
        const closeIndex = closeResults.index;

        strings.push(templateString.substring(
            lastExpressionIndex, openIndex));

        expressions.push(templateString.substring(
            openIndex + 2, closeIndex));

        lastExpressionIndex = closeIndex + 2;
      }
    }
  }

  return [strings, expressions];
};

