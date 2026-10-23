# Serverless or always-on copies

- **Slug:** `serverless-vs-cluster-cost`
- **Export:** `serverlessVsClusterCost` in `data.ts`
- **Course:** AI Engineering Interview, chapter 10.4 "Deployment: serverless or Kubernetes".
- **Teaching claim:** Serverless is cheaper at low traffic and always-on copies (a container service or a fixed cluster) at high traffic; the crossover depends on how long each request runs and on the function's memory.
- **Renderer:** slider (`renderers/slider/`).

## Model

All prices are the chapter's own example prices, labelled as examples in the intro, the limits and the chapter. They are not any provider's prices.

Inputs: questions a day (1,000 to 150,000, step 1,000, default 2,000), seconds per question (1 to 30, step 1, default 4), function memory (0.5 to 4 GB, step 0.5, default 1).

`dailyCost` in `data.ts`:

- serverless a day = questions x seconds x 0.0001 dollars per GB-second x memory
- average questions in progress = questions x seconds / 86,400
- copies for the peak = ceil(5 x average / 20), at least 1 (busy hour at 5 times the average, 20 questions at once per async copy)
- copies = that number, plus 1 spare once it is 2 or more (so one copy can fail)
- containers a day = copies x 1.20 dollars (0.05 an hour)
- break-even = 1.20 / (seconds x 0.0001 x memory) questions a day; the test checks this always falls where one copy is enough

Worked values:

| Inputs | Serverless | Copies | Containers | Cheaper |
|---|---|---|---|---|
| 2,000, 4 s, 1 GB (default) | 0.80 | 1 | 1.20 | Serverless by 0.40 |
| 3,000, 4 s, 1 GB | 1.20 | 1 | 1.20 | Same |
| 100,000, 4 s, 1 GB | 40.00 | 3 | 3.60 | Containers by 36.40 |
| 2,000, 8 s, 1 GB | 1.60 | 1 | 1.20 | Containers by 0.40 |

The first and third rows are the chapter's numbers (0.80 against 1.20; 40 against 3.60 with 3 copies). The break-even at the default is 3,000 questions a day.

Stats: serverless a day, containers a day (with copies), cheaper option with the gap and the break-even. Bars: serverless and container service; the cheaper one has the good tone.

## Copy blocks

- **What this shows:** daily cost of the same workload billed per second of running against always-on copies, at the example prices.
- **Try this:** (1) 100,000 questions: serverless 40.00, containers 3 copies 3.60. (2) back to 2,000 and 8 s per question: serverless 1.60, containers cheaper, break-even falls from 3,000 to 1,500.
- **What changed:** `describeCostChange` says how each cost moved and why (billed seconds, copies needed) and whether the cheaper option flipped.
- **Limits:** example prices; a fixed busy-hour factor and spare rule; no free tiers, request fees, network, cold starts or people's time.

The chapter turns its old cold start predict into a short prose paragraph (one predict per chapter) and puts a new cost predict (100,000 questions a day: which is cheaper?) right before the canvas. A transfer MCQ follows the worked 100,000 question example.

## QA

Tests in `frontend/tests/unit/canvas/serverless-vs-cluster-cost.test.ts`: defaults, the chapter's 100,000 case, minimum, maximum, the tie at break-even, the one-copy check for the break-even formula, and two `describeChange` sentences. Check keyboard use, the live region, phone width and dark mode in `/workspace/canvases`.
