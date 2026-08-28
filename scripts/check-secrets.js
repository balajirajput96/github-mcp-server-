#!/usr/bin/env node
/**
 * Secret-scanning CLI.
 * Usage: node scripts/check-secrets.js [file1 file2 ...]
 * With no explicit files, scans staged files; a clean tree is a successful no-op.
 */

import { execFileSync, spawnSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const validatorPath = resolve(projectRoot, 'dist/security-validator.js');

if (!existsSync(validatorPath)) {
  console.log('Built validator not found; running the project build first.');
  const build = spawnSync('npm', ['run', 'build'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: false,
  });
  if (build.error) {
    console.error(`Unable to start the build: ${build.error.message}`);
    process.exit(1);
  }
  if (build.status !== 0) {
    console.error(`Build failed with exit code ${build.status ?? 'unknown'}.`);
    process.exit(build.status ?? 1);
  }
}

const { validateForSensitiveData } = await import(pathToFileURL(validatorPath).href);
const explicitFiles = process.argv.slice(2);
let files = explicitFiles;

if (files.length === 0) {
  try {
    const staged = execFileSync(
      'git',
      ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'],
      { cwd: projectRoot, encoding: 'utf8' },
    );
    files = staged.split('\0').filter(Boolean);
  } catch (error) {
    console.error(`Unable to enumerate staged files: ${error.message}`);
    process.exit(1);
  }
}

if (files.length === 0) {
  console.log('No staged files to scan.');
  process.exit(0);
}

let hasViolations = false;
const excludedFiles = [
  '.env.example',
  'SECURITY.md',
  'test-security-validation.js',
  'check-secrets.js',
  'package-lock.json',
];

for (const file of files) {
  const fileName = file.split('/').pop();
  if (excludedFiles.some((excluded) => fileName.includes(excluded))) {
    console.log(`ℹ️  Skipping ${file} (excluded)`);
    continue;
  }

  try {
    const content = readFileSync(resolve(projectRoot, file), 'utf8');
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
    console.error(`Error reading ${file}: ${error.message}`);
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
