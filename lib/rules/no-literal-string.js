/**
 * @fileoverview disallow literal string
 * @author edvardchen
 */
'use strict';

const _ = require('lodash');
const {
  isUpperCase,
  getNearestAncestor,
  isAllowedDOMAttr,
  shouldSkip,
} = require('../helper');

function isValidFunctionCall(context, options, { callee }) {
  if (callee.type === 'Import') return true;

  const sourceText = context.getSourceCode().getText(callee);

  return shouldSkip(options.callees, sourceText);
}

function isValidLiteral(options, { value }) {
  if (typeof value !== 'string') {
    return true;
  }
  const trimed = value.trim();
  if (!trimed) return true;

  if (shouldSkip(options.words, trimed)) return true;
}

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
    fixable: 'code',
  },

  create(context) {
    // variables should be defined here
    const { parserServices } = context;
    const options = _.defaults(
      {},
      context.options[0],
      require('../options/defaults')
    );

    const {
      mode,
      'should-validate-template': validateTemplate,
      message,
    } = options;
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

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    function report(node) {
      context.report({
        node,
        message: `${message}: ${context.getSourceCode().getText(node.parent)}`,
        fix: function(fixer) {
          const sourceCode = context.getSourceCode();
          const ast = sourceCode.ast;

          function addImport(importName, importString) {
            const imports = ast.body.filter(
              node => node.type === 'ImportDeclaration'
            );
            const importNode = ast.body.filter(
              node =>
                node.type === 'ImportDeclaration' &&
                node.source.value === importName
            );
            if (importNode.length === 0) {
              if (imports.length > 0)
                return fixer.insertTextAfter(
                  imports[imports.length - 1],
                  `\n${importString};\n`
                );

              return fixer.insertTextBefore(
                ast.body[0],
                `\n${importString};\n`
              );
            }
            return;
          }

          const result = addImport(
            'react-i18next',
            `import { useTranslation } from 'react-i18next';`
          );
          if (result) {
            return result;
          }

          // Add useTranslation hook to the React component
          const useTranslation = `const { t } = useTranslation();\n`;

          // This is the React component's `export default` statement.
          const defaultExport = ast.body.find(
            node => node.type === 'ExportDefaultDeclaration'
          );
          const componentName = defaultExport.declaration.name;

          // Now find the react component function
          const body = ast.body.filter(
            n =>
              n.type === 'ExportNamedDeclaration' &&
              n.declaration?.id?.name === componentName
          );
          if (!body) {
            throw new Error('Could not find the React component body');
          }
          if (body.length !== 1) {
            throw new Error(
              'More than one React component body candidate found'
            );
          }

          const functionComponent = body[0].declaration;
          const functionComponentBody = functionComponent.body.body;

          // Find all VariableDeclarator nodes in the function component body
          const variableDeclarations = functionComponentBody.filter(
            n => n.type === 'VariableDeclaration'
          );

          // Now find one with symbol t
          const useTranslationNode = variableDeclarations.find(d =>
            d.declarations[0].id?.properties?.some(p => p.value.name === 't')
          );

          if (!useTranslationNode || useTranslationNode.length === 0) {
            return fixer.insertTextAfter(
              variableDeclarations[variableDeclarations.length - 1],
              `\n${useTranslation}\n`
            );
          }

          if (
            node.type === 'JSXText' ||
            (node.type === 'Literal' && node.parent.type === 'JSXAttribute')
          ) {
            const replacement = node.value
              .split('\n')
              .map(l => l.trim())
              .join(' ')
              .trim();
            console.log(
              `fixing L${node.loc.start.line} "${node.value}" to {t(\`${replacement}\`)}`
            );
            return fixer.replaceText(node, `{t(\`${replacement}\`)}`);
          }

          if (node.type === 'Literal') {
            const replacement = `t(${node.raw})`;
            console.log(
              `fixing L${node.loc.start.line} ${node.value} to "${replacement}"`
            );
            return fixer.replaceText(node, replacement);
          }

          if (node.type === 'TemplateLiteral') {
            const formatStr = node.quasis
              .map(
                (q, i) =>
                  `${q.value.raw}${
                    i < node.quasis.length - 1 ? `{arg${i}}` : ''
                  }`
              )
              .join('');
            const replacement = `t('${formatStr}', {${node.expressions
              .map((e, i) => `arg${i}: ${context.getSourceCode().getText(e)}`)
              .join(', ')}})`;
            console.log(
              `fixing L${
                node.loc.start.line
              } "${context.getSourceCode().getText(node)}" to "${replacement}"`
            );

            return fixer.replaceText(node, replacement);
          }
          throw new Error(`unexpected node type: ${node.type}`);
        },
      });
    }

    function validateBeforeReport(node) {
      if (isValidScope()) return;
      if (isValidLiteral(options, node)) return;

      report(node);
    }

    function filterOutJSX(node) {
      if (onlyValidateJSX) {
        const isInsideJSX = context
          .getAncestors()
          .some(item => ['JSXElement', 'JSXFragment'].includes(item.type));

        if (!isInsideJSX) return true;

        if (
          mode === 'jsx-text-only' &&
          !['JSXElement', 'JSXFragment'].includes(node.parent.type)
        ) {
          // Under mode jsx-text-only, if the direct parent isn't JSXElement or JSXFragment then skip
          return true;
        }
      }
      return false;
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

      NewExpression(node) {
        indicatorStack.push(isValidFunctionCall(context, options, node));
      },
      'NewExpression:exit': endIndicator,

      CallExpression(node) {
        indicatorStack.push(isValidFunctionCall(context, options, node));
      },
      'CallExpression:exit': endIndicator,

      'SwitchCase > Literal'(node) {
        indicatorStack.push(true);
      },
      'SwitchCase > Literal:exit': endIndicator,

      'AssignmentExpression[left.type="MemberExpression"]'(node) {
        // allow Enum['value']
        indicatorStack.push(
          shouldSkip(options['object-properties'], node.left.property.name)
        );
      },
      'AssignmentExpression[left.type="MemberExpression"]:exit'(node) {
        endIndicator();
      },
      'MemberExpression > Literal'(node) {
        // allow Enum['value']
        indicatorStack.push(true);
      },
      'MemberExpression > Literal:exit'(node) {
        endIndicator();
      },

      TemplateLiteral(node) {
        if (!validateTemplate) {
          return;
        }

        if (filterOutJSX(node)) {
          return;
        }

        if (isValidScope()) return;
        const { quasis = [] } = node;
        quasis.some(({ value: { raw } }) => {
          if (isValidLiteral(options, { value: raw })) return;
          report(node);
          return true; // break
        });
      },

      'Literal:exit'(node) {
        if (filterOutJSX(node)) {
          return;
        }

        // ignore `var a = { "foo": 123 }`
        if (node.parent.key === node) {
          return;
        }
        validateBeforeReport(node);
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
