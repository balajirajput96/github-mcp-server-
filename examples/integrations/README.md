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

## Installation

These examples require additional dependencies:

```bash
npm install @slack/web-api axios
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
```

## Integration Workflow Example

Here's a complete example that combines multiple integrations:

```javascript
const SlackNotifier = require('./slack-notifications');
const JiraIntegration = require('./jira-automation');

async function deployWithIntegrations(version, environment) {
  const slack = new SlackNotifier(
    process.env.SLACK_BOT_TOKEN,
    process.env.SLACK_CHANNEL_ID
  );
  
  const jira = new JiraIntegration(
    process.env.JIRA_URL,
    process.env.JIRA_EMAIL,
    process.env.JIRA_API_TOKEN,
    'PROJ'
  );

  try {
    // 1. Notify deployment started
    await slack.notifyDeploymentStarted(environment, version, 'deploy-bot');
    
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
    
    // 5. Notify success
    await slack.notifyDeploymentSuccess(
      environment,
      version,
      duration,
      'deploy-bot'
    );
    
  } catch (error) {
    // Handle failure
    await slack.notifyDeploymentFailure(
      environment,
      version,
      error.message,
      'deploy-bot'
    );
    
    await jira.createBugFromFailure(
      'Deployment failed',
      error.stack,
      version,
      environment
    );
    
    throw error;
  }
}
```

## Additional Integrations

Want to add more integrations? Here are some suggestions:

1. **Trello** - Card automation for deployment tracking
2. **Microsoft Teams** - Deployment notifications
3. **PagerDuty** - Incident creation on failures
4. **DataDog** - Deployment markers
5. **New Relic** - Deployment annotations
6. **Email** - Stakeholder notifications

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
```

## See Also

- [Enterprise Integration Guide](../../ENTERPRISE-INTEGRATION.md)
- [Deployment Guide](../../DEPLOYMENT.md)
- [Main README](../../README.md)
