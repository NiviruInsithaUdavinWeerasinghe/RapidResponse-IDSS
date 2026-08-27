import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Award, Settings, Info, Play, RotateCcw } from 'lucide-react';

const INITIAL_ORDERS = [
  { id: 1, name: "SOS Camp Alpha", priority: 8, margin: 45, deadline: 2, size: 4 },
  { id: 2, name: "SOS Camp Beta", priority: 6, margin: 30, deadline: 5, size: 7 },
  { id: 3, name: "SOS Camp Gamma", priority: 9, margin: 50, deadline: 1, size: 3 },
  { id: 4, name: "SOS Camp Delta", priority: 4, margin: 20, deadline: 8, size: 5 },
  { id: 5, name: "SOS Camp Epsilon", priority: 7, margin: 35, deadline: 3, size: 4 },
];

export default function Module4IntelligentDec() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [weights, setWeights] = useState({ priority: 0.4, margin: 0.4, deadline: 0.2 });
  const [maxCapacity, setMaxCapacity] = useState(10);
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

  const holdTimeoutRef = useRef(null);
  const holdIntervalRef = useRef(null);

  const startHoldChange = (direction) => {
    stopHoldChange();
    const update = () => {
      setMaxCapacity(prev => {
        if (direction === 'up') return Math.min(25, prev + 1);
        return Math.max(5, prev - 1);
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

  const getScoredOrders = () => {
    return orders.map(o => {
      const normPriority = o.priority * 10;
      const normMargin = o.margin * 2;
      const normDeadline = Math.max(0, 10 - o.deadline) * 10;
      const score = (normPriority * weights.priority) + 
                    (normMargin * weights.margin) + 
                    (normDeadline * weights.deadline);
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
      const normP = o.priority * 10;
      const normM = o.margin * 2;
      const normD = Math.max(0, 10 - o.deadline) * 10;
      tempLogs.push({
        text: `Computed composite score for ${o.name}: ${o.score}`,
        detail: `[Criteria Scoring Metrics]\n- Priority: Raw ${o.priority}/10 -> Normalized: ${normP} * Weight ${weights.priority.toFixed(2)} = ${(normP * weights.priority).toFixed(1)}\n- Severity Index: Raw ${o.margin} -> Normalized: ${normM} * Weight ${weights.margin.toFixed(2)} = ${(normM * weights.margin).toFixed(1)}\n- Urgency: Deadline ${o.deadline}d -> Normalized: ${normD} * Weight ${weights.deadline.toFixed(2)} = ${(normD * weights.deadline).toFixed(1)}\n- Sum total = ${o.score}`
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

  const handleStart = () => {
    const scored = getScoredOrders();
    if (algorithm === 'bb') {
      runBranchAndBound(scored);
    } else {
      runWeightedScoring(scored);
    }
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
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
            <Award className="w-6 h-6 animate-pulse" />
            Module 4: Intelligent Decision
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all ml-1.5 focus:outline-none"
              title="View Module Guide"
            >
              <Info className="w-4 h-4" />
            </button>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Solve Subset-Selection for SOS requests. Compare exact Branch & Bound vs Weighted Scoring heuristics.
          </p>
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

      {/* Main Grid Viewport - Fills full space cleanly */}
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
                  onTouchStart={() => startHoldChange('down')}
                  onTouchEnd={stopHoldChange}
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
                  onTouchStart={() => startHoldChange('up')}
                  onTouchEnd={stopHoldChange}
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
          {/* Redesigned Premium Header with active ping indicator */}
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
                M4: Intelligent Decision Guide
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
          <div className="flex-1 overflow-y-auto my-4 pr-1 text-slate-300 text-xs space-y-4">
            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">What is this page for?</h4>
              <p className="leading-relaxed">
                This module helps you prioritize and batch SOS requests from disaster-affected camps. Using criteria weights, it normalizes and scores each camp's priority, severity, and deadline urgency. It then uses <strong>Branch & Bound</strong> or a <strong>Weighted Heuristic</strong> to assemble the highest scoring batch of camps that fits within our delivery capacity limit.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Interactive Controls</h4>
              <ul className="list-disc pl-4 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-slate-100">Criteria Weights Configurations:</strong> Tweak the sliders on the left to set custom percentages for Priority, Severity, and Urgency. Changes dynamically recalculate the scores of all camps.
                </li>
                <li>
                  <strong className="text-slate-100">Max Capacity Limit (t):</strong> Use the <code>+</code> or <code>-</code> stepper buttons on the left to adjust our delivery capacity. Hold down either button to scroll values continuously.
                </li>
                <li>
                  <strong className="text-slate-100">Algorithm Toggles (Top Right):</strong> Select between <em>Branch & Bound</em> (which explores exact combinations to find the highest scoring subset) and <em>Weighted Heuristic</em> (which quickly fills capacity by taking high-scoring camps first).
                </li>
                <li>
                  <strong className="text-slate-100">Analyze & Assemble Batch Button:</strong> Executes the chosen algorithm to select and highlight approved camps in glowing green.
                </li>
                <li>
                  <strong className="text-slate-100">Copy Logs:</strong> Copies all normalized calculations, weight ratios, and assembly decisions to your clipboard.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Algorithm Test Scenarios</h4>
              <ul className="list-disc pl-4 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-slate-100">Scenario 1: Weight Adjustments</strong> - Tweak Priority to 80% and Deadline to 10%. Notice how camps with high urgency values jump to the top of the list instantly.
                </li>
                <li>
                  <strong className="text-slate-100">Scenario 2: Weighted Heuristic vs Branch & Bound</strong> - Set Capacity to 10t. Compare both algorithms. The heuristic grabs Gamma (3t) and Alpha (4t) first (total size 7t, score 178) but runs out of space for Beta (7t). Branch & Bound will analyze combinations and may select Beta (7t) and Gamma (3t) (total size 10t, score 152) or other optimal subsets.
                </li>
                <li>
                  <strong className="text-slate-100">Scenario 3: Capacity Breaches</strong> - Set Capacity to 5t. Run the analysis and watch the algorithm skip camps that exceed this limit, selecting only the highest-value smaller camps that fit.
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
