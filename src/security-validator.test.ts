import { validateForSensitiveData, sanitizeForLogging, sanitizeOutput, validateUserInput } from './security-validator.js';

// Produces a non-secret test fixture at runtime without embedding a token-shaped value in source.
const syntheticGithubToken = (tokenType: 'p' | 'o' | 'u') =>
  ['g', 'h', tokenType, '_', 'abcdefghijklmnopqrstuvwxyz1234567890'].join('');

describe('security-validator', () => {
  describe('validateForSensitiveData', () => {
    it('should validate correctly for no sensitive data', () => {
      const result = validateForSensitiveData('hello world');
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should detect GitHub personal access token', () => {
      const result = validateForSensitiveData(syntheticGithubToken('p'));
      expect(result.isValid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].pattern).toBe('GitHub Personal Access Token');
    });

    it('should ignore placeholders', () => {
      const result = validateForSensitiveData('ghp_' + 'example12345678901234567890123456789');
      expect(result.isValid).toBe(true);
    });

    it('should fail validation for @test.com emails', () => {
      const result = validateForSensitiveData('user@' + 'test.com');
      expect(result.isValid).toBe(false);
      expect(result.violations[0].pattern).toBe('Email Address');
    });

    it('should succeed validation for @example.com emails', () => {
      const result = validateForSensitiveData('user@' + 'example.com');
      expect(result.isValid).toBe(true);
    });

    it('should handle non-string or empty input', () => {
      const resultNull = validateForSensitiveData(null as any);
      expect(resultNull.isValid).toBe(true);
      const resultUndefined = validateForSensitiveData(undefined as any);
      expect(resultUndefined.isValid).toBe(true);
    });
  });

  describe('sanitizeForLogging', () => {
    it('should partially redact strings longer than 8 chars', () => {
      expect(sanitizeForLogging('abcdefghij')).toBe('abcd***ghij');
    });

    it('should fully redact strings shorter than 8 chars', () => {
      expect(sanitizeForLogging('abcdefg')).toBe('***');
    });
  });

  describe('sanitizeOutput', () => {
    it('should redact sensitive tokens in strings', () => {
      const sanitized = sanitizeOutput('Here is my token ' + syntheticGithubToken('p') + ' for testing');
      expect(sanitized).toBe('Here is my token [REDACTED_GITHUB_PERSONAL_ACCESS_TOKEN] for testing');
    });

    it('should recursively sanitize objects and arrays', () => {
      const input = {
        message: 'hello',
        token: syntheticGithubToken('o'),
        nested: [syntheticGithubToken('u')]
      };

      const expected = {
        message: 'hello',
        token: '[REDACTED_GITHUB_OAUTH_ACCESS_TOKEN]',
        nested: ['[REDACTED_GITHUB_USER_ACCESS_TOKEN]']
      };

      expect(sanitizeOutput(input)).toEqual(expected);
    });

    it('should ignore placeholders when sanitizing', () => {
      const sanitized = sanitizeOutput('Token: ' + 'ghp_' + 'example12345678901234567890123456789');
      expect(sanitized).toBe('Token: ' + 'ghp_' + 'example12345678901234567890123456789');
    });

    it('should return primitive non-string types directly', () => {
      expect(sanitizeOutput(123)).toBe(123);
      expect(sanitizeOutput(true)).toBe(true);
      expect(sanitizeOutput(null)).toBe(null);
      expect(sanitizeOutput(undefined)).toBe(undefined);
    });
  });

  describe('validateUserInput', () => {
    it('should not throw for clean input', () => {
      expect(() => validateUserInput('clean text')).not.toThrow();
    });

    it('should throw error for sensitive input in string', () => {
      expect(() => validateUserInput(syntheticGithubToken('p'))).toThrow(/Sensitive data detected in input/);
    });

    it('should throw error for sensitive input in nested object', () => {
      expect(() => validateUserInput({ nested: { key: syntheticGithubToken('p') } })).toThrow(/Sensitive data detected in input.nested.key/);
    });

    it('should validate array elements', () => {
      expect(() => validateUserInput(['clean', syntheticGithubToken('p')])).toThrow(/Sensitive data detected in input\[1\]/);
    });
  });
});
