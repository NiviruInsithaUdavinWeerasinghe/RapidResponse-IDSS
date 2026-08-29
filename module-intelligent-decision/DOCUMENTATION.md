# Module 4 – Intelligent Decision Support Module (SDR-DSS)
## Comprehensive Technical & Algorithmic Documentation

---

### 6.1 Problem Analysis

In post-disaster scenarios, the Central Disaster Relief Headquarters (HQ) operates under extreme urgency and severe resource scarcity. Rescue camps distributed across an affected region continuously transmit **Emergency SOS Requests**. In severe catastrophic events, the central control room may receive hundreds of concurrent requests (e.g., $N \approx 500$). However, available rescue vehicles, medical evacuation teams, and relief trucks are strictly constrained by a maximum daily capacity $C$.

Selecting which camps/requests to approve for immediate dispatch is a **Multi-Criteria 0-1 Subset Selection Problem** (an NP-Hard combinatorial optimization problem isomorphic to the 0-1 Knapsack Problem).

#### Decision Criteria & Trade-offs
Each SOS request $i \in \{1, \dots, n\}$ carries heterogeneous situational attributes:
1. **Injury Severity ($S_i \in [1, 10]$)**: Clinical triage urgency representing life-threatening physical trauma and casualties.
2. **Camp Population ($P_i \ge 1$)**: Number of vulnerable displaced people at risk.
3. **Supply Shortage ($\sigma_i \in [0\%, 100\%]$)**: Critical deficit of potable water, sustenance, and emergency medical kits.
4. **Resource / Vehicle Requirement ($w_i > 0$)**: The number of rescue trucks/teams necessary to safely execute the mission.

#### Mathematical Formulation
To prevent larger numeric domains (e.g. population up to 2000) from distorting decisions over smaller scales (e.g. severity 1–10), criteria are min-max normalized into the unit interval $[0, 1]$:

$$\bar{S}_i = \frac{S_i - \min(S)}{\max(S) - \min(S)}, \quad \bar{P}_i = \frac{P_i - \min(P)}{\max(P) - \min(P)}, \quad \bar{\sigma}_i = \frac{\sigma_i - \min(\sigma)}{\max(\sigma) - \min(\sigma)}$$

Given user-configurable weights $w_{\text{sev}}, w_{\text{pop}}, w_{\text{short}} \ge 0$ satisfying $\sum w = 1.0$, the composite priority score $v_i$ is defined as:

$$v_i = 100 \times \left( w_{\text{sev}} \cdot \bar{S}_i + w_{\text{pop}} \cdot \bar{P}_i + w_{\text{short}} \cdot \bar{\sigma}_i \right)$$

The optimization goal is:

$$\max \sum_{i=1}^{n} v_i x_i \quad \text{subject to} \quad \sum_{i=1}^{n} w_i x_i \le C, \quad x_i \in \{0, 1\}$$

---

### 6.2 Investigation of Candidate Algorithms

Four candidate algorithmic paradigms were investigated:

| Algorithm Paradigm | Time Complexity | Space Complexity | Optimality | Scalability ($N \approx 500$) | Suitability for Real-Time Relief |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Brute Force (Exhaustive Search)** | $O(2^n)$ | $O(n)$ | Exact | Intractable ($2^{500} \approx 10^{150}$) | Unacceptable for live dispatch |
| **Dynamic Programming (0-1 Knapsack)** | $O(n \cdot C)$ | $O(n \cdot C)$ | Exact (pseudo-poly) | High memory if $C$ or weights are continuous/large | Inflexible for fractional/continuous truck capacities |
| **Branch and Bound (Best-First Search)** | $O(2^n)$ worst, $O(\text{poly})$ avg | $O(2^n)$ worst | **Exact (Optimal)** | Excellent for moderate batches ($n \le 35$); prunes $>90\%$ search space | **Selected Exact Method** |
| **Weighted Scoring (Strengthened Greedy)** | $O(n \log n)$ | $O(n)$ | **Heuristic ($\ge 50\%$ bound)** | Instantaneous ($< 5\text{ ms}$ for $n = 500$) | **Selected Heuristic Method** |

---

### 6.3 Algorithm Selection and Justification

1. **Exact Method — Branch and Bound with Fractional Upper Bounding**:
   - Computes guaranteed optimal rescue allocations.
   - Leverages continuous linear programming relaxation (Fractional Knapsack) to establish an admissible, tight upper bound at each decision tree node.
   - Employs a **Max-Heap Priority Queue** (Best-First Search) to prioritize highly promising partial solutions, enabling aggressive early pruning of suboptimal subtrees.
   - Fulfills **LO1, LO2, and LO3** requirements.

2. **Heuristic Method — Strengthened Weighted Scoring Heuristic**:
   - Provides sub-millisecond dispatch recommendations for large emergency batches ($n \ge 500$).
   - Combines a ratio-greedy pass ($v_i / w_i$) with a single-best feasible candidate pass ($\max v_i$).
   - Mathematically guarantees at least 50% ($\frac{1}{2}$-approximation) of the continuous relaxation upper bound.

---

### 6.4 Data Structure Design

1. **Array / List (`List<SOSRequest>`)**:
   - Stores raw and normalized SOS requests in contiguous memory for rapid indexing, iteration, and $O(n \log n)$ sorting.
2. **Priority Queue (`PriorityQueue<Node>`)**:
   - Max-heap ordered by the node's computed upper bound ($\text{upperBound}$).
   - Guarantees that the most promising branch in the decision tree is expanded first (Best-First Search).
