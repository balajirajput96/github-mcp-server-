# GitHub MCP Server

A Model Context Protocol (MCP) server that provides GitHub API integration for AI agents and assistants. This server enables AI tools like Claude to interact with GitHub repositories, issues, pull requests, and more through a standardized interface.

## ✨ New: 100% FREE Tier Automation!

**🎉 Zero Cost Setup - No Credit Card Required!**

We've added complete automation for FREE tier deployments. Deploy to Vercel, Netlify, Render, or Railway without spending a penny!

- ✅ **One-Click Setup** - Complete setup in one command
- ✅ **Automated Setup Script** - Configure everything in 5 minutes
- ✅ **Health Check System** - Verify your setup automatically  
- ✅ **Auto-Deploy Script** - Deploy to FREE platforms with one command
- ✅ **Auto-Fix Script** - Automatically fix common issues
- ✅ **GitHub Actions** - Automated CI/CD included
- ✅ **Monthly Cost**: **$0.00** - Everything uses free tiers!

**One-Click Setup:**
```bash
./setup.sh  # Complete automated setup + deployment
```

**Or step-by-step:**
```bash
./scripts/auto-fix.sh          # Fix any issues
./scripts/free-tier-setup.sh   # Interactive setup
./scripts/health-check.sh      # Verify everything
./scripts/auto-deploy.sh       # Deploy automatically
```

📖 See [**FREE-TIER-GUIDE.md**](./FREE-TIER-GUIDE.md) for complete details!
📖 See [**AUTOMATION-SUMMARY.md**](./AUTOMATION-SUMMARY.md) for automation details!

## Features

- **Repository Management**: List, view, and access repository information
- **Issue Management**: List, create, and manage GitHub issues
- **Pull Request Operations**: View and manage pull requests
- **File Operations**: Read file contents from repositories
- **User Information**: Access authenticated user details
- **MCP Compliant**: Full Model Context Protocol support for seamless AI integration
- **Security**: Built-in validation to detect and prevent token/credential exposure
- **Enterprise Ready**: Complete integration support for Slack, Jira, AWS, Azure, GCP, Kubernetes, and more
- **100% FREE Deployment**: Automated scripts for zero-cost deployment

## Enterprise Integration

🚀 **New to Enterprise Integration?** Start with our [**Quick Start Guide**](./QUICK-START-ENTERPRISE.md) for a 5-minute setup!

For comprehensive enterprise deployment with integrations for Slack, project management tools (Jira, Trello, Asana), cloud platforms (AWS, Azure, GCP), container orchestration (Docker, Kubernetes), CI/CD pipelines (Jenkins, GitHub Actions), and monitoring tools, see our [**Enterprise Integration Guide**](./ENTERPRISE-INTEGRATION.md).

### Enterprise Features Include:
- 💬 **Slack Integration** - Real-time notifications and slash commands
- 📋 **Project Management** - Jira, Trello, Asana, Monday.com integrations
- ☁️ **Cloud Deployments** - AWS, Azure, GCP deployment guides
- 🐳 **Container Orchestration** - Docker and Kubernetes configurations
- 🔄 **CI/CD Pipelines** - Jenkins and GitHub Actions workflows
- 📊 **Monitoring** - Prometheus, Grafana, Sentry, and APM tools
- 🔐 **Security** - Secrets management, webhook verification, audit logging

## Quick Start

### 🚀 Option 1: One-Click Setup (Recommended)

**Complete automated setup and deployment in ONE command!**

```bash
# Clone the repository
git clone https://github.com/balajirajput96/github-mcp-server-.git
cd github-mcp-server-

# Run one-click setup (fixes issues, configures, deploys)
./setup.sh
```

**That's it!** The script will:
- ✅ Auto-fix any issues
- ✅ Run health checks
- ✅ Guide you through FREE service setup
- ✅ Install all dependencies automatically
- ✅ Build and test the project
- ✅ Create deployment configs
- ✅ Deploy to your chosen FREE platform

### Option 2: Step-by-Step Setup

**More control over each step:**

```bash
# Clone the repository
git clone https://github.com/balajirajput96/github-mcp-server-.git
cd github-mcp-server-

# Fix any issues automatically
./scripts/auto-fix.sh

# Run automated FREE tier setup
./scripts/free-tier-setup.sh

# Verify everything is working
./scripts/health-check.sh

# Deploy automatically
./scripts/auto-deploy.sh
```

### Option 3: Manual Setup

### Prerequisites

- Node.js 18 or later
- GitHub Personal Access Token

### Installation

1. Clone the repository:
```bash
git clone https://github.com/balajirajput96/github-mcp-server-.git
cd github-mcp-server-
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your GitHub token
```

4. Build the project:
```bash
npm run build
```

5. Run the server:
```bash
npm start
```

### Using with Claude Desktop

