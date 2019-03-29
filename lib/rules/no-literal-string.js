/**
 * @fileoverview disallow literal string
 * @author edvardchen
 */
'use strict';

const { isUpperCase } = require('../helper');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'disallow literal string',
      category: 'Best Practices',
      recommended: true
    },
    fixable: 'code', // or "code" or "whitespace"
    schema: [
      {
        type: 'object',
        properties: {
          ignore: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          ignoreCallee: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        },
        additionalProperties: false
      }
    ]
  },

  create: function(context) {
    // variables should be defined here
    const {
      options: [option]
    } = context;
    const whitelists = ((option && option.ignore) || []).map(
      item => new RegExp(item)
    );

    const whitelistCallees = (option && option.ignoreCallee) || [];

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------
    function match(str) {
      return whitelists.some(item => item.test(str));
    }

    function isValidFunctionCall({ callee }) {
      let calleeName = callee.name;

      if (callee.type === 'MemberExpression') {
        calleeName = `${callee.object.name}.${callee.property.name}`;
      }

      if (calleeName === 'require') return true;
      if (whitelistCallees.indexOf(calleeName) !== -1) return true;
      return false;
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          const trimed = node.value.trim();
          if (!trimed) return;
          if (isUpperCase(trimed)) return;

          const { parent } = node;
          if (parent) {
            switch (parent.type) {
              case 'VariableDeclarator': {
                if (isUpperCase(parent.id.name)) return;
                break;
              }
              case 'Property': {
                // dont care whether if this is computed or not
                if (isUpperCase(parent.key.name)) return;
                break;
              }
              case 'ImportDeclaration': // skip
                return;
              default:
                const LOOK_UP_LIMIT = 3;
                const ancestors = context.getAncestors(node);
                for (
                  let i = ancestors.length - 1;
                  i > ancestors.length - 1 - LOOK_UP_LIMIT;
                  i--
                ) {
                  const temp = ancestors[i];
                  if (temp.type === 'CallExpression') {
                    if (isValidFunctionCall(temp)) return;
                    break;
                  }
                }
                break;
            }
          }

          if (match(trimed)) return;
          context.report({ node, message: 'disallow literal string' });
        }
      }
    };
  }
};
