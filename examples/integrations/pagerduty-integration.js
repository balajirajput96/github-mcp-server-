/**
 * PagerDuty Integration Example
 * Creates incidents and alerts for deployment failures
 */

const axios = require('axios');

class PagerDutyIntegration {
  constructor(apiKey, serviceKey, fromEmail) {
    this.apiKey = apiKey;
    this.serviceKey = serviceKey;
    this.fromEmail = fromEmail;
    this.apiUrl = 'https://api.pagerduty.com';
    this.headers = {
      'Authorization': `Token token=${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'From': fromEmail
    };
  }

  /**
   * Trigger an incident for deployment failure
   */
  async triggerIncident(title, description, severity = 'error') {
    const payload = {
      incident: {
        type: 'incident',
        title: title,
        service: {
          id: this.serviceKey,
          type: 'service_reference'
        },
        urgency: severity === 'critical' ? 'high' : 'low',
        body: {
          type: 'incident_body',
          details: description
        }
      }
    };

    try {
      const response = await axios.post(
        `${this.apiUrl}/incidents`,
        payload,
        { headers: this.headers }
      );
      console.log('PagerDuty incident created:', response.data.incident.id);
      return response.data.incident;
    } catch (error) {
      console.error('Failed to create PagerDuty incident:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Trigger incident for deployment failure
   */
  async triggerDeploymentFailure(environment, version, error, deployer) {
    const title = `Deployment Failed: ${environment} - ${version}`;
    const description = `
Deployment to ${environment} has failed.

**Details:**
- Version: ${version}
- Environment: ${environment}
- Deployed by: ${deployer}
- Timestamp: ${new Date().toISOString()}

**Error:**
${error}

**Action Required:**
Please investigate the deployment failure and take corrective action.
    `.trim();

    return await this.triggerIncident(title, description, 'critical');
  }

  /**
   * Create an event (for Events API v2)
   */
  async createEvent(summary, severity, source, component, customDetails = {}) {
    const payload = {
      routing_key: this.serviceKey,
      event_action: 'trigger',
      payload: {
        summary: summary,
        severity: severity,
        source: source,
        component: component,
        custom_details: customDetails,
        timestamp: new Date().toISOString()
      }
    };

    try {
      const response = await axios.post(
        'https://events.pagerduty.com/v2/enqueue',
        payload
      );
      console.log('PagerDuty event created:', response.data.dedup_key);
      return response.data;
    } catch (error) {
      console.error('Failed to create PagerDuty event:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Resolve an incident
   */
  async resolveIncident(incidentId, resolution) {
    const payload = {
      incident: {
        type: 'incident_reference',
        status: 'resolved',
        resolution: resolution
      }
    };

    try {
      const response = await axios.put(
        `${this.apiUrl}/incidents/${incidentId}`,
        payload,
        { headers: this.headers }
      );
      console.log('PagerDuty incident resolved:', incidentId);
      return response.data.incident;
    } catch (error) {
      console.error('Failed to resolve PagerDuty incident:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Add note to incident
   */
  async addIncidentNote(incidentId, note) {
    const payload = {
      note: {
        content: note
      }
    };

    try {
      const response = await axios.post(
        `${this.apiUrl}/incidents/${incidentId}/notes`,
        payload,
        { headers: this.headers }
      );
      console.log('Note added to incident:', incidentId);
      return response.data.note;
    } catch (error) {
      console.error('Failed to add note to incident:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Acknowledge an incident
   */
  async acknowledgeIncident(incidentId) {
    const payload = {
      incident: {
        type: 'incident_reference',
        status: 'acknowledged'
      }
    };

    try {
      const response = await axios.put(
        `${this.apiUrl}/incidents/${incidentId}`,
        payload,
        { headers: this.headers }
      );
      console.log('PagerDuty incident acknowledged:', incidentId);
      return response.data.incident;
    } catch (error) {
      console.error('Failed to acknowledge PagerDuty incident:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Trigger alert for high error rate
   */
  async triggerHighErrorRate(service, errorRate, threshold) {
    const summary = `High Error Rate Detected: ${errorRate}% (threshold: ${threshold}%)`;
    const customDetails = {
      service: service,
      error_rate: errorRate,
      threshold: threshold,
      timestamp: new Date().toISOString()
    };

    return await this.createEvent(
      summary,
      'error',
      service,
      'monitoring',
      customDetails
    );
  }

  /**
   * Trigger alert for service downtime
   */
  async triggerServiceDowntime(service, duration) {
    const summary = `Service Downtime: ${service} has been down for ${duration}`;
    const customDetails = {
      service: service,
      downtime_duration: duration,
      timestamp: new Date().toISOString()
    };

    return await this.createEvent(
      summary,
      'critical',
      service,
      'health-check',
      customDetails
    );
  }

  /**
   * Get incident details
   */
  async getIncident(incidentId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/incidents/${incidentId}`,
        { headers: this.headers }
      );
      return response.data.incident;
    } catch (error) {
      console.error('Failed to get PagerDuty incident:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * List open incidents
   */
  async listOpenIncidents() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/incidents?statuses[]=triggered&statuses[]=acknowledged`,
        { headers: this.headers }
      );
      return response.data.incidents;
    } catch (error) {
      console.error('Failed to list PagerDuty incidents:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Usage example
if (require.main === module) {
  const pagerduty = new PagerDutyIntegration(
    process.env.PAGERDUTY_API_KEY,
    process.env.PAGERDUTY_SERVICE_KEY,
    process.env.PAGERDUTY_FROM_EMAIL
  );

  // Example: Trigger deployment failure incident
  pagerduty.triggerDeploymentFailure(
    'production',
    'v1.2.3',
    'Database connection timeout',
    'deploy-bot'
  ).then(incident => {
    console.log('Incident created:', incident.id);
  }).catch(error => {
    console.error('Error:', error.message);
  });
}

module.exports = PagerDutyIntegration;
