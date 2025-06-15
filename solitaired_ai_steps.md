# Solitaired‑Style AI Feature Backlog
This checklist reverse‑engineers the experience at **Solitaired.com** and breaks it into incremental sprints for your own Klondike‑Solitaire project.

Copy an individual sprint into Cursor (running *Claude 3 Sonnet* or another agent) when you’re ready, or hand over the entire file for long‑form planning.

---

## 1 · Core Game Engine & State
1. **Refactor game state into a serialisable object**

   ```ts
   interface GameState {
     tableau: Card[][];
     foundations: Card[][];
     stock: Card[];
     waste: Card[];
     moves: Move[];
     startTs: number;
   }
   ```

   > Enables easy passing to AI, analytics & auto‑save.

2. **Deterministic shuffle functions**
   - `easyShuffle()` – ensure at least one immediate move.  
   - `mediumShuffle()` – no guaranteed unwinnables.  
   - `hardShuffle()` – allow blocked starts.  
   - `winnableShuffle(seed)` – brute‑force until a solver finds a win; store the seed for “Winnable Only”.

3. **Solver worker** (Web Worker + WASM/backtracking)

   Returns  
   ```jsonc
   { "solvable": true, "bestMoves": Move[], "minMoves": 94 }
   ```

   Used for **Solvable?** badge, AI overlay, and auto‑solve.

---

## 2 · AI Hint & Auto‑Solve
1. **Dual‑engine approach**
   *Fast rule‑based search* for speed, plus **OpenAI o4‑mini** for NL coaching.

   ```ts
   const prompt = `
     You are an expert Solitaire coach.
     Given JSON gameState below, output:
     - "nextMove": optimal legal move in algebraic form
     - "rationale": ≤25‑word reason a human will understand
     - "confidence": 0‑1
     - "futureOutlook": one‑sentence projection after move
   `;
   ```

2. **Auto‑solve button**  
   Stream `bestMoves` from the worker; fall back to LLM commentary if unsolved.

3. **Cache** LLM responses by position hash to save tokens.

---

## 3 · Performance Analytics Dashboard
1. Track per‑game metrics: win, moves, time, undo count, hint count.  
2. Persist to IndexedDB and periodically POST to `/api/metrics/:userId`.  
3. Build a **Recharts** dashboard (Moves, Win %, Avg Time).  
4. Add cognition‑style copy (“see if your focus is improving”).

---

## 4 · Gamification & Social Layer
1. **Coins & XP**  
   * +5 coins per win, +1 per daily login.  
   * Level up every 100 XP; show progress bar.

2. **Daily puzzle**  
   * Seed `winnableShuffle(today)`.  
   * Leaderboard key = `YYYY-MM-DD`.

3. **Global leaderboard API**

   ```sql
   CREATE TABLE daily_leaderboard (
     user_id uuid,
     date date,
     win_time int,
     moves int,
     PRIMARY KEY (date, win_time, user_id)
   );
   ```

4. Achievement badges (first win, 10‑game streak, sub‑100 moves, etc.).

---

## 5 · UX Polish
* F‑pattern control bar: **New • Undo • Hint • Auto‑solve**  
* Responsive card sprites (CSS Grid, prefers‑reduced‑motion).  
* Settings modal: themes, sounds, left‑hand mode, hotkeys, zoom.  
* PWA install banner + Service Worker for offline play.

---

## 6 · Multi‑Game Foundation (optional)
Abstract rules into `/rulesets/klondike.ts`, `/rulesets/spider.ts`, etc., and lazy‑load modules so you can expand beyond Klondike.

---

## 7 · Tech Stack & DevOps

| Layer      | Choice                     | Reason                                   |
|------------|---------------------------|------------------------------------------|
| Front‑end  | **React + TypeScript**     | aligns with existing codebase            |
| AI         | **OpenAI o4‑mini** + solver | LLM explanations & deterministic solves  |
| Backend    | **Supabase**               | Postgres, auth, real‑time leaderboards   |
| CI/CD      | GitHub Actions → Vercel    | preview deployments on each PR           |
| Monitoring | Sentry + Vercel analytics  | catch client errors                      |

---

## 8 · Sprint Milestones (suggested)

| Week | Deliverable                                       |
|------|---------------------------------------------------|
| 1    | Refactor state & deterministic shuffles           |
| 2    | Solver worker + “Solvable?” ribbon                |
| 3    | Hint fusion (search + OpenAI)                     |
| 4    | Auto‑solve animation & settings UI                |
| 5    | Performance analytics dashboard                   |
| 6    | Coins, XP, daily leaderboards                     |
| 7    | Mobile polish, PWA, accessibility audit           |
| 8    | Stretch: add Spider & FreeCell rulesets           |

---

### Quick Ask Template

```text
Claude, please implement Week 1 tasks.
Start by extracting all game‑state mutations into a useGameState hook
and add the three shuffle functions described.
Ensure TypeScript types compile and unit‑test winnableShuffle
with the solver worker stubbed.
```

Paste that into Cursor when ready. Happy building!
