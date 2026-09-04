import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ChevronRight, ChevronLeft, X, Compass, Truck, Link, 
  Award, Eye, Activity, Info, CheckCircle2, Shield, Play, Database, MousePointer, Shuffle, MapPin, Search, Plus
} from 'lucide-react';

export default function InteractiveTutorialModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeSubStep, setActiveSubStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      console.log('💡 [TUTORIAL] Modal opened. Resetting step & sub-step.');
      setCurrentStep(0);
      setActiveSubStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    console.log(`🚀 [TUTORIAL] Active Main Step: ${currentStep} - "${steps[currentStep]?.title}"`);
    setActiveSubStep(0);
    const interval = setInterval(() => {
      setActiveSubStep(prev => {
        const maxSub = currentStep === 0 ? 1 : (currentStep === 1 ? 1 : (currentStep === 2 ? 2 : (currentStep === 3 ? 6 : (currentStep === 4 ? 6 : (currentStep === 5 ? 7 : (currentStep === 6 ? 6 : (currentStep === 7 ? 6 : (currentStep === 8 ? 5 : 5))))))));
        const nextSubStep = (prev + 1) % maxSub;
        console.log(`⏱️ [TUTORIAL] Step ${currentStep} SubStep Cycle -> [${nextSubStep}/${maxSub - 1}]`);
        return nextSubStep;
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to Smart Disaster Relief Platform",
      badge: "Platform Overview",
      icon: Activity,
      iconColor: "text-cyan-400",
      content: (
        <div className="space-y-4 text-slate-300 text-xs leading-relaxed">
          <p className="text-sm font-semibold text-slate-100">
            Welcome to <strong className="text-cyan-400 font-bold">Smart Disaster Relief (SDR-DSS)</strong>!
          </p>
          <p>
            An automated Decision Support System engineered for emergency crisis response, incorporating 5 computational algorithm modules and a REST database CRUD management portal.
          </p>
          <div className="bg-cyan-950/40 border border-cyan-800/40 p-3 rounded-xl flex items-center gap-2.5 text-xs text-cyan-300">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
            <span>Click <strong>Next</strong> to take an interactive 1-to-1 tour of every page control and algorithm simulation!</span>
          </div>
        </div>
      ),
      wireframe: (
        <div className="w-full h-full bg-[#080C14] border border-slate-800 rounded-xl p-6 flex flex-col justify-center items-center text-center font-sans select-none">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/10">
            <Compass className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <h2 className="text-lg font-black text-slate-100 tracking-tight">Smart Disaster Relief System (SDR-DSS)</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Automated crisis dispatch, road clearance, cargo knapsack optimization, SOS decision ranking, and TSP delivery tour sequencing.
          </p>

          <div className="flex flex-wrap justify-center gap-2 my-5 max-w-lg">
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-sky-400 px-2.5 py-1 rounded-full font-semibold">M1: Safe Routes (Dijkstra/A*)</span>
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-amber-400 px-2.5 py-1 rounded-full font-semibold">M2: Cargo Bay (0/1 Knapsack)</span>
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-cyan-400 px-2.5 py-1 rounded-full font-semibold">M3: Road Connectivity (MST)</span>
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-purple-400 px-2.5 py-1 rounded-full font-semibold">M4: SOS Priority (Branch & Bound)</span>
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-emerald-400 px-2.5 py-1 rounded-full font-semibold">M5: Delivery Tour (TSP 2-Opt)</span>
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-semibold">Database CRUD Portal</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 px-3 py-1 rounded-full font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>SYSTEM READY • ALL MODULES ONLINE</span>
          </div>
        </div>
      )
    },
    {
      title: "Detailed Module Info Guides",
      badge: "Header Info Icons",
      icon: Info,
      iconColor: "text-amber-400",
      content: (
        <div className="space-y-3 text-slate-300 text-xs leading-relaxed">
          <p>
            Every module header includes an interactive <strong className="text-amber-300 font-bold">Info Guide Button (ℹ️)</strong>. Clicking it opens a deep-dive technical modal for that page!
          </p>
          <p className="font-bold text-amber-400 text-[11.5px] uppercase tracking-wider">
            Inside Every Module Info Guide:
          </p>
          <ul className="list-disc pl-4 list-outside space-y-2 text-slate-400 text-[11px]">
            <li><strong className="text-slate-200">Purpose & Developer Credits:</strong> Lead developer attributions and real-world disaster management goals.</li>
            <li><strong className="text-slate-200">Interactive Controls:</strong> Complete breakdowns for dropdown selectors, algorithm filters, map click tools, and log controls.</li>
            <li><strong className="text-slate-200">Visual Map Indicators:</strong> Color codes for start/target nodes, blocked edges, path overlays, and animated convoy markers.</li>
            <li><strong className="text-slate-200">Analytics & Log Analyzers:</strong> Explanations for search logic trace logs, heuristic benchmarks, and decision metrics.</li>
          </ul>
        </div>
      ),
      wireframe: (
        <div className="relative w-full h-full bg-[#080C14] border border-slate-800 rounded-xl p-3 flex flex-col justify-between overflow-hidden font-sans">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">Module Header Title</span>
              <div className="relative inline-block">
                <span className="p-1 rounded-full bg-slate-800 text-amber-400 border border-amber-400 ring-2 ring-amber-400/60 inline-flex items-center justify-center">
                  <Info className="w-3.5 h-3.5" />
                </span>
                <div className="absolute top-5 left-1 z-30 flex items-center gap-1 animate-bounce pointer-events-none">
                  <MousePointer className="w-4 h-4 text-amber-400 fill-amber-400/40 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                  <span className="text-[8px] bg-amber-950 text-amber-200 px-1.5 py-0.5 rounded border border-amber-500/60 font-bold shadow-lg whitespace-nowrap">
                    Click (ℹ️) Guide
                  </span>
                </div>
              </div>
            </div>
            <span className="text-[9px] bg-slate-900 text-slate-400 px-2 py-1 rounded">Control Deck</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex-1 my-2 flex flex-col justify-center items-center text-center">
            <Info className="w-8 h-8 text-amber-400 mb-1" />
            <span className="text-xs font-bold text-slate-200">Module Deep Dive Guide</span>
            <span className="text-[10px] text-slate-400">Step-by-step instructions & controls</span>
          </div>
        </div>
      )
    },
    {
      title: "System Overview: Master Pipeline",
      badge: "Tab 1: System Overview",
      icon: Activity,
      iconColor: "text-emerald-400",
      content: (
        <div className="space-y-3 text-slate-300 text-xs leading-relaxed">
          <p>
            The <strong className="text-emerald-400 font-bold">System Overview</strong> tab presents a high-level summary deck of all 5 disaster response operations.
          </p>
          <ul className="list-disc pl-4 list-outside space-y-2 text-slate-400 text-[11px]">
            <li>The <strong>only interactive button</strong> on this page is <strong className="text-emerald-400 font-extrabold font-sans">"Run Full Disaster Relief Pipeline"</strong>!</li>
            <li>Clicking <strong>Run Pipeline</strong> automatically executes all 5 modules sequentially in real-time.</li>
            <li>The 5 module cards display live algorithm stack statuses (M3 Network, M4 Decisions, M2 Cargo, M5 TSP, M1 Safe Path).</li>
            <li>View the generated <strong className="text-emerald-300 font-bold">Final Disaster Relief Action Plan</strong> ready for crisis dispatch!</li>
          </ul>
        </div>
      ),
      wireframe: (
        <div className="relative w-full h-full bg-[#080C14] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between overflow-visible text-[10px] font-sans text-slate-100 select-none">
          {/* 1. Header Portfolio Card */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between shrink-0 relative z-20">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[7.5px] font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40 uppercase tracking-wider">
                  PDSA-2 Coursework Case Study
                </span>
                <span className="text-[7.5px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">5 MODULE PIPELINE</span>
              </div>
              <h3 className="text-xs font-black text-slate-100 mt-0.5">Smart Disaster Relief DSS (SDR-DSS)</h3>
            </div>

            {/* Run Full Pipeline Button */}
            <button className={`flex items-center gap-1.5 font-bold py-1.5 px-3 rounded-lg text-[8.5px] transition-all relative z-50 ${activeSubStep === 1 ? 'bg-emerald-400 text-slate-950 ring-4 ring-white scale-95 shadow-[0_0_18px_rgba(52,211,153,1)]' : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-300 scale-105'}`}>
              <Play className="w-2.5 h-2.5 fill-current animate-pulse" />
              <span>Run Full Disaster Relief Pipeline</span>
              <div className="absolute top-1/2 right-full mr-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl -translate-y-1/2">
                <span className={`text-[8.5px] px-2 py-0.5 rounded border font-bold shadow-2xl whitespace-nowrap mr-1 ${activeSubStep === 1 ? 'bg-emerald-400 text-slate-950 border-white' : 'bg-emerald-950 text-emerald-200 border-emerald-500/80'}`}>
                  {activeSubStep === 1 ? '⚡ CLICKING ▶ RUN PIPELINE' : '1. Click ▶ Run Pipeline'}
                </span>
                <MousePointer className={`w-4 h-4 text-emerald-300 fill-emerald-400/50 drop-shadow-[0_0_8px_rgba(52,211,153,1)] translate-x-1/2 shrink-0 transition-transform ${activeSubStep === 1 ? 'scale-90' : ''}`} />
              </div>
            </button>
          </div>

          {/* 2. Main Body Grid: 2 Columns for 5 Module Cards + 1 Column for Action Plan */}
          <div className="grid grid-cols-3 gap-2.5 my-2 flex-1 min-h-0 relative z-10">
            
            {/* Left Column (2 Cols): 5 Module Cards Grid */}
            <div className="col-span-2 grid grid-cols-2 gap-2 flex-1 min-h-0 overflow-hidden">
              
              {/* Module 3 Card */}
              <div className="bg-slate-950 border border-slate-850 p-2 rounded-lg flex flex-col justify-between transition-all">
                <div>
                  <div className="flex justify-between items-center text-[8px] font-bold">
                    <span className="text-slate-200">Module 3: Network Analysis</span>
                    <span className="text-cyan-400 font-mono text-[7px]">O(E log E)</span>
                  </div>
                  <p className="text-[7.5px] text-slate-400 mt-0.5 leading-tight">BFS/DFS + Kruskal's road clearance.</p>
                </div>
                <div className="text-[7px] text-cyan-300 font-mono font-bold pt-1 border-t border-slate-900">
                  BFS/DFS + Kruskal's MST
                </div>
              </div>

              {/* Module 4 Card */}
              <div className="bg-slate-950 border border-slate-850 p-2 rounded-lg flex flex-col justify-between transition-all">
                <div>
                  <div className="flex justify-between items-center text-[8px] font-bold">
                    <span className="text-slate-200">Module 4: Intelligent Decision</span>
                    <span className="text-purple-400 font-mono text-[7px]">O(2^n)</span>
                  </div>
                  <p className="text-[7.5px] text-slate-400 mt-0.5 leading-tight">Prioritizes SOS calls using B&B.</p>
                </div>
                <div className="text-[7px] text-purple-300 font-mono font-bold pt-1 border-t border-slate-900">
                  Branch & Bound (Exact)
                </div>
              </div>

              {/* Module 2 Card */}
              <div className="bg-slate-950 border border-slate-850 p-2 rounded-lg flex flex-col justify-between transition-all">
                <div>
                  <div className="flex justify-between items-center text-[8px] font-bold">
                    <span className="text-slate-200">Module 2: Resource Alloc</span>
                    <span className="text-amber-400 font-mono text-[7px]">O(2^n)</span>
                  </div>
                  <p className="text-[7.5px] text-slate-400 mt-0.5 leading-tight">Packs helicopter cargo payload.</p>
                </div>
                <div className="text-[7px] text-amber-300 font-mono font-bold pt-1 border-t border-slate-900">
                  0/1 Knapsack B&B
                </div>
              </div>

              {/* Module 5 Card */}
              <div className="bg-slate-950 border border-slate-850 p-2 rounded-lg flex flex-col justify-between transition-all">
                <div>
                  <div className="flex justify-between items-center text-[8px] font-bold">
                    <span className="text-slate-200">Module 5: Route Sequencing</span>
                    <span className="text-emerald-400 font-mono text-[7px]">O(n^2 2^n)</span>
                  </div>
                  <p className="text-[7.5px] text-slate-400 mt-0.5 leading-tight">TSP supply delivery untangling.</p>
                </div>
                <div className="text-[7px] text-emerald-300 font-mono font-bold pt-1 border-t border-slate-900">
                  Held-Karp DP / 2-opt
                </div>
              </div>

              {/* Module 1 Card */}
              <div className="col-span-2 bg-slate-950 border border-slate-850 p-2 rounded-lg flex items-center justify-between transition-all">
                <div>
                  <span className="text-[8px] font-bold text-slate-200 block">Module 1: Safe Route Optimization</span>
                  <span className="text-[7.5px] text-slate-400">Dijkstra & A* safe shortest driving paths.</span>
                </div>
                <span className="text-[7.5px] text-sky-400 font-mono font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  Dijkstra / A*
                </span>
              </div>

            </div>

            {/* Right Column: Final Disaster Relief Action Plan */}
            <div className="col-span-1 bg-slate-950 border border-slate-850 rounded-xl p-2.5 flex flex-col justify-between transition-all">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-[8px] font-black text-slate-200 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Action Plan
                </span>
                <span className="text-[7px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-bold">
                  READY
                </span>
              </div>

              {/* Action Plan Step Traces */}
              <div className="space-y-1.5 my-1.5 flex-1 overflow-hidden text-[7.5px]">
                <div className="bg-slate-900/80 border border-slate-800 p-1.5 rounded flex items-center gap-1 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                  <span className="truncate font-semibold">1. 34 Roads Unblocked</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-1.5 rounded flex items-center gap-1 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></span>
                  <span className="truncate font-semibold">2. Priority Camps Rescued</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-1.5 rounded flex items-center gap-1 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                  <span className="truncate font-semibold">3. Cargo Bay Packed 691kg</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-1.5 rounded flex items-center gap-1 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                  <span className="truncate font-semibold">4. Delivery Tour Untangled</span>
                </div>
              </div>

              <div className="text-[7.5px] text-emerald-400 font-mono font-bold text-center bg-emerald-950/60 p-1 rounded border border-emerald-800/60">
                DISPATCH ACTION PLAN GENERATED
              </div>
            </div>

          </div>
        </div>
      )
    },
    {
      title: "Module 1: Safe Route Optimization",
      badge: "Tab 2: Driving Paths",
      icon: Compass,
      iconColor: "text-blue-400",
      content: (
        <div className="space-y-3 text-slate-300 text-xs leading-relaxed">
          <p>
            <strong className="text-blue-400 font-bold">Module 1</strong> plots shortest safe driving routes between Central HQ and rescue camps.
          </p>
          <ul className="list-disc pl-4 list-outside space-y-2 text-slate-400 text-[11px]">
            <li>Click <strong>"Compare Both"</strong> to evaluate Dijkstra vs A* side-by-side.</li>
            <li>Click the <strong className="text-amber-400">Info (ℹ️) Guide</strong> for step breakdowns.</li>
            <li>Select <strong>START</strong> & <strong>TARGET</strong> nodes by clicking map nodes directly or using the <strong>dropdown menus</strong>!</li>
            <li>Click <strong>▶ Optimize Route</strong> to run pathfinding calculation.</li>
            <li>Click <strong className="text-sky-400">"Copy Logs"</strong> to export algorithm evaluation metrics.</li>
          </ul>
        </div>
      ),
      wireframe: (
        <div className="relative w-full h-full bg-[#080C14] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between overflow-visible text-[10px] font-sans text-slate-100 select-none">
          {/* 1. Page Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0 relative z-20">
            <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
              <Compass className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Module 1: Safe Route Optimization</span>
              <span className={`p-1 rounded-full bg-slate-800 text-sky-400 border border-sky-500/50 inline-flex relative z-50 cursor-pointer ${activeSubStep === 1 ? 'ring-2 ring-amber-400 text-amber-400 scale-110' : ''}`}>
                <Info className="w-3 h-3" />
                {activeSubStep === 1 && (
                  <div className="absolute top-1/2 left-1/2 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                    <MousePointer className="w-4 h-4 text-amber-300 fill-amber-400/50 drop-shadow-[0_0_8px_rgba(251,191,36,1)] -translate-x-1/2 -translate-y-1/2 shrink-0" />
                    <span className="text-[9px] bg-amber-950 text-amber-200 px-2.5 py-1 rounded-md border border-amber-500/80 font-bold shadow-2xl whitespace-nowrap ml-1.5">
                      2. Click (ℹ️) Guide
                    </span>
                  </div>
                )}
              </span>
            </div>

            {/* Top Right Toggle Buttons */}
            <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg gap-1 text-[9px] shrink-0 relative z-10">
              <span className={`px-2.5 py-1 rounded font-bold transition-all relative ${activeSubStep === 0 ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-300 scale-105' : 'bg-slate-800 text-slate-300'}`}>
                Compare Both
                {activeSubStep === 0 && (
                  <div className="absolute top-1/2 left-1/2 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                    <MousePointer className="w-4 h-4 text-cyan-300 fill-cyan-400/50 drop-shadow-[0_0_8px_rgba(34,211,238,1)] -translate-x-[2px] -translate-y-[2px] shrink-0" />
                    <span className="text-[9px] bg-cyan-950 text-cyan-200 px-2.5 py-1 rounded-md border border-cyan-500/80 font-bold shadow-2xl whitespace-nowrap ml-1">
                      1. Toggle Algorithm
                    </span>
                  </div>
                )}
              </span>
              <span className="text-slate-400 px-2 py-1">Dijkstra Only</span>
              <span className="text-slate-400 px-2 py-1">A* Heuristic</span>
            </div>
          </div>

          {/* 2. Main Content Grid (Left Map + Right Logs & Analyzer) */}
          <div className="grid grid-cols-3 gap-2.5 my-2.5 flex-1 min-h-0 relative z-10">
            
            {/* Left Column: Map Canvas */}
            <div className="col-span-2 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 relative flex flex-col justify-between overflow-hidden">
              {/* Map Action Badges */}
              <div className="absolute top-2.5 right-2.5 z-20 flex gap-1.5 text-[8px] font-bold">
                <span className="bg-slate-900/90 border border-slate-800 text-emerald-400 px-2 py-1 rounded flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Set Start
                </span>
                <span className="bg-slate-900/90 border border-slate-800 text-rose-400 px-2 py-1 rounded flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Set Target
                </span>
              </div>

              {/* SVG Map Canvas */}
              <div className="w-full h-full flex items-center justify-center relative">
                <svg viewBox="0 0 340 150" className="w-full h-full overflow-visible">
                  {/* Clean Road Edges */}
                  <line x1="45" y1="75" x2="100" y2="35" stroke="#334155" strokeWidth="2" />
                  <line x1="45" y1="75" x2="100" y2="115" stroke="#334155" strokeWidth="2" />
                  <line x1="100" y1="35" x2="190" y2="45" stroke="#22D3EE" strokeWidth="3" />
                  <line x1="100" y1="115" x2="200" y2="115" stroke="#334155" strokeWidth="2" />
                  <line x1="190" y1="45" x2="285" y2="75" stroke="#22D3EE" strokeWidth="3" />
                  <line x1="200" y1="115" x2="285" y2="75" stroke="#334155" strokeWidth="2" />
                  
                  {/* Dashed Red Danger Edges */}
                  <line x1="45" y1="75" x2="200" y2="115" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4,4" />
                  <line x1="100" y1="35" x2="285" y2="75" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4,4" />

                  {/* Node 1: Colombo HQ */}
                  <g>
                    <circle cx="45" cy="75" r="11" fill="#10B981" stroke="#34D399" strokeWidth="2" className={activeSubStep === 2 ? "animate-pulse" : ""} />
                    <text x="45" y="79" fill="#fff" fontSize="6.5" textAnchor="middle" fontWeight="black">HQ</text>
                    <text x="45" y="96" fill="#34D399" fontSize="6" textAnchor="middle" fontWeight="bold">Colombo HQ</text>
                  </g>

                  {/* Junction B */}
                  <g>
                    <circle cx="100" cy="35" r="7" fill="#0891B2" stroke="#22D3EE" strokeWidth="1.5" />
                    <text x="100" y="37.5" fill="#fff" fontSize="5" textAnchor="middle" fontWeight="bold">14</text>
                  </g>

                  {/* Junction C */}
                  <g>
                    <circle cx="100" cy="115" r="7" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
                    <text x="100" y="117.5" fill="#94A3B8" fontSize="5" textAnchor="middle">15</text>
                  </g>

                  {/* Junction A */}
                  <g>
                    <circle cx="190" cy="45" r="7" fill="#0891B2" stroke="#22D3EE" strokeWidth="1.5" />
                    <text x="190" y="47.5" fill="#fff" fontSize="5" textAnchor="middle" fontWeight="bold">5</text>
                  </g>

                  {/* Junction E */}
                  <g>
                    <circle cx="200" cy="115" r="7" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
                    <text x="200" y="117.5" fill="#94A3B8" fontSize="5" textAnchor="middle">17</text>
                  </g>

                  {/* Node 2: Camp A */}
                  <g>
                    <circle cx="285" cy="75" r="11" fill="#EF4444" stroke="#F87171" strokeWidth="2" className={activeSubStep === 3 ? "animate-pulse" : ""} />
                    <text x="285" y="79" fill="#fff" fontSize="6.5" textAnchor="middle" fontWeight="black">2</text>
                    <text x="285" y="96" fill="#F87171" fontSize="6" textAnchor="middle" fontWeight="bold">Camp A</text>
                  </g>

                  {/* SVG Cursor Step 3: Select Start Node */}
                  {activeSubStep === 2 && (
                    <foreignObject x="45" y="75" width="160" height="40" className="overflow-visible pointer-events-none z-[100]">
                      <div className="flex items-center -translate-x-[1px] -translate-y-[1px] z-[100] scale-[0.65] origin-top-left">
                        <MousePointer className="w-4 h-4 text-emerald-300 fill-emerald-400/50 drop-shadow-[0_0_8px_rgba(52,211,153,1)] shrink-0" />
                        <span className="text-[9px] bg-emerald-950 text-emerald-200 px-2.5 py-1 rounded-md border border-emerald-500/80 font-bold shadow-2xl whitespace-nowrap ml-1">
                          3. Select Start Node
                        </span>
                      </div>
                    </foreignObject>
                  )}

                  {/* SVG Cursor Step 4: Select Target Node */}
                  {activeSubStep === 3 && (
                    <foreignObject x="135" y="55" width="150" height="40" className="overflow-visible pointer-events-none z-[100]">
                      <div className="flex items-center justify-end w-full h-full z-[100] scale-[0.65] origin-top-right">
                        <span className="text-[9px] bg-rose-950 text-rose-200 px-2.5 py-1 rounded-md border border-rose-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                          4. Select Target Node
                        </span>
                        <MousePointer className="w-4 h-4 text-rose-300 fill-rose-400/50 drop-shadow-[0_0_8px_rgba(244,63,94,1)] -translate-x-[1px] -translate-y-[1px] shrink-0" />
                      </div>
                    </foreignObject>
                  )}
                </svg>
              </div>
            </div>

            {/* Right Column: Search Logs + Routing Decision Analyzer */}
            <div className="col-span-1 flex flex-col gap-2 min-h-0">
              {/* Search Logic Logs Panel */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                    <span className="text-[8.5px] font-bold text-slate-200 uppercase tracking-wider">Search Logic Logs</span>
                  </div>
                  <button className={`text-[8px] font-bold px-2 py-0.5 rounded border transition-all relative z-50 ${activeSubStep === 5 ? 'bg-sky-500 text-slate-950 border-sky-300 ring-2 ring-sky-300 scale-105' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    Copy Logs
                    {activeSubStep === 5 && (
                      <div className="absolute top-1/2 right-full mr-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl -translate-y-1/2">
                        <span className="text-[8.5px] bg-sky-950 text-sky-200 px-2 py-0.5 rounded border border-sky-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                          6. Copy Search Logs
                        </span>
                        <MousePointer className="w-4 h-4 text-sky-300 fill-sky-400/50 drop-shadow-[0_0_8px_rgba(56,189,248,1)] translate-x-1/2 shrink-0" />
                      </div>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900/80 border border-slate-850 rounded-lg p-2 flex-1 my-1.5 text-[8px] font-mono space-y-1 overflow-hidden leading-snug">
                  <div className="text-cyan-400 font-bold">[1] [Dijkstra Search] 48.2 Km (72m)</div>
                  <div className="text-emerald-400 font-bold">[2] [A* Goal-Directed] 5 nodes</div>
                  <div className="text-slate-400 text-[7.5px] mt-1 border-t border-slate-800 pt-1">Evaluating heuristics...</div>
                </div>
              </div>

              {/* Routing Decision Analyzer */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 text-[8px] text-slate-300 space-y-1 shrink-0">
                <span className="text-sky-400 font-extrabold uppercase tracking-wider flex items-center gap-1 text-[8.5px]">
                  <Info className="w-3 h-3 text-sky-400" /> Routing Decision Analyzer
                </span>
                <p className="text-[7.5px] text-slate-400 leading-tight">
                  Click log entries above to inspect evaluation metrics.
                </p>
              </div>
            </div>

          </div>

          {/* 3. Bottom Control Deck Bar */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3 shrink-0 text-[9px] relative z-20">
            {/* Left Controls: START / TARGET Dropdowns + Optimize Button */}
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[7.5px] font-bold text-slate-400 block mb-0.5 uppercase tracking-wider">START</span>
                <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-slate-200 font-mono font-bold flex items-center gap-1.5 text-[8.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Colombo HQ <span>v</span>
                </div>
              </div>
              <div>
                <span className="text-[7.5px] font-bold text-slate-400 block mb-0.5 uppercase tracking-wider">TARGET</span>
                <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-slate-200 font-mono font-bold flex items-center gap-1.5 text-[8.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Camp A <span>v</span>
                </div>
              </div>
              <div className="pt-2.5">
                <button className={`px-3.5 py-1.5 rounded-full font-extrabold flex items-center gap-1.5 transition-all relative ${activeSubStep === 4 ? 'bg-sky-400 text-slate-950 ring-2 ring-white scale-105 shadow-[0_0_12px_rgba(56,189,248,0.9)]' : 'bg-sky-500 text-slate-950'}`}>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Optimize</span>
                  {activeSubStep === 4 && (
                    <div className="absolute top-1/2 left-1/2 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                      <MousePointer className="w-4 h-4 text-sky-300 fill-sky-400/50 drop-shadow-[0_0_12px_rgba(56,189,248,1)] -translate-x-[2px] -translate-y-[2px] shrink-0" />
                      <span className="text-[9px] bg-sky-950 text-sky-200 px-2.5 py-1 rounded-md border border-sky-500/80 font-bold shadow-2xl whitespace-nowrap ml-1">
                        5. Click ▶ Optimize
                      </span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Right Metrics Display Cards */}
            <div className="flex items-center gap-2 text-center text-[8px]">
              <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                <span className="text-slate-400 block uppercase text-[7px]">DISTANCE</span>
                <span className="text-cyan-400 font-mono font-bold text-[9px]">48.2 KM</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                <span className="text-slate-400 block uppercase text-[7px]">TRAVEL TIME</span>
                <span className="text-cyan-400 font-mono font-bold text-[9px]">72 MINS</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                <span className="text-slate-400 block uppercase text-[7px]">NODES</span>
                <span className="text-slate-300 font-mono text-[8.5px]"><strong className="text-amber-400">D: 8</strong> | <strong className="text-emerald-400">A*: 5</strong></span>
              </div>
            </div>

          </div>
        </div>
      )
    },
    {
      title: "Module 2: Helicopter Cargo Packing",
      badge: "Tab 3: Cargo Allocation",
      icon: Truck,
      iconColor: "text-amber-400",
      content: (
        <div className="space-y-3 text-slate-300 text-xs leading-relaxed">
          <p>
            <strong className="text-amber-400 font-bold">Module 2</strong> packs high-priority emergency cargo into rescue helicopters without exceeding weight payloads using 0/1 Knapsack optimization.
          </p>
          <ul className="list-disc pl-4 list-outside space-y-2 text-slate-400 text-[11px]">
            <li>Select different rescue helicopters (<strong>RESCUE-01</strong>, <strong>HELI-COMMANDER</strong>) using the top dropdown.</li>
            <li>Toggle algorithms between <strong className="text-amber-300">Branch & Bound</strong> (Exact) vs <strong className="text-sky-300">Greedy 2-Approx</strong> (Fast).</li>
            <li>Click the <strong className="text-amber-400">Info (ℹ️) Guide</strong> to view payload rules.</li>
            <li>Toggle execution mode between <strong className="text-amber-300">🎬 Simulation</strong> vs <strong className="text-slate-300">⚡ Instant</strong>.</li>
            <li>Click <strong>▶ Start Simulation</strong> to run real-time cargo bay packing!</li>
            <li>Click <strong className="text-sky-400">"Copy Logs"</strong> to export knapsack evaluation steps.</li>
          </ul>
        </div>
      ),
      wireframe: (
        <div className="relative w-full h-full bg-[#080C14] border border-slate-800 rounded-xl p-3 flex flex-col justify-between overflow-visible text-[10px] font-sans text-slate-100 select-none">
          {/* 1. Header (Title + Info Guide + Branch & Bound vs Greedy Toggle) */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 shrink-0 relative z-20">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
                <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Module 2: Intelligent Resource Allocation</span>
                <span className={`p-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 inline-flex relative z-50 cursor-pointer ${activeSubStep === 2 ? 'ring-2 ring-amber-400 text-amber-400 scale-110' : ''}`}>
                  <Info className="w-2.5 h-2.5" />
                  {activeSubStep === 2 && (
                    <div className="absolute top-1/2 left-1/2 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                      <MousePointer className="w-4 h-4 text-amber-300 fill-amber-400/50 drop-shadow-[0_0_8px_rgba(251,191,36,1)] -translate-x-1/2 -translate-y-1/2 shrink-0" />
                      <span className="text-[8.5px] bg-amber-950 text-amber-200 px-2 py-0.5 rounded border border-amber-500/80 font-bold shadow-2xl whitespace-nowrap ml-1.5">
                        3. Click (ℹ️) Guide
                      </span>
                    </div>
                  )}
                </span>
              </div>
              <p className="text-[7.5px] text-slate-400 mt-0.5">
                0/1 Knapsack helicopter gear allocation. Branch & Bound vs Greedy 2-Approx.
              </p>
            </div>

            {/* Top Right Toggle Buttons */}
            <div className="flex bg-slate-850 p-0.5 border border-slate-700 rounded-lg gap-0.5 text-[8px] shrink-0 relative z-10">
              <span className={`px-2 py-1 rounded font-bold transition-all relative ${activeSubStep === 1 ? 'bg-sky-600 text-white shadow ring-2 ring-sky-300' : 'bg-sky-600 text-slate-100'}`}>
                Branch & Bound
                {activeSubStep === 1 && (
                  <div className="absolute top-1/2 right-full mr-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl -translate-y-1/2">
                    <span className="text-[8.5px] bg-cyan-950 text-cyan-200 px-2 py-0.5 rounded border border-cyan-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                      2. Toggle Algorithm
                    </span>
                    <MousePointer className="w-4 h-4 text-cyan-300 fill-cyan-400/50 drop-shadow-[0_0_8px_rgba(34,211,238,1)] translate-x-1/2 shrink-0" />
                  </div>
                )}
              </span>
              <span className="text-slate-400 px-1.5 py-1">Greedy 2-Approx</span>
            </div>
          </div>

          {/* 2. Main Content Grid (Left Cargo Visual + Right Algorithm Logs) */}
          <div className="grid grid-cols-2 gap-2 my-2 flex-1 min-h-0 relative z-10">
            
            {/* Left Box: Helicopter & Stacked Cargo Bay */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Helicopter Cargo Bay</span>
                <div className={`bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded text-[8px] font-mono flex items-center gap-1 relative ${activeSubStep === 0 ? 'ring-2 ring-sky-400 scale-105' : ''}`}>
                  <span>RESCUE-01 (Max: 800kg)</span>
                  {activeSubStep === 0 && (
                    <div className="absolute top-1/2 right-full mr-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl -translate-y-1/2">
                      <span className="text-[8.5px] bg-sky-950 text-sky-200 px-2 py-0.5 rounded border border-sky-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                        1. Select Helicopter
                      </span>
                      <MousePointer className="w-4 h-4 text-sky-300 fill-sky-400/50 drop-shadow-[0_0_8px_rgba(56,189,248,1)] translate-x-1/2 shrink-0" />
                    </div>
                  )}
                </div>
              </div>

              {/* Helicopter Graphic + Cargo Bay Container */}
              <div className="flex-1 my-1.5 bg-slate-900/50 border border-dashed border-slate-800 rounded-lg p-2 flex flex-col items-center justify-between overflow-hidden">
                {/* Helicopter Icon & Rotor SVG */}
                <div className="flex justify-center my-1">
                  <div className="relative flex items-center justify-center text-sky-400 w-24 h-10">
                    <svg className="w-full h-full fill-current animate-bounce" viewBox="0 -24 100 74">
                      <path d="M70 25c0-6.6-5.4-12-12-12H40c-6.6 0-12 5.4-12 12s5.4 12 12 12h18c6.6 0 12-5.4 12-12z" />
                      <path d="M58 13v-6h12v2h-10v4z" />
                      <path d="M40 37v-4h-8v4z" />
                      <rect x="24" y="24" width="8" height="4" rx="2" />
                      <line x1="28" y1="28" x2="28" y2="40" stroke="currentColor" strokeWidth="2" />
                      <line x1="16" y1="40" x2="52" y2="40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      <path d="M28 25H5" stroke="currentColor" strokeWidth="4" />
                      <path d="M5 25V18" stroke="currentColor" strokeWidth="3" />
                      <g transform="translate(64, 7)">
                        <line x1="-30" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth="2" className="animate-spin" style={{ transformOrigin: '0px 0px' }} />
                      </g>
                      <g transform="translate(5, 18)">
                        <line x1="-8" y1="0" x2="8" y2="0" stroke="currentColor" strokeWidth="1.5" className="animate-spin" style={{ transformOrigin: '0px 0px' }} />
                      </g>
                    </svg>
                  </div>
                </div>

                <div className="text-[8px] text-slate-400 font-semibold mb-1">
                  Payload Load: <span className="text-sky-400 font-bold">650</span> / 800 kg
                </div>

                {/* Stacked Cargo Container Box */}
                <div className="w-full bg-slate-800 border-2 border-slate-650 rounded-lg p-1.5 flex flex-col justify-end gap-1.5 h-28 overflow-hidden shadow-inner">
                  <div className="bg-emerald-700/90 text-emerald-50 border border-emerald-600 rounded px-2 py-1 text-[8px] font-bold flex justify-between items-center shadow">
                    <span className="truncate">Medical Kits (Priority)</span>
                    <span className="font-mono text-emerald-200 shrink-0 ml-1">200kg</span>
                  </div>
                  <div className="bg-slate-700 text-slate-200 border border-slate-600 rounded px-2 py-1 text-[8px] font-bold flex justify-between items-center shadow">
                    <span className="truncate">Water Rations</span>
                    <span className="font-mono text-slate-300 shrink-0 ml-1">450kg</span>
                  </div>
                </div>
              </div>

              {/* Current Score vs Best Max Score */}
              <div className="text-[8px] flex justify-between text-slate-400 pt-1.5 border-t border-slate-850">
                <div>Current Score: <span className="text-sky-400 font-bold text-[9px]">185</span></div>
                <div>Best Max Score: <span className="text-emerald-400 font-bold text-[9px]">185</span></div>
              </div>
            </div>

            {/* Right Box: Algorithm Execution Log + Allocation Decision Analyzer */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-2 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span>
                  <span className="text-[8px] font-bold text-slate-200 uppercase tracking-wider">Algorithm Execution Log</span>
                </div>
                <button className={`text-[7.5px] font-bold px-1.5 py-0.5 rounded border transition-all relative z-50 ${activeSubStep === 5 ? 'bg-sky-500 text-slate-950 border-sky-300 ring-2 ring-sky-300 scale-105' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                  Copy Logs
                  {activeSubStep === 5 && (
                    <div className="absolute top-1/2 right-full mr-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl -translate-y-1/2">
                      <span className="text-[8.5px] bg-sky-950 text-sky-200 px-2 py-0.5 rounded border border-sky-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                        6. Copy Search Logs
                      </span>
                      <MousePointer className="w-4 h-4 text-sky-300 fill-sky-400/50 drop-shadow-[0_0_8px_rgba(56,189,248,1)] translate-x-1/2 shrink-0" />
                    </div>
                  )}
                </button>
              </div>

              {/* Execution Log Trace Lines */}
              <div className="bg-slate-900/50 rounded p-1.5 my-1 flex-1 text-[7.5px] font-mono space-y-1 overflow-hidden">
                <div className="text-sky-400 font-bold">[1] Exploring choice: Medical Kits</div>
                <div className="text-emerald-400 font-bold">[2] Node Upper Bound: 185</div>
                <div className="text-slate-400 text-[7px] border-t border-slate-850 pt-0.5">Optimization complete.</div>
              </div>

              {/* Allocation Decision Analyzer Box */}
              <div className="bg-slate-900 border border-slate-800 rounded p-1.5 text-[7.5px] text-slate-300 space-y-0.5">
                <h4 className="text-[7.5px] uppercase font-bold tracking-wider text-sky-400 flex items-center gap-1">
                  <Info className="w-2.5 h-2.5 text-sky-400" />
                  Allocation decision analyzer
                </h4>
                <p className="text-[7px] text-slate-400 leading-tight font-mono">
                  Click any step above to inspect evaluation metrics.
                </p>
              </div>
            </div>

          </div>

          {/* 3. Bottom Control Deck Bar (Simulation / Instant Toggle + Start Simulation Button) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center justify-between gap-2 shrink-0 text-[8px] relative z-20">
            {/* Simulation / Instant Mode Toggle */}
            <div className={`flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 shrink-0 relative ${activeSubStep === 3 ? 'z-50' : 'z-10'}`}>
              <span className={`px-2 py-1 text-[7.5px] font-mono font-bold rounded transition-all relative ${activeSubStep === 3 ? 'bg-amber-500/30 text-amber-300 border border-amber-500/60 ring-2 ring-amber-400 scale-105' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                🎬 Simulation
                {activeSubStep === 3 && (
                  <div className="absolute bottom-full left-0 mb-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                    <MousePointer className="w-4 h-4 text-amber-300 fill-amber-400/50 drop-shadow-[0_0_8px_rgba(251,191,36,1)] translate-x-1 translate-y-1 shrink-0" />
                    <span className="text-[8.5px] bg-amber-950 text-amber-200 px-2 py-0.5 rounded border border-amber-500/80 font-bold shadow-2xl whitespace-nowrap ml-1">
                      4. Toggle Execution Mode
                    </span>
                  </div>
                )}
              </span>
              <span className="px-2 py-1 text-[7.5px] font-mono text-slate-400">
                ⚡ Instant
              </span>
            </div>

            {/* Start Simulation Button */}
            <button className={`flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-600 to-teal-600 text-slate-100 font-bold py-1.5 px-3 rounded-lg text-[8.5px] transition-all relative ${activeSubStep === 4 ? 'ring-2 ring-white scale-102 shadow-[0_0_12px_rgba(56,189,248,0.9)] z-50' : 'z-10'}`}>
              <Play className="w-2.5 h-2.5 fill-slate-100" />
              <span>Start Simulation</span>
              {activeSubStep === 4 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                  <MousePointer className="w-4 h-4 text-sky-300 fill-sky-400/50 drop-shadow-[0_0_8px_rgba(56,189,248,1)] translate-y-1 shrink-0" />
                  <span className="text-[8.5px] bg-sky-950 text-sky-200 px-2 py-0.5 rounded border border-sky-500/80 font-bold shadow-2xl whitespace-nowrap ml-1">
                    5. Click Start Simulation
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Module 3: Road Network Analysis",
      badge: "Tab 4: Connectivity",
      icon: Link,
      iconColor: "text-cyan-400",
      content: (
        <div className="space-y-3 text-slate-300 text-xs leading-relaxed">
          <p>
            <strong className="text-cyan-400 font-bold">Module 3</strong> checks for cut-off camps and calculates the minimum cost road network clearance path using Kruskal's & Prim's Minimum Spanning Tree algorithms.
          </p>
          <ul className="list-disc pl-4 list-outside space-y-2 text-slate-400 text-[11px]">
            <li>Toggle algorithms between <strong className="text-cyan-300">Kruskal's MST</strong> vs <strong className="text-emerald-300">Prim's Algorithm</strong>.</li>
            <li>Click the <strong className="text-amber-400">Info (ℹ️) Guide</strong> to view topology rules.</li>
            <li>Click any road link directly on the map to <strong className="text-rose-400">block / unblock</strong> it.</li>
            <li>Toggle execution mode between <strong className="text-amber-300">🎬 Simulation</strong> vs <strong className="text-emerald-300">⚡ Instant</strong>.</li>
            <li>Click <strong>▶ Calculate MST Backbone</strong> to find minimal clearance paths.</li>
            <li>Click <strong>🔓 Unblock All</strong> to clear all road blocks.</li>
            <li>Click <strong className="text-sky-400">"Copy Logs"</strong> to export graph evaluation steps.</li>
          </ul>
        </div>
      ),
      wireframe: (
        <div className="relative w-full h-full bg-[#080C14] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between overflow-visible text-[10px] font-sans text-slate-100 select-none">
          {/* 1. Page Header (Title + Info Guide + Kruskal vs Prim Toggle) */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0 relative z-20">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
                <Link className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Module 3: Road Network Analysis</span>
                <span className={`p-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 inline-flex relative z-50 cursor-pointer ${activeSubStep === 1 ? 'ring-2 ring-amber-400 text-amber-400 scale-110' : ''}`}>
                  <Info className="w-3 h-3" />
                  {activeSubStep === 1 && (
                    <div className="absolute top-1/2 left-1/2 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                      <MousePointer className="w-4 h-4 text-amber-300 fill-amber-400/50 drop-shadow-[0_0_8px_rgba(251,191,36,1)] -translate-x-1/2 -translate-y-1/2 shrink-0" />
                      <span className="text-[9px] bg-amber-950 text-amber-200 px-2.5 py-1 rounded-md border border-amber-500/80 font-bold shadow-2xl whitespace-nowrap ml-1.5">
                        2. Click (ℹ️) Guide
                      </span>
                    </div>
                  )}
                </span>
              </div>
              <p className="text-[7.5px] text-slate-400 mt-0.5">
                Kruskal's & Prim's Minimum Spanning Tree (MST) algorithms for road clearance.
              </p>
            </div>

            {/* Top Right Toggle Buttons */}
            <div className="flex bg-slate-850 p-1 border border-slate-700 rounded-lg gap-1 text-[9px] shrink-0 relative z-10">
              <span className={`px-2.5 py-1 rounded font-bold transition-all relative ${activeSubStep === 0 ? 'bg-cyan-600 text-white shadow ring-2 ring-cyan-300' : 'bg-cyan-600 text-slate-100'}`}>
                Kruskal's MST
                {activeSubStep === 0 && (
                  <div className="absolute top-1/2 right-full mr-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl -translate-y-1/2">
                    <span className="text-[9px] bg-cyan-950 text-cyan-200 px-2.5 py-1 rounded-md border border-cyan-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                      1. Toggle Algorithm
                    </span>
                    <MousePointer className="w-4 h-4 text-cyan-300 fill-cyan-400/50 drop-shadow-[0_0_8px_rgba(34,211,238,1)] translate-x-1/2 shrink-0" />
                  </div>
                )}
              </span>
              <span className="text-slate-400 px-2 py-1">Prim's Algorithm</span>
            </div>
          </div>

          {/* 2. Main Content Grid (Left Network Map + Right Logic Logs) */}
          <div className="grid grid-cols-3 gap-2.5 my-2.5 flex-1 min-h-0 relative z-10">
            
            {/* Left Column: Network Topology Canvas */}
            <div className="col-span-2 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 relative flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-850 pb-1 z-10">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Network Topology Map</span>
                <span className="text-[8px] text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40 animate-pulse">
                  Isolated: 1 Camp
                </span>
              </div>

              {/* Interactive SVG Network Map */}
              <div className="w-full h-full flex items-center justify-center relative">
                <svg viewBox="0 0 340 150" className="w-full h-full overflow-visible">
                  {/* Clean Normal Edges */}
                  <line x1="45" y1="75" x2="100" y2="35" stroke="#334155" strokeWidth="2" />
                  <line x1="100" y1="35" x2="190" y2="45" stroke="#334155" strokeWidth="2" />
                  
                  {/* Green MST Backbone Edges */}
                  <line x1="45" y1="75" x2="100" y2="115" stroke="#10B981" strokeWidth="3" />
                  <line x1="100" y1="115" x2="200" y2="115" stroke="#10B981" strokeWidth="3" />
                  
                  {/* Red Dashed Blocked Edge (Junction A -> Camp A) */}
                  <line x1="190" y1="45" x2="285" y2="75" stroke="#EF4444" strokeWidth="2" strokeDasharray="4,4" className={activeSubStep === 2 ? "animate-pulse stroke-[3px]" : ""} />
                  <line x1="200" y1="115" x2="285" y2="75" stroke="#EF4444" strokeWidth="2" strokeDasharray="4,4" />

                  {/* Node 1: Colombo HQ */}
                  <g>
                    <circle cx="45" cy="75" r="10" fill="#10B981" stroke="#34D399" strokeWidth="2" />
                    <text x="45" y="78.5" fill="#fff" fontSize="6" textAnchor="middle" fontWeight="black">HQ</text>
                    <text x="45" y="94" fill="#34D399" fontSize="5.5" textAnchor="middle" fontWeight="bold">Colombo HQ</text>
                  </g>

                  {/* Junction B */}
                  <g>
                    <circle cx="100" cy="35" r="6.5" fill="#475569" stroke="#64748B" strokeWidth="1.5" />
                    <text x="100" y="37" fill="#F1F5F9" fontSize="5" textAnchor="middle">14</text>
                  </g>

                  {/* Junction C */}
                  <g>
                    <circle cx="100" cy="115" r="6.5" fill="#475569" stroke="#64748B" strokeWidth="1.5" />
                    <text x="100" y="117" fill="#F1F5F9" fontSize="5" textAnchor="middle">15</text>
                  </g>

                  {/* Junction A */}
                  <g>
                    <circle cx="190" cy="45" r="6.5" fill="#475569" stroke="#64748B" strokeWidth="1.5" />
                    <text x="190" y="47" fill="#F1F5F9" fontSize="5" textAnchor="middle">5</text>
                  </g>

                  {/* Junction E */}
                  <g>
                    <circle cx="200" cy="115" r="6.5" fill="#475569" stroke="#64748B" strokeWidth="1.5" />
                    <text x="200" y="117" fill="#F1F5F9" fontSize="5" textAnchor="middle">17</text>
                  </g>

                  {/* Node 2: Camp A (Isolated) */}
                  <g>
                    <circle cx="285" cy="75" r="10" fill="#991B1B" stroke="#F87171" strokeWidth="2" />
                    <text x="285" y="78.5" fill="#fff" fontSize="6" textAnchor="middle" fontWeight="black">2</text>
                    <text x="285" y="94" fill="#F87171" fontSize="5.5" textAnchor="middle" fontWeight="bold">Camp A</text>
                  </g>

                  {/* SVG Cursor Step 3: Toggle Road Block */}
                  {activeSubStep === 2 && (
                    <foreignObject x="237.5" y="60" width="160" height="40" className="overflow-visible pointer-events-none z-[100]">
                      <div className="flex items-center -translate-x-[1px] -translate-y-[1px] z-[100] scale-[0.65] origin-top-left">
                        <MousePointer className="w-4 h-4 text-rose-300 fill-rose-400/50 drop-shadow-[0_0_8px_rgba(244,63,94,1)] shrink-0" />
                        <span className="text-[9px] bg-rose-950 text-rose-200 px-2.5 py-1 rounded-md border border-rose-500/80 font-bold shadow-2xl whitespace-nowrap ml-1">
                          3. Click Road to Block
                        </span>
                      </div>
                    </foreignObject>
                  )}
                </svg>
              </div>
            </div>

            {/* Right Column: Kruskal Edge Trace + Graph Analyzer */}
            <div className="col-span-1 flex flex-col gap-2 min-h-0">
              {/* Execution Log Panel */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span className="text-[8.5px] font-bold text-slate-200 uppercase tracking-wider">MST Trace Logs</span>
                  </div>
                  <button className={`text-[8px] font-bold px-2 py-0.5 rounded border transition-all relative z-50 ${activeSubStep === 6 ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-2 ring-cyan-300 scale-105' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    Copy Logs
                    {activeSubStep === 6 && (
                      <div className="absolute top-1/2 right-full mr-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl -translate-y-1/2">
                        <span className="text-[8.5px] bg-cyan-950 text-cyan-200 px-2 py-0.5 rounded border border-cyan-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                          7. Copy Search Logs
                        </span>
                        <MousePointer className="w-4 h-4 text-cyan-300 fill-cyan-400/50 drop-shadow-[0_0_8px_rgba(34,211,238,1)] translate-x-1/2 shrink-0" />
                      </div>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900/80 border border-slate-850 rounded-lg p-2 flex-1 my-1.5 text-[8px] font-mono space-y-1 overflow-hidden leading-snug">
                  <div className="text-emerald-400 font-bold">[1] Added edge: HQ - 15 (12.4 Km)</div>
                  <div className="text-emerald-400 font-bold">[2] Added edge: 15 - 17 (18.1 Km)</div>
                  <div className="text-rose-400 font-bold">[3] Road 5-2 blocked: Skipped</div>
                </div>
              </div>

              {/* Network Graph Decision Analyzer */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 text-[8px] text-slate-300 space-y-1 shrink-0">
                <span className="text-cyan-400 font-extrabold uppercase tracking-wider flex items-center gap-1 text-[8.5px]">
                  <Info className="w-3 h-3 text-cyan-400" /> Graph Decision Analyzer
                </span>
                <p className="text-[7.5px] text-slate-400 leading-tight">
                  Click log entries above to inspect evaluation metrics.
                </p>
              </div>
            </div>

          </div>

          {/* 3. Bottom Control Deck Bar (Simulation/Instant Toggle + Calculate MST + Unblock All) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center justify-between gap-2 shrink-0 text-[8px] relative z-20">
            {/* Simulation / Instant Mode Toggle */}
            <div className={`flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 shrink-0 relative ${activeSubStep === 3 ? 'z-50' : 'z-10'}`}>
              <span className={`px-2 py-1 text-[7.5px] font-mono font-bold rounded transition-all relative ${activeSubStep === 3 ? 'bg-amber-500/30 text-amber-300 border border-amber-500/60 ring-2 ring-amber-400 scale-105' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                🎬 Simulation
                {activeSubStep === 3 && (
                  <div className="absolute bottom-full left-0 mb-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                    <MousePointer className="w-4 h-4 text-amber-300 fill-amber-400/50 drop-shadow-[0_0_8px_rgba(251,191,36,1)] translate-x-1 translate-y-1 shrink-0" />
                    <span className="text-[8.5px] bg-amber-950 text-amber-200 px-2 py-0.5 rounded border border-amber-500/80 font-bold shadow-2xl whitespace-nowrap ml-1">
                      4. Toggle Execution Mode
                    </span>
                  </div>
                )}
              </span>
              <span className="px-2 py-1 text-[7.5px] font-mono text-slate-400">
                ⚡ Instant
              </span>
            </div>

            {/* Calculate MST Button */}
            <button className={`flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-600 to-teal-600 text-slate-100 font-bold py-1.5 px-3 rounded-lg text-[8.5px] transition-all relative ${activeSubStep === 4 ? 'ring-2 ring-white scale-102 shadow-[0_0_12px_rgba(56,189,248,0.9)] z-50' : 'z-10'}`}>
              <Play className="w-2.5 h-2.5 fill-slate-100" />
              <span>Calculate MST Backbone</span>
              {activeSubStep === 4 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                  <MousePointer className="w-4 h-4 text-sky-300 fill-sky-400/50 drop-shadow-[0_0_8px_rgba(56,189,248,1)] translate-y-1 shrink-0" />
                  <span className="text-[8.5px] bg-sky-950 text-sky-200 px-2 py-0.5 rounded border border-sky-500/80 font-bold shadow-2xl whitespace-nowrap ml-1">
                    5. Click Calculate MST
                  </span>
                </div>
              )}
            </button>

            {/* Unblock All Button */}
            <button className={`bg-slate-800 text-amber-300 border border-slate-700 px-2 py-1 rounded text-[8px] font-bold flex items-center gap-1 shrink-0 transition-all relative ${activeSubStep === 5 ? 'ring-2 ring-amber-400 scale-105 z-50' : 'z-10'}`}>
              <span>🔓</span> <span>Unblock All</span>
              {activeSubStep === 5 && (
                <div className="absolute bottom-full right-0 mb-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                  <span className="text-[8.5px] bg-amber-950 text-amber-200 px-2 py-0.5 rounded border border-amber-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                    6. Unblock All
                  </span>
                  <MousePointer className="w-4 h-4 text-amber-300 fill-amber-400/50 drop-shadow-[0_0_8px_rgba(251,191,36,1)] translate-x-1 translate-y-1 shrink-0" />
                </div>
              )}
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Module 4: Rescue Call Prioritization",
      badge: "Tab 5: SOS Decision",
      icon: Award,
      iconColor: "text-purple-400",
      content: (
        <div className="space-y-3 text-slate-300 text-xs leading-relaxed">
          <p>
            <strong className="text-purple-400 font-bold">Module 4</strong> ranks incoming emergency SOS calls so rescue teams dispatch help to the most critical camps first using Multi-Criteria Decision Analysis.
          </p>
          <ul className="list-disc pl-4 list-outside space-y-2 text-slate-400 text-[11px]">
            <li>Toggle algorithms between <strong className="text-purple-300">Branch & Bound</strong> vs <strong className="text-sky-300">Weighted Heuristic</strong>.</li>
            <li>Click the <strong className="text-amber-400">Info (ℹ️) Guide</strong> to view prioritization rules.</li>
            <li>Switch sub-tabs between <strong className="text-sky-400 font-bold">Decision Control</strong>, <strong className="text-purple-400">Workflow Pipelines</strong>, and <strong className="text-emerald-400">Benchmark</strong>.</li>
            <li>Adjust criteria weights (<strong>Priority</strong>, <strong>Severity</strong>, <strong>Deadline Urgency</strong>).</li>
            <li>Click <strong>Analyze & Assemble Batch</strong> to rank pending SOS calls.</li>
            <li>Click <strong className="text-sky-400">"Copy Logs"</strong> to export decision metrics.</li>
          </ul>
        </div>
      ),
      wireframe: (
        <div className="relative w-full h-full bg-[#080C14] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between overflow-visible text-[10px] font-sans text-slate-100 select-none">
          {/* 1. Header (Title + Info Guide + Branch & Bound vs Weighted Heuristic) */}
          <div className="flex flex-col border-b border-slate-800 pb-2 shrink-0 gap-2 relative z-20">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
                  <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Module 4: Intelligent Decision</span>
                  <span className="inline-flex items-center gap-1 text-[7.5px] px-1.5 py-0.5 rounded-full font-mono border bg-emerald-950/40 text-emerald-400 border-emerald-500/30">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span>
                    API Connected
                  </span>
                  <span className={`p-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 inline-flex relative z-50 cursor-pointer ${activeSubStep === 1 ? 'ring-2 ring-amber-400 text-amber-400 scale-110' : ''}`}>
                    <Info className="w-2.5 h-2.5" />
                    {activeSubStep === 1 && (
                      <div className="absolute top-1/2 left-1/2 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                        <MousePointer className="w-4 h-4 text-amber-300 fill-amber-400/50 drop-shadow-[0_0_8px_rgba(251,191,36,1)] -translate-x-1/2 -translate-y-1/2 shrink-0" />
                        <span className="text-[8.5px] bg-amber-950 text-amber-200 px-2 py-0.5 rounded border border-amber-500/80 font-bold shadow-2xl whitespace-nowrap ml-1.5">
                          2. Click (ℹ️) Guide
                        </span>
                      </div>
                    )}
                  </span>
                </div>
              </div>

              {/* Top Right Toggle Buttons */}
              <div className="flex bg-slate-850 p-0.5 border border-slate-700 rounded-lg gap-0.5 text-[8px] shrink-0 relative z-10">
                <span className={`px-2 py-1 rounded font-bold transition-all relative ${activeSubStep === 0 ? 'bg-sky-600 text-white shadow ring-2 ring-sky-300' : 'bg-sky-600 text-slate-100'}`}>
                  Branch & Bound
                  {activeSubStep === 0 && (
                    <div className="absolute top-1/2 right-full mr-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl -translate-y-1/2">
                      <span className="text-[8.5px] bg-cyan-950 text-cyan-200 px-2 py-0.5 rounded border border-cyan-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                        1. Toggle Algorithm
                      </span>
                      <MousePointer className="w-4 h-4 text-cyan-300 fill-cyan-400/50 drop-shadow-[0_0_8px_rgba(34,211,238,1)] translate-x-1/2 shrink-0" />
                    </div>
                  )}
                </span>
                <span className="text-slate-400 px-1.5 py-1">Weighted Heuristic</span>
              </div>
            </div>

            {/* Sub-Tabs Bar */}
            <div className="flex gap-1 text-[8px] relative z-10">
              <span className={`px-2 py-0.5 rounded font-bold border transition-all relative ${activeSubStep === 2 ? 'bg-slate-800 text-sky-400 border-slate-700 ring-2 ring-sky-300 scale-105 z-50' : 'bg-slate-800 text-sky-400 border-slate-700'}`}>
                Decision Control
                {activeSubStep === 2 && (
                  <div className="absolute top-full left-0 mt-1 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                    <MousePointer className="w-4 h-4 text-sky-300 fill-sky-400/50 drop-shadow-[0_0_8px_rgba(56,189,248,1)] translate-x-1 translate-y-1 shrink-0" />
                    <span className="text-[8.5px] bg-sky-950 text-sky-200 px-2 py-0.5 rounded border border-sky-500/80 font-bold shadow-2xl whitespace-nowrap ml-1">
                      3. Sub-Tab Navigation
                    </span>
                  </div>
                )}
              </span>
              <span className="text-slate-400 px-2 py-0.5">Workflow Pipelines</span>
              <span className="text-slate-400 px-2 py-0.5">Performance Benchmark</span>
            </div>
          </div>

          {/* 2. Main Content Grid (Left Criteria Sliders + Right Scored Camps List) */}
          <div className="grid grid-cols-3 gap-2 my-2 flex-1 min-h-0 relative z-10">
            
            {/* Left Box: Criteria Weights Configuration Sliders */}
            <div className="col-span-1 bg-slate-950 border border-slate-850 rounded-xl p-2 flex flex-col justify-between overflow-hidden">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Criteria Weights</span>
              
              <div className="space-y-2 my-1 text-[7.5px]">
                {/* Priority Weight Slider */}
                <div>
                  <div className="flex justify-between text-slate-300 font-bold">
                    <span>Priority Weight</span>
                    <span className="text-sky-400 font-mono">40%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full border border-slate-800 overflow-hidden mt-0.5">
                    <div className="bg-sky-400 h-full w-[40%]"></div>
                  </div>
                </div>

                {/* Severity Weight Slider */}
                <div className="relative">
                  <div className="flex justify-between text-slate-300 font-bold">
                    <span>Severity / Impact</span>
                    <span className="text-sky-400 font-mono">40%</span>
                  </div>
                  <div className={`w-full bg-slate-900 h-1.5 rounded-full border border-slate-800 overflow-hidden mt-0.5 relative ${activeSubStep === 3 ? 'ring-2 ring-purple-400' : ''}`}>
                    <div className="bg-sky-400 h-full w-[40%]"></div>
                  </div>
                  {activeSubStep === 3 && (
                    <div className="absolute top-1/2 left-1/2 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                      <MousePointer className="w-4 h-4 text-purple-300 fill-purple-400/50 drop-shadow-[0_0_8px_rgba(192,132,252,1)] -translate-x-1/2 -translate-y-1/2 shrink-0" />
                      <span className="text-[8.5px] bg-purple-950 text-purple-200 px-2 py-0.5 rounded border border-purple-500/80 font-bold shadow-2xl whitespace-nowrap ml-1.5">
                        4. Adjust Criteria Weight
                      </span>
                    </div>
                  )}
                </div>

                {/* Deadline Urgency Slider */}
                <div>
                  <div className="flex justify-between text-slate-300 font-bold">
                    <span>Deadline Urgency</span>
                    <span className="text-sky-400 font-mono">20%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full border border-slate-800 overflow-hidden mt-0.5">
                    <div className="bg-sky-400 h-full w-[20%]"></div>
                  </div>
                </div>
              </div>

              {/* Analyze & Assemble Batch Button */}
              <button className={`w-full bg-sky-600 text-slate-100 font-bold py-1.5 rounded-lg text-[8px] transition-all relative ${activeSubStep === 4 ? 'ring-2 ring-white scale-102 shadow-[0_0_12px_rgba(56,189,248,0.9)] z-50' : 'z-10'}`}>
                Analyze & Assemble Batch
                {activeSubStep === 4 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                    <MousePointer className="w-4 h-4 text-sky-300 fill-sky-400/50 drop-shadow-[0_0_8px_rgba(56,189,248,1)] translate-y-1 shrink-0" />
                    <span className="text-[8.5px] bg-sky-950 text-sky-200 px-2 py-0.5 rounded border border-sky-500/80 font-bold shadow-2xl whitespace-nowrap ml-1">
                      5. Click Analyze & Assemble
                    </span>
                  </div>
                )}
              </button>
            </div>

            {/* Right Box: Scored SOS Camps List + Logs */}
            <div className="col-span-2 bg-slate-950 border border-slate-850 rounded-xl p-2 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Scored Camps SOS</span>
                <button className={`text-[7.5px] font-bold px-1.5 py-0.5 rounded border transition-all relative z-50 ${activeSubStep === 5 ? 'bg-sky-500 text-slate-950 border-sky-300 ring-2 ring-sky-300 scale-105' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                  Copy Logs
                  {activeSubStep === 5 && (
                    <div className="absolute top-1/2 right-full mr-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl -translate-y-1/2">
                      <span className="text-[8.5px] bg-sky-950 text-sky-200 px-2 py-0.5 rounded border border-sky-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                        6. Copy Search Logs
                      </span>
                      <MousePointer className="w-4 h-4 text-sky-300 fill-sky-400/50 drop-shadow-[0_0_8px_rgba(56,189,248,1)] translate-x-1/2 shrink-0" />
                    </div>
                  )}
                </button>
              </div>

              {/* Scored Camps Cards */}
              <div className="space-y-1.5 my-1.5 flex-1 overflow-hidden">
                <div className="bg-emerald-950/60 border border-emerald-500 p-1.5 rounded-lg flex items-center justify-between text-[8px]">
                  <div>
                    <span className="font-bold text-slate-100 block">SOS Camp Gamma</span>
                    <span className="text-slate-400 text-[7px]">Size: 3t • Severity: 5.0 • Score: <strong className="text-sky-400">92</strong></span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[7.5px] font-bold">
                    Approved
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-lg flex items-center justify-between text-[8px]">
                  <div>
                    <span className="font-bold text-slate-200 block">SOS Camp Alpha</span>
                    <span className="text-slate-400 text-[7px]">Size: 4t • Severity: 4.5 • Score: <strong className="text-sky-400">84</strong></span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-750 rounded text-[7.5px] font-bold">
                    Pending
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )
    },
    {
      title: "Module 5: Supply Delivery Tour",
      badge: "Tab 6: Route Sequencing",
      icon: Eye,
      iconColor: "text-emerald-400",
      content: (
        <div className="space-y-3 text-slate-300 text-xs leading-relaxed">
          <p>
            <strong className="text-emerald-400 font-bold">Module 5</strong> untangles supply delivery routes using Travelling Salesperson Problem (TSP) optimization so rescue helicopters visit all camps and return to HQ in one continuous tour.
          </p>
          <ul className="list-disc pl-4 list-outside space-y-2 text-slate-400 text-[11px]">
            <li>Select algorithms between <strong className="text-sky-300">2-opt Heuristic</strong>, <strong className="text-amber-300">Held-Karp (Exact DP)</strong>, vs <strong className="text-amber-400">Compare Mode</strong>.</li>
            <li>Click the <strong className="text-amber-400">Info (ℹ️) Guide</strong> to view TSP rules.</li>
            <li>Toggle execution mode between <strong className="text-amber-300">🎬 Simulation</strong> vs <strong className="text-emerald-300">⚡ Instant</strong>.</li>
            <li>Click <strong>▶ Calculate Optimal Tour</strong> to watch lines untangle!</li>
            <li>Click <strong>🔀 Shuffle</strong> to scramble delivery order.</li>
            <li>Click <strong className="text-sky-400">"Copy Logs"</strong> to export tour evaluation steps.</li>
          </ul>
        </div>
      ),
      wireframe: (
        <div className="relative w-full h-full bg-[#080C14] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between overflow-visible text-[10px] font-sans text-slate-100 select-none">
          {/* 1. Page Header (Title + Info Guide + 2-opt vs Held-Karp vs Compare Mode) */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0 relative z-20">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
                <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                <span>Module 5: Route Sequencing (TSP)</span>
                <span className={`p-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 inline-flex relative z-50 cursor-pointer ${activeSubStep === 1 ? 'ring-2 ring-amber-400 text-amber-400 scale-110' : ''}`}>
                  <Info className="w-2.5 h-2.5" />
                  {activeSubStep === 1 && (
                    <div className="absolute top-1/2 left-1/2 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                      <MousePointer className="w-4 h-4 text-amber-300 fill-amber-400/50 drop-shadow-[0_0_8px_rgba(251,191,36,1)] -translate-x-1/2 -translate-y-1/2 shrink-0" />
                      <span className="text-[8.5px] bg-amber-950 text-amber-200 px-2 py-0.5 rounded border border-amber-500/80 font-bold shadow-2xl whitespace-nowrap ml-1.5">
                        2. Click (ℹ️) Guide
                      </span>
                    </div>
                  )}
                </span>
              </div>
              <p className="text-[7.5px] text-slate-400 mt-0.5">
                Solve exact Traveling Salesman Problem (TSP) with 12 locations. Held-Karp DP vs 2-opt Heuristic.
              </p>
            </div>

            {/* Top Right Toggle Buttons */}
            <div className="flex bg-slate-850 p-0.5 border border-slate-700 rounded-lg gap-0.5 text-[8px] shrink-0 relative z-10">
              <span className={`px-2 py-1 rounded font-bold transition-all relative ${activeSubStep === 0 ? 'bg-sky-600 text-white shadow ring-2 ring-sky-300' : 'bg-sky-600 text-slate-100'}`}>
                2-opt Heuristic
                {activeSubStep === 0 && (
                  <div className="absolute top-1/2 right-full mr-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl -translate-y-1/2">
                    <span className="text-[8.5px] bg-cyan-950 text-cyan-200 px-2 py-0.5 rounded border border-cyan-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                      1. Toggle Algorithm
                    </span>
                    <MousePointer className="w-4 h-4 text-cyan-300 fill-cyan-400/50 drop-shadow-[0_0_8px_rgba(34,211,238,1)] translate-x-1/2 shrink-0" />
                  </div>
                )}
              </span>
              <span className="text-slate-400 px-1.5 py-1">Held-Karp (Exact DP)</span>
              <span className="text-amber-400 px-1.5 py-1 font-bold">Compare Mode</span>
            </div>
          </div>

          {/* 2. Main Content Grid (Left TSP Untangling Canvas + Right Trace Logs) */}
          <div className="grid grid-cols-3 gap-2.5 my-2.5 flex-1 min-h-0 relative z-10">
            
            {/* Left Column: Rescue Convoy Route Canvas */}
            <div className="col-span-2 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 relative flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-850 pb-1 z-10">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Rescue Convoy Route (12 Camps)</span>
                <span className="text-[8px] text-slate-400 font-mono">
                  Iterative Edge Uncrossing
                </span>
              </div>

              {/* Interactive SVG TSP Tour Loop */}
              <div className="w-full h-full flex items-center justify-center relative">
                <svg viewBox="0 0 340 150" className="w-full h-full overflow-visible">
                  {/* Clean Untangled Outer Loop Path */}
                  <polygon points="45,75 100,35 190,45 285,75 200,115 100,115" fill="none" stroke="#06B6D4" strokeWidth="2.5" />

                  {/* Node 1: HQ Depot */}
                  <g>
                    <circle cx="45" cy="75" r="9" fill="#10B981" stroke="#34D399" strokeWidth="2" />
                    <text x="45" y="78" fill="#fff" fontSize="5.5" textAnchor="middle" fontWeight="black">HQ</text>
                  </g>

                  {/* Camp Alpha */}
                  <g>
                    <circle cx="100" cy="35" r="6" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
                    <text x="100" y="37" fill="#F1F5F9" fontSize="4.5" textAnchor="middle">Alpha</text>
                  </g>

                  {/* Camp Beta */}
                  <g>
                    <circle cx="190" cy="45" r="6" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
                    <text x="190" y="47" fill="#F1F5F9" fontSize="4.5" textAnchor="middle">Beta</text>
                  </g>

                  {/* Camp Gamma */}
                  <g>
                    <circle cx="285" cy="75" r="6" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
                    <text x="285" y="77" fill="#F1F5F9" fontSize="4.5" textAnchor="middle">Gamma</text>
                  </g>

                  {/* Camp Delta */}
                  <g>
                    <circle cx="200" cy="115" r="6" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
                    <text x="200" y="117" fill="#F1F5F9" fontSize="4.5" textAnchor="middle">Delta</text>
                  </g>

                  {/* Camp Epsilon */}
                  <g>
                    <circle cx="100" cy="115" r="6" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
                    <text x="100" y="117" fill="#F1F5F9" fontSize="4.5" textAnchor="middle">Epsilon</text>
                  </g>
                </svg>
              </div>

              {/* Bottom Metric Bar */}
              <div className="flex justify-between items-center text-[8px] text-slate-400 pt-1 border-t border-slate-850 z-10">
                <div>Sequencing cost: <span className="text-emerald-400 font-bold font-mono">2088 px</span></div>
                <div className="font-mono text-slate-500 text-[7.5px]">2-Opt Local Minimum</div>
              </div>
            </div>

            {/* Right Column: TSP Execution Trace + Decision Analyzer */}
            <div className="col-span-1 flex flex-col gap-2 min-h-0">
              {/* Execution Log Panel */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                    <span className="text-[8.5px] font-bold text-slate-200 uppercase tracking-wider">TSP Execution Trace</span>
                  </div>
                  <button className={`text-[8px] font-bold px-2 py-0.5 rounded border transition-all relative z-50 ${activeSubStep === 5 ? 'bg-sky-500 text-slate-950 border-sky-300 ring-2 ring-sky-300 scale-105' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    Copy Logs
                    {activeSubStep === 5 && (
                      <div className="absolute top-1/2 right-full mr-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl -translate-y-1/2">
                        <span className="text-[8.5px] bg-sky-950 text-sky-200 px-2 py-0.5 rounded border border-sky-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                          6. Copy Search Logs
                        </span>
                        <MousePointer className="w-4 h-4 text-sky-300 fill-sky-400/50 drop-shadow-[0_0_8px_rgba(56,189,248,1)] translate-x-1/2 shrink-0" />
                      </div>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900/80 border border-slate-850 rounded-lg p-2 flex-1 my-1.5 text-[8px] font-mono space-y-1 overflow-hidden leading-snug">
                  <div className="text-sky-400 font-bold">[1] Initial tour cost: 3450 px</div>
                  <div className="text-emerald-400 font-bold">[2] 2-Opt swap: Alpha-Beta (3100 px)</div>
                  <div className="text-slate-400 text-[7.5px] border-t border-slate-800 pt-0.5">Optimal tour resolved.</div>
                </div>
              </div>

              {/* Sequencing Decision Analyzer Box */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 text-[8px] text-slate-300 space-y-1 shrink-0">
                <span className="text-sky-400 font-extrabold uppercase tracking-wider flex items-center gap-1 text-[8.5px]">
                  <Info className="w-3 h-3 text-sky-400" /> Sequencing decision analyzer
                </span>
                <p className="text-[7.5px] text-slate-400 leading-tight font-mono">
                  Click any step above to inspect evaluation metrics.
                </p>
              </div>
            </div>

          </div>

          {/* 3. Bottom Control Deck Bar (Simulation/Instant Toggle + Calculate Optimal Tour + Shuffle) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center justify-between gap-2 shrink-0 text-[8px] relative z-20">
            {/* Simulation / Instant Mode Toggle */}
            <div className={`flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 shrink-0 relative ${activeSubStep === 2 ? 'z-50' : 'z-10'}`}>
              <span className={`px-2 py-1 text-[7.5px] font-mono font-bold rounded transition-all relative ${activeSubStep === 2 ? 'bg-amber-500/30 text-amber-300 border border-amber-500/60 ring-2 ring-amber-400 scale-105' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                🎬 Simulation
                {activeSubStep === 2 && (
                  <div className="absolute bottom-full left-0 mb-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                    <MousePointer className="w-4 h-4 text-amber-300 fill-amber-400/50 drop-shadow-[0_0_8px_rgba(251,191,36,1)] translate-x-1 translate-y-1 shrink-0" />
                    <span className="text-[8.5px] bg-amber-950 text-amber-200 px-2 py-0.5 rounded border border-amber-500/80 font-bold shadow-2xl whitespace-nowrap ml-1">
                      3. Toggle Execution Mode
                    </span>
                  </div>
                )}
              </span>
              <span className="px-2 py-1 text-[7.5px] font-mono text-slate-400">
                ⚡ Instant
              </span>
            </div>

            {/* Calculate Optimal Tour Button */}
            <button className={`flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-600 to-teal-600 text-slate-100 font-bold py-1.5 px-3 rounded-lg text-[8.5px] transition-all relative ${activeSubStep === 3 ? 'ring-2 ring-white scale-102 shadow-[0_0_12px_rgba(56,189,248,0.9)] z-50' : 'z-10'}`}>
              <Play className="w-2.5 h-2.5 fill-slate-100" />
              <span>Calculate Optimal Tour</span>
              {activeSubStep === 3 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                  <MousePointer className="w-4 h-4 text-sky-300 fill-sky-400/50 drop-shadow-[0_0_8px_rgba(56,189,248,1)] translate-y-1 shrink-0" />
                  <span className="text-[8.5px] bg-sky-950 text-sky-200 px-2 py-0.5 rounded border border-sky-500/80 font-bold shadow-2xl whitespace-nowrap ml-1">
                    4. Click Calculate Tour
                  </span>
                </div>
              )}
            </button>

            {/* Shuffle Button */}
            <button className={`bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded text-[8px] font-bold flex items-center gap-1 shrink-0 transition-all relative ${activeSubStep === 4 ? 'ring-2 ring-emerald-400 scale-105 z-50' : 'z-10'}`}>
              <Shuffle className="w-2.5 h-2.5" />
              <span>Shuffle</span>
              {activeSubStep === 4 && (
                <div className="absolute bottom-full right-0 mb-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                  <span className="text-[8.5px] bg-emerald-950 text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                    5. Shuffle Route
                  </span>
                  <MousePointer className="w-4 h-4 text-emerald-300 fill-emerald-400/50 drop-shadow-[0_0_8px_rgba(52,211,153,1)] translate-x-1 translate-y-1 shrink-0" />
                </div>
              )}
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Data Management CRUD Portal",
      badge: "Database Portal",
      icon: Database,
      iconColor: "text-amber-400",
      content: (
        <div className="space-y-3 text-slate-300 text-xs leading-relaxed">
          <p>
            The <strong className="text-amber-400 font-bold">Data Management CRUD Portal</strong> allows database administrators to perform live REST entity operations across PostgreSQL database tables.
          </p>
          <ul className="list-disc pl-4 list-outside space-y-2 text-slate-400 text-[11px]">
            <li>Switch domain tabs (<strong>Camps & Nodes</strong>, <strong>Road Connections</strong>, <strong>Relief Cargo</strong>, <strong>Helicopter Fleet</strong>, <strong>Disaster Zones</strong>).</li>
            <li>Click <strong>+ Add New CAMP</strong> to create custom emergency entities.</li>
            <li>Use the search bar to filter records live by name or ID.</li>
            <li>Click <strong>Edit</strong> or <strong>Delete</strong> on any row record.</li>
            <li>Click <strong>Refresh</strong> to sync live with the backend REST API server.</li>
            <li>All database edits instantly update across all 5 algorithm modules!</li>
          </ul>
        </div>
      ),
      wireframe: (
        <div className="relative w-full h-full bg-[#080C14] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between overflow-visible text-[10px] font-sans text-slate-100 select-none">
          {/* 1. Top Bar Header */}
          <div className="flex items-center justify-between border-b border-slate-850 pb-2 shrink-0 relative z-20">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Database className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-100 flex items-center gap-1.5">
                  SDR-DSS DATA MANAGEMENT PORTAL
                  <span className="text-[7.5px] bg-sky-500/20 text-sky-400 font-mono px-1.5 py-0.2 rounded border border-sky-500/30">
                    CRUD MODULE
                  </span>
                </h3>
              </div>
            </div>

            {/* Top Right Action Buttons (Refresh + Return) */}
            <div className="flex items-center gap-1.5 shrink-0 relative z-10">
              <button className={`flex items-center gap-1 text-[8px] bg-slate-850 text-slate-300 font-semibold px-2 py-1 rounded-lg border border-slate-700 transition-all relative ${activeSubStep === 1 ? 'ring-2 ring-amber-400 scale-105 z-50' : 'z-10'}`}>
                <span>🔄 Refresh</span>
                {activeSubStep === 1 && (
                  <div className="absolute top-1/2 right-full mr-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl -translate-y-1/2">
                    <span className="text-[8.5px] bg-amber-950 text-amber-200 px-2 py-0.5 rounded border border-amber-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                      2. Refresh Records
                    </span>
                    <MousePointer className="w-4 h-4 text-amber-300 fill-amber-400/50 drop-shadow-[0_0_8px_rgba(251,191,36,1)] translate-x-1/2 shrink-0" />
                  </div>
                )}
              </button>
              <span className="text-[8px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700 font-semibold">
                Return to App
              </span>
            </div>
          </div>

          {/* 2. Category Selector Tabs Bar */}
          <div className="bg-[#0D121F] border border-slate-850 rounded-lg p-1 my-1.5 flex items-center gap-1 overflow-visible shrink-0 relative z-20 text-[8px]">
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-all border relative ${activeSubStep === 0 ? 'bg-sky-600/20 text-sky-300 border-sky-500/50 ring-2 ring-sky-300 scale-105 z-50' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>
              <MapPin className="w-2.5 h-2.5 text-sky-400" />
              <span>Camps & Nodes</span>
              <span className="text-[7px] bg-slate-950 font-mono text-slate-300 px-1 py-0.2 rounded border border-slate-800">12</span>
              {activeSubStep === 0 && (
                <div className="absolute top-1/2 left-1/2 z-[100] flex items-center pointer-events-none drop-shadow-2xl">
                  <MousePointer className="w-4 h-4 text-sky-300 fill-sky-400/50 drop-shadow-[0_0_8px_rgba(56,189,248,1)] -translate-x-1/2 -translate-y-1/2 shrink-0" />
                  <span className="text-[8.5px] bg-sky-950 text-sky-200 px-2 py-0.5 rounded border border-sky-500/80 font-bold shadow-2xl whitespace-nowrap ml-1.5">
                    1. Select Domain Category Tab
                  </span>
                </div>
              )}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 text-slate-400">Road Connections</span>
            <span className="flex items-center gap-1 px-2 py-1 text-slate-400">Relief Cargo</span>
            <span className="flex items-center gap-1 px-2 py-1 text-slate-400">Helicopter Fleet</span>
          </div>

          {/* 3. Search Bar + Primary Add Action Header */}
          <div className="flex items-center justify-between gap-2 shrink-0 my-1 relative z-10">
            <div className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 flex-1 text-[8px] text-slate-400 flex items-center justify-between">
              <span>Search camps & nodes by name or ID...</span>
              <Search className="w-3 h-3 text-slate-500" />
            </div>

            {/* Add New Record Button */}
            <button className={`flex items-center gap-1 bg-emerald-600 text-slate-100 font-extrabold px-2.5 py-1 rounded-lg text-[8px] transition-all relative ${activeSubStep === 2 ? 'ring-2 ring-white scale-105 z-50' : 'z-10'}`}>
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>Add New CAMP</span>
              {activeSubStep === 2 && (
                <div className="absolute top-1/2 right-full mr-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl -translate-y-1/2">
                  <span className="text-[8.5px] bg-emerald-950 text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                    3. Click + Add New Entity
                  </span>
                  <MousePointer className="w-4 h-4 text-emerald-300 fill-emerald-400/50 drop-shadow-[0_0_8px_rgba(52,211,153,1)] translate-x-1/2 shrink-0" />
                </div>
              )}
            </button>
          </div>

          {/* 4. Datagrid Table */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-2 my-1 flex-1 flex flex-col justify-between overflow-hidden relative z-10">
            {/* Table Header */}
            <div className="grid grid-cols-5 text-[7.5px] font-bold text-slate-400 border-b border-slate-800 pb-1 uppercase tracking-wider">
              <span>ID</span>
              <span>CAMP NAME</span>
              <span>NODE TYPE</span>
              <span>COORDINATES</span>
              <span className="text-right">ACTIONS</span>
            </div>

            {/* Records Rows */}
            <div className="space-y-1.5 my-1 flex-1 overflow-hidden text-[8px]">
              {/* Row 1: Colombo HQ */}
              <div className="bg-slate-900/50 border border-slate-850 p-1.5 rounded-lg grid grid-cols-5 items-center">
                <span className="font-mono text-sky-400 font-bold">#1</span>
                <span className="font-semibold text-slate-100 truncate">Colombo HQ</span>
                <div>
                  <span className="px-1.5 py-0.2 rounded text-[7px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    HQ
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[7px]">(100, 150)</span>
                <div className="flex justify-end gap-1 relative">
                  <span className={`px-1.5 py-0.5 bg-slate-800 text-sky-400 border border-slate-700 rounded text-[7px] font-bold transition-all relative ${activeSubStep === 3 ? 'ring-2 ring-sky-300 scale-105 z-50' : ''}`}>
                    Edit
                    {activeSubStep === 3 && (
                      <div className="absolute top-1/2 right-full mr-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl -translate-y-1/2">
                        <span className="text-[8.5px] bg-sky-950 text-sky-200 px-2 py-0.5 rounded border border-sky-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                          4. Edit Record
                        </span>
                        <MousePointer className="w-4 h-4 text-sky-300 fill-sky-400/50 drop-shadow-[0_0_8px_rgba(56,189,248,1)] translate-x-1/2 shrink-0" />
                      </div>
                    )}
                  </span>
                  <span className="px-1.5 py-0.5 bg-slate-800 text-rose-400 border border-slate-700 rounded text-[7px] font-bold">Del</span>
                </div>
              </div>

              {/* Row 2: Galle Rescue Camp */}
              <div className="bg-slate-900/50 border border-slate-850 p-1.5 rounded-lg grid grid-cols-5 items-center">
                <span className="font-mono text-sky-400 font-bold">#2</span>
                <span className="font-semibold text-slate-100 truncate">Galle Camp (A)</span>
                <div>
                  <span className="px-1.5 py-0.2 rounded text-[7px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800">
                    RESCUE
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[7px]">(630, 210)</span>
                <div className="flex justify-end gap-1 relative">
                  <span className="px-1.5 py-0.5 bg-slate-800 text-sky-400 border border-slate-700 rounded text-[7px] font-bold">Edit</span>
                  <span className={`px-1.5 py-0.5 bg-slate-800 text-rose-400 border border-slate-700 rounded text-[7px] font-bold transition-all relative ${activeSubStep === 4 ? 'ring-2 ring-rose-400 scale-105 z-50' : ''}`}>
                    Del
                    {activeSubStep === 4 && (
                      <div className="absolute top-1/2 right-full mr-1.5 z-[100] flex items-center pointer-events-none drop-shadow-2xl -translate-y-1/2">
                        <span className="text-[8.5px] bg-rose-950 text-rose-200 px-2 py-0.5 rounded border border-rose-500/80 font-bold shadow-2xl whitespace-nowrap mr-1">
                          5. Delete Record
                        </span>
                        <MousePointer className="w-4 h-4 text-rose-300 fill-rose-400/50 drop-shadow-[0_0_8px_rgba(244,63,94,1)] translate-x-1/2 shrink-0" />
                      </div>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "You're All Set!",
      badge: "Ready to Explore",
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      content: (
        <div className="space-y-3 text-slate-300 text-xs leading-relaxed text-center py-4">
          <div className="inline-flex p-4 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 mb-1">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <p className="font-bold text-slate-100 text-base">
            You're ready to use the Smart Disaster Relief Platform!
          </p>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            You can re-open this tutorial anytime by clicking the <strong>✨ Tutorial</strong> button in the top control bar.
          </p>
        </div>
      ),
      wireframe: (
        <div className="w-full h-full bg-[#080C14] border border-slate-800 rounded-xl p-4 flex flex-col justify-center items-center text-center">
          <Sparkles className="w-12 h-12 text-cyan-400 animate-pulse mb-2" />
          <span className="text-sm font-bold text-slate-100">Smart Disaster Relief System Ready</span>
          <span className="text-xs text-slate-500 mt-1">Select any tab from the sidebar to begin</span>
        </div>
      )
    }
  ];

  const step = steps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem('sdr_has_seen_tutorial', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('sdr_has_seen_tutorial', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/95 select-none">
      {/* Container resized with wide 1180px format */}
      <div className="w-[1180px] max-w-[95vw] h-[660px] max-h-[88vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${step.iconColor}`}>
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {step.badge}
              </span>
              <h3 className="text-base font-extrabold text-slate-100">
                {step.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSkip}
              className="text-xs text-slate-400 hover:text-slate-200 font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800"
            >
              Skip
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              title="Close Tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content Split: 4 Columns (Left Text) + 8 Columns (Right Wireframe) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-4 overflow-hidden min-h-0 bg-[#0B0F19]">
          <div className="col-span-12 md:col-span-4 flex flex-col justify-center p-4 bg-slate-950/60 border border-slate-850 rounded-xl">
            {step.content}
          </div>
          <div className="col-span-12 md:col-span-8 flex flex-col justify-center p-2 bg-slate-950/60 border border-slate-850 rounded-xl overflow-hidden relative">
            {step.wireframe}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep 
                    ? 'w-7 bg-cyan-400' 
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 text-xs font-bold px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md font-sans"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
