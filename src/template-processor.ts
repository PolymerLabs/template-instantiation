import { TemplatePart } from './template-part.js';

export abstract class TemplateProcessor {
  abstract createdCallback(parts: TemplatePart[], state?: any): void;
  abstract processCallback(parts: TemplatePart[], state?: any): void;
}
