# Calyr Interface Contract

Use this contract when building a user-facing Calyr interface in a stringent manner.

## Principle

- `Calyr` names the application surface exposed to a user.
- `Nexus` remains the runtime, orchestration, and semantic layer underneath.
- interface copy, identity, and rationale should not be scattered across HTML and JavaScript.

## Source-of-truth pattern

For each Calyr interface, keep three layers explicit:

| Layer | Purpose | Format |
| --- | --- | --- |
| interface registry | identity, labels, rationale, UI copy | YAML |
| interface notes | method, operating rules, release scope | Markdown |
| runtime implementation | behavior, events, data loading | HTML/JS/Python |

## Minimal contract

Each interface should have:

- one YAML entry with stable `id`
- one short rationale that explains why the page is branded `Calyr`
- one Markdown page that explains scope and operation
- one runtime page that reads interface copy from generated data instead of hard-coded strings

## Current starter example

- interface registry: `apps/homepage/data/interfaces.yaml`
- generated artifact: `apps/homepage/data/interfaces.js`
- runtime page: `apps/homepage/matomic_lab.html`
- runtime logic: `apps/homepage/js/matomic_lab.js`

## Why this matters

This keeps the application surface stringent:

- wording is versioned in one place
- renaming does not require manual string hunting
- public naming and internal runtime naming stay separated
- future interfaces can reuse one contract instead of becoming one-off pages