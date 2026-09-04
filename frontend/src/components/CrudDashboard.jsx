import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, Plus, Search, Edit3, Trash2, CheckCircle, ShieldAlert, 
  RefreshCw, MapPin, Navigation, Package, Truck, AlertTriangle, X, Save, ArrowLeft
} from 'lucide-react';
import { api } from '../utils/api';

// Initial Seed Fallback Data (matching database seeds)
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

const INITIAL_ITEMS = [
  { id: 1, name: "Water Purification Tablets", weight: 2.0, value: 95, category: "WATER", quantity: 500 },
  { id: 2, name: "High-Calorie Emergency Rations", weight: 3.5, value: 90, category: "FOOD", quantity: 350 },
  { id: 3, name: "Trauma First Aid Kit", weight: 1.5, value: 100, category: "MEDICAL", quantity: 200 },
  { id: 4, name: "Emergency Thermal Blankets", weight: 1.0, value: 70, category: "SHELTER", quantity: 600 },
  { id: 5, name: "Heavy Duty Waterproof Tents", weight: 5.0, value: 85, category: "SHELTER", quantity: 150 },
  { id: 6, name: "Antibiotic & Medical Supplies", weight: 2.5, value: 98, category: "MEDICAL", quantity: 180 },
  { id: 7, name: "Solar Radio & Satellite Beacon", weight: 1.2, value: 75, category: "COMMUNICATION", quantity: 90 }
];

const INITIAL_HELICOPTERS = [
  { id: 1, registration: "RESCUE-01", name: "Bell 412 Rescue Chopper", capacityKg: 700, status: "READY" },
  { id: 2, registration: "AIR-LIFTER", name: "Mil Mi-17 Heavy Transporter", capacityKg: 950, status: "READY" },
  { id: 3, registration: "CARGO-MAX", name: "Sikorsky S-92 Cargo Lifter", capacityKg: 1200, status: "STANDBY" }
];

