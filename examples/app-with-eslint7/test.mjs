import { $ } from 'zx';
import assert from 'assert';

(async () => {
  await $({})`eslint index.js -f json`.catch(e => {
    const [error] = JSON.parse(e.stdout);
    assert(error.errorCount === 1, 'expect to have one lint error');
  });
})();
