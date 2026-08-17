# RapidResponse-IDSS

An Intelligent Disaster Relief Decision Support System (SDR-DSS) designed to coordinate flood rescue operations, resource distribution, and evacuation logistics during severe weather crises.

---

## 🛠️ Tech Stack & Workspace Structure
The project workspace is divided into two primary logical directories:
*   **`frontend/`**: Vite React single-page application styled with Tailwind CSS v4 and optimized with Oxlint rules.
*   **`backend/`**: Logical structure holding the backend algorithms and server components.

---

## 🚀 Key Modules & Algorithms

### 🗺️ Module 1: Route Optimization (A* & Dijkstra Pathfinding)
*   **Purpose:** Identifies optimal traversal paths for rescue vessels and vehicles through flooded grid terrains.
*   **Algorithms:** Comparative visualization of Dijkstra's algorithm and A* heuristic pathfinding, resolving blockages and speed-restricted water grids.

### 🚁 Module 2: Intelligent Resource Allocation (0/1 Knapsack)
*   **Purpose:** Maximizes survival supplies loaded into rescue helicopters without exceeding maximum payload capacity.
*   **Algorithms:** Branch & Bound state-space tree traversal contrasted with a Greedy 2-Approximation heuristic.

### 👥 Module 3: Infrastructure Connectivity Analysis (Kruskal's MST)
*   **Purpose:** Tracks and maintains vital road networks connecting supply bases and isolation shelters.
*   **Algorithms:** Kruskal's Minimum Spanning Tree (MST) using a Disjoint Set Union (DSU) data structure to detect critical path failures.

### 📊 Module 4: Intelligent Disaster Relief Decisions (Decision Matrix)
*   **Purpose:** Prioritizes victim groups and supply dispatches based on severity, vulnerability, and capacity constraints.
*   **Algorithms:** Multi-Criteria Decision Analysis (MCDA) matrix calculation.

### ✈️ Module 5: Transport Sequencing & TSP (Held-Karp dynamic programming)
*   **Purpose:** Sequences optimal delivery tours for rescue aircraft visiting multiple shelters and returning to HQ.
*   **Algorithms:** Held-Karp dynamic programming algorithm for exact Travelling Salesperson Problem (TSP) tour computation, coupled with a 2-Opt local search refinement heuristic.

---

## 💻 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm (v9+)

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/NiviruInsithaUdavinWeerasinghe/RapidResponse-IDSS.git
    ```
2.  Navigate to the frontend folder and install dependencies:
    ```bash
    cd RapidResponse-IDSS/frontend
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

---

## 🌿 Contribution Guidelines
For details on branching hierarchy (`develop` ➔ `development/module-X/...`) and our Pull Request workflow, please refer to our [Contribution Guidelines](CONTRIBUTING.md).
