import React, { useState } from 'react';
import { Play, Activity, CheckCircle, ArrowRight, ArrowDown, HelpCircle, Shield, Award, Cpu, Link, Route, Box } from 'lucide-react';

export default function DashboardOverview() {
  const [activeStep, setActiveStep] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const steps = [
    {
      id: 1,
      title: "Module 3: Network Analysis",
      desc: "Analyzes connectivity using BFS/DFS and Kruskal's algorithm to clear road debris and connect all camps back to HQ.",
      algo: "BFS/DFS + Kruskal's + Union-Find",
      complexity: "O(E log E) / O(V+E)",
      color: "border-cyan-500 text-cyan-400"
    },
    {
      id: 2,
      title: "Module 4: Intelligent Decision",
      desc: "Scores incoming SOS requests and runs Branch & Bound to select the optimal subset of camps to rescue.",
      algo: "Branch & Bound (Exact) / Weighted Scoring",
      complexity: "O(2^n) / O(n log n)",
      color: "border-purple-500 text-purple-400"
    },
    {
      id: 3,
      title: "Module 2: Intelligent Resource Allocation",
      desc: "Packs survival gear (medicine, water) into a rescue helicopter without breaking its strict weight limit.",
      algo: "Branch & Bound (Exact) / Greedy Best-Fit",
      complexity: "O(2^n) / O(n log n)",
      color: "border-amber-500 text-amber-400"
    },
    {
      id: 4,
      title: "Module 5: Route Sequencing (TSP)",
      desc: "Finds the fastest driving sequence to drop off supplies at 12 different camps in one continuous trip.",
      algo: "Held-Karp (Exact DP) / 2-opt Heuristic",
      complexity: "O(n^2 * 2^n) / O(k * n^2)",
      color: "border-emerald-500 text-emerald-400"
    },
    {
      id: 5,
      title: "Module 1: Intelligent Route Optimization",
      desc: "Calculates the shortest safe driving path between the Central HQ and a specific rescue camp, avoiding flooded zones.",
      algo: "Dijkstra's (Primary) / A* Search (Extension)",
      complexity: "O((V+E) log V)",
      color: "border-blue-500 text-blue-400"
    }
  ];

  const runSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveStep(0);
    setLogs(["[SYSTEM] Initiating end-to-end disaster relief simulation..."]);

    const logMessages = [
      "[M3 Scan] Running BFS/DFS and Kruskal's... Connectivity verified: 50 camps connected back to Central HQ.",
      "[M4 Decision] Branch & Bound selected optimal subset of SOS requests within truck capacity.",
      "[M2 Knapsack] Helicopter survival gear allocation calculated: Total weight (940kg / 1000kg).",
      "[M5 Sequence] TSP solver optimized supply drop sequence: 12 camps untangled.",
      "[M1 Routing] A* search solved shortest path from Central HQ to Camp. Dispatching rescue team.",
      "[SYSTEM] Active disaster relief instructions successfully pushed. Pipeline completed."
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current >= steps.length) {
        clearInterval(interval);
        setIsRunning(false);
        setActiveStep(-1);
        setLogs(prev => [...prev, logMessages[logMessages.length - 1]]);
        return;
      }
      setLogs(prev => [...prev, logMessages[current]]);
      setActiveStep(current);
      current++;
    }, 1800);
  };

  return (
    <div className="flex flex-col gap-6 h-full text-slate-100 p-2">
      
      {/* Portfolio Title Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/30 uppercase tracking-widest">
            PDSA-2 Coursework Case Study
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-2 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            Smart Disaster Relief DSS (SDR-DSS)
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
            This platform acts as a **Decision Support System** comprising 5 distinct software modules designed to route vehicles, pack survival gear efficiently, clear blocked roads, prioritize rescues, and sequence deliveries.
          </p>
        </div>
        <button
          onClick={runSimulation}
          disabled={isRunning}
          className={`flex items-center gap-2 font-bold py-3 px-6 rounded-xl transition-all shadow-lg text-sm shrink-0 ${
            isRunning 
              ? 'bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-750' 
              : 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-slate-950 shadow-cyan-500/20'
          }`}
        >
          <Play className="w-4 h-4 fill-current animate-pulse" />
          {isRunning ? 'Running Simulation...' : 'Trigger Pipeline Simulation'}
        </button>
      </div>

      {/* Main Grid Layout - Resolving cutoffs by making it flex-1 scrollable */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Module Cards Column (Left & Middle) */}
        <div className="xl:col-span-2 flex flex-col gap-4 overflow-y-auto px-2 py-1.5 pr-3 max-h-[calc(100vh-280px)]">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Module Breakdown & Stack</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step, idx) => {
              const isActive = idx === activeStep;
              
              return (
                <div
                  key={step.id}
                  className={`bg-slate-950 border p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 ${
                    isActive 
                      ? 'border-cyan-500 bg-cyan-950/20 shadow shadow-cyan-500/20 -translate-y-0.5' 
                      : 'border-slate-850 hover:border-slate-750 hover:-translate-y-0.5'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-extrabold text-slate-200 text-sm">{step.title}</h3>
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                        {step.complexity}
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-slate-450 mt-2 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Algorithm Stack:</span>
                    <span className="text-cyan-400 font-semibold font-mono">{step.algo}</span>
                  </div>
                </div>
              );
            })}
            
            {/* System Pipeline Summary Info Card */}
            <div className="bg-[#0B0F19] border border-cyan-900/20 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-cyan-400 text-sm flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  LO3 Optimization Compliance
                </h3>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Every intractable module implements both an exact B&B/DP solver and a 2-approximation/local-search heuristic to fulfill NIBM Coursework Learning Outcomes.
                </p>
              </div>
              <div className="text-[10px] text-slate-500 mt-3 pt-3 border-t border-slate-900/60">
                Coursework Batch: <strong>BSc (Hons) Computing - 26.1</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Trace Terminal Panel (Right) */}
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 flex flex-col h-[calc(100vh-280px)]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Simulation Pipeline trace</h3>
          
          <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-300 flex flex-col gap-3 p-3 bg-slate-900/60 rounded-xl leading-relaxed">
            {logs.map((log, idx) => (
              <div key={idx} className="border-b border-slate-850/50 pb-2 text-slate-400 last:border-0">
                {log.startsWith("[SYSTEM]") ? (
                  <span className="text-emerald-400 font-bold">{log}</span>
                ) : log.startsWith("[M3") ? (
                  <span className="text-cyan-400">{log}</span>
                ) : log.startsWith("[M4") ? (
                  <span className="text-purple-400">{log}</span>
                ) : log.startsWith("[M2") ? (
                  <span className="text-amber-400">{log}</span>
                ) : (
                  <span className="text-blue-400">{log}</span>
                )}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-slate-500 italic text-center my-auto">Press Trigger Simulation above to see data flow trace...</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
