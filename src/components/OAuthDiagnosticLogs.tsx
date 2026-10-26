import React, { useState, useEffect, useMemo } from 'react';
import {
  oauthDiagnosticsService,
  DiagnosticLogEntry,
  DiagnosticLogLevel,
} from '../services/oauthDiagnosticsService';
import {
  validateGoogleClientId,
  GoogleClientIdValidationResult,
} from '../utils/googleOAuthValidator';
import { getActiveGoogleClientId, setActiveGoogleClientId } from '../main';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Trash2,
  Download,
  Terminal,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Sparkles,
  Search,
  HelpCircle,
  FileText,
  X,
} from 'lucide-react';

interface OAuthDiagnosticLogsProps {
  isOpen?: boolean;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const OAuthDiagnosticLogs: React.FC<OAuthDiagnosticLogsProps> = ({
  isOpen = true,
  onClose,
  isEmbedded = false,
}) => {
  const [logs, setLogs] = useState<DiagnosticLogEntry[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | DiagnosticLogLevel>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeClientId, setLocalActiveClientId] = useState<string>(getActiveGoogleClientId());
  const [clientInput, setClientInput] = useState<string>(getActiveGoogleClientId());
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'LOGS' | 'ROOT_CAUSE' | 'QUICK_FIX'>('AUDIT');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<GoogleClientIdValidationResult>(() =>
    validateGoogleClientId(
      getActiveGoogleClientId(),
      typeof window !== 'undefined' ? window.location.origin : ''
    )
  );

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  // Subscribe to real-time logs
  useEffect(() => {
    const unsubscribe = oauthDiagnosticsService.subscribe((newLogs) => {
      setLogs(newLogs);
    });

    const handleClientUpdate = () => {
      const current = getActiveGoogleClientId();
      setLocalActiveClientId(current);
      setClientInput(current);
      setAuditResult(validateGoogleClientId(current, currentOrigin));
    };

    window.addEventListener('meso:google_client_id_updated', handleClientUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('meso:google_client_id_updated', handleClientUpdate);
    };
  }, [currentOrigin]);

  const filteredLogs = useMemo(() => {
    if (selectedFilter === 'ALL') return logs;
    return logs.filter((l) => l.level === selectedFilter);
  }, [logs, selectedFilter]);

  const copyToClipboard = (text: string, key: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleRunAudit = (idToTest?: string) => {
    setIsAuditing(true);
    const target = (idToTest !== undefined ? idToTest : clientInput).trim();
    const { audit } = oauthDiagnosticsService.auditClientId(target);
    setAuditResult(audit);
    setTimeout(() => setIsAuditing(false), 400);
  };

  const handleApplyAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = clientInput.trim();
    setActiveGoogleClientId(cleaned);
    setLocalActiveClientId(cleaned);
    handleRunAudit(cleaned);
  };

  const handleClearLogs = () => {
    if (window.confirm('Hundumtaa logs qulqulleessuu barbaaddaa? (Clear all logs?)')) {
      oauthDiagnosticsService.clearLogs();
    }
  };

  const handleExportJson = () => {
    const jsonStr = oauthDiagnosticsService.exportLogsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meso-oauth-diagnostics-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen && !isEmbedded) return null;

  const content = (
    <div className="flex flex-col h-full max-h-[85vh] text-slate-200">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Google OAuth Diagnostic Inspector
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Captures real-time failure details & validates Google Client ID against Error 401 (invalid_client)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Close Diagnostics"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-1.5 py-2 px-3.5 border-b-2 font-medium transition-all ${
            activeTab === 'AUDIT'
              ? 'border-purple-500 text-purple-300 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Structural Audit ({auditResult.score}/100)</span>
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`flex items-center gap-1.5 py-2 px-3.5 border-b-2 font-medium transition-all ${
            activeTab === 'LOGS'
              ? 'border-purple-500 text-purple-300 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Live Logs ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ROOT_CAUSE')}
          className={`flex items-center gap-1.5 py-2 px-3.5 border-b-2 font-medium transition-all ${
            activeTab === 'ROOT_CAUSE'
              ? 'border-purple-500 text-purple-300 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Root Cause 401 vs 400</span>
        </button>

        <button
          onClick={() => setActiveTab('QUICK_FIX')}
          className={`flex items-center gap-1.5 py-2 px-3.5 border-b-2 font-medium transition-all ${
            activeTab === 'QUICK_FIX'
              ? 'border-purple-500 text-purple-300 bg-purple-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Fix Instructions</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {/* ================= TAB 1: STRUCTURAL AUDIT ================= */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-4">
            {/* Health Status Card */}
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                auditResult.isValidFormat
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                  : 'bg-red-950/40 border-red-500/40 text-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {auditResult.isValidFormat ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {auditResult.isValidFormat
                        ? 'Client ID Structure is Syntactically Valid'
                        : 'Client ID Structural Issues Detected'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        auditResult.score >= 80
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : auditResult.score >= 50
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      Score: {auditResult.score}%
                    </span>
                  </div>
                  <p className="text-xs opacity-90 mt-1">
                    {auditResult.isValidFormat
                      ? 'Format matches standard Google Web Client ID syntax. However, if Google still throws Error 401 (invalid_client), this ID has not been created or was deleted in Google Cloud Console.'
                      : 'The string does not match standard Google Web Client ID format. See details below.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRunAudit()}
                disabled={isAuditing}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 text-xs transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                <span>Re-Audit</span>
              </button>
            </div>

            {/* Client ID Editor / Input */}
            <form
              onSubmit={handleApplyAndSave}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Current Active Google Client ID</span>
                </label>
                <button
                  type="button"
                  onClick={() => copyToClipboard(clientInput, 'clientId')}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  {copiedKey === 'clientId' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'clientId' ? 'Copied' : 'Copy ID'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={clientInput}
                  onChange={(e) => setClientInput(e.target.value)}
                  placeholder="e.g. 653190114830-eiav5slb9hoidpn9b125u40pot8ej357.apps.googleusercontent.com"
                  className="flex-1 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs font-mono text-purple-200 outline-none placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-md shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Update & Test</span>
                </button>
              </div>
            </form>

            {/* Anatomy Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">1. Google Project Number</div>
                <div className="font-mono text-xs text-purple-300 break-all">
                  {auditResult.projectNumber || (
                    <span className="text-red-400 italic">Not found / Missing</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500">
                  {auditResult.projectNumber && /^\d{10,14}$/.test(auditResult.projectNumber)
                    ? '✓ Valid 10-14 digit GCP project ID'
                    : '✗ Must be 10-14 numeric digits'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">2. Unique Client Hash</div>
                <div className="font-mono text-xs text-purple-300 break-all">
                  {auditResult.clientHash || (
                    <span className="text-red-400 italic">Not found / Missing</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500">
                  {auditResult.clientHash && auditResult.clientHash.length >= 28
                    ? `✓ Hash length: ${auditResult.clientHash.length} chars (Standard Web Client)`
                    : '✗ Hash appears truncated or abnormal'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">3. Suffix Domain</div>
                <div className="font-mono text-xs text-purple-300 break-all">
                  {auditResult.suffix || (
                    <span className="text-red-400 italic">.apps.googleusercontent.com missing</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500">
                  {auditResult.suffix === '.apps.googleusercontent.com'
                    ? '✓ Exact Google Identity Web domain'
                    : '✗ Must strictly end with .apps.googleusercontent.com'}
                </div>
              </div>
            </div>

            {/* Authorized Origin Diagnostic */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">
                    Current Applet Origin (Authorized JavaScript Origin)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    HTTPS Active
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(currentOrigin, 'origin')}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                >
                  {copiedKey === 'origin' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'origin' ? 'Copied Origin' : 'Copy Origin URL'}</span>
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-xs text-amber-200 border border-slate-800 break-all flex items-center justify-between">
                <span>{currentOrigin}</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                When you create your OAuth Client in Google Cloud, paste this exact origin into{' '}
                <strong className="text-slate-200">Authorized JavaScript origins</strong> (no trailing slash).
              </p>
            </div>

            {/* Issues Found */}
            {auditResult.issues.length > 0 && (
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-2.5">
                <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Detected Syntax / Credential Issues ({auditResult.issues.length})</span>
                </div>

                <div className="space-y-2">
                  {auditResult.issues.map((iss, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-red-500/20 text-xs space-y-1"
                    >
                      <div className="font-semibold text-red-300 flex items-center gap-2">
                        <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-red-900/60 font-mono">
                          {iss.code}
                        </span>
                        <span>{iss.title}</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{iss.message}</p>
                      <p className="text-amber-300/90 text-[11px] font-medium">
                        Fix: {iss.remediation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: LIVE LOGS ================= */}
        {activeTab === 'LOGS' && (
          <div className="space-y-3">
            {/* Filter and Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-1">
                {(['ALL', 'ERROR', 'WARN', 'SUCCESS', 'INFO'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedFilter(lvl)}
                    className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-colors ${
                      selectedFilter === lvl
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJson}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3 text-purple-400" />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={handleClearLogs}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Log Stream List */}
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                <Terminal className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-medium text-slate-400">No logs captured yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Run an audit or attempt a Google Sign-In to capture raw Google Identity Services error payloads and debug traces.
                </p>
                <button
                  onClick={() => handleRunAudit()}
                  className="mt-2 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
                >
                  Run Audit Now
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((entry) => {
                  const isExpanded = expandedLogId === entry.id;
                  const levelColor =
                    entry.level === 'ERROR'
                      ? 'text-red-400 bg-red-950/60 border-red-500/30'
                      : entry.level === 'WARN'
                      ? 'text-amber-400 bg-amber-950/60 border-amber-500/30'
                      : entry.level === 'SUCCESS'
                      ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
                      : 'text-sky-400 bg-sky-950/60 border-sky-500/30';

                  return (
                    <div
                      key={entry.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2"
                    >
                      <div
                        className="flex items-start justify-between gap-2 cursor-pointer select-none"
                        onClick={() => setExpandedLogId(isExpanded ? null : entry.id)}
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border font-semibold shrink-0 ${levelColor}`}
                          >
                            {entry.level}
                          </span>
                          <span className="font-mono text-[11px] text-purple-300/80 px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-500/20 shrink-0">
                            {entry.category}
                          </span>
                          <span className="font-medium text-slate-200 truncate">
                            {entry.message}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Expanded Raw Payload Inspector */}
                      {isExpanded && (
                        <div className="pt-2 border-t border-slate-800 space-y-2 pl-6 animate-fade-in">
                          <div className="text-[10px] text-slate-400 font-mono">
                            Timestamp: {entry.timestamp} | Origin: {entry.origin}
                          </div>

                          {entry.clientId && (
                            <div className="text-[10px] font-mono text-purple-300 break-all">
                              Client ID: {entry.clientId}
                            </div>
                          )}

                          {entry.details && (
                            <div className="relative">
                              <pre className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56 border border-slate-800">
                                {JSON.stringify(entry.details, null, 2)}
                              </pre>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    JSON.stringify(entry.details, null, 2),
                                    `raw_${entry.id}`
                                  )
                                }
                                className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white flex items-center gap-1 border border-slate-700"
                              >
                                {copiedKey === `raw_${entry.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>Copy JSON</span>
                              </button>
                            </div>
                          )}

                          {entry.stack && (
                            <pre className="p-2 rounded bg-red-950/40 text-red-300 font-mono text-[10px] overflow-x-auto border border-red-500/20">
                              {entry.stack}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: ROOT CAUSE 401 VS 400 ================= */}
        {activeTab === 'ROOT_CAUSE' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs space-y-2">
              <div className="font-bold text-sm text-purple-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span>Why Error 401: invalid_client Happens</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                When Google returns <code className="text-amber-300 font-mono">Error 401: invalid_client ("The OAuth client was not found")</code>, it means Google’s servers examined the Client ID string and could not find an active registered OAuth 2.0 client matching it.
              </p>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 401 Box */}
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-red-300 uppercase tracking-wider font-mono">
                    Error 401: invalid_client
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-300">
                    Client Identity Missing
                  </span>
                </div>
                <div className="text-xs font-semibold text-white">"The OAuth client was not found"</div>
                <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>The client ID does not exist in Google Cloud credentials.</li>
                  <li>The client was deleted or regenerated in the Cloud Console.</li>
                  <li>The OAuth client was created for <strong>Android/iOS/Desktop</strong> instead of <strong>Web application</strong>.</li>
                  <li>The Google Cloud project was deleted or suspended.</li>
                  <li>Google never gets to check your URL origin because the client identity itself failed lookup.</li>
                </ul>
              </div>

              {/* 400 Box */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-300 uppercase tracking-wider font-mono">
                    Error 400: origin_mismatch
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                    Domain Missing
                  </span>
                </div>
                <div className="text-xs font-semibold text-white">"redirect_uri_mismatch / origin_mismatch"</div>
                <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>The client ID <em>is valid</em> and exists in Google Cloud.</li>
                  <li>Google checked the website domain sending the request.</li>
                  <li>Your origin URL (e.g. <code className="text-amber-200 font-mono">https://ais-dev-...</code>) is missing from <strong>Authorized JavaScript origins</strong>.</li>
                  <li>Fix: Simply add your URL origin to the existing client's authorized list.</li>
                </ul>
              </div>
            </div>

            {/* In-depth Analysis Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Ranked Root Causes for Current Client ID
              </h3>
              {auditResult.likelyCausesFor401.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{item.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.probability === 'HIGH'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : item.probability === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.probability} PROBABILITY
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{item.explanation}</p>
                  <div className="p-2 rounded-xl bg-slate-950 text-purple-300 text-[11px] flex items-center justify-between gap-2 border border-slate-800/80">
                    <span>{item.action}</span>
                    {item.consoleUrl && (
                      <a
                        href={item.consoleUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 hover:text-purple-200 underline flex items-center gap-1 shrink-0 font-medium"
                      >
                        <span>Console</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: STEP-BY-STEP FIX INSTRUCTIONS ================= */}
        {activeTab === 'QUICK_FIX' && (
          <div className="space-y-4 text-xs">
            {/* Step-by-Step Guide */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="font-bold text-sm text-slate-200">
                Akkaataa Google Cloud Console Irraa Client ID Haarawa Baasan:
              </div>

              <div className="space-y-3 text-[11px] text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="text-white">Google Cloud Console Bani:</strong>
                    <div className="mt-1">
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 underline font-mono text-[11px]"
                      >
                        <span>https://console.cloud.google.com/apis/credentials</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="text-white">Credentials Uumi:</strong>
                    <p className="mt-0.5">
                      Gubbaa irratti <strong className="text-purple-300">+ CREATE CREDENTIALS</strong> cuqaasi &rarr; filadhu{' '}
                      <strong className="text-purple-300">OAuth client ID</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="text-white">Application Type Filadhu:</strong>
                    <p className="mt-0.5 text-red-300">
                      Murteessaa: Application type irratti <strong>"Web application"</strong> filadhu (Android ykn iOS filachuu hin qabdu).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div>
                    <strong className="text-white">Authorized JavaScript Origins Galchi:</strong>
                    <p className="mt-0.5">
                      Iddoo <em>"Authorized JavaScript origins"</em> jedhu jalatti URL armaan gadii galchi:
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <code className="bg-slate-950 px-2 py-1 rounded text-amber-300 font-mono text-[10px] border border-slate-800">
                        {currentOrigin}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentOrigin, 'guide_origin')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 flex items-center gap-1"
                      >
                        {copiedKey === 'guide_origin' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                    5
                  </span>
                  <div>
                    <strong className="text-white">Client ID Haarawa Asitti Galchi:</strong>
                    <p className="mt-0.5">
                      Client ID siif kenname copy godhii tab <strong>"Structural Audit"</strong> keessatti paste godhii <strong>"Update & Test"</strong> cuqaasi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time OAuth Listener Active</span>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cufi (Close)
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return <div className="w-full bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-950 border border-purple-500/30 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {content}
      </div>
    </div>
  );
};
