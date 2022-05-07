const matchPatterns = require('./matchPatterns');

module.exports = function shouldSkip({ exclude = [], include = [] }, text) {
  let skipped = 0;
  if (exclude.length) {
    if (matchPatterns(exclude, text)) {
      skipped++;
    }
  }
  if (include.length) {
    if (matchPatterns(include, text)) {
      skipped--;
    }
  }
  return skipped > 0;
};
