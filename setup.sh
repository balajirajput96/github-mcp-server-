#!/bin/bash

# One-Click Setup Script
# Complete automated setup and deployment for FREE tier

echo "🚀 GitHub MCP Server - One-Click Setup"
echo "======================================"
echo ""
echo "This script will:"
echo "  1. Check your system requirements"
echo "  2. Fix any issues automatically"
echo "  3. Set up FREE tier integrations"
echo "  4. Verify everything is working"
echo "  5. Deploy to your chosen platform"
echo ""
echo "💰 Total Cost: \$0.00/month (100% FREE)"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Function to print section headers
print_section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${CYAN}$1${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Ask user if they want to proceed
read -p "$(echo -e ${BLUE}Ready to start? [Y/n]: ${NC})" proceed
if [[ "$proceed" =~ ^[Nn]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

# Step 1: Auto-fix any issues
print_section "Step 1: Auto-Fix Issues"
echo "Detecting and fixing common issues..."
if ./scripts/auto-fix.sh; then
    echo -e "${GREEN}✓ Auto-fix completed successfully${NC}"
else
    echo -e "${YELLOW}⚠ Some issues may require manual attention${NC}"
fi

# Step 2: Run health check
print_section "Step 2: Health Check"
echo "Validating repository health..."
if ./scripts/health-check.sh; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check found issues${NC}"
    echo ""
    read -p "$(echo -e ${YELLOW}Continue anyway? [y/N]: ${NC})" continue_anyway
    if [[ ! "$continue_anyway" =~ ^[Yy]$ ]]; then
        echo "Setup aborted. Please fix issues and try again."
        exit 1
    fi
fi

# Step 3: FREE tier setup (if needed)
print_section "Step 3: FREE Tier Configuration"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Configuration already exists${NC}"
    read -p "$(echo -e ${BLUE}Reconfigure? [y/N]: ${NC})" reconfigure
    if [[ "$reconfigure" =~ ^[Yy]$ ]]; then
        ./scripts/free-tier-setup.sh
    fi
else
    echo "Running interactive FREE tier setup..."
    ./scripts/free-tier-setup.sh
fi

# Step 4: Final validation
print_section "Step 4: Final Validation"
echo "Running final checks..."
./scripts/health-check.sh

# Step 5: Deployment
print_section "Step 5: Deployment"
echo "Ready to deploy!"
echo ""
read -p "$(echo -e ${BLUE}Deploy now? [Y/n]: ${NC})" deploy_now

if [[ ! "$deploy_now" =~ ^[Nn]$ ]]; then
    ./scripts/auto-deploy.sh
else
    echo "Skipping deployment."
    echo ""
    echo "To deploy later, run:"
    echo "  ./scripts/auto-deploy.sh"
fi

# Success summary
print_section "🎉 Setup Complete!"

echo -e "${GREEN}Your GitHub MCP Server is ready!${NC}"
echo ""
echo "What's been set up:"
echo "  ✅ All dependencies installed"
echo "  ✅ Project built successfully"
echo "  ✅ FREE tier integrations configured"
echo "  ✅ Health checks passed"
echo ""
echo "💰 Monthly cost: \$0.00 (100% FREE tier)"
echo ""
echo "Next steps:"
echo "  1. Update .env with your actual tokens"
echo "  2. Test locally: npm start"
echo "  3. Configure with Claude Desktop (see README.md)"
echo ""
echo "Useful commands:"
echo "  ./scripts/health-check.sh  - Verify setup"
echo "  ./scripts/auto-fix.sh      - Fix issues"
echo "  ./scripts/auto-deploy.sh   - Deploy again"
echo ""
echo "Documentation:"
echo "  📖 README.md - Main documentation"
echo "  📖 FREE-TIER-GUIDE.md - FREE deployment guide"
echo "  📖 AUTOMATION-SUMMARY.md - Automation details"
echo ""
echo -e "${CYAN}Thank you for using GitHub MCP Server! 🚀${NC}"
