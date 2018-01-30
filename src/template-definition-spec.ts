import { Spec } from '../../@0xcda7a/test-runner/lib/spec.js';
import '../../chai/chai.js';
import { TemplateDefinition } from './template-definition.js';
import { NodeTemplateExpression, AttributeTemplateExpression } from './template-expression.js';

const spec = new Spec();
const { describe, it, fixture } = spec;
const { expect } = chai;

describe('TemplateDefinition', () => {
  describe('with an empty template', () => {
    fixture(() => {
      const template = document.createElement('template');
      template.innerHTML = ``;
      return {
        template,
        definition: new TemplateDefinition(template)
      };
    });

    it('generates no expressions', (context: any) => {
      const { definition } = context;
      expect(definition.expressions.length).to.be.equal(0);
    });
  });

  describe('with a dynamic node part', () => {
    fixture(() => {
      const template = document.createElement('template');
      template.innerHTML = `<div>{{foo}}</div>`;
      return {
        template,
        definition: new TemplateDefinition(template)
      };
    });

    it('generates a node sentinel', (context: any) => {
      const { definition } = context;
      expect(definition.expressions.length).to.be.equal(1);
      expect(definition.expressions[0]).to.be.instanceof(NodeTemplateExpression);
    });
  });

  describe('with a dynamic attribute part', () => {
    fixture(() => {
      const template = document.createElement('template');
      template.innerHTML = `<div foo="{{bar}}"></div>`;
      return {
        template,
        definition: new TemplateDefinition(template)
      };
    });

    it('generates an attribute sentinel', (context: any) => {
      const { definition } = context;
      expect(definition.expressions.length).to.be.equal(1);
      expect(definition.expressions[0]).to.be.instanceof(AttributeTemplateExpression);
    });
  });

  describe('with a variety of dynamic parts', () => {
    fixture(() => {
      const template = document.createElement('template');
      template.innerHTML = `
<div foo="{{bar}}">{{baz}}</div>
prefix {{qux}} suffix
<parent vim="prefix {{rak}} suffix">
  <child>{{lur}}</child>
</parent>`;
      return {
        template,
        definition: new TemplateDefinition(template)
      };
    });

    it('generates several expressions', (context: any) => {
      const { definition } = context;
      const { expressions } = definition;

      expect(expressions.length).to.be.equal(5);
    });

    it('generates expressions in tree order', (context: any) => {
      const { definition } = context;
      const { expressions } = definition;
      const [ bar, baz, qux, rak, lur ] = expressions;

      expect(bar).to.be.instanceof(AttributeTemplateExpression);
      expect(bar.values).to.be.eql(['bar']);

      expect(baz).to.be.instanceof(NodeTemplateExpression);
      expect(baz.value).to.be.equal('baz');

      expect(qux).to.be.instanceof(NodeTemplateExpression);
      expect(qux.value).to.be.equal('qux');

      expect(rak).to.be.instanceof(AttributeTemplateExpression);
      expect(rak.values).to.be.eql(['rak']);

      expect(lur).to.be.instanceof(NodeTemplateExpression);
      expect(lur.value).to.be.eql('lur');
    });
  });
});

export { spec as templateDefinitionSpec };
