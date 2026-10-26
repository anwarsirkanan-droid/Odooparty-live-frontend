import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  MessageSquare,
  Bell,
  Sparkles,
  Gift,
  Shield,
  Send,
  Users,
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'notifications' | 'chat'>('notifications');
  const [messages, setMessages] = useState<any[]>([]);

  const notifications = [
    {
      id: 'notif_welcome',
      title: 'Welcome to OdooParty Live!',
      desc: 'Experience 25-seat audio rooms, Crown Mic rewards up to 2,000,000 Pts/hr, Lucky Gifts with 10x multipliers, and verified Coin Seller tiers.',
      time: 'Just now',
      icon: '🎉',
    },
    {
      id: 'notif_crown',
      title: 'Crown Mic Hours Open',
      desc: 'Hosts on Crown Mic 1–4 earn bonus Points toward the weekly host tier ranking.',
      time: '1h ago',
      icon: '🎙️',
    },
    {
      id: 'notif_task',
      title: 'Daily Tasks Refreshed',
      desc: 'Complete your daily check-in and send gifts to earn free reward Coins.',
      time: 'Today',
      icon: '✨',
    },
  ];

  useEffect(() => {
    api.messages.getMessages()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pb-24 px-3 max-w-md mx-auto w-full space-y-3.5 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300">
            <MessageSquare className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Messages & Alerts</h2>
            <span className="text-[11px] text-slate-400">System notices & community chats</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'notifications'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'chat'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Direct Messages
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {activeTab === 'notifications' ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex items-start gap-3 shadow-md"
            >
              <div className="text-2xl shrink-0 mt-0.5">{n.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <span className="text-[10px] text-slate-500">{n.time}</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{n.desc}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-300">No Direct Messages Yet</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Meet new friends in live voice rooms or tap any user's profile to start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
