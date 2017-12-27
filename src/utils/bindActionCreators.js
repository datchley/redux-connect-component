import warn from './warning';

/* eslint-disable consistent-return */
const bindActionCreators = (actions, dispatch) => {
  if (typeof actions === 'function') {
    return (...args) => dispatch(actions(...args));
  }

  if (typeof actions !== 'object' || actions === null) {
    warn(`bindActionCreators expected an object or a single function, and instead received ${
      actions === null ? 'null' : typeof actions
    }`);
  }

  /* eslint-disable no-param-reassign */
  return Object.keys(actions).reduce((bound, fkey) => {
    if (typeof actions[fkey] !== 'function') {
      warn(`bindActionCreators received prop ${fkey} that was not a function`);
    }
    bound[fkey] = (...args) => dispatch(actions[fkey](...args));
    return bound;
  }, {});
};

export default bindActionCreators;
