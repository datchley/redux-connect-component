/* eslint-disable react/prefer-stateless-function */
import React from 'react';
// import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import expect from 'expect';
import sinon from 'sinon';
import Connect from '../src/Connect';
import Provider from '../src/Provider';
import './setup';

const listeners = [];
const store = {
  getState: () => ({
    test: true,
    a: 'a',
    b: 'b',
  }),
  dispatch: arg => arg,
  subscribe: (fn) => {
    listeners.push(fn);
  },
};

/* eslint-disable react/jsx-closing-tag-location */
describe('Connect', () => {
  it('should enforce children as a function', () => {
    // ignore prop-type warnings
    const { propTypes } = Connect;
    Connect.propTypes = {};

    try {
      // prettier-ignore
      expect(() =>
        mount(<Provider store={store}>
          <Connect>
            <div />
          </Connect>
        </Provider>)).toThrow();

      // prettier-ignore
      expect(() =>
        mount(<Provider store={store}>
          <Connect>{() => (<div />) }</Connect>
        </Provider>)).not.toThrow();
    } finally {
      Connect.propTypes = propTypes;
    }
  });

  it('should pass dispatch and not listen to store if no props', () => {
    const actionFn = x => x;
    const subscribe = sinon.spy(store, 'subscribe');
    const cWM = sinon.spy(Connect.prototype, 'componentWillMount');
    const wrapper = mount(<Provider store={store}>
      <Connect>
        {dispatch => (
          <div>
            <div className="dispatch">{dispatch(actionFn('test'))}</div>
          </div>
          )}
      </Connect>
    </Provider>);

    // ensure subscribe not called when mounting
    expect(cWM.callCount).toEqual(1);
    expect(subscribe.callCount).toEqual(0);
    subscribe.restore();
    cWM.restore();

    const dispatchChild = wrapper.find('div.dispatch');
    expect(dispatchChild.text()).toEqual('test');
  });

  it('should pass state, dispatch slice to children function', () => {
    const subscribe = sinon.spy(store, 'subscribe');
    const cWM = sinon.spy(Connect.prototype, 'componentWillMount');
    const selector = state => state.test;
    const actionFn = x => x;
    // prettier-ignore
    const wrapper = mount(<Provider store={store}>
      <Connect selector={selector}>
        {(state, dispatch) => (
          <div>
            <div className="state">{`${state}`}</div>
            <div className="dispatch">{dispatch(actionFn('test'))}</div>
          </div>
        )}
      </Connect>
    </Provider>);

    // ensure subscribe called when mounting
    expect(cWM.callCount).toEqual(1);
    expect(subscribe.callCount).toEqual(1);
    subscribe.restore();
    cWM.restore();

    const stateChild = wrapper.find('div.state');
    expect(stateChild.text()).toEqual('true');

    const dispatchChild = wrapper.find('div.dispatch');
    expect(dispatchChild.text()).toEqual('test');
  });

  it('should work with multiple selector mappings', () => {
    /* eslint-disable no-shadow, no-unused-vars */
    function selector(state) {
      return {
        test: state.test,
        a: state.a,
        b: state.b,
      };
    }
    const wrapper = mount(<Provider store={store}>
      <Connect selector={selector}>
        {state => <div>{`${state.test}${state.a}${state.b}`}</div>}
      </Connect>
    </Provider>);

    const child = wrapper.find('div');
    expect(child.text()).toEqual('trueab');
  });

  it('should pass state and actions with selector + actions props', () => {
    const selector = state => state.test;
    const actions = { action: x => x };
    // prettier-ignore
    const wrapper = mount(<Provider store={store}>
      <Connect selector={selector} actions={actions}>
        {(state, { action }) => (
          <div>
            <div className="state">{`${state}`}</div>
            <div className="action">{action('test')}</div>
          </div>
        )}
      </Connect>
    </Provider>);

    const stateChild = wrapper.find('div.state');
    expect(stateChild.text()).toEqual('true');
    const actionChild = wrapper.find('div.action');
    expect(actionChild.text()).toEqual('test');
  });
});
