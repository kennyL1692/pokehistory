
import React from 'react';
import { Milestone } from '../types.ts';

interface HistoryCardProps {
  milestone: Milestone;
  onSelect: (m: Milestone) => void;
  isActive: boolean;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ milestone, onSelect, isActive }) => {
  return (
    <button
      onClick={() => onSelect(milestone)}
      className={`w-full text-left p-4 rounded-xl border-4 transition-all duration-75 group outline-none ${
        isActive 
          ? 'bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5' 
          : 'bg-yellow-400 border-black/10 hover:border-black/40 hover:bg-yellow-300'
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="mono text-red-600 font-black text-[10px]">{milestone.year}</span>
        {milestone.generation && (
          <span className={`text-[7px] font-black uppercase tracking-tighter px-1 rounded ${isActive ? 'bg-black text-yellow-400' : 'bg-black/10 text-black/40'}`}>
            {milestone.generation}
          </span>
        )}
      </div>
      <h3 className={`text-sm font-black mb-1 leading-tight uppercase ${isActive ? 'text-black' : 'text-black/70'}`}>
        {milestone.title}
      </h3>
    </button>
  );
};

export default HistoryCard;
