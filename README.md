# GitHub MCP Server

A Model Context Protocol (MCP) server that provides GitHub API integration for AI agents and assistants. This server enables AI tools like Claude to interact with GitHub repositories, issues, pull requests, and more through a standardized interface.

## Features

- **Repository Management**: List, view, and access repository information
- **Issue Management**: List, create, and manage GitHub issues
- **Pull Request Operations**: View and manage pull requests
- **File Operations**: Read file contents from repositories
- **User Information**: Access authenticated user details
- **MCP Compliant**: Full Model Context Protocol support for seamless AI integration
- **Enterprise Ready**: Complete integration support for Slack, Jira, AWS, Azure, GCP, Kubernetes, and more

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

🔐 **Security is our top priority!** Please read our [Security Policy](./SECURITY.md) for detailed information.

### Quick Security Guidelines

- ⚠️ **NEVER commit tokens or secrets to the repository**
- ✅ Always use environment variables for sensitive data (`.env` files)
- ✅ Ensure `.env` files are in `.gitignore` (already configured)
- ✅ Use minimal required GitHub token scopes (`repo`, `read:user`)
- ✅ Enable secret scanning on your repository
- ✅ Run in containerized environments when possible
- 🔄 Rotate tokens regularly and revoke compromised ones immediately

### Secret Scanning

This repository includes automated secret scanning via GitHub Actions:
- **Gitleaks**: Detects secrets in code and git history
- **TruffleHog**: Finds high-entropy strings and verified secrets
- **Pattern Matching**: Checks for common token patterns (Slack, GitHub, AWS)

The secret scanning workflow runs on every push and pull request to prevent accidental token leaks.

### What to Do If You Accidentally Commit a Secret

1. **Revoke the secret immediately** (GitHub, Slack, AWS, etc.)
2. Generate a new secret and update your local environment
3. Contact the repository maintainers for help cleaning git history
4. Review our [Security Policy](./SECURITY.md) for detailed steps

### Pre-commit Hook (Recommended)

Install Gitleaks to catch secrets before committing:

```bash
# macOS
brew install gitleaks

# Run before committing
gitleaks detect --source . --verbose
```

For more information, see the [Security Policy](./SECURITY.md).

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
