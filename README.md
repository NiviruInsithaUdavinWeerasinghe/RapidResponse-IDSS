# RapidResponse IDSS

This is a desktop program for emergency response and rescue operations. It handles vehicle routes, resource packing, network checking, and delivery tours.

---

## How the Code is Organized

The project uses a modular monolith design. Each team pair works in their own folder. The main launcher runs everything together inside a single program to save computer memory and start up fast.

*   `core-application/` - The main startup package that runs the program.
*   `module-shared-algorithms/` - Shared mathematical solver engines.
*   `module-route-optimization/` - Dijkstra & A* pathfinders (Module 1).
*   `module-resource-allocation/` - Knapsack payload packing solvers (Module 2).
*   `module-network-analysis/` - Connectivity checks & Kruskal MST (Module 3).
*   `module-intelligent-decision/` - Priority score normalizers (Module 4).
*   `module-route-sequencing/` - Held-Karp dynamic programming & 2-Opt TSP tours (Module 5).
*   `frontend/` - React user interface.

---

## Tech Stack

*   **Frontend:** React, Vite, Tailwind CSS v4, Lucide React, HTML/CSS/JavaScript
*   **Backend:** Java 17, Spring Boot, Spring Data JPA, Spring Security
*   **Database:** PostgreSQL (Supabase Cloud Database)
*   **Libraries:** Lombok, MapStruct, SpringDoc (Swagger UI), Spring Validation

---

## How to Set Up and Run

### 1. Prerequisites
Install these on your computer:
*   Java JDK 17 or higher
*   Node.js (LTS version)

---

### 2. Backend Setup
1. Create a file named `application-local.yml` inside the `core-application/src/main/resources/` folder.
2. Paste the shared Supabase connection details in it (this file is ignored by Git to keep credentials safe):
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://INSERT_SHARED_DB_HOST_HERE:5432/postgres
       username: INSERT_SHARED_USERNAME_HERE
       password: INSERT_SHARED_PASSWORD_HERE
   ```
3. Open your terminal in the root project folder and run the builder:
   *   **Windows:**
       ```powershell
       .\mvnw.cmd clean install
       java -jar core-application/target/core-application-1.0.0.jar
       ```
   *   **Mac/Linux:**
       ```bash
       chmod +x mvnw
       ./mvnw clean install
       java -jar core-application/target/core-application-1.0.0.jar
       ```
4. Test the backend APIs using Swagger in your browser:
   *   Open: `http://localhost:8080/swagger-ui.html`

---

### 3. Frontend Setup
1. Open a new terminal and go to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the packages:
   ```bash
   npm install
   ```
3. Run the frontend:
   ```bash
   npm run dev
   ```
