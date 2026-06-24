# CALYR Logo Interaction Preparation

## Scope
Prepare files and architecture for an interactive particle logo in the black logo area, without implementing Three.js behavior yet.

## Imported Source
- SVG source copied from Desktop to `web/public/logo/CALYR_logo_base.svg`

## Prepared Files
- `web/public/logo/CALYR_logo_base.svg`
- `web/src/data/logo/logo.json`
- `web/src/components/logo/logo-animation.jsx`
- `web/src/components/logo/logo-qr.jsx`

## State Plan
1. idle
2. active (hover)
3. qr_build (click)
4. qr_show (10s)
5. dissolve
6. entropy (~80s inactivity)
7. reassemble (pointer return)

## Next Implementation Steps
1. Add `three`, `@react-three/fiber`, `@react-three/drei`, and `qrcode` dependencies.
2. Build a particle system with deterministic seed and two target maps: ring and QR.
3. Implement state machine transitions from `logo.json`.
4. Add hover and click interaction boundaries in the logo container only.
5. Add QR readability guard (minimum module size, contrast check).
6. Add mobile fallback: static SVG plus tap-to-show QR overlay.
7. Replace current logo element renderer for node id `logo` with `LogoAnimation`.

## Acceptance Checklist
- [ ] Idle ring stable and subtle motion
- [ ] Hover visibly energizes particles
- [ ] Click morphs to readable QR in under 1.5s
- [ ] QR remains visible for 10s
- [ ] Dissolve animation runs smoothly
- [ ] After 80s inactivity, entropy drift starts
- [ ] Pointer return reconstructs ring and wordmark
- [ ] Animation remains smooth on mobile and desktop
