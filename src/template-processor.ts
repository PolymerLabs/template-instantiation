import { TemplatePart } from './template-part.js';

export abstract class TemplateProcessor {
  abstract processCallback(parts: TemplatePart[], state?: any): void;
}
