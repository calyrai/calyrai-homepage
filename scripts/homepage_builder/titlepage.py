from __future__ import annotations

import html
import json
import re
from typing import Any

from .content import as_dict, as_list_of_dict


def _build_grid_hover_script(grid_cfg: dict[str, Any] | None = None) -> str:
	config_json = json.dumps(grid_cfg or {}, ensure_ascii=True)
	return """<script>
(() => {
	const grid = document.querySelector('.layout-grid');
	if (!grid) return;
	const CFG = """ + config_json + """;
	const cfgNum = (key, fallback) => {
		const value = Number(CFG[key]);
		return Number.isFinite(value) ? value : fallback;
	};
	const cfgStr = (key, fallback) => {
		const value = CFG[key];
		return typeof value === 'string' && value.length ? value : fallback;
	};

	const ensureDots = () => {
		let dots = Array.from(grid.querySelectorAll('circle'));
		if (dots.length) return dots;

		const spacing = cfgNum('grid_spacing_px', 30);
		const majorStep = Math.max(1, Math.floor(cfgNum('grid_major_step', 4)));
		const width = window.innerWidth;
		const height = window.innerHeight;
		grid.setAttribute('viewBox', `0 0 ${width} ${height}`);
		grid.setAttribute('preserveAspectRatio', 'none');
		grid.querySelectorAll('.grid-labels').forEach((node) => node.remove());

		const frag = document.createDocumentFragment();
		const labelsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		labelsLayer.setAttribute('class', 'grid-labels');
		labelsLayer.setAttribute('fill', cfgStr('label_color', '#24f3ff'));
		labelsLayer.setAttribute('opacity', '1');
		labelsLayer.setAttribute('font-size', String(cfgNum('label_font_px', 6)));
		labelsLayer.setAttribute('font-family', 'system-ui, -apple-system, Segoe UI, sans-serif');
		labelsLayer.setAttribute('font-weight', '500');

		const toAlpha = (index) => {
			let value = index + 1;
			let out = '';
			while (value > 0) {
				const rem = (value - 1) % 26;
				out = String.fromCharCode(65 + rem) + out;
				value = Math.floor((value - 1) / 26);
			}
			return out;
		};
		let row = 0;
		for (let y = spacing * 0.5; y < height; y += spacing, row += 1) {
			let col = 0;
			for (let x = spacing * 0.5; x < width; x += spacing, col += 1) {
				const major = row % majorStep === 0 && col % majorStep === 0;
				const pt = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				pt.setAttribute('cx', String(x));
				pt.setAttribute('cy', String(y));
				pt.setAttribute('data-major', major ? '1' : '0');
				frag.appendChild(pt);
				if (major) {
					const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
					const majorCol = Math.floor(col / majorStep);
					const majorRow = Math.floor(row / majorStep) + 1;
					label.textContent = `${toAlpha(majorCol)}${majorRow}`;
					label.setAttribute('x', String(x + 5));
					label.setAttribute('y', String(y - 5));
					label.setAttribute('data-cx', String(x));
					label.setAttribute('data-cy', String(y));
					label.setAttribute('data-major-label', '1');
					label.setAttribute('style', 'paint-order:stroke;stroke:rgba(1,10,32,0.75);stroke-width:0.8;opacity:0;transition:opacity 120ms linear;');
					labelsLayer.appendChild(label);
				}
			}
		}
		grid.appendChild(frag);
		grid.appendChild(labelsLayer);
		return Array.from(grid.querySelectorAll('circle'));
	};

	const BASE_R_MAJOR = cfgNum('grid_base_r_major', 1.25);
	const BASE_R_MINOR = cfgNum('grid_base_r_minor', 0.42);
	const MAX_R_MAJOR = cfgNum('grid_max_r_major', 6.2);
	const MAX_R_MINOR = cfgNum('grid_max_r_minor', 1.9);
	const HOVER_R = cfgNum('grid_hover_radius_px', 88);
	const BASE_OP_MAJOR = cfgNum('grid_base_op_major', 0.62);
	const BASE_OP_MINOR = cfgNum('grid_base_op_minor', 0.16);
	const MAX_OP_MAJOR = cfgNum('grid_max_op_major', 0.96);
	const MAX_OP_MINOR = cfgNum('grid_max_op_minor', 0.34);
	const LABEL_HOVER_R = cfgNum('label_hover_radius_px', 22);
	const LABEL_REVEAL_MS = cfgNum('label_reveal_ms', 2000);
	const LABEL_VISIBLE_OPACITY = cfgNum('label_visible_opacity', 0.72);
	const LABEL_MODE = cfgStr('label_mode', 'hover').toLowerCase();
	const RING_DURATION_MS = cfgNum('ring_duration_ms', 2600);
	const RING_STROKE = cfgNum('ring_stroke_px', 1.4);
	const ACUTE_FALL_MS = cfgNum('acute_fall_ms', 980);
	const MAJOR_CLICK_SNAP_PX = cfgNum('major_click_snap_px', 14);
	const ACUTE_GLOW = cfgStr('acute_glow', 'drop-shadow(0 0 8px rgba(255,255,255,0.95)) drop-shadow(0 0 16px rgba(255,255,255,0.8)) drop-shadow(0 0 28px rgba(255,255,255,0.5))');

	let dots = ensureDots().map((pt) => {
		const major = pt.getAttribute('data-major') === '1';
		pt.setAttribute('fill', '#ffffff');
		pt.setAttribute('r', String(major ? BASE_R_MAJOR : BASE_R_MINOR));
		pt.setAttribute('opacity', String(major ? BASE_OP_MAJOR : BASE_OP_MINOR));
		pt.setAttribute('style', major
			? 'filter:drop-shadow(0 0 1.2px rgba(255,255,255,0.95)) drop-shadow(0 0 4px rgba(255,255,255,0.58));'
			: 'filter:drop-shadow(0 0 0.8px rgba(255,255,255,0.48));');
		return {
			pt,
			major,
			cx: parseFloat(pt.getAttribute('cx') || '0'),
			cy: parseFloat(pt.getAttribute('cy') || '0')
		};
	});

	let labels = Array.from(grid.querySelectorAll('.grid-labels text')).map((node) => ({
		node,
		cx: parseFloat(node.getAttribute('data-cx') || '0'),
		cy: parseFloat(node.getAttribute('data-cy') || '0'),
		hoverSince: null,
	}));
	const dotByNode = new Map(dots.map((d) => [d.pt, d]));
	const activeAcuteDots = new Set();
	let waves = [];

	const ensureFxLayers = () => {
		let ringsLayer = grid.querySelector('.grid-rings');
		if (!ringsLayer) {
			ringsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			ringsLayer.setAttribute('class', 'grid-rings');
			ringsLayer.setAttribute('fill', 'none');
			grid.appendChild(ringsLayer);
		}
		let acutesLayer = grid.querySelector('.grid-acutes');
		if (!acutesLayer) {
			acutesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			acutesLayer.setAttribute('class', 'grid-acutes');
			grid.appendChild(acutesLayer);
		}
		return { ringsLayer, acutesLayer };
	};

	const spawnRingWave = (x, y) => {
		const { ringsLayer } = ensureFxLayers();
		const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		ring.setAttribute('cx', String(x));
		ring.setAttribute('cy', String(y));
		ring.setAttribute('r', '2');
		ring.setAttribute('stroke', 'rgba(255, 255, 255, 0.9)');
		ring.setAttribute('stroke-width', String(RING_STROKE));
		ring.setAttribute('opacity', '0.85');
		ringsLayer.appendChild(ring);
		waves.push({
			node: ring,
			start: performance.now(),
			duration: RING_DURATION_MS,
			maxR: Math.hypot(window.innerWidth, window.innerHeight) * 0.58,
		});
		requestRender();
	};

	const transformMajorDotToAcute = (dot) => {
		if (!dot || !dot.major) return;
		if (activeAcuteDots.has(dot.pt)) return;
		activeAcuteDots.add(dot.pt);
		dot.pt.setAttribute('r', '0.01');
		dot.pt.setAttribute('opacity', '0');
		dot.pt.setAttribute('fill', 'transparent');
		dot.pt.style.pointerEvents = 'none';

		const { acutesLayer } = ensureFxLayers();
		const acute = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		acute.textContent = '\\u00B4';
		acute.setAttribute('x', String(dot.cx));
		acute.setAttribute('y', String(dot.cy));
		acute.setAttribute('text-anchor', 'middle');
		acute.setAttribute('dominant-baseline', 'central');
		acute.setAttribute('fill', '#ffffff');
		acute.setAttribute('font-size', '26');
		acute.setAttribute('font-family', 'Avenir Next, Segoe UI, sans-serif');
		acute.setAttribute('font-weight', '700');
		acute.setAttribute('style', `filter:${ACUTE_GLOW};pointer-events:none;`);
		acutesLayer.appendChild(acute);
		acute.animate(
			[
				{ transform: 'translate(0, -14px) scale(1.06)', opacity: 0 },
				{ transform: 'translate(0, 0px) scale(1)', opacity: 1, offset: 0.38 },
				{ transform: 'translate(0, 8px) scale(0.74)', opacity: 0 },
			],
			{
				duration: ACUTE_FALL_MS,
				easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
			}
		);

		spawnRingWave(dot.cx, dot.cy);

		window.setTimeout(() => {
			acute.remove();
			dot.pt.style.display = '';
			dot.pt.setAttribute('fill', '#ffffff');
			dot.pt.setAttribute('opacity', String(BASE_OP_MAJOR));
			dot.pt.style.pointerEvents = '';
			activeAcuteDots.delete(dot.pt);
			requestRender();
		}, ACUTE_FALL_MS + 24);
	};

	let mouseX = -1e9;
	let mouseY = -1e9;
	let ticking = false;

	function render() {
		ticking = false;
		const now = performance.now();
		let needsFollowUp = false;
		for (const d of dots) {
			if (activeAcuteDots.has(d.pt)) continue;
			const dx = mouseX - d.cx;
			const dy = mouseY - d.cy;
			const dist = Math.hypot(dx, dy);
			const t = Math.max(0, 1 - dist / HOVER_R);
			const baseR = d.major ? BASE_R_MAJOR : BASE_R_MINOR;
			const maxR = d.major ? MAX_R_MAJOR : MAX_R_MINOR;
			const baseOp = d.major ? BASE_OP_MAJOR : BASE_OP_MINOR;
			const maxOp = d.major ? MAX_OP_MAJOR : MAX_OP_MINOR;
			const r = baseR + (maxR - baseR) * t;
			const op = baseOp + (maxOp - baseOp) * t;
			d.pt.setAttribute('r', r.toFixed(2));
			d.pt.setAttribute('opacity', op.toFixed(3));
		}

		for (const label of labels) {
			if (LABEL_MODE === 'always') {
				label.node.style.opacity = String(LABEL_VISIBLE_OPACITY);
				label.hoverSince = null;
				continue;
			}
			const dx = mouseX - label.cx;
			const dy = mouseY - label.cy;
			const dist = Math.hypot(dx, dy);
			if (dist <= LABEL_HOVER_R) {
				if (label.hoverSince === null) label.hoverSince = now;
				const visible = now - label.hoverSince >= LABEL_REVEAL_MS;
				label.node.style.opacity = visible ? String(LABEL_VISIBLE_OPACITY) : '0';
				if (!visible) needsFollowUp = true;
			} else {
				label.hoverSince = null;
				label.node.style.opacity = '0';
			}
		}

		if (waves.length) {
			const nextWaves = [];
			for (const wave of waves) {
				const t = (now - wave.start) / wave.duration;
				if (t >= 1) {
					wave.node.remove();
					continue;
				}
				const radius = 2 + wave.maxR * t;
				const opacity = Math.max(0, (1 - t) * 0.82);
				const strokeW = Math.max(0.45, RING_STROKE * (1 - 0.55 * t));
				wave.node.setAttribute('r', radius.toFixed(2));
				wave.node.setAttribute('opacity', opacity.toFixed(3));
				wave.node.setAttribute('stroke-width', strokeW.toFixed(2));
				nextWaves.push(wave);
			}
			waves = nextWaves;
			if (waves.length) needsFollowUp = true;
		}

		if (needsFollowUp) requestRender();
	}

	function requestRender() {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(render);
	}

	window.addEventListener('pointermove', (e) => {
		mouseX = e.clientX;
		mouseY = e.clientY;
		requestRender();
	}, { passive: true });

	window.addEventListener('pointerleave', () => {
		mouseX = -1e9;
		mouseY = -1e9;
		requestRender();
	});

	grid.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof SVGCircleElement)) return;
		if (target.getAttribute('data-major') !== '1') return;
		transformMajorDotToAcute(dotByNode.get(target));
	});

	document.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		if (target.closest('a, button, input, textarea, select, .study-trigger, .corner-menu-toggle, .corner-menu-link')) return;

		let best = null;
		let bestDist = MAJOR_CLICK_SNAP_PX;
		for (const dot of dots) {
			if (!dot.major) continue;
			if (activeAcuteDots.has(dot.pt)) continue;
			const dx = event.clientX - dot.cx;
			const dy = event.clientY - dot.cy;
			const dist = Math.hypot(dx, dy);
			if (dist < bestDist) {
				bestDist = dist;
				best = dot;
			}
		}
		if (!best) return;
		transformMajorDotToAcute(best);
	});

	window.addEventListener('resize', () => {
		grid.querySelectorAll('circle').forEach((node) => node.remove());
		grid.querySelectorAll('.grid-labels, .grid-rings, .grid-acutes').forEach((node) => node.remove());
		dots = ensureDots().map((pt) => ({
			pt,
			major: pt.getAttribute('data-major') === '1',
			cx: parseFloat(pt.getAttribute('cx') || '0'),
			cy: parseFloat(pt.getAttribute('cy') || '0')
		}));
		dotByNode.clear();
		for (const d of dots) dotByNode.set(d.pt, d);
		activeAcuteDots.clear();
		waves = [];
		labels = Array.from(grid.querySelectorAll('.grid-labels text')).map((node) => ({
			node,
			cx: parseFloat(node.getAttribute('data-cx') || '0'),
			cy: parseFloat(node.getAttribute('data-cy') || '0'),
			hoverSince: null,
		}));
		requestRender();
	}, { passive: true });

	render();
})();
</script>"""


