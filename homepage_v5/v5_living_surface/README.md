# CALYR V5 Living Surface Starter

This folder is a staged implementation starter for the CALYR material engine.

## Stages in this starter

- Stage 1: Mondrian layout from YAML (`tiles.layout.yaml`)
- Stage 2: WebGL canvas inside every tile
- Stage 3: Plane geometry subdivisions (`100 x 100`)
- Stage 4: Vertex + fragment shader wave + iridescence
- Stage 6: Mouse field deformation
- Stage 7: Fresnel-like edge lighting
- Stage 9: Semantic material parameters per tile (stiffness, roughness, palette)

Not yet implemented:

- Stage 5: Micro tile `InstancedMesh` field
- Stage 8: Click impulse texture simulation

## Run

From `apps/homepage/`:

```bash
./nexus.homepage-v5-open 8020
```

Open:

- http://localhost:8020/homepage_v5/v5_living_surface/index.html

## Notes

- This is intentionally isolated from the current canonical homepage build.
- It is a development sandbox for V5 material-engine iteration.
