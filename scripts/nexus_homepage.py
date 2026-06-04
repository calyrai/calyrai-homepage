#!/usr/bin/env python3

from __future__ import annotations

import argparse
import datetime as dt
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

import yaml


DEFAULT_V4_ROOT = "homepage_v4"
REQUIRED_FILES = [
    "homepage.yaml",
    "content/homepage.md",
    "atlas/atlas.yaml",
    "runtime/gsap.profile.yaml",
    "arte/manifest.ts",
    "README.md",
    "TODO.md",
]


def _now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def _repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def _write_if_missing(path: Path, content: str, force: bool = False) -> None:
    if path.exists() and not force:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def _default_homepage_yaml() -> str:
    data = {
        "meta": {
            "version": "v4",
            "page_title": "Calyr.ai - Homepage v4",
            "tagline": "Markdown truth, Atlas meaning, YAML curation",
        },
        "migration_policy": {
            "preserve_structure_from_v3": False,
            "strategy": "canonical-v4",
            "reset_from_scratch": False,
            "arte_scope": {
                "landing_page_only": True,
                "interior_pages": False,
            },
            "rollout": {
                "phase_1_mobile_cellphone": "arte",
                "phase_2_desktop": "progressive",
            },
            "ui_goal": "keep-current-ui-and-converge-to-arte",
        },
        "flagship_objects": [
            {"id": "spr", "title": "SPR Structural Evaluation", "type": "publication", "category": "Biophysics", "color": "#00E5FF"},
            {"id": "saxs", "title": "Real/Fourier Space SAXS", "type": "publication", "category": "Structural Biology", "color": "#FFD400"},
            {"id": "cryoem-saxs", "title": "Hybrid Structural Biology", "type": "publication", "category": "Integrative Biology", "color": "#FF4DF5"},
            {"id": "redhuman", "title": "RedHuman", "type": "project", "category": "Flagship Project", "color": "#FF5555"},
            {"id": "alphafold", "title": "AlphaFold", "type": "engine", "category": "Engine", "color": "#8A63FF"},
            {"id": "lidar", "title": "LiDAR", "type": "engine", "category": "Engine", "color": "#3CD278"},
            {"id": "asc-surrogate", "title": "ASC Surrogate Modelling", "type": "engine", "category": "Engine", "color": "#3C82FF"},
        ],
        "arte_mobile_theme": {
            "enabled": True,
            "accent": "#8ef4ff",
            "secondary": "#ff4df5",
        },
        "curation": {
            "profile": "default",
            "tiles": [
                {
                    "id": "theory",
                    "source": "content/homepage.md#theory",
                    "atlas_node": "theory",
                    "render": "tile.theory",
                },
                {
                    "id": "contact",
                    "source": "content/homepage.md#contact",
                    "atlas_node": "contact",
                    "render": "tile.contact",
                },
            ],
        },
        "output": {
            "index_html": "output/index.html",
        },
    }
    return yaml.safe_dump(data, sort_keys=False, allow_unicode=True)


def _default_markdown() -> str:
    return """# Homepage v4 Truth

## theory
Calyr.ai uses semantic knowledge architecture to make molecular intelligence operational.

## contact
Contact interaction can be curated as a playable tile and embedded in homepage layouts.
"""


def _default_atlas_yaml() -> str:
    data = {
        "nodes": [
            {
                "id": "theory",
                "label": "Theory",
                "meaning": "Knowledge architecture and semantic operating model",
                "links": ["contact"],
            },
            {
                "id": "contact",
                "label": "Contact",
                "meaning": "Playable contact surface and communication endpoint",
                "links": ["theory"],
            },
        ]
    }
    return yaml.safe_dump(data, sort_keys=False, allow_unicode=True)


