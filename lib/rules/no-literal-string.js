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
          }
        },
        additionalProperties: false
      }
    ]
  },

  create: function(context) {
    // variables should be defined here

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------
    const {
      options: [option]
    } = context;
    const whitelists = ((option && option.ignore) || []).map(
      item => new RegExp(item)
    );

    function match(str) {
      return whitelists.some(item => item.test(str));
    }
    // any helper functions should go here or else delete this section

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
                if (isUpperCase(parent.id.name)) {
                  return;
                }
                break;
              }
              case 'Property': {
                // dont care whether if this is computed or not
                if (isUpperCase(parent.key.name)) {
                  return;
                }
                break;
              }
              case 'ImportDeclaration': // skip
                return;
              default:
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
