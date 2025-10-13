/**
 * Complete Deployment Workflow Example
 * Demonstrates integration of all notification and project management tools
 * for a production deployment workflow
 */

const SlackNotifier = require('./slack-notifications');
const TeamsNotifier = require('./teams-notifications');
const EmailNotifier = require('./email-notifications');
const JiraIntegration = require('./jira-automation');
const PagerDutyIntegration = require('./pagerduty-integration');

/**
 * Complete deployment workflow that integrates all notification systems
 */
class DeploymentWorkflow {
  constructor(config) {
    // Initialize all integrations
    this.slack = config.slackToken ? new SlackNotifier(
      config.slackToken,
      config.slackChannel
    ) : null;

    this.teams = config.teamsWebhook ? new TeamsNotifier(
      config.teamsWebhook
    ) : null;

    this.email = config.smtpConfig ? new EmailNotifier({
      host: config.smtpConfig.host,
      port: config.smtpConfig.port,
      user: config.smtpConfig.user,
      pass: config.smtpConfig.pass,
      fromEmail: config.smtpConfig.fromEmail,
      toEmails: config.smtpConfig.toEmails
    }) : null;

    this.jira = config.jiraConfig ? new JiraIntegration(
      config.jiraConfig.url,
      config.jiraConfig.email,
      config.jiraConfig.apiToken,
      config.jiraConfig.projectKey
    ) : null;

    this.pagerduty = config.pagerdutyConfig ? new PagerDutyIntegration(
      config.pagerdutyConfig.apiKey,
      config.pagerdutyConfig.serviceKey,
      config.pagerdutyConfig.fromEmail
    ) : null;

    this.deployer = config.deployer || 'deploy-bot';
  }

  /**
   * Notify all configured channels about deployment start
   */
  async notifyDeploymentStarted(environment, version) {
    console.log(`[Workflow] Notifying deployment started: ${environment} v${version}`);
    
    const notifications = [];

    if (this.slack) {
      notifications.push(
        this.slack.notifyDeploymentStarted(environment, version, this.deployer)
      );
    }

    if (this.teams) {
      notifications.push(
        this.teams.notifyDeploymentStarted(environment, version, this.deployer)
      );
    }

    if (this.email) {
      notifications.push(
        this.email.notifyDeploymentStarted(environment, version, this.deployer)
      );
    }

    await Promise.all(notifications);
    console.log('[Workflow] All deployment started notifications sent');
  }

  /**
   * Notify all configured channels about deployment success
   */
  async notifyDeploymentSuccess(environment, version, duration) {
    console.log(`[Workflow] Notifying deployment success: ${environment} v${version}`);
    
    const notifications = [];

    if (this.slack) {
      notifications.push(
        this.slack.notifyDeploymentSuccess(environment, version, duration, this.deployer)
      );
    }

    if (this.teams) {
      notifications.push(
        this.teams.notifyDeploymentSuccess(environment, version, duration, this.deployer)
      );
    }

    if (this.email) {
      notifications.push(
        this.email.notifyDeploymentSuccess(environment, version, duration, this.deployer)
      );
    }

    await Promise.all(notifications);
    console.log('[Workflow] All deployment success notifications sent');
  }

  /**
   * Handle deployment failure - notify all systems and create incidents
   */
  async handleDeploymentFailure(environment, version, error) {
    console.log(`[Workflow] Handling deployment failure: ${environment} v${version}`);
    
    const errorMessage = error.message || error.toString();
    const errorStack = error.stack || errorMessage;

    // Send notifications to all channels
    const notifications = [];

    if (this.slack) {
      notifications.push(
        this.slack.notifyDeploymentFailure(environment, version, errorMessage, this.deployer)
      );
    }

    if (this.teams) {
      notifications.push(
        this.teams.notifyDeploymentFailure(environment, version, errorMessage, this.deployer)
      );
    }

    if (this.email) {
      notifications.push(
        this.email.notifyDeploymentFailure(environment, version, errorStack, this.deployer)
      );
    }

    await Promise.all(notifications);

    // Create Jira bug for tracking
    let jiraIssue = null;
    if (this.jira) {
      try {
        jiraIssue = await this.jira.createBugFromFailure(
          `Deployment failed: ${environment} v${version}`,
          errorStack,
          version,
          environment
        );
        console.log(`[Workflow] Jira bug created: ${jiraIssue.key}`);
      } catch (err) {
        console.error('[Workflow] Failed to create Jira issue:', err.message);
      }
    }

    // Create PagerDuty incident for production failures
    let incident = null;
    if (this.pagerduty && environment === 'production') {
      try {
        incident = await this.pagerduty.triggerDeploymentFailure(
          environment,
          version,
          errorMessage,
          this.deployer
        );
        console.log(`[Workflow] PagerDuty incident created: ${incident.id}`);

        // Add Jira link to PagerDuty incident if available
        if (incident && jiraIssue) {
          await this.pagerduty.addIncidentNote(
            incident.id,
            `Tracking Jira issue: ${jiraIssue.key}`
          );
        }
      } catch (err) {
        console.error('[Workflow] Failed to create PagerDuty incident:', err.message);
      }
    }

    console.log('[Workflow] All failure handling complete');
    return { jiraIssue, incident };
  }

