---
name: authenticated-web-search
description: Extend ordinary AI web research with logged-in Chromium sources. Use after public-web search is insufficient, stale, inaccessible, repetitive, or lacks first-hand experience; when a task needs current discussion, reviews, platform-native content, logged-in AI search, account-backend reading, or browser interaction; and when multiple browsers or accounts require explicit routing. Do not use when public sources are sufficient or for native desktop apps.
---

# 登录态网页检索

Search the public web first. When the evidence is insufficient, use the installed BrowserSkill as the browser executor and select the smallest useful logged-in source. Use this Skill as the adequacy, channel-routing, privacy, troubleshooting, and acceptance layer. Do not copy credentials or browser data into the Skill.

## Route the task

1. Use a public-web reader for an ordinary public URL that does not require login.
2. For ordinary research, search the public web once and assess whether the result supports the answer. Read `references/research-routing.md`.
3. If public results are insufficient or the task needs reviews, current platform discussion, first-hand experience, or login-only content, choose one or two logged-in channels that can fill the stated gap.
4. Use this Skill directly for an account backend, existing-session page, or user-requested browser interaction.
5. Use a desktop-control tool for a native application.
6. Respect a user-named browser tool when it is available and authorized.

## Load local boundaries

1. Read `references/research-routing.md` and state what the public search failed to provide, unless the user directly requested a logged-in destination.
2. Read `references/browser-profile.md` before selecting a browser or account.
3. Read `references/site-matrix.md` before operating on a recorded site.
4. Treat blank or placeholder fields as unverified. Inspect current browser state instead of inventing a preference.
5. Replace obsolete matrix conclusions when current visible evidence differs; do not append contradictory history indefinitely.

## Execute safely

1. Load the currently installed upstream `browser-skill` instructions and obey its latest session lifecycle and safety rules.
2. Run `bsk browsers --json` before starting a session. Prefer one enabled BrowserSkill extension at a time. When multiple instances remain online, explicitly select the target browser; never reuse a historical instance ID.
3. Prefer a new Agent tab. Borrow a user tab only when the new tab lacks the required login or page context.
4. When borrowing, select the minimum necessary target tab. Do not inspect unrelated tabs, history, messages, drafts, saved items, account settings, or previous conversations.
5. Take a snapshot before interaction. After navigation, lazy loading, or page changes, take a fresh snapshot before using element references.
6. Perform only the minimum search, click, pagination, and reading needed to fill the stated information gap.
7. Stop before publishing, sending, deleting, paying, uploading, liking, commenting, following, changing an account, or submitting a state-changing form. Obtain explicit confirmation for the exact action.
8. Verify the visible business result. Distinguish page visibility, input, submission, generated response, source availability, and final task completion.
9. Stop the BrowserSkill session on every success, failure, timeout, or user interruption. Confirm that no active session remains when the task ends.

## Report evidence by layer

1. Separate official or original sources, user experience, current platform discussion, and AI-search leads.
2. Treat platform posts as experience or leads, not proof of regulated, medical, legal, financial, or price claims.
3. Treat answers from logged-in AI search pages as query expansion and source discovery. Trace material claims to original links when possible.
4. State whether the first public-web pass was sufficient, why logged-in research was added, which channels were skipped, and why the search stopped.

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