def _default_gsap_profile() -> str:
    data = {
        "behavior": {
            "engine": "gsap",
            "profile": "default",
            "transitions": {
                "tile_open": {"duration": 0.32, "ease": "power2.out"},
                "tile_close": {"duration": 0.24, "ease": "power2.inOut"},
            },
        }
    }
    return yaml.safe_dump(data, sort_keys=False, allow_unicode=True)


def _default_arte_manifest() -> str:
    return """// v4 rendering entrypoints (placeholder)
// Markdown = truth
// Atlas = meaning
// homepage.yaml = curation
// Arte.ts = rendering

export type ArteTileRenderer = "tile.theory" | "tile.contact";

export const arteManifest = {
  version: "v4",
  renderers: ["tile.theory", "tile.contact"] as ArteTileRenderer[],
};
"""


def _default_readme() -> str:
    return """# Homepage v4

This directory is the v4 homepage workspace.

Architecture:
- Markdown = truth
- Atlas = meaning
- homepage.yaml = curation
- Arte.ts = rendering
- GSAP = behavior

Use the CLI:
- python3 scripts/nexus_homepage.py create
- python3 scripts/nexus_homepage.py validate
- python3 scripts/nexus_homepage.py build
- python3 scripts/build_unified_v4.py
"""


def _default_todo() -> str:
    return """# v4 TODO

1. Keep v4 as the canonical build target.
2. Keep v3 as archived snapshot source only.
3. Build adapters: markdown + atlas + curation -> render model.
4. Integrate Arte.ts renderer contracts.
5. Wire GSAP behavior profiles.
6. Wire flagship objects into projection/render pipeline.
7. Add tests and validation gates.
"""


def _copy_from_v3(repo_root: Path, v4_root: Path, force: bool) -> list[str]:
    copied: list[str] = []
    v3_root = repo_root / "homepage_v3"
    mapping = [
        (v3_root / "homepage.yaml", v4_root / "homepage.v3.snapshot.yaml"),
        (v3_root / "system.yaml", v4_root / "content" / "system.v3.snapshot.yaml"),
        (v3_root / "system.md", v4_root / "content" / "system.v3.snapshot.md"),
    ]
    for src, dest in mapping:
        if not src.exists():
            continue
        if dest.exists() and not force:
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(src.read_text(encoding="utf-8"), encoding="utf-8")
        copied.append(str(dest.relative_to(repo_root)))
    return copied


def cmd_create(args: argparse.Namespace) -> int:
    repo_root = _repo_root()
    v4_root = repo_root / args.root
    v4_root.mkdir(parents=True, exist_ok=True)

    for rel in ("content", "atlas", "arte", "runtime", "output"):
        (v4_root / rel).mkdir(parents=True, exist_ok=True)

    _write_if_missing(v4_root / "homepage.yaml", _default_homepage_yaml(), args.force)
    _write_if_missing(v4_root / "content" / "homepage.md", _default_markdown(), args.force)
    _write_if_missing(v4_root / "atlas" / "atlas.yaml", _default_atlas_yaml(), args.force)
    _write_if_missing(v4_root / "runtime" / "gsap.profile.yaml", _default_gsap_profile(), args.force)
    _write_if_missing(v4_root / "arte" / "manifest.ts", _default_arte_manifest(), args.force)
    _write_if_missing(v4_root / "README.md", _default_readme(), args.force)
    _write_if_missing(v4_root / "TODO.md", _default_todo(), args.force)

    copied: list[str] = []
    if args.from_v3:
        copied = _copy_from_v3(repo_root, v4_root, args.force)

    summary = {
        "created": str(v4_root.relative_to(repo_root)),
        "from_v3": bool(args.from_v3),
        "copied": copied,
        "timestamp": _now_iso(),
    }
    print(json.dumps(summary, indent=2))
    return 0


def _load_yaml(path: Path) -> dict[str, Any]:
    raw: Any = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    if not isinstance(raw, dict):
        raise ValueError(f"Expected mapping in {path}")
    return dict(raw)


