# 🚀 RapidResponse IDSS

Welcome to the **RapidResponse Intelligent Decision Support System (IDSS)**! This is a desktop-oriented system designed to orchestrate emergency response and rescue operations. It optimizes vehicle routing, packages helicopter resource drop-offs, checks network integrity, and schedules delivery sequences.

---

## 📂 Project Structure

This project uses a modular monolith design where each team works in their own dedicated module. The bootstrap module packages everything together so it starts up fast and runs in a single runtime.

*   **`core-application/`** - The main launcher and configuration bootstrapper.
*   **`module-shared-algorithms/`** - Shared core algorithm models and helper interfaces.
*   **`module-route-optimization/`** - Route calculations using Dijkstra & A* Search (Module 1).
*   **`module-resource-allocation/`** - Resource packing via Branch & Bound & Greedy Knapsack (Module 2).
*   **`module-network-analysis/`** - Road integrity checks & Kruskal's MST (Module 3).
*   **`module-intelligent-decision/`** - SOS request prioritizer (Module 4).
*   **`module-route-sequencing/`** - Delivery sequencing with Held-Karp DP & 2-Opt (Module 5).
*   **`frontend/`** - React user interface dashboard.

---

## 🛠️ Tech Stack

*   **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, HTML/CSS/JavaScript
*   **Backend:** Java 17, Spring Boot, Spring Data JPA, Spring Security
*   **Database:** PostgreSQL (Supabase Cloud Hosting)
*   **APIs:** SpringDoc (Swagger UI) for interactive endpoint testing

---

## 🚀 How to Set Up and Run

### 1. Prerequisites
Make sure you have these installed on your computer:
*   **Java JDK 17** or higher
*   **Node.js** (LTS version)

---

### 2. Backend Setup
1. Create a file named **`application-local.yml`** inside the folder:  
   `core-application/src/main/resources/`
2. Add your shared database connection details in it (this file is ignored by Git to protect credentials):
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://YOUR_DATABASE_HOST:5432/postgres
       username: YOUR_DATABASE_USERNAME
       password: YOUR_DATABASE_PASSWORD
   ```

3. Choose **one** of the two methods below to start the server:

#### Option A: Run directly from code (Best for Development)
This compiles and runs the server instantly, updating automatically when you save changes:
*   **Windows (PowerShell):**
    ```powershell
    $env:MAVEN_OPTS="-Dmaven.multiModuleProjectDirectory=C:\RapidResponse-IDSS"
    .\mvnw.cmd spring-boot:run -pl core-application "-Dspring-boot.run.profiles=local,no-auth"
    ```
*   **Mac/Linux:**
    ```bash
    chmod +x mvnw
    export MAVEN_OPTS="-Dmaven.multiModuleProjectDirectory=$(pwd)"
    ./mvnw spring-boot:run -pl core-application "-Dspring-boot.run.profiles=local,no-auth"
    ```

#### Option B: Build and run as a JAR file (Faster Startup)
This compiles the code into an executable JAR package and runs it:
*   **Windows (PowerShell):**
    ```powershell
    $env:MAVEN_OPTS="-Dmaven.multiModuleProjectDirectory=C:\RapidResponse-IDSS"
    .\mvnw.cmd clean install -DskipTests
    java -jar core-application/target/core-application-1.0.0.jar --spring.profiles.active=local,no-auth
    ```
*   **Mac/Linux:**
    ```bash
    chmod +x mvnw
    export MAVEN_OPTS="-Dmaven.multiModuleProjectDirectory=$(pwd)"
    ./mvnw clean install -DskipTests
    java -jar core-application/target/core-application-1.0.0.jar --spring.profiles.active=local,no-auth
    ```

4. **Verify it works:**
   Open your browser to **`http://localhost:8080/swagger-ui/index.html`** to test the API endpoints interactively.

---

### 3. Frontend Setup
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the interface server:
   ```bash
   npm run dev
   ```
4. **Open the App:**  
   Click the URL displayed in the terminal (usually `http://localhost:5173`) to view the interactive dashboard.
