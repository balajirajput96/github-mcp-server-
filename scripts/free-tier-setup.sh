#!/bin/bash

# Free Tier Enterprise Integration Setup Script
# This script helps you configure enterprise integrations using ONLY FREE TIER services
# No costs - all integrations use free trials and free tier limits

set -e

echo "🎉 GitHub MCP Server - FREE TIER Setup"
echo "========================================"
echo "✅ 100% Free - No credit card required for most services"
echo "✅ All integrations use free tier limits"
echo "✅ Automated setup and deployment"
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
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

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        FREE TIER SERVICES - NO COST BREAKDOWN          ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "💰 Cost Summary: \$0.00/month"
echo ""
echo "Services configured:"
echo "  • GitHub (Free tier - unlimited public repos)"
echo "  • Slack (Free tier - 10k message history)"
echo "  • Vercel (Free tier - 100GB bandwidth)"
echo "  • Netlify (Free tier - 100GB bandwidth)"
echo "  • Render (Free tier - 750 hours/month)"
echo "  • Railway (Free tier - \$5 credit/month)"
echo "  • Heroku (Free dynos discontinued, use alternatives)"
echo "  • MongoDB Atlas (Free tier - 512MB storage)"
echo "  • Sentry (Free tier - 5k events/month)"
echo "  • GitHub Actions (Free for public repos)"
echo ""
echo -e "${GREEN}All services above are FREE and don't require credit cards!${NC}"
echo ""

read -p "$(echo -e ${CYAN}Press Enter to continue...${NC})"

echo ""
echo -e "${YELLOW}Step 1: GitHub Configuration (FREE)${NC}"
echo "----------------------------------------"
echo "Generate token at: https://github.com/settings/tokens"
echo "Required scopes: repo, read:user (FREE)"
prompt_secure "Enter your GitHub Personal Access Token" GITHUB_TOKEN

echo ""
echo -e "${YELLOW}Step 2: Slack Integration (FREE TIER - Optional)${NC}"
echo "------------------------------------------------"
echo "Slack Free Tier: 10,000 message history, 10 integrations"
echo "Create app at: https://api.slack.com/apps"
read -p "$(echo -e ${BLUE}Configure Slack integration?${NC} [y/N]: )" configure_slack

if [[ "$configure_slack" =~ ^[Yy]$ ]]; then
    echo "1. Create new app at https://api.slack.com/apps"
    echo "2. Enable Bot Token Scopes: chat:write, chat:write.public"
    echo "3. Install app to workspace"
    prompt_secure "Enter Slack Bot Token (xoxb-...)" SLACK_BOT_TOKEN
    prompt_with_default "Enter Slack Channel ID" "general" SLACK_CHANNEL_ID
fi

echo ""
echo -e "${YELLOW}Step 3: Free Deployment Platforms (Optional)${NC}"
echo "--------------------------------------------"
echo ""

# Vercel
echo -e "${CYAN}Vercel (FREE):${NC}"
echo "  • 100 GB Bandwidth"
echo "  • Unlimited websites"
echo "  • Automatic HTTPS"
read -p "$(echo -e ${BLUE}Setup Vercel deployment?${NC} [y/N]: )" setup_vercel

# Netlify
echo ""
echo -e "${CYAN}Netlify (FREE):${NC}"
echo "  • 100 GB Bandwidth"
echo "  • 300 build minutes/month"
echo "  • Automatic HTTPS"
read -p "$(echo -e ${BLUE}Setup Netlify deployment?${NC} [y/N]: )" setup_netlify

# Render
echo ""
echo -e "${CYAN}Render (FREE):${NC}"
echo "  • 750 hours/month"
echo "  • Automatic HTTPS"
echo "  • Git-based deployment"
read -p "$(echo -e ${BLUE}Setup Render deployment?${NC} [y/N]: )" setup_render

# Railway
echo ""
echo -e "${CYAN}Railway (FREE):${NC}"
echo "  • \$5 credit/month"
echo "  • Auto-deploy from Git"
echo "  • Built-in databases"
read -p "$(echo -e ${BLUE}Setup Railway deployment?${NC} [y/N]: )" setup_railway

echo ""
echo -e "${YELLOW}Step 4: Free Monitoring Tools (Optional)${NC}"
echo "----------------------------------------"

# Sentry
echo -e "${CYAN}Sentry Error Tracking (FREE):${NC}"
echo "  • 5,000 events/month"
echo "  • 1 project"
echo "  • 30-day history"
echo "Create account at: https://sentry.io/signup/"
read -p "$(echo -e ${BLUE}Configure Sentry?${NC} [y/N]: )" configure_sentry

if [[ "$configure_sentry" =~ ^[Yy]$ ]]; then
    prompt_secure "Sentry DSN" SENTRY_DSN
fi

# Create .env file
echo ""
echo -e "${YELLOW}Step 5: Generating Configuration${NC}"
echo "---------------------------------"

cat > .env << EOF
# ============================================
# FREE TIER CONFIGURATION
# All services below use FREE tier limits
# Total Monthly Cost: \$0.00
# ============================================

# GitHub Configuration (FREE)
GITHUB_TOKEN=${GITHUB_TOKEN}
EOF

