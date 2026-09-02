# Security Policy

## Overview

This GitHub MCP Server includes built-in security validation to detect and prevent the exposure of sensitive data such as tokens, API keys, and other credentials. These protections help ensure that sensitive information is not accidentally leaked through the MCP server or committed to repositories.

## Security Features

### 1. Input Validation

The server automatically validates user-provided input to detect sensitive patterns before processing. This includes:

- **GitHub Tokens**: Personal Access Tokens, OAuth tokens, Server-to-Server tokens, etc.
- **Slack Tokens**: OAuth tokens, Enterprise tokens, Bot tokens, etc.
- **AWS Credentials**: Access Key IDs and Secret Access Keys
- **Generic API Keys**: Common API key and secret key patterns
- **Bearer Tokens**: OAuth Bearer tokens
- **Private Keys**: SSH and cryptographic private keys
- **Google OAuth Tokens**: Google OAuth access tokens
- **Long Alphanumeric Strings**: Potential tokens that don't match specific patterns

### 2. Output Sanitization

All responses from the server are automatically sanitized to remove any accidentally exposed tokens. When a sensitive pattern is detected in the output:

- The token is replaced with a redacted placeholder: `[REDACTED_TOKEN_TYPE]`
- The type of token is indicated in the placeholder
- The original data structure is preserved

### 3. Smart Placeholder Detection

The security validator can distinguish between real credentials and placeholder values. Common placeholders are allowed:

- `your_token_here`
- `your_github_token_here`
- `example_token`
- `test_token`
- Strings containing `xxx` or `***`

## Detected Patterns

The following sensitive patterns are automatically detected:

### GitHub Tokens
```
ghp_[36 alphanumeric chars]  - Personal Access Token
gho_[36 alphanumeric chars]  - OAuth Access Token
ghu_[36 alphanumeric chars]  - User Access Token
ghs_[36 alphanumeric chars]  - Server-to-Server Token
ghr_[36 alphanumeric chars]  - Refresh Token
```

### Slack Tokens
```
xoxb-[numbers]-[numbers]-[alphanum]  - Bot Token
xoxp-[numbers]-[numbers]-[alphanum]  - User Token
xoxe.xoxp-1-[long string]            - OAuth Token
xoxe-1-[long string]                 - Enterprise Token
```

### AWS Credentials
```
AKIA[16 alphanumeric chars]          - AWS Access Key ID
aws_secret_access_key=[40 chars]     - AWS Secret Access Key
```

### Generic Patterns
```
api_key=...                          - API Keys
secret_key=...                       - Secret Keys
bearer [token]                       - Bearer Tokens
-----BEGIN PRIVATE KEY-----          - Private Keys
```

## Usage Examples

### Protected Operations

When using tools that accept user input (like `create_issue`), the content is automatically validated:

```javascript
// This will be rejected with a security error
{
  "name": "create_issue",
  "arguments": {
    "owner": "myorg",
    "repo": "myrepo",
    "title": "Bug report",
    "body": "My token is ghp_1234567890123456789012345678901234AB"
  }
}
// Error: Sensitive data detected in body: GitHub Personal Access Token at position 13
```

### Automatic Sanitization

Output data is automatically sanitized:

```javascript
// Original response from GitHub API (hypothetical)
{
  "issue": {
    "title": "My Issue",
    "body": "Secret: ghp_abc123...",
    "user": {...}
  }
}

// Sanitized response returned to user
{
  "issue": {
    "title": "My Issue", 
    "body": "Secret: [REDACTED_GITHUB_PERSONAL_ACCESS_TOKEN]",
    "user": {...}
  }
}
```

## Best Practices

### 1. Never Commit Secrets

- Always use environment variables for sensitive credentials
- Never hardcode tokens in source code
- Use `.env` files (which are gitignored) for local development
- Use secrets management systems in production

### 2. Minimal Token Permissions

- Use the minimum required GitHub token scopes:
  - `repo` - Full control of private repositories (only if needed)
  - `read:user` - Read access to user profile data
- Regularly rotate your tokens
- Revoke tokens that are no longer needed

### 3. Monitor for Exposed Secrets

The security validation will catch many common patterns, but you should also:

- Use GitHub's secret scanning feature
- Implement pre-commit hooks to scan for secrets
- Review pull requests carefully
- Use tools like `git-secrets` or `trufflehog`

### 4. Handle Security Errors Properly

When you receive a security validation error:

1. **Do NOT** try to work around the validation
2. Remove the sensitive data from your input
3. Use proper secrets management instead
4. If you believe it's a false positive, review the pattern

## Incident Response

### If You Accidentally Expose a Token

1. **Immediately revoke the token** at its source:
   - GitHub: https://github.com/settings/tokens
   - Slack: Your workspace's app management
   - AWS: IAM Console

2. **Generate a new token** with appropriate permissions

3. **Update your environment variables** with the new token

4. **Review access logs** to check if the token was used

5. **Notify your security team** if in an organization

### If You Find a Security Issue

Please report security vulnerabilities responsibly:

1. Do NOT open a public GitHub issue
2. Email the maintainers privately
3. Provide details about the vulnerability
4. Allow time for a fix before public disclosure

## Configuration

### Environment Variables

The server requires one environment variable:

```bash
GITHUB_TOKEN=your_github_personal_access_token
```

This token should be:
- Generated from GitHub settings
- Stored in a `.env` file (not committed)
- Have minimal required permissions
- Rotated regularly

### Logging

The server logs security events to stderr:
- Token detection attempts
- Validation failures
- Successful sanitization operations

Logs automatically sanitize any sensitive data before output.

## Testing Security Features

To test the security validation in your development environment:

```bash
# Run the included test script
node test-security-validation.js

# Or test manually with the MCP Inspector
npm run inspector
```

## Updates and Maintenance

The security patterns are regularly updated to detect new token formats and credential patterns. Keep your server updated to benefit from the latest security improvements:

```bash
npm update github-mcp-server
```

## Additional Resources

- [GitHub Token Best Practices](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Secret Scanning Best Practices](https://docs.github.com/en/code-security/secret-scanning)
- [MCP Security Guidelines](https://modelcontextprotocol.io/docs/security)

## Limitations

While this security validation provides a strong defense against common token exposure scenarios, it is not foolproof:

- Custom or proprietary token formats may not be detected
- Encoded or obfuscated secrets may bypass detection
- The validation cannot prevent all security issues
- Users should still follow security best practices

## License

This security implementation is part of the GitHub MCP Server and is licensed under the MIT License.
