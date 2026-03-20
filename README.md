# 🧠 Chalto — The Clarity Engine

Chalto is a financial **clarity engine** built specifically for French freelancers.

It answers one critical question:

👉 **"How much can I safely spend right now without putting myself at risk later?"**

Instead of tracking the past, Chalto simulates the future.

---

## 🚀 What makes Chalto different

### 1. Simulation-first, not accounting-first
Most tools show you what already happened. Chalto shows you what is **about to happen**.

It models:
- **Your current cash**
- **Your future income** (with uncertainty levels)
- **Your upcoming obligations** (URSSAF, taxes, retirement…)

Then it simulates your cash over time to detect risk **before** it happens.

### 2. A deterministic financial engine
Chalto is built like a financial system, not a simple dashboard.
- **Integer-based arithmetic** (`MoneyCents`, `RateBps`)
- **Deterministic outputs** (same input = same result)
- **Fully auditable** calculations
- **Versioned fiscal rules** (France 2026)

👉 **No approximations. No black box.**

### 3. Safe-to-spend based on reality, not estimates
Chalto does not rely on annual averages. It computes:
- Your lowest future cash point
- Your next risk date
- Your required reserve

Then it derives a **safe-to-spend amount** you can actually trust.

---

## 🧭 The Experience

### A single number that matters
💰 **You can safely spend: 2 300 €**

### A timeline that explains everything
- Upcoming URSSAF payments
- Income tax deadlines
- Projected income
- Future cash balance
*All mapped on a clear time axis.*

### Clear, human explanations
Not: *"Minimum projected balance"*  
But: **"Your lowest cash point will be in May due to URSSAF."**

---

## 🧪 Reliability
The engine is fully tested and verified:
- **Fiscal rules**: Micro, BNC, Artiste, ACRE, Versement Libératoire.
- **Revenue projection**: Stable, Variable, Irregular (EWMA).
- **Cashflow simulation**: Timeline accuracy, min balance detection.

👉 **Every result is deterministic and reproducible.**

---

## 🧱 Architecture
```
src/core/
  ├── simulation/
  ├── fiscal/
  ├── projection/
  ├── scheduler/
  ├── risk/
src/models/
src/rulesets/
src/components/
```

---

## 🎯 What Chalto really is
Not a budgeting app. Not an accounting tool.  
👉 **A financial safety radar for freelancers.**

**Chalto doesn’t tell you what you earned. It tells you what you can afford.**