def _fallback_glyph_svg(title: str) -> str:
	initial = html.escape((title.strip()[:1] or "G").upper())
	return (
		"<svg class=\"glyph-fallback-svg\" viewBox=\"0 0 100 100\" aria-hidden=\"true\">"
		"<rect x=\"10\" y=\"10\" width=\"80\" height=\"80\" fill=\"none\" stroke=\"rgba(255,255,255,0.85)\" stroke-width=\"2\"/>"
		f"<text x=\"50\" y=\"58\" text-anchor=\"middle\" font-size=\"34\" fill=\"#fff\" font-family=\"Avenir Next, Segoe UI, sans-serif\">{initial}</text>"
		"</svg>"
	)


def _safe_span(value: Any, default: int, minimum: int = 1, maximum: int = 12) -> int:
	try:
		parsed = int(str(value).strip())
	except (TypeError, ValueError):
		return default
	return max(minimum, min(maximum, parsed))


def render_titlepage_html(data: dict[str, Any], font_css_href: str, wordmark_markup: str) -> str:
	_ = wordmark_markup

	def _is_enabled(value: Any) -> bool:
		if isinstance(value, bool):
			return value
		return str(value).strip().lower() in {"1", "true", "yes", "on", "enabled"}

	hero = as_dict(data.get("hero"))
	meta = as_dict(data.get("meta"))
	structure = as_dict(data.get("structure"))
	migration_policy = as_dict(data.get("migration_policy"))
	arte_mobile_theme = as_dict(data.get("arte_mobile_theme"))
	template = str(structure.get("template", "calyr_titlepage_orbit"))
	if template != "calyr_titlepage_orbit":
		template = "calyr_titlepage_orbit"
	hero_class = str(structure.get("hero_class", "hero"))
	hero_copy_class = str(structure.get("hero_copy_class", "hero-copy"))
	hero_kicker_class = str(structure.get("hero_kicker_class", "hero-kicker"))
	hero_title_class = str(structure.get("hero_title_class", "hero-title"))
	hero_subtitle_class = str(structure.get("hero_subtitle_class", "hero-subtitle"))
	nav = as_dict(data.get("nav"))
	nav_top = as_list_of_dict(nav.get("top"))
	cta = as_dict(hero.get("cta"))
	cta_text = str(cta.get("text", "")).strip()
	cta_href = str(cta.get("href", "#")).strip() or "#"
	explore_sections = as_list_of_dict(data.get("explore_sections"))
	preferred_open_index = 0
	for index, section in enumerate(explore_sections, start=1):
		section_tile_kind = str(section.get("tile_kind", "glyph" if index == 1 else "text")).strip().lower()
		if section_tile_kind in {"text", "visit_card"} and bool(section.get("open_by_default", False)):
			preferred_open_index = index
			break
	if preferred_open_index == 0:
		for index, section in enumerate(explore_sections, start=1):
			section_tile_kind = str(section.get("tile_kind", "glyph" if index == 1 else "text")).strip().lower()
			if section_tile_kind in {"text", "visit_card"}:
				preferred_open_index = index
				break

	grid_cfg = {
		"grid_spacing_px": structure.get("grid_spacing_px"),
		"grid_major_step": structure.get("grid_major_step"),
		"grid_base_r_major": structure.get("grid_base_r_major"),
		"grid_base_r_minor": structure.get("grid_base_r_minor"),
		"grid_max_r_major": structure.get("grid_max_r_major"),
		"grid_max_r_minor": structure.get("grid_max_r_minor"),
		"grid_hover_radius_px": structure.get("grid_hover_radius_px"),
		"grid_base_op_major": structure.get("grid_base_op_major"),
		"grid_base_op_minor": structure.get("grid_base_op_minor"),
		"grid_max_op_major": structure.get("grid_max_op_major"),
		"grid_max_op_minor": structure.get("grid_max_op_minor"),
		"label_hover_radius_px": structure.get("label_hover_radius_px"),
		"label_reveal_ms": structure.get("label_reveal_ms"),
		"label_font_px": structure.get("label_font_px"),
		"label_visible_opacity": structure.get("label_visible_opacity"),
		"label_color": structure.get("label_color"),
		"label_mode": structure.get("label_mode"),
	}
	grid_hover_script = _build_grid_hover_script(grid_cfg)

	arte_mobile_enabled = _is_enabled(arte_mobile_theme.get("enabled", False))
	if not arte_mobile_enabled:
		arte_scope = as_dict(migration_policy.get("arte_scope"))
		rollout = as_dict(migration_policy.get("rollout"))
		arte_mobile_enabled = (
			_is_enabled(arte_scope.get("landing_page_only", False))
			and str(rollout.get("phase_1_mobile_cellphone", "")).strip().lower() == "arte"
		)

	arte_accent = str(arte_mobile_theme.get("accent", "#8ef4ff")).strip() or "#8ef4ff"
	arte_secondary = str(arte_mobile_theme.get("secondary", "#ff4df5")).strip() or "#ff4df5"
	arte_mobile_css = ""
	if arte_mobile_enabled:
		arte_mobile_css = f"""
		@media (max-width: 820px) {{
			:root {{
				--frame-width: min(100% - 20px, 1280px);
				--frame-gutter: max(10px, calc((100vw - var(--frame-width)) / 2));
			}}
			body.arte-mobile-theme {{
				background:
					radial-gradient(circle at 50% -8%, color-mix(in srgb, {arte_accent} 24%, transparent), transparent 44%),
					linear-gradient(180deg, #050816 0%, #020611 100%);
			}}
			body.arte-mobile-theme .layout-grid {{ opacity: 0.72; }}
			body.arte-mobile-theme .hero {{ padding: 0.78rem 0 0.24rem; }}
			body.arte-mobile-theme .hero-copy {{
				padding: 14px 14px 12px;
				border-radius: 16px;
				border-color: rgba(142, 244, 255, 0.46);
				background: rgba(6, 17, 26, 0.84);
				box-shadow: 0 0 20px rgba(57, 231, 255, 0.14), inset 0 0 0 1px rgba(57, 231, 255, 0.14);
			}}
			body.arte-mobile-theme .hero-kicker {{ font-size: 0.62rem; letter-spacing: 0.16em; opacity: 0.76; }}
			body.arte-mobile-theme .hero-title {{ font-size: clamp(1.52rem, 8vw, 2.12rem); line-height: 1.05; }}
			body.arte-mobile-theme .hero-subtitle {{ margin-top: 0.62rem; font-size: 0.84rem; line-height: 1.38; opacity: 0.92; }}
			body.arte-mobile-theme .hero-slogan {{ margin-top: 0.64rem; font-size: 0.66rem; letter-spacing: 0.1em; opacity: 0.72; }}
			body.arte-mobile-theme .corner-menu-toggle {{
				top: 14px;
				width: 56px;
				height: 44px;
				border-color: color-mix(in srgb, {arte_accent} 62%, white 20%);
				background: rgba(4, 12, 25, 0.72);
				backdrop-filter: blur(6px);
			}}
			body.arte-mobile-theme .corner-menu-line {{ width: 23px; margin: 5px auto; }}
			body.arte-mobile-theme .corner-menu-panel {{
				top: 62px;
				min-width: min(86vw, 300px);
				padding: 10px;
				border-color: rgba(142, 244, 255, 0.34);
				background: rgba(4, 12, 25, 0.96);
			}}
			body.arte-mobile-theme .corner-menu-link {{ font-size: 0.7rem; letter-spacing: 0.08em; }}
			body.arte-mobile-theme .study-layout {{
				padding: 0.24rem 0 1.2rem;
				max-height: min(78vh, 980px);
			}}
			body.arte-mobile-theme .study-graph-toolbar {{
				position: sticky;
				top: 0;
				z-index: 5;
				gap: 0.5rem;
				padding: 0.46rem 0.56rem;
				border-color: rgba(142, 244, 255, 0.42);
				background: rgba(4, 14, 30, 0.9);
				backdrop-filter: blur(8px);
			}}
			body.arte-mobile-theme .study-graph-label {{ font-size: 0.6rem; letter-spacing: 0.13em; }}
			body.arte-mobile-theme .study-graph-input {{ font-size: 0.8rem; padding: 0.42rem 0.5rem; min-height: 2rem; }}
			body.arte-mobile-theme .study-content {{
				grid-auto-rows: 42px;
				border-color: rgba(142, 244, 255, 0.46);
				border-radius: 14px;
				padding: 6px;
				gap: 6px;
				background: rgba(3, 8, 19, 0.46);
			}}
			body.arte-mobile-theme .study-section {{
				border-radius: 10px;
				border-color: rgba(142, 244, 255, 0.52);
				box-shadow: inset 0 0 0 1px rgba(142, 244, 255, 0.08);
			}}
			body.arte-mobile-theme .study-section.is-open {{
				border-color: rgba(142, 244, 255, 0.66);
				box-shadow: inset 0 0 0 1px rgba(142, 244, 255, 0.2), 0 10px 24px rgba(2, 8, 18, 0.5);
			}}
			body.arte-mobile-theme .study-heading {{ margin-bottom: 0.36rem; font-size: clamp(0.95rem, 3.8vw, 1.2rem); }}
			body.arte-mobile-theme .study-teaser {{ margin-bottom: 0.42rem; font-size: 0.8rem; line-height: 1.36; }}
			body.arte-mobile-theme .study-fulltext {{ margin-top: 0.42rem; }}
			body.arte-mobile-theme .study-paragraph {{ margin-bottom: 0.35rem; font-size: 0.86rem; line-height: 1.38; }}
			body.arte-mobile-theme .study-keyword {{
				font-size: 0.54rem;
				padding: 0.14rem 0.28rem;
				border-color: color-mix(in srgb, {arte_accent} 64%, white 22%);
				background: rgba(8, 19, 36, 0.78);
			}}
			body.arte-mobile-theme .study-detail-link {{
				min-height: 2.1rem;
				font-size: 0.62rem;
				letter-spacing: 0.11em;
				padding: 0.45rem 0.68rem;
				border-color: color-mix(in srgb, {arte_secondary} 58%, white 18%);
				background: rgba(5, 13, 28, 0.9);
			}}
			body.arte-mobile-theme .visit-embed-frame {{ min-height: 320px; }}
			body.arte-mobile-theme .study-section[data-tile-kind="visit_card"].is-open.is-expanded .visit-embed-frame {{ min-height: 380px; }}
		}}
		"""

	tile_markup: list[str] = []
	closed_tile_rules: list[str] = []
	open_text_tile_rules: list[str] = []
	expanded_text_tile_rules: list[str] = []
	menu_entries: list[tuple[str, str]] = []
	initial_open_slug = ""
	for index, section in enumerate(explore_sections, start=1):
		title = str(section.get("title", "")).strip() or f"Section {index}"
		slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-") or f"section-{index}"
		node_id = str(section.get("node_id", slug)).strip() or slug
		body = str(section.get("body", "")).strip()
		teaser = str(section.get("teaser", "")).strip()
		default_tile_kind = "glyph" if index == 1 else "text"
		tile_kind = str(section.get("tile_kind", default_tile_kind)).strip().lower()
		if tile_kind not in {"glyph", "text", "visit_card"}:
			tile_kind = "text"
		paragraphs = [paragraph.strip() for paragraph in body.splitlines() if paragraph.strip()]
		excerpt = teaser or (paragraphs[0] if paragraphs else "")
		raw_keywords = section.get("keywords")
		keywords: list[str] = []
		if isinstance(raw_keywords, list):
			keywords = [str(item).strip() for item in raw_keywords if str(item).strip()]
		elif isinstance(raw_keywords, str):
			keywords = [item.strip() for item in raw_keywords.split(",") if item.strip()]
		raw_neighbors = section.get("neighbors")
		neighbors: list[str] = []
		if isinstance(raw_neighbors, list):
			neighbors = [str(item).strip() for item in raw_neighbors if str(item).strip()]
		elif isinstance(raw_neighbors, str):
			neighbors = [item.strip() for item in raw_neighbors.split(",") if item.strip()]
		keywords_csv = ",".join(keywords)
		neighbors_csv = ",".join(neighbors)
		search_text = " ".join([title, excerpt, " ".join(paragraphs), " ".join(keywords)]).strip().lower()
		keyword_scales = [1.38, 1.12, 0.98, 0.9, 0.82, 0.76]
		keyword_markup = ""
		if tile_kind == "text" and keywords:
			keyword_markup = (
				'<div class="study-keywords" aria-label="Section keywords">'
				+ "".join(
					f'<span class="study-keyword" style="--keyword-scale:{keyword_scales[min(i, len(keyword_scales) - 1)]};">{html.escape(keyword)}</span>'
					for i, keyword in enumerate(keywords[:6])
				)
				+ '</div>'
			)
		paragraph_markup = "\n".join(
			f'\t\t\t\t<p class="study-paragraph">{html.escape(paragraph)}</p>' for paragraph in paragraphs
		)
		detail_href = str(section.get("detail_href", "")).strip()
		detail_label = str(section.get("detail_label", "Open page")).strip() or "Open page"
		detail_link_markup = ""
		if detail_href and tile_kind == "text":
			detail_link_markup = (
				f'\t\t<a class="study-detail-link" href="{html.escape(detail_href)}">{html.escape(detail_label)}</a>\n'
			)
		raw_glyph_svg = str(section.get("glyph_svg", "")).strip()
		glyph_markup = raw_glyph_svg if raw_glyph_svg else _fallback_glyph_svg(title)
		open_markup = (
			f'<div class="tile-open-state">\n'
			f'\t\t\t\t<div class="tile-open-head">\n'
			f'\t\t\t\t\t<div class="tile-open-copy">\n'
			f'\t\t\t\t\t\t<h2 class="study-heading">{html.escape(title)}</h2>\n'
			f'\t\t\t\t\t\t<p class="study-teaser">{html.escape(excerpt)}</p>\n'
			f'{keyword_markup}\n'
			f'\t\t\t\t\t</div>\n'
			f'{detail_link_markup}'
			f'\t\t\t\t</div>\n'
			f'\t\t\t\t<div class="study-fulltext" id="detail-{html.escape(slug)}">\n'
			f'{paragraph_markup}\n'
			f'\t\t\t\t</div>\n'
			f'\t\t\t</div>'
		)
		interactive_mesh_markup = (
			'<div class="tile-hi-grid" aria-hidden="true">'
			'<span class="tile-hi-line h1"></span><span class="tile-hi-line h2"></span><span class="tile-hi-line h3"></span>'
			'<span class="tile-hi-line v1"></span><span class="tile-hi-line v2"></span><span class="tile-hi-line d1"></span>'
			'<span class="tile-hi-node n1"></span><span class="tile-hi-node n2"></span><span class="tile-hi-node n3"></span><span class="tile-hi-node n4"></span>'
			'</div>'
		)
		collapsed_indicator_markup = ""
		if tile_kind == "glyph":
			open_markup = (
				'<div class="tile-open-state tile-open-state-glyph">\n'
				f'\t\t\t\t<div class="glyph-surface" aria-label="{html.escape(title)} glyph">{glyph_markup}</div>\n'
				'</div>'
			)
		extra_section_attrs = ""
		if tile_kind == "visit_card":
			visit_src = str(section.get("visit_src") or section.get("visit_game_href") or "../pages/contact.html").strip() or "../pages/contact.html"
			defer_visit = bool(section.get("defer_embed_until_visible", False))
			collapsed_indicator = str(section.get("collapsed_indicator", "none")).strip().lower()
			knob_enabled = collapsed_indicator in {"rotating_knob", "knob", "rotating-knob"}
			mesh_enabled = collapsed_indicator in {"mesh", "net", "wire", "wireframe"}
			iframe_src_attr = f'data-src="{html.escape(visit_src)}"' if defer_visit else f'src="{html.escape(visit_src)}"'
			knob_markup = ''
			if knob_enabled:
				knob_markup = '<div class="visit-knob" aria-hidden="true"><span class="visit-knob-core"><span class="visit-knob-spoke s1"></span><span class="visit-knob-spoke s2"></span><span class="visit-knob-spoke s3"></span></span></div>\n'
			mesh_markup = ''
			if mesh_enabled:
				mesh_markup = (
					'<div class="visit-mesh" aria-hidden="true">'
					'<span class="visit-mesh-line l1"></span><span class="visit-mesh-line l2"></span><span class="visit-mesh-line l3"></span>'
					'<span class="visit-mesh-line l4"></span><span class="visit-mesh-line l5"></span>'
					'<span class="visit-mesh-node n1"></span><span class="visit-mesh-node n2"></span><span class="visit-mesh-node n3"></span><span class="visit-mesh-node n4"></span>'
					'</div>\n'
				)
			collapsed_indicator_markup = knob_markup + mesh_markup
			extra_section_attrs = f' data-visit-defer="{"true" if defer_visit else "false"}" data-visit-knob="{"true" if knob_enabled else "false"}" data-visit-mesh="{"true" if mesh_enabled else "false"}"'
			open_markup = (
				'<div class="tile-open-state tile-open-state-visit-card">\n'
							f'\t\t\t\t<iframe class="visit-embed-frame" {iframe_src_attr} title="Contact Game" loading="lazy" allow="fullscreen" allowfullscreen></iframe>\n'
				'</div>'
			)
		is_initially_open = False
		if is_initially_open:
			initial_open_slug = slug
		initial_state_class = "is-open" if is_initially_open else "is-collapsed"
		initial_expanded = "true" if is_initially_open else "false"
		tile_variant = (index - 1) % 8 + 1
		closed_span = as_dict(section.get("closed_span"))
		open_span = as_dict(section.get("open_span"))
		expanded_span = as_dict(section.get("expanded_span"))
		closed_cols = _safe_span(closed_span.get("cols"), 2)
		closed_rows = _safe_span(closed_span.get("rows"), 2)
		open_cols = _safe_span(open_span.get("cols"), 6)
		open_rows = _safe_span(open_span.get("rows"), 5)
		expanded_cols = _safe_span(expanded_span.get("cols"), min(12, open_cols + 2))
		expanded_rows = _safe_span(expanded_span.get("rows"), min(12, open_rows + 1))
		closed_gradient = str(section.get("closed_gradient", "")).strip()
		closed_shadow = str(section.get("closed_shadow", "")).strip()
		if not closed_gradient:
			section_color = str(section.get("color", "")).strip()
			if section_color:
				closed_gradient = f"linear-gradient(135deg, {section_color} 0%, rgba(255, 255, 255, 0.24) 100%)"
			else:
				closed_gradient = "linear-gradient(135deg, rgba(53, 231, 255, 0.82) 0%, rgba(255, 63, 209, 0.84) 100%)"
		tile_collapsed_rule = (
			f'.study-section.tile-{tile_variant}.is-collapsed {{ grid-column: span {closed_cols}; grid-row: span {closed_rows}; background: {closed_gradient};'
		)
		if closed_shadow:
			tile_collapsed_rule += f' box-shadow: {closed_shadow};'
		tile_collapsed_rule += ' }'
		closed_tile_rules.append(tile_collapsed_rule)
		open_text_tile_rules.append(
			f'.study-section.tile-{tile_variant}.is-open[data-tile-kind="text"], .study-section.tile-{tile_variant}.is-open[data-tile-kind="visit_card"] {{ grid-column: span {open_cols}; grid-row: span {open_rows}; }}'
		)
		expanded_text_tile_rules.append(
			f'.study-section.tile-{tile_variant}.is-open.is-expanded[data-tile-kind="text"], .study-section.tile-{tile_variant}.is-open.is-expanded[data-tile-kind="visit_card"] {{ grid-column: span {expanded_cols}; grid-row: span {expanded_rows}; z-index: 3; }}'
		)
		trigger_open = f'\t\t<div class="study-trigger" role="button" tabindex="0" aria-expanded="{initial_expanded}" aria-controls="detail-{html.escape(slug)}">\n'
		trigger_close = '\t\t</div>\n'

		tile_markup.append(
			f'<section class="study-section tile-{tile_variant} {initial_state_class}" id="{html.escape(slug)}" data-node-id="{html.escape(node_id)}" data-keywords="{html.escape(keywords_csv)}" data-neighbors="{html.escape(neighbors_csv)}" data-search-text="{html.escape(search_text)}" data-tile-kind="{tile_kind}" data-tile-index="{index}" data-hi-grid="true"{extra_section_attrs}>\n'
			f'{trigger_open}'
			f'\t\t\t{interactive_mesh_markup}\n'
			f'\t\t\t{collapsed_indicator_markup}'
			f'\t\t\t{open_markup}\n'
			f'{trigger_close}'
			f'\t</section>'
		)
		menu_entries.append((f"#{slug}", title))

	closed_tile_rules_css = "\n\t\t".join(closed_tile_rules)
	open_text_tile_rules_css = "\n\t\t".join(open_text_tile_rules)
	expanded_text_tile_rules_css = "\n\t\t".join(expanded_text_tile_rules)

	study_layout_markup = (
		"<main class=\"study-layout\" id=\"explore\">\n"
		"\t<div class=\"study-content\">\n"
		+ "\n".join(f"\t\t{tile}" for tile in tile_markup)
		+ "\n\t</div>\n"
		"</main>"
	)

	menu_links_markup = ""
	for href, label in menu_entries:
		menu_links_markup += f'\n\t\t<a class="corner-menu-link" href="{html.escape(href)}">{html.escape(label)}</a>'
	if cta_text:
		menu_links_markup += f'\n\t\t<a class="corner-menu-link" href="{html.escape(cta_href)}">{html.escape(cta_text)}</a>'
	if not menu_links_markup:
		for index, item in enumerate(nav_top, start=1):
			label = str(item.get("label", "")).strip() or f"Link {index}"
			href = str(item.get("href", "#")).strip() or "#"
			menu_links_markup += f'\n\t\t<a class="corner-menu-link" href="{html.escape(href)}">{html.escape(label)}</a>'

	page_title = str(meta.get("page_title") or hero.get("title") or "Homepage")
	hero_label = str(hero.get("label", ""))
	hero_kicker_markup = f'<div class="{html.escape(hero_kicker_class)}">{html.escape(hero_label)}</div>' if hero_label.strip() else ""
	hero_title = str(hero.get("title", "")).strip()
	hero_title_markup = html.escape(hero_title).replace("í", '<span class="hero-acute" tabindex="0">í</span>').replace("Í", '<span class="hero-acute" tabindex="0">Í</span>')
	hero_subtitle = str(hero.get("subtitle", "")).replace("\n", " ").strip()
	tagline = str(meta.get("tagline", "")).strip()
	hero_slogan_markup = f'<p class="hero-slogan" aria-live="polite">{html.escape(tagline)}</p>'
	font_link = f'  <link rel="stylesheet" href="{font_css_href}" />\n' if font_css_href else ""
	gsap_script_tag = '  <script src="../vendor/gsap/gsap.min.js"></script>\n'

	tile_runtime_script = """<script>
(() => {
	const menuToggle = document.querySelector('.corner-menu-toggle');
	const menuPanel = document.querySelector('.corner-menu-panel');
	if (menuToggle && menuPanel) {
		const closeMenu = () => {
			menuPanel.hidden = true;
			document.body.classList.remove('menu-open');
			menuToggle.setAttribute('aria-expanded', 'false');
		};
		const openMenu = () => {
			menuPanel.hidden = false;
			document.body.classList.add('menu-open');
			menuToggle.setAttribute('aria-expanded', 'true');
		};
		menuToggle.addEventListener('click', (event) => {
			event.preventDefault();
			menuPanel.hidden ? openMenu() : closeMenu();
		});
	}

	const sections = Array.from(document.querySelectorAll('.study-section'));
	const studyContent = document.querySelector('.study-content');
	const graphSearchInput = document.querySelector('#graph-search-input');
	const isTextualTile = (section) => section && (section.dataset.tileKind === 'text' || section.dataset.tileKind === 'visit_card');
	const originalOrder = new Map(sections.map((section, index) => [section, index]));
	const sectionByNode = new Map(
		sections.map((section) => [section.dataset.nodeId || section.id, section])
	);
		const defaultOpenId = __DEFAULT_OPEN_ID__;
		const activeTextSections = new Set();
	let openIsExpanded = false;
	const QR_LIBRARY_URL = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js';
	const CONTACT_QR_PAYLOAD = [
		"BEGIN:VCARD",
		"VERSION:3.0",
		"N:G\u0301lisnig;Rupert;;;",
		"FN:Rupert G\u0301lisnig",
		"ORG:G\u0301Labs / Calyr.ai",
		"TITLE:Founder",
		"EMAIL;TYPE=INTERNET:rupert.tscheliessnig@calyr.ai",
		"URL:https://calyr.ai",
		"END:VCARD",
	].join("\\n");
	let qrLibraryPromise = null;

	const loadQrLibrary = () => {
		if (typeof window.qrcode === 'function') return Promise.resolve();
		if (qrLibraryPromise) return qrLibraryPromise;
		qrLibraryPromise = new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = QR_LIBRARY_URL;
			script.async = true;
			script.onload = () => resolve();
			script.onerror = () => reject(new Error('QR library failed to load'));
			document.head.appendChild(script);
		}).catch((error) => {
			qrLibraryPromise = null;
			throw error;
		});
		return qrLibraryPromise;
	};

	const buildFallbackMatrix = (size = 29) => {
		const matrix = Array.from({ length: size }, () => Array(size).fill(0));
		const paintFinder = (sx, sy) => {
			for (let y = 0; y < 7; y += 1) {
				for (let x = 0; x < 7; x += 1) {
					const border = x === 0 || y === 0 || x === 6 || y === 6;
					const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
					matrix[sy + y][sx + x] = border || core ? 1 : 0;
				}
			}
		};
		paintFinder(1, 1);
		paintFinder(size - 8, 1);
		paintFinder(1, size - 8);
		for (let y = 9; y < size - 1; y += 1) {
			for (let x = 9; x < size - 1; x += 1) {
				matrix[y][x] = ((x * 5 + y * 3 + 11) % 7) < 3 ? 1 : 0;
			}
		}
		return matrix;
	};

	const buildQrMatrix = (payload) => {
		if (typeof window.qrcode !== 'function') return buildFallbackMatrix();
		const qr = window.qrcode(0, 'M');
		qr.addData(payload, 'Byte');
		qr.make();
		const size = qr.getModuleCount();
		const matrix = Array.from({ length: size }, () => Array(size).fill(0));
		for (let row = 0; row < size; row += 1) {
			for (let col = 0; col < size; col += 1) {
				matrix[row][col] = qr.isDark(row, col) ? 1 : 0;
			}
		}
		return matrix;
	};

	const drawMatrixToCanvas = (canvas, matrix, options = {}) => {
		if (!(canvas instanceof HTMLCanvasElement)) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const size = matrix.length || 1;
		const quiet = Number.isFinite(options.quiet) ? Math.max(0, options.quiet) : 4;
		const invert = Boolean(options.invert);
		const width = canvas.width;
		const height = canvas.height;
		const drawSize = Math.min(width, height);
		const module = Math.floor(drawSize / (size + quiet * 2)) || 1;
		const total = module * (size + quiet * 2);
		const offsetX = Math.floor((width - total) / 2);
		const offsetY = Math.floor((height - total) / 2);
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = invert ? '#040814' : '#ffffff';
		ctx.fillRect(0, 0, width, height);
		ctx.fillStyle = invert ? '#ffffff' : '#061630';
		for (let row = 0; row < size; row += 1) {
			for (let col = 0; col < size; col += 1) {
				if (!matrix[row]?.[col]) continue;
				ctx.fillRect(
					offsetX + (col + quiet) * module,
					offsetY + (row + quiet) * module,
					module,
					module,
				);
			}
		}
		ctx.strokeStyle = 'rgba(6, 22, 48, 0.22)';
		ctx.lineWidth = 1;
		ctx.strokeRect(offsetX + 0.5, offsetY + 0.5, total - 1, total - 1);
	};

	const mapRect = (node) => {
		const r = node.getBoundingClientRect();
		return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
	};

	const buildInterfaceMap = () => {
		const hero = document.querySelector('.hero-copy');
		const map = {
			timestamp: Date.now(),
			viewport: { width: window.innerWidth, height: window.innerHeight },
			hero: hero instanceof HTMLElement ? mapRect(hero) : null,
			tiles: sections.map((section) => {
				if (!(section instanceof HTMLElement)) return null;
				return {
					id: section.id,
					tileKind: section.dataset.tileKind || 'unknown',
					state: section.classList.contains('is-open') ? 'open' : 'collapsed',
					expanded: section.classList.contains('is-expanded'),
					rect: mapRect(section),
				};
			}).filter(Boolean),
		};
		window.calyrInterfaceMap = map;
		return map;
	};

	const initVisitGames = () => {
		for (const section of sections) {
			if (!(section instanceof HTMLElement)) continue;
			if (section.dataset.tileKind !== 'visit_card') continue;
			const shouldDefer = section.dataset.visitDefer === 'true';
			const frame = section.querySelector('.visit-embed-frame');
			if (!(frame instanceof HTMLIFrameElement)) continue;

			if (!shouldDefer) {
				section.classList.add('visit-card-visible');
				continue;
			}

			const deferredSrc = frame.dataset.src || frame.getAttribute('src') || '';
			if (deferredSrc) {
				frame.dataset.src = deferredSrc;
				frame.removeAttribute('src');
			}

			let observer = null;
			const activate = () => {
				if (frame.dataset.loaded === 'true') {
					section.classList.add('visit-card-visible');
					return;
				}
				const src = frame.dataset.src || '';
				if (src) {
					frame.setAttribute('src', src);
					frame.dataset.loaded = 'true';
				}
				section.classList.add('visit-card-visible');
				if (observer) {
					observer.disconnect();
					observer = null;
				}
				window.removeEventListener('scroll', checkProximity);
				window.removeEventListener('resize', checkProximity);
			};

			const checkProximity = () => {
				const rect = section.getBoundingClientRect();
				const entersViewport = rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08;
				if (entersViewport) activate();
			};

			if ('IntersectionObserver' in window) {
				observer = new IntersectionObserver((entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							activate();
							break;
						}
					}
				}, { threshold: 0.15, rootMargin: '0px 0px 120px 0px' });
				observer.observe(section);
			}

			window.addEventListener('scroll', checkProximity, { passive: true });
			window.addEventListener('resize', checkProximity, { passive: true });
			requestAnimationFrame(checkProximity);
			window.setTimeout(checkProximity, 220);
			section.addEventListener('pointerenter', activate, { once: true });
			section.addEventListener('focusin', activate, { once: true });
		}
	};

	const updateDensityMode = () => {
		if (!(studyContent instanceof HTMLElement)) return;
		const textTileCount = sections.filter((section) => isTextualTile(section)).length;
		const density = textTileCount >= 16 ? 'dense' : textTileCount >= 10 ? 'compact' : 'normal';
		studyContent.dataset.density = density;
	};

	const restoreSectionOrder = () => {
		if (!(studyContent instanceof HTMLElement)) return;
		const sorted = [...sections].sort((a, b) => (originalOrder.get(a) || 0) - (originalOrder.get(b) || 0));
		for (const section of sorted) {
			section.classList.remove('is-search-muted');
			studyContent.appendChild(section);
		}
	};

	const applyGraphSearch = (rawQuery) => {
		if (!(studyContent instanceof HTMLElement)) return;
		const query = String(rawQuery || '').trim().toLowerCase();
		if (!query) {
			restoreSectionOrder();
			return;
		}
		const tokens = query.split(/\\s+/).filter(Boolean);
		if (!tokens.length) {
			restoreSectionOrder();
			return;
		}

		const baseByNode = new Map();
		for (const section of sections) {
			const nodeId = section.dataset.nodeId || section.id;
			const searchText = (section.dataset.searchText || '').toLowerCase();
			const keywords = (section.dataset.keywords || '').toLowerCase();
			let score = 0;
			for (const token of tokens) {
				if (searchText.includes(token)) score += 2;
				if (keywords.includes(token)) score += 1.5;
				if ((nodeId || '').toLowerCase() === token) score += 3;
			}
			baseByNode.set(nodeId, score);
		}

		const weighted = sections.map((section) => {
			const nodeId = section.dataset.nodeId || section.id;
			const base = baseByNode.get(nodeId) || 0;
			const neighbors = (section.dataset.neighbors || '')
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean);
			const neighborBoost = neighbors.reduce((sum, neighborId) => sum + (baseByNode.get(neighborId) || 0) * 0.35, 0);
			const score = base + neighborBoost;
			section.classList.toggle('is-search-muted', score <= 0);
			return { section, score, order: originalOrder.get(section) || 0 };
		});

		weighted.sort((a, b) => {
			if (b.score !== a.score) return b.score - a.score;
			return a.order - b.order;
		});

		for (const item of weighted) {
			studyContent.appendChild(item.section);
		}
	};

	const setExpanded = (section, expanded, expandedMode = false) => {
		if (!(section instanceof HTMLElement)) return;
		section.classList.toggle('is-open', expanded);
		section.classList.toggle('is-collapsed', !expanded);
		section.classList.toggle('is-expanded', expanded && expandedMode && isTextualTile(section));
		const trigger = section.querySelector('.study-trigger');
		if (trigger instanceof HTMLElement) {
			trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		}
	};

	const enforceMondrianState = () => {
		for (const section of sections) {
			if (!(section instanceof HTMLElement)) continue;
			const isActive = activeTextSections.has(section);
			setExpanded(section, isActive, false);
		}
		if (studyContent instanceof HTMLElement) {
			studyContent.classList.toggle('has-open-tile', activeTextSections.size > 0);
		}
		document.querySelectorAll('.corner-menu-link').forEach((link) => {
			if (!(link instanceof HTMLAnchorElement)) return;
			const targetId = (link.getAttribute('href') || '').replace(/^#/, '');
			const targetSection = targetId ? document.getElementById(targetId) : null;
			link.classList.toggle('is-active', Boolean(targetSection && activeTextSections.has(targetSection)));
		});
		buildInterfaceMap();
	};

	const activateById = (id) => {
		if (!id) return;
		const target = document.getElementById(id);
		if (!(target instanceof HTMLElement) || !target.classList.contains('study-section')) return;
		activeTextSections.clear();
		activeTextSections.add(target);
		enforceMondrianState();
	};

	updateDensityMode();
	initVisitGames();
	restoreSectionOrder();
	if (defaultOpenId) {
		const defaultSection = document.getElementById(defaultOpenId);
		if (defaultSection instanceof HTMLElement) {
			activeTextSections.add(defaultSection);
		}
	}
	enforceMondrianState();
	if (graphSearchInput instanceof HTMLInputElement) {
		graphSearchInput.addEventListener('input', () => {
			applyGraphSearch(graphSearchInput.value);
		});
	}

	if (studyContent instanceof HTMLElement) {
		for (const section of sections) {
			if (!(section instanceof HTMLElement)) continue;
			if (section.dataset.hiGrid !== 'true') continue;

			const setMeshVars = (clientX, clientY) => {
				const rect = section.getBoundingClientRect();
				if (!rect.width || !rect.height) return;
				const px = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
				const py = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
				const cx = px - 0.5;
				const cy = py - 0.5;
				const energy = Math.max(0, 1 - Math.min(1, Math.hypot(cx, cy) * 1.6));
				section.style.setProperty('--mesh-x', px.toFixed(3));
				section.style.setProperty('--mesh-y', py.toFixed(3));
				section.style.setProperty('--mesh-energy', energy.toFixed(3));
			};

			section.style.setProperty('--mesh-x', '0.5');
			section.style.setProperty('--mesh-y', '0.5');
			section.style.setProperty('--mesh-energy', '0.2');

			section.addEventListener('pointermove', (event) => {
				setMeshVars(event.clientX, event.clientY);
			}, { passive: true });

			section.addEventListener('pointerenter', (event) => {
				setMeshVars(event.clientX, event.clientY);
			}, { passive: true });

			section.addEventListener('pointerleave', () => {
				section.style.setProperty('--mesh-x', '0.5');
				section.style.setProperty('--mesh-y', '0.5');
				section.style.setProperty('--mesh-energy', '0.2');
			}, { passive: true });
		}

		studyContent.addEventListener('click', (event) => {
			const target = event.target;
			if (!(target instanceof Element)) return;
			if (target.closest('a')) return;
			const trigger = target.closest('.study-trigger');
			if (!(trigger instanceof HTMLElement)) return;
			const section = trigger.closest('.study-section');
			if (!(section instanceof HTMLElement)) return;
			const wasActive = activeTextSections.has(section);
			activeTextSections.clear();
			if (!wasActive) {
				activeTextSections.add(section);
			}
			enforceMondrianState();
		});

		studyContent.addEventListener('keydown', (event) => {
			if (event.key !== 'Enter' && event.key !== ' ') return;
			const target = event.target;
			if (!(target instanceof Element)) return;
			const trigger = target.closest('.study-trigger');
			if (!(trigger instanceof HTMLElement)) return;
			event.preventDefault();
			const section = trigger.closest('.study-section');
			if (!(section instanceof HTMLElement)) return;
			const wasActive = activeTextSections.has(section);
			activeTextSections.clear();
			if (!wasActive) {
				activeTextSections.add(section);
			}
			enforceMondrianState();
		});
	}

	document.querySelectorAll('.corner-menu-link[href^="#"]').forEach((link) => {
		if (!(link instanceof HTMLAnchorElement)) return;
		link.addEventListener('click', (event) => {
			event.preventDefault();
			const targetId = link.getAttribute('href')?.replace(/^#/, '') || '';
			activateById(targetId);
			if (targetId) history.replaceState(null, '', `#${targetId}`);
		});
	});

	if (window.location.hash) {
		activateById(window.location.hash.replace(/^#/, ''));
	}

	window.addEventListener('resize', () => {
		buildInterfaceMap();
	});

	window.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			if (activeTextSections.size) {
				activeTextSections.clear();
				enforceMondrianState();
			}
		}
	});

	window.addEventListener('hashchange', () => {
		activateById(window.location.hash.replace(/^#/, ''));
	});

})();
</script>""".replace("__DEFAULT_OPEN_ID__", json.dumps(initial_open_slug, ensure_ascii=True))

	body_class_attr = ' class="arte-mobile-theme"' if arte_mobile_enabled else ""

	return f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
	<meta charset=\"UTF-8\" />
	<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
	<title>{html.escape(page_title)}</title>
{font_link}{gsap_script_tag}  <style>
		:root {{
			--bg: #0b0b0b;
			--fg: #ffffff;
			--frame-width: min(100% - 48px, 1280px);
			--frame-gutter: max(24px, calc((100vw - var(--frame-width)) / 2));
		}}
		* {{ box-sizing: border-box; }}
		body {{ margin: 0; background: var(--bg); color: var(--fg); font-family: "Avenir Next", "Segoe UI", Arial, sans-serif; }}
		.layout-grid {{ position: fixed; inset: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; opacity: 0.9; }}
		.hero {{ position: relative; z-index: 2; padding: 2.8rem 0 0.6rem; }}
		.hero-copy {{ width: var(--frame-width); margin: 0 auto; padding: 24px; border: 1px solid rgba(255,255,255,0.84); background: rgba(8,12,24,0.56); }}
		.hero-title {{ margin: 0; font-size: clamp(2rem, 4.2vw, 3.8rem); }}
		.hero-subtitle {{ margin-top: 1rem; margin-bottom: 0; max-width: 900px; line-height: 1.6; }}
		.hero-acute {{ color: #ff4df5; }}
		.hero-slogan {{ margin: 0.85rem 0 0; font-size: 0.9rem; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.88; }}
		.corner-menu-toggle {{ position: fixed; top: 26px; right: var(--frame-gutter); width: 72px; height: 54px; border: 1px solid rgba(255,255,255,0.9); background: transparent; z-index: 20; }}
		.corner-menu-line {{ display: block; width: 30px; height: 1px; margin: 6px auto; background: #fff; }}
		.corner-menu-panel {{ position: fixed; top: 72px; right: var(--frame-gutter); min-width: 260px; max-height: min(72vh, 640px); overflow: auto; padding: 14px; background: rgba(8,8,8,0.98); border: 1px solid rgba(255,255,255,0.26); z-index: 25; }}
		.corner-menu-panel[hidden] {{ display: none; }}
		.corner-menu-link {{ display: block; color: #fff; text-decoration: none; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.42rem 0; border-bottom: 1px solid rgba(255,255,255,0.18); }}
		.corner-menu-link.is-active {{ color: #7ff3ff; border-bottom-color: rgba(127, 243, 255, 0.96); }}
		.study-layout {{ position: relative; z-index: 2; width: var(--frame-width); margin: 0 auto; padding: 0.4rem 0 3.6rem; max-height: min(78vh, 980px); overflow: auto; overscroll-behavior: contain; }}
		.study-graph-toolbar {{ display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.7rem; align-items: center; border: 1px solid rgba(255,255,255,0.52); border-bottom: 0; padding: 0.52rem 0.7rem; background: rgba(7, 14, 28, 0.72); }}
		.study-graph-label {{ margin: 0; text-transform: uppercase; letter-spacing: 0.13em; font-size: 0.68rem; color: rgba(255,255,255,0.86); }}
		.study-graph-input {{ width: 100%; border: 1px solid rgba(255,255,255,0.38); background: rgba(2, 6, 15, 0.85); color: #fff; padding: 0.52rem 0.65rem; font-size: 0.86rem; }}
		.study-graph-input:focus {{ outline: none; border-color: rgba(255,255,255,0.8); }}
		.study-content {{ display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); grid-auto-rows: 54px; grid-auto-flow: dense; align-content: start; gap: 6px; border: 1px solid rgba(255,255,255,0.84); padding: 8px; min-height: 520px; max-height: min(72vh, 900px); overflow: auto; overscroll-behavior: contain; }}
		.study-section {{ position: relative; border: 1px solid rgba(255,255,255,0.64); background: transparent; overflow: hidden; transition: transform 240ms ease, box-shadow 240ms ease, flex-basis 240ms ease, width 240ms ease, min-height 240ms ease, background 240ms ease, border-color 240ms ease, opacity 200ms ease, filter 200ms ease; }}
		.study-section.is-search-muted {{ opacity: 0.58; filter: saturate(0.65); }}
		.study-trigger {{ width: 100%; height: 100%; border: 0; background: transparent; padding: 0; color: #fff; cursor: pointer; position: relative; display: block; }}
		.study-section[data-hi-grid="true"] .tile-hi-grid {{
			position: absolute;
			inset: 6px;
			opacity: calc(0.34 + var(--mesh-energy, 0.2) * 0.62);
			transform: perspective(420px) rotateX(calc((0.5 - var(--mesh-y, 0.5)) * 8deg)) rotateY(calc((var(--mesh-x, 0.5) - 0.5) * 10deg));
			transition: opacity 180ms ease, transform 180ms ease;
			pointer-events: none;
		}}
		.study-section[data-hi-grid="true"] .tile-hi-line {{ position: absolute; background: rgba(226, 246, 255, 0.72); box-shadow: 0 0 10px rgba(142, 224, 255, 0.28); }}
		.study-section[data-hi-grid="true"] .tile-hi-line.h1 {{ left: 5%; top: 20%; width: 90%; height: 1px; }}
		.study-section[data-hi-grid="true"] .tile-hi-line.h2 {{ left: 8%; top: 50%; width: 84%; height: 1px; }}
		.study-section[data-hi-grid="true"] .tile-hi-line.h3 {{ left: 10%; top: 80%; width: 80%; height: 1px; }}
		.study-section[data-hi-grid="true"] .tile-hi-line.v1 {{ left: 30%; top: 8%; width: 1px; height: 84%; }}
		.study-section[data-hi-grid="true"] .tile-hi-line.v2 {{ left: 68%; top: 10%; width: 1px; height: 80%; }}
		.study-section[data-hi-grid="true"] .tile-hi-line.d1 {{ left: 16%; top: 18%; width: 72%; height: 1px; transform: rotate(18deg); transform-origin: left center; }}
		.study-section[data-hi-grid="true"] .tile-hi-node {{ width: calc(4px + var(--mesh-energy, 0.2) * 2px); height: calc(4px + var(--mesh-energy, 0.2) * 2px); position: absolute; border-radius: 999px; background: rgba(238, 250, 255, 0.95); box-shadow: 0 0 9px rgba(138, 223, 255, 0.55); }}
		.study-section[data-hi-grid="true"] .tile-hi-node.n1 {{ left: 13%; top: 16%; }}
		.study-section[data-hi-grid="true"] .tile-hi-node.n2 {{ left: 73%; top: 24%; }}
		.study-section[data-hi-grid="true"] .tile-hi-node.n3 {{ left: 20%; top: 72%; }}
		.study-section[data-hi-grid="true"] .tile-hi-node.n4 {{ left: 74%; top: 70%; }}
		.study-section.is-collapsed[data-hi-grid="true"] .tile-hi-grid {{ animation: tile-hi-grid-pulse 2.4s ease-in-out infinite; }}
		.study-section.is-open[data-hi-grid="true"] .tile-hi-grid {{ opacity: 0; transform: scale(0.96); animation: none; }}
		@keyframes tile-hi-grid-pulse {{ 0%,100% {{ filter: drop-shadow(0 0 2px rgba(143, 224, 255, 0.18)); }} 50% {{ filter: drop-shadow(0 0 10px rgba(143, 224, 255, 0.42)); }} }}
		.study-detail-link {{ display: inline-flex; align-items: center; justify-content: center; min-height: 2.5rem; padding: 0.55rem 0.9rem; border: 1px solid rgba(255,255,255,0.72); background: rgba(5, 11, 23, 0.92); color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.68rem; white-space: nowrap; }}
		.study-detail-link:hover,
		.study-detail-link:focus-visible {{ border-color: rgba(255,255,255,0.96); background: rgba(12, 22, 40, 0.98); }}
		.tile-open-state {{ display: none; height: 100%; padding: 0.72rem; text-align: left; overflow: hidden; }}
		.tile-open-head {{ display: flex; align-items: flex-start; justify-content: space-between; gap: 0.8rem; }}
		.tile-open-copy {{ min-width: 0; flex: 1 1 auto; }}
		.tile-open-state-glyph {{ display: none; padding: 0; }}
		.glyph-surface {{ width: 100%; height: 100%; display: grid; place-items: center; border: 1px solid rgba(255,255,255,0.28); background: rgba(0,0,0,0.34); }}
		.glyph-surface svg {{ width: min(78%, 280px); height: min(78%, 280px); }}
		.study-heading {{ margin: 0 0 0.48rem; font-size: clamp(1.05rem, 1.8vw, 1.6rem); }}
		.study-teaser {{ margin: 0 0 0.64rem; font-size: 0.94rem; opacity: 0.86; }}
		.study-keywords {{ display: flex; flex-wrap: wrap; gap: 0.36rem 0.48rem; margin: 0 0 0.78rem; align-items: baseline; }}
		.study-keyword {{ display: inline-flex; align-items: center; padding: 0.18rem 0.38rem; border: 1px solid rgba(255,255,255,0.28); background: rgba(0,0,0,0.32); text-transform: uppercase; letter-spacing: 0.12em; line-height: 1; font-size: calc(0.66rem * var(--keyword-scale, 1)); opacity: 0.94; white-space: nowrap; }}
		.study-keyword:nth-child(1) {{ border-width: 1px; }}
		.study-keyword:nth-child(2) {{ opacity: 0.9; }}
		.study-keyword:nth-child(3) {{ opacity: 0.86; }}
		.study-keyword:nth-child(4) {{ opacity: 0.82; }}
		.study-keyword:nth-child(5) {{ opacity: 0.78; }}
		.study-keyword:nth-child(6) {{ opacity: 0.74; }}
		.study-fulltext {{ flex: 1 1 auto; min-height: 0; overflow: auto; padding-right: 0.18rem; margin-top: 0.6rem; }}
		.tile-open-state-visit-card {{ padding: 0; color: #ffffff; overflow: hidden; display: flex; flex-direction: column; min-height: 0; }}
		.visit-embed-frame {{ width: 100%; height: 100%; min-height: 360px; border: 0; background: #050816; display: block; }}
		.study-section[data-visit-defer="true"] .visit-embed-frame {{ opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 220ms ease; }}
		.study-section.visit-card-visible[data-visit-defer="true"] .visit-embed-frame {{ opacity: 1; visibility: visible; pointer-events: auto; }}
		.study-section[data-visit-knob="true"] .visit-knob {{
			position: absolute;
			left: 10px;
			bottom: 10px;
			width: 42px;
			height: 42px;
			border-radius: 999px;
			border: 1.35px solid rgba(214, 242, 255, 0.88);
			background: radial-gradient(circle at 30% 30%, rgba(151, 226, 255, 0.22), rgba(7, 17, 36, 0.76));
			box-shadow: 0 0 12px rgba(143, 224, 255, 0.22), inset 0 0 0 1px rgba(230, 247, 255, 0.16);
			display: grid;
			place-items: center;
			opacity: 0;
			transform: scale(0.9) rotate(0deg);
			transition: opacity 220ms ease, transform 220ms ease;
			pointer-events: none;
		}}
		.study-section[data-visit-knob="true"] .visit-knob-core {{ position: relative; width: 20px; height: 20px; border-radius: 999px; border: 1px solid rgba(228, 246, 255, 0.9); }}
		.study-section[data-visit-knob="true"] .visit-knob-core::before,
		.study-section[data-visit-knob="true"] .visit-knob-core::after {{ content: ''; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); border-radius: 999px; border: 1px solid rgba(228, 246, 255, 0.8); }}
		.study-section[data-visit-knob="true"] .visit-knob-core::before {{ width: 12px; height: 12px; }}
		.study-section[data-visit-knob="true"] .visit-knob-core::after {{ width: 5px; height: 5px; background: rgba(233, 248, 255, 0.92); border: 0; }}
		.study-section[data-visit-knob="true"] .visit-knob-spoke {{ position: absolute; width: 1px; height: 7px; background: rgba(229, 247, 255, 0.9); left: 50%; top: 2px; transform-origin: 50% 18px; }}
		.study-section[data-visit-knob="true"] .visit-knob-spoke.s2 {{ transform: rotate(120deg); }}
		.study-section[data-visit-knob="true"] .visit-knob-spoke.s3 {{ transform: rotate(240deg); }}
		.study-section.is-collapsed[data-visit-knob="true"] .visit-knob {{ opacity: 1; transform: scale(1) rotate(0deg); animation: visit-knob-spin 7s linear infinite; }}
		.study-section.is-collapsed[data-visit-knob="true"] .study-trigger:hover .visit-knob,
		.study-section.is-collapsed[data-visit-knob="true"] .study-trigger:focus-visible .visit-knob {{ animation-duration: 2.2s; }}
		.study-section.is-open[data-visit-knob="true"] .visit-knob {{ opacity: 0; transform: scale(0.9) rotate(180deg); animation: none; }}
		@keyframes visit-knob-spin {{ from {{ transform: scale(1) rotate(0deg); }} to {{ transform: scale(1) rotate(360deg); }} }}
		.study-section[data-visit-mesh="true"] .visit-mesh {{
			position: absolute;
			inset: 8px;
			opacity: 0;
			transform: scale(0.97);
			transition: opacity 220ms ease, transform 220ms ease;
			pointer-events: none;
		}}
		.study-section[data-visit-mesh="true"] .visit-mesh-line {{ position: absolute; height: 1.4px; background: rgba(227, 246, 255, 0.92); transform-origin: left center; box-shadow: 0 0 8px rgba(143, 224, 255, 0.32); }}
		.study-section[data-visit-mesh="true"] .visit-mesh-line.l1 {{ left: 6%; top: 22%; width: 58%; transform: rotate(9deg); }}
		.study-section[data-visit-mesh="true"] .visit-mesh-line.l2 {{ left: 12%; top: 50%; width: 62%; transform: rotate(-7deg); }}
		.study-section[data-visit-mesh="true"] .visit-mesh-line.l3 {{ left: 16%; top: 78%; width: 56%; transform: rotate(8deg); }}
		.study-section[data-visit-mesh="true"] .visit-mesh-line.l4 {{ left: 10%; top: 24%; width: 54%; transform: rotate(55deg); }}
		.study-section[data-visit-mesh="true"] .visit-mesh-line.l5 {{ left: 30%; top: 24%; width: 54%; transform: rotate(121deg); }}
		.study-section[data-visit-mesh="true"] .visit-mesh-node {{ position: absolute; width: 6px; height: 6px; border-radius: 999px; background: rgba(236, 250, 255, 0.98); box-shadow: 0 0 10px rgba(143, 224, 255, 0.62); }}
		.study-section[data-visit-mesh="true"] .visit-mesh-node.n1 {{ left: 8%; top: 20%; }}
		.study-section[data-visit-mesh="true"] .visit-mesh-node.n2 {{ left: 74%; top: 36%; }}
		.study-section[data-visit-mesh="true"] .visit-mesh-node.n3 {{ left: 16%; top: 79%; }}
		.study-section[data-visit-mesh="true"] .visit-mesh-node.n4 {{ left: 70%; top: 72%; }}
		.study-section.is-collapsed[data-visit-mesh="true"] .visit-mesh {{ opacity: 1; transform: scale(1); animation: visit-mesh-pulse 2.2s ease-in-out infinite; }}
		.study-section.is-collapsed[data-visit-mesh="true"] .study-trigger:hover .visit-mesh,
		.study-section.is-collapsed[data-visit-mesh="true"] .study-trigger:focus-visible .visit-mesh {{ animation-duration: 1.3s; }}
		.study-section.is-open[data-visit-mesh="true"] .visit-mesh {{ opacity: 0; transform: scale(0.9); animation: none; }}
		@keyframes visit-mesh-pulse {{ 0%, 100% {{ filter: drop-shadow(0 0 2px rgba(136, 231, 255, 0.24)); }} 50% {{ filter: drop-shadow(0 0 8px rgba(136, 231, 255, 0.5)); }} }}
		.study-section[data-tile-kind="visit_card"].is-open.is-expanded .visit-embed-frame {{ min-height: 460px; }}
		.tile-open-state-visit-card .study-paragraph {{ color: #ffffff; }}
		.study-paragraph {{ margin: 0 0 0.48rem; line-height: 1.54; font-size: 0.98rem; }}
		.study-section.is-collapsed {{ grid-column: span 2; grid-row: span 2; border-color: rgba(255, 255, 255, 0.38); background: linear-gradient(135deg, rgba(53, 231, 255, 0.82) 0%, rgba(255, 63, 209, 0.84) 100%); box-shadow: 0 0 18px rgba(53, 231, 255, 0.18), 0 0 24px rgba(255, 63, 209, 0.16); }}
		{closed_tile_rules_css}
		.study-section.is-collapsed .tile-open-state {{ display: none; }}
		.study-section.is-open {{ grid-column: span 6; grid-row: span 5; min-height: 210px; border-color: rgba(255,255,255,0.18); background: rgba(0,0,0,0.26); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.24); backdrop-filter: blur(6px); }}
		.study-section[data-tile-kind="visit_card"].is-open {{ grid-row: span 6; min-height: 340px; }}
		{open_text_tile_rules_css}
		{expanded_text_tile_rules_css}
		.study-section.is-open .tile-open-state {{ display: flex; flex-direction: column; }}
		.study-section.is-open .study-detail-link {{ display: inline-flex; }}
		.study-section.is-open.is-expanded {{ box-shadow: inset 0 0 0 1px rgba(255,255,255,0.16), 0 14px 36px rgba(0,0,0,0.34); }}
		.study-section[data-tile-kind="visit_card"].is-open.is-expanded {{ grid-row: span 7; min-height: 420px; }}
		.study-content.has-expanded-open .study-section.is-collapsed {{ transform: scale(0.96); opacity: 0.84; filter: saturate(0.85); }}
		.study-content[data-density="compact"] .study-section.is-collapsed {{ grid-column: span 2; grid-row: span 1; }}
		.study-content[data-density="dense"] .study-section.is-collapsed {{ grid-column: span 1; grid-row: span 1; }}
		.study-section[data-tile-kind="glyph"].is-open .tile-open-state-glyph {{ display: grid; }}
		@media (max-width: 940px) {{
			:root {{ --frame-width: min(100% - 36px, 1280px); }}
			.study-layout {{ max-height: min(82vh, 980px); overflow: auto; }}
			.study-content {{ min-height: auto; max-height: min(72vh, 760px); overflow: auto; grid-template-columns: repeat(6, minmax(0, 1fr)); grid-auto-rows: 44px; }}
			.study-section.is-collapsed {{ grid-column: span 2 !important; grid-row: span 2 !important; }}
			.study-section.is-open {{ grid-column: span 6 !important; grid-row: span 5 !important; min-height: 300px; }}
			.study-section[data-tile-kind="visit_card"].is-open {{ grid-row: span 6 !important; min-height: 360px; }}
			.study-section[data-tile-kind="visit_card"].is-open.is-expanded {{ grid-row: span 7 !important; min-height: 420px; }}
		}}
		{arte_mobile_css}
	</style>
</head>
<body{body_class_attr}>
	<svg class=\"layout-grid\" aria-hidden=\"true\"></svg>
	<button class=\"corner-menu-toggle\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"corner-menu-panel\" aria-expanded=\"false\">
		<span class=\"corner-menu-line\"></span>
		<span class=\"corner-menu-line\"></span>
		<span class=\"corner-menu-line\"></span>
	</button>
	<nav class=\"corner-menu-panel\" id=\"corner-menu-panel\" hidden>{menu_links_markup}
	</nav>
	<section class=\"{html.escape(hero_class)}\" data-template=\"{html.escape(template)}\">
		<div class=\"{html.escape(hero_copy_class)}\">
			{hero_kicker_markup}
			<h1 class=\"{html.escape(hero_title_class)}\">{hero_title_markup}</h1>
			<p class=\"{html.escape(hero_subtitle_class)}\">{html.escape(hero_subtitle)}</p>
			{hero_slogan_markup}
		</div>
	</section>
	{study_layout_markup}
	{tile_runtime_script}
	{grid_hover_script}
</body>
</html>
"""