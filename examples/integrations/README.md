# Integration Examples

This directory contains example code for integrating the GitHub MCP Server with various enterprise tools and platforms.

## Available Examples

### 1. Slack Notifications (`slack-notifications.js`)

Demonstrates how to send deployment notifications to Slack channels.

**Features:**
- Deployment started notifications
- Success/failure notifications with details
- Custom formatted messages
- Interactive buttons

**Usage:**
```javascript
const SlackNotifier = require('./slack-notifications');

const notifier = new SlackNotifier(
  process.env.SLACK_BOT_TOKEN,
  process.env.SLACK_CHANNEL_ID
);

// Notify deployment started
await notifier.notifyDeploymentStarted('production', 'v1.2.3', 'john.doe');

// Notify success
await notifier.notifyDeploymentSuccess('production', 'v1.2.3', '3m 45s', 'john.doe');

// Notify failure
await notifier.notifyDeploymentFailure('production', 'v1.2.3', error.message, 'john.doe');
```

### 2. Jira Automation (`jira-automation.js`)

Automates Jira issue creation and updates based on deployment events.

**Features:**
- Create deployment tracking issues
- Automatic bug creation from failures
- Update existing issues with deployment status
- Link deployments to issues
- Search and query issues

**Usage:**
```javascript
const JiraIntegration = require('./jira-automation');

const jira = new JiraIntegration(
  process.env.JIRA_URL,
  process.env.JIRA_EMAIL,
  process.env.JIRA_API_TOKEN,
  'PROJ'
);

// Create deployment issue
const issue = await jira.createDeploymentIssue(
  'Deploy v1.2.3 to Production',
  'Deploying version 1.2.3 with new features',
  'production'
);

// Create bug from failure
await jira.createBugFromFailure(
  'API Gateway timeout',
  error.stack,
  'v1.2.3',
  'production'
);

// Update issue
await jira.updateIssue(
  'PROJ-123',
  'Deployment completed successfully',
  'Done'
);
```

### 3. Microsoft Teams Notifications (`teams-notifications.js`)

Sends deployment notifications to Microsoft Teams channels via Incoming Webhooks.

**Features:**
- Deployment started notifications
- Success/failure notifications with rich cards
- Pull request notifications
- Custom formatted messages with actions

**Usage:**
```javascript
const TeamsNotifier = require('./teams-notifications');

const notifier = new TeamsNotifier(process.env.TEAMS_WEBHOOK_URL);

// Notify deployment started
await notifier.notifyDeploymentStarted('production', 'v1.2.3', 'john.doe');

// Notify success
await notifier.notifyDeploymentSuccess('production', 'v1.2.3', '3m 45s', 'john.doe');

// Notify failure
await notifier.notifyDeploymentFailure('production', 'v1.2.3', error.message, 'john.doe');

// Notify PR opened
await notifier.notifyPullRequest('opened', 42, 'Add new feature', 'john.doe', 'https://github.com/user/repo');
```

### 4. Email Notifications (`email-notifications.js`)

Sends deployment notifications via email using nodemailer with HTML formatting.

**Features:**
- Deployment lifecycle notifications
- Pull request notifications
- Custom HTML-formatted emails
- Support for multiple recipients

**Usage:**
```javascript
const EmailNotifier = require('./email-notifications');

const notifier = new EmailNotifier({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  fromEmail: 'deployments@company.com',
  toEmails: ['team@company.com', 'stakeholders@company.com']
});

// Notify deployment
await notifier.notifyDeploymentStarted('production', 'v1.2.3', 'john.doe');
await notifier.notifyDeploymentSuccess('production', 'v1.2.3', '3m 45s', 'john.doe');

// Send custom notification
await notifier.sendCustomNotification('Alert', '<h1>Custom message</h1>', true);
```

### 5. PagerDuty Integration (`pagerduty-integration.js`)

Creates incidents and alerts for deployment failures and system issues.

**Features:**
- Incident creation and management
- Event triggering via Events API v2
- Incident acknowledgment and resolution
- Service monitoring alerts
- Custom incident notes

**Usage:**
```javascript
const PagerDutyIntegration = require('./pagerduty-integration');

const pagerduty = new PagerDutyIntegration(
  process.env.PAGERDUTY_API_KEY,
  process.env.PAGERDUTY_SERVICE_KEY,
  process.env.PAGERDUTY_FROM_EMAIL
);

// Trigger deployment failure incident
const incident = await pagerduty.triggerDeploymentFailure(
  'production',
  'v1.2.3',
  'Database connection timeout',
  'deploy-bot'
);

// Add note to incident
await pagerduty.addIncidentNote(incident.id, 'Investigating the issue');

// Resolve incident
await pagerduty.resolveIncident(incident.id, 'Issue fixed by rolling back to v1.2.2');
```

## Installation

These examples require additional dependencies:

```bash
npm install @slack/web-api axios nodemailer
```

## Environment Variables

Set up the following environment variables:

```bash
# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_CHANNEL_ID=C0123456789

# Jira
JIRA_URL=https://your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token

# Microsoft Teams
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/your-webhook-url

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=deployments@company.com
SMTP_TO_EMAILS=team@company.com,stakeholders@company.com

# PagerDuty
PAGERDUTY_API_KEY=your-api-key
PAGERDUTY_SERVICE_KEY=your-service-key
PAGERDUTY_FROM_EMAIL=your-email@company.com
```

## Integration Workflow Example

Here's a complete example that combines multiple integrations:

