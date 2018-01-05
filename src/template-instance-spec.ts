/// <reference path="../node_modules/@types/chai/index.d.ts" />

import { Spec } from '../node_modules/@0xcda7a/test-runner/lib/spec.js';
import '../node_modules/chai/chai.js';

import { TemplateInstance } from './template-instance.js';

const expect = chai.expect;
const spec = new Spec();
const { describe, it, fixture } = spec;


describe('TemplateInstance', () => {
  it('can be instantiated', () => {
    const instance = new TemplateInstance();
    expect(instance).to.be.ok;
  });

  describe('HTMLTemplateElement', () => {
    fixture((context: any) => {
      context.element = document.createElement('template');
    });

    it('gets a new createInstance method', (context: any) => {
      const { element } = context;
      expect(element.createInstance).to.be.ok;
    });

    describe('createInstance result', () => {
      fixture((context: any) => {
        const { element } = context;
        element.innerHTML = `<div></div>`;
      });

      it('is a TemplateInstance', (context: any) => {
        const { element } = context;
        const instance = element.createInstance();

        expect(instance).to.be.instanceof(TemplateInstance);
      });
    });
  });
});

export { spec as templateInstanceSpec };
