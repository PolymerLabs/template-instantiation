/// <reference path="../node_modules/@types/chai/index.d.ts" />

import { Spec } from '../node_modules/@0xcda7a/test-runner/lib/spec.js';
import '../node_modules/chai/chai.js';

import { TemplateProcessor } from './template-processor.js';
import { TemplateInstance } from './template-instance.js';
import { TemplatePart } from './template-part.js';

const expect = chai.expect;
const spec = new Spec();
const { describe, it, fixture } = spec;

describe('TemplateProcessor', () => {
  fixture((context: any) => {
    class TestProcessor extends TemplateProcessor {
      declareCallback(template: HTMLTemplateElement) {}
      processCallback(instance: TemplateInstance,
          parts: TemplatePart[],
          state: any): void {
        console.log(instance, parts, state);
      }
    }

    context.TestProcessor = TestProcessor;
  });

  it('can be instantiated', (context: any) => {
    const { TestProcessor } = context;
    const instance = new TestProcessor();
    expect(instance).to.be.ok;
  });

  describe('Document', () => {
    it('can register processors', () => {
      expect(document.defineTemplateType).to.be.ok;
    });
  });
});

export { spec as templateProcessorSpec };
