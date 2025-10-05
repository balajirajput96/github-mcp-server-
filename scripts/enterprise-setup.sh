#!/bin/bash

# Enterprise Integration Setup Script
# This script helps you configure all enterprise integrations for GitHub MCP Server

set -e

echo "🚀 GitHub MCP Server - Enterprise Integration Setup"
echo "=================================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to prompt for input with default value
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    read -p "$(echo -e ${BLUE}${prompt}${NC} [${default}]: )" input
    eval "$var_name=\"${input:-$default}\""
}

# Function to prompt for secure input (password/token)
prompt_secure() {
    local prompt="$1"
    local var_name="$2"
    
    read -sp "$(echo -e ${BLUE}${prompt}${NC}: )" input
    echo ""
    eval "$var_name=\"$input\""
}

echo -e "${YELLOW}Step 1: GitHub Configuration${NC}"
echo "-----------------------------"
prompt_secure "Enter your GitHub Personal Access Token" GITHUB_TOKEN
prompt_with_default "GitHub Enterprise URL (leave empty for github.com)" "" GITHUB_ENTERPRISE_URL

echo ""
echo -e "${YELLOW}Step 2: Slack Integration (optional)${NC}"
echo "-------------------------------------"
read -p "$(echo -e ${BLUE}Configure Slack integration?${NC} [y/N]: )" configure_slack

if [[ "$configure_slack" =~ ^[Yy]$ ]]; then
    prompt_secure "Enter Slack Bot Token (xoxb-...)" SLACK_BOT_TOKEN
    prompt_secure "Enter Slack Signing Secret" SLACK_SIGNING_SECRET
    prompt_with_default "Enter Slack Channel ID" "general" SLACK_CHANNEL_ID
fi

echo ""
echo -e "${YELLOW}Step 3: Cloud Platform Configuration (optional)${NC}"
echo "------------------------------------------------"
read -p "$(echo -e ${BLUE}Configure AWS?${NC} [y/N]: )" configure_aws

if [[ "$configure_aws" =~ ^[Yy]$ ]]; then
    prompt_secure "AWS Access Key ID" AWS_ACCESS_KEY_ID
    prompt_secure "AWS Secret Access Key" AWS_SECRET_ACCESS_KEY
    prompt_with_default "AWS Region" "us-east-1" AWS_REGION
fi

echo ""
read -p "$(echo -e ${BLUE}Configure Azure?${NC} [y/N]: )" configure_azure

if [[ "$configure_azure" =~ ^[Yy]$ ]]; then
    prompt_secure "Azure Subscription ID" AZURE_SUBSCRIPTION_ID
    prompt_secure "Azure Client ID" AZURE_CLIENT_ID
    prompt_secure "Azure Client Secret" AZURE_CLIENT_SECRET
    prompt_secure "Azure Tenant ID" AZURE_TENANT_ID
fi

echo ""
echo -e "${YELLOW}Step 4: Project Management Tools (optional)${NC}"
echo "--------------------------------------------"
read -p "$(echo -e ${BLUE}Configure Jira?${NC} [y/N]: )" configure_jira

if [[ "$configure_jira" =~ ^[Yy]$ ]]; then
    prompt_with_default "Jira URL" "https://your-company.atlassian.net" JIRA_URL
    prompt_with_default "Jira Email" "" JIRA_EMAIL
    prompt_secure "Jira API Token" JIRA_API_TOKEN
fi

echo ""
read -p "$(echo -e ${BLUE}Configure Trello?${NC} [y/N]: )" configure_trello

if [[ "$configure_trello" =~ ^[Yy]$ ]]; then
    prompt_secure "Trello API Key" TRELLO_API_KEY
    prompt_secure "Trello Token" TRELLO_TOKEN
fi

echo ""
echo -e "${YELLOW}Step 5: Monitoring Tools (optional)${NC}"
echo "------------------------------------"
read -p "$(echo -e ${BLUE}Configure Sentry for error tracking?${NC} [y/N]: )" configure_sentry

if [[ "$configure_sentry" =~ ^[Yy]$ ]]; then
    prompt_secure "Sentry DSN" SENTRY_DSN
fi

echo ""
read -p "$(echo -e ${BLUE}Configure New Relic for APM?${NC} [y/N]: )" configure_newrelic

if [[ "$configure_newrelic" =~ ^[Yy]$ ]]; then
    prompt_secure "New Relic License Key" NEW_RELIC_LICENSE_KEY
