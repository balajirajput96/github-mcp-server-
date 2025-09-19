#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

// Initialize GitHub client
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

// Create MCP server
const server = new Server(
  {
    name: 'github-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_repositories',
        description: 'List repositories for the authenticated user',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Repository type: all, owner, member',
              default: 'all',
            },
            sort: {
              type: 'string',
              description: 'Sort by: created, updated, pushed, full_name',
              default: 'updated',
            },
            per_page: {
              type: 'number',
              description: 'Results per page (1-100)',
              default: 30,
              minimum: 1,
              maximum: 100,
            },
          },
        },
      },
      {
        name: 'get_repository',
        description: 'Get repository information',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'list_issues',
        description: 'List issues for a repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            state: {
              type: 'string',
              description: 'Issue state: open, closed, all',
              default: 'open',
            },
            per_page: {
              type: 'number',
              description: 'Results per page (1-100)',
              default: 30,
              minimum: 1,
              maximum: 100,
            },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'create_issue',
        description: 'Create a new issue',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            title: {
              type: 'string',
              description: 'Issue title',
            },
            body: {
              type: 'string',
              description: 'Issue body',
            },
            labels: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Labels to apply to the issue',
            },
          },
          required: ['owner', 'repo', 'title'],
        },
      },
      {
        name: 'list_pull_requests',
        description: 'List pull requests for a repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            state: {
              type: 'string',
              description: 'PR state: open, closed, all',
              default: 'open',
            },
            per_page: {
              type: 'number',
              description: 'Results per page (1-100)',
              default: 30,
              minimum: 1,
              maximum: 100,
            },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'get_file_content',
        description: 'Get file content from a repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            path: {
              type: 'string',
              description: 'File path',
            },
            ref: {
              type: 'string',
              description: 'Branch, tag, or commit SHA',
              default: 'main',
            },
          },
          required: ['owner', 'repo', 'path'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_repositories': {
        const { type = 'all', sort = 'updated', per_page = 30 } = args as any;
        const response = await octokit.rest.repos.listForAuthenticatedUser({
          type,
          sort,
          per_page,
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'get_repository': {
        const { owner, repo } = args as any;
        const response = await octokit.rest.repos.get({
          owner,
          repo,
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'list_issues': {
        const { owner, repo, state = 'open', per_page = 30 } = args as any;
        const response = await octokit.rest.issues.listForRepo({
          owner,
          repo,
          state,
          per_page,
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'create_issue': {
        const { owner, repo, title, body, labels } = args as any;
        const response = await octokit.rest.issues.create({
          owner,
          repo,
          title,
          body,
          labels,
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'list_pull_requests': {
        const { owner, repo, state = 'open', per_page = 30 } = args as any;
        const response = await octokit.rest.pulls.list({
          owner,
          repo,
          state,
          per_page,
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'get_file_content': {
        const { owner, repo, path, ref = 'main' } = args as any;
        const response = await octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref,
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'github://user',
        name: 'GitHub User Information',
        description: 'Information about the authenticated GitHub user',
        mimeType: 'application/json',
      },
    ],
  };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'github://user') {
    try {
      const response = await octokit.rest.users.getAuthenticated();
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to fetch user information: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('GitHub MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});