import React, { useState, useEffect } from 'react';
import { Activity, Compass, Truck, Link, Award, Eye, Menu, X } from 'lucide-react';
import DashboardOverview from './components/DashboardOverview';
import Module1RouteOpt from './components/Module1RouteOpt';
import Module2ResourceAlloc from './components/Module2ResourceAlloc';
import Module3NetworkAnalysis from './components/Module3NetworkAnalysis';
import Module4IntelligentDec from './components/Module4IntelligentDec';
import Module5TSPSequencing from './components/Module5TSPSequencing';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('sdr_active_tab') || 'overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem('sdr_active_tab', activeTab);
  }, [activeTab]);

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: Activity, component: DashboardOverview },
    { id: 'module1', label: 'M1: Route Optimization', icon: Compass, component: Module1RouteOpt },
    { id: 'module2', label: 'M2: Resource Allocation', icon: Truck, component: Module2ResourceAlloc },
    { id: 'module3', label: 'M3: Network Analysis', icon: Link, component: Module3NetworkAnalysis },
    { id: 'module4', label: 'M4: Intelligent Decision', icon: Award, component: Module4IntelligentDec },
    { id: 'module5', label: 'M5: Route Sequencing', icon: Eye, component: Module5TSPSequencing },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || DashboardOverview;

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

        {/* Sidebar Footer */}
        {isSidebarOpen && (
          <div className="p-6 border-t border-slate-850 text-[10px] text-slate-500 text-center">
            BSc (Hons) Computing-26.1 Coursework
            <br />© 2026 Smart Disaster Relief DSS
          </div>
        )}
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

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs">
            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>System: <strong>ONLINE</strong></span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850 hidden md:block">
              Connected Camps: <strong>50 Camps</strong>
            </div>
          </div>
        </header>

        {/* Content viewport */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-65px)]">
          <ActiveComponent />
        </div>
      </main>

    </div>
  );
}
