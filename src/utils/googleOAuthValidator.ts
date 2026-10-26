/**
 * Google OAuth 2.0 Client ID and Origin Validation Utility
 *
 * Specifically designed to diagnose Google OAuth 2.0 configuration errors,
 * notably "Error 401: invalid_client" (The OAuth client was not found) vs
 * "Error 400: redirect_uri_mismatch / origin_mismatch".
 */

export interface ValidationIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  remediation: string;
}

export interface LikelyCause401 {
  title: string;
  probability: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  action: string;
  consoleUrl?: string;
}

export interface GoogleClientIdValidationResult {
  rawInput: string;
  sanitized: string;
  isValidFormat: boolean;
  projectNumber: string | null;
  clientHash: string | null;
  suffix: string | null;
  detectedType: 'WEB_APPLICATION' | 'API_KEY' | 'CLIENT_SECRET' | 'SERVICE_ACCOUNT' | 'UNKNOWN_FORMAT';
  issues: ValidationIssue[];
  originAnalysis: {
    origin: string;
    protocol: string;
    hostname: string;
    port: string;
    isHttpsOrLocalhost: boolean;
    issues: string[];
  };
  likelyCausesFor401: LikelyCause401[];
  suggestedConsoleUrl: string;
  score: number; // 0 to 100
}

const GOOGLE_CLIENT_ID_REGEX = /^(\d{10,14})-([a-z0-9_-]{28,40})\.apps\.googleusercontent\.com$/i;

/**
 * Validates a Google Client ID string and current origin against Google Identity specifications.
 */
