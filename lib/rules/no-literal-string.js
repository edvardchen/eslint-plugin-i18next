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
      if (callee.type === 'Import') return true;

      if (callee.type === 'MemberExpression') {
        if (calleeWhitelists.simple.indexOf(callee.property.name) !== -1)
          return true;

        calleeName = `${callee.object.name}.${callee.property.name}`;
        return calleeWhitelists.complex.indexOf(calleeName) !== -1;
      }

      if (calleeName === 'require') return true;
      return calleeWhitelists.simple.indexOf(calleeName) !== -1;
    }

    const atts = ['className', 'style', 'styleName', 'src', 'type', 'id'];
    function isValidAttrName(name) {
      return atts.includes(name);
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    const visited = [];

    function getNearestAncestor(node, type) {
      let temp = node.parent;
      while (temp) {
        if (temp.type === type) {
          return temp;
        }
        temp = temp.parent;
      }
      return temp;
    }

    const scriptVisitor = {
      'JSXAttribute Literal'(node) {
        const parent = getNearestAncestor(node, 'JSXAttribute');

        // allow <div className="active" />
        if (isValidAttrName(parent.name.name)) {
          visited.push(node);
        }
      },

      'ImportDeclaration Literal'(node) {
        // allow (import abc form 'abc')
        visited.push(node);
      },

      'VariableDeclarator > Literal'(node) {
        // allow statements like const A_B = "test"
        if (isUpperCase(node.parent.id.name)) visited.push(node);
      },

      'Property > Literal'(node) {
        if (visited.includes(node)) return;
        const { parent } = node;
        // if node is key of property, skip
        if (parent.key === node) visited.push(node);

        // name if key is Identifier; value if key is Literal
        // dont care whether if this is computed or not
        if (isUpperCase(parent.key.name || parent.key.value))
          visited.push(node);
      },

      'CallExpression Literal'(node) {
        if (visited.includes(node)) return;
        const parent = getNearestAncestor(node, 'CallExpression');
        if (isValidFunctionCall(parent)) visited.push(node);
      },

      'JSXElement > Literal'(node) {
        scriptVisitor.JSXText(node);
      },

      // @typescript-eslint/parser would parse string literal as JSXText node
      JSXText(node) {
        const trimed = node.value.trim();
        visited.push(node);

        if (!trimed || match(trimed)) {
          return;
        }

        context.report({ node, message });
      },

      'Literal:exit'(node) {
        if (visited.includes(node)) return;

        if (typeof node.value === 'string') {
          const trimed = node.value.trim();
          if (!trimed) return;

          const { parent } = node;

          // allow statements like const a = "FOO"
          if (isUpperCase(trimed)) return;

          if (match(trimed)) return;
          context.report({ node, message });
        }
      }
    };
    return (
      (parserServices.defineTemplateBodyVisitor &&
        parserServices.defineTemplateBodyVisitor(
          {
            VText(node) {
              scriptVisitor['JSXText'](node);
            },
            'VExpressionContainer CallExpression Literal'(node) {
              scriptVisitor['CallExpression Literal'](node);
            },
            'VExpressionContainer Literal:exit'(node) {
              scriptVisitor['Literal:exit'](node);
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
