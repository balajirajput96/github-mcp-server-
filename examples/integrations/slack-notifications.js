/**
 * Slack Integration Example
 * Sends deployment notifications to Slack channels
 */

const { WebClient } = require('@slack/web-api');

class SlackNotifier {
  constructor(token, channelId) {
    this.client = new WebClient(token);
    this.channelId = channelId;
  }

  /**
   * Send deployment started notification
   */
  async notifyDeploymentStarted(environment, version, deployer) {
    try {
      await this.client.chat.postMessage({
        channel: this.channelId,
        text: `🚀 Deployment Started`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "🚀 Deployment Started",
              emoji: true
            }
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Environment:*\n${environment}`
              },
              {
                type: "mrkdwn",
                text: `*Version:*\n${version}`
              },
              {
                type: "mrkdwn",
                text: `*Deployed by:*\n${deployer}`
              },
              {
                type: "mrkdwn",
                text: `*Status:*\n⏳ In Progress`
              }
            ]
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Started at ${new Date().toISOString()}`
              }
            ]
          }
        ]
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  /**
   * Send deployment success notification
   */
  async notifyDeploymentSuccess(environment, version, duration, deployer) {
    try {
      await this.client.chat.postMessage({
        channel: this.channelId,
        text: `✅ Deployment Successful`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "✅ Deployment Successful",
              emoji: true
            }
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Environment:*\n${environment}`
              },
              {
                type: "mrkdwn",
                text: `*Version:*\n${version}`
              },
              {
                type: "mrkdwn",
                text: `*Deployed by:*\n${deployer}`
              },
              {
                type: "mrkdwn",
                text: `*Duration:*\n${duration}`
              }
            ]
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Completed at ${new Date().toISOString()}`
              }
            ]
          }
        ]
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  /**
   * Send deployment failure notification
   */
  async notifyDeploymentFailure(environment, version, error, deployer) {
    try {
      await this.client.chat.postMessage({
        channel: this.channelId,
        text: `❌ Deployment Failed`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "❌ Deployment Failed",
              emoji: true
            }
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Environment:*\n${environment}`
              },
              {
                type: "mrkdwn",
                text: `*Version:*\n${version}`
              },
              {
                type: "mrkdwn",
                text: `*Deployed by:*\n${deployer}`
              },
              {
                type: "mrkdwn",
                text: `*Status:*\n❌ Failed`
              }
            ]
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Error:*\n\`\`\`${error}\`\`\``
            }
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View Logs"
                },
                style: "danger",
                url: "https://your-logging-url.com"
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Rollback"
                },
                style: "primary",
                value: "rollback"
              }
            ]
          }
        ]
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  /**
   * Send custom message
   */
  async sendMessage(title, message, level = 'info') {
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    try {
      await this.client.chat.postMessage({
        channel: this.channelId,
        text: `${emoji[level]} ${title}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${emoji[level]} *${title}*\n${message}`
            }
          }
        ]
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }
}

// Usage example
if (require.main === module) {
  const notifier = new SlackNotifier(
    process.env.SLACK_BOT_TOKEN,
    process.env.SLACK_CHANNEL_ID
  );

  // Example: Deployment started
  notifier.notifyDeploymentStarted('production', 'v1.2.3', 'john.doe');

  // Example: Deployment succeeded
  setTimeout(() => {
    notifier.notifyDeploymentSuccess('production', 'v1.2.3', '3m 45s', 'john.doe');
  }, 3000);
}

module.exports = SlackNotifier;
