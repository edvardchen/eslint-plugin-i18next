/**
 * @fileoverview ESLint plugin for i18n
 * @author edvardchen
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var requireIndex = require('requireindex');

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

const plugin = {
  // import all rules in lib/rules
  rules: requireIndex(__dirname + '/rules'),

  recommended: {
    plugins: ['i18next'],
    rules: {
      'i18next/no-literal-string': [2]
    }
  }
};

module.exports = plugin;
