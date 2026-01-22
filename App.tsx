
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    
    setSelectedMilestone(current => {
      if (current.year === milestone.year) {
        setInsight(data);
        setLoadingInsight(false);
      }
      return current;
    });
  }, []);

  useEffect(() => {
    // Load initial item and quick stats
    loadInsight(POKEMON_MILESTONES[0]);
    getQuickStats().then(setFacts);
    
    // STAGGERED PRE-FETCHING: 
    // We fetch background items one by one with a delay to avoid 429 Resource Exhausted.
    const prefetch = async () => {
      const nextItems = POKEMON_MILESTONES.slice(1, 5);
      for (let i = 0; i < nextItems.length; i++) {
        const m = nextItems[i];
        const cacheKey = `${m.year}-${m.title}`;
        if (!insightsCache.current[cacheKey]) {
          // Wait 2 seconds between background requests
          await new Promise(resolve => setTimeout(resolve, 2000 + (i * 500)));
          const topic = `${m.title} ${m.generation || ""}`;
          const data = await getHistoricalInsight(topic);
          insightsCache.current[cacheKey] = data;
        }
      }
    };
    
    prefetch();
  }, [loadInsight]);

  const handleSelectMilestone = (m: Milestone) => {
    if (selectedMilestone.year === m.year) return;
    setSelectedMilestone(m);
    
    const cacheKey = `${m.year}-${m.title}`;
    if (insightsCache.current[cacheKey]) {
      setInsight(insightsCache.current[cacheKey]);
      setLoadingInsight(false);
    } else {
      // Clear AI text immediately to show the static description (instant snappiness)
      setInsight(''); 
      loadInsight(m);
    }
  };

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
      <header className="mb-10 text-center relative">
        <div className="inline-block relative">
           <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-black italic leading-none">
            POKÉ<span className="text-red-600">HISTORY</span>
          </h1>
          <div className="absolute -top-2 -right-6 w-5 h-5 rounded-full pikachu-red shadow-[0_0_15px_rgba(230,57,70,0.5)]"></div>
          <div className="absolute -top-2 -left-6 w-5 h-5 rounded-full pikachu-red shadow-[0_0_15px_rgba(230,57,70,0.5)]"></div>
        </div>
        <p className="text-black font-black uppercase tracking-[0.2em] text-[10px] mt-4 opacity-70">
          Instant Neural Retrieval System
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-4 flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-2 scrollbar-hide">
          <div className="flex items-center justify-between mb-2 ml-1">
            <h2 className="text-[10px] font-black tracking-widest text-black/50 uppercase">Timeline</h2>
            <div className={`w-1.5 h-1.5 rounded-full ${loadingInsight ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div>
          </div>
          {POKEMON_MILESTONES.map((m) => (
            <HistoryCard 
              key={`${m.year}-${m.title}`} 
              milestone={m} 
              isActive={selectedMilestone.year === m.year}
              onSelect={handleSelectMilestone}
            />
          ))}
        </aside>

        <main className="lg:col-span-8 space-y-6">
          <section className="bg-white rounded-[1.5rem] p-6 md:p-10 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden min-h-[400px]">
            {loadingInsight && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-200">
                <div className="h-full bg-red-600 animate-[loading_1s_infinite_linear]"></div>
              </div>
            )}
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="mono text-5xl font-black text-red-600 italic leading-none">{selectedMilestone.year}</span>
                <div className="h-1 flex-1 bg-black/5 rounded-full"></div>
                {loadingInsight && (
                   <span className="text-[9px] font-black text-red-600 uppercase tracking-widest animate-pulse">Requesting Data...</span>
                )}
              </div>
              
              <h2 className="text-4xl font-black text-black leading-tight uppercase italic">{selectedMilestone.title}</h2>
              
              <div className="transition-all duration-200">
                {/* Always show the local static description immediately */}
                <div className="mb-6">
                  <p className="text-black text-xl font-black bg-yellow-400/20 border-l-8 border-yellow-400 p-4 rounded-r-lg">
                    {selectedMilestone.description}
                  </p>
                </div>

                {/* AI Insight area */}
                <div className={`transition-opacity duration-300 ${loadingInsight ? 'opacity-40' : 'opacity-100'}`}>
                  {insight ? (
                    <div className="text-slate-900 leading-relaxed text-lg font-bold whitespace-pre-line border-t-2 border-dashed border-slate-100 pt-4">
                      {insight.startsWith("QUOTA_REACHED") ? (
                        <span className="text-red-600 italic text-sm uppercase block bg-red-50 p-2 rounded">{insight}</span>
                      ) : (
                        insight
                      )}
                    </div>
                  ) : loadingInsight && (
                    <div className="space-y-3 pt-2">
                       <div className="h-3 bg-slate-100 rounded w-full animate-pulse"></div>
                       <div className="h-3 bg-slate-100 rounded w-5/6 animate-pulse"></div>
                       <div className="h-3 bg-slate-100 rounded w-4/6 animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facts.slice(0, 4).map((fact, idx) => (
              <div key={idx} className="bg-white border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
                <p className="text-[11px] font-black text-slate-700 leading-tight">
                  <span className="text-red-600 mr-1">0{idx + 1}.</span> {fact}
                </p>
              </div>
            ))}
          </section>

          <section className="bg-black border-4 border-black rounded-[1.5rem] p-6 shadow-[6px_6px_0px_0px_rgba(230,57,70,0.4)]">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
              <input 
                type="text" 
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Deep query archive..."
                className="flex-1 bg-zinc-900 border-2 border-zinc-800 rounded-lg px-4 py-2 text-white font-bold placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-colors text-sm"
              />
              <button 
                type="submit"
                disabled={isSearching}
                className="bg-red-600 text-white font-black px-6 py-2 rounded-lg hover:bg-red-500 transition-all uppercase text-xs tracking-widest disabled:opacity-50"
              >
                {isSearching ? '...' : 'Query'}
              </button>
            </form>
            {customInsight && (
              <div className="mt-4 bg-zinc-900 p-4 rounded-lg border border-zinc-800 animate-in fade-in duration-200">
                <p className="text-zinc-400 font-bold text-xs leading-relaxed italic">
                  {customInsight.startsWith("QUOTA_REACHED") ? "System capacity reached. Please try again later." : `"${customInsight}"`}
                </p>
              </div>
            )}
          </section>
        </main>
      </div>

      <footer className="mt-12 pt-6 border-t-2 border-black/5 text-center text-black font-black text-[9px] tracking-[0.5em] uppercase pb-8 opacity-40">
        <p>End of Archive Transmission</p>
      </footer>

      <style>{`
        @keyframes loading {
          0% { width: 0%; left: 0%; }
          50% { width: 100%; left: 0%; }
          100% { width: 0%; left: 100%; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default App;