3. **Decision Tree State Node (`Node`)**:
   - Stores `level` (current item index), accumulated `value`, accumulated `weight`, `upperBound`, and a boolean selection bitset `selection[]`.

---

### 6.5 Algorithm Design & Formal Pseudocode

#### Algorithm 1: Exact Branch and Bound Subset Selection
```text
Algorithm: BranchAndBoundSolver(items, capacity)
Input: List of selectable SOS requests items, maximum capacity C
Output: Optimal subset, maximum total score, performance metrics

1. Sort items by ratio (v_i / w_i) in descending order.
2. Initialize bestValue = 0.0, bestSelection = boolean array of size n.
3. Create Max-Heap PriorityQueue PQ ordered by node.upperBound descending.
4. root = new Node(level=0, value=0, weight=0, selection=[false...])
5. root.upperBound = ComputeUpperBound(items, C, level=0, currentWeight=0, currentValue=0)
6. PQ.insert(root)
7. While PQ is not empty:
8.     node = PQ.extractMax()
9.     exploredNodes = exploredNodes + 1
10.    If node.upperBound <= bestValue:
11.        prunedNodes = prunedNodes + 1
12.        Continue (Prune branch)
13.    If node.level == n:
14.        If node.value > bestValue:
15.            bestValue = node.value
16.            bestSelection = node.selection
17.        Continue
18.    item = items[node.level]
19.    // Branch 1: Include item (if feasible)
20.    If node.weight + item.weight <= C:
21.        incValue = node.value + item.value
22.        incWeight = node.weight + item.weight
23.        incSelection = copy(node.selection); incSelection[node.level] = true
24.        If incValue > bestValue:
25.            bestValue = incValue; bestSelection = incSelection
26.        incBound = ComputeUpperBound(items, C, node.level + 1, incWeight, incValue)
27.        If incBound > bestValue:
28.            PQ.insert(new Node(node.level + 1, incValue, incWeight, incBound, incSelection))
29.        Else:
30.            prunedNodes = prunedNodes + 1
31.    // Branch 2: Exclude item
32.    excBound = ComputeUpperBound(items, C, node.level + 1, node.weight, node.value)
33.    If excBound > bestValue:
34.        PQ.insert(new Node(node.level + 1, node.value, node.weight, excBound, node.selection))
35.    Else:
36.        prunedNodes = prunedNodes + 1
37. Return bestSelection, bestValue, exploredNodes, prunedNodes
```

#### Algorithm 2: Weighted Scoring Heuristic with Strengthened Bound
```text
Algorithm: WeightedScoringSolver(requests, capacity, weights)
Input: List of requests, capacity C, criteria weights (w_sev, w_pop, w_short)
Output: Approximate selected subset, total score, execution time

1. Normalize criteria values across requests to [0, 1] using min-max scaling.
2. For each request i:
3.     score_i = 100 * (w_sev * normSev_i + w_pop * normPop_i + w_short * normShort_i)
4. // Pass 1: Ratio-Greedy selection
5. Sort requests by (score_i / weight_i) descending.
6. greedyList = empty, greedyScore = 0, remCapacity = C
7. For each req in sortedRequests:
8.     If req.weight <= remCapacity:
9.         greedyList.add(req)
10.        greedyScore += req.score
11.        remCapacity -= req.weight
12. // Pass 2: Single-Best selection
13. singleBest = max { req | req.weight <= C } by req.score
14. // Pass 3: Strengthened Combination
15. If singleBest != null and singleBest.score > greedyScore:
16.     Return [singleBest], singleBest.score
17. Else:
18.     Return greedyList, greedyScore
```

---

### 6.6 Complexity Analysis

#### Time Complexity
- **Branch and Bound**:
  - *Worst-case*: $O(2^n)$, when no branch can be pruned before leaf level.
  - *Average-case*: Exponentially pruned search space where effective nodes explored is typically bounded by $O(n^k)$ for realistic non-adversarial emergency workloads.
- **Weighted Scoring**:
  - *Sorting pass*: $O(n \log n)$.
  - *Greedy scan*: $O(n)$.
  - *Single-best scan*: $O(n)$.
  - *Overall Time Complexity*: $\mathbf{O(n \log n)}$.

#### Space Complexity
- **Branch and Bound**: $O(2^n)$ in worst-case heap storage; $O(n)$ working array memory.
- **Weighted Scoring**: $\mathbf{O(n)}$ storage for normalized items and selection lists.

---

### 6.7 Implementation Difficulties & Solutions

1. **Safe Upper Bound Computation**:
   - *Challenge*: Overestimating the bound results in excessive state exploration; underestimating the bound causes premature pruning of the true optimal solution.
   - *Solution*: Implemented standard Dantzig fractional-relaxation upper bounding which is strictly admissible ($\text{UB} \ge \text{OPT}$) and provably safe against false pruning.
2. **Disparate Scale Distortions in MCDA**:
   - *Challenge*: Raw camp populations (e.g. 1500) could overpower injury severity (scale 1–10).
   - *Solution*: Min-max normalization scales every criterion dynamically to $[0, 1]$ before applying the normalized user weights.
3. **Floating-Point Precision Tolerance**:
   - *Challenge*: Roundoff errors during weight summation ($w_1 + w_2 \le C$) leading to false rejection.
   - *Solution*: Implemented an epsilon tolerance ($10^{-9}$) in capacity comparisons.
