import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, RotateCcw, Compass, Info } from 'lucide-react';
import RainEffect from './RainEffect';
import SurvivorVisual from './SurvivorVisual';

const COLS = 20;
const ROWS = 10;
const START_NODE = { r: 2, c: 2 };
const END_NODE = { r: 7, c: 17 };

export default function Module1RouteOpt() {
  const [grid, setGrid] = useState([]);
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [speed, setSpeed] = useState(50);
  const [isRunning, setIsRunning] = useState(false);
  const [visitedCount, setVisitedCount] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [frontier, setFrontier] = useState([]);
  const [visited, setVisited] = useState({});
  const [path, setPath] = useState([]);
  const [boatIndex, setBoatIndex] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  
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

  useEffect(() => {
    resetGrid();
  }, []);

  const resetGrid = () => {
    stopGridSim();
    const newGrid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          r,
          c,
          isStart: r === START_NODE.r && c === START_NODE.c,
          isEnd: r === END_NODE.r && c === END_NODE.c,
          isWall: false,
        });
      }
      newGrid.push(row);
    }
    // Add default walls
    for (let r = 1; r < 9; r++) {
      if (r !== 5) newGrid[r][8].isWall = true;
    }
    for (let r = 0; r < 8; r++) {
      if (r !== 3) newGrid[r][13].isWall = true;
    }
    setGrid(newGrid);
    setVisited({});
    setFrontier([]);
    setPath([]);
    setBoatIndex(-1);
    setVisitedCount(0);
    setPathLength(0);
    setLogs([{ text: "System is ready. Press Start.", detail: "Workspace initialized.\nSelect Dijkstra for standard uniform search or A* for goal-directed heuristic pathing to the rescue camp." }]);
    setSelectedLog(null);
  };

  const stopGridSim = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  const toggleWall = (r, c) => {
    if (isRunning) return;
    if ((r === START_NODE.r && c === START_NODE.c) || (r === END_NODE.r && c === END_NODE.c)) return;
    const newGrid = [...grid];
    newGrid[r][c].isWall = !newGrid[r][c].isWall;
    setGrid(newGrid);
  };

  const startPathfinding = () => {
    if (isRunning) {
      stopGridSim();
      return;
    }

    setVisited({});
    setPath([]);
    setBoatIndex(-1);
    setVisitedCount(0);
    setPathLength(0);
    setLogs([{ text: `Starting pathfinding calculations...`, detail: `Executing graph traversal.\nAlgorithm: ${algorithm === 'astar' ? 'A* Search (Admissible Heuristic)' : "Dijkstra's SSSP"}.` }]);
    setIsRunning(true);

    const dist = {};
    const prev = {};
    const h = (node) => Math.abs(node.r - END_NODE.r) + Math.abs(node.c - END_NODE.c);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        dist[`${r},${c}`] = Infinity;
      }
    }
    dist[`${START_NODE.r},${START_NODE.c}`] = 0;

    let queue = [{ r: START_NODE.r, c: START_NODE.c, f: algorithm === 'astar' ? h(START_NODE) : 0, g: 0 }];
    const localVisited = {};
    let stepCount = 0;

    timerRef.current = setInterval(() => {
      if (queue.length === 0) {
        stopGridSim();
        setLogs(prevLogs => [...prevLogs, { text: "No path found between locations.", detail: "Open queue heap is empty. Target node is unreachable. Check wall obstacles." }]);
        return;
      }

      queue.sort((a, b) => a.f - b.f);
      const curr = queue.shift();
      const currKey = `${curr.r},${curr.c}`;

      if (localVisited[currKey]) return;
      localVisited[currKey] = true;
      setVisited(prev => ({ ...prev, [currKey]: true }));
      setVisitedCount(c => c + 1);
      stepCount++;

      // Log decision reasoning
      if (stepCount % 5 === 1 || (curr.r === END_NODE.r && curr.c === END_NODE.c)) {
        let entry;
        if (algorithm === 'astar') {
          const heur = h(curr);
          entry = {
            text: `Navigating node (${curr.r}, ${curr.c}) because it points towards the rescue camp.`,
            detail: `[A* Search Step Details]\n- Current Node: (${curr.r}, ${curr.c})\n- Cumulative Path cost g(n): ${curr.g} blocks\n- Admissible Heuristic h(n): ${heur} blocks\n- Priority Value f(n) = g(n) + h(n) = ${curr.g + heur}\n- Decision: Prioritizing nodes with smaller f(n) to direct exploration toward rescue camp coordinates.`
          };
        } else {
          entry = {
            text: `Checking node (${curr.r}, ${curr.c}) uniformly.`,
            detail: `[Dijkstra Search Step Details]\n- Current Node: (${curr.r}, ${curr.c})\n- Tentative path distance g(n): ${curr.g}\n- Decision: Exploring all adjacent nodes uniformly in circular wave. No heuristic coordinates applied.`
          };
        }
        setLogs(prevLogs => [...prevLogs, entry]);
        setSelectedLog(entry);
      }

      if (curr.r === END_NODE.r && curr.c === END_NODE.c) {
        stopGridSim();
        const reconstructedPath = [];
        let temp = currKey;
        while (temp) {
          const [tr, tc] = temp.split(',').map(Number);
          reconstructedPath.unshift({ r: tr, c: tc });
          temp = prev[temp];
        }
        setPath(reconstructedPath);
        setPathLength(reconstructedPath.length);
        
        // Animate boat along path
        let bIdx = 0;
        const boatInterval = setInterval(() => {
          setBoatIndex(bIdx);
          if (bIdx >= reconstructedPath.length - 1) {
            clearInterval(boatInterval);
          } else {
            bIdx++;
          }
        }, 150);

        const endLog = { text: "Shortest route successfully calculated.", detail: `[Route Search Finished]\n- Path length: ${reconstructedPath.length} blocks\n- Total vertices traversed: ${stepCount}\n- Prev mapping reconstructed back to Central HQ.` };
        setLogs(prevLogs => [...prevLogs, endLog]);
        setSelectedLog(endLog);
        return;
      }

      const neighbors = [
        { r: curr.r - 1, c: curr.c },
        { r: curr.r + 1, c: curr.c },
        { r: curr.r, c: curr.c - 1 },
        { r: curr.r, c: curr.c + 1 },
      ];

      for (const n of neighbors) {
        if (n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c < COLS) {
          if (grid[n.r][n.c].isWall || localVisited[`${n.r},${n.c}`]) continue;
          const newG = curr.g + 1;
          const nKey = `${n.r},${n.c}`;
          if (newG < dist[nKey]) {
            dist[nKey] = newG;
            prev[nKey] = currKey;
            queue.push({ r: n.r, c: n.c, f: newG + (algorithm === 'astar' ? h(n) : 0), g: newG });
          }
        }
      }
      setFrontier([...queue]);
    }, speed);
  };

  useEffect(() => {
    return () => stopGridSim();
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
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
            <Compass className="w-6 h-6 animate-spin-slow" />
            Module 1: Intelligent Route Optimization
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all ml-1.5 focus:outline-none"
              title="View Module Guide"
            >
              <Info className="w-4 h-4" />
            </button>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare pathfinding efficiency: Dijkstra (uniform explore) vs A* (goal-directed heuristic using straight-line camps coordinates).
          </p>
        </div>
        
        {/* Toggle Algorithm */}
        <div className="flex bg-slate-850 p-1 border border-slate-700 rounded-xl">
          <button
            onClick={() => { setAlgorithm('dijkstra'); resetGrid(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              algorithm === 'dijkstra' ? 'bg-sky-600 text-slate-100 font-bold shadow' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Dijkstra's Algorithm
          </button>
          <button
            onClick={() => { setAlgorithm('astar'); resetGrid(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              algorithm === 'astar' ? 'bg-sky-600 text-slate-100 font-bold shadow' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            A* Search (Heuristic)
          </button>
        </div>
      </div>

      {/* Main Content Layout with Grid and Logs side by side */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 my-4 overflow-hidden">
        {/* Grid Canvas */}
        <div className="lg:col-span-2 flex flex-col justify-between p-4 bg-slate-950 border border-slate-850 rounded-xl overflow-auto relative">
          {/* High Performance Canvas Rain particle background */}
          <RainEffect density={60} />

          {/* Drifting Clouds */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <svg className="absolute w-24 h-12 animate-cloud-drift-slow top-2" viewBox="0 0 100 50">
              <path d="M20 35a10 10 0 0 1 10-10 12 12 0 0 1 22-8 15 15 0 0 1 28 3 10 10 0 0 1 10 10 10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.08" />
            </svg>
            <svg className="absolute w-32 h-16 animate-cloud-drift-fast top-8" viewBox="0 0 100 50">
              <path d="M20 35a10 10 0 0 1 10-10 12 12 0 0 1 22-8 15 15 0 0 1 28 3 10 10 0 0 1 10 10 10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" opacity="0.06" />
            </svg>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-850 mb-3 shrink-0 z-10">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> HQ</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Target Camp</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-bold flex items-center justify-center text-[7px] w-4 h-4">≋</span> Flood Zone</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-900"></span> Explored</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-cyan-400"></span> Safe Route</span>
          </div>

          <div className="flex-grow flex items-center justify-center z-10 relative">
            
            {/* Smooth sliding & pitching SVG boat overlay container */}
            {path.length > 0 && boatIndex >= 0 && boatIndex < path.length && (() => {
              let scaleX = 1; // Default facing right (scaleX = 1)
              if (boatIndex > 0 && path[boatIndex] && path[boatIndex - 1]) {
                // Find the last horizontal movement direction in the traversed path
                let lastDc = 0;
                for (let i = boatIndex; i > 0; i--) {
                  const diff = path[i].c - path[i-1].c;
                  if (diff !== 0) {
                    lastDc = diff;
                    break;
                  }
                }
                if (lastDc < 0) scaleX = -1; // Mirror horizontally to face left
                else scaleX = 1;             // Face right
              }
              return (
                <div
                  className="absolute z-20 flex items-center justify-center pointer-events-none"
                  style={{
                    left: `${(path[boatIndex].c / COLS) * 100}%`,
                    top: `${(path[boatIndex].r / ROWS) * 100}%`,
                    width: `${100 / COLS}%`,
                    height: `${100 / ROWS}%`,
                    transition: 'left 150ms cubic-bezier(0.4, 0, 0.2, 1), top 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div className="animate-boat-pitch">
                    <svg 
                      className="w-7 h-7 text-cyan-300 fill-current drop-shadow-[0_0_8px_rgba(34,211,238,0.85)] overflow-visible" 
                      viewBox="0 0 24 24"
                      style={{ transform: `scaleX(${scaleX})`, transition: 'transform 120ms ease-in-out' }}
                    >
                      {/* Ancient sailboat hull */}
                      <path d="M3 15 L21 15 L17 19 H7 Z" fill="#0284c7" stroke="#22d3ee" strokeWidth="1" />
                      {/* Mast */}
                      <line x1="12" y1="15" x2="12" y2="3.5" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round" />
                      {/* Left Sail (Mainsail) */}
                      <path d="M11 4.5 L4.5 14 H11 Z" fill="#f8fafc" fillOpacity="0.9" stroke="#22d3ee" strokeWidth="0.5" />
                      {/* Right Sail (Jib) */}
                      <path d="M13 5.5 L19.5 14 H13 Z" fill="#f8fafc" fillOpacity="0.8" stroke="#22d3ee" strokeWidth="0.5" />
                      {/* Little flag on top */}
                      <path d="M12 3.5 L15.5 4.5 L12 5.5" fill="#f97316" />
                    </svg>
                  </div>
                </div>
              );
            })()}

            <div className="grid gap-1 scale-[0.9] sm:scale-100 transition-all duration-300 w-full h-full" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const isVisited = visited[`${r},${c}`];
                  const isFrontier = frontier.some(f => f.r === r && f.c === c);
                  const isPath = path.some(p => p.r === r && p.c === c);
                  
                  let bgClass = "bg-slate-800 border-slate-700 hover:bg-slate-700";
                  if (cell.isStart) bgClass = "bg-emerald-500 shadow-lg shadow-emerald-500/30 border-emerald-400";
                  else if (cell.isEnd) bgClass = "bg-rose-500 shadow-lg shadow-rose-500/30 border-rose-400 animate-pulse";
                  else if (cell.isWall) bgClass = "bg-blue-950 border-blue-800 text-blue-300 font-bold hover:bg-blue-900";
                  else if (isPath) bgClass = "bg-cyan-900/40 border-cyan-800/60";
                  else if (isVisited) bgClass = "bg-sky-950/30 border-sky-900/40 text-cyan-200/50";
                  else if (isFrontier) bgClass = "bg-indigo-950/40 border-indigo-900/50";

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => toggleWall(r, c)}
                      className={`aspect-square rounded-md border text-[7px] sm:text-[9px] font-bold flex flex-col items-center justify-center cursor-pointer transition-all duration-150 relative overflow-hidden ${bgClass}`}
                    >
                      {cell.isWall ? (
                        <div className="absolute inset-0 w-full h-full flex flex-col justify-end bg-blue-950/40">
                          <svg className="w-full h-[65%] absolute bottom-0 left-0 overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <path d="M0 20 Q25 10 50 20 T100 20 L100 40 L0 40 Z" fill="#1e3a8a" opacity="0.65" className="animate-wave-sway-vertical" />
                            <path d="M0 24 Q25 16 50 24 T100 24 L100 40 L0 40 Z" fill="#2563eb" opacity="0.85" className="animate-wave-sway-vertical" style={{ animationDelay: '0.6s' }} />
                          </svg>
                        </div>
                      ) : cell.isStart ? (
                        'HQ'
                      ) : cell.isEnd ? (
                        <div className="flex flex-col items-center justify-center relative w-full h-full">
                          <SurvivorVisual className="w-6 h-6 -mt-1 select-none pointer-events-none" />
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Logs Panel with Fixed Footer Detailed Box */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRunning ? 'bg-sky-400' : 'bg-slate-600'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isRunning ? 'bg-sky-500' : 'bg-slate-500'}`}></span>
              </div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Search Logic Logs</h3>
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
          
          <div className="flex-grow overflow-y-auto flex flex-col gap-1.5 p-3 bg-slate-900/50 rounded-lg min-h-0">
            {logs.map((log, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedLog(log)}
                className={`border-b border-slate-850/50 pb-2 last:border-0 flex items-center justify-between gap-2 cursor-pointer px-2.5 py-1.5 rounded transition-colors duration-150 ${
                  selectedLog === log ? 'text-sky-400 font-bold bg-slate-800/80 shadow shadow-sky-950/20' : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
                }`}
              >
                <span className="text-[11px] leading-relaxed">
                  <span className="text-sky-500 font-bold font-mono mr-1">[{idx + 1}]</span> {log.text}
                </span>
                <Info className={`w-3.5 h-3.5 shrink-0 ${selectedLog === log ? 'text-sky-400' : 'text-slate-500'}`} />
              </div>
            ))}
          </div>

          {/* Dedicated Decision Analysis Box at bottom */}
          <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-44 shrink-0 overflow-y-auto">
            <h4 className="text-[9px] uppercase font-bold tracking-wider text-sky-400 mb-1.5 flex items-center gap-1.5">
              <Info className="w-3 text-sky-400" />
              Routing decision analyzer
            </h4>
            <p className="text-[10.5px] text-slate-300 font-mono leading-relaxed whitespace-pre-line">
              {selectedLog ? selectedLog.detail : "Click any step above to inspect its detailed evaluation metrics and pathfinding weights."}
            </p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div>
              Nodes Explored: <span className="font-bold text-sky-400 text-sm">{visitedCount}</span>
            </div>
            <div>
              Path Distance: <span className="font-bold text-emerald-400 text-sm">{pathLength ? `${pathLength} units` : 'N/A'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Speed:</span>
            <input
              type="range"
              min="10"
              max="200"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-24 accent-sky-400 bg-slate-800"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={startPathfinding}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600/50 to-teal-600/50 hover:from-sky-600 hover:to-teal-600 text-slate-100 font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg"
          >
            <Play className="w-4 h-4 fill-slate-100" />
            {isRunning ? 'Pause Simulation' : 'Start Simulation'}
          </button>
          
          <button
            onClick={resetGrid}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 transition-all"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
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
                M1: Route Optimization Guide
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Module Lead Developers: <strong className="text-sky-400">Kisandu & Nethmi</strong>
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
                This module helps you compare pathfinding efficiency between <strong>Dijkstra's Algorithm</strong> and <strong>A* Search</strong>. When a disaster strikes, finding the shortest safe path from the Command Headquarters (HQ) to a target camp is critical. This page visualizes how the algorithms navigate around flooded areas to establish safe routes.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Interactive Controls</h4>
              <ul className="list-disc pl-4 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-slate-100">Algorithm Toggles (Top Right):</strong> Choose between <em>Dijkstra's Algorithm</em> (explores paths uniformly in all directions) and <em>A* Search</em> (uses target coordinates as a goal-directed heuristic to search faster).
                </li>
                <li>
                  <strong className="text-slate-100">Speed Slider (Bottom Right):</strong> Drag the slider to set the delay per step from 200ms (Slow) down to 10ms (Turbo) to watch the frontier expansion at your own pace.
                </li>
                <li>
                  <strong className="text-slate-100">Start / Pause Simulation:</strong> Play or pause the step-by-step frontier search from HQ to the target camp.
                </li>
                <li>
                  <strong className="text-slate-100">Reset Button:</strong> Clears all path traces, frontier nodes, and resets the grid to standby.
                </li>
                <li>
                  <strong className="text-slate-100">Copy Logs:</strong> Copies all execution steps and distance logs to your clipboard.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Algorithm Test Scenarios</h4>
              <ul className="list-disc pl-4 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-slate-100">Scenario 1: Dijkstra Uniform Search</strong> - Watch Dijkstra expand uniformly outwards like a circle. Since it has no goal awareness, it explores nodes in all directions before locating the target.
                </li>
                <li>
                  <strong className="text-slate-100">Scenario 2: A* Goal-Directed Heuristic</strong> - Run A* and see how the search frontier stretches straight towards the target camp, exploring far fewer cells while still finding the same optimal distance.
                </li>
                <li>
                  <strong className="text-slate-100">Scenario 3: Flood Obstacle Detour</strong> - Watch how the search frontier shapes around the flood zone (dark blue water block). If a block cuts off the straight path, the search detours dynamically to find the next shortest path.
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
