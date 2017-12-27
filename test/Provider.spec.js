/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { mount, shallow } from 'enzyme';
import expect from 'expect';
import Provider from '../src/Provider';
import './setup';

const store = {
  getState: () => ({ test: true }),
  dispatch: fn => fn(),
  subscribe: () => ({}),
};

/* eslint-disable react/prop-types, react/jsx-closing-tag-location */
const createChild = () => {
  class Child extends Component {
    render() {
      return <div />;
    }
  }
  Child.contextTypes = {
    store: PropTypes.object.isRequired,
  };
  return Child;
};

describe('Provider', () => {
  it('should enforce rendering a single child', () => {
    // ignore prop-type warnings
    const { propTypes } = Provider;
    Provider.propTypes = {};

    try {
      expect(() =>
        shallow(<Provider store={store}>
          <div />
        </Provider>)).not.toThrow();

      expect(() => shallow(<Provider store={store} />)).toThrow(/a single React element child/);

      expect(() =>
        shallow(<Provider store={store}>
          <div />
          <div />
        </Provider>)).toThrow(/a single React element child/);
    } finally {
      Provider.propTypes = propTypes;
    }
  });

  it('properly passes store via context', () => {
    const Child = createChild();
    const wrapper = mount(<Provider store={store}>
      <Child />
    </Provider>);
    const child = wrapper.find(Child);
    expect(child.instance().context.store).toEqual(store);
  });
});
