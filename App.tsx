
import React, { useState, useEffect, useMemo } from 'react';
import { POKEMON_MILESTONES } from './constants.ts';
import { Milestone } from './types.ts';
import HistoryCard from './components/HistoryCard.tsx';
import { getQuickStats } from './services/geminiService.ts';

const App: React.FC = () => {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone>(POKEMON_MILESTONES[0]);
  const [facts, setFacts] = useState<string[]>([]);
  const [userQuery, setUserQuery] = useState('');
  
  useEffect(() => {
    getQuickStats().then(setFacts);
  }, []);

  const handleSelectMilestone = (m: Milestone) => {
    setSelectedMilestone(m);
  };

  const filteredMilestones = useMemo(() => {
    if (!userQuery.trim()) return POKEMON_MILESTONES;
    return POKEMON_MILESTONES.filter(m => 
      m.title.toLowerCase().includes(userQuery.toLowerCase()) || 
      m.description.toLowerCase().includes(userQuery.toLowerCase()) ||
      m.year.includes(userQuery)
    );
  }, [userQuery]);

  const timeline = useMemo(() => (
    filteredMilestones.map((m) => (
      <HistoryCard 
        key={`${m.year}-${m.title}`} 
        milestone={m} 
        isActive={selectedMilestone.year === m.year}
        onSelect={handleSelectMilestone}
      />
    ))
  ), [selectedMilestone.year, filteredMilestones]);

  return (
    <div className="min-h-screen flex flex-col max-w-6xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-12 text-center relative">
        <div className="inline-block relative">
           <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-black italic leading-none select-none">
            POKÉ<span className="text-red-600">HISTORY</span>
          </h1>
          <div className="absolute -top-2 -right-6 w-5 h-5 rounded-full pikachu-red shadow-[0_0_20px_rgba(230,57,70,0.6)]"></div>
          <div className="absolute -top-2 -left-6 w-5 h-5 rounded-full pikachu-red shadow-[0_0_20px_rgba(230,57,70,0.6)]"></div>
        </div>
        <p className="text-black font-black uppercase tracking-[0.3em] text-[10px] mt-6 opacity-60">
          Static Local Archive System // v3.0 (Offline)
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-4 flex flex-col gap-3 max-h-[80vh] overflow-y-auto pr-4 scrollbar-hide">
          <div className="flex items-center justify-between mb-4 px-1 sticky top-0 bg-[#FFDE00] py-2 z-20">
            <h2 className="text-[10px] font-black tracking-widest text-black uppercase opacity-50">Local Index ({filteredMilestones.length})</h2>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
          </div>
          <div className="space-y-3">
            {timeline.length > 0 ? timeline : (
              <p className="text-xs font-black opacity-30 italic p-4">No matching records found...</p>
            )}
          </div>
        </aside>

        <main className="lg:col-span-8 space-y-6">
          <section className="bg-white rounded-[2rem] p-8 md:p-12 border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden min-h-[450px] scanlines">
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-end gap-4">
                <span className="mono text-6xl font-black text-red-600 italic leading-none">{selectedMilestone.year}</span>
                <div className="h-2 flex-1 bg-black/5 rounded-full mb-2"></div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-black leading-tight uppercase italic drop-shadow-sm">{selectedMilestone.title}</h2>
              
              <div className="space-y-6">
                <div className="relative">
                  <p className="text-black text-xl font-black bg-yellow-400 p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] leading-relaxed">
                    {selectedMilestone.description}
                  </p>
                </div>

                <div className="pt-6 border-t-4 border-black">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-4">Metadata Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMilestone.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-black text-white text-[10px] font-black rounded-full uppercase italic">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {facts.map((fact, idx) => (
              <div key={idx} className="bg-white border-4 border-black p-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-default">
                <p className="text-[12px] font-black text-black leading-snug">
                  <span className="text-red-600 mr-2 mono">LOCAL_RECORD_0{idx + 1}:</span> {fact}
                </p>
              </div>
            ))}
          </section>

          <section className="bg-black border-4 border-black rounded-[2rem] p-8 shadow-[10px_10px_0px_0px_rgba(230,57,70,0.4)]">
            <h3 className="text-yellow-400 font-black uppercase italic tracking-widest text-sm mb-6 flex items-center gap-3">
              <span className="w-4 h-4 bg-green-500 rounded-full"></span>
              Pikadex Local Search
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search local timeline records..."
                className="flex-1 bg-zinc-900 border-4 border-zinc-800 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-zinc-700 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>
          </section>
        </main>
      </div>

      <footer className="mt-16 pt-8 border-t-4 border-black/10 text-center text-black font-black text-[10px] tracking-[0.6em] uppercase pb-16 opacity-30">
        <p>Local Synchronized // End of Archive</p>
      </footer>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scanlines::after { pointer-events: none; }
      `}</style>
    </div>
  );
};

export default App;
