# Security Policy

## Reporting Security Vulnerabilities

We take the security of the GitHub MCP Server seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email security concerns to the repository maintainers
3. Include detailed information about the vulnerability:
   - Description of the issue
   - Steps to reproduce
   - Potential impact
   - Suggested fixes (if any)

### Response Timeline

- We aim to acknowledge receipt within 48 hours
- We will provide an initial assessment within 5 business days
- We will work on a fix and coordinate disclosure

## Security Best Practices

### Token Management

**NEVER commit tokens or secrets to the repository!**

Common token patterns to avoid:
- GitHub Personal Access Tokens: `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`
- Slack Tokens: `xoxb-`, `xoxp-`, `xoxe-`, `xoxe.xoxp-`
- AWS Keys: `AKIA`, `ASIA`
- Azure Keys: Various patterns
- API Keys and secrets of any kind

### Protecting Your Tokens

1. **Use Environment Variables**
   ```bash
   # Always use .env files (never commit them)
   GITHUB_TOKEN=your_token_here
   ```

2. **Check .gitignore**
   - Ensure `.env` and `.env.*` files are in `.gitignore`
   - Verify the file is properly ignored before committing

3. **Use Secret Scanning**
   - Enable GitHub Secret Scanning on your repository
   - Use pre-commit hooks to detect secrets locally
   - Review the GitHub Actions workflow for secret detection

4. **Rotate Compromised Tokens Immediately**
   - If you accidentally commit a token, revoke it immediately
   - Generate a new token
   - Update your local environment
   - Clear Git history if needed (contact maintainers)

### GitHub Token Permissions

For this MCP server, your GitHub token needs:
- ✅ `repo` - Full control of private repositories
- ✅ `read:user` - Read access to user profile data

**Minimum required permissions only!**

### Pre-commit Hook Setup

Install a pre-commit hook to catch secrets before they're committed:

```bash
# Install gitleaks or similar tool
# macOS
brew install gitleaks

# Linux
wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks-linux-amd64
chmod 755 gitleaks-linux-amd64
sudo mv gitleaks-linux-amd64 /usr/local/bin/gitleaks

# Run gitleaks before committing
gitleaks detect --source . --verbose
```

### Environment Security

1. **Development**
   - Use separate tokens for development and production
   - Never use production tokens locally
   - Clear console logs before sharing screenshots

2. **Production**
   - Use secure secret management (AWS Secrets Manager, HashiCorp Vault, etc.)
   - Rotate tokens regularly
   - Monitor token usage and audit logs
   - Use least-privilege access

3. **CI/CD**
   - Store secrets in GitHub Secrets
   - Never log secret values
   - Use masked output in workflows

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Known Security Considerations

### GitHub API Rate Limits
- Authenticated requests: 5,000 requests per hour
- Monitor usage to prevent service disruption
- Implement caching where appropriate

### Token Exposure Risks
- Tokens in environment variables
- Tokens in process memory
- Tokens in logs
- Tokens in error messages

### Mitigation Strategies
- Use short-lived tokens when possible
- Implement proper error handling
- Sanitize logs and error outputs
- Use secure transport (HTTPS/TLS)

## Security Features

This repository includes:
- ✅ `.gitignore` rules for common secret files
- ✅ GitHub Actions secret scanning workflow
- ✅ Environment variable validation
- ✅ Secure error handling

## Incident Response

If tokens or secrets are accidentally committed:

1. **Immediate Actions**
   - Revoke the compromised token/secret immediately
   - Generate new credentials
   - Update all systems using the old credentials

2. **Repository Cleanup**
   - DO NOT just delete the file and commit
   - Tokens remain in Git history
   - Use `git filter-branch` or BFG Repo-Cleaner to remove from history
   - Force push to overwrite history (coordinate with team)

3. **Notification**
   - Notify all team members
   - Update documentation
   - Review access logs for unauthorized usage

## Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Secret Scanning Documentation](https://docs.github.com/en/code-security/secret-scanning)

## Contact

For security concerns, please contact the repository maintainers through:
- GitHub Issues (for non-sensitive matters)
- Email (for sensitive security disclosures)

---

**Remember: Security is everyone's responsibility. When in doubt, ask!**
