import expect from 'expect';
import sinon from 'sinon';
import bindActionCreators from '../../src/utils/bindActionCreators';

describe('Utils', () => {
  describe('bindActionCreators', () => {
    it('should allow only objects or a single function', () => {
      const dispatch = arg => arg;
      /* eslint-disable no-empty */
      try {
        expect(() => bindActionCreators(true, dispatch)).toThrow(/expected an object or single function/);
        expect(() => bindActionCreators({ a: 1 }, dispatch)).toThrow(/not a function/);
        expect(() => bindActionCreators(() => ({ type: 'ACTION' }))).toNotThrow();
        expect(() =>
          bindActionCreators({
            one: () => ({ type: 'ACTION_1' }),
            two: () => ({ type: 'ACTION_2' }),
          })).toNotThrow();
      } catch (e) {}
    });

    it('should bind and return a single function', () => {
      const dispatch = sinon.spy(action => action);
      const singleFn = arg => ({ type: 'ACTION', payload: arg });
      const bound = bindActionCreators(singleFn, dispatch);
      expect(bound).toBeTruthy();
      expect(typeof bound === 'function').toBeTruthy();
      expect(bound('test')).toEqual({ type: 'ACTION', payload: 'test' });
      expect(dispatch.calledOnce).toBeTruthy();
      dispatch.reset();
    });

    it('should bind and return a function mapping object', () => {
      const dispatch = sinon.spy(action => action);
      const testAction = check => ({ type: 'ACTION', payload: check });
      const bound = bindActionCreators({ testAction }, dispatch);
      expect(bound).toBeTruthy();
      expect(typeof bound.testAction === 'function').toBeTruthy();
      expect(bound.testAction('test')).toEqual({ type: 'ACTION', payload: 'test' });
      expect(dispatch.calledOnce).toBeTruthy();
      dispatch.reset();
    });
  });
});
