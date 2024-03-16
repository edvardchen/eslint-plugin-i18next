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
let counter = 0;
const _dict = {};
const fs = require('fs');

function updateDict(str, loc) {
  const header = `${loc.fileName
    .split('/')
    .slice(8)
    .join('/')}:${loc.start.line}: `;
  console.log(`${header.padEnd(80, ' ')} "${str}"`);
  // if (!str.includes('arg')) return;
  // if (_dict[str]) {
  //   _dict[str].push(loc);
  // } else {
  //   _dict[str] = [loc];
  // }
  _dict[str] = '';
}

process.on('exit', () => {
  console.log(`${Object.keys(_dict).length} unique strings found`);
  fs.writeFileSync('i18n-dict.json', JSON.stringify(_dict), {
    encoding: 'utf-8',
  });
});

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
    counter++;
    const fileName = context.getFilename();
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

    let fixes = 0;
    function report(node) {
      context.report({
        node,
        message: `${message}: ${context
          .getSourceCode()
          .getText(node.parent)
          .replace(/\n/g, '')
          .substring(0, 50)}`,
        fix: function(fixer) {
          const sourceCode = context.getSourceCode();
          const ast = sourceCode.ast;

          const defaultExport = ast.body.find(
            node => node.type === 'ExportDefaultDeclaration'
          );
          if (!defaultExport) {
            console.warn('ERROR: Could not find the default export', fileName);
            return;
          }

          let componentName = defaultExport.declaration.name;

          if (!componentName) {
            // Couldn't find default export name, see if it's a `export default React.memo`
            if (
              defaultExport.declaration.type === 'CallExpression' &&
              defaultExport.declaration.callee.property.name === 'memo'
            ) {
              componentName = defaultExport.declaration.arguments[0].name;
            }
          }

          if (!componentName) {
            console.warn(
              'ERROR: Could not find the React component name',
              fileName
            );
            return;
          }

          // Now find the react component function
          const exportedNamedDeclarations = ast.body.filter(
            n =>
              n.type === 'ExportNamedDeclaration' &&
              n.declaration?.id?.name === componentName
          );

          const functionDeclarations = ast.body.filter(
            n => n.type === 'FunctionDeclaration' && n.id.name === componentName
          );

          const forwardRefs = ast.body.filter(
            n =>
              (n.declarations?.[0]?.init?.callee?.property?.name ===
                'forwardRef' &&
                n.declarations[0]?.init?.arguments[0]?.id?.name ===
                  componentName) ||
              (n?.declaration?.declarations?.[0]?.init?.callee?.property
                ?.name === 'forwardRef' &&
                n?.declaration?.declarations[0]?.init?.arguments[0]?.id
                  ?.name === componentName)
          );

          let functionComponentBody;
          if (exportedNamedDeclarations.length === 1) {
            const functionComponent = exportedNamedDeclarations[0].declaration;
            functionComponentBody = functionComponent.body.body;
          } else if (functionDeclarations.length === 1) {
            functionComponentBody = functionDeclarations[0].body.body;
          } else if (forwardRefs.length === 1) {
            functionComponentBody =
              forwardRefs[0]?.declarations?.[0]?.init?.arguments?.[0]?.body
                ?.body ??
              forwardRefs[0]?.declaration?.declarations?.[0]?.init
                ?.arguments?.[0]?.body?.body;
          } else {
            console.warn(
              'ERROR: Could not find the React component body for:',
              fileName
            );
            return;
          }

          if (!functionComponentBody) {
            console.warn(
              'ERROR: Could not find the React component body for:',
              fileName
            );
            return;
          }

          function addImport(importName) {
            const importString = `import { useTranslation } from '${importName}';`;
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
            } else {
              // Check if the import has the useTranslation hook
              const useTranslation = importNode[0].specifiers.find(
                s => s.imported.name === 'useTranslation'
              );
              if (!useTranslation) {
                return fixer.insertTextAfter(
                  importNode[0].specifiers[importNode[0].specifiers.length - 1],
                  `, useTranslation`
                );
              }
            }
            return;
          }

          const result = addImport(options['importName'] || 'react-i18next');
          if (result) {
            return result;
          }

          // Add useTranslation hook to the React component
          const useTranslation = `const { t } = useTranslation();\n`;

          // This is the React component's `export default` statement.

          // Find all VariableDeclarator nodes in the function component body
          const variableDeclarations = functionComponentBody.filter(
            n => n.type === 'VariableDeclaration'
          );

          // Now find one with symbol t
          const useTranslationNode = variableDeclarations.find(d =>
            d.declarations[0].id?.properties?.some(p => p.value?.name === 't')
          );

          if (!useTranslationNode || useTranslationNode.length === 0) {
            return fixer.insertTextBefore(
              functionComponentBody[0],
              `\n${useTranslation}\n`
            );
          }

          function summary(str) {
            return str.replace(/\n/g, '').substring(0, 50);
          }

          if (
            node.type === 'JSXText' ||
            (node.type === 'Literal' && node.parent.type === 'JSXAttribute')
          ) {
            const replacement = node.value
              // .split('\n')
              // .map(l => l.trim())
              // .join(' ')
              .trim();
            updateDict(replacement, { fileName, ...node.loc });
            // console.log(
            //   `fixing ${fixes++} L${node.loc.start.line} "${summary(node.value)}" to {t(\`${summary(replacement)}\`)}`
            // );
            return fixer.replaceText(node, `{t(\`${replacement}\`)}`);
          }

          if (node.type === 'Literal') {
            updateDict(node.value, { fileName, ...node.loc });
            const replacement = `t(${node.raw})`;
            // console.log(
            //   `fixing ${fixes++} L${node.loc.start.line} ${summary(node.value)} to "${summary(replacement)}"`
            // );
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
            const replacement = `t(\`${formatStr}\`, {${node.expressions
              .map((e, i) => `arg${i}: ${context.getSourceCode().getText(e)}`)
              .join(', ')}})`;
            // console.log(
            //   `fixing ${fixes++} L${node.loc.start.line
            //   } "${summary(context.getSourceCode().getText(node))}" to "${summary(replacement)}"`
            // );
            updateDict(formatStr, { fileName, ...node.loc });
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
