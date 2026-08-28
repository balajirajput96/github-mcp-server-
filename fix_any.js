const fs = require('fs');
let code = fs.readFileSync('src/index.ts', 'utf8');
code = code.replace(/args as any/g, 'args as Record<string, unknown>');
fs.writeFileSync('src/index.ts', code);
