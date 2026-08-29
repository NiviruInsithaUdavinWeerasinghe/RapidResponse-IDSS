import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, RotateCcw, Info, ShieldAlert, CheckCircle, Compass } from 'lucide-react';
import RainEffect from './RainEffect';
import SurvivorVisual from './SurvivorVisual';
import { api } from '../utils/api';

export default function Module3NetworkAnalysis() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isRunning, setIsRunning] = useState(false);
  const [mstResult, setMstResult] = useState(null);
  const [mstEdges, setMstEdges] = useState([]); // List of edge keys "src-tgt" in MST
  const [currentEdgeIndex, setCurrentEdgeIndex] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [cutOffCamps, setCutOffCamps] = useState([]);
  const [components, setComponents] = useState([]);

  const timerRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [toastLeaving, setToastLeaving] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [shouldRenderModal, setShouldRenderModal] = useState(false);
  const [modalAnimating, setModalAnimating] = useState(false);

  // Translate Node Latitude/Longitude to Responsive SVG screen space (same coordinates as Module 1)
  const getScaledCoordinates = (nodeId) => {
    const layout = {
      "1": { x: 100, y: 150 }, // Colombo HQ
      "2": { x: 630, y: 210 }, // Galle Rescue Camp (A) -> Shifted up further
      "3": { x: 770, y: 295 }, // Matara Rescue Camp (B) -> Shifted down
      "4": { x: 810, y: 200 }, // Hambantota Camp (C)
      "5": { x: 505, y: 215 }, // Ratnapura Junction (JA)
      "6": { x: 90, y: 350 },  // Camp Echo (D)
      "7": { x: 195, y: 360 }, // Camp Foxtrot (E)
      "8": { x: 600, y: 355 }, // Camp Golf (F)
      "9": { x: 740, y: 355 }, // Camp Hotel (G)
      "10": { x: 550, y: 145 }, // Camp India (H)
      "11": { x: 420, y: 60 },  // Camp Juliet (I) -> Shifted right & up
      "12": { x: 80, y: 60 },   // Camp Kilo (J)
      "13": { x: 230, y: 120 }, // Camp Lima (K)
      "14": { x: 170, y: 150 }, // Junction - Maharagama (JB) -> Shifted up
      "15": { x: 130, y: 215 }, // Junction - Piliyandala (JC) -> Shifted down
      "16": { x: 280, y: 285 }, // Junction - Bandaragama (JD)
      "17": { x: 350, y: 345 }, // Junction - Dodangoda (JE)
      "18": { x: 480, y: 385 }, // Junction - Welipenna (JF) -> Shifted down
      "19": { x: 190, y: 75 },  // Junction - Kadawatha (JG)
      "20": { x: 285, y: 135 }  // Junction - Kottawa (JH) -> Shifted only right
    };
    const coord = layout[nodeId.toString()] || { x: 425, y: 205 };
    const stretchedY = 200 + (coord.y - 200) * 1.35 + 20;
    return { x: coord.x, y: stretchedY };
  };

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

  const showToast = (msg) => {
    setToast(msg);
    setToastLeaving(false);
    setTimeout(() => {
      setToastLeaving(true);
      setTimeout(() => {
        setToast(null);
      }, 150);
    }, 2000);
  };

  const copyLogsToClipboard = () => {
    if (logs.length === 0) return;
    const text = logs.map((l, idx) => `[${idx + 1}] ${l.text}\nDetail: ${l.detail}`).join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      showToast("Logs copied successfully!");
    });
  };

  const loadNetworkAndStatus = async (isSilent = false) => {
    try {
      if (!isSilent) {
        setLoading(true);
      }
      setError(null);

      // Fetch static nodes list only once
      let activeNodes = nodes;
      if (nodes.length === 0) {
        activeNodes = await api.listRouteNodes();
        setNodes(activeNodes);
      }

      // Fetch all edges in a single request
      const edgesData = await api.listEdges();
      const edgeList = edgesData.map(e => {
        const pairKey = [e.sourceId, e.targetId].sort().join('-');
        return {
          id: pairKey,
          u: e.sourceId,
          v: e.targetId,
          cost: e.distanceKm,
          blocked: e.blocked
        };
      });
      setEdges(edgeList);

      // Fetch real-time reachability and connected components from Spring Boot API
      const reachability = await api.getReachability();
      setCutOffCamps(reachability.isolatedCamps.map(c => c.name));

      const comps = await api.getComponents();
      setComponents(comps.components);

    } catch (err) {
      console.error("Failed to load backend network data", err);
      setError("Failed to load network topology and state from the backend database server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkAndStatus();
  }, []);

  const resetAll = async () => {
    stopSimulation();
    setMstEdges([]);
    setMstResult(null);
    setCurrentEdgeIndex(-1);
    setLogs([]);
    setSelectedLog(null);
    try {
      await api.resetEdges();
    } catch (err) {
      console.error("Failed to reset database edge block statuses", err);
    }
    loadNetworkAndStatus(true);
  };

  const handleToggleBlock = async (uId, vId) => {
    if (isRunning) return;
    try {
      await api.toggleEdgeBlock({ sourceNodeId: uId, targetNodeId: vId });
      // Instantly clear outdated MST calculation visuals
      setMstEdges([]);
      setCurrentEdgeIndex(-1);
      setLogs([]);
      setSelectedLog(null);
      // Reload network states silently
      await loadNetworkAndStatus(true);
    } catch (err) {
      console.error("Failed to toggle edge block state in database", err);
      showToast("Error updating road block status.");
    }
  };

  const stopSimulation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  const runKruskal = async () => {
    stopSimulation();
    setMstEdges([]);
    setCurrentEdgeIndex(-1);
    setLogs([]);
    setSelectedLog(null);
    setIsRunning(true);

    try {
      // Trigger MST computation on backend
      const res = await api.getMST();
      setMstResult(res);

      const roadsToClear = res.roadsToClear || [];
      const steps = [];
      const mstList = [];
      const allEdges = [...edges];

      if (roadsToClear.length > 0) {
        // Mode A: Reconnect isolated camps by clearing blocked roads (backend data)
        steps.push({
          text: `Initiated Kruskal's algorithm on ${allEdges.filter(e => e.blocked).length} blocked roads.`,
          detail: `[Kruskal's MST Initialization]\n- Found ${allEdges.length} total roads.\n- Blocked Roads: ${allEdges.filter(e => e.blocked).length} requiring clearing.\n- Sorting blocked links by clearing cost (distance)...`
        });

        let currentCost = 0.0;
        roadsToClear.forEach((mstEdge, idx) => {
          const uNodeName = nodes.find(n => n.id === mstEdge.sourceNodeId)?.name || `Node ${mstEdge.sourceNodeId}`;
          const vNodeName = nodes.find(n => n.id === mstEdge.targetNodeId)?.name || `Node ${mstEdge.targetNodeId}`;
          const key = [mstEdge.sourceNodeId, mstEdge.targetNodeId].sort().join('-');
          
          mstList.push(key);
          currentCost += mstEdge.distanceKm;

          steps.push({
            edgeKey: key,
            mst: [...mstList],
            text: `Union-Find: Clear & connect ${uNodeName} ➔ ${vNodeName} (Cost: ${mstEdge.distanceKm} km).`,
            detail: `[Disjoint Set Union-Find Choice #${idx + 1}]\n- Road: ${uNodeName} ➔ ${vNodeName}\n- Cost: ${mstEdge.distanceKm} km\n- Status: Valid connection (No cycle detected).\n- Running union() on components.\n- Cumulative clearing cost: ${currentCost.toFixed(2)} km.`
          });
        });

        steps.push({
          mst: [...mstList],
          text: `MST completed. Components reduced: ${res.componentsReduced}.`,
          detail: `[Final Kruskal's MST Output]\n- Total Roads Cleared: ${roadsToClear.length}\n- Optimal Clearing Cost: ${res.totalCost.toFixed(2)} km\n- Component Status: ${res.componentsReduced}\n- Connectivity cached in Union-Find memory structure.`
        });
      } else {
        // Mode B: Compute and animate active communication backbone (all unblocked roads)
        const activeEdges = allEdges.filter(e => !e.blocked);
        const sortedActive = [...activeEdges].sort((a, b) => a.cost - b.cost);

        steps.push({
          text: `Initiated active network backbone computation on ${activeEdges.length} open roads.`,
          detail: `[Active Backbone MST Initialization]\n- Found ${allEdges.length} total roads.\n- Active/Open Roads: ${activeEdges.length}\n- Network Status: Fully connected. Computing optimal spanning communication backbone.`
        });

        const parent = {};
        nodes.forEach(n => parent[n.id] = n.id);

        const find = (i) => {
          let root = i;
          while (parent[root] !== root) {
            root = parent[root];
          }
          return root;
        };

        const union = (i, j) => {
          const rootI = find(i);
          const rootJ = find(j);
          if (rootI !== rootJ) {
            parent[rootI] = rootJ;
            return true;
          }
          return false;
        };

        let currentMstCost = 0.0;
        let choiceIdx = 1;

        sortedActive.forEach(edge => {
          const uNodeName = nodes.find(n => n.id === edge.u)?.name || `Node ${edge.u}`;
          const vNodeName = nodes.find(n => n.id === edge.v)?.name || `Node ${edge.v}`;

          if (union(edge.u, edge.v)) {
            mstList.push(edge.id);
            currentMstCost += edge.cost;

            steps.push({
              edgeKey: edge.id,
              mst: [...mstList],
              text: `Union-Find: Selected ${uNodeName} ➔ ${vNodeName} (Cost: ${edge.cost} km).`,
              detail: `[Disjoint Set Union-Find Choice #${choiceIdx}]\n- Active Link: ${uNodeName} ➔ ${vNodeName}\n- Cost: ${edge.cost} km\n- Status: Valid connection (No cycle detected).\n- Running union() on components.\n- Cumulative backbone cost: ${currentMstCost.toFixed(2)} km.`
            });
            choiceIdx++;
          }
        });

        steps.push({
          mst: [...mstList],
          text: `Optimal active communication backbone established.`,
          detail: `[Final Active Backbone MST Output]\n- Total Links Selected: ${mstList.length}\n- Optimal Spanning Cost: ${currentMstCost.toFixed(2)} km\n- Component Status: All nodes spanned into a single cost-optimal network tree.`
        });
      }

      let step = 0;
      timerRef.current = setInterval(() => {
        if (step >= steps.length) {
          stopSimulation();
          return;
        }
        const s = steps[step];
        if (s.edgeKey) {
          setCurrentEdgeIndex(step);
        }
        if (s.mst) {
          setMstEdges(s.mst);
        }
        const newLog = { text: s.text, detail: s.detail };
        setLogs(prev => [...prev, newLog]);
        setSelectedLog(newLog);
        step++;
      }, 700);

    } catch (err) {
      console.error(err);
      const errLog = {
        text: "Error executing backend MST algorithm.",
        detail: `Backend service returned error state:\n${err.message}`
      };
      setLogs([errLog]);
      setSelectedLog(errLog);
      setIsRunning(false);
    }
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
              className="p-1 rounded-full bg-slate-850 hover:bg-slate-750 text-slate-400 hover:text-slate-100 transition-all ml-1.5 focus:outline-none"
              title="View Module Guide"
            >
              <Info className="w-4 h-4" />
            </button>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build Minimum Spanning Tree (Kruskal's Algorithm) & Union-Find on active database nodes/edges.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400 font-medium">Loading road network from database...</span>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
          <ShieldAlert className="w-12 h-12 text-rose-500 animate-pulse" />
          <h3 className="font-bold text-slate-200">Database Offline</h3>
          <p className="text-xs text-slate-400 max-w-md">{error}</p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 my-4 overflow-hidden">
          <div className="lg:col-span-2 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between overflow-hidden relative">
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
                  Isolated: {cutOffCamps.length} Camps
                </span>
              )}
            </div>
            
            <div className="flex-1 bg-slate-900/55 rounded-lg relative overflow-hidden flex items-center justify-center z-10">
              <svg viewBox="0 0 850 480" className="w-full h-full transition-all duration-300 z-10">
                {edges.map((e) => {
                  const uNode = getScaledCoordinates(e.u);
                  const vNode = getScaledCoordinates(e.v);
                  const isMst = mstEdges.includes(e.id);
                  let strokeColor = "#334155";
                  let strokeWidth = "2";
                  let dashArray = "0";
                  let glowClass = "transition-all duration-300 ease-in-out";

                  if (e.blocked) {
                    strokeColor = "#EF4444";
                    strokeWidth = "1.5";
                    dashArray = "3,3";
                    glowClass += " drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]";
                  }
                  
                  if (isMst) {
                    strokeColor = "#10B981";
                    strokeWidth = "3";
                    dashArray = "0";
                    glowClass += " drop-shadow-[0_0_3px_rgba(16,185,129,0.5)]";
                  }

                  return (
                    <g 
                      key={e.id} 
                      className="cursor-pointer group" 
                      onClick={() => handleToggleBlock(e.u, e.v)}
                    >
                      {/* Click-helper line overlay */}
                      <line
                        x1={uNode.x}
                        y1={uNode.y}
                        x2={vNode.x}
                        y2={vNode.y}
                        stroke="transparent"
                        strokeWidth="20"
                      />
                      <line
                        x1={uNode.x}
                        y1={uNode.y}
                        x2={vNode.x}
                        y2={vNode.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={dashArray}
                        className={`${glowClass} ${e.blocked ? 'group-hover:stroke-red-500' : 'group-hover:stroke-sky-400'} group-hover:stroke-[3px] group-hover:drop-shadow-[0_0_3px_rgba(${e.blocked ? '239,68,68,0.5' : '56,189,248,0.5'})]`}
                      />
                      {/* Interactive road cost tooltip/badge */}
                      <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <rect
                          x={(uNode.x + vNode.x) / 2 - 20}
                          y={(uNode.y + vNode.y) / 2 - 10}
                          width="40"
                          height="18"
                          rx="4"
                          fill="#0F172A"
                          stroke="#38BDF8"
                          strokeWidth="1"
                        />
                        <text
                          x={(uNode.x + vNode.x) / 2}
                          y={(uNode.y + vNode.y) / 2 + 3}
                          fill="#38BDF8"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="font-mono"
                        >
                          {e.cost.toFixed(1)}k
                        </text>
                      </g>
                    </g>
                  );
                })}

                {nodes.map(s => {
                  const isIsolated = cutOffCamps.includes(s.name);
                  const isHq = s.nodeType === 'HQ';
                  const coord = getScaledCoordinates(s.id);

                  return (
                    <g 
                      key={s.id} 
                      transform={`translate(${coord.x}, ${coord.y})`}
                      className="transition-transform duration-300 hover:scale-110 cursor-help"
                    >
                      {!isHq && s.nodeType !== 'INTERSECTION' && (
                        <g transform="translate(-11, -30)">
                          <SurvivorVisual width={22} height={22} />
                        </g>
                      )}
                      <circle
                        r={isHq ? "16" : s.nodeType === 'INTERSECTION' ? "10" : "12"}
                        fill={isHq ? "#10B981" : isIsolated ? "#991B1B" : s.nodeType === 'INTERSECTION' ? "#475569" : "#1E293B"}
                        stroke={isHq ? "#34D399" : isIsolated ? "#F87171" : "#64748B"}
                        strokeWidth="2.5"
                        className="transition-all duration-300"
                      />
                      {s.nodeType === 'INTERSECTION' ? (
                        <text
                          y="2.5"
                          fill="#F1F5F9"
                          fontSize="7"
                          fontWeight="black"
                          textAnchor="middle"
                        >
                          {s.name.replace("Junction ", "J")}
                        </text>
                      ) : (
                        <text
                          y="3.5"
                          fill="#F1F5F9"
                          fontSize="8"
                          fontWeight="black"
                          textAnchor="middle"
                        >
                          {isHq ? "HQ" : s.name.replace("Camp ", "")}
                        </text>
                      )}
                      {/* Hover node name tooltip overlay */}
                      <title>{s.name} ({s.nodeType})</title>
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
                    selectedLog === log ? 'text-sky-400 font-bold bg-slate-800/80 shadow shadow-sky-950/20' : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
                  }`}
                >
                  <span className="text-[11px] leading-relaxed">
                    <span className="text-sky-500 font-bold font-mono mr-1">[{idx + 1}]</span> {log.text}
                  </span>
                  <Info className={`w-3.5 h-3.5 shrink-0 ${selectedLog === log ? 'text-sky-400' : 'text-slate-500'}`} />
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-slate-500 italic text-center my-auto text-xs">
                  Press Start to compute Kruskal's MST on blocked roads from Spring Boot...
                </div>
              )}
            </div>

            {/* Dedicated Decision Analysis Box at bottom */}
            <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-44 shrink-0 overflow-y-auto">
              <h4 className="text-[9px] uppercase font-bold tracking-wider text-sky-400 mb-1.5 flex items-center gap-1.5">
                <Info className="w-3 text-sky-400" />
                Disjoint Set decision analyzer
              </h4>
              <p className="text-[10.5px] text-slate-350 font-mono leading-relaxed whitespace-pre-line">
                {selectedLog ? selectedLog.detail : `Connected components: ${components.length} sub-networks.\nIsolated camps: ${cutOffCamps.join(', ') || 'None'}\n\nClick "Calculate MST Backbone" to solve.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 shrink-0">
        <button
          onClick={runKruskal}
          disabled={loading || isRunning}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 disabled:opacity-50 text-slate-100 font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg text-sm"
        >
          <Play className="w-4 h-4 fill-slate-100" />
          {isRunning ? 'Running MST...' : 'Calculate MST Backbone'}
        </button>
        
        <button
          onClick={resetAll}
          disabled={loading || isRunning}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 transition-all disabled:opacity-50"
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
                This module connects to the active database to analyze network connectivity, isolated camps, and components using <strong>Kruskal's MST</strong> with a <strong>Union-Find (Disjoint Set)</strong> algorithm on the backend.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Kruskal's MST Backbone</h4>
              <p className="leading-relaxed font-mono text-[11px] text-slate-400">
                - Sorts all blocked roads by distance/cost ascending.<br />
                - Iterates and checks for cycle creations via Union-Find's find() path-compression queries.<br />
                - Spans nodes dynamically, cache-spawning Union-Find for future pipeline reachability checks.
              </p>
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