Add this configuration to your Claude Desktop config file:

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["/path/to/github-mcp-server/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

## Configuration

### Environment Variables

- `GITHUB_TOKEN`: Your GitHub Personal Access Token (required)
  - Generate at: https://github.com/settings/tokens
  - Required scopes: `repo`, `read:user`

### GitHub Token Setup

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select required scopes:
   - `repo` - Full control of private repositories
   - `read:user` - Read access to user profile data
4. Copy the generated token and add it to your `.env` file

## Available Tools

### Repository Tools
- `list_repositories` - List repositories for the authenticated user
- `get_repository` - Get detailed repository information

### Issue Tools
- `list_issues` - List issues for a repository
- `create_issue` - Create a new issue
- `get_issue` - Get a specific issue by number

### Pull Request Tools
- `list_pull_requests` - List pull requests for a repository
- `get_pull_request` - Get a specific pull request by number

### Commit Tools
- `get_commit` - Get a specific commit by SHA or reference

### Release Tools
- `get_release` - Get the latest release or a specific release by tag

### File Tools
- `get_file_content` - Get file content from a repository

### Resources
- `github://user` - Information about the authenticated user

## Development

### Build
```bash
npm run build
```

### Watch mode (development)
```bash
npm run dev
```

### Clean build
```bash
npm run clean
npm run build
```

### MCP Inspector
For debugging and testing:
```bash
npm run inspector
```

## 🤖 Automation Scripts

We provide several automation scripts to make deployment and maintenance effortless:

### 1. Free Tier Setup (`scripts/free-tier-setup.sh`)

Interactive wizard that configures ALL integrations using FREE tier services only:
- GitHub, Slack, Vercel, Netlify, Render, Railway, Sentry
- Creates all config files automatically
- **Total cost: $0.00/month**

```bash
./scripts/free-tier-setup.sh
```

### 2. Health Check (`scripts/health-check.sh`)

Validates your entire setup automatically:
- Checks Node.js version
- Verifies dependencies
- Tests TypeScript compilation
- Validates environment configuration
- Checks documentation

```bash
./scripts/health-check.sh
```

### 3. Auto Deploy (`scripts/auto-deploy.sh`)

Deploys to FREE platforms automatically:
- Runs health checks
- Builds the project
- Detects deployment platform
- Deploys with one command

```bash
./scripts/auto-deploy.sh
```

### 4. Enterprise Setup (`scripts/enterprise-setup.sh`)

Full enterprise integration setup (includes paid services):

```bash
./scripts/enterprise-setup.sh
```

## Docker Deployment

### Build Image
```bash
docker build -t github-mcp-server .
```

### Run Container
```bash
docker run -e GITHUB_TOKEN=your_token_here github-mcp-server
```

### Docker Compose
```yaml
version: '3.8'
services:
  github-mcp-server:
    build: .
    environment:
      - GITHUB_TOKEN=${GITHUB_TOKEN}
    volumes:
      - ./data:/app/data
```

## CI/CD

This project includes GitHub Actions workflows for:
- Automated testing on Node.js 18 and 20
- Docker image building
- Release artifact creation

## Usage Examples

### With Claude Desktop

Once configured, you can ask Claude to:

- "List my GitHub repositories"
- "Show me the open issues in my project repository"
- "Create a new issue in my repository with title 'Bug fix needed'"
- "Get the content of the README.md file from my repository"
- "Get issue #42 from my repository"
- "Show me pull request #15 from my repository"
- "Get the latest release from my repository"
- "Show me commit abc123 from my repository"

### Direct MCP Usage

```bash
# Start the server
node dist/index.js

# The server communicates via stdio using the MCP protocol
```

## API Documentation

This server implements the Model Context Protocol (MCP) specification. All tools and resources follow MCP standards for:
- Tool discovery and execution
- Resource listing and reading
- Error handling and responses

## Security

This server includes built-in security validation to protect against accidental token exposure:

- **Automatic Input Validation**: Detects and rejects sensitive data in user input (GitHub tokens, Slack tokens, AWS credentials, API keys, etc.)
- **Output Sanitization**: Automatically redacts sensitive patterns in responses
- **Smart Placeholder Detection**: Distinguishes between real credentials and placeholder values

For detailed security information, including:
- Complete list of detected patterns
- Best practices for token management
- Incident response procedures
- Testing security features

See our comprehensive [**Security Policy**](./SECURITY.md).

### Quick Security Tips

- Always use environment variables for sensitive data
- Never commit GitHub tokens to version control
- Use minimal required GitHub token scopes
- Run in containerized environments when possible
- Immediately revoke any accidentally exposed tokens

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the GitHub Issues page
2. Review the MCP documentation
3. Ensure your GitHub token has correct permissions

## 📚 Documentation

- **[FREE-TIER-GUIDE.md](./FREE-TIER-GUIDE.md)** - 100% free deployment guide (no credit card!)
- **[QUICK-START-ENTERPRISE.md](./QUICK-START-ENTERPRISE.md)** - 5-minute enterprise setup
- **[ENTERPRISE-INTEGRATION.md](./ENTERPRISE-INTEGRATION.md)** - Complete enterprise guide
- **[INTEGRATION-SUMMARY.md](./INTEGRATION-SUMMARY.md)** - All integrations overview
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment strategies
- **[SECURITY.md](./SECURITY.md)** - Security best practices
- **[MCP-COMPLIANCE.md](./MCP-COMPLIANCE.md)** - MCP protocol compliance
- **[PYTHON-CHATBOT-GUIDE.md](./PYTHON-CHATBOT-GUIDE.md)** - Python chatbot guide

## Additional Resources

### Python Chatbot Implementation Guide

For developers interested in building chatbots using Python, we've created a comprehensive guide:

📚 **[Python Chatbot Implementation Guide](./PYTHON-CHATBOT-GUIDE.md)** - A complete step-by-step guide covering:
- NLTK, spaCy, Rasa, ChatterBot, and OpenAI API implementations
- Neural network training for chatbots
- Flask web interface development
- Production deployment strategies
- Testing and performance evaluation

## Related Projects

- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [Claude Desktop](https://claude.ai/desktop)
- [GitHub REST API](https://docs.github.com/en/rest)
