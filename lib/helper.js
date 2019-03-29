function isUpperCase(str) {
  return /^[A-Z_-]+$/.test(str);
}

exports.isUpperCase = isUpperCase;
