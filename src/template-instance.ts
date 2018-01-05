//import { parse } from './template-string-parser.js';

export class TemplateInstance extends DocumentFragment {
  state: any;

  update(state: any) {}
}

HTMLTemplateElement.prototype.createInstance = function(state?: any) {
  const instance = new TemplateInstance();
  const content = this.content.cloneNode(true);
  const remainingNodes = [];

  let parentNode = instance;

  remainingNodes.push(...Array.from(content.childNodes));

  while (remainingNodes.length) {
    const node = remainingNodes.shift() as Node;

    switch (node.nodeType) {
      case Node.TEXT_NODE:
        //const data = node.data.trim();
        //const [strings, expressions] = parse(data);

        //if (strings.length === 1 && expressions.length === 0) {
          //continue;
        //}

        break;
      case Node.ELEMENT_NODE:
        break;
      default:
        parentNode.appendChild(node);
        break;
    }


  }

  instance.update(state);
  return instance;
}
