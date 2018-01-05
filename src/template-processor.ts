/// <reference path="./global.d.ts" />

import { TemplatePart } from './template-part.js';
import { TemplateInstance } from './template-instance.js';

export type CustomTemplateRegistry = Map<string, TemplateProcessor>;

export abstract class TemplateProcessor {
  abstract processCallback(instance: TemplateInstance,
      parts: TemplatePart[],
      state: any): void;

  abstract declareCallback(template: HTMLTemplateElement): void;
  createdCallback() {};
}

Document.prototype.defineTemplateType =
    function(typeName: string, processor: TemplateProcessor) {

    }

