# Token Exposure Response Guide

## 🚨 If You Exposed a Token in a Commit

**Act immediately! Every second counts.**

### Step 1: Revoke the Exposed Token (URGENT - Do This First!)

#### GitHub Token
1. Go to https://github.com/settings/tokens
2. Find the exposed token
3. Click "Delete" or "Revoke"
4. Confirm the revocation

#### Slack Token
1. Go to https://api.slack.com/apps
2. Select your app
3. Navigate to "OAuth & Permissions"
4. Click "Revoke" next to the token

#### Other Services
- **AWS:** Use AWS Console or CLI to delete/rotate credentials
- **Azure:** Revoke in Azure Portal → Active Directory
- **GCP:** Revoke in Google Cloud Console → IAM & Admin

### Step 2: Remove Token from Git History

#### If You Haven't Pushed Yet
```bash
# Reset the last commit
git reset --soft HEAD~1

# Or if you need to go back multiple commits
git reset --soft HEAD~<number_of_commits>

# Re-commit without the token
# Make sure token is in .env, not in code!
git add .
git commit -m "Fix: Remove exposed credentials"
```

#### If You Already Pushed
```bash
# DO NOT try to force push to public repositories
# This can cause issues for other developers

# Option 1: Contact repository administrators
# They have tools to handle this properly

# Option 2: If you own the repository and it's private
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch <file-with-token>" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (USE WITH CAUTION)
git push origin --force --all
git push origin --force --tags
```

⚠️ **Warning:** Force pushing can disrupt other developers. Consider the repository as compromised and rotate all credentials.

### Step 3: Generate New Token

1. **GitHub:** https://github.com/settings/tokens/new
   - Select scopes: `repo`, `read:user`
   - Set expiration (recommended: 90 days)
   
2. **Slack:** https://api.slack.com/apps → Your App → OAuth & Permissions
   - Reinstall app to workspace if needed

3. **Store Securely:**
   ```bash
   # Add to .env file (already in .gitignore)
   echo "GITHUB_TOKEN=your_new_token_here" >> .env
   ```

### Step 4: Audit and Monitor

1. **Check repository access logs**
   - Look for unauthorized access
   - Review recent API calls

2. **GitHub:** Check https://github.com/settings/security-log

3. **Slack:** Check workspace audit logs

4. **Monitor for:**
   - Unusual API activity
   - Unauthorized repository access
   - Strange commits or changes

### Step 5: Notify Stakeholders

If the exposed token had access to:
- **Organization data:** Notify your organization's security team
- **Production systems:** Alert DevOps/SRE teams
- **Customer data:** Follow your data breach protocol

### Step 6: Prevent Future Exposures

1. **Use git hooks to prevent commits with tokens:**
   ```bash
   # Install pre-commit hook
   cat > .git/hooks/pre-commit << 'EOF'
   #!/bin/bash
   if git diff --cached | grep -E "(ghp_|xoxb-|xoxp-|xoxe-|AKIA|ya29\.)"; then
     echo "ERROR: Possible token detected in commit!"
     echo "Please remove tokens and use environment variables instead."
     exit 1
   fi
   EOF
   chmod +x .git/hooks/pre-commit
   ```

2. **Enable secret scanning:**
   - For GitHub: Enable in repository settings → Security
   - Use GitHub Advanced Security if available

3. **Use .env files:**
   ```bash
   # Always store tokens here
   GITHUB_TOKEN=your_token
   SLACK_BOT_TOKEN=your_token
   ```

4. **Install git-secrets:**
   ```bash
   # macOS
   brew install git-secrets
   
   # Configure for this repository
   git secrets --install
   git secrets --register-aws
   ```

## Prevention Checklist

Before committing:
- [ ] Check that `.env` is in `.gitignore`
- [ ] Verify no tokens in code files
- [ ] Use `git diff --cached` to review changes
- [ ] Run `git secrets --scan` if installed
- [ ] Use environment variables for all secrets

## Tools to Help

### Secret Scanning Tools
- [gitleaks](https://github.com/zricethezav/gitleaks) - Find secrets in git repos
- [truffleHog](https://github.com/trufflesecurity/trufflehog) - Search for secrets in git
- [git-secrets](https://github.com/awslabs/git-secrets) - Prevent committing secrets

### Installation
```bash
# Install gitleaks
brew install gitleaks

# Scan repository
gitleaks detect --source . --verbose

# Install as pre-commit hook
gitleaks protect --staged
```

## Emergency Contacts

If you've exposed credentials in a public repository:

1. **GitHub Security:** security@github.com
2. **Your organization's security team**
3. **Repository administrators**

## Additional Resources

- [GitHub Token Security](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github)
- [Removing Sensitive Data from a Repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Slack Token Security](https://api.slack.com/authentication/best-practices)

## Remember

**Prevention is better than cure!**
- Never hardcode tokens
- Always use environment variables
- Review commits before pushing
- Enable secret scanning
- Use short-lived tokens when possible
