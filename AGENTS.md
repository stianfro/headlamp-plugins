# AGENTS.md

Guidance for coding agents working in this repository (github.com/stianfro/headlamp-plugins).

## Scope and layout
This repo holds Headlamp plugins, one per top-level directory. The active plugin is `kubevirt/`,
a KubeVirt operations view built on the `@kinvolk/headlamp-plugin` SDK (>= 0.13.1). Plugins are
client-side only: they register UI through `register*` functions and reach Kubernetes through
Headlamp's API proxy. There is no backend.

## Non-goals
- Do not add a create or edit UI. Object changes go through Headlamp's built-in YAML editor.
- Do not implement graphical VNC yet. Serial console only.
- Do not publish to Artifact Hub.
- Do not add external CSS frameworks. Use Headlamp's MUI theme and Iconify icon names.

## Module boundaries
- `src/index.tsx`, `src/typedefs.ts`, `src/lib/*`, `src/resources/*`, and `src/components/*` are the
  shared foundation. Change them only when a shared concern requires it.
- Each `src/modules/<area>/` directory is owned by one unit of work. When implementing a resource
  module, edit only that directory. Do not modify another module's files or `index.tsx`.
- Register functions are wired in `index.tsx` from the start. A module implements its own
  `register.tsx` body rather than editing the aggregator.

## Commands
- Install: `just install`
- Type check: `just tsc`
- Lint: `just lint` or `just lint-fix`
- Test: `just test`
- Build: `just build`
- Package a tarball: `just package`
- Validate YAML: `just yaml`
- Full local check: `just ci`

## Pre-change checks
Run type checks, lint, and tests before returning any change. Add or update Storybook stories for new
or changed components, including loading, error, and empty states. Keep changes focused.

## Kubernetes and cluster safety
- Treat the KubeVirt subresource API as documented in the plugin spec. Verbs are PUT for lifecycle
  and pause or freeze actions, GET for guest info and consoles, under `/apis/subresources.kubevirt.io/v1`.
- Never run any command against a real cluster, read or write, without explicit per-command approval
  from the operator. Do not point tooling at a live cluster on your own initiative.

## Writing conventions
- No em dashes in prose, comments, docs, or commit messages. Use commas, periods, colons,
  semicolons, or parentheses.
- Avoid filler and LLM-tell vocabulary. Write plainly.
- Do not begin sentences with "Additionally".

## PR expectations
- Include screenshots for any UI change.
- Keep each PR focused on one module or concern.
- Do not bump major dependency versions without approval.