```javascript
const SlackNotifier = require('./slack-notifications');
const TeamsNotifier = require('./teams-notifications');
const EmailNotifier = require('./email-notifications');
const JiraIntegration = require('./jira-automation');
const PagerDutyIntegration = require('./pagerduty-integration');

async function deployWithIntegrations(version, environment) {
  // Initialize all integrations
  const slack = new SlackNotifier(
    process.env.SLACK_BOT_TOKEN,
    process.env.SLACK_CHANNEL_ID
  );
  
  const teams = new TeamsNotifier(process.env.TEAMS_WEBHOOK_URL);
  
  const email = new EmailNotifier({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromEmail: process.env.SMTP_FROM_EMAIL,
    toEmails: process.env.SMTP_TO_EMAILS.split(',')
  });
  
  const jira = new JiraIntegration(
    process.env.JIRA_URL,
    process.env.JIRA_EMAIL,
    process.env.JIRA_API_TOKEN,
    'PROJ'
  );
  
  const pagerduty = new PagerDutyIntegration(
    process.env.PAGERDUTY_API_KEY,
    process.env.PAGERDUTY_SERVICE_KEY,
    process.env.PAGERDUTY_FROM_EMAIL
  );

  try {
    // 1. Notify deployment started across all channels
    await Promise.all([
      slack.notifyDeploymentStarted(environment, version, 'deploy-bot'),
      teams.notifyDeploymentStarted(environment, version, 'deploy-bot'),
      email.notifyDeploymentStarted(environment, version, 'deploy-bot')
    ]);
    
    // 2. Create Jira tracking issue
    const issue = await jira.createDeploymentIssue(
      `Deploy ${version} to ${environment}`,
      `Automated deployment of version ${version}`,
      environment
    );
    
    // 3. Perform deployment
    const startTime = Date.now();
    await performDeployment(version, environment);
    const duration = `${Math.round((Date.now() - startTime) / 1000)}s`;
    
    // 4. Update Jira issue
    await jira.updateIssue(
      issue.key,
      `Deployment completed successfully in ${duration}`,
      'Done'
    );
    
    // 5. Notify success across all channels
    await Promise.all([
      slack.notifyDeploymentSuccess(environment, version, duration, 'deploy-bot'),
      teams.notifyDeploymentSuccess(environment, version, duration, 'deploy-bot'),
      email.notifyDeploymentSuccess(environment, version, duration, 'deploy-bot')
    ]);
    
  } catch (error) {
    // Handle failure - notify all systems
    await Promise.all([
      slack.notifyDeploymentFailure(environment, version, error.message, 'deploy-bot'),
      teams.notifyDeploymentFailure(environment, version, error.message, 'deploy-bot'),
      email.notifyDeploymentFailure(environment, version, error.stack, 'deploy-bot')
    ]);
    
    // Create Jira bug
    await jira.createBugFromFailure(
      'Deployment failed',
      error.stack,
      version,
      environment
    );
    
    // Create PagerDuty incident for critical environments
    if (environment === 'production') {
      await pagerduty.triggerDeploymentFailure(
        environment,
        version,
        error.message,
        'deploy-bot'
      );
    }
    
    throw error;
  }
}
```

## Additional Integrations

Want to add more integrations? Here are some suggestions:

1. **Trello** - Card automation for deployment tracking
2. **DataDog** - Deployment markers and APM
3. **New Relic** - Deployment annotations and monitoring
4. **Discord** - Community deployment notifications
5. **Telegram** - Mobile deployment alerts
6. **Webhooks** - Custom integration endpoints

## Contributing

To add a new integration example:

1. Create a new file: `your-integration.js`
2. Follow the existing code structure
3. Add usage documentation in this README
4. Include required environment variables

## Testing

Test your integrations:

```bash
# Test Slack notifications
node slack-notifications.js

# Test Jira automation
node jira-automation.js

# Test Microsoft Teams notifications
node teams-notifications.js

# Test Email notifications
node email-notifications.js

# Test PagerDuty integration
node pagerduty-integration.js
```

## Complete Workflow Example

For a comprehensive example that demonstrates how to use all integrations together in a production deployment workflow, see:

**`complete-deployment-workflow.js`** - Enterprise-grade deployment orchestration

This example shows:
- Coordinated notifications across Slack, Teams, and Email
- Jira issue tracking for deployments and bugs
- PagerDuty incident creation for production failures
- Automatic error handling and reporting
- Duration tracking and reporting
- Rollback support

**Usage:**
```javascript
const DeploymentWorkflow = require('./complete-deployment-workflow');

const workflow = new DeploymentWorkflow({
  slackToken: process.env.SLACK_BOT_TOKEN,
  slackChannel: process.env.SLACK_CHANNEL_ID,
  teamsWebhook: process.env.TEAMS_WEBHOOK_URL,
  smtpConfig: { /* SMTP config */ },
  jiraConfig: { /* Jira config */ },
  pagerdutyConfig: { /* PagerDuty config */ },
  deployer: 'automated-system'
});

// Deploy with full integration
const result = await workflow.deploy('production', 'v1.2.3', async () => {
  // Your deployment logic here
  await buildApp();
  await runTests();
  await deployToServers();
});

if (result.success) {
  console.log('Deployment successful!');
} else {
  console.error('Deployment failed:', result.error);
}
```

Run the example:
```bash
node complete-deployment-workflow.js
```

## See Also

- [Enterprise Integration Guide](../../ENTERPRISE-INTEGRATION.md)
- [Deployment Guide](../../DEPLOYMENT.md)
- [Main README](../../README.md)
