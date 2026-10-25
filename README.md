# SafeRoute AI — Intelligent Emergency Evacuation & Dynamic Path-Replanning Simulator

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-5.x-brightgreen.svg)](https://vitest.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)

> **Academic Course Project**: Demonstrating classical Artificial Intelligence search, state-space representations, heuristic evaluations, and dynamic obstacle-driven route replanning in an interactive evacuation simulation.

---

## 1. Project Overview & Problem Statement

In a simulated structural facility or campus during an emergency event, corridors can become rapidly blocked by structural collapse, debris, or advancing fire hazards. Traditional static evacuation maps fail under dynamic conditions because previously assigned egress routes become impassable.

**SafeRoute AI** demonstrates an intelligent agent that:
1. Searches the spatial state space to find optimal evacuation routes from an evacuee's location to available emergency exits.
2. Evaluates multiple candidate exits concurrently, routing to the lowest valid path cost.
3. Dynamically senses newly introduced blockages along its trajectory and triggers an immediate recalculation from its exact current coordinate.
4. Distinguishes between traversable normal corridors, impassable solid walls, high-cost fire hazards, and weighted crowd debris.

> **Safety Notice & Disclaimer**: This software is an educational algorithmic simulator built for computer science coursework. It is **not** a certified life-safety emergency guidance system and must not be used for real-world life-critical architectural navigation.

---

## 2. Implemented AI Algorithms

All algorithms are implemented from scratch in pure TypeScript without third-party pathfinding libraries or hardcoded heuristics.

### A. Breadth-First Search (BFS)
- **Search Strategy**: Level-by-level exhaustive expansion using an efficient First-In, First-Out (FIFO) queue.
- **Optimality**: Mathematically guarantees the shortest path in **number of steps** when all traversable grid cells have uniform cost ($c = 1$).
- **Limitation**: Blind to edge weights; treats high-cost fire hazards identically to empty corridors.
- **Complexity**: Time $\mathcal{O}(|V| + |E|)$, Space $\mathcal{O}(|V|)$.

### B. Dijkstra's Algorithm (Uniform-Cost Search)
- **Search Strategy**: Explores nodes radially outward in strict non-decreasing order of accumulated path cost $g(n)$ using a Min-Priority Binary Heap.
- **Heterogeneous Costs**:
  - Empty corridor: Cost = $1$
  - Congestion / Debris: Cost = $3$
  - Fire / Smoke Hazard: Cost = $5$
  - Solid Wall: Cost = $\infty$ (impassable)
- **Optimality**: Guaranteed to discover the global minimum-cost path to the closest reachable exit.
- **Complexity**: Time $\mathcal{O}(|E| + |V| \log |V|)$, Space $\mathcal{O}(|V|)$.

### C. A* Search (Informed Heuristic Search)
- **Evaluation Function**:
  $$f(n) = g(n) + h(n)$$
  - $g(n)$: Accumulated cost from start to cell $n$.
  - $h(n)$: Heuristic estimate from cell $n$ to the nearest emergency exit.
  - $f(n)$: Total estimated route cost through cell $n$.
- **Multi-Goal Admissible Heuristic**:
  For an exit set $E = \{e_1, e_2, \dots, e_k\}$:
  $$h(n) = \min_{e \in E} \left( |n.x - e.x| + |n.y - e.y| \right)$$
- **Admissibility & Consistency Proof**:
  Because all traversable cell transitions incur a minimum cost $c \ge 1$, the 4-directional Manhattan distance to the closest exit never overestimates the true remaining cost ($h(n) \le h^*(n)$). Manhattan distance also satisfies the triangle inequality $h(n) \le c(n, n') + h(n')$, making it consistent. Consequently, when an exit is first dequeued, its path is guaranteed optimal, while pruning up to 70% of node expansions compared to Dijkstra.
- **Tie-Breaking**: Employs micro tie-breaking ($f + 0.0001 \cdot h$) to resolve equidistant branches toward the target exit.

### D. Greedy Best-First Search
- **Search Strategy**: Prioritizes nodes strictly by $f(n) = h(n)$, expanding cells closest to the goal as the crow flies.
- **Behavior**: Extremely rapid progression in open areas, but does not take accumulated cost $g(n)$ into account. It readily traverses dangerous high-cost hazards and can get caught in local dead-ends.
- **Pedagogical Value**: Visually demonstrates why informed heuristics require accumulated cost $g(n)$ to maintain optimality.

---

## 3. Dynamic Route Replanning Architecture

```
                 +-----------------------+
                 |  Initial Evacuation   |
                 |     Path Planned      |
                 +-----------+-----------+
                             |
                             v
                 +-----------------------+
                 | Agent Advances 1 Step |
                 +-----------+-----------+
                             |
                             v
             /-------------------------------\
            /  Is Remaining Path Obstructed?  \
            \    (New Wall / Hazard / Fire)   /
             \-------------------------------/
                       /           \
                 YES  /             \  NO
                     v               v
    +-------------------------+  +-------------------------+
    | Invalidate Route & Log  |  | Evacuee Reached Exit?   |
    | Incident at Step [k]    |  +------------+------------+
    +------------+------------+               |
                 |                     YES /     \ NO
                 v                        v       v
    +-------------------------+      [ SUCCESS ] [ Continue ]
    | Re-search from Current  |
    | Coordinate (x, y)       |
    +------------+------------+
                 |
         /---------------\
        /  Path Found?    \
       /-------------------\
         /               \
   YES  /                 \  NO
       v                   v
+--------------+   +---------------+
| Resume on    |   | Evacuation    |
| New Route    |   | Trapped Alert |
+--------------+   +---------------+
```

1. **Discrete State Tracking**: The agent maintains an active coordinate $(x, y)$, current path slice, and target exit reference.
2. **Route Invalidation**: During every simulation tick, the upcoming path is validated against the active grid topology.
3. **Local Re-search**: When a user clicks to place a wall or hazard along the path, SafeRoute AI detects the obstruction, records an incident log, and triggers an instantaneous search rooted at the agent's exact location.
4. **Target Exit Switching**: If the original exit becomes blocked, the multi-goal heuristic automatically pivots toward the next reachable exit.
5. **Collision Invariance**: The agent is mathematically prevented from ever occupying a blocked cell.

---

## 4. Project Directory Structure

```
c:/AI/
├── src/
│   ├── algorithms/
│   │   ├── bfs.ts                # Breadth-First Search implementation
│   │   ├── dijkstra.ts           # Dijkstra Uniform Cost Search
│   │   ├── astar.ts              # A* with Admissible Manhattan Heuristic
│   │   ├── greedyBestFirst.ts    # Greedy Best-First Search
│   │   ├── index.ts              # Unified runner & benchmark engine
│   │   └── algorithms.test.ts    # Algorithm unit tests
│   ├── components/
│   │   ├── Header.tsx            # EOC header with live status pill
│   │   ├── ControlPanel.tsx      # Sidebar controls, speed, tools, presets
│   │   ├── SimulationGrid.tsx    # Interactive Canvas map renderer
│   │   ├── InfoPanel.tsx         # Telemetry metrics & real-time event log
│   │   ├── ComparisonDashboard.tsx # Real-time comparative benchmark & charts
│   │   ├── ExplanationModal.tsx  # "How the AI Thinks" theory modal
│   │   ├── AboutModal.tsx        # Course project rubric & concept info
│   │   ├── SaveLayoutModal.tsx   # Custom layout persistence dialog
│   │   ├── Legend.tsx            # Visual map symbols guide
│   │   └── App.test.tsx          # Full UI integration tests
│   ├── simulation/
│   │   ├── simulationEngine.ts   # State machine, collision, replanning loop
│   │   ├── presets.ts            # Simple Building, Crowded, Blocked Exit, Generator
│   │   └── simulationEngine.test.ts # Replanning & edge-case unit tests
│   ├── types/
│   │   └── index.ts              # TypeScript domain types & interfaces
│   ├── utils/
│   │   ├── priorityQueue.ts      # Binary Min-Heap Priority Queue
│   │   ├── gridHelpers.ts        # Coordinates, distance metrics, validation
│   │   └── storage.ts            # LocalStorage persistence manager
│   ├── test/
│   │   └── setup.ts              # Test environment & Canvas mocks
│   ├── App.tsx                   # Top-level application coordinator
│   ├── main.tsx                  # Vite React entry point
│   └── index.css                 # Tailwind CSS styling & dark mode scrollbars
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── README.md
```

---

## 5. Local Setup & Execution Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later (tested on Node v24.21.0)
- npm v9 or later (tested on npm 11.19.0)

### 1. Installation
Clone or navigate to the project directory:
```bash
cd c:/AI
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser to the local URL displayed (typically `http://localhost:5173`).

### 3. Run Automated Tests
```bash
npm test
```
Executes all 21 unit and integration tests across algorithms, simulation replanning, and UI components via Vitest.

### 4. Build for Production
```bash
npm run build
```
Generates a minified, type-checked production bundle in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 6. Built-in Scenario Presets

1. **Simple Building**: A corporate floor with partition walls, central hallway, and two clear exit doors. Ideal for inspecting base search expansion.
2. **Crowded Corridor**: Multi-wing facility with narrow corridors, congestion debris, and multiple route bifurcations. Demonstrates weighted detour selection.
3. **Blocked Exit (Replanning Showcase)**: Primary Exit A is directly obstructed by an advancing fire front. Forces the agent to replan toward secondary Exit B en route.
4. **Procedural Floorplan Generator**: Synthesizes rooms, doorways, hallways, and two perimeter exits dynamically.

---

## 7. College Course Project Submission Outline

Below is a recommended report outline for submitting SafeRoute AI as an academic AI course project:

```markdown
# SafeRoute AI Course Project Report Outline

1. Title Page & Abstract
   - Title: SafeRoute AI — Intelligent Emergency Evacuation and Dynamic Path-Replanning Simulator
   - Author, Course ID, Academic Term, Institution
   - Abstract: Problem statement, 4 classical algorithms evaluated, real-time replanning results

2. Introduction & State-Space Formulation
   - Problem domain: Emergency spatial navigation under dynamic uncertainty
   - Graph formulation: G = (V, E), discrete 2D grid coordinates, action set A = {N, S, E, W}
   - Traversal costs: c(v) in {1 (Normal), 3 (Debris), 5 (Hazard), Infinity (Wall)}

3. Algorithms Implemented & Complexity Analysis
   - Breadth-First Search (FIFO queue, unweighted optimality)
   - Dijkstra's Algorithm (Min-heap uniform cost search)
   - A* Search (f = g + h formulation, admissible multi-target Manhattan distance)
   - Greedy Best-First Search (pure heuristic, suboptimality demonstration)
   - Complexity summary table: Time, Space, Completeness, Optimality

4. Dynamic Replanning Engine & Agent Design
   - Sense-Plan-Act cycle
   - Obstacle detection and path invalidation threshold
   - Re-search from current agent position
   - Handling multi-exit failover and unreachable conditions

5. Empirical Benchmark & Results Discussion
   - Comparison table: Path length, total cost, node expansions, search latency
   - Visualizing state-space exploration wavefronts
   - Analysis: Why A* pruned node expansions while matching Dijkstra's optimal cost

6. Automated Verification & Quality Assurance
   - 21 automated tests covering algorithms, boundary traps, collision invariance, and UI state
   - Production compilation and performance verification

7. Limitations & Future Extensions
   - Diagonal movement (Octile / Chebyshev distance)
   - Moving fire fronts (dynamic hazard cellular automata)
   - Multi-agent crowd simulation and congestion bottlenecks

8. Conclusion & References
   - Russell & Norvig, "Artificial Intelligence: A Modern Approach"
   - Educational simulation safety disclaimer
```

---

## 8. Deployment & Hosting (Vercel)

This repository is optimized for seamless deployment on [Vercel](https://vercel.com/):

### One-Click Import via Vercel Dashboard
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** → **"Project"**.
3. Import the repository: `Nithicoder/SafeRoute-AI`.
4. Vercel will automatically detect the configuration via `vercel.json` and Vite preset:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **"Deploy"**. The application will be live in under 60 seconds with SSL and global CDN.

---

## 9. Official Repository

- **Repository**: [https://github.com/Nithicoder/SafeRoute-AI](https://github.com/Nithicoder/SafeRoute-AI)
- **Author**: Nithicoder
- **Branch**: `main`

---

## 10. License

This project is released under the **MIT License** for academic and educational evaluation.
