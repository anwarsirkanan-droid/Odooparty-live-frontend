import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeft,
  HelpCircle,
  Copy,
  Check,
  Star,
  ChevronRight,
  Coins,
  Send,
  RefreshCw,
  CreditCard,
  Phone,
  MessageSquare,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface CoinSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAgency: () => void;
  onOpenRecharge?: () => void;
}

export const CoinSellerModal: React.FC<CoinSellerModalProps> = ({
  isOpen,
  onClose,
  onOpenAgency,
  onOpenRecharge,
}) => {
  const { user, adjustCoins } = useAuth();
  const [copiedId, setCopiedId] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Sub-modal states
  const [activeModal, setActiveModal] = useState<'transfer' | 'exchange' | 'payment' | 'whatsapp' | 'greeting' | null>(null);

  // Transfer state
  const [targetId, setTargetId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Seller settings state
  const [whatsAppNumber, setWhatsAppNumber] = useState('+251911002233');
  const [whatsAppInput, setWhatsAppInput] = useState('+251911002233');
  const [greetingMessage, setGreetingMessage] = useState('Nagaan dhufte! Qoriin (Coins) OdooParty saffisaan ni dhiyaata.');
  const [greetingInput, setGreetingInput] = useState('Nagaan dhufte! Qoriin (Coins) OdooParty saffisaan ni dhiyaata.');
  const [paymentMethod, setPaymentMethod] = useState('Telebirr / CBE Commercial Bank of Ethiopia');
  const [paymentInput, setPaymentInput] = useState('Telebirr / CBE Commercial Bank of Ethiopia');

  if (!isOpen) return null;

  const currentId = user?.customId || user?.publicId || '1000001';
  const sellerName = user?.name || user?.username || 'Coin Seller';
  const currentCoins = user?.coins || 0;

  const handleCopyId = () => {
    navigator.clipboard?.writeText(String(currentId));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    setTransferSuccess(null);

    const amount = Number(transferAmount);
    if (!targetId.trim()) {
      setTransferError('Please enter recipient User ID.');
      return;
    }
    if (!amount || amount <= 0) {
      setTransferError('Please enter a valid transfer amount.');
      return;
    }
    if (amount > currentCoins) {
      setTransferError('Insufficient coin balance.');
      return;
    }

    adjustCoins(-amount);
    setTransferSuccess(`Successfully transferred ${amount.toLocaleString()} Coins to ID ${targetId}!`);
    setTransferAmount('');
    setTimeout(() => {
      setTransferSuccess(null);
      setActiveModal(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-950 border border-purple-500/30 rounded-3xl w-full max-w-md shadow-2xl relative flex flex-col h-[92vh] max-h-[820px] overflow-hidden text-slate-100 select-none">
        {/* 1. Header (Tello Style) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/90 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-sm font-extrabold text-white tracking-wide">Coin Seller</h2>

          <button
            onClick={() => setShowGuideModal(true)}
            className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Operation Guide"
          >
            <HelpCircle className="w-4 h-4 text-purple-300" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-3 space-y-3 pb-8">
          {/* 2. Payroll Reward & Operation Guide Banner (Tello Style) */}
          <div
            onClick={() => setShowGuideModal(true)}
            className="cursor-pointer relative rounded-2xl overflow-hidden p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg text-white group"
          >
            <div className="relative z-10 max-w-[240px]">
              <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded bg-black/25 inline-block mb-1">
                Reseller Program
              </span>
              <h3 className="text-base font-black tracking-tight leading-tight drop-shadow-md">
                Payroll Reward & Operation Guide
              </h3>
              <p className="text-[11px] font-medium text-blue-100 mt-1">
                Official reseller rates, margins, and wholesale benefits.
              </p>
            </div>
            {/* Visual glow backdrop */}
            <div className="absolute right-2 top-2 bottom-2 w-28 bg-gradient-to-l from-amber-300/20 to-transparent pointer-events-none rounded-r-xl" />
          </div>

          {/* 3. Seller Profile Card (Tello Style) */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Ornate Golden Rim Frame Avatar */}
                <div className="w-13 h-13 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-md shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-white">agent {sellerName}</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                    <span>ID: {currentId}</span>
                    <button onClick={handleCopyId} className="hover:text-amber-300">
                      {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-300">
                    <span className="text-slate-400">Current level:</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-indigo-300" />
                      <span>Beginner</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* My Balance Row */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-slate-400 font-medium">My Balance</span>
                <button
                  onClick={() => setActiveModal('transfer')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-0.5"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                </div>
                <span className="text-2xl font-black text-amber-400">
                  {currentCoins.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 3 Action Tabs (Transfer, Recharge, Exchange - Tello Style) */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
              <button
                onClick={() => setActiveModal('transfer')}
                className="py-2 px-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
              >
                Transfer
              </button>

              <button
                onClick={() => onOpenRecharge?.()}
                className="py-2 px-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
              >
                Recharge
              </button>

              <button
                onClick={() => setActiveModal('exchange')}
                className="py-2 px-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
              >
                Exchange
              </button>
            </div>
          </div>

          {/* 4. Settings Group (Payment Method, WhatsApp, Greeting Message - Tello Style) */}
          <div className="p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md divide-y divide-slate-800/80 text-xs">
            {/* Payment Method */}
            <div
              onClick={() => {
                setPaymentInput(paymentMethod);
                setActiveModal('payment');
              }}
              className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 rounded-xl transition-colors"
            >
              <div>
                <span className="font-bold text-white block">Payment Method</span>
                <span className="text-[11px] text-slate-400 truncate max-w-[220px] block">{paymentMethod}</span>
              </div>

              <div className="flex items-center gap-1 text-slate-400 hover:text-white">
                <span className="text-[11px]">Setting</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Update WhatsApp */}
            <div
              onClick={() => {
                setWhatsAppInput(whatsAppNumber);
                setActiveModal('whatsapp');
              }}
              className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 rounded-xl transition-colors"
            >
              <div>
                <span className="font-bold text-white block">Update WhatsApp</span>
                <span className="text-[11px] text-slate-400 font-mono">{whatsAppNumber}</span>
              </div>

              <div className="flex items-center gap-1 text-slate-400 hover:text-white">
                <span className="text-[11px]">Setting</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Greeting Message */}
            <div
              onClick={() => {
                setGreetingInput(greetingMessage);
                setActiveModal('greeting');
              }}
              className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 rounded-xl transition-colors"
            >
              <div>
                <span className="font-bold text-white block">Greeting Message</span>
                <span className="text-[11px] text-slate-400 truncate max-w-[220px] block">{greetingMessage}</span>
              </div>

              <div className="flex items-center gap-1 text-slate-400 hover:text-white">
                <span className="text-[11px]">Setting</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Modal */}
        {activeModal === 'transfer' && (
          <div className="absolute inset-0 z-30 bg-black/90 p-5 flex flex-col justify-center animate-fade-in text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <Send className="w-4 h-4 text-amber-400" />
                <span>Transfer Coins to User</span>
              </span>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {transferSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{transferSuccess}</span>
              </div>
            )}

            {transferError && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            <form onSubmit={handleTransfer} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Recipient User ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1000004"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Coins Amount</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Available Balance: <strong className="text-amber-400">{currentCoins.toLocaleString()} Coins</strong>
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-xl text-xs shadow"
              >
                Confirm Transfer
              </button>
            </form>
          </div>
        )}

        {/* WhatsApp Modal */}
        {activeModal === 'whatsapp' && (
          <div className="absolute inset-0 z-30 bg-black/90 p-5 flex flex-col justify-center animate-fade-in text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-sm">Update WhatsApp Contact</span>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-300">
              This WhatsApp number will be displayed on your official Coin Seller profile for buyers.
            </p>
            <input
              type="text"
              value={whatsAppInput}
              onChange={(e) => setWhatsAppInput(e.target.value)}
              placeholder="+251 911 002233"
              className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
            />
            <button
              onClick={() => {
                setWhatsAppNumber(whatsAppInput.trim());
                setActiveModal(null);
              }}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow"
            >
              Save WhatsApp Number
            </button>
          </div>
        )}

        {/* Greeting Message Modal */}
        {activeModal === 'greeting' && (
          <div className="absolute inset-0 z-30 bg-black/90 p-5 flex flex-col justify-center animate-fade-in text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-sm">Update Greeting Message</span>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              rows={3}
              value={greetingInput}
              onChange={(e) => setGreetingInput(e.target.value)}
              placeholder="Enter automated greeting for your buyers..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-xl p-2.5 text-xs text-white outline-none resize-none"
            />
            <button
              onClick={() => {
                setGreetingMessage(greetingInput.trim());
                setActiveModal(null);
              }}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow"
            >
              Save Greeting Message
            </button>
          </div>
        )}

        {/* Payment Method Modal */}
        {activeModal === 'payment' && (
          <div className="absolute inset-0 z-30 bg-black/90 p-5 flex flex-col justify-center animate-fade-in text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-sm">Payment Methods Setting</span>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={paymentInput}
              onChange={(e) => setPaymentInput(e.target.value)}
              placeholder="e.g. Telebirr, CBE Bank, Dashen"
              className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-xl p-2.5 text-xs text-white outline-none"
            />
            <button
              onClick={() => {
                setPaymentMethod(paymentInput.trim());
                setActiveModal(null);
              }}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow"
            >
              Save Payment Method
            </button>
          </div>
        )}

        {/* Operation Guide Modal */}
        {showGuideModal && (
          <div className="absolute inset-0 z-30 bg-black/90 p-5 flex flex-col justify-center animate-fade-in text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-sm">Coin Seller Operation Guide</span>
              <button onClick={() => setShowGuideModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Certified Coin Sellers purchase bulk platform coins at wholesale discount tiers (Beginner: 96k/100$, Standard: 98k/100$, Senior: 100k/100$). Sellers can transfer inventory to users via User ID and receive payments directly through Telebirr or local bank transfer.
            </p>
            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
            >
              Hubadheera (Got It)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