def cmd_validate(args: argparse.Namespace) -> int:
    repo_root = _repo_root()
    v4_root = repo_root / args.root
    missing: list[str] = []
    for rel in REQUIRED_FILES:
        if not (v4_root / rel).exists():
            missing.append(rel)

    issues: list[str] = []
    if missing:
        issues.append(f"Missing required files: {', '.join(missing)}")
    else:
        try:
            homepage = _load_yaml(v4_root / "homepage.yaml")
            atlas = _load_yaml(v4_root / "atlas" / "atlas.yaml")
            gsap = _load_yaml(v4_root / "runtime" / "gsap.profile.yaml")

            if "curation" not in homepage:
                issues.append("homepage.yaml: missing 'curation' section")
            if "nodes" not in atlas:
                issues.append("atlas/atlas.yaml: missing 'nodes' section")
            if "behavior" not in gsap:
                issues.append("runtime/gsap.profile.yaml: missing 'behavior' section")
        except Exception as exc:
            issues.append(str(exc))

    report = {
        "root": str(v4_root.relative_to(repo_root)),
        "ok": len(issues) == 0,
        "issues": issues,
        "timestamp": _now_iso(),
    }
    print(json.dumps(report, indent=2))
    return 0 if not issues else 1


def _extract_sections(markdown_text: str) -> list[dict[str, str]]:
    lines = markdown_text.splitlines()
    sections: list[dict[str, str]] = []
    current_title = ""
    current_body: list[str] = []

    def flush() -> None:
        nonlocal current_title, current_body
        if not current_title:
            return
        body = "\n".join(current_body).strip()
        sections.append({"title": current_title, "body": body})
        current_body = []

    for line in lines:
        if line.startswith("## "):
            flush()
            current_title = line[3:].strip()
            continue
        current_body.append(line)
    flush()
    return sections


