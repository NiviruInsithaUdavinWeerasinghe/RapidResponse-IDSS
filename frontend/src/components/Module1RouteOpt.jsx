import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, RotateCcw, Compass, Info, Activity, ShieldAlert, Award, ChevronDown } from 'lucide-react';
import RainEffect from './RainEffect';
import SurvivorVisual from './SurvivorVisual';
import { api } from '../utils/api';

export default function Module1RouteOpt() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [algorithm, setAlgorithm] = useState('compare'); // 'dijkstra', 'astar', 'compare'
  
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [path, setPath] = useState([]);
  const [boatIndex, setBoatIndex] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  
  const [toast, setToast] = useState(null);
  const [toastLeaving, setToastLeaving] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [shouldRenderModal, setShouldRenderModal] = useState(false);
  const [modalAnimating, setModalAnimating] = useState(false);
  const [mapSelectMode, setMapSelectMode] = useState(null); // 'start', 'target', or null

  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isTargetOpen, setIsTargetOpen] = useState(false);
  const startSelectRef = useRef(null);
  const targetSelectRef = useRef(null);

  const animationRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (startSelectRef.current && !startSelectRef.current.contains(e.target)) {
        setIsStartOpen(false);
      }
      if (targetSelectRef.current && !targetSelectRef.current.contains(e.target)) {
        setIsTargetOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Clear animation interval on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  // Update path dynamically when algorithm changes if results are present (without restarting animation)
  useEffect(() => {
    if (results) {
      const activeResult = algorithm === 'astar' ? results.astar : results.dijkstra;
      const sequence = activeResult.pathResult.nodeSequence || [];
      setPath(sequence);
    }
  }, [algorithm, results]);

  // Clear path results dynamically when selected dropdown locations change
  useEffect(() => {
    if (results) {
      if (animationRef.current) clearInterval(animationRef.current);
      setResults(null);
      setPath([]);
      setBoatIndex(-1);
      setIsRunning(false);
      setLogs([{ text: "Parameters changed. Click Optimize Route to update path.", detail: "Ready to run new search path comparison." }]);
      setSelectedLog(null);
    }
  }, [sourceId, targetId]);

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
    }, 3000);
  };

  const getFilteredLogs = () => {
    return logs.filter(log => {
      if (algorithm === 'compare') return true;
      if (algorithm === 'dijkstra') {
        return !log.text.includes('[A* Heuristic]') && !log.text.includes('[Optimization Analysis]');
      }
      if (algorithm === 'astar') {
        return !log.text.includes('[Dijkstra Search]') && !log.text.includes('[Optimization Analysis]');
      }
      return true;
    });
  };

  const copyLogsToClipboard = () => {
    const activeLogs = getFilteredLogs();
    if (activeLogs.length === 0) return;
    const text = activeLogs.map((l, idx) => `[${idx + 1}] ${l.text}\nDetail: ${l.detail}`).join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      showToast("Logs copied to clipboard!");
    });
  };

  const handleNodeClick = (nodeId) => {
    if (mapSelectMode === 'start') {
      if (nodeId.toString() === targetId.toString()) {
        showToast("Start location cannot be the same as target location!");
        return;
      }
      setSourceId(nodeId.toString());
      setMapSelectMode(null);
      showToast(`Start location updated to Node ${nodeId}!`);
    } else if (mapSelectMode === 'target') {
      if (nodeId.toString() === sourceId.toString()) {
        showToast("Target location cannot be the same as start location!");
        return;
      }
      setTargetId(nodeId.toString());
      setMapSelectMode(null);
      showToast(`Target location updated to Node ${nodeId}!`);
    }
  };

  // Load nodes and edges on mount
  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      setError(null);
      const nodesData = await api.listRouteNodes();
      setNodes(nodesData);

      // Set default source and target if available
      if (nodesData.length > 0) {
        const hq = nodesData.find(n => n.nodeType === 'HQ') || nodesData[0];
        const camp = nodesData.find(n => n.nodeType === 'RESCUE_CAMP') || nodesData[nodesData.length - 1];
        setSourceId(hq.id.toString());
        setTargetId(camp.id.toString());
      }

      // Fetch edges for each node in parallel
      const edgeList = [];
      const edgeTracker = new Set();

      await Promise.all(
        nodesData.map(async (node) => {
          try {
            const neighbors = await fetch(`http://localhost:8080/api/v1/routes/nodes/${node.id}/neighbors`).then(res => res.json());
            neighbors.forEach(n => {
              const pairKey = [node.id, n.nodeId].sort().join('-');
              if (!edgeTracker.has(pairKey)) {
                edgeTracker.add(pairKey);
                edgeList.push({
                  sourceId: node.id,
                  targetId: n.nodeId,
                  distanceKm: n.distanceKm,
                  travelTimeMins: n.travelTimeMins,
                  blocked: n.blocked
                });
              }
            });
          } catch (e) {
            console.error(`Failed to fetch neighbors for node ${node.id}`, e);
          }
        })
      );
      setEdges(edgeList);
    } catch (err) {
      console.error("Failed to load road network nodes", err);
      setError("Failed to load road network from the backend database server.");
    } finally {
      setLoading(false);
    }
  };

  // Translate Node Latitude/Longitude to Responsive SVG screen space
  const getScaledCoordinates = (nodeId) => {
    const layout = {
      "1": { x: 100, y: 150 }, // Colombo HQ
      "2": { x: 630, y: 290 }, // Galle Rescue Camp
      "3": { x: 770, y: 290 }, // Matara Rescue Camp
      "4": { x: 810, y: 200 }, // Hambantota Camp
      "5": { x: 520, y: 220 }, // Ratnapura Junction
      "6": { x: 90, y: 320 },  // Camp Echo
      "7": { x: 195, y: 340 }, // Camp Foxtrot
      "8": { x: 600, y: 340 }, // Camp Golf
      "9": { x: 740, y: 340 }, // Camp Hotel
      "10": { x: 550, y: 160 }, // Camp India
      "11": { x: 380, y: 90 },  // Camp Juliet
      "12": { x: 80, y: 60 },   // Camp Kilo
      "13": { x: 230, y: 140 }, // Camp Lima
      "14": { x: 170, y: 200 }, // Junction - Maharagama
      "15": { x: 130, y: 250 }, // Junction - Piliyandala
      "16": { x: 280, y: 280 }, // Junction - Bandaragama
      "17": { x: 350, y: 320 }, // Junction - Dodangoda
      "18": { x: 480, y: 330 }, // Junction - Welipenna
      "19": { x: 190, y: 80 },  // Junction - Kadawatha
      "20": { x: 230, y: 220 }  // Junction - Kottawa
    };
    return layout[nodeId.toString()] || { x: 425, y: 205 };
  };

  const calculateRoute = async () => {
    if (!sourceId || !targetId) {
      showToast("Please select both source and target camps!");
      return;
    }
    if (sourceId === targetId) {
      showToast("Source and target locations must be different!");
      return;
    }

    if (animationRef.current) clearInterval(animationRef.current);
    setIsRunning(true);
    setBoatIndex(-1);
    setPath([]);
    setResults(null);

    const startNodeName = nodes.find(n => n.id.toString() === sourceId)?.name || 'Source';
    const endNodeName = nodes.find(n => n.id.toString() === targetId)?.name || 'Target';

    setLogs([
      {
        text: `Initiating routing query from ${startNodeName} to ${endNodeName}...`,
        detail: `[System Route Query]\n- Source Node ID: ${sourceId} (${startNodeName})\n- Target Node ID: ${targetId} (${endNodeName})\n- Executing backend optimization queries.`
      }
    ]);

    try {
      // Fetch optimization comparison data
      const queryBody = { sourceId: parseInt(sourceId), targetId: parseInt(targetId) };
      const data = await api.optimizeRoute(queryBody);
      
      // Update logs comparison detail
      const newLogs = [];
      newLogs.push({
        text: `[Dijkstra Search] Shortest path computed in ${data.dijkstra.pathResult.executionTimeNanos / 1000} μs.`,
        detail: `[Dijkstra Uniform Search Results]\n- Path Distance: ${data.dijkstra.pathResult.totalDistanceKm} Km\n- Est. Travel Time: ${data.dijkstra.pathResult.totalTravelTimeMins} mins\n- Graph Nodes Traversed: ${data.dijkstra.pathResult.nodesExplored} nodes explored\n- Route Node Sequence: ${data.dijkstra.nodeNames.join(" → ")}`
      });
      newLogs.push({
        text: `[A* Heuristic] Shortest path computed in ${data.astar.pathResult.executionTimeNanos / 1000} μs.`,
        detail: `[A* Goal-Directed Heuristic Results]\n- Heuristic Mode: Geographic Haversine Distance\n- Path Distance: ${data.astar.pathResult.totalDistanceKm} Km\n- Est. Travel Time: ${data.astar.pathResult.totalTravelTimeMins} mins\n- Graph Nodes Traversed: ${data.astar.pathResult.nodesExplored} nodes explored\n- Route Node Sequence: ${data.astar.nodeNames.join(" → ")}`
      });
      const exploredDiff = data.dijkstra.pathResult.nodesExplored - data.astar.pathResult.nodesExplored;
      newLogs.push({
        text: `[Optimization Analysis] A* explored ${exploredDiff} fewer nodes than Dijkstra.`,
        detail: `[Search Optimization Summary]\n- Nodes Explored Delta: A* reduced exploration tree by ${exploredDiff} nodes.\n- Optimal Path Equivalence: ${data.samePath ? "Confirmed (Both generated identical paths)" : "Alternative path found"}\n- Efficiency gain: ${exploredDiff > 0 ? `${Math.round((exploredDiff / data.dijkstra.pathResult.nodesExplored) * 100)}% reduction in queue workload.` : "Equal exploration node bounds."}`
      });

      setLogs(prev => [...prev, ...newLogs]);
      setSelectedLog(newLogs[0]);
      
      const activeResult = algorithm === 'astar' ? data.astar : data.dijkstra;
      const sequence = activeResult.pathResult.nodeSequence || [];
      setPath(sequence);
      setResults(data);

      if (sequence.length > 0) {
        let idx = 0;
        setBoatIndex(0);
        setIsRunning(true);
        animationRef.current = setInterval(() => {
          setBoatIndex(idx);
          if (idx >= sequence.length - 1) {
            clearInterval(animationRef.current);
            setIsRunning(false);
            setTimeout(() => {
              setBoatIndex(-1);
            }, 600);
          } else {
            idx++;
          }
        }, 500);
      }

    } catch (err) {
      console.error(err);
      setLogs(prev => [
        ...prev,
        {
          text: "API error. Node query failed.",
          detail: `Backend controller returned error state:\n${err.message}`
        }
      ]);
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (animationRef.current) clearInterval(animationRef.current);
    setIsRunning(false);
    setResults(null);
    setPath([]);
    setBoatIndex(-1);
    setLogs([{ text: "System reset to standby.", detail: "Choose start and destination camps to calculate the optimized route." }]);
    setSelectedLog(null);
  };

  const filteredLogs = getFilteredLogs();

  const dijkstraPath = results ? (results.dijkstra.pathResult.nodeSequence || []) : [];
  const astarPath = results ? (results.astar.pathResult.nodeSequence || []) : [];

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
            onClick={() => setAlgorithm('compare')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              algorithm === 'compare' ? 'bg-sky-600 text-slate-100 font-bold shadow' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Compare Both
          </button>
          <button
            onClick={() => setAlgorithm('dijkstra')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              algorithm === 'dijkstra' ? 'bg-sky-600 text-slate-100 font-bold shadow' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Dijkstra Only
          </button>
          <button
            onClick={() => setAlgorithm('astar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              algorithm === 'astar' ? 'bg-sky-600 text-slate-100 font-bold shadow' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            A* Heuristic Only
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400 font-medium">Connecting to active backend database...</span>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
          <ShieldAlert className="w-12 h-12 text-rose-500 animate-pulse" />
          <h3 className="font-bold text-slate-200">Database Connection Offline</h3>
          <p className="text-xs text-slate-400 max-w-md">{error}</p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 my-4 overflow-hidden">
          {/* Map Canvas */}
          <div className="lg:col-span-2 flex flex-col justify-between p-4 bg-slate-950 border border-slate-850 rounded-xl overflow-hidden relative">
            <RainEffect density={35} />

            {/* Drifting Clouds */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              <svg className="absolute w-24 h-12 animate-cloud-drift-slow top-2" viewBox="0 0 100 50">
                <path d="M20 35a10 10 0 0 1 10-10 12 12 0 0 1 22-8 15 15 0 0 1 28 3 10 10 0 0 1 10 10 10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.08" />
              </svg>
              <svg className="absolute w-32 h-16 animate-cloud-drift-fast top-8" viewBox="0 0 100 50">
                <path d="M20 35a10 10 0 0 1 10-10 12 12 0 0 1 22-8 15 15 0 0 1 28 3 10 10 0 0 1 10 10 10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" opacity="0.06" />
              </svg>
            </div>

            {/* Direct Map Selection Controls Overlay */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button
                onClick={() => setMapSelectMode(mapSelectMode === 'start' ? null : 'start')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold font-mono transition-all duration-150 active:scale-95 shadow-md ${
                  mapSelectMode === 'start'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full bg-emerald-500 ${mapSelectMode === 'start' ? 'animate-ping' : ''}`}></span>
                Set Start
              </button>
              <button
                onClick={() => setMapSelectMode(mapSelectMode === 'target' ? null : 'target')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold font-mono transition-all duration-150 active:scale-95 shadow-md ${
                  mapSelectMode === 'target'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full bg-rose-500 ${mapSelectMode === 'target' ? 'animate-ping' : ''}`}></span>
                Set Target
              </button>
            </div>

            {/* SVG Map */}
            <div className="flex-1 bg-slate-900/40 rounded-lg relative overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 850 370" className="w-full h-full z-10">
                {/* Outgoing connection lines */}
                {edges.map((edge, idx) => {
                  const u = getScaledCoordinates(edge.sourceId);
                  const v = getScaledCoordinates(edge.targetId);
                  return (
                    <g key={`edge-${idx}`}>
                      <line
                        x1={u.x}
                        y1={u.y}
                        x2={v.x}
                        y2={v.y}
                        stroke={edge.blocked ? "#EF4444" : "#1E293B"}
                        strokeWidth={edge.blocked ? "2.5" : "3.5"}
                        strokeDasharray={edge.blocked ? "2 3" : "4 4"}
                        opacity={edge.blocked ? 0.7 : 1}
                      />
                    </g>
                  );
                })}

                {/* Optimal path lines */}
                {algorithm === 'dijkstra' && path.length > 1 && path.map((nodeId, idx) => {
                  if (idx === path.length - 1) return null;
                  const nextId = path[idx + 1];
                  const u = getScaledCoordinates(nodeId);
                  const v = getScaledCoordinates(nextId);
                  return (
                    <line
                      key={`path-dijkstra-${idx}`}
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke="#22D3EE"
                      strokeWidth="5"
                      className="transition-all duration-300 ease-in-out drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                    />
                  );
                })}

                {algorithm === 'astar' && path.length > 1 && path.map((nodeId, idx) => {
                  if (idx === path.length - 1) return null;
                  const nextId = path[idx + 1];
                  const u = getScaledCoordinates(nodeId);
                  const v = getScaledCoordinates(nextId);
                  return (
                    <line
                      key={`path-astar-${idx}`}
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke="#10B981"
                      strokeWidth="5"
                      className="transition-all duration-300 ease-in-out drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                    />
                  );
                })}

                {algorithm === 'compare' && results && (() => {
                  return (
                    <>
                      {/* Dijkstra Path in Purple */}
                      {dijkstraPath.length > 1 && dijkstraPath.map((nodeId, idx) => {
                        if (idx === dijkstraPath.length - 1) return null;
                        const nextId = dijkstraPath[idx + 1];
                        const u = getScaledCoordinates(nodeId);
                        const v = getScaledCoordinates(nextId);
                        return (
                          <line
                            key={`compare-dijkstra-${idx}`}
                            x1={u.x}
                            y1={u.y}
                            x2={v.x}
                            y2={v.y}
                            stroke="#A855F7"
                            strokeWidth="6"
                            className="transition-all duration-300 ease-in-out opacity-85"
                          />
                        );
                      })}
                      {/* A* Path overlay in slightly thinner Green */}
                      {astarPath.length > 1 && astarPath.map((nodeId, idx) => {
                        if (idx === astarPath.length - 1) return null;
                        const nextId = astarPath[idx + 1];
                        const u = getScaledCoordinates(nodeId);
                        const v = getScaledCoordinates(nextId);
                        return (
                          <line
                            key={`compare-astar-${idx}`}
                            x1={u.x}
                            y1={u.y}
                            x2={v.x}
                            y2={v.y}
                            stroke="#10B981"
                            strokeWidth="3.5"
                            className="transition-all duration-300 ease-in-out drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                          />
                        );
                      })}
                    </>
                  );
                })()}

                {/* Nodes */}
                {nodes.map(n => {
                  const coords = getScaledCoordinates(n.id);
                  const isSource = sourceId.toString() === n.id.toString();
                  const isTarget = targetId.toString() === n.id.toString();
                  const isPartOfPath = path.includes(n.id);

                  let fill = "#1E293B";
                  let stroke = "#475569";
                  if (isSource) { fill = "#10B981"; stroke = "#34D399"; }
                  else if (isTarget) { fill = "#EF4444"; stroke = "#F87171"; }
                  else if (isPartOfPath) { fill = "#0891B2"; stroke = "#22D3EE"; }

                  return (
                    <g 
                      key={n.id} 
                      transform={`translate(${coords.x}, ${coords.y})`}
                      onClick={() => handleNodeClick(n.id)}
                      className={`transition-all duration-200 ${
                        mapSelectMode ? 'cursor-pointer hover:brightness-125' : ''
                      }`}
                    >
                      {isTarget && (
                        <g transform="translate(-12, -34)">
                          <SurvivorVisual width={24} height={24} />
                        </g>
                      )}
                      <circle
                        r={n.nodeType === 'HQ' ? 18 : 13}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="3.5"
                        className={`transition-all duration-200 ${
                          mapSelectMode 
                            ? 'hover:scale-125 hover:stroke-white cursor-pointer' 
                            : 'hover:scale-110 cursor-pointer'
                        }`}
                      />
                      <text
                        y="4"
                        fill="#F1F5F9"
                        fontSize="9"
                        fontWeight="black"
                        textAnchor="middle"
                        className="pointer-events-none"
                      >
                        {n.nodeType === 'HQ' ? 'HQ' : n.id}
                      </text>
                      {(() => {
                        return (
                          <text
                            y="26"
                            fill={isSource || isTarget ? "#F1F5F9" : "#94A3B8"}
                            fontSize="9"
                            fontWeight={isSource || isTarget ? "extrabold" : "bold"}
                            textAnchor="middle"
                            className="drop-shadow-lg pointer-events-none transition-all duration-150"
                          >
                            {n.name}
                          </text>
                        );
                      })()}
                    </g>
                  );
                })}
 
                {/* Moving Boat overlay */}
                {boatIndex >= 0 && path && path.length > 0 && path[boatIndex] !== undefined && (() => {
                  const nodeCoords = getScaledCoordinates(path[boatIndex]);
                  return (
                    <g 
                      transform={`translate(${nodeCoords.x}, ${nodeCoords.y - 4})`} 
                      style={{ transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                      className="z-30"
                    >
                      <g className="animate-boat-pitch">
                        <g transform="translate(-16, -16) scale(1.3)">
                          {/* Boat shapes drawn directly in native coordinates */}
                          <path d="M3 15 L21 15 L17 19 H7 Z" fill="#0284c7" stroke="#22d3ee" strokeWidth="1" />
                          <line x1="12" y1="15" x2="12" y2="3.5" stroke="#f8fafc" strokeWidth="1.5" />
                          <path d="M11 4.5 L4.5 14 H11 Z" fill="#f8fafc" fillOpacity="0.9" stroke="#22d3ee" strokeWidth="0.5" />
                          <path d="M13 5.5 L19.5 14 H13 Z" fill="#f8fafc" fillOpacity="0.8" stroke="#22d3ee" strokeWidth="0.5" />
                          <path d="M12 3.5 L15.5 4.5 L12 5.5" fill="#f97316" />
                        </g>
                      </g>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Right logs panel */}
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
              </div>
            </div>
            
            {/* Half-Half Container for Logs & Decision Analyzer */}
            <div className="flex-grow flex flex-col gap-3 h-full min-h-0">
              {/* Search Logic Logs */}
              <div className="h-[48%] overflow-y-auto flex flex-col gap-1.5 p-3 bg-slate-900/50 rounded-lg border border-slate-850/50 min-h-0">
                {filteredLogs.map((log, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedLog(log)}
                    className={`border-b border-slate-850/50 pb-2 last:border-0 flex items-center justify-between gap-2 cursor-pointer px-2.5 py-1.5 rounded transition-colors duration-150 shrink-0 ${
                      selectedLog === log ? 'text-sky-400 font-bold bg-slate-800/80 shadow shadow-sky-950/20' : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
                    }`}
                  >
                    <span className="text-[11px] leading-relaxed">
                      <span className="text-sky-500 font-bold font-mono mr-1">[{idx + 1}]</span> {log.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dedicated Decision Analysis Box */}
              <div className="h-[48%] p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-y-auto min-h-0">
                <h4 className="text-[9px] uppercase font-bold tracking-wider text-sky-400 mb-1.5 flex items-center gap-1.5 shrink-0">
                  <Info className="w-3 text-sky-400" />
                  Routing decision analyzer
                </h4>
                <p className="text-[10.5px] text-slate-300 font-mono leading-relaxed whitespace-pre-line">
                  {selectedLog ? selectedLog.detail : "Click any step above to inspect its detailed evaluation metrics and pathfinding weights."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel */}
      {!loading && !error && (
        <div className="flex flex-col gap-3 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-950 p-4 border border-slate-850 rounded-xl">
            {/* Start Node Custom Dropdown */}
            <div className="flex flex-col gap-1 relative" ref={startSelectRef}>
              <label className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Start Location (Source)</label>
              <button
                onClick={() => !isRunning && setIsStartOpen(!isStartOpen)}
                disabled={isRunning}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold flex items-center justify-between text-left text-slate-100 hover:border-slate-700 transition-colors focus:outline-none disabled:opacity-50"
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  {nodes.find(n => n.id.toString() === sourceId)?.name || 'Select Start'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
              {isStartOpen && (
                <div className="absolute left-0 right-0 bottom-full mb-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto py-1">
                  {nodes.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.id.toString() === targetId.toString()) {
                          showToast("Start location cannot be the same as target location!");
                          return;
                        }
                        setSourceId(n.id.toString());
                        setIsStartOpen(false);
                      }}
                      className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        sourceId === n.id.toString()
                          ? 'bg-sky-500/20 text-sky-400 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                      }`}
                    >
                      {n.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Target Node Custom Dropdown */}
            <div className="flex flex-col gap-1 relative" ref={targetSelectRef}>
              <label className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Target Location (Destination)</label>
              <button
                onClick={() => !isRunning && setIsTargetOpen(!isTargetOpen)}
                disabled={isRunning}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold flex items-center justify-between text-left text-slate-100 hover:border-slate-700 transition-colors focus:outline-none disabled:opacity-50"
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  {nodes.find(n => n.id.toString() === targetId)?.name || 'Select Target'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
              {isTargetOpen && (
                <div className="absolute left-0 right-0 bottom-full mb-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto py-1">
                  {nodes.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.id.toString() === sourceId.toString()) {
                          showToast("Target location cannot be the same as start location!");
                          return;
                        }
                        setTargetId(n.id.toString());
                        setIsTargetOpen(false);
                      }}
                      className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        targetId === n.id.toString()
                          ? 'bg-sky-500/20 text-sky-400 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                      }`}
                    >
                      {n.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 h-full items-end mt-2 md:mt-0">
              <button
                onClick={calculateRoute}
                disabled={isRunning}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-slate-950 font-bold py-2 px-4 rounded-xl transition-all shadow-lg text-xs"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                Optimize Route
              </button>
              
              <button
                onClick={handleReset}
                disabled={isRunning}
                className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 p-2.5 rounded-xl transition-all"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Compare Stats metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-3.5 border border-slate-850 rounded-xl text-center text-xs shrink-0">
            <div className="border-r border-slate-850 last:border-r-0">
              <div className="text-slate-500 font-bold text-[9px] uppercase">Optimal Distance</div>
              <div className="text-emerald-400 font-extrabold text-sm mt-0.5">
                {results ? `${results.dijkstra.pathResult.totalDistanceKm} Km` : '—'}
              </div>
            </div>
            <div className="border-r border-slate-850 last:border-r-0">
              <div className="text-slate-500 font-bold text-[9px] uppercase">Travel Time</div>
              <div className="text-cyan-450 font-extrabold text-sm mt-0.5">
                {results ? `${results.dijkstra.pathResult.totalTravelTimeMins} mins` : '—'}
              </div>
            </div>
            <div className="border-r border-slate-850 last:border-r-0">
              <div className="text-slate-500 font-bold text-[9px] uppercase">Dijkstra Explored</div>
              <div className="text-amber-500 font-extrabold text-sm mt-0.5">
                {results ? `${results.dijkstra.pathResult.nodesExplored} nodes` : '—'}
              </div>
            </div>
            <div>
              <div className="text-slate-500 font-bold text-[9px] uppercase">A* Explored</div>
              <div className="text-sky-400 font-extrabold text-sm mt-0.5">
                {results ? `${results.astar.pathResult.nodesExplored} nodes` : '—'}
              </div>
            </div>
          </div>
        </div>
      )}

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
                <Compass className="w-5 h-5 text-sky-400" />
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
                This module helps disaster management teams compare pathfinding efficiency between <strong>Dijkstra's Algorithm</strong> and <strong>A* Search</strong> using real-world coordinates from the backend database. In flood emergency scenarios, identifying the shortest safe travel path from Command Headquarters (HQ) or starting depots to rescue camps is critical to establish active rescue supply lines.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Interactive Controls</h4>
              <ul className="list-disc pl-4 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-slate-100">Custom Dropdown Selectors:</strong> Use the interactive dropdown menus at the bottom to choose starting sources and target camps. Selections automatically clear old results.
                </li>
                <li>
                  <strong className="text-slate-100">Direct Map Select ("Set Start" / "Set Target"):</strong> Toggle these overlay buttons at the top-right of the map, then click any node directly on the map to set it as a coordinate. Selection modes automatically reset upon click.
                </li>
                <li>
                  <strong className="text-slate-100">Algorithm Filter (Top Right):</strong> Switch between <em>Dijkstra Only</em> (uniform exploration), <em>A* Heuristic Only</em> (goal-directed formulation using Haversine heuristics), or <em>Compare Both</em>.
                </li>
                <li>
                  <strong className="text-slate-100">Optimize Route:</strong> Submits path queries to the Spring Boot REST server to calculate optimal paths.
                </li>
                <li>
                  <strong className="text-slate-100">Reset Button:</strong> Clears active route lines, frontier logs, and returns the panel to standby.
                </li>
                <li>
                  <strong className="text-slate-100">Copy Logs:</strong> Copies currently visible execution steps and comparative logs matching your selected filter.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Map Visual Indicators</h4>
              <ul className="list-disc pl-4 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-slate-100">Node Circles:</strong> Green represents the start, red represents the target with an orange survivor visual, and colored circles indicate nodes on the computed path.
                </li>
                <li>
                  <strong className="text-slate-100">Compare Path Overlays:</strong> Displays both calculated routes simultaneously in Compare mode—Dijkstra's path is drawn in <strong>glowing purple</strong> and A*'s path in a <strong>thinner green line</strong> to expose detours.
                </li>
                <li>
                  <strong className="text-slate-100">Grey Dashed Lines:</strong> Represents normal, open roads.
                </li>
                <li>
                  <strong className="text-slate-100">Red Dashed Lines:</strong> Represents blocked roads (skipped by pathfinders) loaded dynamically from the database.
                </li>
                <li>
                  <strong className="text-slate-100">Sailboat Marker:</strong> Animates the path traversal from the start node to the target camp.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Analytics & Logs Panels</h4>
              <ul className="list-disc pl-4 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-slate-100">Search Logic Logs:</strong> Lists execution speeds and route nodes. Clicking any log opens its metrics in the analyzer.
                </li>
                <li>
                  <strong className="text-slate-100">Routing Decision Analyzer:</strong> Displays granular comparisons, workload reduction percentages, and path equivalence tests.
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
