import { TemplatePart, ValueSetter } from '../template-part.js';

export class NodeTemplatePart extends TemplatePart {
  readonly parentNode: Node;
  readonly previousSibling: Node | null;
  readonly nextSibling: Node | null;
  readonly replacementNodes: NodeList | Node[];

  replace(...nodes: Array<Node | string>) {};
  replaceHTML(html: string) {};

  constructor(parentNode: Node, previousSibling: Node | null, nextSibling: Node | null) {
    super(new NodeValueSetter(parentNode, previousSibling, nextSibling));

    this.parentNode = parentNode;
    this.previousSibling = previousSibling;
    this.nextSibling = nextSibling;
  }
}


export class NodeValueSetter extends ValueSetter {
  readonly parentNode: Node;
  readonly previousSibling: Node | null;
  readonly nextSibling: Node | null;

  nodeTemplateParts: Array<Node | NodeTemplatePart>;
  previousReplacementNodes: NodeList | Node[];

  constructor(parentNode: Node, previousSibling: Node | null, nextSibling: Node | null) {
    super();

    this.parentNode = parentNode;
    this.previousSibling = previousSibling;
    this.nextSibling = nextSibling;
  }

  set value(value: string | void) {

  }

  get value(): string | void {
    return;
  }
}

