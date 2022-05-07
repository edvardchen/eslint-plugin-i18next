const matchPatterns = require('./matchPatterns');

module.exports = function shouldSkip({ exclude = [], include = [] }, text) {
  if (include.length || exclude.length) {
    if (
      (!exclude.length || matchPatterns(exclude, text)) &&
      !matchPatterns(include, text)
    ) {
      return true;
    }
  }
  return false;
};
