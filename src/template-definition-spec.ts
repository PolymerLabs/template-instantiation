import { Spec } from '../../@0xcda7a/test-runner/lib/spec.js';
import { Fixturable } from '../../@0xcda7a/test-runner/lib/mixins/fixturable.js';
import '../../chai/chai.js';
import { TemplateDefinition } from './template-definition.js';
import { NodeTemplateRule, AttributeTemplateRule } from './template-rule.js';

const spec = new (Fixturable(Spec))();
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

    it('generates no rules', (context: any) => {
      const { definition } = context;
      expect(definition.rules.length).to.be.equal(0);
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
      expect(definition.rules.length).to.be.equal(1);
      expect(definition.rules[0]).to.be.instanceof(NodeTemplateRule);
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
      expect(definition.rules.length).to.be.equal(1);
      expect(definition.rules[0]).to.be.instanceof(AttributeTemplateRule);
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

    it('generates several rules', (context: any) => {
      const { definition } = context;
      const { rules } = definition;

      expect(rules.length).to.be.equal(5);
    });

    it('generates rules in tree order', (context: any) => {
      const { definition } = context;
      const { rules } = definition;
      const [ bar, baz, qux, rak, lur ] = rules;

      expect(bar).to.be.instanceof(AttributeTemplateRule);
      expect(bar.expressions).to.be.eql(['bar']);

      expect(baz).to.be.instanceof(NodeTemplateRule);
      expect(baz.expression).to.be.equal('baz');

      expect(qux).to.be.instanceof(NodeTemplateRule);
      expect(qux.expression).to.be.equal('qux');

      expect(rak).to.be.instanceof(AttributeTemplateRule);
      expect(rak.expressions).to.be.eql(['rak']);

      expect(lur).to.be.instanceof(NodeTemplateRule);
      expect(lur.expression).to.be.eql('lur');
    });
  });
});

export const templateDefinitionSpec: Spec = spec;
