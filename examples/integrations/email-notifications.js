/**
 * Email Notification Integration Example
 * Sends deployment notifications via email using nodemailer
 */

const nodemailer = require('nodemailer');

class EmailNotifier {
  constructor(smtpConfig) {
    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port || 587,
      secure: smtpConfig.secure || false,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass
      }
    });
    
    this.fromEmail = smtpConfig.fromEmail;
    this.toEmails = smtpConfig.toEmails || [];
  }

  /**
   * Send deployment started notification
   */
  async notifyDeploymentStarted(environment, version, deployer) {
    const mailOptions = {
      from: this.fromEmail,
      to: this.toEmails.join(', '),
      subject: `🚀 Deployment Started - ${environment} - ${version}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0078D4; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">🚀 Deployment Started</h2>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; font-weight: bold;">Environment:</td>
                <td style="padding: 10px;">${environment}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Version:</td>
                <td style="padding: 10px;">${version}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Status:</td>
                <td style="padding: 10px;">⏳ In Progress</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Deployed by:</td>
                <td style="padding: 10px;">${deployer}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Started at:</td>
                <td style="padding: 10px;">${new Date().toISOString()}</td>
              </tr>
            </table>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email notification sent: Deployment started');
    } catch (error) {
      console.error('Failed to send email notification:', error.message);
    }
  }

  /**
   * Send deployment success notification
   */
  async notifyDeploymentSuccess(environment, version, duration, deployer) {
    const mailOptions = {
      from: this.fromEmail,
      to: this.toEmails.join(', '),
      subject: `✅ Deployment Successful - ${environment} - ${version}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28A745; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">✅ Deployment Successful</h2>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; font-weight: bold;">Environment:</td>
                <td style="padding: 10px;">${environment}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Version:</td>
                <td style="padding: 10px;">${version}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Duration:</td>
                <td style="padding: 10px;">${duration}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Status:</td>
                <td style="padding: 10px; color: #28A745; font-weight: bold;">✅ Success</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Deployed by:</td>
                <td style="padding: 10px;">${deployer}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Completed at:</td>
                <td style="padding: 10px;">${new Date().toISOString()}</td>
              </tr>
            </table>
            <div style="margin-top: 20px; padding: 15px; background-color: #d4edda; border-left: 4px solid #28A745;">
              <p style="margin: 0; color: #155724;">The deployment has been completed successfully.</p>
            </div>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email notification sent: Deployment successful');
    } catch (error) {
      console.error('Failed to send email notification:', error.message);
    }
  }

  /**
   * Send deployment failure notification
   */
  async notifyDeploymentFailure(environment, version, error, deployer) {
    const mailOptions = {
      from: this.fromEmail,
      to: this.toEmails.join(', '),
      subject: `❌ Deployment Failed - ${environment} - ${version}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #DC3545; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">❌ Deployment Failed</h2>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; font-weight: bold;">Environment:</td>
                <td style="padding: 10px;">${environment}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Version:</td>
                <td style="padding: 10px;">${version}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Status:</td>
                <td style="padding: 10px; color: #DC3545; font-weight: bold;">❌ Failed</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Deployed by:</td>
                <td style="padding: 10px;">${deployer}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Failed at:</td>
                <td style="padding: 10px;">${new Date().toISOString()}</td>
              </tr>
            </table>
            <div style="margin-top: 20px; padding: 15px; background-color: #f8d7da; border-left: 4px solid #DC3545;">
              <p style="margin: 0 0 10px 0; color: #721c24; font-weight: bold;">Error Details:</p>
              <pre style="margin: 0; color: #721c24; white-space: pre-wrap; word-wrap: break-word;">${error}</pre>
            </div>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email notification sent: Deployment failed');
    } catch (error) {
      console.error('Failed to send email notification:', error.message);
    }
  }

  /**
   * Send custom notification
   */
  async sendCustomNotification(subject, message, isHtml = true) {
    const mailOptions = {
      from: this.fromEmail,
      to: this.toEmails.join(', '),
      subject: subject
    };

    if (isHtml) {
      mailOptions.html = message;
    } else {
      mailOptions.text = message;
    }

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email notification sent: Custom notification');
    } catch (error) {
      console.error('Failed to send email notification:', error.message);
    }
  }

  /**
   * Send PR notification
   */
  async notifyPullRequest(action, prNumber, title, author, repoName, repoUrl) {
    const actionEmoji = {
      'opened': '🆕',
      'merged': '✅',
      'closed': '❌',
      'approved': '👍'
    };

    const actionColor = {
      'opened': '#0078D4',
      'merged': '#28A745',
      'closed': '#DC3545',
      'approved': '#28A745'
    };

    const mailOptions = {
      from: this.fromEmail,
      to: this.toEmails.join(', '),
      subject: `${actionEmoji[action] || '📝'} Pull Request ${action} - ${repoName} #${prNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${actionColor[action] || '#0078D4'}; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">${actionEmoji[action] || '📝'} Pull Request ${action}</h2>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
            <h3 style="margin-top: 0;">${title}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; font-weight: bold;">Repository:</td>
                <td style="padding: 10px;">${repoName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">PR Number:</td>
                <td style="padding: 10px;">#${prNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Author:</td>
                <td style="padding: 10px;">${author}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Action:</td>
                <td style="padding: 10px;">${action}</td>
              </tr>
            </table>
            <div style="margin-top: 20px;">
              <a href="${repoUrl}/pull/${prNumber}" style="display: inline-block; padding: 10px 20px; background-color: ${actionColor[action] || '#0078D4'}; color: white; text-decoration: none; border-radius: 5px;">View Pull Request</a>
            </div>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email notification sent: PR ${action}`);
    } catch (error) {
      console.error('Failed to send email notification:', error.message);
    }
  }
}

// Usage example
if (require.main === module) {
  const notifier = new EmailNotifier({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromEmail: process.env.SMTP_FROM_EMAIL,
    toEmails: (process.env.SMTP_TO_EMAILS || '').split(',')
  });

  // Example: Deployment started
  notifier.notifyDeploymentStarted('production', 'v1.2.3', 'john.doe');
}

module.exports = EmailNotifier;
