const combineSelectors = mapping => state =>
  /* eslint-disable no-param-reassign */
  Object.keys(mapping).reduce((obj, selector) => {
    obj[selector] = mapping[selector](state);
    return obj;
  }, {});

export default combineSelectors;
