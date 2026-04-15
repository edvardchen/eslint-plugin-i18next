'use strict';

const assert = require('assert');
const rule = require('../../../../lib/rules/no-literal-string');

describe('no-literal-string: eslint 10 compatibility', () => {
  it('uses context.sourceCode when deprecated context members are unavailable', () => {
    const reports = [];
    const context = {
      options: [{ mode: 'all' }],
      sourceCode: {
        parserServices: {},
        getText(node) {
          return node.text || node.name || '';
        },
        getAncestors() {
          return [];
        },
      },
      report(descriptor) {
        reports.push(descriptor);
      },
    };

    const visitors = rule.create(context);

    assert.doesNotThrow(() => {
      visitors.CallExpression({
        callee: {
          type: 'Identifier',
          name: 'translate',
          text: 'translate',
        },
      });
      visitors['CallExpression:exit']();

      visitors.Literal({
        type: 'Literal',
        value: 'hello',
        parent: {
          type: 'ExpressionStatement',
          text: "'hello'",
        },
      });
    });

    assert.equal(reports.length, 1);
    assert.equal(reports[0].message, "disallow literal string: 'hello'");
  });
});
