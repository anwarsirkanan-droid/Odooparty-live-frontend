import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, User, Image as ImageIcon, Check, AlertCircle, Loader2 } from 'lucide-react';

export const PROFILE_SETUP_STORAGE_KEY = 'odoo_profile_setup_done';

export function isProfileSetupComplete(user: any): boolean {
  try {
    if (localStorage.getItem(PROFILE_SETUP_STORAGE_KEY) === 'true') return true;
  } catch {}
  if (user && user.profileCompleted === true) return true;
  const nickname = user?.username || user?.name;
  const avatar = user?.avatar || user?.profilePicture;
  return !!(nickname && avatar);
}

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNickname(user?.username || user?.name || '');
    setAvatarUrl(user?.avatar || user?.profilePicture || '');
    setPreviewError(false);
    setError(null);
    setSuccess(false);
  }, [isOpen, user]);

  if (!isOpen) return null;

  const validateNickname = (v: string): string | null => {
    const t = v.trim();
    if (t.length < 2) return 'Nickname must be at least 2 characters.';
    if (t.length > 30) return 'Nickname must be at most 30 characters.';
    return null;
  };

  const validateAvatarUrl = (v: string): string | null => {
    const t = v.trim();
    if (!t) return null;
    try {
      const u = new URL(t);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return 'Avatar URL must start with http(s)://';
    } catch {
      return 'Please enter a valid URL.';
    }
    if (t.length > 2048) return 'Avatar URL is too long (max 2048 characters).';
    return null;
  };

  const handleSave = async () => {
    const nickErr = validateNickname(nickname);
    if (nickErr) { setError(nickErr); return; }
    const urlErr = validateAvatarUrl(avatarUrl);
    if (urlErr) { setError(urlErr); return; }

    setIsSaving(true);
    setError(null);
    try {
      await api.profile.updateProfile({
        username: nickname.trim(),
        avatar: avatarUrl.trim() || undefined,
      });
      try { localStorage.setItem(PROFILE_SETUP_STORAGE_KEY, 'true'); } catch {}
      await refreshUser();
      setSuccess(true);
      setTimeout(() => onClose(), 900);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to save profile. Please try again.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    try { localStorage.setItem(PROFILE_SETUP_STORAGE_KEY, 'true'); } catch {}
    onClose();
  };

  const nickErr = validateNickname(nickname);
  const urlErr = validateAvatarUrl(avatarUrl);
  const canSave = !nickErr && !urlErr && !isSaving;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 w-full max-w-sm shadow-2xl relative space-y-4">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          aria-label="Close profile setup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Set up your profile</h3>
            <span className="text-[10px] text-purple-300">Choose a nickname and avatar</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 border-2 border-purple-500/40 shrink-0">
            {avatarUrl.trim() && !previewError ? (
              <img
                src={avatarUrl.trim()}
                alt="Avatar preview"
                className="w-full h-full object-cover"
                onError={() => setPreviewError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Paste an image URL for your avatar, or leave blank to use the default.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={30}
              placeholder="Your nickname"
              className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none"
            />
            {nickErr && nickname.length > 0 && (
              <p className="mt-1 text-[10px] text-red-400">{nickErr}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Avatar URL (optional)</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => { setAvatarUrl(e.target.value); setPreviewError(false); }}
              placeholder="https://..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none"
            />
            {urlErr && avatarUrl.length > 0 && (
              <p className="mt-1 text-[10px] text-red-400">{urlErr}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-[11px] text-red-300">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] text-emerald-300">Profile saved!</span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSkip}
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors disabled:opacity-50"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupModal;
