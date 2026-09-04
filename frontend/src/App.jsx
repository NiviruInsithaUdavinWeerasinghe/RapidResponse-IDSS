import React, { useState, useEffect } from 'react';
import { Activity, Compass, Truck, Link, Award, Eye, Menu, X, Database, Sparkles } from 'lucide-react';
import DashboardOverview from './components/DashboardOverview';
import Module1RouteOpt from './components/Module1RouteOpt';
import Module2ResourceAlloc from './components/Module2ResourceAlloc';
import Module3NetworkAnalysis from './components/Module3NetworkAnalysis';
import Module4IntelligentDec from './components/Module4IntelligentDec';
import Module5TSPSequencing from './components/Module5TSPSequencing';
import CrudDashboard from './components/CrudDashboard';
import InteractiveTutorialModal from './components/InteractiveTutorialModal';
import { api } from './utils/api';

export default function App() {
  const isCrudStandalone = window.location.search.includes('view=crud');
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('sdr_active_tab') || 'overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState(() => {
    return !localStorage.getItem('sdr_has_seen_tutorial');
  });

  useEffect(() => {
    localStorage.setItem('sdr_active_tab', activeTab);
  }, [activeTab]);

  const handleCloseTutorial = () => {
    localStorage.setItem('sdr_has_seen_tutorial', 'true');
    setIsTutorialOpen(false);
  };

  if (isCrudStandalone) {
    return <CrudDashboard />;
  }

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: Activity, component: DashboardOverview },
    { id: 'module1', label: 'M1: Route Optimization', icon: Compass, component: Module1RouteOpt },
    { id: 'module2', label: 'M2: Resource Allocation', icon: Truck, component: Module2ResourceAlloc },
    { id: 'module3', label: 'M3: Network Analysis', icon: Link, component: Module3NetworkAnalysis },
    { id: 'module4', label: 'M4: Intelligent Decision', icon: Award, component: Module4IntelligentDec },
    { id: 'module5', label: 'M5: Route Sequencing', icon: Eye, component: Module5TSPSequencing },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || DashboardOverview;

  const [campCount, setCampCount] = useState(null);
  const [isSystemOnline, setIsSystemOnline] = useState(false);

  useEffect(() => {
    async function fetchMetrics() {
      let nodes = [];
      let online = false;
      try {
        const res = await api.listRouteNodes();
        if (Array.isArray(res) && res.length > 0) {
          nodes = res;
          online = true;
        }
      } catch (err) {
        console.warn("Failed to fetch connected camps metric from backend", err);
      }

      setIsSystemOnline(online);

      if (!Array.isArray(nodes) || nodes.length === 0) {
        try {
          const stored = localStorage.getItem('sdr_crud_nodes');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) nodes = parsed;
          }
        } catch (e) {}
      }

      const totalNodes = Array.isArray(nodes) && nodes.length > 0 ? nodes.length : 20;
      setCampCount(totalNodes);
    }

    fetchMetrics();
    const timer = setInterval(fetchMetrics, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <aside className={`bg-[#0B0F19] border-r border-slate-850 flex flex-col justify-between transition-all duration-300 z-50 ${
        isSidebarOpen ? 'w-full md:w-64' : 'w-0 md:w-20 overflow-hidden'
      }`}>
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-850 flex items-center justify-between">
            {isSidebarOpen ? (
              <h1 className="text-lg font-black tracking-widest bg-gradient-to-r from-sky-400 to-teal-500 bg-clip-text text-transparent">
                SDR-DSS PLATFORM
              </h1>
            ) : (
              <Activity className="w-6 h-6 text-sky-400 animate-pulse mx-auto" />
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded bg-slate-850 border border-slate-700 hover:bg-slate-700 text-slate-300 md:block hidden"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-2">
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-sky-600 text-slate-100 shadow-lg shadow-sky-950/20 font-bold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <TabIcon className={`w-5 h-5 shrink-0 ${isActive ? 'text-slate-100' : 'text-sky-500'}`} />
                  {isSidebarOpen && <span>{tab.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & Sidebar Footer */}
        <div className="border-t border-slate-850">
          <div className="p-3">
            <button
              onClick={() => {
                if (window.location.protocol === 'file:') {
                  const basePath = window.location.href.split('?')[0].split('#')[0];
                  window.open(`${basePath}?view=crud`, '_blank');
                } else {
                  window.open('/?view=crud', '_blank');
                }
              }}
              className="flex items-center justify-center gap-2.5 w-full p-2.5 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all shadow-sm active:scale-95"
              title="Open Data Management CRUD Portal in a new tab"
            >
              <Database className="w-4 h-4 text-amber-400 shrink-0" />
              {isSidebarOpen && <span>Data Management CRUD</span>}
            </button>
          </div>

          {isSidebarOpen && (
            <div className="p-4 border-t border-slate-850/60 text-[9.5px] text-slate-400 text-center leading-relaxed font-sans">
              <span className="font-semibold text-slate-300">BSc Hons Computer Science with Artificial Intelligence</span>
              <br />
              <span>2026.1 - PDSA 2 Coursework</span>
              <br />
              <span className="text-slate-500">© 2026 Smart Disaster Relief DSS</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden max-h-screen">
        {/* Top Header stats */}
        <header className="bg-[#0B0F19] border-b border-slate-850 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded bg-slate-850 border border-slate-700 text-slate-300 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-extrabold text-sm md:text-base text-slate-200 uppercase tracking-wider">
              {tabs.find(t => t.id === activeTab)?.label} Control Deck
            </h2>
          </div>

          {/* Quick Metrics & Tutorial Action */}
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500/20 to-teal-500/20 hover:from-sky-500/30 hover:to-teal-500/30 text-sky-300 font-bold px-3 py-1.5 rounded-lg border border-sky-500/40 transition-all active:scale-95 shadow-sm"
              title="Launch Platform Walkthrough Tutorial"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Tutorial</span>
            </button>
            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSystemOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></span>
              <span>System: <strong>{isSystemOnline ? 'ONLINE (Supabase DB)' : 'STANDBY (Local Seed)'}</strong></span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850 hidden md:block">
              Connected Camps: <strong>{campCount !== null ? `${campCount} Camps` : '20 Camps'}</strong>
            </div>
          </div>
        </header>

        {/* Content viewport */}
        <div className={`flex-1 p-6 ${activeTab === 'overview' ? 'overflow-hidden max-h-[calc(100vh-65px)]' : 'overflow-y-auto max-h-[calc(100vh-65px)]'}`}>
          <ActiveComponent />
        </div>
      </main>

      {/* Interactive Platform Tutorial Modal */}
      <InteractiveTutorialModal 
        isOpen={isTutorialOpen} 
        onClose={handleCloseTutorial} 
      />

    </div>
  );
}

