module.exports = function generateFullMatchRegExp(source) {
  if (source instanceof RegExp) {
    return source;
  }
  if (typeof source !== 'string') {
    console.error('generateFullMatchRegExp: expect string but get', source);
    return new RegExp();
  }
  // allow dot ahead
  return new RegExp(`(^|\\.)${source}${source.endsWith('$') ? '' : '$'}`);
};
