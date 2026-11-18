# TDC client portfolio (prototype)

A client portfolio dashboard for The Date Crew matchmakers. A client's filled intake form becomes a structured portfolio: preferences sorted into 12 standard categories, split into **deal-breakers** and **soft rules**, with **follow-up questions** where answers clash or are vague. The matchmaker reviews everything, and every action is recorded in a client log.

> Full README (problem, walkthrough, screenshots, deployment) comes in the final checkpoint.

## Assumptions

- **Every intake form is TDC's standard intake form, version `tdc-intake-v1`.** Every client answers the same questions, in the same order. The template lives in one place: [`lib/intake-form.ts`](lib/intake-form.ts).
  - **Why:** consistency between matchmakers. Today each matchmaker records preferences in their own format, so the same preference gets written differently, buried, or missed. With one standard form, Matchmaker A and Matchmaker B always capture the same details, and the portfolio always has the same shape.
  - Sections 1 to 12 map one-to-one to the 12 preference categories (age and height, marital status, location, and so on).
- **The client decides what's a deal-breaker, not the AI.** Every preference question has an importance mark chosen by the client:
  - Deal-breaker → deal-breaker
  - Nice to have → soft rule
  - Doesn't matter → not added
  - "Is there anything that's a definite no?" → deal-breakers. Other free text and "Anything to add?" notes → soft rules.
  - The AI never overrides the client's mark. When the wording disagrees with the mark (for example "Nice to have" next to "absolutely no smokers"), it raises a follow-up question instead.
- **If a file isn't the standard form**, the portfolio shows a warning ("This doesn't look like TDC's standard intake form. Results may be incomplete.") and sorts what it can. Sample 5 shows this.
- **Only the matchmaker's side is built.** Sending the form to the client and the client filling it in happen outside the app.
- **Demo data only.** There is no live AI call: the 5 sample forms return pre-sorted results stored in [`data/sample-results`](data/sample-results). Uploading your own file shows a "demo data only" message.
- **One matchmaker's dashboard.** The app is Matchmaker A's view (set in [`lib/matchmakers.ts`](lib/matchmakers.ts)), standing in for a real login.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Demo data

All names and details are made up.

- [`data/intakes.ts`](data/intakes.ts): every client's filled standard form (8 mock clients and 5 samples), plus what the AI adds when sorting it.
- `npm run build:demo-data`: regenerates the form files in `public/mock-forms` and `public/sample-forms` (including the PDFs) and the demo results in `data/sample-results`.
- `npm run check:data`: checks every source quote appears word for word in its form, and every demo result matches the expected format.
- Data is saved in the browser (`localStorage`, plus IndexedDB for uploaded files) through one module, [`lib/store.ts`](lib/store.ts), so it could be swapped for a real database (for example Supabase) later. "Reset demo data" in the footer clears it.
