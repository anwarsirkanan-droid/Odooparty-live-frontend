import React, { useState, useEffect, useRef } from 'react';
import { VoiceRoom, RoomSeat, RoomChatMessage, GiftItem, LuckyGiftResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { GiftModal } from './GiftModal';
import {
  Mic,
  MicOff,
  Lock,
  Unlock,
  Crown,
  Users,
  Send,
  Gift,
  Minimize2,
  PhoneOff,
  Volume2,
  Sparkles,
  Info,
  Shield,
  MessageCircle,
} from 'lucide-react';

interface LiveRoomProps {
  room: VoiceRoom;
  onClose: () => void;
  onMinimize: () => void;
  onOpenRecharge: () => void;
}

export const LiveRoom: React.FC<LiveRoomProps> = ({
  room,
  onClose,
  onMinimize,
  onOpenRecharge,
}) => {
  const { user } = useAuth();
  const [seats, setSeats] = useState<RoomSeat[]>(() => {
    if (room.seats && room.seats.length === 25) return room.seats;
    // Generate 25 seats
    return Array.from({ length: 25 }, (_, i) => ({
      seatIndex: i,
      isHostSeat: i === 0,
      isCrownMic: i >= 1 && i <= 4,
      user: i === 0 ? {
        _id: room.hostId,
        username: room.hostName,
        role: 'HOST',
        wealthLevel: 5,
        charmLevel: 10,
      } : null,
      isMuted: false,
      isLocked: false,
    }));
  });

  const [chatMessages, setChatMessages] = useState<RoomChatMessage[]>([
    {
      id: 'welcome',
      userId: 'system',
      username: 'OdooParty System',
      text: `Welcome to ${room.title}! Please follow community guidelines and enjoy audio socializing.`,
      isSystem: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [selectedSeatForGift, setSelectedSeatForGift] = useState<RoomSeat | null>(null);
  const [floatingGifts, setFloatingGifts] = useState<{ id: string; gift: GiftItem; lucky?: LuckyGiftResult; sender: string; receiver: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'seats' | 'participants'>('seats');
  const [noticeBoardText, setNoticeBoardText] = useState(room.noticeBoard || 'Enjoy the music & good vibes! Tap any seat to join the discussion.');
  const [isEditingNotice, setIsEditingNotice] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // My current seat if seated
  const mySeatIndex = seats.findIndex((s) => s.user?._id === user?._id || (user?.username && s.user?.username === user.username));
  const isHost = user?._id === room.hostId || user?.username === room.hostName || user?.role === 'ADMIN';

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Connect Socket.IO events for live room
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_room', { roomId: room._id, user });

    const handleRoomMessage = (msg: RoomChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    };

    const handleSeatUpdate = (updatedSeats: RoomSeat[]) => {
      setSeats(updatedSeats);
    };

    const handleGiftBroadcast = (data: any) => {
      const giftEvent = {
        id: 'gift_' + Date.now() + Math.random(),
        gift: data.gift,
        lucky: data.lucky,
        sender: data.senderName,
        receiver: data.receiverName,
      };
      setFloatingGifts((prev) => [...prev, giftEvent]);
      setTimeout(() => {
        setFloatingGifts((prev) => prev.filter((g) => g.id !== giftEvent.id));
      }, 3500);
    };

    socket.on('room_message', handleRoomMessage);
    socket.on('seat_update', handleSeatUpdate);
    socket.on('gift_broadcast', handleGiftBroadcast);

    return () => {
      socket.emit('leave_room', { roomId: room._id });
      socket.off('room_message', handleRoomMessage);
      socket.off('seat_update', handleSeatUpdate);
      socket.off('gift_broadcast', handleGiftBroadcast);
    };
  }, [room._id, user]);

  // Microphone initialization when user is seated
  useEffect(() => {
    if (mySeatIndex !== -1 && !isMicMuted) {
      let stream: MediaStream | null = null;
      navigator.mediaDevices?.getUserMedia({ audio: true, video: false })
        .then((s) => {
          stream = s;
          micStreamRef.current = s;
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioContextRef.current = ctx;
          const src = ctx.createMediaStreamSource(s);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          src.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setMicAudioLevel(Math.min(100, Math.round(avg * 1.5)));
            animFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        })
        .catch(() => {
          // Mic permission denied or not supported in environment
          setMicAudioLevel(0);
        });

      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach((t) => t.stop());
          micStreamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }
      };
    } else {
      setMicAudioLevel(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
    }
  }, [mySeatIndex, isMicMuted]);

  // Handle seat click
  const handleSeatClick = (seat: RoomSeat) => {
    if (seat.user) {
      // If seat has a user, open gift modal to gift them!
      setSelectedSeatForGift(seat);
      setIsGiftModalOpen(true);
      return;
    }

    if (seat.isLocked && !isHost) {
      return;
    }

    // Take seat
    if (mySeatIndex !== -1) {
      // Leave old seat first
      setSeats((prev) =>
        prev.map((s, idx) => {
          if (idx === mySeatIndex) return { ...s, user: null };
          if (idx === seat.seatIndex) {
            return {
              ...s,
              user: user ? {
                _id: user._id,
                username: user.username,
                role: user.role,
                wealthLevel: user.wealthLevel?.level || 1,
                charmLevel: user.charmLevel?.level || 1,
              } : { _id: 'guest', username: 'Guest' },
            };
          }
          return s;
        })
      );
    } else {
      setSeats((prev) =>
        prev.map((s, idx) =>
          idx === seat.seatIndex
            ? {
                ...s,
                user: user ? {
                  _id: user._id,
                  username: user.username,
                  role: user.role,
                  wealthLevel: user.wealthLevel?.level || 1,
                  charmLevel: user.charmLevel?.level || 1,
                } : { _id: 'guest', username: 'Guest' },
              }
            : s
        )
      );
    }
  };

  // Leave current seat
  const handleLeaveSeat = () => {
    if (mySeatIndex !== -1) {
      setSeats((prev) =>
        prev.map((s, idx) => (idx === mySeatIndex ? { ...s, user: null } : s))
      );
    }
  };

  // Toggle seat lock (Host only)
  const handleToggleSeatLock = (seatIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isHost) return;
    setSeats((prev) =>
      prev.map((s, idx) => (idx === seatIndex ? { ...s, isLocked: !s.isLocked } : s))
    );
  };

  // Send Chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg: RoomChatMessage = {
      id: 'msg_' + Date.now(),
      userId: user?._id || 'guest',
      username: user?.username || 'Guest',
      text: messageInput.trim(),
      role: user?.role || 'USER',
      wealthLevel: user?.wealthLevel?.level || 1,
      charmLevel: user?.charmLevel?.level || 1,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setMessageInput('');

    // Emit over socket
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('room_message', { roomId: room._id, message: newMsg });
    }
  };

  // On Gift Sent
  const handleGiftSent = (gift: GiftItem, count: number, luckyResult?: LuckyGiftResult) => {
    const receiverName = selectedSeatForGift?.user?.username || room.hostName;
    const senderName = user?.username || 'You';

    const giftMsg: RoomChatMessage = {
      id: 'gift_msg_' + Date.now(),
      userId: user?._id || 'guest',
      username: senderName,
      text: `sent ${gift.icon} ${gift.name} x${count} to ${receiverName}${luckyResult?.won ? ` and won ${luckyResult.multiplier}x!` : ''}`,
      isGift: true,
      giftData: {
        giftName: gift.name,
        giftIcon: gift.icon,
        count,
        multiplier: luckyResult?.multiplier,
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, giftMsg]);

    const giftEvent = {
      id: 'gift_' + Date.now(),
      gift,
      lucky: luckyResult,
      sender: senderName,
      receiver: receiverName,
    };
    setFloatingGifts((prev) => [...prev, giftEvent]);
    setTimeout(() => {
      setFloatingGifts((prev) => prev.filter((g) => g.id !== giftEvent.id));
    }, 3500);

    // Emit over socket
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('gift_broadcast', {
        roomId: room._id,
        gift,
        count,
        lucky: luckyResult,
        senderName,
        receiverName,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col max-w-md mx-auto w-full overflow-hidden">
      {/* Background visual ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Floating Gift Animations */}
      <div className="absolute top-16 left-0 right-0 z-40 pointer-events-none flex flex-col items-center gap-2">
        {floatingGifts.map((fg) => (
          <div
            key={fg.id}
            className="animate-float-gift bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-amber-900/90 border border-amber-400/50 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-2xl backdrop-blur-md"
          >
            <span className="text-3xl filter drop-shadow animate-bounce">{fg.gift.icon}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-amber-300">{fg.sender}</span>
                <span className="text-[10px] text-slate-300">sent to</span>
                <span className="text-xs font-bold text-pink-300">{fg.receiver}</span>
              </div>
              <div className="text-[11px] font-bold text-white flex items-center gap-1">
                <span>{fg.gift.name}</span>
                {fg.lucky?.won && (
                  <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded text-[10px] font-black">
                    JACKPOT {fg.lucky.multiplier}X!
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Room Header */}
      <header className="relative z-20 flex items-center justify-between px-3 py-2.5 bg-slate-900/80 backdrop-blur-md border-b border-purple-900/30">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
              {room.hostName.slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3 h-3 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-xs font-bold text-white truncate flex items-center gap-1">
              <span>{room.title}</span>
              {room.topic && (
                <span className="text-[10px] font-normal text-purple-300 bg-purple-950/80 px-1.5 py-0.2 rounded">
                  {room.topic}
                </span>
              )}
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="text-purple-300 font-medium">Host: {room.hostName}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-cyan-300">
                <Users className="w-3 h-3" />
                <span>{room.onlineCount || 1} online</span>
              </span>
            </div>
          </div>
        </div>

        {/* Room Header Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onMinimize}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Minimize Room"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-950/80 hover:bg-red-900/80 border border-red-500/30 text-red-200 transition-colors"
            title="Leave Room"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Notice Board Banner */}
      <div className="relative z-10 px-3 py-1.5 bg-purple-950/40 border-b border-purple-900/20 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-purple-200 truncate flex-1">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {isEditingNotice ? (
            <input
              type="text"
              value={noticeBoardText}
              onChange={(e) => setNoticeBoardText(e.target.value)}
              onBlur={() => setIsEditingNotice(false)}
              autoFocus
              className="bg-slate-900 text-white px-2 py-0.5 rounded text-xs w-full outline-none border border-purple-500"
            />
          ) : (
            <span className="truncate">{noticeBoardText}</span>
          )}
        </div>
        {isHost && !isEditingNotice && (
          <button
            onClick={() => setIsEditingNotice(true)}
            className="ml-2 text-[10px] text-purple-400 hover:text-purple-200 underline shrink-0"
          >
            Edit
          </button>
        )}
      </div>

      {/* Center Audio Stage: 25 Seats Grid */}
      <div className="relative z-10 flex-1 overflow-y-auto px-3 py-2">
        {/* Tier 1: Host Stage + 4 Crown Mic Seats */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Host Stage & Crown Mics (Seats 1–5)</span>
            </span>
            <span className="text-[10px] text-slate-400">Crown Mic Eligible</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {seats.slice(0, 5).map((seat) => {
              const isOccupied = !!seat.user;
              const isMe = seat.user?._id === user?._id || (user?.username && seat.user?.username === user.username);
              const isSpeaking = isMe ? micAudioLevel > 15 : false;

              return (
                <div
                  key={seat.seatIndex}
                  onClick={() => handleSeatClick(seat)}
                  className={`relative flex flex-col items-center p-2 rounded-2xl cursor-pointer border transition-all ${
                    seat.isHostSeat
                      ? 'bg-gradient-to-b from-purple-900/60 to-slate-900/80 border-purple-500/60 shadow-lg shadow-purple-900/30'
                      : 'bg-slate-900/80 border-amber-500/40 hover:border-amber-400'
                  }`}
                >
                  {/* Badge */}
                  <div className="absolute -top-1.5 -left-1">
                    {seat.isHostSeat ? (
                      <span className="bg-gradient-to-r from-amber-500 to-pink-500 text-slate-950 font-black text-[9px] px-1 rounded-full flex items-center gap-0.5 shadow">
                        <Crown className="w-2.5 h-2.5" /> HOST
                      </span>
                    ) : (
                      <span className="bg-amber-500/90 text-slate-950 font-extrabold text-[8px] px-1 rounded-full flex items-center gap-0.5 shadow">
                        <Crown className="w-2 h-2" /> CM{seat.seatIndex}
                      </span>
                    )}
                  </div>

                  {/* Lock icon if host */}
                  {isHost && !seat.isHostSeat && (
                    <button
                      onClick={(e) => handleToggleSeatLock(seat.seatIndex, e)}
                      className="absolute -top-1.5 -right-1 p-0.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                    >
                      {seat.isLocked ? <Lock className="w-2.5 h-2.5 text-red-400" /> : <Unlock className="w-2.5 h-2.5 text-slate-400" />}
                    </button>
                  )}

                  {/* Avatar or Empty Mic */}
                  <div className="relative my-1">
                    {isOccupied ? (
                      <div className="relative">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white text-xs shadow-md transition-all ${
                            isSpeaking
                              ? 'ring-4 ring-emerald-400 animate-pulse scale-105'
                              : 'border-2 border-purple-400'
                          } bg-gradient-to-tr from-purple-600 to-pink-600`}
                        >
                          {seat.user?.username.slice(0, 2).toUpperCase()}
                        </div>
                        {isSpeaking && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border border-slate-950 flex items-center justify-center">
                            <Volume2 className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-slate-800/80 border border-dashed border-slate-600 flex items-center justify-center text-slate-400 hover:text-purple-300 hover:border-purple-400 transition-colors">
                        {seat.isLocked ? <Lock className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
                      </div>
                    )}
                  </div>

                  {/* Name or Seat # */}
                  <span className="text-[10px] font-semibold text-slate-200 truncate w-full text-center">
                    {isOccupied ? seat.user?.username : `Seat ${seat.seatIndex + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tier 2: Remaining 20 Participants Seats (Seats 6 to 25) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Participant Seats (Seats 6–25)</span>
            </span>
            <span className="text-[10px] text-slate-400">20 open audio slots</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {seats.slice(5, 25).map((seat) => {
              const isOccupied = !!seat.user;
              const isMe = seat.user?._id === user?._id || (user?.username && seat.user?.username === user.username);
              const isSpeaking = isMe ? micAudioLevel > 15 : false;

              return (
                <div
                  key={seat.seatIndex}
                  onClick={() => handleSeatClick(seat)}
                  className="relative flex flex-col items-center p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all"
                >
                  {/* Lock button if host */}
                  {isHost && (
                    <button
                      onClick={(e) => handleToggleSeatLock(seat.seatIndex, e)}
                      className="absolute -top-1 -right-1 p-0.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                    >
                      {seat.isLocked ? <Lock className="w-2 h-2 text-red-400" /> : null}
                    </button>
                  )}

                  <div className="my-0.5">
                    {isOccupied ? (
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-[11px] shadow transition-all ${
                          isSpeaking ? 'ring-2 ring-emerald-400 scale-105' : 'border border-purple-500/50'
                        } bg-gradient-to-tr from-indigo-600 to-purple-600`}
                      >
                        {seat.user?.username.slice(0, 2).toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-slate-800/40 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 hover:text-purple-300 hover:border-purple-400">
                        {seat.isLocked ? <Lock className="w-3 h-3 text-red-400" /> : <Mic className="w-3 h-3" />}
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] font-medium text-slate-300 truncate w-full text-center">
                    {isOccupied ? seat.user?.username : `${seat.seatIndex + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Room Chat Message Stream */}
        <div className="mt-3 bg-slate-900/60 border border-purple-900/20 rounded-2xl p-2.5 h-36 flex flex-col">
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-xs leading-relaxed">
                {msg.isSystem ? (
                  <div className="bg-purple-950/60 border border-purple-500/20 rounded-xl px-2.5 py-1 text-[11px] text-purple-300 flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                ) : msg.isGift ? (
                  <div className="bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-500/30 rounded-xl px-2.5 py-1 text-[11px] flex items-center gap-1 text-pink-200">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="font-bold text-amber-300">{msg.username}</span>
                    <span>{msg.text}</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-1.5">
                    <span className="bg-purple-600/30 text-purple-300 text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5">
                      Lv.{msg.wealthLevel || 1}
                    </span>
                    <span className="font-bold text-slate-300 shrink-0">{msg.username}:</span>
                    <span className="text-slate-100 break-words">{msg.text}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Live Room Control Bar */}
      <footer className="relative z-20 bg-slate-900/90 backdrop-blur-md border-t border-purple-900/30 p-2.5">
        <div className="flex items-center gap-2">
          {/* Microphone toggle if seated */}
          {mySeatIndex !== -1 ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`p-2.5 rounded-2xl border transition-all ${
                  isMicMuted
                    ? 'bg-red-950/80 border-red-500/40 text-red-300'
                    : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 animate-pulse'
                }`}
                title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLeaveSeat}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-2 rounded-xl font-semibold border border-slate-700"
              >
                Leave Seat
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                // Find first free seat
                const free = seats.find((s) => !s.user && !s.isLocked);
                if (free) handleSeatClick(free);
              }}
              className="bg-purple-950/80 hover:bg-purple-900/80 text-purple-200 border border-purple-500/40 text-xs px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 shrink-0"
            >
              <Mic className="w-3.5 h-3.5 text-purple-400" />
              <span>Take Seat</span>
            </button>
          )}

          {/* Chat text input */}
          <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-1">
            <input
              type="text"
              placeholder="Say something friendly..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Gift Button */}
          <button
            onClick={() => {
              setSelectedSeatForGift(null);
              setIsGiftModalOpen(true);
            }}
            className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-600 to-amber-500 text-white shadow-lg shadow-pink-600/30 hover:scale-105 active:scale-95 transition-transform shrink-0"
            title="Send Gift"
          >
            <Gift className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Gift Modal Component */}
      <GiftModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        receiverName={selectedSeatForGift?.user?.username || room.hostName}
        receiverId={selectedSeatForGift?.user?._id || room.hostId}
        onGiftSent={handleGiftSent}
        onOpenRecharge={onOpenRecharge}
      />
    </div>
  );
};
