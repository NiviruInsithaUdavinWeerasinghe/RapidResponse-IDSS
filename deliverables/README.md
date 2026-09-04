# 📁 SDR-DSS Database & Script Deliverables Summary
**Course**: BSc Hons Computer Science with Artificial Intelligence (2026.1)  
**Module**: Data Structures & Algorithms 2 (PDSA 2)  
**Project**: Smart Disaster Relief Decision Support System (SDR-DSS)

> [!NOTE]
> All deliverables listed below have been formatted, tested, and saved in this folder ([`deliverables/`](file:///C:/RapidResponse-IDSS/deliverables/)).

---

## 📑 File Inventory & Purpose Breakdown

| Filename | File Type | Purpose / Description | SQL / Execution Operations |
| :--- | :---: | :--- | :--- |
| **[`01_database_schema_and_crud_scripts.sql`](file:///C:/RapidResponse-IDSS/deliverables/01_database_schema_and_crud_scripts.sql)** | `.sql` | **Master Combined SQL Script** containing the full execution pipeline for PostgreSQL. Drops old schemas, creates tables with constraints, seeds all 20 nodes, 34 edges, 8 items, 3 helis, and 5 zones, and executes sample UPDATE and DELETE operations. | `DROP TABLE`, `CREATE TABLE`, `INSERT INTO`, `UPDATE`, `DELETE FROM` |
| **[`01_create_tables.sql`](file:///C:/RapidResponse-IDSS/deliverables/01_create_tables.sql)** | `.sql` | **DDL Table Definition Script**. Creates all 5 domain tables (`nodes`, `edges`, `helicopters`, `relief_items`, `sos_requests`) with primary keys, foreign key constraints (`ON DELETE CASCADE`), data types, and default values. | `CREATE TABLE`, `DROP TABLE` |
| **[`02_insert_initial_data.sql`](file:///C:/RapidResponse-IDSS/deliverables/02_insert_initial_data.sql)** | `.sql` | **DML Data Seeding Script**. Inserts the initial dataset into PostgreSQL: 20 Camps/HQs/Junctions, 34 Road Connections (with distances and block statuses), 3 Helicopters, 8 Relief Cargo Items, and 5 Disaster Zone SOS Requests. | `INSERT INTO` |
| **[`03_update_operations.sql`](file:///C:/RapidResponse-IDSS/deliverables/03_update_operations.sql)** | `.sql` | **DML Record Modification Script**. Demonstrates record updates across all 5 domain entities: editing camp coordinates, unblocking road segments, updating helicopter maintenance statuses, adjusting cargo priority scores, and changing SOS request statuses to `DISPATCHED`. | `UPDATE ... SET ... WHERE` |
| **[`04_delete_operations.sql`](file:///C:/RapidResponse-IDSS/deliverables/04_delete_operations.sql)** | `.sql` | **DML Record Removal Script**. Demonstrates cascading row deletions across all 5 domain entities: removing specific road connections, relief cargo items, fleet helicopters, resolved SOS alerts, and emergency junction nodes. | `DELETE FROM ... WHERE` |
| **[`seed_database.js`](file:///C:/RapidResponse-IDSS/deliverables/seed_database.js)** | `.js` | **Automated Node.js REST API Ingestion Script**. Uses JavaScript `fetch()` API to programmatically populate Spring Boot backend REST endpoints (`http://localhost:8080/api/v1/resources/items` and `/resources/helicopters`) with JSON payloads. | Node.js `fetch()` HTTP `POST` requests |

---

## 🗄️ Managed Entities & Schema Breakdown

### 1. `nodes` (Camps & Emergency Locations)
- **Primary Key**: `id` (`BIGINT`)
- **Attributes**: `name`, `latitude`, `longitude`, `node_type` (`HQ`, `RESCUE_CAMP`, `INTERSECTION`)
- **Records Seeded**: 20 total nodes (1 Central HQ, 12 Rescue Camps A-K, 7 Intersections Junction A-H).

### 2. `edges` (Road Network Connections)
- **Primary Key**: `id` (`BIGSERIAL`)
- **Foreign Keys**: `source_node_id` -> `nodes(id)`, `target_node_id` -> `nodes(id)` (`ON DELETE CASCADE`)
- **Attributes**: `distance_km`, `travel_time_mins`, `blocked` (`BOOLEAN`), `one_way` (`BOOLEAN`)
- **Records Seeded**: 34 total road segments connecting network camps and junctions.

### 3. `helicopters` (Airlift Fleet)
- **Primary Key**: `id` (`BIGSERIAL`)
- **Attributes**: `call_sign` (`VARCHAR`), `max_payload_kg` (`DOUBLE PRECISION`), `status` (`AVAILABLE`, `IN_MAINTENANCE`, `STANDBY`)
- **Records Seeded**: 3 units (`RESCUE-01` 700kg, `HELI-COMMANDER` 1200kg, `AIR-LIFTER` 950kg).

### 4. `relief_items` (Cargo Supplies)
- **Primary Key**: `id` (`BIGSERIAL`)
- **Attributes**: `name`, `weight_kg`, `priority_value` (Survival Score), `category` (`WATER`, `FOOD`, `MEDICAL`, `SHELTER`, `COMMUNICATION`)
- **Records Seeded**: 8 items (Medical Kits, Water Filtration Packs, Food MREs, Tents & Tarps, Satellite Comms, Flashlights & Batteries, Blankets, Multi-Tool Kits).

### 5. `sos_requests` (Disaster Zones)
- **Primary Key**: `id` (`BIGSERIAL`)
- **Foreign Key**: `rescue_camp_id` -> `nodes(id)` (`ON DELETE CASCADE`)
- **Attributes**: `camp_name`, `injury_severity`, `camp_population`, `supply_shortage_level`, `resource_cost`, `status` (`PENDING`, `DISPATCHED`, `RESOLVED`), `received_at` (`TIMESTAMP`)
- **Records Seeded**: 5 emergency zones (Alpha Shelter, Beta Outpost, Delta Camp, Omega Base, Zeta Center).

---

## ⚙️ How to Run the Deliverables

> [!TIP]
> **Method 1: PostgreSQL GUI / CLI Execution**  
> Run [`01_database_schema_and_crud_scripts.sql`](file:///C:/RapidResponse-IDSS/deliverables/01_database_schema_and_crud_scripts.sql) directly in **pgAdmin**, **DBeaver**, or via terminal:
> ```bash
> psql -U postgres -d sdr_dss_db -f "C:\RapidResponse-IDSS\deliverables\01_database_schema_and_crud_scripts.sql"
> ```

> [!TIP]
> **Method 2: Node.js Automated REST API Seeding Script**  
> Make sure the Spring Boot backend server is running on `localhost:8080`, then run:
> ```bash
> node deliverables/seed_database.js
> ```