fi

# Create .env file
echo ""
echo -e "${YELLOW}Step 6: Generating Configuration${NC}"
echo "---------------------------------"

cat > .env << EOF
# GitHub Configuration
GITHUB_TOKEN=${GITHUB_TOKEN}
EOF

if [ ! -z "$GITHUB_ENTERPRISE_URL" ]; then
    echo "GITHUB_ENTERPRISE_URL=${GITHUB_ENTERPRISE_URL}" >> .env
fi

if [[ "$configure_slack" =~ ^[Yy]$ ]]; then
    cat >> .env << EOF

# Slack Configuration
SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN}
SLACK_SIGNING_SECRET=${SLACK_SIGNING_SECRET}
SLACK_CHANNEL_ID=${SLACK_CHANNEL_ID}
EOF
fi

if [[ "$configure_aws" =~ ^[Yy]$ ]]; then
    cat >> .env << EOF

# AWS Configuration
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_REGION=${AWS_REGION}
EOF
fi

if [[ "$configure_azure" =~ ^[Yy]$ ]]; then
    cat >> .env << EOF

# Azure Configuration
AZURE_SUBSCRIPTION_ID=${AZURE_SUBSCRIPTION_ID}
AZURE_CLIENT_ID=${AZURE_CLIENT_ID}
AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET}
AZURE_TENANT_ID=${AZURE_TENANT_ID}
EOF
fi

if [[ "$configure_jira" =~ ^[Yy]$ ]]; then
    cat >> .env << EOF

# Jira Configuration
JIRA_URL=${JIRA_URL}
JIRA_EMAIL=${JIRA_EMAIL}
JIRA_API_TOKEN=${JIRA_API_TOKEN}
EOF
fi

if [[ "$configure_trello" =~ ^[Yy]$ ]]; then
    cat >> .env << EOF

# Trello Configuration
TRELLO_API_KEY=${TRELLO_API_KEY}
TRELLO_TOKEN=${TRELLO_TOKEN}
EOF
fi

if [[ "$configure_sentry" =~ ^[Yy]$ ]]; then
    cat >> .env << EOF

# Sentry Configuration
SENTRY_DSN=${SENTRY_DSN}
EOF
fi

if [[ "$configure_newrelic" =~ ^[Yy]$ ]]; then
    cat >> .env << EOF

# New Relic Configuration
NEW_RELIC_LICENSE_KEY=${NEW_RELIC_LICENSE_KEY}
EOF
fi

cat >> .env << EOF

# Application Configuration
NODE_ENV=production
LOG_LEVEL=info
EOF

echo ""
echo -e "${GREEN}✅ Configuration file created: .env${NC}"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Step 7: Installing Dependencies${NC}"
    echo "--------------------------------"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
fi

# Build the project
echo -e "${YELLOW}Step 8: Building Project${NC}"
echo "------------------------"
npm run build
echo -e "${GREEN}✅ Project built successfully${NC}"
echo ""

# Summary
echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Enterprise Setup Complete!${NC}"
echo "=================================================="
echo ""
echo "Configured integrations:"
echo "  ✓ GitHub"
[[ "$configure_slack" =~ ^[Yy]$ ]] && echo "  ✓ Slack"
[[ "$configure_aws" =~ ^[Yy]$ ]] && echo "  ✓ AWS"
[[ "$configure_azure" =~ ^[Yy]$ ]] && echo "  ✓ Azure"
[[ "$configure_jira" =~ ^[Yy]$ ]] && echo "  ✓ Jira"
[[ "$configure_trello" =~ ^[Yy]$ ]] && echo "  ✓ Trello"
[[ "$configure_sentry" =~ ^[Yy]$ ]] && echo "  ✓ Sentry"
[[ "$configure_newrelic" =~ ^[Yy]$ ]] && echo "  ✓ New Relic"
echo ""
echo "Next steps:"
echo "1. Review the .env file and adjust as needed"
echo "2. Start the server: npm start"
echo "3. See ENTERPRISE-INTEGRATION.md for detailed configuration"
echo ""
echo "For Docker deployment:"
echo "  docker-compose up -d"
echo ""
echo "For Kubernetes deployment:"
echo "  kubectl apply -f k8s/"
echo ""
echo -e "${BLUE}Happy deploying! 🚀${NC}"
