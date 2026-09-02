# ⚡ Enterprise Quick Start Guide

Get your complete enterprise integration up and running in minutes!

## 🚀 5-Minute Setup

### Step 1: Clone and Install (1 min)
```bash
git clone https://github.com/balajirajput96/github-mcp-server-.git
cd github-mcp-server-
npm install
```

### Step 2: Configure Environment (2 min)
```bash
# Run interactive setup wizard
./scripts/enterprise-setup.sh

# OR manually create .env
cp .env.example .env
# Edit .env with your tokens
```

### Step 3: Build (1 min)
```bash
npm run build
```

### Step 4: Deploy (1 min)

**Option A - Local:**
```bash
npm start
```

**Option B - Docker:**
```bash
docker-compose up -d
```

**Option C - Kubernetes:**
```bash
kubectl create namespace github-mcp
kubectl create secret generic github-mcp-secrets \
  --from-literal=github-token=YOUR_TOKEN \
  -n github-mcp
kubectl apply -f k8s/ -n github-mcp
```

---

## 🎯 Common Use Cases

### 1. Deploy with Slack Notifications

```javascript
const SlackNotifier = require('./examples/integrations/slack-notifications');

const notifier = new SlackNotifier(
  process.env.SLACK_BOT_TOKEN,
  process.env.SLACK_CHANNEL_ID
);

await notifier.notifyDeploymentStarted('production', 'v1.0.0', 'bot');
// ... deploy ...
await notifier.notifyDeploymentSuccess('production', 'v1.0.0', '2m', 'bot');
```

### 2. Auto-create Jira Issues on Failure

```javascript
const JiraIntegration = require('./examples/integrations/jira-automation');

const jira = new JiraIntegration(
  process.env.JIRA_URL,
  process.env.JIRA_EMAIL,
  process.env.JIRA_API_TOKEN,
  'PROJ'
);

try {
  await deploy();
} catch (error) {
  await jira.createBugFromFailure(
    'Deployment failed',
    error.stack,
    'v1.0.0',
    'production'
  );
}
```

### 3. Deploy to Multiple Platforms

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod
```

**Heroku:**
```bash
git push heroku main
```

**AWS:**
```bash
aws s3 sync ./dist s3://your-bucket --delete
```

---

## 📋 Essential Environment Variables

```bash
# Required
GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# Slack (Optional)
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxx
SLACK_SIGNING_SECRET=xxxxxxxxxxxx
SLACK_CHANNEL_ID=C0123456789

# Jira (Optional)
JIRA_URL=https://company.atlassian.net
JIRA_EMAIL=you@company.com
JIRA_API_TOKEN=xxxxxxxxxxxx

# AWS (Optional)
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxx
AWS_REGION=us-east-1
```

---

## 🔧 Troubleshooting

### Build Fails
```bash
npm run clean
npm install
npm run build
```

### Docker Issues
```bash
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### Kubernetes Pod Not Starting
```bash
kubectl describe pod POD_NAME -n github-mcp
kubectl logs POD_NAME -n github-mcp
```

### Environment Variables Not Loading
```bash
# Check .env file exists
cat .env

# Restart application
npm start
```

---

## 📚 Documentation Quick Links

- **Full Enterprise Guide**: [ENTERPRISE-INTEGRATION.md](./ENTERPRISE-INTEGRATION.md)
- **Deployment Options**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Kubernetes Setup**: [k8s/README.md](./k8s/README.md)
- **Integration Examples**: [examples/integrations/README.md](./examples/integrations/README.md)
- **Integration Summary**: [INTEGRATION-SUMMARY.md](./INTEGRATION-SUMMARY.md)

---

## ✅ Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Build succeeds (`npm run build`)
- [ ] Tests pass (if applicable)
- [ ] Slack integration tested
- [ ] Jira integration tested
- [ ] Docker image built
- [ ] Kubernetes secrets created
- [ ] SSL/TLS certificates configured
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Documentation reviewed

---

## 🎉 You're Ready!

Your enterprise integration hub is configured and ready to deploy!

Choose your deployment method and get started:
- 🐳 Docker for quick deployment
- ☸️ Kubernetes for production scale
- ☁️ Cloud platforms for managed services

**Need help?** Check the comprehensive [ENTERPRISE-INTEGRATION.md](./ENTERPRISE-INTEGRATION.md) guide!

---

**Happy deploying! 🚀**
