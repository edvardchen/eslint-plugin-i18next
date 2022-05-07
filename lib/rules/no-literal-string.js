/**
 * @fileoverview disallow literal string
 * @author edvardchen
 */
'use strict';

const _ = require('lodash');
const { isUpperCase, isAllowedDOMAttr, shouldSkip } = require('../helper');
const { isString, getNearestAncestor } = require('../helper/ast');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'disallow literal string',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [require('../options/schema.json')],
  },

  create(context) {
    // variables should be defined here
    const { parserServices } = context;
    const options = _.defaults(
      {},
      context.options[0],
      require('../options/defaults.json')
    );

    const { mode, validateTemplate, message } = options;
    const onlyValidateJSX = ['jsx-only', 'jsx-text-only'].includes(mode);

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    const indicatorStack = [];

    function endIndicator() {
      indicatorStack.pop();
    }

    /**
     * detect if current "scope" is valid
     */
    function isValidScope() {
      return indicatorStack.some(item => item);
    }

    function isValidFunctionCall({ callee }) {
      if (callee.type === 'Import') return true;

      const sourceText = context.getSourceCode().getText(callee);

      return shouldSkip(options.callees, sourceText);
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    const { esTreeNodeToTSNodeMap, program } = parserServices;
    let typeChecker;
    if (program && esTreeNodeToTSNodeMap)
      typeChecker = program.getTypeChecker();

    function isValidLiteral(str) {
      const trimed = str.trim();
      if (!trimed) return true;

      if (shouldSkip(options.words, str)) return true;
    }

    function report(node) {
      context.report({
        node,
        message: `${message}: ${context.getSourceCode().getText(node.parent)}`,
      });
    }

    function validateLiteralNode(node) {
      // make sure node is string literal
      if (!isString(node)) return;
      if (isValidLiteral(node.value)) {
        return;
      }

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

      report(node);
    }

    function validateBeforeReport(node, getValue = node => node.value) {
      if (isValidScope()) return;

      const str = getValue(node);
      const trimed = str.trim();
      if (!trimed) return true;

      if (shouldSkip(options.words, str)) return true;
      report(node);
    }

    const scriptVisitor = {
      //
      // ─── EXPORT AND IMPORT ───────────────────────────────────────────
      //

      ImportExpression(node) {
        // allow (import('abc'))
        indicatorStack.push(true);
      },
      'ImportExpression:exit': endIndicator,

      ImportDeclaration(node) {
        // allow (import abc form 'abc')
        indicatorStack.push(true);
      },
      'ImportDeclaration:exit': endIndicator,

      ExportAllDeclaration(node) {
        // allow export * from 'mod'
        indicatorStack.push(true);
      },
      'ExportAllDeclaration:exit': endIndicator,

      'ExportNamedDeclaration[source]'(node) {
        // allow export { named } from 'mod'
        indicatorStack.push(true);
      },
      'ExportNamedDeclaration[source]:exit': endIndicator,
      // ─────────────────────────────────────────────────────────────────

      //
      // ─── JSX ─────────────────────────────────────────────────────────
      //

      JSXElement(node) {
        indicatorStack.push(
          shouldSkip(options['jsx-components'], node.openingElement.name.name)
        );
      },
      'JSXElement:exit': endIndicator,

      'JSXElement Literal'(node) {
        if (mode === 'jsx-only') {
          validateBeforeReport(node);
        }
      },

      'JSXElement > Literal'(node) {
        if (mode === 'jsx-text-only') {
          validateBeforeReport(node);
        }
      },

      'JSXFragment > Literal'(node) {
        if (onlyValidateJSX) {
          validateBeforeReport(node);
        }
      },

      JSXAttribute(node) {
        const attrName = node.name.name;

        // allow <MyComponent className="active" />
        if (shouldSkip(options['jsx-attributes'], attrName)) {
          indicatorStack.push(true);
          return;
        }

        const jsxElement = getNearestAncestor(node, 'JSXOpeningElement');
        const tagName = jsxElement.name.name;
        if (isAllowedDOMAttr(tagName, attrName)) {
          indicatorStack.push(true);
          return;
        }
        indicatorStack.push(false);
      },
      'JSXAttribute:exit': endIndicator,

      // @typescript-eslint/parser would parse string literal as JSXText node
      JSXText(node) {
        validateBeforeReport(node);
      },
      // ─────────────────────────────────────────────────────────────────

      //
      // ─── TYPESCRIPT ──────────────────────────────────────────────────
      //

      TSModuleDeclaration() {
        indicatorStack.push(true);
      },
      'TSModuleDeclaration:exit': endIndicator,

      TSLiteralType(node) {
        // allow var a: Type['member'];
        indicatorStack.push(true);
      },
      'TSLiteralType:exit': endIndicator,
      TSEnumMember(node) {
        // allow enum E { "a b" = 1 }
        indicatorStack.push(true);
      },
      'TSEnumMember:exit': endIndicator,
      // ─────────────────────────────────────────────────────────────────

      ClassProperty(node) {
        indicatorStack.push(
          !!(node.key && shouldSkip(options['class-properties'], node.key.name))
        );
      },
      'ClassProperty:exit': endIndicator,

      VariableDeclarator(node) {
        // allow statements like const A_B = "test"
        indicatorStack.push(isUpperCase(node.id.name));
      },
      'VariableDeclarator:exit': endIndicator,

      Property(node) {
        // pick up key.name if key is Identifier or key.value if key is Literal
        // dont care whether if this is computed or not
        const result = shouldSkip(
          options['object-properties'],
          node.key.name || node.key.value
        );
        indicatorStack.push(result);
      },
      'Property:exit': endIndicator,

      BinaryExpression(node) {
        const { operator } = node;
        // allow name === 'Android'
        indicatorStack.push(operator !== '+');
      },
      'BinaryExpression:exit': endIndicator,

      AssignmentPattern(node) {
        // allow function bar(input = 'foo') {}
        indicatorStack.push(true);
      },
      'AssignmentPattern:exit': endIndicator,

      CallExpression(node) {
        indicatorStack.push(isValidFunctionCall(node));
      },
      'CallExpression:exit': endIndicator,

      'SwitchCase > Literal'(node) {
        indicatorStack.push(true);
      },
      'SwitchCase > Literal:exit': endIndicator,

      MemberExpression(node) {
        // allow Enum['value']
        indicatorStack.push(true);
      },
      'MemberExpression:exit': endIndicator,

      TemplateLiteral(node) {
        if (!validateTemplate) {
          return;
        }
        if (isValidScope()) return;
        const { quasis = [] } = node;
        quasis.some(({ value: { raw } }) => {
          if (isValidLiteral(raw)) return;
          context.report({ node, message });
          return true; // break
        });
      },

      'Literal:exit'(node) {
        // skip if it only validates jsx
        // checking if a literal is contained in a JSX element is hard to be performant
        // instead, we validate in jsx-related visitors
        if (onlyValidateJSX) return;

        // ignore `var a = { "foo": 123 }`
        if (node.parent.key === node) {
          return;
        }
        if (isValidScope()) return;
        validateLiteralNode(node);
      },
    };

    return (
      (parserServices.defineTemplateBodyVisitor &&
        parserServices.defineTemplateBodyVisitor(
          {
            VText(node) {
              scriptVisitor['JSXText'](node);
            },
            'VExpressionContainer CallExpression'(node) {
              scriptVisitor['CallExpression'](node);
            },
            'VExpressionContainer CallExpression:exit'(node) {
              scriptVisitor['CallExpression:exit'](node);
            },
            'VExpressionContainer Literal:exit'(node) {
              scriptVisitor['Literal:exit'](node);
            },
          },
          scriptVisitor
        )) ||
      scriptVisitor
    );
  },
};
