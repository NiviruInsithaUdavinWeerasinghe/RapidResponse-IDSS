/**
 * SDR-DSS Automated Database Seeding & Data Management Script (Node.js)
 * Course: BSc Hons Computer Science with AI - PDSA 2 Coursework
 * File: deliverables/seed_database.js
 * 
 * Description: Node.js script to automatically seed initial domain entities into the PostgreSQL database 
 * via Spring Boot REST Endpoints (http://localhost:8080/api/v1).
 * 
 * Usage: node deliverables/seed_database.js
 */

const BASE_URL = 'http://localhost:8080/api/v1';

// Initial Data Payloads Matching UI Datagrid
const INITIAL_ITEMS = [
  { name: "Medical Kits", weightKg: 150.0, priorityValue: 90.0, category: "MEDICAL" },
  { name: "Water Filtration Pack", weightKg: 300.0, priorityValue: 160.0, category: "WATER" },
  { name: "Emergency Food MREs", weightKg: 200.0, priorityValue: 110.0, category: "FOOD" },
  { name: "Tents & Tarps", weightKg: 250.0, priorityValue: 120.0, category: "SHELTER" },
  { name: "Satellite Comms", weightKg: 100.0, priorityValue: 80.0, category: "MEDICAL" },
  { name: "Flashlights & Batteries", weightKg: 80.0, priorityValue: 45.0, category: "MEDICAL" },
  { name: "Blankets Warm Blankets", weightKg: 120.0, priorityValue: 60.0, category: "SHELTER" },
  { name: "Multi-Tool Kits", weightKg: 90.0, priorityValue: 50.0, category: "SHELTER" }
];

const INITIAL_HELICOPTERS = [
  { callSign: "RESCUE-01", maxPayloadKg: 700.0, status: "AVAILABLE" },
  { callSign: "HELI-COMMANDER", maxPayloadKg: 1200.0, status: "AVAILABLE" },
  { callSign: "AIR-LIFTER", maxPayloadKg: 950.0, status: "AVAILABLE" }
];

async function postData(endpoint, body) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`❌ [${res.status}] Failed posting to ${endpoint}:`, err);
      return null;
    }
    const data = await res.json();
    console.log(`✅ Posted to ${endpoint}:`, data);
    return data;
  } catch (err) {
    console.error(`⚠️ Network error calling ${endpoint}:`, err.message);
  }
}

async function seedDatabase() {
  console.log("🚀 Initiating SDR-DSS Node.js Database Seeding Script...\n");

  console.log("📦 Seeding Relief Cargo Items...");
  for (const item of INITIAL_ITEMS) {
    await postData('/resources/items', item);
  }

  console.log("\n🚁 Seeding Helicopter Fleet...");
  for (const heli of INITIAL_HELICOPTERS) {
    await postData('/resources/helicopters', heli);
  }

  console.log("\n🎉 Database Seeding Completed!");
}

seedDatabase();
