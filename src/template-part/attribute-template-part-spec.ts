/// <reference path="../../node_modules/@types/chai/index.d.ts" />

import { Spec } from '../../node_modules/@0xcda7a/test-runner/lib/spec.js';
import '../../node_modules/chai/chai.js';

import { AttributeTemplatePart } from './attribute-template-part.js';

const expect = chai.expect;
const spec = new Spec();
const { describe, it } = spec;

describe('AttributeTemplatePart', () => {
  it('can be instantiated', () => {
    const instance = new AttributeTemplatePart();
    expect(instance).to.be.ok;
  });
});

export { spec as attributeTemplatePartSpec };
