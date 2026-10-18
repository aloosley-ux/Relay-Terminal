# Relay Terminal 5.1.1 — Appearance scope handoff

Relay Terminal 5.1.1 fixes target selection when editing workspace appearance from a session that has its own override.

- The Quick Appearance editor and full Studio load the selected scope's saved palette.
- Session overrides continue to take precedence over workspace appearance. The Studio explains when a session masks a workspace edit.
- Removing the session override returns that session to the saved workspace appearance.
- All Relay 5.1.0 Appearance Studio functionality and existing appearance data remain supported.

See [TEST-REPORT-5.1.1.md](TEST-REPORT-5.1.1.md) for validation and release limitations.