def _render_v4_index(homepage: dict[str, Any], sections: list[dict[str, str]]) -> str:
    meta = homepage.get("meta", {}) if isinstance(homepage.get("meta"), dict) else {}
    title = str(meta.get("page_title", "Homepage v4")).strip() or "Homepage v4"
    tagline = str(meta.get("tagline", "")).strip()
    hero_cfg = homepage.get("hero", {}) if isinstance(homepage.get("hero"), dict) else {}
    hero_subtitle = str(hero_cfg.get("subtitle", "")).strip()
    home_link = str(hero_cfg.get("home_link", "../../index.html")).strip() or "../../index.html"
    lead_text = hero_subtitle or tagline
    arte_theme = homepage.get("arte_mobile_theme", {}) if isinstance(homepage.get("arte_mobile_theme"), dict) else {}
    arte_enabled = bool(arte_theme.get("enabled", False))
    arte_accent = str(arte_theme.get("accent", "#8ef4ff")).strip() or "#8ef4ff"
    arte_secondary = str(arte_theme.get("secondary", "#ff4df5")).strip() or "#ff4df5"

    section_map: dict[str, str] = {}
    for section in sections:
        key = str(section.get("title", "")).strip().lower()
        if key:
            section_map[key] = str(section.get("body", "")).strip()

    section_map_json = json.dumps(section_map, ensure_ascii=False)
    tagline_html = f"<p class=\"detail-hero-lead\">{lead_text}</p>" if lead_text else ""
    flagship_objects_raw = homepage.get("flagship_objects", [])
    flagship_objects = flagship_objects_raw if isinstance(flagship_objects_raw, list) else []
    flagship_objects_json = json.dumps(flagship_objects, ensure_ascii=False)
    body_class = "arte-mobile-theme" if arte_enabled else ""
    arte_mobile_css = ""
    if arte_enabled:
        arte_mobile_css = f"""
    @media (max-width: 820px) {{
      body.arte-mobile-theme {{
        background:
          radial-gradient(circle at 50% -8%, color-mix(in srgb, {arte_accent} 24%, transparent), transparent 44%),
          linear-gradient(180deg, #050816 0%, #020611 100%);
      }}
      .detail-page {{ width: min(1320px, calc(100vw - 24px)); }}
      .detail-shell {{ grid-template-columns: 1fr; gap: 18px; }}
      .detail-index {{ position: static; }}
      .detail-sections {{ gap: 12px; }}
      .detail-section {{
        border-color: color-mix(in srgb, {arte_accent} 68%, white 20%);
        box-shadow: inset 0 0 0 1px rgba(142, 244, 255, 0.12), 0 10px 22px rgba(2, 8, 18, 0.45);
        background: rgba(6, 17, 26, 0.9);
      }}
      .detail-section h2 {{ color: {arte_secondary}; }}
    }}
"""

    return f"""<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>{title}</title>
  <style>
        :root {{
            color-scheme: dark;
            --bg: #06070b;
            --ink: #f5f7fa;
            --muted: rgba(245, 247, 250, 0.62);
            --line: rgba(245, 247, 250, 0.18);
            --line-strong: rgba(245, 247, 250, 0.34);
            --focus-tint: rgba(102, 184, 255, 0.14);
            --page-width: min(1320px, calc(100vw - 56px));
            --sans: "Avenir Next", Avenir, "Helvetica Neue", Helvetica, sans-serif;
        }}
        * {{ box-sizing: border-box; }}
        html {{ scroll-behavior: smooth; }}
        body {{ margin: 0; background: linear-gradient(180deg, #0e1017 0%, var(--bg) 46%, #030406 100%); color: var(--ink); font-family: var(--sans); }}
        a {{ color: var(--ink); }}
        .detail-page {{ width: var(--page-width); margin: 0 auto; padding: 26px 0 84px; }}
        .detail-topbar {{ display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0 0 20px; border-bottom: 1px solid var(--line); text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.7rem; }}
        .detail-home-link {{ display: inline-flex; align-items: center; gap: 0.65rem; text-decoration: none; }}
        .detail-home-link::before {{ content: ""; width: 34px; height: 1px; background: currentColor; }}
        .detail-shell {{ display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 36px; padding-top: 26px; }}
        .detail-index {{ position: sticky; top: 20px; align-self: start; padding: 20px 18px 22px; border: 1px solid var(--line); background: rgba(10, 12, 18, 0.72); }}
        .detail-index-title {{ margin: 0 0 16px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.16em; font-size: 0.66rem; }}
        .detail-index-links {{ display: grid; gap: 10px; margin-bottom: 16px; }}
        .detail-index-link {{ text-decoration: none; color: var(--ink); font-size: 0.93rem; opacity: 0.56; }}
        .detail-index-link:hover, .detail-index-link.is-active {{ opacity: 1; }}
        .projection-select {{ width: 100%; margin-top: 6px; border: 1px solid var(--line-strong); background: rgba(16,19,28,0.8); color: var(--ink); padding: 8px; border-radius: 8px; }}
        .detail-main {{ min-width: 0; }}
        .detail-hero {{ display: grid; gap: 16px; padding-bottom: 28px; border-bottom: 1px solid var(--line); }}
        .detail-kicker {{ margin: 0; color: var(--muted); text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.7rem; }}
        .detail-title {{ margin: 0; max-width: 14ch; font-size: clamp(2.3rem, 5vw, 4.6rem); line-height: 0.98; letter-spacing: -0.02em; font-weight: 400; }}
        .detail-hero-lead {{ margin: 0; max-width: 72ch; color: var(--ink); font-size: clamp(1rem, 1.4vw, 1.12rem); line-height: 1.45; }}
        .detail-sections {{ display: grid; gap: 0; margin-top: 12px; }}
        .detail-section {{ display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 18px; align-content: start; padding: 24px 0; border-bottom: 1px solid var(--line); background: color-mix(in srgb, var(--focus-tint) 0%, transparent); }}
        .detail-section-meta {{ color: var(--muted); font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; padding-top: 8px; }}
        .detail-section-body h2 {{ margin: 0 0 12px; font-size: clamp(1.16rem, 1.8vw, 1.5rem); font-weight: 400; line-height: 1.1; }}
        .detail-section-body p {{ margin: 0; line-height: 1.45; }}
        .principle-stack {{ white-space: pre-line; font-family: "SF Mono", "Fira Code", ui-monospace, monospace; color: #8ef4ff; line-height: 1.5; margin-top: 10px; }}
        .demo {{ display: grid; gap: 12px; grid-template-columns: 1fr 1.2fr; }}
        .demo-card {{ border: 1px solid var(--line); border-radius: 10px; padding: 10px; background: rgba(6, 17, 26, 0.5); }}
        .demo pre {{ margin: 0; overflow: auto; max-height: 360px; font-size: 12px; line-height: 1.35; color: #e8f7ff; }}
        .oo-cards {{ display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-top: 12px; }}
        .oo-card {{ border: 1px dashed rgba(191, 248, 255, 0.35); border-radius: 10px; padding: 10px; }}
        @media (max-width: 980px) {{
            .detail-page {{ width: min(1320px, calc(100vw - 24px)); }}
            .detail-shell {{ grid-template-columns: 1fr; gap: 18px; }}
            .detail-index {{ position: static; }}
            .demo {{ grid-template-columns: 1fr; }}
        }}
{arte_mobile_css}  </style>
</head>
<body class=\"{body_class}\">
    <main class="detail-page">
        <header class="detail-topbar">
            <a class="detail-home-link" href="{home_link}">Calyr.aí</a>
            <span>Object-Oriented Production Engine</span>
        </header>
        <div class="detail-shell">
            <aside class="detail-index">
                <p class="detail-index-title">Index</p>
                <nav class="detail-index-links" id="index-links"></nav>
                <label class="detail-index-title" for="projection-mode">Projection</label>
                <select id="projection-mode" class="projection-select">
                    <option value="article">Article</option>
                    <option value="arte">Arte</option>
                    <option value="atlas">Atlas</option>
                    <option value="mondrian">Mondrian</option>
                    <option value="workspace">Workspace</option>
                </select>
            </aside>
            <section class="detail-main">
                <section class="detail-hero">
                    <p class="detail-kicker">CALYR.AI</p>
                    <h1 class="detail-title">One Text. Many Projections.</h1>
                    {tagline_html}
                </section>
                <section id="app" class="detail-sections"></section>
            </section>
        </div>
    </main>
    <script>
        const SECTION_BODIES = {section_map_json};
        const FLAGSHIP_OBJECTS = {flagship_objects_json};

        class CalyrObject {{
            constructor(id, title, body) {{
                this.id = id;
                this.title = title;
                this.body = body;
                this.relations = [];
                this.projections = [];
            }}
            relate(type, target, label) {{
                this.relations.push({{ type, target, label }});
                return this;
            }}
            useProjection(projection) {{
                this.projections.push(projection);
                return this;
            }}
        }}

        class TextObject extends CalyrObject {{
            constructor(id, title, markdown, semanticType = "concept") {{
                super(id, title, markdown);
                this.markdown = markdown;
                this.semanticType = semanticType;
            }}
        }}

        class SectionObject extends CalyrObject {{
            constructor(id, title, layout, body) {{
                super(id, title, body);
                this.layout = layout;
                this.children = [];
            }}
            add(child) {{
                this.children.push(child);
                return this;
            }}
        }}

        class PageObject extends CalyrObject {{
            constructor(id, title, body) {{
                super(id, title, body);
                this.sections = [];
            }}
            add(section) {{
                this.sections.push(section);
                return this;
            }}
        }}

        class Experience extends PageObject {{
            constructor(id, title, body, mode = "experience") {{
                super(id, title, body);
                this.mode = mode;
            }}
        }}

        class Projection {{
            constructor(name) {{
                this.name = name;
            }}
            project(_object) {{
                throw new Error("Projection.project must be implemented");
            }}
        }}

        class ArteProjection extends Projection {{
            constructor() {{ super("arte"); }}
            project(object) {{
                return {{
                    type: "scene-sequence",
                    title: object.title,
                    scenes: [{{ focus: object.title, narration: object.body, motion: "slow-zoom" }}],
                }};
            }}
        }}

        class AtlasProjection extends Projection {{
            constructor() {{ super("atlas"); }}
            project(object) {{
                return {{
                    type: "graph",
                    title: object.title,
                    nodes: [object.id, ...object.relations.map((r) => r.target)],
                    edges: object.relations,
                }};
            }}
        }}

        class ArticleProjection extends Projection {{
            constructor() {{ super("article"); }}
            project(object) {{
                return {{ type: "article", title: object.title, body: object.body }};
            }}
        }}

        class MondrianProjection extends Projection {{
            constructor() {{ super("mondrian"); }}
            project(object) {{
                return {{
                    type: "grid-composition",
                    title: object.title,
                    panels: [
                        {{ label: "focus", value: object.title }},
                        {{ label: "body", value: object.body || "" }},
                        {{ label: "relations", value: String(object.relations.length) }},
                    ],
                }};
            }}
        }}

        class WorkspaceProjection extends Projection {{
            constructor() {{ super("workspace"); }}
            project(object) {{
                return {{
                    type: "workflow",
                    title: object.title,
                    modules: ["tasks", "modules", "scientific-workflows", ...object.relations.map((r) => r.target)],
                }};
            }}
        }}

        class HtmlRenderer {{
            render(result, index, layout = "scene") {{
                const section = document.createElement("article");
                section.className = "detail-section";
                section.id = `section-${{index + 1}}`;
                section.dataset.type = result.type;
                section.dataset.layout = layout;
                const body = result.body ? `<p>${{result.body}}</p>` : "";
                section.innerHTML = `
                  <div class="detail-section-meta">${{String(index + 1).padStart(2, "0")}}</div>
                  <div class="detail-section-body"><h2>${{result.title}}</h2>${{body}}</div>
                `;
                return section;
            }}
        }}

        class CalyrHomepage extends Experience {{
            constructor() {{
                super("calyr-homepage", "CALYR.AI", "Text becomes object. Objects become projections.", "homepage-experience");
                this.heroScene = new SectionObject("hero", "One Text. Many Projections.", "hero", SECTION_BODIES.hero || "");
                this.principleScene = new SectionObject("principle", "TEXT -> OBJECT -> PROJECTION -> EXPERIENCE", "scene", SECTION_BODIES.principle || "");
                this.projectionDemo = new SectionObject("demo", "Live Projection Demo", "split", SECTION_BODIES["live-projection-demo"] || "");
                this.objectOrientedSection = new SectionObject("oo", "Object-Oriented Production", "grid", SECTION_BODIES["object-oriented-production"] || "");
                this.arteInterface = new SectionObject("arte", "Arte Interface", "timeline", SECTION_BODIES["arte-interface"] || "");
                this.atlasInterface = new SectionObject("atlas", "Atlas Interface", "timeline", SECTION_BODIES["atlas-interface"] || "");
                this.workspaceInterface = new SectionObject("workspace", "Workspace Interface", "timeline", SECTION_BODIES["workspace-interface"] || "");
                this.footerScene = new SectionObject("footer", "CALYR.AI", "scene", SECTION_BODIES["engine-rule"] || "");

                this
                    .add(this.heroScene)
                    .add(this.principleScene)
                    .add(this.projectionDemo)
                    .add(this.objectOrientedSection)
                    .add(this.arteInterface)
                    .add(this.atlasInterface)
                    .add(this.workspaceInterface)
                    .add(this.footerScene);
            }}
        }}

        function buildHomepageProgram() {{
            const homepage = new CalyrHomepage();
            const sourceText = new TextObject("nexus-source", "Nexus", "Nexus separates text, models and projections.", "concept");
            sourceText
                .relate("projects-to", "article")
                .relate("projects-to", "arte")
                .relate("projects-to", "atlas")
                .relate("projects-to", "mondrian")
                .relate("projects-to", "workspace")
                .useProjection(new ArticleProjection())
                .useProjection(new ArteProjection())
                .useProjection(new AtlasProjection())
                .useProjection(new MondrianProjection())
                .useProjection(new WorkspaceProjection());
            return {{ homepage, sourceText }};
        }}

                function renderProjectionDemo(sourceText, mode, index) {{
                        const wrapper = document.createElement("article");
                        wrapper.className = "detail-section";
                        wrapper.id = `section-${{index + 1}}`;
                        wrapper.dataset.type = "projection-demo";
                        wrapper.innerHTML = `
                            <div class="detail-section-meta">${{String(index + 1).padStart(2, "0")}}</div>
                            <div class="detail-section-body">
                                <h2>Live Projection Demo</h2>
                                <div class="demo">
                                    <article class="demo-card"><h3># Nexus</h3><p>${{sourceText.markdown}}</p></article>
                                    <article class="demo-card"><pre id="projection-output"></pre></article>
                                </div>
                            </div>
                        `;
                        const projection = sourceText.projections.find((p) => p.name === mode) || sourceText.projections[0];
                        const output = wrapper.querySelector("#projection-output");
                        if (output && projection) {{
                            output.textContent = JSON.stringify(projection.project(sourceText), null, 2);
                        }}
                        return wrapper;
                }}

        function renderObjectCards() {{
            const wrap = document.createElement("div");
            wrap.className = "oo-cards";
            const fallback = ["TextObject", "SceneObject", "ProjectionObject", "RendererObject", "ExperienceObject"];
            const cards = FLAGSHIP_OBJECTS.length ? FLAGSHIP_OBJECTS : fallback.map((label) => ({{ title: label, color: "#8ef4ff", category: "Object" }}));
            cards.forEach((item) => {{
                const card = document.createElement("article");
                card.className = "oo-card";
                card.style.borderLeft = `5px solid ${{item.color || "#8ef4ff"}}`;
                card.innerHTML = `<strong>${{item.title || "Object"}}</strong><br><span style="opacity:0.8">${{item.category || item.type || "Scientific Object"}}</span>`;
                wrap.appendChild(card);
            }});
            return wrap;
        }}

        function renderHomepage(mode = "article") {{
            const app = document.getElementById("app");
            const indexLinks = document.getElementById("index-links");
            app.innerHTML = "";
            indexLinks.innerHTML = "";

            const renderer = new HtmlRenderer();
            const {{ homepage, sourceText }} = buildHomepageProgram();

            const projectSection = (section) => {{
              const source = new TextObject(section.id, section.title, section.body || "", "story");
              source.relations = section.relations;
              let projection = new ArticleProjection();
              if (mode === "arte") projection = new ArteProjection();
              if (mode === "atlas") projection = new AtlasProjection();
              if (mode === "mondrian") projection = new MondrianProjection();
              if (mode === "workspace") projection = new WorkspaceProjection();
              const result = projection.project(source);
              if (!result.body && result.scenes) result.body = (result.scenes[0] && result.scenes[0].narration) || "";
              if (!result.body && result.modules) result.body = `modules: ${{result.modules.join(", ")}}`;
              if (!result.body && result.nodes) result.body = `nodes: ${{result.nodes.join(", ")}}`;
              if (!result.body && result.panels) result.body = result.panels.map((p) => `${{p.label}}=${{p.value}}`).join(" | ");
              return result;
            }};

            homepage.sections.forEach((section, index) => {{
                const nav = document.createElement("a");
                nav.className = "detail-index-link";
                nav.href = `#section-${{index + 1}}`;
                nav.textContent = section.title;
                indexLinks.appendChild(nav);

                if (section.id === "demo") {{
                    app.appendChild(renderProjectionDemo(sourceText, mode, index));
                    return;
                }}

                const view = renderer.render(projectSection(section), index, section.layout);
                if (section.id === "hero") {{
                    const body = view.querySelector(".detail-section-body");
                    if (body) body.innerHTML = `<h2>Scientific Objects for Molecular Intelligence</h2><p>Concept first, then objects, then projections.</p><p><strong>Enter the Engine</strong></p>`;
                }}
                if (section.id === "principle") {{
                    const stack = document.createElement("div");
                    stack.className = "principle-stack";
                    stack.textContent = "TEXT\\n  ->\\nOBJECT\\n  ->\\nPROJECTION\\n  ->\\nEXPERIENCE";
                    view.appendChild(stack);
                }}
                if (section.id === "oo") {{
                    view.appendChild(renderObjectCards());
                }}
                app.appendChild(view);
            }});

            const active = indexLinks.querySelector(`a[href=\"#section-1\"]`);
            if (active) active.classList.add("is-active");

            const sectionNodes = [...app.querySelectorAll(".detail-section")];
            const observer = new IntersectionObserver((entries) => {{
              entries.forEach((entry) => {{
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                [...indexLinks.querySelectorAll("a")].forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${{id}}`));
              }});
            }}, {{ rootMargin: "-40% 0px -45% 0px", threshold: 0.1 }});
            sectionNodes.forEach((node) => observer.observe(node));
        }}

        const modeSelect = document.getElementById("projection-mode");
        renderHomepage(modeSelect.value);
        modeSelect.addEventListener("change", () => renderHomepage(modeSelect.value));
    </script>
</body>
</html>
"""


