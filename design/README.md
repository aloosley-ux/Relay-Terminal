# Relay design sources

Current approved designs are in [current/](current/README.md). Historical experiments are in [archive/](archive/README.md). Editable design files document intended visuals; the shipped app, release notes and tests document runtime behaviour.

## Current and approved

- [Appearance Studio for Relay 5.1](current/appearance-studio-5.1/README.md) — approved 23-page editable FigCraft reference, preview/source vectors, implementation handoff and feature matrix.
- [Switchline identity](current/switchline-identity/README.md) — approved VectorCraft brand source, FigCraft board and icon review evidence.

## Historical and unapproved

- [Earlier Appearance Studio explorations](archive/appearance-early-concepts/FIRST-REVIEW.md) — early concept boards, architecture studies, previews and generator.
- [Relay 5 exploratory design](archive/relay5-concepts/README.md) — unapproved Night Gallery product direction, PhotoCraft/VectorCraft/EffectCraft experiments, and retired icon studies.

## Runtime assets and build evidence

Do not move src-tauri/icons/, public/wallpapers/, docs/media/, or docs/design/ just to tidy design files: these are used by packaging, the running application, documentation or historical evidence. Build/ and artifacts/ are ignored generated binaries, screenshots and tests and are outside this cleanup. The old C:\AI\REA\Experiments\Relay-Terminal path is only a junction to this same repository.

The archive is not a production design system. Do not adopt archived icons, tokens or concepts without new approval.
