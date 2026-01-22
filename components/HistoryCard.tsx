
import React from 'react';
import { Milestone } from '../types';

interface HistoryCardProps {
  milestone: Milestone;
  onSelect: (m: Milestone) => void;
  isActive: boolean;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ milestone, onSelect, isActive }) => {
  return (
    <button
      onClick={() => onSelect(milestone)}
      className={`w-full text-left p-4 rounded-xl border-4 transition-all duration-150 group outline-none ${
        isActive 
          ? 'bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-1' 
          : 'bg-yellow-400 border-black/10 hover:border-black/40 hover:bg-yellow-300'
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="mono text-red-600 font-black text-xs">{milestone.year}</span>
        {milestone.generation && (
          <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${isActive ? 'bg-black text-yellow-400' : 'bg-black/10 text-black/40'}`}>
            {milestone.generation}
          </span>
        )}
      </div>
      <h3 className={`text-base font-black mb-1 leading-tight ${isActive ? 'text-black' : 'text-black/70'}`}>
        {milestone.title}
      </h3>
      <div className="flex flex-wrap gap-1 mt-2">
        {milestone.tags.slice(0, 2).map(tag => (
          <span key={tag} className="text-[8px] font-bold bg-white/40 text-black/60 px-1 py-0.5 rounded border border-black/5 uppercase">
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
};

export default HistoryCard;
