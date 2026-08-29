# PostHog Self-driving Setup Report

_Generated 2026-08-29 for project `openarena` (PostHog project 583596) — second run (re-run)_

## Summary

PostHog Self-driving has been configured for the LLM Arena project. This was a re-run: all signal sources, products, GitHub, and Replay Vision scanners were already in place from the first run. The main change in this run is two new custom scouts — `arena-request-health` and `arena-engagement` — which were approved and created (both had been declined in the first run). Findings will start appearing in your [Self-driving inbox](https://us.posthog.com/project/583596/inbox) within ~30 minutes.

---

## AI data processing

**Approved.** Organization-level AI data processing consent was granted before this run started.

---

## GitHub

**Already connected** from the first run. Integration id `258528`, connected as `imnotdeepak`. Self-driving can research findings against the repository and open fix PRs.

---

## Products enabled

| Product                 | Result              | Notes                                                                                                                                          |
| ----------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Session Replay          | **Already enabled** | Server toggle ON. `posthog.init` uses `defaults: "2026-01-30"` which enables recording; no `disable_session_recording` override found — clean. |
| Error Tracking          | **Already enabled** | Server toggle ON. `posthog.init` has `capture_exceptions: true` — client already opts in.                                                      |
| Support (Conversations) | **Already enabled** | Server toggle ON. Tickets only arrive once an inbound channel (email / inbox / Slack) is connected in PostHog — see Follow-ups.                |

`posthog.init` override check was clean: no client-side flags cancel either the session replay or error tracking enables.

---

## Signal sources

| Source product   | Source type                | Action              | Notes                                                                                     |
| ---------------- | -------------------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `signals_scout`  | `cross_source_issue`       | **On by default**   | Scout gate — ON by default, no config row needed.                                         |
| `health_checks`  | `health_issue`             | **Already enabled** | id `01a04c24-a851-7e1b-ad18-4c6a7d4f30a9`                                                 |
| `error_tracking` | `issue_created`            | **Already enabled** | id `01a04c24-aa52-743b-9627-be2a693df794`                                                 |
| `error_tracking` | `issue_reopened`           | **Already enabled** | id `01a04c24-af18-7af8-ae67-4e32052c511f`                                                 |
| `error_tracking` | `issue_spiking`            | **Already enabled** | id `01a04c24-b1bc-7801-8c6c-e47cbc0e62f2`                                                 |
| `session_replay` | `session_analysis_cluster` | **Already enabled** | id `01a04c24-b489-7f67-bc55-d8e05e05d8fa` — server-applied default `sample_rate: 0.1`     |
| `conversations`  | `ticket`                   | **Already enabled** | id `01a04c24-b6c8-7525-8287-67129179b2c6` — dormant until an inbound channel is connected |
| `llm_analytics`  | —                          | **Skipped**         | Internal-only, not a user-facing responder                                                |
| `logs`           | —                          | **Skipped**         | Not a v1 responder                                                                        |
| `replay_vision`  | —                          | **Skipped**         | Self-authorizing via `emits_signals` on each scanner (see Replay Vision section)          |

---

## Connected tools

The user selected **None of these** — no external issue trackers, support desks, or other connected tools were added. All are available later from [Integrations settings](https://us.posthog.com/project/583596/settings/environment-integrations).

---

## Scout troop

**Budget:** 100 runs/day max (early access default); 3 runs/tick max; 3 runs used today; 97 remaining.  
_Banner: "Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more."_

### Enabled (7)

| Scout                                | What it watches                                                                                                                                                                                                                                                                                    |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signals-scout-general`              | Cross-product correlations and surfaces no specialist covers                                                                                                                                                                                                                                       |
| `signals-scout-ai-observability`     | LLM traces for cost, latency, error, and volume regressions — the product's core surface                                                                                                                                                                                                           |
| `signals-scout-health-checks`        | PostHog setup health issues; catches instrumentation gaps early                                                                                                                                                                                                                                    |
| `signals-scout-web-analytics`        | Per-channel session volume, attribution, and landing-page health                                                                                                                                                                                                                                   |
| `signals-scout-web-vitals`           | LCP/INP/CLS/FCP per page, correlated with deploys and flag rollouts                                                                                                                                                                                                                                |
| `signals-scout-arena-request-health` | **Custom — created this run.** Arena invalid request rate spikes (`arena_invalid_request` / `arena_message_sent` ratio). Discriminator: ratio > 15% in 24h vs 7-day baseline, spanning more than one user. Not covered by built-ins: error tracking watches exceptions (5xx), not handled 400s.    |
| `signals-scout-arena-engagement`     | **Custom — created this run.** Arena prompt submission volume drops (`arena_message_sent` count vs rolling 7-day average). Discriminator: count 40%+ below average over 12h+ with stable session volume. Not covered by built-ins: web-analytics watches sessions/pages, not product-action rates. |

### Disabled (22)

| Scout                              | Reason                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `signals-scout-error-tracking`     | **Intentional** — covered by the native error_tracking source (step 4); a scout here would duplicate it |
| `signals-scout-session-replay`     | **Intentional** — covered by the native session_replay source (step 4); a scout here would duplicate it |
| `signals-scout-product-analytics`  | No saved funnels/retention/lifecycle insights yet — re-enable once those are built                      |
| `signals-scout-feature-flags`      | No feature flags in active use — re-enable when flags are added                                         |
| `signals-scout-experiments`        | No A/B experiments running — re-enable when experiments start                                           |
| `signals-scout-surveys`            | No surveys configured — re-enable if surveys are added                                                  |
| `signals-scout-revenue-analytics`  | No payment SDK or revenue data — re-enable if a payment surface is added                                |
| `signals-scout-logs`               | PostHog logs product usage not confirmed — re-enable if logs are ingested                               |
| `signals-scout-csp-violations`     | No CSP reporting configured — re-enable if CSP is set up                                                |
| `signals-scout-customer-analytics` | No group/accounts analytics — re-enable if B2B account tracking is added                                |
| `signals-scout-data-pipelines`     | No CDP destinations or hog flows configured                                                             |
| `signals-scout-data-warehouse`     | No data warehouse imports configured                                                                    |
| `signals-scout-replay-vision`      | Reads trends across accumulated observations — re-enable once the scanners (step 6c) have data          |
| `signals-scout-anomaly-detection`  | Kept off to leave room under the ten-scout ceiling                                                      |
| `signals-scout-observability-gaps` | Kept off; health-checks scout covers setup gaps                                                         |
| `signals-scout-inbox-validation`   | Not useful on a setup with no resolved reports yet                                                      |
| `signals-scout-conversations`      | Conversations product just enabled; no ticket data yet                                                  |
| `signals-scout-apm`                | No distributed tracing / OpenTelemetry spans configured                                                 |
| `signals-scout-insight-alerts`     | No configured insight alerts yet                                                                        |
| `signals-scout-mcp-tool-calls`     | No `$mcp_tool_call` telemetry captured                                                                  |
| `signals-scout-skills-store`       | Skill hygiene not a current priority                                                                    |
| `signals-scout-tasks`              | No PostHog Tasks in use                                                                                 |

---

## Custom scouts

**Proposed: 2. Created: 2 (both approved).**

### Surfaces created

| Scout                                | Surface                                                                                     | Discriminator                                                                                     | Why no built-in covers it                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `signals-scout-arena-request-health` | Arena invalid request rate spike — `arena_invalid_request` vs `arena_message_sent` ratio    | Invalid rate > 15% of total in 24h window vs 7-day baseline, spanning more than one distinct user | Error tracking watches exceptions (5xx), not handled 400s; web-analytics watches sessions, not API error ratios         |
| `signals-scout-arena-engagement`     | Arena prompt submission volume drop — `arena_message_sent` count per 24h vs rolling average | Count falls 40%+ below rolling average over 12h+ with session volume stable                       | Web-analytics watches sessions/pages, not product-action rates; a traffic-holds/prompts-drop pattern is invisible to it |

### Surfaces considered and ruled out

| Surface                                    | Filter that killed it                                                                        |
| ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Core arena funnel (prompt → answer → vote) | Not watchable — vote and answer events not yet instrumented (scope.md feature 6 not started) |
| LLM model traces per-model error rate      | Not watchable — `@posthog/ai` `withTracing()` not yet wired; no `$ai_*` events exist         |
| Model availability / OpenRouter health     | Covered by native error tracking source (server exceptions)                                  |
| Web analytics / web vitals                 | Covered by enabled built-in scouts                                                           |

**Noise escape hatch:** if any custom scout turns noisy, set `emit: false` on its config in PostHog to switch it to dry-run without disabling it.

---

## Replay Vision scanners

Replay Vision scanners are LLMs that watch individual session recordings on a schedule and push what they find directly into the Self-driving inbox. They see what events can't: blank screens, broken layouts, silent failures, rage-click patterns. Findings arrive at half weight — two corroborating findings from different sessions are needed before a report is promoted into the inbox. This is the only part of this setup that spends Replay Vision quota.

Both scanners were created in the first run and passed the re-run test — they were left in place unchanged.

**No recordings exist yet** — both scanners are armed and start working automatically the day recordings begin.

| Scanner                   | What it watches                                                                                                            | Query scope                                  | Sampling rate | Est. monthly credits  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------- | --------------------- |
| **Arena prompt failures** | Visible product breakage: error messages, blank response cards, spinners that never resolve, submit actions with no output | Sessions visiting `/arena` (URL `icontains`) | 0.5           | 0 (no recordings yet) |
| **Arena rage clicks**     | User frustration: hammering submit, clicking stuck response cards, repeated vote attempts, prompt retries with no output   | Sessions with a `$rageclick` event           | 1.0           | 0 (no recordings yet) |

Both scanners: `emits_signals: true`, model `gemini-3-flash-preview`. Queries are disjoint (breakage monitor owns the `/arena` URL axis; frustration monitor owns the `$rageclick` event axis) so one defect can't corroborate itself.

---

## Follow-ups

- [ ] **Connect a Conversations inbound channel** — the Support product is enabled, but the `conversations / ticket` source stays dormant until you connect email, inbox, or Slack in PostHog Settings → Support.
- [ ] **Wire `@posthog/ai` with `withTracing()`** — scope.md (feature 6) plans this for the OpenRouter/Vercel AI SDK provider. Once done, the `signals-scout-ai-observability` scout will have LLM trace data to watch. Without it, the scout has nothing to read.
- [ ] **Revisit custom scouts as the product matures** — once vote events, answer completion events, and the arena funnel are instrumented (scope.md features 5–6), a funnel scout becomes viable.
- [ ] **Enable `signals-scout-product-analytics`** once saved funnel/retention insights exist.
- [ ] **Enable `signals-scout-feature-flags`** when feature flags are in active use.
- [ ] **Enable `signals-scout-replay-vision`** once the Replay Vision scanners have accumulated enough observations to show trends (a few weeks of recording data).

---

## What happens next

The scout coordinator picks up fresh configs within ~30 minutes — first runs will fire then. Each scout run draws from the project's 100-runs-per-day early-access budget. Findings cluster into reports in the inbox; immediately-actionable ones can start coding tasks automatically. Check your inbox: https://us.posthog.com/project/583596/inbox
