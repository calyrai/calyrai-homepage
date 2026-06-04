// v4 rendering entrypoints (placeholder)
// Markdown = truth
// Atlas = meaning
// homepage.yaml = curation
// Arte.ts = rendering

export type ArteTileRenderer = "tile.theory" | "tile.contact";

export const arteManifest = {
  version: "v4",
  renderers: ["tile.theory", "tile.contact"] as ArteTileRenderer[],
};
