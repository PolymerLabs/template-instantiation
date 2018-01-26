import { Spec } from '../../@0xcda7a/test-runner/lib/spec.js';
import '../../chai/chai.js';
import { TemplateInstance } from './template-instance.js';
import './html-template-element.js';

const spec = new Spec();
const { describe, it, fixture } = spec;
const { expect } = chai;

describe('HTMLTemplateElement', () => {
  it('has a method createInstance', () => {
    expect(document.createElement('template').createInstance).to.be.ok;
  });

  describe('createInstance', () => {
    fixture(() => {
      const template = document.createElement('template');
      template.innerHTML = `<div>{{content}}</div>`;
      return { template };
    });

    describe('without arguments', () => {
      it('returns a DocumentFragment', (context: any) => {
        const { template } = context;
        const instance = template.createInstance();

        expect(instance).to.be.instanceof(DocumentFragment);
      });

      it('returns a TemplateInstance', (context: any) => {
        const { template } = context;
        const instance = template.createInstance();

        expect(instance).to.be.instanceof(TemplateInstance);
      });
    });

    describe('with arguments', () => {
      describe('specifying a processor', () => {});
      describe('specifying initial state', () => {});
    });
  });
});

export { spec as htmlTemplateElementSpec };
