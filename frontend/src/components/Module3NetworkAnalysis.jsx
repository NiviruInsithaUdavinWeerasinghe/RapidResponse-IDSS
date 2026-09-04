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
  const [isInstantMode, setIsInstantMode] = useState(false);
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
      "4": { x: 810, y: 220 }, // Hambantota Camp (C) -> Lowered slightly
      "5": { x: 485, y: 225 }, // Ratnapura Junction (JA) -> Shifted left & up
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
      "16": { x: 240, y: 258 }, // Junction - Bandaragama (JD) -> Shifted up
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

const INITIAL_NODES = [
  { id: 1, name: "Colombo HQ", nodeType: "HQ", x: 100, y: 150 },
  { id: 2, name: "Galle Rescue Camp (A)", nodeType: "RESCUE_CAMP", x: 630, y: 210 },
  { id: 3, name: "Matara Rescue Camp (B)", nodeType: "RESCUE_CAMP", x: 770, y: 295 },
  { id: 4, name: "Hambantota Camp (C)", nodeType: "RESCUE_CAMP", x: 810, y: 220 },
  { id: 5, name: "Ratnapura Junction (JA)", nodeType: "INTERSECTION", x: 485, y: 225 },
  { id: 6, name: "Camp Echo (D)", nodeType: "RESCUE_CAMP", x: 90, y: 350 },
  { id: 7, name: "Camp Foxtrot (E)", nodeType: "RESCUE_CAMP", x: 195, y: 360 },
  { id: 8, name: "Camp Golf (F)", nodeType: "RESCUE_CAMP", x: 600, y: 355 },
  { id: 9, name: "Camp Hotel (G)", nodeType: "RESCUE_CAMP", x: 740, y: 355 },
  { id: 10, name: "Camp India (H)", nodeType: "RESCUE_CAMP", x: 550, y: 145 },
  { id: 11, name: "Camp Juliet (I)", nodeType: "RESCUE_CAMP", x: 420, y: 60 },
  { id: 12, name: "Camp Kilo (J)", nodeType: "RESCUE_CAMP", x: 80, y: 60 },
  { id: 13, name: "Camp Lima (K)", nodeType: "RESCUE_CAMP", x: 230, y: 120 },
  { id: 14, name: "Junction Maharagama (JB)", nodeType: "INTERSECTION", x: 170, y: 150 },
  { id: 15, name: "Junction Piliyandala (JC)", nodeType: "INTERSECTION", x: 130, y: 215 },
  { id: 16, name: "Junction Bandaragama (JD)", nodeType: "INTERSECTION", x: 240, y: 258 },
  { id: 17, name: "Junction Dodangoda (JE)", nodeType: "INTERSECTION", x: 350, y: 345 },
  { id: 18, name: "Junction Welipenna (JF)", nodeType: "INTERSECTION", x: 480, y: 385 },
  { id: 19, name: "Junction Kadawatha (JG)", nodeType: "INTERSECTION", x: 190, y: 75 },
  { id: 20, name: "Junction Kottawa (JH)", nodeType: "INTERSECTION", x: 285, y: 135 }
];

