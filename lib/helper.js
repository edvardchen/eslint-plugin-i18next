const { DOM_TAGS, SVG_TAGS } = require('./constants');

function isUpperCase(str) {
  return /^[A-Z_-]+$/.test(str);
}

function isNativeDOMTag(str) {
  return DOM_TAGS.includes(str);
}

function isSvgTag(str) {
  return SVG_TAGS.includes(str);
}

const blacklistAttrs = ['placeholder', 'alt', 'aria-label', 'value'];
function isAllowedDOMAttr(tag, attr) {
  if (isSvgTag(tag)) return true;
  if (isNativeDOMTag(tag)) {
    return !blacklistAttrs.includes(attr);
  }
  return false;
}

function generateFullMatchRegExp(source) {
  if (source instanceof RegExp) {
    return source;
  }
  if (typeof source !== 'string') {
    console.error('generateFullMatchRegExp: expect string but get', source);
    return new RegExp();
  }
  // allow dot ahead
  return new RegExp(`(^|\\.)${source}${source.endsWith('$') ? '' : '$'}`);
}

exports.isUpperCase = isUpperCase;
exports.isAllowedDOMAttr = isAllowedDOMAttr;
exports.generateFullMatchRegExp = generateFullMatchRegExp;