export function validateGoogleClientId(
  rawClientId: string,
  origin: string = typeof window !== 'undefined' ? window.location.origin : ''
): GoogleClientIdValidationResult {
  const issues: ValidationIssue[] = [];
  const trimmed = (rawClientId || '').trim();
  let sanitized = trimmed;

  // 1. Check for leading/trailing quotes often copied from .env or JSON files
  if ((sanitized.startsWith('"') && sanitized.endsWith('"')) || (sanitized.startsWith("'") && sanitized.endsWith("'"))) {
    sanitized = sanitized.slice(1, -1).trim();
    issues.push({
      code: 'ENCLOSING_QUOTES',
      severity: 'error',
      title: 'Enclosing Quotes Detected',
      message: 'The Client ID string contains quotes (" or \') copied from an environment variable or code snippet.',
      remediation: 'Remove the outer quotes so only the bare Client ID is passed to Google Identity Services.',
    });
  }

  // Check for internal whitespace or line breaks
  if (/\s/.test(sanitized)) {
    issues.push({
      code: 'WHITESPACE_IN_CLIENT_ID',
      severity: 'error',
      title: 'Whitespace Inside Client ID',
      message: 'The Client ID contains whitespace or linebreaks, which breaks Google OAuth authentication.',
      remediation: 'Remove any spaces, tabs, or newlines from the Client ID string.',
    });
    sanitized = sanitized.replace(/\s+/g, '');
  }

  // 2. Detect common mistaken credentials
  let detectedType: GoogleClientIdValidationResult['detectedType'] = 'UNKNOWN_FORMAT';

  if (sanitized.startsWith('AIzaSy')) {
    detectedType = 'API_KEY';
    issues.push({
      code: 'API_KEY_PASTED',
      severity: 'error',
      title: 'Google API Key Detected (Wrong Credential Type)',
      message: 'The string starts with "AIzaSy", which is a Google Cloud API Key, not an OAuth 2.0 Web Client ID.',
      remediation: 'Go to Google Cloud Console > APIs & Services > Credentials, click "+ Create Credentials" and select "OAuth client ID" (Application type: Web application).',
    });
  } else if (sanitized.startsWith('GOCSPX-')) {
    detectedType = 'CLIENT_SECRET';
    issues.push({
      code: 'CLIENT_SECRET_PASTED',
      severity: 'error',
      title: 'Google OAuth Client Secret Detected',
      message: 'The string starts with "GOCSPX-", which is an OAuth Client Secret. Secrets must never be exposed on the frontend!',
      remediation: 'Use the Client ID (ending in .apps.googleusercontent.com), not the Client Secret.',
    });
  } else if (sanitized.includes('gserviceaccount.com')) {
    detectedType = 'SERVICE_ACCOUNT';
    issues.push({
      code: 'SERVICE_ACCOUNT_PASTED',
      severity: 'error',
      title: 'Service Account Email Detected',
      message: 'The string appears to be a Google Cloud Service Account email, not a user OAuth 2.0 Client ID.',
      remediation: 'Create an OAuth 2.0 Web Client ID in the Credentials panel.',
    });
  }

  // 3. Regex structural analysis
  const match = sanitized.match(GOOGLE_CLIENT_ID_REGEX);
  let projectNumber: string | null = null;
  let clientHash: string | null = null;
  let suffix: string | null = null;

  if (match) {
    projectNumber = match[1];
    clientHash = match[2];
    suffix = '.apps.googleusercontent.com';
    detectedType = 'WEB_APPLICATION';
  } else {
    // Attempt partial extraction for diagnostics
    const dotIndex = sanitized.indexOf('.apps.googleusercontent.com');
    if (dotIndex !== -1) {
      suffix = sanitized.slice(dotIndex);
      const prefix = sanitized.slice(0, dotIndex);
      const dashIndex = prefix.indexOf('-');
      if (dashIndex !== -1) {
        projectNumber = prefix.slice(0, dashIndex);
        clientHash = prefix.slice(dashIndex + 1);
      }
    }

    if (detectedType === 'UNKNOWN_FORMAT') {
      if (!sanitized.endsWith('.apps.googleusercontent.com')) {
        issues.push({
          code: 'INVALID_SUFFIX',
          severity: 'error',
          title: 'Missing or Invalid Domain Suffix',
          message: 'Google OAuth 2.0 Client IDs must end with ".apps.googleusercontent.com".',
          remediation: 'Ensure the full string is copied without omitting the domain suffix.',
        });
      }
      if (!projectNumber || !/^\d{10,14}$/.test(projectNumber)) {
        issues.push({
          code: 'INVALID_PROJECT_NUMBER',
          severity: 'error',
          title: 'Invalid or Missing Google Cloud Project Number',
          message: `The project number prefix "${projectNumber || 'missing'}" is not a valid 10-14 digit Google Cloud numeric ID.`,
          remediation: 'Check your Google Cloud Project Number in the Project Settings page.',
        });
      }
      if (!clientHash || clientHash.length < 24) {
        issues.push({
          code: 'SUSPICIOUS_CLIENT_HASH',
          severity: 'error',
          title: 'Truncated or Invalid Client Hash',
          message: 'The unique alphanumeric hash after the project number is truncated or malformed.',
          remediation: 'Recopy the Client ID directly from the Google Cloud Console credential list.',
        });
      }
    }
  }

  // 4. Origin Analysis
  const originIssues: string[] = [];
  let protocol = '';
  let hostname = '';
  let port = '';
  let isHttpsOrLocalhost = false;

  try {
    if (origin) {
      const parsedUrl = new URL(origin);
      protocol = parsedUrl.protocol;
      hostname = parsedUrl.hostname;
      port = parsedUrl.port;

      isHttpsOrLocalhost =
        protocol === 'https:' ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1';

      if (origin.endsWith('/')) {
        originIssues.push('Origin has a trailing slash. Google Authorized JavaScript Origins MUST NOT include a trailing slash.');
      }
      if (protocol !== 'https:' && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        originIssues.push('Google OAuth in production requires HTTPS. HTTP is only permitted on localhost.');
      }
    }
  } catch (e) {
    originIssues.push(`Invalid origin string: "${origin}"`);
  }

  // 5. Root Causes for 401: invalid_client
  // Note: 401 invalid_client means Google's servers don't find this client in their database.
  const likelyCausesFor401: LikelyCause401[] = [
    {
      title: 'Client ID Was Deleted or Does Not Exist in Google Cloud',
      probability: 'HIGH',
      explanation: `Google's OAuth authorization server returned "The OAuth client was not found". This means Google Cloud has no record of client ID "${sanitized}". Even if the format is syntactically valid, Google cannot find it.`,
      action: 'Open Google Cloud Console Credentials and confirm this exact Client ID exists and has not been deleted or replaced.',
      consoleUrl: projectNumber
        ? `https://console.cloud.google.com/apis/credentials?project=${projectNumber}`
        : 'https://console.cloud.google.com/apis/credentials',
    },
    {
      title: 'Client ID Created as Android / iOS / Desktop instead of "Web application"',
      probability: 'HIGH',
      explanation: 'If the OAuth client was created for Android, iOS, or Desktop application in the Google Cloud Console, Google Identity Services Web SDK will reject it with "Error 401: invalid_client".',
      action: 'In Google Cloud Console, create a new OAuth Client ID and specifically select "Web application" as the Application Type.',
      consoleUrl: 'https://console.cloud.google.com/apis/credentials/oauthclient',
    },
    {
      title: 'OAuth Consent Screen is Disabled or Still in Draft / Incomplete Status',
      probability: 'MEDIUM',
      explanation: 'If the OAuth consent screen for the project was never published or is missing required support email / app name, authentication requests may fail with 401.',
      action: 'Verify that the OAuth consent screen is configured with user support email and app name in Google Cloud Console.',
      consoleUrl: 'https://console.cloud.google.com/apis/credentials/consent',
    },
    {
      title: 'Distinction from Error 400 (origin_mismatch / redirect_uri_mismatch)',
      probability: 'LOW',
      explanation: 'If this was an origin mismatch, Google displays Error 400: redirect_uri_mismatch. Because the error is 401: invalid_client, Google failed before checking the origin because the client ID itself was not found in their database.',
      action: 'Once you create or find the valid Web Client ID, make sure to add your current origin to "Authorized JavaScript origins".',
    },
  ];

  const isValidFormat = issues.filter((i) => i.severity === 'error').length === 0;

  let score = 100;
  if (!isValidFormat) score -= 50;
  if (detectedType !== 'WEB_APPLICATION') score -= 30;
  if (issues.some((i) => i.severity === 'warning')) score -= 15;
  if (originIssues.length > 0) score -= 10;
  score = Math.max(0, score);

  const suggestedConsoleUrl = projectNumber
    ? `https://console.cloud.google.com/apis/credentials?project=${projectNumber}`
    : 'https://console.cloud.google.com/apis/credentials';

  return {
    rawInput: rawClientId,
    sanitized,
    isValidFormat,
    projectNumber,
    clientHash,
    suffix,
    detectedType,
    issues,
    originAnalysis: {
      origin,
      protocol,
      hostname,
      port,
      isHttpsOrLocalhost,
      issues: originIssues,
    },
    likelyCausesFor401,
    suggestedConsoleUrl,
    score,
  };
}
