#!/bin/bash

# Automatic Issue Detection and Fix Script
# Detects and fixes common issues automatically

# Note: Not using 'set -e' to continue checking all items even if some fail

echo "🔧 Auto-Fix: Issue Detection & Resolution"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

fixed=0
issues=0

echo -e "${CYAN}Scanning for common issues...${NC}"
echo ""

# Issue 1: Missing dependencies
echo -e "${BLUE}[1/8]${NC} Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Issue detected: Missing dependencies${NC}"
    echo "Fixing: Installing dependencies..."
    npm install
    echo -e "${GREEN}✓ Fixed: Dependencies installed${NC}"
    ((fixed++))
    ((issues++))
else
    echo -e "${GREEN}✓ OK: Dependencies present${NC}"
fi

# Issue 2: Missing build output
echo -e "${BLUE}[2/8]${NC} Checking build output..."
if [ ! -d "dist" ] || [ ! -f "dist/index.js" ]; then
    echo -e "${YELLOW}Issue detected: Missing build output${NC}"
    echo "Fixing: Building project..."
    npm run build
    echo -e "${GREEN}✓ Fixed: Project built${NC}"
    ((fixed++))
    ((issues++))
else
    echo -e "${GREEN}✓ OK: Build output present${NC}"
fi

# Issue 3: Missing .env file
echo -e "${BLUE}[3/8]${NC} Checking environment configuration..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}Issue detected: Missing .env file${NC}"
        echo "Fixing: Creating .env from template..."
        cp .env.example .env
        echo -e "${GREEN}✓ Fixed: .env created (please update with your tokens)${NC}"
        echo -e "${CYAN}  Remember to edit .env and add your GitHub token!${NC}"
        ((fixed++))
        ((issues++))
    else
        echo -e "${RED}Warning: No .env or .env.example found${NC}"
    fi
else
    # Check if using default token
    if grep -q "your_github_token_here" .env; then
        echo -e "${YELLOW}⚠ Warning: Using default GitHub token${NC}"
        echo -e "${CYAN}  Please update .env with your actual token${NC}"
    else
        echo -e "${GREEN}✓ OK: .env configured${NC}"
    fi
fi

# Issue 4: Wrong Node.js version
echo -e "${BLUE}[4/8]${NC} Checking Node.js version..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo -e "${RED}Issue detected: Node.js version too old (need 18+)${NC}"
    echo -e "${CYAN}Fix: Please upgrade Node.js to version 18 or later${NC}"
    echo "Visit: https://nodejs.org/"
    ((issues++))
else
    echo -e "${GREEN}✓ OK: Node.js version $(node -v)${NC}"
fi

# Issue 5: Outdated dependencies
echo -e "${BLUE}[5/8]${NC} Checking for outdated dependencies..."
if npm outdated > /tmp/outdated.txt 2>&1; then
    echo -e "${GREEN}✓ OK: Dependencies up to date${NC}"
else
    outdated_count=$(cat /tmp/outdated.txt | tail -n +2 | wc -l)
    if [ $outdated_count -gt 0 ]; then
        echo -e "${YELLOW}Found $outdated_count outdated package(s)${NC}"
        echo "To update: npm update"
        echo -e "${CYAN}(Skipping auto-update for safety)${NC}"
    fi
fi

# Issue 6: Missing scripts executable permissions
echo -e "${BLUE}[6/8]${NC} Checking script permissions..."
scripts_fixed=0
for script in scripts/*.sh; do
    if [ -f "$script" ] && [ ! -x "$script" ]; then
        echo -e "${YELLOW}Issue detected: $script not executable${NC}"
        chmod +x "$script"
        echo -e "${GREEN}✓ Fixed: Made $script executable${NC}"
        ((scripts_fixed++))
    fi
done

if [ $scripts_fixed -gt 0 ]; then
    ((fixed++))
    ((issues++))
else
    echo -e "${GREEN}✓ OK: All scripts executable${NC}"
fi

# Issue 7: Missing deployment configs
echo -e "${BLUE}[7/8]${NC} Checking deployment configurations..."
has_deploy_config=0

if [ -f "vercel.json" ]; then ((has_deploy_config++)); fi
if [ -f "netlify.toml" ]; then ((has_deploy_config++)); fi
if [ -f "render.yaml" ]; then ((has_deploy_config++)); fi
if [ -f "railway.json" ]; then ((has_deploy_config++)); fi
if [ -f "Dockerfile" ]; then ((has_deploy_config++)); fi

if [ $has_deploy_config -eq 0 ]; then
    echo -e "${YELLOW}No deployment configs found${NC}"
    echo -e "${CYAN}Run ./scripts/free-tier-setup.sh to create them${NC}"
else
    echo -e "${GREEN}✓ OK: Found $has_deploy_config deployment config(s)${NC}"
fi

# Issue 8: Git repository issues
echo -e "${BLUE}[8/8]${NC} Checking Git repository..."
if [ -d ".git" ]; then
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        changed_files=$(git diff --name-only | wc -l)
        echo -e "${YELLOW}Found $changed_files uncommitted file(s)${NC}"
        echo -e "${CYAN}To commit: git add . && git commit -m 'your message'${NC}"
    else
        echo -e "${GREEN}✓ OK: No uncommitted changes${NC}"
    fi
else
    echo -e "${YELLOW}Not a Git repository${NC}"
    echo -e "${CYAN}To initialize: git init${NC}"
fi

# Issue 9: Clean build artifacts if rebuild needed
echo ""
echo -e "${BLUE}[Extra]${NC} Checking for stale build artifacts..."
if [ -d "dist" ]; then
    # Check if source is newer than build
    if [ "src/index.ts" -nt "dist/index.js" ]; then
        echo -e "${YELLOW}Issue detected: Source code newer than build${NC}"
        echo "Fixing: Rebuilding..."
        npm run build
        echo -e "${GREEN}✓ Fixed: Project rebuilt${NC}"
        ((fixed++))
        ((issues++))
    else
        echo -e "${GREEN}✓ OK: Build is up to date${NC}"
    fi
fi

# Summary
echo ""
echo "=========================================="
echo "Auto-Fix Summary"
echo "=========================================="
if [ $issues -eq 0 ]; then
    echo -e "${GREEN}✓ No issues found! Repository is healthy.${NC}"
    echo ""
    echo "Everything looks good! You're ready to:"
    echo "  • Deploy: ./scripts/auto-deploy.sh"
    echo "  • Test locally: npm start"
    echo "  • Run health check: ./scripts/health-check.sh"
else
    echo -e "${CYAN}Found $issues issue(s)${NC}"
    echo -e "${GREEN}Fixed $fixed issue(s) automatically${NC}"
    
    if [ $fixed -lt $issues ]; then
        manual_fixes=$((issues - fixed))
        echo -e "${YELLOW}$manual_fixes issue(s) require manual attention${NC}"
    fi
    
    echo ""
    echo "Next steps:"
    if [ ! -f ".env" ] || grep -q "your_github_token_here" .env 2>/dev/null; then
        echo "  1. Update .env with your GitHub token"
    fi
    echo "  2. Run health check: ./scripts/health-check.sh"
    echo "  3. Deploy: ./scripts/auto-deploy.sh"
fi

echo ""
echo -e "${BLUE}Auto-fix complete! 🎉${NC}"

exit 0
