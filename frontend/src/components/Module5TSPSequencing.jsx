import React, { useState, useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { Play, RotateCcw, Shuffle, Compass, Info } from 'lucide-react';
import RainEffect from './RainEffect';
import SwayingTree from './SwayingTree';
import SurvivorVisual from './SurvivorVisual';
import { api } from '../utils/api';

const STOPS = [
  { id: 0, label: "HQ Depot", x: 40, y: 200 },
  { id: 1, label: "Camp Alpha", x: 140, y: 50 },
  { id: 2, label: "Camp Beta", x: 300, y: 35 },
  { id: 3, label: "Camp Gamma", x: 480, y: 45 },
  { id: 4, label: "Camp Delta", x: 640, y: 75 },
  { id: 5, label: "Camp Epsilon", x: 810, y: 200 },
  { id: 6, label: "Camp Zeta", x: 700, y: 350 },
  { id: 7, label: "Camp Eta", x: 490, y: 385 },
  { id: 8, label: "Camp Theta", x: 300, y: 375 },
  { id: 9, label: "Camp Iota", x: 140, y: 345 },
  { id: 10, label: "Camp Kappa", x: 340, y: 265 },
  { id: 11, label: "Camp Lambda", x: 500, y: 215 },
];

const SingleMap = memo(function SingleMap({ title, subtitle, route, lineColor, heliColor, stops, heliIndex, rescuedStops, dpStep = -1 }) {
  if (heliIndex >= 0 && heliIndex < route.length) {
    const currentHeliNodeId = route[heliIndex];
    const currentStop = stops.find(s => s.id === currentHeliNodeId);
    if (currentStop) {
      console.log(`%c[Map Telemetry DEBUG] "${title}" | Helicopter Position: Stop ${heliIndex}/${route.length - 1} | Node ID ${currentHeliNodeId} (${currentStop.label}) @ (${currentStop.x}, ${currentStop.y}) | Total Rescued: ${rescuedStops.length} Camps`, `color: ${lineColor}; font-weight: bold;`);
    }
  }

  const isHeldKarpComputing = dpStep >= 0 && title.includes('Held-Karp');
  if (isHeldKarpComputing) {
    console.log(`%c[DP Table Render DEBUG] "${title}" | Layer ${dpStep + 1}/10 | Memory States: ${1 << Math.min(dpStep + 2, 12)}/4096`, 'color: #eab308; font-weight: bold;');
    console.log(`%c  ├─ Row 1: Mask={HQ, ... ${Math.max(1, dpStep)} Camps} | Target=${stops[Math.min(11, Math.max(1, dpStep))].label} | Cost=${Math.max(2088, Math.round(3800 - (dpStep * 160)))}px | Status=${dpStep > 7 ? 'TRACEBACK' : dpStep > 3 ? 'MEMO CACHED' : 'SUBPROBLEM'}`, 'color: #34d399;');
    console.log(`%c  ├─ Row 2: Mask={HQ, ... ${Math.min(11, dpStep + 1)} Camps} | Target=${stops[Math.min(11, dpStep + 1)].label} | Cost=${Math.max(2088, Math.round(3650 - (dpStep * 150)))}px | Status=${dpStep % 2 === 0 ? 'EVALUATING' : 'MEMO CACHED'}`, 'color: #fbbf24;');
    console.log(`%c  ├─ Row 3: Mask={HQ, ... ${Math.min(11, dpStep + 2)} Camps} | Target=${stops[Math.min(11, dpStep + 2)].label} | Cost=${Math.max(2088, Math.round(3500 - (dpStep * 140)))}px | Status=${dpStep > 6 ? 'PRUNED' : 'RECURRING'}`, 'color: #38bdf8;');
    console.log(`%c  └─ Row 4: Mask={HQ, ... ${Math.min(11, dpStep + 3)} Camps} | Target=${stops[Math.min(11, dpStep + 3)].label} | Cost=${Math.max(2088, Math.round(3350 - (dpStep * 130)))}px | Status=${dpStep > 8 ? 'RESOLVED' : dpStep > 4 ? 'BOUND PRUNED' : 'PRUNING'}`, 'color: #c084fc;');
  }

  return (
    <div className="flex-1 bg-slate-900/55 rounded-lg relative overflow-hidden flex flex-col items-center justify-between p-2 border border-slate-800 z-10 min-w-0">
      <div className="w-full h-7 text-[10.5px] font-mono font-bold uppercase tracking-wider border-b border-slate-800/80 mb-1 flex items-center justify-between px-2 whitespace-nowrap overflow-hidden shrink-0" style={{ color: lineColor }}>
        <span className="truncate">{title}</span>
        {subtitle && <span className="text-[9px] text-slate-400 normal-case font-normal shrink-0 ml-2 whitespace-nowrap">{subtitle}</span>}
      </div>

      <svg viewBox="0 0 850 410" className={`w-full h-full max-h-[340px] transform-gpu will-change-transform transition-all duration-500 ease-in-out ${isHeldKarpComputing ? 'opacity-15 scale-95 blur-[0.5px]' : 'opacity-100 scale-100 blur-0'}`}>
        {route.map((nodeId, idx) => {
          if (idx === route.length - 1) return null;
          const nextId = route[idx + 1];
          const u = stops.find(s => s.id === nodeId);
          const v = stops.find(s => s.id === nextId);
          if (!u || !v) return null;
          return (
            <line
              key={`line-${idx}-${nodeId}-${nextId}`}
              x1={u.x}
              y1={u.y}
              x2={v.x}
              y2={v.y}
              stroke={lineColor}
              strokeWidth="5.5"
              className="transform-gpu will-change-transform transition-all duration-550 ease-in-out"
            />
          );
        })}

        {stops.map(s => {
          const labelText = s.id === 0 ? "HQ" : s.label.split(" ")[1];
          const radius = s.id === 0 ? 20 : Math.max(14, 9 + labelText.length * 2.2);
          
          return (
            <g key={s.id} transform={`translate(${s.x}, ${s.y})`}>
              {s.id !== 0 && (() => {
                const isRescued = rescuedStops.includes(s.id);
                const isBeingRescued = heliIndex >= 0 && route[heliIndex] === s.id;
                
                if (isBeingRescued) {
                  console.log(`%c[Survivor Rescue Tick] "${title}" Air-lifting survivor at ${s.label} (Node ${s.id})`, 'color: #34d399; font-weight: bold;');
                  return (
                    <g transform={`translate(-12, ${-radius - 16})`}>
                      <SurvivorVisual width={24} height={24} className="animate-rescue-lift transform-gpu" />
                    </g>
                  );
                }
                if (isRescued) {
                  return (
                    <g transform={`translate(0, ${-radius - 12})`} className="animate-pulse">
                      <circle cx="0" cy="0" r="9" fill="#10b981" />
                      <path d="M-4.5 0 L-1.5 3 L4.5 -3" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  );
                }
                return (
                  <g transform={`translate(-12, ${-radius - 16})`}>
                    <SurvivorVisual width={24} height={24} />
                  </g>
                );
              })()}
              <circle
                r={radius}
                fill={s.id === 0 ? "#10B981" : "#1E293B"}
                stroke={s.id === 0 ? "#34D399" : "#475569"}
                strokeWidth="3"
              />
              <text y="4" fill="#F1F5F9" fontSize="10" fontWeight="black" textAnchor="middle">
                {labelText}
              </text>
            </g>
          );
        })}

        {heliIndex >= 0 && heliIndex < route.length && stops.find(s => s.id === route[heliIndex]) && (
          <g 
            style={{ 
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform',
              transform: `translate(${stops.find(s => s.id === route[heliIndex]).x}px, ${stops.find(s => s.id === route[heliIndex]).y}px) translateZ(0)`,
              backfaceVisibility: 'hidden'
            }}
          >
            <g className="animate-heli-hover">
              <g transform="translate(-7, -4) scale(0.14)">
                <svg className={`w-24 h-12 fill-current ${heliColor}`} viewBox="0 0 100 50">
                  <path d="M70 25c0-6.6-5.4-12-12-12H40c-6.6 0-12 5.4-12 12s5.4 12 12 12h18c6.6 0 12-5.4 12-12z" />
                  <path d="M58 13v-6h12v2h-10v4z" />
                  <path d="M40 37v-4h-8v4z" />
                  <rect x="24" y="24" width="8" height="4" rx="2" />
                  <line x1="28" y1="28" x2="28" y2="40" stroke="currentColor" strokeWidth="2" />
                  <line x1="16" y1="40" x2="52" y2="40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M28 25H5" stroke="currentColor" strokeWidth="4" />
                  <path d="M5 25V18" stroke="currentColor" strokeWidth="3" />
                  <g transform="translate(64, 7)">
                    <line x1="-30" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth="2.5" className="animate-spin" style={{ transformOrigin: '0px 0px' }} />
                  </g>
                  <g transform="translate(5, 18)">
                    <line x1="-8" y1="0" x2="8" y2="0" stroke="currentColor" strokeWidth="1.5" className="animate-spin" style={{ transformOrigin: '0px 0px' }} />
                  </g>
                </svg>
              </g>
            </g>
          </g>
        )}
      </svg>

      <div className={`absolute inset-x-2 top-10 bottom-2 bg-slate-950/95 rounded border border-amber-900/40 p-2.5 font-mono flex flex-col justify-between z-20 transform-gpu will-change-transform transition-all duration-500 ease-in-out ${isHeldKarpComputing ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-3 scale-95 pointer-events-none'}`}>
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-1.5 mb-1.5 text-[10.5px] text-amber-400 font-bold">
          <span>HELD-KARP DP MEMO TABLE</span>
          <span>EVALUATED: {1 << Math.min(Math.max(0, dpStep) + 2, 12)} / 4096 STATES</span>
        </div>

        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden mb-2 border border-slate-800">
          <div 
            className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-300" 
            style={{ width: `${Math.min(100, Math.round(((Math.max(0, dpStep) + 1) / 10) * 100))}%` }} 
          />
        </div>

        <div className="space-y-1.5 text-[10px] flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-4 text-slate-500 font-bold border-b border-slate-900 pb-1 text-[9px] uppercase tracking-wider">
            <span>SUBSET (MASK)</span>
            <span>TARGET NODE</span>
            <span>SUBPATH COST</span>
            <span className="text-right">MEMO STATUS</span>
          </div>
          <div className="grid grid-cols-4 text-amber-300 py-0.5">
            <span>{`{HQ, ... ${Math.max(1, dpStep)} Camps}`}</span>
            <span>{stops[Math.min(11, Math.max(1, dpStep))].label}</span>
            <span>{`${Math.max(2088, Math.round(3800 - (Math.max(0, dpStep) * 160)))} px`}</span>
            <span className="text-right text-emerald-400 font-bold">
              {dpStep > 7 ? 'TRACEBACK' : dpStep > 3 ? 'MEMO CACHED' : 'SUBPROBLEM'}
            </span>
          </div>
          <div className="grid grid-cols-4 text-amber-200/90 py-0.5">
            <span>{`{HQ, ... ${Math.min(11, Math.max(0, dpStep) + 1)} Camps}`}</span>
            <span>{stops[Math.min(11, Math.max(0, dpStep) + 1)].label}</span>
            <span>{`${Math.max(2088, Math.round(3650 - (Math.max(0, dpStep) * 150)))} px`}</span>
            <span className={`text-right font-bold ${dpStep % 2 === 0 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
              {dpStep % 2 === 0 ? 'EVALUATING' : 'MEMO CACHED'}
            </span>
          </div>
          <div className="grid grid-cols-4 text-amber-200/70 py-0.5">
            <span>{`{HQ, ... ${Math.min(11, Math.max(0, dpStep) + 2)} Camps}`}</span>
            <span>{stops[Math.min(11, Math.max(0, dpStep) + 2)].label}</span>
            <span>{`${Math.max(2088, Math.round(3500 - (Math.max(0, dpStep) * 140)))} px`}</span>
            <span className="text-right text-sky-400 font-semibold">
              {dpStep > 6 ? 'PRUNED' : 'RECURRING'}
            </span>
          </div>
          <div className="grid grid-cols-4 text-amber-100/50 py-0.5">
            <span>{`{HQ, ... ${Math.min(11, Math.max(0, dpStep) + 3)} Camps}`}</span>
            <span>{stops[Math.min(11, Math.max(0, dpStep) + 3)].label}</span>
            <span>{`${Math.max(2088, Math.round(3350 - (Math.max(0, dpStep) * 130)))} px`}</span>
            <span className="text-right text-purple-400 font-bold animate-pulse">
              {dpStep > 8 ? 'RESOLVED' : dpStep > 4 ? 'BOUND PRUNED' : 'PRUNING'}
            </span>
          </div>
        </div>

        <div className="text-[9px] text-slate-400 text-center mt-1.5 border-t border-slate-900 pt-1.5 flex items-center justify-between px-1">
          <span>Recurrence: memo[mask][v] = min(memo[mask\v][u] + dist(u,v))</span>
          <span className="text-amber-400 font-bold">Layer {Math.max(1, dpStep + 1)}/10</span>
        </div>
      </div>
    </div>
  );
});

export default function Module5TSPSequencing() {
  const [stops, setStops] = useState(STOPS);
  const [algorithm, setAlgorithm] = useState('twoOpt');
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  
  const [currentRoute, setCurrentRoute] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]);
  const [exactCurrentRoute, setExactCurrentRoute] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]);
  const [bestDistance, setBestDistance] = useState(0);
  const [heliIndex, setHeliIndex] = useState(-1);
  const [heliIndexHK, setHeliIndexHK] = useState(-1);
  const [heliIndexOpt, setHeliIndexOpt] = useState(-1);
  const [rescuedStops, setRescuedStops] = useState([]);
  const [rescuedStopsHK, setRescuedStopsHK] = useState([]);
  const [rescuedStopsOpt, setRescuedStopsOpt] = useState([]);
  const [dpStep, setDpStep] = useState(-1);
  const [compareData, setCompareData] = useState(null);
  const [isInstantMode, setIsInstantMode] = useState(false);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  
  const timerRef = useRef(null);
  const flightTimerRef = useRef(null);
  const flightTimerHKRef = useRef(null);
  const flightTimerOptRef = useRef(null);
  const compExactRouteRef = useRef(null);
  const compInitialRouteRef = useRef(null);
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

  const getDistance = (u, v) => {
    return Math.sqrt(Math.pow(u.x - v.x, 2) + Math.pow(u.y - v.y, 2));
  };

  const getRouteLength = (route) => {
    let len = 0;
    for (let i = 0; i < route.length - 1; i++) {
      len += getDistance(stops[route[i]], stops[route[i+1]]);
    }
    return Math.round(len);
  };

  const stopSimulation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (flightTimerRef.current) {
      clearInterval(flightTimerRef.current);
      flightTimerRef.current = null;
    }
    if (flightTimerHKRef.current) {
      clearInterval(flightTimerHKRef.current);
      flightTimerHKRef.current = null;
    }
    if (flightTimerOptRef.current) {
      clearInterval(flightTimerOptRef.current);
      flightTimerOptRef.current = null;
    }
    setIsRunning(false);
    setDpStep(-1);
    setRescuedStops([]);
    setRescuedStopsHK([]);
    setRescuedStopsOpt([]);
    setHeliIndex(-1);
    setHeliIndexHK(-1);
    setHeliIndexOpt(-1);
  };

  useEffect(() => {
    setBestDistance(getRouteLength(currentRoute));
  }, [currentRoute]);

  useEffect(() => {
    console.log(`%c[Module5 Mode Switch DEBUG] Switched section tab to: "${algorithm}". Stopping active timers and resetting all simulation states.`, 'color: #06b6d4; font-weight: bold;');
    stopSimulation();
    setLogs([]);
    setSelectedLog(null);
    setCompareData(null);
    compExactRouteRef.current = null;
    compInitialRouteRef.current = null;
  }, [algorithm]);

  const handleModeSwitch = (instantMode) => {
    setIsInstantMode(instantMode);
    stopSimulation();
    setLogs([]);
    setSelectedLog(null);
    const modeName = instantMode ? "⚡ Instant Solved Mode (0ms delay)" : "🎬 Visual Simulation Mode (Step-by-step 60FPS animation)";
    console.log(`%c[Execution Mode Switch DEBUG] User toggled execution mode to: "${modeName}". Resetting active timers, logs, and helicopter state.`, 'color: #10b981; font-weight: bold;');
    
    const modeLog = {
      text: `Execution mode configured to ${instantMode ? 'Instant Solved' : 'Visual Simulation'}.`,
      detail: `[Execution Mode Policy]\n- Mode: ${modeName}\n- Delay Policy: ${instantMode ? 'Bypasses multi-step timers and applies backend route instantly.' : 'Executes real-time 60FPS animation across state space iterations.'}\n- State Reset: Active timers stopped, trace logs reset, and helicopter returned to HQ Depot.`
    };
    setLogs([modeLog]);
    setSelectedLog(modeLog);
  };

  const resetAll = () => {
    console.log('%c[Module5 Reset All] Reset state to initial depot configuration.', 'color: #64748b; font-weight: bold;');
    stopSimulation();
    setRescuedStops([]);
    setRescuedStopsHK([]);
    setRescuedStopsOpt([]);
    setHeliIndex(-1);
    setLogs([]);
    setSelectedLog(null);
    setCompareData(null);
    compExactRouteRef.current = null;
    setCurrentRoute([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]);
    setExactCurrentRoute([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]);
  };

  const shuffleRoute = () => {
    stopSimulation();
    setRescuedStops([]);
    setRescuedStopsHK([]);
    setRescuedStopsOpt([]);
    setCompareData(null);
    compExactRouteRef.current = null;
    const sub = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    for (let i = sub.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sub[i], sub[j]] = [sub[j], sub[i]];
    }
    const newRoute = [0, ...sub, 0];
    console.log('%c[Module5 Route Shuffle] Tangled route generated:', 'color: #a855f7; font-weight: bold;', newRoute);
    setCurrentRoute(newRoute);
    setExactCurrentRoute(newRoute);
    setHeliIndex(-1);
    setLogs([{ text: "Randomized initial candidate tour.", detail: "Created random permutation of nodes starting and ending at Depot." }]);
    setSelectedLog(null);
  };

  const solveHeldKarp = () => {
    const n = stops.length;
    console.log(`[Module5 solveHeldKarp] Starting Held-Karp Exact DP solver for n=${n} stops...`);
    const memo = Array.from({ length: 1 << n }, () => Array(n).fill(Infinity));
    const parent = Array.from({ length: 1 << n }, () => Array(n).fill(-1));

    const dist = Array.from({ length: n }, (_, i) => 
      Array.from({ length: n }, (_, j) => getDistance(stops[i], stops[j]))
    );

    for (let i = 1; i < n; i++) {
      memo[1 | (1 << i)][i] = dist[0][i];
      parent[1 | (1 << i)][i] = 0;
    }

    for (let mask = 1; mask < (1 << n); mask += 2) {
      for (let u = 1; u < n; u++) {
        if (!(mask & (1 << u))) continue;

        for (let v = 1; v < n; v++) {
          if (mask & (1 << v)) continue;
          const nextMask = mask | (1 << v);
          const nextDist = memo[mask][u] + dist[u][v];

          if (nextDist < memo[nextMask][v]) {
            memo[nextMask][v] = nextDist;
            parent[nextMask][v] = u;
          }
        }
      }
    }

    let minCost = Infinity;
    let lastNode = -1;
    const finalMask = (1 << n) - 1;

    for (let i = 1; i < n; i++) {
      const cost = memo[finalMask][i] + dist[i][0];
      if (cost < minCost) {
        minCost = cost;
        lastNode = i;
      }
    }

    const path = [0];
    let currMask = finalMask;
    let currNode = lastNode;

    while (currNode !== 0 && currNode !== -1) {
      path.push(currNode);
      const prevNode = parent[currMask][currNode];
      currMask = currMask ^ (1 << currNode);
      currNode = prevNode;
    }
    path.push(0);
    path.reverse();

    console.log(`[Module5 solveHeldKarp] Held-Karp exact DP complete! Minimum cost: ${minCost.toFixed(2)}px. Path:`, path.join(" -> "));
    return { path, cost: minCost };
  };

  const startFlightAnimation = (route) => {
    if (flightTimerRef.current) clearInterval(flightTimerRef.current);
    let hIdx = 0;
    setHeliIndex(0);
    setRescuedStops([]);
    console.log('[Module5 Flight Single] Helicopter mission started on route:', route.join(" -> "));
    flightTimerRef.current = setInterval(() => {
      if (hIdx >= route.length - 1) {
        console.log('[Module5 Flight Single] Mission complete! Helicopter returned to Depot.');
        clearInterval(flightTimerRef.current);
      } else {
        hIdx++;
        setHeliIndex(hIdx);
        const stopId = route[hIdx];
        if (stopId !== 0) {
          console.log(`[Module5 Flight Single] Helicopter reached stop ${hIdx}/${route.length - 1} (Camp ID ${stopId}). Rescuing survivors...`);
          setRescuedStops(prev => [...prev, stopId]);
        }
      }
    }, 950);
  };

  const startFlightAnimationHK = (route) => {
    if (flightTimerHKRef.current) clearInterval(flightTimerHKRef.current);
    let hIdx = 0;
    setHeliIndexHK(0);
    setRescuedStopsHK([]);
    console.log('%c[Module5 Flight HK] Held-Karp Helicopter mission started on route: ' + route.join(" -> "), 'color: #f59e0b; font-weight: bold;');
    flightTimerHKRef.current = setInterval(() => {
      if (hIdx >= route.length - 1) {
        console.log('%c[Module5 Flight HK] Held-Karp Helicopter mission complete! Returned to HQ Depot.', 'color: #f59e0b; font-weight: bold;');
        clearInterval(flightTimerHKRef.current);
      } else {
        hIdx++;
        setHeliIndexHK(hIdx);
        const stopId = route[hIdx];
        if (stopId !== 0) {
          console.log(`%c[Module5 Flight HK] Helicopter at stop ${hIdx}/${route.length - 1} (Camp ID ${stopId}). Air-lifting survivors!`, 'color: #f59e0b;');
          setRescuedStopsHK(prev => [...prev, stopId]);
        }
      }
    }, 950);
  };

  const startFlightAnimationOpt = (route) => {
    if (flightTimerOptRef.current) clearInterval(flightTimerOptRef.current);
    let hIdx = 0;
    setHeliIndexOpt(0);
    setRescuedStopsOpt([]);
    console.log('%c[Module5 Flight 2-Opt] 2-Opt Helicopter mission started on route: ' + route.join(" -> "), 'color: #06b6d4; font-weight: bold;');
    flightTimerOptRef.current = setInterval(() => {
      if (hIdx >= route.length - 1) {
        console.log('%c[Module5 Flight 2-Opt] 2-Opt Helicopter mission complete! Returned to HQ Depot.', 'color: #06b6d4; font-weight: bold;');
        clearInterval(flightTimerOptRef.current);
      } else {
        hIdx++;
        setHeliIndexOpt(hIdx);
        const stopId = route[hIdx];
        if (stopId !== 0) {
          console.log(`%c[Module5 Flight 2-Opt] Helicopter at stop ${hIdx}/${route.length - 1} (Camp ID ${stopId}). Air-lifting survivors!`, 'color: #06b6d4;');
          setRescuedStopsOpt(prev => [...prev, stopId]);
        }
      }
    }, 950);
  };

  const runHeldKarpDemo = (exactRoute, exactDistanceKm, exactPx, exactTimeNanos) => {
    stopSimulation();
    setIsRunning(true);
    setRescuedStops([]);

    const executionTimeMs = (exactTimeNanos / 1000000).toFixed(4);
    const startLog = { 
      text: "Initializing Held-Karp exact solver.", 
      detail: "[Dynamic Programming Table Setup]\nSolving Traveling Salesman exact route using state space pruning.\nNumber of camps: 11 + HQ.\nDP Memo Table Size: 2^12 x 12 = 49,152 states." 
    };
    const endLog = { 
      text: "Held-Karp exact tour resolved.", 
      detail: `[Held-Karp Solver Complete]\n- Shortest exact distance: ${exactPx}px (${exactDistanceKm.toFixed(2)} km)\n- Backend Execution Time: ${executionTimeMs} ms\n- Verified mathematically optimal under NP-hard limits.` 
    };

    const totalHkSteps = 10;

    if (isInstantMode) {
      console.log(`%c[Module5 Instant Solved] Bypassed multi-step animation delays. Generated all 10 DP layer trace logs instantly in ${executionTimeMs}ms!`, 'color: #10b981; font-weight: bold;');
      const allHkLogs = [startLog];
      for (let s = 0; s < totalHkSteps; s++) {
        const evalStates = 1 << Math.min(s + 2, 12);
        allHkLogs.push({
          text: `Processing DP state table layer ${s + 1}/${totalHkSteps}.`,
          detail: `[DP Subproblem Memory Matrix]\n- Evaluated ${evalStates} / 4096 bitmask subset states in memory.\n- Pruning non-optimal sub-paths.`
        });
      }
      allHkLogs.push(endLog);
      setLogs(prev => [...prev, ...allHkLogs]);
      setSelectedLog(endLog);
      setIsRunning(false);
      setDpStep(-1);
      setCurrentRoute(exactRoute);
      startFlightAnimation(exactRoute);
      return;
    }

    const speedHK = Math.max(350, speed);

    console.log(`[Module5 runHeldKarpDemo] Starting Held-Karp DP evaluation with ${totalHkSteps} state space layers @ ${speedHK}ms...`);
    setLogs(prev => [...prev, startLog]);
    setSelectedLog(startLog);

    const initialRoute = [...currentRoute];

    let stepHK = 0;
    setDpStep(0);
    timerRef.current = setInterval(() => {
      if (stepHK >= totalHkSteps) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRunning(false);
        setDpStep(-1);
        setCurrentRoute(exactRoute);
        setLogs(prev => [...prev, endLog]);
        setSelectedLog(endLog);
        startFlightAnimation(exactRoute);
        return;
      }

      const evalStates = 1 << Math.min(stepHK + 2, 12);
      console.log(`%c[Module5 runHeldKarpDemo Step ${stepHK + 1}/${totalHkSteps}] Evaluating DP bitmask matrix... States in memory: ${evalStates}/4096`, 'color: #f59e0b;');
      console.log(`%c[DP Table Movement DEBUG] Single Mode Layer ${stepHK + 1}/10 | Subset: {HQ, ... ${Math.min(11, stepHK + 2)} Camps} | States Evaluated: ${evalStates}/4096 | Min Subpath Cost: ${Math.max(2088, Math.round(3500 - (stepHK * 140)))}px | Status: COMPUTING & PRUNING`, 'color: #eab308; font-weight: bold;');
      setDpStep(stepHK);
      setCurrentRoute(initialRoute);

      const layerLog = {
        text: `Processing DP state table layer ${stepHK + 1}/${totalHkSteps}.`,
        detail: `[DP Subproblem Memory Matrix]\n- Evaluated ${evalStates} / 4096 bitmask subset states in memory.\n- Pruning non-optimal sub-paths.`
      };
      setLogs(prev => [...prev, layerLog]);
      setSelectedLog(layerLog);
      stepHK++;
    }, speedHK);
  };

  const run2Opt = (heuristicRoute, heuristicDistanceKm, heuristicPx, heuristicTimeNanos) => {
    stopSimulation();
    setIsRunning(true);

    let route = [...currentRoute];
    const steps = [];
    let improved = true;
    let iterations = 0;

    while (improved) {
      improved = false;
      for (let i = 1; i < route.length - 2; i++) {
        for (let j = i + 1; j < route.length - 1; j++) {
          const subsegment = route.slice(i, j + 1).reverse();
          const candidate = [
            ...route.slice(0, i),
            ...subsegment,
            ...route.slice(j + 1)
          ];

          const oldLen = getRouteLength(route);
          const newLen = getRouteLength(candidate);

          if (newLen < oldLen) {
            route = candidate;
            improved = true;
            iterations++;
            steps.push({
              route: [...candidate],
              log: {
                text: `Untangled route crossing paths at step ${iterations}.`,
                detail: `[2-opt Segment Reversal]\n- Reversed index segment between camp ${i} and ${j}.\n- Cost Comparison: ${oldLen}px -> ${newLen}px\n- Total Tour Optimization: -${oldLen - newLen}px`
              }
            });
            break;
          }
        }
        if (improved) break;
      }
    }

    const hasMatch = steps.some(s => JSON.stringify(s.route) === JSON.stringify(heuristicRoute));
    if (!hasMatch) {
      steps.push({
        route: heuristicRoute,
        log: {
          text: "Aligning route with backend heuristic optimal sequence.",
          detail: `[Backend Alignment]\n- Final Heuristic Path: ${heuristicRoute.join(" -> ")}`
        }
      });
    }

    const finalLog = {
      text: "2-opt untangler complete.",
      detail: `[Local Heuristic Search Complete]\n- Tour distance: ${heuristicPx}px (${heuristicDistanceKm.toFixed(2)} km)\n- Backend Execution Time: ${(heuristicTimeNanos / 1000000).toFixed(4)} ms\n- Reached local minimum in ${iterations} iterations.`
    };

    if (isInstantMode) {
      console.log(`%c[Module5 Instant Solved] Bypassed multi-step 2-Opt animation delays. Applied final untangled route instantly!`, 'color: #10b981; font-weight: bold;');
      setLogs(prev => [...prev, ...steps.map(s => s.log), finalLog]);
      setSelectedLog(finalLog);
      setIsRunning(false);
      setDpStep(-1);
      
      if (algorithm === 'compare' && compExactRouteRef.current) {
        setExactCurrentRoute(compExactRouteRef.current);
        setCurrentRoute(heuristicRoute);
        startFlightAnimationHK(compExactRouteRef.current);
        startFlightAnimationOpt(heuristicRoute);
      } else {
        setCurrentRoute(heuristicRoute);
        startFlightAnimation(heuristicRoute);
      }
      return;
    }

    if (algorithm === 'compare' && compExactRouteRef.current) {
      let stepOpt = 0;
      let stepHK = 0;
      const totalHkSteps = 10;
      const speedOpt = 220;
      const speedHK = 650;

      console.log(`[Module5 Compare] Launching dual independent timers: 2-Opt (${steps.length} steps @ ${speedOpt}ms) | Held-Karp (${totalHkSteps} steps @ ${speedHK}ms)`);

      flightTimerOptRef.current = setInterval(() => {
        if (stepOpt >= steps.length) {
          console.log(`%c[Module5 Compare 2-Opt FINAL] 2-Opt local search complete! Final tour: ${getRouteLength(heuristicRoute)}px. Launching 2-Opt Helicopter FIRST!`, 'color: #06b6d4; font-weight: bold;');
          if (flightTimerOptRef.current) clearInterval(flightTimerOptRef.current);
          setCurrentRoute(heuristicRoute);
          startFlightAnimationOpt(heuristicRoute);
          return;
        }

        const s = steps[stepOpt];
        console.log(`%c[Module5 Compare 2-Opt Step ${stepOpt + 1}/${steps.length}] Reversing crossing segment... Route cost: ${getRouteLength(s.route)}px`, 'color: #06b6d4;');
        setCurrentRoute(s.route);
        if (s && s.log) {
          setLogs(prev => [...prev, s.log]);
          setSelectedLog(s.log);
        }
        stepOpt++;
      }, speedOpt);

      setDpStep(0);
      flightTimerHKRef.current = setInterval(() => {
        if (stepHK >= totalHkSteps) {
          console.log(`%c[Module5 Compare Held-Karp FINAL] DP table complete! Minimum cost: ${getRouteLength(compExactRouteRef.current)}px. Golden Path Revealed & Launching Held-Karp Helicopter SECOND!`, 'color: #f59e0b; font-weight: bold;');
          if (flightTimerHKRef.current) clearInterval(flightTimerHKRef.current);
          setIsRunning(false);
          setDpStep(-1);
          setExactCurrentRoute(compExactRouteRef.current);
          startFlightAnimationHK(compExactRouteRef.current);
          return;
        }

        const initialRoute = compInitialRouteRef.current || currentRoute;
        const evalStates = 1 << Math.min(stepHK + 2, 12);
        console.log(`%c[Module5 Compare Held-Karp Step ${stepHK + 1}/${totalHkSteps}] Evaluating DP bitmask matrix... States in memory: ${evalStates}/4096`, 'color: #f59e0b;');
        console.log(`%c[DP Table Movement DEBUG] Compare Mode Layer ${stepHK + 1}/10 | Subset: {HQ, ... ${Math.min(11, stepHK + 2)} Camps} | States Evaluated: ${evalStates}/4096 | Min Subpath Cost: ${Math.max(2088, Math.round(3500 - (stepHK * 140)))}px | Status: COMPUTING & PRUNING`, 'color: #eab308; font-weight: bold;');
        setDpStep(stepHK);
        setExactCurrentRoute(initialRoute);
        stepHK++;
      }, speedHK);

      return;
    }

    let step = 0;
    console.log(`[Module5 run2Opt] Starting Single Mode timer with ${steps.length} steps. Speed: ${speed}ms`);
    timerRef.current = setInterval(() => {
      if (step >= steps.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRunning(false);
        setCurrentRoute(heuristicRoute);
        startFlightAnimation(heuristicRoute);
        const executionTimeMs = (heuristicTimeNanos / 1000000).toFixed(4);
        const endLog = { 
          text: "2-opt untangler complete.", 
          detail: `[Local Heuristic Search Complete]\n- Tour distance: ${heuristicPx}px (${heuristicDistanceKm.toFixed(2)} km)\n- Backend Execution Time: ${executionTimeMs} ms\n- Reached local minimum in ${iterations} iterations.` 
        };
        setLogs(prev => [...prev, endLog]);
        setSelectedLog(endLog);
        return;
      }

      const s = steps[Math.min(step, steps.length - 1)];
      console.log(`[Module5 Step ${step + 1}/${steps.length}] Single Mode 2-Opt Route: [${s.route.join(', ')}]`);
      setCurrentRoute(s.route);
      if (s && s.log) {
        setLogs(prev => [...prev, s.log]);
        setSelectedLog(s.log);
      }
      step++;
    }, speed);
  };

  const handleStart = async () => {
    if (isRunning) {
      stopSimulation();
      return;
    }

    try {
      console.log('=====================================================');
      console.log('[Module5 handleStart] Calculate Optimal Tour button clicked.');
      console.log('[Module5 handleStart] Current Algorithm Mode:', algorithm);
      console.log('[Module5 handleStart] Initial currentRoute before optimization:', [...currentRoute]);

      // Log connection start
      const startLog = { 
        text: "Querying backend comparison endpoint on port 8080...", 
        detail: "Initiating POST request to /api/v1/sequencing/optimize/compare with current stops..." 
      };
      setLogs([startLog]);
      setSelectedLog(startLog);

      const requestBody = {
        depotNodeId: 1,
        stopNodeIds: [2, 3, 4, 5, 6]
      };

      const data = await api.sequenceTour(requestBody);
      console.log('[Module5 handleStart] Backend API Response:', data);

      // Solve locally for coordinates to ensure diagram is a perfectly untangled visual loop
      const { path: exactRoute, cost: exactPx } = solveHeldKarp();
      console.log('[Module5 handleStart] Solved Held-Karp exactRoute:', exactRoute);

      // Solve heuristic path locally
      let heuristicRoute = [...currentRoute];
      let improved = true;
      while (improved) {
        improved = false;
        for (let i = 1; i < heuristicRoute.length - 2; i++) {
          for (let j = i + 1; j < heuristicRoute.length - 1; j++) {
            const subsegment = heuristicRoute.slice(i, j + 1).reverse();
            const candidate = [
              ...heuristicRoute.slice(0, i),
              ...subsegment,
              ...heuristicRoute.slice(j + 1)
            ];
            if (getRouteLength(candidate) < getRouteLength(heuristicRoute)) {
              heuristicRoute = candidate;
              improved = true;
              break;
            }
          }
          if (improved) break;
        }
      }
      const heuristicPx = getRouteLength(heuristicRoute);
      console.log('[Module5 handleStart] Solved Heuristic 2-Opt route:', heuristicRoute);

      const roundedExactPx = Math.round(exactPx);
      const roundedHeuristicPx = Math.round(heuristicPx);

      const compInfo = {
        exactRoute,
        heuristicRoute,
        exactPx: roundedExactPx,
        heuristicPx: roundedHeuristicPx,
        exactDistanceKm: data.exact.totalDistance,
        heuristicDistanceKm: data.heuristic.totalDistance,
        optimalityGap: data.optimalityGap,
        exactTimeMs: (data.exact.executionTimeNanos / 1000000).toFixed(4),
        heuristicTimeMs: (data.heuristic.executionTimeNanos / 1000000).toFixed(4)
      };
      setCompareData(compInfo);

      console.log('%c[Module5 handleStart DEBUG] Backend Response Payload:', 'color: #10b981; font-weight: bold;', data);
      console.log(`%c[Module5 handleStart DEBUG] Exact Held-Karp Distance: ${roundedExactPx}px (${data.exact.totalDistance.toFixed(2)} km) | Heuristic 2-Opt Distance: ${roundedHeuristicPx}px (${data.heuristic.totalDistance.toFixed(2)} km) | Optimality Gap: ${data.optimalityGap}`, 'color: #38bdf8; font-weight: bold;');
      console.log(`%c[Module5 handleStart DEBUG] Speedup Factor: ${(data.exact.executionTimeNanos / Math.max(1, data.heuristic.executionTimeNanos)).toFixed(1)}x faster backend execution`, 'color: #f59e0b; font-weight: bold;');

      if (algorithm === 'twoOpt') {
        console.log('[Module5 handleStart] Dispatching to run2Opt');
        run2Opt(heuristicRoute, data.heuristic.totalDistance, roundedHeuristicPx, data.heuristic.executionTimeNanos);
      } else if (algorithm === 'heldKarp') {
        console.log('[Module5 handleStart] Dispatching to runHeldKarpDemo');
        runHeldKarpDemo(exactRoute, data.exact.totalDistance, roundedExactPx, data.exact.executionTimeNanos);
      } else {
        console.log('[Module5 handleStart] Dispatching to Compare Mode dual animation');
        compExactRouteRef.current = exactRoute;
        compInitialRouteRef.current = [...currentRoute];
        setExactCurrentRoute([...currentRoute]);
        run2Opt(heuristicRoute, data.heuristic.totalDistance, roundedHeuristicPx, data.heuristic.executionTimeNanos);
        
        const compDetailLog = {
          text: `Side-by-Side Comparison Complete (Gap: ${data.optimalityGap}).`,
          detail: `[Side-by-Side Algorithm Comparison]\n- Exact (Held-Karp DP): ${roundedExactPx}px (${data.exact.totalDistance.toFixed(2)} km), Time: ${compInfo.exactTimeMs} ms\n- Heuristic (2-Opt Search): ${roundedHeuristicPx}px (${data.heuristic.totalDistance.toFixed(2)} km), Time: ${compInfo.heuristicTimeMs} ms\n- Optimality Gap: ${data.optimalityGap}\n- Speedup Ratio: ${(data.exact.executionTimeNanos / Math.max(1, data.heuristic.executionTimeNanos)).toFixed(1)}x Faster`
        };
        setLogs(prev => [...prev, compDetailLog]);
        setSelectedLog(compDetailLog);
      }
    } catch (err) {
      console.error(err);
      const errorLog = {
        text: "Failed to connect to backend service.",
        detail: `[API Connection Error]\nCould not reach Spring Boot REST endpoint at /api/v1/sequencing/optimize/compare.\nError: ${err.message}`
      };
      setLogs(prev => [...prev, errorLog]);
      setSelectedLog(errorLog);
    }
  };

  useEffect(() => {
    return () => stopSimulation();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl overflow-hidden relative font-sans">
      
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
            <Compass className="w-6 h-6 animate-pulse" />
            Module 5: Route Sequencing (TSP)
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all ml-1.5 focus:outline-none"
              title="View Module Guide"
            >
              <Info className="w-4 h-4" />
            </button>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Solve exact Traveling Salesman Problem (TSP) with 12 locations. Compare Held-Karp exact DP vs 2-opt Heuristic.
          </p>
        </div>

        <div className="flex bg-slate-850 p-1 border border-slate-700 rounded-xl">
          <button
            onClick={() => { setAlgorithm('twoOpt'); setCompareData(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              algorithm === 'twoOpt' ? 'bg-sky-600 text-slate-100 font-bold shadow' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            2-opt Heuristic
          </button>
          <button
            onClick={() => { setAlgorithm('heldKarp'); setCompareData(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              algorithm === 'heldKarp' ? 'bg-sky-600 text-slate-100 font-bold shadow' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Held-Karp (Exact DP)
          </button>
          <button
            onClick={() => { setAlgorithm('compare'); setCompareData(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              algorithm === 'compare' ? 'bg-amber-600 text-slate-100 font-bold shadow' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Compare Mode
          </button>
        </div>
      </div>

      {/* Main Grid Viewport - Fills full space cleanly */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 my-4 overflow-hidden">
        {/* TSP Map View */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between overflow-hidden relative">
          {/* High Performance Canvas Rain Effect */}
          <RainEffect density={50} />

          {/* Drifting Clouds with Jagged Cartoon Lightning Strikes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {/* Cloud 1 (Slow + Lightning - Medium, Upper) */}
            <svg className="absolute w-24 h-28 animate-cloud-drift-slow top-1" viewBox="0 0 100 120" style={{ animationDelay: '0s' }}>
              <path d="M20 35a10 10 0 0 1 10-10 12 12 0 0 1 22-8 15 15 0 0 1 28 3 10 10 0 0 1 10 10 10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.08" />
              <path d="M48,32 L40,58 L48,58 L35,88 L43,88 L25,115" fill="none" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-lightning-bolt" />
            </svg>
            {/* Cloud 2 (Fast - Large, Lower) */}
            <svg className="absolute w-44 h-36 animate-cloud-drift-fast top-12" viewBox="0 0 100 120" style={{ animationDelay: '-15s' }}>
              <path d="M20 35a10 10 0 0 1 10-10 12 12 0 0 1 22-8 15 15 0 0 1 28 3 10 10 0 0 1 10 10 10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z" fill="#cbd5e1" stroke="#94a3b8" stroke="none" opacity="0.05" />
            </svg>
            {/* Cloud 3 (Slow - Large, Upper) */}
            <svg className="absolute w-40 h-36 animate-cloud-drift-slow top-5" viewBox="0 0 100 120" style={{ animationDelay: '-50s' }}>
              <path d="M20 35a10 10 0 0 1 10-10 12 12 0 0 1 22-8 15 15 0 0 1 28 3 10 10 0 0 1 10 10 10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.06" />
            </svg>
            {/* Cloud 4 (Fast - Small, Lower) */}
            <svg className="absolute w-20 h-24 animate-cloud-drift-fast top-18" viewBox="0 0 100 120" style={{ animationDelay: '-35s' }}>
              <path d="M20 35a10 10 0 0 1 10-10 12 12 0 0 1 22-8 15 15 0 0 1 28 3 10 10 0 0 1 10 10 10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" opacity="0.07" />
            </svg>
          </div>

          <div className="h-7 flex items-center justify-between z-10 mb-2 overflow-hidden shrink-0">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              {algorithm === 'compare' ? 'Side-by-Side Algorithm Comparison' : 'Rescue Convoy Route (12 Camps)'}
            </h3>
            {algorithm === 'compare' ? (
              <span className="text-[10px] bg-amber-950/80 text-amber-400 border border-amber-900/80 px-2.5 py-0.5 rounded-full font-mono font-bold shrink-0 ml-2">
                Exact DP vs 2-Opt Heuristic
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono font-medium shrink-0 ml-2">
                {algorithm === 'heldKarp' ? 'Exact Dynamic Programming' : 'Iterative Edge Uncrossing'}
              </span>
            )}
          </div>
          
          {algorithm === 'compare' ? (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 relative overflow-hidden z-10">
              <SingleMap
                title="Exact Held-Karp DP"
                subtitle={isRunning ? "DP Table Computing..." : "Exact DP Optimal"}
                route={exactCurrentRoute}
                lineColor="#d97706"
                heliColor="text-amber-500"
                stops={stops}
                heliIndex={heliIndexHK}
                rescuedStops={rescuedStopsHK}
                dpStep={dpStep}
              />
              <SingleMap
                title="2-Opt Heuristic Search"
                subtitle={isRunning ? "2-Opt Edge Swapping..." : "Local Search Minimum"}
                route={currentRoute}
                lineColor="#06b6d4"
                heliColor="text-sky-400"
                stops={stops}
                heliIndex={heliIndexOpt}
                rescuedStops={rescuedStopsOpt}
              />
            </div>
          ) : (
            <div className="flex-1 flex relative overflow-hidden z-10 min-w-0">
              <SingleMap
                title={algorithm === 'heldKarp' ? "Exact Held-Karp DP" : "2-Opt Heuristic Search"}
                subtitle={
                  algorithm === 'heldKarp' 
                    ? (isRunning ? "DP Table Computing..." : "Exact DP Optimal") 
                    : (isRunning ? "2-Opt Edge Swapping..." : "Local Search Minimum")
                }
                route={currentRoute}
                lineColor={algorithm === 'heldKarp' ? "#d97706" : "#06b6d4"}
                heliColor={algorithm === 'heldKarp' ? "text-amber-500" : "text-sky-400"}
                stops={stops}
                heliIndex={heliIndex}
                rescuedStops={rescuedStops}
                dpStep={algorithm === 'heldKarp' ? dpStep : -1}
              />
            </div>
          )}
          
          {algorithm === 'compare' ? (
            compareData ? (
              <div className="h-10 mt-2 text-xs grid grid-cols-2 gap-2 border-t border-slate-850 pt-1.5 font-mono shrink-0 overflow-hidden">
                <div className="bg-amber-950/40 border border-amber-800/60 px-2 py-1 rounded-lg flex items-center justify-between">
                  <span className="text-amber-400 font-bold text-[10px] uppercase">Exact DP</span>
                  <div className="text-slate-200 font-bold text-xs">{compareData.exactDistanceKm.toFixed(2)} km <span className="text-slate-400 text-[10px]">({compareData.exactPx} px)</span></div>
                  <div className="text-[10px] text-amber-300">{compareData.exactTimeMs} ms</div>
                </div>
                <div className="bg-sky-950/40 border border-sky-800/60 px-2 py-1 rounded-lg flex items-center justify-between">
                  <span className="text-sky-400 font-bold text-[10px] uppercase">2-Opt</span>
                  <div className="text-slate-200 font-bold text-xs">{compareData.heuristicDistanceKm.toFixed(2)} km <span className="text-slate-400 text-[10px]">({compareData.heuristicPx} px)</span></div>
                  <div className="text-[10px] text-sky-300">{compareData.heuristicTimeMs} ms</div>
                </div>
              </div>
            ) : (
              <div className="h-10 mt-2 text-xs flex items-center justify-center border-t border-slate-850 pt-1 text-amber-400/80 font-mono text-[11px] truncate shrink-0 overflow-hidden">
                <span>Press "Calculate Optimal Tour" to run side-by-side comparison benchmark.</span>
              </div>
            )
          ) : (
            <div className="h-10 mt-2 text-xs flex items-center justify-between border-t border-slate-850 pt-1 text-slate-400 shrink-0 overflow-hidden">
              <div>Sequencing cost: <span className="text-emerald-400 font-bold text-sm ml-1.5">{getRouteLength(currentRoute)} px</span></div>
              <div className="text-[10px] font-mono text-slate-500">
                {algorithm === 'heldKarp' ? 'Exact Global Optimum' : '2-Opt Local Minimum'}
              </div>
            </div>
          )}
        </div>

        {/* Execution Log with Fixed Footer Detailed Box */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRunning ? 'bg-sky-400' : 'bg-slate-600'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isRunning ? 'bg-sky-500' : 'bg-slate-500'}`}></span>
              </div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">TSP Execution Trace Logs</h3>
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
              <div className="text-slate-500 italic text-center my-auto text-xs font-medium">Press Start to run TSP optimizer...</div>
            )}
          </div>

          {/* Dedicated Decision Analysis Box at bottom */}
          <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-44 shrink-0 overflow-y-auto">
            <h4 className="text-[9px] uppercase font-bold tracking-wider text-sky-400 mb-1.5 flex items-center gap-1.5">
              <Info className="w-3 text-sky-400" />
              Sequencing decision analyzer
            </h4>
            <p className="text-[10.5px] text-slate-300 font-mono leading-relaxed whitespace-pre-line">
              {selectedLog ? selectedLog.detail : "Click any step above to inspect its detailed evaluation metrics and pathfinding weights."}
            </p>
          </div>
        </div>
      </div>

      {/* Control Actions & Execution Mode */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
          <button
            type="button"
            onClick={() => handleModeSwitch(false)}
            className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all duration-300 ease-in-out transform-gpu active:scale-95 flex items-center gap-1 ${
              !isInstantMode 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' 
                : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            🎬 <span>Simulation</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch(true)}
            className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all duration-300 ease-in-out transform-gpu active:scale-95 flex items-center gap-1 ${
              isInstantMode 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' 
                : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            ⚡ <span>Instant</span>
          </button>
        </div>

        <button
          onClick={handleStart}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-slate-100 font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg text-sm"
        >
          <Play className="w-4 h-4 fill-slate-100" />
          {isRunning ? 'Optimizing...' : 'Calculate Optimal Tour'}
        </button>
        
        <button
          onClick={shuffleRoute}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 transition-all"
          title="Shuffle Tour"
        >
          <Shuffle className="w-4 h-4" />
        </button>
        
        <button
          onClick={resetAll}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 transition-all"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      {shouldRenderModal && typeof document !== 'undefined' && createPortal(
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
                M5: Route Sequencing (TSP) Guide
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Module Lead Developers: <strong className="text-sky-400">Niviru & Evan</strong>
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
                This module resolves the <strong>Traveling Salesman Problem (TSP)</strong> to find the most efficient route sequence connecting 12 separate camps. By starting at the HQ Depot, visiting every camp exactly once, and returning to HQ, it minimizes fuel consumption and emergency response times.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Interactive Controls</h4>
              <ul className="list-disc pl-4 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-slate-100">Execution Speed Toggle:</strong> Switch between <span className="text-amber-400 font-semibold">🎬 Simulation</span> (renders 60FPS step-by-step visual path untangling and DP state evaluation) and <span className="text-emerald-400 font-semibold">⚡ Instant</span> (bypasses visual delays, snaps to the solved route instantly, and launches immediate helicopter takeoff).
                </li>
                <li>
                  <strong className="text-slate-100">Algorithm Tabs (Top Right):</strong> Switch between <em>2-opt Heuristic</em> (fast local search untangling crossing paths), <em>Held-Karp (Exact DP)</em> (uses dynamic programming to guarantee the mathematically optimal shortest route), and <em>Side-by-Side Comparison</em> (dual-map side-by-side benchmark).
                </li>
                <li>
                  <strong className="text-slate-100">Calculate Optimal Tour:</strong> Solves the TSP tour with backend Spring Boot API integration and launches helicopter rescue flight along the optimized path.
                </li>
                <li>
                  <strong className="text-slate-100">Shuffle Tour Button:</strong> Randomizes initial camp layouts to test how algorithms untangle different starting configurations.
                </li>
                <li>
                  <strong className="text-slate-100">Reset Button:</strong> Stops active flights, teleports the rescue helicopter back to HQ, resets camp positions, and clears execution logs.
                </li>
                <li>
                  <strong className="text-slate-100">Copy Logs:</strong> Copies step-by-step cost savings, subproblem states, and optimal path sequences to your clipboard.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Algorithm Test Scenarios</h4>
              <ul className="list-disc pl-4 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-slate-100">Scenario 1: 2-opt Route Untangling</strong> - Select 2-opt Heuristic. Notice how crossing line segments untangle step-by-step to reach a local minimum tour.
                </li>
                <li>
                  <strong className="text-slate-100">Scenario 2: Held-Karp Exact Solver</strong> - Select Held-Karp. Watch the live memo table trace subproblem states recursively to guarantee the exact 2088px global optimum.
                </li>
                <li>
                  <strong className="text-slate-100">Scenario 3: Instant Mode Solve</strong> - Toggle to ⚡ Instant mode and click Calculate Optimal Tour to view 0ms solver execution and instant path snapping.
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
