/**
 * Jira Integration Example
 * Automates issue creation and updates based on deployment events
 */

const axios = require('axios');

class JiraIntegration {
  constructor(url, email, apiToken, projectKey) {
    this.url = url;
    this.projectKey = projectKey;
    this.auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    this.headers = {
      'Authorization': `Basic ${this.auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Create a deployment issue
   */
  async createDeploymentIssue(summary, description, environment) {
    try {
      const response = await axios.post(
        `${this.url}/rest/api/3/issue`,
        {
          fields: {
            project: { key: this.projectKey },
            summary: summary,
            description: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: description
                    }
                  ]
                }
              ]
            },
            issuetype: { name: 'Task' },
            labels: ['deployment', environment],
            priority: { name: 'High' }
          }
        },
        { headers: this.headers }
      );

      console.log(`✅ Created Jira issue: ${response.data.key}`);
      return response.data;
    } catch (error) {
      console.error('Failed to create Jira issue:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a bug report from deployment failure
   */
  async createBugFromFailure(summary, error, version, environment) {
    try {
      const response = await axios.post(
        `${this.url}/rest/api/3/issue`,
        {
          fields: {
            project: { key: this.projectKey },
            summary: `[${environment}] Deployment Failed: ${summary}`,
            description: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'heading',
                  attrs: { level: 3 },
                  content: [{ type: 'text', text: 'Deployment Information' }]
                },
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Version: ', marks: [{ type: 'strong' }] },
                    { type: 'text', text: version }
                  ]
                },
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Environment: ', marks: [{ type: 'strong' }] },
                    { type: 'text', text: environment }
                  ]
                },
                {
                  type: 'heading',
                  attrs: { level: 3 },
                  content: [{ type: 'text', text: 'Error Details' }]
                },
                {
                  type: 'codeBlock',
                  content: [{ type: 'text', text: error }]
                }
              ]
            },
            issuetype: { name: 'Bug' },
            labels: ['deployment-failure', environment, version],
            priority: { name: 'Critical' }
          }
        },
        { headers: this.headers }
      );

      console.log(`🐛 Created bug report: ${response.data.key}`);
      return response.data;
    } catch (error) {
      console.error('Failed to create bug report:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update issue with deployment status
   */
  async updateIssue(issueKey, comment, transitionName = null) {
    try {
      // Add comment
      await axios.post(
        `${this.url}/rest/api/3/issue/${issueKey}/comment`,
        {
          body: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: comment
                  }
                ]
              }
            ]
          }
        },
        { headers: this.headers }
      );

      // Transition issue if needed
      if (transitionName) {
        const transitions = await this.getTransitions(issueKey);
        const transition = transitions.find(t => t.name === transitionName);
        
        if (transition) {
          await axios.post(
            `${this.url}/rest/api/3/issue/${issueKey}/transitions`,
            {
              transition: { id: transition.id }
            },
            { headers: this.headers }
          );
        }
      }

      console.log(`✅ Updated issue: ${issueKey}`);
    } catch (error) {
      console.error('Failed to update issue:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get available transitions for an issue
   */
  async getTransitions(issueKey) {
    try {
      const response = await axios.get(
        `${this.url}/rest/api/3/issue/${issueKey}/transitions`,
        { headers: this.headers }
      );
      return response.data.transitions;
    } catch (error) {
      console.error('Failed to get transitions:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Link deployment to existing issue
   */
  async linkDeployment(issueKey, deploymentUrl, environment) {
    try {
      await axios.post(
        `${this.url}/rest/api/3/issue/${issueKey}/remotelink`,
        {
          object: {
            url: deploymentUrl,
            title: `Deployment to ${environment}`,
            icon: {
              url16x16: "https://github.com/favicon.ico"
            }
          }
        },
        { headers: this.headers }
      );

      console.log(`🔗 Linked deployment to issue: ${issueKey}`);
    } catch (error) {
      console.error('Failed to link deployment:', error.response?.data || error.message);
    }
  }

  /**
   * Search for issues
   */
  async searchIssues(jql) {
    try {
      const response = await axios.get(
        `${this.url}/rest/api/3/search`,
        {
          params: { jql },
          headers: this.headers
        }
      );
      return response.data.issues;
    } catch (error) {
      console.error('Failed to search issues:', error.response?.data || error.message);
      return [];
    }
  }
}

// Usage example
if (require.main === module) {
  const jira = new JiraIntegration(
    process.env.JIRA_URL,
    process.env.JIRA_EMAIL,
    process.env.JIRA_API_TOKEN,
    'PROJ'
  );

  // Example: Create deployment issue
  jira.createDeploymentIssue(
    'Deploy v1.2.3 to Production',
    'Deploying version 1.2.3 with new features and bug fixes',
    'production'
  ).then(issue => {
    console.log('Issue created:', issue.key);
  }).catch(error => {
    console.error('Error:', error.message);
  });
}

module.exports = JiraIntegration;
