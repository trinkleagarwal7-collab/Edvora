import React from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  FileText,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Eye,
  CheckCircle2,
  Box
} from 'lucide-react';
import { EscapeRoomRoomClient } from '../../types';

interface EscapeRoom2DFallbackProps {
  currentRoom: EscapeRoomRoomClient;
  totalRooms: number;
  keysCollected: number;
  onInteractTerminal: () => void;
  onInteractDoor: () => void;
  onInteractDesk: () => void;
  onSwitchTo3D: () => void;
}

export const EscapeRoom2DFallback: React.FC<EscapeRoom2DFallbackProps> = ({
  currentRoom,
  totalRooms,
  keysCollected,
  onInteractTerminal,
  onInteractDoor,
  onInteractDesk,
  onSwitchTo3D
}) => {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#131124] to-[#0a0914] text-white p-6 md:p-8 shadow-2xl border border-charcoal-800 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-800/80">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <span>
              Chamber {currentRoom.roomIndex + 1} of {totalRooms}
            </span>
            <span>•</span>
            <span className="capitalize">{currentRoom.roomTheme.replace('_', ' ')}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">{currentRoom.roomTitle}</h3>
          <p className="text-xs text-charcoal-400 max-w-xl leading-relaxed">
            {currentRoom.roomDescription}
          </p>
        </div>

        <button
          onClick={onSwitchTo3D}
          className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600 text-xs font-bold text-charcoal-200 hover:text-white transition-all flex items-center gap-1.5"
        >
          <Box className="w-4 h-4 text-brand-400" />
          <span>Enable 3D Scene</span>
        </button>
      </div>

      {/* 2D Interactive Chamber Illustration & Hotspots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
        {/* Hotspot 1: Holographic Terminal */}
        <div
          onClick={onInteractTerminal}
          className="p-5 rounded-3xl bg-cyan-950/30 border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-950/50 cursor-pointer transition-all space-y-4 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/30 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              Interactive
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
              Holographic Terminal
            </h4>
            <p className="text-xs text-charcoal-400 mt-1 line-clamp-2">
              The terminal displays the chamber's academic challenge. Click to open and submit your solution.
            </p>
          </div>

          <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-xs font-bold text-cyan-300">
            <span>{currentRoom.isCompleted ? '✓ Challenge Solved' : 'Open Question'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Hotspot 2: Scholar's Desk & Clues */}
        <div
          onClick={onInteractDesk}
          className="p-5 rounded-3xl bg-amber-950/30 border border-amber-500/40 hover:border-amber-400 hover:bg-amber-950/50 cursor-pointer transition-all space-y-4 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Clue Archive
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              Scholar's Clue Desk
            </h4>
            <p className="text-xs text-charcoal-400 mt-1 line-clamp-2">
              Inspect dusty scrolls and lecture excerpts to uncover hints and conceptual directions.
            </p>
          </div>

          <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs font-bold text-amber-300">
            <span>Inspect Clues</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Hotspot 3: Reinforced Vault Door */}
        <div
          onClick={onInteractDoor}
          className={`p-5 rounded-3xl border transition-all space-y-4 shadow-lg ${
            currentRoom.isCompleted
              ? 'bg-emerald-950/30 border-emerald-500/50 hover:bg-emerald-950/50 cursor-pointer hover:border-emerald-400 group'
              : 'bg-rose-950/20 border-rose-500/30 opacity-80 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                currentRoom.isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40'
                  : 'bg-rose-500/20 text-rose-400 border-rose-400/40'
              }`}
            >
              {currentRoom.isCompleted ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                currentRoom.isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}
            >
              {currentRoom.isCompleted ? 'Unlocked' : 'Locked'}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">Chamber Exit Portal</h4>
            <p className="text-xs text-charcoal-400 mt-1 line-clamp-2">
              {currentRoom.isCompleted
                ? 'The runes glow emerald and the bolt is withdrawn. Click to advance to the next chamber.'
                : 'Heavy iron door sealed with runic locks. Solve the terminal puzzle to disengage the lock.'}
            </p>
          </div>

          <div
            className={`pt-2 border-t flex items-center justify-between text-xs font-bold ${
              currentRoom.isCompleted
                ? 'border-emerald-500/20 text-emerald-300 group-hover:text-emerald-200'
                : 'border-rose-500/20 text-rose-400'
            }`}
          >
            <span>{currentRoom.isCompleted ? 'Pass Through Door' : 'Solve Puzzle First'}</span>
            <ArrowRight
              className={`w-4 h-4 ${
                currentRoom.isCompleted ? 'group-hover:translate-x-1 transition-transform' : ''
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
