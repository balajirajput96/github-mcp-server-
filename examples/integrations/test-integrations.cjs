#!/usr/bin/env node
/**
 * Integration Test Script
 * Tests that all integration dependencies are properly installed and configured
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(50));
  log(title, colors.cyan);
  console.log('='.repeat(50));
}

async function testDependencies() {
  section('Testing Dependencies');
  
  const dependencies = [
    { name: '@slack/web-api', required: false },
    { name: 'axios', required: false },
    { name: '@octokit/rest', required: true },
    { name: 'dotenv', required: true }
  ];

  let allPassed = true;

  for (const dep of dependencies) {
    try {
      require.resolve(dep.name);
      log(`  ✓ ${dep.name} is installed`, colors.green);
    } catch (error) {
      if (dep.required) {
        log(`  ✗ ${dep.name} is NOT installed (REQUIRED)`, colors.red);
        allPassed = false;
      } else {
        log(`  ⚠ ${dep.name} is NOT installed (optional)`, colors.yellow);
      }
    }
  }

  return allPassed;
}

async function testEnvironmentVariables() {
  section('Testing Environment Variables');

  const envVars = [
    { name: 'GITHUB_TOKEN', required: true },
    { name: 'SLACK_BOT_TOKEN', required: false },
    { name: 'SLACK_CHANNEL_ID', required: false },
    { name: 'JIRA_URL', required: false },
    { name: 'JIRA_EMAIL', required: false },
    { name: 'JIRA_API_TOKEN', required: false },
    { name: 'JIRA_PROJECT_KEY', required: false }
  ];

  let hasRequired = true;
  const configured = {
    slack: false,
    jira: false
  };

  for (const envVar of envVars) {
    if (process.env[envVar.name]) {
      log(`  ✓ ${envVar.name} is set`, colors.green);
      
      // Track integration configuration
      if (envVar.name.startsWith('SLACK_')) configured.slack = true;
      if (envVar.name.startsWith('JIRA_')) configured.jira = true;
    } else {
      if (envVar.required) {
        log(`  ✗ ${envVar.name} is NOT set (REQUIRED)`, colors.red);
        hasRequired = false;
      } else {
        log(`  ⚠ ${envVar.name} is NOT set (optional)`, colors.yellow);
      }
    }
  }

  return { hasRequired, configured };
}

async function testSlackIntegration() {
  section('Testing Slack Integration');

  try {
    const SlackNotifier = require('./slack-notifications.cjs');
    log('  ✓ SlackNotifier class loaded', colors.green);

    if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_CHANNEL_ID) {
      log('  ⚠ Slack credentials not configured, skipping connection test', colors.yellow);
      return true;
    }

    // Test instantiation only (don't send actual messages in test mode)
    const notifier = new SlackNotifier(
      process.env.SLACK_BOT_TOKEN,
      process.env.SLACK_CHANNEL_ID
    );
    log('  ✓ SlackNotifier instantiated successfully', colors.green);
    log('  ℹ Run npm run example:slack to send a test message', colors.blue);

    return true;
  } catch (error) {
    log(`  ✗ Slack integration test failed: ${error.message}`, colors.red);
    return false;
  }
}

async function testJiraIntegration() {
  section('Testing Jira Integration');

  try {
    const JiraIntegration = require('./jira-automation.cjs');
    log('  ✓ JiraIntegration class loaded', colors.green);

    if (!process.env.JIRA_URL || !process.env.JIRA_EMAIL || !process.env.JIRA_API_TOKEN) {
      log('  ⚠ Jira credentials not configured, skipping connection test', colors.yellow);
      return true;
    }

    // Test instantiation only (don't create actual issues in test mode)
    const jira = new JiraIntegration(
      process.env.JIRA_URL,
      process.env.JIRA_EMAIL,
      process.env.JIRA_API_TOKEN,
      process.env.JIRA_PROJECT_KEY || 'PROJ'
    );
    log('  ✓ JiraIntegration instantiated successfully', colors.green);
    log('  ℹ Run npm run example:jira to create a test issue', colors.blue);

    return true;
  } catch (error) {
    log(`  ✗ Jira integration test failed: ${error.message}`, colors.red);
    return false;
  }
}

async function testCompleteWorkflow() {
  section('Testing Complete Workflow');

  try {
    const { deployWithIntegrations } = require('./complete-deployment-workflow.cjs');
    log('  ✓ Complete workflow module loaded', colors.green);
    log('  ℹ Run node examples/integrations/complete-deployment-workflow.js to test', colors.blue);
    return true;
  } catch (error) {
    log(`  ✗ Complete workflow test failed: ${error.message}`, colors.red);
    return false;
  }
}

async function generateReport(results) {
  section('Test Summary');

  console.log('\nResults:');
  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;
  
  log(`  Passed: ${passed}/${total}`, passed === total ? colors.green : colors.yellow);

  if (results.dependencies && results.envVarsRequired) {
    log('\n✅ Core functionality is ready!', colors.green);
  } else {
    log('\n⚠ Some issues detected. Please check the details above.', colors.yellow);
  }

  console.log('\nNext Steps:');
  
  if (!results.envVarsRequired) {
    log('  1. Set GITHUB_TOKEN in your .env file', colors.yellow);
  }

  if (!results.envVarsConfigured.slack) {
    log('  2. Configure Slack integration (optional) - see QUICK-START-ENTERPRISE.md', colors.blue);
  }

  if (!results.envVarsConfigured.jira) {
    log('  3. Configure Jira integration (optional) - see QUICK-START-ENTERPRISE.md', colors.blue);
  }

  log('  4. Run example scripts:', colors.blue);
  log('     - npm run example:slack', colors.blue);
  log('     - npm run example:jira', colors.blue);
  log('     - node examples/integrations/complete-deployment-workflow.js', colors.blue);

  console.log('\nDocumentation:');
  log('  - README.md - Main documentation', colors.cyan);
  log('  - QUICK-START-ENTERPRISE.md - Quick setup guide', colors.cyan);
  log('  - ENTERPRISE-INTEGRATION.md - Full integration guide', colors.cyan);
  log('  - examples/integrations/README.md - Integration examples', colors.cyan);
}

async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     GitHub MCP Server Integration Tests       ║');
  console.log('╚════════════════════════════════════════════════╝');

  const results = {
    dependencies: await testDependencies(),
    envVarsRequired: false,
    envVarsConfigured: { slack: false, jira: false },
    slack: await testSlackIntegration(),
    jira: await testJiraIntegration(),
    workflow: await testCompleteWorkflow()
  };

  const envTest = await testEnvironmentVariables();
  results.envVarsRequired = envTest.hasRequired;
  results.envVarsConfigured = envTest.configured;

  await generateReport(results);

  // Exit with appropriate code
  const success = results.dependencies && results.envVarsRequired;
  process.exit(success ? 0 : 1);
}

// Run tests
main().catch(error => {
  console.error('\nUnexpected error:', error);
  process.exit(1);
});
