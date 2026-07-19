---
name: authenticated-browser-workbench
description: Reuse an existing logged-in Chromium browser safely for site search, account-backend reading, AI web research, and browser interaction. Use when a task depends on the user's current browser login state, when multiple browsers or accounts require explicit routing, or when maintaining a personal matrix of verified sites and failure experience. Do not use for public URLs that can be read without login or for native desktop apps.
---

# Authenticated Browser Workbench

Use the installed BrowserSkill as the browser executor. Use this Skill as the personal routing, privacy, troubleshooting, and acceptance layer. Do not copy credentials or browser data into the Skill.

## Route the task

1. Use a public-web reader for an ordinary public URL that does not require login.
2. Use this Skill for a logged-in site search, account backend, existing-session page, or browser interaction.
3. Use a desktop-control tool for a native application.
4. Respect a user-named browser tool when it is available and authorized.

## Load local boundaries

1. Read `references/browser-profile.md` before selecting a browser or account.
2. Read `references/site-matrix.md` before operating on a recorded site.
3. Treat blank or placeholder fields as unverified. Inspect current browser state instead of inventing a preference.
4. Replace obsolete matrix conclusions when current visible evidence differs; do not append contradictory history indefinitely.

## Execute safely

1. Load the currently installed upstream `browser-skill` instructions and obey its latest session lifecycle and safety rules.
2. Run `bsk browsers --json` before starting a session. Prefer one enabled BrowserSkill extension at a time. When multiple instances remain online, explicitly select the target browser; never reuse a historical instance ID.
3. Prefer a new Agent tab. Borrow a user tab only when the new tab lacks the required login or page context.
4. When borrowing, select the minimum necessary target tab. Do not inspect unrelated tabs, history, messages, drafts, saved items, account settings, or previous conversations.
5. Take a snapshot before interaction. After navigation, lazy loading, or page changes, take a fresh snapshot before using element references.
6. Perform only the minimum search, click, pagination, and reading needed for the task.
7. Stop before publishing, sending, deleting, paying, uploading, liking, commenting, following, changing an account, or submitting a state-changing form. Obtain explicit confirmation for the exact action.
8. Verify the visible business result. Distinguish page visibility, input, submission, generated response, source availability, and final task completion.
9. Stop the BrowserSkill session on every success, failure, timeout, or user interruption. Confirm that no active session remains when the task ends.

## Handle failures

Read `references/troubleshooting.md` and apply one bounded recovery path:

1. Wait briefly and take a fresh snapshot.
2. Re-locate current visible controls instead of reusing stale selectors.
3. Borrow an already logged-in target tab only when a new Agent tab is insufficient.
4. Use narrowly scoped page scripting only when standard interaction failed and the target action is visible and unambiguous.
5. Stop after one repair and one re-test for the same non-core failure. Record the limitation and use a safer alternative route.

Do not loop on captchas, anti-automation checks, long generation states, screenshots, or reconnect attempts merely to report success.

## Report evidence

State:

- which browser and site were used;
- whether existing login state or a borrowed tab was used;
- what visible evidence confirmed the business result;
- what failed, timed out, or remained unverified;
- whether a confirmation boundary was reached;
- whether the session was stopped.

For multiple sites, group results as successful, limited, failed, and untested. Do not convert a login success into a search success or a submitted prompt into a reliable answer.

## Maintain the workbench

- Update `references/browser-profile.md` when browser purpose or account boundaries change.
- Update `references/site-matrix.md` after a representative task proves or disproves a route.
- Add only stable, reusable recovery rules to `references/troubleshooting.md`.
- Use `references/customization-checklist.md` when adapting this template to a new person or machine.
- Use `scripts/Test-BrowserSkillConnectionStability.ps1` only for Windows connection diagnostics. It observes connection cycles and does not modify the extension.
- Keep credentials, cookies, tokens, verification codes, account identifiers, private page content, temporary instance IDs, and local absolute paths out of all Skill files.
