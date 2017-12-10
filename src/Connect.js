import { Component } from 'react';
import PropTypes from 'prop-types';
import shallowEqual from './utils/shallowEqual';
import combineSelectors from './utils/combineSelectors';
import bindActionCreators from './utils/bindActionCreators';

class Connect extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = { slice: {} };
  }

  componentWillMount() {
    const { store } = this.context;
    const { selector } = this.props;
    this.unbsubscribe = store.subscribe(this.selectState);

    if (selector) {
      this.selectState(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!shallowEqual(nextProps, this.props)) {
      this.selectState(nextProps);
    }
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  selectState = ({ selector } = this.props) => {
    const { store } = this.context;
    const state = store.getState();
    const select = typeof selector === 'function' ? selector : combineSelectors(selector);
    const slice = select(state);

    if (!shallowEqual(slice, this.state.slice)) {
      this.setState({ slice });
    }
  };

  render() {
    const { actions } = this.props;
    const { store } = this.context;
    const { slice } = this.state;

    const handlers = actions ? bindActionCreators(actions, store.dispatch) : null;

    return this.props.children({
      state: slice,
      dispatch: store.dispatch,
      ...(handlers || {}),
    });
  }
}

Connect.propTypes = {
  selector: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  actions: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  children: PropTypes.func.isRequired,
};

Connect.defaultProps = {
  actions: null,
};

Connect.contextTypes = {
  store: PropTypes.object,
};

export default Connect;
