# CFA Level I 2027 Study Tracker

A static, GitHub Pages-ready website based on the CFA Level I study workbook for the **26 February 2027** exam.

## What is included

- Dashboard with countdown, planned/actual hours, questions, accuracy, and completion KPIs
- Daily check-in form
- Full 150-day daily study plan
- Topic plan in the requested order:
  1. Fixed Income
  2. Alternative Investments
  3. Derivatives
  4. Portfolio Construction
  5. Corporate Finance
  6. Financial Statement Analysis
  7. Economics
  8. Equities
  9. Ethics
  10. Quantitative Methods
- Weekly rollups
- Cumulative hours chart
- 2027 CFA course links
- Light/dark theme
- JSON backup export/import

## Important data note

This is a **static website**. Progress is saved in the browser using `localStorage`.

That means:
- it persists when you reopen the site on the same browser/device;
- it does **not** automatically sync across phones/laptops;
- clearing browser storage can erase it.

Use **Export backup** regularly. To sync across devices later, you can add a backend such as Supabase/Firebase, or commit an exported JSON file manually.

## Deploy to GitHub Pages

### Option 1 — repository root

1. Create a new GitHub repository, for example `cfa-level1-tracker`.
2. Upload all files in this folder to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select:
   - Branch: `main`
   - Folder: `/ (root)`
6. Save.
7. GitHub will show the public Pages URL once deployment finishes.

### Option 2 — command line

```bash
git init
git add .
git commit -m "Initial CFA Level I study tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cfa-level1-tracker.git
git push -u origin main
```

Then enable GitHub Pages under **Settings → Pages**.

## Customize the plan

All schedule data is in `app.js` near the top:
- `firstPass`
- `otherBlocks`
- `plannedHoursByWeekday`

The UI styling is in `styles.css`.

No build step and no npm dependencies are required.
