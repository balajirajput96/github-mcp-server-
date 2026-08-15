#!/bin/bash

# Automated Deployment Script
# Deploys to free tier platforms automatically

set -e

echo "🚀 Automated Deployment Script"
echo "=============================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo -e "${YELLOW}Step 1: Pre-deployment checks${NC}"
echo "------------------------------"

# Run health check
if ./scripts/health-check.sh; then
    echo -e "${GREEN}✓${NC} Health check passed"
else
    echo -e "${RED}✗${NC} Health check failed"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Build application${NC}"
echo "-------------------------"
npm run build
echo -e "${GREEN}✓${NC} Build completed"

echo ""
echo -e "${YELLOW}Step 3: Detect deployment platform${NC}"
echo "-----------------------------------"

# Detect which platform to deploy to
platform=""

if [ -f "vercel.json" ]; then
    platform="vercel"
    echo -e "${CYAN}Detected: Vercel${NC}"
elif [ -f "netlify.toml" ]; then
    platform="netlify"
    echo -e "${CYAN}Detected: Netlify${NC}"
elif [ -f "render.yaml" ]; then
    platform="render"
    echo -e "${CYAN}Detected: Render${NC}"
elif [ -f "railway.json" ]; then
    platform="railway"
    echo -e "${CYAN}Detected: Railway${NC}"
elif [ -f "Dockerfile" ]; then
    platform="docker"
    echo -e "${CYAN}Detected: Docker${NC}"
else
    echo -e "${YELLOW}No specific platform detected, showing options...${NC}"
    echo ""
    echo "Available deployment options:"
    echo "1. Vercel (Free: 100GB bandwidth)"
    echo "2. Netlify (Free: 100GB bandwidth)"
    echo "3. Render (Free: 750 hours/month)"
    echo "4. Railway (Free: \$5 credit/month)"
    echo "5. Docker (Local)"
    echo "6. Manual"
    echo ""
    read -p "Select platform (1-6): " choice
    
    case $choice in
        1) platform="vercel" ;;
        2) platform="netlify" ;;
        3) platform="render" ;;
        4) platform="railway" ;;
        5) platform="docker" ;;
        6) platform="manual" ;;
        *) echo "Invalid choice"; exit 1 ;;
    esac
fi

echo ""
echo -e "${YELLOW}Step 4: Deploy to $platform${NC}"
echo "-------------------------"

case $platform in
    "vercel")
        if command -v vercel &> /dev/null; then
            echo "Deploying to Vercel..."
            vercel --prod
            echo -e "${GREEN}✓${NC} Deployed to Vercel"
        else
            echo -e "${YELLOW}Vercel CLI not installed.${NC}"
            echo "Install: npm i -g vercel"
            echo "Then run: vercel --prod"
        fi
        ;;
    
    "netlify")
        if command -v netlify &> /dev/null; then
            echo "Deploying to Netlify..."
            netlify deploy --prod
            echo -e "${GREEN}✓${NC} Deployed to Netlify"
        else
            echo -e "${YELLOW}Netlify CLI not installed.${NC}"
            echo "Install: npm i -g netlify-cli"
            echo "Then run: netlify deploy --prod"
        fi
        ;;
    
    "render")
        echo -e "${CYAN}Render Deployment:${NC}"
        echo "1. Push your code to GitHub"
        echo "2. Go to https://render.com"
        echo "3. Click 'New +' -> 'Web Service'"
        echo "4. Connect your GitHub repository"
        echo "5. Render will auto-deploy from render.yaml"
        echo ""
        echo -e "${GREEN}✓${NC} Instructions provided"
        ;;
    
    "railway")
        if command -v railway &> /dev/null; then
            echo "Deploying to Railway..."
            railway up
            echo -e "${GREEN}✓${NC} Deployed to Railway"
        else
            echo -e "${YELLOW}Railway CLI not installed.${NC}"
            echo "Install: npm i -g @railway/cli"
            echo "Login: railway login"
            echo "Then run: railway up"
        fi
        ;;
    
    "docker")
        echo "Building Docker image..."
        docker build -t github-mcp-server .
        echo -e "${GREEN}✓${NC} Docker image built"
        echo ""
        echo "To run locally:"
        echo "docker run -e GITHUB_TOKEN=your_token github-mcp-server"
        ;;
    
    "manual")
        echo -e "${CYAN}Manual Deployment:${NC}"
        echo "1. Build completed (npm run build)"
        echo "2. Start server: npm start"
        echo "3. Or deploy dist/ folder to your hosting"
        ;;
esac

echo ""
echo "=============================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=============================="
echo ""
echo "Next steps:"
echo "1. Test your deployment"
echo "2. Monitor logs for any issues"
echo "3. Set up your GitHub token in production"
echo ""
echo -e "${BLUE}Happy coding! 🚀${NC}"