const INITIAL_DISASTER_ZONES = [
  { id: 1, campName: "Camp Alpha (Galle)", population: 1450, vulnerabilityScore: 8.8, urgencyScore: 9.5, infrastructureDamagePercent: 85 },
  { id: 2, campName: "Camp Beta (Matara)", population: 920, vulnerabilityScore: 7.2, urgencyScore: 8.1, infrastructureDamagePercent: 60 },
  { id: 3, campName: "Camp Charlie (Hambantota)", population: 2100, vulnerabilityScore: 9.4, urgencyScore: 9.8, infrastructureDamagePercent: 92 },
  { id: 4, campName: "Camp Delta (Ratnapura)", population: 680, vulnerabilityScore: 6.5, urgencyScore: 7.0, infrastructureDamagePercent: 45 }
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

export default function CrudDashboard() {
  const [activeCategory, setActiveCategory] = useState(() => {
    return localStorage.getItem('sdr_crud_active_tab') || 'camps';
  }); // camps, roads, supplies, fleet, zones

  useEffect(() => {
    localStorage.setItem('sdr_crud_active_tab', activeCategory);
  }, [activeCategory]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Domain Entity States
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [items, setItems] = useState([]);
  const [helicopters, setHelicopters] = useState([]);
  const [disasterZones, setDisasterZones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simple Drawer State for Add/Edit
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = Add mode, object = Edit mode
  const [formData, setFormData] = useState({});

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 2500);
  };

  // Helper to load persisted data from localStorage or fallback
  const getStoredData = (key, fallback) => {
    try {
      const stored = localStorage.getItem(`sdr_crud_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn(`Failed parsing stored ${key}`, e);
    }
    return fallback;
  };

  const saveStoredData = (key, data) => {
    try {
      localStorage.setItem(`sdr_crud_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn(`Failed persisting ${key}`, e);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [nodesData, edgesData, itemsData, helisData, sosData] = await Promise.allSettled([
        api.listRouteNodes(),
        api.listEdges(),
        api.listItems(),
        api.listHelicopters(),
        api.listAllSOSRequests()
      ]);

      const fetchedNodes = nodesData.status === 'fulfilled' && Array.isArray(nodesData.value) && nodesData.value.length > 0 ? nodesData.value : INITIAL_NODES;
      const normalizedFetchedNodes = fetchedNodes.map(n => ({
        ...n,
        x: n.x !== undefined ? n.x : (n.longitude !== undefined ? Math.round(n.longitude) : (n.xPos !== undefined ? n.xPos : 400)),
        y: n.y !== undefined ? n.y : (n.latitude !== undefined ? Math.round(n.latitude) : (n.yPos !== undefined ? n.yPos : 200))
      }));

      const fetchedEdges = edgesData.status === 'fulfilled' && Array.isArray(edgesData.value) && edgesData.value.length > 0 ? edgesData.value : INITIAL_EDGES;
      const normalizedFetchedEdges = fetchedEdges.map(e => ({
        ...e,
        sourceId: e.sourceId ?? e.u ?? e.sourceNodeId ?? 1,
        targetId: e.targetId ?? e.v ?? e.targetNodeId ?? 2,
        u: e.u ?? e.sourceId ?? e.sourceNodeId ?? 1,
        v: e.v ?? e.targetId ?? e.targetNodeId ?? 2,
        distanceKm: e.distanceKm ?? e.cost ?? 10.0,
        cost: e.cost ?? e.distanceKm ?? 10.0,
        blocked: Boolean(e.blocked)
      }));

      const finalNodes = getStoredData('nodes', normalizedFetchedNodes);
      const finalEdges = getStoredData('edges', normalizedFetchedEdges);
      const finalItems = getStoredData('items', itemsData.status === 'fulfilled' && Array.isArray(itemsData.value) && itemsData.value.length > 0 ? itemsData.value : INITIAL_ITEMS);
      const finalHelis = getStoredData('helicopters', helisData.status === 'fulfilled' && Array.isArray(helisData.value) && helisData.value.length > 0 ? helisData.value : INITIAL_HELICOPTERS);
      const finalZones = getStoredData('zones', sosData.status === 'fulfilled' && Array.isArray(sosData.value) && sosData.value.length > 0 ? sosData.value : INITIAL_DISASTER_ZONES);

      setNodes(finalNodes);
      setEdges(finalEdges);
      setItems(finalItems);
      setHelicopters(finalHelis);
      setDisasterZones(finalZones);
    } catch (err) {
      console.error("Failed loading data from Spring Boot REST API", err);
      showToast("Loaded stored data fallback", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync state mutations to localStorage
  useEffect(() => {
    if (nodes.length > 0) saveStoredData('nodes', nodes);
  }, [nodes]);

  useEffect(() => {
    if (edges.length > 0) saveStoredData('edges', edges);
  }, [edges]);

  useEffect(() => {
    if (items.length > 0) saveStoredData('items', items);
  }, [items]);

  useEffect(() => {
    if (helicopters.length > 0) saveStoredData('helicopters', helicopters);
  }, [helicopters]);

  useEffect(() => {
    if (disasterZones.length > 0) saveStoredData('zones', disasterZones);
  }, [disasterZones]);

  // Filtered Datagrid Items
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      if (activeCategory === 'camps') return nodes;
      if (activeCategory === 'roads') return edges;
      if (activeCategory === 'supplies') return items;
      if (activeCategory === 'fleet') return helicopters;
      if (activeCategory === 'zones') return disasterZones;
    }

    if (activeCategory === 'camps') {
      return nodes.filter(n => n.name.toLowerCase().includes(q) || n.nodeType.toLowerCase().includes(q) || n.id.toString().includes(q));
    }
    if (activeCategory === 'roads') {
      return edges.filter(e => e.id.toString().includes(q) || (e.u && e.u.toString().includes(q)) || (e.v && e.v.toString().includes(q)));
    }
    if (activeCategory === 'supplies') {
      return items.filter(i => i.name.toLowerCase().includes(q) || (i.category && i.category.toLowerCase().includes(q)));
    }
    if (activeCategory === 'fleet') {
      return helicopters.filter(h => h.name.toLowerCase().includes(q) || (h.registration && h.registration.toLowerCase().includes(q)));
    }
    if (activeCategory === 'zones') {
      return disasterZones.filter(z => z.campName.toLowerCase().includes(q));
    }
    return [];
  }, [activeCategory, searchQuery, nodes, edges, items, helicopters, disasterZones]);

  // Open Drawer for Add or Edit
  const openAddDrawer = () => {
    setEditingItem(null);
    if (activeCategory === 'camps') {
      setFormData({ name: '', nodeType: 'RESCUE_CAMP', x: 400, y: 200 });
    } else if (activeCategory === 'roads') {
      setFormData({ sourceId: 1, targetId: 2, distanceKm: 15.0, blocked: false });
    } else if (activeCategory === 'supplies') {
      setFormData({ name: '', weight: 1.0, value: 80, category: 'FOOD', quantity: 100 });
    } else if (activeCategory === 'fleet') {
      setFormData({ name: '', registration: `RESCUE-${Math.floor(10 + Math.random() * 90)}`, capacityKg: 800, status: 'READY' });
    } else if (activeCategory === 'zones') {
      setFormData({ campName: '', population: 500, vulnerabilityScore: 7.5, urgencyScore: 8.0, infrastructureDamagePercent: 50 });
    }
    setDrawerOpen(true);
  };

  const openEditDrawer = (item) => {
    setEditingItem(item);
    const normalizedForm = { ...item };

    if (activeCategory === 'camps') {
      normalizedForm.name = item.name || '';
      normalizedForm.nodeType = item.nodeType || 'RESCUE_CAMP';
      normalizedForm.x = item.x !== undefined ? item.x : (item.longitude !== undefined ? Math.round(item.longitude) : 400);
      normalizedForm.y = item.y !== undefined ? item.y : (item.latitude !== undefined ? Math.round(item.latitude) : 200);
    } else if (activeCategory === 'roads') {
      normalizedForm.sourceId = item.sourceId ?? item.u ?? item.sourceNodeId ?? 1;
      normalizedForm.targetId = item.targetId ?? item.v ?? item.targetNodeId ?? 2;
      normalizedForm.distanceKm = item.distanceKm ?? item.cost ?? 15.0;
      normalizedForm.blocked = Boolean(item.blocked);
    } else if (activeCategory === 'supplies') {
      normalizedForm.name = item.name || '';
      normalizedForm.weight = item.weight ?? item.weightKg ?? 1.0;
      normalizedForm.value = item.value ?? item.priorityValue ?? item.survivalValue ?? 80;
      normalizedForm.category = item.category || 'FOOD';
      normalizedForm.quantity = item.quantity ?? item.stockQuantity ?? 100;
    } else if (activeCategory === 'fleet') {
      normalizedForm.name = item.name || item.modelName || item.callSign || '';
      normalizedForm.registration = item.registration || item.registrationNumber || item.callSign || '';
      normalizedForm.capacityKg = item.capacityKg ?? item.maxPayloadKg ?? 800;
      normalizedForm.status = item.status || 'READY';
    } else if (activeCategory === 'zones') {
      normalizedForm.campName = item.campName || '';
      normalizedForm.population = item.population ?? item.populationCount ?? 500;
      normalizedForm.vulnerabilityScore = item.vulnerabilityScore ?? item.vulnerability ?? item.injurySeverity ?? 7.5;
      normalizedForm.urgencyScore = item.urgencyScore ?? item.urgency ?? item.supplyShortage ?? 8.0;
      normalizedForm.infrastructureDamagePercent = item.infrastructureDamagePercent ?? item.infrastructureDamage ?? item.damagePercent ?? 50;
    }

    setFormData(normalizedForm);
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (activeCategory === 'camps') {
        // 1. Enforce Unique Camp Name
        if (!formData.name || !formData.name.trim()) {
          showToast("Validation Error: Camp Name cannot be empty!", true);
          return;
        }
        const duplicateName = nodes.find(n => n.name.toLowerCase().trim() === formData.name.toLowerCase().trim() && (!editingItem || n.id !== editingItem.id));
        if (duplicateName) {
          showToast(`Validation Error: Camp name "${formData.name}" already exists!`, true);
          return;
        }

        // 2. Enforce Single HQ Rule
        if (formData.nodeType === 'HQ') {
          const existingHQ = nodes.find(n => n.nodeType === 'HQ' && (!editingItem || n.id !== editingItem.id));
          if (existingHQ) {
            showToast(`Validation Error: Only 1 Central HQ is allowed! Existing HQ is "${existingHQ.name}".`, true);
            return;
          }
        }

        if (editingItem) {
          setNodes(prev => prev.map(n => n.id === editingItem.id ? { ...n, ...formData } : n));
          showToast(`Updated camp "${formData.name}" successfully!`);
        } else {
          const newId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 1;
          setNodes(prev => [...prev, { ...formData, id: newId }]);
          showToast(`Added new camp "${formData.name}"!`);
        }
      } else if (activeCategory === 'roads') {
        // 1. Prevent Self-Loop Road Connections
        if (Number(formData.sourceId) === Number(formData.targetId)) {
          showToast("Validation Error: Source and Target camp/node cannot be identical (self-loop not allowed)!", true);
          return;
        }

        // 2. Validate Nodes Exist
        const sourceExists = nodes.some(n => Number(n.id) === Number(formData.sourceId));
        const targetExists = nodes.some(n => Number(n.id) === Number(formData.targetId));
        if (!sourceExists || !targetExists) {
          showToast(`Validation Error: Specified Node ID (${!sourceExists ? formData.sourceId : formData.targetId}) does not exist!`, true);
          return;
        }

        // 3. Positive Distance Check
        if (Number(formData.distanceKm) <= 0) {
          showToast("Validation Error: Road distance must be greater than 0 km!", true);
          return;
        }

        if (editingItem) {
          setEdges(prev => prev.map(e => e.id === editingItem.id ? { ...e, ...formData } : e));
          showToast("Updated road connection!");
        } else {
          const newId = `edge-${Date.now()}`;
          setEdges(prev => [...prev, { ...formData, id: newId, u: formData.sourceId, v: formData.targetId, cost: Number(formData.distanceKm) }]);
          showToast("Added new road link!");
        }
      } else if (activeCategory === 'supplies') {
        // 1. Non-empty Name
        if (!formData.name || !formData.name.trim()) {
          showToast("Validation Error: Supply Item Name cannot be empty!", true);
          return;
        }
        // 2. Positive Weight, Value & Quantity
        if (Number(formData.weight) <= 0) {
          showToast("Validation Error: Unit weight must be greater than 0 kg!", true);
          return;
        }
        if (Number(formData.value) < 1 || Number(formData.value) > 100) {
          showToast("Validation Error: Survival Value Score must be between 1 and 100!", true);
          return;
        }
        if (Number(formData.quantity) < 0) {
          showToast("Validation Error: Stock quantity cannot be negative!", true);
          return;
        }

        if (editingItem) {
          setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formData } : i));
          showToast(`Updated item "${formData.name}"!`);
        } else {
          try {
            await api.addItem({
              name: formData.name,
              weightKg: Number(formData.weight),
              survivalValue: Number(formData.value),
              category: formData.category,
              quantity: Number(formData.quantity)
            });
          } catch (err) {
            console.log("Saving locally to state fallback");
          }
          const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
          setItems(prev => [...prev, { ...formData, id: newId }]);
          showToast(`Added relief supply "${formData.name}"!`);
        }
      } else if (activeCategory === 'fleet') {
        // 1. Non-empty Name & Registration
        if (!formData.name || !formData.name.trim() || !formData.registration || !formData.registration.trim()) {
          showToast("Validation Error: Helicopter Name and Registration Code are required!", true);
          return;
        }
        // 2. Duplicate Registration Check
        const dupReg = helicopters.find(h => h.registration.toLowerCase().trim() === formData.registration.toLowerCase().trim() && (!editingItem || h.id !== editingItem.id));
        if (dupReg) {
          showToast(`Validation Error: Registration code "${formData.registration}" already exists!`, true);
          return;
        }
        // 3. Positive Capacity Check
        if (Number(formData.capacityKg) <= 0) {
          showToast("Validation Error: Helicopter max payload capacity must be greater than 0 kg!", true);
          return;
        }

        if (editingItem) {
          setHelicopters(prev => prev.map(h => h.id === editingItem.id ? { ...h, ...formData } : h));
          showToast(`Updated helicopter "${formData.name}"!`);
        } else {
          try {
            await api.addHelicopter({
              name: formData.name,
              registrationNumber: formData.registration,
              maxPayloadKg: Number(formData.capacityKg)
            });
          } catch (err) {
            console.log("Saving locally to state fallback");
          }
          const newId = helicopters.length > 0 ? Math.max(...helicopters.map(h => h.id)) + 1 : 1;
          setHelicopters(prev => [...prev, { ...formData, id: newId }]);
          showToast(`Added helicopter "${formData.name}"!`);
        }
      } else if (activeCategory === 'zones') {
        // 1. Non-empty Camp Name
        if (!formData.campName || !formData.campName.trim()) {
          showToast("Validation Error: Emergency Camp Name is required!", true);
          return;
        }
        // 2. Population Check
        if (Number(formData.population) < 0) {
          showToast("Validation Error: Population count cannot be negative!", true);
          return;
        }
        // 3. Score Ranges Check (0 - 10)
        if (Number(formData.vulnerabilityScore) < 0 || Number(formData.vulnerabilityScore) > 10) {
          showToast("Validation Error: Vulnerability score must be between 0.0 and 10.0!", true);
          return;
        }
        if (Number(formData.urgencyScore) < 0 || Number(formData.urgencyScore) > 10) {
          showToast("Validation Error: Urgency score must be between 0.0 and 10.0!", true);
          return;
        }
        // 4. Damage Percent Check (0 - 100%)
        if (Number(formData.infrastructureDamagePercent) < 0 || Number(formData.infrastructureDamagePercent) > 100) {
          showToast("Validation Error: Infrastructure damage must be between 0% and 100%!", true);
          return;
        }

        if (editingItem) {
          setDisasterZones(prev => prev.map(z => z.id === editingItem.id ? { ...z, ...formData } : z));
          showToast(`Updated zone "${formData.campName}"!`);
        } else {
          try {
            await api.addSOSRequest({
              campName: formData.campName,
              populationCount: Number(formData.population),
              vulnerabilityScore: Number(formData.vulnerabilityScore),
              urgencyScore: Number(formData.urgencyScore),
              infrastructureDamagePercent: Number(formData.infrastructureDamagePercent)
            });
          } catch (err) {
            console.log("Saving locally to state fallback");
          }
          const newId = disasterZones.length > 0 ? Math.max(...disasterZones.map(z => z.id)) + 1 : 1;
          setDisasterZones(prev => [...prev, { ...formData, id: newId }]);
          showToast(`Added disaster zone "${formData.campName}"!`);
        }
      }
      setDrawerOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Error saving record.", true);
    }
  };

  // State for sleek custom delete confirmation modal
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const promptDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    if (activeCategory === 'camps') {
      setNodes(prev => prev.filter(n => n.id !== id));
    } else if (activeCategory === 'roads') {
      setEdges(prev => prev.filter(e => e.id !== id));
    } else if (activeCategory === 'supplies') {
      setItems(prev => prev.filter(i => i.id !== id));
    } else if (activeCategory === 'fleet') {
      setHelicopters(prev => prev.filter(h => h.id !== id));
    } else if (activeCategory === 'zones') {
      setDisasterZones(prev => prev.filter(z => z.id !== id));
    }
    setDeleteConfirmId(null);
    showToast("Record deleted successfully.");
  };

  const categoryTabs = [
    { id: 'camps', label: 'Camps & Nodes', icon: MapPin, count: nodes.length, color: 'text-sky-400' },
    { id: 'roads', label: 'Road Connections', icon: Navigation, count: edges.length, color: 'text-amber-400' },
    { id: 'supplies', label: 'Relief Cargo', icon: Package, count: items.length, color: 'text-emerald-400' },
    { id: 'fleet', label: 'Helicopter Fleet', icon: Truck, count: helicopters.length, color: 'text-purple-400' },
    { id: 'zones', label: 'Disaster Zones', icon: AlertTriangle, count: disasterZones.length, color: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[999999] max-w-md px-4 py-3 rounded-xl border text-xs font-bold shadow-2xl flex items-center gap-2.5 transition-all duration-150 transform-gpu ${
          toast.isError 
            ? 'bg-rose-950 text-rose-200 border-rose-700 shadow-rose-950/50' 
            : 'bg-emerald-950 text-emerald-200 border-emerald-700 shadow-emerald-950/50'
        }`}>
          {toast.isError ? <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" /> : <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <header className="bg-[#0B0F19] border-b border-slate-850 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Database className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-100 flex items-center gap-2 tracking-wide">
              SDR-DSS DATA MANAGEMENT PORTAL
              <span className="text-[10px] bg-sky-500/20 text-sky-400 font-mono px-2 py-0.5 rounded border border-sky-500/30">
                CRUD MODULE
              </span>
            </h1>
            <p className="text-[10.5px] text-slate-400">
              Live Spring Boot PostgreSQL REST Entity Operations • BSc Hons Computer Science with AI (PDSA 2)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => window.close()}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-all active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to App
          </button>
        </div>
      </header>

      {/* Domain Category Selector Tabs */}
      <div className="bg-[#0D121F] border-b border-slate-850 px-6 py-3 flex items-center gap-2 overflow-x-auto shrink-0">
        {categoryTabs.map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 transform-gpu active:scale-95 border ${
                isActive 
                  ? 'bg-sky-600/20 text-sky-300 border-sky-500/50 shadow-sm' 
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <TabIcon className={`w-4 h-4 ${tab.color}`} />
              <span>{tab.label}</span>
              <span className="text-[10px] bg-slate-950 font-mono text-slate-300 px-1.5 py-0.2 rounded border border-slate-800">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Datagrid Workspace */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col gap-4 relative">
        {/* Search Bar & Primary Action Header */}
        <div className="flex items-center justify-between gap-4 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${categoryTabs.find(t => t.id === activeCategory)?.label.toLowerCase()} by name or ID...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <button
            onClick={openAddDrawer}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition-all duration-150 transform-gpu active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New {activeCategory.slice(0, -1).toUpperCase()}</span>
          </button>
        </div>

        {/* Datagrid Table */}
        <div className="flex-1 bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden flex flex-col shadow-xl">
          <div className="flex-1 overflow-y-auto">
            {activeCategory === 'camps' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Camp Name</th>
                    <th className="p-3">Node Type</th>
                    <th className="p-3">SVG Coordinates</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {filteredData.map(node => (
                    <tr key={node.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-mono text-sky-400 font-bold">#{node.id}</td>
                      <td className="p-3 font-semibold text-slate-100">{node.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          node.nodeType === 'HQ' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                          node.nodeType === 'INTERSECTION' ? 'bg-slate-800 text-slate-300 border-slate-700' :
                          'bg-sky-950 text-sky-300 border-sky-800'
                        }`}>
                          {node.nodeType}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        X: {node.x ?? node.longitude ?? 0}, Y: {node.y ?? node.latitude ?? 0}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEditDrawer(node)} className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-sky-400 border border-slate-700 transition-colors">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => promptDelete(node.id)} className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-rose-400 border border-slate-700 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeCategory === 'roads' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    <th className="p-3">Road ID</th>
                    <th className="p-3">Source Node</th>
                    <th className="p-3">Target Node</th>
                    <th className="p-3">Distance (KM)</th>
                    <th className="p-3">Block Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {filteredData.map(edge => (
                    <tr key={edge.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-mono text-amber-400 font-bold">#{edge.id}</td>
                      <td className="p-3 font-mono text-slate-200">
                        {(() => {
                          const sId = edge.u ?? edge.sourceId ?? edge.sourceNodeId;
                          const srcCamp = nodes.find(n => Number(n.id) === Number(sId));
                          return srcCamp ? `${srcCamp.name} (#${sId})` : `Node #${sId ?? '?'}`;
                        })()}
                      </td>
                      <td className="p-3 font-mono text-slate-200">
                        {(() => {
                          const tId = edge.v ?? edge.targetId ?? edge.targetNodeId;
                          const tgtCamp = nodes.find(n => Number(n.id) === Number(tId));
                          return tgtCamp ? `${tgtCamp.name} (#${tId})` : `Node #${tId ?? '?'}`;
                        })()}
                      </td>
                      <td className="p-3 font-mono font-bold text-sky-400">
                        {((edge.cost !== undefined ? edge.cost : (edge.distanceKm !== undefined ? edge.distanceKm : 10))).toFixed(1)} km
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          edge.blocked ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}>
                          {edge.blocked ? 'BLOCKED' : 'OPEN'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEditDrawer(edge)} className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-sky-400 border border-slate-700 transition-colors">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => promptDelete(edge.id)} className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-rose-400 border border-slate-700 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeCategory === 'supplies' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Relief Item Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Unit Weight (KG)</th>
                    <th className="p-3">Survival Score</th>
                    <th className="p-3">Stock Quantity</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {filteredData.map(item => (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-mono text-emerald-400 font-bold">#{item.id}</td>
                      <td className="p-3 font-semibold text-slate-100">{item.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-850 text-sky-300 border border-slate-700">
                          {item.category || 'GENERAL'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-amber-300 font-bold">
                        {item.weight !== undefined ? item.weight : (item.weightKg !== undefined ? item.weightKg : 1.0)} kg
                      </td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">
                        {item.value !== undefined ? item.value : (item.priorityValue !== undefined ? item.priorityValue : (item.survivalValue !== undefined ? item.survivalValue : 80))} / 100
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        {item.quantity !== undefined ? item.quantity : (item.stockQuantity !== undefined ? item.stockQuantity : 100)} units
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEditDrawer(item)} className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-sky-400 border border-slate-700 transition-colors">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => promptDelete(item.id)} className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-rose-400 border border-slate-700 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeCategory === 'fleet' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Registration Code</th>
                    <th className="p-3">Helicopter Model Name</th>
                    <th className="p-3">Max Payload (KG)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {filteredData.map(heli => (
                    <tr key={heli.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-mono text-purple-400 font-bold">#{heli.id}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">
                        {heli.registration || heli.registrationNumber || heli.callSign || `HELI-${heli.id}`}
                      </td>
                      <td className="p-3 font-semibold text-slate-100">
                        {heli.name || heli.modelName || heli.callSign || `Helicopter Unit #${heli.id}`}
                      </td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">
                        {heli.capacityKg !== undefined ? heli.capacityKg : (heli.maxPayloadKg !== undefined ? heli.maxPayloadKg : (heli.payload !== undefined ? heli.payload : 800))} kg
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {heli.status || 'READY'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEditDrawer(heli)} className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-sky-400 border border-slate-700 transition-colors">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => promptDelete(heli.id)} className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-rose-400 border border-slate-700 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeCategory === 'zones' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Emergency Camp Name</th>
                    <th className="p-3">Population</th>
                    <th className="p-3">Vulnerability</th>
                    <th className="p-3">Urgency Score</th>
                    <th className="p-3">Infra Damage %</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {filteredData.map(zone => (
                    <tr key={zone.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-mono text-rose-400 font-bold">#{zone.id}</td>
                      <td className="p-3 font-semibold text-slate-100">{zone.campName}</td>
                      <td className="p-3 font-mono text-slate-200">
                        {zone.population !== undefined ? zone.population : (zone.populationCount !== undefined ? zone.populationCount : 500)} people
                      </td>
                      <td className="p-3 font-mono text-amber-300 font-bold">
                        {(zone.vulnerabilityScore !== undefined ? zone.vulnerabilityScore : (zone.vulnerability !== undefined ? zone.vulnerability : (zone.injurySeverity !== undefined ? zone.injurySeverity : 7.5)))} / 10
                      </td>
                      <td className="p-3 font-mono text-rose-400 font-bold">
                        {(zone.urgencyScore !== undefined ? zone.urgencyScore : (zone.urgency !== undefined ? zone.urgency : (zone.supplyShortage !== undefined ? zone.supplyShortage : 8.0)))} / 10
                      </td>
                      <td className="p-3 font-mono text-rose-300">
                        {(zone.infrastructureDamagePercent !== undefined ? zone.infrastructureDamagePercent : (zone.infrastructureDamage !== undefined ? zone.infrastructureDamage : (zone.damagePercent !== undefined ? zone.damagePercent : 50)))}%
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEditDrawer(zone)} className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-sky-400 border border-slate-700 transition-colors">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => promptDelete(zone.id)} className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-rose-400 border border-slate-700 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {filteredData.length === 0 && (
              <div className="p-12 text-center text-slate-500 italic text-xs">
                No records found matching "{searchQuery}". Click "+ Add New" to create one.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simple Inline Slide-In Side Drawer for Add / Edit (Zero Blur, Fast Tween) */}
      {drawerOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-[#0B0F19] border-l border-slate-800 shadow-2xl z-[99999] flex flex-col transition-transform duration-150 ease-out transform-gpu">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
              {editingItem ? <Edit3 className="w-4 h-4 text-sky-400" /> : <Plus className="w-4 h-4 text-emerald-400" />}
              {editingItem ? 'Edit' : 'Add New'} {activeCategory.slice(0, -1).toUpperCase()}
            </h3>
            <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Form */}
          <form onSubmit={handleSave} className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
            {activeCategory === 'camps' && (
              <>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Camp Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Galle Rescue Camp (Alpha)"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Node Type</label>
                  <select
                    value={formData.nodeType || 'RESCUE_CAMP'}
                    onChange={(e) => setFormData({ ...formData, nodeType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-sky-500 focus:outline-none"
                  >
                    <option value="RESCUE_CAMP">RESCUE_CAMP</option>
                    <option value="HQ">HQ (Depot)</option>
                    <option value="INTERSECTION">INTERSECTION (Junction)</option>
                  </select>
                  <p className="mt-1 text-[10px] text-amber-400/90 font-medium">
                    ⚠️ Note: Maximum of 1 Central HQ is permitted across the entire network.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">SVG X Position</label>
                    <input
                      type="number"
                      placeholder="e.g. 400"
                      value={formData.x !== undefined ? formData.x : ''}
                      onChange={(e) => setFormData({ ...formData, x: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">SVG Y Position</label>
                    <input
                      type="number"
                      placeholder="e.g. 200"
                      value={formData.y !== undefined ? formData.y : ''}
                      onChange={(e) => setFormData({ ...formData, y: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {activeCategory === 'roads' && (
              <>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Source Camp / Node</label>
                  <select
                    required
                    value={formData.sourceId || (nodes.length > 0 ? nodes[0].id : 1)}
                    onChange={(e) => setFormData({ ...formData, sourceId: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-sky-500 focus:outline-none font-mono"
                  >
                    {nodes.map(n => (
                      <option key={`src-${n.id}`} value={n.id}>
                        {n.name} (ID: #{n.id}) - [{n.nodeType}]
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Target Camp / Node</label>
                  <select
                    required
                    value={formData.targetId || (nodes.length > 1 ? nodes[1].id : 2)}
                    onChange={(e) => setFormData({ ...formData, targetId: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-sky-500 focus:outline-none font-mono"
                  >
                    {nodes.map(n => (
                      <option key={`tgt-${n.id}`} value={n.id}>
                        {n.name} (ID: #{n.id}) - [{n.nodeType}]
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Distance (KM)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 15.5"
                    value={formData.distanceKm !== undefined ? formData.distanceKm : ''}
                    onChange={(e) => setFormData({ ...formData, distanceKm: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="blockedChk"
                    checked={formData.blocked || false}
                    onChange={(e) => setFormData({ ...formData, blocked: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-sky-500"
                  />
                  <label htmlFor="blockedChk" className="text-slate-300 font-semibold cursor-pointer">
                    Road Blocked / Damaged
                  </label>
                </div>
              </>
            )}

            {activeCategory === 'supplies' && (
              <>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Relief Item Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Water Purification Tablets"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Weight (KG)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g. 2.5"
                      value={formData.weight !== undefined ? formData.weight : ''}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Survival Score (0-100)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 95"
                      value={formData.value !== undefined ? formData.value : ''}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                    <select
                      value={formData.category || 'FOOD'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-sky-500 focus:outline-none"
                    >
                      <option value="FOOD">FOOD</option>
                      <option value="WATER">WATER</option>
                      <option value="MEDICAL">MEDICAL</option>
                      <option value="SHELTER">SHELTER</option>
                      <option value="COMMUNICATION">COMMUNICATION</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Stock Quantity</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={formData.quantity !== undefined ? formData.quantity : ''}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {activeCategory === 'fleet' && (
              <>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Helicopter Name / Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bell 412 Rescue Chopper"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Registration Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RESCUE-01"
                    value={formData.registration || ''}
                    onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Max Payload Capacity (KG)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 850"
                    value={formData.capacityKg !== undefined ? formData.capacityKg : ''}
                    onChange={(e) => setFormData({ ...formData, capacityKg: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Status</label>
                  <select
                    value={formData.status || 'READY'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-sky-500 focus:outline-none"
                  >
                    <option value="READY">READY</option>
                    <option value="STANDBY">STANDBY</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </>
            )}

            {activeCategory === 'zones' && (
              <>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Emergency Camp Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Camp Alpha (Galle)"
                    value={formData.campName || ''}
                    onChange={(e) => setFormData({ ...formData, campName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Population Count</label>
                  <input
                    type="number"
                    placeholder="e.g. 1450"
                    value={formData.population !== undefined ? formData.population : ''}
                    onChange={(e) => setFormData({ ...formData, population: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Vulnerability (0-10)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 8.8"
                      value={formData.vulnerabilityScore !== undefined ? formData.vulnerabilityScore : ''}
                      onChange={(e) => setFormData({ ...formData, vulnerabilityScore: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Urgency (0-10)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 9.5"
                      value={formData.urgencyScore !== undefined ? formData.urgencyScore : ''}
                      onChange={(e) => setFormData({ ...formData, urgencyScore: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Infra Damage % (0-100)</label>
                  <input
                    type="number"
                    placeholder="e.g. 85"
                    value={formData.infrastructureDamagePercent !== undefined ? formData.infrastructureDamagePercent : ''}
                    onChange={(e) => setFormData({ ...formData, infrastructureDamagePercent: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            <div className="pt-4 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-lg border border-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sleek Custom Deletion Confirmation Modal Dialog */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-150 transform-gpu">
          <div className="bg-[#0D121F] border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Confirm Deletion</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-850">
              Are you sure you want to permanently delete this record from the <strong className="text-amber-400">{activeCategory}</strong> table?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-950/40 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
