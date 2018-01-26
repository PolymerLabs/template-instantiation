import { Spec } from '../../@0xcda7a/test-runner/lib/spec.js';
import '../../chai/chai.js';
import { TemplateDiagram } from './template-diagram.js';
import { NodeTemplateSentinel, AttributeTemplateSentinel } from './template-sentinel.js';

const spec = new Spec();
const { describe, it, fixture } = spec;
const { expect } = chai;

describe('TemplateDiagram', () => {
  describe('with an empty template', () => {
    fixture(() => {
      const template = document.createElement('template');
      template.innerHTML = ``;
      return {
        template,
        diagram: new TemplateDiagram(template)
      };
    });

    it('generates no sentinels', (context: any) => {
      const { diagram } = context;
      expect(diagram.sentinels.length).to.be.equal(0);
    });
  });

  describe('with a dynamic node part', () => {
    fixture(() => {
      const template = document.createElement('template');
      template.innerHTML = `<div>{{foo}}</div>`;
      return {
        template,
        diagram: new TemplateDiagram(template)
      };
    });

    it('generates a node sentinel', (context: any) => {
      const { diagram } = context;
      expect(diagram.sentinels.length).to.be.equal(1);
      expect(diagram.sentinels[0]).to.be.instanceof(NodeTemplateSentinel);
    });
  });

  describe('with a dynamic attribute part', () => {
    fixture(() => {
      const template = document.createElement('template');
      template.innerHTML = `<div foo="{{bar}}"></div>`;
      return {
        template,
        diagram: new TemplateDiagram(template)
      };
    });

    it('generates an attribute sentinel', (context: any) => {
      const { diagram } = context;
      expect(diagram.sentinels.length).to.be.equal(1);
      expect(diagram.sentinels[0]).to.be.instanceof(AttributeTemplateSentinel);
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
        diagram: new TemplateDiagram(template)
      };
    });

    it('generates several sentinels', (context: any) => {
      const { diagram } = context;
      const { sentinels } = diagram;

      expect(sentinels.length).to.be.equal(5);
    });

    it('generates sentinels in tree order', (context: any) => {
      const { diagram } = context;
      const { sentinels } = diagram;
      const [ bar, baz, qux, rak, lur ] = sentinels;

      expect(bar).to.be.instanceof(AttributeTemplateSentinel);
      expect(bar.expressions).to.be.eql(['bar']);

      expect(baz).to.be.instanceof(NodeTemplateSentinel);
      expect(baz.expression).to.be.equal('baz');

      expect(qux).to.be.instanceof(NodeTemplateSentinel);
      expect(qux.expression).to.be.equal('qux');

      expect(rak).to.be.instanceof(AttributeTemplateSentinel);
      expect(rak.expressions).to.be.eql(['rak']);

      expect(lur).to.be.instanceof(NodeTemplateSentinel);
      expect(lur.expression).to.be.eql('lur');
    });
  });
});

export { spec as templateDiagramSpec };
