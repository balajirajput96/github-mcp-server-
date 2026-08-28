const fs = require('fs');
let code = fs.readFileSync('src/security-validator.test.ts', 'utf8');

code = code.replace(
  /it\('should succeed validation for @example\.com emails', \(\) => {\s*const result = validateForSensitiveData\('user' \+ '@' \+ 'test\.com'\);\s*expect\(result\.isValid\)\.toBe\(true\);\s*}\);/,
  "it('should succeed validation for @example.com emails', () => {\n      const result = validateForSensitiveData('user@example.com');\n      expect(result.isValid).toBe(true);\n    });"
);

fs.writeFileSync('src/security-validator.test.ts', code);
