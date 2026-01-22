
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { POKEMON_MILESTONES } from './constants';
import { Milestone } from './types';
import HistoryCard from './components/HistoryCard';
import { getHistoricalInsight, getQuickStats } from './services/geminiService';

const App: React.FC = () => {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone>(POKEMON_MILESTONES[0]);
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [facts, setFacts] = useState<string[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [customInsight, setCustomInsight] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Cache for AI insights to make switching instantaneous after first load
  const insightsCache = useRef<Record<string, string>>({});

  const loadInsight = useCallback(async (milestone: Milestone) => {
    const cacheKey = `${milestone.year}-${milestone.title}`;
    
    // 1. Check if we already have it
    if (insightsCache.current[cacheKey]) {
      setInsight(insightsCache.current[cacheKey]);
      setLoadingInsight(false);
      return;
    }

    // 2. Start loading
    setLoadingInsight(true);
    const topic = milestone.title + " " + (milestone.generation || "");
    const data = await getHistoricalInsight(topic);
    
    // 3. Update cache and state
    insightsCache.current[cacheKey] = data;
    
    // Only update if the user is still on the same milestone
    setSelectedMilestone(current => {
      if (current.year === milestone.year) {
        setInsight(data);
        setLoadingInsight(false);
      }
      return current;
    });
  }, []);

  useEffect(() => {
    // Initial data load
    loadInsight(POKEMON_MILESTONES[0]);
    getQuickStats().then(setFacts);
    
    // Speculative pre-fetching for the next 2 milestones to make the start feel fast
    POKEMON_MILESTONES.slice(1, 3).forEach(m => {
      const topic = m.title + " " + (m.generation || "");
      getHistoricalInsight(topic).then(data => {
        insightsCache.current[`${m.year}-${m.title}`] = data;
      });
    });
  }, [loadInsight]);

  const handleSelectMilestone = (m: Milestone) => {
    if (selectedMilestone.year === m.year) return;
    setSelectedMilestone(m);
    
    // Instant switch: Clear current AI insight or show cached version immediately
    const cacheKey = `${m.year}-${m.title}`;
    if (insightsCache.current[cacheKey]) {
      setInsight(insightsCache.current[cacheKey]);
      setLoadingInsight(false);
    } else {
      setInsight(''); // This triggers the "Local Description" view in the render
      loadInsight(m);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    setIsSearching(true);
    const data = await getHistoricalInsight(userQuery);
    setCustomInsight(data);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Header - Pikachu Inspired */}
      <header className="mb-10 text-center relative">
        <div className="inline-block relative">
           <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-black drop-shadow-sm italic">
            POKÉ<span className="text-red-600">HISTORY</span>
          </h1>
          <div className="absolute -top-4 -right-8 w-6 h-6 rounded-full pikachu-red shadow-lg shadow-red-500/50"></div>
          <div className="absolute -top-4 -left-8 w-6 h-6 rounded-full pikachu-red shadow-lg shadow-red-500/50"></div>
        </div>
        <p className="text-black font-bold uppercase tracking-widest text-xs mt-4 opacity-80">
          Neural Archive Access • Level 9 Clearance
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Timeline Sidebar - High Contrast */}
        <aside className="lg:col-span-4 flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-2 scrollbar-hide">
          <h2 className="text-[10px] font-black tracking-[0.3em] text-black/50 uppercase mb-2 ml-1">Archive Timeline</h2>
          {POKEMON_MILESTONES.map((m) => (
            <HistoryCard 
              key={m.year + m.title} 
              milestone={m} 
              isActive={selectedMilestone.year === m.year}
              onSelect={handleSelectMilestone}
            />
          ))}
        </aside>

        {/* Right: Detailed View - Optimized for perceived speed */}
        <main className="lg:col-span-8 space-y-6">
          <section className="bg-white rounded-[2rem] p-8 md:p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all duration-150">
            {/* Background Loading Progress Bar */}
            {loadingInsight && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-200">
                <div className="h-full bg-red-600 animate-[loading_1.5s_infinite_linear]"></div>
              </div>
            )}
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <span className="mono text-5xl font-black text-red-600 italic leading-none">{selectedMilestone.year}</span>
                <div className="h-1 flex-1 bg-black/5 rounded-full"></div>
                {loadingInsight && (
                  <span className="text-[10px] font-black text-red-600 animate-pulse uppercase">Syncing...</span>
                )}
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-black leading-none">{selectedMilestone.title}</h2>
              
              <div className="mt-2 min-h-[200px]">
                {!insight && !loadingInsight ? (
                   <p className="text-slate-500 italic">Initializing archive data...</p>
                ) : (
                  <div className={`transition-opacity duration-150 ${loadingInsight ? 'opacity-40' : 'opacity-100'}`}>
                    {insight ? (
                       <div className="text-slate-800 leading-relaxed text-lg font-medium whitespace-pre-line animate-in fade-in slide-in-from-top-2 duration-300">
                        {insight}
                      </div>
                    ) : (
                      // Show basic description instantly while AI loads
                      <div className="space-y-4">
                        <p className="text-slate-600 text-xl font-bold border-l-4 border-yellow-400 pl-4 bg-yellow-50 py-2">
                          {selectedMilestone.description}
                        </p>
                        <div className="space-y-2 pt-4">
                           <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
                           <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse"></div>
                           <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Quick Facts - Grid style */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facts.slice(0, 4).map((fact, idx) => (
              <div key={idx} className="bg-white border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-default">
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-2 h-2 rounded-full pikachu-red"></div>
                   <span className="text-[9px] font-black uppercase text-slate-400">Secret Data #{idx + 1}</span>
                </div>
                <p className="text-xs font-bold text-slate-700 leading-snug">{fact}</p>
              </div>
            ))}
          </section>

          {/* Archive Query */}
          <section className="bg-black border-4 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(230,57,70,0.4)]">
            <h2 className="text-xl font-black text-yellow-400 mb-4 uppercase italic flex items-center gap-2">
              <span className="block w-2 h-6 bg-red-600"></span>
              Pikadex Neural Search
            </h2>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 mb-4">
              <input 
                type="text" 
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Query the Professor..."
                className="flex-1 bg-zinc-900 border-2 border-zinc-700 rounded-xl px-5 py-3 text-white font-bold placeholder:text-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors"
              />
              <button 
                type="submit"
                disabled={isSearching}
                className="bg-yellow-400 text-black font-black px-6 py-3 rounded-xl hover:bg-white transition-all uppercase text-sm"
              >
                {isSearching ? '...' : 'Search'}
              </button>
            </form>

            {customInsight && (
              <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 animate-in zoom-in-95 duration-200">
                <p className="text-zinc-300 font-medium text-sm leading-relaxed italic">"{customInsight}"</p>
              </div>
            )}
          </section>
        </main>
      </div>

      <footer className="mt-16 pt-8 border-t-2 border-black/5 text-center text-black font-black text-[9px] tracking-[0.4em] uppercase pb-12 opacity-50">
        <p>Digital Archive End • No Pictures Found • High Fidelity Text Only</p>
      </footer>

      <style>{`
        @keyframes loading {
          0% { width: 0%; left: 0%; }
          50% { width: 100%; left: 0%; }
          100% { width: 0%; left: 100%; }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default App;
