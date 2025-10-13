/**
 * Security validation module to detect and prevent sensitive data exposure
 */

/**
 * Common patterns for sensitive data that should never be exposed
 */
const SENSITIVE_PATTERNS = [
  // GitHub tokens
  { pattern: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub Personal Access Token' },
  { pattern: /gho_[a-zA-Z0-9]{36}/, name: 'GitHub OAuth Access Token' },
  { pattern: /ghu_[a-zA-Z0-9]{36}/, name: 'GitHub User Access Token' },
  { pattern: /ghs_[a-zA-Z0-9]{36}/, name: 'GitHub Server-to-Server Token' },
  { pattern: /ghr_[a-zA-Z0-9]{36}/, name: 'GitHub Refresh Token' },
  
  // Slack tokens
  { pattern: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,}/, name: 'Slack Token' },
  { pattern: /xoxe\.xoxp-1-[a-zA-Z0-9-]+/, name: 'Slack OAuth Token' },
  { pattern: /xoxe-1-[a-zA-Z0-9-]+/, name: 'Slack Enterprise Token' },
  
  // AWS credentials
  { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key ID' },
  { pattern: /aws_secret_access_key\s*=\s*[a-zA-Z0-9/+=]{40}/, name: 'AWS Secret Access Key' },
  
  // Generic API keys and secrets
  { pattern: /api[_-]?key[_-]?[=:]\s*['"]?[a-zA-Z0-9]{20,}['"]?/i, name: 'API Key' },
  { pattern: /secret[_-]?key[_-]?[=:]\s*['"]?[a-zA-Z0-9]{20,}['"]?/i, name: 'Secret Key' },
  { pattern: /bearer\s+[a-zA-Z0-9\-._~+/]+=*/i, name: 'Bearer Token' },
  
  // Private keys
  { pattern: /-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH)?\s*PRIVATE KEY-----/, name: 'Private Key' },
  
  // Google OAuth
  { pattern: /ya29\.[0-9A-Za-z\-_]+/, name: 'Google OAuth Access Token' },
  
  // Generic long alphanumeric strings that might be tokens
  { pattern: /[a-zA-Z0-9]{50,}/, name: 'Potential Token (long alphanumeric string)' },
  
  // Email addresses (potential PII/credential identifiers)
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, name: 'Email Address' },
  
  // Password patterns - strings followed by password-related keywords
  { pattern: /\b[A-Za-z0-9@#$%^&*()_+=\-!]{8,}\s+(?:ye\s+)?(?:password|pasword|passwd|pwd|pass)\b/i, name: 'Password' },
  { pattern: /\b(?:password|pasword|passwd|pwd|pass)[\s:=]+[A-Za-z0-9@#$%^&*()_+=\-!]{8,}\b/i, name: 'Password' },
];

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  violations: Array<{
    pattern: string;
    match: string;
    position: number;
  }>;
}

/**
 * Validates text for sensitive data patterns
 * @param text - The text to validate
 * @param strict - If true, uses strict validation (default: true)
 * @returns ValidationResult with any detected violations
 */
export function validateForSensitiveData(text: string, strict: boolean = true): ValidationResult {
  const violations: Array<{ pattern: string; match: string; position: number }> = [];
  
  if (!text || typeof text !== 'string') {
    return { isValid: true, violations: [] };
  }
  
  for (const { pattern, name } of SENSITIVE_PATTERNS) {
    const matches = text.matchAll(new RegExp(pattern, 'g'));
    
    for (const match of matches) {
      // Skip if it's a placeholder or example value
      if (isPlaceholder(match[0])) {
        continue;
      }
      
      violations.push({
        pattern: name,
        match: sanitizeForLogging(match[0]),
        position: match.index || 0,
      });
    }
  }
  
  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Checks if a value appears to be a placeholder rather than real credential
 * @param value - The value to check
 * @returns true if it appears to be a placeholder
 */
function isPlaceholder(value: string): boolean {
  const placeholderPatterns = [
    /your[_-]?token/i,
    /your[_-]?key/i,
    /your[_-]?secret/i,
    /example/i,
    /placeholder/i,
    /xxx+/i,
    /\*\*\*+/,
    /test[_-]?token/i,
    /dummy/i,
    /sample/i,
    /user@example\.com/i,
    /test@test\.com/i,
    /@test\.com$/i,
    /@example\./i,
    /no-?reply@/i,
  ];
  
  return placeholderPatterns.some(pattern => pattern.test(value));
}

/**
 * Sanitizes sensitive data for safe logging
 * @param value - The value to sanitize
 * @returns Partially redacted value for logging
 */
export function sanitizeForLogging(value: string): string {
  if (!value || value.length < 8) {
    return '***';
  }
  
  // Show first 4 and last 4 characters, mask the rest
  const visibleChars = 4;
  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  const maskedLength = Math.max(value.length - (visibleChars * 2), 3);
  
  return `${start}${'*'.repeat(maskedLength)}${end}`;
}

/**
 * Sanitizes output data to remove any accidentally exposed tokens
 * @param data - The data object to sanitize
 * @returns Sanitized data
 */
export function sanitizeOutput(data: any): any {
  if (typeof data === 'string') {
    let sanitized = data;
    
    // Directly apply pattern matching and replacement
    for (const { pattern, name } of SENSITIVE_PATTERNS) {
      const matches = sanitized.matchAll(new RegExp(pattern, 'g'));
      
      for (const match of Array.from(matches)) {
        // Skip placeholders
        if (isPlaceholder(match[0])) {
          continue;
        }
        
        const redacted = `[REDACTED_${name.replace(/\s+/g, '_').toUpperCase()}]`;
        sanitized = sanitized.replace(match[0], redacted);
      }
    }
    
    return sanitized;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeOutput(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeOutput(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Validates user input for security concerns
 * @param input - The user input to validate
 * @param fieldName - The name of the field being validated
 * @throws Error if validation fails
 */
export function validateUserInput(input: any, fieldName: string = 'input'): void {
  if (typeof input === 'string') {
    const validation = validateForSensitiveData(input);
    
    if (!validation.isValid) {
      const violationDetails = validation.violations
        .map(v => `${v.pattern} at position ${v.position}`)
        .join(', ');
      
      throw new Error(
        `Sensitive data detected in ${fieldName}: ${violationDetails}. ` +
        'Please ensure you are not exposing tokens, API keys, or other credentials.'
      );
    }
  }
  
  if (Array.isArray(input)) {
    input.forEach((item, index) => {
      validateUserInput(item, `${fieldName}[${index}]`);
    });
  }
  
  if (input && typeof input === 'object') {
    for (const [key, value] of Object.entries(input)) {
      validateUserInput(value, `${fieldName}.${key}`);
    }
  }
}
