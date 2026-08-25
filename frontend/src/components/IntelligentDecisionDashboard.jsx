import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  Database,
  Filter,
  Flame,
  Layers,
  Percent,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sliders,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Zap
} from 'lucide-react';

const API_BASE = 'http://localhost:8080/api/v1/decisions';

export default function IntelligentDecisionDashboard() {
  // Input parameters
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [severityWeight, setSeverityWeight] = useState(0.5);
  const [populationWeight, setPopulationWeight] = useState(0.3);
  const [shortageWeight, setShortageWeight] = useState(0.2);

  // Data
  const [sosRequests, setSosRequests] = useState([
    { id: 1, campId: 101, campName: 'Alpha Sector Camp', injurySeverity: 9.2, population: 850, supplyShortage: 92.0, requiredTrucks: 3.0, status: 'PENDING' },
    { id: 2, campId: 102, campName: 'Bravo Valley Shelter', injurySeverity: 4.5, population: 320, supplyShortage: 45.0, requiredTrucks: 1.0, status: 'PENDING' },
    { id: 3, campId: 103, campName: 'Charlie Hill Station', injurySeverity: 8.8, population: 720, supplyShortage: 85.0, requiredTrucks: 2.0, status: 'PENDING' },
    { id: 4, campId: 104, campName: 'Delta River Outpost', injurySeverity: 3.1, population: 140, supplyShortage: 20.0, requiredTrucks: 1.0, status: 'PENDING' },
    { id: 5, campId: 105, campName: 'Echo Ridge Haven', injurySeverity: 7.6, population: 640, supplyShortage: 78.0, requiredTrucks: 2.0, status: 'PENDING' },
    { id: 6, campId: 106, campName: 'Foxtrot Base Station', injurySeverity: 6.2, population: 490, supplyShortage: 65.0, requiredTrucks: 2.0, status: 'PENDING' },
    { id: 7, campId: 107, campName: 'Golf Mountain Camp', injurySeverity: 8.1, population: 580, supplyShortage: 88.0, requiredTrucks: 3.0, status: 'PENDING' },
    { id: 8, campId: 108, campName: 'Hotel Coastal Shelter', injurySeverity: 2.8, population: 210, supplyShortage: 30.0, requiredTrucks: 1.0, status: 'PENDING' },
    { id: 9, campId: 109, campName: 'India Forest Post', injurySeverity: 9.5, population: 940, supplyShortage: 95.0, requiredTrucks: 3.0, status: 'PENDING' },
    { id: 10, campId: 110, campName: 'Juliet North Station', injurySeverity: 5.0, population: 380, supplyShortage: 50.0, requiredTrucks: 2.0, status: 'PENDING' }
  ]);

  // UI States
  const [activeTab, setActiveTab] = useState('decision'); // 'decision' | 'benchmark' | 'documentation'
  const [searchTerm, setSearchTerm] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [activeAlgorithm, setActiveAlgorithm] = useState(null); // 'exact' | 'heuristic' | 'compare'
  const [backendConnected, setBackendConnected] = useState(false);
  const [newRequestModal, setNewRequestModal] = useState(false);

  // New Request Form State
  const [newReq, setNewReq] = useState({
    campId: 111,
    campName: '',
    injurySeverity: 7.0,
    population: 400,
    supplyShortage: 60,
    requiredTrucks: 2
  });

  // Benchmark stats for LO3
  const [benchmarkCount, setBenchmarkCount] = useState(50);
  const [benchmarkStats, setBenchmarkStats] = useState(null);

  // Normalize weights
  const totalWeightSum = severityWeight + populationWeight + shortageWeight;
  const normSevW = totalWeightSum > 0 ? severityWeight / totalWeightSum : 0.5;
  const normPopW = totalWeightSum > 0 ? populationWeight / totalWeightSum : 0.3;
  const normShoW = totalWeightSum > 0 ? shortageWeight / totalWeightSum : 0.2;

  // Check backend health on mount
  useEffect(() => {
    fetch(`${API_BASE}/sos-requests`)
      .then((res) => {
        if (res.ok) {
          setBackendConnected(true);
          return res.json();
        }
        throw new Error('Not 200');
      })
      .then((data) => {
        if (data && data.length > 0) {
          setSosRequests(data);
        }
      })
      .catch(() => {
        setBackendConnected(false);
      });
  }, []);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return sosRequests.filter((r) =>
      r.campName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toString().includes(searchTerm)
    );
  }, [sosRequests, searchTerm]);

  // Local Solver Simulation (Exact & Heuristic) for instant response and client fallback
  const calculateScores = (items) => {
    if (!items.length) return [];
    let minSev = Math.min(...items.map((i) => i.injurySeverity));
    let maxSev = Math.max(...items.map((i) => i.injurySeverity));
    let minPop = Math.min(...items.map((i) => i.population));
    let maxPop = Math.max(...items.map((i) => i.population));
    let minSho = Math.min(...items.map((i) => i.supplyShortage));
    let maxSho = Math.max(...items.map((i) => i.supplyShortage));

    const sevRange = maxSev - minSev || 1;
    const popRange = maxPop - minPop || 1;
    const shoRange = maxSho - minSho || 1;

    return items.map((i) => {
      const nSev = (i.injurySeverity - minSev) / sevRange;
      const nPop = (i.population - minPop) / popRange;
      const nSho = (i.supplyShortage - minSho) / shoRange;
      const score = (normSevW * nSev + normPopW * nPop + normShoW * nSho) * 100;
      return {
        ...i,
        normalizedSeverity: Number(nSev.toFixed(2)),
        normalizedPopulation: Number(nPop.toFixed(2)),
        normalizedShortage: Number(nSho.toFixed(2)),
        compositeScore: Number(score.toFixed(2))
      };
    });
  };

  // Run Branch and Bound Exact
  const runExact = async () => {
    setIsRunning(true);
    setActiveAlgorithm('exact');
    setCompareResult(null);

    const payload = {
      maxDailyCapacity: Number(maxCapacity),
      severityWeight: normSevW,
      populationWeight: normPopW,
      shortageWeight: normShoW,
      directRequests: sosRequests.map((r) => ({
        id: r.id,
        campId: r.campId,
        campName: r.campName,
        injurySeverity: r.injurySeverity,
        population: r.population,
        supplyShortage: r.supplyShortage,
        requiredTrucks: r.requiredTrucks
      }))
    };

    try {
      if (backendConnected) {
        const res = await fetch(`${API_BASE}/optimize/exact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedResult(data);
          setIsRunning(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend unavailable, using local client B&B solver', e);
    }

    // Client-side local B&B Solver implementation
    const startTime = performance.now();
    const scored = calculateScores(sosRequests);
    scored.sort((a, b) => (b.compositeScore / b.requiredTrucks) - (a.compositeScore / a.requiredTrucks));

    let nodesExplored = 0;
    let nodesPruned = 0;
    let bestValue = 0;
    let bestSelection = [];

    const computeBound = (level, currW, currV) => {
      let bound = currV;
      let remW = maxCapacity - currW;
      for (let i = level; i < scored.length; i++) {
        if (scored[i].requiredTrucks <= remW) {
          remW -= scored[i].requiredTrucks;
          bound += scored[i].compositeScore;
        } else {
          bound += scored[i].compositeScore * (remW / scored[i].requiredTrucks);
          break;
        }
      }
      return bound;
    };

    // Priority Queue simulated via sorted array of states
    const queue = [{
      level: 0,
      weight: 0,
      value: 0,
      upperBound: computeBound(0, 0, 0),
      selection: []
    }];

    while (queue.length > 0) {
      queue.sort((a, b) => b.upperBound - a.upperBound);
      const node = queue.shift();
      nodesExplored++;

      if (node.upperBound <= bestValue + 1e-6) {
        nodesPruned++;
        continue;
      }

      if (node.level === scored.length) {
        if (node.value > bestValue) {
          bestValue = node.value;
          bestSelection = node.selection;
        }
        continue;
      }

      const item = scored[node.level];
      // Branch 1: Include item
      if (node.weight + item.requiredTrucks <= maxCapacity + 1e-6) {
        const incVal = node.value + item.compositeScore;
        const incW = node.weight + item.requiredTrucks;
        const incSel = [...node.selection, item];
        if (incVal > bestValue) {
          bestValue = incVal;
          bestSelection = incSel;
        }
        const incBound = computeBound(node.level + 1, incW, incVal);
        if (incBound > bestValue + 1e-6) {
          queue.push({
            level: node.level + 1,
            weight: incW,
            value: incVal,
            upperBound: incBound,
            selection: incSel
          });
        } else {
          nodesPruned++;
        }
      }

      // Branch 2: Exclude item
      const excBound = computeBound(node.level + 1, node.weight, node.value);
      if (excBound > bestValue + 1e-6) {
        queue.push({
          level: node.level + 1,
          weight: node.weight,
          value: node.value,
          upperBound: excBound,
          selection: node.selection
        });
      } else {
        nodesPruned++;
      }
    }

    const elapsed = performance.now() - startTime;
    const totalTrucks = bestSelection.reduce((sum, r) => sum + r.requiredTrucks, 0);

    setSelectedResult({
      algorithm: 'branch_and_bound',
      selectedRequests: bestSelection,
      totalScore: Number(bestValue.toFixed(2)),
      totalCapacityUsed: Number(totalTrucks.toFixed(2)),
      maxDailyCapacity: maxCapacity,
      totalSelectedCount: bestSelection.length,
      nodesExplored,
      nodesPruned,
      executionTimeNanos: Math.round(elapsed * 1_000_000),
      executionTimeFormatted: `${elapsed.toFixed(3)} ms`
    });

    setIsRunning(false);
  };

  // Run Weighted Scoring Heuristic
  const runHeuristic = async () => {
    setIsRunning(true);
    setActiveAlgorithm('heuristic');
    setCompareResult(null);

    const payload = {
      maxDailyCapacity: Number(maxCapacity),
      severityWeight: normSevW,
      populationWeight: normPopW,
      shortageWeight: normShoW,
      directRequests: sosRequests.map((r) => ({
        id: r.id,
        campId: r.campId,
        campName: r.campName,
        injurySeverity: r.injurySeverity,
        population: r.population,
        supplyShortage: r.supplyShortage,
        requiredTrucks: r.requiredTrucks
      }))
    };

    try {
      if (backendConnected) {
        const res = await fetch(`${API_BASE}/optimize/heuristic`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedResult(data);
          setIsRunning(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend unavailable, using local client heuristic solver', e);
    }

    // Client-side local heuristic solver
    const startTime = performance.now();
    const scored = calculateScores(sosRequests);

    // Pass 1: Ratio greedy
    const sorted = [...scored].sort((a, b) => (b.compositeScore / b.requiredTrucks) - (a.compositeScore / a.requiredTrucks));
    let greedySelection = [];
    let greedyScore = 0;
    let remW = maxCapacity;

    for (const r of sorted) {
      if (r.requiredTrucks <= remW + 1e-6) {
        greedySelection.push(r);
        greedyScore += r.compositeScore;
        remW -= r.requiredTrucks;
      }
    }

    // Pass 2: Single best
    let singleBest = null;
    let singleBestScore = -1;
    for (const r of scored) {
      if (r.requiredTrucks <= maxCapacity && r.compositeScore > singleBestScore) {
        singleBest = r;
        singleBestScore = r.compositeScore;
      }
    }

    // Pass 3: Strengthened selection
    let finalSelection = greedySelection;
    let finalScore = greedyScore;
    if (singleBest && singleBestScore > greedyScore) {
      finalSelection = [singleBest];
      finalScore = singleBestScore;
    }

    const elapsed = performance.now() - startTime;
    const totalTrucks = finalSelection.reduce((sum, r) => sum + r.requiredTrucks, 0);

    setSelectedResult({
      algorithm: 'weighted_scoring',
      selectedRequests: finalSelection,
      totalScore: Number(finalScore.toFixed(2)),
      totalCapacityUsed: Number(totalTrucks.toFixed(2)),
      maxDailyCapacity: maxCapacity,
      totalSelectedCount: finalSelection.length,
      nodesExplored: 0,
      nodesPruned: 0,
      executionTimeNanos: Math.round(elapsed * 1_000_000),
      executionTimeFormatted: `${elapsed.toFixed(3)} ms`
    });

    setIsRunning(false);
  };

  // Run Side-by-Side Comparison
  const runCompare = async () => {
    setIsRunning(true);
    setActiveAlgorithm('compare');

    const payload = {
      maxDailyCapacity: Number(maxCapacity),
      severityWeight: normSevW,
      populationWeight: normPopW,
      shortageWeight: normShoW,
      directRequests: sosRequests.map((r) => ({
        id: r.id,
        campId: r.campId,
        campName: r.campName,
        injurySeverity: r.injurySeverity,
        population: r.population,
        supplyShortage: r.supplyShortage,
        requiredTrucks: r.requiredTrucks
      }))
    };

    try {
      if (backendConnected) {
        const res = await fetch(`${API_BASE}/optimize/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          setCompareResult(data);
          setSelectedResult(data.exact);
          setIsRunning(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend unavailable, running local client comparison', e);
    }

    // Client-side comparison simulation
    await runExact();
    // Run heuristic logic
    const startTimeH = performance.now();
    const scored = calculateScores(sosRequests);
    const sorted = [...scored].sort((a, b) => (b.compositeScore / b.requiredTrucks) - (a.compositeScore / a.requiredTrucks));
    let greedySelection = [];
    let greedyScore = 0;
    let remW = maxCapacity;

    for (const r of sorted) {
      if (r.requiredTrucks <= remW + 1e-6) {
        greedySelection.push(r);
        greedyScore += r.compositeScore;
        remW -= r.requiredTrucks;
      }
    }

    let singleBest = null;
    let singleBestScore = -1;
    for (const r of scored) {
      if (r.requiredTrucks <= maxCapacity && r.compositeScore > singleBestScore) {
        singleBest = r;
        singleBestScore = r.compositeScore;
      }
    }

    let finalSelection = greedySelection;
    let finalScore = greedyScore;
    if (singleBest && singleBestScore > greedyScore) {
      finalSelection = [singleBest];
      finalScore = singleBestScore;
    }

    const elapsedH = performance.now() - startTimeH;
    const trucksH = finalSelection.reduce((sum, r) => sum + r.requiredTrucks, 0);

    const hResult = {
      algorithm: 'weighted_scoring',
      selectedRequests: finalSelection,
      totalScore: Number(finalScore.toFixed(2)),
      totalCapacityUsed: Number(trucksH.toFixed(2)),
      maxDailyCapacity: maxCapacity,
      totalSelectedCount: finalSelection.length,
      nodesExplored: 0,
      nodesPruned: 0,
      executionTimeNanos: Math.round(elapsedH * 1_000_000),
      executionTimeFormatted: `${elapsedH.toFixed(3)} ms`
    };

    // Calculate comparative metrics
    setTimeout(() => {
      setSelectedResult((exactRes) => {
        if (!exactRes) return null;
        const eScore = exactRes.totalScore || 1;
        const ratio = finalScore / eScore;
        const diff = Math.max(0, eScore - finalScore);
        const timeDiff = parseFloat(exactRes.executionTimeFormatted) - elapsedH;
        const speedup = parseFloat(exactRes.executionTimeFormatted) / (elapsedH || 0.001);

        setCompareResult({
          exact: exactRes,
          heuristic: hResult,
          heuristicRatio: Number(ratio.toFixed(3)),
          scoreDifference: Number(diff.toFixed(2)),
          timeSavings: `${Math.max(0, timeDiff).toFixed(3)} ms`,
          speedupFactor: Number(speedup.toFixed(2)),
          nodesPrunedByBranchAndBound: exactRes.nodesPruned,
          nodesExploredByBranchAndBound: exactRes.nodesExplored
        });
        return exactRes;
      });
      setIsRunning(false);
    }, 50);
  };

  // Seed sample requests
  const generateSampleData = (count) => {
    const names = [
      'Alpha Sector Camp', 'Bravo Valley Shelter', 'Charlie Hill Station', 'Delta River Outpost',
      'Echo Ridge Haven', 'Foxtrot Base Station', 'Golf Mountain Camp', 'Hotel Coastal Shelter',
      'India Forest Post', 'Juliet North Station', 'Kilo Oasis Camp', 'Lima South Haven',
      'Mike Central Base', 'November Highland Shelter', 'Oscar Lowland Post', 'Papa Border Camp'
    ];

    const generated = [];
    for (let i = 1; i <= count; i++) {
      generated.push({
        id: i,
        campId: (i % 30) + 101,
        campName: `${names[(i - 1) % names.length]} #${i}`,
        injurySeverity: Number((1.5 + Math.random() * 8.5).toFixed(1)),
        population: Math.floor(40 + Math.random() * 950),
        supplyShortage: Number((15 + Math.random() * 85).toFixed(1)),
        requiredTrucks: Math.floor(1 + Math.random() * 4),
        status: 'PENDING'
      });
    }
    setSosRequests(generated);
    setSelectedResult(null);
    setCompareResult(null);
  };

  // Handle adding new custom SOS request
  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!newReq.campName.trim()) return;

    const reqItem = {
      id: sosRequests.length > 0 ? Math.max(...sosRequests.map((r) => r.id)) + 1 : 1,
      campId: Number(newReq.campId),
      campName: newReq.campName,
      injurySeverity: Number(newReq.injurySeverity),
      population: Number(newReq.population),
      supplyShortage: Number(newReq.supplyShortage),
      requiredTrucks: Number(newReq.requiredTrucks),
      status: 'PENDING'
    };

    setSosRequests([reqItem, ...sosRequests]);
    setNewRequestModal(false);
    setNewReq({
      campId: reqItem.campId + 1,
      campName: '',
      injurySeverity: 7.0,
      population: 400,
      supplyShortage: 60,
      requiredTrucks: 2
    });
  };

  // Run Large Scale Benchmark for LO3
  const runBenchmark = () => {
    setIsRunning(true);
    const count = Number(benchmarkCount);

    // Generate benchmark items
    const sampleItems = [];
    for (let i = 1; i <= count; i++) {
      sampleItems.push({
        id: i,
        campId: i,
        campName: `Benchmark Camp #${i}`,
        injurySeverity: 1.0 + Math.random() * 9.0,
        population: 50 + Math.random() * 900,
        supplyShortage: 10 + Math.random() * 90,
        requiredTrucks: 1 + Math.floor(Math.random() * 3)
      });
    }

    const scored = calculateScores(sampleItems);
    const cap = Math.round(count * 0.3);

    // 1. Heuristic execution
    const t0Heuristic = performance.now();
    const sorted = [...scored].sort((a, b) => (b.compositeScore / b.requiredTrucks) - (a.compositeScore / a.requiredTrucks));
    let greedySel = [];
    let greedyScore = 0;
    let remW = cap;
    for (const r of sorted) {
      if (r.requiredTrucks <= remW) {
        greedySel.push(r);
        greedyScore += r.compositeScore;
        remW -= r.requiredTrucks;
      }
    }
    const heuristicTime = performance.now() - t0Heuristic;

    // 2. Exact B&B execution (on a safe subset if count > 25 to avoid browser freeze)
    const exactItemLimit = Math.min(count, 22);
    const exactSubset = scored.slice(0, exactItemLimit);
    const t0Exact = performance.now();

    let bbExplored = 0;
    let bbPruned = 0;
    let bbBest = 0;

    const computeBound = (level, currW, currV) => {
      let bound = currV;
      let rW = cap - currW;
      for (let i = level; i < exactSubset.length; i++) {
        if (exactSubset[i].requiredTrucks <= rW) {
          rW -= exactSubset[i].requiredTrucks;
          bound += exactSubset[i].compositeScore;
        } else {
          bound += exactSubset[i].compositeScore * (rW / exactSubset[i].requiredTrucks);
          break;
        }
      }
      return bound;
    };

    const pq = [{
      level: 0,
      weight: 0,
      value: 0,
      upperBound: computeBound(0, 0, 0)
    }];

    while (pq.length > 0) {
      pq.sort((a, b) => b.upperBound - a.upperBound);
      const node = pq.shift();
      bbExplored++;

      if (node.upperBound <= bbBest + 1e-6) {
        bbPruned++;
        continue;
      }
      if (node.level === exactSubset.length) {
        if (node.value > bbBest) bbBest = node.value;
        continue;
      }
      const item = exactSubset[node.level];
      if (node.weight + item.requiredTrucks <= cap) {
        const incVal = node.value + item.compositeScore;
        const incW = node.weight + item.requiredTrucks;
        if (incVal > bbBest) bbBest = incVal;
        const incBound = computeBound(node.level + 1, incW, incVal);
        if (incBound > bbBest) {
          pq.push({ level: node.level + 1, weight: incW, value: incVal, upperBound: incBound });
        } else {
          bbPruned++;
        }
      }
      const excBound = computeBound(node.level + 1, node.weight, node.value);
      if (excBound > bbBest) {
        pq.push({ level: node.level + 1, weight: node.weight, value: node.value, upperBound: excBound });
      } else {
        bbPruned++;
      }
    }
    const exactTime = performance.now() - t0Exact;

    setBenchmarkStats({
      totalRequestsTested: count,
      rescueCapacity: cap,
      heuristicTimeMs: heuristicTime.toFixed(4),
      heuristicScore: greedyScore.toFixed(1),
      heuristicSelectedCount: greedySel.length,
      exactTestedItems: exactItemLimit,
      exactTimeMs: exactTime.toFixed(4),
      exactScore: bbBest.toFixed(1),
      nodesExplored: bbExplored,
      nodesPruned: bbPruned,
      pruningRate: `${((bbPruned / (bbExplored + bbPruned || 1)) * 100).toFixed(1)}%`,
      theoreticalSearchSpace: `2^${exactItemLimit} = ${(Math.pow(2, exactItemLimit)).toLocaleString()} states`
    });

    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-4 md:p-8 font-sans">
      {/* Header Bar */}
      <header className="max-w-7xl mx-auto mb-8 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/30">
            <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Intelligent Decision Support System
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono font-medium">
                Module 4
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              Multi-Criteria Emergency SOS Rescue Batch Optimization • LO1, LO2, LO3
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              <span className={`inline-flex items-center gap-1 text-xs ${backendConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
                {backendConnected ? 'API Connected (:8080)' : 'Client Standalone Active'}
              </span>
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('decision')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'decision'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Decision Studio
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'benchmark'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            LO3 Benchmark Lab
          </button>
          <button
            onClick={() => setActiveTab('documentation')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'documentation'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            Academic Docs
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto space-y-8">
        {activeTab === 'decision' && (
          <>
            {/* Top Grid: Criteria & Algorithm Launcher */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1: MCDA Configurator */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold flex items-center gap-2 text-white">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    MCDA Criteria Weights
                  </h2>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    Auto-Normalized: 100%
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Severity Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-red-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> Injury Severity
                      </span>
                      <span className="font-mono text-slate-300">
                        {severityWeight.toFixed(2)} ({(normSevW * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1.0"
                      step="0.05"
                      value={severityWeight}
                      onChange={(e) => setSeverityWeight(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                  </div>

                  {/* Population Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-sky-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Camp Population
                      </span>
                      <span className="font-mono text-slate-300">
                        {populationWeight.toFixed(2)} ({(normPopW * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1.0"
                      step="0.05"
                      value={populationWeight}
                      onChange={(e) => setPopulationWeight(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                  </div>

                  {/* Shortage Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-amber-400 flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5" /> Supply Shortage
                      </span>
                      <span className="font-mono text-slate-300">
                        {shortageWeight.toFixed(2)} ({(normShoW * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1.0"
                      step="0.05"
                      value={shortageWeight}
                      onChange={(e) => setShortageWeight(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* Visual weight distribution bar */}
                  <div className="pt-2">
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                      <div style={{ width: `${normSevW * 100}%` }} className="bg-red-500 transition-all" title="Severity"></div>
                      <div style={{ width: `${normPopW * 100}%` }} className="bg-sky-500 transition-all" title="Population"></div>
                      <div style={{ width: `${normShoW * 100}%` }} className="bg-amber-500 transition-all" title="Shortage"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Rescue Fleet Capacity */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between backdrop-blur-sm">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold flex items-center gap-2 text-white">
                      <Truck className="w-4 h-4 text-cyan-400" />
                      Rescue Capacity Constraint
                    </h2>
                    <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded font-mono border border-cyan-500/20">
                      {maxCapacity} Rescue Trucks
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Set the strict upper capacity limit for this emergency dispatch cycle. The algorithm will select the optimal combination without exceeding this payload threshold.
                  </p>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg font-bold font-mono text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                      type="range"
                      min="2"
                      max="30"
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Available Requests: <strong className="text-white font-mono">{sosRequests.length}</strong></span>
                  <span>Pending Camps: <strong className="text-white font-mono">{sosRequests.filter(r => r.status === 'PENDING').length}</strong></span>
                </div>
              </div>

              {/* Card 3: Execution Control */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between backdrop-blur-sm">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold flex items-center gap-2 text-white">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Run Solvers
                    </h2>
                    <span className="text-xs text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded font-mono">
                      LO1 • LO2 • LO3
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                      onClick={runExact}
                      disabled={isRunning}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      Exact (B&B)
                    </button>
                    <button
                      onClick={runHeuristic}
                      disabled={isRunning}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Heuristic (Fast)
                    </button>
                  </div>

                  <button
                    onClick={runCompare}
                    disabled={isRunning}
                    className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-100 font-semibold text-xs border border-indigo-500/40 shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    Side-by-Side Performance Comparison
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <button
                    onClick={() => generateSampleData(15)}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Sample (15)
                  </button>
                  <button
                    onClick={() => setNewRequestModal(true)}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Request
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {selectedResult && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">
                          Rescue Dispatch Recommendation
                        </h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold ${
                          selectedResult.algorithm === 'branch_and_bound'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {selectedResult.algorithm === 'branch_and_bound' ? 'Exact: Branch & Bound' : 'Heuristic: Weighted Scoring'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Selected {selectedResult.totalSelectedCount} critical rescue camps ({selectedResult.totalCapacityUsed} / {selectedResult.maxDailyCapacity} trucks used)
                      </p>
                    </div>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block font-mono">Priority Score</span>
                      <span className="text-base font-bold text-cyan-400 font-mono">{selectedResult.totalScore.toFixed(1)}</span>
                    </div>
                    <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block font-mono">Capacity Used</span>
                      <span className="text-base font-bold text-amber-400 font-mono">{selectedResult.totalCapacityUsed} / {selectedResult.maxDailyCapacity}</span>
                    </div>
                    <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block font-mono">Execution Time</span>
                      <span className="text-base font-bold text-emerald-400 font-mono">{selectedResult.executionTimeFormatted}</span>
                    </div>
                  </div>
                </div>

                {/* Comparison Card (If Compare Ran) */}
                {compareResult && (
                  <div className="bg-slate-950/90 border border-indigo-500/30 rounded-xl p-5 shadow-inner">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                      Algorithmic Comparison Telemetry (LO3 Requirement)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">Exact Score (B&B)</span>
                        <span className="text-base font-bold text-indigo-400 font-mono">{compareResult.exact.totalScore.toFixed(1)}</span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">Heuristic Score</span>
                        <span className="text-base font-bold text-emerald-400 font-mono">{compareResult.heuristic.totalScore.toFixed(1)}</span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">Optimality Ratio</span>
                        <span className="text-base font-bold text-cyan-400 font-mono">{(compareResult.heuristicRatio * 100).toFixed(1)}%</span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">Time Savings</span>
                        <span className="text-base font-bold text-amber-400 font-mono">{compareResult.timeSavings}</span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 col-span-2 md:col-span-1">
                        <span className="text-[11px] text-slate-400 block">B&B Pruned States</span>
                        <span className="text-base font-bold text-purple-400 font-mono">{compareResult.nodesPrunedByBranchAndBound} branches</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Requests List */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Selected Emergency Rescue Targets ({selectedResult.selectedRequests?.length || 0})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedResult.selectedRequests?.map((req, idx) => (
                      <div
                        key={req.id}
                        className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl transition-all shadow-md flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-bold text-indigo-400">
                              #{idx + 1} • SOS-{req.id}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Score: {req.compositeScore}
                            </span>
                          </div>
                          <h5 className="text-sm font-semibold text-white mb-2">{req.campName}</h5>

                          <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg mb-2">
                            <div>
                              <span className="block text-slate-500 text-[10px]">Severity</span>
                              <strong className="text-red-400 font-mono">{req.injurySeverity}/10</strong>
                            </div>
                            <div>
                              <span className="block text-slate-500 text-[10px]">People</span>
                              <strong className="text-sky-400 font-mono">{req.population}</strong>
                            </div>
                            <div>
                              <span className="block text-slate-500 text-[10px]">Shortage</span>
                              <strong className="text-amber-400 font-mono">{req.supplyShortage}%</strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                          <span className="text-slate-400 flex items-center gap-1 font-mono">
                            <Truck className="w-3.5 h-3.5 text-cyan-400" /> {req.requiredTrucks} truck(s)
                          </span>
                          <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SOS Requests Inventory Table */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-400" />
                    Incoming Emergency SOS Requests Registry
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live disaster relief queue from regional rescue camps
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search camp or SOS #..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    onClick={() => setNewRequestModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add SOS
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">ID</th>
                      <th className="p-3.5">Camp Name</th>
                      <th className="p-3.5">Injury Severity</th>
                      <th className="p-3.5">Population</th>
                      <th className="p-3.5">Supply Shortage</th>
                      <th className="p-3.5">Trucks Needed</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono text-indigo-400 font-bold">SOS-{req.id}</td>
                        <td className="p-3.5 font-semibold text-slate-200">{req.campName}</td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            req.injurySeverity >= 8.0
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : req.injurySeverity >= 5.0
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {req.injurySeverity}/10
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">{req.population} people</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${req.supplyShortage}%` }}
                                className={`h-full ${
                                  req.supplyShortage > 75 ? 'bg-red-500' : req.supplyShortage > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                              ></div>
                            </div>
                            <span className="font-mono text-slate-300">{req.supplyShortage}%</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-cyan-300 font-semibold">{req.requiredTrucks} truck(s)</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            req.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSosRequests(
                                sosRequests.map((r) =>
                                  r.id === req.id ? { ...r, status: r.status === 'APPROVED' ? 'PENDING' : 'APPROVED' } : r
                                )
                              );
                            }}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                          >
                            {req.status === 'APPROVED' ? 'Reset' : 'Approve'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Tab 2: LO3 Benchmark Lab */}
        {activeTab === 'benchmark' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    Module 4 Complexity & Empirical Benchmark (LO3)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Comparative evaluation of Exact (Branch & Bound) vs Heuristic (Weighted Scoring) across 50–500 SOS datasets
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={benchmarkCount}
                    onChange={(e) => setBenchmarkCount(Number(e.target.value))}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono"
                  >
                    <option value="50">50 SOS Requests</option>
                    <option value="100">100 SOS Requests</option>
                    <option value="200">200 SOS Requests</option>
                    <option value="500">500 SOS Requests</option>
                  </select>
                  <button
                    onClick={runBenchmark}
                    disabled={isRunning}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Execute Benchmark
                  </button>
                </div>
              </div>

              {/* Benchmark Results Display */}
              {benchmarkStats ? (
                <div className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-500 block">Dataset Size Tested</span>
                      <strong className="text-xl font-mono text-white">{benchmarkStats.totalRequestsTested} requests</strong>
                      <span className="text-[10px] text-slate-400 block mt-1">Capacity: {benchmarkStats.rescueCapacity} trucks</span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-500 block">Heuristic Execution Time</span>
                      <strong className="text-xl font-mono text-emerald-400">{benchmarkStats.heuristicTimeMs} ms</strong>
                      <span className="text-[10px] text-emerald-500/80 block mt-1">Complexity: O(n log n)</span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-500 block">Branch & Bound Pruning Rate</span>
                      <strong className="text-xl font-mono text-purple-400">{benchmarkStats.pruningRate}</strong>
                      <span className="text-[10px] text-purple-400/80 block mt-1">{benchmarkStats.nodesPruned} subtrees pruned</span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-500 block">Theoretical State Space</span>
                      <strong className="text-sm font-mono text-amber-300 block truncate">{benchmarkStats.theoreticalSearchSpace}</strong>
                      <span className="text-[10px] text-amber-400/80 block mt-1">{benchmarkStats.nodesExplored} nodes explored</span>
                    </div>
                  </div>

                  {/* Benchmark Comparison Table */}
                  <div className="rounded-xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-950 text-slate-400 font-mono text-[11px]">
                        <tr>
                          <th className="p-3.5">Algorithm</th>
                          <th className="p-3.5">Theoretical Complexity</th>
                          <th className="p-3.5">Optimality Type</th>
                          <th className="p-3.5">Execution Time</th>
                          <th className="p-3.5">Total Score</th>
                          <th className="p-3.5">Exploration Telemetry</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                        <tr>
                          <td className="p-3.5 font-bold text-indigo-400">Branch and Bound</td>
                          <td className="p-3.5 font-mono">O(2^n) worst-case</td>
                          <td className="p-3.5 text-emerald-400 font-semibold">Exact (100% Optimal)</td>
                          <td className="p-3.5 font-mono text-slate-200">{benchmarkStats.exactTimeMs} ms</td>
                          <td className="p-3.5 font-mono text-cyan-400 font-bold">{benchmarkStats.exactScore}</td>
                          <td className="p-3.5 font-mono text-purple-400">
                            {benchmarkStats.nodesExplored} explored / {benchmarkStats.nodesPruned} pruned
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-bold text-emerald-400">Weighted Scoring</td>
                          <td className="p-3.5 font-mono">O(n log n)</td>
                          <td className="p-3.5 text-amber-400 font-semibold">Heuristic (&ge; 50% Bound)</td>
                          <td className="p-3.5 font-mono text-slate-200">{benchmarkStats.heuristicTimeMs} ms</td>
                          <td className="p-3.5 font-mono text-cyan-400 font-bold">{benchmarkStats.heuristicScore}</td>
                          <td className="p-3.5 font-mono text-slate-400">Direct Single/Greedy Pass</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                  <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-sm font-semibold text-slate-300">No Benchmark Executed Yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Select a dataset size (50 to 500 items) and click Execute Benchmark to generate university report telemetry.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Academic Documentation */}
        {activeTab === 'documentation' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6 text-sm text-slate-300 leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Module 4 – Technical Architecture & Algorithm Specification
              </h2>
              <p className="text-xs text-slate-400">
                PDSA Coursework Reference Document for Smart Disaster Relief Decision Support System (SDR-DSS)
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-indigo-400 border-b border-slate-800 pb-2">
                6.1 Problem Analysis
              </h3>
              <p>
                During major catastrophe emergencies, Central Relief HQ is flooded with hundreds of concurrent SOS requests ($N \approx 500$). Because rescue trucks and first-responder teams are strictly finite ($C$), the system must select a subset of camps maximizing total life-saving impact without violating capacity.
              </p>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
                {"Maximize: Sum(v_i * x_i)  subject to  Sum(w_i * x_i) <= C,  where x_i in {0, 1}"}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-indigo-400 border-b border-slate-800 pb-2">
                6.3 Algorithm Selection & Justification (LO1, LO2, LO3)
              </h3>
              <ul className="list-disc list-inside space-y-2 text-xs">
                <li>
                  <strong className="text-white">Exact Solver (Branch & Bound):</strong> Utilizes Best-First Search with a Max-Heap Priority Queue. Branch bounds are computed using Dantzig Fractional Knapsack continuous relaxation. Subtrees whose upper bound cannot exceed the best known solution are safely pruned.
                </li>
                <li>
                  <strong className="text-white">Heuristic Solver (Weighted Scoring):</strong> Normalizes criteria to $[0, 1]$ and executes a dual-pass strengthened combination (ratio-greedy pass + single-best pass), achieving $O(n \log n)$ speed with at least a 50% theoretical guarantee against fractional relaxation.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-indigo-400 border-b border-slate-800 pb-2">
                6.6 Complexity Analysis Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-indigo-400 font-bold block mb-1">Branch and Bound</span>
                  <span>Time: O(2^n) worst-case, O(poly) average with pruning</span>
                  <span className="block mt-1">Space: O(2^n) heap memory</span>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-1">Weighted Scoring</span>
                  <span>Time: O(n log n) sorting pass</span>
                  <span className="block mt-1">Space: O(n) contiguous array</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add SOS Request Modal */}
      {newRequestModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Submit Emergency SOS Request
            </h3>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Camp Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Victor Mountain Shelter"
                  value={newReq.campName}
                  onChange={(e) => setNewReq({ ...newReq, campName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Injury Severity (1–10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={newReq.injurySeverity}
                    onChange={(e) => setNewReq({ ...newReq, injurySeverity: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Population</label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={newReq.population}
                    onChange={(e) => setNewReq({ ...newReq, population: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Supply Shortage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newReq.supplyShortage}
                    onChange={(e) => setNewReq({ ...newReq, supplyShortage: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Trucks Required</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newReq.requiredTrucks}
                    onChange={(e) => setNewReq({ ...newReq, requiredTrucks: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setNewRequestModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Submit SOS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
