import { Spec } from '../../@0xcda7a/test-runner/lib/spec.js';
import { Fixturable } from
    '../../@0xcda7a/test-runner/lib/mixins/fixturable.js';
import '../../chai/chai.js';
import { parse } from './template-string-parser.js';

const spec = new (Fixturable(Spec))();
const { describe, it } = spec;
const { expect } = chai;

describe('Template string parsing', () => {
  describe('an empty string', () => {
    it('returns a single string and zero expressions', () => {
      expect(parse('')).to.be.eql([[''], []]);
    });
  });

  describe('a string that is just a part', () => {
    it('returns two empty strings and one expression', () => {
      expect(parse('{{foo}}')).to.be.eql([['', ''], ['foo']]);
    });
  });

  describe('a non-empty string with one part', () => {
    it('returns prefix and suffix strings and one expression', () => {
      expect(parse('prefix {{foo}}suffix'))
          .to.be.eql([['prefix ', 'suffix'], ['foo']]);
    });
  });

  describe('a string with many parts', () => {
    it('returns static strings and expressions in order', () => {
      expect(parse('prefix {{foo}} middle {{bar}} suffix {{baz}}'))
          .to.be.eql([['prefix ', ' middle ', ' suffix ', ''],
              ['foo', 'bar', 'baz']]);
    });
  });
});

export const templateStringParserSpec: Spec = spec;