const INITIAL_EDGES = [
  { id: 1, sourceId: 1, targetId: 19, u: 1, v: 19, distanceKm: 8.5, cost: 8.5, blocked: true },
  { id: 2, sourceId: 1, targetId: 14, u: 1, v: 14, distanceKm: 12.3, cost: 12.3, blocked: false },
  { id: 3, sourceId: 1, targetId: 13, u: 1, v: 13, distanceKm: 14.0, cost: 14.0, blocked: false },
  { id: 4, sourceId: 1, targetId: 12, u: 1, v: 12, distanceKm: 35.2, cost: 35.2, blocked: false },
  { id: 5, sourceId: 19, targetId: 12, u: 19, v: 12, distanceKm: 28.0, cost: 28.0, blocked: false },
  { id: 6, sourceId: 19, targetId: 13, u: 19, v: 13, distanceKm: 10.5, cost: 10.5, blocked: false },
  { id: 7, sourceId: 13, targetId: 11, u: 13, v: 11, distanceKm: 26.0, cost: 26.0, blocked: true },
  { id: 8, sourceId: 13, targetId: 20, u: 13, v: 20, distanceKm: 9.8, cost: 9.8, blocked: false },
  { id: 9, sourceId: 13, targetId: 14, u: 13, v: 14, distanceKm: 7.5, cost: 7.5, blocked: false },
  { id: 10, sourceId: 20, targetId: 14, u: 20, v: 14, distanceKm: 5.2, cost: 5.2, blocked: true },
  { id: 11, sourceId: 20, targetId: 15, u: 20, v: 15, distanceKm: 8.0, cost: 8.0, blocked: false },
  { id: 12, sourceId: 20, targetId: 17, u: 20, v: 17, distanceKm: 45.0, cost: 45.0, blocked: true },
  { id: 13, sourceId: 14, targetId: 15, u: 14, v: 15, distanceKm: 6.5, cost: 6.5, blocked: true },
  { id: 14, sourceId: 14, targetId: 2, u: 14, v: 2, distanceKm: 9.0, cost: 9.0, blocked: false },
  { id: 15, sourceId: 15, targetId: 2, u: 15, v: 2, distanceKm: 7.8, cost: 7.8, blocked: true },
  { id: 16, sourceId: 15, targetId: 3, u: 15, v: 3, distanceKm: 10.5, cost: 10.5, blocked: false },
  { id: 17, sourceId: 15, targetId: 16, u: 15, v: 16, distanceKm: 15.0, cost: 15.0, blocked: false },
  { id: 20, sourceId: 3, targetId: 16, u: 3, v: 16, distanceKm: 18.0, cost: 18.0, blocked: false },
  { id: 21, sourceId: 16, targetId: 4, u: 16, v: 4, distanceKm: 5.5, cost: 5.5, blocked: true },
  { id: 22, sourceId: 16, targetId: 17, u: 16, v: 17, distanceKm: 22.0, cost: 22.0, blocked: true },
  { id: 23, sourceId: 4, targetId: 10, u: 4, v: 10, distanceKm: 40.0, cost: 40.0, blocked: true },
  { id: 24, sourceId: 4, targetId: 11, u: 4, v: 11, distanceKm: 35.0, cost: 35.0, blocked: false },
  { id: 25, sourceId: 5, targetId: 6, u: 5, v: 6, distanceKm: 13.0, cost: 13.0, blocked: false },
  { id: 26, sourceId: 5, targetId: 17, u: 5, v: 17, distanceKm: 10.0, cost: 10.0, blocked: false },
  { id: 27, sourceId: 6, targetId: 7, u: 6, v: 7, distanceKm: 5.5, cost: 5.5, blocked: false },
  { id: 28, sourceId: 7, targetId: 17, u: 7, v: 17, distanceKm: 12.0, cost: 12.0, blocked: true },
  { id: 29, sourceId: 17, targetId: 18, u: 17, v: 18, distanceKm: 20.0, cost: 20.0, blocked: false },
  { id: 30, sourceId: 17, targetId: 8, u: 17, v: 8, distanceKm: 60.0, cost: 60.0, blocked: false },
  { id: 31, sourceId: 18, targetId: 8, u: 18, v: 8, distanceKm: 42.0, cost: 42.0, blocked: false },
  { id: 32, sourceId: 8, targetId: 9, u: 8, v: 9, distanceKm: 45.0, cost: 45.0, blocked: true },
  { id: 321, sourceId: 10, targetId: 5, u: 10, v: 5, distanceKm: 15.0, cost: 15.0, blocked: false },
  { id: 3211, sourceId: 10, targetId: 11, u: 10, v: 11, distanceKm: 25.0, cost: 25.0, blocked: false },
  { id: 3212, sourceId: 3, targetId: 9, u: 3, v: 9, distanceKm: 12.0, cost: 12.0, blocked: false },
  { id: 3213, sourceId: 3, targetId: 8, u: 3, v: 8, distanceKm: 35.0, cost: 35.0, blocked: false }
];

  const loadNetworkAndStatus = async (isSilent = false) => {
    try {
      if (!isSilent) {
        setLoading(true);
      }
      setError(null);

      // Fetch static nodes list and merge localStorage CRUD nodes
      let activeNodes;
      try {
        activeNodes = await api.listRouteNodes();
      } catch (err) {
        console.warn("Backend REST API offline. Using seed nodes fallback.", err);
        activeNodes = INITIAL_NODES;
      }

      try {
        const storedNodes = localStorage.getItem('sdr_crud_nodes');
        if (storedNodes) {
          const parsed = JSON.parse(storedNodes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            activeNodes = parsed;
          }
        }
      } catch (e) {
        console.warn("Failed loading stored nodes in Module 3", e);
      }
      setNodes(activeNodes);

      // Fetch all edges and merge localStorage CRUD edges
      let edgesData;
      try {
        edgesData = await api.listEdges();
      } catch (err) {
        console.warn("Backend REST API offline. Using seed edges fallback.", err);
        edgesData = INITIAL_EDGES;
      }

      const edgeTracker = new Set();
      const edgeList = [];

      edgesData.forEach(e => {
        const sId = e.sourceId ?? e.u;
        const tId = e.targetId ?? e.v;
        if (sId && tId) {
          const pairKey = [sId, tId].sort().join('-');
          if (!edgeTracker.has(pairKey)) {
            edgeTracker.add(pairKey);
            edgeList.push({
              id: e.id || pairKey,
              u: sId,
              v: tId,
              cost: e.distanceKm ?? e.cost ?? 10.0,
              blocked: Boolean(e.blocked)
            });
          }
        }
      });

      try {
        const storedEdges = localStorage.getItem('sdr_crud_edges');
        if (storedEdges) {
          const parsed = JSON.parse(storedEdges);
          if (Array.isArray(parsed)) {
            parsed.forEach(e => {
              const sId = e.sourceId ?? e.u;
              const tId = e.targetId ?? e.v;
              if (sId && tId) {
                const pairKey = [sId, tId].sort().join('-');
                if (!edgeTracker.has(pairKey)) {
                  edgeTracker.add(pairKey);
                  edgeList.push({
                    id: e.id || pairKey,
                    u: sId,
                    v: tId,
                    cost: e.distanceKm ?? e.cost ?? 10.0,
                    blocked: Boolean(e.blocked)
                  });
                }
              }
            });
          }
        }
      } catch (err) {
        console.warn("Failed merging stored edges in Module 3", err);
      }

      setEdges(edgeList);

      // Fetch real-time reachability and connected components from Spring Boot API or compute locally
      let reachability;
      try {
        reachability = await api.getReachability();
      } catch (e) {
        console.warn("Backend reachability API offline, calculating locally", e);
        const connectedNodeIds = new Set();
        edgeList.forEach(e => {
          if (!e.blocked) {
            connectedNodeIds.add(Number(e.u));
            connectedNodeIds.add(Number(e.v));
          }
        });
        const isolatedNodes = activeNodes.filter(n => n.nodeType === 'RESCUE_CAMP' && !connectedNodeIds.has(Number(n.id)));
        reachability = { isolatedCamps: isolatedNodes };
      }
      setCutOffCamps((reachability.isolatedCamps || []).map(c => c.name));

      let comps;
      try {
        comps = await api.getComponents();
      } catch (e) {
        console.warn("Backend components API offline, calculating locally", e);
        const parent = new Map();
        activeNodes.forEach(n => parent.set(Number(n.id), Number(n.id)));
        const find = (i) => {
          let root = i;
          while (parent.has(root) && parent.get(root) !== root) {
            root = parent.get(root);
          }
          return root;
        };
        const union = (i, j) => {
          const rootI = find(i);
          const rootJ = find(j);
          if (rootI !== rootJ) parent.set(rootI, rootJ);
        };
        edgeList.forEach(e => {
          if (!e.blocked) union(Number(e.u), Number(e.v));
        });
        const compMap = new Map();
        activeNodes.forEach(n => {
          const root = find(Number(n.id));
          if (!compMap.has(root)) compMap.set(root, []);
          compMap.get(root).push(n.name);
        });
        comps = { components: Array.from(compMap.values()) };
      }
      setComponents(comps.components || []);

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

  const resetAll = () => {
    stopSimulation();
    setMstEdges([]);
    setMstResult(null);
    setCurrentEdgeIndex(-1);
    setLogs([]);
    setSelectedLog(null);
    showToast("Simulation visuals reset.");
  };

  const handleUnblockAllRoads = async () => {
    stopSimulation();
    setMstEdges([]);
    setMstResult(null);
    setCurrentEdgeIndex(-1);
    setLogs([]);
    setSelectedLog(null);
    try {
      await api.resetEdges();
      showToast("All road blocks cleared.");
    } catch (err) {
      console.warn("Backend offline: clearing local road blocks", err);
      setEdges(prev => prev.map(e => ({ ...e, blocked: false })));
      try {
        const storedEdges = localStorage.getItem('sdr_crud_edges');
        if (storedEdges) {
          const parsed = JSON.parse(storedEdges);
          const updated = parsed.map(e => ({ ...e, blocked: false }));
          localStorage.setItem('sdr_crud_edges', JSON.stringify(updated));
        }
      } catch (e) {}
      showToast("All local road blocks cleared.");
    }
    loadNetworkAndStatus(true);
  };

  const handleToggleBlock = async (uId, vId) => {
    if (isRunning) return;
    try {
      await api.toggleEdgeBlock({ sourceNodeId: uId, targetNodeId: vId });
    } catch (err) {
      console.warn("Backend offline: toggling local edge block state", err);
      setEdges(prev => prev.map(e => {
        const matches = (Number(e.u) === Number(uId) && Number(e.v) === Number(vId)) ||
                        (Number(e.u) === Number(vId) && Number(e.v) === Number(uId));
        return matches ? { ...e, blocked: !e.blocked } : e;
      }));
      try {
        const storedEdges = localStorage.getItem('sdr_crud_edges');
        if (storedEdges) {
          const parsed = JSON.parse(storedEdges);
          const updated = parsed.map(e => {
            const matches = (Number(e.sourceId ?? e.u) === Number(uId) && Number(e.targetId ?? e.v) === Number(vId)) ||
                            (Number(e.sourceId ?? e.u) === Number(vId) && Number(e.targetId ?? e.v) === Number(uId));
            return matches ? { ...e, blocked: !e.blocked } : e;
          });
          localStorage.setItem('sdr_crud_edges', JSON.stringify(updated));
        }
      } catch (e) {}
    }
    setMstEdges([]);
    setCurrentEdgeIndex(-1);
    setLogs([]);
    setSelectedLog(null);
    await loadNetworkAndStatus(true);
  };

  const handleModeSwitch = (instantMode) => {
    setIsInstantMode(instantMode);
    stopSimulation();
    setMstEdges([]);
    setMstResult(null);
    setCurrentEdgeIndex(-1);
    setLogs([]);
    setSelectedLog(null);
    const modeName = instantMode ? "⚡ Instant Solved Mode (0ms delay)" : "🎬 Visual Simulation Mode (Step-by-step 700ms animation)";
    console.log(`%c[Execution Mode Switch DEBUG] User toggled execution mode to: "${modeName}". Resetting active timers, MST calculation lines, and logs.`, 'color: #10b981; font-weight: bold;');
    
    const modeLog = {
      text: `Execution mode configured to ${instantMode ? 'Instant Solved' : 'Visual Simulation'}.`,
      detail: `[Execution Mode Policy]\n- Mode: ${modeName}\n- Delay Policy: ${instantMode ? 'Bypasses step-by-step Kruskal edge timers and calculates optimal backbone instantly.' : 'Executes real-time 700ms animation across Union-Find disjoint sets.'}\n- State Reset: Active timers stopped, MST calculation lines cleared, and trace logs reset.`
    };
    setLogs([modeLog]);
    setSelectedLog(modeLog);
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
      let res;
      try {
        res = await api.getMST();
      } catch (backendErr) {
        console.warn("Backend MST API offline. Calculating Kruskal's MST on client.", backendErr);
        const allEdges = [...edges];
        const blockedEdges = allEdges.filter(e => e.blocked);
        const sortedBlocked = [...blockedEdges].sort((a, b) => (a.cost || a.distanceKm || 10) - (b.cost || b.distanceKm || 10));

        const parent = new Map();
        nodes.forEach(n => parent.set(Number(n.id), Number(n.id)));
        const find = (i) => {
          let root = i;
          while (parent.has(root) && parent.get(root) !== root) {
            root = parent.get(root);
          }
          return root;
        };
        const union = (i, j) => {
          const rootI = find(i);
          const rootJ = find(j);
          if (rootI !== rootJ) {
            parent.set(rootI, rootJ);
            return true;
          }
          return false;
        };

        allEdges.filter(e => !e.blocked).forEach(e => union(Number(e.u), Number(e.v)));

        const roadsToClear = [];
        let totalCost = 0;
        sortedBlocked.forEach(e => {
          if (union(Number(e.u), Number(e.v))) {
            const dist = e.cost || e.distanceKm || 10.0;
            totalCost += dist;
            roadsToClear.push({
              sourceNodeId: Number(e.u),
              targetNodeId: Number(e.v),
              distanceKm: dist
            });
          }
        });

        res = {
          roadsToClear,
          totalCost,
          componentsReduced: roadsToClear.length > 0 ? `Reduced ${roadsToClear.length} component split(s)` : `Fully connected`
        };
      }
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

      if (isInstantMode) {
        console.log(`%c[Module3 Instant Solved] Bypassed Kruskal MST animation delays. Established optimal network backbone instantly!`, 'color: #10b981; font-weight: bold;');
        const finalMst = steps.length > 0 ? (steps[steps.length - 1].mst || mstList) : mstList;
        const allLogs = steps.map(s => ({ text: s.text, detail: s.detail }));
        setMstEdges(finalMst);
        setCurrentEdgeIndex(-1);
        setLogs(prev => [...prev, ...allLogs]);
        if (allLogs.length > 0) {
          setSelectedLog(allLogs[allLogs.length - 1]);
        }
        setIsRunning(false);
        return;
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
                <path d="M20 35a10 10 0 0 1 10-10 12 12 0 0 1 22-8 15 15 0 0 1 28 3 10 10 0 0 1 10 10 10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z" fill="#cbd5e1" stroke="none" opacity="0.05" />
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
                      className="cursor-help"
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
                        className="transition-all duration-200 hover:stroke-sky-400 hover:stroke-[3.5px]"
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

      {/* Controls & Execution Mode */}
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
          onClick={runKruskal}
          disabled={loading || isRunning}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 disabled:opacity-50 text-slate-100 font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg text-sm"
        >
          <Play className="w-4 h-4 fill-slate-100" />
          {isRunning ? 'Running MST...' : 'Calculate MST Backbone'}
        </button>
        
        <button
          onClick={handleUnblockAllRoads}
          disabled={loading || isRunning || !edges.some(e => e.blocked)}
          className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold px-3 py-2.5 rounded-xl border border-slate-700 transition-all text-xs flex items-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Clear all road blocks in database"
        >
          <span>🔓</span> <span>Unblock All</span>
        </button>

        <button
          onClick={resetAll}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 transition-all disabled:opacity-50"
          title="Reset Simulation Visuals"
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
                This module analyzes network connectivity, isolated camps, and components using <strong>Kruskal's Minimum Spanning Tree (MST)</strong> with a <strong>Disjoint Set Union-Find</strong> algorithm on the backend to determine the minimal road clearing cost.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Interactive Controls</h4>
              <ul className="list-disc pl-4 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-slate-100">Execution Speed Toggle:</strong> Switch between <span className="text-amber-400 font-semibold">🎬 Simulation</span> (renders step-by-step 700ms Kruskal edge clearing and Union-Find cycle evaluations) and <span className="text-emerald-400 font-semibold">⚡ Instant</span> (bypasses visual delays, snaps to the optimal backbone instantly, and populates all trace logs in 0ms).
                </li>
                <li>
                  <strong className="text-slate-100">Interactive Road Blocking:</strong> Click on any road line on the topology map to toggle its blocked/open status in the Spring Boot database.
                </li>
                <li>
                  <strong className="text-slate-100">Calculate MST Backbone:</strong> Computes Kruskal's MST to find the shortest minimal road clearing cost to reconnect all isolated camps.
                </li>
                <li>
                  <strong className="text-slate-100">Unblock All Button (🔓):</strong> Clears all user-created road blockages across the network in the backend database (active when blocked roads exist).
                </li>
                <li>
                  <strong className="text-slate-100">Reset Button (↺):</strong> Stops active MST simulation timers and clears MST calculation lines while keeping your user-blocked roads intact.
                </li>
                <li>
                  <strong className="text-slate-100">Copy Logs:</strong> Copies all Disjoint Set Union-Find decisions and cumulative clearing costs to your clipboard.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Kruskal's MST Algorithm</h4>
              <p className="leading-relaxed text-slate-300">
                • Sorts all candidate roads by distance/clearing cost in ascending order.<br />
                • Performs Union-Find <code>find()</code> queries with path compression to prevent network cycles.<br />
                • Spans all isolated disaster camps into a single cost-optimal connected communication backbone.
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

