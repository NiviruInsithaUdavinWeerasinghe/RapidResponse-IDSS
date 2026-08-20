# RapidResponse-IDSS Contribution Guidelines

Thank you for contributing to the RapidResponse-IDSS project! To maintain codebase integrity, prevent merge conflicts, and enforce quality control, please adhere strictly to the following guidelines.

## Repository Branch Hierarchy

To ensure stable deployments, all feature developments follow a strict multi-tier branching tree structure:

```text
Repository Branch Hierarchy:
├── main (Production / Stable Releases)
│   └── develop (Core Shared Development Integration Branch)
│       │
│       ├── development/module-1/route-optimization (Module 1 Base)
│       │   ├── development/module-1/kisandu
│       │   └── development/module-1/nethmi
│       │
│       ├── development/module-2/resource-allocation (Module 2 Base)
│       │   ├── development/module-2/gajindu
│       │   └── development/module-2/raaed
│       │
│       ├── development/module-3/network-analysis (Module 3 Base)
│       │   ├── development/module-3/sasundul
│       │   └── development/module-3/niragi
│       │
│       ├── development/module-4/intelligent-decision (Module 4 Base)
│       │   ├── development/module-4/dulmina
│       │   └── development/module-4/mesanda
│       │
│       └── development/module-5/system-optimization (Module 5 Base — Optimization Module)
│           ├── development/module-5/niviru
│           └── development/module-5/evan
```

---

# Team Git & GitHub Workflow

## Phase 1: Planning (On GitHub)
Before starting any development, the task must exist as an issue on GitHub.

1. Go to the **Issues** tab on GitHub.
2. Click **New Issue**. Add a title and description of the feature or bug.
3. Note the number assigned to the issue (e.g., `#5`). You will reference this in your commits.
4. Assign the issue to yourself.

---

## Phase 2: Starting the Work (In PowerShell)
Never start coding until you have pulled the latest changes from your module's base branch and created your isolated workspace.

1. Fetch and checkout your module's base branch (e.g. `development/module-1/route-optimization`):
   ```powershell
   git checkout develop
   git pull origin develop
   git checkout development/module-1/route-optimization
   git pull origin development/module-1/route-optimization
   ```
2. Create your individual dev branch:
   *(Must be branched off your module's base, e.g., `development/module-1/kisandu`)*
   ```powershell
   git checkout -b development/module-1/your-name
   ```

---

## Phase 3: Coding & Saving (In Your IDE & PowerShell)
Once your work is implemented, buildable, and tested locally:

1. Stage your modified files:
   ```powershell
   git add .
   ```
2. Commit your progress:
   *(Always include "Refs #IssueNumber" so GitHub automatically links the issue)*
   ```powershell
   git commit -m "Feat: Implement dynamic path visualization (Refs #5)"
   ```
3. Push your branch up to GitHub:
   ```powershell
   git push -u origin development/module-1/your-name
   ```

---

## Phase 4: Review and Merge (On GitHub)
**Never merge your own code.** Another member of your module team must review it.

### 1. Create the Pull Request (The Developer):
* Go to the GitHub repository.
* Click the **Pull requests** tab, then click **New pull request**.
* **Base target:** Choose your module base branch (e.g., `development/module-1/route-optimization`).
* **Compare branch:** Choose your dev branch (e.g., `development/module-1/your-name`).
* Click **Create pull request**.

### 2. Review and Merge (The Reviewer):
* Open the Pull Request.
* Inspect the **Files changed** tab to verify readability, correctness, and that no files were broken.
* Approve and click **Merge pull request**.
* Click **Delete branch** on GitHub immediately after merging to keep the remote workspace tidy.

---

## Phase 5: Cleanup & Synchronization (In PowerShell)
Once merged, remove the merged branch from your local environment.

1. Switch back to your module base branch and pull the merged code:
   ```powershell
   git checkout development/module-1/route-optimization
   git pull origin development/module-1/route-optimization
   ```
2. Delete your local dev branch:
   ```powershell
   git branch -d development/module-1/your-name
   ```
3. Clear deleted branches from your local cache:
   ```powershell
   git fetch --prune
   ```

> **Note:** Following this strict merge workflow (Dev Branch ➔ Module Base ➔ Develop ➔ Main) prevents file overwrites and keeps Git history clean.
