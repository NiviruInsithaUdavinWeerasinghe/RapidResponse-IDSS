import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, RotateCcw, Info, Compass } from 'lucide-react';
import { api } from '../utils/api';

export default function Module2ResourceAlloc() {
  const [orders, setOrders] = useState([]);
  const [helicopters, setHelicopters] = useState([]);
  const [selectedHelicopter, setSelectedHelicopter] = useState(null);
  const [capacity, setCapacity] = useState(10);
  const [algorithm, setAlgorithm] = useState('bb');
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [bestValue, setBestValue] = useState(0);
  const [bestItems, setBestItems] = useState([]);
  const [currentSelection, setCurrentSelection] = useState([]);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [history, setHistory] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [isInstantMode, setIsInstantMode] = useState(false);
  
  const [simulationSteps, setSimulationSteps] = useState([]);
  const [finalOptVal, setFinalOptVal] = useState(0);
  const [finalOptSelection, setFinalOptSelection] = useState([]);
  
  const timerRef = useRef(null);
  const [isHeavyDrop, setIsHeavyDrop] = useState(false);
  const [renderedSelection, setRenderedSelection] = useState([]);
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

  useEffect(() => {
    if (toast) {
      setToastLeaving(false);
      const exitTimer = setTimeout(() => {
        setToastLeaving(true);
      }, 2000);
      
      const unmountTimer = setTimeout(() => {
        setToast(null);
        setToastLeaving(false);
      }, 2150);
      
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, [toast]);

  const currentSelectionRef = useRef(currentSelection);
  currentSelectionRef.current = currentSelection;

  useEffect(() => {
    const currentIds = new Set(currentSelection);
    setRenderedSelection(prev => {
      let updated = prev.map(item => {
        if (!currentIds.has(item.id)) {
          return { ...item, isLeaving: true };
        }
        return { ...item, isLeaving: false };
      });
      
      const existingIds = new Set(prev.map(i => i.id));
      const toAdd = currentSelection
        .filter(id => !existingIds.has(id))
        .map(id => {
          const item = orders.find(o => o.id === id);
          return item ? { ...item, isLeaving: false } : null;
        })
        .filter(Boolean);
        
      return [...updated, ...toAdd];
    });

    const hasLeaving = renderedSelection.some(i => !currentIds.has(i.id) && !i.isLeaving);
    if (hasLeaving) {
      setTimeout(() => {
        setRenderedSelection(prev => {
          const latestIds = new Set(currentSelectionRef.current);
          return prev.filter(i => latestIds.has(i.id) || !i.isLeaving);
        });
      }, 150);
    }
  }, [currentSelection, orders]);

  // Fetch items and helicopters on mount
  useEffect(() => {
    async function loadData() {
      try {
        const items = await api.listItems();
        const helis = await api.listHelicopters();
        
        // Map to UI representation
        const mappedOrders = items.map(i => ({
          id: i.id,
          name: i.name,
          weight: Math.round(i.weightKg / 10), // Scale for simple UI grid representation if needed
          value: Math.round(i.priorityValue),
          ratio: Math.round((i.priorityValue / i.weightKg) * 100),
          realWeight: i.weightKg,
          realValue: i.priorityValue
        }));
        
        setOrders(mappedOrders);
        setHelicopters(helis);
        if (helis.length > 0) {
          setSelectedHelicopter(helis[0].id);
          setCapacity(Math.round(helis[0].maxPayloadKg / 10));
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (selectedHelicopter) {
      const h = helicopters.find(x => x.id === Number(selectedHelicopter));
      if (h) {
        setCapacity(Math.round(h.maxPayloadKg / 10));
      }
    }
  }, [selectedHelicopter]);

  useEffect(() => {
    if (currentSelection.length > 0) {
      setIsHeavyDrop(true);
      const timer = setTimeout(() => setIsHeavyDrop(false), 350);
      return () => clearTimeout(timer);
    }
  }, [currentSelection]);

  const resetAll = () => {
    stopSimulation();
    setBestValue(0);
    setBestItems([]);
    setCurrentSelection([]);
    setCurrentWeight(0);
    setCurrentValue(0);
    setHistory([]);
    setStepIndex(0);
    setSimulationSteps([]);
    setSelectedLog(null);
    setApiResult(null);
  };

  const handleModeSwitch = (instantMode) => {
    setIsInstantMode(instantMode);
    stopSimulation();
    setBestValue(0);
    setBestItems([]);
    setCurrentSelection([]);
    setCurrentWeight(0);
    setCurrentValue(0);
    setHistory([]);
    setStepIndex(0);
    setSimulationSteps([]);
    setSelectedLog(null);
    setApiResult(null);

    const modeName = instantMode ? "⚡ Instant Solved Mode (0ms delay)" : "🎬 Visual Simulation Mode (Step-by-step 800ms animation)";
    console.log(`%c[Execution Mode Switch DEBUG] User toggled execution mode to: "${modeName}". Resetting active timers, cargo selection, and logs.`, 'color: #10b981; font-weight: bold;');
    
    const modeLog = {
      text: `Execution mode configured to ${instantMode ? 'Instant Solved' : 'Visual Simulation'}.`,
      detail: `[Execution Mode Policy]\n- Mode: ${modeName}\n- Delay Policy: ${instantMode ? 'Bypasses step-by-step cargo loading animations and solves optimal manifest instantly.' : 'Executes real-time 800ms animation across Knapsack decision tree.'}\n- State Reset: Active timers stopped, cargo selection cleared, and trace logs reset.`
    };
    setHistory([modeLog]);
    setSelectedLog(modeLog);
  };

  const stopSimulation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  const runReplay = (stepsList, startIndex) => {
    stopSimulation();
    setIsRunning(true);
    
    if (isInstantMode) {
      console.log(`%c[Module2 Instant Solved] Bypassed resource allocation step delays. Calculated optimal cargo manifest instantly!`, 'color: #10b981; font-weight: bold;');
      const finalStep = stepsList[stepsList.length - 1];
      const allLogs = stepsList.map(s => s.log);
      if (finalStep) {
        setCurrentSelection(finalStep.selection);
        setCurrentWeight(finalStep.weight);
        setCurrentValue(finalStep.value);
        if (finalStep.bestValue !== undefined) setBestValue(finalStep.bestValue);
        if (finalStep.bestItems !== undefined) setBestItems(finalStep.bestItems);
      }
      setHistory(allLogs);
      if (allLogs.length > 0) {
        setSelectedLog(allLogs[allLogs.length - 1]);
      }
      setStepIndex(stepsList.length);
      setIsRunning(false);
      return;
    }

    let idx = startIndex;
    timerRef.current = setInterval(() => {
      if (idx >= stepsList.length) {
        stopSimulation();
        return;
      }
      const s = stepsList[idx];
      setCurrentSelection(s.selection);
      setCurrentWeight(s.weight);
      setCurrentValue(s.value);
      if (s.bestValue !== undefined) setBestValue(s.bestValue);
      if (s.bestItems !== undefined) setBestItems(s.bestItems);
      setHistory(prev => [...prev, s.log]);
      setSelectedLog(s.log);
      setStepIndex(idx + 1);
      idx++;
    }, speed);
  };

  const runGreedy = () => {
    stopSimulation();
    setIsRunning(true);
    
    const sorted = [...orders].sort((a, b) => b.ratio - a.ratio);
    let tempWeight = 0;
    let tempValue = 0;
    const selected = [];
    const steps = [];

    for (const item of sorted) {
      if (tempWeight + item.weight <= capacity) {
        tempWeight += item.weight;
        tempValue += item.value;
        selected.push(item.id);
        steps.push({
          log: {
            text: `Added ${item.name} (${item.value} score) - fits helicopter capacity.`,
            detail: `[Greedy Allocation details]\n- Package: ${item.name}\n- Weight: ${item.weight * 100}kg\n- Survival Score: ${item.value}\n- Ratio: ${item.ratio}\n- Decision: Accumulated weight (${tempWeight * 100}kg) <= maximum helicopter capacity (${capacity * 100}kg). Gear loaded.`
          },
          selection: [...selected],
          weight: tempWeight,
          value: tempValue,
          bestValue: tempValue,
          bestItems: [...selected]
        });
      } else {
        steps.push({
          log: {
            text: `Skipped ${item.name} - exceeds helicopter capacity.`,
            detail: `[Greedy Capacity Bypass]\n- Package: ${item.name}\n- Weight: ${item.weight * 100}kg\n- Current helicopter load: ${tempWeight * 100}kg\n- Remaining capacity: ${(capacity - tempWeight) * 100}kg\n- Decision: Package weight exceeds remaining cargo space. Skipped.`
          },
          selection: [...selected],
          weight: tempWeight,
          value: tempValue,
          bestValue: tempValue,
          bestItems: [...selected]
        });
      }
    }

    const bestSingleItem = [...orders]
      .filter(item => item.weight <= capacity)
      .reduce((max, item) => item.value > max.value ? item : max, { value: 0 });

    steps.push({
      log: {
        text: `Guaranteed minimum 2-approximation established.`,
        detail: `[Provable 2-Approximation Check]\n- Greedy Total Score: ${tempValue}\n- Single Largest Package Score: ${bestSingleItem.value} (${bestSingleItem.name || 'None'})\n- Decision: Taking max(${tempValue}, ${bestSingleItem.value}) = ${Math.max(tempValue, bestSingleItem.value)} guarantees securing at least 50% of the true optimal Knapsack survival value.`
      },
      selection: tempValue >= bestSingleItem.value ? [...selected] : [bestSingleItem.id],
      weight: tempValue >= bestSingleItem.value ? tempWeight : bestSingleItem.weight,
      value: Math.max(tempValue, bestSingleItem.value),
      bestValue: Math.max(tempValue, bestSingleItem.value),
      bestItems: tempValue >= bestSingleItem.value ? [...selected] : [bestSingleItem.id]
    });

    setSimulationSteps(steps);
    runReplay(steps, 0);
  };

  const runBranchAndBound = () => {
    stopSimulation();
    setIsRunning(true);

    const sorted = [...orders].sort((a, b) => b.ratio - a.ratio);
    const steps = [];

    const getBound = (idx, currW, currVal) => {
      if (currW >= capacity) return 0;
      let bound = currVal;
      let totalW = currW;
      let i = idx;
      while (i < sorted.length && totalW + sorted[i].weight <= capacity) {
        totalW += sorted[i].weight;
        bound += sorted[i].value;
        i++;
      }
      if (i < sorted.length) {
        bound += (capacity - totalW) * sorted[i].ratio;
      }
      return bound;
    };

    let maxVal = 0;
    let maxSelection = [];

    const explore = (level, currW, currVal, selectedIds) => {
      const bound = getBound(level, currW, currVal);
      if (currW > capacity) {
        steps.push({
          log: {
            text: `Skipped branch. Reason: Weight exceeds helicopter limit.`,
            detail: `[Branch & Bound Pruning - Overweight]\n- Current node weight: ${currW * 100}kg\n- Capacity limit: ${capacity * 100}kg\n- Decision: Weight constraint violated. Branch pruned (skip all sub-nodes).`
          },
          selection: [...selectedIds],
          weight: currW,
          value: currVal,
          bound,
          pruned: true
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
            text: `Reached leaf node. Final Score resolved: ${currVal}.`,
            detail: `[Branch & Bound Leaf Node]\n- Level: ${level}\n- Total score reached: ${currVal}\n- Total weight: ${currW * 100}kg\n- Decision: End of packages array. Evaluating against current best.`
          },
          selection: [...selectedIds],
          weight: currW,
          value: currVal,
          bound,
          leaf: true
        });
        return;
      }

      if (bound <= maxVal) {
        steps.push({
          log: {
            text: `Skipped branch. Reason: Cannot beat our best survival score.`,
            detail: `[Branch & Bound Pruning - Suboptimal Bound]\n- Current best score: ${maxVal}\n- Node upper bound (fractional relaxation): ${bound.toFixed(0)}\n- Decision: Estimated upper bound (${bound.toFixed(0)}) cannot exceed current best integer solution (${maxVal}). Branch pruned.`
          },
          selection: [...selectedIds],
          weight: currW,
          value: currVal,
          bound,
          pruned: true
        });
        return;
      }

      steps.push({
        log: {
          text: `Exploring choice: Include or Exclude ${sorted[level].name}.`,
          detail: `[Branch & Bound Node Exploration]\n- Level ${level} (${sorted[level].name})\n- Current Weight: ${currW * 100}kg\n- Current Score: ${currVal}\n- Node Upper Bound: ${bound.toFixed(0)}\n- Decision: Upper bound (${bound.toFixed(0)}) > best score (${maxVal}). Node exploration validated.`
        },
        selection: [...selectedIds],
        weight: currW,
        value: currVal,
        bound,
        active: true
      });

      explore(level + 1, currW + sorted[level].weight, currVal + sorted[level].value, [...selectedIds, sorted[level].id]);
      explore(level + 1, currW, currVal, [...selectedIds]);
    };

    explore(0, 0, 0, []);

    // Append final completion state step so it is played in-sequence
    const finalWeightSum = maxSelection.reduce((acc, id) => acc + (orders.find(o => o.id === id)?.weight || 0), 0);
    const selectedNames = maxSelection.map(id => orders.find(o => o.id === id)?.name || id).join(', ');
    steps.push({
      log: {
        text: "Optimization complete.",
        detail: `[B&B Run Finished]\n- Best Score: ${maxVal}\n- Selection: ${selectedNames}`
      },
      selection: maxSelection,
      weight: finalWeightSum,
      value: maxVal,
      bestValue: maxVal,
      bestItems: maxSelection
    });

    setSimulationSteps(steps);
    setFinalOptVal(maxVal);
    setFinalOptSelection(maxSelection);
    runReplay(steps, 0);
  };

  const handleStart = async () => {
    if (isRunning) {
      stopSimulation();
      return;
    }

    // Resume if we have paused progress steps
    if (simulationSteps.length > 0 && stepIndex < simulationSteps.length) {
      runReplay(simulationSteps, stepIndex);
      return;
    }

    resetAll();
    
    // Call backend API for verification
    try {
      const initialLog = { text: "Querying backend comparison endpoint on port 8080...", detail: "Initiated POST request to /api/v1/resources/allocate/compare." };
      setHistory(prev => [...prev, initialLog]);
      setSelectedLog(initialLog);

      const res = await api.allocateResources({
        helicopterId: Number(selectedHelicopter),
        itemIds: orders.map(o => o.id)
      });
      setApiResult(res);
      
      const successLog = { 
        text: `Backend optimal value: ${res.exact.totalValue} (Optimality: ${(res.heuristicRatio * 100).toFixed(0)}%).`, 
        detail: `[Backend Analysis]\n- Exact Solution: Value ${res.exact.totalValue}, Items: ${res.exact.selectedItems.map(i => i.name).join(', ')}\n- Heuristic Solution: Value ${res.heuristic.totalValue}\n- Execution Gap: ${(res.optimalityGap * 100).toFixed(1)}%`
      };
      setHistory(prev => [...prev, successLog]);
      setSelectedLog(successLog);
    } catch (err) {
      const errorLog = { text: "Failed to reach backend. Running local fallback.", detail: err.message };
      setHistory(prev => [...prev, errorLog]);
      setSelectedLog(errorLog);
    }

    if (algorithm === 'bb') {
      runBranchAndBound();
    } else {
      runGreedy();
    }
  };

  const copyLogsToClipboard = () => {
    if (history.length === 0) {
      setToast("No logs to copy!");
      return;
    }
    const logText = history.map((h, i) => `[${i + 1}] ${h.text}\nDetail: ${h.detail || 'N/A'}`).join('\n\n');
    navigator.clipboard.writeText(logText);
    setToast('Execution logs copied to clipboard!');
  };

  const skipSimulationToEnd = () => {
    stopSimulation();
    if (simulationSteps.length > 0) {
      const logs = simulationSteps.map(s => s.log);
      setHistory(prev => [...prev, ...logs]);
      
      const finalStep = simulationSteps[simulationSteps.length - 1];
      setCurrentSelection(finalStep.selection);
      setCurrentWeight(finalStep.weight);
      setCurrentValue(finalStep.value);
      setBestValue(finalStep.bestValue);
      setBestItems(finalStep.bestItems);
      setStepIndex(simulationSteps.length);
      setSelectedLog(finalStep.log);
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
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
            <Compass className="w-6 h-6 animate-pulse" />
            Module 2: Intelligent Resource Allocation
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all ml-1.5 focus:outline-none"
              title="View Module Guide"
            >
              <Info className="w-4 h-4" />
            </button>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            0/1 Knapsack helicopter gear allocation. Branch & Bound vs Greedy 2-Approx.
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
            Greedy 2-Approx
          </button>
        </div>
      </div>

      {/* Main Grid Viewport - Fills full space cleanly */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 my-4 overflow-hidden">
        {/* Left Side: Helicopter Cargo Visual */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Helicopter Cargo Bay</h3>
            <select
              value={selectedHelicopter || ''}
              onChange={e => {
                const id = Number(e.target.value);
                setSelectedHelicopter(id);
                const h = helicopters.find(x => x.id === id);
                if (h) {
                  setCapacity(Math.round(h.maxPayloadKg / 10));
                }
                resetAll();
              }}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2.5 py-1 text-xs focus:outline-none"
            >
              {helicopters.map(h => (
                <option key={h.id} value={h.id}>{h.callSign} (Max: {h.maxPayloadKg}kg)</option>
              ))}
            </select>
          </div>
          
          <div className="flex-grow flex flex-col items-center justify-center p-4 border border-dashed border-slate-800 rounded-lg bg-slate-900/50 overflow-hidden relative">
            
            {/* Animated Solid Silhouette Helicopter Vector SVG with weight shake reaction */}
            <div className="w-full flex justify-center mb-2 mt-4 z-10">
              <div 
                className={`relative flex items-center justify-center text-sky-400 transition-all duration-500 ease-in-out ${isHeavyDrop ? 'animate-weight-shake' : ''}`}
                style={{
                  width: `${85 + (capacity * 0.35)}px`,
                  height: `${35 + (capacity * 0.15)}px`
                }}
              >
                <svg className="w-full h-full fill-current animate-bounce" viewBox="0 -24 100 74">
                  {/* Helicopter solid body */}
                  <path d="M70 25c0-6.6-5.4-12-12-12H40c-6.6 0-12 5.4-12 12s5.4 12 12 12h18c6.6 0 12-5.4 12-12z" />
                  <path d="M58 13v-6h12v2h-10v4z" />
                  <path d="M40 37v-4h-8v4z" />
                  <rect x="24" y="24" width="8" height="4" rx="2" />
                  <line x1="28" y1="28" x2="28" y2="40" stroke="currentColor" strokeWidth="2" />
                  <line x1="16" y1="40" x2="52" y2="40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M28 25H5" stroke="currentColor" strokeWidth="4" />
                  <path d="M5 25V18" stroke="currentColor" strokeWidth="3" />
                  
                  {/* Correctly aligned main rotor blades spinning flat */}
                  <g transform="translate(64, 7)">
                    <line x1="-30" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth="2" className="animate-spin" style={{ transformOrigin: '0px 0px' }} />
                  </g>
                  
                  {/* Correctly aligned tail rotor blades */}
                  <g transform="translate(5, 18)">
                    <line x1="-8" y1="0" x2="8" y2="0" stroke="currentColor" strokeWidth="1.5" className="animate-spin" style={{ transformOrigin: '0px 0px' }} />
                  </g>
                </svg>
              </div>
            </div>

            <div className="text-xs text-slate-400 mb-2 font-semibold">
              Payload Load: <span className="text-sky-400">{currentWeight * 10}</span> / {capacity * 10} kg
            </div>
            
            <div 
              className="relative w-full bg-slate-800 border-4 border-slate-650 rounded-lg flex flex-col justify-end p-1 overflow-hidden shadow-inner transition-all duration-500 ease-in-out"
              style={{
                maxWidth: `${160 + (capacity * 0.7)}px`,
                height: `${140 + (capacity * 0.5)}px`
              }}
            >
              
              
              <div className="flex flex-col gap-1 w-full justify-end z-10">
                {renderedSelection.map(o => {
                  const isBest = (bestItems || []).includes(o.id);
                  
                  return (
                    <div
                      key={o.id}
                      className={`text-[9px] rounded flex items-center justify-between px-2 font-bold transition-colors duration-150 ${
                        o.isLeaving ? 'animate-package-throw bg-rose-800/85 text-slate-100 border border-rose-700' : 
                        isBest ? 'bg-emerald-700/90 text-emerald-50 border border-emerald-600 animate-package-drop shadow-lg shadow-emerald-950/20' : 
                        'bg-slate-700 text-slate-200 border border-slate-600 animate-package-drop'
                      }`}
                      style={{ 
                        height: `${(o.weight / capacity) * 140}px`, 
                        minHeight: '18px',
                      }}
                    >
                      <span className="truncate">{o.name}</span>
                      <span className="shrink-0 ml-1">{(o.weight * 10).toFixed(0)}kg</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-2 text-xs flex justify-between border-t border-slate-850 pt-2 text-slate-400">
            <div>Current Score: <span className="text-sky-400 font-bold text-sm">{currentValue}</span></div>
            <div>Best Max Score: <span className="text-emerald-400 font-bold text-sm">{bestValue}</span></div>
          </div>
        </div>

        {/* Right Side: Log trace */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col h-full overflow-hidden relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRunning ? 'bg-sky-400' : 'bg-slate-600'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isRunning ? 'bg-sky-500' : 'bg-slate-500'}`}></span>
              </div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Algorithm Execution Log</h3>
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
            {history.map((log, idx) => (
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
            {history.length === 0 && (
              <div className="text-slate-500 italic text-center my-auto text-xs">Press Start to begin trace...</div>
            )}
          </div>

          {/* Dedicated Decision Analysis Box at bottom */}
          <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-44 shrink-0 overflow-y-auto">
            <h4 className="text-[9px] uppercase font-bold tracking-wider text-sky-400 mb-1.5 flex items-center gap-1.5">
              <Info className="w-3 text-sky-400" />
              Allocation decision analyzer
            </h4>
            <p className="text-[10.5px] text-slate-300 font-mono leading-relaxed whitespace-pre-line">
              {selectedLog ? selectedLog.detail : "Click any step above to inspect its detailed evaluation metrics and branch-and-bound bounds."}
            </p>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div>Step count: <span className="font-bold text-sky-400">{stepIndex}</span></div>
          <div className="flex items-center gap-2">
            <span>Interval:</span>
             <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-slate-800 text-slate-100 rounded px-2 py-0.5 border border-slate-700 font-semibold"
            >
              <option value={1500}>1.5s (Slow)</option>
              <option value={800}>0.8s (Medium)</option>
              <option value={300}>0.3s (Fast)</option>
              <option value={50}>50ms (Turbo)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            {isRunning ? 'Pause Simulation' : (stepIndex > 0 ? 'Continue Simulation' : 'Start Simulation')}
          </button>
          
          <button
            onClick={skipSimulationToEnd}
            disabled={!isRunning}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 py-2.5 px-4 rounded-xl border border-slate-700 transition-all font-semibold text-xs shrink-0"
          >
            Skip to End
          </button>
          
          <button
            onClick={resetAll}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 transition-all"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
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
                M2: Resource Allocation Guide
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Module Lead Developers: <strong className="text-sky-400">Gajindu & Raaed</strong>
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
                This module helps you solve the <strong>0/1 Knapsack resource allocation problem</strong>. When a disaster strikes, we have a limited cargo weight limit on our rescue helicopters, but many camps need different relief items. This page lets you run algorithms that select the best set of items to load onto the helicopter to maximize our survival score.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Interactive Controls</h4>
              <ul className="list-disc pl-4 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-slate-100">Execution Speed Toggle:</strong> Switch between <span className="text-amber-400 font-semibold">🎬 Simulation</span> (renders step-by-step cargo loading animations, weight gauge updates, and upper bound calculations) and <span className="text-emerald-400 font-semibold">⚡ Instant</span> (bypasses visual delays, calculates optimal cargo manifest instantly, and populates all trace logs in 0ms).
                </li>
                <li>
                  <strong className="text-slate-100">Helicopter Selector (Top Left):</strong> Choose between three relief helicopters: <em>RESCUE-01 (700kg limit)</em>, <em>AIR-LIFTER (950kg limit)</em>, or <em>CARGO-MAX (1200kg limit)</em>.
                </li>
                <li>
                  <strong className="text-slate-100">Algorithm Toggles (Top Right):</strong> Select between <em>Branch & Bound</em> (guarantees the mathematically optimal maximum score) and <em>Greedy 2-Approx</em> (fast ratio-based heuristic).
                </li>
                <li>
                  <strong className="text-slate-100">Start / Pause / Continue Simulation:</strong> Play or pause the step-by-step trace of how the algorithm processes relief cargo items.
                </li>
                <li>
                  <strong className="text-slate-100">Skip to End:</strong> Instantly completes remaining steps and renders the final optimal manifest.
                </li>
                <li>
                  <strong className="text-slate-100">Reset Button:</strong> Stops any running simulation, clears all logs, and resets the cargo bay to standby.
                </li>
                <li>
                  <strong className="text-slate-100">Copy Logs:</strong> Copies all decision details and Knapsack upper bound calculations to your clipboard.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sky-400 uppercase tracking-wide text-[10px] mb-1.5">Algorithm Test Scenarios</h4>
              <ul className="list-disc pl-4 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-slate-100">Scenario 1: RESCUE-01 (700kg Limit)</strong> - Test tight packing. <em>Branch & Bound</em> prunes heavy combinations quickly. <em>Greedy</em> runs instantly by grabbing top-ratio items, but might miss the absolute optimum.
                </li>
                <li>
                  <strong className="text-slate-100">Scenario 2: AIR-LIFTER (950kg Limit)</strong> - Test bounds and heuristic gap. <em>Branch & Bound</em> prunes sub-branches using fractional upper bounds. <em>Greedy</em> checks the single largest item to guarantee its provable 2-approximation bound.
                </li>
                <li>
                  <strong className="text-slate-100">Scenario 3: CARGO-MAX (1200kg Limit)</strong> - Large cargo payload. <em>Branch & Bound</em> explores multiple options to resolve the maximum score of 400. <em>Greedy</em> runs in linear time to quickly fill the cargo bay.
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
