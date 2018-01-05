/// <reference path="../node_modules/@types/chai/index.d.ts" />

import { Spec } from '../node_modules/@0xcda7a/test-runner/lib/spec.js';
import '../node_modules/chai/chai.js';

import { parse } from './template-string-parser.js';

const expect = chai.expect;
const spec = new Spec();
const { describe, it } = spec;

describe('parse', () => {
  describe('invoked on an empty string', () => {
    it('yields one string and no expressions', () => {
      const [strings, expressions] = parse('');
      expect(strings).to.be.eql(['']);
      expect(expressions).to.be.eql([]);
    });
  });

  describe('invoked on a non-empty string', () => {
    describe('without expressions', () => {
      it('yields one string and no expressions', () => {
        const inputString = 'foo';
        const [strings, expressions] = parse(inputString);
        expect(strings).to.be.eql([inputString]);
        expect(expressions).to.be.eql([]);
      });
    });

    describe('expression', () => {
      it('yields two empty strings and an expression', () => {
        const inputString = '{{foo}}';
        const [strings, expressions] = parse(inputString);
        expect(strings).to.be.eql(['', '']);
        expect(expressions).to.be.eql(['foo']);
      });
    });

    describe('containing expression parts', () => {
      it('yields a list of strings and expressions', () => {
        const inputString = 'foo{{bar}}baz';
        const [strings, expressions] = parse(inputString);
        expect(strings).to.be.eql(['foo', 'baz']);
        expect(expressions).to.be.eql(['bar']);
      });
    });
  });
});

export { spec as templateStringParserSpec };
