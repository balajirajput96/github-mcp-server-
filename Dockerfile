# Use official Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies) so the TypeScript
# compiler (a devDependency) is available.
# --ignore-scripts skips the `prepare` lifecycle script (which runs `npm run
# build` -> `tsc`) because the source code is not copied into the image yet -
# it is copied in the next step. We run the build explicitly after that.
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build the application (tsc is available from the full install above)
RUN npm run build

# Prune dev dependencies to keep the production image small.
# --ignore-scripts prevents the prepare script (tsc) from re-running during prune.
RUN npm prune --omit=dev --ignore-scripts

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mcp -u 1001
USER mcp

# Expose port (if needed for future HTTP interface)
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]