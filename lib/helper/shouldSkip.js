const matchPatterns = require('./matchPatterns');

module.exports = function shouldSkip({ exclude = [], include = [] }, text) {
  if (!include.length && !exclude.length) return false;

  const isIncluded = include.length ? matchPatterns(include, text) : true; // include by default
  const isExcluded = exclude.length ? matchPatterns(exclude, text) : false; // don't exclude by default

  if (isIncluded && !isExcluded) return false;

  return true;
};
