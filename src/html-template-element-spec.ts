import { Spec } from '../../@0xcda7a/test-runner/lib/spec.js';
import '../../chai/chai.js';
import { ExampleTemplateProcessor } from './example-template-processor.js';
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
      it('throws due to missing processor', ({ template }: any) => {
        let threw = false;

        try {
          template.createInstance();
        } catch (e) {
          threw = true;
        }

        expect(threw).to.be.equal(true);
      });
    });

    describe('given a processor', () => {
      fixture((context: any) => {
        return { ...context, processor: new ExampleTemplateProcessor };
      });

      it('returns a DocumentFragment', ({ template, processor }: any) => {
        const instance = template.createInstance(processor);
        expect(instance).to.be.instanceof(DocumentFragment);
      });

      it('returns a TemplateInstance', ({ template, processor }: any) => {
        const instance = template.createInstance(processor);
        expect(instance).to.be.instanceof(DocumentFragment);
      });

      describe('with initial state', () => {
        fixture((context: any) => {
          return { ...context, state: { content: 'Hello world.' } };
        });

        it('puts the state in the DOM', ({ template, processor, state }: any) => {
          const instance = template.createInstance(processor, state);
          expect(instance.childNodes[0].innerText).to.be.equal(state.content);
        });
      });
    });
  });
});

export { spec as htmlTemplateElementSpec };
