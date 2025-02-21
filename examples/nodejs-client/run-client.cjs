require = require('esm')(module, require); // Force CommonJS context
module.exports = require('./index.cjs');
