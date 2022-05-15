const path = require('path');
const fs = require('fs');

module.exports = function testFile(file) {
  return {
    code: fs.readFileSync(path.join(__dirname, '../fixtures', file), {
      encoding: 'utf8',
    }),
    options: [{ mode: 'all' }],
  };
};
