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
import { validateUserInput, sanitizeOutput } from './security-validator.js';

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
      {
        name: 'get_issue',
        description: 'Get a specific issue by number',
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
            issue_number: {
              type: 'number',
              description: 'Issue number',
            },
          },
          required: ['owner', 'repo', 'issue_number'],
        },
      },
      {
        name: 'get_pull_request',
        description: 'Get a specific pull request by number',
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
            pull_number: {
              type: 'number',
              description: 'Pull request number',
            },
          },
          required: ['owner', 'repo', 'pull_number'],
        },
      },
      {
        name: 'get_commit',
        description: 'Get a specific commit',
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
            ref: {
              type: 'string',
              description: 'Commit SHA or branch name',
            },
          },
          required: ['owner', 'repo', 'ref'],
        },
      },
      {
        name: 'get_release',
        description: 'Get the latest release or a specific release by tag',
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
            tag: {
              type: 'string',
              description: 'Release tag (optional, gets latest if not provided)',
            },
          },
          required: ['owner', 'repo'],
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
              text: JSON.stringify(sanitizeOutput(response.data), null, 2),
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
              text: JSON.stringify(sanitizeOutput(response.data), null, 2),
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
              text: JSON.stringify(sanitizeOutput(response.data), null, 2),
            },
          ],
        };
      }

      case 'create_issue': {
        const { owner, repo, title, body, labels } = args as any;
        
        // Validate user input for sensitive data
        validateUserInput(title, 'title');
        validateUserInput(body, 'body');
        validateUserInput(labels, 'labels');
        
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
              text: JSON.stringify(sanitizeOutput(response.data), null, 2),
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
              text: JSON.stringify(sanitizeOutput(response.data), null, 2),
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
              text: JSON.stringify(sanitizeOutput(response.data), null, 2),
            },
          ],
        };
      }

      case 'get_issue': {
        const { owner, repo, issue_number } = args as any;
        const response = await octokit.rest.issues.get({
          owner,
          repo,
          issue_number,
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(sanitizeOutput(response.data), null, 2),
            },
          ],
        };
      }

      case 'get_pull_request': {
        const { owner, repo, pull_number } = args as any;
        const response = await octokit.rest.pulls.get({
          owner,
          repo,
          pull_number,
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(sanitizeOutput(response.data), null, 2),
            },
          ],
        };
      }

      case 'get_commit': {
        const { owner, repo, ref } = args as any;
        const response = await octokit.rest.repos.getCommit({
          owner,
          repo,
          ref,
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(sanitizeOutput(response.data), null, 2),
            },
          ],
        };
      }

      case 'get_release': {
        const { owner, repo, tag } = args as any;
        let response;
        
        if (tag) {
          response = await octokit.rest.repos.getReleaseByTag({
            owner,
            repo,
            tag,
          });
        } else {
          response = await octokit.rest.repos.getLatestRelease({
            owner,
            repo,
          });
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(sanitizeOutput(response.data), null, 2),
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
            text: JSON.stringify(sanitizeOutput(response.data), null, 2),
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