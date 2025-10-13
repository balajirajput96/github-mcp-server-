# Microsoft 365 Integration Guide

This guide provides comprehensive instructions for integrating the GitHub MCP Server with Microsoft 365 services and tools.

## 📋 Table of Contents

- [Microsoft Teams](#microsoft-teams)
- [Outlook/Exchange Email](#outlook-exchange-email)
- [Microsoft Graph API](#microsoft-graph-api)
- [Power Automate](#power-automate)
- [Azure Active Directory](#azure-active-directory)
- [SharePoint](#sharepoint)
- [OneDrive](#onedrive)
- [Complete Integration Example](#complete-integration-example)

---

## 💬 Microsoft Teams

### Incoming Webhooks

The simplest way to send notifications to Teams.

#### Setup

1. **Create Incoming Webhook in Teams:**
   - Navigate to your Teams channel
   - Click ⋯ (More options) next to the channel name
   - Select "Connectors"
   - Find "Incoming Webhook" and click "Configure"
   - Name your webhook (e.g., "GitHub MCP Notifications")
   - Upload an icon (optional)
   - Click "Create"
   - Copy the webhook URL

2. **Configure Environment:**
```bash
export TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...
```

3. **Send Notifications:**
```javascript
const TeamsNotifier = require('./examples/integrations/teams-notifications');

const notifier = new TeamsNotifier(process.env.TEAMS_WEBHOOK_URL);

// Send deployment notification
await notifier.notifyDeploymentStarted('production', 'v1.2.3', 'deploy-bot');
await notifier.notifyDeploymentSuccess('production', 'v1.2.3', '3m 45s', 'deploy-bot');
```

### Adaptive Cards

For richer, more interactive notifications.

#### Example Adaptive Card

```javascript
const axios = require('axios');

const adaptiveCard = {
  "type": "message",
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.4",
        "body": [
          {
            "type": "TextBlock",
            "text": "🚀 Deployment Notification",
            "weight": "Bolder",
            "size": "Large"
          },
          {
            "type": "FactSet",
            "facts": [
              {
                "title": "Environment:",
                "value": "Production"
              },
              {
                "title": "Version:",
                "value": "v1.2.3"
              },
              {
                "title": "Status:",
                "value": "✅ Success"
              },
              {
                "title": "Duration:",
                "value": "3m 45s"
              }
            ]
          }
        ],
        "actions": [
          {
            "type": "Action.OpenUrl",
            "title": "View Deployment",
            "url": "https://github.com/user/repo/deployments"
          },
          {
            "type": "Action.OpenUrl",
            "title": "View Logs",
            "url": "https://github.com/user/repo/actions"
          }
        ]
      }
    }
  ]
};

await axios.post(process.env.TEAMS_WEBHOOK_URL, adaptiveCard);
```

Design your own adaptive cards: https://adaptivecards.io/designer/

---

## 📧 Outlook/Exchange Email

### SMTP Configuration (Office 365)

#### Setup

```bash
export SMTP_HOST=smtp.office365.com
export SMTP_PORT=587
export SMTP_USER=your-email@company.com
export SMTP_PASS=your-password
export SMTP_FROM_EMAIL=deployments@company.com
export SMTP_TO_EMAILS=team@company.com,stakeholders@company.com
```

#### Usage

```javascript
const EmailNotifier = require('./examples/integrations/email-notifications');

const notifier = new EmailNotifier({
  host: 'smtp.office365.com',
  port: 587,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  fromEmail: 'deployments@company.com',
  toEmails: ['team@company.com', 'stakeholders@company.com']
});

await notifier.notifyDeploymentSuccess('production', 'v1.2.3', '3m 45s', 'deploy-bot');
```

#### Using App Passwords (Recommended)

For better security, use App Passwords:

1. Go to Microsoft Account Security
2. Enable Two-Step Verification
3. Generate App Password for your application
4. Use App Password instead of regular password

---

## 🔗 Microsoft Graph API

For advanced scenarios, use Microsoft Graph to interact with M365 services.

### Setup

1. **Register App in Azure AD:**
   - Go to https://portal.azure.com
   - Navigate to Azure Active Directory → App registrations
   - Click "New registration"
   - Name your app (e.g., "GitHub MCP Server")
   - Select account types
   - Add redirect URI (optional)
   - Click "Register"

2. **Configure Permissions:**
   - In your app, go to "API permissions"
   - Click "Add a permission"
   - Select "Microsoft Graph"
   - Add required permissions:
     - `Mail.Send` - Send emails
     - `ChannelMessage.Send` - Post to Teams channels
     - `Files.ReadWrite.All` - Access OneDrive/SharePoint
     - `User.Read` - Read user profiles

3. **Create Client Secret:**
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Add description and expiry
   - Copy the secret value (save it securely)

4. **Configure Environment:**
```bash
export AZURE_TENANT_ID=your-tenant-id
export AZURE_CLIENT_ID=your-client-id
export AZURE_CLIENT_SECRET=your-client-secret
```

### Example: Send Email via Graph API

```javascript
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

// Get access token
const getAccessToken = async () => {
  const tokenEndpoint = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams({
    client_id: process.env.AZURE_CLIENT_ID,
    client_secret: process.env.AZURE_CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    body: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const data = await response.json();
  return data.access_token;
};

// Initialize Graph client
const initGraphClient = async () => {
  const accessToken = await getAccessToken();
  
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });
};

// Send email
const sendEmail = async (subject, body, recipients) => {
  const client = await initGraphClient();

  const message = {
    subject: subject,
    body: {
      contentType: 'HTML',
      content: body
    },
    toRecipients: recipients.map(email => ({
      emailAddress: { address: email }
    }))
  };

  await client.api('/users/deployments@company.com/sendMail')
    .post({ message });
};

// Usage
await sendEmail(
  '🚀 Deployment Successful',
  '<h1>Production deployment completed</h1><p>Version v1.2.3 deployed in 3m 45s</p>',
  ['team@company.com', 'stakeholders@company.com']
);
```

### Example: Post to Teams Channel

```javascript
const postToTeamsChannel = async (teamId, channelId, message) => {
  const client = await initGraphClient();

  const chatMessage = {
    body: {
      contentType: 'html',
      content: message
    }
  };

  await client.api(`/teams/${teamId}/channels/${channelId}/messages`)
    .post(chatMessage);
};

// Usage
await postToTeamsChannel(
  'team-id',
  'channel-id',
  '<h2>🚀 Deployment Successful</h2><p>Production deployment completed in 3m 45s</p>'
);
```

---

## ⚡ Power Automate

Create automated workflows that trigger on webhooks.

### Setup

1. **Create Flow:**
   - Go to https://flow.microsoft.com
   - Click "Create" → "Automated cloud flow"
   - Choose "When a HTTP request is received"
   - Design your flow (send email, post to Teams, create task, etc.)
   - Save the flow and copy the HTTP POST URL

2. **Configure Webhook:**
```bash
export POWER_AUTOMATE_WEBHOOK=https://prod-xx.xxx.logic.azure.com/workflows/...
```

3. **Trigger Flow:**
```javascript
const axios = require('axios');

const triggerPowerAutomate = async (data) => {
  await axios.post(process.env.POWER_AUTOMATE_WEBHOOK, {
    event: 'deployment_completed',
    environment: 'production',
    version: 'v1.2.3',
    duration: '3m 45s',
    timestamp: new Date().toISOString(),
    ...data
  });
};

// Usage
await triggerPowerAutomate({
  status: 'success',
  deployer: 'deploy-bot'
});
```

### Example Flow Ideas

1. **Deployment Notification Flow:**
   - Receive webhook → Parse JSON → Post to Teams → Send email

2. **Incident Management Flow:**
   - Receive webhook → Create Planner task → Notify team → Create SharePoint item

3. **Approval Flow:**
   - Receive webhook → Request approval → If approved, trigger deployment

---

## 🔐 Azure Active Directory

### Authentication

Use Azure AD for secure authentication.

```javascript
const msal = require('@azure/msal-node');

const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET
  }
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

// Get token
const tokenRequest = {
  scopes: ['https://graph.microsoft.com/.default']
};

const response = await cca.acquireTokenByClientCredential(tokenRequest);
const accessToken = response.accessToken;
```

---

## 📁 SharePoint

### Store Deployment Logs

```javascript
const storeDeploymentLog = async (version, environment, logs) => {
  const client = await initGraphClient();

  const fileContent = JSON.stringify({
    version,
    environment,
    timestamp: new Date().toISOString(),
    logs
  }, null, 2);

  const fileName = `deployment-${version}-${Date.now()}.json`;

  await client.api('/sites/{site-id}/drive/root:/Deployments/${fileName}:/content')
    .put(fileContent);
};
```

---

## 💾 OneDrive

### Backup Configuration

```javascript
const backupConfiguration = async (configData) => {
  const client = await initGraphClient();

  const fileName = `config-backup-${Date.now()}.json`;
  const content = JSON.stringify(configData, null, 2);

  await client.api('/me/drive/root:/Backups/${fileName}:/content')
    .put(content);
};
```

---

## 🎯 Complete Integration Example

Here's a complete example integrating multiple M365 services:

```javascript
const DeploymentWorkflow = require('./examples/integrations/complete-deployment-workflow');
const { Client } = require('@microsoft/microsoft-graph-client');

class M365DeploymentWorkflow extends DeploymentWorkflow {
  constructor(config) {
    super(config);
    this.graphClient = null;
  }

  async initGraph() {
    if (!this.graphClient) {
      const accessToken = await this.getAccessToken();
      this.graphClient = Client.init({
        authProvider: (done) => done(null, accessToken)
      });
    }
    return this.graphClient;
  }

  async getAccessToken() {
    // Implementation from Graph API section
  }

  async deploy(environment, version, deployFunction) {
    // Call parent deploy
    const result = await super.deploy(environment, version, deployFunction);

    // Additional M365 integrations
    const client = await this.initGraph();

    // Store deployment log in SharePoint
    await this.storeInSharePoint(client, result);

    // Create Teams meeting for post-deployment review (if failed)
    if (!result.success) {
      await this.schedulePostMortem(client, result);
    }

    // Backup configuration to OneDrive
    await this.backupToOneDrive(client, result);

    return result;
  }

  async storeInSharePoint(client, result) {
    const logContent = JSON.stringify(result, null, 2);
    await client.api('/sites/{site-id}/drive/root:/Logs/${filename}:/content')
      .put(logContent);
  }

  async schedulePostMortem(client, result) {
    const meeting = {
      subject: `Post-Mortem: Deployment Failure ${result.version}`,
      start: {
        dateTime: new Date(Date.now() + 3600000).toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: new Date(Date.now() + 5400000).toISOString(),
        timeZone: 'UTC'
      },
      body: {
        contentType: 'HTML',
        content: `<h2>Deployment Failure Review</h2><p>${result.error}</p>`
      }
    };

    await client.api('/me/events').post(meeting);
  }

  async backupToOneDrive(client, result) {
    const backup = {
      timestamp: new Date().toISOString(),
      deployment: result
    };
    
    await client.api('/me/drive/root:/Backups/${filename}:/content')
      .put(JSON.stringify(backup, null, 2));
  }
}

// Usage
const workflow = new M365DeploymentWorkflow({
  // ... configuration
  azureConfig: {
    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET
  }
});

await workflow.deploy('production', 'v1.2.3', deployFunction);
```

---

## 📦 Required Packages

Install required npm packages:

```bash
npm install @microsoft/microsoft-graph-client isomorphic-fetch @azure/msal-node
```

---

## 🔑 Best Practices

1. **Use App Passwords** for SMTP instead of regular passwords
2. **Limit Graph API permissions** to only what's needed
3. **Rotate client secrets** regularly
4. **Use managed identities** when running in Azure
5. **Implement token caching** to reduce API calls
6. **Handle rate limits** gracefully
7. **Log all API interactions** for debugging
8. **Test in development** before production deployment

---

## 🆘 Troubleshooting

### Teams Webhook Not Working

- Verify webhook URL is correct
- Check if webhook is enabled in Teams
- Ensure JSON payload is valid
- Check for firewall/proxy issues

### Graph API Authentication Errors

- Verify tenant ID, client ID, and client secret
- Check API permissions are granted and consented
- Ensure app registration is not expired
- Verify token endpoint URL

### Email Not Sending

- Check SMTP credentials
- Verify port is not blocked
- Use App Password if 2FA is enabled
- Check spam/junk folders

---

## 📚 Additional Resources

- [Microsoft Graph Documentation](https://docs.microsoft.com/en-us/graph/)
- [Teams Incoming Webhooks](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)
- [Adaptive Cards Designer](https://adaptivecards.io/designer/)
- [Power Automate Documentation](https://docs.microsoft.com/en-us/power-automate/)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

---

**Happy integrating with Microsoft 365! 🚀**
