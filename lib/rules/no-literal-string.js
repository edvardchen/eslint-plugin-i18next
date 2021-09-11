/**
 * @fileoverview disallow literal string
 * @author edvardchen
 */
'use strict';

const {
  isUpperCase,
  generateFullMatchRegExp,
  isAllowedDOMAttr,
} = require('../helper');

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
    schema: [
      {
        type: 'object',
        properties: {
          ignore: {
            type: 'array',
            // string or regexp
          },
          ignoreAttribute: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          ignoreCallee: {
            type: 'array',
            // string or regexp
          },
          ignoreProperty: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          ignoreComponent: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          markupOnly: {
            type: 'boolean',
          },
          onlyAttribute: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          validateTemplate: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    // variables should be defined here
    const {
      parserServices,
      options: [
        {
          onlyAttribute = [],
          markupOnly: _markupOnly,
          validateTemplate,
          ignoreComponent = [],
          ignoreAttribute = [],
          ignoreProperty = [],
          ignoreCallee = [],
          ignore = [],
        } = {},
      ],
    } = context;
    const whitelists = [
      /^[0-9!-/:-@[-`{-~]+$/, // ignore not-word string
      ...ignore,
    ].map(item => new RegExp(item));

    const message = 'disallow literal string';
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    const indicatorStack = [];

    /**
     * detect if current "scope" is valid
     */
    function isValidScope() {
      return indicatorStack.some(item => item);
    }

    function match(str) {
      return whitelists.some(item => item.test(str));
    }

    const popularCallee = [
      /^i18n(ext)?$/,
      't',
      'require',
      'addEventListener',
      'removeEventListener',
      'postMessage',
      'getElementById',
      //
      // ─── VUEX CALLEE ────────────────────────────────────────────────────────────────
      //
      'dispatch',
      'commit',
      // ────────────────────────────────────────────────────────────────────────────────

      'includes',
      'indexOf',
      'endsWith',
      'startsWith',
    ];

    const validCalleeList = [...popularCallee, ...ignoreCallee].map(
      generateFullMatchRegExp
    );

    function isValidFunctionCall({ callee }) {
      let calleeName = callee.name;
      if (callee.type === 'Import') return true;

      const sourceText = context.getSourceCode().getText(callee);

      return validCalleeList.some(item => {
        return item.test(sourceText);
      });
    }

    const ignoredClassProperties = ['displayName'];

    const userJSXAttrs = [
      'className',
      'styleName',
      'style',
      'type',
      'key',
      'id',
      'width',
      'height',

      ...ignoreAttribute,
    ];
    function isValidAttrName(name) {
      if (onlyAttribute.length) {
        // only validate those attributes in onlyAttribute option
        return !onlyAttribute.includes(name);
      }
      return userJSXAttrs.includes(name);
    }

    // Ignore the Trans component for react-i18next compatibility
    const ignoredComponents = ['Trans', ...ignoreComponent];

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

    function isValidLiteral(str) {
      const trimed = str.trim();
      if (!trimed) return true;

      // allow statements like const a = "FOO"
      if (isUpperCase(trimed)) return true;

      if (match(trimed)) return true;
    }

    function validateLiteralNode(node) {
      // make sure node is string literal
      if (!isString(node)) return;
      if (isValidLiteral(node.value)) {
        return;
      }

      context.report({ node, message });
    }

    // onlyAttribute would turn on markOnly
    const markupOnly = _markupOnly || !!onlyAttribute.length;

    function endIndicator() {
      indicatorStack.pop();
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
          ignoredComponents.includes(node.openingElement.name.name)
        );
      },
      'JSXElement:exit': endIndicator,

      'JSXElement > Literal'(node) {
        scriptVisitor.JSXText(node);
      },

      'JSXFragment > Literal'(node) {
        scriptVisitor.JSXText(node);
      },

      JSXAttribute(node) {
        const attrName = node.name.name;

        // allow <MyComponent className="active" />
        if (isValidAttrName(attrName)) {
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

      'JSXAttribute > Literal:exit'(node) {
        if (markupOnly) {
          if (isValidScope()) return;
          validateLiteralNode(node);
        }
      },

      'JSXExpressionContainer > Literal:exit'(node) {
        scriptVisitor['JSXAttribute > Literal:exit'](node);
      },

      // @typescript-eslint/parser would parse string literal as JSXText node
      JSXText(node) {
        if (isValidScope()) return;

        const trimed = node.value.trim();
        if (!trimed || match(trimed)) {
          return;
        }

        context.report({ node, message });
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
          !!(node.key && ignoredClassProperties.includes(node.key.name))
        );
      },
      'ClassProperty:exit': endIndicator,

      VariableDeclarator(node) {
        // allow statements like const A_B = "test"
        indicatorStack.push(isUpperCase(node.id.name));
      },
      'VariableDeclarator:exit': endIndicator,

      Property(node) {
        const result =
          ignoreProperty.includes(node.key.name) ||
          // name if key is Identifier; value if key is Literal
          // dont care whether if this is computed or not
          isUpperCase(node.key.name || node.key.value);
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

      NewExpression(node) {
        indicatorStack.push(isValidFunctionCall(node));
      },
      'NewExpression:exit': endIndicator,

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
          const trimed = raw.trim();
          if (!trimed) return;
          if (match(trimed)) return;
          context.report({ node, message });
          return true; // break
        });
      },

      'Literal:exit'(node) {
        // ignore `var a = { "foo": 123 }`
        if (node.parent.key === node) {
          return;
        }
        if (markupOnly) {
          return;
        }
        if (node.parent && node.parent.type === 'JSXElement') return;
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
