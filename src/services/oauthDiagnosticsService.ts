/**
 * Google OAuth Diagnostic Logger Service
 *
 * Captures, stores, and broadcasts detailed diagnostic logs, runtime errors,
 * raw Google Identity Services payloads, and structural validation audits.
 */

import { validateGoogleClientId, GoogleClientIdValidationResult } from '../utils/googleOAuthValidator';

export type DiagnosticLogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

export type DiagnosticLogCategory =
  | 'CLIENT_INIT'
  | 'STRUCTURAL_AUDIT'
  | 'OAUTH_TRIGGER'
  | 'OAUTH_ERROR_RESPONSE'
  | 'POSTMESSAGE_GIS'
  | 'BACKEND_EXCHANGE'
  | 'MANUAL_TEST';

export interface DiagnosticLogEntry {
  id: string;
  timestamp: string; // ISO String
  level: DiagnosticLogLevel;
  category: DiagnosticLogCategory;
  message: string;
  clientId: string;
  origin: string;
  details?: any;
  stack?: string;
  validationAudit?: GoogleClientIdValidationResult;
}

const STORAGE_KEY = 'meso_oauth_diagnostic_logs';
const MAX_LOGS = 60;

class OAuthDiagnosticsService {
  private logs: DiagnosticLogEntry[] = [];
  private listeners: Set<(logs: DiagnosticLogEntry[]) => void> = new Set();
  private initialized = false;

  constructor() {
    this.loadLogs();
    if (typeof window !== 'undefined') {
      this.initGlobalListeners();
    }
  }

  private loadLogs(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[OAuthDiagnostics] Failed to parse stored logs:', e);
      this.logs = [];
    }
  }

  private persistLogs(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs.slice(-MAX_LOGS)));
    } catch (e) {
      // ignore localStorage quota errors
    }
  }

  private notify(): void {
    const copy = [...this.logs];
    this.listeners.forEach((listener) => {
      try {
        listener(copy);
      } catch (err) {
        console.error('[OAuthDiagnostics] Listener error:', err);
      }
    });
  }

  private initGlobalListeners(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Listen to window message events originating from accounts.google.com
    window.addEventListener('message', (event: MessageEvent) => {
      if (!event.origin || !event.origin.includes('google.com')) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && (data.type === 'gsi_error' || data.error || data.status === 'ERROR')) {
          this.log({
            level: 'ERROR',
            category: 'POSTMESSAGE_GIS',
            message: `Google Identity Services message error: ${data.error || data.type || 'Unknown GIS message'}`,
            details: data,
          });
        }
      } catch (e) {
        // Not a JSON payload or irrelevant
      }
    });
  }

  /**
   * Add a new diagnostic log entry
   */
  public log(entry: {
    level: DiagnosticLogLevel;
    category: DiagnosticLogCategory;
    message: string;
    clientId?: string;
    details?: any;
    stack?: string;
    validationAudit?: GoogleClientIdValidationResult;
  }): DiagnosticLogEntry {
    const activeClientId =
      entry.clientId ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('meso_google_client_id') : '') ||
      '';

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    const newEntry: DiagnosticLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level: entry.level,
      category: entry.category,
      message: entry.message,
      clientId: activeClientId,
      origin,
      details: entry.details,
      stack: entry.stack,
      validationAudit: entry.validationAudit,
    };

    this.logs.unshift(newEntry);
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(0, MAX_LOGS);
    }

    this.persistLogs();
    this.notify();
    return newEntry;
  }

  /**
   * Run and record a structural audit of the given (or active) Client ID
   */
  public auditClientId(clientIdToAudit: string): {
    entry: DiagnosticLogEntry;
    audit: GoogleClientIdValidationResult;
  } {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const audit = validateGoogleClientId(clientIdToAudit, origin);

    const level: DiagnosticLogLevel = audit.isValidFormat
      ? audit.issues.length === 0
        ? 'SUCCESS'
        : 'WARN'
      : 'ERROR';

    const message = audit.isValidFormat
      ? `Structural audit passed (Score ${audit.score}/100): Valid Google Web Client ID syntax`
      : `Structural audit failed (Score ${audit.score}/100): ${audit.issues.map((i) => i.title).join('; ')}`;

    const entry = this.log({
      level,
      category: 'STRUCTURAL_AUDIT',
      message,
      clientId: clientIdToAudit,
      details: {
        rawInput: audit.rawInput,
        sanitized: audit.sanitized,
        detectedType: audit.detectedType,
        projectNumber: audit.projectNumber,
        clientHash: audit.clientHash,
        suffix: audit.suffix,
        score: audit.score,
        issues: audit.issues,
        originAnalysis: audit.originAnalysis,
        likelyCausesFor401: audit.likelyCausesFor401,
      },
      validationAudit: audit,
    });

    return { entry, audit };
  }

  /**
   * Log an OAuth error from @react-oauth/google onError or manual catch
   */
  public logOAuthError(
    errorOrMessage: any,
    clientId?: string,
    contextInfo?: Record<string, any>
  ): DiagnosticLogEntry {
    let message = 'Google OAuth Sign-In Failed';
    let details: any = {};
    let stack: string | undefined;

    if (typeof errorOrMessage === 'string') {
      message = errorOrMessage;
      details = { rawMessage: errorOrMessage, ...contextInfo };
    } else if (errorOrMessage instanceof Error) {
      message = errorOrMessage.message;
      stack = errorOrMessage.stack;
      details = {
        name: errorOrMessage.name,
        message: errorOrMessage.message,
        ...contextInfo,
      };
    } else if (typeof errorOrMessage === 'object' && errorOrMessage !== null) {
      message = errorOrMessage.error || errorOrMessage.message || JSON.stringify(errorOrMessage);
      details = { ...errorOrMessage, ...contextInfo };
    }

    return this.log({
      level: 'ERROR',
      category: 'OAUTH_ERROR_RESPONSE',
      message: `Google OAuth Error: ${message}`,
      clientId,
      details,
      stack,
    });
  }

  public getLogs(): DiagnosticLogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    this.notify();
  }

  public subscribe(callback: (logs: DiagnosticLogEntry[]) => void): () => void {
    this.listeners.add(callback);
    callback([...this.logs]);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public exportLogsJson(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        origin: typeof window !== 'undefined' ? window.location.origin : '',
        totalLogs: this.logs.length,
        logs: this.logs,
      },
      null,
      2
    );
  }
}

export const oauthDiagnosticsService = new OAuthDiagnosticsService();
