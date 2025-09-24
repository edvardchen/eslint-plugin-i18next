/**
 * @fileoverview enforce TFunction type usage from i18next
 * @author tupe12334
 */
'use strict';

const TFUNCTION_SIGNATURE_PATTERNS = [
  // Common TFunction-like signatures with various parameter names
  /(key|translationKey|i18nKey):\s*string[^)]*\s*=>\s*string/,
  /(key|translationKey|i18nKey):\s*string[^)]*\s*:\s*string/,
  /\(\s*(key|translationKey|i18nKey):\s*string[^)]*\)\s*=>\s*string/,
  /\(\s*(key|translationKey|i18nKey):\s*string[^)]*\)\s*:\s*string/,
];

function isTFunctionLikeSignature(typeAnnotation) {
  if (!typeAnnotation) return false;

  const typeText = typeAnnotation.replace(/\s+/g, ' ').trim();
  return TFUNCTION_SIGNATURE_PATTERNS.some(pattern => pattern.test(typeText));
}

function hasImportedTFunction(context) {
  const sourceCode = context.getSourceCode();
  const program = sourceCode.ast;

  for (const node of program.body) {
    if (node.type === 'ImportDeclaration' && node.source.value === 'i18next') {
      return node.specifiers.some(
        spec =>
          spec.type === 'ImportSpecifier' && spec.imported.name === 'TFunction'
      );
    }
  }
  return false;
}

function getExistingI18nextImport(context) {
  const sourceCode = context.getSourceCode();
  const program = sourceCode.ast;

  return program.body.find(
    node => node.type === 'ImportDeclaration' && node.source.value === 'i18next'
  );
}

function getTypeAnnotationText(context, node) {
  const sourceCode = context.getSourceCode();

  if (node.type === 'TSTypeAliasDeclaration') {
    return sourceCode.getText(node.typeAnnotation);
  }

  if (node.type === 'TSInterfaceDeclaration') {
    // Check if interface has call signature that matches TFunction
    const callSignature = node.body.body.find(
      member => member.type === 'TSCallSignatureDeclaration'
    );
    if (callSignature) {
      return sourceCode.getText(callSignature);
    }
  }

  if (node.type === 'VariableDeclarator' && node.id.typeAnnotation) {
    return sourceCode.getText(node.id.typeAnnotation.typeAnnotation);
  }

  return null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce TFunction type usage from i18next',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
    messages: {
      useTFunction:
        'Use TFunction type from i18next instead of custom translation function type',
      importTFunction: 'Import TFunction from i18next to use the official type',
    },
  },

  create(context) {
    function reportAndFix(node, messageId, fixCallback) {
      context.report({
        node,
        messageId,
        fix: fixCallback,
      });
    }

    function createTFunctionImportFix(fixer) {
      const sourceCode = context.getSourceCode();
      const program = sourceCode.ast;
      const existingImport = getExistingI18nextImport(context);

      if (existingImport) {
        // Add TFunction to existing import
        const lastSpecifier =
          existingImport.specifiers[existingImport.specifiers.length - 1];
        return fixer.insertTextAfter(lastSpecifier, ', TFunction');
      } else {
        // Create new import statement
        const firstNode = program.body[0];
        return fixer.insertTextBefore(
          firstNode,
          "import { TFunction } from 'i18next';\n"
        );
      }
    }

    return {
      TSTypeAliasDeclaration(node) {
        const typeText = getTypeAnnotationText(context, node);
        if (typeText && isTFunctionLikeSignature(typeText)) {
          const hasTFunctionImport = hasImportedTFunction(context);
          if (!hasTFunctionImport) {
            reportAndFix(node, 'importTFunction', fixer => {
              const importFix = createTFunctionImportFix(fixer);
              const typeFix = fixer.replaceText(
                node.typeAnnotation,
                'TFunction'
              );
              return [importFix, typeFix];
            });
          } else {
            reportAndFix(node, 'useTFunction', fixer => {
              return fixer.replaceText(node.typeAnnotation, 'TFunction');
            });
          }
        }
      },

      TSInterfaceDeclaration(node) {
        const typeText = getTypeAnnotationText(context, node);
        if (typeText && isTFunctionLikeSignature(typeText)) {
          const hasTFunctionImport = hasImportedTFunction(context);
          if (!hasTFunctionImport) {
            reportAndFix(node, 'importTFunction', fixer => {
              const importFix = createTFunctionImportFix(fixer);
              const typeFix = fixer.replaceText(
                node,
                `type ${node.id.name} = TFunction;`
              );
              return [importFix, typeFix];
            });
          } else {
            reportAndFix(node, 'useTFunction', fixer => {
              return fixer.replaceText(
                node,
                `type ${node.id.name} = TFunction;`
              );
            });
          }
        }
      },

      VariableDeclarator(node) {
        if (node.id.typeAnnotation) {
          const typeText = getTypeAnnotationText(context, node);
          if (typeText && isTFunctionLikeSignature(typeText)) {
            const hasTFunctionImport = hasImportedTFunction(context);
            if (!hasTFunctionImport) {
              reportAndFix(node, 'importTFunction', fixer => {
                const importFix = createTFunctionImportFix(fixer);
                const typeFix = fixer.replaceText(
                  node.id.typeAnnotation.typeAnnotation,
                  'TFunction'
                );
                return [importFix, typeFix];
              });
            } else {
              reportAndFix(node, 'useTFunction', fixer => {
                return fixer.replaceText(
                  node.id.typeAnnotation.typeAnnotation,
                  'TFunction'
                );
              });
            }
          }
        }
      },
    };
  },
};
