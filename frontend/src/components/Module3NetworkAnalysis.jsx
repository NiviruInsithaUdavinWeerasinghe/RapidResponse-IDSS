import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, RotateCcw, Link, Info, ShieldAlert, CheckCircle, Compass } from 'lucide-react';
import RainEffect from './RainEffect';
import SwayingTree from './SwayingTree';
import SurvivorVisual from './SurvivorVisual';

const STORES = [
  { id: 1, label: "HQ", x: 80, y: 200, isDepot: true },
  { id: 2, label: "Camp A", x: 260, y: 80 },
  { id: 3, label: "Camp B", x: 220, y: 320 },
  { id: 4, label: "Camp C", x: 480, y: 140 },
  { id: 5, label: "Camp D", x: 680, y: 260 },
  { id: 6, label: "Camp E", x: 450, y: 320 },
];

const DEFAULT_EDGES = [
  { id: 1, u: 1, v: 2, cost: 15 },
  { id: 2, u: 1, v: 3, cost: 10 },
  { id: 3, u: 2, v: 3, cost: 12 },
  { id: 4, u: 2, v: 4, cost: 8 },
  { id: 5, u: 3, v: 4, cost: 20 },
  { id: 6, u: 3, v: 6, cost: 25 },
  { id: 7, u: 4, v: 5, cost: 14 },
  { id: 8, u: 4, v: 6, cost: 18 },
  { id: 9, u: 5, v: 6, cost: 9 },
];

