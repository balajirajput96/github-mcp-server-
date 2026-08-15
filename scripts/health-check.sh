#!/bin/bash

# Repository Health Check Script
# Automatically checks and fixes common issues

# Note: Not using 'set -e' to continue checking all items even if some fail

echo "🏥 Repository Health Check"
echo "=========================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

errors=0
warnings=0

# Check 1: Node.js version
echo -e "${BLUE}[1/10]${NC} Checking Node.js version..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -ge 18 ]; then
    echo -e "${GREEN}✓${NC} Node.js version: $(node -v) (OK)"
else
    echo -e "${RED}✗${NC} Node.js version: $(node -v) (Need 18+)"
    ((errors++))
fi

# Check 2: npm version
echo -e "${BLUE}[2/10]${NC} Checking npm..."
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓${NC} npm version: $(npm -v)"
else
    echo -e "${RED}✗${NC} npm not found"
    ((errors++))
fi

# Check 3: Dependencies installed
echo -e "${BLUE}[3/10]${NC} Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${YELLOW}!${NC} Dependencies not installed, installing..."
    npm install
    echo -e "${GREEN}✓${NC} Dependencies installed successfully"
    ((warnings++))
fi

# Check 4: TypeScript compilation
echo -e "${BLUE}[4/10]${NC} Checking TypeScript compilation..."
if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✓${NC} TypeScript compilation successful"
else
    echo -e "${RED}✗${NC} TypeScript compilation failed"
    cat /tmp/build.log
    ((errors++))
fi

# Check 5: Build output
echo -e "${BLUE}[5/10]${NC} Checking build output..."
if [ -f "dist/index.js" ]; then
    echo -e "${GREEN}✓${NC} Build output exists (dist/index.js)"
else
    echo -e "${RED}✗${NC} Build output missing"
    ((errors++))
fi

# Check 6: Environment configuration
echo -e "${BLUE}[6/10]${NC} Checking environment configuration..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    if grep -q "GITHUB_TOKEN=your_github_token_here" .env 2>/dev/null; then
        echo -e "${YELLOW}!${NC} Warning: Default GitHub token detected, please update"
        ((warnings++))
    fi
elif [ -f ".env.example" ]; then
    echo -e "${YELLOW}!${NC} .env not found, .env.example available"
    ((warnings++))
else
    echo -e "${YELLOW}!${NC} No environment configuration found"
    ((warnings++))
fi

# Check 7: Git repository
echo -e "${BLUE}[7/10]${NC} Checking Git repository..."
if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC} Git repository initialized"
    branch=$(git branch --show-current)
    echo -e "  Current branch: ${branch}"
else
    echo -e "${YELLOW}!${NC} Not a Git repository"
    ((warnings++))
fi

# Check 8: Security validator
echo -e "${BLUE}[8/10]${NC} Checking security features..."
if [ -f "src/security-validator.ts" ]; then
    echo -e "${GREEN}✓${NC} Security validator present"
else
    echo -e "${YELLOW}!${NC} Security validator missing"
    ((warnings++))
fi

# Check 9: Documentation
echo -e "${BLUE}[9/10]${NC} Checking documentation..."
required_docs=("README.md" "SECURITY.md" "DEPLOYMENT.md")
for doc in "${required_docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc exists"
    else
        echo -e "${YELLOW}!${NC} $doc missing"
        ((warnings++))
    fi
done

# Check 10: Integration examples
echo -e "${BLUE}[10/10]${NC} Checking integration examples..."
if [ -d "examples/integrations" ]; then
    example_count=$(find examples/integrations -name "*.js" | wc -l)
    echo -e "${GREEN}✓${NC} Integration examples found ($example_count files)"
else
    echo -e "${YELLOW}!${NC} Integration examples not found"
    ((warnings++))
fi

# Summary
echo ""
echo "=========================="
echo "Health Check Summary"
echo "=========================="
if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Repository is healthy.${NC}"
    exit 0
elif [ $errors -eq 0 ]; then
    echo -e "${YELLOW}⚠ $warnings warning(s) found${NC}"
    echo "Repository is functional but has warnings."
    exit 0
else
    echo -e "${RED}✗ $errors error(s) and $warnings warning(s) found${NC}"
    echo "Please fix the errors before deploying."
    exit 1
fi
