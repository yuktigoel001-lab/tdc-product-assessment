# TDC client portfolio

A prototype for **The Date Crew** Product Growth assessment: a client portfolio dashboard for matchmakers. One filled intake form becomes a structured, standard portfolio in seconds, and the matchmaker stays in control.

**Live demo:** _add your Vercel link here_

## The problem

In the last 30 days, TDC matchmakers shared **1,000** profiles and clients accepted **310 (31%)**. About **35% of rejections** were for reasons the client had *already stated* in their preferences. Matchmaker A gets **44%** acceptance and Matchmaker B **21%**, with the same tools.

The diagnosis: **client preferences aren't recorded in a standard, structured way.** Each matchmaker keeps notes in their own format, so preferences get written differently, buried in emails, or missed when picking profiles.

## What the prototype shows

Every client gets a portfolio with preferences sorted into the same 12 categories, split into **deal-breakers** and **soft rules**.

1. The matchmaker sends the client TDC's standard intake form, and the client fills it in. *(Outside the app.)*
2. The matchmaker creates a new portfolio and uploads the filled form, or picks a sample.
3. **AI sorts the form:** preferences in standard categories, typed by the client's own importance marks, plus follow-up questions where answers clash or are vague, and a short summary.
4. **The matchmaker reviews it:** confirm, edit, or move a preference between deal-breakers and soft rules, and resolve follow-ups. Every action goes into the **client log**, and the original form stays attached.

Status updates on its own: **New** → **In review** → **Needs follow-up** (while questions are open) → **Ready** (everything confirmed, no open questions).

<!-- Screenshot 1: replace this line with ![Dashboard](docs/screenshots/1-dashboard.png) -->
> **Screenshot placeholder:** the dashboard (`docs/screenshots/1-dashboard.png`)

<!-- Screenshot 2: replace this line with ![Portfolio](docs/screenshots/2-portfolio.png) -->
> **Screenshot placeholder:** a portfolio with deal-breakers, soft rules, follow-ups and the client log (`docs/screenshots/2-portfolio.png`)

<!-- Screenshot 3: replace this line with ![New portfolio](docs/screenshots/3-new-portfolio.png) -->
> **Screenshot placeholder:** creating a new portfolio from a sample form (`docs/screenshots/3-new-portfolio.png`)

## Try it in 2 minutes

1. **Open a client marked "Needs follow-up":** click **Rohan Mehta** on the dashboard. He marked a Gujarati community as a *deal-breaker*, but also wrote *"community is not that important to me, values matter more"*. The AI caught the clash.
2. **Resolve a follow-up:** in the side panel, click **Mark resolved** on that question, add a note (e.g. *"Values matter more; open to other communities"*), then use **Update the related preference** to edit or move it. Watch the **client log**.
3. **Create a new portfolio from sample 2:** click **New portfolio** → **Use a sample form** → **Sample 2 · Contradictions** → **Create portfolio and sort with AI**. It catches all three contradictions (Mumbai only vs moving abroad; age 25 to 28 vs 10+ years' experience; vegetarian vs sushi).
4. **Confirm the preferences:** click **Confirm all** on each section, or confirm, edit and move them one by one. The status moves from *Needs follow-up* to *Ready* once the questions are resolved.

Also worth a look: **View the standard form** (on New portfolio), **Sample 4** (a client marked non-smoking as only "Nice to have" but wrote "absolutely no smokers"), and **Sample 5** (not the standard form, so it shows a warning). **Reset demo data** in the footer puts everything back.

## Assumptions

- **Every intake form is TDC's standard intake form, version `tdc-intake-v1`.** Every client answers the same questions, in the same order. The template lives in one place: [`lib/intake-form.ts`](lib/intake-form.ts).
  - **Why:** consistency between matchmakers. With one standard form, Matchmaker A and Matchmaker B always capture the same details, and every portfolio has the same shape. That directly targets the 35% of rejections for preferences the client had already given.
  - Sections 1 to 12 map one-to-one to the 12 preference categories (age and height, marital status, location, religion and community, language, education, profession and income, family, lifestyle, children, values and personality, other).
- **The client decides what's a deal-breaker, not the AI.** Every preference question has an importance mark chosen by the client:
  - Deal-breaker → deal-breaker
  - Nice to have → soft rule
  - Doesn't matter → not added
  - "Is there anything that's a definite no?" → deal-breakers. Other free text and "Anything to add?" notes → soft rules.
  - The AI never overrides the client's mark. When the wording disagrees with the mark, it raises a follow-up question instead.
- **If a file isn't the standard form**, the portfolio shows a warning ("This doesn't look like TDC's standard intake form. Results may be incomplete.") and sorts what it can.
- **Only the matchmaker's side is built.** Sending the form to the client and the client filling it in happen outside the app.
- **One matchmaker's dashboard.** The app is Matchmaker A's view (set in [`lib/matchmakers.ts`](lib/matchmakers.ts)), standing in for a real login. Matchmaker B's clients exist in the data but aren't shown.

## What's mocked, and what would change in production

| Prototype | Production |
|---|---|
| **Demo data only.** The 5 sample forms return pre-sorted results from [`data/sample-results`](data/sample-results); your own uploads show a "demo data only" message. | **Live AI sorting.** The server route [`app/api/sort-intake/route.ts`](app/api/sort-intake/route.ts) sends the form to Claude (API key kept on the server), with structured output checked against the same schema ([`lib/sort-schema.ts`](lib/sort-schema.ts)) and a retry if it doesn't match. |
| Data saved in the browser (`localStorage`, plus IndexedDB for files), through one module: [`lib/store.ts`](lib/store.ts). | A **Supabase** database and file storage. Only `lib/store.ts` and `lib/form-files.ts` would change; the screens stay the same. |
| No logins; the app is Matchmaker A's dashboard. | **Logins** for matchmakers, with each one seeing their own clients (and team leads seeing everyone). |
| The matchmaker uploads the filled form by hand. | **Email intake:** the standard form is sent to the client as a link, and answers arrive in the portfolio automatically. |
| The portfolio is reviewed, but nothing checks the profiles that get shared. | A **pre-send profile check:** before a profile is emailed, it's compared against the client's deal-breakers, and the matchmaker is warned about any clash. |
| 8 made-up clients and 5 sample forms. | Real client portfolios. |

## Run it locally

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000. **No environment variables or API keys are needed:** the prototype runs entirely on demo data.

## Demo data and scripts

All names and details are made up.

- [`data/intakes.ts`](data/intakes.ts): every client's filled standard form (8 mock clients and 5 samples), plus what the AI adds when sorting it (free-text preferences, summary, follow-ups).
- `npm run build:demo-data`: regenerates the form files in `public/mock-forms` and `public/sample-forms` (including the PDFs) and the demo results in `data/sample-results`.
- `npm run check:data`: checks every source quote appears word for word in its form, and every demo result matches the expected format.

## Built with

Next.js (App Router, TypeScript), Tailwind CSS, shadcn/ui, zod, idb-keyval and pdf-lib. Fonts: Fraunces and Inter. The look takes its feel from The Date Crew's site; the logo is a text-only stand-in.

*Prototype for The Date Crew Product Growth assessment · mock data only.*
