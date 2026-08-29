import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Award, Settings, Info, Play, RotateCcw, GitMerge, BarChart3, Sliders, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api/v1/decisions';
const PIPELINE_API_BASE = 'http://localhost:8080/api/v1/pipeline';

const INITIAL_ORDERS = [
  { id: 1, name: "SOS Camp Alpha", priority: 8, margin: 4.5, deadline: 90, size: 4 },
  { id: 2, name: "SOS Camp Beta", priority: 6, margin: 3.0, deadline: 45, size: 7 },
  { id: 3, name: "SOS Camp Gamma", priority: 9, margin: 5.0, deadline: 85, size: 3 },
  { id: 4, name: "SOS Camp Delta", priority: 4, margin: 2.0, deadline: 20, size: 5 },
  { id: 5, name: "SOS Camp Epsilon", priority: 7, margin: 3.5, deadline: 70, size: 4 },
];

export default function Module4IntelligentDec() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [weights, setWeights] = useState({ priority: 0.4, margin: 0.4, deadline: 0.2 });
  const [maxCapacity, setMaxCapacity] = useState(950);
  const [selectedBatch, setSelectedBatch] = useState([]);
  const [algorithm, setAlgorithm] = useState('bb');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [toast, setToast] = useState(null);
  const [toastLeaving, setToastLeaving] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [shouldRenderModal, setShouldRenderModal] = useState(false);
  const [modalAnimating, setModalAnimating] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  // New Navigation Sub-Tab State
  const [subTab, setSubTab] = useState('control'); // 'control' | 'pipelines' | 'benchmark'

  // Pipeline Integration States (Issues #29 & #30)
  const [activePipeline, setActivePipeline] = useState('pack'); // 'pack' | 'sequence'
  const [selectedTspSolver, setSelectedTspSolver] = useState('AUTO');
  const [decideAndPackResult, setDecideAndPackResult] = useState(null);
  const [decideAndSequenceResult, setDecideAndSequenceResult] = useState(null);

  const [helicopters, setHelicopters] = useState([]);
  const [reliefItems, setReliefItems] = useState([]);
  const [selectedHelicopter, setSelectedHelicopter] = useState('4');

  // Seeding state
  const [seedCount, setSeedCount] = useState(15);
  const [compareData, setCompareData] = useState(null);

  const holdTimeoutRef = useRef(null);
  const holdIntervalRef = useRef(null);

  const showToastMsg = (msg) => {
    setToast(msg);
    setToastLeaving(false);
    setTimeout(() => {
      setToastLeaving(true);
      setTimeout(() => {
        setToast(null);
      }, 150);
    }, 2000);
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

  const loadRequests = () => {
    fetch(`${API_BASE}/sos-requests`)
      .then(res => {
        if (res.ok) {
          setBackendConnected(true);
          return res.json();
        }
        throw new Error("No backend connection");
      })
      .then(data => {
        if (data && data.length > 0) {
          const mapped = data.map(item => ({
            id: item.id || item.campId,
            name: item.campName,
            priority: item.campPopulation || 400,
            margin: item.injurySeverity || 5.0,
            deadline: item.supplyShortage || 50.0,
            size: item.requiredTrucks || 2.0
          }));
          setOrders(mapped);
        }
      })
      .catch(err => {
        console.warn("Backend decision service offline. Using mock orders.", err);
        setBackendConnected(false);
      });
  };

  // Fetch pending requests on mount
  useEffect(() => {
    loadRequests();
    
    // Fetch helicopters
    fetch('http://localhost:8080/api/v1/resources/helicopters')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setHelicopters(data);
        if (data && data.length > 0) {
          setSelectedHelicopter(data[0].id.toString());
        }
      })
      .catch(e => console.warn("Failed to fetch helicopters", e));

    // Fetch relief items
    fetch('http://localhost:8080/api/v1/resources/items')
      .then(res => res.ok ? res.json() : [])
      .then(data => setReliefItems(data))
      .catch(e => console.warn("Failed to fetch relief items", e));
  }, []);

  const startHoldChange = (direction) => {
    stopHoldChange();
    const update = () => {
      setMaxCapacity(prev => {
        if (direction === 'up') return Math.min(2000, prev + 50);
        return Math.max(0, prev - 50);
      });
    };
    update();
    holdTimeoutRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(update, 80);
    }, 350);
  };

  const stopHoldChange = () => {
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdTimeoutRef.current = null;
    holdIntervalRef.current = null;
  };

  const copyLogsToClipboard = () => {
    if (logs.length === 0) return;
    const text = logs.map((l, idx) => `[${idx + 1}] ${l.text}\nDetail: ${l.detail}`).join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      showToastMsg("Logs copied successfully!");
    });
  };

  const getScoredOrders = () => {
    let minSev = Math.min(...orders.map(o => o.margin));
    let maxSev = Math.max(...orders.map(o => o.margin));
    let minPop = Math.min(...orders.map(o => o.priority));
    let maxPop = Math.max(...orders.map(o => o.priority));
    let minSho = Math.min(...orders.map(o => o.deadline));
    let maxSho = Math.max(...orders.map(o => o.deadline));

    const sevRange = maxSev - minSev || 1;
    const popRange = maxPop - minPop || 1;
    const shoRange = maxSho - minSho || 1;

    return orders.map(o => {
      const normSev = (o.margin - minSev) / sevRange;
      const normPop = (o.priority - minPop) / popRange;
      const normSho = (o.deadline - minSho) / shoRange;
      
      const score = (weights.margin * normSev + 
                     weights.priority * normPop + 
                     weights.deadline * normSho) * 100;
      return { ...o, score: Math.round(score) };
    });
  };

  const runBranchAndBound = (scored) => {
    const sorted = [...scored].sort((a, b) => b.score / a.size - a.score / b.size);
    const steps = [];

    const getBound = (idx, currW, currVal) => {
      if (currW >= maxCapacity) return 0;
      let bound = currVal;
      let totalW = currW;
      let i = idx;
      while (i < sorted.length && totalW + sorted[i].size <= maxCapacity) {
        totalW += sorted[i].size;
        bound += sorted[i].score;
        i++;
      }
      if (i < sorted.length) {
        bound += (maxCapacity - totalW) * (sorted[i].score / sorted[i].size);
      }
      return bound;
    };

    let maxVal = 0;
    let maxSelection = [];

    const explore = (level, currW, currVal, selectedIds) => {
      const bound = getBound(level, currW, currVal);
      if (currW > maxCapacity) {
        steps.push({
          log: {
            text: `Skipped branch. Weight exceeds capacity limit.`,
            detail: `[B&B Pruning - Capacity Exceeded]\n- Node Weight: ${currW}t / Limit: ${maxCapacity}t\n- Decision: Branch pruned due to capacity constraint.`
          },
          selection: [...selectedIds]
        });
        return;
      }

      if (currVal > maxVal) {
        maxVal = currVal;
        maxSelection = [...selectedIds];
      }

      if (level === sorted.length) {
        steps.push({
          log: {
            text: `Reached leaf node. Current total score: ${currVal}.`,
            detail: `[B&B Leaf Node]\n- Level: ${level}\n- Total score reached: ${currVal}\n- Total weight: ${currW}t\n- Decision: Final leaves evaluated against best score.`
          },
          selection: [...selectedIds]
        });
        return;
      }

      if (bound <= maxVal) {
        steps.push({
          log: {
            text: `Skipped branch. Heuristic bound (${bound.toFixed(0)}) cannot beat current best (${maxVal}).`,
            detail: `[B&B Pruning - Suboptimal Bound]\n- Current best score: ${maxVal}\n- Node upper bound: ${bound.toFixed(0)}\n- Decision: Branch pruned.`
          },
          selection: [...selectedIds]
        });
        return;
      }

      steps.push({
        log: {
          text: `Exploring choice: Include or Exclude ${sorted[level].name}.`,
          detail: `[B&B Node Exploration]\n- Level ${level} (${sorted[level].name})\n- Current Weight: ${currW}t\n- Current Score: ${currVal}\n- Node Upper Bound: ${bound.toFixed(0)}`
        },
        selection: [...selectedIds]
      });

      explore(level + 1, currW + sorted[level].size, currVal + sorted[level].score, [...selectedIds, sorted[level].id]);
      explore(level + 1, currW, currVal, [...selectedIds]);
    };

    explore(0, 0, 0, []);

    const finalLogs = [
      { text: "B&B Subset solver initialized.", detail: "[Exact Branch & Bound Solver]\nExploring all combinations of SOS requests. Computing upper bounds using fractional relaxation." }
    ];
    steps.forEach((s) => {
      finalLogs.push(s.log);
    });

    const endLog = { text: `B&B Selected ${maxSelection.length} requests. Total Score: ${maxVal}.`, detail: `[Exact Optimization Finished]\nSelected Camps: ${maxSelection.join(', ')}\nFits weight constraint: ${maxCapacity}t.` };
    finalLogs.push(endLog);

    setSelectedBatch(maxSelection);
    setLogs(finalLogs);
    setSelectedLog(endLog);
  };

  const runWeightedScoring = (scored) => {
    const tempLogs = [{ text: "Weighted Scoring solver initialized.", detail: "[Weighted Heuristic Allocation]\nEvaluating camps based on composite scores. Adding to convoy until capacity is reached." }];
    
    scored.forEach(o => {
      tempLogs.push({
        text: `Computed composite score for ${o.name}: ${o.score}`,
        detail: `[Criteria Scoring Metrics]\n- Priority: Raw ${o.priority} * Weight ${weights.priority.toFixed(2)} = ${(o.priority * weights.priority).toFixed(1)}\n- Severity Index: Raw ${o.margin} * Weight ${weights.margin.toFixed(2)} = ${(o.margin * weights.margin).toFixed(1)}\n- Urgency: Deadline ${o.deadline} * Weight ${weights.deadline.toFixed(2)} = ${(o.deadline * weights.deadline).toFixed(1)}\n- Sum total = ${o.score}`
      });
    });

    const sorted = [...scored].sort((a, b) => b.score - a.score);
    tempLogs.push({ text: "Sorting camps by composite score.", detail: "Sorting in descending order of composite score to prioritize highest value batches." });

    let currentWeight = 0;
    const selection = [];
    
    for (const item of sorted) {
      if (currentWeight + item.size <= maxCapacity) {
        currentWeight += item.size;
        selection.push(item.id);
        tempLogs.push({
          text: `Adding ${item.name} (Size: ${item.size}t). Fits capacity.`,
          detail: `[Convoy Loading Add]\n- Camp: ${item.name}\n- Score: ${item.score}\n- Cargo weight: ${item.size}t\n- Current Load: ${currentWeight}t\n- Decision: Cargo space is available. Added to convoy.`
        });
      } else {
        tempLogs.push({
          text: `Skipping ${item.name} (Size: ${item.size}t). Exceeds remaining capacity.`,
          detail: `[Convoy Capacity Bypass]\n- Camp: ${item.name}\n- Cargo weight: ${item.size}t\n- Remaining capacity: ${maxCapacity - currentWeight}t\n- Decision: Exceeds maximum truck capacity. Skipped.`
        });
      }
    }
    
    const endLog = { text: `Selected ${selection.length} camps. Total weight: ${currentWeight}t / ${maxCapacity}t.`, detail: "[Heuristic Selection Complete]\nPriority selection completed successfully." };
    tempLogs.push(endLog);
    
    setSelectedBatch(selection);
    setLogs(tempLogs);
    setSelectedLog(endLog);
  };

  const handleStart = async () => {
    setIsRunning(true);
    const scored = getScoredOrders();

    if (backendConnected) {
      const payload = {
        maxDailyCapacity: Number(maxCapacity),
        severityWeight: weights.margin,
        populationWeight: weights.priority,
        shortageWeight: weights.deadline,
        directRequests: orders.map(o => ({
          campId: o.id,
          campName: o.name,
          injurySeverity: o.margin,
          population: o.priority,
          supplyShortage: o.deadline,
          requiredTrucks: o.size
        }))
      };

      try {
        const endpoint = algorithm === 'bb' ? 'exact' : 'heuristic';
        const res = await fetch(`${API_BASE}/optimize/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          const ids = data.selectedRequests.map(r => r.campId);
          setSelectedBatch(ids);

          const timeFormatted = data.executionTimeFormatted || `${(data.executionTimeNanos / 1000000).toFixed(2)} ms`;
          const text = `${algorithm === 'bb' ? 'Branch & Bound' : 'Weighted Scoring'} completed successfully on the backend.`;
          const detail = `[Backend Algorithm Results]\n- Executed Solver: ${data.algorithm}\n- Execution Time: ${timeFormatted}\n- Selected Camps: ${data.selectedRequests.map(r => r.campName).join(', ')}\n- Convoy Capacity Used: ${data.totalCapacityUsed}t / ${maxCapacity}t\n- Total Score: ${data.totalScore.toFixed(2)}`;

          const runLog = { text, detail };
          setLogs([
            { text: "Connected to live Spring Boot decision service.", detail: "[Backend Optimization Service]\nSending MCDA weights and SOS batch payloads directly to the controller endpoints." },
            runLog
          ]);
          setSelectedLog(runLog);
          setIsRunning(false);
          return;
        }
      } catch (err) {
        console.warn("Backend optimization failed. Falling back to local client.", err);
      }
    }

    // Fallback locally
    if (algorithm === 'bb') {
      runBranchAndBound(scored);
    } else {
      runWeightedScoring(scored);
    }
    setIsRunning(false);
  };

  // Run M4 -> M2 Decide and Pack Pipeline
  const runDecideAndPack = async () => {
    setIsRunning(true);
    const payload = {
      maxDailyCapacity: Number(maxCapacity),
      severityWeight: weights.margin,
      populationWeight: weights.priority,
      shortageWeight: weights.deadline,
      directRequests: orders.map(o => ({
        campId: o.id,
        campName: o.name,
        injurySeverity: o.margin,
        population: o.priority,
        supplyShortage: o.deadline,
        requiredTrucks: o.size
      })),
      helicopterId: Number(selectedHelicopter),
      itemIds: reliefItems.map(i => i.id),
      decisionAlgorithm: algorithm === 'bb' ? 'EXACT' : 'HEURISTIC',
      packingAlgorithm: 'EXACT'
    };

    try {
      const res = await fetch(`${PIPELINE_API_BASE}/decide-and-pack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setDecideAndPackResult(data);
        showToastMsg("Decide & Pack workflow complete!");
      }
    } catch (err) {
      console.error(err);
      showToastMsg("Pipeline execution failed.");
    }
    setIsRunning(false);
  };

  // Run M4 -> M5 Decide and Sequence Pipeline
  const runDecideAndSequence = async () => {
    setIsRunning(true);
    const payload = {
      maxDailyCapacity: Number(maxCapacity),
      severityWeight: weights.margin,
      populationWeight: weights.priority,
      shortageWeight: weights.deadline,
      directRequests: orders.map(o => ({
        campId: o.id,
        campName: o.name,
        injurySeverity: o.margin,
        population: o.priority,
        supplyShortage: o.deadline,
        requiredTrucks: o.size
      })),
      decisionAlgorithm: algorithm === 'bb' ? 'EXACT' : 'HEURISTIC',
      sequencingAlgorithm: selectedTspSolver
    };

    try {
      const res = await fetch(`${PIPELINE_API_BASE}/decide-and-sequence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setDecideAndSequenceResult(data);
        showToastMsg("Decide & Sequence tour sequenced!");
      }
    } catch (err) {
      console.error(err);
      showToastMsg("Pipeline execution failed.");
    }
    setIsRunning(false);
  };

  // Run side by side algorithm compare
  const runCompare = async () => {
    setIsRunning(true);
    const payload = {
      maxDailyCapacity: Number(maxCapacity),
      severityWeight: weights.margin,
      populationWeight: weights.priority,
      shortageWeight: weights.deadline,
      directRequests: orders.map(o => ({
        campId: o.id,
        campName: o.name,
        injurySeverity: o.margin,
        population: o.priority,
        supplyShortage: o.deadline,
        requiredTrucks: o.size
      }))
    };

    try {
      const res = await fetch(`${API_BASE}/optimize/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setCompareData(data);
        showToastMsg("Optimization comparison complete!");
      }
    } catch (err) {
      console.error(err);
      showToastMsg("Compare analysis failed.");
    }
    setIsRunning(false);
  };

  // Seed sample SOS requests
  const handleSeedData = async () => {
    setIsRunning(true);
    try {
      const res = await fetch(`${API_BASE}/sample-data?count=${seedCount}`, {
        method: 'POST'
      });
      if (res.ok) {
        showToastMsg(`Seeded ${seedCount} sample SOS requests successfully!`);
        loadRequests();
      }
    } catch (err) {
      console.error(err);
      showToastMsg("Failed to seed sample requests.");
    }
    setIsRunning(false);
  };

  const resetAll = () => {
    setSelectedBatch([]);
    setLogs([]);
    setSelectedLog(null);
  };

  const scoredOrders = getScoredOrders();

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
      <div className="flex flex-col border-b border-slate-800 pb-3 shrink-0 gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
              <Award className="w-6 h-6 animate-pulse" />
              Module 4: Intelligent Decision
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-mono border ml-2 ${
                backendConnected ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' : 'bg-amber-950/40 text-amber-400 border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
                {backendConnected ? 'API Connected' : 'Client Mode'}
              </span>
              <button
                onClick={() => setIsInfoModalOpen(true)}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all ml-1.5 focus:outline-none"
                title="View Module Guide"
              >
                <Info className="w-4 h-4" />
              </button>
            </h2>
          </div>

          <div className="flex bg-slate-850 p-1 border border-slate-700 rounded-xl">
            <button
              onClick={() => { setAlgorithm('bb'); resetAll(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                algorithm === 'bb' ? 'bg-sky-600 text-slate-100 font-bold shadow' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Branch & Bound
            </button>
            <button
              onClick={() => { setAlgorithm('greedy'); resetAll(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                algorithm === 'greedy' ? 'bg-sky-600 text-slate-100 font-bold shadow' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Weighted Heuristic
            </button>
          </div>
        </div>

        {/* Custom Navigation for Sub-Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setSubTab('control')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              subTab === 'control' 
                ? 'bg-slate-800 text-sky-400 border-slate-700 shadow-md font-bold' 
                : 'text-slate-400 hover:text-slate-200 bg-transparent border-transparent'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Decision Control
          </button>
          <button
            onClick={() => setSubTab('pipelines')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              subTab === 'pipelines' 
                ? 'bg-slate-800 text-sky-400 border-slate-700 shadow-md font-bold' 
                : 'text-slate-400 hover:text-slate-200 bg-transparent border-transparent'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            Workflow Pipelines
          </button>
          <button
            onClick={() => setSubTab('benchmark')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              subTab === 'benchmark' 
                ? 'bg-slate-800 text-sky-400 border-slate-700 shadow-md font-bold' 
                : 'text-slate-400 hover:text-slate-200 bg-transparent border-transparent'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Performance Benchmark
          </button>
        </div>
      </div>

      {/* Main Grid Viewport - Fills full space cleanly */}
      {subTab === 'control' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 my-4 overflow-hidden">
          {/* Sliders Panel */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col gap-4 justify-between overflow-y-auto">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-sky-400" />
                Criteria Weights Configuration
              </h3>
              
              <div className="flex flex-col gap-5 mt-2">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span>Priority weight:</span>
                    <span className="font-bold text-sky-400">{Math.round(weights.priority * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.priority}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const rem = 1 - val;
                      setWeights({ priority: val, margin: rem / 2, deadline: rem / 2 });
                    }}
                    className="w-full accent-sky-400 bg-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span>Severity/Impact weight:</span>
                    <span className="font-bold text-sky-400">{Math.round(weights.margin * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.margin}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const rem = 1 - val;
                      setWeights({ priority: rem / 2, margin: val, deadline: rem / 2 });
                    }}
                    className="w-full accent-sky-400 bg-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span>Deadline Urgency weight:</span>
                    <span className="font-bold text-sky-400">{Math.round(weights.deadline * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.deadline}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const rem = 1 - val;
                      setWeights({ priority: rem / 2, margin: rem / 2, deadline: val });
                    }}
                    className="w-full accent-sky-400 bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span>Max Capacity Limit:</span>
                <div className="flex items-center gap-1 bg-slate-900/50 p-1 border border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onMouseDown={() => startHoldChange('down')}
                    onMouseUp={stopHoldChange}
                    onMouseLeave={stopHoldChange}
                    className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-100 font-bold text-sm transition-colors active:scale-95 select-none"
                  >
                    -
                  </button>
                  <div className="w-12 text-center text-slate-100 font-black text-xs font-mono select-none">
                    {maxCapacity}t
                  </div>
                  <button
                    type="button"
                    onMouseDown={() => startHoldChange('up')}
                    onMouseUp={stopHoldChange}
                    onMouseLeave={stopHoldChange}
                    className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-100 font-bold text-sm transition-colors active:scale-95 select-none"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleStart}
                className="bg-sky-600 hover:bg-sky-700 text-slate-100 font-bold py-2.5 px-4 rounded-xl transition-all shadow"
              >
                Analyze & Assemble Batch
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col overflow-hidden">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Scored Camps SOS</h3>
            
            <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 max-h-[95%]">
              {scoredOrders.map(o => {
                const isSelected = selectedBatch.includes(o.id);
                
                return (
                  <div
                    key={o.id}
                    className={`border p-3 rounded-xl flex items-center justify-between transition-all duration-300 ${
                      isSelected ? 'bg-emerald-950/60 border-emerald-500' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">{o.name}</div>
                      <div className="text-[10px] text-slate-400 flex gap-2 mt-1">
                        <span>Size: {o.size}t</span>
                        <span>•</span>
                        <span>Severity: {o.margin}</span>
                        <span>•</span>
                        <span>Score: <strong className="text-sky-400">{o.score}</strong></span>
                      </div>
                    </div>
                    
                    {isSelected ? (
                      <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
                        Approved
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-750 rounded-lg">
                        Pending
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logs Panel with Fixed Footer Detailed Box */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Scoring Trace Logs</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyLogsToClipboard}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-2 py-0.5 rounded border border-slate-700 transition-colors"
                >
                  Copy Logs
                </button>
                <span className="text-[9px] bg-slate-900 text-sky-400 font-mono px-2 py-0.5 rounded border border-slate-800">
                  STABLE
                </span>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto flex flex-col gap-1.5 p-3 bg-slate-900/50 rounded-lg min-h-0">
              {logs.map((log, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedLog(log)}
                  className={`border-b border-slate-850/50 pb-2 last:border-0 flex items-center justify-between gap-2 cursor-pointer px-2.5 py-1.5 rounded animate-log-item transition-colors duration-150 ${
                    selectedLog === log ? 'text-cyan-400 font-bold bg-slate-800/80 shadow shadow-cyan-950/20' : 'text-slate-350 hover:bg-slate-800/50 hover:text-slate-100'
                  }`}
                >
                  <span className="text-[11px] leading-relaxed">
                    <span className="text-cyan-500 font-bold font-mono mr-1">[{idx + 1}]</span> {log.text}
                  </span>
                  <Info className={`w-3.5 h-3.5 shrink-0 ${selectedLog === log ? 'text-cyan-400' : 'text-slate-500'}`} />
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-slate-500 italic text-center my-auto text-xs font-medium">Press Analyze to start scoring...</div>
              )}
            </div>

            {/* Dedicated Decision Analysis Box at bottom */}
            <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-44 shrink-0 overflow-y-auto">
              <h4 className="text-[9px] uppercase font-bold tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
                <Info className="w-3 text-cyan-400" />
                Scoring decision analyzer
              </h4>
              <p className="text-[10.5px] text-slate-300 font-mono leading-relaxed whitespace-pre-line">
                {selectedLog ? selectedLog.detail : "Click any step above to inspect its normalized criteria values and score computations."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Pipelines Sub-Tab (Issues #29 & #30) */}
      {subTab === 'pipelines' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 my-4 overflow-hidden">
          {/* Controls Panel */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col justify-between overflow-y-auto">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-sky-400" />
                  Select Integration Workflow
                </h3>
                <div className="grid grid-cols-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setActivePipeline('pack')}
                    className={`py-2 text-center rounded-lg text-xs font-bold transition-all ${
                      activePipeline === 'pack' ? 'bg-sky-600 text-slate-100 shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Decide & Pack [M4➔M2]
                  </button>
                  <button
                    onClick={() => setActivePipeline('sequence')}
                    className={`py-2 text-center rounded-lg text-xs font-bold transition-all ${
                      activePipeline === 'sequence' ? 'bg-sky-600 text-slate-100 shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Decide & Sequence [M4➔M5]
                  </button>
                </div>
              </div>

              {activePipeline === 'pack' ? (
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] text-slate-400">
                    This pipeline runs Module 4 SOS optimization, takes the approved camp IDs, and automatically calls Module 2 Knapsack packing.
                  </span>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs text-slate-300">Target Helicopter Resource:</label>
                    <select 
                      value={selectedHelicopter}
                      onChange={(e) => setSelectedHelicopter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      {helicopters.map(h => (
                        <option key={h.id} value={h.id}>
                          {h.callSign} (Max Payload: {h.maxPayloadKg} kg)
                        </option>
                      ))}
                      {helicopters.length === 0 && (
                        <option value="4">Default Helicopter (700 kg)</option>
                      )}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] text-slate-400">
                    This pipeline constructs a Distance Matrix using Module 1 paths, and solves the TSP sequencer tour across the approved camps using Module 5 Held-Karp/2-opt.
                  </span>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs text-slate-300">TSP Sequencer Solver:</label>
                    <select 
                      value={selectedTspSolver}
                      onChange={(e) => setSelectedTspSolver(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="AUTO">Auto Selector (Threshold: 20)</option>
                      <option value="HELD_KARP">Held-Karp DP (Exact optimal)</option>
                      <option value="TWO_OPT">2-opt Local Search (Heuristic)</option>
                    </select>
                  </div>
                </div>
              )}
              
              {/* UX Algorithm Indicator */}
              <div className="mt-3 p-2 bg-slate-900/60 border border-slate-800/80 rounded-xl text-center">
                <span className="text-[10px] text-slate-400">Active Decision Solver: </span>
                <strong className="text-[10px] text-sky-400 font-mono">
                  {algorithm === 'bb' ? 'Branch & Bound (Exact)' : 'Weighted Heuristic'}
                </strong>
              </div>
            </div>

            <button
              onClick={activePipeline === 'pack' ? runDecideAndPack : runDecideAndSequence}
              className="w-full bg-sky-600 hover:bg-sky-700 text-slate-100 font-bold py-2.5 px-4 rounded-xl transition-all shadow"
            >
              Execute Pipeline Workflow
            </button>
          </div>

          {/* Results Panel */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col lg:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-4 shrink-0">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Pipeline Execution Report
              </h3>
              {((activePipeline === 'pack' && decideAndPackResult) || (activePipeline === 'sequence' && decideAndSequenceResult)) && (
                <span className="text-[9px] bg-slate-900 text-sky-400 font-mono px-2 py-0.5 rounded border border-slate-800">
                  Solved via: {algorithm === 'bb' ? 'B&B (Exact)' : 'Heuristic'}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-900/50 border border-slate-850 rounded-xl p-5 flex flex-col gap-4">
              {activePipeline === 'pack' ? (
                decideAndPackResult ? (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">Convoy Camps</span>
                        <strong className="text-sm text-sky-400">{decideAndPackResult.decisionResult?.selectedRequests?.length || 0} Camps</strong>
                      </div>
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">Total Decision Value</span>
                        <strong className="text-sm text-sky-400">{decideAndPackResult.decisionResult?.totalScore?.toFixed(2) || 0}</strong>
                      </div>
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">Relief Items Packed</span>
                        <strong className="text-sm text-emerald-400">{decideAndPackResult.allocationResult?.selectedItems?.length || 0} Items</strong>
                      </div>
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">Total Packed Value</span>
                        <strong className="text-sm text-emerald-400">{decideAndPackResult.allocationResult?.totalValue || 0}</strong>
                      </div>
                    </div>

                    <div className="mt-2">
                      <h4 className="text-xs font-semibold text-slate-300 mb-2">Selected Camps:</h4>
                      <div className="flex flex-wrap gap-2">
                        {decideAndPackResult.decisionResult?.selectedRequests?.map((r, i) => (
                          <span key={i} className="text-xs bg-slate-950 px-2.5 py-1 border border-slate-800 text-slate-300 rounded-lg">
                            {r.campName || r.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2">
                      <h4 className="text-xs font-semibold text-slate-300 mb-2">Relief Package Loadout:</h4>
                      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {decideAndPackResult.allocationResult?.selectedItems?.map((item, idx) => (
                          <div key={idx} className="bg-slate-950 border border-slate-850/60 p-2.5 rounded-lg flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-slate-200">{item.name}</span>
                              <span className="text-[10px] text-slate-500 block">{item.category}</span>
                            </div>
                            <span className="font-mono text-emerald-400 font-bold">{item.weightKg} kg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="my-auto text-center text-slate-500 italic text-xs">
                    Please trigger execution on the left controls panel to load the Decide & Pack pipeline results.
                  </div>
                )
              ) : (
                decideAndSequenceResult ? (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">Tour Stops</span>
                        <strong className="text-sm text-sky-400">{decideAndSequenceResult.tourSequence?.length || 0} Stops</strong>
                      </div>
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">Total Tour Distance</span>
                        <strong className="text-sm text-emerald-400">{decideAndSequenceResult.totalTourDistanceKm?.toFixed(2) || 0} km</strong>
                      </div>
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">Sequencer Solver</span>
                        <strong className="text-sm text-sky-400 truncate max-w-full block" title={decideAndSequenceResult.sequencingAlgorithmUsed}>
                          {decideAndSequenceResult.sequencingAlgorithmUsed || 'AUTO'}
                        </strong>
                      </div>
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">Exec Duration</span>
                        <strong className="text-sm text-slate-300">{(decideAndSequenceResult.totalPipelineTimeNanos / 1000000).toFixed(2)} ms</strong>
                      </div>
                    </div>

                    <div className="mt-2">
                      <h4 className="text-xs font-semibold text-slate-300 mb-2">Delivery Convoys Sequencing Tour:</h4>
                      <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                        {decideAndSequenceResult.tourSequence?.map((node, i) => (
                          <div key={i} className="flex items-center gap-3 bg-slate-950 border border-slate-850/60 p-2.5 rounded-lg text-xs">
                            <span className="w-5 h-5 flex items-center justify-center bg-sky-950 text-sky-400 rounded-full font-bold font-mono shrink-0">
                              {node.sequenceIndex}
                            </span>
                            <div className="flex-1">
                              <span className="font-bold text-slate-200">{node.nodeName}</span>
                              <span className="text-[9px] text-slate-500 block">{node.nodeType}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              +{node.distanceFromPreviousKm?.toFixed(1) || 0} km
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="my-auto text-center text-slate-500 italic text-xs">
                    Please trigger execution on the left controls panel to load the Decide & Sequence tour results.
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Performance Benchmark Sub-Tab */}
      {subTab === 'benchmark' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 my-4 overflow-hidden">
          {/* Config Controls Panel */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col justify-between overflow-y-auto">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  Seed Synthetic Dataset
                </h3>
                <span className="text-[11px] text-slate-400 block mb-3">
                  Seed temporary synthetic camp SOS requests to evaluate and benchmark how the Branch & Bound exact algorithm scales.
                </span>
                
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl justify-between">
                  <div className="text-xs text-slate-300 ml-1.5">Count of requests:</div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setSeedCount(prev => Math.max(5, prev - 5))}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold font-mono">{seedCount}</span>
                    <button 
                      onClick={() => setSeedCount(prev => Math.min(50, prev + 5))}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={handleSeedData}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold py-2 mt-3.5 rounded-xl border border-slate-750 transition-colors"
                >
                  Generate & Insert Database Seeds
                </button>
              </div>

              <div className="border-t border-slate-850 pt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Solver Comparison
                </h3>
                <span className="text-[11px] text-slate-400 block">
                  Run both exact and heuristic solvers on the current dataset to compare execution speeds and accuracy levels.
                </span>
              </div>
            </div>

            <button
              onClick={runCompare}
              className="w-full bg-sky-600 hover:bg-sky-700 text-slate-100 font-bold py-2.5 px-4 rounded-xl transition-all shadow"
            >
              Analyze Solvers Comparison
            </button>
          </div>

          {/* Results Comparison Panels */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col lg:col-span-2 overflow-hidden">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Side-By-Side Comparison Report
            </h3>

            <div className="flex-1 overflow-y-auto bg-slate-900/50 border border-slate-850 rounded-xl p-5 flex flex-col gap-4">
              {compareData ? (
                <div className="flex flex-col gap-5">
                  {/* Summary Metric cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Execution Speedup</span>
                      <strong className="text-lg text-emerald-400 font-mono">
                        {compareData.speedupFactor?.toFixed(1) || '0.0'}x Faster
                      </strong>
                      <span className="text-[9px] text-slate-400">Heuristic vs Exact DP</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Optimality Ratio</span>
                      <strong className="text-lg text-sky-400 font-mono">
                        {compareData.heuristicRatio ? (compareData.heuristicRatio * 100).toFixed(1) : '100'}%
                      </strong>
                      <span className="text-[9px] text-slate-400">Heuristic accuracy rating</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Time Difference</span>
                      <strong className="text-lg text-sky-300 font-mono font-bold">
                        {compareData.timeSavings || '0.00 ms'}
                      </strong>
                      <span className="text-[9px] text-slate-400">Absolute elapsed gap</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {/* Exact Results */}
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h4 className="text-xs font-bold text-sky-400">Branch & Bound (Exact)</h4>
                        <span className="text-[10px] bg-slate-900 text-sky-400 font-mono px-2 py-0.5 rounded border border-slate-800 animate-pulse">
                          {compareData.exact?.executionTimeFormatted || '0.0 ms'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs text-slate-300">
                        <div className="flex justify-between">
                          <span>Total Score:</span>
                          <strong className="text-slate-100">{compareData.exact?.totalScore?.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Capacity Used:</span>
                          <strong className="text-slate-100">{compareData.exact?.totalCapacityUsed}t / {maxCapacity}t</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Nodes Explored:</span>
                          <strong className="text-slate-100">{compareData.nodesExploredByBranchAndBound || 0}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Nodes Pruned:</span>
                          <strong className="text-slate-100">{compareData.nodesPrunedByBranchAndBound || 0}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Heuristic Results */}
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h4 className="text-xs font-bold text-sky-400">Weighted Scoring (Heuristic)</h4>
                        <span className="text-[10px] bg-slate-900 text-sky-400 font-mono px-2 py-0.5 rounded border border-slate-800 animate-pulse">
                          {compareData.heuristic?.executionTimeFormatted || '0.0 ms'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs text-slate-300">
                        <div className="flex justify-between">
                          <span>Total Score:</span>
                          <strong className="text-slate-100">{compareData.heuristic?.totalScore?.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Capacity Used:</span>
                          <strong className="text-slate-100">{compareData.heuristic?.totalCapacityUsed}t / {maxCapacity}t</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Complexity:</span>
                          <strong className="text-slate-100">O(N log N)</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Accuracy Deviation:</span>
                          <strong className="text-emerald-400">
                            {compareData.scoreDifference ? (compareData.scoreDifference).toFixed(1) : '0.0'} pts delta
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="my-auto text-center text-slate-500 italic text-xs">
                  Please click "Analyze Solvers Comparison" on the left panel to execute benchmarking tests.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {shouldRenderModal && createPortal(
        <div 
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] max-w-[95vw] h-[650px] max-h-[85vh] bg-[#0F172A] border border-slate-700 shadow-2xl shadow-black rounded-2xl p-6 z-[9999] flex flex-col transition-all duration-200 ease-out select-none transform ${
            modalAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
            <div>
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                <Info className="w-5 h-5 text-sky-400" />
                M4: Intelligent Decision Support System Manual
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Module Lead Developers: <strong className="text-sky-400">Dulmina & Mesanda</strong>
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
          <div className="flex-1 overflow-y-auto my-4 pr-2 text-slate-300 text-xs space-y-5 leading-relaxed font-sans">
            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1">1. Overview & Objectives</h4>
              <p>
                This module helps disaster relief coordinators prioritize emergency SOS requests sent by affected camps. Since cargo capacity is limited, we calculate priority scores for each camp and choose the best combination of camps to help within our transport limit.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1">2. Criteria Configurations</h4>
              <p>
                Each camp's priority is decided by three factors: affected population size, injury severity, and supply shortage level. You can use the sliders on the left to tell the system which factors are most important during an emergency.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1">3. Selection Methods Comparison</h4>
              <ul className="list-disc pl-4 space-y-2">
                <li>
                  <strong className="text-slate-100">Branch & Bound (Exact Combination Solver):</strong> Looks at all possible camp combinations to choose the absolute best batch that fits our capacity limit, giving us the highest possible priority score.
                </li>
                <li>
                  <strong className="text-slate-100">Weighted Heuristic (Greedy Solver):</strong> A fast, simplified search that immediately packs the highest scoring camps first until no cargo space remains.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1">4. Workflows & Cross-Module Pipelines</h4>
              <ul className="list-disc pl-4 space-y-2">
                <li>
                  <strong className="text-slate-100">Decide & Pack:</strong> Automatically matches approved camps with resource packing. It packs helper supply boxes (such as food, water, tents) into a selected helicopter based on its payload capacity.
                </li>
                <li>
                  <strong className="text-slate-100">Decide & Sequence:</strong> Plans the delivery convoy route. It takes the approved camps list, measures road distances, and calculates the optimal stopping sequence to save travel mileage.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1">5. Testing Scenarios Playbook</h4>
              <div className="space-y-2.5 pl-2 border-l-2 border-slate-800">
                <div>
                  <strong className="text-sky-300">Scenario 1: Testing Solvers Speed</strong>
                  <p className="text-[11px] text-slate-400">
                    Go to the Performance Benchmark tab. Click "Generate & Insert Database Seeds" to add sample camps, then click "Analyze Solvers Comparison". You will see comparison statistics showing how much faster the heuristic is compared to the exact solver.
                  </p>
                </div>
                <div>
                  <strong className="text-sky-300">Scenario 2: Testing Capacity Limits</strong>
                  <p className="text-[11px] text-slate-400">
                    Set a small Max Capacity Limit on the left, then click Analyze. You will notice that larger camps are skipped to fit smaller, high-scoring camps into the cargo space.
                  </p>
                </div>
                <div>
                  <strong className="text-sky-300">Scenario 3: Helicopter Packing</strong>
                  <p className="text-[11px] text-slate-400">
                    Go to the Workflow Pipelines tab. Run "Decide & Pack" with different helicopters. You will see that larger helicopters are packed with more helper items (like tents and blankets) to fully maximize their cargo capability.
                  </p>
                </div>
                <div>
                  <strong className="text-sky-300">Scenario 4: Verify Cross-Module Pipeline Actions</strong>
                  <p className="text-[11px] text-slate-400">
                    Go to the Workflow Pipelines tab. Select Decide & Pack. Select HELI-COMMANDER (1200 kg) from the dropdown. Run Execute. Observe how the 7 items packed weigh exactly 1200 kg. Now toggle the top-right solver to Weighted Heuristic and execute again. You will see the selected camps list and total decision value update accordingly!
                  </p>
                </div>
              </div>
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
