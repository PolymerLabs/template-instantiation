import { TemplatePart } from '../template-part.js';

export class AttributeTemplatePart extends TemplatePart {
  readonly element: Element;
  readonly attributeName: string;
  readonly attributeNamespace: string;
  booleanValue: boolean;
}
