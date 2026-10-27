/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { LiveRoom } from './components/LiveRoom';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { GamesPage } from './pages/GamesPage';
import { MessagesPage } from './pages/MessagesPage';
import { ProfilePage } from './pages/ProfilePage';
import { WalletModal } from './pages/WalletModal';
import { HostCenterModal } from './pages/HostCenterModal';
import { AgencyModal } from './pages/AgencyModal';
import { CoinSellerModal } from './pages/CoinSellerModal';
import { LevelDetailsModal } from './pages/LevelDetailsModal';
import { TaskCenterModal } from './pages/TaskCenterModal';
import { VerificationModal } from './pages/VerificationModal';
import { InvitationModal } from './pages/InvitationModal';
import { SettingsModal } from './pages/SettingsModal';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { ProfileSetupModal, isProfileSetupComplete } from './components/ProfileSetupModal';
import { VoiceRoom } from './types';

function MainApp() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Active Voice Room State
  const [activeRoom, setActiveRoom] = useState<VoiceRoom | null>(null);
  const [isRoomMinimized, setIsRoomMinimized] = useState(false);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDailyCheckInOpen, setIsDailyCheckInOpen] = useState(false);
  const checkinScheduledRef = React.useRef(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletDefaultTab, setWalletDefaultTab] = useState<'balance' | 'recharge' | 'withdraw'>('balance');
  const [isHostCenterOpen, setIsHostCenterOpen] = useState(false);
  const [isAgencyOpen, setIsAgencyOpen] = useState(false);
  const [isCoinSellerOpen, setIsCoinSellerOpen] = useState(false);
  const [isLevelsOpen, setIsLevelsOpen] = useState(false);
  const [levelsDefaultTab, setLevelsDefaultTab] = useState<'wealth' | 'charm'>('wealth');
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auto-display Daily Check-in modal on first app open if unclaimed
  React.useEffect(() => {
    if (!user) {
      checkinScheduledRef.current = false;
      return;
    }
    if (checkinScheduledRef.current) return;
    try {
      if (!isProfileSetupComplete(user)) return;
      const today = new Date().toISOString().slice(0, 10);
      const sessionDismissed = sessionStorage.getItem(`odoo_checkin_dismissed_${today}`);
      const saved = localStorage.getItem('odoo_daily_checkin');
      let alreadyClaimed = false;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastCheckInDate === today) {
          alreadyClaimed = true;
        }
      }

      if (!alreadyClaimed && !sessionDismissed) {
        checkinScheduledRef.current = true;
        const timer = setTimeout(() => {
          setIsDailyCheckInOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [user]);

  React.useEffect(() => {
    if (!user) return;
    try {
      if (isProfileSetupComplete(user)) return;
      const t = setTimeout(() => setIsProfileSetupOpen(true), 600);
      return () => clearTimeout(t);
    } catch {}
  }, [user]);

  const handleCloseDailyCheckIn = () => {
    setIsDailyCheckInOpen(false);
    try {
      const today = new Date().toISOString().slice(0, 10);
      sessionStorage.setItem(`odoo_checkin_dismissed_${today}`, 'true');
    } catch {}
  };

  // Quick navigation helpers
  const handleOpenRecharge = () => {
    setWalletDefaultTab('recharge');
    setIsWalletOpen(true);
  };

  const handleOpenWithdraw = () => {
    setWalletDefaultTab('withdraw');
    setIsWalletOpen(true);
  };

  const handleJoinRoom = (room: VoiceRoom) => {
    setActiveRoom(room);
    setIsRoomMinimized(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenWallet={() => {
          setWalletDefaultTab('balance');
          setIsWalletOpen(true);
        }}
        onOpenLevels={() => {
          setLevelsDefaultTab('wealth');
          setIsLevelsOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeRoom={activeRoom}
        onReturnToRoom={() => setIsRoomMinimized(false)}
        isMinimized={isRoomMinimized}
        currentTab={currentTab}
      />

      {/* Main Tab Content */}
      <main className="flex-1 w-full max-w-md mx-auto relative overflow-x-hidden">
        {currentTab === 'home' && (
          <HomePage
            onJoinRoom={handleJoinRoom}
            onOpenHostCenter={() => setIsHostCenterOpen(true)}
            onOpenTasks={() => setIsTasksOpen(true)}
            onOpenDailyCheckIn={() => setIsDailyCheckInOpen(true)}
            onOpenLevels={() => {
              setLevelsDefaultTab('wealth');
              setIsLevelsOpen(true);
            }}
            onOpenWallet={() => {
              setWalletDefaultTab('balance');
              setIsWalletOpen(true);
            }}
          />
        )}

        {currentTab === 'games' && <GamesPage />}

        {currentTab === 'messages' && <MessagesPage />}

        {currentTab === 'profile' && (
          <ProfilePage
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenWallet={() => {
              setWalletDefaultTab('balance');
              setIsWalletOpen(true);
            }}
            onOpenRecharge={handleOpenRecharge}
            onOpenWithdraw={handleOpenWithdraw}
            onOpenHostCenter={() => setIsHostCenterOpen(true)}
            onOpenAgency={() => setIsAgencyOpen(true)}
            onOpenCoinSeller={() => setIsCoinSellerOpen(true)}
            onOpenLevels={() => {
              setLevelsDefaultTab('wealth');
              setIsLevelsOpen(true);
            }}
            onOpenTasks={() => setIsTasksOpen(true)}
            onOpenVerification={() => setIsVerificationOpen(true)}
            onOpenInvitation={() => setIsInvitationOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onChangeTab={setCurrentTab} unreadCount={2} />

      {/* Active Live Room Screen (Shown when active and not minimized) */}
      {activeRoom && !isRoomMinimized && (
        <LiveRoom
          room={activeRoom}
          onClose={() => setActiveRoom(null)}
          onMinimize={() => setIsRoomMinimized(true)}
          onOpenRecharge={handleOpenRecharge}
        />
      )}

      {/* Modals & Secondary Pages */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <DailyCheckInModal
        isOpen={isDailyCheckInOpen}
        onClose={handleCloseDailyCheckIn}
      />
      <ProfileSetupModal
        isOpen={isProfileSetupOpen}
        onClose={() => setIsProfileSetupOpen(false)}
      />

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        defaultTab={walletDefaultTab}
        onOpenCoinSeller={() => {
          setIsWalletOpen(false);
          setIsCoinSellerOpen(true);
        }}
      />

      <HostCenterModal
        isOpen={isHostCenterOpen}
        onClose={() => setIsHostCenterOpen(false)}
        onOpenVerification={() => {
          setIsHostCenterOpen(false);
          setIsVerificationOpen(true);
        }}
        onJoinRoom={handleJoinRoom}
        onOpenTaskCenter={() => {
          setIsHostCenterOpen(false);
          setIsTasksOpen(true);
        }}
      />

      <AgencyModal isOpen={isAgencyOpen} onClose={() => setIsAgencyOpen(false)} />

      <CoinSellerModal
        isOpen={isCoinSellerOpen}
        onClose={() => setIsCoinSellerOpen(false)}
        onOpenAgency={() => {
          setIsCoinSellerOpen(false);
          setIsAgencyOpen(true);
        }}
        onOpenRecharge={handleOpenRecharge}
      />

      <LevelDetailsModal
        isOpen={isLevelsOpen}
        onClose={() => setIsLevelsOpen(false)}
        defaultTab={levelsDefaultTab}
      />

      <TaskCenterModal isOpen={isTasksOpen} onClose={() => setIsTasksOpen(false)} />

      <VerificationModal isOpen={isVerificationOpen} onClose={() => setIsVerificationOpen(false)} />

      <InvitationModal isOpen={isInvitationOpen} onClose={() => setIsInvitationOpen(false)} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
