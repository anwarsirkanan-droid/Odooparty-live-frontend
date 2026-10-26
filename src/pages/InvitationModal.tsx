import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Gift, Users, Copy, Check, Share2 } from 'lucide-react';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvitationModal: React.FC<InvitationModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const inviteCode = user?.publicId?.toString() || user?.customId?.toString() || '1000004';
  const inviteUrl = `https://meso-live.app/invite?code=${inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-600/30 text-pink-300">
              <Gift className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Invite Friends & Hosts</h2>
              <span className="text-[11px] text-slate-400">Earn commission & reward bonuses</span>
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
        <div className="overflow-y-auto flex-1 pr-1 space-y-3 py-2 text-xs">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 to-pink-950/60 border border-purple-500/40 text-center">
            <span className="text-[11px] font-semibold text-purple-300">Your Personal Invite Code</span>
            <div className="text-2xl font-black text-amber-300 tracking-wider my-1">{inviteCode}</div>
            <p className="text-[11px] text-slate-300">Share your link to invite new members to OdooParty!</p>
          </div>

          <div className="bg-slate-800/70 p-3 rounded-2xl border border-slate-700">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Invitation Link</span>
            <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl text-slate-200 text-[11px] font-mono">
              <span className="truncate">{inviteUrl}</span>
              <button
                onClick={handleCopy}
                className="ml-2 text-purple-400 hover:text-purple-200 shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