  /**
   * Execute a complete deployment with full integration
   */
  async deploy(environment, version, deployFunction) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Starting deployment: ${environment} v${version}`);
    console.log('='.repeat(60));

    let jiraIssue = null;
    let startTime = Date.now();

    try {
      // Create Jira deployment tracking issue
      if (this.jira) {
        jiraIssue = await this.jira.createDeploymentIssue(
          `Deploy ${version} to ${environment}`,
          `Automated deployment of version ${version} to ${environment} environment`,
          environment
        );
        console.log(`[Workflow] Jira tracking issue created: ${jiraIssue.key}`);
      }

      // Notify deployment started
      await this.notifyDeploymentStarted(environment, version);

      // Execute the actual deployment
      console.log('[Workflow] Executing deployment...');
      await deployFunction();
      
      const duration = this.formatDuration(Date.now() - startTime);
      console.log(`[Workflow] Deployment completed in ${duration}`);

      // Update Jira issue with success
      if (this.jira && jiraIssue) {
        await this.jira.updateIssue(
          jiraIssue.key,
          `Deployment completed successfully in ${duration}`,
          'Done'
        );
        console.log('[Workflow] Jira issue updated with success');
      }

      // Notify deployment success
      await this.notifyDeploymentSuccess(environment, version, duration);

      console.log('='.repeat(60));
      console.log('✅ Deployment completed successfully!');
      console.log('='.repeat(60) + '\n');

      return { success: true, duration, jiraIssue };

    } catch (error) {
      const duration = this.formatDuration(Date.now() - startTime);
      console.error('[Workflow] Deployment failed:', error.message);

      // Update Jira issue with failure
      if (this.jira && jiraIssue) {
        try {
          await this.jira.updateIssue(
            jiraIssue.key,
            `Deployment failed after ${duration}: ${error.message}`,
            null
          );
        } catch (err) {
          console.error('[Workflow] Failed to update Jira issue:', err.message);
        }
      }

      // Handle failure notifications and incident creation
      const failureResult = await this.handleDeploymentFailure(environment, version, error);

      console.log('='.repeat(60));
      console.log('❌ Deployment failed!');
      console.log('='.repeat(60) + '\n');

      return {
        success: false,
        duration,
        error: error.message,
        jiraIssue: failureResult.jiraIssue,
        incident: failureResult.incident
      };
    }
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }
}

/**
 * Example deployment function (simulates actual deployment)
 */
async function exampleDeployment() {
  console.log('  → Building application...');
  await sleep(2000);
  
  console.log('  → Running tests...');
  await sleep(1500);
  
  console.log('  → Deploying to servers...');
  await sleep(2500);
  
  // Simulate random failure (20% chance)
  if (Math.random() < 0.2) {
    throw new Error('Database connection timeout during migration');
  }
  
  console.log('  → Verifying deployment...');
  await sleep(1000);
  
  console.log('  → Deployment verified successfully');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Example usage
if (require.main === module) {
  const workflow = new DeploymentWorkflow({
    slackToken: process.env.SLACK_BOT_TOKEN,
    slackChannel: process.env.SLACK_CHANNEL_ID,
    teamsWebhook: process.env.TEAMS_WEBHOOK_URL,
    smtpConfig: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      fromEmail: process.env.SMTP_FROM_EMAIL,
      toEmails: (process.env.SMTP_TO_EMAILS || '').split(',')
    },
    jiraConfig: {
      url: process.env.JIRA_URL,
      email: process.env.JIRA_EMAIL,
      apiToken: process.env.JIRA_API_TOKEN,
      projectKey: 'PROJ'
    },
    pagerdutyConfig: {
      apiKey: process.env.PAGERDUTY_API_KEY,
      serviceKey: process.env.PAGERDUTY_SERVICE_KEY,
      fromEmail: process.env.PAGERDUTY_FROM_EMAIL
    },
    deployer: 'automated-deployment-system'
  });

  // Execute deployment
  workflow.deploy('production', 'v1.2.3', exampleDeployment)
    .then(result => {
      if (result.success) {
        console.log(`Deployment successful! Duration: ${result.duration}`);
        if (result.jiraIssue) {
          console.log(`Jira issue: ${result.jiraIssue.key}`);
        }
        process.exit(0);
      } else {
        console.error('Deployment failed!');
        if (result.jiraIssue) {
          console.log(`Jira bug: ${result.jiraIssue.key}`);
        }
        if (result.incident) {
          console.log(`PagerDuty incident: ${result.incident.id}`);
        }
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Workflow error:', error);
      process.exit(1);
    });
}

module.exports = DeploymentWorkflow;
