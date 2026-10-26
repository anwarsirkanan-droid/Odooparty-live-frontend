import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, Camera, CheckCircle, Clock } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [faceStatus, setFaceStatus] = useState<'NOT_SUBMITTED' | 'Pending' | 'Approved'>(
    (user?.faceVerificationStatus as any) || 'NOT_SUBMITTED'
  );
  const [hostStatus, setHostStatus] = useState<'NOT_SUBMITTED' | 'Pending' | 'Approved'>(
    (user?.hostVerificationStatus as any) || 'NOT_SUBMITTED'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitFace = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setFaceStatus('Pending');
      setIsSubmitting(false);
      setMsg('Face photo uploaded! Review typically completes within 24 hours.');
    }, 800);
  };

  const handleSubmitHost = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setHostStatus('Pending');
      setIsSubmitting(false);
      setMsg('Host application submitted! Administrator review in progress.');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Trust & Verification</h2>
              <span className="text-[11px] text-slate-400">Identity & Host Certification</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3 py-2">
          {msg && (
            <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          {/* 1. Real Face Verification */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Face Identity Verification</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  faceStatus === 'Approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : faceStatus === 'Pending'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {faceStatus === 'NOT_SUBMITTED' ? 'Not Verified' : faceStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Protects voice room communities from impersonation and enables verified creator badges.
            </p>
            {faceStatus === 'NOT_SUBMITTED' && (
              <button
                onClick={handleSubmitFace}
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-xs transition-colors"
              >
                Upload Selfie for Verification
              </button>
            )}
          </div>

          {/* 2. Official Host Certification */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Live Voice Host Certification</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  hostStatus === 'Approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : hostStatus === 'Pending'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {hostStatus === 'NOT_SUBMITTED' ? 'Not Verified' : hostStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Required to receive Crown Mic rewards (3,000 pts/day), host level hourly points (up to 2,000,000 pts/hr), and New Host bonuses.
            </p>
            {hostStatus === 'NOT_SUBMITTED' && (
              <button
                onClick={handleSubmitHost}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2 rounded-xl text-xs transition-colors"
              >
                Apply for Host Status
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