def cmd_build(args: argparse.Namespace) -> int:
    repo_root = _repo_root()
    v4_root = repo_root / args.root

    validate_args = argparse.Namespace(root=args.root)
    validate_exit = cmd_validate(validate_args)
    if validate_exit != 0:
        return validate_exit

    homepage = _load_yaml(v4_root / "homepage.yaml")
    markdown_text = (v4_root / "content" / "homepage.md").read_text(encoding="utf-8")
    sections = _extract_sections(markdown_text)

    out_rel = "output/index.html"
    output_cfg = homepage.get("output", {}) if isinstance(homepage.get("output"), dict) else {}
    out_rel = str(output_cfg.get("index_html", out_rel)).strip() or out_rel
    out_path = v4_root / out_rel
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(_render_v4_index(homepage, sections), encoding="utf-8")

    report = {
        "root": str(v4_root.relative_to(repo_root)),
        "output": str(out_path.relative_to(repo_root)),
        "with_v3": "archived",
        "timestamp": _now_iso(),
    }
    print(json.dumps(report, indent=2))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="nexus.homepage",
        description="Homepage orchestration CLI for v4 migration.",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    p_create = subparsers.add_parser("create", help="Create v4 homepage workspace skeleton.")
    p_create.add_argument("--root", default=DEFAULT_V4_ROOT, help="v4 root directory relative to apps/homepage")
    p_create.add_argument("--from-v3", action="store_true", help="Copy selected v3 source snapshots into v4")
    p_create.add_argument("--force", action="store_true", help="Overwrite scaffold files if they already exist")
    p_create.set_defaults(func=cmd_create)

    p_validate = subparsers.add_parser("validate", help="Validate required v4 files and schema basics.")
    p_validate.add_argument("--root", default=DEFAULT_V4_ROOT, help="v4 root directory relative to apps/homepage")
    p_validate.set_defaults(func=cmd_validate)

    p_build = subparsers.add_parser("build", help="Build canonical v4 output.")
    p_build.add_argument("--root", default=DEFAULT_V4_ROOT, help="v4 root directory relative to apps/homepage")
    p_build.set_defaults(func=cmd_build)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
