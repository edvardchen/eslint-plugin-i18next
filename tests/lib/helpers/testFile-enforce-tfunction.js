const path = require('path');
const fs = require('fs');

module.exports = function testFile(file) {
  return {
    code: fs.readFileSync(
      path.join(__dirname, '../fixtures/enforce-tfunction-type', file),
      {
        encoding: 'utf8',
      }
    ),
  };
};
