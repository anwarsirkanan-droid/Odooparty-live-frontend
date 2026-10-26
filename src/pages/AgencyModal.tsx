import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  ChevronLeft,
  Bell,
  Copy,
  Check,
  ChevronRight,
  Headphones,
  Link as LinkIcon,
  UserPlus,
  Users,
  Award,
  Sparkles,
  Info,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { AgencyPolicyModal, AGENCY_COMMISSION_TIERS } from './AgencyPolicyModal';

interface AgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPolicy?: () => void;
}

export const AgencyModal: React.FC<AgencyModalProps> = ({ isOpen, onClose, onOpenPolicy }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'S_PLUS' | 'COMMISSION_DATA'>('S_PLUS');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState<string | null>(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  if (!isOpen) return null;

  const currentId = user?.customId || user?.publicId || '1000001';
  const agentName = user?.name || user?.username || 'Agency Leader';
  const last30DaysPoints = Math.max(12566765, (user?.points || 15000) * 800);

  // Compute agency tier from last 30 days points
  const activeAgencyTier = AGENCY_COMMISSION_TIERS.slice().reverse().find((t) => t.pointsTarget >= 0 && last30DaysPoints >= t.pointsTarget) || AGENCY_COMMISSION_TIERS[0];
  const commissionRate = activeAgencyTier.rate;

  const handleCopyId = () => {
    navigator.clipboard?.writeText(String(currentId));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyInvite = (type: 'host' | 'agent') => {
    const link = `https://odooparty.live/join?agency=${currentId}&type=${type}`;
    navigator.clipboard?.writeText(link);
    setCopiedInvite(type);
    setTimeout(() => setCopiedInvite(null), 2000);
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard?.writeText('+251911002233');
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-950 border border-purple-500/30 rounded-3xl w-full max-w-md shadow-2xl relative flex flex-col h-[92vh] max-h-[820px] overflow-hidden text-slate-100 select-none">
        {/* 1. Top Navigation Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/90 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-sm font-extrabold text-white tracking-wide">Agency Center</h2>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowPolicyModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-[10px] font-bold transition-all"
              title="Official Agency Policy"
            >
              <FileText className="w-3 h-3 text-amber-400" />
              <span>Policy</span>
            </button>

            <button
              onClick={() => setShowPolicyModal(true)}
              className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              title="Notifications & Rules"
            >
              <Bell className="w-4 h-4 text-purple-300" />
            </button>
          </div>
        </div>

        {/* Scrollable Center Content */}
        <div className="overflow-y-auto flex-1 p-3 space-y-3 pb-20">
          {/* 2. Top Promotional Banner (BD Incentive Plan - Tello Style) */}
          <div className="relative rounded-2xl overflow-hidden p-4 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 shadow-lg text-white">
            <div className="relative z-10 max-w-[240px]">
              <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded bg-black/25 inline-block mb-1">
                Agency Rewards
              </span>
              <h3 className="text-lg font-black tracking-tight leading-tight drop-shadow-md">
                BD Incentive Plan
              </h3>
              <p className="text-[11px] font-medium text-amber-100/90 mt-1 leading-snug">
                Weekly qualification unlocks rewards up to <strong className="text-yellow-200">111M points!</strong>
              </p>
              <button
                onClick={() => setShowPolicyModal(true)}
                className="mt-2.5 px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 border border-white/20 text-[10px] font-black text-amber-200 flex items-center gap-1 transition-colors"
              >
                <span>View Full Agency Policy</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {/* Visual glow backdrop */}
            <div className="absolute right-2 top-2 bottom-2 w-28 bg-gradient-to-l from-yellow-300/20 to-transparent pointer-events-none rounded-r-xl" />
          </div>

          {/* 3. Agent Profile Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Ornate Golden Rim Frame Avatar */}
                <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-md shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <span>agent {agentName}</span>
                    <span className="px-1.5 py-0.2 rounded font-black text-[9px] bg-amber-400 text-slate-950">
                      Tier {activeAgencyTier.level}
                    </span>
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                    <span>ID: {currentId}</span>
                    <button onClick={handleCopyId} className="hover:text-amber-300">
                      {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPolicyModal(true)}
                className="flex items-center gap-0.5 text-xs text-slate-400 hover:text-white pt-1"
              >
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Metrics: Last 30 Days Points & Commission Rate */}
            <div className="space-y-1 pt-1">
              <div className="text-xs text-slate-300">
                <span>Last 30 Days Points: </span>
                <span className="font-bold text-white">{last30DaysPoints.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="text-slate-300">
                  <span>Commission Rate: </span>
                  <span className="font-extrabold text-amber-400">{commissionRate}</span>
                  <span className="text-slate-400 text-[10px] ml-1">(Level {activeAgencyTier.level})</span>
                </div>
                <button
                  onClick={() => setShowPolicyModal(true)}
                  className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center gap-0.5"
                >
                  <span>Policy</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Stepper Progress Bar (Tello Style: D 8% -> C 12% -> B 16% -> A 18% -> S 20% -> S+ 21%) */}
            <div className="pt-2">
              <div className="relative flex items-center justify-between text-[10px] text-slate-400 pb-1 font-semibold">
                <span className={activeAgencyTier.level === 'D' ? 'text-amber-300 font-bold' : ''}>8% (D)</span>
                <span className={activeAgencyTier.level === 'C' ? 'text-amber-300 font-bold' : ''}>12% (C)</span>
                <span className={activeAgencyTier.level === 'B' ? 'text-amber-300 font-bold' : ''}>16% (B)</span>
                <span className={activeAgencyTier.level === 'A' ? 'text-amber-300 font-bold' : ''}>18% (A)</span>
                <span className={activeAgencyTier.level === 'S' ? 'text-amber-300 font-bold' : ''}>20% (S)</span>
                <span className="text-amber-400 font-bold">21% (S+)</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full relative flex items-center justify-between px-0.5">
                <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[35%]" />
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 ring-2 ring-slate-900 z-10" />
                <span className="w-2 h-2 rounded-full bg-slate-700 z-10" />
                <span className="w-2 h-2 rounded-full bg-slate-700 z-10" />
                <span className="w-2 h-2 rounded-full bg-slate-700 z-10" />
                <span className="w-2 h-2 rounded-full bg-slate-700 z-10" />
                <span className="w-2 h-2 rounded-full bg-amber-400 z-10" />
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 font-mono">
                <span>0</span>
                <span>20M</span>
                <span>100M</span>
                <span>500M</span>
                <span>1.5B</span>
                <span>2 S-Level</span>
              </div>
            </div>
          </div>

          {/* 4. Team Metrics Card (Hosts, Agents, Chatrooms & Invites) */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-base font-black text-white flex items-center justify-center gap-0.5">
                  <span>18</span>
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Host</span>
              </div>

              <div>
                <div className="text-base font-black text-white flex items-center justify-center gap-0.5">
                  <span>28</span>
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Agents</span>
              </div>

              <div>
                <div className="text-base font-black text-white">46</div>
                <span className="text-[11px] text-slate-400 font-medium">Chatrooms</span>
              </div>
            </div>

            {/* Invite Action Buttons (Tello Style) */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleCopyInvite('host')}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-transform active:scale-95"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{copiedInvite === 'host' ? 'Link Copied!' : 'Invite Host'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyInvite('agent')}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600/80 to-blue-600/80 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-transform active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{copiedInvite === 'agent' ? 'Link Copied!' : 'Invite Sub-agents'}</span>
              </button>
            </div>
          </div>

          {/* 5. Tabs Section: S+ Rewards & Commission Data */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setActiveTab('S_PLUS')}
                className={`flex-1 pb-2 text-xs font-bold transition-colors relative ${
                  activeTab === 'S_PLUS' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>S+ Rewards</span>
                {activeTab === 'S_PLUS' && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('COMMISSION_DATA')}
                className={`flex-1 pb-2 text-xs font-bold transition-colors relative ${
                  activeTab === 'COMMISSION_DATA' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Commission Data</span>
                {activeTab === 'COMMISSION_DATA' && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                )}
              </button>
            </div>

            {activeTab === 'S_PLUS' ? (
              <div className="space-y-2.5 pt-1">
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 border border-amber-500/30 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300">21% Agency Commission Rate</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px]">S+ Tier</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    An Agent who successfully invites <strong>2 S-Level Agencies</strong> will qualify for the <strong>21% Agency Commission Rate</strong>.
                  </p>
                  <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                    <p>• Continuously receive an additional <strong>1% commission</strong> based on host revenue generated by their S-Level Agencies.</p>
                    <p>• Granted on a first-come, first-served basis; claimable in Agency Center.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPolicyModal(true)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Read Full 21% S+ Policy</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1 text-xs text-slate-300">
                <div className="space-y-1">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-slate-400">Level D (0 Points)</span>
                    <span className="font-bold text-amber-400">8% Commission</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-slate-400">Level C (20M Points)</span>
                    <span className="font-bold text-amber-400">12% Commission</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-slate-400">Level B (100M Points)</span>
                    <span className="font-bold text-amber-400">16% Commission</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-slate-400">Level A (500M Points)</span>
                    <span className="font-bold text-amber-400">18% Commission</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-slate-400">Level S (1,500M Points)</span>
                    <span className="font-bold text-amber-400">20% Commission</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-gradient-to-r from-purple-950/50 to-amber-950/50 border border-amber-500/30">
                    <span className="font-bold text-amber-300">Level S+ (Invite 2 S-Agencies)</span>
                    <span className="font-black text-amber-400">21% Top Rate</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[10px] space-y-1">
                  <span className="font-bold text-purple-300 block">Invite Agent Bonus Formula:</span>
                  <p className="text-white font-mono">
                    (Your Rate − Invited Rate) × Invited Team Income
                  </p>
                  <p className="text-slate-400">
                    T1, T2, T3... Tn multi-tier agency network bonus up to 20%.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPolicyModal(true)}
                  className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-300" />
                  <span>Open Differential Bonus Simulator</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 6. Bottom Floating Support & WhatsApp Bar (Tello Style) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md flex items-center justify-between gap-2.5">
          {/* Supporter Pill */}
          <div className="flex-1 py-2 px-3 rounded-full bg-gradient-to-r from-purple-800/80 to-indigo-800/80 border border-purple-500/40 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-purple-200 block font-medium">Supporter</span>
              <span className="text-[11px] font-mono text-white font-bold">ID: 1008149</span>
            </div>
            <Headphones className="w-4 h-4 text-purple-300" />
          </div>

          {/* WhatsApp Pill */}
          <div className="flex-1 py-1.5 px-3 rounded-full bg-gradient-to-r from-emerald-800/80 to-teal-800/80 border border-emerald-500/40 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-emerald-200 block font-medium">WhatsApp</span>
              <span className="text-[11px] font-mono text-white font-bold">+251 911 002</span>
            </div>
            <button
              onClick={handleCopyWhatsApp}
              className="px-2 py-0.5 rounded-full bg-white text-emerald-950 font-black text-[10px] hover:bg-emerald-100 transition-colors"
            >
              {copiedWhatsApp ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Agency Policy Modal */}
        <AgencyPolicyModal
          isOpen={showPolicyModal}
          onClose={() => setShowPolicyModal(false)}
        />
      </div>
    </div>
  );
};
