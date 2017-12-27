import { Component } from 'react';
import PropTypes from 'prop-types';
import isPlainObject from 'lodash/isPlainObject';

import shallowEqual from './utils/shallowEqual';
import bindActionCreators from './utils/bindActionCreators';

class Connect extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = { slice: {} };
  }

  componentWillMount() {
    const { store } = this.context;
    const { selector } = this.props;
    if (selector) {
      // only subscribe to store if they're specified a selector
      this.unsubscribe = store.subscribe(this.selectState);
      this.selectState(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selector && !shallowEqual(nextProps, this.props)) {
      this.selectState(nextProps);
    }
  }

  componentWillUnmount() {
    const { selector } = this.props;
    this.unsubscribe && selector && this.unsubscribe();
  }

  selectState = ({ selector } = this.props) => {
    const { store } = this.context;
    const state = store.getState();
    const slice = selector(state);

    if (!shallowEqual(slice, this.state.slice)) {
      this.setState({ slice });
    }
  };

  render() {
    const { selector, actions } = this.props;
    const { store } = this.context;
    const { slice } = this.state;
    const args = [];

    if (selector) {
      // state should be first arg if subscribed
      args.push(slice);
    }

    if (actions) {
      const handlers = isPlainObject(actions)
        ? bindActionCreators(actions, store.dispatch)
        : actions(store.dispatch);

      // next we either pass bound actions or dispatch directly
      args.push(handlers);
    } else {
      args.push(store.dispatch.bind(store));
    }

    return this.props.children(...args);
  }
}

Connect.propTypes = {
  selector: PropTypes.func,
  actions: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  children: PropTypes.func.isRequired,
};

Connect.defaultProps = {
  selector: null,
  actions: null,
};

Connect.contextTypes = {
  store: PropTypes.object,
};

export default Connect;
