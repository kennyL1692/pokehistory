
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { POKEMON_MILESTONES } from './constants.ts';
import { Milestone } from './types.ts';
import HistoryCard from './components/HistoryCard.tsx';
import { getHistoricalInsight, getQuickStats } from './services/geminiService.ts';

const App: React.FC = () => {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone>(POKEMON_MILESTONES[0]);
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [facts, setFacts] = useState<string[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [customInsight, setCustomInsight] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const insightsCache = useRef<Record<string, string>>({});
  const prefetchStarted = useRef(false);

  const loadInsight = useCallback(async (milestone: Milestone) => {
    const cacheKey = `${milestone.year}-${milestone.title}`;
    
    if (insightsCache.current[cacheKey]) {
      setInsight(insightsCache.current[cacheKey]);
      setLoadingInsight(false);
      return;
    }

    setLoadingInsight(true);
    const topic = `${milestone.title} ${milestone.generation || ""}`;
    const data = await getHistoricalInsight(topic);
    
    insightsCache.current[cacheKey] = data;
    
    if (selectedMilestone.year === milestone.year) {
      setInsight(data);
      setLoadingInsight(false);
    }
  }, [selectedMilestone.year]);

  useEffect(() => {
    loadInsight(POKEMON_MILESTONES[0]);
    getQuickStats().then(setFacts);
    
    if (!prefetchStarted.current) {
      prefetchStarted.current = true;
      const prefetch = async () => {
        const nextItems = POKEMON_MILESTONES.slice(1, 6);
        for (let i = 0; i < nextItems.length; i++) {
          const m = nextItems[i];
          const cacheKey = `${m.year}-${m.title}`;
          if (!insightsCache.current[cacheKey]) {
            await new Promise(resolve => setTimeout(resolve, 2500 + (i * 1000)));
            const topic = `${m.title} ${m.generation || ""}`;
            const data = await getHistoricalInsight(topic);
            insightsCache.current[cacheKey] = data;
          }
        }
      };
      prefetch();
    }
  }, []); // Run once on mount

  const handleSelectMilestone = (m: Milestone) => {
    if (selectedMilestone.year === m.year) return;
    setSelectedMilestone(m);
    
    const cacheKey = `${m.year}-${m.title}`;
    if (insightsCache.current[cacheKey]) {
      setInsight(insightsCache.current[cacheKey]);
      setLoadingInsight(false);
    } else {
      setInsight(''); 
      loadInsight(m);
    }
  };

  const timeline = useMemo(() => (
    POKEMON_MILESTONES.map((m) => (
      <HistoryCard 
        key={`${m.year}-${m.title}`} 
        milestone={m} 
        isActive={selectedMilestone.year === m.year}
        onSelect={handleSelectMilestone}
      />
    ))
  ), [selectedMilestone.year]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isSearching) return;
    setIsSearching(true);
    const data = await getHistoricalInsight(userQuery);
    setCustomInsight(data);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-6xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-12 text-center relative">
        <div className="inline-block relative">
           <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-black italic leading-none select-none">
            POKÉ<span className="text-red-600">HISTORY</span>
          </h1>
          <div className="absolute -top-2 -right-6 w-5 h-5 rounded-full pikachu-red shadow-[0_0_20px_rgba(230,57,70,0.6)] animate-pulse"></div>
          <div className="absolute -top-2 -left-6 w-5 h-5 rounded-full pikachu-red shadow-[0_0_20px_rgba(230,57,70,0.6)] animate-pulse"></div>
        </div>
        <p className="text-black font-black uppercase tracking-[0.3em] text-[10px] mt-6 opacity-60">
          Digital Archive Access System // v2.0
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-4 flex flex-col gap-3 max-h-[80vh] overflow-y-auto pr-4 scrollbar-hide">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[10px] font-black tracking-widest text-black uppercase opacity-50">Timeline Indices</h2>
            <div className={`w-2 h-2 rounded-full ${loadingInsight ? 'bg-red-600 animate-ping' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'}`}></div>
          </div>
          {timeline}
        </aside>

        <main className="lg:col-span-8 space-y-6">
          <section className="bg-white rounded-[2rem] p-8 md:p-12 border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden min-h-[450px] scanlines">
            {loadingInsight && (
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-yellow-200 z-10">
                <div className="h-full bg-red-600 animate-[loading_0.8s_infinite_linear]"></div>
              </div>
            )}
            
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-end gap-4">
                <span className="mono text-6xl font-black text-red-600 italic leading-none">{selectedMilestone.year}</span>
                <div className="h-2 flex-1 bg-black/5 rounded-full mb-2"></div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-black leading-tight uppercase italic drop-shadow-sm">{selectedMilestone.title}</h2>
              
              <div className="space-y-6">
                {/* Instant Static Content */}
                <div className="relative">
                  <p className="text-black text-xl font-black bg-yellow-400 p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {selectedMilestone.description}
                  </p>
                </div>

                {/* Enhanced AI Content Layer */}
                <div className={`transition-all duration-300 transform ${loadingInsight ? 'opacity-30 scale-[0.99]' : 'opacity-100 scale-100'}`}>
                  {insight ? (
                    <div className="text-slate-900 leading-relaxed text-lg font-bold whitespace-pre-line border-t-4 border-black pt-6">
                      {insight.includes("QUOTA_REACHED") ? (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-600 rounded-lg text-red-600 italic text-sm">
                           <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                           {insight}
                        </div>
                      ) : insight}
                    </div>
                  ) : loadingInsight && (
                    <div className="space-y-4 pt-4">
                       <div className="h-4 bg-black/5 rounded w-full animate-pulse"></div>
                       <div className="h-4 bg-black/5 rounded w-11/12 animate-pulse"></div>
                       <div className="h-4 bg-black/5 rounded w-10/12 animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {facts.slice(0, 4).map((fact, idx) => (
              <div key={idx} className="bg-white border-4 border-black p-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-default">
                <p className="text-[12px] font-black text-black leading-snug">
                  <span className="text-red-600 mr-2 mono">DATA_0{idx + 1}:</span> {fact}
                </p>
              </div>
            ))}
          </section>

          <section className="bg-black border-4 border-black rounded-[2rem] p-8 shadow-[10px_10px_0px_0px_rgba(230,57,70,0.4)]">
            <h3 className="text-yellow-400 font-black uppercase italic tracking-widest text-sm mb-6 flex items-center gap-3">
              <span className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></span>
              Pikadex Neural Query Interface
            </h3>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Query database for specific Pokémon history..."
                className="flex-1 bg-zinc-900 border-4 border-zinc-800 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-zinc-700 focus:outline-none focus:border-yellow-400 transition-colors"
              />
              <button 
                type="submit"
                disabled={isSearching}
                className="bg-red-600 text-white font-black px-10 py-4 rounded-2xl hover:bg-yellow-400 hover:text-black transition-all uppercase text-sm tracking-widest disabled:opacity-30"
              >
                {isSearching ? 'LINKING...' : 'EXECUTE'}
              </button>
            </form>
            {customInsight && (
              <div className="mt-8 bg-zinc-900/50 p-6 rounded-2xl border-2 border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-zinc-300 font-bold text-sm leading-relaxed italic">
                  {customInsight.includes("QUOTA_REACHED") ? "Neural link saturated. Retry in 60s." : `"${customInsight}"`}
                </p>
              </div>
            )}
          </section>
        </main>
      </div>

      <footer className="mt-16 pt-8 border-t-4 border-black/10 text-center text-black font-black text-[10px] tracking-[0.6em] uppercase pb-16 opacity-30">
        <p>Archive Synchronized // End of Transmission</p>
      </footer>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default App;
