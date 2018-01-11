import { NodeTemplatePart } from '../node-template-part.js';

export class InnerTemplatePart extends NodeTemplatePart {
  readonly template: HTMLTemplateElement;
  readonly directive: string;
}
