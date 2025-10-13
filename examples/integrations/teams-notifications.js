/**
 * Microsoft Teams Integration Example
 * Sends deployment notifications to Teams channels via Incoming Webhooks
 */

const axios = require('axios');

class TeamsNotifier {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  /**
   * Send deployment started notification
   */
  async notifyDeploymentStarted(environment, version, deployer) {
    const card = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      "summary": "Deployment Started",
      "themeColor": "0078D4",
      "title": "🚀 Deployment Started",
      "sections": [
        {
          "activityTitle": `${deployer} initiated deployment`,
          "activitySubtitle": new Date().toISOString(),
          "activityImage": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
          "facts": [
            {
              "name": "Environment:",
              "value": environment
            },
            {
              "name": "Version:",
              "value": version
            },
            {
              "name": "Status:",
              "value": "⏳ In Progress"
            },
            {
              "name": "Deployed by:",
              "value": deployer
            }
          ],
          "markdown": true
        }
      ]
    };

    try {
      await axios.post(this.webhookUrl, card);
      console.log('Teams notification sent: Deployment started');
    } catch (error) {
      console.error('Failed to send Teams notification:', error.message);
    }
  }

  /**
   * Send deployment success notification
   */
  async notifyDeploymentSuccess(environment, version, duration, deployer) {
    const card = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      "summary": "Deployment Successful",
      "themeColor": "28A745",
      "title": "✅ Deployment Successful",
      "sections": [
        {
          "activityTitle": `Deployment completed by ${deployer}`,
          "activitySubtitle": new Date().toISOString(),
          "activityImage": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
          "facts": [
            {
              "name": "Environment:",
              "value": environment
            },
            {
              "name": "Version:",
              "value": version
            },
            {
              "name": "Duration:",
              "value": duration
            },
            {
              "name": "Status:",
              "value": "✅ Success"
            },
            {
              "name": "Deployed by:",
              "value": deployer
            }
          ],
          "markdown": true
        }
      ],
      "potentialAction": [
        {
          "@type": "OpenUri",
          "name": "View Deployment",
          "targets": [
            {
              "os": "default",
              "uri": "https://github.com"
            }
          ]
        }
      ]
    };

    try {
      await axios.post(this.webhookUrl, card);
      console.log('Teams notification sent: Deployment successful');
    } catch (error) {
      console.error('Failed to send Teams notification:', error.message);
    }
  }

  /**
   * Send deployment failure notification
   */
  async notifyDeploymentFailure(environment, version, error, deployer) {
    const card = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      "summary": "Deployment Failed",
      "themeColor": "DC3545",
      "title": "❌ Deployment Failed",
      "sections": [
        {
          "activityTitle": `Deployment failed for ${deployer}`,
          "activitySubtitle": new Date().toISOString(),
          "activityImage": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
          "facts": [
            {
              "name": "Environment:",
              "value": environment
            },
            {
              "name": "Version:",
              "value": version
            },
            {
              "name": "Status:",
              "value": "❌ Failed"
            },
            {
              "name": "Error:",
              "value": error.substring(0, 200) + (error.length > 200 ? '...' : '')
            },
            {
              "name": "Deployed by:",
              "value": deployer
            }
          ],
          "markdown": true
        }
      ],
      "potentialAction": [
        {
          "@type": "OpenUri",
          "name": "View Logs",
          "targets": [
            {
              "os": "default",
              "uri": "https://github.com"
            }
          ]
        }
      ]
    };

    try {
      await axios.post(this.webhookUrl, card);
      console.log('Teams notification sent: Deployment failed');
    } catch (error) {
      console.error('Failed to send Teams notification:', error.message);
    }
  }

  /**
   * Send custom notification
   */
  async sendCustomNotification(title, message, themeColor = '0078D4') {
    const card = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      "summary": title,
      "themeColor": themeColor,
      "title": title,
      "text": message
    };

    try {
      await axios.post(this.webhookUrl, card);
      console.log('Teams notification sent: Custom notification');
    } catch (error) {
      console.error('Failed to send Teams notification:', error.message);
    }
  }

  /**
   * Send PR notification
   */
  async notifyPullRequest(action, prNumber, title, author, repoUrl) {
    const actionEmoji = {
      'opened': '🆕',
      'merged': '✅',
      'closed': '❌',
      'approved': '👍'
    };

    const actionColor = {
      'opened': '0078D4',
      'merged': '28A745',
      'closed': 'DC3545',
      'approved': '28A745'
    };

    const card = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      "summary": `Pull Request ${action}`,
      "themeColor": actionColor[action] || '0078D4',
      "title": `${actionEmoji[action] || '📝'} Pull Request ${action}`,
      "sections": [
        {
          "activityTitle": title,
          "activitySubtitle": `PR #${prNumber} by ${author}`,
          "facts": [
            {
              "name": "Action:",
              "value": action
            },
            {
              "name": "PR Number:",
              "value": `#${prNumber}`
            },
            {
              "name": "Author:",
              "value": author
            }
          ],
          "markdown": true
        }
      ],
      "potentialAction": [
        {
          "@type": "OpenUri",
          "name": "View Pull Request",
          "targets": [
            {
              "os": "default",
              "uri": `${repoUrl}/pull/${prNumber}`
            }
          ]
        }
      ]
    };

    try {
      await axios.post(this.webhookUrl, card);
      console.log(`Teams notification sent: PR ${action}`);
    } catch (error) {
      console.error('Failed to send Teams notification:', error.message);
    }
  }
}

// Usage example
if (require.main === module) {
  const notifier = new TeamsNotifier(process.env.TEAMS_WEBHOOK_URL);

  // Example: Deployment started
  notifier.notifyDeploymentStarted('production', 'v1.2.3', 'john.doe');

  // Example: Deployment succeeded
  setTimeout(() => {
    notifier.notifyDeploymentSuccess('production', 'v1.2.3', '3m 45s', 'john.doe');
  }, 3000);
}

module.exports = TeamsNotifier;
