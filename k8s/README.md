# Kubernetes Deployment

This directory contains Kubernetes configuration files for deploying the GitHub MCP Server to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (v1.20+)
- `kubectl` configured to access your cluster
- Docker image built and pushed to a container registry
- SSL certificate (optional, for HTTPS)

## Quick Start

1. **Create namespace:**
```bash
kubectl create namespace github-mcp
```

2. **Create secrets:**
```bash
kubectl create secret generic github-mcp-secrets \
  --from-literal=github-token=YOUR_GITHUB_TOKEN \
  --from-literal=slack-bot-token=YOUR_SLACK_TOKEN \
  --from-literal=slack-signing-secret=YOUR_SLACK_SECRET \
  -n github-mcp
```

3. **Deploy the application:**
```bash
kubectl apply -f deployment.yaml -n github-mcp
kubectl apply -f service.yaml -n github-mcp
kubectl apply -f ingress.yaml -n github-mcp
kubectl apply -f hpa.yaml -n github-mcp
```

4. **Verify deployment:**
```bash
kubectl get pods -n github-mcp
kubectl get svc -n github-mcp
kubectl get ingress -n github-mcp
```

## Configuration Files

### deployment.yaml
- Defines the application deployment
- Configures 3 replicas by default
- Sets resource limits and requests
- Includes health checks (liveness and readiness probes)
- Mounts ConfigMap for configuration
- Uses secrets for sensitive data

### service.yaml
- Creates a LoadBalancer service
- Exposes port 80
- Maps to container port 3000
- Configures session affinity

### ingress.yaml
- Configures HTTPS ingress
- Uses nginx ingress controller
- Integrates with cert-manager for SSL
- Sets up rate limiting

### hpa.yaml
- Horizontal Pod Autoscaler
- Scales between 3-10 replicas
- Based on CPU (70%) and memory (80%) utilization

### secrets-example.yaml
- Example structure for secrets
- **DO NOT** commit actual secrets
- Use kubectl to create real secrets

## Scaling

### Manual scaling:
```bash
kubectl scale deployment github-mcp-server --replicas=5 -n github-mcp
```

### Auto-scaling:
The HPA will automatically scale based on resource utilization.

## Monitoring

### View logs:
```bash
kubectl logs -f deployment/github-mcp-server -n github-mcp
```

### Check pod status:
```bash
kubectl get pods -n github-mcp -w
```

### Describe pod for debugging:
```bash
kubectl describe pod POD_NAME -n github-mcp
```

## Updating

### Rolling update:
```bash
# Update image
kubectl set image deployment/github-mcp-server \
  github-mcp-server=your-registry/github-mcp-server:v2 \
  -n github-mcp

# Check rollout status
kubectl rollout status deployment/github-mcp-server -n github-mcp
```

### Rollback:
```bash
kubectl rollout undo deployment/github-mcp-server -n github-mcp
```

## Cleanup

```bash
kubectl delete namespace github-mcp
```

## Production Considerations

1. **Use a specific image tag instead of `latest`**
2. **Configure resource requests/limits based on actual usage**
3. **Set up monitoring (Prometheus, Grafana)**
4. **Configure log aggregation (ELK, Loki)**
5. **Implement network policies for security**
6. **Use separate namespaces for different environments**
7. **Configure pod disruption budgets**
8. **Set up backup strategies**

## Troubleshooting

### Pod not starting:
```bash
kubectl describe pod POD_NAME -n github-mcp
kubectl logs POD_NAME -n github-mcp
```

### Service not accessible:
```bash
kubectl get svc -n github-mcp
kubectl get endpoints -n github-mcp
```

### Ingress issues:
```bash
kubectl describe ingress github-mcp-ingress -n github-mcp
kubectl get ingress -n github-mcp
```

For more details, see the [Enterprise Integration Guide](../ENTERPRISE-INTEGRATION.md).