if [[ "$configure_slack" =~ ^[Yy]$ ]]; then
    cat >> .env << EOF

# Slack Configuration (FREE TIER)
# Free: 10k message history, 10 integrations
SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN}
SLACK_CHANNEL_ID=${SLACK_CHANNEL_ID}
EOF
fi

if [[ "$configure_sentry" =~ ^[Yy]$ ]]; then
    cat >> .env << EOF

# Sentry Configuration (FREE TIER)
# Free: 5k events/month
SENTRY_DSN=${SENTRY_DSN}
EOF
fi

cat >> .env << EOF

# Application Configuration
NODE_ENV=production
LOG_LEVEL=info

# Deployment Platform (all FREE)
# Uncomment the one you're using:
# VERCEL_DEPLOYMENT=true
# NETLIFY_DEPLOYMENT=true
# RENDER_DEPLOYMENT=true
# RAILWAY_DEPLOYMENT=true
EOF

echo ""
echo -e "${GREEN}✅ Configuration file created: .env${NC}"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Step 6: Installing Dependencies${NC}"
    echo "--------------------------------"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
fi

# Build the project
echo -e "${YELLOW}Step 7: Building Project${NC}"
echo "------------------------"
npm run build
echo -e "${GREEN}✅ Project built successfully${NC}"
echo ""

# Create deployment configs for free platforms
if [[ "$setup_vercel" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Creating Vercel configuration...${NC}"
    cat > vercel.json << 'VERCEL_EOF'
{
  "version": 2,
  "name": "github-mcp-server",
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
VERCEL_EOF
    echo -e "${GREEN}✅ Vercel config created (vercel.json)${NC}"
fi

if [[ "$setup_netlify" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Creating Netlify configuration...${NC}"
    cat > netlify.toml << 'NETLIFY_EOF'
[build]
  command = "npm run build"
  publish = "dist"
  
[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.js"
  status = 200

[context.production.environment]
  NODE_ENV = "production"
NETLIFY_EOF
    echo -e "${GREEN}✅ Netlify config created (netlify.toml)${NC}"
fi

if [[ "$setup_render" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Creating Render configuration...${NC}"
    cat > render.yaml << 'RENDER_EOF'
services:
  - type: web
    name: github-mcp-server
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
    plan: free
    healthCheckPath: /
RENDER_EOF
    echo -e "${GREEN}✅ Render config created (render.yaml)${NC}"
fi

if [[ "$setup_railway" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Creating Railway configuration...${NC}"
    cat > railway.json << 'RAILWAY_EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
RAILWAY_EOF
    echo -e "${GREEN}✅ Railway config created (railway.json)${NC}"
fi

# Summary
echo ""
echo "=========================================================="
echo -e "${GREEN}🎉 FREE TIER Setup Complete!${NC}"
echo "=========================================================="
echo ""
echo -e "${CYAN}💰 Monthly Cost: \$0.00 (100% FREE)${NC}"
echo ""
echo "Configured services:"
echo "  ✓ GitHub (FREE)"
[[ "$configure_slack" =~ ^[Yy]$ ]] && echo "  ✓ Slack (FREE - 10k messages)"
[[ "$setup_vercel" =~ ^[Yy]$ ]] && echo "  ✓ Vercel (FREE - 100GB)"
[[ "$setup_netlify" =~ ^[Yy]$ ]] && echo "  ✓ Netlify (FREE - 100GB)"
[[ "$setup_render" =~ ^[Yy]$ ]] && echo "  ✓ Render (FREE - 750hrs)"
[[ "$setup_railway" =~ ^[Yy]$ ]] && echo "  ✓ Railway (FREE - \$5 credit)"
[[ "$configure_sentry" =~ ^[Yy]$ ]] && echo "  ✓ Sentry (FREE - 5k events)"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the .env file"
echo "2. Test locally: npm start"
echo "3. Deploy to your chosen platform:"
echo ""
if [[ "$setup_vercel" =~ ^[Yy]$ ]]; then
    echo "   ${CYAN}Vercel:${NC}"
    echo "   npm i -g vercel"
    echo "   vercel --prod"
    echo ""
fi
if [[ "$setup_netlify" =~ ^[Yy]$ ]]; then
    echo "   ${CYAN}Netlify:${NC}"
    echo "   npm i -g netlify-cli"
    echo "   netlify deploy --prod"
    echo ""
fi
if [[ "$setup_render" =~ ^[Yy]$ ]]; then
    echo "   ${CYAN}Render:${NC}"
    echo "   1. Push to GitHub"
    echo "   2. Connect at https://render.com"
    echo "   3. Auto-deploy from Git"
    echo ""
fi
if [[ "$setup_railway" =~ ^[Yy]$ ]]; then
    echo "   ${CYAN}Railway:${NC}"
    echo "   npm i -g @railway/cli"
    echo "   railway login"
    echo "   railway up"
    echo ""
fi
echo "4. Monitor at https://github.com/settings/tokens (token usage)"
echo ""
echo -e "${GREEN}All services are FREE! No credit card required! 🎉${NC}"
echo ""
echo -e "${BLUE}Happy deploying! 🚀${NC}"
