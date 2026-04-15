'use strict';

const assert = require('assert');
const ts = require('typescript');
const path = require('path');

describe('types: flat recommended config', () => {
  it('types flat/recommended as Linter.Config', () => {
    const source = `
      import i18next = require('${path.resolve(__dirname, '../../lib')}');
      import type { Linter } from 'eslint';

      const flatConfig: Linter.Config = i18next.configs['flat/recommended'];
    `;

    const result = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        strict: true,
        moduleResolution: ts.ModuleResolutionKind.Node10,
        esModuleInterop: true,
      },
      reportDiagnostics: true,
    });

    assert.deepStrictEqual(result.diagnostics || [], []);
  });
});
