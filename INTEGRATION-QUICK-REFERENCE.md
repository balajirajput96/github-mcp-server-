# 🚀 Integration Quick Reference

Quick commands and code snippets for using the GitHub MCP Server integrations.

## 📦 Installation

All integration dependencies are automatically installed:

```bash
npm install
```

The following optional dependencies are included:
- `@slack/web-api` - Slack integration
- `axios` - HTTP client for Jira and other APIs

## 🧪 Testing Integrations

### Test All Integrations
```bash
npm run test:integrations
```

This validates:
- ✅ All dependencies are installed
- ✅ Integration modules load correctly
- ✅ Environment variables are configured
- ✅ Provides setup instructions for missing configuration

### Test Individual Integrations

**Slack:**
```bash
npm run example:slack
```

**Jira:**
```bash
npm run example:jira
```

**Complete Workflow:**
```bash
npm run example:workflow
```

## 🔧 Environment Setup

Create a `.env` file in the project root:

```bash
# Required
GITHUB_TOKEN=ghp_your_github_token

# Slack Integration (Optional)
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL_ID=C0123456789

# Jira Integration (Optional)
JIRA_URL=https://your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-jira-api-token
JIRA_PROJECT_KEY=PROJ

# Deployment Configuration (Optional)
DEPLOYMENT_VERSION=v1.0.0
DEPLOYMENT_ENVIRONMENT=staging
DEPLOYMENT_USER=deploy-bot
```

## 💬 Slack Integration

### Basic Usage

```javascript
const SlackNotifier = require('./examples/integrations/slack-notifications.cjs');

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

// Send custom message
await notifier.sendMessage('Custom Alert', 'Something happened!', 'warning');
```

### Setting Up Slack

1. Create a Slack App at https://api.slack.com/apps
2. Add "Bot Token Scopes":
   - `chat:write`
   - `chat:write.public`
3. Install the app to your workspace
4. Copy the "Bot User OAuth Token" (starts with `xoxb-`)
5. Get your channel ID (right-click channel → View channel details)
6. Add to `.env` file

## 📋 Jira Integration

### Basic Usage

```javascript
const JiraIntegration = require('./examples/integrations/jira-automation.cjs');

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

// Search issues
const issues = await jira.searchIssues('project = PROJ AND status = "In Progress"');
```

### Setting Up Jira

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Copy the token
4. Get your Jira URL (e.g., https://your-company.atlassian.net)
5. Use your Atlassian account email
6. Add to `.env` file

## 🔄 Complete Deployment Workflow

### Run the Full Workflow

```bash
npm run example:workflow
```

### Customize Parameters

```bash
DEPLOYMENT_VERSION=v2.0.0 \
DEPLOYMENT_ENVIRONMENT=production \
DEPLOYMENT_USER=john.doe \
npm run example:workflow
```

### Use in Your Code

```javascript
const { deployWithIntegrations } = require('./examples/integrations/complete-deployment-workflow.cjs');

// Perform deployment with all integrations
await deployWithIntegrations('v1.2.3', 'staging', 'deploy-bot');
```

## 📊 NPM Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Build the TypeScript project |
| `npm run dev` | Watch mode for development |
| `npm start` | Start the MCP server |
| `npm run clean` | Clean build artifacts |
| `npm run inspector` | Run MCP inspector for debugging |
| `npm run test:integrations` | Test all integrations |
| `npm run example:slack` | Run Slack integration example |
| `npm run example:jira` | Run Jira integration example |
| `npm run example:workflow` | Run complete deployment workflow |
| `npm run setup:enterprise` | Interactive enterprise setup wizard |
| `npm run check-secrets` | Check for exposed secrets |

## 🎯 Common Workflows

### 1. First-Time Setup

```bash
# Clone and install
git clone https://github.com/balajirajput96/github-mcp-server-.git
cd github-mcp-server-
npm install

# Configure environment
cp .env.example .env
# Edit .env with your tokens

# Build project
npm run build

# Test integrations
npm run test:integrations
```

### 2. Add Slack Notifications to Deployment

```javascript
const SlackNotifier = require('./examples/integrations/slack-notifications.cjs');

async function deploy() {
  const slack = new SlackNotifier(
    process.env.SLACK_BOT_TOKEN,
    process.env.SLACK_CHANNEL_ID
  );

  try {
    await slack.notifyDeploymentStarted('production', 'v1.0.0', 'bot');
    
    // Your deployment logic here
    await performDeployment();
    
    await slack.notifyDeploymentSuccess('production', 'v1.0.0', '5m', 'bot');
  } catch (error) {
    await slack.notifyDeploymentFailure('production', 'v1.0.0', error.message, 'bot');
    throw error;
  }
}
```

### 3. Auto-Create Jira Issues on Failures

```javascript
const JiraIntegration = require('./examples/integrations/jira-automation.cjs');

async function deployWithTracking() {
  const jira = new JiraIntegration(
    process.env.JIRA_URL,
    process.env.JIRA_EMAIL,
    process.env.JIRA_API_TOKEN,
    'PROJ'
  );

  try {
    await performDeployment();
  } catch (error) {
    // Automatically create bug report
    await jira.createBugFromFailure(
      'Deployment failed',
      error.stack,
      'v1.0.0',
      'production'
    );
    throw error;
  }
}
```

### 4. Full Integration Pipeline

Use the complete workflow example that includes:
- Slack notifications at each step
- Jira issue creation for tracking
- Automatic bug reporting on failures
- Graceful handling of missing integrations

```bash
npm run example:workflow
```

## 📚 Documentation

- [README.md](./README.md) - Main documentation
- [QUICK-START-ENTERPRISE.md](./QUICK-START-ENTERPRISE.md) - Quick setup guide
- [ENTERPRISE-INTEGRATION.md](./ENTERPRISE-INTEGRATION.md) - Full integration guide
- [examples/integrations/README.md](./examples/integrations/README.md) - Integration examples
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment options

## 🆘 Troubleshooting

### Dependencies Not Found

```bash
# Reinstall dependencies
npm install
```

### Module Not Found Errors

Ensure you're using the correct file extensions:
- Integration files use `.cjs` extension (CommonJS)
- Main TypeScript files compile to `.js` (ES modules)

```javascript
// ✅ Correct
require('./slack-notifications.cjs')

// ❌ Wrong
require('./slack-notifications.js')
```

### Environment Variables Not Loading

```bash
# Check .env file exists and is in project root
ls -la .env

# View contents (be careful not to share secrets)
cat .env | grep -v TOKEN | grep -v SECRET
```

### Integration Tests Failing

```bash
# Run with verbose output
npm run test:integrations

# Check individual integrations
npm run example:slack
npm run example:jira
```

## 🎓 Learning Resources

### Video Tutorials
- [Slack Bot Setup](https://api.slack.com/start)
- [Jira REST API Guide](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)

### Example Projects
- See `examples/integrations/` directory for working examples
- Each file includes inline documentation and usage examples

### Community
- GitHub Issues: Report problems or ask questions
- Pull Requests: Contribute improvements

---

**Need More Help?**

Run the integration test to get personalized setup instructions:

```bash
npm run test:integrations
```

The test will check your configuration and provide specific next steps!
