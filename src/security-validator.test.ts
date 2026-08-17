import { validateForSensitiveData, sanitizeForLogging, sanitizeOutput, validateUserInput } from './security-validator.js';

// Build synthetic fixtures from separate fragments so repository secret scanners do not treat them as credentials.
const fakeGithubPat = ['ghp_', 'abcdefghijklmnopqrstuvwxyz1234567890'].join('');
const fakeGithubOauth = ['gho_', 'abcdefghijklmnopqrstuvwxyz1234567890'].join('');
const fakeGithubUser = ['ghu_', 'abcdefghijklmnopqrstuvwxyz1234567890'].join('');

describe('security-validator', () => {
  describe('validateForSensitiveData', () => {
    it('should validate correctly for no sensitive data', () => {
      const result = validateForSensitiveData('hello world');
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should detect GitHub personal access token', () => {
      const result = validateForSensitiveData(fakeGithubPat);
      expect(result.isValid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].pattern).toBe('GitHub Personal Access Token');
    });

    it('should ignore placeholders', () => {
      const result = validateForSensitiveData('ghp_your_token_here');
      expect(result.isValid).toBe(true);
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
      const sanitized = sanitizeOutput(`Here is my token ${fakeGithubPat} for testing`);
      expect(sanitized).toBe('Here is my token [REDACTED_GITHUB_PERSONAL_ACCESS_TOKEN] for testing');
    });

    it('should recursively sanitize objects and arrays', () => {
      const input = {
        message: 'hello',
        token: fakeGithubOauth,
        nested: [fakeGithubUser]
      };

      const expected = {
        message: 'hello',
        token: '[REDACTED_GITHUB_OAUTH_ACCESS_TOKEN]',
        nested: ['[REDACTED_GITHUB_USER_ACCESS_TOKEN]']
      };

      expect(sanitizeOutput(input)).toEqual(expected);
    });
  });

  describe('validateUserInput', () => {
    it('should not throw for clean input', () => {
      expect(() => validateUserInput('clean text')).not.toThrow();
    });

    it('should throw error for sensitive input in string', () => {
      expect(() => validateUserInput(fakeGithubPat)).toThrow(/Sensitive data detected in input/);
    });

    it('should throw error for sensitive input in nested object', () => {
      expect(() => validateUserInput({ nested: { key: fakeGithubPat } })).toThrow(/Sensitive data detected in input.nested.key/);
    });
  });
});
