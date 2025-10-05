# GitHub MCP Server Deployment

> **🚀 Looking for Enterprise Integration?** Check out our comprehensive [**Enterprise Integration Guide**](./ENTERPRISE-INTEGRATION.md) for Slack, Jira, AWS, Azure, Kubernetes, and more!

## Quick Deploy with Docker

### 1. Using Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/balajirajput96/github-mcp-server-.git
cd github-mcp-server-

# Set up environment
cp .env.example .env
# Edit .env with your GitHub token

# Deploy
docker-compose up -d
```

### 2. Using Docker directly

```bash
# Build
docker build -t github-mcp-server .

# Run
docker run -e GITHUB_TOKEN=your_token_here github-mcp-server
```

### 3. Using prebuilt npm package

```bash
# Install globally
npm install -g github-mcp-server

# Run with environment variable
GITHUB_TOKEN=your_token github-mcp-server
```

## Production Deployment

### Railway

1. Fork this repository
2. Connect to Railway
3. Add GITHUB_TOKEN environment variable
4. Deploy

### Render

1. Fork this repository  
2. Create new Web Service on Render
3. Connect your fork
4. Add GITHUB_TOKEN environment variable
5. Deploy

### DigitalOcean App Platform

1. Fork this repository
2. Create new App on DigitalOcean
3. Connect your GitHub repository
4. Add GITHUB_TOKEN environment variable
5. Deploy

### Heroku

```bash
# Install Heroku CLI and login
heroku create your-mcp-server-name

# Set environment variables
heroku config:set GITHUB_TOKEN=your_token_here

# Deploy
git push heroku main
```

### AWS Lambda (Serverless)

For serverless deployment, the MCP server would need adaptation since it uses stdio transport. Consider using HTTP transport for Lambda deployment.

## Environment Configuration

### Required Variables

- `GITHUB_TOKEN`: Your GitHub Personal Access Token

### Optional Variables

- `NODE_ENV`: Set to 'production' for production deployments
- `LOG_LEVEL`: Control logging verbosity (debug, info, warn, error)

## Health Monitoring

The server logs to stderr for monitoring purposes. In production:

1. Set up log aggregation (ELK stack, Datadog, etc.)
2. Monitor error rates
3. Set up alerts for authentication failures
4. Monitor GitHub API rate limits

## Scaling

For high-traffic deployments:

1. Use connection pooling for GitHub API calls
2. Implement caching for frequently accessed data
3. Consider running multiple instances behind a load balancer
4. Monitor and respect GitHub API rate limits

## Security

1. Use secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)
2. Never commit tokens to version control
3. Use minimal required GitHub token scopes
4. Implement proper logging without exposing secrets
5. Use HTTPS/TLS for all communications