import { TemplatePart } from '../template-part.js';

export class NodeTemplatePart extends TemplatePart {
  readonly parentNode: Node;
  readonly previousSibling: Node;
  readonly nextSibling: Node;
  readonly replacementNodes: NodeList | Node[]

}
