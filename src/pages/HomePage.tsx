import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { VoiceRoom } from '../types';
import {
  Plus,
  Users,
  Mic,
  Search,
  RefreshCw,
  Trash2,
} from 'lucide-react';

interface HomePageProps {
  onJoinRoom: (room: VoiceRoom) => void;
  onOpenHostCenter?: () => void;
  onOpenTasks?: () => void;
  onOpenLevels?: () => void;
  onOpenWallet?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onJoinRoom,
}) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<VoiceRoom[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('Chat');

  // Only store and display real rooms created by real users/hosts - no fake rooms or fake hosts
  const getPersistedRooms = (): VoiceRoom[] => {
    try {
      const stored = localStorage.getItem('meso_live_rooms');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const savePersistedRooms = (roomList: VoiceRoom[]) => {
    try {
      localStorage.setItem('meso_live_rooms', JSON.stringify(roomList));
    } catch {
      // ignore
    }
  };

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const liveRooms = await api.rooms.getRooms();
      const localRooms = getPersistedRooms();
      const map = new Map<string, VoiceRoom>();
      if (Array.isArray(liveRooms)) {
        liveRooms.forEach((r) => map.set(r._id, r));
      }
      localRooms.forEach((r) => {
        if (!map.has(r._id)) map.set(r._id, r);
      });
      const combined = Array.from(map.values());
      setRooms(combined);
    } catch {
      setRooms(getPersistedRooms());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomTitle.trim()) return;

    try {
      const created = await api.rooms.createRoom(newRoomTitle.trim(), newRoomTopic);
      // Ensure host is assigned exclusively from the real authenticated user
      created.hostName = user?.username || 'Host';
      created.hostId = user?._id || user?.id || 'host_' + Date.now();
      created.topic = newRoomTopic;
      created.title = newRoomTitle.trim();
      created.isLive = true;
      created.onlineCount = 1;
      if (!created.seats || created.seats.length === 0) {
        created.seats = Array.from({ length: 25 }, (_, i) => ({
          seatIndex: i,
          isHostSeat: i === 0,
          isCrownMic: i >= 1 && i <= 4,
          user: null,
          isMuted: false,
          isLocked: false,
        }));
      }
      created.seats[0].user = {
        _id: created.hostId,
        username: created.hostName,
        role: user?.role || 'HOST',
        wealthLevel: user?.wealthLevel?.level || 1,
        charmLevel: user?.charmLevel?.level || 1,
      };

      const updated = [created, ...rooms.filter((r) => r._id !== created._id)];
      setRooms(updated);
      savePersistedRooms(updated);
      setIsCreateOpen(false);
      setNewRoomTitle('');
      onJoinRoom(created);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseRoom = async (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.rooms.closeRoom(roomId);
    } finally {
      const updated = rooms.filter((r) => r._id !== roomId);
      setRooms(updated);
      savePersistedRooms(updated);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesTag = selectedTag === 'All' || r.topic === selectedTag || r.tags?.includes(selectedTag);
    const matchesQuery = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.hostName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesQuery;
  });

  return (
    <div className="pb-20 px-3 max-w-md mx-auto w-full space-y-3.5 pt-2">


      {/* Search & Refresh Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search voice rooms by title or host..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
          />
        </div>
        <button
          onClick={fetchRooms}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          title="Refresh Rooms"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tag filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
        {['All', 'Popular', 'Music', 'Gaming', 'Chat'].map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-full font-semibold shrink-0 transition-all ${
              selectedTag === tag
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Create Room Button & Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <Mic className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-white">Live Voice Rooms ({filteredRooms.length})</span>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Start Room</span>
        </button>
      </div>

      {/* Voice Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="py-10 px-4 rounded-3xl bg-slate-900/60 border border-purple-500/20 flex flex-col items-center justify-center text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 shadow-inner">
            <Mic className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Kutaan Sagalee Amma Hin Jiru</h3>
          <p className="text-xs text-slate-400 max-w-xs mb-4 leading-relaxed">
            Fake room fi fake host tokkollee hin jiru. Kutaa sagalee keessan kan dhugaa banachuuf furtuu asii gadii fayyadamaa.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Kutaa Sagalee Dhugaa Uumi (Start Real Room)</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {filteredRooms.map((room) => {
            const isMyRoom = user?._id === room.hostId || (user?.username && room.hostName === user.username);
            return (
              <div
                key={room._id}
                onClick={() => onJoinRoom(room)}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-purple-950/20 border border-purple-500/20 hover:border-purple-500/50 cursor-pointer shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white text-base shadow-md">
                        {room.hostName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-slate-900 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white leading-tight mb-1">{room.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="text-purple-300 font-medium">Host: {room.hostName}</span>
                        <span>•</span>
                        <span className="bg-purple-950/80 text-purple-300 px-1.5 py-0.2 rounded font-medium border border-purple-500/20">
                          25 Seats
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Online user count & Close button for host */}
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                        <Users className="w-3 h-3" />
                        <span>{room.onlineCount || 1}</span>
                      </span>
                      {isMyRoom && (
                        <button
                          onClick={(e) => handleCloseRoom(room._id, e)}
                          title="Close/End Room"
                          className="p-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <span className="text-[9px] text-emerald-400 font-semibold">
                      ● Audio Live
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Room Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 w-full max-w-sm shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">Create Live Voice Room</h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Open a 25-seat audio room with Crown Mic seats and interactive chat.
            </p>

            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Room Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Late Night Music & Chill"
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Room Category</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['Chat', 'Music', 'Gaming', 'Popular'].map((topic) => (
                    <button
                      type="button"
                      key={topic}
                      onClick={() => setNewRoomTopic(topic)}
                      className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        newRoomTopic === topic
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30"
                >
                  Go Live (25 Seats)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
