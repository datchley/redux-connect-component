import warn from './warning';

/* eslint-disable consistent-return */
const bindActionCreators = (actions, dispatch) => {
  if (typeof actions === 'function') {
    if (!actions.name) {
      warn('bindActionCreators takes a single function or object, not an anonymous function expression');
    }
    return {
      [actions.name]: (...args) => dispatch(actions(...args)),
    };
  }
  /* eslint-disable no-param-reassign */
  return Object.keys(actions).reduce((bound, fkey) => {
    bound[fkey] = (...args) => dispatch(actions[fkey](...args));
    return bound;
  }, {});
};

export default bindActionCreators;
