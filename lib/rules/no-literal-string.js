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
      parserServices,
      options: [option]
    } = context;
    const whitelists = ((option && option.ignore) || []).map(
      item => new RegExp(item)
    );

    const calleeWhitelists = generateCalleeWhitelists(option);
    const message = 'disallow literal string';
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------
    function match(str) {
      return whitelists.some(item => item.test(str));
    }

    function isValidFunctionCall({ callee }) {
      let calleeName = callee.name;

      if (callee.type === 'MemberExpression') {
        if (calleeWhitelists.simple.indexOf(callee.property.name) !== -1)
          return true;

        calleeName = `${callee.object.name}.${callee.property.name}`;
        return calleeWhitelists.complex.indexOf(calleeName) !== -1;
      }

      if (calleeName === 'require') return true;
      return calleeWhitelists.simple.indexOf(calleeName) !== -1;
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    const scriptVisitor = {
      Literal(node) {
        if (typeof node.value === 'string') {
          const trimed = node.value.trim();
          if (!trimed) return;

          const { parent } = node;

          if (isUpperCase(trimed) && parent.type !== 'JSXElement') return;

          if (parent) {
            switch (parent.type) {
              case 'VariableDeclarator': {
                if (isUpperCase(parent.id.name)) return;
                break;
              }
              case 'Property': {
                // if node is key of property, skip
                if (parent.key === node) return;
                // name if key is Identifier; value if key is Literal
                // dont care whether if this is computed or not
                if (isUpperCase(parent.key.name || parent.key.value)) return;
                break;
              }
              case 'ImportDeclaration': // skip
                return;
              default:
                let LOOK_UP_LIMIT = 3;
                let temp = parent;
                while (temp && LOOK_UP_LIMIT > 0) {
                  LOOK_UP_LIMIT--;
                  if (temp.type === 'CallExpression') {
                    if (isValidFunctionCall(temp)) return;
                    break;
                  }
                  temp = temp.parent;
                }
                break;
            }
          }

          if (match(trimed)) return;
          context.report({
            node,
            message,
            fix(fixer) {
              return fixer.replaceText(node, `i18next.t('${node.value}')`);
            }
          });
        }
      }
    };
    return (
      (parserServices.defineTemplateBodyVisitor &&
        parserServices.defineTemplateBodyVisitor(
          {
            VText(node) {
              const trimed = node.value.trim();
              if (!trimed) return;
              if (match(trimed)) return;
              context.report({
                node,
                message,
                fix(fixer) {
                  return fixer.replaceText(
                    node,
                    node.value.replace(
                      /^(\s*)(.+?)(\s*)$/, // keep spaces
                      "$1{{i18next.t('$2')}}$3"
                    )
                  );
                }
              });
            },
            'VExpressionContainer Literal'(node) {
              scriptVisitor.Literal(node);
            }
          },
          scriptVisitor
        )) ||
      scriptVisitor
    );
  }
};

const popularCallee = ['dispatch', 'commit']; // vuex callee
function generateCalleeWhitelists(option) {
  const ignoreCallee = (option && option.ignoreCallee) || [];
  const result = {
    simple: ['i18n', 'i18next', ...popularCallee],
    complex: ['i18n.t', 'i18next.t']
  };
  ignoreCallee.forEach(item => {
    if (item.indexOf('.') !== -1) {
      result.complex.push(item);
    } else {
      result.simple.push(item);
    }
  });
  return result;
}
