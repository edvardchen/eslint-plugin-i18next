/**
 * @fileoverview disallow literal string
 * @author edvardchen
 */
'use strict';

const { isUpperCase } = require('../helper');
// const { TypeFlags, SyntaxKind } = require('typescript');

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
    const visited = new WeakSet();

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

    function isString(node) {
      return typeof node.value === 'string';
    }

    const { esTreeNodeToTSNodeMap, program } = parserServices;
    let typeChecker;
    if (program && esTreeNodeToTSNodeMap)
      typeChecker = program.getTypeChecker();

    const scriptVisitor = {
      //
      // ─── EXPORT AND IMPORT ───────────────────────────────────────────
      //

      'ImportDeclaration Literal'(node) {
        // allow (import abc form 'abc')
        visited.add(node);
      },

      'ExportAllDeclaration Literal'(node) {
        // allow export * from 'mod'
        visited.add(node);
      },

      'ExportNamedDeclaration > Literal'(node) {
        // allow export { named } from 'mod'
        visited.add(node);
      },
      // ─────────────────────────────────────────────────────────────────

      //
      // ─── JSX ─────────────────────────────────────────────────────────
      //

      'JSXElement > Literal'(node) {
        scriptVisitor.JSXText(node);
      },

      'JSXAttribute Literal'(node) {
        const parent = getNearestAncestor(node, 'JSXAttribute');

        // allow <div className="active" />
        if (isValidAttrName(parent.name.name)) {
          visited.add(node);
        }
      },

      // @typescript-eslint/parser would parse string literal as JSXText node
      JSXText(node) {
        const trimed = node.value.trim();
        visited.add(node);

        if (!trimed || match(trimed)) {
          return;
        }

        context.report({ node, message });
      },
      // ─────────────────────────────────────────────────────────────────

      //
      // ─── TYPESCRIPT ──────────────────────────────────────────────────
      //

      'TSLiteralType Literal'(node) {
        // allow var a: Type['member'];
        visited.add(node);
      },
      // ─────────────────────────────────────────────────────────────────

      'VariableDeclarator > Literal'(node) {
        // allow statements like const A_B = "test"
        if (isUpperCase(node.parent.id.name)) visited.add(node);
      },

      'Property > Literal'(node) {
        const { parent } = node;
        // if node is key of property, skip
        if (parent.key === node) visited.add(node);

        // name if key is Identifier; value if key is Literal
        // dont care whether if this is computed or not
        if (isUpperCase(parent.key.name || parent.key.value)) visited.add(node);
      },

      'BinaryExpression > Literal'(node) {
        const {
          parent: { operator }
        } = node;

        // allow name === 'Android'
        if (operator !== '+') {
          visited.add(node);
        }
      },

      'CallExpression Literal'(node) {
        const parent = getNearestAncestor(node, 'CallExpression');
        if (isValidFunctionCall(parent)) visited.add(node);
      },

      'Literal:exit'(node) {
        // visited and passed linting
        if (visited.has(node)) return;
        const trimed = node.value.trim();
        if (!trimed) return;

        const { parent } = node;

        // allow statements like const a = "FOO"
        if (isUpperCase(trimed)) return;

        if (match(trimed)) return;

        //
        // TYPESCRIPT
        //

        if (typeChecker) {
          const tsNode = esTreeNodeToTSNodeMap.get(node);
          const typeObj = typeChecker.getTypeAtLocation(tsNode.parent);

          // var a: 'abc' = 'abc'
          if (typeObj.isStringLiteral()) {
            return;
          }

          // var a: 'abc' | 'name' = 'abc'
          if (typeObj.isUnion()) {
            const found = typeObj.types.some(item => {
              if (item.isStringLiteral() && item.value === node.value) {
                return true;
              }
            });
            if (found) return;
          }
        }
        // • • • • •

        context.report({ node, message });
      }
    };

    function wrapVisitor() {
      Object.keys(scriptVisitor).forEach(key => {
        const old = scriptVisitor[key];
        scriptVisitor[key] = node => {
          // make sure node is string literal
          if (!isString(node)) return;

          old(node);
        };
      });
    }

    wrapVisitor();

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

const popularCallee = [
  //
  // ─── VUEX CALLEE ────────────────────────────────────────────────────────────────
  //
  'dispatch',
  'commit',
  // ────────────────────────────────────────────────────────────────────────────────

  'includes',
  'indexOf'
];
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
