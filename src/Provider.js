import { Component, Children } from 'react';
import PropTypes from 'prop-types';

const storeShape = PropTypes.shape({
  subscribe: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  getState: PropTypes.func.isRequired,
});

class Provider extends Component {
  constructor(props, context) {
    super(props, context);
    this.store = props.store;
  }

  getChildContext() {
    return {
      store: this.store,
    };
  }

  render() {
    return Children.only(this.props.children);
  }
}

/* eslint-disable react/no-typos */
Provider.propTypes = {
  store: storeShape.isRequired,
  children: PropTypes.element.isRequired,
};

Provider.childContextTypes = {
  store: storeShape.isRequired,
};

export default Provider;