export default function Module3NetworkAnalysis() {
  const [edges, setEdges] = useState(DEFAULT_EDGES);
  const [blockedEdges, setBlockedEdges] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1200);
  
  const [mstEdges, setMstEdges] = useState([]);
  const [currentEdgeIndex, setCurrentEdgeIndex] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [cutOffCamps, setCutOffCamps] = useState([]);
  
  const timerRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [toastLeaving, setToastLeaving] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [shouldRenderModal, setShouldRenderModal] = useState(false);
  const [modalAnimating, setModalAnimating] = useState(false);

  useEffect(() => {
    if (isInfoModalOpen) {
      setShouldRenderModal(true);
      const t = setTimeout(() => setModalAnimating(true), 25);
      return () => clearTimeout(t);
    } else {
      setModalAnimating(false);
      const t = setTimeout(() => setShouldRenderModal(false), 200);
      return () => clearTimeout(t);
    }
  }, [isInfoModalOpen]);

  const copyLogsToClipboard = () => {
    if (logs.length === 0) return;
    const text = logs.map((l, idx) => `[${idx + 1}] ${l.text}\nDetail: ${l.detail}`).join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      setToast("Logs copied successfully!");
      setToastLeaving(false);
      setTimeout(() => {
        setToastLeaving(true);
        setTimeout(() => {
          setToast(null);
        }, 150);
      }, 2000);
    });
  };

  // BFS Reachability Check from HQ (Node 1)
  useEffect(() => {
    const activeEdges = edges.filter(e => !blockedEdges[e.id]);
    const adj = {};
    STORES.forEach(s => adj[s.id] = []);
    activeEdges.forEach(e => {
      adj[e.u].push(e.v);
      adj[e.v].push(e.u);
    });

    const visited = { 1: true };
    const queue = [1];
    while (queue.length > 0) {
      const curr = queue.shift();
      (adj[curr] || []).forEach(neighbor => {
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          queue.push(neighbor);
        }
      });
    }

    const isolated = STORES.filter(s => !visited[s.id]).map(s => s.label);
    setCutOffCamps(isolated);
  }, [blockedEdges, edges]);

  const resetAll = () => {
    stopSimulation();
    setMstEdges([]);
    setCurrentEdgeIndex(-1);
    setLogs([]);
    setSelectedLog(null);
  };

  const stopSimulation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  const toggleBlockEdge = (id) => {
    if (isRunning) return;
    setBlockedEdges(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    // Instantly clear outdated MST calculation visuals
    setMstEdges([]);
    setCurrentEdgeIndex(-1);
    setLogs([]);
    setSelectedLog(null);
  };

  const runKruskal = () => {
    resetAll();
    setIsRunning(true);

    const sorted = [...edges].sort((a, b) => a.cost - b.cost);
    
    const parent = {};
    STORES.forEach(s => parent[s.id] = s.id);

    const find = (i) => {
      let root = i;
      while (root !== parent[root]) {
        root = parent[root];
      }
      return root;
    };

    const union = (rootU, rootV) => {
      parent[rootU] = rootV;
    };

    const steps = [];
    const mstList = [];

    sorted.forEach((edge, idx) => {
      const uLabel = STORES.find(s => s.id === edge.u).label;
      const vLabel = STORES.find(s => s.id === edge.v).label;

      if (blockedEdges[edge.id]) {
        steps.push({
          edgeIdx: idx,
          edgeId: edge.id,
          log: {
            text: `[Blocked] Road between ${uLabel} and ${vLabel} (cost: ${edge.cost}) is blocked. Bypassed.`,
            detail: `[Disjoint Set Blocked Link]\n- Road ID: ${edge.id}\n- Clearing Cost: ${edge.cost} units\n- Camp A: ${uLabel}\n- Camp B: ${vLabel}\n- Decision: This road is flagged as blocked by disaster debris. Bypassed during MST construction.`
          },
          mst: [...mstList]
        });
        return;
      }

      const rootU = find(edge.u);
      const rootV = find(edge.v);

      if (rootU !== rootV) {
        union(rootU, rootV);
        mstList.push(edge.id);
        steps.push({
          edgeIdx: idx,
          edgeId: edge.id,
          log: {
            text: `${uLabel} and ${vLabel} are not connected yet. Connecting them.`,
            detail: `[Disjoint Set Union-Find Metrics]\n- Road ID: ${edge.id}\n- Clearing Cost: ${edge.cost} units\n- Camp A: ${uLabel} (Root: ${rootU})\n- Camp B: ${vLabel} (Root: ${rootV})\n- Decision: Disjoint components (Root ${rootU} != Root ${rootV}). No cycle detected. Executing union() to clear this link.`
          },
          mst: [...mstList]
        });
      } else {
        steps.push({
          edgeIdx: idx,
          edgeId: edge.id,
          log: {
            text: `${uLabel} and ${vLabel} are already connected. Skipping to avoid a loop.`,
            detail: `[Disjoint Set Cycle Prevention]\n- Road ID: ${edge.id}\n- Clearing Cost: ${edge.cost} units\n- Camp A: ${uLabel} (Root: ${rootU})\n- Camp B: ${vLabel} (Root: ${rootV})\n- Decision: Both camps already connected via root #${rootU}. Clearing this blocked road is redundant and creates a cycle. Rejected.`
          },
          mst: [...mstList]
        });
      }
    });

    let step = 0;
    timerRef.current = setInterval(() => {
      if (step >= steps.length) {
        stopSimulation();
        const isFullyConnected = cutOffCamps.length === 0;
        const finalLog = {
          text: isFullyConnected ? "Disaster road clearing backbone established." : "Backbone construction incomplete (Camps Isolated).",
          detail: isFullyConnected
            ? "[Final MST Output]\nAll camps verified reachable from Central HQ. Road clearing plan is cost-optimal. Union-Find disjoint components successfully spanned."
            : `[Final MST Output]\nWARNING: Central Central HQ is disconnected from: ${cutOffCamps.join(", ")}.\nClearing plan completed only for the remaining reachable sub-network components.`
        };
        setLogs(prev => [...prev, finalLog]);
        setSelectedLog(finalLog);
        return;
      }
      const s = steps[step];
      setCurrentEdgeIndex(s.edgeIdx);
      setMstEdges(s.mst);
      setLogs(prev => [...prev, s.log]);
      setSelectedLog(s.log);
      step++;
    }, 850);
  };

  useEffect(() => {
    return () => stopSimulation();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl overflow-hidden relative">
      
      {/* Custom Toast */}
      {toast && (
        <div className={`absolute top-4 right-4 z-50 bg-[#0B0F19] border border-slate-700 text-sky-400 font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-mono ${
          toastLeaving ? 'animate-toast-out' : 'animate-toast-in'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
            <Compass className="w-6 h-6 animate-pulse" />
            Module 3: Connectivity & Backbone Analysis
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all ml-1.5 focus:outline-none"
              title="View Module Guide"
            >
              <Info className="w-4 h-4" />
            </button>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build Minimum Spanning Tree (Kruskal's Algorithm) & Union-Find. Toggle blocked edges to run real-time BFS.
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 my-4 overflow-hidden">
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between overflow-hidden relative">
          <RainEffect density={50} />
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <svg className="absolute w-24 h-12 animate-cloud-drift-slow top-2" viewBox="0 0 100 50">
              <path d="M20 35a10 10 0 0 1 10-10 12 12 0 0 1 22-8 15 15 0 0 1 28 3 10 10 0 0 1 10 10 10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.08" />
            </svg>
            <svg className="absolute w-32 h-16 animate-cloud-drift-fast top-8" viewBox="0 0 100 50">
              <path d="M20 35a10 10 0 0 1 10-10 12 12 0 0 1 22-8 15 15 0 0 1 28 3 10 10 0 0 1 10 10 10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" opacity="0.06" />
            </svg>
          </div>

          <div className="flex items-center justify-between mb-2 z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Network Topology Map</h3>
            {cutOffCamps.length === 0 ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                All Camps Reachable
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/30 animate-pulse">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                Isolated: {cutOffCamps.join(', ')}
              </span>
            )}
          </div>
          
          <div className="flex-1 bg-slate-900/55 rounded-lg relative overflow-hidden flex items-center justify-center z-10">
            <svg viewBox="0 0 800 400" className="w-full h-full max-h-[320px] transition-all duration-300">
              {edges.map((e, idx) => {
                const uNode = STORES.find(s => s.id === e.u);
                const vNode = STORES.find(s => s.id === e.v);
                const isMst = mstEdges.includes(e.id);
                const isBlocked = blockedEdges[e.id];
                const isActive = idx === edges.findIndex(item => item.id === (edges[currentEdgeIndex] || {}).id);

                let strokeColor = "#334155";
                let strokeWidth = "3";
                let dashArray = "0";

                if (isBlocked) {
                  strokeColor = "#EF4444";
                  strokeWidth = "3";
                  dashArray = "5,5";
                } else if (isMst) {
                  strokeColor = "#10B981";
                  strokeWidth = "5";
                } else if (isActive) {
                  strokeColor = "#06B6D4";
                  strokeWidth = "4";
                }

                return (
                  <g key={e.id} className="cursor-pointer font-bold" onClick={() => toggleBlockEdge(e.id)}>
                    {/* Transparent thick click-helper line */}
                    <line
                      x1={uNode.x}
                      y1={uNode.y}
                      x2={vNode.x}
                      y2={vNode.y}
                      stroke="transparent"
                      strokeWidth="24"
                    />
                    <line
                      x1={uNode.x}
                      y1={uNode.y}
                      x2={vNode.x}
                      y2={vNode.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={dashArray}
                    />
                    <rect
                      x={(uNode.x + vNode.x) / 2 - 14}
                      y={(uNode.y + vNode.y) / 2 - 11}
                      width="28"
                      height="20"
                      rx="6"
                      fill="#1E293B"
                      stroke="#475569"
                      strokeWidth="1.5"
                    />
                    <text
                      x={(uNode.x + vNode.x) / 2}
                      y={(uNode.y + vNode.y) / 2 + 4}
                      fill="#F1F5F9"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {e.cost}
                    </text>
                  </g>
                );
              })}



              {STORES.map(s => {
                const isIsolated = cutOffCamps.includes(s.label);
                return (
                  <g key={s.id} transform={`translate(${s.x}, ${s.y})`}>
                    {!s.isDepot && (
                      <g transform="translate(-11, -30)">
                        <SurvivorVisual width={22} height={22} />
                      </g>
                    )}
                    <circle
                      r={s.isDepot ? "18" : "14"}
                      fill={s.isDepot ? "#10B981" : isIsolated ? "#991B1B" : "#1E293B"}
                      stroke={s.isDepot ? "#34D399" : isIsolated ? "#F87171" : "#475569"}
                      strokeWidth="3"
                    />
                    <text
                      y="4"
                      fill="#F1F5F9"
                      fontSize="9"
                      fontWeight="black"
                      textAnchor="middle"
                    >
                      {s.isDepot ? "HQ" : s.label.split(" ")[1]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          
          <div className="absolute bottom-3 right-3 flex gap-3 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 z-10">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> MST Backbone
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-500">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Blocked
            </span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRunning ? 'bg-sky-400' : 'bg-slate-600'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isRunning ? 'bg-sky-500' : 'bg-slate-500'}`}></span>
              </div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Backbone Analysis Logs</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyLogsToClipboard}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-2 py-0.5 rounded border border-slate-700 transition-colors"
              >
                Copy Logs
              </button>
              <span className="text-[9px] bg-slate-900 text-sky-400 font-mono px-2 py-0.5 rounded border border-slate-800">
                {isRunning ? "RUNNING" : "STANDBY"}
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 p-3 bg-slate-900/50 rounded-lg min-h-0">
            {logs.map((log, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedLog(log)}
                className={`border-b border-slate-850/50 pb-2 last:border-0 flex items-center justify-between gap-2 cursor-pointer px-2.5 py-1.5 rounded transition-colors duration-150 ${
                  selectedLog === log ? 'text-sky-400 font-bold bg-slate-800/80 shadow shadow-sky-950/20' : 'text-slate-355 hover:bg-slate-800/50 hover:text-slate-100'
                }`}
              >
                <span className="text-[11px] leading-relaxed">
                  <span className="text-sky-500 font-bold font-mono mr-1">[{idx + 1}]</span> {log.text}
                </span>
                <Info className={`w-3.5 h-3.5 shrink-0 ${selectedLog === log ? 'text-sky-400' : 'text-slate-500'}`} />
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-slate-500 italic text-center my-auto text-xs">Press Start to run Kruskal's MST...</div>
            )}
          </div>

          {/* Dedicated Decision Analysis Box at bottom */}
          <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-44 shrink-0 overflow-y-auto">
            <h4 className="text-[9px] uppercase font-bold tracking-wider text-sky-400 mb-1.5 flex items-center gap-1.5">
              <Info className="w-3 text-sky-400" />
              Disjoint Set decision analyzer
            </h4>
            <p className="text-[10.5px] text-slate-300 font-mono leading-relaxed whitespace-pre-line">
              {selectedLog ? selectedLog.detail : "Click any step above to inspect its detailed Union-Find disjoint component roots and cycle checks."}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 shrink-0">
        <button
          onClick={runKruskal}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-slate-100 font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg text-sm"
        >
          <Play className="w-4 h-4 fill-slate-100" />
          {isRunning ? 'Running MST...' : 'Calculate MST Backbone'}
        </button>
        
        <button
          onClick={resetAll}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 transition-all"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {shouldRenderModal && createPortal(
        <div 
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] max-w-[90vw] h-[550px] max-h-[80vh] bg-[#0F172A] border border-slate-700 shadow-2xl shadow-black rounded-2xl p-6 z-[9999] flex flex-col transition-all duration-200 ease-out select-none transform ${
            modalAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
            <div>
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                <Info className="w-5 h-5 text-sky-400" />
                M3: Network Analysis Guide
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Module Lead Developers: <strong className="text-sky-400">Sasundul & Niragi</strong>
              </p>
            </div>
            <button
              onClick={() => setIsInfoModalOpen(false)}
              className="text-slate-400 hover:text-slate-200 text-lg font-bold p-1 focus:outline-none"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto my-4 pr-1 text-slate-300 text-xs space-y-4">
            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">What is this page for?</h4>
              <p className="leading-relaxed">
                This module helps you build and analyze a disaster relief communication backbone. It uses <strong>Kruskal's Algorithm</strong> with a <strong>Union-Find (Disjoint Set)</strong> data structure to connect all camps using the minimum cost possible. It also tracks reachability in real-time if certain roads become blocked.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Interactive Controls</h4>
              <ul className="list-disc pl-4 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-slate-100">Clicking Roads (Topology Map):</strong> Hover and click directly on any road line to block it (marking it red). Click it again to unblock. The system runs an automated BFS search from HQ on every toggle to check if any camps are cut off.
                </li>
                <li>
                  <strong className="text-slate-100">Calculate MST Backbone (Bottom):</strong> Starts running Kruskal's algorithm. It sorts roads by cost, tests if adding them creates a cycle, and highlights selected links in glowing green.
                </li>
                <li>
                  <strong className="text-slate-100">Reset Button:</strong> Stops any ongoing calculations, clears the calculated green backbone, and unblocks all roads.
                </li>
                <li>
                  <strong className="text-slate-100">Interval Speed Selector:</strong> Adjust the speed slider next to logs (bottom right) to speed up or slow down disjoint set root checks.
                </li>
                <li>
                  <strong className="text-slate-100">Copy Logs:</strong> Copies Kruskal's detailed sorting, component union indices, and connectivity traces to your clipboard.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Algorithm Test Scenarios</h4>
              <ul className="list-disc pl-4 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-slate-100">Scenario 1: Connect All Camps</strong> - Click "Calculate MST Backbone" with all roads open. Watch Kruskal's pick cheap edges, skip cycles, and form a green tree spanning all 6 camp nodes.
                </li>
                <li>
                  <strong className="text-slate-100">Scenario 2: Handle Blocked Road detours</strong> - Click and block the road from `HQ` to `Camp B`. Run the MST calculation again. Watch how Kruskal's automatically detours through `Camp A` and `Camp C` to maintain connections.
                </li>
                <li>
                  <strong className="text-slate-100">Scenario 3: Severe Flooding Cut-off</strong> - Click and block the roads connecting to `Camp A` completely. Watch the top left banner turn into a red alert showing "Camps Cut-Off!" and marking the isolated node with a warning shield.
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Close Action */}
          <div className="border-t border-slate-800 pt-3 flex justify-end shrink-0">
            <button
              onClick={() => setIsInfoModalOpen(false)}
              className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-100 font-bold px-4 py-2 rounded-xl transition-all active:scale-95 text-xs focus:outline-none"
            >
              Close Guide
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
