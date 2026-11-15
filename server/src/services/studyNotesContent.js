/**
 * Master MBA Study Notes Content Repository
 * Provides comprehensive, self-contained study notes for all syllabus documents.
 * Ensures students can read these notes and never need to open raw PPT slides.
 */

export const STUDY_NOTES_BANK = {
  profitMaximization: {
    text: `# Profit Maximization & Competitive Supply — Master Study Notes

> **Executive Summary:** In economics and business strategy, a firm's primary objective is to maximize economic profit (Profit = TR - TC). In a perfectly competitive market, individual firms are price takers facing a horizontal demand curve (P = AR = MR). To maximize profit, a competitive firm must produce at the exact output level where Price equals Marginal Cost (P = MC), provided the Marginal Cost curve is rising and Price covers operating variable costs.

---

## 1. Core Economic Foundations & Profit Rules

### A. The Profit Function
Economic profit is total revenue minus total economic cost (explicit out-of-pocket costs plus implicit opportunity costs):
**Profit(q) = TR(q) - TC(q)**

### B. The General Profit Maximization Condition
- **First-Order Condition (FOC):** d(Profit)/dq = MR - MC = 0 ==> **MR = MC**.
- **Second-Order Condition (SOC):** d2(Profit)/dq2 < 0 ==> Marginal Cost (MC) must be upward sloping at the point of intersection.
- If **MR > MC**: Expanding output adds more to revenue than cost ==> firm should increase production.
- If **MR < MC**: Expanding output adds more to cost than revenue ==> firm should decrease production.

### C. The Competitive Firm as a Price Taker
- Because a single competitive firm is negligibly small relative to the market, it cannot influence price:
**P = AR = MR**
- Therefore, the competitive firm's profit maximization rule simplifies directly to:
**P = MC**

---

## 2. Short-Run Production Decisions & The Shutdown Rule

In the short run, fixed costs (TFC) are sunk and must be paid regardless of whether the firm produces zero or positive output. Therefore, the production decision depends entirely on Average Variable Cost (AVC):

| Market Price Condition | Firm Profitability Status | Short-Run Decision Rule |
| :--- | :--- | :--- |
| **P > ATC** | Positive Economic Profit (Profit > 0) | **Produce at P = MC** and expand operations. |
| **P = ATC** | Normal Profit / Break-Even (Profit = 0) | **Produce at P = MC**; all explicit and implicit costs are fully covered. |
| **AVC <= P < ATC** | Economic Loss (Operating at a loss) | **Continue Operating in Short Run:** Total revenue covers all variable costs and contributes toward fixed costs. Losses < TFC. |
| **P < AVC** | **Economic Shutdown Zone** | **Shut Down Immediately:** Revenue fails to cover operating variable expenses. Producing would make losses > TFC. |

---

## 3. The Competitive Firm's Supply Curve

- **Short-Run Supply Curve:** The firm's short-run supply curve is the upward-sloping portion of its **Marginal Cost (MC) curve lying above the minimum of Average Variable Cost (AVC)**. At any price below min AVC, output is strictly zero.
- **Long-Run Competitive Equilibrium:** In the long run, firms can freely enter and exit the industry.
  - If economic profits > 0, new firms enter ==> market supply shifts right ==> price drops.
  - If economic profits < 0, existing firms exit ==> market supply shifts left ==> price rises.
  - **Zero Economic Profit Condition:** In long-run equilibrium:
**P = MC = min ATC**
  - Every firm produces at minimum efficient scale, maximizing societal economic efficiency.

---

## 4. Producer Surplus vs Economic Profit

- **Producer Surplus (PS):** The total revenue received by producers over and above the variable cost required to produce that output:
**PS = TR - TVC**
- **Relationship to Profit:** Since TC = TFC + TVC, profit is Profit = TR - TVC - TFC. Therefore:
**PS = Profit + TFC**
- In the short run, Producer Surplus exceeds economic profit by the exact amount of Total Fixed Cost (TFC).

---

## 5. Market Structures Comparison Matrix

| Feature | Perfect Competition | Monopolistic Competition | Oligopoly | Monopoly |
| :--- | :--- | :--- | :--- | :--- |
| **Number of Firms** | Countless small firms | Many firms | Few dominant sellers | Single seller |
| **Product Nature** | Homogeneous (identical) | Differentiated | Standardized or differentiated | Unique, no close substitutes |
| **Pricing Power** | Price Taker (P = MC) | Price Maker (P > MC) | Strategic pricing / Interdependent | Price Maker (P > MC) |
| **Entry Barriers** | None (Free entry/exit) | Low | High (scale, patents, capital) | Very High / Impassable |
| **Long-Run Profit** | Zero Economic Profit | Zero Economic Profit | Substantial Economic Profit | High Economic Profit |
| **Efficiency** | Productive & Allocative | Excess capacity, markups | Allocatively inefficient | Deadweight loss to society |

---

## 6. High-Yield MBA Exam Takeaways

- **The Shutdown Heuristic:** Fixed costs are irrelevant to the short-run shutdown decision! If an exam problem gives Fixed Costs, do NOT include them when evaluating P against AVC.
- **Supply Curve Identification:** The competitive supply curve is ALWAYS Q = f(P) derived from P = MC, defined only for P >= min AVC.
- **Allocative Efficiency:** Perfect competition achieves allocative efficiency because P = MC, meaning consumer valuation equals the marginal resource cost of production.`,
    mermaid: `flowchart TD
  Demand["Market Equilibrium Price (P)"] --> FirmRule["Competitive Firm: P = MR = MC"]
  FirmRule --> CheckAVC{"Is Price >= min AVC?"}
  CheckAVC -- Yes --> CheckATC{"Is Price >= min ATC?"}
  CheckAVC -- No --> Shutdown["Shut Down Operations in Short Run (Loss = TFC)"]
  CheckATC -- "P > ATC" --> SuperProfit["Earn Positive Economic Profit (P - ATC) * Q"]
  CheckATC -- "AVC <= P < ATC" --> MinLoss["Operate in Short Run to Minimize Loss (Covers VC + part of FC)"]
  CheckATC -- "P = min ATC" --> BreakEven["Break-Even / Zero Economic Profit (Long-Run Equilibrium)"]`
  },

  costOfProduction: {
    text: `# Cost of Production & Scale Economics — Master Study Notes

> **Executive Summary:** Understanding cost structures is fundamental to managerial pricing, capacity planning, and long-run competitive advantage. Economic costs encompass both explicit cash disbursements and implicit opportunity costs. In the short run, the law of diminishing marginal returns dictates cost curvature; in the long run, economies and diseconomies of scale determine minimum efficient scale (MES).

---

## 1. Accounting vs Economic Cost & Sunk Costs

- **Explicit Costs:** Direct out-of-pocket payments for wages, raw materials, rent, and utilities.
- **Implicit Costs:** The opportunity cost of resources owned by the firm (e.g. foregone salary of the founder, interest on invested equity capital).
**Economic Profit = Total Revenue - (Explicit Costs + Implicit Costs)**
**Accounting Profit = Total Revenue - Explicit Costs**
- **Sunk Costs:** Expenditures that have already been made and cannot be recovered. Strategic managers must ignore sunk costs when evaluating future investment or operational decisions.

---

## 2. Short-Run Cost Equations & Geometric Relationships

In the short run, at least one input factor (typically capital/plant capacity) is fixed:

| Cost Metric | Formula | Geometric Behavior & Economic Meaning |
| :--- | :--- | :--- |
| **Total Fixed Cost (TFC)** | TFC (Constant) | Horizontal line; independent of output volume. |
| **Total Variable Cost (TVC)** | TVC = w * L | Increases with output; rate of increase governed by marginal product of labor. |
| **Total Cost (TC)** | TC = TFC + TVC | Vertical summation of TFC and TVC. |
| **Average Fixed Cost (AFC)** | AFC = TFC / Q | Continuously declines as output rises (spreading overhead). |
| **Average Variable Cost (AVC)** | AVC = TVC / Q | U-shaped; reaches minimum when MC = AVC. |
| **Average Total Cost (ATC)** | ATC = AFC + AVC = TC / Q | U-shaped; vertical distance between ATC and AVC equals AFC. |
| **Marginal Cost (MC)** | MC = Change in TC / Change in Q | J-shaped / U-shaped; cuts AVC and ATC at their absolute minimum points. |

### The Critical MC-ATC Relationship
- When **MC < ATC**: The marginal unit costs less than the running average ==> ATC is falling.
- When **MC > ATC**: The marginal unit costs more than the running average ==> ATC is rising.
- When **MC = ATC**: ATC is at its absolute minimum (Productive Efficiency point).

---

## 3. Long-Run Costs & Economies of Scale

In the long run, all input factors are variable. The Long-Run Average Cost (LRAC) curve forms the lower envelope of all possible short-run SRAC curves:

- **Economies of Scale (Increasing Returns to Scale):** LRAC declines as output expands. Driven by labor specialization, bulk procurement discounts, high-capacity machinery, and spreading R&D.
- **Constant Returns to Scale:** LRAC remains flat over a wide output range.
- **Diseconomies of Scale (Decreasing Returns to Scale):** LRAC increases as output expands. Driven by managerial communication bottlenecks, coordination breakdown, and bureaucratic bloat.
- **Minimum Efficient Scale (MES):** The lowest output level at which a plant can achieve minimum long-run average cost. If MES is very large relative to total market demand, the industry naturally concentrates into an oligopoly or natural monopoly.

---

## 4. Managerial Decisions & High-Yield Exam Takeaways

- **Cost Minimization Rule (Isoquants & Isocosts):** To produce a given output at minimum cost, the marginal product per dollar spent must be equal across all inputs:
**(MP of Labor / Wage) = (MP of Capital / Rental Rate of Capital)**
- **Exam Rule:** If MC is rising, ATC does not necessarily have to rise immediately; ATC continues falling as long as MC remains below ATC.`,
    mermaid: `flowchart LR
  Output["Output Expansion (Q)"] --> Stage1["Economies of Scale: LRAC Declines (Specialization, Bulk Buying)"]
  Stage1 --> MES["Minimum Efficient Scale (MES): LRAC Minimized"]
  MES --> Stage2["Constant Returns to Scale: LRAC Flat"]
  Stage2 --> Stage3["Diseconomies of Scale: LRAC Rises (Bureaucracy, Coordination Loss)"]`
  },

  elasticity: {
    text: `# Elasticities of Demand & Supply — Master Study Notes

> **Executive Summary:** Elasticity measures the percentage responsiveness of quantity demanded or supplied to changes in price, consumer income, or competitor prices. For business managers, price elasticity of demand (Ed) directly determines whether a price increase will grow or destroy total revenue (TR).

---

## 1. Price Elasticity of Demand (Ed)

### Definition & Mathematical Formulas
**Ed = (% Change in Qd) / (% Change in Price) = (Change in Qd / Change in Price) * (P / Q)**

- **Arc Elasticity (Midpoint Method):** Used for discrete price jumps:
**Ed = [(Q2 - Q1) / ((Q1 + Q2) / 2)] / [(P2 - P1) / ((P1 + P2) / 2)]**

### Elasticity Categorization

| Value of |Ed| | Terminology | Consumer Response | Total Revenue Impact when Price Increases (P Up) |
| :--- | :--- | :--- | :--- |
| **|Ed| > 1** | **Price Elastic** | Quantity drops by a greater percentage than price rise. | **Total Revenue Falls (TR Down)** |
| **|Ed| = 1** | **Unitary Elastic** | Percentage change in quantity exactly balances price change. | **Total Revenue is Maximized** |
| **|Ed| < 1** | **Price Inelastic** | Quantity drops by a smaller percentage than price rise. | **Total Revenue Rises (TR Up)** |
| **|Ed| = 0** | **Perfectly Inelastic** | Vertical demand curve; quantity unchanged (e.g. life-saving insulin). | Revenue rises directly with price. |
| **|Ed| = Infinity** | **Perfectly Elastic** | Horizontal demand curve; any price hike causes sales to fall to zero. | Revenue drops to zero. |

---

## 2. Income Elasticity of Demand (EI)

Measures how sales respond to shifts in consumer income:
**EI = (% Change in Qd) / (% Change in Income)**

- **Normal Goods (EI > 0):** Demand increases as consumer income rises.
  - **Necessities (0 < EI < 1):** Demand grows slower than income (e.g. staple groceries).
  - **Luxuries (EI > 1):** Demand grows faster than income (e.g. luxury cars, fine dining).
- **Inferior Goods (EI < 0):** Demand decreases as income rises (e.g. instant noodles, public transit).

---

## 3. Cross-Price Elasticity of Demand (Exy)

Measures how the demand for Good X shifts in response to a price change in Good Y:
**Exy = (% Change in Qx) / (% Change in Py)**

- **Substitute Goods (Exy > 0):** Price of Y rises ==> Consumers buy more X (e.g. Coke & Pepsi, iPhone & Android).
- **Complementary Goods (Exy < 0):** Price of Y rises ==> Demand for X falls (e.g. Razor handles & blades, Smartphones & data).
- **Independent Goods (Exy = 0):** No interaction between the two markets.

---

## 4. Managerial Pricing Heuristics & Exam Takeaways

- **Markup Pricing (Lerner Index Rule):** A profit-maximizing firm with market power sets its price markup according to price elasticity:
**(P - MC) / P = -1 / Ed  ==>  P = MC / [1 + (1 / Ed)]**
- The more price-inelastic the customer demand, the higher the profit markup a manager can sustain!`,
    mermaid: `flowchart TD
  Pricing["Managerial Price Change Strategy"] --> CheckEd{"Check Price Elasticity |Ed|"}
  CheckEd -- "|Ed| > 1 (Elastic)" --> Action1["Cut Prices to Increase Volume -> Total Revenue Rises"]
  CheckEd -- "|Ed| < 1 (Inelastic)" --> Action2["Raise Prices -> Margins Outweigh Volume Drop -> Total Revenue Rises"]
  CheckEd -- "|Ed| = 1 (Unitary)" --> Action3["Total Revenue is Maximized at Current Level"]`
  },

  consumerBehavior: {
    text: `# Consumer Behavior & Utility Maximization — Master Study Notes

> **Executive Summary:** Consumer theory explains how rational economic agents allocate scarce household budgets across competing goods to maximize satisfaction (utility). The model combines subjective preferences (indifference curves) with objective economic constraints (the budget line) to determine consumer equilibrium.

---

## 1. Axioms of Consumer Preference

1. **Completeness:** Consumers can rank all feasible consumption bundles (A preferred to B, B preferred to A, or indifferent).
2. **Transitivity:** If bundle A is preferred to B, and B is preferred to C, then A must be preferred to C. Prevents cyclical preferences.
3. **Non-Satiation ("More is Better"):** Goods are desirable; consumers always prefer more of any good to less.

---

## 2. Indifference Curves & Marginal Rate of Substitution (MRS)

- **Indifference Curve (IC):** Represents all combinations of two consumption goods that provide identical total utility.
- **Key Geometric Properties:**
  1. Downward sloping (due to non-satiation; giving up good Y requires more good X to stay equally happy).
  2. Convex to the origin (reflects diminishing marginal rate of substitution).
  3. Cannot cross (intersecting curves violate the transitivity axiom).
  4. Higher curves represent higher total utility levels.
- **Marginal Rate of Substitution (MRSxy):** The rate at which a consumer is willing to substitute good Y for one more unit of good X while maintaining the same utility:
**MRSxy = -(Change in Y / Change in X) = MUx / MUy**

---

## 3. The Budget Line & Consumer Optimum

### The Budget Constraint
**Px * X + Py * Y <= Income**
- The budget line has slope = **-(Px / Py)**, reflecting the relative market price ratio.

### The Consumer Equilibrium Condition
The optimal consumption bundle occurs at the point of tangency between the budget line and the highest attainable indifference curve:
**MRSxy = Px / Py  <==>  MUx / Px = MUy / Py**
- **Economic Intuition:** At equilibrium, the marginal utility per dollar spent must be equalized across all consumed goods.

---

## 4. Income and Substitution Effects

When the price of Good X falls, total consumption shifts due to two distinct effects:
- **Substitution Effect:** The consumer substitutes toward the now relatively cheaper good, holding real utility constant. **Always negative** (cheaper good purchased in greater quantity).
- **Income Effect:** The drop in price increases the consumer's real purchasing power.
  - Normal good: Income effect reinforces substitution effect ==> consumption expands.
  - Inferior good: Income effect opposes substitution effect ==> consumption expands slightly.
  - Giffen good: Extreme inferior good where income effect overwhelms substitution effect (upward sloping demand).`,
    mermaid: `flowchart LR
  Budget["Consumer Income & Prices: Px*X + Py*Y = I"] --> Tangency["Equilibrium Tangency: MRS = Px / Py"]
  Preferences["Subjective Preferences: MUx / MUy"] --> Tangency
  Tangency --> EqualUtility["Condition: MUx / Px = MUy / Py (Utility Maximized)"]`
  },

  demandEstimation: {
    text: `# Demand Estimation & Econometric Forecasting — Master Study Notes

> **Executive Summary:** Managers cannot rely solely on theoretical demand curves; they must estimate empirical demand functions using regression analysis and market experiments. Accurate demand estimation allows product managers and CFOs to forecast sales, evaluate price elasticities, and model the impact of advertising and competitive moves.

---

## 1. Empirical Estimation Methods

- **Consumer Interviews & Focus Groups:** Useful for novel product concepts, but subject to hypothetical bias and non-commitment.
- **Market Experiments (A/B Testing):** Testing actual pricing changes across isolated geographic test markets or online digital cohorts.
- **Econometric Regression Analysis:** Uses historical cross-sectional or time-series data to statistically isolate the effect of each independent variable on quantity demanded.

---

## 2. The Empirical Demand Specification
A typical linear multiple regression model is specified as:
**Qd = a - b*P + c*I + d*Ps - e*Pc + f*A + error**
Where:
- P = Own Price (expected b > 0)
- I = Consumer Income (c > 0 for normal goods)
- Ps = Price of Substitute Goods (d > 0)
- Pc = Price of Complementary Goods (e > 0)
- A = Advertising / Marketing expenditure (f > 0)

---

## 3. Evaluating Regression Output

| Diagnostic Metric | Threshold / Standard | Business Interpretation |
| :--- | :--- | :--- |
| **R-squared (Coefficient of Determination)** | 0.0 to 1.0 (> 0.70 desirable) | Proportion of total variance in quantity explained by the regression model. |
| **Adjusted R-squared** | Slightly lower than R-squared | Penalizes adding irrelevant explanatory variables to the regression. |
| **t-Statistic** | |t| > 2.0 for 95% confidence | Tests whether an individual coefficient is statistically different from zero. |
| **p-Value** | p < 0.05 (standard significance) | Probability that observed relationship occurred purely by random chance. |
| **F-Statistic** | Significant p < 0.01 | Tests the overall statistical significance of the entire regression equation. |

---

## 4. Key Methodological Challenges

- **The Identification Problem:** Market price and quantity data reflect equilibrium points where demand intersects supply. Without using instrumental variables to control for supply shifts, regression estimates a hybrid curve rather than true demand.
- **Multicollinearity:** When independent variables are highly correlated (e.g. income and advertising simultaneously rising over time), standard errors balloon, making individual t-tests unreliable.`,
    mermaid: `flowchart LR
  Data["Historical Market Data (P, Q, Income, Competitors)"] --> OLS["Ordinary Least Squares (OLS) Regression"]
  OLS --> Eval["Evaluate Diagnostics: R2, t-stats, p-values"]
  Eval --> Elasticity["Derive Empirical Price & Income Elasticities"]
  Elasticity --> Decision["Optimal Pricing & Revenue Forecasting"]`
  },

  theoryOfFirm: {
    text: `# Theory of the Firm & Market Structures — Master Study Notes

> **Executive Summary:** Explores why economic production is organized inside hierarchical firms rather than through spot-market transactions, investigates agency problems between owners and executives, and analyzes strategic conduct in imperfect market structures (Monopolistic Competition, Oligopoly, and Monopoly).

---

## 1. Why Do Firms Exist? (Coase & Transaction Costs)

- **Coase Theorem (Ronald Coase):** Conducting business through open market contracts incurs significant **Transaction Costs**:
  - Search and information costs (finding suppliers).
  - Bargaining and contracting costs (drafting legal terms).
  - Monitoring and enforcement costs (preventing opportunistic behavior / holdup).
- A firm exists when coordinating production internally via management hierarchy is less costly than negotiating repeated spot contracts in the market.

---

## 2. The Principal-Agent Problem & Governance

- **The Dilemma:** Shareholders (Principals) seek long-term profit and share value maximization; Managers (Agents) may seek executive perks, salary expansion, risk avoidance, or empire-building.
- **Corporate Governance Alignment Mechanisms:**
  - Executive stock options and equity-linked bonuses.
  - Independent Board of Directors oversight.
  - Threat of hostile takeovers and proxy battles in capital markets.

---

## 3. Imperfect Market Structures Breakdown

### A. Monopoly
- Single seller with extreme barriers to entry (patents, natural scale, network effects).
- **Pricing:** Price maker setting output where MR = MC, then charging price off the market demand curve (P > MC).
- **Deadweight Loss:** Monopolies produce less output and charge higher prices than competitive markets, transferring consumer surplus into monopoly rents and creating deadweight social loss.

### B. Oligopoly & Strategic Game Theory
- Dominated by a few large interdependent firms where each firm's optimal action depends on rival reactions.
- **Kinked Demand Curve:** Rivals match price decreases (inelastic response) but ignore price increases (elastic response), resulting in rigid pricing.
- **Nash Equilibrium:** A situation where each player chooses the optimal strategy given the strategies chosen by rivals, with no incentive to unilaterally deviate.
- **Prisoner's Dilemma:** Individual rational incentives lead both firms to defect (cut prices or over-advertise), resulting in worse outcomes than collusive cooperation.`,
    mermaid: `flowchart TD
  Structures["Market Structures Continuum"] --> PC["Perfect Competition: P = MC (Zero Long-Run Profit)"]
  Structures --> MC["Monopolistic Competition: P > MC, Differentiated, Free Entry"]
  Structures --> Oligo["Oligopoly: Few Firms, Game Theory, Kinked Demand"]
  Structures --> Mono["Monopoly: Single Seller, P >> MC, Deadweight Loss"]`
  },

  techStacks: {
    text: `# Tech Stacks Deep Dive & Python Architecture — Master Study Notes

> **Executive Summary:** A visual field guide for Product Managers on software architecture tiers, Python's role across the web and enterprise stack, and the strategic trade-offs of framework selection. Understanding technical architecture enables PMs to assess engineering feasibility, control technical debt, and communicate product specifications effectively.

---

## 1. The Three-Tier Architectural Model

Modern enterprise software divides responsibilities across three distinct architectural layers:

**[Presentation Tier: Client UI] <---> [Logic Tier: Server & APIs] <---> [Data Tier: Storage & DB]**

1. **Presentation Tier (Client User Experience):**
   - Renders visual components, captures inputs, performs client-side form validation.
   - Technologies: React, Vue, Next.js, iOS Swift, Android Kotlin.
2. **Logic Tier (Application Server & Business Engine):**
   - Enforces business rules, calculates workflows, orchestrates external microservices, manages authentication.
   - Technologies: Python (Django, Flask, FastAPI), Node.js (Express), Java (Spring Boot), Go.
3. **Data Tier (Persistence & Storage Layer):**
   - Preserves state, executes transactional queries, ensures data integrity.
   - Technologies: PostgreSQL, MySQL, MongoDB, Redis, Amazon S3.

---

## 2. Python Strategic Trade-offs for Product Managers

| Key Strategic Strengths (Why PMs Choose It) | Key Operational Limitations & Trade-offs |
| :--- | :--- |
| **High Developer Velocity:** Clean, readable syntax allows engineering teams to ship MVPs and test market hypotheses in half the time of compiled languages. | **Execution Speed:** Slower raw CPU performance compared to Go, Rust, or C++ due to interpreted bytecode execution. |
| **Dominant AI & Data Ecosystem:** PyPI features 500,000+ packages; undisputed standard for AI/ML (PyTorch, TensorFlow, Pandas, Scikit-Learn). | **Global Interpreter Lock (GIL):** Prevents native multithreaded CPU scaling within a single process; requires multiprocessing or async patterns. |
| **Abundant Talent Pool:** Large hiring market with lower recruitment costs and straightforward onboarding. | **Runtime Type Errors:** Dynamic typing can cause hidden production crashes without strict typing (e.g. Pydantic, Mypy). |

---

## 3. Web Backend Framework Selection Matrix

| Framework | Architecture Style | Strengths & Best Use Cases | PM Decision Heuristic |
| :--- | :--- | :--- | :--- |
| **Django** | "Batteries-Included" Monolith | Built-in ORM, admin dashboard, auth, routing, CSRF protection. Powers Instagram, Pinterest. | Choose for fast feature delivery in content-heavy, relational CRUD applications. |
| **Flask** | Minimalist Microframework | Lightweight core; developer chooses ORM, auth, and database plugins. | Choose for microservices, lightweight APIs, and rapid prototype integrations. |
| **FastAPI** | Modern Asynchronous | Native async/await support, automatic OpenAPI/Swagger documentation, fast performance. | Choose for modern data/AI APIs, real-time services, and microservice architectures. |

---

## 4. High-Yield Revision Points for Product Managers

- **Technical Debt Management:** Rapid prototyping in Python is ideal for Phase 1 MVP validation; as scale hits millions of requests, compute-heavy microservices can be isolated and rewritten in Go or Rust.
- **Architectural Modularity:** Separate business logic cleanly into microservices connected by documented REST/gRPC interfaces rather than building tangled monolithic databases.`,
    mermaid: `flowchart LR
  Client["Client Tier: React / Mobile App"] --> Gateway["API Gateway / Reverse Proxy (Nginx)"]
  Gateway --> Logic["Logic Tier: Python Backend (Django / FastAPI)"]
  Logic --> Cache["Redis Cache (Session & Latency)"]
  Logic --> DB["Data Tier: PostgreSQL (ACID Relational Data)"]`
  },

  apiIntegration: {
    text: `# APIs & System Integrations — Master Study Notes

> **Executive Summary:** APIs (Application Programming Interfaces) are software contracts governing how independent systems exchange data and trigger actions. For Product Managers, APIs define partner ecosystems, enable platform business models, and establish performance contracts (SLAs, idempotency, latency).

---

## 1. Architectural Styles Comparison

| Protocol / Style | Mechanism & Format | Key Strengths | Limitations | Ideal PM Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **REST** | Resource-oriented; HTTP methods; JSON payloads. | Universally understood, easy to cache, stateless. | Over-fetching or under-fetching of data fields. | Standard public APIs, web and mobile client backends. |
| **GraphQL** | Single endpoint; client specifies query schema. | Eliminates over/under-fetching; combines data sources in one request. | Complex caching, server performance vulnerability. | Rich mobile applications with fluctuating data needs. |
| **gRPC** | Binary Protocol Buffers over HTTP/2. | Ultra-low latency, strongly typed contracts, bidirectional streaming. | Not natively human-readable; browser support requires proxies. | High-throughput internal microservice-to-microservice communication. |
| **Webhooks** | Event-driven reverse API (HTTP POST on event). | Real-time push notifications; saves server polling resources. | Requires delivery retry mechanisms and signature verification. | Payment status updates (Stripe), CI/CD events, alerts. |

---

## 2. HTTP Verbs & Idempotency Rules

**Idempotency** guarantees that executing an operation multiple times produces the identical side-effect as executing it once. This is critical for preventing duplicate financial charges or double-order placements!

| HTTP Verb | Operation | Idempotent? | Safe? (Read-Only) | Status Code on Success |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | Retrieve resource | **Yes** | **Yes** | **200 OK** |
| **POST** | Create new resource | **No** | **No** | **201 Created** |
| **PUT** | Completely replace resource | **Yes** | **No** | **200 OK** or **204 No Content** |
| **PATCH** | Partially update resource | **Typically Yes** | **No** | **200 OK** |
| **DELETE** | Remove resource | **Yes** | **No** | **200 OK** or **204 No Content** |

---

## 3. Essential HTTP Status Codes for Product Specifications

- **200 OK:** Request succeeded; payload returned.
- **201 Created:** Resource successfully created (standard for POST).
- **400 Bad Request:** Client sent invalid JSON schema or missing required fields.
- **401 Unauthorized:** Missing or expired authentication token (unauthenticated).
- **403 Forbidden:** Authenticated, but user permissions/role do not allow access.
- **404 Not Found:** Resource ID does not exist in the database.
- **429 Too Many Requests:** Rate limit exceeded (Token Bucket / Leaky Bucket).
- **500 Internal Server Error:** Unhandled server exception / backend bug.
- **502 Bad Gateway / 504 Gateway Timeout:** Upstream service or microservice failed to respond in time.`,
    mermaid: `sequenceDiagram
  autonumber
  participant Client as Client Application
  participant Gateway as API Gateway & Auth
  participant Server as Logic Service
  participant DB as Database

  Client->>Gateway: POST /orders (Idempotency-Key: uuid-123)
  Gateway->>Gateway: Verify JWT Token & Rate Limit
  Gateway->>Server: Forward Validated Request
  Server->>DB: Check If Key uuid-123 Already Processed
  alt Already Processed
    Server-->>Client: Return Cached 200 OK (No Double Charge!)
  else New Order
    Server->>DB: Insert Order & Save Key
    Server-->>Client: 201 Created
  end`
  },

  databaseModeling: {
    text: `# Databases, Data Modeling & CAP Theorem — Master Study Notes

> **Executive Summary:** Data persistence choices determine system scalability, consistency, and disaster tolerance. Product managers must understand relational (SQL) versus non-relational (NoSQL) trade-offs, ACID versus BASE models, and the unavoidable constraints imposed by the CAP theorem.

---

## 1. Relational (SQL) vs Non-Relational (NoSQL)

| Feature | Relational Databases (SQL) | Non-Relational Databases (NoSQL) |
| :--- | :--- | :--- |
| **Data Schema** | Strict, pre-defined tabular schema (Rows & Columns). | Flexible, schema-less (JSON Documents, Key-Value, Graph). |
| **Query Mechanism** | Structured Query Language (SQL) with complex JOINs. | API / JSON query interfaces; denormalized access. |
| **Scaling Model** | Vertical scaling (bigger server CPU/RAM); read replicas. | Horizontal scaling (sharding across cheap distributed clusters). |
| **Core Guarantee** | **ACID** (Atomicity, Consistency, Isolation, Durability). | **BASE** (Basically Available, Soft State, Eventual Consistency). |
| **Examples** | PostgreSQL, MySQL, Oracle. | MongoDB (Document), Redis (In-Memory Key-Value), Cassandra (Wide-Column). |
| **Ideal PM Use Case** | Financial transactions, inventory counts, ERP, order ledgers. | High-speed logging, product catalogs, user session caches, real-time chat. |

---

## 2. ACID Guarantees vs BASE Paradigm

- **Atomicity:** All operations in a transaction succeed, or the entire transaction rolls back ("All or Nothing").
- **Consistency:** Data must obey all declared constraints and foreign keys before and after every transaction.
- **Isolation:** Concurrent transactions execute without interfering with one another.
- **Durability:** Once committed, transaction records survive power outages or system crashes.

---

## 3. The CAP Theorem for Distributed Systems

In any distributed data system across a network, network partitions (communication failures) are unavoidable (P). Therefore, a distributed system must choose between **Consistency (C)** or **Availability (A)**:

- **CP Systems (Consistency + Partition Tolerance):** If a network split occurs, the database refuses writes or returns errors rather than serving stale or conflicting data (e.g. banking ledgers, HBase).
- **AP Systems (Availability + Partition Tolerance):** If a network split occurs, all nodes accept reads and writes, but data may temporarily diverge until background synchronization completes (e.g. social feeds, Cassandra, DynamoDB).`,
    mermaid: `flowchart TD
  CAP["CAP Theorem Trade-off"] --> P["Partition Tolerance (Unavoidable in Networks)"]
  P --> Choice{"Pick One:"}
  Choice -- "Consistency (CP)" --> Bank["Strict Consistency: Block writes during network split to prevent corruption"]
  Choice -- "Availability (AP)" --> Social["High Availability: Always accept writes, sync eventually (Eventual Consistency)"]`
  },

  sprintPlanning: {
    text: `# Agile Scrum & Sprint Planning — Master Study Notes

> **Executive Summary:** Agile Scrum is an iterative product delivery framework designed to navigate uncertainty and deliver value incrementally. Sprint planning aligns the Product Owner, Scrum Master, and Developers on sprint goals, story point capacity, and the Definition of Done.

---

## 1. Core Scrum Roles & Responsibilities

- **Product Owner (PO):** Owns the "What" and "Why". Manages and prioritizes the Product Backlog, defines Acceptance Criteria, and accepts or rejects finished work.
- **Scrum Master:** Owns the "How" and team agility. Removes impediments, coaches the team, and facilitates Scrum ceremonies.
- **Development Team:** Owns the "How Much" and execution. Estimates effort, designs technical architecture, and commits to sprint backlog delivery.

---

## 2. Key Scrum Artifacts & Definitions

- **Product Backlog:** A living, prioritized list of all desired features, technical improvements, and bug fixes for the product.
- **Sprint Backlog:** The subset of Product Backlog items selected by the team during Sprint Planning, together with the delivery plan.
- **User Story Standard Structure:**
  > *"As a [User Persona], I want to [Perform an Action] so that [Achieve Business Value / Outcome]."*
- **Acceptance Criteria:** Specific, testable pass/fail conditions written by the Product Owner to confirm a user story fulfills its purpose.
- **Definition of Done (DoD):** Shared agreement on quality standards required for an item to be releasable (e.g. code reviewed, unit test coverage > 80%, staging validated, documentation updated).

---

## 3. Sprint Planning & Estimation Mechanics

- **Planning Poker:** Relative sizing estimation using modified Fibonacci points (1, 2, 3, 5, 8, 13, 20). Prevents anchoring bias.
- **Team Velocity:** The total story points successfully completed and meeting DoD in a single sprint. Rolling velocity averages enable predictable quarterly release forecasting.`,
    mermaid: `flowchart LR
  Backlog["Product Backlog (Prioritized by PO)"] --> SprintPlan["Sprint Planning: Agree on Goal & Capacity"]
  SprintPlan --> SprintBacklog["Sprint Backlog: Committed User Stories"]
  SprintBacklog --> Execution["2-Week Sprint Execution & Daily Standup"]
  Execution --> Review["Sprint Review (Demo) & Retrospective"]
  Review --> Increment["Working Product Increment (Meets DoD)"]`
  },

  mrm: {
    text: `# Management Research Methodology (MRM) — Master Study Notes

> **Executive Summary:** MRM provides systematic frameworks to convert ambiguous business dilemmas into rigorous research problems, design empirical studies, execute valid sampling, and make evidence-based strategic decisions.

---

## 1. Problem Identification: MDP vs MRP

The foundation of sound research is clearly distinguishing between managerial action and research inquiry:

| Dimension | Management Decision Problem (MDP) | Management Research Problem (MRP) |
| :--- | :--- | :--- |
| **Orientation** | **Action-Oriented** ("What should we do?") | **Information-Oriented** ("What do we need to know?") |
| **Focus** | Focuses on decisions, symptoms, and business choices. | Focuses on underlying causes, measurement, and consumer facts. |
| **Perspective** | Executive / Managerial perspective. | Researcher / Analytical perspective. |
| **Example** | *"Should we introduce a premium electric SUV model?"* | *"Determine consumer willingness to pay, brand perception, and range anxiety barriers."* |

---

## 2. Classification of Research Designs

1. **Exploratory Research:**
   - Purpose: Discover insights, clarify ambiguous problems, generate hypotheses.
   - Methods: Secondary literature reviews, in-depth interviews, focus groups, pilot studies.
   - Characteristics: Qualitative, flexible, small non-representative samples.
2. **Descriptive Research:**
   - Purpose: Describe market characteristics, frequency of occurrence, and consumer profiles.
   - Methods: Cross-sectional structured surveys, longitudinal panels, observational audits.
   - Characteristics: Pre-planned hypotheses, structured questionnaires, quantitative analysis.
3. **Causal Research:**
   - Purpose: Prove cause-and-effect relationships (X ==> Y).
   - Methods: Laboratory experiments, randomized field trials, A/B testing.
   - Requirement: Concomitant variation, time order of occurrence, and elimination of confounding variables.

---

## 3. Sampling Design & Measurement Scales

- **Probability Sampling:** Every population element has a known, non-zero probability of selection (Simple Random, Stratified, Cluster, Systematic). Results can be statistically generalized.
- **Non-Probability Sampling:** Selection relies on personal judgment or convenience (Convenience, Judgmental, Quota, Snowball). Exploratory, but cannot statistically represent the population.
- **Measurement Scales (NOIR):**
  - **Nominal:** Labels / Categories only (e.g. Gender, Brand choice).
  - **Ordinal:** Ranked order without fixed intervals (e.g. Customer satisfaction ratings 1-5).
  - **Interval:** Equal numerical distance between points, no true zero (e.g. Temperature Celsius, Likert agreement scales).
  - **Ratio:** Equal intervals with an absolute meaningful zero point (e.g. Revenue, Weight, Age).`,
    mermaid: `flowchart TD
  Problem["Managerial Dilemma (Symptoms)"] --> Definition["Translate MDP to MRP (Information Needs)"]
  Definition --> Design{"Select Research Design"}
  Design -- "Ambiguous Problem" --> Exploratory["Exploratory: Focus Groups & Qualitative Discovery"]
  Design -- "Aware of Problem" --> Descriptive["Descriptive: Structured Surveys & Market Profiling"]
  Design -- "Testing Causality" --> Causal["Causal: Controlled Experiments & A/B Tests"]`
  },

  leadership: {
    text: `# Leadership Accelerator & Executive Dynamics — Master Study Notes

> **Executive Summary:** Modern business leadership requires situational adaptability, high emotional intelligence (EQ), the creation of psychological safety, and mastery of interpersonal conflict resolution.

---

## 1. Situational Leadership Model (Hersey & Blanchard)

Effective leaders do not use a single static style; they match their leadership behavior (Task Direction vs Relationship Support) to the developmental maturity and competence of their followers:

| Follower Readiness | Developmental Stage | Optimal Leadership Style | Behavioral Approach |
| :--- | :--- | :--- | :--- |
| **R1 (Low Competence, High Commitment)** | Enthusiastic Beginner | **Directing (S1)** | High Task, Low Relationship. Specific instructions, close supervision. |
| **R2 (Some Competence, Low Commitment)** | Disillusioned Learner | **Coaching (S2)** | High Task, High Relationship. Explain decisions, solicit suggestions, support. |
| **R3 (High Competence, Variable Commitment)** | Capable but Cautious Contributor | **Supporting (S3)** | Low Task, High Relationship. Facilitate, listen, share decision-making. |
| **R4 (High Competence, High Commitment)** | Self-Reliant Achiever | **Delegating (S4)** | Low Task, Low Relationship. Turn over operational responsibility. |

---

## 2. Emotional Intelligence (EQ) Pillars (Daniel Goleman)

1. **Self-Awareness:** Deep understanding of one's emotions, strengths, limitations, values, and impact on others.
2. **Self-Regulation:** Ability to control or redirect disruptive impulses and moods; thinking before acting.
3. **Internal Motivation:** Passion to work for reasons beyond money or status; resilience in the face of setbacks.
4. **Empathy:** Skill in understanding the emotional makeup of other people; treating individuals according to their emotional reactions.
5. **Social Skill:** Proficiency in managing relationships, building networks, finding common ground, and leading change.

---

## 3. Psychological Safety & Conflict Modes

- **Psychological Safety (Amy Edmondson):** The shared belief that a team is safe for interpersonal risk-taking. Teams with high psychological safety admit errors faster, innovate more, and exhibit higher retention.
- **Thomas-Kilmann Conflict Resolution Modes:**
  - **Competing:** High Assertiveness, Low Cooperativeness ("My way"). Used in emergencies.
  - **Collaborating:** High Assertiveness, High Cooperativeness ("Win-win"). Used for strategic integration.
  - **Compromising:** Moderate Assertiveness & Cooperativeness ("Split difference").
  - **Avoiding:** Low Assertiveness, Low Cooperativeness ("Delay").
  - **Accommodating:** Low Assertiveness, High Cooperativeness ("Your way").`,
    mermaid: `flowchart TD
  Leader["Executive Leadership"] --> EQ["Emotional Intelligence (Self-Awareness, Empathy, Social Skills)"]
  Leader --> Safety["Psychological Safety (Open Candor, Safe to Fail)"]
  Leader --> Situation["Situational Leadership: S1 Directing | S2 Coaching | S3 Supporting | S4 Delegating"]`
  }
};
