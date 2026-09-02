#!/usr/bin/env node
/**
 * Pre-commit hook script to check for exposed secrets
 * Usage: node scripts/check-secrets.js [files...]
 * 
 * This script scans files for exposed credentials and tokens.
 * It can be used as a git pre-commit hook or run manually.
 */

import { readFileSync } from 'fs';
import { validateForSensitiveData } from '../dist/security-validator.js';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node scripts/check-secrets.js <file1> [file2] ...');
  console.error('');
  console.error('Example: node scripts/check-secrets.js src/index.ts README.md');
  process.exit(1);
}

let hasViolations = false;
const excludedFiles = [
  '.env.example',
  'SECURITY.md',
  'test-security-validation.js',
  'check-secrets.js',
];

for (const file of args) {
  // Skip excluded files
  const fileName = file.split('/').pop();
  if (excludedFiles.some(excluded => fileName.includes(excluded))) {
    console.log(`ℹ️  Skipping ${file} (excluded)`);
    continue;
  }
  
  try {
    const content = readFileSync(file, 'utf8');
    const result = validateForSensitiveData(content);
    
    if (!result.isValid) {
      hasViolations = true;
      console.error(`\n❌ SECURITY VIOLATION in ${file}:`);
      console.error('━'.repeat(60));
      
      for (const violation of result.violations) {
        console.error(`  Type: ${violation.pattern}`);
        console.error(`  Position: ${violation.position}`);
        console.error(`  Preview: ${violation.match}`);
        console.error('');
      }
      
      console.error('⚠️  This file contains sensitive data that should not be committed!');
      console.error('━'.repeat(60));
    } else {
      console.log(`✓ ${file} - No secrets detected`);
    }
  } catch (error) {
    console.error(`Error reading ${file}:`, error.message);
    process.exit(1);
  }
}

if (hasViolations) {
  console.error('\n🚨 COMMIT BLOCKED: Sensitive data detected!');
  console.error('');
  console.error('Action required:');
  console.error('1. Remove all sensitive tokens/credentials from the files');
  console.error('2. Use environment variables instead (add to .env)');
  console.error('3. If already committed, revoke the exposed tokens immediately');
  console.error('4. Review SECURITY.md for best practices');
  console.error('');
  process.exit(1);
}

console.log('\n✅ All files passed security validation');
process.exit(0);
