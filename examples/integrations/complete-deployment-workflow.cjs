/**
 * Complete Deployment Workflow Example
 * Demonstrates full integration of Slack and Jira for deployment automation
 * 
 * This example shows how to:
 * 1. Notify team via Slack when deployment starts
 * 2. Create a Jira issue to track the deployment
 * 3. Execute deployment steps
 * 4. Update Jira with deployment status
 * 5. Notify team via Slack of success/failure
 * 6. Create bug report in Jira if deployment fails
 */

const SlackNotifier = require('./slack-notifications.cjs');
const JiraIntegration = require('./jira-automation.cjs');
require('dotenv').config();

/**
 * Simulates a deployment process
 */
async function performDeployment(version, environment) {
  console.log(`🚀 Starting deployment of ${version} to ${environment}...`);
  
  // Simulate deployment steps
  const steps = [
    'Building application...',
    'Running tests...',
    'Creating deployment artifacts...',
    'Uploading to server...',
    'Running database migrations...',
    'Starting services...',
    'Running health checks...'
  ];

  for (const step of steps) {
    console.log(`   ${step}`);
    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Simulate random success/failure (80% success rate for demo)
  if (Math.random() > 0.2) {
    console.log('✅ Deployment completed successfully!');
    return { success: true };
  } else {
    throw new Error('Connection timeout during health check');
  }
}

/**
 * Main deployment workflow with integrations
 */
async function deployWithIntegrations(version, environment, deployer) {
  const startTime = Date.now();
  let slack = null;
  let jira = null;
  let jiraIssue = null;

  try {
    // Initialize integrations (only if environment variables are set)
    if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_CHANNEL_ID) {
      slack = new SlackNotifier(
        process.env.SLACK_BOT_TOKEN,
        process.env.SLACK_CHANNEL_ID
      );
      console.log('📱 Slack integration initialized');
    }

    if (process.env.JIRA_URL && process.env.JIRA_EMAIL && process.env.JIRA_API_TOKEN) {
      jira = new JiraIntegration(
        process.env.JIRA_URL,
        process.env.JIRA_EMAIL,
        process.env.JIRA_API_TOKEN,
        process.env.JIRA_PROJECT_KEY || 'PROJ'
      );
      console.log('📋 Jira integration initialized');
    }

    // Step 1: Notify deployment started
    console.log('\n📢 Step 1: Notifying team of deployment start...');
    if (slack) {
      await slack.notifyDeploymentStarted(environment, version, deployer);
      console.log('   ✓ Slack notification sent');
    } else {
      console.log('   ⚠ Slack not configured, skipping notification');
    }

    // Step 2: Create Jira tracking issue
    console.log('\n📋 Step 2: Creating Jira tracking issue...');
    if (jira) {
      jiraIssue = await jira.createDeploymentIssue(
        `Deploy ${version} to ${environment}`,
        `Automated deployment of version ${version} to ${environment} environment.\nDeployed by: ${deployer}\nStarted at: ${new Date().toISOString()}`,
        environment
      );
      console.log(`   ✓ Jira issue created: ${jiraIssue.key}`);
    } else {
      console.log('   ⚠ Jira not configured, skipping issue creation');
    }

    // Step 3: Perform the actual deployment
    console.log('\n🚀 Step 3: Executing deployment...');
    await performDeployment(version, environment);

    // Step 4: Calculate duration
    const duration = `${Math.round((Date.now() - startTime) / 1000)}s`;
    console.log(`\n⏱️ Deployment completed in ${duration}`);

    // Step 5: Update Jira issue with success
    console.log('\n📋 Step 4: Updating Jira issue...');
    if (jira && jiraIssue) {
      await jira.updateIssue(
        jiraIssue.key,
        `Deployment completed successfully in ${duration}`,
        'Done'
      );
      console.log('   ✓ Jira issue updated and closed');
    }

    // Step 6: Notify success via Slack
    console.log('\n📢 Step 5: Notifying team of success...');
    if (slack) {
      await slack.notifyDeploymentSuccess(
        environment,
        version,
        duration,
        deployer
      );
      console.log('   ✓ Success notification sent to Slack');
    }

    console.log('\n✨ Deployment workflow completed successfully!\n');
    return { success: true, duration, issueKey: jiraIssue?.key };

  } catch (error) {
    // Calculate duration even on failure
    const duration = `${Math.round((Date.now() - startTime) / 1000)}s`;
    
    console.error('\n❌ Deployment failed:', error.message);

    // Notify failure via Slack
    console.log('\n📢 Notifying team of failure...');
    if (slack) {
      await slack.notifyDeploymentFailure(
        environment,
        version,
        error.message,
        deployer
      );
      console.log('   ✓ Failure notification sent to Slack');
    }

    // Create bug report in Jira
    console.log('\n🐛 Creating bug report in Jira...');
    if (jira) {
      const bugIssue = await jira.createBugFromFailure(
        'Deployment failed',
        error.stack || error.message,
        version,
        environment
      );
      console.log(`   ✓ Bug report created: ${bugIssue.key}`);

      // Update deployment tracking issue if it exists
      if (jiraIssue) {
        await jira.updateIssue(
          jiraIssue.key,
          `Deployment failed after ${duration}. Bug report created: ${bugIssue.key}\nError: ${error.message}`
        );
        console.log(`   ✓ Deployment tracking issue updated: ${jiraIssue.key}`);
      }
    }

    console.log('\n💔 Deployment workflow completed with errors\n');
    throw error;
  }
}

// Run the workflow if executed directly
if (require.main === module) {
  // Example configuration
  const config = {
    version: process.env.DEPLOYMENT_VERSION || 'v1.2.3',
    environment: process.env.DEPLOYMENT_ENVIRONMENT || 'staging',
    deployer: process.env.DEPLOYMENT_USER || 'deploy-bot'
  };

  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Complete Deployment Workflow Example    ║');
  console.log('╚════════════════════════════════════════════╝\n');

  console.log('Configuration:');
  console.log(`  Version: ${config.version}`);
  console.log(`  Environment: ${config.environment}`);
  console.log(`  Deployer: ${config.deployer}`);
  console.log(`  Slack: ${process.env.SLACK_BOT_TOKEN ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`  Jira: ${process.env.JIRA_URL ? '✓ Configured' : '✗ Not configured'}`);
  console.log('\n' + '─'.repeat(48) + '\n');

  deployWithIntegrations(config.version, config.environment, config.deployer)
    .then(result => {
      console.log('Final Result:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Workflow error:', error.message);
      process.exit(1);
    });
}

module.exports = { deployWithIntegrations, performDeployment };
