import chai from 'chai';
import shallowEqual from '../../src/utils/shallowEqual';

const { assert } = chai;

describe('Utils', () => {
  describe('shallowEqual', () => {
    it('should return true if arguments fields are equal', () => {
      assert.equal(shallowEqual({ a: 1, b: 2, c: undefined }, { a: 1, b: 2, c: undefined }), true);

      assert.equal(shallowEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3 }), true);

      const o = {};
      assert.equal(shallowEqual({ a: 1, b: 2, c: o }, { a: 1, b: 2, c: o }), true);

      const d = () => 1;

      assert.equal(
        shallowEqual(
          {
            a: 1,
            b: 2,
            c: o,
            d,
          },
          {
            a: 1,
            b: 2,
            c: o,
            d,
          },
        ),
        true,
      );
    });

    it('should return false if arguments fields are different function identities', () => {
      assert.equal(
        shallowEqual(
          {
            a: 1,
            b: 2,
            d() {
              return 1;
            },
          },
          {
            a: 1,
            b: 2,
            d() {
              return 1;
            },
          },
        ),
        false,
      );
    });

    it('should return false if first argument has too many keys', () => {
      assert.equal(shallowEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2 }), false);
    });

    it('should return false if second argument has too many keys', () => {
      assert.equal(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2, c: 3 }), false);
    });

    it('should return false if arguments have different keys', () => {
      assert.equal(
        shallowEqual({ a: 1, b: 2, c: undefined }, { a: 1, bb: 2, c: undefined }),
        false,
      );
    });
  });
});
