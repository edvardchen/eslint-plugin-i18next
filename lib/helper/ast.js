exports.getNearestAncestor = function getNearestAncestor(node, type) {
  let temp = node.parent;
  while (temp) {
    if (temp.type === type) {
      return temp;
    }
    temp = temp.parent;
  }
  return temp;
};

exports.isString = function isString(node) {
  return typeof node.value === 'string';
};
