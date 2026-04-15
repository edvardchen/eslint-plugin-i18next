import { $ } from 'zx';
import assert from 'assert';

(async () => {
  const result = await $({ nothrow: true })`eslint index.js -f json`;
  const [lintResult] = JSON.parse(result.stdout);

  assert.equal(result.exitCode, 1, 'expected lint to fail');
  assert.equal(lintResult.errorCount, 1, 'expect to have one lint error');
  assert.equal(
    lintResult.messages[0].ruleId,
    'i18next/no-literal-string',
    'expect eslint 10 to execute the plugin rule'
  );
})();
